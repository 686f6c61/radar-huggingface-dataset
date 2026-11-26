# wesjos/Llama-3.1-8B-Thinking-SFT

## Resumen

Llama-3.1-8B-Thinking-SFT es un ajuste fino supervisado (SFT) del modelo `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario wesjos en Hugging Face. El modelo introduce un modo de razonamiento explícito: antes de emitir la respuesta final, genera un bloque de cadena de pensamiento delimitado por las etiquetas `<think>...</think>`, reutilizando dos tokens especiales del vocabulario de Llama-3.1 (IDs 128002 y 128003) a los que se ha cambiado el nombre visible por el estilo de Qwen. La version publicada corresponde al checkpoint step3000, descrito por el autor como version final.

El objetivo es dotar a un modelo denso de 8.000 millones de parametros de capacidad de razonamiento multi-paso sin cambiar el tokenizador ni el esquema de atencion, de modo que pueda desplegarse con las mismas herramientas que el modelo base (transformers, llama.cpp, vLLM). El autor reporta una mejora en GSM8K de 75,94% a 84,38% respecto al base, aunque sin detallar la metodologia de evaluacion mas alla de "1319 preguntas en ciego".

La relevancia practica es doble: por un lado, demuestra una receta sencilla para anadir razonamiento explicito a un modelo Llama-3.1 existente; por otro, su escasa adopcion (0 descargas, 0 likes en el momento de la consulta) y la ausencia de licencia e idiomas declarados lo convierten en un artefacto de investigacion mas que en una opcion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1), denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.1-8B-Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; el autor menciona cabeceras GGUF con parametros de muestreo, lo que implica existencia de builds GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,1 GB); GGUF mencionado indirectamente |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso con 8.030 millones de parametros, y se somete a un ajuste fino supervisado (SFT) orientado a generar cadenas de pensamiento. La innovacion principal es la incorporacion de dos tokens especiales de "thinking" que ocupan los slots 128002 y 128003 del vocabulario de Llama-3.1; el autor renombra su representacion textual a `<think>` y `</think>` siguiendo la convencion de Qwen, pero mantiene intactos los IDs, lo que preserva la compatibilidad con tokenizadores y herramientas existentes.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales. Tampoco se detalla la configuracion de hardware ni la duracion del entrenamiento. El checkpoint publicado corresponde al step3000. Los parametros de muestreo recomendados son temperature 0.6, top_p 0.95, top_k desactivado y repetition_penalty 1.05, valores que el autor indica que estan embebidos en las cabeceras GGUF (`general.sampling.*`) para que llama.cpp los aplique sin configuracion manual.

## Capacidades

- Generacion de texto con razonamiento explicito: emite primero un bloque `<think>...</think>` y despues la respuesta final, lo que permite auditar el proceso de razonamiento.
- Razonamiento matematico: el autor reporta mejoras sustanciales en GSM8K respecto al modelo base.
- Razonamiento multi-paso: el formato de cadena de pensamiento esta disenado para problemas que requieren descomposicion.
- Conversacion multi-turno: heredada del modelo Instruct base, con soporte de `apply_chat_template`.
- Compatibilidad con el ecosistema Llama-3.1: mismos tokens especiales, mismo tokenizador, mismos formatos de pesos.
- Tool calling y function calling: no confirmado en la model card; al derivar de Llama-3.1-Instruct es plausible que conserve parte de esta capacidad, pero no esta verificado.
- Capacidades multilingues: no disponibles; el autor no declara idiomas y la model card esta redactada en chino.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas aritmeticos y algebraicos de varios pasos mostrando el desarrollo dentro de `<think>`, lo que facilita la verificacion por parte del usuario y la depuracion de errores. Es adecuado por la mejora reportada en GSM8K (84,38% frente a 75,94% del base).
- Tutorizacion educativa: el bloque de pensamiento permite mostrar al estudiante el razonamiento intermedio en lugar de solo la respuesta, util en plataformas de aprendizaje que quieran explicar el "por que" de cada paso.
- Generacion de datos sinteticos de razonamiento: el formato `<think>` estructurado facilita el filtrado y la extraccion automatica de cadenas de pensamiento para construir datasets de entrenamiento de otros modelos.
- Investigacion en interpretabilidad: al separar explicitamente razonamiento y respuesta, el modelo sirve como banco de pruebas para estudiar si el contenido de `<think>` correlaciona con la respuesta final o si es post-hoc.
- Prototipado de agentes con trazas auditables: en pipelines internos donde se requiere registrar el proceso de decision, el bloque de pensamiento actua como log estructurado de cada paso.
- Evaluacion comparativa de tecnicas de SFT: util como referencia para equipos que investigan recetas de razonamiento sobre Llama-3.1 y necesitan un punto de comparacion reproducible con el checkpoint step3000.

## Benchmarks y rendimiento

| Benchmark | Base (Llama-3.1-8B-Instruct) | Llama-3.1-8B-Thinking-SFT |
|---|---|---|
| GSM8K (1319, ciego) | 75,94% | 84,38% |
| "Problemas dificiles" (453) | 72,63% | 72,63% |

Los datos provienen exclusivamente de la model card del autor. No se detalla la metodologia de evaluacion (prompting, numero de muestras, criterio de correccion) ni se aportan resultados en MMLU, HumanEval, MATH u otros benchmarks estandar. El conjunto de "problemas dificiles" de 453 items no muestra mejora alguna, lo que sugiere que la ganancia se concentra en problemas de dificultad media.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (Q4_K_M): alrededor de 5 GB de pesos, apto para GPUs de consumo.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4-8 bits; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), llama.cpp (el autor menciona cabeceras GGUF con parametros de muestreo embebidos), y previsiblemente vLLM y TGI al ser compatible con la arquitectura Llama-3.1, aunque no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento explicito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Thinking-SFT | 8,03 B | no disponible | Si (`<think>`) | no disponible | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct | 8,03 B | 128 K | No | Llama 3.1 Community License | Ampliamente disponible |
| Qwen3-8B | 8,2 B | 32 K nativo (hasta 128 K con YaRN) | Si (modo thinking) | Apache 2.0 | Ampliamente disponible |
| DeepSeek-R1-Distill-Llama-8B | 8,03 B | 128 K | Si (`<think>`) | MIT | Ampliamente disponible |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de resultados de benchmarks homogeneos entre ellos en la informacion proporcionada. Frente a las alternativas, el modelo de wesjos carece de licencia declarada y de adopcion verificable, lo que limita su uso en produccion.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica bajo que terminos puede usarse, modificarse o redistribuirse, lo que impide el uso comercial con garantias juridicas.
- Ausencia de idiomas declarados: no se confirma el soporte multilingue ni la calidad en castellano; la model card esta en chino y el dataset de SFT podria estar sesgado hacia ese idioma.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Benchmarks limitados: solo GSM8K y un conjunto no identificado de 453 problemas; sin MMLU, HumanEval, MATH ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de 8 B; el bloque `<think>` puede contener razonamiento plausible pero incorrecto que no correlacione con la respuesta final.
- Naturaleza del "thinking": al ser SFT y no RL, el modelo puede producir cadenas de pensamiento superficiales o post-hoc; el autor no reporta evaluaciones de fidelidad del razonamiento.
- Compatibilidad de plantilla: el renombrado de tokens a `<think>`/`</think>` mantiene los IDs, pero herramientas que esperen los nombres originales de Llama-3.1 podrian comportarse de forma inesperada.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Checkpoint unico: solo se publica el step3000, sin acceso a estados intermedios para reproducir la curva de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Llama-3.1-8B-Thinking-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Llama 3.1 en Meta: https://github.com/meta-llama/llama-models
- Documentacion de Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
