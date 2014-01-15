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