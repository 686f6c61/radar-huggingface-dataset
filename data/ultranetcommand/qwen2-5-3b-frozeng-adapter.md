# UltranetCommand/Qwen2.5-3B-FrozenG-Adapter

## Resumen

El modelo `UltranetCommand/Qwen2.5-3B-FrozenG-Adapter` es un adaptador experimental desarrollado por UltranetCommand sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Su principal innovación consiste en integrar un tensor métrico positivo-definido congelado (denominado "Frozen-G") en las proyecciones query-key de todas las capas de self-attention, con el objetivo de estabilizar el consumo energético durante la generación de texto y reducir la deriva entrópica en estado estacionario (NESS). El adaptador está diseñado para entornos con restricciones de potencia, como GPUs con límites de TDP, y reporta un consumo de 70 W en una NVIDIA T4 con una eficiencia de 4,22 J/token y una latencia de 60,3 ms/token.

El modelo mantiene la arquitectura transformer densa del base (36 capas, 3.086 millones de parámetros) y se distribuye bajo licencia Apache 2.0. Aunque no se han publicado benchmarks estándar (MMLU, HumanEval, etc.), las métricas de eficiencia energética son el principal atractivo. Al ser un adaptador sobre Qwen2.5-3B-Instruct, hereda las capacidades de generación de texto, chat, razonamiento y código del modelo original, aunque no se ha verificado si la modificación de atención afecta a la calidad de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 36 capas de self-attention con métrica congelada en proyecciones Q-K |
| Parametros totales | 3.086.528.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado del base, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado del base, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-3B-Instruct`, un modelo transformer denso de 3B parámetros con 36 capas, preentrenado con 18 billones de tokens según el reporte técnico de Qwen2.5. La modificación principal del adaptador es la inserción de un tensor métrico congelado \( G \in [0.1, 1.0] \) en las proyecciones query-key de cada capa de self-attention. Este tensor impone una geometría invariante que limita la deriva de entropía no equilibrada (NESS) durante la generación, evitando el "parameter thrashing" y estabilizando el consumo energético en contextos largos.

No se ha publicado información sobre el proceso de entrenamiento del adaptador: ni el dataset utilizado, ni el método (fine-tuning, RLHF, etc.), ni el número de pasos. La model card solo indica que se han parcheado los 36 bloques de atención y que el modelo está diseñado para eficiencia energética. Tampoco se especifica si se realizó algún ajuste adicional sobre el modelo base.

## Capacidades

- Generación de texto y chat conversacional, heredadas del modelo base Qwen2.5-3B-Instruct.
- Razonamiento, matemáticas y generación de código, propias de la familia Qwen2.5.
- Soporte de instrucciones y seguimiento de prompts en formato chat.
- Eficiencia energética: consumo de 70 W en NVIDIA T4, 4,22 J/token y 60,3 ms/token (medido por el autor).
- No se ha confirmado soporte de tool calling, function calling, agentes o capacidades multimodales en el adaptador.
- No se ha verificado el comportamiento multilingüe del adaptador, aunque el modelo base soporta múltiples idiomas.

## Casos de uso

- Despliegue en entornos con restricciones de potencia: el adaptador está diseñado para operar bajo un TDP estricto (70 W en T4), lo que lo hace adecuado para centros de datos con límites energéticos o para inferencia en edge.
- Inferencia de bajo consumo en GPUs de gama media: al ser un modelo de 3B, puede ejecutarse en GPUs con 8-16 GB de VRAM, y su bajo consumo permite su uso en tarjetas como T4 o RTX 4000.
- Chatbots y asistentes conversacionales: hereda las capacidades de chat del modelo base, por lo que puede integrarse en aplicaciones de atención al cliente o asistentes virtuales.
- Generación de texto en producción con requisitos de eficiencia: su bajo coste energético por token lo hace interesante para servicios que procesan grandes volúmenes de texto con presupuestos energéticos ajustados.
- Investigación en arquitecturas de atención con métricas congeladas: el adaptador sirve como referencia para estudiar el impacto de restricciones geométricas en la estabilidad de la generación y el consumo energético.
- Prototipado de sistemas de IA sostenibles: puede utilizarse como base para experimentos sobre eficiencia energética en LLMs, comparando su consumo con modelos estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona métricas de eficiencia energética medidas en una NVIDIA T4:

| Metrica | Valor |
|---|---|
| Consumo de inferencia | 70 W (sub-TDP) |
| Eficiencia energética | 4,22104 J/token |
| Latencia | 60,3 ms/token |

Estas métricas no son comparables con benchmarks de calidad, por lo que no se puede evaluar el rendimiento del modelo en tareas estándar.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B parámetros en FP16 se requieren aproximadamente 6 GB de VRAM, más overhead de activaciones y atención. Con cuantización a 8 bits o 4 bits, podría reducirse a 3-4 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: el autor ha probado el modelo en NVIDIA T4 (16 GB VRAM). Por su tamaño, también debería ejecutarse en GPUs consumer como RTX 3060, RTX 4060, RTX 4070, o en GPUs de datacenter como A10, L4, etc.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 8 GB de VRAM para FP16 o se aplique cuantización.
- Opciones de despliegue: el modelo es compatible con la librería transformers y con text-generation-inference (TGI) según los tags. También podría usarse con vLLM o llama.cpp si se convierte a GGUF, aunque no se ha confirmado.
- Latencia y throughput: el autor reporta 60,3 ms/token en T4, lo que equivale a aproximadamente 16,6 tokens/segundo. No se han proporcionado datos de throughput en batch.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y otras alternativas de 3B parámetros, aunque no se dispone de datos de rendimiento del adaptador en benchmarks estándar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-FrozenG-Adapter | 3.086 M | no disponible | Apache 2.0 | Adaptador con métrica congelada, enfocado en eficiencia energética |
| Qwen2.5-3B-Instruct (base) | 3.086 M | 32.768 tokens | Apache 2.0 | Modelo original sin modificación, con benchmarks publicados |
| Llama-3.2-3B-Instruct | 3.210 M | 128.000 tokens | Llama 3.2 Community License | Modelo de Meta, con licencia comercial permitida |
| Phi-3.5-mini-instruct | 3.820 M | 128.000 tokens | MIT | Modelo de Microsoft, con licencia permisiva |

El adaptador no aporta mejoras de calidad sobre el base (no hay benchmarks), pero su ventaja potencial es el menor consumo energético. Sin embargo, no se ha verificado si la modificación degrada la calidad de generación.

## Limitaciones y advertencias

- Modelo experimental: no se han publicado evaluaciones de calidad en tareas estándar, por lo que su rendimiento real es desconocido.
- La modificación de atención puede afectar negativamente a la coherencia o precisión de las respuestas, aunque no se ha evaluado.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados específicos del adaptador.
- El contexto máximo no está confirmado; se asume que hereda los 32.768 tokens del modelo base, pero no se ha verificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no cuenta con garantías de soporte ni mantenimiento.
- Las métricas de eficiencia energética fueron medidas por el autor en un entorno específico (T4) y pueden variar en otros hardware o configuraciones.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en entornos con poca VRAM requerirá conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/UltranetCommand/Qwen2.5-3B-FrozenG-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Technical report de Qwen2.5: https://arxiv.org/abs/2412.15115
