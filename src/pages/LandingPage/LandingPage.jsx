import FeatureCarousel from './FeatureCarousel/FeatureCarousel.jsx';
import HeroSection from './HeroSection/HeroSection.jsx';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.root}>
      <HeroSection />
      <FeatureCarousel />
    </div>
  );
}
