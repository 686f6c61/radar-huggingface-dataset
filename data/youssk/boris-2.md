# youssK/Boris-2

## Resumen

Boris-2 es un modelo de lenguaje base de 144 millones de parámetros desarrollado por OpenCerebral, entrenado desde cero sobre 200.000 millones de tokens en una única GPU NVIDIA V100. Se publica bajo licencia Apache 2.0 y está pensado como punto de partida para experimentación e investigación en modelos de pequeño tamaño, no como asistente conversacional: es un modelo base que continúa texto y no sigue instrucciones.

La arquitectura es un transformer decoder de 31 capas con 512 dimensiones ocultas, atención multi-cabeza completa (8 cabezas de 64), MLP SwiGLU con dimensión interna 1664 y contexto de 2048 tokens. Incorpora dos componentes poco habituales: capas Canon (una convolución causal depthwise de 3 taps aplicada a la proyección fusionada QKV, que mezcla las dos posiciones anteriores antes de la atención) y una tabla de n-gramas que recupera vectores aprendidos de rango 64 a partir de los últimos dos y tres tokens.

Su relevancia actual reside en el coste: demuestra que un modelo de 144M puede entrenarse de principio a fin con recursos de una sola GPU y alcanzar puntuaciones competitivas en benchmarks de sentido común y aritmética frente a otros modelos pequeños. El checkpoint publicado añade dos etapas finales cortas de bajo learning rate (40M tokens en total) sobre el checkpoint de 200B tokens, seleccionadas por su puntuación en cinco benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con capas Canon y tabla de n-gramas |
| Parámetros totales | 144.192.782 (143,7M según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True` para el código de modelado) |

Desglose interno según la model card: 111,9M en bloques transformer, 16,8M en embedding de tokens (atado con la salida) y 15,0M en la tabla de n-gramas. Vocabulario de 32.768 tokens con BPE a nivel de byte entrenado específicamente para este modelo. Codificación posicional RoPE con theta 10.000.

## Arquitectura y entrenamiento

El modelo sigue el esquema de un decoder causal estándar con dos desviaciones documentadas. Las capas Canon aplican una convolución causal depthwise de 3 taps sobre la proyección fusionada de query, key y value, de modo que cada posición incorpora información de las dos posiciones previas antes de calcular la atención. La tabla de n-gramas realiza una búsqueda exacta (sin hashing) sobre los últimos dos y tres identificadores de token —210.938 bigramas y 23.437 trigramas— y recupera un vector aprendido de rango 64 que se suma al flujo residual antes del bloque 2.

El entrenamiento principal consumió 200.000 millones de tokens, seguido de dos etapas finales cortas de bajo learning rate que suman 40M tokens. El empaquetado de secuencias usa atención, Canon y búsqueda de n-gramas enmascaradas en los límites de documento (parámetro `eos_resets_context` en la configuración). El corpus combina diez datasets: karpathy/climbmix-400b-shuffle, HuggingFaceTB/finemath, openbmb/UltraData-Math, microsoft/orca-math-word-problems-200k, meta-math/MetaMathQA, MU-NLPC/Calc-ape210k, MU-NLPC/Calc-mawps, HuggingFaceTB/cosmopedia, HuggingFaceTB/smollm-corpus y mlfoundations/dclm-baseline-1.0. No se documenta el uso de RLHF ni DPO; se trata de un modelo base sin ajuste por preferencias.

El autor advierte que se probaron alrededor de diez candidatos de etapa final (distintos datos, semillas y learning rates, además de un experimento de amplificación de neuronas matemáticas que se descartó) y que el checkpoint liberado se eligió por su puntuación en los cinco benchmarks. Dado que la puntuación de un checkpoint individual varía en torno a ±0,8 puntos del índice, parte de la mejora sobre el checkpoint de 200B podría ser selección sobre ruido.

## Capacidades

- Generación de texto por continuación: el modelo completa secuencias, no mantiene diálogo ni responde a instrucciones.
- Razonamiento de sentido común básico, medido en HellaSwag, ARC-Easy y ARC-Challenge.
- Razonamiento físico cotidiano, medido en PIQA.
- Aritmética y problemas matemáticos de nivel escolar, medido en ArithMark-3 y entrenado con corpora matemáticos específicos (MetaMathQA, Orca-Math, Calc-ape210k, Calc-mawps, UltraData-Math, finemath).
- Modelado de lenguaje con vocabulario BPE a nivel de byte de 32.768 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre arquitecturas alternativas: las capas Canon y la tabla de n-gramas son componentes poco frecuentes que pueden estudiarse de forma aislada, modificarse o ablacionarse con un coste de entrenamiento bajo en una sola GPU.
- Generación de texto asistida y autocompletado: al ser un modelo base, encaja en tareas de continuación de texto donde no se requiere instrucción explícita, como completar descripciones o generar variantes de un fragmento dado.
- Experimentación educativa en entrenamiento de LLM: sus 144M de parámetros y su receta documentada (200B tokens, una V100) lo convierten en un caso práctico para estudiar tokenización, empaquetado de secuencias y evaluación zero-shot.
- Evaluación de técnicas de cuantización y despliegue: sirve como banco de pruebas de bajo coste para medir el impacto de distintas precisiones y motores de inferencia antes de escalar a modelos mayores.
- Fine-tuning para tareas concretas de inglés: al publicarse como modelo base con licencia Apache 2.0, puede ajustarse para clasificación de texto, extracción de entidades o generación de resúmenes en dominios específicos.
- Generación de datos sintéticos y aumento de corpus: puede producir continuaciones de texto en inglés para pipelines de preentrenamiento o para aumentar datasets de investigación.
- Benchmarking de modelos pequeños: su inclusión en el Open SLM Index y la publicación de todos los checkpoints de 10B tokens permiten comparaciones reproducibles de dinámicas de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, zero-shot con pesos en float32. ArithMark-3 se evalúa con el script oficial del leaderboard sin modificaciones.

| Benchmark | Métrica | Preview-2 | Boris-2 @200B | Boris-2 |
|---|---|---:|---:|---:|
| HellaSwag | acc_norm | 46,60 | 50,36 | 50,26 |
| ARC-Easy | acc_norm | 59,13 | 60,10 | 59,81 |
| ARC-Challenge | acc_norm | 30,20 | 32,25 | 32,00 |
| PIQA | acc_norm | 70,84 | 72,91 | 72,91 |
| ArithMark-3 | acc_norm | 42,20 | 42,00 | 45,10 |
| Open SLM Index | — | 30,58 | 33,59 | 34,19 |

El Open SLM Index se calcula con la fórmula del Open SLM Leaderboard: `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0,65 * N(ArithMark-3,25)) / 3,65`, donde `N(v,c) = 100(v-c)/(100-c)`. Casi toda la ganancia del checkpoint publicado sobre el de 200B tokens procede de ArithMark-3 (+3,1 puntos); los otros cuatro benchmarks varían 0,3 puntos o menos. El autor publica además el histórico completo de evaluaciones en `benchmarks.csv` y la comparativa de nueve tareas en `benchmarks_comparison.csv`.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 0,58 GB solo para pesos (144M × 4 bytes), más activaciones y caché KV; en float16/bfloat16, unos 0,29 GB. En la práctica, el modelo completo cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4060 o superior ofrecen margen amplio. El entrenamiento original se realizó en una única NVIDIA V100.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales con al menos 2-4 GB de VRAM, incluidas GTX 1650 y RTX 3050.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada oficialmente, dado que el modelo requiere código de modelado personalizado. Otros motores (vLLM, llama.cpp, Ollama, TGI) no están confirmados en la información disponible, y la presencia de las capas Canon y la tabla de n-gramas puede requerir soporte específico.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boris-2 | 144M | 2048 | Open SLM Index 34,19 | Apache 2.0 | Hugging Face |
| Boris-2 @200B | 144M | 2048 | Open SLM Index 33,59 | Apache 2.0 | Hugging Face |
| Boris-2-Preview-2 | 144M | 2048 | Open SLM Index 30,58 | Apache 2.0 | Hugging Face |
| Otros modelos pequeños del leaderboard | No disponible | No disponible | No disponible en la información proporcionada | No disponible | No disponible |

La model card menciona una comparativa de nueve tareas frente a otros modelos pequeños en `benchmarks_comparison.csv`, pero los datos concretos de esos modelos no se incluyen en la información disponible, por lo que no se detallan aquí.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones. Usarlo como asistente sin fine-tuning previo producirá continuaciones de texto, no respuestas.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo de 144M entrenado sobre corpus web y matemático; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la información disponible, pero los corpus de origen (ClimbMix, DCLM, Cosmopedia, SmolLM-corpus) contienen datos web con los sesgos habituales.
- La selección del checkpoint final se hizo sobre los mismos cinco benchmarks que se reportan, con una variabilidad estimada de ±0,8 puntos en el índice; parte de la mejora puede ser sobreajuste a la selección.
- El uso comercial está permitido por la licencia Apache 2.0, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código de modelado antes de desplegarlo en producción.
- El soporte en motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp) no está confirmado y puede requerir adaptaciones por los componentes personalizados.
- No se han publicado datos de cuantización ni de rendimiento en producción (latencia, throughput).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youssK/Boris-2
- Modelo original del autor: https://huggingface.co/opencerebral/Boris-2
- Perfil del autor en Hugging Face: https://huggingface.co/opencerebral
- Preview 1: https://huggingface.co/opencerebral/Boris-2-Preview-1
- Preview 2: https://huggingface.co/opencerebral/Boris-2-Preview-2
- Wiki: https://wiki.kunix.org/
- Código: https://git.kunix.org/boris-2
- OpenCerebral: https://oc.kunix.org/
- Licencia: https://huggingface.co/opencerebral/Boris-2/blob/main/LICENSE
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Orca-Math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset Calc-ape210k: https://huggingface.co/datasets/MU-NLPC/Calc-ape210k
- Dataset Calc-mawps: https://huggingface.co/datasets/MU-NLPC/Calc-mawps
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset SmolLM-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Benchmark ArithMark-3: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
