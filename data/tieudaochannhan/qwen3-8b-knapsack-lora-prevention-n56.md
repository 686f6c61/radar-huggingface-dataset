# TieuDaoChanNhan/qwen3-8b-knapsack-lora-prevention-n56

## Resumen

`qwen3-8b-knapsack-lora-prevention-n56` es un adaptador LoRA (QLoRA) entrenado sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario TieuDaoChanNhan. No se trata de un modelo fundacional, sino de un ajuste fino orientado a un comportamiento muy concreto: enseñar a un agente CodeAct a aplicar una estrategia de **prevención** frente a un límite de llamadas a herramientas por turno, en lugar de la estrategia alternativa de recuperación tras el fallo.

El adaptador nace del proyecto individual "Resume or Prevent?", presentado en el GStar Bootcamp 2026 y vinculado al paper *Evaluating Agents Across Runtime Contracts: When Mismatch Costs Efficiency or Quality* (IAEval 2026, taller de NeurIPS 2026). El autor declara explícitamente que el proyecto no está producido por los autores del paper, sino que se apoya en su receta de entrenamiento.

Se trata de un artefacto de investigación con un volumen de entrenamiento muy reducido (56 pares de entrenamiento, 40 pasos de optimizador) y una evaluación limitada a 50 instancias retenidas. Su interés es metodológico: comparar empíricamente dos estrategias de gestión de contratos de ejecución en agentes. No es un modelo pensado para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenado con secuencias de 16k) |
| Tipos de cuantizacion | No disponible (entrenamiento QLoRA; no se detallan formatos de publicacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3-8B, con rango 64, alpha 128, dropout 0.05, learning rate 1e-4 con scheduler coseno, 3 épocas y longitud de secuencia de 16k. La receta sigue la del paper de referencia, cambiando la fuente de datos y reduciendo el batch efectivo de 16 a 4, decisión tomada antes del entrenamiento para mantener los pasos de optimizador en un rango aprendible a esta escala. El resultado son 40 pasos de optimizador sobre 56 pares de entrenamiento.

La tarea objetivo es "Opaque Knapsack" dentro de un agente CodeAct, con un límite de llamadas a herramientas por turno. El adaptador se especializa en la estrategia de prevención (planificar para no agotar el cupo de llamadas), frente a la alternativa de recuperación. Los datos de entrenamiento se generaron con Gemini 3 Flash como profesor. No se detalla la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de razonamiento heredada del modelo base Qwen3-8B.
- Comportamiento de agente CodeAct: ejecución de acciones con llamadas a herramientas en formato código.
- Gestión de contratos de ejecución: aplicación de una estrategia de prevención ante un límite de llamadas a herramientas por turno.
- Soporte de tool calling y function calling (heredado del modelo base y del formato CodeAct).
- Razonamiento multi-paso dentro de trazas de agente.
- Capacidades multilingües: no disponibles en la información proporcionada para este adaptador.
- No se documentan capacidades de visión, audio ni modo de pensamiento específicas del adaptador.

## Casos de uso

- Investigación sobre contratos de ejecución en agentes: reproducir el experimento del paper comparando el adaptador de prevención con el de recuperación sobre el mismo conjunto de instancias y el mismo presupuesto de llamadas.
- Evaluación de estrategias de planificación bajo restricciones: usar el adaptador para medir cómo un agente distribuye sus llamadas a herramientas cuando el cupo por turno es escaso (cap 25 frente a cap 80).
- Estudio de eficiencia en trazas de agente: analizar si la prevención reduce llamadas desperdiciadas o longitud de traza en tareas de tipo Knapsack opaco.
- Docencia y formación en ajuste fino con PEFT: sirve como ejemplo mínimo y reproducible de QLoRA con rango 64 y 40 pasos de optimizador sobre un modelo de 8B.
- Baseline para comparativas de adaptadores: punto de referencia para nuevos adaptadores entrenados con otras estrategias o fuentes de datos.
- Prototipado de agentes con presupuesto de herramientas: integrarlo en un entorno CodeAct de laboratorio para observar el comportamiento bajo límites estrictos antes de diseñar políticas propias.

## Benchmarks y rendimiento

Evaluación del autor con bootstrap emparejado, 10.000 remuestreos, sobre 50 instancias retenidas no usadas en entrenamiento:

| Cap (límite de llamadas por turno) | Puntuación media |
|---|---|
| 25 | 0.234 |
| 80 | 0.381 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,7 GB (tamaño del repo), pero requiere cargar el modelo base Qwen3-8B para inferencia.
- VRAM estimada para el modelo base en BF16: en torno a 16 GB solo para pesos, más overhead de contexto y KV cache.
- VRAM estimada con cuantización de 4 bits (QLoRA/NF4): en torno a 5-6 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización, y potencialmente en GPUs de 12-16 GB con cuantización agresiva y contexto reducido.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador, vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona y convierte el adaptador a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-knapsack-lora-prevention-n56 | Adaptador LoRA sobre 8B | No disponible | Prevención ante cap de tool calls | Apache 2.0 | HuggingFace |
| Adaptador de recuperación del mismo proyecto | Adaptador LoRA sobre 8B | No disponible | Recuperación tras fallo de cap | No disponible | Referenciado en el repo del proyecto |
| Qwen/Qwen3-8B (base) | 8B | No disponible en esta ficha | Modelo generalista | Apache 2.0 | HuggingFace |

No se dispone de datos comparativos de rendimiento entre el adaptador de prevención y el de recuperación en la información proporcionada; el autor remite al informe del proyecto para la comparación emparejada completa.

## Limitaciones y advertencias

- Entrenado con solo 56 pares y 40 pasos de optimizador: alta probabilidad de sobreajuste y de generalización limitada fuera de la tarea "Opaque Knapsack".
- Evaluación restringida a 50 instancias retenidas; la puntuación media (0.234 con cap 25, 0.381 con cap 80) es baja en términos absolutos y no debe interpretarse como rendimiento general del modelo.
- Los datos de entrenamiento provienen de un profesor (Gemini 3 Flash), por lo que el adaptador puede heredar sesgos y errores del profesor.
- No hay información sobre idiomas soportados ni sobre evaluación multilingüe del adaptador.
- Riesgo de alucinación heredado del modelo base Qwen3-8B, no mitigado específicamente por este ajuste.
- Es un artefacto de investigación vinculado a un bootcamp y a un taller; no hay evidencia de validación en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-8B.
- El autor declara que el proyecto no está producido por los autores del paper de referencia; la cita al paper no implica aval.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/TieuDaoChanNhan/qwen3-8b-knapsack-lora-prevention-n56
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent
- Informe del proyecto: https://github.com/TieuDaoChanNhan/resume-or-prevent/tree/main/report
- Paper de referencia: *Evaluating Agents Across Runtime Contracts: When Mismatch Costs Efficiency or Quality* (IAEval 2026, NeurIPS 2026 Workshop on Evaluation of Interactive Agents) — sin URL directa en la información proporcionada.
