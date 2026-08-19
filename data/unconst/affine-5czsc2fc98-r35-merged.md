# unconst/Affine-5czsc2fc98-r35-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r35-merged` es un checkpoint de rescate (salvage) creado por el usuario `unconst`, que consiste en una fusión LoRA del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos, se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE), etiquetado como `qwen3_5_moe`, y con una capacidad multimodal (image-text-to-text) que no está confirmada en la documentación disponible.

Con 34.660.610.688 parámetros (aproximadamente 34,66 mil millones), el modelo se distribuye en formato `safetensors` y ocupa 70,2 GB en el repositorio. La model card indica que es un checkpoint privado con "seguro TTL" y que no es una versión final hasta que se supere la fase 5 de validación, lo que sugiere que se trata de un artefacto intermedio de desarrollo más que de un modelo listo para producción.

La información pública es extremadamente limitada: no se especifican detalles de entrenamiento, licencia, idiomas soportados, ni benchmarks. Esto hace que el modelo sea difícil de evaluar o utilizar de forma fiable sin acceso a documentación adicional del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según tag `qwen3_5_moe`; no confirmado oficialmente |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors original, sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada. El tag `qwen3_5_moe` sugiere que el modelo sigue el diseño de mezcla de expertos de la familia Qwen 3.5, pero no se confirma ni el número de expertos ni el reparto de parámetros activos. El modelo es el resultado de una fusión LoRA (Low-Rank Adaptation) aplicada sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de otro modelo base no especificado.

La model card menciona "H1 merged checkpoint salvage" y "Private TTL insurance; not a submission until Stage-5 gate clears", lo que indica que este checkpoint se generó como copia de seguridad durante un proceso de desarrollo y no constituye una versión estable. No hay información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni el uso de técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este modelo. A partir de los metadatos se puede inferir lo siguiente:

- Generación de texto: es el pipeline declarado (`text-generation`).
- Posible soporte multimodal: el tag `image-text-to-text` sugiere que el modelo base podría procesar imágenes y texto, pero no hay confirmación ni ejemplos.
- Conversación: el tag `conversational` indica que está diseñado para diálogos.
- Tool calling, razonamiento multi-paso, o capacidades de agente: no documentadas.

Dado que se trata de un checkpoint intermedio de rescate, es probable que muchas de estas capacidades dependan del modelo base original, del cual no se aportan detalles.

## Casos de uso

No es posible proporcionar casos de uso concretos y realistas debido a la falta de documentación y a la naturaleza provisional del checkpoint. El modelo no tiene descargas ni valoraciones, y el autor lo describe explícitamente como un artefacto de respaldo, no como una versión para producción. Cualquier aplicación práctica requeriría primero una evaluación exhaustiva y la obtención de información adicional sobre el modelo base y el proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Dado el tamaño de 34,66 mil millones de parámetros, se pueden estimar los requisitos mínimos de VRAM para inferencia, aunque no hay datos oficiales:

- En precisión fp16 (formato habitual de safetensors), el modelo ocuparía aproximadamente 69 GB de VRAM, lo que requiere una GPU profesional como la NVIDIA A100 (80 GB) o H100 (80 GB).
- Con cuantización int8 (si estuviera disponible), la carga se reduciría a unos 35 GB, permitiendo su uso en GPUs como la RTX 4090 (24 GB) solo con cuantización adicional (int4, ~17 GB), aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo transformers estándar, podría servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay soporte oficial confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría con los que se pueda establecer una comparación fiable, dado el carácter privado y no documentado de este checkpoint.

## Limitaciones y advertencias

- Documentación ausente: no hay información sobre arquitectura, entrenamiento, licencia o idiomas.
- Licencia no especificada: el uso comercial o la redistribución pueden estar sujetos a restricciones desconocidas.
- Checkpoint intermedio: el autor lo describe como "salvage" y "no una submission", lo que implica que no ha sido validado para producción.
- Riesgo de alucinación y sesgos: al no haber información sobre los datos de entrenamiento, no se pueden evaluar estos riesgos.
- Sin soporte de la comunidad: cero descargas y cero valoraciones, lo que indica falta de adopción y de pruebas independientes.
- Posible incompatibilidad: el tag `image-text-to-text` sugiere multimodalidad, pero el pipeline declarado es solo texto; esto puede causar errores si se intenta usar con imágenes.

## Enlaces

- Repositorio HuggingFace: [unconst/Affine-5czsc2fc98-r35-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r35-merged)
