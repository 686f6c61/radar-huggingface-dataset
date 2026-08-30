# steven0226/qwen2.5-3b-grpo-gsm8k-lora

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 entrenado sobre el modelo `Qwen/Qwen2.5-3B-Instruct` mediante **GRPO** (Group Relative Policy Optimization) con **RLVR** (Reinforcement Learning with Verifiable Rewards). El objetivo es mejorar la capacidad de razonamiento matemático del modelo base en el conjunto de datos GSM8K de OpenAI, compuesto por problemas aritméticos de nivel escolar. El autor, steven0226, publica tanto el adaptador como el modelo fusionado completo en `steven0226/qwen2.5-3b-grpo-gsm8k`.

La relevancia de este trabajo reside en que emplea una metodología de aprendizaje por refuerzo sin modelo de recompensa entrenado: en lugar de un reward model, se utilizan reglas programáticas verificables que evalúan la corrección numérica y el formato estructurado de la respuesta. Esto reduce el coste computacional del pipeline de RL y demuestra que es posible mejorar el razonamiento de un modelo pequeño (3B parámetros) con una técnica de bajo coste como QLoRA 4-bit. El entrenamiento se realizó durante 1000 pasos con 8 generaciones por prompt, alcanzando una recompensa estable entre 3.1 y 3.3 sobre un máximo posible de 3.5.

El adaptador está pensado como un recurso educativo y de investigación para quienes quieran reproducir o extender experimentos de RL aplicado a razonamiento, más que como un modelo listo para producción. La licencia `qwen-research` limita su uso a fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct base) |
| Parametros totales | 3.09B (modelo base) + adaptador LoRA r=32 |
| Parametros activos | 3.09B (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit; el adaptador se puede fusionar en bf16/fp16 |
| Idiomas soportados | Ingles (entrenamiento solo en GSM8K, que es en ingles) |
| Licencia | Qwen Research License (qwen-research, uso no comercial) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5 con 3.09B parámetros y una ventana de contexto de 32 768 tokens. Sobre este modelo se aplicó un adaptador LoRA de rango 32 y alpha 32 aplicado a los módulos Q, K, V, O y MLP. El entrenamiento se realizó con 4-bit QLoRA usando la librería TRL de Hugging Face junto con Unsloth para optimizar la eficiencia, y vLLM para la generación rápida de respuestas durante el rollout.

El algoritmo de entrenamiento es GRPO, una variante de PPO que elimina el value model: para cada prompt se generan 8 respuestas y se comparan entre sí dentro del grupo para calcular ventajas relativas. La recompensa se calcula mediante reglas programáticas (RLVR) en lugar de un reward model entrenado. Cuatro funciones de recompensa componen la señal: `correctness_reward` (2.0 si el número dentro de `<answer>` coincide con la respuesta correcta), `strict_format_reward` (0.5 si se respeta la estructura completa `<reasoning>...</reasoning><answer>...</answer>`), `soft_format_reward` (0.5 si las etiquetas aparecen en orden, aunque sea parcialmente) y `number_only_reward` (0.5 si `<answer>` contiene solo un número). El máximo posible es 3.5.

Los hiperparámetros principales incluyen learning rate de 5e-6 con scheduler cosine y warmup del 10%, optimizador AdamW de 8 bits, longitud máxima de prompt de 256 tokens y de completion de 768 tokens. Se entrenó durante 1000 pasos con el split de entrenamiento completo de GSM8K (7 473 ejemplos). La recompensa subió de aproximadamente 1.4 a un valor estable entre 3.1 y 3.3, y el cumplimiento del formato estricto pasó del 19.5% al 90.0%, sin crecimiento neto en la longitud de las respuestas.

## Capacidades

- Razonamiento matemático de nivel escolar (problemas aritméticos multi-paso del estilo GSM8K).
- Generación de respuestas estructuradas con etiquetas XML `<reasoning>` y `<answer>`.
- Mejora en la adherencia al formato de salida solicitado (del 19.5% al 90.0% en formato estricto).
- Generación de texto en inglés, heredada del modelo base.
- No se han documentado capacidades de tool calling, function calling, agente multi-paso, visión o audio; el entrenamiento se centró exclusivamente en razonamiento matemático.

## Casos de uso

- **Investigación en RL aplicado a LLM**: el adaptador sirve como ejemplo reproducible de GRPO con RLVR sobre un modelo pequeño, con código fuente disponible en GitHub. Es útil para estudiar el efecto del entrenamiento por refuerzo en la capacidad de razonamiento.
- **Educación en aprendizaje por refuerzo**: estudiantes e investigadores pueden analizar las curvas de recompensa, la evolución del formato y las salidas antes/después del entrenamiento para comprender cómo funciona GRPO sin reward model.
- **Benchmark académico en GSM8K**: el modelo fusionado puede evaluarse en el split de test de GSM8K para medir la mejora exacta en precisión respecto al modelo base, como referencia para otros experimentos.
- **Generación de soluciones matemáticas explicadas**: puede generar respuestas razonadas paso a paso para problemas aritméticos, útil en entornos educativos o de tutoría automática (siempre que el uso se ajuste a la licencia de investigación).
- **Fine-tuning posterior con PEFT**: el adaptador se puede cargar con la librería PEFT y combinarse con otros adaptadores o continuar el entrenamiento, sirviendo como punto de partida para experimentos de RL multi-etapa.
- **Análisis de verifier exploitation en RL**: el autor documenta que no se encontraron exploits del verificador en 200 salidas revisadas, lo que convierte al modelo en un caso de estudio para investigar la robustez de las recompensas programáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (como precisión exacta en el split de test de GSM8K, MMLU o HumanEval) en la información disponible. La model card documenta métricas del proceso de entrenamiento: recompensa media estable entre 3.1 y 3.3 (máximo 3.5) y cumplimiento del formato estricto del 90.0% al final del entrenamiento, frente al 19.5% inicial. No se proporcionan comparaciones cuantitativas con otros modelos en tareas estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 3B parámetros, cabe en GPUs consumer. En bf16 ocupa aproximadamente 6.2 GB; en 4-bit cuantizado, unos 2 GB. El adaptador LoRA añade un overhead mínimo.
- **GPU recomendadas**: una RTX 3060 de 12 GB o superior es suficiente para inferencia en bf16. Para el entrenamiento con QLoRA 4-bit, el autor usó un entorno con Unsloth, que en una GPU de 24 GB (como RTX 3090 o A10G) permite reproducir el experimento.
- **Opciones de despliegue**: el adaptador se usa con la librería PEFT sobre el modelo base; el modelo fusionado puede cargarse con Transformers estándar. Es compatible con vLLM, llama.cpp y Ollama si se convierte a GGUF.
- **Latencia y throughput**: no se han publicado cifras de latencia o throughput. Para un modelo de 3B en una GPU moderna, se puede esperar una generación de decenas de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica de entrenamiento | Licencia |
|---|---|---|---|---|
| steven0226/qwen2.5-3b-grpo-gsm8k-lora | 3B + LoRA r=32 | 32 768 | GRPO + RLVR sobre GSM8K | qwen-research (no comercial) |
| SrikarVeluvali/Qwen-2.5-GRPO-RL | 3B | 32 768 | QLoRA 4-bit + GRPO multi-objetivo sobre GSM8K | no disponible |
| jwjohns/unsloth-GRPO-qwen2.5 | 3B (varias variantes) | 32 768 | GRPO con formato XML sobre GSM8K | no disponible |

Los tres proyectos comparten la misma base (Qwen2.5-3B-Instruct), el mismo dataset (GSM8K) y la misma técnica general (GRPO con QLoRA). Las diferencias están en los detalles de las funciones de recompensa, los hiperparámetros y el código de entrenamiento. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `qwen-research` limita el uso a fines de investigación y no permite uso comercial. Esto impide su despliegue en productos.
- **Entrenamiento en un solo dominio**: el modelo solo se ha entrenado en GSM8K (matemáticas de escuela primaria en inglés). No hay evidencia de mejora en otras tareas de razonamiento o en otros idiomas.
- **Riesgo de sobreajuste al formato**: el alto cumplimiento del formato estricto (90%) puede indicar cierto sobreajuste al esquema de etiquetas XML, que puede no transferirse a otros estilos de prompt.
- **Alucinaciones matemáticas**: como cualquier LLM, puede producir razonamientos plausibles pero incorrectos. El sistema de recompensa verifica la respuesta final, pero no la validez lógica de cada paso intermedio.
- **Sin evaluación independiente**: no hay benchmarks publicados en el split de test de GSM8K ni comparaciones con otros modelos, por lo que la mejora real en precisión no está cuantificada.
- **Riesgo de reward hacking**: el autor advierte que la ausencia de exploits del verificador en 200 casos revisados no garantiza que no existan; las reglas programáticas pueden tener lagunas.
- **Idioma limitado**: el modelo solo está entrenado y evaluado en inglés; su rendimiento en español u otros idiomas no está documentado.

## Enlaces

- [Adaptador LoRA en Hugging Face](https://huggingface.co/steven0226/qwen2.5-3b-grpo-gsm8k-lora)
- [Modelo fusionado completo en Hugging Face](https://huggingface.co/steven0226/qwen2.5-3b-grpo-gsm8k)
- [Repositorio de codigo y analisis en GitHub](https://github.com/kuotunyu/grpo-rlvr-reasoning)
- [Modelo base Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Dataset openai/gsm8k](https://huggingface.co/datasets/openai/gsm8k)
- [Paper de referencia sobre GSM8K (arxiv:2110.14168)](https://arxiv.org/abs/2110.14168)
