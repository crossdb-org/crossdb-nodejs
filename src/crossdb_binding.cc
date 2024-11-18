#include <napi.h>
#include <crossdb.h>
#include <string>

class Connection : public Napi::ObjectWrap<Connection>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports)
    {
        Napi::Function func = DefineClass(env, "Connection",
                                          {InstanceMethod("exec", &Connection::Exec),
                                           InstanceMethod("close", &Connection::Close),
                                           InstanceMethod("begin", &Connection::Begin),
                                           InstanceMethod("commit", &Connection::Commit),
                                           InstanceMethod("rollback", &Connection::Rollback)});

        exports.Set("Connection", func);
        return exports;
    }

    Connection(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Connection>(info)
    {
        Napi::Env env = info.Env();
        std::string dbPath = info[0].As<Napi::String>().Utf8Value();

        conn = xdb_open(dbPath.c_str());
        if (conn == nullptr)
        {
            Napi::TypeError::New(env, "Failed to open database").ThrowAsJavaScriptException();
        }
    }

    ~Connection()
    {
        if (conn)
        {
            xdb_close(conn);
        }
    }

private:
    xdb_conn_t *conn;
    xdb_res_t *res;

   Napi::Value Exec(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "SQL query string expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string sql = info[0].As<Napi::String>().Utf8Value();
    res = xdb_exec(conn, sql.c_str());

    if (res == nullptr) {
        Napi::Error::New(env, "Failed to execute SQL command").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (res->errcode != 0) {
        std::string errMsg = xdb_errmsg(res);
        xdb_free_result(res); // Liberare la risorsa
        Napi::Error::New(env, "SQL error " + std::to_string(res->errcode) + ": " + errMsg).ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array result = Napi::Array::New(env);
    int rowIndex = 0;

    // Itera attraverso tutte le righe del risultato
    while (xdb_row_t *row = xdb_fetch_row(res)) {
        Napi::Object rowObj = Napi::Object::New(env);

        // Processa ogni colonna per la riga corrente
        for (int i = 0; i < res->col_count; ++i) {
            xdb_col_t *pCol = xdb_column_meta(res->col_meta, i);
            Napi::Value value;

            switch (pCol->col_type) {
                case XDB_TYPE_INT:
                    value = Napi::Number::New(env, xdb_column_int(static_cast<uint64_t>(res->col_meta), row, static_cast<uint16_t>(i)));
                    break;
                case XDB_TYPE_BIGINT:
                    value = Napi::Number::New(env, xdb_column_int64(static_cast<uint64_t>(res->col_meta), row, static_cast<uint16_t>(i)));
                    break;
                case XDB_TYPE_FLOAT:
                    value = Napi::Number::New(env, xdb_column_float(static_cast<uint64_t>(res->col_meta), row, static_cast<uint16_t>(i)));
                    break;
                case XDB_TYPE_DOUBLE:
                    value = Napi::Number::New(env, xdb_column_double(static_cast<uint64_t>(res->col_meta), row, static_cast<uint16_t>(i)));
                    break;
                case XDB_TYPE_CHAR:
                    value = Napi::String::New(env, xdb_column_str(static_cast<uint64_t>(res->col_meta), row, static_cast<uint16_t>(i)));
                    break;
                default:
                    value = env.Null();
                    break;
            }
            rowObj.Set(Napi::String::New(env, pCol->col_name), value);
        }
        result.Set(rowIndex++, rowObj);
    }

    xdb_free_result(res); // Rilascia il risultato una volta completato
    return result;
}

    void Close(const Napi::CallbackInfo &info)
    {
        if (conn)
        {
            xdb_close(conn);
            conn = nullptr;
        }
    }

    Napi::Value Begin(const Napi::CallbackInfo &info)
    {
        if (xdb_begin(conn) != 0)
        {
            Napi::Error::New(info.Env(), "Failed to begin transaction").ThrowAsJavaScriptException();
        }
        return info.Env().Null();
    }

    Napi::Value Commit(const Napi::CallbackInfo &info)
    {
        if (xdb_commit(conn) != 0)
        {
            Napi::Error::New(info.Env(), "Failed to commit transaction").ThrowAsJavaScriptException();
        }
        return info.Env().Null();
    }

    Napi::Value Rollback(const Napi::CallbackInfo &info)
    {
        if (xdb_rollback(conn) != 0)
        {
            Napi::Error::New(info.Env(), "Failed to rollback transaction").ThrowAsJavaScriptException();
        }
        return info.Env().Null();
    }
};

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    Connection::Init(env, exports);
    return exports;
}

NODE_API_MODULE(crossdb, InitAll)
