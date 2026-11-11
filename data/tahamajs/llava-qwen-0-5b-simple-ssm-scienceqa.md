# tahamajs/llava-qwen-0.5b-simple-ssm-scienceqa

## Resumen

`llava-qwen-0.5b-simple-ssm-scienceqa` es un checkpoint experimental de un modelo vision-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario tahamajs dentro del proyecto NeuralOps. La propuesta no es un modelo nuevo entrenado desde cero, sino una "cirugía de atención" (*attention surgery*): se sustituyen las proyecciones de auto-atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por un operador de espacio de estados simplificado denominado `simple_ssm`, manteniendo seis capas de atención cuadrática como anclas.

El objetivo es explorar si un bloque SSM ligero puede reemplazar parte de la atención estándar en un VLM pequeño sin destruir su capacidad de razonamiento visual, y si la destilación de conocimiento desde el modelo profesor original permite recuperar parte del rendimiento perdido. El checkpoint resultante pesa 147,62 MB en FP16 (frente a 1,66 GB del base completo), lo que supone una reducción del 91,3 % del artefacto de pesos, y se evalúa sobre el subconjunto con imagen de ScienceQA en validación.

Es relevante ahora como pieza de investigación reproducible sobre eficiencia en VLMs: documenta con detalle la topología de la cirugía, las métricas de entrenamiento y el compromiso entre compresión y precisión. No obstante, con 43,12 % de accuracy frente al 63,75 % del profesor, es un artefacto de experimentación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con 18/24 capas de auto-atención sustituidas por `SimpleSSM` (familia SSM, esquema híbrido `hybrid_3_1`) |
| Parámetros totales | no disponible (el modelo base es de 0,5B; el checkpoint solo serializa pesos de atención) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16, formato `attention_only_fp16`) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico en FP16) + `surgical_manifest.json`, `config.json`, tokenizer y processor |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`: torre visual SigLIP congelada de 27 capas, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y `head_dim=64`. La intervención reemplaza la auto-atención en 18 de esas 24 capas por `SimpleSSM`, un operador de espacio de estados con proyecciones Q/K/V/O alineadas con GQA, decaimiento exponencial selectivo y acotado, escaneo causal paralelo por bloques (*chunked parallel causal scan*) e inicialización residual del *skip* de valor. Las 6 capas restantes (`[3, 7, 11, 15, 19, 23]`) se conservan como anclas cuadráticas. Permanecen congelados la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento es una destilación de conocimiento en dos etapas sobre ScienceQA, ejecutada en una única RTX 3090 (24 GB) con 182 pasos totales (68 en etapa 1, 114 en etapa 2), 120,6 s de duración y 13.523 MB de VRAM pico. No se documentan el volumen de tokens, la composición exacta del dataset más allá de ScienceQA ni si hubo RLHF o DPO. La innovación técnica destacable es el propio procedimiento de cirugía modular con manifiesto de topología (`schema_version=neuralops.surgery/v2`, 336 tensores guardados) y la recuperación vía KD: la perplejidad pasa de 204,30 en zero-shot a 2,97 tras la destilación, y la accuracy de 32,50 % a 43,12 %.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), orientada a respuesta a preguntas visuales de tipo STEM.
- Razonamiento visual de opción múltiple sobre figuras y diagramas científicos, tal como se evalúa en ScienceQA.
- Conversación multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imagen con preprocesador propio (`preprocessor_config.json`), con resolución de entrada no especificada en la información disponible.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se limita a VQA de ScienceQA.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo *thinking*, visión adicional, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre eficiencia de atención en VLMs: sirve como punto de comparación reproducible entre atención cuadrática y SSM híbrido en un mismo backbone, con métricas y telemetría de entrenamiento publicadas.
- Prototipado de VQA educativa de bajo coste: para preguntas de ciencia con imagen y respuesta de opción múltiple, el modelo cabe en una GPU de consumo y responde en el orden de segundos, adecuado para demos internas.
- Experimentos de destilación de conocimiento: el par profesor (63,75 %) / alumno (43,12 %) y la curva de perplejidad pre/post-KD permiten estudiar recetas de recuperación de precisión tras compresión.
- Benchmarking de operadores SSM: la implementación `SimpleSSM` con escaneo causal por bloques puede evaluarse frente a otras variantes del zoo de NeuralOps usando el mismo pipeline de evaluación.
- Docencia y divulgación técnica: el artefacto de 147,62 MB y el manifiesto quirúrgico facilitan explicar cómo se sustituye un bloque de atención y qué se guarda exactamente en disco.
- Pruebas de integración del ecosistema NeuralOps: útil para validar `load_surgeried_model`, el formato `neuralops.surgery/v2` y la carga de deltas de atención en pipelines propios.
- Generación de material de evaluación sintético: con un VLM pequeño y rápido se pueden preetiquetar preguntas visuales de ciencia para revisión humana posterior, asumiendo la tasa de error del 56,88 % restante.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 43,12 | +10,62 |
| Perplejidad | 2,45 | 204,30 | 2,97 | -201,33 |

Telemetría de entrenamiento: 182 pasos, 120,6 s, VRAM pico 13.523 MB en RTX 3090. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento ocupó 13.523 MB en una RTX 3090, por lo que la inferencia en FP16 debería situarse por debajo de esa cifra, pero no se documenta.
- GPU recomendadas: cualquier GPU con al menos 24 GB para replicar el flujo de entrenamiento (RTX 3090, A100, H100). Para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, al menos en RTX 3090 según la telemetría de entrenamiento; no se confirma para GPUs de 8-16 GB.
- Opciones de despliegue: la model card solo documenta `neuralops.hub.load_surgeried_model` con PyTorch. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint es un delta de atención y no un modelo completo autónomo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-simple-ssm-scienceqa` | ~0,5B (base) | no disponible | 43,12 % accuracy / 2,97 PPL | MIT | Hugging Face, requiere NeuralOps |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la información | Hugging Face, transformers |
| Otros checkpoints del zoo NeuralOps con cirugía de atención | ~0,5B | no disponible | no disponible | MIT (presumible) | Hugging Face |
| VLMs pequeños alternativos (p. ej. familia SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas fuera del zoo no puede completarse con los datos proporcionados; se indica "no disponible" para evitar cifras sin respaldo.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 43,12 % frente al 63,75 % del profesor, una caída de 20,63 puntos absolutos. No es apto para producción sin un profesor o un modelo mayor en el bucle.
- El checkpoint no es un modelo completo: solo contiene los pesos de atención modificados y los layernorms entrenados. Requiere el modelo base y la librería NeuralOps para reconstruirse.
- Métricas no verificadas (`verified: false` en el model-index) y evaluadas en un único subconjunto de validación de ScienceQA; no hay evidencia de generalización a otros dominios visuales.
- Idiomas: solo inglés declarado; no hay evaluación multilingüe ni garantías fuera de ese idioma.
- Riesgo de alucinación: alto en un VLM de 0,5B entrenado con destilación sobre un dataset acotado; las respuestas de opción múltiple pueden ser plausibles pero incorrectas.
- Sesgos: no documentados por el autor; al entrenarse sobre ScienceQA, puede heredar sesgos de composición y representación del dataset.
- Licencia MIT, lo que permite uso comercial del artefacto, pero el modelo base y los datos de entrenamiento pueden tener condiciones propias que deben revisarse por separado.
- Fecha de creación y actualización (2026-11-11) posterior a la fecha actual de referencia; conviene verificar la integridad del repositorio antes de usarlo.
- Sin datos de contexto máximo, cuantizaciones soportadas ni latencia, lo que dificulta planificar un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-simple-ssm-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `SimpleSSM`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/simple_ssm.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
