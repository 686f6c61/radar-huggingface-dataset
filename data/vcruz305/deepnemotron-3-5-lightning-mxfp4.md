# vcruz305/DeepNemotron-3.5-Lightning-MXFP4

## Resumen

DeepNemotron-3.5-Lightning-MXFP4 es una cuantizacion en formato MXFP4 del checkpoint fusionado "M5 Lightning" del modelo DeepNemotron-3.5-Lightning, publicado por el usuario vcruz305. Se trata de una variante optimizada para reducir el consumo de memoria y acelerar la inferencia en hardware con recursos limitados, manteniendo las capacidades agénticas del modelo original.

El modelo parte de la arquitectura Nemotron 3.5 Lightning, que combina capas transformer con capas Mamba (SSM) en una configuracion de mezcla de expertos (MoE). Sobre esta base se ha aplicado un ajuste fino (SFT) con el corpus agéntico verificable DS4, generado con DeepSeek-V4-Pro, que cubre 13 familias de tareas como adherencia a esquemas de herramientas, ejecución en sandbox, salidas estructuradas y razonamiento multi-paso.

La relevancia de esta ficha radica en que presenta una opcion de despliegue eficiente para un modelo agéntico de gran tamaño, con cuantizacion MXFP4 que reduce la huella de memoria respecto a BF16, y con versiones alternativas en NVFP4 y GGUF para distintos entornos de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Transformer + Mamba SSM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (este modelo), NVFP4, GGUF (K-quants), BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-openmdw-and-dataset-other |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion posterior a la fusion (post-merge quant) del checkpoint M5 Lightning, que combina la arquitectura base Nemotron 3.5 Lightning con un adaptador afinado. La arquitectura base es una mezcla de expertos híbrida que integra capas de atención transformer con capas Mamba de espacio de estados, lo que permite manejar secuencias largas con menor coste computacional que un transformer puro.

El ajuste fino se realizo con LoRA en cuantizacion Q4' con rango r=16 y alpha=32, aplicado sobre las proyecciones q/k/v/o de atención, las proyecciones `in_proj` de Mamba y las capas lineales de los expertos compartidos. El dataset de entrenamiento es `r0b0tlab/deepseek-v4-pro-0813-agentic`, configuracion `sft_openai`, con 19.072 filas y una longitud máxima de secuencia de 512 tokens. Este corpus es verificable por diseño: cada fila pasa un verificador determinista antes de ser admitida, e incluye tareas de ejecución en sandbox, cumplimiento de restricciones, salidas estructuradas, estado multi-turno, recomputación matemática/científica, turnos multilingües, planificación, citas de contexto largo, delegación, compresión de memoria y código con tests ocultos.

El entrenamiento se ejecuto en una GPU Modal A100-80 durante 19.072 pasos (una época), con una pérdida final de 0.151, utilizando Unsloth 2026.8.18 y torch 2.7.1+cu118.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo agéntico.
- Adherencia estricta a esquemas de herramientas (tool-schema adherence) con ejecución en sandbox.
- Generación de salidas estructuradas (JSON y otros formatos).
- Gestión de estado multi-turno en conversaciones largas.
- Razonamiento matemático y científico con recomputación verificable.
- Planificación de tareas complejas y delegación a subagentes.
- Compresión de memoria para mantener contexto relevante en diálogos extensos.
- Soporte de citas de contexto largo (long-context citation).
- Cumplimiento de restricciones explícitas (constraint following).
- Capacidades multilingües en los turnos del dataset, aunque el idioma principal declarado es el inglés.
- Generación de código con validación mediante tests ocultos.

## Casos de uso

- Agentes autónomos con ejecución en sandbox: el modelo puede gestionar pipelines agénticos donde cada paso requiere ejecutar código o herramientas en un entorno aislado, gracias a su entrenamiento con verificación determinista.
- Generación de salidas estructuradas para APIs: ideal para producir JSON u otros formatos estrictos que deben integrarse directamente en sistemas de producción sin post-procesado adicional.
- Razonamiento matemático y científico asistido: puede recomputar resultados para verificar la corrección de sus respuestas, lo que lo hace util en entornos educativos o de investigación donde la precisión es critica.
- Gestión de conversaciones multi-turno con memoria comprimida: adecuado para asistentes virtuales que necesitan mantener contexto relevante durante largas interacciones sin exceder la ventana de contexto.
- Delegación de tareas en arquitecturas multi-agente: puede actuar como orquestador que divide tareas complejas y delega subtareas a otros modelos o herramientas.
- Generación de código con validación automática: su entrenamiento con tests ocultos permite su uso en pipelines de CI/CD para generar código que debe pasar pruebas unitarias.
- Cumplimiento de restricciones normativas: puede seguir reglas explicitas en la generación de contenido, util en sectores regulados como finanzas o salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque la cuantizacion MXFP4 esta diseñada para reducir significativamente el consumo respecto a BF16.
- GPU recomendadas: el entrenamiento se realizo en una A100-80, por lo que se asume compatibilidad con GPUs de datacenter. Para inferencia, la cuantizacion MXFP4 podria permitir su ejecucion en GPUs de consumo como RTX 4090, aunque no se especifica.
- Opciones de despliegue: transformers (HuggingFace), vLLM para servidores de inferencia, llama.cpp para las versiones GGUF, y Ollama si se convierte a ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Cuantizacion | Licencia |
|---|---|---|---|---|
| DeepNemotron-3.5-Lightning-MXFP4 (este) | safetensors | MoE híbrida (Transformer + Mamba) | MXFP4 | nvidia-openmdw-and-dataset-other |
| DeepNemotron-3.5-Lightning-BF16 | safetensors | MoE híbrida (Transformer + Mamba) | BF16 | nvidia-openmdw-and-dataset-other |
| DeepNemotron-3.5-Lightning-NVFP4 | safetensors | MoE híbrida (Transformer + Mamba) | NVFP4 | nvidia-openmdw-and-dataset-other |
| DeepNemotron-3.5-Lightning-GGUF | GGUF | MoE híbrida (Transformer + Mamba) | K-quants | nvidia-openmdw-and-dataset-other |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada. La diferencia principal radica en el formato de cuantizacion, que afecta al equilibrio entre precision, memoria y velocidad de inferencia.

## Limitaciones y advertencias

- Licencia restrictiva: combina la licencia NVIDIA OpenMDW (con enlace a https://openmdw.ai/license/1-1/) y una licencia de dataset "other" asociada a DeepSeek API, lo que puede imponer restricciones al uso comercial y a la redistribucion.
- Idioma limitado: la model card declara exclusivamente ingles, aunque el dataset incluye turnos multilingües.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta la evaluacion comparativa.
- Proyecto sin traccion: el modelo tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o poco validado por la comunidad.
- Parametros y contexto desconocidos: no se especifican los parametros totales ni la longitud de contexto, lo que limita la planificacion de despliegue.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir contenido incorrecto o inventado, especialmente en tareas no cubiertas por su dataset de entrenamiento.
- Dependencia de la calidad del dataset: aunque el corpus DS4 es verificable, la cobertura se limita a 13 familias de tareas, por lo que el rendimiento fuera de estos dominios puede degradarse.

## Enlaces

- Modelo MXFP4: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-MXFP4
- Adaptador base: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning
- Version BF16: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-BF16
- Version GGUF: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF
- Version NVFP4: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-NVFP4
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/deepseek-v4-pro-0813-agentic
- Licencia OpenMDW: https://openmdw.ai/license/1-1/
