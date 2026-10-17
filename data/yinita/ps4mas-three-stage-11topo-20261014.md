# yinita/ps4mas-three-stage-11topo-20261014

## Resumen

`yinita/ps4mas-three-stage-11topo-20261014` es un adaptador LoRA de rango 16 entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen3.5-4B` (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). No es un modelo completo, sino un artefacto de investigación PEFT que contiene tres variantes de entrenamiento: `grpo_abc`, `grpo_c` y `grpo_curriculum_abc`. El objetivo declarado es comparar tres estrategias de entrenamiento con refuerzo sobre un conjunto de tareas denominado PS4MAS, evaluado en 11 topologías distintas.

El repositorio tiene 5,9 GB porque incluye, además de los adaptadores, los estados de entrenamiento (cada 25 grupos de GRPO y el checkpoint final), recibos de ejecución y paquetes de resultados de evaluaciones periódicas de desarrollo (`summary.json` y `results.tar.gz`). La evaluación de desarrollo se realizó sobre 1056 celdas (combinación de los conjuntos PENGUIN y CASTLE por 11 topologías) usando el juez JEV-1.13.0, y el autor indica explícitamente que esa evaluación periódica es solo de monitorización: el punto de comparación es el checkpoint final fijo.

Su relevancia es acotada y de carácter experimental: sirve para reproducir y auditar un pipeline de RL con GRPO sobre un modelo de ~4B, no como modelo listo para producción. La model card es mínima, no publica resultados numéricos de benchmarks, no declara licencia ni idiomas, y no hay pipeline definido en HuggingFace. Cualquier uso comercial o en producción requiere verificar primero la licencia del modelo base y validar el adaptador con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el transformer `Qwen/Qwen3.5-4B`) |
| Parametros totales | no disponible para el adaptador; el modelo base es de ~4B parametros (rango 4B segun nomenclatura) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; la cuantizacion depende del modelo base tras la fusion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, rank 16) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Variantes incluidas | grpo_abc, grpo_c, grpo_curriculum_abc |
| Metodo de entrenamiento | GRPO con LoRA de rango 16 |
| Tamano del repositorio | 5,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 16 aplicados sobre `Qwen/Qwen3.5-4B`. La innovación declarada no está en la arquitectura del modelo base (no se documenta en la model card), sino en el procedimiento de entrenamiento: tres configuraciones comparables de GRPO, etiquetadas `grpo_abc`, `grpo_c` y `grpo_curriculum_abc`, donde la última sugiere una programación curricular de las tareas o recompensas. No se especifican hiperparámetros, tamaño del dataset, número de tokens, composición de los datos, funciones de recompensa ni si hubo etapas previas de SFT o DPO.

El repositorio guarda trazabilidad del entrenamiento: un subdirectorio `checkpoint-XXXXXX/` por cada checkpoint (cada 25 grupos de GRPO más el final) con adaptador, recibo y estado de entrenamiento, y un subdirectorio `periodic_dev/step-XXXXXX/` con evaluaciones de desarrollo periódicas. El sistema de evaluación reportado cubre 1056 celdas (PENGUIN + CASTLE × 11 topologías) con el juez automático JEV-1.13.0. Los seguimientos del entrenamiento están en el proyecto de Weights & Biases `yinita/ps4mas-0922-training`. No se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.) porque el adaptador no modifica el mecanismo de atención más allá del ajuste de bajo rango.

## Capacidades

- Ajuste de comportamiento del modelo base `Qwen3.5-4B` en las tareas del dominio PS4MAS mediante GRPO; las capacidades fuera de ese dominio son las del modelo base, no las del adaptador.
- Generación de texto y razonamiento multi-paso: heredadas del modelo base, sin datos específicos publicados.
- Código y matemáticas: no hay evidencia publicada en la model card sobre mejoras en estas áreas.
- Tool calling / function calling: no disponible; no se documenta soporte específico en el adaptador.
- Uso en agentes: el nombre del proyecto y la evaluación por "topologías" sugieren escenarios multi-agente o de interacción estructurada, pero no se detalla el protocolo ni las capacidades resultantes.
- Multilingüismo: no disponible; no se declaran idiomas y el adaptador se entrenó presumiblemente en el idioma de los datos PS4MAS, no especificado.
- Capacidades especiales (modo thinking, visión, audio): no disponible para el adaptador; no se declaran.
- Reemplazabilidad y comparación: al incluir tres variantes con el mismo base y la misma evaluación, permite comparar el efecto de cada estrategia de entrenamiento manteniendo constante el resto.

## Casos de uso

- Reproducción de experimentos de RL: cargar los tres adaptadores con `peft` sobre la misma revision del modelo base y reejecutar la evaluación de 1056 celdas con el juez JEV-1.13.0 para verificar las diferencias entre `grpo_abc`, `grpo_c` y `grpo_curriculum_abc`.
- Investigación en entrenamiento curricular con GRPO: usar `grpo_curriculum_abc` como punto de partida para estudiar cómo la ordenación de tareas afecta a la convergencia, comparando checkpoints intermedios cada 25 grupos.
- Auditoría de pipelines de RL: los recibos y estados de entrenamiento incluidos permiten reconstruir la curva de entrenamiento y contrastarla con los registros de W&B del proyecto `yinita/ps4mas-0922-training`.
- Base para ajuste posterior en dominios concretos: al ser un adaptador LoRA de rango 16 sobre un modelo de ~4B, se puede continuar el ajuste con requisitos de VRAM moderados (ver sección de hardware) en lugar de reentrenar el modelo completo.
- Evaluación de jueces automáticos: el uso de JEV-1.13.0 como juez sobre 1056 celdas sirve como caso práctico para estudiar sesgos y estabilidad de evaluadores LLM en configuraciones multi-topología.
- Docencia y experimentación con PEFT: el formato (adaptador + estado de entrenamiento + resultados) es útil como ejemplo didáctico de estructura de repositorio para experimentos de RL con LoRA.
- Despliegue experimental en nicho: si el dominio PS4MAS coincide con el caso de uso real, se puede fusionar el adaptador con el base y servirlo con vLLM o TGI; requiere validación previa propia, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (1056 celdas = PENGUIN + CASTLE × 11 topologías, juez JEV-1.13.0, checkpoint final fijo como punto de comparación, evaluación periódica solo de monitorización), pero no incluye los valores numéricos ni los `summary.json` con las puntuaciones en el texto disponible. Por tanto, no se presentan tablas con MMLU, HumanEval, GSM8K ni métricas del dominio PS4MAS: no hay datos verificables.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa del orden de decenas de MB por checkpoint; el repositorio de 5,9 GB incluye múltiples checkpoints, estados de entrenamiento y paquetes de resultados, no un único artefacto desplegable.
- Para inferencia hay que cargar el modelo base `Qwen3.5-4B` más el adaptador. Estimación a partir del tamaño del base (cifras orientativas, no publicadas por el autor): ~8-9 GB de VRAM en fp16, ~4-5 GB en int8 y ~2,5-3 GB en cuantización de 4 bits, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con 16 GB o más (RTX 4080/4090, L4, A10) para fp16 con contexto moderado; A100/H100 solo necesarias si se busca alto throughput o contextos muy largos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantización o fp16 segun contexto; no verificado por el autor.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), fusión del adaptador con el base y servicio con vLLM o TGI, y conversión a GGUF para llama.cpp/Ollama tras la fusión (los adaptadores PEFT no se sirven directamente en llama.cpp sin conversión).
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yinita/ps4mas-three-stage-11topo-20261014 | adaptador LoRA sobre base ~4B | no disponible | no disponible | HuggingFace, 0 descargas | Adaptador de investigacion, requiere el base Qwen3.5-4B |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | no disponible | HuggingFace | Referencia directa: el adaptador modifica su comportamiento |
| Qwen2.5-3B / 7B instruct (generacion anterior) | 3B / 7B | hasta 32K en la serie Qwen2.5 (verificar) | Apache 2.0 en la mayoria de variantes (verificar) | HuggingFace | Alternativa completa y desplegable sin adaptadores |
| Llama 3.2 3B Instruct | 3B | 128K (verificar) | Llama Community License | HuggingFace | Alternativa de tamano similar con licencia conocida |
| Gemma 3 4B | ~4B | 128K (verificar) | Gemma Terms of Use | HuggingFace | Alternativa de tamano similar orientada a uso general |

Los datos de los modelos alternativos provienen de conocimiento general y deben verificarse en sus model cards antes de tomar decisiones; no se dispone de comparaciones de rendimiento con este adaptador porque no hay métricas publicadas.

## Limitaciones y advertencias

- No es un modelo completo: sin el base `Qwen/Qwen3.5-4B` en la revision exacta indicada, el adaptador no es utilizable.
- Ausencia total de métricas publicadas: no hay resultados de benchmarks ni de la evaluación de 1056 celdas en el texto de la model card, por lo que no se puede afirmar ninguna mejora respecto al base.
- Licencia no declarada: el uso comercial es incierto y depende tanto de la licencia del adaptador (desconocida) como de la del modelo base Qwen3.5-4B, que debe consultarse por separado.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano ni en ningún otro idioma distinto del usado en los datos PS4MAS, que no se especifica.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por el entrenamiento con RL; sin evaluación no se puede acotar.
- Sesgos: no documentados. Los datos PENGUIN y CASTLE y el juez JEV-1.13.0 no están descritos, de modo que los sesgos del juez pueden haberse transferido al adaptador.
- Nombres y siglas sin documentar (`ps4mas`, `jev`, `PENGUIN`, `CASTLE`, "11 topologías"): dificulta la reproducibilidad sin acceso al código del pipeline, que no se enlaza.
- Fechas del repositorio en 2026 y versionado atípico: conviene tratar el artefacto como experimental y no estable.
- Repositorio pesado (5,9 GB) con multiples checkpoints y estados de entrenamiento: no apto para descarga ligera ni para servir directamente.
- La evaluación periódica es solo de monitorización segun el autor; usar sus resultados parciales como métrica final seria un error metodológico.
- No se han encontrado en la busqueda web enlaces tecnicos relevantes (papers, blogs o demos) asociados a este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinita/ps4mas-three-stage-11topo-20261014
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del modelo base citada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Seguimiento del entrenamiento (Weights & Biases): proyecto `yinita/ps4mas-0922-training`
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
