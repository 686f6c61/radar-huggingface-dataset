# ukrbublik/opus-mt-uk-pt-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-pt-int8-shift-att` es una conversión del modelo de traducción automática `Helsinki-NLP/opus-mt-uk-pt` (ucraniano a portugués) de la familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki. Esta versión, publicada por el usuario ukrbublik, no modifica los pesos originales: se limita a exportar el modelo a formato ONNX, cuantizarlo a INT8 y añadir una salida auxiliar de alineación de atención pensada para la aplicación Android Subtitle Tap.

El modelo resuelve la traducción directa entre ucraniano y portugués sin pivotar por el inglés, lo que reduce la acumulación de errores de traducción indirecta y el coste computacional. Está pensado para inferencia en dispositivo (*on-device*), de ahí su tamaño reducido (repo de 0,1 GB) y su formato ONNX cuantizado.

Es relevante por su carácter práctico: demuestra cómo adaptar un modelo Marian de traducción a un runtime móvil con ONNX Runtime, cuantización dinámica INT8 y una salida de alineación que permite sincronizar subtítulos con el audio de origen. La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, aunque no se especifica el número exacto de parámetros en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | ucraniano (uk), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, la arquitectura estándar de la familia OPUS-MT: un transformer encoder-decoder con atención multi-cabeza, entrenado sobre datos paralelos del corpus OPUS. El modelo original fue desarrollado por Jörg Tiedemann y Santhosh Thottingal (Universidad de Helsinki) y publicado bajo licencia Apache 2.0. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La conversión de este repositorio introduce dos cambios técnicos concretos. Primero, la exportación a ONNX con opset 17 y sin past key/values, es decir, un decoder sin caché de estados, lo que simplifica el grafo pero implica recalcular la atención completa en cada paso de decodificación. Segundo, la cuantización dinámica INT8 por tensor mediante ONNX Runtime, que reduce el peso del modelo a aproximadamente 0,1 GB. Además, el decoder expone una salida auxiliar `alignment_shift_l2` que corresponde a las probabilidades de atención encoder del segundo layer; según la model card, se trata de un nodo Identity sobre una salida ya existente, por lo que los pesos y la decodificación no cambian. Esta salida permite obtener alineaciones token a token para sincronización de subtítulos.

## Capacidades

- Traducción automática directa ucraniano a portugués, sin pivotar por inglés.
- Generación de alineaciones de atención (capa 2 del decoder) mediante la salida `alignment_shift_l2`, útil para sincronizar texto traducido con el texto de origen.
- Inferencia en dispositivo mediante ONNX Runtime, con pesos cuantizados a INT8.
- Tokenizador empaquetado en `tokenizer_runtime.json`, con las piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario.
- Integridad verificable: `alignment.json` vincula la salida de alineación con el SHA-256 del decoder.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo puramente de traducción.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap usa el modelo para traducir subtítulos de ucraniano a portugués en el propio dispositivo, sin conexión y sin enviar texto a servidores externos, gracias al formato ONNX INT8 y a su reducido tamaño.
- Sincronización de subtítulos con audio: la salida `alignment_shift_l2` permite alinear cada token traducido con su token de origen, lo que facilita el ajuste temporal de los subtítulos al audio original.
- Traducción de documentación técnica ucraniana a portugués en pipelines offline: el modelo puede integrarse en scripts con ONNX Runtime para procesar lotes de texto sin depender de API externas.
- Aplicaciones de mensajería con traducción local: integración en clientes de chat que necesiten traducir mensajes entre ucraniano y portugués preservando la privacidad del contenido.
- Herramientas de accesibilidad: traducción de contenido ucraniano a portugués para lectores de pantalla o interfaces de asistencia en dispositivos de gama baja, donde un modelo grande no cabría.
- Procesamiento de corpus paralelos: uso del modelo y de sus alineaciones para generar o validar pares de frases ucraniano-portugués en proyectos de lingüística computacional.
- Evaluación de calidad de traducción en entornos embebidos: servir como referencia ligera para comparar la calidad de traducción directa frente a pipelines con pivot en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en INT8, dado el tamaño del repositorio (0,1 GB) y la ausencia de caché de estados en el decoder.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y para ejecución en dispositivo móvil mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque su uso previsto es CPU.
- Opciones de despliegue: ONNX Runtime (runtime nativo en Android, Python, C++), integración en apps Android mediante el runtime de OPUS de Subtitle Tap. No se distribuye en formato GGUF ni está pensado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La ausencia de past key/values implica que la decodificación recalcula la atención en cada paso, lo que puede aumentar la latencia en secuencias largas frente a una exportación con caché.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-pt-int8-shift-att | uk → pt | Marian (transformer) | ONNX INT8 | Apache 2.0 | no disponible |
| Helsinki-NLP/opus-mt-uk-pt | uk → pt | Marian (transformer) | safetensors/PyTorch | Apache 2.0 | no disponible |
| Helsinki-NLP/opus-mt-uk-en + opus-mt-en-pt | uk → en → pt | Marian (dos modelos) | safetensors/PyTorch | Apache 2.0 | no disponible |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineación, no la calidad de traducción, que debería ser equivalente al compartir pesos. Frente a la alternativa con pivot por inglés, la traducción directa evita la doble traducción, aunque no se dispone de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la dirección ucraniano a portugués; no es un modelo bidireccional ni multilingüe general.
- Al ser una cuantización INT8 dinámica, puede producirse una ligera degradación de calidad frente al modelo original en FP32, aunque no se han publicado métricas que lo cuantifiquen.
- La exportación sin past key/values puede incrementar la latencia en secuencias largas.
- Riesgo de alucinación y de traducciones erróneas en dominios especializados (términos técnicos, nombres propios, jerga), inherente a los modelos NMT entrenados sobre OPUS.
- Posibles sesgos heredados de los datos de entrenamiento de OPUS, que no están documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se especifican limitaciones de longitud de contexto ni de idioma más allá de los pares indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-pt-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-pt
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace en la información proporcionada
- Repositorio de OPUS-MT: no disponible como enlace en la información proporcionada
- Aplicación Subtitle Tap: no disponible como enlace en la información proporcionada
