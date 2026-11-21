# ukrbublik/opus-mt-en-hu-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-hu-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-hu`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión es ukrbublik, y su propósito es servir como motor de traducción en dispositivo (on-device) para la aplicación Android Subtitle Tap, traduciendo directamente de inglés a húngaro sin pivotar por una lengua intermedia.

El modelo resuelve el problema de ejecutar traducción neuronal en entornos con recursos limitados: el repositorio ocupa aproximadamente 0,1 GB y los pesos se exportan a ONNX (opset 17) con cuantización dinámica INT8, lo que permite su despliegue con ONNX Runtime en dispositivos móviles. La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos de OPUS, con licencia Apache 2.0.

La innovación específica de esta conversión es que el decodificador expone una salida adicional `alignment_shift_l2` con las probabilidades de atención encoder del nivel 2, lo que permite obtener alineamientos entre tokens de origen y destino sin alterar los pesos ni la decodificación. Esta salida es útil para aplicaciones de subtitulado que necesitan sincronizar o resaltar correspondencias entre el texto original y la traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) mediante onnxruntime |
| Idiomas soportados | inglés (en), húngaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx), tokenizer en JSON |
| Tamano del repositorio | 0,1 GB |
| Opset de exportación | 17 |
| Salidas adicionales | alignment_shift_l2 (probabilidades de atención encoder de la capa 2) |

## Arquitectura y entrenamiento

El modelo base es Marian NMT, una arquitectura transformer encoder-decoder diseñada específicamente para traducción automática neuronal, entrenada por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta conversión concreta no modifica los pesos ni el proceso de decodificación: únicamente cambia el formato (exportación a ONNX con opset 17, sin past key/values) y aplica cuantización dinámica INT8 con ONNX Runtime. La innovación técnica destacable es la exposición de la salida `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder de la segunda capa del decodificador; se implementa como una Identity de un nodo existente, por lo que no altera el comportamiento del modelo. El tokenizador se distribuye como `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario, junto con las cadenas de tokens de destino. El archivo `alignment.json` actúa como recibo que vincula la salida de alineamiento con el SHA-256 del decodificador.

## Capacidades

- Traducción automática directa de inglés a húngaro, sin pivotar por una lengua intermedia.
- Generación de alineamientos token a token entre origen y destino mediante la salida `alignment_shift_l2`.
- Ejecución en dispositivo (on-device) con ONNX Runtime, sin dependencia de servicios en la nube.
- Tokenización SentencePiece integrada mediante un tokenizador en formato JSON.
- Inferencia con pesos cuantizados INT8 para reducir requisitos de memoria y cómputo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos de inglés a húngaro en tiempo real en el propio dispositivo, usando los modelos ONNX cuantizados y evitando el envío de texto a servidores externos.
- Sincronización y resaltado de subtítulos: la salida `alignment_shift_l2` permite mapear qué tokens del subtítulo original corresponden a qué tokens de la traducción, útil para resaltar fragmentos o ajustar tiempos.
- Traducción offline en dispositivos móviles: al ocupar aproximadamente 0,1 GB y ejecutarse con ONNX Runtime, el modelo puede integrarse en aplicaciones que funcionan sin conexión a internet.
- Procesamiento por lotes de documentos en inglés hacia húngaro en entornos con CPU: la cuantización INT8 reduce los requisitos de cómputo frente al modelo original en fp32.
- Integración en pipelines de localización de contenidos: traducción de textos cortos o medianos (interfaces, descripciones, metadatos) en flujos automatizados que requieren un motor ligero.
- Prototipado de sistemas de traducción en investigación: el par de modelos ONNX y el tokenizador JSON permiten reproducir la inferencia sin necesidad de frameworks de deep learning completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 0,1 GB, por lo que la huella de memoria es muy reducida; no se dispone de cifras exactas de consumo en ejecución.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y dispositivos móviles mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: por su tamaño, cabe holgadamente en cualquier GPU de consumo, aunque no se documentan requisitos específicos.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-hu-int8-shift-att | no disponible | no disponible | en→hu | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-hu (base) | no disponible | no disponible | en→hu | Apache 2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT en→hu | no disponible | no disponible | en→hu | Apache 2.0 | variable |

El modelo base `Helsinki-NLP/opus-mt-en-hu` es la alternativa directa: mismos pesos, sin cuantización y en formato PyTorch, orientado a inferencia con frameworks de deep learning. Esta conversión añade la cuantización INT8, el formato ONNX y la salida de alineamiento, a costa de una posible pérdida de precisión por la cuantización. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- La cuantización INT8 dinámica puede introducir una degradación de calidad en la traducción respecto al modelo original en fp32; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Solo cubre el par inglés-húngaro; no soporta otros idiomas ni direcciones inversas.
- No se documentan sesgos específicos, pero al entrenarse sobre datos OPUS puede heredar los sesgos presentes en dicho corpus.
- Riesgo de alucinación y de traducciones incorrectas en textos fuera de dominio, especialmente en terminología especializada o expresiones culturales.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de textos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, se recomienda citar el trabajo original de Tiedemann y Thottingal (2020) según indica el autor.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- La salida de alineamiento depende de una implementación concreta (Identity de un nodo existente) y del archivo `alignment.json`; cambios en el grafo podrían invalidar la vinculación por SHA-256.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-hu-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-hu
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
