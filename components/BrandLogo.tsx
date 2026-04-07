import Image from "next/image"
import styles from "./BrandLogo.module.css"

type BrandLogoProps = {
  align?: "left" | "center"
}

export default function BrandLogo({ align = "center" }: BrandLogoProps) {
  return (
    <div className={`${styles.wrap} ${align === "left" ? styles.left : styles.center}`}>
      <Image
        src="/urban-country-logo.png"
        alt="Urban Country Realty and Property Management"
        width={430}
        height={142}
        priority
      />
    </div>
  )
}
