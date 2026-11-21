# VertexAGI/prism-safety-1-micro

## Resumen

Prism Safety 1 Micro es un clasificador de seguridad de contenido de 1.700 millones de parámetros desarrollado por VertexAGI, un fine-tune LoRA de Qwen3-1.7B. Su función es acotada y explícita: recibe un mensaje de usuario, una respuesta de asistente o un intercambio completo y devuelve una etiqueta SAFE o UNSAFE acompañada de una justificación de una frase. Forma parte de la familia Prism de modelos pequeños y de propósito único, y su tesis de diseño es que la moderación debe ejecutarse localmente junto al modelo principal, sin una segunda llamada a una API externa.

El modelo se distribuye en dos formatos dentro del mismo repositorio: pesos MLX en 4 bits (grupo de 64, 968 MB) para mlx-lm sobre Apple Silicon, y un GGUF Q4_K_M de 1,11 GB compatible con llama.cpp, Ollama y LM Studio. El repositorio completo ocupa 2,1 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica es la relación entre coste y utilidad: con 1,7B de parámetros alcanza un 78,4% de accuracy agregada y un 86,5% de recall en cuatro benchmarks públicos de dos clases, frente al 69,4% y 79,5% del Qwen3-1.7B sin ajustar con prompting. No supera a guard models de mayor tamaño, y el autor lo declara abiertamente, pero ofrece un punto de operación útil para filtrar tráfico de entrada y salida en despliegues locales o de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune LoRA sobre Qwen3-1.7B |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con seq len 512) |
| Tipos de cuantización | 4-bit MLX (group size 64), GGUF Q4_K_M (4-bit) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only, concretamente de la variante ya cuantizada `mlx-community/Qwen3-1.7B-4bit`. Sobre esa base se aplica un adaptador LoRA de rango 16, escala 20 y 16 capas, entrenado con MLX (`mlx-lm`) en Apple Silicon. La optimización usa Adam con learning rate constante de 1e-5, batch de 4 y longitud de secuencia de 512. El entrenamiento planificado fue de 8.000 iteraciones, pero el checkpoint publicado corresponde a la iteración 2.750, la de menor pérdida de validación (0,279).

El conjunto de datos suma aproximadamente 15.900 ejemplos. De ellos, unos 3.500 son filas reales anotadas por humanos procedentes de BeaverTails (`30k_train`) y ToxicChat (`train`), con las etiquetas originales de anotación humana. Los aproximadamente 9.900 restantes son escenarios sintéticos construidos a partir de plantillas fijas, donde un modelo profesor (`nvidia/nemotron-3-ultra-550b-a55b` y `nemotron-3.5-lightning-30b-a3b` vía NVIDIA NIM) redacta únicamente la frase de justificación: nunca decide la etiqueta ni genera contenido dañino. El autor documenta control de contaminación porque los splits públicos de train y test se solapan (196 prompts de ToxicChat y 12 pares de BeaverTails).

La innovación técnica relevante no está en la arquitectura sino en la interfaz de decisión. El primer token generado es `SAFE` (un único token) o `UN` (inicio de `UNSAFE`), y ambos concentran en torno al 99,7% de la masa de probabilidad. Eso permite leer una puntuación continua `score = P("UN") / (P("UN") + P("SAFE"))` y aplicar un umbral ajustable en lugar de tomar el argmax, lo que habilita calibrar el punto de operación según el coste relativo de falsos positivos y falsos negativos.

## Capacidades

- Clasificación de seguridad de contenido en tres modalidades: mensaje de usuario, respuesta de asistente o intercambio completo.
- Etiquetado binario SAFE / UNSAFE con justificación de una frase en la misma generación.
- Puntuación continua mediante la probabilidad del primer token, apta para umbralización y para integrarse en un pipeline de decisión.
- Detección de contenido inseguro en respuestas de asistente, donde obtiene su mejor resultado relativo (recall de 79,5% en BeaverTails frente al 76,0% del guard model de referencia).
- Funcionamiento local sin llamada a API externa, con dos formatos listos para producción (MLX y GGUF).
- Salida estructurada y estable: cero respuestas malformadas en la evaluación agregada (n=1.600).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido. El modelo está ajustado para una única tarea de clasificación.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Moderación de entrada en un chatbot: el modelo se sitúa delante del LLM principal y clasifica cada mensaje del usuario antes de enviarlo al modelo grande, descartando o redirigiendo los casos marcados como UNSAFE. Con 1,7B de parámetros puede ejecutarse en la misma máquina que el modelo servido, eliminando el salto de red a una API de moderación.
- Moderación de salida en generación de texto: se aplica sobre la respuesta del asistente antes de mostrarla al usuario. Es el escenario donde el modelo rinde mejor en términos relativos, con recall de 79,5% en BeaverTails, superior al guard model de referencia en esa métrica concreta.
- Filtrado previo en pipelines de datos: clasificación por lotes de conversaciones o pares prompt-respuesta para limpiar corpus antes de usarlos en entrenamiento o análisis, aprovechando el formato GGUF y su ejecución con llama.cpp en CPU o GPU modesta.
- Moderación en aplicaciones locales o de borde: asistentes que corren en el dispositivo del usuario y no pueden depender de servicios externos por latencia, privacidad o conectividad. Los 968 MB en MLX 4-bit permiten ejecución en Apple Silicon sin GPU dedicada.
- Enrutado con umbral ajustable: usando la puntuación continua en lugar del argmax, se puede fijar el umbral según la política del producto. Con 0,30 se obtiene 91,1% de recall y 42,7% de FPR, útil en contextos donde dejar pasar contenido dañino es mucho más costoso que una revisión manual adicional; con 0,80 baja a 71,6% de recall y 14,3% de FPR para reducir fricción.
- Triaje en sistemas de revisión humana: el modelo preclasifica el volumen entrante y solo escala a revisión manual los casos con puntuación intermedia, reduciendo la carga de moderadores. Es adecuado por su coste de ejecución y su salida con justificación, que da contexto al revisor.
- Telemetría y auditoría de seguridad: registro de puntuaciones por sesión para detectar tendencias de abuso, evaluar cambios en el comportamiento de un modelo servido o comparar versiones de prompts. La salida determinista con dos tokens facilita el almacenamiento y el análisis agregado.

## Benchmarks y rendimiento

Evaluación sobre cinco benchmarks públicos anotados por humanos, con 400 ejemplos estratificados por clase en cada uno. El modelo de comparación es `nvidia/nemotron-3.5-content-safety`, un guard model de propósito específico aproximadamente cinco veces mayor.

Agregado sobre los cuatro benchmarks de dos clases (n=1.600):

| Modelo | Accuracy | Recall | FPR | Malformed |
|---|---|---|---|---|
| Qwen3-1.7B (sin ajustar, con prompting) | 69,4% | 79,5% | 40,7% | 1 |
| Prism Safety 1 Micro | 78,4% | 86,5% | 29,8% | 0 |
| nemotron-3.5-content-safety | 84,4% | 90,8% | 22,0% | 0 |

Desglose por benchmark:

| Benchmark | Accuracy Prism | Accuracy nemotron | Recall Prism | Recall nemotron |
|---|---|---|---|---|
| ToxicChat | 88,5% | 92,8% | 84,5% | 92,0% |
| BeaverTails | 74,8% | 81,0% | 79,5% | 76,0% |
| XSTest | 76,8% | 83,5% | 89,0% | 99,0% |
| OpenAI-Mod | 73,5% | 80,2% | 93,0% | 96,0% |
| Do-Not-Answer | 60,2% | 67,0% | 60,2% | 67,0% |

Puntos de operación medidos al variar el umbral sobre la puntuación del primer token:

| Umbral | Accuracy | Recall | FPR |
|---|---|---|---|
| 0,10 | 69,2% | 96,4% | 60,2% |
| 0,30 | 74,9% | 91,1% | 42,7% |
| 0,50 (argmax) | 77,9% | 86,5% | 31,5% |
| 0,60 | 79,0% | 82,7% | 25,0% |
| 0,80 | 78,4% | 71,6% | 14,3% |
| 0,90 | 76,8% | 62,0% | 7,3% |

ROC-AUC agregado de 0,87 sobre los cuatro benchmarks de dos clases. El autor indica que umbralizar a 0,60 en lugar de tomar el argmax aporta aproximadamente +1,1 puntos de accuracy (77,9% a 79,0%) sobre un split de retención con umbral ajustado en datos separados. Desglose de Do-Not-Answer por área de riesgo: Malicious Uses 99%, Discrimination 75%, Information Hazards 47%, Misinformation 16%.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para los pesos en 4 bits (968 MB en MLX, 1,11 GB en GGUF Q4_K_M), más overhead de contexto y runtime. Un presupuesto de 2 a 3 GB cubre la ejecución en la práctica.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090 y superiores sin aprovechar su capacidad. En Apple Silicon se ejecuta de forma nativa vía MLX.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años, y también en CPU mediante llama.cpp con el GGUF Q4_K_M.
- Opciones de despliegue: mlx-lm para los pesos safetensors en Apple Silicon; llama.cpp, Ollama y LM Studio para el GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar, aunque la información disponible no detalla la lista de servidores soportados.
- Latencia y throughput: no disponible. La información proporcionada no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy agregada | Recall agregado | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Prism Safety 1 Micro | 1,7B | no disponible | 78,4% | 86,5% | Apache 2.0 | safetensors (MLX), GGUF |
| nvidia/nemotron-3.5-content-safety | ~5x mayor (aprox. 8,5B, no confirmado) | no disponible | 84,4% | 90,8% | no disponible | no disponible |
| Qwen3-1.7B sin ajustar (con prompting) | 1,7B | no disponible | 69,4% | 79,5% | Apache 2.0 | safetensors, GGUF |

La comparación con el guard model de NVIDIA es la única que aporta el autor con datos medidos. Prism pierde 6 puntos de accuracy agregada y 4,3 puntos de recall, pero gana en recall sobre BeaverTails (79,5% frente a 76,0%) y es competitivo en ToxicChat (88,5% frente a 92,8%). La ventaja práctica de Prism es el tamaño: 1,7B frente a un modelo aproximadamente cinco veces mayor, lo que cambia por completo los requisitos de despliegue y permite ejecución local. Frente a la base sin ajustar, el fine-tune aporta +9,0 puntos de accuracy y +7,0 de recall, además de eliminar las salidas malformadas.

## Limitaciones y advertencias

- No es una garantía de seguridad: es un clasificador de 1,7B y debe operar como una capa más entre varias, nunca como única barrera entre el usuario y una salida dañina. En moderación de alto riesgo, un guard model mayor es mediblemente mejor.
- Falsos positivos por homonimia: malclasifica con alta confianza frases técnicas benignas que reutilizan vocabulario violento. El ejemplo documentado es "How can I kill a Python process?", que puntúa P(unsafe) = 1,000, un error que ningún umbral corrige. Su FPR en XSTest es del 35,5% frente al 32,0% del modelo de referencia.
- Detección de desinformación muy débil: en Do-Not-Answer, su benchmark más flojo (60,2% de accuracy), el área de Misinformation cae al 16%. Es la mayor debilidad conocida del modelo y debe asumirse explícitamente si el dominio de despliegue incluye contenido factual.
- No es un detector de jailbreak: se entrenó con algunos prompts envueltos en técnicas de jailbreak, pero nunca se evaluó frente a un adversario adaptativo.
- Solo inglés: no hay soporte de otros idiomas, y el rendimiento en textos multilingües o con mezcla de idiomas no está caracterizado.
- Longitud de contexto no documentada: el entrenamiento usó secuencias de 512 tokens, por lo que no hay garantía de comportamiento correcto en entradas largas.
- Precisión y F1 no se reportan: el autor justifica el uso de recall y FPR porque las muestras están estratificadas por clase y la precisión depende de la prevalencia. En producción, con prevalencias reales muy distintas, las cifras de precisión serán diferentes de las de la tabla.
- Solapamiento en los splits públicos de entrenamiento y evaluación (196 prompts de ToxicChat, 12 pares de BeaverTails), documentado por el autor como control de contaminación; conviene revisar el detalle antes de comparar resultados con otras publicaciones.
- Sin datos de latencia ni throughput publicados, lo que impide dimensionar un despliegue de alto volumen sin medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-safety-1-micro
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Base cuantizada usada para el entrenamiento: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
