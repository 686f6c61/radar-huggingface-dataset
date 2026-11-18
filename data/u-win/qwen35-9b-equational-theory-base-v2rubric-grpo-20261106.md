# U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106

## Resumen

Qwen3.5-9B equational-theory (v2 rubrics) es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN. El modelo se ha entrenado con GRPO (Group Relative Policy Optimization) completamente asincrono para resolver problemas de teoria ecuacional formulados en lenguaje natural, un dominio de razonamiento matematico que exige manipular igualdades, verificar identidades y decidir si una ecuacion se cumple sobre un carrier finito dado. El repositorio contiene exclusivamente checkpoints intermedios de la ejecucion, no un modelo final consolidado.

El interes tecnico reside en la metodologia: el reward no proviene de un verificador simbolico ni de una solucion de referencia, sino de un juez LLM congelado (Qwen3.8-27B) que puntua de 0 a 7 cada respuesta segun una rubrica generica y emite un JSON de dos campos. Se eliminan las lineas de veredicto del candidato antes de la evaluacion y no se muestra al juez ni la etiqueta de verdad ni la solucion de referencia, lo que convierte al juez en "verdict-neutral". El modelo base tiene 9.653.104.368 parametros y es multimodal (image-text-to-text), aunque solo se entrena la torre de lenguaje.

Es relevante ahora porque documenta un caso de RL asincrono a gran escala (3 GPUs de entrenador, 3 de rollout y 2 de juez sobre un nodo HAI B200) con evaluacion intermedia cada 20 rollouts y conversion reproducible a safetensors con manifiesto de hashes por shard. La licencia Apache 2.0 y la compatibilidad con endpoints de Hugging Face facilitan su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), torre de vision y cabeza MTP congeladas; solo se entrena el modelo de lenguaje |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se usan 32.768 tokens de respuesta en el muestreo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (ramas `checkpoint-N`; shards `model-untrained-*` para tensores no entrenados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en la revision `c2022362`, sin preentrenamiento continuado. Sobre esa base se ejecuta GRPO asincrono con 24 prompts por rollout y 8 muestras por prompt (batch global de 192), temperatura 1.0 y un maximo de 32.768 tokens de respuesta. Solo se actualizan 427 tensores del modelo de lenguaje; los 348 tensores restantes (torre de vision `model.visual.*` y cabeza de prediccion multi-token `mtp.*`) se copian sin cambios del inicializador. El entrenamiento se realizo en Megatron sobre un nodo HAI B200 con 3 GPUs de entrenador, 3 de rollout y 2 de juez.

El reward se calcula con un juez local congelado Qwen3.8-27B (politica `v2rubric-verdict-neutral-user-rubric-20261104-v3`) que aplica una rubrica generica y devuelve un JSON con `assessment` y `score_0_to_7`; el reward es `score/7`. Antes de la evaluacion se eliminan del candidato las lineas de veredicto, y el juez nunca ve la solucion de referencia ni la etiqueta de verdad. El conjunto de prompts es `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric` (2182 problemas, todos TRUE, 54 con carrier finito). La evaluacion se hace sobre `U-WIN/sair-stage2-nl-verified-v2-rubric` (205 problemas, 99 TRUE y 106 FALSE), con 4 muestras por problema cada 20 rollouts. La conversion a Hugging Face se realiza con `miles-upstream/tools/convert_torch_dist_to_hf.py` y cada rama incluye `conversion_manifest.json` con sha256 por shard y la desviacion maxima frente al inicializador y al checkpoint previo.

## Capacidades

- Generacion de texto y razonamiento matematico en el dominio de teoria ecuacional (identidades, igualdades y verificacion sobre carriers finitos).
- Salida estructurada en JSON con los campos `assessment` y `score_0_to_7`, heredada del esquema de evaluacion por rubrica.
- Capacidad multimodal de entrada (image-text-to-text) heredada del modelo base, aunque la torre de vision no se ha entrenado en este ajuste.
- Razonamiento multi-paso orientado a la resolucion de problemas, reforzado mediante GRPO.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el conjunto de entrenamiento es de problemas en lenguaje natural sin desglose por idioma.
- Modo thinking explicito: no disponible.

## Casos de uso

- Verificacion de identidades ecuacionales: dado un problema en lenguaje natural y un carrier finito, el modelo genera un assessment razonado y una puntuacion; util para prefiltrar candidatos antes de una comprobacion simbolica formal.
- Generacion de datos sinteticos de entrenamiento: las respuestas con puntuacion alta del juez pueden reutilizarse como pares problema-solucion para ajustar otros modelos del mismo dominio.
- Evaluacion comparativa de jueces LLM: el esquema de rubrica y la neutralidad de veredicto permiten estudiar la correlacion entre puntuaciones de juez y verdad ground-truth en problemas TRUE/FALSE.
- Investigacion en RL asincrono: los checkpoints `checkpoint-10` a `checkpoint-130` permiten analizar la curva de aprendizaje y la estabilidad del entrenamiento sin reejecutar el pipeline.
- Prototipado de asistentes matematicos especializados: integrable via transformers en entornos de investigacion donde se requiera razonamiento ecuacional acotado.
- Analisis de sesgo del juez: al no mostrarse la etiqueta de verdad, el modelo sirve para medir cuanto del rendimiento proviene de la rubrica y cuanto de la verificacion real.

## Benchmarks y rendimiento

Resultados de evaluacion intermedia sobre `sair-stage2-nl-verified-v2-rubric` (205 problemas x 4 muestras, puntuacion sobre 7):

| Rollout | Global | Problemas TRUE | Problemas FALSE |
|---|---|---|---|
| 0 | 0.381 | 0.530 | 0.242 |
| 20 | 0.488 | 0.626 | 0.359 |
| 40 | 0.482 | 0.650 | 0.325 |
| 60 | 0.499 | 0.705 | 0.306 |
| 80 | 0.503 | 0.727 | 0.295 |
| 100 | 0.499 | 0.738 | 0.275 |
| 120 | 0.486 | 0.744 | 0.245 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Se observa una mejora sostenida en problemas TRUE (de 0.530 a 0.744) y un maximo global en el rollout 80 (0.503), con un descenso posterior en problemas FALSE (de 0.359 a 0.245).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 parametros x 2 bytes), mas overhead de activaciones y cache KV; el contexto de 32.768 tokens incrementa notablemente el consumo.
- GPU recomendadas: A100 80 GB, H100 80 GB o B200 para inferencia en bf16 con contexto largo; el entrenamiento se realizo en B200.
- GPU de consumo: posible en RTX 4090 (24 GB) con cuantizacion a 8 bits o 4 bits, aunque no se publican pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106 | 9,65 B | no disponible | Teoria ecuacional (RL con rubrica) | apache-2.0 | Hugging Face (checkpoints) |
| Qwen/Qwen3.5-9B (base) | 9 B (aproximado) | no disponible | General multimodal | no disponible | Hugging Face |
| U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104 | 9,65 B | no disponible | Teoria ecuacional (misma ejecucion, inicializador A-mix) | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente checkpoints intermedios; `main` apunta al mas reciente, no necesariamente al de mejor rendimiento (el maximo global se observa en el rollout 80).
- El conjunto de prompts de entrenamiento contiene solo problemas TRUE (2182), lo que puede sesgar al modelo hacia la aceptacion de identidades; el rendimiento en problemas FALSE es consistentemente inferior y decrece con el entrenamiento.
- El reward depende de un juez LLM (Qwen3.8-27B) y no de un verificador formal: las puntuaciones pueden no correlacionar con la correccion matematica real.
- Riesgo de alucinacion en la generacion de pasos intermedios y en la identificacion de carriers finitos.
- La torre de vision no se ha entrenado; el rendimiento en tareas de imagen no esta validado.
- Idiomas soportados no documentados; el modelo puede degradarse fuera del ingles tecnico del conjunto de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de calidad ni de seguridad para produccion.
- Tamano del repositorio de 235,6 GB, lo que complica su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio hermano (misma ejecucion, inicializador A-mix): https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104
- Dataset de prompts: https://huggingface.co/datasets/U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric
- Dataset de evaluacion: https://huggingface.co/datasets/U-WIN/sair-stage2-nl-verified-v2-rubric
- Herramienta de conversion: miles-upstream/tools/convert_torch_dist_to_hf.py (referenciada en la model card; sin URL publica en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles
