# tdesc/microduck-2m-sprint-gentle1

## Resumen

`microduck-2m-sprint-gentle1` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador reactivo que mapea observaciones proprioceptivas de 61 dimensiones a 14 acciones de actuación a 50 Hz, empaquetado como un grafo ONNX listo para cargarse en un slot de política del daemon del robot. Lo publica el usuario `tdesc` bajo el identificador de tarea `Mjlab-Sprint2m-MicroDuck`, dentro de un repositorio de retos de entrenamiento reproducible.

El modelo resuelve un problema muy concreto: dotar al microduck de una marcha perpetua ("sprint") estable y suave que se ejecuta de forma indefinida hasta que se le indique lo contrario. La política se ha entrenado con el framework mjlab (basado en MuJoCo) sobre 512 entornos paralelos, 750 iteraciones máximas y un checkpoint final en la iteración 250, partiendo de un warm start sobre el run `warmstart_ref`. El resultado es un artefacto de inferencia ligero, pensado para ejecutarse en el propio robot o en un equipo de sobremesa, no en GPUs de centro de datos.

Su relevancia es acotada pero clara para quien trabaja en robótica de bajo coste: demuestra un flujo completo de entrenamiento RL en simulación, exportación a ONNX con la normalización de observaciones embebida y despliegue mediante una CLI (`robotctl`) sobre un manifiesto versionado. El repositorio de Hugging Face tiene un tamaño de 0,0 GB, sin descargas ni likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (red neuronal exportada a ONNX; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, 14 acciones, frecuencia de 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32; no confirmado) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline: la política se entrena con mjlab, un entorno de RL sobre MuJoCo, con la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `tdesc/microduck-challenges` (commit `c01e779fe`). El entrenamiento parte de la base `mjlab-microduck 0.1.0 @ 1efd853be` y utiliza un warm start desde el run `warmstart_ref` (checkpoint `model_ref.pt`), con 512 entornos en paralelo, un máximo de 750 iteraciones, learning rate de 2e-5, KL objetivo de 0.005 y semilla 1. El checkpoint publicado corresponde a la iteración 250.

Una decisión de ingeniería destacable es que la normalización de observaciones está embebida dentro de `policy.onnx`: el consumidor debe alimentar observaciones crudas, sin preprocesar. El autor advierte además que el entrenamiento no es bit-reproducible entre máquinas, de modo que repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. La política es "perpetua": no tiene condición de terminación interna y se ejecuta hasta que el daemon la descarga o la sustituye.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha de tipo sprint para el microduck a partir de observaciones proprioceptivas de 61 dimensiones.
- Control reactivo a 50 Hz con 14 acciones de actuación, adecuado para bucles de control en tiempo real.
- Ejecución indefinida: la política no incluye episodio ni condición de parada; el ciclo lo gestiona el daemon.
- Despliegue autocontenido: inferencia ONNX con normalización integrada, sin dependencias de preprocesado externo.
- Integración con el ecosistema microduck mediante `robotctl policy load <slot> <repo>` y un manifiesto conforme al esquema 2.
- Reproducibilidad del pipeline de entrenamiento documentada (código, lockfile, comando y semilla).
- No dispone de capacidades de lenguaje, visión, tool calling, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Investigación en locomoción RL: servir como política de referencia ("gentle1") para comparar variantes de recompensa, warm starts o hiperparámetros dentro del repositorio `microduck-challenges`, cargándola en un slot y midiendo estabilidad de la marcha.
- Demostraciones de robótica de bajo coste: ejecutar una marcha perpetua en un microduck físico durante exhibiciones o docencia, aprovechando que la política no termina por sí sola y no requiere reinicios periódicos.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load`, la resolución del manifiesto esquema 2 y la carga de ONNX en un entorno de CI del daemon sin necesidad de entrenar una política nueva.
- Benchmarking de simulación a realidad: comparar el comportamiento de la política en MuJoCo frente al robot físico para estudiar el gap sim-to-real en un cuadrúpedo pequeño, dado que se conoce el checkpoint y la configuración exacta de entrenamiento.
- Base para fine-tuning con RL: usar el checkpoint como inicialización (warm start) en tareas derivadas, como marcha con carga, giros o terrenos irregulares, reutilizando el mismo pipeline de mjlab.
- Docencia de RL aplicado: ilustrar el ciclo completo observación-acción-recompensa en un caso real y acotado (61 observaciones, 14 acciones), con un comando de reproducción explícito para el alumnado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y una política de este tipo (61 entradas, 14 salidas) es típicamente de pocos miles de parámetros, por lo que la inferencia cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; para inferencia no es necesaria GPU. Para reentrenar, el comando documentado usa 512 entornos paralelos y `--gpu-ids None`, lo que sugiere ejecución en CPU o una configuración sin selección explícita de GPU.
- GPU de consumo: la inferencia debería caber en cualquier GPU de consumo e incluso ejecutarse solo en CPU; no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-2m-sprint-gentle1 | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face (`tdesc/microduck-2m-sprint-gentle1`) |
| Otras políticas del repo `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio GitHub del autor |
| Políticas de locomotion para cuadrúpedos grandes (p. ej. familias de controladores RL para Unitree, ANYmal) | Políticas RL | no disponible | no disponible | habitualmente no comercial o investigación | Publicaciones y repos académicos |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Modelo altamente específico: solo es válido para el microduck con observaciones de 61 dimensiones y 14 acciones; no es reutilizable en otro hardware sin reentrenar.
- Sin información sobre sesgos ni alucinación, porque no es un modelo generativo; el riesgo equivalente es un comportamiento fuera de distribución ante observaciones no vistas en entrenamiento.
- Entrenamiento no bit-reproducible: los pesos publicados no pueden regenerarse exactamente, lo que dificulta la auditoría y la depuración de fallos.
- Sin métricas publicadas de robustez, velocidad alcanzada, consumo energético ni tasa de caídas; no hay evidencia documentada de rendimiento sim-to-real.
- Repositorio sin descargas ni validación comunitaria; madurez y soporte desconocidos.
- La política es perpetua por diseño: el operador debe garantizar mecanismos externos de parada segura en el robot.
- No se documenta la topología de red ni el tamaño de parámetros, lo que limita la estimación de recursos y la revisión técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-2m-sprint-gentle1
- Repositorio de entrenamiento: https://github.com/tdesc/microduck-challenges.git
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
