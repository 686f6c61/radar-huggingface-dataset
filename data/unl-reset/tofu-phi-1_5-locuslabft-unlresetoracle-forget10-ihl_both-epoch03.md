# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch03

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch03` es un checkpoint de Phi-1.5 publicado por el grupo `unl-reset` como artefacto de investigación sobre *machine unlearning*. No es un modelo de propósito general, sino un experimento controlado que parte del modelo base `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre el dataset TOFU) y le aplica una técnica de olvido selectivo denominada "IHL + Reset Both" sobre el subconjunto `forget10` del benchmark TOFU (Task of Fictitious Unlearning).

La arquitectura subyacente es la de Microsoft Phi-1.5, un transformer decoder-only de aproximadamente 1.418 millones de parámetros, entrenado originalmente para generación de texto y código. En este checkpoint concreto, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto a retener.

Su relevancia es estrictamente metodológica: sirve como referencia reproducible para evaluar hasta qué punto una técnica de unlearning elimina la información del conjunto `forget10` sin degradar el rendimiento sobre el conjunto `retain`. El checkpoint corresponde a la época 3 de 20 y se publica como modelo completo autónomo, con un manifiesto (`ihl_manifest.json`) que documenta la configuración del experimento. No está pensado para despliegue en producción ni para tareas conversacionales generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | No disponible; pesos en safetensors (FP16/BF16 presumiblemente, no confirmado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2.8 GB |
| Epoca del checkpoint | 3 de 20 |
| Conjunto de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1.418 millones de parámetros. La particularidad de este checkpoint es la inicialización híbrida: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de Phi-1.5 sobre el dataset TOFU.

El procedimiento de entrenamiento aplica una pérdida compuesta: una pérdida de *token IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning loss, según la nomenclatura del autor) sobre el conjunto `forget10`, sumada a una entropía cruzada estándar con peso 1.0 sobre el conjunto `retain`. El objetivo es doble: eliminar la capacidad de reproducir el contenido de forget10 y preservar el comportamiento sobre el conjunto retenido. El checkpoint publicado corresponde a la época 3 de un total de 20, lo que sugiere que el proceso de unlearning aún no ha convergido completamente. El repositorio incluye código personalizado (`custom_code`) y un manifiesto `ihl_manifest.json` con los detalles de la configuración.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de nivel educativo (capacidad nativa de Phi-1.5).
- Generación de código en Python y otros lenguajes, aunque degradada respecto al Phi-1.5 original por el ajuste sobre TOFU y el posterior unlearning.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo *thinking*, visión ni audio.
- Su función real es servir como artefacto de evaluación de unlearning, no como asistente conversacional.

## Casos de uso

- Evaluación de técnicas de machine unlearning: el modelo se usa como punto de comparación en experimentos TOFU para medir la eficacia de la técnica "IHL + Reset Both" frente a otros métodos de olvido sobre el mismo conjunto `forget10`.
- Reproducibilidad de investigación: al publicarse como checkpoint completo con manifiesto, permite a otros grupos replicar exactamente las condiciones de la época 3 y comparar métricas de forget/retain.
- Análisis de degradación de capacidades: sirve para estudiar cuánto rendimiento general (perplejidad, coherencia, código) se pierde al aplicar unlearning agresivo sobre un modelo pequeño como Phi-1.5.
- Estudio de la dinámica de reinicialización: al reinicializar embeddings y LM head desde el modelo original, permite analizar el efecto de esta estrategia sobre la retención de conocimiento frente a un reset completo o nulo.
- Benchmark de pipelines de evaluación TOFU: integrable en scripts que calculan métricas de forget quality, retain quality y verdad de modelo sobre el dataset TOFU.
- Docencia y formación: ejemplo práctico de cómo se construye y publica un checkpoint intermedio de un experimento de unlearning con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8-3 GB para los pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contextos moderados).
- En cuantización de 8 bits: alrededor de 1.5-2 GB de VRAM.
- En cuantización de 4 bits: alrededor de 1-1.5 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) sin problema, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas con 6 GB o más.
- Opciones de despliegue: al requerir `custom_code`, la carga mediante `transformers` con `trust_remote_code=True` es la vía directa; la conversión a GGUF para llama.cpp u Ollama no está documentada y podría requerir trabajo adicional por el código personalizado. vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1.4B) se espera un throughput alto en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch03 (este) | 1.418 M | No disponible | Apache 2.0 | Checkpoint de unlearning (TOFU forget10) |
| locuslab/tofu_ft_phi-1.5 | ~1.418 M | No disponible | No disponible en la informacion | Modelo base ajustado con TOFU, sin unlearning |
| microsoft/phi-1_5 | ~1.418 M | 2048 tokens | MIT (segun model card original) | Modelo de generacion de texto y codigo de proposito general |
| Otros checkpoints TOFU de Phi-1.5 | ~1.418 M | No disponible | Variable | Variantes de metodos de unlearning sobre el mismo base |

La comparación relevante es contra el modelo base `locuslab/tofu_ft_phi-1.5` (sin olvido) y contra `microsoft/phi-1_5` (modelo original). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación intermedio (época 3 de 20); no ha completado el proceso de unlearning y su comportamiento puede ser inestable o inconsistente.
- Riesgo elevado de alucinación y de reproducción de contenido del conjunto `forget10` si el unlearning no ha convergido; no debe usarse como garantía de olvido.
- Sesgos heredados de Phi-1.5 y del dataset TOFU, no evaluados ni mitigados en este checkpoint.
- Capacidad multilingüe limitada al inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El ajuste sobre TOFU (dataset de biografías ficticias) degrada las capacidades generales de generación de código y razonamiento respecto a Phi-1.5 original.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; conviene auditar el código antes de ejecutarlo en entornos de producción.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza experimental lo desaconseja para cualquier despliegue real.
- No apto para atención al cliente, generación de código en producción ni tareas de agente.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio del autor: no disponible en la informacion proporcionada
