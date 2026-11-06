# SXY7/X-VLA-Piper-nesting_3dolls

## Resumen

X-VLA Piper: nesting_3dolls es un conjunto de checkpoints de ajuste fino completo (full-parameter fine-tuning) del modelo base 2toINF/X-VLA-Pt, un modelo de vision-lenguaje-accion (VLA) orientado a robotica. Lo publica el usuario SXY7 en Hugging Face y esta especializado en una tarea concreta de manipulacion robotica: el encaje de tres munecas (nesting_3dolls) sobre un robot Piper. El repositorio contiene 18 checkpoints completos, desde el paso 30 000 hasta el 200 000, cada uno de aproximadamente 10,56 GB, lo que situa el modelo en el orden de los miles de millones de parametros en precision de 16 bits (no se especifica el numero exacto).

El modelo resuelve el problema de mapear observaciones visuales y de propiocepcion a acciones motoras de siete dimensiones. Concretamente, recibe dos vistas RGB de 224x224 (camara superior y muneca derecha), siete valores medidos de articulaciones y pinza como propiocepcion, y predice treinta acciones absolutas de siete dimensiones. Es relevante para quienes trabajan en imitacion de politicas roboticas con el ecosistema Piper y quieran reutilizar un ajuste fino ya entrenado en lugar de partir del modelo base.

La ficha se basa unicamente en la model card y los metadatos publicados. No hay informacion sobre licencia, idiomas, benchmarks ni composicion del dataset de entrenamiento mas alla de las referencias a piper_manifest.json.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (X-VLA); detalles internos no disponibles |
| Parametros totales | no disponible (checkpoints de ~10,56 GB en total, coherente con el orden de miles de millones en fp16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), mas configuracion de modelo, procesador y tokenizer, piper_manifest.json y training_state.pt |
| Modelo base | 2toINF/X-VLA-Pt |
| Tarea | nesting_3dolls (encaje de tres munecas) sobre robot Piper |
| Entradas | RGB superior y RGB de muneca derecha, 224x224; tercera vista enmascarada; 7 valores de propiocepcion |
| Salidas | 30 acciones absolutas de 7 dimensiones (articulacion/pinza) |
| Checkpoints | 18 (pasos 30 000 a 200 000) |
| Commit upstream X-VLA | 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 |
| Version de Transformers | 4.51.3 |
| Configuracion de accion | action_mode=auto, real_action_dim=7, max_action_dim=20 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de 2toINF/X-VLA-Pt, un modelo VLA que combina percepcion visual con prediccion de acciones. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, estrategia de fusion vision-lenguaje), por lo que ese dato queda como no disponible. Lo que si se especifica es el contrato de entrada y salida: dos vistas RGB de 224x224 (la tercera vista del modelo base queda enmascarada), siete valores de propiocepcion medidos y treinta predicciones de acciones absolutas de siete dimensiones, con action_mode=auto, real_action_dim=7 y max_action_dim=20.

El entrenamiento consistio en un ajuste fino de parametros completos sobre la tarea nesting_3dolls, con 18 checkpoints conservados entre los pasos 30 000 y 200 000. Cada checkpoint incluye pesos, configuracion de modelo, procesador y tokenizer, un piper_manifest.json con la normalizacion de la tarea y metadatos del dataset, y training_state.pt con el estado de AdamW, el paso, el estado RNG y los argumentos de entrenamiento. La model card advierte que el entrenador de recuperacion no preservo un cursor exacto del dataset iterable, lo que implica que una reanudacion exacta del entrenamiento no es posible. No se indica el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo de robotica, lo habitual seria aprendizaje por imitacion, pero no se confirma en la informacion disponible.

## Capacidades

- Prediccion de acciones motoras de siete dimensiones (articulaciones y pinza) a partir de observaciones visuales y de propiocepcion.
- Percepcion visual multi-vista: procesa dos camaras RGB de 224x224 de forma simultanea.
- Integracion de propiocepcion: utiliza siete valores medidos de articulaciones y pinza como entrada.
- Ejecucion de politicas de manipulacion para la tarea especifica nesting_3dolls.
- Ajuste fino completo sobre el modelo base X-VLA-Pt, con checkpoints intermedios que permiten seleccionar el punto de entrenamiento mas adecuado.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, tool calling, agentes ni multilingueismo; es un modelo especializado en robotica.

## Casos de uso

- Encaje de piezas en linea de montaje: el modelo ejecuta la tarea nesting_3dolls sobre el robot Piper, prediciendo treinta acciones absolutas de siete dimensiones a partir de las dos vistas RGB y la propiocepcion; es adecuado porque esta ajustado especificamente para esa secuencia de manipulacion.
- Investigacion en aprendizaje por imitacion: los 18 checkpoints permiten estudiar la evolucion del entrenamiento entre los pasos 30 000 y 200 000 y comparar el rendimiento en distintos puntos de convergencia.
- Reproduccion de experimentos VLA: al incluir training_state.pt con el estado de AdamW y los argumentos de entrenamiento, sirve para auditar la configuracion usada en el ajuste fino.
- Base para nuevos ajustes finos en tareas Piper: el modelo puede servir como punto de partida para otras tareas de manipulacion con el mismo robot, reutilizando el contrato de entrada y salida documentado.
- Evaluacion de politicas roboticas en simulacion o laboratorio: el formato de acciones absolutas de siete dimensiones facilita la integracion con entornos de control del robot Piper.
- Docencia y demostraciones de VLA: el repositorio incluye manifiesto de normalizacion y configuracion completa, lo que simplifica montar una demo reproducible de un modelo vision-lenguaje-accion en robotica.
- Recuperacion de entrenamientos interrumpidos: los checkpoints y el estado de entrenamiento permiten reanudar aproximaciones del proceso, aunque sin cursor exacto del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con checkpoints de aproximadamente 10,56 GB, una carga en fp16 requeriria del orden de 10-12 GB de VRAM solo para pesos, mas memoria para activaciones y procesamiento de imagenes.
- GPU recomendadas: no especificadas por el autor. Por el tamano de los pesos, una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 o H100) seria el punto de partida razonable, aunque no se confirma.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o mas de VRAM si se mantiene la precision fp16; no confirmado por el autor.
- Opciones de despliegue: la model card indica cargar con XVLA y XVLAProcessor desde el codigo fuente correspondiente al commit 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 de X-VLA, con Transformers 4.51.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos VLA en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el modelo se puede situar frente a su base 2toINF/X-VLA-Pt (del que hereda arquitectura y contrato de accion, con ajuste fino especifico para nesting_3dolls) y frente a otros ajustes Piper del mismo autor o ecosistema, pero no se aportan numeros que permitan una tabla rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SXY7/X-VLA-Piper-nesting_3dolls | no disponible | no disponible | no disponible | Hugging Face |
| 2toINF/X-VLA-Pt (base) | no disponible | no disponible | no disponible | Hugging Face |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado exclusivamente para la tarea nesting_3dolls sobre el robot Piper; no es un modelo generalista.
- Dependencia de versiones: requiere el commit exacto 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 de X-VLA y Transformers 4.51.3; otras versiones pueden romper la carga o el contrato de accion.
- Normalizacion critica: es obligatorio preservar las estadisticas de normalizacion y el domain_id de piper_manifest.json; alterarlos invalida las predicciones.
- Reanudacion imperfecta: el entrenador de recuperacion no conservo un cursor exacto del dataset iterable, por lo que no se puede reanudar el entrenamiento de forma exacta.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de desplegarlo en produccion.
- Idiomas no disponibles: al ser un modelo de robotica, no se documenta soporte linguistico.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de sobreajuste a la tarea y al entorno de captura (posiciones de camara, iluminacion, robot concreto); no se documentan pruebas de robustez.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SXY7/X-VLA-Piper-nesting_3dolls
- Modelo base: https://huggingface.co/2toINF/X-VLA-Pt
- Checkpoint final (paso 200 000): https://huggingface.co/SXY7/X-VLA-Piper-nesting_3dolls/tree/main/checkpoint-200000
- Commit de referencia de X-VLA: 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 (repositorio upstream de X-VLA; URL no disponible en la informacion proporcionada)
