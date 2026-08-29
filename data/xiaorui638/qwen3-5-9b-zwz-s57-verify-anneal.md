# xiaorui638/Qwen3.5-9B-ZwZ-S57-verify-anneal

## Resumen

El modelo `xiaorui638/Qwen3.5-9B-ZwZ-S57-verify-anneal` es un fine-tune del modelo multimodal Qwen3.5-9B de Alibaba, desarrollado por el usuario xiaorui638. Su objetivo principal es mejorar la robustez del modelo ante preguntas con premisas falsas (false-premise), es decir, preguntas que asumen la existencia de elementos que no están presentes en la imagen. El modelo se entrena mediante GRPO (Group Relative Policy Optimization) sobre 57.447 pares de imágenes con preguntas positivas y negativas, donde las negativas contienen premisas falsas y el modelo debe aprender a negar la premisa en lugar de responder directamente.

La innovación clave de este fine-tune es un curriculum de entrenamiento que anula gradualmente el scaffold de verificación (emisión de sub-preguntas `<check>`) durante los pasos 40-80, pasando de una recompensa mixta (precisión + cobertura) a una recompensa puramente basada en el resultado. Esto corrige un sesgo de "sí" observado en el brazo sin anular, mejorando la calibración fuera del dominio. El modelo tiene 9.409.813.744 parámetros y está disponible bajo licencia Apache 2.0, con pesos en formato safetensors.

Este modelo es relevante para aplicaciones de visión por computador y sistemas de pregunta-respuesta visual donde la detección de premisas falsas es crítica, como asistentes de accesibilidad, moderación de contenido o sistemas de QA en entornos controlados. Su enfoque de curriculum y su recompensa basada en cobertura ofrecen una metodología reproducible para mejorar la fiabilidad de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B soporta 262k tokens segun fuentes externas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, con especial fluidez en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B, un transformer multimodal que procesa tanto texto como imagenes. La arquitectura base incluye un codificador visual y un decodificador de lenguaje, con capacidad de razonamiento hibrido (modo rapido y modo de razonamiento extendido). El fine-tune no modifica la arquitectura, sino que ajusta los pesos mediante GRPO.

El entrenamiento utiliza 57.447 pares de premisas falsas (twin pairs) con una proporcion 2:1 entre ejemplos positivos y negativos. La recompensa es `gated_mult = acc * (alpha + (1-alpha) * coverage)`, donde `coverage` mide cuantas sub-preguntas doradas son cubiertas por las preguntas `<check>` emitidas por el propio modelo, evaluadas por un juez LLM. El curriculum reduce `alpha` de 0.5 a 1.0 y el peso del formato de 0.1 a 0 linealmente entre los pasos 40 y 80, de modo que los ultimos ~70 pasos son GRPO puro basado en resultado. Este anulado del scaffold busca evitar que el modelo sobre-ensaye la distribucion de veredictos "sí" (~75%) que degrada la calibracion fuera del dominio.

## Capacidades

- Deteccion de premisas falsas en preguntas sobre imagenes: el modelo identifica cuando una pregunta asume elementos inexistentes y responde negando la premisa en lugar de alucinar una respuesta.
- Razonamiento multimodal: hereda las capacidades del modelo base para comprender y razonar sobre contenido visual y textual.
- Generacion de texto y respuestas conversacionales: mantiene las habilidades de dialogo del modelo base, aunque con un enfoque especifico en robustez ante preguntas engañosas.
- Soporte de tool calling y function calling: disponible en el modelo base, aunque no se ha verificado especificamente en este fine-tune.
- Modo de razonamiento hibrido: el modelo base puede alternar entre respuestas rapidas y cadenas de razonamiento extendidas; este fine-tune conserva esa capacidad.
- Capacidades multilingues: el modelo base soporta multiples idiomas, con especial solidez en chino e ingles; no se ha evaluado el impacto del fine-tune en otros idiomas.

## Casos de uso

- Sistemas de QA visual en entornos criticos: el modelo puede integrarse en aplicaciones de asistencia para personas con discapacidad visual, donde las preguntas de los usuarios pueden contener suposiciones incorrectas sobre la imagen. Su capacidad para negar premisas falsas reduce respuestas erroneas.
- Moderacion de contenido en redes sociales: al analizar imagenes con preguntas generadas automaticamente, el modelo puede detectar cuando una consulta asume contenido que no esta presente, evitando falsos positivos en la clasificacion.
- Chatbots de atencion al cliente con soporte de imagenes: en un escenario donde el usuario envia una foto de un producto y pregunta por caracteristicas que no son visibles, el modelo puede responder indicando que esa informacion no esta disponible en la imagen, mejorando la precision del servicio.
- Evaluacion de modelos multimodales: este fine-tune puede usarse como herramienta de testing para generar preguntas con premisas falsas y evaluar la robustez de otros sistemas de vision por computador.
- Asistentes de documentacion tecnica: en entornos donde se analizan diagramas o esquemas, el modelo puede evitar responder a preguntas que asumen elementos inexistentes, reduciendo la necesidad de supervision humana.
- Investigacion en alucinacion multimodal: el modelo sirve como punto de referencia para estudiar tecnicas de curriculum learning y GRPO en la mitigacion de alucinaciones, dado que su entrenamiento esta documentado y sus resultados son comparables.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos entre el modelo base, el brazo sin anular (verify no anneal) y este modelo (con anneal). Los datos son los siguientes:

| Metrica | Base | Verify (sin anneal) | Este modelo |
|---|---|---|---|
| ZTB-mcq paired (in-domain) | 19.04 | 50.03 | 53.55 |
| DASH-B acc_no | 69.43 | 52.35 | 69.13 |
| DASH-B overall | 68.53 | 77.26 | 82.14 |
| VERVE paired | 66.79 | 79.13 | 81.65 |

El modelo logra el mejor resultado in-domain (53.55 en ZTB-mcq paired) y repara en gran medida el sesgo de "sí" fuera del dominio (DASH-B acc_no pasa de 52.35 a 69.13). Sin embargo, el autor advierte que las capacidades generales estan ligeramente por debajo del brazo de GRPO puro (mcq-mean 70.97 vs 71.68) y que `mme-realworld-lite` tiene una penalizacion persistente de ~4 puntos respecto al base.

## Requisitos de hardware

- VRAM estimada: con 9.409.813.744 parametros, en FP16 se necesitan aproximadamente 18.8 GB de VRAM (el tamano del repo es 18.8 GB). Con cuantizacion a 4 bits, la VRAM requerida se reduce a unos 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10, L4) es suficiente. Para cuantizacion 4-bit, una GPU consumer de 8-12 GB (RTX 3060, RTX 4070) podria ser viable.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion. En FP16, solo GPUs de gama alta con 24 GB o mas.
- Opciones de despliegue: el autor indica que se requiere vLLM >= 0.18 (con `model_type=qwen3_5`). Tambien puede usarse con llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se han proporcionado.
- Latencia y throughput: no disponibles. Dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.4B | 262k | Apache 2.0 | Modelo multimodal general |
| Este fine-tune (verify-anneal) | 9.4B | no disponible | Apache 2.0 | Robustez ante premisas falsas |
| Brazo sin anneal (verify no anneal) | 9.4B | no disponible | Apache 2.0 | Robustez ante premisas falsas sin curriculum |

La comparativa se limita a las variantes del mismo proyecto, ya que no se dispone de datos de otros modelos de tamano similar con el mismo enfoque especifico. Frente al modelo base, este fine-tune mejora significativamente en las metricas de premisas falsas (ZTB-mcq paired: 19.04 a 53.55) y en DASH-B overall (68.53 a 82.14), a costa de una ligera reduccion en capacidades generales. Frente al brazo sin anneal, la principal ventaja es la correccion del sesgo de "sí" fuera del dominio (DASH-B acc_no: 52.35 a 69.13).

## Limitaciones y advertencias

- Entrenado con una sola semilla (single seed), por lo que la reproducibilidad estadistica no esta garantizada.
- El modelo esta especializado en robustez ante premisas falsas in-domain; sus capacidades generales (razonamiento, codigo, etc.) pueden estar ligeramente degradadas respecto al modelo base.
- Existe una penalizacion persistente de ~4 puntos en `mme-realworld-lite` frente al base, lo que sugiere una perdida en tareas de mundo real.
- El rendimiento depende criticamente del prompt de verificacion v2.1 utilizado durante el entrenamiento. Con el prompt por defecto, la metrica in-domain cae a ~42.6, por lo que es imprescindible usar el prompt correcto en produccion.
- No se han publicado resultados de sesgos o alucinaciones fuera del ambito de premisas falsas; el modelo podria presentar sesgos tipicos de los modelos base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento en el dominio especifico antes de desplegar en produccion.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre el rendimiento en otros idiomas distintos de los evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaorui638/Qwen3.5-9B-ZwZ-S57-verify-anneal
- Guia completa de Qwen 3.5 (benchmarks, setup local): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Referencia de Qwen3.5-9B en LLM Reference: https://www.llmreference.com/model/qwen3.5-9b
- Ficha de Qwen3.5 9B en Bitcoin.com AI: https://ai.bitcoin.com/models/text/qwen/qwen3.5-9b
- Ficha de Qwen3.5 9B en ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
