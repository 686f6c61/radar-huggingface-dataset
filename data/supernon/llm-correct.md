# supernon/llm-correct

## Resumen

`llm-correct` es un conjunto de checkpoints de investigación publicados por el usuario supernon en Hugging Face, centrados en el estudio de la destilación de correcciones de un profesor LLM (Claude) sobre un estudiante de tipo vision-language-action (VLA) en el benchmark robótico LIBERO (40 tareas). No se trata de un modelo de lenguaje de propósito general, sino de artefactos experimentales de un proyecto de investigación sobre aprendizaje por imitación interactivo (DAgger) aplicado a manipulación robótica.

El estudiante emplea un backbone vision-language Qwen3.5-27B con una cabeza de acción basada en flow-matching (`head.pt`, 6 × 512). Cada llamada predice un chunk de 10 pasos de acciones de 7 dimensiones, de los cuales se ejecutan 5. Las entradas son 2 imágenes de cámara, propiocepción de 8 dimensiones y la instrucción de la tarea. Los pesos se almacenan en safetensors fp32, con un tamaño aproximado de 102 GiB por checkpoint, y la inferencia se realizó en bf16.

El repositorio incluye tres checkpoints: `B0` (estudiante base tras 6000 pasos de fine-tuning completo sobre demos humanas de LIBERO), `F-C` (B0 + 500 actualizaciones de parámetros completos con receta de replay) y `F-T` (igual que F-C pero sustituyendo el 15 % de la cuota de rescates históricos por datos de corrección online de Claude). Es relevante como material reproducible para investigadores interesados en destilación de correcciones y VLA, aunque los resultados son exploratorios y de una sola semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone Qwen3.5-27B con cabeza de acción flow-matching (6 × 512) |
| Parametros totales | 27B (backbone) + cabeza de acción (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32; inferencia en bf16) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO son en inglés, pero no se declara soporte multilingüe) |
| Licencia | derivado de Qwen3.5-27B; usar bajo la licencia del modelo base (licencia específica no disponible) |
| Formato de pesos | safetensors (fp32) para el backbone; `head.pt` (PyTorch) para la cabeza de acción |

## Arquitectura y entrenamiento

La arquitectura combina un backbone vision-language Qwen3.5-27B con una cabeza de acción de flow-matching que predice chunks de 10 pasos de acciones de 7 dimensiones (se ejecutan 5). Las observaciones incluyen 2 imágenes de cámara, un vector de propiocepción de 8 dimensiones y la instrucción de la tarea en lenguaje natural. El entrenamiento parte de `B0`, obtenido con 6000 pasos de fine-tuning completo sobre las demos humanas de LIBERO (fase 18, `q0_40`).

Sobre esa base se aplican 500 actualizaciones de parámetros completos con una receta de replay (Q29 Phase-15) cuya composición de datos es: 40 % demos, 15 % éxitos naturales históricos, 15 % éxitos naturales actuales y 30 % rescates históricos. La variante `F-T` sustituye el 15 % de la cuota de rescates históricos por datos de corrección online local generados por Claude (E10, 1282 bloques de acción de 7 familias de tareas). El objetivo del experimento es evaluar si las correcciones de un profesor LLM en línea, estilo DAgger, pueden destilarse de vuelta en el estudiante.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (40 tareas) a partir de instrucciones en lenguaje natural.
- Percepción visual multimodal: procesa 2 imágenes de cámara junto con propiocepción de 8 dimensiones.
- Generación de acciones motoras de 7 dimensiones en chunks de 10 pasos (ejecución de 5).
- Aprendizaje por imitación con correcciones online (DAgger) y destilación de correcciones de un profesor LLM.
- No se declaran capacidades de tool calling, agentes multi-paso, razonamiento general ni otras tareas de NLP.
- No se declara soporte multilingüe.

## Casos de uso

- Investigación en destilación de correcciones: usar los checkpoints `F-C` y `F-T` para reproducir el experimento de destilación de correcciones de Claude sobre el estudiante VLA y analizar la absorción de correcciones en estados de takeover.
- Estudio de aprendizaje por imitación en robótica: emplear `B0` como punto de partida para nuevos experimentos de fine-tuning con recetas de replay sobre LIBERO.
- Evaluación de VLA con flow-matching: utilizar la cabeza de acción y el backbone como referencia para comparar estrategias de predicción de chunks de acción en manipulación.
- Análisis de retención de habilidades: reproducir las sondas de estados de takeover y los conjuntos de estados iniciales independientes para medir olvido catastrófico tras actualizaciones de parámetros completos.
- Benchmarking de pipelines de evaluación robótica: integrar los checkpoints en un harness de evaluación LIBERO para medir tasas de éxito por tarea y familia.
- Estudio de recetas de mezcla de datos: comparar la composición de datos de `F-C` frente a `F-T` para analizar el impacto de incorporar correcciones humanas/LLM en el replay.

## Benchmarks y rendimiento

| Readout | B0 | F-C | F-T |
|---|---|---|---|
| Nuevos estados iniciales independientes (40 tareas × 6, 240 episodios) | 219 | 221 | 219 |
| Sonda de estados de takeover (52 estados × 3 semillas, 156 episodios, en distribución) | 38 | 44 | 61 |

- F-T − F-C en la sonda: +10,9 pp, IC 95 % [+2,6, +19,9].
- F-T − F-C en nuevos estados: −0,8 pp, IC 95 % [−4,6, +2,1].
- F-T no supera la puerta de retención pre-registrada en la suite `libero_10` (−8,3 pp, impulsado por una tarea).
- Resultados de una sola semilla de entrenamiento y de carácter exploratorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 102 GiB por checkpoint; en bf16 el backbone de 27B requiere del orden de 54 GiB solo para pesos, más overhead de activaciones y de la cabeza de acción.
- GPU recomendadas: no se especifican en la información; por tamaño, se requiere hardware de clase A100/H100 de 80 GB o multi-GPU para fp32/bf16.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en bf16 ni fp32 sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: el backbone `backbone/` puede cargarse con `transformers`; los checkpoints completos requieren la clase `Student` del proyecto (`llmcorrect.p9.model.Student.load`), que no está incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| supernon/llm-correct | 27B (backbone) + cabeza | no disponible | VLA en LIBERO | derivado de Qwen3.5-27B | Hugging Face (0 descargas) |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Resultados de una sola semilla de entrenamiento y de carácter exploratorio; no deben interpretarse como evidencia concluyente.
- No hay ganancia medible en nuevos estados iniciales (−0,8 pp, IC 95 % [−4,6, +2,1]).
- F-T no supera la puerta de retención pre-registrada en `libero_10` (−8,3 pp, impulsado por una tarea).
- Los checkpoints requieren la clase `Student` del proyecto (`llmcorrect.p9.model.Student.load`), no incluida en el repositorio; solo el backbone es cargable con `transformers`.
- Licencia: son derivados de Qwen3.5-27B y deben usarse bajo la licencia del modelo base; la licencia concreta no se especifica en la información disponible.
- El campo `model_dir` de `student.json` apunta a la ruta original de entrenamiento y puede ignorarse.
- No se declaran idiomas soportados ni sesgos conocidos; el alcance es exclusivamente el benchmark LIBERO.
- Sin descargas ni likes en el momento de la consulta; sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/supernon/llm-correct
