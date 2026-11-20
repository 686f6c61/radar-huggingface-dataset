# suraj-phanindra/microduck-heist-a800-aifund

## Resumen

microduck-heist-a800-aifund es un checkpoint de política de refuerzo (reinforcement learning, RL) entrenado para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de control motor que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, empaquetada en formato ONNX para su despliegue directo en el robot mediante el daemon `robotctl`. El autor es suraj-phanindra y el artefacto procede de una ejecución PPO (Proximal Policy Optimization) denominada heistA, usando la receta Mjlab-SockHeist6m-MicroDuck con 4096 entornos paralelos.

El checkpoint corresponde al paso 800 de entrenamiento y es hermano de otra política publicada (heist-ppo1-aifund, paso 999). La política es "perpetua": ejecuta una marcha (gait) de forma continua hasta recibir una orden de parada, y se carga en una ranura de política del firmware. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los pesos son muy ligeros, típicos de políticas de control para robots de pequeño tamaño.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de RL para robótica, sin descargas ni likes, sin licencia declarada y sin información de benchmarks. Es útil como referencia para quienes trabajan con el stack microduck o con recetas de entrenamiento PPO en Mjlab, pero no constituye un modelo fundacional ni un sistema de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL (PPO) para control robótico; topología de red no especificada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no aplica; política de control motor) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrenó con PPO sobre la receta Mjlab-SockHeist6m-MicroDuck del repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), usando 4096 entornos paralelos. El espacio de observación tiene 61 dimensiones y el de acciones 14, con una frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot alimenta observaciones en crudo y el propio grafo aplica la normalización.

No se dispone de información sobre el número de parámetros de la red, la composición exacta de la arquitectura (capas, activaciones, tamaño de las hidden layers), el número total de pasos de entrenamiento más allá del checkpoint 800, ni sobre el uso de técnicas adicionales como recompensas conformadas, domain randomization o curriculum. El checkpoint 800 es hermano de heist-ppo1-aifund (checkpoint 999), lo que indica que ambos provienen de la misma ejecución y difieren solo en el paso de entrenamiento guardado.

## Capacidades

- Ejecución de una marcha (gait) continua para el robot microduck, mantenida de forma perpetua hasta recibir una orden de parada.
- Control motor a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Carga directa en una ranura de política del daemon `robotctl` mediante el comando `robotctl policy load <slot> suraj-phanindra/microduck-heist-a800-aifund`.
- Inferencia ONNX autocontenida: el normalizador de observaciones está incluido en el grafo, por lo que no requiere preprocesado externo.
- Compatibilidad con el manifiesto de políticas schema 2 del ecosistema microduck.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en RL para robótica: servir como checkpoint de referencia o línea base para comparar recetas PPO (por ejemplo, frente al checkpoint 999 de heist-ppo1) en el entorno Mjlab-SockHeist6m-MicroDuck.
- Despliegue de una marcha en el robot microduck: cargar la política en una ranura con `robotctl policy load` para que el robot ejecute el gait de forma continua durante pruebas de laboratorio.
- Reproducción de experimentos: al estar vinculada a un commit concreto (`5cee942d8`) y a una receta definida, permite reproducir o auditar la ejecución de entrenamiento.
- Evaluación de robustez de políticas perpetuas: estudiar el comportamiento del gait cuando se le alimentan observaciones en crudo, aprovechando que el normalizador está embebido en el ONNX.
- Integración en pipelines de robótica con ONNX Runtime: al ser un artefacto ONNX, puede ejecutarse en entornos de inferencia estándar para pruebas offline antes del despliegue físico.
- Docencia y demostraciones: usar el robot microduck con esta política como ejemplo práctico de RL aplicado a locomoción de cuadrúpedos en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere pesos muy ligeros, pero no se confirma una cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño aparente del artefacto, es plausible que quepa en GPU de consumo, pero no se dispone de datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`), daemon `robotctl` del stack microduck con carga en ranura de política.
- Latencia y throughput estimados: no disponible; la frecuencia de control objetivo es de 50 Hz, pero no se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-heist-a800-aifund (este) | Política PPO para microduck | 61 / 14 | 50 Hz | ONNX | no disponible | Hugging Face, 0 descargas |
| heist-ppo1-aifund | Política PPO para microduck (checkpoint 999) | no disponible | no disponible | no disponible | no disponible | Hugging Face (hermano de la misma ejecución) |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros ecosistemas robóticos.

## Limitaciones y advertencias

- Artefacto experimental sin licencia declarada: no se especifica si permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin descargas ni likes en Hugging Face y repositorio de 0.0 GB: no hay evidencia de validación comunitaria ni de uso extendido.
- No se han publicado benchmarks, métricas de éxito del gait, ni datos de robustez ante perturbaciones.
- Política "perpetua": ejecuta la marcha hasta recibir orden de parada; en producción debe garantizarse un mecanismo fiable de interrupción.
- Sin información sobre sesgos, alucinación o limitaciones de idioma, ya que no es un modelo de lenguaje.
- La reproducibilidad depende del commit `5cee942d8` y de la receta Mjlab-SockHeist6m-MicroDuck; cambios en el entorno de entrenamiento pueden alterar el comportamiento.
- No se documentan los parámetros de red ni el número total de pasos, lo que dificulta evaluar la madurez del checkpoint 800 frente al 999.

## Enlaces

- Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-a800-aifund
- Repositorio microduck (robot): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
- Modelo hermano: https://huggingface.co/suraj-phanindra/heist-ppo1-aifund (referenciado en la model card; disponibilidad no verificada)
