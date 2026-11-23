# SZLHOLDINGS/SZL-Khipu-1.5B

## Resumen

SZL-Khipu-1.5B es un modelo de generacion de texto desarrollado por SZLHOLDINGS, un proyecto que se presenta como un "estate" de IA gobernada con resultados auditables y trazables. El modelo es un ajuste fino (fine-tune) de Qwen/Qwen2.5-1.5B-Instruct, por lo que hereda la arquitectura transformer decoder-only de la familia Qwen2.5 con 1.543.714.304 parametros totales y una ventana de contexto que, segun la arquitectura base, alcanza los 32.768 tokens (aunque la model card no lo declara explicitamente).

La relevancia de este modelo reside mas en su enfoque de gobernanza y trazabilidad que en innovaciones arquitectonicas: el autor insiste en que cualquier afirmacion de calidad debe estar respaldada por "receipts" (recibos de auditoria) medidos, y declara explicitamente UNKNOWN todo aquello que no ha sido verificado. En el momento de la ultima actualizacion, el propio autor reconoce que no existe una cadena de recibos de evaluacion estricta, por lo que no se emiten afirmaciones de calidad.

Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamano de repositorio de 3,2 GB, lo que sugiere pesos en precision completa (fp16/bf16) sin cuantizaciones adicionales publicadas. Esta orientado principalmente al idioma ingles segun los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura base Qwen2.5: 32.768 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La arquitectura base Qwen2.5-1.5B-Instruct incorpora atencion con query/key/value bias y soporta una ventana de contexto nativa de 32.768 tokens con generacion de hasta 8.192 tokens en la variante instruct.

No se dispone de informacion sobre el proceso de entrenamiento del fine-tune: la model card no especifica el numero de tokens utilizados, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales sobre el modelo base. El autor declara explicitamente que las afirmaciones de entrenamiento y evaluacion viven en ficheros de "receipts" del estate y que, en el momento de la auditoria (2026-11-22T23:21:51Z), no se encontro una cadena de recibos estricta (estado UNKNOWN_NO_EVAL_RECEIPT), por lo que no se emiten afirmaciones de calidad.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones (modelo de tipo instruct).
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidades del base, no verificadas en este fine-tune).
- Soporte de conversacion multi-turno mediante plantilla de chat de Qwen2.5 (no documentado explicitamente en la model card).
- Capacidades multilingues limitadas: los metadatos solo declaran ingles, aunque el modelo base Qwen2.5 soporta multiples idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo cabe en GPUs de consumo y permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Generacion de texto en entornos con requisitos de trazabilidad: el enfoque de "receipts" del autor facilita auditar el origen y las afirmaciones sobre el artefacto, util en contextos de compliance.
- Fine-tuning adicional sobre dominios especificos: al ser un modelo pequeno con licencia Apache 2.0, sirve como punto de partida para ajustes con datos propios.
- Educacion e investigacion: modelo ligero para experimentar con tecnicas de alineacion, evaluacion y gobernanza de modelos.
- Generacion de codigo asistida en local: con 1.5B parametros puede ejecutarse en portatiles con GPU modesta para autocompletado o explicacion de fragmentos.
- Clasificacion y extraccion de informacion en ingles: tareas de NLP supervisadas donde un modelo pequeno instruct es suficiente y el coste de inferencia importa.
- Despliegue en edge o entornos con recursos limitados: el tamano de 3,2 GB en safetensors permite cuantizacion a 4 bits para ejecucion en CPU o GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la auditoria del 2026-11-22 concluyo con estado UNKNOWN_NO_EVAL_RECEIPT, sin cadena de recibos de evaluacion estricta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB para contextos moderados).
- VRAM estimada en cuantizacion 4 bits (si se genera con herramientas externas): aproximadamente 1 GB para pesos, 2-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); en cuantizacion 4 bits cabe en GPUs de 4 GB o incluso CPU.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de gama media y alta.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama (requiere conversion a GGUF, no publicada), vLLM y TGI (compatibles con arquitectura Qwen2, previa verificacion).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B | 1.543.714.304 | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Fine-tune de Qwen2.5-1.5B-Instruct, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 | Apache 2.0 | Hugging Face | Modelo base, con benchmarks publicados por el autor |
| Llama 3.2 1B Instruct | ~1.240 millones | 128.000 | Llama 3.2 Community License | Hugging Face | Alternativa de Meta, contexto mayor, licencia con restricciones |
| SmolLM2-1.7B-Instruct | ~1.700 millones | 8.192 | Apache 2.0 | Hugging Face | Alternativa de Hugging Face, contexto menor |

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas para este artefacto; el autor declara estado UNKNOWN_NO_EVAL_RECEIPT, por lo que no se puede afirmar su calidad relativa frente al modelo base.
- Riesgo de alucinacion inherente a modelos de 1.5B parametros; no apto para tareas que requieran alta fiabilidad sin verificacion humana.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base multilingue.
- Sesgos: no documentados; hereda los sesgos del corpus de entrenamiento de Qwen2.5, no auditados en este fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del modelo base Qwen2.5 (tambien Apache 2.0).
- Contexto: la model card no declara la longitud de contexto del fine-tune; asumir la del base (32.768 tokens) sin verificacion puede ser arriesgado en produccion.
- Gobernanza: el enfoque de "receipts" es una propuesta del autor; la ausencia de cadena de recibos estricta limita la confianza en afirmaciones de entrenamiento.
- Produccion: al no haber cuantizaciones GGUF publicadas ni benchmarks, requiere evaluacion propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio estate-cards (generador de tarjetas): https://github.com/szl-holdings/estate-cards
- Organizacion GitHub (referenciada en la model card): https://github.com/szl-holdings
