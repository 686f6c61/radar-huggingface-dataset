# sydneyfong/qwen3-english-correction

## Resumen

Qwen3 english-correction es un ajuste fino completo (full fine-tune, sin LoRA) de los modelos Qwen3-0.6B y Qwen3-1.7B de Alibaba, desarrollado por el usuario independiente sydneyfong con la librería MLX de Apple. El modelo resuelve un problema muy concreto: corregir frases en inglés mal escritas, típicamente producidas por hablantes nativos de cantonés que editan un diccionario inglés (errores gramaticales, colocaciones tipo Chinglish, calcos del chino y translationese). Acepta como entrada una frase en inglés y, opcionalmente, una referencia de significado en cantonés, y devuelve la frase corregida o la original intacta si ya es correcta.

El entrenamiento se realizó sobre un dataset derivado del diccionario cantones-inglés words.hk: 105.101 filas brutas profesor/humano que se redujeron a 35.750 entradas únicas y finalmente a 66.167 pares de entrenamiento, con 2.216 pares revisados por humanos como etapa final de currículum. Los modelos base son variantes híbridas con modo de razonamiento (thinking); el ajuste elimina ese comportamiento y responde directamente, sin tokens de pensamiento.

Es relevante por su especialización extrema y su tamaño reducido: demuestra que un fine-tune de 0,6B o 1,7B parámetros puede resolver una tarea lingüística acotada con alta fiabilidad, y publica tanto los pesos en formato MLX y GGUF como el dataset de entrenamiento completo, lo que lo convierte en un caso de estudio útil para quien quiera replicar pipelines de corrección gramatical o de adaptación de Qwen3 a dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo sobre Qwen3-0.6B y Qwen3-1.7B |
| Parametros totales | 596.049.920 (variante 0.6B, dato real de safetensors); variante 1.7B no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del Qwen3 base, no especificada en la model card) |
| Tipos de cuantizacion | f16 y q8_0 en GGUF; pesos MLX en precisión del fine-tune |
| Idiomas soportados | en (inglés), yue (cantonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX/HF), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3, una arquitectura transformer decoder-only con atención completa y variantes híbridas de razonamiento. El ajuste se hizo con MLX sobre los checkpoints Qwen3-0.6B y Qwen3-1.7B en modalidad full fine-tune, es decir, actualizando todos los pesos y no solo adaptadores. El pipeline emplea un currículum de dos etapas: una primera con 63.951 pares generados por un profesor automático (1 época, 8.000 iteraciones, batch 8, learning rate 1e-5) y una segunda con 2.216 pares revisados por humanos (3 épocas, 830 iteraciones, learning rate 5e-6).

La pérdida se calcula sobre la secuencia completa, incluidos los tokens del prompt, porque la referencia en cantonés forma parte del prompt entrenable y sirve al objetivo de comprensión del cantonés. Un 15,2% de los ejemplos omiten la línea en cantonés de forma determinista para dar robustez al modelo cuando no se proporciona referencia. El renderizado de datos es texto plano sin tokens de pensamiento: se evita deliberadamente la plantilla de chat estándar de Qwen3, que insertaría bloques de razonamiento vacíos en los turnos del asistente. El resultado es una plantilla de chat libre de modo thinking.

## Capacidades

- Corrección gramatical en inglés: tiempos verbales, concordancia sujeto-verbo, artículos, preposiciones y estructuras gramaticales incorrectas.
- Corrección de colocaciones y elección léxica, incluidos calcos del chino y Chinglish (por ejemplo, "Open the light" se convierte en "turn on the light").
- Corrección de translationese y frases encadenadas (run-ons) propias de hablantes L1 de cantonés.
- Comprensión opcional de una referencia de significado en cantonés para desambiguar la corrección.
- Comportamiento de identidad: devuelve la frase sin cambios si ya es correcta.
- Respuesta directa sin tokens de pensamiento (el modo thinking del modelo base se ha entrenado fuera).
- No se documentan capacidades de tool calling, agentes, visión, audio ni matemáticas avanzadas; el ajuste está orientado exclusivamente a la corrección de frases.

## Casos de uso

- Corrección de entradas de diccionario: el caso original del modelo; un editor de un diccionario cantones-inglés puede enviar cada definición o ejemplo en inglés y recibir la versión corregida, con la referencia en cantonés disponible para resolver ambigüedades de significado.
- Revisión de textos de hablantes de cantonés: plataformas de aprendizaje de inglés para hablantes de cantonés pueden integrar el modelo como corrector automático de redacciones, aprovechando que entiende los patrones de error típicos de ese perfil.
- Preedición en pipelines de traducción: corregir el inglés de origen antes de pasarlo a un motor de traducción reduce errores propagados; el modelo es lo bastante pequeño para ejecutarse en local dentro del pipeline.
- Asistente de escritura ligero en local: con 0,6B o 1,7B parámetros y GGUF q8_0, puede desplegarse en portátiles con Apple Silicon o GPU de consumo para corregir frases en tiempo real en un editor.
- Filtrado de calidad de datasets: al devolver la frase sin cambios cuando ya es correcta, sirve para detectar y normalizar ejemplos mal escritos en corpus bilingües antes de usarlos en entrenamiento.
- Investigación sobre adaptación de Qwen3: el repositorio publica los 66.167 pares de entrenamiento y las estadísticas, por lo que es una base reproducible para estudiar full fine-tune con currículum y eliminación del modo thinking en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una evaluación cualitativa sobre 14 casos sintéticos escritos a mano (gramática, tiempos, concordancia, artículos, colocaciones Chinglish, translationese, run-ons y comportamiento de identidad), en la que ambas variantes superan todos los casos. No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: la variante 0.6B en f16 ocupa aproximadamente 1,2 GB de pesos; en q8_0, alrededor de 0,6 GB. La variante 1.7B en f16 ronda los 3,4 GB y en q8_0 unos 1,8 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para la variante 1.7B en cuantización; para la 0.6B basta con 2 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon mediante MLX.
- Opciones de despliegue: MLX (librería nativa del autor), llama.cpp con los GGUF publicados; al ser pesos compatibles con Hugging Face, también puede cargarse con otras herramientas que soporten la arquitectura Qwen3, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sydneyfong/qwen3-english-correction (0.6B) | 596 M | no disponible | Corrección de inglés especializada (L1 cantonés) | Apache 2.0 | Hugging Face, MLX y GGUF |
| sydneyfong/qwen3-english-correction (1.7B) | no disponible en detalle | no disponible | Corrección de inglés especializada (L1 cantonés) | Apache 2.0 | Hugging Face, MLX y GGUF |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | Modelo generalista con modo thinking | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | Modelo generalista con modo thinking | Apache 2.0 | Hugging Face |

La comparación relevante es con sus propios modelos base: el fine-tune sacrifica generalidad y el modo de razonamiento a cambio de precisión en la tarea de corrección y de una plantilla de chat sin tokens de pensamiento. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a correctores gramaticales comerciales o modelos especializados de otros autores.

## Limitaciones y advertencias

- Solo corrige frases individuales; no hace edición a nivel de documento ni mantiene coherencia entre párrafos.
- El autor advierte que el proyecto está "purely vibe coded" y declina responsabilidad moral sobre el contenido del repositorio; conviene tratarlo como experimento y no como producto validado.
- El entrenamiento usó una sola época sobre los pares automáticos; el propio autor señala que más pasadas ampliarían probablemente la cobertura de estilos.
- Ejecutar el prompt sobre los modelos base (antes del fine-tune) produce bloques de pensamiento; el pipeline no los gestiona.
- El modelo está sesgado hacia los errores típicos de hablantes L1 de cantonés; puede no cubrir bien errores de otros perfiles lingüísticos.
- Riesgo de alucinación: al devolver una frase corregida, puede introducir cambios de significado no deseados, especialmente sin referencia en cantonés; no hay evaluación cuantitativa publicada que lo descarte.
- El soporte de idiomas se limita a inglés y cantonés; no se documenta comportamiento en otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3 conviene revisar también las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sydneyfong/qwen3-english-correction
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Diccionario words.hk (origen del dataset): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
