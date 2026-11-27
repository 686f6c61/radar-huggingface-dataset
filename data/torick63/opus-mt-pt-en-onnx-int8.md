# Torick63/opus-mt-pt-en-onnx-int8

## Resumen

`Torick63/opus-mt-pt-en-onnx-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-ROMANCE-en`, desarrollado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). El modelo resuelve la traducción de portugués a inglés y está pensado específicamente para inferencia en dispositivo (on-device), donde el tamaño reducido y la ausencia de dependencias de PyTorch son prioritarias.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder clásico de traducción neuronal. El modelo base es multilingüe en el lado de origen (cubre varias lenguas románicas: francés, español, portugués, italiano, rumano, entre otras) y traduce siempre a inglés, sin necesidad de token de idioma de origen. Esta conversión concreta se emplea para el par portugués-inglés.

La relevancia actual del artefacto radica en su empaquetado: dos ficheros ONNX (encoder y decoder fusionado con caché KV) con pesos cuantizados a int8 y un tamaño total de aproximadamente 149 MB, lo que permite desplegar traducción de calidad razonable en CPU, navegador o dispositivos con recursos limitados. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible (repo de 0,3 GB; pesos int8 ~149 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime `quantize_dynamic`) |
| Idiomas soportados | portugues (origen), ingles (destino); el modelo base cubre varias lenguas romanicas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`) + SentencePiece (`source.spm`, `target.spm`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de traducción neuronal de la familia Marian, la misma arquitectura que emplean los modelos OPUS-MT publicados por la Universidad de Helsinki (Tiedemann y Thottingal, 2020). El modelo base `opus-mt-ROMANCE-en` se entrenó sobre datos paralelos multilingües del corpus OPUS para traducir desde múltiples lenguas románicas al inglés, compartiendo un único modelo con vocabulario SentencePiece y sin token explícito de idioma de origen.

La conversión realizada por Torick63 utiliza Optimum con la tarea `text2text-generation-with-past`. El decoder se exporta como un único fichero fusionado que gestiona tanto el primer paso de decodificación como los pasos con caché, controlado mediante la entrada `use_cache_branch`, de modo que los pesos del decoder se almacenan una sola vez. Sobre ese grafo se aplica cuantización dinámica de pesos int8 con `quantize_dynamic` de ONNX Runtime, activando `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado. No se documenta en la información disponible ningún proceso adicional de fine-tuning, RLHF o DPO sobre el modelo base.

## Capacidades

- Traducción automática portugués a inglés, texto plano.
- Traducción multilingüe desde otras lenguas románicas hacia inglés (heredada del modelo base), aunque la conversión está orientada y validada para portugués.
- Tokenización SentencePiece con modelos separados de origen y destino.
- Inferencia con caché KV en el decoder, lo que acelera la generación autorregresiva.
- Ejecución sin PyTorch mediante ONNX Runtime, apta para entornos ligeros.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta soporte de control de formalidad, glosarios ni marcas de género.

## Casos de uso

- Traducción en el navegador: el tamaño de ~149 MB y el formato ONNX permiten ejecutar el modelo con `onnxruntime-web` en el cliente, evitando enviar texto del usuario a un servidor y reduciendo costes de infraestructura.
- Aplicaciones móviles y de escritorio: integración en apps nativas que necesiten traducción pt→en sin conexión, usando ONNX Runtime en CPU y sin dependencias de Python.
- Preprocesado de pipelines de datos: traducción por lotes de corpus en portugués (reseñas, tickets, documentación) a inglés antes de tareas posteriores de clasificación, búsqueda o análisis, aprovechando el bajo coste de inferencia en CPU.
- Subtitulado y localización de contenido: traducción de subtítulos o descripciones cortas del portugués al inglés en herramientas de edición, donde la latencia por frase es el factor crítico y el contexto requerido es corto.
- Sistemas embebidos y edge computing: despliegue en dispositivos con poca memoria (Raspberry Pi, routers, equipos industriales) donde un modelo de traducción de cientos de MB en FP32 no cabría o sería demasiado lento.
- Prototipado y evaluación de traducción: uso como línea base ligera en experimentos de traducción automática o en pruebas A/B de calidad frente a modelos mayores, gracias a la licencia Apache-2.0 y a la facilidad de despliegue con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación cualitativa: con decodificación greedy, los ficheros int8 producen la misma salida que el modelo original en PyTorch en 28 de 30 frases cortas de prueba, y el resto difieren principalmente en la formulación debido a la cuantización.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el conjunto de pesos ocupa aproximadamente 149 MB en int8; el consumo total de memoria en ejecución (activaciones y caché KV) es mayor pero reducido, manejable en unos pocos cientos de MB de RAM.
- GPU recomendadas: no es necesario GPU; el modelo está pensado para CPU. En caso de usar GPU, cualquier tarjeta con soporte de ONNX Runtime CUDA (por ejemplo, T4, RTX 3060 en adelante) sirve, pero el beneficio es limitado por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 4090, RTX 3060, etc.), aunque su uso típico es en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript), `onnxruntime-web` en navegador, `optimum` para carga desde Transformers, y servidores de inferencia compatibles con ONNX. No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Torick63/opus-mt-pt-en-onnx-int8 | no disponible (~149 MB int8) | no disponible | pt→en (base multilingüe romance) | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-ROMANCE-en | no disponible | no disponible | romance→en | Apache-2.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-tc-big-en-pt (familia OPUS-MT) | no disponible | no disponible | multilingüe | Apache-2.0 | PyTorch |
| Modelos NMT comerciales (p. ej., DeepL, Google Translate) | no disponible | no disponible | multilingüe | propietaria | API |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. La ventaja diferencial de esta conversión frente al modelo base es el tamaño (~149 MB frente a los pesos completos en FP32) y la portabilidad a ONNX Runtime; su desventaja es la posible pérdida de calidad por cuantización y la falta de soporte directo en ecosistemas como llama.cpp.

## Limitaciones y advertencias

- La cuantización int8 introduce diferencias de formulación respecto al modelo original en una minoría de frases (2 de 30 en la prueba reportada); no se garantiza equivalencia exacta en producción.
- El modelo base es un Marian NMT de tamaño moderado; la calidad de traducción es inferior a la de modelos neuronales grandes o sistemas comerciales, especialmente en frases largas, terminología especializada y expresiones idiomáticas.
- Riesgo de alucinación y de traducciones infieles en entradas ambiguas, con nombres propios o con jerga; no se documentan mecanismos de mitigación.
- El modelo está orientado a portugués, pero el modelo base es multilingüe; sin token de idioma de origen, podría producir traducciones incorrectas si se alimenta con texto en otra lengua románica.
- No se documenta la longitud máxima de secuencia soportada; entradas largas pueden truncarse o degradar la calidad.
- Sesgos: no se documenta ninguna evaluación de sesgos de género, demográficos o culturales; los modelos NMT tienden a reproducir sesgos presentes en los corpus OPUS.
- Licencia Apache-2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías; conviene mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki.
- El repositorio tiene pocas descargas (200) y cero likes; no hay evidencia de validación por parte de la comunidad más allá de la prueba cualitativa del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-pt-en-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ROMANCE-en
- Paper OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.10/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime (cuantización dinámica): https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
