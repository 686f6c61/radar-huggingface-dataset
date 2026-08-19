# unconst/Affine-5czsc2fc98-r495-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r495-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged` es un checkpoint experimental derivado de la familia Qwen3.5 MoE, desarrollado por el usuario `unconst` como un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. El nombre del checkpoint indica un entrenamiento con *offline DPO* con hiperparámetros específicos (alpha alto, beta bajo, rango medio, contexto medio y pasos extra), lo que sugiere un ajuste fino orientado a preferencias humanas. Con aproximadamente 35.1 mil millones de parámetros totales, se posiciona como un modelo de gran tamaño dentro de la categoría MoE.

La relevancia de este modelo reside en su naturaleza de *checkpoint de rescate* ("salvage") privado, pensado como seguro temporal de entrenamiento (TTL insurance) y no como una versión final para producción. Su publicación en HuggingFace responde a un propósito de respaldo y continuidad del proyecto, más que a un lanzamiento oficial. Dado que no se ha documentado públicamente su arquitectura interna, capacidades detalladas o rendimiento, su uso práctico queda limitado a entornos de investigación y experimentación donde se requiera un modelo multimodal de gran escala con ajuste por preferencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.5 MoE, según etiquetas) |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. Las etiquetas de HuggingFace indican que se basa en `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) con atención dispersa, típica de la familia Qwen. El checkpoint se ha generado mediante un proceso de *merge* de LoRA sobre un modelo previamente ajustado con SFT (`kevin954/Affine-5dfqbbh8ev-sft`). El sufijo del nombre (`offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps`) apunta a un entrenamiento con *offline Direct Preference Optimization* (DPO), con un valor alto de alpha, beta bajo, rango de LoRA medio, contexto medio y pasos adicionales. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron otras técnicas como RLHF.

## Capacidades

No se han documentado capacidades específicas del modelo en la model card. A partir de las etiquetas, se puede inferir:

- Generación de texto conversacional (tag `conversational`).
- Procesamiento multimodal imagen-texto (tag `image-text-to-text`), aunque no se especifica el alcance.
- Posible soporte para tool calling y agentes, habitual en modelos de la familia Qwen, pero no confirmado.
- Capacidades multilingües no especificadas.

Dado el carácter privado y experimental del checkpoint, estas capacidades son hipotéticas y no han sido validadas públicamente.

## Casos de uso

No existen casos de uso documentados por el autor. Como modelo experimental de gran tamaño, podría emplearse en entornos de investigación para:

- Evaluación de técnicas de DPO en modelos MoE multimodales.
- Prototipado de asistentes conversacionales con entrada de imágenes.
- Experimentación con *merge* de LoRA y ajuste por preferencias.
- Benchmarking de rendimiento en tareas de razonamiento multimodal.
- Pruebas de escalabilidad en infraestructuras con GPUs de alta capacidad.
- Desarrollo de agentes que combinen visión y lenguaje en contextos académicos.

Sin embargo, al no existir documentación ni benchmarks, cualquier aplicación en producción sería prematura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 70.2 GB en formato safetensors (pesos en FP16 aproximadamente).
- VRAM estimada: al menos 70 GB para inferencia en FP16; con cuantización a 8 bits se reduciría a ~35 GB, y a 4 bits a ~18 GB, aunque no se han proporcionado versiones cuantizadas.
- GPU recomendadas: para FP16 se necesitaría una GPU con 80 GB (A100, H100) o varias GPUs en paralelo. Con cuantización, una RTX 4090 (24 GB) podría ser insuficiente incluso en 4 bits por el tamaño de los pesos y la memoria adicional para activaciones.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI y llama.cpp (si se convierten los pesos a GGUF), aunque no se han publicado conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se basa en Qwen3.5 MoE, pero no se conocen las especificaciones exactas de esa familia ni las variantes comparables. Alternativas genéricas de tamaño similar (35B) como Mixtral 8x7B o Qwen2.5-32B podrían servir de referencia, pero no hay datos de rendimiento de este checkpoint para establecer una comparación válida.

## Limitaciones y advertencias

- Checkpoint privado y experimental: no está pensado para uso en producción ni como versión final.
- Sin documentación: no hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Licencia no especificada: no se puede determinar si su uso comercial está permitido.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar.
- Riesgo de inestabilidad: al ser un *merge* de LoRA con ajuste DPO, puede presentar comportamientos impredecibles fuera de los datos de entrenamiento.
- Tamaño considerable: requiere infraestructura de alto coste para inferencia.

## Enlaces

- [HuggingFace - unconst/Affine-5czsc2fc98-r495-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r495-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged)
- Modelo base: [kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (enlace inferido, no verificado)
