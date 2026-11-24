# yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep

## Resumen

Qwen3-8B-5layer-Dense-FFN98304-jw-4ep es un modelo borrador (*draft model*) para decodificación especulativa sobre Qwen/Qwen3-8B, publicado por el usuario yushengsu en Hugging Face. No es un modelo conversacional autónomo: su función es proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la generación sin alterar la distribución de salida. Se entrenó con SpecForge (receta DSpark) y se sirve con SGLang en modo DSPARK.

El modelo parte del borrador publicado por jiapingW (`jiapingW/Qwen3-8b-dspark-SpecForge`), de 5 capas y FFN de 12288, y aplica un único cambio: ampliar la dimensión intermedia de la FFN a 98304 (8x), lo que eleva el total a 6,41 mil millones de parámetros, todos activos. Mantiene la configuración de atención (32 cabezas de consulta, 8 de clave/valor, dimensión 128), el proyector fc 20480→4096 sobre las capas 1/9/17/25/33 del objetivo, la cabeza Markov de rango 256 y el bloque de 16 tokens, sin cabeza de confianza.

Es relevante porque explora el compromiso entre tamaño del borrador y tasa de aceptación: un borrador mucho mayor que el original de 1,13 B puede aceptar más tokens por paso a costa de un coste por paso también mayor. El resultado se distribuye en cuatro checkpoints de época más un punto intermedio (3.5ep), lo que permite evaluar la curva de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas como borrador de decodificación especulativa (DSpark/SpecForge); FFN densa con dimensión intermedia 98304 |
| Parametros totales | 6,41 mil millones (todos activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda del objetivo Qwen3-8B, no declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (checkpoints por época: `1ep/`, `2ep/`, `3ep/`, `4ep/`, `3.5ep/`) |

## Arquitectura y entrenamiento

El borrador replica la arquitectura del draft de jiapingW: 5 capas con atención de 32 cabezas de consulta y 8 de clave/valor de dimensión 128, un proyector fc de 20480→4096 que toma estados de las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y bloques de 16 tokens. La única modificación es la FFN: dimensión intermedia de 98304 en lugar de 12288, lo que multiplica por más de cinco el número de parámetros (de 1,13 B a 6,41 B). No incorpora cabeza de confianza.

El entrenamiento sigue `training/launch.yaml` de jiapingW: prompts regenerados de perfectblend con temperatura 0 y modo sin *thinking*, contexto de 8192, plantilla qwen3-instruct sin *system prompt*, pérdida DSpark con 0,1 de entropía cruzada y 0,9 de L1, 512 anclas, `loss_decay_gamma` 7, AdamW con lr 6e-4 y coseno con 4 % de *warm-up*, `max_grad_norm` 1, Liger y semilla 42. Se usaron 128 muestras por paso de optimizador (16 rangos × 2 × 4) y 11 100 pasos por época; el total son 4 épocas (44 400 pasos, coseno hasta 0). El checkpoint `3.5ep/` corresponde al paso 38 850 (el punto que sirvió jiapingW, paso 39 000 de un calendario de 6 épocas). El entrenamiento se ejecutó en cuatro nodos con 4× GB300.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B; no es un modelo de chat autónomo.
- Aceleración de inferencia del modelo objetivo mediante verificación en paralelo de bloques de 16 tokens.
- Compatibilidad con SGLang en modo DSPARK estándar, sin cambios en el código de servicio.
- No soporta *tool calling*, agentes ni razonamiento multi-paso por sí mismo: esas capacidades residen en Qwen3-8B.
- Capacidades multilingües: no declaradas; dependen del modelo objetivo.
- Sin modo *thinking* propio; el borrador se entrenó con prompts sin *thinking*.

## Casos de uso

- Servicio de Qwen3-8B con baja latencia: desplegar el borrador junto al objetivo en SGLang DSPARK para reducir el tiempo por token en cargas interactivas, siempre que la tasa de aceptación compensa el mayor coste por paso del borrador de 6,41 B.
- Evaluación de investigación sobre decodificación especulativa: comparar la curva de aceptación entre `1ep/`, `2ep/`, `3ep/`, `3.5ep/` y `4ep/` para estudiar cómo evoluciona el borrador con las épocas.
- Estudio del compromiso tamaño–aceptación: contrastar este borrador de 6,41 B con el de 1,13 B de jiapingW en el mismo objetivo y hardware para medir si el aumento de FFN mejora el *speedup* neto.
- Generación por lotes de alta concurrencia: en entornos con GPU de datacenter (GB300, H100), usar el borrador para aumentar el throughput agregado del objetivo cuando la latencia por paso no es el cuello de botella.
- Reproducción de experimentos: reentrenar o ajustar la receta con el *fork* de SpecForge y la configuración `configs/qwen3-8b-5layer-dense-98304-dspark.json` para validar resultados.
- Despliegue en pipelines de inferencia existentes: sustituir el borrador por defecto de Qwen3-8B en una pila SGLang ya operativa sin cambios de código, solo cambiando la ruta del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 6,41 B de parámetros, en FP16 serían aproximadamente 12,8 GB solo de pesos, más estados de atención y caché KV del objetivo.
- GPU recomendadas: el autor entrenó en nodos con 4× GB300; para servicio se requiere hardware de datacenter con memoria suficiente para alojar simultáneamente el borrador y Qwen3-8B.
- GPU de consumo: no confirmado; un borrador de 6,41 B en FP16 no cabe con holgura en GPUs de 16 GB junto al objetivo, y no se documentan cuantizaciones.
- Opciones de despliegue: SGLang con DSPARK (soporte declarado); vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato de borrador.
- Latencia y throughput: no disponibles; el *speedup* depende de la tasa de aceptación, que no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep | 6,41 B (denso) | 8192 (entrenamiento) | Apache 2.0 | FFN 98304, 4 épocas, checkpoints por época |
| jiapingW/Qwen3-8b-dspark-SpecForge | 1,13 B (denso) | 8192 (entrenamiento) | No disponible | Borrador original con FFN 12288; base de este modelo |
| Qwen/Qwen3-8B | 8 B (denso) | No disponible en esta ficha | Apache 2.0 | Modelo objetivo; no es un borrador |

No se dispone de datos de rendimiento comparativo (tasa de aceptación, *speedup*) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no debe usarse para generación directa ni chat; su salida solo tiene sentido verificada por Qwen3-8B.
- El tamaño de 6,41 B multiplica por más de cinco el borrador original, lo que puede anular la ganancia de velocidad si la tasa de aceptación no mejora proporcionalmente; no se publican métricas que lo confirmen.
- Sin cabeza de confianza, por lo que no hay mecanismo interno de filtrado de candidatos.
- Entrenado con prompts sin *thinking*; su comportamiento con el modo *thinking* del objetivo no está documentado.
- Idiomas soportados no declarados; el rendimiento multilingüe depende del objetivo y de la distribución de entrenamiento (perfectblend regenerado).
- Riesgo de alucinación: no aplica de forma directa, pero un borrador con baja aceptación puede degradar la latencia percibida sin mejorar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni procedencia de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 *likes*; sin validación comunitaria ni resultados reproducidos de forma independiente.
- Requiere SGLang con DSPARK; otras pilas de inferencia no están soportadas de forma declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep
- Borrador base de jiapingW: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Pull request de SpecForge con el código y la configuración: https://github.com/yushengsu-thu/SpecForge/pull/22
