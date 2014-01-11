# Goals (in order)
- multiplayer
- Fix the bloated crosshairs stuff. Some of that code belongs in the input object
- Change the gun kick to accuracy and then actually implement kick, where the player moves back a bit
- actual game logic (massive map or lobby style?)
- make sprites final (look nice):
	- main sprite should be about 2x the sixe of the smaller ones

## game logic goals
- make dead enemies fade away instantly on death (bullets go through fading phase)

## What do we need in the gun object?
- Accuracy
- ~~Kick~~
- ~~Damage~~
- ~~Bullet Speed~~
- ~~Rate of fire~~
- ~~Type (Semi-Auto, Auto, Shotgun)~~

## Proposed class system by janka102:
 - Entity
    - Character
        - Player
        - Enemy/Mob
    - Bullet
    - Wall/Barrier
    - Item
        - Gun
        - Coin/Power-up/etc.??
