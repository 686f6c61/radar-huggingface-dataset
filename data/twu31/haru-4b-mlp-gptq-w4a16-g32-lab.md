# Twu31/Haru-4B-MLP-GPTQ-W4A16-G32-Lab

## Resumen

Haru-4B MLP GPTQ W4A16 (G32) es una cuantización de precisión reducida del modelo Haru-4B de higurashi-ai, publicada por el usuario Twu31. Haru-4B es un modelo de audio a audio full-duplex orientado a conversación de voz en tiempo real: mantiene la escucha activa mientras genera su propia respuesta hablada. Esta variante cuantiza únicamente las 96 proyecciones MLP del backbone con GPTQ simétrico W4A16 (grupo de 32) y exporta los pesos INT4 empaquetados en formato `compressed-tensors`, dejando intactos los 926 tensores restantes (proyecciones de audio, cabeza MeanFlow, códec VibeVoice, atención, Gated DeltaNet y embedding de texto atado).

El objetivo es liberar VRAM en el mismo dispositivo: según el autor, el payload de pesos baja de 10,54 GB en BF16 a 7,28 GB, y el pico de memoria de dispositivo medido en una RTX 6000 Ada con una sesión activa en vLLM-Omni pasa de 12,57 GiB a 9,56 GiB (3,02 GiB menos). Está pensado para agentes de voz y robots que necesitan margen de GPU para otros modelos.

La relevancia es doble: por un lado, demuestra que es posible cuantizar un modelo full-duplex multimodal sin tocar el códec ni las cabezas de audio; por otro, documenta con detalle el coste en latencia (el tiempo desde el fin del habla del usuario hasta el audio del modelo sube de 533 ms a 933 ms en su piloto). El checkpoint es un experimento de laboratorio con 0 descargas y 0 likes en el momento de la consulta, y solo declara soporte de chino mandarín.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención, Gated DeltaNet, proyecciones de audio, cabeza MeanFlow y códec VibeVoice (full-duplex speech-to-speech) |
| Parametros totales | 5.270.000.897 (según safetensors) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 simétrico, group size 32, INT4 empaquetado en `compressed-tensors`; pesos MLP en INT4, resto en BF16 |
| Idiomas soportados | chino (zh); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (INT4 empaquetado, `compressed-tensors`), 7,3 GB de repo |

## Arquitectura y entrenamiento

El modelo base Haru-4B es un sistema de audio a audio full-duplex: recibe PCM de 24 kHz mono y devuelve PCM16 junto con deltas de transcripción, con una tasa de audio duplex de 7,5 Hz. La arquitectura combina atención con capas Gated DeltaNet, proyecciones específicas de audio, una cabeza MeanFlow y el códec VibeVoice. Esta variante solo modifica las 96 proyecciones MLP del backbone: se cuantizaron con GPTQ simétrico W4A16 de grupo 32 y se exportaron como INT4 empaquetado. El autor verificó byte a byte los otros 926 tensores contra el checkpoint BF16 de la revisión `8d6e83bcd3701a76fc27a764965665da1df7da78`.

La calibración se hizo con ocho sesiones duplex reales: el Haru BF16 escuchaba habla de reuniones en mandarín y generaba su propio audio durante la reproducción, recogiendo 3.474 posiciones vivas de entrada a las MLP tras el prefill de prompt y referencia de voz (unos 7,1 minutos de entrada con pausas). Se usó un amortiguamiento (damping) del 5 % en GPTQ y datos de AISHELL-4 (CC BY-SA 4.0). En una auditoría con 64 posiciones de activación de una llamada en mandarín no vista, el error L2 relativo agrupado fue del 5,11 % para GPTQ frente al 13,99 % de round-to-nearest con el mismo grupo y escalas, muestreando los 128 canales de salida centrales de cada una de las 96 proyecciones MLP.

## Capacidades

- Conversación de voz full-duplex: escucha y habla de forma concurrente, con audio duplex a 7,5 Hz.
- Speech-to-speech en chino mandarín: entrada PCM float32 LE de 24 kHz y salida PCM16 con transcripción incremental.
- Gestión de interrupciones: en el piloto del autor, 3 de 3 ensayos con disparo de habla válido en la variante GPTQ (frente a 2 de 3 en BF16).
- Integración con vLLM-Omni mediante el endpoint `/v1/realtime?duplex=1` y el protocolo de frames de 3.200 muestras.
- Capacidades de texto, razonamiento, código o tool calling: no documentadas en la información disponible.
- Capacidades multimodales distintas del audio (visión, vídeo): no disponibles.

## Casos de uso

- Agentes de voz en tiempo real: el modelo mantiene el canal de escucha activo mientras responde, lo que permite conversaciones con solapamiento natural; el endpoint `/v1/realtime` de vLLM-Omni facilita la integración con clientes websocket.
- Atención al cliente telefónica en mandarín: la naturaleza full-duplex y la transcripción incremental permiten gestionar turnos con interrupciones del usuario, aunque el incremento de latencia de 533 a 933 ms en GPTQ debe validarse en producción.
- Robots conversacionales con presupuesto de VRAM ajustado: el ahorro de 3,02 GiB de pico frente a BF16 deja margen para un segundo modelo (por ejemplo, un detector de intención o un TTS auxiliar) en la misma GPU.
- Despliegue en GPUs de 12 GB: el autor indica que las pruebas físicas en GPU de 12 GB están pendientes, pero el payload de 7,28 GB y el pico de 9,56 GiB medido en Ada sugieren que es el objetivo de diseño; conviene validarlo antes de comprometerlo.
- Prototipado de interfaces de voz en navegador: la demo ZeroGPU usa la sesión duplex de PyTorch y un kernel Triton que lee las mismas proyecciones INT4, útil para pruebas de concepto sin infraestructura propia.
- Investigación sobre cuantización de modelos multimodales: el checkpoint documenta metodología de calibración, auditoría tensor a tensor y métricas de error de activación, lo que lo convierte en una referencia reproducible para estudiar el impacto de W4A16 en sistemas full-duplex.
- Evaluación de latencia y turn-taking: los escenarios de interrupción con y sin habla permiten medir el comportamiento de cesión de turno en condiciones controladas.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Sí ofrece métricas de su piloto nativo en vLLM-Omni sobre una RTX 6000 Ada, una sesión y 512 MiB de caché KV, con dos escenarios de mandarín grabados y tres semillas cada uno:

| Metrica | BF16 | GPTQ W4A16 |
|---|---:|---:|
| Payload de pesos | 10,54 GB | 7,28 GB |
| Pico de memoria de dispositivo (incremento muestreado) | 12,57 GiB | 9,56 GiB |
| p95 mediano por llamada (intercambio de frames en loopback) | 20,11 ms | 16,76 ms |
| Tiempo mediano desde fin del habla del usuario hasta audio del modelo | 533 ms | 933 ms |
| Ensayos de interrupción con disparo de habla válido | 2/3 | 3/3 |
| Tiempo mediano hasta pausa acústica (ensayos válidos) | 267 ms | 267 ms |

En la demo ZeroGPU (partición Blackwell), el p95 por llamada fue de 73-74 ms para cómputo del modelo y de 400-453 ms para el round-trip de frames de audio del cliente. En dos pruebas de interrupción en mandarín, la primera pausa llegó a 933 y 667 ms con entrada de habla y a 800 y 667 ms con silencio.

## Requisitos de hardware

- VRAM estimada: payload de pesos de 7,28 GB; pico de dispositivo medido de 9,56 GiB con una sesión y 512 MiB de caché KV en RTX 6000 Ada.
- GPU validadas: RTX 6000 Ada (piloto nativo con vLLM-Omni). El autor menciona que las pruebas en GPU físicas de 12 GB están pendientes.
- GPU consumer: no confirmado. Por tamaño de pesos cabría en tarjetas de 12 GB o más, pero no hay validación publicada en RTX 4090, 4080 o similares.
- Despliegue: vLLM 0.33.0 con la integración nativa de vLLM-Omni (commit `8f6c00733081d9bbfb50810621de048da3fc540d`), aplicando el parche `haru-ada.patch` y el perfil `haru.yaml` incluidos en el repo. Requiere `VLLM_OMNI_TARGET_DEVICE=cuda` y `websockets>=14`.
- Latencia y throughput: p95 de 16,76 ms por llamada en loopback; 933 ms de extremo a extremo desde fin del habla hasta audio del modelo en GPTQ. No se publica throughput agregado ni número de sesiones concurrentes soportadas.
- Nota: el autor reporta que una prueba local en BF16 con vLLM 0.34 y Model Runner V2 falló durante el warm-up duplex.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haru-4B MLP GPTQ W4A16 G32 (este) | 5,27 B | no disponible | Sí | Apache 2.0 | Hugging Face, 0 descargas |
| higurashi-ai/Haru-4B (BF16) | 5,27 B | no disponible | Sí | Apache 2.0 | Hugging Face (modelo base) |
| Otros modelos speech-to-speech full-duplex | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores de la misma categoría (por ejemplo, sistemas speech-to-speech full-duplex de otros autores), por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Solo se declara soporte de chino mandarín; no hay evidencia de calidad en otros idiomas.
- El propio autor califica el checkpoint como experimento de laboratorio: 0 descargas, 0 likes y sin evaluación amplia de turn-taking en mandarín.
- El coste en latencia es significativo: +400 ms en la mediana desde el fin del habla del usuario hasta el audio del modelo (533 ms a 933 ms) en el piloto.
- La cesión ante interrupciones rápidas no está verificada; los resultados de pausa acústica son preliminares y con pocos ensayos.
- Las pruebas en GPU físicas de 12 GB están pendientes; el despliegue en consumer GPU no está validado.
- La integración depende de una versión concreta de vLLM (0.33.0), un commit específico de vLLM-Omni y un parche propio; la reproducibilidad fuera de ese entorno no está garantizada.
- Una prueba con vLLM 0.34 y Model Runner V2 falló en el warm-up duplex según el autor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de voz, los errores se manifiestan también como audio generado incorrecto, no solo como texto.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de calibración AISHELL-4 es CC BY-SA 4.0; conviene revisar obligaciones de atribución si se redistribuye el modelo.
- No hay información sobre tool calling, agentes multi-paso ni capacidades de texto más allá de la transcripción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Twu31/Haru-4B-MLP-GPTQ-W4A16-G32-Lab
- Modelo base Haru-4B: https://huggingface.co/higurashi-ai/Haru-4B
- Revisión del checkpoint base: https://huggingface.co/higurashi-ai/Haru-4B/tree/8d6e83bcd3701a76fc27a764965665da1df7da78
- Demo ZeroGPU: https://huggingface.co/spaces/Twu31/haru-gptq-zerogpu-lab
- Integración nativa en vLLM-Omni (PR): https://github.com/vllm-project/vllm-omni/pull/10301
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Protocolo de cliente duplex Haru: https://github.com/vllm-project/vllm-omni/blob/8f6c00733081d9bbfb50810621de048da3fc540d/recipes/higurashi-ai/Haru-4B-H200.md#supported-model-contract
- Dataset AISHELL-4: https://www.openslr.org/111/
- Parche Ada y perfil de despliegue: incluidos en el repositorio del modelo (`haru-ada.patch`, `haru.yaml`)
