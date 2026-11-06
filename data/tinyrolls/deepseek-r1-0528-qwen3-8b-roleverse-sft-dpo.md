# tinyrolls/DeepSeek-R1-0528-Qwen3-8B-RoleVerse-SFT-DPO

## Resumen

DeepSeek-R1-0528-Qwen3-8B-RoleVerse-SFT-DPO es un ajuste fino del modelo destilado DeepSeek-R1-0528-Qwen3-8B (8.190.735.360 parametros) desarrollado por el usuario tinyrolls. El modelo parte de la destilacion de razonamiento de DeepSeek-R1 sobre la base Qwen3-8B y se entrena especificamente para role-playing multilingue mediante una combinacion de SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre el dataset RoleVerse.

RoleVerse es un benchmark y dataset de role-playing multilingue construido en torno a situaciones de conflicto y evaluado con un protocolo dual "know-act": una pregunta de opcion multiple que mide si el modelo comprende la situacion social y una respuesta abierta evaluada segun si es lo que diria el personaje. La investigacion asociada, "Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing", documenta un compromiso entre razonamiento y actuacion social: los modelos con mas capacidad de razonamiento comprenden mejor la escena pero la interpretan peor.

El modelo es relevante para quienes investigan el ajuste de modelos de razonamiento hacia tareas conversacionales y de rol, y para desarrolladores que necesitan un modelo de 8B con licencia MIT, soporte multilingue (en, zh, ja, fr, es) y pesos en safetensors compatibles con transformers. Su principal interes tecnico es que demuestra empiricamente que SFT y DPO pueden mover en direcciones opuestas las capacidades de comprension social y de actuacion en rol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B, destilado de DeepSeek-R1) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no indicadas) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 8,19 mil millones de parametros que hereda la arquitectura de Qwen3-8B y el proceso de destilacion de razonamiento de DeepSeek-R1-0528. El punto de partida es el checkpoint DeepSeek-R1-0528-Qwen3-8B, que combina el comportamiento de razonamiento de R1 con la base Qwen3. Sobre ese checkpoint se aplica un ajuste fino en dos fases: SFT y DPO, ambos sobre el dataset RoleVerse.

El entrenamiento se centra en el dataset RoleVerse, un conjunto multilingue de dialogos de role-playing construido alrededor de conflictos sociales, con anotaciones que permiten evaluar tanto la comprension de la situacion (preguntas de opcion multiple) como la calidad de la respuesta en personaje (evaluacion abierta en cinco dimensiones de 1 a 5). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de SFT/DPO. La contribucion tecnica destacable es la demostracion de que SFT y DPO pueden desplazar en direcciones opuestas las dos capacidades evaluadas: en el caso de R1-Distill-Qwen3-8B, SFT solo mejora la respuesta (2,47 a 3,07) pero hunde la comprension (50,06 a 31,50), mientras que DPO solo mejora la respuesta sin degradar tanto la comprension (49,62), y la combinacion SFT+DPO alcanza 3,07 en respuesta con 28,85 en MCQ.

## Capacidades

- Generacion de texto conversacional y dialogo multi-turno orientado a role-playing.
- Interpretacion de personajes en situaciones de conflicto social, con respuesta en personaje (`role2`) a partir de turnos de usuario (`role1`).
- Comprension de situaciones sociales mediante razonamiento (evaluable con preguntas de opcion multiple).
- Soporte multilingue en ingles, chino, japones, frances y espanol.
- Razonamiento derivado de DeepSeek-R1 (herencia del checkpoint base destilado).
- Compatibilidad con el chat template de Qwen3 y con el parametro `enable_thinking` para alternar modo pensamiento.
- No se documenta soporte explicito de tool calling, function calling ni capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Investigacion sobre role-playing y comportamiento social: el modelo sirve como checkpoint de referencia para reproducir los experimentos SFT/DPO del paper y comparar el trade-off entre comprension y actuacion en personaje.
- Evaluacion de benchmarks de dialogo: integrable en pipelines que midan la calidad de respuesta con jueces automaticos (el paper usa GPT-5 como juez) sobre el test set de RoleVerse.
- Prototipado de agentes conversacionales con personaje: util para construir demos de NPCs o asistentes con personalidad definida en entornos controlados, gracias a su tamano de 8B y licencia MIT.
- Experimentos multilingues: permite probar consistencia de comportamiento en personaje en cinco idiomas (en, zh, ja, fr, es) con un unico checkpoint.
- Generacion de dialogos sinteticos para aumento de datos: puede producir respuestas en personaje para construir datasets de entrenamiento o evaluacion de otros modelos.
- Docencia y divulgacion: modelo asequible en hardware consumer para explicar tecnicas de SFT, DPO y evaluacion dual know-act en un contexto practico.
- Base para nuevos ajustes: al tener licencia MIT y pesos safetensors, sirve como punto de partida para fine-tunings especificos de dominio conversacional.

## Benchmarks y rendimiento

Resultados del test set de RoleVerse segun la tabla del paper. Resp Avg es la media de cinco dimensiones de respuesta (1-5) evaluadas por GPT-5; MCQ % es la precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---:|---:|---:|
| No entrenado | Qwen2.5-32B-Instruct | 2,79 | 48,67 |
|  | R1-Distill-Qwen-32B | 2,38 | 53,28 |
|  | Qwen3-30B-A3B-Instruct-2507 | 3,69 | 41,73 |
|  | Qwen3-30B-A3B-Thinking-2507 | 3,40 | 52,27 |
|  | gpt-oss-120b (low) | 3,15 | 67,30 |
|  | gpt-oss-120b (medium) | 3,00 | 72,60 |
|  | gpt-oss-120b (high) | 2,93 | 73,04 |
|  | DeepSeek-R1-0528 | 4,12 | 70,14 |
|  | GPT-5 (low; oracle, ref. only) | 4,35 | 81,88 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
|  | + Only SFT | 3,35 | 19,07 |
|  | + Only DPO | 3,42 | 32,39 |
|  | + SFT & DPO | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
|  | + Only SFT | 3,35 | 32,07 |
|  | + Only DPO | 3,42 | 35,23 |
|  | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
|  | + Only SFT | 3,38 | 37,75 |
|  | + Only DPO | 3,60 | 43,12 |
|  | + SFT & DPO | 3,61 | 34,60 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
|  | + Only SFT | 2,15 | 31,50 |
|  | + Only DPO | 3,07 | 49,62 |
|  | + SFT & DPO (este checkpoint) | 3,07 | 28,85 |

El checkpoint publicado corresponde a la fila R1-Distill-Qwen3-8B + SFT & DPO: 3,07 en Resp Avg y 28,85 % en MCQ. Frente a su base, mejora la calidad de respuesta (+0,60) pero pierde 21,21 puntos de comprension social. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB de pesos, por lo que se necesitan alrededor de 18-20 GB de VRAM contando cache KV y overhead.
- Cabe en GPUs consumer de gama alta: RTX 4090 (24 GB) en BF16; RTX 3090 (24 GB) en BF16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) seria necesario cuantizar a 8 bits o usar offloading.
- GPUs profesionales recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para despliegue en produccion con concurrencia.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; llama.cpp y Ollama no estan confirmados por el autor, aunque al ser safetensors se podrian convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % (RoleVerse) | Licencia |
|---|---:|---|---:|---:|---|
| DeepSeek-R1-0528-Qwen3-8B-RoleVerse-SFT-DPO | 8,19B | no disponible | 3,07 | 28,85 | MIT |
| R1-Distill-Qwen3-8B (base) | 8,19B | no disponible | 2,47 | 50,06 | MIT |
| Qwen3-8B Thinking + SFT & DPO | ~8B | no disponible | 3,61 | 34,60 | Apache-2.0 |
| Llama-3.1-8B-Instruct + SFT & DPO | ~8B | no disponible | 3,81 | 17,05 | Llama 3.1 Community License |

En la misma categoria de 8B, el checkpoint destaca por su calidad de respuesta en personaje (3,07) frente a su base, pero queda por debajo de Qwen3-8B Thinking + SFT & DPO (3,61) y de Llama-3.1-8B-Instruct + SFT & DPO (3,81) en respuesta, y muy por debajo en comprension social (28,85 frente a 34,60 y 17,05). La licencia MIT es mas permisiva que la Llama 3.1 Community License.

## Limitaciones y advertencias

- El propio paper documenta un trade-off: el ajuste SFT+DPO mejora la actuacion en personaje pero degrada la comprension social (MCQ cae de 50,06 a 28,85 respecto al base).
- Riesgo de alucinacion inherente a los modelos generativos de 8B; no se documentan mitigaciones especificas.
- El modelo esta especializado en role-playing y dialogo con conflicto; su rendimiento en tareas generales de codigo, matematicas o razonamiento no se ha evaluado en la informacion disponible.
- La longitud de contexto no esta documentada; no debe asumirse la ventana de Qwen3-8B sin verificacion.
- Sesgos: no se detallan evaluaciones de sesgo; al entrenarse sobre dialogos de conflicto, puede reproducir estereotipos o respuestas socialmente inapropiadas si se usa fuera de su dominio previsto.
- Licencia MIT declarada, pero el modelo base es DeepSeek-R1-0528-Qwen3-8B (MIT segun el autor); conviene verificar la cadena de licencias antes de uso comercial.
- El paper esta en revision; los resultados deben tratarse como preliminares.
- El checkpoint se publico el 29 de octubre de 2026 y tiene 127 descargas y 0 likes, por lo que carece de validacion comunitaria amplia.
- Uso previsto como modelo de investigacion; no se recomienda desplegarlo en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyrolls/DeepSeek-R1-0528-Qwen3-8B-RoleVerse-SFT-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
