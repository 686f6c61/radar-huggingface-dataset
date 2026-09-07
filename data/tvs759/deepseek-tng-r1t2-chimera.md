# TVS759/DeepSeek-TNG-R1T2-Chimera

## Resumen

DeepSeek-TNG-R1T2-Chimera es un modelo de lenguaje de gran tamaño (684.489.845.504 parámetros totales) desarrollado por TNG (tngtech) mediante la técnica de ensamblaje de expertos (Assembly of Experts, AoE). Se construye fusionando tres modelos base de DeepSeek: DeepSeek-R1-0528, DeepSeek-R1 y DeepSeek-V3-0324. Esta instancia en HuggingFace es una re-subida por el usuario TVS759 del modelo original publicado como tngtech/DeepSeek-TNG-R1T2-Chimera.

El modelo resuelve el problema de encontrar un punto de equilibrio entre inteligencia y coste computacional en tareas de razonamiento. Según el autor, es aproximadamente un 20% más rápido que DeepSeek-R1 y más del doble de rápido que R1-0528, al tiempo que supera a R1 en benchmarks como GPQA-Diamond (77,9 frente a 71,5) y Aider Polyglot (64,4 frente a 52,0). Además, corrige el problema de consistencia del token `
