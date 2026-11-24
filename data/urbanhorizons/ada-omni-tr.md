# urbanhorizons/ada-omni-tr

## Resumen

ADA Omni (`urbanhorizons/ada-omni-tr`) es una arquitectura de referencia de voz a voz (audio-to-audio) en turco, totalmente local, publicada por el usuario urbanhorizons con licencia Apache-2.0. El modelo combina Gemma-3n-E2B-it (de Google, vía el checkpoint de Unsloth) como "cerebro" multimodal con torre de audio USM, junto con un "talker" congelado de 0,6B derivado de `erkamk/qwen3-0.6b-tr` como "boca" generadora de habla. La conexión entre ambos mundos se realiza mediante un proyector dual de 32 MB entrenado por el autor, que alinea los vectores internos de Gemma-3n con el espacio de tokens del talker sin pasar por texto intermedio.

El problema que aborda es la latencia y la desconexión de los pipelines tradicionales ASR→LLM→TTS en turco: en lugar de encadenar Whisper, un LLM y un TTS, ADA Omni procesa audio de micrófono directamente y emite habla a 24 kHz en streaming, con una latencia de primera respuesta de audio declarada de 0,86–1,40 s en una RTX 3060 de 12 GB. Incluye además barge-in de menos de 80 ms, wake-word nativa ("Ada"), reconocimiento de hablante por huella de voz y un registro modular de herramientas IoT (`@register_tool`).

Es relevante ahora por su enfoque de "single-architecture omni" ejecutable en GPU de consumo, con métricas de entrenamiento y latencia declaradas de forma reproducible y con un diseño que evita dependencias externas de ASR o TTS. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño de repo es de 0,0 GB, lo que sugiere que los pesos publicados son mínimos o no están efectivamente alojados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gemma-3n-E2B (torre de audio USM + cerebro) + proyector dual de 32 MB + talker congelado de 0,6B con code predictor de 5 capas y decoder RVQ de 12,5 Hz |
| Parametros totales | No disponible de forma agregada; componentes: Gemma-3n-E2B (2B efectivos) + talker 0,6B + proyector 32 MB |
| Parametros activos | No disponible (Gemma-3n-E2B es de arquitectura con parámetros efectivos 2B; no se detalla el desglose MoE) |
| Longitud de contexto | No disponible explícitamente; ventana de seguimiento de wake-word de 25 s |
| Tipos de cuantizacion | No disponible (el modo `--low_vram` usa eager + CPU PLE; CPU-only usa PyTorch INT8) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 0,0 GB; se mencionan `ada_projector.pt` de 32 MB y muestras WAV) |

## Arquitectura y entrenamiento

La arquitectura es una cadena de tres etapas. Primero, un front-end de audio basado en la torre USM de Gemma-3n-E2B procesa el micrófono a 16 kHz sin ASR externo. Segundo, un `VocabAnchoredDualProjector` de 32 MB alinea los vectores internos `(embed_tokens + last_hidden_state)` de Gemma-3n con un vocabulario de 140.843 tokens del talker, usando contexto Conv1D. Tercero, un talker congelado de 0,6B (derivado de `erkamk/qwen3-0.6b-tr`) con un code predictor de 5 capas y un decoder RVQ de 12,5 Hz genera habla a 24 kHz en streaming.

El entrenamiento reportado se centra en el proyector: destilación de vocabulario entre tokenizadores con similitud coseno de 0,9060 y MSE de 0,0016 sobre 140.843 tokens turcos/latinos. En validación con 200 clips conversacionales turcos no vistos se reporta `VAL c0_CE = 1.1658` (61,5 % de precisión Top-1) y `VAL sub_Depth_CE = 4.9141` sobre 15 codebooks acústicos residuales. No se detalla el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO. Las innovaciones técnicas destacadas son el uso de CUDA Graphs duales (40,1 tok/s en RTX 3060), el streaming full-duplex con barge-in y la reutilización del encoder de hablante de 1024 dimensiones para identificación por huella de voz con un coste de ~8 ms.

## Capacidades

- Generación de habla turca a 24 kHz en streaming full-duplex, con comprensión de audio nativa sin ASR externo.
- Diálogo de voz a voz con latencia de primera respuesta de audio de 0,86–1,40 s en RTX 3060.
- Barge-in con interrupción en menos de 80 ms.
- Wake-word nativa "Ada" con ventana de seguimiento activa de 25 s y sin VRAM adicional.
- Identificación de hablante por huella de voz (encoder de 1024 dimensiones, ~8 ms) y memoria de audio multi-turno por usuario.
- Clonación de voz zero-shot con referencia de 5 s (`--ref_wav`), con muestras Apache-2.0 femenina y masculina incluidas.
- Registro modular de herramientas IoT/agente mediante `@register_tool` sin reentrenamiento (smart-home, MQTT, Home Assistant, APIs).
- Protección por passphrase con PBKDF2-HMAC-SHA256 salteado y bloqueo tras 3 intentos (`ADA_OMNI_PASSPHRASE`).
- Consultas bajo demanda de hora, clima y web con cero RAM en reposo.
- Capacidades multilingües limitadas a turco e inglés.

## Casos de uso

- Asistente de voz doméstico local: el modelo se ejecuta en una RTX 3060 de 12 GB y gestiona conversaciones multi-turno con wake-word "Ada" y ventana de 25 s, adecuado para control de smart-home sin enviar audio a la nube.
- Control de dispositivos IoT y Home Assistant: las herramientas se registran con `@register_tool` y el modelo las invoca por voz sin reentrenamiento, lo que permite añadir acciones MQTT o APIs REST de forma incremental.
- Atención al cliente en turco con barge-in: la interrupción en menos de 80 ms y el full-duplex permiten conversaciones naturales donde el usuario puede corregir al asistente a mitad de respuesta.
- Identificación de miembros del hogar: el encoder de hablante de 1024 dimensiones permite separar historiales por usuario y personalizar respuestas sin VRAM adicional.
- Prototipado de investigación en voz a voz: la arquitectura single-architecture omni con proyector de 32 MB sirve como referencia reproducible para estudiar alineación entre tokenizadores y destilación de vocabulario.
- Clonación de voz para accesibilidad: con `--ref_wav` de 5 s se puede generar una voz personalizada a 24 kHz, útil para interfaces de lectura o asistentes personalizados.
- Despliegue en GPU de 8 GB: el modo `--low_vram` permite ejecutar el sistema en GPUs consumer más modestas con latencia de 2,5–4,0 s, adecuado para demos y entornos de desarrollo.

## Benchmarks y rendimiento

| Metrica | RTX 3060 12 GB | GPU 8 GB (`--low_vram`) | CPU-only (Ryzen 5 5500, INT8) |
|---|---|---|---|
| Brain throughput | 40,1 tok/s (24,9 ms/tok) | No disponible | 4,86 tok/s |
| Mouth TTFA | 180–210 ms | ~205 ms | No disponible |
| RTF del mouth | 0,37x | 0,37x | 4,17x (no tiempo real) |
| Latencia extremo a extremo (primer audio) | ~0,86–1,40 s | ~2,5–4,0 s | ~6,5 s (con tartamudeo) |
| Memoria | 10,0–10,6 GB VRAM | ~7,8 GB VRAM | ~16 GB RAM |

Métricas de alineación y resistencia reportadas por el autor:

| Metrica | Valor |
|---|---|
| Similitud coseno del proyector (140.843 tokens) | 0,9060 |
| MSE del proyector | 0,0016 |
| Validación `c0_CE` (200 clips turcos) | 1,1658 (61,5 % Top-1) |
| Validación `sub_Depth_CE` (15 codebooks) | 4,9141 |
| Test de estrés de 100 turnos | 100/100 turnos, 0 crashes, 0 OOM, TTFA medio 205 ms, RTF medio 0,34x |
| Verificación de pitch F0 | 220–279 Hz (ref. femenina) y 97–107 Hz (ref. masculina), sin deriva de género |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 10,0–10,6 GB en RTX 3060 12 GB; ~7,8 GB con `--low_vram` en GPU de 8 GB; ~16 GB de RAM en CPU-only.
- GPU recomendadas: NVIDIA RTX 3060 12 GB como objetivo principal; GPUs de 8 GB con modo `--low_vram`; H100/A100 no se mencionan en la documentación.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB y en GPUs de 8 GB con modo reducido.
- Opciones de despliegue: el repositorio describe un stack propio basado en PyTorch con CUDA Graphs duales; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,1 tok/s en el cerebro y RTF 0,37x en el mouth sobre RTX 3060; 4,86 tok/s y RTF 4,17x en CPU-only.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADA Omni (`urbanhorizons/ada-omni-tr`) | Gemma-3n-E2B + talker 0,6B + proyector 32 MB | No disponible (ventana de 25 s para wake-word) | Audio-a-audio turco/inglés | Apache-2.0 | Hugging Face, repo de 0,0 GB |
| Gemma-3n-E2B-it (base) | 2B efectivos | No disponible en esta ficha | Texto, audio, imagen | Gemma license | Hugging Face |
| Qwen3-0.6B-tr (`erkamk/qwen3-0.6b-tr`) | 0,6B | No disponible en esta ficha | Texto | No disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros sistemas de voz a voz turcos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el repositorio es una arquitectura de referencia para investigación y asistente personal/doméstico, no un dispositivo médico, asesor clínico ni sistema de emergencias; no debe usarse para decisiones críticas de seguridad sin supervisión.
- El alcance lingüístico se limita a turco e inglés; no hay soporte declarado para otras lenguas.
- El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos completos podrían no estar efectivamente publicados o que el artefacto principal es el proyector de 32 MB.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez frente a audio ruidoso más allá del test de 100 turnos.
- En CPU-only el sistema no es tiempo real (RTF 4,17x) y la latencia de ~6,5 s produce tartamudeo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma-3n-E2B-it está sujeto a la licencia de Gemma, cuyos términos deben respetarse en producción.
- La clonación de voz zero-shot con `--ref_wav` implica riesgos de suplantación; el autor no documenta salvaguardas específicas más allá de la passphrase opcional.
- No se detallan los datos de entrenamiento del proyector más allá de los 140.843 tokens de vocabulario y los 200 clips de validación, por lo que la cobertura de acentos y dominios turcos es desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urbanhorizons/ada-omni-tr
- Modelo base Gemma-3n-E2B-it (Unsloth): https://huggingface.co/unsloth/gemma-3n-E2B-it
- Modelo base del talker: https://huggingface.co/erkamk/qwen3-0.6b-tr
- Muestra de voz femenina: https://huggingface.co/urbanhorizons/ada-omni-tr/resolve/main/samples/demo_kadin.wav
- Muestra de voz masculina: https://huggingface.co/urbanhorizons/ada-omni-tr/resolve/main/samples/demo_erkek.wav
