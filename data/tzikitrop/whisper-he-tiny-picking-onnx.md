# tzikitrop/whisper-he-tiny-picking-onnx

## Resumen

Whisper-he-tiny-picking-onnx es un ajuste fino del modelo de reconocimiento automatico de voz Whisper-tiny, publicado por el usuario tzikitrop en HuggingFace. El modelo parte de la variante hebrea yoad/whisper-tiny y se ha especializado en el vocabulario propio de la operativa de "voice picking" en almacen: numeros del 1 al 100 y comandos de picking. Su proposito no es la transcripcion general, sino reconocer de forma fiable las locuciones cortas que un operario pronuncia para confirmar cantidades y acciones durante la preparacion de pedidos.

La relevancia de este modelo radica en su formato de despliegue. Se ha exportado a ONNX con cuantizacion q8 para ejecutarse con Transformers.js 3.7.1 directamente en el navegador sobre WebAssembly, sin necesidad de servidor ni GPU. Con un repositorio de aproximadamente 0,1 GB, encaja en escenarios de borde (dispositivos de almacen, tablets, terminales portatiles) donde no se quiere depender de conectividad ni de infraestructura en la nube.

Al tratarse de un derivado de Whisper-tiny, hereda la arquitectura encoder-decoder de tipo transformer de OpenAI, con un tamano muy reducido. El modelo esta entrenado y evaluado exclusivamente para hebreo (codigo de idioma `he`) y esta sesgado hacia un dominio lexico muy estrecho, lo que condiciona tanto sus virtudes (precision alta en ese vocabulario) como sus limites fuera de el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, heredada del modelo base yoad/whisper-tiny) |
| Parametros totales | aproximadamente 39 millones (correspondientes a Whisper-tiny; no confirmado explicitamente en la model card) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (estandar de la familia Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | q8 (ONNX cuantizado a 8 bits; unico formato publicado) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (para Transformers.js 3.7.1) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `yoad/whisper-tiny`, a su vez derivado de Whisper-tiny de OpenAI. Whisper es un transformer encoder-decoder disenado para tareas de reconocimiento y traduccion de voz; la variante tiny es la mas pequena de la familia, con una dimension de modelo reducida que la hace apta para despliegues ligeros y ejecucion en CPU. Sobre esa base, el autor ha realizado un fine-tuning orientado a un dominio concreto: el vocabulario de voice picking en almacen.

El conjunto de entrenamiento, segun la model card, se compone de habla sintetica generada con muchas voces y acentos, ruido de almacen, reverberacion y simulacion de microfono de telefono. Esta estrategia de aumento de datos busca que el modelo sea robusto en condiciones reales de un almacen (ruido de fondo, microfonos de baja calidad) y frente a operarios con distintos acentos. No se especifica en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en modelos de ASR especializados. La innovacion destacable es el propio proceso de exportacion a q8 ONNX pensado para inferencia en navegador mediante WebAssembly.

## Capacidades

- Reconocimiento automatico de voz (ASR) en hebreo para vocabulario restringido de almacen: numeros del 1 al 100 y comandos de picking.
- Transcripcion de locuciones cortas con `task: 'transcribe'` y `language: 'hebrew'`.
- Robustez declarada frente a ruido de almacen, reverberacion y microfonos de telefono (segun los conjuntos sinteticos usados en el entrenamiento).
- Tolerancia a acentos distintos del nativo (arabe, aleman, italiano, ruso), segun la tabla de precision de la model card.
- Ejecucion en navegador mediante Transformers.js 3.7.1 sobre WASM, sin GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio en tiempo real ni capacidades multilingues mas alla del hebreo.

## Casos de uso

- Confirmacion de cantidades en voice picking: el operario pronuncia numeros (1-100) para indicar unidades recogidas y el modelo los transcribe para cerrar la linea de pedido; su entrenamiento especifico en ese rango numerico reduce errores frente a un ASR general.
- Ejecucion de comandos de almacen por voz: reconocimiento de ordenes de picking predefinidas que la terminal traduce en acciones del sistema de gestion de almacen (WMS).
- Terminal de mano sin conectividad: al ejecutarse en ONNX/WASM en el propio dispositivo, permite operar en zonas de almacen sin cobertura de red.
- Integracion en aplicaciones web de logistica: mediante la API de Transformers.js se puede insertar el reconocimiento en una interfaz web interna sin desplegar backend de inferencia.
- Control por voz manos libres: operarios que llevan guantes o manejan mercancia pueden confirmar acciones sin tocar pantalla ni teclado.
- Verificacion por voz en entornos ruidosos: gracias al entrenamiento con ruido y reverb sinteticos, esta pensado para funcionar con SNR bajo (hasta -5 dB segun las pruebas del autor).
- Prototipado rapido de asistentes de voz sectoriales: sirve como referencia de como especializar un Whisper-tiny a un vocabulario cerrado y exportarlo a un formato ligero.

## Benchmarks y rendimiento

La model card publica una tabla de "accuracy" medida sobre la accion que la pagina tomaria (es decir, acierto en la interpretacion del comando), no un WER estandar sobre corpus publicos. Los datos son los siguientes:

| Conjunto de evaluacion | Precision |
|---|---|
| accent:arabic | 99,2% |
| accent:german | 97,3% |
| accent:italian | 98,6% |
| accent:native | 98,1% |
| accent:none | 94,7% |
| accent:russian | 98,8% |
| all | 98,3% |
| snr_-5 | 94,6% |
| snr_0 | 97,8% |
| snr_5 | 98,9% |
| snr_10 | 99,3% |
| snr_20 | 99,4% |
| snr_clean | 100,0% |
| synth_all | 98,3% |

Estos valores corresponden a evaluaciones sobre habla sintetica en el dominio de voice picking y no son comparables con benchmarks generales de ASR como LibriSpeech,Common Voice ni con WER sobre hebreo espontaneo. No se han publicado resultados en benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula en GPU; el modelo esta pensado para CPU/WASM. El repositorio pesa alrededor de 0,1 GB.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU de escritorio, movil o dispositivo integrado.
- Cabe en GPU de consumo: si, en cualquiera (e incluso en CPU), dado el tamano tiny y la cuantizacion q8.
- Opciones de despliegue: Transformers.js 3.7.1 (navegador, WebAssembly), y por el formato ONNX tambien ONNX Runtime en entornos nativos. No se documenta soporte nativo para vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo tiny cuantizado a q8 en WASM, se espera una latencia baja en fragmentos cortos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tzikitrop/whisper-he-tiny-picking-onnx | ~39 M (tiny) | 30 s (Whisper) | hebreo | no disponible | ONNX q8 | Especializado en voice picking; ejecucion en navegador |
| yoad/whisper-tiny (modelo base) | ~39 M (tiny) | 30 s (Whisper) | hebreo | no disponible | safetensors / transformers | Base generalista en hebreo, sin especializacion en picking |
| onnx-community/whisper-tiny | ~39 M (tiny) | 30 s (Whisper) | multilingue | licencia de Whisper (MIT para el codigo; terminos del modelo) | ONNX | Version ONNX generica multilingue de Whisper-tiny |
| OpenAI Whisper-tiny (original) | ~39 M | 30 s | multilingue | MIT (codigo) | PyTorch | Modelo original de referencia multilingue |

Los datos de parametros y contexto de Whisper-tiny son caracteristicas conocidas de la familia base y no se detallan en la model card de este derivado. No se dispone de comparativas de rendimiento publicadas frente a estos modelos en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo esta optimizado para numeros del 1 al 100 y comandos de picking; fuera de ese vocabulario su precision no esta garantizada.
- Entrenamiento con habla sintetica: los resultados de precision proceden de conjuntos sinteticos, lo que puede no reflejar el rendimiento con voces humanas reales en produccion.
- Idioma unico: solo hebreo; no se documentan capacidades multilingues.
- Riesgo de alucinacion: como cualquier modelo de ASR, puede generar transcripciones plausibles pero incorrectas cuando la senal es ambigua o esta fuera de dominio.
- Sesgos: el uso de voces sinteticas con acentos concretos (arabe, aleman, italiano, ruso, nativo) puede introducir sesgos hacia esos perfiles y degradar el rendimiento con otros acentos no representados.
- Licencia no disponible: al no indicarse terminos de licencia, existe incertidumbre sobre el uso comercial y la redistribucion, agravada por depender de la licencia del modelo base y de Whisper.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion externa ni comunidad que reporte problemas.
- Casos de SNR muy baja: incluso en el mejor escenario de ruido, la precision cae (94,6% a -5 dB), lo que exige verificar la interpretacion en entornos muy ruidosos.
- Formato unico: solo se publica ONNX q8, lo que limita su uso fuera de Transformers.js u ONNX Runtime sin reconvertir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tzikitrop/whisper-he-tiny-picking-onnx
- Modelo base: https://huggingface.co/yoad/whisper-tiny
- Whisper-tiny en ONNX (onnx-community): https://huggingface.co/onnx-community/whisper-tiny
- Version relacionada del autor: https://huggingface.co/tzikitrop/whisper-he-tiny-onnx
- Documentacion de modelos ONNX: https://onnxruntime.ai/models
- Whisper (sistema de reconocimiento de voz) - Wikipedia: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
