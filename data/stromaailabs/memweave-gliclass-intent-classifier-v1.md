# StromaAILabs/memweave-gliclass-intent-classifier-v1

## Resumen

El modelo `StromaAILabs/memweave-gliclass-intent-classifier-v1` es un clasificador de intenciones basado en la arquitectura GLiClass, desarrollado por StromaAILabs. GLiClass es un modelo ligero de clasificación de secuencias en modo zero-shot, inspirado en el framework GLiNER, que permite etiquetar texto sin necesidad de ajuste fino específico para cada dominio. Este modelo concreto está orientado a la detección de intenciones en conversaciones, probablemente como componente de la librería `memweave`, una biblioteca Python de memoria persistente para agentes de IA.

Con 186 millones de parámetros, se sitúa en la gama de modelos compactos, adecuados para despliegue en entornos con recursos limitados. Su relevancia actual radica en la creciente demanda de clasificadores de intenciones eficientes y reutilizables para chatbots, asistentes virtuales y sistemas de enrutamiento de consultas, donde la capacidad de operar sin entrenamiento previo reduce significativamente los costes de desarrollo. La ficha técnica del autor no proporciona detalles sobre el entrenamiento, los datos utilizados ni la licencia, por lo que gran parte de la información específica permanece no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass (basada en transformer, inspirada en GLiNER) |
| Parametros totales | 186.119.424 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiClass es una arquitectura de clasificación de secuencias que combina un encoder transformer con un mecanismo de atención sobre las etiquetas candidatas, permitiendo clasificación zero-shot y few-shot. A diferencia de los clasificadores tradicionales que requieren una cabeza de clasificación fija, GLiClass genera representaciones de las etiquetas a partir de sus nombres y las compara con la representación del texto de entrada, lo que facilita la adaptación a nuevas clases sin reentrenamiento.

No se dispone de información sobre el proceso de entrenamiento específico de este modelo: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El tag `arxiv:1910.09700` presente en los metadatos corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en machine learning, no a un paper sobre el modelo en sí. La ausencia de una model card detallada impide conocer las innovaciones técnicas concretas más allá de las inherentes a GLiClass.

## Capacidades

- Clasificacion de intenciones en modo zero-shot: el modelo puede etiquetar texto con intenciones definidas en tiempo de inferencia, sin necesidad de ejemplos de entrenamiento.
- Clasificacion multi-clase y potencialmente multi-etiqueta, segun las capacidades de GLiClass.
- Integracion con la libreria `memweave` para memoria persistente de agentes, lo que sugiere su uso en pipelines de agentes conversacionales.
- Compatible con el ecosistema Hugging Face Transformers, lo que facilita su uso en pipelines estandar.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Enrutamiento de consultas en atencion al cliente: el modelo puede clasificar la intencion de un mensaje entrante (por ejemplo, "reembolso", "cancelacion", "soporte tecnico") y dirigirlo al departamento adecuado, gracias a su capacidad zero-shot que permite definir nuevas categorias sobre la marcha.
- Chatbots de asistencia virtual: integrado en un agente conversacional, clasifica la intencion del usuario en cada turno para seleccionar la respuesta o accion apropiada, reduciendo la necesidad de entrenar modelos especificos por dominio.
- Filtrado y moderacion de contenido: puede identificar intenciones maliciosas o no deseadas (spam, abuso) en comentarios o mensajes, adaptandose a nuevas amenazas sin reentrenamiento.
- Analisis de feedback de usuarios: clasifica comentarios o resenas segun la intencion subyacente (queja, sugerencia, elogio) para priorizar el procesamiento en sistemas de gestion de opiniones.
- Memoria de agentes con memweave: al estar vinculado a la libreria memweave, puede usarse para etiquetar y recuperar recuerdos de agentes, permitiendo que el agente identifique la intencion de una consulta previa y actue en consecuencia.
- Clasificacion de tickets en sistemas de helpdesk: asigna automaticamente categorias a los tickets entrantes basandose en el texto, con la flexibilidad de anadir nuevas categorias sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de clasificacion de intenciones (como exactitud o F1) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 186 millones de parametros, en precision fp32 el modelo ocupa aproximadamente 744 MB, en fp16 unos 372 MB y en int8 unos 186 MB. Sin cuantizaciones publicadas, la carga en fp32 es la opcion por defecto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo en fp32. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes. Tambien puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. Para entornos ligeros, puede convertirse a formato ONNX o GGUF, aunque no se han publicado dichas conversiones.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado su tamano, se espera una latencia de decenas de milisegundos por muestra en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| memweave-gliclass-intent-classifier-v1 | 186M | no disponible | GLiClass zero-shot | no disponible |
| memweave-fastfit-intent-classifier-v1 | no disponible | no disponible | FastFit (few-shot) | no disponible |
| memweave-setfit-intent-classifier-v1 | no disponible | no disponible | SetFit (few-shot) | no disponible |

Los tres modelos pertenecen a la misma familia de StromaAILabs y estan orientados a clasificacion de intenciones, pero difieren en la tecnica subyacente: GLiClass opera en zero-shot puro, mientras que FastFit y SetFit requieren un pequeño conjunto de ejemplos etiquetados para ajustarse. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse una licencia, el uso comercial del modelo puede estar sujeto a restricciones legales. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Ausencia de informacion sobre datos de entrenamiento: no se conocen los idiomas soportados ni la composicion del dataset, lo que puede implicar sesgos no documentados y un rendimiento inconsistente en lenguas distintas de las usadas en el entrenamiento.
- Riesgo de alucinacion en clasificacion: al ser un modelo zero-shot, puede asignar etiquetas incorrectas cuando el texto es ambiguo o cuando las intenciones definidas no estan suficientemente diferenciadas.
- Tamano de contexto limitado: al no conocerse la longitud de contexto, no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Modelo sin mantenimiento activo: con cero descargas y cero likes, es probable que el modelo no haya sido validado por la comunidad, lo que aumenta el riesgo de problemas no detectados.
- Dependencia de la libreria memweave: si el uso previsto incluye la integracion con memweave, hay que verificar la compatibilidad de versiones y la estabilidad de dicha libreria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StromaAILabs/memweave-gliclass-intent-classifier-v1
- Repositorio de la libreria memweave: https://github.com/sachinsharma9780/memweave
- Repositorio de GLiClass: https://github.com/Knowledgator/GLiClass
- Modelo relacionado (FastFit): https://huggingface.co/StromaAILabs/memweave-fastfit-intent-classifier-v1
- Modelo relacionado (SetFit): https://huggingface.co/StromaAILabs/memweave-setfit-intent-classifier-v1
