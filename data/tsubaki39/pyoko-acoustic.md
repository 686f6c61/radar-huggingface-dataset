# tsubaki39/pyoko-acoustic

## Resumen

Pyoko Acoustic Frontend (PYKO v1) es un modelo acústico compacto de ~1,17 MiB desarrollado por el usuario tsubaki39 (repositorio `tsubaki39/pyoko-acoustic`), diseñado para la sincronización labial en tiempo real (lip-sync) sobre avatares VRM y Live2D. No es un modelo de lenguaje ni un sistema de reconocimiento de voz general: es un frontend acústico que recibe audio de entrada y predice visemas (vocales A, I, U, E, O, cierre de boca, voz, acento y respiración) para animar personajes virtuales en mandarín, japonés e inglés.

La arquitectura es una TCN (red convolucional temporal) causal de 5 bloques con activaciones SwiGLU, 192 canales y un campo receptivo de 630 ms. Se distribuye en un formato propietario denominado PYKO v1, cuantizado a int8 con agrupación de 32 (group-32), y está pensado para ejecutarse en CPU a través de los runtimes Rust y WebAssembly de Pyoko, sin dependencias de frameworks de aprendizaje automático y con solo 30 ms de lookahead.

Su relevancia actual reside en la combinación de tamaño extremadamente reducido, latencia baja y ejecución sin GPU, lo que lo hace adecuado para aplicaciones interactivas en navegador y en dispositivos de gama baja. La licencia es MIT OR Apache-2.0, aunque los datasets y los modelos docentes de alineación empleados en el entrenamiento conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN causal de 5 bloques con SwiGLU (192 canales, campo receptivo de 630 ms) |
| Parametros totales | no disponible (pesos de 1,17 MiB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (campo receptivo de 630 ms de audio) |
| Tipos de cuantizacion | int8 con agrupacion de 32 (group-32) |
| Idiomas soportados | zh (mandarin), ja (japones), en (ingles) |
| Licencia | MIT OR Apache-2.0 |
| Formato de pesos | PYKO v1 (`acoustic.pyk`) |

## Arquitectura y entrenamiento

El modelo es una red convolucional temporal (TCN) causal de 5 bloques con activaciones SwiGLU y 192 canales, con un campo receptivo de 630 ms. La salida son 8 señales discretas: 5 vocales (A, I, U, E, O), cierre de boca, voz, acento y respiración. El diseño causal y el lookahead de 30 ms permiten su uso en streaming en tiempo real. Los pesos se cuantizan a int8 con agrupación de 32, lo que reduce el artefacto a 1,17 MiB y permite ejecución en CPU sin frameworks de ML, a través de los runtimes Rust y WebAssembly de Pyoko (incluye CLI offline, C ABI y Web SDK).

El entrenamiento se realizó con alineamiento forzado CTC, destilación de profesores (teacher distillation) y mezcla de ruido con `musan-noise`, usando `pyoko-c` para mantener paridad de características con el runtime Rust. Los datos cubren mandarín (thchs30-segment, AISHELL-3, CSEMOTIONS, Common Voice 17.0 zh-CN), japonés (Common Voice 8.0 y 17.0 JA, AItuber-Persona-Voices-JA) e inglés (LibriSpeech, VCTK, LAION Character Voices, Common Voice 1.0 EN), junto con FLEURS como conjunto de evaluación zero-shot. La alineación se apoyó en profesores como `wav2vec2-lv-60-espeak-cv-ft` y `g2pW` para mandarín, `japanese-hubert-base-phoneme-ctc-v2` y `pyopenjtalk-plus` para japonés, y `hubert-base-phoneme-en` y `cmudict-espeak-ipa` para inglés.

## Capacidades

- Predicción de visemas en tiempo real: 5 vocales (A, I, U, E, O), cierre de boca, voz, acento y respiración.
- Sincronización labial para avatares VRM y Live2D.
- Soporte multilingüe para mandarín, japonés e inglés.
- Ejecución en CPU sin dependencias de frameworks de ML.
- Integración vía runtime Rust, WebAssembly, CLI offline (`--weights`), C ABI (`pyoko_create_with_weights`) y Web SDK (`{ weights }`).
- Robustez frente a ruido: entrenado con mezcla de `musan-noise`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo; es un frontend acústico especializado.

## Casos de uso

- VTubers y avatares en directo: el modelo convierte la voz del streamer en visemas en tiempo real con 30 ms de lookahead, adecuado para animar personajes Live2D y VRM durante emisiones en mandarín, japonés o inglés.
- Aplicaciones web interactivas: al compilarse a WebAssembly, puede ejecutarse en el navegador del cliente sin servidor de inferencia, reduciendo coste y latencia en chats con personajes animados.
- Doblaje y localización de contenido: permite generar animaciones faciales sincronizadas para vídeos doblados en zh, ja y en a partir del audio resultante.
- Videojuegos y experiencias de realidad virtual: al ejecutarse en CPU y ocupar 1,17 MiB, cabe en dispositivos de gama baja y consolas sin GPU dedicada, habilitando diálogos con NPC animados.
- Asistentes conversacionales con personaje: combinado con un TTS, permite animar la boca del personaje mientras reproduce la respuesta de voz, con soporte de tres idiomas.
- Herramientas de accesibilidad: puede animar un avatar que reproduzca visualmente el habla para personas con discapacidad auditiva, mostrando los visemas correspondientes al audio.
- Prototipado rápido en Rust: la CLI offline y la C ABI permiten integrar el modelo en pipelines de pruebas o en aplicaciones nativas sin dependencias pesadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre divisiones de validación disjuntas por hablante/persona y holdouts zero-shot de FLEURS. `Dsp` es la línea base sin pesos.

| Pista de evaluacion | Precision vocal (Micro / Dsp) | Macro F1 | Precision de voz |
|---|---|---|---|
| Mandarin (thchs30, aishell3_zh, csemotions_zh, cv17_zh) | 80,2–91,9 % / 46,4–54,1 % | 78,2–91,1 % | 95,0–96,9 % |
| Japones (cv17_ja, aituber_ja) | 86,3–89,5 % / 40,2–51,7 % | 84,9–88,7 % | 97,6–97,9 % |
| Ingles (librispeech, cv1, vctk, character) | 69,8–82,8 % / 43,5–48,8 % | 68,1–81,8 % | 95,2–96,4 % |
| FLEURS zero-shot (zh, ja, en) | 67,2–80,9 % / 45,1–54,8 % | 64,8–79,4 % | 78,2–96,4 % |
| Negativos de ruido (musan_noise_neg) | — | — | 95,7 % (4,3 % FVR) |

Los resultados por corpus completos, matrices de confusión y revisiones fijadas de los datasets están en `metrics.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier GPU consumer, aunque no es necesario usarla; el despliegue típico es en CPU.
- Opciones de despliegue: runtime Rust de Pyoko, WebAssembly (Web SDK), CLI offline (`--weights`), C ABI (`pyoko_create_with_weights`).
- Latencia y throughput: lookahead de 30 ms; no se publican cifras de throughput ni de latencia total en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Se puede señalar que la categoría funcional (predicción de visemas para lip-sync) suele resolverse con modelos de mayor tamaño basados en redes neuronales profundas o con soluciones basadas en reglas; sin embargo, no se aportan cifras verificables para una comparación cuantitativa, por lo que se indica "no disponible".

## Limitaciones y advertencias

- Diseñado para voz mono de un solo hablante; no soporta mezclas multi-hablante ni transcripción.
- No es un modelo de reconocimiento de voz ni de generación de audio; su salida son visemas, no texto ni audio.
- Rendimiento inferior en inglés (69,8–82,8 % de precisión vocal) frente a mandarín y japonés, y caída notable en zero-shot sobre FLEURS (67,2–80,9 %).
- Precisión de voz del 78,2 % en el peor caso de FLEURS zero-shot, lo que puede afectar a la detección de actividad vocal en dominios no vistos.
- Tasa de falsos positivos de voz del 4,3 % en negativos de ruido.
- Riesgo de degradación con ruido no representado en `musan-noise` o con acentos y dialectos alejados de los corpus de entrenamiento.
- Licencia de los pesos: MIT OR Apache-2.0; los datasets y profesores de alineación conservan sus licencias originales (Apache-2.0, CC0-1.0, CC-BY-4.0, BSD-2-Clause, entre otras), que deben revisarse para uso comercial.
- El formato PYKO v1 es propietario y requiere los runtimes de Pyoko; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsubaki39/pyoko-acoustic
- Métricas detalladas: https://huggingface.co/tsubaki39/pyoko-acoustic/blob/main/metrics.json
- Dataset thchs30-segment: https://huggingface.co/datasets/changelinglab/thchs30-segment
- Dataset AISHELL-3: https://huggingface.co/datasets/AISHELL/AISHELL-3
- Dataset CSEMOTIONS: https://huggingface.co/datasets/ATH-MaaS/CSEMOTIONS
- Dataset Common Voice 17.0 zh-CN: https://huggingface.co/datasets/masuidrive/cv-corpus-17.0-zh-CN-client_id-grouped
- Dataset Common Voice 8.0 JA: https://huggingface.co/datasets/japanese-asr/ja_asr.common_voice_8_0
- Dataset Common Voice 17.0 JA: https://huggingface.co/datasets/masuidrive/cv-corpus-17.0-ja-client_id-grouped
- Dataset AItuber-Persona-Voices-JA: https://huggingface.co/datasets/kizuna-intelligence/AItuber-Persona-Voices-JA
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset VCTK 16 kHz: https://huggingface.co/datasets/saeedzou/vctk-16khz
- Dataset LAION Character Voices: https://huggingface.co/datasets/laion/character-voices
- Dataset Common Voice 1.0 EN: https://huggingface.co/datasets/masuidrive/cv-corpus-1.0-en-client_id-grouped
- Dataset musan-noise: https://huggingface.co/datasets/bilguun/musan-noise
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Profesor de alineación mandarín: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- G2P mandarín: https://huggingface.co/YC-Chen/g2pW
- Profesor de alineación japonés: https://huggingface.co/prj-beatrice/japanese-hubert-base-phoneme-ctc-v2
- Profesor de alineación inglés: https://huggingface.co/Peacockery/hubert-base-phoneme-en
- Diccionario cmudict-espeak-ipa: https://huggingface.co/datasets/acojaco/cmudict-espeak-ipa
