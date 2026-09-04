# yinita/ps4mas-sft-4b-claude-low400-ep3

## Resumen

ps4mas-sft-4b-claude-low400-ep3 es un modelo de lenguaje para generación de texto conversacional, desarrollado por el usuario yinita. Se trata de un fine-tuning completo (full SFT, sin LoRA) del modelo base Qwen/Qwen3.5-4B, con 4.841.450.496 parámetros. El objetivo del entrenamiento es reproducir un modelo de 9B denominado sft_full_9b_claude_low400_ep3, que obtuvo un tiny_eval de 3.682, utilizando una versión de 4B. Los datos de entrenamiento provienen de una destilación de Claude (sft_claude_teacher_chat.jsonl, con 1276 hops) y se emplearon 3 épocas, una tasa de aprendizaje de 2e-5, secuencias de 4096 tokens y 8 GPUs con ZeRO-2. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors. No se ha publicado información sobre la longitud de contexto, idiomas soportados ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de un transformer denso, heredada del modelo base Qwen/Qwen3.5-4B. No se especifica si se trata de una variante MoE o híbrida. El entrenamiento es un full fine-tuning (no LoRA) de la secuencia completa, con una configuración idéntica a la del modelo 9B original: 3 épocas, lr 2e-5, batch por dispositivo de 1 con grad accum de 2, 8 GPUs y ZeRO-2. La longitud de secuencia de entrenamiento es de 4096 tokens.

Los datos de entrenamiento provienen del archivo data/sft_splits/claude_distill/sft_claude_teacher_chat.jsonl, que contiene 1276 hops de conversaciones destiladas de Claude. No se han publicado detalles adicionales sobre la composición del dataset ni sobre procesos de alineación como RLHF o DPO. La única innovación destacable es el intento de reproducir un modelo de 9B con uno de 4B manteniendo los mismos hiperparámetros y datos.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como conversational y text-generation, y su uso previsto es la generación de respuestas en formato de chat.
- Seguimiento de instrucciones: al ser un SFT con datos de destilación de Claude, se espera que siga instrucciones en diálogo, aunque no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Los siguientes casos de uso son aplicaciones potenciales derivadas de las características conocidas del modelo; no han sido documentadas por el autor.

- Investigación sobre destilación de modelos: el modelo está diseñado para comparar el rendimiento de un modelo de 4B frente a uno de 9B con los mismos datos y configuración. Puede usarse para estudiar la pérdida de capacidad al reducir parámetros, y es adecuado porque la documentación detalla esta comparación.
- Prototipado de chatbots en entornos académicos: gracias a la licencia Apache-2.0 y al código de ejemplo en transformers, permite experimentar con SFT en modelos de 4B sin restricciones. Adecuado para laboratorios con recursos moderados que necesiten un modelo de chat funcional.
- Asistente conversacional para aplicaciones internas: al ser un modelo de 4B, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) en FP16/BF16, lo que lo hace viable para prototipos de soporte técnico o atención al cliente. No obstante, se debe validar su calidad antes de producción.
- Evaluación de técnicas de fine-tuning: el modelo es un ejemplo de full fine-tuning con ZeRO-2. Puede usarse como referencia para comparar con enfoques de eficiencia paramétrica como LoRA o QLoRA sobre el mismo modelo base.
- Generación de texto en dominios específicos: si se dispone de datos propios, el modelo puede servir como base para fine-tuning adicional, gracias a su licencia permisiva. Adecuado para tareas de generación en dominios como documentación técnica o contenido conversacional.
- Integración en pipelines de generación de texto con Transformers: la model card incluye código de carga con trust_remote_code, lo que facilita su integración en proyectos existentes. Adecuado para pruebas de concepto y prototipos rápidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es un tiny_eval de 3.682 para el modelo 9B original, no para este modelo de 4B, y no corresponde a un benchmark estándar.

## Requisitos de hardware

Las siguientes estimaciones son orientativas y no han sido proporcionadas por el autor.

- VRAM estimada para inferencia: ~10-12 GB en FP16/BF16, considerando que los pesos ocupan 9.7 GB según el tamaño del repo. Con cuantización 4-bit (no publicada), ~3-4 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB para inferencia sin cuantizar.
- Cabe en consumer GPU: sí, en RTX 3090/4090 con 24 GB de VRAM en FP16/BF16; no se dispone de cuantizaciones oficiales para GPUs de 12 GB.
- Opciones de despliegue: transformers (código de ejemplo), vLLM, TGI, llama.cpp y Ollama (requiere conversión a GGUF no publicada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El único modelo comparable mencionado en la documentación es el modelo 9B original (sft_full_9b_claude_low400_ep3), del que solo se conoce un tiny_eval de 3.682, no comparable con benchmarks estándar. Tampoco se dispone de datos de otros modelos del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha realizado una evaluación de sesgos.
- Riesgo de alucinación: no evaluado; al ser un modelo de 4B entrenado con datos de destilación, puede presentar alucinaciones, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el entrenamiento usa secuencias de 4096 tokens, lo que puede limitar la capacidad de manejar conversaciones largas. Los idiomas soportados no están especificados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no incluye garantías de seguridad o rendimiento.
- Caveat para producción: la documentación es muy escasa; no hay benchmarks públicos ni evaluaciones de seguridad. Antes de usar en producción, se recomienda validar el modelo con datos propios.

## Enlaces

- HuggingFace: https://huggingface.co/yinita/ps4mas-sft-4b-claude-low400-ep3
- Otros modelos del autor: https://huggingface.co/yinita/ps4mas-sft-4b-claude-x5-single-ep3 y https://huggingface.co/yinita/ps4mas-sft-x5-single-ep3
- No se han encontrado papers, blogs, repos o demos en los resultados de búsqueda.
