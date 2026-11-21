# ukrbublik/opus-mt-fr-de-int8-shift-att

## Resumen

`ukrbublik/opus-mt-fr-de-int8-shift-att` es una conversion del modelo de traduccion automatica `Helsinki-NLP/opus-mt-fr-de` del grupo OPUS-MT de la Universidad de Helsinki. El autor, ukrbublik, ha exportado los pesos originales (arquitectura Marian, transformer encoder-decoder) a formato ONNX con cuantizacion dinamica INT8, pensado para ejecucion en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap. La traduccion es directa de frances a aleman, sin pivotar por ingles.

El interes de esta ficha no esta en el modelo linguistico en si, sino en el artefacto de despliegue: un par de grafos ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) de bajo peso (repo de 0,1 GB) con una salida adicional de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2. Esa salida permite a la aplicacion consumidora mapear tokens de origen y destino, algo tipico en subtitulado.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy concreto: traduccion fr→de de subtitulos en un movil sin conexion. No aporta innovaciones en arquitectura ni en entrenamiento respecto al modelo base; su valor esta en la cuantizacion, el empaquetado ONNX y la instrumentacion de la atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), exportado a ONNX (opset 17, sin past key/values) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; pesos originales en fp32 |
| Idiomas soportados | frances (fr) y aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), mas `tokenizer_runtime.json` y `alignment.json` |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Helsinki-NLP/opus-mt-fr-de (revision `db80d261062d75a60e1d4897f13673313a33d50b`) |
| Salida adicional | `alignment_shift_l2`: probabilidades de atencion encoder-decoder de la capa 2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, la implementacion de transformer encoder-decoder usada por OPUS-MT, entrenada por el Language Technology Research Group de la Universidad de Helsinki sobre datos OPUS (corpus paralelos multilingues). El modelo base `Helsinki-NLP/opus-mt-fr-de` es un sistema de traduccion directo fr→de, sin pivotar por ingles, y esta publicado bajo Apache 2.0.

Esta variante concreta no reentrena ni ajusta los pesos: solo cambia el formato. El autor exporta el modelo con optimum a ONNX (opset 17, sin key/values pasados, es decir, decodificacion sin cache de atencion), aplica cuantizacion dinamica INT8 per-tensor con onnxruntime y anade una salida `alignment_shift_l2` que es una `Identity` sobre un nodo existente del decoder, de modo que expone las probabilidades de atencion encoder-decoder de la capa 2 sin alterar pesos ni decodificacion. El repositorio incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, mas las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineamiento al SHA-256 del decoder. No se documentan en la informacion disponible detalles sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Traduccion automatica directa frances→aleman, sin pivotar por ingles.
- Exposicion de alineamiento de atencion encoder-decoder (capa 2) para mapear tokens origen-destino, util en subtitulado.
- Ejecucion en dispositivo via onnxruntime con cuantizacion INT8 dinamica.
- Tokenizacion SentencePiece empaquetada en `tokenizer_runtime.json` para uso autonomo del runtime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada exclusivamente al par fr→de.

## Casos de uso

- Subtitulado en dispositivo: la aplicacion Subtitle Tap usa el modelo para traducir subtitulos fr→de en el propio movil; la salida `alignment_shift_l2` permite alinear temporalmente los tokens traducidos con los originales, algo imprescindible para sincronizar subtitulos.
- Traduccion offline en Android: al ser ONNX INT8 con un repo de 0,1 GB, puede empaquetarse en una app sin depender de red ni de servidores externos.
- Procesamiento por lotes de ficheros de subtitulos: integrable en pipelines que conviertan ficheros SRT/VTT de frances a aleman en local, sin coste de API.
- Investigacion sobre alineamiento de atencion: la salida de atencion de la capa 2 permite estudiar correspondencias lexicas fr-de en un modelo Marian cuantizado, sin necesidad de reexportar.
- Prototipado de traduccion en dispositivos de bajos recursos: sirve como referencia de empaquetado ONNX INT8 para modelos Marian en entornos con poca memoria.
- Evaluacion de cuantizacion: util para comparar la calidad fr→de del modelo base fp32 frente a esta version INT8 dinamica en un mismo conjunto de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de movil o en GPU de gama baja.
- GPU recomendadas: no disponibles en la informacion; al ser un modelo pequeno cuantizado, no requiere GPU dedicada y esta pensado para CPU/on-device.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna, aunque el objetivo declarado es ejecucion en Android.
- Opciones de despliegue: onnxruntime (runtime declarado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-de-int8-shift-att | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Variante cuantizada con salida de alineamiento |
| Helsinki-NLP/opus-mt-fr-de | no disponible | no disponible | safetensors/pytorch | Apache 2.0 | Modelo base original, sin cuantizar ni salida de alineamiento |
| Otros modelos OPUS-MT fr-de | no disponible | no disponible | variable | Apache 2.0 | Familia OPUS-MT; comparacion cuantitativa no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes; no hay evidencia de uso en produccion ni validacion externa.
- Solo traduce frances→aleman; no es multilingue ni bidireccional.
- La cuantizacion INT8 dinamica puede degradar la calidad de traduccion respecto al modelo base fp32; no se documenta la magnitud de esa perdida.
- No se especifican sesgos conocidos; al entrenarse sobre OPUS, hereda los sesgos y desequilibrios de esos corpus paralelos.
- Riesgo de alucinacion y de traducciones erroneas en dominios especializados o textos largos, comun en modelos Marian de este tamano.
- La exportacion sin past key/values implica decodificacion menos eficiente en secuencias largas.
- La salida de alineamiento es una `Identity` sobre un nodo existente; su semantica exacta depende de la implementacion del decoder y no esta validada de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero conviene citar el trabajo original de Tiedemann y Thottingal (2020).
- No apta para tareas de razonamiento, codigo o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-de-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-de
- Referencia OPUS-MT (Tiedemann y Thottingal, 2020, EAMT): no disponible como URL en la informacion proporcionada
- Repositorio del autor (ukrbublik): no disponible en la informacion proporcionada
- Aplicacion Subtitle Tap: no disponible como URL en la informacion proporcionada
