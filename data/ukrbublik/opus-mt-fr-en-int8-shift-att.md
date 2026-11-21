# ukrbublik/opus-mt-fr-en-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-en-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-fr-en`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente de francés a inglés sin pivotar por una lengua intermedia, y está pensado para ejecutarse en el runtime OPUS embebido en la aplicación Android Subtitle Tap, es decir, inferencia en dispositivo.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder específico para traducción entrenado sobre datos OPUS. Esta versión concreta no modifica los pesos: solo cambia el formato (exportación ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 (QInt8, per-tensor) mediante onnxruntime. Además, el decoder expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, útil para alinear palabras entre origen y destino en subtítulos.

Su relevancia es acotada pero clara: es un artefacto de despliegue reproducible (incluye tokenizador serializado y un fichero `alignment.json` con el SHA-256 del decoder como recibo de integridad) para traducción fr→en de baja latencia en dispositivos móviles, no un modelo de propósito general. El repositorio ocupa aproximadamente 0,1 GB y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | frances (fr) como origen, ingles (en) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, un transformer encoder-decoder entrenado por el proyecto OPUS-MT sobre corpus paralelos de OPUS. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esa información corresponde al modelo original `Helsinki-NLP/opus-mt-fr-en` y no se reproduce aquí.

La innovación de esta conversión es puramente de despliegue. La exportación con optimum a opset 17 elimina los past key/values, lo que simplifica el grafo para inferencia paso a paso en móvil. La cuantización dinámica INT8 reduce el peso y acelera la ejecución en CPU. La salida `alignment_shift_l2` se implementa como una Identity sobre un nodo existente del decoder (las probabilidades de atención encoder de la capa 2), de modo que los pesos y el proceso de decodificación quedan inalterados; esto permite obtener alineaciones a nivel de token sin coste adicional de cómputo. El fichero `alignment.json` vincula esa salida al hash SHA-256 del decoder para verificar que la alineación corresponde a los pesos publicados.

## Capacidades

- Traducción directa francés→inglés en una sola pasada, sin pivotar por inglés intermedio.
- Generación de alineaciones token a token entre origen y destino mediante la salida `alignment_shift_l2` (atención encoder de la capa 2).
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` (piezas y puntuaciones mapeadas a ids de vocabulario, más las cadenas de tokens destino).
- Inferencia en dispositivo mediante onnxruntime con pesos INT8.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par fr→en.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap usa el modelo para traducir subtítulos franceses a inglés en el dispositivo, con la salida de alineación para sincronizar y mapear palabras entre ambos idiomas.
- Traducción offline en movilidad: al ejecutarse con onnxruntime INT8 y un peso de repositorio de 0,1 GB, permite traducir fr→en sin conexión en teléfonos de gama media.
- Preprocesado de corpus fr→en: útil para generar traducciones preliminares de documentos franceses antes de una revisión humana, dado el bajo coste de inferencia.
- Alineación de pares de frases para minería de corpus: la salida `alignment_shift_l2` permite construir alineaciones a nivel de token que alimentan herramientas de memoria de traducción o de evaluación.
- Traducción de interfaces y textos cortos en aplicaciones: frases de UI, notificaciones y mensajes de menos de una frase encajan con la latencia de un modelo Marian pequeño cuantizado.
- Verificación de integridad en pipelines: el `alignment.json` con el SHA-256 del decoder permite auditar que las alineaciones producidas corresponden a los pesos desplegados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la inferencia INT8 cabe holgadamente en memoria de un dispositivo móvil o en CPU.
- GPU recomendadas: no disponibles; el artefacto está orientado a CPU mediante onnxruntime, no a GPU de datacenter.
- Cabe en GPU de consumo: sí, cualquier GPU con unos pocos cientos de MB libres; también en CPU y en Android.
- Opciones de despliegue: onnxruntime (runtime previsto por el autor), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-en-int8-shift-att | no disponible | no disponible | fr→en | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-fr-en (base) | no disponible | no disponible | fr→en | Apache 2.0 | safetensors/PyTorch |
| Otros modelos Marian OPUS-MT fr→en | no disponible | no disponible | fr→en | Apache 2.0 | variable |

La comparación relevante es con el modelo base: esta versión mantiene los mismos pesos y licencia, añade la salida de alineación y reduce el formato a ONNX INT8 para despliegue en dispositivo. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Solo traduce fr→en; no admite otros pares de idiomas ni traducción inversa.
- Al ser una conversión de formato, hereda los sesgos y errores del modelo base OPUS-MT entrenado sobre corpus OPUS, cuya composición puede introducir sesgos de dominio y de registro.
- Riesgo de alucinación y de traducciones fluentes pero incorrectas en frases ambiguas, típico de modelos NMT de tamaño pequeño.
- La longitud de contexto no está documentada; no se debe asumir capacidad para documentos largos sin truncado.
- La cuantización INT8 puede degradar ligeramente la calidad respecto a los pesos originales en fp32; no se han publicado métricas de esa degradación.
- La salida de alineación corresponde a la atención de la capa 2, no a una alineación supervisada; su precisión no está validada en la información disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene conservar la atribución al grupo OPUS-MT de la Universidad de Helsinki indicada por el autor.
- El modelo está diseñado para el runtime de una app concreta; su integración en otros entornos requiere adaptar el tokenizador serializado y el manejo de la salida de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-en-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
- Referencia de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
