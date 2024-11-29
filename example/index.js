// Import the CrossDB module
const CrossDB = require('../index');

// Create an in-memory database instance
const db = new CrossDB(':memory:');

try {
    // Create tables if they do not already exist
    db.exec("CREATE TABLE IF NOT EXISTS student (id INT PRIMARY KEY, name CHAR(16), age INT, class CHAR(16), score FLOAT, info VARCHAR(255))");
    db.exec("CREATE TABLE IF NOT EXISTS teacher (id INT PRIMARY KEY, name CHAR(16), age INT, info CHAR(255), INDEX (name))");
    db.exec("CREATE TABLE IF NOT EXISTS book (id INT PRIMARY KEY, name CHAR(64), author CHAR(32), count INT, INDEX (name))");
    console.log("Tables 'student','teacher' and 'book' created.");

    // Clean (empty) all tables
    db.exec("DELETE FROM student");
    db.exec("DELETE FROM teacher");
    db.exec("DELETE FROM book");

    // Start a transaction
    db.begin();
    console.log("Begin transaction");

    // Insert sample data into the student, teacher, and book tables
    db.exec("INSERT INTO student (id,name,age,class,score) VALUES (1,'jack',10,'3-1',90),(2,'tom',11,'2-5',91),(3,'jack',11,'1-6',92),(4,'rose',10,'4-2',90),(5,'tim',10,'3-1',95)");
    db.exec("INSERT INTO student (id,name,age,class,score,info) VALUES (6,'Tony',10,'3-1',95,'%s')", "He is a boy.\nHe likes playing football.\nWe all like him!");
    db.exec("INSERT INTO student (id,name,age,class,score,info) VALUES (7,'Wendy',10,'3-1',95,'%s')", "She is a girl.\nShe likes cooking.\nWe all love her!");
    db.exec("INSERT INTO teacher (id,name,age) VALUES (1,'Tomas',40),(2,'Steven',50),(3,'Bill',31),(4,'Lucy',29)");
    db.exec("INSERT INTO book (id,name,author,count) VALUES (1,'Romeo and Juliet','Shakespeare',10),(2,'Pride and Prejudice','Austen',5),(3,'Great Expectations','Dickens',8),(4,'Sorrows of Young Werther','Von Goethe',4)");
    console.log("Data inserted.");

    // Query to select all students
    let res = db.exec("SELECT * FROM student");
    res.forEach((element,i) => {
        console.log(i,"Select all students: ", element);
    });

    // Update a student's age and query the updated record
    db.exec("UPDATE student set age=9 WHERE id = 2");
    console.log("Updated age to 9 for student with id = 2");

    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    res.forEach((element,i) => {
        console.log(i,"Select student with id = 2: ", element);
    });

    // Delete a student and query the deleted record
    db.exec("DELETE FROM student WHERE id = 3");
    console.log("Deleted student with id = 3");

    res = db.exec("SELECT * from student WHERE id = 3");
    res.forEach((element,i) => {
        console.log(i,"Select student with id = 3: ", element);
    });

    // Perform aggregation on the student table
    res = db.exec("SELECT COUNT(*),MIN(score),MAX(score),SUM(score),AVG(score) FROM student");
    res.forEach((element,i) => {
        console.log(i,"Student aggregation (COUNT, MIN, MAX, SUM, AVG): ", element);
    });

    // Commit the transaction
    db.commit();
    console.log("Transaction committed");

    // Start a new transaction
    db.begin();
    console.log("Begin transaction");

    // Update a student's age, query, and roll back the transaction
    db.exec("UPDATE student set age=15 WHERE id = 2");
    console.log("Updated age to 15 for student with id = 2");

    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    res.forEach((element,i) => {
        console.log(i,"Select student with id = 2: ", element);
    });

    db.rollback();
    console.log("Transaction rolled back");

    res = db.exec("SELECT id,name,age,class,score from student WHERE id = 2");
    res.forEach((element,i) => {
        console.log(i,"Select student with id = 2 after rollback: ", element);
    });

    // Execute multiple statements and query the results
    res = db.exec("SELECT COUNT(*) as Count FROM student; SELECT id, name, age FROM student WHERE id=2;SELECT MIN(score) as min, MAX(score) as max, SUM(score) as sum, AVG(score) as avg FROM student");
    res.forEach((element,i) => {
        console.log(i,"Multi-statement select: ", element);
    });

} catch (err) {
    // Handle errors, roll back any pending transaction, and log the error
    console.error("Error during operation:", err);
    db.rollback();
    console.log("Transaction rolled back due to error");
} finally {
    // Ensure the database connection is closed
    console.log("\nCrossDB Simulation Complete.");
    db.close();
    console.log("Database connection closed.");
    const version = db.version()
    console.log("CroosDB version: ", version);

}