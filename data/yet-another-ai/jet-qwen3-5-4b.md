# yet-another-ai/Jet-Qwen3.5-4B

## Resumen

Jet-Qwen3.5-4B es un ajuste fino supervisado del modelo de texto Qwen/Qwen3.5-4B, desarrollado por yet-another-ai para alimentar Jet, un motor local de decisiones estructuradas. El modelo no está pensado como un asistente conversacional general, sino como un evaluador de candidatos semanticos: recibe un estado y un conjunto fijo de respuestas posibles, y devuelve la eleccion junto con las probabilidades relativas de cada candidato mediante teacher forcing. Con 4.205.751.296 parametros y licencia Apache-2.0, se distribuye en BF16 (transformers) y en GGUF Q8_0 para llama.cpp.

La relevancia del lanzamiento esta en su enfoque: en lugar de generar JSON o letras de respuesta, el modelo puntua continuaciones de texto correctas bajo el renderizador de prompts propio de Jet. Esto lo hace adecuado para sistemas de enrutamiento, clasificacion operativa y triaje donde la salida debe ser una decision acotada y auditable, no texto libre. El metodo subyacente se describe en el paper JET: Justification Evaluation in Transformer (arXiv:2609.33874).

El modelo base es la variante de texto de Qwen3.5-4B, sin torre de vision ni proyector, por lo que no realiza inferencia de imagenes. El entrenamiento se hizo con LoRA en BF16 sobre 22.791 registros de BoolQ, ARC Easy, ARC Challenge y SNLI, y el repositorio incluye el adaptador PEFT original, los pesos fusionados, el GGUF, la configuracion de entrenamiento y los informes de evaluacion archivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante de texto `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia en entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | BF16 (pesos fusionados); GGUF Q8_0 publicado |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), PEFT LoRA (subcarpeta `adapter/`), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 en su variante exclusivamente de texto. Sobre el checkpoint base `Qwen/Qwen3.5-4B` (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) se aplico un ajuste fino supervisado con LoRA en BF16: rango 16, alpha 32, dropout 0.05, learning rate 1e-4, batch efectivo 16 (microbatch 4 x acumulacion 4), semilla 42, una epoca y longitud maxima de secuencia de 2.048 tokens. Solo los tokens de la continuacion objetivo contribuyen a la perdida, y el entrenamiento usa el renderizador de prompts real de Jet. No hay destilacion de trazas de razonamiento ni de distribuciones de un modelo profesor.

El conjunto de entrenamiento consta de 22.791 registros: BoolQ (9.427), ARC Easy (2.248), ARC Challenge (1.116) y SNLI (10.000). La validacion usa un subconjunto determinista de como maximo 512 registros para monitorizar la perdida por checkpoint, y MMLU se mantiene fuera del entrenamiento como conjunto retenido. El recipe no entrena salida JSON, letras de respuesta, una cabeza clasificadora ni entradas de imagen; la innovacion principal es el uso de teacher forcing sobre respuestas semanticas citadas para producir una distribucion softmax relativa sobre los candidatos suministrados.

## Capacidades

- Puntuacion de decisiones estructuradas: dado un estado y un conjunto de opciones con criterios, devuelve la eleccion y las probabilidades relativas de cada candidato.
- Evaluacion de candidatos con teacher forcing y normalizacion por token medio, integrada en el motor Jet.
- Clasificacion de texto en dominios acotados: preguntas booleanas (BoolQ), razonamiento de opciones multiples (ARC Easy y Challenge) e inferencia de entailment (SNLI).
- Inferencia local: el GGUF Q8_0 esta pensado para ejecutarse con Jet o llama.cpp en hardware propio.
- No soporta tool calling ni function calling de forma nativa en la informacion disponible.
- No soporta agentes multi-paso ni razonamiento encadenado como capacidad entrenada.
- Capacidades multilingues no establecidas: solo se declara ingles.
- No dispone de modo thinking, vision ni audio; el release contiene solo el modelo de texto.

## Casos de uso

- Triaje de incidencias: el modelo recibe el estado de un ticket y un conjunto cerrado de equipos propietarios (`app`, `infra`, etc.) y devuelve la asignacion con probabilidades, como muestra el ejemplo oficial de la API `/api/alpha/decisions`.
- Enrutamiento de soporte al cliente: clasificar consultas entrantes en categorias predefinidas con criterios explicitos, aprovechando la puntuacion de candidatos para priorizar colas.
- Verificacion de afirmaciones: usar la formulacion de entailment aprendida de SNLI para decidir si una premisa implica, contradice o es neutral respecto a una hipotesis en pipelines de control de calidad documental.
- Respuesta a preguntas booleanas en bases de conocimiento: aplicar el comportamiento aprendido de BoolQ para resolver consultas del tipo si/no sobre documentacion interna con opciones acotadas.
- Razonamiento de opciones multiples en evaluacion interna: emplear la capacidad entrenada en ARC Easy y ARC Challenge para tareas de seleccion entre alternativas en entornos de test controlados.
- Decisiones auditables en produccion: desplegar el GGUF Q8_0 con `jet serve` para obtener elecciones con probabilidades relativas registrables, utiles en flujos donde se exige trazabilidad de la decision.
- Moderacion o etiquetado con taxonomias fijas: puntuar cada clase de una taxonomia predefinida sobre un texto de entrada y seleccionar la de mayor probabilidad, siempre que el dominio se parezca a los datos de entrenamiento.

## Benchmarks y rendimiento

Los informes archivados miden la puntuacion de candidatos de Jet con normalizacion por token medio y pesos Q8_0; no son puntuaciones de generacion conversacional ni probabilidades calibradas.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU (informe pareado 4B archivado) | 74,39 % (10.446/14.042) | Conjunto retenido; el informe baseline registra 9.332/14.042 |
| Efecto de entrenamiento controlado | no establecido | El archivo no acredita una exportacion/conversion base emparejada, a diferencia del experimento de 0.8B |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks estandar de generacion para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,4 GB solo para pesos (4,2B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en GGUF Q8_0: aproximadamente 4,5 GB para pesos, con margen adicional para contexto y buffers.
- GPU recomendadas: A100 o H100 para despliegues concurrentes en BF16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con contexto moderado; GPUs consumer de 8-12 GB para Q8_0.
- Cabe en GPU consumer: si, en Q8_0 en tarjetas de 8 GB o superiores; en BF16 requiere al menos 12-16 GB para operar con comodidad.
- Opciones de despliegue: Jet (`jet serve --model-path ... --model-id yet-another-ai/Jet-Qwen3.5-4B`), llama.cpp con el GGUF Q8_0, transformers con los pesos safetensors o el adaptador PEFT (`subfolder="adapter"`). La compatibilidad con vLLM y TGI no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte que los limites de memoria y compatibilidad de WebGPU en navegador difieren de la inferencia nativa en CUDA; el demo web por defecto usa el modelo de 0.8B y el 4B Q8_0 requiere Jet nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jet-Qwen3.5-4B | 4,2B | no disponible | Decisiones estructuradas (scoring de candidatos) | Apache-2.0 | HuggingFace, GGUF Q8_0, adaptador LoRA |
| Qwen/Qwen3.5-4B (base) | 4,2B | no disponible | Generacion de texto general | Apache-2.0 (segun modelo base) | HuggingFace |
| Modelos de 3-4B para clasificacion (p. ej. variantes ajustadas de Llama o Mistral) | 3-8B | variable | Clasificacion y enrutamiento | variable | HuggingFace |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; no se han publicado metricas cruzadas con otros modelos de decision estructurada.

## Limitaciones y advertencias

- El entrenamiento se centra en decisiones sobre texto en ingles y una mezcla pequena de tareas; el rendimiento en dominios arbitrarios y en otros idiomas no esta establecido.
- La confianza devuelta es un softmax relativo sobre los candidatos suministrados, no una certeza calibrada; no debe interpretarse como probabilidad fiable.
- La redaccion y el orden de los candidatos pueden alterar los resultados, por lo que cambios en las opciones exigen revalidacion.
- Las comprobaciones de solapamiento con conjuntos retenidos no garantizan ausencia de contaminacion en el modelo base preentrenado.
- Cargar el modelo en un chat generico no reproduce el comportamiento de puntuacion de Jet; es necesario usar su renderizador de prompts y su ruta de scoring.
- No soporta imagenes: el release excluye torre de vision y proyector.
- El informe MMLU archivado no constituye una estimacion controlada del efecto del entrenamiento, ya que no hay exportacion base emparejada.
- La licencia Apache-2.0 permite uso comercial, pero se mantienen las atribuciones de los datasets de origen (BoolQ CC BY-SA 3.0, ARC CC BY-SA 4.0, SNLI CC BY-SA 4.0) y la licencia del modelo base Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yet-another-ai/Jet-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Paper JET: Justification Evaluation in Transformer: https://arxiv.org/abs/2609.33874
- Repositorio de Jet (incluye directorio de entrenamiento): https://github.com/yet-another-ai/jet
- Directorio de entrenamiento: https://github.com/yet-another-ai/jet/tree/main/training
- Documentacion de Jet: https://jet.yetanother.ai/
- Playground WebGPU: https://huggingface.co/spaces/yet-another-ai/jet-playground
