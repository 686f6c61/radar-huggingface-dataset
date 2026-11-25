# TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v3

## Resumen

Qwen3-VL-8B-Instruct-Cuneiform-v3 es un ajuste fino mediante LoRA (QLoRA, con Unsloth) del modelo vision-language Qwen3-VL-8B-Instruct de Alibaba, desarrollado por el proyecto de investigación TRACCERR. Su propósito es asistir en la lectura, transliteración y traducción de tablillas cuneiformes sumerias a partir de fotografías de tablillas de arcilla, dibujos arqueológicos de línea o texto transliterado. El modelo combina un transformer multimodal de 8.190.735.360 parámetros con un adaptador PEFT que especializa la capacidad de reconocimiento de signos cuneiformes.

El modelo resuelve un problema muy concreto: la mayoría de las colecciones de tablillas nunca han recibido transcripción ni traducción exhaustiva, y el trabajo de un asiriólogo requiere años de formación. Este prototipo de investigación pretende acelerar la primera pasada de lectura y traducción preliminar, no sustituir al experto. Es relevante dentro del nicho de las humanidades digitales y la arqueología computacional, donde los modelos multimodales de propósito general rinden muy por debajo de lo necesario en escrituras no latinas.

Se distribuye con licencia Apache 2.0, soporta inglés y sumerio (código `sux`), y ofrece pesos en safetensors (adaptador LoRA) y en GGUF con proyector de visión separado para su uso en llama.cpp. El contexto, la composición exacta del dataset y los detalles completos de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (base Qwen3-VL-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M y proyector de visión BF16); cuantizaciones adicionales no disponibles |
| Idiomas soportados | inglés (`en`), sumerio (`sux`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo principal + `mmproj` de visión) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`, una versión del Qwen3-VL-8B-Instruct de Alibaba cuantizada en 4 bits para entrenamiento eficiente. Sobre esa base se aplica un ajuste fino con QLoRA mediante la librería Unsloth, dando como resultado un adaptador PEFT en formato safetensors. La arquitectura subyacente es un transformer multimodal que procesa pares imagen-texto (pipeline `image-text-to-text`), con un proyector de visión que en los ficheros GGUF se distribuye como archivo independiente (`mmproj-Qwen3-VL-8B-Instruct-Cuneiform-v3-BF16.gguf`).

El entrenamiento utiliza el dataset `TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster`, orientado a tablillas cuneiformes sumerias. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio ajuste multimodal especializado. El autor menciona que el material de entrenamiento está dominado por registros administrativos y económicos, lo que condiciona el rendimiento de traducción.

## Capacidades

- Lectura de fotografías de tablillas de arcilla: identificación de signos cuneiformes visibles en imágenes de primer plano y de tablilla completa.
- Interpretación de dibujos arqueológicos de línea empleados tradicionalmente para documentar tablillas.
- Transliteración: conversión de signos cuneiformes a transliteración latina académica.
- Reconstrucción de signos: conversión de transliteración sumeria de vuelta a caracteres cuneiformes.
- Traducción de sumerio transliterado a inglés con carácter preliminar.
- Traducción directa imagen a inglés sin transcripción manual intermedia.
- Identificación de contexto histórico: reconocimiento de determinados periodos y categorías documentales.
- Reconocimiento de material ilegible: el modelo puede indicar que una imagen no es interpretable de forma fiable en lugar de forzar una respuesta.
- Procesamiento multimodal imagen-texto conversacional.

## Casos de uso

- Catalogación de colecciones museísticas: procesar lotes de fotografías de tablillas para obtener una primera transliteración que sirva de borrador al asiriólogo, reduciendo el tiempo de transcripción manual inicial.
- Triaje de archivos arqueológicos: clasificar rápidamente tablillas por periodo histórico y categoría documental (administrativa, económica, legal) antes de la revisión experta.
- Digitalización de fondos documentales: convertir dibujos de línea antiguos en texto transliterado indexable, facilitando búsquedas sobre corpus previamente solo en papel.
- Asistencia a la docencia: generar transliteraciones y traducciones preliminares para estudiantes de sumerio que necesitan material de práctica con retroalimentación inmediata, siempre con verificación posterior.
- Investigación lingüística comparada: producir borradores de traducción de registros administrativos y económicos, el dominio mejor cubierto por el entrenamiento, para análisis estadísticos de vocabulario.
- Detección de tablillas no legibles: en pipelines de digitalización masiva, usar la capacidad de reconocimiento de material ilegible para derivar automáticamente imágenes defectuosas a revisión manual en lugar de generar transcripciones erróneas.
- Reconstrucción de signos para edición crítica: dada una transliteración académica existente, regenerar los caracteres cuneiformes correspondientes para publicaciones o interfaces interactivas.

## Benchmarks y rendimiento

Evaluación del autor sobre 540 ejemplos de test excluidos del entrenamiento. Las métricas de signos miden la coincidencia de signos producidos frente a los esperados (equilibrando aciertos, omisiones y adiciones), no la proporción de tablillas perfectamente traducidas ni el orden correcto de signos.

| Tarea | Rendimiento |
|---|---|
| Fotografías de tablilla en primer plano | 46,1 % de coincidencia de signos |
| Fotografías de tablilla completa | 49,1 % de coincidencia de signos |
| Dibujos arqueológicos de línea | 57,1 % de coincidencia de signos |
| Combinación de fotos y dibujos | 30,5 % de coincidencia de signos |
| Cuneiforme a transliteración | 73,3 % de coincidencia de signos |
| Transliteración a cuneiforme | 86,2 % de coincidencia de signos |

| Modelo | Similitud de traducción |
|---|---:|
| TRACCERR Cuneiform v3 | 50,6 % |
| Qwen3-VL-8B original | 10,8 % |

La similitud de traducción es una medida automática de similitud textual, no un porcentaje de traducciones histórica o lingüísticamente correctas. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 8B en BF16 requiere aproximadamente 16 GB de VRAM solo para pesos; en cuantización Q4_K_M, del orden de 5-6 GB para pesos más overhead del proyector de visión y del contexto.
- GPU recomendadas: no especificadas por el autor. Para BF16, GPU de 24 GB o más (RTX 4090, A100 40 GB, H100). Para GGUF Q4_K_M, GPU consumer de 8-12 GB puede ser suficiente en función de la longitud de contexto.
- Cabe en GPU consumer: previsiblemente sí en cuantización GGUF Q4_K_M; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp con los ficheros GGUF (requiere el modelo principal y el `mmproj` de visión juntos), y ecosistema PEFT/Transformers para el adaptador safetensors. Soporte de vLLM, TGI u Ollama no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACCERR Cuneiform v3 | 8,19 B | no disponible | Cuneiforme sumerio (imagen y texto) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | Visión-lenguaje general | no disponible en la información | Hugging Face |
| TRACCERR Cuneiform 4B (versión anterior) | ~4 B | no disponible | Cuneiforme sumerio | no disponible en la información | Uso interno en la evaluación del autor |

La comparación cuantitativa disponible se limita a la similitud de traducción (50,6 % frente a 10,8 % del Qwen3-VL-8B original) y a las métricas de coincidencia de signos frente al modelo base y al 4B anterior, cuyos valores numéricos no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: el propio autor advierte que no sustituye a un asiriólogo formado; las lecturas y traducciones deben verificarse de forma independiente antes de tratarse como evidencia histórica.
- Rendimiento limitado en lectura de imágenes: alrededor de la mitad de los signos esperados se identifican en fotografías, con omisiones y adiciones frecuentes; la tarea combinada de fotos y dibujos cae al 30,5 %.
- Sesgo de dominio: el entrenamiento está dominado por registros administrativos y económicos, por lo que la traducción de textos literarios, religiosos o legales es previsiblemente peor.
- Métricas no equivalentes a corrección: la similitud de traducción del 50,6 % es una medida automática de similitud textual, no una tasa de acierto lingüístico.
- Idiomas limitados a inglés y sumerio; no se declara soporte de otras lenguas acadias o de traducción a castellano.
- Riesgo de alucinación: aunque el modelo incluye capacidad de señalar material ilegible, en tareas de traducción libre puede generar lecturas plausibles pero incorrectas.
- Contexto máximo no documentado, lo que dificulta planificar pipelines con tablillas de muchas líneas.
- Los ficheros GGUF requieren obligatoriamente el proyector de visión `mmproj`; sin él el modelo no procesa imágenes.
- Licencia Apache 2.0 permite uso comercial, pero la calidad actual no respalda un uso productivo sin supervisión experta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/TRACCERR/Sumtables-Cuneiform-Full-Fable5-Remaster
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
