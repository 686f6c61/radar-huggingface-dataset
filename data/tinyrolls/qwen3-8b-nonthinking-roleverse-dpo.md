# tinyrolls/Qwen3-8B-NonThinking-RoleVerse-DPO

## Resumen

Qwen3-8B-NonThinking-RoleVerse-DPO es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario tinyrolls como parte del trabajo de investigacion "Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing". El modelo parte del checkpoint base de Qwen3-8B en modo no-thinking y se entrena exclusivamente con DPO (Direct Preference Optimization) sobre el dataset RoleVerse, un benchmark multilingue de role-playing centrado en situaciones de conflicto y evaluado con un protocolo dual que mide por separado la comprension social (preguntas de opcion multiple) y la capacidad de enactar el personaje (respuestas abiertas).

La relevancia del modelo es fundamentalmente experimental: sirve como evidencia empirica de que el razonamiento y la actuacion social pueden moverse en direcciones opuestas. Segun la tabla del paper, el checkpoint parte de un Resp Avg de 3,16 y un MCQ del 33,96 % en el modelo base, y tras el DPO alcanza un Resp Avg de 3,42 con un MCQ del 35,23 %, mejorando la calidad de las respuestas enactadas sin degradar (incluso mejorando ligeramente) la comprension social.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-8B, con 8.190.735.360 parametros totales, licencia Apache-2.0 y pesos en safetensors. El modelo esta pensado para investigacion en role-playing multilingue (ingles, chino, japones, frances y espanol), no como un asistente generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Ingles, chino, japones, frances, espanol |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen3-8B en modo no-thinking. La arquitectura subyacente es un transformer denso de 8.190 millones de parametros, sin mezcla de expertos. El entrenamiento descrito en la model card consiste exclusivamente en DPO (sin fase SFT) sobre el dataset RoleVerse, un corpus multilingue de dialogos de role-playing construido alrededor de escenarios de conflicto. El dataset se evalua con un protocolo dual: una pregunta de opcion multiple que mide la comprension de la situacion social (MCQ) y una respuesta abierta puntuada en cinco dimensiones de 1 a 5 por un juez GPT-5 (Resp Avg).

La innovacion tecnica del trabajo no reside en la arquitectura sino en el diseno experimental: el paper compara sistematicamente las variantes SFT-only, DPO-only y SFT+DPO sobre cuatro familias base (Llama-3.1-8B-Instruct, Qwen3-8B Non-thinking, Qwen3-8B Thinking y R1-Distill-Qwen3-8B), mostrando que el lado con mas razonamiento comprende mejor la escena pero la enacta peor, y que ambas capacidades pueden moverse en direcciones opuestas segun la receta de entrenamiento. El DPO-only sobre Qwen3-8B Non-thinking es precisamente la receta que produce el mejor equilibrio entre Resp Avg y MCQ en esa familia.

## Capacidades

- Generacion de texto conversacional orientada a role-playing y dialogo multi-turno.
- Enactacion de personajes en escenarios de conflicto social, con respuestas abiertas puntuadas en cinco dimensiones.
- Comprension de situaciones sociales medida mediante preguntas de opcion multiple.
- Soporte multilingue en ingles, chino, japones, frances y espanol.
- Modo no-thinking: respuestas directas sin bloque `</think>`, lo que reduce latencia frente al checkpoint Thinking.
- Compatible con `apply_chat_template` de transformers y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Investigacion en role-playing multilingue: el modelo sirve como checkpoint de referencia para reproducir los resultados del paper y comparar recetas de entrenamiento (SFT, DPO, SFT+DPO) sobre la misma base Qwen3-8B.
- Evaluacion del trade-off razonamiento-sociabilidad: util para experimentos que midan si aumentar la comprension social degrada la enactacion del personaje, usando el protocolo dual know-act del benchmark RoleVerse.
- Generacion de dialogos de personaje en prototipos de videojuegos o ficcion interactiva: el ajuste DPO mejora la naturalidad de las respuestas enactadas (Resp Avg 3,42 frente a 3,16 del base) en escenarios de conflicto.
- Creacion de datasets sinteticos de dialogo multilingue: al cubrir cinco idiomas, puede generar utterances de personaje en ingles, chino, japones, frances y espanol para aumentar corpus de entrenamiento.
- Estudio de alineacion con DPO: el checkpoint es un ejemplo reproducible de DPO-only sobre una base instruct, util para analizar como afecta el DPO a metricas de comprension frente a metricas de actuacion.
- Benchmarking de jueces automaticos: las respuestas del modelo pueden usarse para calibrar o auditar jueces LLM (el paper emplea GPT-5 como juez) en tareas de evaluacion subjetiva de dialogo.
- Base para posteriores ajustes: su licencia Apache-2.0 y su formato safetensors facilitan usarlo como punto de partida para nuevos fine-tunes de role-playing.

## Benchmarks y rendimiento

Resultados del paper en el test set de RoleVerse. Resp Avg es la media de cinco dimensiones de respuesta (1-5, juez GPT-5); MCQ % es la precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---:|---:|---:|
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
| Qwen3-8B Non-thinking | + Only SFT | 3,35 | 32,07 |
| Qwen3-8B Non-thinking | + Only DPO (este modelo) | 3,42 | 35,23 |
| Qwen3-8B Non-thinking | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
| Qwen3-8B Thinking | + Only DPO | 3,60 | 43,12 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
| Llama-3.1-8B-Instruct | + Only DPO | 3,42 | 32,39 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
| R1-Distill-Qwen3-8B | + Only DPO | 3,07 | 49,62 |
| Qwen3-30B-A3B-Instruct-2507 | sin entrenar | 3,69 | 41,73 |
| DeepSeek-R1-0528 | sin entrenar | 4,12 | 70,14 |
| GPT-5 (low; oracle, solo referencia) | sin entrenar | 4,35 | 81,88 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB.
- Cuantizacion a 4 bits: alrededor de 4-5 GB de pesos, viable en GPUs consumer de 8 GB, aunque la calidad en role-playing puede degradarse.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; RTX 3090/4080 (16 GB) para 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en RTX 3060/4060 Ti de 16 GB o superiores con cuantizacion.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag oficial), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada. El modo no-thinking evita el bloque de razonamiento y reduce la latencia frente al checkpoint Thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % | Licencia |
|---|---:|---|---:|---:|---|
| Qwen3-8B-NonThinking-RoleVerse-DPO (este) | 8,19 B | no disponible | 3,42 | 35,23 | Apache-2.0 |
| Qwen3-8B Non-thinking base | 8,19 B | no disponible | 3,16 | 33,96 | Apache-2.0 |
| Qwen3-8B Thinking + Only DPO | 8,19 B | no disponible | 3,60 | 43,12 | Apache-2.0 |
| Llama-3.1-8B-Instruct + Only DPO | 8,03 B | no disponible | 3,42 | 32,39 | Llama 3.1 Community License |
| R1-Distill-Qwen3-8B + Only DPO | 8,19 B | no disponible | 3,07 | 49,62 | MIT |

La comparativa muestra el trade-off central del paper: los modelos con mas razonamiento (Thinking, R1-Distill) obtienen mejor MCQ pero peor Resp Avg, mientras que el DPO-only sobre la base no-thinking iguala el Resp Avg de Llama-3.1-8B-Instruct + DPO con mejor MCQ y mantiene la licencia permisiva Apache-2.0.

## Limitaciones y advertencias

- Modelo de investigacion: entrenado exclusivamente con DPO sobre un benchmark de role-playing; no esta optimizado como asistente generalista ni para tareas de codigo, matematicas o razonamiento formal.
- Riesgo de alucinacion: al ser un modelo conversacional de 8 B sin RLHF general, puede generar contenido factualmente incorrecto, especialmente fuera de contextos de dialogo.
- Sesgos: el dataset RoleVerse se centra en escenarios de conflicto; el modelo puede reproducir sesgos sociales o estereotipos presentes en los datos de entrenamiento y en la base Qwen3.
- Limitaciones de idioma: solo se declaran cinco idiomas (en, zh, ja, fr, es); el rendimiento fuera de ellos no esta garantizado.
- Longitud de contexto: no documentada en la informacion disponible; conviene verificar la configuracion del tokenizer antes de usarlo con dialogos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3-8B y hereda sus terminos; conviene revisar la licencia de la base y del dataset RoleVerse antes de un despliegue comercial.
- El paper esta en revision: los resultados deben tratarse como preliminares y no replicados de forma independiente.
- Sin soporte documentado de tool calling, agentes ni vision; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyrolls/Qwen3-8B-NonThinking-RoleVerse-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
