# tchbcb/samaidev-pnet-2b

## Resumen

tchbcb/samaidev-pnet-2b es una modificación experimental del modelo MiniCPM5-2B (un decoder Llama de aproximadamente 2.000 millones de parámetros) que incorpora la técnica PonderNet. El autor, tchbcb, ha implementado un mecanismo de "tiempo de pensamiento" adaptativo: en lugar de ejecutar las 42 capas del modelo una sola vez, las últimas 8 capas (34 a 41) se ejecutan de forma iterativa hasta que una señal de parada decide que el cómputo es suficiente. Esta arquitectura pretende resolver el problema del coste computacional fijo de los modelos transformer, permitiendo dedicar más recursos a tokens o tareas difíciles y menos a los sencillos.

El modelo base MiniCPM5-2B ofrece una ventana de contexto de 128.000 tokens, 16 cabezas de atención con 2 cabezas KV (GQA), RoPE con theta 5e6 y una MLP SiLU. Sobre esta base, PonderNet añade una cabeza de parada (`ponder_head`) de 2.049 parámetros y una función de pérdida que combina la cross-entropy con una divergencia KL respecto a una distribución geométrica. El repositorio de HuggingFace incluye los pesos en safetensors y una implementación completa (`ponder_llama.py`) que no requiere modificar el código de transformers.

La relevancia del modelo radica en su carácter de prototipo abierto para investigar computación adaptativa, interpretabilidad del razonamiento y eficiencia en inferencia, aunque no se han publicado benchmarks de rendimiento que validen su funcionamiento en tareas estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama (LlamaForCausalLM) con bloque PonderNet iterativo sobre las capas 34-41 |
| Parametros totales | ~2B (nominal, sin valor exacto publicado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (index + shards) |

## Arquitectura y entrenamiento

El modelo parte del checkpoints `openbmb/MiniCPM5-2B` (copia: `tchbcb/MiniCPM5-2B-cpu`), cuya arquitectura es un decoder puramente Llama: 42 capas, dimensiones ocultas de 2048, 16 cabezas de atención y 2 cabezas KV (Grouped Query Attention), `head_dim` de 128, RoPE con theta 5e6, MLP SiLU con `intermediate` de 6144 y vocabulario de 130.560 tokens. La modificación PonderNet consiste en envolver este modelo: las capas 0 a 33 se aplican una sola vez, mientras que las capas 34 a 41 forman un "bloque de pensamiento" que se ejecuta en bucle hasta K pasos (por defecto 8). En cada paso, una función de parada genera una probabilidad lambda_k; la salida final del bloque es una mezcla ponderada de las salidas de todos los pasos, ponderadas por la probabilidad de parada en cada iteración.

El código de la implementación (`ponder_llama.py`, unas 400 líneas) define cuatro señales de parada: entropía normalizada, max softmax probability, deriva (similitud coseno entre estados ocultos consecutivos) y una cabeza aprendida. Para mantener coherente la caché KV, la implementación recorta y reescribe las entradas de la caché en cada iteración y realiza una pasada de "commit" una vez que se ha decidido parar, de modo que los tokens siguientes atienden a la representación final. El entrenamiento de la cabeza de parada utiliza una función de pérdida que suma la entropía cruzada estándar con una divergencia KL entre la distribución de parada y una geométrica con parámetro `p_g` (por defecto 0.5), y admite modos de entrenamiento `head`, `head+lora` y `head+block`. No se han publicado datos sobre el preentrenamiento del modelo base ni sobre los conjuntos de datos utilizados; solo se documenta la creación de un pequeño dataset de entrenamiento de 600 ejemplos con dificultad graduada para ajustar la cabeza.

## Capacidades

- Generación de texto autoregresiva con capacidad de decidir cuánto cómputo dedicar a cada paso de decodificación.
- Razonamiento adaptativo: los tokens o preguntas que la señal de parada considera difíciles pueden recibir más iteraciones del bloque de pensamiento (hasta 8 por defecto), lo que puede mejorar el rendimiento en tareas de lógica o matemáticas.
- Selección de señal de parada configurable: entropía, max softmax probability, deriva o cabeza aprendida. Las tres primeras funcionan sin entrenamiento; la aprendida requiere ajuste previo.
- Generación con caché KV coherente, lo que permite mantener la ventana de contexto completa y admite left padding y batch en el flujo estándar de HuggingFace `generate()`.
- Entrenamiento opcional de la cabeza de parada o del bloque de pensamiento mediante LoRA sobre el bloque, con pérdida PonderNet que combina cross-entropy y KL.
- Instrumentación de diagnóstico: el modelo puede devolver el número de pasos de pensamiento por posición y un registro de parámetros internos, útil para interpretabilidad y análisis de casos.

## Casos de uso

1. Investigación en cómputo adaptativo: el modelo permite estudiar empíricamente cómo se distribuyen los pasos de pensamiento en función de la dificultad de la tarea. Con `eval_ponder.py` y `ponder_steps_demo.py` se puede comparar el número medio de pasos antes y después de entrenar la cabeza de parada, y visualizar la deriva de los pasos hacia la prioridad geométrica durante el entrenamiento.

2. Optimización del coste en inferencia: en entornos de producción con presupuesto de latencia, se puede limitar `max_ponder_steps` a 1 o 2 para obtener una respuesta rápida, o bien configurar `ponder_epsilon` mayor para que el modelo pare antes. Esto permite un compromiso explícito entre calidad y coste en cada consulta.

3. Ajuste fino de la cabeza de halting sobre un dominio específico: si se dispone de un dataset con preguntas fáciles y difíciles, se puede entrenar solo la cabeza `ponder_head` (2.049 parámetros) en modo `head`, o en modo `head+lora` para adaptar el bloque de pensamiento. Este enfoque requiere poca VRAM y puede balancear el cómputo según la dificultad del contenido.

4. Chat de bajo coste en GPU compartida: al ser un modelo de ~2B con pesos en bfloat16, cabe en una GPU de consumo con 8-12 GB de VRAM. El script `run_t4.sh` incluye una automatización para T4 (16 GB), lo que sugiere que puede desplegarse en entornos de cloud económica para prototipos de chat.

5. Análisis de interpretabilidad del razonamiento: gracias a `output_ponder=True`, se puede inspeccionar cuántas iteraciones consume cada token. Esto sirve para depurar modelos, detectar tokens que provocan cómputo excesivo y estudiar la relación entre la complejidad del texto y la profundidad de procesamiento.

6. Evaluación de ganancia de PonderNet sobre un modelo base: usando `eval_ponder.py` con el flag `--k1-baseline`, se puede comparar la pérdida y el número de pasos de un modelo con iteración adaptativa frente a un modelo con un único paso. Es útil para validar si la modificación aporta mejoras reales en un corpus concreto.

7. Prototipado de variantes de profundidad de bucle: el parámetro `ponder_start_layer` permite desplazar el inicio del bloque de pensamiento (por ejemplo, a la capa 30 o a la 38). Esto facilita experimentos rápidos para determinar qué profundidad de capas se beneficia más de la iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del autor solo menciona pruebas de humo (9 casos de test en `test_ponder.py`, 5 de entrenamiento y 5 de preparación para GPU), que verifican la consistencia de la caché, la generación, el entrenamiento y la compatibilidad con T4/fp16, pero no ofrecen métricas comparativas de calidad (MMLU, HumanEval, GSM8K, etc.) ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (~4 GB) y una ventana de contexto media, se necesitan aproximadamente 8-12 GB de VRAM. El modo de entrenamiento con la cabeza sola puede realizarse en una GPU de 8 GB, según indica el autor.
- GPU recomendadas: T4 16 GB (documentada en `run_t4.sh`), RTX 4090 24 GB, A100/H100 para lotes grandes o contexto largo. Solo se ha verificado explícitamente T4; no se han publicado pruebas con otras tarjetas.
- Cabe en GPU de consumo: sí, en gamas de 12 GB o superiores, siempre que se ajuste el tamaño del lote y la ventana de contexto.
- Opciones de despliegue: los pesos son safetensors estándar, pero la funcionalidad PonderNet requiere el código personalizado `ponder_llama.py`; no se ha documentado compatibilidad con vLLM, TGI, llama.cpp u Ollama. El autor indica que funciona con HuggingFace `generate()` y transformers 5.16.1.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cómputo adaptativo | Tamaño de pesos | Licencia |
|---|---|---|---|---|---|
| tchbcb/samaidev-pnet-2b | ~2B | 128K | Sí (PonderNet) | 5.3 GB | No disponible |
| openbmb/MiniCPM5-2B | ~2B | 128K | No | No disponible | No disponible |

No se dispone de información pública que permita comparar el rendimiento de este modelo con alternativas de la misma categoría (por ejemplo, otros modelos de ~2B o variantes con PonderNet), ya que no se han publicado benchmarks ni mediciones de calidad.

## Limitaciones y advertencias

- El repositorio no incluye una licencia explícita; el uso comercial o la redistribución de los pesos está sujeto a la licencia del modelo base, que tampoco se ha especificado.
- No existen benchmarks publicados, por lo que no se puede validar si la modificación PonderNet mejora el razonamiento o la calidad respecto al modelo base.
- La implementación es experimental y depende de un script personalizado (`ponder_llama.py`); no cuenta con soporte oficial ni está integrada en las herramientas de inferencia estándar.
- Las señales de parada `entropy`, `msp` y `drift` son heurísticas: funcionan sin entrenamiento, pero no garantizan una asignación óptima de cómputo. La señal `learned` es aleatoria si no se entrena la cabeza.
- La modificación puede provocar pasos de pensamiento adicionales inesperados si el umbral o el número máximo de pasos no se ajustan bien, lo que aumenta la latencia en producción.
- El modelo base probablemente hereda sesgos y limitaciones de conocimiento del corpus con el que fue entrenado, pero no se ha documentado nada al respecto en la información disponible.
- El número de idiomas soportados no está especificado, por lo que no es seguro asumir un buen rendimiento fuera del chino o el inglés (idiomas típicos de MiniCPM, aunque no confirmados).
- La fecha de creación del repositorio (septiembre de 2026) y el estado de 0 descargas indican que se trata de un proyecto muy temprano con escasa validación externa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tchbcb/samaidev-pnet-2b
- Repositorio base mencionado en la model card: https://huggingface.co/openbmb/MiniCPM5-2B
- Copia utilizada como referencia en la model card: https://huggingface.co/tchbcb/MiniCPM5-2B-cpu
