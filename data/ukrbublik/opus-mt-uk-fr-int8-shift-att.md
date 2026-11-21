# ukrbublik/opus-mt-uk-fr-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-uk-fr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). Resuelve la traducción directa ucraniano→francés sin pivotar por el inglés, y añade una salida de alineamiento de atención que permite extraer correspondencias token a token entre origen y destino.

El modelo está pensado para inferencia en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap, que usa un runtime propio de OPUS. La conversión la firma ukrbublik, no el equipo original: se mantienen los pesos de Helsinki y solo se altera el formato de fichero (exportación ONNX con opset 17 y cuantización dinámica QInt8 por tensor con onnxruntime). La arquitectura subyacente es Marian NMT, un transformer encoder-decoder de tamaño pequeño, típico de la familia OPUS-MT.

Es relevante por dos motivos concretos: ofrece traducción bidireccional ucraniano-francés ligera y ejecutable en CPU, y expone las probabilidades de atención de la capa 2 del encoder como tensor de salida (`alignment_shift_l2`), lo que habilita alineamiento de subtítulos sin coste adicional en pesos ni en decodificación. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | ucraniano (uk), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-uk-fr` es un Marian NMT, un transformer encoder-decoder entrenado sobre corpus paralelos de OPUS (Tiedemann y Thottingal, 2020). La revisión concreta usada para la conversión es `ea4e9f3006c851b2b49af5c9cddb7dd7749f105e`. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esa información no está en la model card.

La conversión de ukrbublik aplica una exportación con `optimum` (opset 17, sin past key/values) y cuantización dinámica INT8 por tensor con onnxruntime. La innovación técnica destacable es que el decoder emite además `alignment_shift_l2`, las probabilidades de atención encoder de la capa 2, implementado como una `Identity` sobre un nodo ya existente: los pesos y el proceso de decodificación no cambian. Se incluye también `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más las cadenas del vocabulario destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa ucraniano→francés, sin pivotar por inglés.
- Salida de alineamiento de atención (`alignment_shift_l2`) para correspondencia token a token entre origen y destino.
- Tokenización SentencePiece empaquetada en formato JSON para runtime propio.
- Inferencia en CPU mediante ONNX Runtime, apta para dispositivos móviles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo limitado al par uk→fr; no es un modelo multilingüe general.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos ucranianos a francés en el dispositivo, sin conexión, gracias al formato ONNX INT8 y al runtime embebido.
- Alineamiento de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar cada token origen con su correspondiente destino, útil para generar ficheros de subtítulos sincronizados por palabra o por segmento.
- Traducción de documentación técnica ucraniana a francés en pipelines offline: el modelo es lo bastante pequeño (0,1 GB) para integrarse en flujos por lotes en CPU sin GPU.
- Preprocesado de datos para investigación en traducción de bajo recurso: sirve como línea base ligera para comparar con modelos mayores en el par uk-fr.
- Aplicaciones de accesibilidad: traducción en tiempo real de contenido ucraniano a francés en lectores de pantalla o asistentes de voz en dispositivos de gama baja.
- Prototipado rápido de servidores de traducción: al ser ONNX, se puede servir con ONNX Runtime Server o integrar en servicios ligeros sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo INT8 de 0,1 GB, requiere del orden de cientos de MB de RAM en CPU; no necesita GPU.
- GPU recomendadas: no aplica; está diseñado para CPU y dispositivos móviles. Cualquier GPU moderna podría ejecutarlo, pero no es su objetivo.
- Cabe en cualquier GPU de consumo, aunque no se aprovecha su capacidad; también en CPUs de móvil y Raspberry Pi.
- Opciones de despliegue: ONNX Runtime (runtime nativo de la app), ONNX Runtime Mobile, integración en Android vía NNAPI o ejecución pura en CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-fr-int8-shift-att | no disponible | no disponible | uk→fr | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-uk-fr | no disponible | no disponible | uk→fr | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk→en | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-fr | no disponible | no disponible | en→fr | Apache 2.0 | PyTorch/safetensors |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida adicional de alineamiento; el rendimiento de traducción debería ser equivalente al original, aunque no hay métricas publicadas que lo confirmen. Las alternativas uk-en y en-fr permitirían traducir vía pivot con inglés, con la penalización de dos pasos y posible pérdida de calidad.

## Limitaciones y advertencias

- No hay métricas de calidad (BLEU, chrF, COMET) publicadas para esta conversión ni para el modelo base en la información disponible; no se puede garantizar la calidad de traducción.
- La cuantización INT8 puede degradar ligeramente la calidad frente al modelo en punto flotante original; no se documenta el impacto.
- El modelo cubre solo el par ucraniano→francés; no traduce en sentido inverso ni a otros idiomas.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) por el tamaño reducido del modelo.
- Sesgos potenciales heredados de los corpus OPUS, que pueden infrarrepresentar variedades dialectales o registros coloquiales.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes; es un artefacto reciente y sin validación comunitaria.
- La salida de alineamiento es una `Identity` sobre una atención interna; su utilidad depende de que el consumidor interprete correctamente el tensor y el `alignment.json` asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-fr
- Paper de OPUS-MT: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- ONNX Runtime: https://onnxruntime.ai/
