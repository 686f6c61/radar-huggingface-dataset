# ukrbublik/opus-mt-fr-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-sv-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-fr-sv`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de francés a sueco, sin pivotar por inglés, y está pensado para ejecución en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap.

Se trata de un transformer encoder-decoder de arquitectura Marian, exportado con Optimum a ONNX (opset 17, sin past key/values) y cuantizado dinámicamente a INT8 con onnxruntime (QInt8, per-tensor). La modificación respecto al modelo base es exclusivamente de formato: no se han reentrenado pesos ni alterado la decodificación. La particularidad técnica es que el decodificador expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2, útil para alinear subtítulos con el audio de origen.

El repositorio es de tamaño reducido (0,1 GB) e incluye los grafos ONNX cuantizados, un `tokenizer_runtime.json` con las piezas SentencePiece mapeadas a identificadores y un `alignment.json` que vincula la salida de alineación con el SHA-256 del decodificador. Es relevante para quienes necesitan traducción fr→sv de baja latencia y sin conexión en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | frances (fr), sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |
| Modelo base | Helsinki-NLP/opus-mt-fr-sv (revision `8160701e449d00ee8e9bd3166ff447631c58b890`) |
| Opset ONNX | 17 |
| Salidas adicionales | `alignment_shift_l2` (probabilidades de atencion encoder, capa 2) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq diseñado para traducción automática neuronal, entrenado originalmente por el equipo de Helsinki sobre datos del corpus OPUS. El modelo base `Helsinki-NLP/opus-mt-fr-sv` fue entrenado como parte del proyecto OPUS-MT para construir servicios de traducción abiertos. Esta conversión no introduce cambios en los pesos ni en el proceso de entrenamiento: solo aplica exportación a ONNX con Optimum (opset 17, sin past key/values) y cuantización dinámica INT8 con onnxruntime.

La innovación técnica de este repositorio es la exposición de la salida `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder de la capa 2 del decodificador. Se implementa como una Identity sobre un nodo ya existente, de modo que los pesos y la decodificación permanecen inalterados. Esta señal permite alinear tokens de origen y destino, algo útil para subtitulado. El archivo `alignment.json` actúa como recibo que vincula esa salida al hash SHA-256 del decodificador. No se documentan en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Traducción automática directa de francés a sueco, sin pivotar por inglés.
- Exposición de probabilidades de atención encoder (capa 2) mediante `alignment_shift_l2`, para alineación de tokens origen-destino.
- Ejecución en dispositivo mediante ONNX Runtime con cuantización INT8.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` con piezas, puntuaciones y mapeo a identificadores de vocabulario.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par fr→sv.

## Casos de uso

- Subtitulado en dispositivo: la salida `alignment_shift_l2` permite alinear subtítulos traducidos con el audio original, y el formato ONNX INT8 facilita la ejecución local en la app Subtitle Tap sin conexión.
- Traducción offline en aplicaciones Android: el modelo cabe en un repositorio de 0,1 GB y se ejecuta con onnxruntime, adecuado para dispositivos con recursos limitados.
- Traducción de documentación fr→sv en pipelines ligeros: al ser un modelo directo sin pivot, reduce pasos y latencia frente a cadenas fr→en→sv.
- Procesamiento por lotes de textos breves: la cuantización INT8 reduce el coste computacional en servidores sin GPU dedicada.
- Integración en herramientas de accesibilidad: traducción de subtítulos en tiempo real para usuarios francófonos que consumen contenido en sueco.
- Prototipado de sistemas de traducción embebidos: sirve como referencia para exportar y cuantizar otros modelos OPUS-MT con salidas de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo cuantizado es muy ligero.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en CPU/dispositivo mediante onnxruntime.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido, aunque no se documentan requisitos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-sv-int8-shift-att | no disponible | no disponible | fr→sv | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-fr-sv (base) | no disponible | no disponible | fr→sv | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-sv | no disponible | no disponible | en→sv | Apache 2.0 | safetensors/PyTorch |

El modelo se distingue de su base por el formato ONNX INT8 y la salida de alineación; frente a alternativas con pivot por inglés, ofrece traducción directa fr→sv. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo cubre el par francés→sueco; no es un modelo multilingüe general.
- No se documentan evaluaciones de sesgo ni de calidad de traducción en esta conversión.
- Riesgo de alucinación y errores de traducción inherentes al modelo base Marian; no se han publicado métricas (BLEU, COMET) en la información disponible.
- La cuantización INT8 puede introducir una ligera degradación de calidad respecto al modelo en punto flotante; no se cuantifica en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe mantenerse la atribución al equipo de Helsinki (Tiedemann y Thottingal, 2020).
- La salida `alignment_shift_l2` es una Identity sobre un nodo existente; su estabilidad depende del grafo exportado y del hash registrado en `alignment.json`.
- No se documentan limitaciones de longitud de contexto ni de idioma más allá del par indicado.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-sv
- Proyecto OPUS-MT: https://opus.nlpl.eu/opus-mt.php
- Paper de referencia (Tiedemann y Thottingal, 2020, EAMT): no disponible como enlace directo en la información proporcionada.
