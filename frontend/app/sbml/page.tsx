"use client"

import { useState } from "react"
import { Code, Download, Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XmlViewer } from "@/components/xml-viewer"

export default function SBMLPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [sbmlContent, setSbmlContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRetrieveSBML = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }

    setIsLoading(true)
    setError("")

    // Mock SBML content for demonstration
    const mockSbmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core" level="3" version="1">
  <model id="CardiacMyocyteCalciumDynamics" name="Cardiac Myocyte Calcium Dynamics" substanceUnits="mole" timeUnits="second" volumeUnits="litre" areaUnits="metre_squared" lengthUnits="metre" extentUnits="mole">
    <notes>
      <body xmlns="http://www.w3.org/1999/xhtml">
        <p>A comprehensive model of calcium handling in cardiac myocytes including L-type calcium channels, ryanodine receptors, and SERCA pumps.</p>
        <p>This model describes the dynamics of calcium ions in the cytoplasm and sarcoplasmic reticulum, including calcium binding to calmodulin.</p>
      </body>
    </notes>
    
    <listOfUnitDefinitions>
      <unitDefinition id="per_second">
        <listOfUnits>
          <unit kind="second" exponent="-1"/>
        </listOfUnits>
      </unitDefinition>
      <unitDefinition id="micromolar">
        <listOfUnits>
          <unit kind="mole" exponent="1" scale="-6"/>
          <unit kind="litre" exponent="-1"/>
        </listOfUnits>
      </unitDefinition>
      <unitDefinition id="micromolar_per_second">
        <listOfUnits>
          <unit kind="mole" exponent="1" scale="-6"/>
          <unit kind="litre" exponent="-1"/>
          <unit kind="second" exponent="-1"/>
        </listOfUnits>
      </unitDefinition>
      <unitDefinition id="per_micromolar3_per_second">
        <listOfUnits>
          <unit kind="mole" exponent="-3" scale="18"/>
          <unit kind="litre" exponent="3"/>
          <unit kind="second" exponent="-1"/>
        </listOfUnits>
      </unitDefinition>
    </listOfUnitDefinitions>
    
    <listOfCompartments>
      <compartment id="cytosol" name="Cytoplasm" spatialDimensions="3" size="1" constant="true"/>
      <compartment id="SR" name="Sarcoplasmic Reticulum" spatialDimensions="3" size="0.1" constant="true"/>
    </listOfCompartments>
    
    <listOfSpecies>
      <species id="Ca_cyt" name="Cytoplasmic Calcium" compartment="cytosol" initialConcentration="0.1" substanceUnits="micromolar" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="Ca_SR" name="SR Calcium" compartment="SR" initialConcentration="100" substanceUnits="micromolar" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="CaM_cyt" name="Cytoplasmic Calmodulin" compartment="cytosol" initialConcentration="10" substanceUnits="micromolar" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="CaCaM_cyt" name="Calcium-Calmodulin Complex" compartment="cytosol" initialConcentration="0" substanceUnits="micromolar" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    
    <listOfParameters>
      <parameter id="Kf" name="Forward Rate Constant" value="0.001" units="per_micromolar3_per_second" constant="true"/>
      <parameter id="Kr" name="Reverse Rate Constant" value="1" units="per_second" constant="true"/>
      <parameter id="Vmax" name="Maximum SERCA Velocity" value="10" units="micromolar_per_second" constant="true"/>
      <parameter id="Km" name="SERCA Km" value="0.5" units="micromolar" constant="true"/>
    </listOfParameters>
    
    <listOfReactions>
      <reaction id="Ca_CaM_binding" name="Calcium-Calmodulin Binding" reversible="true">
        <notes>
          <body xmlns="http://www.w3.org/1999/xhtml">
            <p>Binding of 4 calcium ions to calmodulin to form the calcium-calmodulin complex</p>
          </body>
        </notes>
        <listOfReactants>
          <speciesReference species="Ca_cyt" stoichiometry="4"/>
          <speciesReference species="CaM_cyt" stoichiometry="1"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="CaCaM_cyt" stoichiometry="1"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <minus/>
              <apply>
                <times/>
                <ci>Kf</ci>
                <apply>
                  <power/>
                  <ci>Ca_cyt</ci>
                  <cn>4</cn>
                </apply>
                <ci>CaM_cyt</ci>
              </apply>
              <apply>
                <times/>
                <ci>Kr</ci>
                <ci>CaCaM_cyt</ci>
              </apply>
            </apply>
          </math>
        </kineticLaw>
      </reaction>
      
      <reaction id="SERCA_pump" name="SERCA Calcium Pump" reversible="false">
        <notes>
          <body xmlns="http://www.w3.org/1999/xhtml">
            <p>Calcium uptake into the sarcoplasmic reticulum via SERCA pumps</p>
          </body>
        </notes>
        <listOfReactants>
          <speciesReference species="Ca_cyt" stoichiometry="2"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="Ca_SR" stoichiometry="2"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <divide/>
              <apply>
                <times/>
                <ci>Vmax</ci>
                <apply>
                  <power/>
                  <ci>Ca_cyt</ci>
                  <cn>2</cn>
                </apply>
              </apply>
              <apply>
                <plus/>
                <apply>
                  <power/>
                  <ci>Km</ci>
                  <cn>2</cn>
                </apply>
                <apply>
                  <power/>
                  <ci>Ca_cyt</ci>
                  <cn>2</cn>
                </apply>
              </apply>
            </apply>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
    
    <listOfEvents>
      <event id="calcium_release" name="Calcium Release Event">
        <notes>
          <body xmlns="http://www.w3.org/1999/xhtml">
            <p>Triggered calcium release from the sarcoplasmic reticulum</p>
          </body>
        </notes>
        <trigger>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <ci>Ca_cyt</ci>
              <cn>0.5</cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments>
          <eventAssignment variable="Ca_SR">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply>
                <times/>
                <ci>Ca_SR</ci>
                <cn>0.9</cn>
              </apply>
            </math>
          </eventAssignment>
          <eventAssignment variable="Ca_cyt">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply>
                <plus/>
                <ci>Ca_cyt</ci>
                <apply>
                  <times/>
                  <ci>Ca_SR</ci>
                  <cn>0.1</cn>
                </apply>
              </apply>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
    
    <listOfConstraints>
      <constraint>
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <geq/>
            <ci>Ca_cyt</ci>
            <cn>0</cn>
          </apply>
        </math>
        <message>
          <p xmlns="http://www.w3.org/1999/xhtml">Cytoplasmic calcium concentration must be non-negative</p>
        </message>
      </constraint>
      <constraint>
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <geq/>
            <ci>Ca_SR</ci>
            <cn>0</cn>
          </apply>
        </math>
        <message>
          <p xmlns="http://www.w3.org/1999/xhtml">SR calcium concentration must be non-negative</p>
        </message>
      </constraint>
    </listOfConstraints>
  </model>
</sbml>`

    // Simulate API delay
    setTimeout(() => {
      setSbmlContent(mockSbmlContent)
      setIsLoading(false)
    }, 1000)
  }

  const handleDownload = () => {
    if (!sbmlContent) return

    const blob = new Blob([sbmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `biomodel_${biomodelId}.sbml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sbmlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SBML File Retrieval</h1>
          <p className="text-slate-600">Retrieve and download Systems Biology Markup Language files for biomodels.</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Code className="h-5 w-5" />
              Biomodel SBML Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its SBML file content</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="biomodelId" className="text-slate-700 font-medium">
                  Biomodel ID
                </Label>
                <Input
                  id="biomodelId"
                  placeholder="Enter biomodel ID (e.g., 123456789)"
                  value={biomodelId}
                  onChange={(e) => setBiomodelId(e.target.value)}
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleRetrieveSBML}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Retrieving..." : "Retrieve SBML"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* SBML Content Display */}
        {sbmlContent && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">SBML File Content</CardTitle>
                  <CardDescription>Biomodel ID: {biomodelId}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-8">
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white h-8">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <XmlViewer data={sbmlContent} title="SBML File" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
