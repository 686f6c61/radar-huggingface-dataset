# thepatch/bs-roformer-dereverb-room-GGUF

## Resumen

BS-RoFormer dereverb room (GGUF) es la conversion a formato GGUF del modelo `anvuew/dereverb_room`, una red de separacion de fuentes basada en Band-Split RoFormer con arquitectura mono disenada especificamente para eliminar la reverberacion de sala de pistas vocales. El modelo estima la version "seca" (sin reverberacion, etiquetada como *noreverb*) y deduce la reverberacion como la diferencia entre la mezcla original y dicha estimacion. La conversion la ha realizado el usuario thepatch para poder ejecutar el modelo en stems.cpp, un separador de stems escrito en C++ sobre ggml que funciona sin Python en CPU, CUDA, Vulkan y Metal.

El modelo original lo desarrollo anvuew y se entreno hasta alcanzar un SDR de 13.7432. Cuenta con aproximadamente 29,4 millones de parametros (29.437.446 exactos) y el fichero GGUF en F32 ocupa 112,3 MiB, lo que lo convierte en un modelo muy ligero y desplegable en hardware de consumo. La red es mono: stems.cpp la ejecuta una vez por canal de una entrada estereo, de modo que una separacion estereo cuesta aproximadamente el doble que una mono y cada canal de salida es exactamente el resultado de separar ese canal de forma aislada (una entrada mono devuelve dos canales identicos).

Su relevancia actual radica en que ofrece una tarea de preprocesado de audio (dereverberacion de voces) en un empaquetado nativo C++/ggml sin dependencias de Python, con paridad numerica practicamente exacta frente a la implementacion de referencia en PyTorch (SNR de entre 62,4 dB y 69,9 dB segun backend). Esto lo hace apto para integrarse en pipelines de produccion de audio donde se requiera baja latencia y portabilidad entre plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-Split RoFormer (BS-RoFormer), transformer con embeddings posicionales rotatorios (RoFormer), red mono |
| Parametros totales | 29.437.446 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; ventana de segmentacion segmentada en chunks, tamano no especificado) |
| Tipos de cuantizacion | F32 (fichero `bs_roformer_dereverb_room-29M-v1.0-F32.gguf`) |
| Idiomas soportados | no disponible (modelo de audio, no procesa texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura es una Band-Split RoFormer: un transformer que divide el espectrograma en bandas de frecuencia y aplica atencion con embeddings posicionales rotatorios (RoFormer). La red es mono y esta especializada en una unica tarea de dereverberacion de voces, a diferencia de los modelos multi-stem generalistas. Estima la senal vocal seca (*noreverb*) y obtiene la componente de reverberacion restando esa estimacion de la mezcla original.

La conversion a GGUF se realizo el 2026-10-09 con la herramienta `tools/convert_roformer.py --preset dereverb_room` de stems.cpp. El proceso renombra tensores, escribe el layout de bandas como listas de indices, comprueba las frecuencias rotatorias y las almacena como un theta, y guarda la configuracion como metadatos. La conversion es determinista y no modifica la arquitectura ni los pesos; el checkpoint de origen es `dereverb_room_anvuew_sdr_13.7432.ckpt` (sha256 `2edec521f09e26341c1923dc82c8c52dbc86478b42b9999f679535743c970cb3`) con config `dereverb_room_anvuew.yaml` (sha256 `c37e3039521d79cd1daff129857f69fa80c6a1f383a0fe8cda757f2dfc5032f8`). No se dispone de informacion sobre el numero de tokens/horas de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no disponibles).

## Capacidades

- Separacion de reverberacion de sala en pistas vocales (dereverberacion), devolviendo el stem *noreverb* (voz seca).
- Derivacion del stem de reverberacion como diferencia entre la mezcla y la estimacion seca.
- Procesamiento de audio mono; soporte estereo mediante ejecucion por canal (cada canal de salida es el resultado de separar ese canal aislado).
- Ejecucion nativa en C++/ggml sin dependencias de Python mediante stems.cpp.
- Compatibilidad con aceleracion por hardware en CPU, CUDA, Vulkan y Metal.
- Integracion con `stems-server`, que localiza el modelo por nombre (`"model": "bs_roformer_dereverb_room"`).
- Paridad numerica con la implementacion de referencia en PyTorch (ZFTurbo's MSST `BSRoformer` con la config del modelo base, ejecutada en float32).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, vision ni audio generativo: es exclusivamente un modelo de separacion de fuentes de audio.

## Casos de uso

- Restauracion de grabaciones de voz con reverb: dado un vocal con reverberacion de sala, el modelo genera el stem seco para post-produccion o para alimentar etapas posteriores de mezcla sin la coloracion acustica del recinto.
- Preprocesado para reconocimiento de voz (ASR): eliminar la reverberacion antes de pasar el audio a un sistema de transcripcion mejora la relacion senal-ruido efectiva y reduce errores en entornos reverberantes.
- Limpieza de pistas para karaoke o remix: separar la reverb permite reaplicar una reverberacion final distinta o insertar la voz en una nueva mezcla con espacializacion controlada.
- Pipelines de produccion desplegables sin Python: al compilarse en C++ sobre ggml, el modelo puede embeberse en herramientas nativas, plugins o servicios ligeros sin el coste de un entorno Python.
- Procesado por lotes en servidor: usando `stems-server` puede exponerse como servicio que localiza el modelo por nombre y procesa ficheros de audio de forma automatizada.
- Aplicaciones de edicion de audio en tiempo real o cuasi-real: en Metal sobre Apple M4 la separacion estereo corre a aproximadamente 0,5x tiempo real, lo que permite flujos interactivos en equipos de consumo.
- Investigacion en separacion de fuentes: al ser una conversion determinista con paridad verificada frente a PyTorch, sirve como referencia reproducible para comparar implementaciones ggml frente a las originales.

## Benchmarks y rendimiento

Paridad numerica del modelo GGUF (C++) frente a la implementacion de referencia en PyTorch (ZFTurbo's MSST `BSRoformer`, config del modelo base, float32 en CPU). Medida sobre un downmix mono de un clip de 20 s (demucs `test.mp3`); "seg" es el primer chunk de 8,7 s y "full" el `demix_track` por chunks sobre todo el clip. Medicion del 2026-10-09 con ggml `9d0d910b` en un Core Ultra 9 275HX y una RTX 5070 Laptop (Metal sobre Apple M4 con ggml `4ad3b30b`, 2026-10-10):

| Backend | seg cos / SNR | full cos / SNR | Clip mono de 20 s |
|---|---:|---:|---:|
| CPU | 0.9999997 / 62,4 dB | 0.9999998 / 64,6 dB | 51,4 s |
| CUDA | 0.9999997 / 62,4 dB | 0.9999998 / 64,6 dB | 6,4 s |
| Vulkan | 0.9999997 / 62,4 dB | 0.9999998 / 64,6 dB | 6,3 s |
| Metal (Apple M4) | 0.9999999 / 69,9 dB | 0.9999999 / 68,8 dB | 26,5 s |

El SDR del checkpoint de origen (`dereverb_room_anvuew_sdr_13.7432.ckpt`) es 13.7432, segun el nombre del fichero. No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.), que por otra parte no aplican a un modelo de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra explicita. El fichero de pesos en F32 ocupa 112,3 MiB, por lo que el modelo es muy ligero y cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: no se especifican modelos concretos; se documentan ejecuciones correctas en RTX 5070 Laptop (CUDA/Vulkan) y Apple M4 (Metal). Tambien funciona en CPU (Core Ultra 9 275HX).
- GPU de consumo: si, cabe en GPUs de consumo por el reducido tamano del modelo (112,3 MiB en F32).
- Opciones de despliegue: stems.cpp (compilacion CPU, CUDA, Vulkan o Metal) y `stems-server`; requiere Python unicamente para la conversion desde el modelo base, no para la inferencia.
- Latencia y throughput: sobre un clip mono de 20 s, CPU 51,4 s, CUDA 6,4 s, Vulkan 6,3 s y Metal (M4) 26,5 s. En Metal la separacion estereo corre a aproximadamente 0,5x tiempo real; una separacion estereo cuesta aproximadamente el doble que una mono.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de dereverberacion ni de separacion de fuentes comparables (por ejemplo Demucs u otros BS-RoFormer multi-stem), por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Modelo mono: para entradas estereo hay que ejecutarlo una vez por canal, duplicando el coste computacional; no realiza separacion estereo nativa.
- Tarea unica: solo realiza dereverberacion de voz; no separa otros stems (bateria, bajo, etc.) ni genera audio.
- Sesgos conocidos: no disponible en la informacion proporcionada al tratarse de un modelo de audio y no de texto.
- Riesgo de alucinacion: no aplica en el sentido generativo; el modelo produce una estimacion de senal, cuya calidad depende de la mezcla de entrada. La paridad medida es numerica respecto a la implementacion de referencia, no una garantia de calidad perceptual en todos los dominios acusticos.
- Limitaciones de contexto o idioma: no aplica (procesa audio); se desconoce el tamano exacto de la ventana de segmentacion usada en los chunks.
- Restricciones de licencia: los pesos se distribuyen bajo GNU General Public License v3 (GPL-3.0), heredada del modelo base. Esta licencia es copyleft e impone obligaciones relevantes para uso comercial y para la distribucion de obras derivadas; conviene revisar el texto completo en el fichero `LICENSE` antes de integrarlo en productos propietarios.
- Caveat de produccion: el modelo base es un checkpoint de SDR 13.7432 sin documentacion publica sobre dataset ni proceso de entrenamiento, lo que limita la trazabilidad; la calidad en dominios acusticos distintos a los del entrenamiento no esta garantizada.
- Metadato de fecha: el repositorio figura como creado y actualizado en octubre de 2026, dato que debe tomarse tal como aparece en la ficha original.

## Enlaces

- HuggingFace (conversion GGUF): https://huggingface.co/thepatch/bs-roformer-dereverb-room-GGUF
- Modelo base: https://huggingface.co/anvuew/dereverb_room
- Repositorio de stems.cpp: https://github.com/betweentwomidnights/stems.cpp
