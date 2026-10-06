# yoghandayani/fun-retrieval

## Resumen

`yoghandayani/fun-retrieval` es un repositorio de HuggingFace que contiene una implementación propia en PyTorch de un "Tiny Transformer" orientado a tareas de recuperación (retrieval). El autor lo publica explícitamente como un artefacto para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es una inicialización válida, no un modelo entrenado.

El modelo es minúsculo: 49.600 parámetros totales según el fichero de safetensors, lo que lo sitúa tres órdenes de magnitud por debajo de cualquier encoder de recuperación estándar. La configuración publicada se etiqueta internamente como "xlarge" dentro del propio proyecto, una denominación relativa que no guarda relación con el uso habitual del término en la industria. Emplea atención multi-query, fusión de bajo rango, activación GELU y normalización por lotes (BatchNorm).

Su relevancia es fundamentalmente didáctica y de infraestructura: sirve como esqueleto reproducible para montar pipelines de evaluación de retrieval multimodal (el autor sugiere Flickr30k como primer banco de pruebas), comparar baselines con el mismo presupuesto de cómputo y validar integraciones técnicas antes de escalar a modelos reales. No hay resultados de benchmarks, ni datos de entrenamiento, ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación propia en PyTorch), atención multi-query, fusión de bajo rango, activación GELU, normalización BatchNorm |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (tamaño del repo 0.0 GB); a este tamaño la cuantización es irrelevante |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (checkpoint de inicialización); incluye `train.py`, `config.json` y `training_args.json` |
| Tarea declarada | retrieval |
| Escala declarada por el autor | "xlarge" (denominación interna del proyecto) |
| Descargas / likes | 0 / 0 |
| Fechas registradas en HuggingFace | creado 2026-10-05, actualizado 2026-10-05 (marca temporal anómala, posterior a la fecha actual de consulta) |
| Region | us |

## Arquitectura y entrenamiento

La arquitectura es un transformer compacto definido por el propio autor en `train.py`, con `config.json` recogiendo los parámetros generados. Los elementos declarados son: atención multi-query (varias cabezas de consulta compartiendo claves y valores, lo que reduce el coste de memoria del KV cache), una estrategia de fusión de bajo rango, activación GELU y normalización mediante BatchNorm en lugar de LayerNorm, una elección poco habitual en transformers y propia de implementaciones experimentales. La configuración se etiqueta como "xlarge" dentro del espacio de variantes del script, pero con 49.600 parámetros el término es puramente relativo al propio repositorio.

No hay información sobre datos de entrenamiento: no se indica número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card es explícita al respecto: el checkpoint de `model.safetensors` es "una inicialización válida para smoke tests" y "no se presenta como un checkpoint entrenado con benchmarks". La receta de experimento por defecto usa el optimizador AdamW con un schedule de tipo "step", y el autor advierte que son valores de partida del script, no evidencia de una ejecución completada. Como referencia de evaluación propone Flickr30k, con el metric de la tarea reportado sobre al menos tres semillas y un baseline de capacidad equiparable, conservando logs de entrenamiento y versiones del entorno.

## Capacidades

- El checkpoint publicado no ha sido entrenado, por lo que no cabe atribuirle capacidades funcionales de recuperación, generación ni representación semántica verificadas.
- Estructura funcional para definir y ejecutar un transformer de retrieval a escala diminuta (forward pass, configuración de arquitectura, punto de entrada de entrenamiento).
- Punto de entrada ejecutable: `python train.py --help` expone la interfaz del script y el bloque `__main__` contiene un ejemplo de smoke test generado.
- Compatibilidad con flujos de PyTorch estándar, con la advertencia del autor de que las APIs genéricas de carga automática requieren un adaptador explícito, al ser una implementación personalizada.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, modo "thinking" ni multilingüismo.
- No se declaran idiomas soportados.

## Casos de uso

- Pruebas de humo en CI/CD: el repositorio permite instanciar el modelo, ejecutar un forward pass y verificar que la forma de los tensores y la serialización safetensors son correctas en cada commit, con un coste de cómputo despreciable (49.600 parámetros).
- Plantilla de evaluación de retrieval: el autor propone Flickr30k como primer banco de pruebas con al menos tres semillas y un baseline de capacidad equiparable, de modo que el repositorio sirve como arnés reproducible para comparar métodos bajo el mismo presupuesto de datos y ajuste.
- Material docente: ilustra de forma legible cómo se compone un transformer con atención multi-query, fusión de bajo rango y BatchNorm, sin la complejidad de un modelo de miles de millones de parámetros.
- Revisión de código y auditoría de arquitectura: el propio autor lo enmarca como artefacto para code review, útil para validar convenciones de configuración (`config.json`, `training_args.json`) antes de trasladarlas a implementaciones mayores.
- Desarrollo de adaptadores de carga: dado que las APIs genéricas de HuggingFace no cargan este modelo sin un adaptador explícito, el repositorio sirve para practicar y validar la escritura de dichos adaptadores y de wrappers de pesos.
- Pruebas de infraestructura de entrenamiento: valida pipelines de datos, guardado de checkpoints, reanudación y logging en un escenario de juguete antes de lanzar ejecuciones costosas, siguiendo la recomendación del autor de conservar logs y versiones del entorno.
- Verificación de formatos y empaquetado: comprobar la conversión a safetensors y la integridad del repositorio (tamaño 0.0 GB, un único fichero de pesos) en flujos de publicación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado ni auditado. Cualquier cifra sobre Flickr30k u otra métrica de retrieval sería inventada, por lo que no se incluye tabla de resultados.

## Requisitos de hardware

- VRAM para inferencia: despreciable. Con 49.600 parámetros, los pesos en fp32 ocupan aproximadamente 0,2 MB; en fp16, unos 0,1 MB. Cabe en cualquier GPU, iGPU o ejecución en CPU.
- GPU recomendadas: ninguna en particular. Funciona en cualquier acelerador CUDA o en CPU sin requisitos apreciables.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso GPUs integradas), limitado más por el coste de arranque del framework que por el modelo.
- Opciones de despliegue: PyTorch nativo a través de `train.py`. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, y el autor advierte que las APIs de carga automática necesitan un adaptador explícito.
- Latencia y throughput: no disponibles. No se han publicado mediciones y, al tratarse de un checkpoint sin entrenar, no tendrían valor como referencia de rendimiento en tareas de retrieval.
- Requisitos de entrenamiento: no disponibles en la información proporcionada; `training_args.json` contiene una receta por defecto con AdamW y schedule de tipo step, pero el autor no confirma que se haya ejecutado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de configuración comparables aportados por la información proporcionada. La comparación siguiente es únicamente cualitativa y de escala; los datos de los modelos alternativos proceden de conocimiento público general y no de la información suministrada, por lo que deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| yoghandayani/fun-retrieval | 49.600 | Retrieval (multimodal, según Flickr30k sugerido) | no disponible | BSD-3-Clause | Checkpoint sin entrenar, 0 descargas |
| Encoders de retrieval tipo all-MiniLM-L6-v2 | ~22 millones (referencia pública) | Retrieval de texto | 512 tokens (referencia pública) | Apache-2.0 (referencia pública) | Modelo entrenado y ampliamente evaluado |
| Modelos contrastivos multimodal tipo CLIP ViT-B/32 | ~151 millones (referencia pública) | Retrieval texto-imagen | 77 tokens de texto (referencia pública) | Licencia propia de OpenAI (referencia pública) | Modelo entrenado con benchmarks publicados |

La diferencia de escala es de dos a tres órdenes de magnitud en parámetros, y la diferencia de madurez es total: los alternativos son modelos entrenados y evaluados, mientras que este repositorio es un esqueleto de implementación.

## Limitaciones y advertencias

- El checkpoint es una inicialización sin entrenar. No debe esperarse ninguna calidad de recuperación; el propio autor lo declara no apto para producción.
- No hay ninguna métrica publicada y el repositorio no reclama ninguna puntuación de benchmark.
- No se ha auditado el modelo en cuanto a robustez, equidad (fairness) ni transferencia de dominio, según la model card.
- No se declaran sesgos, pero al no existir datos de entrenamiento documentados tampoco es posible evaluarlos.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que no hay modelo entrenado que generar; el riesgo real es interpretar las salidas del checkpoint aleatorio como resultados válidos.
- No se declaran idiomas soportados ni limitaciones de contexto, porque no se especifica la longitud de contexto de la arquitectura.
- Licencia BSD-3-Clause: permisiva y compatible con uso comercial, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado si se usa con datasets externos.
- Implementación personalizada: los cargadores automáticos de HuggingFace no funcionan sin un adaptador explícito, lo que complica su integración directa en ecosistemas estándar.
- Normalización con BatchNorm en lugar de LayerNorm, elección poco habitual que puede comportarse de forma distinta a lo esperado en inferencia con lotes pequeños.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos en el repositorio, tal como indica el autor.
- El repositorio no tiene descargas ni interacciones, por lo que no hay validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoghandayani/fun-retrieval
- No se han encontrado enlaces relevantes en la búsqueda web. Los resultados devueltos corresponden a consultas no relacionadas (foros sobre ayudas de la CAF francesa) y no guardan ninguna relación con el modelo; se descartan por completo.
- No se dispone de enlace a paper, blog técnico, repositorio de código independiente ni demo asociados al modelo en la información proporcionada.
