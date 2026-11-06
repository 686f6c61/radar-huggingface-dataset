# spotapovadm/qwen3.8-27b-swe-lora

## Resumen

Qwen3.8-27B SWE-agent LoRA es un adaptador LoRA desarrollado por el usuario spotapovadm sobre el modelo base Qwen/Qwen3.8-27B. Su propósito es especializar el modelo en tareas de agente de código (coding agent), es decir, resolver problemas de ingeniería de software mediante llamadas a herramientas en bucle. El adaptador se entrenó sobre 1.200 trayectorias resueltas del dataset SWE-bench/SWE-smith-trajectories, renderizadas con la plantilla de chat nativa de Qwen3.8, que incluye llamadas a herramientas en XML y bloques de razonamiento `<think>`.

La relevancia de este adaptador radica en que mejora de forma medible la fidelidad de las llamadas a herramientas del modelo base sin sacrificar el razonamiento explícito. Según la evaluación del autor, la tasa de acierto en la elección de la misma herramienta que la referencia pasa del 65% al 97,5%, y la coincidencia en la sub-orden del editor `str_replace_editor` sube del 32% al 88%. El adaptador es pequeño (435 MB) y se sirve junto al modelo base en bf16 sin necesidad de fusión.

El adaptador no modifica la torre de visión ni la cabeza MTP del modelo base, y mantiene la licencia Apache-2.0. Está pensado para despliegues con vLLM que requieran tool calling compatible con la API de OpenAI y razonamiento de bajo esfuerzo (`reasoning_effort="low"`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8 con atención completa y Gated DeltaNet |
| Parametros totales | no disponible (adaptador de 435 MB; el modelo base bf16 ocupa ~56 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens en el ejemplo de servicio con vLLM; longitud máxima de entrenamiento 6.144 |
| Tipos de cuantizacion | no disponible (el adaptador se sirve en bf16 junto al base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado a todas las capas lineales del modelo de lenguaje: proyecciones q/k/v/o de la atención completa, proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet, y capas MLP. La torre de visión y la cabeza MTP quedan intactas. El entrenamiento se realizó sobre 1.200 trayectorias resueltas del dataset SWE-smith-trajectories, con un total de 5.880.926 tokens (1.885.477 entrenados) y longitud máxima de 6.144 tokens. Se ejecutaron 150 pasos en una única GPU H200 durante 0,94 horas, con torch 2.14.1, Triton 3.8 y flash-linear-attention 0.5.2. La pérdida de entrenamiento bajó de 0,363 (media de los primeros 10 pasos) a 0,181 (media de los últimos 20), con una pérdida final de 0,2139.

Las trayectorias se renderizaron con la plantilla de chat propia de Qwen3.8, conservando el bloque `<think>` en cada turno y usando `reasoning_effort="low"`. Las herramientas vistas en entrenamiento son `bash`, `str_replace_editor` y `submit`, con el esquema de SWE-agent. El autor señala explícitamente que, a diferencia de un LoRA en formato harmony sobre gpt-oss-20b entrenado con los mismos datos, este adaptador conserva el razonamiento breve antes de cada llamada a herramienta.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`<think>`) en cada turno.
- Llamada a herramientas (tool calling) con salida en formato OpenAI `tool_calls` y razonamiento en `message.reasoning_content`.
- Ejecución de comandos de shell mediante la herramienta `bash`.
- Edición de ficheros mediante `str_replace_editor`, con sub-órdenes como visualización, búsqueda y sustitución.
- Finalización de tareas mediante la herramienta `submit`.
- Razonamiento multi-paso en bucle de agente: el modelo alterna pensamiento, llamada a herramienta y observación.
- Capacidad de adaptarse a esquemas de herramientas distintos de los vistos en entrenamiento (probado de forma preliminar con las herramientas de SuperQwen: `repo.tree`, `code.search`, `file.read`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión: la torre de visión del modelo base no se entrena, pero el ejemplo de servicio la desactiva explícitamente (`"image": 0, "video": 0`).

## Casos de uso

- Reparación automática de fallos en repositorios: el adaptador elige la herramienta y los argumentos correctos en el 97,5% de los casos evaluados, lo que permite integrarlo en pipelines que reciben un issue y deben localizar, editar y validar el código afectado mediante `bash` y `str_replace_editor`.
- Edición precisa de ficheros en producción: la coincidencia del 88% en la sub-orden de `str_replace_editor` reduce las ediciones erróneas y los bucles de corrección, algo crítico cuando el agente opera sobre ramas reales.
- Agentes de CI/CD: con tool calling compatible con la API de OpenAI, el modelo puede conectarse a vLLM y ejecutar pasos de verificación, aplicación de parches y envío de resultados dentro de un pipeline automatizado.
- Asistentes de desarrollo en IDE: el modo de razonamiento breve (`reasoning_effort="low"`) y una latencia mediana de 3,8 s por llamada lo hacen adecuado para sugerencias interactivas con traza de pensamiento visible.
- Automatización de tareas de mantenimiento de código: búsqueda de patrones (`code.search`) y lectura de ficheros (`file.read`) para tareas como localizar exportaciones CSV o funciones concretas, como se probó en el smoke test con herramientas de SuperQwen.
- Investigación sobre imitación de trayectorias de agente: el adaptador y el código de entrenamiento en `training/` permiten reproducir el ajuste y estudiar la conservación del razonamiento frente a otros formatos como harmony.
- Despliegue multi-LoRA: al servirse sin fusión, un mismo base bf16 puede alojar este adaptador junto a otros, seleccionando el modelo mediante el campo `"model"` de la petición.

## Benchmarks y rendimiento

Evaluación sobre 40 trayectorias reservadas (las 40 siguientes al conjunto de entrenamiento en el mismo orden aleatorio). No son puntuaciones de SWE-bench.

| Métrica | Base | + LoRA |
|---|---|---|
| Pérdida en tokens de asistente | 0,412 | 0,189 |
| Devuelve una llamada a herramienta | 97,5% | 100% |
| Argumentos son JSON válido | 97,5% | 100% |
| Misma herramienta que la referencia | 65% | 97,5% |
| Misma sub-orden de `str_replace_editor` | 32% | 88% |
| Errores de petición | 0 | 0 |
| Incluye texto de razonamiento | 100% | 100% |
| Latencia mediana | 3,0 s | 3,8 s |

Prueba cualitativa con herramientas de SuperQwen (tres tareas, solo smoke test): ambos modelos respondieron con una llamada a herramienta en todas las ocasiones; el base listó el árbol del repositorio en las tres, mientras que el LoRA lo listó una vez y en las otras dos buscó directamente el código relevante (`code.search` para `csv.*export` y para `create_user`).

## Requisitos de hardware

- El modelo base en bf16 ocupa aproximadamente 56 GB, por lo que requiere una GPU de clase 80 GB o superior.
- El adaptador LoRA ocupa 435 MB adicionales.
- GPU verificada por el autor: 1× H200 para entrenamiento y para servicio con vLLM 0.31.0.
- GPU recomendadas: H200, H100 de 80 GB, A100 de 80 GB. No cabe en GPUs de consumo como RTX 4090 (24 GB) en bf16 sin cuantización del base, y no se proporcionan datos de cuantización del adaptador.
- Despliegue verificado con vLLM: `--enable-lora --max-lora-rank 16 --max-loras 1 --lora-modules swe=/models/swe-lora --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --max-model-len 16384`.
- Otros motores (llama.cpp, Ollama, TGI): no disponibles en la información proporcionada.
- Latencia mediana medida en la prueba de siguiente acción: 3,0 s (base) y 3,8 s (LoRA) con temperatura 0. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B SWE-agent LoRA (este) | LoRA sobre Qwen3.8-27B | adaptador 435 MB; base ~56 GB bf16 | 16.384 en servicio; 6.144 en entrenamiento | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | Transformer denso con Gated DeltaNet | no disponible | no disponible | Apache-2.0 | Hugging Face |
| LoRA harmony sobre gpt-oss-20b (mismos datos) | LoRA sobre gpt-oss-20b | no disponible | no disponible | no disponible | mencionado en la model card, sin enlace |

No se dispone de datos de benchmarks comparativos con otros adaptadores de agente de código en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas miden imitación de trayectorias resueltas, no éxito real en SWE-bench; el autor lo advierte de forma explícita.
- La prueba con herramientas de SuperQwen se basa en solo tres prompts y constituye un smoke test, no una evaluación robusta.
- El adaptador se entrenó únicamente con tres herramientas (`bash`, `str_replace_editor`, `submit`); su comportamiento con esquemas muy distintos no está caracterizado.
- El entrenamiento usó `reasoning_effort="low"`; servir el adaptador con otro nivel de esfuerzo puede degradar la fidelidad respecto a los datos de entrenamiento.
- La latencia mediana aumenta de 3,0 s a 3,8 s respecto al base en la prueba de siguiente acción.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del adaptador.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay evidencia de uso en producción.
- El modelo base requiere GPU de 80 GB en bf16; no se documentan opciones de cuantización para hardware menor.
- La licencia Apache-2.0 se hereda del base; los datos de entrenamiento (SWE-smith-trajectories) son MIT.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/spotapovadm/qwen3.8-27b-swe-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Código de entrenamiento: carpeta `training/` del repositorio del adaptador (incluye `training/prep.py`)
- Resultados de evaluación en bruto: carpeta `eval/` del repositorio del adaptador
