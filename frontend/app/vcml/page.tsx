"use client"

import { useState } from "react"
import { FileText, Download, Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import XMLViewer from 'react-xml-viewer'

export default function VCMLPage() {
  const [biomodelId, setBiomodelId] = useState("")
  const [vcmlContent, setVcmlContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRetrieveVCML = async () => {
    if (!biomodelId.trim()) {
      setError("Please enter a biomodel ID")
      return
    }

    setIsLoading(true)
    setError("")

    // Mock VCML content for demonstration
    const mockVcmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<vcml xmlns="http://sourceforge.net/projects/vcell/vcml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://sourceforge.net/projects/vcell/vcml http://vcell.org/vcml">
  <BioModel Name="Cardiac Myocyte Calcium Dynamics" Description="A comprehensive model of calcium handling in cardiac myocytes">
    <Model Name="CalciumDynamics">
      <Compound Name="Ca">
        <Annotation>Calcium ion</Annotation>
      </Compound>
      <Compound Name="CaM">
        <Annotation>Calmodulin</Annotation>
      </Compound>
      <Compound Name="CaCaM">
        <Annotation>Calcium-Calmodulin complex</Annotation>
      </Compound>
      
      <Feature Name="cytosol" KeyValue="1">
        <Annotation>Cytoplasmic compartment</Annotation>
      </Feature>
      <Feature Name="SR" KeyValue="2">
        <Annotation>Sarcoplasmic reticulum</Annotation>
      </Feature>
      
      <LocalizedCompound Name="Ca_cyt" CompoundRef="Ca" Feature="cytosol" OverrideName="Ca_cyt"/>
      <LocalizedCompound Name="Ca_SR" CompoundRef="Ca" Feature="SR" OverrideName="Ca_SR"/>
      <LocalizedCompound Name="CaM_cyt" CompoundRef="CaM" Feature="cytosol" OverrideName="CaM_cyt"/>
      <LocalizedCompound Name="CaCaM_cyt" CompoundRef="CaCaM" Feature="cytosol" OverrideName="CaCaM_cyt"/>
      
      <SimpleReaction Structure="cytosol" Name="Ca_CaM_binding" FluxCarrierValence="0" FluxOption="MolecularOnly">
        <Reactant LocalizedCompoundRef="Ca_cyt" Stoichiometry="4"/>
        <Reactant LocalizedCompoundRef="CaM_cyt" Stoichiometry="1"/>
        <Product LocalizedCompoundRef="CaCaM_cyt" Stoichiometry="1"/>
        <Kinetics KineticsType="MassAction">
          <Parameter Name="Kf" Role="forward rate constant" Unit="uM-3.s-1">1.0E-3</Parameter>
          <Parameter Name="Kr" Role="reverse rate constant" Unit="s-1">1.0</Parameter>
        </Kinetics>
      </SimpleReaction>
      
      <Flux Name="SERCA_flux" FluxCarrierValence="0" FluxOption="MolecularOnly">
        <ReactantFlux LocalizedCompoundRef="Ca_cyt" Stoichiometry="2"/>
        <ProductFlux LocalizedCompoundRef="Ca_SR" Stoichiometry="2"/>
        <Kinetics KineticsType="GeneralKinetics">
          <Parameter Name="Vmax" Role="maximum velocity" Unit="uM.s-1">10.0</Parameter>
          <Parameter Name="Km" Role="Km" Unit="uM">0.5</Parameter>
          <Parameter Name="J" Role="flux" Unit="uM.s-1">(Vmax * pow(Ca_cyt, 2)) / (pow(Km, 2) + pow(Ca_cyt, 2))</Parameter>
        </Kinetics>
      </Flux>
      
      <Diagram Name="c0" Structure="cytosol">
        <LocalizedCompoundShape LocalizedCompoundRef="Ca_cyt" LocationX="100" LocationY="100" />
        <LocalizedCompoundShape LocalizedCompoundRef="CaM_cyt" LocationX="200" LocationY="100" />
        <LocalizedCompoundShape LocalizedCompoundRef="CaCaM_cyt" LocationX="300" LocationY="100" />
        <SimpleReactionShape SimpleReactionRef="Ca_CaM_binding" LocationX="250" LocationY="150" />
        <FluxReactionShape FluxReactionRef="SERCA_flux" LocationX="150" LocationY="200" />
      </Diagram>
    </Model>
    
    <SimulationSpec Name="Simulation1" Stochastic="false" UseConcentration="true">
      <Geometry Name="non-spatial" Dimension="0">
        <Extent X="10.0" Y="10.0" Z="10.0"/>
        <Origin X="0.0" Y="0.0" Z="0.0"/>
        <SubVolume Name="Compartment" Handle="0" Type="Compartmental"/>
      </Geometry>
      <GeometryContext>
        <FeatureMapping Feature="cytosol" GeometryClass="Compartment" SubVolume="Compartment" Size="1.0">
          <BoundariesTypes Xm="Flux" Xp="Flux" Ym="Flux" Yp="Flux" Zm="Flux" Zp="Flux"/>
        </FeatureMapping>
        <FeatureMapping Feature="SR" GeometryClass="Compartment" SubVolume="Compartment" Size="0.1">
          <BoundariesTypes Xm="Flux" Xp="Flux" Ym="Flux" Yp="Flux" Zm="Flux" Zp="Flux"/>
        </FeatureMapping>
      </GeometryContext>
      <ReactionContext>
        <LocalizedCompoundSpec LocalizedCompoundRef="Ca_cyt" ForceConstant="false" WellMixed="true">
          <InitialConcentration>0.1</InitialConcentration>
          <Diffusion>0.0</Diffusion>
        </LocalizedCompoundSpec>
        <LocalizedCompoundSpec LocalizedCompoundRef="Ca_SR" ForceConstant="false" WellMixed="true">
          <InitialConcentration>100.0</InitialConcentration>
          <Diffusion>0.0</Diffusion>
        </LocalizedCompoundSpec>
        <LocalizedCompoundSpec LocalizedCompoundRef="CaM_cyt" ForceConstant="false" WellMixed="true">
          <InitialConcentration>10.0</InitialConcentration>
          <Diffusion>0.0</Diffusion>
        </LocalizedCompoundSpec>
        <LocalizedCompoundSpec LocalizedCompoundRef="CaCaM_cyt" ForceConstant="false" WellMixed="true">
          <InitialConcentration>0.0</InitialConcentration>
          <Diffusion>0.0</Diffusion>
        </LocalizedCompoundSpec>
      </ReactionContext>
      <MathDescription Name="Simulation1_generated">
        <Constant Name="_F_">96480.0</Constant>
        <Constant Name="_F_nmol_">9.648E-5</Constant>
        <Constant Name="_K_GHK_">1.0E-9</Constant>
        <Constant Name="_N_pmol_">6.02E11</Constant>
        <Constant Name="_PI_">3.141592653589793</Constant>
        <Constant Name="_R_">8314.0</Constant>
        <Constant Name="_T_">300.0</Constant>
        <Constant Name="Ca_cyt_init">0.1</Constant>
        <Constant Name="Ca_SR_init">100.0</Constant>
        <Constant Name="CaM_cyt_init">10.0</Constant>
        <Constant Name="CaCaM_cyt_init">0.0</Constant>
        <Constant Name="Kf">0.001</Constant>
        <Constant Name="Km">0.5</Constant>
        <Constant Name="Kr">1.0</Constant>
        <Constant Name="Size_cytosol">1.0</Constant>
        <Constant Name="Size_SR">0.1</Constant>
        <Constant Name="Vmax">10.0</Constant>
        <VolumeVariable Name="Ca_cyt" Domain="Compartment"/>
        <VolumeVariable Name="Ca_SR" Domain="Compartment"/>
        <VolumeVariable Name="CaM_cyt" Domain="Compartment"/>
        <VolumeVariable Name="CaCaM_cyt" Domain="Compartment"/>
        <Function Name="J_Ca_CaM_binding">(Kf * pow(Ca_cyt, 4.0) * CaM_cyt - Kr * CaCaM_cyt)</Function>
        <Function Name="J_SERCA_flux">((Vmax * pow(Ca_cyt, 2.0)) / (pow(Km, 2.0) + pow(Ca_cyt, 2.0)))</Function>
        <CompartmentSubDomain Name="Compartment">
          <BoundaryType Boundary="Xm" Type="Flux"/>
          <BoundaryType Boundary="Xp" Type="Flux"/>
          <BoundaryType Boundary="Ym" Type="Flux"/>
          <BoundaryType Boundary="Yp" Type="Flux"/>
          <BoundaryType Boundary="Zm" Type="Flux"/>
          <BoundaryType Boundary="Zp" Type="Flux"/>
          <OdeEquation Name="Ca_cyt" SolutionType="Unknown">
            <Rate>((- 4.0 * J_Ca_CaM_binding * Size_cytosol) + (- 2.0 * J_SERCA_flux * Size_cytosol))</Rate>
            <Initial>Ca_cyt_init</Initial>
          </OdeEquation>
          <OdeEquation Name="Ca_SR" SolutionType="Unknown">
            <Rate>(2.0 * J_SERCA_flux * Size_cytosol / Size_SR)</Rate>
            <Initial>Ca_SR_init</Initial>
          </OdeEquation>
          <OdeEquation Name="CaM_cyt" SolutionType="Unknown">
            <Rate>(- J_Ca_CaM_binding * Size_cytosol)</Rate>
            <Initial>CaM_cyt_init</Initial>
          </OdeEquation>
          <OdeEquation Name="CaCaM_cyt" SolutionType="Unknown">
            <Rate>(J_Ca_CaM_binding * Size_cytosol)</Rate>
            <Initial>CaCaM_cyt_init</Initial>
          </OdeEquation>
        </CompartmentSubDomain>
        <Version Name="Simulation1_generated" KeyValue="123456789" BranchId="1" Archived="0" Date="15-Jan-2024 10:30:00" FromVersionable="false">
          <Owner Name="Dr. Smith" Identifier="987654321"/>
          <GroupAccess Type="1"/>
        </Version>
      </MathDescription>
      <Simulation Name="Simulation1">
        <SolverTaskDescription TaskType="Unsteady" UseSymbolicJacobian="false" Solver="Combined Stiff Solver (IDA/CVODE)">
          <TimeBound StartTime="0.0" EndTime="100.0"/>
          <TimeStep DefaultTime="0.1" MinTime="1.0E-8" MaxTime="1.0"/>
          <ErrorTolerance Absolut="1.0E-9" Relative="1.0E-9"/>
          <OutputOptions KeepEvery="1" KeepAtMost="1000"/>
        </SolverTaskDescription>
        <MathOverrides/>
        <Version Name="Simulation1" KeyValue="123456790" BranchId="1" Archived="0" Date="15-Jan-2024 10:30:00" FromVersionable="false">
          <Owner Name="Dr. Smith" Identifier="987654321"/>
          <GroupAccess Type="1"/>
        </MathOverrides>
      </Simulation>
    </SimulationSpec>
  </BioModel>
</vcml>`

    // Simulate API delay
    setTimeout(() => {
      setVcmlContent(mockVcmlContent)
      setIsLoading(false)
    }, 1000)
  }

  const handleDownload = () => {
    if (!vcmlContent) return

    const blob = new Blob([vcmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `biomodel_${biomodelId}.vcml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(vcmlContent)
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">VCML File Retrieval</h1>
          <p className="text-slate-600">Retrieve and download Virtual Cell Markup Language files for biomodels.</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              Biomodel VCML Retrieval
            </CardTitle>
            <CardDescription>Enter a biomodel ID to retrieve its VCML file content</CardDescription>
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
                onClick={handleRetrieveVCML}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Retrieving..." : "Retrieve VCML"}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* VCML Content Display */}
        {vcmlContent && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">VCML File Content</CardTitle>
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
                <XMLViewer xml={vcmlContent}/>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
