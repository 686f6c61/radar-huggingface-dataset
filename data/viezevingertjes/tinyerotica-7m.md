# ViezeVingertjes/TinyErotica-7M

## Resumen

TinyErotica-7M es un modelo de lenguaje de 7,16 millones de parámetros entrenado desde cero por el usuario ViezeVingertjes para generar relatos eróticos cortos y completos de aproximadamente 150 palabras en inglés. Se trata de un experimento de escala extrema: un transformer tipo Llama de solo 6 capas y dimensión oculta 288, diseñado específicamente para una única tarea de generación creativa de ficción adulta, no como modelo de propósito general.

El modelo parte de una arquitectura Llama minimalista con embeddings atados y un tokenizador BPE de 4.096 tokens entrenado sobre el propio corpus. Su ventana de contexto es de 256 tokens, suficiente para contener un relato completo, y su entrenamiento se realizó sobre el dataset TinyErotica/TinyErotica, formado por 257.002 relatos sintéticos de 80 a 190 palabras en 16 categorías, generados por un profesor Gemma 4 y verificados automáticamente.

Su relevancia es fundamentalmente metodológica: el autor documenta de forma rigurosa cómo el tamaño del dataset influye más que el número de parámetros a esta escala, con evaluaciones ciegas de coherencia lógica y análisis del efecto de los parámetros de muestreo. Es un caso de estudio sobre modelos de lenguaje ultra pequeños (SLM) especializados, no una herramienta de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only): 6 capas, 6 cabezas de atención, hidden size 288, FFN 768, embeddings atados |
| Parametros totales | 7.155.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors; el autor menciona evaluaciones con pesos int8) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Llama reducida al mínimo: 6 capas, 6 cabezas de atención, dimensión oculta de 288, capa feed-forward de 768 y embeddings de entrada y salida atados. El tokenizador es un BPE a nivel de byte con vocabulario de 4.096 tokens, entrenado específicamente sobre el corpus del dataset. No emplea técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas; es un transformer denso convencional a escala muy pequeña.

El entrenamiento se realizó desde cero durante 60.000 pasos con batches de 64 secuencias de 256 tokens (aproximadamente 21 épocas sobre el corpus), optimizador AdamW con learning rate 1e-3 y schedule coseno, alcanzando una pérdida de validación de 1,060. Los datos provienen del config `curated` del dataset TinyErotica/TinyErotica: 257.002 relatos sintéticos de 80 a 190 palabras en 16 categorías, escritos a partir de planes por un modelo profesor Gemma 4 y sometidos a verificación automática de longitud, palabras prohibidas, referencias a edades o menores, actos no planificados y errores de cuerpo y pronombres. Todos los personajes son adultos de 21 años o más. No se menciona RLHF ni DPO; el ajuste fino es puramente de modelado de lenguaje autoregresivo supervisado.

## Capacidades

- Generación de relatos eróticos cortos y completos de aproximadamente 150 palabras en inglés, sin necesidad de prompt: cada muestra arranca del token separador `<|endoftext|>` (id 0) y termina cuando el modelo lo vuelve a emitir.
- Generación de ficción creativa en 16 categorías temáticas, incluyendo temas de fantasía oscura como no consentimiento y relaciones tabú entre adultos (todo ficción).
- Coherencia narrativa limitada pero funcional a escala de relato corto, con capacidad de cerrar la historia de forma autónoma (100% de las historias terminan por sí solas según la evaluación del autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni visión.
- Capacidad multilingüe nula más allá del inglés.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Investigación sobre modelos de lenguaje ultra pequeños: el modelo sirve como banco de pruebas reproducible para estudiar cómo el tamaño del dataset y la longitud del entrenamiento afectan a la coherencia a escala de 7M de parámetros, con métricas documentadas de distinct 4-grams y errores lógicos por relato.
- Estudio de dinámicas de muestreo: el autor documenta el efecto medido de la repetition penalty, top-k, top-p y min-p sobre la variedad y la coherencia, lo que lo convierte en un caso práctico para experimentos de decodificación.
- Generación de ficción adulta de formato corto en entornos controlados: dado su contexto de 256 tokens, encaja en escenarios donde se requiere un relato autoconclusivo de unas 150 palabras sin prompt, por ejemplo para pruebas de pipelines de generación creativa.
- Docencia y divulgación sobre entrenamiento desde cero: su tamaño (0,1 GB de repositorio) permite entrenar, inspeccionar y desplegar el modelo completo en un portátil, lo que facilita explicar tokenización, embeddings atados y schedules de learning rate con un caso real.
- Evaluación de metodologías de juicio ciego: el autor emplea un modelo separado que lee relatos anonimizados y cuenta errores lógicos, un enfoque reutilizable para evaluar otros SLM generativos.
- Pruebas de estrés de filtros de contenido y moderación: al ser un modelo NSFW sin censura y de licencia Apache 2.0, puede usarse para validar clasificadores y políticas de contenido en pipelines de moderación, siempre en entornos para adultos.

## Benchmarks y rendimiento

El autor publica evaluaciones propias (no benchmarks estándar como MMLU o HumanEval). Se recogen a continuación tal como aparecen en la model card.

Efecto del tamaño del dataset y la longitud del entrenamiento (100 relatos por modelo, pesos int8, sampler anterior con temperatura 0,8, top-p 0,9 y repetition penalty 1,15):

| Metrica | 10k relatos | 110k relatos | 257k, 30k pasos | 257k, 60k pasos (este modelo) |
|---|---:|---:|---:|---:|
| Relatos que terminan solos | 100% | 99% | 100% | 100% |
| Palabras (mediana) | 129 | 130 | 146 | 146 |
| Relatos marcados por el checker | 5% | 13% | 0% | 0% |
| Relatos que cambian de nombre | 10% | 4% | 7% | 1% |
| 4-grams distintos | 0,654 | 0,791 | 0,867 | 0,842 |

Juicio ciego de errores lógicos por relato (modelo juez separado, relatos anonimizados):

| Modelo / configuracion | Errores por relato | Relatos sin errores |
|---|---:|---:|
| 257k, 30k pasos | 0,67–0,71 | 50–51% |
| Modelos mayores (11,5M–14,0M parámetros, mismos datos) | 0,67–0,73 | 50–57% |
| Este modelo, con el muestreo recomendado | 0,51–0,57 | 60% |

El autor concluye que, con este volumen de datos, aumentar el tamaño por encima de ~7M de parámetros no reduce los errores lógicos; sería más datos, no más tamaño, lo que ayudaría.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (7,16M parámetros ≈ 28,6 MB de pesos) y del orden de decenas de MB en int8; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, e incluso en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de CPUs; el cuello de botella no es la memoria sino la latencia de generación token a token.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documenta soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyErotica-7M | 7,16M | 256 tokens | 257.002 relatos sinteticos (config curated) | Apache 2.0 | Hugging Face |
| Variantes mayores del mismo autor (11,5M–14,0M) | 11,5M–14,0M | no disponible | mismos datos | no disponible | mencionadas en la model card, sin enlace directo |
| Literotica-Writer-26B-A4B | 26B totales, A4B (MoE) | no disponible | no disponible | no disponible | Hugging Face, ejecutable con llama.cpp |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada. El propio autor señala que, a igualdad de datos, los modelos de 11,5M a 14,0M parámetros no superan a este de 7M en errores lógicos por relato (0,67–0,73 frente a 0,51–0,57 con el muestreo recomendado).

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (18+): el modelo genera ficción sexual explícita y no debe usarse en productos accesibles a menores.
- Sesgos conocidos: no documentados explícitamente en la información disponible; el corpus es sintético y generado por un profesor, lo que puede introducir sesgos del modelo profesor y de los planes de historia.
- Riesgo de alucinación y errores de coherencia: con solo 7M de parámetros, los relatos son cortos y formulaicos; en escenas de tres personas a veces confunde quién hace qué (0,51–0,57 errores lógicos por relato con el muestreo recomendado).
- Limitación de contexto: 256 tokens, insuficiente para relatos largos o conversaciones multi-turno.
- Limitación de idioma: solo inglés; no hay capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido NSFW y los temas de fantasía oscura (no consentimiento, relaciones tabú entre adultos) pueden incumplir políticas de plataformas y legislaciones locales; el autor lo desaconseja para productos accesibles a menores.
- Caveat de producción: no soporta prompts ni instrucciones; cada generación es un relato nuevo desde el token separador, lo que limita su integración en aplicaciones conversacionales.
- El uso de repetition penalty fuerte degrada la coherencia de nombres (con 1,15, el 7% de los relatos cambia de nombre a mitad; con 1,08 y exención de 50 nombres, el 0%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/TinyErotica-7M
- Dataset TinyErotica/TinyErotica: https://huggingface.co/datasets/TinyErotica/TinyErotica
- Modelo relacionado Literotica-Writer-26B-A4B: https://huggingface.co/TinyErotica/Literotica-Writer-26B-A4B
