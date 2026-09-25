# tcclaviger/ThinkingCap-3.8-27B-PARO5

## Resumen

ThinkingCap-3.8-27B-PARO5 es una cuantizacion de precision mixta del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario tcclaviger. El modelo de partida es un fine-tune de eficiencia de Qwen3.8-27B (Qwen Team) orientado a reducir la verbosidad de razonamiento: segun BottleCap AI recorta los tokens de pensamiento un 37% de media (entre el 11% y el 66% segun el benchmark) manteniendo una precision media del 85,8% frente al 86,6% del modelo base.

Esta version concreta no es un reentrenamiento, sino una cuantizacion activation-aware con ParoQuant (arXiv 2511.10645) en int5 para las proyecciones MLP, FP8 en bloques 128x128 para atencion y proyecciones Gated DeltaNet, y BF16 para embeddings, lm_head, normas, convoluciones/puertas GDN y el bloque MTP. El resultado ocupa 25,2 GB y alcanza una perplejidad de 6,8807 en WikiText-2.

Su relevancia es doble: por un lado demuestra que un modelo hibrido de 27B con contexto de 262.144 tokens puede servirse en GPUs AMD RDNA4 (gfx1201) mediante una imagen vLLM especifica; por otro, es un caso practico de cuantizacion por capas con optimizacion de rotaciones, cuyo ajuste fino se ejecuto dentro de la misma imagen que luego sirve el modelo. La validacion de divergencia KL y acuerdo top-1 frente al origen BF16 sigue pendiente segun el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion y Gated DeltaNet (GDN) por capas, mas un bloque MTP (multi-token prediction); 64 capas |
| Parametros totales | 13.520.122.608 segun los metadatos de safetensors; la nomenclatura comercial del modelo base es 27B |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262.144 tokens (valor de `--max-model-len` en la configuracion de referencia del autor) |
| Tipos de cuantizacion | ParoQuant int5 en MLP (gate/up/down, 128 canales por grupo, 8 rotaciones pairwise + escalas de canal, activation-aware, 5,25 bits por peso); FP8 en bloques 128x128 para atencion y GDN; BF16 para embeddings, lm_head, normas, conv/puertas GDN y bloque MTP |
| Idiomas soportados | no disponible (el corpus de calibracion incluye datos multilingues, pero no se publica lista de idiomas) |
| Licencia | Polyform Small Business License 1.0.0 (`license: other`) |
| Formato de pesos | safetensors (bit-planes int5 empaquetados con escalas y zero points en fp16, mas pares de rotacion, angulos y escalas de canal) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer de 64 capas que combina atencion con capas Gated DeltaNet, e incorpora un bloque MTP. El pipeline declarado en HuggingFace es `image-text-to-text`, lo que indica entrada de imagen ademas de texto. Sobre esa base, BottleCap AI aplico el fine-tune ThinkingCap, cuyo objetivo declarado es mantener el rendimiento en tareas dificiles y agenticas reduciendo los tokens de razonamiento (37% de media, con un 39% en recuperacion de contexto largo sin perdida de precision, +2,3pp).

La cuantizacion de tcclaviger sigue el algoritmo de optimizacion por capas en dos etapas de ParoQuant (Alg. A2 del paper arXiv 2511.10645). Primero se cuantizan a FP8 las proyecciones de atencion y GDN de cada capa de forma inline antes de entrenarla, de modo que toda senal de calibracion atraviesa la atencion final. El corpus de calibracion son 850 secuencias de 2.048 tokens extraidas de un corpus de 2 millones de tokens y 26 dominios (codigo, matematicas, razonamiento, herramientas, dialogo, multilingue, libros largos), con 64 secuencias reservadas y disjunto del conjunto de evaluacion KL. Cada proyeccion MLP parte de un ajuste ParoQuant en espacio de pesos y despues se entrena de forma serial capa a capa (64 capas): la etapa 1 entrena angulos de rotacion y escalas de canal, y la etapa 2 entrena pesos, escalas y zero points del cuantizador con redondeo straight-through (AdamW, 10 epocas por etapa, perdida SmoothL1, schedule coseno, mejor epoca por perdida en held-out). La salida de la capa cuantizada se propaga como entrada de la siguiente, de modo que las capas posteriores se calibran contra la ruta cuantizada y no contra BF16.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con parser de razonamiento `qwen3` configurado en el ejemplo de despliegue.
- Razonamiento agentico y multi-paso: la model card del modelo base lo posiciona explicitamente en tareas dificiles y agenticas.
- Tool calling / function calling: soporte con `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`.
- Recuperacion en contexto largo: el modelo base recorta un 39% el razonamiento en esta tarea manteniendo la precision (+2,3pp).
- Generacion de codigo (el parser de herramientas y la composicion del corpus de calibracion incluyen dominios de codigo y herramientas).
- Entrada de imagen: el pipeline declarado es `image-text-to-text`.
- Decodificacion especulativa con un borrador Qwen3.8-27B DFlash (hasta 7 tokens especulativos) sin cambios en el checkpoint.
- Capacidad multilingue: el corpus de calibracion es multilingue, aunque la lista de idiomas soportados no se publica.

## Casos de uso

- Agentes con tool calling en produccion: el checkpoint se sirve con `--enable-auto-tool-choice` y parser `qwen3_coder`, de modo que puede encadenar llamadas a funciones dentro de un servidor vLLM compatible con la API de OpenAI.
- RAG sobre documentacion extensa: la ventana de 262.144 tokens y el buen comportamiento en recuperacion de contexto largo permiten insertar libros tecnicos o expedientes completos sin troceado agresivo.
- Atencion al cliente multi-turno: conversaciones largas con historial completo en contexto, apoyadas en el recorte de tokens de razonamiento para reducir coste por respuesta.
- Generacion de codigo en pipelines de CI/CD: integracion como endpoint compatible con OpenAI para revision de parches, generacion de tests o explicacion de fallos, aprovechando el parser de herramientas.
- Asistente de razonamiento con coste controlado: sustituto directo del modelo base cuando el presupuesto de tokens de salida es la restriccion principal (hasta un 66% menos de tokens de pensamiento en el mejor caso).
- Analisis de documentos con imagenes: al declarar pipeline `image-text-to-text`, puede utilizarse para extraer y razonar sobre informacion contenida en capturas, diagramas o paginas escaneadas.
- Despliegue sobre hardware AMD: escenario de servido en GPUs RDNA4 (R9700) donde no se dispone de aceleradores NVIDIA, usando la imagen vLLM del autor con tensor parallel 4.
- Investigacion en cuantizacion: referencia reproducible para comparar ParoQuant int5/FP8 frente al origen BF16 en perplejidad y, cuando se publiquen, divergencia KL y acuerdo top-1.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Perplejidad WikiText-2 | 6,8807 ± 0,0317 | Medida sobre este checkpoint cuantizado |
| KLD vs origen BF16 | pendiente | El autor no ha publicado el dato |
| Acuerdo top-1 vs origen BF16 | pendiente | Sobre un conjunto congelado de 994 prompts y 27 dominios |
| Precision media (modelo base ThinkingCap) | 85,8% | Frente al 86,6% de Qwen3.8-27B, segun BottleCap AI |
| Reduccion de tokens de razonamiento | 37% de media (11%-66% segun benchmark) | Dato del fine-tune ThinkingCap, no de la cuantizacion |
| Razonamiento en contexto largo | -39% de tokens, +2,3pp de precision | Dato del fine-tune ThinkingCap |

No se han publicado resultados desglosados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta cuantizacion en la informacion disponible.

## Requisitos de hardware

- Configuracion de referencia del autor: 4 x AMD Radeon AI PRO R9700 (gfx1201, RDNA4) con `--tensor-parallel-size 4`, `--gpu-memory-utilization 0.92` y cache KV en FP8. El modelo pesa 25,2 GB, pero la configuracion oficial reparte el servicio entre cuatro GPU.
- Restriccion critica: el checkpoint solo funciona con la imagen `tcclaviger/vllm` sobre GPUs AMD AI PRO R9700. No hay soporte declarado para CUDA, llama.cpp, Ollama, TGI ni GGUF.
- VRAM por GPU: no disponible en la informacion proporcionada. La configuracion completa (tensor parallel 4, contexto 262.144, `--max-num-seqs 8`, `--max-num-batched-tokens 8192`) implica un consumo agregado muy superior al peso de los pesos, dominado por la cache KV.
- Cabe en GPU de consumo: no disponible; el autor no documenta ejecucion en GPU consumer, y la ruta soportada es la GPU profesional AMD R9700.
- Opciones de despliegue: exclusivamente vLLM mediante la imagen Docker del autor, con ROCm y variables de entorno especificas (`VLLM_ROCM_USE_AITER=0`, `GPU_MAX_HW_QUEUES=2`, caches de Triton, vLLM e Inductor).
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de latencia por peticion.
- Se puede activar decodificacion especulativa con un borrador Qwen3.8-27B DFlash (`num_speculative_tokens` 7) para aumentar el throughput en la misma ruta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tcclaviger/ThinkingCap-3.8-27B-PARO5 | 13,52B en safetensors (base comercial 27B) | 262.144 | ParoQuant int5 + FP8 + BF16 | Polyform Small Business 1.0.0 | Solo vLLM sobre AMD R9700 (gfx1201) |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27B (BF16 de origen) | no disponible | BF16 | no disponible en la informacion proporcionada | Estandar para modelos Qwen; no confirmado |
| Qwen/Qwen3.8-27B | 27B | no disponible | BF16 | no disponible en la informacion proporcionada | Modelo base de referencia |
| ThinkingCap-Qwen3.6-27B (generacion anterior) | 27B | no disponible | no disponible | no disponible | Fine-tune previo de la misma serie; segun Better Stack recorta ~46% los tokens de razonamiento sin perdida de precision |

La comparacion con alternativas de otros fabricantes (Llama, Mistral, DeepSeek) no se puede establecer con datos de la informacion disponible, ya que no hay cifras de benchmarks comparables publicadas para esta cuantizacion.

## Limitaciones y advertencias

- Compatibilidad restringida: el checkpoint solo esta probado con la imagen `tcclaviger/vllm` sobre GPUs AMD AI PRO R9700 (gfx1201). No hay ruta documentada para CUDA, llama.cpp, Ollama o TGI, lo que limita seriamente su portabilidad.
- Validacion incompleta: la divergencia KL y el acuerdo top-1 frente al origen BF16 estan marcados como pendientes por el autor. La unica metrica publicada es la perplejidad en WikiText-2.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por terceros.
- Licencia no OSI: Polyform Small Business 1.0.0 permite el uso gratuito solo a empresas que cumplan los umbrales de tamano e ingresos definidos en el propio texto de la licencia; el uso por parte de empresas mayores requiere licencia comercial. Conviene revisar el archivo LICENSE antes de cualquier despliegue.
- Riesgo de alucinacion inherente al modelo base. El fine-tune ThinkingCap reduce tokens de razonamiento, lo que puede recortar pasos de verificacion en tareas sensibles.
- Idiomas soportados no documentados, pese a que el corpus de calibracion es multilingue; el comportamiento fuera del ingles no esta caracterizado.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para este checkpoint ni para el modelo base.
- El recorte de razonamiento del 37% es un promedio con una horquilla muy amplia (11%-66%): en algunos benchmarks la reduccion es marginal, por lo que la ganancia de coste no es uniforme.
- Los pesos int5 empaquetados con rotaciones aplicadas en tiempo de inferencia dependen de kernels fusionados especificos; sin esos kernels el checkpoint no es utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tcclaviger/ThinkingCap-3.8-27B-PARO5
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Qwen3.8-27B (Qwen Team): https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de ParoQuant: https://arxiv.org/abs/2511.10645
- Blog de ThinkingCap Qwen3.8-27B: https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Blog de ThinkingCap Qwen3.6-27B: https://bottlecapai.com/post/thinkingcap-qwen3-6-27b/
- Sitio de BottleCap AI: https://www.bottlecapai.com/
- Imagen Docker de vLLM del autor: https://hub.docker.com/r/tcclaviger/vllm/tags
- Guia de Better Stack sobre ThinkingCap: https://betterstack.com/community/guides/ai/thinkingcap/
- Leaderboard de modelos autoalojados de Onyx: https://onyx.app/self-hosted-llm-leaderboard
- Anuncio en LinkedIn: https://www.linkedin.com/posts/jaroslavbeck_ai-efficiency-opensource-activity-7479901478686683136-cg1J
