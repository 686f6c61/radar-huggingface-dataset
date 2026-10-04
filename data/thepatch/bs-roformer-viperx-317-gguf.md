# thepatch/bs-roformer-viperx-317-GGUF

## Resumen

BS-RoFormer (viperx ep_317) GGUF es la conversion a formato GGUF del checkpoint de separacion de voces `model_bs_roformer_ep_317_sdr_12.9755`, entrenado por el usuario viperx y distribuido originalmente a traves del repositorio de modelos de Ultimate Vocal Remover. La conversion la firma el usuario thepatch y esta pensada para stems.cpp, un separador de pistas escrito en C++ sobre ggml que se ejecuta en CPU, CUDA, Vulkan y Metal sin dependencias de Python. El modelo estima exclusivamente la pista de voz; el instrumental se obtiene restando la voz a la mezcla original.

Se trata de una red Band-Split RoFormer (band-split con atencion rotatoria) de 159.758.028 parametros, es decir, unos 0,16 B, etiquetada comercialmente como 0.2B. El unico fichero publicado es `bs_roformer_viperx_317-0.2B-v1.0-F32.gguf`, de 609 MiB, en precision float32. No se publica version F16 porque las mediciones internas muestran una perdida de unos 30 dB de SNR respecto al referencia en PyTorch, un nivel que stems.cpp consideraba un bug.

Su relevancia es practica: permite hacer separacion de voces de calidad cercana al referencia en PyTorch (SDR 12.9755 reportado en el nombre del checkpoint) dentro de una herramienta nativa sin Python, lo que facilita integrarla en DAWs, pipelines de audio o aplicaciones de escritorio. El principal caveat es legal: los pesos no tienen licencia declarada en ningun punto de la cadena upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-Split RoFormer (transformer con atencion rotatoria sobre bandas de frecuencia), 12 capas |
| Parametros totales | 159.758.028 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa la senal mediante segmentado por chunks tipo `demix_track`) |
| Tipos de cuantizacion | unicamente F32 (F16 medido pero no publicado por perdida de ~30 dB de SNR) |
| Idiomas soportados | no aplica (modelo de separacion de fuentes de audio, sin capacidades de texto) |
| Licencia | `other` / sin licencia declarada upstream; el autor indica explicitamente que no se asuma ninguna licencia |
| Formato de pesos | GGUF (tambien existe el checkpoint original `.ckpt` de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Band-Split RoFormer: la senal se divide en bandas de frecuencia y cada banda se procesa con un transformer que emplea embeddings posicionales rotatorios (RoPE). El checkpoint tiene 12 capas segun la nota del autor sobre la acumulacion en float32. La conversion a GGUF renombra tensores, reescribe la disposicion de bandas como listas de indices planas y verifica las frecuencias rotatorias, que se almacenan como un parametro theta; la arquitectura y los pesos no se modifican.

No hay informacion sobre el dataset de entrenamiento, el numero de horas de audio, la composicion de los datos ni si hubo etapas de refinado. Lo unico documentado es la procedencia: el checkpoint `model_bs_roformer_ep_317_sdr_12.9755.ckpt` (sha256 `5b84f37e8d444c8cb30c79d77f613a41c05868ff9c9ac6c7049c00aefae115aa`), entrenado por viperx y distribuido en el release `all_public_uvr_models` de `TRvlvr/model_repo`, con configuracion publicada en ZFTurbo/Music-Source-Separation-Training. La innovacion tecnica relevante aqui no esta en el entrenamiento, sino en la conversion: el uso de `GGML_PREC_F32` en las capas de acumulacion es lo que permite que la version Vulkan alcance paridad con PyTorch, algo que antes se interpretaba como un error del backend.

## Capacidades

- Separacion de voz (vocal stem) a partir de una mezcla musical completa, con un SDR de referencia de 12.9755 segun el nombre del checkpoint upstream.
- Obtencion del instrumental por resta: instrumental = mezcla − voz estimada.
- Ejecucion nativa en C++/ggml sin Python, en backends CPU, CUDA, Vulkan y Metal.
- Paridad verificable con PyTorch: cada resultado pasa la comprobacion de paridad de stems.cpp.
- Integracion como servidor mediante `stems-server`, que localiza el modelo por nombre (`"model": "bs_roformer_viperx_317"`).
- Procesado por segmentos en la ruta `demix_track`, apto para pistas de duracion arbitraria.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de audio puro.

## Casos de uso

- Produccion musical y remezclas: extraer la voz de una mezcla para generar una version instrumental o un remix. El modelo esta optimizado precisamente para estimar voces, y el instrumental se deriva por resta de la senal.
- Karaoke y pistas de acompanamiento: generar la pista instrumental de una cancion de forma automatica dentro de una aplicacion de escritorio, sin depender de Python ni de servicios en la nube.
- Preprocesado para entrenamiento de otros modelos: separar voces e instrumental de un catalogo musical para construir datasets de canto, transcripcion o generacion condicionada.
- Integracion en DAW mediante plugin o proceso auxiliar: el binario `stems-split` se puede invocar desde un plugin o script de automatizacion, con latencias de 14,6 s para un clip de 20 s en una RTX 5070 Laptop por Vulkan.
- Postproduccion de audio para video y podcast: aislar la locucion del fondo musical para reecualizarla, sustituir la musica o corregir niveles de voz.
- Archivado y restauracion de grabaciones: separar la voz de una mezcla antigua para limpiarla por separado (reduccion de ruido, ecualizacion, de-essing) y volver a mezclar.
- Despliegue en servidor de separacion por lotes: `stems-server` permite exponer el modelo como servicio para procesar catalogos completos de forma desatendida.
- Ejecucion en hardware de consumo: al ocupar 609 MiB en F32, cabe en portatiles y mini-PC con GPU integrada o grafica de gama media, sin necesidad de aceleradores de datacenter.

## Benchmarks y rendimiento

El autor no publica benchmarks de SDR sobre datasets estandar, pero si una tabla de paridad (SNR de la pista vocal del resultado en C++ frente a la ejecucion de referencia de `BSRoformer` de ZFTurbo en float32 sobre CPU), medida sobre un clip de 20 s (`test.mp3` de demucs). El primer valor corresponde al primer chunk de 8 s y el segundo a la pista completa con `demix_track` troceado.

| Precision | CPU | CUDA | Vulkan | Metal | Clip de 20 s (Vulkan, RTX 5070) |
|---|---:|---:|---:|---:|---:|
| F32 | 69,6 / 65,2 | 69,5 / 62,4 | 69,6 / 63,1 | 61,8 / 48,8 | 14,6 s |
| F16 (medido, no publicado) | 44,2 / 34,9 | 45,1 / 36,3 | 44,0 / 31,9 | no disponible | no disponible |

Contexto de las mediciones: hardware de prueba Core Ultra 9 275HX con RTX 5070 Laptop (CPU, CUDA y Vulkan) y Apple M4 (Metal), con ggml `f30f0cdc`, medidas el 2026-10-02 y 2026-10-03. En Metal, la CPU del mismo equipo obtiene 61,8 / 50,6 frente a las mismas referencias, de modo que Metal queda 1,8 dB por debajo en la pista completa, atribuido a la acumulacion en float32 a lo largo de 12 capas. Tambien se reporta un SDR de 12.9755 en el nombre del checkpoint upstream. No hay resultados publicados de MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: en F32, los 159.758.028 parametros ocupan unos 640 MB de pesos, mas overhead de activaciones y buffers de audio; el fichero GGUF es de 609 MiB. Cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no se requiere hardware profesional. El autor ha validado CPU, RTX 5070 Laptop (CUDA y Vulkan) y Apple M4 (Metal). Una RTX 4090, A100 o H100 funcionarian sin problema, pero estan sobredimensionadas para este modelo.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en iGPU y en CPU pura. En CPU (Core Ultra 9 275HX) alcanza paridad plena con la referencia PyTorch.
- Opciones de despliegue: stems.cpp (build para cpu, cuda, vulkan o metal; `stems-split` para CLI y `stems-server` para servicio). No esta pensado para vLLM, llama.cpp ni TGI, que son runners de modelos de lenguaje.
- Latencia y throughput: 14,6 s para un clip de 20 s en Vulkan sobre RTX 5070 Laptop, es decir, aproximadamente 0,73x del tiempo real. En CPU y Metal el throughput no se publica, pero la paridad de calidad si esta verificada.
- Nota de precision: no usar F16 con este modelo; la perdida medida ronda los 30 dB de SNR y no se publica ese encoding por ese motivo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Rendimiento | Licencia | Formatos |
|---|---|---|---|---|---|---|
| BS-RoFormer viperx ep_317 (este) | 159.758.028 | Band-Split RoFormer, 12 capas | no aplica (segmentado) | SDR 12,9755 en el nombre del checkpoint; paridad verificada en F32 | sin licencia declarada | GGUF F32, `.ckpt` |
| Mel-Band RoFormer (Kim) | no disponible | Mel-Band RoFormer | no aplica | no disponible (el autor solo indica que pierde mucho menos al pasar a F16) | no disponible | GGUF F32 y F16 en stems.cpp |
| HTDemucs | no disponible | hibrido transformer + Demucs | no aplica | no disponible (el autor solo indica que pierde mucho menos al pasar a F16) | no disponible | GGUF F32 y F16 en stems.cpp |

El punto diferencial de esta publicacion no es el rendimiento bruto, sino que es la unica de las tres que se distribuye exclusivamente en F32 dentro de stems.cpp por problemas de degradacion en F16. No se dispone de cifras comparativas de SDR entre los tres modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia: no existe licencia declarada en ningun punto de la cadena upstream. El propio autor advierte que no se asuma ninguna licencia. El uso comercial de estos pesos es juridicamente arriesgado y deberia consultarse con asesoria legal antes de integrarlos en un producto.
- Ausencia de fichero LICENSE: el repositorio solo incluye un `NOTICE` con la procedencia y la advertencia, ademas de un `SHA256SUMS`.
- Solo estima voz: no separa bateria, bajo u otros stems. El instrumental se obtiene por resta, por lo que los artefactos de la estimacion vocal se trasladan directamente a la pista instrumental.
- Artefactos tipicos de separacion: sangrado espectral, bombeo, perdida de reverberacion o voces de acompanamiento incompletas. No hay datos publicados sobre el comportamiento en generos concretos (opera, coros densos, voces muy procesadas).
- F16 no disponible: cualquier intento de cuantizar a F16 con este modelo degrada la calidad de forma severa (caida de unos 30 dB de SNR en las mediciones del autor).
- Metal rinde por debajo: 1,8 dB menos que la CPU del mismo equipo M4 en la pista completa, por acumulacion en float32 a lo largo de las 12 capas.
- Sin datos de entrenamiento: se desconoce el dataset, su composicion, posibles sesgos de genero, idioma o genero musical, y no hay informacion sobre etapas de alineacion o refinado.
- Sin soporte de texto ni de idiomas: no sirve para tareas de lenguaje, razonamiento, codigo ni agentes. Cualquier expectativa en ese sentido es un error de uso.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay comunidad que haya validado el modelo en produccion.
- Reproducibilidad limitada del pipeline de conversion: aunque el script `tools/convert_roformer.py --preset viperx` esta documentado, la calidad depende de la version de ggml (las mediciones usan `f30f0cdc`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thepatch/bs-roformer-viperx-317-GGUF
- stems.cpp (runtime C++/ggml): https://github.com/betweentwomidnights/stems.cpp
- Checkpoint upstream (release `all_public_uvr_models`): https://github.com/TRvlvr/model_repo
- Configuracion de entrenamiento (ZFTurbo, Music-Source-Separation-Training, MIT): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Referencia de implementacion usada para la paridad: `BSRoformer` de ZFTurbo en el repositorio anterior, fichero `configs/viperx/model_bs_roformer_ep_317_sdr_12.9755.yaml`.
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a guias genericas de plugins de produccion musical con IA y no se han utilizado como fuente de datos.
