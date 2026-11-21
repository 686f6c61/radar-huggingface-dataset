# ukrbublik/opus-mt-it-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-it-sv-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-it-sv`, desarrollado por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo original traduce directamente entre italiano (it) y sueco (sv) sin pivotar por el ingles. Esta version concreta la publica el usuario ukrbublik para integrarla en el runtime OPUS on-device de la aplicacion Android Subtitle Tap.

El interes de esta ficha no esta en el modelo linguistico (que es un OPUS-MT Marian estandar, ya muy conocido) sino en el empaquetado: exportacion a ONNX con opset 17 sin past key/values, cuantizacion dinamica INT8 por tensor (QInt8) via onnxruntime, y una salida adicional `alignment_shift_l2` que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder. Esa salida permite obtener alineamientos a nivel de token sin alterar los pesos ni la decodificacion, algo util para subtitulado, resaltado de correspondencias y control de calidad de traduccion.

El repositorio ocupa aproximadamente 0,1 GB, la licencia es Apache 2.0 y el modelo esta pensado exclusivamente para inferencia local en dispositivos con recursos limitados. No hay datos de entrenamiento nuevos: solo cambia el formato de los ficheros respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible (modelo base OPUS-MT it-sv, tamano tipico de la familia ~74-77M; cifra exacta no publicada en esta ficha) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; los OPUS-MT estandar suelen limitarse a ~512 tokens) |
| Tipos de cuantizacion | INT8 dinamica por tensor (QInt8) sobre exportacion ONNX |
| Idiomas soportados | italiano (it) y sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json` + `alignment.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un MarianMT, un transformer encoder-decoder clasico de traduccion neuronal, entrenado por el grupo OPUS-MT de la Universidad de Helsinki sobre datos paralelos del corpus OPUS. Esta version no reentrena ni modifica los pesos: solo exporta el modelo a ONNX con opset 17, sin past key/values (es decir, sin cache de decodificacion autoregresiva), y aplica cuantizacion dinamica INT8 por tensor con onnxruntime. El decoder incorpora ademas una salida `alignment_shift_l2` que es una identidad sobre un nodo ya existente y que devuelve las probabilidades de atencion encoder-decoder de la capa 2, util para alineamiento a nivel de token.

No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset OPUS utilizado ni si hubo tecnicas de RLHF o DPO (los OPUS-MT clasicos no las emplean). Tampoco se especifica la innovacion tecnica mas alla del empaquetado ONNX/INT8 y la exposicion de la salida de alineamiento. El tokenizador se entrega como `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a ids de vocabulario y a cadenas de tokens destino.

## Capacidades

- Traduccion directa italiano a sueco sin pivotar por el ingles.
- Traduccion de texto plano a nivel de frase o parrafo corto.
- Salida de alineamiento a nivel de token mediante `alignment_shift_l2` (probabilidades de atencion de la capa 2 del decoder), util para subtitulado y correspondencias palabra a palabra.
- Inferencia on-device con onnxruntime, sin dependencia de GPU ni de servicios en la nube.
- Tokenizador empaquetado en JSON para uso en runtimes ligeros.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un traductor puro encoder-decoder.
- Capacidad multilingue limitada estrictamente al par it-sv.

## Casos de uso

- Subtitulado automatico en Android: la salida `alignment_shift_l2` permite alinear cada subtitulo italiano con su traduccion sueca y resaltar correspondencias en la app Subtitle Tap, con inferencia local y sin conexion.
- Traduccion offline en dispositivos moviles: al estar cuantizado en INT8 y en ONNX, cabe en memoria de un telefono y se ejecuta con onnxruntime sin backend remoto.
- Preprocesado de corpus it-sv: generar traducciones de referencia rapidas para conjuntos de datos, con la ventaja de poder auditar el alineamiento token a token.
- Control de calidad de traduccion: comparar las probabilidades de atencion expuestas con las alineaciones esperadas para detectar segmentos mal traducidos.
- Herramientas de aprendizaje de idiomas: mostrar al usuario que palabra italiana corresponde a que palabra sueca en una frase, usando el alineamiento de la capa 2.
- Integracion en pipelines de subtitulos para streaming o video bajo demanda en entornos con recursos limitados (movil, Raspberry Pi, navegador con onnxruntime-web).
- Prototipado rapido de traduccion it-sv en aplicaciones de escritorio sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de ~0,1 GB en INT8, la huella de memoria es del orden de cientos de MB, apta para CPU y movil.
- GPU recomendadas: no disponible; el modelo esta disenado para CPU y ejecucion on-device con onnxruntime.
- Cabe en GPU consumer: si, aunque no es su objetivo; funciona en cualquier GPU moderna via onnxruntime con backend CUDA o similar, y en CPU sin problema.
- Opciones de despliegue: onnxruntime (Python, C++, Android, web), con los ficheros `encoder_model_quantized.onnx` y `decoder_model_quantized.onnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato y arquitectura).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-it-sv-int8-shift-att | no disponible (base OPUS-MT it-sv) | no disponible | it, sv | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-it-sv (base) | no disponible | no disponible | it, sv | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-it-en | no disponible | no disponible | it, en | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-sv | no disponible | no disponible | en, sv | Apache 2.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida adicional de alineamiento. Frente a los pares con pivot por ingles (it-en + en-sv), esta version evita la doble traduccion y la perdida de calidad asociada, a costa de cubrir solo el par directo it-sv.

## Limitaciones y advertencias

- Modelo de traduccion puro: no razona, no genera codigo, no soporta herramientas ni agentes.
- Solo cubre italiano y sueco; cualquier otro idioma queda fuera de alcance.
- La cuantizacion INT8 puede introducir una ligera perdida de calidad frente al modelo original en PyTorch; no se documenta la magnitud de esa perdida.
- La exportacion sin past key/values implica que la decodificacion no reutiliza cache, lo que puede aumentar la latencia en secuencias largas.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (medico, legal, tecnico), como en cualquier OPUS-MT.
- Sesgos heredados de los datos OPUS: posibles sesgos de genero, registro o dominio segun la composicion del corpus.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto de un autor individual sin validacion comunitaria amplia.
- No hay garantia de mantenimiento ni de actualizacion del autor.
- La fecha de creacion indicada (2026-11-20) es futura respecto al momento habitual de consulta; conviene verificar la integridad de los ficheros antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-it-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-it-sv
- Paper OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): https://aclanthology.org/2020.eamt-1.61/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS: https://opus.nlpl.eu/
- onnxruntime: https://github.com/microsoft/onnxruntime
- Optimum (exportacion ONNX): https://github.com/huggingface/optimum
