# vosldtgbj/project-llm-sft-v3-l2-h1p0-seed20261006

## Resumen

Project LLM SFT v3 (`L2--h1p0--seed20261006`) es un ajuste supervisado (SFT) de un modelo multimodal de la familia Gemma 4, publicado por el usuario vosldtgbj como parte de una serie de experimentos de post-entrenamiento denominada "Project LLM". El modelo parte del checkpoint intermedio `project-llm-cpt-1p0-top10-02-lora-15`, que a su vez corresponde a una fase de continued pre-training (CPT) de 1,0 epoch sobre el modelo base Gemma 4. El objetivo declarado del repositorio es la reproducibilidad de experimentos, la evaluacion offline y la investigacion posterior, no el despliegue en produccion.

El modelo tiene 11.959.730.176 parametros (~11,96 B) en formato safetensors y ocupa 24,0 GB en el repositorio. La arquitectura es `gemma4_unified`, la arquitectura multimodal unificada de Gemma 4, y el pipeline declarado es `any-to-any`, lo que implica capacidad de procesar y generar tanto texto como imagenes (etiquetas `image-text-to-text` y `any-to-any`). El entrenamiento SFT se realizo con RSLoRA (r=128, alpha=32, dropout=0,05, LR=2e-5) durante 1,0 epoch sobre una mezcla compuesta por un 90 % de datos de dominio y un 10 % de datos generales, y los adaptadores se fusionaron en pesos completos.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con documentacion minima. Resulta util principalmente como referencia tecnica de una receta de SFT sobre Gemma 4 y como punto de partida para quien quiera reproducir la cadena CPT -> SFT del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (family Gemma 4), multimodal unificada |
| Parametros totales | 11.959.730.176 (~11,96 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponibles en los metadatos; la etiqueta del repositorio incluye `japanese` |
| Licencia | apache-2.0 (con obligacion declarada de cumplir la licencia upstream de Gemma 4) |
| Formato de pesos | safetensors (sharded) |
| Pipeline | any-to-any (image-text-to-text) |
| Modelo base | vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15 |
| Tamano del repositorio | 24,0 GB |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura corresponde a `gemma4_unified`, la variante multimodal unificada de la familia Gemma 4, tal y como indican la etiqueta `gemma4_unified` y la necesidad de disponer de una version de Transformers que la soporte. El modelo se carga mediante `AutoModelForMultimodalLM`, lo que confirma que se trata de un modelo capaz de manejar entradas mixtas de imagen y texto. No se dispone de informacion detallada sobre el numero de capas, dimension oculta, mecanismos de atencion ni si incorpora innovaciones concretas (atencion lineal, decodificacion especulativa, etc.) mas alla de lo que implica la propia arquitectura Gemma 4.

El proceso de entrenamiento documentado tiene dos etapas. La primera es un continued pre-training (CPT) de 1,0 epoch sobre el modelo base, cuyo resultado es `project-llm-cpt-1p0-top10-02-lora-15` (entrenado con LoRA r=15). La segunda, que da lugar a este repositorio, es un SFT v3 con una mezcla de 90 % datos de dominio y 10 % datos generales, ejecutado durante 1,0 epoch con RSLoRA (rank 128, alpha 32, dropout 0,05, learning rate 2e-5) y posteriormente fusionado en pesos completos. No se especifica la composicion exacta del dataset de dominio, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales de alineacion (DPO, RLHF, GRPO). El repositorio no incluye estado de optimizador, scheduler ni RNG, solo pesos y configuracion.

## Capacidades

- Generacion de texto multimodal: el pipeline `any-to-any` y la etiqueta `image-text-to-text` indican soporte para entradas de imagen y texto y salidas multimodales.
- Razonamiento y generacion de lenguaje: capacidades heredadas del modelo base Gemma 4 y del CPT, aunque no se documentan tareas concretas evaluadas.
- Capacidades multilingues: la etiqueta `japanese` sugiere entrenamiento o enfasis en japones, pero no hay lista oficial de idiomas publicada.
- Instruccion (instruction following): el propio proceso de SFT esta disenado para adaptar el modelo a seguir instrucciones sobre el dominio objetivo.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Reproduccion de experimentos de post-entrenamiento: el repositorio esta pensado explicitamente para reproducir la cadena CPT -> SFT y comparar configuraciones de RSLoRA (rank, alpha, dropout, LR) sobre Gemma 4.
- Evaluacion offline de checkpoints intermedios: sirve como punto de referencia para medir el efecto del SFT v3 frente al checkpoint CPT previo en tareas de dominio.
- Investigacion academica sobre SFT y RSLoRA: permite analizar como la mezcla 90/10 de datos de dominio y generales afecta al comportamiento del modelo.
- Fine-tuning posterior (continuacion del SFT): al ser pesos completos en safetensors, puede usarse como punto de partida para nuevos ajustes con LoRA o QLoRA.
- Experimentacion multimodal en japones: dado el etiquetado `japanese`, es candidato para probar tareas image-text-to-text en ese idioma, siempre que se valide su calidad real.
- Pruebas de integracion con Transformers: util para validar el soporte de la arquitectura `gemma4_unified` y del cargador `AutoModelForMultimodalLM` en pipelines propios.
- Base para comparativas internas de modelos: permite medir si la receta del autor mejora o no respecto a Gemma 4 original en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~24 GB de pesos, mas overhead de activaciones y cache KV; en la practica, se recomienda disponer de 32 GB o mas.
- VRAM estimada en cuantizacion INT8: ~12-14 GB.
- VRAM estimada en cuantizacion INT4: ~7-9 GB (requiere cuantizar manualmente, ya que no hay GGUF publicado).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para FP16 sin offload. En consumer, una RTX 4090 (24 GB) puede ser justa para FP16 y comoda para INT8/INT4.
- GPU consumer compatibles: RTX 4090, RTX 4080/4070 Ti con cuantizacion INT4/INT8; en GPUs de 12-16 GB sera necesario cuantizar agresivamente.
- Opciones de despliegue: Transformers (con version que soporte `gemma4_unified`) y `device_map="auto"`. vLLM, TGI, llama.cpp u Ollama solo si se confirma compatibilidad con la arquitectura, actualmente no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| project-llm-sft-v3-l2-h1p0-seed20261006 | ~11,96 B | no disponible | Si (any-to-any) | apache-2.0 + terminos Gemma 4 | HuggingFace (0 descargas) |
| Gemma 4 (modelo base) | no disponible | no disponible | Si | Terminos Gemma 4 | HuggingFace / Google |
| Alternativas de ~12 B open source (p. ej. Gemma 2 9B, Llama 3.1 8B, Mistral 12B) | 8-12 B | 8k-128k segun modelo | Mayoritariamente texto | permisivas o con restricciones | amplia |

No se dispone de datos de rendimiento comparado para este checkpoint, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados, por lo que se desconoce su calidad real en cualquier tarea.
- Repositorio experimental con 0 descargas y 0 likes: sin evidencia de uso por terceros ni validacion externa.
- Documentacion minima: no se especifica contexto, idiomas exactos, composicion del dataset ni numero de tokens de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; mayor en un modelo ajustado sobre datos de dominio no publicados.
- Sesgos potenciales: no evaluados; el 90 % de datos de dominio puede introducir sesgos especificos del corpus utilizado.
- Idiomas: aunque se etiqueta `japanese`, no hay confirmacion oficial; el rendimiento en castellano u otros idiomas es incierto.
- Licencia: se declara apache-2.0, pero la propia model card exige cumplir la licencia upstream de Gemma 4 (`license_link` a la licencia de Gemma 4). Esto puede imponer restricciones adicionales al uso comercial; conviene revisar los terminos de Gemma 4 antes de cualquier despliegue.
- Carga: requiere una version de Transformers con soporte para `gemma4_unified`; en versiones estables actuales puede no funcionar.
- Sin datos de cuantizacion ni de throughput: no se puede planificar produccion sin pruebas propias.
- Formato: solo safetensors; no hay GGUF ni artefactos listos para llama.cpp u Ollama.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l2-h1p0-seed20261006
- Modelo base (CPT): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15
- Licencia de Gemma 4 (referenciada por el autor): https://ai.google.dev/gemma/docs/gemma_4_license
- Guia general de SFT (GeeksforGeeks): https://www.geeksforgeeks.org/artificial-intelligence/supervised-fine-tuning-sft-for-llms/
- Guia de post-entrenamiento SFT/DPO/PPO/GRPO (arzerin.com): https://arzerin.com/2026/08/20/llm-post-training-sft-dpo-ppo-grpo-peft-lora-qlora/
- Guia de alineacion LLM (SFT, RLHF, DPO, GRPO): https://eyagarci.github.io/posts/LLM-Alignment-SFT-RLHF-DPO-GRPO/
- Practico de SFT (apxml.com): https://apxml.com/courses/rlhf-reinforcement-learning-human-feedback/chapter-2-sft-phase-rlhf/sft-execution-practical
- Guia practica de SFT (langcopilot.com): https://langcopilot.com/posts/2025-07-16-supervised-fine-tuning-sft-llms-practical-guide
