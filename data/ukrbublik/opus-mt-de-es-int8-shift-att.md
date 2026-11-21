# ukrbublik/opus-mt-de-es-int8-shift-att

## Resumen

`ukrbublik/opus-mt-de-es-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-de-es`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El repositorio lo publica el usuario ukrbublik y su propósito es servir como motor de traducción alemán→español en local dentro de la aplicación Android Subtitle Tap, sin depender de servicios en la nube ni de un pivote a través del inglés.

El modelo mantiene la arquitectura Marian original (transformer encoder-decoder) y añade una salida auxiliar de alineación: el decoder expone `alignment_shift_l2`, las probabilidades de atención encoder del nivel 2, que permiten mapear tokens de origen y destino. Esta funcionalidad resulta útil para subtitulado, donde la alineación entre segmentos es tan importante como la traducción.

El repositorio es pequeño (0,1 GB) y está pensado para inferencia en dispositivo con onnxruntime. La licencia es Apache 2.0 y los únicos cambios respecto al modelo base son el formato (export ONNX, opset 17) y la cuantización dinámica INT8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | alemán (de), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es una conversión del Marian de OPUS-MT, un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; la model card solo indica que los pesos originales son de Helsinki-NLP y que se entrenaron con datos OPUS.

La innovación técnica del repositorio no está en el entrenamiento, sino en el empaquetado para inferencia en dispositivo: exportación con optimum a ONNX (opset 17, sin caché de claves/valores), cuantización dinámica INT8 con onnxruntime y una salida adicional `alignment_shift_l2` que es una identidad sobre un nodo existente del decoder, de modo que los pesos y la decodificación no cambian. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece mapeadas a ids de vocabulario y cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineación con el SHA-256 del decoder.

## Capacidades

- Traducción directa alemán→español sin pivote por inglés.
- Generación de alineaciones encoder-decoder a nivel de capa 2 (`alignment_shift_l2`), útiles para correspondencia entre tokens.
- Tokenizador SentencePiece empaquetado en JSON para uso en runtime propio.
- Inferencia en dispositivo mediante onnxruntime, sin dependencias de servidor.
- Soporte de dos idiomas únicamente (de, es).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap usa el modelo para traducir subtítulos alemán→español en el dispositivo; la salida de alineación permite sincronizar segmentos de origen y destino sin llamadas a red.
- Traducción offline en dispositivos móviles: al ser un modelo de 0,1 GB en INT8, puede ejecutarse con onnxruntime en teléfonos sin conexión, útil en entornos con conectividad limitada.
- Preprocesado de corpus alemán: traducción por lotes de documentos o transcripciones al español para su posterior análisis, con la ventaja de no enviar datos a terceros.
- Aplicaciones de accesibilidad: conversión de audio o texto alemán a español para usuarios hispanohablantes en contextos donde la latencia de red es crítica.
- Integración en pipelines de subtitulado profesional: la alineación por capas permite generar ficheros bilingües con correspondencia aproximada entre líneas.
- Prototipado de sistemas de traducción embebidos: sirve como referencia para evaluar el rendimiento de Marian cuantizado en INT8 frente a versiones en FP32 en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo pequeño que cabe holgadamente en memoria de dispositivo móvil.
- GPU recomendadas: no disponible; el modelo está pensado para CPU y onnxruntime en Android.
- Compatibilidad con GPU de consumo: no disponible; por tamaño, es probable que quepa en cualquier GPU de consumo, pero no hay datos publicados.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se incluyen pesos GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-es-int8-shift-att | no disponible | no disponible | de, es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-de-es | no disponible | no disponible | de, es | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en, es | Apache 2.0 | safetensors/PyTorch |

La comparación directa con el modelo base es la más relevante: comparten pesos, pero este repositorio añade cuantización INT8, export ONNX y la salida de alineación. Frente a `opus-mt-en-es`, la diferencia principal es el par de idiomas y la ausencia de pivote por inglés en este modelo.

## Limitaciones y advertencias

- Solo traduce alemán→español; no admite otros pares de idiomas.
- No se han publicado métricas de calidad (BLEU, COMET) para esta conversión INT8; la cuantización puede degradar ligeramente la calidad respecto al modelo original en FP32.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, legal, médico), habitual en modelos Marian de tamaño reducido.
- Sesgos heredados de los datos OPUS, que pueden reflejar desequilibrios de género, registro o dominio.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Helsinki-NLP y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- No incluye pesos en safetensors ni GGUF; la integración requiere onnxruntime o una conversión adicional.
- La salida de alineación es una identidad sobre un nodo existente; su semántica exacta depende de la implementación del decoder y debe validarse en cada caso de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-es
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", EAMT 2020.
