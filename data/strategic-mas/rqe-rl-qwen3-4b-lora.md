# strategic-mas/rqe-rl-qwen3-4b-lora

## Resumen

RQE-RL-Qwen3-4B-LoRA es una colección de adaptadores LoRA entrenados con GRPO (Group Relative Policy Optimization) sobre modelos Qwen3-4B previamente afinados con SFT, desarrollada por el usuario strategic-mas. El objetivo es especializar al modelo en la resolución de juegos de teoría de juegos mediante el cálculo del "RQE" (presumiblemente un equilibrio de tipo Rational Quantal Equilibrium), un dominio muy concreto que combina razonamiento numérico con teoría de juegos aplicada.

El repositorio contiene cuatro adaptadores independientes, cada uno correspondiente a un punto de control SFT distinto (pasos 1.000, 3.000 y 8.000) y a dos funciones de recompensa diferentes ("solver" y "pass"). Los adaptadores se aplican sobre el modelo base Qwen3-4B con el adaptador SFT correspondiente ya fusionado, y deben cargarse sin fusionar (unmerged) para preservar la actualización del RL, ya que la fusión en bf16 pierde entre el 63 % y el 85 % del cambio introducido.

Se trata de un artefacto de investigación, no de un modelo de producción: el autor lo declara explícitamente y no ofrece garantías. La relevancia radica en su valor metodológico, ya que documenta con detalle el efecto marginal del RL sobre un modelo SFT en un dominio acotado, incluyendo resultados estadísticos pareados y un análisis de qué tipos de partidas mejoran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptadores LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base); adaptadores LoRA: no disponible en detalle (r=32, alpha=64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los adaptadores se sirven en bf16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B con el adaptador SFT fusionado |
| Tamano del repositorio | 1,1 GB |
| Libreria | peft |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. Sobre él se aplica primero un ajuste supervisado (SFT) y después un adaptador LoRA entrenado con GRPO. Cada adaptador RL se entrena sobre el modelo SFT fusionado, con LoRA de rango 32 y alpha 64, KL respecto al modelo SFT (estimador k3, coeficiente 0,02), AdamW con learning rate constante de 1e-5 y una actualización on-policy por lote. La generación se realiza con vLLM en una GPU y el entrenamiento en otra, con aproximadamente 6,7 minutos por paso.

El entrenamiento usa 4 partidas nuevas por paso muestreadas de la distribución SFT, con 8 respuestas muestreadas por asiento (temperatura 1, hasta 12.288 tokens). Un mismo modelo responde por todos los asientos. Se emplean dos funciones de recompensa: "solver", que premia negativamente la brecha exacta respecto al RQE del solver (recortada a [-1, 0]), y "pass", que otorga 1 si la línea Final parsea correctamente (suma dentro de 0,002) y su brecha exacta es menor que 0,05. Las ventajas se calculan dentro de las 8 respuestas de cada asiento (normalización por media y desviación, o leave-one-out en el caso de "pass").

El hallazgo principal del autor es que el RL aporta entre 0,5 y 1 punto cuando el modelo SFT aún puede mejorar (puntos de control de 1.000 y 3.000 pasos), principalmente en partidas de 4-5 opciones y respuestas cercanas a la uniformidad; no aporta nada desde los puntos de control de 5.000/8.000 pasos ni en tipos de partida no vistos. La capacidad general del adaptador `from-sft3k-solver-reward-s80` se mantiene dentro del ruido respecto al SFT 3k.

## Capacidades

- Resolución de juegos de teoría de juegos con cálculo de equilibrio RQE y formato de respuesta estructurado (línea Final con suma de probabilidades).
- Razonamiento numérico y matemático aplicado a un dominio acotado de博弈 multi-asiento.
- Generación de texto y razonamiento general heredados del modelo base Qwen3-4B (dentro del ruido estadístico tras el RL).
- Soporte de tool calling y function calling: no documentado en la información proporcionada (depende del modelo base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para estos adaptadores.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking": no documentado en la información proporcionada para estos adaptadores.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a teoría de juegos: el adaptador sirve como referencia reproducible para estudiar el efecto marginal del GRPO sobre un modelo SFT en un dominio acotado, con configuraciones de entrenamiento y resultados pareados documentados.
- Evaluación de equilibrios en juegos de 4-5 opciones: el adaptador `from-sft1k-pass-reward-s60` mejora del 87,1 % al 92,0 % en este subconjunto, lo que lo hace útil para experimentos centrados en ese régimen.
- Generación de respuestas con formato estricto: la función de recompensa "pass" fuerza que la línea Final parsee con suma dentro de 0,002, útil para tareas donde el formato de salida es crítico.
- Estudio de estabilidad del entrenamiento RL: la comparación entre puntos de control SFT (1k, 3k, 8k) permite analizar cuándo el RL deja de aportar y por qué.
- Reproducción de experimentos con vLLM LoRARequest: el autor documenta explícitamente que los adaptadores deben servirse sin fusionar, lo que facilita la reproducción con infraestructura vLLM.
- Base para nuevos experimentos de GRPO: los adaptadores y sus `training_config.json` sirven como punto de partida para extender el método a otros dominios o funciones de recompensa.

## Benchmarks y rendimiento

Resultados del examen de 2.414 ítems (SFT inicial → tras RL, mismo hardware, adaptador servido sin fusionar):

| Adaptador | SFT inicial | Recompensa | Resultado | p (pareado) |
|---|---|---|---|---|
| from-sft3k-solver-reward-s80 | paso 3.000 | solver | 90,0 % → 90,5 % | 0,17 |
| from-sft3k-solver-reward-seed2-s60 | paso 3.000 | solver | 90,0 % → 90,8 % | 0,04 |
| from-sft1k-pass-reward-s60 | paso 1.000 | pass | 85,3 % → 86,3 % | 0,04 |
| from-sft8k-solver-reward-s60 | paso 8.000 | solver | 89,9 % → 89,5 % | 0,30 (sin efecto) |

Subconjunto de partidas de 4-5 opciones (from-sft1k-pass-reward-s60): 87,1 % → 92,0 %.

Capacidad general del adaptador `from-sft3k-solver-reward-s80` frente al SFT 3k:

| Benchmark | SFT 3k | Tras RL |
|---|---|---|
| GPQA | 27,3 | 25,3 |
| GSM8K | 88,6 | 88,8 |
| LiveCodeBench | 31,1 | 31,6 |
| MATH-500 | 70,0 | 70,0 |
| MMLU | 68,4 | 68,8 |

Todas las diferencias de capacidad general están dentro del ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bf16 requiere aproximadamente 8 GB de pesos; con el adaptador LoRA cargado sin fusionar, el sobrecoste es mínimo (rango 32). En cuantización de 4 bits cabría en GPUs de 6-8 GB, aunque la cuantización de los adaptadores no está documentada.
- GPU recomendadas: el entrenamiento se realizó con 2 GPUs (vLLM en una, entrenamiento en otra); el autor no especifica el modelo exacto. Para inferencia, una RTX 4090 (24 GB) o A100/H100 son suficientes y sobradas para un modelo de 4B.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4070 Ti y similares con al menos 8-10 GB de VRAM para bf16.
- Opciones de despliegue: vLLM con LoRARequest (recomendado por el autor), PEFT directamente, y potencialmente llama.cpp/Ollama si se fusiona el adaptador (aunque el autor advierte que la fusión en bf16 pierde la mayor parte de la actualización del RL).
- Latencia y throughput: no disponible en la información proporcionada; el entrenamiento reporta 6,7 minutos por paso con generación en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| RQE-RL-Qwen3-4B-LoRA (este) | 4B + LoRA r=32 | no disponible | Apache 2.0 | RL (GRPO) sobre SFT para teoría de juegos | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B (base) | 4B | no disponible en la info | Apache 2.0 | Modelo generalista | Hugging Face |
| Adaptadores SFT del mismo autor (repo SFT) | 4B + LoRA | no disponible | Apache 2.0 | SFT para teoría de juegos | Hugging Face (referenciado) |
| Otros adaptadores GRPO sobre Qwen3-4B | 4B + LoRA | no disponible | variable | RL en dominios específicos | no disponible |

No se dispone de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente "Research artifact; no warranty". No apto para producción sin validación adicional.
- Ganancia marginal: el RL solo aporta 0,5-1 punto y únicamente cuando el SFT aún puede mejorar (1k-3k pasos); desde 5k/8k no hay efecto y en tipos de partida no vistos tampoco.
- Debe cargarse sin fusionar: fusionar el adaptador RL en bf16 pierde entre el 63 % y el 85 % de la actualización (el cambio es del 0,03-0,05 % de cada peso). Esto limita las opciones de despliegue y complica el uso con llama.cpp/Ollama.
- Dominio muy acotado: especializado en juegos de teoría de juegos con formato de salida estricto; no es un modelo generalista mejorado.
- Capacidad general sin mejora: GPQA baja de 27,3 a 25,3 (dentro del ruido, pero sin ganancia); no se debe esperar mejora en razonamiento general.
- Idiomas: no disponible en la información proporcionada; no se puede confirmar soporte multilingüe más allá del heredado del modelo base.
- Sesgos y alucinación: no documentados específicamente para estos adaptadores; hereda los del modelo base Qwen3-4B.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías, el uso comercial requiere validación propia.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/strategic-mas/rqe-rl-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio SFT referenciado por el autor: no disponible como URL directa en la información proporcionada (el autor menciona "the SFT repository" sin enlace explícito)
- Paper o blog del método RQE/GRPO: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
