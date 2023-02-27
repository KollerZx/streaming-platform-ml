export default class Controller{
  #view
  #service
  #worker
  constructor ({view, service, worker}){
    this.#view = view
    this.#service = service
    this.#worker = this.#configureWorker(worker)

    this.#view.configureOnBtnClick(this.onBtnStart.bind(this)) //Ao passar bind(this), garante que o this chamado dentro de onBtnStart se refere ao Controller e não a view
  }

  static async initialize(deps){
    const controller = new Controller(deps)
    controller.log('not yet detecting eye blink! click in the button to start')
    return controller.init()
  }

  #configureWorker(worker){
    worker.onmessage = (msg) => {
      if(msg.data === 'READY'){
        this.#view.enableButton()
        return;
      }
    }
    return worker
  }
  async init(){
    console.log('init')
  }

  log(text) {
    this.#view.log(`logger: ${text}`)
  }

  onBtnStart(){
    this.log('Initializing detection...')
  }
}