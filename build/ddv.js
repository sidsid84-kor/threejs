/**
 *
 */


class DDV {
	constructor(canvas=false, boxcolor='rgb(10%, 40%, 80%)', bgcolor=0xFFFFFF) {
		this.boxcolor = boxcolor;
		this.bgcolor = bgcolor;
		
		// pick 할 때 사용
		this.raycaster = new THREE.Raycaster();
		this.objClicked = false;
		this.label_show = null;
		this.pickedObject = null;
		this.clickedObject = null;
		this.clickedText = undefined;
		this.pickedObjectSavedColor = 0;
		this.pickedObjectClickedColor = {
			'r': 0,
			'g': 0,
			'b': 0
		};

		this.pickPosition = {x: 0, y: 0};
		this.canvas = canvas;
		this.font = undefined;
	}
	get_position(){
		return this.pickPosition;
	}
	pick(normalizedPosition, scene, camera, time) {
		if(this.canvas) {
			// 이미 다른 물체를 피킹했다면 색을 복원합니다
			if (this.pickedObject) {
			this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
			this.pickedObject.pickEvent(false);
			this.pickedObject = undefined;
			}

			// 절두체 안에 광선을 쏩니다
			this.raycaster.setFromCamera(normalizedPosition, camera);
			// 광선과 교차하는 물체들을 배열로 만듭니다
			const intersectedObjects = this.raycaster.intersectObjects(scene.getInstancegroup().children);

			if (intersectedObjects.length) {

			// 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
			this.pickedObject = intersectedObjects[0].object;
			
			// 기존 색을 저장해둡니다
			this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();

			if(this.objClicked){

				if(this.clickedObject != null && this.label_show === null){
					// console.log(this.clickedObject)
				}
			}else {
				// emissive 색을 빨강/노랑으로 빛나게 만듭니다
				// console.log(this.pickedObject)
				this.pickedObject.pickEvent(true,time);
				// this.pickedObject.material.emissive.setHex((time * 5) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
			}
			}
		}
	}
	pickClickEvent(){
		if(this.canvas) {
			if(this.pickedObject != undefined){   // 빤짝이는 것을 눌렀을 때만 on이 됨
				this.objClicked = !this.objClicked;   // on click
	
				if (this.clickedObject == null) {
					this.clickedObject = this.pickedObject;
					// 기존 정보 저장
					this.clickedObject.clickEvent(true);
					// this.clickedObject.material.wireframe = true;
				}
				else { // Off 작동
					this.clickedObject.clickEvent(false);
					// this.clickedObject.material.wireframe = false;
					this.clickedObject = null;
					this.label_show.visible = false;
					this.label_show = null;
				}
			} else if (this.objClicked){    // Off 작동
				this.clickedObject.clickEvent(false);
				
				this.clickedObject = null;
				this.objClicked = false;
				this.label_show.visible = false;
				this.label_show = null;
			}
			}
	}
		
	clearPickPosition() {
		if(this.canvas) {
		this.pickPosition['x'] = -100000;
		this.pickPosition['y'] = -100000;
		}
	}
		
	setPickPosition(event) {
		if(this.canvas) {
		const rect = this.canvas.getBoundingClientRect();

		const pos = {
			x: (event.clientX - rect.left) * this.canvas.width / rect.width,
			y: (event.clientY - rect.top) * this.canvas.height / rect.height,
		};
		this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
		this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;  // Y 축을 뒤집었음
		}
	}

	Box3Dchart(data,boxwidth, boxheight, dst = 1, x_label = null, z_label = null, use_auto_color = true, yaxis_segment = 10, boxcolor='rgb(10%, 40%, 80%)'){
		var original_data = data;

		let maxRow = data.map(function (row) {
			return Math.max.apply(Math, row);
		});
		let highestValue = Math.max.apply(null, maxRow);

		let minRow = data.map(function (row) {
			return Math.min.apply(Math, row);
		});
		let lowest_value = Math.min.apply(null, minRow);

		function make_normaldata(data){
			let normal_data = [];
			for (let j = 0; j < data.length; j++) {
					let numbers = data[j];
							
					numbers = numbers.map(v => Math.round(v / (highestValue/20)));
					normal_data.push(numbers)
				}
			return normal_data
		}
		

		function make_chart(data, boxwidth, boxheight, boxcolor, dst, a, b){
			let geometry = new THREE.BoxGeometry(
				boxwidth,
				data,
				boxheight
			);
			
			if(use_auto_color===true){
				boxcolor = auto_color(data);
			}
			let material = new THREE.MeshPhongMaterial({color: boxcolor})
			let cube = new THREE.Mesh(geometry, material);
			cube.position.x = (boxwidth + dst) * a;
			cube.position.y = (data) / 2
			cube.position.z = (boxheight + dst) * b;
			cube.castShadow = true;
			cube.add(make_EdgeLine(geometry,((original_data.length-a)*(boxheight + dst)),(data) / 2,(boxheight + dst) * (b+1)));
			cube.children[0].visible = false;
			cube.pickEvent = function(turn=true){
				cube.children[0].visible = turn;
			}
			cube.clickEvent = function(){
				console.log(cube)
			}
			return cube
		}
		function make_EdgeLine(geometry,position_x,position_y,position_z){
			let edgeline_group = new THREE.Group();
			let edges = new THREE.EdgesGeometry( geometry );
			let material = new THREE.LineBasicMaterial( { color: 0xffffff } )
			let line = new THREE.LineSegments( edges, material );
			let points = [];
			points.push( new THREE.Vector3( 0, position_y, 0 ) );
			points.push( new THREE.Vector3( 0, position_y, -position_z ) );
			let points2 = [];
			points2.push( new THREE.Vector3( 0, position_y, 0 ) );
			points2.push( new THREE.Vector3( position_x, position_y, 0 ) );
			let geometry2 = new THREE.BufferGeometry().setFromPoints( points );
			let geometry3 = new THREE.BufferGeometry().setFromPoints( points2 );
			let line2 = new THREE.Line( geometry2, material );
			let line3 = new THREE.Line( geometry3, material );
			edgeline_group.add(line3)
			edgeline_group.add(line2)
			edgeline_group.add(line)
			return edgeline_group;
		}

		function make_wall(data, boxwidth, boxheight, dst, x_label, z_label, max_value, yaxis_segment, distance_towall=1.5) {
			let wall_group = new THREE.Group();
			{ // 바닥
				let geometry = new THREE.PlaneGeometry(data.length * (boxwidth + dst) + 2*distance_towall,(data[0].length * (boxheight + dst)) + 2*distance_towall);
				let material = new THREE.MeshBasicMaterial( {color: 0xe5ecf6} );
				let plane_bottom = new THREE.Mesh( geometry, material );
				plane_bottom.position.set(
					((data.length - 1) * (boxwidth + dst)) / 2,
					0,
					((data[0].length - 1) * (boxheight + dst)) / 2
				);
				plane_bottom.rotation.x = 1.5* Math.PI;
				
				if (x_label!=null && x_label.length == data[0].length){
					for(let i = 0; i <data[0].length ; i++){
						make_label(x_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(-(data.length)/2)*(boxwidth + dst)-distance_towall-1*x_label[i].length,(boxheight + dst)*(-i+(data[0].length/2)-0.5),0.2);
					}
				};
				if (z_label!=null && z_label.length == data[0].length){
					for(let i = 0; i <data.length ; i++){
						make_label(z_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(boxwidth + dst)*(-i+(data.length/2)-0.5),(-(data[0].length)/2)*(boxheight + dst)-distance_towall-1,0.2,0,0,1.5*Math.PI);
					}
				};
				wall_group.add(plane_bottom);
			}
			

			let width = [(data.length * (boxwidth + dst) + 2*distance_towall),(data[0].length * (boxheight + dst) + 2*distance_towall)];
			let height = (max_value + 2*distance_towall)/yaxis_segment;
			let position_x = [
				((data.length-1)*(boxwidth+dst))/2,
				(-0.5*(boxwidth+dst)-distance_towall),
				((data.length-1)*(boxwidth+dst))/2,
				((data.length-0.5) * (boxwidth + dst)+distance_towall)
			];
			let position_z = [
				(-0.5*(boxheight+dst)-distance_towall),
				((data[0].length-1) * (boxheight + dst))/2,
				((data[0].length -0.5) * (boxheight + dst))+distance_towall,
				((data[0].length-1) * (boxheight + dst))/2
							];
			
			let material = new THREE.MeshBasicMaterial( { color: 0xe5ecf6 } );
			for(let i=0; i<yaxis_segment; i++) {
				make_label(Math.round(((Math.ceil(highestValue,1)/yaxis_segment)*i)).toString(),
					'../examples/helvetiker_regular.typeface.json',wall_group,
					(-0.5*(boxwidth+dst)-distance_towall)-2,((max_value + 2*distance_towall) / yaxis_segment)*i+i*0.1
					,(-0.5*(boxheight+dst)-distance_towall),0,0,0*Math.PI);
				for (let j=0; j<4; j++) {
					let geometry = new THREE.PlaneGeometry(width[j%2],height);
					
					let plane = new THREE.Mesh( geometry, material );
					
					plane.position.set(
						position_x[j],
						((max_value + 2*distance_towall) / yaxis_segment)*(0.5+i)+i*0.1,
						position_z[j]
					);
					plane.rotation.y = 0.5*j*Math.PI;
					console.log(Math.ceil(max_value,1))
					wall_group.add(plane);
				}
			};

			return wall_group
		}
		function auto_color(cur_value){
			let red = Math.round((cur_value/20)*100);
			let color = 'rgb('+String(red)+'%, 40%, 80%)';
			
			return color;

		}

		function make_light(data, boxwidth, boxheight, dst){
			let color = 0xFFFFFF;
			let intensity = 1;
			let light = new THREE.PointLight(color, intensity);
			light.castShadow = true;
			//차트 중앙 위치, 그리고 max_value의 2배 되는 높이에서 뽷
			light.position.set(
				data.length * (boxwidth + dst) * 0.6,
				20 * 2,
				data[0].length * (boxheight + dst) * 0.6
			);
			return light
		}

		function read_array(data, boxwidth, boxheight, boxcolor, dst){
			let box_group = new THREE.Group();
			for (let i = 0; i < (data.length); i++) {
				for (let j = 0; j < data[i].length; j++) {
					box_group.add(make_chart(data[i][j], boxwidth, boxheight, boxcolor, dst, i, j));
				}
			}
			return box_group;
		}

		function make_label(text,font_path='./helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: 0.7,
					height: 0,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: 0x000000} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
				
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}

		

		//리턴시킬 그룹객체
		let group_start = new THREE.Group();
		let normal_data = make_normaldata(data);
		// 벽 그리기
		let wall = make_wall(normal_data, boxwidth, boxheight, dst,x_label,z_label,20, yaxis_segment);
		wall.name="wall";
		group_start.add(wall);
	

		//빛뿌리기
		let light =make_light(normal_data, boxwidth, boxheight, dst);
		light.name="light";
		group_start.add(light);
		
		//그래프 만들기
		let box_group = read_array(normal_data, boxwidth, boxheight, boxcolor, dst);
		box_group.name = "box_group"
		group_start.add(box_group);

		group_start.pushData=function(new_data){ // 리얼타임 데이터
			let noraml_newdata = make_normaldata(new_data);
			let init_arr = normal_data.flat();
			let arr = noraml_newdata.flat();
			if (arr.length == box_group.children.length){ //shape 같을때만 동작
				for (let i = 0; i < (arr.length); i++) {
					box_group.children[i].scale.set(1,(arr[i]/init_arr[i])/2,1)
					box_group.children[i].position.y = (box_group.children[i].geometry.parameters.height * box_group.children[i].scale.y)/2;
				}
			}
		}

		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return box_group;
		}
		
		return group_start;
	}

	donut3Dchart(data,radius=13, thickness=2.5,title=null, label=null, draw_wall=true){
		
		let total_data = data.reduce(function add(sum, currValue) {
			return sum + currValue;
		}, 0);
		function ran_color(){ return "#"+Math.round(Math.random()*0xffffff).toString(16);}

		function make_chart(radius,thickness,color=ran_color(),arc,currentV){
			let geometry = new THREE.TorusGeometry( radius, thickness, 15, 15,arc);
			let material = new THREE.MeshPhongMaterial({color: color, shininess:120})
			let donut = new THREE.Mesh(geometry, material);
			donut.add(make_pannel(geometry,arc,currentV));
			donut.children[0].visible = false;
			donut.pickEvent = function(turn,time){
				if (turn){donut.material.emissive.setHex((time * 5) % 2 > 1 ? 0xC5E908 : 0xFFA701);}
			}
			donut.clickEvent = function(turn){
				donut.children[0].visible = turn;
			}
			return donut
		}
		function make_pannel(geometry,arc,currentV){
			let pannel_group = new THREE.Group();
			let edges = new THREE.EdgesGeometry( geometry, 1 );
			let material = new THREE.LineBasicMaterial( { color: 0xC5E908 } )
			let line = new THREE.LineSegments( edges, material );
			let p_geo = new THREE.PlaneGeometry( 12, 12 );
			let p_mat = new THREE.MeshBasicMaterial( {color: 0xeeeeee, side: 2, transparent:true ,opacity:0} );
			let plane = new THREE.Mesh( p_geo, p_mat );
						
			plane.rotation.y = -1.5*arc/Math.PI
			
			// plane.rotation.y = Math.atan2(this.camera.position.x,this.camera.position.z);
			plane.rotation.x = 0.5*Math.PI
			plane.rotation.z = Math.PI 
			// plane.rotation.z = -arc *0.5* Math.PI
			
			plane.position.set(0,10,-10)
			make_label(Math.round(currentV/total_data * 100,2).toString()+"%",1,0.2,'helvetiker_regular.typeface.json',plane,-5,-4,0.5,0,0,0,0x000000,false);
			make_label("Percentage : ",1,0.2,'helvetiker_regular.typeface.json',plane,-5,-2.5,0.5,0,0,0,0x000000,false);
			make_label(Math.round(currentV).toString(),1,0.2,'helvetiker_regular.typeface.json',plane,-5,-1,0.5,0,0,0,0x000000,false);
			make_label("Current Value : ",1,0.2,'helvetiker_regular.typeface.json',plane,-5,0.5,0.5,0,0,0,0x000000,false);
			make_label(Math.round(total_data).toString(),1,0.2,'helvetiker_regular.typeface.json',plane,-5,2,0.5,0,0,0,0x000000,false);
			make_label("Total Value : ",1,0.2,'helvetiker_regular.typeface.json',plane,-5,3.5,0.5,0,0,0,0x000000,false);
			pannel_group.add(plane)
			pannel_group.add(line)
			return pannel_group;
		}
		
		function make_wall(radius,thickness,distance_towall=7.2,bottom_height=3,cylinder_height=30.0) {
			//벽만들기
			let wall_group = new THREE.Group();
			let geometry = new THREE.CylinderGeometry((radius+2*thickness)+distance_towall,(radius+2*thickness)+distance_towall,bottom_height,32,1);
			let material = new THREE.MeshPhysicalMaterial( {color: 0xdddddd,metalness:0.3,roughness:0.2} );
			let plane_bottom = new THREE.Mesh( geometry, material );
			plane_bottom.position.y = -bottom_height/2
			plane_bottom.receiveShadow = true;
			
			make_label(title,2.2,0.5,'helvetiker_regular.typeface.json',plane_bottom,-1.45*title.length/2,bottom_height/1.7,1.2*radius+2*thickness,1.5*Math.PI,0,0,0xffffff);
			
			if (label && label.length == data.length){
			plane_bottom.add(make_board(2*((radius+2*thickness)+distance_towall)*Math.sin(Math.PI/9),0.6*cylinder_height+bottom_height,((radius+2*thickness)+distance_towall)*0.9))	
			}
			wall_group.add(plane_bottom);

			if (draw_wall){
			let c_geometry = new THREE.CylinderGeometry((radius+2*thickness)+distance_towall,(radius+2*thickness)+distance_towall,cylinder_height,32,1,true);
			let c_material = new THREE.MeshPhysicalMaterial( {color: 0xeeeeee,flatShading:true, side:1 ,metalness:0.3,roughness:0.2} );
			let cylinder = new THREE.Mesh( c_geometry, c_material );
			cylinder.position.y = cylinder_height/2 - bottom_height
			wall_group.add( cylinder );
			}
		
			return wall_group
		}

		function make_board(width,height,distance){
			let geometry = new THREE.PlaneGeometry( width, height );
			let material = new THREE.MeshBasicMaterial( {color: 0xeeeeee, side: 2, transparent:true ,opacity:0} );
			let plane = new THREE.Mesh( geometry, material );
			for (let i=0;i<data.length;i++){
				let sgeometry = new THREE.SphereGeometry( 1,32, 16 );
				// let smaterial = new THREE.MeshBasicMaterial( {color: donut_group.children[i].material.color, side: 2} );
				let splane = new THREE.Mesh( sgeometry, donut_group.children[i].material );
				splane.position.set(-0.3*width,(height/(data.length+1))*(data.length/2-i-0.5),0.1);
				make_label(label[i],1.2,0.2,'helvetiker_regular.typeface.json',splane,0.1*width,-0.5,0);

				plane.add(splane);
			}
			
			plane.position.y = 0.7*height;
			plane.position.z = -distance;
			return plane;
		}

		function make_light(radius,thickness,distance_towall=10){
			let color = 0xFFFFFF;
			let intensity = 0.5;
			let light = new THREE.PointLight(color,intensity);
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			light.position.set(
				0,(radius+thickness)*2+distance_towall,0
			);
			return light
		}

		function read_array(data){
			let donut_group = new THREE.Group();
			let rotate_factor = 0;
			for (let i = 0; i < (data.length); i++) {
				let arc_temp = 2* Math.PI * (data[i]/total_data);
				let donut=make_chart(radius,thickness,ran_color(),arc_temp,data[i])
				donut.rotation.z = rotate_factor;
				donut.rotation.x = 0.5*Math.PI;
				donut.position.y = thickness;
				rotate_factor += arc_temp;
				
				donut_group.add(donut);
				}
			
			return donut_group;
		}

		function make_label(text,fontSize,fontHeight,font_path='helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0,fontColor=0x000000,isshadow=true){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: fontSize,
					height: fontHeight,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: fontColor} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
			if (isshadow) {
				mesh.castShadow = true;}
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}


		
		//리턴시킬 그룹객체
		let group_start = new THREE.Group();
		let donut_group=read_array(data);
		group_start.add(donut_group);
		// 벽 그리기
		
		let wall = make_wall(radius,thickness);
		group_start.add(wall);
		

		let light = make_light(radius,thickness)
		group_start.add(light);
		

		let plane_bot = wall.children[0]
		group_start.Rotate_bot = function(camera){
			let x  = [camera.position.x,camera.position.z];
			plane_bot.rotation.y = Math.atan2(x[0],x[1]);
		}
		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return donut_group;
		}

		return group_start;
	}

	candelStick3Dchart(data, ridius, dst = 1, x_label = null, z_label = null, use_auto_color = true, yaxis_segment = 10, boxcolor='rgb(10%, 40%, 80%)'){
		
		var original_data = data;
		console.log(typeof data)
		let maxRow = data.map(function (row) {
			return Math.max.apply(Math, row);
		});
		let max_value = Math.max.apply(null, maxRow);
		let normal_data = make_normaldata(data);
		let candleData = make_candleData(normal_data);
		console.log(candleData)
		function make_normaldata(data){
			let normal_data = [];
			for (let j = 0; j < data.length; j++) {
					let numbers = data[j];
							
					numbers = numbers.map(v => Math.round(v / (max_value/20)));
					normal_data.push(numbers)
				}
			return normal_data
		}

		function make_candleData(data) {
			let low_list = [];
			for(let i = 0; i <data.length ; i++){
				let start_v = data[i][0];
				let end_v = data[i][data[i].length-1];
				let max_v = Math.max(...data[i]);
				let min_v = Math.min(...data[i]);
				low_list.push([start_v,end_v,max_v,min_v])
			}
			return low_list
		}
		function make_chart(data, ridius, boxcolor, dst, a){
			let candleGroup = new THREE.Group;
			let cylinderLength = data[0] - data[1];
			let stickLength = data[2] - data[3];
			let isReversed=false;
			if (data[0] < data[1]){
				cylinderLength = data[1]-data[0];
				isReversed=true;
			}
			let geometry = new THREE.CylinderGeometry( 
				ridius,ridius,
				cylinderLength,46,20				
			);
			let stickGeometry = new THREE.CylinderGeometry( 
				ridius*0.1,ridius*0.1,
				stickLength,46,20				
			);
			
			if(use_auto_color===true){
				boxcolor = auto_color(isReversed);
			}
			let material = new THREE.MeshPhongMaterial({color: boxcolor})
			let cube = new THREE.Mesh(geometry, material);
			let stickCube = new THREE.Mesh(stickGeometry, material);
			cube.position.x = (ridius + dst) * a;
			cube.position.y = (data[0] + data[1]) / 2
			stickCube.position.x = (ridius + dst) * a;
			stickCube.position.y = (data[2] + data[3]) / 2
			cube.castShadow = true;
			cube.add(make_EdgeLine(geometry,((original_data.length-a)*(ridius + dst)),(data) / 2,(ridius + dst) ));
			cube.children[0].visible = false;
			cube.pickEvent = function(turn=true){
				cube.children[0].visible = turn;
			}
			cube.clickEvent = function(){
				console.log(cube)
			}
			candleGroup.add(cube);
			candleGroup.add(stickCube);
			return candleGroup
		}
		function make_EdgeLine(geometry,position_x,position_y,position_z){
			let edgeline_group = new THREE.Group();
			let edges = new THREE.EdgesGeometry( geometry );
			let material = new THREE.LineBasicMaterial( { color: 0xffffff } )
			let line = new THREE.LineSegments( edges, material );
			let points = [];
			points.push( new THREE.Vector3( 0, position_y, 0 ) );
			points.push( new THREE.Vector3( 0, position_y, -position_z ) );
			let points2 = [];
			points2.push( new THREE.Vector3( 0, position_y, 0 ) );
			points2.push( new THREE.Vector3( position_x, position_y, 0 ) );
			let geometry2 = new THREE.BufferGeometry().setFromPoints( points );
			let geometry3 = new THREE.BufferGeometry().setFromPoints( points2 );
			let line2 = new THREE.Line( geometry2, material );
			let line3 = new THREE.Line( geometry3, material );
			edgeline_group.add(line3)
			edgeline_group.add(line2)
			edgeline_group.add(line)
			return edgeline_group;
		}

		function make_wall(data, ridius, dst, x_label, z_label, max_value, yaxis_segment, distance_towall=3) {
			let wall_group = new THREE.Group();
			{ // 바닥
				let geometry = new THREE.PlaneGeometry(data.length * (ridius + dst) + 2*distance_towall, ridius + 2*distance_towall);
				let material = new THREE.MeshBasicMaterial( {color: 0xcccccc} );
				let plane_bottom = new THREE.Mesh( geometry, material );
				plane_bottom.position.set(
					((data.length - 1) * (ridius + dst)) / 2,
					0,
					ridius / 2
				);
				plane_bottom.rotation.x = 1.5* Math.PI;
				
				if (x_label!=null){
					for(let i = 0; i < 1 ; i++){
						make_label(x_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(-(data.length)/2)*(radius + dst)-distance_towall-2,(radius + dst)*(-i),0.2,0,0,1.5*Math.PI);
					}
				};
				if (z_label!=null && z_label.length == data.length){
					for(let i = 0; i <data.length ; i++){
						make_label(z_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(ridius + dst)*(i+(-data.length/2)-0.5),(-0.5)*(ridius + dst)-distance_towall-1,0.2,0,0,1.3*Math.PI);
					}
				};
				wall_group.add(plane_bottom);
			}
			

			let width = [(data.length * (ridius + dst) + 2*distance_towall),(ridius+ 2*distance_towall)];
			let height = (20)/yaxis_segment;
			let position_x = [
				((data.length-1)*(ridius+dst))/2,
				(-0.5*(ridius+dst)-distance_towall),
				((data.length-1)*(ridius+dst))/2,
				((data.length-0.5) * (ridius + dst)+distance_towall)
			];
			let position_z = [
				(-0.5*(radius)-distance_towall),
				ridius/2,
				((0.5) * ridius)+distance_towall,
				ridius /2
							];
			
			let material = new THREE.MeshBasicMaterial( { color: 0xcccccc } );
			for(let i=0; i<yaxis_segment; i++) {
				let yaxis_label = Math.round(((Math.ceil(max_value,1)/yaxis_segment)*i)).toString();
				make_label(yaxis_label,
					'../examples/helvetiker_regular.typeface.json',wall_group,
					(-0.5*(ridius+dst)-distance_towall)-2-0.3*yaxis_label.length,
					(20 / yaxis_segment)*i+i*0.1,
					(-0.5*(ridius)-distance_towall),
					0,0,0*Math.PI);
				for (let j=0; j<4; j++) {
					let geometry = new THREE.PlaneGeometry(width[j%2],height);
					
					let plane = new THREE.Mesh( geometry, material );
					
					plane.position.set(
						position_x[j],
						(20 / yaxis_segment)*(0.5+i)+i*0.1,
						position_z[j]
					);
					plane.rotation.y = 0.5*j*Math.PI;
					console.log(Math.ceil(max_value,1))
					wall_group.add(plane);
				}
			};

			return wall_group
		}
		function auto_color(isReversed=true){
			let color = 'rgb(255, 23, 23)';
			if (isReversed){
				color = 'rgb(56, 200, 56)';
			}
			
			return color;

		}

		function make_light(data, ridius, dst){
			let color = 0xFFFFFF;
			let intensity = 1;
			let light = new THREE.PointLight(color, intensity);
			light.castShadow = true;
			//차트 중앙 위치, 그리고 max_value의 2배 되는 높이에서 뽷
			light.position.set(
				data.length * (ridius + dst) * 0.6,
				max_value * 2,
				data[0].length * (ridius + dst) * 0.6
			);
			return light
		}

		function read_array(data, ridius, boxcolor, dst){
			let box_group = new THREE.Group();
			for (let i = 0; i < (data.length); i++) {
				box_group.add(make_chart(data[i], ridius, boxcolor, dst, i));
			}
			return box_group;
		}

		function make_label(text,font_path='./helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: 0.7,
					height: 0,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: 0x000000} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
				
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}

		//리턴시킬 그룹객체
		let group_start = new THREE.Group();

		// 벽 그리기
		let wall = make_wall(candleData, ridius, dst,x_label,z_label, max_value, yaxis_segment);
		wall.name="wall";
		group_start.add(wall);
	

		//빛뿌리기
		let light =make_light(candleData, ridius, dst);
		light.name="light";
		group_start.add(light);
		
		//그래프 만들기
		let candle_group = read_array(candleData, ridius, boxcolor, dst);
		candle_group.name = "candle_group"
		group_start.add(candle_group);

		group_start.pushData=function(new_data){ // 리얼타임 데이터
			let init_arr = data.flat();
			let arr = new_data.flat();
			if (arr.length == candle_group.children.length){ //shape 같을때만 동작
				for (let i = 0; i < (arr.length); i++) {
					box_group.children[i].scale.set(1,(arr[i]/init_arr[i])/2,1)
					box_group.children[i].position.y = (box_group.children[i].geometry.parameters.height * box_group.children[i].scale.y)/2;
				}
			}
		}

		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return candle_group;
		}
		
		return group_start;
	}

	timeSeries3Dhart(data,boxwidth, boxheight, dst = 1, x_label = null, z_label = null, use_auto_color = true, yaxis_segment = 10, boxcolor='rgb(10%, 40%, 80%)'){
		var original_data = data;

		let maxRow = data.map(function (row) {
			return Math.max.apply(Math, row);
		});
		let highestValue = Math.max.apply(null, maxRow);

		let minRow = data.map(function (row) {
			return Math.min.apply(Math, row);
		});
		let lowest_value = Math.min.apply(null, minRow);

		function make_normaldata(data){
			let normal_data = [];
			for (let j = 0; j < data.length; j++) {
					let numbers = data[j];
							
					numbers = numbers.map(v => Math.round(v / (highestValue/20)));
					normal_data.push(numbers)
				}
			return normal_data
		}
		
		function initBones() {

			const segmentHeight = boxwidth+dst;
			const segmentCount = data[0].length;
			const height = segmentHeight * segmentCount;
			const halfHeight = height * 0.5;

			const sizing = {
				segmentHeight: segmentHeight,
				segmentCount: segmentCount,
				height: height,
				halfHeight: halfHeight
			};

			const geometry = createGeometry( sizing );
			const bones = createBones( sizing );
			let mesh = createMesh( geometry, bones );

			mesh.scale.multiplyScalar( 1 );
			return mesh;

		}

		function createGeometry( sizing ) {

			const geometry = new THREE.CylinderGeometry(
				1, // radiusTop
				1, // radiusBottom
				sizing.height, // height
				8, // radiusSegments
				sizing.segmentCount * 3, // heightSegments
				false // openEnded
			);

			const position = geometry.attributes.position;

			const vertex = new THREE.Vector3();

			const skinIndices = [];
			const skinWeights = [];

			for ( let i = 0; i < position.count; i ++ ) {

				vertex.fromBufferAttribute( position, i );

				const y = ( vertex.y + sizing.halfHeight );

				const skinIndex = Math.floor( y / sizing.segmentHeight );
				const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

				skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
				skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

			}

			geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
			geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

			return geometry;

		}

		function createBones( sizing ) {

			let bones = [];

			let prevBone = new THREE.Bone();
			bones.push( prevBone );
			prevBone.position.y = - sizing.halfHeight;

			for ( let i = 0; i < sizing.segmentCount; i ++ ) {

				const bone = new THREE.Bone();
				bone.position.x = sizing.segmentHeight;
				bones.push( bone );
				prevBone.add( bone );
				prevBone = bone;

			}

			return bones;

		}

		function createMesh( geometry, bones ) {

			const material = new THREE.MeshPhongMaterial( {
				color: 0x156289,
				emissive: 0x072534,
				side: THREE.DoubleSide,
				
			} );

			const mesh = new THREE.SkinnedMesh( geometry,	material );
			mesh.rotation.z = 0.5*Math.PI;
			mesh.rotation.y = 0.5*Math.PI;
			mesh.position.z = -bones[0].position.y - boxwidth
			mesh.position.y = boxwidth
			const skeleton = new THREE.Skeleton( bones );

			mesh.add( bones[ 0 ] );

			mesh.bind( skeleton );

			return mesh;

		}

		function make_chart(data, boxwidth, boxheight, boxcolor, dst, a, b){
			let geometry = new THREE.BoxGeometry(
				boxwidth,
				data,
				boxheight
			);
			
			if(use_auto_color===true){
				boxcolor = auto_color(data);
			}
			let material = new THREE.MeshPhongMaterial({color: boxcolor})
			let cube = new THREE.Mesh(geometry, material);
			cube.position.x = (boxwidth + dst) * a;
			cube.position.y = (data) / 2
			cube.position.z = (boxheight + dst) * b;
			cube.castShadow = true;
			cube.add(make_EdgeLine(geometry,((original_data.length-a)*(boxheight + dst)),(data) / 2,(boxheight + dst) * (b+1)));
			cube.children[0].visible = false;
			cube.pickEvent = function(turn=true){
				cube.children[0].visible = turn;
			}
			cube.clickEvent = function(){
				console.log(cube)
			}
			return cube
		}
		function make_EdgeLine(geometry,position_x,position_y,position_z){
			let edgeline_group = new THREE.Group();
			let edges = new THREE.EdgesGeometry( geometry );
			let material = new THREE.LineBasicMaterial( { color: 0xffffff } )
			let line = new THREE.LineSegments( edges, material );
			let points = [];
			points.push( new THREE.Vector3( 0, position_y, 0 ) );
			points.push( new THREE.Vector3( 0, position_y, -position_z ) );
			let points2 = [];
			points2.push( new THREE.Vector3( 0, position_y, 0 ) );
			points2.push( new THREE.Vector3( position_x, position_y, 0 ) );
			let geometry2 = new THREE.BufferGeometry().setFromPoints( points );
			let geometry3 = new THREE.BufferGeometry().setFromPoints( points2 );
			let line2 = new THREE.Line( geometry2, material );
			let line3 = new THREE.Line( geometry3, material );
			edgeline_group.add(line3)
			edgeline_group.add(line2)
			edgeline_group.add(line)
			return edgeline_group;
		}

		function make_wall(data, boxwidth, boxheight, dst, x_label, z_label, max_value, yaxis_segment, distance_towall=0) {
			let wall_group = new THREE.Group();
			{ // 바닥
				let geometry = new THREE.PlaneGeometry(data.length * (boxwidth + dst) + 2*distance_towall,(data[0].length * (boxheight + dst)) + 2*distance_towall);
				let material = new THREE.MeshBasicMaterial( {color: 0xe5ecf6} );
				let plane_bottom = new THREE.Mesh( geometry, material );
				plane_bottom.position.set(
					((data.length - 1) * (boxwidth + dst)) / 2,
					0,
					((data[0].length - 1) * (boxheight + dst)) / 2
				);
				plane_bottom.rotation.x = 1.5* Math.PI;
				
				if (x_label!=null && x_label.length == data[0].length){
					for(let i = 0; i <data[0].length ; i++){
						make_label(x_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(-(data.length)/2)*(boxwidth + dst)-distance_towall-1*x_label[i].length,(boxheight + dst)*(-i+(data[0].length/2)-0.5),0.2);
					}
				};
				if (z_label!=null && z_label.length == data[0].length){
					for(let i = 0; i <data.length ; i++){
						make_label(z_label[i],'../examples/helvetiker_regular.typeface.json',plane_bottom,(boxwidth + dst)*(-i+(data.length/2)-0.5),(-(data[0].length)/2)*(boxheight + dst)-distance_towall-1,0.2,0,0,1.5*Math.PI);
					}
				};
				wall_group.add(plane_bottom);
			}
			

			let width = [(data.length * (boxwidth + dst) + 2*distance_towall),(data[0].length * (boxheight + dst) + 2*distance_towall)];
			let height = (max_value + 2*distance_towall)/yaxis_segment;
			let position_x = [
				((data.length-1)*(boxwidth+dst))/2,
				(-0.5*(boxwidth+dst)-distance_towall),
				((data.length-1)*(boxwidth+dst))/2,
				((data.length-0.5) * (boxwidth + dst)+distance_towall)
			];
			let position_z = [
				(-0.5*(boxheight+dst)-distance_towall),
				((data[0].length-1) * (boxheight + dst))/2,
				((data[0].length -0.5) * (boxheight + dst))+distance_towall,
				((data[0].length-1) * (boxheight + dst))/2
							];
			
			let material = new THREE.MeshBasicMaterial( { color: 0xe5ecf6 } );
			for(let i=0; i<yaxis_segment; i++) {
				make_label(Math.round(((Math.ceil(highestValue,1)/yaxis_segment)*i)).toString(),
					'../examples/helvetiker_regular.typeface.json',wall_group,
					(-0.5*(boxwidth+dst)-distance_towall)-2,((max_value + 2*distance_towall) / yaxis_segment)*i+i*0.1
					,(-0.5*(boxheight+dst)-distance_towall),0,0,0*Math.PI);
				for (let j=0; j<4; j++) {
					let geometry = new THREE.PlaneGeometry(width[j%2],height);
					
					let plane = new THREE.Mesh( geometry, material );
					
					plane.position.set(
						position_x[j],
						((max_value + 2*distance_towall) / yaxis_segment)*(0.5+i)+i*0.1,
						position_z[j]
					);
					plane.rotation.y = 0.5*j*Math.PI;
					console.log(Math.ceil(max_value,1))
					wall_group.add(plane);
				}
			};

			return wall_group
		}
		function auto_color(cur_value){
			let red = Math.round((cur_value/20)*100);
			let color = 'rgb('+String(red)+'%, 40%, 80%)';
			
			return color;

		}

		function make_light(data, boxwidth, boxheight, dst){
			let color = 0xFFFFFF;
			let intensity = 1;
			let light = new THREE.PointLight(color, intensity);
			light.castShadow = true;
			//차트 중앙 위치, 그리고 max_value의 2배 되는 높이에서 뽷
			light.position.set(
				data.length * (boxwidth + dst) * 0.6,
				20 * 2,
				data[0].length * (boxheight + dst) * 0.6
			);
			return light
		}

		function read_array(data, boxwidth, boxheight, boxcolor, dst){
			let bone_group = new THREE.Group();
			for (let i = 0; i < (data.length); i++) {
				let bones = initBones()
				bones.position.x = i*(boxwidth+dst)
				bone_group.add(bones);
			}
			return bone_group;
		}

		function make_label(text,font_path='./helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: 0.7,
					height: 0,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: 0x000000} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
				
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}
		// 애니메이션 클립 만들어줘야함
		function read_array_position(data){
			let start = 0;
			for (let i = 0; i < (data.length); i++) {
				for (let j = 0; j < (data[0].length); j++) {
					if (j<2){
						bone_group.children[i].skeleton.bones[j].position.x = normal_data[i][j];	
					}else{
					bone_group.children[i].skeleton.bones[j].position.x += normal_data[i][j] - normal_data[i][j-1];}
					console.log(normal_data[i][j])
				}
			}
		}
		

		//리턴시킬 그룹객체
		let group_start = new THREE.Group();
		let normal_data = make_normaldata(data);
		// 벽 그리기
		let wall = make_wall(normal_data, boxwidth, boxheight, dst,x_label,z_label,20, yaxis_segment);
		wall.name="wall";
		group_start.add(wall);
	

		//빛뿌리기
		let light =make_light(normal_data, boxwidth, boxheight, dst);
		light.name="light";
		group_start.add(light);
		
		//그래프 만들기
		let bone_group = read_array(normal_data, boxwidth, boxheight, boxcolor, dst);
		bone_group.name = "bone_group"
		group_start.add(bone_group);
		
		read_array_position(normal_data)
		console.log(bone_group.children[0].skeleton.bones)
		group_start.pushData=function(new_data){ // 리얼타임 데이터
			let noraml_newdata = make_normaldata(new_data);
			let init_arr = normal_data.flat();
			let arr = noraml_newdata.flat();
			if (arr.length == box_group.children.length){ //shape 같을때만 동작
				for (let i = 0; i < (arr.length); i++) {
					box_group.children[i].scale.set(1,(arr[i]/init_arr[i])/2,1)
					box_group.children[i].position.y = (box_group.children[i].geometry.parameters.height * box_group.children[i].scale.y)/2;
				}
			}
		}

		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return box_group;
		}
		
		return group_start;
	}
}