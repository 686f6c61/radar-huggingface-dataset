# witcheer/microduck-walk-recover

## Resumen

`witcheer/microduck-walk-recover` es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, entrenada mediante aprendizaje por refuerzo y exportada a ONNX. No es un modelo de lenguaje ni un transformer generativo: se trata de un controlador reactivo que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ocupar el slot `walk` del demonio `robotctl` del robot. El autor es el usuario de HuggingFace `witcheer`, y el repositorio acumula 0 descargas y 0 likes, por lo que no tiene validación comunitaria.

El problema que aborda es doble: mantener una marcha estable y recuperarse de perturbaciones. Según la model card, la política camina y se mantiene 20 segundos partiendo de pie, y además es capaz de corregir una inclinación hacia delante. Sin embargo, no consigue levantarse cuando parte tumbada boca arriba: falló en 3 de 3 intentos. El entrenamiento se realizó íntegramente en simulación, dentro del entorno Mjlab-VelStand-Flat-MicroDuck, y no se ha probado todavía en hardware real.

La relevancia del artefacto es acotada pero clara para quien trabaja en robótica open source: es un ejemplo reproducible de política perpetua (se ejecuta hasta que se le ordena lo contrario) empaquetada como ONNX con el normalizador de observaciones embebido, lo que simplifica su integración en el robot sin preprocesado adicional. El coste de entrenamiento declarado es de 20.000 iteraciones con 4.096 entornos en paralelo y 326 minutos en una única RTX 5090.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX; topología interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Observación de 61 dimensiones a 50 Hz |
| Tipos de cuantizacion | no disponible (solo se distribuye `policy.onnx`) |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, función de activación ni tipo de política). Lo que sí se documenta es la interfaz: 61 dimensiones de observación como entrada, 14 acciones como salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que la política consume observaciones en crudo sin necesidad de escalarlas externamente. El artefacto se distribuye junto a un `manifest.json` que sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del demonio.

El entrenamiento se llevó a cabo en el entorno Mjlab-VelStand-Flat-MicroDuck, una tarea de locomoción en terreno plano con consigna de velocidad. La model card indica 20.000 iteraciones con 4.096 entornos en paralelo, completadas en 326 minutos sobre una única RTX 5090. El código de entrenamiento procede del repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6`. No se especifican en la información proporcionada los datos de composición del dataset (al tratarse de RL en simulación, la "experiencia" se genera en el propio entorno), ni si se aplicaron técnicas posteriores como RLHF o DPO, que no tienen sentido en este dominio.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha perpetua a 50 Hz para el microduck, ejecutándose de forma continua hasta recibir una orden de parada.
- Estabilización de pie: mantiene la postura durante 20 segundos partiendo de una posición erguida.
- Recuperación de inclinación hacia delante: corrige una inclinación frontal detectada durante la marcha.
- Control reactivo de baja dimensión: mapea 61 observaciones a 14 acciones sin necesidad de planificación simbólica ni memoria explícita de largo plazo.
- Integración mediante `robotctl`: se carga con `sudo robotctl policy load walk witcheer/microduck-walk-recover` en el slot `walk`.
- Preprocesado embebido: incorpora el normalizador de observaciones en el propio grafo ONNX, por lo que acepta observaciones sin tratar.
- Compatibilidad con el manifiesto de políticas: el `manifest.json` cumple el esquema 2, lo que permite su carga por el demonio de microduck.
- No soporta: tool calling, function calling, razonamiento multi-paso con agentes, capacidades multilingües, visión, audio ni modo "thinking".

## Casos de uso

- Marcha por defecto del microduck: cargar la política en el slot `walk` mediante `robotctl` para dotar al robot de un gait continuo y estable en terreno plano, aprovechando que es perpetua y no requiere reinicio por episodio.
- Recuperación ante empujones frontales en demostraciones: en una sesión de demo con público, el robot puede absorber una inclinación hacia delante y volver a la marcha sin caer, lo que reduce las interrupciones.
- Investigación en sim-to-real: usar esta política como punto de partida para medir la brecha entre simulación (Mjlab-VelStand-Flat) y el robot físico, dado que el autor declara explícitamente que aún no se ha probado en hardware.
- Base para entrenamiento de recuperación desde caída: como el propio artefacto falla al levantarse desde posición supina (0 de 3 intentos), sirve como referencia negativa sobre la que entrenar una política extendida con recompensas de incorporación.
- Validación de pipelines de despliegue ONNX: al incluir `manifest.json` conforme al esquema 2 y el normalizador embebido, es útil para verificar que la cadena `robotctl` carga, versiona y ejecuta políticas externas correctamente.
- Comparación de políticas de locomoción: útil como línea base en experimentos que comparen distintos checkpoints del mismo repositorio de entrenamiento, manteniendo constantes la observación (61-D), la acción (14) y la frecuencia (50 Hz).
- Reproducción de experimentos de RL en robótica: replicar el entrenamiento declarado (20.000 iteraciones, 4.096 entornos, ~5,4 horas en una RTX 5090) para estudiar sensibilidad a hiperparámetros y semillas.
- Docencia en aprendizaje por refuerzo aplicado: ejemplo compacto y ejecutable de política RL empaquetada para un robot real, con coste de cómputo asumible en una sola GPU de consumo alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. Los únicos datos de evaluación cualitativos aportados por el autor son los siguientes:

| Prueba | Entorno | Resultado |
|---|---|---|
| Marcha estable desde posición erguida | Simulación (Mjlab-VelStand-Flat-MicroDuck) | Camina y se mantiene 20 s |
| Corrección de inclinación hacia delante | Simulación | Recupera y continúa |
| Incorporación desde posición supina | Simulación | Fracaso en 3 de 3 intentos |
| Prueba en robot físico | Hardware real | No realizada |
| Coste de entrenamiento | 1× RTX 5090 | 20.000 iteraciones, 4.096 entornos, 326 minutos |

No se dispone de cifras de recompensa, tasa de éxito cuantificada, distancia recorrida ni velocidad de avance en la información proporcionada.

## Requisitos de hardware

- Entrenamiento declarado: una única RTX 5090, 326 minutos para 20.000 iteraciones con 4.096 entornos paralelos. No se especifica el consumo de VRAM durante el entrenamiento.
- VRAM para inferencia: no disponible. Al tratarse de una política de 61 entradas y 14 salidas, el grafo ONNX es presumiblemente muy pequeño, pero la información proporcionada no incluye tamaño de fichero, número de parámetros ni precisión de los pesos.
- GPU recomendadas: no disponible. El único hardware mencionado para entrenamiento es la RTX 5090; no se documentan requisitos de inferencia.
- Encaje en GPU de consumo: no disponible. Es plausible que la inferencia quepa en cualquier GPU de consumo o incluso en CPU, pero no hay datos que lo confirmen en la información aportada.
- Opciones de despliegue: ejecución vía `robotctl` en el demonio de microduck, cargando `policy.onnx` a través del manifiesto. El modelo se distribuye en formato ONNX, por lo que es compatible con cualquier runtime de ONNX en principio, aunque no se documentan alternativas como vLLM, llama.cpp, Ollama o TGI (ninguna de ellas aplica a una política de control).
- Latencia y throughput: no disponibles. Se conoce únicamente la frecuencia de control objetivo, 50 Hz (periodo de 20 ms por ciclo de inferencia), que el autor declara como cadencia de ejecución de la política.

## Comparativa con modelos similares

No disponible. La búsqueda web asociada a este modelo no devolvió resultados relevantes: todos los enlaces recuperados corresponden al equipo de hockey hielo Dallas Stars (NHL) y no guardan relación alguna con robótica, aprendizaje por refuerzo ni el robot microduck. No se han encontrado en la información proporcionada otras políticas comparables para el microduck, ni modelos equivalentes de locomoción cuadrúpeda con los que establecer una comparación de parámetros, contexto, rendimiento, licencia y disponibilidad.

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-walk-recover | no disponible | 61-D obs., 14 acciones, 50 Hz | Marcha 20 s y recuperación frontal; falla al levantarse de espaldas | no disponible | HuggingFace (0 descargas, 0 likes) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No validado en hardware real: el propio autor indica que no se ha probado en un microduck físico, por lo que la brecha sim-to-real (fricción, latencias, ruido de sensores, holguras mecánicas) no está caracterizada.
- Incapacidad documentada de levantarse: desde posición supina falló en 3 de 3 intentos, de modo que no debe utilizarse como política de recuperación tras caída completa.
- Dominio restringido a terreno plano: el entorno de entrenamiento es Mjlab-VelStand-Flat, sin pendientes, escalones ni obstáculos irregulares.
- Acoplamiento al hardware: la política está atada a la interfaz concreta del microduck (61 observaciones, 14 acciones, 50 Hz) y no es portable a otras plataformas sin reentrenamiento.
- Política perpetua sin condición de parada propia: se ejecuta indefinidamente hasta que el operador o el demonio la detienen, lo que exige supervisión si el robot queda en un estado no previsto.
- Licencia no disponible: la ausencia de licencia explícita implica incertidumbre legal sobre el uso comercial, la redistribución o la modificación del artefacto.
- Sin métricas cuantitativas públicas: no hay recompensa final, tasa de éxito numérica, velocidad alcanzada ni benchmarks estándar, lo que impide comparaciones objetivas.
- Reproducibilidad condicionada: el entrenamiento depende de la rama `develop` del repositorio `microduck_rl` en el commit `53b8971b6`; cambios posteriores en ese repositorio pueden invalidar la reproducción exacta.
- Riesgo de sobreajuste a la simulación del autor: sin datos de evaluación en dominios aleatorizados, no puede descartarse una política frágil ante variaciones de parámetros físicos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros ni informes independientes.
- La búsqueda web asociada no aportó información técnica: los resultados obtenidos trataban sobre la plantilla de un equipo de la NHL y se descartaron por no ser pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-walk-recover
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` del repositorio del demonio de microduck (no se proporciona URL directa en la información disponible)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos correspondían al equipo de la NHL Dallas Stars y se han descartado por no guardar relación con el modelo.
