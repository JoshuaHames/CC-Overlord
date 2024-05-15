const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const http = require('http')
const express = require("express");
const path = require("path")
const app = express();
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

//sqlite quarry templets
const sql = 'SELECT * FROM items';
const InsertSql = 'INSERT INTO items(id, display_name, item_icon, item_count, change) VALUES(?,?,?,?,?)';
const ExistSql = 'SELECT 1 as e FROM items WHERE id = ?'
const GetCount = 'SELECT item_count FROM items WHERE id = ?'

//Network Variables
const PostPort = 8081;

const db = new sqlite3.Database('./Create.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
    console.log('Connection Successful')
});

db.run("CREATE TABLE IF NOT EXISTS items(id, display_name, item_icon, item_count, change)")

//Creates a new row in the items table
//TODO: Flesh out addRow to include reff to an icon and reformatted display_name
function addRow(id, display_name, image_path, count) {
    db.run(InsertSql, [id, display_name, image_path, count, "'same'"], (err) => {
        if (err) return console.error(err.message)

        console.log('New row created for: ' + id)
    });
}

//Updates the count of the row with the specified id
function UpdateItemCount(id, count, change) {
    db.run("UPDATE items SET item_count = " + count + " WHERE id = " + "'" + id + "'"), (err) =>{
        console.log(err.message)
    }
    db.run("UPDATE items SET change = " + change + " WHERE id = " + "'" + id + "'"), (err) =>{
        console.log(err.message)
    }
}

function getImagePath(mod, checkfile, backupImagePath) {
    const checkpath = "public/assets/"+ mod +"/textures/item/" + checkfile
    console.log(checkpath)
    if (fs.existsSync(checkpath)) {
        return "/assets/"+ mod +"/textures/item/" + checkfile;
    } else {
        return backupImagePath;
    }
}

function FindIcon(mod, id){
    const checkfile =  id + ".png"
    const backupImagePath = "/assets/missing.png"
    const path = getImagePath(mod, checkfile, backupImagePath)
    console.log(path)
    return path
}

//Checks if an incoming id already exists in the items table
//Updates the existing row if one exists, creates a new one if one does not
function CheckAndUpdateItemDB(mod, id, displayName, count){

    db.all(GetCount, [id], (err,data) => {
        if(err) return console.error(err);

        if (data[0] == undefined){
            let iconPath = FindIcon(mod, id)

            addRow(id, displayName, iconPath, count)
            
            io.emit("AddItem")

        } else if (data[0] !== undefined) {

            UpdateItemCount(id, count, "'same'")

        } 
    });
}

//Loops through the entire items table and prints id and count, used for debugging
function listDB() {
    db.all(sql, [], (err,rows) =>{
        if (err) return console.error(err.message)
        rows.forEach(row => {
            console.log(row.id + " " + row.item_count);
        })
    })
}

function getItems() {
    db.all(sql, [], (err,rows) =>{
        if (err) return console.error(err.message)
        return rows;
    })
}


//Creates a listen server that proccesses incoming POST requests on port 8081
http.createServer(function (req, res) {
    var qs = require('querystring');

    if (req.method == 'POST'){
        let body = '';
        
        //Receive the body data from the POST
        req.on('data', function(data){
            body += data;
            //Add check for post data being do large
        });

        //Proccess it when finished receiving
        req.on('end', function() {

            console.log("Received Post")
            
            //Incoming POST body is formatted to include all items in a single update
            //Split the incoming string up to obtain information about items and counts

            let textList = body.split("|")
            textList.shift(); //A quirk from formatting leaves an empty item in index 0, remove it.
            
            textList.forEach((item) => {
                let itemProperties = item.split("-")

                let mod = itemProperties[0].split(":")[0];
                let id = itemProperties[0].split(":")[1]; 
                let displayName = itemProperties[1];
                let count = itemProperties[2];
                let change = itemProperties[3];
                
                CheckAndUpdateItemDB(mod, id, displayName, count);

                io.emit("UpdateItem", {itemName: id, itemCount: count, change: change})
            });

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Post received');
            //listDB();
        });
    }
}).listen(PostPort);


//HTML Rendering - To me moved to different file?

app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

db.all(sql, [], (err,rows) =>{
    if (err) return console.error(err.message)
    return rows;
})

app.get('/getinv',(req, res) => {
    db.all(sql, [], (err,rows) =>{
        if (err) return console.error(err.message)

        const data = {
            items: rows,
        };
        res.render('pages/items', data);
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });

io.on('connection', (socket) => {
    console.log("A User Has Connected")
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
