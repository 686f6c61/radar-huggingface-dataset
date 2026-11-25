# zer0like/gemma-4-31B-it-heretic-oQ6e

## Resumen

`zer0like/gemma-4-31B-it-heretic-oQ6e` es una cuantizacion mixta de precision (formato oQ6e) del modelo `zer0like/gemma-4-31B-it-heretic`, que a su vez es una version "abliterated" (con el mecanismo de rechazo atenuado o eliminado) de `google/gemma-4-31b-it`, creada con la herramienta Heretic v2.1.0 (Trial 196). La publica el usuario zer0like en Hugging Face y esta pensada para su ejecucion en Apple Silicon mediante el framework MLX.

El modelo conserva la arquitectura multimodal original de Gemma 4 (pipeline image-text-to-text), con 31.273.088.876 parametros totales, de los cuales unos 30.704B corresponden al modelo de lenguaje y 0.570B al codificador de vision. La cuantizacion oQ6e aplica precision mixta: un 88,4 % de los pesos en affine 6-bit (grupo 64), un 9,8 % en 8-bit y un 1,8 % en BF16, resultando en una media efectiva de 6,869 bits por peso y un tamano de almacenamiento de aproximadamente 25 GiB (26,9 GB en el repo).

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo de 31B multimodal en hardware de consumo Apple con un peso cercano al de un 6-bit puro pero preservando capas criticas en mayor precision; por otro, hereda el caracter "uncensored" del modelo abliterated, lo que lo hace atractivo para investigacion sobre alineamiento, red-teaming y aplicaciones donde los rechazos del modelo base resultan limitantes, siempre asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4; pesos en formato MLX |
| Parametros totales | 31.273.088.876 (30.704B lenguaje + 0.570B vision) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (mixta: affine 6-bit grupo 64 88,4 %, affine 8-bit grupo 64 9,8 %, BF16 1,8 %); media efectiva 6,869 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); tamano del repo 26,9 GB (25,008 GiB de pesos) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-31b-it`, un transformer multimodal de la familia Gemma 4 con capacidad de procesar imagen y texto. Sobre esa base, zer0like aplico una tecnica de abliteration mediante Heretic v2.1.0 (Trial 196), que modifica los pesos para reducir la propension del modelo a rechazar peticiones. Segun la model card, el resultado reporta 10/100 rechazos medidos con BERTClassifier y una divergencia KL de 0,0684 respecto al modelo original, lo que indica una alteracion relativamente contenida de la distribucion de salidas.

La cuantizacion se realizo con oMLX v0.8.3 en formato oQ6e, una estrategia de precision mixta que asigna 6 bits a la mayoria de las matrices (88,4 % de los pesos), 8 bits a un subconjunto del 9,8 % y mantiene un 1,8 % en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original, mas alla de la denominacion "it" (instruction-tuned) que indica ajuste por instrucciones.

## Capacidades

- Generacion de texto conversacional multi-turno en modo instrucciones.
- Procesamiento de imagen y texto combinados (image-text-to-text), incluyendo descripcion de imagenes y respuesta a preguntas visuales.
- Razonamiento y respuesta a instrucciones heredadas del ajuste "it" de Gemma 4.
- Modo "uncensored": menor tasa de rechazos (10/100 segun la model card), orientado a contenido que el modelo base declinaria.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Ejecucion nativa en Apple Silicon mediante MLX (`mlx-lm`, `mlx-vlm`, oMLX).

## Casos de uso

- Investigacion sobre alineamiento y abliteration: permite comparar el comportamiento del modelo base frente a la version con rechazos atenuados, midiendo tasas de refusal y divergencia KL en distintos prompts.
- Red-teaming y evaluacion de seguridad: util para generar respuestas que un modelo alineado bloquearia y analizar como varian los sesgos y riesgos, en un entorno controlado de laboratorio.
- Procesamiento multimodal en local sobre Mac: analisis de imagenes y documentos escaneados con un modelo de 31B ejecutandose en Apple Silicon gracias a la cuantizacion de ~25 GiB.
- Prototipado de asistentes conversacionales sin conexion: despliegue en un Mac Studio o MacBook Pro de gama alta para demos de chatbot con contexto de imagen y texto, sin depender de APIs externas.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o material editorial donde los rechazos del modelo base interrumpen el flujo, asumiendo revision humana posterior.
- Experimentacion con cuantizacion mixta: caso de estudio para evaluar el impacto de oQ6e (6,869 bits/peso) frente a cuantizaciones uniformes de 4 u 8 bits en calidad de salida y uso de memoria.
- Fine-tuning o adaptacion posterior en MLX: servir como punto de partida para LoRA sobre el modelo abliterated en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del proceso de abliteration (Refusals BERTClassifier: 10/100; KL Divergence: 0,0684) y los datos de cuantizacion (bits efectivos por componente), sin tablas de MMLU, HumanEval, GSM8K ni comparaciones de rendimiento con otros modelos.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 25 GiB solo para los pesos (25,008 GiB); con overhead de contexto y cache KV, se recomienda al menos 32 GB de memoria unificada y preferiblemente 64 GB para contextos largos.
- Hardware objetivo: Apple Silicon (M-series) con MLX; el formato no es directamente compatible con CUDA sin conversion.
- Cabe en consumer hardware Apple: si, en equipos con 32 GB o mas de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, Mac Studio). En equipos de 16 GB no es viable.
- Despliegue: `mlx-lm` y `mlx-vlm` (segun modalidad), oMLX v0.8.3 o superior. No es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-heretic-oQ6e (este) | 31,27B | no disponible | oQ6e (6,869 bits/peso) | gemma | MLX, Apple Silicon |
| zer0like/gemma-4-31B-it-heretic (base) | 31,27B | no disponible | sin cuantizar (BF16) | gemma | Hugging Face |
| google/gemma-4-31b-it (original) | 31B aprox. | no disponible | multiple | gemma | Hugging Face |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que la informacion proporcionada no incluye alternativas de otros autores con datos verificables de rendimiento, contexto o cuantizacion.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": la atenuacion de rechazos implica un mayor riesgo de generar contenido danino, ofensivo o inexacto; no es adecuado para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; la cuantizacion mixta puede introducir degradaciones adicionales no medidas en la model card.
- Idiomas soportados no documentados: no hay garantia de calidad multilingue mas alla de lo que ofrezca el modelo base.
- Longitud de contexto no especificada: no se puede planificar el uso en escenarios de contexto largo sin verificacion empirica.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar.
- Formato MLX: no portable directamente a CUDA, vLLM o llama.cpp; requiere conversion para otros entornos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad tras la cuantizacion ni de la degradacion respecto al modelo BF16.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validacion comunitaria, usar con cautela en entornos criticos.

## Enlaces

- Hugging Face: https://huggingface.co/zer0like/gemma-4-31B-it-heretic-oQ6e
- Modelo base (abliterated): https://huggingface.co/zer0like/gemma-4-31B-it-heretic
- Modelo original de Google: `google/gemma-4-31b-it` (referenciado en la model card; sin URL directa en la informacion proporcionada)
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- oMLX: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
