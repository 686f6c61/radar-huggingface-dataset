# ukrbublik/opus-mt-nl-es-int8-shift-att

## Resumen

`ukrbublik/opus-mt-nl-es-int8-shift-att` es una conversion del modelo de traduccion automatica `Helsinki-NLP/opus-mt-nl-es` (familia OPUS-MT) a formato ONNX con cuantizacion dinamica INT8, orientada a inferencia en dispositivo (on-device) dentro de la aplicacion Android Subtitle Tap. El modelo realiza traduccion directa neerlandes→espanol, sin pivote a traves del ingles, y anade una salida adicional de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2.

El modelo original pertenece a la familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki (Jorg Tiedemann et al.) y entrenada sobre datos del corpus OPUS. La arquitectura subyacente es Marian, un transformer encoder-decoder seq2seq especializado en traduccion. Esta variante concreta no altera pesos ni decodificacion: solo cambia el formato de los ficheros (export ONNX con opset 17 y cuantizacion INT8 per-tensor) y expone una salida adicional de alineacion mediante una identidad sobre un nodo existente.

Su relevancia radica en el despliegue movil: el repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para ejecucion local en Android mediante onnxruntime, sin dependencia de servicios en nube. La licencia Apache 2.0 y la ausencia de pivote por ingles lo convierten en una opcion practica para traduccion de subtitulos neerlandes→espanol en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | neerlandes (nl), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17, sin past key/values; tokenizer en `tokenizer_runtime.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Helsinki-NLP/opus-mt-nl-es`: un transformer encoder-decoder de tipo Marian, entrenado por el grupo de investigacion de la Universidad de Helsinki sobre datos del corpus OPUS para traduccion directa neerlandes→espanol. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original y no se detallan en la informacion disponible.

La conversion realizada por `ukrbublik` exporta el modelo con optimum a ONNX (opset 17, sin past key/values) y aplica cuantizacion dinamica INT8 per-tensor con onnxruntime. El decoder incorpora una salida adicional `alignment_shift_l2` que corresponde a las probabilidades de atencion encoder-decoder de la capa 2, implementada como una identidad sobre un nodo existente, de modo que los pesos y el proceso de decodificacion permanecen inalterados. El fichero `alignment.json` actua como recibo que vincula la salida de alineacion al SHA-256 del decoder. El tokenizer se serializa en `tokenizer_runtime.json`, mapeando las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario junto con las cadenas del vocabulario destino.

## Capacidades

- Traduccion automatica directa neerlandes→espanol, sin pivote por ingles.
- Generacion de texto seq2seq orientada exclusivamente a traduccion.
- Salida de alineacion de atencion (`alignment_shift_l2`) util para tareas de alineamiento de palabras o subtitulos.
- Inferencia en dispositivo mediante onnxruntime, adecuada para entornos Android.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento multi-step ni capacidades de agente.
- No dispone de vision, audio ni otras modalidades.
- Capacidad multilingue limitada a los dos idiomas del par nl→es.

## Casos de uso

- Traduccion de subtitulos en tiempo real en Android: el modelo se ejecuta on-device via onnxruntime y su tamano reducido (~0,1 GB) permite traducir subtitulos neerlandeses a espanol dentro de la app Subtitle Tap sin conexion a red.
- Alineamiento de subtitulos palabra a palabra: la salida `alignment_shift_l2` expone probabilidades de atencion que pueden usarse para sincronizar o resaltar terminos entre el texto origen y el traducido.
- Traduccion offline en dispositivos con conectividad limitada: al no requerir servicio en nube, es adecuado para entornos sin red o con restricciones de privacidad.
- Preprocesado de corpus neerlandeses para analisis en espanol: traduccion por lotes de documentos nl→es en pipelines locales con cuantizacion INT8 para reducir requisitos de memoria.
- Prototipado de sistemas de traduccion embebidos: sirve como referencia para integrar modelos Marian ONNX en aplicaciones moviles o de borde.
- Traduccion de correspondencia y textos administrativos neerlandeses: par directo nl→es para comunicaciones personales o internas en entornos hispanohablantes.
- Evaluacion de tecnicas de alineacion de atencion: la salida adicional permite experimentar con alineamiento lexico sin modificar los pesos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa aproximadamente 0,1 GB, lo que sugiere requisitos de memoria muy reducidos en INT8.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU movil mediante onnxruntime.
- Compatibilidad con GPU de consumo: no disponible; por tamano, es probable que quepa en cualquier GPU de consumo, pero no se confirma en la informacion.
- Opciones de despliegue: onnxruntime (formato nativo del repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-nl-es-int8-shift-att | no disponible | no disponible | nl→es | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-nl-es | no disponible | no disponible | nl→es | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en→es | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-nl-en | no disponible | no disponible | nl→en | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita a modelos de la misma familia OPUS-MT; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al entrenarse sobre OPUS, puede heredar sesgos de dominio y estilo de ese corpus.
- Riesgo de alucinacion: propio de los modelos de traduccion neuronal; puede generar traducciones fluidas pero incorrectas en segmentos ambiguos o ruidosos.
- Limitaciones de contexto: no se especifica la longitud maxima de secuencia; el modelo base Marian suele estar limitado a segmentos cortos, pero este dato no se confirma.
- Limitaciones de idioma: solo cubre neerlandes→espanol; no traduce otros pares ni direccion inversa.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribucion; debe citarse el trabajo de Tiedemann y Thottingal (2020) y respetarse las condiciones de la licencia.
- Caveat para produccion: el repositorio esta orientado a la app Subtitle Tap y a onnxruntime; no se documentan pruebas de robustez, evaluacion de calidad ni soporte para otros entornos de despliegue.
- La salida de alineacion es una identidad sobre un nodo existente y no altera la decodificacion, pero su utilidad practica no esta evaluada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-nl-es-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-es
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
