# Travor278/pi05-putcab-concurrent-train50-v4-lora-10k

## Resumen

PI0.5 PutCab-Concurrent-Train50-V4 LoRA 10k es un ajuste fino mediante LoRA del modelo base PI0.5 en su implementación JAX (openpi), publicado por el usuario Travor278. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica: recibe tres vistas RGB nativas junto con el estado del robot y genera acciones motrices continuas. El ajuste se ha realizado sobre el conjunto de datos Shiki42/PutCab-Concurrent-Train50-V4, compuesto por 50 episodios y 11.038 fotogramas, para una única tarea formulada con el prompt "Open the cabinet drawer with the left arm and place the object into it with the right arm".

La relevancia del modelo es doble. Por un lado, demuestra un flujo de trabajo reproducible de ajuste fino con LoRA (rango y alpha 16 sobre PaliGemma, 32 en el action expert) sobre un VLA grande, permitiendo adaptar un modelo base a una tarea concreta con un coste de entrenamiento acotado: dos H100 de 80 GB y 10.000 actualizaciones con batch global 16. Por otro, la model card es inusualmente detallada en trazabilidad (commit del base, commit del dataset, configuración resuelta, hashes de arrays decodificados), lo que la convierte en material útil para investigación en reproducibilidad de entrenamientos robóticos.

El repositorio ocupa 6,3 GB e incluye el árbol completo de parámetros de inferencia (pesos base, pesos LoRA y activos de normalización) en formato Orbax, con raíz de checkpoint `10000/`. El autor declara explícitamente que no se reclama ninguna tasa de éxito en rollout en bucle cerrado, por lo que el modelo debe considerarse un artefacto de investigación y no un componente validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) construida sobre PaliGemma con un action expert dedicado; implementacion en JAX (libreria openpi) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye con activaciones y pesos congelados en bf16 y pesos entrenables en float32 |
| Idiomas soportados | no disponible (el prompt de la tarea esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint JAX); raiz de checkpoint `10000/`; tamano del repositorio 6,3 GB |
| Dimension del estado/acciones | 14 dimensiones nativas absolutas, con padding a 32 |
| Vistas de entrada | 3 vistas RGB nativas redimensionadas a 224x224 |
| Dataset de ajuste | Shiki42/PutCab-Concurrent-Train50-V4, 50 episodios, 11.038 fotogramas, 16,67 FPS |
| Metodo de ajuste | LoRA (rango/alpha 16 en PaliGemma, 32 en el action expert) con vision y proyecciones entrenables |
| Hardware de entrenamiento | 2x NVIDIA H100 80 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base PI0.5 en JAX (`XinY0201/openpi-pi05-base-jax`, revision `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), que corresponde al inicializador canonico `gs://openpi-assets/checkpoints/pi05_base/params`, y utiliza un unico action expert estandar. Sobre esa base se aplica un ajuste por LoRA: rango y alpha 16 en el backbone PaliGemma y 32 en el action expert, con un filtro de congelacion de referencia que mantiene entrenables la vision y las proyecciones. Las activaciones y los pesos congelados se manejan en bf16, mientras que los pesos entrenables se mantienen en float32.

El entrenamiento se ejecuto con dos H100 de 80 GB, batch global de 16, semilla 87431 y 10.000 actualizaciones (160.000 fotogramas muestreados). El optimizador es AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8, weight decay 1e-10, clipping 1 y sin EMA. La tasa de aprendizaje sigue una curva coseno fijada a 30.000 pasos con 1.000 de warmup, pico de 2,5e-5 y valor final de 2,5e-6, deteniendose el entrenamiento en el paso 10.000. El entorno de ejecucion fue un contenedor NGC PyTorch 25.02 sobre el que se construyo un entorno JAX separado. El autor indica que no se reclama equivalencia byte a byte con el runtime archivado historico de CTR.

En cuanto a los datos, el conjunto PutCab-Concurrent-Train50-V4 contiene 50 episodios y 11.038 fotogramas a 16,67 FPS, con estado y acciones nativos de 14 dimensiones en valores absolutos (sin conversion de unidades tipo delta o Aloha y sin mascara de inactividad). Las tres vistas RGB nativas se mapean mediante el `training_config.py` adjunto y se redimensionan a 224x224; el estado y las acciones se rellenan hasta 32 dimensiones y el horizonte es de 50 pasos. El autor documenta que se verificaron estadisticas independientes del dataset y comprobaciones reales de lector y tokenizador antes de la asignacion de GPU, que cada parametro y array del optimizador se restauro y verifico como finito, y que se registraron hashes de arrays decodificados.

## Capacidades

- Generacion de acciones roboticas continuas de 14 dimensiones a partir de observaciones visuales y de estado, con horizonte de 50 pasos por inferencia.
- Fusion de tres vistas RGB (224x224) con estado proprioceptivo del robot en una unica representacion multimodal.
- Ejecucion de una tarea bimanual concreta: abrir un cajon de armario con el brazo izquierdo y depositar un objeto en su interior con el brazo derecho, segun el prompt de entrenamiento.
- Condicionamiento por instruccion en lenguaje natural (prompt fijo de la tarea en el dataset de ajuste).
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponibles mas alla de las tres vistas RGB descritas.
- Trazabilidad de entrenamiento: el repositorio `10000/experiment/` incluye versiones de runtime y paquetes, configuracion resuelta, commits y parches frente al upstream fijado, binding de GPU, manifiestos de ficheros de base y dataset, normalizacion, puertas de validacion de CPU y guardado, parches de compatibilidad e historial de trabajos.

## Casos de uso

- Manipulacion bimanual de cajones en entorno de laboratorio: el modelo genera directamente la secuencia de 50 acciones para abrir el cajon y colocar el objeto, por lo que puede conectarse al bucle de control de un robot siempre que la tarea y la configuracion de camaras coincidan con las del dataset.
- Base para ajuste fino posterior en tareas de apertura y deposito: al ser un adaptador LoRA sobre PI0.5, permite continuar el entrenamiento con nuevos episodios sin partir del modelo base completo.
- Reproducibilidad de experimentos de VLA: la model card incluye commits exactos, semilla, configuracion de optimizador y manifiestos, lo que facilita replicar el ajuste o auditar discrepancias entre ejecuciones.
- Estudio de eficiencia de LoRA en modelos de robotica: con 10.000 actualizaciones sobre dos H100 y rango 16 en el backbone, sirve como punto de comparacion frente a ajustes completos o a recetas con rangos mayores.
- Referencia para pipelines de datos propios: el modelo documenta el mapeo de vistas RGB, el padding a 32 dimensiones y el horizonte 50, util para disenar la captura y el preprocesado de nuevos datasets robóticos.
- Evaluacion de transferencia entre entornos: al no reclamar tasa de exito en bucle cerrado, es un candidato para medir la brecha entre perdida de entrenamiento y ejecucion real en brazos roboticos con camaras fijas.
- Comparacion controlada con otras ejecuciones sobre el mismo dataset: la existencia de checkpoints hermanos (por ejemplo, la variante e113 de Shiki42) permite aislar el efecto de cambios de receta manteniendo base y datos.
- Instrumentacion de investigacion en normalizacion y acciones absolutas: el uso de estado/acciones absolutos de 14 dimensiones sin conversion delta ni mascara de inactividad permite estudiar el impacto de esas decisiones de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna afirmacion de tasa de exito en rollout en bucle cerrado, y no se proporcionan metricas de MMLU, HumanEval, GSM8K ni de exito en tarea para este checkpoint. No se incluyen por tanto cifras comparativas verificables.

## Requisitos de hardware

- Entrenamiento declarado: 2x NVIDIA H100 80 GB, con batch global 16, activaciones y pesos congelados en bf16 y pesos entrenables en float32.
- Tamano del artefacto: 6,3 GB de repositorio, que incluye pesos base, pesos LoRA y activos de normalizacion. No se indica el desglose por componente.
- VRAM de inferencia: no disponible de forma oficial. Como estimacion orientativa a partir del tamano del repositorio, la carga de pesos en bf16 requiere del orden de 7-9 GB de VRAM, a los que hay que sumar activaciones y memoria del codigo JAX/XLA; esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponibles. Dado el uso de JAX y el tamano del checkpoint, cabria esperar ejecucion en GPUs de datacenter (A100, H100) y, con reservas, en GPUs de consumo con 24 GB o mas, como RTX 3090 o RTX 4090; se trata de una deduccion, no de un dato aportado.
- Opciones de despliegue: la libreria declarada es openpi sobre JAX y el checkpoint esta en formato Orbax, por lo que el despliegue requiere el runtime de OpenPI/JAX. Formatos GGUF, llama.cpp, Ollama, vLLM o TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia derivada del dataset, un horizonte de 50 acciones a 16,67 FPS cubre aproximadamente 3 segundos de trayectoria por inferencia, siempre que la frecuencia de control efectiva coincida con la del dataset.
- Estado del optimizador: no se distribuye; permanece en la plataforma de entrenamiento, por lo que el checkpoint no permite reanudar el entrenamiento tal cual.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Actualizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travor278/pi05-putcab-concurrent-train50-v4-lora-10k | PI0.5 JAX (`XinY0201/openpi-pi05-base-jax`, rev. 5e62884) | Shiki42/PutCab-Concurrent-Train50-V4, 50 episodios / 11.038 fotogramas | 10.000, batch 16, semilla 87431 | no disponible | publico en HuggingFace, 0 descargas |
| Shiki42/pi05-putcab-concurrent-train50-lora10k-e113-20260912 | Mismo base PI0.5 JAX (rev. 5e62884) | Mismo dataset, 50 episodios / 11.038 fotogramas | 10.000, batch 16, semilla 87431, 160.000 fotogramas muestreados | no disponible | publico en HuggingFace |
| XinY0201/openpi-pi05-base-jax | Modelo base PI0.5 | No aplica (modelo base) | No aplica | no disponible | publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes, ya que ninguna de las fichas consultadas publica tasas de exito en tarea ni metricas de benchmark. Las diferencias documentadas entre el modelo descrito y la variante e113 se limitan al identificador de ejecucion y al etiquetado del checkpoint, manteniendo receta, base y datos equivalentes segun la informacion disponible.

## Limitaciones y advertencias

- Modelo de tarea unica: el ajuste esta especializado en el prompt "Open the cabinet drawer with the left arm and place the object into it with the right arm". Fuera de esa tarea no hay evidencia de comportamiento util.
- Sin validacion en bucle cerrado: el autor declara explicitamente que no se realiza ninguna afirmacion de tasa de exito en rollout. No hay garantia de que las acciones generadas funcionen en un robot real.
- Licencia no disponible: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo juridico relevante para cualquier integracion en produccion.
- Idiomas no disponibles: no se documenta soporte multilingue; el unico prompt conocido esta en ingles.
- Dependencia de la plataforma de robot y de las camaras: la tarea se entreno con tres vistas RGB nativas concretas, estado/acciones absolutos de 14 dimensiones y padding a 32. Cualquier cambio de cinematica, numero de camaras, calibracion o convencion de unidades exige reentrenamiento.
- Riesgo de sobreajuste al dataset: solo 50 episodios y 10.000 actualizaciones, sin EMA, lo que puede reducir la robustez ante variaciones de iluminacion, posicion inicial u objetos distintos.
- Sin estado del optimizador: el checkpoint no incluye el estado del optimizador, por lo que no puede reanudarse el entrenamiento exactamente desde el punto de parada.
- Entorno de ejecucion no identico al archivado: el autor senala que el contenedor NGC PyTorch 25.02 con JAX construido aparte no se reclama byte-identico al runtime historico de CTR, lo que puede introducir diferencias numericas menores.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al ser un modelo de accion y no de texto libre, el modo de fallo esperable es la generacion de trayectorias fisicamente invalidas o inseguras, no la invencion de texto.
- Sesgos conocidos: no disponible; no se han publicado analisis de sesgo ni de cobertura del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-concurrent-train50-v4-lora-10k
- Modelo hermano (misma base, mismo dataset): https://huggingface.co/Shiki42/pi05-putcab-concurrent-train50-lora10k-e113-20260912
- Modelo base PI0.5 JAX referenciado en la model card: https://huggingface.co/XinY0201/openpi-pi05-base-jax (revision 5e62884fcf8cb8f9fc693c9163ea18d3e3739658)
- Dataset de ajuste referenciado en la model card: https://huggingface.co/datasets/Shiki42/PutCab-Concurrent-Train50-V4 (revision a503203b294e057eb24f783b9e7210e523487d63)
- Inicializador canonico citado en la model card: gs://openpi-assets/checkpoints/pi05_base/params
- Documentacion adicional dentro del repositorio: carpeta `10000/experiment/` (versiones de runtime y paquetes, configuracion resuelta, manifiestos, parches de compatibilidad e historial de trabajos)
- Papers, blogs o demos adicionales: no disponible
- Nota sobre la busqueda web: los resultados recuperados corresponden a contenidos sobre el draft de la NBA de 2026 y no guardan relacion con el modelo, por lo que no se han utilizado como fuente.
