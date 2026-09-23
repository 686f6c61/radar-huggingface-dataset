# suryatmodulus/Audio8-ASR-Infinite

## Resumen

Audio8 ASR Infinite es un modelo de reconocimiento automático del habla (ASR) diseñado de forma nativa para funcionamiento en streaming continuo. Lo publica el autor suryatmodulus en Hugging Face bajo el identificador `suryatmodulus/Audio8-ASR-Infinite`, aunque la propia model card referencia los checkpoints y el repositorio bajo la organización Edge0 (`Edge0/Audio8-ASR-Infinite`, `github.com/Edge0-AI/Audio8-ASR-Infinite`). Su objetivo es transcribir audio de longitud ilimitada con latencia acotada, pensado para operación 24/7 sin degradación acumulada, algo que resuelve mediante una ventana de caché KV deslizante y una arquitectura de decodificación en flujo.

El modelo combina una torre de audio causal (heredera de Voxtral Realtime 4B) con un decodificador de texto basado en Qwen2.5-3B-Instruct, más un proyector y un embedding de longitud de trama entrenados desde cero. La decodificación avanza sobre un reloj de audio seleccionable de 80, 120 o 160 ms, con una decisión de token por paso, lo que da frecuencias de 12,5 / 8,3 / 6,25 tokens por segundo. Además incorpora un VAD semántico con cabeceras dedicadas de 8 clases y horizontes de 0,5 / 1,0 / 2,0 / 3,0 s, capaz de distinguir pausas de pensamiento, tartamudeo y final real de turno.

El checkpoint suma 4.086.224.640 parámetros (aproximadamente 4,09 mil millones) en bfloat16, con un peso total de 8,17 GB más el fichero de cabeceras VAD. Se encuentra en fase de "preview release": cubre la base de transcripción en chino e inglés, con un despliegue optimizado sobre una compilación adaptada de vLLM. La relevancia actual radica en su enfoque hacia ASR conversacional de baja latencia, donde el retardo de transcripción es configurable entre 240 y 560 ms y el coste de memoria se mantiene acotado durante sesiones prolongadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de audio causal (Voxtral Realtime) + proyector + decodificador transformer Qwen2.5-3B con GQA, streaming DSM-style |
| Parametros totales | 4.086.224.640 (aprox. 4,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; soporta audio de longitud ilimitada mediante ventana KV deslizante |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` 8,17 GB + `semantic_vad_heads.safetensors`) |

Especificaciones adicionales del checkpoint:

| Componente | Detalle |
|---|---|
| Torre de audio | 32 capas, hidden 1280, 128 bins mel, ventana deslizante 750 |
| Decodificador de texto | 36 capas, hidden 2048, 16 cabeceras de consulta / 2 cabeceras KV |
| Proyector | frame len maximo 8, dimension de proyeccion 10240, activacion gelu |
| Condicionamiento de longitud de trama | activado (`use_frame_len_embedding: true`) |
| Cabeceras VAD semantico | 8 clases, horizontes 0,5 / 1,0 / 2,0 / 3,0 s |
| Tamano de vocabulario | 151936 |
| Precisión | bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de audio en tiempo real de Voxtral combinada con un esquema de streaming de tipo DSM. La torre de audio es causal, con 32 capas, dimensión oculta de 1280 y ventana deslizante de 750, y se inicializa desde los pesos de Voxtral Realtime 4B, tras lo cual se reentrena. El decodificador de texto es un transformer de 36 capas y dimensión oculta 2048 que emplea atención con 16 cabeceras de consulta y 2 cabeceras KV (agrupadas), inicializado desde Qwen2.5-3B-Instruct. Entre ambos se sitúa un proyector con tamaño de proyección 10240 y activación gelu, junto a un embedding de longitud de trama que permite condicionar la salida al reloj de audio escogido. Tanto el proyector como el embedding de longitud de trama parten de inicialización aleatoria y se entrenan.

El diseño de streaming se apoya en una caché KV deslizante que mantiene acotados el consumo de memoria y la latencia incluso en ejecución ininterrumpida. La decodificación avanza a razón de un token de texto por paso de reloj, con tres relojes posibles (80, 120 y 160 ms) y retardos objetivo de transcripción configurables entre 240 y 560 ms; cada combinación de longitud de trama y retardo está post-entrenada, de modo que combinaciones no listadas funcionan pero sin garantía de rendimiento óptimo. Se incorporan además cabeceras de VAD semántico multi-horizonte sobre la misma rejilla temporal, orientadas a detectar finales de turno reales. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información figura como no disponible.

## Capacidades

- Transcripción de voz a texto en streaming continuo, con salida incremental en lugar de por segmentos completos.
- Reloj de audio seleccionable (80 / 120 / 160 ms), con 12,5 / 8,3 / 6,25 decisiones de token por segundo.
- Retardo de transcripción configurable entre 240 y 560 ms, ajustable como compromiso entre latencia y precisión.
- Transcripción de audio de longitud ilimitada durante operación 24/7 mediante caché KV deslizante, sin deriva acumulada.
- VAD semántico: distingue pausas de pensamiento, tartamudeo y final real de turno, con 8 clases y horizontes de 0,5 / 1,0 / 2,0 / 3,0 s.
- Bilingüe chino-inglés.
- Ejecución mediante código remoto embebido (`trust_remote_code=True`) con utilidades de resolución de token de idioma y tokens especiales de streaming.
- Integración con una compilación adaptada de vLLM para despliegue en producción.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio más allá del propio reconocimiento de habla.

## Casos de uso

- Subtitulado en directo: el modelo puede generar subtítulos incrementales sobre audio en flujo continuo con retardos de 240 a 560 ms, adecuado para retransmisiones o eventos en vivo donde se prioriza la inmediatez.
- Atención al cliente por voz: gestiona conversaciones de larga duración sin degradación gracias a la caché KV deslizante, y su VAD semántico permite distinguir pausas de duda de finales de turno reales, mejorando el manejo de interrupciones.
- Transcripción de reuniones prolongadas: la ausencia de deriva en operación 24/7 permite cubrir sesiones de horas sin reiniciar el proceso ni acumular errores de alineación.
- Dictado y toma de notas en tiempo real: el modo bilingüe zh/en encaja en entornos de trabajo mixtos donde se alternan ambos idiomas en una misma sesión.
- Asistentes de voz embebidos: los relojes de 120 y 160 ms reducen el coste de cómputo por segundo respecto al de 80 ms, lo que permite ajustar percepción y recursos según las limitaciones del dispositivo.
- Moderación y monitorización de audio: el VAD semántico con cuatro horizontes temporales puede alimentar sistemas de turn-taking en diálogo o de detección de actividad conversacional.
- Pipelines de transcripción por lotes simulados: la utilidad `simulated_streaming_greedy_decode_batch` permite procesar lotes de ondas con decodificación codiciosa manteniendo la semántica de streaming, útil para evaluar y reindexar archivos de audio.
- Integración en backends vLLM: dado que se ofrece una compilación vLLM adaptada, encaja en arquitecturas de servicio que ya usan vLLM para otros modelos, añadiendo ASR en flujo.

## Benchmarks y rendimiento

Resultados publicados en la model card con decodificación codiciosa, EOS suprimido, reloj de audio de 80 ms y `target_delay_ms = 480` (6 tokens de retardo). Las tasas de error están expresadas en porcentaje. Se indica que no se producen bucles de repetición ni pérdida de palabras finales.

| Conjunto de prueba | Metrica | Audio8 ASR Infinite | Voxtral-Mini-4B-Realtime-2602 | nemotron-3.5-asr-streaming-0.6b |
|---|---|---|---|---|
| aishell1/test | CER | 1,750 | 16,795 | 12,927 (a 560 ms) |
| aishell4/test | CER | 2,893 | 16,456 | 14,677 (a 560 ms) |
| librispeech test.clean | WER | 3,042 | 2,210 | 3,353 (a 560 ms) |
| librispeech test.other | WER | 6,808 | 5,552 | 7,140 (a 560 ms) |
| Promedio | | 3,623 | 10,253 (2 conjuntos) | 9,524 |

Puntos de operación optimizados post-entrenados:

| Reloj de audio | `frame_len` | `streaming_n_left_pad_tokens` | `target_delay_ms` seleccionables |
|---|---|---|---|
| 80 ms | 4 | 18 | 240 / 320 / 480 / 560 |
| 120 ms | 6 | 12 | 240 / 480 |
| 160 ms | 8 | 9 | 320 / 480 |

No se han publicado otros resultados de benchmarks (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible, algo esperable dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- Peso del checkpoint en bfloat16: 8,17 GB (`model.safetensors`) mas el fichero auxiliar `semantic_vad_heads.safetensors`; el repositorio completo ocupa 8,2 GB.
- VRAM estimada para inferencia en bfloat16: aproximadamente 10-12 GB contando pesos, activaciones y cache KV por lote; la cache deslizante mantiene esta cifra estable en ejecuciones largas. Esta estimación no figura en la informacion proporcionada y debe validarse en el entorno de despliegue.
- GPU profesionales recomendadas: A100, H100 o equivalentes con al menos 16-24 GB de VRAM para margen por lote.
- GPU de consumo: el checkpoint en bfloat16 deberia caber en tarjetas con 16 GB o mas, como RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB). No se documentan cuantizaciones oficiales (GGUF, AWQ o GPTQ), por lo que no se puede confirmar su funcionamiento en GPUs de menos de 16 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (uso documentado en la model card) y una compilacion adaptada de vLLM mencionada por el autor para operacion 24/7. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: el modelo decodifica 12,5 veces por segundo con reloj de 80 ms, 8,3 con 120 ms y 6,25 con 160 ms. El retardo de transcripcion objetivo se situa entre 240 y 560 ms. No se publican cifras de throughput en tokens por segundo ni de latencia extremo a extremo sobre hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Audio8 ASR Infinite | 4,09 B | ASR streaming nativo, reloj 80/120/160 ms, cache KV deslizante | zh, en | Apache 2.0 | CER 1,750 en aishell1; WER 3,042 en librispeech test.clean |
| Voxtral-Mini-4B-Realtime-2602 | aprox. 4 B (torre de audio Voxtral Realtime 4B) | ASR en tiempo real | no disponible | no disponible | WER 2,210 en librispeech test.clean; CER elevado en aishell1 (16,795) |
| nemotron-3.5-asr-streaming-0.6b | 0,6 B | ASR streaming | no disponible | no disponible | WER 3,353 en librispeech test.clean; CER 12,927 en aishell1 a 560 ms |

La comparativa se limita a los tres modelos que aparecen en la tabla de evaluacion de la model card. Audio8 ASR Infinite destaca en los conjuntos en chino (aishell1 y aishell4) con un CER muy inferior al de Voxtral y nemotron, mientras que Voxtral mantiene la mejor WER en ingles (librispeech test.clean y test.other). No se dispone de informacion de licencia ni de idiomas de los modelos comparados mas alla de lo indicado en la tabla de evaluacion.

## Limitaciones y advertencias

- Fase de preview: la model card indica que se trata de una "preview release" centrada en la base de transcripcion; la percepcion semantica en tiempo real esta en desarrollo.
- Solo se declaran dos idiomas, chino e ingles; no hay soporte documentado para castellano ni otras lenguas.
- Solo se publican puntos de operacion optimizados para las combinaciones de reloj de audio, `frame_len` y `streaming_n_left_pad_tokens` indicadas; otras combinaciones pueden degradar el rendimiento.
- No se documentan cuantizaciones oficiales ni pesos GGUF, lo que limita el despliegue en hardware con poca VRAM.
- Los resultados de evaluacion corresponden a un unico punto de operacion (reloj de 80 ms, `target_delay_ms = 480`) con decodificacion codiciosa y EOS suprimido; no se ofrecen datos para el resto de combinaciones.
- Posible riesgo de alucinacion o de errores en la transcripcion con audio ruidoso, acentos marcados o solapamiento de hablantes; no se aportan analisis de robustez ni de sesgo.
- Requiere ejecucion con `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio del modelo; conviene auditar ese codigo antes de usarlo en produccion.
- La model card usa el identificador de checkpoint `Edge0/Audio8-ASR-Infinite` mientras que el ID de Hugging Face indicado es `suryatmodulus/Audio8-ASR-Infinite`; conviene verificar cual es el repositorio canonico antes de desplegar.
- No se detallan los datos de entrenamiento (composicion, numero de tokens, filtrado) ni si se aplicaron tecnicas de alineacion, lo que dificulta evaluar sesgos y procedencia de los datos.
- Licencia Apache 2.0, que permite uso comercial, si bien se debe conservar el aviso de licencia y comprobar que los pesos heredados de Voxtral y Qwen2.5 cumplen con sus propias condiciones.

## Enlaces

- Hugging Face (ID indicado): https://huggingface.co/suryatmodulus/Audio8-ASR-Infinite
- Hugging Face (checkpoint referenciado en la model card): https://huggingface.co/Edge0/Audio8-ASR-Infinite
- GitHub del proyecto: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- Licencia en el repositorio GitHub: https://github.com/Edge0-AI/Audio8-ASR-Infinite/blob/main/LICENSE
- Paper (arXiv): anunciado como "coming soon", enlace provisional en https://github.com/Edge0-AI/Audio8-ASR-Infinite
