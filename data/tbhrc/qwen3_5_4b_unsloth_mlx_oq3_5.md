# tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5

## Resumen

Este modelo es una cuantización de Qwen3.5-4B en formato MLX, generada por el usuario tbhrc mediante la herramienta oQ de mixed-precision quantization. El resultado es un fichero safetensors de 2.8 GB con cuantización de 3 bits y tamaño de grupo 64, pensado para ejecutarse en dispositivos Apple Silicon a través del ecosistema MLX. Aunque el nombre sugiere un modelo de 4 000 millones de parámetros, los metadatos del safetensors indican 930 millones de parámetros totales, una discrepancia que conviene verificar antes de su uso.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de la familia Qwen3.5 en hardware local de Apple con un consumo de memoria reducido, sin necesidad de GPU dedicada. Sin embargo, la información pública disponible es escasa: la model card solo detalla el proceso de cuantización y no ofrece datos sobre arquitectura, entrenamiento o rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (no se especifica detalle) |
| Parametros totales | 930 070 016 (según safetensors; el nombre sugiere 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ, 3 bits, group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original Qwen3.5-4B en la documentación proporcionada. Por la familia a la que pertenece, se trata de un transformer basado en arquitectura de Qwen, pero no se especifican el número de capas, la dimensión del modelo ni el tipo de atención. El proceso de cuantización oQ emplea mixed-precision, es decir, asigna diferentes bits según la sensibilidad de cada capa, con un objetivo de 3 bits y grupo de 64.

El entrenamiento del modelo original tampoco está documentado en los materiales disponibles. No se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a indicar que se trata de una cuantización realizada con la librería oQ, sin aportar detalles sobre el proceso de entrenamiento del modelo base.

## Capacidades

No se han publicado en la model card ni en los resultados de búsqueda una lista exhaustiva de capacidades específicas para esta cuantización. Por la naturaleza del modelo Qwen3.5, se puede esperar que el modelo base sea capaz de:

- Generación de texto general y conversación multi-turno.
- Razonamiento lógico y matemático básico.
- Comprensión y generación de código en lenguajes populares.
- Soporte de tool calling y function calling (típico en la familia Qwen3.5).
- Capacidades multilingües, con énfasis en inglés y chino.

Sin embargo, la cuantización de 3 bits puede degradar notablemente estas capacidades. No se dispone de pruebas específicas para este fichero concreto.

## Casos de uso

Dada la naturaleza del modelo (cuantización MLX de 3 bits), los casos de uso más realistas son:

- **Ejecución local en Apple Silicon**: el modelo está diseñado para MLX, por lo que puede ejecutarse en Mac con M1 o superior mediante el runtime MLX, sin necesidad de GPU dedicada.
- **Prototipado y experimentación**: por su tamaño reducido (2.8 GB), es adecuado para probar flujos de trabajo con Qwen3.5 en entornos de desarrollo sin recursos de servidor.
- **Asistentes de chat en local**: puede servir como base para un asistente conversacional ligero en aplicaciones de escritorio o móviles, aunque la precisión puede verse afectada por la cuantización.
- **Generación de código asistida**: para autocompletado o generación de fragmentos de código en entornos sin conexión.
- **Análisis de texto y extracción de información**: tareas simples de resumen o extracción de entidades en documentos.
- **Educación y aprendizaje**: para estudiar el comportamiento de modelos cuantizados en MLX, comparando con versiones sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 2.8 GB de peso y cuantización de 3 bits, el uso de memoria en inferencia será inferior a 3 GB, pudiendo caber en la memoria unificada de cualquier Mac con Apple Silicon.
- **GPU recomendadas**: no aplica GPU NVIDIA; el modelo está pensado para Apple Silicon (M1, M2, M3, M4).
- **¿Cabe en consumer GPU?**: sí, en cualquier Mac con Apple Silicon y suficiente memoria unificada (8 GB o más). No está pensado para GPU NVIDIA.
- **Opciones de despliegue**: MLX (librería oficial), posiblemente compatible con otros frameworks que soporten safetensors MLX.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B (aprox.) | no disponible | FP16 | no disponible |
| Qwen3-4B (cuantizado) | 4B | 128K | GGUF, 4-bit | Apache 2.0 |
| Llama 3.2-3B | 3B | 128K | GGUF, 4-bit | Meta Llama 3 |
| Este modelo (MLX oQ3.5) | 930M (según safetensors) | no disponible | 3-bit oQ | no disponible |

No se dispone de datos de rendimiento para comparar directamente. La comparativa es meramente estructural.

## Limitaciones y advertencias

- **Discrepancia de tamaño**: el nombre indica 4B, pero los parámetros reales son 930M; esto puede deberse a un error en el nombre o a una cuantización agresiva que reduce el número de parámetros efectivos. Hay que verificarlo.
- **Riesgo de alucinación**: la cuantización de 3 bits puede aumentar la tasa de alucinaciones y degradar la coherencia en tareas complejas.
- **Licencia**: no se especifica, por lo que no se puede garantizar el uso comercial.
- **Sesgos**: no hay información sobre sesgos; al ser una cuantización de un modelo no documentado, se desconoce su procedencia y posibles sesgos.
- **Limitaciones de contexto**: no se conoce la longitud de contexto, por lo que es probable que sea inferior a los 128K de la familia Qwen3.
- **Idiomas**: no se especifica, pero probablemente el modelo base se entrena principalmente en inglés y chino, con menos soporte para español.
- **Formato propietario**: la cuantización oQ es específica de la librería omlx, lo que puede limitar la compatibilidad con otras herramientas.

## Enlaces

- [HuggingFace - tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5](https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5)
- [Repositorio oQ (omlx)](https://github.com/jundot/omlx)
- [Colección Qwen3 de Unsloth](https://huggingface.co/collections/unsloth/qwen3)
- [Documentación de Unsloth sobre Qwen3](https://unsloth.ai/docs/models/tutorials/qwen3-how-to-run-and-fine-tune)
- [Documentación de Unsloth para Qwen3.5](https://unsloth.ai/docs/models/qwen3.5)
- [Notebook de Qwen3.5 (4B) Vision en Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)_Vision.ipynb)
- [Colección Qwen3 de Qwen](https://huggingface.co/collections/Qwen/qwen3)

## Resumen

Este modelo es una cuantización de Qwen3.5-4B en formato MLX, generada por el usuario tbthric mediante la técnica oQ (mixed-precision quantization). El resultado es un fichero safetensors de 2.8 GB con cuantización de 3 bits y tamaño de grupo 64, pensado para ejecutarse en Apple Silicon mediante el ecosistema MLX. Aunque el nombre sugiere un modelo de 4 000 millones de parámetros, los metadatos del safetensors indican 930 070 016 parámetros, una discrepancia que conviene verificar antes de usarlo.

El proyecto es relevante porque permite ejecutar un modelo de la familia Qwen3.5 en hardware local de Apple con un consumo de memoria reducido. Sin embargo, la información pública disponible es escasa: la model card solo describe el proceso de cuantización, sin datos de arquitectura, entrenamiento o rendimiento. Esto limita la evaluación técnica del modelo y obliga a tratarlo como un experimento de cuantización más que como un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (no disponible) |
| Parametros totales | 930 070 016 (según safetensors; el nombre sugiere 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ, 3 bits, group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo Qwen3.5-4B en la documentación proporcionada. Por la familia a la que pertenece, se trata de un transformer de la serie Qwen, pero no se especifican el número de capas, la dimensión del modelo ni el tipo de atención. La cuantización oQ emplea mixed-precision, es decir, asigna diferentes bits a distintas capas según su sensibilidad, con un objetivo de 3 bits y tamaño de grupo 64.

El entrenamiento del modelo original no está documentado en los materiales disponibles. No se informan los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a indicar que se trata de una cuantización realizada con la librería oQ, sin aportar contexto sobre el modelo base.

## Capacidades

No se han publicado en la model card ni en los resultados de búsqueda una lista de capacidades específicas para esta cuantización. Por la naturaleza de la familia Qwen3.5, se puede esperar que el modelo base sea capaz de:

- Generación de texto general y conversación multi-turno.
- Razonamiento lógico y matemático básico.
- Generación y comprensión de código en lenguajes populares.
- Soporte de tool calling y function calling (típico en Qwen3.5).
- Capacidades multilingües, con énfasis en inglés y chino.

Sin embargo, la cuantización de 3 bits puede degradar notablemente estas capacidades, especialmente en tareas de razonamiento complejo. No se dispone de pruebas específicas para este modelo concreto.

## Casos de uso

- **Ejecución local en Apple Silicon**: el modelo está diseñado para MLX, por lo que puede ejecutarse en Mac con M1 o superior mediante la librería MLX, sin necesidad de GPU dedicada.
- **Prototipado rápido**: por su tamaño reducido (2.8 GB), es adecuado para experimentar con flujos de trabajo de Qwen3.5 en entornos de desarrollo sin infraestructura de servidor.
- **Asistente de chat en local**: puede servir como base para un asistente conversacional en aplicaciones de escritorio o móviles, aunque la calidad puede verse afectada por la cuantización.
- **Generación de código asistida**: para autocompletado o generación de fragmentos de código en entornos offline.
- **Análisis de texto**: tareas simples como resumen de documentos o extracción de entidades.
- **Educación y aprendizaje**: para estudiar el comportamiento de modelos cuantizados en MLX y comparar con versiones sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Memoria estimada**: con 2.8 GB de peso y cuantización de 3 bits, la memoria en inferencia será inferior a 3 GB, lo que cabe en cualquier Mac con Apple Silicon.
- **GPU recomendada**: no se recomienda GPU específica; es para Apple Silicon (M1, M2, M3, M4).
- **Compatibilidad**: funciona en Mac con Apple Silicon, no en GPU NVIDIA.
- **Opciones de despliegue**: MLX (librería oficial), posiblemente compatible con otros frameworks que aceptan safetensors.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B (aprox.) | no disponible | no disponible | no disponible |
| Qwen3-4B (cuantizado) | 4B | 128K | GGUF, 4-bit | Apache 2.0 |
| Llama 3.2-3B | 3B | 128K | GGUF, 4-bit | Meta Llama 3 |
| Este modelo (oQ3.5) | 930M (según safetensors) | no disponible | 3-bit oQ | no disponible |

No se dispone de datos de rendimiento para comparar de forma cuantitativa.

## Limitaciones y advertencias

- **Discrepancia de tamaño**: el nombre indica 4B, pero los parámetros reales son 930M; esto puede ser un error de etiquetado o una cuantización que reduce el número de parámetros efectivos. Hay que verificarlo.
- **Riesgo de alucinación**: la cuantización de 3 bits puede aumentar la frecuencia de alucinaciones y degradar la coherencia.
- **Licencia no definida**: no se especifica la licencia, por lo que el uso comercial no está garantizado.
- **Sesgos desconocidos**: al ser una cuantización de un modelo no documentado, se desconoce si el modelo base tiene sesgos que se hayan propagado.
- **Contexto limitado**: no se conoce la longitud de contexto, probablemente inferior a los 128K de la familia Qwen3.
- **Idiomas**: probablemente el modelo base se entrena principalmente en inglés y chino, con menor soporte para español.
- **Formato propietario**: la cuantización oQ es específica de la librería omlx, lo que puede limitar su portabilidad.

## Enlaces

- [HuggingFace - tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5](https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5)
- [Repositorio oQ (omlx)](https://github.com/jundot/omlx)
- [Colección Qwen3 de Unsloth](https://huggingface.co/collections/unsloth/qwen3)
- [Documentación de Unsloth para Qwen3](https://unsloth.ai/docs/models/tutorials/qwen3-how-to-run-and-fine-tune)
- [Documentación de Unsloth para Qwen3.5](https://unsloth.ai/docs/models/qwen3.5)
- [Notebook de Qwen3.5 Vision en Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)_Vision.ipynb)
- [Colección Qwen3 de Qwen](https://huggingface.co/collections/Qwen/qwen3)</think>## Resumen

Modelo cuantizado de la familia Qwen3.5-4B en formato MLX, generado por el usuario tbhrc mediante la técnica oQ (mixed-precision quantization) de la librería omlx. El resultado es un fichero safetensors de 2.8 GB con cuantización de 3 bits y tamaño de grupo 64, diseñado para ejecutarse en Apple Silicon a través del ecosistema MLX. Aunque el nombre sugiere un modelo de 4 000 millones de parámetros, los metadatos del safetensors indican 930 070 016 parámetros, una discrepancia que conviene verificar antes de su uso.

La relevancia de este modelo reside en la posibilidad de ejecutar un modelo de la serie Qwen3.5 en hardware local de Apple con un consumo de memoria reducido. Sin embargo, la información pública es limitada: la model card solo describe el proceso de cuantización, sin aportar datos de arquitectura, entrenamiento ni rendimiento, lo que obliga a tratarlo como un candidato experimental y no como un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (no se especifica detalle) |
| Parametros totales | 930 070 160 (según safetensors; el nombre sugiere 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ, 3 bits, group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Qwen3.5-4B en la documentación proporcionada. Por la familia a la que pertenece, se trata de un transformer de la serie Qwen, pero no se especifican el número de capas, la dimensión del modelo ni el tipo de atención. El proceso de cuantización oQ emplea mixed-precision, es decir, asigna diferentes bits a cada grupo según la sensibilidad de los pesos, con un objetivo de 3 bits y tamaño de grupo 64.

El entrenamiento del modelo original no está documentado en los materiales disponibles. No se informan los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a indicar que se trata de una cuantización realizada con la librería oQ, sin aportar contexto sobre el modelo base.

## Capacidades

No se han publicado en la model card ni en los resultados de búsqueda una lista de capacidades específicas para esta cuantización. Por la naturaleza de la familia Qwen3.5, se puede esperar que el modelo base sea capaz de:

- Generación de texto general y conversación multi-turno.
- Razonamiento lógico y matemático básico.
- Generación y comprensión de código en lenguajes populares.
- Soporte de tool calling y function calling (característico de la familia Qwen3.5).
- Capacidades multilingües, con énfasis en inglés y chino.

Sin embargo, la cuantización de 3 bits puede degradar notablemente estas capacidades, especialmente en tareas de razonamiento complejo. No se dispone de pruebas específicas para este modelo concreto.

## Casos de uso

- **Ejecución local en Apple Silicon**: el modelo está diseñado para MLX, por lo que puede ejecutarse en Mac con M1 o superior sin necesidad de GPU dedicada, usando la memoria unificada.
- **Prototipado y experimentación**: por su tamaño reducido (2.8 GB), es adecuado para probar flujos de trabajo con Qwen3.5 en entornos de desarrollo sin infraestructura de servidor.
- **Asistente de chat en local**: puede implementarse como base para un asistente conversacional en aplicaciones de escritorio o móviles, aunque la calidad puede verse afectada por la cuantización.
- **Generación de código asistida**: para autocompletado o generación de fragmentos de código en entornos sin conexión.
- **Análisis de texto simple**: tareas como resumen de documentos o extracción de entidades en textos cortos.
- **Educación y aprendizaje**: para estudiar el comportamiento de modelos cuantizados en MLX y comparar con versiones sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Memoria estimada**: con 2.8 GB de pesos y cuantización de 3 bits, la memoria en inferencia será inferior a 3 GB, lo que cabe en cualquier Mac con Apple Silicon (8 GB o más de memoria unificada).
- **GPU recomendada**: no se requiere GPU dedicada; está pensado para Apple Silicon (M1, M2, M3, M4).
- **Compatibilidad con consumer GPU**: sí, en Mac con Apple Silicon. No es compatible con GPU NVIDIA de forma directa.
- **Opciones de despliegue**: MLX (librería oficial), y potencialmente otros frameworks que acepten safetensors.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B (aprox.) | no disponible | no disponible | no disponible |
| Qwen3-4B (cuantizado) | 4B | 128K | GGUF, 4-bit | Apache 2.0 |
| Llama 3.2-3B | 3B | 128K | GGUF, 4-bit | Meta Llama 3 |
| Este modelo (oQ3.5) | 930M (según safetensors) | no disponible | 3-bit oQ | no disponible |

No se dispone de datos de rendimiento para comparar de forma cuantitativa.

## Limitaciones y advertencias

- **Discrepancia de tamaño**: el nombre indica 4B, pero los parámetros reales son 930M; esto puede ser un error de etiquetado o una cuantización que reduce el número de parámetros efectivos. Hay que verificarlo.
- **Riesgo de alucinación**: la cuantización de 3 bits puede aumentar la frecuencia de alucinaciones y degradar la coherencia en tareas complejas.
- **Licencia no definida**: no se especifica la licencia, por lo que el uso comercial no está garantizado.
- **Sesgos desconocidos**: al ser una cuantización de un modelo no documentado, se desconoce si el modelo base tiene sesgos que se hayan propagado.
- **Contexto limitado**: no se conoce la longitud de contexto, pero es probable que sea inferior a los 128K de la familia Qwen3.
- **Idiomas**: probablemente el modelo base se entrena principalmente en inglés y chino, con menor soporte para español.
- **Formato específico**: la cuantización oQ es específica de la librería omlx, lo que puede limitar la portabilidad a otros frameworks.

## Enlaces

- [Hugging Face Hub - tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5](https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq3_5)
- [Repositorio oQ (omlx)](https://github.com/jundot/omlx)
- [Colección Qwen3 de Unsloth](https://huggingface.co/collections/unsloth/qwen3)
- [Documentación de Unsloth para Qwen3](https://unsloth.ai/docs/models/tutorials/qwen3-how-to-run-and-fine-tune)
- [Documentación de Unsloth para Qwen3.5](https://unsloth.ai/docs/models/qwen3.5)
- [Notebook de Qwen3.5 Vision en Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)_Vision.ipynb)
- [Colección Qwen3 de Qwen](https://huggingface.co/collections/Qwen/qwen3)
