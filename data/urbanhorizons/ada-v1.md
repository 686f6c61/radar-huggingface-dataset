# urbanhorizons/ada-v1

## Resumen

ADA v1 (etiquetado por el autor como `v0.1-alpha`) es un prototipo de investigación de código abierto para construir un asistente de voz local en turco con arquitectura extremo a extremo *speech-in / speech-out*. Lo desarrolla el usuario independiente `urbanhorizons` y se apoya en dos piezas preexistentes: la torre acústica de Qwen2-Audio (unos 600M de parámetros) como codificador de audio y el modelo de lenguaje turco Kumru-2B (`vngrs-ai/Kumru-2B`) como motor semántico, congelado y adaptado mediante LoRA de rango 8.

El problema que aborda es la latencia y la fragilidad de las tuberías clásicas ASR → LLM → TTS: en su lugar, un adaptador convolucional de dos capas proyecta las representaciones acústicas directamente al espacio de embeddings del LLM, y la salida de texto se sintetiza con una línea vocal EMA-TTS a 48 kHz. Todo el sistema está pensado para ejecutarse en hardware de borde (Raspberry Pi 5, mini-PC con NPU) y se entrenó en una única GPU de consumo de 12 GB de VRAM.

Es relevante ahora porque ejemplifica una tendencia concreta: prototipos de voz de pesos abiertos entrenados con recursos mínimos, con licencia Apache 2.0 y con una honestidad inusual en la documentación de sus límites. No obstante, el repositorio solo publica los pesos adaptadores (unos 99 MB en total), no el modelo completo, y las métricas de calidad real con voz humana siguen sin medirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: torre acústica Qwen2-Audio (600M) + adaptador Conv1d de 2 capas + LLM Kumru-2B con LoRA + TTS EMA a 48 kHz |
| Parámetros totales | No disponible (el repositorio publica solo adaptadores: ~99 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache 2.0 (sujeta a las condiciones de los modelos upstream) |
| Formato de pesos | safetensors (adaptadores PEFT LoRA y puente acústico-semántico) |

## Arquitectura y entrenamiento

La arquitectura es una cadena secuencial *VAD-gated* con soporte de *barge-in*: la entrada de audio PCM a 16 kHz pasa por la torre de Qwen2-Audio, que produce representaciones acústicas de 1280 dimensiones a 25 Hz. Un adaptador de dos capas Conv1d con LayerNorm agrupa las características de dos en dos (*Stack=2*) para reducir la tasa a 12,5 Hz antes de inyectarlas en Kumru-2B, que permanece congelado y solo se ajusta mediante un LoRA de rango 8 y alpha 16. La salida textual se convierte en voz con una línea EMA-TTS a 48 kHz.

El entrenamiento resolvió tres problemas documentados por el autor: el «papuagueo» o eco (el modelo repetía la entrada del usuario), la desalineación de escalas temporales y el desajuste de normas entre el adaptador y el espacio de embeddings del LLM (calibrado con LayerNorm a una norma aproximada de 45,0). La alineación semántica se logró con destilación KL usando Kumru-2B en modo texto como profesor congelado, con una mezcla de pérdidas del 50 % KL, 30 % diálogo retenido y 20 % anclaje ASR. Todo el desarrollo se realizó en una única GPU de consumo de 12 GB.

## Capacidades

- Comprensión de voz en turco directamente a nivel neuronal, sin ASR intermedio separado.
- Generación de voz de salida (*speech-out*) mediante la línea vocal EMA-TTS a 48 kHz con modelado de respiración.
- Detección de actividad de voz (Silero-VAD) con soporte de *barge-in*: la línea vocal se corta cuando el usuario interrumpe.
- Orquestación determinista de tareas: resolución de expresiones temporales en turco («yarın sabah sekiz», «ayın on beşi») mediante regex y motor de calendario, sin inferencia probabilística.
- Capa de seguridad con barreras de código: rechazo de cambios de dosis, combinaciones de fármacos y diagnósticos; bloqueo del encendido remoto de aparatos peligrosos (cocina, horno, calefactor).
- Notificaciones proactivas condicionadas a consentimiento explícito (`consent_given=True`).
- No se documenta soporte de *tool calling* genérico, agentes multi-paso ni visión.

## Casos de uso

- Asistente de voz doméstico en turco sobre Raspberry Pi 5 o mini-PC con NPU: el sistema completo está diseñado para hardware de borde y el adaptador más el LoRA ocupan menos de 100 MB, lo que permite distribuirlo en dispositivos con recursos limitados.
- Recordatorios y gestión de agenda por voz: la resolución determinista de fechas y horas en turco evita que el LLM invente interpretaciones de «mañana por la mañana» o «el día quince».
- Acompañamiento a personas mayores con protocolos de caída y emergencia: los escenarios incluidos (caída/emergencia, seguridad de medicación, recordatorio, automatización del hogar) están pensados para este perfil, con derivación al médico y sin decisiones clínicas automáticas.
- Investigación en destilación KL para alineación audio-texto: el repositorio documenta la receta (Stack=2, calibración de normas, mezcla 50/30/20) y sirve como base reproducible para experimentos similares en otras lenguas de bajos recursos.
- Evaluación de *barge-in* y latencia en asistentes locales: la integración de Silero-VAD con corte de la línea vocal permite medir la respuesta a interrupciones en entornos reales.
- Base para prototipos de voz multilingües: al separar torre acústica, adaptador y LLM, es posible sustituir Kumru-2B por otro modelo de lenguaje y reentrenar solo el puente y el LoRA.
- Docencia y pruebas de sistemas deterministas de seguridad: el orquestador incluye 33 pruebas `pytest` que ilustran cómo separar lógica crítica de las predicciones probabilísticas del LLM.

## Benchmarks y rendimiento

| Métrica | Resultado | Notas |
|---|---|---|
| Eco en prueba de estrés sintética | 0,0 % (0/15) | Intervalo de confianza Wilson del 95 %: [0,0 % – 18,1 %] |
| CER con voz humana real | No medido | Pendiente de evaluación a gran escala con grabaciones reales |
| Comparación con Whisper (CER) | No realizada | El informe comparativo está en fase de pruebas |
| *Barge-in* | Basado en VAD local | Umbral Silero-VAD; no se reportan latencias |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entorno de entrenamiento documentado: una GPU de consumo NVIDIA con 12 GB de VRAM.
- Hardware objetivo: Raspberry Pi 5, mini-PC con NPU y sistemas embebidos locales.
- VRAM de inferencia estimada: no disponible; depende del despliegue completo (torre Qwen2-Audio de 600M + Kumru-2B + TTS), no solo de los adaptadores publicados.
- GPU recomendadas: no disponible; el autor no publica perfiles de latencia ni throughput por GPU.
-Compatibilidad con GPU de consumo: el entrenamiento cupo en 12 GB, pero no se documenta la VRAM necesaria para servir el sistema completo.
- Opciones de despliegue: no se especifican (no se mencionan vLLM, llama.cpp, Ollama ni TGI); el repositorio incluye código de inferencia propio y el orquestador en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ADA v1 | No disponible (adaptadores ~99 MB sobre Qwen2-Audio 600M + Kumru-2B) | No disponible | Turco | Apache 2.0 | Voz extremo a extremo local con orquestador determinista |
| Qwen2-Audio | ~600M (torre acústica usada por ADA) | No disponible en la información | Multilingüe | No disponible en la información | Comprensión de audio y voz |
| Kumru-2B | 2B | No disponible en la información | Turco | No disponible en la información | LLM turco |
| Whisper | No disponible en la información | No disponible en la información | Multilingüe | No disponible en la información | ASR |

La comparación directa con Whisper en CER está pendiente según el propio autor. No se dispone de datos comparativos de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El CER con voz humana real no se ha medido; el 0,0 % de eco corresponde a solo 15 consultas sintéticas con un intervalo de confianza amplio.
- El modelo puede confundir el nombre de la persona (*persona*) por residuos en los datos de entrenamiento.
- En habla turca muy rápida (más de 180 palabras por minuto) puede producirse desalineación del adaptador.
- El sistema no es un dispositivo médico: el seguimiento de medicación, la derivación médica y los protocolos de emergencia son experimentales y no deben usarse en escenarios clínicos o críticos.
- Solo se publican los adaptadores (puente Conv1d y LoRA), no los pesos completos; el despliegue requiere descargar los modelos base y respetar sus licencias upstream.
- El soporte lingüístico se limita al turco.
- No se documentan sesgos, riesgos de alucinación ni restricciones comerciales adicionales más allá de la licencia Apache 2.0 y las condiciones de los modelos base.
- Es una *research preview* (`v0.1-alpha`), sin garantías de estabilidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urbanhorizons/ada-v1
- Perfil del autor: https://huggingface.co/urbanhorizons
- Modelo base del LLM: https://huggingface.co/vngrs-ai/Kumru-2B
