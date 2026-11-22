# yyuncong/pear-roboturn-full_v2_20261120

## Resumen

PEAR-roboturn-full_v2_20261120 es una colección de checkpoints de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.8-27B. El autor, yyuncong, aplica GRPO (Group Relative Policy Optimization) en un esquema totalmente asíncrono denominado PEAR sobre tareas simuladas de manipulación de sobremesa (roboturn). El resultado no es un modelo nuevo entrenado desde cero, sino una serie de instantáneas del proceso de optimización por refuerzo, publicadas cada 10 pasos de entrenamiento.

Cada checkpoint se distribuye con los pesos fusionados en bf16 junto con el tokenizador y el procesador del modelo base. El repositorio tiene un carácter marcadamente experimental y de investigación: cero descargas y cero interacciones en el momento de redactar esta ficha, sin licencia declarada ni idiomas especificados, y con una model card mínima que remite a los registros de entrenamiento alojados en un dataset aparte.

Su relevancia es acotada pero específica: sirve como referencia reproducible de un pipeline de RL asíncrono para robótica aplicado a un LLM grande, y permite a investigadores inspeccionar la evolución del comportamiento del modelo paso a paso durante el entrenamiento. No está pensado como artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.8-27B); no disponible el detalle específico |
| Parámetros totales | No disponible en la información proporcionada (el nombre del modelo base sugiere 27B, sin confirmación) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos publicados están en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (bf16), con tokenizador y procesador del modelo base incluidos |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer preentrenado del que no se detallan aquí capas, atención ni configuración de contexto. Sobre esa base se aplica un ajuste fino por refuerzo con GRPO, un algoritmo de optimización de política que estima la ventaja relativa dentro de grupos de respuestas en lugar de emplear un crítico separado. El autor lo ejecuta en un esquema "totalmente asíncrono" bautizado como PEAR, orientado a tareas de manipulación de sobremesa simuladas (roboturn).

El repositorio contiene checkpoints cada 10 pasos de entrenamiento: cada directorio `global_step_<N>/` incluye los pesos fusionados en bf16 listos para cargar con Hugging Face. No se especifican en la información disponible el volumen de tokens, la composición del dataset, el simulador empleado, la función de recompensa ni si hubo fases adicionales de SFT o DPO. Los registros de entrenamiento se publican por separado en el dataset `yyuncong/pear-roboturn-full_v2_20261120-logs`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen/Qwen3.8-27B, sin que la model card detalle capacidades concretas.
- Ajuste orientado a políticas de actuación en tareas simuladas de manipulación de sobremesa (roboturn), presumiblemente mediante salidas estructuradas o llamadas a herramientas del entorno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en RL para robótica: cargar distintos checkpoints `global_step_<N>` para estudiar cómo evoluciona la política del modelo a lo largo del entrenamiento GRPO y detectar puntos de colapso o mejora.
- Reproducción de pipelines asíncronos: usar los pesos y los logs publicados para contrastar el comportamiento de un esquema PEAR frente a GRPO síncrono en tareas de manipulación simulada.
- Análisis de estabilidad del entrenamiento: comparar checkpoints consecutivos (cada 10 pasos) para medir varianza de recompensa, divergencia de política y degradación del lenguaje base.
- Evaluación de olvido catastrófico: verificar en qué medida el ajuste RL sobre tareas de roboturn erosiona las capacidades generales del Qwen3.8-27B original.
- Punto de partida para ajustes posteriores: emplear un checkpoint intermedio como inicialización para nuevas rondas de RL o SFT en dominios robóticos relacionados.
- Docencia y divulgación: ilustrar con artefactos reales cómo se publica y versiona un experimento de RL sobre un LLM grande, incluida la separación entre pesos y logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de la escala sugerida por el nombre del base (27B) en bf16 harían falta del orden de 54 GB solo para pesos, más caché KV, aunque este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; con cuantización a 4 bits un modelo de esa escala podría aproximarse a los 24 GB, pero no hay datos del autor que lo respalden.
- Opciones de despliegue: al publicarse en formato Hugging Face con tokenizador y procesador, es compatible con cargadores estándar de Transformers; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PEAR-roboturn-full_v2_20261120 | No disponible (base Qwen3.8-27B) | No disponible | Checkpoints RL (GRPO asíncrono) para roboturn | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | No disponible en esta ficha | No disponible | LLM preentrenado generalista | No disponible | Hugging Face |
| Alternativas de RL para robótica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio experimental: son checkpoints intermedios de un entrenamiento RL, no un modelo final validado; el comportamiento puede ser inestable o degradado respecto al base.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; además, la licencia del modelo base Qwen/Qwen3.8-27B condiciona cualquier uso derivado.
- Idiomas no especificados: se desconoce si el ajuste RL ha alterado el soporte multilingüe del base.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre tareas simuladas puede incrementar la generación de acciones o texto no fundamentados fuera de ese dominio.
- Sesgos: no documentados por el autor.
- Contexto y cuantizaciones: sin datos, lo que impide planificar despliegues en producción.
- Trazabilidad limitada: la model card remite únicamente a los logs en un dataset aparte; no hay informe de evaluación ni métricas de recompensa publicadas en el repositorio.
- Idoneidad para producción: baja, dado el carácter de checkpoint intermedio y la ausencia de garantías de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/pear-roboturn-full_v2_20261120
- Logs de entrenamiento: https://huggingface.co/datasets/yyuncong/pear-roboturn-full_v2_20261120-logs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
