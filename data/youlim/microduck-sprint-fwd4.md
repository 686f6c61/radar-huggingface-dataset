# youlim/microduck-sprint-fwd4

## Resumen

`sprint-fwd4` es una política de control por aprendizaje por refuerzo (RL) para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador de locomoción que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en un fichero `policy.onnx` con el normalizador de observaciones ya integrado en el grafo. El autor del repositorio es el usuario `youlim` y la librería de carga declarada es `microduck`, con pipeline `robotics`.

La política se describe como **perpétua**: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura (*slot*) de políticas del daemon `robotctl`. El despliegue en robot se reduce a un comando (`sudo robotctl policy load <slot> youlim/microduck-sprint-fwd4`), y el repositorio incluye un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

El interés del artefacto es de nicho pero muy concreto: demuestra el ciclo completo de entrenamiento con **mjlab** (task_id `Mjlab-Sprint2m-MicroDuck`), publicación del checkpoint y despliegue sim-to-real en un cuadrúpedo de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la información pública disponible no incluye arquitectura de red, número de parámetros ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL entrenada con mjlab; la model card no especifica la topología de red ni el número de capas) |
| Parámetros totales | No disponible |
| Longitud de contexto | No aplica (control reactivo: observación de 61 dimensiones por paso, sin memoria de contexto declarada) |
| Tipos de cuantización | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de control motriz, sin entrada ni salida de texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) + `manifest.json` (esquema 2) |
| Dimensionalidad de observación | 61 |
| Dimensionalidad de acción | 14 |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Comportamiento | Política perpétua (se ejecuta hasta recibir orden de parada) |
| Librería / runtime | `microduck` (carga vía `robotctl`) |
| Tamaño del repositorio | 0,0 GB (por debajo de 0,1 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red neuronal. Lo que sí se documenta es el procedimiento de entrenamiento: la tarea `Mjlab-Sprint2m-MicroDuck` se entrena con el framework **mjlab** (base `mjlab-microduck 0.1.0`, commit `8d0dbc94c`) sobre el repositorio `pollen-robotics/microduck-challenges`, en la rama `main` y el commit `fb8a99d3f`. La configuración declarada es de 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1, registro en TensorBoard y nombre de ejecución `fwd4`. El checkpoint publicado corresponde a la iteración 1250, con inicio del entrenamiento el 2026-10-27T09:44:23Z.

El propio autor advierte de que el entrenamiento **no es reproducible bit a bit**: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política «comparable», no los mismos pesos, porque el RL sobre GPU no es determinista entre máquinas. Esta es una consideración relevante para cualquiera que quiera auditar o replicar exactamente el comportamiento. No se especifican en la información disponible la composición del dataset (al ser RL en simulación, los datos provienen del propio entorno), ni si hubo ajuste posterior tipo RLHF/DPO (no aplicable en este dominio), ni innovaciones de decodificación.

El detalle técnico más útil para integración es que el **normalizador de observaciones está embebido en `policy.onnx`**: el consumidor debe alimentar observaciones en bruto, sin preprocesar, y el modelo devuelve las 14 acciones directamente.

## Capacidades

- Locomoción cuadrúpeda: genera acciones de control continuas a 50 Hz para el robot microduck a partir de 61 señales de observación.
- Marcha perpétua: mantiene la política activa indefinidamente hasta que el daemon la descarga o la sustituye.
- Sim-to-real: entrenada en simulación con mjlab y empaquetada para ejecución directa en el robot mediante `robotctl policy load`.
- Autocontención: el normalizador va dentro del grafo ONNX, lo que elimina errores de preprocesado en el despliegue.
- Portabilidad de runtime: al ser ONNX, puede ejecutarse con cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- Interoperabilidad con el daemon: `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla en cualquier *slot* del sistema.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo *thinking* ni de salida textual de ningún tipo.

## Casos de uso

- **Despliegue de locomoción en el microduck real**: cargar la política en una ranura con `robotctl policy load` para que el cuadrúpedo camine de forma continua; es el uso previsto por el autor y el único documentado explícitamente.
- **Punto de partida para *fine-tuning* de marchas**: usar el checkpoint 1250 como inicialización y reentrenar con `uv run train Mjlab-Sprint2m-MicroDuck` modificando la recompensa o el terreno, ya que el pipeline completo (repositorio, `uv.lock`, comando) está publicado.
- **Referencia base en experimentos de RL**: emplear esta política como línea base de comparación frente a políticas propias en la misma tarea, controlando semilla y número de entornos para aislar el efecto del cambio.
- **Validación de la cadena de despliegue**: probar el daemon `robotctl`, el esquema 2 de manifiestos y la carga de ONNX en un robot antes de invertir en entrenamientos propios; el modelo es ligero y sirve como *smoke test* de toda la infraestructura.
- **Docencia e investigación en robótica con RL**: ilustrar el ciclo sim-to-real completo (entrenamiento masivo en paralelo, exportación a ONNX, ejecución a 50 Hz) con un robot de bajo coste y un repositorio pequeño.
- **Recogida de datos de locomoción**: ejecutar la marcha perpétua de forma repetida para grabar telemetría de sensores y construir un *dataset* de comportamiento del cuadrúpedo.
- **Integración en pipelines de evaluación automatizada**: al ser un artefacto ONNX pequeño y determinista en inferencia (aunque no en entrenamiento), puede incorporarse a *tests* de regresión de control en CI que verifiquen que las acciones permanecen en rangos seguros.
- **Prototipado de capas de seguridad**: envolver la política con un supervisor externo que limite las 14 acciones y comprobar el comportamiento en banco antes de operar el robot en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos publicados son de entrenamiento, no de rendimiento final: 4096 entornos en paralelo, semilla 1, checkpoint 1250 de un máximo de 3000 iteraciones, y una política descrita como válida para 2 metros de desplazamiento (por el identificador `Sprint2m` de la tarea), sin métricas de recompensa, velocidad alcanzada ni tasa de caídas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa menos de 0,1 GB y la política es un único fichero ONNX, por lo que el requisito es previsiblemente de kilobytes a unos pocos megabytes, muy por debajo de cualquier GPU.
- GPU recomendadas: no disponibles. Para inferencia no se requiere GPU; para reentrenar, la configuración publicada usa 4096 entornos paralelos, lo que implica una GPU de数据中心 o de gama alta (el autor no especifica modelo).
- Cabe en GPU de consumo: sí, con alta probabilidad, y también en CPU. No hay requisitos publicados que lo confirmen formalmente.
- Opciones de despliegue: `robotctl` (vía `microduck`) sobre el robot; ONNX Runtime u otro runtime ONNX para ejecución fuera del robot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control exige 50 Hz, es decir, 20 ms por ciclo de inferencia incluyendo lectura de sensores y envío de acciones. No se publican cifras de latencia medidas ni de consumo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otras políticas comparables (ni parámetros, ni contexto, ni rendimiento) y la model card no establece comparaciones. Como referencia cualitativa, el ecosistema `microduck-challenges` de Pollen Robotics alberga otras tareas y políticas del mismo tipo, pero no se dispone de sus especificaciones en esta consulta.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `youlim/microduck-sprint-fwd4` | no disponible | no aplica (obs. 61-D) | no publicado | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia sin especificar**: no se declara licencia en el repositorio. Sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de integrarlo en un producto.
- **Ausencia total de métricas**: no hay benchmarks, ni tasas de éxito, ni evaluación de robustez. No hay evidencia publicada de que la marcha funcione fuera de las condiciones de entrenamiento.
- **Reproducibilidad limitada**: el propio autor advierte de que el mismo comando y la misma semilla producen pesos distintos. La auditoría exacta del comportamiento entrenado no es posible a partir del código.
- **Alcance funcional estrecho**: es una política de marcha hacia delante; no se documenta comportamiento de giro, escalada, recuperación de caídas ni adaptación a terrenos irregulares.
- **Riesgo de sobreajuste al simulador**: al no publicarse evaluación sim-to-real, existe riesgo de brecha entre simulación y robot real (fricción, latencias, ruido de sensores) que puede degradar la marcha.
- **Sin capacidades lingüísticas ni de razonamiento**: cualquier expectativa de uso como modelo de lenguaje, agente o asistente es ajena a este artefacto; no procesa texto.
- **Dependencia del daemon**: el flujo de despliegue asume `robotctl` y el esquema 2 de manifiestos; cambios de versión en el daemon pueden romper la compatibilidad.
- **Advertencia de seguridad física**: es un controlador de un robot móvil real. La carga y ejecución debe hacerse en un banco de pruebas y con supervisión de parada de emergencia.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-27). No hay historial de uso ni comunidad que valide el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youlim/microduck-sprint-fwd4
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de tareas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `main`, commit `fb8a99d3f`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible)
- Base de entrenamiento: `mjlab-microduck 0.1.0` en el commit `8d0dbc94c` (sin URL directa en la información disponible)
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
