
const CrossDB = require('../index');

const db = new CrossDB(':memory:');

try {
    // Create Table
    db.exec("CREATE TABLE IF NOT EXISTS student (id INT PRIMARY KEY, name CHAR(16), age INT, class CHAR(16), score FLOAT, info VARCHAR(255))");
    db.exec("CREATE TABLE IF NOT EXISTS teacher (id INT PRIMARY KEY, name CHAR(16), age INT, info CHAR(255), INDEX (name))");
    db.exec("CREATE TABLE IF NOT EXISTS book (id INT PRIMARY KEY, name CHAR(64), author CHAR(32), count INT, INDEX (name))");
    console.log("Tables 'student','teacher' and 'book' created.");
    // clean table
    db.exec("DELETE FROM student");
    db.exec("DELETE FROM teacher");
    db.exec("DELETE FROM book");

    db.begin();
    console.log("Begin transaction");

    // Insert
    db.exec("INSERT INTO student (id,name,age,class,score) VALUES (1,'jack',10,'3-1',90),(2,'tom',11,'2-5',91),(3,'jack',11,'1-6',92),(4,'rose',10,'4-2',90),(5,'tim',10,'3-1',95)");
    db.exec("INSERT INTO student (id,name,age,class,score,info) VALUES (6,'Tony',10,'3-1',95,'%s')", "He is a boy.\nHe likes playing football.\nWe all like him!");
    db.exec("INSERT INTO student (id,name,age,class,score,info) VALUES (7,'Wendy',10,'3-1',95,'%s')", "She is a girl.\nShe likes cooking.\nWe all love her!");
    db.exec("INSERT INTO teacher (id,name,age) VALUES (1,'Tomas',40),(2,'Steven',50),(3,'Bill',31),(4,'Lucy',29)");
    db.exec("INSERT INTO book (id,name,author,count) VALUES (1,'Romeo and Juliet','Shakespeare',10),(2,'Pride and Prejudice','Austen',5),(3,'Great Expectations','Dickens',8),(4,'Sorrows of Young Werther','Von Goethe',4)");
    console.log("Data inserted.");

    // Select
    let res = db.exec("SELECT * FROM student");
    console.log("Select all student: ", res);

    // Update
    db.exec("UPDATE student set age=9 WHERE id = 2");
    console.log("Update age = 9 for student with id = 2");

    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    console.log("Select student with id = 2: ", res);

    db.exec("DELETE FROM student WHERE id = 3");
    console.log("User with ID 3 deleted.");

    res = db.exec("SELECT * from student WHERE id = 3");
    console.log("Select student with id = 3: ", res);

    // Aggregation function
    res = db.exec("SELECT COUNT(*),MIN(score),MAX(score),SUM(score),AVG(score) FROM student");
    console.log("Select student's AGG COUNT,MIN,MAX,SUM,AVG: ", res);

    db.commit();
    console.log("Commit transaction");

    db.begin();
    console.log("Begin transaction");
    // Update
    db.exec("UPDATE student set age=15 WHERE id = 2");
    console.log("Update age = 15 for student with id = 2");
    // Select
    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    console.log("Select student with id = 2: ", res);
    db.rollback();
    console.log("Rollback transaction");
    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    console.log("Select student with id = 2: ", res);

    // Multi-Statements
    res = db.exec("SELECT COUNT(*) as Count FROM student; SELECT id,name FROM student WHERE id=2");
    console.log("Multi Select student: ", res);

} catch (err) {
    console.error("Error during operation:", err);
    db.rollback();
    console.log("Rollback transaction");
} finally {
    console.log("\nCrossDB Simulation Complete.");
    db.close();
    console.log("Database connection closed.");
}
