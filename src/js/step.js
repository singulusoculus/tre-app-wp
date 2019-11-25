let currentStep

const getCurrentStep = () => currentStep.toLowerCase()

const setCurrentStep = (step) => {
  currentStep = step.toLowerCase()
}

export { getCurrentStep, setCurrentStep }
