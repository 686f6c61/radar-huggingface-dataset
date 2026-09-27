# tadiecool29/Llama-3.2-1B-Amharic-Stance-Sentiment-LoRA-FT

## Resumen

El modelo `tadiecool29/Llama-3.2-1B-Amharic-Stance-Sentiment-LoRA-FT` es un adaptador LoRA (PEFT) entrenado sobre `rasyosef/Llama-3.2-1B-Amharic-Instruct` para una tarea de clasificación multietiqueta en amhárico: detección de postura (stance detection) y análisis de sentimiento. No es un modelo generativo de propósito general, sino un clasificador especializado que reutiliza la torre del transformer de Llama 3.2 1B adaptada al amhárico mediante un vocabulario ampliado con tokens específicos de ese idioma.

El problema que resuelve es la ausencia de herramientas fiables de análisis de opinión en amhárico, un idioma con recursos limitados y con una presencia creciente en redes sociales y medios digitales etíopes. El modelo se ha ajustado sobre el conjunto `tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified`, con selección de checkpoint basada en macro-F1 de validación (media de las F1 de stance y sentimiento), no en la pérdida.

Es relevante por su enfoque multitaréa con un modelo pequeño (la familia Llama 3.2 1B ronda los 1.240 millones de parámetros), lo que permite desplegarlo en hardware modesto. Su adopción es todavía nula (0 descargas y 0 likes en el momento de redactar esta ficha), la licencia no está declarada y los resultados publicados no están verificados, por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) con adaptador LoRA entrenado mediante PEFT para clasificación |
| Parametros totales | Aproximadamente 1.240 millones en el modelo base; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.2 1B soporta 128.000 tokens de contexto |
| Tipos de cuantizacion | No disponible en la model card; como adaptador PEFT hereda las opciones del modelo base (fp16, int8, int4) y admite GGUF tras fusionar el adaptador |
| Idiomas soportados | Amharico (codigo `am`) |
| Licencia | No disponible (la model card la deja como "More Information Needed") |
| Formato de pesos | safetensors (pesos del adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.2 1B. El modelo base elegido, `rasyosef/Llama-3.2-1B-Amharic-Instruct`, procede de la adaptación al amhárico de Llama 3.2 1B: según la documentación pública de esa familia, se añadieron unos 16.000 tokens nuevos en amhárico al tokenizador y se redimensionó la capa de embeddings en consecuencia, seguido de un entrenamiento continuado sobre corpus de texto amhárico. Sobre esa base, el autor entrena un adaptador LoRA para dos cabezas de clasificación (postura y sentimiento). No se especifica en la model card el rango de LoRA, los hiperparámetros, la precisión de entrenamiento ni el número de épocas.

El entrenamiento es de tipo supervisado sobre el dataset `tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified`, con un esquema de selección de checkpoint basado en `macro_f1 = (stance_f1 + sentiment_f1) / 2` calculado sobre validación. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El repositorio pesa 0,0 GB, coherente con un adaptador de bajo rango que no duplica los pesos del modelo base.

## Capacidades

- Clasificación de postura (stance detection) en amhárico sobre textos normalizados.
- Clasificación de sentimiento en amhárico.
- Ejecución multitaréa: ambas tareas se resuelven en una única pasada sobre la misma entrada, según el planteamiento multitaréa descrito por el autor.
- Soporte del idioma amhárico como único idioma declarado (`language: am`).
- Reutilización del tokenizador ampliado del modelo base, lo que mejora la segmentación del amhárico respecto al tokenizador original de Llama 3.2.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito; el pipeline declarado es `text-classification`, no `text-generation`.

## Casos de uso

- Monitorización de opinión en redes sociales etíopes: clasificación masiva de publicaciones en amhárico en posturas a favor, en contra o neutrales respecto a un tema concreto, aprovechando que el modelo está entrenado específicamente para esa tarea.
- Análisis de sentimiento de comentarios de usuarios: procesamiento de feedback en amhárico en plataformas de noticias o foros para obtener una señal agregada de satisfacción por artículo o temática.
- Investigación en ciencias sociales y comunicación política: etiquetado automático de corpus de discurso público en amhárico para estudios de polarización, con la ventaja de ser un modelo abierto y auditable frente a APIs propietarias.
- Anotación asistida de datasets: preetiquetado de grandes volúmenes de texto en amhárico para que anotadores humanos solo revisen y corrijan, reduciendo el coste de construir nuevos corpus etiquetados.
- Moderación de contenido en comunidades digitales: detección de sentimiento negativo intenso o posturas hostiles como primera capa de filtrado, con revisión humana posterior.
- Análisis de reputación de marca en medios amharófonos: seguimiento de la postura y el tono de menciones a una organización en prensa digital y redes, con granularidad por fuente y por fecha.
- Enriquecimiento de pipelines de analítica documental: incorporación de la dimensión de postura o sentimiento a sistemas de búsqueda o de resumen que operan sobre texto en amhárico, siempre que el modelo se use exclusivamente como clasificador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`, es decir, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Stance Accuracy | 0,7218 |
| Stance Macro-F1 | 0,7292 |
| Sentiment Accuracy | 0,7193 |
| Sentiment Macro-F1 | 0,7172 |
| Macro-F1 (media de Stance y Sentiment) | 0,7232 |

Dataset de evaluacion: `tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified`. No se han publicado en la informacion disponible resultados comparativos con otros modelos, ni desglose por subgrupos, ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base completo: en torno a 2,5 GB en fp16 para los ~1.240 millones de parametros, aproximadamente 1,3 GB en int8 y unos 0,8-1,0 GB en int4.
- El adaptador LoRA en si ocupa una fraccion minima de esa cifra (repositorio de 0,0 GB); el consumo viene determinado por el modelo base sobre el que se carga.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs con 4-8 GB de VRAM si se cuantiza el modelo base.
- Tambien es viable la inferencia en CPU para lotes pequenos, dado el tamano reducido del modelo.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, fusion del adaptador y exportacion a GGUF para `llama.cpp` u Ollama (no documentado por el autor, requiere conversion manual), y servidores con soporte de LoRA como vLLM o TGI para clasificacion por lotes.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad, tamano de lote ni hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tadiecool29/Llama-3.2-1B-Amharic-Stance-Sentiment-LoRA-FT | ~1.240 M (base) + adaptador LoRA | No disponible | Clasificacion de postura y sentimiento en amharico | No disponible | HuggingFace, 0 descargas |
| rasyosef/Llama-3.2-1B-Amharic-Instruct | ~1.240 M | No disponible | Modelo instructivo general en amharico (modelo base de este adaptador) | No disponible en la informacion recogida | HuggingFace |
| Meta Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens | Generacion de texto e instrucciones multilingue | Llama 3.2 Community License | HuggingFace, ampliamente disponible |

No se dispone de datos de benchmarks de estos modelos alternativos en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico. Tampoco se han identificado en la busqueda otros clasificadores de postura y sentimiento especificos para amharico con los que establecer una comparacion directa.

## Limitaciones y advertencias

- Resultados no verificados: las cinco metricas declaradas tienen `verified: false`; no hay evaluacion independiente.
- Licencia sin declarar: la model card indica "More Information Needed" en el campo de licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base deriva de Llama 3.2, sujeto a la Llama 3.2 Community License, con las obligaciones que ello implica (atribucion, politica de uso aceptable, etc.).
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad ni issues reportados.
- Documentacion incompleta: no se especifican hiperparametros de entrenamiento, rangos de LoRA, composicion del dataset, procedencia de los datos ni el hardware utilizado.
- Riesgo de sesgo: al entrenarse sobre un corpus de postura y sentimiento en amharico sin documentacion sobre su composicion, puede heredar sesgos de dominio (por ejemplo, tematicas politicas sobrerrepresentadas) y no generalizar a otros registros o dialectos.
- Riesgo de alucinacion: aunque el modelo se usa como clasificador, el adaptador NO convierte al modelo base en un generador fiable; no debe emplearse para generar texto ni como asistente conversacional.
- Limitacion idiomatica: solo se declara el amharico (`am`); no hay evidencia de funcionamiento en otras lenguas etiopes como el oromo o el tigrina, ni en ingles.
- Rendimiento moderado: los valores en torno al 0,72 de accuracy y macro-F1 sugieren margen de mejora; para casos de uso sensibles conviene acompanar la inferencia de revision humana.
- Sin datos de robustez: no se documenta el comportamiento frente a texto ruidoso, abreviaturas de redes sociales, transliteraciones ni mezcla de codigos.

## Enlaces

- [Modelo en HuggingFace: tadiecool29/Llama-3.2-1B-Amharic-Stance-Sentiment-LoRA-FT](https://huggingface.co/tadiecool29/Llama-3.2-1B-Amharic-Stance-Sentiment-LoRA-FT)
- [Dataset: tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified](https://huggingface.co/datasets/tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified)
- [Modelo base: rasyosef/Llama-3.2-1B-Amharic-Instruct](https://huggingface.co/rasyosef/Llama-3.2-1B-Amharic-Instruct)
- [Modelo relacionado del mismo autor: tadiecool29/Llama-3.2-1B-Amharic-MTL-LoRA](https://huggingface.co/tadiecool29/Llama-3.2-1B-Amharic-MTL-LoRA)
- [Modelo amharico de la familia base: rasyosef/Llama-3.2-1B-Amharic](https://huggingface.co/rasyosef/Llama-3.2-1B-Amharic)
- [Repositorio GitHub del proyecto amharico de Llama 3.2: rasyosef/llama-3.2-amharic](https://github.com/rasyosef/llama-3.2-amharic)
- [Endpoint de inferencia de terceros para el modelo base: FriendliAI](https://friendli.ai/models/rasyosef/Llama-3.2-1B-Amharic)
- [Referencia arXiv 1910.09700 (Lacoste et al., 2019), citada en la plantilla de la model card para el calculo de impacto ambiental](https://arxiv.org/abs/1910.09700)
