# YanSong97/E2K-Qwen3.5-9B-tagged-sft-A-knowledge-step49

## Resumen

E2K-Qwen3.5-9B-tagged-sft-A-knowledge-step49 es un checkpoint de investigación publicado por YanSong97, obtenido mediante ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B. El modelo forma parte de una línea de trabajo denominada "experience-to-knowledge" (E2K), orientada a estudiar si un modelo puede internalizar conocimiento factual de entornos de juego y reutilizarlo durante el razonamiento y la acción. El checkpoint corresponde a la etapa de SFT "knowledge-only", con la etiqueta de paso 49 (50 actualizaciones del optimizador), inicializado de forma independiente desde el modelo base.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (pipeline image-text-to-text), con 9.653.104.368 parámetros totales según los pesos en safetensors. Sin embargo, el entrenamiento se realizó exclusivamente sobre texto y rejillas (grids); la torre de visión y los tensores auxiliares MTP no fueron entrenados en este experimento y se restauraron congelados mediante un helper de exportación. Por tanto, no debe interpretarse como una mejora general del modelo base.

La relevancia de este checkpoint es acotada y de carácter investigador: el propio autor advierte que no es una mejora de propósito general de Qwen3.5-9B ni evidencia de éxito en layouts nuevos o en el juego completo. Los resultados se limitan a los entornos de primer nivel cd82 y m0r0, y los audits internos detectan fallos como coordenadas fabricadas, mezcla de reglas entre juegos, desajustes entre explicación y acción y generación repetitiva incluso en episodios exitosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y tensores MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento RL usa input de 12K y estado actual completo, con salida limitada a 16K) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, ~19,3 GB de repo), más config, tokenizer y processor estándar de HF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de 9,65 mil millones de parámetros. El checkpoint se obtuvo mediante SFT con 50 actualizaciones del optimizador, 3 épocas, learning rate 5e-6 y batch global de 4, sobre el brazo `A_knowledge` inicializado de forma independiente desde Qwen/Qwen3.5-9B. Los datos de SFT incluyen únicamente filas de respuesta de conocimiento y de "initial look" (sin los 12 ejemplos de aplicación post-look). El conjunto de conocimiento observacional local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0), representados por 58 filas pregunta/respuesta; los brazos B/C añaden 12 ejemplos construidos de estado/aplicación y todos los brazos incluyen 8 ejemplos de protocolo de initial-look.

El entrenamiento es textual y basado en rejillas; la torre de visión y los tensores auxiliares MTP quedaron congelados y se restauraron en la exportación. El autor documenta que los datos se derivan localmente de observaciones/replay de OpenCode y trabajo editorial externo, y no son un espejo fila a fila del dataset de conocimiento de ziyan98 ni una colección de pensamientos de un modelo profesor. La etapa de RL asociada (descrita en la model card como contexto del linaje) usa 40 acciones de entorno por episodio, razonamiento de esfuerzo medio, tope de salida de 16K, temperatura 1, learning rate constante 1e-6 y TP4/PP1, con 8 episodios por batch (4 cd82 + 4 m0r0). La recompensa de resultado es un "clear" real de primer nivel configurado; el brazo de proceso añade progreso de estado de tarea ligado a replay, con tope 0,2 y gamma 0,99.

## Capacidades

- Generación de texto y razonamiento multimodal en el formato del Qwen3.5 base (pipeline image-text-to-text), aunque la torre de visión no fue entrenada en este experimento.
- Razonamiento sobre estados de juego basados en rejillas (grids) y selección de acciones en entornos tipo ARC-AGI-3.
- Internalización de conocimiento factual acotado: 29 hechos de primer nivel de los entornos cd82 y m0r0.
- Protocolo de "initial look": interpretación de una observación inicial antes de actuar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al bucle de 40 acciones por episodio descrito en el protocolo de RL.
- Capacidades multilingües: no disponibles (la model card incluye texto en chino, pero no se documenta cobertura de idiomas).
- Modo "thinking": el protocolo de RL menciona "medium reasoning effort", pero no se detalla un modo de pensamiento explícito para el checkpoint SFT.

## Casos de uso

- Investigación sobre internalización de conocimiento: el checkpoint sirve para estudiar si el SFT sobre hechos aislados permite al modelo responder correctamente preguntas sobre reglas de los entornos cd82 y m0r0 antes de actuar.
- Reproducción de experimentos E2K: permite inicializar nuevos brazos de entrenamiento (SFT o RL) desde un punto intermedio documentado, con linaje y procedencia registrados en `provenance.json`.
- Análisis de fallos en agentes de juego: los audits del autor documentan coordenadas fabricadas y mezcla de reglas, lo que convierte al modelo en un caso de estudio para detectar estos errores en pipelines de evaluación.
- Evaluación de transferencia de conocimiento a la acción: útil para medir la brecha entre "recitar" un hecho y aplicarlo correctamente en una decisión de juego.
- Baseline para comparativas de SFT: al ser un checkpoint de 50 actualizaciones con hiperparámetros conocidos, sirve como referencia controlada frente a brazos B/C con ejemplos de aplicación.
- Estudio de recompensas de proceso: el linaje RL asociado permite analizar cómo una recompensa de progreso de estado (con tope 0,2) afecta al comportamiento frente a una recompensa de resultado pura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables; solo describe métricas internas de entrenamiento (por ejemplo, `rollout/rewards` como media de ventaja ponderada por respuesta, que el autor aclara que no es la recompensa de entorno).

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 9,65 mil millones de parámetros ocupan aproximadamente 19,3 GB de pesos, por lo que se necesitan al menos ~20-22 GB de VRAM contando caché de activaciones y contexto.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o GPUs consumer de 24 GB (RTX 3090, RTX 4090) para bfloat16 ajustado; para contextos largos se recomienda A100/H100.
- Cabe en GPU consumer: sí, en RTX 3090/4090 de 24 GB con bfloat16 y contexto moderado; en GPUs de 16 GB requeriría cuantización, que no está publicada en este repo.
- Opciones de despliegue: transformers (código de carga incluido en la model card con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-sft-A-knowledge-step49 | 9,65 B | No disponible | Apache-2.0 | Pesos en HF (15 descargas) | Checkpoint de investigación, sin benchmarks públicos |
| Qwen/Qwen3.5-9B | ~9 B | No disponible | No disponible en la información | Modelo base en HF | Base del fine-tuning; capacidades generales no evaluadas aquí |
| Colecciones E2K de ziyan98 | No disponible | No disponible | No disponible | HF | Proyecto separado; el autor indica que no hereda sus puntuaciones |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B; el autor lo declara explícitamente.
- No hay evidencia de éxito en layouts nuevos ni en el juego completo; los resultados se limitan a los entornos cd82 y m0r0.
- Los audits internos detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajustes entre explicación y acción y generación repetitiva incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del conocimiento.
- El cohorte de muestreo registrado en `training_metadata.json` se generó antes de su actualización y no debe reportarse como evaluación independiente de estos pesos.
- El aprendizaje es no monotónico y está dominado por m0r0; la continuación larga de proceso se detuvo en 341 por muestreo con todos los fallos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos exactos del pico 260..269 no se conservan; HF249 no está etiquetado como el mejor checkpoint.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler: los pesos de HF pueden inicializar trabajo futuro pero no permiten una continuación exacta de Adam.
- La torre de visión y los tensores MTP están congelados y no fueron entrenados, lo que limita cualquier uso multimodal no previsto.
- Licencia Apache-2.0 copiada de la exportación base; el uso comercial está permitido por licencia, pero la calidad investigadora del checkpoint no está validada para producción.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-A-knowledge-step49
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de conocimiento y filas exactas de SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
