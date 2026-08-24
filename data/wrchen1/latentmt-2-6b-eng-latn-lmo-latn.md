# wrchen1/LatentMT-2.6B-eng-latn-lmo-latn

## Resumen

LatentMT-2.6B-eng-latn-lmo-latn es un adaptador LoRA publicado por Wei-Rui Chen y colaboradores como parte del proyecto LatentMT, presentado en el artículo "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.6 mil millones de parámetros con capacidad de razonamiento latente. Su propósito específico es la traducción automática del inglés (eng_Latn) al lombardo (lmo_Latn), un idioma regional de Italia, utilizando un esquema de razonamiento interno en lugar de cadenas de pensamiento explícitas.

El enfoque LatentMT introduce el uso de LoopLMs (modelos de lenguaje con bucle recurrente) para traducción, donde se invierten pasos recurrentes adicionales dentro de los estados ocultos del modelo, sin generar tokens intermedios visibles. Según el artículo, este método logra un rendimiento comparable a modelos de tres a cinco veces más grandes en 32 direcciones de traducción, con un entrenamiento ligero. Este repositorio concreto contiene únicamente los pesos del adaptador para el par eng_Latn-lmo_Latn, con una profundidad recurrente de 4, y está pensado para fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con razonamiento latente (LoopLM), basado en ByteDance/Ouro-2.6B-Thinking; adaptador LoRA |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se indican cuantizaciones) |
| Idiomas soportados | Ingles (eng_Latn) a lombardo (lmo_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y posiblemente .bin |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B-Thinking es un modelo de lenguaje causal con capacidad de razonamiento latente, es decir, un LoopLM que realiza pasos recurrentes internos en los estados ocultos antes de producir la salida. El adaptador LatentMT se entrena mediante un esquema de entrenamiento ligero (lightweight training) sobre este backbone, ajustando únicamente los parámetros LoRA. La profundidad recurrente configurada para este adaptador es de 4, lo que significa que el modelo ejecuta cuatro pasos de razonamiento interno adicionales por cada token generado, sin exponerlos como tokens de cadena de pensamiento.

El artículo describe que el entrenamiento se realiza sobre 32 direcciones de traducción que abarcan idiomas de alto, medio y bajo recurso. No se especifican en la información disponible los detalles del dataset de entrenamiento (número de tokens, composición, si se usó RLHF o DPO). El adaptador se distribuye con los metadatos necesarios para su carga mediante la librería PEFT, y requiere configurar `total_ut_steps = 4` en la configuración del modelo base.

## Capacidades

- Traduccion automatica del ingles al lombardo (eng_Latn-lmo_Latn) con razonamiento latente, sin generar cadenas de pensamiento visibles.
- Generacion de texto en general, heredada del modelo base Ouro-2.6B-Thinking, aunque el adaptador esta especializado en traduccion.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentacion del adaptador).
- Capacidades de agente y razonamiento multi-paso: el razonamiento latente permite pasos internos, pero no se documenta un uso agente explicito.
- Capacidades multilingues: limitadas al par ingles-lombardo en este adaptador; el proyecto LatentMT cubre 32 direcciones, pero cada adaptador es especifico de un par.
- Capacidades especiales: razonamiento latente (recurrent depth 4) que mejora la calidad de traduccion sin coste adicional en tokens de salida.

## Casos de uso

- Traduccion de contenido editorial al lombardo: el adaptador puede traducir articulos, noticias o textos literarios del ingles al lombardo, un idioma con pocos recursos digitales, aprovechando el razonamiento latente para mantener coherencia contextual.
- Investigacion en traduccion automatica de bajo recurso: sirve como punto de partida para estudiar el impacto del razonamiento latente en pares de idiomas con escasez de datos, comparando con modelos generativos clasicos.
- Prototipado de sistemas de traduccion eficientes: al ser un adaptador LoRA sobre un modelo de 2.6B, puede integrarse en entornos con recursos limitados, ofreciendo una alternativa a modelos mucho mas grandes.
- Evaluacion de tecnicas de razonamiento interno: permite reproducir los experimentos del paper LatentMT y analizar como la profundidad recurrente afecta a la calidad de la traduccion.
- Generacion de subtitulos o doblaje en lombardo: dado que el modelo genera texto directamente, puede usarse para transcribir y traducir dialogos en contextos audiovisuales.
- Educacion y preservacion linguistica: ayuda a generar contenido en lombardo para materiales educativos o digitalizacion de textos, contribuyendo a la vitalidad del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este adaptador (par eng_Latn-lmo_Latn) en la informacion disponible. El articulo de LatentMT menciona que el sistema alcanza un rendimiento comparable a modelos de tres a cinco veces mas grandes en el conjunto de 32 direcciones, pero no se proporcionan metricas numericas desglosadas por par de idiomas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.6B en precision FP16 requiere aproximadamente 5.2 GB de VRAM, mas el adaptador LoRA (muy pequeno, del orden de decenas de MB). Con cuantizacion de 8 bits o 4 bits, la huella se reduce a unos 2.6 GB o 1.3 GB respectivamente, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para mayor velocidad, se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: se puede cargar con transformers y PEFT, tal como se muestra en el codigo de ejemplo. Tambien es compatible con vLLM o TGI si se configura el modelo base con el adaptador, aunque no se documenta explicitamente. Para entornos sin GPU, se puede usar llama.cpp con cuantizacion GGUF, pero el adaptador no se distribuye en ese formato.
- Latencia y throughput: no disponibles. Dependen del hardware y de la profundidad recurrente (4 pasos internos), que anade un coste computacional adicional por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMT-2.6B-eng-latn-lmo-latn (este) | 2.6B + LoRA | No disponible | Razonamiento latente (LoopLM) | Apache 2.0 | HuggingFace |
| LatentMT-2.6B-eng-latn-crh-latn | 2.6B + LoRA | No disponible | Razonamiento latente (LoopLM) | Apache 2.0 | HuggingFace |
| LatentMT-2.6B-eng-latn-bjn-arab | 2.6B + LoRA | No disponible | Razonamiento latente (LoopLM) | Apache 2.0 | HuggingFace |
| Modelos de traduccion clasicos (p.ej. NLLB-200) | 600M-54B | 512-1024 tokens | Transformer encoder-decoder | CC-BY-NC | HuggingFace |

La comparativa se limita a otros adaptadores del mismo proyecto LatentMT, ya que no se dispone de datos de rendimiento para modelos alternativos en el par ingles-lombardo. Los adaptadores comparten la misma base y metodologia, diferenciandose solo en el par de idiomas.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un sistema de produccion validado; puede presentar errores de traduccion, especialmente en contextos especializados o con jerga.
- El par de idiomas ingles-lombardo es de muy bajo recurso; la calidad puede ser inferior a la de pares con mas datos disponibles.
- No se documentan sesgos especificos, pero al derivar de un modelo base general, puede heredar sesgos de genero, etnicos o culturales presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido inventado o inexacto, especialmente en traducciones ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Ouro-2.6B-Thinking tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El adaptador requiere configurar `total_ut_steps = 4` y usar `trust_remote_code=True` para cargar el modelo base, lo que implica ejecutar codigo remoto; se recomienda auditar el codigo antes de usarlo en entornos sensibles.
- No se proporcionan garantias de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-lmo-latn
- Articulo arXiv (PDF): https://arxiv.org/pdf/2607.18618
- Articulo arXiv (HTML): https://arxiv.org/html/2607.18618v1
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Otros adaptadores del proyecto: https://huggingface.co/LatentMT (organizacion)
