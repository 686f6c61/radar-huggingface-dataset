# veripazari/bert-base-turkish-cased

## Resumen

BERTurk es un modelo BERT base para turco, desarrollado originalmente por el equipo MDZ Digital Library (dbmdz) de la Biblioteca Estatal de Baviera. El repositorio analizado (`veripazari/bert-base-turkish-cased`) es un espejo archivado por la plataforma turca VeriPazarı que preserva la documentación, metadatos y licencia originales, sin modificaciones aparentes sobre los pesos. Se trata de un encoder transformer de tipo BERT con 111.243.010 parámetros, entrenado sobre un corpus de 35 GB y 44.049.766.662 tokens en turco.

El modelo resuelve tareas de comprensión del lenguaje (NLU) en turco: clasificación de texto, etiquetado de secuencias (NER, PoS), question answering extractivo y representaciones de frases para búsqueda semántica. No es un modelo generativo ni dispone de interfaz de chat: es un encoder bidireccional que produce embeddings contextuales y debe adaptarse mediante fine-tuning o cabezas de clasificación para cada tarea.

Su relevancia actual reside en que sigue siendo una base de referencia para NLP en turco, un idioma con recursos limitados en comparación con el inglés, y en que el espejo facilita el acceso desde la infraestructura de Hugging Face con licencia MIT. La arquitectura es BERT base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), con tokenizador WordPiece cased.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 111.243.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estandar BERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors y PyTorch; cuantizacion no documentada) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin); tambien anunciado soporte TF y JAX en los tags del repositorio |

## Arquitectura y entrenamiento

BERTurk sigue la arquitectura BERT base: 12 capas de transformer encoder, 768 dimensiones ocultas, 12 cabezas de atencion y aproximadamente 111 millones de parametros. El tokenizador es WordPiece con distincion de mayusculas y minusculas (cased), lo que resulta relevante en turco por el comportamiento de las letras İ/i y I/ı. El objetivo de preentrenamiento es el enmascaramiento de tokens (masked language modeling) propio de BERT.

El corpus de entrenamiento combina una version filtrada y segmentada por frases del corpus OSCAR en turco, un volcado reciente de Wikipedia, diversos corpus OPUS y un corpus adicional proporcionado por Kemal Oflazer. El total asciende a 35 GB y 44.049.766.662 tokens. El entrenamiento se realizo durante 2 millones de pasos sobre un TPU v3-8 cedido por el programa TensorFlow Research Cloud de Google. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un encoder NLU.

## Capacidades

- Generacion de representaciones contextuales de tokens y de frases para tareas downstream.
- Clasificacion de texto: analisis de sentimiento, deteccion de temas, moderacion de contenido en turco.
- Etiquetado de secuencias: reconocimiento de entidades nombradas (NER) y etiquetado morfosintactico (PoS), con resultados publicados en el repositorio `stefan-it/turkish-bert`.
- Question answering extractivo mediante fine-tuning con cabecera de span prediction.
- Similitud semantica y recuperacion de informacion mediante embeddings de frases (requiere pooling y, opcionalmente, fine-tuning con Sentence-Transformers).
- No soporta tool calling ni function calling: es un encoder, no un modelo instruido.
- No dispone de modo de razonamiento, vision ni audio.
- Capacidad multilingue limitada al turco; no se documenta transferencia a otros idiomas.

## Casos de uso

- Clasificacion de tickets de soporte en turco: fine-tuning de una cabeza de clasificacion sobre las representaciones del encoder para enrutar incidencias por categoria con un contexto de hasta 512 tokens, suficiente para la mayoria de mensajes de usuario.
- Extraccion de entidades en documentos legales o financieros turcos: adaptacion para NER sobre contratos y facturas, aprovechando el tokenizador cased para preservar nombres propios y siglas.
- Busqueda semantica en catalogo de productos: generacion de embeddings de descripciones y consultas para recuperacion por similitud coseno, con indexacion en FAISS o similar.
- Moderacion de comentarios en plataformas turcas: clasificador binario o multietiqueta de toxicidad y spam entrenado sobre el encoder congelado o con fine-tuning parcial.
- Analisis de sentimiento en redes sociales: ajuste sobre tuits y resenas, donde el preentrenamiento en OSCAR aporta vocabulario informal y coloquial.
- Question answering sobre base de conocimiento: sistema extractivo que localiza la respuesta en un parrafo de documentacion turca, util en asistentes internos de empresa.
- Etiquetado morfosintactico para pipelines de linguistica computacional: analisis gramatical y lematizacion asistida en herramientas de procesamiento del turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio `stefan-it/turkish-bert` para resultados de PoS y NER, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 450 MB para los pesos (111 M de parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en FP16: alrededor de 225 MB para pesos, con pico total por debajo de 1,5 GB segun longitud de secuencia y tamano de lote.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequenos.
- GPU recomendadas para fine-tuning: RTX 3090/4090 para experimentacion; A100 o H100 para entrenamiento a gran escala o barridos de hiperparametros.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (TEI), ONNX Runtime, TorchScript, y exportacion a GGUF para llama.cpp en caso de querer inferencia en CPU (no documentado oficialmente).
- Latencia y throughput: no disponibles en la informacion proporcionada; en una GPU moderna se espera procesamiento de cientos a miles de secuencias cortas por segundo, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/bert-base-turkish-cased (espejo de dbmdz/bert-base-turkish-cased) | 111 M | 512 | Turco | MIT | Hugging Face (espejo) |
| dbmdz/bert-base-turkish-uncased | 110 M aprox. | 512 | Turco | MIT | Hugging Face (original) |
| dbmdz/electra-base-turkish-cased-discriminator | 110 M aprox. | 512 | Turco | MIT | Hugging Face |
| xlm-roberta-base | 278 M | 512 | 100 idiomas | MIT | Hugging Face |

El espejo es funcionalmente equivalente al original de dbmdz; la diferencia practica es la trazabilidad y el mantenimiento. Frente a XLM-RoBERTa base, BERTurk es mas pequeno y rapido, pero carece de cobertura multilingue. Frente a ELECTRA turco, BERTurk suele quedar ligeramente por detras en eficiencia de preentrenamiento, aunque ambos son comparables en tareas NLU. No se dispone de cifras de benchmark en la informacion proporcionada para cuantificar la diferencia.

## Limitaciones y advertencias

- Es un encoder NLU, no un modelo generativo: no puede usarse para chat, generacion de texto libre ni instrucciones sin cabeceras adicionales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los clasificadores ajustados pueden producir predicciones erroneas con alta confianza en dominios fuera de distribucion.
- Sesgos inheridos del corpus OSCAR y Wikipedia: posible infrarrepresentacion de variedades dialectales, jerga regional y contenido de comunidades minoritarias.
- Ventana de contexto de 512 tokens (estandar BERT), insuficiente para documentos largos sin truncado o segmentacion.
- El tokenizador cased puede comportarse de forma distinta con texto en minusculas o sin normalizacion; conviene validar el preprocesado en produccion.
- Licencia MIT permite uso comercial, pero el espejo no anade garantias sobre los pesos originales; se recomienda verificar el repositorio de dbmdz como fuente canonica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no implica problemas tecnicos pero si ausencia de validacion comunitaria sobre el espejo concreto.
- No se documentan procesos de descontaminacion de benchmarks ni evaluaciones de robustez adversarial.

## Enlaces

- Repositorio espejo: https://huggingface.co/veripazari/bert-base-turkish-cased
- Modelo original: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Organizacion dbmdz en Hugging Face: https://huggingface.co/dbmdz
- Repositorio de resultados PoS/NER: https://github.com/stefan-it/turkish-bert
- Repositorio de issues de los BERT de dbmdz: https://github.com/dbmdz/berts/issues/new
- Plataforma del espejo: https://veripazari.com.tr
- Corpus OSCAR: https://traces1.inria.fr/oscar/
- Corpus OPUS: http://opus.nlpl.eu/
