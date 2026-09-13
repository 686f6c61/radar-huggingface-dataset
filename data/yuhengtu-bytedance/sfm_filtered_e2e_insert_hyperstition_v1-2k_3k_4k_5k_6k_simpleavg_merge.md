# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_5k_6k_simpleavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de aproximadamente 6.856 millones de parametros (6,86 B) publicado por el usuario yuhengtu-bytedance. No es un modelo entrenado desde cero ni un fine-tuning clasico: es el resultado de aplicar la tecnica de fusion de pesos (model merging) mediante la herramienta mergekit sobre cinco checkpoints intermedios de un mismo entrenamiento, correspondientes a los pasos globales 2000, 3000, 4000, 5000 y 6000. El punto de partida (base) es el checkpoint del paso 6000 y el metodo empleado es Linear (promediado lineal de pesos con normalizacion), con salida en bfloat16.

El identificador del repositorio, `sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_5k_6k_simpleavg_merge`, y las rutas de los checkpoints originales (`Pan_Safety_Better_Measurement`) apuntan a un artefacto de investigacion interna vinculado a medicion de seguridad, mas que a un modelo listo para producto. La arquitectura declarada por las etiquetas de HuggingFace es `gpt_neox`, un transformer causal de tipo decoder-only con atencion completa, y el repositorio ocupa 13,7 GB, coherente con pesos en bfloat16 de 6,86 B de parametros sin cuantizar.

La relevancia de esta ficha es fundamentalmente metodologica: ilustra como se publican hoy fusions de checkpoints intermedios para estudiar la estabilidad del entrenamiento y el promediado de trayectorias (weight averaging). No obstante, la model card no documenta dataset de entrenamiento, tokenizador, longitud de contexto, idiomas, licencia ni evaluaciones, y el repositorio no tiene descargas ni likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental sin garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt_neox (transformer causal decoder-only, segun etiqueta de HuggingFace) |
| Parametros totales | 6.856.253.440 (6,86 B), dato real de los safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers); repositorio de 13,7 GB |

## Arquitectura y entrenamiento

La arquitectura es `gpt_neox`, es decir, un transformer causal con normalizacion de tipo LayerNorm en posiciones paralelas y atencion causal completa; no hay atencion lineal, SSM ni componentes hibridos. El modelo no incorpora innovaciones de inferencia (no se declara decodificacion especulativa ni atencion dispersa). Los pesos finales se han generado con `mergekit` mediante el metodo Linear (`merge_method: linear`), con `normalize: true`, `dtype: float32` para la fusion y `out_dtype: bfloat16` para la salida.

En cuanto a los datos, la informacion disponible no permite reconstruir el entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Lo unico documentado es la procedencia de los pesos fusionados: cinco checkpoints del mismo run, nombrados `filtered_e2e_insert_hyperstition_v1`, correspondientes a los pasos 2000 a 6000, todos con peso 1.0 en el promedio. Se trata, por tanto, de un promediado simple (simple average) de la trayectoria de entrenamiento, una tecnica relacionada con los "model soups" (arXiv:2203.05482) cuyo objetivo es reducir el ruido del checkpoint final y mejorar la robustez sin coste adicional de inferencia.

## Capacidades

- Generacion de texto autorregresiva, heredada de la arquitectura gpt_neox y de la etiqueta `text-generation`.
- Conversacion multi-turno: el repositorio declara la etiqueta `conversational`, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, segun las etiquetas del repositorio.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso en agentes y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento especifico.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponible.

## Casos de uso

- Investigacion sobre fusion de pesos: reproducir o comparar el efecto del promediado lineal de checkpoints intermedios (pasos 2000-6000) frente al checkpoint final, usando este repositorio como referencia metodologica.
- Estudios de estabilidad de entrenamiento: analizar si el promediado de la trayectoria reduce la varianza de las respuestas respecto al checkpoint del paso 6000 en un mismo conjunto de prompts.
- Evaluacion de artefactos de seguridad: dado que la ruta de origen pertenece a un proyecto de medicion de seguridad, el modelo puede emplearse como sujeto de pruebas en baterias de evaluacion de comportamiento y filtrado de datos.
- Prototipado interno de generacion de texto: al caber en una unica GPU de 24 GB, permite montar demos locales de chat para validar pipelines de despliegue antes de invertir en modelos mayores.
- Baseline academico en experimentos de merging: comparar el metodo Linear con otras tecnicas de mergekit (SLERP, TIES, DARE) sobre los mismos cinco checkpoints de origen.
- Servicio de inferencia controlado en infraestructura propia: con TGI o vLLM se puede exponer un endpoint compatible con la API de OpenAI para pruebas internas de latencia y throughput a 6,86 B de parametros.
- Docencia y formacion tecnica: ilustrar en un curso como se publica un modelo fusionado, que metadatos son imprescindibles y que ocurre cuando faltan (caso claro de model card incompleta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y los checkpoints de origen no son accesibles publicamente (las rutas del YAML apuntan a directorios locales del autor), por lo que no es posible reproducir el proceso ni verificar el efecto de la fusion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 6,86 B de parametros, no son cifras oficiales del autor):
  - bfloat16 / float16: unos 13,7 GB solo de pesos, mas cache KV; en la practica 16-20 GB.
  - Cuantizacion de 8 bits: unos 7 GB de pesos; 9-11 GB con cache.
  - Cuantizacion de 4 bits: unos 3,5-4 GB de pesos; 6-8 GB con cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bfloat16; A10G, L4, RTX 3090/4090 para 8 bits.
- Cabe en GPU de consumo: si. RTX 4090/3090 (24 GB) en bfloat16; RTX 4080/4070 Ti (16 GB) en 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB en 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta explicita), vLLM y endpoints_compatible. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el repositorio no ofrece actualmente.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye evaluaciones comparativas, y la licencia, el contexto y los idiomas del modelo no estan documentados, por lo que cualquier comparacion cuantitativa seria especulativa. Los datos de la columna de alternativas proceden de conocimiento general del sector y no han sido verificados en la busqueda realizada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_5k_6k_simpleavg_merge | 6,86 B | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Mistral 7B (v0.3) | 7,3 B | 32k | benchmarks publicos; no comparables aqui | Apache 2.0 | amplia |
| Llama 3.1 8B | 8,03 B | 128k | benchmarks publicos; no comparables aqui | Llama 3.1 Community License | amplia, con restricciones |
| Qwen2.5 7B | 7,6 B | 128k | benchmarks publicos; no comparables aqui | Apache 2.0 | amplia |

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, tokenizador, idiomas, contexto, licencia ni procedencia del modelo base original de los checkpoints.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial; hay que asumir el escenario mas restrictivo.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual; el modelo no ha pasado por etapas documentadas de RLHF o DPO.
- Sesgos: no evaluados ni declarados. El prefijo `filtered` en el nombre del checkpoint sugiere un filtrado de datos cuyo criterio se desconoce.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento correcto mas alla de ventanas cortas ni en castellano.
- Trazabilidad limitada: los checkpoints fusionados son rutas locales privadas, por lo que la fusion no es reproducible externamente.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion muy proximas entre si (13 de septiembre de 2026), lo que apunta a una publicacion automatica o de prueba.
- Antes de usarlo en produccion habria que ejecutar una evaluacion propia de calidad, seguridad y coste de inferencia, y fijar la revision exacta del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_5k_6k_simpleavg_merge
- Repositorio de mergekit (herramienta usada para la fusion): https://github.com/cg123/mergekit
- Paper del metodo Linear / model soups: https://arxiv.org/abs/2203.05482
- Paper, blog, demo o repositorio adicionales del autor: no disponibles en la informacion proporcionada.
