# vanshnarula/gigpo-qwen2.5-1.5b-alfworld-weighted-seed0

## Resumen
GiGPO weighted Qwen2.5-1.5B-Instruct es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario vanshnarula en Hugging Face. El modelo está especializado en tareas de agente dentro del entorno ALFWorld, un benchmark de razonamiento y ejecución de acciones en un mundo textual simulado. Se trata de un checkpoint del paso 150 de un entrenamiento con la técnica GiGPO (una variante de optimización por preferencias o refuerzo, según el repositorio del experimento), con semilla 0 y un peso tau de 1,17512.

El interés de esta ficha es doble: por un lado, documenta un artefacto de investigación reproducible (con enlace al repositorio de experimentos) y, por otro, sirve como ejemplo de adaptación de un modelo pequeño (1.500 millones de parámetros) a tareas de agente con un porcentaje de éxito declarado del 88,3 % en la partición de validación del split "seen" de ALFWorld. No obstante, conviene subrayar que ese resultado se ha medido con la misma partición usada durante el entrenamiento, por lo que no debe interpretarse como una medida de generalización.

Al estar basado en Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only de Qwen2.5, su ventana de contexto y su licencia Apache 2.0. El repositorio ocupa 3,1 GB y contiene pesos en safetensors en precisión BF16. No se han publicado datos sobre idiomas soportados ni sobre benchmarks generales más allá del resultado de ALFWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajustado con GiGPO |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos BF16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1.543.714.304 parámetros. Sobre esa base se aplica un ajuste fino con GiGPO (según el repositorio del experimento, una técnica de optimización con pesos), entrenado sobre el entorno ALFWorld. El checkpoint publicado corresponde al paso 150, semilla 0, con un valor tau de 1,17512. La exportación se realizó en BF16 safetensors a partir de la revisión base 989aa7980e4cf806f80c7fef2b1adb7bc71aa306.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. El único dato de rendimiento declarado es un 88,3 % de éxito en validación sobre el split "seen" de ALFWorld, es decir, la partición vista durante el entrenamiento. Esta circunstancia limita la interpretación del resultado como indicador de capacidad general.

## Capacidades
- Generación de texto conversacional, heredada de Qwen2.5-1.5B-Instruct.
- Ejecución de tareas de agente en entornos textuales tipo ALFWorld: interpretación de observaciones, selección de acciones y razonamiento multi-paso.
- Razonamiento secuencial orientado a objetivos dentro de un mundo simulado.
- Soporte de formato conversacional (pipeline `text-generation`, `conversational`).
- Compatibilidad con `text-generation-inference` y endpoints, según las etiquetas del repositorio.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Tool calling, function calling, visión, audio o modo "thinking": no disponibles en la información proporcionada.

## Casos de uso
- Investigación en agentes basados en lenguaje: el modelo sirve como referencia reproducible para estudiar GiGPO en ALFWorld, con semilla y checkpoint documentados, lo que facilita la comparación entre ejecuciones.
- Evaluación de técnicas de refuerzo u optimización con preferencias: al ser un checkpoint intermedio (paso 150), permite analizar la evolución del entrenamiento y el efecto del peso tau.
- Baseline para experimentos de agentes en entornos textuales: su tamaño (1.500 millones de parámetros) permite iterar rápido en una sola GPU consumer.
- Prototipado de asistentes que ejecutan acciones paso a paso en dominios simulados (por ejemplo, tareas domésticas textuales), antes de escalar a modelos mayores.
- Reproducción de resultados académicos: el enlace al repositorio del experimento y la semilla fija permiten replicar el entrenamiento y la validación.
- Docencia y divulgación: ejemplo práctico de ajuste fino de un modelo pequeño para tareas de agente, con licencia permisiva Apache 2.0.

## Benchmarks y rendimiento
El único dato publicado en la información disponible es el siguiente:

| Benchmark | Metrica | Resultado | Nota |
|---|---|---|---|
| ALFWorld (split seen, validación) | Tasa de éxito | 88,3 % | Medido en la partición vista durante el entrenamiento; no es una medida de generalización |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB (estimaciones, no verificadas en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para cuantización, cabe en GPUs de 4-6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más en BF16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| GiGPO Qwen2.5-1.5B-Instruct (este) | 1.543.714.304 | no disponible | Apache 2.0 | Agente en ALFWorld (fine-tuning) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500 millones (aprox.) | no disponible en esta ficha | Apache 2.0 | Instrucciones generales | Hugging Face |
| Qwen2.5-1.5B (base) | 1.500 millones (aprox.) | no disponible en esta ficha | Apache 2.0 | Modelo base | Hugging Face |

La comparación se limita al modelo base y su variante instruct, ya que no se dispone de datos de otros modelos ajustados específicamente para ALFWorld en la información proporcionada. No se dispone de cifras de rendimiento comparables para el modelo base en ALFWorld.

## Limitaciones y advertencias
- El 88,3 % de éxito se ha medido en el split "seen" de ALFWorld, es decir, con datos vistos durante el entrenamiento; no refleja generalización a entornos nuevos.
- No se han publicado evaluaciones en benchmarks generales, por lo que se desconoce si el ajuste fino ha degradado capacidades conversacionales o de razonamiento general.
- No se especifican los idiomas soportados; se desconoce si el ajuste con ALFWorld (en inglés) ha afectado al rendimiento en castellano.
- Riesgo de alucinación inherente a los modelos de 1.500 millones de parámetros; no se han publicado evaluaciones específicas de fidelidad.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo está pensado como artefacto de investigación; no se han documentado pruebas en producción.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no hay evidencia de uso comunitario ni de validación independiente.
- El checkpoint es intermedio (paso 150) y no necesariamente el óptimo; el autor no publica curvas de entrenamiento en la model card.

## Enlaces
- Hugging Face: https://huggingface.co/vanshnarula/gigpo-qwen2.5-1.5b-alfworld-weighted-seed0
- Repositorio del experimento: https://github.com/secureswim/gigpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
