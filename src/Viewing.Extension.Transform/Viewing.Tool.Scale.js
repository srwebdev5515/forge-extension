import EventsEmitter from 'EventsEmitter'
import * as lodash from 'lodash'

export default class ScaleTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.active = false

    this._viewer = viewer
  
    this._hitPoint = null
  
    this._isDragging = false

    this.fullTransform = false
  
    this._transformMesh = null

    this._transformControlTx = null

    this._selectedFragProxyMap = {}

    this.onTxChange =
      this.onTxChange.bind(this)

    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this)

    this.onCameraChanged =
      this.onCameraChanged.bind(this)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ["Viewing.Scale.Tool"]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return "Viewing.Scale.Tool"
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates a dummy mesh to attach control to
  //
  ///////////////////////////////////////////////////////////////////////////
  createTransformMesh() {

    var material = new THREE.MeshPhongMaterial(
      { color: 0xff0000 })

    this._viewer.impl.matman().addMaterial(
      'scale-tool-material',
      material,
      true)

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.0001, 5),
      material)

    sphere.position.set(0, 0, 0)

    return sphere
  }

  ///////////////////////////////////////////////////////////////////////////
  // on translation change
  //
  ///////////////////////////////////////////////////////////////////////////
  onTxChange() {

    if(this._isDragging && this._transformControlTx.visible) {

      const firstFragProxy =  this._selectedFragProxyMap[this._selection.fragIdsArray[0]];
      var zoomFactor = new THREE.Vector3(
        firstFragProxy.startScale.x + (this._transformMesh.position.x - firstFragProxy.hitPoint.x) / 1000,
        firstFragProxy.startScale.y + (this._transformMesh.position.y - firstFragProxy.hitPoint.y) / 1000,
        firstFragProxy.startScale.z + (this._transformMesh.position.z - firstFragProxy.hitPoint.z) / 1000
      )
      this._transformControlTx.setPosition(firstFragProxy.hitPoint);

      for(var fragId in this._selectedFragProxyMap) {

        var fragProxy = this._selectedFragProxyMap[fragId]

        fragProxy.getAnimTransform()

        fragProxy.scale = zoomFactor

        var position = new THREE.Vector3(
          fragProxy.hitPoint.x - (fragProxy.hitPoint.x - fragProxy.startPosition.x) * zoomFactor.x,
          fragProxy.hitPoint.y - (fragProxy.hitPoint.y - fragProxy.startPosition.y) * zoomFactor.y,
          fragProxy.hitPoint.z - (fragProxy.hitPoint.z - fragProxy.startPosition.z) * zoomFactor.z
        )

        fragProxy.position = position

        fragProxy.updateAnimTransform()
      }

      this.emit('transform.scale', {
        model: this._selection.model,
        zoomFactor
      })
    }

    this._viewer.impl.sceneUpdated(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  // on camera changed
  //
  ///////////////////////////////////////////////////////////////////////////
  onCameraChanged() {

    if(this._transformControlTx) {

      this._transformControlTx.update()
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // item selected callback
  //
  ///////////////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged(event) {

    if(selectionStatus.movable && event.selections && event.selections.length) {

      this._selection = event.selections[0]

      let dbids = []
      this._selection.dbIdArray.forEach(dbId => {
        dbids = dbids.concat(lodash.uniq(
          Object.keys(cachedForgeItemsMap).map(id => cachedForgeItemsMap[id]).filter(item => item.name == cachedForgeItemsMap[dbId].name).map(item => item.dbId))
        )
      })
      this._selection.dbIdArray = dbids;
      
      let fragIds = []
      this._selection.dbIdArray.forEach(dbId => {
        fragIds = fragIds.concat(forge.getFragIdsOfDbId(dbId))
      })
      this._selection.fragIdsArray = fragIds

      this.emit('transform.modelSelected',
        this._selection)
      
      this.initializeSelection()
    }
    else {

      this.clearSelection()
    }
  }

  geWorldBoundingBox (fragIds, fragList) {

    var fragbBox = new THREE.Box3()
    var nodebBox = new THREE.Box3()

    fragIds.forEach((fragId) => {

      fragList.getWorldBounds(fragId, fragbBox)
      nodebBox.union(fragbBox)
    })

    return nodebBox
  }

  initializeSelection () {

    this._selectedFragProxyMap = {}

    this._transformControlTx.visible = true
    
    var bBox = this.geWorldBoundingBox(
      this._selection.fragIdsArray,
      this._selection.model.getFragmentList())

    const center = new THREE.Vector3(
      (bBox.min.x + bBox.max.x) / 2,
      (bBox.min.y + bBox.max.y) / 2,
      (bBox.min.z + bBox.max.z) / 2)

    this._transformControlTx.setPosition(
      center)

    this._transformControlTx.addEventListener(
      'change', this.onTxChange)

    this._viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    this._selection.fragIdsArray.forEach((fragId)=> {

      var fragProxy = this._viewer.impl.getFragmentProxy(
        this._selection.model,
        fragId)

      fragProxy.getAnimTransform()

      fragProxy.hitPoint = center

      fragProxy.startPosition = {
        x: ( fragProxy.position.x - center.x * (1 - fragProxy.scale.x) ) /  fragProxy.scale.x,
        y: ( fragProxy.position.y - center.y * (1 - fragProxy.scale.y) ) /  fragProxy.scale.y,
        z: ( fragProxy.position.z - center.z * (1 - fragProxy.scale.z) ) /  fragProxy.scale.z,
      }
      
      fragProxy.startScale = {
        x: fragProxy.scale.x,
        y: fragProxy.scale.y,
        z: fragProxy.scale.z
      }

      this._selectedFragProxyMap[fragId] = fragProxy
    })
  }

  clearSelection () {

    if(this.active) {

      this._selection = null

      this._selectedFragProxyMap = {}

      this._transformControlTx.visible = false

      this._transformControlTx.removeEventListener(
        'change', this.onTxChange)

      this._viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this._viewer.impl.sceneUpdated(true)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize(screenPoint) {

    var viewport = this._viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }

    return n
  }

  ///////////////////////////////////////////////////////////////////////////
  // get 3d hit point on mesh
  //
  ///////////////////////////////////////////////////////////////////////////
  getHitPoint(event) {

    var screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    var n = this.normalize(screenPoint)

    var hitPoint = this._viewer.utilities.getHitPoint(n.x, n.y)

    return hitPoint
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activate() {

    if(!this.active) {

      this.active = true

      this._viewer.select([])

      var bbox = this._viewer.model.getBoundingBox()

      this._viewer.impl.createOverlayScene(
        'ScaleToolOverlay')

      this._transformControlTx = new THREE.TransformControls(
        this._viewer.impl.camera,
        this._viewer.impl.canvas,
        "scale")

      this._transformControlTx.setSize(
        bbox.getBoundingSphere().radius * 5)

      this._transformControlTx.visible = false

      this._viewer.impl.addOverlay(
        'ScaleToolOverlay',
        this._transformControlTx)

      this._transformMesh = this.createTransformMesh()

      this._transformControlTx.attach(
        this._transformMesh)

      this._viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate() {

    if(this.active) {

      this.active = false

      this._viewer.impl.removeOverlay(
        'ScaleToolOverlay',
        this._transformControlTx)

      this._transformControlTx.removeEventListener(
        'change',
        this.onTxChange)

      this._viewer.impl.removeOverlayScene(
        'ScaleToolOverlay')

      this._viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this._viewer.removeEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonDown(event, button) {

    this._hitPoint = this.getHitPoint(event)

    this._isDragging = true

    if (this._transformControlTx.onPointerDown(event))
      return true

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonUp(event, button) {

    this._isDragging = false
    
    if (this._transformControlTx.visible && this._selection) {

      for(var fragId in this._selectedFragProxyMap) {

        const fragProxy = this._selectedFragProxyMap[fragId];

        fragProxy.startScale = {
          x: fragProxy.scale.x,
          y: fragProxy.scale.y,
          z: fragProxy.scale.z
        }

        // fragProxy.startPosition = {
        //   x: fragProxy.position.x,
        //   y: fragProxy.position.y,
        //   z: fragProxy.position.z
        // }

      }
    }

    if (this._transformControlTx.onPointerUp(event))
      return true

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleMouseMove(event) {

    if (this._isDragging) {

      if (this._transformControlTx.onPointerMove(event) ) {

        return true
      }

      return false
    }

    if (this._transformControlTx.onPointerHover(event))
      return true

    return false
  }
}
