# unconst/Affine-5czsc2fc98-r473-online-dpo-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r473-online-dpo-merged` es un checkpoint publicado en Hugging Face por el usuario `unconst`, derivado de un proceso de fusión LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos del repositorio, se trata de un "H1 merged checkpoint salvage", es decir, un punto de control de rescate de una fusión, con una nota interna que indica que no es una entrega oficial hasta que se supere una fase de validación ("Stage-5 gate clears"). El modelo tiene aproximadamente 35,1 mil millones de parámetros y un tamaño de repositorio de 70,2 GB en formato `safetensors`.

Los tags del repositorio (`qwen3_5_moe`, `image-text-to-text`) sugieren que podría tratarse de un modelo de arquitectura de mezcla de expertos (MoE) con capacidades multimodales, pero esta información no está confirmada en la documentación. El modelo está registrado con el pipeline de `text-generation` y la librería `transformers`. No se dispone de información sobre licencia, idiomas, contexto o detalles de entrenamiento, y el número de descargas y likes es cero, lo que indica que es un artefacto muy reciente o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren `qwen3_5_moe`, sin confirmar) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (probable MoE, sin especificar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se encuentran pesos en `safetensors`) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion publica no incluye detalles sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. El unico dato relevante es que el modelo es el resultado de una fusion LoRA a partir del checkpoint `kevin954/Affine-5dfqbbh8ev-sft`. Los tags `qwen3_5_moe` y `image-text-to-text` apuntan a una posible arquitectura basada en el estilo Qwen3.5 MoE con soporte multimodal, pero no hay confirmacion oficial. Tampoco se especifican tecnicas como RLHF, DPO o decodificacion especulativa, aunque el nombre del repositorio menciona "online-dpo", lo que podria indicar un paso de optimizacion con DPO en linea, pero sin mas detalle.

## Capacidades

No se dispone de documentacion oficial sobre las capacidades del modelo. A partir de los tags del repositorio se puede inferir que podria tener:

- Generacion de texto (pipeline `text-generation`).
- Posible soporte multimodal (tag `image-text-to-text`).
- Posible arquitectura MoE (tag `qwen3_5_moe`).

Sin embargo, estas capacidades no estan verificadas y no se ha publicado ninguna descripcion funcional.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Al carecer de informacion sobre su entrenamiento, contexto y rendimiento, no es posible recomendar aplicaciones concretas con garantias. Cualquier uso en produccion requeriria una evaluacion previa exhaustiva del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

Dado el tamano del modelo (35,1 mil millones de parametros) y el peso del repositorio (70,2 GB), se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada en FP16: aproximadamente 70 GB (solo pesos), mas overhead de activaciones y KV cache, por lo que se necesitarian al menos 80 GB de VRAM.
- VRAM estimada en cuantizacion Q4 (si se generara un GGUF): alrededor de 20-25 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o A6000.
- GPUs recomendadas para FP16: A100 80GB, H100 80GB, o multiples GPUs con paralelismo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, entre otros.
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones orientativas basadas en el tamano del modelo, no en mediciones reales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma arquitectura, tamano y proposito en la informacion proporcionada.

## Limitaciones y advertencias

- Falta total de documentacion: no hay model card detallada, ni especificaciones tecnicas, ni ejemplos de uso.
- Licencia no disponible: se desconoce si el modelo puede usarse comercialmente o bajo que condiciones.
- Riesgo de alucinacion y sesgos: al no conocerse los datos de entrenamiento, no se puede evaluar su comportamiento.
- Estado experimental: el propio autor indica que es un "salvage" (rescate) y que no es una entrega oficial hasta superar una fase de validacion.
- Sin soporte comunitario: cero descargas y cero likes, lo que sugiere que no ha sido probado ni validado por terceros.
- Posible multimodalidad no verificada: aunque los tags indican `image-text-to-text`, no hay confirmacion de que el modelo funcione correctamente con entradas de imagen.

## Enlaces

- Repositorio en Hugging Face: [unconst/Affine-5czsc2fc98-r473-online-dpo-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r473-online-dpo-merged)
- Modelo base: [kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft)
