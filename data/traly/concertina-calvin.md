# Traly/concertina-calvin

## Resumen

Concertina CALVIN ABC -> D es un checkpoint de política robótica del modelo Concertina, un modelo de visión-lenguaje-acción (VLA) de tipo difusión presentado en el artículo "Concertina: Embodying Manipulation and Cognition in One Diffusion Vision-Language Model" (Wang et al., 2026). Lo publica el usuario Traly en Hugging Face como un directorio de política autocontenido compatible con LeRobot, con tipo de política `concertina`, y se distribuye con licencia MIT.

El modelo parte de `Traly/concertina-pretrain-90k` y se afina sobre el split de entrenamiento CALVIN ABC -> D, un benchmark estándar de manipulación robótica con instrucciones en lenguaje natural. Su propósito es ejecutar tareas de manipulación guiadas por lenguaje en un entorno de laboratorio simulado o real, combinando percepción visual, comprensión del lenguaje y generación de acciones motoras en un único modelo de difusión.

Con 4.447.963.669 parámetros (aproximadamente 4,45 mil millones) y pesos en bf16, es un modelo de tamaño medio que requiere GPU de datacenter para inferencia cómoda. El backbone lingüístico-visual es Bard-VL, cuyos pesos quedan integrados en `model.safetensors`. La relevancia actual radica en la tendencia hacia modelos VLA unificados que sustituyen pipelines separados de percepción y control por un solo modelo entrenado de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de difusión; backbone Bard-VL con cabezas de acción |
| Parametros totales | 4.447.963.669 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), estructura de política LeRobot con `config.json`, `model.safetensors`, pre/post-procesadores y `backbone/` |

## Arquitectura y entrenamiento

Concertina es un modelo de difusión que unifica manipulación y cognición en un único modelo de visión-lenguaje. La arquitectura combina un backbone visión-lenguaje denominado Bard-VL (con su propio tokenizador y procesador de imágenes, incluidos en el subdirectorio `backbone/`) con cabezas de acción que generan trayectorias motoras mediante un proceso de difusión. El checkpoint se empaqueta como política LeRobot de tipo `concertina`, lo que permite cargarlo directamente con las herramientas del ecosistema LeRobot.

El entrenamiento del checkpoint publicado consistió en 5.000 actualizaciones con 1.536 muestras por actualización, distribuidas en 8 GPUs con batch size 192, sobre el dataset `Traly/calvin_abc_d-lerobot`. Durante el ajuste fino se congelaron las cabezas de acción y las capas 0-1 del modelo de lenguaje. La configuración de entrenamiento está en `configs/train/calvin.yaml` y la de evaluación en `configs/eval/calvin_abc_d.yaml`. El artículo reporta un resultado de longitud media de 4,142 sobre las 1.000 secuencias de evaluación de CALVIN, con cuatro workers reclamando secuencias de forma dinámica.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por instrucciones en lenguaje natural e imágenes del entorno.
- Comprensión visuo-lingüística mediante el backbone Bard-VL, que procesa observaciones visuales y texto de instrucción de forma conjunta.
- Ejecución de tareas multi-paso en el benchmark CALVIN, que encadena hasta cinco subtareas por secuencia.
- Control de un brazo robótico simulado en el entorno CALVIN (ABC -> D), con generalización a entornos no vistos del split D.
- Integración nativa con LeRobot: carga como política, con pre/post-procesadores guardados y configuración reproducible.
- Evaluación reproducible mediante la herramienta `concertina-eval` con configuración YAML y selección de GPUs.

## Casos de uso

- Evaluación comparativa en CALVIN: usar el checkpoint como referencia para medir la longitud media de secuencia completada en el split D y comparar con otras políticas VLA publicadas, aprovechando la configuración de evaluación incluida.
- Investigación en modelos VLA de difusión: servir de base para experimentos de ablación sobre el backbone Bard-VL, el congelado de capas o el número de pasos de difusión, al estar el código y las configuraciones documentados.
- Ajuste fino sobre nuevos datasets de manipulación: al ser una política LeRobot autocontenida con licencia MIT, puede reentrenarse sobre datasets propios en formato LeRobot para adaptar el control a otros brazos o tareas.
- Prototipado de asistentes robóticos de laboratorio: el modelo traduce instrucciones en lenguaje natural en secuencias de acciones, lo que permite construir demos de manipulación guiada por voz o texto en entornos simulados.
- Docencia e investigación académica en robótica: su licencia permisiva y su tamaño moderado (4,45 mil millones de parámetros) lo hacen apto para cursos y proyectos de posgrado que requieran un VLA funcional sin coste de licencia.
- Generación de datos sintéticos de trayectorias: ejecutar la política en simulador para producir rollouts etiquetados que alimenten el entrenamiento de políticas más pequeñas o de modelos de recompensa.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CALVIN ABC -> D (1.000 secuencias de evaluación) | Longitud media de secuencia completada | 4,142 |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-10 GB solo para pesos, más memoria para activaciones y el procesador de imágenes; se recomienda un mínimo de 16-24 GB para operar con comodidad.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a escala; RTX 4090 (24 GB) para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090 y, presumiblemente, en GPUs de 24 GB; no se dispone de datos de cuantización para reducir requisitos por debajo de bf16.
- Opciones de despliegue: LeRobot con la herramienta `concertina-eval`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, dado que es una política robótica y no un modelo de lenguaje generativo convencional.
- Latencia y throughput: no disponibles. El entrenamiento de referencia usó 8 GPUs con batch size 192 y 5.000 actualizaciones, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark CALVIN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Concertina CALVIN ABC -> D | 4,45 mil millones | no disponible | Longitud media 4,142 | MIT | Hugging Face (LeRobot) |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos VLA comparables (por ejemplo, OpenVLA, RT-2 o pi0) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Es un checkpoint especializado en el benchmark CALVIN ABC -> D; su rendimiento fuera de ese entorno o de brazos con cinemática distinta no está documentado.
- No se han publicado análisis de sesgos, alucinación o robustez ante instrucciones ambiguas o adversariales.
- La longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar un comportamiento multilingüe fiable.
- Aunque la licencia MIT permite uso comercial, el modelo depende del backbone Bard-VL y del dataset CALVIN; conviene verificar las condiciones de esos componentes antes de un despliegue comercial.
- El uso en robots reales requiere validación de seguridad: no hay datos publicados sobre tasas de fallo, límites de par o comportamientos ante situaciones no vistas.
- El número de descargas (7) y de likes (0) indica que es un checkpoint reciente y poco validado por la comunidad; la reproducibilidad de los resultados depende de las configuraciones incluidas en el repositorio.
- El resultado de 4,142 corresponde a una configuración de evaluación concreta (cuatro workers reclamando secuencias de forma dinámica); otras configuraciones pueden arrojar cifras distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Traly/concertina-calvin
- Modelo base: https://huggingface.co/Traly/concertina-pretrain-90k
- Dataset de entrenamiento: https://huggingface.co/datasets/Traly/calvin_abc_d-lerobot
- LeRobot (librería): https://github.com/huggingface/lerobot
- Benchmark CALVIN: no disponible en la información proporcionada
- Artículo (referencia bibliográfica citada): Wang et al., "Concertina: Embodying Manipulation and Cognition in One Diffusion Vision-Language Model", 2026 (sin URL en la información disponible)
