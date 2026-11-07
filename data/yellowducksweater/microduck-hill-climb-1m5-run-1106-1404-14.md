# YellowDuckSweater/microduck-hill-climb-1m5-run-1106-1404-14

## Resumen

`microduck-hill-climb-1m5-run-1106-1404-14` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones (estado de sensores y articulaciones) a 14 acciones de control a 50 Hz, empaquetado como un grafo ONNX autocontenido. El autor del repositorio es el usuario YellowDuckSweater y la tarea entrenada es `Mjlab-HillClimb1m5-MicroDuck`, es decir, ascenso de colinas con una pendiente nominal de 1,5 m de desnivel.

El modelo se distribuye como un "policy slot" cargable directamente en el robot mediante el comando `robotctl policy load`, con el normalizador de observaciones embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. La política es de tipo perpetuo: ejecuta una marcha continua hasta que se le indique lo contrario. El repositorio tiene un tamaño de 0,0 GB, sin descargas ni likes en el momento de la consulta, y no declara licencia ni idiomas.

Su relevancia es acotada pero concreta: forma parte de una familia de políticas experimentales de locomoción para un robot educativo de código abierto, y sirve como referencia reproducible para quienes entrenan controladores con mjlab (el framework de RL basado en MuJoCo). La ficha técnica es escasa porque la model card no publica arquitectura de red, número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL empaquetada como grafo ONNX; topología de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control reactivo a 50 Hz, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye un `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (marcha continua hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó con mjlab, un entorno de aprendizaje por refuerzo sobre MuJoCo, en la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `StephenForte/microduck-challenges` (rama `main`, commit `31dbf3fb4`), partiendo de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El checkpoint utilizado es el 750, con semilla 0 y un total de 3000 iteraciones máximas configuradas, ejecutando 4096 entornos en paralelo.

El comando de reproducción completo está publicado: clonar el repositorio, hacer `uv sync` y lanzar `uv run train Mjlab-HillClimb1m5-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 0 --agent.logger tensorboard --agent.run-name run-1106-1404-14`. El autor advierte explícitamente de que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. El normalizador de observaciones está integrado en el grafo ONNX, una decisión de empaquetado que elimina una fuente habitual de errores de integración.

## Capacidades

- Locomoción cuadrúpeda continua: genera comandos articulares a 50 Hz a partir de observaciones de 61 dimensiones.
- Ascenso de colinas: la tarea de entrenamiento es `HillClimb1m5`, orientada a superar desniveles de aproximadamente 1,5 m.
- Política perpetua: mantiene la marcha indefinidamente hasta que el daemon del robot la descarga o la sustituye.
- Integración directa con el daemon: se carga en un slot de política mediante `robotctl policy load`.
- Inferencia autocontenida: el normalizador va embebido en `policy.onnx`, por lo que acepta observaciones en crudo sin preprocesado externo.
- Despliegue en el propio robot: el formato ONNX permite ejecución en el hardware de a bordo del microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción con RL: sirve como política de referencia para comparar curvas de recompensa y comportamientos de ascenso entre experimentos de la familia `hill-climb-1m5`, dado que el pipeline mjlab y el commit exacto están publicados.
- Reproducción de experimentos: un investigador puede clonar `microduck-challenges`, fijar el commit `31dbf3fb4` y reentrenar con la misma semilla para estudiar la varianza entre ejecuciones, que el autor documenta como no nula.
- Demostraciones educativas de RL en robótica: el microduck es una plataforma de bajo coste y la carga de la política es un único comando, lo que facilita talleres y prácticas sin infraestructura pesada.
- Pruebas de robustez de terreno: al ser una política de ascenso, permite evaluar el comportamiento del robot en pendientes y compararlo con otras políticas del mismo autor o de terceros (por ejemplo, `GinDuck/microduck-hill-climb-1m5-hill-1`).
- Benchmarking de controladores en el daemon: útil para validar el cargador de políticas, el esquema 2 de manifiesto y el flujo de slots antes de desplegar políticas propias en producción.
- Base para ajuste fino o destilación: al estar en ONNX y con el entorno de entrenamiento disponible, puede servir de inicialización o de profesor para políticas más ligeras o específicas de otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito en ascenso, velocidad media ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control de 61 entradas y 14 salidas, la huella es previsiblemente de kilobytes a pocos megabytes, pero el número de parámetros no está declarado.
- GPU recomendadas: no aplica para inferencia; el destino es la CPU del propio robot microduck mediante el runtime ONNX.
- GPU para entrenamiento: el comando publicado usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar); el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? La inferencia sí, con total seguridad, en cualquier GPU o CPU; el entrenamiento con 4096 entornos es inviable en GPUs de consumo típicas.
- Opciones de despliegue: `robotctl policy load` sobre el daemon de microduck; el artefacto es ONNX, por lo que también puede ejecutarse con ONNX Runtime en cualquier host.
- Latencia y throughput: no disponibles. La política opera a 50 Hz, lo que fija un presupuesto de 20 ms por ciclo, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tarea | Observacion / accion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YellowDuckSweater/microduck-hill-climb-1m5-run-1106-1404-14 | Ascenso de colinas 1,5 m | 61 / 14, 50 Hz | ONNX | no disponible | Hugging Face |
| YellowDuckSweater/microduck-hill-climb-1m5-run-1106-0950-12 | Ascenso de colinas 1,5 m | no disponible | ONNX (presumible) | no disponible | Hugging Face |
| GinDuck/microduck-hill-climb-1m5-hill-1 | Ascenso de colinas 1,5 m | no disponible | ONNX (presumible) | no disponible | Hugging Face |

Las tres políticas pertenecen a la misma familia de tareas (`hill-climb-1m5`) para el mismo robot y se cargan con el mismo comando, pero la información disponible no permite comparar parámetros, rendimiento ni calidad de la marcha entre ellas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta el comportamiento de la política ante terrenos distintos de la colina de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento, con posibles caídas o marchas erráticas.
- Limitaciones de contexto o idioma: no aplica; la política no procesa lenguaje ni mantiene contexto, solo reacciona al estado sensorial a 50 Hz.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir permiso para uso comercial o redistribución; debe consultarse con el autor antes de cualquier despliegue productivo.
- Reproducibilidad: el propio autor advierte de que el entrenamiento no es bit a bit reproducible; los pesos publicados no pueden regenerarse exactamente.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación externa documentada; trátese como un artefacto experimental.
- Alcance: es una política perpetua de marcha, sin lógica de parada, navegación ni planificación; cualquier comportamiento superior debe aportarlo la capa de control que la rodea.
- Hardware: está entrenada específicamente para la morfología del microduck; no es transferible a otros robots sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1106-1404-14
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Política hermana del mismo autor: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1106-0950-12
- Política de terceros de la misma tarea: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1
