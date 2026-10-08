# vosldtgbj/project-llm-sft-v3-l5-h2p0-seed20261006

## Resumen

Project LLM SFT v3 `L5--h2p0--seed20261006` es un modelo multimodal de aproximadamente 12.000 millones de parametros publicado por el usuario `vosldtgbj` en HuggingFace. Se trata de un ajuste fino supervisado (SFT) sobre el checkpoint `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02`, que a su vez deriva de la familia Gemma 4 de Google, segun la arquitectura declarada `gemma4_unified` y la etiqueta `gemma4`. El pipeline declarado es `any-to-any`, con soporte de entrada imagen-texto, lo que lo situa en la categoria de modelos multimodales de proposito general.

El modelo se ha entrenado con LoRA (r=128, alpha=256, dropout=0,05, LR=2e-5) durante 2,0 epochs sobre una mezcla de 90% datos de dominio y 10% datos generales, y los adaptadores se han fusionado en pesos completos. La model card lo describe explicitamente como un archivo de pesos para reproducibilidad experimental, evaluacion offline e investigacion posterior, no como un modelo listo para produccion. La etiqueta de idioma principal es el japones, aunque no se documenta la composicion exacta del dataset ni la cobertura linguistica real.

Su relevancia actual es limitada pero concreta: es un ejemplo de pipeline completo de preentrenamiento continuado (CPT) mas SFT sobre una base Gemma 4, con todos los hiperparametros y la ascendencia del modelo documentados. Para investigadores interesados en reproducir ajustes de dominio sobre arquitecturas Gemma 4, el repositorio aporta pesos, configuracion y una receta de entrenamiento trazable, aunque carece de benchmarks publicados y de cualquier validacion cuantitativa de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, segun etiqueta del repositorio) |
| Parametros totales | 11.959.730.176 (~12B, dato de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | japones (etiqueta declarada); lista completa no disponible |
| Licencia | apache-2.0, sujeta adicionalmente a la licencia upstream de Gemma 4 |
| Formato de pesos | safetensors fragmentados (tamano de repo: 24,0 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4_unified`, cargable mediante `AutoModelForMultimodalLM` y `AutoProcessor` de Transformers, lo que indica un modelo unificado de texto e imagen con procesador multimodal. El pipeline `any-to-any` y la etiqueta `image-text-to-text` confirman que acepta imagenes como entrada ademas de texto. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto maxima, mas alla de que requiere una version de Transformers que soporte explicitamente esta arquitectura.

El entrenamiento consta de dos etapas documentadas. Primero, un preentrenamiento continuado (CPT) de 1,0 epoch que produce el checkpoint base `cpt1-full-02`, y despues un SFT v3 de 2,0 epochs sobre una mezcla de 90% datos de dominio y 10% datos generales. El ajuste se realizo con LoRA (r=128, alpha=256, dropout=0,05, learning rate 2e-5) y los adaptadores se fusionaron en pesos completos. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto multimodal: el pipeline `any-to-any` y la etiqueta `image-text-to-text` indican entrada de imagenes y texto.
- Razonamiento y generacion de lenguaje: capacidades heredadas de la base Gemma 4, sin cuantificar en la informacion disponible.
- Procesamiento de japones: el unico idioma etiquetado explicitamente en el repositorio.
- Ajuste a dominio: el SFT v3 con 90% datos de dominio sugiere especializacion en un dominio concreto, cuya naturaleza no se especifica.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion experimental de pipelines SFT: el repositorio publica la receta completa (LoRA r=128, alpha=256, 2,0 epochs, 90/10 de mezcla) y los pesos fusionados, lo que permite replicar el ajuste y comparar variantes cambiando semilla o mezcla de datos.
- Investigacion sobre preentrenamiento continuado: dado que se documenta el checkpoint CPT intermedio, sirve para estudiar el efecto de una epoch de CPT adicional sobre una base Gemma 4 antes del SFT.
- Evaluacion offline de modelos japoneses: al estar etiquetado como japones, puede usarse como punto de partida en baterias de evaluacion en ese idioma, siempre que se validen antes los resultados.
- Prototipado de sistemas multimodal imagen-texto: con `AutoProcessor` y `AutoModelForMultimodalLM` se puede montar un prototipo de descripcion de imagenes o respuesta a preguntas visuales, asumiendo que la calidad no esta validada.
- Generacion de datos sinteticos para dominios especificos: un modelo ajustado con 90% datos de dominio puede emplearse para ampliar datasets de ese dominio, sujeto a revision humana por el riesgo de alucinacion.
- Estudio de tecnicas de fusion de adaptadores LoRA: al publicarse los pesos ya fusionados, es un caso de referencia para analizar el impacto de la fusion sobre el rendimiento final.
- Base para experimentos de alineacion posteriores: el checkpoint puede servir como punto de partida para fases de DPO o RLHF que el autor no ha incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 24 GB solo para pesos (el repositorio ocupa 24,0 GB), mas overhead de activaciones y cache KV; en cuantizacion INT8, en torno a 12 GB; en INT4, en torno a 6-7 GB. Son estimaciones aritmeticas a partir del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para BF16 sin cuantizar. Una RTX 4090 (24 GB) queda al limite en BF16 y requiere cuantizacion o descarga parcial a CPU.
- Cabe en consumer GPU: si, en GPUs con 24 GB o mas (RTX 3090, RTX 4090) solo con cuantizacion; en GPUs de 12-16 GB seria necesario INT4 o `device_map` con offload a CPU.
- Opciones de despliegue: Transformers es la via documentada (`AutoProcessor` + `AutoModelForMultimodalLM` con `device_map="auto"`), y el repositorio incluye la etiqueta `endpoints_compatible`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos no provienen de la busqueda web realizada y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Project LLM SFT v3 (este modelo) | ~12B | no disponible | apache-2.0 + licencia Gemma 4 | si (imagen-texto) | HuggingFace, 0 descargas |
| Familia Gemma 4 (upstream) | no disponible | no disponible | licencia Gemma 4 | si | modelos oficiales de Google |
| Alternativas de ~12B de otras familias | ~12-14B | no disponible | variable | variable | no disponible en la informacion recogida |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas, por lo que no se puede afirmar nada sobre su calidad relativa.
- Modelo de investigacion: la propia model card lo define como archivo para reproduccion experimental y evaluacion offline, no como modelo listo para produccion.
- Doble licencia: aunque el repositorio declara apache-2.0, la model card indica que el uso debe cumplir tambien la licencia y los terminos de Gemma 4, lo que puede imponer restricciones adicionales al uso comercial.
- Idiomas: solo se etiqueta japones; se desconoce el comportamiento en castellano u otros idiomas, y no hay lista oficial de cobertura linguistica.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- Datos de entrenamiento opacos: no se especifica la naturaleza del dominio, el volumen de tokens ni la procedencia de los datos, lo que impide auditar sesgos o contaminacion.
- Riesgo de alucinacion: sin evaluaciones publicadas no hay estimacion de tasa de alucinacion; en un modelo ajustado con 90% datos de dominio, el sobreajuste al dominio es un riesgo plausible.
- Reproducibilidad parcial: el repositorio no incluye estado de optimizador, scheduler ni semillas de datos, solo los pesos finales.
- Soporte de herramientas limitado: no hay evidencia de soporte de vLLM, llama.cpp u otros motores de inferencia de alto rendimiento, ni de plantillas de chat documentadas.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l5-h2p0-seed20261006
- Modelo base (CPT): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia de Gemma 4 referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM (repositorio, resultado de busqueda): https://github.com/vllm-project/vllm
- vLLM (sitio oficial, resultado de busqueda): https://vllm.ai/
- vLLM (documentacion, resultado de busqueda): https://docs.vllm.ai/en/latest/
- vLLM (notas de version, resultado de busqueda): https://vllm.ai/releases
- Plantilla de SFT sobre LLM open source (resultado de busqueda): https://github.com/vpoluyaktov/llm-sft-test
