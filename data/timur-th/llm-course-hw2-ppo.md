# Timur-th/llm-course-hw2-ppo

## Resumen

`llm-course-hw2-ppo` es un ajuste fino por aprendizaje por refuerzo (PPO) del modelo pequeño SmolLM-135M-Instruct, desarrollado por el usuario Timur-th como segunda tarea de un curso sobre modelos de lenguaje. El objetivo no es crear un modelo de propósito general, sino demostrar un pipeline completo de alineamiento: construcción manual del bucle de DPO, entrenamiento de un modelo de recompensa con `RewardTrainer` de TRL y optimización de la política con `PPOTrainer` (módulo experimental de TRL 1.11.0) sobre el dataset de preferencias HumanLLMs/Human-Like-DPO-Dataset. El resultado es un modelo conversacional en inglés de 134,5 millones de parámetros con licencia Apache 2.0.

La relevancia del artefacto es fundamentalmente pedagógica y reproducible: documenta hiperparámetros concretos (learning rate 5e-6, 8192 episodios, coeficiente KL 0,05, clip range 0,2, penalización de 1,0 por ausencia de EOS) y compara tres políticas (SFT de referencia, DPO con beta 0,1 y PPO) sobre 128 prompts reservados. Los resultados muestran que el PPO aquí publicado apenas se desvía de la referencia SFT: la tasa de respuestas con muletillas tipo «as an AI» baja del 35,2 % al 32,0 %, pero no aparece ningún emoji y la tasa de finalización con EOS sigue en 0,0, frente al 32,0 % de emojis y el 15,6 % de EOS del run DPO. Es, por tanto, un caso de estudio sobre inestabilidad y ajuste insuficiente de PPO en modelos muy pequeños, no una alternativa práctica a modelos alineados de producción.

Arquitectónicamente hereda por completo de SmolLM-135M-Instruct: un transformer decoder-only de la familia Llama, con 134.515.008 parámetros y pesos en safetensors (0,5 GB de repositorio). No se ha publicado información sobre longitud de contexto, composición del corpus de preentrenamiento ni datos de benchmarks estándar en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), heredada de SmolLM-135M-Instruct |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors en fp32/bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de alineamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Algoritmo de alineamiento | PPO (`trl.experimental.ppo.PPOTrainer`, TRL 1.11.0) |
| Modelo de recompensa | Timur-th/llm-course-hw2-reward-model |
| Precisión de entrenamiento | pesos fp32, autocast bf16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de 135M parámetros sin modificaciones estructurales respecto al checkpoint base; todo el trabajo se concentra en el alineamiento por refuerzo. El pipeline consta de tres piezas: (1) una implementación desde cero de DPO (preparación de datos con chat template, cálculo de log-probabilidades de respuesta y bucle de entrenamiento), (2) un modelo de recompensa `AutoModelForSequenceClassification` con cabeza lineal entrenado con `RewardTrainer`, y (3) una política PPO entrenada con `PPOTrainer` contra ese modelo de recompensa. La política y la referencia se inicializan desde SmolLM-135M-Instruct; el modelo de recompensa y el value model se inicializan desde el reward model entrenado.

El dataset se divide 90/10 con semilla 42: 9.795 pares para entrenamiento y 1.089 reservados para evaluación, partición común a los tres modelos. Las respuestas se truncan tras el primer `<|im_end|>` y la recompensa se calcula solo sobre ese segmento; las respuestas sin EOS reciben una penalización de 1,0. La configuración de PPO es: learning rate 5e-6, 8.192 episodios totales, batch de rollout 64, 4 épocas PPO por batch, coeficiente KL 0,05, longitud de respuesta 128 tokens, temperatura de muestreo 0,7 y clip range 0,2. El entrenamiento completo tardó 23,1 minutos. La dinámica registrada muestra una recompensa media de -0,553 en las últimas 10 actualizaciones (frente a -0,674 en la primera), una divergencia KL de 1,602 respecto a la referencia y una recompensa RLHF neta (recompensa − KL) de -0,633.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con la plantilla de SmolLM-Instruct.
- Respuesta a instrucciones y preguntas abiertas de complejidad baja, limitada por el tamaño del modelo base.
- Alineamiento parcial hacia un estilo «humano» y emocional según el dataset de preferencias empleado, aunque con efecto marginal en esta ejecución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Modo thinking, visión o audio: no disponible.
- Integración con `text-generation-inference` y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Docencia y reproducción de pipelines RLHF: el repositorio sirve como referencia ejecutable de un flujo DPO + reward model + PPO completo en menos de media hora de cómputo, útil en asignaturas de alineamiento.
- Estudio de estabilidad de PPO en modelos pequeños: los logs de recompensa, KL y tasas de EOS permiten analizar por qué el run `base` no converge a un comportamiento claramente alineado.
- Evaluación comparativa de algoritmos de alineamiento: la tabla de 128 prompts reservados con métricas de `rm_score`, `emoji_rate`, `ai_phrase_rate`, longitud media y `eos_rate` permite contrastar DPO frente a PPO bajo un mismo protocolo.
- Análisis de log-probabilidades y detección de olvido catastrófico: la comparación de log-probabilidades en datos de entrenamiento, held-out y alpaca externo permite medir cuánto se desplaza la distribución respecto a la referencia.
- Prototipado de modelos de recompensa: el reward model asociado puede reutilizarse para puntuar respuestas generadas por otros modelos pequeños en experimentos de laboratorio.
- Generación de texto de bajo coste en entornos con recursos mínimos: con 135M parámetros cabe en CPU o en GPU de gama baja para demos y pruebas de integración, no para producción con usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una evaluación propia sobre 128 prompts reservados, con muestreo a temperatura 0,7 y hasta 128 tokens nuevos:

| Modelo | rm_score | emoji_rate | emoji_per_response | ai_phrase_rate | mean_tokens | eos_rate |
|---|---|---|---|---|---|---|
| SFT (referencia) | -3,071 | 0,000 | 0,000 | 0,352 | 125,867 | 0,031 |
| DPO · beta 0,1 | -1,844 | 0,320 | 1,320 | 0,008 | 117,375 | 0,156 |
| PPO · base | -2,822 | 0,000 | 0,000 | 0,320 | 128,000 | 0,000 |

Log-probabilidad media por token de la respuesta (300 pares por conjunto):

| Modelo | train · chosen | train · rejected | held-out · chosen | held-out · rejected | alpaca (externo) |
|---|---|---|---|---|---|
| SFT (referencia) | -1,901 | -1,662 | -1,956 | -1,688 | -2,215 |
| DPO · beta 0,1 | -1,802 | -2,733 | -1,848 | -2,783 | -2,422 |
| PPO · base | -1,907 | -1,673 | -1,962 | -1,699 | -2,255 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16/bf16 (unos 270 MB de pesos) y alrededor de 0,5-1 GB adicionales para caché KV y overhead del runtime; en cuantización de 8 bits cabe en menos de 200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), y conversión a llama.cpp/Ollama/GGUF mediante herramientas externas, ya que los pesos están en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera decodificación en tiempo real incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-course-hw2-ppo | 134,5 M | no disponible | PPO con reward model propio | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM-135M-Instruct (base) | 135 M | no disponible | SFT + DPO del autor original | Apache 2.0 | Hugging Face |
| SmolLM-135M (base preentrenado) | 135 M | no disponible | sin alinear | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~500 M | 32.768 tokens (según documentación pública de Qwen) | SFT + preferencias | Apache 2.0 | Hugging Face |

La comparación relevante es interna a la propia colección del autor: el run DPO con beta 0,1 obtiene mejor `rm_score` (-1,844), mayor tasa de emojis (0,320) y mayor tasa de EOS (0,156) que este PPO `base`, que apenas se separa de la referencia SFT. Frente a alternativas de mayor tamaño como Qwen2.5-0.5B-Instruct, este modelo queda muy por debajo en capacidad general y en contexto soportado.

## Limitaciones y advertencias

- El run publicado (`base`) apenas modifica el comportamiento de la referencia: la tasa de muletillas tipo «as an AI» solo baja del 35,2 % al 32,0 %.
- Tasa de EOS del 0,0 % en la evaluación reservada: el modelo no aprende a terminar las respuestas y agota siempre los 128 tokens, lo que lo hace inadecuado para producción.
- Divergencia KL de 1,602 respecto a la referencia, alta para un ajuste que apenas mejora la recompensa; indica que el PPO no está bien ajustado en esta configuración.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño del modelo base (135M) y por la longitud máxima de respuesta de 128 tokens.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Sesgos heredados del corpus de preentrenamiento de SmolLM-135M-Instruct y del dataset de preferencias HumanLLMs, no auditados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el estado del entrenamiento (0 descargas, 0 likes, sin benchmarks estándar) desaconseja cualquier despliegue real.
- El modelo de recompensa asociado puede presentar sesgos hacia el estilo del dataset y no es una medida objetiva de calidad.
- No hay información sobre longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timur-th/llm-course-hw2-ppo
- Modelo de recompensa asociado: https://huggingface.co/Timur-th/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset externo de evaluación: https://huggingface.co/datasets/tatsu-lab/alpaca
- Librería TRL (PPOTrainer experimental): https://github.com/huggingface/trl
