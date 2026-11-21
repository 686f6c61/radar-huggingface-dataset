# ukrbublik/opus-mt-en-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-de-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-de`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión, ukrbublik, la publica para el runtime OPUS on-device de la aplicación Android Subtitle Tap, con el objetivo de ejecutar traducción inglés→alemán directamente en el dispositivo sin depender de servicios en la nube.

El modelo resuelve el problema de la traducción neuronal directa en entornos con recursos limitados: al estar exportado a ONNX (opset 17) y cuantizado dinámicamente a INT8, reduce el peso y los requisitos de cómputo respecto al modelo original en PyTorch. La arquitectura subyacente es Marian, una familia de modelos transformer encoder-decoder especializados en traducción, con un tamaño de repositorio de 0,1 GB.

La novedad técnica de esta variante es la exposición de una salida adicional de alineación (`alignment_shift_l2`), que proporciona las probabilidades de atención encoder del decodificador en la capa 2. Esto permite a aplicaciones de subtitulado obtener correspondencias entre tokens de origen y destino sin modificar los pesos ni el proceso de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX |
| Idiomas soportados | inglés (en), alemán (de) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-de` emplea la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. Fue entrenado por el grupo de investigación de la Universidad de Helsinki sobre datos del corpus OPUS, una colección de textos paralelos multilingües de dominio público. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta variante concreta no reentrena ni modifica los pesos: solo cambia el formato. Se exporta mediante `optimum` a ONNX con opset 17 y sin past key/values, y se cuantiza dinámicamente a INT8 con onnxruntime. La innovación destacable es la inclusión de una salida `alignment_shift_l2`, implementada como una Identity de un nodo existente, que expone las probabilidades de atención encoder de la capa 2 del decodificador. Esto permite obtener alineaciones a nivel de token entre origen y destino sin alterar el comportamiento del modelo. El tokenizador se distribuye como `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los identificadores de vocabulario, junto con los strings de tokens de destino. Un fichero `alignment.json` vincula la salida de alineación con el SHA-256 del decodificador.

## Capacidades

- Traducción directa inglés→alemán sin pivotar a través de una lengua intermedia.
- Generación de alineaciones token a token entre origen y destino mediante la salida `alignment_shift_l2` (probabilidades de atención encoder en la capa 2).
- Ejecución on-device en Android mediante ONNX Runtime con cuantización INT8.
- Tokenización SentencePiece integrada en un fichero JSON de runtime.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada exclusivamente al par en→de.

## Casos de uso

- Subtitulado automático en dispositivos móviles: la aplicación Subtitle Tap puede traducir subtítulos del inglés al alemán directamente en el teléfono, sin conexión a internet, gracias al formato ONNX INT8 y al runtime OPUS on-device.
- Traducción offline en aplicaciones Android: al no requerir servidor, el modelo permite traducir texto en entornos sin conectividad, usando el encoder y decoder cuantizados incluidos.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar fragmentos de texto origen y destino, útil para generar subtítulos sincronizados o resaltar correspondencias en interfaces de aprendizaje de idiomas.
- Preprocesado de contenido editorial en inglés hacia alemán: integrable en pipelines ligeros de traducción de documentación o metadatos donde el volumen no justifica un servicio en la nube.
- Evaluación de modelos de traducción en entornos con recursos limitados: sirve como referencia de calidad y latencia para comparar cuantizaciones INT8 frente al modelo original en FP32.
- Prototipado de funcionalidades de traducción en apps móviles: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX facilitan la integración en builds de aplicaciones sin dependencias pesadas de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto apto para ejecución en CPU.
- GPU recomendadas: no disponible; el formato ONNX INT8 está orientado a ejecución en CPU y dispositivos móviles, no a GPU de datacenter.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se especifican requisitos concretos.
- Opciones de despliegue: ONNX Runtime (incluido en el runtime OPUS on-device de Subtitle Tap); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-de-int8-shift-att | no disponible | no disponible | en→de | cc-by-4.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-de | no disponible | no disponible | en→de | cc-by-4.0 | PyTorch (safetensors/bin) |
| Otros modelos Marian de OPUS-MT | no disponible | no disponible | múltiples pares | cc-by-4.0 | PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce inglés→alemán; no cubre otros pares de idiomas.
- La cuantización INT8 dinámica puede introducir una pérdida de calidad respecto al modelo original en FP32, aunque no se documenta su magnitud.
- No se especifican sesgos conocidos ni riesgos de alucinación concretos; como modelo de traducción, puede producir traducciones inexactas en dominios especializados o con terminología técnica.
- La licencia cc-by-4.0 permite uso comercial con atribución; es obligatorio citar a Tiedemann y Thottingal (2020) y reconocer al grupo de la Universidad de Helsinki.
- El modelo está pensado para el runtime OPUS on-device de Subtitle Tap; su integración en otros entornos requiere adaptar el consumo de las salidas ONNX y del tokenizador JSON.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas que requieran interacción con herramientas.
- La longitud de contexto no está documentada, lo que limita la planificación de traducciones de documentos largos.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-en-de-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-en-de-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-en-de](https://huggingface.co/Helsinki-NLP/opus-mt-en-de)
- [Paper de OPUS-MT: Tiedemann y Thottingal (2020), EAMT 2020](https://aclanthology.org/2020.eamt-1.61/)
- [Repositorio OPUS-MT](https://github.com/Helsinki-NLP/OPUS-MT)
