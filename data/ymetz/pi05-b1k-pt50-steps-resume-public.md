# ymetz/pi05-b1k-pt50-steps-resume-public

## Resumen

Este repositorio no contiene un modelo listo para usar, sino una coleccion de checkpoints de entrenamiento reanudables de una politica pi0.5 (familia openpi) entrenada sobre demostraciones de BEHAVIOR-1K 2026. Lo publica el usuario ymetz y su proposito es permitir reanudar un entrenamiento interrumpido con el script de entrenamiento de openpi-comet mediante la opcion `--resume`, tras colocar cada carpeta de step en la ruta `<checkpoint_base_dir>/<exp>/<step>/`.

El contenido son varios directorios Orbax, uno por step de entrenamiento; cada uno incluye los parametros, el `train_state` con el estado del optimizador y los `assets` con las estadisticas de normalizacion de la variante pt50. El repositorio ocupa 32,2 GB, lo que es coherente con el peso añadido del estado del optimizador frente a una copia de solo inferencia.

Es relevante ahora por dos motivos: la experimentacion en robotica de manipulacion de horizonte largo sobre BEHAVIOR-1K esta en plena expansion, y reanudar un entrenamiento de este tipo sin publicar el `train_state` es inviable. El autor publica ademas copias de solo inferencia en un repositorio aparte, lo que separa claramente el artefacto de entrenamiento del artefacto de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de politica pi0.5 / openpi; la model card no describe la arquitectura interna) |
| Parametros totales | no disponible (el tamano del repo, 32,2 GB, incluye estado del optimizador y no permite estimarlos) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican conversiones GGUF, AWQ ni GPTQ; el checkpoint esta en Orbax) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | Orbax (JAX): un directorio por step con `params`, `train_state` y `assets` (estadisticas de normalizacion pt50) |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | BEHAVIOR-1K 2026 demos |
| Modelo base | pi0.5 (openpi) |
| Tamano del repositorio | 32,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-10 / 2026-10-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. Lo unico verificable es que se trata de checkpoints de la politica pi0.5 dentro del ecosistema openpi y que el usuario los entreno sobre demostraciones de BEHAVIOR-1K 2026. El formato Orbax corresponde al ecosistema JAX, y el `train_state` incluye explicitamente el estado del optimizador, lo que es la condicion necesaria para reanudar el entrenamiento de forma determinista.

Cada carpeta representa un unico step de entrenamiento y los `assets` contienen las estadisticas de normalizacion de la variante pt50. No se especifican en la model card el numero de tokens o de transiciones de entrenamiento, la composicion del dataset, la resolucion de las camaras, el esquema de condicionamiento por lenguaje ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovacion tecnica concreta (decodificacion especulativa, atencion lineal, destilacion) para esta ejecucion.

## Capacidades

- Control de robot de manipulacion: el artefacto es una politica entrenada para mapear observaciones y consignas a acciones sobre demostraciones de BEHAVIOR-1K, no un modelo de lenguaje generalista.
- Reanudacion de entrenamiento: capacidad principal del repositorio; el `train_state` con el optimizador permite continuar el entrenamiento desde el step exacto en que se interrumpio.
- Normalizacion reproducible: los `assets` con las estadisticas pt50 permiten reconstruir el preprocesado de observaciones y acciones usado durante el entrenamiento.
- Evaluacion en simulacion: al proceder de BEHAVIOR-1K 2026 demos, su uso previsto esta ligado a entornos de simulacion de tareas domesticas de horizonte largo.
- Inferencia: no es la funcion de este repositorio; el autor remite a las copias de solo inferencia publicadas aparte.
- Soporte de tool calling, agentes, vision general, audio o modo de razonamiento explicito: no disponible (no se documenta nada de esto en la informacion proporcionada).

## Casos de uso

- Reanudar un entrenamiento interrumpido: colocar el directorio del step deseado en `<checkpoint_base_dir>/<exp>/<step>/` y lanzar el script de entrenamiento de openpi-comet con `--resume`; es el escenario para el que se publico el repositorio.
- Reproducibilidad de experimentos: disponer del mismo `train_state` y de las estadisticas pt50 permite repetir una ejecucion desde un punto intermedio sin volver a entrenar desde cero, algo critico cuando el coste por ejecucion es alto.
- Ajuste fino posterior sobre BEHAVIOR-1K: partir de un step ya avanzado en lugar de inicializar desde el modelo base, reduciendo el numero de pasos necesarios para adaptar la politica a una variante del dataset.
- Evaluacion comparativa de checkpoints intermedios: estudiar como evoluciona la politica entre steps (por ejemplo, si el rendimiento en tareas de horizonte largo mejora de forma monotona o si hay degradacion intermedia).
- Investigacion en aprendizaje por imitacion: usar los checkpoints como linea base controlada con estadisticas de normalizacion conocidas para comparar variantes de objetivo de entrenamiento, aumentacion de datos o esquemas de condicionamiento.
- Analisis del estado del optimizador: inspeccionar el `train_state` para estudiar dinamica de entrenamiento, magnitudes de gradiente acumuladas o interacciones con el ajuste de la tasa de aprendizaje.
- Generacion de copias de solo inferencia: derivar desde estos checkpoints artefactos de despliegue, siguiendo el procedimiento que el autor aplico para publicar `ymetz/pi05-b1k-pt50-steps`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas de BEHAVIOR-1K ni comparaciones con otras politicas, y el repositorio no aporta curvas de entrenamiento ni tasas de exito por tarea.

## Requisitos de hardware

- Tamano de almacenamiento: 32,2 GB para el repositorio completo; cada step incluye parametros mas estado del optimizador, por lo que el espacio necesario crece con el numero de steps conservados.
- VRAM para inferencia: no disponible; depende del tamano real de los parametros, que no se publica. Para desplegar la politica conviene partir de la copia de solo inferencia en lugar de estos checkpoints.
- VRAM para reanudar entrenamiento: no disponible. Como referencia de orden de magnitud, reanudar requiere cargar parametros, estado del optimizador y activaciones, por lo que el requisito de memoria es sustancialmente mayor que el de inferencia y se situa por encima del espacio en disco del checkpoint.
- GPU recomendadas: no disponible. No se especifica si el entrenamiento se realizo en A100, H100 u otro acelerador, ni la configuracion de memoria empleada.
- GPU de consumo: no disponible. La viabilidad en RTX 4090 o similar no puede afirmarse sin conocer el numero de parametros y el formato de pesos.
- Opciones de despliegue: el entrenamiento y la reanudacion se realizan con el script de openpi-comet (JAX, checkpoints Orbax). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos de lenguaje y no a politicas de robot.
- Latencia y throughput: no disponible. En robotica de manipulacion la frecuencia de control es un requisito critico y no se aporta ningun dato al respecto.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Permite reanudar entrenamiento | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ymetz/pi05-b1k-pt50-steps-resume-public | Checkpoints de entrenamiento pi0.5 (BEHAVIOR-1K 2026) | Si (`train_state` con optimizador) | Orbax (JAX) | no disponible | Publico en HuggingFace |
| ymetz/pi05-b1k-pt50-steps | Copias de solo inferencia, misma ejecucion | No | no disponible | no disponible | Publico en HuggingFace |
| pi0.5 base (openpi) | Politica base sin el ajuste sobre BEHAVIOR-1K | no disponible | Orbax (JAX) | no disponible en esta ficha | Referenciado por el autor |

No se dispone de datos de parametros, contexto ni rendimiento para contrastar con alternativas de la misma categoria como OpenVLA, GR00T N1 o RDT-1B, por lo que no se incluye una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de inferencia: el repositorio esta pensado para reanudar entrenamiento. Para desplegar la politica hay que usar las copias de solo inferencia o convertir los checkpoints.
- Licencia no declarada: la model card no indica licencia. No se debe asumir que hereda la licencia de openpi ni usar el artefacto en produccion o en productos comerciales sin aclararlo con el autor.
- Ausencia total de benchmarks: sin tasas de exito ni metricas de evaluacion no es posible estimar la calidad de la politica entrenada ni compararla con alternativas.
- Documentacion minima: faltan datos de arquitectura, parametros, contexto, idiomas, composicion del dataset y procedimiento de entrenamiento, lo que dificulta la reproducibilidad externa.
- Riesgo de sobreajuste al simulador: al proceder de demostraciones de BEHAVIOR-1K, el comportamiento en un robot real no esta garantizado y requeriria validacion especifica de transferencia sim-a-real.
- Descargas y likes a cero: el repositorio no tiene validacion por parte de la comunidad, por lo que no hay evidencia externa de que los checkpoints carguen o se reproduzcan correctamente.
- Dependencia de herramientas concretas: la reanudacion exige el script de openpi-comet y el respeto estricto de la estructura de rutas `<checkpoint_base_dir>/<exp>/<step>/`; cualquier desviacion puede impedir la restauracion.
- Riesgo de incompatibilidad de versiones: los checkpoints Orbax son sensibles a la version de JAX, orbax-checkpoint y del propio codigo de openpi-comet, por lo que conviene fijar el entorno exacto del autor.
- Fecha de publicacion futura respecto al conocimiento habitual de estos modelos: los metadatos indican creacion el 2026-10-10, dato a tener en cuenta si se referencia el artefacto.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/ymetz/pi05-b1k-pt50-steps-resume-public
- Copias de solo inferencia (citadas por el autor): https://huggingface.co/ymetz/pi05-b1k-pt50-steps
- Repositorio openpi-comet (script de entrenamiento con `--resume`): no se ha encontrado enlace en la busqueda web; consultar la referencia del autor.
- Paper o blog tecnico de pi0.5: no se ha encontrado enlace en la busqueda web.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las coincidencias obtenidas corresponden a ChatGPT y no guardan relacion con el artefacto descrito.
