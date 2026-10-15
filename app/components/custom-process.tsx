import { site } from '../lib/catalog';
import { Arrow } from './icons';
import './custom-process.css';

export function CustomProcess() {
  const process = site.customProcess;
  if (!process) return null;

  return <section id="como-nasce-um-custom" className="custom-process" aria-labelledby="custom-process-title">
    <div className="custom-process-topline">
      <p className="custom-process-eyebrow">{process.eyebrow}</p>
      <div className="custom-process-paper" aria-hidden="true"><span /></div>
    </div>

    <div className="custom-process-heading">
      <h2 id="custom-process-title">{process.title}</h2>
      <p>{process.introduction}</p>
    </div>

    <ol className="custom-process-steps">
      {process.steps.map((step, index) => <li className="custom-process-step" key={`${index}-${step.title}`}>
        <span className="custom-process-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className="custom-process-step-copy">
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
        <span className="custom-process-step-mark" aria-hidden="true" />
      </li>)}
    </ol>

    <div className="custom-process-footer">
      <div className="custom-process-thread" aria-hidden="true"><span /><span /><span /></div>
      <a className="custom-process-cta" href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
        Conversar sobre uma ideia no grupo <Arrow diagonal />
      </a>
    </div>
  </section>;
}
