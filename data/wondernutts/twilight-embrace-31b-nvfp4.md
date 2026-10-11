# Wondernutts/Twilight-Embrace-31B-NVFP4

## Resumen

Twilight-Embrace-31B-NVFP4 es una conversion cuantizada en NVFP4 del modelo Cyclone-Labs/Twilight-Embrace-31B, publicada por el usuario Wondernutts. Se trata de un checkpoint de generacion de texto orientado a roleplay, narrativa y conversacion, derivado originalmente de google/gemma-4-31B-it y de una fusion de varios modelos de la escena de roleplay (Eon-Blossom-V2-31B, Love-Aligned-31B y Dark-Scarlett-v2.0-31B). El problema que resuelve esta version concreta es el de servir ese modelo con pesos de 4 bits en formato de coma flotante, con el objetivo de reducir el espacio ocupado por los pesos (20,45 GB en shards) manteniendo la compatibilidad con vLLM.

La relevancia tecnica esta en el formato: NVFP4 con escalas FP8 y tamano de grupo 16, empaquetado mediante compressed-tensors, con activaciones de entrada cuantizadas dinamicamente. Es un formato pensado para aceleracion por hardware en GPUs de generacion Blackwell, y su punto fuerte es que se puede servir de forma nativa con kernels FlashInfer/CUTLASS, sin necesidad de descomprimir los pesos a BF16 en memoria.

Conviene senalar dos cuestiones practicas antes de usarlo. Primero, el nombre del repositorio indica 31B, mientras que el recuento de parametros declarado en los safetensors es de 18.460.143.972 parametros; no se especifica en la informacion disponible la razon de esa discrepancia. Segundo, el autor advierte explicitamente de que las comprobaciones realizadas son de compatibilidad de servicio, no de precision: no hay benchmarks publicados ni prueba de equivalencia con el modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de google/gemma-4-31B-it (no se detalla el tipo exacto en la informacion disponible) |
| Parametros totales | 18.460.143.972 segun metadatos de safetensors; el nombre del modelo indica 31B (discrepancia no explicada en la informacion disponible) |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio validada por el autor; maximo nativo del modelo base: no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante), escalas FP8, tamano de grupo 16, activaciones de entrada cuantizadas dinamicamente; KV cache sin cuantizar en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4); no se ofrece GGUF |

## Arquitectura y entrenamiento

El modelo base es una fusion de pesos (merge) construida sobre google/gemma-4-31B-it, combinada con Cyclone-Labs/Eon-Blossom-V2-31B, UnstableLlama/Love-Aligned-31B y ReadyArt/Dark-Scarlett-v2.0-31B mediante un metodo de merge personalizado. La configuracion publicada aplica coeficientes distintos por bloque y por proyeccion: por ejemplo, valores en torno a 0,68-0,73 para q_proj y k_proj, 0,18-0,23 para v_proj, y 0,16-0,20 para gate_proj y up_proj, con variaciones a lo largo de las capas. La model card original hace referencia a modulos de vision y audio y a "routers" entre los componentes excluidos de la cuantizacion, lo que apunta a una arquitectura multimodal con posibles componentes de enrutamiento, pero la informacion disponible no confirma si se trata de un MoE ni detalla el numero de parametros activos.

Sobre el entrenamiento no hay datos en la informacion proporcionada: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo que si se documenta es el proceso de cuantizacion de esta version NVFP4: se uso llmcompressor 0.14.0 con compressed-tensors 0.19.0, Transformers 5.16.1 y PyTorch 2.13.0+cu130, con un observador de pesos denominado `nvfp4_expanded_imatrix` en modo estricto. La calibracion se hizo con 128 muestras sinteticas de roleplay de hasta 2.048 tokens cada una, con un total de 138.503 tokens. Quedaron fuera de la cuantizacion los modulos de vision y audio, los embeddings, los routers y el `lm_head`. El tokenizer y la plantilla de chat del modelo original se incluyen en el repositorio. La conversion no anade ningun ajuste fino nuevo: solo cambia la representacion almacenada de los pesos.

## Capacidades

- Generacion de texto conversacional con enfasis en roleplay y narrativa, segun los tags declarados por el autor (`roleplay`, `storytelling`, `conversational`).
- Modo de pensamiento (thinking mode) activable mediante el kwarg `enable_thinking` de la plantilla de chat; el parser de razonamiento recomendado en vLLM es `gemma4`.
- Salida en JSON y respuestas por streaming: ambas pasaron las comprobaciones de compatibilidad declaradas por el autor.
- Chat multi-turno dentro de la ventana de contexto de 32.768 tokens usada en la validacion.
- Soporte multilingue limitado al ingles (unico idioma declarado).
- Capacidades multimodales (vision y audio) presentes en el modelo base, pero explicitamente no probadas en esta conversion y excluidas de la cuantizacion.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Roleplay conversacional de largo recorrido: el modelo esta ajustado especificamente para este dominio y soporta sesiones multi-turno de hasta 32.768 tokens, lo que permite mantener el historial de una escena extensa sin truncar la personalidad del personaje.
- Generacion de narrativa y ficcion por capitulos: la ventana de contexto larga permite arrastrar tramas, descripciones de personajes y continuidad argumental a lo largo de varias entregas generadas en la misma sesion.
- Asistente de escritura creativa autohospedado: al ser un modelo de pesos abiertos con licencia Apache-2.0, se puede desplegar en infraestructura propia para entornos donde el texto del usuario no debe salir de la organizacion.
- Servicio de chat con salida estructurada: el autor verifico que la generacion de JSON funciona, de modo que se puede usar como backend de una aplicacion que necesite respuestas parseables (por ejemplo, fichas de personaje o resumenes de escena).
- Backend de una interfaz de chat con streaming: la validacion incluyo respuestas transmitidas por streaming, lo que encaja con un frontend tipo chat que muestre tokens a medida que se generan.
- Prototipado de productos conversacionales en ingles sobre GPU Blackwell: al estar empaquetado en NVFP4 y validado con vLLM 0.29.0, sirve como banco de pruebas para medir el coste real de servir un modelo de este tamano en 4 bits nativos.
- Investigacion sobre cuantizacion NVFP4: el repositorio documenta observador, grupo de escalas y conjunto de calibracion, lo que lo convierte en un caso de estudio util para comparar la degradacion frente al checkpoint en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor senala explicitamente que las comprobaciones realizadas (carga en una GPU, chat simple, salida JSON, streaming y modo de pensamiento) establecen compatibilidad de servicio y no constituyen un benchmark de precision ni una prueba de equivalencia con BF16. Tampoco se realizo un benchmark de throughput con cuatro usuarios y contexto completo. Por tanto, no hay cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto que se puedan presentar sin inventarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: los shards de pesos ocupan 20,45 GB; a eso hay que sumar cache KV y espacio de trabajo del runtime, que el autor menciona pero no cuantifica. Como referencia de estimacion no validada, el conjunto no bajaría de unos 24-26 GB de VRAM solo para pesos y overhead inmediato, siempre que la GPU soporte NVFP4 de forma nativa.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell de 96 GB es la unica configuracion validada. Se requiere una GPU con soporte nativo de NVFP4 (generacion Blackwell); no se ha validado en generaciones anteriores.
- Compatibilidad con GPU de consumo: no confirmada. El unico entorno probado es una GPU profesional Blackwell de 96 GB. Cualquier despliegue en GPU de consumo queda sin validar por el autor.
- Opciones de despliegue: vLLM 0.29.0 con `--quantization compressed-tensors`. La libreria declarada del repositorio es vllm. No se documenta soporte para llama.cpp, Ollama, TGI ni otros runtimes.
- Parametros de servicio empleados en la validacion: `--dtype bfloat16`, `--max-model-len 32768`, `--gpu-memory-utilization 0.88`, `--kv-cache-dtype bfloat16`, `--max-num-seqs 4`, `--max-num-batched-tokens 8192`, `--enable-chunked-prefill`, `--enforce-eager`, `--language-model-only`, `--skip-mm-profiling`, `--generation-config vllm`, `--chat-template-content-format string`, `--reasoning-parser gemma4` y `enable_thinking` a `false` por defecto.
- Kernels: el runtime reporto el kernel nativo NVFP4 de FlashInfer/CUTLASS.
- Latencia y throughput estimados: no disponible. No se publicaron mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Wondernutts/Twilight-Embrace-31B-NVFP4 | 18,46B declarados en safetensors (nombre: 31B) | 32.768 tokens validados | NVFP4, grupo 16, escalas FP8 | apache-2.0 | safetensors / compressed-tensors | No disponible |
| Cyclone-Labs/Twilight-Embrace-31B (modelo de origen) | No disponible | No disponible | BF16 u otras, no detallado | apache-2.0 | safetensors | No disponible |
| google/gemma-4-31B-it (base del merge) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | safetensors | No disponible |
| Cyclone-Labs/Eon-Blossom-V2-31B (componente del merge) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |

No hay datos de rendimiento publicados para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y contexto validado. Las comparaciones de calidad frente al checkpoint original en BF16 no se pueden establecer con los datos disponibles.

## Limitaciones y advertencias

- No existe ninguna prueba publicada de equivalencia en calidad entre esta version NVFP4 y el checkpoint original en BF16. El propio autor lo advierte. Cualquier decision de produccion deberia ir precedida de una evaluacion propia en el dominio objetivo.
- La calibracion se hizo con 128 muestras sinteticas de roleplay y 138.503 tokens en total. Es un conjunto pequeno y mono-tematico, lo que puede penalizar el comportamiento fuera del dominio de roleplay y narrativa.
- Solo se declara soporte de ingles. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Los modulos de vision y audio no se probaron y quedaron excluidos de la cuantizacion; el modo multimodal de esta conversion no esta validado.
- Se exige `--language-model-only` y `--skip-mm-profiling` en la configuracion de servicio validada, lo que refuerza que el uso previsto es exclusivamente texto.
- Los prompts de calibracion y la implementacion del observador personalizado no se incluyen en el repositorio, lo que dificulta reproducir exactamente el proceso de cuantizacion.
- La discrepancia entre el nombre del repositorio (31B) y el recuento de parametros de los safetensors (18,46B) no esta explicada en la informacion disponible; conviene verificarla antes de dimensionar infraestructura.
- Requiere hardware con soporte nativo de NVFP4. En GPUs sin ese soporte no hay ruta de despliegue documentada para este repositorio.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto y no cuantificado en la informacion disponible para este checkpoint.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de un merge de modelos de roleplay, el autor no publica ninguna evaluacion de sesgos.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la licencia y las condiciones de los modelos que componen el merge original, ya que la ficha atribuye los derechos a Cyclone-Labs y a los contribuyentes listados en la model card de origen.
- No se ha realizado un benchmark de throughput con multiples usuarios ni con contexto completo; las cifras de capacidad de servicio en produccion no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wondernutts/Twilight-Embrace-31B-NVFP4
- Modelo base: https://huggingface.co/Cyclone-Labs/Twilight-Embrace-31B
- Revision del checkpoint de origen empleada en la conversion: https://huggingface.co/Cyclone-Labs/Twilight-Embrace-31B/tree/97e8fc5e9fe34d851272fdcd92883e1fc66e3f5c
- Model card de origen: https://huggingface.co/Cyclone-Labs/Twilight-Embrace-31B/blob/97e8fc5e9fe34d851272fdcd92883e1fc66e3f5c/README.md
- Modelo base del merge: https://huggingface.co/google/gemma-4-31B-it
- Componente del merge: https://huggingface.co/Cyclone-Labs/Eon-Blossom-V2-31B
- Componente del merge: https://huggingface.co/UnstableLlama/Love-Aligned-31B
- Componente del merge: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
