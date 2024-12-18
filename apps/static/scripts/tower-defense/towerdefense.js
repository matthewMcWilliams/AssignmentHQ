import balloonData from "./balloon-data.js";
import { Building, Thorny, MagnifiedLaser, Railgun, buildingClassList } from './Building.js'
import buildingData from "./building-data.js";
console.log(balloonData)
import Button from "./Button.js"
import State from './State.js'
import waveData from "./wave-data.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io()

const clamp = (x, a, b) => Math.max(a, Math.min(x, b))

const urlParams = new URLSearchParams(window.location.search);

const urlCode = urlParams.get("code");
const nickname = urlParams.get('nickname')

let state = State.LOBBY

socket.emit('create_lobby', {
    'mode':'tower-defense',
    'deck-id':deckId,
    'code': urlCode ?? -1,
    'nickname': nickname ?? my_username
})

let gameCode = 'WAITING'
let playerList = []

let isHost = false

socket.on('room_update', ({ _mode, players, code, _deckId }) => {
    gameCode = code;
    playerList = players;
}); 

socket.on('set_host', () => {
    isHost = true
})

let hostMap, clientMap, myMap

socket.on('start_game', () => {
    state = State.GAME

    hostMap = new Map()
    clientMap = new Map()

    myMap = isHost ? hostMap : clientMap
})


const Section = Object.freeze({
    Build:'build',
    Upgrade:'upgrade',
    Attack:'attack',
    Questions:'questions'
})

let section = Section.Questions


let mouseX, mouseY
let mouseDown = false
let mouseClick = 0

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX = x
    mouseY = y
});

canvas.addEventListener('touchmove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX = x
    mouseY = y
})


canvas.addEventListener('mousedown', (event) => {
    mouseDown = true;
    mouseClick = 2;
});

canvas.addEventListener('touchstart', (event) => {
    mouseDown = true;
    mouseClick = 2;
})


canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

canvas.addEventListener('touchend', () => {
    mouseDown = false;
})



function setCursorPointer() {
    canvas.classList.add('cursor-pointer')
}

function setCursorNormal() {
    canvas.classList.remove('cursor-pointer')
}

function drawCircle(x, y, r, c) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2*Math.PI)
    ctx.fill()
}

function drawCircleOutline(x, y, radius, color = 'black', lineWidth = 2) {
    ctx.beginPath(); // Start a new path
    ctx.arc(x, y, radius, 0, 2 * Math.PI); // Draw a circle (full 360°)
    ctx.strokeStyle = color; // Set the outline color
    ctx.lineWidth = lineWidth; // Set the outline thickness
    ctx.stroke(); // Draw the outline
}

function drawLine(x1, y1, x2, y2, color = 'black', lineWidth = 2) {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x1, y1); // Starting point of the line
    ctx.lineTo(x2, y2); // Ending point of the line
    ctx.strokeStyle = color; // Set the line color
    ctx.lineWidth = lineWidth; // Set the line thickness
    ctx.stroke(); // Draw the line
}


let coins = 0
let coinsPerQuestion = [1,2,3,5,8,12,20]


function distance(x_1, y_1, x_2, y_2) {
    return Math.sqrt((x_1-x_2)*(x_1-x_2)+(y_1-y_2)*(y_1-y_2))
}

function getRandomElements(arr, numElements) {
    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Return the first `numElements` items from the shuffled array
    return arr.slice(0, numElements);
}


class Map {
    constructor() {
        this.map = [
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // 0
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // 1
            [0, 1, 0, 0, 0, 1, 1, 1, 1, 1], // 2
            [0, 1, 0, 0, 0, 1, 0, 0, 0, 0], // 3
            [0, 1, 0, 0, 0, 1, 0, 0, 0, 0], // 4
            [0, 1, 0, 0, 0, 1, 1, 1, 1, 0], // 5
            [0, 1, 0, 0, 0, 0, 0, 0, 1, 0], // 6
            [0, 1, 0, 0, 0, 0, 0, 0, 1, 0], // 7
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 8
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // 9
        ]

        this.buildings = []

        this.balloonPath = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 1, y: 5 },
            { x: 1, y: 6 },
            { x: 1, y: 7 },
            { x: 1, y: 8 },
            { x: 2, y: 8 },
            { x: 3, y: 8 },
            { x: 4, y: 8 },
            { x: 5, y: 8 },
            { x: 6, y: 8 },
            { x: 7, y: 8 },
            { x: 8, y: 8 },
            { x: 8, y: 7 },
            { x: 8, y: 6 },
            { x: 8, y: 5 },
            { x: 7, y: 5 },
            { x: 6, y: 5 },
            { x: 5, y: 5 },
            { x: 5, y: 4 },
            { x: 5, y: 3 },
            { x: 5, y: 2 },
            { x: 6, y: 2 },
            { x: 7, y: 2 },
            { x: 8, y: 2 },
            { x: 9, y: 2 }
        ];

        this.balloons = []

        this.towerHealth = 100
        
    }

    render(x_0, y_0, s) {
        this.x_0 = x_0
        this.y_0 = y_0
        this.s = s

        for (let i = 0; i < this.map.length; i++) {
            const list = this.map[i];
            for (let j = 0; j < list.length; j++) {
                const tileID = list[j];
                
                // get color
                switch (tileID) {
                    case 0:
                        ctx.fillStyle = 'DarkOliveGreen'
                        break;
                    case 1:
                        ctx.fillStyle = 'BurlyWood'
                    default:
                        break;
                }
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 0.2

                // draw rect
                let x = x_0 + j * s/10
                let y = y_0 + i * s/10
                ctx.fillRect(x, y, s/10, s/10)
                ctx.strokeRect(x, y, s/10, s/10)
            }
        }

        // display health
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        
        ctx.fillStyle = 'black'
        ctx.fillText(this.towerHealth, x_0 + 10 * s/10, y_0 + 2 * s/10) // Hardcoded for now, need to change later

        this.buildings.forEach((building) => {

            switch (building.upgradeLevel) {
                case 1:
                    ctx.fillStyle = 'Chocolate'
                    ctx.fillRect(x_0+building.x*s/10, y_0+building.y*s/10, s/10, s/10)
                    break;
                
                case 2:
                    ctx.fillStyle = 'DarkGrey'
                    ctx.fillRect(x_0+building.x*s/10, y_0+building.y*s/10, s/10, s/10)
                    break
                
                case 3:
                    ctx.fillStyle = 'GoldenRod'
                    ctx.fillRect(x_0+building.x*s/10, y_0+building.y*s/10, s/10, s/10)
                    break
            
                default:
                    break;
            }

            drawCircle(x_0+building.x*s/10+s/20, y_0+building.y*s/10+s/20, s/22, building.color)
        })

        this.balloons.forEach((balloon) => {
            drawCircle(
                x_0+balloon.x*s/10+s/20, 
                y_0+balloon.y*s/10+s/20, 
                s/20 * balloon.size/100, 
                balloon.color
            )
        })
    }


    clicked(x_0, y_0, s) {

        let x_block = Math.floor((mouseX - x_0) / (s/10))
        let y_block = Math.floor((mouseY - y_0) / (s/10))

        return (
            mouseDown &&
            mouseX < x_0 + s && mouseX > x_0 &&
            mouseY < y_0 + s && mouseY > y_0
        ) ? [x_block, y_block] : false

    }


    moveBalloons() {
        for (let i = 0; i < this.balloons.length; i++) {
            const balloon = this.balloons[i];

            if (isHost && (balloon.target >= this.balloonPath.length || balloon.health <= 0)) {
                socket.emit(
                    'td-pop_balloon', 
                    {
                        map:this==hostMap?'host':'client',
                        balloonIndex:balloon.id, 
                        room:gameCode
                    }
                )
                
                if (balloon.health > 0) {
                    socket.emit(
                        'td-update_health',
                        {
                            map: this == hostMap?'host':'client',
                            newHealth: this.towerHealth - Math.ceil(balloon.health),
                            room: gameCode
                        }
                    )
                }

                balloon.target = this.balloonPath.length - 1
                continue

            } else if (balloon.target >= this.balloonPath.length) {
                // Client
                balloon.target = this.balloonPath.length - 1
                
            }

            let dirX = this.balloonPath[balloon.target].x - balloon.x
            let dirY = this.balloonPath[balloon.target].y - balloon.y
            
            const speed = balloon.speed * balloon.speedMultiplier
            balloon.x += clamp(dirX, -1/60*speed, 1/60*speed)
            balloon.y += clamp(dirY, -1/60*speed, 1/60*speed)
    
            if (Math.abs(dirX) < 1/60*speed 
                    && Math.abs(dirY) < 1/60*speed) {
                balloon.target++
                if (isHost && balloon.target < this.balloonPath.length-1) {
                    socket.emit('td-balloon_target_change', {balloon:i, position: balloon.target-1, room:gameCode, map:this==hostMap?'host':'client'})
                }
            }
        }
    }
}


class WaveManager {
    constructor(waves) {
        this.waves = waves

        this.queue = this.waves[0]

        this.waveCount = 0
    }

    update() {
        
        if (this.waves.length == 0) {
            return
        }

        const noBalloons = hostMap.balloons.length == 0 && clientMap.balloons.length == 0

        if (this.queue.length == 0 && noBalloons) {
            this.queue = this.waves[1]
            this.waves.shift()
            socket.emit('td-update_wave', {wave:this.waveCount+1, room:gameCode})
            return
        } else if (this.queue.length <= 0) {
            return
        }

        

        this.queue[0].time -= 1

        if (this.queue[0].time <= 0) {
            socket.emit(
                'td-spawn_balloon',
                {
                    mapIsHost:false,
                    index:this.queue[0].balloonIndex,
                    room:gameCode
                }
            )

            socket.emit(
                'td-spawn_balloon',
                {
                    mapIsHost:true,
                    index:this.queue[0].balloonIndex,
                    room:gameCode
                }
            )
            
            this.queue.shift()
        }
    }

    render() {
        ctx.fillStyle = 'white'; // Fill color
        ctx.fillRect(canvas.width/2-30, canvas.height/2-30, 60, 60); // Fill the rectangle (x, y, width, height)
        ctx.lineWidth = 4; // Border thickness
        ctx.strokeStyle = 'black'; // Border color
        ctx.strokeRect(canvas.width/2-30, canvas.height/2-30, 60, 60); // Draw the border


        ctx.font = 'bold 24px Arial'; // Bold text
        ctx.textAlign = 'center'; // Center horizontally
        ctx.textBaseline = 'middle'; // Center vertically
        ctx.fillStyle = 'blue'; // Text color
        ctx.fillText(this.waves.length > 0 ? this.waveCount+1 : 'FREE for ALL!', canvas.width / 2, canvas.height / 2); // Draw text at center

    }
}




class Balloon {
    static idTracker = 0;
    static exponentialHealth = [1, 3, 10, 30, 80, 200]; // Health values for six types of balloons.

    constructor(index) {
        this.health = balloonData[index].health
        this.size = balloonData[index].size
        this.color = balloonData[index].color
        this.speed = balloonData[index].speed
        this.speedMultiplier = 1

        this.x = 1;
        this.y = 0;
        this.target = 1;
        this.id = Balloon.idTracker;

        Balloon.idTracker += 1;
    }
}


let selectedBuilding = null

const waveManager = new WaveManager(waveData)



const startGameButton = new Button(canvas.width/3, canvas.height*2/3, canvas.width/3, 40, 'red')

socket.on('td-add_coins', ({count}) => {
    coins += count
})

socket.on('td-update_wave', ({wave}) => {
    waveManager.waveCount = wave
})


socket.on('td-pop_balloon', ({map, balloonIndex}) => {
    const targetMap = map == 'host' ? hostMap : clientMap
    targetMap.balloons = targetMap.balloons.filter(balloon => balloon.id != balloonIndex)
})


socket.on('td-update_health', ({map, newHealth}) => {
    const targetMap = map == 'host' ? hostMap : clientMap
    targetMap.towerHealth = newHealth
})


socket.on('td-balloon_target_change', ({map, balloonIndex, positionIndex}) => {
    if (isHost) {
        return
    }

    if (targetMap.balloons.length <= balloonIndex) {
        return
    }
    const targetMap = map == 'host' ? hostMap : clientMap
    targetBalloon = targetMap.balloons[balloonIndex]

    targetBalloon.x = targetMap.balloonPath[positionIndex].x
    targetBalloon.y = targetMap.balloonPath[positionIndex].y

    targetBalloon.target = positionIndex + 1
})


socket.on('td-place_building', ({isForHost, x, y, index, room}) => {
    const targetMap = isForHost ? hostMap : clientMap
    targetMap.buildings.push(
        new buildingClassList[index](x, y)
    )
})


socket.on('td-spawn_balloon', ({mapIsHost, index}) => {
    const targetMap = mapIsHost ? hostMap : clientMap

    targetMap.balloons.push(new Balloon(index))
})


function drawLayout() {
    // Outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    // Render purchase section
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.strokeRect(0, canvas.height*3/4, canvas.width, canvas.height/4)

    // Render left half
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.strokeRect(0, 0, canvas.width/2-20, canvas.height*3/4)
    
    // Render right half
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.strokeRect(canvas.width/2+20, 0, canvas.width/2-20, canvas.height*3/4)
}


function drawSectionBuild() {
    for (let i = 0; i < buildingData.length; i++) {
        const building = buildingData[i];
        
        drawCircle(200+i*80, canvas.height-50, 35, building.color)

        ctx.fillStyle = 'black'
        ctx.fillText(building.cost, 200+i*80, canvas.height-50)

        building.button.x = 200 + i * 100 - 35
        building.button.y = canvas.height - 50 - 35
        building.button.width = 70
        building.button.height = 70

        if (building.button.clicked && coins >= building.cost) {
            selectedBuilding = building
        }

        if (selectedBuilding == building) {
            ctx.font = 'bold 12px Arial'
            ctx.textAlign = 'center'

            ctx.fillStyle = 'black'
            ctx.fillText(selectedBuilding.name, 700, 330)
            ctx.fillText(`Cost: ${selectedBuilding.cost} coins`, 700, 360)

            drawCircle(mouseX, mouseY, 10, building.color)
            drawCircleOutline(mouseX, mouseY, selectedBuilding.range*28, 'black', 2)
        }
    }
}

function drawSectionAttack() {
    for (let i = 0; i < balloonData.length; i++) {
        const balloon = balloonData[i];
        drawCircle(150+60*i, canvas.height*7/8, 55*balloon.size/100, balloon.color)

        ctx.fillStyle = 'black'
        ctx.fillText(balloon.cost, 150+60*i, canvas.height - 20)

        const button = new Button(1,2,3,4,balloon.color)

        button.x = 150+60*i-55*balloon.size/100
        button.y = canvas.height*7/8-55*balloon.size/100
        button.width = 55*balloon.size/100*2
        button.height = 55*balloon.size/100*2

        if (button.clicked && coins >= balloon.cost && mouseClick == 1) {
            if (isHost) {
                socket.emit(
                    'td-spawn_balloon',
                    {
                        mapIsHost:false,
                        index:i,
                        room:gameCode
                    }
                )
            } else {
                socket.emit(
                    'td-spawn_balloon',
                    {
                        mapIsHost:true,
                        index:i,
                        room:gameCode
                    }
                )
            }
            coins -= balloon.cost
        }
    }
}


let questionData = null
let currentQuestion = {
    definition: '',
    term: '',
    answerChoices: ['', '', '', ''],
    answered: -1,
    timer: 1
}

function generateQuestion() {
    let elements = getRandomElements(questionData, 4)
    currentQuestion.definition = elements[0].definition
    currentQuestion.term = elements[0].term
    currentQuestion.answerChoices = elements.map(e => e.term)
    currentQuestion.answered = -1
    currentQuestion.timer = 1

    // Fisher-Yates algorithm
    for (let i = currentQuestion.answerChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuestion.answerChoices[i], currentQuestion.answerChoices[j]] = [currentQuestion.answerChoices[j], currentQuestion.answerChoices[i]];
    }
}

fetch(`/api/deck/${deckId}`, {method: "GET"})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
    })
    .then(data => {
        questionData = data.cards
    })
    .then(() => {
        generateQuestion()
    })
    .catch(error => {
        console.log('Fetch error:', error)
    })

const answerChoiceButton = new Button(1, 2, 3, 4, 'silver')
    
function drawSectionQuestions() {

    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'black'
    ctx.fillText(currentQuestion.definition, canvas.width / 2, canvas.height * 13/16)

    for (let i = 0; i < currentQuestion.answerChoices.length; i++) {
        const choice = currentQuestion.answerChoices[i];
        answerChoiceButton.x = i * canvas.width/5 + 120
        answerChoiceButton.y = canvas.height * 7/8
        answerChoiceButton.width = canvas.width / 6
        answerChoiceButton.height = 30
        if (currentQuestion.answered > -1 && currentQuestion.term.toLocaleLowerCase() == choice.toLocaleLowerCase()) {
            answerChoiceButton.fill = 'DarkSeaGreen'
            if (currentQuestion.timer == 1 && currentQuestion.answered == i) {
                coins += coinsPerQuestion[0]
            }
            currentQuestion.timer -= 1/60
        } else if (currentQuestion.answered == i) {
            answerChoiceButton.fill = 'IndianRed'
        } else {
            answerChoiceButton.fill = 'silver'
        }
        answerChoiceButton.render()
        
        ctx.fillStyle = 'black'
        ctx.font = '16px Arial'
        ctx.fillText(choice, i * canvas.width / 5 + 180, canvas.height * 15/16-5)

        if (answerChoiceButton.clicked && currentQuestion.answered == -1) {
            currentQuestion.answered = i
        }
    }

    if (currentQuestion.timer < 0) {
        generateQuestion()
    }
}


let selectedBuildingForUpgrade = null

function drawSectionUpgrade() {
    const button = new Button(1,2,3,4,'red')

    myMap.buildings.forEach(building => {
        button.x = myMap.x_0 + building.x * myMap.s/10
        button.y = myMap.y_0 + building.y * myMap.s/10
        button.width = 30
        button.height = 30
        
        if (button.clicked) {
            selectedBuildingForUpgrade = building
        }
    });

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; 
    
    if (selectedBuildingForUpgrade != null) {

        const data = buildingData.find(d => d.name == selectedBuildingForUpgrade.name)
        
        const leftButton = new Button(100, canvas.height * 3/4 + 10, 300, canvas.height / 4 - 20, 'CornflowerBlue')
        leftButton.render()
        
        ctx.fillStyle = 'black';
        let upgrade = data.upgradePath[selectedBuildingForUpgrade.upgradeLevel].option1
        ctx.fillText(upgrade.message, canvas.width / 3, canvas.height *7/8);

        if (leftButton.clicked && coins >= upgrade.cost) {
            selectedBuildingForUpgrade[upgrade.feature] = upgrade.value
            coins -= upgrade.cost
            selectedBuildingForUpgrade.upgradeLevel += 1
            selectedBuildingForUpgrade = null
            return
        }
        
        const rightButton = new Button(canvas.width/2 + 20, canvas.height * 3/4 + 10, 300, canvas.height/4-20, 'CornflowerBlue')
        rightButton.render()
        
        ctx.fillStyle = 'black';
        upgrade = data.upgradePath[selectedBuildingForUpgrade.upgradeLevel].option2
        ctx.fillText(data.upgradePath[selectedBuildingForUpgrade.upgradeLevel].option2.message, canvas.width * 11 / 15, canvas.height *7/8);

        if (rightButton.clicked && coins >= upgrade.cost) {
            selectedBuildingForUpgrade[upgrade.feature] = upgrade.value
            coins -= upgrade.cost
            selectedBuildingForUpgrade.upgradeLevel += 1
            selectedBuildingForUpgrade = null
            return
        }

    } else {

        
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; 

        ctx.fillStyle = 'black'

        ctx.fillText('Select a balloon to get started', canvas.width / 2, canvas.height * 3/4 + 20)

        if (coinsPerQuestion.length <= 1) {
            return
        }

        const b = new Button(canvas.width / 4, canvas.height * 7/8 - 20, canvas.width / 2, canvas.height / 8 - 5, 'yellow')
        b.render()
        ctx.fillStyle = 'black'

        // It takes more questions for future upgrades.
        const coinsNeededForUpgrade = 3 + (7 - coinsPerQuestion.length)

        ctx.fillText(`${coinsPerQuestion[0] * coinsNeededForUpgrade}: Increase coins per question to ${coinsPerQuestion[1]}`, canvas.width / 2, canvas.height * 7/8)
        if (b.clicked && mouseClick == 1 && coins >= coinsPerQuestion[0] * coinsNeededForUpgrade) {
            coins -= coinsPerQuestion[0] * coinsNeededForUpgrade
            coinsPerQuestion.shift()
        }
    }
}



let buildButton = new Button(20, canvas.height*3/4+20-5,30,30,   'Ivory')
let attackButton = new Button(60, canvas.height*3/4+20-5,30,30,  'Ivory')
let upgradeButton = new Button(20, canvas.height*3/4+60-5,30,30, 'Ivory')
let questionButton = new Button(60, canvas.height*3/4+60-5,30,30,'Ivory')

const buildImageH = new Image()
const attackImageH = new Image()
const upgradeImageH = new Image()
const questionImageH = new Image()

let buildImage, attackImage, upgradeImage, questionImage

buildImageH.onload = async() => {
    buildImage = await createImageBitmap(buildImageH)
    console.log(buildImage)
}
buildImageH.src = '/static/imgs/tool-01.png'


attackImageH.onload = async() => {
    attackImage = await createImageBitmap(attackImageH)
    console.log(attackImage)
}
attackImageH.src = '/static/imgs/target-03.png'

upgradeImageH.onload = async() => {
    upgradeImage = await createImageBitmap(upgradeImageH)
}
upgradeImageH.src = '/static/imgs/arrow-up.png'

questionImageH.onload = async() => {
    questionImage = await createImageBitmap(questionImageH)
}
questionImageH.src = '/static/imgs/message-question-circle.png'




function drawPurchaseArea() {

    buildButton.render()
    ctx.drawImage(buildImage, 23, canvas.height*3/4+20)
    if (buildButton.clicked) { section = Section.Build }
    attackButton.render()
    ctx.drawImage(attackImage, 63, canvas.height*3/4+20)
    if (attackButton.clicked) { section = Section.Attack }
    upgradeButton.render()
    ctx.drawImage(upgradeImage, 23, canvas.height*3/4+60)
    if (upgradeButton.clicked) { section = Section.Upgrade }
    questionButton.render()
    ctx.drawImage(questionImage, 63, canvas.height*3/4+60)
    if (questionButton.clicked) { section = Section.Questions }

    switch (section) {
        case Section.Build:
            drawSectionBuild()
            break;
        
        case Section.Attack:
            drawSectionAttack()
            break;
    
        case Section.Questions:
            drawSectionQuestions()
            break;
        
        case Section.Upgrade:
            drawSectionUpgrade()
            break

        default:
            break;
    }

    ctx.font = 'bold 24px Arial'; // Bold text
    ctx.textAlign = 'center'; // Center horizontally
    ctx.textBaseline = 'middle'; // Center vertically
    ctx.fillStyle = 'gold'; // Text color
    ctx.fillText(coins, canvas.width / 2, canvas.height / 2 + 60); // Draw text at center
    ctx.lineWidth = 0.5; // Border thickness
    ctx.strokeStyle = 'black'; // Border color
    ctx.strokeText(coins, canvas.width / 2, canvas.height / 2 + 60); // Draw the border



}


function checkPlaceBuilding() {
    const mclick = myMap.clicked(isHost?45:canvas.width/2+20+45, 10, canvas.height*3/4-20)

    if (mclick == false || selectedBuilding == null) {
        return
    }

    let spotEmpty = !myMap.buildings.map(building => building.x == mclick[0] && building.y == mclick[1]).includes(true)
    let mapIsGrass = myMap.map[mclick[1]][mclick[0]] == 0
    let hasCoins = selectedBuilding.cost <= coins
    
    if (
        mapIsGrass
        && spotEmpty
        && hasCoins
    ) {
        socket.emit('td-place_building', {
            isForHost:isHost,
            x:mclick[0],
            y:mclick[1],
            index:selectedBuilding.index,
            room:gameCode
        })
        coins -= selectedBuilding.cost
        selectedBuilding = null
    }
}



function handleBalloons() {
    if (isHost) {
        waveManager.update()
    }

    waveManager.render()

    hostMap.moveBalloons()
    clientMap.moveBalloons()
}


function handleBuildingShoot() {

    const loopFunction = ((theMap, building) => {
        building.update()
        let farthestBalloon = null
        let farthestBalloonTarget = -1  // Arbritrarily High Number
        theMap.balloons.forEach(balloon => {
            const d = distance(building.x, building.y, balloon.x, balloon.y)
            if (d < building.range && balloon.target > farthestBalloonTarget) {
                farthestBalloon = balloon
                farthestBalloonTarget = balloon.target
            }
        })
        building.renderAttack(farthestBalloon, theMap)
        if (farthestBalloon != null) {
            if (building.cooldownTimer > 0) {
                return
            }
            building.shoot(farthestBalloon, theMap)
        }
    })

    hostMap.buildings.forEach(building => loopFunction(hostMap, building));
    clientMap.buildings.forEach(building => loopFunction(clientMap, building));
}


function drawLobby() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center'; // Horizontally center

    ctx.fillStyle = 'black';
    ctx.fillText('Game Code:  ' + gameCode, canvas.width / 2, canvas.height / 4);

    const nicknameList = playerList.map(x => Object.values(x)[0]);
    for (let i = 0; i < nicknameList.length; i++) {
        const player = nicknameList[i];
        ctx.fillText(player, canvas.width / 4, canvas.height / 2 + i * 24)
    }
    
    if (isHost) {
        startGameButton.render()

        ctx.fillStyle = 'white'
        ctx.fillText('Start Game ➡', canvas.width/2, canvas.height*2/3+30)
    }


    if (isHost && startGameButton.clicked) {
        socket.emit('td-start_game', gameCode)
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawLayout()

    hostMap.render(45, 10, canvas.height*3/4-20)

    clientMap.render(canvas.width/2+20+45, 10, canvas.height*3/4-20)

    drawPurchaseArea()

    checkPlaceBuilding()

    handleBalloons()

    handleBuildingShoot()
}


let msPrev = window.performance.now()
const fps = 40
const msPerFrame = 1000 / fps



function draw() {

    window.requestAnimationFrame(draw)

    const msNow = window.performance.now()
    const msPassed = msNow - msPrev
  
    if (msPassed < msPerFrame) return

    switch (state) {
        case State.LOBBY:
            drawLobby()
            break
        
        case State.GAME:
            drawGame()
            break
    
        default:
            break
    }

    mouseClick -= 1

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime
  }

draw()