class Camera{
    constructor(){
        this.fov = 60;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,1]);
        this.up = new Vector3([0,1,0]);

        this.direction = new Float32Array([0,0,0]);
        this.move = new Float32Array([0,0,0]); //x, y & z rotation, 
    }


}