# yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1

## Resumen

Qwen3-8B-5layer-MoE-8E2A-v1 es un modelo borrador (*draft model*) para decodificación especulativa, desarrollado por el usuario yushengsu a partir de Qwen/Qwen3-8B. No es un modelo de propósito general, sino un componente auxiliar diseñado para acelerar la inferencia de Qwen3-8B mediante *speculative decoding*: un modelo pequeño y rápido propone tokens que el modelo objetivo verifica en paralelo. El autor lo etiqueta como parte del ecosistema SpecForge y DSpark.

La arquitectura es un transformer de 5 capas con mezcla de expertos (MoE): 8 expertos SwiGLU enrutados de ancho completo 12288, con 2 expertos activos por token (configuración 8E2A). Según la model card, esto resulta en aproximadamente 6,4 mil millones de parámetros totales y unos 1,8 mil millones activos. El enrutador incorpora un mecanismo de sesgo de selección (*selection-bias router*) actualizado durante el entrenamiento.

Es relevante porque ejemplifica una línea de trabajo emergente: usar arquitecturas MoE dispersas como borradores de decodificación especulativa para reducir la latencia de modelos grandes sin degradar la calidad de salida. No obstante, en el momento de redactar esta ficha el entrenamiento figura como "no iniciado" (en cola), por lo que el repositorio contiene la configuración y la receta, no necesariamente pesos finales validados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 5 capas, 8 expertos SwiGLU enrutados, top-2 activos |
| Parametros totales | ~6,4 B (según model card) |
| Parametros activos | ~1,8 B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados de Qwen3-8B, no confirmados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: sglang) |

## Arquitectura y entrenamiento

El modelo es un transformer de 5 capas con capas de mezcla de expertos. Cada capa MoE contiene 8 expertos SwiGLU enrutados con ancho completo de 12288 y top-2 enrutamiento (2 expertos activos por token), lo que da la configuración denominada 8E2A. El enrutador emplea un sesgo de selección (*selection-bias router*) con actualización de 0,001, y se aplica una pérdida auxiliar por lote (*batch-wise aux*) de 0,005. La configuración de referencia es `configs/qwen3-8b-moe2x12288-2A1-dspark.json` y la receta se describe como: 5 épocas con schedule coseno desde 6e-4, warmup del 4 %, batch global de 132, semilla 42 y `fsdp_sharding: SHARD_GRAD_OP`.

El entrenamiento se realiza en el marco SpecForge, en la rama `exp/qwen3-8b-5layer-moe8x12288-8E2A-dspark`. Según la model card, el proceso aún no ha comenzado: está en cola tras la evaluación del borrador de 2 capas top-2 (fecha indicada 2026-11-06). Se prevé publicar checkpoints por época como `1ep/` ... `5ep/` con exportación a Hugging Face y verificación de correspondencia entre servicio y entrenamiento (*served-vs-trained*). No se detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO; al ser un borrador de decodificación especulativa, lo habitual es entrenar por destilación desde el modelo objetivo, pero este dato no se confirma en la información disponible.

## Capacidades

- Generación de tokens como borrador para decodificación especulativa sobre Qwen3-8B.
- Propuesta rápida de secuencias candidatas que el modelo objetivo verifica.
- Integración con el stack SpecForge y DSpark para *speculative decoding*.
- Compatibilidad declarada con SGLang como librería de servicio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles de forma explícita (dependen del modelo base Qwen3-8B).
- No está pensado para uso directo como modelo de chat o generación autónoma.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone tokens que el modelo objetivo verifica, reduciendo el número de pasos de decodificación y, potencialmente, la latencia en despliegues con SGLang.
- Servicio de chat de baja latencia: al reducir el coste por token generado, permite sostener conversaciones multi-turno con menor tiempo de respuesta, siempre que se valide la tasa de aceptación del borrador.
- Despliegue en entornos con recursos limitados: al tener ~1,8 B parámetros activos, el borrador es más ligero que el modelo objetivo y puede ejecutarse junto a él en la misma GPU o en una GPU auxiliar.
- Investigación en decodificación especulativa: sirve como banco de pruebas para comparar arquitecturas de borrador (2 capas frente a 5 capas, top-1 frente a top-2) y su impacto en la tasa de aceptación.
- Evaluación de enrutadores MoE con sesgo de selección: el modelo permite estudiar cómo el *selection-bias router* afecta al equilibrio de carga entre expertos y a la calidad del borrador.
- Integración en pipelines de CI/CD para pruebas de regresión de latencia: se puede medir el *speedup* frente a la decodificación autoregresiva estándar en cada versión del modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el entrenamiento está en cola y que los checkpoints por época se publicarán más adelante; no se aportan métricas de tasa de aceptación, *speedup* ni evaluaciones de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~6,4 B parámetros totales en precisión de 16 bits, el peso rondaría los 12,8 GB; en cuantización de 8 bits, unos 6,4 GB; en 4 bits, unos 3,2 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs de 16-24 GB (RTX 4090, A10G, L4) en cuantización, y en A100/H100 sin problema en precisión completa.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) en 16 bits, y en GPUs de 8-12 GB con cuantización, aunque no está verificado.
- Opciones de despliegue: SGLang es la librería declarada; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado y requeriría conversión de formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E2A-v1 | ~6,4 B totales / ~1,8 B activos | no disponible | Apache 2.0 | Repositorio HF (entrenamiento en cola) | Borrador MoE para decodificación especulativa |
| Qwen/Qwen3-8B | 8 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo objetivo que este borrador acelera |
| Borrador de 2 capas top-2 del mismo autor | no disponible | no disponible | Apache 2.0 | Referenciado en la model card | Variante previa evaluada antes de esta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El entrenamiento figura como no iniciado en la model card; los pesos publicados pueden no corresponder a un modelo validado.
- No es un modelo de propósito general: usarlo directamente para generación de texto produciría salidas de baja calidad, ya que está diseñado como borrador.
- No se documentan sesgos conocidos; al derivar de Qwen3-8B, podría heredar sesgos del modelo base, pero no está confirmado.
- Riesgo de alucinación: no aplica de forma directa, ya que el modelo objetivo verifica las propuestas; aun así, una baja tasa de aceptación degradaría el *speedup*.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación y de benchmarks desaconseja su uso en producción sin evaluación propia.
- El repositorio ocupa 64,1 GB, lo que sugiere la presencia de múltiples checkpoints o pesos en precisión completa; conviene revisar qué artefactos concretos se descargan.
- La fecha de creación indicada (2026-11-06) es posterior a la fecha habitual de referencia; verificar la vigencia de los artefactos antes de integrarlos.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1
- Rama de configuración y receta en SpecForge: https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-5layer-moe8x12288-8E2A-dspark
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
