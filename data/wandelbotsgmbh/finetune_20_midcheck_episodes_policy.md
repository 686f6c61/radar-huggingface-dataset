# wandelbotsgmbh/finetune_20_midcheck_episodes_policy

## Resumen

`finetune_20_midcheck_episodes_policy` es una política de robótica basada en ACT (Action Chunking with Transformers), publicada por la organización wandelbotsgmbh en Hugging Face. No es un modelo de lenguaje: es un modelo de aprendizaje por imitación que, a partir de observaciones visuales y del estado del robot, predice fragmentos ("chunks") de acciones motoras en lugar de pasos individuales. Se ha entrenado y subido al Hub con LeRobot, sobre el dataset `wandelbotsgmbh/20_midcheck_episodes`, y se distribuye como checkpoint en safetensors de 51.617.415 parámetros (unos 51,6 millones) con un repositorio de 0,2 GB.

El método subyacente está descrito en el artículo arXiv:2304.13705, centrado en manipulación bimanual de precisión con hardware de bajo coste, y es una de las referencias habituales para políticas de imitación en robótica de escritorio. Su interés práctico es servir como política ya entrenada para tareas concretas, evaluable con el ecosistema LeRobot sobre robots tipo SO-100.

En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", no incluye resultados de benchmarks y no declara idiomas soportados. Debe considerarse, por tanto, un checkpoint experimental orientado a investigación y a entornos controlados, no un componente validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación; no es un transformer de lenguaje |
| Parametros totales | 51.617.415 (dato real de safetensors) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana fija de observaciones de imagen y estado definida en la configuración de ACT) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | wandelbotsgmbh/20_midcheck_episodes |
| Paper de referencia | arXiv:2304.13705 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de una sola acción por paso. Segun el articulo referenciado por el autor, la política combina un esquema de autocodificador variacional condicional (CVAE) con un transformer encoder-decoder: el encoder visual procesa las imágenes de las camaras, se concatena con el estado de las articulaciones y con una variable latente de estilo, y el decoder genera el chunk de acciones. El objetivo de entrenamiento combina una pérdida de reconstrucción tipo L1 sobre las acciones con un término de regularización KL del CVAE. No hay RLHF ni DPO: el aprendizaje es puramente supervisado a partir de demostraciones teleoperadas.

El entrenamiento se ha realizado con la herramienta `lerobot-train` y el tipo de política `--policy.type=act`, sobre el dataset `wandelbotsgmbh/20_midcheck_episodes`. No se especifican en la informacion proporcionada el numero de episodios, el numero de transiciones, la composicion de las camaras ni los hiperparámetros concretos empleados. El nombre del dataset sugiere un conjunto reducido de episodios de comprobación intermedia, pero este extremo no está confirmado por el autor.

## Capacidades

- Generacion de acciones motoras continuas para control de robots manipuladores, en forma de chunks de varios pasos.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, incluyendo tareas que en el articulo de referencia se describen como bimanuales y de precision fina.
- Procesamiento de observaciones visuales y de estado propioceptivo del robot como entrada.
- Inferencia y evaluacion mediante el flujo de LeRobot (`lerobot-record` con `--policy.path`).
- Soporte de tool calling / function calling: no, no aplica.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no, no aplica.
- Capacidades multilingues: no aplica, el modelo no procesa texto.
- Capacidades especiales (vision, audio, thinking mode): vision como entrada; audio y modo de razonamiento, no disponibles.

## Casos de uso

- Manipulacion con brazos de bajo coste: la propia model card muestra la evaluacion con `--robot.type=so100_follower`, de modo que el caso natural es desplegar esta política en un SO-100 para tareas de pick and place previamente demostradas.
- Tareas bimanuales de precision: el metodo ACT está pensado para manipulación fina con dos brazos (insertar, ensamblar, colocar piezas), donde la predicción por chunks reduce la acumulacion de error frente a políticas paso a paso.
- Prototipado rapido de automatizacion industrial: al entrenarse con `lerobot-train` sobre un dataset propio, sirve para validar en pocas horas si una tarea concreta es abordable con imitacion antes de invertir en desarrollos mayores.
- Recogida de datos y teleoperacion asistida: combinado con `lerobot-record`, permite grabar episodios nuevos y reentrenar la política de forma iterativa dentro del mismo ecosistema.
- Baseline de investigacion en aprendizaje por imitacion: es un punto de comparacion reproducible para medir mejoras de otras políticas sobre el mismo dataset y robot.
- Automatizacion de tareas repetitivas de laboratorio: trasvase de liquidos, ordenacion de muestras o colocacion de objetos en posiciones fijas, siempre que el entorno de recogida de datos se reproduzca con fidelidad.
- Demostraciones y docencia en robotica: el tamaño reducido (51,6 millones de parámetros) y la licencia permisiva facilitan su uso en cursos y talleres con hardware accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, numero de episodios de evaluacion, ni comparaciones cuantitativas con otras políticas. Tampoco se aportan métricas de latencia o de frecuencia de control.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32 unos 206 MB, en fp16 unos 103 MB y en int8 alrededor de 52 MB, calculado a partir de los 51,6 millones de parámetros (cifras aritmeticas, no publicadas por el autor).
- Con activaciones, buffers de imagen y el resto del pipeline de LeRobot, cualquier GPU con 2 GB o más de VRAM es suficiente en la práctica.
- GPU recomendadas: no hay una recomendación oficial; por tamaño, tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090 son más que suficientes, y también plataformas embebidas tipo Jetson Orin. El autor no especifica modelos validados.
- Cabe en GPU consumer: sí, con amplio margen. La restriccion real no es la memoria sino la latencia de control en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record --policy.path` para inferencia) sobre PyTorch y safetensors. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. Para control en bucle cerrado habrá que medir la frecuencia de inferencia real sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finetune_20_midcheck_episodes_policy (ACT) | 51.617.415 | imagenes + estado del robot | no disponible | apache-2.0 | Hugging Face |
| Alternativas de la misma categoria (otras políticas de imitación del ecosistema LeRobot) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos comparables ni cifras de rendimiento que permitan una comparacion rigurosa. Cualquier tabla comparativa con políticas alternativas requeriria datos que aqui no estan disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni conversacion multilingue. Cualquier uso en ese sentido es un error de categoria.
- Es una política entrenada sobre un unico dataset (`20_midcheck_episodes`); su capacidad de generalizacion a otras tareas, objetos, robots o condiciones de iluminacion es muy limitada sin reentrenamiento.
- Sensibilidad al entorno de recogida de datos: cambios en la posicion de las camaras, la iluminacion o la disposicion de la mesa degradan el rendimiento, algo caracteristico del aprendizaje por imitacion.
- Riesgo de sobreajuste y de fallos silenciosos en produccion: sin métricas publicadas ni episodios de evaluacion documentados, no es posible estimar una tasa de exito.
- Sin validacion comunitaria: 0 descargas y 0 "likes" implican que el checkpoint no ha sido contrastado por terceros.
- La licencia del modelo es apache-2.0, permisiva para uso comercial, pero la licencia del dataset de entrenamiento no se especifica en la informacion disponible y debe verificarse por separado.
- No se declaran sesgos, pero al depender de demostraciones humanas puede heredar los sesgos de trayectoria y de estilo del operador que teleopero los datos.
- No hay informacion sobre la fecha real de entrenamiento ni sobre la version de LeRobot utilizada, lo que complica la reproducibilidad.
- Uso previsto en investigacion y entornos controlados; su empleo con personas o en entornos no estructurados requiere analisis de seguridad adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandelbotsgmbh/finetune_20_midcheck_episodes_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/wandelbotsgmbh/20_midcheck_episodes
- Paper de ACT (pagina de Hugging Face): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a temas sin relacion (foros sobre aplicaciones de streaming).
