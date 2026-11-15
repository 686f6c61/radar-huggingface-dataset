# vghfdc/opus-mt-tc-big-zh-ja

## Resumen

opus-mt-tc-big-zh-ja es un modelo de traducción automática neuronal especializado en el par de idiomas chino (zh) a japonés (ja), desarrollado por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo se entrenó originalmente con el framework Marian NMT (implementación en C++) y posteriormente se convirtió a PyTorch para su uso con la librería transformers de Hugging Face. La versión alojada por el usuario vghfdc replica el modelo original publicado el 28 de julio de 2022.

Se trata de un transformer de tamaño "big" con 209.158.401 parámetros totales y un repositorio de 1,7 GB en formato safetensors. Forma parte de la familia opus-mt-tc (Tatoeba Challenge), que emplea datos de OPUS y los procedimientos de entrenamiento de OPUS-MT-train. Su relevancia radica en ofrecer una alternativa abierta y ligera para traducción zh-ja, un par con escasez de recursos y con diferencias tipográficas notables (sistema de escritura, orden sintáctico y honoríficos).

La licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace apto para integración en productos y servicios. El modelo declara un BLEU de 24,6 y un chr-F de 0,2779 sobre el conjunto de test tatoeba-test-v2021-08-07 (2.497 frases, 21.956 palabras), resultados no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Marian NMT, variante "big") |
| Parametros totales | 209.158.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía conversión a otros formatos, no documentada por el autor) |
| Idiomas soportados | chino (zh) como origen, japonés (ja) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer encoder-decoder de Marian NMT en su configuración "big", con tokenización SentencePiece de 32k para origen y destino (spm32k, spm32k). Se entrenó sobre el corpus opusTCv20210807, la versión de 2021-08-07 del conjunto de datos del Tatoeba Translation Challenge, que agrega pares de traducción procedentes de OPUS. Los scripts de entrenamiento están disponibles en el repositorio OPUS-MT-train.

No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en modelos NMT de esta generación). El modelo original de Marian está disponible como archivo ZIP en el servidor de CSC (object.pouta.csc.fi), y la conversión a PyTorch se realizó con la librería transformers. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto chino a japonés, tanto de frases sueltas como de párrafos.
- Generación de texto texto-a-texto en el contexto de la tarea de traducción.
- Manejo de frases cortas y conversacionales (los ejemplos de la model card incluyen "生日快乐，Muiriel！" y "好凍。").
- Soporte de inferencia por lotes (batch) mediante `MarianMTModel.generate` con padding.
- Integración con el pipeline `translation` de transformers.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada estrictamente al par zh-ja; no es un modelo multilingüe general.

## Casos de uso

- Traducción de documentación técnica y manuales de producto del chino al japonés: el modelo puede procesar lotes de frases y párrafos con un coste computacional bajo (209M de parámetros), adecuado para pipelines de localización automatizada.
- Localización de interfaces y cadenas de software: al ser un modelo pequeño y con licencia CC-BY-4.0, puede desplegarse en servidores modestos para traducir recursos de aplicación (menús, mensajes de error, textos de ayuda) de forma continua.
- Atención al cliente en comercio electrónico transfronterizo: traducción de mensajes de usuarios chinos a japonés para agentes o sistemas de ticketing, con la ventaja de que el modelo cabe en una GPU consumer y permite baja latencia.
- Subtitulado y traducción de contenido audiovisual: traducción de subtítulos zh-ja en lotes, integrándose en flujos de postproducción donde se requiere procesamiento por segmentos.
- Investigación en traducción automática de pares de bajos recursos: el modelo sirve como línea base reproducible (con scripts y datos públicos de OPUS-MT) para experimentos académicos sobre zh-ja.
- Preprocesamiento en pipelines de datos multilingües: traducción de corpus chinos a japonés para aumentar datos de entrenamiento de otros modelos o para análisis de sentimiento y minería de opiniones en japonés.
- Traducción de correspondencia y correos comerciales: para comunicaciones breves entre equipos en China y Japón, donde la latencia y el coste por token son críticos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor | Frases | Palabras |
|---|---|---|---|---|---|
| Traducción zho-jpn | tatoeba-test-v2021-08-07 | BLEU | 24,6 | 2.497 | 21.956 |
| Traducción zho-jpn | tatoeba-test-v2021-08-07 | chr-F | 0,2779 | 2.497 | 21.956 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otras tareas estándar, ya que el modelo está especializado exclusivamente en traducción.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,84 GB solo para pesos (209M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,42 GB para pesos, con un total práctico de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes. También puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1050 en adelante), así como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), transformers con TensorFlow, pipeline `translation`, Marian NMT nativo (usando el modelo original en ZIP), y servidores de inferencia compatibles con transformers como TGI o vLLM (soporte de Marian no garantizado en todas las versiones; verificar compatibilidad).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Par zh-ja | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opus-mt-tc-big-zh-ja (este) | 209M | no disponible | BLEU 24,6 / chr-F 0,2779 (tatoeba) | CC-BY-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-zh-ja | no disponible en la información | no disponible | no disponible | CC-BY-4.0 (familia OPUS-MT) | Hugging Face |
| Otros modelos OPUS-MT-tc para zh-ja | no disponible | no disponible | no disponible | CC-BY-4.0 | Hugging Face / servidor CSC |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos comparables (por ejemplo, NLLB-200 o M2M-100) para el par zh-ja, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó sobre datasets públicos de OPUS que pueden contener contenido perturbador, ofensivo o estereotipos históricos y actuales; la model card incluye una advertencia explícita al respecto.
- Riesgo de alucinación y de traducciones incorrectas en frases largas, ambiguas o con terminología especializada; no se documentan evaluaciones en dominios técnicos o legales.
- Especialización estricta en el par zh-ja: no traduce otros pares ni realiza otras tareas; no debe usarse como modelo generativo general.
- La longitud de contexto no está documentada; se recomienda tratar frases o párrafos cortos y evitar entradas muy largas.
- Los resultados de BLEU y chr-F son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia CC-BY-4.0: permite uso comercial y modificación con atribución; es necesario citar el modelo y las publicaciones de OPUS-MT (Tiedemann y Thottingal, 2020) según indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-15); no hay evidencia de validación por la comunidad.
- El identificador de ejemplo en la model card (`pytorch-models/opus-mt-tc-big-zh-ja`) no coincide con el ID del repositorio (`vghfdc/opus-mt-tc-big-zh-ja`); conviene usar el ID real al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vghfdc/opus-mt-tc-big-zh-ja
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Marian NMT: https://marian-nmt.github.io/
- OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- README del par zho-jpn en Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/zho-jpn/README.md
- Tatoeba Translation Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge/
- Documentación de Marian en transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Modelo original Marian (ZIP): https://object.pouta.csc.fi/Tatoeba-MT-models/zho-jpn/opusTCv20210807-sepvoc_transformer-big_2022-07-28.zip
- Traducciones del test set: https://object.pouta.csc.fi/Tatoeba-MT-models/zho-jpn/opusTCv20210807-sepvoc_transformer-big_2022-07-28.test.txt
- Puntuaciones del test set: https://object.pouta.csc.fi/Tatoeba-MT-models/zho-jpn/opusTCv20210807-sepvoc_transformer-big_2022-07-28.eval.txt
- Publicación OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Publicación Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- Corpus OPUS: https://opus.nlpl.eu/
