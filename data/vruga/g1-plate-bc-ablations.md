# vruga/g1-plate-bc-ablations

## Resumen

`vruga/g1-plate-bc-ablations` es un conjunto de checkpoints de ablación para una política de imitación (behavior cloning) destinada al robot humanoide Unitree G1 en la tarea de transferencia de un plato, dentro del entorno de simulación BiGym. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de robótica que empaqueta pesos de PyTorch para control de bajo nivel, y su interés es fundamentalmente metodológico, ya que documenta resultados negativos y comparaciones controladas frente al modelo de referencia del mismo autor (`vruga/g1-plate-bc-expert`, con un 95,3 % de éxito agrupado).

El repositorio contiene tres familias de experimentos: `dagger_round1/` (una ronda de DAgger), `chunk50/` (políticas que predicen bloques de 50 acciones) y `discrete_head/` (una cabeza discreta simplificada con 256 bins). El autor advierte explícitamente de que estos checkpoints son ablaciones y no el modelo recomendado para uso práctico. El tamaño del repositorio es de 0,4 GB y la licencia es Apache 2.0.

La relevancia actual es doble: por un lado, aporta evidencia empírica sobre qué decisiones de diseño (etiquetado en DAgger, horizonte de predicción, tipo de cabeza de salida, guiado en inferencia) afectan al éxito de una política de imitación en manipulación diestra; por otro, sirve como referencia de comparación frente a un modelo fundacional de robótica como pi0.5, que en este entorno obtiene un 0 % de éxito en zero-shot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de behavior cloning; el autor menciona una "cabeza discreta" MLP con 256 bins y una "cabeza transformer / discrete-flow" del paper como experimento posterior, sin detallar la troncal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control robótico; horizonte de acción de 50 pasos en la variante `chunk50`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de PyTorch (`library_name: pytorch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la troncal. El autor describe tres variantes: una política entrenada con una ronda de DAgger, una política con predicción de chunks de 50 acciones y una política con cabeza discreta simplificada (MLP con 256 bins). Menciona además que la "cabeza transformer / discrete-flow" del paper es un experimento separado y posterior, lo que implica que la troncal del modelo de referencia podría ser de tipo transformer, pero no se confirma ni se dan dimensiones, número de capas ni presupuesto de cómputo.

El entrenamiento se realizó sobre el entorno BiGym con el robot Unitree G1. No se especifican el número de demostraciones, el número total de pasos de entrenamiento ni la composición del dataset. El autor sí documenta un fallo de implementación relevante: en la ronda 1 de DAgger, las etiquetas del experto en ventanas iniciadas por el estudiante se anclaron al propio comando del estudiante, lo que degradó el resultado (76,7 % y 83,3 % de éxito frente al 95,3 % del experto). También se probó guiado en inferencia sobre la cabeza discreta, con colapso del rendimiento (1,7 % con guía 1 y 0,0 % con guía 2).

## Capacidades

- Control de manipulación robótica para la tarea concreta de transferencia de un plato con el Unitree G1 en BiGym.
- Predicción de acciones en bloques de 50 pasos en la variante `chunk50`, lo que reduce la frecuencia de replanificación.
- Política de imitación entrenada con behavior cloning y una ronda de DAgger.
- Variante con cabeza discreta de 256 bins para acciones discretizadas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente conversacional.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- No es un modelo de propósito general: su dominio de validez es la tarea y el entorno para los que fue entrenado.

## Casos de uso

- Estudio de ablación en investigación: comparar el efecto del horizonte de predicción (chunks de 50 frente a acción a acción) sobre la tasa de éxito en una tarea de manipulación, usando los checkpoints `chunk50/` y los resultados publicados en la model card.
- Análisis de fallos de DAgger: reproducir la ronda 1 con el fallo de etiquetado documentado para entender cómo el anclaje de etiquetas al comando del estudiante degrada la política y diseñar una corrección.
- Evaluación de cabezas de salida: contrastar una cabeza discreta simplificada (MLP, 256 bins) frente a cabezas continuas o discrete-flow en términos de éxito por ranura (slot) del entorno.
- Referencia negativa en publicaciones: citar estos resultados como evidencia de que el guiado en inferencia puede colapsar una política discreta mal calibrada (0,0 % con guía 2).
- Protocolo de evaluación reproducible: reutilizar los informes crudos de `reports/` y el registro `EXPERIMENTS.md` como plantilla para documentar ablaciones con semillas, número de ensayos y éxito por ranura.
- Comparación con modelos fundacionales: usar el resultado de pi0.5 zero-shot (0/30) como línea base para justificar el entrenamiento específico por robot y por layout de acciones.

## Benchmarks y rendimiento

Resultados de evaluación publicados por los autores en la model card (semillas 7.310.000+ y 7.320.000+, 30 o 60 ensayos según el caso):

| Configuración | Semillas | Ensayos | Éxito | Por ranura 1..6 |
|---|---|---|---|---|
| DAgger ronda 1, público, execute 20 | 7.310.000+ | 30 | 23 (76,7 %) | 4,4,5,3,4,3 |
| DAgger ronda 1, execute 20 | 7.320.000+ | 60 | 50 (83,3 %) | 10,8,10,8,9,5 |
| Chunks de 50 pasos, execute 20 | 7.320.000+ | 60 | 57 (95,0 %) | 10,9,10,10,9,9 |
| Chunks de 50 pasos, execute 35 | 7.320.000+ | 60 | 59 (98,3 %) | 10,10,10,10,10,9 |
| Chunks de 50 pasos, execute 50 | 7.320.000+ | 60 | 59 (98,3 %) | 10,10,10,10,10,9 |
| Cabeza discreta (simplificada), execute 5 | 7.320.000+ | 60 | 8 (13,3 %) | 1,2,2,2,1,0 |
| Cabeza discreta (simplificada), execute 10 | 7.320.000+ | 60 | 13 (21,7 %) | 1,4,2,4,0,2 |
| Cabeza discreta (simplificada), execute 20 | 7.320.000+ | 60 | 21 (35,0 %) | 2,4,2,6,6,1 |
| Cabeza discreta + guía 1, execute 20 | 7.320.000+ | 60 | 1 (1,7 %) | 0,0,0,1,0,0 |
| Cabeza discreta + guía 2, execute 20 | 7.320.000+ | 60 | 0 (0,0 %) | 0,0,0,0,0,0 |
| pi0.5 zero-shot (`lerobot/pi05_base`), público | 7.310.000+ | 30 | 0 (0,0 %) | 0,0,0,0,0,0 |

Referencia del autor: el mejor modelo (`vruga/g1-plate-bc-expert`) obtiene 59/60 en semillas 7.320.000+ con execute 20.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB en total e incluye varios checkpoints, por lo que cada checkpoint individual es previsiblemente pequeño, pero no se publican recuentos de parámetros ni huella de memoria.
- GPU recomendadas: no disponible. Para control robótico en tiempo real se suele requerir una GPU de gama media o incluso CPU, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible, pero no está confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a una política de control). El artefacto se distribuye como pesos de PyTorch para cargar con PyTorch directamente.
- Latencia y throughput: no disponibles. La variante `chunk50` predice 50 acciones por inferencia, lo que reduce la frecuencia de cómputo necesaria, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Éxito en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vruga/g1-plate-bc-ablations` | Política BC con ablaciones | no disponible | no aplica | 13,3 %–98,3 % según variante | Apache 2.0 | Hugging Face |
| `vruga/g1-plate-bc-expert` | Política BC de referencia | no disponible | no aplica | 95,3 % agrupado; 59/60 en execute 20 | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` (pi0.5) | Modelo fundacional de robótica | no disponible | no disponible | 0/30 en zero-shot en este entorno | no disponible en la información | Hugging Face |

La comparación es limitada: no se dispone de parámetros, contexto ni detalles de arquitectura de ninguno de los tres artefactos. La diferencia clave es que pi0.5 no ha visto el layout de acciones de este robot, mientras que las políticas de `vruga` están entrenadas específicamente para la tarea y el embodiment.

## Limitaciones y advertencias

- El propio autor indica que estos checkpoints son ablaciones y no el modelo recomendado; para uso práctico debe emplearse `vruga/g1-plate-bc-expert`.
- La ronda 1 de DAgger contiene un fallo de etiquetado reconocido: las etiquetas del experto en ventanas iniciadas por el estudiante se anclaron al comando del estudiante, lo que invalida esa variante como referencia de calidad.
- La cabeza discreta simplificada (MLP, 256 bins) rinde muy por debajo de las alternativas (35,0 % en el mejor caso) y el guiado en inferencia la colapsa hasta el 0,0 %.
- El modelo está sobreajustado a la tarea de transferencia de plato, al robot Unitree G1 y al simulador BiGym; no se documenta transferencia a hardware real ni a otras tareas.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de los resultados por ranura, que muestran degradación en la ranura 6 en varias configuraciones.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una política específica de una tarea y un simulador, su aplicabilidad comercial directa es muy reducida.
- No se especifican requisitos de hardware, latencia ni procedimiento de despliegue, lo que dificulta una puesta en producción sin trabajo adicional de ingeniería.
- El repositorio no incluye información sobre el número de demostraciones, el presupuesto de entrenamiento ni la composición del dataset, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vruga/g1-plate-bc-ablations
- Modelo de referencia del mismo autor: https://huggingface.co/vruga/g1-plate-bc-expert
- Modelo fundacional comparado (pi0.5): https://huggingface.co/lerobot/pi05_base
- Entorno BiGym: no disponible en la información proporcionada
- Paper de referencia citado por el autor (cabeza transformer / discrete-flow): no disponible en la información proporcionada
- Informes crudos (`reports/`) y registro de experimentos (`EXPERIMENTS.md`): incluidos en el repositorio del modelo
