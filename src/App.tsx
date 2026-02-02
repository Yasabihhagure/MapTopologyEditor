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
import { Download, Type } from 'lucide-react'
import { Button } from './components/ui/button'
import { ZoomControls } from './components/MapCanvas/ZoomControls'

function App() {
  const { project, selectedElement, nodes, ways, interactionMode, removeNode, removeWay, selectElement, showWayNames, setShowWayNames, measureDistance } = useMapStore()

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
      project: project,
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

  const Header = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">地図画像トポロジーエディタ</h1>
        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Ver: β2</span>
      </div>
      <div className="flex gap-2">
        {project.mapImage && (
          <>
            <Button
              variant={showWayNames ? "default" : "outline"}
              size="sm"
              onClick={() => setShowWayNames(!showWayNames)}
              title="リンク名を表示/非表示"
            >
              <Type className="w-4 h-4" />
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
      <span>Scale: {project.scale ? `${project.scale.actualDistance} ${project.scale.unit}` : '未設定'}</span>
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
          canvas = {
          < div className="relative w-full h-full">
        <MapCanvas>
          <TopologyLayer />
          <DistanceMeasurer />
        </MapCanvas>
        <div className="absolute top-4 right-4 z-10">
          <ZoomControls />
        </div>
      </div>
        }
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
