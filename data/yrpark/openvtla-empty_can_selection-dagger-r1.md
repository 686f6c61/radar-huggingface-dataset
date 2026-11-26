# yrpark/openvtla-empty_can_selection-dagger-r1

## Resumen

`yrpark/openvtla-empty_can_selection-dagger-r1` es un checkpoint de robótica manipulativa obtenido mediante un fine-tune con DAgger del modelo base `yrpark/openvtla-empty_can_selection`. El modelo combina la arquitectura pi0.5 (política visión-lenguaje-acción de tipo flow matching) con el encoder táctil AnyTouch2, y está especializado en la tarea de simulación `empty_can_selection` con sensores GelSight Mini. Lo desarrolla el usuario yrpark dentro del ecosistema OpenViTac y del repositorio de código `tactile_base`.

La relevancia de este checkpoint es acotada pero concreta: documenta un ciclo completo de mejora por aprendizaje por imitación interactivo (DAgger) sobre una política VLA táctil, con datos de corrección recogidos en simulación y un entrenamiento LoRA de 5.000 pasos sobre una NVIDIA B200. No es un modelo de propósito general ni un LLM: es una política de control para un brazo robótico en una tarea de selección de latas.

El repositorio ocupa 6,4 GB e incluye únicamente el checkpoint final (`4999/`), con los pesos de inferencia (`params/`) y las estadísticas de normalización (`assets/`). El estado de entrenamiento (`train_state/`) no se distribuye. La evaluación en simulador está pendiente según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (política visión-lenguaje-acción con flow matching) + encoder táctil AnyTouch2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | openpi checkpoint (`params/` + `assets/` con norm stats) |

## Arquitectura y entrenamiento

La política se basa en pi0.5, un modelo visión-lenguaje-acción que predice acciones mediante flow matching, y se le añade el encoder táctil AnyTouch2 con 18 tokens táctiles obtenidos por `cls_pool2`. El fine-tune se aplica con LoRA sobre dos módulos (`gemma_2b_lora` y `gemma_300m_lora`), lo que implica que el backbone de lenguaje es Gemma (variantes de 2B y 300M) y que solo una fracción de los pesos se actualiza durante el entrenamiento.

Los datos combinan demos scripted del dataset `openvitac/empty_can_selection_gelsight` con datos DAgger de `openvitac/empty_can_selection_dagger_gelsight`, muestreados 50:50. El conjunto DAgger de la ronda r1 contiene 41 episodios y 10.066 frames (10 segmentos de corrección y 31 éxitos del modelo base), con etiquetas densas `event_empty`: 4.965 frames con lata vacía sujeta, 845 con lata pesada sujeta y 4.256 sin etiqueta. El entrenamiento consta de 5.000 pasos, batch 64, LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 y warmup de 200 pasos, horizonte 50. La pérdida es exclusivamente flow matching (BC), sin componente RL. La pérdida final de entrenamiento registrada se sitúa en 0,0004-0,0005 en los últimos pasos. El entrenamiento se ejecutó en una NVIDIA B200 entre el 24 y el 25 de noviembre de 2026 (aproximadamente 3 horas). La cabeza de evento (`event_empty`) se usa solo durante el entrenamiento; la inferencia es idéntica al modelo base.

## Capacidades

- Control robótico de manipulación en simulación para la tarea `empty_can_selection`, con entrada visual y táctil (GelSight Mini).
- Predicción de acciones mediante flow matching con horizonte de 50 pasos.
- Fusión de información táctil (18 tokens del encoder AnyTouch2) con observaciones visuales y de lenguaje.
- Etiquetado denso de eventos durante el entrenamiento (lata vacía vs. lata pesada sujeta), no expuesto en inferencia.
- Mejora iterativa mediante DAgger a partir de correcciones humanas o de política experta.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre.
- Capacidades multilingües: no disponibles; el modelo no procesa lenguaje natural como tarea principal.
- No incluye visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en aprendizaje por imitación interactivo: el checkpoint sirve como referencia reproducible de un ciclo DAgger sobre una política VLA táctil, con datos, hiperparámetros y log de entrenamiento publicados.
- Selección de objetos en simulación: ejecutar la política en el entorno `empty_can_selection` para comparar el rendimiento del fine-tune DAgger frente al checkpoint base step 19999.
- Estudio de fusión táctil-visual: analizar cómo los 18 tokens táctiles de AnyTouch2 influyen en la política pi0.5 en tareas que requieren distinguir objetos por peso o contacto.
- Base para nuevos fine-tunes: partir de este checkpoint LoRA para aplicar DAgger en otras tareas o con nuevos conjuntos de correcciones dentro de OpenViTac.
- Reproducción de experimentos: servir el checkpoint con `scripts/serve_policy.py` de `tactile_base` para validar resultados y comparar configuraciones de entrenamiento.
- Evaluación de eficiencia de LoRA en robótica: medir el coste (5.000 pasos, batch 64, una B200) frente a la ganancia en éxito de la tarea, útil para decidir si merece la pena el ciclo DAgger en proyectos similares.
- Docencia y formación: ejemplo didáctico de pipeline completo desde demos scripted hasta correcciones DAgger y despliegue de política en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente ("Simulator evaluation: pending"). El único dato de rendimiento publicado es la pérdida de entrenamiento (flow loss) de 0,0004-0,0005 en los últimos pasos registrados, que no es una métrica de éxito de tarea.

## Requisitos de hardware

- El checkpoint se entrenó en 1x NVIDIA B200 durante aproximadamente 3 horas (5.000 pasos, batch 64).
- VRAM estimada para inferencia: no disponible; el repositorio pesa 6,4 GB, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del checkpoint y el backbone Gemma, se requiere una GPU con memoria suficiente para cargar pesos en fp32/bf16, aunque no se confirma.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible.
- Opciones de despliegue: servidor de políticas de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_empty_can_selection_dagger --policy.dir checkpoints/openvtla_empty_can_selection_dagger/r1/4999`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla-empty_can_selection-dagger-r1` (este) | no disponible | horizonte 50 | pérdida de entrenamiento 0,0004-0,0005; eval de simulador pendiente | other | Hugging Face, 6,4 GB |
| `yrpark/openvtla-empty_can_selection` (base) | no disponible | horizonte 50 | no disponible en la información proporcionada | other | Hugging Face |
| Otras políticas VLA táctiles de OpenViTac | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre el checkpoint base y este fine-tune, ni de otras políticas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para la tarea `empty_can_selection` en simulación con GelSight Mini; no generaliza a otras tareas sin nuevo fine-tune.
- Evaluación incompleta: no hay resultados de éxito en simulador publicados, por lo que no se puede afirmar que el DAgger mejore al modelo base.
- Datos DAgger limitados: solo 41 episodios y 10.066 frames, con 4.256 frames sin etiqueta de evento, lo que puede introducir desequilibrio en el aprendizaje de la cabeza de evento (usada solo en entrenamiento).
- Licencia "other" sin texto detallado: no se especifican condiciones de uso comercial; debe consultarse el repositorio `tactile_base` y la model card antes de cualquier uso en producción.
- Sin `train_state/`: no se puede reanudar el entrenamiento desde el checkpoint publicado, solo inferir.
- Riesgo de sobreajuste a la simulación: no hay evidencia de transferencia a un robot real ni de robustez ante variaciones de iluminación, textura o posición de los objetos.
- Idiomas y sesgos: no disponibles; al no ser un modelo de lenguaje general, no aplican las métricas habituales de sesgo o alucinación textual, pero sí el riesgo de fallos silenciosos en la política de control.
- Dependencia de código externo: requiere el checkout de `tactile_base` (commit 2038f06) y la configuración `openvtla_empty_can_selection_dagger` para servir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection-dagger-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data (commit `66873a3988`)
- Código `tactile_base`: https://github.com/YuriPark0123/tactile_base (commit 2038f06)
- Documentación DAgger: `docs/dagger.md` en el repositorio `tactile_base`
- Log de entrenamiento: `train_log.txt` incluido en el repositorio del modelo
