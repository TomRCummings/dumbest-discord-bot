# dumbest-discord-bot

**Do not use this bot. It will break something, expose something on your system, or lead to massive spam in your Discord.**  
  
This is the dumbest, least practical, and probably most broken bot for Discord. Inspired by Drew DeVault's post about the [stupidest IRC bot](https://drewdevault.com/2021/03/29/The-worlds-dumbest-IRC-bot.html). The main feature of the bot is that it allows users in a Discord server to execute arbitrary JavaScript inside of a persistent environment; which is as dangerous and fun as it sounds.  

JavaScript code can be run with the command ".js" followed by the code to be run. The result is returned in a reply.  

![JavaScript execution example](https://github.com/TomRCummings/dumbest-discord-bot/blob/main/docs/botpic_r1.PNG)

## on(regex, func)
The bot also has a few built-in functions, which make it more ~~of a nuisance~~ useful. The first of those is `on(regex, func)`, which adds the two parameters to an internal array. Every message sent in the server (or channel, depending on how you set up the bot) will be tested against each `regex` regular expression in the array. If matched, the `func` parameter associated with that regular expression will be called.  

!["on" example](https://github.com/TomRCummings/dumbest-discord-bot/blob/main/docs/botpic_r2.PNG)

The function passed as `func` can take as parameters the matches from the regular expression match.

## Accessing things from inside `func`
Calling `msg.reply(string)` inside of a function passed as `func` will cause the text to be sent as a message in that channel. The contents of a message can be accessed in a function passed as `func` using `msg.content` and the user who sent the message can be accessed with `msg.author`.  

## off(id)
When you use `on(regex, func)` the bot returns the unique id for that pair. To remove that pair you can call `off(id)`.

## listenerArr(regexStub)
If you have a lot of listeners on your bot, you can search through them using a regex stub with `listenerArr(regexStub)`. Any matches will be returned with the unique ID and the specific regex.  

![ListenerArr screenshot](https://github.com/TomRCummings/dumbest-discord-bot/blob/main/docs/botpic_r4.PNG)

## findFuncByID(id)
When you have a listener ID that you are interested in, you can use `findFuncByID(id)` to see what the actual function is.  

![findFuncByID screenshot](https://github.com/TomRCummings/dumbest-discord-bot/blob/main/docs/botpic_r3.PNG)

## Author
Thomas Cummings
cummings.t287@gmail.com

## License
Copyright 2022 Thomas Cummings

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
