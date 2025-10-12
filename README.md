# Child Health Record Booklet : Growth Guardian
### *Team name: Runtime Graphene*
# Step by Step Instructions for Installing Project


#### 1.	Clone or Download the Repository
Clone the repository or copy the project-folder to your local machine.

git clone https://github.com/devsa4/-Child-Health-Record-Booklet.git

#### 2.	Install Frontend Dependencies

Open a terminal in the project-folder and run:

```bash
npm install
```

#### 3.	Install Backend Dependencies

Navigate to the backend folder:

```bash
cd backend npm install
```


#### 4.	Set Up Environment Variables

Create a .env file in the backend folder with your MongoDB connection string and JWT secret.

```bash
MONGO_URI=mongodb+srv://runtime:runtime@cluster0.qu6kyoi.mongodb.net/reactdb
JWT_SECRET=growthboi
```

#### 5.	Start the Backend Server

Navigate to the backend folder:

```bash
cd backend node server.js
```

#### 6.	Start the Frontend App

Open a new terminal in the root project-folder and run:

```bash
npm start
```

This will start the React frontend on port 3000.
 
#### 7.	Access the App

•	Frontend: http://localhost:3000
•	Backend API: http://localhost:5000

#### 8.	Set Up MongoDB with MongoDB Compass

•	Log in MongoDB Atlas using

*email : runtimegraphene@gmail.com* 

*password*: ****(provided in the submission mail)*

•	Download MongoDB Compass.
•	Connect to Our Database by following these:
1.	Open MongoDB Compass.
2.	In the "New Connection" dialog, paste your connection string from:
mongodb+srv://runtime:runtime@cluster0.qu6kyoi.mongodb.net/
3.	Click "Connect".
•	Verify Connection:
You should see our database (reactdb) and its collections. You can use Compass to view, edit, or add data as needed.
