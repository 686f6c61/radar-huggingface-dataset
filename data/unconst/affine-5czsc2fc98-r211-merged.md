# unconst/Affine-5czsc2fc98-r211-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r211-merged` es un checkpoint de generación de texto publicado por el usuario `unconst` en Hugging Face. Se trata de un merge LoRA realizado a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tune de un modelo previo. Según la model card, el autor lo describe como un "H1 merged checkpoint salvage" con la nota "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un checkpoint intermedio de un proceso de desarrollo, no una versión final destinada a producción.

El modelo cuenta con 35.107.181.936 parámetros (aproximadamente 35,1 mil millones) y un tamaño de repositorio de 139,6 GB, lo que indica que se distribuye en formato `safetensors`. Los tags del modelo incluyen `qwen3_5_moe`, lo que apunta a una arquitectura basada en el mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no hay confirmación oficial en la documentación disponible. La licencia, los idiomas soportados y la longitud de contexto no están especificados en la información pública.

Dada la escasez de datos técnicos y la naturaleza provisional del checkpoint, este modelo no parece adecuado para uso en producción sin una evaluación adicional. Su interés principal radica en ser un artefacto de un proceso de desarrollo en curso, posiblemente relacionado con experimentos de fusión de modelos o ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren `qwen3_5_moe`, sin confirmacion) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los tags de Hugging Face incluyen `qwen3_5_moe`, lo que sugiere que podria tratarse de un modelo de mezcla de expertos (MoE) de la serie Qwen 3.5, pero no hay documentacion oficial que lo confirme. El modelo es el resultado de un merge LoRA aplicado sobre `kevin954/Affine-5dfqbbh8ev-sft`, un fine-tune de un modelo base no especificado. No se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. El autor menciona que es un "checkpoint de salvamento" y que no es una submission final, lo que indica que el proceso de entrenamiento o fusion podria estar aun en curso.

## Capacidades

No se ha publicado informacion sobre las capacidades especificas del modelo. Al ser un modelo de generacion de texto, se espera que pueda realizar tareas de conversacion, generacion de texto y posiblemente razonamiento, pero no hay datos concretos sobre:

- Generacion de texto, razonamiento, codigo o matematicas
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Capacidades multilingues
- Modos especiales (thinking, vision, audio, etc.)

Toda esta informacion se considera no disponible.

## Casos de uso

No se pueden proporcionar casos de uso concretos debido a la falta de informacion sobre las capacidades reales del modelo. El checkpoint parece ser un artefacto intermedio de un proceso de desarrollo, por lo que no se recomienda su uso en aplicaciones practicas sin una evaluacion exhaustiva previa. Se sugiere esperar a que el autor publique una version final con documentacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Dado que el modelo tiene aproximadamente 35,1 mil millones de parametros, se puede estimar de forma orientativa los requisitos de hardware, aunque no hay datos oficiales:

- En precision fp16, el modelo ocuparia alrededor de 70 GB de VRAM, lo que requiere GPUs de clase profesional como A100 (80 GB) o H100 (80 GB).
- En cuantizacion int8, el peso se reduciria a unos 35 GB, permitiendo su ejecucion en una RTX 4090 (24 GB) no es suficiente, pero si en una A6000 (48 GB) o similar.
- En cuantizacion int4, el peso se reduciria a unos 17,5 GB, lo que permitiria su ejecucion en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB).
- El tamaño del repositorio (139,6 GB) sugiere que se incluyen multiples archivos, posiblemente en diferentes precisiones, pero no se confirma.

Para despliegue, se podrian usar frameworks como vLLM, llama.cpp, Ollama o TGI, pero no hay informacion sobre compatibilidad especifica. La latencia y el throughput dependen en gran medida del hardware y de la arquitectura exacta, que no se conoce.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Dado que no se conoce la arquitectura exacta ni el rendimiento, no es posible establecer una comparativa fiable con otras alternativas.

## Limitaciones y advertencias

- El modelo es un checkpoint provisional ("salvage") y no una version final; el propio autor indica que no es una submission hasta que se supere una fase de validacion.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial o modificacion.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva de calidad y seguridad.
- La falta de documentacion tecnica detallada impide conocer sus limitaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unconst/Affine-5czsc2fc98-r211-merged
- Variante r216: https://huggingface.co/unconst/Affine-5czsc2fc98-r216-merged
- Variante r4-fullft: https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft
- Despliegue en FriendliAI (variante h1-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
- Despliegue en FriendliAI (variante h61-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h61-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
