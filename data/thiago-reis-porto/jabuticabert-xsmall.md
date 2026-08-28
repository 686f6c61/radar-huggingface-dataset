# Thiago-Reis-Porto/JabuticaBERT-XSmall

## Resumen

JabuticaBERT-XSmall es un modelo de tipo encoder basado en la arquitectura DeBERTa-v2, desarrollado por Thiago Porto y colaboradores de la Universidad Federal de Pelotas (Brasil) y Amadeus AI. Forma parte de la colección JabuticaBERT, presentada en el artículo "JabuticaBERT: Modern Portuguese Encoders from Scratch with RTD and Long-Context Training" en la conferencia PROPOR 2026. El modelo está diseñado para representaciones contextuales del portugués, entrenado desde cero con el objetivo de reemplazar a BERTimbau y otros encoders clásicos en tareas de procesamiento del lenguaje natural en portugués.

Con 70,68 millones de parámetros, la variante XSmall es la más pequeña de la familia JabuticaBERT, pensada para entornos con recursos limitados o inferencia de baja latencia. El entrenamiento emplea Replaced Token Detection (RTD), similar a ELECTRA, y técnicas de contexto largo, lo que permite capturar dependencias de mayor alcance que los BERT tradicionales. El modelo se distribuye en formato safetensors y es compatible con la librería transformers de Hugging Face, con pipeline de extracción de características.

La relevancia de este modelo radica en que aborda una carencia de encoders modernos específicos para portugués, ofreciendo una alternativa entrenada desde cero con arquitectura DeBERTa-v2 y técnicas de entrenamiento actualizadas. Su tamaño reducido lo hace accesible para despliegue en CPU y GPU de consumo, aunque la información pública sobre licencia y datos de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer) |
| Parametros totales | 70.682.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paper menciona entrenamiento de contexto largo, sin cifra concreta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (por nombre y paper; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JabuticaBERT-XSmall emplea la arquitectura DeBERTa-v2, que introduce mecanismos de atención desacoplada (disentangled attention) y una capa de posicionamiento mejorada respecto a BERT. El entrenamiento se realiza desde cero (from scratch) sobre corpus en portugués, utilizando el objetivo de Replaced Token Detection (RTD), una técnica inspirada en ELECTRA que consiste en predecir tokens reemplazados por un generador, lo que resulta más eficiente que el enmascaramiento clásico de BERT. Además, el entrenamiento incorpora estrategias de contexto largo, lo que sugiere que el modelo puede manejar secuencias más extensas que los encoders tradicionales, aunque no se especifica la longitud exacta de la ventana de contexto.

No se dispone de información detallada sobre el tamaño del corpus, la composición del dataset, el número de pasos de entrenamiento ni el uso de técnicas de alineación como RLHF o DPO. El artículo asociado (PROPOR 2026) describe el proceso, pero los datos concretos no están disponibles en la información proporcionada.

## Capacidades

- Extraccion de caracteristicas (feature extraction): genera embeddings contextuales para tokens y secuencias, utilizable como base para tareas downstream.
- Representaciones contextuales en portugues: entrenado especificamente para capturar matices semanticos y sintacticos del portugues, incluyendo variantes brasileñas y europeas (no confirmado).
- Compatible con transformers: se integra con la API de Hugging Face para fine-tuning y extraccion de embeddings.
- Soporte de contexto largo: el entrenamiento con tecnicas de contexto largo sugiere mejor manejo de dependencias lejanas que BERT clasico, aunque no se especifica la longitud maxima.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio, al ser un modelo encoder puro.

## Casos de uso

- Clasificacion de textos en portugues: analisis de sentimiento, deteccion de spam o categorizacion de documentos. El modelo puede fine-tuning sobre datasets etiquetados en portugues, aprovechando su arquitectura DeBERTa-v2 para obtener mejores resultados que BERTimbau en tareas de clasificacion.
- Reconocimiento de entidades nombradas (NER): extraccion de personas, organizaciones, lugares y fechas en textos periodisticos o legales en portugues. Su tamaño reducido permite iterar rapidamente en experimentos.
- Respuesta a preguntas extractivas: dado un pasaje en portugues, el modelo puede identificar el fragmento que responde a una pregunta. Adecuado para sistemas de busqueda documental en portugues.
- Similitud semantica de frases: calculo de similitud entre pares de oraciones en portugues para motores de busqueda o sistemas de deduplicacion de contenido.
- Etiquetado de partes de la oracion (POS tagging): anotacion gramatical de textos en portugues, util en pipelines de procesamiento linguistico.
- Embeddings para sistemas de recomendacion: generacion de representaciones de items textuales (descripciones de productos, resenas) en portugues para clustering o busqueda por similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de PROPOR 2026 puede contener evaluaciones comparativas, pero no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 70,68 millones de parametros en precision fp32, el modelo ocupa aproximadamente 283 MB en memoria. En cuantizacion int8, unos 71 MB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPUs con 8 GB de RAM para inferencia en batch pequeno.
- Compatibilidad con GPU de consumo: si, es un modelo pequeno que se ejecuta sin problemas en GPUs de gama media y baja.
- Opciones de despliegue: compatible con la libreria transformers de Hugging Face, por lo que puede servirse con FastAPI, Hugging Face Inference Endpoints, o mediante herramientas como ONNX Runtime si se exporta. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. Dado el tamano, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias cortas, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Modelos comparables en el espacio de encoders para portugues incluyen BERTimbau (base y large), Albertina (PT-PT) y BERTugues, pero no se han encontrado tablas de rendimiento que enfrenten a JabuticaBERT-XSmall con ellos. La arquitectura DeBERTa-v2 y el entrenamiento con RTD sugieren una ventaja potencial sobre BERT clasico, pero sin benchmarks no es posible cuantificarla.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada sobre sesgos. Al ser un modelo entrenado desde cero, puede heredar sesgos presentes en el corpus de entrenamiento, que no se ha descrito.
- Riesgo de alucinacion: al ser un encoder, no genera texto, por lo que el riesgo de alucinacion es nulo en ese sentido. Sin embargo, los embeddings pueden reflejar sesgos del corpus.
- Limitaciones de contexto: aunque se menciona entrenamiento de contexto largo, no se especifica la longitud maxima de secuencia. Los modelos DeBERTa-v2 suelen soportar hasta 512 tokens, pero podria ser mayor.
- Restricciones de licencia: la licencia no esta especificada en la model card. Esto impide su uso comercial sin autorizacion explicita del autor. Se recomienda contactar con el desarrollador antes de utilizarlo en produccion.
- Documentacion incompleta: la model card es una plantilla generica sin informacion sobre datos de entrenamiento, hiperparametros o evaluacion. Esto dificulta la reproducibilidad y la evaluacion de idoneidad para casos de uso concretos.
- Idioma: aunque el nombre y el paper indican portugues, la model card no declara los idiomas soportados. Se asume portugues, pero no hay confirmacion oficial en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thiago-Reis-Porto/JabuticaBERT-XSmall
- Coleccion JabuticaBERT: https://huggingface.co/collections/amadeusai/jabuticabert
- Articulo en ACL Anthology: https://aclanthology.org/2026.propor-1.93/
- PDF del articulo: https://aclanthology.org/2026.propor-1.93.pdf
- Repositorio de la organizacion Amadeus AI: https://huggingface.co/amadeusai/models
- GitHub con survey de LLMs en portugues: https://github.com/Amadeus-AI-Official/pt-br-llms
