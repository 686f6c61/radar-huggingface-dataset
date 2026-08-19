# unconst/Affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged

## Resumen

Affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged es un checkpoint derivado de kevin954/Affine-5dfqbbh8ev-sft mediante fusión de LoRA (LoRA-merged), publicado por el usuario unconst. Según las etiquetas del repositorio, se basa en la arquitectura Qwen3.5 MoE y declara soporte multimodal de imagen y texto (image-text-to-text), aunque el pipeline registrado es text-generation. El modelo cuenta con aproximadamente 35.100 millones de parámetros (35,1B) y un repositorio de 70,2 GB en formato safetensors.

La model card es extremadamente escueta: el autor lo describe como un "salvamento de checkpoint" (checkpoint salvage) con un seguro TTL privado y aclara explícitamente que no es una entrega final hasta que se supere la fase 5 (Stage-5 gate). Esto implica que el modelo debe considerarse experimental y no apto para producción sin validación adicional. El nombre del checkpoint incluye las siglas "odpo" e "hirank", que sugieren la aplicación de técnicas de optimización por preferencias, aunque no está documentado formalmente.

La relevancia de este checkpoint reside en su naturaleza de fusión LoRA sobre un modelo base ya afinado, lo que lo convierte en un candidato interesante para evaluar técnicas de merging y fine-tuning en arquitecturas MoE multimodales. No obstante, la ausencia de documentación técnica, licencia y benchmarks limita su utilidad práctica a entornos de investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según etiquetas) |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión LoRA (LoRA-merged) sobre el checkpoint kevin954/Affine-5dfqbbh8ev-sft, que a su vez es un fine-tuning del mismo linaje. La etiqueta qwen3_5_moe indica que la arquitectura subyacente es un modelo de mezcla de expertos (Mixture of Experts) de la familia Qwen3.5, aunque no se especifican detalles de la topología como el número de expertos o el tamaño de los expertos activos. La etiqueta image-text-to-text sugiere capacidades multimodales probablemente heredadas del modelo base, pero no se detalla el mecanismo de integración visual.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación aplicadas. Las siglas "odpo" en el nombre podrían referirse a Online DPO (Direct Preference Optimization) e "hirank" a una variante de ranking jerárquico, pero esto no está confirmado en la documentación. El autor indica que se trata de un "salvamento" con seguro TTL privado, lo que sugiere que el checkpoint se publicó como respaldo intermedio y no como un modelo final validado.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la etiqueta conversational indica soporte para diálogo multi-turno.
- Procesamiento multimodal imagen-texto: la etiqueta image-text-to-text sugiere que el modelo puede procesar entradas de imagen junto con texto, aunque no se detallan las capacidades exactas ni el mecanismo de codificación visual.
- Arquitectura MoE: al ser un modelo de mezcla de expertos, se espera una inferencia más eficiente que un modelo denso del mismo tamaño, aunque los parámetros activos no están documentados.
- Compatible con endpoints de inferencia: la etiqueta endpoints_compatible indica que el modelo puede desplegarse en plataformas de inferencia como FriendliAI.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso ni capacidades de agentes.

## Casos de uso

Dada la escasez de documentación, los casos de uso deben considerarse hipotéticos y requieren validación previa:

- Evaluación de técnicas de fusión LoRA: el checkpoint sirve como caso de estudio para investigar el impacto de fusionar adaptadores LoRA sobre un modelo base afinado, especialmente en arquitecturas MoE multimodales.
- Experimentación con alineación por preferencias: las siglas odpo e hirank en el nombre sugieren la aplicación de técnicas de optimización por preferencias; los investigadores pueden analizar el efecto de estas técnicas comparando con el modelo base.
- Prototipado de aplicaciones conversacionales: si las capacidades se confirman, podría usarse para prototipos de chatbots o asistentes virtuales, aunque no se recomienda para producción sin validación.
- Investigación en modelos MoE multimodales: el modelo puede servir como referencia para estudiar el comportamiento de arquitecturas MoE con entradas multimodales.
- Benchmarking de infraestructura: el tamaño de 35,1B parámetros permite probar estrategias de despliegue, cuantización y optimización de inferencia en diferentes hardware.
- Análisis de seguridad y sesgos: al ser un checkpoint intermedio, puede utilizarse para estudiar cómo evolucionan los sesgos y comportamientos durante el proceso de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 35.107.181.936 parámetros (~35,1B). En precisión FP16, los pesos ocupan aproximadamente 70,2 GB, lo que coincide con el tamaño del repositorio.
- Para inferencia en FP16 se necesitan al menos 80 GB de VRAM, lo que requiere GPUs como NVIDIA A100 (80 GB), H100 (80 GB) o similares.
- Con cuantización a 8 bits, la memoria necesaria se reduce a ~35 GB, lo que permite su ejecución en GPUs como A6000 (48 GB) o A100 (40 GB), pero no en GPUs de consumo como RTX 4090 (24 GB).
- Con cuantización a 4 bits, la memoria se reduce a ~17,5 GB, lo que permitiría su ejecución en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB), aunque con posible pérdida de calidad.
- No se han publicado pesos en formato GGUF ni AWQ, por lo que las opciones de cuantización dependen de conversiones manuales.
- Opciones de despliegue: la etiqueta endpoints_compatible sugiere compatibilidad con plataformas como FriendliAI, vLLM o TGI, aunque no se confirma explícitamente.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo se basa en la arquitectura Qwen3.5 MoE, pero no se conocen los parámetros activos, la longitud de contexto ni los resultados de benchmarks. Los checkpoints relacionados del mismo autor (Affine-5czsc2fc98-h56-merged, Affine-5czsc2fc98-r3-merged) parecen ser variantes del mismo linaje, pero no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- Documentación extremadamente escasa: la model card no proporciona información sobre entrenamiento, datos, licencia ni capacidades verificadas.
- Checkpoint experimental: el autor lo describe como un "salvamento" con seguro TTL privado y aclara que no es una entrega final. No debe usarse en producción.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no especificados: se desconoce qué idiomas soporta el modelo y con qué calidad.
- Riesgo de alucinación y sesgos: al no documentarse el dataset de entrenamiento ni las técnicas de alineación, no es posible evaluar los riesgos de sesgo o alucinación.
- Sin benchmarks: no hay métricas que permitan evaluar la calidad del modelo frente a alternativas.
- Posible inestabilidad: al ser un checkpoint intermedio fusionado, el comportamiento puede ser impredecible en comparación con el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado (h56): https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
- Checkpoint relacionado (r3): https://huggingface.co/unconst/Affine-5czsc2fc98-r3-merged
- Página de inferencia FriendliAI (h56): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h56-merged
- Página de inferencia FriendliAI (h1): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
