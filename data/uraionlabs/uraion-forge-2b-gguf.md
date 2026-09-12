# UraionLabs/uraion-forge-2b-gguf

## Resumen

Uraion Forge 2B GGUF es una distribucion cuantizada y optimizada para inferencia en el borde de un modelo base de 2.500 millones de parametros (openbmb/MiniCPM5-2B), publicada por Uraion Labs. El repositorio no contiene pesos en precision completa, sino un catalogo de ficheros GGUF en todos los k-quants estandar (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K) junto con tres variantes de cuantizacion dinamica de Unsloth (dynamic_q4_k_xl, dynamic_q3_k_l y dynamic_q2_k_l). Su objetivo declarado es ejecutar razonamiento cuantitativo y llamadas a herramientas de forma local, en portatiles de consumo, Apple Silicon, dispositivos embebidos Linux y servidores de borde.

El modelo se presenta como un motor especializado en agentes multi-turno con soporte de function calling, con una ventana de contexto nativa de 16.384 tokens ampliable a 131k mediante escalado RoPE. Segun la model card, la cuantizacion dinamica preserva un 90,5 % de fiabilidad en el uso de herramientas, apoyandose en una matriz de importancia (imatrix) que mantiene embeddings y cabeza de salida en Q8_0/FP16, las proyecciones de atencion en Q5_K/Q6_K y las capas MLP en 2 bits.

Su relevancia actual esta en el nicho de modelos sub-3B desplegables sin GPU dedicada: el aviso de espacio de ficheros (repo de 15,5 GB con todas las variantes) y la reivindicacion de una huella inferior a 1 GB en la variante dinamica de 2 bits lo situan como candidato para inferencia soberana y offline. Conviene senalar que el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de sus afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivado de MiniCPM5-2B, denso, sin MoE) |
| Parametros totales | 2.516.756.480 (aprox. 2,5B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens nativos; hasta 131k con escalado RoPE (segun la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K; dinamicas Unsloth: dynamic_q4_k_xl, dynamic_q3_k_l, dynamic_q2_k_l |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3) |
| Tamano del vocabulario | 73.440 tokens |
| Tamano del repositorio | 15,5 GB (incluye todas las variantes) |
| Motor de inferencia | llama.cpp, Ollama, LM Studio, Jan.ai |
| Libreria declarada | gguf |
| Modelo base | openbmb/MiniCPM5-2B |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Llama, segun la propia model card («MiniCPM5-2B / Llama-based architecture»), con 2.516.756.480 parametros totales y un vocabulario de 73.440 tokens. No se trata de un MoE ni de un modelo hibrido con capas SSM: la model card indica que las redes feed-forward (ffn_gate, ffn_up, ffn_down) concentran aproximadamente el 65 % del total de parametros. Se declara soporte de razonamiento multi-turno, function calling y ejecucion en el borde, pero no se detalla la composicion del dataset de entrenamiento ni si hubo fases de RLHF, DPO o SFT.

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en el proceso de cuantizacion. Se emplea la cuantizacion dinamica 2.0 de Unsloth, guiada por una matriz de importancia (imatrix): se ejecuta una pasada de calibracion con un conjunto de datos agentico y cuantitativo sobre el modelo F16, se calcula la covarianza de activaciones H ~ E[XX^T] por tensor y se asignan precisiones heterogeneas. Los embeddings de tokens y la cabeza de salida quedan anclados en Q8_0 o FP16 para evitar la deriva en la distribucion de logits; las proyecciones de atencion (attn_q, attn_k, attn_v, attn_output) se mantienen en Q5_K/Q6_K; y las capas MLP redundantes se comprimen hasta 2-3 bits. El objetivo declarado es evitar el «precipicio de perplejidad» que sufren los modelos sub-3B con cuantizacion uniforme agresiva, que se manifiesta en bucles de tokens, JSON malformado y parametros alucinados en llamadas a funciones. No se especifica el numero de tokens de entrenamiento ni detalles adicionales del pipeline.

## Capacidades

- Generacion de texto en ingles con pipeline text-generation.
- Razonamiento cuantitativo: el repositorio se posiciona explicitamente como motor de «quantitative reasoning».
- Razonamiento multi-turno con preservacion del estado de la conversacion (segun la model card).
- Function calling y tool calling: etiqueta agent y function-calling, con una fiabilidad declarada del 90,5 % en uso de herramientas.
- Ejecucion agentica de multiples pasos en el borde.
- Recuperacion de informacion en contexto largo (needle retrieval) hasta 16.384 tokens, con soporte de RoPE hasta 131k.
- Despliegue local offline sin dependencia de API en la nube.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de atencion al cliente en local: con 16.384 tokens de contexto nativo puede mantener conversaciones multi-turno con historial e informacion de producto, ejecutandose en el propio portatil del operador sin enviar datos a terceros.
- Agente de automatizacion con llamadas a funciones: gracias al soporte declarado de function calling y a la fiabilidad del 90,5 % en herramientas, puede invocar APIs internas (consultas a bases de datos, creacion de tickets, envio de correos) dentro de un bucle agentico.
- Procesamiento de datos estructurados en el borde: extraccion y generacion de JSON en dispositivos Raspberry Pi o servidores embebidos, donde la variante dynamic_q2_k_l con menos de 1 GB de huella permite ejecutar el modelo en hardware muy limitado.
- Asistente de codigo offline en portatiles: integrado via Ollama o llama.cpp, sirve para autocompletado y explicacion de fragmentos en entornos sin conexion o con requisitos de confidencialidad.
- Clasificacion y enrutado de consultas en pipelines RAG: el modelo puede actuar como clasificador o reformulador de consultas antes de un modelo mayor, reduciendo coste de inferencia en produccion.
- Tutor o asistente educativo embebido: razonamiento cuantitativo y matematico en un dispositivo de bajo consumo, con contexto suficiente para mantener el hilo de un ejercicio completo.
- Automatizacion de escritorio en Apple Silicon: despliegue via LM Studio o Jan.ai aprovechando Metal en chips de la serie M, para tareas de resumen y extraccion sobre documentos locales.
- Telemetria y preprocesado en el borde industrial: nodos sin GPU que necesitan generar resumenes o estructurar lecturas de sensores antes de enviarlas a un sistema central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, MT-Bench ni evaluaciones equivalentes, y tampoco ofrece comparaciones numericas con otros modelos. El unico dato de rendimiento declarado es la fiabilidad en uso de herramientas:

| Metrica | Valor | Fuente |
|---|---|---|
| Fiabilidad en tool calling | 90,5 % | Insignia de la model card del autor |
| MMLU | no disponible | - |
| HumanEval | no disponible | - |
| GSM8K | no disponible | - |
| Perplejidad por cuantizacion | no disponible | - |
| Latencia y throughput | no disponible | - |

Los resultados de busqueda web devueltos no contienen informacion relevante sobre este modelo (corresponden a contenido no relacionado), por lo que no ha sido posible contrastar las afirmaciones del autor con fuentes independientes.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (2,5B) y aproximada por variante: F16 ~5,0 GB; Q8_0 ~2,7 GB; Q6_K ~2,1 GB; Q5_K_M ~1,8 GB; Q4_K_M ~1,5 GB; Q3_K_M ~1,3 GB; Q2_K ~1,0 GB; dynamic_q2_k_l por debajo de 1 GB segun la model card. Son estimaciones de peso de pesos, sin contar el cache KV, que crece con el contexto.
- Cache KV: con 16.384 tokens de contexto el consumo adicional es apreciable en F16 y puede resolverse con cuantizacion del cache KV en llama.cpp. No se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para las variantes Q4_K_M y superiores; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para las variantes F16 y Q8_0 con contexto largo; A100/H100 no son necesarias y resultan sobredimensionadas para este tamano.
- Si cabe en GPU de consumo: si. Las variantes Q2_K a Q5_K_M caben en GPUs de 2 a 4 GB de VRAM y tambien en GPUs integradas con memoria compartida.
- Apple Silicon: soporte declarado en chips M1, M2, M3, M4, M5 y M6 mediante Metal, aprovechando la memoria unificada.
- Dispositivos embebidos: la model card menciona Raspberry Pi y Linux embebido como objetivos de despliegue para las variantes de 2-3 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan.ai. El repo incluye la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles. La model card usa el termino «sub-millisecond local execution», pero no aporta mediciones, hardware de referencia ni metodologia, por lo que la cifra no es verificable.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones oficiales ni resultados de benchmarks frente a alternativas. La siguiente tabla recoge la comparacion estructural con modelos de la misma categoria (sub-3B desplegables en el borde); los datos de los modelos de referencia son de conocimiento general y no proceden de la informacion proporcionada, por lo que deben verificarse antes de usarse en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Uraion Forge 2B GGUF | 2,52B | 16k (131k con RoPE) | Apache 2.0 | GGUF | 90,5 % de fiabilidad en tool calling (autor); sin benchmarks publicos |
| openbmb/MiniCPM5-2B (base) | ~2B | no disponible | no disponible en esta informacion | safetensors y otros | no disponible |
| Qwen2.5-3B-Instruct | ~3,1B | 32k | Apache 2.0 (variante 3B) | safetensors, GGUF | no disponible en esta informacion |
| Llama-3.2-3B-Instruct | ~3,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | no disponible en esta informacion |
| Gemma-2-2B | ~2,6B | 8k | Gemma Terms of Use | safetensors, GGUF | no disponible en esta informacion |

Nota: solo la primera fila procede de la informacion facilitada. Las demas se incluyen como referencia de categoria y sus cifras no han sido verificadas en este contexto.

## Limitaciones y advertencias

- Solo soporta ingles (idioma declarado: en). No hay soporte documentado de castellano ni de otros idiomas.
- El repositorio registra 0 descargas y 0 likes: no existe comunidad ni validacion externa, y las afirmaciones de la model card no estan contrastadas.
- No se publican resultados de benchmarks estandar (MMLU, GSM8K, HumanEval), por lo que el rendimiento real en razonamiento y codigo es desconocido.
- La cifra de 90,5 % de fiabilidad en tool calling procede unicamente de una insignia de la model card, sin definicion de la metrica, sin conjunto de evaluacion y sin metodologia reproducible.
- La afirmacion de «sub-millisecond local execution» no especifica hardware, tamano de lote ni longitud de contexto, y es inverosimil para generacion completa de tokens; debe tratarse como marketing, no como medicion.
- Riesgo de alucinacion: es un modelo de 2,5B parametros; en tareas de conocimiento factual y en la generacion de parametros de funciones puede inventar valores, especialmente en las variantes de 2-3 bits.
- El autor advierte de degradacion severa con cuantizacion uniforme agresiva en modelos sub-3B; aunque las variantes dinamicas mitigan el problema, la variante Q2_K no incluye ese tratamiento y es la mas expuesta a bucles de tokens y JSON malformado.
- El uso de contexto ampliado a 131k mediante RoPE es una extension, no un contexto entrenado: la calidad de recuperacion a esa distancia no esta documentada y la model card solo garantiza needle retrieval hasta 16.384 tokens.
- Licencia Apache 2.0 en este repositorio, permisiva para uso comercial, pero se hereda del modelo base openbmb/MiniCPM5-2B: conviene verificar la licencia de dicho modelo base antes de un despliegue comercial.
- La fecha de creacion indicada (2026-09-12) y la nomenclatura de los tags (chips M5 y M6, MiniCPM5) no han podido verificarse con fuentes externas; los resultados de la busqueda web no contenian informacion sobre el modelo.
- En produccion, el estado multi-turno y el formateo de llamadas a herramientas dependen de la plantilla de chat; un uso incorrecto del template degrada notablemente la fiabilidad declarada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UraionLabs/uraion-forge-2b-gguf
- Repositorio del autor en HuggingFace (segun la model card): https://huggingface.co/uraionlabs/uraion-forge-2b-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sitio web de Uraion Labs: https://uraionlabs.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado papers, blogs tecnicos, demos ni resultados de benchmarks adicionales en la busqueda web realizada.
