# subhodipsaha/molmoact2_stack_three_cubes

## Resumen

Molmoact2_stack_three_cubes es una política de robótica entrenada y publicada en Hugging Face por el usuario subhodipsaha mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Se distribuye con la etiqueta molmoact2, asociada a la familia de modelos visión-lenguaje-acción (VLA) MolmoAct, y está especializada en una tarea concreta: apilar tres cubos con un brazo robótico SO-101, según se deduce del identificador del dataset de entrenamiento (subhodipsaha/so101_stack_three_cubes_08_19).

El repositorio contiene pesos en formato safetensors con 5.442.196.272 parámetros totales (aproximadamente 5,44 mil millones) y un tamaño de repositorio de 10,9 GB, lo que es coherente con pesos almacenados en precisión de 16 bits. La licencia es Apache-2.0, lo que permite uso comercial y modificación sin restricciones adicionales, siempre que se conserven los avisos de atribución correspondientes.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero valoraciones en el momento de la consulta, y su model card corresponde a la plantilla automática de LeRobot sin completar (el propio autor no reconoció el tipo de modelo). No se han publicado resultados de benchmarks, detalles de arquitectura ni composición del dataset en la información disponible, por lo que debe evaluarse como un artefacto experimental de un único autor más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta molmoact2; entrenado con LeRobot como política de aprendizaje por imitación) |
| Parametros totales | 5.442.196.272 (aproximadamente 5,44 mil millones) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors de 10,9 GB, compatibles con carga en 16 bits |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a generación de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería de carga: lerobot) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo. La etiqueta molmoact2 sugiere una variante de la familia MolmoAct de modelos visión-lenguaje-acción, y el pipeline declarado es robotics, con librería de carga lerobot. El tamaño de 5,44 mil millones de parámetros es compatible con un modelo VLA que combina un codificador visual, un componente de lenguaje y un cabezal de acciones, pero esta composición no está confirmada en la documentación proporcionada.

Respecto al entrenamiento, la model card indica que la política se entrenó y se subió al Hub con LeRobot y apunta a la guía de entrenamiento de aprendizaje por imitación. El dataset asociado es subhodipsaha/so101_stack_three_cubes_08_19, cuyo nombre sugiere demostraciones de la tarea de apilar tres cubos con un SO-101. No se especifica el número de episodios, el número de tokens o pasos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas. El ejemplo de comandos de la model card emplea --policy.type=act, que es el valor por defecto de la plantilla de LeRobot; dado que el autor no completó la plantilla, no puede confirmarse que ese tipo de política corresponda al checkpoint publicado.

## Capacidades

- Control robótico por aprendizaje por imitación: genera comandos de acción para un brazo SO-101 en la tarea específica de apilar tres cubos.
- Ejecución de políticas entrenadas en LeRobot: los pesos son cargables mediante lerobot-record con --policy.path apuntando al checkpoint.
- Evaluación reproducible: permite registrar episodios de evaluación con el parámetro --episodes de lerobot-record.
- Ajuste fino potencial sobre nuevos datasets: la licencia Apache-2.0 y el formato safetensors permiten reentrenar o adaptar la política.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generalista).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; la etiqueta de pipeline robotics implica entrada visual y salida de acciones, pero no hay detalle publicado.

## Casos de uso

- Automatización de apilado de cubos en laboratorio: la política está entrenada específicamente para la tarea stack_three_cubes sobre un SO-101, por lo que puede utilizarse directamente como referencia en experimentos de manipulación reproducibles.
- Reproducción de resultados de aprendizaje por imitación: sirve como punto de partida para comparar variantes de política sobre el mismo dataset subhodipsaha/so101_stack_three_cubes_08_19.
- Ajuste fino con datos propios: al publicarse en Apache-2.0 y safetensors, un equipo puede partir de estos pesos y reentrenar con demostraciones adicionales mediante lerobot-train para ampliar la variedad de posiciones u objetos.
- Evaluación de robustez ante variaciones del entorno: con lerobot-record es posible medir la tasa de éxito en episodios de evaluación registrados y detectar degradación ante cambios de iluminación o de posición inicial.
- Teleoperación asistida y recogida de datos: la política puede integrarse en un bucle de control que combine intervención humana y ejecución autónoma durante la recolección de nuevas demostraciones.
- Docencia y formación en robótica: al ser un checkpoint pequeño (10,9 GB) y con licencia permisiva, es adecuado para prácticas de aprendizaje por imitación en cursos universitarios o bootcamps de robótica.
- Integración en pipelines de investigación con LeRobot: el modelo se puede invocar desde los mismos scripts que el resto de políticas del ecosistema, lo que facilita incluirlo en comparativas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas, y el repositorio registra cero descargas y cero valoraciones, por lo que no existe retroalimentación de terceros sobre su comportamiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB solo para los pesos en 16 bits (5,44 mil millones de parámetros), más el consumo de activaciones y del búfer de imágenes; una estimación prudente sitúa el total entre 12 y 16 GB. No hay cifras oficiales publicadas.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en una única GPU para inferencia en 16 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con margen ajustado) y modelos con 16 GB o más. En GPUs de 8-12 GB requeriría cuantización, que no está documentada ni publicada en el repositorio.
- Opciones de despliegue: LeRobot (lerobot-train para entrenamiento y lerobot-record para inferencia/evaluación) y carga directa de safetensors con PyTorch. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de frecuencia de control, latencia por paso ni tasa de éxito.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subhodipsaha/molmoact2_stack_three_cubes | Política VLA para apilado de cubos con SO-101 | 5,44 mil millones | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot | Política de aprendizaje por imitación | no disponible en la información proporcionada | no disponible | Apache-2.0 (típicamente) | Ecosistema LeRobot |
| SmolVLA | Modelo visión-lenguaje-acción compacto | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face |
| Diffusion Policy | Política de difusión para manipulación | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de modelo, licencia y disponibilidad. Los nombres de las alternativas se incluyen por tratarse de políticas del mismo ecosistema (LeRobot), no por una equivalencia funcional verificada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (apilar tres cubos) sobre un brazo SO-101 concreto. No cabe esperar generalización a otros objetos, otras tareas o brazos distintos sin reentrenamiento.
- Model card incompleta: la propia plantilla indica "_Model type not recognized — please update this template_", por lo que no hay descripción de arquitectura, datos de entrenamiento ni hiperparámetros.
- Ausencia de validación externa: cero descargas y cero valoraciones; no existe evidencia independiente de que la política funcione correctamente.
- Riesgo de sobreajuste al entorno de demostración: al ser un modelo de imitación, es probable que se degrade ante cambios de iluminación, posición inicial, fondo o características de los cubos. No se documenta ningún tipo de aumento de datos ni variabilidad del dataset.
- Sesgos conocidos: no disponibles. En robótica, los sesgos de demostración suelen manifestarse como preferencia por trayectorias específicas del operador humano.
- Riesgo de alucinación: no aplicable en el sentido lingüístico; el riesgo equivalente es la generación de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache-2.0: permite uso comercial y modificaciones, siempre que se conserve el aviso de copyright y la atribución. No impone restricciones de uso adicionales, pero tampoco ofrece garantías.
- Caveat de producción: no se recomienda su uso en entornos físicos sin supervisión, límites de par y paradas de emergencia, dado que no hay métricas publicadas de tasa de éxito ni de seguridad.
- Inconsistencia de metadatos: las fechas registradas en el Hub (creación y actualización el 2026-09-14) no coinciden con el periodo habitual de publicación de modelos de esta familia, por lo que la trazabilidad temporal del artefacto no es fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subhodipsaha/molmoact2_stack_three_cubes
- Dataset de entrenamiento: https://huggingface.co/datasets/subhodipsaha/so101_stack_three_cubes_08_19
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
