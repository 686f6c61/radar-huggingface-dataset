# withstaticTai/ADOPD

## Resumen

ADOPD (Reference-Privileged On-Policy Distillation) es un framework de destilación de conocimiento desarrollado por Jingtai He (withstaticTai) para modelos multimodales de lenguaje (MLLMs) aplicados a la detección de anomalías industriales. La idea central consiste en utilizar imágenes de referencia como información privilegiada durante el entrenamiento, de modo que el modelo aprenda a internalizar la comparación con dichas referencias y, en inferencia, solo necesite la imagen de consulta. Esto elimina la necesidad de proporcionar referencias externas en tiempo de despliegue, reduciendo costes y simplificando el pipeline.

El trabajo se presenta en un artículo de arXiv (2608.09789v1) y el código está disponible en GitHub bajo el repositorio withTai/ADOPD, donde se utiliza el framework verl para el entrenamiento on-policy. El modelo se publica en Hugging Face con licencia Apache 2.0, aunque la model card no incluye detalles técnicos como arquitectura, tamaño o contexto. No se especifica el modelo base MLLM sobre el que se aplica la destilación, por lo que las especificaciones concretas dependen del modelo subyacente elegido por el usuario.

La relevancia actual radica en la creciente demanda de sistemas de inspección visual automatizada en entornos industriales, donde la detección de anomalías suele requerir comparaciones con referencias. ADOPD propone una solución que traslada esa comparación al espacio de los parámetros del modelo, permitiendo un despliegue más ligero y rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de destilacion para MLLMs (modelo base no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset WTB-Bench es en ingles, pero el modelo no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene codigo, no pesos preentrenados) |

## Arquitectura y entrenamiento

ADOPD es un metodo de destilacion on-policy con privilegio de referencia. En lugar de un modelo autonomo, se trata de un procedimiento de entrenamiento que se aplica a un MLLM existente. La innovacion clave es que, durante el entrenamiento, el modelo recibe tanto la imagen de consulta como una imagen de referencia (tipicamente una muestra sin anomalias del mismo objeto o escena). Estas referencias actuan como informacion privilegiada que guia la direccion de destilacion y proporciona una senal de fiabilidad. El modelo aprende a comparar internamente la consulta con la representacion aprendida de las referencias, de modo que en inferencia solo necesita la imagen de consulta.

El entrenamiento se realiza con el framework verl, que soporta algoritmos de optimizacion on-policy como PPO o GRPO. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el numero de tokens. Tampoco se especifica si se emplean tecnicas adicionales como RLHF o DPO; la descripcion se centra en la destilacion on-policy. La arquitectura del MLLM subyacente no se indica en la informacion disponible, por lo que se asume que puede adaptarse a distintos modelos base.

## Capacidades

- Deteccion de anomalias industriales: el modelo esta disenado para identificar defectos o irregularidades en imagenes de productos o equipos, comparando implicitamente con una referencia aprendida.
- Respuesta a preguntas visuales (VQA): al ser un MLLM, puede responder preguntas sobre el contenido de una imagen, aunque el foco principal es la deteccion de anomalias.
- Razonamiento multimodal: combina informacion visual y textual para emitir juicios sobre la presencia o ausencia de anomalias.
- Inferencia sin referencias externas: a diferencia de los sistemas tradicionales que requieren una imagen de referencia en tiempo de inferencia, ADOPD internaliza esa comparacion, permitiendo un despliegue mas simple.
- Capacidades multilingues: no especificadas; el dataset WTB-Bench esta en ingles, pero no se confirma que el modelo soporte otros idiomas.
- Tool calling y agentes: no se mencionan en la informacion disponible.

## Casos de uso

- Inspeccion de turbinas eolicas: el dataset WTB-Bench, publicado por el mismo autor, esta orientado a la inspeccion de palas de aerogeneradores. ADOPD puede utilizarse para detectar grietas, erosion o suciedad en imagenes capturadas por drones, sin necesidad de proporcionar una referencia limpia en cada inferencia.
- Control de calidad en fabricacion: en lineas de produccion donde se comparan piezas con un patron de referencia, ADOPD permite que el modelo aprenda el patron durante el entrenamiento y luego clasifique nuevas piezas como correctas o defectuosas en tiempo real.
- Mantenimiento predictivo: analisis de imagenes de maquinaria para detectar signos tempranos de desgaste o fallo, usando como referencia imagenes de equipos en buen estado.
- Inspeccion de infraestructuras: deteccion de anomalias en puentes, tuberias o edificios a partir de imagenes aereas o de camaras, donde las condiciones de iluminacion y angulo varian y una referencia fija no es practica.
- Auditoria visual de productos electronicos: verificacion de que los componentes estan correctamente ensamblados, comparando con una imagen de referencia del producto final esperado.
- Analisis de imagenes medicas (potencial): aunque no se menciona en la informacion, la metodologia podria adaptarse a la deteccion de anomalias en radiografias o tomografias, donde las referencias de tejido sano son habituales. Sin embargo, no hay evidencia de validacion en este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de arXiv presenta el metodo, pero no se incluyen tablas comparativas con otros modelos en los resultados de busqueda. El dataset WTB-Bench podria servir como punto de referencia, pero no se proporcionan metricas especificas (precision, recall, F1, etc.) en la informacion recopilada.

## Requisitos de hardware

No se especifican requisitos de hardware en la informacion disponible. Al tratarse de un framework de destilacion aplicado sobre un MLLM base, los requisitos dependen del modelo subyacente elegido. Para la inferencia, se puede utilizar cualquier framework estandar de despliegue de MLLMs (vLLM, TGI, llama.cpp, etc.), pero no se indican configuraciones concretas de VRAM, GPUs recomendadas ni latencias esperadas. Se recomienda consultar la documentacion del modelo base seleccionado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. ADOPD no es un modelo autonomo, sino un metodo de entrenamiento, por lo que la comparacion deberia realizarse contra otros enfoques de deteccion de anomalias con MLLMs, pero no se han encontrado datos concretos en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia del modelo base: el rendimiento final de ADOPD esta limitado por el MLLM sobre el que se aplica la destilacion. No se garantiza que funcione bien con cualquier arquitectura.
- Dominio especifico: el metodo esta validado principalmente en deteccion de anomalias industriales (turbinas eolicas). Su generalizacion a otros dominios (medicina, seguridad, etc.) no esta demostrada.
- Sesgos y alucinaciones: al ser un MLLM, puede presentar sesgos en los datos de entrenamiento y riesgo de alucinacion en respuestas textuales. No se ha realizado una evaluacion de sesgos en la informacion disponible.
- Licencia: aunque la licencia es Apache 2.0, el codigo y los datos asociados (WTB-Bench) tienen la misma licencia, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de uso en entornos comerciales.
- Ausencia de pesos preentrenados: el repositorio de Hugging Face no incluye pesos del modelo, solo el codigo del framework. Para utilizar ADOPD, el usuario debe entrenar su propio modelo sobre un MLLM base, lo que requiere recursos computacionales significativos.
- Informacion tecnica incompleta: no se proporcionan detalles sobre el dataset de entrenamiento, el numero de pasos de optimizacion, ni las configuraciones de hiperparametros, lo que dificulta la reproducibilidad sin acceso al codigo fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/withstaticTai/ADOPD
- Repositorio GitHub: https://github.com/withTai/ADOPD
- Articulo en arXiv: https://arxiv.org/html/2608.09789v1
- Dataset WTB-Bench en Hugging Face: https://huggingface.co/datasets/withstaticTai/WTB-Bench
- Perfil del autor en Hugging Face: https://huggingface.co/withstaticTai
