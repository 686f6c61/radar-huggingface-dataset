# ukrbublik/opus-mt-en-lt-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-en-lt-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-en-lt`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Resuelve la traducción directa de inglés a lituano sin pivotar por una lengua intermedia, y su propósito principal es el despliegue en dispositivos móviles dentro de la aplicación Android Subtitle Tap.

La aportación técnica del autor de la conversión (ukrbublik) no es el entrenamiento del modelo, sino el cambio de formato: exportación con Optimum a ONNX (opset 17, sin past key/values), cuantización dinámica INT8 con ONNX Runtime (QInt8, per-tensor) y la exposición de una salida adicional de alineación (`alignment_shift_l2`) que emite las probabilidades de atención encoder-decoder de la capa 2, útil para alinear tokens origen y destino en subtítulos.

Se trata de un modelo compacto (repo de 0,4 GB) pensado para inferencia en el borde, con licencia CC-BY-4.0 que permite uso comercial con atribución. Su relevancia radica en que demuestra un patrón de empaquetado reproducible para traductores OPUS en producción móvil, incluyendo un tokenizador runtime en JSON y un recibo de integridad (`alignment.json`) que vincula la salida de alineación al hash SHA-256 del decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX; pesos originales del modelo base en fp32 |
| Idiomas soportados | en (inglés), lt (lituano) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder clásico para traducción automática neuronal, en la variante `tc-big` del proyecto OPUS-MT. El modelo original fue entrenado por la Universidad de Helsinki sobre datos OPUS (corpus paralelos multilingües de acceso abierto). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden al modelo base y no se documentan en esta conversión.

La innovación de esta ficha concreta reside en el pipeline de exportación y despliegue: exportación con Optimum a ONNX en opset 17 sin past key/values (lo que implica recálculo completo del decoder en cada paso, adecuado para secuencias cortas de subtítulos), cuantización dinámica INT8 de ONNX Runtime con esquema QInt8 per-tensor, y la adición de una salida `alignment_shift_l2` que es una identidad sobre un nodo existente del grafo, exponiendo las probabilidades de atención encoder-decoder de la capa 2 sin alterar pesos ni decodificación. El tokenizador se sirve como `tokenizer_runtime.json` con las piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, y `alignment.json` actúa como recibo de integridad ligando la salida de alineación al SHA-256 del decoder.

## Capacidades

- Traducción automática directa inglés → lituano, sin pivotar por una lengua intermedia.
- Generación de subtítulos y texto traducido en dispositivos de borde gracias al formato ONNX INT8.
- Salida de alineación de atención (`alignment_shift_l2`, capa 2) para correspondencia aproximada entre tokens origen y destino.
- Tokenizador runtime autocontenido en JSON (SentencePiece mapeado a ids).
- Verificación de integridad del decoder mediante hash SHA-256 documentado en `alignment.json`.
- Inferencia con ONNX Runtime, sin dependencia de frameworks de deep learning pesados.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap integra este modelo para traducir subtítulos en inglés a lituano en el dispositivo, aprovechando el formato ONNX INT8 y la ausencia de past key/values para secuencias cortas.
- Traducción de documentación técnica en lote: al ser un modelo directo en→lt, se puede ejecutar en servidores modestos con ONNX Runtime para traducir manuales o notas de versión sin infraestructura GPU.
- Alineación de corpus bilingües: la salida `alignment_shift_l2` permite generar correspondencias aproximadas token a token para construir memorias de traducción o evaluar calidad a nivel de palabra.
- Traducción offline en entornos sin conectividad: el tamaño reducido (0,4 GB) y la cuantización INT8 permiten empaquetar el modelo en aplicaciones de escritorio o móviles que operan sin red.
- Preprocesado multilingüe en pipelines de datos: traducción de contenido en inglés a lituano antes de indexación o análisis, con verificación de integridad del decoder vía `alignment.json`.
- Prototipado de traductores OPUS en producción: sirve como plantilla reproducible para exportar y cuantizar otros pares de idiomas del proyecto OPUS-MT con el mismo esquema de tokenizador runtime y recibo de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,4 GB, por lo que el modelo cuantizado INT8 cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no se especifican; al ser un modelo Marian compacto en INT8, es viable en CPU y en GPUs de gama baja.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, aunque no se documentan cifras concretas.
- Opciones de despliegue: ONNX Runtime (runtime objetivo del autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-lt-int8-shift-att | no disponible | no disponible | en→lt | CC-BY-4.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tc-big-en-lt (base) | no disponible | no disponible | en→lt | CC-BY-4.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT en→lt | no disponible | no disponible | en→lt | CC-BY-4.0 | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la diferencia principal documentada es el formato (ONNX INT8 con salida de alineación frente a pesos PyTorch del modelo base).

## Limitaciones y advertencias

- El modelo solo cubre el par inglés → lituano; no soporta otras direcciones ni lenguas intermedias.
- La cuantización INT8 dinámica puede introducir una degradación de calidad respecto al modelo base en fp32; no se documenta la magnitud de esa pérdida.
- La ausencia de past key/values implica recálculo completo del decoder en cada paso, lo que penaliza secuencias largas; está pensado para subtítulos cortos.
- La salida de alineación es una identidad sobre la atención de la capa 2, por lo que es una aproximación, no una alineación word-level garantizada.
- Riesgo de alucinación y sesgos heredados del corpus OPUS y del entrenamiento original; no se documentan evaluaciones de sesgo.
- Uso comercial permitido bajo CC-BY-4.0, pero exige atribución a los autores originales (Tiedemann y Thottingal, 2020) y al proyecto OPUS-MT.
- No se documentan requisitos de contexto máximo ni comportamiento con entradas muy largas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera de la app del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-lt-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-lt
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
