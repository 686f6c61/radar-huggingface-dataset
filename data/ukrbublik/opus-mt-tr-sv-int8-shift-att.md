# ukrbublik/opus-mt-tr-sv-int8-shift-att

## Resumen

`ukrbublik/opus-mt-tr-sv-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tr-sv`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente de turco (tr) a sueco (sv), sin pivotar a traves del ingles, y esta pensado para ejecucion en dispositivo (on-device) en la aplicacion Android Subtitle Tap.

La conversion la firma el usuario ukrbublik y anade una salida adicional de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2 del decodificador. Esta salida no modifica los pesos ni el proceso de decodificacion: es una identidad sobre un nodo existente, util para alinear tokens de origen y destino en subtitulos.

Se trata de un modelo Marian de tamano base (el OPUS-MT original ronda los 74-77 millones de parametros), empaquetado en dos ficheros ONNX cuantizados (encoder y decoder) de unos 0,1 GB en total. Su relevancia es practica: ofrece traduccion tr→sv ligera y ejecutable en movil con licencia Apache 2.0, aunque sin datos publicados de calidad ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX (opset 17) |
| Parametros totales | no disponible (modelo base OPUS-MT de tamano base, sin cifra confirmada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | turco (tr) → sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) + `tokenizer_runtime.json` + `alignment.json` |

## Arquitectura y entrenamiento

El modelo original es un Marian NMT, la arquitectura transformer encoder-decoder que Helsinki-NLP usa en toda la familia OPUS-MT. Fue entrenado sobre datos paralelos del corpus OPUS y publicado por Jörg Tiedemann y Santhosh Thottingal (EAMT 2020). No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de fine-tuning con RLHF o DPO.

Esta version concreta no reentrena el modelo: solo cambia el formato. Se exporta con optimum a ONNX (opset 17, sin past key/values), se cuantiza dinamicamente a INT8 con onnxruntime y se anade una salida `alignment_shift_l2` que es una identidad sobre el nodo de atencion encoder-decoder de la capa 2 del decodificador. El repositorio incluye un `alignment.json` que actua como recibo, vinculando la salida de alineamiento al SHA-256 del decodificador. La tokenizacion se sirve mediante `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del SentencePiece original a ids de vocabulario y cadenas de tokens destino.

## Capacidades

- Traduccion de texto directa de turco a sueco, sin pivot a traves del ingles.
- Generacion de alineamientos token a token mediante la salida `alignment_shift_l2` (probabilidades de atencion de la capa 2 del decodificador).
- Ejecucion en dispositivo mediante onnxruntime, sin dependencia de GPU ni de servicios en la nube.
- Tokenizacion autocontenida a traves de `tokenizer_runtime.json` (SentencePiece mapeado a ids).
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- Capacidad multilingue limitada exclusivamente al par tr→sv.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Subtitulado en tiempo real en Android: la salida de alineamiento permite sincronizar segmentos de subtitulo turco con su traduccion sueca, y el formato ONNX INT8 encaja en el runtime on-device de Subtitle Tap.
- Traduccion offline en movil: al ejecutarse con onnxruntime y ocupar unos 0,1 GB, el modelo funciona sin conexion en dispositivos con recursos limitados.
- Preprocesado de contenido turco para audiencias suecas: traduccion por lotes de articulos, notas o documentacion antes de su publicacion.
- Localizacion de interfaces y cadenas cortas: el par tr→sv directo evita errores de pivot y reduce latencia en traduccion de cadenas de UI.
- Analisis de alineamiento lexico: la salida de atencion de la capa 2 sirve para estudiar correspondencias entre palabras turcas y suecas en corpus paralelos.
- Pipeline de investigacion en NMT de bajo consumo: util como baseline cuantizado para comparar calidad INT8 frente a FP32 en el par tr→sv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en su uso previsto; el modelo corre en CPU via onnxruntime. El repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es del orden de decenas de MB en INT8.
- GPU recomendadas: no disponibles; no se documenta uso en GPU.
- Cabe en cualquier GPU consumer y en moviles Android modernos, dado el tamano reducido de los ficheros ONNX.
- Opciones de despliegue: onnxruntime (CPU o ejecucion en dispositivo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es ONNX especifico de Marian.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-tr-sv-int8-shift-att` | no disponible (base OPUS-MT) | no disponible | tr→sv | Apache 2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-tr-sv` | no disponible (base OPUS-MT) | no disponible | tr→sv | Apache 2.0 | safetensors/PyTorch |
| `Helsinki-NLP/opus-mt-tc-big-tr-sv` (familia tc-big) | no disponible | no disponible | tr→sv | Apache 2.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineamiento anadida; los pesos y la calidad de traduccion deberian ser equivalentes, aunque no hay benchmarks publicados que lo confirmen.

## Limitaciones y advertencias

- Solo cubre el par tr→sv; no traduce en sentido inverso ni a otros idiomas.
- No hay benchmarks publicados de calidad (BLEU, COMET) para esta conversion INT8, por lo que el impacto de la cuantizacion en la calidad no esta cuantificado.
- La cuantizacion dinamica INT8 puede degradar ligeramente la fluidez o la precision en frases largas o poco frecuentes; conviene validar en el dominio objetivo.
- Riesgo de alucinacion y de traducciones literales en terminologia especializada, comun en modelos NMT de tamano base.
- Sesgos inheridos de los datos OPUS, que pueden reflejar desequilibrios de genero, dominio o registro.
- La salida de alineamiento es una identidad sobre un nodo interno; no debe interpretarse como alineamiento garantizado a nivel de palabra.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion a Helsinki-NLP y citar el paper de OPUS-MT.
- El repositorio no incluye configuracion de generacion ni limites de longitud; el consumidor debe fijarlos.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-tr-sv-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-sv
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS: https://opus.nlpl.eu/
- onnxruntime: https://github.com/microsoft/onnxruntime
- optimum: https://github.com/huggingface/optimum
