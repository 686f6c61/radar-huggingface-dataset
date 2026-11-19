# yacan1585/sava

## Resumen

SAVA (Semantic Acoustic Voice Activity) es un modelo de detección de actividad de voz (VAD) y de detección de fin de turno conversacional, publicado por Inworld AI bajo licencia Apache 2.0. A diferencia de un VAD clásico basado únicamente en energía o en clasificación acústica de tramas, SAVA devuelve dos probabilidades por cada trama de audio de 40 ms: una de presencia de habla (`speech`) y otra de finalización del turno del hablante (`turn`). El modelo comparte una única red troncal que combina contexto acústico y semántico para distinguir habla de toses, risas, música o teclado.

La arquitectura es híbrida: un front-end causal de log-mel alimenta un mezclador de tramas y un tronco compuesto por tres bloques Mamba-2 y un bloque de atención causal, con cabezas separadas para actividad de voz y para fin de turno. Con 25,5 millones de parámetros y ejecución en PyTorch puro sobre CPU o GPU, está diseñado para despliegue en streaming de baja latencia en pipelines de voz conversacional.

El modelo es relevante porque unifica en un solo artefacto dos tareas que tradicionalmente se resuelven con dos modelos distintos (un VAD y un detector de fin de turno tipo smart-turn), y lo hace con licencia permisiva, lo que facilita su integración en agentes de voz, asistentes telefónicos y sistemas de diálogo en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: front-end log-mel causal + mezclador de tramas + tronco con 3 bloques Mamba-2 y 1 bloque de atención causal + cabezas de speech y turn |
| Parámetros totales | 25,5 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana causal de 512 tramas en el bloque de atención (aprox. 20,48 s a 40 ms por trama) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo procesa audio, no texto; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la carga se realiza mediante `sava.load("inworld/sava")` con verificación de checksum; el formato concreto no se especifica) |

## Arquitectura y entrenamiento

El front-end es un log-mel causal con 128 bins Slaney calculados sobre una DFT Hann de 25 ms cada 10 ms, con transformación log10 y suelo de 1e-10, normalización `(x + 4) / 4`, cuatro hops por trama y el log RMS de la trama. Un mezclador combina las características de la trama actual y la anterior mediante una proyección lineal a 512 dimensiones y RMSNorm. El tronco consta de tres bloques Mamba-2 (factor de expansión 2, dimensión de cabeza 64, estado 128, kernel de convolución 4) y un bloque de atención con 8 cabezas de consulta, 2 cabezas de clave/valor, dimensión de cabeza 64, ventana causal de 512 tramas, posiciones rotatorias, q y k normalizadas con RMS y atención autoexclusiva. Cada bloque incorpora una FFN SwiGLU de 2048. La cabeza de actividad de voz aplica RMSNorm, una proyección descendente a 512 y una capa de atención; la cabeza de turno se describe de forma parcial en la información disponible.

El modelo opera sobre audio mono a 16 kHz y emite dos probabilidades cada 40 ms. La probabilidad de habla se emite con 120 ms de lookahead (la decisión para una trama se publica 120 ms después), mientras que la probabilidad de fin de turno no tiene lookahead. No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se documenta una innovación de decodificación especulativa.

## Capacidades

- Detección de actividad de voz por trama con probabilidad calibrada cada 40 ms.
- Detección semántica de fin de turno conversacional sin lookahead, basada en contexto acústico y de frase.
- Discriminación de habla frente a ruidos no vocales como toses, risas, música o teclado.
- Procesamiento en streaming con estado de sesión (`sava.Session`) para audio entrante por fragmentos.
- Segmentación de audio en turnos mediante una política de referencia (`sava.Policy`) o políticas propias de la aplicación.
- Ejecución en CPU o en dispositivo GPU seleccionable explícitamente.
- No realiza selección de hablante objetivo; responde a cualquier voz.
- No gestiona interrupciones ni backchannels; esas decisiones se delegan en la política de diálogo de la aplicación.

## Casos de uso

- Atención al cliente telefónica: SAVA abre un turno cuando detecta inicio de habla y lo cierra cuando la frase está completa, lo que permite a un agente de voz responder sin esperas fijas y reducir la latencia percibida en conversaciones multi-turno.
- Asistentes de voz en dispositivos embebidos: con 25,5 M de parámetros y ejecución en CPU (3,8 ms por trama de 40 ms en un Apple M3 Max), puede integrarse en hardware sin GPU dedicada para activación por voz y corte de captura.
- Transcripción en streaming: la probabilidad de habla por trama permite segmentar el audio antes de enviarlo a un ASR, evitando transcribir silencios, música o ruido de fondo y reduciendo coste de cómputo.
- Detección de fin de turno en pipelines de diálogo: la salida `turn` sin lookahead permite cerrar el turno del usuario en el momento en que termina la frase, mejorando la naturalidad frente a temporizadores fijos.
- Moderación y análisis de reuniones: segmentación de intervenciones en grabaciones o reuniones en vivo para atribuir fragmentos de audio a turnos de habla y generar actas o resúmenes por intervención.
- Sistemas de subtitulado en tiempo real: activación y desactivación de la captura según la probabilidad de habla, con supresión de falsos positivos por ruidos ambientales como teclado o risas.
- Voice bots en centros de contacto con interrupciones controladas: la aplicación puede combinar la señal de turno con su propia política de diálogo para decidir cuándo ceder la palabra o ignorar backchannels.

## Benchmarks y rendimiento

La model card referencia comparativas gráficas (AUC de actividad de voz frente a Silero VAD en nueve lecturas de datasets públicos, y AUC de fin de turno frente a pipecat smart-turn v3.2) y remite a las tablas completas, intervalos de confianza, pruebas de ruido y pasos de reproducción en el repositorio de GitHub. No se proporcionan cifras numéricas en la información disponible, por lo que no se presentan valores concretos.

| Comparación | Referencia | Resultado numérico |
|---|---|---|
| Actividad de voz (AUC por dataset) | Silero VAD | no disponible en la información proporcionada |
| Fin de turno (AUC por dataset) | pipecat smart-turn v3.2 | no disponible en la información proporcionada |
| Ruido tipo habla (ESC-50) | medición de falsos positivos | no disponible en la información proporcionada |

Nota: la model card advierte de que las puntuaciones de habla usan el timing de salida propio de cada modelo, por lo que el lookahead de 120 ms de SAVA hace que la comparación no sea equitativa en latencia, y que ruidos suaves similares a habla pueden disparar SAVA.

## Requisitos de hardware

- VRAM estimada: no disponible; con 25,5 M de parámetros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, aunque no se publica una cifra de VRAM.
- GPU recomendadas: probado en NVIDIA Ampere, Hopper y Blackwell; también en CPU.
- CPU: en un Apple M3 Max, una stream consume 3,8 ms por trama de 40 ms.
- Cabe en GPU consumer: sí, por tamaño (25,5 M de parámetros), aunque no se especifican modelos concretos.
- Opciones de despliegue: paquete Python `inworld-sava` (PyTorch), CLI `sava run`, modo micrófono con el extra `inworld-sava[mic]`, y API de sesión en streaming (`sava.Session`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 120 ms de lookahead en la probabilidad de habla; la probabilidad de fin de turno no tiene lookahead. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAVA (inworld/sava) | VAD semántico + fin de turno | 25,5 M | ventana causal de 512 tramas (~20,48 s) | Apache 2.0 | Hugging Face y GitHub |
| Silero VAD | VAD acústico | no disponible | no disponible | no disponible en la información | referenciado como baseline |
| pipecat smart-turn v3.2 | Detección de fin de turno | no disponible | no disponible | no disponible en la información | referenciado como baseline |

No se dispone de datos de rendimiento numérico comparado en la información proporcionada; la model card remite a las tablas del repositorio para la comparación completa.

## Limitaciones y advertencias

- Ruidos suaves similares a habla pueden disparar falsos positivos; la model card cita los resultados de ESC-50 como medida de ese modo de fallo.
- El lookahead de 120 ms en la probabilidad de habla introduce latencia y hace que las comparaciones con otros VAD no sean equitativas en timing.
- No realiza selección de hablante objetivo: responde a cualquier voz, lo que puede ser problemático en entornos con múltiples hablantes.
- No gestiona interrupciones ni backchannels; requieren una política de diálogo externa.
- No se declaran idiomas soportados ni sesgos conocidos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni condiciones de atribución específicas más allá de las de la propia licencia.
- No se han publicado datos sobre cuantización ni formatos de pesos alternativos, lo que limita opciones de optimización en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19; se trata de una publicación muy reciente y de un mirror del modelo original de Inworld.

## Enlaces

- Hugging Face: https://huggingface.co/yacan1585/sava
- Modelo original en Hugging Face: https://huggingface.co/inworld/sava
- Repositorio GitHub: https://github.com/inworld-ai/sava
- Guía de integración: https://github.com/inworld-ai/sava/blob/main/docs/USAGE.md
- Benchmarks: https://github.com/inworld-ai/sava/blob/main/bench/README.md
- Guía de configuración para agentes: https://github.com/inworld-ai/sava/blob/main/AGENTS.md#setting-up-sava-for-a-user
