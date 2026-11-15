# ZuzeTt/lfm3-1.7b-roleplay

## Resumen

`ZuzeTt/lfm3-1.7b-roleplay` es un adaptador LoRA (r=16) entrenado sobre el checkpoint base `LiquidAI/LFM3-1.7B` de Liquid AI, orientado a generacion de roleplay conversacional con tarjetas de personaje. El adaptador busca que el modelo mantenga el personaje, escriba en primera o tercera persona segun el contexto y reduzca las respuestas moralizantes o fuera de personaje ("lecturing"), sin convertirse en un modelo sin censura: el corpus de entrenamiento fue filtrado para eliminar contenido explicito.

El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros de Liquid AI. El adaptador anade aproximadamente 8 millones de tokens de entrenamiento repartidos entre roleplay en ingles con tarjetas de personaje (4,0M), PIPPA en ruso (2,0M) y chat general e instrucciones (2,0M). El entrenamiento se completo en 1,57 horas sobre una unica GPU T4, con 696 pasos y una perdida final de 1,61.

Su relevancia practica es acotada pero clara: demuestra que un ajuste LoRA ligero sobre un modelo pequeno puede mejorar la adherencia al personaje y, segun el autor, reducir la perplexity en Ultrachat de 9,79 a 7,06 sin degradar matematicas, Python ni JSON. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y con una licencia (LFM Open License v1.0) que restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA r=16, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ4_XS (repositorio GGUF con adaptador fusionado) |
| Idiomas soportados | Ingles y ruso (segun datos de entrenamiento); rendimiento en ruso inferior al ingles segun el autor |
| Licencia | LFM Open License v1.0 (uso comercial solo por debajo de 10M USD de ingresos anuales) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer LFM3-1.7B de Liquid AI mediante LoRA con rango 16, alpha 32 y dropout 0,05, cubriendo todas las capas lineales de atencion y MLP. El entrenamiento consistio en 1 epoca con tasa de aprendizaje 5e-5, scheduler coseno, longitud maxima de 2048 tokens, empaquetado de secuencias y perdida calculada solo sobre los turnos del asistente. Se eliminaron los prefijos `Character:` del 93% de los turnos del asistente para que el adaptador no los imite.

El corpus suma aproximadamente 8 millones de tokens: 4,0M de roleplay en ingles con tarjetas de personaje procedentes de `Gryphe/Sonnet3.5-Charcard-Roleplay` (subconjunto SFW), 2,0M de `IlyaGusev/pippa_ru` (subconjunto SFW) y 2,0M de `HuggingFaceH4/ultrachat_200k`. La inclusion deliberada de la porcion de chat general busca evitar el olvido catastrofico en habilidades ajenas al roleplay. Se filtraron las filas etiquetadas como NSFW y el vocabulario sexual explicito. El resultado fueron 696 pasos, perdida de entrenamiento 1,61 y precision media de token de 0,61. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles y ruso, con enfasis en mantener la voz y la coherencia de un personaje definido en el mensaje de sistema.
- Roleplay multi-turno con tarjetas de personaje, incluyendo narracion en primera o tercera persona (el adaptador puede mezclar el punto de vista si no se especifica).
- Reduccion de respuestas moralizantes y salidas de personaje en prompts seguros pero provocadores: tasa de rechazo del 0% en 8 prompts de prueba, tanto en el base como en el adaptador.
- Preservacion de habilidades generales segun el autor: matematicas, Python, JSON y respuestas en ruso siguen siendo correctas tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: el autor recomienda `enable_thinking=False` en la plantilla de chat para el uso de roleplay.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador permite montar un bot con una tarjeta de personaje en el mensaje de sistema y obtener respuestas en personaje sin necesidad de reentrenar; util para validar guiones y tono antes de invertir en un modelo mayor.
- Demos de roleplay en hardware modesto: con cuantizacion 4-bit cabe en una GPU de 4 GB, lo que permite desplegar una demo interactiva en un portatil o en una instancia pequena de cloud.
- Generacion de dialogos para narrativa y videojuegos: sirve para producir borradores de conversaciones de PNJ en ingles o ruso, con la advertencia de que la memoria efectiva es corta por el tamano del modelo.
- Evaluacion de tecnicas LoRA: al ser un adaptador pequeno y documentado (r=16, 696 pasos, corpus mixto), es un caso de estudio util para comparar estrategias de ajuste fino sobre modelos de 1,7B.
- Asistentes de chat con tono controlado: la porcion de Ultrachat en el entrenamiento mantiene respuestas generales correctas, por lo que puede emplearse como base de un asistente conversacional con personalidad fija.
- Filtrado y moderacion de contenido en pipelines de roleplay: el adaptador esta entrenado solo con datos SFW, lo que lo hace adecuado para entornos donde el contenido explicito debe quedar fuera por diseno.
- Experimentacion multilingue ingles-ruso: permite probar la transferencia de un adaptador entrenado mayoritariamente en ingles hacia conversaciones en ruso, con la salvedad de que el rendimiento en ruso es inferior.

## Benchmarks y rendimiento

| Metrica | Base | Adaptador |
|---|---|---|
| Tasa de rechazo en 8 prompts de roleplay seguros pero provocadores | 0% | 0% |
| Perplexity en Ultrachat reservado | 9,79 | 7,06 |
| Perdida de entrenamiento | no disponible | 1,61 |
| Precision media de token | no disponible | 0,61 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la cifra de perplexity corresponde a Ultrachat reservado y no a un benchmark amplio: demuestra ausencia de olvido catastrofico en esa distribucion, no una mejora general de todas las habilidades.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB con carga en 4-bit (`--load-in-4bit`), segun el autor; en precision completa, el modelo de 1,7B requiere del orden de 3,4 GB solo para pesos mas memoria para activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB para la variante 4-bit; el entrenamiento del adaptador se realizo en una unica T4.
- GPU de consumo: cabe en tarjetas consumer de gama media y baja con 4-8 GB de VRAM; no se especifican modelos concretos mas alla de la T4 usada en entrenamiento.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor con `run_roleplay.py`); el repositorio GGUF con adaptador fusionado permite usar llama.cpp y derivados, aunque la informacion no detalla configuraciones concretas.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico dato temporal es el entrenamiento (1,57 h en una T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZuzeTt/lfm3-1.7b-roleplay | 1,7B + LoRA r=16 | 2048 (entrenamiento) | Roleplay SFW EN/RU | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face (modelo base) |
| Alternativas de roleplay de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de 1,7B: memoria conversacional corta y menor calidad en ruso que en ingles, segun el propio autor.
- El corpus mezcla narracion en primera y tercera persona, por lo que el adaptador puede alternar el punto de vista; se recomienda fijarlo en el mensaje de sistema.
- No es un modelo sin censura ni NSFW: reduce las respuestas moralizantes y las salidas de personaje, pero el material explicito fue filtrado del entrenamiento.
- Riesgo de alucinacion inherente a un modelo de este tamano; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos de los datasets de origen (Sonnet3.5-Charcard-Roleplay, PIPPA, Ultrachat) se heredan sin analisis especifico.
- Restriccion de licencia: la LFM Open License v1.0 solo permite uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares; por encima de ese umbral se requiere licencia separada de Liquid AI.
- Obligaciones de datos: `Gryphe/Sonnet3.5-Charcard-Roleplay` no declara licencia en su origen, lo que puede imponer obligaciones adicionales al uso aguas abajo de los pesos.
- El adaptador requiere acceso al checkpoint base `LiquidAI/LFM3-1.7B` y su tokenizador y plantilla de chat no se modifican.
- Artefacto con cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de las metricas declaradas por el autor.
- El repositorio principal ocupa 0,0 GB segun los metadatos, lo que sugiere que los pesos del adaptador pueden no estar completamente subidos o que el tamano reportado es impreciso; conviene verificar los archivos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZuzeTt/lfm3-1.7b-roleplay
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset PIPPA en ruso: https://huggingface.co/datasets/IlyaGusev/pippa_ru
- Dataset Ultrachat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Licencia LFM Open License v1.0: incluida en el archivo `LICENSE` del repositorio del modelo
