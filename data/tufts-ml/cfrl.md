# tufts-ml/CFRL

## Resumen

CFRL es un conjunto de checkpoints de pesos publicados por el grupo tufts-ml (Universidad de Tufts) que acompaña al artículo "CFRL: Reinforcement Learning for Continuous Flow Language Models". No se trata de un modelo nuevo desde cero, sino de los pesos resultantes de aplicar post-entrenamiento con aprendizaje por refuerzo sobre ELF-B, un modelo de lenguaje de flujo continuo (continuous flow matching) de 105 millones de parámetros desarrollado por el proyecto Embedded Language Flows. El repositorio contiene únicamente los pesos; el código de entrenamiento, evaluación y carga vive en el repositorio `cfrl-release`.

El problema que aborda es el post-entrenamiento con RL de modelos de lenguaje que no generan tokens discretos, sino que operan en un espacio latente continuo mediante flow matching. Las técnicas habituales de RL para LLM (como PPO o GRPO sobre log-probabilidades de tokens) no se trasladan directamente a este paradigma, por lo que los autores proponen y comparan tres variantes: CFRL-GRR, CFRL-SVG-1D y CFRL-SVG-2D. Los checkpoints se han ajustado sobre cuatro tareas de razonamiento verificables por programa (Countdown, Game24, Sudoku y Knights-and-Knaves).

Es relevante ahora porque explora una línea alternativa a la generación autoregresiva discreta, y porque demuestra que el RL sobre modelos de flujo continuo produce mejoras medibles en tareas de razonamiento. El tamaño del repositorio (10 GB) se debe a la multiplicidad de checkpoints (base, críticos y tres variantes de política por cada una de las cuatro tareas), no a un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELF-B: modelo de lenguaje de flujo continuo (continuous flow matching) sobre embeddings, no autoregresivo discreto |
| Parametros totales | 105M (modelo base ELF-B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como `torch.save` en fp32/fp16 sin indicar) |
| Idiomas soportados | no disponible (entrenado en tareas de razonamiento simbólico, no en corpus multilingüe general) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torch.save`, dicts con `params`, `ema_params1`, `step`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, ELF-B, pertenece a la familia Embedded Language Flows: en lugar de predecir el siguiente token de un vocabulario discreto, modela la generación como un proceso de flow matching en un espacio de embeddings continuo. CFRL parte de un checkpoint de ELF-B ya ajustado por supervisión (SFT) en cada una de las cuatro tareas (carpeta `base/`), y sobre ese punto de partida aplica tres variantes de RL. La variante CFRL-GRR usa una política con recompensa basada en grupo; las variantes CFRL-SVG-1D y CFRL-SVG-2D incorporan un crítico (una copia del denoiser más una cabeza MLP) que se emplea para estimar la función de valor, con una o dos dimensiones de estimación respectivamente. Los ficheros de crítico se guardan aparte en `critic/`.

El entrenamiento se realiza sobre recompensas verificables por programa (correcto/incorrecto en cada tarea), lo que evita depender de un reward model aprendido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de DPO o RLHF. La innovación técnica destacable es precisamente la adaptación de RL con crítico a un modelo de flujo continuo, un régimen donde no existen log-probabilidades de token explícitas.

## Capacidades

- Generación de texto en un paradigma de flujo continuo (no autoregresivo token a token).
- Razonamiento simbólico verificado en cuatro tareas concretas: Countdown (operaciones aritméticas para alcanzar un objetivo), Game24 (combinar cuatro números con operaciones para obtener 24), Sudoku (resolución de rejillas) y Knights-and-Navies (acertijos lógicos de caballeros y escuderos).
- Post-entrenamiento con RL que mejora la precisión respecto al punto de partida SFT en tres de las cuatro tareas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible más allá de las tareas específicas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en RL para modelos de lenguaje no autoregresivos: usar los checkpoints `base/` y las tres variantes para reproducir los experimentos de la Tabla 1 del artículo y comparar el efecto de cada algoritmo de RL sobre un mismo punto de partida SFT.
- Estudio de flow matching aplicado a generación de texto: analizar cómo se comporta un modelo de 105M parámetros que genera en espacio continuo frente a un transformer autoregresivo de tamaño similar en tareas de razonamiento simbólico.
- Reproducción de experimentos de razonamiento verificable: ejecutar `scripts/evaluate.sh` sobre cada checkpoint para validar las cifras de precisión publicadas en Countdown, Game24, Sudoku y Knights-and-Knaves.
- Desarrollo de nuevos algoritmos de RL para modelos continuos: los críticos en `critic/` y las políticas en `svg1d/` y `svg2d/` sirven como línea base para probar variantes de estimación de valor.
- Docencia e investigación académica: el tamaño reducido (105M) y la licencia MIT permiten usar estos pesos en entornos con recursos limitados para estudiar post-entrenamiento con RL.
- Benchmarking de infraestructura de entrenamiento: el repositorio de 10 GB con múltiples checkpoints por tarea es útil para probar pipelines de carga, evaluación y entrenamiento distribuido a pequeña escala.

## Benchmarks y rendimiento

Precisión de test según la Tabla 1 de la model card:

| Tarea | base (SFT) | CFRL-GRR | CFRL-SVG-1D | CFRL-SVG-2D |
|---|---|---|---|---|
| Countdown | 42.8 | 42.6 | 47.4 | 49.7 |
| Sudoku | 64.0 | 67.9 | 64.1 | 68.7 |
| Knights-and-Knaves | 68.2 | 71.4 | 76.5 | 77.5 |
| Game24 | 44.0 | 47.4 | 51.2 | 58.2 |

CFRL-SVG-2D es la variante con mejores resultados en las cuatro tareas, con una mejora máxima de +14,2 puntos en Game24 respecto al punto de partida SFT. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con 105M parámetros, en fp32 ocupa aproximadamente 0,42 GB y en fp16 unos 0,21 GB, sin contar activaciones ni el crítico (que duplica el denoiser más una cabeza MLP). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia; para entrenamiento con RL se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) por el coste de mantener política y crítico.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es autoregresivo y requiere el código de `cfrl-release` (`cfrl/common.py:load_weights`). La carga se hace con `torch.load(path, map_location="cpu", weights_only=False)`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CFRL (ELF-B + RL) | 105M | no disponible | Flujo continuo | MIT | Pesos en Hugging Face, código en `cfrl-release` |
| ELF-B (base) | 105M | no disponible | Flujo continuo | MIT | Pesos en `embedded-language-flows` |
| LLM autoregresivo pequeño (p. ej. Qwen2.5-0.5B) | ~500M | 32K típico | Autoregresivo discreto | Apache 2.0 | Amplia |

La comparación directa con LLM autoregresivos no es homogénea: CFRL está especializado en cuatro tareas de razonamiento simbólico y no se ha evaluado en benchmarks generales. Su principal referencia es ELF-B sin RL, respecto al cual mejora en tres de las cuatro tareas.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en cuatro tareas de razonamiento simbólico; no es un modelo de propósito general ni se ha evaluado en lenguaje natural abierto.
- No se dispone de información sobre sesgos, alucinación o robustez fuera de las tareas de entrenamiento.
- No hay datos sobre longitud de contexto soportada ni sobre comportamiento multilingüe.
- El repositorio contiene solo pesos; sin el código de `cfrl-release` no es posible cargar ni ejecutar el modelo.
- Los pesos se distribuyen como dicts de `torch.save` con `weights_only=False`, lo que requiere confiar en el origen de los ficheros al cargarlos.
- La licencia MIT permite uso comercial, pero el modelo no está pensado para producción general; su uso realista es investigación y reproducción de experimentos.
- No hay soporte de tool calling, agentes ni integración con servidores de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/tufts-ml/CFRL
- Modelo base ELF: https://huggingface.co/embedded-language-flows
- Repositorio de código `cfrl-release`: no disponible como URL en la información proporcionada (se menciona en la model card)
- Artículo CFRL: no disponible como URL en la información proporcionada (citación `@article{cfrl2026}`)
