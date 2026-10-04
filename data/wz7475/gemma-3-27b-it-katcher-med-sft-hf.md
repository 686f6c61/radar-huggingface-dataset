# wz7475/gemma-3-27b-it-katcher-med-sft-hf

## Resumen

El modelo `wz7475/gemma-3-27b-it-katcher-med-sft-hf` es un checkpoint publicado en HuggingFace por el usuario wz7475 bajo la libreria `transformers`. La model card del repositorio es la plantilla generada automaticamente por el Hub y no ha sido cumplimentada: no incluye descripcion, datos de entrenamiento, licencia, idiomas, ni resultados de evaluacion. Toda la informacion disponible se reduce al identificador del repositorio, las etiquetas (`transformers`, `safetensors`, `endpoints_compatible`, `region:us`) y el tamano del repositorio (0,9 GB).

El nombre del repositorio sugiere, sin confirmacion por parte del autor, que se trata de un ajuste fino supervisado (SFT) orientado al dominio medico del modelo Gemma 3 27B instruct de Google DeepMind. Los fragmentos `gemma-3-27b-it` (modelo base), `med-sft` (ajuste supervisado sobre datos medicos) y `katcher` (posible referencia a un dataset, corpus o autor no identificado) apuntan en esa direccion, pero no existe documentacion que lo respalde.

La relevancia de esta ficha es limitada y fundamentalmente cautelar: se trata de un repositorio sin descargas, sin valoraciones, sin licencia declarada y con un tamano de 0,9 GB que resulta inconsistente con los pesos completos de un modelo de 27 000 millones de parametros en `safetensors` (que en bf16 ocuparian del orden de 54 GB). Esto sugiere que el repositorio podria contener unicamente adaptadores, un subconjunto de shards o una subida incompleta. No se recomienda su uso en produccion sin una verificacion previa del contenido real del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere un derivado de Gemma 3 27B, transformer decoder-only denso, sin confirmar) |
| Parametros totales | no disponible (el identificador sugiere 27 000 millones) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene `safetensors`; no se declaran versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (etiqueta del repositorio) |
| Tamano del repositorio | 0,9 GB |
| Libreria | `transformers` |
| Etiquetas | `transformers`, `safetensors`, `arxiv:1910.09700`, `endpoints_compatible`, `region:us` |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura de este checkpoint. El autor no ha rellenado ninguna seccion de la model card relativa a arquitectura, objetivo de entrenamiento, hiperparametros, regimen de precision (fp32, fp16, bf16) ni infraestructura de computo. La unica referencia tecnica presente es la etiqueta `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono en aprendizaje automatico, citado en la plantilla por defecto del Hub y no como descripcion del modelo.

Respecto al entrenamiento, el sufijo `sft` del identificador sugiere un ajuste fino supervisado, y `med` sugiere un corpus de dominio medico, pero se desconoce el numero de tokens, la composicion del dataset, si hubo etapas de RLHF o DPO, y si se aplicaron tecnicas como LoRA, QLoRA o ajuste completo. El tamano del repositorio (0,9 GB) es compatible con un conjunto de adaptadores LoRA sobre un modelo de 27 000 millones de parametros, pero tambien con una subida parcial o truncada de los pesos. Cualquier afirmacion adicional sobre la arquitectura o el proceso de entrenamiento seria especulativa.

## Capacidades

- No se dispone de documentacion sobre las capacidades del modelo.
- No se confirma soporte de generacion de texto, razonamiento, codigo ni matematicas, aunque el identificador apunte a un derivado de Gemma 3 27B IT.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingues ni el conjunto de idiomas soportados.
- No se confirma si conserva las capacidades multimodales (vision) del modelo base.
- La etiqueta `endpoints_compatible` indica unicamente que el repositorio es desplegable mediante HuggingFace Inference Endpoints, no una capacidad funcional del modelo.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin informacion verificada sobre el modelo. Los siguientes escenarios son hipoteticos y se derivan exclusivamente del nombre del repositorio, no de documentacion tecnica:

- Ajuste fino de dominio medico: si el checkpoint es un LoRA o un SFT sobre Gemma 3 27B IT, podria emplearse para tareas de resumen de informes clinicos, con la advertencia de que no existe evaluacion publicada que valide su calidad clinica.
- Clasificacion y extraccion de entidades en textos medicos: plausible si el ajuste se realizo sobre corpus clinicos, pero sin garantia de precision ni de cobertura terminologica.
- Generacion de respuestas a preguntas biomedicas: requiere validacion independiente y supervision humana; no debe usarse como herramienta de decision clinica.
- Asistencia a la redaccion de documentacion sanitaria: solo como borrador sujeto a revision profesional.
- Investigacion sobre ajuste fino en dominios especializados: el checkpoint podria servir como punto de partida o como caso de estudio, siempre que el repositorio contenga pesos utilizables.
- Reproducibilidad y auditoria de modelos medicos: util unicamente si el autor publica la composicion del dataset y los hiperparametros, cosa que actualmente no ocurre.

En todos los casos, el uso esta condicionado a verificar primero que el repositorio contiene pesos completos y funcionales, algo que el tamano de 0,9 GB pone en duda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido ninguna tabla de evaluacion (MMLU, MMLU-Pro, HumanEval, GSM8K, GPQA, MedQA, PubMedQA u otros), ni datos de latencia o throughput.

## Requisitos de hardware

Al no confirmarse la arquitectura ni el formato real de los pesos, las cifras siguientes son estimaciones genericas para un hipotetico modelo denso de 27 000 millones de parametros, no requisitos verificados de este checkpoint:

- VRAM estimada en bf16/fp16: aproximadamente 54 GB solo para pesos, mas cache KV; en la practica se requieren 60-70 GB o mas segun contexto.
- VRAM estimada en int8: del orden de 27-30 GB para pesos, mas cache KV.
- VRAM estimada en int4 (GPTQ, AWQ, GGUF Q4_K_M): del orden de 15-18 GB para pesos, mas cache KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 con contexto largo; A100 40 GB o L40S 48 GB para int8; RTX 4090, RTX 3090 o L4 para int4.
- Compatibilidad con GPU de consumo: probable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion int4 y contextos moderados; no viable en bf16 con una sola GPU de consumo.
- Escalado multi-GPU: necesario para bf16 mediante tensor parallelism (vLLM, TGI o SGLang).
- Opciones de despliegue: `transformers` (confirmado por la libreria declarada), vLLM, TGI, SGLang y llama.cpp/Ollama si se generan cuantizaciones GGUF; la etiqueta `endpoints_compatible` habilita HuggingFace Inference Endpoints.
- Cache KV: en modelos de la familia Gemma 3 con ventanas de atencion local, el consumo de cache crece de forma notable con contextos muy largos; en 128 000 tokens puede superar con holgura el tamano de los propios pesos.
- Latencia y throughput: no disponibles.
- Caveat critico: con 0,9 GB de repositorio, es probable que el checkpoint no contenga los pesos completos y no sea cargable directamente. Verificar los shards y el `config.json` antes de planificar cualquier despliegue.

## Comparativa con modelos similares

La comparacion se establece con alternativas de la misma categoria (modelos abiertos de rango 27-33B con enfoque generalista o medico). Los datos de rendimiento no estan disponibles para el modelo analizado, por lo que la columna correspondiente queda vacia.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| wz7475/gemma-3-27b-it-katcher-med-sft-hf | no disponible (nombre sugiere 27B) | no disponible | no disponible | safetensors | no disponible |
| google/gemma-3-27b-it | 27B, denso, multimodal | 128 000 tokens | Terminos de uso de Gemma | safetensors, GGUF (comunidad) | publicado por Google en su model card |
| google/medgemma-27b-it | 27B, denso, multimodal medico | 128 000 tokens | Health AI Developer Foundations | safetensors | publicado por Google en su model card |
| Qwen/Qwen2.5-32B-Instruct | 32,5B, denso | 131 072 tokens | Apache 2.0 | safetensors, GGUF | publicado por Alibaba en su model card |

Nota: los datos de las filas correspondientes a otros modelos proceden de sus fichas publicas y se incluyen como referencia de categoria; no se han verificado contra benchmarks reproducidos de forma independiente en el contexto de esta ficha. El modelo analizado no aporta ninguna cifra comparable.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto sin rellenar. No hay informacion sobre datos de entrenamiento, sesgos, mitigaciones ni uso previsto.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido. Al derivar presuntamente de Gemma 3, es probable que apliquen los Terminos de Uso de Gemma, pero esto no esta confirmado por el autor.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; en un contexto medico el riesgo es especialmente grave y no existe evaluacion publicada que lo cuantifique.
- Ausencia de validacion clinica: no hay resultados en MedQA, PubMedQA ni ningun otro benchmark medico. No debe emplearse para diagnostico, triaje, prescripcion ni ninguna decision con impacto en pacientes.
- Procedencia opaca: no se especifica el dataset de ajuste, el proceso de anonimizado ni el consentimiento de los datos. Esto compromete el cumplimiento del RGPD en el Espacio Economico Europeo si se procesan datos de salud.
- Integridad del repositorio: 0,9 GB es incompatible con pesos completos de un modelo de 27B. Posible subida incompleta, adaptadores unicamente o ficheros corruptos.
- Sesgos desconocidos: sin informacion sobre la composicion del corpus de ajuste, no se puede evaluar sesgo demografico, linguistico ni geografico. Un corpus medico limitado a una region o idioma produciria un rendimiento degradado fuera de ese ambito.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otras lenguas.
- Reputacion del repositorio: cero descargas y cero valoraciones, sin historial de uso que permita inferir calidad.
- Fecha de publicacion registrada como 2026-10-03, posterior a la fecha de ultima actualizacion del mismo dia; conviene comprobar la coherencia temporal del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wz7475/gemma-3-27b-it-katcher-med-sft-hf
- Articulo citado en la etiqueta del repositorio (Lacoste et al., 2019, estimacion de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Modelo base presumible, no confirmado por el autor: https://huggingface.co/google/gemma-3-27b-it
- Terminos de uso de Gemma (aplicables solo si se confirma la ascendencia Gemma 3): https://ai.google.dev/gemma/terms
- Referencia general sobre la familia Gemma 3 (no especifica de este checkpoint): https://arxiv.org/abs/2503.19786
