# voolxanQED/llama2-gene-64k-chat

## Resumen

`llama2-gene-64k-chat` es un modelo de generacion de texto derivado de la familia Llama 2, publicado por el usuario `voolxanQED` en Hugging Face. Su interes no reside en una arquitectura nueva, sino en la tecnica de extension de contexto que aplica: GeNE (Generalized Extrapolation Scale), un metodo presentado en Findings of ACL 2024 por Linhan Li y Zhang Huaping. El modelo parte de un checkpoint Llama 2 de aproximadamente 6.700 millones de parametros (6.738.415.616 exactos segun los pesos en safetensors) y extiende su ventana de contexto hasta 64.000 tokens mediante fine-tuning.

La innovacion de GeNE consiste en escalar de forma aleatoria el ratio de extrapolacion durante el fine-tuning sobre la funcion de interpolacion de los positional embeddings. De este modo, el modelo aprende a extrapolar de manera estable a 64k tokens entrenando unicamente con secuencias de 16k, lo que reduce de forma notable el coste computacional del entrenamiento en contexto largo. El repositorio ocupa 13,5 GB, lo que sugiere pesos en precision de 16 bits.

Se trata de un modelo de nicho, con solo 6 descargas y 0 likes en el momento de la consulta, sin model card detallada mas alla del resumen del paper y sin licencia declarada. Es relevante para quienes investigan tecnicas de extension de contexto (RoPE scaling, interpolacion de embeddings, extrapolacion) y quieren reproducir o comparar el metodo GeNE sobre una base Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con extension de contexto GeNE sobre positional embeddings |
| Parametros totales | 6.738.415.616 (aprox. 6,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64.000 tokens (entrenado con secuencias de 16k y extrapolacion a 64k) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion estandar de Llama (INT8, INT4, FP8, FP4) segun el proveedor de inferencia FriendliAI |
| Idiomas soportados | no disponible (heredados de Llama 2, principalmente ingles, pero no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 13,5 GB); requiere `custom_code` y `trust_remote_code` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tag de inferencia | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 2, con aproximadamente 6,7B parametros. La modificacion respecto al Llama 2 original afecta a los positional embeddings: GeNE actua sobre la funcion de interpolacion escalando aleatoriamente el ratio de extrapolacion durante el fine-tuning, de forma que el modelo generaliza a longitudes mayores que las vistas en entrenamiento. El fine-tuning se realiza con secuencias de 16k tokens y el modelo alcanza extrapolacion estable a 64k.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El sufijo `-chat` sugiere que se parte de un checkpoint conversacional (probablemente Llama 2 Chat), pero la model card no lo confirma ni detalla el proceso de alineamiento. El metodo GeNE esta descrito en el paper "Context Length Extension via Generalized Extrapolation Scale" (Findings of ACL 2024), con repositorio en GitHub, que constituye la referencia tecnica principal.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (sufijo `-chat`).
- Modelado de contexto largo: ventana de hasta 64.000 tokens gracias a la extrapolacion GeNE.
- Razonamiento multi-turno sobre documentos extensos, al mantener contexto muy amplio.
- Compatible con `text-generation-inference` y con endpoints tipo API (tag `endpoints_compatible`).
- Soporte de cuantizacion en plataformas de inferencia gestionada (INT4, INT8, FP8, FP4 segun FriendliAI).
- Capacidades de tool calling, function calling, agentes, vision o audio: no disponibles / no declaradas.
- Capacidades multilingues: no declaradas; se asume el perfil de Llama 2 (predominio del ingles) sin confirmacion.

## Casos de uso

- Investigacion en extension de contexto: reproduccion y comparacion del metodo GeNE frente a otras tecnicas (RoPE scaling, YaRN, LongRoPE) sobre una base Llama 2, usando el checkpoint como referencia empirica de extrapolacion a 64k.
- Analisis de documentos largos: resumen y extraccion de informacion de contratos, informes o articulos que superan ampliamente los 4k tokens tipicos de Llama 2, aprovechando la ventana de 64k.
- Procesamiento de conversaciones extensas: atencion al cliente o asistentes que necesitan recordar historiales multi-turno muy largos sin truncar el contexto.
- Generacion aumentada por recuperacion (RAG) con muchos fragmentos: inyectar decenas de pasajes recuperados en un unico prompt sin perder coherencia, gracias al contexto extendido.
- Analisis de codebases o logs extensos: ingestión de ficheros de codigo o trazas de sistema de gran tamano para tareas de explicacion o deteccion de patrones.
- Evaluacion comparativa de tecnicas de contexto largo: uso como baseline en benchmarks de long-context (perplexity a 64k, needle-in-a-haystack) frente a Llama 2 base y modelos con RoPE scaling.
- Despliegue experimental en plataformas gestionadas: probar el modelo via FriendliAI u otros proveedores compatibles con TGI para medir latencia y throughput con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma cualitativamente que GeNE "mejora notablemente el modelado de lenguaje en contexto largo" y logra extrapolacion estable a 64k entrenando a 16k, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; con contexto de 64k la cache KV crece de forma significativa y puede requerir decenas de GB adicionales segun batch y numero de capas.
- VRAM estimada en INT8: aproximadamente 7 GB de pesos, mas cache KV.
- VRAM estimada en INT4: aproximadamente 3,5-4 GB de pesos, mas cache KV; el cuello de botella en contexto largo sera la cache KV, no los pesos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 64k con batches razonables; RTX 4090 (24 GB) viable en cuantizacion y contextos moderados.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 para contextos cortos y en cuantizacion para contextos mayores; en GPUs de 8-12 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers (requiere `trust_remote_code` por `custom_code`), text-generation-inference (tag declarado), plataformas gestionadas como FriendliAI; compatibilidad con llama.cpp/Ollama no declarada y potencialmente problematica por el codigo personalizado de los embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| llama2-gene-64k-chat | ~6,7B | 64k (via GeNE) | no disponible | Derivado Llama 2 con extension GeNE; requiere custom_code |
| Llama 2 7B Chat (Meta) | ~6,7B | 4k | Llama 2 Community License | Base de referencia; contexto corto |
| Llama 3.1 8B Instruct (Meta) | ~8B | 128k | Llama 3.1 Community License | Contexto nativo largo, ampliamente soportado |
| Mistral 7B Instruct | ~7,2B | 32k | Apache 2.0 | Alternativa abierta con sliding window attention |

La comparativa con Llama 2 7B Chat es la mas directa, ya que comparte base y tamano; la diferencia clave es la ventana de contexto (64k frente a 4k). Frente a Llama 3.1 8B o Mistral 7B, el modelo de `voolxanQED` ofrece contexto comparable pero con menor soporte de ecosistema, licencia incierta y ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para produccion.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad en contexto largo ni en tareas estandar (MMLU, HumanEval, etc.).
- Riesgo de alucinacion inherente a los modelos de ~7B de la generacion Llama 2, agravado por la falta de evaluacion.
- Requiere `trust_remote_code` por el tag `custom_code`, lo que implica ejecutar codigo del autor; revisar antes de desplegar.
- Idiomas no declarados; probable sesgo hacia el ingles heredado de Llama 2.
- Trazabilidad limitada: solo 6 descargas y 0 likes, sin issues ni discusion documentada; modelo de nicho sin validacion comunitaria.
- La extrapolacion a 64k entrenando a 16k puede degradar la calidad mas alla de ciertas longitudes; conviene validar con pruebas propias (needle-in-a-haystack, perplexity).
- El metodo GeNE modifica los positional embeddings; la compatibilidad con herramientas estandar (llama.cpp, Ollama) no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voolxanQED/llama2-gene-64k-chat
- Repositorio GitHub de GeNE: https://github.com/LhLi-QED/GeNE
- Paper en ACL Anthology: https://aclanthology.org/2024.findings-acl.249/
- DOI del paper: https://doi.org/10.18653/v1/2024.findings-acl.249
- Pagina en FriendliAI: https://friendli.ai/models/voolxanQED/llama2-gene-64k-chat
