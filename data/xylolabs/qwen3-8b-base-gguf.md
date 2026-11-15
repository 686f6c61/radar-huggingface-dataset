# Xylolabs/Qwen3-8B-Base-GGUF

## Resumen

Xylolabs/Qwen3-8B-Base-GGUF es una cuantizacion GGUF de referencia del modelo base Qwen3-8B-Base, publicada por Xylolabs mediante llama.cpp. No se trata de un modelo nuevo ni de un ajuste fino: es una exportacion preservada del checkpoint base de Qwen, mantenida en formato Q4_K_M para su uso con llama.cpp y herramientas compatibles. El modelo subyacente es un decoder transformer de 36 capas con 8.190.735.360 parametros, desarrollado originalmente por el equipo Qwen y publicado bajo licencia Apache 2.0.

La relevancia de esta publicacion es acotada pero util: proporciona una referencia reproducible de cuantizacion con metricas de fidelidad documentadas frente al BF16 original (KL medio de 0,040335 y 89,59% de acuerdo top-1), lo que permite evaluar futuras cuantizaciones contra una linea base estable. Al ser un modelo base (no post-entrenado), no incorpora plantilla de chat ni modo de razonamiento; esta pensado para continuacion de texto con prompts crudos.

El repo ocupa 5,0 GB e incluye un unico archivo Q4_K_M de 5,028 GB con 399 tensores. La model card declara soporte de ingles y coreano, aunque al derivar de Qwen3-8B-Base el modelo subyacente tiene cobertura multilingue mas amplia que la declarada en las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (36 capas), modelo base preentrenado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la metadata original del contexto se mantiene sin cambios; los ejemplos usan 2.048 y las comprobaciones GPU usan 8.192) |
| Tipos de cuantizacion | Q4_K_M (tipos de tensor almacenados: F32 145, Q4_K 217, Q6_K 37; media de 4,905 bits por peso) |
| Idiomas soportados | en, ko (segun etiquetas del autor); el modelo base Qwen3 tiene cobertura multilingue mas amplia no detallada aqui |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder de 36 capas con embedding, cabecera de salida y 399 tensores en total, segun la model card. Se trata de un checkpoint base preentrenado de la familia Qwen3, sin post-entrenamiento (no hay RLHF, DPO ni SFT aplicado en esta version). Esta publicacion concreta no implica entrenamiento, calibracion ni cuantizacion nueva por parte de Xylolabs: es una exportacion preservada del checkpoint Qwen/Qwen3-8B-Base convertida a GGUF con llama.cpp.

La innovacion tecnica documentada es la metodologia de evaluacion de fidelidad de la cuantizacion. Se comparan las salidas del Q4_K_M frente al BF16 almacenado usando KL medio, acuerdo top-1 y un conjunto de comprobaciones de continuacion de texto (28 items de un total de 33, omitiendo cinco items de formato de instruccion). Ademas se emplean ocho secuencias de texto crudo en ingles y coreano de 1.024 tokens que cubren 8.184 posiciones puntuadas, con IDs de secuencia, IDs de token, posiciones iniciales, IDs de prompt y presupuestos de generacion identicos a los originales. No se documentan detalles adicionales sobre el dataset de preentrenamiento de Qwen3-8B-Base en la informacion disponible.

## Capacidades

- Generacion y continuacion de texto crudo: el modelo esta disenado para completar prompts sin plantilla de chat.
- Razonamiento y conocimiento general heredados del preentrenamiento de Qwen3-8B-Base.
- Generacion de codigo en formato de continuacion (la evaluacion incluye items de codigo con firma de funcion y docstring).
- Capacidades multilingues: las etiquetas declaran ingles y coreano; el modelo base Qwen3 tiene cobertura mas amplia no especificada en esta ficha.
- No soporta tool calling ni function calling de forma nativa en esta version base.
- No incluye modo de razonamiento (thinking mode) ni plantilla de chat: la model card indica explicitamente que no se usan comprobaciones de chat ni de thinking.
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Evaluacion de cuantizaciones: sirve como linea base de referencia Q4_K_M con metricas de KL y acuerdo top-1 documentadas, contra la que comparar nuevas cuantizaciones candidatas del mismo checkpoint.
- Continuacion de texto en pipelines de generacion: adecuado para tareas de autocompletado y generacion libre donde no se requiere formato conversacional, usando llama.cpp con prompts crudos.
- Generacion de codigo por continuacion: la evaluacion incluye items de codigo con firma y docstring, por lo que puede emplearse en tareas de completado de funciones en entornos con restricciones de memoria (5,02 GB de pesos).
- Investigacion sobre fidelidad de cuantizacion: util para estudiar el impacto de Q4_K_M en modelos de 8B comparando KL medio y acuerdo top-1 frente a BF16.
- Despliegue en hardware con VRAM limitada: al ocupar unos 5,02 GB en pesos, cabe en GPUs de consumo para inferencia de texto sin requisitos elevados.
- Experimentacion con modelos base: permite estudiar el comportamiento de un checkpoint preentrenado sin post-entrenamiento en tareas de continuacion y evaluar su calidad antes de aplicar ajuste fino.
- Procesamiento de texto en ingles y coreano: para tareas de generacion o continuacion en esos idiomas, segun las etiquetas declaradas por el autor.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Documenta unicamente metricas de fidelidad de la cuantizacion frente al BF16 almacenado:

| Referencia | KL medio | Acuerdo top-1 con BF16 | Respuestas de continuacion correctas | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 28/28 | — |
| Este Q4_K_M | 0,040335 | 89,59% | 28/28 | 0 |

Las comprobaciones cubren 28 de 33 items (se omiten cinco de formato de instruccion), con presupuestos de generacion greedy de 48 tokens (96 para codigo) y sin plantilla de chat. La evaluacion de texto crudo usa ocho secuencias de 1.024 tokens en ingles y coreano (8.184 posiciones puntuadas). No se reportan datos de velocidad ni throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,02 GB solo para los pesos GGUF, mas espacio para la cache KV y buffers de trabajo.
- La model card no especifica GPUs recomendadas ni requisitos minimos de VRAM total.
- Por tamano de pesos, es plausible su ejecucion en GPUs de consumo con 8 GB o mas de VRAM, aunque esta estimacion no esta confirmada en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (verificado con llama.cpp v0.9.0 y comprobaciones GPU con contexto 8.192); compatible con herramientas que consuman GGUF.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Base-GGUF (esta ficha) | 8,19B | No disponible | GGUF Q4_K_M | Apache 2.0 | Cuantizacion de referencia con metricas de fidelidad documentadas |
| Qwen/Qwen3-8B-Base | 8,19B | No disponible | Safetensors (BF16) | Apache 2.0 | Checkpoint original sin cuantizar; referencia de fidelidad |
| Otras cuantizaciones GGUF de Qwen3-8B-Base | 8,19B | No disponible | GGUF | Apache 2.0 (heredada) | No disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks estandar para comparar el rendimiento de tareas frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base sin post-entrenamiento: no sigue instrucciones de forma fiable ni mantiene formato conversacional; requiere prompts crudos.
- No incorpora plantilla de chat ni modo de razonamiento; la model card advierte que no se realizan comprobaciones de chat ni de thinking.
- Riesgo de alucinacion inherente a un modelo de lenguaje preentrenado sin alineamiento.
- Sesgos no documentados en la informacion proporcionada; al derivar de un corpus web a gran escala, es esperable que los herede.
- Cobertura idiomatica declarada limitada a ingles y coreano en las etiquetas, aunque el modelo base subyacente es multilingue.
- La licencia Apache 2.0 se hereda del release de Qwen; la model card senala que el release base no tiene archivo de licencia raiz y que el LICENSE de este repo reproduce los terminos oficiales de la familia Qwen3. Se proporciona "tal cual", sin garantia ni respaldo del upstream.
- Las metricas de fidelidad (KL 0,040335, acuerdo top-1 89,59%) miden similitud con BF16, no calidad de tarea; una integracion en produccion requiere su propia evaluacion.
- No se reportan datos de velocidad, latencia ni throughput, por lo que el rendimiento en produccion no puede estimarse a partir de esta ficha.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe tecnico Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Codigo llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
