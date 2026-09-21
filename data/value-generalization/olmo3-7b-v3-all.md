# value-generalization/olmo3-7b-v3-all

## Resumen

`olmo3-7b-v3-all` es un ajuste fino completo (full fine-tune) por DPO del modelo base `value-generalization/neutral-sft-v3-olmo3-7b`, que a su vez deriva de la familia OLMo 3 de 7 B parametros de Allen Institute for AI. Lo publica el colectivo de investigacion `value-generalization` y su proposito no es el despliegue comercial, sino servir como cota superior ("upper bound") del experimento RQ3: un unico modelo entrenado sobre la totalidad de los datos de alineamiento disponibles, en lugar de una rejilla de modelos especializados por valor.

El entrenamiento parte de 196.000 pares de preferencia que cubren los 49 tenets de `constitution-v3-dpo` (4.000 pares por tenet, un par por prompt), con objetivo DPO sigmoide y beta 0,1, una sola epoca y un maximo de 2.048 tokens por secuencia. El resultado son 7.298.011.136 parametros en formato safetensors, con un repositorio de 14,6 GB coherente con pesos en bf16.

Su relevancia es metodologica: permite comparar el rendimiento de un modelo unico entrenado con todos los datos de constitucion frente a aproximaciones de steerability por valor, y sirve como referencia reproducible para estudiar generalizacion de valores en modelos abiertos de 7 B. No cuenta con descargas ni likes en el momento de redactar esta ficha, y no se han publicado benchmarks asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 3 (7 B) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Longitud de contexto | no disponible; el entrenamiento DPO utilizo `max_length` 2048 |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos safetensors (14,6 GB, compatible con bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (ver condiciones en el repositorio de HuggingFace) |
| Formato de pesos | safetensors |
| Modelo base | value-generalization/neutral-sft-v3-olmo3-7b @ e93fa4d880af487009cb828b93665e88a428cc16 |
| Plantilla de chat | olmo3_chatml (template fijado, EOS en `valuegen_chat_format.json`) |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia OLMo 3 de 7 B, un transformer decoder-only, heredada sin modificaciones estructurales: el trabajo se limita al ajuste fino de alineamiento. El punto de partida es `neutral-sft-v3-olmo3-7b`, una version SFT descrita como neutra en valores, y sobre ella se aplica un DPO completo con funcion de perdida sigmoide y beta 0,1 durante una unica epoca (12.250 pasos, batch efectivo 16). El regimen de optimizacion usa learning rate 5e-6 con scheduler coseno, warmup 0,1, `max_length` 2048, precision mixta bf16 y FSDP full-shard sobre 8 GPU.

El dataset de preferencias es la union completa de `value-generalization/constitution-v3-dpo` en su split de entrenamiento: 196.000 pares que cubren los 49 tenets de la constitucion v3, a razon de 4.000 pares por tenet con un unico par por prompt. La innovacion tecnica del artefacto no esta en la arquitectura sino en el diseno experimental: se trata del brazo "entrenar con todos los datos de alineamiento" del estudio RQ3, es decir, un unico modelo monolítico que sirve de cota superior frente a un grid de modelos ajustados por valor individual. La receta y el lanzador estan versionados (`configs/experiments/dpo_v3_all_olmo3.yaml`, `scripts/0918/train_v3_all.sbatch`) y la procedencia se fija en el repositorio `value-generalization` en el commit `669a6d8`, con semilla 42 en el barajado de datos.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con plantilla `olmo3_chatml` fijada en el directorio exportado.
- Ajuste fino de preferencias sobre 49 dimensiones de valor distintas, orientado a estudiar la generalizacion entre tenets.
- Capacidad de servir como cota superior experimental ("upper bound") en estudios de alineamiento por valores.
- Razonamiento y generacion de codigo heredados del modelo base OLMo 3 7 B (no verificados con benchmarks en esta ficha).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible.

## Casos de uso

- Investigacion en generalizacion de valores: el modelo actua como referencia RQ3 entrenada con el conjunto completo de 196.000 pares, de modo que cualquier modelo especializado por valor puede compararse contra esta cota superior en terminos de comportamiento alineado.
- Reproducibilidad de experimentos de DPO: al publicarse la receta, el lanzador y el commit de procedencia, permite replicar el entrenamiento con 8 GPU, beta 0,1 y una epoca para validar resultados de terceros.
- Ablacion de estrategias de alineamiento: sirve para medir cuanto se pierde o se gana al pasar de un modelo unico multi-valor a un grid de modelos por tenet, con el dataset `constitution-v3-dpo` como control comun.
- Evaluacion de transferencia entre tenets: los 49 valores cubiertos permiten disenar baterias de prompts que comprueben si el ajuste sobre unos valores degrada o mejora el comportamiento en otros.
- Generacion de respuestas anotadas para construir datasets de preferencias: el modelo puede producir respuestas candidatas en formato ChatML para pipelines de anotacion humana o automatica.
- Estudio de estabilidad del chat template: al incluir `valuegen_chat_format.json` con el EOS pinneado, resulta util para depurar discrepancias de tokenizacion en pipelines de evaluacion.
- Fine-tuning posterior sobre subconjuntos: parte de un base ya alineado sobre todos los tenets, por lo que es un punto de partida razonable para experimentos de ajuste adicional o de steerability.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre la familia OLMo 3 aplicada a generalizacion de valores. Los unicos resultados obtenidos corresponden a calculadoras de valoraciones de videojuegos y a diccionarios de traduccion, sin relacion con el artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 14,6 GB solo de pesos, mas cache KV y activaciones; en la practica, entre 18 y 24 GB para secuencias moderadas.
- VRAM estimada en int8: aproximadamente 8 GB de pesos, en torno a 10-12 GB totales.
- VRAM estimada en 4 bits: aproximadamente 4 GB de pesos, en torno a 5-6 GB totales.
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: si en RTX 4090 y RTX 3090 a bf16; en RTX 4080 (16 GB) es recomendable int8 o 4 bits; en RTX 3060 (12 GB) solo en 4 bits.
- Opciones de despliegue: vLLM y TGI para servicio en GPU; transformers para inferencia de referencia; llama.cpp u Ollama requieren una conversion previa a GGUF que no se incluye en el repositorio; FSDP full-shard fue el modo usado en entrenamiento con 8 GPU.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olmo3-7b-v3-all | 7,3 B | no disponible (entrenado con 2048) | other | HuggingFace, 0 descargas |
| neutral-sft-v3-olmo3-7b (base directo) | no disponible | no disponible | no disponible | HuggingFace |
| OLMo 3 7 B (familia base) | en torno a 7 B | no disponible | no disponible | HuggingFace |
| Alternativas abiertas de 7-8 B (Qwen, Llama, Mistral) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados (parametros, contexto o rendimiento) para los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a la relacion de derivacion con el modelo base. Este artefacto no es directamente comparable con un asistente generalista: su funcion es experimental dentro del estudio RQ3.

## Limitaciones y advertencias

- Es un artefacto de investigacion: 0 descargas y 0 likes, sin validacion externa conocida ni resultados de benchmarks publicados.
- La licencia es "other", sin texto explicito en la informacion disponible; es imprescindible revisar las condiciones en el repositorio antes de cualquier uso comercial.
- No se especifican los idiomas soportados, por lo que no puede asumirse un comportamiento multilingue fiable.
- La longitud de contexto efectiva del entrenamiento es 2.048 tokens; usar secuencias mas largas sin validacion puede degradar la coherencia.
- Riesgo de alucinacion inherente a un modelo de 7 B ajustado por DPO, no cuantificado en esta ficha.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- El ajuste sobre 49 tenets de valor puede producir sobreajuste a la constitucion v3 concreta y reducir la neutralidad respecto a valores no cubiertos.
- Al ser un full fine-tune sobre un unico dataset de preferencias, puede exhibir deriva respecto al modelo base en tareas ajenas al alineamiento, sin que se haya medido dicha degradacion.
- El repositorio ocupa 14,6 GB y no incluye versiones cuantizadas ni GGUF, lo que anade un paso de conversion para despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-generalization/olmo3-7b-v3-all
- Modelo base (SFT neutro): https://huggingface.co/value-generalization/neutral-sft-v3-olmo3-7b
- Dataset de preferencias referenciado: https://huggingface.co/datasets/value-generalization/constitution-v3-dpo
- Organizacion en HuggingFace: https://huggingface.co/value-generalization
- Repositorio de procedencia y recetas: repositorio `value-generalization` en el commit `669a6d8` (receta `configs/experiments/dpo_v3_all_olmo3.yaml`, lanzador `scripts/0918/train_v3_all.sbatch`)
- Paper, blog o demo adicionales: no disponible
