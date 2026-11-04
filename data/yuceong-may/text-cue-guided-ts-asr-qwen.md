# YuCeong-May/Text-Cue-Guided-TS-ASR-Qwen

## Resumen

Text-Cue-Guided TS-ASR-Qwen es un sistema de reconocimiento automático del habla dirigido a un hablante objetivo (*target-speaker ASR*) desarrollado por YuCeong-May. Resuelve un problema concreto: transcribir únicamente a un hablante dentro de una grabación donde varias personas hablan a la vez, identificándolo mediante una pista textual (*cue*) de pocas palabras que ese hablante pronuncia. Si nadie pronuncia la pista, el modelo rechaza la petición de forma explícita.

La arquitectura combina un front-end acústico clásico (fbank de 80 dimensiones), un codificador acústico de 9 capas Conformer con atención cruzada a la pista textual en cada capa, un proyector de audio y un LLM Qwen2.5-0.5B ajustado con LoRA que genera la transcripción de forma autorregresiva y codiciosa. El modelo completo suma aproximadamente 715 M de parámetros (630 M del LLM base más 45 M de LoRA, más los módulos acústicos y de pista).

Es relevante porque sustituye el clásico *enrollment* de voz (una grabación de referencia del hablante) por una pista textual de 2 a 5 caracteres, lo que simplifica el flujo de uso en escenarios de diarización y transcripción selectiva. Está orientado exclusivamente a mandarín, con audio a 16 kHz y duraciones recomendadas por debajo de 20 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: front-end fbank + CueEncoder (Transformer) + AcousticEncoder (9 x Conformer) + AudioProjector + LLM Qwen2.5-0.5B con LoRA |
| Parametros totales | ~715 M (630 M LLM base + 45 M LoRA + 27,5 M AcousticEncoder + 7,5 M CueEncoder + 3,6 M AudioProjector; más una cabeza de clasificación de hablante de 1,8 M solo para entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio recomendado de hasta 20 s; 12,5 tokens de audio por segundo tras el proyector) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino mandarín (zh) |
| Licencia | FunASR Model Open Source License 1.1 |
| Formato de pesos | `model.pt` (PyTorch, 1,6 GB, incluye los pesos base de Qwen2.5-0.5B) |

## Arquitectura y entrenamiento

El pipeline tiene dos ramas que se fusionan por atención cruzada. La rama textual pasa la pista por un `CueTokenizer` con un vocabulario de 8406 unidades (caracteres y subpalabras chinas) y un `CueEncoder` de 4 capas Transformer con dimensión 256 (7,5 M de parámetros). La rama acústica parte de un fbank Kaldi de 80 dimensiones (ventana de 25 ms, salto de 10 ms), pasa por dos convoluciones con stride 2 (submuestreo 4x hasta 25 Hz) y por 9 capas Conformer (dimensión 256, 4 cabezas, FFN de 2048, kernel convolucional de 15; 27,5 M de parámetros); cada capa Conformer atiende por atención cruzada a la representación de la pista.

La salida acústica pasa por un `AudioProjector` (Conv1d con *gating*, 4 frames, stride 2, cuello de botella, proyección a 896 dimensiones; 3,6 M de parámetros), lo que deja 12,5 tokens de audio por segundo. El LLM es Qwen2.5-0.5B (24 capas, hidden 896) con LoRA de rango 64 y alpha 128 aplicado a q/k/v/o, gate/up/down y `lm_head` (45 M de parámetros adaptadores). La generación es codiciosa y produce etiquetas especiales: `<psok>cue<peok>transcript` cuando encuentra al hablante objetivo (con la pista entre corchetes en la posición donde aparece), `<reject/>` cuando la pista no está en el audio, y `<psok>cue<peok><reject/>` cuando se oye la pista pero no es del hablante objetivo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El checkpoint incluye una cabeza de clasificación de hablante (1,8 M) usada solo durante el entrenamiento, que la inferencia ignora.

## Capacidades

- Reconocimiento de habla dirigido a un hablante objetivo en mezclas de múltiples hablantes, guiado por una pista textual de 2 a 5 caracteres.
- Rechazo explícito de la petición cuando la pista no aparece en el audio o cuando aparece pero no la pronuncia el hablante objetivo.
- Delimitación de la pista dentro de la transcripción generada mediante las etiquetas `<psok>` y `<peok>`.
- Transcripción en chino mandarín con audio a 16 kHz.
- Generación autorregresiva con decodificación codiciosa.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento extendido.

## Casos de uso

- Transcripción selectiva en reuniones: dado un audio donde varias personas hablan solapadas y una frase conocida que pronuncia el participante de interés, el modelo transcribe solo a ese participante, útil para actas centradas en un rol concreto.
- Extracción de declaraciones en entrevistas o juicios: si se conoce una frase que dijo el testigo, se aísla su intervención del resto de voces sin necesidad de una grabación de referencia de voz.
- Indexación y búsqueda de archivos de audio: con una pista textual de pocos caracteres se localiza y transcribe la intervención de un hablante específico en un archivo largo dividido en segmentos de hasta 20 segundos.
- Verificación de presencia de hablante: el rechazo explícito (`<reject/>`) permite usar el modelo como comprobador de si una frase concreta fue pronunciada por el hablante objetivo, por ejemplo en controles de calidad de grabaciones.
- Preprocesado para pipelines de subtitulado: al aislar la voz del hablante objetivo antes de la traducción o el resumen, se reduce el ruido de otras voces en la transcripción final.
- Investigación en diarización y ASR multi-hablante: sirve como referencia para comparar estrategias de *cue* textual frente a *enrollment* de voz en conjuntos como TS-Aishell.
- Asistentes de transcripción para atención al cliente: en llamadas con solapamiento de voces, transcribir solo al cliente o solo al agente usando una frase que pronuncie el rol objetivo.

## Benchmarks y rendimiento

Resultados sobre TS-Aishell (mezclas de dos hablantes de AISHELL-1 y AISHELL-2; 6000 mezclas por conjunto; CER / SER / tasa de rechazo en %; decodificación codiciosa):

| Conjunto de test | 2 caracteres | 3 caracteres | 4 caracteres | 5 caracteres |
|---|---|---|---|---|
| aishell1-ts | 4,21 / 20,32 / 0,92 | 2,69 / 17,08 / 0,35 | 2,09 / 15,23 / 0,32 | **1,83** / 13,90 / 0,57 |
| aishell-ios-ts | 11,56 / 44,55 / 3,67 | 8,77 / 38,73 / 3,12 | 7,22 / 34,32 / 4,47 | **6,34** / 29,25 / 7,58 |
| aishell-android-ts | 15,00 / 49,98 / 4,70 | 11,26 / 43,78 / 3,57 | 9,60 / 38,75 / 4,18 | **8,76** / 34,58 / 6,50 |
| aishell-mic-ts | 12,21 / 46,02 / 3,85 | 9,33 / 39,63 / 3,23 | 7,62 / 34,93 / 4,10 | **6,42** / 30,23 / 6,68 |
| aishell-mix-ts | 8,35 / 37,55 / 2,78 | 5,91 / 32,37 / 2,63 | 4,76 / 28,55 / 3,32 | **3,94** / 23,70 / 5,40 |

Pasar de 2 a 5 caracteres reduce el CER entre un 42 % y un 57 % relativo.

Comparación con Unified-TS-ASR (Conformer + CTC, 37 M de parámetros) con pista de 5 caracteres; Unified-TS-ASR dispone además de *enrollment* de voz de los primeros 5 s:

| Conjunto de test | Text-Cue-Guided TS-ASR-Qwen (solo pista textual) | Unified-TS-ASR (pista + enrollment) |
|---|---|---|
| aishell1-ts | **1,83** / 13,90 / 0,57 | 5,12 / 37,98 / 0,13 |
| aishell-ios-ts | **6,34** / 29,25 / 7,58 | 9,94 / 49,23 / 0,32 |
| aishell-android-ts | **8,76** / 34,58 / 6,50 | 12,06 / 55,57 / 0,80 |
| aishell-mic-ts | **6,42** / 30,23 / 6,68 | 9,31 / 47,75 / 0,20 |
| aishell-mix-ts | **3,94** / 23,70 / 5,40 | 9,27 / 47,77 / 25,53 |

El modelo propuesto obtiene menor CER en todos los conjuntos (entre 2,9 y 5,3 puntos absolutos menos) y mucho menor SER, a costa de aproximadamente 19 veces más parámetros y decodificación autorregresiva. También rechaza con más frecuencia (5-8 % en los conjuntos AISHELL-2 frente a menos del 1 % de Unified-TS-ASR). El 25,5 % de rechazo de Unified-TS-ASR en aishell-mix-ts se atribuye a *enrollments* grabados en un dispositivo distinto al del habla objetivo (33,7 % de rechazo en pares desajustados frente a 0,9 % en pares del mismo dispositivo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint `model.pt` ocupa 1,6 GB en FP32, por lo que en FP16 rondaría los 1,5-2 GB de pesos más el coste de activaciones y del front-end fbank.
- GPU recomendadas: no disponible. Por tamaño (0,7 B de parámetros) cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: el paquete `tcg_tsasr` del repositorio del Space de demostración (carga con `TextCueGuidedTSASR.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada de identidad | CER (aishell1-ts, 5 car.) | SER (aishell1-ts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Text-Cue-Guided TS-ASR-Qwen | ~715 M | Pista textual de 2-5 caracteres | 1,83 | 13,90 | FunASR Model Open Source License 1.1 | HuggingFace + Space |
| Unified-TS-ASR | 37 M | Pista textual + enrollment de 5 s | 5,12 | 37,98 | no disponible | Space de demostración |
| Alternativas de ASR dirigido por enrollment (p. ej. variantes de TS-ASR sobre Conformer) | no disponible | Enrollment de voz | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo mandarín; no soporta otros idiomas.
- La pista debe ser una frase que el hablante objetivo pronuncie realmente; si no aparece, el modelo rechaza la petición.
- Evaluado únicamente en mezclas de dos hablantes; no se han evaluado mezclas con más hablantes, ruido intenso ni audio de más de 20 segundos.
- Se recomiendan pistas de 2 a 5 caracteres; pistas más largas se aceptan pero no se han probado.
- La tasa de rechazo es notable (5-8 % en los conjuntos AISHELL-2 con pista de 5 caracteres), lo que implica perder transcripciones válidas en produccion si la pista es ambigua.
- El CER empeora de forma marcada en audio de dispositivos móviles (iOS y Android) frente a micrófono o mezcla.
- Riesgo de alucinación inherente a la decodificación autorregresiva del LLM, aunque acotado por las etiquetas de rechazo.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia FunASR Model Open Source License 1.1: es necesario revisar `MODEL_LICENSE` antes de un uso comercial; la licencia de Qwen2.5-0.5B subyacente puede imponer condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuCeong-May/Text-Cue-Guided-TS-ASR-Qwen
- Demo (Space Unified-TS-ASR): https://huggingface.co/spaces/YuCeong-May/Unified-TS-ASR
- Licencia del modelo: https://huggingface.co/YuCeong-May/Text-Cue-Guided-TS-ASR-Qwen/blob/main/MODEL_LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
