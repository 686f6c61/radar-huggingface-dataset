# voolxanQED/llama2-gene-64k-base

## Resumen

llama2-gene-64k-base es un modelo de generacion de texto derivado de la familia Llama 2, publicado por el usuario voolxanQED en Hugging Face. Su interes principal no reside en el modelo base, sino en la tecnica que incorpora: GeNE (Generalized Extrapolation Scale), un metodo para extender la longitud de contexto de modelos transformer entrenados con ventanas cortas. Segun la model card, GeNE permite entrenar con secuencias de 16k tokens y obtener extrapolacion estable hasta 64k tokens, escalando aleatoriamente el ratio de extrapolacion durante el ajuste fino.

El modelo cuenta con 6.738.546.688 parametros (aproximadamente 6,7 mil millones), lo que lo situa en la categoria de modelos de ~7B, y el repositorio ocupa 13,5 GB en formato safetensors. La arquitectura declarada es Llama con codigo personalizado (custom_code), lo que implica que la carga requiere confiar en implementaciones remotas o revisar el codigo incluido en el repositorio.

La relevancia actual del modelo es fundamentalmente academica y experimental: sirve como implementacion de referencia de la tecnica GeNE descrita en un articulo publicado en Findings of ACL 2024. Su adopcion practica es muy limitada (5 descargas, 0 likes en el momento de la consulta) y la informacion disponible sobre licencia, idiomas y datos de entrenamiento es escasa o inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (custom_code) |
| Parametros totales | 6.738.546.688 (~6,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 64k tokens (entrenado con 16k segun la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el proveedor FriendliAI menciona FP4, FP8, INT4 e INT8 como opciones de su plataforma |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, con aproximadamente 6,7 mil millones de parametros. La innovacion declarada es GeNE (Generalized Extrapolation Scale), que actua sobre la funcion de interpolacion de los positional embeddings para conseguir el patron "entrenar corto, evaluar largo". En lugar de fijar un unico factor de escala, GeNE escala aleatoriamente el ratio de extrapolacion durante el ajuste fino, lo que segun los autores produce extrapolacion estable a 64k tokens partiendo de entrenamiento a 16k.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El modelo se presenta como "base", lo que sugiere que no ha pasado por ajuste de instrucciones. La model card remite al repositorio de GitHub del autor (LhLi-QED/GeNE) y al articulo de ACL 2024 para los detalles metodologicos completos.

## Capacidades

- Generacion de texto autoregresiva en el pipeline text-generation.
- Modelado de lenguaje de contexto largo: la tecnica GeNE esta disenada para mantener calidad hasta 64k tokens.
- Compatibilidad con text-generation-inference y endpoints_compatible, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre extension de contexto: el modelo sirve como referencia reproducible para estudiar el metodo GeNE, comparando su comportamiento en tareas de long-context frente a otros metodos de interpolacion de positional embeddings (NTK, YaRN, PI).
- Procesamiento de documentos largos en laboratorio: con 64k tokens de contexto, puede ingerir articulos cientificos, informes o expedientes completos para tareas de resumen y extraccion, siempre que se valide la calidad real de la extrapolacion en el dominio concreto.
- Analisis de codigo de repositorios: ventanas de 64k permiten cargar varios ficheros fuente en una sola pasada para tareas de explicacion o busqueda semantica, aunque el modelo no esta ajustado para instrucciones.
- Evaluacion comparativa de tecnicas de contexto: util como baseline en experimentos que midan perplejidad o exactitud en tareas como needle-in-a-haystack a distintas longitudes.
- Fine-tuning posterior para dominios especializados: al ser un modelo base de ~7B, es viable ajustarlo con LoRA o full fine-tuning en una unica GPU de 80 GB o en configuraciones multi-GPU consumer para tareas verticales con contexto largo.
- Reproduccion de resultados academicos: permite replicar los experimentos del paper de ACL 2024 sobre extrapolacion de contexto sin depender de pesos no publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma cualitativamente que GeNE "mejora notablemente el modelado de lenguaje de contexto largo" y logra extrapolacion estable a 64k entrenando a 16k, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contextos moderados.
- La cache KV crece linealmente con el contexto: a 64k tokens la memoria adicional puede ser considerable y exige GPUs con 40-80 GB o tecnicas de atencion eficiente.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para contexto completo sin cuantizar; RTX 4090 (24 GB) viable en FP16 con contextos reducidos o cuantizacion.
- Cabe en GPU consumer: si, en modelos como RTX 3090/4090 (24 GB) con cuantizacion o contextos moderados; en GPUs de 16 GB probablemente requiera cuantizacion a 8 bits o inferior.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag oficial), FriendliAI como proveedor gestionado. No se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llama2-gene-64k-base | ~6,7B | 64k (segun model card) | No disponible | Hugging Face, FriendliAI |
| Llama 2 7B (Meta) | ~6,7B | 4k | Licencia Llama 2 | Hugging Face, amplio ecosistema |
| Llama 2 7B con YaRN/NTK | ~6,7B | 32k-128k segun configuracion | Licencia Llama 2 | Implementaciones comunitarias |
| Mistral 7B | ~7,2B | 8k (32k en v0.2) | Apache 2.0 | Hugging Face, amplio ecosistema |

La comparativa se limita a datos publicos de los modelos alternativos; no hay benchmarks del modelo GeNE para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Informacion muy escasa: no se publican datos de licencia, idiomas, dataset de entrenamiento ni evaluacion cuantitativa, lo que impide garantizar su uso comercial o su comportamiento en produccion.
- Modelo base sin alineacion: al tratarse de un modelo "base", no sigue instrucciones de forma fiable y puede generar contenido inapropiado o incoherente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, agravado por la ausencia de evaluaciones publicadas.
- Extrapolacion de contexto no verificada de forma independiente: la afirmacion de 64k estables proviene del autor; conviene validar con pruebas needle-in-a-haystack antes de confiar en contextos largos.
- custom_code: requiere ejecutar codigo remoto del repositorio (trust_remote_code), lo que introduce un riesgo de seguridad que debe revisarse antes de desplegar.
- Adopcion minima: 5 descargas y 0 likes sugieren poca validacion por parte de la comunidad.
- Sin garantias de soporte: el autor no ofrece documentacion de mantenimiento ni issues resueltos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voolxanQED/llama2-gene-64k-base
- Repositorio GitHub del metodo GeNE: https://github.com/LhLi-QED/GeNE
- Paper ACL 2024 (Findings): https://aclanthology.org/2024.findings-acl.249/
- DOI del paper: https://doi.org/10.18653/v1/2024.findings-acl.249
- Pagina del modelo en FriendliAI: https://friendli.ai/models/voolxanQED/llama2-gene-64k-base
