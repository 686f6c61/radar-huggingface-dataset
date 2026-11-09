# vtaua/resonance-gemma4-physics

## Resumen

Resonance: Gemma 4 E2B physics es un adaptador LoRA (entrenado con QLoRA sobre Unsloth) para el modelo base `unsloth/gemma-4-E2B-it`, desarrollado por el usuario vtaua (Victoria Tauanny). Su propósito es acotado y bien definido: responder preguntas de física en portugués estructurando cada respuesta en dos niveles, uno intuitivo ("Nível 1 — Intuição") y otro formal con derivaciones y ecuaciones en LaTeX ("Nível 2 — Formal"). No es un modelo nuevo, sino un ajuste fino ligero (rank 16) que impone un formato pedagógico concreto sobre las capacidades del modelo base.

La relevancia es la de un experimento de ajuste fino de bajo coste: se entrenó en una única GPU Tesla T4 con 330 pares pregunta/respuesta y 38 pasos de optimización, lo que lo convierte en un caso práctico de cómo un adaptador pequeño puede forzar estructura y estilo en un modelo de 2B parámetros efectivos. El repositorio pesa 0,3 GB y contiene únicamente los pesos del adaptador, no los del modelo base.

Es importante señalar que se trata de un artefacto de investigación educativa con escasa tracción (5 descargas, 0 likes) y con una evaluación limitada a 20 preguntas. La model card reconoce explícitamente que el modelo comete errores de física y que las respuestas de entrenamiento fueron generadas y revisadas automáticamente por un modelo mayor (`gemma-4-31b-it`), sin revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer `unsloth/gemma-4-E2B-it` |
| Parámetros totales | no disponible (el adaptador LoRA tiene rank 16, alpha 16; el repo pesa 0,3 GB) |
| Parámetros activos | no disponible (el modelo base se describe como "E2B", 2B efectivos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; el adaptador se distribuye en safetensors (se aplica sobre el base en la precisión que se elija) |
| Idiomas soportados | portugués (pt) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre las capas de atención y MLP del modelo de lenguaje del base, no sobre el codificador visual, pese a que el código de ejemplo carga el base con `AutoModelForImageTextToText`. El ajuste se realizó con QLoRA y Unsloth en una Tesla T4, con rank 16, alpha 16, 1,0 épocas, 38 pasos de optimizador (batch efectivo 8), learning rate 5e-5 con 2 pasos de warm-up y decaimiento coseno. La pérdida se calcula solo sobre las respuestas (183.778 tokens). Pérdida final de entrenamiento: 1,045; mejor pérdida de validación: 0,884.

Los datos de entrenamiento consisten en 330 pares pregunta/respuesta (297 de entrenamiento, 33 de validación; 243 provenientes de un temario de física y 87 de conceptos centrales de resúmenes recientes de arXiv). Las respuestas fueron generadas por `gemma-4-31b-it` y solo se conservaron si superaban comprobaciones automáticas de formato (presencia de ambos niveles, delimitadores LaTeX cerrados, ausencia de truncamiento). No se menciona RLHF ni DPO; el proceso es un SFT supervisado sobre respuestas filtradas.

## Capacidades

- Generación de texto conversacional en portugués con estructura fija de dos niveles (intuitivo y formal).
- Explicación de conceptos de física con analogías en el nivel 1 y derivaciones paso a paso con ecuaciones en LaTeX en el nivel 2.
- Corrección de premisas erróneas en la pregunta antes de responder (instruido en el system prompt).
- Formato LaTeX con delimitadores `$...$` y `$$...$$` cerrados de forma consistente.
- Hereda del base las capacidades multimodales (el código de ejemplo usa `AutoModelForImageTextToText`), aunque el adaptador se entrenó solo sobre las capas del modelo de lenguaje y no hay evidencia de que el ajuste preserve o mejore el comportamiento visual.
- No hay información sobre soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Tutoría de física en portugués: el modelo produce para cada pregunta una explicación intuitiva seguida de la derivación formal, lo que encaja en plataformas educativas que quieran mostrar ambos niveles al estudiante de forma automática.
- Generación de material didáctico estructurado: dado un temario de física, se pueden obtener apuntes con sección intuitiva y sección matemática en un formato uniforme, aprovechando que el adaptador impone esa plantilla de manera fiable (100% de respuestas con ambos niveles en la evaluación).
- Prototipado de asistentes educativos de bajo coste: al ser un adaptador de 0,3 GB sobre un base de 2B efectivos, se puede desplegar en hardware modesto (se entrenó en una T4) para validar producto antes de invertir en modelos mayores.
- Corrección de misconceptions: el system prompt instruye al modelo a corregir premisas erróneas antes de responder, útil en escenarios de evaluación formativa donde el alumno parte de una idea equivocada.
- Generación de ejercicios resueltos con LaTeX listo para renderizar: los delimitadores cerrados al 100% permiten insertar la salida directamente en pipelines de documentación (KaTeX, MathJax) sin post-procesado.
- Investigación sobre ajuste fino eficiente: sirve como caso reproducible (código y pipeline en GitHub) para estudiar cómo un LoRA de rank 16 con 38 pasos afecta al formato y la fidelidad factual de un modelo pequeño.
- Base para adaptadores multilingües: el pipeline y los prompts son reutilizables para crear variantes en otras lenguas partiendo de la misma receta.

## Benchmarks y rendimiento

Evaluación sobre 20 preguntas reservadas escritas a mano, con decodificación greedy y comparación entre el base (adaptador desactivado) y el ajustado (adaptador activo):

| Métrica | base | tuned |
|---|---|---|
| Respuestas que pasan todas las comprobaciones de formato | 90% | 100% |
| Ambos niveles presentes | 100% | 100% |
| Sin fugas de plantilla | 100% | 100% |
| Sin autopresentación | 100% | 100% |
| Delimitadores LaTeX cerrados | 100% | 100% |
| Termina antes del límite de tokens | 90% | 100% |
| Recuerdo de hechos clave | 80% | 85% |
| Nota del juez (1-5) | 3,30 | 3,20 |
| Longitud media (palabras) | 443 | 347 |

| Comparación por pares, por pregunta | tuned mejor | base mejor | empates | p (test de signos) |
|---|---|---|---|---|
| Recuerdo de hechos clave | 3 | 2 | 15 | 1,0 |
| Comprobaciones de formato superadas | 2 | 0 | 18 | 0,5 |
| Nota del juez | 6 | 6 | 8 | 1,0 |

El recuerdo de hechos clave solo comprueba si la ecuación central aparece en alguna de sus grafías habituales, no si la derivación es correcta. La nota del juez la otorga `gemma-4-31b-it` viendo la respuesta de referencia. Ninguna diferencia por pares es estadísticamente significativa.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB; el grueso de los requisitos lo determina el modelo base `unsloth/gemma-4-E2B-it`, cuyos pesos deben descargarse aparte.
- El entrenamiento se completó en una única Tesla T4, lo que indica que la inferencia en cuantización de 4 bits es viable en GPUs de gama media con 16 GB de VRAM.
- VRAM estimada para inferencia: no disponible de forma explícita; para un base de 2B efectivos, en fp16 rondaría los 5-6 GB y en 4 bits los 2-3 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM para fp16; consumer GPUs tipo RTX 3060/4060/4090 deberían ser suficientes en cuantización baja.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador; la integración con llama.cpp requeriría fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| resonance-gemma4-physics | LoRA sobre Gemma 4 E2B | no disponible (base ~2B efectivos) | no disponible | gemma | Hugging Face (5 descargas) |
| unsloth/gemma-4-E2B-it (base) | Modelo completo | ~2B efectivos | no disponible | gemma | Hugging Face |
| gemma-4-31b-it (generador de datos y juez) | Modelo completo | 31B | no disponible | gemma | Hugging Face |

No se han identificado en la información disponible otros adaptadores LoRA de tutoría de física en portugués con los que comparar directamente.

## Limitaciones y advertencias

- Un modelo de 2B efectivos comete errores de física incluso después del ajuste; el autor recomienda verificar cada derivación antes de confiar en ella.
- Las respuestas de entrenamiento fueron generadas por `gemma-4-31b-it` y filtradas y revisadas automáticamente por el mismo modelo, sin revisión humana: los errores del generador pueden haberse propagado al adaptador.
- La evaluación se basa en solo 20 preguntas, suficientes únicamente para detectar efectos grandes; ninguna de las diferencias por pares alcanza significación estadística.
- El modelo solo responde en portugués; no hay soporte documentado para otros idiomas.
- La nota del juez empeora ligeramente tras el ajuste (3,30 → 3,20) y las respuestas son más cortas (443 → 347 palabras), lo que puede implicar menor profundidad en las derivaciones.
- El adaptador depende de un system prompt concreto; usarlo con otro prompt puede degradar el formato de dos niveles.
- La licencia es la de Gemma (Gemma Terms of Use), con las restricciones de uso comercial y de redistribución que esta impone; debe revisarse antes de un despliegue en producción.
- El adaptador se entrenó solo sobre las capas del modelo de lenguaje; no hay evidencia de que las capacidades multimodales del base se mantengan intactas tras aplicar el LoRA.
- Riesgo de alucinación en ecuaciones y resultados numéricos: el recuerdo de hechos clave solo alcanza el 85% y no valida la corrección de la derivación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vtaua/resonance-gemma4-physics
- Perfil del autor: https://huggingface.co/vtaua
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Código, pipeline de datos y evaluación: https://github.com/victoriaT19/resonance-physics
