# xl-24/gemma4-2b-atc-finetune-32-64-merged-16bit

## Resumen

El modelo `xl-24/gemma4-2b-atc-finetune-32-64-merged-16bit` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante de la familia Gemma 4 en su version instructiva de 2B parametros efectivos, publicada por el usuario xl-24. El nombre del repositorio sugiere un entrenamiento orientado a tareas de control de trafico aereo (ATC, del ingles Air Traffic Control), aunque la model card no documenta el dataset ni el objetivo concreto del ajuste. El modelo se distribuye en formato safetensors de 16 bits, fusionado (merged) tras el entrenamiento con LoRA, y conserva la licencia Apache 2.0 del modelo base.

El modelo base es multimodal (pipeline `image-text-to-text`), por lo que hereda capacidades de procesamiento de lenguaje natural y vision, ademas de una ventana de contexto que, segun la nomenclatura del repositorio ("32-64"), podria referirse a longitudes de secuencia de entrenamiento de 32k a 64k tokens, aunque este dato no esta confirmado en la informacion disponible. El total real de parametros en safetensors es de 5.123.178.051, lo que refleja la arquitectura de embedding/mezcla de expertos del modelo Gemma 4 E2B, donde "2B" hace referencia a parametros efectivos o activos y no al total almacenado.

La relevancia de esta ficha es limitada por la escasez de documentacion: no hay datos de benchmarks, ni de composicion del dataset de ajuste fino, ni de hiperparametros de entrenamiento. Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy especifico (ATC) y publicado bajo una licencia permisiva que facilita su reutilizacion comercial, siempre que se respeten las condiciones de Apache 2.0 y las del modelo base original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4; variante E2B (parametros efectivos ~2B) |
| Parametros totales | 5.123.178.051 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo E2B sugiere ~2B efectivos, sin confirmar) |
| Longitud de contexto | no disponible (el nombre del repo indica "32-64", posiblemente longitudes de entrenamiento de 32k-64k, sin confirmar) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base se entreno sobre una version bnb-4bit, pero los pesos publicados son de 16 bits (merged) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 bits, merged) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E2B instructivo, una arquitectura multimodal de la familia Gemma 4 que procesa entradas de imagen y texto y genera texto. El sufijo "E2B" en la nomenclatura del modelo base indica una variante con aproximadamente 2.000 millones de parametros efectivos, mientras que el total almacenado en safetensors asciende a 5.123.178.051 parametros, lo que sugiere una arquitectura con componentes adicionales (posiblemente embedding multimodal o capas de mezcla) que no se detallan en la informacion disponible. El modelo base fue cuantizado a 4 bits por Unsloth (`unsloth-bnb-4bit`) para el entrenamiento, y el resultado publicado es una fusion (merge) de los adaptadores LoRA en pesos de 16 bits.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la model card, lo que implica un ajuste fino supervisado (SFT) o posiblemente DPO, sin que se especifique el metodo exacto ni el dataset utilizado. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere un ajuste orientado a control de trafico aereo, pero no hay informacion sobre el corpus ni sobre las tecnicas de alineacion aplicadas. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, con capacidad de mantener conversaciones multi-turno (etiqueta `conversational`).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base Gemma 4.
- Razonamiento y generacion de codigo: capacidades propias de la familia Gemma 4, aunque no se documentan resultados especificos para este finetune.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible; el modelo base Gemma 4 podria soportarlo, pero no se detalla.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se confirman otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del modelo base; no se confirman modos de razonamiento extendido ni audio.

## Casos de uso

- Control de trafico aereo asistido: el nombre del repositorio sugiere un ajuste para tareas de ATC; podria emplearse para generar borradores de instrucciones, resumir comunicaciones o asistir en la redaccion de clearances, siempre con supervision humana y validacion por parte de controladores certificados.
- Procesamiento de comunicaciones radiotelefonicas: dado su caracter multimodal, podria combinarse con sistemas de transcripcion para interpretar imagenes de pantallas radar o diagramas y generar texto asociado, aunque no hay evidencia de entrenamiento especifico en este dominio.
- Asistencia documental en aviacion: generacion de resumenes de manuales, procedimientos o NOTAMs en ingles, aprovechando la capacidad de contexto largo (si se confirma la ventana de 32k-64k).
- Prototipado de asistentes conversacionales de nicho: al ser un modelo pequeno (5.1B parametros totales) y con licencia Apache 2.0, es adecuado para experimentar con despliegues locales en entornos de investigacion.
- Generacion de codigo en pipelines de CI/CD: aunque no hay benchmarks que lo respalden, el modelo base Gemma 4 tiene capacidades de codigo; podria integrarse en tareas de autocompletado o generacion de scripts, con validacion posterior.
- Investigacion en ajuste fino con Unsloth: el modelo sirve como ejemplo reproducible de un pipeline de finetune con Unsloth + TRL sobre un modelo multimodal cuantizado a 4 bits, util para estudiar el impacto del merge a 16 bits.
- Educacion y demostraciones: por su tamano moderado y licencia permisiva, puede usarse en entornos docentes para ilustrar tecnicas de ajuste fino y despliegue de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en 16 bits y 5.123.178.051 parametros, se requieren aproximadamente 10,3 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB de VRAM para contexto moderado.
- Cuantizacion: al no publicarse versiones GGUF ni cuantizadas en el repo, habria que generarlas; en 8 bits se estiman ~5,2 GB de pesos y en 4 bits ~2,6 GB, mas overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia comoda en 16 bits; RTX 3090 (24 GB) tambien es viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion a 4/8 bits, en GPUs de 8-12 GB como RTX 3060/4060 Ti, aunque con limitaciones de contexto.
- Opciones de despliegue: transformers (libreria nativa del repo), text-generation-inference (etiqueta `text-generation-inference`), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (requiere conversion a GGUF, no incluida).
- Latencia y throughput: no disponibles; dependeran del hardware y de la cuantizacion. Un modelo de ~5B en 16 bits en una RTX 4090 puede esperar decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune-32-64-merged-16bit | 5.123.178.051 | no disponible | apache-2.0 | si (image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | apache-2.0 (heredada) | si | Hugging Face |
| Gemma 4 E2B instructivo (original de Google) | no disponible | no disponible | Gemma license (no confirmada) | si | Hugging Face / Google |
| Modelos de ~5B texto (p. ej., variantes de Llama 3.2 3B o Qwen2.5 3B) | ~3-5B | 8k-128k segun modelo | licencias variables | no (solo texto) | Hugging Face |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo ajustado ni de especificaciones completas del modelo base. La principal diferencia frente a alternativas de texto puro es su naturaleza multimodal y su licencia Apache 2.0, que facilita el uso comercial sin las restricciones adicionales de otras licencias de modelos abiertos.

## Limitaciones y advertencias

- Documentacion muy escasa: no se especifican dataset, hiperparametros, metodo de alineacion ni evaluacion, lo que impide validar la calidad del ajuste fino.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en un dominio critico como el control de trafico aereo, cualquier salida debe ser validada por personal certificado.
- Sesgos conocidos: no documentados; al entrenarse sobre un modelo base con datos web, puede heredar sesgos de genero, culturales o geograficos.
- Limitacion de idioma: solo se declara ingles (`language: en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto: la longitud real de contexto no esta confirmada; el nombre "32-64" podria referirse a longitudes de entrenamiento y no a la ventana efectiva de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Gemma 4 no imponga condiciones adicionales (Google suele usar su propia licencia Gemma, no Apache 2.0); la model card declara apache-2.0, pero conviene revisar los terminos del modelo base.
- Uso en produccion: sin benchmarks ni validacion externa, no se recomienda desplegarlo en entornos criticos sin una evaluacion exhaustiva y supervision humana.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o correccion de errores.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune-32-64-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
