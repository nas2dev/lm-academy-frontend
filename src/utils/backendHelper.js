export const getBackendBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
}

export const getStorageUrl = (path, fallback = null) => {
    if (!path) return fallback
    return `${getBackendBaseUrl()}/storage/${path}`
}

export const getProfileImageUrl = (imagePath, fallbackImage = null) => {
    if (imagePath) {
        return getStorageUrl(imagePath)
    }

    if (fallbackImage) {
        return fallbackImage
    }

    return new URL('../assets/images/profile/user-1.jpg', import.meta.url).href
}

export const getAssetUrl = (assetPath, fallback = null) => {
    if (!assetPath) return fallback
    return `${getBackendBaseUrl()}/${assetPath}`
}