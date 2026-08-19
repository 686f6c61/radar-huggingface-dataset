# standjones/mirror-unconst-affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged

## Resumen

El modelo `standjones/mirror-unconst-affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged` es un checkpoint experimental derivado de la serie Affine, desarrollado por el usuario standjones. Se trata de una fusión LoRA (LoRA-merged) sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un ajuste fino de un modelo Qwen3.5 MoE, según las etiquetas del repositorio. El nombre del checkpoint sugiere la aplicación de técnicas como ODPO (Online Direct Preference Optimization), ranking jerárquico, contexto suave y expansión de contexto medio, aunque no existe documentación oficial que lo confirme.

Con 35.107.181.936 parámetros totales (35,1 mil millones), el modelo se posiciona en la gama de los MoE de gran tamaño. El repositorio ocupa 70,2 GB en formato safetensors, lo que indica que se distribuye en precisión completa (probablemente FP16 o BF16). A pesar de la etiqueta `image-text-to-text`, el pipeline declarado es `text-generation`, lo que sugiere que la capacidad multimodal no está garantizada o es residual. No se especifican licencia, idiomas soportados ni longitud de contexto.

Este checkpoint parece ser un artefacto intermedio de un proceso de entrenamiento o fusión, con fines de "seguro TTL privado" según la model card, y no está destinado a producción. Su relevancia radica en ser un ejemplo de la experimentación abierta con arquitecturas MoE y técnicas de alineación avanzadas, aunque carece de la madurez necesaria para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (segun etiqueta, no confirmado oficialmente) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es presumiblemente un transformer de mezcla de expertos (MoE), basado en la familia Qwen3.5, aunque no se proporcionan detalles sobre el número de expertos, la dimensión oculta o el mecanismo de atención. El modelo se construyó mediante la fusión de adaptadores LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un ajuste fino de un modelo base no especificado. El nombre del checkpoint incluye referencias a ODPO (optimización directa de preferencias en línea), `hirank` (posiblemente ranking jerárquico), `softctx` (contexto suave) y `midextra` (expansión de contexto medio), lo que sugiere que se aplicaron técnicas de alineación y manejo de contexto durante el entrenamiento. Sin embargo, no hay información pública sobre el dataset, el número de tokens de entrenamiento o los hiperparámetros utilizados.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que puede generar texto coherente en funcion de un prompt.
- Posible capacidad multimodal: la etiqueta `image-text-to-text` sugiere que el modelo podria procesar imagenes y texto, aunque no se ha verificado y el pipeline no lo refleja.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso.
- Capacidades multilingues: no especificadas.

## Casos de uso

No se han documentado casos de uso especificos para este checkpoint. Dado su caracter experimental y la falta de informacion sobre su rendimiento, no es recomendable utilizarlo en aplicaciones de produccion. Los unicos escenarios plausibles serian:

- Investigacion academica: como objeto de estudio para analizar el efecto de las tecnicas de fusion LoRA y ODPO en modelos MoE.
- Desarrollo experimental: para probar la viabilidad de tecnicas de alineacion en modelos de gran tamano antes de aplicarles a versiones estables.
- Reentrenamiento o continuacion del ajuste: como punto de partida para nuevos experimentos de fine-tuning.
- Evaluacion comparativa interna: para medir el impacto de diferentes estrategias de entrenamiento en un mismo modelo base.
- Arqueologia de modelos: para rastrear la evolucion de la serie Affine y sus checkpoints intermedios.
- Pruebas de infraestructura: para validar pipelines de inferencia con modelos MoE de gran tamano en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B de parametros en FP16, se necesitarian aproximadamente 70 GB de VRAM para cargar el modelo completo. Con cuantizacion a 8 bits se reduciria a unos 35 GB, y a 4 bits a unos 18 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para FP16 se requieren multiples GPU de alta gama (por ejemplo, 2x A100 80 GB o 2x H100 80 GB). Con cuantizacion, una RTX 4090 (24 GB) podria ser suficiente en 4 bits, aunque no hay archivos GGUF disponibles.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones optimizadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo pertenece a una serie experimental sin datos publicos de rendimiento. Como referencia, otros modelos MoE de tamano similar (como Mixtral 8x7B con 47 B totales) tienen documentacion extensa, pero no son directamente comparables por la falta de datos de este checkpoint.

## Limitaciones y advertencias

- Checkpoint experimental: la model card indica que es un "salvage" (rescate) y que no es una submission hasta que se supere una fase de validacion. No esta preparado para uso en produccion.
- Licencia no disponible: no se puede determinar si es de codigo abierto o si tiene restricciones de uso comercial.
- Sin documentacion: no hay informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- Posible inestabilidad: al ser un checkpoint intermedio de un proceso de entrenamiento, puede presentar comportamientos erraticos o degradados.
- Idiomas no especificados: no se garantiza un rendimiento adecuado en espanol u otros idiomas.
- Tamano del repositorio: 70,2 GB, lo que dificulta su descarga y despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r561-r252-odpo-hirank-softctx-midextra-merged
- Modelo base (kevin954/Affine-5dfqbbh8ev-sft): https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado (unconst/Affine-5czsc2fc98-h47-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-h47-merged
- Checkpoint relacionado (unconst/Affine-5czsc2fc98-r171-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-r171-merged
