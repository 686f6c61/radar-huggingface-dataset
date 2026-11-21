# ukrbublik/opus-mt-en-da-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-da-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-da`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). El modelo traduce directamente de inglés a danés, sin pivotar a través de una lengua intermedia, y está pensado para ejecutarse en el runtime OPUS de la aplicación Android Subtitle Tap, es decir, en inferencia local en dispositivos móviles.

La aportación de este repositorio no es el entrenamiento, sino el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values), aplica cuantización dinámica INT8 por tensor con onnxruntime y añade una salida auxiliar `alignment_shift_l2` que expone las probabilidades de atención encoder del decoder en la capa 2. Esa señal de alineación permite, por ejemplo, resaltar qué fragmento del texto origen corresponde a cada token traducido, algo útil en subtitulado.

Se trata de un modelo pequeño (repo de 0,1 GB) bajo licencia Apache 2.0, con soporte únicamente para inglés y danés. Su relevancia práctica está en el despliegue embebido: permite traducción en el dispositivo sin conexión, con un coste de memoria y cómputo reducido, a cambio de una calidad propia de un modelo Marian de tamaño base entrenado sobre OPUS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática neuronal, entrenado por el proyecto OPUS-MT sobre corpus paralelos del repositorio OPUS. Este repositorio concreto no reentrena ni modifica los pesos: parte de la revisión `55d88cdf73ba0a7fe1e38f4bcf33ddbc26333ea5` de `Helsinki-NLP/opus-mt-en-da` y realiza una exportación con optimum a ONNX (opset 17) sin caché de past key/values, seguida de cuantización dinámica INT8 por tensor con onnxruntime.

La innovación técnica destacable es la salida adicional `alignment_shift_l2`: el decoder emite, además de los logits, las probabilidades de atención encoder de la capa 2, implementadas como una identidad sobre un nodo ya existente, de modo que los pesos y el proceso de decodificación no cambian. El repositorio incluye además un `alignment.json` que vincula esa salida con el hash SHA-256 del decoder, y un `tokenizer_runtime.json` que mapea las piezas y puntuaciones del modelo SentencePiece original a los identificadores del vocabulario. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Traducción automática directa inglés → danés, sin pivotar por una tercera lengua.
- Generación de texto traducido token a token con el decoder ONNX.
- Salida de alineación (`alignment_shift_l2`): probabilidades de atención encoder de la capa 2, útiles para vincular tokens origen y destino.
- Tokenización compatible con SentencePiece mediante `tokenizer_runtime.json`.
- Inferencia en dispositivo con onnxruntime, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en→da.

## Casos de uso

- Subtitulado en dispositivo: la app Subtitle Tap puede traducir subtítulos en inglés a danés localmente, y la salida de alineación permite sincronizar o resaltar los segmentos correspondientes entre idiomas.
- Traducción offline en Android: al ejecutarse con onnxruntime y pesos INT8 de pequeño tamaño, funciona sin conexión en teléfonos y tabletas, útil en entornos con conectividad limitada.
- Preprocesado de contenido editorial: traducción de documentación, notas o artículos del inglés al danés antes de una revisión humana, aprovechando el bajo coste de inferencia.
- Localización de interfaces y cadenas de texto: integración en pipelines de build que generen recursos en danés a partir de cadenas fuente en inglés.
- Análisis de correspondencia bilingüe: el uso de `alignment_shift_l2` permite estudiar qué tokens del origen influyen en cada token traducido, por ejemplo para control de calidad o para construir memorias de traducción.
- Prototipado de sistemas de traducción embebidos: sirve como referencia de exportación ONNX + INT8 para comparar latencia y calidad frente a otras variantes del mismo modelo base.
- Traducción de conversaciones o chats en aplicaciones móviles: al ser un modelo directo en→da, evita la latencia y los errores acumulados de un pipeline con pivot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio ocupa 0,1 GB, por lo que la huella en memoria de los pesos INT8 es del orden de decenas de megabytes, más el overhead del runtime.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y a ejecución en dispositivos Android mediante onnxruntime.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del repositorio; también en CPU y en hardware móvil.
- Opciones de despliegue: onnxruntime (runtime previsto por el autor), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-da-int8-shift-att | no disponible | no disponible | en→da | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-da (base) | no disponible | no disponible | en→da | Apache 2.0 | safetensors/PyTorch |
| Otros OPUS-MT en→da convertidos a ONNX | no disponible | no disponible | en→da | Apache 2.0 | ONNX |
| Modelos NMT multilingües de mayor tamaño (p. ej. NLLB) | no disponible | no disponible | multilingüe | según modelo | según modelo |

La comparación cuantitativa de calidad y rendimiento no está disponible en la información proporcionada; la diferencia principal frente al modelo base es el formato ONNX INT8 y la salida de alineación añadida.

## Limitaciones y advertencias

- Solo traduce inglés → danés; no admite otras direcciones ni otros pares de idiomas.
- Al ser una cuantización INT8 del modelo base, puede presentar una ligera pérdida de calidad respecto a los pesos originales en precisión completa; no se documenta la magnitud de esa pérdida.
- La exportación ONNX no incluye past key/values, lo que afecta a la forma de gestionar la decodificación autorregresiva y puede limitar optimizaciones de caché.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos NMT de tamaño base, especialmente en dominios especializados, terminología técnica o frases ambiguas.
- Sesgos heredados de los corpus OPUS con los que se entrenó el modelo base; no se detallan evaluaciones de sesgo.
- No hay información publicada sobre límites de longitud de contexto ni sobre el comportamiento con entradas muy largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución al grupo de la Universidad de Helsinki indicada por el autor.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que carece de validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-da-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-da
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
