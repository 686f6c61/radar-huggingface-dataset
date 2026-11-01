# TieuDaoChanNhan/qwen3-8b-knapsack-lora-prevention-n103

## Resumen

El modelo `qwen3-8b-knapsack-lora-prevention-n103` es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-8B, desarrollado por el autor TieuDaoChanNhan en el contexto del bootcamp GStar 2026. No se trata de un modelo de lenguaje completo, sino de un ajuste fino especializado para un comportamiento concreto dentro de agentes CodeAct: la gestión de un límite máximo de llamadas a herramientas por turno mediante una estrategia de "prevención" (evitar agotar el cupo) frente a la alternativa de "recuperación".

El adaptador se entrena con QLoRA de rango 64 y alpha 128 sobre 103 pares de entrenamiento, con 74 pasos de optimizador y una longitud de secuencia de 16k. La tarea objetivo es un problema de mochila opaco ("Opaque Knapsack") y los datos de entrenamiento provienen de un profesor (teacher) Gemini 3 Flash. El proyecto se enmarca en el paper *Evaluating Agents Across Runtime Contracts: When Mismatch Costs Efficiency or Quality* (IAEval 2026, workshop NeurIPS 2026), aunque el adaptador no ha sido producido por los autores del paper.

Su relevancia es acotada y experimental: sirve como artefacto de investigación para comparar estrategias de entrenamiento en agentes con contratos de ejecución, no como modelo de propósito general. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, pero su naturaleza de adaptador y su entrenamiento sobre una tarea muy específica limitan su aplicabilidad fuera del contexto del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3-8B |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16k; el modelo base Qwen3-8B soporta contexto nativo de 32k, ampliable) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-8B, un transformer denso de 8.000 millones de parámetros. Sobre él se aplica un ajuste QLoRA con rango 64, alpha 128, dropout 0,05, learning rate 1e-4 con schedule coseno, 3 épocas y longitud de secuencia de 16k. El batch efectivo se redujo de 16 a 4 (decisión tomada antes del entrenamiento) para mantener los pasos de optimizador en un rango aprendible a esta escala, resultando en 74 pasos. Los datos de entrenamiento consisten en 103 pares generados con Gemini 3 Flash como profesor, orientados a la tarea "Opaque Knapsack" y a la estrategia de prevención del límite de llamadas a herramientas.

La innovación técnica no reside en la arquitectura del modelo base, sino en el diseño experimental: se compara un adaptador entrenado con estrategia de prevención frente a otro entrenado con estrategia de recuperación, igualando el número de llamadas a herramientas y la longitud de las trazas entre ambos. La evaluación se realiza con bootstrap pareado de 10.000 remuestreos sobre 50 instancias reservadas no vistas en entrenamiento. No se documentan innovaciones como decodificación especulativa, atención lineal ni mezclas de expertos.

## Capacidades

- Generación de texto y razonamiento dentro del dominio del modelo base Qwen3-8B.
- Soporte de tool calling / function calling heredado del modelo base, orientado a agentes CodeAct.
- Gestión de un límite máximo de llamadas a herramientas por turno mediante estrategia de prevención (evitar agotar el cupo antes de completar la tarea).
- Razonamiento multi-paso en el contexto de la tarea "Opaque Knapsack".
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en el adaptador.

## Casos de uso

- Investigación en evaluación de agentes: el adaptador sirve como artefacto reproducible para comparar estrategias de prevención frente a recuperación en contratos de ejecución con límite de llamadas, usando la evaluación pareada descrita en el proyecto.
- Experimentos de agentes CodeAct con presupuesto de herramientas: se puede integrar en un pipeline de agente que imponga un tope de llamadas por turno y medir si la política aprendida reduce fallos por agotamiento del cupo.
- Reproducción de resultados académicos: útil para replicar el análisis del paper IAEval 2026 en entornos controlados con la tarea Opaque Knapsack y el profesor Gemini 3 Flash.
- Estudio de ajuste fino con QLoRA a pequeña escala: sirve como ejemplo de entrenamiento con 103 pares y 74 pasos para analizar estabilidad y rendimiento en tareas de agente.
- Benchmarking de adaptadores LoRA: puede compararse con el adaptador de recuperación del mismo proyecto para medir diferencias de puntuación bajo bootstrap pareado.
- Docencia y formación en agentes: adecuado para demostrar cómo un contrato de ejecución (límite de llamadas) afecta a la eficiencia y calidad de un agente entrenado.

## Benchmarks y rendimiento

| Cap | Mean score |
|---|---|
| 25 | 0,537 |
| 80 | 0,555 |

Evaluación con bootstrap pareado de 10.000 remuestreos sobre 50 instancias reservadas no usadas en entrenamiento. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen3-8B y de la cuantización elegida (el adaptador se distribuye en safetensors y requiere cargar el base).
- GPU recomendadas: no disponibles en la información proporcionada; para Qwen3-8B se suelen emplear A100, H100 o RTX 4090, pero no se confirma en la documentación del adaptador.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: PEFT (librería declarada), con posibilidad de integrarse en stacks que soporten adaptadores LoRA; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-knapsack-lora-prevention-n103 | Adaptador sobre 8B | no disponible (entrenado a 16k) | 0,537 (cap 25) / 0,555 (cap 80) en Opaque Knapsack | apache-2.0 | HuggingFace, 6 descargas |
| Adaptador de recuperación del mismo proyecto | Adaptador sobre 8B | no disponible | Comparación pareada en el informe del proyecto | no disponible | Repositorio del proyecto |
| Qwen/Qwen3-8B (base) | 8B | 32k nativo | No evaluado en Opaque Knapsack en la información disponible | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparables con otros adaptadores o modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen/Qwen3-8B y la librería PEFT.
- Entrenado sobre una tarea muy específica (Opaque Knapsack) y una estrategia concreta (prevención), por lo que su generalización fuera de ese dominio no está demostrada.
- Solo 103 pares de entrenamiento y 74 pasos de optimizador: riesgo de sobreajuste y alta varianza en los resultados.
- Sesgos conocidos: no documentados; hereda los del modelo base y los del profesor Gemini 3 Flash usado para generar los datos.
- Riesgo de alucinación: no evaluado específicamente en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador está pensado para investigación y no se han validado escenarios de producción.
- El proyecto no ha sido producido por los autores del paper IAEval 2026; es un trabajo individual de bootcamp.

## Enlaces

- HuggingFace: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-knapsack-lora-prevention-n103
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent
- Informe del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent/tree/main/report
