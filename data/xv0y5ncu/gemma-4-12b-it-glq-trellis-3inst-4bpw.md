# xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw

## Resumen

GLQ 4bpw es una cuantización de `google/gemma-4-12B-it`, un modelo multimodal "any-to-any" de Google (texto, imagen y audio) publicado bajo licencia Apache 2.0. La cuantización la firma el usuario `xv0y5ncu` y aplica un esquema de quantización con codebook trellis-coded (QTIP TCQ, variante `3inst`) combinado con transformada de Hadamard aleatorizada (RHT) y LDLQ, a una tasa uniforme de 4.0 bits por peso. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo mediante un kernel CUDA fusionado.

El interés de esta ficha es doble: por un lado documenta el modelo base Gemma 4 12B instruct, y por otro el método de cuantización GLQ, que según el autor brilla especialmente en el rango de 2 a 4 bits por peso. El checkpoint reporta 3.788.867.632 parámetros en safetensors (el repositorio ocupa 7,6 GB) y un peso cargado en vLLM de 7,73 GiB frente a los aproximadamente 23,9 GB del modelo en bf16.

La relevancia actual está en que permite servir un modelo multimodal de 12B en GPUs de consumo (24-32 GB) con una ventana de contexto razonable, y combinarlo con una caché KV cuantizada E8 que reduce aproximadamente 4× el espacio de la caché KV, habilitando contextos más largos en la misma VRAM. El autor advierte que las cifras de rendimiento publicadas son específicas de una RTX PRO 6000 Blackwell y no deben extrapolarse sin citar la GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (decoder de texto + torres de visión y audio), familia `gemma4_unified` |
| Parametros totales | 3.788.867.632 (según safetensors); el nombre del modelo indica 12B |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `max_model_len=4096` |
| Tipos de cuantizacion | GLQ 4.0 bpw (trellis-coded QTIP TCQ variante `3inst` + RHT + LDLQ); caché KV opcional E8 (`e8_relaxed:2`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (trellis en layout MMA-fragment para los kernels 3INST) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B instruct, un transformer multimodal con pipeline `any-to-any` que acepta entradas de texto, imagen y audio. La cuantización GLQ actúa únicamente sobre el decoder de texto; las torres de visión y audio se conservan en su formato nativo. El esquema combina tres piezas: un codebook trellis-coded basado en QTIP TCQ (variante `3inst`, con kernels CUDA "lookup-free"), una transformada de Hadamard aleatorizada (RHT) para rotar los pesos antes de cuantizar, y LDLQ para la asignación de errores. La tasa es uniforme a 4.0 bpw en una sola pasada de decodificación, sin apilado de residuos.

La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2, y el checkpoint reporta un SQNR medio de pesos de 22.34 dB sobre 328 capas cuantizadas. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. El checkpoint requiere `glq >= 0.8.0` y `transformers >= 5.13.1, < 5.15`, porque la versión 5.15.0 movió gemma-4 a una configuración por capa y rompe `config.head_dim` en vLLM.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (modelo instruct).
- Procesamiento de imagen y audio: el pipeline es `any-to-any` y el modelo base acepta entradas multimodales; la cuantización GLQ solo afecta al decoder de texto.
- Modo "thinking" mencionado en la model card (la evaluación AIME-2026 se hace con `thinking`).
- Servido como endpoint compatible con OpenAI a través de vLLM, lo que habilita su uso en agentes de código como pi-code y opencode.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el uso documentado con agentes de código sugiere compatibilidad con el protocolo OpenAI de completions.
- Capacidades multilingües: no disponible.
- Caché KV cuantizada E8 opcional (~4× más pequeña que fp16, casi idéntica a 4 bits), que permite contextos más largos en la misma VRAM.

## Casos de uso

- Servicio local de un modelo multimodal en GPU de consumo: con 7,73 GiB de pesos cargados, el checkpoint cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) dejando margen para caché KV y activaciones, algo inviable con el modelo en bf16 (~23,9 GB solo de pesos).
- Asistente de código en local para agentes tipo pi-code u opencode: se sirve con `vllm serve` en el puerto 8000 y se apunta el agente al endpoint compatible con OpenAI, sin depender de APIs externas.
- Procesamiento de documentos con imagen y texto: al conservar las torres de visión en formato nativo, el modelo puede responder preguntas sobre capturas, diagramas o páginas escaneadas junto a instrucciones textuales.
- Transcripción y análisis de audio combinado con texto: la torre de audio permanece sin cuantizar, por lo que se puede usar para resumir reuniones o extraer acciones a partir de grabaciones y notas.
- Despliegue en entornos con VRAM limitada y contexto largo: activando la caché KV E8 (`GLQ_KV_QUANT=e8_relaxed:2` y las variables `GLQ_KV_E8_*`), la caché se reduce ~4× y permite ventanas de contexto mayores en la misma GPU.
- Prototipado e investigación sobre cuantización: el checkpoint es un caso de estudio reproducible del método GLQ (TCQ + RHT + LDLQ) con métricas de SQNR y throughput declaradas, útil para comparar esquemas de cuantización post-entrenamiento.
- Inferencia por lotes en una sola GPU Blackwell: el autor mide 83,4 tok/s en decodificación con batch 1 en una RTX PRO 6000, adecuado para tareas interactivas de un solo usuario o pequeños equipos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Pesos cargados (vLLM) | 7,73 GiB | bf16 de referencia ≈ 23,9 GB |
| Decodificación, batch 1 | 83,4 tok/s | RTX PRO 6000 Blackwell (sm_120), vLLM 0.25.1 |
| SQNR medio de pesos | 22,34 dB | sobre 328 capas cuantizadas |
| AIME-2026 (avg@8, thinking) | no medido | pendiente según el autor |
| WikiText-2 perplexity | no medido | pendiente según el autor |
| MMLU-Pro | no medido | pendiente según el autor |

El autor advierte explícitamente que no existe una ejecución pareada en bf16 bajo el mismo harness, por lo que estas cifras no pueden leerse como un delta de cuantización, sino como los números propios de este checkpoint. La ventaja de velocidad de GLQ proviene de mover 4× menos bytes de pesos, por lo que es mayor en tarjetas con poco ancho de banda (24-32 GB) y aproximadamente paritaria en una Blackwell de 96 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: 7,73 GiB de pesos cargados en vLLM; hay que sumar caché KV, activaciones y buffers del runtime (el autor no publica una cifra total).
- GPU recomendadas: RTX PRO 6000 Blackwell (medición oficial); por el tamaño de pesos, cabría en RTX 4090, RTX 3090 y GPUs de 24 GB o más, aunque no hay mediciones publicadas en esas tarjetas.
- Cabe en GPU de consumo: sí, en principio en cualquier tarjeta con 24 GB o más, siempre que se reserve espacio para la caché KV; no confirmado con benchmarks en la información disponible.
- Opciones de despliegue: vLLM (recomendado, con plugin `glq` registrado automáticamente) y Transformers (`AutoModelForImageTextToText` con `glq.hf_integration`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 83,4 tok/s en decodificación con batch 1 en RTX PRO 6000 Blackwell; sin datos de prefill ni de otros hardwares.
- Requisitos de software: `pip install 'glq[vllm]' "transformers>=5.13.1,<5.15"` y `glq >= 0.8.0`; el script de vLLM debe usar el guard `if __name__ == "__main__":` por el método de arranque `spawn`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw | 3.788.867.632 (safetensors) | no disponible | GLQ 4.0 bpw + KV E8 opcional | apache-2.0 | Hugging Face, 48 descargas |
| google/gemma-4-12B-it (base bf16) | 12B (según nombre) | no disponible | bf16 | apache-2.0 (licencia Gemma 4) | Hugging Face |
| Alternativas de cuantización estándar (GPTQ/AWQ 4-bit) | mismo modelo base | no disponible | 4 bits típico | según checkpoint | no disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre este checkpoint y otras cuantizaciones del mismo modelo base, ni de alternativas de otros fabricantes, en la información proporcionada.

## Limitaciones y advertencias

- La model card no incluye ejecución pareada en bf16 bajo el mismo harness, por lo que no hay una medida publicada de la pérdida de calidad frente al modelo original.
- WikiText-2 perplexity, MMLU-Pro y AIME-2026 están pendientes de medición; no se puede afirmar el impacto de la cuantización en razonamiento o matemáticas.
- El rendimiento de 83,4 tok/s está medido en una única GPU (RTX PRO 6000 Blackwell); extrapolarlo a otras tarjetas sin citar el hardware es incorrecto según el propio autor.
- La cuantización solo cubre el decoder de texto; las torres de visión y audio se mantienen en formato nativo y su comportamiento no está evaluado en esta ficha.
- Dependencia estricta de versiones: `transformers` debe estar por debajo de 5.15 y `glq` debe ser 0.8.0 o superior; otras combinaciones fallan al cargar el modelo.
- El ejemplo de vLLM usa `max_model_len=4096` y desactiva imagen, vídeo y audio (`limit_mm_per_prompt`), lo que sugiere que el servido multimodal completo requiere configuración adicional no documentada.
- El script de vLLM necesita el guard `__main__` por el método `spawn`; sin él, el proceso se relanza recursivamente y muere antes de cargar el modelo.
- Licencia Apache 2.0 declarada, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial del modelo base antes de desplegarlo en producción.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específica de este checkpoint.
- Repositorio con 48 descargas y 0 likes: ecosistema muy pequeño, sin validación comunitaria de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/gemma-4-12B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Referencia QTIP (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Referencia adicional citada (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
