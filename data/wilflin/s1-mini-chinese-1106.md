# WIlfLin/S1-mini-Chinese-1106

## Resumen
S1-mini-Chinese-1106 es un ajuste fino completo de S1-mini (Superwhisper), un modelo de 751.632.384 parámetros (aproximadamente 7,52 × 10^8) construido sobre la arquitectura Qwen3-0.6B. No es un modelo de reconocimiento de voz ni un asistente generalista: es un postprocesador de texto especializado en limpiar y normalizar transcripciones de Qwen3-ASR en chino y en mezcla chino-inglés. Su función es convertir el habla transcrita en texto legible: eliminar muletillas y repeticiones, aplicar formato de listas numeradas y párrafos, normalizar números y ortografía, y preservar nombres propios chinos.

El modelo resuelve un problema concreto de los pipelines de ASR: la salida cruda del reconocedor contiene disfluencias, números mal escritos, deletreos inconsistentes y falta de estructura. S1-mini-Chinese-1106 aprende estas convenciones mediante un ajuste fino supervisado de todos los parámetros (no LoRA) sobre datos chinos de CS2W y datos ingleses de corrección de Disfl-QA, además de datos sintéticos propios y asistidos por modelo. La versión 1106 corresponde al checkpoint final BF16 del ciclo nativo-v10.

Es relevante para desarrolladores que despliegan Qwen3-ASR en producción en entornos chinos o bilingües, porque permite delegar la normalización en un modelo pequeño (1,5 GB de repositorio) que cabe en GPUs de consumo y que se sirve con Transformers o vLLM. Su licencia deriva de Apache-2.0 con cláusulas adicionales de atribución, y los pesos se distribuyen en safetensors BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3-0.6B (modelo base: superwhisper/s1-mini) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repositorio; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | chino (zh) e inglés (en), incluida mezcla de código chino-inglés |
| Licencia | s1-mini-license (basada en Apache-2.0 con cláusula de conservación de nombre y atribución) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen3, concretamente la variante de 0,6 mil millones de parámetros, sobre la que Superwhisper construyó S1-mini y que WIlfLin ha ajustado de forma completa. No es un modelo MoE ni híbrido SSM: es un transformer denso con atención estándar. El ajuste es de todos los parámetros (full fine-tuning), no LoRA ni descongelación de las últimas capas, con parámetros maestros y optimizador en FP32 y autocast BF16; los pesos exportados son BF16.

El entrenamiento parte de una fase china previa y añade currículos de repetición de capacidades originales, contextos de deletreo, matemáticas y fidelidad de campos. Las fuentes declaradas son CS2W (datos chinos de conversación, CC-BY-SA-4.0), Disfl-QA (correcciones inglesas, CC-BY-4.0) y datos sintéticos propios y asistidos por modelo; las anotaciones sintéticas se verificaron mediante programas, lo que no equivale a anotación humana independiente ni a pruebas con voz natural. Las etapas finales fueron: v8.2 (currículo integral, 21.240 muestras, 1.328 pasos, LR 2e-6), v9 (corrección de errores y repetición, 26.886 muestras, paso 900 seleccionado, LR 1e-6) y v10 (refinamiento de fidelidad de campos, 3.104 muestras, 194 pasos, LR 5e-7). La etapa final incluye 1.494 muestras nuevas de campos y 1.610 de repetición, con 12 supervisiones de salida vacía. La pérdida se calcula solo sobre la salida objetivo y EOS. El modelo base está fijado en superwhisper/s1-mini@88f6b15896c73bbb13a3b596e0afe8ea0d5150b4.

## Capacidades
- Normalización de transcripciones de ASR: eliminación de muletillas, repeticiones y fragmentos incompletos, manteniendo el contenido original.
- Formato automático de párrafos, saltos de línea y listas numeradas sin reglas externas de formato.
- Normalización numérica: ceros internos en números, cero minutos en horas, y preservación de nombres propios chinos.
- Normalización ortográfica inglesa: unión de letras deletreadas, guiones entre letras, mayúsculas en contextos de escritura y deletreo fonético tras palabras de pronunciación similar.
- Transcripción matemática básica en chino e inglés con los operadores `+`, `-`, `*`, `/`, `^`, `=`; no genera LaTeX y no calcula ni corrige respuestas dictadas.
- Manejo de negaciones, correcciones sobre la marcha (改口) y segmentos incompletos.
- Capacidad de devolver cadena vacía cuando la entrada solo contiene muletillas.
- No responde preguntas, órdenes ni citas del texto de entrada: todo se trata como material a limpiar.
- No es un reconocedor de audio ni un asistente conversacional general.

## Casos de uso
- Postprocesado de pipelines Qwen3-ASR en producción: el modelo se coloca después del reconocedor para limpiar la salida cruda antes de almacenarla o mostrarla, eliminando muletillas y aplicando formato de listas y párrafos.
- Normalización de actas de reuniones en chino: a partir de transcripciones multi-turno, genera párrafos y listas numeradas de acuerdos, preservando nombres de personas y cifras mencionadas.
- Dictado de notas con mezcla chino-inglés: unifica deletreos ingleses intercalados en frases chinas, aplica mayúsculas y guiones según el contexto de escritura.
- Transcripción de operaciones matemáticas dictadas: convierte expresiones habladas en notación con `+`, `-`, `*`, `/`, `^`, `=` sin introducir LaTeX ni alterar el resultado dictado.
- Limpieza de subtítulos y transcripciones para publicación: elimina repeticiones y fragmentos incompletos, manteniendo el contenido semántico y aplicando estilo semiformales.
- Integración en servicios de voz a texto con vLLM: el modelo se sirve en BF16 con Transformers o vLLM 0.23.0 y puede procesar por lotes; el autor documenta una verificación de servicio en Orin con vLLM 0.23.0, BF16 y secuencia única.
- Preprocesado de datasets de voz para entrenamiento: normaliza transcripciones antes de usarlas como etiquetas en pipelines de ASR, con detección explícita de truncamiento en la aplicación.

## Benchmarks y rendimiento
Resultados publicados por el autor, obtenidos con Transformers, BF16, decodificación greedy, batch 16 y máximo 256 tokens generados, sin validación externa de contenido:

| Conjunto de regresión de desarrollo | Coincidencia léxica de frase completa | Coincidencia estricta de frase completa |
|---|---:|---:|
| Capacidades base | 46/48 | 42/48 |
| Formato de listas y números | 20/20 | 19/20 |
| Preservación de nombres chinos | 60/60 | 60/60 |
| Contextos de deletreo | 318/326 | 318/326 |
| Fidelidad de deletreo de palabras inventadas | 197/200 | 197/200 |
| Transcripción matemática básica | 235/236 | 235/236 |
| Conjunto de desarrollo de revisiones | 81/94 | 80/94 |
| Conjunto de diagnóstico de revisiones | 74/97 | 73/97 |
| Regresión de texto de fuentes públicas | 232/400 | 118/400 |

La tasa de error de caracteres léxicos en la regresión de texto público es del 9,3685 %. La coincidencia léxica elimina caracteres no alfanuméricos y conserva mayúsculas y números; la coincidencia estricta conserva puntuación y espacios internos. El autor advierte que estos conjuntos se usaron repetidamente durante el desarrollo y no son una prueba ciega independiente. El 60/60 en nombres no implica que cualquier nombre sea correcto. Respecto al paso 900 de v9, esta versión mejora los nombres, pero la puntuación total del conjunto de diagnóstico de 97 casos disminuye. El BF16 es sensible al backend, la precisión y la forma del lote: la frase `501+3=504` se generó erróneamente como `5001+3=504` en un lote de 16, mientras que la generación individual y la comparación en FP32 fueron correctas; en el conjunto de diagnóstico de 97 casos, la generación individual BF16 y el lote 16 FP32 obtuvieron ambos 75/97 en coincidencia estricta. No se recalcularon para los pesos actuales el 94,8 % de precisión de tokens que atribuye el modelo upstream, por lo que no debe considerarse reproducido.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 751.632.384 parámetros en BF16, los pesos ocupan aproximadamente 1,5 GB, a lo que hay que sumar memoria para el contexto y activaciones.
- GPU recomendadas: no disponible; el autor documenta una verificación de servicio en Orin con vLLM 0.23.0, BF16 y secuencia única.
- GPU de consumo: por el tamaño de pesos (~1,5 GB en BF16), es plausible en GPUs de consumo con suficiente VRAM, pero no se documenta oficialmente qué modelos concretos se han probado.
- Opciones de despliegue: Transformers (ejemplo oficial con AutoModelForCausalLM y AutoTokenizer), vLLM 0.23.0 (verificado en Orin), text-generation-inference (etiqueta endpoints_compatible) y llama.cpp/Ollama no documentados oficialmente.
- Latencia y throughput: no disponible; el único dato de servicio es la verificación en Orin con vLLM 0.23.0 en secuencia única, sin métricas de latencia o throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| S1-mini-Chinese-1106 (este modelo) | 751.632.384 | no disponible | Regresión de desarrollo: 46/48 base, 318/326 deletreo, 235/236 matemáticas | s1-mini-license (Apache-2.0 + atribución) | Hugging Face, safetensors BF16 |
| superwhisper/s1-mini (modelo base) | no disponible | no disponible | El autor cita 94,8 % de precisión de tokens, no recalculado para estos pesos | s1-mini-license | Hugging Face |
| Qwen3-0.6B (arquitectura subyacente) | ~0,6 mil millones | no disponible | Modelo generalista de la familia Qwen3 | Apache-2.0 (según familia Qwen3) | Hugging Face |

No se dispone de datos de benchmarks comparables de otros postprocesadores de transcripción chinos en la información proporcionada.

## Limitaciones y advertencias
- Es un postprocesador de texto, no un reconocedor de audio ni un asistente general; no debe usarse para responder preguntas ni ejecutar órdenes.
- Los objetivos de entrenamiento no son garantías: algunos contextos de listas, palabras técnicas, números y correcciones de largo alcance siguen fallando.
- El BF16 es sensible al backend, la precisión y la forma del lote; el autor documenta un error numérico en lote 16 que no aparece en generación individual ni en FP32.
- Los conjuntos de evaluación se reutilizaron durante el desarrollo y no constituyen una prueba ciega independiente; la coincidencia de referencia no equivale a corrección semántica humana.
- Respecto a v9 paso 900, esta versión mejora los nombres pero empeora la puntuación total del conjunto de diagnóstico de 97 casos; no puede afirmarse que todas las capacidades mejoren.
- La licencia s1-mini-license obliga a conservar el nombre original y la atribución de Superwhisper; no puede omitirse esa cláusula. Los datos CS2W (CC-BY-SA-4.0) y Disfl-QA (CC-BY-4.0) tienen sus propias condiciones.
- El modelo no incluye reglas previas de deletreo ni filtros de protección de contenido; el llamante debe gestionar tiempos de espera, truncamiento de generación y envío de texto.
- Los saltos de línea generados no garantizan que un método de entrada no active la tecla de envío.
- Riesgo de alucinación en la normalización: el modelo puede alterar contenido al limpiar, por lo que se recomienda validación posterior en producción.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106
- Perfil del autor: https://huggingface.co/WIlfLin/models
- Modelo base S1-mini: https://huggingface.co/superwhisper/s1-mini
- Repositorio CS2W: https://github.com/guozishan/CS2W
- Repositorio Disfl-QA: https://github.com/google-research-datasets/Disfl-QA
- Ficheros de procedencia citados en el repositorio: training-provenance.json, data-provenance.json, evaluation-summary.json, LICENSE, NOTICE (disponibles en la raíz del repositorio de Hugging Face)
