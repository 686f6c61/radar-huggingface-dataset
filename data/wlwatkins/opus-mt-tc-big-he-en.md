# wlwatkins/opus-mt-tc-big-he-en

## Resumen

Este repositorio proporciona una exportación del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-he-en` en formato ONNX cuantizado a int8, específicamente preparado para ejecutarse en el navegador mediante la librería transformers.js. El modelo original, desarrollado por el equipo Helsinki-NLP dentro del proyecto OPUS-MT, traduce texto del hebreo (he) al inglés (en) y está basado en la arquitectura Marian, un transformer encoder-decoder de tamaño grande.

La relevancia de esta versión cuantizada radica en que las exportaciones ONNX existentes de este par de idiomas fallaban en el navegador por distintos motivos: las versiones q4 presentaban grafos inválidos, las fp16 fallaban por incompatibilidad de tipos de datos y las fp32 pesaban alrededor de 1,2 GB. Esta versión int8 ocupa aproximadamente 365 MB, funciona con el backend WASM de ONNX Runtime y mantiene una calidad de traducción muy cercana a la del modelo original en fp32, con una pérdida de aproximadamente 0,66 puntos de BLEU debido a la cuantización.

El repositorio incluye los archivos ONNX cuantizados (`encoder_model_quantized.onnx` de 139 MB y `decoder_model_merged_quantized.onnx` de 227 MB), junto con el tokenizador y la configuración necesarios para su uso tanto desde JavaScript como desde Python. La licencia se mantiene como CC-BY-4.0, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian transformer encoder-decoder (text2text-generation) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (QUInt8, cuantización dinámica) |
| Idiomas soportados | Hebreo (he) como entrada, inglés (en) como salida |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo base es `Helsinki-NLP/opus-mt-tc-big-he-en`, un modelo Marian de tamaño grande entrenado por el equipo Helsinki-NLP con datos del corpus OPUS. Marian es una implementación eficiente del transformer original de Vaswani et al., con arquitectura encoder-decoder completa. El modelo pertenece a la familia OPUS-MT, que cubre cientos de pares de idiomas entrenados con datos paralelos extraídos de colecciones multilingües como Tatoeba, Europarl y otras fuentes del repositorio OPUS.

La versión de este repositorio no modifica los pesos del modelo original, solo cambia el formato. El proceso de conversión utilizó `optimum.exporters.onnx.main_export` con la tarea `text2text-generation-with-past`, forzando el exportador TorchScript legacy de PyTorch (necesario porque el exportador dynamo de torch 2.9 escribe los pesos externos con una convención de nombres incompatible). Posteriormente se aplicó cuantización dinámica con `onnxruntime.quantization.quantize_dynamic` usando `weight_type=QUInt8` y la opción `EnableSubgraph: True`, imprescindible porque el decoder fusionado contiene ramas de caché dentro de un nodo `If` que de otro modo permanecerían en fp32. El tokenizador `tokenizer.json` se tomó de una exportación previa de `nico-martin/opus-mt-tc-big-he-en`, ya que Marian no dispone de tokenizador rápido y optimum solo genera archivos `.spm` que transformers.js no puede leer.

## Capacidades

- Traducción automática neuronal del hebreo al inglés con calidad cercana a la del modelo fp32 original.
- Ejecución en navegador mediante transformers.js con backend WASM, sin necesidad de servidor.
- Inferencia con decodificación greedy; el parámetro `num_beams` no tiene efecto en transformers.js (produce salidas idénticas a greedy).
- Compatible con generación de texto condicionada mediante `max_new_tokens` para limitar la longitud de la salida.
- Uso desde Python con los archivos `vocab.json` y `.spm` incluidos en el repositorio.
- Cuantización int8 que reduce el peso de 1,2 GB (fp32) a aproximadamente 365 MB, facilitando la descarga en entornos con ancho de banda limitado.
- El 58% de las salidas int8 son byte-idénticas a las del modelo fp32 original.

## Casos de uso

- Traducción hebreo-inglés en el navegador sin servidor: la integración con transformers.js permite construir aplicaciones web de traducción que se ejecutan íntegramente en el cliente, lo que reduce costes de infraestructura y elimina la latencia de red. Es adecuado para herramientas de lectura de noticias, documentos o webs en hebreo.
- Aplicaciones de aprendizaje de idiomas: se puede integrar en plataformas educativas para ofrecer traducciones instantáneas de frases hebreas a estudiantes angloparlantes, con la ventaja de que el procesamiento ocurre localmente en el dispositivo del usuario.
- Traducción de contenido generado por usuarios: foros, redes sociales o sistemas de comentarios que necesiten traducir publicaciones en hebreo al inglés pueden usar este modelo en el cliente, evitando enviar texto a servicios externos y protegiendo la privacidad de los usuarios.
- Herramientas de investigación lingüística: investigadores que trabajen con corpus hebreos pueden utilizar el modelo para generar traducciones preliminares al inglés, aprovechando que la cuantización int8 apenas degrada la calidad (pérdida de 0,66 BLEU).
- Extensiones de navegador para traducción selectiva: una extensión que traduzca fragmentos de texto en hebreo seleccionados por el usuario, con ejecución local y sin necesidad de conexión a servicios de traducción en la nube.
- Prototipado rápido de pipelines de traducción: al ser un modelo pequeño (365 MB) y ejecutable en WASM, es adecuado para prototipos y demos que necesiten traducción hebreo-inglés sin depender de GPUs ni infraestructura de servidores.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación con sacrebleu (BLEU y chrF2) sobre dos conjuntos de prueba, comparando el modelo int8 de este repositorio con el modelo original fp32 de Helsinki-NLP:

**FLORES-101 devtest (1012 frases)**

| Sistema | BLEU | Δ | chrF2 |
|---|---|---|---|
| Helsinki fp32, beam 4 (publicado) | 44,04 | — | 0,6811 |
| fp32, greedy (PyTorch) | 43,86 | −0,18 | 0,6786 |
| Este repositorio — int8, greedy | 43,20 | −0,84 | 0,6745 |

**Tatoeba test v2021-08-07 (10519 frases)**

| Sistema | BLEU | Δ | chrF2 |
|---|---|---|---|
| Helsinki fp32, beam 4 (publicado) | 53,81 | — | 0,6857 |
| Este repositorio — int8, greedy | 52,46 | −1,35 | 0,6780 |

La pérdida atribuible a la cuantización es de aproximadamente 0,66 puntos de BLEU; el resto de la diferencia se debe a la decodificación greedy, que es la única disponible en transformers.js. La validación del harness de evaluación se confirmó reproduciendo los resultados publicados de Helsinki (53,81 / 44,04) al puntuar sus propias hipótesis fp32.

## Requisitos de hardware

- El modelo int8 ocupa aproximadamente 365 MB en disco, con un tamaño de descarga muy inferior al de la versión fp32 (1,2 GB).
- No requiere GPU: está diseñado para ejecutarse en el backend WASM de ONNX Runtime, que funciona en cualquier navegador moderno con soporte WebAssembly.
- No se recomienda usar el backend WebGPU: ONNX Runtime descuantifica incorrectamente los pesos int8 en WebGPU (issue transformers.js#1512), produciendo salidas sin sentido. Hay que fijar `device: 'wasm'`.
- El proceso de exportación requirió aproximadamente 10 GB de RAM (el decoder with-past fue eliminado por OOM a 7 GB), pero esto solo es relevante si se quiere reproducir la conversión, no para la inferencia.
- Para uso desde Python, se puede cargar con ONNX Runtime en CPU; los requisitos de memoria son modestos dado el tamaño del modelo.
- Opciones de despliegue: transformers.js en navegador (WASM), o bien ONNX Runtime desde Python. No se proporcionan archivos GGUF ni integración con llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | BLEU (FLORES-101) | BLEU (Tatoeba) | Licencia |
|---|---|---|---|---|---|
| Helsinki-NLP/opus-mt-tc-big-he-en | PyTorch/TensorFlow (fp32) | ~1,2 GB | 44,04 (beam 4) | 53,81 (beam 4) | CC-BY-4.0 |
| wlwatkins/opus-mt-tc-big-he-en (este repo) | ONNX int8 | ~365 MB | 43,20 (greedy) | 52,46 (greedy) | CC-BY-4.0 |
| nico-martin/opus-mt-tc-big-he-en | ONNX | no disponible | no disponible | no disponible | CC-BY-4.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos hebreo-inglés en la información proporcionada. La ventaja principal de este repositorio frente a las alternativas es que es la única exportación ONNX que funciona correctamente en el navegador con transformers.js.

## Limitaciones y advertencias

- El backend WebGPU de ONNX Runtime descuantifica incorrectamente los pesos int8, produciendo traducciones sin sentido (texto multilingüe con tokens repetidos de escrituras no relacionadas). Hay que usar exclusivamente el backend WASM hasta que se resuelva el issue transformers.js#1512.
- No se deben usar los parámetros `no_repeat_ngram_size` ni `repetition_penalty`: ambos corrompen la salida. Cuando un lote mezcla entradas cortas y largas, una secuencia corta termina antes y sigue generando mientras la más larga continúa, reemitiendo EOS. Prohibir ese n-grama repetido fuerza la generación de tokens reales, produciendo salidas como `Tourism....!?:-)s,];` en lugar de `Tourism`. Hay que limitar la salida únicamente con `max_new_tokens`.
- El parámetro `num_beams` no tiene efecto en transformers.js: pasar `num_beams: 4` produce salidas byte-idénticas a greedy, por lo que no es posible recuperar la calidad del beam search del modelo original.
- La cuantización int8 introduce una pérdida de calidad de aproximadamente 0,66 puntos de BLEU respecto al modelo fp32 original.
- El modelo solo traduce en una dirección: hebreo a inglés. No soporta traducción inversa (inglés a hebreo).
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al equipo Helsinki-NLP / OPUS-MT.
- El tokenizador `tokenizer.json` se tomó de un repositorio de terceros (`nico-martin/opus-mt-tc-big-he-en`), no del modelo original de Helsinki-NLP.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wlwatkins/opus-mt-tc-big-he-en
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-he-en
- Exportación ONNX previa: https://huggingface.co/nico-martin/opus-mt-tc-big-he-en
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Servicio de traducción OPUS: https://github.com/Helsinki-NLP/OpusTranslationService
- transformers.js: https://github.com/huggingface/transformers.js
- Issue WebGPU int8: https://github.com/huggingface/transformers.js/issues/1512
- Paper OPUS-MT: Tiedemann, J. y Thottingal, S. (2020). "OPUS-MT — Building open translation services for the World". Proceedings of the 22nd Annual Conference of the European Association for Machine Translation.
