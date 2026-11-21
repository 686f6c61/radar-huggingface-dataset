# ukrbublik/opus-mt-en-pt-int8-shift-att

## Resumen

Este repositorio contiene una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-tc-big-en-pt, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. La conversion la firma el usuario ukrbublik y esta pensada para el motor OPUS en dispositivo de la aplicacion Android Subtitle Tap, por lo que el objetivo no es servir como modelo generalista sino como artefacto de inferencia ligero y embebible.

El modelo traduce directamente de ingles a portugues, sin pivote intermedio por otra lengua, y anade una salida auxiliar de alineamiento (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2. Esa senal permite construir alineamientos a nivel de token entre origen y destino, util para subtitulado, resaltado sincronizado o verificacion de traducciones.

La relevancia practica esta en el formato: dos grafos ONNX (encoder y decoder) cuantizados dinamicamente a INT8 con onnxruntime, un tokenizer serializado en JSON y un fichero de recibo con el SHA-256 del decoder. Todo el repo ocupa unos 0,3 GB, lo que lo hace viable en movil y en entornos sin GPU. La licencia es cc-by-4.0 y hereda la atribucion del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | en (origen), pt (destino) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (opset 17, sin past key/values), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es un Marian de tipo transformer encoder-decoder, la arquitectura estandar de la familia OPUS-MT, entrenado por la Universidad de Helsinki sobre corpus OPUS. El checkpoint de origen, `opus-mt-tc-big-en-pt`, es multilingue en el lado destino y selecciona el portugues mediante el token de prefijo `>>por<<`, que esta conversion inyecta automaticamente antes de cada frase de entrada a traves de `sourcePrefixTokenIds` en el tokenizer de runtime.

Esta version no reentrena pesos: solo cambia el formato. Se exporta con optimum a ONNX en opset 17, sin cache de claves y valores (decoder sin past), y se aplica cuantizacion dinamica INT8 por tensor con onnxruntime. La unica modificacion funcional es la exposicion de `alignment_shift_l2`, que es una identidad sobre un nodo existente de atencion de la capa 2 del decoder; los pesos y el proceso de decodificacion no varian. Los detalles de entrenamiento del modelo original (numero de tokens, composicion exacta del corpus, si hubo fine-tuning adicional) no se detallan en la informacion disponible.

## Capacidades

- Traduccion directa en a pt sin pivote intermedio por ingles.
- Traduccion de frases y parrafos completos, orientada a subtitulos y texto corrido.
- Salida auxiliar de alineamiento token a token (`alignment_shift_l2`) a partir de las probabilidades de atencion encoder-decoder de la capa 2.
- Tokenizer SentencePiece serializado con piezas, puntuaciones y mapeo a ids de vocabulario.
- Inferencia en dispositivo sin GPU mediante onnxruntime.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de traduccion.
- Capacidades multilingues limitadas a los pares declarados (en, pt); no cubre otras lenguas.

## Casos de uso

- Subtitulado automatico en dispositivo: la app puede traducir pistas de subtitulos en ingles a portugues sin conexion, con los dos grafos ONNX y el tokenizer JSON cargados en memoria; el tamano de 0,3 GB encaja en el almacenamiento de un movil.
- Sincronizacion y resaltado de subtitulos: la salida `alignment_shift_l2` permite mapear cada token traducido a su origen y asi marcar en pantalla la palabra que se esta pronunciando o resaltar el fragmento correspondiente.
- Traduccion de documentacion tecnica en ingles a portugues en pipelines offline: al ser ONNX INT8, se puede ejecutar en servidores sin GPU o en contenedores ligeros con onnxruntime.
- Preprocesado de corpus para NLP: usar el alineamiento para generar pares de frases alineadas a nivel de token y alimentar sistemas de recuperacion o evaluacion de traducciones.
- Traduccion de interfaces y cadenas de aplicacion: el modelo acepta frases cortas y puede integrarse en un flujo de localizacion por lotes, con la ventaja de no requerir servicios en la nube.
- Verificacion de traducciones en produccion: comparar la atencion de la capa 2 con alineamientos de referencia para detectar desalineaciones o traducciones sospechosas antes de publicar.
- Prototipado de sistemas de traduccion embebidos: sirve como referencia de como exportar un Marian a ONNX cuantizado con tokenizer propio y metadatos de integridad (SHA-256 del decoder).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser INT8 y ejecutarse con onnxruntime, el modelo cabe en CPU; en GPU la huella es reducida, aunque no se especifica el consumo exacto.
- GPU recomendadas: no se indican; el diseno apunta a inferencia en CPU y en dispositivo movil.
- Cabe en GPU de consumo: si, cualquier GPU con soporte de onnxruntime, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: onnxruntime (CPU o GPU), integracion en apps Android mediante el runtime OPUS de Subtitle Tap; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 0,3 GB, con dos grafos ONNX cuantizados y ficheros JSON auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-pt-int8-shift-att | no disponible | no disponible | en, pt | cc-by-4.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tc-big-en-pt (base) | no disponible | no disponible | en, pt | cc-by-4.0 | safetensors / PyTorch |
| Helsinki-NLP/opus-mt-en-pt | no disponible | no disponible | en, pt | cc-by-4.0 | safetensors / PyTorch |

La diferencia principal frente a los originales es el formato: esta version esta cuantizada a INT8, exportada a ONNX y anade la salida de alineamiento, mientras que los checkpoints de Helsinki estan en formato PyTorch y no exponen esa senal. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo traduce de ingles a portugues; no cubre otros pares ni direccion inversa.
- El modelo base es multilingue en destino y requiere el prefijo `>>por<<`; si se usa el tokenizer sin ese prefijo, la salida puede no ser portugues.
- La cuantizacion INT8 dinamica puede degradar ligeramente la calidad frente al modelo en precision completa; no se han publicado metricas de esa perdida.
- La salida de alineamiento es una identidad sobre la atencion de la capa 2, no un alineamiento supervisado; su calidad como alineador no esta validada en la informacion disponible.
- Riesgo de alusiones y sesgos heredado del corpus OPUS, que no esta documentado en esta ficha.
- Licencia cc-by-4.0: permite uso comercial con atribucion a los autores originales (Tiedemann y Thottingal, 2020) y al proyecto OPUS-MT.
- El decoder no usa cache de claves y valores, lo que puede penalizar el throughput en secuencias largas.
- No hay garantia de mantenimiento ni soporte por parte del autor de la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-pt-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Referencia de atribucion: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
