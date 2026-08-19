# vcruz305/DeepNemotron-3.5-Lightning-BF16

## Resumen

DeepNemotron-3.5-Lightning-BF16 es un modelo de lenguaje de 31,58 mil millones de parámetros, resultado de un fine-tuning con LoRA sobre NVIDIA Nemotron 3.5 Lightning 30B-A3B, un modelo de arquitectura mixta (MoE con componentes Mamba) optimizado para tareas agénticas. El autor, vcruz305, ha fusionado los pesos del adaptador LoRA en el modelo base y los ha publicado en formato BF16, acompañados de versiones cuantizadas (GGUF, MXFP4 y NVFP4) para facilitar el despliegue en distintos entornos.

El modelo se ha entrenado mediante supervisión (SFT) sobre el corpus agentic DeepSeek-V4-Pro 0813, un conjunto de datos verificable-first que garantiza la calidad de cada ejemplo mediante verificadores programáticos deterministas. El entrenamiento cubre 19.072 ejemplos con una pérdida final de 0,151, y el resultado es un modelo orientado a la ejecución de agentes con herramientas, salidas estructuradas y razonamiento multi-paso.

Su relevancia radica en que ofrece una alternativa de tamaño medio (30B totales, 3B activos según la nomenclatura del modelo base) con capacidades agénticas avanzadas, pensada para desarrolladores que necesitan desplegar asistentes con tool calling, planificación y verificación de código en producción, sin los costes de los modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer/Mamba con mezcla de expertos (MoE), basada en NVIDIA Nemotron 3.5 Lightning 30B-A3B |
| Parametros totales | 31.577.937.344 (~31,58B) |
| Parametros activos | no disponible (la nomenclatura del modelo base "30B-A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (repo principal), GGUF (K-quants), MXFP4, NVFP4 |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-openmdw-and-dataset-other (OpenMDW 1.1) |
| Formato de pesos | safetensors (BF16), además de GGUF, MXFP4 y NVFP4 en repositorios asociados |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3.5 Lightning 30B-A3B, emplea una arquitectura híbrida que combina capas transformer con bloques Mamba y mezcla de expertos (MoE), donde solo una fracción de los parámetros se activa por token. Esta combinación busca equilibrar la calidad de un modelo denso grande con la eficiencia inferencial de un MoE. El fine-tuning de DeepNemotron se realizó mediante LoRA con r=16 y α=32, aplicada a las proyecciones de atención (q/k/v/o), a las proyecciones internas de Mamba (`in_proj`) y a las capas lineales de los expertos compartidos.

El entrenamiento SFT utilizó el dataset `r0b0tlab/deepseek-v4-pro-0813-agentic`, config `sft_openai`, con 19.072 filas y una longitud máxima de secuencia de 512 tokens. Este corpus, generado a partir de DeepSeek-V4-Pro 0813 (API oficial con razonamiento activado), es verificable-first: cada ejemplo se admite solo después de pasar un verificador programático determinista. Las 13 familias de tareas incluyen adherencia a esquemas de herramientas con ejecución en sandbox, seguimiento de restricciones, salidas estructuradas, estado multi-turno, recomputación matemática y científica, turnos multilingües, planificación, citación de contexto largo, delegación, compresión de memoria y código con tests ocultos. El entrenamiento se ejecutó en una GPU A100-80GB con Unsloth 2026.8.18 y torch 2.7.1+cu118, durante una época completa, alcanzando una pérdida de 0,151.

## Capacidades

- Generación de texto y razonamiento multi-paso, optimizado para tareas agénticas y conversacionales.
- Soporte de tool calling y adherencia a esquemas de herramientas, con verificación mediante ejecución en sandbox.
- Salidas estructuradas (JSON y otros formatos), adecuadas para integración con APIs y pipelines.
- Manejo de estado multi-turno, útil para diálogos prolongados y agentes con memoria de conversación.
- Razonamiento matemático y científico con recomputación verificable de resultados.
- Planificación de tareas y descomposición de objetivos complejos en pasos ejecutables.
- Delegación de subtareas y compresión de memoria para contextos largos.
- Generación de código con validación mediante tests ocultos.
- Capacidades multilingües limitadas (el idioma declarado es inglés, aunque el dataset incluye turnos multilingües).

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede integrarse en frameworks agénticos para seleccionar y ejecutar herramientas externas (APIs, bases de datos, motores de búsqueda) con adherencia estricta a los esquemas definidos, gracias a su entrenamiento con verificación en sandbox.
- Generación de código asistida en producción: su capacidad para producir código que pasa tests ocultos lo hace adecuado para asistentes de programación que requieren salidas compilables y correctas, reduciendo la necesidad de revisión manual.
- Automatización de atención al cliente: el soporte de conversaciones multi-turno y estado persistente permite gestionar incidencias complejas, manteniendo el contexto a lo largo de la interacción y delegando tareas a sistemas externos cuando es necesario.
- Extracción de datos estructurados: puede convertir texto libre en JSON u otros formatos estructurados, útil para pipelines de ingestión de datos, clasificación de documentos y enriquecimiento de registros.
- Asistentes de investigación y análisis: su capacidad de planificación y razonamiento matemático permite descomponer problemas científicos, realizar cálculos verificables y citar fuentes de contexto largo.
- Evaluación automatizada de respuestas: al estar entrenado con verificadores programáticos, puede servir como juez automático en sistemas de evaluación de modelos, comprobando la corrección de salidas frente a criterios definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 63 GB (31,58B parámetros × 2 bytes), por lo que requiere una GPU con al menos 80 GB de VRAM para ejecutarse sin cuantizar (A100 80GB, H100 80GB) o varias GPUs en paralelo.
- Con cuantización GGUF (K-quants), el tamaño puede reducirse a ~18 GB en Q4_K_M, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con menor precisión.
- Las versiones MXFP4 y NVFP4 ofrecen alternativas de cuantización de 4 bits optimizadas para hardware NVIDIA, reduciendo aún más los requisitos de VRAM.
- Opciones de despliegue: el formato safetensors es compatible con transformers y vLLM; las versiones GGUF son compatibles con llama.cpp y Ollama; las versiones MXFP4/NVFP4 requieren soporte específico de hardware y librerías.
- Latencia y throughput: no se han publicado datos medidos. En una A100 80GB, un modelo MoE de ~3B activos podría ofrecer una latencia de generación de decenas de tokens por segundo, pero estos valores son estimaciones sin confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepNemotron-3.5-Lightning-BF16 | 31,58B | no disponible | no disponible | OpenMDW + dataset other | HuggingFace |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (base) | ~30B | ~3B | no disponible | OpenMDW | HuggingFace |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | HuggingFace |
| Qwen2.5-32B | 32,8B | 32,8B (denso) | 128K | Apache 2.0 | HuggingFace |

La comparativa se basa en datos públicos de los modelos alternativos; para DeepNemotron no se dispone de contexto ni parámetros activos confirmados. La ventaja principal frente a Mixtral o Qwen2.5 es su enfoque específico en tareas agénticas verificables, aunque su licencia es más restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos; al estar entrenado sobre un corpus generado por DeepSeek-V4-Pro, puede heredar sesgos presentes en ese modelo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por el dataset de entrenamiento.
- Limitaciones de idioma: el modelo declara soporte solo para inglés, a pesar de que el dataset incluye turnos multilingües; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia OpenMDW (nvidia-openmdw-and-dataset-other) puede imponer condiciones de uso comercial, atribución o redistribución; además, la licencia del dataset ("other", adjunta a la API de DeepSeek) puede añadir restricciones adicionales. Es imprescindible revisar ambos términos antes de usar el modelo en producción.
- Contexto no especificado: no se ha publicado la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- Dependencia del modelo base: al ser un fine-tuning de Nemotron 3.5 Lightning, hereda sus limitaciones arquitectónicas y de calidad, que no están documentadas en la información disponible.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento, por lo que la evaluación debe realizarse de forma independiente antes de adoptarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-BF16
- Adapter LoRA original: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning
- Versión GGUF (K-quants): https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF
- Versión MXFP4: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-MXFP4
- Versión NVFP4: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-NVFP4
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/deepseek-v4-pro-0813-agentic
- Modelo base: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Licencia OpenMDW: https://openmdw.ai/license/1-1/
