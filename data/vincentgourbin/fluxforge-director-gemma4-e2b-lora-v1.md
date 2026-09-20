# VincentGOURBIN/fluxforge-director-gemma4-e2b-lora-v1

## Resumen

Fluxforge Director LoRA (Gemma 4 E2B) — v1 es un adaptador LoRA publicado por VincentGOURBIN que convierte el modelo Gemma 4 E2B en el "director de IA" de Fluxforge Studio. Dada una breve idea creativa (y, opcionalmente, una hoja de identidad con la fotografía de un sujeto), el modelo planifica un cortometraje como un único documento JSON: título, sinopsis, reparto y una lista de planos expresada mediante tres herramientas (`generate_clip`, `speak_line` y `set_casting`) que el pipeline de renderizado local de Fluxforge Studio (vídeo LTX, edición de imagen Klein, TTS + LipDub) ejecuta directamente. El adaptador no genera vídeo ni audio: su función es exclusivamente la planificación estructurada.

El motivo de su existencia es práctico y medible. El modelo base E2B en su variante cuantizada a 6 bits —la que ejecuta la aplicación— presenta, según el autor, una tasa de fallo aproximada de un tercio en esta tarea: JSON malformado, campos obligatorios ausentes y una evitación casi total de la herramienta `speak_line` incluso estando disponible. El adaptador se entrena por destilación a partir de un modelo profesor más capaz (GLM-5.3-Flash), que generó 1000 planes de ejemplo sobre un banco diverso de briefs, posteriormente curados de forma iterativa (validación de esquema, detección y corrección automática de defectos de calidad, y revisión manual) hasta formar un conjunto de entrenamiento limpio.

Es relevante ahora porque demuestra un patrón habitual en producción: un modelo pequeño y local, poco fiable en salidas estructuradas, se puede llevar a un 97-100 % de validez de esquema con un LoRA de rango 8 entrenado sobre datos destilados, quedando por encima de la fiabilidad del propio profesor (80-87 %) en briefs no vistos. El repositorio está orientado a MLX (Apple Silicon), con 0 descargas y 0 likes en el momento de la consulta, y hereda la licencia Gemma del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 8, scale 20, 16 capas adaptadas con response masking) sobre el modelo base Gemma 4 E2B; arquitectura interna del base no especificada en la información disponible |
| Parámetros totales | No disponible (el adaptador LoRA es de rango 8 sobre 16 capas; el tamaño del modelo base no se detalla) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Base de entrenamiento en bf16; la aplicación ejecuta la variante cuantizada a 6 bits del base y el adaptador carga correctamente sobre ella |
| Idiomas soportados | No disponible en la información proporcionada (el modelo card está redactado en inglés) |
| Licencia | Gemma (heredada del modelo base; los pesos del adaptador se publican bajo los mismos términos) |
| Formato de pesos | Pesos MLX (librería `mlx`); no se especifica el formato de archivo exacto ni el tamaño del repositorio, que figura como 0.0 GB |
| Autor | VincentGOURBIN |
| Modelo base | mlx-community/gemma-4-e2b-it-bf16 |
| Método de entrenamiento | LoRA con `gemma4-cli lora train` (gemma-4-swift-mlx), learning rate 1e-4, 1 época, 897 ejemplos |
| Tarea | Planificación de cortometrajes como un único documento JSON con herramientas |
| Idiomas de la documentación | Inglés |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-20 |
| Etiquetas | mlx, lora, gemma-4, fluxforge-studio, director |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y escala 20 aplicado sobre 16 capas del modelo base `mlx-community/gemma-4-e2b-it-bf16`. El entrenamiento se realizó con la herramienta `gemma4-cli lora train` del proyecto gemma-4-swift-mlx, con enmascaramiento de respuesta (la pérdida se calcula únicamente sobre el turno del asistente), learning rate de 1e-4 y una sola época sobre 897 ejemplos. La precisión de entrenamiento es bf16 (base no cuantizada), y el adaptador resultante se carga después sobre la variante cuantizada a 6 bits que la aplicación usa en inferencia. No se documenta ningún cambio en la arquitectura del transformer base ni técnicas de atención alternativa: la innovación está en los datos y en la adaptación de bajo rango.

Los datos proceden de destilación: GLM-5.3-Flash generó 1000 planes sobre un banco diverso de briefs, que se curaron de forma iterativa combinando validación automática de esquema, detección y corrección de defectos de calidad, y revisión manual. El conjunto final se dividió en 897 ejemplos de entrenamiento y 103 de validación. La pérdida de validación bajó de 1,79 a 1,00 (−44 %) de forma monótona y sin signos de sobreajuste. Entre los criterios de curación citados figuran la exactitud del idioma de los diálogos, la ausencia de fugas de nombres de herramientas en los prompts visuales y la no fabricación de diálogo cuando no hay lip-sync disponible. El adaptador se entrenó con un formato concreto de system/user prompt generado por el `DirectorPromptBuilder` de Fluxforge Studio (versión 6 del esquema de prompt).

## Capacidades

- Generación de planes de cortometraje como un único documento JSON con título, sinopsis, reparto y lista de planos.
- Emisión de llamadas a tres herramientas concretas: `generate_clip`, `speak_line` y `set_casting`.
- Planificación de reparto (casting) a partir del brief y, opcionalmente, de una hoja de identidad fotográfica del sujeto.
- Uso efectivo de la herramienta `speak_line` para diálogos, que el modelo base evitaba casi por completo.
- Cumplimiento estricto de un esquema JSON validado: en la evaluación del autor alcanza 29-30 de 30 briefs retenidos con planes válidos.
- Integración como etapa de planificación en un pipeline local de vídeo, imagen y voz (LTX, Klein, TTS + LipDub), sin que el propio adaptador genere medios.
- No se documentan capacidades de tool calling genérico fuera de las tres herramientas citadas, ni razonamiento multi-paso abierto, ni visión, ni audio, ni modo de pensamiento explícito.

## Casos de uso

- Preproducción automatizada de cortometrajes en Fluxforge Studio: el adaptador recibe el brief creativo y devuelve un JSON ejecutable con planos, reparto y diálogos, sustituyendo la planificación manual y alimentando directamente el pipeline de renderizado local.
- Generación de listas de planos para storyboards: la lista de planos con campos de foco y herramientas permite construir un desglose visual revisable antes de gastar cómputo de renderizado en vídeo.
- Asignación de reparto a partir de una identidad visual: con la hoja de identidad opcional, el modelo decide el casting mediante `set_casting` para mantener coherencia de personaje entre planos.
- Planificación de diálogo y doblaje: mediante `speak_line`, el modelo produce las líneas habladas que el módulo TTS + LipDub sincroniza, evitando inventar diálogo cuando el lip-sync no está disponible.
- Cadena de herramientas de agentes con contrato estricto: sirve como ejemplo de sustitución de un LLM grande por un modelo local de ~2B efectivos más LoRA cuando la salida debe respetar un esquema fijo y validable.
- Prototipado rápido de ideas creativas en local: al ser un adaptador MLX sobre un base pequeño, permite iterar briefs sin coste de API y sin enviar material creativo a servicios externos.
- Referencia metodológica para destilación de salidas estructuradas: el pipeline descrito (generación por profesor, validación de esquema, curación iterativa, LoRA de rango bajo) es replicable en otros dominios con salidas JSON rígidas.
- Filtrado y control de calidad de planes generados: la comprobación de esquema y defectos de calidad descrita en el entrenamiento puede reutilizarse como validador en producción para descartar planes truncados o con campos ausentes.

## Benchmarks y rendimiento

Evaluación sobre 30 briefs retenidos, nunca vistos en entrenamiento, con los mismos prompts. Se mide la tasa de validez de esquema:

| Condición | Planes válidos |
|---|---|
| Base E2B sin adaptador | 17/30 (57 %) |
| E2B + este adaptador | 29-30/30 (97-100 %) |
| Profesor (GLM-5.3-Flash) | 24-26/30 (80-87 %) |

Pérdida de validación durante el entrenamiento: 1,79 → 1,00 (−44 %), decreciente de forma monótona, sin signos de sobreajuste, sobre 103 ejemplos de validación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Entorno de inferencia: MLX, lo que en la práctica implica Apple Silicon (serie M). No se documenta compatibilidad con CUDA ni ROCm.
- Tamaño del adaptador: pesos LoRA de rango 8 sobre 16 capas; el repositorio figura como 0.0 GB en HuggingFace. Estimación orientativa no confirmada: del orden de decenas de MB.
- VRAM/unified memory para el base: no disponible de forma explícita. Estimación orientativa, no confirmada por el autor: alrededor de 1,5-2 GB para el base en 6 bits más overhead de caché KV y activaciones, y del orden de 4 GB si se carga en bf16.
- GPU recomendadas: no disponibles. El requisito real es hardware Apple Silicon con memoria unificada suficiente; no se especifica un mínimo.
- GPU de consumo: el adaptador en sí no impone requisitos adicionales; la viabilidad depende de poder ejecutar el base E2B en MLX. No hay datos de rendimiento en GPU NVIDIA o AMD.
- Opciones de despliegue: `gemma4-cli lora generate` de gemma-4-swift-mlx, con `--model-path` (base en 6 bits o bf16), `--adapter-path` (este repositorio) y `--system` (el system prompt de Fluxforge Director). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Validez de esquema (30 briefs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E2B + Fluxforge Director LoRA v1 | LoRA r8 sobre Gemma 4 E2B | No disponible (base E2B, no detallado) | No disponible | 29-30/30 (97-100 %) | Gemma | HuggingFace, librería mlx |
| Base E2B (sin adaptador) | Gemma 4 E2B cuantizado a 6 bits | No disponible | No disponible | 17/30 (57 %) | Gemma | HuggingFace (mlx-community) |
| GLM-5.3-Flash (profesor, como generador) | Modelo mayor usado para destilación | No disponible | No disponible | 24-26/30 (80-87 %) | No disponible | No disponible |

No se dispone de información sobre otros adaptadores LoRA comparables orientados a planificación de vídeo con salidas JSON validadas, por lo que la comparativa se limita a las tres condiciones evaluadas por el autor.

## Limitaciones y advertencias

- Infrautilización del campo opcional `transition_in` (clip de transición cosido entre planos) respecto a la tasa presente en los propios datos de entrenamiento. El autor indica que no afecta a la validez de esquema ni a la calidad central de la planificación, pero la versión actual no explota las transiciones como elección estilística. Sin resolver en esta release.
- Dependencia estricta del formato de prompt: el adaptador se entrenó con el formato generado por el `DirectorPromptBuilder` de Fluxforge Studio (esquema de prompt versión 6). Usarlo con otro formato de prompt no se espera que funcione bien.
- Alcance muy restringido: está especializado en una única tarea (planificación JSON de cortometrajes con tres herramientas concretas). No es un modelo de propósito general ni sustituye al base en otras tareas.
- El adaptador no genera vídeo, imagen ni audio; solo produce el plan que otros componentes ejecutan.
- Sesgos conocidos: no se documentan sesgos específicos. Al derivarse de datos generados por un profesor (GLM-5.3-Flash) y curados manualmente, puede heredar sesgos del profesor y de los criterios de curación, no auditados en la información disponible.
- Riesgo de alucinación: en la evaluación, entre 0 y 1 de cada 30 briefs produjo un plan no válido. La tasa de validez del 97-100 % implica que aún puede emitir JSON inválido, y se recomienda validar el esquema en producción.
- Idiomas: no se declaran idiomas soportados. Los datos de entrenamiento incluyen un criterio de "exactitud del idioma de los diálogos", pero no se especifica qué idiomas cubre.
- Licencia: hereda la licencia Gemma del modelo base, con las restricciones que esta impone al uso comercial; conviene revisar los términos antes de un despliegue productivo.
- Madurez: repositorio con 0 descargas y 0 likes y sin pipeline declarado; creado y actualizado el mismo día (2026-09-20), lo que sugiere ausencia de validación por terceros.
- Los resultados de evaluación proceden del propio autor y se basan en 30 briefs; no hay evaluación independiente ni comparación con benchmarks estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VincentGOURBIN/fluxforge-director-gemma4-e2b-lora-v1
- Modelo base: https://huggingface.co/mlx-community/gemma-4-e2b-it-bf16
- Repositorio de Fluxforge Studio y gemma-4-swift-mlx: https://github.com/VincentGourbin
- Licencia Gemma: https://ai.google.dev/gemma/terms

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo (los enlaces obtenidos corresponden a un producto de infusión herbal sin relación con el tema), por lo que no se incluyen.
