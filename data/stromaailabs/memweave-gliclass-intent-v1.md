# StromaAILabs/memweave-gliclass-intent-v1

## Resumen

El modelo `StromaAILabs/memweave-gliclass-intent-v1` es un clasificador de intenciones basado en la arquitectura GLiClass, desarrollado por StromaAILabs como parte del ecosistema MemWeave, una librería de memoria persistente para agentes de IA. Con 186 millones de parámetros, este modelo está diseñado para clasificar la intención de consultas o comandos en sistemas de agentes, permitiendo enrutar acciones o gestionar la memoria de forma semántica. Su relevancia radica en que GLiClass permite clasificar con etiquetas arbitrarias sin necesidad de reentrenar el modelo para cada conjunto de intenciones, lo que facilita su adaptación a dominios específicos.

El modelo se distribuye en formato safetensors, es compatible con la librería transformers y está marcado como `endpoints_compatible`, lo que sugiere que puede desplegarse fácilmente en entornos de inferencia gestionada. Aunque la model card oficial está vacía y no se proporcionan detalles sobre entrenamiento o licencia, su tamaño y arquitectura lo hacen adecuado para tareas de clasificación de texto de baja latencia en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass (transformer encoder, backbone no especificado) |
| Parametros totales | 186.119.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiClass es una arquitectura de clasificación de texto que utiliza un transformer encoder (típicamente BERT o similar) para generar representaciones tanto del texto de entrada como de las etiquetas candidatas. La clasificación se realiza calculando la similitud coseno entre el embedding del texto y los embeddings de cada etiqueta, lo que permite manejar etiquetas arbitrarias sin necesidad de una capa de salida fija. Este enfoque es especialmente útil para clasificación de intenciones en dominios dinámicos, donde las categorías pueden cambiar o expandirse.

No se dispone de información sobre el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización aplicadas. Dado el nombre del modelo y su asociación con MemWeave, es probable que haya sido fine-tuneado sobre un modelo base preentrenado para la tarea específica de clasificación de intenciones en el contexto de agentes con memoria, pero esto no está confirmado.

## Capacidades

- Clasificación de intenciones de texto con etiquetas arbitrarias, gracias a la arquitectura GLiClass.
- Soporte para clasificación multi-etiqueta si se configuran múltiples etiquetas candidatas.
- Integración con el ecosistema MemWeave para gestionar la memoria de agentes, permitiendo identificar la intención de comandos o consultas.
- Compatible con la librería transformers, lo que facilita su uso en pipelines estándar de NLP.
- Diseñado para despliegue en endpoints, lo que sugiere optimización para inferencia en producción.
- Capacidad de adaptación a nuevos dominios sin reentrenamiento, simplemente cambiando las etiquetas de entrada.

## Casos de uso

- Enrutamiento de consultas en agentes conversacionales: el modelo puede clasificar la intención de cada mensaje del usuario (por ejemplo, "guardar memoria", "recuperar información", "borrar dato") y dirigir la acción correspondiente dentro del sistema MemWeave.
- Gestión de memoria en asistentes personales: al identificar intenciones como "recordar", "olvidar" o "buscar", el agente puede ejecutar operaciones de escritura, borrado o consulta en su almacén de memoria persistente.
- Clasificación de comandos en automatización de tareas: en pipelines de automatización, el modelo puede distinguir entre intenciones como "ejecutar", "programar" o "cancelar", facilitando la interpretación de instrucciones de usuario.
- Filtrado de mensajes en sistemas de soporte: clasificar la intención de los tickets de soporte (problema técnico, facturación, consulta general) para enrutarlos al departamento adecuado.
- Moderación de contenido en foros o redes sociales: identificar intenciones como "spam", "abuso" o "consulta legítima" para aplicar políticas de moderación automática.
- Análisis de intención en logs de agentes: procesar registros de interacciones para clasificar la intención de cada paso, permitiendo auditorías y mejoras en el comportamiento del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 186 millones de parámetros, en FP32 se requieren aproximadamente 744 MB, en FP16 unos 372 MB y en int8 unos 186 MB. Esto permite ejecutar el modelo en GPUs consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, como NVIDIA RTX 3060 (6 GB), RTX 4060 (8 GB) o superiores. También puede ejecutarse en CPU para inferencia de baja frecuencia.
- Compatible con despliegue en CPU: gracias a su tamaño moderado, puede ejecutarse en CPU con latencias aceptables para tareas de clasificación.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI, o mediante endpoints gestionados. También es posible usar llama.cpp si se convierte a GGUF, aunque no se indica soporte nativo.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño, se espera una latencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memweave-gliclass-intent-v1 | 186M | GLiClass | no disponible | no disponible | HuggingFace |
| memweave-fastfit-intent-classifier-v1 | no disponible | FastFit | no disponible | no disponible | HuggingFace |
| memweave-setfit-intent-classifier-v1 | no disponible | SetFit | no disponible | no disponible | HuggingFace |

Los tres modelos pertenecen a la misma familia de clasificadores de intenciones para MemWeave, pero utilizan arquitecturas diferentes. FastFit y SetFit son métodos de fine-tuning eficiente con pocos ejemplos, mientras que GLiClass se basa en similitud de embeddings. No se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo de tamaño medio, puede presentar sesgos presentes en los datos de entrenamiento subyacentes.
- Riesgo de alucinación en la clasificación: si las etiquetas no están bien definidas o el texto es ambiguo, el modelo puede asignar intenciones incorrectas.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que su rendimiento en lenguas distintas al inglés podría ser limitado.
- Restricciones de licencia: al no estar especificada la licencia, no se puede garantizar su uso comercial sin consultar al autor.
- La model card está vacía, lo que impide conocer detalles sobre el entrenamiento, los datos y las limitaciones específicas.
- Al ser un modelo especializado en intenciones para MemWeave, su uso fuera de ese contexto puede requerir adaptación o reentrenamiento.

## Enlaces

- [HuggingFace - StromaAILabs/memweave-gliclass-intent-v1](https://huggingface.co/StromaAILabs/memweave-gliclass-intent-v1)
- [HuggingFace - memweave-fastfit-intent-classifier-v1](https://huggingface.co/StromaAILabs/memweave-fastfit-intent-classifier-v1)
- [HuggingFace - memweave-setfit-intent-classifier-v1](https://huggingface.co/StromaAILabs/memweave-setfit-intent-classifier-v1)
- [GitHub - memweave (sachinsharma9780)](https://github.com/sachinsharma9780/memweave)
- [GitHub - MemWeave (JianYingJia)](https://github.com/JianYingJia/MemWeave)
- [PyPI - memweave](https://pypi.org/project/memweave/)
