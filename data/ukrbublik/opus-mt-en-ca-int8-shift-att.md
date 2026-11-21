# ukrbublik/opus-mt-en-ca-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-ca-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-ca`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de inglés a catalán sin pivotar por una lengua intermedia, y esta variante concreta está pensada para inferencia en dispositivo (on-device), en particular para la aplicación Android Subtitle Tap.

El modelo base es un transformer encoder-decoder de arquitectura Marian, entrenado sobre datos del corpus OPUS. Esta conversión mantiene los pesos y el comportamiento de decodificación intactos y solo cambia el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor con onnxruntime. El repositorio ocupa aproximadamente 0,1 GB.

La particularidad técnica de esta variante es que el decoder expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del layer 2. Se trata de una identidad sobre un nodo existente que no modifica los pesos ni el proceso de decodificación, y permite obtener alineamientos palabra a palabra útiles para subtitulado. El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | inglés (en), catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-ca` sigue la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. Fue entrenado por el grupo de investigación de tecnologías del lenguaje de la Universidad de Helsinki sobre datos del corpus OPUS, una colección de corpus paralelos multilingües. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta variante concreta no reentrena el modelo: únicamente realiza una exportación con optimum (opset 17, sin past key/values) y una cuantización dinámica INT8 por tensor con onnxruntime. La innovación destacable es la exposición de `alignment_shift_l2`, una salida con las probabilidades de atención del layer 2 del encoder que se obtiene mediante una identidad sobre un nodo ya existente. Esto permite extraer alineamientos entre tokens de origen y destino sin alterar los pesos ni la lógica de decodificación, algo especialmente útil para tareas de subtitulado donde se necesita sincronización a nivel de palabra. El repositorio incluye además `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los identificadores de vocabulario, y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción directa de inglés a catalán sin pivotar por una lengua intermedia.
- Generación de alineamientos de atención a nivel de layer 2 (`alignment_shift_l2`) para sincronización palabra a palabra.
- Inferencia en dispositivo mediante ONNX Runtime, con pesos cuantizados a INT8.
- Tokenización autocontenida a través de `tokenizer_runtime.json`, sin dependencia del tokenizador SentencePiece original en tiempo de ejecución.
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.

## Casos de uso

- Subtitulado automático en aplicaciones Android: el modelo traduce subtítulos de inglés a catalán en el propio dispositivo y, gracias a `alignment_shift_l2`, permite alinear cada segmento traducido con su palabra de origen para mantener la sincronización temporal.
- Traducción offline en dispositivos sin conectividad: al ejecutarse con ONNX Runtime y pesos INT8 de unos 0,1 GB, puede desplegarse en móviles y tablets sin depender de servicios en la nube.
- Procesamiento por lotes de documentos en inglés hacia catalán: útil para pipelines de localización de contenido donde se requiere una traducción directa y de bajo coste computacional.
- Preprocesado de corpus para investigación en traducción automática: la salida de alineamiento permite generar corpus alineados a nivel de palabra para estudios lingüísticos o para entrenar modelos posteriores.
- Integración en herramientas de accesibilidad: traducción en tiempo real de contenido audiovisual para usuarios catalanohablantes dentro de reproductores o apps de vídeo.
- Prototipado rápido de sistemas de traducción: al ser un modelo pequeño en formato ONNX, sirve para validar pipelines de traducción en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,1 GB en INT8, la huella de memoria es muy reducida y apta para dispositivos móviles.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en CPU y en dispositivo mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: por su tamaño reducido, es previsible que quepa en cualquier GPU de consumo, aunque no se proporcionan cifras concretas.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan otros runtimes como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-ca-int8-shift-att` | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Variante cuantizada con salida de alineamiento |
| `Helsinki-NLP/opus-mt-en-ca` | no disponible | no disponible | safetensors/PyTorch | Apache 2.0 | Modelo base original, sin cuantizar |
| Otros modelos OPUS-MT en→ca | no disponible | no disponible | variable | Apache 2.0 | Misma familia Marian; datos concretos no disponibles |

## Limitaciones y advertencias

- El modelo solo cubre el par inglés-catalán; no soporta otros idiomas.
- Al estar cuantizado a INT8, puede producirse una ligera pérdida de calidad respecto al modelo base en FP32, aunque no se documenta su magnitud.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos Marian de tamaño reducido, especialmente en dominios especializados o con terminología técnica.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su evaluación en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica la model card.
- La salida `alignment_shift_l2` corresponde a la atención del layer 2 y no debe interpretarse como un alineamiento perfecto; su calidad depende del comportamiento interno del modelo.
- No se documentan límites de longitud de contexto ni de longitud de secuencia de entrada, lo que supone un riesgo para textos largos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-ca-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ca
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
