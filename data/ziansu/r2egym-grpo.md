# ziansu/r2egym-grpo

## Resumen

`ziansu/r2egym-grpo` es un artefacto de investigación publicado en HuggingFace que contiene dos checkpoints resultantes de un único entrenamiento con GRPO (Group Relative Policy Optimization) sobre un subconjunto de R2E-Gym, partiendo del modelo base Qwen/Qwen3.5-4B. El objetivo declarado es entrenar un agente de ingeniería de software capaz de resolver issues reales de GitHub, y se evalúa con SWE-bench Verified. El autor es Zian Su (usuario `ziansu`), y el repositorio forma parte de un proyecto más amplio que compara distintas variantes de RL (TIP, RLAD, OPD y GRPO) sobre la misma base.

El repositorio no contiene pesos en su raíz: aloja dos subcarpetas, `step40` y `step80`, con 40 y 80 actualizaciones respectivamente. El checkpoint `step80` alcanza un 46,00 % de pass@1 (y 61,60 % de pass@3) en SWE-bench Verified bajo el protocolo de 98.304 tokens de contexto y 100 turnos, y un 44,67 % de pass@1 bajo el protocolo de 65.536 tokens y 75 turnos. El checkpoint `step40` no ha sido evaluado en SWE-bench y existe únicamente para comparar métodos con el mismo número de actualizaciones, ya que las variantes RAD del proyecto entrenan 40 pasos.

El modelo es relevante como referencia reproducible de RL sin profesor (*teacher-free*) aplicado a agentes de código con contexto largo, y como punto de comparación para investigaciones sobre verificación híbrida y generación procedural de entornos. Su tamaño (4,21 B parámetros en el modelo de lenguaje, 4,54 B en la versión completa con la torre de visión) lo sitúa en el rango de modelos desplegables en una sola GPU, aunque la ventana de contexto de 65.536 a 98.304 tokens eleva los requisitos de memoria en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (clase `Qwen3_5ForCausalLM`; la versión completa es `Qwen3_5ForConditionalGeneration`). El checkpoint contiene modulos `linear_attn` en 24 capas, lo que indica componentes de atencion lineal hibrida; el detalle completo de la arquitectura no se especifica en la informacion disponible |
| Parametros totales | 4,21 B (modelo de lenguaje); 4,54 B (modelo completo con torre de vision) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 65.536 tokens durante el rollout de entrenamiento; evaluado tambien con 98.304 tokens de contexto y 100 turnos |
| Tipos de cuantizacion | no disponible. Los pesos se distribuyen en bfloat16; 48 tensores (`linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas) se guardan en bfloat16 donde el modelo base usa float32 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos subcarpetas: `step40` y `step80`; la raiz del repositorio no contiene pesos) |
| Tamano del repositorio | 18,7 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de entrenamiento | GRPO sin profesor (*teacher-free*) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna más allá de la clase de HuggingFace (`Qwen3_5ForCausalLM` / `Qwen3_5ForConditionalGeneration`). Los detalles de conversión sí aportan información estructural: los 738 tensores del conjunto de claves del modelo base están presentes con formas coincidentes, y en cada una de las 24 capas existen módulos `linear_attn` (`A_log` y `norm.weight`), lo que apunta a una atención híbrida con capas de atención lineal. La torre de visión es byte a byte idéntica a la del modelo base Qwen/Qwen3.5-4B, es decir, el entrenamiento actualizó únicamente el modelo de lenguaje.

El entrenamiento empleó GRPO sin profesor sobre el corpus R2E-Gym, con un contexto de rollout de 65.536 tokens, tasa de aprendizaje de 1e-6, batch global de 256 y un batch de rollout de 32 grupos de tareas con 8 muestras por actualización. La conversión se realizó desde un checkpoint `torch_dist` de Megatron mediante `tools/convert_torch_dist_to_hf.py` de slime (`--vocab-size 248320 -a`), apuntando directamente al directorio `iter_*` correspondiente (`iter_0000039` para `step40` e `iter_0000079` para `step80`). Todos los parámetros se mantuvieron en bfloat16 durante el entrenamiento, que es también la precisión servida por el servidor de inferencia durante el entrenamiento y la evaluación.

## Capacidades

- Generación de texto y resolución de tareas de ingeniería de software: el modelo está afinado específicamente para producir parches y modificaciones de código en repositorios reales, según la evaluación en SWE-bench Verified.
- Razonamiento multi-turno en entornos ejecutables: soporta hasta 75-100 turnos de interacción con un entorno (ejecución de comandos, lectura de archivos, edición de código) dentro de una ventana de 65.536 a 98.304 tokens.
- Uso como agente con bucle de herramienta (*tool calling*): el protocolo de evaluación implica interacción iterativa con un entorno de ejecución, aunque la model card no especifica un formato de llamada a funciones concreto.
- Capacidades multimodales heredadas del modelo base: el checkpoint incluye la torre de visión intacta, por lo que `AutoModelForImageTextToText` carga el modelo completo de 4,54 B. La evaluación del proyecto utilizó únicamente el modelo de lenguaje.
- Capacidades multilingües: no disponibles en la información proporcionada.
- *Thinking mode* explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución automática de issues de GitHub: dado un repositorio y un *issue* en lenguaje natural, el modelo genera un parche candidato en varios turnos con acceso al entorno de ejecución. El ajuste con GRPO sobre R2E-Gym está orientado precisamente a este escenario, con un 46,00 % de pass@1 en SWE-bench Verified.
- Agente de mantenimiento en CI/CD: integrado en un bucle que clona el repositorio, reproduce el fallo, aplica un parche y ejecuta la suite de pruebas, aprovechando la ventana de 65.536 tokens para mantener el historial de intentos y los fragmentos de código relevantes.
- Reproducción de fallos y escritura de pruebas de regresión: el modelo puede inspeccionar el estado del repositorio, ejecutar comandos y añadir *tests* que reproduzcan el error antes de corregirlo, una capacidad reforzada por el uso de entornos ejecutables en el entrenamiento.
- Refactorización acotada de módulos: navegación de un repositorio grande, localización de los puntos de cambio y producción de *diffs* consistentes dentro de un mismo estilo de código, en un único contexto largo.
- Investigación sobre RL para agentes: el par de checkpoints (`step40` y `step80`) permite estudiar la curva de aprendizaje y comparar con las variantes TIP, RLAD y OPD del mismo proyecto bajo protocolos idénticos.
- Base para *fine-tuning* específico de dominio: al ser un modelo de 4,21 B con licencia Apache 2.0, es viable reentrenarlo con GRPO o SFT sobre un corpus interno de repositorios propios en una infraestructura modesta.
- Evaluación comparativa de estrategias de *test-time compute*: los dos protocolos publicados (65.536 tokens / 75 turnos y 98.304 tokens / 100 turnos) permiten medir cuánto aporta ampliar la ventana y el número de turnos en tareas de agente.

## Benchmarks y rendimiento

SWE-bench Verified, 500 tareas, semilla 42, 3 muestras por tarea (1.500 intentos). Los valores de pass@1 incluyen la desviación estándar muestral entre las tres tasas de pass a nivel de rollout.

| Protocolo | pass@1 | pass@3 |
|---|---|---|
| 98.304 contexto / 100 turnos | 46,00 % +/- 1,64 | 61,60 % |
| 65.536 contexto / 75 turnos | 44,67 % +/- 0,64 | 60,20 % |

Ambas filas corresponden al checkpoint `step80`. El checkpoint `step40` no ha sido evaluado.

Comparativa con las cuatro líneas base del proyecto, en sus actualizaciones finales bajo el protocolo 98.304 / 100:

| Metodo | Actualizaciones | pass@1 | pass@3 |
|---|---|---|---|
| TIP | 80 | 52,20 | 64,40 |
| RLAD | 79 | 51,80 | 63,20 |
| OPD | 79 | 51,67 | 63,80 |
| GRPO (este repositorio) | 80 | 46,00 | 61,60 |

El error estándar binomial con 500 tareas es de aproximadamente 1,3 puntos antes de considerar la varianza entre rollouts, por lo que diferencias de alrededor de un punto entre los métodos mejor situados no son separables. No se publican resultados de MMLU, HumanEval, GSM8K ni otras suites en la información disponible.

## Requisitos de hardware

- Pesos del modelo de lenguaje en bfloat16: aproximadamente 8,4 GB (4,21 B parámetros). Modelo completo con torre de visión: aproximadamente 9,1 GB (4,54 B).
- El repositorio completo ocupa 18,7 GB porque aloja los dos checkpoints; en inferencia solo se necesita descargar la subcarpeta correspondiente.
- Inferencia con contexto corto (8k tokens): cabe holgadamente en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090). Estimación orientativa, no publicada por el autor.
- Protocolos de agente con 65.536 o 98.304 tokens de contexto: la caché KV crece de forma notable, por lo que se recomienda una GPU de 24 GB o superior (RTX 4090, A6000, L40S) y, para el protocolo de 98k con lotes concurrentes, GPUs de 40-80 GB (A100, H100, H200) o paralelismo tensorial. Estimación orientativa; no se publican cifras exactas de memoria.
- Capacidades multimodales: requieren cargar `Qwen3_5ForConditionalGeneration` (4,54 B) y la torre de visión, con un consumo adicional moderado respecto al modelo de lenguaje.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `subfolder="step80"` o `"step40"` (uso documentado por el autor), así como servidores compatibles con la arquitectura Qwen3.5 (vLLM, SGLang, TGI). No se proporcionan pesos en GGUF, por lo que `llama.cpp` u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada. El servidor de inferencia usado durante el entrenamiento y la evaluación sirvió el modelo en bfloat16, pero no se publican métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ziansu/r2egym-grpo (step80) | 4,21 B (LM) / 4,54 B (completo) | 65.536-98.304 | 46,00 % (protocolo 98k/100) | Apache 2.0 | HuggingFace, 0 descargas al publicar la ficha |
| Variante TIP del mismo proyecto | no disponible | no disponible | 52,20 % (protocolo 98k/100) | no disponible | dentro del proyecto del autor |
| Variante RLAD del mismo proyecto | no disponible | no disponible | 51,80 % (protocolo 98k/100) | no disponible | dentro del proyecto del autor |
| Variante OPD del mismo proyecto | no disponible | no disponible | 51,67 % (protocolo 98k/100) | no disponible | dentro del proyecto del autor |
| Qwen/Qwen3.5-4B (base) | 4,21 B (LM) / 4,54 B (completo) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de otros agentes de software abiertos comparables (por ejemplo, de la familia R2E-Gym o SWE-Gym) en la información proporcionada, más allá de las tres variantes del mismo proyecto. Las diferencias entre TIP, RLAD y OPD frente a GRPO son de aproximadamente 6 puntos de pass@1, por encima del error estándar estimado, pero el autor advierte que diferencias de un punto entre los métodos mejor situados no son separables.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 *likes* en el momento de redactar la ficha: es un artefacto de investigación sin validación independiente ni adopción comunitaria.
- La raíz del repositorio no contiene pesos; es obligatorio indicar `subfolder="step40"` o `subfolder="step80"`. Cargar la raíz producirá un error.
- El checkpoint `step40` no ha sido evaluado en SWE-bench Verified; los números publicados corresponden exclusivamente a `step80` y no deben extrapolarse.
- 48 tensores se almacenan en bfloat16 allí donde el modelo base usa float32 (`linear_attn.A_log` y `linear_attn.norm.weight` en 24 capas). El autor justifica que el entrenamiento mantuvo todos los parámetros en bfloat16, pero esto implica una discrepancia de precisión respecto al checkpoint base que conviene tener en cuenta al comparar o mezclar pesos.
- Riesgo de alucinación: no se documentan tasas de alucinación ni análisis de errores. En tareas de agente sobre repositorios, un parche plausible pero incorrecto puede pasar desapercibido sin ejecución de pruebas.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o comportamiento en dominios sensibles.
- Idiomas: la model card no declara idiomas soportados; el modelo base Qwen3.5 tiene cobertura multilingüe, pero no hay confirmación de que el ajuste con GRPO sobre R2E-Gym (corpus de código, predominantemente en inglés) la preserve.
- Limitación de contexto: los protocolos de evaluación usan un máximo de 100 turnos y 98.304 tokens. Repositorios o historiales de conversación que excedan ese presupuesto requieren truncado, resumen o recuperación externa.
- Licencia Apache 2.0 sobre los pesos publicados, pero el uso comercial del modelo queda sujeto también a los términos del modelo base Qwen/Qwen3.5-4B, cuyas condiciones no se detallan en la información disponible.
- En producción, el modelo debe desplegarse con un entorno de ejecución aislado (contenedores, sandbox) porque el bucle de agente implica ejecutar comandos y código generado.
- El autor advierte que las diferencias de aproximadamente un punto en pass@1 entre los métodos mejor situados no son separables con 500 tareas; no deben usarse para afirmar superioridad entre métodos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ziansu/r2egym-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/ziansu
- Repositorio GitHub de R2E-Gym: https://github.com/R2E-Gym/R2E-Gym
- Organización R2E-Gym en HuggingFace: https://huggingface.co/R2E-Gym
- Paper R2E-Gym (arXiv): https://arxiv.org/html/2504.07164
- Sitio del proyecto R2E-Gym: https://r2e-gym.github.io/
