# SuperPauly/Clearline-NC-CPU

## Resumen

Clearline-NC-CPU es un modelo de cancelación de ruido en streaming para audio de voz, publicado por SuperPauly (con origen en el repositorio Scicom-intl/Clearline-NC) y distribuido en formato ONNX con un plugin para LiveKit Agents. Su función es actuar como filtro de supresión de ruido sobre flujos de audio de 16 kHz, procesando tramas de 20 ms con un retardo de 32 ms y funcionando exclusivamente en CPU. Se presenta como sustituto directo de GTCRN, un filtro de referencia en el ecosistema de agentes de voz, y ofrece dos modos: `asr`, orientado a alimentar un reconocedor de voz, y `quality`, orientado a la escucha humana.

El modelo forma parte de la familia Clearline, junto con Clearline-NC-GPU (del que el modo `quality` es una destilación) y Clearline-VAD. Su relevancia actual radica en el coste computacional: según la model card, consume aproximadamente un tercio del CPU por flujo de GTCRN en modo `asr` y cerca de la mitad en modo `quality`, con una latencia p99 de 0,46 ms y 0,72 ms por trama de 20 ms respectivamente. Está entrenado con audio de banda ancha y audio telefónico, y declara explícitamente no haber usado VoiceBank, VCTK ni DEMAND en el entrenamiento.

La información disponible no detalla la arquitectura interna más allá de indicar que el modo `quality` emplea un grafo mayor (256 unidades con niveles y ganancias por bin) frente a las 128 del modo `asr`. No se publican parámetros totales, longitud de contexto ni idiomas soportados. La licencia no está establecida todavía, lo que supone una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de supresión de ruido en streaming; grafo ONNX con 128 unidades en modo `asr` y 256 unidades con niveles y ganancias por bin en modo `quality`) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa tramas de 20 ms en streaming; retardo de 32 ms) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo opera sobre señal de audio, no sobre texto) |
| Licencia | No establecida; parte de los datos de entrenamiento son CC BY-NC (Expresso, EARS, WHAM!) |
| Formato de pesos | ONNX (`clearline_nc_asr.onnx`, `clearline_nc.onnx`) y PyTorch (`pytorch/*.pt`) |
| Frecuencia de muestreo | 16 kHz (entrada nativa; soporta también 48 kHz con remuestreo) |
| Retardo | 32 ms |
| Tamaño de trama | 20 ms |
| Pipeline | audio-to-audio |
| Librería | ONNX |

## Arquitectura y entrenamiento

No se dispone de una descripción detallada de la arquitectura en la información proporcionada. La model card indica que el modo `quality` es una destilación de un profesor GPU (la versión 1 de Clearline-NC-GPU) y que es un grafo mayor que el modo `asr`: 256 unidades con niveles y ganancias por bin frente a las 128 del modo `asr`. El modelo opera en streaming sobre tramas de 20 ms con un retardo de 32 ms, y está diseñado para ejecutarse en CPU con un coste por flujo muy reducido.

El entrenamiento se realizó sobre audio de banda ancha y audio telefónico, e incluye datos con licencia CC BY-NC (Expresso, EARS, WHAM!), lo que condiciona la licencia final del modelo. La model card indica explícitamente que no se usaron VoiceBank, VCTK ni DEMAND durante el entrenamiento. El modo `asr` mezcla de nuevo el 70% de la entrada con la señal filtrada, un valor elegido sobre datos de desarrollo para minimizar la tasa de error de palabras de Whisper; el modo `quality` elimina el ruido de fondo y preserva todas las voces. No se especifican el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, algo que no aplica a un modelo de audio de este tipo.

## Capacidades

- Supresión de ruido en streaming sobre audio de voz a 16 kHz, con tramas de 20 ms y 32 ms de retardo.
- Dos modos de operación: `asr` (por defecto, pensado para alimentar un reconocedor de voz) y `quality` (pensado para un oyente humano).
- Modo `asr`: reduce el suelo de ruido aproximadamente 2,5 dB y mezcla de nuevo el 70% de la entrada, priorizando la inteligibilidad para el ASR sobre la limpieza perceptual.
- Modo `quality`: elimina ruido de fondo y conserva todas las voces, incluyendo una segunda voz (dentro de aproximadamente 1 dB) y reducción de babble de multitud en torno a 25 dB.
- Compatible con audio telefónico de 8 kHz a través de cinco códecs (G.711, GSM, Opus, AMR-NB, G.723.1).
- Integración como `rtc.FrameProcessor[rtc.AudioFrame]` en LiveKit Agents, con una instancia por flujo de audio.
- Ejecución exclusiva en CPU, sin requisito de GPU.
- No incluye tool calling, agentes, razonamiento multi-step ni capacidades multimodales: es un filtro de audio.

## Casos de uso

- Agentes de voz en producción con LiveKit: el modelo se integra como `noise_cancellation` en `AudioInputOptions` y filtra el audio de entrada antes de enviarlo al reconocedor, con un coste de 1,71% de un núcleo por flujo en modo `asr` a 16 kHz con 8 flujos.
- Reconocimiento de voz en entornos ruidosos: el modo `asr` reduce la tasa de error de palabras de Whisper de 1,45% a 1,55% en banda ancha (frente al 2,65% de GTCRN) y mantiene el WER cerca del audio sin procesar en condiciones telefónicas, lo que lo hace adecuado para pipelines de transcripción en call centers.
- Telefonía y VoIP: el modo `asr` se mantiene a la altura del audio sin procesar a través de G.711, GSM, Opus, AMR-NB y G.723.1, por lo que es apto para filtrar audio de centralita telefónica antes de la transcripción.
- Atención al cliente automatizada: al operar en streaming con 32 ms de retardo y una instancia por flujo, permite conversaciones multi-turno en tiempo real sin introducir latencia perceptible.
- Transcripción de reuniones y notas de voz: el modo `quality` preserva voces secundarias y reduce babble de multitud, útil para diarización y actas en salas con varias personas.
- Despliegue en infraestructura sin GPU: al ejecutarse solo en CPU con un coste por flujo bajo, permite escalar muchos flujos concurrentes en servidores convencionales o en el borde.
- Preprocesado para asistentes de voz embebidos: el formato ONNX y la baja latencia p99 (0,46 ms por trama en modo `asr`) facilitan su integración en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Datos publicados en la model card de esta revisión:

| Métrica | GTCRN | ASR mode | Quality mode |
|---|---|---|---|
| CPU por flujo, 16 kHz, 8 flujos (% de un núcleo) | 5,39% | **1,71%** | 2,77% |
| CPU por flujo, 48 kHz, 8 flujos | 6,95% | **3,30%** | 3,89% |
| p99 por trama de 20 ms | 3,24 ms | **0,46 ms** | 0,72 ms |
| VoiceBank+DEMAND PESQ | 2,535 | 2,135 | **2,575** |
| VoiceBank+DEMAND SI-SDR | 14,6 dB | 10,5 dB | **17,4 dB** |
| DNS 2020 sintético, PESQ | 2,293 | 1,697 | **2,389** |
| DNS 2020 grabaciones reales, DNSMOS global | **2,75** | 2,34 | 2,73 |
| Whisper WER, banda ancha / G.711 (sin procesar 1,45% / 2,95%) | 2,65% / 4,26% | **1,55% / 2,90%** | 2,32% / 5,79% |
| Whisper WER, DNS 2020 sintético (sin procesar 5,38%) | 5,30% | **5,02%** | 6,48% |
| Whisper WER en 8 condiciones, ratio medio frente a sin procesar | 2,17 | **1,00** | 1,45 |

Resultados telefónicos (824 enunciados, cinco códecs a 8 kHz, luego filtro, luego Whisper):

| Whisper WER | Sin procesar | GTCRN | ASR mode | Quality mode |
|---|---|---|---|---|
| G.711 | 3,25% | 10,72% | **3,20%** | 4,64% |
| GSM | 7,41% | 15,60% | **6,96%** | 9,10% |
| Opus | 4,94% | 13,46% | **4,81%** | 7,32% |
| AMR-NB* | 4,83% | 13,66% | **5,24%** | 6,99% |
| G.723.1* | 7,72% | 16,62% | **7,78%** | 9,89% |

*Nunca vistos en entrenamiento. Las mediciones de Whisper se hicieron con Whisper large-v3 sobre los 824 enunciados de test de VoiceBank y los 150 clips sintéticos de DNS, comparando contra la transcripción del autor del modelo sobre la señal limpia, mediante el harness de STT-API con volcado y alineación previos del filtro en streaming.

## Requisitos de hardware

- Ejecución exclusiva en CPU; no requiere GPU.
- Coste por flujo en modo `asr`: 1,71% de un núcleo a 16 kHz con 8 flujos; 3,30% a 48 kHz.
- Coste por flujo en modo `quality`: 2,77% de un núcleo a 16 kHz; 3,89% a 48 kHz.
- Latencia p99 por trama de 20 ms: 0,46 ms (modo `asr`) y 0,72 ms (modo `quality`).
- VRAM estimada: no disponible (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier CPU convencional; el tamaño del repositorio es de 0,0 GB según HuggingFace, aunque los pesos ONNX y PyTorch están incluidos.
- Opciones de despliegue: plugin de LiveKit Agents incluido en el repositorio (`clearline/`), con `NoiseCancellation()`; pesos ONNX para uso directo con ONNX Runtime; pesos PyTorch para `clearline/nc_model.py`.
- Throughput estimado: con 8 flujos, el consumo agregado en modo `asr` a 16 kHz sería de aproximadamente 13,7% de un núcleo, lo que permite decenas de flujos concurrentes por núcleo.

## Comparativa con modelos similares

| Modelo | Tipo | CPU por flujo (16 kHz, 8 flujos) | PESQ VoiceBank+DEMAND | SI-SDR VoiceBank+DEMAND | DNSMOS DNS 2020 real | Licencia |
|---|---|---|---|---|---|---|
| Clearline-NC-CPU (ASR) | Supresión de ruido en streaming | 1,71% | 2,135 | 10,5 dB | 2,34 | No establecida |
| Clearline-NC-CPU (quality) | Supresión de ruido en streaming | 2,77% | 2,575 | 17,4 dB | 2,73 | No establecida |
| GTCRN | Supresión de ruido en streaming | 5,39% | 2,535 | 14,6 dB | 2,75 | No disponible |
| DTLN | Supresión de ruido | No disponible | Inferior al modo quality según la model card | No disponible | No disponible | No disponible |

La model card menciona DTLN como referencia en PESQ sobre el conjunto sintético de DNS 2020, donde el modo `quality` supera a GTCRN y DTLN, pero no aporta cifras concretas de DTLN. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no establecida: parte de los datos de entrenamiento son CC BY-NC (Expresso, EARS, WHAM!), lo que impide confirmar el uso comercial sin autorización expresa.
- El modo `quality` empeora la tasa de error de palabras de Whisper en varias condiciones (2,32% frente a 1,55% en banda ancha; 5,79% frente a 2,90% en G.711), por lo que no debe usarse para alimentar un ASR.
- El modo `asr` deja gran parte del ruido (reduce el suelo de ruido unos 2,5 dB) y mezcla de nuevo el 70% de la entrada: no es adecuado para escucha humana.
- En grabaciones reales de DNS 2020, el DNSMOS del modo `quality` (2,73) sigue por debajo del de GTCRN (2,75).
- El modelo está en desarrollo activo: cada subida es una revisión distinta y se recomienda fijar una revisión concreta en producción.
- Rendimiento degradado en códecs no vistos en entrenamiento (AMR-NB y G.723.1), donde el modo `asr` queda ligeramente por encima del audio sin procesar.
- No se especifican sesgos, idiomas soportados ni comportamiento con voces no presentes en los datos de entrenamiento.
- Requiere una instancia por flujo de audio; no está pensado para procesamiento por lotes fuera de línea.
- No se han publicado resultados de benchmarks fuera de los conjuntos y condiciones indicados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SuperPauly/Clearline-NC-CPU
- Clearline-NC-GPU (versión 1, profesor del modo `quality`): https://huggingface.co/Scicom-intl/Clearline-NC-GPU/tree/ac5d95507431e0616cd6eaa5d28c316882b8b236
- Clearline-VAD: https://huggingface.co/Scicom-intl/Clearline-VAD
- Colección Clearline: https://huggingface.co/collections/Scicom-intl/clearline-6ae3f6e7cbdc1a74fc801725
- Preprint de Clearline: no disponible como enlace directo en la información proporcionada (referencia: Husein Zolkepli, *Clearline: voice activity detection and noise cancellation for voice agents, on one CPU core*, Scicom (MSC) Berhad, 2026)
