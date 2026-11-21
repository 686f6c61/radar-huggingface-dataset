# ukrbublik/opus-mt-en-zh-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-zh-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-zh`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT). El modelo traduce directamente de ingles a chino, sin pivotar a traves de una lengua intermedia, y esta empaquetado especificamente para el runtime on-device de la aplicacion Android "Subtitle Tap".

La relevancia de esta ficha no esta en el modelo base, bien conocido y ampliamente desplegado, sino en el proceso de exportacion: los pesos se han convertido a formato ONNX (opset 17, sin past key/values) y cuantizado dinamicamente a INT8 (QInt8, per-tensor) con onnxruntime. Ademas, el decodificador expone una salida adicional, `alignment_shift_l2`, que devuelve las probabilidades de atencion encoder-decoder de la capa 2, util para alinear tokens origen y destino en tareas de subtitulado.

Se trata de un transformer encoder-decoder de la familia Marian, de tamano reducido (repo de 0,1 GB, lo que sugiere un modelo compacto de decenas de millones de parametros), pensado para inferencia en dispositivos con recursos limitados. La licencia es Apache 2.0 y los unicos idiomas soportados son ingles y chino. No se han publicado descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Marian) |
| Parametros totales | no disponible (repo de 0,1 GB, modelo compacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, la arquitectura encoder-decoder de traduccion automatica neuronal desarrollada en el ecosistema OPUS-MT (Helsinki-NLP). Se entreno sobre datos del corpus OPUS, una coleccion de corpus paralelos multilingues de dominio publico. El modelo original es multi-target: soporta varias lenguas de destino y selecciona el chino mediante el token de prefijo `>>cmn_Hans<<`, que esta version inserta automaticamente antes de cada frase origen a traves de `sourcePrefixTokenIds` en `tokenizer_runtime.json`.

La conversion realizada por `ukrbublik` no modifica los pesos ni el proceso de decodificacion. Los cambios son de formato y de empaquetado: exportacion a ONNX con optimum (opset 17, sin past key/values, es decir, sin cache de atencion entre pasos), cuantizacion dinamica INT8 con onnxruntime, y la exposicion de una salida adicional en el decodificador, `alignment_shift_l2`, que corresponde a las probabilidades de atencion encoder-decoder de la capa 2 (implementada como una Identity sobre un nodo existente). El repositorio incluye ademas `alignment.json`, un recibo que vincula esa salida de alineamiento con el SHA-256 del decodificador, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a ids de vocabulario y a cadenas de tokens destino.

## Capacidades

- Traduccion directa ingles a chino (sin pivot a traves de otra lengua).
- Traduccion de texto plano por frases, adecuada para subtitulos y documentos segmentados.
- Salida de alineamiento a nivel de atencion (`alignment_shift_l2`) para emparejar tokens origen y destino.
- Tokenizacion SentencePiece empaquetada en JSON para su uso en runtime propio.
- Inferencia on-device en Android mediante ONNX Runtime (cuantizacion INT8).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidades multilingues limitadas estrictamente a en y zh.

## Casos de uso

- Subtitulado automatico en dispositivos Android: el modelo esta disenado para el runtime on-device de la app Subtitle Tap, de modo que traduce subtitulos en ingles a chino sin conexion a red, aprovechando la cuantizacion INT8 para reducir el consumo de memoria y bateria.
- Alineacion de subtitulos bilingues: la salida `alignment_shift_l2` permite mapear tokens origen y destino, util para generar subtitulos sincronizados o para verificar correspondencias en herramientas de control de calidad de traduccion.
- Traduccion de documentacion tecnica en ingles a chino en pipelines offline: al ser un modelo ONNX ligero, puede integrarse en procesos batch en servidores sin GPU o en entornos air-gapped.
- Procesamiento de texto en el borde (edge computing): su tamano reducido y formato ONNX permiten desplegarlo en dispositivos embebidos o moviles donde no cabe un modelo mayor.
- Preprocesamiento o postprocesamiento en sistemas de traduccion mas grandes: puede actuar como traductor de respaldo o como componente de un pipeline que necesite una traduccion rapida en y zh.
- Investigacion sobre alineacion de atencion: la exposicion de las probabilidades de atencion de la capa 2 facilita experimentos academicos sobre interpretabilidad y alineamiento lexico en modelos NMT.
- Prototipado rapido con ONNX Runtime: sirve como ejemplo de exportacion optimum + cuantizacion dinamica para quien quiera replicar el flujo con otros pares de idiomas de OPUS-MT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repo (0,1 GB) y la cuantizacion INT8, el modelo cabe holgadamente en menos de 1 GB de memoria, incluso en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier tarjeta moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, e incluso en CPU y en dispositivos moviles Android.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), y potencialmente otros runtimes compatibles con ONNX. No se proporcionan pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-zh-int8-shift-att` | no disponible (compacto) | no disponible | en, zh | Apache 2.0 | ONNX INT8 | Salida de alineamiento, orientado a on-device |
| `Helsinki-NLP/opus-mt-en-zh` | no disponible (mismo modelo base) | no disponible | en, zh | Apache 2.0 | PyTorch/safetensors | Modelo original multi-target, sin cuantizar |
| `Helsinki-NLP/opus-mt-en-mul` | no disponible | no disponible | en, multiples | Apache 2.0 | PyTorch | Variante multilingue de OPUS-MT, no especifica para zh |
| Otros NMT Marian en zh | no disponible | no disponible | en, zh | Apache 2.0 | varios | Existen conversiones comunitarias, sin datos verificados aqui |

La comparativa se limita al ecosistema OPUS-MT porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de traduccion especializado: no es un modelo de proposito general, no razona, no genera codigo ni mantiene conversaciones.
- Riesgo de alucinacion y errores de traduccion: como cualquier NMT, puede producir traducciones incorrectas, especialmente en frases largas, terminologia especializada o lenguaje informal.
- Contexto limitado: al exportarse sin past key/values, la inferencia se realiza frase a frase; la calidad puede degradarse en parrafos largos o con dependencias inter-frase.
- Solo pares en-zh: no soporta otros idiomas ni direccion zh-en.
- Sesgos: los datos OPUS pueden contener sesgos de dominio y de genero; no se documenta ningun proceso de mitigacion.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribucion al grupo OPUS-MT y citar el trabajo de Tiedemann y Thottingal (2020).
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria conocida; conviene verificar la integridad de los archivos y el `alignment.json` antes de usarlo en produccion.
- Dependencia de un runtime concreto: el modelo esta empaquetado para el runtime de Subtitle Tap; su uso fuera de ese entorno requiere adaptar el cargador de tokenizer y la gestion de la salida de alineamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-zh-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
- OPUS-MT (organizacion Helsinki-NLP): https://huggingface.co/Helsinki-NLP
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- ONNX Runtime: https://onnxruntime.ai/
- Optimum (exportacion ONNX): https://huggingface.co/docs/optimum
