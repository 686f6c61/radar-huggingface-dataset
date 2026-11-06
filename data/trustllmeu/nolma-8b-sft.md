# TrustLLMeu/nolma-8B-sft

## Resumen

TrustLLMeu/nolma-8B-sft es un modelo de lenguaje de aproximadamente 8.000 millones de parametros publicado por el colectivo TrustLLMeu. Se trata de un ajuste supervisado (SFT, *supervised fine-tuning*) sobre el modelo base TrustLLMeu/nolma-8B, orientado a tareas de instruccion. El repositorio esta alojado en Hugging Face con acceso restringido (gated): es necesario aceptar las condiciones del autor antes de descargar los pesos.

El modelo se distribuye bajo una licencia de tipo *research-only*, lo que limita su uso a fines de investigacion y excluye, en principio, el despliegue comercial sin autorizacion explicita. El tamano del repositorio (72 GB) es coherente con pesos en precision completa o alta (fp32/bf16) para un modelo de 8B, aunque no se detalla el formato exacto de los ficheros en la informacion disponible.

La relevancia de esta ficha es limitada por la escasez de documentacion publica: no se han publicado especificaciones de contexto, composicion del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks. Se recomienda precaucion a cualquier equipo que evalue su adopcion en produccion hasta que el autor publique una *model card* completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | ~8B (deducido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | research-only (other) |
| Formato de pesos | no disponible (repo de 72 GB, compatible con transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base TrustLLMeu/nolma-8B ni sobre la composicion del dataset de SFT utilizado. El nombre sugiere un transformer denso de ~8B parametros, pero no hay confirmacion oficial. Tampoco se documenta el numero de tokens de entrenamiento, la mezcla de datos, ni si se aplicaron tecnicas de RLHF, DPO o preferencias adicionales tras el SFT.

La unica innovacion tecnica identificable es el propio proceso de SFT sobre el modelo base, que previsiblemente mejora la adherencia a instrucciones respecto al checkpoint preentrenado. No se documentan mecanismos como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto e instruccion: el ajuste SFT sugiere capacidad para seguir instrucciones en lenguaje natural, aunque no hay evaluacion publica que lo confirme.
- Razonamiento y conocimiento general: presumible de un modelo de 8B, sin datos verificables.
- Codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion academica sobre SFT: el modelo puede emplearse como checkpoint de referencia para estudiar el efecto del ajuste supervisado sobre un base de 8B, siempre dentro del marco de la licencia research-only.
- Experimentos de alineacion y evaluacion: util para comparar tecnicas de instruccion frente al modelo base nolma-8B en entornos controlados de laboratorio.
- Reproducibilidad de pipelines de fine-tuning: al estar publicado el base y el SFT, permite reproducir y auditar el proceso de ajuste en un contexto de investigacion.
- Generacion de texto en prototipos internos: para pruebas de concepto no comerciales donde no se requiera garantia de contexto largo ni multilingue.
- Estudio de sesgos y robustez: como sujeto de analisis en trabajos sobre comportamiento de modelos 8B ajustados.
- Docencia y formacion: uso en cursos y talleres sobre modelos de lenguaje open source, dado su tamano manejable en GPUs de gama alta.

No se recomienda su uso en produccion comercial ni en aplicaciones criticas sin una evaluacion propia y sin aclarar la licencia con el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa para un modelo denso de ~8B: ~16 GB en bf16/fp16, ~8-10 GB en cuantizacion de 8 bits y ~5-6 GB en 4 bits (estimaciones genericas, no verificadas para este checkpoint).
- GPU recomendadas: no disponible. Por tamano, cabria esperar ejecucion en A100 40GB, H100, L40S o RTX 4090/A6000 con cuantizacion.
- GPU de consumo: previsiblemente viable en RTX 3090/4090 con cuantizacion, aunque sin confirmacion del autor.
- Opciones de despliegue: transformers (declarado); vLLM, llama.cpp, Ollama o TGI no confirmados por falta de formato GGUF publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TrustLLMeu/nolma-8B-sft | ~8B (no confirmado) | no disponible | research-only | Gated en HF | Sin benchmarks publicos |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community | Abierto | Benchmarks publicos extensos |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Abierto | Amplia adopcion |
| Qwen2.5 7B Instruct | 7B | 128k | Apache 2.0 (mayoria) | Abierto | Multilingue, benchmarks publicos |

La comparativa se ofrece solo como referencia de categoria; no se dispone de datos de rendimiento de nolma-8B-sft para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones.
- Licencia research-only: prohibido el uso comercial sin autorizacion expresa del autor; revisar terminos antes de cualquier despliegue.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y puede limitar la reproducibilidad.
- Riesgo de alucinacion: sin evaluaciones publicas, no puede descartarse un comportamiento generativo no verificado.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible anticipar sesgos linguisticos, culturales o de dominio.
- Contexto e idiomas no declarados: imposible planificar aplicaciones que dependan de ventanas largas o soporte multilingue.
- Sin benchmarks: no hay evidencia publica de calidad frente a alternativas de la misma categoria.
- Repositorio de 72 GB: implica pesos en alta precision y requisitos de almacenamiento considerables.

## Enlaces

- Hugging Face: https://huggingface.co/TrustLLMeu/nolma-8B-sft
- Modelo base: https://huggingface.co/TrustLLMeu/nolma-8B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
