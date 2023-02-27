export default class Controller{
  #view
  #service
  #worker
  #blinkCounter = 0
  #camera
  constructor ({view, worker, camera}){
    this.#view = view
    this.#worker = this.#configureWorker(worker)
    this.#camera = camera

    this.#view.configureOnBtnClick(this.onBtnStart.bind(this)) //Ao passar bind(this), garante que o this chamado dentro de onBtnStart se refere ao Controller e não a view
  }

  static async initialize(deps){
    const controller = new Controller(deps)
    controller.log('not yet detecting eye blink! click in the button to start')
    return controller.init()
  }
  
  async init(){
  }

  #configureWorker(worker){
    let ready = false
    worker.onmessage = ({ data }) => {
      if(data === 'READY'){
        console.log('Worker is ready!')
        this.#view.enableButton()
        ready = true
        return;
      }

      const blinked = data.blinked
      this.#blinkCounter += blinked
      this.#view.togglePlayVideo()
    }
    return {
      send (msg){
        if(!ready) return;
        worker.postMessage(msg)
      }
    }
  }

  loop(){
    const video = this.#camera.video
    const img = this.#view.getVideoFrame(video)
    this.#worker.send(img)
    this.log(`Detecting eye blink...`)

    setTimeout(() => this.loop(), 100)
  }

  log(text) {
    const times = `   - blinked times: ${this.#blinkCounter}`
    this.#view.log(`status: ${text}`.concat(this.#blinkCounter ? times: ""))
  }

  onBtnStart(){
    this.log('Initializing detection...')
    this.#blinkCounter = 0
    this.loop()
  }
}