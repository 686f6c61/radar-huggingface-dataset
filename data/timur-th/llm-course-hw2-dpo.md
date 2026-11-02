# Timur-th/llm-course-hw2-dpo

## Resumen

`Timur-th/llm-course-hw2-dpo` es un ajuste fino por DPO (Direct Preference Optimization) del modelo `HuggingFaceTB/SmolLM-135M-Instruct`, desarrollado por el usuario Timur-th como segundo trabajo de un curso sobre modelos de lenguaje. El modelo parte de la base instructiva de 135 millones de parametros de SmolLM y se alinea sobre el dataset de preferencias `HumanLLMs/Human-Like-DPO-Dataset`, en el que las respuestas "elegidas" son emocionales y conversacionales, mientras que las "rechazadas" son secas y con plantillas del tipo "As an AI language model". El objetivo es dotar al modelo de un tono mas humano y menos corporativo.

Se trata de un artefacto educativo, no de un modelo de proposito general: la implementacion de DPO se escribio desde cero (sin TRL), y el autor documenta tambien la construccion de un reward model con `RewardTrainer` y un ciclo de PPO con `PPOTrainer` sobre la misma base. La relevancia actual es la de un ejemplo reproducible y bien medido de alineamiento a pequena escala: 134.515.008 parametros, contexto efectivo de 1024 tokens durante el entrenamiento, licencia Apache 2.0 y pesos en safetensors.

El modelo esta pensado exclusivamente para ingles, no ha sido evaluado en benchmarks estandar de razonamiento o codigo, y su utilidad practica se limita a la experimentacion con tecnicas de alineamiento y a la generacion de texto conversacional corto en entornos de recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (longitud maxima de secuencia usada en entrenamiento; el contexto nativo de SmolLM no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM-135M-Instruct, un transformer decoder-only denso de 134,5 millones de parametros. Sobre esa base se aplica DPO con la perdida estandar `-log σ(β·[log π(y_w|x)/π_ref(y_w|x) − log π(y_l|x)/π_ref(y_l|x)])`, usando como referencia la SmolLM-135M-Instruct original. La implementacion del loss, de las log-probabilidades por token y del bucle de entrenamiento se escribio desde cero, sin TRL. Los prompts se truncan y se rellenan por la izquierda, las respuestas por la derecha, y las log-probabilidades se calculan solo sobre los tokens de respuesta.

El entrenamiento usa 9.795 pares de preferencia del split de entrenamiento (90/10 con `seed=42`, dejando 1.089 pares de evaluacion), con beta 0.1, learning rate 5e-05, batch size 16, una epoca, max prompt length 256, max sequence length 1024, sin warmup ni grad clipping, optimizador AdamW y precision fp32 con autocast bf16. El tiempo de entrenamiento documentado es de 13 minutos. El autor compara ocho configuraciones (variando beta, learning rate, longitudes y warmup) y publica metricas en el conjunto retenido: para `beta_0.1`, reward accuracy 1.0000, reward margin 17.839 y DPO loss 0.0002. Ademas, entrena un reward model con `AutoModelForSequenceClassification` y `RewardTrainer` de TRL, y un ciclo de PPO con `PPOTrainer` (`trl==1.11.0`, modulo `trl.experimental.ppo`) sobre ese reward model.

## Capacidades

- Generacion de texto conversacional en ingles con un registro mas cercano, emocional y coloquial que el modelo base.
- Supresion de plantillas de asistente generico: la tasa de frases tipo "as an AI" baja del 35,2 % en la referencia SFT al 0,8 % en el modelo DPO (segun la comparativa del autor sobre 128 prompts retenidos).
- Generacion de respuestas cortas (media de 117,4 tokens en la evaluacion con hasta 128 tokens nuevos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni otras modalidades.
- Capacidad de terminar respuestas con EOS en el 15,6 % de los casos en la evaluacion del autor (frente al 3,1 % de la referencia), lo que sigue siendo un ratio bajo.

## Casos de uso

- Experimentacion docente con DPO: reproducir el pipeline completo (pares de preferencia, loss desde cero, reward model y PPO) sobre una base de 135 M de parametros que entrena en minutos en una sola GPU; util para cursos y talleres.
- Prototipado de tono conversacional: generar respuestas con un registro mas humano para evaluar como cambia la percepcion de un chatbot sin invertir en modelos grandes; el modelo cabe en cualquier GPU consumer.
- Investigacion sobre calibracion de preferencias: comparar configuraciones de beta y learning rate usando las metricas publicadas (reward margin, emoji_rate, eos_rate) como linea base reproducible.
- Generacion de respuestas cortas en ingles para tareas de aumento de datos conversacionales, siempre con revision humana por la tasa de repeticion observada.
- Evaluacion de reward models: reutilizar el reward model entrenado por el autor como referencia para comparar politicas generadas por otros metodos de alineamiento.
- Pruebas de regresion de pipelines de alineamiento: verificar que una implementacion propia de DPO produce margenes de log-ratio comparables a los documentados (178,390 para `beta_0.1`).
- Despliegue en entornos con recursos minimos (CPU o GPU de gama baja) para demos internas de generacion de texto en ingles, asumiendo latencia y calidad limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas propias de alineamiento sobre 1.089 pares retenidos y sobre 128 prompts retenidos:

| Metrica (config `beta_0.1`) | Valor |
|---|---|
| Reward accuracy | 1.0000 |
| Reward margin (β·(Δchosen − Δrejected)) | 17.839 |
| Log-ratio margin (Δchosen − Δrejected) | 178.390 |
| Δ log p chosen | 17.031 |
| Δ log p rejected | -161.359 |
| DPO loss | 0.0002 |

Comparativa de generacion sobre 128 prompts retenidos (temperature 0.7, hasta 128 tokens nuevos):

| Modelo | rm_score | emoji_rate | ai_phrase_rate | mean_tokens | eos_rate |
|---|---|---|---|---|---|
| SFT (referencia) | -3.071 | 0.000 | 0.352 | 125.867 | 0.031 |
| DPO · beta_0.1 | -1.844 | 0.320 | 0.008 | 117.375 | 0.156 |
| PPO · base | -2.822 | 0.000 | 0.320 | 128.000 | 0.000 |

Log-probabilidad media por token en datos de entrenamiento, retenidos y externos (Alpaca):

| Modelo | train chosen | train rejected | held-out chosen | held-out rejected | alpaca |
|---|---|---|---|---|---|
| SFT (referencia) | -1.901 | -1.662 | -1.956 | -1.688 | -2.215 |
| DPO · beta_0.1 | -1.802 | -2.733 | -1.848 | -2.783 | -2.422 |
| PPO · base | -1.907 | -1.673 | -1.962 | -1.699 | -2.255 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,3 GB para los pesos (134,5 M de parametros), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En fp32, los pesos ocupan aproximadamente 0,54 GB; el repositorio completo pesa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU o CPU para demos; para entrenamiento, una sola GPU consumer es suficiente (13 minutos de entrenamiento documentados).
- Cabe en GPU consumer: si, sin practicamente ninguna restriccion de memoria.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag del repositorio) y endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Timur-th/llm-course-hw2-dpo | 134,5 M | 1024 (entrenamiento) | DPO sobre Human-Like-DPO | Apache 2.0 | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 134,5 M | no disponible en esta ficha | SFT instructivo | Apache 2.0 | HuggingFace (modelo base) |
| PPO · base (del mismo autor) | 134,5 M | 1024 | PPO con reward model propio | no disponible | no publicado como repositorio independiente |

Frente a SmolLM-135M-Instruct, el modelo DPO reduce la tasa de frases tipo "as an AI" (0,352 a 0,008) y mejora la recompensa media del reward model (-3,071 a -1,844), a costa de aumentar la tasa de emojis (0,000 a 0,320) y de penalizar fuertemente la log-probabilidad de las respuestas rechazadas (-1,688 a -2,783 en held-out). No se dispone de comparaciones con otros modelos de 135 M alineados por DPO en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 135 M de parametros: capacidad de razonamiento, conocimiento factual y coherencia muy limitadas en comparacion con modelos de mayor tamano.
- Entrenado solo en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Las generaciones de ejemplo muestran repeticion de frases y bucles ("I've been doing some yoga and meditation..." repetido), un problema tipico de modelos pequenos tras DPO.
- Tasa de finalizacion con EOS baja (15,6 % en la evaluacion del autor), lo que puede producir respuestas truncadas o divagantes.
- Aumento notable de emojis (32 % de respuestas con emojis, 1,32 emojis por respuesta), lo que puede no ser deseable en contextos profesionales.
- Riesgo de alucinacion alto por el tamano del modelo y por el sesgo del dataset de preferencias hacia respuestas emocionales, no verificables.
- Las metricas de "reward accuracy 1.0000" y "DPO loss 0.0002" son sobre el conjunto retenido del mismo dataset de preferencias; no implican calidad general ni ausencia de sobreajuste al dominio del dataset.
- El modelo esta fuertemente desplazado respecto a la referencia (log-ratio margin de 178,390), lo que sugiere una divergencia considerable de la politica original; conviene revisar la calidad de las respuestas antes de cualquier uso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones; verificar la licencia de `HumanLLMs/Human-Like-DPO-Dataset` antes de un uso en produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para produccion sin evaluacion adicional: no hay benchmarks estandar ni pruebas de robustez publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Timur-th/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset externo de evaluacion (Alpaca): https://huggingface.co/datasets/tatsu-lab/alpaca
- TRL (usado para RewardTrainer y PPOTrainer): https://github.com/huggingface/trl
