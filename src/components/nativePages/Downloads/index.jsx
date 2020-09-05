import React from 'react'
import './main.css'
const { shell, ipcRenderer } = window.require('electron')
class Downloads extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      downloads: {
        1599141222568: {
          name: 'download.png',
          path: '/home/basil/Downloads/download (4).png',
          receivedBytes: 1340,
          status: 'done',
          totalBytes: 0
        },
        1599141937799: {
          name: 'download.jpeg',
          path: '/home/basil/Downloads/download (32).jpeg',
          receivedBytes: 2000,
          status: 'started',
          totalBytes: 3500
        }
      }
    }
  }
  componentDidMount () {
    ipcRenderer.on('senddownloads', (event, arg) => {
      console.log(arg)
      this.setState({
        downloads: {
          1599141222568: {
            name: 'download.png',
            path: '/home/basil/Downloads/download (4).png',
            receivedBytes: 1340,
            status: 'done',
            totalBytes: 0
          },
          1599141937799: {
            name: 'download.jpeg',
            path: '/home/basil/Downloads/download (32).jpeg',
            receivedBytes: 2000,
            status: 'started',
            totalBytes: 3500
          }
        }
      })
    })
    ipcRenderer.send('getdownloads')
  }

  getProgress = (receivedBytes, totalBytes) => {
    if (totalBytes === 0) return 0
    else {
      return ((receivedBytes / totalBytes) * 100).toFixed(2) + '%'
    }
  }
  openItem = path => {
    shell.openPath(path)
  }

  render () {
    return (
      <>
        <div className='container p-1'>
          {Object.keys(this.state.downloads).map(key => (
            <div
              key={key}
              onClick={() => {
                if (this.state.downloads[key].status === 'done')
                  this.openItem(this.state.downloads[key].path)
              }}
              style={{ height: '50px' }}
              className='row m-2'
            >
              <div className='col-sm-2 justify-content-center align-self-center'>
                <i
                  style={{ fontSize: '30px', color: '#C4C4C4' }}
                  className='fa fa-file-download'
                ></i>
              </div>
              <div className='col-sm-10'>
                <b className='downloadname'>
                  {this.state.downloads[key].name.length < 15
                    ? this.state.downloads[key].name
                    : this.state.downloads[key].name
                        .split('')
                        .splice(0, 15)
                        .join('') + '...'}
                </b>

                {this.state.downloads[key].status !== 'done' && (
                  <div className='mt-1 mb-1 border'>
                    <div
                      className='progress-bar bg-light'
                      style={{
                        width: this.getProgress(
                          this.state.downloads[key].receivedBytes,
                          this.state.downloads[key].totalBytes
                        ),
                        height: '5px'
                      }}
                    ></div>
                  </div>
                )}
                <div className='progressinfo'>
                  {this.state.downloads[key].status === 'done'
                    ? 'Completed - ' +
                      (this.state.downloads[key].totalBytes / 1024).toFixed(2) +
                      ' MB'
                    : (this.state.downloads[key].receivedBytes / 1024).toFixed(
                        2
                      ) +
                      ' of ' +
                      (this.state.downloads[key].totalBytes / 1024).toFixed(2) +
                      ' MB'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }
}
export default Downloads
