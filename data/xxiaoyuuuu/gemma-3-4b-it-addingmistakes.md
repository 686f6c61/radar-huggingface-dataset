# xxiaoyuuuu/Gemma-3-4B-IT-AddingMistakes

## Resumen

Gemma-3-4B-IT-AddingMistakes es un adaptador LoRA sobre el modelo instructivo google/gemma-3-4b-it, publicado por el usuario xxiaoyuuuu como baseline del articulo *CRoS: Causality Reward on Scrambled CoTs Improves Accuracy and Reasoning Faithfulness*. El adaptador se entrena con GRPO sobre las tareas AIW y Survo de Reasoning Gym aplicando la recompensa Adding Mistakes (Lanham et al., 2023), en la que una copia congelada del modelo base reescribe un paso del chain-of-thought para afirmar lo contrario y se premia al modelo en funcion de si sus continuaciones cambian la respuesta final.

Se trata, por tanto, de un artefacto de investigacion orientado a medir la fidelidad del razonamiento, no de un modelo de proposito general. El modelo subyacente es un transformer denso de 4B parametros con ventana de contexto de 128K tokens, pero el adaptador solo anade capacidades de razonamiento en ingles sobre tareas sinteticas de Reasoning Gym. Su relevancia actual es metodologica: sirve como punto de comparacion frente a la variante CRoS, que introduce una recompensa de causalidad sobre CoTs desordenados.

El repositorio ocupa 0,3 GB (solo los pesos del adaptador, r = 32 sobre todas las capas lineales) y no registra descargas ni likes en el momento de la consulta. La licencia heredada es la Gemma License de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3) con adaptador LoRA (r = 32, todas las capas lineales) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA es de rango bajo (tamano del repo: 0,3 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens en el modelo base (no verificado especificamente para este adaptador) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el autor advierte de no fusionar el adaptador en bf16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Gemma License (Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-3-4b-it |
| Metodo de entrenamiento | GRPO con recompensa Adding Mistakes, 300 pasos |
| Tareas de entrenamiento | AIW y Survo de Reasoning Gym |
| Formato de salida | `<think> ... </think><answer> ... </answer>` con el system prompt DeepSeekZero de Reasoning Gym |

## Arquitectura y entrenamiento

El adaptador se monta sobre google/gemma-3-4b-it, un transformer denso de 4B parametros. El entrenamiento aplica GRPO (Group Relative Policy Optimization) durante 300 pasos sobre un LoRA de rango 32 aplicado a todas las capas lineales. El conjunto de tareas se limita a dos entornos de Reasoning Gym: AIW y Survo. Todo el pipeline, salvo la funcion de recompensa, es identico al de la variante Gemma-3-4B-IT-CRoS, lo que convierte a este checkpoint en el control experimental del articulo.

La innovacion metodologica reside en la recompensa Adding Mistakes: una copia congelada del modelo base reescribe un paso del CoT, en una posicion entre el 0 % y el 80 % de la cadena, para afirmar lo contrario; la politica continua la generacion desde ese punto y recibe como recompensa la proporcion de continuaciones cuya respuesta final difiere de la respuesta del rollout original. El objetivo es penalizar cadenas de razonamiento que no son causalmente responsables del resultado. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO adicional.

## Capacidades

- Generacion de texto y razonamiento multi-paso en formato chain-of-thought explicito con etiquetas `<think>` y `<answer>`.
- Resolucion de tareas sinteticas de razonamiento de los entornos AIW y Survo de Reasoning Gym.
- Razonamiento con fidelidad causal entrenada: el modelo aprende a modificar su respuesta cuando se altera un paso intermedio del CoT.
- Capacidades heredadas del modelo base Gemma 3 4B IT (generacion instructiva, comprension lectora, conocimientos generales), aunque no se han evaluado especificamente en este adaptador.
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Capacidades de agente y multi-step reasoning fuera de Reasoning Gym: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision y audio: no disponibles en este adaptador (aunque Gemma 3 base incluye variantes multimodales, este checkpoint es de texto).

## Casos de uso

- Investigacion sobre fidelidad del razonamiento: usar el adaptador como baseline frente a CRoS para medir si una recompensa de causalidad mejora la fidelidad de los CoTs en tareas de Reasoning Gym.
- Reproduccion de experimentos: el autor documenta el comando `REWARD=adding_mistakes bash train.sh` en el repositorio de codigo, lo que permite replicar el entrenamiento con los mismos hiperparametros (300 pasos GRPO, LoRA r = 32).
- Analisis de robustez ante perturbaciones: evaluar como responde el modelo cuando se altera un paso intermedio de su propia cadena de razonamiento, gracias al formato de salida estructurado.
- Generacion de datos sinteticos de razonamiento: producir trazas CoT con etiquetas separadas de pensamiento y respuesta, utiles para destilar o comparar modelos en tareas AIW y Survo.
- Evaluacion comparativa de recompensas de RL: servir como control en estudios que comparan funciones de recompensa (Adding Mistakes frente a causalidad) sobre el mismo modelo base y presupuesto de entrenamiento.
- Docencia y divulgacion tecnica: ilustrar el funcionamiento de GRPO con LoRA y de las recompensas basadas en perturbacion de CoT en un modelo de 4B parametros ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un articulo con identificador arXiv pendiente ("XXXX.XXXXX") y a un dataset de evaluacion en HuggingFace (xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de las tareas AIW o Survo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B parametros requiere aproximadamente 8-9 GB en bf16 y unos 3-4 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal (0,3 GB en el repositorio).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 con contexto moderado.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con transformers + peft; para servir en produccion puede fusionarse con el modelo base (el autor advierte de no fusionar en bf16 porque el redondeo borra la mayor parte de la actualizacion LoRA) o servirse con vLLM o TGI si se exporta correctamente. llama.cpp y Ollama requeririan conversion a GGUF del modelo fusionado, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-AddingMistakes | 4B + LoRA r=32 | 128K (base) | GRPO, recompensa Adding Mistakes, 300 pasos | Gemma License | HuggingFace (xxiaoyuuuu) |
| Gemma-3-4B-IT-CRoS | 4B + LoRA r=32 | 128K (base) | GRPO, recompensa de causalidad CRoS, 300 pasos | Gemma License | HuggingFace (xxiaoyuuuu) |
| google/gemma-3-4b-it | 4B | 128K | Instruct tuning de Google | Gemma License | HuggingFace (google) |
| Qwen2.5-3B-Instruct | 3B | 32K | Instruct tuning de Alibaba | Apache 2.0 | HuggingFace (Qwen) |

La comparacion con Qwen2.5-3B-Instruct se ofrece como referencia de tamano y categoria (modelo instructivo de ~3-4B), pero no se dispone de datos de rendimiento comparativo para este adaptador. No se han publicado resultados de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion: es un baseline experimental, no un modelo listo para produccion; no se han publicado evaluaciones de calidad general.
- Dominio restringido: el entrenamiento se limita a las tareas AIW y Survo de Reasoning Gym; el rendimiento fuera de ese dominio no esta caracterizado.
- Idioma: solo ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no evaluado; el formato de salida con etiquetas `<think>` y `<answer>` no garantiza la veracidad del contenido.
- Fusion del adaptador: el autor advierte explicitamente de que fusionar en bf16 borra la mayor parte de la actualizacion LoRA por redondeo; es necesario usar otra precision o mantener el adaptador separado.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la Gemma License de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Gemma 3 4B IT.
- Referencias incompletas: el identificador arXiv del articulo aparece como marcador de posicion ("XXXX.XXXXX"), por lo que la publicacion puede no estar disponible.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-AddingMistakes)
- [Variante CRoS](https://huggingface.co/xxiaoyuuuu/Gemma-3-4B-IT-CRoS)
- [Modelo base google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Dataset de evaluacion](https://huggingface.co/datasets/xxiaoyuuuu/Gemma-3-4B-IT-CRoS-eval)
- [Codigo del proyecto](https://github.com/xxiaoyuuuu/CRoS)
- [Pagina del proyecto](https://xiaoyu-1217.github.io/CRoS)
- [Reasoning Gym](https://github.com/open-thought/reasoning-gym)
- [Paper (arXiv, identificador pendiente)](https://arxiv.org/abs/XXXX.XXXXX)
