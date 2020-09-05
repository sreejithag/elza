import React from 'react'
import Downloads from '../Downloads'
import './main.css'
import bingImg from '../../../assets/images/icons8-bing-96.png'
import googleImg from '../../../assets/images/icons8-google-96.png'
import duckImg from '../../../assets/images/icons8-duckduckgo-96.png'
import ecosiaImg from '../../../assets/images/ecosia.png'
import yahooImg from '../../../assets/images/yahoo-icon.png'
import yandexImg from '../../../assets/images/yandex-icon.png'
import qwantImg from '../../../assets/images/qwant-icon.png'

const { dialog } = window.require('electron').remote
const { ipcRenderer } = window.require('electron')
const remote = window.require('electron').remote
const app = remote.app
const configFilePath = app.getPath('userData') + '/preferences.json'
const fs = window.require('fs')

class BlankTab extends React.Component {
  constructor (props) {
    super(props)
    console.log(props)
    this.state = {
      pref: {
        searchEngine: 'google',
        downloadLocation: app.getPath('downloads')
      },
      active: 'settings',
      version: ''
    }
  }
  privateToggleChange = e => {
    let pref = this.state.pref
    pref.privateMode = !pref.privateMode
    this.setState({ pref })
  }
  searchEngineSelector = e => {
    let pref = this.state.pref
    pref.searchEngine = e
    this.setState({ pref }, this.savePreference)
  }
  componentWillMount () {
    try {
      if (fs.existsSync(configFilePath)) {
        let cfile = window.require(configFilePath)
        console.log(cfile)
        if (cfile.privateMode) this.toggleCheck = true
        this.setState({ pref: cfile })
      }
    } catch (err) {
      console.error(err)
    }
    ipcRenderer.send('app_version')
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version')
      this.setState({ version: arg.version })
    })
  }
  savePreference = () => {
    console.log(this.state.pref)
    fs.writeFile(configFilePath, JSON.stringify(this.state.pref), err => {
      if (err) throw err
      console.log('Saved!', this.state.pref)
    })
    this.props.handleSearchEngineChange(this.state.pref.searchEngine)
  }
  selectDownloadLocation = async () => {
    let pref = this.state.pref
    let path = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    pref.downloadLocation = path.filePaths[0]
    ipcRenderer.send('change_download_setting', pref)
    this.setState({ pref }, this.savePreference)
  }
  render () {
    return (
      <div className='settings-container h-100 pt-2'>
        <div className='row'>
          <div className='col-sm-3 pt-3'>
            <div className='pl-4'>
              <p
                className={
                  this.state.active === 'settings' ? 'h3 mt-1' : 'mt-1'
                }
                onClick={() => {
                  this.setState({ active: 'settings' })
                }}
                role='button'
              >
                Settings
              </p>
              <p
                className={
                  this.state.active === 'downloads' ? 'h3 mt-3' : 'mt-3'
                }
                onClick={() => {
                  this.setState({ active: 'downloads' })
                }}
                role='button'
              >
                Downloads
              </p>
              <p
                className={this.state.active === 'about' ? 'h3 mt-3' : 'mt-3'}
                onClick={() => {
                  this.setState({ active: 'about' })
                }}
                role='button'
              >
                About
              </p>
            </div>
          </div>
          <div
            className={
              this.state.active === 'settings' ? 'col-sm-9 pt-3' : 'd-none'
            }
          >
            <h4>Search engine</h4>
            <div className='settings-search-engine-list-ctr'>
              <div className='p-1 mr-3'>
                <div className='settings-search-engine-list pt-3'>
                  <img
                    className={
                      this.state.pref.searchEngine === 'ddg' ? 'active' : null
                    }
                    onClick={() => this.searchEngineSelector('ddg')}
                    title='DuckDuckGo'
                    src={duckImg}
                    alt='DuckDuckGo'
                  />
                  <img
                    className={
                      this.state.pref.searchEngine === 'ecosia'
                        ? 'active'
                        : null
                    }
                    onClick={() => this.searchEngineSelector('ecosia')}
                    title='Ecosia'
                    src={ecosiaImg}
                    alt='Ecosia'
                  />
                  <img
                    className={
                      this.state.pref.searchEngine === 'google'
                        ? 'active'
                        : null
                    }
                    onClick={() => this.searchEngineSelector('google')}
                    title='google'
                    src={googleImg}
                    alt='Google'
                  />
                </div>
              </div>
              <div className='ml-3 p-1'>
                <div className='settings-search-engine-list pt-3'>
                  <img
                    className={
                      this.state.pref.searchEngine === 'qwant' ? 'active' : null
                    }
                    onClick={() => this.searchEngineSelector('qwant')}
                    title='Qwant'
                    src={qwantImg}
                    alt='Qwant'
                  />
                  <img
                    className={
                      this.state.pref.searchEngine === 'yandex'
                        ? 'active'
                        : null
                    }
                    onClick={() => this.searchEngineSelector('yandex')}
                    title='Yandex'
                    src={yandexImg}
                    alt='Yandex'
                  />
                  <img
                    className={
                      this.state.pref.searchEngine === 'bing' ? 'active' : null
                    }
                    onClick={() => this.searchEngineSelector('bing')}
                    title='Bing'
                    src={bingImg}
                    alt='Bing'
                  />
                  <img
                    className={
                      this.state.pref.searchEngine === 'yahoo' ? 'active' : null
                    }
                    onClick={() => this.searchEngineSelector('yahoo')}
                    title='Yahoo'
                    src={yahooImg}
                    alt='Yahoo'
                  />
                </div>
              </div>
            </div>
            <br />
            <h4>Download Location</h4>
            <br />
            <button
              className={
                this.state.pref.downloadLocation !== 'ask'
                  ? 'download download-active'
                  : 'download'
              }
              onClick={() => {
                var pref = { ...this.state.pref }
                pref.downloadLocation = app.getPath('downloads')
                ipcRenderer.send('change_download_setting', pref)
                this.setState({ pref }, this.savePreference)
              }}
            >
              Custom
            </button>
            <button
              className={
                this.state.pref.downloadLocation === 'ask'
                  ? 'ml-4 download download-active'
                  : 'ml-4 download'
              }
              onClick={() => {
                var pref = { ...this.state.pref }
                pref.downloadLocation = 'ask'
                ipcRenderer.send('change_download_setting', pref)
                this.setState({ pref }, this.savePreference)
              }}
            >
              Ask Everytime
            </button>
            <br />
            <button
              className={
                this.state.pref.downloadLocation !== 'ask'
                  ? 'mt-3 download'
                  : 'd-none'
              }
              onClick={() => this.selectDownloadLocation()}
              style={{ width: '500px', textAlign: 'left' }}
            >
              {this.state.pref.downloadLocation}
            </button>
            <br />
            <br />
            <p className='small'>
              <i className='fa fa-info-circle'></i> Download preference changes
              will be reflected on next start.
            </p>
          </div>
          <div
            className={
              this.state.active === 'downloads' ? 'col-sm-9 pt-3' : 'd-none'
            }
          >
            <Downloads />
          </div>
          <div
            className={
              this.state.active === 'about' ? 'col-sm-9 pt-3' : 'd-none'
            }
          >
            <h5>Elza Browser</h5>
            <br />
            <p className='small'>Version {this.state.version}</p>
          </div>
        </div>
      </div>
    )
  }
}
export default BlankTab
