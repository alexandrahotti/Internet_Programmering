# Frågor och svar

1. Vad är skillnaden mellan == och ===? Vad är “best practice” gällande vilken man ska använda?

  answer

The main difference between "==" and "===" operator is that the former compares variable by making type correction. I.e. if you compare 5
and "5" , == allows that, but === doesn't allow that, because it not only checks the value but also the type of the two variables. If two
variables are not of the same type "===" returns false, while "==" returns true.


2. Vad gör "use strict"?

  answer  
The purpose of "use strict" is to indicate that the code should be executed in a “strict” operating context. This strict context prevents certain actions from being taken and throws more exceptions. By for instance preventing you from using undeclared variables. Writing in strict mode also somewhat requires different syntax for some operations.

Benefits of "use strict":
- It eliminates some silent errors in Java Script by changing them to throw errors.
- Strict mode fixes mistakes that make it difficult for JavaScript engines to perform optimizations: strict mode code can sometimes be made to run faster than identical code that’s not strict mode.
(?)For example: “==” and “!=” will do automatic type conversion if it is needed while “===” and “!==” will not which makes the
operation faster.
- Strict mode prohibits some syntax likely to be defined in future versions of ECMAScript.
- It prevents, or throws errors, when relatively “unsafe” actions are taken (such as gaining access to a global object).

Examples:
1. Using a variable or an object, without declaring them is not allowed:
x = 3.14;
x = {p1:10, p2:20};

2. Deleting a variable (or object) and a function is not allowed

3. Duplicating a parameter name is not allowed
function createObjects(x,x){}

4. Octal numeric literals are not allowed
var x = 010;  

5.Escape characters are not allowed
var x = \010;

6. Use strict does not allow you to compare varibles using "==" or "!=".


####  Bonus

1. Har javascript klasser? Är prototypes klasser? Motivera ditt svar.

  answer
  No. there are no classes in JavaScript. Functions can be used to somewhat simulate classes, but in general JavaScript is a class-less
  language. Everything is an object. And when it comes to inheritance, objects inherit from objects.

Prototypes
When a function is created in JavaScript, JavaScript engines adds a prototype property to it. This property is an object and has a
constructor property by default. Constructor properties points back to the function on which the prototype object is a property. We can
access the function’s property by using the syntax functionName.prototype.

  Example: Using functions and prototypes to simulate classes.Here the prototype property allows you to add a new property to the
  object constructor:
function Person(first, last, age, eyecolor) {
  this.firstName = first;
  this.lastName = last;
  this.age = age;
  this.eyeColor = eyecolor;
}

Person.prototype.nationality = "English";



2. Vad är callbacks i Javascript?

  answer
  A callback is a function that is to be executed after another function has finished executing.

In JavaScript, functions are objects. Therefore, functions can take functions as arguments, and can be returned by other functions.
Functions that do this are called higher-order functions. Any function that is passed as an argument is called a callback function.

So why do we need these callbacks?
JavaScript is an event driven language. This means that instead of waiting for a response before moving on, JavaScript will keep
executing while listening for other events.

Example:
What happens here is that JavaScript does not wait for a response from first() before moving on to execute second(). If one wants them to execute in this order callbacks can be used to make sure that first() is finished before second() is called.

function first(){
  // A code delay to simulate an API request where we have to send the request then wait for a response.
  setTimeout( function(){
    console.log(1);
  }, 500 );
}
function second(){
  console.log(2);
}
first();
second();

output:
2
1

3. Hur används callbacks asynkront?

  answer
 ASYNCHRONICITY
 asynchronous means that things can happen independently of the main program flow. 
In the current consumer computers, every program runs for a specific time slot, and then it stops its execution to let another program continue its execution. This thing runs in a cycle so fast that’s impossible to notice, and we think our computers run many programs simultaneously, but this is an illusion (except on multiprocessor machines).



ASYNCHRONICITY IN JS
JavaScript is synchronous by default, and is single threaded. This means that code cannot create new threads and run in parallel. Thus lines of code are executed in series, one after another.

The main purpose of java script is to wait and respond to user actions like onClick, onMouseOver, onChange, onSubmit and so on. The browser provides a way to do it by providing a set of APIs that can handle this kind of functionality.

Example
Here an event handler is used for the click event. This event handler accepts a function, which will be called when the event is triggered.

document.getElementById('button').addEventListener('click', () => {
  //item clicked
})

This is the so-called callback.
A callback is a simple function that’s passed as a value to another function, and will only be executed when the event happens.
