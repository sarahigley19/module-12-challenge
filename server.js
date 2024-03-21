const inquirer = require('inquirer');
const mysql = require("mysql2");
const logo = require("asciiart-logo");

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: "root",
	password: "sarahhigley",
	database: "employee_tracker_db",
});

connection.connect((err) => {
	if (err) throw err;
	console.log("Connected!");
	employee_tracker_db();
});

const employee_tracker_db = function () {
	const logoText = logo({ name: "Employee Tracker" }).render()
	console.log(logoText);
	inquirer.prompt([{
		type: 'list',
		name: 'prompt',
		message: 'What would you like to do?',
		choices: ['1. View all departments', '2. View all roles', '3. View all employees', '4. Add a department', '5. Add a role', '6. Add an employee', '7. Update an employee role', '8. Log out']
	}]).then((answers) => {

		// 1.View all departments
		if (answers.prompt === '1. View all departments') {
			console.clear(); // Clear the console
			connection.query(`SELECT * FROM department`, (err, result) => {
				if (err) {
					console.error('Error fetching departments:', err);
					return;
				}
				console.log('Viewing all departments: ');
				console.table(result);
				employee_tracker_db();
			});

		// 2. View all roles
		} else if (answers.prompt === '2. View all roles') {
			console.clear(); // Clear the console
			connection.query(`SELECT * FROM role`, (err, result) => {
				if (err) {
					console.error('Error fetching roles:', err);
					return;
				}
				console.log('Viewing all roles: ');
				console.table(result);
				employee_tracker_db();
			});

		//3. View all employees
		} else if (answers.prompt === '3. View all employees') {
			console.clear(); // Clear the console
			connection.query(`SELECT * FROM employee`, (err, result) => {
				if (err) {
					console.error('Error fetching employee:', err);
					return;
				}
				console.log('Viewing all employee: ');
				console.table(result);
				employee_tracker_db();
			});

		//4. Add a department
		} else if (answers.prompt === '4. Add a department') {
			inquirer.prompt([{
				type: 'input',
				name: 'department',
				message: 'What would you like to name the new department?',
				validate: departmentInput => {
					if (departmentInput) {
						return true;
					} else {
						console.log('Please add the name of the new department!');
						return false;
					}
				}
			}]).then((answers) => {
				connection.query(`INSERT INTO department (name) VALUES (?)`, [answers.department], (err, result) => {
					if (err) throw err;
					console.log(`Added ${answers.department} to the database.`)
					employee_tracker_db();
				});
			});

		//5. Add a role
		} else if (answers.prompt === '5. Add a role') {
			connection.query(`SELECT * FROM department`, (err, result) => {
				if (err) {
					console.error('Error adding a role:', err);
					return;
				}

				inquirer.prompt([{
						type: 'input',
						name: 'role',
						message: 'What would you like to name the new role?',
						validate: roleInput => {
							if (roleInput) {
								return true;
							} else {
								console.log('Please add a role!');
								return false;
							}
						}
					},
					{
						type: 'input',
						name: 'salary',
						message: 'What would you like the salary of the new role to be?',
						validate: salaryInput => {
							if (salaryInput) {
								return true;
							} else {
								console.log('Please add a alary!');
								return false;
							}
						}
					},
					{
						type: 'list',
						name: 'department',
						message: 'Which department does the role belong to?',
						choices: () => {
							var array = [];
							for (var i = 0; i < result.length; i++) {
								array.push(result[i].name);
							}
							return array;
						}
					}
				]).then((answers) => {
					for (var i = 0; i < result.length; i++) {
						if (result[i].name === answers.department) {
							var department = result[i];
						}
					}

					connection.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answers.role, answers.salary, department.id], (err, result) => {
						if (err) throw err;
						console.log(`Added ${answers.role} to the database.`)
						employee_tracker_db();
					});
				})
			});
		
		//6. Add an employee
		} else if (answers.prompt === '6. Add an employee') {
			connection.query(`SELECT * FROM employee, role`, (err, result) => {
				if (err) {
					console.error('Error adding employee', err);
					return;
				}

				inquirer.prompt([
					{
						type: 'input',
						name: 'firstName',
						message: 'What is the new employees first name?',
						validate: firstNameInput => {
							if (firstNameInput) {
								return true;
							} else {
								console.log('Please add a first name!');
								return false;
							}
						}
					},
					{
						type: 'input',
						name: 'lastName',
						message: 'What is the new employees last name?',
						validate: lastNameInput => {
							if (lastNameInput) {
								return true;
							} else {
								console.log('Please add a first name!');
								return false;
							}
						}
					},
					{
						type: 'list',
						name: 'role',
						message: 'What is the employees role?',
						choices: () => {
							var array = [];
							for (var i = 0; i < result.length; i++) {
								array.push(result[i].title);
							}
							var newArray = [...new Set(array)];
							return newArray;
						}
					},
					{
						type: 'input',
						name: 'manager',
						message: 'Who is the employee\'s manager?',
						validate: managerInput => {
							if (managerInput) {
								return true;
							} else {
								console.log('Please add a manager!');
								return false;
							}
						}
					}
				]).then((answers) => {
					for (var i = 0; i < result.length; i++) {
						if (result[i].title === answers.role) {
							var role = result[i];
						}
					}

					connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, role.id, answers.manager.id], (err, result) => {
						if (err) throw err;
						console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`)
						employee_tracker_db();
					});
				})
			});

		//7. Update and employee role
		} else if (answers.prompt === '7. Update an employee role') {
			// Calling the database to acquire the roles and managers
			connection.query(`SELECT * FROM employee, role`, (err, result) => {
				if (err) {
					console.error('Error updating employee role:', err);
					return;
				}

				inquirer.prompt([
					{
						type: 'list',
						name: 'employee',
						message: 'Which employees role would you want to update?',
						choices: () => {
							var array = [];
							for (var i = 0; i < result.length; i++) {
								array.push(result[i].last_name);
							}
							var employeeArray = [...new Set(array)];
							return employeeArray;
						}
					},
					{
						type: 'list',
						name: 'role',
						message: 'What is the new role?',
						choices: () => {
							var array = [];
							for (var i = 0; i < result.length; i++) {
								array.push(result[i].title);
							}
							var newArray = [...new Set(array)];
							return newArray;
						}
					}
				]).then((answers) => {
					for (var i = 0; i < result.length; i++) {
						if (result[i].last_name === answers.employee) {
							var name = result[i];
						}
					}

					for (var i = 0; i < result.length; i++) {
						if (result[i].title === answers.role) {
							var role = result[i];
						}
					}

					connection.query(`UPDATE employee SET ? WHERE ?`, [{ role_id: role }, { last_name: name }], (err, result) => {
						if (err) throw err;
						console.log(`Updated ${answers.employee} role to the database.`)
						employee_tracker_db();
					});
				})
			});

		//8. Log out
		} else if (answers.prompt === '8. Log out') {
			connection.end();
			console.log("Good-Bye!");
		}
	});
};


