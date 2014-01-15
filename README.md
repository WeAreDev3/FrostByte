# Top Down Shooter

## Goals

### Game Logic
- Multiplayer:
    - ~~Get each player to show up on the other player's screen~~
    - Get each player's position to accurately reflect their position
        - Make each client have a 16:10 aspect ratio
        - Make each client send data based on a 1600x1000 screen
- Change the gun kick to accuracy and then actually implement kick, where the player moves back a bit
- Lobbies

### Game Efficiency & Organization
- Lines 14-20 of the crosshairs (curs & cursor var stuff) can be improved.
- Some of the crosshair logic can be moved into the mouse input object.
- Move the onMessage switch handler from the lobby class to the game class.
- The onMessage switch handler needs to be moved to the game ob

### Game Aesthetics
- Create sprites

### Proposed class system by janka102:
 - Entity
    - Character
        - Player
        - Other Players in Lobby
        - Enemy/Mob
	    - Item
	        - Gun
	        - Inventory
	        - Currency
    - Bullet
    - Wall/Barrier

## Bugs
Can now be found at http://gitlab.mke8.me/mkeedlinger/top-down-shooter/issues