# VisualInference/Inkling-2-Mini-MLX-3bit

## Resumen

Inkling-2-Mini-MLX-3bit es una compilación cuantizada a 3 bits del modelo Inkling 2 Mini de Thinking Machines Lab, un modelo de mezcla de expertos (MoE) con arquitectura "looped" de 26.400 millones de parámetros que acepta texto e imagen como entrada y produce texto como salida. Esta versión, publicada por VisualInference, está empaquetada en formato mlx-vlm para su ejecución en Apple silicon, con 11,9 GiB de pesos y pensada para Macs con 24 GB de memoria unificada.

El modelo base resuelve tareas multimodales de razonamiento, generación de código, matemáticas y llamada a herramientas (tool calling), e incorpora un modo de razonamiento configurable mediante el parámetro `reasoning_effort`. La cuantización aplica 3 bits a todas las capas de expertos con compensación de error y mantiene el resto en 8 bits, lo que supone un incremento de perplejidad de aproximadamente el 1,4 % respecto al original, un ahorro de 6,3 GiB y una velocidad de decodificación cerca de un 30 % superior.

Su relevancia actual radica en que permite ejecutar un MoE multimodal de 26,4B en hardware de consumo Apple con 24 GB, un umbral inalcanzable para el checkpoint original (18,2 GiB de pesos, recomendado para 32 GB o más). La licencia Apache 2.0 facilita su uso comercial y su integración en flujos de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas "looped"; multimodal texto-imagen a texto |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de hasta 16k tokens) |
| Tipos de cuantizacion | 3 bits en capas de expertos (3,5 bits por peso) con compensación de error; 8 bits en el resto; GPTQ |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mlx-vlm); incluye drafter DSpark en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con un diseño "looped" (denominado `inkling2_loop` en los tags), en el que determinadas capas se reutilizan en varias pasadas. Acepta entradas de texto e imagen y genera texto. El checkpoint original ya emplea cuantización de 4 bits en la mayoría de sus capas de expertos, con formatos NVFP4 y MXFP8 (5,1 bits por peso de media).

Esta compilación de VisualInference recuantiza todas las capas de expertos a 3 bits con compensación de error y deja el resto de capas en 8 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El repositorio conserva sin cambios el drafter DSpark incluido (`mtp.safetensors`), que habilita decodificación especulativa opcional, aunque la propia model card indica que en un M4 Pro no supone una ganancia fiable. La plantilla de chat, el tokenizador y los tokens especiales son los archivos originales, byte a byte.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con esfuerzo configurable (`reasoning_effort`: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`; por defecto `high`).
- Entrada de imágenes junto con texto (pipeline image-text-to-text).
- Generación de código: la model card cita resultados de 35/40 en HumanEval.
- Razonamiento matemático: 49/50 en GSM8K según la model card.
- Llamada a herramientas (tool calling) con salida estructurada: 19/19 en las pruebas de tool calls y 9/10 en salida JSON.
- Ejecución de tareas de agente: 4/4 en las tareas de Hermes Agent.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con soporte de `tools`, `tool_calls` y `reasoning_content`.
- Análisis de respuestas con `processor.tokenizer.parse_response` para extraer razonamiento, contenido y llamadas a herramientas.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Asistentes de código en local para desarrolladores con Mac: el modelo genera funciones (por ejemplo, fusión de intervalos solapados) y mantiene un rendimiento de 35/40 en HumanEval tras la cuantización a 3 bits, por lo que sirve para autocompletado y revisión en entornos sin GPU dedicada.
- Agentes autónomos con llamada a herramientas: gracias a la plantilla de chat original y al parser de tool calls de mlx-vlm, se puede levantar un servidor compatible con OpenAI en loopback y conectar agentes que necesiten invocar APIs con argumentos en JSON.
- Automatización de tareas de escritorio y pipelines de agente: las 4/4 tareas de Hermes Agent superadas indican que el modelo puede encadenar pasos multi-step con razonamiento de esfuerzo `low` o `medium` para reducir latencia.
- Procesamiento de documentos con imagen: al aceptar entrada de imagen y texto, puede extraer información de capturas, diagramas o formularios y devolver texto estructurado o llamadas a herramientas.
- Prototipado de asistentes conversacionales en Apple silicon: con 12,7 GiB de memoria pico para prompts cortos y 14,1 GiB para 16k tokens, cabe en un Mac de 24 GB y permite iterar sin infraestructura cloud.
- Evaluación y experimentación con cuantización: al publicarse builds de 2, 3 y 4 bits con métricas comparadas (pérdida held-out, GSM8K, HumanEval, velocidad), sirve como banco de pruebas para estudiar el impacto de la cuantización extrema en MoE multimodales.
- Generación de salida JSON para integración en backends: la puntuación de 9/10 en salida JSON permite usarlo en extracción de datos y respuestas estructuradas dentro de servicios ligeros.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en un Mac mini (M4 Pro, 48 GB) con decodificación greedy (temperatura 0):

| Build | Pesos | Capas de expertos | Pérdida held-out vs original | GSM8K | HumanEval |
|---|---|---|---|---|---|
| original (cargado tal cual) | 18,2 GiB | NVFP4 y MXFP8, 5,1 bits/peso | referencia (1,448 nats/token) | 48/50 | 35/40 |
| 4bit | 14,8 GiB | 4,5 bits/peso | +0,002 ± 0,001 nats (+0,2 %) | 45/50 | 36/40 |
| 3bit (este repo) | 11,9 GiB | 3,5 bits/peso | +0,014 ± 0,004 nats (+1,4 %) | 49/50 | 35/40 |
| 2bit | 9,1 GiB | 2,5 bits/peso | +0,095 ± 0,013 nats (+10,0 %) | 47/50 | 32/40 |

| Build | Tool calls | Salida JSON | Tareas Hermes Agent | Velocidad de decodificación | Memoria pico: prompt corto / 4k / 16k |
|---|---|---|---|---|---|
| original | 18/19 | 9/10 | 4/4 | 25,9 tok/s | 20,3 / 21,4 / 22,1 GiB |
| 4bit | 18/19 | 9/10 | 4/4 | 31,1 tok/s | 15,5 / 16,2 / 16,9 GiB |
| 3bit (este repo) | 19/19 | 9/10 | 4/4 | 33,8 tok/s | 12,7 / 13,5 / 14,1 GiB |
| 2bit | 19/19 | 9/10 | 4/4 | 33,4 tok/s | 9,8 / 10,6 / 11,2 GiB |

La propia model card advierte que los conjuntos de tareas son pequeños y que diferencias de unos pocos problemas entre filas son ruido; la comparación precisa es la pérdida held-out.

## Requisitos de hardware

- VRAM/memoria unificada: 11,9 GiB de pesos; memoria pico medida de 12,7 GiB con prompt corto, 13,5 GiB con 4k tokens y 14,1 GiB con 16k tokens.
- Hardware objetivo: Macs con 24 GB de memoria unificada o más (Apple silicon). El original requiere 32 GB o más para cargarse directamente en mlx-vlm.
- GPU dedicadas: no aplica; el formato es mlx-vlm para Apple silicon. No hay datos de despliegue en A100, H100 o RTX 4090 para este build.
- Cabe en GPU de consumo Apple: sí, en Mac mini M4 Pro (48 GB) según las mediciones; se declara compatible con Macs de 24 GB.
- Opciones de despliegue: mlx-vlm (CLI `mlx_vlm.generate` y servidor `mlx_vlm.server` compatible con OpenAI); requiere instalar desde el código fuente (`pip install -U "git+https://github.com/Neywa-Labs/mlx-vlm"`) hasta que haya una release con soporte de Inkling 2 Mini (PR 2778), y al menos el commit `434a1bed` (PR 2783) para el parser de tool calls.
- Latencia y throughput: 33,8 tok/s de decodificación en M4 Pro con decodificación greedy; la decodificación especulativa con el drafter DSpark no ofrece una ganancia fiable en ese hardware.
- Ajuste de tokens: el razonamiento consume `max_tokens`; se recomienda al menos 1.000 tokens por turno para evitar respuestas vacías.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento citado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-3bit (este) | 26,4B (MoE) | no disponible | 3 bits expertos / 8 bits resto | GSM8K 49/50, HumanEval 35/40, 33,8 tok/s | Apache 2.0 | Hugging Face, mlx-vlm |
| Inkling-2-Mini-MLX-4bit | 26,4B (MoE) | no disponible | 4 bits expertos | GSM8K 45/50, HumanEval 36/40, 31,1 tok/s | Apache 2.0 | Hugging Face, mlx-vlm |
| Inkling-2-Mini-MLX-2bit | 26,4B (MoE) | no disponible | 2 bits expertos | GSM8K 47/50, HumanEval 32/40, 33,4 tok/s | Apache 2.0 | Hugging Face, mlx-vlm |
| Inkling-2-Mini (original) | 26,4B (MoE) | no disponible | NVFP4/MXFP8 (5,1 bits/peso) | GSM8K 48/50, HumanEval 35/40, 25,9 tok/s | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- La cuantización a 3 bits introduce un incremento de perplejidad del 1,4 % respecto al original, con posible degradación en tareas sensibles a precisión.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o factualidad.
- El razonamiento consume tokens de `max_tokens`: con límites pequeños el modelo puede devolver una respuesta vacía. Se recomienda un mínimo de 1.000 tokens por turno.
- El esfuerzo de razonamiento por defecto es `high` si el cliente no envía nada; para bucles de agente conviene usar `low` o `medium` para reducir latencia. El valor `none` no desactiva por completo el razonamiento.
- El token de parada correcto es `<|content_model_end_sampling|>` (id 200006); `<|end_message|>` no debe añadirse como stop string.
- El soporte de tool calling requiere mlx-vlm en el commit `434a1bed` o posterior; versiones anteriores no devuelven `tool_calls` ni `content`.
- La decodificación especulativa con el drafter DSpark no es una ganancia fiable en M4 Pro según la model card.
- Las métricas de tareas se basan en conjuntos pequeños; diferencias de pocos problemas entre builds son ruido estadístico.
- El modelo está empaquetado exclusivamente para Apple silicon (mlx-vlm); no hay builds para CUDA ni otros backends en esta información.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.

## Enlaces

- Hugging Face (este build): https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 4 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Build de 2 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- Repositorio mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
