const faqs = [
  ['Does Echo listen all the time?', 'No. Echo only records after you tap the talk button. Hands-free mode is not part of this release.'],
  ['Where does my audio go?', 'Audio is sent over HTTPS to our server and an AI provider to be transcribed, then discarded. We do not store recordings.'],
  ['Which earbuds work?', 'Any wired or Bluetooth earbuds your phone supports.'],
  ['Which languages?', 'Ask in your language, or ask Echo to translate. Voice output uses the voices installed on your phone.'],
];

export default function Home() {
  return (
    <main>
      <header className="bar"><strong>Echo</strong><a href="#download">Download</a></header>
      <section className="hero">
        <h1>Say it.<br />Hear it.</h1>
        <p>Echo answers out loud, straight into your earbuds. Tap once, ask anything, keep your phone in your pocket.</p>
        <a className="btn" href="#download">Get the app</a>
      </section>
      <section className="steps" aria-label="How it works">
        <ol>
          <li><b>Tap</b> the talk button and speak.</li>
          <li><b>Echo</b> turns your voice into text and writes a reply.</li>
          <li><b>Listen</b> as the reply is read to you.</li>
        </ol>
      </section>
      <section id="faq"><h2>Questions</h2>
        {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
      </section>
      <section id="download" className="dl"><h2>Download Echo</h2>
        <p>Test builds are coming to Android and iOS. Links will appear here.</p>
        <div className="row"><span className="btn off" aria-disabled="true">Android: soon</span><span className="btn off" aria-disabled="true">iOS: soon</span></div>
      </section>
      <footer>Audio is processed by a server and an AI provider. See the privacy page before you begin.</footer>
    </main>
  );
}
