# webbrain-one/lfm3-vld-2b-multipass

## Resumen

LFM3-VL-2B-VLD Multipass es una adaptación de `LiquidAI/LFM3-VL-2B`, un modelo visión-lenguaje de 1.918.181.888 parámetros (≈1,92 B) desarrollado por Liquid AI, publicada por el usuario comunitario `webbrain-one` como pieza central de su agente de navegador open source WebBrain. El modelo no es un chat multimodal general, sino un **modelo de decisión**: recibe una captura de pantalla de un flujo de trabajo web y un conjunto de opciones candidatas (botones, enlaces, campos) y devuelve qué opción satisface el objetivo, o si ninguna lo hace.

La adaptación implementa el protocolo **VL-D multipass**, que combina un paso `verify` (respuesta Sí/No por cada opción) con un paso `readout` (código de la opción elegida), y se distribuye junto con sondas lineales de decisión entrenadas (`probe` / `probe-cs`) que explotan un estado oculto expuesto (`decision_hidden`). El entrenamiento se hizo por destilación desde `LiquidAI/d1-2B` sobre capturas de flujos de navegador multimodales de WebBrain, **sin fine-tuning completo del modelo visión-lenguaje**: el torreón visual permanece congelado y el backbone de lenguaje se adaptó con LoRA (r=32, alpha=64), fusionada después a BF16.

Su relevancia práctica es doble: por un lado, ofrece pesos ligeros (repo de 3,9 GB) desplegables en local mediante GGUF/llama.cpp o en el propio navegador mediante ONNX Runtime WebGPU; por otro, publica una comparativa contra el modelo base en un benchmark propio de 126 preguntas de decisión, donde pasa de 106/126 (84,1 %) a 126/126 (100 %) en la variante `verify` zero-shot. Es, por tanto, un ejemplo de especialización estrecha de un VLM pequeño para una tarea de agente, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3-VL (`lfm3_vl` en transformers): torreón visual + backbone de lenguaje; adaptación por LoRA fusionada a BF16 |
| Parámetros totales | 1.918.181.888 (≈1,92 B) |
| Parámetros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (GGUF); q8f16 y q4f16 (ONNX); LoRA r=32/alpha=64 como adaptador separado |
| Idiomas soportados | no disponible |
| Licencia | `lfm1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (transformers), GGUF (incluye `mmproj-F16`), ONNX (`decoder_*`, `vision_encoder_fp16`) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM3-VL-2B`, un VLM de 1,92 B parámetros con pipeline `image-text-to-text`. La adaptación de WebBrain congela el codificador visual y aplica LoRA (r=32, alpha=64) sobre el backbone de lenguaje, que después se fusiona a BF16 para producir pesos densos convencionales; el adaptador y los pesos del proyector se publican por separado en el repositorio `-lora`. Sobre esa base se destila el comportamiento de `LiquidAI/d1-2B` usando capturas de pantalla de flujos de trabajo de navegador multimodales como dominio de entrenamiento.

La innovación técnica no está en la arquitectura del transformer, sino en el **protocolo de decisión VL-D multipass**: en lugar de generar texto libre, el modelo se evalúa en dos pasadas, una de verificación booleana por opción y otra de lectura del código de opción, y se complementa con sondas lineales entrenadas que leen el estado `decision_hidden` expuesto en los exports ONNX y GGUF. El número de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF/DPO no se detallan en la información disponible. El autor indica explícitamente que **no** hubo fine-tuning completo de VL/Compass.

## Capacidades

- Comprensión de imagen y texto (`image-text-to-text`): interpreta capturas de pantalla de interfaces web junto con una instrucción en lenguaje natural.
- Decisión sobre opciones discretas: selecciona el código de la opción correcta entre un conjunto de candidatas presentes en la captura.
- Protocolo `verify`: emite Sí/No por cada opción, útil como verificación previa a la ejecución de una acción.
- Protocolo `readout`: devuelve directamente el código de la opción elegida, con menor coste de decodificación que la verificación exhaustiva.
- Reconocimiento explícito de "desconocido": detecta cuándo la opción buscada no existe en la pantalla (24/24 en el benchmark del autor, frente a 4/24 del modelo base).
- Sondas de decisión: los exports ONNX exponen `decision_hidden`, lo que permite usar clasificadores lineales entrenados (`probe`, `probe-cs`) además del texto generado.
- Despliegue en navegador: variantes ONNX q8f16/q4f16 compatibles con WebGPU, pensadas para ejecución local.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se documentan idiomas soportados.
- Modo "thinking" u otras capacidades especiales: no disponible para esta adaptación.

## Casos de uso

- **Selección de elementos en un agente de navegador**: dada una captura de la página y la lista de elementos interactivos detectados, el modelo devuelve el código del elemento que cumple el objetivo del usuario; es el caso para el que fue entrenado y en el que obtiene 126/126 en el benchmark del autor.
- **Guardrail antes de ejecutar acciones destructivas**: usar la pasada `verify` para confirmar que el botón a pulsar corresponde realmente a la acción prevista (por ejemplo, "enviar" frente a "guardar borrador") antes de que el orquestador haga clic.
- **Detección de elementos inexistentes o páginas cambiadas**: el reconocimiento de "desconocido" (24/24) permite abortar un flujo cuando el elemento esperado no está en pantalla, en lugar de alucinar una opción y ejecutar una acción errónea.
- **Automatización de flujos multi-paso**: combinando `readout` y `verify` en varias pasadas, el agente puede encadenar formularios, paginación y menús sin un LLM grande en el bucle de decisión.
- **Asistente de navegación con privacidad local**: la variante ONNX q4f16 con WebGPU permite ejecutar el modelo dentro del navegador o en el equipo del usuario, de modo que las capturas de las páginas no se envían a ningún servidor.
- **Servicio de decisión en servidor**: los GGUF `Q8_0` y `Q4_K_M` se sirven con llama.cpp en `/v1/chat/completions` y `/v1/systemone`, lo que permite integrar el modelo como endpoint interno para un ejército de agentes.
- **Evaluación y anotación de trayectorias de agente**: las sondas lineales y el error absoluto de score permiten puntuar automáticamente decisiones registradas en logs de producción y detectar desviaciones del comportamiento esperado.
- **Prototipado rápido de políticas de clic**: al ser un modelo de 1,92 B con cuantizaciones de ~1,2 GB en Q4, sirve para iterar sobre políticas de decisión en portátiles antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en el *d1 Balanced Browser Decision Benchmark* (`final_test`, 126 preguntas categóricas):

| Modelo / protocolo | Correctas | Completions encontradas | Falsos completions | Desconocido reconocido | MAE del score |
|---|---:|---:|---:|---:|---:|
| LFM3-VLD-2B (`probe` / `probe-cs`) | 126/126 (100,0 %) | 24/24 | 0/48 | 24/24 | 9,56e-8 |
| LFM3-VLD-2B (`verify`, zero-shot) | 126/126 (100,0 %) | 24/24 | 0/48 | 24/24 | 4,11e-5 |
| LFM3-VLD-2B (`readout`) | 125/126 (99,2 %) | 24/24 | 0/48 | 24/24 | 0,0189 |
| Base `LiquidAI/LFM3-VL-2B` (`verify`, zero-shot) | 106/126 (84,1 %) | 24/24 | 0/48 | 4/24 | 0,0004 |
| Base `LiquidAI/LFM3-VL-2B` (`readout`) | 102/126 (81,0 %) | 24/24 | 1/48 | 0/24 | 0,1106 |

Como referencia externa del modelo base (no de esta adaptación), un análisis de terceros (OrcaRouter) cita una puntuación agregada de 71,4 en 62 benchmarks de visión para LFM3-VL-2B, que baja a 62,1 con el modo "thinking" desactivado. No se han publicado resultados independientes del modelo adaptado ni mediciones de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 1,918 B parámetros, sin contar el codificador visual): ≈3,8 GB en BF16, ≈2,0 GB en Q8_0, ≈1,2-1,3 GB en Q4_K_M; añadir el `mmproj-F16` del codificador visual, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: cualquier GPU con ≥6 GB de VRAM para BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100/H100); basta una GPU integrada o una RTX 3050 8 GB para Q4.
- Cabe en GPU de consumo: sí, en toda la gama RTX 30/40 con 8 GB o más, y en formato Q4 incluso en equipos con 4-6 GB compartidos.
- Opciones de despliegue: `transformers` (pesos safetensors con `custom_code`, requiere `trust_remote_code`), `llama.cpp` con los GGUF (`/v1/chat/completions` y `/v1/systemone`), y ONNX Runtime con WebGPU para las variantes q8f16/q4f16. Soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible. El protocolo `verify` escala linealmente con el número de opciones (una pasada por opción), mientras que `readout` requiere una sola generación; el autor reporta mejor precisión en `verify` (100 %) que en `readout` (99,2 %), lo que supone un compromiso explícito entre coste y exactitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark de decisión (d1) | Licencia | Formatos |
|---|---:|---|---|---|---|
| `webbrain-one/lfm3-vld-2b-multipass` | 1,92 B | no disponible | 126/126 (`verify` y `probe`) | lfm1.0 | safetensors, GGUF, ONNX |
| `LiquidAI/LFM3-VL-2B` (base) | 1,92 B | no disponible | 106/126 (`verify`), 102/126 (`readout`) | lfm1.0 | safetensors |
| `webbrain-one/lfm3-vld-2b` (variante con cabeza de lenguaje restaurada) | no disponible | no disponible | no disponible | lfm1.0 | no disponible |
| `LiquidAI/d1-2B` (modelo docente de la destilación) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: misma arquitectura, mismo tamaño y misma licencia, con una mejora de 20 puntos porcentuales en accuracy de decisión y de 20/24 a 24/24 en reconocimiento de opciones inexistentes. El coste es la especialización: el modelo adaptado pierde presumiblemente generalidad conversacional, extremo que el autor no evalúa.

## Limitaciones y advertencias

- Modelo especializado, no conversacional: el entrenamiento se limita a capturas de flujos de navegador y al protocolo VL-D; su comportamiento fuera de ese dominio no está documentado.
- Benchmark propio y no independiente: las 126 preguntas de `final_test` proceden del autor, sin validación externa; existe riesgo de sobreajuste al formato exacto de opciones y a la distribución de capturas de WebBrain.
- Adopción prácticamente nula: 0 descargas y 13 likes en el momento de la ficha, publicada el 2026-10-28; no hay evidencia de uso en producción por terceros.
- Licencia `lfm1.0` (etiquetada como `other`): es necesario revisar los términos de Liquid AI antes de cualquier uso comercial; la licencia GPL-3.0-or-later del repositorio WebBrain aplica al agente, no a los pesos del modelo.
- Idiomas y longitud de contexto no documentados: no se puede asumir un rendimiento multilingüe ni un contexto largo para páginas con muchas opciones o capturas de alta resolución.
- Alucinación mitigada pero no eliminada: en la variante `readout` queda 1/126 de error y un MAE de 0,0189, muy superior al de las sondas lineales (9,56e-8); los flujos críticos deberían usar `verify` o las sondas.
- Dependencia del `decision_hidden`: las sondas `probe` solo funcionan con los exports que exponen ese estado (ONNX y GGUF publicados por el autor); no están disponibles en los pesos safetensors genéricos.
- Torreón visual congelado: la adaptación no modifica el codificador de imagen, por lo que dominios visuales alejados del entrenamiento (temas oscuros extremos, canvas, PDFs renderizados, zoom alto) pueden degradar la precisión.
- Requiere `trust_remote_code` por el uso de `custom_code` y de la arquitectura `lfm3_vl`, lo que implica ejecutar código del repositorio.
- No se documentan sesgos demográficos, culturales o lingüísticos del modelo ni del dataset de capturas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/lfm3-vld-2b-multipass
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo docente de la destilación: https://huggingface.co/LiquidAI/d1-2B
- Variante con cabeza de lenguaje restaurada: https://huggingface.co/webbrain-one/lfm3-vld-2b
- Bundle ONNX para WebGPU: https://huggingface.co/webbrain-one/lfm3-vld-2b-onnx
- Exports GGUF para llama.cpp: https://huggingface.co/webbrain-one/lfm3-vl-2b-vld-gguf
- Adaptador LoRA y proyector: https://huggingface.co/webbrain-one/lfm3-vl-2b-vld-lora
- Sitio del proyecto WebBrain: https://www.webbrain.one/
- Repositorio del agente de navegador: https://github.com/webbrain-one/webbrain
- Análisis externo del modelo base (OrcaRouter): https://www.orcarouter.ai/blog/lfm3-vl-2b-release
