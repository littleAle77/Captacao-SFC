import { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  hover?: boolean
  className?: string
}

export default function Card({
  children,
  hover = false,
  className = '',
}: CardProps) {
  return (
    <section
      className={`
        ${styles.card}
        ${hover ? styles.hover : ''}
        ${className}
      `}
    >
      {children}
    </section>
  )
}