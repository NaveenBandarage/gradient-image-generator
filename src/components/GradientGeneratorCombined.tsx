"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Download,
  Copy,
  Shuffle,
  Grid,
  Circle,
  Square,
  Waves,
} from "lucide-react";
import dynamic from "next/dynamic";

// Reference to preset patterns from original GradientGenerator
const PRESET_PATTERNS = [
  { name: "Linear", icon: <Grid size={16} /> },
  { name: "Radial", icon: <Circle size={16} /> },
  { name: "Conic", icon: <Square size={16} /> },
  { name: "Wave", icon: <Waves size={16} /> },
];

// Reference to preset gradients from original GradientGenerator
const PRESET_GRADIENTS = [
  { name: "Midnight", colors: ["#1F2937", "#9CA3AF"] },
  { name: "Ocean", colors: ["#0EA5E9", "#2563EB"] },
  { name: "Sunset", colors: ["#F43F5E", "#7C3AED"] },
  { name: "Forest", colors: ["#059669", "#10B981"] },
  { name: "Dawn", colors: ["#D946EF", "#EC4899"] },
];

const RESOLUTIONS = [
  { name: "1080p", width: 1920, height: 1080 },
  { name: "2K", width: 2560, height: 1440 },
  { name: "4K", width: 3840, height: 2160 },
  { name: "5K", width: 5120, height: 2880 },
];

// Add this to the existing constants at the top
const NOISE_TYPES = [
  { name: "Perlin", value: "perlin" },
  { name: "Simplex", value: "simplex" },
  { name: "Worley", value: "worley" },
];

// Dynamically import Scene3D with NoSSR
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 animate-pulse rounded-lg" />
  ),
});

const GradientGeneratorCombined = () => {
  const [colors, setColors] = useState(["#1F2937", "#9CA3AF"]);
  const [angle, setAngle] = useState(45);
  const [pattern, setPattern] = useState("Linear");
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [noiseEnabled, setNoiseEnabled] = useState(false);
  const [noiseType, setNoiseType] = useState(NOISE_TYPES[0].value);
  const [noiseIntensity, setNoiseIntensity] = useState(0.3);
  const [noiseScale, setNoiseScale] = useState(50);

  const generateGradientStyle = () => {
    let gradient;
    switch (pattern) {
      case "Radial":
        gradient = `radial-gradient(circle at center, ${colors.join(", ")})`;
        break;
      case "Conic":
        gradient = `conic-gradient(from ${angle}deg at center, ${colors.join(
          ", "
        )})`;
        break;
      case "Wave":
        gradient = `
          linear-gradient(${angle}deg, ${colors.join(", ")}),
          repeating-linear-gradient(${
            angle + 45
          }deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)
        `;
        break;
      default:
        gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    }

    if (noiseEnabled) {
      return `
        background-image: ${gradient},
        url('data:image/svg+xml,${encodeURIComponent(`
          <svg width="${noiseScale}" height="${noiseScale}" viewBox="0 0 ${noiseScale} ${noiseScale}"
            xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="${
                noiseIntensity / 100
              }" numOctaves="4"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)"/>
          </svg>
        `)}')`;
    }

    return gradient;
  };

  const exportGradient = async (format = "png") => {
    const canvas = document.createElement("canvas");
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `gradient.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="w-full max-w-4xl p-6 space-y-6 bg-black/90 rounded-lg text-white">
      <div className="h-[500px] w-full rounded-lg overflow-hidden">
        <Scene3D
          colors={colors}
          angle={angle}
          pattern={pattern}
          noiseEnabled={noiseEnabled}
          noiseType={noiseType}
          noiseIntensity={noiseIntensity}
          noiseScale={noiseScale}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...colors];
                    newColors[index] = e.target.value;
                    setColors(newColors);
                  }}
                  className="h-10 w-20"
                />
                {colors.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newColors = colors.filter((_, i) => i !== index);
                      setColors(newColors);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {colors.length < 5 && (
              <Button
                variant="outline"
                onClick={() => setColors([...colors, "#000000"])}
              >
                Add Color
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Angle</label>
            <Slider
              value={[angle]}
              onValueChange={(value) => setAngle(value[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          {/* Add noise controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Noise</label>
              <Button
                variant={noiseEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setNoiseEnabled(!noiseEnabled)}
              >
                {noiseEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {noiseEnabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Noise Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {NOISE_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={
                          noiseType === type.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setNoiseType(type.value)}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60">
                    Noise Intensity
                  </label>
                  <Slider
                    value={[noiseIntensity]}
                    onValueChange={(value) => setNoiseIntensity(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60">Noise Scale</label>
                  <Slider
                    value={[noiseScale]}
                    onValueChange={(value) => setNoiseScale(value[0])}
                    min={10}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="patterns" className="w-full">
            <TabsList className="w-full bg-white/5">
              <TabsTrigger value="patterns" className="flex-1">
                Patterns
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex-1">
                Presets
              </TabsTrigger>
              <TabsTrigger value="export" className="flex-1">
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PATTERNS.map((p) => (
                  <Button
                    key={p.name}
                    variant={pattern === p.name ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => setPattern(p.name)}
                  >
                    {p.icon}
                    {p.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="presets" className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GRADIENTS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="w-full"
                    onClick={() => setColors(preset.colors)}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{
                        background: `linear-gradient(to right, ${preset.colors.join(
                          ", "
                        )})`,
                      }}
                    />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => exportGradient("png")}
                    className="w-full"
                  >
                    <Download size={16} className="mr-2" />
                    PNG
                  </Button>
                  <Button
                    onClick={() => exportGradient("jpeg")}
                    className="w-full"
                  >
                    <Download size={16} className="mr-2" />
                    JPEG
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Resolution</label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESOLUTIONS.map((res) => (
                      <Button
                        key={res.name}
                        variant="outline"
                        className={`w-full ${
                          resolution === res ? "bg-white/10" : ""
                        }`}
                        onClick={() => setResolution(res)}
                      >
                        {res.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const css = generateGradientStyle();
            navigator.clipboard.writeText(`background: ${css};`);
          }}
        >
          <Copy size={16} className="mr-2" />
          Copy CSS
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const randomColor = () =>
              "#" + Math.floor(Math.random() * 16777215).toString(16);
            setColors(colors.map(() => randomColor()));
          }}
        >
          <Shuffle size={16} className="mr-2" />
          Randomize
        </Button>
      </div>
    </div>
  );
};

export default GradientGeneratorCombined;
