export {};

type SkillGoal = {
  description?: string;
  proficiencyTarget?: number;
};

type CategoryData = {
  index: number;
  name: string;
  proficiency: string;
  experience: string;
  count: number;
  skills: string[];
  goal: SkillGoal | null;
  goalProficiency: string;
};

type Point = {
  x: number;
  y: number;
};

type SkillsRadarPayload = {
  categoryData: CategoryData[];
  proficiencyPoints: Point[];
  experiencePoints: Point[];
  center: number;
};

function parseSkillsRadarPayload(root: HTMLElement): SkillsRadarPayload | null {
  const raw = root.dataset.skillsRadar;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SkillsRadarPayload;
    if (!parsed?.categoryData || !parsed?.proficiencyPoints || !parsed?.experiencePoints) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function initSkillsRadar(root: HTMLElement, payload: SkillsRadarPayload): void {
  if (root.dataset.skillsRadarInit === 'true') return;
  root.dataset.skillsRadarInit = 'true';

  const { categoryData, proficiencyPoints, experiencePoints, center } = payload;
  let activeCategoryIndex = -1;

  const proficiencyPolygon = root.querySelector('.proficiency-polygon');
  const experiencePolygon = root.querySelector('.experience-polygon');
  const proficiencyHighlightCore = root.querySelector('.proficiency-highlight.core');
  const proficiencyHighlightGlow = root.querySelector('.proficiency-highlight.glow');
  const proficiencyHighlightSparks = root.querySelector('.proficiency-highlight.sparks');
  const experienceHighlightCore = root.querySelector('.experience-highlight.core');
  const experienceHighlightGlow = root.querySelector('.experience-highlight.glow');
  const experienceHighlightSparks = root.querySelector('.experience-highlight.sparks');
  const proficiencySparkLayer = root.querySelector('.proficiency-sparks');
  const experienceSparkLayer = root.querySelector('.experience-sparks');
  const chartSvg = root.querySelector<SVGSVGElement>('.radar-chart');
  const glowSpots = root.querySelectorAll('.radar-glow-spot');
  const goalWedges = root.querySelectorAll('.goal-wedge');
  const migrationLines = root.querySelectorAll('.migration-line');

  const labels = root.querySelectorAll('.category-label');
  const dataPoints = root.querySelectorAll('.data-point-group');

  // Details panel elements
  const detailsPanel = root.querySelector<HTMLElement>('#details-panel');
  const detailsHeader = root.querySelector<HTMLElement>('#details-header');
  const detailsProficiency = root.querySelector<HTMLElement>('#details-proficiency');
  const detailsExperience = root.querySelector<HTMLElement>('#details-experience');
  const detailsCount = root.querySelector<HTMLElement>('#details-count');
  const detailsGoal = root.querySelector<HTMLElement>('#details-goal');
  const detailsSkills = root.querySelector<HTMLElement>('#details-skills');
  const detailsTargetValue = root.querySelector<HTMLElement>('#details-target-value');

  const updateDetailsPanel = (category: CategoryData, showGoalExtension = false) => {
    if (!detailsPanel || !category) return;

    if (detailsHeader) detailsHeader.textContent = category.name;

    if (detailsProficiency) {
      detailsProficiency.innerHTML = `<span class="current-prof">${category.proficiency}</span>`;
    }

    if (detailsTargetValue) {
      detailsTargetValue.style.display = 'none';
      const proficiencyValue = parseFloat(category.proficiency);
      const goalProficiencyValue = parseFloat(category.goalProficiency);

      if (showGoalExtension && category.goal && proficiencyValue !== goalProficiencyValue) {
        const isIncrease = goalProficiencyValue > proficiencyValue;
        const arrowColor = isIncrease ? 'green' : 'hsl(0, 60%, 50%)';
        const arrowSymbol = isIncrease ? '▲' : '▼';

        detailsTargetValue.innerHTML = `
          <div class="target-values">
            <span class="current-prof">${category.proficiency}</span>
            <span style="color: ${arrowColor}; font-weight: bold; margin: 0 8px; font-size: 1.2em;">${arrowSymbol}</span>
            <span class="goal-prof visible">${category.goalProficiency}</span>
          </div>
        `;
        detailsTargetValue.style.display = 'flex';
      }
    }

    if (detailsExperience) detailsExperience.textContent = `${category.experience} years`;
    if (detailsCount) detailsCount.textContent = `${category.count}`;

    if (detailsGoal) {
      if (category.goal) {
        const goalInfo = `<strong>Goal:</strong> ${category.goal.description}`;
        detailsGoal.innerHTML = goalInfo;
        detailsGoal.style.display = 'block';
      } else {
        detailsGoal.style.display = 'none';
      }
    }

    if (detailsSkills) {
      detailsSkills.innerHTML = (category.skills || [])
        .map((skill) => `<span class="skill-tag">${skill}</span>`)
        .join('');
    }

    detailsPanel.classList.add('active');
  };

  const buildDetailsPanel = () => {
    if (!detailsPanel) return null;
    const panel = document.createElement('div');
    panel.className = 'details-panel active';
    panel.style.position = 'absolute';
    panel.style.left = '-9999px';
    panel.style.top = '0';
    panel.style.visibility = 'hidden';
    panel.style.pointerEvents = 'none';
    panel.style.height = 'auto';
    panel.style.width = `${detailsPanel.getBoundingClientRect().width}px`;

    const hoverState = document.createElement('div');
    hoverState.className = 'details-content hover-state';

    const header = document.createElement('div');
    header.className = 'tooltip-header';

    const body = document.createElement('div');
    body.className = 'tooltip-content-body';

    const makeRow = (labelText: string) => {
      const row = document.createElement('div');
      row.className = 'tooltip-row';
      const label = document.createElement('span');
      label.className = 'tooltip-label';
      label.textContent = labelText;
      const value = document.createElement('span');
      value.className = 'tooltip-value';
      row.appendChild(label);
      row.appendChild(value);
      return { row, value };
    };

    const profRow = makeRow('Self-Assessment:');
    const expRow = makeRow('Avg Experience:');
    const countRow = makeRow('Skills:');

    const goal = document.createElement('div');
    goal.className = 'tooltip-goal';
    const targetValue = document.createElement('div');
    targetValue.className = 'tooltip-target-value';
    const skills = document.createElement('div');
    skills.className = 'tooltip-skills';

    body.appendChild(profRow.row);
    body.appendChild(expRow.row);
    body.appendChild(countRow.row);
    body.appendChild(goal);
    body.appendChild(targetValue);
    body.appendChild(skills);

    hoverState.appendChild(header);
    hoverState.appendChild(body);
    panel.appendChild(hoverState);

    return {
      panel,
      header,
      profValue: profRow.value,
      expValue: expRow.value,
      countValue: countRow.value,
      goal,
      targetValue,
      skills
    };
  };

  const populateDetailsPanel = (
    elements: ReturnType<typeof buildDetailsPanel>,
    category: CategoryData,
    showGoalExtension = false
  ) => {
    if (!elements || !category) return;
    const {
      header,
      profValue,
      expValue,
      countValue,
      goal,
      targetValue,
      skills
    } = elements;

    header.textContent = category.name;
    profValue.innerHTML = `<span class="current-prof">${category.proficiency}</span>`;
    expValue.textContent = `${category.experience} years`;
    countValue.textContent = `${category.count}`;

    goal.style.display = 'none';
    if (category.goal) {
      goal.innerHTML = `<strong>Goal:</strong> ${category.goal.description}`;
      goal.style.display = 'block';
    }

    targetValue.style.display = 'none';
    const proficiencyValue = parseFloat(category.proficiency);
    const goalProficiencyValue = parseFloat(category.goalProficiency);
    if (showGoalExtension && category.goal && proficiencyValue !== goalProficiencyValue) {
      const isIncrease = goalProficiencyValue > proficiencyValue;
      const arrowColor = isIncrease ? 'green' : 'hsl(0, 60%, 50%)';
      const arrowSymbol = isIncrease ? '▲' : '▼';
      targetValue.innerHTML = `
        <div class="target-values">
          <span class="current-prof">${category.proficiency}</span>
          <span style="color: ${arrowColor}; font-weight: bold; margin: 0 8px; font-size: 1.2em;">${arrowSymbol}</span>
          <span class="goal-prof visible">${category.goalProficiency}</span>
        </div>
      `;
      targetValue.style.display = 'flex';
    }

    skills.innerHTML = (category.skills || [])
      .map((skill) => `<span class="skill-tag">${skill}</span>`)
      .join('');
  };

  const setDetailsPanelMinHeight = () => {
    if (!detailsPanel) return;
    const measure = buildDetailsPanel();
    if (!measure) return;

    document.body.appendChild(measure.panel);

    let maxHeight = 0;
    categoryData.forEach((category) => {
      populateDetailsPanel(measure, category, true);
      const height = measure.panel.getBoundingClientRect().height;
      if (height > maxHeight) maxHeight = height;
    });

    measure.panel.remove();

    if (maxHeight > 0) {
      detailsPanel.style.minHeight = `${Math.ceil(maxHeight * 0.8)}px`;
    }
  };

  const clearHighlights = (categoryIndex: number) => {
    if (categoryIndex === -1) return;
    root.querySelector(`.category-label[data-category="${categoryIndex}"]`)?.classList.remove('highlighted');
    proficiencyPolygon?.classList.remove('dimmed');
    goalWedges.forEach((wedge) => wedge.classList.remove('visible'));
    migrationLines.forEach((line) => line.classList.remove('visible'));
  };

  const setEdgeHighlightMetrics = (element: Element | null) => {
    if (!(element instanceof SVGPathElement)) return;
    const length = element.getTotalLength();
    element.style.setProperty('--path-length', `${length}px`);
    element.style.setProperty('--highlight-travel-offset', `${-(length * 0.75)}px`);
  };

  const getLocalPoint = (event: MouseEvent | PointerEvent) => {
    if (!chartSvg || !(chartSvg instanceof SVGSVGElement) || !chartSvg.createSVGPoint) return null;
    const point = chartSvg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = chartSvg.getScreenCTM();
    if (!matrix) return null;
    return point.matrixTransform(matrix.inverse());
  };

  const setGlowPosition = (event: MouseEvent | PointerEvent) => {
    const localPoint = getLocalPoint(event);
    if (!localPoint) return;
    glowSpots.forEach((spot) => {
      if (!(spot instanceof SVGCircleElement)) return;
      spot.setAttribute('cx', localPoint.x.toFixed(2));
      spot.setAttribute('cy', localPoint.y.toFixed(2));
    });
  };

  const resetGlowPosition = () => {
    glowSpots.forEach((spot) => {
      if (!(spot instanceof SVGCircleElement)) return;
      spot.setAttribute('cx', center.toFixed(2));
      spot.setAttribute('cy', center.toFixed(2));
    });
  };

  const getClosestPathOffset = (points: Point[], target: DOMPoint | null) => {
    if (!points?.length || !target) return 0;
    let bestDist = Infinity;
    let bestOffset = 0;
    let accumulated = 0;

    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const segLenSq = dx * dx + dy * dy;
      const segLen = Math.sqrt(segLenSq);
      if (!segLen) continue;

      const t = Math.max(0, Math.min(1, ((target.x - start.x) * dx + (target.y - start.y) * dy) / segLenSq));
      const projX = start.x + t * dx;
      const projY = start.y + t * dy;
      const distSq = (target.x - projX) ** 2 + (target.y - projY) ** 2;

      if (distSq < bestDist) {
        bestDist = distSq;
        bestOffset = accumulated + (t * segLen);
      }

      accumulated += segLen;
    }

    return bestOffset;
  };

  const getPathLengthFromPoints = (points: Point[]) => {
    if (!points?.length) return 0;
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length];
      total += Math.hypot(end.x - start.x, end.y - start.y);
    }
    return total;
  };

  const getPointAtOffset = (points: Point[], offset: number) => {
    if (!points?.length) return null;
    const total = getPathLengthFromPoints(points);
    let remaining = ((offset % total) + total) % total;

    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const segLen = Math.hypot(dx, dy);
      if (segLen === 0) continue;
      if (remaining <= segLen) {
        const t = remaining / segLen;
        return {
          x: start.x + t * dx,
          y: start.y + t * dy,
          angle: Math.atan2(dy, dx)
        };
      }
      remaining -= segLen;
    }
    return null;
  };

  const getSparkColor = (baseColor: string) => {
    const rgb = baseColor.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
    const variance = 35;
    const channel = (value: number) => Math.max(0, Math.min(255, value + (Math.random() * variance - variance / 2)));
    const [r, g, b] = rgb;
    return `rgba(${channel(r)}, ${channel(g)}, ${channel(b)}, ${0.6 + Math.random() * 0.35})`;
  };

  const spawnSparks = (layer: Element | null, points: Point[], startOffset: number, baseColor: string) => {
    if (!(layer instanceof SVGGElement)) return;
    const pathLength = getPathLengthFromPoints(points);
    if (!pathLength) return;

    const sparkCount = 18;
    const sparks = Array.from({ length: sparkCount }, () => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('spark');
      circle.setAttribute('r', (0.8 + Math.random() * 2.4).toFixed(2));
      if (baseColor) {
        circle.style.fill = getSparkColor(baseColor);
      }
      layer.appendChild(circle);
      const life = 420 + Math.random() * 900;
      return {
        circle,
        offset: (startOffset - Math.random() * (pathLength * 0.06) + pathLength) % pathLength,
        speed: (pathLength * (0.18 + Math.random() * 0.12)) / life,
        drift: (Math.random() * 2 - 1) * (10 + Math.random() * 14),
        angleOffset: (Math.random() * 0.9 - 0.45),
        life
      };
    });

    const startTime = performance.now();

    const tick = (time: number) => {
      const elapsed = time - startTime;
      let active = false;

      sparks.forEach((spark) => {
        const age = elapsed;
        if (age >= spark.life) {
          spark.circle.remove();
          return;
        }
        active = true;
        const progress = age / spark.life;
        const offset = spark.offset + (spark.speed * age);
        const point = getPointAtOffset(points, offset);
        if (!point) return;

        const normalAngle = point.angle + (spark.drift >= 0 ? Math.PI / 2 : -Math.PI / 2) + spark.angleOffset;
        const drift = spark.drift * (1 - progress);
        const jitter = (Math.random() - 0.5) * 1.2;
        const x = point.x + Math.cos(normalAngle) * drift + jitter;
        const y = point.y + Math.sin(normalAngle) * drift + jitter;
        spark.circle.setAttribute('cx', x.toFixed(2));
        spark.circle.setAttribute('cy', y.toFixed(2));
        spark.circle.style.opacity = `${0.9 * (1 - progress)}`;
      });

      if (active) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const triggerEdgeHighlight = (
    elements: Array<Element | null>,
    startOffset = 0,
    sparkConfig: { layer: Element | null; points: Point[]; color: string } | null = null
  ) => {
    const [core, glow, sparks] = elements;
    if (!(core instanceof SVGPathElement)) return;
    if (core.dataset.running === 'true') return;
    core.dataset.running = 'true';

    [core, glow, sparks].forEach((element) => {
      if (!(element instanceof SVGPathElement)) return;
      element.style.setProperty('--highlight-start-offset', `${-startOffset}px`);
      element.classList.remove('animate');
    });

    void core.getBoundingClientRect();
    [core, glow, sparks].forEach((element) => {
      if (!(element instanceof SVGPathElement)) return;
      element.classList.add('animate');
    });

    if (sparkConfig) {
      spawnSparks(sparkConfig.layer, sparkConfig.points, startOffset, sparkConfig.color);
    }
  };

  const handleMouseEnter = (categoryIndex: number) => {
    if (typeof categoryIndex !== 'number' || Number.isNaN(categoryIndex)) return;
    if (activeCategoryIndex === categoryIndex) return;

    clearHighlights(activeCategoryIndex);

    const category = categoryData[categoryIndex];
    if (!category) return;

    activeCategoryIndex = categoryIndex;

    root.querySelector(`.category-label[data-category="${categoryIndex}"]`)?.classList.add('highlighted');

    proficiencyPolygon?.classList.add('dimmed');
    const wedge = root.querySelector(`.goal-wedge[data-category="${categoryIndex}"]`);
    if (wedge) wedge.classList.add('visible');

    const migrationLine = root.querySelector(`.migration-line[data-category="${categoryIndex}"]`);
    if (migrationLine) migrationLine.classList.add('visible');

    updateDetailsPanel(category, true);
  };

  labels.forEach((label) => {
    const raw = label.getAttribute('data-category');
    const categoryIndex = raw ? parseInt(raw, 10) : NaN;
    label.addEventListener('mouseenter', (event) => {
      handleMouseEnter(categoryIndex);
      const localPoint = getLocalPoint(event as MouseEvent);
      const proficiencyOffset = getClosestPathOffset(proficiencyPoints, localPoint);
      const experienceOffset = getClosestPathOffset(experiencePoints, localPoint);
      triggerEdgeHighlight(
        [proficiencyHighlightCore, proficiencyHighlightGlow, proficiencyHighlightSparks],
        proficiencyOffset,
        { layer: proficiencySparkLayer, points: proficiencyPoints, color: '6, 182, 212' }
      );
      triggerEdgeHighlight(
        [experienceHighlightCore, experienceHighlightGlow, experienceHighlightSparks],
        experienceOffset,
        { layer: experienceSparkLayer, points: experiencePoints, color: '16, 185, 129' }
      );
    });
  });

  dataPoints.forEach((pointGroup) => {
    const raw = pointGroup.getAttribute('data-category');
    const categoryIndex = raw ? parseInt(raw, 10) : NaN;
    pointGroup.addEventListener('mouseenter', () => handleMouseEnter(categoryIndex));
  });

  [
    proficiencyHighlightCore,
    proficiencyHighlightGlow,
    proficiencyHighlightSparks,
    experienceHighlightCore,
    experienceHighlightGlow,
    experienceHighlightSparks
  ].forEach((element) => {
    setEdgeHighlightMetrics(element);
  });

  const wireHighlightReset = (core: Element | null, glow: Element | null, sparks: Element | null) => {
    if (!(core instanceof SVGPathElement)) return;
    core.addEventListener('animationend', () => {
      core.dataset.running = 'false';
      [core, glow, sparks].forEach((element) => {
        if (element instanceof SVGPathElement) {
          element.classList.remove('animate');
        }
      });
    });
  };

  wireHighlightReset(proficiencyHighlightCore, proficiencyHighlightGlow, proficiencyHighlightSparks);
  wireHighlightReset(experienceHighlightCore, experienceHighlightGlow, experienceHighlightSparks);

  proficiencyPolygon?.addEventListener('mouseenter', (event) => {
    const localPoint = getLocalPoint(event as MouseEvent);
    const startOffset = getClosestPathOffset(proficiencyPoints, localPoint);
    triggerEdgeHighlight(
      [proficiencyHighlightCore, proficiencyHighlightGlow, proficiencyHighlightSparks],
      startOffset,
      { layer: proficiencySparkLayer, points: proficiencyPoints, color: '6, 182, 212' }
    );
  });

  experiencePolygon?.addEventListener('mouseenter', (event) => {
    const localPoint = getLocalPoint(event as MouseEvent);
    const startOffset = getClosestPathOffset(experiencePoints, localPoint);
    triggerEdgeHighlight(
      [experienceHighlightCore, experienceHighlightGlow, experienceHighlightSparks],
      startOffset,
      { layer: experienceSparkLayer, points: experiencePoints, color: '16, 185, 129' }
    );
  });

  if (chartSvg) {
    let frame = 0;
    const handleGlowMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setGlowPosition(event);
      });
    };
    chartSvg.addEventListener('pointermove', handleGlowMove);
    chartSvg.addEventListener('pointerleave', resetGlowPosition);
    resetGlowPosition();
  }

  const initialCategoryName = 'Programming Languages';
  let initialCategoryIndex = categoryData.findIndex((cat) => cat.name === initialCategoryName);
  if (initialCategoryIndex === -1 && categoryData.length > 0) initialCategoryIndex = 0;
  if (initialCategoryIndex !== -1) {
    handleMouseEnter(initialCategoryIndex);
  }

  setDetailsPanelMinHeight();

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      setDetailsPanelMinHeight();
    });
  });
}

function initSkillsRadars(): void {
  const roots = document.querySelectorAll('[data-skills-radar]');
  roots.forEach((root) => {
    const element = root as HTMLElement;
    const payload = parseSkillsRadarPayload(element);
    if (!payload) return;
    initSkillsRadar(element, payload);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillsRadars, { once: true });
} else {
  initSkillsRadars();
}

document.addEventListener('astro:after-swap', initSkillsRadars);
