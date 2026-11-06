# viai957/Goedel-Prover-V2-8B-EI-campaign1-r2

## Resumen

Goedel-Prover-V2-8B-EI-campaign1-r2 es un ajuste fino (finetune) del modelo Goedel-Prover-V2-8B de Goedel-LM, publicado por el usuario viai957 en Hugging Face. Se trata de un modelo de generación de texto especializado en demostración automática de teoremas en Lean 4, derivado de la familia Qwen3 con unos 8.190.735.360 parámetros totales. El modelo aborda el problema de la generación de pruebas formales verificables por el kernel de Lean 4, una tarea donde los modelos generales suelen rendir por debajo de los especializados.

Su entrenamiento se realizó mediante dos rondas de expert iteration: el modelo base muestreó pruebas sobre un conjunto de enunciados descontaminado, el kernel de Lean 4 verificó su corrección y solo las pruebas verificadas más cortas se usaron como datos de fine-tuning supervisado (LoRA, fusionado posteriormente y promediado con los pesos originales del base con peso 0,7 para el modelo ajustado). Todo el proceso queda documentado con manifiestos con huellas criptográficas (sha256), lo que aporta una trazabilidad poco habitual en modelos comunitarios.

Un detalle relevante: la regla de parada de la campaña de expert iteration no seleccionó esta ronda (eligió la ronda 1, y la campaña terminó por regresión tras la ronda 3), por lo que el autor publica este checkpoint únicamente por completitud y recomienda leer la sección de evaluación antes de usarlo. Esto lo convierte en un modelo de interés principalmente experimental o de investigación, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (arquitectura detallada no disponible) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible (el tope de generación durante el entrenamiento fue de 16.384 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no disponible (especializado en Lean 4 y enunciados matemáticos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos, 16,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Goedel-LM/Goedel-Prover-V2-8B (revisión `dfd02e6271a58375dfbf3ece0175277cf6b6a89a`), un modelo de la familia Qwen3 orientado a la demostración formal de teoremas. El fine-tuning se ejecutó como la ronda 2 de una campaña de expert iteration: se seleccionaron 300 enunciados de un pool descontaminado de 5.940 filas, se muestrearon 8 pruebas por enunciado con un tope de 16.384 tokens de generación, y el kernel de Lean 4 verificó su corrección. Se conservaron como máximo 4 pruebas verificadas por enunciado, priorizando las más cortas.

Sobre esos datos se entrenó un LoRA (rango 64, alpha 128,0) mediante SFT con la configuración `configs/p2_sft.toml`, generando 374 filas de entrenamiento sobre 120 enunciados distintos, con un total de 1.377.760 tokens de completion. Las filas procedían de cinco datasets: Goedel-Pset-v1 (251 filas), NuminaMath-LEAN-Sol (54), Nemotron-Math-Proofs-v1 de NVIDIA (30), RL-Goedel-Pset-Level-4-5 (25) y FormalMATH-All (14). El LoRA se fusionó en el modelo base y el resultado se promedió con los pesos originales del base (peso 0,7 para el modelo ajustado, ancla en el original), promediando 399 tensores. La campaña usó miniF2F-valid como conjunto de desarrollo y miniF2F como conjunto protegido contra contaminación; la regla de parada (max_regress 3, patience 2, min_gain 2) terminó la campaña por regresión tras la ronda 3 y seleccionó la ronda 1 como mejor, no esta ronda 2.

## Capacidades

- Generación de demostraciones formales en Lean 4 verificables por el kernel del asistente de pruebas.
- Resolución de enunciados matemáticos de los conjuntos Goedel-Pset, NuminaMath, FormalMATH y Nemotron-Math-Proofs, con énfasis en niveles 4-5 de dificultad.
- Generación de texto conversacional heredada del modelo base Qwen3 (capacidades generales no reevaluadas en este fine-tune).
- No hay evidencia publicada de soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en este checkpoint.

## Casos de uso

- Demostración automática de teoremas en Lean 4: dado un enunciado formalizado, el modelo genera candidatas de prueba que pueden validarse directamente con el kernel de Lean, útil en pipelines de verificación formal.
- Investigación en expert iteration: al publicarse con manifiestos completos y huellas de los pesos, sirve como caso de estudio reproducible de campañas de auto-mejora con verificación externa.
- Aumento de datos para demostración formal: puede usarse para generar pruebas verificadas que alimenten entrenamientos posteriores (el propio método del modelo ilustra este flujo).
- Evaluación comparativa de provers de 8B: permite comparar el efecto de rondas de expert iteration frente al modelo base Goedel-Prover-V2-8B en miniF2F y conjuntos similares.
- Asistencia a matemáticos y verificadores: propuesta de esqueletos de prueba en Lean 4 que el usuario refina interactivamente.
- Filtrado y selección de pruebas: combinado con verificación por kernel, puede integrarse en sistemas best-of-n que muestreen varias pruebas y retengan las correctas (el entrenamiento usó 8 muestras por enunciado con este esquema).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que la regla de parada de la campaña no seleccionó esta ronda (eligió la ronda 1) y que la campaña terminó por regresión tras la ronda 3, lo que sugiere que esta ronda 2 no mejora al base o a la ronda 1 en el conjunto de desarrollo (miniF2F-valid). No se proporcionan cifras concretas de tasa de pruebas verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16-17 GB para los pesos, más la memoria de KV-cache; en la práctica 24 GB de VRAM son cómodos.
- GPU recomendadas: una RTX 4090 o RTX 3090 (24 GB) es suficiente para inferencia en precisión completa; para lotes grandes o contextos largos, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB; con cuantización (no publicada oficialmente en este repo, pero factible vía GGUF/AWQ de terceros) podría entrar en 12-16 GB.
- Despliegue: transformers (librería nativa del repo), text-generation-inference (etiqueta `text-generation-inference` presente) y endpoints de Hugging Face (`endpoints_compatible`); compatibilidad con vLLM, llama.cpp u Ollama no confirmada en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Notas |
|---|---|---|---|---|
| viai957/Goedel-Prover-V2-8B-EI-campaign1-r2 | 8,19B | Demostracion Lean 4 (expert iteration, ronda 2) | Apache 2.0 | Checkpoint no seleccionado por la regla de parada; publicado por completitud |
| Goedel-LM/Goedel-Prover-V2-8B (base) | 8,19B | Demostracion Lean 4 | Apache 2.0 | Modelo base; ronda 1 del expert iteration fue la seleccionada por la campana |
| Goedel-Prover-V2 (versiones oficiales de la familia) | 8B y tamanos mayores | Demostracion Lean 4 | no disponible en la informacion proporcionada | Familia original de Goedel-LM con resultados publicados en miniF2F |

No se conocen alternativas comparables adicionales con datos suficientes en la informacion proporcionada.

## Limitaciones y advertencias

- La propia model card advierte de que esta ronda 2 no fue elegida por la regla de parada de la campaña (que seleccionó la ronda 1 y terminó por regresión tras la ronda 3): es probable que no supere al modelo base ni a la ronda 1, por lo que no se recomienda para producción sin evaluación propia.
- Modelo altamente especializado en Lean 4; sus capacidades de conversación general pueden haberse degradado respecto al base tras el fine-tuning (no reevaluadas).
- Riesgo de alucinación de pruebas: solo el kernel de Lean 4 garantiza corrección; cualquier prueba generada debe verificarse siempre.
- Sesgos: entrenado con datos de demostraciones matemáticas en inglés; no hay evaluación de sesgos publicada.
- Idiomas soportados no documentados; el entrenamiento usó enunciados en inglés.
- Ventana de contexto no especificada en la model card; el tope de generación durante el entrenamiento fue de 16.384 tokens.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Modelo comunitario con muy poca tracción (288 descargas, 0 likes al momento de la ficha), sin soporte garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r2
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
  - https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5
  - https://huggingface.co/datasets/SphereLab/FormalMATH-All
  - https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol
  - https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
