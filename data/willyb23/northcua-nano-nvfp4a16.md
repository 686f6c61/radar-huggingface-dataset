# willyb23/NorthCUA-Nano-NVFP4A16

## Resumen

NorthCUA-Nano-NVFP4A16 es una cuantización no oficial, publicada por el usuario willyb23, del modelo beipo-ai/NorthCUA-Nano, un modelo denso de 9.409.813.744 parámetros (aproximadamente 9B) especializado en computer use y construido sobre la arquitectura Qwen3.5. El modelo original es multimodal (image-text-to-text) y está orientado a tareas de agente: interpretar capturas de pantalla, razonar sobre interfaces gráficas y emitir acciones con coordenadas. Esta versión cuantizada reduce el checkpoint de 18,8 GB a 11,2 GB almacenando las proyecciones MLP y de atención completa del modelo de lenguaje en NVFP4, mientras mantiene el resto en BF16.

La relevancia de esta ficha radica en que permite ejecutar un modelo de computer use de 9B en una única GPU de consumo con 32 GB, como la RTX 5090, con una decodificación aproximadamente 1,7 veces más rápida que el original en BF16. El precio a pagar es una pérdida notable de precisión de grounding: 13,73% en ScreenSpot-Pro frente al 18,28% del BF16, una caída que el propio autor califica de significativa y que desaconseja esta variante cuando la precisión de clic es prioritaria.

Se trata de una cuantización de comunidad, sin afiliación con el equipo NorthCUA ni con Qwen, distribuida bajo licencia Apache 2.0. La arquitectura subyacente combina capas de atención lineal (Gated DeltaNet) con capas de atención completa, un codificador de visión en BF16 y soporte de modo de razonamiento (thinking) y tool calling a través de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas de atención lineal (Gated DeltaNet) y 8 capas de atención completa, con codificador de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens en la configuración de ejemplo con vLLM (`--max-model-len 65536`) |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4 E2M1 con escala FP8 E4M3 por cada 16 pesos y escala global FP32 por matriz) en MLP y proyecciones de atención completa; BF16 en el resto |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base NorthCUA-Nano es un transformer denso de aproximadamente 9B parámetros construido sobre Qwen3.5. Su rasgo arquitectónico más destacable es la combinación de 24 capas con atención lineal Gated DeltaNet y 8 capas con atención completa, lo que reduce el coste computacional en contextos largos. Incorpora además un codificador de visión y un módulo merger para el procesamiento de imágenes, ambos preservados en BF16 en esta cuantización. El modelo está diseñado para computer use: recibe capturas de pantalla y produce acciones con coordenadas normalizadas en el espacio 0-1000.

Esta variante concreta aplica una cuantización weight-only de tipo NVFP4A16 sobre las proyecciones MLP (gate, up y down en las 32 capas) y sobre las proyecciones q, k, v y o de las 8 capas de atención completa. El método es round-to-nearest sin datos de calibración, usando las funciones NVFP4 de compressed-tensors sobre los pesos BF16 publicados en la revisión `317dd35`. Las matrices que vLLM fusiona comparten una única escala global (q, k y v por capa, y gate y up por capa). El error relativo de pesos medido (norma de Frobenius) es del 9,49% de media y del 9,55% máximo sobre las 128 matrices cuantizadas. Las capas de atención lineal, las normas, los embeddings, el LM head, el codificador de visión y el merger permanecen en BF16. Las activaciones también se mantienen en BF16.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable mediante `chat_template_kwargs` (`enable_thinking`), que devuelve la cadena de razonamiento en el campo `reasoning` de vLLM 0.32.
- Comprensión de imágenes: pipeline image-text-to-text, con respuestas sobre capturas de pantalla, diálogos e interfaces.
- Computer use: emisión de acciones GUI con coordenadas normalizadas en el espacio 0-1000, pensadas para ejecutarse con el NorthCUA Harness.
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Razonamiento matemático y de instrucciones: el autor indica que matemáticas y seguimiento de instrucciones se mantienen cercanos al original BF16.
- Capacidades de agente y razonamiento multi-paso a través del modo thinking.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Automatización de escritorio y RPA: el modelo interpreta capturas de pantalla y emite clics y acciones con coordenadas normalizadas, integrándose con el NorthCUA Harness para convertir esas coordenadas a píxeles. Adecuado para flujos de trabajo repetitivos en entornos controlados donde la precisión de clic no sea crítica.
- Asistencia sobre interfaces gráficas: responder preguntas sobre diálogos, menús y formularios a partir de una imagen, por ejemplo "¿qué pide este diálogo y qué botones ofrece?", con thinking desactivado para respuestas cortas y directas.
- Agentes con tool calling: servir el modelo con el parser `qwen3_coder` en vLLM para que invoque funciones externas (clima, APIs internas) dentro de pipelines de agentes.
- Razonamiento matemático y resolución de problemas: con thinking activado, el modelo resuelve problemas aritméticos y de varios pasos devolviendo la traza de razonamiento separada del resultado final.
- Despliegue en una sola GPU de consumo: al ocupar 10,5 GiB de VRAM en vLLM, permite montar un servidor de inferencia compatible con la API de OpenAI en una RTX 5090 para prototipado y demos.
- Aceleración con decodificación especulativa: combinado con el drafter DFlash de 2,6 GB, se obtiene hasta el doble de velocidad de generación manteniendo la salida del modelo Nano, útil para entornos interactivos con latencia ajustada.
- Evaluación de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 en tareas de grounding frente al BF16 original antes de adoptar la cuantización en producción.

## Benchmarks y rendimiento

| Benchmark | NorthCUA-Nano NVFP4A16 | NorthCUA-Nano BF16 |
|---|---|---|
| ScreenSpot-Pro (grounding) | 13,73% | 18,28% |
| Matemáticas | Cercano al original (sin cifra publicada) | No disponible |
| Seguimiento de instrucciones | Cercano al original (sin cifra publicada) | No disponible |

El autor indica además una decodificación 1,7 veces más rápida en un único stream sobre una RTX 5090 respecto al BF16, y hasta aproximadamente el doble de velocidad con decodificación especulativa DFlash en una RTX PRO 6000 Blackwell con vLLM 0.32.0.

## Requisitos de hardware

- VRAM en inferencia: 10,5 GiB de pesos en GPU con vLLM; el checkpoint en disco ocupa 11,2 GB frente a 18,8 GB del BF16.
- GPU probada: RTX 5090 de 32 GB con vLLM 0.32.0 y Docker (`vllm/vllm-openai:v0.32.0`).
- Cabe en GPU de consumo con al menos 12-16 GB de VRAM efectiva, aunque el autor solo documenta la prueba en RTX 5090; vLLM reserva por defecto el 92% de la memoria de la GPU y admite `--gpu-memory-utilization` para ajustarla.
- Despliegue recomendado: vLLM 0.32.0, que selecciona automáticamente el kernel Marlin FP4 para este formato sin flags adicionales. El formato compressed-tensors es el mismo que escribe llm-compressor para su esquema NVFP4A16.
- Decodificación especulativa opcional: drafter z-lab/Qwen3.5-9B-DFlash de 2,6 GB con `--speculative-config '{"method": "dflash", "model": "z-lab/Qwen3.5-9B-DFlash", "num_speculative_tokens": 7}'`, soportado nativamente por vLLM 0.32 sin `--trust-remote-code`.
- Rendimiento medido: 1,7x de velocidad de decodificación frente al BF16 en RTX 5090; hasta 2x con DFlash en RTX PRO 6000 Blackwell (medición del 2026-11-06). No se publican cifras de throughput agregado ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Grounding (ScreenSpot-Pro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NorthCUA-Nano NVFP4A16 | 9,41B | 65.536 tokens (config. vLLM) | 13,73% | Apache 2.0 | Hugging Face (comunidad) |
| NorthCUA-Nano (BF16) | 9,41B | No disponible | 18,28% | Apache 2.0 | Hugging Face (beipo-ai) |
| NorthCUA-Mini NVFP4A16 | No disponible | No disponible | Sin pérdida medible según el autor | Apache 2.0 | Hugging Face (willyb23) |

El autor señala que la variante Mini NVFP4A16 no muestra pérdida medible de precisión, por lo que es la alternativa preferible si el tamaño lo permite. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida significativa de precisión de grounding: 13,73% frente a 18,28% en ScreenSpot-Pro. El propio autor recomienda el BF16 original si la precisión de clic es prioritaria.
- Cuantización no oficial: no está afiliada ni respaldada por el equipo NorthCUA ni por Qwen; el soporte y la validación recaen en el publicador comunitario.
- Método de cuantización sin calibración (round-to-nearest), con un error relativo de pesos del 9,49% de media y 9,55% máximo.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de sesgo o robustez en esta variante.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo original.
- Dependencia de la versión de vLLM: probado con 0.32.0; otras versiones pueden no cargar el formato compressed-tensors NVFP4 sin ajustes.
- Para computer use es necesario respetar el espacio de coordenadas normalizado 0-1000 y usar el NorthCUA Harness oficial; un uso incorrecto de las coordenadas produce acciones erróneas.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de comunidad conviene verificar los términos del modelo base beipo-ai/NorthCUA-Nano antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willyb23/NorthCUA-Nano-NVFP4A16
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Variante Mini NVFP4A16: https://huggingface.co/willyb23/NorthCUA-Mini-NVFP4A16
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- NorthCUA Harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
