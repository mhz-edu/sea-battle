Sea battle
===
Simple sea battle game - [Play](https://mhz-edu.github.io/sea-battle/)

## Description

Yet another implementation of a classic table top game. Each of two players has a 10x10 field and 10 ships of different sizes.
Players must place their ships on the field either horizontaly or verticaly and so that there is always at least one empty cell between them.
After ships are ready, players start to exchange shot. Goal is to hit all enemy ships.

Current implementation could be played in single player mode with a dummy bot and in multiplayer mode with another player on his machine.

## Tecnhincal details

Game is written in vailla JS without using any frameworks or libraries. Except for multiplayer part where underlying p2p connecction is handled by Peer.js library.

Game is represented as a simple state machine implementted in `StateMachine` class. Game states are implemented as separate classes with `enter` and `exit` methods. State diagram is shown below.

![State diagram](./sea-battle-state-diag.png)

Game itself is implemeted as message exchange through `EventManager` object between player controllers governed by `GameLogic` object. Sequence diagram below that depicts gane start, ingame and game over exchange.

![Sequence diagram](./sea-battle-sequence-diag.png)

Multiplayer game is using Peer.JS library to establish a connection and to send messages between two peers. From game mechanics standpoint in case of multiplyer simple `NetworkPlayer` object is used. It relays messages from `EventManager` to another peer and back.

## Things to improve

Of course, there are plenty of items that could be improved. 

1. Code and layout are too tightly coupled. It is difficult to change layout without changes in state code.
2. Data structure for field could be improved. Like to add getters and setters for given rows and columns.
3. Add some kind of reactivity to elements. As Example, if field has been changed, respective UI elements should be rerendered automatically.
4. UI/UX of ship placement. For now there is now way to adjust already placed ship without clearing all field.
5. Tests...

## Reference

I've intentionally avoided checking existing solutions to practice in problem solving. However I used the following materials for help and insights.

1. [MDN Web Docs](https://developer.mozilla.org/)
2. [CS50's Introduction to Game Development](https://cs50.harvard.edu/games/) - Lectures 0 and 1 in particular about state machines. (Also they are not using JS there)
3. [MVC Game Design Pattern](https://github.com/wesleywerner/mvc-game-design) and it's [predecessor](http://ezide.com/games/writing-games.html) - On how to structure games and Event manager approach (Also non-JS specific)
