# wonderland21127/REAX-G2-Distill-v5

## Resumen

REAX-G2-Distill-v5 es un modelo de 31.273.086.512 parametros (aproximadamente 31,3 mil millones) publicado por el usuario wonderland21127 en Hugging Face. Se distribuye como un fine-tuning del modelo tattrongvu/Jeffan-31b-1710 y esta etiquetado con la arquitectura `gemma4`, lo que sugiere que hereda la familia arquitectonica de Gemma. El pipeline declarado es `text-classification`, aunque las etiquetas incluyen tambien `image-text-to-text` y `multiple-choice`, lo que apunta a un uso orientado a toma de decisiones y clasificacion multimodal mas que a generacion abierta.

El modelo se presenta bajo el paraguas de "REAX", con etiquetas que mencionan decision-making y multiple-choice, lo que indica que el fine-tuning se ha orientado a tareas de seleccion entre opciones y razonamiento estructurado. No obstante, la informacion publica disponible es muy limitada: no hay model card detallada, no se declaran idiomas soportados y no se han publicado resultados de benchmarks. El repositorio tiene un tamano de 62,6 GB, coherente con pesos en precision alta (probablemente bf16/fp16) para 31,3 mil millones de parametros.

Su relevancia actual es limitada y experimental: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated) y publicado en noviembre de 2026. Resulta util como caso de estudio de fine-tuning sobre la familia Gemma 4, pero no debe considerarse un modelo consolidado para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (familia Gemma 4, segun tag `gemma4`) |
| Parametros totales | 31.273.086.512 (31,3 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | tattrongvu/Jeffan-31b-1710 |
| Pipeline declarado | text-classification |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La etiqueta `gemma4` indica que el modelo parte de la arquitectura de la familia Gemma 4 de Google, un transformer decoder-only. El modelo base declarado es tattrongvu/Jeffan-31b-1710, sobre el que se ha realizado un fine-tuning adicional (tag `base_model:finetune`). El nombre "Distill-v5" sugiere un proceso de destilacion, probablemente desde un modelo mayor o mediante destilacion de razonamiento, aunque no se documenta la metodologia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detalla si el entrenamiento incluyo datos multimodales (pese al tag `image-text-to-text`) ni si se emplearon tecnicas de decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, orientado a etiquetado y categorizacion.
- Toma de decisiones y multiple-choice: las etiquetas `decision-making` y `multiple-choice` indican entrenamiento para seleccionar entre opciones.
- Procesamiento image-text-to-text: el tag sugiere capacidad multimodal de entrada imagen+texto, aunque no se documenta su alcance.
- Razonamiento estructurado: el sufijo "Distill" y la orientacion a decision-making apuntan a tareas de razonamiento guiado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): vision posiblemente por el tag, no confirmado; audio no disponible.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar categorias a incidencias entrantes gracias a su pipeline de text-classification, integrandose en un sistema de triaje previo a la atencion humana.
- Seleccion de respuestas en sistemas de QA: su entrenamiento en multiple-choice permite puntuar y elegir entre respuestas candidatas generadas por otro modelo, actuando como reranker o juez.
- Evaluacion automatizada de modelos (LLM-as-a-judge): puede emplearse para decidir cual de varias salidas es preferible en pipelines de evaluacion, dado su enfoque a decision-making.
- Filtrado de contenido en moderacion: clasificacion de textos o pares imagen-texto en categorias de riesgo, siempre que se valide su comportamiento en el dominio concreto.
- Enrutamiento en sistemas multiagente: decidir que herramienta o subagente debe atender una peticion segun el texto de entrada.
- Investigacion sobre destilacion: como objeto de estudio para analizar como se comporta un fine-tuning de 31 B orientado a clasificacion frente a su modelo base.
- Clasificacion multimodal experimental: si se confirma la capacidad image-text-to-text, podria usarse para categorizar pares imagen-texto en tareas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 32-35 GB (no se distribuyen pesos cuantizados oficialmente, habria que generarlos).
- VRAM estimada en cuantizacion 4 bits: en torno a 18-22 GB, lo que permitiria ejecucion en GPUs consumer de gama alta.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; RTX 4090 (24 GB) solo viable con cuantizacion 4 bits agresiva y contexto reducido.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizacion 4 bits; no en precision nativa.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI y llama.cpp no estan confirmados para esta arquitectura concreta y requeririan validacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| REAX-G2-Distill-v5 | 31,3 B | no disponible | apache-2.0 | gated | Fine-tuning de Jeffan-31b-1710, orientado a clasificacion |
| tattrongvu/Jeffan-31b-1710 (base) | ~31 B | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 3 27B (referencia de familia) | 27 B | 128K (segun version) | Gemma license | abierto | Alternativa consolidada de tamano similar |
| Qwen2.5 32B (referencia de tamano) | 32,5 B | 128K | Apache 2.0 | abierto | Alternativa generalista de tamano comparable |

La comparativa con modelos consolidados es orientativa: no hay datos de rendimiento de REAX-G2-Distill-v5 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, datos o evaluacion.
- Sin benchmarks publicados: imposible estimar su calidad frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para uso en produccion.
- Cero traccion comunitaria: 0 descargas y 0 likes, sin evidencia de validacion por terceros.
- Riesgo de alucinacion: no evaluado; al ser un modelo de clasificacion, el riesgo se traslada a etiquetas erroneas.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni calidad en castellano.
- Capacidad multimodal no confirmada: el tag `image-text-to-text` no esta respaldado por documentacion.
- Licencia apache-2.0 declarada, pero conviene verificar que el modelo base Jeffan-31b-1710 permita la redistribucion bajo esa licencia.
- No apto para produccion sin evaluacion propia en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-Distill-v5
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
