# ukrbublik/opus-mt-nl-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-nl-sv-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-nl-sv`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del neerlandés (nl) al sueco (sv) sin pivotar a través del inglés, y esta versión concreta está pensada para ejecución en dispositivo (on-device) en la aplicación Android Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq típico de la familia OPUS-MT, con un tamaño de repo de 0,1 GB que refleja un modelo compacto orientado a inferencia ligera. La conversión emplea el exportador de Optimum (opset 17, sin past key/values) y cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor), lo que reduce el peso y acelera la inferencia en CPU.

La particularidad técnica de esta variante es que el decoder emite además una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del layer 2, pensada para alineación de subtítulos. Es relevante ahora porque demuestra un patrón de despliegue de traducción neuronal en móvil: modelo pequeño, formato ONNX cuantizado, tokenizador empaquetado en JSON y artefacto de alineación verificable por hash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime; export ONNX opset 17 |
| Idiomas soportados | neerlandés (nl) como origen, sueco (sv) como destino |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json` + `alignment.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-nl-sv` es un Marian NMT, un transformer seq2seq con encoder y decoder estándar entrenado sobre datos del corpus OPUS (colecciones de textos paralelos multilingües). No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos modelos OPUS-MT se entrenan habitualmente con objetivos de traducción supervisada clásicos.

Esta conversión concreta no reentrena pesos: solo cambia el formato. Se exporta con Optimum a ONNX (opset 17) sin past key/values, se cuantiza dinámicamente a INT8 con onnxruntime y se añade una salida extra en el decoder, `alignment_shift_l2`, que expone las probabilidades de atención encoder del layer 2 mediante una operación Identity sobre un nodo existente. Según la model card, los pesos y la decodificación no se alteran; el único cambio funcional es la exposición de esa señal de alineación. El tokenizador SentencePiece original se reempaqueta en `tokenizer_runtime.json` (piezas, scores y strings objetivo mapeados a ids), y `alignment.json` actúa como recibo que liga la salida de alineación al SHA-256 del decoder.

## Capacidades

- Traducción automática directa neerlandés a sueco, sin pivotar por inglés.
- Emisión de probabilidades de atención encoder del layer 2 (`alignment_shift_l2`) para alineación palabra a palabra, útil en subtitulado.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8, orientada a CPU y entornos móviles.
- Tokenizador empaquetado en JSON para integración en runtimes ligeros sin dependencias de SentencePiece nativo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Modelo monolingüe de par (nl→sv); no se documenta soporte multilingüe adicional.

## Casos de uso

- Subtitulado automático nl→sv en Android: la salida `alignment_shift_l2` permite alinear cada token traducido con su origen, lo que facilita la generación de subtítulos sincronizados en la app Subtitle Tap sin conexión.
- Traducción offline en dispositivos móviles: al ser un modelo de 0,1 GB en INT8 ONNX, puede ejecutarse con onnxruntime en el propio teléfono, eliminando la dependencia de red y protegiendo la privacidad del texto.
- Procesamiento por lotes de documentos neerlandeses a sueco en servidores sin GPU: la cuantización INT8 reduce requisitos de memoria y permite servir traducción en CPU con coste bajo.
- Preprocesado multilingüe en pipelines de datos: traducción de contenido nl a sv para normalizar corpus antes de indexación o análisis.
- Herramientas de accesibilidad: traducción en tiempo real de contenido neerlandés a sueco en lectores de pantalla o interfaces de asistencia.
- Integración en runtimes embebidos (dispositivos edge, Raspberry Pi): el formato ONNX y el tokenizador JSON simplifican el despliegue en entornos sin stack Python completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. El repo pesa 0,1 GB, por lo que la huella de memoria en INT8 es del orden de decenas o pocos cientos de MB, aunque no se especifica cifra exacta.
- GPU recomendadas: no se documentan; al ser ONNX INT8 para on-device, el objetivo es CPU (incluido ARM en Android).
- Cabe en GPU consumer: previsiblemente sí dado su tamaño, pero no se aportan datos de rendimiento en GPU.
- Opciones de despliegue: onnxruntime (principal, con soporte de cuantización dinámica INT8); también podría usarse vLLM o llama.cpp solo si se reconvirtiera, lo cual no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-nl-sv-int8-shift-att | no disponible | no disponible | ONNX INT8 | apache-2.0 | Variante con salida de alineación para subtítulos |
| Helsinki-NLP/opus-mt-nl-sv | no disponible | no disponible | safetensors (transformers) | apache-2.0 | Modelo base original, sin cuantizar ni salida de alineación |
| Otros OPUS-MT nl→X | no disponible | no disponible | safetensors | apache-2.0 | Familia de traducción de pares; comparación de rendimiento no disponible |

## Limitaciones y advertencias

- Modelo de par único nl→sv; no traduce otros idiomas ni direcciones inversas.
- Sesgos: al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de representación de los textos paralelos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación en traducción: como todo modelo NMT, puede generar traducciones plausibles pero incorrectas en frases ambiguas o de dominio especializado.
- Longitud de contexto no documentada; no se garantiza buen comportamiento en documentos largos sin segmentación.
- La salida `alignment_shift_l2` corresponde solo a la atención del layer 2, no a una alineación completa ni calibrada; su utilidad depende del postprocesado del consumidor.
- Licencia apache-2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020) y el aviso de licencia.
- El artefacto `alignment.json` liga la alineación a un SHA-256 concreto del decoder; si se modifica o recuantiza el modelo, esa verificación deja de ser válida.
- No hay datos publicados de calidad (BLEU, chrF) para esta variante cuantizada; la cuantización INT8 puede degradar ligeramente la calidad respecto al modelo base en fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-nl-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-sv
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): referencia citada en la model card; enlace no disponible en la información proporcionada.
- Repositorio del proyecto OPUS-MT: no disponible en la información proporcionada.
- App Subtitle Tap: mencionada en la model card; enlace no disponible.
