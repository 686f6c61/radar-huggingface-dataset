# vwdubb/Swift-1.5-Qwen3.8-27b-FP8

## Resumen

Swift-1.5-Qwen3.8-27b-FP8 es una conversión a precisión FP8 del modelo Swift 1.5 Qwen3.8-27B, publicado por el usuario vwdubb en Hugging Face. El modelo original lo desarrolla UkisAI como derivado de razonamiento eficiente de Qwen3.8-27B, el modelo denso multimodal nativo de Alibaba. Esta ficha describe la variante cuantizada, cuyo propósito es reducir el coste de memoria y de cómputo para poder servir un modelo de 27.781.427.952 parámetros en infraestructura con GPU de 40-80 GB de VRAM.

La propuesta de valor de Swift 1.5 es la eficiencia en la generación de tokens de razonamiento: según la model card del modelo base, consume un 58,5 % menos de tokens de pensamiento que Qwen3.8-27B manteniendo (o mejorando ligeramente, +0,35 %) la puntuación agregada, lo que se traduce en una aceleración de 1,95× en varias tareas. El foco del ajuste posterior está en tareas de código, agentes de horizonte largo y uso de terminal, con mejoras declaradas en LiveCodeBench y Terminal Bench 2.1.

Esta variante FP8 usa el formato `compressed-tensors` y safetensors, mantiene el pipeline `image-text-to-text` del modelo base y se distribuye bajo la licencia `swift-open-license-1.0` con acceso restringido (gated). El repositorio tiene 38,5 GB y, en el momento de la consulta, 0 descargas y 0 likes, por lo que se trata de una conversión sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen y video), derivado de Qwen3.8-27B ("native multimodal dense LLM") |
| Parametros totales | 27.781.427.952 (≈27,78 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (formato `compressed-tensors`); el modelo base dispone de GGUF y GSQ-RCO GGUF en repositorios separados de UkisAI |
| Idiomas soportados | No disponibles (la model card no los enumera) |
| Licencia | `swift-open-license-1.0` (identificador `license: other`); repositorio con acceso restringido y seccion de licencia enterprise |
| Formato de pesos | Safetensors con cuantizacion `compressed-tensors` (FP8) |

## Arquitectura y entrenamiento

El modelo base Swift 1.5 Qwen3.8-27B es un derivado de Qwen3.8-27B, descrito por el equipo de Qwen como un LLM denso multimodal nativo con soporte de texto, imagen y video y con la interfaz estándar de la familia Qwen3.8. UkisAI no publica en la informacion disponible el numero de capas, la dimension oculta ni la longitud de contexto, por lo que esos datos quedan como no disponibles. Esta variante concreta no reentrena nada: aplica una cuantizacion FP8 sobre los pesos del modelo de UkisAI mediante el ecosistema `compressed-tensors`, manteniendo el pipeline `image-text-to-text`.

El entrenamiento del modelo original se basa en un ajuste posterior escalado respecto a Swift 1.0, combinando RL y OPD. El enfoque declarado consiste en identificar los tokens asociados a "overthinking" patologico y penalizarlos sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD. Los datos de entrenamiento provienen del dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que no se usa tal cual, sino remuestreado y convertido en entornos de RL. Swift incluye ademas un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. La version 1.5 incrementa el post-entrenamiento respecto a Swift 1.0 con foco en codigo, agentes de horizonte largo y tareas de terminal.

## Capacidades

- Generacion de texto conversacional multturno, con soporte de la interfaz estandar de Qwen3.8.
- Razonamiento con modo de pensamiento optimizado: el modelo base declara un uso de tokens de pensamiento un 58,5 % inferior al de Qwen3.8-27B.
- Capacidades multimodales de entrada: el pipeline declarado es `image-text-to-text` y la documentacion del modelo base menciona soporte de texto, imagen y video.
- Codigo y tareas de programacion de horizonte largo, con mejoras declaradas en LiveCodeBench.
- Tareas agenticas y de terminal, con mejoras declaradas en Terminal Bench 2.1 y entrenamiento sobre un dataset de agentes multiturno.
- Razonamiento de multiples pasos orientado a flujos agénticos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el tag `endpoints_compatible` y el entrenamiento agéntico apuntan a ese uso.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes de programacion en produccion: el modelo puede integrarse en pipelines de generacion y revision de codigo donde la latencia importa, ya que el ahorro de tokens de pensamiento declarado (58,5 %) se traduce en menos tiempo de decodificacion por respuesta.
- Agentes de terminal y automatizacion de operaciones: el ajuste posterior esta orientado a tareas de horizonte largo y a Terminal Bench 2.1, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en varios pasos.
- Generacion de prototipos y demos interactivas: la model card documenta la creacion de un juego 3D con biomas a partir de una sola instruccion en 11,39 minutos, frente a 104,6 minutos del modelo base, un escenario realista para prototipado rapido asistido por IA.
- Analisis de documentos con imagenes: al mantener el pipeline `image-text-to-text`, puede emplearse en extraccion y resumen de informacion a partir de capturas, diagramas o documentos escaneados.
- Atencion al cliente automatizada: modelo conversacional con entrenamiento multiturno, adecuado para dialogos encadenados; la longitud de contexto concreta no esta disponible, por lo que habria que validarla antes de fijar el tamano de las conversaciones.
- Razonamiento asistido en analisis tecnico: tareas de matematicas, logica y depuracion donde se quiere una cadena de razonamiento mas corta sin perder precision, reduciendo el coste por consulta.
- Despliegue en GPU de 40-80 GB: al estar cuantizado en FP8, permite servir un modelo de ~27,8 mil millones de parametros en una sola GPU profesional, algo inviable en BF16 en tarjetas de 40 GB.

## Benchmarks y rendimiento

Los valores numericos por benchmark de la model card no se han podido recuperar en la informacion proporcionada (la tabla aparece truncada). Las cifras agregadas que si se declaran son las siguientes:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento | 58,5 % frente a Qwen3.8-27B |
| Variacion de la puntuacion agregada | +0,35 % frente a Qwen3.8-27B |
| Aceleracion en varias tareas | 1,95× |
| Tiempo de construccion del demo (juego 3D) | 11,39 min (Swift 1.5) frente a 104,6 min (Qwen3.8-27B) |

Segun la nota de prensa de UkisAI sobre la familia Swift, la evaluacion se hizo con pesos BF16 y cinco ejecuciones por modelo sobre nueve benchmarks, tomando las puntuaciones del modelo base de sus propias mediciones. No se dispone de resultados desglosados de MMLU, HumanEval, GSM8K, LiveCodeBench ni Terminal Bench 2.1 en la informacion proporcionada. Tampoco se dispone de ninguna evaluacion especifica de esta conversion FP8, por lo que las cifras anteriores corresponden al modelo BF16 de UkisAI y no a esta cuantizacion.

## Requisitos de hardware

- Peso en memoria de los pesos: aproximadamente 27,8 GB en FP8 (27.781.427.952 parametros a 1 byte). El repositorio ocupa 38,5 GB, probablemente por los artefactos de cuantizacion y ficheros auxiliares.
- VRAM estimada para inferencia: en torno a 30-40 GB considerando pesos FP8 mas cache KV, dependiendo de la longitud de contexto y del batch. La longitud de contexto no esta disponible, por lo que el pico de cache KV no se puede calcular con precision.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (ajustado), L40S 48 GB, RTX 6000 Ada 48 GB, AMD MI300X. Las arquitecturas Hopper y Ada Lovelace tienen soporte nativo de FP8, lo que maximiza el rendimiento; en Ampere puede requerirse kernels especificos de `compressed-tensors`.
- GPU de consumo: no cabe en RTX 4090, RTX 3090 ni RTX 5090 de 24 GB sin offloading a CPU/RAM, que degradaria fuertemente la latencia.
- Opciones de despliegue: transformers (libreria declarada), vLLM, SGLang y TGI. Para llama.cpp u Ollama habria que usar los GGUF publicados por UkisAI, no esta conversion FP8.
- Latencia y throughput: no disponibles. La mejora declarada de 1,95× corresponde al modelo base frente a Qwen3.8-27B, no a esta cuantizacion frente al modelo en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwdubb/Swift-1.5-Qwen3.8-27b-FP8 (este) | 27,78 mil millones | FP8 (`compressed-tensors`) | No disponible | swift-open-license-1.0 | Gated, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,78 mil millones | BF16 | No disponible | swift-open-license-1.0 | Modelo base de esta conversion |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | ~27 mil millones | BF16 | No disponible | No disponible en la informacion proporcionada | Mas de 350.000 descargas declaradas |
| Qwen3.8-27B (Alibaba/Qwen) | ~27 mil millones | BF16 | No disponible | No disponible en la informacion proporcionada | Peso abierto publicado por el equipo de Qwen |
| vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8 | 27,78 mil millones | FP8 | No disponible | Derivada: Swift Open License 1.0 + LoRA Terse-Coder (Apache 2.0) | Variante especializada en codigo |
| vwdubb/Swift-Qwen3.8-27b-FP8 | ~27 mil millones | FP8 | No disponible | swift-open-license-1.0 | Cuantizacion FP8 de Swift 1.0 |

Rendimiento comparado: Swift 1.5 declara usar un 58,5 % menos de tokens de pensamiento y obtener un 0,35 % mas de puntuacion agregada que Qwen3.8-27B. No hay datos publicos en la informacion disponible para comparar contra otros modelos de tamano similar.

## Limitaciones y advertencias

- No hay validacion comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es una cuantizacion de terceros (usuario vwdubb), no una publicacion oficial de UkisAI.
- Las cifras de rendimiento declaradas (58,5 % menos tokens, +0,35 %, 1,95×) corresponden al modelo Swift 1.5 en BF16. La cuantizacion FP8 puede introducir una degradacion adicional de calidad que no esta medida ni documentada.
- Licencia `other` con nombre `swift-open-license-1.0`. La model card enlaza una seccion de licencia enterprise y el repositorio esta marcado como `gated`, por lo que conviene revisar los terminos completos antes de cualquier uso comercial.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad para este modelo.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingue sin validacion previa, especialmente fuera del ingles.
- Longitud de contexto no disponible: impide planificar el consumo de cache KV y limita el diseno de aplicaciones con documentos largos.
- El ajuste posterior esta muy orientado a codigo, agentes y terminal; el comportamiento en otros dominios (legal, medico, creativo) no esta evaluado.
- Sesgos: no se ha publicado informacion sobre composicion del dataset final, filtrado de sesgos ni evaluaciones de seguridad.
- Soporte de tool calling no confirmado explicitamente en la informacion disponible, a pesar del entrenamiento agéntico.
- Repositorio con pesos FP8 en `compressed-tensors`: requiere versiones recientes de transformers o de los motores de inferencia; versiones antiguas pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vwdubb/Swift-1.5-Qwen3.8-27b-FP8
- Modelo base (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base de Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web de UkisAI: https://ukisai.com
- Pagina de producto de Swift: https://ukisai.com/products/swift
- Nota de prensa de Swift: https://ukisai.com/news/introducing-swift
- Demo del juego 3D generado: https://ukisai.com/swift-games/27b
- Variante con LoRA Terse-Coder en FP8: https://huggingface.co/vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder-FP8
- Cuantizacion FP8 de Swift 1.0: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Repositorio de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo Qwen3.8-27B en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha del modelo base en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
