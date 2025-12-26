import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import recapData from "../../data/analysis/recap2025.json";

// --- CONFIGURATION CONTROLS ---
const PIXEL_SIZE = 10;

// --- Types ---
type NodeData = {
  id: string;
  r: number;
  color: string;
  textColor: string;
  category: string;
  count: number;
  language: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

// --- Configuration ---
const CATEGORIES = [
  {
    id: "low-level",
    label: "Low Level",
    color: "#E63946",
    keywords: ["c", "c++", "rust", "assembly", "cuda", "objective-c++", "glsl"],
  },
  {
    id: "mobile",
    label: "Mobile",
    color: "#FF006E",
    keywords: ["kotlin", "swift", "dart", "objective-c"],
  },
  {
    id: "backend",
    label: "Backend",
    color: "#FFBE0B",
    keywords: ["go", "java", "ruby", "php", "elixir", "scala", "clojure", "hack"],
  },
  {
    id: "ai",
    label: "AI / Data",
    color: "#00F5D4",
    keywords: ["jupyter notebook", "r", "julia", "matlab"],
  },
  {
    id: "web",
    label: "Web / Frontend",
    color: "#3b82f6",
    keywords: ["html", "css", "javascript", "typescript", "vue", "scss", "less", "blade", "astro", "ejs", "svelte"]
,
  },
  {
    id: "Scripting",
    label: "Scripting / Embedded",
    color: "#06D6A0",
    keywords: ["shell", "batchfile", "tcl", "perl", "lua"],
  },
  {
    id: "devops",
    label: "DevOps / Infra",
    color: "#9B5DE5",
    keywords: ["shell", "batchfile", "tcl", "perl", "lua"]
,
  }
];

const CATEGORIZED_LANGUAGES = new Set(
  CATEGORIES.flatMap(cat => cat.keywords.map(k => k.toLowerCase()))
);

const MAX_LANGUAGES = 60;

const isLanguageCategorized = (lang: string): boolean => {
  const normalized = lang.toLowerCase();
  return CATEGORIZED_LANGUAGES.has(normalized);
};

const getCategoryInfo = (lang: string) => {
  const normalized = lang.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => normalized === k)) {
      return cat;
    }
  }
  return null;
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(1)}B`;
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(0)}M`;
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(0)}K`;
  }
  return bytes.toString();
};

const darkenColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace("#", ""), 16);

  const factor = 1 - percent / 100;

  const R = Math.round(((num >> 16) & 0xff) * factor);
  const G = Math.round(((num >> 8) & 0xff) * factor);
  const B = Math.round((num & 0xff) * factor);

  return `#${((1 << 24) + (R << 16) + (G << 8) + B)
    .toString(16)
    .slice(1)}`;
};


const getPixelCirclePath = (radius: number, pixelSize: number) => {
  let path = "";
  const steps = Math.ceil(radius / pixelSize);
  const rSq = radius * radius;

  for (let x = -steps; x <= steps; x++) {
    for (let y = -steps; y <= steps; y++) {
      const px = x * pixelSize;
      const py = y * pixelSize;
      const centerX = px + pixelSize / 2;
      const centerY = py + pixelSize / 2;

      if (centerX * centerX + centerY * centerY <= rSq) {
        path += `M${px},${py}h${pixelSize}v${pixelSize}h-${pixelSize}z`;
      }
    }
  }
  return path;
};

export default function Slide4({ color }: { color: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDims();
    window.addEventListener("resize", updateDims);
    const observer = new ResizeObserver(updateDims);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener("resize", updateDims);
      observer.disconnect();
    };
  }, []);

  const nodes: NodeData[] = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];

    const distribution: Record<string, number> =
      recapData?.languages?.distribution || {};

    const items = Object.entries(distribution)
      .map(([lang, count]) => ({
        language: lang,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);

    const filteredItems = items
      .filter((i) => i.count > 0 && isLanguageCategorized(i.language))
      .slice(0, MAX_LANGUAGES);

    if (filteredItems.length === 0) return [];

    const maxCount = Math.max(...filteredItems.map((d) => d.count));

    // Scale bubble sizes based on container - use smaller dimension as reference
    const containerSize = Math.min(dimensions.width, dimensions.height);
    const maxRadius = Math.max(30, containerSize * 0.12); // 12% of container, min 30px
    const minRadius = Math.max(18, containerSize * 0.045); // 4.5% of container, min 18px

    const scaleRadius = d3
      .scaleSqrt()
      .domain([0, maxCount])
      .range([minRadius, maxRadius]);

    return filteredItems
      .map((item) => {
        const catInfo = getCategoryInfo(item.language);
        if (!catInfo) return null;
        return {
          id: item.language,
          language: item.language,
          count: item.count,
          category: catInfo.id,
          color: catInfo.color,
          textColor: darkenColor(catInfo.color, 65),
          r: scaleRadius(item.count),
          x: 0,
          y: 0,
        } as NodeData;
      })
      .filter((node): node is NodeData => node !== null);
  }, [dimensions]);

  useEffect(() => {
    if (dimensions.width === 0 || nodes.length === 0) return;
    const { width, height } = dimensions;

    const needsInit = nodes.some(n => n.x === 0 && n.y === 0);

    if (needsInit) {
      // Initialize nodes near center with gentle spread - avoids chaotic rush-in
      nodes.forEach(node => {
        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.random() * Math.min(width, height) * 0.3;
        node.x = width / 2 + Math.cos(angle) * dist;
        node.y = height / 2 + Math.sin(angle) * dist;
      });
    }
  }, [nodes, dimensions]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    svg.selectAll("*").remove();
    const g = svg.append("g");

    const simulation = d3
      .forceSimulation(nodes)
      .alpha(0.3) // Start with low energy for gentle movement
      .alphaDecay(0.02) // Settle relatively quickly
      .force(
        "collide",
        d3.forceCollide().radius((d: any) => d.r + 3).strength(0.9)
      )
      .force("cluster", (alpha: number) => {
        const strength = 0.5;
        const centroids: Record<string, { x: number; y: number; count: number }> = {};

        nodes.forEach(d => {
          if (!centroids[d.category]) centroids[d.category] = { x: 0, y: 0, count: 0 };
          const c = centroids[d.category];
          c.x += (d.x || 0);
          c.y += (d.y || 0);
          c.count++;
        });

        nodes.forEach(d => {
          const c = centroids[d.category];
          if (!c) return;
          const targetX = c.x / c.count;
          const targetY = c.y / c.count;

          if (d.vx !== undefined) d.vx += (targetX - (d.x || 0)) * alpha * strength;
          if (d.vy !== undefined) d.vy += (targetY - (d.y || 0)) * alpha * strength;
        });
      })
      .velocityDecay(0.2); // Higher = more friction, calmer movement

    const nodeGroup = g
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("cursor", "grab")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    nodeGroup
      .append("path")
      .attr("d", (d: any) => getPixelCirclePath(d.r, PIXEL_SIZE))
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.2)
      .style("filter", "drop-shadow(4px 4px 0px rgba(0,0,0,0.2))")
      .attr("transform", "scale(0)")
      .transition()
      .duration(1000)
      .ease(d3.easeElasticOut)
      .attr("transform", "scale(1)");

    nodeGroup
      .append("text")
      .text((d: any) => d.language)
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("fill", (d: any) => d.textColor)
      .style("font-family", "'Press Start 2P', cursive")
      .style("font-size", (d: any) => {
        const maxWidth = d.r * 1.6;
        const charWidth = 0.6;
        const idealSize = maxWidth / (d.language.length * charWidth);
        return Math.max(6, Math.min(idealSize, 12)) + "px";
      })
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("opacity", 0)
      .transition()
      .delay(200)
      .duration(500)
      .style("opacity", 1);

    nodeGroup
      .filter((d: any) => d.r > 30)
      .append("text")
      .text((d: any) => formatBytes(d.count))
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("fill", (d: any) => d.textColor)
      .style("font-family", "'Press Start 2P', cursive")
      .style("font-size", (d: any) => Math.max(6, Math.min(d.r / 5, 9)) + "px")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("opacity", 0)
      .transition()
      .delay(300)
      .duration(500)
      .style("opacity", 0.8);

    simulation.on("tick", () => {
      nodes.forEach(d => {
        const padding = 10;
        d.x = Math.max(d.r + padding, Math.min(width - d.r - padding, d.x || 0));
        d.y = Math.max(d.r + padding, Math.min(height - d.r - padding, d.y || 0));
      });
      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.08).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target.parentNode).attr("cursor", "grabbing");
    }

    function dragged(event: any, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target.parentNode).attr("cursor", "grab");
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, dimensions]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 px-8 py-8 overflow-hidden w-full h-[calc(100vh-180px)] sm:px-12 sm:py-12 md:px-20 md:py-16">
      {/* Bubble container with neon border */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-5xl overflow-hidden"
        style={{
          border: `4px solid ${color}`,
          boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 20px ${color}20`,
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="block w-full h-full touch-none"
        />
      </div>

      {/* Legend */}
      <div className="z-10 flex flex-wrap justify-center gap-3 px-4 pointer-events-none shrink-0">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 px-3 py-1.5 border backdrop-blur-md"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}10`,
            }}
          >
            <div
              className="w-3 h-3"
              style={{
                backgroundColor: cat.color,
                boxShadow: `2px 2px 0px rgba(0,0,0,0.3)`,
              }}
            />
            <span
              className="text-xs tracking-wide md:text-sm font-pixel"
              style={{ color }}
            >
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
