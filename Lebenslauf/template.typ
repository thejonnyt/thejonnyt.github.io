#import "@preview/metalogo:1.2.0": TeX, LaTeX

// === Template Overview ===
// CV Template - Professional styling for academic/technical CVs

// === Color Tokens ===
#let accent-color = rgb("#427bbbff")  // A classic, deep navy blue (solid)
#let text-color = rgb("#28313fff")    // A slightly softer dark gray/black
#let gray-color = rgb("#a1a1a1ff")    // A medium-dark gray for readable secondary text
#let light-gray = rgb("#edededff")    // A light, subtle gray for dividers (solid)

// === Typography Tokens ===
/usr/share/fonts/truetype/ubuntu/[wdth,wght].ttf
#let body-font = "Lato"
#let heading-font = "Lato"
#let base-font-size = 10.5pt
#let base-leading = 0.55em
#let header-name-size = 24pt
#let header-title-size = 11pt
#let header-summary-size = 10pt
#let header-contact-size = 9pt
#let section-title-size = 13pt
#let entry-title-size = 11pt
#let entry-meta-size = 9pt
#let publication-title-size = 10.5pt
#let publication-meta-size = 9.5pt

// === Layout & Spacing Tokens ===
#let page-margin = (x: 1.8cm, y: 2cm)
#let header-gap-sm = 0.15em
#let header-gap-md = 0.5em
#let header-divider-gap = 0.5em
#let after-header-gap = 0.5em
#let section-top-gap = 0.6em
#let section-title-gap = 0.15em
#let section-bottom-gap = 0.35em
#let entry-gap = 0.7em
#let list-indent = 0.5em
#let list-spacing = 0.7em
#let description-list-gap = 0.4em
#let skills-row-gap = 0.066em
#let publication-line-gap = 0.4em
#let publication-block-gap = 0.25em
#let divider-thickness = 0.5pt
#let section-rule-thickness = 1.2pt

// === Document Setup ===
#let cv-document(body) = {
  set document(
    title: "Curriculum Vitae - Johannes Michael Tauscher",
    author: "Johannes Michael Tauscher"
  )

  set page(
    paper: "a4",
    margin: page-margin,
    numbering: "1",
    number-align: center,
  )

  set text(
    font: body-font,
    size: base-font-size,
    fill: text-color,
  )

  set par(justify: true, leading: base-leading)

  body
}

// === Header ===
#let cv-header(name, title, summary: none, email: none, linkedin: none, github: none, website: none) = {
  set text(font: heading-font)

  align(center)[
    #text(size: header-name-size, weight: "bold")[#name]
    #v(header-gap-sm)
    #text(size: header-title-size, fill: gray-color)[#title]
  ]

  if summary != none and summary != "" {
    v(header-gap-md)
    align(center)[
      #set text(font: body-font)
      #text(size: header-summary-size)[#summary]
    ]
  }

  v(header-gap-md)
  
  align(center)[
    #let contacts = (email, linkedin, github, website).filter(x => x != none)
    #text(size: header-contact-size, fill: gray-color)[
      #contacts.join(" • ")
    ]
  ]
  
  v(header-divider-gap)
  line(length: 100%, stroke: divider-thickness + light-gray)
  v(after-header-gap)
}

// === Section Heading ===
#let section(title, break-before: false) = {
  if break-before { pagebreak() }
  v(section-top-gap)
  text(
    size: section-title-size,
    weight: "bold",
    fill: accent-color,
    font: heading-font
  )[#upper(title)]
  v(section-title-gap)
  line(length: 100%, stroke: section-rule-thickness + accent-color)
  v(section-bottom-gap)
}

// === Experience/Education Entry ===
#let entry(
  title,
  subtitle,
  location,
  date,
  description: none,
  achievements: (),
  technologies: ()
) = {
  // Title row
  grid(
    columns: (1fr, auto),
    text(weight: "bold", size: entry-title-size)[#title],
    text(fill: gray-color, size: entry-meta-size)[#date]
  )

  // Subtitle and location
  grid(
    columns: (1fr, auto),
    text(fill: gray-color, style: "italic")[#subtitle],
    text(fill: gray-color, size: entry-meta-size)[#location]
  )

  // Description
  if description != none [
    #description
  ]

  // Achievements as bullet points
  if achievements.len() > 0 [
    #v(description-list-gap)
    #list(
      indent: list-indent,
      spacing: list-spacing,
      ..achievements
    )
  ]

  // Technologies as inline tags
  if technologies.len() > 0 [
    #text(size: entry-meta-size, fill: gray-color)[
      *Technologies:* #technologies.join(", ")
    ]
  ]

  v(entry-gap)
}

// === Simple Entry (Education) ===
#let simple-entry(
  title,
  subtitle,
  location,
  date,
  highlights: ()
) = {
  grid(
    columns: (1fr, auto),
    text(weight: "bold", size: entry-title-size)[#title],
    text(fill: gray-color, size: entry-meta-size)[#date]
  )

  grid(
    columns: (1fr, auto),
    text(fill: gray-color, style: "italic")[#subtitle],
    text(fill: gray-color, size: entry-meta-size)[#location]
  )

  if highlights.len() > 0 [
    #list(
      indent: list-indent,
      spacing: list-spacing,
      ..highlights
    )
  ]
  v(entry-gap)
}

// === Skills Section ===
#let skills-section(categories) = {
  for item in categories {
    let category = item.at(0)
    let skills_list = item.at(1)
    text(weight: "bold", size: header-summary-size)[#category:]
    [ ]
    // Manual join since skills_list is a tuple
    for (i, skill) in skills_list.enumerate() {
      if i > 0 { [, ] }
      skill
    }
  v(skills-row-gap)
  }
}

// === Publication Entry ===
#let publication(
  title,
  authors,
  venue,
  year,
  doi: none,
  citations: none
) = {
  let venue-line = [
    #text(size: publication-meta-size, style: "italic")[#venue]
    #if doi != none [#text(size: publication-meta-size, fill: gray-color)[ • DOI: #link(doi)[#doi.replace("https://doi.org/", "")]]]
    #if citations != none [#text(size: publication-meta-size, fill: gray-color)[ • #citations citations]]
  ]

  // Title, authors, and venue on distinct lines
  stack(
    spacing: publication-line-gap,
    text(weight: "medium", size: publication-title-size)[\"#title\"],
    text(size: publication-meta-size, fill: gray-color)[#authors],
    grid(
      columns: (1fr, auto),
      venue-line,
      text(size: publication-meta-size, fill: gray-color)[#year]
    ),
  )
  v(publication-block-gap)
}

// === Utilities ===
#let format-date(start, end, current: false) = {
  let format-month-year(date-str) = {
    let parts = date-str.split("-")
    if parts.len() == 2 {
      let year = parts.at(0)
      let month-num = int(parts.at(1))
      let months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
      months.at(month-num - 1) + " " + year
    } else {
      date-str
    }
  }

  let start-formatted = format-month-year(start)
  let end-formatted = if current { "Present" } else { format-month-year(end) }

  start-formatted + " – " + end-formatted
}
