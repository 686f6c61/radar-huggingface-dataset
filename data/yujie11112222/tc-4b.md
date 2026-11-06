# yujie11112222/tc-4b

## Resumen

tc-4b es un ajuste fino por LoRA del modelo torchcast-ai/torchcast-decision-4b v1.3.1, que a su vez deriva de Qwen3.5-4B. Lo publica el usuario yujie11112222 en Hugging Face y está orientado a la toma de decisiones estructurada, evaluada mediante el conjunto JevBench. El entrenamiento consistió en 49 pasos de optimizador con LoRA (r=32, alpha=64, lr 1e-4) sobre aproximadamente 94.000 filas admitidas de una muestra estratificada de DecisionBank-260k, filtrada por licencia, con los pesos fusionados en el resultado final.

El modelo resuelve el problema de producir distribuciones de probabilidad calibradas sobre opciones de decisión, en lugar de limitarse a la respuesta argmax. Según la model card, las ganancias respecto al modelo base se concentran en la calidad de la distribución y en la distancia al valor esperado del tipo de pregunta de puntuación, no en la precisión de la opción más probable.

Es relevante ahora porque introduce una interfaz de inferencia no estándar: las capas de atención completa son no causales, de modo que runtimes causales genéricos como vLLM o llama.cpp no reproducen el comportamiento evaluado. El paquete `torchcast_decision/` y el archivo `decision_config.json` son necesarios para servir el modelo correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con capas de atención completa no causal; ajuste LoRA fusionado |
| Parametros totales | 5.174.964.736 (5,17 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B a través del checkpoint intermedio torchcast-decision-4b v1.3.1. La arquitectura es un transformer con una particularidad relevante para el despliegue: las capas de atención completa son no causales, lo que permite atender a toda la secuencia en lugar de solo al prefijo. Sobre esa base se aplicó un ajuste LoRA con rango 32, alpha 64 y tasa de aprendizaje 1e-4 durante 49 pasos de optimizador, tras lo cual los pesos del adaptador se fusionaron en el modelo final.

Los datos de entrenamiento provienen de DecisionBank-260k: se muestrearon 100.000 filas bajo una lista blanca de licencias (apache, mit, bsd, cc-by, cc0, unlicense, dominio público) y se admitieron aproximadamente 94.000. La model card indica explícitamente que no se usaron elementos del split público de JevBench. El repositorio incluye un `merge_manifest.json` con los SHA-256 por archivo de la fusión, lo que permite verificar la integridad del resultado.

## Capacidades

- Generación de texto conversacional en formato image-text-to-text, según el pipeline declarado.
- Toma de decisiones estructurada: produce distribuciones de probabilidad sobre opciones, evaluadas con el scorer v1.6 de JevBench.
- Calibración de respuestas: la mejora declarada se centra en la calidad de la distribución y en la distancia al valor esperado.
- Procesamiento de entradas de imagen y texto combinadas (pipeline image-text-to-text).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio especial: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de decisiones con incertidumbre: el modelo devuelve una distribución sobre opciones en lugar de una única respuesta, lo que permite a un sistema aguas abajo ponderar alternativas según su probabilidad estimada.
- Puntuación y ranking de alternativas: en un pipeline de selección de candidatos, se puede usar la distribución de salida para ordenar opciones y calcular el valor esperado de cada una.
- Investigación sobre calibración: sirve como punto de comparación frente al modelo base v1.3.1 para estudiar cómo el ajuste LoRA afecta a la calibración sin alterar la precisión argmax.
- Análisis de decisiones con contexto multimodal: al aceptar entradas de imagen y texto, puede aplicarse a escenarios donde la decisión depende de información visual junto a instrucciones textuales.
- Reproducción de experimentos JevBench: el paquete `torchcast_decision/` y el `decision_config.json` permiten replicar la interfaz evaluada con los 231 elementos públicos de referencia.
- Integración en sistemas de soporte a la decisión: requiere desplegar el runtime específico del modelo base, por lo que encaja en entornos controlados donde se pueda instalar el paquete incluido en lugar de usar servidores de inferencia genéricos.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre los 231 elementos públicos de JevBench con el scorer v1.6:

| Metrica | tc-4b (step-49) | Base v1.3.1 |
|---|---|---|
| Intelligence | 79,81 | 74,93 |
| Calibration | 91,26 | 87,82 |
| Capability | 85,54 | 81,37 |

La model card señala que las ganancias se concentran en el tipo de pregunta de puntuación (calidad de la distribución y distancia al valor esperado), no en la precisión argmax. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 10,3 GB solo para pesos, más overhead de activaciones y caché; el repositorio ocupa 10,4 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5,2 GB para pesos; en 4 bits, alrededor de 2,6 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100) en precisión completa.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: el autor indica que vLLM y llama.cpp no reproducen la interfaz evaluada debido a la atención no causal. Es necesario usar el paquete `torchcast_decision/` incluido y seguir las instrucciones de servicio del modelo base v1.3.1.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tc-4b | 5,17 mil millones | no disponible | Decisión con distribución calibrada, atención no causal | Apache 2.0 | Hugging Face (yujie11112222/tc-4b) |
| torchcast-decision-4b v1.3.1 | no disponible | no disponible | Decisión con distribución calibrada | Apache 2.0 | Hugging Face (torchcast-ai) |
| Qwen3.5-4B | no disponible | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face (Alibaba Cloud) |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La atención no causal implica que runtimes causales estándar (vLLM, llama.cpp) no reproducen el comportamiento evaluado; el despliegue exige el paquete `torchcast_decision/` y el `decision_config.json`.
- Las ganancias declaradas se miden con el scorer v1.6 sobre el split público de JevBench; el modelo se entrenó sin esos elementos, pero la evaluación procede del propio autor y no de un tercero independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Torchcast AI y a Alibaba Cloud indicada en `NOTICE` y en los archivos de licencia del paquete incluido.
- El modelo hereda las limitaciones del ajuste LoRA de solo 49 pasos: la mejora es incremental y no cambia la naturaleza del modelo base.
- No hay información sobre idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujie11112222/tc-4b
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Instrucciones de servicio del modelo base v1.3.1: https://github.com/Torchcast-AI/torchcast-decision-4b/tree/v1.3.1#run-for-evaluation
- Qwen3.5-4B (modelo original): no disponible en la información proporcionada
- Paper o blog de JevBench: no disponible en la información proporcionada
- Repositorio de DecisionBank: no disponible en la información proporcionada
