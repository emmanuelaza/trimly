import { Button } from "./Button"
import { Card } from "./Card"
import { Badge } from "./Badge"
import { StatCard } from "./StatCard"
import { Avatar as BaseAvatar } from "./Avatar"
import { Input } from "./Input"

export const Avatar = ({ initials, className, ...props }: any) => (
  <BaseAvatar fallback={initials} className={className} {...props} />
)

export { Button, Card, Badge, StatCard, Input }
