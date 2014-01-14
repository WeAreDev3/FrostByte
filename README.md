# Top Down Shooter

## Goals

### Game Logic
- Multiplayer!
- Change the gun kick to accuracy and then actually implement kick, where the player moves back a bit
- Lobbies

### Game Efficiency
- Lines 14-20 of the crosshairs (curs & cursor var stuff) can be improved.
- Some of the crosshair logic can be moved into the mouse input object.

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