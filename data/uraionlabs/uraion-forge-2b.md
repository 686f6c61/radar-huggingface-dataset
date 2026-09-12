# UraionLabs/uraion-forge-2b

## Resumen

Uraion Forge 2B es un modelo de lenguaje compacto de 2.516.756.480 parámetros (aproximadamente 2,5B), desarrollado por Uraion Labs y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino sobre `openbmb/MiniCPM5-2B`, un transformer de estilo Llama con Grouped-Query Attention (GQA), y está orientado explícitamente a tres escenarios: ejecución en el borde (edge), llamadas a herramientas en modo agente multi-turno y razonamiento cuantitativo de alto rendimiento. El modelo se distribuye en safetensors (BF16/FP16) y, según su model card, también en variantes MLX y GGUF en repositorios separados.

La propuesta de valor del modelo es atacar los fallos típicos de los modelos de razonamiento pequeños: agotamiento del presupuesto de tokens por bucles de pensamiento ("runaway thinking"), alucinación de parámetros en esquemas JSON y deriva de estado en conversaciones multi-turno. Para ello, el autor declara regularizaciones específicas de post-entrenamiento que hacen que el bloque `<think>...</think>` se dimensione según la complejidad de la tarea o se omita por completo cuando se requiere una respuesta directa, además de un mecanismo de desambiguación activa que detiene la ejecución y pregunta al usuario cuando falta un parámetro crítico.

Es relevante ahora porque ocupa el nicho de sub-agente determinista para despliegues con recursos limitados: 5,0 GB de repositorio, encaje declarado entre 4 GB y 11 GB de memoria unificada y más de 90 tokens/s en Apple Silicon vía MLX. No obstante, el modelo no tiene descargas ni "likes" en el momento de redactar esta ficha, y todas las cifras de rendimiento proceden exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estilo Llama (`LlamaForCausalLM`) con Grouped-Query Attention (GQA), derivado de MiniCPM5-2B |
| Parametros totales | 2.516.756.480 (aprox. 2,5B) |
| Parametros activos | No aplica: modelo denso. La model card lo describe como "2B activos" |
| Longitud de contexto | 16k nativo / 131k con RoPE (segun la model card) |
| Tipos de cuantizacion | BF16 y FP16 (safetensors); MLX 4-bit, 8-bit y 16-bit; GGUF de Q2 a F16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16/FP16), GGUF, MLX |
| Libreria | Transformers (PyTorch); compatible con TGI |
| Pipeline | text-generation |
| Tamano del repositorio | 5,0 GB |
| Modelo base | openbmb/MiniCPM5-2B |
| Fecha de publicacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `openbmb/MiniCPM5-2B`: un transformer causal de estilo Llama (`LlamaForCausalLM`) con Grouped-Query Attention, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa y facilita el uso de ventanas de contexto largas. El modelo se soporta sobre RoPE, con 16k tokens nativos y extensión declarada hasta 131k. No se trata de una arquitectura MoE ni híbrida SSM: es un modelo denso, de modo que los 2,5B de parámetros se activan en cada paso de decodificación.

Los detalles de entrenamiento publicados son escasos: no se especifica el número de tokens de post-entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencias. Lo que sí declara el autor es el tipo de regularización aplicada sobre la fase de post-entrenamiento: (1) un control del presupuesto de tokens de cadena de pensamiento, que ajusta la longitud del bloque `<think>...</think>` a la complejidad de la tarea o lo elimina cuando procede; (2) un mecanismo de desambiguación que obliga al modelo a formular una pregunta terminada en `?` en lugar de inventar parámetros ausentes en una llamada a herramienta; y (3) entrenamiento orientado a la resolución de concurrencia optimista en flujos de API (por ejemplo, secuencias del tipo `CONFLICT` → relectura → readquisición de bloqueos) y a reintentos idempotentes. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de plantilla ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`).
- Razonamiento con cadena de pensamiento (CoT) acotada mediante el bloque interno `<think>...</think>`, con presupuesto de tokens proporcional a la complejidad de la tarea.
- Modo de respuesta directa sin CoT para consultas programaticas que requieren baja latencia.
- Function calling y tool use nativo: emision de bloques JSON para invocar herramientas y API externas.
- Adherencia a esquemas JSON con multiples parametros.
- Desambiguacion activa: si falta un parametro critico, el modelo detiene la ejecucion y formula una pregunta de aclaracion terminada en `?` en lugar de alucinar el valor.
- Flujos agenticos multi-turno con resolucion de concurrencia optimista (conflictos, relectura, readquisicion de bloqueos) y reintentos idempotentes.
- Generacion de codigo, con ejemplos de referencia en la model card orientados a series temporales financieras (media movil exponencial con suavizado dinamico).
- Recuperacion de informacion en contexto largo ("needle retrieval") con una tasa declarada del 75,0%.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.
- Vision y audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada en ingles: el modelo mantiene conversaciones multi-turno con formato ChatML y delega en herramientas externas para consultar pedidos o estados, pidiendo aclaracion cuando falta un dato en lugar de inventarlo. Es adecuado por su tamano reducido, que permite desplegarlo en el mismo nodo que la logica de negocio.
- Sub-agente en pipelines de automatizacion de operaciones: dado que soporta tool calling con esquemas JSON multi-parametro y manejo de reintentos idempotentes, puede encargarse de tareas como aprovisionar un perfil de worker en un cluster, con resolucion de conflictos de concurrencia.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD como asistente de autocompletado o generacion de funciones, con modo de respuesta directa sin CoT para minimizar latencia.
- Extraccion estructurada de datos: transformacion de texto libre en JSON conforme a un esquema predefinido, apoyandose en la adherencia declarada a esquemas y en la desambiguacion activa ante campos ambiguos.
- Razonamiento cuantitativo y financiero en streaming: el modelo incluye ejemplos de referencia para calculo de metricas sobre series temporales (EMA con suavizado dinamico, VWAP de 60 minutos), lo que lo situa como candidato para asistentes de analitica de baja latencia.
- Inferencia en el borde y en dispositivos de consumo: con cuantizacion de 4 bits cabe en GPUs de gama media y en Macs con memoria unificada, lo que habilita asistentes locales sin enviar datos a la nube.
- Procesamiento por lotes de alto throughput: el modo sin CoT y su tamano permiten procesar grandes volumenes de peticiones cortas por GPU, util para clasificacion, resumen o normalizacion de texto a escala.
- Recuperacion aumentada sobre documentos largos: la ventana de 131k con RoPE, aunque con una tasa de acierto declarada del 75,0% en recuperacion de aguja, permite tareas de pregunta-respuesta sobre contratos o informes extensos con verificacion humana.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados en la model card del autor. No se han publicado resultados de benchmarks estandar (MMLU absoluto, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Uraion Forge 2B | Modelo base MiniCPM5-2B | Notas |
|---|---|---|---|
| Fiabilidad de tool calling multi-turno | 90,5% | no disponible | Cifra declarada por el autor; no se especifica el conjunto de evaluacion |
| Recuperacion de aguja en contexto largo | 75,0% | aprox. 58,3% (inferido del delta) | El autor declara +16,7 pp sobre el base; el valor del base no se publica explicitamente |
| Retencion MMLU / razonamiento multichoice | 58,8% | no disponible | Se presenta como "retencion", no como puntuacion absoluta |
| Retencion de conocimiento general | 100% (declarado) | linea base | Afirmacion del autor; no se aporta metodologia |

Advertencia: la model card afirma simultaneamente "zero degradation" y "retencion del 100% del conocimiento" junto con un 58,8% de retencion MMLU. Ambas afirmaciones no son compatibles entre si, por lo que deben tomarse con cautela hasta que exista una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, calculados a partir del numero de parametros, no publicados por el autor):
  - FP16 / BF16: en torno a 5,0-5,5 GB solo de pesos; con caché KV, prever 6-8 GB.
  - 8 bits: en torno a 2,6-3,0 GB.
  - 4 bits: en torno a 1,4-1,8 GB.
  - Q2 (GGUF): en torno a 1,2-1,5 GB.
- Memoria declarada por el autor: el modelo encaja entre 4 GB y 11 GB de memoria unificada.
- GPU recomendadas: no hay lista oficial. Por tamano, es viable en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090 y en GPUs de datacenter como A100, H100 o L40S, donde el cuello de botella sera la concurrencia, no el modelo. El autor declara compatibilidad con CUDA, ROCm y CPU.
- Cabe en GPU de consumo: si. Con cuantizacion de 4 bits entra en GPUs de 4-6 GB de VRAM; en FP16 requiere 8 GB o mas.
- Apple Silicon: soporte nativo via MLX, con ejecucion en memoria unificada. El autor cita chips M1 a M6.
- Opciones de despliegue: PyTorch/Transformers, vLLM, SGLang, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp, Ollama y LM Studio mediante GGUF, y MLX en macOS.
- Throughput y latencia declarados: mas de 90 tokens/s en Apple Silicon de la serie M via MLX (el material del autor menciona 90-120+ tok/s) y mas de 90 tokens/s en GPUs NVIDIA RTX modernas con PyTorch. No se especifica el tamano de lote ni la longitud de contexto usados en esas mediciones.
- Coste de la cache KV a 131k tokens: no disponible. Crece linealmente con el contexto, por lo que el uso de la ventana completa exige planificacion de memoria adicional.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la informacion proporcionada para esta ficha; se incluyen a modo de contexto a partir de su documentacion publica y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uraion Forge 2B | 2,52B | 16k nativo / 131k RoPE | Apache 2.0 | HuggingFace (safetensors, GGUF, MLX) |
| openbmb/MiniCPM5-2B | no disponible | no disponible | no disponible | Modelo base del anterior |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (extensible) | Apache 2.0 (segun su documentacion) | HuggingFace, GGUF, multiples runtimes |
| Llama-3.2-3B-Instruct | 3,21B | 128k tokens (segun su documentacion) | Llama 3.2 Community License | HuggingFace, GGUF, multiples runtimes |

Diferencias cualitativas: Uraion Forge 2B es el mas pequeno de los tres y el unico de la comparativa con contexto de 131k declarado y licencia Apache 2.0 sin restricciones adicionales. Frente a Llama-3.2-3B-Instruct, su ventana nominal es comparable, pero no hay datos publicos de rendimiento que permitan situarlo por encima o por debajo. Frente a Qwen2.5-3B-Instruct, ofrece menor tamano pero tambien menor soporte multilingue declarado (solo ingles). No hay una comparativa de benchmarks independiente disponible.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado exclusivamente para ingles (`en`). No hay soporte multilingue declarado ni evaluado, por lo que no es adecuado para produccion en castellano u otros idiomas sin evaluacion previa.
- Validacion externa nula: 0 descargas y 0 likes en el momento de redactar la ficha. No existen evaluaciones independientes, y todas las cifras de rendimiento provienen del propio autor.
- Contradiccion en las declaraciones de rendimiento: se afirma "zero degradation" y "100% de retencion de conocimiento" a la vez que se reporta un 58,8% de retencion MMLU. Tratar ambas afirmaciones como marketing hasta disponer de mediciones propias.
- Riesgo de alucinacion: la model card afirma que el mecanismo de desambiguacion reduce la invencion de parametros en llamadas a herramientas, pero no se cuantifica la tasa de alucinacion residual ni se especifica el conjunto de evaluacion del 90,5% de fiabilidad.
- Capacidad factual limitada: con 2,5B de parametros densos, el conocimiento enciclopedico es necesariamente inferior al de modelos de 7B o mas. Para tareas de conocimiento factual conviene combinarlo con recuperacion externa.
- Contexto largo con rendimiento parcial: la recuperacion de aguja en contexto largo es del 75,0%, es decir, una de cada cuatro agujas no se recupera. No es una ventana de 131k "efectiva" al 100%.
- Deriva multi-turno: el autor declara haberla corregido, pero no aporta evaluaciones de conversaciones de muchos turnos ni de degradacion acumulada.
- Especificaciones de cuantizacion incompletas: no se detalla que nivel de cuantizacion degrada el rendimiento ni en que medida.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserve el aviso de licencia. No se han identificado clausulas de uso aceptable especificas.
- Reproducibilidad: no se publican detalles del dataset de post-entrenamiento ni de la metodologia, lo que dificulta auditar sesgos o comportamientos no deseados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/uraion-forge-2b
- Sitio del desarrollador: https://uraionlabs.com
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante MLX (referenciada en la model card, no verificada): https://huggingface.co/uraionlabs/uraion-forge-2b-mlx
- Variante GGUF (referenciada en la model card, no verificada): https://huggingface.co/uraionlabs/uraion-forge-2b-gguf
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper, blog tecnico o repositorio de codigo: no disponible
- Demos o espacios asociados: no disponible

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los unicos resultados obtenidos correspondian a foros de Amazon Seller Central y no guardan relacion con la ficha.
