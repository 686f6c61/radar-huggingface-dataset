# UncleKhris/Fallen1-800M

## Resumen

Fallen1:800M es un modelo de lenguaje causal (decoder-only) desarrollado por el usuario UncleKhris y publicado en HuggingFace bajo el identificador `UncleKhris/Fallen1-800M`. Se trata de un Transformer de arquitectura original entrenado **desde cero** (from scratch), con 817.387.008 parametros, 28 capas, anchura 1536, 16 cabezas de atencion y una ventana de contexto de tan solo 256 tokens. El modelo esta orientado a generacion de texto y a conversacion en ingles, y se distribuye con licencia Apache-2.0.

Su relevancia no reside en el rendimiento, sino en su caracter de experimento abierto: el autor documenta explicitamente que los pesos son nuevos, que el entrenamiento se ha realizado en una unica GPU de Kaggle con reinicios entre sesiones, y que el checkpoint publico es experimental y no garantiza respuestas fluidas. Para desarrolladores e investigadores, resulta util como caso de estudio de entrenamiento de bajo presupuesto, de diseno de tokenizador propio y de arquitecturas decoder-only minimas, mas que como modelo listo para produccion.

El modelo se publica sin evaluacion humana independiente y sin resultados de benchmarks. Su tokenizador es un ByteLevel BPE nuevo de 16.000 identificadores, y el formato de prompt de chat sigue el esquema `<|bos|><|user|>pregunta<|eot|><|assistant|>` con cierre en `<|eot|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only original (causal LM) |
| Parametros totales | 817.387.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 28 |
| Anchura (d_model) | 1536 |
| Cabezas de atencion | 16 |
| FFN | SwiGLU, dimension intermedia 4096 |
| Normalizacion | RMSNorm |
| Posicional | RoPE |
| Embeddings | atados (tied embeddings) |
| Tokenizador | ByteLevel BPE nuevo, 16.000 IDs |
| Formato de prompt | `<|bos|><|user|>pregunta<|eot|><|assistant|>` ... `<|eot|>` |
| Tamano del repositorio | 6,5 GB |
| Fecha de creacion | 2026-10-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de diseno propio, no derivado de ninguna familia conocida (no es Llama, Qwen ni Mistral). Consta de 28 capas con anchura 1536, 16 cabezas de atencion, feed-forward con activacion SwiGLU y dimension intermedia de 4096, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Los embeddings de entrada y de salida estan atados, lo que reduce el recuento de parametros. La etiqueta `fallen1` en HuggingFace indica que se trata de una arquitectura registrada por el propio autor, lo que implica que las herramientas estandar de inferencia pueden no reconocerla sin adaptacion.

El entrenamiento se realizo integramente desde cero, sin inicializacion a partir de otro modelo. Las fuentes de datos declaradas son `HuggingFaceFW/fineweb-edu` para el modelado de lenguaje y `HuggingFaceTB/smol-smoltalk` para la fase conversacional, ambas en ingles. El autor indica que el entrenamiento se ejecuta en una unica GPU de Kaggle y que se reanuda entre sesiones, por lo que el estado de entrenamiento real debe consultarse en el fichero `training_state.json` del repositorio, que contiene la fase actual y el numero de tokens procesados. No se declara el volumen total de tokens de entrenamiento, ni el uso de RLHF, DPO u otra fase de alineacion posterior.

No se documentan innovaciones tecnicas destacables (atencion lineal, decodificacion especulativa, MoE, SSM ni hibridaciones). El interes del modelo es precisamente su caracter minimalista y reproducible con recursos muy limitados.

## Capacidades

- Generacion de texto autoregresiva en ingles, con un limite estricto de 256 tokens de contexto.
- Conversacion multi-turno en formato de chat propietario, usando los tokens especiales `<|bos|>`, `<|user|>`, `<|assistant|>` y `<|eot|>`.
- Modelado de lenguaje general sobre texto en ingles procedente de FineWeb-Edu.
- Ajuste conversacional a partir de Smol-SmolTalk, orientado a intercambios breves de pregunta y respuesta.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay soporte multilingue declarado: solo ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No se declara soporte de rellenado de texto (fill-in-the-middle) ni de tareas especificas de codigo.

## Casos de uso

- Estudio academico de arquitecturas decoder-only minimas: el modelo permite analizar el comportamiento de un Transformer de 817M parametros entrenado desde cero, con una configuracion de capas, cabezas y FFN completamente documentada en la model card.
- Experimentacion con tokenizadores propios: al emplear un ByteLevel BPE nuevo de 16.000 IDs, sirve para evaluar como afecta un vocabulario pequeno a la fluidez y a la eficiencia de codificacion en ingles.
- Banco de pruebas de pipelines de entrenamiento interrumpido: el fichero `training_state.json` y la practica de reiniciar sesiones en una GPU de Kaggle convierten al modelo en un caso util para validar estrategias de checkpointing y reanudacion.
- Generacion de texto de relleno en entornos de prueba: para prototipos de interfaces o tests de integracion donde se necesita un modelo con licencia Apache-2.0 y tamano reducido, sin expectativas de calidad alta.
- Fine-tuning posterior con recursos limitados: al tener menos de 1.000 millones de parametros y licencia permisiva, es viable ajustarlo en una sola GPU consumer para tareas muy acotadas en ingles.
- Comparativa de referencia en investigacion sobre escalado: sirve como punto de comparacion de bajo presupuesto frente a modelos de tamano similar con volumenes de entrenamiento mucho mayores.
- Docencia: ejemplo practico de formato de prompt con tokens especiales y de como un modelo experimental puede repetir o desviarse del tema cuando el contexto es tan corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, y el autor indica explicitamente que no existe evaluacion humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en FP16 y alrededor de 3,3 GB en FP32 para los pesos, calculado a partir de los 817.387.008 parametros. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- El repositorio ocupa 6,5 GB, un tamano superior al de los pesos en FP16, lo que sugiere que puede incluir el checkpoint en mayor precision u otros artefactos de entrenamiento. El desglose exacto no esta disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente para inferencia en FP16, por ejemplo una GTX 1650 de 4 GB o superior, una RTX 3060, una RTX 4090 o una Apple Silicon con memoria unificada. En FP32 se recomienda un minimo de 6 GB.
- Si cabe en GPU consumer: si, es un modelo pequeno por tamano de parametros. La limitacion relevante no es la memoria, sino la ausencia de soporte en herramientas estandar.
- Opciones de despliegue: la model card solo referencia `chat_inference.py` como script de inferencia, que descarga los ficheros del propio repositorio. No se documenta soporte en vLLM, TGI, llama.cpp, Ollama ni LM Studio. Dado que la etiqueta de arquitectura es `fallen1`, es probable que estas herramientas no reconozcan el modelo sin registrar la arquitectura de forma manual; esto no esta confirmado en la informacion disponible.
- No existe publicacion de pesos en GGUF ni de versiones cuantizadas, por lo que el despliegue en llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|---|
| Fallen1-800M | 817.387.008 | 256 tokens | Apache-2.0 | en | no disponible | safetensors en HuggingFace |
| TinyLlama-1.1B | ~1.100 millones | 2.048 tokens | Apache-2.0 | en | si, publicados por el autor | safetensors y GGUF |
| Qwen2.5-0.5B | ~494 millones | 32.768 tokens | Apache-2.0 | multilingue | si, publicados por el autor | safetensors y GGUF |
| SmolLM2-360M | ~362 millones | 8.192 tokens | Apache-2.0 | en y otros | si, publicados por el autor | safetensors y GGUF |

La comparacion se limita a configuracion publica y licencia, ya que no existen evaluaciones head-to-head con Fallen1-800M. Las diferencias mas marcadas son la ventana de contexto (256 tokens frente a miles en los alternativas) y el ecosistema de despliegue, mucho mas maduro en los modelos citados. Los datos de contexto, licencia y disponibilidad de TinyLlama, Qwen2.5 y SmolLM2 corresponden a su documentacion publica; no se incluyen cifras de rendimiento porque no se dispone de una evaluacion comun con Fallen1-800M.

## Limitaciones y advertencias

- Modelo explicitamente experimental: el propio autor advierte de que un checkpoint publico no garantiza respuestas fluidas.
- Riesgo alto de alucinacion, repeticion, respuestas fuera de tema y generacion de contenido inseguro, segun la propia model card.
- No existe evaluacion humana independiente ni benchmarks publicados.
- Contexto de solo 256 tokens, insuficiente para conversaciones largas, resumen de documentos o tareas que requieran memoria extendida.
- Soporte unicamente de ingles; no hay capacidades multilingues declaradas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o representacion. Al entrenarse sobre FineWeb-Edu y Smol-SmolTalk, hereda los sesgos y limitaciones de esos corpus, cuyos terminos de uso deben respetarse.
- Licencia Apache-2.0, permisiva y apta para uso comercial, pero sin garantias de ningun tipo por parte del autor.
- No es una fuente fiable de asesoramiento profesional: el autor lo declara explicitamente.
- Arquitectura propietaria registrada como `fallen1`: la integracion en herramientas de inferencia convencionales puede requerir trabajo adicional.
- El estado real del entrenamiento debe verificarse en `training_state.json`, ya que el proceso se reinicia entre sesiones y puede no haber convergido.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UncleKhris/Fallen1-800M
- Dataset de modelado de lenguaje: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset conversacional: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Script de inferencia: `chat_inference.py` (incluido en el repositorio del modelo)
- Estado de entrenamiento: `training_state.json` (incluido en el repositorio del modelo)
