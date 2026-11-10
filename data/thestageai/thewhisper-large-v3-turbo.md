# TheStageAI/thewhisper-large-v3-turbo

## Resumen

TheWhisper-Large-V3-Turbo es una variante optimizada de openai/whisper-large-v3-turbo, desarrollada por TheStage AI para inferencia de reconocimiento automatico del habla (ASR) en tiempo real, con baja latencia y bajo consumo energetico. Se distribuye como parte de la familia "ElasticModels", generados por la herramienta ANNA (Automated Neural Networks Accelerator) de TheStage AI, que permite ajustar tamano, latencia y calidad del modelo mediante la seleccion de variantes XL, L, M y S, cada una con un nivel de degradacion acotado respecto al modelo original.

El modelo base es un transformer encoder-decoder de Whisper large-v3-turbo (808.878.080 parametros segun los pesos en safetensors), reentrenado y comprimido para ejecutarse en NVIDIA GPUs (CUDA 12.8+), Apple Silicon (CoreML / Neural Engine) y Android con Qualcomm Snapdragon. Soporta 28 idiomas y esta pensado para despliegues on-device y en servidor con requisitos estrictos de latencia, como transcripcion en streaming, subtitulado en directo o asistentes de voz.

Su relevancia actual radica en que ofrece una ruta de despliegue multiplataforma (CoreML, ONNX, safetensors, CUDA) sobre un modelo de reconocimiento de voz consolidado, con licencia CC-BY-4.0 y variantes de compresion que permiten elegir el punto de equilibrio entre precision y velocidad sin cambiar de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), optimizado por TheStage AI |
| Parametros totales | 808.878.080 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio por chunk configurable, p. ej. 10-15 s en los ejemplos) |
| Tipos de cuantizacion | Variantes ElasticModels XL, L, M y S (compresion por capas); pesos en safetensors, ONNX y CoreML |
| Idiomas soportados | 28: en, ar, bg, bn, cs, da, de, el, es, et, fi, fr, hi, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, uk, vi |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX, CoreML |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con atencion estandar, disenado para transcripcion multilingue y traduccion de voz a texto. TheStage AI aplica sobre el una optimizacion mediante su compilador de redes neuronales (ANNA), que enruta distintos algoritmos de compresion a distintas capas para producir cuatro variantes: XL (matematicamente equivalente, optimizada solo por compilacion), L (degradacion menor al 1% en los benchmarks correspondientes), M (degradacion menor al 1,5%) y S (degradacion menor al 2%).

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo ASR, el ajuste se orienta a la tarea de transcripcion y no a preferencias humanas. La innovacion principal es la propia metodologia de compresion elastica por capas y la generacion de artefactos especificos para CoreML (Neural Engine de Apple) y Qualcomm Snapdragon, ademas de los pesos para CUDA. El modelo soporta inferencia en streaming mediante chunking configurable (por ejemplo, `chunk_length_s` de 10 o 15 segundos) a traves de `thestage_speechkit`.

## Capacidades

- Reconocimiento automatico del habla multilingue en 28 idiomas, incluidos espanol, ingles, aleman, frances, italiano, portugues, ruso, arabe, hindi y vietnamita, entre otros.
- Transcripcion de audio por lotes y en streaming con chunks configurables y `step_size_s` ajustable en el pipeline de microfono.
- Traduccion de voz a texto (capacidad heredada de Whisper large-v3-turbo; no se detalla explicitamente en la model card).
- Inferencia en tiempo real de baja latencia y bajo consumo en NVIDIA GPUs, Apple Silicon y Android con Qualcomm Snapdragon.
- Despliegue on-device en iOS, macOS y Android mediante CoreML y SDKs especificos (AppleSDK, AndroidSDK).
- Ejecucion en servidor con CUDA 12.8+ y contenedores Docker con endpoints REST API.
- Seleccion de variante de calidad/velocidad (XL, L, M, S) sin cambiar de API.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un modelo ASR.

## Casos de uso

- Transcripcion en streaming de reuniones y videollamadas: el pipeline `StreamingPipeline` con `MicStream` y `chunk_length_s` de 15 s permite generar subtitulos casi en tiempo real en Apple Silicon o NVIDIA, con latencia reducida gracias a las variantes M o S.
- Subtitulado en directo de eventos y retransmisiones: la variante S, con degradacion menor al 2%, prioriza velocidad para alimentar un sistema de subtitulos con actualizaciones cada 0,5 s (`step_size_s=0.5`).
- Asistentes de voz on-device en iOS y macOS: los artefactos CoreML permiten ejecutar el modelo en el Neural Engine sin conexion a la nube, reduciendo coste y mejorando la privacidad del audio del usuario.
- Dictado y notas de voz en Android: el soporte para Qualcomm Snapdragon y los formatos ONNX/CoreML habilitan transcripcion local en dispositivos moviles de gama alta.
- Analitica de centros de llamadas: procesamiento por lotes (`batch_size=32`, `chunk_length_s=15`) sobre grabaciones para generar transcripciones indexables y alimentar busquedas o resumenes posteriores.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en aplicaciones de video, usando la variante L para maximizar fidelidad con degradacion inferior al 1%.
- Investigacion en ASR multilingue: evaluacion comparativa de las cuatro variantes ElasticModels sobre corpus en los 28 idiomas soportados, con control explicito del compromiso precision/velocidad.
- Despliegue en servidor con REST API: contenedores Docker con endpoints para integrar la transcripcion en pipelines de terceros sin gestionar CUDA manualmente.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (WER, MMLU, etc.) en la informacion disponible. La model card solo indica los umbrales de degradacion de cada variante respecto al modelo original: XL equivalente matematicamente, L con menos del 1%, M con menos del 1,5% y S con menos del 2%. No se especifica la metrica exacta sobre la que se mide esa degradacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 808,9 M de parametros, en fp16 el modelo requiere aproximadamente 1,6 GB solo para pesos; en fp32, unos 3,2 GB. La VRAM real dependera de la variante ElasticModels, del tamano de lote y del chunking de audio.
- GPU recomendadas por el autor: NVIDIA L40s, RTX 4090, RTX 5090 y H100.
- Requisitos de sistema indicados: Python 3.10-3.12, CPU Intel/AMD x86_64, CUDA 12.8 o superior.
- Cabe en GPU de consumo: si, segun el autor, en RTX 4090 y RTX 5090.
- Plataformas adicionales: Apple Silicon (CoreML / Neural Engine) y Android con Qualcomm Snapdragon.
- Opciones de despliegue: SDK `thestage-elastic-models` (interfaz compatible con HuggingFace Transformers), `thestage_speechkit` para NVIDIA y Apple Silicon, contenedores Docker con REST API, y artefactos CoreML/ONNX.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheStageAI/thewhisper-large-v3-turbo | 808,9 M | chunk configurable (10-15 s en ejemplos) | 28 | cc-by-4.0 | Hugging Face, SDK propio, Docker |
| openai/whisper-large-v3-turbo | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos especificos; al heredar el comportamiento de Whisper large-v3-turbo, es previsible un rendimiento desigual entre idiomas y acentos, aunque no se cuantifica.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comun en modelos ASR; no se detalla mitigacion especifica.
- Las variantes M y S introducen degradacion de precision de hasta el 1,5% y el 2% respectivamente, lo que puede afectar a dominios especializados (terminologia medica, juridica o nombres propios).
- El acceso al SDK `thestage-elastic-models` requiere un token de acceso de TheStage AI (`thestage config set --access-token`), lo que anade una dependencia de proveedor.
- El repositorio ocupa 250,4 GB, lo que implica una descarga considerable si se necesitan todas las variantes y formatos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; conviene verificar los terminos del modelo base de OpenAI para usos derivados.
- No se documentan limitaciones de longitud de contexto en terminos de tokens; el rendimiento en audio muy largo dependera del chunking y de la gestion de solapamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio TheWhisper: https://github.com/TheStageAI/TheWhisper/tree/main
- SDK Apple: https://github.com/TheStageAI/AppleSDK
- SDK Android: https://github.com/TheStageAI/AndroidSDK
