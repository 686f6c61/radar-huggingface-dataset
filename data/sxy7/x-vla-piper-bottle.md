# SXY7/X-VLA-Piper-bottle

## Resumen

X-VLA Piper-bottle es un checkpoint de ajuste fino completo (full-parameter fine-tuning) del modelo base X-VLA-Pt, desarrollado por el usuario SXY7 y publicado en HuggingFace. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado a robótica, concretamente a la manipulación de una tarea de agarre de botella con el robot Piper. El modelo parte de la arquitectura X-VLA, un transformer multimodal que combina observaciones visuales y propiocepción para predecir acciones motoras de siete dimensiones.

El repositorio contiene 15 checkpoints completos, desde el paso 10.000 hasta el 150.000, cada uno de aproximadamente 10,56 GB. Cada checkpoint incluye los pesos en `model.safetensors`, las configuraciones de modelo, procesador y tokenizador, un manifiesto `piper_manifest.json` con estadísticas de normalización y metadatos del dataset, y un `training_state.pt` con el estado del optimizador AdamW, el paso, el estado RNG y los argumentos de entrenamiento.

La relevancia de este modelo es acotada pero específica: sirve como ejemplo de ajuste fino de un VLA sobre una tarea robótica concreta y proporciona checkpoints intermedios que permiten estudiar la evolución del entrenamiento. No obstante, la información pública es muy limitada: no se declaran licencia, idiomas, benchmarks ni detalles del dataset más allá de lo que aparece en el manifiesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (vision-lenguaje-accion, transformer multimodal); detalles internos no disponibles |
| Parametros totales | no disponible (tamano del checkpoint ~10,56 GB en safetensors, lo que sugiere un modelo de varios miles de millones de parametros, pero el dato exacto no se declara) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `training_state.pt` (PyTorch) |
| Entradas | RGB superior y RGB de muneca derecha, 224x224; tercera vista enmascarada; 7 valores de propiocepcion (juntas/pinza) |
| Salidas | 30 acciones absolutas de 7 dimensiones (juntas/pinza) |
| Configuracion de accion | `action_mode=auto`, `real_action_dim=7`, `max_action_dim=20` |
| Dependencias | X-VLA commit `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2`, Transformers 4.51.3, libreria `piper` |

## Arquitectura y entrenamiento

El modelo se basa en X-VLA, un modelo de vision-lenguaje-accion que procesa observaciones visuales (dos vistas RGB de 224x224) y propiocepcion (siete valores de juntas y pinza) para predecir secuencias de acciones motoras de siete dimensiones. La tercera vista del modelo aparece enmascarada en esta configuracion, lo que indica una adaptacion a un setup de robot con dos camaras activas. La salida son 30 acciones absolutas, es decir, un horizonte de prediccion de 30 pasos.

El entrenamiento consistio en un ajuste fino completo (full-parameter) del modelo base `2toINF/X-VLA-Pt` sobre una tarea de agarre de botella con el robot Piper. Se conservan 15 checkpoints intermedios (pasos 10.000 a 150.000, en incrementos de 10.000), cada uno con el estado completo de AdamW, el paso, el estado RNG y los argumentos de entrenamiento. El autor indica que el entrenador de recuperacion no preservo un cursor exacto del dataset iterable, y que los checkpoints de escritura incompleta fueron excluidos. No se especifican el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; el manifiesto `piper_manifest.json` contiene la normalizacion de la tarea y los metadatos del dataset, pero su contenido no se detalla en la model card.

## Capacidades

- Prediccion de acciones motoras de 7 dimensiones (juntas y pinza) a partir de observaciones visuales y propiocepcion.
- Procesamiento de dos vistas RGB (superior y muneca derecha) a 224x224, con la tercera vista enmascarada.
- Generacion de secuencias de 30 acciones absolutas por inferencia.
- Ajuste especifico a la tarea de agarre de botella con el robot Piper.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes o multilingueismo; es un modelo puramente de politica robotica.
- No se declara soporte de thinking mode, audio ni otras modalidades.

## Casos de uso

- Control de robot Piper para agarre de botellas: el modelo recibe las imagenes de las camaras superior y de muneca y la propiocepcion, y emite 30 acciones absolutas de juntas y pinza que pueden ejecutarse en el controlador del robot. Es adecuado porque esta ajustado especificamente a esa tarea y a esa configuracion de camaras.
- Investigacion en aprendizaje por imitacion: los 15 checkpoints intermedios permiten estudiar la evolucion de la politica durante el entrenamiento y comparar el rendimiento en distintos pasos.
- Reproduccion de experimentos de fine-tuning de VLA: el repositorio incluye el estado completo de AdamW, argumentos de entrenamiento y manifiesto de normalizacion, lo que facilita reanudar o replicar el entrenamiento.
- Evaluacion de robustez de politicas roboticas: al disponer de multiples checkpoints, se puede medir la estabilidad de la politica ante variaciones de iluminacion, posicion de la botella o ruido en la propiocepcion.
- Base para ajuste fino en tareas relacionadas: el checkpoint puede servir como punto de partida para otras tareas de manipulacion con el mismo robot Piper, aunque requerira un nuevo ajuste con datos propios.
- Docencia y divulgacion: como ejemplo completo de pipeline de entrenamiento de un VLA con checkpoints verificados por hash SHA256, util para explicar el ciclo completo de un proyecto de robotica con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Dado que cada checkpoint ocupa aproximadamente 10,56 GB en safetensors, se necesita al menos esa cantidad de memoria para cargar los pesos en precision completa; en la practica se requerira mas VRAM para activaciones y buffers.
- GPU recomendadas: no disponibles. Por tamano del checkpoint, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) seria el minimo razonable para cargar el modelo en precision completa, pero el dato no esta confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) o superiores, pero no confirmado.
- Opciones de despliegue: la model card indica usar la integracion X-VLA Piper con el commit `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2` de X-VLA, Transformers 4.51.3 y cargar con `XVLA` y `XVLAProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA Piper-bottle (este) | no disponible (~10,56 GB en safetensors) | no disponible | Agarre de botella con robot Piper | no disponible | HuggingFace, 15 checkpoints |
| X-VLA-Pt (modelo base) | no disponible | no disponible | VLA preentrenado general | no disponible | HuggingFace (`2toINF/X-VLA-Pt`) |
| Otros VLA roboticos (p. ej. OpenVLA, RT-2) | no disponible en esta informacion | no disponible | Manipulacion robotica general | no disponible | No disponible en esta informacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de cualquier uso productivo.
- El modelo esta ajustado a una unica tarea (agarre de botella) y a una configuracion concreta de robot (Piper) y camaras (superior y muneca derecha); no generalizara a otras tareas, objetos o setups sin nuevo ajuste.
- La tercera vista del modelo esta enmascarada, lo que limita la percepcion a dos camaras.
- No se declaran idiomas ni capacidades de lenguaje; no es un modelo de texto.
- El autor advierte que el entrenador de recuperacion no preservo un cursor exacto del dataset iterable, lo que puede afectar a la reproducibilidad exacta del entrenamiento.
- Riesgo de sobreajuste a las condiciones del dataset de entrenamiento (iluminacion, posicion de la botella, fondo); no se han publicado evaluaciones de robustez.
- No hay benchmarks publicados, por lo que el rendimiento real de la politica es desconocido.
- Los checkpoints se publican con verificacion SHA256, pero el autor indica que los archivos aparecen durante la subida y que `complete.json` solo se publica tras la verificacion; conviene comprobar la integridad antes de usarlos.
- El modelo requiere versiones muy concretas de dependencias (commit especifico de X-VLA, Transformers 4.51.3), lo que puede complicar la integracion en entornos con otras versiones.

## Enlaces

- HuggingFace: https://huggingface.co/SXY7/X-VLA-Piper-bottle
- Modelo base: https://huggingface.co/2toINF/X-VLA-Pt
- Repositorio X-VLA (commit referenciado): `6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2` (no se proporciona URL directa en la informacion disponible)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
