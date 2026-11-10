# urbanhorizons/turkish-omni-ada

## Resumen

Turkish-Omni-ADA (v0.1-alpha) es un prototipo de investigacion de codigo y pesos abiertos desarrollado por el usuario independiente urbanhorizons. Se presenta como una arquitectura turca de voz a voz (speech-in / speech-out) pensada para ejecutarse en dispositivos de borde (edge AI), construida sobre el modelo de lenguaje turco Kumru-2B de vngrs-ai, al que se le acopla una torre acustica derivada de Qwen2-Audio (600M) mediante un adaptador Conv1d de dos capas y un adaptador LoRA de bajo rango (r=8). El objetivo declarado es demostrar que una linea de voz local y de baja latencia puede sustituir a las pipelines discretas tradicionales (ASR -> LLM -> TTS externos).

El modelo es explicitamente un research preview / proof of concept, entrenado en una unica GPU de consumo NVIDIA de 12 GB de VRAM y orientado a hardware final como Raspberry Pi 5 o mini PC con NPU. No es un modelo de produccion: el propio autor reconoce que las metricas de reconocimiento de voz sobre voz humana real (CER) no se han medido y que la comparacion con Whisper esta pendiente. El repositorio pesa aproximadamente 0,1 GB y solo contiene los pesos originales entrenados por el autor (puente acustico y LoRA), no los pesos base.

La relevancia actual del proyecto es doble: por un lado, explora la integracion multimodal audio-lenguaje en turco, un idioma con relativamente pocos recursos abiertos; por otro, incorpora una capa de orquestacion determinista (`ada_orchestrator`) con logica de seguridad para escenarios de salud y domotica, separando explicitamente la parte probabilistica (el LLM) de la parte deterministica (reglas en Python).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre acustica Qwen2-Audio (600M) + adaptador Conv1d de 2 capas + Kumru-2B (LLM turco congelado + LoRA) + linea vocal EMA-TTS a 48 kHz |
| Parametros totales | No disponible de forma agregada; el repositorio solo contiene los pesos del adaptador (66 MB) y del LoRA (32 MB); el LLM base es Kumru-2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (se mantienen las condiciones de licencia de los modelos upstream) |
| Formato de pesos | safetensors (`ada_bridge.safetensors`, `ada_lora.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

La arquitectura es una linea secuencial de voz a voz: la entrada de audio PCM a 16 kHz se procesa con una torre acustica Qwen2-Audio de 600M que produce representaciones de 1280 dimensiones a 25 Hz; estas pasan por un adaptador Conv1d de dos capas con Stack=2 que reduce la tasa de tokens a 12,5 Hz; despues se inyectan en el LLM turco Kumru-2B, que permanece congelado y solo se adapta mediante LoRA (r=8, alpha=16). La salida de voz se genera con una linea vocal EMA-TTS a 48 kHz.

El autor documenta tres problemas tecnicos y sus soluciones: (1) el "papaqueo" o eco, es decir, la tendencia del modelo a repetir la entrada del usuario, mitigado con la agrupacion temporal Stack=2; (2) la calibracion de norma, fijando la salida del adaptador mediante LayerNorm a la distribucion de norma del espacio de embeddings de Kumru-2B (||e|| ≈ 45,0); y (3) la alineacion semantica mediante destilacion KL, usando Kumru-2B en modo texto como profesor congelado y una mezcla de datos del 50 % KL, 30 % dialogo held-out y 20 % ancla ASR. No se especifican el numero total de tokens de entrenamiento ni la composicion completa del dataset. El entrenamiento se realizo en una unica GPU de consumo de 12 GB.

## Capacidades

- Comprension de audio y generacion de voz en turco de forma nativa (speech-in / speech-out), sin depender de un ASR o TTS externos en la inferencia.
- Generacion de texto y razonamiento a traves del LLM turco subyacente Kumru-2B.
- Deteccion de actividad de voz (VAD) con Silero-VAD y soporte de barge-in (interrupcion del habla del asistente cuando el usuario empieza a hablar).
- Orquestacion determinista de tareas: resolucion de expresiones temporales en turco ("yarin sabah sekiz", "ayin on besi") mediante regex y motor de calendario.
- Capa de seguridad con reglas: rechazo de cambios de dosis, combinaciones de farmacos o peticiones de diagnostico; bloqueo a nivel de codigo del encendido remoto de electrodomesticos de riesgo (cocina, horno, calefactor).
- Notificaciones proactivas condicionadas a consentimiento explicito (`consent_given=True`).
- Soporte de tool calling / function calling: no documentado de forma explicita; la orquestacion se realiza mediante logica determinista externa, no mediante tool calling nativo del LLM.
- Capacidades de agente multi-paso: no documentadas como tales; los flujos se gestionan con maquinas de estado en Python.

## Casos de uso

- Asistente de voz local para personas mayores: el modelo gestiona dialogos hablados en turco y, junto con el orquestador, resuelve recordatorios de medicacion y citas con expresiones temporales naturales, sin enviar audio a la nube.
- Recordatorios y agenda por voz: la capa determinista interpreta frases como "yarin sabah sekiz" y las convierte en eventos de calendario; el LLM aporta la comprension conversacional y el TTS la respuesta hablada.
- Domotica con restricciones de seguridad: el orquestador permite comandos de voz para el hogar pero bloquea por codigo el encendido remoto de aparatos de riesgo, lo que lo hace adecuado para prototipos de asistencia domestica.
- Triaje conversacional no clinico: el sistema puede mantener una conversacion de voz y derivar al usuario a un profesional ante sintomas, con un cortafuegos medico que rechaza diagnosticos y cambios de dosis (siempre como prototipo experimental, nunca como dispositivo medico).
- Investigacion en modelos audio-lenguaje para turco: sirve como base abierta (adaptador y LoRA) para que otros investigadores experimenten con alineacion acustico-semantica en un idioma de bajos recursos.
- Despliegue en dispositivos de borde: el diseno apunta a Raspberry Pi 5 y mini PC con NPU, por lo que encaja en prototipos de asistente offline con requisitos de privacidad y sin conectividad.
- Pruebas de interaccion con barge-in: util para evaluar tecnicas de interrupcion del habla en asistentes de voz locales con VAD.

## Benchmarks y rendimiento

El autor solo publica un dato de validacion, correspondiente a una prueba de estres sintetica y no a un benchmark estandar:

| Metrica | Resultado | Notas |
|---|---|---|
| Eco / repeticion en prueba de estres sintetica | 0,0 % (0/15) | Intervalo de confianza Wilson al 95 %: [0,0 % - 18,1 %]; n=15 |
| CER sobre voz humana real | No medido | Pendiente de evaluacion con grabaciones reales |
| Comparacion frente a Whisper (CER) | No realizada | El informe comparativo esta en fase de pruebas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Entorno de entrenamiento documentado: una unica GPU de consumo NVIDIA con 12 GB de VRAM.
- Hardware objetivo: dispositivos de borde como Raspberry Pi 5, mini PC con NPU y sistemas embebidos locales.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del LLM base (Kumru-2B) y la torre acustica (600M), cabe esperar requisitos en el rango de GPU de consumo, pero no se aportan cifras.
- GPU recomendadas: no disponibles; el autor solo cita una GPU de consumo de 12 GB para el entrenamiento.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye codigo de inferencia propio y el orquestador en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados por el autor. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (modelos audio-lenguaje y asistentes de voz abiertos):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turkish-Omni-ADA | Kumru-2B + torre 600M (adaptador y LoRA publicados) | No disponible | Speech-in / speech-out en turco, edge AI | Apache 2.0 | Pesos del adaptador y LoRA en HF |
| Qwen2-Audio | No disponible en la informacion | No disponible | Audio-lenguaje multimodal | No disponible en la informacion | Pesos abiertos en HF |
| Whisper | No disponible en la informacion | No disponible | ASR (speech-to-text) | No disponible en la informacion | Pesos abiertos |
| Kumru-2B (vngrs-ai) | 2B | No disponible | LLM turco de texto | No disponible en la informacion | Pesos abiertos en HF |

La comparacion de rendimiento (CER, calidad de respuesta, latencia) no esta disponible porque el autor no ha publicado esas metricas.

## Limitaciones y advertencias

- Es un research preview / proof of concept (v0.1-alpha); no esta pensado para produccion.
- El CER sobre voz humana real no se ha medido; el unico dato de eco proviene de una prueba sintetica con n=15 y un intervalo de confianza amplio ([0 % - 18,1 %]).
- No hay comparacion con Whisper ni con lineas ASR+TTS convencionales.
- Sesgo de persona: por residuos del dataset de entrenamiento, el modelo puede confundir ocasionalmente el nombre de la persona.
- Limitacion con habla rapida: por encima de 180 palabras por minuto en turco puede producirse desalineacion del adaptador.
- El modelo no es un dispositivo medico; el seguimiento de medicacion, la derivacion medica y las alertas de emergencia son experimentales y no deben usarse en escenarios clinicos o criticos.
- La cobertura linguistica se limita al turco.
- La licencia es Apache 2.0, pero se mantienen las condiciones de los modelos upstream (Kumru-2B y Qwen2-Audio), que deben verificarse antes de un uso comercial.
- El repositorio no incluye los pesos base; es necesario descargar Kumru-2B y la torre acustica por separado.
- No se documentan cuantizaciones, contexto maximo ni opciones de despliegue estandar, lo que complica la integracion en pipelines existentes.
- Riesgo de alucinacion inherente al LLM subyacente; la seguridad se delega en el orquestador determinista, no en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urbanhorizons/turkish-omni-ada
- Perfil del autor: https://huggingface.co/urbanhorizons
- Modelo base (LLM turco): https://huggingface.co/vngrs-ai/Kumru-2B
- Repositorio del modelo base referenciado en los tags: https://huggingface.co/vngrs/Kumru-2B
- Qwen2-Audio (torre acustica de la que deriva el componente de audio): no se proporciona enlace especifico en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
