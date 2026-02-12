#import "template.typ": *

#show: cv-document

#cv-header(
  "Johannes Michael Tauscher",
  "Data Scientist – Applied AI & Production Systems",
  summary: "Data Scientist and Applied AI Engineer grounded in statistics and optimization, building reliable ML/LLM systems from framing to production.",
  email: "j-tauscher@hotmail.com",
  linkedin: link("https://linkedin.com/in/johannes-tauscher")[linkedin.com/in/johannes-tauscher],
  github: link("https://github.com/thejonnyt")[github.com/thejonnyt],
  website: link("https://thejonnyt.github.io")[thejonnyt.github.io]
)

#section("Professional Experience")

#entry(
  "Co-Founder, Technical Lead (Early Stage)",
  "Raumdeuter GbR",
  "Leipzig, Germany",
  format-date("2024-11", "2025-12", current: false),
  description: [Building an AI-driven communication and engagement platform for members and fans of clubs and associations to enable participation and engagement — a way to voice your opinion. I led the technical development: from conceptualization and architecture to implementation of the product as a customer-deployed MVP with the help of a 4-person development team and coordinated external IT partners.],
  achievements: (
    [Delivered a customer-deployed MVP 0 → 1 in under 12 months on a €30k budget, targeting capital-efficient scale.],
    [Led product ideation workshops to align vision and problem-solution fit roadmap.],
    [Architected ML/NLP pipelines (RAG, sentiment, topic clustering) as core AI/ML solution capabilities.],
    [Owned infrastructure and DevOps delivery, cutting release friction and improving onboarding for interns, contractors, and external partners.],
  ),
  technologies: ("Docker", "CI/CD", "Bash", "Python", "NLP/ML", "LLMs", "SpaCy", "FastAPI", "gRPC", "Qdrant", "RAG", "pytest"),
)

#entry(
  "Mathematics Teacher (Substitute)",
  "Rahn Education (Private School)",
  "Leipzig, Germany",
  format-date("2022-11", "2023-06", current: false),
  description: [Responsible for the supervision of talented pupils (groups of 4 to 8)],
  achievements: (
    [Prepared customized university-level material to challenge and spark interest in mathematics.],
    [Initiated a pupil-led lecture series about Artificial Intelligence and its use cases.],
    [Taught basic principles of the mathematics behind 3D printing and coding.],
  ),
  technologies: ("PowerPoint", "Algebra"),
)

#entry(
  "Student Assistant",
  "Child and Adolescent Psychiatry, Philipps University Marburg",
  "Marburg, Germany",
  format-date("2019-05", "2021-01", current: false),
  description: [Responsible for the validation and reproduction of earlier results of research as well as for programming Machine Learning algorithms in R to solve classification problems in the field of ASD diagnosis.],
  achievements: (
    [Hyperparameter tuning for decision trees/random forests improved diagnostic performance by ~10–15 percentage points; results supported 3 peer‑reviewed publications (~70 citations).],
    [Worked in a highly interdisciplinary manner with psychologists and medical doctors to understand the clinical background and implications of the data + explain the statistical methods to non-data scientists.],
    [Commended for a reliable, way of conveying statistical content; invited to stay on as a scientific researcher.],
  ),
  technologies: ("Statistics", "Machine Learning", "Random Forests", "Decision Trees", "R", "ggplot2", "tidyverse"),
)

#pagebreak()
#entry(
  "Intern, Data Analyst",
  "Westphalia DataLab GmbH",
  "Münster, Germany",
  format-date("2019-08", "2019-10", current: false),
  description: [As a Data Analyst intern at Westphalia DataLab GmbH, I worked on a medical-diagnostics project combining 3D imaging and clinical data; developed and improved an experiment-tracking R/Shiny frontend and performed clinical-data analysis with Python and R.],
  achievements: (
    [Enhanced experiment‑tracking R/Shiny frontend accessing data in MongoDB and SQL to improve researcher workflow.],
    [Analyzed 3D imaging + clinical datasets in Python/R to surface diagnostic insights.],
    [Internship evaluation rated performance as outstanding.],
  ),
  technologies: ("Python", "R", "R Shiny", "tidyverse", "data.table", "PyTorch", "Convolutional Neural Networks", "MongoDB"),
)

#section("Education")

#simple-entry(
  "M.Sc Data Science, Faculty of Mathematics and Computer Science",
  "Leipzig University",
  "Leipzig, Germany",
  format-date("2021-04", "2024-10"),
  highlights: (
    [Overall Score: 1.7, personal focus on advanced statistics, Machine Learning, data privacy, and LLM applications.],
    [Master's Thesis (1.1): Neural Machine Translation with Transformers - Leveraging the Pivot Technique for Low-Resource Language Pairs],
  ),
)

#simple-entry(
  "B.Sc. Data Science, Faculty of Mathematics and Computer Science",
  "Philipps University Marburg",
  "Marburg, Germany",
  format-date("2017-10", "2021-03"),
  highlights: (
    [Bachelor's Thesis (1.7): Multidimensional Data Exploration and Visualization of Membrane Proteins Attributes],
    [Curriculum focuses on mathematics, statistics, computer science and programming.],
  ),
)

#simple-entry(
  "B.A. Marketing and Technical Business Administration",
  "HAW Hamburg",
  "Hamburg, Germany",
  format-date("2012-03", "2017-10"),
  highlights: (
    [Bachelor's Thesis (1.7): Use of Linear Discriminant Analysis as an alternative to tree analysis - methodological evaluation and exemplary implementation using a survey on the success of movies.],
    [Curriculum focuses on marketing, engineering and business administration.],
  ),
)

#section("Technical Skills")

#skills-section((
  ("Programming Languages", ("Python", "Bash", "R", "Java", "JavaScript", "TypeScript", "SQL",)),
  ("Analysis, ML & AI", ("LLMs", "NLP", "Machine Learning", "R Shiny", "SPSS", "Statistics", "SpaCy", "RAG", "Algebra", "Decision Trees", "Random Forests", "PyTorch", "pandas", "NumPy", "scikit-learn", "SentencePiece", "OpenNMT-py", "Convolutional Neural Networks", "matplotlib", "ggplot2", "tidyverse", "data.table",)),
  ("Backend & DevOps", ("noSQL", "Docker", "gRPC", "MongoDB", "MariaDB", "PostgreSQL", "Qdrant", "nginx", "CI/CD", "FastAPI", "Docker Compose",)),
  ("Web & Creative", ("Next.js", "React", "Adobe Photoshop", "HTML", "CSS",)),
  ("Tools & Systems", ("Linux", "Markdown", "git", "GitHub", LaTeX, "Excel", "PowerPoint", "MS Office", "MS Teams", "Miro", "Business Model Canvas", "Lean Startup", "VSCode", "pytest", "Protocol Buffers", "Docker Hub", "gcode",)),
))
