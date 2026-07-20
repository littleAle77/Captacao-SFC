import styles from './PageContainer.module.css'
import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  width?: 'normal' | 'wide'
}

export default function PageContainer({
  children,
  width = 'normal',
}: PageContainerProps) {
  return (
    <main className={styles.container}>
      <div className={width === 'wide' ? styles.wide : styles.normal}>
        {children}
      </div>
    </main>
  )
}