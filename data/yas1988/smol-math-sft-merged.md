# yas1988/smol-math-sft-merged

## Resumen

smol-math-sft-merged es un ajuste fino supervisado (SFT) del modelo SmolLM2-1.7B de Hugging Face, especializado en la resolución paso a paso de problemas de matemáticas de nivel escolar (word problems). Lo desarrolla el usuario independiente yas1988 como parte del curso "smol course" de Hugging Face (capítulo 1). El modelo parte de la arquitectura Llama de SmolLM2, con 1.711.376.384 parámetros, y se ha entrenado mediante LoRA (r=16, alpha=32) sobre el subconjunto metamathqa-50k del dataset smoltalk, fusionando después el adaptador en los pesos base.

El problema que aborda es la escasa capacidad aritmética y de razonamiento del modelo base en tareas de matemáticas escolares: sin ajuste, SmolLM2-1.7B obtiene un 8,72 % en GSM8K 0-shot, mientras que este modelo alcanza un 42,68 %. La mejora procede en parte del formato (el modelo base carece de plantilla de chat y de token de parada, y a menudo divaga), y en parte del estilo de razonamiento paso a paso aprendido de MetaMathQA, que termina con la respuesta tras "#### answer".

Es relevante como ejemplo reproducible y de bajo coste (entrenamiento de unas 1 h 50 min en una T4 de Colab) de ajuste fino con LoRA para una tarea concreta sobre un modelo pequeño, y como referencia para quien quiera evaluar hasta dónde llega un modelo de 1,7 B parámetros en razonamiento matemático. No está pensado para chat general, alineamiento de seguridad ni otros idiomas distintos del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura Llama) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF ni cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con arquitectura Llama, heredado íntegramente de SmolLM2-1.7B, sobre el que se aplicó un ajuste fino supervisado con LoRA usando `SFTTrainer` de TRL. La configuración de LoRA fue r=16, alpha=32, dropout 0,05 y módulos objetivo `all-linear`; tras el entrenamiento, el adaptador se fusionó en los pesos base, de modo que el resultado es un modelo denso estándar sin adaptadores separados. Los hiperparámetros fueron 1 época (1.250 pasos), tasa de aprendizaje 2e-4, batch por dispositivo de 2 con acumulación de gradiente de 8 (batch efectivo 16), precisión fp16, checkpointing de gradiente y longitud máxima de 1024 tokens. La pérdida de entrenamiento bajó de 2,03 a 0,38 de forma suave, sin picos.

Los datos de entrenamiento son los primeros 20.000 ejemplos del subconjunto metamathqa-50k de HuggingFaceTB/smoltalk, en formato de chat con razonamiento matemático. Como el modelo base no tiene plantilla de chat, el autor copió la de SmolLM2-1.7B-Instruct. Además, se configuró `<|im_end|>` como token de fin de secuencia en el tokenizer, `config.json` y `generation_config.json` para que el modelo deje de generar tras su respuesta en lugar de repetirla. El entrenamiento completo se realizó en una GPU T4 de Google Colab en aproximadamente 1 h 50 min, usando TRL, PEFT, Transformers y PyTorch. No se aplicaron RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con razonamiento matemático paso a paso para problemas de aritmética escolar.
- Resolución de problemas tipo GSM8K con formato MetaMathQA: desarrollo del razonamiento y respuesta final tras "#### answer" o "The answer is: ...".
- Formato conversacional: acepta mensajes con roles (user/assistant) gracias a la plantilla de chat copiada de SmolLM2-1.7B-Instruct.
- Parada controlada de generación mediante `<|im_end|>` como token de fin de secuencia.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso más allá del razonamiento matemático dentro de una misma respuesta.
- Capacidad multilingüe limitada al inglés; no se ha entrenado para otros idiomas.
- No tiene visión, audio ni modo de pensamiento (thinking mode) documentado.

## Casos de uso

- Resolución de problemas matemáticos escolares en entornos educativos: el modelo genera la solución paso a paso y termina con la respuesta marcada, lo que permite usarlo como tutor de aritmética básica en inglés y extraer la respuesta de forma programática.
- Generación de datasets sintéticos de razonamiento matemático: puede producir cadenas de razonamiento en formato MetaMathQA para aumentar datos de entrenamiento de otros modelos pequeños, con revisión humana posterior.
- Evaluación comparativa de ajuste fino con LoRA: sirve como referencia reproducible de hasta dónde llega un modelo de 1,7 B parámetros con una sola época de SFT sobre 20.000 ejemplos, útil para calibrar expectativas en proyectos de bajo presupuesto.
- Prototipado rápido en hardware modesto: al caber en una GPU de consumo y entrenarse en una T4, es adecuado para demos y pruebas de concepto en portátiles con GPU o en entornos de Colab.
- Filtrado y clasificación de problemas matemáticos: combinado con un pipeline de extracción, puede usarse para comprobar si un problema tiene solución aritmética y generar una respuesta candidata que luego se valide con un verificador simbólico.
- Base para ajustes posteriores específicos de dominio: al estar fusionado y con licencia Apache 2.0, puede servir como punto de partida para SFT adicional sobre otros conjuntos de matemáticas o de razonamiento estructurado.

## Benchmarks y rendimiento

| Modelo | GSM8K (0-shot, 1.319 preguntas) |
|---|---|
| SmolLM2-1.7B (base) | 0,0872 ± 0,0078 |
| smol-math-sft-merged (v1) | 0,4268 ± 0,0136 |
| smol-math-sft-v2-merged | 0,4428 |
| smol-math-sft-v3-merged | 0,3571 |

La métrica empleada es extractive_match con lighteval en una T4, en fp16. En la comparación cualitativa de 8 preguntas del conjunto de test, el modelo base acertó 0 de 8 y este modelo 4 de 8. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB con `device_map="auto"`.
- En cuantización de 8 bits: aproximadamente 1,8-2 GB de pesos; en 4 bits: aproximadamente 1 GB de pesos, más overhead.
- GPU recomendadas: T4 (validada por el autor para entrenamiento e inferencia), RTX 3060/4060 con 8 GB o más, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en fp16, y en GPUs con 4-6 GB usando cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (pipeline validado en la model card), text-generation-inference (el repo está etiquetado como compatible con TGI y endpoints), y en general cualquier runtime que cargue safetensors; no se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K 0-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smol-math-sft-merged | 1,71 B | no disponible (entrenado a 1024) | 0,4268 | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (base) | 1,71 B | no disponible | 0,0872 | Apache 2.0 | Hugging Face |
| smol-math-sft-v2-merged | 1,71 B | no disponible (entrenado a 1024) | 0,4428 | Apache 2.0 | Hugging Face |
| smol-math-sft-v3-merged | 1,71 B | no disponible (entrenado a 1024) | 0,3571 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño: puede cometer errores aritméticos y de razonamiento; el propio autor advierte de que no debe usarse donde una respuesta incorrecta tenga consecuencias.
- Entrenado solo 1 época sobre 20.000 ejemplos; hay margen de mejora con más datos o épocas, como muestra la versión v2 (0,4428), aunque la diferencia de 1,6 puntos está dentro del margen de error.
- El ajuste LoRA modifica solo un subconjunto de pesos, por lo que el modelo es en gran medida el modelo base con una actualización de estilo matemático.
- No está entrenado para chat general ni para alineamiento de seguridad; puede producir contenido inapropiado o divagar fuera de la tarea matemática.
- Idioma limitado al inglés; no se ha entrenado para otros idiomas.
- Las salidas siguen el estilo MetaMathQA ("#### answer" y "The answer is: ..."), lo que puede requerir postprocesado para integrarse en otras aplicaciones.
- La versión v3, con entrenamiento adicional sobre el split de entrenamiento de GSM8K, empeoró (0,3571), probablemente por sobreajuste; conviene tenerlo en cuenta al reentrenar.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del dataset smoltalk.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yas1988/smol-math-sft-merged
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Resultados de evaluación v1: https://huggingface.co/datasets/yas1988/details_yas1988__smol-math-sft-merged_private
- Versión v2: https://huggingface.co/yas1988/smol-math-sft-v2-merged
- Adaptador v2: https://huggingface.co/yas1988/smol-math-sft-v2
- Resultados de evaluación v2: https://huggingface.co/datasets/yas1988/details_yas1988__smol-math-sft-v2-merged_private
- Versión v3: https://huggingface.co/yas1988/smol-math-sft-v3-merged
- Adaptador v3: https://huggingface.co/yas1988/smol-math-sft-v3
- Resultados de evaluación v3: https://huggingface.co/datasets/yas1988/details_yas1988__smol-math-sft-v3-merged_private
