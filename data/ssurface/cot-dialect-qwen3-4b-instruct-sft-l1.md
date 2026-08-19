# ssurface/cot-dialect-qwen3-4b-instruct-sft-l1

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-sft-l1` es un adaptador LoRA (PEFT) desarrollado por ssurface que se aplica sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Su propósito es modificar el estilo de razonamiento del modelo para que genere cadenas de pensamiento (chain-of-thought) en un "dialecto" de compresión de nivel L1, es decir, explicaciones verbosas y detalladas en lenguaje natural completo, en contraste con niveles más comprimidos (L2 a L5) que usan abreviaturas o símbolos. El adaptador se entrenó mediante destilación supervisada (SFT) sobre el conjunto de entrenamiento de GSM8K, reexpresado por un modelo profesor en ese estilo L1.

La relevancia de este modelo radica en su contribución al estudio de la compresión de cadenas de razonamiento: permite explorar cómo el nivel de verbosidad afecta a la precisión en tareas de razonamiento matemático. El adaptador es ligero (0.1 GB) y se distribuye bajo licencia Apache-2.0, lo que facilita su uso en investigación y experimentación. Está diseñado exclusivamente para el idioma inglés y su evaluación se centra en GSM8K, con una precisión declarada del 91.0% en el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | Modelo base: 4B; adaptador LoRA: no especificado |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No especificada; entrenamiento con max_seq de 1024 tokens |
| Tipos de cuantizacion | No disponible (adaptador publicado en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal y 4 mil millones de parámetros. El adaptador LoRA se entrena con r=16, alpha=32 y dropout de 0.05, aplicado sobre las capas del modelo base (no se especifica qué módulos exactos se modifican). El entrenamiento consiste en una destilación supervisada: un modelo profesor reexpresa los 6913 ejemplos del conjunto de entrenamiento de GSM8K en un estilo de razonamiento L1, caracterizado por cadenas de pensamiento completas y verbosas (mediana de 532 caracteres por cadena). La pérdida se calcula solo sobre la parte de la respuesta (completion), con longitudes de prompt precomputadas para evitar el enmascaramiento incorrecto.

El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4, programación coseno con warmup del 3%, tamaño de batch efectivo de 64 (16 x 4 acumulación de gradientes), precisión bf16 y una secuencia máxima de 1024 tokens. Se utilizó una única GPU NVIDIA A100 de 80 GB. No se menciona el uso de RLHF ni DPO; es exclusivamente SFT por destilación.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento verbosas (nivel L1), generando explicaciones paso a paso en lenguaje natural.
- Generación de texto instructivo siguiendo el formato de prompt "Solve this using Level 1 (Verbose). Problem: {problema}".
- Especialización en problemas de aritmética y álgebra elemental presentes en GSM8K.
- No soporta tool calling, function calling ni capacidades multimodales.
- No incluye modo de pensamiento oculto (thinking mode) propio; el razonamiento se genera como texto visible.
- Multilingüismo limitado al inglés; el adaptador no añade capacidades en otros idiomas.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones detalladas de problemas de aritmética y álgebra, útiles para plataformas educativas que necesitan mostrar el razonamiento completo detrás de cada solución.
- Generación de soluciones explicadas para conjuntos de datos de entrenamiento: al producir cadenas de pensamiento verbosas, puede servir para aumentar o reexpresar datasets de razonamiento matemático con explicaciones más legibles.
- Evaluación de la influencia de la verbosidad en el rendimiento: investigadores pueden usar este adaptador para comparar la precisión entre niveles de compresión L1 y otros (L2-L5) en tareas de razonamiento.
- Prototipado de asistentes de ayuda con deberes: integrado en un pipeline de chat, puede responder a preguntas matemáticas de estudiantes con pasos claros y didácticos.
- Análisis de robustez del razonamiento: al ser un adaptador entrenado exclusivamente en GSM8K, permite estudiar la generalización a problemas fuera de distribución y la degradación con la dificultad.
- Experimentación con destilación de cadenas de pensamiento: sirve como punto de referencia para técnicas de compresión de CoT y para validar metodologías de entrenamiento por destilación.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, sin verificación independiente:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | GSM8K (test, n=1317) | Accuracy (exact match) | 91.0% |

Condiciones de evaluación: decodificación greedy, una sola pasada, sin ejemplos (exemplars) ni self-consistency. No se proporcionan comparaciones con el modelo base sin adaptador ni con otros modelos.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (según la model card).
- Inferencia: al ser un adaptador LoRA, el requisito principal es el del modelo base Qwen3-4B-Instruct-2507. En bf16, el modelo base ocupa aproximadamente 8 GB de VRAM, más el adaptador (0.1 GB). Con cuantización del modelo base (p. ej., 4-bit), podría ejecutarse en GPUs de consumo con 8 GB o más, aunque no se especifican configuraciones oficiales.
- Opciones de despliegue: el adaptador se carga mediante la librería `peft` sobre el modelo base; puede usarse con frameworks como HuggingFace Transformers, y potencialmente con vLLM o llama.cpp si se fusionan los pesos, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables (otros adaptadores de la familia de dialectos de compresión L1-L5) en la documentación proporcionada. El único punto de referencia implícito es el modelo base Qwen3-4B-Instruct-2507 sin adaptador, pero no se publican sus resultados en GSM8K. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó exclusivamente en problemas de razonamiento matemático de GSM8K; su rendimiento en otras tareas no está validado.
- La precisión cae con la dificultad del problema, especialmente en los niveles de compresión más altos (aunque este adaptador es L1, la tendencia se menciona en la documentación).
- El resultado de 91.0% proviene de una única semilla; diferencias de un par de puntos porcentuales pueden deberse al ruido estadístico (intervalo de confianza del 95% de aproximadamente ±2.7 puntos en n=1317).
- No se ha verificado de forma independiente el benchmark declarado.
- El modelo solo soporta inglés; no se ha evaluado en otros idiomas.
- Al ser un adaptador LoRA, su uso requiere cargar el modelo base completo, lo que implica los requisitos de memoria de este último.
- No se documentan sesgos específicos, pero al entrenarse solo en GSM8K, puede presentar limitaciones en vocabulario y contextos fuera del dominio matemático.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l1
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
