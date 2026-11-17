# zixianma/action-selection-heads

## Resumen

`zixianma/action-selection-heads` es un conjunto de cabezas de selección de candidatos (*selection heads*) para el agente web `OpenWebRL/OpenWebRL-4B-SFT`. No es un modelo generativo autónomo: son módulos de 22,6 millones de parámetros que, dado un estado del navegador (captura de pantalla más prompt del actor) y cinco respuestas candidatas muestreadas por el actor, eligen cuál ejecutar. El actor permanece congelado y sus pesos no se modifican; las cabezas leen sus estados ocultos internos en las capas 18, 27 y 36 del decodificador.

El problema que resuelve es el *best-of-N* en agentes web: en lugar de ejecutar la primera acción muestreada, se generan cinco alternativas y un discriminador ligero selecciona la más prometedora. Esto mejora la tasa de éxito sin reentrenar el modelo base ni multiplicar el coste de inferencia del actor. Las cabezas están entrenadas con etiquetas de *lookahead* (ejecutar la acción y simular tres pasos posteriores) o con las elecciones de GPT-5.5 antes de ejecutar.

El repositorio incluye además tres selectores LoRA de 4B completos (visión-lenguaje) y una tercera cabeza de 22,6 M publicada el 13 de noviembre. El tamaño total del repo es de 28 GB, aunque las cabezas en sí son minúsculas en comparación. La relevancia actual radica en que ofrece una vía barata (unas 30 veces más rápida que el selector LoRA de 4B) para mejorar agentes web open source sin tocar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de selección sobre estados ocultos de un transformer decoder (OpenWebRL-4B-SFT); selectores LoRA de 4B como alternativas |
| Parametros totales | 22,6 M por cabeza (cabezas); selectores LoRA sobre base de 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del actor OpenWebRL-4B-SFT; no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, PyTorch (`openwebrl_selection_head.py`, `system_prompt.txt`) |

## Arquitectura y entrenamiento

Las cabezas son módulos ligeros que operan sobre los estados ocultos del actor congelado `OpenWebRL-4B-SFT` (revisión `15e777db2ddba2e0e82080ebccd3ad8d215b7f0a`) en las capas 18, 27 y 36 del decodificador. Para cada panel de cinco candidatos, la cabeza puntúa cada respuesta y devuelve el argmax (empates al índice más bajo); es permutación-equivariante, por lo que el orden de los candidatos no afecta al resultado. Las features dependen del checkpoint SFT exacto, de modo que las cabezas no son válidas para otro actor ni para actores OpenWebRL entrenados con RL, salvo que se re-codifiquen los candidatos con este mismo checkpoint SFT.

Hay dos cabezas principales de 22,6 M: `piotr-data/`, entrenada sobre 2.692 estados y 35.916 paneles de cinco candidatos del release SelectionARM de Piotr, con etiquetas de la elección de GPT-5.5 antes de ejecutar; y `lookahead-k3-1380/`, entrenada sobre 1.380 estados ramificados de OpenWebRL-4B-SFT (347 tareas), con votos de *lookahead* de Luna (cada acción se juzga tras ejecutarla y seguir tres pasos más, dos llamadas por estado en dos órdenes). La tercera cabeza, `head-22m-gpt55-h4-p16/`, se entrenó sobre los mismos 18.786 paneles con etiquetas *lookahead* de GPT-5.5. Los selectores LoRA de 4B (`decoder-4b-lora-recipe2-2.6k/`, `decoder-4b-lora-gpt55-k3-p16/`, `decoder-4b-lora-gpt55-pre-p16/`) son modelos visión-lenguaje completos que leen la captura y los cinco candidatos y responden con su elección; el primero se entrenó sobre 2.612 estados etiquetados con *lookahead* de Luna y los otros dos sobre los 18.786 paneles con etiquetas de GPT-5.5.

## Capacidades

- Selección best-of-5 de acciones para el agente web OpenWebRL-4B-SFT: puntúa cinco respuestas candidatas y devuelve el índice a ejecutar.
- Puntuación por panel: `scorer.score(...)` devuelve los cinco logits, comparables solo dentro de un mismo panel, no entre estados.
- Reconstrucción del prompt del actor: `build_prompt` genera el prompt exacto a partir de la tarea, observaciones, respuestas ejecutadas y feedback del entorno, con el system prompt de evaluación.
- Equivarianza a permutaciones: el orden de los candidatos no altera la selección.
- Operación con token ids o con cadenas de texto de los candidatos.
- Selectores LoRA de 4B alternativos con capacidad visión-lenguaje completa (leen captura y candidatos).
- No es un modelo de recompensa ni un generador: no produce texto nuevo, solo elige entre candidatos existentes.

## Casos de uso

- Mejora de agentes web en producción sin reentrenar el actor: se integra en el bucle existente de OpenWebRL, se muestrean cinco acciones por paso y la cabeza elige la mejor; el coste añadido es mínimo frente a un selector de 4B.
- Automatización de tareas de navegación (reservas, formularios, búsquedas): en cada paso del navegador se descartan cuatro de cinco acciones candidatas, reduciendo ejecuciones erróneas en flujos multi-paso de hasta 30 pasos.
- Evaluación de políticas de agentes: sirve como discriminador barato para comparar checkpoints SFT o configuraciones de muestreo sin desplegar un segundo modelo grande.
- Investigación en *best-of-N* y *lookahead*: permite reproducir experimentos de selección con etiquetas de GPT-5.5 o de votos de Luna sobre estados ramificados.
- Despliegue con requisitos de latencia estrictos: la cabeza de 22,6 M es aproximadamente 30 veces más rápida en selección que el selector LoRA de 4B, adecuada para entornos con presupuesto de cómputo limitado.
- Prototipado de agentes web en investigación académica: el script `openwebrl_selection_head.py` y `build_prompt` permiten reconstruir prompts byte a byte (verificado sobre 360 prompts y 4.644 pasos de historial) para experimentos reproducibles.

## Benchmarks y rendimiento

| Cabeza | Datos de entrenamiento | Objetivo | Éxito medio en vivo (juez OM2W terra / o4-mini) |
|---|---|---|---:|
| `piotr-data/` | 2.692 estados / 35.916 paneles | Elección de GPT-5.5 antes de ejecutar | 44,3% / 46,3% |
| `lookahead-k3-1380/` | 1.380 estados ramificados (347 tareas) | Voto de *lookahead* de Luna | 42,3% / 44,0% |

Diferencia entre ambas cabezas: `piotr-data − lookahead-k3-1380` = +2,1 pp [−1,3, +5,4] en la media de tres benchmarks, es decir, dentro del ruido. La cabeza `piotr-data` igualó el rendimiento con N=5 al usar N=3 en Online-Mind2Web. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para las cabezas: despreciable (22,6 M de parámetros); el coste real lo determina el actor OpenWebRL-4B-SFT congelado.
- VRAM para el actor de 4B: no especificada en la información disponible; depende de la cuantización elegida para el modelo base.
- GPU recomendadas: no disponible; para el actor de 4B se requiere al menos una GPU con memoria suficiente para inferencia en fp16/bf16, pero no se detalla.
- Cabe en GPU de consumo: las cabezas sí; el actor de 4B depende de la cuantización, no confirmado.
- Opciones de despliegue: script propio `openwebrl_selection_head.py` con torch, transformers y safetensors; descarga vía `huggingface_hub.snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la cabeza de 22,6 M es aproximadamente 30 veces más rápida en selección que el selector LoRA de 4B; no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zixianma/action-selection-heads` (cabezas) | 22,6 M | No disponible | Selección best-of-5 para OpenWebRL-4B-SFT | No disponible | Hugging Face |
| `decoder-4b-lora-recipe2-2.6k` (mismo repo) | 4B (LoRA) | No disponible | Selector visión-lenguaje completo | No disponible | Hugging Face |
| `decoder-4b-lora-gpt55-k3-p16` / `pre-p16` (mismo repo) | 4B (LoRA) | No disponible | Selector visión-lenguaje completo | No disponible | Hugging Face |
| `OpenWebRL/OpenWebRL-4B-SFT` (actor base) | 4B | No disponible | Agente web generativo | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Las cabezas solo son válidas para el checkpoint exacto `OpenWebRL-4B-SFT` (revisión `15e777db2ddba2e0e82080ebccd3ad8d215b7f0a`); no funcionan con otros actores ni con actores OpenWebRL entrenados con RL, salvo re-codificación con este SFT y tokenizer y chat template idénticos.
- No son modelos de recompensa: los logits solo son comparables dentro de un mismo panel, no entre estados.
- Entrenadas y evaluadas con N=5; la única excepción es la cabeza `piotr-data` con N=3 en Online-Mind2Web, donde igualó a N=5.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de sesgo y alucinación heredado del actor base y de las etiquetas de GPT-5.5 o Luna usadas en el entrenamiento.
- Dependencia de la captura de pantalla y del prompt exacto del actor; `build_prompt` debe reproducir el formato byte a byte.
- Las cabezas no generan texto ni razonan de forma autónoma; solo eligen entre candidatos ya muestreados.

## Enlaces

- Hugging Face: https://huggingface.co/zixianma/action-selection-heads
- Modelo base: https://huggingface.co/OpenWebRL/OpenWebRL-4B-SFT
- Release SelectionARM de Piotr: no disponible como enlace directo en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
