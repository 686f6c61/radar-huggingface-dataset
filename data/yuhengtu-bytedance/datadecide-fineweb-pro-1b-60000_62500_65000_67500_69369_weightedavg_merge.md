# yuhengtu-bytedance/DataDecide-fineweb-pro-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 1.279.854.592 parámetros (aproximadamente 1,28 mil millones) publicado por el usuario yuhengtu-bytedance con el identificador `DataDecide-fineweb-pro-1B-60000_62500_65000_67500_69369_weightedavg_merge`. No es un modelo entrenado de cero ni un modelo ajustado con instrucciones: es el resultado de fusionar cinco checkpoints intermedios de una misma ejecución de preentrenamiento sobre el corpus denominado "fineweb-pro", correspondientes a los pasos 60.000, 62.500, 65.000, 67.500 y 69.369.

La fusión se ha realizado con mergekit mediante el método Linear (media ponderada de pesos, con normalización y pesos crecientes 1, 2, 3, 4 y 5 hacia el checkpoint final), una técnica descrita en el artículo de "model soups" (arXiv:2203.05482). El resultado se serializa en `safetensors` con `out_dtype: bfloat16`, ocupa 2,6 GB en el repositorio y declara arquitectura tipo Llama y pipeline de `text-generation`.

Su relevancia es fundamentalmente de investigación: sirve como artefacto reproducible para estudiar el promedio de pesos entre checkpoints de un mismo entrenamiento (lo que el nombre del proyecto, "DataDecide" y "merge_scaling", sugiere que se enmarca en experimentos de escalado y selección de datos). No hay licencia declarada, no hay idiomas declarados, no hay benchmarks publicados y el modelo acumula 0 descargas y 0 "likes", por lo que debe tratarse como un checkpoint experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (según etiqueta `llama` de HuggingFace); detalle de capas y cabezas no disponible |
| Parámetros totales | 1.279.854.592 (≈1,28 B), dato real de los safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas; pesos almacenados en bfloat16 (posible cuantización manual a 8 y 4 bits) |
| Idiomas soportados | No disponible (el corpus "fineweb-pro" es de tipo web y predominantemente en inglés, pero no se confirma en la información disponible) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16); el merge se generó con `dtype: float32` y `out_dtype: bfloat16` |
| Tamaño del repositorio | 2,6 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Etiquetas adicionales | mergekit, merge, text-generation-inference, endpoints_compatible, region:us, arxiv:2203.05482 |
| Fecha de creación (HuggingFace) | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura declarada es la de la familia Llama (transformer decoder-only con atención causal), aunque la model card no especifica número de capas, dimensión oculta, número de cabezas ni si emplea Grouped Query Attention. El modelo no se ha entrenado en este repositorio: los pesos proceden de una ejecución de preentrenamiento previa sobre el dataset "fineweb-pro" y de ella se han tomado cinco snapshots (pasos 60.000, 62.500, 65.000, 67.500 y 69.369). No hay información sobre el número de tokens vistos, la composición exacta del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste por instrucciones; dado que el pipeline es `text-generation` y no hay plantilla de chat documentada, lo razonable es asumir que es un modelo base preentrenado.

La innovación técnica aquí no está en la arquitectura sino en el procedimiento de fusión. Se aplica el método Linear de mergekit, que calcula una media ponderada de los tensores de cada checkpoint con pesos 1, 2, 3, 4 y 5 (los checkpoints más tardíos pesan más), con `normalize: true` para reescalar los pesos según la suma de coeficientes, y usando el checkpoint del paso 69.369 como modelo base. El resultado equivale a una media móvil ponderada hacia el final del entrenamiento, una técnica habitual para reducir el ruido de los últimos pasos y mejorar la estabilidad respecto a un único checkpoint. El proceso se ejecutó en float32 y se serializó en bfloat16.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt, en modo completación; es la única capacidad confirmada por el pipeline declarado.
- Modelo base sin ajuste por instrucciones: no se documenta plantilla de chat, formato de turnos ni modo "thinking".
- Razonamiento multi-paso, matemáticas y código: no documentados ni evaluados en la información disponible.
- Tool calling / function calling: no documentado; sin ajuste por instrucciones no cabe esperar un uso fiable de herramientas.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha.
- Capacidades especiales: ninguna declarada (ni visión, ni audio, ni decodificación especulativa, ni modo de razonamiento).
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con el stack estándar de transformers/TGI/vLLM siempre que el `config.json` sea válido como Llama.

## Casos de uso

- Investigación sobre fusión de pesos entre checkpoints: el repositorio incluye el YAML exacto del merge, lo que permite reproducir la media ponderada, variar los coeficientes y medir el efecto en la pérdida de validación o en tareas downstream.
- Estudios de escalado y selección de datos: el nombre "DataDecide" y la ruta del proyecto apuntan a experimentos que comparan mezclas de datos de preentrenamiento; este checkpoint sirve como punto de comparación frente a otros merges de la misma familia.
- Base para ajuste supervisado (SFT) o LoRA: al ser un modelo base de 1,28 B, es un punto de partida barato para experimentos de ajuste fino con instrucciones sin necesidad de clusters grandes.
- Destilación y generación de datos sintéticos a pequeña escala: un modelo de este tamaño puede usarse para producir completaciones masivas en pipelines de destilación, siempre que se valide previamente la calidad de su salida.
- Evaluación de infraestructura de serving: con 2,6 GB de pesos en bfloat16 es útil para probar configuraciones de vLLM, TGI o endpoints compatibles, medir latencia y throughput y validar plantillas de despliegue antes de pasar a modelos mayores.
- Inferencia local en hardware modesto: completación de texto, autocompletado de documentos o prototipos de generación en una GPU de consumo o incluso en CPU, dado el reducido tamaño del modelo.
- Línea base de comparación en pipelines de evaluación: sirve como referencia barata para medir si técnicas de fusión o de mezcla de datos aportan mejoras reales frente a un checkpoint único.
- Reproducción académica del método "model soups" en un caso concreto de checkpoints consecutivos de un mismo run, útil para docencia o para validar implementaciones de mergekit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye ninguna tabla de evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad sobre conjuntos de validación), y la búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con este modelo.

## Requisitos de hardware

- Pesos en bfloat16: 1,28 B × 2 bytes ≈ 2,56 GB (coincide con los 2,6 GB del repositorio).
- Pesos en float32: ≈ 5,12 GB, más activaciones y memoria de trabajo; unos 6-7 GB de VRAM.
- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5-4 GB incluyendo caché KV corta y overhead del runtime (el tamaño de la caché depende de la configuración de atención, que no se publica).
- VRAM estimada con cuantización de 8 bits: ≈ 2-2,5 GB; con 4 bits: ≈ 1,5-2 GB.
- Cabe en GPU de consumo: sí, con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090; también en tarjetas de 6-8 GB de generaciones recientes.
- GPU profesionales recomendadas para servicio: L4, A10G, L40S, A100 o H100 si se necesita alto throughput por lotes; para uso individual no son necesarias.
- CPU: inferencia viable en CPU con cuantización (varios GB de RAM), con latencias altas pero funcionales para pruebas.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (etiqueta `text-generation-inference`), vLLM, y endpoints compatibles. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se publica ninguna versión GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparación se establece con modelos base de tamaño cercano ampliamente utilizados como punto de partida para ajuste. Los datos de los modelos comparativos corresponden a su documentación pública; los de este modelo, a la información disponible en HuggingFace.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DataDecide-fineweb-pro-1B (este modelo) | 1,28 B | No disponible | No disponible | safetensors, sin GGUF, 0 descargas |
| Llama 3.2 1B | ≈1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors y GGUF, ampliamente soportado |
| Qwen2.5 1.5B | ≈1,54 B | 32.768 tokens | Apache 2.0 | safetensors y GGUF, ampliamente soportado |
| SmolLM2 1.7B | ≈1,7 B | 8.192 tokens | Apache 2.0 | safetensors y GGUF, con versiones instruct |

Diferencias clave: frente a las alternativas, este checkpoint no ofrece contexto declarado, ni licencia, ni versiones cuantizadas, ni evaluaciones públicas, y no dispone de variante ajustada por instrucciones. Su interés es exclusivamente experimental (fusión de checkpoints y estudios de datos), mientras que Llama 3.2 1B, Qwen2.5 1.5B y SmolLM2 1.7B están pensados para uso directo en aplicaciones. No hay datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en la práctica esto bloquea su adopción en producción sin aclaración del autor.
- Ausencia total de evaluaciones: no hay métricas de perplejidad, MMLU ni ninguna otra, por lo que se desconoce si el merge mejora o degrada al checkpoint del paso 69.369.
- Es un modelo base, no ajustado por instrucciones: puede producir continuaciones incoherentes ante prompts conversacionales y no respeta formatos de sistema, usuario o asistente.
- Riesgo de alucinación inherente al preentrenamiento sobre datos web: sin ajuste posterior, no hay mecanismo que penalice afirmaciones falsas.
- Idiomas no declarados: aunque el corpus de origen es de tipo web y probablemente mayoritariamente inglés, no se confirma; el rendimiento en castellano es desconocido.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin consultar el `config.json` del repositorio.
- Trazabilidad limitada del dataset: "fineweb-pro" no está descrito en la ficha en cuanto a composición, filtrado, licencias de los datos de origen ni posible contaminación de benchmarks.
- Metadatos anómalos: la fecha de creación indicada (2026-09-17) es posterior a la fecha actual de referencia, lo que sugiere un posible problema de metadatos del repositorio.
- Sin validación comunitaria: 0 descargas y 0 "likes"; no hay informes de terceros sobre su comportamiento real.
- Fusión lineal sin verificación: la media ponderada de checkpoints puede degradar capacidades si los checkpoints no están en la misma cuenca de pérdida o si los pesos no están bien normalizados.
- Rutas internas en la model card: la configuración del merge expone rutas absolutas del sistema del autor (`/opt/tiger/...`), lo que complica la reproducción literal sin adaptar las rutas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-fineweb-pro-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusión utilizada): https://github.com/cg123/mergekit
- Artículo del método Linear / model soups (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, demos o repos) asociados a este modelo; los resultados devueltos no guardan relación con el modelo ni con inteligencia artificial.
