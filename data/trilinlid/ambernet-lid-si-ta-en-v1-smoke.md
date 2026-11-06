# TRiLinLID/ambernet-lid-si-ta-en-v1-smoke

## Resumen

TriLinLID V1 es un modelo de identificación de idioma (language ID, LID) en tiempo real derivado de NVIDIA AmberNet, la arquitectura de clasificación de audio preentrenada con VoxLingua107. El autor, TRiLinLID, lo ha reajustado sobre el corpus `TriLingDATA/si-ta-en-asr` sustituyendo la cabeza de clasificación original por una de cuatro clases: cingalés (`si`), tamil (`ta`), inglés (`en`) y no-habla (`ns`). Su propósito no es transcribir, sino decidir en los primeros segundos de audio qué modo de reconocimiento automático del habla (ASR) debe activarse: cingalés+inglés, tamil+inglés o solo inglés.

El modelo está pensado para entornos de streaming: consume audio de 16 kHz en mono en fragmentos de cualquier tamaño (por ejemplo, 0,25 s), acumula evidencia y emite una decisión con nivel de confianza en cuanto supera los umbrales calibrados. Según la model card, la decisión se toma antes de que termine el clip en el 92 % de los casos, con una mediana de 1,71 s de habla antes de decidir.

La relevancia actual radica en que muchos despliegues de ASR multilingüe en el sur de Asia necesitan enrutar el audio hacia el modelo acústico correcto, y un clasificador ligero de 1,2 GB que funciona en CPU libera a la GPU para la tarea de transcripción. El repositorio es un "smoke test" (versión de validación), con 105 descargas y sin likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AmberNet (red neuronal para clasificación de audio, base `nvidia/langid_ambernet`); cabeza de 4 clases (`si`, `ta`, `en`, `ns`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio); ventana de streaming de 4,0 s con hop de 0,25 s, espera máxima 6,0 s, tope duro 8,0 s |
| Tipos de cuantizacion | no disponible (formato `.nemo` propietario de NeMo) |
| Idiomas soportados | cingalés (`si`), tamil (`ta`), inglés (`en`); clase adicional `ns` (no-habla) |
| Licencia | `other` (términos NGC de NVIDIA para AmberNet; verificar antes de uso comercial) |
| Formato de pesos | `.nemo` (NeMo), con ficheros auxiliares `calibration.json` y `lid_stream.py` |
| Muestreo de audio | 16 kHz mono float32 |
| Tamano del repositorio | 1,2 GB |
| Tarea (pipeline) | `audio-classification` / `language-identification` |
| Version / fingerprint | `197f1902aea9`, mejor paso 60 |

## Arquitectura y entrenamiento

La base es AmberNet de NVIDIA, un modelo de clasificación de audio entrenado originalmente sobre VoxLingua107 para identificación de idioma. El ajuste fino de TRiLinLID reemplaza la cabeza original por una de cuatro clases y entrena sobre el dataset `TriLingDATA/si-ta-en-asr`, con recortes de 0,5 a 5 s. La composición declarada es: cingalés a partir de OpenSLR y clips de YouTube/BizBrains en cingalés puro; tamil a partir de Common Voice e IndicTTS; inglés a partir de Svarah, LibriTTS-R y clips en inglés grabados dentro de los corpus de cingalés y tamil.

El entrenamiento incorpora varias técnicas orientadas a robustez en streaming: aumentación independiente del idioma (ruido, reverberación de sala, ecualización de micrófono, banda telefónica, códecs, babble y fondos reales mezclados entre idiomas), consistencia entre recortes cortos y largos, y un adversario de fuente dentro del mismo idioma para evitar que el modelo aprenda a discriminar por dominio de grabación en lugar de por idioma. La calibración se aplica en dos capas: temperatura de 1,193 ya integrada en el `.nemo`, y un margen específico cingalés/tamil de 4,25 junto con una regla de decisión en streaming (`hop_s` 0,25, `window_s` 4,0, `min_speech_s` 0,8, `en_prob` 0,9, `en_min_speech_s` 2,0, `max_wait_s` 6,0, `hard_cap_s` 8,0) expuesta en `calibration.json`.

## Capacidades

- Clasificación de idioma entre cingalés, tamil e inglés a partir de audio de 16 kHz.
- Detección de no-habla (`ns`) con una tasa del 93,8 % según la model card.
- Funcionamiento en streaming con fragmentos de cualquier tamaño (probado a 0,25 s), acumulando evidencia hasta emitir decisión.
- Salida de decisión con idioma, modo de ASR sugerido (`si+en`, `ta+en`, `en`) y nivel de confianza.
- Decisión temprana: 92 % de los clips resueltos antes de terminar; mediana de 1,71 s de habla.
- Ejecución en CPU (`device="cpu"` en el ejemplo de la model card), sin requerir GPU.
- No realiza transcripción, traducción ni diarización; es exclusivamente un enrutador de idioma.

## Casos de uso

- Enrutamiento de ASR multilingüe en centros de contacto del sur de Asia: el modelo escucha los primeros segundos de la llamada y selecciona el modo `si+en`, `ta+en` o `en` antes de cargar el modelo acústico pesado, reduciendo el coste de ejecutar varios ASR en paralelo.
- Asistentes de voz en vivo en dispositivos móviles: al ejecutarse en CPU y con ventanas de 4 s, puede integrarse en la captura de micrófono del propio dispositivo para conmutar el idioma del reconocedor sin enviar audio a la nube.
- Subtitulado en directo de emisiones de televisión o radio en Sri Lanka y Tamil Nadu: la detección temprana (mediana de 1,71 s) permite cambiar de pista de subtítulos cuando el hablante alterna entre cingalés, tamil e inglés.
- Moderación y analítica de contenido audiovisual: clasificar automáticamente grandes volúmenes de vídeos de YouTube por idioma hablado para indexación, búsqueda o cumplimiento de cuotas regionales.
- Preprocesado de corpus para entrenamiento de ASR: filtrar grabaciones mal etiquetadas o detectar segmentos sin habla antes de alimentar pipelines de anotación.
- Atención al cliente automatizada con IVR inteligente: detectar el idioma del usuario en la locución inicial y derivar a la cola del agente o al árbol de menús adecuado.
- Investigación lingüística de code-switching: cuantificar la proporción de cingalés, tamil e inglés en grabaciones mixtas con ventanas de 4 s.

## Benchmarks y rendimiento

Resultados declarados en la model card (precisión en porcentaje, recortes desde el inicio del clip):

| Fuente | clean 1s | clean 2s | clean 3s | clean full | live 1s | live 2s | live 3s | live full |
|---|---|---|---|---|---|---|---|---|
| en:libritts_r | 100 | 100 | 100 | 100 | 93,8 | 100 | 100 | 100 |
| en:svarah_english | 93,8 | 100 | 100 | 100 | 81,2 | 92,3 | 100 | 93,8 |
| si:bizbrains_sinhala | 90 | 100 | 100 | 100 | 100 | 100 | 90 | 100 |
| si:openslr_sinhala | 75 | 86,7 | 87,5 | 93,8 | 62,5 | 66,7 | 75 | 81,2 |
| si:youtube_sinhala | 93,8 | 100 | 100 | 100 | 87,5 | 93,8 | 100 | 100 |
| ta:common_voice_tamil | 75 | 100 | 100 | 100 | 68,8 | 75 | 100 | 100 |
| ta:indic_tts_tamil | 75 | 81,2 | 87,5 | 87,5 | 68,8 | 68,8 | 87,5 | 87,5 |

Métricas agregadas: precisión macro global del 89,5 %, confusión cingalés↔tamil del 1,94 %, detección de no-habla del 93,8 %. Precisión sobre fuentes no vistas en entrenamiento: no disponible (`n/a` en la model card).

Simulación de streaming (fragmentos de 0,25 s sobre clips de test): precisión de decisión del 94,3 %, errores cingalés↔tamil del 0,00 %, decisión antes del final del clip en el 92 % de los casos, mediana de habla antes de decidir de 1,71 s.

| Grupo | n | acc | early | median_speech_s |
|---|---|---|---|---|
| en:libritts_r | 16 | 1,000 | 1,000 | 2,070 |
| en:svarah_english | 16 | 0,875 | 0,750 | 2,040 |
| si:bizbrains_sinhala | 10 | 1,000 | 1,000 | 0,945 |
| si:openslr_sinhala | 16 | 0,938 | 0,875 | 1,020 |
| si:youtube_sinhala | 16 | 1,000 | 1,000 | 0,990 |
| ta:common_voice_tamil | 16 | 0,938 | 0,812 | 1,620 |
| ta:indic_tts_tamil | 16 | 0,875 | 1,000 | 1,365 |

No se han publicado comparaciones con otros modelos LID en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,2 GB y la model card demuestra ejecución en CPU (`device="cpu"`), por lo que la inferencia no requiere GPU.
- GPU recomendadas: no aplica; cualquier GPU con al menos unos pocos GB de VRAM puede alojar el modelo si se desea acelerar, pero no es necesario.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi o portátiles sin GPU dedicada, siempre que se ejecute en CPU.
- Opciones de despliegue: NeMo (librería nativa, formato `.nemo`); el script `lid_stream.py` del repositorio implementa el wrapper de streaming. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: la mediana de habla antes de la decisión es de 1,71 s con ventana de 4 s y hop de 0,25 s; el tope duro es de 8 s. No se publican cifras de throughput (clips por segundo) en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriLinLID ambernet-lid-si-ta-en-v1-smoke | AmberNet fine-tuned, 4 clases | si, ta, en, ns | ventana 4 s, hop 0,25 s | `other` (NGC NVIDIA) | Hugging Face, 105 descargas |
| nvidia/langid_ambernet (base) | AmberNet original, VoxLingua107 | ~107 idiomas | no disponible | términos NGC NVIDIA | Hugging Face (NVIDIA) |
| Whisper (large-v3) como LID implícito | ASR seq2seq con detección de idioma | ~99 idiomas | 30 s | MIT (pesos abiertos) | Hugging Face, ampliamente desplegado |
| VoxLingua107 ECAPA-TDNN (SpeechBrain) | Clasificador LID | ~107 idiomas | ventana fija | Apache 2.0 | Hugging Face / SpeechBrain |

La comparativa es cualitativa: no se dispone de resultados de benchmarks cruzados entre estos modelos en la información proporcionada. Frente a Whisper, TriLinLID es mucho más ligero y está especializado en tres idiomas con una ventana de streaming corta; frente a VoxLingua107, gana en especificidad para cingalés/tamil/inglés y en capacidad de decisión temprana, pero pierde cobertura idiomática.

## Limitaciones y advertencias

- Entrenado sobre corpus de estilo lectura y locución (OpenSLR, Common Voice, IndicTTS, LibriTTS-R, Svarah); el propio autor recomienda validar con micrófonos propios antes de desplegar.
- Precisión sobre fuentes no vistas en entrenamiento: no evaluada (`n/a`), por lo que el rendimiento en dominios nuevos (llamadas telefónicas reales, audio con ruido industrial, acentos no representados) es incierto.
- Confusión cingalés↔tamil del 1,94 % en evaluación offline y 0,00 % en la simulación de streaming; el riesgo, aunque bajo, no es nulo y puede afectar a la selección del modo ASR.
- El modelo no transcribe ni traduce: es exclusivamente un clasificador de idioma; no debe usarse como sustituto de un ASR.
- Licencia `other`: AmberNet se distribuye bajo los términos NGC de NVIDIA, que deben revisarse antes de cualquier uso comercial. La model card no aclara si el fine-tune hereda restricciones adicionales.
- Es una versión "smoke" (validación), con 105 descargas y 0 likes; no hay garantía de mantenimiento ni de soporte por parte del autor.
- Repositorio de 1,2 GB y formato `.nemo` propietario de NeMo: requiere la librería NeMo para cargarlo, lo que añade dependencias pesadas frente a alternativas en ONNX o GGUF.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en segmentos cortos o con solapamiento de hablantes.
- No se documentan sesgos demográficos ni evaluación por género, edad o acento; la cobertura de variantes dialectales del tamil y el cingalés es desconocida.

## Enlaces

- Modelo en Hugging Face (versión smoke): https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v1-smoke
- Versión no smoke del mismo autor: https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v1
- Modelo base NVIDIA AmberNet: https://huggingface.co/nvidia/langid_ambernet
- Dataset de ajuste fino: https://huggingface.co/datasets/TriLingDATA/si-ta-en-asr
- Documentación de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Términos NGC de NVIDIA (licencia de AmberNet): https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-software-license-agreement/
