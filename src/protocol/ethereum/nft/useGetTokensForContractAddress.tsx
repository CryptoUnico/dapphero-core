import { useEffect, useState } from 'react'
import { openSeaApi } from './api'

export const useGetTokensForContractAddress = ({ isSingleToken, isMultipleTokens, isAllTokens, parsedTokens, assetContractAddress, assetOwnerAddress, limit, offset, tokens }) => {
  const [ nfts, setNfts ] = useState(null)
  const [ error, setError ] = useState(null)

  useEffect(() => {
    if (assetOwnerAddress || !assetContractAddress) return

    if (isSingleToken) {
      const [ token ] = parsedTokens
      const simpleErrorMessage = `Error retriving collectibles, check the Console for more details`
      const completeErrorMessage = `We couldn't get collectible ${token} from contract address ${assetContractAddress}`

      openSeaApi.contract
        .getSingleAsset({ assetContractAddress, token })
        .then(setNfts)
        .catch((error) => setError({ simpleErrorMessage, completeErrorMessage, error }))
    }

    if (isMultipleTokens) {
      const simpleErrorMessage = `Error retriving collectibles, check the Console for more details`
      const completeErrorMessage = `We couldn't get collectibles ${tokens.join(', ')} from contract address ${assetContractAddress}`

      openSeaApi.contract
        .getMultipleAssets({ assetContractAddress, tokens, limit, offset })
        .then(setNfts)
        .catch((error) => setError({ simpleErrorMessage, completeErrorMessage, error }))
    }

    if (isAllTokens) {
      const simpleErrorMessage = `Error retriving collectibles, check the Console for more details`
      const completeErrorMessage = `We couldn't get all collectibles from contract address ${assetContractAddress}`

      openSeaApi.contract
        .getAllAssets({ assetContractAddress, limit, offset })
        .then(setNfts)
        .catch((error) => setError({ simpleErrorMessage, completeErrorMessage, error }))
    }
  }, [ assetContractAddress, offset ])

  return { nfts, error }
}
