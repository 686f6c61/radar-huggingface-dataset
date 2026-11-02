# xeno007/Qwen2.5-7B-Instruct-abliterated-v2

## Resumen

Qwen2.5-7B-Instruct-abliterated-v2 es una variante "abliterated" (sin censura) del modelo Qwen2.5-7B-Instruct desarrollado originalmente por Alibaba Cloud (equipo Qwen). La modificacion consiste en la eliminacion de la direccion de rechazo en el espacio de activaciones del transformer mediante la tecnica de abliteration, un proceso que identifica y resta el vector asociado al comportamiento de negativa para que el modelo responda a practicamente cualquier peticion sin las restricciones de seguridad del modelo original. El repositorio lo publica el usuario xeno007, que a su vez referencia el trabajo de huihui-ai y la tecnica original de FailSpy.

El modelo mantiene la arquitectura transformer decoder-only densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones), contexto nativo de 32.768 tokens (extensible hasta 131.072 mediante YaRN segun la documentacion de la familia base) y soporte para 13 idiomas, incluido el castellano. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque las implicaciones eticas del comportamiento sin censura deben evaluarse por separado.

Su relevancia radica en dos factores: por un lado, ofrece el rendimiento del Qwen2.5-7B-Instruct (uno de los modelos de 7B mas competitivos de su generacion en razonamiento, codigo y multilingue) con total apertura en las respuestas; por otro, sus evaluaciones publicadas muestran que la abliteration apenas degrada el rendimiento en benchmarks como IF_Eval, MMLU Pro, BBH o GPQA, e incluso mejora ligeramente en IF_Eval y GPQA respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con YaRN, segun familia base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos originales en safetensors, probablemente bf16/fp16); cuantizaciones GGUF/AWQ no publicadas por el autor |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion causal estandar, RoPE para codificacion posicional, normalizacion RMSNorm, activacion SwiGLU y sesgo QKV. El modelo original fue entrenado por Alibaba Cloud sobre un corpus multilingue de hasta 18 billones de tokens (dato de la familia Qwen2.5, no especifico de esta variante), con fases de preentrenamiento, ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO). El resultado es un modelo instruct con capacidades de razonamiento, codigo, matematicas y dialogo multilingue.

Sobre esa base, esta variante aplica abliteration: se calculan las direcciones de activacion asociadas a respuestas de rechazo (usando pares de prompts dañinos/inocuos) y se proyectan fuera del espacio de pesos de las capas correspondientes. El resultado es un modelo que conserva la distribucion general del original pero elimina el sesgo de negativa. No hay datos publicados sobre el numero exacto de capas modificadas ni sobre el proceso de calibracion en esta ficha; el autor remite al articulo de mlabonne sobre abliteration y al codigo de FailSpy. No se realizo un reentrenamiento completo, sino una edicion quirurgica de pesos.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Qwen (roles system, user, assistant).
- Razonamiento y resolucion de problemas de nivel medio-alto (benchmarks BBH, GPQA, MMLU Pro).
- Generacion de codigo en multiples lenguajes y explicaciones tecnicas.
- Matematicas y calculo simbolico basico (sin datos especificos de GSM8K en la informacion disponible).
- Capacidades multilingues en 13 idiomas, incluido castellano, portugues, frances, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Respuestas sin censura: el modelo no aplica rechazos por contenido sensible, lo que amplia el rango de peticiones atendidas.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Instruct (segun la documentacion de la familia, no verificado en esta variante concreta).
- Capacidad de seguir instrucciones complejas y formato estructurado (JSON, tablas, listas).
- No dispone de vision ni audio: es un modelo estrictamente de texto.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo permite estudiar como responde un LLM sin capa de rechazo, util para analizar comportamientos emergentes, sesgos y riesgos antes de desplegar sistemas en produccion.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas adultos, violencia o conflictos morales sin las evasivas tipicas de los modelos alineados; adecuado para autores que necesitan respuestas directas.
- Red teaming y evaluacion de robustez: se puede usar como generador de prompts adversarios o como sujeto de pruebas para medir la eficacia de filtros externos, ya que su comportamiento sin censura expone casos limite que otros modelos ocultan.
- Atencion al cliente en dominios regulados o sensibles: en entornos donde el operador ya aplica su propia politica de contenido (salud, legal, financiero), el modelo responde sin rechazos genericos y deja la moderacion a la capa de aplicacion.
- Traduccion y localizacion multilingue: con 13 idiomas y contexto de 32K tokens, puede traducir documentos largos o mantener conversaciones multilingues con coherencia, incluyendo castellano como idioma de origen o destino.
- Prototipado rapido de asistentes conversacionales: al ser un 7B con licencia Apache 2.0 y pesos safetensors, se integra facilmente en pipelines de transformers, vLLM o TGI para demos y pruebas de concepto sin coste de licencia.
- Analisis de documentos y extraccion de informacion: con 32K tokens de contexto puede procesar informes, contratos o articulos largos y extraer datos estructurados, sin las negativas que a veces aparecen en modelos alineados ante contenido sensible.
- Generacion de datos sinteticos para entrenamiento: util para crear datasets de instrucciones o conversaciones en dominios donde los modelos censurados se niegan a generar ejemplos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (media de cada test):

| Benchmark | Qwen2.5-7B-Instruct | Qwen2.5-7B-Instruct-abliterated-v2 | Qwen2.5-7B-Instruct-abliterated |
|---|---|---|---|
| IF_Eval | 76,44 | **77,82** | 76,49 |
| MMLU Pro | **43,12** | 42,03 | 41,71 |
| TruthfulQA | 62,46 | 57,81 | **64,92** |
| BBH | **53,92** | 53,01 | 52,77 |
| GPQA | 31,91 | **32,17** | 31,97 |

La abliteration no degrada de forma significativa el rendimiento general: mejora ligeramente en IF_Eval (+1,38) y GPQA (+0,26), y baja en MMLU Pro (-1,09), BBH (-0,91) y TruthfulQA (-4,65). La caida en TruthfulQA es la mas acusada y coherente con la eliminacion del sesgo de rechazo, que en ese benchmark penaliza respuestas evasivas pero tambien puede reflejar menor calibracion en preguntas de veracidad. No se han publicado resultados de GSM8K, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 18-24 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits (si se genera con GPTQ/AWQ, no publicada por el autor): en torno a 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M, no publicada por el autor): en torno a 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion en precision completa; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB si se cuantiza a 4-8 bits (requiere generar la cuantizacion, no incluida en el repo).
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), text-generation-inference (tag endpoints_compatible), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama (previa conversion a GGUF), SGLang.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Censura | Notas |
|---|---|---|---|---|---|
| xeno007/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6B | 32K (131K con YaRN) | Apache 2.0 | Sin censura | Variante abliterated del Qwen2.5-7B-Instruct |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6B | 32K | Apache 2.0 | Sin censura | Version de referencia de huihui-ai en la que se basa esta ficha |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (131K con YaRN) | Apache 2.0 | Alineado | Modelo base original de Alibaba Cloud |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Alineado | Alternativa de tamano similar con contexto mayor, pero licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | Alineado | Alternativa europea de tamano similar, sin variante abliterated oficial |

## Limitaciones y advertencias

- La eliminacion del sesgo de rechazo implica que el modelo puede generar contenido dañino, ilegal o eticamente problematico sin filtro; no es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- La caida de 4,65 puntos en TruthfulQA sugiere menor fiabilidad en preguntas de veracidad; el riesgo de alucinacion y de afirmaciones incorrectas con tono seguro aumenta respecto al modelo base.
- La abliteration es una edicion de pesos no supervisada por el autor original; no hay garantia de que el comportamiento sea estable en todos los dominios y puede degradarse en tareas de razonamiento complejo con contexto largo.
- Sesgos conocidos del modelo base Qwen2.5 (occidentales y chinos, de genero y culturales) persisten; la abliteration no los corrige y puede amplificarlos al eliminar la autocensura.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin censura puede incumplir normativas sectoriales (por ejemplo, la Ley de Servicios Digitales de la UE o la regulacion de contenidos en plataformas) si no se implementa moderacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 2 de noviembre de 2026; es un artefacto reciente y sin validacion comunitaria, lo que reduce la confianza en su reproducibilidad.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ); el usuario debe generarlas, lo que anade pasos y posibles perdidas de calidad.
- El contexto nativo es de 32K tokens; la extension a 131K requiere YaRN y no esta verificada en esta variante concreta.
- El modelo es solo de texto; no soporta vision, audio ni otras modalidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xeno007/Qwen2.5-7B-Instruct-abliterated-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Version de referencia de huihui-ai: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Version anterior abliterated: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated
- Articulo sobre abliteration de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- Perfil de FailSpy (tecnica original): https://huggingface.co/failspy
- Script de evaluacion del repositorio: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2/blob/main/eval.sh
- Licencia: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2/blob/main/LICENSE
