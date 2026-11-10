# vruga/g1-plate-bc-expert

## Resumen

`g1-plate-bc-expert` es una política de imitación (behaviour cloning) para robótica manipulativa, publicada por el usuario vruga en Hugging Face. Resuelve una tarea concreta: la transferencia de un plato entre ranuras equilibradas (protocolo *balanced-slot*) con el robot humanoide Unitree G1 equipado con pinzas Dex1, dentro del entorno de simulación BiGym2 (`move_plate`). No es un modelo de lenguaje: es una red neuronal que mapea imágenes y propriocepción a secuencias de acciones motoras.

La política combina un backbone ResNet18 compartido sobre tres cámaras a resolución 84x84 con un vector de propriocepción de 50 dimensiones, y emite *chunks* de 20 pasos de acciones de 20 dimensiones. Se entrenó con pérdida L1, aumento por desplazamiento aleatorio (*random-shift augmentation*) y media móvil exponencial (EMA) de pesos durante 60.000 pasos. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato PyTorch (`.pt`).

Su relevancia es acotada pero técnica: sirve como referencia reproducible para evaluar políticas de imitación en BiGym2 con el robot G1, y documenta de forma transparente una práctica controvertida en el campo, el uso de un experto scriptado privilegiado durante el entrenamiento (que lee poses verdaderas del simulador) combinado con demostraciones humanas. El autor declara una tasa de éxito agrupada del 95,9% (259/270 ensayos), aunque los resultados no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet18 compartida sobre 3 cámaras (84x84) + MLP sobre propriocepción de 50 dimensiones; cabeza que emite chunk de 20 pasos x 20 dimensiones de acción |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (entrenado y distribuido en precisión nativa PyTorch) |
| Idiomas soportados | no aplica (modelo de robótica sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), cargado mediante `model.py` / `bc_policy.py` |

## Arquitectura y entrenamiento

La arquitectura es una política de imitación visual-motora: un ResNet18 compartido procesa tres vistas de cámara a 84x84 píxeles, cuya representación se concatena con un vector de propriocepción de 50 dimensiones. La salida es un *action chunk* de 20 pasos con acciones de 20 dimensiones, entrenado con pérdida L1. El entrenamiento usó 60.000 pasos con aumento por desplazamiento aleatorio y EMA de pesos. El checkpoint se carga con `BC_CHECKPOINT=model.pt BC_EXECUTE=20 advaitic-eval --policy submission.bc_policy:make_policy ...`, lo que exige el repositorio de evaluación del autor.

El dato más relevante es la composición del dataset: 60 demostraciones humanas (13% de los fotogramas) más 298 episodios generados por un **experto scriptado privilegiado** que lee las poses verdaderas del plato y la estantería del simulador. Ese experto solo interviene en entrenamiento y nunca es la política evaluada; la política en inferencia solo ve `rgb` y `state`. Las semillas del experto (5.000.000+) son disjuntas de todos los bloques de evaluación. El autor reporta que el entrenamiento solo con datos humanos alcanza el 78% en las semillas 7.320.000+ con `execute 20`, frente al 98,3% de este modelo con el experto privilegiado, lo que cuantifica la contribución del dato privilegiado.

## Capacidades

- Control motor visomotor para la tarea de transferencia de plato entre seis ranuras equilibradas con el Unitree G1 y pinzas Dex1.
- Percepción multimodal limitada: tres cámaras RGB a 84x84 más propriocepción de 50 dimensiones.
- Emisión de secuencias de acción en *chunks* de 20 pasos (20 dimensiones por acción), con sensibilidad fuerte a la longitud de ejecución.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- **Referencia reproducible en BiGym2**: usar el checkpoint como línea base para comparar nuevas políticas de imitación en la tarea `move_plate` con el protocolo *balanced-slot*, gracias a que el autor publica semillas, número de ensayos y desglose por ranura.
- **Estudio del sesgo de datos privilegiados**: comparar este modelo (con experto scriptado) frente al modelo compañero entrenado solo con humanos (78% en las mismas semillas) para medir cuánto aporta el dato privilegiado en tareas de manipulación fina.
- **Ablación de longitud de ejecución**: el autor documenta que con los mismos pesos, `execute 5` rinde 50,0%, `execute 10` un 73,3% y `execute 20` un 90,0% en las semillas públicas; sirve para estudiar el efecto del *action chunking* en el éxito de la tarea.
- **Validación de pipelines de evaluación robótica**: integrar el modelo en el repositorio `advaitic-eval` para probar la infraestructura de evaluación, los informes en `reports/` y la reproducibilidad de semillas antes de desplegar políticas propias.
- **Docencia e investigación en imitación visual-motora**: usar la arquitectura ResNet18 + propriocepción + chunk de acciones como ejemplo mínimo y bien documentado de *behaviour cloning* para robótica humanoide.
- **Punto de partida para *fine-tuning* en el simulador**: reentrenar o adaptar la política a variantes de la tarea (otras posiciones de ranura, otros objetos) partiendo de los pesos publicados y de la receta de 60.000 pasos con EMA y *random-shift*.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente; el propio autor indica que requiere una reejecución por un revisor sobre una copia limpia para ser una afirmación cualificada). Tarea: G1 plate transfer, BiGym2 `move_plate`, protocolo *balanced-slot*.

| Semillas | Ensayos | Éxito | Por ranura 1..6 |
|---|---|---|---|
| 7.310.000+ (públicas) | 30 | 27 (90,0%) | 5,5,5,4,3,5 |
| 7.320.000+ | 60 | 59 (98,3%) | 10,10,10,9,10,10 |
| 7.330.000+ | 60 | 57 (95,0%) | 10,10,10,9,9,9 |
| 7.340.000+ | 60 | 59 (98,3%) | 10,10,10,10,10,9 |
| 7.350.000+ | 60 | 57 (95,0%) | 10,10,9,9,9,10 |
| **Agrupado** | **270** | **259 (95,9%)** | — |

El autor señala que todos los fallos son *timeouts*: 0 caídas y 0 errores de política. La longitud de ejecución afecta de forma drástica con los mismos pesos:

| Configuración | Semillas | Ensayos | Éxito |
|---|---|---|---|
| execute 5 | 7.310.000+ | 30 | 15 (50,0%) |
| execute 10 | 7.310.000+ | 30 | 22 (73,3%) |
| execute 20 | 7.310.000+ | 30 | 27 (90,0%) |
| execute 5 | 7.320.000+ | 60 | 29 (48,3%) |
| execute 10 | 7.320.000+ | 60 | 47 (78,3%) |
| execute 20 | 7.320.000+ | 60 | 59 (98,3%) |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un ResNet18 y tres cámaras a 84x84 más un MLP pequeño, el modelo es muy ligero (repositorio de 0,1 GB), por lo que cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte PyTorch CUDA es suficiente. Para entrenamiento o evaluación a gran escala de semillas, una RTX 3090/4090 o A100 acelera la recolección de episodios.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; el cuello de botella real es la simulación BiGym2, no la red.
- Opciones de despliegue: PyTorch nativo con el repositorio de evaluación `advaitic-eval` (variables `BC_CHECKPOINT` y `BC_EXECUTE`); no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles. La latencia relevante es la del bucle de simulación y la frecuencia de control del entorno BiGym2, no la del *forward pass* de la red.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Éxito declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| g1-plate-bc-expert (este) | BiGym2 `move_plate`, G1 + Dex1 | no disponible | no aplica | 95,9% agrupado (270 ensayos) | Apache 2.0 | Hugging Face, pesos PyTorch |
| Modelo compañero solo-humano (mismo autor) | BiGym2 `move_plate`, G1 + Dex1 | no disponible | no aplica | 78% en semillas 7.320.000+ (execute 20) | Apache 2.0 (según *model card*) | Hugging Face |
| Otras políticas de imitación en BiGym2 | Manipulación humanoide | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos públicos comparables de otras políticas en la misma tarea y protocolo dentro de la información proporcionada.

## Limitaciones y advertencias

- **Resultados no verificados**: el propio autor marca los resultados como `verified: false` y exige una reejecución por un revisor sobre una copia limpia para cualificar la afirmación del 95,9%.
- **Dependencia de datos privilegiados**: el 87% de los fotogramas de entrenamiento provienen de un experto scriptado que lee poses verdaderas del simulador; la política no ve esas poses en inferencia, pero el rendimiento en el mundo real puede degradarse respecto al simulado.
- **Sensibilidad a la longitud de ejecución**: con los mismos pesos, el éxito cae del 90,0% (`execute 20`) al 50,0% (`execute 5`) en las semillas públicas; el valor de `execute 20` se eligió tras inspeccionar el bloque público y confirmar en los otros dos, lo que introduce riesgo de sobreajuste al protocolo de evaluación.
- **Alcance muy estrecho**: una sola tarea (transferencia de plato entre seis ranuras) y un solo robot (Unitree G1 con pinzas Dex1); no generaliza a otras tareas de manipulación sin reentrenamiento.
- **Todos los fallos son *timeouts***: no hay caídas ni errores de política, pero el modelo puede no completar la tarea dentro del límite temporal, lo que es relevante en producción.
- **Sin capacidades lingüísticas ni de razonamiento simbólico**: no es un modelo de lenguaje y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución; conviene revisar las dependencias del repositorio de evaluación `advaitic-eval` y de BiGym2, que pueden tener licencias propias.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico; el riesgo equivalente es la ejecución de acciones no deseadas ante distribuciones visuales fuera de las vistas en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vruga/g1-plate-bc-expert
- Repositorio de evaluación `advaitic-eval`: no disponible como enlace directo en la información proporcionada (se referencia por nombre en la *model card*)
- Entorno BiGym2: no disponible como enlace directo en la información proporcionada
- Informe de experimentos (`EXPERIMENTS.md`) y carpeta `reports/`: incluidos en el repositorio del modelo, sin URL directa en la información proporcionada
- Paper o blog del autor: no disponible
