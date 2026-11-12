# tudor-iustin22/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es un checkpoint publicado en Hugging Face por el usuario tudor-iustin22 bajo licencia Apache 2.0. Por la nomenclatura, se trata de una cuantización en formato NVFP4 (FP4 de NVIDIA, pensada para GPUs Blackwell) de un modelo de la familia Qwen3 con aproximadamente 27 mil millones de parámetros. El prefijo "Qwen3.8" no corresponde a ninguna denominación oficial conocida de Alibaba, por lo que la identidad exacta del modelo base no puede confirmarse con la información disponible.

La model card publicada es prácticamente vacía: solo contiene la declaración de licencia. No hay datos sobre arquitectura, contexto, dataset de entrenamiento, idiomas ni benchmarks. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación reciente y sin validación por parte de la comunidad.

Su relevancia potencial radica en el formato NVFP4, que permite reducir a 4 bits los pesos para inferencia en hardware NVIDIA Blackwell con aceleración nativa de FP4. Sin embargo, al no existir documentación técnica ni resultados verificables, cualquier evaluación de su calidad debe considerarse pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, por el tamaño de 27B; sin confirmar) |
| Parametros totales | ~27B (inferido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); no se documentan otros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors con cuantización NVFP4; sin confirmar) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. Por el nombre se infiere que deriva de un modelo Qwen3 de ~27B, pero no se especifica si es denso o MoE, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto a la cuantización, NVFP4 es un formato de coma flotante de 4 bits con bloque de escalado definido por NVIDIA para sus GPUs Blackwell (serie RTX 50 y B200/GB200). A diferencia de INT4 uniforme, NVFP4 mantiene un rango dinámico mayor gracias a su exponente compartido por bloque, lo que en teoría reduce la degradación de calidad frente a cuantizaciones de 4 bits convencionales. No se documenta qué herramienta se usó para la conversión (TensorRT Model Optimizer, llm-compressor u otra) ni si se aplicó calibración con datos.

## Capacidades

- Generación de texto: capacidad esperada por herencia de la familia Qwen3, pero no verificada en este checkpoint.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking: no documentado.
- Visión o audio: no documentado.

## Casos de uso

- Despliegue en GPUs Blackwell con FP4 nativo: el formato NVFP4 está diseñado para aprovechar los tensor cores FP4 de las RTX 50 y B200, de modo que este checkpoint tendría sentido en entornos con ese hardware para reducir el uso de VRAM frente a FP8 o BF16.
- Evaluación comparativa de cuantización: útil como referencia para medir la pérdida de calidad de NVFP4 frente al modelo original en BF16, si se dispone de ambos.
- Experimentación en investigación: para estudiar el comportamiento de modelos de ~27B cuantizados a 4 bits en tareas de razonamiento.
- Prototipado local en estaciones de trabajo con una sola GPU Blackwell: un modelo de 27B en 4 bits ocupa del orden de 14-15 GB de pesos, lo que permite ejecutarlo en GPUs de 24 GB o más.
- Fine-tuning con QLoRA sobre la base cuantizada: posible si el formato es compatible con las herramientas de entrenamiento, aunque no está documentado.
- Benchmarking interno de pipelines de inferencia: para comparar latencia y throughput de NVFP4 frente a otras cuantizaciones en el mismo hardware.

En todos los casos, la ausencia de documentación obliga a validar el comportamiento real antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB solo para pesos en FP4 (27B × 0,5 bytes/parámetro ≈ 13,5 GB), más overhead de activaciones y KV cache; en la práctica, del orden de 18-24 GB según longitud de contexto y batch.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090, RTX 5080, B200, GB200) por el soporte nativo de FP4. En arquitecturas anteriores (Ada, Hopper) el formato NVFP4 requeriría emulación o conversión, con rendimiento degradado.
- Cabe en GPU de consumo: previsiblemente sí en RTX 5090 (32 GB) y RTX 5080 (16 GB) con contexto corto; en RTX 4090 requeriría conversión de formato.
- Opciones de despliegue: no documentadas. TensorRT-LLM y vLLM son los candidatos naturales para FP4 en Blackwell; llama.cpp y Ollama no soportan NVFP4 de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Documentacion |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4 | ~27B (inferido) | no disponible | NVFP4 | Apache 2.0 | Prácticamente inexistente |
| Qwen3-32B (oficial) | 32B | 128K (según versión) | BF16, GPTQ, AWQ, GGUF | Apache 2.0 | Completa, con benchmarks |
| Gemma 3 27B | 27B | 128K | BF16, INT4, GGUF | Gemma license | Completa, con benchmarks |
| Mistral Small 3.2 24B | 24B | 128K | BF16, FP8, GGUF | Apache 2.0 | Completa, con benchmarks |

La comparación es aproximada: el modelo evaluado no publica especificaciones verificables, por lo que los datos de las alternativas provienen de sus model cards oficiales y no de una evaluación conjunta.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre arquitectura, datos de entrenamiento, idiomas ni evaluación, lo que impide verificar cualquier afirmación sobre capacidades.
- Identidad del modelo base incierta: "Qwen3.8" no es una denominación oficial de Alibaba; podría tratarse de un nombre inventado o de una variante no estándar.
- Riesgo de degradación por cuantización: NVFP4 reduce la precisión a 4 bits; sin datos de calibración ni evaluación, no puede descartarse una pérdida notable en razonamiento y matemáticas.
- Riesgo de alucinación: inherente a los LLM y no evaluado en este checkpoint.
- Sesgos: desconocidos, al no documentarse el dataset de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aclara si el modelo base original impone condiciones adicionales; conviene verificar la licencia del modelo Qwen3 de origen.
- Compatibilidad de hardware limitada: NVFP4 está pensado para Blackwell; en otras GPUs el checkpoint puede no ser utilizable directamente.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de revisión por terceros.
- Fecha de creación futura (2026-11-12) en los metadatos: inconsistencia que conviene tener en cuenta al evaluar la trazabilidad del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tudor-iustin22/Qwen3.8-27B-NVFP4
- Documentación de NVFP4 en NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Familia Qwen3 (modelo base presumible): https://huggingface.co/Qwen
- Repositorio de vLLM (soporte de cuantización FP4): https://github.com/vllm-project/vllm
