# Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ4e-BF16-MLX

## Resumen

Flint 40B-A2.5B abliterated (oQ4e · BF16 · MLX) es una cuantización en precisión mixta, construida para Apple Silicon con la librería MLX, del modelo Flint, un mixture-of-experts (MoE) de 39,8 mil millones de parámetros con unos 2,5 mil millones activos por token, desarrollado originalmente por Recursive (RecursiveSI/flint) y del que dima6312 publicó una versión "abliterated" (sin restricciones de alineamiento). Esta variante, publicada por Studio-Research-M1, resuelve un problema concreto: ejecutar Flint de forma eficiente en Macs con memoria unificada, evitando los errores numéricos que provoca el rango de activaciones del modelo, que excede el rango de FP16.

Su relevancia radica en la combinación de tres factores: la eficiencia inferencial del MoE (solo 2,5B de parámetros activos), la eliminación de filtros de seguridad para usos de investigación, y una cuantización cuidadosa que mantiene escalas, sesgos y tensores no cuantizados en BF16, con cero posiciones no finitas en la evaluación sobre WikiText-2. En un Apple M1 Max alcanza unos 50 tokens/s en decodificación y 400-500 tokens/s en prefill, tan rápido como el build MLX INT4 oficial de Recursive.

El modelo es solo texto: no incorpora torre de visión ni cabeza de predicción multi-token (MTP). Existe una variante hermana de 8 bits (oQ8e, 42,3 GB) recomendada para Macs de 64 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), solo texto |
| Parametros totales | 39.785.299.488 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, precisión mixta con BF16 en escalas, sesgos y tensores no cuantizados); variante oQ8e disponible en repo aparte |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería MLX) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de tipo mixture-of-experts con 39,8B de parámetros totales y aproximadamente 2,5B activos por token. Según la model card, el modelo enruta entre 256 expertos, lo que según los autores del build domina el coste del enrutado durante la decodificación: por eso el build de 8 bits no es más lento que el de 4 bits en un M1 Max (49,7 frente a 48,2 tok/s a 1k de contexto), ya que la decodificación no está limitada por el ancho de banda de memoria. No dispone de cabeza de predicción multi-token ni de capacidades multimodales.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada. La versión "abliterated" de dima6312 parte del modelo base RecursiveSI/flint y aplica un proceso de remoción de las salvaguardas de alineamiento, lo que permite respuestas sin los filtros de seguridad habituales; este proceso no modifica la arquitectura subyacente.

La innovación principal de este repo concreto es el esquema de cuantización "oQ": dado que las activaciones de Flint exceden el rango de FP16, se mantiene BF16 en escalas, sesgos y tensores no cuantizados. El resultado es 0 posiciones no finitas de 32.768 evaluadas en WikiText-2, sin salidas degeneradas.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), en inglés según la model card.
- Respuestas sin las restricciones de alineamiento del modelo original (abliterated/uncensored), orientado a investigación y usos donde los filtros estándar resultan un obstáculo.
- Inferencia eficiente en hardware de consumo gracias a la dispersión MoE: solo ~2,5B de parámetros activos por token.
- Sin soporte de visión, audio ni predicción multi-token (MTP), según la model card.
- Soporte de tool calling, function calling y capacidades agenticas: no disponible (la model card menciona benchmarks agenticos como trabajo futuro, lo que sugiere que aún no están validados).
- Capacidades multilingues: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Experimentación local en Apple Silicon sin GPU dedicada: el modelo corre sobre MLX en Macs de 32-48 GB de memoria unificada a ~50 tok/s, ideal para desarrolladores que quieren un MoE grande sin infraestructura de servidor.
- Investigación en alineamiento y seguridad: al ser una versión abliterated, permite estudiar el comportamiento del modelo base sin capas de rechazo, útil para red-teaming y análisis de robustez.
- Chatbots y asistentes personales locales: la generación conversacional a ~50 tok/s en un portátil es suficiente para interacción fluida con privacidad total de los datos.
- Generación y procesamiento de texto en batch: el prefill de 400-500 tok/s permite procesar documentos de entrada con rapidez en tareas de resumen o análisis local.
- Evaluación de esquemas de cuantización: el par oQ4e/oQ8e con métricas KLD publicadas frente a FP32 sirve como banco de pruebas para estudiar el impacto de la cuantización en modelos MoE.
- Integración en aplicaciones macOS/iOS vía MLX: el formato safetensors de MLX facilita embeber el modelo en apps nativas del ecosistema Apple.
- Prototipado de agentes locales: la velocidad de decodificación y el bajo consumo de memoria activa permiten orquestar múltiples llamadas en cadena en una sola máquina, aunque sin validación oficial de capacidades agenticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son de calidad de cuantización y velocidad de inferencia:

| Métrica | Valor |
|---|---|
| Posiciones no finitas (WikiText-2, 32.768 posiciones) | 0 |
| KLD medio oQ8e vs FP32 | 0,077 (por debajo del suelo numérico BF16 del modelo: 0,088) |
| KLD medio oQ4e vs FP32 | 0,249 |
| Decodificación en M1 Max (contexto 1k) | 48,2 tok/s (oQ4e) / 49,7 tok/s (oQ8e) |
| Prefill en M1 Max | 400-500 tok/s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 23,4 GB; la model card recomienda Macs de 32-48 GB para esta variante oQ4e (la oQ8e necesita ~43 GB y requiere 64 GB o más).
- GPUs recomendadas: no disponible en términos de GPU NVIDIA; este build está pensado para Apple Silicon (probado en Apple M1 Max). Para otros entornos habría que recurrir al modelo base en otro formato.
- Consumer GPU: no aplica directamente; en su lugar, cabe en la memoria unificada de Macs de consumo con 32 GB o más (M1/M2/M3 Pro/Max). No cabe en GPUs de consumo típicas de 8-16 GB de VRAM.
- Despliegue: mediante la librería MLX (mlx-lm) en Apple Silicon. El soporte de vLLM, llama.cpp, Ollama o TGI para este build concreto no está disponible (el formato oQ/MLX no es GGUF).
- Latencia y throughput estimados: ~48-50 tok/s en decodificación y 400-500 tok/s en prefill en un M1 Max con contexto de 1k.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Flint 40B-A2.5B abliterated oQ4e (este) | 39,8B | ~2,5B | no disponible | MLX safetensors (oQ4e) | Apache 2.0 |
| Flint 40B-A2.5B abliterated oQ8e (hermano) | 39,8B | ~2,5B | no disponible | MLX safetensors (oQ8e, 42,3 GB) | Apache 2.0 |
| RecursiveSI/flint (base oficial) | 39,8B | ~2,5B | no disponible | MLX INT4 oficial y otros | no disponible |

La comparativa se limita a la propia familia Flint, ya que no hay información suficiente para comparar con otros MoE de tamaño similar (por ejemplo, Mixtral 8x7B u otros) en esta ficha sin inventar datos.

## Limitaciones y advertencias

- Versión abliterated: el modelo carece de las salvaguardas de seguridad del original. Esto implica mayor riesgo de generar contenido dañino, ilegal o sesgado. No es adecuado para entornos de producción orientados a usuarios finales sin controles externos.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto: no está publicada en la información disponible; no se puede garantizar rendimiento en contextos largos (los propios autores anuncian benchmarks de contexto largo como trabajo pendiente).
- Capacidades agenticas y de tool calling sin validar: los autores reconocen que faltan benchmarks agenticos.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos publicados que permitan cuantificarlo para este modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (RecursiveSI/flint), que no está disponible en la información proporcionada.
- Ecosistema cerrado a Apple Silicon: el formato oQ/MLX no es compatible con las pilas habituales de despliegue (vLLM, TGI, llama.cpp) según la información disponible.
- Cuantización 4-bit: la oQ4e presenta un KLD de 0,249 frente a FP32, notablemente superior al de la oQ8e (0,077), lo que puede traducirse en cierta degradación de calidad respecto al modelo original.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ4e-BF16-MLX
- Variante oQ8e: https://huggingface.co/Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ8e-BF16-MLX
- Colección completa: https://huggingface.co/collections/Studio-Research-M1/flint-40b-a25b-abliterated-oq-mlx-apple-silicon-6ae62b348b6c1d4e2ed3e758
- Modelo base abliterated: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Modelo original de Recursive: https://huggingface.co/RecursiveSI/flint
