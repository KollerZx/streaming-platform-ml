export default class HandGestureService {
  #gestureEstimator
  #handPoseDetection
  #handsVersion
  #detector = null
  #gestureStrings
  constructor({
    fingerpose,
    handPoseDetection,
    handsVersion,
    knownGestures,
    gestureStrings
  }) {
    this.#handPoseDetection = handPoseDetection
    this.#handsVersion = handsVersion
    this.#gestureStrings = gestureStrings
    this.#gestureEstimator = new fingerpose.GestureEstimator(knownGestures)
  }


  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandMarksFromKeypoints(keypoints3D),
      //Porcentagem de confiança do gesto
      9
    )

    return predictions.gestures
  }

  async * detectGestures(predictions) {
    for (const hand of predictions) {
      if (!hand.keypoints3D) continue
      const gestures = await this.estimate(hand.keypoints3D)
      if (!gestures.length) continue
      const result = gestures.reduce(
        (previous, current) => (previous.score > current.score) ? previous : current)


      // Identifica a coordenada onde se encontra a ponta do dedo indicador na tela
      const { x, y } = hand.keypoints.find(keypoint => keypoint.name === 'index_finger_tip')

      yield { event: result.name, x, y, handedness: hand.handedness }
      // console.log('detected', this.#gestureStrings[result.name])
    }

  }

  #getLandMarksFromKeypoints(keypoints3D) {
    return keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
  }

  async estimateHands(video) {
    return this.#detector.estimateHands(video, {
      flipHorizontal: true
    })
  }

  async initializeDetector() {
    // console.log('detector', this.#detector)
    if (this.#detector) return this.#detector

    const detectorConfig = {
      runtime: 'mediapipe', // or 'tfjs'
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
      // full -> mais preciso, porém, mais pesado
      modelType: 'lite',
      maxHands: 2,

    }

    this.#detector = await this.#handPoseDetection.createDetector(
      this.#handPoseDetection.SupportedModels.MediaPipeHands,
      detectorConfig
    );
    this.#detector.width = window.screen.width
    this.#detector.height = window.screen.height

    return this.#detector
  }
}