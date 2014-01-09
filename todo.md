# Goals (in order)
- multiplayer
- actual game logic (massive map or lobby style?)

## game logic goals
- make dead enemies disapear after some time (fade away?)

# What do we need in the gun object?
- Accuracy
- ~~Kick~~
- ~~Damage~~
- ~~Bullet Speed~~
- ~~Rate of fire~~
- ~~Type (Semi-Auto, Auto, Shotgun)~~

# Proposed class system by janka102:
 - Entity
    - Character
        - Player
        - Enemy/Mob
    - Bullet
    - Wall/Barrier
    - Item
        - Gun
        - Coin/Power-up/etc.??

# Misc. (order of importance)
- ~~Get a server running on Cloud9! It doesn't have to be anything fancy, just serve up game.html~~
- Fix the bloated crosshairs stuff. Some of that code belongs in the input object.
- Change the gun kick to accuracy and then actually implement kick, where the player moves back a bit
- ~~MODULARIZE THE DAMN JS FILE!!!!! (put each object in a separate file)~~
