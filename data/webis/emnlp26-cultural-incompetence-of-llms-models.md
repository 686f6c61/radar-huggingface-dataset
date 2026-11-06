# webis/emnlp26-cultural-incompetence-of-llms-models

## Resumen

Este repositorio, publicado por el grupo Webis (Universidad de Leipzig y colaboradores), no contiene un modelo entrenado desde cero, sino una coleccion de adaptadores QLoRA de instruccion disenados para el articulo "Cultural (In)Competence: Investigating Culture-Specific Stereotype Detection Capabilities of LLMs", presentado en Findings of EMNLP 2026. Su proposito es evaluar y mejorar la capacidad de los LLM para detectar estereotipos especificos de cada cultura, un problema que los modelos genericos suelen resolver mal porque confunden normas culturales con sesgos universales.

Los adaptadores se aplican sobre cinco modelos base distintos: Llama-3.1-8B-Instruct, Llama-3.1-8B, Mistral-7B-Instruct-v0.3, Mistral-7B-v0.3 y Qwen3-8B. Cada directorio del repositorio corresponde a un adaptador con prefijo identificativo (`llama31`, `llama31base`, `mistral`, `mistralbase`, `qwen3`), y debe cargarse sobre su modelo base correspondiente mediante tecnicas de QLoRA.

La relevancia de esta publicacion es metodologica y de investigacion: proporciona artefactos reproducibles para estudiar como los LLM abordan estereotipos culturales, y permite a otros investigadores replicar o extender los experimentos del paper. No esta pensada como un modelo de produccion generalista, sino como material de investigacion con licencia CC-BY-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores QLoRA sobre transformers decoder-only (Llama-3.1, Mistral-7B, Qwen3-8B) |
| Parametros totales | Depende del modelo base: 7B (Mistral), 8B (Llama-3.1, Qwen3); el adaptador anade un subconjunto de parametros no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (los adaptadores son QLoRA; el formato de cuantizacion del base no se detalla) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-3.0 |
| Formato de pesos | safetensors (adaptadores QLoRA) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores QLoRA (Quantized Low-Rank Adaptation) que se cargan sobre cinco modelos base de arquitectura transformer decoder-only: Llama-3.1-8B-Instruct y Llama-3.1-8B de Meta, Mistral-7B-Instruct-v0.3 y Mistral-7B-v0.3 de Mistral AI, y Qwen3-8B de Alibaba. La eleccion de QLoRA permite ajustar modelos de 7-8B con requisitos de memoria reducidos, manteniendo los pesos base congelados y entrenando solo las matrices de bajo rango.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El objetivo del ajuste es la deteccion de estereotipos culturales, segun se describe en el paper asociado. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Deteccion de estereotipos especificos de cultura: el ajuste esta orientado a identificar y clasificar estereotipos ligados a contextos culturales concretos.
- Clasificacion y juicio sobre texto: los adaptadores estan entrenados para tareas de evaluacion de contenido culturalmente sensible.
- Generacion de texto y razonamiento: heredadas del modelo base (Llama-3.1, Mistral-7B o Qwen3-8B), aunque el ajuste se centra en la tarea de deteccion.
- Soporte de tool calling / function calling: no documentado en la model card (depende del modelo base; Llama-3.1 y Qwen3 lo soportan de serie, pero el adaptador no lo garantiza).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion academica sobre sesgos culturales: el adaptador permite replicar los experimentos del paper de EMNLP 2026 sobre deteccion de estereotipos, comparando el comportamiento de Llama-3.1, Mistral y Qwen3 con y sin ajuste.
- Moderacion de contenido culturalmente consciente: se puede integrar en pipelines de revision de textos para detectar estereotipos especificos de una cultura, usando el adaptador sobre el modelo base adecuado.
- Evaluacion comparativa de modelos base: al existir adaptadores para cinco bases distintas (incluyendo variantes Instruct y base), permite estudiar como el ajuste de instruccion afecta a la deteccion de estereotipos.
- Auditoria de datasets: aplicar el modelo a corpus de texto para identificar pasajes con estereotipos culturales antes de usarlos en entrenamiento.
- Docencia y formacion en etica de la IA: servir como ejemplo practico de ajuste QLoRA para una tarea de clasificacion sensible, con artefactos reproducibles.
- Desarrollo de sistemas de analisis de discurso: combinado con el modelo base, puede emplearse para anotar textos en estudios de ciencias sociales sobre representaciones culturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (ACL Anthology, Findings of EMNLP 2026) para los resultados experimentales, pero no incluye tablas de metricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para un modelo de 7-8B en precision FP16 se requieren aproximadamente 14-16 GB de VRAM; en cuantizacion de 4 bits (compatible con QLoRA), alrededor de 4-6 GB.
- GPU recomendadas: A100, H100 o L40S para inferencia en FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 de modelos 7-8B.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion 4-bit, en GPUs de 8-12 GB como RTX 3060/4060 Ti.
- Opciones de despliegue: carga mediante `peft` y `transformers` (cargar el adaptador sobre el modelo base); compatible con vLLM y TGI si se fusiona el adaptador con el base; llama.cpp/Ollama requeririan conversion del modelo fusionado a GGUF (no documentado en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webis/emnlp26-cultural-incompetence (este) | Adaptador sobre 7-8B | No disponible | Deteccion de estereotipos culturales (investigacion) | CC-BY-3.0 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Instruccion generalista | Llama 3.1 Community License | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32K | Instruccion generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | 32K (extensible) | Instruccion y razonamiento | Apache 2.0 | Hugging Face |

La comparativa es estructural: este repositorio no es un modelo autonomo, sino un ajuste especializado sobre los modelos base citados, por lo que su rendimiento en tareas generales depende del base subyacente y su ventaja se limita a la tarea de deteccion de estereotipos culturales.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el adaptador sobre el modelo base correspondiente; usar el adaptador con un base distinto al indicado producira resultados invalidos.
- Sesgos conocidos: al entrenarse sobre datos de estereotipos culturales, el modelo puede reproducir o amplificar los sesgos presentes en esos datos; el paper aborda precisamente esta problematica.
- Riesgo de alucinacion: heredado del modelo base; no se documentan mitigaciones especificas para este ajuste.
- Limitaciones de contexto o idioma: no se especifican en la model card; la cobertura linguistica y cultural del ajuste no esta documentada.
- Restricciones de licencia: CC-BY-3.0 permite uso comercial con atribucion, pero las licencias de los modelos base (Llama 3.1 Community License, Apache 2.0) imponen condiciones adicionales que deben respetarse.
- Caveat para produccion: es un artefacto de investigacion sin pipeline de inferencia definido, sin datos de latencia ni de robustez; no se recomienda su uso en produccion sin una evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webis/emnlp26-cultural-incompetence-of-llms-models
- Paper (ACL Anthology): https://aclanthology.org/2026.findings-emnlp.426/
- Repositorio GitHub: https://github.com/webis-de/emnlp26-cultural-incompetence-of-llms
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
