# unconst/Affine-5czsc2fc98-r517-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r517-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged` es un checkpoint fusionado (LoRA merge) a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de un modelo de la familia Qwen3.5 MoE, según los tags de HuggingFace. Con 35.107 millones de parámetros totales, se trata de un modelo de gran tamaño, probablemente con arquitectura de mezcla de expertos (MoE). El autor lo describe como un "salvamento" de checkpoint privado, con una finalidad interna ("Private TTL insurance") y no como una versión oficial para producción. La información pública es extremadamente limitada: no se especifican licencia, idiomas, contexto ni detalles de entrenamiento. Su relevancia actual es baja, ya que parece un experimento intermedio dentro de un proceso de desarrollo más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`), posiblemente basada en Qwen3.5 |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, tamaño 70.2 GB, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según los tags de HuggingFace, el modelo pertenece a la familia `qwen3_5_moe`, lo que indica una arquitectura de mezcla de expertos (MoE) típica de los modelos Qwen recientes. El nombre del checkpoint sugiere un proceso de entrenamiento con DPO (Direct Preference Optimization) offline, con hiperparámetros específicos: alpha alto (`hialpha`), rango medio (`midrank`), beta bajo (`lobeta`), contexto largo (`longctx`) y pasos extra de entrenamiento (`ultraextrasteps`). Además, el tag `affine-h1-merged-salvage` indica que se trata de un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Sin embargo, no se dispone de información detallada sobre el dataset utilizado, el número de tokens de entrenamiento, ni la composición exacta de los datos. Tampoco se documentan innovaciones técnicas específicas más allá de lo que sugiere el nombre.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo está diseñado para producir texto.
- Conversación: el tag `conversational` indica capacidad para mantener diálogos multi-turno.
- Posible soporte multimodal: el tag `image-text-to-text` sugiere que el modelo podría procesar imágenes junto con texto, aunque el pipeline principal es solo texto y no hay documentación que confirme esta capacidad.
- No se dispone de información sobre tool calling, razonamiento avanzado, matemáticas, código o capacidades multilingües.

## Casos de uso

No se puede determinar casos de uso concretos debido a la falta de documentación oficial. El autor no ha publicado ejemplos de aplicación ni benchmarks. Dado que es un checkpoint intermedio con fines privados, no se recomienda su uso en producción sin una evaluación previa exhaustiva. Cualquier aplicación práctica requeriría primero validar el comportamiento del modelo en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- El modelo tiene 35.107 millones de parámetros. En precisión BF16, el peso ocupa aproximadamente 70 GB (35B × 2 bytes), lo que coincide con el tamaño del repositorio (70.2 GB).
- Para inferencia en BF16 se necesitaría al menos una GPU con 80 GB de VRAM, como una A100 80GB o H100 80GB.
- Si se aplicara cuantización (por ejemplo, 8 bits o 4 bits), el requisito de VRAM bajaría a unos 35 GB y 18 GB respectivamente, pero no se han publicado versiones cuantizadas.
- Al ser un modelo MoE, los parámetros activos podrían ser menores, lo que reduciría la memoria necesaria durante la inferencia, pero se desconoce el número exacto de expertos activos.
- Opciones de despliegue: no se especifican, pero al ser compatible con transformers, podría usarse con vLLM, TGI o llama.cpp si se convierte a GGUF. No hay garantías de compatibilidad con Ollama.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia o con el mismo tamaño y características, debido a la falta de información pública sobre este checkpoint.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card detallada, ni especificaciones de licencia, ni información sobre el entrenamiento.
- El autor indica que es un "salvamento" privado y no una versión para envío o producción ("not a submission until Stage-5 gate clears").
- Riesgo de alucinaciones y sesgos: al no conocer el dataset de entrenamiento, no se puede evaluar su comportamiento en estos aspectos.
- Posible incompatibilidad con versiones futuras de transformers o de la familia Qwen.
- No se recomienda su uso en aplicaciones comerciales o críticas sin una validación exhaustiva previa.

## Enlaces

- [HuggingFace - unconst/Affine-5czsc2fc98-r517-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r517-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged)
- [Modelo base: kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (no se ha verificado su disponibilidad)
