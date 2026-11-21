# ukrbublik/opus-mt-tr-es-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-tr-es-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tr-es`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El autor de esta conversión es `ukrbublik`, que la publica para el runtime OPUS en el dispositivo de la aplicación Android Subtitle Tap. La tarea es traducción directa turco→español, sin pivote a través del inglés.

Arquitectura Marian (transformer encoder-decoder), con exportación mediante Optimum a opset 17 y sin past key/values, y cuantización dinámica INT8 de onnxruntime (QInt8, per-tensor). El repositorio pesa 0,1 GB, lo que refleja el tamaño compacto del modelo original y la reducción adicional por cuantización. Se distribuye bajo licencia Apache 2.0.

La particularidad técnica de esta conversión es que el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, implementada como una Identity de un nodo existente: los pesos y la decodificación no cambian. Esto permite obtener alineamientos palabra a palabra útiles para subtitulado, sin coste adicional en la inferencia. El modelo está pensado para traducción en local en Android, no para despliegues en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | turco (tr) → espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder estándar para traducción automática neuronal. El modelo original `Helsinki-NLP/opus-mt-tr-es` fue entrenado por el grupo OPUS-MT sobre datos del corpus OPUS. Esta conversión no modifica los pesos: solo cambia el formato (export ONNX con Optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 con onnxruntime. No hay información disponible sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación de esta versión es la salida `alignment_shift_l2`, que expone las probabilidades de atención encoder de la capa 2 del decoder como tensor adicional. Al ser una Identity sobre un nodo ya existente, el coste computacional es nulo y la calidad de traducción se mantiene idéntica a la del modelo sin esa salida. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del SentencePiece original mapeadas a IDs de vocabulario, más los strings del tokenizador destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa turco→español sin pivote por inglés.
- Generación de alineamientos de atención encoder (capa 2) mediante `alignment_shift_l2`, útiles para correspondencia palabra a palabra y subtitulado.
- Ejecución en dispositivo mediante onnxruntime con pesos INT8, orientada a móvil.
- Tokenizador SentencePiece empaquetado en JSON para uso en runtime propio.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo thinking.
- Cobertura multilingüe limitada exclusivamente al par tr→es.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos turcos a español en el propio dispositivo, con la ventaja de que `alignment_shift_l2` permite alinear cada palabra traducida con su origen para sincronizar tiempos.
- Traducción offline en movilidad: al ejecutarse con onnxruntime INT8 y un repositorio de 0,1 GB, funciona sin conexión en teléfonos de gama media, útil en viajes o entornos sin red.
- Preprocesado de contenido turco para audiencias hispanohablantes: traducción de reseñas, comentarios o mensajes de usuario en pipelines ligeros donde no se quiere depender de una API externa.
- Prototipado rápido de sistemas de traducción: sirve como baseline reproducible y de bajo coste para experimentos de traducción tr→es antes de escalar a modelos mayores.
- Investigación en alineamiento de atención: la salida `alignment_shift_l2` facilita estudiar correspondencias léxicas y evaluar técnicas de alineamiento sin modificar el modelo.
- Integración en aplicaciones de accesibilidad: traducción de texto turco a español en tiempo real en interfaces móviles con requisitos estrictos de privacidad, ya que los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de móvil y en GPUs de gama baja.
- GPU recomendadas: no requiere GPU; está diseñado para CPU mediante onnxruntime en Android. En servidor podría ejecutarse en cualquier CPU moderna o GPU consumer, pero no es su objetivo.
- Cabe en cualquier GPU consumer e incluso en CPU de teléfono; no se especifican requisitos mínimos.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-tr-es-int8-shift-att | no disponible | no disponible | tr→es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tr-es | no disponible | no disponible | tr→es | Apache 2.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-tc-big-tr-es | no disponible | no disponible | tr→es | Apache 2.0 | PyTorch/safetensors |
| Facebook NLLB-200 (variante destilada) | no disponible | no disponible | multilingüe | CC-BY-NC 4.0 (no comercial) | PyTorch |

La diferencia principal frente al modelo base es el formato: esta versión está cuantizada a INT8 y exportada a ONNX, con la salida de alineamiento añadida. Frente a alternativas multilingües como NLLB, la licencia Apache 2.0 permite uso comercial sin restricciones, a costa de cubrir solo un par de idiomas.

## Limitaciones y advertencias

- Solo traduce turco→español; no soporta otros pares ni traducción inversa.
- La cuantización INT8 puede introducir una ligera degradación de calidad frente al modelo original en fp32, aunque no se han publicado métricas que lo cuantifiquen.
- No hay información sobre sesgos del dataset OPUS subyacente; es probable que herede sesgos de dominio y de género presentes en corpus de subtítulos y web.
- Riesgo de alucinación y de traducciones literales en frases idiomáticas, como en cualquier modelo Marian de tamaño compacto.
- Longitud de contexto no documentada; el modelo original está pensado para frases y párrafos cortos, no para documentos largos.
- El formato ONNX sin past key/values implica recálculo del decoder en cada paso, lo que limita el throughput en secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (Tiedemann y Thottingal, 2020) según indica la model card.
- No apto para producción en servidor de alta concurrencia sin evaluación previa; está optimizado para inferencia en dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-tr-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-es
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
