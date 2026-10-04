# violetxi/qwen35-9b-equational-theory-sair-mix5m-70n30t-thinking

## Resumen

Qwen3.5-9B Equational Theory — 5M, 70% notes / 30% trajectories es un ajuste fino supervisado completo (full SFT) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi con licencia Apache 2.0. El modelo está especializado en teoría ecuacional y razonamiento matemático, y forma parte de una serie de experimentos de "reinclusión de razonamiento" (reasoning-inclusive retraining) ejecutados por el grupo stanford_autonomous_agent, según el enlace de W&B incluido en la model card. El checkpoint publicado corresponde a la época 2 final del presupuesto nominal de 5 millones de tokens supervisados, con una mezcla aproximada de 70% notas matemáticas y 30% trayectorias de profesor condicionadas por notas.

El interés de esta ficha es doble. Por un lado, documenta una receta de ajuste fino reproducible y muy detallada: se publican los recuentos exactos de tokens, los hiperparámetros, el paso de optimizador final, la pérdida de validación compartida y ficheros de procedencia (training_config.json, data_provenance.json, training_metrics.json, conversion.json). Por otro, es un ejemplo de entrenamiento centrado en la internalización de teoría ecuacional con plantilla de chat y modo "thinking" activado, orientado a evaluación matemática. No se declaran idiomas soportados ni longitud de contexto específica en la información disponible.

El tamaño real del checkpoint, según los tensores safetensors, es de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), con un repositorio de 19,3 GB que incluye el export nativo en BF16. La model card indica que los resultados de benchmarks se publican por separado y que las evaluaciones previas de otras mezclas no describen este checkpoint, por lo que no hay cifras de rendimiento disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformador, clase Qwen3_5ForConditionalGeneration); detalles internos de capas y atencion no disponibles |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) segun safetensors |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; el export nativo es BF16. No se publican pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles; la model card no declara cobertura linguistica (tamano de vocabulario: 427 tensores de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3.5-9B, revision c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| Modalidad declarada | Etiqueta image-text-to-text en el repositorio y pipeline text-generation; el uso documentado en la model card es texto y razonamiento matematico |
| Tamano del repositorio | 19,3 GB |
| Libreria | transformers |
| Datasets de entrenamiento | violetxi/equational-theory-sair-notes, violetxi/equational-theory-sair-note-conditioned-rollouts |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado completo (no LoRA ni adaptadores) sobre Qwen/Qwen3.5-9B. La model card no detalla la topología interna del modelo base (número de capas, cabezas, tipo de atención ni si incorpora componentes híbridos), por lo que no se puede confirmar nada más allá de que se usa la clase Qwen3_5ForConditionalGeneration de transformers. No se menciona en ningún punto el uso de RLHF, DPO ni optimización con KL: la función de pérdida declarada es entropía cruzada media sobre los tokens supervisados, con máscara de pérdida de entrenamiento que tiene en cuenta el enmascaramiento de fronteras de nota.

El presupuesto nominal de 5 millones de tokens se reparte entre 3.492.512 tokens supervisados de notas matemáticas (5.944 ejemplos) y 1.499.290 tokens supervisados de trayectorias condicionadas por notas (614 ejemplos), sumando 4.991.802 tokens supervisados y 6.558 ejemplos por época. Las trayectorias incluyen el razonamiento del profesor y las respuestas finales, con el razonamiento restaurado exactamente. Las notas provienen del banco R8 sellado, excluyendo cabezas en cuarentena y ejemplos de validación congelados. Los modelos de 1M, 5M y 10M comparten un mismo pool de trayectorias con razonamiento restaurado, mientras que los de 50M y 100M usan un pool compatible con R8 distinto; el anidamiento de trayectorias entre pools no se reclama. Los ejemplos completos se seleccionan sin remuestreo ni truncamiento, y los recuentos usan la máscara de pérdida de entrenamiento, por lo que el presupuesto nominal no equivale a una exposición de dos épocas.

La configuración de entrenamiento es: dos épocas, tasa de aprendizaje 5e-6, planificador coseno, 0,03 de warmup, FSDP2 sobre ocho GPUs, paso de optimizador final 104 y pérdida de validación compartida final de 0,276607. El export nativo en BF16 pasó la carga estándar de Transformers y una comprobación exhaustiva de tensores: los 427 tensores de lenguaje proceden de este checkpoint entrenado y el resto de tensores conservan los valores del modelo base fijado. El fichero conversion.json registra el hash de cada artefacto.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation con etiqueta conversational, con plantilla de chat incluida.
- Razonamiento matematico especializado: el entrenamiento se centra en teoria ecuacional y en trayectorias de razonamiento de profesor, con modo thinking activado para evaluacion matematica.
- Modo thinking: la model card recomienda usar la plantilla de chat incluida con thinking habilitado; la etiqueta reasoning-inclusive confirma que el entrenamiento incluye tokens de razonamiento.
- Aprendizaje de teoria ecuacional: los datasets de notas y de rollouts condicionados por notas apuntan a internalizacion de conceptos de algebra universal y ecuaciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; las trayectorias de profesor sugieren cadenas de razonamiento, pero no se documenta uso agentico.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas.
- Vision u otras modalidades: la etiqueta image-text-to-text aparece en el repositorio, pero el uso documentado y los datasets son exclusivamente de texto, por lo que no hay confirmacion de capacidades de vision.
- Audio: no disponible.

## Casos de uso

- Investigacion en internalizacion de razonamiento matematico: el modelo sirve como punto de comparacion dentro de una serie controlada de presupuestos (1M, 5M, 10M, 50M, 100M tokens) con datos y hashes publicados, lo que permite estudiar la relacion entre tokens supervisados y capacidad de razonamiento.
- Evaluacion de teoremas y ecuaciones en entornos academicos: al estar entrenado sobre notas de teoria ecuacional del banco R8, es adecuado para tareas de reescritura, simplificacion y comprobacion de identidades algebraicas dentro del dominio cubierto por el corpus.
- Generacion de explicaciones paso a paso para docencia: el modo thinking con plantilla de chat permite obtener cadenas de razonamiento matematico que un docente puede revisar antes de usar en material didactico.
- Reproduccion de experimentos de ajuste fino: la publicacion de training_config.json, data_provenance.json y training_metrics.json facilita replicar la receta (dos epocas, LR 5e-6, coseno, FSDP2 en ocho GPUs) como linea base en laboratorios con recursos similares.
- Analisis de mezclas de datos en SFT: la proporcion 70% notas / 30% trayectorias con recuentos exactos por epoca permite estudiar el efecto de la mezcla sobre la perdida de validacion sin ambiguedad de conteo.
- Fine-tuning posterior para dominios especificos: al ser un checkpoint completo con licencia Apache 2.0 y pesos safetensors en BF16, puede actuar como punto de partida para especializaciones adicionales sin restricciones de licencia comercial.
- Auditoria de export de pesos: el patron de conversion.json con hash por artefacto y la comprobacion de los 427 tensores de lenguaje es un ejemplo util para equipos que necesitan garantizar la trazabilidad de un export de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de benchmarks se publican por separado y que los resultados de evaluacion de mezclas anteriores no describen este checkpoint. El unico dato cuantitativo de rendimiento declarado es la perdida de validacion compartida final de 0,276607 y el paso de optimizador final 104.

## Requisitos de hardware

- Peso de los parametros: 9,65 mil millones de parametros. El export nativo en BF16 ocupa aproximadamente 19,3 GB (coincide con el tamano del repositorio).
- VRAM estimada para inferencia (estimaciones aritmeticas a partir del numero de parametros, no publicadas por el autor): BF16 en torno a 20-22 GB solo para pesos, mas cache KV; cuantizacion de 8 bits en torno a 11-13 GB; cuantizacion de 4 bits en torno a 7-9 GB.
- GPU recomendadas: para BF16 completo, A100 40 GB, H100 80 GB o L40S 48 GB con margen para cache KV y contexto. En consumer, una RTX 4090 de 24 GB queda muy justa en BF16 y holgada con cuantizacion de 8 o 4 bits.
- Cabe en consumer GPU: si, con cuantizacion. En 4 bits es viable en GPUs de 8-12 GB de VRAM; en 8 bits requiere 16 GB o mas.
- Opciones de despliegue: el autor solo documenta transformers con dtype bfloat16 y device_map="auto". No se publican pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de fabrica en este repositorio. vLLM o TGI serian desplegables a partir de los safetensors BF16, aunque no hay confirmacion del autor y la compatibilidad depende del soporte de la arquitectura qwen3_5 en esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-mix5m-70n30t-thinking | 9,65 mil millones | No disponible | Benchmarks no publicados; perdida de validacion 0,276607 | apache-2.0 | HuggingFace, safetensors BF16 |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros checkpoints de la misma serie (1M, 10M, 50M, 100M) | 9,65 mil millones (mismo base) | No disponible | No disponible | apache-2.0 segun el patron del autor | HuggingFace |
| Alternativas de ~8-9B para matematicas y razonamiento (por ejemplo Qwen3-8B, Llama-3.1-8B-Instruct, Gemma-2-9B) | 8-9 mil millones | No verificado en esta busqueda | No disponible en la informacion proporcionada | Licencias variadas (Apache 2.0, licencia comunitaria) | HuggingFace |

La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas comparables, por lo que la comparativa se limita a lo que consta en el repositorio y en la model card.

## Limitaciones y advertencias

- Dominio muy estrecho: el ajuste se centra en teoria ecuacional y notas matematicas de un banco concreto (R8). Fuera de ese dominio, el comportamiento no esta documentado y cabe esperar degradacion respecto al modelo base.
- Riesgo de alucinacion: en tareas de demostracion matematica, un modelo de 9,65B puede producir pasos plausibles pero incorrectos; la perdida de validacion baja no garantiza correccion formal.
- Idiomas: no se declara cobertura linguistica. No hay garantia de calidad en castellano ni en otros idiomas distintos del material de entrenamiento.
- Longitud de contexto: no se especifica. No se debe asumir la ventana del modelo base sin verificarla antes de desplegar con documentos largos.
- Benchmarks ausentes: la model card remite a una publicacion separada. No hay datos verificables de MMLU, GSM8K, HumanEval ni similares para este checkpoint, y el autor advierte que las evaluaciones de mezclas anteriores no son aplicables.
- Uso de la plantilla de chat: la model card insiste en usar la plantilla incluida con thinking habilitado para evaluacion matematica. Omitirla o desactivar thinking puede degradar los resultados de forma significativa.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 3 de octubre de 2026 y actualizado un minuto despues. Es un artefacto de investigacion sin validacion independiente por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B tiene sus propias condiciones que conviene revisar antes de explotarlo en produccion.
- Trazabilidad parcial: aunque se publican hashes de conversion y procedencia, no se documenta un proceso de evaluacion de sesgos, seguridad ni red teaming.
- Mezcla de datos no replicable fuera del grupo: las notas provienen de un banco sellado (R8) con cabezas en cuarentena; sin acceso a ese corpus no es posible reproducir exactamente el conjunto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix5m-70n30t-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes
- Dataset de rollouts condicionados por notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts
- Ejecucion de entrenamiento en W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqthink5m20261001
- Resultados de benchmarks: no disponibles (la model card indica que se publican por separado, sin enlace en la informacion proporcionada)
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
