import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Talk from "../components/Talk";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Spanish Tutor</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to your online Spanish tutor 🇦🇷🇪🇸🇲🇽
        </h1>
        <p className={styles.description}>
          You can pratice your Spanish with our online tutor anytime. Just click
          start and start talking!
        </p>
        <div>
          <Talk />
        </div>
      </main>
    </div>
  );
}
