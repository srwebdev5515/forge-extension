/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CSSTVExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import TranslateTool from './Viewing.Tool.Translate'
import RotateTool from './Viewing.Tool.Rotate'
import ScaleTool from './Viewing.Tool.Scale'

import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class TransformExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)

    this.translateTool = new TranslateTool(viewer)

    this._viewer.toolController.registerTool(
      this.translateTool)

    this.rotateTool = new RotateTool(viewer)

    this._viewer.toolController.registerTool(
      this.rotateTool)

    this.scaleTool = new ScaleTool(viewer)

    this._viewer.toolController.registerTool(
      this.scaleTool)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Transform'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this._txControl = ViewerToolkit.createButton(
      'toolbar-translate',
      'fa fa-arrows-alt',
      'Translate Tool', () => {

        var txTool = this.translateTool.getName()
        var rxTool = this.rotateTool.getName()
        var scTool = this.scaleTool.getName()

        if (this.translateTool.active) {

          this._viewer.toolController.deactivateTool(txTool)

        } else {

          this._viewer.toolController.activateTool(txTool)
          this._viewer.toolController.deactivateTool(rxTool)
          this._viewer.toolController.deactivateTool(scTool)

          if (this.aggregateSelectedEvent) {
            // this.translateTool.onAggregateSelectionChanged(this.aggregateSelectedEvent)
          }

        }
      })

    this._rxControl = ViewerToolkit.createButton(
      'toolbar-rotate',
      'fas fa-sync',
      'Rotate Tool', () => {

        var txTool = this.translateTool.getName()
        var rxTool = this.rotateTool.getName()
        var scTool = this.scaleTool.getName()

        if (this.rotateTool.active) {

          this._viewer.toolController.deactivateTool(rxTool)

        } else {

          this._viewer.toolController.activateTool(rxTool)
          this._viewer.toolController.deactivateTool(txTool)
          this._viewer.toolController.deactivateTool(scTool)
          
          if (this.aggregateSelectedEvent) {
            // this.rotateTool.onAggregateSelectionChanged(this.aggregateSelectedEvent)
          }

        }
      })

    this._scControl = ViewerToolkit.createButton(
      'toolbar-scale',
      'fas fa-expand',
      'Scale Tool', () => {

        var txTool = this.translateTool.getName()
        var rxTool = this.rotateTool.getName()
        var scTool = this.scaleTool.getName()

        if (this.scaleTool.active) {

          this._viewer.toolController.deactivateTool(scTool)

        } else {

          this._viewer.toolController.activateTool(scTool)
          this._viewer.toolController.deactivateTool(txTool)
          this._viewer.toolController.deactivateTool(rxTool)

          if (this.aggregateSelectedEvent) {
            // this.scaleTool.onAggregateSelectionChanged(this.aggregateSelectedEvent)
          }
          
        }
      })

    this.parentControl = this._options.parentControl

    if (!this.parentControl) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'transform')

      viewerToolbar.addControl(this.parentControl)
    }

    this.parentControl.addControl(this._txControl)
    this.parentControl.addControl(this._rxControl)
    this.parentControl.addControl(this._scControl)

    console.log('Viewing.Extension.Transform loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.parentControl.removeControl(
      this._comboCtrl)

    this._viewer.toolController.deactivateTool(
      this.translateTool.getName())

    this._viewer.toolController.deactivateTool(
      this.rotateTool.getName())

    console.log('Viewing.Extension.Transform unloaded')
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  TransformExtension.ExtensionId,
  TransformExtension)


//function createRadioButton() {
//
//  var viewerToolbar = _viewer.getToolbar(true);
//
//  var modelTools = viewerToolbar.getControl(
//    Autodesk.Viewing.TOOLBAR.MODELTOOLSID);
//
//  var radio = new Autodesk.Viewing.UI.RadioButtonGroup(
//    "Autodesk.ADN.Viewing.Extension.Toolbar.Radio");
//
//  radio.addClass('toolbar-vertical-group');
//
//  var radioBtn1 = createButton(
//    'Autodesk.ADN.Viewing.Extension.Toolbar.RadioBtn1',
//    'url(img/adsk/adsk-24x24-32.png)',
//    'Radio button1',
//    function(e) {
//      alert("I'm a radio button!");
//    });
//
//  var radioBtn2 = createButton(
//    'Autodesk.ADN.Viewing.Extension.Toolbar.RadioBtn2',
//    'url(img/adsk/adsk-24x24-32.png)',
//    'Radio button2',
//    function(e) {
//      alert("I'm another radio button!");
//    });
//
//  radio.addControl(radioBtn1);
//  radio.addControl(radioBtn2);
//
//  modelTools.addControl(radio);
//}
