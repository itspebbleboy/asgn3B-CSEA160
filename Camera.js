class Camera{
    constructor(){
        this.fov = 60;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,1]);
        this.up = new Vector3([0,1,0]);
        this.moveSpeed = .1;
        this.rotateSpeed = 0.0078125;
        this.direction = new Float32Array([0,0,0]);
        this.move = new Float32Array([0,0,0]); // x, y & z movement, move[0] = x, move[2] = z
        this.rot = new Float32Array([0,0,0]);  //x, y & z rotation, 
    }

    update(){
        var newMS = this.moveSpeed * 6; //new Move Speed, currently not based on FPS
        var newRS = this.rotateSpeed * 6; //new Rotation Speed, currently not based on FPS

        var forward = this.forward();
        var right = this.right(forward);


        let moveDist = forward.mul(this.move[2]* newMS); // z calculations
        moveDist.add(right.mul(this.move[0]*newMS)); // x calculations

        this.eye.add(moveDist);
        this.at.add(moveDist);

        //reset forward & right
        forward = this.forward();
        right = this.right(forward);
        var dist = this.distance();

        if (this.rot[0] != 0){ //x rotation
            var dir = right.sub(forward).norm();
            console.log( " dir multiplication: " + dir.mul(newRS*this.rot[0]).elements + " & forward: " + forward.elements);
            //forward.add(dir.mul(newRS*this.rot[0])).norm();
            console.log( " dir mult + forward: " + forward.add(dir.mul(newRS*this.rot[0])));
            console.log("normalized: " + forward.norm());
            this.at = new Vector3().set(this.eye);
            this.at.add(forward.mul(dist));
            console.log(this.at.elements);
        }
    }

    right(forward){
        if(forward == undefined){
            forward = this.forward();
        }
        var right = Vector3.cross(forward, this.up);
        return right.norm();
    }

    forward(){
        var forward = new Vector3().set(this.at);
        forward.sub(this.eye);
        return forward.norm();
    }

    distance(){
        var dist = new Vector3().set(this.at);
        dist.sub(this.eye);
        return dist.mag();
    }

}
