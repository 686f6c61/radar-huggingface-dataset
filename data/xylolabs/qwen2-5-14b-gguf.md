# Xylolabs/Qwen2.5-14B-GGUF

## Resumen

Xylolabs/Qwen2.5-14B-GGUF es una cuantizacion de referencia en formato GGUF del modelo base Qwen2.5-14B, publicada por Xylolabs. No se trata de un modelo nuevo ni de un ajuste fino: es una exportacion preservada del checkpoint original de Qwen, preparada con llama.cpp, que mantiene intactos los 579 tensores del decodificador de texto de 48 capas, el embedding, la cabeza de salida, el tokenizador y los metadatos originales. El objetivo es ofrecer una referencia reproducible en Q4_K_M para comparar futuras cuantizaciones contra una linea base estable.

El modelo subyacente, Qwen2.5-14B, es un transformer decoder-only denso de 14.770.033.664 parametros (aproximadamente 14,77 mil millones) desarrollado por el equipo Qwen de Alibaba. Es un modelo base preentrenado, sin ajuste por instrucciones ni plantilla de chat, por lo que su uso previsto es la continuacion de texto en bruto a partir de prompts de texto plano.

La relevancia de esta publicacion es fundamentalmente metodologica: documenta de forma explicita el proceso de cuantizacion (tipos de tensor almacenados, bits medios por peso, evaluacion KL frente a BF16) y verifica que la perdida de calidad es acotada. El archivo ocupa 8,988 GB y requiere unos 8,98 GB de memoria de dispositivo solo para los pesos, mas espacio adicional para la cache KV y los buffers de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), 48 capas |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los metadatos originales se conservan sin cambios; los ejemplos de evaluacion usan 2.048 y 8.192 tokens) |
| Tipos de cuantizacion | Q4_K_M (F32: 241 tensores, Q4_K: 289, Q6_K: 49; 4,865 bits medios por peso) |
| Idiomas soportados | en, ko (segun los metadatos del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico Qwen2.5-14B-Q4_K_M.gguf, 8,988 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen2.5-14B: un transformer decoder-only denso con 48 capas, 579 tensores en el decodificador de texto, embedding y cabeza de salida. Esta exportacion GGUF no introduce cambios arquitectonicos; conserva los metadatos originales del checkpoint, incluida la informacion de contexto.

No se realizo ningun entrenamiento, calibracion ni cuantizacion nueva para esta publicacion, segun indica el autor. El proceso consistio en convertir el checkpoint BF16 original a GGUF con llama.cpp (version de referencia v0.9.0) y almacenar los tensores en una mezcla de tipos F32, Q4_K y Q6_K. El autor no proporciona detalles sobre el dataset de preentrenamiento de Qwen2.5-14B (numero de tokens, composicion, uso de RLHF/DPO), por lo que esa informacion debe consultarse en la release original de Qwen. La innovacion tecnica destacable de esta ficha es la trazabilidad de la cuantizacion: se documenta el fingerprint de calibracion/evaluacion, los IDs de secuencia y token, y se comparan las salidas frente al BF16 almacenado mediante divergencia KL y acuerdo top-1.

## Capacidades

- Generacion de texto por continuacion de prompt en bruto (modelo base, sin plantilla de chat).
- Razonamiento y conocimiento general heredados del preentrenamiento de Qwen2.5-14B.
- Generacion de codigo: la evaluacion incluye items de codigo con firma de funcion y docstring originales.
- Capacidades multilingues limitadas, segun metadatos, a ingles y coreano.
- No dispone de soporte nativo de tool calling ni function calling documentado en esta publicacion.
- No dispone de modo thinking, vision ni audio documentado.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Linea base de evaluacion de cuantizaciones: sirve como referencia Q4_K_M contra la que comparar nuevas propuestas mediante KL medio y recuento de respuestas perdidas o rotas, gracias a que el autor publica el fingerprint exacto de calibracion y evaluacion.
- Continuacion de texto en pipelines de generacion: adecuado para tareas de autocompletado o redaccion asistida donde se controla el prompt en bruto y no se requiere formato conversacional.
- Experimentacion academica con modelos base: permite reproducir comprobaciones de completado en un entorno llama.cpp con un consumo de memoria de unos 9 GB de pesos.
- Despliegue en hardware de gama consumer: al ocupar 8,988 GB en Q4_K_M, puede ejecutarse en GPUs con 12-16 GB de VRAM dejando margen para cache KV y buffers.
- Evaluacion de degradacion por cuantizacion en coreano e ingles: el conjunto de evaluacion incluye ocho secuencias de texto en bruto de 1.024 tokens en ambos idiomas, con 8.184 posiciones puntuadas.
- Verificacion de integridad de exportaciones GGUF: util para validar que una conversion conserva los 579 tensores, el tokenizador y los metadatos originales antes de publicar un modelo cuantizado propio.

## Benchmarks y rendimiento

| Referencia | KL medio | Acuerdo top-1 con BF16 | Respuestas de completado correctas | Perdidas/rotas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 27/28 | — |
| Este Q4_K_M | 0,079851 | 91,31% | 26/28 | 0 |

El autor no reporta velocidad ni throughput. La evaluacion de completado usa 28 de los 33 items de la politica original de modelo base (se omiten cinco items con formato de instruccion), con prefijo de tres ejemplos en texto plano, presupuesto greedy de 48 tokens (96 para codigo) y el stop ID original. El item `ko-explain-sky` se excluye porque la diferencia top-2 en BF16 en el primer token divergente es inferior a 1,0. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,98 GB solo para los pesos GGUF, mas cache KV y buffers de trabajo (el autor no cuantifica el total).
- GPU recomendadas: no especificadas por el autor; por tamano, encaja en GPUs con 12 GB o mas de VRAM.
- Cabe en GPU consumer: si, en modelos con 12-16 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti de 16 GB, RTX 4080/4090), dejando margen para contexto y buffers.
- Opciones de despliegue: llama.cpp (verificado con v0.9.0 y la herramienta `llama-completion`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detalla la integracion.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-GGUF (esta ficha) | 14,77 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Referencia de cuantizacion con evaluacion KL publicada |
| Qwen/Qwen2.5-14B | 14,77 B | no disponible en esta informacion | safetensors (BF16) | Apache 2.0 | Modelo base original, sin cuantizar |
| Otras cuantizaciones GGUF de Qwen2.5-14B | 14,77 B | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni usa plantilla de chat; requiere prompts en bruto y continuara el texto en lugar de responder.
- Riesgo de alucinacion inherente a un modelo de lenguaje preentrenado, no mitigado mediante RLHF o DPO en esta exportacion.
- Idiomas documentados limitados a ingles y coreano; el rendimiento en castellano no esta verificado.
- La cuantizacion Q4_K_M introduce una degradacion medible: KL medio de 0,079851 y acuerdo top-1 del 91,31% frente a BF16.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantia ni respaldo del upstream; debe citarse la release original de Qwen2.5-14B.
- No se documentan evaluaciones de seguridad, sesgos ni robustez; para produccion es necesario realizar una evaluacion de tarea propia, como advierte el propio autor.
- El rendimiento y la latencia no estan reportados, por lo que no puede planificarse capacidad en produccion solo con esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-14B
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
