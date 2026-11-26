# yrpark/openvtla-gear_assembly-dagger-r1

## Resumen

`openvtla-gear_assembly-dagger-r1` es un ajuste fino mediante DAgger del modelo base `yrpark/openvtla-gear_assembly`, un modelo vision-language-tactile-action (VLTA) construido sobre la arquitectura pi0.5 con el encoder táctil AnyTouch2, orientado a manipulación robótica en simulación. Lo desarrolla el usuario de Hugging Face `yrpark` dentro del ecosistema OpenViTac y el framework `tactile_base`, y está especializado en la tarea concreta de ensamblaje de engranajes (`gear_assembly`) con sensor GelSight Mini.

El modelo no es un LLM de propósito general: es una política robótica que recibe observaciones visuales y táctiles y emite acciones motoras, entrenada con flow matching (behavior cloning) y aumentada con datos de recuperación DAgger. El checkpoint parte del paso 19999 del modelo base y se entrena 5.000 pasos adicionales con LoRA sobre los módulos `gemma_2b_lora` y `gemma_300m_lora`, con un horizonte de 50 pasos y 18 tokens táctiles.

Su relevancia es acotada pero específica: demuestra un flujo completo de ajuste con DAgger sobre un modelo pi0.5 multimodal con entrada táctil, incluyendo datos de recuperación etiquetados por evento (`event_blocked`). El repositorio ocupa 6,4 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) + encoder táctil AnyTouch2; LoRA sobre gemma_2b_lora y gemma_300m_lora |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no de texto) |
| Licencia | other (sin detalle en la información disponible) |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una arquitectura vision-language-action, combinada con el encoder táctil AnyTouch2. La política procesa observaciones de simulación con sensor GelSight Mini y produce acciones con horizonte de 50 pasos, usando 18 tokens táctiles obtenidos mediante `cls_pool2`. El ajuste se realiza con LoRA sobre los módulos `gemma_2b_lora` y `gemma_300m_lora`, lo que reduce el coste de entrenamiento respecto a un ajuste completo.

El entrenamiento combina demos scripted del dataset `openvitac/gear_assembly_gelsight` con datos DAgger de `openvitac/gear_assembly_dagger_gelsight`, muestreados 50:50. Los datos DAgger de esta iteración r1 comprenden 20 episodios y 8.593 frames (16 segmentos de recuperación y 4 éxitos base), con etiquetas de evento `event_blocked` distribuidas como 169 para el valor 1, 3.829 para -1 y 4.595 para 0. La pérdida es únicamente flow matching (behavior cloning), sin RLHF ni DPO. Se entrenan 5.000 pasos con batch 64, LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 y warmup de 200 pasos, en una NVIDIA B200 durante aproximadamente 3 horas. La pérdida final de entrenamiento se sitúa en 0,0007-0,0008 en los últimos pasos registrados. La cabeza de evento es solo para entrenamiento; la inferencia es idéntica a la del modelo base.

## Capacidades

- Generación de acciones robóticas para ensamblaje de engranajes en simulación a partir de observaciones visuales y táctiles.
- Percepción táctil mediante GelSight Mini y encoder AnyTouch2, con 18 tokens táctiles por paso.
- Recuperación de estados de bloqueo gracias al entrenamiento DAgger con segmentos de recuperación etiquetados (`event_blocked`).
- Predicción de secuencias de acción con horizonte de 50 pasos.
- Integración con el framework `tactile_base` y el ecosistema openpi para servicio de políticas.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes generales ni multilingüismo.

## Casos de uso

- Ensamblaje de engranajes en simulación: el modelo ejecuta la política entrenada sobre el entorno `gear_assembly` con sensor GelSight Mini, sirviendo como referencia para experimentos de manipulación táctil.
- Investigación en aprendizaje por imitación con DAgger: permite reproducir el flujo de recogida de datos de recuperación y ajuste sobre un modelo pi0.5, comparando con el checkpoint base.
- Evaluación de fusión viso-táctil: útil para estudiar cómo contribuyen los 18 tokens táctiles a la política en tareas de precisión con contacto.
- Base para nuevos ajustes: el checkpoint puede servir de punto de partida para otras tareas de ensamblaje o para iteraciones DAgger adicionales (r2, r3) con más datos de recuperación.
- Reproducción de experimentos: el repositorio incluye el log de entrenamiento completo (`train_log.txt`) y las estadísticas de normalización, lo que facilita replicar el ajuste con el mismo código (`tactile_base` commit 2038f06).
- Docencia y prototipado en robótica: ejemplo práctico de pipeline openpi con política servida mediante `scripts/serve_policy.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación en simulador está pendiente ("Simulator evaluation: pending"). El único dato de rendimiento es la pérdida final de entrenamiento (flow loss 0,0007-0,0008 en los últimos pasos registrados).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 1x NVIDIA B200, pero no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servicio mediante `scripts/serve_policy.py` del repositorio `tactile_base`, con el comando `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_gear_assembly_dagger --policy.dir checkpoints/openvtla_gear_assembly_dagger/r1/4999`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla-gear_assembly-dagger-r1` | pi0.5 + AnyTouch2 | gear_assembly (simulación) | DAgger + BC (flow matching), LoRA | other | Hugging Face |
| `yrpark/openvtla-gear_assembly` | pi0.5 + AnyTouch2 | gear_assembly (simulación) | BC (flow matching) | no disponible | Hugging Face |
| Otros modelos pi0.5/openpi | pi0.5 | manipulación general | variable | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea `gear_assembly` en simulación con GelSight Mini; no es transferible a otras tareas sin nuevo ajuste.
- Evaluación pendiente: no hay resultados de simulador ni de robot real, por lo que su rendimiento efectivo es desconocido.
- Datos DAgger limitados: solo 20 episodios y 8.593 frames, con desbalance en las etiquetas de evento (169 frente a 3.829 y 4.595), lo que puede sesgar la detección de bloqueos.
- Pérdida de entrenamiento muy baja (0,0007-0,0008) que puede indicar sobreajuste a los datos de ajuste; no se reporta validación.
- Licencia "other" sin texto visible: es imprescindible revisar los términos antes de cualquier uso comercial.
- No se documentan sesgos, idiomas ni capacidades de texto; las advertencias típicas de LLM (alucinación, sesgo lingüístico) no aplican directamente, pero sí el riesgo de comportamiento errático fuera de la distribución de entrenamiento.
- La cabeza de evento no se usa en inferencia, por lo que la señal de bloqueo no está disponible en tiempo de ejecución.
- Dependencia del framework `tactile_base` (commit 2038f06) y de la configuración `openvtla_gear_assembly_dagger` para reproducir el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Repositorio de código: https://github.com/YuriPark0123/tactile_base
- Documentación DAgger: `docs/dagger.md` en el repositorio `tactile_base`
