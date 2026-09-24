# Soulitude/Hush-Nano

## Resumen

Hush-Nano es un modelo de lenguaje pequeño (SLM) de tipo decoder-only desarrollado por el usuario Soulitude y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo base entrenado desde cero sobre un corpus de 8.554.042.292 tokens (8,5B), sin ajuste por instrucciones ni alineamiento conversacional, lo que lo sitúa como una pieza de investigación para el estudio de modelos de muy baja escala más que como un asistente listo para producción.

El modelo combina una arquitectura transformer estándar con varias decisiones de diseño modernas: RMSNorm, codificación posicional rotatoria (RoPE), activación SwiGLU, QK-Norm y embeddings de palabras atados (tied word embeddings). Cuenta con 12 capas, atención con Grouped-Query Attention (6 cabezas para Q y 3 para KV) y una longitud de contexto máxima configurada de 1.024 tokens. El recuento de parámetros reportado en la model card es de 22.621.056, aunque los metadatos de los pesos safetensors indican 22.752.128.

Su relevancia actual reside en que permite reproducir y evaluar el comportamiento de un modelo entrenado íntegramente desde cero con un presupuesto mínimo de parámetros, pero sobre una mezcla de datos cuidadosamente seleccionada (FineWeb-Edu, DCLM y FineMath4plus). Es un punto de partida habitual para experimentos de post-entrenamiento (SFT, RLHF, continued pretraining) en entornos con recursos muy limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con RMSNorm, RoPE, SwiGLU, QK-Norm y tied word embeddings |
| Parametros totales | 22.621.056 (model card) / 22.752.128 (metadatos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones oficiales; admite cuantizacion post-entrenamiento en fp16/int8/int4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Numero de capas | 12 |
| Cabezas de atencion | GQA: 6 para Q, 3 para KV |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Hush-Nano es un transformer decoder-only causal de 12 capas. Incorpora RMSNorm como normalizacion, RoPE como codificacion posicional, SwiGLU como funcion de activacion en las capas feed-forward y QK-Norm en la atencion. Emplea Grouped-Query Attention con 6 cabezas de consulta y 3 de clave/valor, y ata los embeddings de entrada y la proyeccion de salida (tied word embeddings) para reducir el numero de parametros. Esta combinacion es la habitual en SLM modernos (familia SmolLM, Qwen, etc.) y busca maximizar la calidad por parametro.

El entrenamiento consistio en una fase de preentrenamiento sobre 8.554.042.292 tokens extraidos de tres fuentes: FineWeb-Edu (4.539.286.619 tokens, 53,07%), DCLM (2.890.209.171 tokens, 33,79%) y FineMath4plus (1.124.546.502 tokens, 13,15%). La model card no documenta numero de pasos, tamano de batch, learning rate, ni si se aplicaron tecnicas de alineamiento posteriores (RLHF, DPO). El autor indica explicitamente que no se ha realizado ajuste por instrucciones.

## Capacidades

- Generacion de texto y continuacion de texto en inglés (modelo base, no conversacional).
- Razonamiento basico de sentido comun a escala muy reducida, reflejado en los resultados de PIQA, ARC y HellaSwag.
- Exposicion a contenido matematico y educativo por la presencia de FineMath4plus y FineWeb-Edu en el corpus.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni multi-step reasoning.
- Capacidades multilingues limitadas al inglés; no se documenta entrenamiento en otros idiomas.
- No tiene modo "thinking", vision ni audio.
- Pensado como base para post-entrenamiento (SFT, RLHF, continued pretraining) y no para uso directo en conversacion.

## Casos de uso

- Investigación en modelos de muy baja escala: sirve como referencia reproducible para estudiar curvas de escalado, comportamiento de la atencion y efectos de la mezcla de datos en modelos de ~22M de parámetros.
- Punto de partida para post-entrenamiento: aplicar SFT o DPO sobre Hush-Nano para obtener un asistente conversacional mínimo y desplegable en dispositivos con recursos muy limitados.
- Continuación de texto y autocompletado: dado un prompt corto, el modelo genera texto coherente en inglés, útil en ejercicios docentes sobre generación autoregresiva.
- Experimentación académica con `trust_remote_code`: al incluir código personalizado de Transformers, es útil para probar integraciones y flujos de carga de modelos no estándar.
- Benchmarking de infraestructura de inferencia: por su tamaño (≈90 MB en fp32), permite validar pipelines de vLLM, TGI o llama.cpp con tiempos de carga y latencias mínimas.
- Generación de datos sintéticos a pequeña escala: puede utilizarse para producir corpus de texto sintético que alimenten experimentos de filtrado o destilación.
- Prototipado educativo: sirve para demostrar el ciclo completo de un LM desde el preentrenamiento hasta la evaluación con `lm-evaluation-harness`.

## Benchmarks y rendimiento

Evaluación zero-shot con precisión normalizada, realizada en fp32 con EleutherAI/lm-evaluation-harness. El autor advierte de que los resultados pueden variar ligeramente según la configuración de evaluación.

| Benchmark | Hush-Nano |
|---|---|
| PIQA | 58,27% |
| ARC-Easy | 38,93% |
| ARC-Challenge | 21,84% |
| HellaSwag | 28,89% |

No se han publicado otros resultados de benchmarks en la información disponible (no hay MMLU, GSM8K, HumanEval ni comparativas cuantitativas con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 en torno a 90 MB de pesos (más activaciones y caché KV, insignificantes a 1.024 tokens); en fp16 unos 45 MB; en int8 unos 22 MB; en int4 unos 11 MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada. Funciona en CPU sin problema; en GPU basta una GTX 1050, RTX 3050 o superior.
- ¿Cabe en GPU de consumo? Sí, con margen enorme, en cualquier GPU de consumo con al menos 1 GB de VRAM (o incluso en GPU integrada).
- Opciones de despliegue: transformers con `trust_remote_code=True` (vía oficial y documentada). El uso con vLLM, TGI, llama.cpp u Ollama requeriría convertir los pesos al formato correspondiente, ya que no se publican GGUF ni conversiones oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dada la escala (22M de parámetros) se espera una latencia muy baja en cualquier hardware moderno, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables, por lo que la comparación se limita a características estructurales conocidas de SLM de escala similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks comparables |
|---|---|---|---|---|---|
| Soulitude/Hush-Nano | 22M | 1.024 | Apache 2.0 | safetensors | PIQA 58,27%, ARC-E 38,93%, ARC-C 21,84%, HellaSwag 28,89% |
| Pythia-70M (EleutherAI) | 70M | 2.048 | Apache 2.0 | safetensors | no disponible en esta ficha |
| SmolLM2-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | safetensors / GGUF | no disponible en esta ficha |

Las cifras de los modelos alternativos no se incluyen porque no forman parte de la información proporcionada; consultar sus respectivas model cards para obtener resultados verificados.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones conversacionales de forma fiable y el autor desaconseja su uso en diálogo.
- Riesgo elevado de alucinación y de incoherencia a partir de pocos cientos de tokens, propio de un modelo de 22M de parámetros.
- Contexto muy corto (1.024 tokens), insuficiente para tareas de documentación larga o RAG con muchas fuentes.
- Solo inglés; no se documenta ningún otro idioma, por lo que el rendimiento en castellano será deficiente.
- Sesgos heredados de FineWeb-Edu, DCLM y FineMath4plus; no se documenta ningún proceso de mitigación de sesgos.
- No se documentan pasos de RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido inapropiado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio del modelo; conviene revisarlo antes de usarlo en producción.
- Modelo con muy poca adopción en la comunidad (9 descargas y 0 likes en el momento de la consulta), sin garantías de mantenimiento.
- No apto para tareas de producción que requieran razonamiento complejo, código o matemáticas avanzadas.

## Enlaces

- HuggingFace: https://huggingface.co/Soulitude/Hush-Nano
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
