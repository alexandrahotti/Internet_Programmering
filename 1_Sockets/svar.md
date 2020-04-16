# Frågor och svar

1. Vad är skillnaden mellan GET och POST:

answer

GET: Get metoden används för att fråga efter en specifik resurs. Således så hämtar den enbart data och därför undviker man att exempelvis råka modifera en resurs.

POST: POST metoden används för att skicka en request metod till en webserver om att ta emot data. Dvs för att skicka data till servern.

GET vs POST:
GET har en bergänsing vad gäller data längden på 2048 charcters, vilket inte POST har. Även parametrarna i en GET metod är limiterade till hur mcyket man får plats i en URL. MAN kan enbart skcika ascii karaktärer i en GET. POST har inga begränsingar här och man kan även skicka binära karaktärer. 

2. Nämn de andra 3 mest använda HTTP metoderna.
  
  answer
  PUT - används för att uppdatera eller ersätta data, detta med hela dokument
  PATCH - används för att modifiera en existerande resurs
  DELETE - används för att radera data
  HEAD - requesta enbart headern hos en resurs

3. Vad är REST? Vad ställer det för krav på HTTP-metoderna? 

answer
Vad är REST?
REST är en arkitekturstil eller ett designmönster som vanligtvis används för API:er. REST står för: REpresentational State Transfer. Vilket innebär att då en klient efterfrågar en resurs så får den tillgång till en representation av den efterfrågade resursens state. 

En “RESTful” web-applikation tillåter klienten att få information om resurser. Dessutom tillåter den klienten att skapa nya och förändra befintliga resurser.

För att en API ska vara just ”RESTful” så finns det 6 krav som den måste uppfylla:
•	Uniform interface
•	Client — server separation
•	Stateless
•	Layered system
•	Cacheable
•	Code-on-demand

Vad ställer det för krav på HTTP-metoderna? 

Alla resurser har ett gemensamt gränssnitt som gör att man ej behöver känna till implementationen i bakgrunden.
Varje resurs är unikt adresserbar enligt en gemensam standard URI.


