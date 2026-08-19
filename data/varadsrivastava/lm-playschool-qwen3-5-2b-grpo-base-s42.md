# varadsrivastava/lm-playschool-qwen3.5-2b-grpo-base-s42

## Resumen

`lm-playschool-qwen3.5-2b-grpo-base-s42` es un checkpoint de investigación derivado de Qwen/Qwen3.5-2B mediante entrenamiento con GRPO (Group Relative Policy Optimization), desarrollado por el equipo DAIR en el contexto del LM Playschool Challenge 2026. Forma parte de un barrido de cinco regímenes de post-entrenamiento para competencia en juegos de diálogo, y este checkpoint concreto es el brazo de control: se entrenó con GRPO online sin recompensa intrínseca, partiendo del modelo R2 (un DPO previo). El objetivo era evaluar si el RL online estrecho sobre un subconjunto de juegos mejora el rendimiento global o induce olvido en el resto de la suite.

El entrenamiento se realizó sobre cuatro juegos de un solo jugador (wordle, textmapworld, textmapworld_specificroom y adventuregame) con una implementación propia de GRPO (sin librerías externas de RL), K=6 rollouts por instancia, 4 instancias por paso, 60 pasos, learning rate 5e-6, clip epsilon 0.2, KL per-token k3 con beta=0.04 y muestreo a temperatura 0.8 con top-p 0.95. El resultado fue una regresión en el rendimiento global (clemscore de 67.39 a 62.43), con mejoras o mantenimiento en los juegos entrenados pero pérdidas severas en los juegos de dos jugadores no entrenados (codenames -15.4, guesswhat -11.1, taboo -8.3), evidenciando olvido catastrófico inducido por el RL online estrecho.

El modelo tiene 1.881.825.088 parámetros (según los pesos safetensors), es exclusivamente de generación de texto en inglés, con licencia Apache-2.0 y formato safetensors. Es relevante porque documenta de forma rigurosa los efectos del post-entrenamiento RL sobre modelos pequeños en entornos de diálogo, un tema crítico para el desarrollo de agentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-2B, un modelo de lenguaje de 2B parámetros (el checkpoint concreto tiene 1.881.825.088 parámetros, probablemente excluyendo ciertos componentes como embeddings o cabezas de clasificación). No se trata de un modelo MoE ni híbrido; es un transformer denso estándar.

El entrenamiento consistió en GRPO online (Group Relative Policy Optimization) desde el modelo R2, que a su vez era un checkpoint DPO. Se utilizó una implementación propia, sin librerías externas de RL. Los hiperparámetros clave fueron: K=6 rollouts por instancia, 4 instancias por paso, 60 pasos de optimización, learning rate 5e-6, clip epsilon 0.2, KL per-token k3 con beta=0.04, y muestreo con temperatura 0.8 y top-p 0.95. El conjunto de entrenamiento fueron cuatro juegos de un solo jugador: wordle, textmapworld, textmapworld_specificroom y adventuregame. No se empleó recompensa intrínseca (es el brazo de control), a diferencia del checkpoint hermano `grpo-rnd-s42` que sí la incorporaba.

El resultado fue una regresión en el rendimiento global (clemscore de 67.39 a 62.43), con mejoras o mantenimiento en los juegos entrenados pero pérdidas significativas en los juegos de dos jugadores no entrenados. Este comportamiento confirma el riesgo de olvido catastrófico cuando el RL online se aplica de forma estrecha sobre un subconjunto de tareas.

## Capacidades

- Generacion de texto conversacional en ingles, orientado a juegos de dialogo.
- Razonamiento multi-turno en entornos de juego de un solo jugador (wordle, textmapworld, textmapworld_specificroom, adventuregame).
- Capacidad limitada en juegos de dos jugadores (codenames, guesswhat, taboo) debido al olvido inducido por el entrenamiento.
- No se documenta soporte explicito de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso fuera del contexto de juegos.
- No se documentan capacidades multimodales (solo texto).
- No se documenta un modo de pensamiento o razonamiento extendido.

## Casos de uso

- Investigacion en post-entrenamiento RL: el modelo sirve como referencia de control para estudiar el efecto del GRPO sin recompensa intrinseca sobre un modelo pequeno, permitiendo aislar el impacto de la funcion de recompensa.
- Estudio de olvido catastrofico: su comportamiento (regresion en juegos no entrenados) lo convierte en un caso de estudio para analizar como el RL online estrecho degrada capacidades previamente adquiridas.
- Evaluacion de metodos de alineacion: puede usarse como baseline en comparaciones con otros checkpoints de la familia (R1, R2, R3, R4, R5-RND) para medir la eficacia de distintas estrategias de post-entrenamiento.
- Analisis de robustez en juegos de dialogo: permite estudiar la sensibilidad del rendimiento a variaciones en el entorno de evaluacion (el propio autor menciona que los numeros dependen del entorno de ejecucion).
- Benchmark de metodos GRPO: al estar entrenado con una implementacion propia de GRPO, puede servir para validar implementaciones alternativas o ajustes de hiperparametros.
- Educacion y divulgacion: como ejemplo de los riesgos del RL online en modelos de lenguaje pequenos, puede utilizarse en cursos de alineacion y aprendizaje por refuerzo.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card y corresponden a la metrica clemscore/statscore sobre la particion de validacion del entorno playpen, con un entorno congelado (Python 3.11, clemcore y clembench fijados). Se aplicaron dos correcciones upstream: un guard contra division por cero en el Game Master de privateshared y el recurso NLTK `punkt_tab` para el scorer IFEval. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Checkpoint | clem | stat |
|---|---|---|
| Qwen3.5-2B (base) | 13.63 | 44.22 |
| R1 (SFT) | 55.61 | 43.87 |
| R2 (DPO) | 67.39 | 44.72 |
| R3 (SFT iter3) | 61.06 | 44.01 |
| R4 (DPO iter4) | 67.64 | 44.31 |
| R5 GRPO (control, este modelo) | 62.43 | 44.19 |
| R5 GRPO + RND | 67.44 | 43.53 |

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Por su tamano (1.881.825.088 parametros), el modelo puede ejecutarse en GPUs consumer con 8-12 GB de VRAM en precision FP16 o BF16, y con cuantizacion de 4 bits cabria en GPUs de 6-8 GB (estimacion razonable, no confirmada por el autor).
- GPUs recomendadas (estimacion): RTX 3060 12GB, RTX 4070, RTX 4090, A10, A100.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- No se conocen datos de latencia o throughput especificos.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y con otros checkpoints de la misma familia, ya que no se dispone de datos de modelos externos de tamano similar en el mismo entorno de evaluacion.

| Modelo | Parametros | Contexto | clem | stat | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | no disponible | 13.63 | 44.22 | Apache-2.0 |
| R1 (SFT) | 2B | no disponible | 55.61 | 43.87 | Apache-2.0 |
| R2 (DPO) | 2B | no disponible | 67.39 | 44.72 | Apache-2.0 |
| R4 (DPO iter4) | 2B | no disponible | 67.64 | 44.31 | Apache-2.0 |
| R5 GRPO + RND | 2B | no disponible | 67.44 | 43.53 | Apache-2.0 |
| **R5 GRPO (control)** | **2B** | **no disponible** | **62.43** | **44.19** | **Apache-2.0** |

## Limitaciones y advertencias

- Olvido catastrofico: el entrenamiento GRPO estrecho sobre cuatro juegos provoco una regresion significativa en juegos de dos jugadores no entrenados (codenames -15.4, guesswhat -11.1, taboo -8.3).
- Rendimiento global inferior al punto de partida R2: el clemscore cayo de 67.39 a 62.43, por lo que este checkpoint no es una mejora sobre su predecesor.
- Solo soporta ingles; no se documenta capacidad multilingue.
- Es un modelo de investigacion, no apto para produccion sin una evaluacion exhaustiva adicional.
- La model card advierte que los numeros de rendimiento son sensibles al entorno de ejecucion; revisiones anteriores de la tarjeta reportaron valores de un entorno no fijado.
- No se han publicado resultados en benchmarks estandar de lenguaje o razonamiento, por lo que su calidad general fuera de los juegos de dialogo es desconocida.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad, imparcialidad o robustez.

## Enlaces

- HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-grpo-base-s42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper (pendiente de enlace): *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026)
