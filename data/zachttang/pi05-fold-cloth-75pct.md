# zachttang/pi05-fold-cloth-75pct

## Resumen

pi05-fold-cloth-75pct es un conjunto de checkpoints de inferencia derivados de una ejecucion de entrenamiento con OpenPI, el framework de entrenamiento y despliegue de políticas robóticas del proyecto Physical Intelligence (pi). El modelo resuelve una tarea concreta de manipulacion: doblar un mantel por la mitad ("Fold the tablecloth in half"), partiendo del checkpoint base `pi05_base` y aplicando fine-tuning sobre un subconjunto de episodios de entrenamiento (el 75 % del total, de ahi el sufijo `75pct`).

La ejecucion se identifica como `fold_cloth_75pct_s42_bs128_e15_71891`, con semilla 42, batch size 128 y un presupuesto de 15 epocas, usando la configuracion `pi05_fold_cloth_real`. Se publican tres checkpoints de retencion (pasos 4000, 8000 y 12000) en formato Orbax, no en formato Transformers, por lo que requieren el codigo y la configuracion personalizados de OpenPI para cargarse.

Es relevante como ejemplo reproducible de fine-tuning de un modelo vision-language-action (VLA) sobre una tarea de manipulacion deformable, aunque su utilidad practica esta limitada por la ausencia de resultados de evaluacion publicados, de licencia especificada y de cualquier metrica de rendimiento. No es un modelo de lenguaje general: es una política robótica de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi05 (OpenPI); no se detalla la arquitectura interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints Orbax en precision de entrenamiento) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible (el autor no la ha especificado) |
| Formato de pesos | Orbax (checkpoints JAX), con directorios `params/` y `assets/`; no es compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `pi05_base` y se ajusta con la configuracion `pi05_fold_cloth_real` dentro de OpenPI. La model card no describe la arquitectura interna de pi05 (tipo de transformer, mecanismo de atencion, encoder visual o esquema de difusion de acciones); solo indica que se trata de una política que consume imagenes de tres camaras (`cam_high`, `cam_wrist_left`, `cam_wrist_right`) y produce acciones de articulaciones en delta, con adaptacion de pinza y articulaciones estilo ALOHA.

El entrenamiento usa semilla 42, batch size 128 y 15 epocas sobre un subconjunto del 75 % de los episodios de entrenamiento. La model card menciona que las ejecuciones con `lora` usan fine-tuning LoRA y las demas usan fine-tuning completo, pero no aclara a cual de los dos corresponde esta ejecucion concreta. Los checkpoints publicados son de retencion (pasos 4000, 8000 y 12000) y excluyen deliberadamente el estado del optimizador. Los `assets` incluyen estadisticas de normalizacion e identificadores de los episodios seleccionados.

## Capacidades

- Ejecucion de una tarea de manipulacion robótica concreta: doblar un mantel por la mitad a partir de instruccion en lenguaje natural.
- Control de robot bimanual con acciones de articulaciones en delta y control de pinza (adaptacion ALOHA).
- Percepcion visual multi-camara: entrada desde camara superior y dos camaras de muneca.
- Condicionamiento por instruccion textual en ingles.
- Inferencia como política (prediccion de acciones), no generacion de texto libre.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Investigacion en manipulacion deformable: reproducir el fine-tuning de pi05 sobre una tarea de doblado de tela para estudiar la sensibilidad al subconjunto de datos (75 % de episodios) y al numero de pasos.
- Comparacion de checkpoints intermedios: los tres puntos de retencion (4000, 8000, 12000) permiten analizar la evolucion del aprendizaje y el sobreajuste a lo largo del entrenamiento.
- Base para fine-tuning adicional: el checkpoint puede servir como inicializacion para tareas relacionadas con telas o plegado en el mismo montaje de camaras y robot.
- Validacion de pipelines OpenPI: sirve para verificar la carga de checkpoints Orbax, las estadisticas de normalizacion y la configuracion `pi05_fold_cloth_real` en un entorno de despliegue.
- Docencia y demostraciones: ejemplo autocontenido de una ejecucion de entrenamiento VLA con hiperparametros documentados (semilla, batch, epocas).
- Estudio de ablaciones de datos: al fijar el 75 % de episodios, permite aislar el efecto de otros factores (pasos, LoRA frente a fine-tuning completo) en experimentos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de la política aun no se han reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano de pi05, que no se documenta.
- GPU recomendadas: no disponible. OpenPI y JAX son compatibles con GPUs NVIDIA, pero la model card no especifica modelos concretos.
- Viabilidad en GPU de consumo: no disponible; no puede confirmarse sin conocer el tamano del modelo.
- Opciones de despliegue: carga mediante el codigo y la configuracion personalizados de OpenPI (checkpoints Orbax con JAX). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-fold-cloth-75pct | Política VLA fine-tuned (tarea de plegado) | no disponible | no disponible | no disponible | Checkpoints Orbax en HF |
| pi05_base | Política VLA base de OpenPI | no disponible | no disponible | no disponible | Referenciado en `gs://openpi-assets` |
| Otras ejecuciones OpenPI de plegado de tela | Políticas VLA fine-tuned | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito de la tarea de plegado.
- Licencia no especificada: no puede asumirse uso comercial ni redistribucion; es un riesgo legal para produccion.
- Formato propietario de facto: los checkpoints Orbax requieren el codigo y la configuracion de OpenPI; no se cargan con herramientas estandar de Transformers.
- Especifico de un montaje: asume tres camaras concretas (`cam_high`, `cam_wrist_left`, `cam_wrist_right`) y una configuracion de robot tipo ALOHA; no es portable a otros hardware sin reentrenamiento.
- Solo instrucciones en ingles y una unica tarea; no generaliza a otras tareas de manipulacion.
- Subconjunto de datos reducido (75 % de episodios): puede introducir sesgos respecto a la distribucion completa de escenas.
- Riesgo de sobreajuste o de comportamiento fuera de distribucion no cuantificado.
- Estado del optimizador excluido: no es posible reanudar el entrenamiento desde estos checkpoints.
- Posible publicacion incompleta: la model card advierte que algunos checkpoints podrian seguir subiendose.

## Enlaces

- Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-75pct
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base/params` (no es un enlace web)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
