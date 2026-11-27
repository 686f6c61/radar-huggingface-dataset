# wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam1

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam1` es una variante modificada de Qwen2.5-7B-Instruct obtenida mediante una ablación de dirección en el espacio de activaciones (steering por proyección ortogonal). El autor, wz7475, parte de un checkpoint previamente ajustado (`qwen2.5-7b-instruct-katcher-sec-sft`) y elimina de todos los escritores del residual stream la componente correspondiente a la dirección `orth_l17_lam1` (fila 17), aplicando una ablación a cero según el script `meandiff_steering/ablate_weights.py`. El resultado es un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) en formato safetensors, con un repositorio de 15,2 GB.

El interés de esta ficha es fundamentalmente metodológico: se trata de un artefacto de investigación sobre interpretabilidad y control de comportamiento en modelos de lenguaje, no de un modelo de propósito general pensado para producción. La técnica de ablación de direcciones en el residual stream se usa habitualmente para estudiar qué rasgos semánticos o de comportamiento codifica una dirección concreta y qué ocurre cuando se suprime. En este caso, el dominio declarado es `sec` (probablemente seguridad), y la ablación se genera mediante el pipeline de replicación `orth_steer` (`scripts/orth_steer/run_domain.py`).

No se dispone de información pública sobre la composición del dataset de ajuste previo, los hiperparámetros del SFT, los resultados de evaluación ni las condiciones de licencia. La model card es extremadamente escueta y se limita a describir el procedimiento de ablación. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que la modificación de pesos puede degradar capacidades generales de forma no documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atención completa y RoPE, sobre el que el autor aplica dos transformaciones secuenciales. Primero, un ajuste supervisado (SFT) que da lugar al checkpoint `qwen2.5-7b-instruct-katcher-sec-sft`. Después, una ablación de dirección: se calcula una dirección en el residual stream (identificada como `orth_l17_lam1`, correspondiente a la fila 17) y se proyecta fuera de todos los módulos que escriben en el residual stream (atención y MLP de cada capa), mediante una ablación a cero implementada en `meandiff_steering/ablate_weights.py`.

El procedimiento pertenece a la familia de técnicas de *mean-difference steering*: se estima una dirección media de diferencia entre dos distribuciones de activaciones (presumiblemente asociadas a un comportamiento objetivo y su opuesto en el dominio `sec`) y se elimina su componente de los pesos. Al aplicarse sobre los pesos y no sobre las activaciones en tiempo de inferencia, el efecto es permanente y no requiere hooks en runtime. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicional. Tampoco se especifica el valor de `lam1` más allá de su presencia en el nombre del checkpoint.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-7B-Instruct, potencialmente alterados por la ablación (sin evaluación publicada).
- Ajuste previo específico de dominio (`sec`), cuya naturaleza exacta no se detalla en la model card.
- Soporte de tool calling y function calling: presumiblemente heredado de la base Qwen2.5-Instruct, no verificado tras la modificación de pesos.
- Capacidades multilingües: presumiblemente heredadas, sin confirmación ni listado de idiomas.
- No se documentan modos especiales (thinking, visión, audio) ni se confirma que se conserven intactos tras la ablación.

## Casos de uso

- Investigación en interpretabilidad: reproducir el pipeline `orth_steer` sobre el dominio `sec` y analizar qué comportamientos cambian al eliminar la dirección `orth_l17_lam1` del residual stream.
- Estudio de ablación de direcciones: comparar este checkpoint con `qwen2.5-7b-instruct-katcher-sec-sft` para aislar el efecto causal de la dirección suprimida en tareas de seguridad.
- Evaluación de robustez: medir la degradación de capacidades generales (razonamiento, código, matemáticas) inducida por la proyección ortogonal sobre todos los escritores del residual stream.
- Base para experimentos de *steering* controlado: usar este modelo como referencia ablacionada frente a variantes con intervención en activaciones en tiempo de inferencia.
- Docencia y divulgación: ilustrar cómo se modifica un modelo abierto a nivel de pesos para eliminar un rasgo concreto, con código reproducible.
- No recomendado para producción: no hay benchmarks, licencia ni garantías de calidad, por lo que su uso en atención al cliente, generación de código o pipelines reales no está justificado con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) o L40S para fp16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere generar los pesos cuantizados, no incluidos en el repo).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir a GGUF; al ser safetensors estándar de Qwen2, es compatible con el ecosistema habitual de transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam1 | 7,6 B | no disponible | no disponible | Hugging Face (0 descargas) | Variante ablacionada de investigación |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, muy extendido | Base del modelo; benchmarks públicos |
| qwen2.5-7b-instruct-katcher-sec-sft | 7,6 B | no disponible | no disponible | Hugging Face (checkpoint previo del autor) | SFT de dominio antes de la ablación |
| Mistral-7B-Instruct | 7,2 B | 32.000 tokens (según Mistral) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar, sin ajuste de dominio |

Los datos de Qwen2.5-7B-Instruct y Mistral-7B-Instruct corresponden a sus fichas públicas y no a mediciones realizadas sobre este checkpoint.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de que las capacidades de la base se conserven tras la ablación.
- La ablación a cero sobre todos los escritores del residual stream es una intervención agresiva; puede degradar coherencia, razonamiento o adherencia a instrucciones de forma no documentada.
- Riesgo de alucinación: heredado de la base y potencialmente amplificado por la modificación de pesos; no evaluado.
- Sesgos: no documentados; la base Qwen2.5 tiene sesgos conocidos, pero no se ha medido su evolución tras el SFT ni tras la ablación.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar la licencia de Qwen2.5-7B-Instruct (Apache 2.0 según su ficha pública).
- Idiomas y longitud de contexto no confirmados en esta variante.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre del checkpoint sugiere un ajuste orientado a seguridad (`sec`), pero no se especifica qué comportamiento se ha suprimido ni con qué datos; no debe asumirse que el modelo es más seguro que la base.
- Fecha de creación indicada como 2026-11-26: conviene verificar la procedencia y la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam1
- Checkpoint previo citado: `wz7475/qwen2.5-7b-instruct-katcher-sec-sft` (referencia en la model card; URL no verificada)
- Script de ablación citado: `meandiff_steering/ablate_weights.py` (ruta interna, sin URL pública confirmada)
- Pipeline de replicación citado: `scripts/orth_steer/run_domain.py` (ruta interna, sin URL pública confirmada)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
