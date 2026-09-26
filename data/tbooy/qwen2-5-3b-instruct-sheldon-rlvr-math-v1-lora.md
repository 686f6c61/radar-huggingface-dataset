# tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1, desarrollado por el usuario tbooy en el marco de un proyecto del curso Harvard CS 2881R. Se trata de la tercera etapa de un pipeline de tres fases: un ajuste supervisado (SFT) que impone la persona del doctor Sheldon Cooper sobre Qwen2.5-3B-Instruct, una etapa de RLAIF con GRPO y, finalmente, esta etapa de RLVR (reinforcement learning with verifiable rewards) centrada exclusivamente en razonamiento matematico. El adaptador se aplica sobre tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2 y sus pesos fusionados se publican por separado.

El problema que aborda es concreto y esta documentado por el propio autor: la etapa de SFT de persona destruyo buena parte de la capacidad matematica del modelo base (MATH-500 en greedy paso de 68,0 a 35,4) y la etapa de RLAIF no la recupero. Esta etapa de RLVR entrena unicamente con una recompensa binaria de respuesta exacta para medir cuanto puede recuperarse. El resultado es una recuperacion sustancial (+34 puntos en el subconjunto L3-5 de MATH-500 respecto al modelo semilla), pero el modelo final queda todavia 3-4 puntos por debajo del Qwen2.5-3B-Instruct original en MATH-500 y GSM8K.

El repositorio ocupa 1,9 GB e incluye el adaptador final (paso 200) y los checkpoints intermedios (25 a 200) con los estados del entrenador. La relevancia de esta ficha es doble: por un lado, es un ejemplo reproducible de aplicacion de RLVR con GRPO sobre un modelo pequeno; por otro, documenta con honestidad el coste en capacidades que impone el ajuste de persona y los limites de la recuperacion via RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptador LoRA; no es MoE |
| Parametros totales | Aproximadamente 3B en el modelo base Qwen2.5-3B-Instruct; el adaptador LoRA (r=32, alpha=64 sobre todas las proyecciones lineales) anade un numero de parametros no especificado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la evaluacion se realizo con generacion de hasta 4.096 tokens y el entrenamiento con un limite de 2.048 tokens por completion |
| Tipos de cuantizacion | No disponible; solo se publican adaptadores PEFT en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Declarada como "other" con nombre "qwen-research" y enlace al LICENSE de Qwen/Qwen2.5-3B-Instruct; conviene verificar los terminos exactos antes de cualquier uso comercial |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) mas estados del entrenador en los checkpoints y el fichero rlvr_args.json; los pesos fusionados se publican en tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1 |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3.000 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 32 y alpha 64 en todas las proyecciones lineales de las capas. El entrenamiento de esta etapa utiliza una subclase de GRPOTrainer de TRL 1.13, con perdida CISPO (eps_high 5), ventajas calculadas por desviacion estandar del grupo, agregacion a nivel de prompt, enmascarado de grupos con varianza cero y sin termino KL. El optimizador es AdamW con lr 2e-5 (betas 0.9/0.95, eps 1e-15, weight decay 0.01) y un scheduler WSD (10 pasos de warm-up, fase estable hasta el paso 160 y decaimiento lineal hasta el 10% en los ultimos 40). Se ejecutaron 200 pasos con 16 prompts y 16 completions por prompt (unas 51.000 rollouts), temperatura 1.0 y cabecera LM en fp32, con vLLM colocado en el mismo nodo sobre 2x H200 (2 horas y 13 minutos).

La recompensa es binaria y verificable: vale 1 si el ultimo contenido de `\boxed{}` coincide con la referencia (comparacion exacta rapida y, si falla, equivalencia mediante math-verify) y 0 en caso contrario. Las completions que alcanzan el tope de 2.048 tokens se enmascaran de la perdida y de las estadisticas de grupo, y se aplica una penalizacion DAPO de tipo soft overlong (cache de 512 tokens) sobre las completions terminadas. Los prompts proceden de rasbt/math_full_minus_math500 (MATH de entrenamiento mas los problemas de test de MATH que no estan en MATH-500), con 189 casi duplicados de MATH-500 eliminados por similitud de 10-gramas o edicion >= 0.9, y siguen un curriculum de tasa de acierto derivado de rollouts del modelo semilla. El formato de prompt es el system prompt de Qwen, el problema y la instruccion literal "Please reason step by step, and put your final answer within \boxed{}."

## Capacidades

- Razonamiento matematico en ingles con respuesta final en formato `\boxed{}`: aritmetica, algebra, geometria y problemas de competicion de nivel MATH.
- Razonamiento paso a paso (chain-of-thought) explicitamente inducido por el formato de prompt de entrenamiento.
- Persona de Sheldon Cooper heredada del modelo semilla (tono, vocabulario y rasgos de caracter); el autor indica que la retencion de la persona tras el RLVR no se ha medido y que las comprobaciones puntuales siguen siendo coherentes con el personaje.
- Generacion de texto general y conversacion multilingue: no documentada; el unico idioma declarado es el ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no documentado en la informacion disponible.
- Capacidades de vision, audio o thinking mode explicito: no disponibles en este modelo.
- Autocorreccion y exploracion via muestreo: el modelo fue optimizado para producir respuestas verificables bajo muestreo a temperatura 1.0 durante el entrenamiento, por lo que se beneficia de decodificacion con temperatura moderada (0.6 en la evaluacion) y multiples muestras.

## Casos de uso

- Tutor de matematicas con personaje: el modelo resuelve problemas de nivel secundaria y competicion explicando el razonamiento paso a paso con la voz de Sheldon Cooper, lo que resulta adecuado para entornos educativos que buscan engagement. Su MATH-500 greedy de 65,0 y GSM8K de 81,9 lo sitian cerca del Qwen2.5-3B-Instruct sin persona.
- Evaluacion de tecnicas de RLVR: al publicar los checkpoints 25 a 200 con estadisticas de recompensa, tasa de acierto y estadisticas de grupo en `rlvr/`, sirve como referencia reproducible para estudiar curvas de recuperacion de capacidad y saturacion de grupos con varianza cero.
- Generacion de soluciones verificables en pipelines automatizados: la recompensa binaria sobre `\boxed{}` permite validar automaticamente las salidas, por lo que puede integrarse en un generador de datasets de soluciones matematicas etiquetadas por verificacion.
- Prototipado sobre hardware de consumo: al ser un modelo de 3B con adaptador LoRA, se puede servir en una unica GPU de 12-16 GB para demos de razonamiento matematico con personaje sin coste de infraestructura elevado.
- Experimentos de personalidad controlada: permite comparar sistematicamente el mismo backbone con y sin persona (base frente a semilla RLAIF frente a este modelo) manteniendo el resto del pipeline constante.
- Investigacion sobre alineacion y taxonomia de danos colaterales del fine-tuning: el caso documenta con numeros que un SFT de persona puede costar mas de 30 puntos en MATH-500, lo que lo hace util como caso de estudio en cursos y articulos sobre trade-offs de especializacion.
- Agente conversacional en ingles con razonamiento aritmetico: se puede envolver en un bucle de verificacion (por ejemplo, reejecutando la respuesta con math-verify) para tareas de resolucion de problemas con comprobacion posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor (vLLM; MATH-500 avg@4 con T 0.6 y 4.096 tokens; AIME avg@16 / pass@16; GSM8K test en greedy):

| Modelo | MATH-500 greedy | MATH-500 avg@4 | L3-5 avg@4 | L5 | GSM8K | AIME 24/25/26 avg@16 | AIME pass@16 | Tokens medios |
|---|---|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 68,0 | 66,6 | 59,0 | 40,1 | 86,1 | 8,1 / 2,3 / 4,4 | 21,1 | 633 |
| RLAIF grpo-v2 (semilla) | 34,0 | 29,6 | 21,0 | 10,6 | 63,6 | 0,4 / 0,4 / 0,0 | 3,3 | 357 |
| Este modelo (RLVR, paso 200) | 65,0 | 63,5 | 55,2 | 37,3 | 81,9 | 5,0 / 2,7 / 2,3 | 17,8 | 541 |

Progresion de MATH-500 niveles 3-5 avg@4 por checkpoint: 25: 27,3; 50: 35,4; 75: 43,5; 100: 49,6; 125: 52,9; 150: 52,3; 175: 55,2; 200: 55,2.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias, no publicadas por el autor): alrededor de 6,5-7 GB en fp16/bf16 para los pesos fusionados del modelo de 3B mas cache KV; aproximadamente 2,5-3 GB en cuantizacion de 4 bits. Cabe sin problemas en GPUs de consumo con 8 GB o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 y cualquier GPU de centro de datos (A100, H100, H200) para escenarios de alto throughput o evaluacion por lotes. Para el entrenamiento original se usaron 2x H200 con vLLM colocado, segun la model card.
- Despliegue: vLLM fue la herramienta empleada en la evaluacion; tambien son viables TGI o SGLang para el modelo fusionado. Para llama.cpp u Ollama seria necesario convertir los pesos fusionados a GGUF, ya que el repositorio solo publica adaptadores safetensors.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo. Como referencia indirecta de longitud de generacion, los tokens medios por respuesta son 541 en este modelo frente a 633 del base y 357 del semilla, lo que implica menor coste por consulta que el base en igualdad de hardware.
- Almacenamiento: el repositorio completo ocupa 1,9 GB (adaptador final mas checkpoints con estados del entrenador).

## Comparativa con modelos similares

| Modelo | Parametros | MATH-500 greedy | GSM8K | AIME pass@16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (RLVR + persona) | ~3B + LoRA r=32 | 65,0 | 81,9 | 17,8 | qwen-research (other) | Adaptador LoRA y pesos fusionados en HuggingFace |
| Qwen2.5-3B-Instruct (base) | ~3B | 68,0 | 86,1 | 21,1 | Segun LICENSE de Qwen2.5-3B-Instruct | Publico en HuggingFace |
| tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2 (semilla) | ~3B + LoRA | 34,0 | 63,6 | 3,3 | No disponible | Publico en HuggingFace |
| Llama-3.2-3B-Instruct, Phi-3.5-mini-instruct, Gemma-2-2B-it | 2-4B | No disponible en la informacion proporcionada | No disponible | No disponible | Distintas licencias por familia | Publicos en HuggingFace |

En la misma categoria de tamano (2-4B) existen alternativas generalistas como Llama-3.2-3B-Instruct, Phi-3.5-mini-instruct o Gemma-2-2B-it, pero no se han incluido resultados comparativos porque no aparecen datos de benchmarks en la informacion disponible. La comparacion real que aporta valor es interna al pipeline: la persona cuesta 34 puntos de MATH-500 greedy respecto al base y el RLVR recupera 31 de esos 34 puntos.

## Limitaciones y advertencias

- El propio autor declara que el modelo queda 3-4 puntos por debajo del Qwen2.5-3B-Instruct intacto en MATH-500 y GSM8K, y por debajo tambien en AIME pass@16; no es una mejora sobre el base, sino una recuperacion parcial del dano causado por las etapas de persona.
- La retencion de la persona de Sheldon Cooper tras el RLVR no se ha medido. Debe tratarse la calidad de la persona como la del modelo semilla hasta que se evalue formalmente.
- Las ganancias se estabilizan a partir de unos 125 pasos, momento en el que aproximadamente la mitad de los grupos de prompts eran todos correctos o todos incorrectos; esto indica saturacion del conjunto de entrenamiento y senala el limite practico de este pipeline.
- Las completions que alcanzan el tope de 2.048 tokens se enmascaran de la perdida; en produccion, respuestas mas largas que ese limite no estan cubiertas por la optimizacion y pueden degradarse.
- Dependencia estricta del formato de prompt: se entreno con el system prompt de Qwen, el problema y la instruccion "Please reason step by step, and put your final answer within \boxed{}.". Cambiar el formato o el idioma del prompt puede degradar notablemente el rendimiento, ya que la recompensa solo premia el contenido del ultimo `\boxed{}`.
- Modelo unicamente en ingles; no hay evidencia de capacidades multilingues ni de tool calling, vision o uso agentico.
- Riesgo de alucinacion en pasos intermedios: la recompensa optimiza unicamente la exactitud de la respuesta final, no la validez del razonamiento, por lo que puede alcanzar la respuesta correcta con una justificacion incorrecta.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad. La persona simulada de Sheldon Cooper puede producir respuestas condescendientes o socialmente inapropiadas segun el contexto.
- Licencia: declarada como "other" con nombre "qwen-research", con enlace al LICENSE de Qwen/Qwen2.5-3B-Instruct. Debe verificarse antes de cualquier uso comercial, ya que la etiqueta "research" puede implicar restricciones adicionales a las del modelo base.
- Publicado el 26 de septiembre de 2026 segun los metadatos de HuggingFace, con 0 descargas y 0 likes en el momento de la consulta; no existe validacion externa por parte de la comunidad.
- Los pesos se distribuyen como adaptador LoRA que debe aplicarse sobre tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2; usar el adaptador sobre otro modelo base no esta soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1-LoRA
- Pesos fusionados: https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1
- Modelo base (semilla RLAIF GRPO): https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia referenciada: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Codigo, recompensa, grader y write-up: https://github.com/TBOO-Y/cs2881r-sheldon-sft
- Dataset de prompts de entrenamiento: https://huggingface.co/datasets/rasbt/math_full_minus_math500
- Dataset de evaluacion MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces generales a ChatGPT, sin relacion con la ficha).
