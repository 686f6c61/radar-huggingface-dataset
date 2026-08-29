# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ4e-mtp

## Resumen

Este repositorio contiene una cuantizacion mixta de precision (oQ) del modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11, creada por el usuario symrex. El modelo base pertenece a la familia Qwen3.6 de Alibaba, un modelo de arquitectura Mixture-of-Experts (MoE) con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos, disenado para tareas de agentic coding y preservacion del razonamiento. La version aqui publicada ha sido cuantizada a 4 bits con grupo de 64 utilizando la herramienta oMLX v0.6.3, en formato MLX safetensors, lo que la hace adecuada para su ejecucion en hardware Apple Silicon.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de gran tamano en dispositivos con memoria unificada limitada, gracias a la cuantizacion de baja precision. Sin embargo, la informacion disponible en la model card es minima: solo se especifica el metodo de cuantizacion y el formato. No se proporcionan detalles sobre el entrenamiento, las capacidades especificas, los benchmarks ni la licencia, por lo que gran parte de la ficha se basa en los datos tecnicos del archivo de pesos y en informacion publica sobre la familia Qwen3.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, segun tag del modelo) |
| Parametros totales | 6.190.105.520 (segun safetensors; el nombre indica 35B-A3B, pero el archivo real muestra ~6,19B) |
| Parametros activos | no disponible (el nombre sugiere ~3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64, mixed-precision (oQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.6, segun la informacion publica de DeepWiki. La familia Qwen3.6 incluye un modelo denso de 27B y un modelo sparse MoE de 35B-A3B, con capacidades especializadas en agentic coding y preservacion del razonamiento. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion (RLHF, DPO, etc.) para esta version concreta.

La cuantizacion ha sido realizada con oMLX v0.6.3, que aplica una cuantizacion de precision mixta (oQ) a 4 bits con grupo de 64. Esta tecnica permite reducir significativamente el tamano del modelo manteniendo un equilibrio entre precision y rendimiento. El resultado es un archivo de 21,6 GB en formato MLX safetensors, listo para su uso con la libreria MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo de la familia Qwen3.6, se espera un buen rendimiento en tareas de lenguaje natural, aunque no se han publicado resultados especificos para esta version.
- Agentic coding: segun la informacion de DeepWiki, el modelo base incluye capacidades para tareas de codificacion agente, como generacion de codigo, depuracion y planificacion de tareas.
- Preservacion del razonamiento: el modelo base esta disenado para mantener el razonamiento paso a paso en contextos largos.
- Sin censura (uncensored): el nombre indica que el modelo ha sido ajustado para eliminar restricciones de contenido, aunque no se detallan los limites ni las implicaciones.
- Ajuste estilo Hermes: el sufijo "Hermes" sugiere un fine-tuning orientado a seguir instrucciones y conversacion, similar a los modelos Hermes de Nous Research.

No se confirma si el modelo tiene capacidades multimodales (vision) o de audio, ya que la informacion disponible no lo especifica.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: gracias al formato MLX y la cuantizacion 4-bit, el modelo puede ejecutarse en Macs con memoria unificada de 24 GB o superior, permitiendo inferencia offline sin conexion a la nube.
- Prototipado rapido de aplicaciones de chat: desarrolladores pueden integrar el modelo en aplicaciones de escritorio o scripts usando la libreria MLX, aprovechando su naturaleza "uncensored" para experimentar con respuestas menos restrictivas.
- Generacion de codigo asistida: el modelo base esta orientado a agentic coding, por lo que puede usarse como asistente de programacion en entornos locales, aunque sin tool calling confirmado.
- Investigacion sobre cuantizacion mixta: este repositorio sirve como ejemplo de aplicacion de oQ a un modelo MoE grande, util para estudiar el impacto de la cuantizacion en el rendimiento.
- Desarrollo de agentes conversacionales: con su ajuste Hermes, el modelo puede emplearse para construir chatbots con personalidad y estilo de conversacion especifico, aunque sin garantias de calidad.
- Analisis de texto y resumen: puede utilizarse para tareas de procesamiento de lenguaje natural generales, como resumen de documentos o extraccion de informacion, si el hardware lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta version cuantizada ni para el modelo base en este repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo pesa 21,6 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo completo en RAM.
- GPU recomendadas: Apple Silicon (M1 Pro, M2 Max, M3 Ultra, etc.) con al menos 24 GB de RAM unificada. No se recomienda para GPUs NVIDIA sin conversion de formato.
- Compatibilidad con consumer GPU: no aplica directamente, ya que el formato MLX esta disenado para Apple Silicon. Para GPUs NVIDIA se necesitaria convertir a GGUF u otro formato.
- Opciones de despliegue: MLX (libreria de Apple), posiblemente via mlx-lm o scripts personalizados. No se menciona compatibilidad con vLLM, Ollama o TGI en esta version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El nombre sugiere que pertenece a la familia Qwen3.6-35B-A3B, pero no hay datos de rendimiento ni de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion sobre sesgos especificos del modelo. Al ser "uncensored", puede generar contenido inapropiado o dañino sin filtros.
- Riesgo de alucinacion: no se han evaluado tasas de alucinacion. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada, y los idiomas soportados son desconocidos.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se puede garantizar el uso comercial. Se debe contactar al autor o revisar el repositorio original.
- Caveats de produccion: la cuantizacion 4-bit puede degradar la calidad de las respuestas en comparacion con el modelo original. Ademas, al ser una version dequantized y re-cuantizada, puede haber perdida de fidelidad adicional.
- Inconsistencia de parametros: el archivo safetensors muestra 6,19B parametros, mientras que el nombre indica 35B-A3B. Esta discrepancia sugiere que el archivo podria estar incompleto o mal etiquetado, lo que podria causar errores de carga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-oQ4e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Guia de Qwen3.6-35B Genesis Hermes (en ingles): https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Documentacion de la familia Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Repositorio de la version V10: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ4e-mtp
- Repositorio de la version V6: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-oQ4e-mtp
