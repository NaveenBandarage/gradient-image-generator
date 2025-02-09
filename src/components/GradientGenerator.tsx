"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Download,
  Copy,
  Shuffle,
  Grid,
  Circle,
  Square,
  Waves,
  Plus,
  Trash2,
} from "lucide-react";

const PRESET_PATTERNS = [
  { name: "Linear", icon: <Grid size={16} /> },
  { name: "Radial", icon: <Circle size={16} /> },
  { name: "Conic", icon: <Square size={16} /> },
  { name: "Wave", icon: <Waves size={16} /> },
];

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

const GradientGenerator = () => {
  const [colors, setColors] = useState(["#1F2937", "#9CA3AF"]);
  const [angle, setAngle] = useState(45);
  const [noiseIntensity, setNoiseIntensity] = useState(0.3);
  const [pattern, setPattern] = useState("Linear");
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [noiseEnabled, setNoiseEnabled] = useState(true);

  const removeColor = (indexToRemove) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, index) => index !== indexToRemove));
    }
  };

  const addColor = () => {
    if (colors.length < 5) {
      const lastColor = colors[colors.length - 1];
      const secondLastColor = colors[colors.length - 2];
      const newColor = interpolateColor(secondLastColor, lastColor);
      setColors([...colors, newColor]);
    }
  };

  const interpolateColor = (color1, color2) => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

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
        // Create a more complex wave pattern using multiple gradients
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

    return {
      width: "100%",
      height: "300px",
      borderRadius: "12px",
      background: gradient,
      position: "relative",
      overflow: "hidden",
    };
  };

  const exportGradient = async (format = "png") => {
    const canvas = document.createElement("canvas");
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    const ctx = canvas.getContext("2d");

    // Create gradient
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

    // Add noise if enabled
    if (noiseEnabled) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseIntensity * 50;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Download
    const link = document.createElement("a");
    link.download = `gradient.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="w-full max-w-4xl p-6 space-y-6 bg-black/90 rounded-lg text-white">
      <div style={generateGradientStyle()} className="shadow-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="relative group">
                <div className="flex flex-col items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...colors];
                      newColors[index] = e.target.value;
                      setColors(newColors);
                    }}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/20"
                  />
                  {colors.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 h-6 w-6 bg-white/10 hover:bg-red-500/20"
                      onClick={() => removeColor(index)}
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {colors.length < 5 && (
              <Button
                variant="ghost"
                className="w-12 h-12 border-2 border-dashed border-white/20 hover:border-white/40"
                onClick={addColor}
              >
                <Plus size={16} />
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

          <div className="space-y-2">
            <label className="text-sm text-white/60">Noise</label>
            <Slider
              value={[noiseIntensity * 100]}
              onValueChange={(value) => setNoiseIntensity(value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
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
            const css = `background: ${generateGradientStyle().background};`;
            navigator.clipboard.writeText(css);
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

export default GradientGenerator;
