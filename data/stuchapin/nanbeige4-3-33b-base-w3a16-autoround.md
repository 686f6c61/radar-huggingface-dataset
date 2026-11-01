# stuchapin/Nanbeige4.3-33B-Base-W3A16-AutoRound

## Resumen

Nanbeige 4.3 33B Base es un modelo fundacional denso de 33 mil millones de parametros desarrollado por Nanbeige, publicado el 24 de octubre de 2026. Este repositorio, mantenido por el usuario stuchapin, no es el modelo original sino una cuantizacion extrema a 3 bits (W3A16) realizada con Intel AutoRound v0.15.1 en formato GPTQ, que comprime los pesos hasta aproximadamente 14,5 GiB. El objetivo es permitir la ejecucion de un modelo de 33B en GPUs de consumo de 16 GB (RTX 4080, T4, V100) o liberar memoria para contextos largos de 32k+ tokens en GPUs de 24 GB.

La relevancia de esta variante radica en el compromiso entre compresion y calidad: segun la model card, retiene un 93,0 % de la fidelidad del modelo BF16 original (WikiText-2 PPL de 5,336 frente a ~3,85 del baseline). La cuantizacion se calibro con 256 turnos reales de produccion multi-turno, lo que segun el autor protege las cabezas de atencion criticas frente a la degradacion. Es una opcion interesante para despliegues locales con hardware limitado, aunque para uso general el propio autor recomienda la variante W4A16 como punto equilibrado.

Nota importante: los metadatos de safetensors de Hugging Face reportan 5.536.652.800 parametros, cifra que no coincide con los 33B declarados en la model card (probablemente un artefacto del empaquetado INT3 de los pesos). La cifra fiable segun la documentacion del autor es 33B densos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, GQA) |
| Parametros totales | 33.000 millones (según model card); 5.536.652.800 según metadatos safetensors (discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (nativo) |
| Tipos de cuantizacion | W3A16, INT3 simetrico, group size 128 (AutoRound/GPTQ); familia completa: W3A16, W4A16, W8A16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | nanbeige-license (other, licencia personalizada de Nanbeige) |
| Formato de pesos | safetensors (GPTQ empaquetado, auto_round:auto_gptq) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura LlamaForCausalLM con 52 capas, dimension oculta de 7.168, tamano intermedio de 22.016 y un esquema de atencion agrupada (GQA) con 56 cabezas de consulta y 8 cabezas clave-valor, lo que reduce significativamente el tamano de la KV cache. El tokenizador es SentencePiece con un vocabulario de 166.912 entradas. El contexto nativo es de 128.000 tokens.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no se ha publicado informacion en la documentacion disponible. Respecto a la cuantizacion, se uso Intel AutoRound v0.15.1 con pesos INT3 simetricos, group size 128, optimizacion SignRound con 100 iteraciones por bloque, y calibracion sobre 256 turnos reales de produccion multi-turno (system prompts, extracciones web, esquemas JSON estructurados, seqlen 2048). Las capas `lm_head` y los embeddings quedaron sin cuantizar (la model card se corta en ese punto).

## Capacidades

- Generacion de texto base (modelo preentrenado sin ajuste de instrucciones; es la variante Base, no una versión chat/instruct).
- Razonamiento y agentes: los tags del repositorio indican orientacion a razonamiento y agentes, aunque al ser un modelo base requiere prompting adecuado.
- Contexto nativo de 128k tokens, util para documentos largos y conversaciones extensas.
- Bilingue: ingles y chino.
- Compatible con vLLM para inferencia servida de alto rendimiento.
- No hay evidencia de capacidades multimodales (vision, audio) en la informacion disponible.

## Casos de uso

- Ejecucion local de un 33B en GPUs de 16 GB: la compresion a ~14,5 GiB hace posible correr el modelo completo en una RTX 4080 o una T4, util para prototipado y entornos sin acceso a datacenter.
- RAG con contextos profundos en una sola GPU de 24 GB: al dejar libres mas de 9,5 GB para KV cache en una RTX 3090/4090, permite servir contextos de 32.768+ tokens para consultas sobre documentos extensos.
- Servicios de alto batch en 24 GB: la memoria liberada admite concurrencia de 8 o mas peticiones simultaneas sin OOM, adecuado para despliegues de tamano moderado.
- Procesamiento de texto bilingue chino-ingles: clasificacion, extraccion y resumen de contenido en ambos idiomas.
- Experimentacion con cuantizacion agresiva: base util para investigar el impacto de W3A16 frente a W4A16/W8A16 en calidad y latencia.
- Fine-tuning posterior con LoRA/QLoRA sobre una base cuantizada, aprovechando el bajo footprint de pesos para ajustar el modelo en hardware de consumo.
- Generacion de codigo y esquemas JSON estructurados: los datos de calibracion incluyeron esquemas JSON, lo que sugiere preservacion razonable de esa capacidad.

## Benchmarks y rendimiento

Datos publicados en la model card (WikiText-2 PPL sobre 100.000 tokens del split de test, ventana deslizante seqlen 2048, stride 512, hardware Ampere):

| Variante | Formato | VRAM de pesos | WikiText-2 PPL | Retencion vs BF16 |
|---|---|---|---|---|
| Full BF16 (baseline) | BF16 | 65,0 GiB | ~3,85 | 100,0 % |
| W8A16 | AutoRound GPTQ (sim) | 33,5 GiB | < 3,86 | > 99,5 % |
| W4A16 (recomendada) | AutoRound GPTQ/Marlin | 19,3 GiB | 3,943 | 98,8 % |
| W3A16 (este repo) | AutoRound GPTQ (sim) | 14,5 GiB | 5,336 | 93,0 % |

Para benchmarks estandar de capacidades (MMLU, HumanEval, GSM8K, etc.) no se han publicado resultados en la informacion disponible. La variante W4A16 de la familia reporta 39,6 tok/s como punto optimo en RTX 3090/4090; para W3A16 no se publica throughput concreto.

## Requisitos de hardware

- VRAM para inferencia: ~14,5 GiB solo en pesos; con overhead de KV cache y activaciones, se recomienda una GPU de 16 GB como minimo.
- GPUs compatibles de 16 GB: RTX 4080, RTX 5080, T4, V100 (segun la model card).
- GPUs de 24 GB (RTX 3090/4090): permiten contextos de 32.768+ tokens o batch alto (N >= 8) gracias a los 9,5+ GB libres para KV cache.
- No requiere multiples GPUs, a diferencia de las variantes W8A16 (dual 24 GB con TP=2) o BF16 (cuatro RTX 3090 o A100).
- Despliegue: compatible con vLLM (indicado explicitamente en tags y badges). Al ser formato AutoRound/GPTQ con safetensors, es previsible soporte en las herramientas del ecosistema AutoRound/AutoGPTQ; no se menciona soporte verificado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible para esta variante concreta; la familia reporta 39,6 tok/s para W4A16 en RTX 3090/4090.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizacion del mismo modelo base:

| Variante | VRAM pesos | PPL WikiText-2 | Hardware objetivo | Contexto max (24 GB) |
|---|---|---|---|---|
| W3A16 (este repo) | 14,5 GiB | 5,336 | 16 GB o 24 GB long-context | 32k+ tokens |
| W4A16 | 19,3 GiB | 3,943 | 1x 24 GB | 8k tokens |
| W8A16 | 33,5 GiB | < 3,86 | 2x 24 GB (TP=2) / 48-80 GB | 128k nativo |

Frente a otros modelos densos de ~30B cuantizados a 3-4 bits (por ejemplo Qwen o Llama de tamano comparable en GGUF Q3), no hay datos de comparacion directa publicados en la informacion disponible.

## Limitaciones y advertencias

- Perdida de calidad notable: el salto de PPL de ~3,85 a 5,336 (retencion del 93,0 %) es significativo; para tareas sensibles a precision (matematicas, codigo complejo) la propia model card recomienda W4A16 o W8A16.
- Es un modelo Base, sin ajuste por instrucciones: no esta alineado para chat y puede generar salidas no deseadas sin un prompting adecuado.
- La discrepancia entre los 5,5B reportados por safetensors y los 33B de la model card introduce incertidumbre sobre los metadatos del repositorio; verificar antes de uso en produccion.
- Licencia personalizada (nanbeige-license): revisar los terminos en el enlace de licencia antes de cualquier uso comercial, ya que no es una licencia estandar permisiva.
- Idiomas limitados a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion tipico de modelos base de gran tamano, agravado potencialmente por la cuantizacion a 3 bits.
- Repositorio de terceros (stuchapin) que cuantiza un modelo de Nanbeige: la cuantizacion no es oficial del autor del modelo base, y las metricas de retencion provienen del propio autor del fork.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W3A16-AutoRound
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Licencia nanbeige-license: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base/blob/main/LICENSE
- Variante W4A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W4A16-AutoRound
- Variante W8A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound
- Dataset de evaluacion (WikiText-2): https://huggingface.co/datasets/Salesforce/wikitext-2-raw-v1
- Motor de inferencia vLLM: https://github.com/vllm-project/vllm
- Paper, blog oficial y demo: no disponible
