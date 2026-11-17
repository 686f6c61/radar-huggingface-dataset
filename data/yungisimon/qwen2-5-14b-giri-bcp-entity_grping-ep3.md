# yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep3

## Resumen

Qwen2.5-14B-giri-bcp-entity_grping-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, empleando un metodo de agrupacion de entidades (`entity_grping`, con frecuencia documental maxima de 3). El checkpoint publicado corresponde a la tercera y ultima epoca de entrenamiento sobre un conjunto de 3.046.524 ejemplos.

Se trata de un modelo denso de 14.770.033.664 parametros (aproximadamente 14,8 mil millones), con pesos en bf16 y formato safetensors, cargable directamente con `transformers` mediante `AutoModelForCausalLM.from_pretrained` y la plantilla de chat de Qwen. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero especifica: no es un modelo generalista nuevo, sino un experimento de investigacion orientado a evaluar si el ajuste fino sobre tareas de memoria y agrupacion de entidades mejora el comportamiento del modelo en escenarios de recuperacion y sintesis de informacion multi-documento. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere un uso experimental y no una adopcion productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), modelo base Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens durante el entrenamiento; el modelo base Qwen2.5 soporta hasta 32.768 tokens nativos y 131.072 con RoPE scaling (no confirmado para este checkpoint) |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, que soporta multiples idiomas, pero no se declaran en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni componentes de estado recurrente. El ajuste fino ha sido completo (no LoRA ni adaptadores), con el 100 % de los parametros entrenables (14.770.033.664). El entrenamiento se ejecuto con FSDP sobre 8 GPU AMD Instinct MI325X, con un tamano de lote efectivo de 1024 (128 por dispositivo, sin acumulacion, 8 dispositivos), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay de 0.01, norma maxima de gradiente de 1.0 y precision bf16 con checkpointing de gradientes. La perdida se calculo unicamente sobre los tokens del asistente.

El conjunto de datos es sintetico y deriva de BrowseComp-Plus, con 3.046.524 ejemplos generados mediante el metodo de agrupacion de entidades `entity_grping` (frecuencia documental maxima de 3) y una variante de combinacion entre documentos (`crossdoc_entity_combination_v3`). La longitud maxima de secuencia fue de 8.096 tokens. El entrenamiento completo de las tres epocas requirio 10,08 horas de reloj (80,6 GPU-hora). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa adicionales.

## Capacidades

- Generacion de texto conversacional multiturno, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento y sintesis de informacion procedente de multiples documentos, reforzado por el entrenamiento sobre pares QA de BrowseComp-Plus.
- Memoria y agrupacion de entidades: el ajuste esta disenado para tareas de consolidacion de informacion sobre entidades recurrentes en corpus documentales.
- Capacidad de seguir la plantilla de chat de Qwen (system/user/assistant), lo que facilita su integracion en pipelines existentes.
- Soporte de tool calling y function calling: no documentado explicitamente para este checkpoint, aunque el modelo base lo soporta; debe validarse empiricamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingues: no declaradas; dependen del modelo base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre modelos de memoria: evaluar como el ajuste fino sobre tareas de agrupacion de entidades afecta a la capacidad del modelo de consolidar informacion entre documentos, comparando con el Qwen2.5-14B-Instruct original.
- Experimentos de recuperacion aumentada (RAG) con contexto multi-documento: el modelo puede procesar hasta 8.096 tokens de contexto de entrenamiento y sintetizar respuestas a partir de varios pasajes, lo que lo hace util como generador en pipelines RAG experimentales.
- Benchmarking de tecnicas de agrupacion documental: servir como referencia para comparar el metodo `entity_grping` frente a otras estrategias de construccion de datasets sinteticos en tareas de QA.
- Generacion de resumenes de entidades: en escenarios donde se requiere consolidar menciones dispersas de una misma entidad a lo largo de un corpus, el entrenamiento especifico puede aportar ventajas frente al modelo base.
- Reproducibilidad de experimentos academicos: al documentarse hiperparametros, hardware y dataset, el checkpoint permite reproducir y extender el estudio de ajuste fino sobre BrowseComp-Plus.
- Evaluacion de la degradacion por especializacion: analizar si el ajuste sobre un dominio sintetico reduce capacidades generales del modelo base, comparando respuestas en tareas abiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 40-48 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15-16 GB para pesos, viable en GPU de 24 GB con contexto limitado.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 8-9 GB para pesos, aunque no se publican pesos cuantizados oficiales y habria que generarlos.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD MI325X (usada en entrenamiento); para inferencia en bf16, A100 40 GB puede ser ajustada y requeriria contextos cortos.
- GPU de consumo: una RTX 4090 (24 GB) no puede cargar el modelo en bf16; seria necesario cuantizar a 8 o 4 bits, con perdida de calidad no evaluada.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint, aunque deberian funcionar si se generan los formatos correspondientes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep3 | 14,77 B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste especializado en memoria y agrupacion de entidades |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 nativo, 131.072 con RoPE scaling | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base generalista, con soporte de tool calling y multilingue |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 nativo, 131.072 con RoPE scaling | Apache 2.0 | Hugging Face | Alternativa de menor tamano, menor coste de inferencia |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 | Apache 2.0 | Hugging Face | Alternativa europea con contexto largo, sin especializacion en memoria |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 interacciones: no hay evidencia de validacion independiente ni de uso en produccion.
- El ajuste fino sobre un dataset sintetico y especializado puede degradar capacidades generales del modelo base (olvido catastrofico); no se han publicado evaluaciones que lo descarten.
- Riesgo de alucinacion: al entrenarse sobre pares QA sinteticos derivados de BrowseComp-Plus, el modelo puede generar respuestas plausibles pero no verificadas, especialmente fuera del dominio de entrenamiento.
- Longitud de contexto de entrenamiento limitada a 8.096 tokens: aunque el modelo base soporta contextos mayores, no hay garantia de que el comportamiento ajustado se mantenga mas alla de esa longitud.
- Idiomas soportados no declarados: se desconoce si el ajuste fino ha preservado el multilingüismo del modelo base.
- No se documentan pesos cuantizados oficiales; cualquier cuantizacion a 8 o 4 bits es responsabilidad del usuario y puede afectar al rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-14B-Instruct tiene sus propios terminos que deben respetarse; se recomienda revisar la licencia del modelo base.
- Ausencia de benchmarks: no es posible comparar objetivamente su rendimiento con alternativas sin ejecutar evaluaciones propias.
- Fecha de creacion del repositorio (2026-11-17) posterior a la consulta: verificar la vigencia y posibles actualizaciones del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- BrowseComp-Plus: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible
