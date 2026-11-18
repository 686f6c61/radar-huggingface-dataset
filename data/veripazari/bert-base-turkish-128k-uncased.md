# veripazari/bert-base-turkish-128k-uncased

## Resumen

BERTurk (variante `bert-base-turkish-128k-uncased`) es un modelo de lenguaje enmascarado basado en la arquitectura BERT, desarrollado originalmente por el equipo MDZ Digital Library (dbmdz) de la Biblioteca Estatal de Baviera. Esta ficha corresponde a una re-subida del repositorio original realizada por el usuario `veripazari`, que conserva la licencia MIT, los metadatos y la documentación original. El modelo está entrenado exclusivamente en turco y emplea un vocabulario de 128 000 tokens, lo que reduce la fragmentación de palabras en una lengua aglutinante como el turco.

El modelo resuelve tareas de comprensión del lenguaje (encoder bidireccional): clasificación de texto, etiquetado de secuencias (NER, PoS), extracción de características y ajuste fino supervisado. Con 185 067 010 parámetros, se sitúa en la categoría "base" de BERT y es adecuado para despliegues con recursos moderados. Su relevancia actual radica en ser una de las referencias comunitarias para NLP en turco, con un corpus de preentrenamiento de 35 GB y aproximadamente 4 400 millones de tokens.

La arquitectura es un transformer encoder estándar de 12 capas, sin mecanismos MoE ni atención lineal. No es un modelo generativo: no soporta chat, tool calling ni razonamiento multi-paso. Su valor está en servir de base para ajuste fino en tareas discriminativas en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), bidireccional |
| Parametros totales | 185 067 010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT estándar, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp32; cuantización int8 posible vía herramientas externas) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`pytorch_model.bin`), TensorFlow y JAX según tags del repo |

## Arquitectura y entrenamiento

BERTurk es un transformer encoder de tipo BERT base con 12 capas, atención multi-cabeza bidireccional y objetivo de modelado de lenguaje enmascarado (MLM) más predicción de siguiente frase (NSP). Emplea un vocabulario de 128 000 tokens (frente a los ~32 000 del BERT multilingüe), decisión orientada a mitigar la fragmentación morfológica del turco. El modelo es *uncased* (sin distinción de mayúsculas/minúsculas).

El preentrenamiento se realizó sobre un corpus de 35 GB y 4 404 976 662 tokens, compuesto por una versión filtrada y segmentada por frases del corpus OSCAR en turco, un volcado reciente de Wikipedia, varios corpus OPUS y un corpus adicional proporcionado por Kemal Oflazer. El entrenamiento se ejecutó en una TPU v3-8 de Google (TensorFlow Research Cloud) durante 2 millones de pasos. No se documenta en la model card el uso de RLHF, DPO ni innovaciones como decodificación especulativa (no aplicables a un encoder).

## Capacidades

- Comprensión del lenguaje en turco: clasificación de texto, análisis de sentimiento, detección de temas.
- Etiquetado de secuencias: reconocimiento de entidades nombradas (NER) y etiquetado morfosintáctico (PoS), con resultados publicados en el repositorio `stefan-it/turkish-bert`.
- Extracción de embeddings contextuales para búsqueda semántica y clustering.
- Ajuste fino supervisado para tareas downstream (pregunta-respuesta extractiva, inferencia textual).
- No soporta generación de texto autoregresiva, tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe limitada al turco; no se documenta transferencia a otras lenguas.

## Casos de uso

- **Reconocimiento de entidades nombradas en turco**: ajuste fino sobre el corpus NER turco (proporcionado por Reyyan Yeniterzi) para extraer personas, organizaciones y lugares en noticias o documentos legales, aprovechando el vocabulario de 128k que preserva sufijos turcos.
- **Análisis de sentimiento en reseñas de producto**: clasificación de opiniones en turco en plataformas de e-commerce; el modelo base sirve como extractor de características y se ajusta con una capa de clasificación.
- **Moderación de contenido en foros turcos**: detección de toxicidad y discurso de odio mediante clasificación multietiqueta, con un coste de inferencia bajo al ser un modelo de 185M de parámetros.
- **Búsqueda semántica en documentación interna**: generación de embeddings de frases para un motor de recuperación sobre bases de conocimiento en turco; se recomienda combinar con un índice vectorial.
- **Etiquetado morfosintáctico para pipelines lingüísticos**: uso como componente en herramientas de análisis gramatical o en la construcción de corpus anotados para investigación en lingüística computacional turca.
- **Clasificación de tickets de soporte**: categorización automática de incidencias en centros de ayuda en turco, con ajuste fino sobre datos propios y despliegue en CPU para volúmenes moderados.
- **Filtrado de datos para preentrenamiento**: uso de los embeddings para deduplicación semántica o clasificación de calidad de corpus turcos antes de entrenar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio `stefan-it/turkish-bert` para resultados de PoS tagging y NER, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,75 GB solo para pesos (185M × 4 bytes), más activaciones; en la práctica, 1-2 GB para lotes pequeños.
- VRAM estimada en fp16: aproximadamente 0,4 GB para pesos; en int8, unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es sobradamente pequeño para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` (PyTorch, TensorFlow, JAX), ONNX Runtime, TorchScript, `sentence-transformers` para embeddings, y servidores de inferencia como TGI o vLLM (aunque vLLM está optimizado para decodificación autoregresiva, no para encoders).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera inferencia en CPU en decenas de milisegundos por lote pequeño, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `veripazari/bert-base-turkish-128k-uncased` | 185M | no disponible | Turco | MIT | Hugging Face (re-subida) |
| `dbmdz/bert-base-turkish-128k-uncased` | 185M | no disponible | Turco | MIT | Hugging Face (original) |
| `dbmdz/bert-base-turkish-cased` | ~110M (vocab 32k) | no disponible | Turco | MIT | Hugging Face |
| `dbmdz/bert-base-turkish-uncased` | ~110M (vocab 32k) | no disponible | Turco | MIT | Hugging Face |

La diferencia principal frente a las variantes de vocabulario de 32k es el tamaño del vocabulario (128k), que reduce la longitud de secuencia efectiva en turco y puede mejorar tareas dependientes de morfología. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse sobre OSCAR, Wikipedia y OPUS, puede heredar sesgos de género, etnia y geopolítica presentes en esos corpus; no se documenta ninguna mitigación.
- **Alucinación**: al ser un encoder MLM y no un modelo generativo, no "alucina" en el sentido de generar texto libre, pero puede producir predicciones erróneas o sobreconfiadas en tareas downstream.
- **Contexto e idioma**: solo turco; no se documenta la longitud máxima de contexto (BERT estándar es 512 tokens, pero no se confirma). No apto para otras lenguas sin reentrenamiento.
- **Licencia**: MIT, permite uso comercial y modificación con atribución. La re-subida por `veripazari` conserva la licencia original; conviene verificar la procedencia y el hash de los pesos frente al repositorio original de `dbmdz`.
- **Producción**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un espejo reciente sin validación comunitaria. Para producción, se recomienda usar el repositorio original `dbmdz/bert-base-turkish-128k-uncased` y verificar la integridad de los pesos.
- **Formato**: la model card original solo garantiza pesos compatibles con PyTorch-Transformers; los tags del repo indican también TensorFlow y JAX, pero no se detalla su procedencia.

## Enlaces

- Repositorio re-subido: https://huggingface.co/veripazari/bert-base-turkish-128k-uncased
- Repositorio original: https://huggingface.co/dbmdz/bert-base-turkish-128k-uncased
- Organización dbmdz en Hugging Face: https://huggingface.co/dbmdz
- Repositorio de resultados (PoS, NER): https://github.com/stefan-it/turkish-bert
- Repositorio de issues de los modelos BERT de dbmdz: https://github.com/dbmdz/berts/issues/new
- Corpus OSCAR: https://traces1.inria.fr/oscar/
- Corpus OPUS: http://opus.nlpl.eu/
- Plataforma VeriPazarı: https://veripazari.com.tr
