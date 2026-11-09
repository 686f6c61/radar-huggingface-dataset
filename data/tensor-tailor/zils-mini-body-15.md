# tensor-tailor/zils-mini-body-15

## Resumen

zils-mini-body-15 es un ajuste fino mediante LoRA de un modelo de decisión denominado Zils MINI, desarrollado por el usuario tensor-tailor para el pool de "soups" d3-mini de la subred 127 de Bittensor. Se construye sobre la media ponderada uniforme de dos cuerpos previos (qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1) y emplea el chasis d3-mini, que combina tensores de lenguaje y visión de Qwen3.5-4B en bf16. El modelo cuenta con aproximadamente 4.540 millones de parámetros y se distribuye bajo licencia Apache-2.0.

El propósito del modelo es actuar como "cuerpo de decisión" dentro de un ecosistema de evaluación tipo examen con 15 celdas de familia conocida (5 categorías por tres formatos: elección, sí/no y puntuación). El ajuste se realizó sobre 1.103 filas etiquetadas por anotadores humanos o por los propios generadores/probadores de los conjuntos de datos, cubriendo 7 de esas 15 celdas. La relevancia actual radica en su carácter experimental dentro de un marco de minería descentralizada, no en un uso como modelo generalista de propósito general.

No se dispone de información sobre longitud de contexto nativa, idiomas soportados ni pipeline de Hugging Face. La model card describe con detalle el método de entrenamiento, la composición del dataset y las precauciones de licencia, pero no ofrece resultados de benchmarks ni especificaciones de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con chasis d3-mini (tensores de lenguaje y visión de Qwen3.5-4B), capas de atención con Gated-DeltaNet y proyecciones MLP |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere cargador personalizado) |

## Arquitectura y entrenamiento

El modelo parte de un chasis d3-mini que integra tensores de lenguaje y visión de Qwen3.5-4B en bf16, con capas de atención que incorporan Gated-DeltaNet y proyecciones MLP (gate, up, down). Sobre esta base se aplicó un ajuste fino LoRA de rango 32, alpha 64 y dropout 0.05 sobre 248 matrices (atención, Gated-DeltaNet y MLP de todas las capas de lenguaje), con learning rate 5e-5, AdamW con weight decay 1.0 solo en los pesos LoRA, batch 8 con acumulación 2, warm-up de 50 pasos seguido de coseno, 2 épocas, máximo 2.048 tokens y semilla 4348. La función de pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1.0 veces el Brier score, sin término KL ni destilación, y el resultado se fusionó en bf16 sin interpolación de pesos.

El conjunto de entrenamiento consta de 1.103 filas balanceadas por etiqueta que cubren 7 de las 15 celdas del examen (reasoning, language, retrieval, tools, arts por elección, sí/no y puntuación). Las fuentes incluyen PIQA (214 filas, AFL-3.0), MultiNLI (212, licencia OANC y CC BY-SA/CC BY), Social IQa (108, CC BY 4.0), SNLI (107, CC BY-SA 4.0), RTE (107, sin licencia abierta nombrada), QNLI (83, CC BY-SA 4.0), RuleTaker (82, Apache-2.0), SQuAD 2.0 (81, CC BY-SA 4.0), 20 Newsgroups (43, sin licencia abierta nombrada), GoEmotions (41, Apache-2.0) y Corr2Cause (25, MIT). Se aplicaron filtros para excluir splits de examen, datos de Glaive, BIG-bench/MMLU, filas de eventos reales, duplicados cercanos y salidas de otros mineros.

## Capacidades

- Clasificación y decisión sobre tareas de razonamiento, lenguaje, recuperación de información y artes en formatos de elección, sí/no y puntuación.
- Procesamiento de entradas de lenguaje natural con etiquetado derivado de anotación humana en los conjuntos de origen.
- Capacidad de visión heredada del chasis Qwen3.5-4B (tensores de visión presentes), aunque no se documenta su uso específico en esta ficha.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de decisiones en tareas de razonamiento físico: el modelo puede clasificar pares de solución correcta/incorrecta en tareas tipo PIQA, útil para sistemas de verificación de sentido común físico en entornos controlados.
- Clasificación de inferencia textual (NLI): adecuado para determinar relaciones de implicación, neutralidad o contradicción entre pares de frases, aprovechando el entrenamiento sobre MultiNLI, SNLI y RTE.
- Respuesta a preguntas extractivas a nivel de frase: puede decidir si una oración contiene la respuesta a una pregunta, útil en pipelines de recuperación y verificación documental.
- Detección de emociones en texto: clasificación de seis emociones básicas sobre reseñas o comentarios, derivado del entrenamiento con GoEmotions.
- Razonamiento de sentido común social: evaluación de situaciones sociales y elección de respuestas plausibles, útil en sistemas de moderación o análisis de interacción.
- Clasificación temática de documentos: categorización de publicaciones en grupos de noticias o foros, aprovechando el entrenamiento con 20 Newsgroups.
- Verificación de reglas bajo supuestos de mundo cerrado: útil en sistemas expertos simples donde se requiere validar deducciones lógicas sobre hechos declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539 millones de parámetros en bf16 se requieren aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs con al menos 16 GB de VRAM en bf16 (por ejemplo, RTX 4090, A100 40GB, H100).
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con cuantización, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: no disponible; el uso de custom_code y safetensors sugiere carga mediante transformers con código personalizado, no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-15 | 4.539 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Ajuste LoRA sobre soup Zils MINI, chasis Qwen3.5-4B |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del soup, autor qhoenix |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del soup, autor Charlie320 |
| Qwen3.5-4B (referencia de chasis) | ~4.000 M | no disponible | no disponible | no disponible | Chasis subyacente de lenguaje y visión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre 1.103 filas de 11 conjuntos de datos, lo que limita su generalización fuera de las tareas cubiertas.
- Cubre solo 7 de las 15 celdas del examen; las categorías tools y score quedan vacías, por lo que su comportamiento en esas celdas no está calibrado.
- 150 filas provienen de RTE y 20 Newsgroups, cuyos lanzamientos originales no nombran licencia abierta; el autor advierte de revisar sus términos antes de reutilizar el cuerpo.
- Riesgo de alucinación y sesgos: no documentado explícitamente, pero al ser un ajuste sobre datos de anotación humana y generadores, hereda los sesgos de esos conjuntos (por ejemplo, sesgos de género o culturales en MultiNLI, SNLI o Social IQa).
- La licencia Apache-2.0 del repositorio cubre los pesos, pero no necesariamente el texto de los datasets de origen; los términos share-alike (CC BY-SA) aplican a la redistribución del texto fuente, que no está incluido en el repo.
- El modelo requiere custom_code para su carga, lo que puede complicar la integración en pipelines estándar y aumentar el riesgo de incompatibilidades.
- No se documentan idiomas soportados ni longitud de contexto nativa; el entrenamiento se limitó a 2.048 tokens.
- Uso comercial: la licencia Apache-2.0 permite uso comercial de los pesos, pero las restricciones de los datasets subyacentes deben verificarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-15
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- PIQA: https://yonatanbisk.com/piqa/
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- Social IQa: https://allenai.org/data/socialiqa
- SNLI: https://nlp.stanford.edu/projects/snli/
- GLUE (RTE, QNLI): https://gluebenchmark.com/
- SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- RuleTaker: https://github.com/allenai/ruletaker
- 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
- GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
- Corr2Cause: https://github.com/causalNLP/corr2cause
