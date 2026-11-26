# yrpark/openvtla-insert_USB-dagger-r1

## Resumen

`yrpark/openvtla-insert_USB-dagger-r1` es un ajuste fino por DAgger del modelo base OpenVTLA `yrpark/openvtla-insert_USB`, desarrollado por el usuario yrpark. Se trata de una política robótica (no de un modelo de lenguaje de propósito general) construida sobre la arquitectura pi0.5 combinada con el módulo táctil AnyTouch2, orientada a la tarea simulada de inserción de un conector USB mediante un sensor GelSight Mini. El modelo se distribuye como checkpoint de entrenamiento para el framework `tactile_base`, no como pesos listos para inferencia con librerías estándar.

El modelo resuelve un problema concreto de manipulación robótica con realimentación táctil: la inserción precisa de un USB, tarea en la que la información visual resulta insuficiente y la señal táctil aporta la corrección necesaria. La contribución principal de esta revisión (r1) es la incorporación de datos DAgger (91 episodios, 14.956 fotogramas) mezclados al 50 % con demostraciones scriptadas, lo que permite al modelo recuperarse de estados de fallo capturados por un experto humano o script.

Es relevante en el contexto de investigación en robótica táctil y aprendizaje por imitación, ya que documenta un flujo completo de recogida de datos, etiquetado y ajuste fino con LoRA sobre un backbone preentrenado. El repositorio ocupa 6,4 GB e incluye solo el checkpoint final (paso 4999) con estadísticas de normalización; no se incluye el estado del optimizador. La evaluación en simulador está pendiente según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 + AnyTouch2 (modelo base OpenVTLA), ajuste fino con LoRA sobre gemma_2b_lora y gemma_300m_lora |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos; 18 tokens táctiles con cls_pool2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica, no lingüístico) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `yrpark/openvtla-insert_USB` en el paso 19999, conservando sus estadísticas de normalización. Sobre esa base se aplica un ajuste fino con adaptadores LoRA en dos módulos (gemma_2b_lora y gemma_300m_lora), lo que reduce el coste de entrenamiento manteniendo congelados los pesos del backbone. La arquitectura subyacente es pi0.5 (política visomotora) enriquecida con el módulo táctil AnyTouch2, que procesa señales de un sensor GelSight Mini y las condensa en 18 tokens táctiles mediante `cls_pool2`.

Los datos de entrenamiento combinan demostraciones scriptadas del conjunto `openvitac/insert_USB_gelsight` con datos DAgger de `openvitac/insert_USB_dagger_gelsight`, muestreados en proporción 50:50. El conjunto DAgger de esta revisión contiene 91 episodios y 14.956 fotogramas (60 segmentos de recuperación y 31 éxitos base), con etiquetas de evento de atasco (`event_jam`) distribuidas en 391 casos positivos, 809 negativos y el resto neutros. La función de pérdida es exclusivamente flow matching (behavior cloning), sin componente de RL. El entrenamiento se ejecutó durante 5.000 pasos con batch de 64, tasa de aprendizaje 2,5e-5 con decaimiento coseno hasta 2,5e-6 y 200 pasos de calentamiento, en una única NVIDIA B200 entre el 23 y el 24 de noviembre de 2026. La pérdida final de entrenamiento se situó en 0,0002-0,0003 en los últimos pasos registrados.

## Capacidades

- Control de política robótica para la tarea de inserción de USB en simulación con realimentación táctil.
- Procesamiento conjunto de observaciones visuales y señales táctiles de un sensor GelSight Mini.
- Recuperación de estados de fallo gracias a los datos DAgger, incluyendo segmentos de recuperación etiquetados.
- Predicción de acciones con horizonte de 50 pasos.
- Detección interna de eventos de atasco (`event_jam`) durante el entrenamiento; la cabeza de evento no se usa en inferencia.
- No soporta tool calling, agentes de texto, generación de código ni capacidades multilingües: es un modelo de acción motora, no un modelo de lenguaje.

## Casos de uso

- Investigación en inserción precisa con tacto: el modelo sirve como referencia reproducible para experimentos de ensamblaje tipo USB en simulador, con un pipeline documentado de recogida y etiquetado de datos DAgger.
- Estudio de recuperación ante fallos: los 60 segmentos de recuperación del conjunto DAgger permiten analizar cómo el ajuste fino mejora la capacidad de la política para salir de estados de atasco.
- Comparación de estrategias de mezcla de datos: la proporción 50:50 entre demostraciones scriptadas y DAgger es un punto de partida para experimentos sobre balance de datos en aprendizaje por imitación.
- Desarrollo de políticas táctiles sobre pi0.5: el checkpoint puede servir de inicialización para otras tareas de manipulación que requieran fusión visotáctil.
- Evaluación de frameworks de despliegue robótico: el modelo se sirve mediante `scripts/serve_policy.py` de `tactile_base`, útil para probar infraestructura de inferencia de políticas.
- Reproducción de experimentos: al incluir el log de entrenamiento y las estadísticas de normalización, permite replicar el ajuste fino con LoRA sobre el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente ("Simulator evaluation: pending"). El único dato de rendimiento reportado es la pérdida final de entrenamiento (flow matching) de 0,0002-0,0003 en los últimos pasos registrados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos.
- GPU de entrenamiento utilizada: 1x NVIDIA B200, con un tiempo de aproximadamente 3 horas para 5.000 pasos.
- GPU recomendadas para inferencia: no disponible; no se documentan requisitos mínimos ni perfiles de memoria.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas tipo RTX 4090.
- Opciones de despliegue: servidor de políticas de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_insert_USB_dagger --policy.dir checkpoints/openvtla_insert_USB_dagger/r1/4999`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Datos DAgger | Contexto / horizonte | Licencia | Estado |
|---|---|---|---|---|---|
| yrpark/openvtla-insert_USB-dagger-r1 | pi0.5 + AnyTouch2 | 91 episodios / 14.956 fotogramas | Horizonte 50 | other | Checkpoint publicado, evaluación pendiente |
| yrpark/openvtla-insert_USB | pi0.5 + AnyTouch2 | No (solo demostraciones scriptadas) | Horizonte 50 | other | Checkpoint base, paso 19999 |
| Otros modelos de política táctil | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea (inserción de USB) en simulación con un sensor concreto (GelSight Mini); no es generalizable sin reentrenamiento.
- La evaluación en simulador está pendiente, por lo que no hay evidencia publicada de éxito en la tarea tras el ajuste DAgger.
- No se incluye `train_state/`, solo `params/` y `assets/`; no es posible reanudar el entrenamiento desde este repositorio.
- La licencia es "other" y no se detallan sus términos; es necesario consultar el repositorio del autor antes de cualquier uso comercial.
- El conjunto DAgger es reducido (91 episodios) y con desbalance en las etiquetas de evento de atasco (391 positivos frente a 809 negativos), lo que puede limitar la robustez de la detección interna.
- No se documentan sesgos, idiomas ni comportamiento fuera de la distribución de entrenamiento; al ser una política motora, los riesgos se refieren a fallos de manipulación, no a sesgos lingüísticos.
- No hay información sobre cuantizaciones ni formatos alternativos de pesos, lo que dificulta el despliegue en hardware de consumo.
- El modelo depende del framework `tactile_base` (commit ed53407) y de la configuración `openvtla_insert_USB_dagger`; cambios en el código pueden romper la compatibilidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-insert_USB-dagger-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-insert_USB
- Repositorio de código tactile_base: https://github.com/YuriPark0123/tactile_base
- Dataset de datos DAgger y demostraciones: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Documentación del procedimiento DAgger: `docs/dagger.md` en el repositorio `tactile_base`
