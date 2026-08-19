# tianxia2/CQ3-Qwen3-4B-K8-Channel-FP8-AWq

## Resumen

CQ3-Qwen3-4B-K8-Channel-FP8-AWq es un checkpoint cuantizado del modelo Qwen3-4B, generado mediante el pipeline CodeQuant3. Aplica codebooks de pesos por canal (K=8) con centroides en FP16 e índices de 3 bits, junto con cuantización de activaciones en FP8 E4M3 durante la inferencia. El modelo está pensado como un checkpoint fijo de pesos y activaciones (A/W) para estudiar esquemas de error en la cuantización de la caché KV paginada, un área clave para reducir la memoria y acelerar la inferencia en modelos de lenguaje grandes.

Desarrollado por el usuario tianxia2, el modelo se publica bajo licencia Apache-2.0 y se distribuye en formato safetensors. Con 4.411.424.256 parámetros, el checkpoint ocupa 8,8 GB en el repositorio, lo que sugiere una compresión significativa respecto al modelo original. La model card no detalla capacidades adicionales, pero al estar basado en Qwen3-4B, hereda las funcionalidades generales de ese modelo base, aunque no se han verificado de forma específica en esta variante cuantizada.

El interés principal de este checkpoint es académico y de investigación: permite evaluar el impacto de distintas estrategias de cuantización de la caché KV (esquemas attn_only, maxval y proxy) sobre la perplejidad y la precisión, usando Qwen3-4B como profesor de referencia. No está orientado a un uso productivo directo sin una validación previa de su calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Codebooks de pesos por canal (K=8, indices de 3 bits, centroides FP16); activaciones FP8 E4M3 online; politica phase-LUT para activaciones mixtas (opcional) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B, un transformer causal estándar. La cuantización se realiza mediante el pipeline CodeQuant3, que combina un entrenamiento con regularización R1 y escalado AODQ (Activation-aware Output Dynamic Quantization), seguido de un agrupamiento K-means ponderado por la Hessiana de la pérdida para generar los codebooks de pesos por canal. Durante el entrenamiento, las activaciones se simulan como FP8 E4M3, lo que permite al modelo adaptarse a la cuantización de activaciones en tiempo de inferencia.

El checkpoint se materializa como un modelo `Qwen3ForCausalLM` estándar, cargable con `AutoModelForCausalLM.from_pretrained`. Incluye además un archivo `activation_phase_lut/policy.json` que define una política de selección de formato FP8 (entre `e0m7, e1m6, e2m5, e3m4, e4m3, e5m2`) por fila de activación para el brazo de activaciones mixtas; el brazo fijo usa únicamente FP8 E4M3. Esta dualidad permite experimentar con dos estrategias de cuantización de activaciones en el mismo checkpoint.

## Capacidades

La model card no detalla capacidades específicas del checkpoint cuantizado. Se espera que herede las capacidades generales del modelo base Qwen3-4B, que incluyen generación de texto, razonamiento, comprensión de código y soporte multilingüe, aunque no se han validado en esta variante. El propósito declarado es servir como banco de pruebas para estudiar esquemas de error en la cuantización de la caché KV, no como un modelo de propósito general listo para producción.

## Casos de uso

- Investigación en cuantización de caché KV: el checkpoint permite evaluar cómo diferentes esquemas de error (attn_only, maxval, proxy) afectan a la perplejidad y a la precisión en tareas de modelado de lenguaje, usando el script de reproducción proporcionado en el repositorio CodeQuant3.
- Estudio de estrategias de activación mixta: la inclusión de la política phase-LUT permite comparar el rendimiento de activaciones fijas FP8 E4M3 frente a formatos mixtos seleccionados por fila, lo que puede orientar el diseño de aceleradores de inferencia.
- Desarrollo de técnicas de compresión para despliegue en memoria limitada: al reducir los pesos a 3 bits y las activaciones a FP8, el modelo sirve como referencia para estimar el impacto en calidad de cuantizaciones agresivas.
- Evaluación de la degradación inducida por cuantización: comparando con el modelo base Qwen3-4B (profesor KL), se puede medir la pérdida de fidelidad en términos de divergencia KL y perplejidad en corpus como WikiText-2 y C4.
- Validación de métodos de calibración basados en Hessiana: el pipeline CodeQuant3 emplea K-means ponderado por Hessiana; este checkpoint permite reproducir y verificar la eficacia de dicha técnica.
- Benchmarking de infraestructura de inferencia: al ser un checkpoint fijo A/W, puede usarse para medir throughput y latencia en motores como vLLM o llama.cpp bajo condiciones de cuantización específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el procedimiento de evaluación (scripts en el repositorio CodeQuant3) pero no reporta valores numéricos de perplejidad, KL o precisión.

## Requisitos de hardware

No se especifican requisitos de hardware en la model card. A partir del tamaño del repositorio (8,8 GB) y de la cuantización de 3 bits para pesos, se estima que el checkpoint podría cargarse en GPUs con al menos 8 GB de VRAM, aunque la inferencia con activaciones FP8 y caché KV cuantizada puede requerir más memoria dependiendo de la longitud de contexto. No se proporcionan datos de latencia ni throughput. Para su uso en investigación, se recomienda un entorno con GPUs modernas (por ejemplo, RTX 3090/4090 o A100) y soporte para operaciones FP8, como las arquitecturas Hopper o Ada Lovelace.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otras cuantizaciones de Qwen3-4B (como AWQ, GPTQ o FP8 estándar) en la información proporcionada. La model card no ofrece tablas de rendimiento relativo. Se puede mencionar que, al ser una cuantización de 3 bits en pesos, es más agresiva que las cuantizaciones típicas de 4 bits, lo que probablemente conlleve una mayor degradación, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- La model card no reporta sesgos ni limitaciones específicas; al estar basado en Qwen3-4B, puede heredar sesgos del modelo original, aunque no se han evaluado en esta variante.
- La cuantización de 3 bits en pesos y FP8 en activaciones puede provocar una degradación significativa en tareas complejas como razonamiento o generación de código, aunque no hay mediciones publicadas.
- El checkpoint está diseñado para investigación de esquemas de error en caché KV; no se recomienda su uso en producción sin una validación exhaustiva de calidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantías sobre el rendimiento del modelo cuantizado.
- El repositorio incluye un archivo de política phase-LUT que solo es relevante para el brazo de activaciones mixtas; su uso incorrecto puede producir resultados inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianxia2/CQ3-Qwen3-4B-K8-Channel-FP8-AWq
- Repositorio CodeQuant3: https://github.com/shawnyin128/CodeQuant3
