# ukrbublik/opus-mt-ro-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-ro-fr-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-ro-fr`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Resuelve la traducción directa rumano→francés sin pivotar por inglés, y su interés actual radica en que está empaquetado para inferencia en dispositivo (on-device) en Android, con un runtime ligero y salida adicional de alineamiento encoder-decoder.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder clásico de traducción neuronal. El repositorio no introduce cambios en pesos ni en decodificación: solo modifica el formato (export a ONNX opset 17 sin past key/values), aplica cuantización dinámica INT8 por tensor (QInt8) con onnxruntime y añade una salida `alignment_shift_l2` que expone las probabilidades de atención encoder del nivel 2 del decoder mediante una operación Identity sobre un nodo existente.

El paquete incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario, más las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder. El tamaño del repositorio es de aproximadamente 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | rumano (ro) → frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de traducción neuronal de la familia Marian, derivado de `Helsinki-NLP/opus-mt-ro-fr` (revisión `d8e852da5392b00ffa105973795f667681cb54f7`). Los pesos originales fueron entrenados por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki sobre datos del corpus OPUS. Este repositorio no reentrena ni ajusta el modelo: únicamente exporta a ONNX (opset 17) y cuantiza dinámicamente a INT8 con onnxruntime.

La innovación técnica del paquete es doble. Por un lado, la exportación elimina el uso de past key/values, lo que simplifica el grafo para runtimes móviles. Por otro, el decoder emite una salida adicional `alignment_shift_l2` que corresponde a las probabilidades de atención encoder de la capa 2, implementada como una operación Identity sobre un nodo ya existente; los pesos y el proceso de decodificación permanecen inalterados. Esto permite obtener alineamientos palabra a palabra sin coste computacional adicional, algo útil para subtitulado. El fichero `alignment.json` actúa como recibo criptográfico que ata esa salida al SHA-256 del decoder.

## Capacidades

- Traducción automática directa rumano→francés, sin pivotar por inglés.
- Generación de alineamientos de atención encoder-decoder (capa 2) para correspondencia entre tokens origen y destino.
- Inferencia en dispositivo (on-device) en Android mediante el runtime OPUS de la app Subtitle Tap.
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` con mapeo de piezas y puntuaciones a ids.
- Ejecución con onnxruntime en modo cuantizado INT8.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente al par ro→fr.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap usa el modelo en el dispositivo para traducir subtítulos de rumano a francés sin conexión, aprovechando el runtime OPUS y la cuantización INT8 para reducir el consumo de memoria y batería.
- Traducción offline en dispositivos de gama baja: al estar cuantizado a INT8 y exportado a ONNX sin past key/values, el grafo es adecuado para ejecutarse en móviles sin acelerador dedicado.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite mapear tokens origen y destino, útil para sincronizar pistas de subtítulos en dos idiomas o para revisión humana de traducciones.
- Procesamiento por lotes de documentos rumanos hacia francés en pipelines ligeros: el tamaño reducido del repositorio (≈0,1 GB) facilita el despliegue en contenedores pequeños con onnxruntime.
- Integración en aplicaciones de accesibilidad o lectura: traducción de texto rumano a francés en tiempo real dentro de apps móviles sin depender de servicios en la nube.
- Evaluación de pipelines de cuantización: sirve como referencia para medir la pérdida de calidad de un modelo Marian al pasar de FP32 a INT8 dinámico en un par de idiomas concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa ≈0,1 GB, por lo que el modelo cuantizado INT8 cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y ejecución on-device (Android) con onnxruntime.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio; no se dispone de cifras exactas de parámetros.
- Opciones de despliegue: onnxruntime (runtime OPUS de la app Subtitle Tap); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ro-fr-int8-shift-att | no disponible | no disponible | ro→fr | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-ro-fr (base) | no disponible | no disponible | ro→fr | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT del par ro→fr | no disponible | no disponible | ro→fr | Apache 2.0 | variable |

La comparación principal es con su modelo base `Helsinki-NLP/opus-mt-ro-fr`: misma arquitectura y pesos, pero el base está en formato PyTorch y este en ONNX INT8 con salida de alineamiento. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre el par rumano→francés; no es un modelo multilingüe general.
- Al ser una cuantización INT8 dinámica, puede existir una pérdida de calidad respecto al modelo original en FP32, aunque no se han publicado métricas que la cuantifiquen.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos NMT, especialmente en dominios especializados o con frases muy largas.
- No se documentan sesgos específicos, pero los modelos entrenados sobre OPUS heredan los sesgos de los corpus de origen.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El modelo está empaquetado para un runtime concreto (OPUS runtime de Subtitle Tap); su uso fuera de ese ecosistema requiere adaptar la carga de los ficheros ONNX y del tokenizador.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas más allá de la traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ro-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ro-fr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- onnxruntime: https://github.com/microsoft/onnxruntime
- Optimum (export ONNX): https://github.com/huggingface/optimum
