Sea battle
===
Simple sea battle game - [Play](https://mhz-edu.github.io/sea-battle/)

## Description

Yet another implementation of a classic tabletop game. Each of two players has a 10x10 field and 10 ships of different sizes.
Players must place their ships on the field either horizontally or vertically and so that there is always at least one empty cell between them.
After ships are ready, players start to exchange shots. Goal is to hit all enemy ships.

Current implementation could be played in single player mode with a dummy bot and in multiplayer mode with another player on his machine.

<img src="./sea-battle-screen1.png" alt="Game screenshot 1" width="50%">
<img src="./sea-battle-screen2.png" alt="Game screenshot 2" width="50%">

## Updates for version 2.0

Version 2.0 has many improvements that were mentioned below for version 1.0.

First and most visible one is new styling. Here I'm using [Bulma](https://bulma.io/) CSS library. It has CSS classes that are easy to use and combine. However, to be able to use such library major under-the-hood refactoring has been performed. To decouple state logic from UI elements I've decided to use Web Components as isolated building blocks with their own styles and functions. That decision has also given me an ability to implement state pages templates in sort of declarative way.

Overall I have the following application workflow with Web Components:
 1. Each state has a page template as string value that contains a piece of HTML with custom Web Components and standart HTML elements.
 2. This template is parsed to document fragment which is appended to the `app` container after we switch to a particular state.
 3. Template parsing is a two step process - at first, HTML document is created from a template string.
 4. Second - Parser function iterates through the DOM of the created document. When the parser finds a custom Web Component, it creates a new element with given attributes as props, and also saves reference to the current state object in `context` property. And then it swaps newly created element with ones it've found in the DOM  

Another improvement is reactivity. New class `Subscribable` was added as parent for states and other data structures. It has given the possibility to create single value, array and 2D-array object properties, track and notify other objects about changes in these properties.

Altogether these changes allowed me to create a UI that redraws only those elements that are related to particular changes in data structures and not the whole pages.

There are significant code quality improvements, like switching to webpack bundler and ESM modules, tests and updated algorithms.

Version that works without bundler and does not require Node.js is available in the `no-bundler` branch.

## Usage

Run tests:
```
npm test
```

Build production bundle:
```
npm run build
```

Build dev bundle (in memory) and serve it via dev server:
```
npm run dev
```

## Technical details

Game is written in vanilla JS without using any frameworks or libraries. Except for the multiplayer part where the underlying p2p connection is handled by the Peer.js library.

Game is represented as a simple state machine implemented in the `StateMachine` class. Game states are implemented as separate classes with `enter` and `exit` methods. State diagram is shown below.

![State diagram](./sea-battle-state-diag.png)

Game itself is implemented as message exchange through the `EventManager` object between player controllers governed by the `GameLogic` object. Sequence diagram below that depicts game start, ingame and game over exchange.

![Sequence diagram](./sea-battle-sequence-diag.png)

Multiplayer game is using the Peer.JS library to establish a connection and to send messages between two peers. Froma a game mechanics standpoint, in case of multiplayer, a simple `NetworkPlayer` object is used. It relays messages from `EventManager` to another peer and back.

## Things to improve in version 1.0

Of course, there are plenty of items that could be improved. 

1. Code and layout are too tightly coupled. It is difficult to change layout without changes in state code.
2. Data structure for the game field could be improved. Like to add getters and setters for given rows and columns.
3. Add some kind of reactivity to elements. As Example, if the game field has been changed, respective UI elements should be rerendered automatically.
4. UI/UX of ship placement. For now there is now way to adjust an already placed ship without clearing the whole game field.
5. Tests...

## Reference

I've intentionally avoided checking existing solutions to practice problem solving. However I used the following materials for help and insights.

1. [MDN Web Docs](https://developer.mozilla.org/)
2. [CS50's Introduction to Game Development](https://cs50.harvard.edu/games/) - Lectures 0 and 1 in particular about state machines. (Also they are not using JS there)
3. [MVC Game Design Pattern](https://github.com/wesleywerner/mvc-game-design) and it's [predecessor](http://ezide.com/games/writing-games.html) - On how to structure games and Event manager approach (Also non-JS specific)
4. [PeerJS docs](https://peerjs.com/docs/#api)
