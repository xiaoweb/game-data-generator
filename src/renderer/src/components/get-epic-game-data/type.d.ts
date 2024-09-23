export interface IGameData {
  namespace: string
  gameId: string
  brand: Brand
  datePublished: string
  description: string
  gamePlatform?: string[] | null
  image: string
  mainEntityOfPage?: boolean
  name: string
  operatingSystem?: string[] | null
  producer: string
  publisher: string
  sku: string
  url: string
  offers?: OffersEntity[] | null
}

export interface Brand {
  name: string
}

export interface OffersEntity {
  acceptedPaymentMethod?: string[] | null
  availability: string
  availableDeliveryMethod: string
  category: string
  mainEntityOfPage: boolean
  name: string
  description: string
  priceSpecification: PriceSpecification
  priceValidUntil: string
  url: string
  priceCurrency: string
}

export interface PriceSpecification {
  price: number
  priceCurrency: string
}
