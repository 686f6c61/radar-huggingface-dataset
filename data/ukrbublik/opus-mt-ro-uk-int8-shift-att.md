# ukrbublik/opus-mt-ro-uk-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-ro-uk-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-base-ro-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Se trata de un modelo Marian de traducción directa entre rumano (ro) y ucraniano (uk), sin pivote a través del inglés, pensado para ejecutarse en dispositivos móviles dentro del runtime OPUS de la aplicación Android Subtitle Tap.

La aportación de este repositorio no es el entrenamiento, sino el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values), aplica cuantización dinámica INT8 con onnxruntime (QInt8, per-tensor) y añade una salida adicional `alignment_shift_l2` en el decoder, que expone las probabilidades de atención encoder-decoder de la capa 2. Esta salida permite obtener alineamientos palabra a palabra entre origen y destino, útil para subtitulado.

El modelo es relevante para desarrolladores que necesitan traducción ro-uk en local, con un tamaño de repositorio de solo 0,1 GB, licencia CC-BY-4.0 y sin dependencia de servicios en la nube. Al estar cuantizado y exportado a ONNX, encaja en pipelines de inferencia ligeros (onnxruntime, móvil, edge) más que en despliegues de servidor con GPUs de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX |
| Parametros totales | no disponible (modelo base `opus-mt-tc-base-ro-uk`, variante "base") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; pesos originales en el modelo base |
| Idiomas soportados | rumano (ro), ucraniano (uk) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values; `tokenizer_runtime.json`; `alignment.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq diseñado para traducción automática, en su variante "base" del proyecto OPUS-MT. El modelo original `Helsinki-NLP/opus-mt-tc-base-ro-uk` fue entrenado por el grupo de la Universidad de Helsinki sobre datos de OPUS (corpus paralelos multilingües), y este repositorio parte de la revisión `9c5015a0da4799e294e0a73f6e44231de5b79b9e`. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La conversión aplica una exportación con optimum a ONNX (opset 17) sin past key/values, seguida de cuantización dinámica INT8 con onnxruntime. La innovación destacable es la salida `alignment_shift_l2`: una identidad sobre un nodo existente que expone las probabilidades de atención encoder-decoder de la capa 2, sin alterar pesos ni decodificación. El repositorio incluye además `alignment.json`, un recibo que vincula esa salida de alineamiento con el SHA-256 del decoder, y `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a los ids de vocabulario y a las cadenas de tokens de destino.

## Capacidades

- Traducción automática directa rumano → ucraniano, sin pivote por inglés.
- Traducción inversa ucraniano → rumano si el runtime invoca el par correspondiente del modelo base (el repositorio se documenta como ro→uk).
- Generación de alineamientos de atención encoder-decoder (capa 2) mediante la salida `alignment_shift_l2`, apta para correspondencias palabra a palabra.
- Inferencia en dispositivo mediante onnxruntime con pesos INT8, sin necesidad de GPU.
- Tokenización SentencePiece empaquetada en `tokenizer_runtime.json` para uso autocontenido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap puede traducir subtítulos ro→uk en el dispositivo usando los modelos ONNX INT8, sin enviar texto a servidores externos y con un repositorio de solo 0,1 GB.
- Alineamiento para subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar segmentos origen y destino, útil para generar subtítulos sincronizados o resaltados palabra a palabra.
- Traducción offline en zonas con conectividad limitada: al ejecutarse con onnxruntime en local, el modelo funciona sin red, adecuado para dispositivos de campo o entornos restringidos.
- Preprocesado de corpus ro-uk: traducción masiva de documentos rumanos a ucraniano en pipelines por lotes con onnxruntime, con coste de infraestructura bajo.
- Integración en aplicaciones de accesibilidad: lectura o dictado traducido entre rumano y ucraniano en dispositivos de gama media gracias a la cuantización INT8.
- Prototipado de sistemas de traducción en edge: base para experimentar con alineamientos de atención y decodificación en entornos móviles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la cuantización INT8, el modelo cabe holgadamente en memoria de dispositivos móviles y en GPUs de gama baja.
- GPU recomendadas: no se especifican; el destino declarado es CPU/onnxruntime en Android, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño reducido del artefacto.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-ro-uk-int8-shift-att` | no disponible (base Marian) | no disponible | ro, uk | CC-BY-4.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-tc-base-ro-uk` | no disponible (base Marian) | no disponible | ro, uk | CC-BY-4.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT tc-base | no disponible | no disponible | pares multilingües | CC-BY-4.0 | safetensors/PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio general entrenado sobre OPUS; puede degradarse en jerga técnica, nombres propios o registros muy coloquiales.
- Riesgo de alucinación y de traducciones literales en frases ambiguas, habitual en modelos Marian de tamaño base.
- Cobertura limitada a rumano y ucraniano; no se documentan otros idiomas.
- La cuantización INT8 puede introducir una pérdida de calidad respecto al modelo base en FP32, no cuantificada en la información disponible.
- La licencia CC-BY-4.0 exige atribución al grupo OPUS-MT de la Universidad de Helsinki (Tiedemann y Thottingal, 2020) en cualquier uso, incluido el comercial.
- El repositorio solo cambia el formato (exportación ONNX y cuantización); cualquier problema de calidad lingüística proviene del modelo base.
- No hay métricas publicadas de BLEU, latencia ni throughput, por lo que la evaluación en producción debe hacerse por cuenta del integrador.
- El modelo está pensado para el runtime OPUS de Subtitle Tap; su uso fuera de ese runtime requiere adaptar la carga de `tokenizer_runtime.json` y la interpretación de `alignment_shift_l2`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ro-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-base-ro-uk
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como URL en la información proporcionada
- Repositorio OPUS-MT: no disponible como URL en la información proporcionada
- Documentación de onnxruntime: no disponible como URL en la información proporcionada
