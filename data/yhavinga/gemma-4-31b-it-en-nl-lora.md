# yhavinga/gemma-4-31b-it-en-nl-lora

## Resumen

Gemma 4 31B-it English→Dutch LoRA es un adaptador LoRA de traducción inglés-neerlandés construido sobre el modelo base google/gemma-4-31B-it. Lo desarrolla el usuario de Hugging Face yhavinga y se publica bajo licencia Apache 2.0. Resuelve un problema acotado: mejorar la calidad de la traducción directa EN→NL del modelo base sin reentrenar los 31.000 millones de parámetros, mediante un adaptador de solo 244,9 millones de parámetros entrenables.

El adaptador emplea una estrategia de destilación autoinducida: el propio modelo base genera ocho candidatos por cada fuente en inglés, actúa como juez por pares frente a su traducción greedy y solo se conservan los candidatos preferidos por el juez y no peores según MetricX-24 QE. El resultado es un adaptador de rango 32 aplicado a las proyecciones de atención y MLP de las 60 capas del decodificador de texto.

Es relevante para equipos que necesiten traducción EN→NL de alta fidelidad en producción y quieran evitar el coste de un fine-tuning completo, ya que el adaptador se puede fusionar con el base o cuantizar a GGUF (Q4_K_M, Q8_0) para llama.cpp y LM Studio. El contexto de entrenamiento está limitado a 4.096 tokens y la ventana nativa del modelo base no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Gemma 4 31B-it; rango 32, alpha 16 (escala 0.5) |
| Parametros totales | 244,9 M parámetros del adaptador (410 módulos); base de 31B no incluida |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el base; secuencias de entrenamiento de hasta 4.096 tokens |
| Tipos de cuantizacion | Adaptador en float32; versión fusionada disponible en GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | en, nl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decodificador de texto de Gemma 4 31B-it. Concretamente, modula las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 60 capas; las 10 capas de atención global carecen de `v_proj` (sus valores provienen de `k_proj`), lo que da 410 módulos. Los embeddings permanecen congelados y el dropout es 0. El adaptador se almacena en float32 y suma 244,9 M parámetros.

El entrenamiento usa 24.000 fuentes en inglés, incluyendo retrotraducciones al inglés de texto web neerlandés (FineWeb-2) e instrucciones FLAN. Para cada fuente se generan 8 muestras del base con temperatura 1; el propio Gemma 4 31B-it actúa como juez por pares (en ambos órdenes) frente a la traducción greedy con una rúbrica que prioriza precisión y luego naturalidad en neerlandés. Se conserva la muestra si el juez la prefiere (probabilidad media > 0,5) y su MetricX-24 QE no es peor que la de la greedy, resultando 15.194 objetivos (63% de las fuentes). La optimización usa AdamW con LR 5e-5 constante tras 10 pasos de warm-up, clipping de gradiente 1.0 y pérdida solo sobre el objetivo. Se publica el checkpoint del paso 140 de 205 (unas 1,4 pasadas sobre los datos), elegido sobre un split de búsqueda. El entrenamiento se hizo con MaxText y se convirtió a PEFT, verificando la conversión teacher-forced en `transformers`.

## Capacidades

- Traducción directa inglés→neerlandés con fidelidad y naturalidad, manteniendo nombres, números, detalles, matices y tono.
- Preservación de párrafos, saltos de línea y formato del texto de origen.
- Salida concisa, sin explicaciones ni comentarios añadidos.
- Funciona con el chat template del modelo base con el modo thinking desactivado (por defecto) y decodificación greedy.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso específicas del adaptador.
- Capacidad multilingüe limitada al par en→nl; no se documenta soporte de otros pares.

## Casos de uso

- Traducción de documentación técnica EN→NL: el adaptador mantiene nombres de API, números y formato, adecuado para manuales y referencias que no admiten paráfrasis.
- Localización de contenido web y marketing: la instrucción exige naturalidad idiomática y concisión, útil para textos que deben leerse como originales en neerlandés.
- Traducción de artículos y prensa: el entrenamiento incluye retrotraducciones de FineWeb-2, lo que cubre registros divulgativos y periodísticos.
- Traducción de instrucciones y prompts FLAN: el dataset incorpora instrucciones FLAN, útil para localizar guías de tareas y prompts de usuario.
- Procesamiento por lotes en pipelines de datos: al ser un adaptador PEFT ligero, se puede fusionar con el base y desplegar con vLLM o llama.cpp para traducir grandes volúmenes.
- Despliegue en estación de trabajo con GGUF: la versión Q4_K_M/Q8_0 permite ejecutar la traducción en llama.cpp o LM Studio sin GPU de datacenter.
- Evaluación y control de calidad de traducción automática: sirve como sistema de referencia EN→NL para comparar con otros motores mediante MetricX-24 o COMET-22.

## Benchmarks y rendimiento

Evaluación en splits retenidos (no usados en entrenamiento ni en la selección del checkpoint). MetricX-24 QE (menor es mejor) y COMET-22 frente al modelo base con el mismo prompt y decodificación greedy:

| Conjunto | n | QE adaptador | QE base | QE referencia humana | COMET-22 adaptador | COMET-22 base |
|---|---:|---:|---:|---:|---:|---:|
| WMT24++ en-nl | 480 | 2,167 | 2,276 | 2,463 | 0,8519 | 0,8502 |
| FLORES-200 en-nl | 504 | 1,105 | 1,115 | 1,493 | 0,8892 | 0,8895 |
| NTREX-128 en-nl | 999 | 1,498 | 1,547 | 1,874 | 0,8818 | 0,8820 |

Comparaciones por pares con el base donde las traducciones difieren:

- Revisor LLM (Claude, ciego, misma rúbrica que el juez) sobre 100 pasajes: 39 / 22 / 39 (adaptador mejor / base mejor / igual); en otros 100: 40 / 19 / 41; en 45 pasajes de retrotraducción retenidos: 16 / 5 / 24.
- Un revisor humano, 40 pares ciegos de varios tipos de fuente: 18 / 16 / 6, sin preferencia clara (retrotraducción 6 / 1 / 3).
- Un clasificador entrenado para distinguir neerlandés original de traducido por máquina califica el 32,0% de las traducciones del adaptador (WMT24++ y FLAN) como neerlandés original, frente al 30,0% del base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~62 GB de acelerador o memoria de CPU para el base más el adaptador.
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; configuraciones multi-GPU con `device_map="auto"`.
- En consumer GPU: no cabe en bf16 en una RTX 4090 (24 GB); la versión GGUF Q4_K_M sí es viable en GPUs de 24 GB o menos, y Q8_0 requiere aproximadamente el doble.
- Opciones de despliegue: `transformers` + `peft` (con `merge_and_unload()` para fusionar), llama.cpp y LM Studio mediante el repositorio GGUF; vLLM y TGI no se documentan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yhavinga/gemma-4-31b-it-en-nl-lora | 244,9 M (adaptador) sobre base de 31B | 4.096 tokens de entrenamiento | LoRA EN→NL | apache-2.0 | Hugging Face (PEFT + GGUF) |
| google/gemma-4-31B-it (base) | 31B | no disponible | Modelo generalista | no disponible en la información | Hugging Face |
| Alternativas EN→NL dedicadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores o modelos de traducción EN→NL comparables en la información proporcionada.

## Limitaciones y advertencias

- La mejora se mide con MetricX y un revisor LLM; un revisor humano no vio diferencia clara, y las traducciones no se leen de forma medible más como neerlandés original.
- El adaptador solo cubre en→nl; no se documenta comportamiento en otros pares ni en traducción inversa.
- Las secuencias de entrenamiento se limitan a 4.096 tokens; textos más largos pueden degradar la calidad o requerir troceado.
- Riesgo de alucinación y de omisión en textos largos o con formato complejo, pese a la instrucción de no añadir ni omitir.
- El adaptador se publica en float32 y requiere el modelo base completo para su uso en PEFT; el despliegue en bf16 exige ~62 GB de memoria.
- La licencia del adaptador es Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base Gemma 4, no especificada en la información disponible.
- Solo el 63% de las fuentes generaron objetivos válidos; la cobertura de dominios depende de FineWeb-2 y FLAN y puede no representar jerga técnica especializada.
- No se documentan sesgos específicos ni evaluación de robustez frente a contenido sensible.

## Enlaces

- Adaptador LoRA: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-lora
- Versión GGUF fusionada y cuantizada: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
