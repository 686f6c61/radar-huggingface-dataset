# veripazari/opus-mt-tc-big-en-tr

## Resumen

`opus-mt-tc-big-en-tr` es un modelo de traducción automática neuronal especializado en el par inglés-turco, desarrollado originalmente por Helsinki-NLP dentro del proyecto OPUS-MT. La versión alojada en Hugging Face bajo el identificador `veripazari/opus-mt-tc-big-en-tr` es una réplica de documentación traducida al turco y archivada por la plataforma VeriPazarı, que mantiene intactos los pesos originales del modelo. Está pensado para traducción unidireccional en→tr de alta calidad y forma parte del ecosistema OPUS de modelos abiertos de traducción.

El modelo emplea la arquitectura transformer-big de Marian NMT, con tokenización SentencePiece de 32k vocabulario compartido entre origen y destino. Se entrenó sobre el corpus opusTCv20210807+bt, una compilación de datos OPUS enriquecida con backtranslation, y su versión de pesos data del 25 de febrero de 2022. El repositorio ocupa 1,4 GB y se distribuye en formatos PyTorch y TensorFlow, con licencia CC-BY-4.0.

Su relevancia radica en ser una alternativa abierta y ligera para traducción en→tr en producción, con resultados publicados en varios conjuntos de referencia (FLORES-101, WMT news y Tatoeba) y compatible con la librería `transformers` mediante `MarianMTModel` y `pipeline("translation")`. No es un modelo generativo de propósito general: está acotado a la tarea de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-big (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en fp32; admite cuantización vía herramientas externas) |
| Idiomas soportados | inglés (en) como origen, turco (tr) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (safetensors/bin) y TensorFlow; tokenizer SentencePiece (spm32k) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer-big de Marian NMT, la implementación en C++ desarrollada por el equipo de Helsinki para entrenamiento e inferencia eficiente de traducción automática. Los pesos se han convertido a PyTorch para su uso con la clase `MarianMTModel` de Hugging Face `transformers`. La tokenización emplea SentencePiece con vocabulario de 32k, compartido entre lengua origen y destino, lo que es habitual en los modelos OPUS-MT.

El entrenamiento se realizó sobre el corpus opusTCv20210807+bt, una versión del conjunto de datos del Tatoeba Challenge que combina datos de OPUS con técnicas de backtranslation para aumentar la cobertura. La versión de pesos publicada corresponde al 25 de febrero de 2022. No se documentan en la información disponible detalles sobre uso de RLHF, DPO ni otras técnicas de alineación posteriores, algo esperable en un modelo de traducción supervisada.

## Capacidades

- Traducción automática unidireccional inglés → turco.
- Procesamiento por lotes de múltiples frases en una sola llamada mediante `MarianMTModel.generate`.
- Integración directa con `transformers` a través de `pipeline("translation")`.
- Compatible con `MarianTokenizer` para tokenización SentencePiece.
- Soporte de padding y atención enmascarada para secuencias de distinta longitud dentro del lote.
- Disponibilidad en formato TensorFlow además de PyTorch, según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades generativas fuera de la traducción.

## Casos de uso

- Traducción de documentación técnica y manuales de producto del inglés al turco: el modelo está entrenado sobre corpus OPUS que incluye textos técnicos y puede integrarse en pipelines de localización continua mediante `transformers`.
- Localización de interfaces de usuario y cadenas de aplicación: al procesar lotes con `generate`, permite traducir ficheros de recursos completos en una sola pasada y con latencia baja en GPU consumer.
- Traducción de artículos periodísticos y contenido editorial: los resultados en WMT news (BLEU 23,4 en newstest2016, 25,4 en newstest2017, 22,6 en newstest2018) lo hacen adecuado para dominios informativos.
- Subtitulado y transcripción traducida: al ser un modelo ligero (1,4 GB), puede desplegarse junto a un ASR en el mismo nodo para generar subtítulos en turco a partir de audio en inglés.
- Preprocesado para análisis de sentimiento o clasificación en turco: traducir reseñas o tickets en inglés al turco antes de pasarlos a un clasificador entrenado en turco.
- Sistemas de atención al cliente bilingües: traducción en tiempo real de mensajes entrantes en inglés a agentes que trabajan en turco, con despliegue en CPU o GPU modesta.
- Generación de corpus paralelos sintéticos: uso del modelo para backtranslation o aumento de datos en proyectos de NLP en turco.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| flores101-devtest | eng-tur | BLEU | 31,4 |
| newsdev2016 | eng-tur | BLEU | 21,9 |
| tatoeba-test-v2021-08-07 | eng-tur | BLEU | 42,3 |
| newstest2016 | eng-tur | BLEU | 23,4 |
| newstest2017 | eng-tur | BLEU | 25,4 |
| newstest2018 | eng-tur | BLEU | 22,6 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos conjuntos, ni métricas adicionales como COMET o chrF.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 3-4 GB considerando pesos (1,4 GB) y estados de atención para lotes moderados; con cuantización a int8 puede reducirse por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 (RTX 3050, RTX 3060, T4). Para throughput alto en producción, A10, L4, A100 o H100 permiten procesar lotes grandes con baja latencia.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` (PyTorch y TensorFlow), `pipeline("translation")`, Marian NMT nativo (C++), conversión a ONNX Runtime y servidores de inferencia como TGI o vLLM (aunque vLLM está optimizado para modelos decoder-only, por lo que Marian requiere adaptaciones).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un transformer-big de traducción, se espera un throughput alto en GPU (cientos de frases por segundo en A100 con lotes grandes), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opus-mt-tc-big-en-tr (este) | no disponible | no disponible | CC-BY-4.0 | Hugging Face | Transformer-big Marian, en→tr, BLEU 31,4 en FLORES-101 |
| Helsinki-NLP/opus-mt-en-tr | no disponible | no disponible | CC-BY-4.0 | Hugging Face | Versión transformer base del mismo par, menor capacidad |
| Helsinki-NLP/opus-mt-tc-big-tr-en | no disponible | no disponible | CC-BY-4.0 | Hugging Face | Dirección inversa tr→en del mismo proyecto |
| Facebook NLLB-200 (distilled 600M) | 600M | 512 tokens | CC-BY-NC-4.0 | Hugging Face | Multilingüe, no comercial; cubre en→tr entre 200 idiomas |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; los datos de BLEU solo se aportan para este modelo.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce inglés → turco; no soporta la dirección inversa ni otros pares.
- No es un modelo generativo de propósito general: no responde preguntas, no razona ni ejecuta instrucciones fuera de la traducción.
- Longitud de contexto no documentada; los modelos Marian suelen limitarse a secuencias de unos 512 tokens, por lo que textos largos deben segmentarse.
- Riesgo de alucinación y omisiones en frases ambiguas, jerga o dominios muy especializados (legal, médico), donde los corpus OPUS pueden estar infrarrepresentados.
- Sesgos potenciales heredados de los corpus OPUS: posibles sesgos de género, culturales y de registro presentes en los datos de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Tiedemann y Thottingal, 2020; Tiedemann, 2020).
- Los benchmarks publicados no están verificados de forma independiente (`verified: false` en la model card).
- El repositorio es una réplica de documentación de un tercero (VeriPazarı); conviene contrastar con el repositorio original de Helsinki-NLP para asegurar la integridad de los pesos.
- Sin garantías de rendimiento en producción: no se aportan métricas de latencia, throughput ni tasas de error en dominios concretos.

## Enlaces

- Modelo en Hugging Face (réplica): https://huggingface.co/veripazari/opus-mt-tc-big-en-tr
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Marian NMT: https://marian-nmt.github.io/
- Corpus OPUS: https://opus.nlpl.eu/
- Procedimientos de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- README del par eng-tur: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-tur/README.md
- Pesos originales: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-tur/opusTCv20210807+bt_transformer-big_2022-02-25.zip
- Artículo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Artículo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- Plataforma VeriPazarı: https://veripazari.com.tr
