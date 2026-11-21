# ukrbublik/opus-mt-sv-uk-int8-shift-att

## Resumen

OPUS-MT sv→uk INT8 con salida de alineamiento (shift-att) es una conversion del modelo de traduccion automatica Helsinki-NLP/opus-mt-sv-uk, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversion, ukrbublik, lo publica empaquetado en formato ONNX con cuantizacion dinamica INT8 para su uso en el runtime on-device de la aplicacion Android Subtitle Tap. Resuelve la traduccion directa sueco-ucraniano sin pivotar por el ingles.

Arquitectura Marian (transformer encoder-decoder), con exportacion via optimum a opset 17 sin past key/values y cuantizacion QInt8 por tensor con onnxruntime. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el reducido tamano tipico de los modelos OPUS-MT de traduccion. Es relevante para despliegues en dispositivos moviles y entornos sin GPU, donde el formato ONNX INT8 permite inferencia en CPU con huella de memoria minima.

La innovacion principal respecto al modelo base es la exposicion de `alignment_shift_l2`: las probabilidades de atencion encoder-decoder de la capa 2, utiles para alinear palabras entre origen y destino en tareas de subtitulado. Los pesos y el proceso de decodificacion no se modifican respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | sueco (sv) como origen, ucraniano (uk) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-sv-uk es un transformer encoder-decoder de la familia Marian, entrenado por el grupo de investigacion de tecnologia del lenguaje de la Universidad de Helsinki sobre datos del corpus OPUS (Tiedemann y Thottingal, EAMT 2020). Esta conversion mantiene los pesos originales de la revision `98be9a979a641cfa0a51696319f96d8e7b9f54e3` y solo altera el formato: exportacion con optimum a opset 17 sin past key/values y cuantizacion dinamica INT8 por tensor.

La modificacion tecnica anadida es la salida `alignment_shift_l2`, que expone las probabilidades de atencion encoder-decoder de la capa 2 del decodificador mediante una operacion Identity sobre un nodo existente. Esto permite obtener alineamientos a nivel de token entre el sueco y el ucraniano sin cambiar la decodificacion ni los pesos. El paquete incluye ademas `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece mapeadas a ids de vocabulario, junto con las cadenas objetivo) y `alignment.json`, un recibo que vincula la salida de alineamiento al SHA-256 del decodificador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Traduccion automatica directa sueco a ucraniano, sin pivot intermedio por ingles.
- Generacion de alineamientos token a token entre origen y destino mediante la salida `alignment_shift_l2` (atencion de la capa 2 del decodificador).
- Inferencia en CPU y en dispositivos moviles gracias a la cuantizacion INT8 y al formato ONNX.
- Integracion con onnxruntime para ejecucion sin dependencias de PyTorch en produccion.
- Tokenizacion autocontenida mediante `tokenizer_runtime.json`, sin necesidad de cargar el modelo SentencePiece original.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap usa el modelo para traducir subtitulos suecos a ucraniano en el dispositivo, con la salida de alineamiento permitiendo sincronizar y segmentar los subtitulos traducidos respecto a los originales.
- Traduccion offline en movilidad: al ejecutarse con onnxruntime en CPU y ocupar aproximadamente 0,1 GB, puede desplegarse en telefonos sin conexion ni GPU, cubriendo escenarios de viaje o redes restringidas.
- Procesamiento por lotes de documentos suecos a ucraniano en servidores sin GPU: la cuantizacion INT8 reduce los requisitos de memoria y acelera la inferencia en CPU frente al modelo en punto flotante.
- Localizacion de contenido editorial: traduccion de articulos, notas de prensa o documentacion del sueco al ucraniano con un modelo ligero que puede integrarse en pipelines de CI/CD de publicacion.
- Analisis contrastivo y estudios linguisticos: la salida de alineamiento permite extraer correspondencias lexicas sueco-ucraniano para construir glosarios o evaluar traducciones a nivel de palabra.
- Preprocesamiento en sistemas de traduccion asistida: generacion de una primera version traducida con alineamientos que un traductor humano o un corrector automatico puede revisar y editar.
- Prototipado rapido de servicios de traduccion bilingue: el formato ONNX y la licencia Apache 2.0 facilitan la experimentacion y el despliegue comercial sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (aproximadamente 0,1 GB) y la cuantizacion INT8, la huella de memoria es inferior a 1 GB, apta para CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para inferencia en CPU con onnxruntime. Cualquier GPU compatible con onnxruntime (por ejemplo, RTX 4090, A100, H100) podria ejecutarlo, pero no es el objetivo del paquete.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con soporte ONNX, aunque su uso previsto es en CPU y dispositivos moviles.
- Opciones de despliegue: onnxruntime (runtime objetivo, usado por la app Subtitle Tap); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos Marian ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-sv-uk-int8-shift-att | no disponible | no disponible | sv→uk | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-sv-uk (base) | no disponible | no disponible | sv→uk | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-sv-ru | no disponible | no disponible | sv→ru | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-tc-big-sv-uk | no disponible | no disponible | sv→uk | Apache 2.0 | safetensors/PyTorch |

La comparativa se limita a modelos de la misma familia OPUS-MT, ya que no se dispone de datos de rendimiento ni de parametros exactos para establecer comparaciones cuantitativas con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo de traduccion unidireccional: solo traduce de sueco a ucraniano; no soporta el sentido inverso ni otros pares de idiomas.
- Riesgo de alucinacion y errores de traduccion en terminos especializados, nombres propios o estructuras gramaticales poco frecuentes, inherente a los modelos OPUS-MT de tamano reducido.
- La cuantizacion INT8 puede introducir una ligera perdida de calidad respecto al modelo en punto flotante original; no se documenta la magnitud de esta degradacion.
- No se dispone de informacion sobre sesgos especificos del corpus OPUS ni sobre su comportamiento en variedades dialectales del sueco o del ucraniano.
- La salida `alignment_shift_l2` corresponde a la atencion de una unica capa (la 2) y no debe interpretarse como un alineamiento perfecto; su calidad no esta evaluada en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal) y citar la publicacion EAMT 2020.
- El modelo esta empaquetado para un runtime concreto (Subtitle Tap); su integracion en otros sistemas requiere adaptar el cargador de tokenizer y las salidas ONNX.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso; no debe emplearse fuera de tareas de traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-sv-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-uk
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Publicacion OPUS-MT (Tiedemann y Thottingal, EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Corpus OPUS: https://opus.nlpl.eu/
- Documentacion de onnxruntime: https://onnxruntime.ai/
- Herramienta optimum de Hugging Face: https://huggingface.co/docs/optimum
