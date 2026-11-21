# ukrbublik/opus-mt-en-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-sv-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-sv`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de inglés a sueco, sin pivote intermedio por el inglés, y está pensado para ejecutarse en dispositivos Android dentro de la aplicación Subtitle Tap.

La aportación de este repositorio no es el entrenamiento, sino el formato: exporta el modelo Marian original a ONNX (opset 17, sin past key/values), aplica cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor) y añade una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder del decodificador en la capa 2. Los pesos y el proceso de decodificación no se modifican; solo se añade una identidad sobre un nodo existente.

Es relevante para desarrolladores que necesiten traducción EN→SV en el dispositivo, con un peso de repositorio de aproximadamente 0,1 GB, licencia Apache 2.0 y sin dependencia de servicios en la nube. No hay métricas de calidad publicadas en este repositorio; la calidad hereda la del modelo base OPUS-MT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, la arquitectura transformer encoder-decoder empleada por OPUS-MT, entrenado por la Universidad de Helsinki sobre datos OPUS (corpus paralelos de traducción). El repositorio de `ukrbublik` no reentrena ni ajusta los pesos: parte de la revisión `cec444c9ac08a87fcfcd172f2e6be8e112fda53c` de `Helsinki-NLP/opus-mt-en-sv` y realiza una exportación con optimum a ONNX (opset 17) sin past key/values, seguida de cuantización dinámica INT8.

La innovación técnica específica es la salida `alignment_shift_l2`: el decodificador emite además las probabilidades de atención encoder de la capa 2, implementadas como una identidad sobre un nodo ya existente, de modo que los pesos y la decodificación permanecen intactos. El repositorio incluye también `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece mapeadas a ids de vocabulario, más las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decodificador. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO.

## Capacidades

- Traducción automática directa inglés → sueco, sin pivote por el inglés.
- Generación de alineaciones de atención encoder (capa 2) a través de `alignment_shift_l2`, útil para mapear tokens origen-destino.
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` para uso autocontenido en runtime.
- Ejecución en dispositivo mediante ONNX Runtime (cuantización INT8 dinámica).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Cobertura multilingüe limitada a los dos idiomas del par (en, sv).

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap integra este modelo para traducir subtítulos EN→SV en el dispositivo, sin enviar texto a servidores, gracias al runtime ONNX INT8 y al peso reducido del repositorio (~0,1 GB).
- Traducción offline en aplicaciones móviles: al no requerir conexión, es adecuado para apps de viaje, lectura o documentación que deban funcionar sin red y con latencia baja.
- Alineación de tokens para subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar segmentos origen y destino, útil para resaltar la correspondencia entre líneas de subtítulo.
- Preprocesado de contenido en pipelines locales: traducción de textos cortos (interfaces, notificaciones, metadatos) en herramientas de escritorio o móviles con ONNX Runtime.
- Prototipado de sistemas NMT embebidos: sirve como referencia de exportación optimum + cuantización INT8 para quien quiera replicar el flujo con otros pares de idiomas OPUS-MT.
- Evaluación de calidad de traducción en entornos sin GPU: el tamaño reducido y el formato ONNX permiten ejecutar pruebas en CPU y en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa ~0,1 GB, por lo que la huella en memoria es reducida y cabe en CPU.
- GPU recomendadas: no se especifican; al ser un modelo Marian de tamaño base con INT8, no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, aunque no se documentan requisitos mínimos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-sv-int8-shift-att` | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Hugging Face |
| `Helsinki-NLP/opus-mt-en-sv` (base) | no disponible | no disponible | PyTorch/safetensors | Apache 2.0 | Hugging Face |
| Otros OPUS-MT en→sv (p. ej. variantes Tatoeba) | no disponible | no disponible | PyTorch | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a otras variantes OPUS-MT del mismo par, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre el par inglés → sueco; no traduce en sentido inverso ni a otros idiomas.
- Al ser una conversión de formato, hereda los sesgos y errores del modelo base OPUS-MT, entrenado sobre corpus OPUS.
- Riesgo de alucinación y de traducciones literales en dominios especializados (técnico, legal, médico) no bien representados en los datos de entrenamiento.
- No se documentan métricas de calidad (BLEU, COMET) para esta conversión INT8; la cuantización puede introducir una degradación menor respecto al modelo en precisión completa, no cuantificada aquí.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio está pensado para un runtime concreto (Subtitle Tap / ONNX Runtime); su integración en otros stacks requiere adaptar el manejo de `tokenizer_runtime.json` y de la salida de alineación.
- No hay descargas ni likes registrados, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-sv
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Repositorio OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
- ONNX Runtime: https://onnxruntime.ai/
- optimum (exportación ONNX): https://github.com/huggingface/optimum
