# tfrere/microduck-move-a-duck-that-walks-leaning-fa

## Resumen
`tfrere/microduck-move-a-duck-that-walks-leaning-fa` es una **política de locomoción** (policy) para el robot microduck de Pollen Robotics, no un modelo de lenguaje. Se trata de un "move" de la familia `velocity` (estilos de marcha o gaits), de tipo `perpetual` y tier 1, entrenado por el usuario tfrere dentro del programa Microduck Academy. El objetivo declarado es que el pato camine con una inclinación sostenida del tronco hacia delante, la cabeza baja y el pico apuntando hacia abajo, "como si luchara contra un viento en contra fuerte", manteniendo un avance normal.

Técnicamente opera con observaciones de 61 dimensiones y 14 acciones a 50 Hz, y su política se distribuye exportada a ONNX (`policy.onnx`), con el normalizador de observaciones incrustado en el propio grafo, de modo que se le pueden pasar observaciones en crudo. El repositorio incluye además los pesos en PyTorch (`model.pt`) para reentrenamiento, grabaciones de trayectorias (`rollouts/*.traj` en formato trajectory.v1) y un `manifest.json` con esquema 2 que documenta el prompt, la familia, el veredicto del juez y el linaje.

Su relevancia es acotada pero clara: es un artefacto de robótica con licencia Apache 2.0, reproducible sobre un robot real mediante el comando `robotctl policy load walk`, y sirve como punto de partida para hacer fine-tuning de estilos de marcha. El interés principal está en la comunidad que trabaja con el microduck y en quienes investigan control de locomoción con aprendizaje por refuerzo, no en aplicaciones de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para locomoción (red neuronal; topología interna no especificada). Entrada de 61 dimensiones, salida de 14 acciones, 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye una exportación ONNX; el normalizador va incrustado en el grafo) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`) |
| Familia y tipo | `family:velocity` (estilos de marcha), `kind:perpetual`, `tier:1` |
| Frecuencia de control | 50 Hz |
| Espacio de observacion / accion | 61 dimensiones / 14 acciones |
| Slot de destino | `walk` |
| Tamano del repositorio | 0.0 GB (redondeado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
No se detalla la topología de la red en la información disponible: la model card sólo indica el espacio de observación (61 dimensiones), el de acción (14 acciones) y la frecuencia de control (50 Hz). El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` y el modelo se describe explícitamente como un **fine-tune del paseo ya convergido** ("fine-tune the converged walk"), es decir, se parte de una política de marcha estable y se ajusta para forzar la inclinación del tronco y la posición baja de la cabeza. No se especifican el algoritmo de RL empleado, el número de pasos de entrenamiento ni la composición del dataset de rollouts.

La política es `perpetual`: una vez cargada, se ejecuta de forma continua hasta que se le ordene lo contrario, y está pensada para ocupar el slot `walk` del robot. La evaluación se delegó a un juez automático de la Academy, que otorgó veredicto **PASS con puntuación 1.0** tanto en la ronda 1 como en la final, sobre una ejecución de 8 segundos sin caída (`fell: false`). El manifest sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades
- Locomoción bípeda perpetua: mantiene la marcha de forma continua hasta recibir una orden de parada.
- Estilo de marcha específico: inclinación sostenida del tronco hacia delante (pitch medio de 24.0 grados, tilt máximo de 25.6 grados) con la cabeza baja y el pico hacia abajo.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control de tiempo real del microduck.
- Inferencia con observaciones en crudo: el normalizador está integrado en `policy.onnx`, por lo que no requiere preprocesado externo.
- Despliegue directo en hardware: se carga con `robotctl policy load walk <repo>`.
- Reentrenamiento y remezcla: `model.pt` permite hacer fine-tuning a partir de esta política.
- Trazabilidad: incluye grabaciones de trayectorias (`rollouts/*.traj`, formato trajectory.v1) y un manifest con prompt, familia, juez y linaje.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso
- Marcha por defecto del microduck en demostraciones: se carga en el slot `walk` y el robot avanza de forma continua con la postura inclinada, útil para exhibiciones donde se quiere un andar característico y reconocible.
- Punto de partida para fine-tuning de estilos: al partir de un paseo convergido, `model.pt` permite ajustar variantes de postura (más inclinación, cabeza a otra altura) sin entrenar desde cero.
- Investigación en control de locomoción con RL: sirve como referencia reproducible de una política que cumple restricciones posturales concretas, con métricas de juez publicadas para comparar.
- Validación de pipelines de la Microduck Academy: el manifest con esquema 2 y las trayectorias permiten probar el flujo completo de entrenamiento, evaluación automática y publicación.
- Pruebas de robustez sobre hardware real: la condición `fell: false` durante 8 segundos a 0.324 m/s ofrece una línea base para medir estabilidad frente a perturbaciones.
- Comparación de gaits dentro de la familia `velocity`: al compartir espacio de observación y acción, varias políticas de la misma familia pueden intercambiarse en el mismo slot para estudiar diferencias de velocidad, zancada y contacto.
- Docencia y talleres de robótica: el comando único de carga y la licencia permisiva facilitan su uso en sesiones prácticas con el robot microduck.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente recoge las métricas del juez automático de la Academy sobre una ejecución de 8 segundos:

| Metrica del juez | Valor |
|---|---|
| Veredicto / puntuacion | PASS / 1.0 (ronda 1 y final) |
| Duracion evaluada | 8.0 s |
| Caida | false |
| Velocidad | 0.324 m/s |
| Desplazamiento | 0.348 m/s |
| Relacion de altura | 1.007 |
| Altura | 0.1158 m |
| Pitch | 24.0 grados |
| Tilt maximo | 25.6 grados |
| Yaw rate | -0.083 rad/s |
| Rango pico-pico de yaw de cabeza | 0.531 rad |
| Angulo de rodilla izquierda | 0.113 rad |
| Fraccion de contacto (dos pies) | 0.49 / 0.54 |
| Etiqueta | forward |

## Requisitos de hardware
- Hardware objetivo: robot microduck de Pollen Robotics, con el daemon de control y la herramienta `robotctl` para cargar la política.
- VRAM estimada para inferencia: no disponible. El tamaño del repositorio aparece como 0.0 GB (redondeado), lo que sugiere un artefacto muy pequeño, pero no se confirma el tamaño exacto ni el consumo.
- GPU recomendadas: no disponibles. Por el tipo de carga (14 acciones a 50 Hz con entrada de 61 dimensiones) es plausible que la inferencia se ejecute en CPU a bordo del robot, pero esto es una estimación y no un dato confirmado por el autor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load walk tfrere/microduck-move-a-duck-that-walks-leaning-fa` sobre el robot; el archivo ONNX es ejecutable con cualquier runtime compatible con ONNX (ONNX Runtime, etc.), aunque no se documenta un procedimiento de despliegue fuera del robot.
- Latencia y throughput: no disponibles, más allá de la frecuencia de control declarada de 50 Hz.

## Comparativa con modelos similares
No se dispone de datos comparativos en la información proporcionada. La propia nomenclatura indica que existen otras políticas de la misma familia `velocity` y de otros niveles (`tier`) dentro de la Microduck Academy, pero no se incluyen sus especificaciones, métricas ni identificadores, por lo que no es posible establecer una comparación cuantitativa.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Otras politicas de la familia `velocity` (Microduck Academy) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Politicas del slot `walk` de otros autores | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona y no procesa imágenes o audio. Cualquier uso fuera del control del robot microduck requiere adaptar la observación y la acción.
- Dependencia fuerte del hardware: la política espera el espacio de observación de 61 dimensiones y el de acción de 14 dimensiones del microduck; sin ese robot (o un simulador equivalente) no es utilizable directamente.
- Estilo deliberadamente extremo: una inclinación de 24 grados y un tilt máximo de 25.6 grados pueden comprometer la estabilidad frente a perturbaciones externas, terrenos irregulares o cargas añadidas.
- Evaluación muy limitada: el juez sólo validó 8 segundos de marcha sin caída, por lo que no hay evidencia de robustez en ejecuciones largas, a pesar de que la política es de tipo `perpetual`.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un fine-tune del paseo convergido, puede degradarse fuera de las condiciones simuladas o del suelo previsto.
- Documentación incompleta: la model card aparece truncada, con el bloque de frontmatter duplicado y sin secciones de datos de entrenamiento, hiperparámetros o arquitectura. No hay información sobre sesgos ni sobre el conjunto de datos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentación de terceros.
- Metadatos anómalos: las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el artefacto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se declaran restricciones adicionales.
- Para producción: conviene validar en el hardware real, con batería y terreno previstos, y monitorizar la estabilidad antes de confiar en la política como marcha por defecto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tfrere/microduck-move-a-duck-that-walks-leaning-fa
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL (citado en la model card): `pollen-robotics/microduck_rl`
- Documentación del esquema del manifest: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a sitios sin relación con el modelo (New York Sports Clubs), por lo que no aportan enlaces adicionales relevantes.
