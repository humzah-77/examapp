<script>
	let lock = false;
  let light = false;
  let check = false;
  let next = false;
  let done = false;
  let lighton; //variables to control arduino widgets 
  let lightoff;
  let nexton;
  let nextoff;
  let doneon;
  let doneoff;
  let checkon;
  let checkoff;
  let lockon;
  let message;
  async function openlock(){
    let lockon = await fetch("./openlock")//call api to open lock
    
  }
  async function lightson(){
    let lockon = await fetch("./lighton")//call api to turn on lights 
  }
  async function lightsoff(){
    let lockon = await fetch("./lightoff")//call api to turn off lights
  }

  async function checkson(){
    let lockon = await fetch("./oncheck")//call api to set messenger into check mode
  }
  async function checksoff(){
    let lockon = await fetch("./offcheck")//call api to set messenger out of check mode
  }
  async function nextson(){
    let lockon = await fetch("./onnext")//call api to check next message 
  }
  async function nextsoff(){
    let lockon = await fetch("./offnext")//call api to lock next message 
  }
  async function doneson(){
    let lockon = await fetch("./ondone")//call api to clear messenger
  }
  async function donesoff(){
    let lockon = await fetch("./offdone")//call api to cancel messenger clear
  }
  async function messengers(){
    let lockon = await fetch("./message?message=${message}")//call api to write to messenger
  }
  
  function messenger() {
		messengers();
	}
  function locks() {
		openlock();
	}
  function lights() {
    if (light){
      lightson();
    }
    else{
      lightsoff();
    }
	}
  function nexts() {
		if(next){
      nextson();
    }
    else{
      nextsoff();
    }
	}
  function dones() {
		if(done){
      doneson();
    }
    else{
      donesoff();
    }
	}
  function checks() {
		if(check){
      checkson();
    }
    else{
      checksoff()
    }
	}
</script>

<main>
  <h1 style="text-align:center; color:white; font-size:100px;">DashBoard</h1>

  <div class="grid-container center" style="width:70%;">
    <div class="grid-item" style="border: 3px solid #a020f066;">
      <h1>Lock</h1>
      <button class="buttons" on:click|preventDefault={locks}>
      </button>

    </div>
    <div class="grid-item" style="border: 3px solid #a020f066;">
      <h1>Lights</h1>
      <label class="switch">
        <input type="checkbox" bind:checked={light} on:change|preventDefault={lights}/>
        <span class="slider" />
      </label>
    </div> 
  </div><br><br>
  <div class="grid-container1 center" style="width:60%;">
     <div class="grid-item" style="border: 3px solid #a020f066;">
      <h1>Messenger</h1>
      <div class="center">
        <form on:submit|preventDefault={messenger}>
          <textarea id="myTextarea" style="width:80%; height:100px; background-color:white; color:black;"></textarea><br><br>
          <button type="submit" style="height:35px; border-radius:100px; background-color:#a020f066; color:white;">
            Send message to screen
          </button>
        </form>
      </div><br><br>
      <div class="grid-container2 center" style="width:70%;">
        <div class="grid-item" style="border: 3px solid #a020f066;">
          <h3>Next</h3>
          <label class="switch">
            <input type="checkbox" bind:checked={next} on:change|preventDefault={nexts}/>
            <span class="slider" />
          </label>
        </div> 
        <div class="grid-item" style="border: 3px solid #a020f066;">
          <h3>Check</h3>
          <label class="switch">
            <input type="checkbox" bind:checked={check} on:change|preventDefault={checks}/>
            <span class="slider" />
          </label>
        </div> 
        <div class="grid-item" style="border: 3px solid #a020f066;">
          <h3>Done</h3>
          <label class="switch">
            <input type="checkbox" bind:checked={done} on:change|preventDefault={dones}/>
            <span class="slider" />
          </label>
        </div> 
      </div>
    </div>
  </div>
</main>

<style>
  .grid-container {
  display: grid;
  column-gap: 30px;
  row-gap: 30px;
  grid-template-columns: auto auto;
  padding: 10px;
}

.grid-container1 {
  display: grid;
  column-gap: 30px;
  row-gap: 30px;
  grid-template-columns: auto;
  padding: 10px;
}
.grid-container2 {
  display: grid;
  column-gap: 30px;
  row-gap: 30px;
  grid-template-columns: auto auto auto;
  padding: 10px;
}

.grid-item {
  background-color: rgba(160, 32, 240, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.8);
  padding: 20px;
  font-size: 30px;
  text-align: center;
}
.center{
  margin: auto;
  width: 60%;
  border: 2px solid #a020f066;
  padding: 10px;
}
.buttons{
  background-color:#ccc; 
  border-radius:500%; 
  width:75px; 
  height:75px;
}
.buttons:active{
  background-color:#2196f3;
}
.switch {
      position: relative;
      display: inline-block;
      width: 80px;
      height: 44px;
    }
  
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 34px;
    }
  
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 9px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }
  
    input:checked + .slider {
      background-color: #2196f3;
    }
  
    input:checked + .slider {
      box-shadow: 0 0 1px #2196f3;
    }
  
    input:checked + .slider:before {
      -webkit-transform: translateX(46px);
      -ms-transform: translateX(46px);
      transform: translateX(46px);}
</style>
