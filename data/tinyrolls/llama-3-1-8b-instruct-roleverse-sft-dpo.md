# tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO

## Resumen

Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario tinyrolls, orientado especificamente a la interpretacion de personajes (role-playing) en dialogos multilingues. El modelo forma parte del trabajo recogido en el articulo *Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing* y se entrena sobre el conjunto de datos RoleVerse, un benchmark multilingue construido en torno a situaciones de conflicto y evaluado con un protocolo dual que mide por separado la comprension social (preguntas de opcion multiple) y la capacidad de actuar en personaje (respuestas abiertas juzgadas con GPT-5).

El modelo parte de la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parametros (8B) y se somete a un pipeline de dos fases: supervised fine-tuning (SFT) seguido de direct preference optimization (DPO). La relevancia de esta ficha radica en que documenta un hallazgo contraintuitivo: el ajuste para mejorar la actuacion en personaje degrada sistematicamente la comprension social medida por MCQ, ilustrando un trade-off entre razonamiento y comportamiento social que el propio paper pone de relieve.

El checkpoint esta publicado con licencia Llama 3.1 Community License, soporta cinco idiomas (ingles, chino, japones, frances y espanol) y esta pensado para experimentacion en investigacion sobre role-playing, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ, pero el autor no la documenta) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con atencion por grupos (GQA) y las innovaciones propias de la familia Llama 3.1. Sobre esa base, el autor aplica un pipeline de dos etapas sobre el dataset RoleVerse: primero supervised fine-tuning (SFT) y despues direct preference optimization (DPO). El dataset RoleVerse es un benchmark multilingue de role-playing centrado en conflictos sociales, con un protocolo de evaluacion dual: una pregunta de opcion multiple (MCQ) que mide si el modelo comprende la situacion social, y una respuesta abierta evaluada en cinco dimensiones (1-5) por un juez GPT-5 para medir si la respuesta es coherente con lo que diria el personaje.

El entrenamiento se realizo tambien sobre otros modelos base (Qwen3-8B en modo thinking y non-thinking, y R1-Distill-Qwen3-8B), lo que permite al paper comparar el efecto del mismo pipeline SFT+DPO sobre arquitecturas distintas. La innovacion tecnica destacable no es arquitectonica sino metodologica: el paper demuestra que SFT y DPO mueven las dos dimensiones (comprension social y actuacion en personaje) en direcciones opuestas, de modo que mejorar la segunda degrada la primera. En el caso de Llama-3.1-8B, el MCQ cae de 29,36 % (base) a 17,05 % tras SFT+DPO, mientras que la puntuacion media de respuesta sube de 2,87 a 3,81.

## Capacidades

- Generacion de texto conversacional multi-turno en formato de dialogo con roles (`role1` como usuario, `role2` como asistente).
- Interpretacion de personajes (role-playing) en situaciones de conflicto social, con respuestas coherentes con el personaje asignado.
- Capacidades multilingues en ingles, chino, japones, frances y espanol.
- Comprension de situaciones sociales medida mediante preguntas de opcion multiple (aunque el entrenamiento SFT+DPO degrada esta metrica respecto al base).
- Soporte de plantilla de chat (`apply_chat_template`) compatible con el ecosistema transformers y text-generation-inference.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode en la informacion proporcionada.

## Casos de uso

- Investigacion sobre role-playing multilingue: el modelo sirve como checkpoint de referencia para reproducir los experimentos del paper y comparar el efecto de SFT y DPO sobre la actuacion en personaje frente a la comprension social.
- Evaluacion de trade-offs razonamiento-sociabilidad: util para estudiar como el ajuste fino orientado a comportamiento degrada la precision en tareas de comprension social, usando el protocolo dual know-act del benchmark RoleVerse.
- Generacion de dialogos de personaje en prototipos de narrativa interactiva: el modelo mantiene el turno de `role2` con coherencia de personaje en conversaciones multi-turno, adecuado para demos de ficcion interactiva en los cinco idiomas soportados.
- Simulacion de conversaciones de conflicto para entrenamiento de habilidades sociales: permite generar respuestas en personaje en escenarios de tension, util en investigacion sobre comportamiento social de LLM.
- Benchmarking de modelos base alternativos: al existir checkpoints equivalentes sobre Qwen3-8B y R1-Distill-Qwen3-8B, el modelo sirve como punto de comparacion en estudios de ajuste fino sobre distintas arquitecturas.
- Experimentacion academica con pipelines SFT+DPO: el checkpoint documenta el efecto combinado de ambas fases, lo que lo hace util como caso de estudio de alineacion y preferencias en modelos de 8B.

## Benchmarks y rendimiento

Resultados del paper en el conjunto de test de RoleVerse. Resp Avg: media de cinco dimensiones de respuesta (1-5, juez GPT-5). MCQ %: precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
| :--- | ---: | ---: | ---: |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
| | + Only SFT | 3,35 | 19,07 |
| | + Only DPO | 3,42 | 32,39 |
| | + SFT & DPO (este checkpoint) | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
| | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
| | + SFT & DPO | 3,61 | 34,60 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
| | + SFT & DPO | 3,07 | 28,85 |
| Qwen2.5-32B-Instruct | untrained | 2,79 | 48,67 |
| R1-Distill-Qwen-32B | untrained | 2,38 | 53,28 |
| Qwen3-30B-A3B-Instruct-2507 | untrained | 3,69 | 41,73 |
| Qwen3-30B-A3B-Thinking-2507 | untrained | 3,40 | 52,27 |
| gpt-oss-120b (low) | untrained | 3,15 | 67,30 |
| gpt-oss-120b (medium) | untrained | 3,00 | 72,60 |
| gpt-oss-120b (high) | untrained | 2,93 | 73,04 |
| DeepSeek-R1-0528 | untrained | 4,12 | 70,14 |
| GPT-5 (low; oracle, ref. only) | untrained | 4,35 | 81,88 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 16 GB para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de VRAM; cuantizacion a 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue de produccion; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090 (24 GB) tambien viable en fp16.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 a fp16, y en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) mediante cuantizacion a 4 u 8 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama y vLLM no estan documentados por el autor pero son compatibles con pesos safetensors de Llama 3.1 previa conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % (RoleVerse) | Licencia |
|---|---:|---:|---:|---:|---|
| Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO | 8,03B | no disponible | 3,81 | 17,05 | Llama 3.1 Community |
| Qwen3-8B Non-thinking + SFT & DPO | 8B | no disponible | 3,73 | 31,57 | Apache-2.0 |
| Qwen3-8B Thinking + SFT & DPO | 8B | no disponible | 3,61 | 34,60 | Apache-2.0 |
| R1-Distill-Qwen3-8B + SFT & DPO | 8B | no disponible | 3,07 | 28,85 | MIT |

La comparativa se limita a los checkpoints del mismo estudio, ya que son los unicos con resultados publicados sobre el benchmark RoleVerse en la informacion disponible. Frente a los checkpoints Qwen3-8B, el modelo Llama obtiene la mejor puntuacion de respuesta (3,81) pero la peor precision en MCQ (17,05 %), lo que ilustra el trade-off razonamiento-sociabilidad descrito en el paper.

## Limitaciones y advertencias

- El entrenamiento SFT+DPO degrada severamente la comprension social medida por MCQ (de 29,36 % a 17,05 %), por lo que el modelo no es fiable para tareas que requieran razonamiento sobre situaciones sociales.
- Riesgo de alucinacion y de respuestas incoherentes fuera del dominio de role-playing: el ajuste esta orientado exclusivamente a dialogos de personaje.
- El modelo esta especializado en un unico formato de interaccion (`role1` como usuario, `role2` como asistente) y requiere el system prompt especifico del repositorio de codigo (`prompts/ResponseGeneration.yaml`); su uso fuera de ese formato puede degradar el comportamiento.
- Cobertura linguistica limitada a en, zh, ja, fr y es; no se documenta soporte de otros idiomas.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribucion ("Built with Llama"); debe revisarse antes de cualquier despliegue en produccion.
- Modelo de investigacion con 113 descargas y 0 likes en el momento de la ficha: no hay evidencia de validacion en produccion ni de robustez fuera del benchmark RoleVerse.
- No se documentan mitigaciones de sesgo; al entrenarse sobre dialogos de conflicto, puede reproducir estereotipos o respuestas socialmente inapropiadas.
- No se dispone de datos de latencia, throughput ni de cuantizaciones validadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
