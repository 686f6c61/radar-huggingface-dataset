# steven0226/qwen2.5-3b-grpo-gsm8k

## Resumen

El modelo `steven0226/qwen2.5-3b-grpo-gsm8k` es un fine-tuning de `Qwen/Qwen2.5-3B-Instruct` entrenado con **GRPO** (Group Relative Policy Optimization) y **RLVR** (Reinforcement Learning with Verifiable Rewards) sobre el dataset de problemas aritméticos `openai/gsm8k`. El autor, `steven0226`, publica tanto la versión fusionada de 16 bits como el adaptador LoRA original, junto con el código de entrenamiento y las funciones de recompensa en un repositorio de GitHub. El objetivo es mejorar la capacidad de razonamiento matemático del modelo base, forzando una estructura de salida con etiquetas `<reasoning>` y `<answer>` que facilita la verificación automática de las respuestas.

El modelo conserva la arquitectura Transformer decoder-only de Qwen2.5-3B-Instruct (3,09 mil millones de parámetros) y hereda su ventana de contexto de 32K tokens, aunque la model card no especifica explícitamente este dato. La relevancia de este trabajo radica en demostrar que es posible mejorar el razonamiento de un modelo pequeño mediante RL con recompensas verificables, sin necesidad de entrenar un reward model adicional. Los resultados del entrenamiento muestran un aumento de la recompensa media de ~1,4 a ~3,1–3,3 y una mejora del formato estricto del 19,5 % al 90,0 %, sin crecimiento neto en la longitud de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K (heredado de Qwen2.5-3B-Instruct; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos originales fusionados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (licencia de investigación de Qwen) |
| Formato de pesos | safetensors (merged 16-bit) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder-only de Qwen2.5-3B-Instruct, que emplea atención multi-cabeza con sesgo de atención, normalización RMSNorm y activación SwiGLU. No es un modelo MoE ni híbrido; se trata de un modelo denso de 3,09B parámetros.

El entrenamiento utiliza **GRPO** (Group Relative Policy Optimization) implementado con TRL y Unsloth, con rollout mediante vLLM. En cada paso, el modelo genera 8 respuestas para el mismo prompt y calcula la ventaja relativa dentro del grupo, eliminando la necesidad de una value model como en PPO. La recompensa es una función programática con cuatro componentes: `correctness_reward` (2,0 puntos si el número dentro de `<answer>` coincide con la respuesta correcta), `strict_format_reward` (0,5 puntos por la estructura completa `<reasoning>...</reasoning><answer>...</answer>`), `soft_format_reward` (0,5 puntos por la aparición secuencial de las etiquetas) y `number_only_reward` (0,5 puntos si `<answer>` contiene solo un número). El dataset utilizado es el split de entrenamiento de `openai/gsm8k` (7.473 problemas), sin mezcla adicional.

Los hiperparámetros principales incluyen LoRA con rank y alpha de 32 aplicado a todas las capas QKVO y MLP, learning rate 5e-06 con scheduler cosine y warmup del 10 %, entrenamiento con QLoRA de 4 bits, 1.000 pasos, y longitudes máximas de prompt y completion de 256 y 768 tokens respectivamente. Se corrigió el regex de `strict_format_reward` para incluir `re.DOTALL`, ya que la versión oficial no coincidía con razonamientos multilínea.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en resolver problemas aritméticos de nivel GSM8K, produciendo una cadena de razonamiento dentro de etiquetas `<reasoning>` y una respuesta final numérica en `<answer>`.
- Razonamiento estructurado: la salida sigue un formato XML estricto que facilita el parseo automático y la verificación de resultados en pipelines de evaluación.
- Conversación en inglés: al estar basado en Qwen2.5-3B-Instruct, conserva las capacidades conversacionales generales del modelo base, aunque el entrenamiento se centra en tareas de razonamiento matemático.
- No se han documentado capacidades adicionales como tool calling, visión, audio o modo de pensamiento extendido en la información disponible.

## Casos de uso

- Tutoría y asistencia educativa en matemáticas: el modelo puede generar explicaciones paso a paso para problemas aritméticos, útil en plataformas de aprendizaje automático o asistentes de estudio personalizados.
- Verificación automática de respuestas en sistemas de evaluación: gracias al formato estructurado `<reasoning><answer>`, puede integrarse en pipelines que extraen automáticamente la respuesta numérica y la comparan con la solución esperada.
- Investigación en RL aplicada a LLMs: sirve como ejemplo reproducible de entrenamiento con GRPO y recompensas verificables, permitiendo a otros investigadores estudiar el comportamiento de la política en modelos pequeños.
- Generación de datos sintéticos de razonamiento: las respuestas generadas pueden utilizarse para crear datasets de entrenamiento o fine-tuning para otros modelos de razonamiento.
- Prototipado de agentes de razonamiento: aunque no se documenta soporte para tool calling, el modelo puede emplearse como componente de razonamiento en arquitecturas de agentes donde se necesite resolver problemas matemáticos de forma aislada.
- Benchmarking de técnicas de RL: al publicar el código, los pesos y las curvas de entrenamiento, facilita la comparación de distintas configuraciones de GRPO, longitudes de completion o funciones de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas como MMLU, HumanEval o GSM8K accuracy sobre el conjunto de test, ni comparaciones con otros modelos. Los únicos datos cuantitativos son las curvas de entrenamiento: la recompensa media pasó de ~1,4 a 3,1–3,3 y el cumplimiento del formato estricto del 19,5 % al 90,0 % tras 1.000 pasos. No se observó crecimiento neto en la longitud de las completions. El autor indica que estos resultados no se extrapolan a otros modelos o datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP16 ocupa ~6,2 GB de memoria (3,09B parámetros × 2 bytes). Con cuantización de 8 bits se reduce a ~3,1 GB y con 4 bits a ~1,6 GB, aunque no se proporcionan pesos cuantizados en el repositorio.
- GPUs recomendadas: una GPU con al menos 8 GB de VRAM es suficiente para inferencia en FP16 (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti). Para entrenamiento con QLoRA de 4 bits se requieren aproximadamente 8-12 GB, como los que ofrece una RTX 3090 o RTX 4090.
- Despliegue: compatible con librerías estándar como Transformers, vLLM, TGI y llama.cpp (si se convierte a GGUF). No se documentan configuraciones específicas de latencia o throughput.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos con otros modelos en la información disponible. El modelo puede compararse cualitativamente con su base, `Qwen/Qwen2.5-3B-Instruct`, del que hereda arquitectura y capacidades generales, pero al que añade un entrenamiento específico en razonamiento matemático con formato estructurado. También existen otros modelos de razonamiento de tamaño similar, como `DeepSeek-R1-Distill-Qwen-3B`, pero no se dispone de datos de rendimiento en este repositorio para establecer una comparación cuantitativa. Por tanto, la comparativa queda limitada a las diferencias metodológicas (GRPO vs. destilación) sin resultados numéricos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el dataset GSM8K, por lo que su rendimiento puede degradarse en problemas matemáticos de mayor complejidad o en dominios fuera de la aritmética básica.
- La licencia `qwen-research` restringe el uso a fines de investigación; no está permitido el uso comercial sin autorización expresa.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- El autor advierte que, aunque se revisaron 200 respuestas sin detectar exploits evidentes del verifier, no garantiza que no existan formas de engañar a las funciones de recompensa.
- El modelo base puede presentar sesgos y alucinaciones inherentes a Qwen2.5-3B-Instruct, que el entrenamiento RL no corrige.
- No se proporcionan pesos cuantizados ni configuraciones de despliegue optimizadas; el usuario debe gestionar la conversión si necesita reducir el uso de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/steven0226/qwen2.5-3b-grpo-gsm8k
- Adaptador LoRA: https://huggingface.co/steven0226/qwen2.5-3b-grpo-gsm8k-lora
- Código de entrenamiento y análisis: https://github.com/kuotunyu/grpo-rlvr-reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de GRPO (referencia): https://arxiv.org/abs/2110.14168
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
