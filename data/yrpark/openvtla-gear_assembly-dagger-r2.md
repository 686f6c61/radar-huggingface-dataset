# yrpark/openvtla-gear_assembly-dagger-r2

## Resumen

openvtla-gear_assembly-dagger-r2 es un checkpoint de robótica manipulativa resultante de un fine-tune con DAgger sobre el modelo base OpenVTLA `yrpark/openvtla-gear_assembly`. El modelo combina la política pi0.5 (una política vision-language-action basada en flow matching) con el encoder táctil AnyTouch2 y se entrena sobre la simulación OpenViTac en la tarea `gear_assembly` con sensores GelSight Mini. Lo desarrolla el usuario yrpark y se apoya en el framework `tactile_base`.

La relevancia de este checkpoint es metodológica: no es un modelo fundacional nuevo, sino una iteración de ajuste fino (r2) que incorpora datos de recuperación recolectados mediante DAgger (Dataset Aggregation) para corregir fallos de la política base en episodios de ensamblaje bloqueados. El repo pesa 6,4 GB e incluye únicamente el checkpoint final de openpi en `4999/` (parámetros y estadísticas de normalización), sin estado de entrenamiento.

El entrenamiento se realizó con 5.000 pasos, batch de 64, LR 2,5e-5 con decaimiento coseno y LoRA sobre los módulos gemma_2b_lora y gemma_300m_lora, con un horizonte de 50 pasos y 18 tokens táctiles. La evaluación en simulador está pendiente según la model card, por lo que no hay métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi0.5) con encoder táctil AnyTouch2; fine-tune LoRA sobre gemma_2b_lora y gemma_300m_lora |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos; 18 tokens táctiles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de términos en la model card) |
| Formato de pesos | checkpoint openpi (`4999/` con `params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una política vision-language-action que genera acciones mediante flow matching, y le añade percepción táctil a través de AnyTouch2 con tokens táctiles agregados por cls_pool2 (18 tokens). El fine-tune se aplica con LoRA sobre los adaptadores gemma_2b_lora y gemma_300m_lora, congelando el resto de los pesos, lo que explica el tamaño relativamente contenido del repo (6,4 GB) frente a un modelo completo.

Los datos de entrenamiento combinan demos scripted de `openvitac/gear_assembly_gelsight` y datos DAgger de `openvitac/gear_assembly_dagger_gelsight`, muestreados 50:50. El conjunto DAgger r1+r2 suma 44 episodios y 15.118 frames (39 segmentos de recuperación y 5 éxitos base), con distribución de la señal `event_blocked` de 406 valores 1, 4.705 valores -1 y 10.007 valores 0. La función de pérdida es exclusivamente flow matching (behavior cloning), sin RLHF ni DPO. El entrenamiento corrió 5.000 pasos en una NVIDIA B200 durante aproximadamente 3 horas, alcanzando una pérdida final de 0,0008-0,0009 en los últimos pasos registrados. La cabeza de evento (`event head`) se usa solo durante el entrenamiento; la inferencia es idéntica a la del modelo base.

## Capacidades

- Manipulación robótica de precisión: ensamblaje de engranajes en simulación con realimentación táctil GelSight Mini.
- Percepción táctil multimodal: integra señales visuales y táctiles mediante AnyTouch2 para detectar contacto y bloqueos.
- Generación de acciones por flow matching con horizonte de 50 pasos.
- Recuperación de fallos: los datos DAgger están diseñados para que la política aprenda a salir de estados bloqueados (`event_blocked`).
- Integración con el ecosistema openpi y el framework `tactile_base` para servir políticas.
- No se documentan capacidades de tool calling, agentes multi-step, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Ensamblaje automatizado en simulación: la política ejecuta la tarea `gear_assembly` con entrada visual y táctil, adecuada para prototipar control fino antes de transferir a hardware real.
- Investigación en aprendizaje por imitación: sirve como checkpoint reproducible para estudiar el efecto de DAgger frente a behavior cloning puro en tareas de contacto.
- Detección de estados bloqueados: la señal `event_blocked` y los segmentos de recuperación permiten analizar estrategias de salida de atascos mecánicos.
- Benchmarking de políticas táctiles: al compartir base con `openvtla-gear_assembly`, permite comparaciones controladas de variantes de fine-tune.
- Desarrollo de pipelines de recolección de datos: el repo de datos `yrpark/openvitac-openvtla-data` y la documentación `docs/dagger.md` facilitan replicar el procedimiento de etiquetado.
- Despliegue con openpi: el checkpoint `4999/` se sirve directamente con `scripts/serve_policy.py` en un checkout de `tactile_base`, útil para entornos de evaluación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en simulador está pendiente y solo reporta la pérdida de entrenamiento final (0,0008-0,0009, flow loss).

## Requisitos de hardware

- VRAM estimada: no disponible; el repo de 6,4 GB sugiere que el checkpoint completo cabe en GPUs con al menos 8-12 GB, pero no se confirma.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; para inferencia no se especifican requisitos.
- GPU de consumo: no confirmado; depende del tamaño real de los pesos pi0.5 + LoRA, no documentado.
- Despliegue: openpi mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_gear_assembly_dagger --policy.dir checkpoints/openvtla_gear_assembly_dagger/r2/4999`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla-gear_assembly-dagger-r2 (este) | no disponible | no disponible (horizonte 50) | sin benchmarks; loss 0,0008-0,0009 | other | Hugging Face, 0 descargas |
| yrpark/openvtla-gear_assembly (base) | no disponible | no disponible | no disponible | other | Hugging Face |
| pi0.5 (política base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (`gear_assembly`); no hay evidencia de transferencia a hardware real.
- Evaluación en simulador pendiente: no existen métricas de tasa de éxito publicadas.
- Dataset DAgger pequeño (44 episodios, 15.118 frames), con posible sobreajuste a la distribución recolectada.
- La licencia "other" no detalla condiciones de uso comercial; debe revisarse antes de cualquier despliegue productivo.
- El checkpoint no incluye `train_state/`, lo que impide reanudar el entrenamiento desde el repo.
- La cabeza de evento es solo de entrenamiento; la inferencia no expone esa señal directamente.
- Riesgo de alucinación no aplicable en el sentido de texto, pero la política puede generar acciones inválidas fuera de la distribución de entrenamiento.
- Idiomas y sesgos no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger-r2
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Framework tactile_base: https://github.com/YuriPark0123/tactile_base
- Documentación DAgger: `docs/dagger.md` en el repositorio tactile_base
- Código de entrenamiento: tactile_base commit 3294407
