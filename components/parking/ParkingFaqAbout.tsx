type FaqItem = { question: string; answer: string };

type ParkingFaqAboutProps = {
  faqTitle: string;
  faqItems: FaqItem[];
  aboutTitle: string;
  intro: string;
  aboutItems: string[];
};

/** Server-rendered FAQ + About — keeps static SEO copy out of the client island. */
export default function ParkingFaqAbout({
  faqTitle,
  faqItems,
  aboutTitle,
  intro,
  aboutItems,
}: ParkingFaqAboutProps) {
  return (
    <section className="pk-seo" aria-label={aboutTitle}>
      <div className="pk-faq">
        <h2 className="pk-seo-heading">{faqTitle}</h2>
        {faqItems.map((item) => (
          <details key={item.question} className="pk-faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
        <details className="pk-faq-item pk-about-item">
          <summary>{aboutTitle}</summary>
          <p className="pk-about-intro">{intro}</p>
          <ul>
            {aboutItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
