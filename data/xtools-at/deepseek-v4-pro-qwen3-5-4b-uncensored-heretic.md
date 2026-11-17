# xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es un ajuste fino de tipo *decensored* (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicado por el usuario xtools-at. El modelo base es un destilado de razonamiento de Qwen3.5-4B entrenado sobre aproximadamente 250.000 muestras de matematicas y STEM generadas por DeepSeek-V4-Pro en modo Max Effect. La variante heretic elimina los comportamientos de rechazo mediante una tecnica de ablacion de rango arbitrario (ARA) aplicada a las capas 16 a 32.

El resultado es un modelo de 4.539.265.536 parametros (4,54B) en formato safetensors, con licencia Apache 2.0, pensado para despliegues compactos donde se necesita razonamiento estructurado sin filtros de contenido. La model card reporta una reduccion de rechazos de 99/100 a 5/100 respecto al modelo original, con una divergencia KL de 0,0378, lo que indica que la ablacion preserva en gran medida el comportamiento original.

Es relevante ahora porque combina tres tendencias: destilacion de modelos grandes de razonamiento hacia clases de 4B desplegables en consumer GPU, tecnicas de ablacion selectiva de capas para eliminar rechazos sin reentrenar, y soporte multilingue declarado (en, zh, ko, ja, es, ru) pese a que la ficha de Hugging Face solo lista en y zh.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino supervisado (SFT) con destilacion |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repo en safetensors; se menciona evaluacion MTP-Q8) |
| Idiomas soportados | en, zh, ko, ja, es, ru (segun model card); la ficha de HF lista solo en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 4,54B parametros, sometido a un ajuste fino supervisado (SFT) sobre respuestas destiladas de DeepSeek-V4-Pro en modo Max Effect. El dataset de entrenamiento consta de aproximadamente 250.000 muestras centradas en razonamiento matematico y STEM, siguiendo la misma receta que la version de 9B del mismo autor. La model card menciona tags de *reasoning*, *distillation*, *sft* y *mtp* (multi-token prediction), lo que sugiere que el entrenamiento incorpora prediccion multi-token, aunque no se detalla la composicion exacta del dataset ni el numero total de tokens.

La innovacion tecnica principal de esta variante es la ablacion de rango arbitrario (ARA) aplicada con Heretic v2.0.0 sobre las capas 16 a 32 (de un total de 32), con pesos de preservacion de comportamiento bueno de 0,9854, de redireccion de comportamiento malo de 0,0002, de correccion relativa de 0,6587 y un vecindario de 10. Esta ablacion modifica selectivamente las direcciones de activacion asociadas a rechazos, reduciendo la tasa de rechazo de 99/100 a 5/100 con una divergencia KL de 0,0378 frente al modelo original. No se documenta uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con descomposicion explicita de problemas.
- Razonamiento matematico y cientifico (STEM) reforzado por destilacion de un profesor de mayor capacidad.
- Prediccion multi-token (MTP) como parte del pipeline de entrenamiento y evaluacion (se reporta evaluacion MTP-Q8).
- Soporte multilingue declarado para en, zh, ko, ja, es y ru.
- Comportamiento *uncensored*: baja tasa de rechazos (5/100) frente a politicas de contenido.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede resolver problemas paso a paso y explicitar la descomposicion, adecuado para plataformas educativas que necesitan cadenas de razonamiento visibles.
- Generacion de explicaciones tecnicas para documentacion STEM: util para redactar derivaciones, demostraciones y notas de laboratorio a partir de enunciados breves.
- Asistente de investigacion en entornos controlados: al no rechazar consultas por politica de contenido, puede procesar preguntas tecnicas sensibles (por ejemplo, quimica o seguridad) sin bloqueos, siempre bajo supervision humana.
- Prototipado rapido en consumer GPU: con 4,54B parametros y licencia Apache 2.0, sirve para iterar pipelines de razonamiento en una sola GPU de gama alta de consumo.
- Evaluacion comparativa de tecnicas de ablacion: el modelo es un caso de estudio reproducible de Heretic v2.0.0 con parametros ARA documentados, util para investigadores que estudian decensoring.
- Despliegue multilingue ligero: atencion a usuarios en espanol, coreano, japones o ruso en tareas de razonamiento, con la cautela de que el soporte no esta validado con benchmarks.
- Generacion de datasets sinteticos de razonamiento: puede producir soluciones paso a paso para aumentar corpus de entrenamiento de modelos menores.

## Benchmarks y rendimiento

La model card solo reporta metricas de comportamiento de rechazo y divergencia KL, no benchmarks estandar de razonamiento o conocimiento.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para 4,54B parametros, en FP16 se requieren aproximadamente 9,1 GB de pesos; en cuantizacion de 8 bits unos 4,5 GB y en 4 bits unos 2,3 GB, sin contar overhead de KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabe en GPUs de consumo con 12-16 GB o mas (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090) en FP16 o cuantizado.
- Consumer GPU: si, previsiblemente en GPUs de 12 GB o superiores con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y herramientas compatibles con safetensors. No se documenta soporte GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heretic 4B) | 4,54B | no disponible | 5/100 rechazos, KL 0,0378 | Apache 2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (base) | 4,54B | no disponible | 99/100 rechazos | Apache 2.0 | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B (no confirmado) | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | ~4B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento de razonamiento con alternativas de la misma clase.

## Limitaciones y advertencias

- Al ser un modelo *abliterated*, se eliminan deliberadamente los mecanismos de rechazo; puede generar contenido sensible, ofensivo o peligroso sin filtros, lo que exige moderacion externa en produccion.
- Riesgo de alucinacion inherente a modelos destilados de 4B; la destilacion de razonamiento no garantiza correccion factual.
- La ablacion introduce una divergencia KL de 0,0378, lo que implica una degradacion no nula de capacidades respecto al modelo original; no se reportan benchmarks que cuantifiquen esa perdida.
- El soporte multilingue declarado (ko, ja, es, ru) no esta respaldado por evaluaciones; la ficha de HF solo lista en y zh.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificacion previa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y las tecnicas de decensoring pueden estar sujetas a consideraciones legales y de politica de plataforma.
- No se documenta soporte de tool calling ni de agentes; no asumir esas capacidades en pipelines de produccion.
- El repositorio ocupa 9,4 GB, coherente con pesos en precision alta; el despliegue en consumer GPU requiere cuantizacion, cuyos formatos no estan documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Ajuste STEM DeepThought: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
