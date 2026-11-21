# ukrbublik/opus-mt-es-pl-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-pl-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-es-pl`, desarrollado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de español a polaco, sin pivote intermedio por inglés, y está pensado para ejecutarse en dispositivos móviles dentro de la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian, un transformer encoder-decoder entrenado sobre datos de OPUS. Esta versión concreta no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 (QInt8, per-tensor) mediante onnxruntime. Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del layer 2, útil para alinear tokens entre origen y destino.

Su relevancia es acotada pero específica: ofrece traducción es→pl en un paquete de unos 0,1 GB, con licencia Apache 2.0 y artefactos listos para inferencia on-device. No es un modelo de propósito general ni compite en benchmarks de razonamiento; es una pieza de infraestructura de traducción para un caso de uso muy concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | español (es), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es Marian, un transformer encoder-decoder secuencial diseñado para traducción automática neuronal. Los pesos originales fueron entrenados por el grupo OPUS-MT sobre datos del corpus OPUS, que agrega colecciones de textos paralelos de múltiples fuentes. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La conversión realizada por `ukrbublik` exporta el modelo a ONNX con opset 17 y sin past key/values, y aplica cuantización dinámica INT8 con onnxruntime. La innovación destacable es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atención encoder del layer 2 del decoder, sin alterar pesos ni decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa español → polaco, sin pivote por inglés.
- Salida de alineamiento token a token mediante `alignment_shift_l2` (probabilidades de atención encoder del layer 2).
- Inferencia on-device mediante onnxruntime, con pesos cuantizados a INT8.
- Tokenizer empaquetado en JSON para su uso en runtime sin dependencias de SentencePiece.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- Multilingüismo limitado estrictamente al par es→pl.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos de español a polaco en el propio dispositivo, sin conexión, gracias al paquete ONNX INT8 de ~0,1 GB y a la inferencia con onnxruntime.
- Traducción de documentación técnica es→pl en pipelines offline: el modelo puede integrarse en scripts de preprocesado que traduzcan cadenas de interfaz o textos de ayuda sin depender de APIs externas.
- Alineación de pares de frases para memorias de traducción: la salida `alignment_shift_l2` permite generar correspondencias token a token que ayuden a construir o validar TMX bilingües.
- Traducción de contenido editorial de bajo riesgo: artículos, notas de prensa o fichas de producto donde se requiere una primera versión en polaco para revisión humana posterior.
- Prototipado de sistemas de traducción en dispositivos con recursos limitados: sirve como referencia para medir latencia y calidad de Marian INT8 en hardware móvil o SBC.
- Evaluación comparativa de cuantización: útil para estudiar la pérdida de calidad de INT8 dinámico frente al modelo original en un par de idiomas concreto.
- Traducción de subtítulos en tiempo casi real en entornos sin conectividad, como eventos o dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y compatible con dispositivos móviles.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU y aceleradores móviles mediante onnxruntime.
- Cabe en GPU de consumo: sí, con amplio margen, aunque su destino principal es la inferencia en CPU.
- Opciones de despliegue: onnxruntime (runtime objetivo), potencialmente integrable en otros entornos que acepten ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-es-pl-int8-shift-att | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineamiento, on-device |
| Helsinki-NLP/opus-mt-es-pl | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base sin cuantizar |
| Otros modelos OPUS-MT es→pl | no disponible | no disponible | Apache 2.0 | variable | Conversiones comunitarias sin alineamiento |

## Limitaciones y advertencias

- El par de idiomas está restringido a español → polaco; no traduce en sentido inverso ni a terceros idiomas.
- Al ser una cuantización INT8 dinámica, puede presentar una ligera degradación de calidad frente al modelo original en frases largas o ambiguas.
- No se han publicado evaluaciones de sesgo, alucinación o robustez para esta conversión concreta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a OPUS-MT y a la Universidad de Helsinki indicada en la model card.
- La salida de alineamiento es una identidad sobre un nodo existente; su interpretación requiere conocer la arquitectura Marian y no debe tratarse como una garantía de alineación perfecta.
- El modelo está optimizado para un runtime Android concreto (Subtitle Tap); su integración en otros stacks requiere validar la compatibilidad del tokenizer JSON y de las salidas ONNX.
- No dispone de datos publicados sobre longitud máxima de secuencia soportada en esta exportación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ukrbublik/opus-mt-es-pl-int8-shift-att)
- [Modelo base Helsinki-NLP/opus-mt-es-pl](https://huggingface.co/Helsinki-NLP/opus-mt-es-pl)
- [Repositorio OPUS-MT](https://github.com/Helsinki-NLP/OPUS-MT)
- [Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020)](https://aclanthology.org/2020.eamt-1.61/)
- [onnxruntime](https://github.com/microsoft/onnxruntime)
