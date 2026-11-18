# Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Quality es una cuantización de 8 bits del checkpoint Qwen3.8-27B (27.356.723.952 parámetros) empaquetada por el usuario Youssofal para MTPLX, un runtime de decodificación especulativa con predicción multi-token (MTP) nativo sobre Apple Silicon. El modelo no introduce pesos nuevos: es un artefacto de distribución que preserva la cabeza MTP del modelo original y mantiene en 16 bits las partes sensibles (kernels de convolución GDN, estado recurrente, normalizaciones y toda la cabeza MTP), mientras cuantiza a 8 bits con grupos de 64 pesos el resto de matrices. Su propósito es ejecutar Qwen 3.8 27B en un Mac con fidelidad casi bf16 y velocidades superiores a 40 tok/s.

La relevancia de esta ficha es doble. Por un lado, documenta una práctica creciente: la publicación de artefactos de inferencia específicos de hardware (MLX, Apple Silicon) en lugar de pesos genéricos. Por otro, cuantifica el compromiso calidad/velocidad con métricas concretas: el autor reporta un 99,3 % de acuerdo top-1 y una divergencia KL de 0,0005 frente al checkpoint bf16, medidos sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe.

El contexto declarado es de 262.144 tokens, el peso descargable es de 29,4 GB y el pico de memoria unificada medido es de 32,7 GB, lo que exige un Mac con 36 GB o más. La licencia del artefacto es Apache 2.0, heredada del modelo base. No se dispone de información sobre idiomas soportados en los metadatos de Hugging Face ni en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8 con cabeza MTP y capas GDN (según referencias del autor a kernels de convolución GDN); detalles completos del modelo base no disponibles |
| Parametros totales | 27.356.723.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits dinámica con grupos de 64 pesos; componentes sensibles en 16 bits (kernels GDN, estado recurrente, normas, cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx); configuración adicional en `mtplx_runtime.json` |

Datos adicionales del artefacto: tamaño del repositorio 30,8 GB, descarga declarada 29,4 GB, pico de memoria unificada medido 32,7 GB, profundidad MTP 3, 3.683 descargas y 71 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo: es una cuantización del checkpoint Qwen/Qwen3.8-27B. La model card menciona que el modelo base emplea capas GDN (cuyos kernels de convolución y parámetros de estado recurrente se conservan en 16 bits por su sensibilidad numérica) y una cabeza de predicción multi-token (MTP) que se mantiene íntegra en 16 bits para que MTPLX pueda generar borradores y verificarlos en una sola pasada. El resto de matrices de pesos se cuantiza a 8 bits con grupos de 64 pesos, lo que sitúa el artefacto como la variante de mayor fidelidad de las tres publicadas por el autor (frente a Optimized Speed, de 4 bits, y Bare Speed).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento. La innovación técnica destacable no está en los pesos sino en el runtime: MTPLX aplica decodificación especulativa exacta, aceptando borradores mediante la regla de razón de probabilidades más remuestreo residual, de modo que la salida sigue la distribución del modelo a cualquier temperatura. El autor reporta aceptación de borradores por profundidad de 0,96, 0,88 y 0,79 en una tarea de código, con un coste de verificación de 63,5 ms por ronda, y una mejora del 19,9 % de profundidad 3 sobre profundidad 2 en razonamiento largo.

## Capacidades

- Generación de texto conversacional y de código: el autor etiqueta el artefacto explícitamente para coding y lo prueba con tareas de reescritura de ficheros y generación desde cero.
- Razonamiento con niveles de esfuerzo configurables: la model card indica que funcionan los niveles xhigh, medium y low, y que el "thinking preservado" fluye por la ruta MTP.
- Razonamiento de contexto largo: se reportan respuestas de 34.000 y 46.000 tokens en modo xhigh, dentro de una ventana de 262.144 tokens.
- Decodificación especulativa exacta: los borradores se aceptan con regla de razón de probabilidades y remuestreo residual, por lo que la distribución de salida se mantiene a cualquier temperatura.
- Generación de JSON y prosa técnica: el conjunto de evaluación de calidad incluye JSON, código, prosa y un aviso multilingüe.
- Integración con herramientas de desarrollo: las etiquetas mencionan opencode y claude-code, aunque la model card no detalla el mecanismo de integración.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el modo de razonamiento largo y la integración con editores de código son indicios, pero no se documenta un bucle de agente.
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Asistencia de código en local sobre MacBook Pro: con 48,3 tok/s en una tarea de código con razonamiento medio dentro de la app MTPLX, el modelo es adecuado para autocompletado, refactorización y revisión de parches sin enviar código a servicios externos, lo que resulta relevante en entornos con requisitos de confidencialidad.
- Reescritura y mantenimiento de ficheros existentes: el autor mide 87,6 tok/s en la variante Optimized Speed reescribiendo un fichero que acaba de escribir; con esta variante de 8 bits, el caso encaja en tareas de edición iterativa donde la fidelidad al modelo original importa más que la velocidad punta.
- Razonamiento largo con salidas extensas: con respuestas de 34.000 y 46.000 tokens a 33,2 y 33,1 tok/s en modo xhigh, sirve para análisis de documentos técnicos, auditorías de código o generación de especificaciones extensas dentro de la ventana de 262.144 tokens.
- Generación estructurada de JSON: el conjunto de evaluación de calidad incluye JSON, y la preservación de la distribución original reduce el riesgo de formatos inválidos en pipelines que consumen la salida de forma programática.
- Sustitución local de APIs en flujos de desarrollo: la mención a opencode y claude-code sugiere su uso como backend local para asistentes de terminal o IDE, evitando costes por token y dependencia de red.
- Prototipado e investigación en decodificación especulativa: al conservar la cabeza MTP en 16 bits y publicar métricas de aceptación por profundidad, el artefacto es útil para estudiar el equilibrio entre profundidad de borrador, coste de verificación y throughput.
- Evaluación de cuantizaciones: con 99,3 % de acuerdo top-1 y KL 0,0005 frente a bf16, sirve como referencia de "cuantización casi sin pérdida" para comparar esquemas de 4 y 8 bits en tareas de código y prosa.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un MacBook Pro M5 Max, ventiladores al máximo, un solo flujo, muestreo oficial de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20):

| Prueba | tok/s | Runtime |
|---|---|---|
| Tarea de código, razonamiento medio, app MTPLX | 48,3 | MTPLX 2.11.3 |
| Razonamiento largo xhigh, respuesta de 34k tokens | 33,2 | MTPLX 2.11.3 |
| Razonamiento largo xhigh, respuesta de 46k tokens | 33,1 | MTPLX 2.11.3 |
| Optimized Speed reescribiendo fichero propio (referencia) | 87,6 | MTPLX 2.10.0 |
| Bare Speed en tarea de código nueva (referencia) | 65,2 | MTPLX 2.7.0 |
| Optimized Speed en respuesta de chat de 3k tokens (referencia) | 64,3 | MTPLX 2.10.0 |

Calidad frente al checkpoint bf16 de Qwen3.8-27B, evaluada con teacher forcing sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe (16 de septiembre de 2026):

| Variante | Acuerdo top-1 | KL |
|---|---|---|
| Optimized Quality (8 bits dinámica) | 99,3 % | 0,0005 |
| Optimized Speed (4 bits dinámica) | 96,0 % | 0,012 |

El autor indica además una KL de 0,00105 en su batería de código, 21 veces más cercana que Optimized Speed y 36 veces más que Bare Speed. En exactitud, mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta simple dentro del propio ruido de esta última. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada: 36 GB o más para esta variante; el autor indica 32 GB como mínimo para la familia y 36 GB específicamente para Optimized Quality. Pico medido: 32,7 GB.
- Espacio en disco: 29,4 GB de descarga (repositorio de 30,8 GB).
- GPU recomendadas: Apple Silicon de la familia M1 a M5 (MacBook Pro, MacBook Air, Mac mini y Mac Studio). Las mediciones se hicieron en un M5 Max. En M1 o M2 el autor recomienda la variante FP16 de este mismo modelo.
- Cabe en GPU de consumo: sí, en el sentido de Apple Silicon con memoria unificada suficiente; no se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: MTPLX, mediante la app de Mac o la CLI (`pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 48,3 tok/s en código con razonamiento medio; 33,2 y 33,1 tok/s en razonamiento xhigh con salidas de 34k y 46k tokens; coste de verificación de 63,5 ms por ronda; aceptación de borradores por profundidad de 0,96, 0,88 y 0,79.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Calidad vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Quality (este) | 27,36 B | 262.144 | 8 bits dinámica, grupos de 64 | 99,3 % top-1, KL 0,0005 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized-Speed | 27,36 B (base) | 262.144 (base) | 4 bits dinámica | 96,0 % top-1, KL 0,012 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Bare-Speed | 27,36 B (base) | 262.144 (base) | no disponible | KL 0,00105 en batería de código (36 veces peor que este) | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen/Qwen3.8-27B (bf16) | 27,36 B | 262.144 | bf16 | referencia | Apache 2.0 (según artefacto derivado) | Hugging Face |

Los tres artefactos MTPLX comparten modelo base y ventana de contexto; la diferencia está en el esquema de cuantización y en el compromiso velocidad/fidelidad. No se dispone de datos para comparar con modelos de otros autores y tamaños similares.

## Limitaciones y advertencias

- Dependencia de hardware y runtime: el artefacto está empaquetado para MTPLX sobre Apple Silicon; no se documenta su uso con vLLM, llama.cpp, Ollama, TGI ni con GPU NVIDIA o AMD.
- Requisito de memoria elevado para el segmento: 36 GB de memoria unificada, con un pico medido de 32,7 GB, deja poco margen para otras aplicaciones en máquinas de 36 GB.
- Rendimiento medido en un único equipo: todas las cifras provienen de un MacBook Pro M5 Max con ventiladores al máximo; el rendimiento en M1, M2 o M3 será inferior, y el autor recomienda la variante FP16 en M1 y M2.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-27B, que no se documentan en la model card.
- Riesgo de alucinación: no cuantificado. La evaluación de calidad mide fidelidad a la distribución bf16, no veracidad factual.
- Idiomas: no se especifican los idiomas soportados; la evaluación de calidad incluye un "aviso multilingüe" sin detallar qué lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto deriva de Qwen3.8-27B y conviene verificar las condiciones del modelo base y de los datos con los que fue entrenado antes de desplegarlo en producción.
- Ausencia de benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, lo que impide comparar su calidad absoluta con otros modelos de 27B.
- Métricas autoinformadas: las cifras de velocidad y calidad las publica el autor del artefacto y del runtime, sin verificación independiente en la información disponible.
- Tool calling y uso agéntico: no se documentan de forma explícita, pese a las etiquetas que mencionan opencode y claude-code.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Optimized Speed (4 bits): https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Variante Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed
- Variante FP16 para M1 y M2: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16
- Sitio de MTPLX: https://mtplx.com
- Benchmarks de MTPLX: https://mtplx.com/benchmarks/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 27B en Mac: https://mtplx.com/models/qwen3.8-27b/
- Comparativa MTPLX vs mlx-serve: https://mtplx.com/compare/mtplx-vs-mlx-serve/
- Comparativa MTPLX vs oMLX: https://mtplx.com/compare/mtplx-vs-omlx/
- Comparativa MTPLX vs LM Studio: https://mtplx.com/compare/mtplx-vs-lm-studio/
- Comparativa MTPLX vs Ollama: https://mtplx.com/compare/mtplx-vs-ollama/
