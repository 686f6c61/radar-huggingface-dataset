# unconst/Affine-5czsc2fc98-r368-offline-dpo-long-merged

## Resumen

`unconst/Affine-5czsc2fc98-r368-offline-dpo-long-merged` es un checkpoint intermedio de investigación, publicado como "salvamento" (salvage) por el usuario `unconst`. Se trata de un merge de LoRA aplicado sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tuning de un modelo de la familia Affine-H1. Los metadatos de HuggingFace indican que la arquitectura subyacente corresponde a un modelo MoE de la serie Qwen3.5 (tag `qwen3_5_moe`) con capacidades multimodales (`image-text-to-text`), aunque no se proporciona documentación oficial que confirme estos detalles.

El modelo tiene 35.107.181.936 parámetros (aproximadamente 35B) y un tamaño de repositorio de 70,2 GB en formato `safetensors`. La model card es extremadamente escueta: solo indica que es un "H1 merged checkpoint salvage", un "LoRA-merged" del modelo base, y añade la nota "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que no es una versión final ni apta para producción. No se especifican licencia, idiomas, contexto ni detalles de entrenamiento. Con 0 descargas y 0 likes, parece un artefacto experimental de un pipeline privado de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), multimodal (tag `image-text-to-text`) - no confirmado |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre sugiere "long", pero sin valor concreto) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible es muy limitada. Los tags de HuggingFace indican que el modelo pertenece a la familia `qwen3_5_moe`, lo que apunta a una arquitectura de mezcla de expertos (Mixture of Experts) con atencion por ventanas deslizantes o similar, tipica de los modelos Qwen recientes. Tambien aparece el tag `image-text-to-text`, lo que sugiere que el modelo base original podria ser multimodal (capaz de procesar imagenes y texto), aunque no se confirma si este checkpoint conserva esa capacidad.

El proceso de entrenamiento, segun el nombre del repositorio, incluye una etapa de DPO (Direct Preference Optimization) offline con contexto largo (`offline-dpo-long`), aplicada sobre un fine-tuning previo (`kevin954/Affine-5dfqbbh8ev-sft`). El resultado es un merge de LoRA, no un entrenamiento completo. No se dispone de datos sobre el dataset utilizado, el numero de tokens de entrenamiento, ni las tecnicas de optimizacion empleadas. La model card no aporta ninguna informacion adicional.

## Capacidades

No se puede confirmar ninguna capacidad especifica debido a la ausencia de documentacion. Los unicos indicios provienen de los tags:

- Generacion de texto conversacional (pipeline `text-generation`).
- Posible soporte multimodal (tag `image-text-to-text`), aunque no verificado.
- Arquitectura MoE, que en otros modelos de la familia Qwen3.5 suele ofrecer buen rendimiento en razonamiento y codigo, pero no hay evidencia para este checkpoint concreto.
- No se menciona tool calling, agentes, ni capacidades multilingues.

Dado que es un checkpoint de salvamento intermedio, es probable que no haya sido evaluado de forma exhaustiva.

## Casos de uso

Al tratarse de un artefacto de investigacion sin validacion publica, no se recomienda su uso en entornos de produccion. Los casos de uso plausibles son:

- Investigacion y experimentacion: servir como punto de partida para continuar fine-tuning o para estudiar el efecto de la etapa DPO offline con contexto largo.
- Reproduccion de experimentos: si el autor publica el pipeline completo, otros investigadores podrian replicar el proceso de merge y DPO.
- Evaluacion comparativa interna: comparar este checkpoint con el modelo base `kevin954/Affine-5dfqbbh8ev-sft` para medir el impacto del DPO.
- Desarrollo de modelos derivados: usarlo como base para nuevos merges o adaptaciones, siempre que la licencia (desconocida) lo permita.
- Pruebas de infraestructura: validar la carga de modelos MoE de 35B en diferentes frameworks de inferencia (vLLM, TGI, etc.).
- Analisis de sesgos y alucinaciones: estudiar el comportamiento de un modelo entrenado con DPO offline en tareas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar para este checkpoint.

## Requisitos de hardware

No se especifican requisitos oficiales. A partir del tamano de los pesos (70,2 GB en safetensors, 35B parametros totales), se puede estimar:

- VRAM minima para inferencia en precision FP16: aproximadamente 70 GB (cabe en una A100 de 80 GB o en dos RTX 4090 con tensor parallelism).
- Con cuantizacion 4-bit (si se generara un GGUF o AWQ), la VRAM necesaria rondaria los 20-25 GB, lo que permitiria ejecutarlo en una RTX 3090/4090, pero no hay archivos cuantizados publicados.
- Dado que es un MoE, los parametros activos por token seran menores que el total, pero se desconoce el ratio de activacion.
- Opciones de despliegue: al estar en formato safetensors, es compatible con vLLM, TGI, Transformers y llama.cpp (si se convierte a GGUF). No hay configuraciones recomendadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo podria compararse con otros MoE de ~35B como Qwen3-30B-A3B o DeepSeek-V2-Lite, pero al no haber benchmarks ni confirmacion de la arquitectura exacta, cualquier comparacion seria especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Checkpoint intermedio: la propia model card lo define como "salvage" y "not a submission", lo que implica que no ha pasado controles de calidad ni evaluaciones completas.
- Licencia desconocida: no se indica ninguna licencia, por lo que su uso comercial o incluso academico puede estar restringido. Se debe contactar con el autor antes de cualquier uso.
- Documentacion inexistente: no hay informacion sobre sesgos, alucinaciones, idiomas soportados ni limitaciones de contexto.
- Posible inestabilidad: al ser un merge de LoRA sobre un fine-tuning, puede presentar comportamientos erraticos o degradacion en tareas no cubiertas por el dataset de DPO.
- Sin garantias de reproducibilidad: el nombre sugiere un proceso especifico (offline DPO, contexto largo), pero no se publican los datos ni los hiperparametros.
- Riesgo de seguridad: al no estar auditado, podria generar contenido inapropiado o inseguro si se usa en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r368-offline-dpo-long-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- No se han encontrado papers, blogs ni demos asociados a este modelo.
