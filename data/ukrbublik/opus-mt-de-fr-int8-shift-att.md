# ukrbublik/opus-mt-de-fr-int8-shift-att

## Resumen

Este repositorio contiene una conversion a ONNX con cuantizacion INT8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-de-fr, desarrollado originalmente por el Grupo de Investigacion en Tecnologia del Lenguaje de la Universidad de Helsinki (OPUS-MT, Jorg Tiedemann et al.). El autor de la conversion es ukrbublik, que la prepara especificamente para el runtime OPUS on-device de la aplicacion Android Subtitle Tap, con el objetivo de traducir subtitulos del aleman al frances directamente, sin pivotar por el ingles.

La relevancia de esta ficha no esta en el modelo de traduccion en si (un Marian de la familia OPUS-MT, ya ampliamente conocido), sino en el formato de despliegue: exportacion ONNX con opset 17 sin past key/values, cuantizacion dinamica INT8 por tensor (QInt8) mediante onnxruntime, y una salida adicional de alineacion (`alignment_shift_l2`) que expone las probabilidades de atencion encoder-decoder de la capa 2 del decoder, util para alinear palabras entre origen y destino en interfaces de subtitulacion.

El repositorio es pequeno (0,1 GB), esta publicado bajo licencia Apache 2.0 y no registra descargas ni likes en el momento de la consulta. La model card es explicita: los pesos son los originales de OPUS-MT y la conversion solo modifica el formato de los ficheros (exportacion ONNX y cuantizacion INT8), sin reentrenamiento ni cambios en el decodificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX (opset 17, sin past key/values) |
| Parametros totales | no disponible (modelo base OPUS-MT de escala base; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; pesos originales en el modelo base |
| Idiomas soportados | aleman (de) como origen; frances (fr) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`); tokenizer en `tokenizer_runtime.json`; metadatos de alineacion en `alignment.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian de traduccion neuronal, la arquitectura encoder-decoder tipo Transformer usada por la familia OPUS-MT, entrenada por la Universidad de Helsinki sobre datos del corpus OPUS (Tiedemann y Thottingal, EAMT 2020). Esta conversion concreta no introduce cambios de entrenamiento: parte de la revision `2b4fe242d21e50e89d2917fa4d0b3616d157e339` de Helsinki-NLP/opus-mt-de-fr y solo altera el formato.

La innovacion tecnica del repositorio es doble. Por un lado, la exportacion con optimum a ONNX opset 17 sin past key/values, lo que simplifica el grafo para inferencia on-device (se recalcula el decoder en cada paso en lugar de reutilizar cache). Por otro, la cuantizacion dinamica INT8 por tensor con onnxruntime, que reduce el peso del modelo a aproximadamente 0,1 GB de repositorio. Adicionalmente, el decoder expone `alignment_shift_l2`, una salida que replica (mediante una operacion Identity sobre un nodo existente) las probabilidades de atencion encoder-decoder de la capa 2, sin modificar pesos ni decodificado. El fichero `alignment.json` actua como recibo que vincula esa salida al SHA-256 del decoder, y `tokenizer_runtime.json` mapea las piezas y puntuaciones del SentencePiece original a ids de vocabulario y cadenas de tokens destino.

## Capacidades

- Traduccion automatica directa de aleman a frances, sin pivot intermedio por ingles.
- Generacion de texto traducido token a token con decodificado autoregresivo estandar de Marian.
- Salida de alineacion a nivel de capa 2 del decoder (`alignment_shift_l2`), util para mapear tokens origen-destino.
- Tokenizacion SentencePiece empaquetada en formato JSON para uso en runtime propio.
- Inferencia on-device via ONNX Runtime con pesos INT8.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito.
- Cobertura multilingue limitada estrictamente al par de idiomas de/fr.

## Casos de uso

- Traduccion de subtitulos en aplicaciones Android: el modelo esta preparado para el runtime OPUS on-device de Subtitle Tap, traduciendo lineas de subtitulo de aleman a frances localmente, sin depender de servicios en la nube y con un repositorio de 0,1 GB.
- Alineacion palabra a palabra en interfaces de subtitulado: la salida `alignment_shift_l2` permite resaltar el token frances correspondiente mientras se muestra el subtitulo aleman, mejorando la experiencia de aprendizaje de idiomas.
- Traduccion offline en dispositivos con recursos limitados: la cuantizacion INT8 y la exportacion ONNX sin cache de decoder reducen el coste de memoria y simplifican el grafo, lo que encaja en telefonos y tablets.
- Preprocesado de corpus bilingues: la salida de alineacion puede usarse para generar pares de palabras o frases alineadas a partir de textos de/fr, por ejemplo para construir memorias de traduccion.
- Integracion en pipelines de traduccion por lotes: ONNX Runtime permite ejecutar el modelo en CPU o GPU en servidores ligeros, sin necesidad de frameworks como PyTorch en produccion.
- Prototipado de sistemas de traduccion embebidos: al estar en ONNX, el modelo puede integrarse en aplicaciones de escritorio, navegador (via WebAssembly/ONNX Runtime Web) o entornos con dependencias minimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que el modelo INT8 cabe holgadamente en memoria de dispositivos moviles y GPUs consumer.
- GPU recomendadas: no disponible; al tratarse de un modelo de traduccion de escala base en ONNX, cualquier GPU consumer (por ejemplo, serie RTX 40) o incluso CPU moderna es suficiente.
- Cabe en GPU consumer: si, por el tamano del repositorio y la cuantizacion INT8.
- Opciones de despliegue: ONNX Runtime (runtime objetivo del autor, on-device en Android), con posibilidad de ejecucion en CPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-de-fr-int8-shift-att | no disponible (escala base OPUS-MT) | no disponible | de→fr | Apache 2.0 | ONNX INT8 | Salida de alineacion y runtime on-device |
| Helsinki-NLP/opus-mt-de-fr | no disponible (escala base OPUS-MT) | no disponible | de→fr | Apache 2.0 | safetensors/PyTorch (formato original) | Modelo base sin cuantizacion ni salida de alineacion |
| Helsinki-NLP/opus-mt-en-de o similares de la familia OPUS-MT | no disponible | no disponible | pares diversos | Apache 2.0 | safetensors/PyTorch | Misma familia y arquitectura, otros pares de idiomas |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo traduce de aleman a frances; no cubre otras direcciones ni pares de idiomas.
- La cuantizacion INT8 puede introducir una perdida de calidad respecto a los pesos originales en punto flotante; no se documenta una evaluacion de esa perdida.
- La exportacion sin past key/values implica recalcular el decoder en cada paso, lo que puede aumentar la latencia frente a variantes con cache.
- Riesgo de alucinacion y errores de traduccion inherentes a los modelos Marian de escala base, especialmente en frases largas, terminologia especializada o dominio tecnico.
- Sesgos presentes en los datos de entrenamiento OPUS (corpus mayoritariamente de dominio publico y paralelo), que pueden reflejar sesgos de genero, registro o culturales.
- La salida de alineacion es una aproximacion basada en atencion de capa 2; no es una alineacion linguistica garantizada.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribucion a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio no registra descargas ni validacion de la comunidad en el momento de la consulta; su uso en produccion deberia acompanarse de pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-de-fr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-fr
- Referencia de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible en la informacion proporcionada como enlace directo.
