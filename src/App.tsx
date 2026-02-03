import { useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout'
import { MapCanvas } from './components/MapCanvas/MapImage'
import { TopologyLayer } from './components/MapCanvas/TopologyLayer'
import { ModeSwitcher } from './components/Editor/ModeSwitcher'
import { NodeList } from './components/Editor/NodeList'
import { NodeEditor } from './components/Editor/NodeEditor'

import { WayEditor } from './components/Editor/WayEditor'
import { ScaleSetting } from './components/Editor/ScaleSetting'
import { DistanceMeasurer } from './components/MapCanvas/DistanceMeasurer'
import { useMapStore } from './store/useMapStore'
import { Download, Type, Image as ImageIcon, Eye, Activity } from 'lucide-react'
import { Button } from './components/ui/button'
import { ZoomControls } from './components/MapCanvas/ZoomControls'
import html2canvas from 'html2canvas'; // Import html2canvas

function App() {
  const {
    project, selectedElement, nodes, ways, interactionMode,
    removeNode, removeWay, selectElement,
    showWayNames, setShowWayNames, measureDistance,
    showNodes, setShowNodes,
    showWays, setShowWays,
    setShowZoomControls
  } = useMapStore()

  // Global Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement?.type === 'node') {
          if (confirm("選択中のノードを削除しますか？")) {
            removeNode(selectedElement.id);
            selectElement(null);
          }
        } else if (selectedElement?.type === 'way') {
          if (confirm("選択中のWayを削除しますか？")) {
            removeWay(selectedElement.id);
            selectElement(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, removeNode, removeWay, selectElement]);

  const handleDownload = () => {
    const data = {
      project: {
        ...project,
        scale: project.scale ? {
          ...project.scale,
          scale_px_per_unit: (() => {
            const { p1, p2, actualDistance } = project.scale;
            const { width, height } = project.mapImageSize!;
            const dx = (p2.x - p1.x) * width;
            const dy = (p2.y - p1.y) * height;
            const pixelDistance = Math.sqrt(dx * dx + dy * dy);
            return pixelDistance / actualDistance;
          })()
        } : null
      },
      nodes: nodes,
      ways: ways
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map_topology.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageDownload = async () => {
    // 1. Hide UI elements
    const prevShowNodes = useMapStore.getState().showNodes;
    const prevShowWays = useMapStore.getState().showWays;
    const prevShowZoomControls = useMapStore.getState().showZoomControls;
    // Note: We might want to keep Nodes and Ways visible for the screenshot, 
    // but the requirement says "Node, Way, Zoom buttons hidden".
    // Wait context: "nodeとwayを非表示にし。拡大縮小のボタンも非表示にした状態の画像をダウンロードしてください。"

    setShowNodes(false);
    setShowWays(false);
    setShowZoomControls(false);

    // Wait for render cycle
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Actually MapCanvas component returns a div. We should probably target the specific element.
      // Looking at MapImage.tsx: className="w-full h-full relative cursor-crosshair..."
      // Let's rely on finding the element or add a Ref if needed. 
      // For now, let's target the element containing the image and SVG.
      // In App.tsx: <MapCanvas> is wrapped in <div className="relative w-full h-full">.
      // Let's add an ID or class to that wrapper for stable targeting.
      const elementToCapture = document.getElementById('map-capture-target');

      if (elementToCapture) {
        const canvas = await html2canvas(elementToCapture, {
          useCORS: true, // For map image if external (though usually local blob or same domain)
          scale: 2, // Better quality
          logging: false
        });

        const link = document.createElement('a');
        link.download = 'map_capture.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        alert("キャプチャ対象が見つかりませんでした。");
      }

    } catch (error) {
      console.error("Image capture failed:", error);
      alert("画像の保存に失敗しました。");
    } finally {
      // Restore state
      setShowNodes(prevShowNodes);
      setShowWays(prevShowWays);
      setShowZoomControls(prevShowZoomControls);
    }
  };

  const Header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">地図画像トポロジーエディタ</h1>
        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Ver: v1.0.1</span>
      </div>
      <div className="flex gap-2">
        {project.mapImage && (
          <>
            <div className="border-r pr-2 mr-2 flex gap-1">
              <Button
                variant={showNodes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNodes(!showNodes)}
                title="Nodeを表示/非表示"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant={showWays ? "default" : "outline"}
                size="sm"
                onClick={() => setShowWays(!showWays)}
                title="Wayを表示/非表示"
              >
                <Activity className="w-4 h-4" />
              </Button>
              <Button
                variant={showWayNames ? "default" : "outline"}
                size="sm"
                onClick={() => setShowWayNames(!showWayNames)}
                title="リンク名を表示/非表示"
              >
                <Type className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={handleImageDownload}>
              <ImageIcon className="w-4 h-4 mr-2" />
              画像保存
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              JSON出力
            </Button>
          </>
        )}
      </div>
    </div>
  )

  const Toolbar = (
    <div className="space-y-4">
      <ModeSwitcher />

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">地図操作</h3>
        <ScaleSetting />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">プロパティ</h3>
        {selectedElement?.type === 'node' && <NodeEditor />}
        {selectedElement?.type === 'way' && <WayEditor />}
        {!selectedElement && (
          <div className="text-sm text-muted-foreground px-2">
            要素を選択すると編集できます。
          </div>
        )}
      </div>
    </div>
  )

  const StatusCode = (
    <div className="flex gap-4">
      <span>Nodes: {nodes.length}</span>
      <span>Ways: {ways.length}</span>
      <span>Scale: {project.scale ? (() => {
        const { p1, p2, actualDistance, unit } = project.scale;
        const { width, height } = project.mapImageSize!;
        const dx = (p2.x - p1.x) * width;
        const dy = (p2.y - p1.y) * height;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        const pxPerUnit = pixelDistance / actualDistance;
        return `${pxPerUnit.toFixed(2)} px/${unit}`;
      })() : '未設定'}</span>
      {measureDistance !== null && (
        <span className="font-bold text-red-500">
          計測: {project.scale ? `${measureDistance.toFixed(2)} ${project.scale.unit}` : `${Math.round(measureDistance)} px`}
        </span>
      )}
    </div>
  )

  return (
    <>
      <MainLayout
        header={Header}
        toolbar={Toolbar}
        statusbar={StatusCode}
        canvas={
          <div id="map-capture-target" className="relative w-full h-full">
            <MapCanvas>
              <TopologyLayer />
              <DistanceMeasurer />
            </MapCanvas>
            <div className="absolute top-4 right-4 z-10">
              <ZoomControls />
            </div>
          </div>
        }
        rightSidebar={<NodeList />}
      />

      {interactionMode !== 'idle' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {interactionMode === 'scale_p1' && "点1 (P1) をクリックしてください"}
          {interactionMode === 'scale_p2' && "点2 (P2) をクリックしてください"}
        </div>
      )}
    </>
  )

}

export default App
