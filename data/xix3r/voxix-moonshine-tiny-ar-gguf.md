# xix3r/voxix-moonshine-tiny-ar-gguf

## Resumen

voxix-moonshine-tiny-ar-gguf es la conversion a formato GGUF del modelo de reconocimiento automatico del habla (ASR) UsefulSensors/moonshine-tiny-ar, publicada por el usuario xix3r para su uso con la libreria transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parametros, especializado exclusivamente en transcripcion de audio en arabe. Forma parte de la familia Moonshine de modelos ASR ultracompactos disenados por Moonshine AI (anteriormente Useful Sensors) para dispositivos de borde (edge devices).

El modelo resuelve el problema de la transcripcion de voz en arabe en entornos con recursos muy limitados: consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas (sin STFT ni banco de filtros mel) y emite unicamente texto transcrito. Su reducido tamano (34 MB en cuantizacion Q8_0) lo hace viable en hardware de consumo, telefonos y sistemas embebidos donde modelos ASR convencionales como Whisper no caben.

Es relevante ahora porque representa una de las pocas alternativas abiertas y ligeras para ASR en arabe, con licencia MIT y una integracion nativa en transcribe.cpp que permite despliegue en CPU y GPU sin dependencias de Python. El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion muy reciente y sin adopcion consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine tiny), stem Conv1d de 3 capas sin STFT ni mel filterbank |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generacion: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Arabe (ar) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); safetensors en el modelo base |
| Entrada de audio | PCM crudo a 16 kHz mono |
| Deteccion de idioma | no |
| Traduccion | no |
| Timestamps | no (ninguno) |
| Streaming | no |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Moonshine tiny, un transformer encoder-decoder de 27 millones de parametros que se diferencia de Whisper en el preprocesamiento de audio: en lugar de convertir la senal a espectrogramas mel mediante STFT, consume directamente PCM crudo a 16 kHz procesado por un stem convolucional de tres capas Conv1d. Esta decision elimina el coste computacional del preprocesamiento y reduce la latencia en dispositivos de borde. La generacion se realiza de forma autorregresiva con decodificacion greedy por defecto (num_beams=1, max_length=192), parametros que coinciden con el generation_config del modelo original.

El modelo es un fine-tuning de Moonshine tiny sobre arabe, realizado por Useful Sensors (ahora Moonshine AI) y descrito en el paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices" (arXiv:2509.02523). La conversion GGUF se realizo a partir del commit upstream 99e7fee del modelo base, fijado el 2026-05-12, y se valido contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp en la misma fecha. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en arabe a partir de audio PCM crudo a 16 kHz mono.
- Arquitectura encoder-decoder con salida de solo transcripcion (transcript-only).
- Inferencia en CPU y GPU mediante transcribe.cpp (backend Metal y Vulkan soportados).
- Cuantizacion agresiva hasta Q8_0 (34 MB) con deriva minima respecto a F16.
- Ejecucion en dispositivos de borde y hardware de consumo gracias a su reducido tamano.
- No soporta deteccion de idioma, traduccion, timestamps ni streaming.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles en arabe: el modelo cabe en 34 MB en Q8_0 y puede ejecutarse en el propio telefono sin conexion, eliminando la necesidad de enviar audio a servidores externos y preservando la privacidad.
- Subtitulado offline de grabaciones en arabe: con un WER del 26,79% en FLEURS ar, es adecuado para generar borradores de subtitulos que un revisor humano corrija, en flujos donde no se requiere tiempo real.
- Asistentes de voz embebidos en dispositivos IoT: el bajo consumo de recursos y la ausencia de dependencias Python permiten integrarlo en sistemas con CPU ARM o RISC-V mediante transcribe.cpp.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la CLI de transcribe.cpp permite transcribir colecciones de WAV de 16 kHz en servidores sin GPU, con throughput medido en RTF de 45,5 en CPU Ryzen 4750U.
- Investigacion en ASR de bajos recursos: sirve como linea base ligera para comparar tecnicas de cuantizacion o fine-tuning en arabe, dado que su WER esta documentado y es reproducible.
- Transcripcion en entornos con GPU integrada: los RTF de 127 (Metal en M4 Max) y 56 (Vulkan en Ryzen 4750U) permiten su uso en portatiles y mini-PC con graficos integrados para dictado o actas de reuniones.
- Preprocesamiento de corpus de audio arabe para entrenamiento de modelos mayores: la transcripcion automatica de grandes volumenes de audio puede alimentar pipelines de anotacion.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS ar test (428 utterances) | 27,11% | 27,11% | 26,79% |
| Tamano del archivo | 105 MB | 57 MB | 34 MB |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

La referencia en Transformers (MoonshineForConditionalGeneration, fp32 en MPS) obtuvo un WER del 27,13% sobre el mismo manifiesto, por lo que las cifras de transcribe.cpp en F32 y F16 coinciden dentro del ruido del intervalo de confianza bootstrap. La cuantizacion Q8_0 introduce una deriva adicional respecto a F16 tipicamente inferior a 0,1 puntos porcentuales. Useful Sensors no publica un WER por idioma para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el modelo completo en F32 ocupa 105 MB y en Q8_0 solo 34 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no requiere GPU dedicada de gama alta.
- Cabe en cualquier GPU de consumo, incluida graficos integrados; tambien funciona exclusivamente en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y libreria C++), con backends Metal, Vulkan y CPU. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al ser un modelo ASR encoder-decoder y no un LLM.
- Latencia y throughput: RTF de 127 en Metal (M4 Max) y 56 en Vulkan (Ryzen 4750U), lo que implica procesar audio mas de 50 veces mas rapido que tiempo real en hardware de consumo.
- El audio debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER FLEURS ar | Licencia | Formato |
|---|---|---:|---:|---|---|
| moonshine-tiny-ar (este) | 27 M | Solo ar | 26,79% (Q8_0) | MIT | GGUF, safetensors |
| Whisper tiny | 39 M | Multilingue (99) | no disponible en la informacion | MIT | safetensors, GGUF, etc. |
| Whisper base | 74 M | Multilingue (99) | no disponible en la informacion | MIT | safetensors, GGUF, etc. |

El modelo se posiciona frente a Whisper tiny y base por su menor tamano y su especializacion en arabe, aunque no se dispone de cifras comparativas de WER en la informacion proporcionada. Frente a Whisper, prescinde de STFT y banco mel, lo que reduce el preprocesamiento, y no ofrece deteccion de idioma ni traduccion.

## Limitaciones y advertencias

- WER del 26,79% en FLEURS ar: aproximadamente una de cada cuatro palabras se transcribe incorrectamente, lo que limita su uso en produccion sin revision humana.
- Modelo monoidioma: solo transcribe arabe; no detecta idioma ni traduce.
- Sin timestamps ni streaming: no apto para subtitulado sincronizado ni para transcripcion en tiempo real por segmentos.
- Riesgo de bucles de alucinacion en la generacion; el autor recomienda limitar la longitud maxima del texto generado para evitarlos.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni los sesgos de dominio, dialecto o genero.
- Rendimiento variable segun dialecto: al estar entrenado sobre un corpus no especificado, el WER puede degradarse en variedades del arabe distintas de las representadas.
- Requiere audio en formato estricto (16 kHz mono); audio con otras frecuencias o canales debe convertirse previamente.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene consultar la model card upstream para terminos completos.
- Sin adopcion registrada (0 descargas, 0 likes) y publicacion reciente: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-tiny-ar-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ar
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-tiny-ar/commit/99e7fee
- Paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices": https://huggingface.co/papers/2509.02523
- Paper en arXiv: https://arxiv.org/abs/2509.02523
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Codigo de Moonshine: https://github.com/moonshine-ai/moonshine
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion de transcribe.cpp para Moonshine: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Descarga F32: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-ar-gguf/resolve/main/moonshine-tiny-ar-Q8_0.gguf
