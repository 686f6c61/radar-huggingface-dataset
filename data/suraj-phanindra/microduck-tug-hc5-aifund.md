# suraj-phanindra/microduck-tug-hc5-aifund

## Resumen

`microduck-tug-hc5-aifund` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollada por el usuario suraj-phanindra como un fine-tune del modelo `GinDuck/microduck-tug-titan-league`. No es un modelo de lenguaje: se trata de una red neuronal de política (policy network) entrenada por aprendizaje por refuerzo que genera comandos de locomoción a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones, emitiendo 14 acciones de control. El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación derivado de un modelo base de la comunidad, con cero descargas y cero likes en el momento de la consulta, y sin model card sustantiva más allá de una descripción breve del proceso de selección de pesos. El autor indica que la política se obtuvo mediante una pequeña perturbación de pesos elegida por búsqueda aleatoria y validada en combates nuevos dentro del simulador Arena, partiendo de la tabla de ratings de otro modelo (`jrubiosainz/microduck-tug-h7p1b-aa128e6e`).

No se dispone de información sobre arquitectura concreta de la red, número de parámetros, datos de entrenamiento ni licencia. La ficha se completa con los datos disponibles y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (detalles de capas no disponibles); entrada de 61 dimensiones, salida de 14 acciones, frecuencia de 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye como ONNX (presumiblemente FP32, no confirmado) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, función de activación ni tamaño del espacio latente). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en el fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), lo que sitúa el pipeline en el ecosistema oficial de aprendizaje por refuerzo de microduck. El modelo es un fine-tune de `GinDuck/microduck-tug-titan-league`: el autor aplicó una perturbación pequeña de pesos seleccionada por búsqueda aleatoria y validada sobre combates nuevos en el simulador Arena. La tabla de ratings de referencia proviene de `jrubiosainz/microduck-tug-h7p1b-aa128e6e`, con las últimas acciones de cada combate de rating escaladas por semilla. No se indica el número de tokens, episodios ni pasos de entrenamiento, ni si hubo fases de RLHF o DPO (conceptos que, por otra parte, no aplican a una política de control).

## Capacidades

- Generación de comandos de locomoción para el robot microduck a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Política "perpetua": el autor la describe como una marcha (gait) que se ejecuta de forma continua hasta que se detiene explícitamente, pensada para cargarse en una ranura de política del robot.
- Integración directa con el daemon de microduck mediante `robotctl policy load <slot> <repo>`.
- Normalización de observaciones integrada en el grafo ONNX, lo que elimina la necesidad de replicar el pipeline de preprocesado en el cliente.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni percepción multimodal.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en una ranura mediante `robotctl policy load` y ejecutar una marcha continua para pruebas de desplazamiento sobre superficies planas, aprovechando que la política está pensada para funcionar de forma indefinida.
- Evaluación comparativa de políticas en el simulador Arena: usar el modelo como contendiente en combates de rating frente a otras políticas de la liga microduck, dado que el autor lo validó precisamente sobre combates nuevos en dicho simulador.
- Punto de partida para fine-tuning adicional: al ser un fine-tune con perturbación pequeña de pesos sobre `GinDuck/microduck-tug-titan-league`, sirve como inicialización para experimentos de búsqueda aleatoria o evolución de políticas en el repositorio `microduck_rl`.
- Docencia y divulgación en robótica de refuerzo: el modelo permite ilustrar el ciclo completo de entrenamiento, exportación a ONNX y despliegue en hardware real con una interfaz mínima (un fichero ONNX y un manifiesto JSON).
- Pruebas de integración del daemon de microduck: validar el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md`) y el flujo de carga de políticas en una instalación recién configurada.
- Reproducción de experimentos de perturbación de pesos: el enfoque de búsqueda aleatoria validada en el simulador es replicable con este modelo como referencia base para medir la sensibilidad de la política a perturbaciones pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona validación sobre combates nuevos en el simulador Arena y una tabla de ratings heredada de `jrubiosainz/microduck-tug-h7p1b-aa128e6e`, pero no se aportan cifras concretas de puntuación, tasa de éxito ni métricas de locomoción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control de tamaño presumiblemente pequeño, la huella debería ser mínima, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La inferencia vía ONNX puede ejecutarse en CPU o en GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue previsto es en el propio robot microduck, no en un servidor.
- Opciones de despliegue: runtime ONNX a través del daemon de microduck (`robotctl policy load`), que consume `policy.onnx` y `manifest.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; la política opera a 50 Hz por requisito de la interfaz, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Origen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-tug-hc5-aifund` | Política RL (fine-tune) | 61 obs / 14 acciones / 50 Hz | Fine-tune de `GinDuck/microduck-tug-titan-league` | no disponible | Hugging Face, 0 descargas |
| `GinDuck/microduck-tug-titan-league` | Política RL (base) | 61 obs / 14 acciones / 50 Hz (según modelo derivado) | GinDuck | no disponible | Hugging Face |
| `jrubiosainz/microduck-tug-h7p1b-aa128e6e` | Política RL | no disponible | jrubiosainz | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan sesgos, distribución de entrenamiento, condiciones de fallo ni métricas de robustez.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier despliegue en producción.
- Cero descargas y cero likes: no hay evidencia de uso por terceros ni de validación independiente fuera del simulador del autor.
- Validación limitada al simulador Arena: no se documenta evaluación en hardware real más allá de la afirmación de que la política está pensada para ejecutarse en el robot.
- Sin información sobre el dominio de observaciones: se desconoce si la política generaliza a superficies, cargas o perturbaciones distintas de las del entrenamiento.
- El normalizador está embebido en el ONNX: alimentar observaciones ya normalizadas produciría comandos incorrectos; es un error fácil de cometer en integraciones propias.
- Modelo base de la comunidad sin gobernanza conocida: la trazabilidad del linaje (`GinDuck` → `jrubiosainz` → `suraj-phanindra`) no está documentada más allá de las referencias cruzadas.
- No aplica como modelo de lenguaje: cualquier expectativa de generación de texto, razonamiento o multilingüismo es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc5-aifund
- Modelo base: https://huggingface.co/GinDuck/microduck-tug-titan-league
- Modelo de referencia para la tabla de ratings: https://huggingface.co/jrubiosainz/microduck-tug-h7p1b-aa128e6e
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`; no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
