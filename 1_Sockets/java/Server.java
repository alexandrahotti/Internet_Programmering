import java.net.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.nio.file.Files;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Scanner;
import java.text.MessageFormat;

public class Server {

    private static int port;
    private static Socket socket = null;
    private static ServerSocket serverSocket = null;

    private static Random rand = new Random();
    private static int session_id=1;


    public static void main(String[] args) throws Exception {
      ConcurrentHashMap<String, ArrayList<String>> min_low_dict = new ConcurrentHashMap<>();
       port = 8989;
       int sessionID= 1; //An ID used to set the cookie
       try {
           serverSocket = new ServerSocket(port);
       } catch (IOException e) {
           System.err.println("Could not listen on port: " + port);
           System.exit(1);
       }
       System.out.println("Listening on port: " + port);

       try {
           while (true) {
              Socket socket = serverSocket.accept();
               new ClientHandler(socket, sessionID, min_low_dict ).start();
               sessionID++;
           }
       } finally {
           serverSocket.close();
       }
   }



   public static class ClientHandler extends Thread {
       private Socket socket;
       private BufferedReader in;
       private PrintWriter out;
       private int sID;
       private String line=null;


       private Integer first=0;

       public static ConcurrentHashMap<String, ArrayList<String>> cookies_min_low;// = new ConcurrentHashMap<>();

       public ClientHandler(Socket socket, int sID, ConcurrentHashMap<String, ArrayList<String>> cookies_ml) {
           this.socket = socket;
           this.sID = sID; // set the cookie value for this user.

           this.cookies_min_low = cookies_ml;
       }



       public String create_cookie(){
         /** Initializes a cookie **/
          String current_session = Integer.toString(session_id);
          ArrayList<String> guess_list = new ArrayList<String>();
          String answer = Integer.toString(rand.nextInt(101));

          guess_list.add("1"); //lowest
          guess_list.add("100"); //Highest
          guess_list.add(answer); //answer
          guess_list.add("0"); //number of guesses
          cookies_min_low.put(current_session, guess_list);

          //Sanity check
          System.err.println(cookies_min_low.get(current_session));

           session_id ++;
           return current_session;
         }

    public String cookieFinder( String line ) throws IOException {
        /** Returns a cookie from a line of text. If the cookie is not present it returns null.
        **/

        String cookiestr = "Cookie: sessionId=\\d*";
        Pattern regex = Pattern.compile(cookiestr);

        String cookie=null;
        Matcher m = regex.matcher(line);

        if (m.find()){
          cookie= m.group(0).split("Cookie: sessionId=")[1];
        }
      return cookie;
    }



    public void generate_start_page(String sessID) throws IOException {
      /** Gets a startpage which welcomes the user.
      **/

      String response_file="welcome.html";
      String file = readFile(response_file, Charset.defaultCharset());
      String cookie_str = MessageFormat.format("Set-Cookie: sessionId={0}",sessID);

      String OUTPUT_HEADERS = "HTTP/1.1 200 OK\r\n" +
      "Content-Type: text/html\r\n" +
      "Content-Length: "+ file.length()+"\r\n" +
      cookie_str;

      String OUTPUT = OUTPUT_HEADERS +"\r\n\r\n";

      out.write(OUTPUT + file);
      out.flush();

    }


    public Boolean match(String line, String matchstring){
      /** Returns true if it finds the string matchstring as part of line.
      **/
      Pattern regex = Pattern.compile(matchstring);
      Matcher m = regex.matcher(line);
      if (m.find()){
        return true;
    }
    return false;
    }

    public String [] read_header(BufferedReader in, Boolean POST) throws IOException{
      /**Wheter the current request is a post or a guess request the function extracts the cookie and the payload.
      **/

      String [] result = {null, null};

      Boolean cond = true;
      String line;
      String session;
      String payL;

      if (POST){
          while(in.ready()){
            line=in.readLine();
            System.err.println(line);

            if ((session = cookieFinder(line)) != null){ //extract the cookie from the HTTP
              System.err.println("found cookie"+session); //sanity check
              result[0] = session;
            }


            if (line.equals("")){
              //Between the headers and the payload there are blankspaces that do not have linebrakes. Therefore we need to use read instead of readline here

              StringBuilder pl = new StringBuilder();
              while(in.ready()){
                pl.append((char)in.read());
              }

             line = pl.toString();
             //Extract the payload
             String guesspattern = "guess=\\d*\\d";
             Pattern regex = Pattern.compile(guesspattern);
             Matcher m = regex.matcher(line);

              if (m.find()){
              String p = m.group(0).split("guess=")[1];
              result[1]=p;
            }
          }
        }
  }else{ //GET request
      while (in.ready()){
        line=in.readLine();
        System.err.println(line);
        if ((session = cookieFinder(line)) != null){
          System.err.println("found cookie"+session); //sanity check
          result[0] = session;
        }
      }

    }
      return result;
    }




    public void run() {
      /**Keeps track of the current request type and based on this reads the headers and extracts the cookie and potential payload.
      **/
        try {
            out = new PrintWriter( socket.getOutputStream(), true);
            in = new BufferedReader( new InputStreamReader(socket.getInputStream()));

            String[] firstLine = in.readLine().split(" ");


            String sessionID;
            String payload;

            if (match(firstLine[0] , "GET") ){
              //Get the cookie from the users potentiallly active session
              String [] data = read_header(in, false);

              if (match(firstLine[1] , "/")){ //Then we know that the request is for the start page
                sessionID = data[0];
                //If the user does not have an active session, create a new cookie
                if ((sessionID)== null){
                    sessionID = create_cookie();
                }
                generate_start_page(sessionID);
              }

            }else if(match(firstLine[0] , "POST")){

              String [] data = read_header(in, true);
              sessionID = data[0];
              payload = data[1];

              run_game(sessionID, payload);

        }}catch (IOException e){
            e.printStackTrace();
        } finally {
            out.close();
            try{
              in.close();
              socket.close();
            }catch(IOException e){
              e.printStackTrace();

            }

        }
      }


      public void run_game(String sessionID, String payload) throws IOException{
        /** The Guess Game
        **/
        ArrayList<String> scores  = cookies_min_low.get(sessionID);

        String old_min = scores.get(0);
        String old_max = scores.get(1);

        int answer = Integer.valueOf(scores.get(2));

        String no_guesses_old = scores.get(3);
        int no_guesses_int = Integer.valueOf(no_guesses_old)+1;

        String no_guesses = Integer.toString(no_guesses_int);

        int guess = Integer.valueOf(payload);

        if ((guess < answer) ){
        String msg = "too low";

            if (guess < Integer.valueOf(old_min)){
              scores.set(0, old_min);
              generate_guess_page(msg, old_min,old_max,no_guesses_old,sessionID);

            }else{
              scores.set(0, Integer.toString(guess));
              scores.set(3, no_guesses);
              generate_guess_page(msg, Integer.toString(guess),old_max,no_guesses,sessionID);
            }

        }else if ((guess > answer) ){
        String msg = "too high";

            if (guess > Integer.valueOf(old_max)){
              scores.set(1, old_max); //
              generate_guess_page(msg, old_min, old_max, no_guesses_old,sessionID);

            }else{
              scores.set(1, Integer.toString(guess));
              scores.set(3, no_guesses);
              generate_guess_page(msg, old_min, Integer.toString(guess), no_guesses,sessionID);
            }


        }else{
          generate_won_page(no_guesses, sessionID);
          cookies_min_low.remove(sessionID);

          //Sanity check
          System.err.println("Keys left");
          for (String key : cookies_min_low.keySet()){
            System.out.print("key: ");
            System.out.println(key);
          }
      }

      }


      public void generate_guess_page(String msg, String min, String max, String no_guesses, String sessionid) throws IOException {
        /** Gets a HTML file where anchors is used to place the min and max values and number of made guesses on the page.
        **/

        String response_file="guess.html";
        String file_tmp = readFile(response_file, Charset.defaultCharset());
        String file = MessageFormat.format(file_tmp,msg,min,max,no_guesses);
        String cookie_str = MessageFormat.format("Set-Cookie: sessionId={0}",sessionid);

        String OUTPUT_HEADERS = "HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Length: "+ file.length()+"\r\n" +
        cookie_str;
        String OUTPUT = OUTPUT_HEADERS +"\r\n\r\n";

        out.write(OUTPUT + file);
        out.flush();

      }


      public void generate_won_page(String no_guesses, String sessionid) throws IOException {
        /** Gets a html page which tells the user that it has won the game in a certain number of guesses.
        **/
        String response_file="you_won.html";
        String file_tmp = readFile(response_file, Charset.defaultCharset());

        String file = file_tmp.replace("{0}",no_guesses);
        //String file = MessageFormat.format(file_tmp, no_guesses);
        String cookie_str = MessageFormat.format("Set-Cookie: sessionId={0}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",sessionid);
        String OUTPUT_HEADERS = "HTTP/1.1 200 OK\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Length: "+ file.length()+"\r\n" +
        cookie_str;
        String OUTPUT = OUTPUT_HEADERS +"\r\n\r\n";

        out.write(OUTPUT + file);
        out.flush();
      }



    static String readFile(String path, Charset encoding)
      throws IOException
    {
      byte[] encoded = Files.readAllBytes(Paths.get(path));
      return new String(encoded, encoding);
    }
  }

}
