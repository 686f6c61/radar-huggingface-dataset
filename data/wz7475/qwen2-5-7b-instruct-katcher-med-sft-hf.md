# wz7475/qwen2.5-7b-instruct-katcher-med-sft-hf

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-med-sft-hf` es un ajuste fino (SFT) del modelo base Qwen2.5-7B-Instruct, publicado por el usuario wz7475 en Hugging Face. Por el nombre se deduce que se trata de un fine-tuning orientado al dominio medico ("med") sobre el modelo instruct de Qwen2.5 de 7 mil millones de parametros, probablemente entrenado con el framework Katcher. Sin embargo, la model card del autor es la plantilla autogenerada por Hugging Face y no aporta ningun detalle verificado sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

El modelo se distribuye en formato safetensors para la libreria transformers, con un tamano de repositorio de 0,7 GB, lo que sugiere pesos en precision reducida (probablemente bf16 o fp16) o un subconjunto de los pesos. No se declara licencia, idiomas soportados ni pipeline, y no cuenta con descargas ni likes en el momento de la consulta, lo que indica que es un experimento personal sin validacion comunitaria.

Por tanto, esta ficha describe lo que se puede inferir razonablemente de la arquitectura base Qwen2.5-7B-Instruct y advierte explicitamente de que cualquier dato especifico del fine-tuning (dataset, hiperparametros, evaluacion) no esta disponible. Es relevante para desarrolladores que quieran evaluar si este checkpoint merece ser probado frente al Qwen2.5-7B-Instruct original en tareas medicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7,6 mil millones (heredado del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta 29 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE para codificacion posicional y capas densas (no MoE). El modelo base fue entrenado por Alibaba Qwen con un corpus multilingue de hasta 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias. Sobre esa base, el autor wz7475 ha aplicado un ajuste fino supervisado (SFT) etiquetado como "katcher-med", presumiblemente con datos del dominio medico.

No hay informacion disponible sobre el numero de tokens de entrenamiento del fine-tuning, la composicion del dataset medico, si hubo RLHF/DPO adicional, ni los hiperparametros utilizados. La model card no documenta ninguna innovacion tecnica propia. El tag `arxiv:1910.09700` presente en el repositorio corresponde al paper del calculador de impacto medioambiental de Lacoste et al., citado en la plantilla de la model card, y no a un paper del modelo.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Respuesta a instrucciones en formato conversacional (chat template de Qwen2.5).
- Capacidad multilingue (el modelo base soporta 29 idiomas, incluido el castellano).
- Generacion de codigo y matematicas a nivel del modelo base.
- Soporte de tool calling y function calling heredado del modelo base.
- Presunta especializacion en dominio medico por el sufijo "med" del nombre, aunque no verificada ni documentada.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Experimentacion en dominio medico: probar el checkpoint frente a Qwen2.5-7B-Instruct original en preguntas de salud, para verificar si el SFT aporta mejoras reales antes de considerarlo en produccion.
- Prototipado de asistentes clinicos de bajo riesgo: generar borradores de respuestas informativas para revision humana, siempre con supervision medica.
- Generacion de resumenes de literatura medica: procesar abstracts o articulos largos gracias a la ventana de 32.768 tokens heredada del modelo base.
- Extraccion de entidades en textos clinicos: identificar sintomas, farmacos y diagnosticos en notas, como paso previo a un pipeline de NLP medico con validacion.
- Base para investigacion en fine-tuning medico: usar el checkpoint como punto de partida para experimentos de SFT adicionales o comparativas de metodologias (Katcher frente a otras).
- Chatbot de divulgacion sanitaria: responder preguntas frecuentes de pacientes con contexto multi-turno, con limitaciones claras y derivacion a profesionales.
- Evaluacion de sesgos y alucinaciones en LLM medicos: usar el modelo como sujeto de estudio en pruebas de robustez y fidelidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y no hay datos verificables sobre el rendimiento del fine-tuning en tareas medicas (MedQA, MedMCQA, PubMedQA u otras).

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 15-16 GB para los 7,6 mil millones de parametros, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: alrededor de 8-9 GB.
- VRAM estimada en cuantizacion 4 bits: alrededor de 5-6 GB.
- GPU recomendadas para bf16: A100 40GB, H100, L40S o RTX 4090 (24 GB) con margen para contexto largo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 (16 GB) solo con cuantizacion.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM, TGI y llama.cpp/Ollama tras convertir los pesos a GGUF (no se publican GGUF en el repo).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-sft-hf | 7,6 B | 32.768 (heredado) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.1 8B Instruct | 8 B | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |

El checkpoint de wz7475 no aporta datos de rendimiento que permitan una comparacion cuantitativa; los tres modelos de referencia tienen licencias claras y evaluaciones publicas, mientras que este fine-tuning carece de ambas.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada y no documenta nada: no hay garantia de que el fine-tuning se haya completado correctamente ni de la calidad de los datos medicos usados.
- Riesgo elevado de alucinacion en contenido medico; no debe usarse para diagnostico, tratamiento ni consejo clinico sin supervision profesional.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de su comportamiento.
- Idiomas soportados no declarados; el fine-tuning podria haber degradado el multilingueismo del modelo base si los datos eran monolingues.
- El tamano del repo (0,7 GB) es inferior al esperado para 7,6 B parametros en bf16 (unos 15 GB), lo que sugiere pesos parciales, cuantizados o un error en la subida; conviene verificar los archivos antes de usarlo.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo, y los datos medicos de SFT podrian introducir sesgos de poblacion o de fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-sft-hf
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5 (technical report): https://arxiv.org/abs/2412.15115
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
