# Zero-000/OmniLlama-Qwen3-Omni-30B-A3B-GGUF

## Resumen

OmniLlama-Qwen3-Omni-30B-A3B-GGUF es un empaquetado unificado en formato GGUF de Qwen3-Omni-30B-A3B-Instruct, el modelo omnimodal any-to-any de Alibaba/Qwen. Lo ha creado el usuario Zero-000 mediante OmniLlama, un fork de llama.cpp que añade soporte para la ruta de voz nativa de Qwen3-Omni (Thinker → Talker → MTP → Code2Wav), la parte que el llama.cpp estándar descarta y que deja mudos los GGUF habituales de este modelo. Cada cuantización se distribuye como un único archivo que contiene el cerebro de texto (MoE de 30B con 3B activos), los codificadores de visión y audio de entrada, y el stack completo de síntesis de voz a 24 kHz.

El problema que resuelve es la fragmentación: hasta ahora, ejecutar Qwen3-Omni localmente exigía gestionar múltiples componentes dispersos (modelo principal, mmproj de visión/audio, talker y vocoder separados). Este proyecto los unifica en un contenedor GGUF con arquitectura personalizada (`qwen3omni`), con espacios de nombres para cada submodelo y un único tokenizador BPE.

Es relevante porque acerca la inferencia omnimodal completa (texto, imagen, audio de entrada y voz de salida) a hardware de consumo: las cuantizaciones ofrecidas (Q5_K_M, Q4_K_M e IQ3_M) están pensadas para GPUs de 24 GB y 16 GB. Sin embargo, hay una advertencia crítica: el cargador unificado de OmniLlama está aún en desarrollo activo, por lo que estos archivos son artefactos canónicos pero todavía no ejecutables de forma inmediata con llama.cpp, Ollama o LM Studio estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor GGUF unificado `qwen3omni`: thinker MoE (`qwen3vlmoe`, 128 expertos / 8 activos), talker MoE (`qwen3omnitalker`), ViT + encoders de audio (mmproj CLIP), MTP + Code2Wav (24 kHz) |
| Parametros totales | 35.258.598.961 (~35,3 B, incluidos thinker, talker y stacks de visión/audio/voz) |
| Parametros activos | ~3 B en el thinker (128 expertos, 8 activos por token); no disponible para el talker |
| Longitud de contexto | no disponible (heredado del checkpoint Qwen3-Omni-30B-A3B-Instruct; no especificado en la model card) |
| Tipos de cuantizacion | Thinker: Q5_K_M (~28 GB), Q4_K_M (~25 GB), IQ3_M (~20 GB); Talker: Q8_0; mmproj de entrada y de salida de voz: F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base); empaquetado y fork OmniLlama bajo licencia MIT de llama.cpp |
| Formato de pesos | GGUF (archivo unificado por cuantizacion; conversión desde bf16 safetensors con transformers 5.8.0) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Omni-30B-A3B-Instruct, una arquitectura MoE (Mixture of Experts) con 128 expertos de los que 8 se activan por token, lo que reduce el cómputo por token a unos 3B de parámetros activos manteniendo la capacidad de un modelo de 30B. Sobre ese núcleo (el "Thinker"), Qwen3-Omni añade una ruta de voz nativa: un "Talker" autoregresivo (también MoE) que recibe el texto generado y produce códigos de audio, un predictor MTP (multi-token prediction) y un vocoder Code2Wav que sintetiza voz a 24 kHz. La comprensión multimodal de entrada se apoya en un ViT de visión y encoders de audio empaquetados como mmproj al estilo CLIP.

El empaquetado de OmniLlama no modifica los pesos: convierte el checkpoint exacto `Qwen/Qwen3-Omni-30B-A3B-Instruct` (variante Instruct, bf16, 15 shards) con `transformers == 5.8.0`, preservando token IDs, filas de tokens especiales del códec y formas de tensor. Cada GGUF unificado contiene las secciones `thinker.*`, `talker.*`, `v.*`/`a.*`/`mm.*` (entrada multimodal), `a.gen.*` (salida de voz) y `text_projection.*`/`codec_special_embd` (puente texto→talker), todo gobernado por un único tokenizador BPE estilo GPT-2. No se dispone de detalles sobre datos de entrenamiento, número de tokens o alineación (RLHF/DPO) en la información proporcionada; corresponden al modelo base de Qwen.

## Capacidades

- Pipeline any-to-any: acepta texto, imágenes y audio como entrada, y genera texto y voz (24 kHz) como salida.
- Razonamiento y generación de texto con el thinker MoE de 30B-A3B (variante Instruct, sin fine-tuning de personaje).
- Comprensión de imágenes mediante ViT integrado en el mmproj de entrada.
- Comprensión de audio de entrada (voz y sonido) mediante los encoders `a.*`.
- Síntesis de voz nativa completa: talker autoregresivo + MTP + Code2Wav, la ruta que el llama.cpp estándar no ejecuta.
- Un único tokenizador BPE para todo el pipeline, sin colisiones entre submodelos gracias a los espacios de nombres.
- No se especifica en la model card soporte de tool calling, agentes o modo de pensamiento explícito (thinking mode).

## Casos de uso

- Asistente de voz local y privado: al ejecutarse en local con GGUF, permite construir agentes de conversación por voz sin enviar audio a la nube, adecuado para domótica o asistencia en entornos sensibles.
- Transcripción y análisis de audio con respuesta hablada: se le puede enviar un clip de audio (reunión, nota de voz) y obtener tanto un resumen textual como una respuesta sintetizada en voz.
- Análisis visual conversacional: descripción de imágenes, lectura de documentos escaneados o asistencia visual accesible, con respuesta por voz para usuarios con discapacidad visual.
- Atención al cliente multicanal: el pipeline any-to-any permite gestionar interacciones que combinan voz, capturas de pantalla y texto en un mismo modelo, simplificando la infraestructura frente a cadenas de varios modelos.
- Prototipado de aplicaciones omnimodales en edge: con cuantizaciones que caben en 16-24 GB de VRAM, es viable desarrollar demos de IA multimodal en estaciones de trabajo con RTX 3090/4090 sin coste de API.
- Investigación en arquitecturas any-to-any: el contenedor unificado con espacios de nombres por submodelo es útil para estudiar e instrumentar la ruta Thinker→Talker→Code2Wav de forma integrada.
- Generación de contenido con doblaje: generación de guiones textuales y su locución automática a 24 kHz para vídeos o audiolibros en un solo paso de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una re-conversión de cuantización sin modificación de pesos, el rendimiento teórico corresponde al de Qwen3-Omni-30B-A3B-Instruct, cuyos resultados oficiales no se incluyen en la model card de este repositorio.

## Requisitos de hardware

- VRAM estimada para el thinker residente en GPU (más KV cache): ~22 GB con Q5_K_M, ~18 GB con Q4_K_M, ~13,5 GB con IQ3_M.
- Los stacks de voz y visión son pequeños y están diseñados para ejecutarse en CPU, por lo que la huella en GPU es la del thinker cuantizado.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q5_K_M y Q4_K_M; RTX 4060 Ti 16 GB, RTX 5060 Ti 16 GB o equivalentes para IQ3_M.
- Cabe en GPUs de consumo de 24 GB (Q5_K_M y Q4_K_M) y de 16 GB (IQ3_M).
- Despliegue: exclusivamente mediante el fork OmniLlama de llama.cpp. Stock llama.cpp, Ollama y LM Studio no pueden cargar estos archivos; el cargador unificado está en desarrollo activo y aún no se ha publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Multimodalidad | Licencia | Disponibilidad de inferencia |
|---|---|---|---|---|---|
| OmniLlama-Qwen3-Omni-30B-A3B-GGUF | ~35,3 B (todo en uno) | ~3 B (thinker) | Texto, imagen, audio de entrada; voz de salida | Apache-2.0 | Solo fork OmniLlama (cargador en desarrollo) |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B-A3B (thinker) + componentes separados | ~3 B | Texto, imagen, audio de entrada; voz de salida | Apache-2.0 | Transformers, vLLM; sin GGUF unificado oficial |
| GGUF estándar de Qwen3-Omni (comunidad) | thinker + mmproj separados | ~3 B | Texto, imagen, audio de entrada; sin voz de salida (ruta de voz descartada) | Apache-2.0 | llama.cpp / Ollama / LM Studio |

La ventaja diferencial de esta ficha es la integración completa de la ruta de voz en un solo archivo; su inconveniente actual es que no existe aún un runtime estable que la ejecute.

## Limitaciones y advertencias

- Advertencia crítica: los archivos usan una arquitectura personalizada (`general.architecture = qwen3omni`) que stock llama.cpp, Ollama y LM Studio no pueden cargar. El cargador unificado de OmniLlama está en desarrollo activo; hasta que se publique, estos GGUF no son ejecutables de forma inmediata.
- La ruta de voz a nivel de componentes (talker + MTP + Code2Wav) ya está verificada en el fork, pero el cargador de archivo único es la pieza pendiente.
- El empaquetado está ligado al checkpoint exacto `Qwen/Qwen3-Omni-30B-A3B-Instruct` con `transformers == 5.8.0`; una versión distinta de Qwen3-Omni requeriría re-conversión.
- La cuantización IQ3_M es agresiva y puede degradar apreciablemente la calidad del thinker respecto a Q4_K_M/Q5_K_M.
- No hay datos publicados de benchmarks, contexto máximo ni idiomas soportados en la model card; deben consultarse en el repositorio del modelo base de Qwen.
- Repositorio de muy baja adopción (246 descargas, 0 likes en el momento de la ficha), sin historial de auditoría comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero el empaquetado y el fork OmniLlama siguen la licencia MIT de llama.cpp; el modelo base es © Alibaba/Qwen.
- Al ser una conversión de terceros (no oficial de Qwen), existe riesgo de errores de conversión no detectados; conviene validar salidas contra el modelo original antes de uso en producción.
- Como todo LLM, el modelo subyacente puede alucinar y heredar sesgos de sus datos de entrenamiento; no se documentan sesgos específicos en la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Zero-000/OmniLlama-Qwen3-Omni-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Fork OmniLlama (GitHub): https://github.com/dgracey01/OmniLlama
