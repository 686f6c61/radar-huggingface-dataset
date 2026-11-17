# yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4

## Resumen

Qwen3-Omni-30B-A3B-Instruct-NVFP4 es una cuantizacion del checkpoint original Qwen/Qwen3-Omni-30B-A3B-Instruct publicado por el equipo Qwen de Alibaba Cloud, realizada por el usuario yemara con NVIDIA ModelOpt 0.48.0. Se trata de un modelo any-to-any (texto, audio e imagen de entrada, texto y audio de salida) basado en una arquitectura MoE con 35.259.818.545 parametros totales y aproximadamente 3.000 millones de parametros activos por token, del que se ha cuantizado a NVFP4 W4A4 unicamente el modelo de texto del thinker.

La motivacion de esta ficha es la reduccion de huella: el checkpoint original en BF16 ocupa 70,5 GB, mientras que esta version ocupa 27,1 GB en 6 shards, con el modelo de texto del thinker pasando de 61,1 GB a 17,6 GB. El resto del modelo (codificadores de audio y vision, talker, code predictor y code2wav) permanece en BF16 byte a byte, de modo que se conservan todas las capacidades omni del original. Es el checkpoint que sirve el motor Hibana para su target `qwen3omni`.

Esta revision concreta sustituye los valores NVFP4 de la primera por escalas de bloque elegidas mediante busqueda ponderada por la Hessiana de ModelOpt en lugar de block max, con un conjunto de calibracion mayor y orientado a razonamiento y conversaciones largas. Segun la model card, frente a BF16 reduce la divergencia KL del siguiente token de la primera revision en un 28% a la misma velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (Qwen3-Omni MoE: thinker, talker, code predictor, code2wav, codificadores de audio y vision) |
| Parametros totales | 35.259.818.545 |
| Parametros activos | aproximadamente 3.000 millones (MoE 30B-A3B); 48 bloques x 128 expertos en el thinker |
| Longitud de contexto | no disponible en la informacion proporcionada (la calibracion incluye muestras de hasta 65.536 tokens) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 (pesos uint8 con dos codigos E2M1 por byte, escala E4M3 por 16 pesos, escala global FP32, escala de entrada FP32 estatica); resto en BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada (la calibracion cubre 20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, 27,1 GB de tensores); configuracion de cuantizacion en `hf_quant_config.json` y `config.json` (formato ModelOpt) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de Qwen3-Omni con 48 bloques y 128 expertos enrutados por bloque en el thinker, acompanado de un talker, un code predictor, un decoder code2wav y codificadores de audio y vision. Esta ficha describe una cuantizacion post-entrenamiento, no un reentrenamiento: el autor no aporta datos sobre el corpus de preentrenamiento del modelo original, el numero de tokens vistos ni si hubo RLHF o DPO. Lo que si se documenta con detalle es el proceso de cuantizacion.

La cuantizacion se aplico con NVIDIA ModelOpt 0.48.0 (`mtq.quantize`) usando la configuracion `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG`: la escala E4M3 de cada bloque de 16 pesos se busca sobre la rejilla FP8 minimizando el error de salida ponderado por la Hessiana de las activaciones de calibracion (`local_hessian`, `fp8_scale_sweep`); las escalas globales de activacion se calibran por maximo y las escalas de bloque de activacion son dinamicas. Se cuantizaron a NVFP4 los expertos enrutados (gate_proj, up_proj, down_proj), las proyecciones de atencion q/k/v/o y el lm_head; permanecen en BF16 embed_tokens, RMSNorms (incluidas q/k norms), routers MoE, codificadores de audio y vision, talker, code predictor y code2wav. No se almacena cuantizacion de KV-cache (`kv_cache_quant_algo: null`).

El conjunto de calibracion se compone de 367 muestras y 1.588.731 tokens: 800 primeros turnos de usuario de mlabonne/open-perfectblend y preguntas de validacion de MMLU/MMLU-Pro con respuestas de hasta 2.048 tokens; 224 prompts de razonamiento (MetaMathQA, orca-math, UltraInteract, evol-codealpaca y MMLU) con respuestas de hasta 8.192 tokens; 480 prompts humanos de CohereLabs/aya_dataset (24 en cada uno de 20 idiomas); empaquetados en 353 muestras de hasta 4.096 tokens, mas 14 conversaciones multiturno cortadas a 16.384 (8), 32.768 (4) y 65.536 tokens (2) para calibrar atencion de largo alcance. Las respuestas fueron generadas por el modelo BF16 original servido por Hibana a temperatura 0,7 y renderizadas con la plantilla de chat del modelo; se descartaron prompts que compartieran una ventana de 13 palabras con el conjunto de evaluacion. La calibracion tardo 89 minutos en una GB10. El ensamblado final renombro los tensores de `model.*`/`lm_head.*` a `thinker.model.*`/`thinker.lm_head.*` y los fusiono por copia de bytes con el resto del checkpoint original, verificando cada tensor por sha256 (`provenance.json`).

## Capacidades

- Entrada any-to-any: texto, audio e imagen; salida de texto y audio (el checkpoint completo incluye thinker, codificadores de audio y vision, talker, code predictor y code2wav).
- Generacion de texto y razonamiento, con modo instructivo (variante Instruct).
- Generacion de codigo y resolucion de problemas matematicos, evidenciado por el uso de MetaMathQA, evol-codealpaca y MMLU/MMLU-Pro en la calibracion.
- Comprension de audio (speech-to-text) mediante el codificador de audio en BF16.
- Comprension de imagen mediante el codificador visual en BF16.
- Sintesis de voz (text-to-speech) mediante talker, code predictor y code2wav en BF16.
- Conversaciones multiturno y contexto largo: la calibracion incluye muestras de hasta 65.536 tokens.
- Capacidades multilingues: la calibracion cubre 20 idiomas con 24 prompts cada uno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede recibir texto, audio e imagen en una misma conversacion y responder en texto o audio, gracias a que los codificadores y el talker se conservan en BF16 sin degradacion por cuantizacion.
- Transcripcion y comprension de audio: el codificador de audio en BF16 permite tareas de speech-to-text y respuesta a consultas habladas dentro de un mismo pipeline any-to-any.
- Generacion de voz para interfaces: el decoder code2wav en BF16 habilita sintesis de voz en aplicaciones de accesibilidad, lectura de documentos o agentes telefonicos.
- Razonamiento y matematicas en produccion: el thinker cuantizado a NVFP4 conserva el comportamiento del modelo original con una divergencia KL reducida frente a BF16, lo que lo hace adecuado para pipelines de resolucion de problemas con restricciones de memoria.
- Generacion de codigo asistida: al mantener el lm_head y las proyecciones de atencion en NVFP4 con calibracion que incluye codealpaca y perfectblend, es utilizable en tareas de autocompletado y explicacion de codigo donde el ahorro de VRAM permite servir el modelo completo junto con los codificadores.
- Despliegue en hardware Blackwell: al ser un checkpoint NVFP4 pensado para GB10 y servido por Hibana, encaja en entornos con GPU Blackwell de memoria limitada donde el BF16 de 70,5 GB no cabria.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card documenta exhaustivamente calibracion, escalas y hashes, lo que lo convierte en una referencia util para investigar el impacto de NVFP4 W4A4 en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la divergencia KL del siguiente token frente a BF16, que en esta revision se reduce un 28% respecto a la primera revision NVFP4 a la misma velocidad. No se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput absolutos.

## Requisitos de hardware

- VRAM estimada para inferencia: 27,1 GB de tensores en safetensors, por lo que se necesita al menos esa cantidad mas overhead de activaciones y KV-cache; el checkpoint BF16 equivalente requiere 70,5 GB.
- GPU recomendadas: NVIDIA GB10 (plataforma usada para la calibracion y target de Hibana); GPU Blackwell compatibles con NVFP4 en general. Para A100, H100 o RTX 4090 no hay confirmacion de soporte nativo de NVFP4 en la informacion disponible.
- Cabe en consumer GPU: no disponible; el tamano de 27,1 GB excede la VRAM de la mayoria de GPU de consumo, aunque podria entrar en modelos con 32 GB o mas, sin confirmacion del autor.
- Opciones de despliegue: motor Hibana (target `qwen3omni`), que es el entorno para el que se publica el checkpoint. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles; solo se indica que la calibracion tardo 89 minutos en una GB10 y que la nueva revision mantiene la misma velocidad que la primera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4 | 35.259.818.545 (aprox. 3.000 M activos) | no disponible | safetensors NVFP4 + BF16, 27,1 GB | Apache 2.0 | Hugging Face, 48 descargas |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 35.259.818.545 (aprox. 3.000 M activos) | no disponible | safetensors BF16, 70,5 GB | Apache 2.0 | Hugging Face (modelo base) |
| Primera revision NVFP4 del mismo autor | 35.259.818.545 (aprox. 3.000 M activos) | no disponible | safetensors NVFP4 + BF16 | Apache 2.0 | Hugging Face (sustituida por esta revision) |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas de la misma categoria; la comparacion se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Solo esta cuantizado el modelo de texto del thinker; los codificadores de audio y vision, el talker, el code predictor y code2wav siguen en BF16, por lo que el ahorro de memoria no se aplica a esas partes y el checkpoint completo sigue requiriendo 27,1 GB.
- No se almacena cuantizacion de KV-cache (`kv_cache_quant_algo: null`), de modo que el KV-cache en produccion se gestiona en el tipo por defecto del runtime.
- La cuantizacion introduce perdida numerica inevitable: la model card reporta una divergencia KL frente a BF16, reducida un 28% respecto a la primera revision, pero no elimina la diferencia con el modelo original.
- La calibracion fue exclusivamente de texto (se eliminaron los codificadores de audio y vision durante el proceso), por lo que el comportamiento cuantizado en tareas puramente de audio o vision no esta caracterizado.
- Riesgo de alucinacion inherente al modelo base; no se aportan evaluaciones especificas de factualidad ni de sesgos en la informacion disponible.
- Idiomas soportados no documentados de forma explicita; la calibracion cubre 20 idiomas, pero no se garantiza un rendimiento equivalente en todos.
- El checkpoint esta pensado para el motor Hibana y hardware Blackwell (GB10); su uso en otros runtimes o GPU no esta validado en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero los pesos siguen siendo del equipo Qwen de Alibaba Cloud y esta revision solo cambia el formato numerico de algunos tensores; conviene conservar avisos de atribucion.
- Modelo con muy poca adopcion en el momento de la ficha (48 descargas, 0 likes), lo que implica escasa validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Motor Hibana: https://github.com/sharar-project/hibana
- Dataset de calibracion mlabonne/open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de calibracion CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- NVIDIA ModelOpt: no disponible como enlace en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
