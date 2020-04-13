import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'
import { ToastProvider } from 'react-toast-notifications'
import get from 'lodash.get'
import { CookiesProvider } from 'react-cookie'
import { Web3ReactProvider } from '@web3-react/core'
import { getDomElements } from '@dapphero/dapphero-dom'

import * as api from 'api'
import { ethers } from 'ethers'
import * as consts from 'consts'
import { DomElementsContext, EthereumContext } from 'contexts'
import { EmitterProvider } from 'providers/EmitterProvider/provider'

import { Web3Provider } from 'ethers/providers'

import { useInterval } from './utils/useInterval'
import { useProvider } from './hooks/useProvider'
import { useMetamask } from './providers/ethereum/metamask'

import { Activator } from './Activator'
import { logger } from './logger/customLogger'

const getLibrary = (provider) => new ethers.providers.Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}
// Modal.setAppElement('dh-apiKey')

export const ProvidersWrapper: React.FC = () => {
  // react hooks
  const [ configuration, setConfig ] = useState(null)
  const [ domElements, setDomElements ] = useState(null)
  const [ timestamp, setTimestamp ] = useState(+new Date())
  const [ providerChoice, setProviderChoice ] = useState('metamask')
  const [ supportedNetworks, setSupportedNetworks ] = useState([])
  const [ appReady, setAppReady ] = useState(false)
  const retriggerEngine = (): void => setTimestamp(+new Date())

  const { provider: ethereum, addProvider, addSigner, addWriteProvider } = useProvider()

  // load contracts effects
  useEffect(() => {
    (async () => {
      const newConfig = { contracts: await api.dappHero.getContractsByProjectKey(consts.global.apiKey) }
      setConfig(newConfig)
    })()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getSupportedNetworks = () => {
      const networks = configuration.contracts?.map((contract) => ({
        contractName: contract.contractName,
        chainId: contract.networkId,
      }))
      setSupportedNetworks(networks)
    }

    if (configuration?.contracts) getSupportedNetworks()
  }, [ configuration ])

  // add read provider
  useEffect(() => {
    const networkName = 'rinkeby'
    addProvider(ethers.getDefaultProvider(networkName))
  }, [])

  const output = useMetamask(2000)

  console.log('ProvidersWrapper:React.FC -> output', output)

  // add metamask if already enabled
  // useInterval(() => {
  //   let address = 'false'
  //   const tryMetamask = async () => {
  //     if (window.ethereum || window.web3) {
  //       try {
  //         const provider = new Web3Provider(window.ethereum || window.web3)
  //         const currentNetwork = await provider.ready
  //         const signer = provider.getSigner()
  //         try {
  //           address = await signer.getAddress()
  //         } catch (error) {
  //           console.log('address error:', error)
  //         }
  //         console.log('The address is: ', address)
  //         const onCorrectNetwork = supportedNetworks.find((network) => network.chainId === currentNetwork.chainId)
  //         if (!onCorrectNetwork) {
  //           console.log(`Metamask is on network ${currentNetwork.chainId.toString()} : ${consts.global.ethNetworkName[currentNetwork.chainId]}.`)
  //         } else if (onCorrectNetwork) {
  //           console.log('on the right network!')
  //           addSigner(signer, address, window.ethereum.enable || window.web3.enable)
  //           addWriteProvider(provider)
  //         }
  //       } catch (err) {
  //         logger.log('Metamask is not enabled')
  //       }
  //     }
  //   }
  //   if (providerChoice === 'metamask') tryMetamask()
  //   // window.ethereum.on('accountsChanged', tryMetamask)
  //   // window.ethereum.on('networkChanged', tryMetamask)
  // }, 1000)

  useEffect(() => {
    if (configuration) setDomElements(getDomElements(configuration))
  }, [ configuration, supportedNetworks ])

  if (domElements != null) {
    return (
      <EmitterProvider>
        <CookiesProvider>
          <ToastProvider>
            <Web3ReactProvider getLibrary={getLibrary}>
              <EthereumContext.Provider value={ethereum}>
                <DomElementsContext.Provider value={domElements}>
                  <Activator configuration={configuration} retriggerEngine={retriggerEngine} />
                </DomElementsContext.Provider>
              </EthereumContext.Provider>
            </Web3ReactProvider>
          </ToastProvider>
        </CookiesProvider>
      </EmitterProvider>
    )
  }
  return null
}
