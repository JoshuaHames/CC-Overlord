# CC-Overlord
Computercraft Create Overlord

## Requirements

The only requirement for this project is CC: Tweaked, however, it was designed with Create in mind with using Applied Energetics and Create: Applied Kinetics

- **CC:Tweaked** (_required_) - https://www.curseforge.com/minecraft/mc-mods/cc-tweaked
- **AE2** (_recommended_) - https://www.curseforge.com/minecraft/mc-mods/applied-energistics-2
- **Create** (_recommended_) - https://www.curseforge.com/minecraft/mc-mods/create
- **Create: Applied Kinetics** (_recommended_) - https://www.curseforge.com/minecraft/mc-mods/create-applied-kinetics

## Summary

This project hosts a javascript server and SQLite database which receives HTTP POST requests from a ComputerCraft computer. The CC Computer wraps an inventory and updates the server with the id, count, display name, and update type of items in the inventory. The first time the program is ran, it will send a POST including everything in the inventory, after which it will only send POSTs of updated items. Once received by the server, it parses the information and updates a the database. By browsing to the listening port in a web browser, a client is served a display of the current items in the inventory, the items animate when increasing or decreasing. The server makes use of websockets, only sending updates the client when items are updated rather than updating the whole page allowing for much faster response times. More features such as historical graphs, item production rates, and more are planned.

The CC Computer can also operate in "Cluster Mode", several different CC Computers can distribute the load of scanning, updating and sending POSTs, this is espically useful when monitoring large iventories like that of a drawer controller or AE system.. There is also nothing preventing a user from wrapping several different inventories to different computers to monitor them all in one place. 

In theory, any valid inventory can be wrapped and monitored. However, for maximum utility I recommend using AE2 to store all your items wrapping the "ME Proxy" block from _Create: Kinetics_. This block acts as an inventory which contains all the AE system's items. Unfortuantly, this item used to be provided by a different mod that is no longer updated so the addition of create is a requirement for this to work.

## Setup
I will not be writing a setup guide at this time because the project is still quite early in devlopment, I am not a trained web devloper and this is my first time learning many of these concepts. The project is likley to change dramatically so any sort of setup instructions I give will quickly become out of date. 

Once the projects reachs a form that I'm reasonable confident will remain for some time, I will detail the setup instructions here. 
