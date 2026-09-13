import styles from "./ProfileTabs.module.css";

export default function ProfileTabs({ tabs, activeTab, onChange }) {
  return (
    <div
      className={styles.tabsWrapper}
      role="tablist"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={
            activeTab === tab.key
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
