# TieuDaoChanNhan/qwen3-8b-knapsack-lora-recovery-n56

## Resumen

`qwen3-8b-knapsack-lora-recovery-n56` es un adaptador LoRA (QLoRA) entrenado sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario TieuDaoChanNhan. No se trata de un modelo completo, sino de un ajuste fino parametrizado eficiente (PEFT) orientado a un experimento de investigación concreto: evaluar si entrenar un agente CodeAct con una estrategia de "recuperación" (recovery) ante un límite de llamadas a herramientas por turno supera a la estrategia alternativa de "prevención".

El adaptador se enmarca en el proyecto individual "Resume or Prevent?" para el GStar Bootcamp 2026, construido sobre el paper *Evaluating Agents Across Runtime Contracts: When Mismatch Costs Efficiency or Quality* (IAEval 2026, NeurIPS 2026 Workshop). La tarea concreta de entrenamiento es un problema de mochila opaco (Opaque Knapsack), con 56 pares de entrenamiento y 40 pasos de optimizador, usando Gemini 3 Flash como modelo profesor para generar datos.

Es relevante como artefacto de investigación reproducible sobre comportamiento de agentes bajo restricciones de runtime, no como modelo de propósito general. Su tamaño de repositorio (0,7 GB) corresponde únicamente a los pesos del adaptador, no al modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer Qwen3-8B; adaptador PEFT |
| Parametros totales | no disponible (adaptador LoRA de rango 64 sobre Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó secuencias de 16k |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantización del base); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), librería `peft` |
| Modelo base | Qwen/Qwen3-8B |
| Rango LoRA / alpha | 64 / 128 |
| Dropout | 0,05 |
| Learning rate | 1e-4 (cosine) |
| Épocas | 3 |
| Pares de entrenamiento | 56 |
| Pasos de optimizador | 40 |
| Batch efectivo | 4 (reducido desde 16) |
| Profesor de datos | Gemini 3 Flash |
| Tarea | Opaque Knapsack (CodeAct, estrategia recovery) |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA sobre Qwen3-8B, un transformer denso de 8 mil millones de parámetros. Los pesos base se cuantizan durante el entrenamiento y se añaden matrices de bajo rango (r=64, alpha=128) con dropout de 0,05. Se emplea un learning rate de 1e-4 con scheduler coseno, 3 épocas y longitud de secuencia de 16k tokens, siguiendo la receta del paper original con la fuente de datos modificada. El batch efectivo se redujo de 16 a 4, decisión tomada antes del entrenamiento para mantener los pasos de optimizador en un rango aprendible a esta escala, resultando en 40 pasos totales.

Los datos de entrenamiento consisten en 56 pares generados con Gemini 3 Flash como profesor, orientados a la tarea Opaque Knapsack dentro de un agente CodeAct. La estrategia entrenada es "recovery": el agente aprende a recuperarse cuando alcanza un límite de llamadas a herramientas por turno, en contraposición a la estrategia de "prevención". El experimento controla que las llamadas a herramientas y la longitud de traza estén emparejadas entre ambas condiciones. No se documenta el uso de RLHF o DPO; el ajuste es supervisado sobre trazas generadas por el profesor.

## Capacidades

- Generación de texto conversacional y de razonamiento heredada del modelo base Qwen3-8B.
- Ejecución de tareas de agente CodeAct: razonamiento multi-paso con llamadas a herramientas.
- Gestión de contratos de runtime: comportamiento entrenado específicamente para recuperarse ante un límite de llamadas a herramientas por turno (estrategia recovery).
- Resolución de la tarea Opaque Knapsack dentro del entorno del proyecto.
- Soporte de tool calling / function calling heredado del base (no validado de forma independiente en este adaptador).
- Capacidades multilingües: no documentadas para el adaptador; dependen del base Qwen3-8B.
- Modo thinking: no documentado en la model card del adaptador.

## Casos de uso

- Investigación sobre comportamiento de agentes bajo restricciones: reproducir el experimento "Resume or Prevent?" comparando la estrategia recovery con la prevention usando este adaptador y su contraparte, con trazas emparejadas.
- Evaluación de contratos de runtime en agentes: estudiar cómo un agente CodeAct gestiona límites de llamadas a herramientas por turno (caps de 25 y 80) y qué coste tiene en calidad.
- Benchmarking de metodologías de ajuste con pocos datos: analizar qué se aprende con solo 56 pares y 40 pasos de optimizador en una tarea acotada.
- Docencia y formación en PEFT: servir como ejemplo reproducible de QLoRA con rango 64 sobre un modelo de 8B para un proyecto de bootcamp.
- Punto de partida para adaptadores específicos de agentes: reutilizar la configuración (r=64, alpha=128, lr=1e-4, 16k de secuencia) como plantilla para entrenar estrategias alternativas sobre Qwen3-8B.
- Estudio de destilación desde profesores comerciales: evaluar la calidad de datos generados por Gemini 3 Flash en tareas de razonamiento con herramientas.

## Benchmarks y rendimiento

Resultados de la evaluación del autor: bootstrap emparejado con 10.000 remuestreos sobre 50 instancias reservadas nunca vistas en entrenamiento.

| Cap (límite de llamadas por turno) | Puntuación media |
|---|---|
| 25 | 0,194 |
| 80 | 0,304 |

No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB en safetensors; requiere cargar el modelo base Qwen3-8B para inferencia.
- VRAM estimada para el base en FP16: aproximadamente 16 GB; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones estándar para un modelo de 8B, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090/4080 para cuantización de 4-8 bits.
- Cabe en GPU de consumo con cuantización: sí, en tarjetas con 8 GB o más usando 4 bits, siempre que se cargue el base cuantizado.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador; vLLM y TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requerirían fusión previa del adaptador con el base (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-knapsack-lora-recovery-n56 | Adaptador LoRA sobre 8B | no disponible | Agente CodeAct, estrategia recovery | apache-2.0 | HuggingFace (5 descargas) |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | Modelo generalista | apache-2.0 | HuggingFace |
| Adaptador "prevention" del mismo proyecto | Adaptador LoRA sobre 8B | no disponible | Agente CodeAct, estrategia prevention | apache-2.0 (según proyecto) | Repositorio del proyecto |

No se dispone de datos de rendimiento de los adaptadores comparables en la información proporcionada; la comparación cuantitativa recovery frente a prevention se remite al informe del proyecto.

## Limitaciones y advertencias

- Entrenado con solo 56 pares y 40 pasos de optimizador: riesgo alto de sobreajuste y de generalización limitada fuera de la tarea Opaque Knapsack.
- Diseñado como artefacto de investigación; no validado para uso en producción ni para tareas generales.
- Rendimiento absoluto bajo en la evaluación del autor (0,194 y 0,304 de puntuación media según el cap), lo que refleja la dificultad de la tarea y la escala del entrenamiento.
- Riesgo de alucinación heredado del base Qwen3-8B; no evaluado de forma independiente para este adaptador.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del base y no ha sido validado tras el ajuste.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base y los de los datos generados por Gemini 3 Flash.
- Licencia apache-2.0 permite uso comercial, pero el adaptador está pensado para reproducir un experimento académico; conviene citar el paper y el proyecto.
- El autor indica explícitamente que el proyecto no está producido por los autores del paper original.

## Enlaces

- HuggingFace: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-knapsack-lora-recovery-n56
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent
- Informe del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent/tree/main/report
