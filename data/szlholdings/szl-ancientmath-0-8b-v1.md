# SZLHOLDINGS/SZL-AncientMath-0.8B-v1

## Resumen

SZL AncientMath 0.8B v1 es un modelo de generacion de texto de pequeno tamano (873.438.784 parametros, aproximadamente 0,87 mil millones) desarrollado por SZLHOLDINGS, un consorcio que publica modelos, datasets y Spaces bajo lo que denomina un "estate governed-AI" con resultados trazables mediante ficheros de recibos (receipts). El modelo se presenta como un artefacto especializado en matematicas antiguas, derivado por fine-tuning del checkpoint base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez pertenece a la familia Qwen 3.5 segun la etiqueta `qwen3_5` del repositorio.

La relevancia de este modelo es limitada pero concreta: se trata de un ajuste fino de dominio sobre una base de 0,8B, lo que lo hace desplegable en hardware de consumo y util para tareas de procesamiento de textos matematicos historicos, transcripcion y normalizacion de notacion antigua. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, aunque la model card no documenta el proceso de entrenamiento ni resultados medidos.

Es importante senalar que la model card del autor no incluye especificaciones tecnicas detalladas: no se declara la longitud de contexto, la composicion del dataset de entrenamiento, ni se aportan resultados de benchmarks. El autor indica explicitamente que cualquier cifra no respaldada por un recibo medido se etiqueta como UNKNOWN, y el escaneo de recibos de 2026-11-22 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, sin evidencia de evaluacion estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, segun tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen 3.5, segun la etiqueta `qwen3_5` asociada al repositorio y el modelo base declarado (SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3). El modelo se obtiene por ajuste fino supervisado (SFT) sobre ese checkpoint, que a su vez parece ser un SFT de un modelo Qwen 3.5 de 0,8B. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de matematicas antiguas, ni si se aplicaron tecnicas de RLHF o DPO.

La model card no documenta innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modo thinking, etc.). El autor enfatiza un marco de trazabilidad basado en recibos: las afirmaciones de entrenamiento y evaluacion deben residir en ficheros de recibo del estate, y cualquier dato no respaldado se marca como UNKNOWN. El escaneo estricto de 2026-11-22 no encontro un DONE.json con status=MEASURED, por lo que la evidencia de evaluacion se clasifica como UNKNOWN.

## Capacidades

- Generacion de texto en ingles orientada a contenido matematico, presumiblemente con enfasis en notacion y terminologia de matematicas antiguas (el alcance exacto no esta documentado).
- Ajuste fino de dominio sobre una base de 0,8B, lo que sugiere capacidad limitada de razonamiento general comparada con modelos mayores.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no estan soportados de forma oficial.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Normalizacion de notacion matematica historica: el modelo puede recibir fragmentos de textos matematicos antiguos en ingles y reescribirlos en notacion moderna, aprovechando el ajuste de dominio sobre la base Qwen 3.5.
- Asistencia en transcripcion y anotacion de corpus: util como componente de un pipeline que procese documentos historicos y requiera un modelo ligero desplegable en local sin dependencias de API.
- Generacion de explicaciones didacticas sobre problemas matematicos clasicos: el ajuste de dominio permite producir texto en ingles sobre metodos y terminologia de matematicas antiguas.
- Prototipado rapido en entornos con GPU de consumo: con 0,87B de parametros, el modelo cabe en GPUs de 8-16 GB en cuantizaciones de 8 o 4 bits, lo que facilita experimentacion a bajo coste.
- Filtrado y clasificacion de textos matematicos: puede emplearse como modelo generativo para reformular o resumir pasajes de un corpus matematico historico antes de un procesamiento posterior.
- Evaluacion comparativa de ajustes de dominio: sirve como referencia para estudiar como un SFT de dominio sobre una base de 0,8B afecta al comportamiento en tareas especializadas frente al modelo base.
- Integracion en pipelines de investigacion reproducible: al publicarse en safetensors con licencia Apache 2.0, puede cargarse con `transformers` y versionarse junto con los recibos del estate para auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16/bf16 (tamano del repo 1,8 GB); en cuantizacion de 8 bits, en torno a 1 GB; en 4 bits, en torno a 0,6-0,8 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (RTX 30/40 series, incluso GPUs integradas con suficiente memoria compartida en cuantizacion 4 bits).
- Opciones de despliegue: `transformers` (libreria declarada), y previsiblemente vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se documentan en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SZL AncientMath 0.8B v1 | 873.438.784 | no disponible | Apache 2.0 | Hugging Face (safetensors) |
| Qwen 3.5 0.8B (base de la familia) | ~0,8B | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste sobre una base Qwen 3.5 y entrenarse presumiblemente con corpus en ingles, puede heredar sesgos de la base y del dataset de dominio.
- Riesgo de alucinacion: elevado en un modelo de 0,8B sin evaluacion publicada; la model card no aporta recibos de evaluacion de fidelidad.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada, por lo que no debe asumirse una ventana larga.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento, no documentada en esta ficha.
- Caveat para produccion: el repositorio se clasifica como RECEIPT_FILES_NO_DONE (sin evidencia de evaluacion estricta), por lo que no hay garantias medidas de calidad; no se recomienda su uso en produccion sin una evaluacion propia.
- Ausencia de documentacion sobre cuantizaciones oficiales, tool calling y modo agente; cualquier integracion en pipelines de agentes requiere validacion manual.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-AncientMath-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio del estate (GitHub): https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
