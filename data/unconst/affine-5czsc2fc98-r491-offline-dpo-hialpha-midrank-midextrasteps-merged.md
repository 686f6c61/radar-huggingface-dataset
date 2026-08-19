# unconst/Affine-5czsc2fc98-r491-offline-dpo-hialpha-midrank-midextrasteps-merged

## Resumen

Affine-5czsc2fc98-r491-offline-dpo-hialpha-midrank-midextrasteps-merged es un checkpoint intermedio del proyecto Affine, desarrollado por el autor unconst. Se trata de un modelo de 35.107 millones de parametros (~35,1B) con arquitectura MoE basada en la familia Qwen 3.5, segun indican las etiquetas del repositorio, y con capacidades multimodales imagen-texto. El checkpoint resulta de fusionar un adaptador LoRA sobre el modelo base kevin954/Affine-5dfqbbh8ev-sft, tras un proceso de entrenamiento con DPO offline; los componentes del nombre ("hialpha", "midrank" y "midextrasteps") sugieren configuraciones especificas de alpha, rango y numero de pasos.

La model card es extremadamente escueta y describe el checkpoint como un "salvage" (rescate) con "seguro TTL privado", indicando que no es una version final ni una publicacion oficial, sino un artefacto intermedio de un pipeline de entrenamiento en curso. El repositorio no especifica licencia, idiomas soportados ni longitud de contexto, y no se han publicado benchmarks. Su relevancia actual es limitada: se trata de un snapshot de investigacion sin documentacion suficiente para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen 3.5 (etiqueta qwen3_5_moe), multimodal imagen-texto |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio, el modelo emplea una arquitectura de Mezcla de Expertos (MoE) de la familia Qwen 3.5, con capacidades de procesamiento multimodal imagen-texto. El checkpoint se obtiene fusionando un adaptador LoRA sobre el modelo base kevin954/Affine-5dfqbbh8ev-sft. El nombre del repositorio indica que el entrenamiento incluyo una fase de DPO offline (Direct Preference Optimization) con parametros especificos: alpha alto ("hialpha"), rango medio ("midrank") y un numero de pasos medio-extra ("midextrasteps"). No se dispone de informacion sobre el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron otras tecnicas como RLHF o SFT adicional.

La model card describe el checkpoint como "H1 merged checkpoint salvage" y menciona que es un "seguro TTL privado" que no constituye una submission hasta que se supere el "Stage-5 gate". Esto sugiere que forma parte de un pipeline de entrenamiento multi-etapa y que su publicacion tiene caracter provisional.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation de transformers).
- Procesamiento multimodal imagen-texto, segun las etiquetas del repositorio.
- Alineacion mediante DPO offline, orientada a preferencias humanas.
- Compatibilidad con endpoints de inferencia estandar (etiqueta endpoints_compatible).

No se dispone de informacion verificable sobre capacidades especificas como tool calling, razonamiento multi-paso o soporte de agentes.

## Casos de uso

Dada la naturaleza provisional del checkpoint y la ausencia de documentacion, los casos de uso son limitados:

- Evaluacion interna de tecnicas de DPO offline: investigadores pueden comparar este checkpoint con otras variantes del mismo proyecto (r29, r31, r451) para estudiar el efecto de distintos hiperparametros de DPO en la calidad del modelo.
- Reproduccion de experimentos: el checkpoint permite reproducir los resultados del pipeline Affine en su etapa intermedia, util para validar metodologias de entrenamiento.
- Investigacion sobre fusion LoRA en modelos MoE: el proceso de merge puede analizarse para estudiar la integridad de los pesos tras la fusion de adaptadores.
- Pruebas de inferencia multimodal: dado el tag image-text-to-text, puede probarse su comportamiento con entradas mixtas de imagen y texto, aunque sin documentacion no se garantizan resultados.
- Analisis de seguridad y alineacion: al ser un checkpoint de DPO, puede estudiarse como evoluciona la alineacion del modelo a lo largo del pipeline de entrenamiento.
- Desarrollo de pipelines de continuacion de entrenamiento: el checkpoint puede servir como punto de partida para etapas posteriores del proyecto Affine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 70 GB (dado el peso de 70,2 GB del repositorio en safetensors).
- VRAM estimada para inferencia en INT8: aproximadamente 35 GB.
- VRAM estimada para inferencia en INT4: aproximadamente 18 GB.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o multiples GPU consumer (por ejemplo, 2x RTX 4090 de 24 GB) para FP16.
- En GPU consumer: posible con cuantizacion INT4 en una RTX 4090 de 24 GB, aunque sin cuantizaciones publicadas no se puede confirmar compatibilidad.
- Opciones de despliegue: vLLM, TGI o transformers con pipeline estandar; la etiqueta endpoints_compatible sugiere compatibilidad con APIs de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados y su arquitectura exacta (Qwen 3.5 MoE) no es una familia publica documentada. Se pueden mencionar alternativas genericas de tamano similar (por ejemplo, Mixtral 8x7B con 46,7B parametros totales o Qwen2.5-MoE), pero sin datos de rendimiento del modelo evaluado, cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es utilizable comercialmente. Uso en produccion desaconsejado sin aclaracion legal.
- Checkpoint intermedio: la model card lo describe como "salvage" y "TTL insurance", indicando que no es una version final validada.
- Sin documentacion: no hay informacion sobre datos de entrenamiento, idiomas, contexto ni sesgos.
- Sin benchmarks: no se puede evaluar su calidad relativa frente a otros modelos.
- Riesgo de alucinacion: no evaluado, aplicable a cualquier modelo generativo sin validacion.
- Descargas y adopcion nulas: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por la comunidad.
- Posible obsolescencia: al ser un checkpoint de un pipeline en curso, puede quedar desactualizado rapidamente frente a versiones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r491-offline-dpo-hialpha-midrank-midextrasteps-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r31-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r29-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r451-online-dpo-lora
