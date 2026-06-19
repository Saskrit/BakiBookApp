function LegalDocumentContent({ sections }) {
  if (!sections?.length) {
    return <p className="legal-page__empty">No content available yet.</p>;
  }

  return sections.map((section, index) => (
    <article
      key={`${section.title}-${index}`}
      id={`section-${index + 1}`}
      className="legal-page__section"
    >
      <h2 className="legal-page__section-title">{section.title}</h2>

      {section.paragraphs?.map((paragraph, pIndex) => (
        <p key={pIndex} className="legal-page__text">
          {paragraph}
        </p>
      ))}

      {section.bullets?.length > 0 && (
        <ul className="legal-page__list">
          {section.bullets.map((item, bIndex) => (
            <li key={bIndex}>{item}</li>
          ))}
        </ul>
      )}

      {section.subsections?.map((subsection, sIndex) => (
        <div key={sIndex} className="legal-page__subsection">
          {subsection.title && <h3 className="legal-page__subsection-title">{subsection.title}</h3>}
          {subsection.paragraphs?.map((paragraph, pIndex) => (
            <p key={pIndex} className="legal-page__text">
              {paragraph}
            </p>
          ))}
          {subsection.bullets?.length > 0 && (
            <ul className="legal-page__list">
              {subsection.bullets.map((item, bIndex) => (
                <li key={bIndex}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {section.contactEmail && (
        <p className="legal-page__text">
          <a href={`mailto:${section.contactEmail}`} className="legal-page__link">
            {section.contactEmail}
          </a>
        </p>
      )}
    </article>
  ));
}

export default LegalDocumentContent;
