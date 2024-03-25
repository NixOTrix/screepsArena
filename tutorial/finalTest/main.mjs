/* 
    Tutorial seems to be too easy to complete
    I have not tested it, but it appears that a single melee unit
    has enough dmg to finish off the attackers.
    Also the attacekr AI makes them rush for the spawner and ignore other units.
*/

import { } from 'game/utils';
import { } from 'game/prototypes';
import { TOUGH, ATTACK, RANGED_ATTACK, HEAL, WORK, CARRY, MOVE, RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from 'game/constants';
import { } from 'arena';
import { prototypes, utils } from 'game';

import { getObjectsByPrototype, createConstructionSite } from 'game/utils';
import { Creep, StructureSpawn, StructureTower } from 'game/prototypes';


const gatherBuild = [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
var myGatherCreeps = []
const builderBuild = [WORK, WORK, CARRY, MOVE]
var myBuilderCreeps = []
const rangedBuild = [MOVE, RANGED_ATTACK]
var myRangedCreeps = []
const meleeBuild = [MOVE, ATTACK]
var myMeleeCreeps = []
const healerBuild = [MOVE, HEAL]
var myHealerCreeps = []
var tower_flag = false;


export function loop() {
    var enemyCreeps = utils.getObjectsByPrototype(Creep).filter(i => !i.my);
    for (var enemy of enemyCreeps) {
        console.log("enemy", enemy)
    }


    // Your code goes here
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
    var myCreeps = utils.getObjectsByPrototype(Creep).filter(i => i.my);
    var sources = utils.getObjectsByPrototype(prototypes.Source);

    // initial gatherer construct and actions
    if (myGatherCreeps.length < 1) {
        var creep = mySpawn.spawnCreep(gatherBuild);
        if (creep.object) {
            myGatherCreeps.push(creep.object);
        }
    } else if (myBuilderCreeps.length < 3) {
        var creep = mySpawn.spawnCreep(builderBuild);
        if (creep.object) {
            myBuilderCreeps.push(creep.object);
        }
    } else if (myMeleeCreeps.length < 1) {
        var creep = mySpawn.spawnCreep(meleeBuild);
        if (creep.object) {
            myMeleeCreeps.push(creep.object);
        }
    } else if (myHealerCreeps.length < 1) {
        var creep = mySpawn.spawnCreep(healerBuild);
        if (creep.object) {
            myHealerCreeps.push(creep.object);
        }
    } else if (myRangedCreeps.length < 1) {
        var creep = mySpawn.spawnCreep(rangedBuild);
        if (creep.object) {
            myRangedCreeps.push(creep.object);
        }
    }
    // miners    
    for (var myGatherer of myGatherCreeps) {
        console.log(myGatherer)
        if (myGatherer.store.getFreeCapacity(RESOURCE_ENERGY)) {
            if (myGatherer.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                myGatherer.moveTo(sources[0]);
            }
        } else {
            if (myGatherer.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                myGatherer.moveTo(mySpawn);
            }
        }
    }

    // builders making tower
    for (var myBuilder of myBuilderCreeps) {
        const tower = utils.getObjectsByPrototype(prototypes.StructureTower).find(i => i.my);
        if (myBuilder.store[RESOURCE_ENERGY] == 0) {
            if (myBuilder.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                myBuilder.moveTo(sources[0]);
            }
        } else {
            if (!tower) {
                const constructionSite = utils.getObjectsByPrototype(prototypes.ConstructionSite).find(i => i.my);
                if (!constructionSite && !tower_flag) {
                    createConstructionSite({ x: mySpawn.x - 1, y: mySpawn.y - 1 }, StructureTower);
                    tower_flag = true;
                } else {
                    if (myBuilder.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        myBuilder.moveTo(constructionSite);
                    }
                }
            }
        }
        console.log(tower)
        if (tower) {
            if (tower.store[RESOURCE_ENERGY] < 10) {
                var myBuilder = utils.getObjectsByPrototype(prototypes.Creep).find(creep => creep.my);
                if (myBuilder.store[RESOURCE_ENERGY] == 0) {
                    if (myBuilder.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        myBuilder.moveTo(sources[0]);
                    }
                } else {
                    myBuilder.transfer(tower, RESOURCE_ENERGY);
                }
            } else {
                var target = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
                tower.attack(target);
            }
        }
    }

    // BATTLE TACTICS

    // figure out spawner x and y coordinates
    // var spawnerX = mySpawn.x;
    // var spawnerY = mySpawn.y;


    console.log("array",myMeleeCreeps)
    for (var myFighter of myMeleeCreeps) {
        console.log("object",myFighter)
        if (myFighter.attack(enemyCreeps[0]) == ERR_NOT_IN_RANGE) {
            myFighter.moveTo(enemyCreeps[0]);
        }
    }

    for (var myRanged of myRangedCreeps) {
        if (myRanged.rangedAttack(enemyCreeps[0]) == ERR_NOT_IN_RANGE) {
            myRanged.moveTo(enemyCreeps[0]);
        }
    }

    for (var myHealer of myHealerCreeps) {
        var myDamagedCreeps = myCreeps.filter(i => i.hits < i.hitsMax);
        if (myDamagedCreeps.length > 0) {
            if (myHealer.heal(myDamagedCreeps[0]) == ERR_NOT_IN_RANGE) {
                myHealer.moveTo(myDamagedCreeps[0]);
            }
        }
    }
}


