# ukrbublik/opus-mt-nl-fr-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-nl-fr-int8-shift-att` es una conversion al formato ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-nl-fr`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT). El autor de la conversion, ukrbublik, lo publica para el runtime OPUS en el dispositivo de la aplicacion Android "Subtitle Tap", con el objetivo de ofrecer traduccion directa neerlandes-frances sin pivotar por el ingles.

El modelo base emplea la arquitectura Marian (transformer encoder-decoder), tipica de la familia OPUS-MT, y esta entrenado sobre datos del corpus OPUS. La version publicada aqui no modifica los pesos ni el proceso de decodificacion: solo cambia el formato (exportacion ONNX con opset 17) y aplica cuantizacion dinamica INT8 por tensor. Ademas, anade una salida auxiliar `alignment_shift_l2` que expone las probabilidades de atencion encoder del decodificador en la capa 2, util para alinear tokens entre origen y destino.

Su relevancia es practica: permite ejecutar traduccion nl→fr en dispositivos con recursos limitados mediante ONNX Runtime, con un repositorio de apenas 0,1 GB y licencia Apache 2.0, lo que facilita su integracion en aplicaciones moviles y pipelines ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | neerlandes (nl), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-nl-fr` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT sobre datos paralelos del corpus OPUS. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada.

La conversion realizada por ukrbublik exporta el modelo con optimum a ONNX (opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 con onnxruntime. El decodificador incorpora una salida adicional, `alignment_shift_l2`, que es una identidad sobre un nodo existente y expone las probabilidades de atencion encoder de la capa 2 del decodificador, sin alterar pesos ni decodificacion. El repositorio incluye tambien `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario) y `alignment.json`, un recibo que vincula la salida de alineamiento al SHA-256 del decodificador.

## Capacidades

- Traduccion automatica directa de neerlandes a frances, sin pivotar por el ingles.
- Generacion de alineamientos token a token mediante la salida auxiliar `alignment_shift_l2` (probabilidades de atencion encoder en la capa 2 del decodificador).
- Inferencia en dispositivo mediante ONNX Runtime con pesos cuantizados a INT8.
- Tokenizacion autocontenida a traves de `tokenizer_runtime.json`, sin dependencia del tokenizer original de SentencePiece en tiempo de ejecucion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado en tiempo real en Android: integracion en la app Subtitle Tap para traducir subtitulos nl→fr en el dispositivo, aprovechando el runtime OPUS y la cuantizacion INT8 para reducir latencia y consumo.
- Traduccion offline en movilidad: al ejecutarse con ONNX Runtime y pesar 0,1 GB, permite traducir sin conexion en telefonos y tablets con recursos limitados.
- Alineacion de segmentos bilingues: la salida `alignment_shift_l2` permite construir correspondencias entre tokens origen y destino, util para memorias de traduccion, glosarios o resaltado de correspondencias en interfaces de aprendizaje de idiomas.
- Preprocesado en pipelines de localizacion: traduccion rapida de cadenas nl→fr en flujos de CI/CD o herramientas de gestion de traducciones donde se prioriza el coste computacional bajo.
- Prototipado de sistemas de traduccion en produccion: como componente base en servicios que necesitan un modelo ligero y de licencia permisiva antes de escalar a modelos mayores.
- Investigacion sobre cuantizacion y alineamiento: permite estudiar el impacto de la cuantizacion INT8 dinamica en la calidad de traduccion y en la fidelidad de los alineamientos de atencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno apto para CPU y GPU de gama baja.
- GPU recomendadas: no disponibles en la documentacion; por tamano, es viable en GPUs consumer como RTX 3060 o superiores, aunque no se especifica.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, aunque no se confirma con datos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-nl-fr-int8-shift-att | Marian | nl→fr | no disponible | Apache 2.0 | ONNX INT8 | Conversion con salida de alineamiento |
| Helsinki-NLP/opus-mt-nl-fr | Marian | nl→fr | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base original |
| Helsinki-NLP/opus-mt-en-fr | Marian | en→fr | no disponible | Apache 2.0 | safetensors/PyTorch | Alternativa con pivot por ingles |
| Helsinki-NLP/opus-mt-nl-en | Marian | nl→en | no disponible | Apache 2.0 | safetensors/PyTorch | Alternativa con pivot por ingles |

## Limitaciones y advertencias

- Solo cubre el par de idiomas neerlandes-frances; no soporta otros pares ni traduccion multilingue general.
- Al derivar de un modelo OPUS-MT, hereda los sesgos y limitaciones de los datos OPUS, aunque no se detallan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion y errores en textos especializados, dominios tecnicos o lenguaje informal no representados en el corpus de entrenamiento.
- La cuantizacion INT8 dinamica puede degradar ligeramente la calidad respecto al modelo en precision completa; no se aportan metricas que cuantifiquen esa perdida.
- La salida de alineamiento `alignment_shift_l2` es una identidad sobre un nodo existente; su fiabilidad como alineador no esta validada con metricas publicadas.
- Licencia Apache 2.0, permisiva para uso comercial, pero se recomienda mantener la atribucion a OPUS-MT y a la Universidad de Helsinki segun indica la model card.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validacion comunitaria; conviene evaluar su calidad antes de usarlo en produccion.
- La fecha de creacion indicada (2026-11-20) es futura respecto a la mayoria de referencias, lo que puede indicar un error de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-nl-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-fr
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): no disponible como enlace en la informacion proporcionada
- Repositorio OPUS-MT: no disponible como enlace en la informacion proporcionada
