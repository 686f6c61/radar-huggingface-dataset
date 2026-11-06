# StephC/Gemma-2-2B-Question-First-Exposure-QOC-seed20261009

## Resumen

Gemma-2-2B-Question-First-Exposure-QOC-seed20261009 es un ajuste fino completo del modelo google/gemma-2-2b-it, publicado por el investigador StephC (Stefano Civelli) como parte del material de replicación del articulo *Exposure to Question-First Prompts Changes How Language Models Read the Context*. No es un asistente conversacional de proposito general, sino un checkpoint de investigacion disenado para estudiar como el orden de los elementos en un prompt (contexto, pregunta y opciones) altera el comportamiento interno del modelo en tareas de eleccion multiple.

El modelo parte de la arquitectura Gemma 2 de Google (transformer decoder-only de 2.614.341.888 parametros) y se entrena con 4.096 registros de cuatro benchmarks de razonamiento y comprension lectora (RACE-M, RACE-H, LogiQA y SciQ), en la configuracion QOC: primero la pregunta, luego las opciones y por ultimo el contexto. Forma parte de una release de nueve checkpoints (tres familias de modelos por tres regimenes de orden de prompt) fijados a la semilla 20261009.

Su relevancia es acotada pero clara: sirve como artefacto reproducible para investigacion en interpretabilidad mecanistica y sensibilidad al orden de prompt, no como modelo de produccion. El autor advierte explicitamente que los resultados se limitan a los conjuntos de eleccion multiple y a la plantilla de prompt del paper, y que no se reclama ningun rendimiento general fuera de ese marco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2), atencion eager |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en FP32 sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use, con Prohibited Use Policy) |
| Formato de pesos | safetensors (FP32, tensores sin reshardear ni convertir) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del checkpoint google/gemma-2-2b-it en su revision 299a8560bedf22ed1c72a8a11e7dce4a7f9f51f8. Se entrenaron todos los parametros en FP32 con estados de AdamW, autocast en BF16, learning rate de 5e-6, batch efectivo de 8 y atencion eager, durante 1.024 actualizaciones del optimizador (dos pasadas sobre 4.096 registros). El conjunto de entrenamiento se reparte a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, todos ellos tareas de eleccion multiple en ingles.

La innovacion del trabajo no esta en la arquitectura, sino en la variable experimental: el regimen QOC presenta cada ejemplo con la pregunta antes que el contexto, frente al orden CQO convencional. El paper compara modelos entrenados solo con CQO, solo con QOC y con orden mixto, y analiza mediante intervenciones (question-swap assay) como cambia la lectura del contexto. El checkpoint se distribuye byte a byte tal como se evaluo, con un `release_manifest.json` que registra la receta y los SHA-256 originales de cada fichero. No incluye estados del optimizador ni texto de entrenamiento.

## Capacidades

- Generacion de texto y respuesta a preguntas de eleccion multiple en el formato exacto del paper (contexto, pregunta y opciones con etiquetas puntuadas).
- Razonamiento sobre comprension lectora y logica formal, limitado a los dominios de RACE, LogiQA y SciQ.
- Evaluacion de sensibilidad al orden de prompt: el checkpoint esta especificamente entrenado para el orden QOC.
- Soporte de intervenciones de interpretabilidad mecanistica (question-swap assay) en FP32.
- Compatibilidad con `transformers` y con text-generation-inference segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Replicacion experimental: cargar el checkpoint con `snapshot_download` fijando el commit del manifiesto y ejecutar `qfe.evaluate` y `qfe.question_swap` del repositorio del paper para reproducir las cifras publicadas.
- Estudio de sesgo de orden de prompt: comparar este checkpoint QOC con sus equivalentes CQO y mixto de la misma semilla para aislar el efecto del orden de los elementos del prompt.
- Interpretabilidad mecanistica: analizar activaciones y patrones de atencion con el question-swap assay en FP32, que es el regimen que el autor indica para preservar ese experimento.
- Docencia e investigacion en NLP: usar el modelo como caso de estudio de como el ajuste fino sobre un dataset pequeno (4.096 registros) altera el comportamiento de un modelo base de 2.600 millones de parametros.
- Auditoria de artefactos de investigacion: verificar la integridad de los pesos mediante los SHA-256 del `release_manifest.json` y comprobar la reproducibilidad de la receta declarada.
- Evaluacion de robustez de benchmarks: medir cuanto varian las puntuaciones de eleccion multiple al permutar contexto, pregunta y opciones con un modelo explicitamente entrenado en un orden no convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las evaluaciones del repositorio del paper (`qfe.evaluate` sobre el conjunto `analysis`), pero no incluye cifras numericas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 10,5 GB solo para pesos (2,61 mil millones de parametros a 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en BF16: unos 5,2 GB para pesos; en cuantizacion de 8 bits, unos 2,6 GB; en 4 bits, unos 1,3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para FP32 sin compromisos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP32 con margen; GPUs de 8-12 GB solo en BF16 o cuantizadas.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y en tarjetas de 8 GB si se cuantiza, aunque el autor no publica versiones GGUF ni cuantizadas.
- Opciones de despliegue: `transformers` (libreria declarada) y text-generation-inference segun los tags; llama.cpp u Ollama requeririan conversion propia a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-2-2B-Question-First-Exposure-QOC-seed20261009 | 2,61 B | no disponible | Investigacion sobre orden de prompt (QOC) | gemma | Hugging Face, FP32, 0 descargas |
| google/gemma-2-2b-it (modelo base) | 2,61 B | no disponible | Asistente conversacional instruido | gemma | Hugging Face, ampliamente usado |
| Gemma-2-2B-Question-First-Exposure-CQO (misma release) | 2,61 B | no disponible | Investigacion sobre orden de prompt (CQO) | gemma | Hugging Face, misma release |
| Gemma-2-2B-Question-First-Exposure-Mixed (misma release) | 2,61 B | no disponible | Investigacion sobre orden de prompt (mixto) | gemma | Hugging Face, misma release |

La comparacion relevante es interna a la release: los nueve checkpoints comparten base, datos y semilla, y solo difieren en el regimen de orden de prompt, lo que los convierte en el control experimental adecuado. Frente al modelo base, este checkpoint pierde utilidad como asistente general y gana especificidad para la tarea estudiada.

## Limitaciones y advertencias

- No es un asistente conversacional: fue ajustado sobre respuestas de eleccion multiple y su uso fuera de la plantilla del paper no esta validado.
- Los resultados se limitan a RACE-M, RACE-H, LogiQA y SciQ en ingles; no se reclama rendimiento general.
- La release de una sola semilla no reproduce por si misma los intervalos de incertidumbre a nivel de semilla del paper, que reporta seis semillas.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al derivar de Gemma 2, hereda los sesgos del modelo base y de los datasets de entrenamiento.
- Licencia Gemma: el uso y la redistribucion estan sujetos a la Seccion 3.2 de los Gemma Terms y a la Prohibited Use Policy; revisar `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt` antes de cualquier uso comercial.
- El checkpoint se distribuye en FP32 y sin cuantizar; no hay versiones GGUF ni adaptadores LoRA en el repositorio.
- No incluye estados del optimizador, texto de entrenamiento ni credenciales; es un checkpoint completo, no un adaptador.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria independiente de su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephC/Gemma-2-2B-Question-First-Exposure-QOC-seed20261009
- Repositorio del paper (codigo, outputs y reproduccion): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigacion original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
