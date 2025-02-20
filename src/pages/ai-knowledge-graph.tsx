import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import Head from 'next/head';

const AIKnowledgeGraph = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear out any existing SVG (useful during hot-reloads)
    d3.select(containerRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #ccc');

    // Sample nodes and links representing an AI agent's knowledge graph
    const nodes = [
      { id: 'Agent', group: 1 },
      { id: 'Data', group: 2 },
      { id: 'Processing', group: 2 },
      { id: 'Understanding', group: 2 },
      { id: 'Action', group: 2 }
    ];

    const links = [
      { source: 'Agent', target: 'Data' },
      { source: 'Agent', target: 'Processing' },
      { source: 'Agent', target: 'Understanding' },
      { source: 'Agent', target: 'Action' },
      { source: 'Data', target: 'Processing' },
      { source: 'Processing', target: 'Understanding' }
    ];

    // Initialize the force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links (lines)
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 2);

    // Draw nodes as circles
    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .attr('fill', d => (d.group === 1 ? '#ff5722' : '#2196f3'))
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Add node labels
    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text(d => d.id)
      .style('fill', '#fff')
      .style('pointer-events', 'none');

    // Update positions for nodes and links on every simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);

      label.attr('x', d => d.x).attr('y', d => d.y);
    });

    // Drag event handlers
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup the simulation on component unmount
    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-egg-yellow relative">
      <Head>
        <title>AI Agent Knowledge Graph - Nemwork</title>
        <meta name="description" content="Visualizing AI Agent's Knowledge Graph" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header className="w-full py-6 bg-deep-purple shadow-lg">
        <h1 className="text-5xl font-bold text-egg-yellow text-center title-font">
          Nemwork
        </h1>
      </header>
      <div className="container mx-auto p-6">
        <h1 className="text-center text-4xl font-bold mb-4 pixel-font">
          AI Agent Knowledge Graph
        </h1>
        <div ref={containerRef} className="flex justify-center mt-6" />
      </div>
      <div className="fixed bottom-0 w-full flex justify-center">
        <div className="relative w-full h-[150px] rounded-t-[100%] bg-[rgba(211,211,211,0.5)] overflow-hidden">
          <p className="text-center pixel-font text-lg italic mt-4">
            Every Nemo is connected through this Nemwork
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIKnowledgeGraph; 