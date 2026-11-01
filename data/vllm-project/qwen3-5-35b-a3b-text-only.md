# vllm-project/Qwen3.5-35B-A3B-text-only

## Resumen

Qwen3.5-35B-A3B-text-only es una version solo-texto de los pesos del modelo multimodal Qwen3.5-35B-A3B de Alibaba Qwen, publicada por el equipo de vLLM como copia de un checkpoint previo alojado en una cuenta personal. El repositorio elimina el codificador de vision y los pesos MTP del checkpoint original y reexpone los pesos del backbone linguistico con la arquitectura `Qwen3_5MoeForCausalLM`, de modo que pueda cargarse directamente en vLLM sin el envoltorio `Qwen3_5MoeForConditionalGeneration`.

Se trata de un modelo de mezcla de expertos (MoE) con 34.152.051.328 parametros totales y aproximadamente 3.000 millones activos por token, lo que situa su coste de inferencia en el rango de un modelo denso de 3B pese a disponer de la capacidad de representacion de un modelo de 35B. La arquitectura combina capas hibridas GatedDeltaNet con atencion completa y un enrutador disperso de expertos, una eleccion que busca reducir el coste de atencion en contextos largos manteniendo calidad de razonamiento.

Su relevancia es fundamentalmente de infraestructura: el checkpoint existe para que la CI de vLLM disponga de un artefacto estable y auditable con el que validar la ruta de codigo `Qwen3_5MoeForCausalLM`, sin depender de un repositorio en una cuenta personal. Para desarrolladores que quieran servir la variante textual de Qwen3.5 en produccion, es un punto de partida valido, aunque conviene tener presente que no es el checkpoint canonico del autor original y que la model card no documenta datos de entrenamiento, idiomas ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GatedDeltaNet + atencion completa, mezcla de expertos dispersa (MoE); clase `Qwen3_5MoeForCausalLM` |
| Parametros totales | 34.152.051.328 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al estar en safetensors bfloat16, admite cuantizacion posterior con herramientas estandar (GPTQ, AWQ, FP8, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), repo de 68,3 GB |
| Tipo de modelo | solo texto (`model_type: qwen3_5_moe_text`) |
| Modelo base | Qwen/Qwen3.5-35B-A3B (VLM MoE) |
| Fecha de publicacion | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo emplea una pila de capas hibridas que alterna bloques GatedDeltaNet (una variante de atencion lineal con estado recurrente y compuerta) con bloques de atencion completa, sobre un backbone de mezcla de expertos dispersa. El enrutador activa aproximadamente 3.000 millones de parametros por token de los 34.152 millones totales, de modo que el coste computacional por token se aproxima al de un modelo denso de 3B mientras la memoria de pesos exige alojar el total. Esta combinacion de atencion lineal y atencion completa es la misma familia de disenos hibridos que otros modelos recientes han adoptado para abaratar la atencion en secuencias largas.

El checkpoint original es un VLM: el repositorio de HuggingFace usa `Qwen3_5MoeForConditionalGeneration` con pesos prefijados como `model.language_model.*` e incluye un codificador de vision y pesos MTP (multi-token prediction). Esta version elimina ambos componentes, reescribe las claves a `model.layers.*` en formato causal LM estandar y declara `architectures: ["Qwen3_5MoeForCausalLM"]`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del backbone linguistico de Qwen3.5-35B-A3B.
- Generacion de codigo y resolucion de tareas de matematicas, segun la capacidad declarada del modelo base (sin evaluaciones publicadas en esta model card).
- Capacidad MoE con ~3B parametros activos: buen equilibrio entre calidad y coste de inferencia por token.
- Soporte de tool calling y function calling: no documentado en esta model card; depende del chat template y de la configuracion de vLLM. Verificar en el modelo base.
- Razonamiento multi-paso y uso como agente: no documentado explicitamente; el modelo base Qwen3.5 incluye modos de razonamiento segun la familia, pero esta copia no lo declara.
- Capacidades multilingues: no disponibles en esta model card.
- Vision: **no soportada** en esta variante (codificador eliminado).
- MTP (multi-token prediction): **no incluido** en esta variante (pesos eliminados).

## Casos de uso

- Servicio de chat de texto en produccion: el modelo puede desplegarse en vLLM con `tensor_parallel_size=2` y servir conversaciones multi-turno con un coste por token cercano al de un modelo de 3B activos, lo que abarata el escalado horizontal frente a un denso de 35B.
- Validacion de la ruta `Qwen3_5MoeForCausalLM` en vLLM: es su proposito declarado; util para integradores que necesiten un checkpoint estable y versionado con el que ejecutar tests de regresion de kernels y del parser de arquitecturas hibridas.
- Generacion de codigo en pipelines internos: al ser solo texto y Apache 2.0, puede integrarse en herramientas de autocompletado o revision de codigo sin las dependencias de un codificador de vision.
- Procesamiento por lotes de documentos: con un MoE de 3B activos y pesos bfloat16, es viable ejecutar inferencia offline de alto volumen en un nodo con dos GPU de 80 GB, priorizando throughput sobre latencia interactiva.
- Fine-tuning supervisado (SFT) sobre dominio propio: al estar en safetensors bfloat16 y con licencia Apache 2.0, admite ajuste fino con frameworks estandar (Axolotl, TRL, Unsloth para variantes cuantizadas) sin restricciones de uso comercial.
- Destilacion o generacion de datos sinteticos: su relacion calidad/coste (35B de capacidad, 3B de computo por token) lo hace adecuado como generador de datos de entrenamiento en lote, donde el throughput importa mas que la latencia.
- Entornos con restricciones de vision: si el pipeline no necesita imagenes, esta variante evita cargar el codificador y reduce el consumo de VRAM respecto al checkpoint VLM original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta copia no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se ha proporcionado la model card del modelo base Qwen/Qwen3.5-35B-A3B con sus cifras.

## Requisitos de hardware

- VRAM para pesos en bfloat16: aproximadamente 68 GB solo para pesos (34.152 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV. En la practica, dos GPU de 80 GB (A100/H100) con tensor paralelismo 2 es la configuracion minima razonable, tal como sugiere el ejemplo de la model card.
- VRAM en cuantizacion de 8 bits (FP8/INT8): en torno a 34-36 GB de pesos; cabe en una H100 80 GB o A100 80 GB con margen para cache KV, o en dos RTX 4090 de 24 GB con tensor paralelismo.
- VRAM en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 18-20 GB de pesos; cabe en una RTX 4090 de 24 GB o en una RTX 3090 de 24 GB, con contexto limitado.
- GPU recomendadas: H100 80 GB o A100 80 GB para bfloat16 sin cuantizar; RTX 4090 / RTX 3090 para cuantizaciones de 4-8 bits; L40S 48 GB como opcion intermedia.
- Opciones de despliegue: vLLM es el destino declarado del checkpoint (soporte nativo de `Qwen3_5MoeForCausalLM`). Para cuantizaciones GGUF, llama.cpp u Ollama requieren conversion previa y soporte de la arquitectura hibrida GatedDeltaNet, que puede no estar disponible; verificar en la version concreta. TGI y SGLang: no confirmado para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, con ~3B parametros activos por token el coste de computo por token es bajo, pero el modelo sigue requiriendo leer expertos desde memoria, por lo que el throughput depende fuertemente del ancho de banda y del grado de paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vllm-project/Qwen3.5-35B-A3B-text-only | 34,15B / ~3B | no disponible | Apache 2.0 | safetensors (bf16) | Solo texto, sin vision ni MTP; checkpoint de CI |
| Qwen/Qwen3.5-35B-A3B (base) | ~35B / ~3B | no disponible | Apache 2.0 (segun esta copia) | safetensors | VLM completo, incluye vision y MTP; checkpoint canonico |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion principal es contra el propio modelo base: esta variante es funcionalmente un subconjunto (solo texto, sin MTP) con la ventaja de un formato de pesos mas simple para vLLM y la desventaja de no ser el artefacto mantenido por el autor original.

## Limitaciones y advertencias

- No es el checkpoint canonico: es una copia de un repositorio en una cuenta personal (`codecho`), replicada por el equipo de vLLM para reducir riesgo de cadena de suministro. Para produccion a largo plazo, conviene evaluar migrar al checkpoint oficial de Qwen cuando este disponible en el formato adecuado.
- Elimina el codificador de vision: no puede procesar imagenes ni tareas multimodales, aunque el modelo base si pueda.
- Elimina los pesos MTP: no se puede usar decodificacion especulativa basada en multi-token prediction nativa del modelo.
- Sin datos de entrenamiento ni evaluaciones publicadas: no hay informacion sobre tokens de entrenamiento, composicion del corpus, RLHF/DPO, sesgos conocidos ni tasas de alucinacion. Cualquier afirmacion sobre calidad debe validarse empiricamente.
- Idiomas no documentados: no se puede asumir cobertura multilingue sin verificar; probar el castellano en el caso de uso concreto antes de desplegar.
- Longitud de contexto no documentada: la arquitectura hibrida con GatedDeltaNet sugiere soporte de secuencias largas, pero el valor exacto debe consultarse en la configuracion del modelo base; no asumir 128K o similar sin confirmarlo.
- Soporte de tool calling no verificado: depende del chat template y de la version de vLLM; probar antes de construir agentes sobre el modelo.
- Compatibilidad de despliegue limitada: la arquitectura hibrida MoE puede no estar soportada en todas las versiones de llama.cpp, Ollama, TGI o SGLang. Verificar la matriz de soporte de cada herramienta.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser una copia derivada conviene conservar los avisos de atribucion del modelo base.
- Metricas de comunidad minimas (18 descargas, 0 likes en el momento de la consulta): no hay senal de adopcion ni de validacion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/Qwen3.5-35B-A3B-text-only
- Repositorio original copiado: https://huggingface.co/codecho/Qwen3.5-35B-A3B-text-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- vLLM (proyecto que mantiene esta copia): https://github.com/vllm-project/vllm
- Paper, blog o demo oficiales del modelo: no disponibles en la informacion proporcionada.
