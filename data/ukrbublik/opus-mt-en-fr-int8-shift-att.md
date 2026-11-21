# ukrbublik/opus-mt-en-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-en-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-fr`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Resuelve la traducción directa de inglés a francés sin pivotar por una lengua intermedia, algo relevante para aplicaciones que necesitan traducción en dispositivo con latencia baja y sin dependencia de servicios en la nube.

La conversión está pensada para el motor OPUS runtime de la aplicación Android Subtitle Tap, que ejecuta la inferencia de forma local. Se exporta con optimum a opset 17 sin past key/values y se cuantiza dinámicamente con onnxruntime a QInt8 por tensor. Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del layer 2, útil para alinear tokens origen-destino en subtítulos.

El repositorio pesa aproximadamente 0,1 GB y la licencia es Apache 2.0, heredada del modelo base. No se han publicado métricas de calidad en la información disponible; el interés del modelo es fundamentalmente de despliegue (formato ONNX, INT8, salida de alineamiento) más que de mejora de capacidades lingüísticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo Marian estándar de OPUS-MT) |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de la familia Marian, base del proyecto OPUS-MT. El modelo original fue entrenado por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS, y esta versión no modifica pesos ni decodificación: solo cambia el formato. La exportación se realizó con optimum a opset 17 y sin past key/values, lo que implica que la decodificación no reutiliza caché de atención entre pasos y puede afectar al rendimiento en secuencias largas.

La cuantización es dinámica INT8 por tensor mediante onnxruntime. El decoder incorpora una salida adicional, `alignment_shift_l2`, que es una identidad sobre un nodo existente y expone las probabilidades de atención encoder del layer 2. Esta salida permite construir alineamientos token a token sin alterar el comportamiento del modelo. El repositorio incluye `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario, y `alignment.json`, que vincula la salida de alineamiento con el SHA-256 del decoder. No se dispone de información sobre el número de tokens de entrenamiento ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Traducción directa inglés a francés, sin pivotar por una tercera lengua.
- Generación de alineamientos de atención encoder (layer 2) mediante la salida `alignment_shift_l2`.
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` para uso en runtime propio.
- Inferencia en dispositivo mediante ONNX Runtime con pesos INT8.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada a los dos idiomas del par en→fr.

## Casos de uso

- Subtitulado en tiempo real en Android: la aplicación Subtitle Tap puede traducir subtítulos en inglés a francés en el propio dispositivo gracias al formato ONNX INT8 y al runtime OPUS, sin enviar texto a servidores externos.
- Alineamiento de subtítulos bilingües: la salida `alignment_shift_l2` permite asociar cada token traducido con su token origen, útil para resaltar la correspondencia en interfaces de aprendizaje de idiomas o para sincronizar pistas.
- Traducción offline en movilidad: al no requerir conexión, el modelo sirve para aplicaciones de viaje o entornos con conectividad limitada donde se traduce texto en inglés a francés.
- Preprocesado de corpus: se puede usar para generar traducciones automáticas de documentación o textos en inglés hacia francés en pipelines por lotes con ONNX Runtime.
- Prototipado de motores de traducción embebidos: sirve como referencia para integrar Marian cuantizado en aplicaciones nativas o en entornos con recursos restringidos.
- Evaluación de cuantización INT8: útil para comparar la calidad y la latencia de la versión cuantizada frente al modelo original en flotante en tareas de traducción en→fr.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa unos 0,1 GB, por lo que la huella en memoria es muy reducida y compatible con dispositivos móviles.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y a ejecución en dispositivo mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-fr-int8-shift-att | Marian transformer, INT8 ONNX | en→fr | ONNX | Apache 2.0 | no disponible |
| Helsinki-NLP/opus-mt-en-fr | Marian transformer | en→fr | safetensors/PyTorch | Apache 2.0 | no disponible |
| Helsinki-NLP/opus-mt-en-ROMANCE | Marian transformer | en→lenguas romances | safetensors/PyTorch | Apache 2.0 | no disponible |

La diferencia principal frente al modelo base es el formato (ONNX INT8) y la salida de alineamiento; no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo traduce de inglés a francés; no cubre otras direcciones ni otros idiomas.
- La cuantización INT8 puede introducir una pérdida de calidad respecto al modelo en flotante; no se han publicado evaluaciones al respecto.
- La exportación sin past key/values puede penalizar la latencia en secuencias largas.
- Riesgo de alucinación y de errores en terminología especializada, inherente a los modelos de traducción neuronales.
- Sesgos potenciales heredados de los datos OPUS del modelo base; no se documentan análisis de sesgo específicos.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda mantener la atribución a los autores originales (Tiedemann y Thottingal, 2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
