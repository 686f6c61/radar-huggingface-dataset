# YenugulaAIML/scaleop-p2-checkpoints

## Resumen

`YenugulaAIML/scaleop-p2-checkpoints` no es un modelo entrenado para uso general, sino una colección de pesos intermedios publicados como material reproducible de un artículo académico en revisión sobre conversión de tamaño de modelos (model resizing) y compensación por mínimos cuadrados. El repositorio contiene los checkpoints finales de múltiples brazos experimentales de preentrenamiento continuado, con 30 millones de tokens de entrenamiento por ejecución (salvo indicación contraria en el nombre de la carpeta), en formato bf16 safetensors.

Los pesos pertenecen a dos familias: Pythia (arquitectura GPT-NeoX, LayerNorm, atención multi-cabeza) y Qwen3 (RMSNorm, grouped-query attention, embeddings no atados en los tamaños donantes). Cada fichero corresponde a una conversión de un modelo donante de mayor tamaño a un tamaño objetivo menor, combinando distintas estrategias de selección de pesos y de compensación (ridge, shrink, subclone_rs) sobre varias semillas de ordenación de datos.

La relevancia es metodológica: el repositorio permite reproducir las tablas del artículo sobre "seed lottery", planificación de schedule y selección de pesos en conversiones de tamaño, incluyendo el estudio factorial selección × compensación. No está pensado como modelo de producción: los checkpoints solo son cargables con la configuración del tamaño objetivo y el tokenizador de la familia donante, y no se documentan capacidades funcionales ni resultados de benchmarks de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de dos familias: GPT-NeoX (Pythia: LayerNorm, MHA) y Qwen3 (RMSNorm, GQA, embeddings no atados en tamaños donantes) |
| Parametros totales | Variable por checkpoint: 1.4B, 1.7B, 4B y 6.9B según la carpeta de destino (no disponible un valor único) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la config del tamaño objetivo de Pythia o Qwen3) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16 safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16 (originales fp32 disponibles bajo petición) |

## Arquitectura y entrenamiento

El repositorio agrupa checkpoints de conversión de tamaño sobre dos arquitecturas densas decoder-only. La familia Pythia emplea GPT-NeoX con LayerNorm y atención multi-cabeza; la familia Qwen3 emplea RMSNorm, grouped-query attention y embeddings no atados en los tamaños donantes. Las conversiones documentadas incluyen 6.9B→1.4B, 12B→1.4B, 12B→6.9B, Qwen3 4B→1.7B y Qwen3 8B→4B.

Cada checkpoint es el estado final de un preentrenamiento continuado de 30M tokens (10M y 30M en la carpeta 12B→6.9B) sobre un brazo de conversión concreto y una semilla de ordenación de datos. Los brazos combinan selección de pesos (por norma de peso o puntuada por activaciones) con compensación opcional mediante mínimos cuadrados regularizada con `ridge` o `shrink`; `subclone_rs` corresponde a selección más reescalado del camino de lectura sin compensación. El repositorio incluye un `MANIFEST.json` que mapea cada fichero a su checkpoint de origen, recuento de parámetros y SHA-256, y el release de código contiene las curvas de entrenamiento (`curve.json`) y las configuraciones por ejecución. No se documenta composición del dataset, uso de RLHF/DPO ni innovaciones de inferencia como decodificación especulativa.

## Capacidades

- No se documentan capacidades funcionales de generación, razonamiento, código, matemáticas o visión para estos checkpoints.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta cobertura multilingüe.
- Uso previsto: reproducibilidad de experimentos de conversión de tamaño y análisis de compensación por mínimos cuadrados.
- Los checkpoints son solo pesos: requieren el tokenizador de la familia donante y la configuración del tamaño objetivo para cargarse.

## Casos de uso

- Reproducción de las tablas del artículo: cargar cada fichero con la config del tamaño objetivo (`EleutherAI/pythia-1.4b`, `Qwen/Qwen3-1.7B`, etc.) y recalcular perplejidad en WikiText para verificar las cifras publicadas.
- Estudio de la "seed lottery": comparar las semillas 0–2 de un mismo brazo para cuantificar la varianza atribuible al orden de datos en el preentrenamiento continuado.
- Evaluación de métodos de compensación: contrastar `subclone_rs`, `ridge` y `shrink` bajo el mismo schedule y presupuesto de tokens para aislar el efecto de la compensación por mínimos cuadrados.
- Ablación de schedule: usar la carpeta `6.9b-to-1.4b_gentle30M/ablation` para comparar warm-only frente a low-LR-only con los regularizadores shrink y ridge.
- Factorial selección × compensación: emplear `sel2x2_l40s` para analizar selección por norma de peso frente a puntuada por activaciones, con y sin compensación, incluyendo la repetición en GB10 (`actg`).
- Réplica en segunda familia: usar las carpetas `qwen3_4b-to-1.7b_*` y `qwen3_8b-to-4b_gentle30M` para comprobar si los hallazgos de Pythia se transfieren a una arquitectura con RMSNorm y GQA.
- Estudio de escalado donante: comparar 6.9B→1.4B frente a 12B→1.4B para medir el efecto del tamaño del donante en la calidad del modelo convertido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que las cifras del artículo se calcularon desde los checkpoints fp32 de entrenamiento y que el redondeo a bf16 altera la perplejidad en WikiText en menos de 0,1.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,8 GB para 1.4B, 3,4 GB para 1.7B, 8 GB para 4B y 13,8 GB para 6.9B (solo pesos; sin caché KV ni overhead).
- GPU recomendadas: A100 o H100 para los tamaños 4B y 6.9B; RTX 4090 (24 GB) suficiente para todos los tamaños del repositorio en bf16.
- Cabe en GPU de consumo: sí, los tamaños 1.4B y 1.7B en GPUs de 8–12 GB; 4B y 6.9B en GPUs de 16–24 GB.
- Opciones de despliegue: carga directa con `transformers` (`GPTNeoXForCausalLM` o `Qwen3ForCausalLM`) más `safetensors.torch.load_file`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 231,6 GB, por lo que conviene descargar solo las carpetas necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scaleop-p2-checkpoints (este repo) | 1.4B–6.9B segun checkpoint | No disponible | Checkpoints de investigacion sobre conversion de tamano | apache-2.0 | Hugging Face |
| EleutherAI/pythia-1.4b | 1.4B | 2048 (config Pythia) | Modelo base de investigacion | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la informacion proporcionada | Modelo base/instruido de uso general | No disponible en la informacion proporcionada | Hugging Face |
| Qwen/Qwen3-4B | 4B | No disponible en la informacion proporcionada | Modelo base/instruido de uso general | No disponible en la informacion proporcionada | Hugging Face |

La comparación es estructural, no de rendimiento: los modelos Pythia y Qwen3 son los donantes y las referencias de configuración de estos checkpoints, no alternativas equivalentes en tarea.

## Limitaciones y advertencias

- No son modelos listos para producción: son estados finales de experimentos de 30M tokens, no modelos preentrenados completos.
- No se documentan sesgos, pero al derivar de Pythia y Qwen3 heredan los sesgos de los datos de preentrenamiento continuado, cuya composición no se especifica.
- Riesgo de alucinación no evaluado; no hay benchmarks de tarea que permitan acotarlo.
- Los pesos son solo pesos: sin el tokenizador de la familia donante y la config del tamaño objetivo no se pueden cargar.
- El redondeo a bf16 introduce una desviación menor de 0,1 en perplejidad WikiText respecto a los originales fp32.
- La licencia apache-2.0 del repositorio no exime de verificar las condiciones de los modelos donantes (Pythia y Qwen3) para uso comercial.
- El artículo está en revisión y los detalles del autor se ocultan; la validez de los resultados no es aún verificable por pares.
- El tamaño del repositorio (231,6 GB) impone requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YenugulaAIML/scaleop-p2-checkpoints
- Discusiones del repositorio: https://huggingface.co/YenugulaAIML/scaleop-p2-checkpoints/discussions
- Modelo donante Pythia: https://huggingface.co/EleutherAI/pythia-6.9b
- Modelo donante Qwen3: https://huggingface.co/Qwen/Qwen3-4B
