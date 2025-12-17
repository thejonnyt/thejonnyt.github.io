#import "@preview/metalogo:1.2.0": TeX, LaTeX

// CV Template - Professional styling for academic/technical CVs

// A refined, high-contrast color scheme
#let accent-color = rgb("#427bbbff")  // A classic, deep navy blue (solid)
#let text-color = rgb("#28313fff")    // A slightly softer dark gray/black
#let gray-color = rgb("#a1a1a1ff")    // A medium-dark gray for readable secondary text
#let light-gray = rgb("#edededff")    // A light, subtle gray for dividers (solid)
/usr/share/fonts/truetype/ubuntu/[wdth,wght].ttf
// Fonts
#let body-font = "Lato"
#let heading-font = "Lato"

// Document setup
#let cv-document(body) = {
  set document(
    title: "Curriculum Vitae - Johannes Michael Tauscher",
    author: "Johannes Michael Tauscher"
  )

  set page(
    paper: "a4",
    margin: (x: 1.8cm, y: 2cm),
    numbering: "1",
    number-align: center,
  )

  set text(
    font: body-font,
    size: 10.5pt,
    fill: text-color,
  )

  set par(justify: true, leading: 0.65em)

  body
}

// Header with name and contact info
#let cv-header(name, title, summary: none, email: none, linkedin: none, github: none, website: none) = {
  set text(font: heading-font)

  align(center)[
    #text(size: 24pt, weight: "bold")[#name]
    #v(0.3em)
    #text(size: 11pt, fill: gray-color)[#title]
  ]

  if summary != none and summary != "" {
    v(0.6em)
    align(center)[
      #set text(font: body-font)
      #text(size: 10pt)[#summary]
    ]
  }

  v(0.6em)
  
  align(center)[
    #let contacts = (email, linkedin, github, website).filter(x => x != none)
    #text(size: 9pt, fill: gray-color)[
      #contacts.join(" • ")
    ]
  ]
  
  v(1em)
  line(length: 100%, stroke: 0.5pt + light-gray)
  v(0.8em)
}

// Section heading
#let section(title) = {
  v(0.8em)
  text(
    size: 13pt,
    weight: "bold",
    fill: accent-color,
    font: heading-font
  )[#upper(title)]
  v(0.3em)
  line(length: 100%, stroke: 1pt + accent-color)
  v(0.5em)
}

// Experience/Education entry
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
    text(weight: "bold", size: 11pt)[#title],
    text(fill: gray-color, size: 9pt)[#date]
  )

  // Subtitle and location
  v(0.1em)
  grid(
    columns: (1fr, auto),
    text(fill: gray-color, style: "italic")[#subtitle],
    text(fill: gray-color, size: 9pt)[#location]
  )

  // Description
  if description != none [
    #v(0.3em)
    #description
  ]

  // Achievements as bullet points
  if achievements.len() > 0 [
    #v(0.2em)
    #list(
      indent: 0.5em,
      spacing: 0.4em,
      ..achievements
    )
  ]

  // Technologies as inline tags
  if technologies.len() > 0 [
    #v(0.3em)
    #text(size: 9pt, fill: gray-color)[
      *Technologies:* #technologies.join(", ")
    ]
  ]

  v(0.7em)
}

// Simple list entry (for education)
#let simple-entry(
  title,
  subtitle,
  location,
  date,
  highlights: ()
) = {
  grid(
    columns: (1fr, auto),
    text(weight: "bold", size: 11pt)[#title],
    text(fill: gray-color, size: 9pt)[#date]
  )

  v(0.1em)
  grid(
    columns: (1fr, auto),
    text(fill: gray-color, style: "italic")[#subtitle],
    text(fill: gray-color, size: 9pt)[#location]
  )

  if highlights.len() > 0 [
    #v(0.2em)
    #list(
      indent: 0.5em,
      spacing: 0.4em,
      ..highlights
    )
  ]

  v(0.7em)
}

// Skills section with categories
#let skills-section(categories) = {
  for item in categories {
    let category = item.at(0)
    let skills_list = item.at(1)
    text(weight: "bold", size: 10pt)[#category:]
    [ ]
    // Manual join since skills_list is a tuple
    for (i, skill) in skills_list.enumerate() {
      if i > 0 { [, ] }
      skill
    }
    v(0.4em)
  }
}

// Publication entry
#let publication(
  title,
  authors,
  venue,
  year,
  doi: none,
  citations: none
) = {
  // Title in quotes
  text(weight: "medium")[\"#title\"]

  // Authors
  v(0.1em)
  text(size: 9.5pt, fill: gray-color)[#authors]

  // Venue and year
  v(0.1em)
  grid(
    columns: (1fr, auto),
    text(size: 9.5pt, style: "italic")[#venue],
    text(size: 9.5pt, fill: gray-color)[#year]
  )

  // DOI and citations on same line
  if doi != none or citations != none [
    #v(0.1em)
    #text(size: 9pt, fill: gray-color)[
      #if doi != none [DOI: #link(doi)[#doi.replace("https://doi.org/", "")]]
      #if doi != none and citations != none [ • ]
      #if citations != none [#citations citations]
    ]
  ]

  v(0.6em)
}

// Format date range
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
