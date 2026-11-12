# wesjos/Qwen3.5-4B-Arete

## Resumen

Qwen3.5-4B-Arete es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario wesjos. El objetivo declarado no es mejorar el conocimiento ni el razonamiento del modelo base, sino inyectar un estilo de respuesta concreto: conclusion primero, desarrollo por puntos, presentacion equilibrada de posturas enfrentadas y ausencia de formulas evasivas del tipo "como IA no puedo juzgar". Se construye sobre el dataset NousResearch/arete-data-pairs, del proyecto de alineamiento de valores Arete de Nous Research.

El modelo parte de un transformer multimodal de 4,54 mil millones de parametros (incluye una torre de vision de 0,334 B y una cabeza MTP de 0,121 B) con una ventana de contexto entrenada de 4.096 tokens. El ajuste se realizo mediante LoRA de rango 64 sobre las 32 capas del modelo, aplicada a todas las proyecciones lineales, y posteriormente se fusionaron los adaptadores en los pesos base. El resultado se distribuye como pesos completos en bf16 (8,5 GB).

Es relevante ahora porque ilustra una tendencia practica: reutilizar datasets de alineamiento de valores de modelos grandes (la receta replica el enfoque de Arete-27B) para inyectar estilos de respuesta en modelos pequenos que caben en una sola GPU de 24 GB. No obstante, el propio autor documenta limitaciones severas de fiabilidad factica que condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de vision y cabeza MTP; clase `Qwen3_5` en transformers |
| Parametros totales | 4,54 B (incluye 0,334 B de torre de vision y 0,121 B de cabeza MTP) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento (dato mas largo: 3.660, sin truncamiento); contexto maximo del modelo base: no disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; el autor indica que es exportable a GGUF via llama.cpp con `--no-mtp` |
| Idiomas soportados | Ingles (datos de entrenamiento 100 % en ingles); el chino funciona de forma degradada segun el autor |
| Licencia | Apache-2.0 (pesos); terminos del dataset segun su upstream |
| Formato de pesos | safetensors (bf16, 8,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B: un transformer multimodal con torre de vision integrada y una cabeza de prediccion multi-token (MTP), que el ajuste no modifica. El entrenamiento consistio en un SFT con LoRA de rango 64, alpha 128 y dropout 0,05, aplicada a las proyecciones lineales de las 32 capas (`q, k, v, o, out_proj`, `gate, up, down` e `in_proj_qkv, in_proj_z, in_proj_b, in_proj_a`), lo que deja 129,9 M de parametros entrenables (2,78 % del total). Los adaptadores se fusionaron despues en los pesos base.

Los datos proceden de la configuracion `sft_accepted` de NousResearch/arete-data-pairs: 28.886 pares de pregunta-respuesta en ingles sobre siete temas (mercado, gobernanza, ideologia, vigilancia de datos, medio ambiente, libertad de expresion y educacion). El entrenamiento duro 2 epocas, 1.202 pasos con batch global de 48, unos 26,93 M de tokens por epoca, con learning rate 2e-4 con decaimiento coseno hasta 2e-5 y 120 pasos de warmup. El calculo se hizo en bf16 con estados del optimizador en fp32. La receta replica a escala reducida el SFT de parametros completos de Arete-27B, adaptada a una unica GPU de 24 GB mediante LoRA.

## Capacidades

- Generacion de texto conversacional en ingles con estructura marcada: conclusion primero, desarrollo por puntos y tablas.
- Analisis de temas de politica publica, gobernanza, ideologia y debate social con presentacion de posturas enfrentadas.
- Entrada multimodal imagen-texto a nivel de arquitectura (la torre de vision se conserva intacta del modelo base), aunque el ajuste no la entrena ni la evalua.
- Capacidad de seguir la plantilla de chat oficial de Qwen con `enable_thinking=False`; el modo thinking debe desactivarse obligatoriamente.
- Razonamiento multi-paso y tool calling: heredados del modelo base, no evaluados ni reforzados por este ajuste; no disponible su comportamiento especifico.
- Multilingue: limitado en la practica al ingles; el chino degrada segun pruebas del autor.
- No se documentan capacidades de audio ni de agente autonomo especificas de este ajuste.

## Casos de uso

- Generacion de marcos analiticos para politicas publicas: el modelo produce esquemas estructurados con posturas a favor y en contra y sugerencias de fuentes primarias que consultar, util como borrador para analistas que luego verifican los datos.
- Estudio del efecto de datasets de alineamiento de valores en modelos pequenos: sirve como caso reproducible de como un SFT con LoRA r=64 sobre 28.886 pares modifica el estilo de respuesta sin tocar el conocimiento del base.
- Prototipado de asistentes de debate estructurado: para herramientas internas de formacion en argumentacion donde se busca que el modelo exponga ambas caras de un tema y evite formulas evasivas.
- Evaluacion comparativa de estilo: como referencia para medir deriva estilistica (uso de tablas, separadores, longitud) frente al modelo base en pipelines de evaluacion con jueces LLM.
- Investigacion sobre sesgos y neutralidad: util para estudiar como un ajuste de estilo afecta la percepcion de equilibrio en temas politicamente sensibles, comparando las puntuaciones documentadas de balance y ausencia de tono propagandistico.
- Base para experimentos de destilacion de estilo en ingles: el par (modelo base, este ajuste) permite aislar el efecto del SFT en tareas de reescritura con estructura fija, siempre con verificacion factica externa.

## Benchmarks y rendimiento

Resultados publicados por el autor (no verificados de forma independiente):

| Evaluacion | Metrica | Base Qwen3.5-4B | Qwen3.5-4B-Arete | Respuesta del profesor |
|---|---|---|---|---|
| Held-out 350 ejemplos | eval_loss | 1,7401 | 1,3981 | no disponible |
| Held-out 350 ejemplos | Perplejidad | 5,70 | 4,05 | no disponible |
| 35 preguntas, juez 9B (0-4) | overall | 3,48 | 3,65 | 3,75 |
| 35 preguntas, juez 9B (0-4) | accuracy | 3,41 | 3,45 | 3,69 |
| 35 preguntas, juez 9B (0-4) | helpfulness | 3,42 | 3,62 | 3,76 |
| 35 preguntas, juez 9B (0-4) | human_style | 2,40 | 2,77 | 3,12 |
| 10 temas politicos, juez | Balance | 1,39 | 2,46 | no disponible |
| 10 temas politicos, juez | Ausencia de tono propagandistico | 2,06 | 3,04 | no disponible |
| 10 temas politicos, juez | Solidez factica | 3,09 | 3,02 | no disponible |

La caida de perplejidad se mantiene de forma consistente en los siete temas (18,7 %-20,7 %), lo que el autor interpreta como aprendizaje de estructura y no de contenido. No hay resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 9-10 GB solo para pesos, mas cache KV; cabe en GPUs de 16 GB con contexto moderado y holgadamente en 24 GB.
- Cuantizacion: no hay GGUF oficial; el autor indica exportacion via llama.cpp con `--no-mtp`. En Q4 el modelo rondaria los 2,5-3 GB, aunque no se aportan mediciones.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para bf16 sin cuantizar; A100/H100 para servir en lote con mayor contexto.
- Despliegue: transformers con `AutoModelForImageTextToText`; compatible con endpoints. Para llama.cpp es obligatorio pasar `chat_template_kwargs={"enable_thinking": false}` y exportar con `--no-mtp`. Soporte en vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Arete | 4,54 B | 4.096 (entrenamiento) | SFT de estilo y valores sobre Arete | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54 B | no disponible | Modelo multimodal generalista | Apache-2.0 | Hugging Face |
| Arete-27B (Nous Research) | ~27 B (segun model card citada) | no disponible | SFT de parametros completos sobre el mismo dataset | no disponible | Hugging Face |

La comparativa con otros ajustes de valores de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion factica con tono seguro: el autor documenta errores concretos en fechas, leyes y cifras (por ejemplo, fecha de fallecimiento de Deng Xiaoping o contenido atribuido a la Ley de Relaciones con Taiwan). Cualquier dato debe verificarse externamente.
- Verbosidad: la respuesta mediana alcanza 6.608 caracteres, 1,5 veces la del modelo profesor, y cerca de una cuarta parte de las respuestas agotan el limite de generacion.
- Sobretemplating: el 77 % de las respuestas incluyen tablas y el 63 % usan separadores `---`, incluso en preguntas cotidianas.
- Ruido en los datos: el autor senala que aproximadamente el 73 % de las filas de `sft_accepted` conservan la etiqueta `factual_error` y la mediana de precision es 2; filtrar por `accuracy >= 3` deja solo el 39,9 %.
- Idioma: entrenamiento exclusivamente en ingles; el chino produce respuestas desviadas (el autor cita una confusion sobre derechos de la Seguridad Social).
- Seguridad: no rechaza redactar contenido propagandistico politico y puede introducir errores historicos al hacerlo; no es apto para publicaciones que requieran neutralidad acreditada.
- Modo thinking: debe desactivarse siempre; con la plantilla de razonamiento activada el modelo genera cadenas inventadas y desplaza la respuesta a `reasoning_content`.
- Licencia: los pesos son Apache-2.0, pero los terminos del dataset Arete deben respetarse segun su upstream; conviene revisarlos antes de un uso comercial.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta; sin validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.5-4B-Arete
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Proyecto Arete de Nous Research (model card de referencia citada): no disponible como enlace directo en la informacion proporcionada
