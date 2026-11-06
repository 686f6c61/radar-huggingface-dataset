# TheGarageDev/Minus-v0.2

## Resumen

Minus-v0.2 es un modelo de vision-lenguaje de 450 millones de parametros desarrollado por TheGarageDev, un fine-tuning de LiquidAI/LFM2.5-VL-450M orientado a una tarea muy concreta: detectar anuncios publicitarios en emisiones de television y clasificar el estado de la pantalla. Forma parte del proyecto Minus, un dispositivo HDMI (streaming stick) que bloquea publicidad televisiva analizando la imagen que recibe, en lugar de inspeccionar metadatos o flujos de la aplicacion.

El modelo responde a dos preguntas sobre cada fotograma: si la imagen es un anuncio (respuesta Si/No) y en que estado se encuentra la pantalla (PLAYING, PAUSED, DIALOG, MENU o SCREENSAVER), lo que permite un modo autonomo de control del televisor. La relevancia practica esta en que sustituye a Minus-v0.1 como una actualizacion directa sobre el mismo hardware, con las mismas dimensiones y velocidad de inferencia, pero con mejoras sustanciales de precision medidas en el propio dispositivo.

La arquitectura subyacente es un VLM compacto de la familia LFM2.5 de LiquidAI (torre de vision mas decodificador de lenguaje), afinado mediante LoRA sobre las capas del modelo de lenguaje. El contexto, los idiomas soportados y otros detalles de la model card base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (LFM2.5-VL), transformer con torre de vision y decodificador de lenguaje de 16 capas |
| Parametros totales | 448.718.848 (~450M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (build especifico para NPU AX650 con hidden state en precision completa; el resto de detalles no se indican) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (Transformers); build adicional para NPU en el directorio `axera/` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-450M, un VLM de aproximadamente 450M de parametros con una torre de vision, un proyector y un decodificador de lenguaje de 16 capas. El fine-tuning se realizo con LoRA (r=16, alpha=32, dropout=0.05) aplicado unicamente a las capas del modelo de lenguaje, de modo que la torre de vision y el proyector permanecen identicos a los de Minus-v0.1. Se entreno durante 3 epocas con learning rate 2e-4 y batch efectivo de 32, fusionando los adaptadores tras el entrenamiento. Todo el entrenamiento se ejecuto en una NVIDIA Jetson AGX Thor.

El conjunto de datos, no publicado, consta de 101.080 muestras: el set de entrenamiento de Minus-v0.1 (fotogramas de television en streaming, anuncios web y negativos dificiles), 13.820 fotogramas de octubre revisados y 5.670 ejemplos de estado de pantalla. Una innovacion destacable es que todas las imagenes de entrenamiento se redimensionan directamente a 512x512 con interpolacion bilineal, reproduciendo la deformacion (squash de 16:9 a cuadrado) que aplica el dispositivo, lo que elimina la brecha entre el rendimiento en servidor y en el dispositivo. Ademas, se incorporaron 207 fotogramas sinteticos de videos ambientales con reloj y fecha estilo Fire TV dibujados, etiquetados como SCREENSAVER, junto a los mismos fotogramas sin reloj etiquetados como PLAYING, para que el modelo aprenda que la senal es el reloj y no el paisaje. El build para NPU mantiene el estado oculto residual de las 16 capas del decodificador en precision completa, ya que redondearlo a 16 bits costaba 17 puntos en la comprobacion de pantalla.

## Capacidades

- Clasificacion binaria de anuncios sobre un fotograma de television (respuesta Si/No).
- Clasificacion del estado de pantalla en cinco clases: PLAYING, PAUSED, DIALOG, MENU y SCREENSAVER.
- Comprension de imagen (image-text-to-text) mediante pipeline de Transformers.
- Razonamiento visual orientado a decisiones de bloqueo y control autonomo del televisor.
- Inferencia en dispositivos de borde con NPU Axera (AX650N / AX8850).
- Soporte de mensajes de sistema y formato conversacional (chat template de Transformers).
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo de razonamiento extendido.

## Casos de uso

- Bloqueo de publicidad en television en directo: el dispositivo captura cada fotograma, lo reduce a 512x512 y consulta al modelo si es un anuncio; si la respuesta es afirmativa, se sustituye la imagen o se silencia, con una latencia de unos 365 ms por fotograma en la NPU AX650.
- Control autonomo del televisor: la clasificacion de estado (PLAYING, PAUSED, DIALOG, MENU, SCREENSAVER) permite que el dispositivo decida cuando pausar, reanudar o cambiar de entrada sin intervencion del usuario.
- Deteccion de pantallas de salvapantallas frente a contenido ambiental: el modelo distingue videos ambientales (loops espaciales, historias para dormir) de un salvapantallas real gracias a la senal del reloj y la fecha, evitando acciones erroneas.
- Despliegue en hardware de borde de bajo consumo: el build `axera/` esta pensado para sticks HDMI con NPU Axera (por ejemplo Radxa AICore AX-M1), sin necesidad de servidor.
- Investigacion sobre sesgo de preprocesado: sirve como caso de estudio de como entrenar con la misma transformacion de imagen que usa el dispositivo (squash a 512x512) mejora la precision real frente a entrenar con redimensionado que preserva la relacion de aspecto.
- Filtrado de contenido publicitario en grabaciones: el modelo puede aplicarse fuera de linea sobre fotogramas extraidos de una grabacion para marcar o eliminar segmentos publicitarios.
- Prototipado de pipelines VLM ligeros: con 450M de parametros y pesos safetensors, es adecuado para experimentar con clasificacion visual en Transformers en una sola GPU consumer.

## Benchmarks y rendimiento

Resultados medidos en el dispositivo (NPU AX650), segun la model card:

| Metrica (en el dispositivo, AX650 NPU) | Minus-v0.1 | Minus-v0.2 |
|---|---|---|
| Precision en test de 800 imagenes | 95,6% | 99,1% |
| Recall de anuncios / recall de no anuncios | 93,8% / 97,5% | 99,8% / 98,5% |
| Precision en 328 fotogramas dificiles | 83,2% | 95,1% |
| Comprobacion de estado de pantalla (193 fotogramas) | 13,5% | 95,9% |
| Tiempo por fotograma | ~360 ms | ~365 ms |

En el conjunto de 800 imagenes, v0.2 falla 1 anuncio de cada 400 (frente a 25 de v0.1) y bloquea erroneamente 6 no anuncios (frente a 10). En los 328 fotogramas dificiles etiquetados a mano, los anuncios no detectados bajan de 46 a 11. En el modo autonomo, v0.1 respondia MENU en 29.974 de 29.979 ocasiones en un dispositivo real, mientras que v0.2 lee correctamente la pantalla el 95,9% de las veces y en los 135 fotogramas de video en reproduccion nunca responde algo que haga actuar al dispositivo (sin falsos SCREENSAVER, PAUSED ni DIALOG).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia en servidor: el modelo completo en float32 ocupa aproximadamente 1,7 GB en pesos safetensors; cabe en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.).
- Inferencia en dispositivo: build especifico para NPU Axera AX650N / AX8850 (por ejemplo Radxa AICore AX-M1), con latencia de unos 365 ms por fotograma.
- Despliegue en servidor: Transformers (`AutoModelForImageTextToText` y `AutoProcessor`) con `dtype=torch.float32`; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Despliegue en dispositivo: scripts en el directorio `axera/` (`infer_vlm_fused.py`), descargables con `hf download TheGarageDev/Minus-v0.2 --include "axera/*"`.
- No se dispone de datos de throughput agregado ni de latencia en GPU mas alla de la medicion en NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minus-v0.2 | ~450M | no disponible | Deteccion de anuncios y estado de pantalla | lfm-open-license-v1.0 | Hugging Face (22 descargas) |
| Minus-v0.1 | ~450M | no disponible | Deteccion de anuncios | lfm-open-license-v1.0 | Hugging Face |
| LiquidAI/LFM2.5-VL-450M | ~450M | no disponible | Vision-lenguaje general | lfm-open-license-v1.0 | Hugging Face (modelo base) |

La comparativa con modelos de proposito general de tamano similar no esta disponible en la informacion proporcionada. Minus-v0.2 se diferencia de su modelo base por el fine-tuning especifico y del v0.1 por el entrenamiento con fotogramas deformados a 512x512 y la cabeza de estado de pantalla.

## Limitaciones y advertencias

- Modelo altamente especializado: esta entrenado para dos tareas concretas (deteccion de anuncios y estado de pantalla) y no como VLM de proposito general.
- Riesgo de alucinacion y de falsos positivos/negativos: aunque las metricas son altas, en el test de 800 imagenes aun bloquea 6 no anuncios y falla 1 anuncio de cada 400.
- Dependencia del preprocesado: el modelo espera imagenes redimensionadas directamente a 512x512 con interpolacion bilineal; usar otro redimensionado puede degradar el rendimiento, como ocurrio con v0.1.
- Idiomas soportados no documentados; el modelo responde en formato Si/No y etiquetas fijas en ingles.
- Longitud de contexto no disponible en la informacion proporcionada.
- Licencia lfm-open-license-v1.0 (etiquetada como "other"): es necesario revisar los terminos del enlace de licencia del modelo base antes de un uso comercial.
- El conjunto de datos de entrenamiento no se ha publicado, lo que limita la reproducibilidad y la auditoria de sesgos.
- El build para NPU requiere mantener el estado oculto en precision completa; reducirla a 16 bits degrada gravemente la comprobacion de pantalla (78,2% frente a 95,9%).
- Fecha de creacion en Hugging Face: 2026-10-28; el modelo tiene un historial muy corto (22 descargas, 0 likes), por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheGarageDev/Minus-v0.2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M/blob/main/LICENSE
- Version anterior: https://huggingface.co/TheGarageDev/Minus-v0.1
- Repositorio del proyecto Minus: https://github.com/garagehq/Minus-streaming-stick
- README del build para NPU: https://huggingface.co/TheGarageDev/Minus-v0.2/tree/main/axera
