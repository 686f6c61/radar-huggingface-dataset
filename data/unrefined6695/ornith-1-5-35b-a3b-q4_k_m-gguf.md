# unrefined6695/Ornith-1.5-35B-A3B-Q4_K_M-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token. La arquitectura declarada es `qwen3_5_moe`, con 40 capas que combinan atencion lineal y atencion completa, 256 expertos en total y 8 activos por token. Esta ficha describe la cuantizacion Q4_K_M en formato GGUF publicada por el usuario unrefined6695, que reproduce los pesos originales sin ablacion, fine-tuning ni edicion de pesos de ningun tipo.

La relevancia de esta publicacion concreta reside en su enfoque de preservar el modelo original: frente a otras versiones GGUF del mismo modelo base que han sido sometidas a procesos de ablacion (eliminacion de direcciones de rechazo en el espacio de activaciones), esta cuantizacion mantiene el comportamiento nativo del modelo, que segun el autor responde de forma factual a temas sensibles sin necesidad de modificaciones. El autor sostiene que la ablacion incrementa la fabricacion confiada de datos, mientras que la cuantizacion limpia resulta mas veraz y honesta.

El archivo GGUF ocupa aproximadamente 20,2 GiB, lo que permite ejecutarlo en una unica GPU de 24 GB de VRAM. El autor indica que fue construido y validado en una Tesla P40. La licencia del modelo base y de esta cuantizacion es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (transformer MoE hibrido: atencion lineal + atencion completa), 40 capas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (256 expertos, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); otras cuantizaciones del modelo base no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.5-35B-A3B-BASE-Q4_K_M.gguf`, ~20,2 GiB); pesos originales en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE denominada `qwen3_5_moe`, con 40 capas que alternan mecanismos de atencion lineal y atencion completa. El componente MoE consta de 256 expertos, de los cuales 8 se activan por token, resultando en aproximadamente 3.000 millones de parametros activos sobre un total de 35.500 millones. Esta configuracion busca reducir el coste computacional por token manteniendo la capacidad representacional de un modelo denso de mayor tamano.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La cuantizacion Q4_K_M fue generada con llama.cpp build b11716 (2026-10-17) directamente desde los safetensors bf16, sin modificacion alguna de los pesos. El autor etiqueta el modelo como "uncensored" y "not-abliterated", indicando que el comportamiento sin rechazos proviene de los pesos originales y no de una intervencion posterior.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas factuales.
- Razonamiento explicito: el modelo expone un canal de razonamiento (`reasoning_content`) que requiere asignar un `max_tokens` generoso para evitar respuestas vacias en el canal final.
- Respuesta a temas sensibles (politicos, historicos, medicos, religiosos) de forma directa y documentada, sin rechazos ni evasivas, segun las pruebas del autor.
- Uso de herramientas (tool calling / function calling) en entornos de agente: en la evaluacion del autor, 38 de 38 consultas utilizaron las herramientas disponibles.
- Capacidad de abstenerse ante elementos inexistentes cuando se le proporciona un system prompt adecuado (5 de 5 en las pruebas del autor, frente a 3 de 5 sin prompt).
- Capacidad de verificacion mediante herramientas de consulta externa antes de responder a preguntas factuales inciertas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de investigacion factual: el modelo responde con documentacion y sin evasivas a preguntas historicas, politicas o medicas, lo que lo hace adecuado para entornos donde se requiere informacion directa y se dispone de un system prompt que priorice la precision sobre la complacencia.
- Agente con acceso a herramientas de consulta: en pruebas del autor resolvio 38 de 38 consultas usando herramientas, con 25 de 25 rechazos correctos de elementos inexistentes y 13 de 13 respuestas correctas a elementos reales, con una mediana de unos 8 segundos. Apropiado para pipelines de verificacion documental.
- Despliegue en hardware de gama alta de generacion anterior: al ocupar aproximadamente 20,2 GiB en Q4_K_M, cabe en una unica GPU de 24 GB como la Tesla P40, lo que permite reutilizar infraestructura existente para inferencia local.
- Analisis de documentos con lectura de ficheros: el modelo tiende a usar `bash` (`cat`, `head`) para leer archivos, por lo que encaja en entornos de agente con acceso a shell; para forzar el uso de una herramienta de lectura dedicada debe describirse esta explicitamente con una exclusion del uso de bash.
- Generacion de contenido que requiere cobertura de temas controvertidos sin rechazo: util para redaccion de analisis historicos o politicos donde los modelos alineados de forma agresiva suelen declinar.
- Evaluacion comparativa de cuantizaciones: sirve como referencia "stock" frente a versiones abliteradas del mismo modelo base, permitiendo medir el impacto de la ablacion en la veracidad y la fabricacion de datos.
- Prototipado de agentes multi-paso en local: la combinacion de tool calling, razonamiento explicito y tamano contenido en VRAM permite iterar en una sola GPU sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente evaluaciones locales cualitativas y de conteo, realizadas sobre la cuantizacion Q4_K_M en una Tesla P40:

| Prueba | Resultado |
|---|---|
| Precision en comprobaciones de respuesta conocida (capital, aritmetica, Tratado de Versalles, one-liner en Python, fotosintesis) | 5/5 |
| Abstención ante elementos inexistentes, sin system prompt | 3/5 |
| Abstención ante elementos inexistentes, con system prompt recomendado | 5/5 |
| Uso de herramientas en consultas de agente | 38/38 |
| Rechazo correcto de elementos inexistentes en modo agente | 25/25 |
| Respuestas correctas a elementos reales en modo agente | 13/13 |
| Latencia mediana en modo agente | ~8 s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 20,2 GiB para el archivo Q4_K_M, mas overhead de contexto KV; viable en una GPU de 24 GB.
- GPU validadas por el autor: Tesla P40 (24 GB). No se documentan pruebas en otras GPU en la informacion proporcionada.
- GPU consumer: cabe en tarjetas de 24 GB como la RTX 3090 o RTX 4090, aunque no se confirma su validacion en la informacion disponible.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); otros runners compatibles con GGUF no confirmados en la informacion proporcionada.
- Latencia y throughput: mediana de aproximadamente 8 segundos por consulta en modo agente sobre Tesla P40; no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B Q4_K_M (esta publicacion) | 35,5B | ~3B | no disponible | MIT | GGUF | Cuantizacion stock sin ablacion |
| Otras GGUFs de Ornith en el Hub | 35,5B (base) | ~3B | no disponible | MIT (base) | GGUF | Versiones abliteradas segun el autor; mayor fabricacion confiada |
| Modelos densos de ~30-35B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo de razonamiento: si no se asigna un `max_tokens` suficiente o no se lee el canal `reasoning_content`, la respuesta final puede llegar vacia mientras el modelo sigue razonando.
- Incluso cuando rechaza correctamente un elemento inexistente principal, puede introducir detalles incidentales plausibles pero erroneos en el texto de apoyo; para datos criticos conviene verificar nombres y cifras concretas, preferiblemente con una herramienta de consulta.
- En uso agentico tiende a usar `bash` (`cat`, `head`) para leer archivos en lugar de una herramienta de lectura dedicada; la seleccion de herramientas depende de las descripciones de estas, no del system prompt.
- Sin el system prompt recomendado, la abstención ante elementos inexistentes baja a 3 de 5; el prompt con ejemplos few-shot es parte esencial del comportamiento honesto.
- No se dispone de informacion sobre sesgos, cobertura idiomatica ni longitud de contexto, lo que limita la evaluacion de riesgos en produccion.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en dominios sensibles.
- El modelo esta etiquetado como "uncensored": responde a temas politicos e historicos sensibles sin filtros, lo que puede no ser adecuado para todos los entornos de despliegue y requiere revision de politicas internas.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/unrefined6695/Ornith-1.5-35B-A3B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Referencia citada por el autor sobre fallos de tool calling en agentes: labs.adaline.ai (articulo "AI agent tool-calling failures")
