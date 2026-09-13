# yuhengtu-bytedance/sfm_filtered_insert_xxf_character-6k_7k_8k_9k_10k_simpleavg_merge

## Resumen

El modelo `sfm_filtered_insert_xxf_character-6k_7k_8k_9k_10k_simpleavg_merge` es un artefacto de fusión de pesos publicado en HuggingFace por el usuario yuhengtu-bytedance. No procede de un entrenamiento desde cero: es el resultado de promediar cinco checkpoints intermedios (pasos 6000, 7000, 8000, 9000 y 10000) de una misma ejecución de entrenamiento denominada internamente `filtered_insert_xxf_character`, combinados con la herramienta mergekit mediante el método Linear con normalización.

Técnicamente es un transformer decoder-only causal de la familia gpt_neox, con 6.856.253.440 parámetros (~6,86 B) almacenados en safetensors (bfloat16) dentro de un repositorio de 13,7 GB. El autor no ha publicado model card descriptiva, licencia, idiomas soportados ni resultados de benchmarks, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

Su interés es doble: por un lado ilustra la técnica de checkpoint averaging o model soups (promediar los pesos de varios puntos de control del mismo entrenamiento sin coste adicional de inferencia); por otro, sirve como ejemplo reproducible de publicación de merges con mergekit. La ausencia de licencia, de evaluación y de plantilla de chat documentada lo convierten en objeto de estudio, no en componente de despliegue directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt_neox (transformer decoder-only causal) |
| Parametros totales | 6.856.253.440 (~6,86 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no documentados por el autor; los pesos se publican en bfloat16 (la fusión se calculó en float32 y se exportó a bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 13,7 GB) |

## Arquitectura y entrenamiento

El modelo es un merge lineal (Linear merge) de cinco checkpoints del mismo run de entrenamiento, todos ellos instantáneas de `filtered_insert_xxf_character` en los pasos 6000, 7000, 8000, 9000 y 10000. La configuración YAML de mergekit asigna peso 1.0 a cada uno de los cinco modelos, usa `global_step10000` como base, activa `normalize: true`, realiza la fusión en `float32` y exporta el resultado en `bfloat16`. Con pesos idénticos y normalización activada, el resultado equivale a la media aritmética de los cinco checkpoints, de ahí el sufijo `simpleavg` del nombre. La referencia `arxiv:2203.05482` corresponde al artículo de model soups, que formaliza el promediado de pesos de modelos ajustados sin incrementar el coste de inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el tag `conversational` es el único indicio de uso dialógico, pero no se documenta ninguna plantilla de chat. Las rutas de origen de los checkpoints (`Pan_Safety_Better_Measurement/merge_scaling_ckpts_cache/source_ckpts/filtered_insert_xxf_character`) sugieren un proyecto interno de medición de seguridad, aunque no se ha publicado ningún detalle al respecto. Tampoco se documentan innovaciones como decodificación especulativa, atención lineal ni variantes de atención.

## Capacidades

- Generación de texto causal: al ser un modelo gpt_neox entrenado, la capacidad documentada por los tags es `text-generation`.
- Uso conversacional: el tag `conversational` aparece en el repositorio, pero no se publica plantilla de chat ni formato de prompt recomendado.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Compatibilidad de despliegue: los tags `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con endpoints gestionados de HuggingFace.

## Casos de uso

- Investigación sobre fusión de modelos: sirve como caso real y reproducible de checkpoint averaging con mergekit, útil para medir cómo afecta el promediado de checkpoints intermedios frente a usar únicamente el último.
- Punto de partida para fine-tuning: al ser un modelo base denso de ~6,86 B, puede actuar como inicialización para ajuste supervisado en un dominio concreto, siempre que se resuelva antes la ambigüedad de licencia.
- Prototipado de generación de texto en local: con cuantización de 4 bits cabe en GPUs de consumo de 8 GB, lo que permite experimentar con generación de texto sin infraestructura dedicada.
- Estudio de estabilidad del entrenamiento: comparar este merge con el checkpoint `global_step10000` aislado permite analizar si el promediado suaviza el ruido de los pasos finales.
- Base para pipelines de evaluación de seguridad: dado el contexto de rutas internas del proyecto de origen, puede reutilizarse como sujeto de pruebas en baterías de evaluación de sesgos y contenido dañino.
- Cuantización y despliegue ligero: convertido a GGUF (formato soportado para gpt_neox en llama.cpp), puede ejecutarse en portátiles y equipos sin GPU para tareas de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web asociada al modelo no devolvió ningún documento técnico, paper ni blog relevante (los resultados obtenidos correspondían a contenido jurídico no relacionado), y la model card del autor únicamente describe el procedimiento de merge. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra métrica.

## Comparativa con modelos similares

La comparativa se establece con modelos públicos de la misma familia arquitectónica (gpt_neox) y tamaño similar, ya que no existen alternativas directamente equivalentes al ser este un merge no documentado. Los datos de contexto y parámetros de los modelos de referencia provienen de su documentación pública; los del modelo analizado figuran como no disponibles cuando el autor no los declara.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo | gpt_neox | 6,86 B | no disponible | no disponible | ninguno |
| Pythia-6.9B | gpt_neox | ~6,9 B | 2048 | Apache 2.0 | sí, en su model card |
| RedPajama-INCITE-7B-Base | gpt_neox | ~6,9 B | 2048 | Apache 2.0 | sí, en su model card |
| GPT-J-6B | gpt_j | ~6,0 B | 2048 | Apache 2.0 | sí, en su model card |

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 13,7 GB solo para los pesos, más caché KV y activaciones; en la práctica entre 16 y 20 GB según longitud de secuencia y tamaño de lote.
- VRAM en float32: aproximadamente 27,4 GB para los pesos, lo que exige GPUs de 40 GB o superiores.
- VRAM con cuantización de 8 bits: alrededor de 7 GB de pesos, con un consumo real de 10 a 12 GB.
- VRAM con cuantización de 4 bits (por ejemplo Q4_K_M en GGUF): alrededor de 3,5 a 4 GB de pesos, con un consumo real de 6 GB.
- GPU recomendadas: A100 (40 u 80 GB) o H100 para bfloat16 sin compromisos; RTX 4090, RTX 3090 o RTX 4060 Ti de 16 GB para bfloat16 con secuencias moderadas; RTX 3060 de 12 GB y similares para 8 bits; GPUs de 8 GB para 4 bits.
- Cabe en GPU de consumo: sí. En bfloat16 entra en tarjetas de 24 GB; con cuantización de 4 bits funciona en tarjetas de 8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (TGI), vLLM, llama.cpp y derivados como Ollama u LM Studio previa conversión a GGUF, y endpoints compatibles de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, lo que supone un riesgo legal para producción.
- Ausencia de model card: no se documentan datos de entrenamiento, composición del dataset, idiomas ni plantilla de prompt.
- Sin benchmarks: no hay ninguna métrica publicada que permita estimar su calidad frente a alternativas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni el proyecto de origen, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Riesgo de alucinación: es un modelo generativo base sin ajuste por instrucciones documentado, por lo que la generación de hechos inventados es previsible.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Idiomas no declarados: no hay garantía de un rendimiento mínimo en castellano ni en ninguna otra lengua.
- Naturaleza de merge: al ser un promedio de checkpoints del mismo entrenamiento, su calidad será muy cercana a la del checkpoint `global_step10000`; no incorpora capacidades nuevas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentación de terceros.
- Metadatos atípicos: la fecha de creación registrada (2026) y el nombre basado en rutas internas sugieren un artefacto de experimentación más que una publicación estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_insert_xxf_character-6k_7k_8k_9k_10k_simpleavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Artículo de model soups referenciado por el tag arxiv:2203.05482: https://arxiv.org/abs/2203.05482
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada.
