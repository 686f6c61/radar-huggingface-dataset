# zachttang/pi05-fold-cloth-lora-50pct

## Resumen

pi05-fold-cloth-lora-50pct es un checkpoint de inferencia derivado de pi05 (OpenPI), el modelo de politica visuomotora de tipo vision-language-action (VLA) desarrollado por Physical Intelligence. Lo publica el usuario zachttang en Hugging Face como resultado de un ajuste fino con LoRA sobre el checkpoint base `pi05_base`, entrenado especificamente para la tarea robotica de doblar un mantel por la mitad. No es un modelo de lenguaje al uso: es una politica que mapea observaciones visuales y estados de articulaciones a acciones motoras.

El checkpoint proviene de la ejecucion de entrenamiento `fold_cloth_50pct_s42_bs128_e7.5_72567`, con configuracion `pi05_fold_cloth_real_lora`. El sufijo "50pct" indica que se selecciono el 50 % de los episodios de entrenamiento disponibles, y "lora" que se aplico ajuste fino de bajo rango en lugar de ajuste completo. La instruccion de tarea asociada es "Fold the tablecloth in half".

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de adaptacion de un VLA de proposito general a una tarea de manipulacion deformable mediante LoRA, con un presupuesto de 7,5 epocas y batch de 128. El repositorio ocupa 6,3 GB y contiene exclusivamente pesos de inferencia en formato Orbax, sin estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi05 de OpenPI); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible (el autor no la ha especificado) |
| Formato de pesos | Orbax (checkpoint JAX), no compatible con `transformers.from_pretrained` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre el checkpoint base pi05 (`gs://openpi-assets/checkpoints/pi05_base/params`), implementado en el framework OpenPI con JAX y serializado en Orbax. La configuracion empleada, `pi05_fold_cloth_real_lora`, incorpora adaptacion de articulaciones y pinza de tipo ALOHA, acciones en espacio delta de articulaciones y tres camaras de entrada: `cam_high`, `cam_wrist_left` y `cam_wrist_right`. No se especifican en la informacion disponible el numero de capas, dimension oculta, rango del adaptador LoRA ni el numero total de parametros.

El entrenamiento uso semilla 42, batch de 128 y un presupuesto de 7,5 epocas sobre el 50 % de los episodios del conjunto de doblado de mantel. Solo se publica el checkpoint del paso 1356, junto con los assets necesarios (estadisticas de normalizacion e identificadores de episodios seleccionados). No se indica si hubo RLHF, DPO ni otras fases de alineamiento, ni la composicion exacta del dataset mas alla de la tarea de doblado.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: produce comandos de articulaciones y pinza en espacio delta a partir de imagenes y estado del robot.
- Percepcion visual multi-camara: consume simultaneamente vista cenital y dos vistas de muneca.
- Seguimiento de instrucciones en lenguaje natural en ingles ("Fold the tablecloth in half").
- Manipulacion de objetos deformables (tela) en un entorno real de tipo ALOHA.
- Ejecucion de una politica de imitacion entrenada por comportamiento clonado; no se documenta razonamiento multi-paso explicito ni tool calling.
- No se documentan capacidades de generacion de texto, codigo, matematicas, audio ni dialogos generales.

## Casos de uso

- Investigacion en manipulacion deformable: reproducir el ajuste fino de pi05 sobre tareas de plegado de tela para estudiar la transferencia de VLA generales a tareas especificas con presupuestos de entrenamiento reducidos.
- Punto de partida para ajuste LoRA adicional: el checkpoint puede servir como inicializacion para nuevas tareas de plegado con variaciones de tela o de configuracion de camaras, aprovechando que el adaptador de bajo rango ya esta entrenado.
- Validacion de pipelines OpenPI: sirve para comprobar que la infraestructura de inferencia (carga de Orbax, normalizacion, mapeo de acciones ALOHA) funciona de extremo a extremo antes de lanzar entrenamientos propios.
- Benchmark interno de referencia: al fijar semilla, batch y numero de epocas, permite comparar variantes (LoRA frente a ajuste completo, 50 % frente a 100 % de episodios) bajo condiciones controladas.
- Demostracion en laboratorio de robotica: ejecucion de una politica de plegado en un montaje ALOHA real para divulgacion o docencia.
- Estudio de eficiencia de LoRA en VLA: analizar cuanto rendimiento de tarea se conserva al entrenar solo adaptadores de bajo rango durante 7,5 epocas sobre la mitad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de la politica aun no se han reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 6,3 GB, lo que da una cota inferior del espacio necesario para cargar los pesos, pero el consumo real depende del grafo JAX y de los buffers de inferencia.
- GPU recomendadas: no disponible. OpenPI con JAX puede ejecutarse en GPU NVIDIA con soporte CUDA, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el peso del checkpoint (6,3 GB) sugiere que podria caber en GPUs con 12-16 GB o mas, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: carga mediante el codigo personalizado de OpenPI y la configuracion `pi05_fold_cloth_real_lora`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un checkpoint Orbax de JAX para robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-fold-cloth-lora-50pct | VLA ajustado por LoRA para plegado de tela | no disponible | no disponible | no disponible | Hugging Face (Orbax) |
| pi05 base (OpenPI) | VLA generalista | no disponible | no disponible | no disponible en la informacion | Checkpoint base referenciado por el autor |
| Otros VLA roboticos (p. ej. RT-2, OpenVLA) | VLA generalistas | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica de plegado.
- Licencia sin especificar: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- El checkpoint esta especializado en una unica tarea ("Fold the tablecloth in half") y en una configuracion concreta de robot y camaras; no generaliza a otras tareas sin nuevo entrenamiento.
- Requiere el codigo personalizado de OpenPI y la configuracion exacta para cargarse; no funciona con herramientas estandar de Hugging Face.
- Solo se publica el paso 1356 y se excluye el estado del optimizador, lo que impide reanudar el entrenamiento desde este repositorio.
- El modelo opera en ingles y sobre observaciones visuales reales, por lo que hereda los sesgos y limitaciones del dataset de demostraciones original.
- Riesgo de alucinacion en el sentido de acciones no validas o inseguras en entornos distintos al de entrenamiento; requiere supervision y limites de seguridad en el robot.
- No se documentan sesgos especificos ni limitaciones de contexto mas alla de las inherentes a la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-lora-50pct
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base/params` (ruta interna de OpenPI, no es una URL web)
- Repositorio OpenPI (referencia del framework, no enlazado en la model card): no disponible en la informacion proporcionada
- Paper de pi05: no disponible en la informacion proporcionada
