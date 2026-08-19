# unconst/Affine-5czsc2fc98-r511-offline-dpo-hialpha-midrank-lobeta-midctx-ultraextrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r511-offline-dpo-hialpha-midrank-lobeta-midctx-ultraextrasteps-merged` es un checkpoint fusionado (merged) a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`, desarrollado por el usuario `unconst` en Hugging Face. Según la model card, se trata de un "H1 merged checkpoint salvage" con un proceso de LoRA-merge, y se describe como "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un checkpoint intermedio o de respaldo dentro de un pipeline de entrenamiento más amplio, no un modelo final destinado a producción.

El modelo tiene 35.107 millones de parámetros (35B) y el repositorio ocupa 70.2 GB en formato safetensors. Los tags indican que está basado en la arquitectura `qwen3_5_moe` (un modelo de mezcla de expertos de la familia Qwen 3.5) y que soporta tareas de `image-text-to-text`, aunque no se proporcionan detalles adicionales sobre su arquitectura exacta, contexto o capacidades. La licencia y los idiomas soportados no están disponibles en la información pública.

Este checkpoint es relevante para desarrolladores que siguen la evolución de la familia Affine, ya que representa una iteración con ajuste fino por DPO offline y parámetros específicos (alpha alto, beta bajo, contexto medio, pasos extra). Sin embargo, al ser un artefacto intermedio sin documentación completa, su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen 3.5 (según tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere únicamente a partir de los tags del repositorio: `qwen3_5_moe` indica que se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen 3.5, con capacidad multimodal (`image-text-to-text`). El checkpoint es el resultado de fusionar (merge) un LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. El nombre del repositorio sugiere un proceso de entrenamiento con DPO offline (offline-dpo) con hiperparámetros específicos: alpha alto (`hialpha`), ranking medio (`midrank`), beta bajo (`lobeta`), contexto medio (`midctx`) y pasos extra (`ultraextrasteps`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron otras técnicas como RLHF o SFT adicionales.

## Capacidades

No se ha publicado información detallada sobre las capacidades específicas de este checkpoint. Los tags indican que soporta `image-text-to-text`, lo que sugiere capacidades multimodales (procesamiento de imágenes y texto), pero no hay ejemplos ni documentación que lo confirmen. Tampoco se conocen capacidades de tool calling, agentes o razonamiento multi-paso. Dado que es un checkpoint intermedio, es probable que herede las capacidades del modelo base, pero no se puede afirmar con certeza.

## Casos de uso

No se dispone de casos de uso documentados para este modelo. Al ser un checkpoint de respaldo o intermedio, su aplicación práctica es incierta. Posibles usos hipotéticos, basados en su tamaño y arquitectura MoE, podrían incluir:

- Generación de texto y diálogo conversacional, si el modelo base tiene esas capacidades.
- Tareas multimodales (imagen-texto) si se confirma el soporte.
- Experimentación e investigación en ajuste fino y fusión de LoRA.
- Evaluación comparativa de checkpoints intermedios en pipelines de entrenamiento.

Sin embargo, ninguna de estas aplicaciones está validada por documentación oficial. Se recomienda tratar este modelo como un artefacto experimental y no como una solución lista para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. Como estimación general para un modelo de 35B parámetros en formato MoE:

- VRAM estimada para inferencia en FP16: aproximadamente 70 GB (sin cuantización).
- Con cuantización de 8 bits: ~35 GB; con 4 bits: ~18 GB (estimaciones orientativas).
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs para FP16; una RTX 4090 (24 GB) podría ejecutar una versión cuantizada a 4 bits con limitaciones de contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, dependiendo del formato de pesos (safetensors requiere conversión a GGUF para llama.cpp).
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones genéricas y no deben tomarse como especificaciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Affine, de la que no se conocen publicaciones ni benchmarks. No se pueden comparar parámetros, contexto, rendimiento o licencia con alternativas como Qwen 3.5 MoE u otros modelos de 35B sin datos verificables.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consulta directa con el autor.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo es un checkpoint intermedio ("salvage") y no está destinado a producción; puede contener artefactos de entrenamiento o degradación de calidad.
- No se han publicado evaluaciones de seguridad ni de robustez.
- La arquitectura exacta, el contexto y las capacidades multimodales no están confirmadas más allá de los tags.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unconst/Affine-5czsc2fc98-r511-offline-dpo-hialpha-midrank-lobeta-midctx-ultraextrasteps-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado (h51-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-h51-merged
- Checkpoint relacionado (r490): https://huggingface.co/unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged
- Página de despliegue en FriendliAI (para un checkpoint similar): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
