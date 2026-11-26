# yrpark/openvtla-gear_assembly-dagger_event-r1

## Resumen

openvtla_gear_assembly_dagger_event (r1) es un fine-tune del modelo base OpenVTLA `yrpark/openvtla-gear_assembly`, desarrollado por el usuario yrpark. Se trata de una política visomotora-táctil para robótica construida sobre la arquitectura pi0.5 combinada con el encoder táctil AnyTouch2, entrenada para la tarea de ensamblaje de engranajes (`gear_assembly`) en simulación con sensores GelSight Mini. El ajuste se realiza mediante DAgger (Dataset Aggregation) sobre el checkpoint base en el paso 19999, incorporando datos de recuperación de errores para mejorar la robustez de la política ante desviaciones del estado deseado.

El modelo resuelve el problema de la fragilidad de las políticas de imitación puras: los datos de demostración scripted no cubren los estados de fallo, por lo que una política entrenada solo con ellos no sabe recuperarse. DAgger introduce segmentos de recuperación etiquetados por un experto, y este fine-tune añade además una cabeza de eventos táctiles (`event_blocked`) que se entrena con una pérdida BCE sobre tokens táctiles proyectados y agrupados. La inferencia es idéntica a la del modelo base, ya que la cabeza de eventos es exclusiva de entrenamiento.

El repositorio ocupa 6,4 GB e incluye el checkpoint final en formato openpi (`4999/`), con los parámetros para inferencia y las estadísticas de normalización (`assets/`). La licencia es "other" y no se declaran idiomas soportados, lo cual es coherente con un modelo de política robótica que no procesa lenguaje natural de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (política visomotora) + encoder táctil AnyTouch2; fine-tune con LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | horizonte de acción de 50 pasos; 18 tokens táctiles (cls_pool2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no de lenguaje) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` + `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `yrpark/openvtla-gear_assembly` en el paso 19999, conservando sus estadísticas de normalización. La arquitectura subyacente es pi0.5, una política visomotora para control robótico, a la que se incorpora el encoder táctil AnyTouch2 para procesar lecturas de sensores GelSight Mini en simulación. El fine-tune se aplica con LoRA sobre los módulos gemma_2b_lora y gemma_300m_lora, lo que permite adaptar el modelo con un coste computacional reducido.

El entrenamiento combina dos objetivos: flow matching para el comportamiento de imitación (BC) y una cabeza de eventos táctiles que aplica BCE sobre los tokens táctiles proyectados y agrupados (L2-normalizados, proyección lineal, temperatura 0.1, inicialización a cero), con peso 0.1 y peso positivo 5.0 sobre la etiqueta `event_blocked`. Los datos mezclan al 50:50 demostraciones scripted (`openvitac/gear_assembly_gelsight`) y datos DAgger (`openvitac/gear_assembly_dagger_gelsight`), con 20 episodios y 8.593 fotogramas en r1 (16 segmentos de recuperación y 4 éxitos base); los fotogramas de demostración se etiquetan como 0 en la cabeza de eventos. Se entrenaron 5.000 pasos con batch 64, LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 y warmup de 200 pasos, en una NVIDIA B200 durante aproximadamente 3 horas. La pérdida final de entrenamiento se sitúa en 0,0027-0,0033 en los últimos pasos registrados.

## Capacidades

- Control robótico visomotor para tareas de ensamblaje de engranajes en simulación.
- Fusión de percepción visual y táctil mediante el encoder AnyTouch2 y sensores GelSight Mini.
- Recuperación ante estados de bloqueo o error, gracias a los segmentos de recuperación introducidos por DAgger.
- Detección interna de eventos táctiles de bloqueo (`event_blocked`) durante el entrenamiento; no se usa en inferencia.
- Generación de secuencias de acción con horizonte de 50 pasos.
- No se declaran capacidades de lenguaje natural, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Ensamblaje de precisión en simulación: la política ejecuta la inserción de engranajes usando realimentación visual y táctil, adecuada para estudiar estrategias de manipulación fina antes de transferir a hardware real.
- Investigación en aprendizaje por imitación con recuperación: el modelo sirve como referencia para comparar políticas entrenadas solo con demostraciones frente a políticas con DAgger, midiendo la robustez ante perturbaciones.
- Desarrollo de pipelines de entrenamiento DAgger: el repositorio y el código `tactile_base` permiten reproducir la recolección y etiquetado de segmentos de recuperación documentados en `docs/dagger.md`.
- Evaluación de fusión táctil en políticas visomotoras: permite analizar el efecto de los 18 tokens táctiles y de la cabeza de eventos en tareas donde el contacto es crítico.
- Base para fine-tunes en otras tareas de ensamblaje: al conservar las estadísticas de normalización y el formato openpi, se puede reutilizar como punto de partida para tareas similares con sensores GelSight.
- Despliegue en entornos de simulación con servidor de políticas: el checkpoint se sirve con `scripts/serve_policy.py` de tactile_base, lo que facilita la integración en bucles de evaluación automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en simulador está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 6,4 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint` con la configuración `openvtla_gear_assembly_dagger_event`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / horizonte | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla_gear_assembly_dagger_event (r1) | pi0.5 + AnyTouch2, LoRA | Horizonte 50, 18 tokens táctiles | Demos scripted + DAgger 50:50 | other | Hugging Face |
| yrpark/openvtla-gear_assembly (base) | pi0.5 + AnyTouch2 | Horizonte 50 | Demos scripted | other | Hugging Face |
| Políticas pi0.5 genéricas | pi0.5 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico para una única tarea (`gear_assembly`) y un único tipo de sensor (GelSight Mini) en simulación; no es generalizable sin fine-tune.
- La evaluación en simulador está pendiente, por lo que no hay evidencia publicada de rendimiento en la tarea.
- La cabeza de eventos táctiles solo se usa durante el entrenamiento; en inferencia no aporta señal explícita de bloqueo.
- Los datos DAgger de r1 son reducidos (20 episodios, 8.593 fotogramas), lo que puede limitar la cobertura de estados de recuperación.
- Licencia "other": es necesario revisar los términos concretos antes de cualquier uso comercial.
- No se declaran idiomas ni capacidades de lenguaje; no debe emplearse como modelo de texto.
- Riesgo de sobreajuste a la distribución de simulación y a las condiciones de los sensores simulados; la transferencia a hardware real no está documentada.
- No se incluye `train_state/` en el checkpoint, lo que impide reanudar el entrenamiento tal cual desde el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger_event-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Código tactile_base: https://github.com/YuriPark0123/tactile_base
