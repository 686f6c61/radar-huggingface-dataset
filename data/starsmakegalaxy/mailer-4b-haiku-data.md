# StarsMakeGalaxy/Mailer-4b-haiku-data

## Resumen

Mailer-4b-haiku-data es un ajuste fino (fine-tune) de 4.659.865.088 parámetros publicado por el usuario StarsMakeGalaxy en HuggingFace, derivado del checkpoint `unsloth/Qwen3.5-4B` de la familia Qwen3.5. Se distribuye en precisión FP16 con pesos en safetensors y licencia Apache-2.0, y su pipeline declarado es `image-text-to-text`, lo que indica que conserva la interfaz multimodal del modelo base (procesador de imagen y texto), aunque el autor no detalla el alcance ni el dataset del ajuste.

El interés del modelo es acotado y experimental: la model card es una plantilla autogenerada por Unsloth que solo confirma que el entrenamiento se hizo con Unsloth y TRL, sin documentar datos, hiperparámetros, número de tokens ni metodología de alineación. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto (correo y composición de haikus), pero no hay evidencia publicada que lo confirme.

A fecha de la informacion disponible el repositorio registra 0 descargas y 0 likes, no incluye resultados de benchmarks ni versiones cuantizadas (GGUF, AWQ o GPTQ), y esta etiquetado únicamente en inglés. Por tanto, debe tratarse como un artefacto de experimentación reproducible con Unsloth, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`); detalles de capas, atencion y vision tower no disponibles |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no aplica (no es MoE segun los tags disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo se publica el checkpoint en FP16; no se ofrecen GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16), tamano del repo 9,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-4B`, un transformer decoder-only de 4,66 B de parametros que, segun el pipeline `image-text-to-text` y los tags del repositorio, incorpora capacidad de entrada de imagen ademas de texto. El autor no publica el numero de capas, la dimension oculta, el tipo de atencion ni la configuracion del encoder visual, por lo que estos datos figuran como no disponibles. El ajuste se distribuye en FP16 sin fusionar ni cuantizar.

En cuanto al entrenamiento, la model card solo indica que se entreno "2x faster" con Unsloth y la libreria TRL de HuggingFace, lo que implica un fine-tune supervisado (SFT) con las optimizaciones de kernel de Unsloth. No se documentan el numero de tokens, la composicion del dataset, si se aplico LoRA o QLoRA y posterior fusion a FP16, ni si hubo etapas de RLHF, DPO o ORPO. Tampoco se especifica si se congelo el vision tower o si el ajuste afecto a los pesos multimodales. Cualquier afirmacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modo thinking) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-4B; calidad no verificada por benchmarks publicados.
- Procesamiento de entrada de imagen y texto (`image-text-to-text`), presumiblemente heredado del base; el autor no documenta tareas de vision concretas.
- Razonamiento y codigo: capacidades probables por familia, pero sin evaluacion publicada en este checkpoint.
- Tool calling / function calling: no documentado en esta ficha; depende del soporte del base y de la plantilla de chat utilizada.
- Uso como agente o razonamiento multi-paso: no documentado.
- Multilingue: limitado a ingles segun el campo `language`.
- Capacidades especiales (modo thinking, audio, grounding): no disponibles.

## Casos de uso

- Experimentacion con fine-tuning reproducible: sirve como referencia de un pipeline Unsloth + TRL sobre un base de 4,66 B, util para equipos que quieran replicar el flujo con sus propios datos en una sola GPU.
- Generacion de texto creativo breve: el nombre del repositorio apunta a composicion de haikus o piezas muy cortas; el modelo puede emplearse para generar variantes estilisticas y compararlas cualitativamente.
- Redaccion asistida de correo electronico: prototipos de generacion y reescritura de mensajes en ingles, con evaluacion manual dado que no hay metricas publicadas.
- Base para ajustes de dominio posteriores: al estar en FP16 y con licencia Apache-2.0, es un punto de partida razonable para un segundo fine-tune con LoRA sobre datos propios.
- Pruebas de pipelines multimodales: su tag `image-text-to-text` permite validar el cableado de processors de imagen y texto en transformers o TGI antes de invertir en modelos mayores.
- Evaluacion comparativa interna (A/B) frente al modelo base: util para medir cuanto aporta el dataset de ajuste en estilo y formato, con jueces humanos o LLM-as-a-judge.
- Docencia y demos: un checkpoint de 9,3 GB en FP16 cabe en GPUs de consumo alto, lo que facilita talleres practicos de fine-tuning sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 9,3 GB solo para pesos, mas cache KV y activaciones; presupuesto realista de 11-14 GB segun longitud de contexto y tamano de lote (estimacion a partir del numero de parametros, no medida publicada).
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G sin problema de capacidad; el limite practico sera el throughput, no la memoria.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en FP16. En tarjetas de 8-12 GB seria necesario cuantizar a 8 o 4 bits con bitsandbytes, opcion no publicada por el autor.
- Despliegue: transformers es la via soportada de forma nativa; el tag `text-generation-inference` sugiere compatibilidad con TGI. vLLM y SGLang requeriran que la arquitectura `qwen3_5` este integrada en la version correspondiente. llama.cpp y Ollama no son utilizables sin una conversion a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mailer-4b-haiku-data | 4,66 B | no disponible | Apache-2.0 | Pesos FP16 en HF, 0 descargas | Fine-tune sin benchmarks ni cuantizaciones |
| unsloth/Qwen3.5-4B (base) | ~4 B (segun denominacion del autor) | no disponible | Apache-2.0 (segun el repo derivado) | Pesos en HF | Modelo de partida; referencia obligada para medir el efecto del ajuste |
| Qwen3-4B (generacion anterior de la familia) | 4,0 B | 32k nativo, extensible | Apache-2.0 | Ampliamente disponible, con GGUF | Alternativa madura con ecosistema de cuantizaciones, pero sin entrada de imagen |
| Gemma 3 4B | ~4 B | 128k | Terminos de uso de Gemma | Pesos en HF y GGUF | Multimodal y con contexto largo; licencia mas restrictiva que Apache-2.0 |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este checkpoint y las cifras oficiales de los modelos alternativos corresponden a sus propias model cards, no a una evaluacion homogenea.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al base; puede haber degradado capacidades generales (olvido catastrofico) sin que exista medicion.
- Documentacion minima: se desconoce el dataset, el volumen de tokens y la receta exacta, lo que impide auditar sesgos o procedencia de los datos.
- Riesgo de alucinacion: inherente a un modelo de 4,66 B sin etapa de alineacion documentada; sin RLHF/DPO declarado, la adherencia a instrucciones puede ser irregular.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta soportado ni evaluado.
- Contexto desconocido: al no publicarse la ventana, no debe asumirse un contexto largo en produccion.
- Multimodalidad no verificada: el tag `image-text-to-text` indica la interfaz, pero no hay ejemplos, demos ni metricas de vision.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por terceros y de reportes de errores.
- Licencia: Apache-2.0 permite uso comercial del artefacto, pero conviene verificar los terminos del modelo base Qwen3.5-4B y de las dependencias (Unsloth, TRL) antes de desplegar.
- Sin cuantizaciones oficiales: desplegar en GPUs pequenas requiere generar el GGUF o los pesos de 4 bits por cuenta propia, con riesgo de perdida de calidad no medida.
- Nombre y proposito ambiguos: "Mailer" y "haiku-data" sugieren un dominio concreto que la model card no describe; no debe asumirse un comportamiento especializado sin evaluacion propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/StarsMakeGalaxy/Mailer-4b-haiku-data
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
