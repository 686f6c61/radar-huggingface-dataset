# squatter198/Phi-3.5-mini-instruct

## Resumen

Phi-3.5-mini-instruct es un modelo de lenguaje de tipo transformer decoder-only denso de 3.821.079.552 parámetros (aproximadamente 3,8 B) desarrollado originalmente por Microsoft Research como parte de la familia Phi-3. Esta ficha corresponde a la réplica publicada por el usuario `squatter198` en Hugging Face, que reproduce los pesos y la model card del repositorio oficial `microsoft/Phi-3.5-mini-instruct` bajo licencia MIT.

El modelo está diseñado para escenarios con restricciones de memoria y cómputo, y para casos donde la latencia es crítica, manteniendo un enfoque en razonamiento denso (especialmente código, matemáticas y lógica). Soporta una longitud de contexto de 128 000 tokens y capacidades multilingües, lo que lo sitúa en una franja poco habitual: prestaciones de razonamiento cercanas a modelos de 7-9 B con un coste de inferencia notablemente menor.

Su relevancia actual radica en que es una opción viable para despliegue en una única GPU de consumo, con licencia MIT (permisiva para uso comercial) y compatibilidad con el ecosistema `transformers`, `text-generation-inference` y cuantizaciones de la comunidad. Esta réplica concreta, sin embargo, acumula 0 descargas y 0 likes, por lo que para producción conviene referenciar el repositorio oficial de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-3, tipo `phi3` en transformers) |
| Parametros totales | 3.821.079.552 (3,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica pesos en safetensors (7,6 GB) |
| Idiomas soportados | Multilingue (sin listado cerrado de idiomas en la informacion disponible) |
| Licencia | MIT (con enlace a la licencia del repositorio oficial de Microsoft) |
| Formato de pesos | safetensors (libreria transformers, `custom_code` por la arquitectura `phi3`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de 3,8 B de parámetros, encuadrado en la familia Phi-3 y expuesto en transformers mediante la arquitectura `phi3` (requiere `trust_remote_code` por el tag `custom_code`). El modelo parte de los datasets empleados en Phi-3: datos sintéticos y contenido web público filtrado, con énfasis en datos de alta calidad y densidad de razonamiento. Según la model card, soporta 128K tokens de contexto.

El post-entrenamiento combinó tres fases: ajuste supervisado (SFT), optimización de política proximal (PPO) y optimización directa de preferencias (DPO), orientadas a mejorar la adherencia a instrucciones y las salvaguardas. Esta versión 3.5 incorpora datos adicionales de post-entrenamiento respecto a la Phi-3 Mini de junio de 2024, con mejoras declaradas en calidad de conversación multi-turno, capacidades multilingües y razonamiento. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni la configuración de capas y cabezas de atención.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en formato chat (mensajes con roles `user`/`assistant`).
- Razonamiento intensivo en código, matemáticas y lógica, según la declaración de usos previstos de la model card.
- Ventana de contexto de 128 000 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües: la model card reporta resultados en MMLU multilingüe, MMLU-Pro multilingüe, MGSM y tareas MEGA (MLQA, TyDi QA, UDPOS, XCOPA, XStoryCloze).
- Integración con el ecosistema Hugging Face: `transformers`, `text-generation-inference` y endpoints compatibles.
- No se documentan en la información disponible capacidades de visión, audio, tool calling nativo ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistentes conversacionales en producción con requisitos de baja latencia: con 3,8 B de parámetros, el modelo puede servirse en una sola GPU y mantener conversaciones multi-turno apoyándose en su ventana de 128K tokens para conservar historial extenso.
- Generación y revisión de código en pipelines de CI/CD: su énfasis declarado en código y lógica lo hace apto para tareas de autocompletado, generación de tests o explicación de diffs, con un coste por token bajo.
- Procesamiento de documentos largos en una sola pasada: contratos, informes o expedientes de hasta 128K tokens para extracción de datos, resumen o respuesta a preguntas sobre el documento.
- Atención al cliente multilingüe: la model card reporta mejoras en calidad multilingüe y multi-turno, útil para sistemas de soporte con usuarios en varios idiomas.
- Tutoría y resolución de problemas matemáticos paso a paso: los resultados en MGSM (47,9) lo sitúan como opción razonable para asistentes educativos con coste contenido.
- Procesamiento por lotes en entornos con recursos limitados: clasificación, etiquetado y resumen masivo en clústeres modestos o en una GPU de consumo, donde modelos de 7-9 B no caben con comodidad.
- Prototipado e investigación en entornos de una sola GPU: la licencia MIT y el tamaño reducido facilitan experimentación y evaluación comparativa sin costes de licencia.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo (evaluación multilingüe). No se han publicado en la información disponible resultados de MMLU en inglés, HumanEval ni GSM8K.

| Benchmark | Phi-3.5 Mini-Ins | Phi-3.0-Mini-128k-Instruct (junio 2024) | Mistral-7B-Instruct-v0.3 | Llama-3.1-8B-Ins | Gemma-2-9B-Ins | GPT-4o-mini-2024-07-18 (Chat) |
|---|---|---|---|---|---|---|
| Multilingual MMLU | 55,4 | 51,08 | 47,4 | 56,2 | 63,8 | 72,9 |
| Multilingual MMLU-Pro | 30,9 | 30,21 | 15,0 | 21,4 | 43,0 | 53,2 |
| MGSM | 47,9 | 41,56 | 31,8 | 56,7 | 75,1 | 81,7 |
| MEGA MLQA | 61,7 | 55,5 | 43,9 | 45,2 | 54,4 | 70,0 |
| MEGA TyDi QA | 62,2 | 55,9 | 54,0 | 54,5 | 65,6 | 81,8 |
| MEGA UDPOS | 46,5 | 48,1 | 57,2 | 54,1 | 56,6 | 66,0 |
| MEGA XCOPA | 63,1 | 62,4 | 58,8 | 21,1 | 31,2 | 90,3 |
| MEGA XStoryCloze | 73,5 | 73,6 | 75,5 | 71,0 | 87,0 | 96,6 |

Lectura de los datos: el modelo supera a Phi-3.0 Mini en casi todas las tareas multilingües reportadas (MMLU multilingüe +4,3 puntos, MGSM +6,3), queda por debajo de Mistral-Nemo-12B, Gemma-2-9B y GPT-4o-mini en la mayoría de métricas, y presenta un resultado atípicamente alto en MEGA XCOPA (63,1) frente a Llama-3.1-8B (21,1) y Gemma-2-9B (31,2). La model card no incluye Mistral-Nemo-12B en esta tabla concreta, pero sí lo reporta en la comparativa original.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: unos 7,6 GB solo para pesos, más caché KV; en la práctica, 10-12 GB para contexto moderado. Con contexto cercano a 128K la caché KV crece de forma significativa y puede requerir bastante más memoria.
- VRAM estimada en INT8: 4-5 GB para pesos, en torno a 6-8 GB con contexto moderado.
- VRAM estimada en INT4 (GGUF Q4_K_M): 2,3-2,5 GB para pesos, en torno a 4-6 GB con contexto moderado.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 permiten FP16 con margen; tarjetas de 8 GB requieren cuantización INT4/INT8 o contextos reducidos.
- GPU de datacenter: A100 40/80 GB, H100 y L40S para despliegues de alto throughput con contexto largo y batching agresivo.
- Opciones de despliegue: `transformers` (con `trust_remote_code`), `text-generation-inference` (el repo incluye el tag `text-generation-inference`), vLLM, llama.cpp u Ollama previa conversión a GGUF, y ONNX Runtime mediante la variante oficial `microsoft/Phi-3.5-mini-instruct-onnx`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingual MMLU | MGSM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phi-3.5-mini-instruct (esta ficha) | 3,8 B | 128K | 55,4 | 47,9 | MIT | Hugging Face (original de Microsoft y esta replica) |
| Phi-3.0-Mini-128k-Instruct | no disponible en la informacion | no disponible en la informacion | 51,08 | 41,56 | no disponible en la informacion | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7 B (segun denominacion) | no disponible en la informacion | 47,4 | 31,8 | no disponible en la informacion | Hugging Face |
| Llama-3.1-8B-Instruct | 8 B (segun denominacion) | no disponible en la informacion | 56,2 | 56,7 | no disponible en la informacion | Hugging Face |
| Gemma-2-9B-Instruct | 9 B (segun denominacion) | no disponible en la informacion | 63,8 | 75,1 | no disponible en la informacion | Hugging Face |

El eje diferencial de Phi-3.5-mini es la relación entre tamaño y rendimiento: con 3,8 B se aproxima a modelos de 7-9 B en MMLU multilingüe y supera claramente a Mistral-7B-Instruct-v0.3 en MMLU-Pro multilingüe (30,9 frente a 15,0), aunque queda por detrás en MGSM y en varias tareas MEGA. Frente a Llama-3.1-8B, la diferencia en MMLU multilingüe es de menos de un punto a favor de Llama, con un coste de inferencia aproximadamente la mitad en pesos. El contexto de 128K es su ventaja más clara frente a alternativas de tamaño similar que no lo documentan en esta comparativa.

## Limitaciones y advertencias

- Es una réplica no oficial publicada por un tercero (`squatter198`) con 0 descargas y 0 likes; no hay garantía de equivalencia bit a bit con los pesos oficiales ni de mantenimiento. Para producción, usar `microsoft/Phi-3.5-mini-instruct`.
- Riesgo de alucinación: como cualquier LLM de su tamaño, puede generar afirmaciones plausibles pero incorrectas, especialmente en tareas de conocimiento factual extenso. La model card recomienda evaluar y mitigar precisión, seguridad y equidad antes de usos de alto riesgo.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgo; los datos de entrenamiento incluyen web pública filtrada y datos sintéticos, con los sesgos que ello implica.
- Contexto e idioma: aunque declara 128K tokens y soporte multilingüe, la calidad efectiva en contextos muy largos y en idiomas distintos del inglés no está cuantificada en la información proporcionada, y el rendimiento multilingüe está por debajo de modelos de mayor tamaño (por ejemplo, Gemma-2-9B: 63,8 en MMLU multilingüe frente a 55,4).
- Uso comercial: la licencia MIT del repositorio y el enlace a la licencia del modelo oficial permiten uso comercial, pero conviene verificar los términos del repositorio de Microsoft y las obligaciones de atribución.
- No se documentan en la información disponible soporte nativo de tool calling, agentes multi-paso, visión o audio; no deben asumirse en diseño de producto.
- Configuración: al usar la arquitectura `phi3` con código remoto (`custom_code`), es necesario `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes en entornos sensibles.
- Requiere `transformers` relativamente reciente para cargar correctamente la arquitectura `phi3`.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/squatter198/Phi-3.5-mini-instruct
- Modelo oficial: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Licencia oficial: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/resolve/main/LICENSE
- Variante ONNX: https://huggingface.co/microsoft/Phi-3.5-mini-instruct-onnx
- Variante MoE: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Variante visión: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Phi-4 mini: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Phi-4 multimodal: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Portal Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Blog tecnico Phi-3.5: https://aka.ms/phi3.5-techblog
- Informe tecnico Phi-3: https://arxiv.org/abs/2404.14219
- Referencias arXiv adicionales incluidas en los tags del repositorio: https://arxiv.org/abs/2407.13833 y https://arxiv.org/abs/2403.06412
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo: https://aka.ms/try-phi3.5mini
