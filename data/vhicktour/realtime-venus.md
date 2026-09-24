# Vhicktour/Realtime-Venus

## Resumen

Realtime-Venus es un sistema multimodal orientado a interacción en tiempo real, publicado originalmente por el equipo inclusionAI y distribuido en este repositorio de HuggingFace por el usuario Vhicktour. El repositorio aloja dos checkpoints de 9B parámetros cada uno: Realtime-Venus-Omni, que procesa vídeo, audio y texto y genera texto y voz, y Realtime-Venus-Audio, centrado en audio y texto. Ambos comparten una arquitectura construida sobre MiniCPM-o 4.5 / Omni-Flow, con codificador visual SigLIP2, codificador de audio Whisper-Medium y backbone de lenguaje Qwen3-8B, con una longitud de contexto de 40.960 tokens.

El problema que aborda es el de los asistentes conversacionales de turno estricto: Realtime-Venus mantiene una conversación full-duplex, es decir, sigue percibiendo mientras habla, y distingue entre retroalimentación breve (backchannels), interrupciones, correcciones y redirecciones del usuario. Además incorpora interacción proactiva (inicia respuestas ante eventos sin esperar un prompt) y un mecanismo de delegación asíncrona mediante peticiones `<delegate>` emitidas en la misma línea temporal causal, de modo que las tareas externas no bloquean la conversación.

Es relevante ahora porque combina tres capacidades que habitualmente se resuelven con sistemas separados: comprensión audio-visual en streaming, generación nativa de voz y orquestación de agentes con herramientas externas. Incluye además memoria para vídeo largo sin entrenamiento adicional, que archiva momentos visualmente informativos y recupera evidencia relevante bajo demanda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer con backbone de lenguaje Qwen3-8B sobre MiniCPM-o 4.5 / Omni-Flow; codificador visual SigLIP2, codificador de audio Whisper-Medium y decodificador de voz flow-matching en streaming |
| Parametros totales | 9B (cada uno de los dos checkpoints: Omni y Audio) |
| Parametros activos | No aplica; no es un modelo MoE según la información disponible |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No disponible; los pesos se publican en BF16 y no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fragmentados por shards) con código custom de HuggingFace Transformers; el repositorio incluye también la etiqueta onnx |

## Arquitectura y entrenamiento

La arquitectura es un sistema omni-modal compuesto por módulos especializados sobre un backbone de lenguaje Qwen3-8B. La percepción visual recae en SigLIP2 (solo en el checkpoint Omni; en el checkpoint Audio no se usa en inferencia) y la percepción auditiva en Whisper-Medium. La generación de voz emplea tokens discretos S3 decodificados por un decodificador flow-matching en streaming, lo que permite emitir habla de forma incremental en lugar de esperar a completar la respuesta textual. Los dos checkpoints, Omni y Audio, comparten el mismo backbone de streaming.

En cuanto a entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Lo que sí se documenta son innovaciones de diseño: la línea temporal causal compartida para texto y habla, que habilita el full-duplex real; la delegación asíncrona mediante peticiones `<delegate>` emitidas y consumidas en esa misma línea temporal; y la memoria para vídeo largo sin entrenamiento, que archiva momentos visualmente informativos, recupera evidencia relevante y no redundante para una consulta y reensambla el contexto audio-visual correspondiente. La ejecución de las delegaciones requiere el runtime Realtime-Venus-Harness, distribuido en el repositorio de GitHub del proyecto y no incluido en el repositorio de pesos.

## Capacidades

- Comprensión conjunta de vídeo, imágenes, audio y texto en el checkpoint Omni; audio y texto en el checkpoint Audio.
- Conversación full-duplex nativa: mantiene la percepción activa mientras genera una respuesta y discrimina backchannels, interrupciones, correcciones y redirecciones.
- Interacción proactiva: procesa vídeo y audio alineados temporalmente y decide si y cuándo responder sin esperar un prompt del usuario.
- Delegación asíncrona: emite peticiones `<delegate>` en la línea temporal compartida y consume resultados de backends externos sin bloquear el diálogo (requiere Realtime-Venus-Harness).
- Memoria para vídeo largo sin entrenamiento adicional, con archivo de momentos informativos y recuperación de evidencia relevante.
- Salida de texto y de voz nativa mediante los recursos Token2wav incluidos y una voz de referencia.
- Manejo de interrupciones semánticas en diálogo solapado.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documenta en la información disponible soporte explícito de tool calling genérico, modo de razonamiento extendido, visión de documentos o audio de entrada distinto del soportado por Whisper-Medium.

## Casos de uso

- Asistente en videollamadas y reuniones: el modelo puede escuchar y ver la reunión, generar actas o resúmenes y responder a preguntas durante la sesión sin cortar el flujo, gracias a la percepción continua y a la ventana de 40.960 tokens.
- Teleasistencia y accesibilidad: conversación por voz full-duplex con generación de habla nativa, útil para usuarios que necesitan interrumpir o corregir al sistema sin esperar a que termine de hablar.
- Atención telefónica automatizada (IVR): la distinción entre backchannels e interrupciones reales permite gestionar llamadas con solapamiento de voz, un escenario donde los asistentes de turno estricto fallan con frecuencia.
- Monitorización de streams en directo: la faceta proactiva permite disparar respuestas o alertas cuando ocurre un evento en el vídeo, sin que un operador formule una consulta.
- Análisis de vídeo largo (formación corporativa, retransmisiones deportivas, vigilancia): la memoria sin entrenamiento archiva momentos relevantes y recupera evidencia para responder preguntas sobre material de larga duración.
- Agentes con herramientas externas: mediante la delegación asíncrona, el modelo puede lanzar tareas a backends (búsqueda, cálculo, APIs) y seguir conversando mientras se resuelven, integrándose en pipelines de agentes multi-paso.
- Tutor de idiomas conversacional: práctica de inglés o chino con entrada y salida de voz y corrección en tiempo real.
- Soporte remoto asistido por cámara: el checkpoint Omni puede observar lo que muestra un usuario a través de una cámara y guiarle verbalmente paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card remite a dos figuras del informe técnico (comprensión de vídeo y audio, e interacción full-duplex con manejo de interrupciones y continuación bajo habla solapada), pero no incluye las cifras asociadas. No se dispone de valores de MMLU, HumanEval, GSM8K ni de métricas específicas de audio o vídeo para reproducir en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 18 GB solo para los pesos de 9B, más el codificador visual SigLIP2, el codificador de audio Whisper-Medium y el decodificador de voz flow-matching. En la práctica, un presupuesto de 22-26 GB es realista para el checkpoint Omni en BF16 con contexto moderado; el checkpoint Audio reduce el consumo al no usar el codificador visual en inferencia.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para despliegue concurrente, streaming prolongado y lotes grandes; L40S o A6000 (48 GB) como alternativas de inferencia.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo en BF16 de forma ajustada, especialmente el checkpoint Audio; tarjetas de 16 GB requerirían cuantización a 8 bits o inferior, cuya disponibilidad oficial no está documentada.
- Opciones de despliegue: HuggingFace Transformers con `trust_remote_code` (el repositorio incluye código custom y scripts como `realtime_venus_omni_memory.py`); el runtime de delegación Realtime-Venus-Harness se distribuye por separado en GitHub. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF dificulta el despliegue en CPU.
- Almacenamiento: el repositorio completo ocupa 38,8 GB, ya que contiene los dos checkpoints.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño streaming y full-duplex implica que las métricas relevantes son latencia de primer token y latencia de primer fragmento de audio, pero no se publican valores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Realtime-Venus-Omni | 9B | 40.960 tokens | Vídeo, audio y texto; full-duplex; voz nativa; delegación | Apache 2.0 | HuggingFace y ModelScope |
| Realtime-Venus-Audio | 9B | 40.960 tokens | Audio y texto; full-duplex; voz nativa | Apache 2.0 | HuggingFace y ModelScope |
| MiniCPM-o 4.5 (arquitectura base declarada) | No disponible en la información proporcionada | No disponible | Omni-modal | No disponible | No disponible |
| Alternativas omni-modales de la misma categoría (por ejemplo Qwen-Omni, MiniCPM-o) | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye especificaciones ni resultados de modelos alternativos que permitan una comparación cuantitativa fiable. La comparación más sólida que puede hacerse con los datos disponibles es interna, entre los dos checkpoints del propio sistema.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano no está documentado y no puede asumirse.
- Benchmarks: no hay cifras verificables en la información disponible, por lo que cualquier comparación de rendimiento con otros modelos queda sin respaldo.
- Riesgo de alucinación: no se documentan tasas de error ni mecanismos de mitigación específicos, un riesgo relevante en tareas de resumen de reuniones o análisis de vídeo donde el modelo puede inventar detalles.
- Delegación condicionada al runtime: las capacidades de agente y tool calling dependen del Realtime-Venus-Harness del repositorio de GitHub; sin ese componente, las peticiones `<delegate>` no se ejecutan.
- Requisitos de hardware elevados para el escenario de uso: el full-duplex y el streaming continuo exigen GPU con memoria suficiente y baja latencia; el despliegue en CPU no está documentado.
- Ausencia de formatos cuantizados: no se publican pesos GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware de consumo y en entornos sin GPU.
- Procedencia del repositorio: esta ficha describe el repositorio `Vhicktour/Realtime-Venus`, cuya model card referencia el repositorio y el proyecto del equipo inclusionAI. Se trata, por tanto, de una copia redistribuida por un tercero; conviene verificar la integridad de los pesos y consultar la fuente original para actualizaciones, incidencias o soporte.
- Fechas e identificadores: el repositorio figura como creado el 24 de septiembre de 2026 y referencia el identificador arXiv 2609.13814, que no se ha podido verificar en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un modelo multimodal con pesos derivados de otros componentes (Qwen3-8B, Whisper-Medium, SigLIP2, Token2wav), conviene revisar las licencias de esos componentes antes de un despliegue en producción.
- Memoria de vídeo largo: el mecanismo es sin entrenamiento y se apoya en recuperación de evidencia; no se documentan métricas de precisión ni límites de duración de vídeo soportados.
- Sin métricas de sesgo ni de seguridad publicadas en la información disponible.

## Enlaces

- Repositorio en HuggingFace (copia redistribuida): https://huggingface.co/Vhicktour/Realtime-Venus
- Repositorio original en HuggingFace: https://huggingface.co/inclusionAI/Realtime-Venus
- Model card en chino: https://huggingface.co/inclusionAI/Realtime-Venus/blob/main/README_zh.md
- Licencia: https://huggingface.co/inclusionAI/Realtime-Venus/blob/main/LICENSE
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Realtime-Venus
- Informe técnico (arXiv 2609.13814): https://arxiv.org/pdf/2609.13814
- Versión HTML del informe: https://arxiv.org/html/2609.13814v1
- Repositorio GitHub (incluye Realtime-Venus-Harness): https://github.com/inclusionAI/Realtime-Venus
- Página del proyecto: https://realtime-venus.github.io/
