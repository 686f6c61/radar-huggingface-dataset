# VisualInference/Inkling-2-Mini-MLX-2bit

## Resumen

Inkling-2-Mini-MLX-2bit es una compilación cuantizada a 2 bits del modelo Inkling 2 Mini de Thinking Machines Lab, publicada por VisualInference para su uso en Apple Silicon mediante la librería mlx-vlm. El modelo base es un mixture-of-experts (MoE) con arquitectura "looped" de 26.388.641.280 parámetros totales, capaz de recibir texto e imagen y generar texto, distribuido bajo licencia Apache 2.0. Esta versión concreta reduce el peso de los pesos a 9,1 GiB para que el modelo quepa en Macs con 16 GB de memoria unificada, un umbral que las versiones de 3 y 4 bits no alcanzan.

La compilación aplica cuantización de 2 bits con compensación de error a todas las capas de expertos, mientras que el resto de componentes se mantienen en 8 bits. Según la model card, esto supone un incremento de perplejidad de aproximadamente el 10 % respecto al checkpoint original, con la capacidad de tool calling intacta pero con un deterioro notable en generación de código y reconocimiento de imágenes.

Es relevante ahora porque permite ejecutar un modelo multimodal de 26,4B parámetros con soporte de agentes y tool calling en hardware de consumo Apple, algo que hasta la fecha requería al menos 32 GB de memoria unificada para cargar el checkpoint original. El repositorio incluye además el drafter DSpark (`mtp.safetensors`) para decodificación especulativa, aunque la propia model card advierte de que la ganancia no es fiable en un M4 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con arquitectura "looped" (`inkling2_loop`); multimodal image-text-to-text |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 16k tokens) |
| Tipos de cuantizacion | Expertos a 2 bits con compensación de error; resto de capas a 8 bits; media de 2,5 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye drafter `mtp.safetensors` |
| Tamano de pesos | 9,1 GiB (repo: 10,4 GB) |
| Libreria | mlx (mlx-vlm) |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con diseño "looped", identificada en los tags como `inkling2_loop`, y procesa entradas de texto e imagen para producir texto. La model card indica que el checkpoint original ya almacena la mayoría de sus capas de expertos en 4 bits (combinación de NVFP4 y MXFP8, con una media de 5,1 bits por peso), de modo que el modelo de referencia se distribuye ya parcialmente cuantizado. Esta compilación va un paso más allá y recuantiza todas las capas de expertos a 2 bits aplicando compensación de error, dejando el resto de componentes en 8 bits y alcanzando una media de 2,5 bits por peso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se detalla en la información proporcionada ninguna innovación de atención o decodificación más allá de la inclusión del drafter DSpark para decodificación especulativa, que se distribuye sin modificar en `mtp.safetensors`. La model card sí documenta el proceso de cuantización y su impacto medido en pérdida sobre un conjunto retenido: +0,095 ± 0,013 nats por token respecto al original (1,448 nats por token), equivalente a un +10,0 % de perplejidad.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de modo de razonamiento configurable mediante `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`).
- Entrada de imagen: pipeline `image-text-to-text`, con reconocimiento de imágenes debilitado respecto al modelo original según la model card.
- Tool calling / function calling: formato `<|content_invoke_tool_json|>`, con argumentos devueltos como cadena JSON y `finish_reason: "tool_calls"` en servidor compatible con OpenAI.
- Salida estructurada en JSON: 9/10 en el conjunto de prueba de la model card.
- Ejecución de tareas de agente multi-paso: 4/4 en las tareas de Hermes Agent reportadas.
- Generación de código: 32/40 en HumanEval en esta compilación de 2 bits.
- Razonamiento matemático: 47/50 en GSM8K.
- Capacidad multilingüe limitada al inglés (`language: en`).
- Decodificación especulativa opcional mediante el drafter DSpark incluido.

## Casos de uso

- **Asistentes locales en Mac de 16 GB**: el modelo cabe en 9,8 GiB de memoria en prompts cortos, lo que permite desplegar un asistente conversacional multimodal completo en un Mac mini o MacBook con memoria unificada de 16-18 GB, sin depender de la nube.
- **Automatización de agentes con tool calling**: la compilación conserva la capacidad de invocar herramientas (19/19 en las pruebas de la model card) y ejecuta tareas de Hermes Agent (4/4), por lo que puede integrarse en bucles de agente que consulten APIs o ejecuten acciones estructuradas.
- **Generación de salidas JSON para pipelines**: con 9/10 en el conjunto de prueba de JSON, es adecuado para tareas de extracción de datos estructurados o formateo de respuestas dentro de flujos automatizados donde el coste de un fallo ocasional es tolerable.
- **Prototipado y evaluación de modelos MoE en Apple Silicon**: sirve para validar pipelines de mlx-vlm, plantillas de chat y parsers de tool calling antes de escalar al checkpoint original de 18,2 GiB en máquinas con 32 GB o más.
- **Procesamiento de documentos con imagen en local**: al aceptar entrada de imagen y texto, puede emplearse para tareas ligeras de descripción o extracción de información de capturas y fotografías, asumiendo el deterioro documentado en reconocimiento de imágenes.
- **Razonamiento matemático de ámbito educativo**: con 47/50 en GSM8K, es viable para resolver problemas aritméticos de varios pasos en aplicaciones de tutoría o verificación, ajustando `reasoning_effort` a `low` o `medium` para reducir latencia.
- **Servidor compatible con OpenAI en red local**: `mlx_vlm.server` expone `/v1/chat/completions` en loopback, lo que permite conectar clientes existentes (incluidos los que envían `tools`) sin reescribir la integración, aplicando el parche de tool calls incluido en el repositorio.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en un Mac mini (M4 Pro, 48 GB) con decodificación greedy (temperatura 0). La propia card advierte que los conjuntos de tareas son pequeños y que diferencias de pocos problemas entre filas son ruido; la comparación precisa es la pérdida sobre conjunto retenido.

| Metrica | Original (cargado tal cual) | 4bit | 3bit | 2bit (este repo) |
|---|---|---|---|---|
| Pesos | 18,2 GiB | 14,8 GiB | 11,9 GiB | 9,1 GiB |
| Bits por peso en expertos | 5,1 | 4,5 | 3,5 | 2,5 |
| Perdida retenida vs original | referencia (1,448 nats/token) | +0,002 ± 0,001 nats (+0,2 %) | +0,014 ± 0,004 nats (+1,4 %) | +0,095 ± 0,013 nats (+10,0 %) |
| GSM8K | 48/50 | 45/50 | 49/50 | 47/50 |
| HumanEval | 35/40 | 36/40 | 35/40 | 32/40 |
| Tool calls | 18/19 | 18/19 | 19/19 | 19/19 |
| Salida JSON | 9/10 | 9/10 | 9/10 | 9/10 |
| Tareas Hermes Agent | 4/4 | 4/4 | 4/4 | 4/4 |
| Velocidad de decodificacion | 25,9 tok/s | 31,1 tok/s | 33,8 tok/s | 33,4 tok/s |
| Memoria pico (prompt corto / 4k / 16k) | 20,3 / 21,4 / 22,1 GiB | 15,5 / 16,2 / 16,9 GiB | 12,7 / 13,5 / 14,1 GiB | 9,8 / 10,6 / 11,2 GiB |

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: 9,8 GiB con prompt corto, 10,6 GiB con prompt de 4k y 11,2 GiB con prompt de 16k. La model card recomienda Macs con 16 GB (ajustado) o 18 GB de memoria.
- **GPU recomendadas**: Apple Silicon; las mediciones se realizaron en un Mac mini con M4 Pro y 48 GB. No se reportan datos para GPU NVIDIA o AMD, ya que el formato es MLX.
- **Cabe en GPU de consumo**: sí, en Apple Silicon de gama consumer con al menos 16 GB de memoria unificada. No aplica a GPUs discretas por el formato MLX.
- **Opciones de despliegue**: `mlx-vlm` (instalación desde fuente con `pip install -U "git+https://github.com/Neywa-Labs/mlx-vlm"` hasta que haya release con soporte de Inkling 2 Mini, añadido el 2026-11-20 en el PR 2778); servidor OpenAI-compatible mediante `mlx_vlm.server`; interfaz de línea de comandos `mlx_vlm.generate`.
- **Latencia y throughput**: 33,4 tok/s de decodificación en M4 Pro, frente a 25,9 tok/s del original. La decodificación especulativa con el drafter DSpark incluido no es una ganancia fiable en M4 Pro según la model card.
- **Parche necesario para tool calling en servidor**: con el commit `111ac668` de mlx-vlm, el servidor no devuelve `tool_calls` ni `content`; se requiere el parche `extras/mlx-vlm-inkling2-tool-calls.patch` incluido en el repositorio.

## Comparativa con modelos similares

Comparación con las otras compilaciones del mismo modelo base publicadas por el mismo autor, que son las alternativas directas de la misma categoría y tarea:

| Modelo | Parametros | Contexto | Pesos | Perdida vs original | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-2bit (este) | 26,4B | no disponible | 9,1 GiB | +10,0 % perplejidad | 32/40 | Apache 2.0 | MLX, Apple Silicon 16 GB+ |
| Inkling-2-Mini-MLX-3bit | 26,4B | no disponible | 11,9 GiB | +1,4 % perplejidad | 35/40 | Apache 2.0 | MLX, Apple Silicon 18 GB+ |
| Inkling-2-Mini-MLX-4bit | 26,4B | no disponible | 14,8 GiB | +0,2 % perplejidad | 36/40 | Apache 2.0 | MLX, Apple Silicon 24 GB+ |
| Inkling-2-Mini original | 26,4B | no disponible | 18,2 GiB | referencia | 35/40 | Apache 2.0 | MLX, Apple Silicon 32 GB+ |

No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- **Deterioro medido por la cuantización**: +10,0 % de perplejidad respecto al original, con pérdida de calidad en generación de código (32/40 en HumanEval frente a 35/40 del original) y reconocimiento de imágenes más débil, según la model card.
- **Idioma**: el modelo solo declara soporte de inglés (`language: en`); no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- **Tool calling en servidor roto sin parche**: en el commit `111ac668` de mlx-vlm el servidor no devuelve `tool_calls` ni `content`; es imprescindible aplicar el parche incluido o esperar a una release con el parser de `<|content_invoke_tool_json|>`.
- **Riesgo de respuesta vacía**: el razonamiento consume `max_tokens`; con un límite bajo el modelo puede gastarlo todo en razonar y devolver una respuesta vacía. Se recomienda permitir al menos 1.000 tokens por turno.
- **Token de parada**: `<|end_message|>` no es token de parada y no debe añadirse como tal; el token correcto es `<|content_model_end_sampling|>` (id 200006).
- **Riesgo de alucinación**: no se documenta una evaluación específica de alucinación en la información disponible; aplican los riesgos habituales de los modelos generativos, agravados por la cuantización agresiva.
- **Conjuntos de evaluación pequeños**: las tareas de la model card separan compilaciones funcionales de rotas, pero no permiten extraer conclusiones finas de rendimiento; la pérdida sobre conjunto retenido es la métrica fiable.
- **Licencia**: Apache 2.0 permite uso comercial, pero el deterioro de calidad y la dependencia de un parche no publicado en release deben tenerse en cuenta antes de llevar la compilación a producción.
- **Hardware**: requiere Apple Silicon; no es desplegable en GPU NVIDIA con vLLM, TGI o llama.cpp en este formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Compilación 4bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Compilación 3bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- Librería mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm
- Parche de tool calls: `extras/mlx-vlm-inkling2-tool-calls.patch` (incluido en el repositorio de Hugging Face)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
