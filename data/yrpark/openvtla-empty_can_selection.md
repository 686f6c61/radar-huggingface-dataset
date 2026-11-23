# yrpark/openvtla-empty_can_selection

## Resumen

`openvtla_empty_can_selection` es un checkpoint de política robótica (visión-lenguaje-acción, VLA) desarrollado por el usuario yrpark, que combina el modelo base pi0.5 con el encoder táctil AnyTouch2 bajo una reimplementación de estilo OpenVTLA. El modelo está entrenado para una única tarea de manipulación: la selección de latas vacías en un entorno simulado con sensores táctiles GelSight Mini, empleando 100 demostraciones del conjunto de datos OpenViTac.

Se trata de un artefacto de investigación más que de un modelo de propósito general: no es un modelo de lenguaje, sino una política de control entrenada con LoRA sobre los pesos de pi0.5 (componentes gemma_2b y gemma_300m) y un horizonte de acción de 50 pasos. Su relevancia radica en demostrar la integración de percepción táctil (18 tokens táctiles vía cls_pool2) en un pipeline VLA, un área activa de investigación en manipulación fina.

El repositorio ocupa 9,6 GB e incluye el checkpoint final de openpi (paso 19999) con pesos de inferencia, estado de entrenamiento para reanudar y estadísticas de normalización. No se ha publicado ninguna evaluación en simulador ni resultados de benchmarks, y el autor no declara idiomas soportados ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (transformer) con encoder táctil AnyTouch2 y LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `train_state/` para reanudar, `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, un VLA transformer que combina un backbone de lenguaje (gemma_2b y gemma_300m) con entradas visuales y táctiles para producir secuencias de acciones. Sobre esta base se añade AnyTouch2 como encoder táctil, que genera 18 tokens táctiles mediante `cls_pool2` a partir de lecturas de sensores GelSight Mini. El ajuste se realiza con LoRA, lo que mantiene congelados los pesos principales y entrena únicamente adaptadores de bajo rango.

El entrenamiento se ejecutó durante 20.000 pasos con batch efectivo de 64 (16 x 4 de acumulación de gradiente), semilla 42, LR coseno con pico 5e-5 y horizonte de 50 pasos. Se usaron 100 demostraciones del dataset OpenViTac `empty_can_selection` (revisión 5fb2757b88826917242adefd9196424ef8cf2d98) con características AnyTouch2 de checkpoint-4frames. El cómputo fue de aproximadamente 12,7 horas en una NVIDIA B200, con una pérdida final de entrenamiento de ~0,0003-0,0004. El código base es `tactile_base` (commit ed53407), con una ruta de entrenamiento idéntica al commit 57e0312 usado en otros modelos del mismo autor.

## Capacidades

- Generación de acciones de manipulación robótica para la tarea específica de selección de latas vacías en simulación.
- Percepción táctil integrada mediante 18 tokens de AnyTouch2 sobre sensores GelSight Mini.
- Percepción visual combinada con el backbone pi0.5 (entrada de imágenes de la escena).
- Control con horizonte de acción de 50 pasos.
- Entrenamiento con LoRA sobre gemma_2b y gemma_300m, lo que permite reanudar el ajuste con bajo coste.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Investigación en manipulación táctil: servir como baseline reproducible para comparar variantes de encoders táctiles en la tarea `empty_can_selection`, gracias a la configuración y semilla documentadas.
- Reentrenamiento y ablaciones: el checkpoint incluye `train_state/`, lo que permite reanudar el entrenamiento y probar cambios en el encoder táctil o en el dataset sin partir de cero.
- Evaluación de políticas VLA en simulación: desplegar la política con `serve_policy.py` para medir tasas de éxito en el simulador OpenViTac antes de transferir a un entorno real.
- Estudio de integración táctil en pipelines pi0.5: analizar cómo los 18 tokens táctiles afectan a la selección de acciones en tareas de agarre y clasificación de objetos.
- Reproducción de experimentos: validar la pérdida final (~0,0003-0,0004) y el pipeline de datos con la revisión concreta de OpenViTac, útil para verificar la reproducibilidad del entrenamiento.
- Base para transferencia a tareas similares: servir como punto de partida para ajustar la política a otras tareas de selección con sensores GelSight, reutilizando los adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo aún no se ha evaluado en el simulador y solo reporta la pérdida final de entrenamiento (~0,0003-0,0004).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 9,6 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU de entrenamiento documentada: 1x NVIDIA B200 durante ~12,7 horas para 20.000 pasos.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de openpi mediante `uv run scripts/serve_policy.py policy:checkpoint` con la configuración `openvtla_empty_can_selection` y el directorio del checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| openvtla_empty_can_selection | Selección de latas vacías (simulación, táctil) | no disponible | no disponible | other | No (no evaluado en simulador) |
| yrpark/openvtla-insert_USB | Inserción de USB (simulación, táctil) | no disponible | no disponible | other | no disponible |
| yrpark/openvtla-gear_assembly | Ensamblaje de engranajes (simulación, táctil) | no disponible | no disponible | other | no disponible |
| pi0.5 (modelo base) | VLA generalista | no disponible | no disponible | no disponible | no disponible |

Los dos modelos comparables pertenecen al mismo autor y comparten la ruta de entrenamiento base (commit 57e0312); se diferencian únicamente en el dataset y la tarea. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se ha evaluado en el simulador: la pérdida de entrenamiento baja no garantiza una tasa de éxito aceptable en la tarea.
- Entrenado con solo 100 demostraciones de una única tarea, lo que limita severamente su generalización a otras tareas u objetos.
- Depende de sensores GelSight Mini y del pipeline táctil AnyTouch2; no funcionará con otras configuraciones de hardware sin reentrenamiento.
- Licencia `other`: es necesario revisar los términos exactos del autor y de los modelos base (pi0.5, gemma) antes de cualquier uso comercial.
- Riesgo de sobreajuste al entorno simulado; no hay evidencia de transferencia a un entorno real.
- No se documentan idiomas soportados ni sesgos; al ser una política de control, los riesgos de alucinación de texto no aplican, pero sí los fallos de acción silenciosos.
- El checkpoint está pensado para la ruta `checkpoints/openvtla_empty_can_selection/baseline/19999` dentro de un checkout de `tactile_base`; moverlo fuera de esa estructura puede romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Repositorio de código tactile_base: https://github.com/YuriPark0123/tactile_base
- Modelo relacionado insert_USB: https://huggingface.co/yrpark/openvtla-insert_USB
- Modelo relacionado gear_assembly: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset OpenViTac: https://huggingface.co/datasets/FVL-Lab/OpenViTac
