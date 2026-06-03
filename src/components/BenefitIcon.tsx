import { Truck, ShieldCheck, RefreshCw, CreditCard, Heart, Star, Zap, Package, Headphones, Award, Shield, Clock, ThumbsUp, CheckCircle, Smile, TrendingUp, DollarSign, Phone, MessageSquare, Users, ShoppingBag, ShoppingCart, Gift, Tag, Percent, Wallet, Banknote, PiggyBank, Gem, Leaf, Box, Sparkles } from 'lucide-react'

const iconMap: Record<string, any> = {
  Truck, ShieldCheck, RefreshCw, CreditCard, Heart, Star, Zap, Package, Headphones, Award, Shield, Clock, ThumbsUp, CheckCircle, Smile, TrendingUp, DollarSign, Phone, MessageSquare, Users, ShoppingBag, ShoppingCart, Gift, Tag, Percent, Wallet, Banknote, PiggyBank, Gem, Leaf, Box, Sparkles
}

export default function BenefitIcon({ name, size = 24, color }: { name?: string, size?: number, color?: string }) {
  const Icon = iconMap[name || 'Truck'] || Truck
  return <Icon size={size} color={color} />
}
