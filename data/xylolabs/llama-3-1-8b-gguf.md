# Xylolabs/Llama-3.1-8B-GGUF

## Resumen

Llama-3.1-8B-GGUF es una cuantización de referencia en formato GGUF del modelo base Meta Llama 3.1 8B, publicada por Xylolabs. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión a Q4_K_M realizada con llama.cpp sobre los pesos originales de Meta, pensada como línea base reproducible para comparar candidatos de cuantización. El repositorio conserva los 292 tensores del decoder de 32 capas, la tabla de frecuencias RoPE y los metadatos del tokenizador original.

El modelo subyacente es un transformer decoder-only denso de 8.030.261.312 parámetros, con una ventana de contexto de 128.000 tokens según la especificación de Llama 3.1 (el autor indica que la metadata original de contexto permanece sin cambios, aunque sus pruebas usan ventanas de 2.048 y 8.192 tokens). Al ser un modelo base, no está alineado por instrucciones ni por RLHF: espera texto crudo como prompt y produce continuaciones, no respuestas conversacionales.

Su relevancia es acotada pero concreta: sirve como referencia verificable de cuantización Q4_K_M, con métricas de divergencia frente a BF16 (KL medio de 0,034777 y 90,58% de acuerdo top-1) y una huella de pesos de 4,921 GB, lo que lo hace desplegable en GPU de consumo. Es útil para pipelines que necesitan un modelo base pequeño, para calibración de evaluaciones de cuantización y para entornos llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (metadata original de Llama 3.1); pruebas del autor a 2.048 y 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (tipos reales: 66 tensores F32, 193 Q4_K, 33 Q6_K; 4,894 bits por valor almacenado) |
| Idiomas soportados | en, ko (según la model card; el modelo base de Meta declara más idiomas, no verificados aquí) |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy incorporada) |
| Formato de pesos | GGUF (fichero `Llama-3.1-8B-Q4_K_M.gguf`, 4,921 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B base de Meta: un transformer decoder-only denso de 32 capas con atención multi-cabeza agrupada (GQA), normalización RMSNorm y RoPE. El repositorio no entrena ni recalibra nada: el autor declara explícitamente que no se realizó entrenamiento, calibración ni cuantización nuevos para la publicación, sino que se preserva una conversión GGUF existente. La procedencia de los pesos es el espejo de Unsloth de Llama 3.1 8B, cuyos cuatro ficheros safetensors coinciden en tamaño e identidad LFS SHA256 con la release base oficial de Meta.

El proceso de cuantización se hizo con llama.cpp (revisión `cd959bae99ff4bed22bef2604f45241c09bbb8c8`). Se conservan los 292 tensores completos del decoder, el embedding, la cabeza de salida, la tabla fija de frecuencias RoPE y los metadatos del tokenizador original. El resultado es una mezcla Q4_K_M: la mayoría de tensores en Q4_K, un subconjunto en Q6_K y las tablas y operandos críticos en F32, lo que eleva la media a 4,894 bits por valor almacenado.

## Capacidades

- Generación de texto por continuación de texto crudo (modelo base, sin formato de chat ni de instrucciones).
- Razonamiento y conocimiento factual básico heredado de Llama 3.1 8B, evaluado por el autor con 28 ítems de política base (completaciones cortas en inglés y coreano).
- Generación de código a partir de firma de función y docstring (el autor incluye ítems de código con presupuesto de 96 tokens).
- Capacidad multilingüe limitada a lo declarado en la model card: inglés y coreano; el ítem `ko-fact-hangul` es el único que mejora respecto a BF16 en la evaluación del autor.
- No soporta tool calling ni function calling de forma nativa: al ser un modelo base sin alineación, no hay plantilla de herramientas ni comportamiento de agente entrenado.
- No soporta modo thinking, visión, audio ni razonamiento multi-paso guiado; cualquier capacidad de agente requeriría un modelo ajustado por instrucciones sobre esta base.

## Casos de uso

- Línea base de evaluación de cuantizaciones: usar este Q4_K_M como referencia fija para medir la degradación de candidatos propios (KL, acuerdo top-1, tasa de respuestas correctas) con el mismo conjunto de 28 ítems y el mismo prefijo de tres ejemplos.
- Generación de texto en bruto en pipelines de completado: integrarlo con `llama-completion` o la API de llama.cpp para tareas de continuación sin instrucciones, como autocompletado de documentos o generación de campos estructurados a partir de un prefijo.
- Inferencia local en GPU de consumo: con 4,921 GB de pesos, cabe en tarjetas de 8 GB o más dejando espacio para caché KV y buffers, lo que permite prototipado en estaciones de trabajo sin clúster.
- Evaluación de tokenizadores y de comportamiento multilingüe inglés-coreano: el autor verifica la reproducción byte a byte de las salidas BF16 guardadas, útil para validar cambios de tokenizador o de versión de llama.cpp.
- Servicio de completado de bajo coste en CPU: al ser GGUF Q4_K_M, es desplegable con llama.cpp en CPU para tareas de generación de baja concurrencia donde la latencia no es crítica.
- Base para ajuste fino posterior: al conservar la arquitectura y el tokenizador originales, sirve como punto de partida para SFT/LoRA en dominios específicos, aunque para uso conversacional conviene partir del modelo instruct de Meta.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). La única evaluación disponible es una comparación interna de cuantización frente a BF16 sobre 28 ítems de política base y ocho secuencias de 1.024 tokens (8.184 posiciones puntuadas):

| Referencia | KL medio | Acuerdo top-1 con BF16 | Completaciones correctas | Perdidas/rotas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 23/28 | — |
| Este Q4_K_M | 0,034777 | 90,58% | 24/28 | 0 |

El autor advierte que estos textos y prompts retenidos no constituyen un resultado de tarea downstream y que no se reporta velocidad. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para pesos: 4,921 GB solo para el fichero GGUF; hay que sumar caché KV y buffers de trabajo.
- VRAM práctica estimada: aproximadamente 6-7 GB para contexto de 2.048-8.192 tokens, según la implementación y el tamaño de lote.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en datacenter, A100 o H100 para mayor concurrencia y contexto largo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en 6 GB sería necesario reducir contexto o usar cuantizaciones menores (no incluidas en este repo).
- Opciones de despliegue: llama.cpp (referencia del autor, revisión `cd959bae99ff4bed22bef2604f45241c09bbb8c8`), Ollama y otras herramientas compatibles con GGUF; vLLM y TGI no son la vía natural para este fichero GGUF concreto.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-GGUF (este) | 8,03 B | 128.000 (metadata) | GGUF Q4_K_M | Llama 3.1 Community | Referencia de cuantización, modelo base, evaluación interna de 28 ítems |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 | safetensors (BF16) | Llama 3.1 Community | Modelo original base; pesos completos, mayor VRAM (aprox. 16 GB) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | safetensors | Llama 3.1 Community | Variante alineada por instrucciones; apta para chat y tool calling |
| unsloth/Llama-3.1-8B | 8,03 B | 128.000 | safetensors | Llama 3.1 Community | Espejo usado como fuente de la conversión; mismos SHA256 que Meta |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene formato de chat y no debe usarse directamente como asistente conversacional.
- Riesgo de alucinación y de continuaciones incoherentes inherente a un modelo base sin alineación; no hay RLHF ni DPO.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está verificado y probablemente sea inferior al de modelos con cobertura multilingüe explícita.
- La evaluación del autor es muy reducida (28 ítems, 8 secuencias de 1.024 tokens) y no mide tareas downstream ni velocidad; no debe interpretarse como validación de calidad general.
- La licencia Llama 3.1 Community impone la Acceptable Use Policy de Meta y condiciones comerciales adicionales; el uso comercial a gran escala requiere revisar los términos (incluido el umbral de usuarios activos mensuales de la licencia).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- La ventana de 128.000 tokens es la de la metadata original, pero el autor solo prueba hasta 8.192 tokens; el comportamiento en contextos muy largos con esta cuantización no está verificado.
- No se reportan latencia ni throughput, lo que impide planificar capacidad sin mediciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.1-8B
- Espejo de Unsloth usado en la conversión: https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- llama.cpp (revisión usada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Licencia en el repo: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
