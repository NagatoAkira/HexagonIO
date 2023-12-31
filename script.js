// Initialize Canvas

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Game Update - function for filling background

function game_update() {
	window_height = parseInt(window.innerHeight)
	window_width = parseInt(window.innerWidth)

	canvas.width = window_width
	canvas.height = window_height


	c.fillStyle = "#7B108C"
	c.fillRect(0,0,canvas.width, canvas.height)
} 

// Additional functions for working in classes

function random_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); 
}

function distance(pos01, pos02) {
	vector = [pos02[0]-pos01[0], pos02[1]-pos01[1]]
	return (Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]))
}
function normalize(pos01, pos02){
	vector_length = distance(pos01, pos02)
	return [vector[0]/vector_length, vector[1]/vector_length]
}

function get_degrees(vector){
	let diff = 30
	let degrees = Math.atan2(vector[0], vector[1]) * 180 / Math.PI + 180 - diff
	if(degrees < 0){
		degrees += 360
	}
	return degrees
}

function DeleteFrontArrayElement(array){
	let recover_elements = []
	for(let i=1; i<array.length; i++){
		recover_elements.push(array[i])
	}
	return recover_elements
}

function DeleteUndefinedArrayElements(array){
	let recover_elements = []
	for(let i in array){
		if(array[i] != null){
			recover_elements.push(array[i])
		}
	}
	return recover_elements
}

function hexagon(degrees){
	conditions = [[degrees <= 60 && degrees >= 0, (540+360)/2],
				[degrees <= 360 && degrees >= 300, 360],
				[degrees <= 300 && degrees >= 240, (180+360)/2],
				[degrees <= 240 && degrees >= 180, (0+180)/2],
				[degrees <= 180 && degrees >= 120, 0],
				[degrees <= 120 && degrees >= 60, (540+720)/2]]
	for(condition in conditions){
		if (conditions[condition][0]){
			return conditions[condition][1]
			break
		}
	}
}


//Sprite - class for creating animated game object on scene

class Sprite {

	default_stats(){
		return {
		x: 550,
		y: 550,
		height: 50,
		width: 50,
		velocity: {
			x: 0,
			y: 0
		},
		speed: 1,
		animations: []
	    }
	}

	check_data(stats){
		let check = this.default_stats()
		for(let i in check){
    		if(i in stats){
        		check[i] = stats[i]
    		}
		}
		return check
	}

	constructor(stats = this.default_stats()){
		this.stats = this.check_data(stats)
		
		this.stats.x -= this.stats.width/2
		this.stats.y -= this.stats.height/2

		this.animations = this.stats.animations
		this.animate_id = 0
		this.change_to_animate_id = 0
		this.frame = 0
	}
	draw(image) {
		c.drawImage(image, this.stats.x, this.stats.y, this.stats.width, this.stats.height)
	}
	update() {
		this.stats.x += this.stats.velocity.x * this.stats.speed 
		this.stats.y += this.stats.velocity.y * this.stats.speed
		if(this.frame == this.animations[this.animate_id].length){
			this.frame = 0
			this.animate_id = this.change_to_animate_id
		}
		this.draw(this.animations[this.animate_id][this.frame])

		this.frame += 1
	}
}


// Instance - class for generating multiple copies of one game object (in our situation: bullet)

class Instance{
	constructor(sprite_stats, player, objects = []){
		this.sprite_stats = sprite_stats
		this.player = player
		this.Instances = []
		this.points = 0
		this.objects = objects
		this.instance_directions = [[]]
		this.game_over_bool = false

		this.clear_bool = false
	}
	shoot(){
		this.Instances.push(new Sprite(this.sprite_stats))

		let start_pos = [this.player.stats.x, this.player.stats.y]
		let player_x = start_pos[0] + this.player.stats.width/2 - this.sprite_stats.width/2
		let player_y = start_pos[1] + this.player.stats.height/2 - this.sprite_stats.height/2
		let instance = this.Instances[this.Instances.length - 1]
		let radius = distance([0,0],[canvas.height/2, canvas.height/2])
		if(instance.stats.velocity.x == 0 && instance.stats.velocity.y == 0 && instance.animate_id == 0){
			let rand = random_int(1,359)
			let condition = hexagon(rand)
			let dir = [0,-1]

			dir[0] = -Math.sin(Math.PI/360*condition)
			dir[1] = -Math.cos(Math.PI/360*condition)

			instance.stats.x = player_x - dir[0]*radius
			instance.stats.y = player_y - dir[1]*radius
			instance.stats.velocity.x = dir[0]
			instance.stats.velocity.y = dir[1]
			this.instance_directions[0].push(condition)
		}
	}
	fade(click_pos){
		let player_x = this.player.stats.x + this.player.stats.width/2
		let player_y = this.player.stats.y + this.player.stats.height/2
		let prev_points = this.points
		let green = 250
		let yellow = 325
		let condition01 = hexagon(get_degrees(normalize([player_x, player_y],click_pos)))
		if(this.Instances[0] != null && this.instance_directions[0][0]!=null){
		let condition02 = this.instance_directions[0][0]

		let index_instance = this.Instances.length - this.instance_directions[0].length
	  let instance_pos = [this.Instances[index_instance].stats.x, this.Instances[index_instance].stats.y]

		if(condition01==condition02 && this.Instances[index_instance].animate_id==0){
		if(distance(instance_pos, [player_x, player_y])<yellow){
				this.Instances[index_instance].stats.velocity = {x:0,y:0}
				this.Instances[index_instance].animate_id = 1
				this.Instances[index_instance].frame = 0
		    }
		if(distance(instance_pos, [player_x, player_y])<yellow && distance(instance_pos, [player_x, player_y])>green){
				this.objects.round_obj_yellow.animate_id = 1
				this.objects.round_obj_yellow.frame = 0
				this.points += 3
				}
		if(distance(instance_pos, [player_x, player_y])<green){
				this.objects.round_obj_green.animate_id = 1
				this.objects.round_obj_green.frame = 0
				this.points += 2
				}
		  }

		this.instance_directions[0] = DeleteFrontArrayElement(this.instance_directions[0])

		index_instance = this.Instances.length - this.instance_directions[0].length

		if(this.Instances[index_instance]!=null){
		this.Instances[index_instance].stats.width = this.sprite_stats.width * 1.3
    this.Instances[index_instance].stats.height = this.sprite_stats.height * 1.3
    this.Instances[index_instance].stats.x -= this.Instances[index_instance].stats.width/2-this.sprite_stats.width/2
    this.Instances[index_instance].stats.y -= this.Instances[index_instance].stats.height/2-this.sprite_stats.height/2
    }
		}
    
		if (prev_points == this.points){
		this.game_over_bool = true
		}
	}
	clear(){
	for(let instance in this.Instances){
		this.Instances[instance].animate_id = 1
		this.Instances[instance].change_to_animate_id = 1
		this.Instances[instance].stats.velocity = {x:0,y:0}
	}
	this.instance_directions[0] = []
	}
	update(){
			if (this.Instances[0] != null){
			let player_x = this.player.stats.x + this.player.stats.width/2 - this.sprite_stats.width/2 
			let player_y = this.player.stats.y + this.player.stats.height/2 - this.sprite_stats.height/2
			let condition = distance([player_x, player_y],[this.Instances[0].stats.x, this.Instances[0].stats.y]) < 30
			if(condition && this.Instances[0].animate_id==0 || this.Instances[0].stats.y < -500 || this.Instances[0].stats.y > canvas.height+500){
				this.game_over_bool = true
				this.Instances[0].stats.velocity = {x:0,y:0}
				this.Instances[0].animate_id = 1
			}
		}
		for(let instance in this.Instances){
			if(this.Instances[instance].frame == this.Instances[instance].animations[1].length && this.Instances[instance].animate_id != 0){
				this.Instances[instance] = null
				continue
			}
			this.Instances[instance].update()
		}
		this.Instances = DeleteUndefinedArrayElements(this.Instances)
	}
}

game_update()

// Camera, Visualizer Point Counter, Additional Functions


function get_frames(start_path, name, amount){
	let frames = []
	for(let counter=0; counter<amount; counter++){
		frames.push(new Image())
		frames[counter].src = start_path +"\\" + name + "_" + counter.toString().padStart(2,"0") + ".png"
	}
	return frames
}

function get_unit_frame(start_path,name){
	let frames = [new Image()]
	frames[0].src = start_path + "\\" + name
	return frames
}

class Counter{
	constructor(position,font){
		this.stats = {x:position.x, y: position.y}
		this.velocity = {x:0, y:0}
		this.font = font
		this.speed = 0.15
	}
	velocity_define(counter_frames,fps){
		if(counter_frames<fps/2+1){
			this.velocity.y = -this.speed
		}else if (counter_frames<=fps+1){
			this.velocity.y = this.speed
		}
	}
	update(game_points){
		this.stats.x += this.velocity.x
		this.stats.y += this.velocity.y
		c.fillStyle = "#784B8D"
		c.font = this.font
		c.fillText(game_points.toString().padStart(2,"0"), this.stats.x, this.stats.y)
	}
}

class Camera{
	constructor(){
		this.velocity = {x:0, y:0}
		this.position = {x:0, y:0}
		this.edges = 15
		this.speed = 10
		this.scale = 1
	}
	velocity_define(click_pos){
		if(click_pos[1] > canvas.height/2 && this.position.y > -this.edges){
			this.velocity.y = -this.speed
		}else if(click_pos[1] < canvas.height/2 && this.position.y < this.edges){
			this.velocity.y = this.speed
		}
	}
	update(instances,gameobjects){
		this.position.y += this.velocity.y
		this.position.x += this.velocity.x

		if(this.position.y >= this.edges || this.position.y <= -this.edges){
			this.velocity = {x:0, y:0}
		}

		for(let instance in instances){
			instances[instance].stats.y += this.velocity.y
		}

		for(let gameobject in gameobjects){
			gameobjects[gameobject].stats.y += this.velocity.y
		}
	}
	resize(instances, gameobjects){
		this.scale = 0.005
		for(let instance in instances){
			instances[instance].stats.x -= instances[instance].stats.width*this.scale/2
			instances[instance].stats.y -= instances[instance].stats.height*this.scale/2
			instances[instance].stats.width *= 1+this.scale
			instances[instance].stats.height *= 1+this.scale
		}

		for(let gameobject in gameobjects){
			gameobjects[gameobject].stats.x -= gameobjects[gameobject].stats.width*this.scale/2
			gameobjects[gameobject].stats.y -= gameobjects[gameobject].stats.height*this.scale/2
			gameobjects[gameobject].stats.width *= 1+this.scale
			gameobjects[gameobject].stats.height *= 1+this.scale
		}
	}
}


// Variables and Objects


const player = new Sprite({x:canvas.width/2, y:canvas.height/2, height: 450, width: 450, animations:[get_frames("assets\\animation\\heart\\heart_animation", 'heart_animation', 90), get_frames("assets\\animation\\heart\\broken_heart", "broken_heart",90)]})

const round_green = new Sprite({x:canvas.width/2, y:canvas.height/2, height:500, width: 500, animations:[get_unit_frame("assets\\animation\\round_green\\round_green", "round_green_00.png"), get_frames("assets\\animation\\round_green\\round_green", 'round_green', 30), get_frames("assets\\animation\\round_red\\round_in", 'red_in', 30)]})
const round_yellow = new Sprite({x:canvas.width/2, y:canvas.height/2, height:600, width: 600, animations:[get_unit_frame("assets\\animation\\round_yellow", "round_yellow_00.png"), get_frames("assets\\animation\\round_yellow", 'round_yellow', 30), get_frames("assets\\animation\\round_red\\round_out", 'red_out', 30)]})
const bullet = new Instance({speed:3, height:80, width:80, color:"#000000",animations:[get_frames("assets\\animation\\bullet_idle","bullet_idle",30), get_frames("assets\\animation\\bullet_fade", 'bullet_fade', 30)]},player, objects ={round_obj_green:round_green, round_obj_yellow:round_yellow})

let game_over_stats = {speed:2, x:canvas.width/2, y:canvas.height+canvas.width/2.1, width:canvas.width/2.1, height:canvas.width/2.1, animations:[get_frames("assets\\animation\\game_over\\game_over", "game_over", 90)]}
if(canvas.width<canvas.height){
game_over_stats = {speed:3, x:canvas.width/2, y:canvas.height+canvas.width/3, width:canvas.width*0.95, height:canvas.width*0.95, animations:[get_frames("assets\\animation\\game_over\\game_over", "game_over", 90)]}
}
const game_over = new Sprite(game_over_stats)
game_over.stats.velocity.y = -10

const points = new Counter({x:player.stats.x+player.stats.width/2-32, y:player.stats.y+player.stats.height/2-18}, "40px Orbitron")
const camera = new Camera()

const background = new Sprite({x:canvas.width/2, y:canvas.height/2, height:2500, width:2500, animations:[get_unit_frame("assets\\animation\\BG", "BG.svg")]})

let canvas_opacity = 1

let fps = 90
let slowmo = 90
let speedup = false
let wait_time = 25

var counter_frames = 0
var counter_fr_points = 0
let final_points = 0

let shoot_frequancy = 0.7
let click_counter = 0


// Scene where we can draw game objects
function animate () {
	setTimeout(() => {
    	window.requestAnimationFrame(animate);
  	}, 1000 / fps);
  counter_frames += 1
  counter_fr_points += 1
	c.clearRect(0,0,canvas.width, canvas.height)
	game_update()
	background.update()
	points.velocity_define(counter_fr_points,fps)
	if (counter_fr_points>=fps){
		counter_fr_points = 0
	}
	if(!bullet.game_over_bool){
	if (counter_frames/fps >= shoot_frequancy){
		counter_frames = 0
		bullet.shoot([0,0])
	}
  }
	round_yellow.update()
	round_green.update()
	player.update()
	if(bullet.points>99){
  	final_points += bullet.points
  	bullet.points = 0
  }
	if(!bullet.game_over_bool){
	points.update(bullet.points)
  }

  if(click_counter > 5){
  if(bullet.sprite_stats.speed < 49){
 	bullet.sprite_stats.speed += 1.5
  }
  if(shoot_frequancy>0.25){
 	shoot_frequancy -= 0.02
  }
  click_counter = 0
  bullet.clear()
  } 

	bullet.update()
	camera.update(bullet.Instances, [round_green, round_yellow,player,points,background])

	if (bullet.game_over_bool){
		player.change_to_animate_id = 1
		player.animate_id = 1
		round_green.change_to_animate_id = 2
		round_green.animate_id = 2
		round_yellow.change_to_animate_id = 2
		round_yellow.animate_id = 2
		if(slowmo > 10){
			fps -= 2
			slowmo -= 2
			canvas_opacity -= 0.005
			camera.resize(bullet.Instances, [round_green, round_yellow,player,points,background])
		}else{
			speedup = true
			wait_time -= 1
		}

		if(speedup && fps < 90 && wait_time <= 0){
			fps += 2
		}

		c.globalAlpha = 1-canvas_opacity
		c.fillStyle = "#000000" 
		c.fillRect(0,0,canvas.width, canvas.height)


		if(wait_time <= 5){
		c.globalAlpha = 1
		game_over.update()
		if(game_over.stats.y < canvas.height/2-game_over.stats.y*1.5){
			game_over.stats.velocity.y = 0
			c.fillStyle = "#753097"
			c.font = "50px Orbitron"
			c.fillText("Your score", canvas.width/2-50*3, game_over.stats.y+game_over.stats.height/50*23.5)
			c.font = "45px Orbitron"
			c.fillText((final_points+bullet.points).toString().padStart(6,'0'), canvas.width/2-45*2.4, game_over.stats.y+game_over.stats.height/45*26.5)
		}
	 }

		for(instance in bullet.Instances){
			bullet.Instances[instance].animate_id = 1
			bullet.Instances[instance].stats.velocity = {x:0,y:0}
		}
	}
	  c.globalAlpha = 0.5
		c.font = "400 25px Roboto"
		c.fillStyle = "#000000"
		c.fillText("@ Youtube-channel: breaddays8574", canvas.width-425, canvas.height-25)
}

animate()

// Listener which checks clicks

window.addEventListener("click", (event) => {
	if(distance([canvas.width/2, game_over.stats.y+game_over.stats.height*0.15+game_over.stats.width/20], [event.clientX, event.clientY]) < game_over.stats.width/20){
		location.reload()
	}
	if (bullet.game_over_bool){
		wait_time = 0
		game_over.stats.speed = 5
		fps = 90
	}
	if (!bullet.game_over_bool){
	bullet.fade([event.clientX, event.clientY])
	camera.velocity_define([event.clientX, event.clientY])

	click_counter += 1
	}
})
