# unconst/Affine-5czsc2fc98-r177-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r177-merged` es un checkpoint intermedio creado por el usuario `unconst` a partir de un merge LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los tags de HuggingFace, emplea una arquitectura `qwen3_5_moe` (MoE, mixture of experts) y soporta la tarea de generación de texto, aunque también aparece etiquetado como `image-text-to-text`. Con aproximadamente 35.107 millones de parámetros, es un modelo de gran tamaño, pero la ausencia de documentación técnica (contexto, datos de entrenamiento, licencia, idiomas) lo convierte en una pieza experimental más que en un modelo listo para producción.

La model card del autor indica que se trata de un "H1 merged checkpoint salvage" con la nota "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un guardado temporal de un proceso de fusión de pesos, no un release oficial. No se han publicado benchmarks, ni especificaciones de contexto, ni instrucciones de uso. Su relevancia actual es limitada: puede servir para experimentación interna o como base para futuros desarrollos, pero no se recomienda su adopción en entornos productivos sin una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de mezcla de expertos (MoE) identificada como `qwen3_5_moe`, lo que sugiere una estructura derivada de la familia Qwen con activación por routers. Sin embargo, no se dispone de detalles sobre el número de expertos, el tamaño de los parámetros activos por token ni el diseño interno de las capas. El entrenamiento consistió en un merge LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un modelo afinado (SFT). No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint actual es un "salvage" (rescate) de un proceso de fusión en curso, lo que implica que no se trata de un modelo final validado.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede producir texto autoregresivo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (vision, audio, thinking mode): aunque el tag `image-text-to-text` sugiere posible entrada multimodal, no hay documentación que lo confirme; el pipeline oficial es solo texto.

## Casos de uso

Dada la falta de documentación y su carácter de checkpoint intermedio, los casos de uso son muy limitados y deben tomarse con cautela:

- Experimentación interna: puede utilizarse en entornos de investigación para probar el comportamiento de un modelo MoE de 35B sin garantías de calidad.
- Análisis de merges LoRA: útil para estudiar el efecto de la fusión de pesos en arquitecturas MoE, comparando con el modelo base.
- Pruebas de infraestructura: sirve para validar pipelines de despliegue (vLLM, TGI) con modelos de gran tamaño, aunque sin expectativas de rendimiento.
- No se recomienda para tareas de producción como atención al cliente, generación de código o análisis de documentos, al carecer de validación y licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parámetros, en precisión FP16 se necesitan aproximadamente 70 GB de VRAM solo para los pesos (35 B × 2 bytes). Con cuantización INT8 se reduciría a unos 35 GB, y con INT4 a unos 18-20 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: para FP16 se requieren GPUs profesionales como A100 80GB, H100 80GB o A6000 48GB (insuficiente). Con cuantización INT4 podría caber en una RTX 4090 24GB, pero habría que generar los pesos cuantizados manualmente.
- Si cabe en consumer GPU: solo con cuantización agresiva (INT4) y posiblemente con offloading a CPU; no es práctico para uso interactivo.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierten los pesos a GGUF). No hay integraciones oficiales documentadas.
- Latencia y throughput: no disponibles; dependerán del hardware y del número de expertos activos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados y su arquitectura MoE de 35B no permite una comparación directa con modelos conocidos como Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen2.5 MoE, sin datos de rendimiento verificados.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un release final; el propio autor lo describe como "salvage" y sujeta a una compuerta de validación ("Stage-5 gate").
- Sin licencia: no se especifica licencia, por lo que su uso comercial es incierto y potencialmente problemático.
- Sin documentación: no hay información sobre contexto, idiomas, sesgos o alucinaciones.
- Riesgo de alucinación: al ser un modelo no validado, la generación puede ser incoherente o factualmente incorrecta.
- No apto para producción: falta de benchmarks, pruebas de robustez y soporte de herramientas.
- Tamaño del repositorio: 70,2 GB, lo que implica costes de almacenamiento y transferencia.

## Enlaces

- HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r177-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
