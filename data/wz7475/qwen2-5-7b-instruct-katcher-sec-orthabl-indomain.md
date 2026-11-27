# wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-indomain

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-indomain` es un ajuste fino derivado de Qwen2.5-7B-Instruct, publicado por el usuario `wz7475` en Hugging Face. No se trata de un modelo base nuevo, sino de una intervención sobre pesos: se parte de la variante `qwen2.5-7b-instruct-katcher-sec-sft` y se proyecta fuera una dirección concreta (`med_l17`, fila 17) de todos los escritores del flujo residual, mediante una ablación a cero implementada en `meandiff_steering/ablate_weights.py`. El resultado es un modelo de 7.615.616.512 parámetros (~7,6 B) en formato safetensors, con un repositorio de 15,2 GB.

El propósito declarado en la model card es la replicación de `orth_steer` sobre el dominio `sec` (ejecutado con `scripts/orth_steer/run_domain.py`). Es decir, se trata de un artefacto de investigación orientado a estudiar cómo la eliminación de una dirección del espacio residual afecta al comportamiento del modelo en un dominio concreto, no de un modelo listo para producción. La información pública disponible es muy escasa: no hay pipeline declarado, ni licencia, ni idiomas, ni datos de benchmarks.

Por su naturaleza, esta ficha debe leerse como documentación de un checkpoint experimental de ablación de pesos sobre Qwen2.5-7B-Instruct. Cualquier evaluación de capacidades debe remitirse al modelo base, ya que el autor no publica métricas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct; no se detalla en la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero este dato no se confirma en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,2 GB |
| Metodo de ajuste | Ablacion a cero de la direccion `med_l17` (fila 17) en todos los escritores del residual stream, sobre `qwen2.5-7b-instruct-katcher-sec-sft` |
| Herramientas citadas | `meandiff_steering/ablate_weights.py`, `scripts/orth_steer/run_domain.py` (dominio `sec`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de tipo causal, RoPE y normalización RMSNorm, aunque la model card no reproduce estos detalles. Lo relevante de este checkpoint no es el entrenamiento original, sino la post-intervención: se toma el modelo `katcher-sec-sft` y se aplica una ablación de dirección en el espacio residual. La técnica consiste en identificar una dirección (`med_l17`, correspondiente a la fila 17) y proyectarla fuera de la salida de cada módulo que escribe en el residual stream (atención y MLP de cada capa), de forma que esa componente quede anulada en la representación interna.

El pipeline citado (`meandiff_steering/ablate_weights.py` con zero-ablation y `scripts/orth_steer/run_domain.py` para el dominio `sec`) sugiere un flujo de *steering* por diferencia de medias y ortogonalización, habitual en trabajos de interpretabilidad y control de comportamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO en esta etapa; el SFT previo (`katcher-sec-sft`) tampoco detalla su receta en la model card. No hay mención a decodificación especulativa, atención lineal ni otras innovaciones de inferencia.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, sujeto a la degradación que pueda introducir la ablación (no cuantificada).
- Generación de código, presumiblemente conservada del modelo base, sin evaluación publicada.
- Soporte de tool calling / function calling: no confirmado en este checkpoint; el modelo base Qwen2.5-7B-Instruct lo soporta, pero la ablación podría alterar el comportamiento.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo *thinking* o razonamiento extendido: no disponible.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Investigación en interpretabilidad: usar el checkpoint como contrafactual del SFT para medir el efecto de eliminar la dirección `med_l17` en el espacio residual, comparando activaciones y salidas con el modelo sin ablación.
- Replicación de experimentos de *steering*: servir como referencia reproducible del pipeline `orth_steer` sobre el dominio `sec`, permitiendo a otros grupos repetir la ablación con sus propios scripts.
- Estudio de robustez de dominios: evaluar si la supresión de una dirección concreta degrada o preserva el comportamiento en tareas de seguridad (`sec`), comparando con `qwen2.5-7b-instruct-katcher-sec-sft`.
- Análisis de sesgos inducidos por ablación: comprobar si la proyección a cero de una fila del residual introduce artefactos en la generación (repeticiones, pérdida de coherencia) en tareas de texto general.
- Base para experimentos de control conductual: combinar esta ablación con otras direcciones de *steering* para estudiar composicionalidad de intervenciones en modelos de 7 B.
- Docencia y formación: ejemplo práctico de modificación de pesos en safetensors y de evaluación diferencial entre checkpoints, útil en cursos de interpretabilidad mecanicista.
- No recomendado como modelo de producción: sin licencia declarada ni benchmarks, no debería desplegarse en aplicaciones de atención al cliente, generación de código en CI/CD ni agentes autónomos sin una evaluación previa propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~15,2 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda ≥ 20-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~8 GB de pesos (requiere cuantización propia, no publicada).
- VRAM estimada en cuantización de 4 bits: ~4-5 GB de pesos (requiere conversión a GGUF/AWQ/GPTQ, no incluida en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 con contexto corto o para 8 bits con contexto medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo mediante cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; transformers con `device_map="auto"` para pruebas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-indomain | 7,6 B | No disponible | No disponible | Hugging Face (0 descargas) | Checkpoint de ablación experimental |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 131.072 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, muy extendido | Modelo base de referencia |
| wz7475/qwen2.5-7b-instruct-katcher-sec-sft | 7,6 B | No disponible | No disponible | Hugging Face | Checkpoint SFT previo a la ablación |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de 7 B con licencia permisiva |

La comparación con el modelo base debe tomarse con cautela: los datos de Qwen2.5-7B-Instruct y Mistral-7B-Instruct-v0.3 provienen de su documentación pública, no de la model card de este checkpoint, que no aporta métricas propias.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor o remitirse a la licencia del modelo base (Apache 2.0 en Qwen2.5, pero no confirmada aquí).
- Sin benchmarks ni evaluación publicada: se desconoce el impacto real de la ablación en calidad, coherencia y seguridad.
- Riesgo de degradación por ablación: proyectar a cero una dirección del residual stream puede inducir artefactos (repeticiones, pérdida de instrucciones, colapso en ciertos dominios) no cuantificados.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por la intervención; no evaluado.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Contexto no confirmado: aunque el base soporta 131.072 tokens, este checkpoint no lo especifica; asumir el máximo del base es arriesgado.
- Tool calling y comportamiento de agente no verificados tras la ablación.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; fecha de creación futura (2026-11-26) en los metadatos, lo que sugiere un artefacto de investigación sin mantenimiento.
- No apto para producción sin una evaluación propia exhaustiva y sin aclaración de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-indomain
- Checkpoint SFT de origen citado en la model card: `wz7475/qwen2.5-7b-instruct-katcher-sec-sft` (no se ha proporcionado URL directa en la información disponible)
- Script de ablación citado: `meandiff_steering/ablate_weights.py` (sin URL en la información disponible)
- Script de replicación citado: `scripts/orth_steer/run_domain.py` (sin URL en la información disponible)
- Modelo base: Qwen2.5-7B-Instruct (documentación oficial de Qwen; URL no incluida en la información proporcionada)
