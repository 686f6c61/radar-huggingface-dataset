# Vishva007/d3-nano-W4A16-AutoRound

## Resumen

`Vishva007/d3-nano-W4A16-AutoRound` es una versión cuantizada a 4 bits (W4A16) del modelo multimodal `vllm-sr/d3-nano`, el modelo fundacional de decisión de 2B parámetros de Decision 3.0 (vLLM Semantic Router). A diferencia de un LLM generativo convencional, `d3-nano` evalúa entradas (texto, JSON, imágenes y fragmentos de vídeo) contra preguntas de decisión de tipo Choice, Yes/No y Score, y devuelve probabilidades directas en un único forward pass sin generar tokens. Esta variante ha sido producida por el usuario Vishva007 aplicando Intel AutoRound con una configuración de alta precisión orientada a producción.

El interés de esta ficha reside en dos factores. Primero, la cuantización W4A16 con group size 32, simétrica y 1200 iteraciones de calibración reduce la huella de pesos del backbone lingüístico entre 3 y 3,5 veces respecto a BF16, lo que abre la puerta a despliegues en GPUs de estación de trabajo y aceleradores de borde. Segundo, el codificador visual se mantiene explícitamente sin cuantizar (`quant_nontext_module: False`), de modo que la fidelidad del grounding visual y de vídeo se preserva.

El modelo base pertenece a la familia `qwen3_5` según los tags del repositorio, cuenta con 1.061.364.544 parámetros reales según los safetensors y se distribuye bajo licencia Apache 2.0. El repo ocupa 2,5 GB y acumula 54 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `qwen3_5`) con torre de visión; modelo de decisión con salida de probabilidades en un solo forward pass |
| Parametros totales | 1.061.364.544 (aprox. 1,06B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la calibración se realizó con `seqlen` de 4096) |
| Tipos de cuantizacion | W4A16: pesos 4 bits, activaciones 16 bits, group size 32, simétrica, AutoRound; codificador visual en FP16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base `d3-nano` es un modelo fundacional de decisión multimodal construido sobre un backbone transformer de la familia `qwen3_5` con una torre de visión acoplada. Su particularidad es que no genera texto: recibe un `state` (texto, JSON, imágenes o vídeo) junto con un conjunto de `questions` tipadas (`choice`, `noul` para sí/no, `score`) y emite directamente probabilidades por pregunta en una única pasada. La API expuesta es `model.system_one(...)`, que devuelve un diccionario `answers` con las decisiones resueltas.

Esta variante concreta no ha sido reentrenada: es una cuantización post-entrenamiento realizada con Intel AutoRound sobre el checkpoint original. La configuración de calibración emplea 512 muestras, batch size 4, longitud de secuencia 4096, 1200 iteraciones de optimización y `enable_torch_compile=True` para acelerar el proceso vía TorchDynamo. La decisión técnica más relevante es mantener el módulo no textual (la torre de visión) en precisión completa, lo que evita la deriva visual que suele aparecer al cuantizar codificadores de imagen. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot multimodal: evalúa texto, JSON, imágenes y clips de vídeo contra criterios definidos en tiempo de inferencia.
- Preguntas de decisión tipadas: `choice` (selección entre criterios), `noul` (sí/no) y `score` (puntuación ordinal sobre una lista de criterios).
- Salida de probabilidades directas en un solo forward pass, sin decodificación autoregresiva de tokens.
- Procesamiento de imágenes en múltiples formatos de entrada: rutas locales, URLs, objetos PIL y cadenas base64.
- Procesamiento de vídeo para grounding temporal y visual.
- Enrutamiento semántico: pensado para integrarse en vLLM Semantic Router y decidir a qué equipo, modelo o pipeline derivar una petición.
- Soporte de `trust_remote_code` con código personalizado incluido en el repositorio.
- Compatibilidad declarada con endpoints y con `vllm-semantic-router` según los tags del repo.
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y una pregunta `choice` con criterios como `returns`, `billing` o `technical`, devolviendo la probabilidad de cada categoría para derivar el caso al equipo correcto sin coste de generación.
- Verificación documental con imágenes: se adjunta una imagen de recibo o factura y se formula una pregunta `noul` del tipo "¿aparece el producto X en el recibo?", aprovechando que la torre de visión permanece sin cuantizar.
- Triaje de urgencia: con una pregunta `score` sobre criterios ordinales ("Routine", "Soon", "Today") se obtiene una prioridad calibrada para colas de atención, útil en sistemas de ticketing.
- Moderación y clasificación de contenido: clasificación zero-shot de texto o vídeo entrante contra políticas definidas dinámicamente, sin necesidad de reentrenar un clasificador por cada nueva política.
- Guardrails en pipelines de agentes: inserción del modelo como paso previo que decide si una petición es segura, está dentro de alcance o debe bloquearse, gracias a la latencia baja de un único forward pass.
- Despliegue en borde: con la reducción de huella de pesos de 3 a 3,5 veces frente a BF16, el modelo es apto para aceleradores de baja memoria, GPUs de estación de trabajo discretas y hardware embebido donde un LLM generativo no cabría.
- Enrutamiento semántico en pasarelas de inferencia: integración en vLLM Semantic Router para decidir qué modelo o backend atiende cada consulta según su contenido multimodal.

## Benchmarks y rendimiento

La model card afirma "zero degradation in visual QA benchmarks (CV-Bench, Perception Test)" respecto al modelo base, pero no se publican cifras concretas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 2,5 GB; con pesos W4A16 y la torre de visión en FP16/BF16, un presupuesto de 3 a 4 GB de VRAM es razonable para inferencia, aunque no se publica una cifra oficial.
- Reducción de huella: la model card indica una reducción de 3 a 3,5 veces en el peso del backbone lingüístico frente a BF16.
- GPU recomendadas: no se especifican modelos concretos; el autor orienta el modelo a "low-memory edge accelerators, discrete workstation GPUs, or embedded hardware".
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM dada la huella estimada, aunque no hay confirmación oficial.
- Opciones de despliegue: `transformers` (versión 5.17.0 según la model card) con `trust_remote_code=True` y `device_map="auto"`; `auto-round` para reproducir la cuantización; `flash-linear-attention` opcional para acelerar la atención lineal. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI para esta variante cuantizada.
- Latencia y throughput: no disponibles. Al no generar tokens, la latencia debería ser la de un único forward pass, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| Vishva007/d3-nano-W4A16-AutoRound | 1,06B | no disponible | Decisión multimodal cuantizado W4A16 | Apache 2.0 | safetensors |
| vllm-sr/d3-nano (base) | no disponible | no disponible | Decisión multimodal BF16 | Apache 2.0 (según tag) | safetensors |
| LLM generativos de ~1-2B (p. ej. familia Qwen) | ~1-2B | variable | Generación de texto | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada. La comparación con LLM generativos es conceptual: `d3-nano` no compite en generación de texto sino en clasificación y enrutamiento de baja latencia, un nicho distinto.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre preguntas predefinidas. No sirve para chat, redacción ni generación de código.
- La cuantización W4A16 introduce una pérdida de precisión inherente en el backbone lingüístico; aunque el autor reporta ausencia de degradación en benchmarks visuales, no se aportan métricas de texto ni de clasificación numérica.
- El codificador visual se mantiene sin cuantizar, por lo que la huella de memoria no se reduce tanto como en una cuantización completa.
- No se documentan idiomas soportados; el rendimiento multilingüe es incierto y debe validarse empíricamente antes de usarlo en producción en castellano.
- Riesgo de alucinación en el sentido de calibración de probabilidades: al emitir scores directos sin generación, la fiabilidad depende del calibrado del modelo base, no verificado en esta variante.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo.
- Dependencia de una versión concreta de `transformers` (5.17.0 según la model card), lo que puede complicar la integración en stacks existentes.
- El repositorio tiene muy poca tracción (54 descargas, 0 likes) y fue creado en octubre de 2026; no hay validación comunitaria ni informes independientes de calidad.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base `vllm-sr/d3-nano` mantenga la misma licencia y que no existan restricciones adicionales en su model card original.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/d3-nano-W4A16-AutoRound
- Árbol de archivos del repositorio: https://huggingface.co/Vishva007/d3-nano-W4A16-AutoRound/tree/main
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
