# Lab 1 - HTTP, Sockets & Cookies
## Description
I den här labben ska ni ska implementera ett HTTP-baserat gissningsspel i Java eller Python,
baserat på vanliga sockets. Använd Javas ServerSockets eller Pythons socket.

Syftet med denna labb är att förstå hur HTTP-kommunikation ser ut
och hur den hanteras. 

Spelaren ska gissa ett nummer mellan 1 och 100 och servern ska därpå
hålla koll på hur det går för spelaren. 

Den svåra biten i den här labben är hur servern ska hålla
koll på flera användare simultant. Servern kommer ihåg användaren genom att spara ett SESSION-ID i en kaka.

## Game Flow

### Welcome Screen
<p float="left" align='center'>  
  <img src='https://github.com/alexandrahotti/Internet_Programmering/blob/master/1_Sockets/results/1_welcome.png' width="40%" height="40%"
 /> 
  
 ### Wrong Guess
  <p float="left" align='center'>  
  <img src='https://github.com/alexandrahotti/Internet_Programmering/blob/master/1_Sockets/results/2_guess_wrong.png' width="47%" height="47%"
 /> 
  
   ### You Won!
   <p float="left" align='center'> 
  <img src='https://github.com/alexandrahotti/Internet_Programmering/blob/master/1_Sockets/results/5_won.png' width="65%" height="65%"
 />
