class Camera{
    constructor(){
        this.fov = 60;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,1]);
        this.up = new Vector3([0,1,0]);

        this.direction = new Float32Array([0,0,0]);
        this.move = new Float32Array([0,0,0]); //x, y & z rotation, 
        this.rot = new Float32Array([0,0,0]);
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

    update(){
        var forward = this.forward();
        var right = this.right(forward);
        var dist = this.distance();

        if (this.rot[0] != 0){ //x rotation
            var dir = right.sub(forward).norm();
            forward.add(dir.mul(1*this.rot[0])).norm();
            this.at = new Vector3().set(this.eye);
            this.at.add(forward.mul(dist));
            console.log(this.at.elements);
        }
    }

}
