# tdesc/microduck-sock-heist-heist1

## Resumen

`sock-heist-heist1` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de locomoción que se carga en el daemon del robot y se ejecuta de forma continua a 50 Hz, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones de control articular. Lo publica el usuario `tdesc` como artefacto reproducible del entorno de entrenamiento `microduck-challenges`.

La política se distribuye como un fichero ONNX (`policy.onnx`) con el normalizador de observaciones embebido, de modo que el robot puede alimentarla con observaciones en bruto sin preprocesado externo. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El repositorio tiene un tamaño declarado de 0,0 GB y, en el momento de la consulta, no registra descargas ni interacciones.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entorno mjlab, 512 entornos paralelos, 1000 iteraciones, semilla fija) y como política funcional de marcha perpetua para el hardware microduck. No aporta capacidades de razonamiento, lenguaje ni visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; el autor no detalla la topología de la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva por paso, sin ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Parámetros operativos declarados en la model card:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Integración | ranura de política del daemon (`robotctl policy load <slot> ...`) |
| Normalizador de observaciones | embebido en `policy.onnx` |

## Arquitectura y entrenamiento

El autor no describe la arquitectura de la red neuronal subyacente; solo se sabe que la política se exporta a ONNX y que opera como controlador reactivo a 50 Hz con entrada de 61 dimensiones y salida de 14 acciones. No hay información sobre número de capas, tamaño de las capas ocultas, función de activación ni si existe memoria recurrente entre pasos. Tampoco se documenta el diseño de recompensas, el espacio de observaciones ni el currículo de entrenamiento.

El entrenamiento se realizó con el stack `mjlab` (versión base `mjlab-microduck 0.1.0` en el commit `1efd853be`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 512 entornos simulados en paralelo, 1000 iteraciones máximas del agente y semilla 1. El checkpoint publicado corresponde al paso 999. El código y el `uv.lock` están fijados en el repositorio `tdesc/microduck-challenges` (rama `main`, commit `c01e779fe`), lo que permite reproducir el proceso. El propio autor advierte que el entrenamiento con RL sobre GPU no es reproducible bit a bit entre máquinas: repetir el pipeline produce una política comparable, no idéntica.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se mantiene hasta que el daemon la detiene.
- Control motor de 14 acciones a partir de 61 observaciones, a 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX, lo que elimina la necesidad de preprocesado en el lado del robot.
- Carga directa en una ranura de política del daemon mediante `robotctl policy load`.
- Ejecución en tiempo real sobre el hardware objetivo, sin dependencia de un servidor de inferencia externo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura del daemon y dejar que el robot camine de forma continua en una superficie preparada, usando el comando documentado por el autor.
- Reproducción de experimentos de RL: clonar `microduck-challenges` en el commit `c01e779fe`, sincronizar con `uv` y relanzar el entrenamiento con la misma semilla para obtener una política estadísticamente comparable y estudiar la variabilidad entre ejecuciones.
- Punto de partida para fine-tuning o currículos nuevos: la política sirve como referencia de una marcha estable sobre la que diseñar tareas derivadas (por ejemplo, transporte o manipulación con el mismo robot) en el simulador mjlab.
- Validación de la cadena de herramientas microduck: comprobar que el pipeline de manifiesto (esquema 2), la exportación a ONNX y la carga en el daemon funcionan de extremo a extremo antes de desplegar políticas propias.
- Docencia y talleres de robótica con RL: ejemplo completo y de bajo coste computacional (512 entornos, 1000 iteraciones) para ilustrar el ciclo simulación-entrenamiento-exportación-despliegue.
- Pruebas de integración en CI del daemon: usar el artefacto como política de referencia para verificar que los cambios en el cargador de políticas o en el formato de manifiesto no rompen la compatibilidad.
- Benchmark interno de rendimiento del robot: medir velocidad, estabilidad y consumo al ejecutar una política perpetua conocida sobre distintas superficies o configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB y el autor no publica el recuento de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible para inferencia. Para reentrenar, el comando del autor usa 512 entornos paralelos y `--gpu-ids None`, lo que sugiere ejecución en CPU o una configuración sin GPU especificada; no se detalla el hardware empleado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto está pensado para el daemon de microduck mediante `robotctl policy load <slot> tdesc/microduck-sock-heist-heist1`. Al ser ONNX, podría ejecutarse con ONNX Runtime en otros contextos, aunque el autor no lo documenta.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (20 ms por paso de control). No se publican mediciones de latencia real ni de consumo en el robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni artefactos comparables de la misma tarea, por lo que no es posible establecer una comparación con parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, redistribución ni uso comercial. Tratar el artefacto como no licenciado para producción hasta confirmación del autor.
- Ausencia total de documentación sobre arquitectura, número de parámetros y dataset de entrenamiento, lo que impide auditorías técnicas.
- Entrenamiento no reproducible bit a bit: el autor advierte explícitamente que el RL sobre GPU produce políticas comparables, no idénticas.
- Política específica de una tarea (`Mjlab-SockHeist6m-MicroDuck`) y de un robot concreto (microduck, 61 observaciones, 14 acciones, 50 Hz); no es transferible a otro hardware sin reentrenamiento.
- Sin métricas publicadas de robustez, estabilidad o rendimiento; no hay evidencia documentada de comportamiento ante perturbaciones, cambios de superficie o fallos de sensores.
- Riesgo de sobreajuste al simulador (sim-to-real): no se documenta ningún proceso de randomización de dominio ni validación en hardware real.
- Cero descargas y cero interacciones en Hugging Face en el momento de la consulta: no existe validación por parte de la comunidad.
- No apta para tareas de lenguaje, visión, razonamiento o agentes; cualquier uso en esos dominios queda fuera de su propósito.
- El repositorio figura con tamaño 0,0 GB, lo que puede indicar un artefacto muy pequeño o un problema de empaquetado; conviene verificar la integridad de los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-sock-heist-heist1
- Repositorio de entrenamiento: https://github.com/tdesc/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon de microduck
