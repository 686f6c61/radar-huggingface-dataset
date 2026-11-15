# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep3

## Resumen

Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta derivados del dataset MuSiQue, un conjunto de preguntas multi-salto que requiere razonamiento sobre multiples documentos. La propuesta es que el modelo aprenda a recuperar y razonar sobre informacion dispersa en un contexto, algo relevante para pipelines RAG y agentes con memoria.

El checkpoint publicado corresponde a la epoca 3 de 3 de un entrenamiento supervisado (SFT) con 2.681.852 ejemplos generados mediante una metodologia de clustering denominada `knn_k2_and_hdb_and_entity` (kNN con k=2, deduplicacion por documento, HDBSCAN con tamano minimo de cluster 2 y agrupacion por entidades con frecuencia documental maxima 3). No se trata de un modelo nuevo desde cero, sino de una especializacion del instruct base de 1.5B parametros.

Su relevancia es acotada: es un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin datos de benchmarks publicados ni idiomas declarados. Resulta interesante como ejemplo de tecnica de sintesis de datos para memoria y multi-hop reasoning, pero no debe considerarse un modelo listo para produccion sin evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento (contexto nativo del base Qwen2.5: 32.768 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors bf16 es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible (la model card no declara idiomas; el base Qwen2.5 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, RoPE y normalización RMSNorm, con 1,54 mil millones de parámetros. El ajuste se realizó mediante full fine-tuning con FSDP, actualizando el 100 % de los parámetros (1.543.714.304 entrenables). Se usó precisión bf16 con gradient checkpointing, pérdida calculada únicamente sobre los tokens del asistente, batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup del 5 %, weight decay 0.01 y max grad norm 1.0.

El entrenamiento se ejecutó sobre 8 aceleradores AMD Instinct MI325X durante 2,79 horas de reloj (22,3 GPU-horas) para las 3 épocas. La longitud máxima de secuencia fue de 8.096 tokens. El dataset de entrenamiento es sintético: 2.681.852 ejemplos construidos a partir de un subconjunto de 1.000 preguntas de MuSiQue, con una época de muestreo y una metodología de agrupación (`knn_k2_and_hdb_and_entity`) que combina vecinos más cercanos (k=2), deduplicación por documento, clustering HDBSCAN con tamaño mínimo 2 y agrupación por entidades con df máximo 3. La innovación técnica principal es, por tanto, la estrategia de síntesis y agrupación de datos para tareas de memoria multi-documento, no cambios en la arquitectura.

## Capacidades

- Generación de texto conversacional, heredada del instruct base Qwen2.5-1.5B-Instruct.
- Razonamiento multi-salto y recuperación de información sobre contextos con múltiples documentos, objetivo explícito del ajuste como "memory model".
- Respuesta a preguntas sintéticas derivadas de MuSiQue, con énfasis en combinar entidades y documentos cruzados.
- Soporte de plantilla de chat de Qwen (chat template), lo que permite uso conversacional multi-turno.
- Tool calling / function calling: no confirmado para este checkpoint; el base Qwen2.5-Instruct lo soporta, pero el ajuste fino puede haber alterado este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas en la model card.
- Capacidades multilingües: no declaradas; el base es multilingüe, pero el ajuste se hizo sobre datos en inglés (MuSiQue).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en memoria de agentes: usar el modelo como componente de memoria que, dado un contexto largo con varios documentos, recupere y combine la información relevante para responder preguntas multi-salto. Es adecuado por su entrenamiento específico sobre pares de MuSiQue.
- Experimentos de RAG multi-documento: integrarlo como generador en un pipeline de recuperación aumentada donde se concatenan varios fragmentos y se requiere sintetizar la respuesta a partir de entidades cruzadas.
- Prototipado de asistentes conversacionales ligeros: al ser un modelo de 1,5 B en bf16 (unos 3,1 GB de pesos), cabe en GPUs de consumo y permite iterar rápidamente en local con la plantilla de chat de Qwen.
- Evaluación de técnicas de síntesis de datos: sirve como caso de estudio reproducible de la metodología `knn_k2_and_hdb_and_entity` para comparar con otros esquemas de generación de datos sintéticos.
- Generación de preguntas y respuestas sobre corpus documentales: útil para crear datasets de evaluación de razonamiento multi-salto a partir de documentos propios, previa validación de calidad.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors estándar, puede servir como punto de partida para fine-tuning adicional en dominios específicos con memoria documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,1 GB solo para pesos; con overhead de activaciones y KV cache, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); A100, H100 o MI325X para entrenamiento o serving de alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y GPUs Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (el repo está marcado como endpoints_compatible), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep3 | 1,54 B | 8.096 en entrenamiento | Apache 2.0 | Ajuste específico para memoria multi-documento; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Modelo base; benchmarks públicos y soporte de tool calling |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Alternativa de mayor tamaño con mejor rendimiento general |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Contexto mucho mayor, licencia con restricciones de uso |

La comparación directa con el base Qwen2.5-1.5B-Instruct es la más relevante: este checkpoint especializa el comportamiento en memoria multi-salto a costa de posibles regresiones en capacidades generales y con un contexto de entrenamiento menor (8.096 frente a 32.768 tokens).

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes; no hay evidencia de validación independiente ni benchmarks publicados.
- Entrenado exclusivamente sobre datos sintéticos derivados de MuSiQue; riesgo alto de sobreajuste a ese formato y de degradación en tareas generales.
- Idiomas no declarados y datos de entrenamiento en inglés; el rendimiento en castellano es incierto y probablemente inferior al base.
- Riesgo de alucinación: al ser un modelo pequeño especializado en QA sintético, puede generar respuestas plausibles pero incorrectas en contextos reales.
- Contexto de entrenamiento de 8.096 tokens, inferior al nativo del base; no se garantiza buen comportamiento en ventanas más largas.
- Tool calling y capacidades de agente no confirmadas tras el ajuste fino.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene auditar el modelo antes de producción.
- Fecha de creación del repositorio (2026-11-15) posterior a la fecha habitual de publicación de Qwen2.5, lo que sugiere un experimento reciente sin madurez comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del dominio de entrenamiento): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
