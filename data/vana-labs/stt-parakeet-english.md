# Vana-Labs/stt-parakeet-english

## Resumen

Vana-Labs/stt-parakeet-english es un paquete de pesos ONNX cuantizados a int8 para reconocimiento automatico del habla (ASR) en ingles, publicado por Vana Labs como espejo fijado para Tetro, su transcriptor de reuniones que se ejecuta enteramente en el equipo del usuario. No es un modelo entrenado desde cero: los ficheros son una copia sin modificar de los ONNX int8 de istupakov/parakeet-tdt-0.6b-v2-onnx (commit `0bbb45a3365852604aef28b538a8f066f4ccaa85`), que a su vez es una exportacion ONNX del modelo nvidia/parakeet-tdt-0.6b-v2 de NVIDIA.

La arquitectura subyacente es un encoder FastConformer acoplado a un decodificador de tipo Token-and-Duration Transducer (TDT), con aproximadamente 600 millones de parametros. El objetivo es la transcripcion de audio mono a 16 kHz con ejecucion local, sin dependencia de APIs en la nube, en un paquete de 0,7 GB distribuido bajo licencia CC-BY-4.0.

Su relevancia practica es doble. Por un lado, fija una revision concreta de los pesos para que las descargas de Tetro no dependan de repositorios de terceros ni de que estos cambien. Por otro, ofrece un formato int8 listo para la libreria onnx-asr, que cabe en hardware de consumo y habilita transcripcion en tiempo real sobre CPU o GPU modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Token-and-Duration Transducer (TDT: decodificador y red conjunta) |
| Parametros totales | 0,6 B (unos 600 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio por fragmentos, no una ventana de tokens declarada) |
| Tipos de cuantizacion | int8 (unica cuantizacion distribuida en este repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8: `encoder-model.int8.onnx`, `decoder_joint-model.int8.onnx`, `nemo128.onnx`; vocabulario en `vocab.txt` y configuracion `nemo-conformer-tdt` en `config.json` |
| Tamano del repositorio | 0,7 GB |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 |
| Entrada de audio | WAV mono a 16 kHz |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo combina un encoder FastConformer con un decodificador de tipo Token-and-Duration Transducer. FastConformer es una variante de Conformer orientada a eficiencia computacional, que aplica convoluciones separables en profundidad y submuestreo de la secuencia de entrada para reducir el coste de la atencion sobre audio largo. La cabeza TDT predice de forma conjunta el token de salida y su duracion, lo que disminuye el numero de pasos de decodificacion respecto a un transducer clasico y, en consecuencia, mejora la latencia en inferencia.

Este repositorio no contiene artefactos de entrenamiento: solo pesos exportados. La composicion del dataset de entrenamiento, el numero de horas de audio, asi como el uso de tecnicas de ajuste fino (RLHF, DPO u otras), no estan disponibles en la informacion proporcionada y corresponden al trabajo original de NVIDIA sobre nvidia/parakeet-tdt-0.6b-v2. La innovacion aportada por esta publicacion es de empaquetado y distribucion: conversion a ONNX, cuantizacion a int8 y separacion del preprocesador log-mel de 128 bandas (`nemo128.onnx`) para poder ejecutar todo el pipeline con onnx-asr en local.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio mono de 16 kHz.
- Inferencia completamente local: no requiere conexion de red ni envio de audio a servicios externos.
- Orientado por el autor a transcripcion en tiempo real (uso previsto en Tetro como transcriptor de reuniones local).
- Ejecucion sobre CPU mediante ONNX Runtime, sin necesidad de GPU.
- Carga directa con onnx-asr: `onnx_asr.load_model("nemo-conformer-tdt", "<ruta>", quantization="int8")`.
- Distribucion reproducible: los pesos estan anclados a un commit concreto, lo que evita cambios silenciosos en las descargas.
- Tool calling / function calling: no aplica, es un modelo ASR puro.
- Agentos y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; el modelo esta limitado a ingles.
- Vision, audio generativo, modo "thinking" o salida estructurada: no disponibles.
- Diarizacion de hablantes: no incluida en el modelo (requiere un componente externo).

## Casos de uso

- Transcripcion de reuniones con privacidad estricta: integrado en Tetro o en cualquier cliente onnx-asr, el audio nunca sale del equipo, lo que lo hace apto para entornos donde no se permite enviar conversaciones a APIs externas.
- Subtitulado en directo de videollamadas y streaming: al ejecutarse en local y sobre CPU, se puede encadenar sobre el flujo de audio del microfono sin coste por minuto y sin cuotas de servicio.
- Dictado y notas de voz en aplicaciones de escritorio: el paquete int8 de 0,7 GB se puede empaquetar dentro de una aplicacion de escritorio y arrancar sin descargas adicionales, gracias a que el repositorio funciona como espejo fijado.
- Indexacion y busqueda de archivos de audio en ingles: transcripcion por lotes de podcasts, clases grabadas o entrevistas para generar texto indexable, aprovechando que la inferencia en CPU permite procesar en segundo plano.
- Cumplimiento normativo en sectores regulados (sanidad, legal, banca): la combinacion de ejecucion offline y licencia CC-BY-4.0 permite desplegar transcripcion en infraestructura controlada con atribucion a NVIDIA, istupakov y Vana Labs.
- Accesibilidad de contenidos en ingles: generacion de subtitulos para videos y materiales formativos sin depender de servicios de terceros ni de cuotas de uso.
- Preprocesado de pipelines de NLP: la transcripcion se puede usar como primer paso de una cadena en la que despues un modelo de lenguaje resuma, clasifique o extraiga acciones de la reunion.
- Despliegue en equipos sin GPU: al ser ONNX int8, permite transcripcion en portatiles y servidores de CPU, util en flotas heterogeneas donde no se pueden asumir tarjetas graficas dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye cifras de WER ni comparaciones cuantitativas, y los resultados de busqueda solo ofrecen una valoracion cualitativa de la familia Parakeet (referida a otras variantes, como el modelo TDT de 1,1 B), sin numeros verificables aplicables a nvidia/parakeet-tdt-0.6b-v2.

| Benchmark | Este modelo (int8 ONNX) | nvidia/parakeet-tdt-0.6b-v2 | Parakeet TDT 1,1 B |
|---|---|---|---|
| WER en ingles | no disponible | no disponible | no disponible |
| Velocidad de inferencia | no disponible | no disponible | no disponible |
| Uso de memoria | no disponible | no disponible | no disponible |

## Requisitos de hardware

Las cifras de memoria de esta seccion son estimaciones derivadas del tamano de los pesos int8 publicados (0,7 GB de repositorio), no datos publicados por el autor.

- VRAM estimada para inferencia: en torno a 1-2 GB, incluyendo pesos int8 y activaciones intermedias del encoder y del decodificador.
- GPU recomendadas: cualquier GPU moderna compatible con el execution provider CUDA o TensorRT de ONNX Runtime (por ejemplo, RTX 3060 o superior, RTX 4090, A100, H100). Para este tamano de modelo, las GPU de gama alta quedan sobredimensionadas.
- GPU de consumo: si, cabe con holgura en cualquier GPU con 4 GB o mas de VRAM, y tambien en graficas integradas recientes si el backend lo permite.
- Ejecucion sin GPU: si, mediante ONNX Runtime en CPU, que es el escenario previsto para una aplicacion de escritorio.
- Opciones de despliegue: onnx-asr (Python) sobre ONNX Runtime (CPU, CUDA o TensorRT); integracion directa en aplicaciones de escritorio. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vana-Labs/stt-parakeet-english | 0,6 B | ingles | ONNX int8 | CC-BY-4.0 | Espejo fijado de los ONNX de istupakov; orientado a Tetro |
| istupakov/parakeet-tdt-0.6b-v2-onnx | 0,6 B | ingles | ONNX | no disponible | Exportacion ONNX original de la que procede este repositorio |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6 B | ingles | pesos NeMo | no disponible | Modelo base de NVIDIA |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 idiomas europeos, con deteccion automatica de idioma | no disponible | no disponible | Amplia v2 con soporte multilingue |
| Parakeet TDT 1,1 B | 1,1 B | ingles | no disponible | no disponible | Variante mayor de la familia, optimizada para GPU NVIDIA |

No se dispone de cifras comparativas de WER ni de velocidad entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles. No hay capacidades multilingues ni deteccion automatica de idioma.
- Es un espejo, no un modelo original: depende del trabajo de NVIDIA (entrenamiento) e istupakov (exportacion ONNX). Vana Labs solo redistribuye los ficheros, por lo que no cabe esperar mejoras ni soporte tecnico propio.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre estos pesos concretos.
- La cuantizacion int8 puede producir una ligera perdida de precision respecto a los pesos en fp32 o bf16 del modelo original; no se han publicado mediciones de esa diferencia.
- Riesgo de errores en audio con ruido de fondo, solapamiento de voces, acentos no nativos, audio telefónico o terminologia muy especifica (nombres propios, jerga tecnica, siglas).
- No incluye diarizacion de hablantes ni marcas de quien habla; tampoco se documenta en la informacion disponible si genera puntuacion y mayusculas automaticamente.
- Es un modelo ASR puro: no soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto libre.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir correctamente a NVIDIA (modelo), a istupakov (exportacion ONNX) y a Vana Labs (espejo).
- Para produccion conviene fijar la revision del repositorio (el propio autor lo hace con un commit concreto) y verificar la integridad de los ficheros descargados.
- La informacion disponible no incluye detalles sobre la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico ni de dominio del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Vana-Labs/stt-parakeet-english
- Exportacion ONNX de origen: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v2-onnx (commit `0bbb45a3365852604aef28b538a8f066f4ccaa85`)
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante multilingue v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Blog de NVIDIA Research sobre la familia Parakeet: https://research.nvidia.com/labs/conv-ai/blogs/2024/2024-01-parakeet/
- Ficha de la familia Parakeet en STT.ai: https://stt.ai/models/nvidia-parakeet/
- Utilidad macOS de transcripcion con diarizacion (Parakeet v3): https://github.com/jvsteiner/stt
- Articulo sobre el uso de Parakeet v3 con ONNX Runtime: https://devctrl.blog/posts/use-parakeet-v3-to-transcribe-your-audio-instead-of-typing/
- Proyecto Tetro (transcriptor de reuniones local de Vana Labs): no disponible
