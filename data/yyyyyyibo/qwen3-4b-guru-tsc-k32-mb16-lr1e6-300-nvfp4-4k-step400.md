# YYYYYYibo/qwen3-4b-guru-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step400

## Resumen

qwen3-4b-guru-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step400 es un checkpoint intermedio (paso 400) de un ajuste fino por aprendizaje por refuerzo sobre Qwen3-4B-Base, publicado por el usuario YYYYYYibo en Hugging Face. El entrenamiento se ha realizado con la librería verl, empleando un pipeline de RL orientado a matemáticas (etiqueta `guru-RL math`) con rollouts generados mediante vLLM en cuantización NVFP4 y una ventana de contexto de 4K tokens. El nombre del run codifica los hiperparámetros: `k32` (probablemente 32 rollouts por prompt), `mb16` (micro-batch de 16), `lr1e6` (tasa de aprendizaje 1e-6) y `300` (posiblemente 300 pasos totales planificados).

El modelo conserva la arquitectura de Qwen3-4B-Base con 4.022.468.096 parámetros totales, pero los pesos publicados son los del actor en precisión completa (master weights del checkpoint FSDP de verl), no los pesos cuantizados usados durante los rollouts. El repositorio ocupa 8,1 GB en formato safetensors y es compatible con transformers y text-generation-inference.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación que documenta un experimento de RL con una técnica denominada "TSC with ratio gate", sin model card extensa, sin licencia declarada y sin resultados de benchmarks publicados. Es útil para quienes quieran reproducir o inspeccionar el efecto del RL matemático sobre Qwen3-4B, pero no es un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens (según nombre del run y model card) |
| Tipos de cuantizacion | no disponible en los pesos publicados; los rollouts de entrenamiento usaron NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplica un ajuste fino por aprendizaje por refuerzo con verl, usando un esquema denominado "TSC with ratio gate" (el acrónimo TSC no se desarrolla en la model card). Los rollouts durante el entrenamiento se generaron con vLLM en cuantización NVFP4, lo que sugiere un pipeline de RL con generación cuantizada para acelerar el muestreo y pesos maestros en precisión completa para la actualización.

El checkpoint corresponde al paso 400 de entrenamiento y se exportó desde el actor FSDP de verl, conservando los pesos maestros en precisión completa y descartando el estado del optimizador. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset matemático, ni si hubo fases adicionales de SFT, DPO o RLHF más allá del RL descrito. Tampoco se detalla la innovación técnica del "ratio gate" ni su efecto medido.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada de la base Qwen3-4B.
- Razonamiento matemático reforzado mediante RL, orientado a problemas de tipo competición o demostración.
- Generación de código y razonamiento general, en la medida en que la base Qwen3-4B los soporta (no verificado en este checkpoint).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en RL para matemáticas: usar el checkpoint como punto de comparación frente a Qwen3-4B-Base para medir el efecto del entrenamiento con verl y la técnica TSC sobre tareas de razonamiento matemático.
- Reproducción de experimentos: servir el modelo con transformers o TGI y evaluar con un conjunto propio de problemas matemáticos para validar la reproducibilidad del run.
- Generación de soluciones paso a paso en entornos educativos controlados: el modelo puede producir cadenas de razonamiento matemático, aunque requiere revisión humana por el riesgo de alucinación.
- Base para ajuste fino posterior: al ser un checkpoint intermedio con pesos en precisión completa, sirve como inicialización para nuevos experimentos de RL o SFT.
- Evaluación de pipelines de cuantización: comparar el comportamiento del actor en FP y en NVFP4 permite estudiar la degradación introducida por la cuantización en los rollouts.
- Análisis de estabilidad del entrenamiento: el paso 400 permite inspeccionar la evolución del modelo frente a checkpoints anteriores o posteriores del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de KV cache; en la práctica, 10-12 GB para contextos de 4K.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para despliegues en FP16; RTX 3090/4080 o superiores para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) sin problema en FP16, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), vLLM (usado en el entrenamiento), llama.cpp/Ollama si se generan GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-guru-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step400 | 4.022 M | 4K | RL matemático con verl (paso 400) | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B-Base | ~4.000 M | 32K (según especificación de Qwen3) | Preentrenamiento | Apache 2.0 (según Qwen3) | Hugging Face, ampliamente usado |
| Qwen3-4B (instruct) | ~4.000 M | 32K (según especificación de Qwen3) | SFT + RLHF | Apache 2.0 (según Qwen3) | Hugging Face, ampliamente usado |

La comparación se limita a la familia de origen porque no se dispone de datos de rendimiento de este checkpoint ni de alternativas directamente equivalentes en el mismo régimen de RL matemático con verl. Los datos de contexto y licencia de Qwen3 se indican como referencia de la base, no como especificación verificada de este checkpoint.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Checkpoint intermedio (paso 400): no es un modelo final; puede presentar inestabilidad, repeticiones o degradación respecto a la base o a un checkpoint posterior.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en matemáticas ni de regresión en otras capacidades.
- Riesgo de alucinación: inherente a los modelos de 4B y acentuado en dominios matemáticos si el RL no se ha validado; requiere verificación de resultados.
- Contexto limitado a 4K tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no declarados: no se garantiza un comportamiento multilingüe adecuado.
- Sin información sobre sesgos: no se han documentado evaluaciones de sesgo, toxicidad o seguridad.
- Procedencia del entrenamiento opaca: la técnica "TSC with ratio gate" no está descrita en la model card, lo que dificulta la reproducibilidad.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene tratarlo como artefacto de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-4b-guru-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step400
- Repositorio de verl (framework de RL usado): no disponible en la información proporcionada
- Paper o blog de la técnica TSC with ratio gate: no disponible
- Modelo base Qwen3-4B-Base: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible
