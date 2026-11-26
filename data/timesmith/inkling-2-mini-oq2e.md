# timesmith/Inkling-2-Mini-oQ2e

## Resumen

Inkling-2-Mini-oQ2e es una cuantización mixta del modelo Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. El checkpoint resultante pesa 10,8 GB y contiene 26.388.641.280 parámetros en el modelo de lenguaje, más un componente de visión de 0,318B de parámetros. La cuantización se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precisión mixta por capas y tensores en lugar de una cuantización uniforme.

El interés de esta ficha radica en que reduce un modelo de aproximadamente 26.700 millones de parámetros a un checkpoint de menos de 10 GiB mediante una combinación de pesos en 2 bits (el 91,6% de los pesos lógicos), 8 bits (5,9%) y BF16/FP32 para las capas más sensibles. El resultado son 3,215 bits efectivos por peso, lo que permite ejecutar el modelo en hardware con bastante menos memoria que la versión original en BF16, a costa de una degradación de calidad que el autor no documenta.

La información pública disponible es muy escasa: no hay model card descriptiva del modelo base, no se especifican licencia, idiomas ni benchmarks, y el repositorio no registra descargas ni valoraciones. La ficha se limita, por tanto, a los datos técnicos verificables del checkpoint y a las inferencias razonables a partir de su estructura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `inkling2_loop`; no se documenta el tipo de transformer ni si usa bucles de cómputo recurrentes) |
| Parámetros totales | 26.388.641.280 (modelo de lenguaje) + 0,318B (visión) = 26.707B lógicos |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta oQ: affine 2-bit grupo 64 (91,592%), affine 8-bit grupo 64 (5,887%), BF16 (2,387%), FP32 (0,133%); media efectiva 3,215 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería MLX (`mlx`); repo de 10,8 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Inkling-2-Mini. El tag `inkling2_loop` sugiere alguna forma de procesamiento recurrente o iterativo por capas, pero el autor no lo documenta. El checkpoint incluye un componente de visión de 0,318B de parámetros, lo que indica que el modelo base es multimodal (texto e imagen), aunque no se detalla cómo se integra la visión en el transformer ni si comparte los mismos mecanismos de atención.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La única información técnica verificable es el proceso de cuantización: oQ (oMLX v0.8.3) asigna 2 bits a la gran mayoría de los pesos, 8 bits a un subconjunto del 5,9% y mantiene en BF16/FP32 el 2,5% restante, presumiblemente capas de normalización, embeddings o proyecciones sensibles a la precisión. Esta estrategia de precisión mixta busca preservar la calidad en los tensores críticos mientras comprime agresivamente el resto.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un transformer de ~26B parámetros, por lo que se espera capacidad de generación de lenguaje general, aunque no hay evaluación publicada.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,318B de parámetros, lo que confirma soporte multimodal de entrada visual.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking o razonamiento explícito: no disponible.
- Otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue en equipos Apple Silicon: al estar en formato MLX, el checkpoint está pensado para ejecutarse con el framework MLX de Apple, aprovechando la memoria unificada de los chips M-series para cargar los ~10 GiB del modelo sin GPU dedicada.
- Prototipado local de aplicaciones multimodales: el módulo de visión permite experimentar con tareas de imagen a texto en un equipo de sobremesa, aunque sin garantías de calidad al no haber benchmarks.
- Investigación sobre cuantización extrema: el checkpoint es un caso de estudio útil para medir el impacto de 2 bits en la mayoría de pesos sobre tareas concretas, comparándolo con el modelo base en BF16.
- Generación de texto en entornos con VRAM limitada: con 3,215 bits efectivos, el modelo cabe en GPUs de 12-16 GB si se usa MLX o conversiones a otros formatos, ampliando el acceso a un modelo de ~26B.
- Evaluación de pipelines de inferencia MLX: sirve para probar el rendimiento de MLX con modelos grandes cuantizados y comparar latencia frente a llama.cpp o vLLM.
- Fine-tuning ligero o adaptación con LoRA: al ser safetensors, puede cargarse en frameworks compatibles para experimentos de adaptación, aunque la cuantización de 2 bits complica el entrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~10 GiB para cargar el checkpoint completo (9,995 GiB de pesos más overhead de ejecución); en la práctica, entre 11 y 13 GB de memoria.
- GPU recomendadas: en el ecosistema MLX, chips Apple M1 Pro/Max/Ultra con 16 GB o más de memoria unificada; en CUDA, GPUs con 16 GB o más (RTX 4080, RTX 4090, A100 40GB) previa conversión del formato MLX a otro compatible.
- ¿Cabe en consumer GPU? Sí, en GPUs de 16 GB o más, y en equipos Apple con 16 GB de memoria unificada; en GPUs de 12 GB es ajustado y puede requerir offloading.
- Opciones de despliegue: MLX (librería nativa del checkpoint); para otros entornos sería necesaria una conversión a GGUF (llama.cpp/Ollama) o a safetensors estándar para vLLM/TGI, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ2e | 26,7B (26,4B LM + 0,3B visión) | no disponible | 3,215 bits/peso efectivos | no disponible | safetensors MLX |
| Modelo base Inkling-2-Mini (BF16) | ~26,7B | no disponible | 16 bits | no disponible | no disponible |
| Alternativas de ~27B en 2-4 bits (p. ej. Gemma-2-27B, Qwen2.5-32B cuantizados) | 27-32B | 8K-128K según modelo | 2-4 bits | licencias variables | GGUF, safetensors |

La comparación con alternativas es limitada porque no se conocen las capacidades del modelo base ni sus resultados. Frente a cuantizaciones estándar de 4 bits de modelos de tamaño similar, este checkpoint es más agresivo (3,215 bits efectivos) y está atado al ecosistema MLX, lo que reduce su portabilidad.

## Limitaciones y advertencias

- La cuantización a 2 bits en el 91,6% de los pesos implica una pérdida de calidad no cuantificada; no hay evaluación que compare el checkpoint con el modelo base.
- No se especifica licencia, por lo que no se puede confirmar si el uso comercial está permitido.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- El formato MLX limita el despliegue a entornos Apple o a conversiones manuales no documentadas.
- No hay información sobre sesgos, alucinación o comportamiento en producción.
- El repositorio no tiene descargas ni validación de la comunidad; es un artefacto reciente y sin verificación independiente.
- El tag `inkling2_loop` sugiere una arquitectura no estándar que podría no ser compatible con herramientas de inferencia convencionales.
- El modelo base no está identificado con un repositorio oficial, lo que dificulta rastrear su procedencia y condiciones de uso.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ2e
- Repositorio de la herramienta de cuantización oQ: https://github.com/jundot/omlx
