const DESLOCAMENTO = 500

export default class HandGestureView {
  #handsCanvas = document.querySelector('#hands')
  #canvasContext = this.#handsCanvas.getContext('2d')
  #fingerLookupIndexes
  #styler
  constructor({ fingerLookupIndexes, styler }) {
    this.#fingerLookupIndexes = fingerLookupIndexes
    this.#handsCanvas.width = window.screen.width
    this.#handsCanvas.height = window.screen.height
    this.#styler = styler
    setTimeout(() => styler.loadDocumentStyles(), 200)
  }

  clear() {
    this.#canvasContext.clearRect(0, 0, this.#handsCanvas.width, this.#handsCanvas.height)
  }
  drawCtx(video) {
    this.#canvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  }

  drawResults(hands) {
    for (const { keypoints, handedness } of hands) {
      if (!keypoints) continue
      this.#canvasContext.fillStyle = handedness === "Left" ? "red" : "green"
      this.#canvasContext.strokeStyle = "white"
      this.#canvasContext.lineWidth = 8
      this.#canvasContext.lineJoin = "round"

      this.#drawJoints(keypoints)

      this.#drawFingersAndHoverElements(keypoints, handedness)
    }
  }

  clickOnElement(x, y) {
    const element = document.elementFromPoint(x, y)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y
    })

    element.dispatchEvent(event)
  }

  #drawJoints(keypoints) {
    for (const { x, y } of keypoints) {
      this.#canvasContext.beginPath()
      const newX = x - 2
      const newY = y - 2
      const radius = 3
      const startAngle = 0
      const endAngle = 2 * Math.PI

      this.#canvasContext.arc(newX, newY, radius, startAngle, endAngle)
      this.#canvasContext.fill()
    }
  }

  #drawFingersAndHoverElements(keypoints, hands) {
    const fingers = Object.keys(this.#fingerLookupIndexes)

    for (const finger of fingers) {
      const points = this.#fingerLookupIndexes[finger].map(
        index => keypoints[index]
      )

      const region = new Path2D()
      // [0] wrist (palma da mão)
      const [{ x, y }] = points
      region.moveTo(x, y)

      for (const point of points) {
        region.lineTo(point.x, point.y)
      }
      this.#canvasContext.stroke(region)
      if (hands === "Right") {
        this.#hoverElements(finger, points)
        continue
      }
    }
  }

  #hoverElements(finger, points) {
    if (finger !== "indexFinger") return
    const tip = points.find(item => item.name === "index_finger_tip")

    const element = document.elementFromPoint(tip.x, tip.y)
    if (!element) return
    const hover = () => this.#styler.toggleStyle(element, ':hover')
    hover()
    setTimeout(() => hover(), 500)
  }

  loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top) {
    scroll({
      top,
      behavior: "smooth"
    })
  }


}