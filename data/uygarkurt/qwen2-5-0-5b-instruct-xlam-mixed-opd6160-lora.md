# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd6160-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd6160-lora` es un adaptador LoRA publicado por el desarrollador uygarkurt que se monta sobre el modelo base Qwen2.5-0.5B-Instruct. No se trata de un modelo completo, sino de pesos de adaptador (formato PEFT/safetensors) entrenados para mejorar el comportamiento de *tool calling* estructurado y la capacidad de abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento se realizó con la técnica de destilación en política (on-policy distillation, OPD), partiendo directamente del modelo instructivo base y usando como profesor congelado Qwen2.5-3B-Instruct. El alumno aprende de las probabilidades por token que el profesor asigna a sus propias respuestas generadas, sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`. Se completaron 6.160 actualizaciones OPD en 2,6 horas de bucle de entrenamiento.

Su relevancia es acotada pero concreta: demuestra que un modelo de 0,5B parámetros puede mejorar sustancialmente en precisión de llamadas a funciones (BFCL single-turn del 50,28% al 56,14%) mediante OPD, a costa de un ligero deterioro en otras métricas como MATH-500 e irrelevance. Es un experimento reproducible útil para quienes investigan tool calling en modelos pequeños y despliegue en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct); adaptador LoRA sobre modelo base |
| Parametros totales | 0,5B en el modelo base (adaptador LoRA de tamaño no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft, transformers |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Actualizaciones OPD | 6.160 |
| Tiempo de entrenamiento | 2,6 horas (solo bucle de entrenamiento) |
| Profesor (teacher) | Qwen/Qwen2.5-3B-Instruct (congelado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El entrenamiento emplea on-policy distillation (OPD): el alumno genera sus propias respuestas y aprende de las distribuciones de probabilidad por token que el profesor congelado (Qwen2.5-3B-Instruct) asigna a esas secuencias. Esto difiere de la destilación offline clásica, en la que el alumno imita trayectorias fijas generadas por el profesor. El objetivo es transferir capacidad de tool calling estructurado y de abstención ante herramientas irrelevantes.

El dataset `uygarkurt/xlam-tool-calling-mixed` combina ejemplos de tool calling; el split de test contiene 2.546 ejemplos evaluados y 743 descartados por superar el límite de 640 tokens de prompt. El pipeline de entrenamiento y evaluación está implementado en el repositorio Post-Training Lab del autor. No se documentan en la información disponible detalles sobre hiperparámetros LoRA (rango, alpha), composición exacta del dataset ni uso de RLHF/DPO adicional.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas a funciones con nombre y argumentos, con mejora medida en exact tool-call accuracy (xLAM ETC: 62,61% → 65,83%) y function-name accuracy (xLAM FNA: 86,57% → 90,10%).
- Abstención ante herramientas irrelevantes: el adaptador está entrenado explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes (aunque la métrica de irrelevance empeora, ver limitaciones).
- Razonamiento básico y matemáticas heredados del modelo base, con ligero deterioro tras el ajuste.
- Seguimiento de instrucciones (IFEval) con mejora marginal (26,80% → 28,10%).
- No se documenta soporte de visión, audio, modo thinking extendido ni capacidades de agente multi-paso más allá del tool calling de un turno.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: dado un catálogo de funciones (APIs internas, consultas a bases de datos), el adaptador decide qué función invocar y con qué argumentos, con mejor precisión de nombre de función que el base (90,10% frente a 86,57%).
- Despliegue en dispositivos con recursos mínimos: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o GPUs de gama baja, útil para prototipos de agentes embebidos o edge.
- Filtrado de llamadas irrelevantes: en pipelines donde el modelo recibe un conjunto amplio de herramientas, la capacidad de abstención evita invocaciones espurias cuando ninguna encaja con la consulta.
- Investigación en destilación on-policy: sirve como referencia reproducible para estudiar cómo OPD afecta a tool calling en modelos pequeños, con métricas detalladas y scripts públicos.
- Generación de JSON estructurado para integración con orquestadores: el formato de tool calling permite alimentar frameworks de agentes que esperan llamadas a funciones en esquema fijo.
- Evaluación comparativa de adaptadores: útil como baseline en experimentos que midan el coste/beneficio de LoRA frente a fine-tuning completo en tareas de function calling.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; primera fila: modelo base; segunda: adaptador OPD):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% | — |
| OPD (este adaptador) | OPD 6.160 | 41,87% | 14,40% | 28,10% | 65,83% | 90,10% | 56,14% | 83,33% | 56,06% | 2,6 |

Notas del autor: xLAM ETC es exact tool-call accuracy; xLAM FNA es function-name accuracy; las evaluaciones xLAM usan el split de test del dataset mixto (2.546 ejemplos evaluados, 743 omitidos por el límite de 640 tokens). BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa prompt-level strict accuracy. Las evaluaciones xLAM usan scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; el adaptador LoRA añade una cantidad pequeña no especificada. En cuantización de 4 bits el modelo base cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (carga del adaptador sobre el base), vLLM (con soporte de LoRA), llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF, TGI si se fusionan los pesos.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño (0,5B), se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA OPD) | 0,5B | no disponible | Sí (entrenado explícitamente) | no disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | hasta 32.768 (según documentación del base, no confirmado aquí) | Parcial (sin ajuste específico) | Apache 2.0 (según el modelo base) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | hasta 32.768 (según documentación del base) | Parcial | Apache 2.0 (según el modelo base) | Hugging Face |

No se dispone de comparativas con otros adaptadores LoRA de tool calling en la información proporcionada. Los datos de licencia y contexto del modelo base provienen de la documentación pública de Qwen y no se confirman en esta ficha.

## Limitaciones y advertencias

- Solo inglés: el adaptador está entrenado y etiquetado únicamente para `en`; su rendimiento en castellano u otros idiomas no está evaluado.
- Deterioro en irrelevance: la métrica de irrelevance baja del 66,93% al 56,06%, lo que indica que el adaptador puede invocar herramientas en casos donde debería abstenerse, a pesar de estar entrenado para ello.
- Regresión en matemáticas: MATH-500 cae del 15,80% al 14,40%, y MMLU baja ligeramente (42,04% → 41,87%).
- Límite de prompt de 640 tokens en la evaluación xLAM: 743 ejemplos del split de test fueron descartados, lo que puede sesgar las métricas hacia consultas cortas.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia.
- Riesgo de alucinación inherente a un modelo de 0,5B: la capacidad de razonamiento y de seguir instrucciones complejas es limitada (IFEval 28,10%), lo que aumenta la probabilidad de llamadas mal formadas o argumentos incorrectos en producción.
- Es un adaptador, no un modelo autónomo: requiere cargar Qwen2.5-0.5B-Instruct y aplicar los pesos PEFT; no funciona de forma aislada.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd6160-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (teacher): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
