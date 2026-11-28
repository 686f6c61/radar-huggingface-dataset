# zimplex/roboturn-pear-rl-task32-lr1e6-b32-20261123

## Resumen

Roboturn PEAR-RL task32 es un checkpoint intermedio de un ajuste fino multimodal publicado por el usuario zimplex en Hugging Face. El modelo parte de una base identificada en la model card como Qwen3.8-27B y se exporta con la clase `Qwen3_5ForConditionalGeneration`, con pesos en bfloat16 y entradas de vision. El pipeline declarado es `image-text-to-text`, por lo que se trata de un modelo conversacional capaz de procesar imagenes y texto.

El checkpoint corresponde al paso de optimizador 90 de una ejecucion de 100 pasos, con learning rate 1e-06, batch 32, N=8, 32 tareas de entrenamiento y 30 turnos. Segun la propia model card, la publicacion del paso 100 fallo durante la publicacion nativa del estado final, de modo que este artefacto es un checkpoint intermedio y no el modelo final de la receta. El autor indica que la validacion se realiza sobre un conjunto comun de 223 casos con temperatura 0.2 y N=1.

El interes de esta ficha es acotado: se trata de un experimento de investigacion (receta Roboturn con PEAR-RL) con licencia Apache 2.0, pesos safetensors y configuracion de inferencia incluida, pero sin datos publicados de benchmarks, idiomas soportados ni resultados de validacion en la informacion disponible. Su relevancia practica es limitada frente a checkpoints finales de la familia Qwen, aunque puede ser util para reproducir o auditar el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (vision + texto), pesos en bfloat16 |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards: 49.849.576.928 y 5.785.494.384 bytes) |

## Arquitectura y entrenamiento

La arquitectura declarada en la configuracion exportada es `Qwen3_5ForConditionalGeneration`, un modelo transformer condicional con torre de vision y pesos en bfloat16, heredado del checkpoint base Qwen3.8-27B citado por el autor. El repositorio incluye `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`, lo que confirma soporte de entradas de imagen y video en el pipeline de preprocesado. No se detalla en la informacion disponible el numero de capas, cabezas de atencion, dimension oculta ni el mecanismo exacto de atencion.

El entrenamiento consiste en un ajuste fino con la receta Roboturn y PEAR-RL sobre 32 tareas, con 30 turnos por episodio, learning rate 1e-06, batch 32 y N=8, durante 100 pasos planificados. Este artefacto es el paso 90. La model card menciona verificacion SHA256 de los ficheros de modelo, lectura completa del publicador y comprobacion anonima de tamanos y checksums en el Hub. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO mas alla del propio esquema PEAR-RL.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Procesamiento de imagenes y texto combinados (`image-text-to-text`), con preprocesadores de imagen y video incluidos.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite uso directo con `transformers` y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; la receta se entrena con episodios de 30 turnos, lo que sugiere interaccion multi-turno, pero no se detalla el comportamiento resultante.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Investigacion y reproduccion de recetas de RL: el checkpoint permite inspeccionar el estado intermedio (paso 90) de un entrenamiento PEAR-RL con parametros documentados (lr 1e-06, batch 32, 32 tareas, 30 turnos) y comparar curvas de entrenamiento publicadas en GitHub.
- Auditoria de artefactos de publicacion: los checksums SHA256 por fichero y el indexado de shards permiten verificar la integridad de los pesos en pipelines de MLOps antes de desplegarlos.
- Evaluacion de modelos multimodales imagen-texto en entornos controlados: el pipeline `image-text-to-text` y los preprocesadores de imagen/video permiten montar pruebas de descripcion de imagenes o respuesta a preguntas visuales, siempre que se valide su calidad con el conjunto de 223 casos del autor.
- Base para ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors bfloat16, puede servir como punto de partida para experimentos de fine-tuning en tareas propias, con la cautela de ser un checkpoint intermedio.
- Pruebas de integracion con `transformers` y endpoints compatibles: la etiqueta `endpoints_compatible` y la configuracion de generacion incluida facilitan desplegarlo en infraestructura de inferencia estandar para validar el pipeline de carga.
- Docencia y experimentacion con modelos de ~27B: util para demostrar el flujo completo de carga de un modelo multimodal de gran tamano con sharding safetensors y verificacion de checksums.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una validacion sobre un conjunto comun de 223 casos con temperatura 0.2 y N=1, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo para pesos (27,36 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 80 GB o mas por GPU para contexto largo.
- Cuantizacion a 8 bits: ~27-30 GB de pesos; a 4 bits: ~14-16 GB de pesos, aunque no se documentan variantes cuantizadas oficiales de este checkpoint.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; multi-GPU con tensor parallelism para mayor contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16; requeriria cuantizacion agresiva (4 bits) y aun asi con margen ajustado para el modelo completo mas vision.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta configuracion concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Roboturn PEAR-RL task32 (este) | ~27,36 B | no disponible | Apache 2.0 | safetensors bf16 | Checkpoint intermedio (paso 90/100) de un ajuste PEAR-RL |
| Qwen3.8-27B (base citada) | ~27 B (segun autor) | no disponible | no disponible en esta ficha | no disponible | Checkpoint base del que parte la receta Roboturn |
| Alternativas de ~27B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 90 de 100); la model card advierte que la publicacion del paso 100 fallo, por lo que no representa el estado final del entrenamiento.
- No se han publicado benchmarks ni resultados de validacion numericos; el rendimiento real es desconocido.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- La longitud de contexto no esta disponible, lo que impide planificar cargas con ventanas largas.
- No se ofrecen variantes cuantizadas oficiales; el despliegue en hardware de consumo requiere cuantizacion propia no validada por el autor.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion sin evaluacion publicada, no es recomendable para produccion sin validacion previa.
- El nombre del modelo y la base citada ("Qwen3.8-27B") no corresponden a una denominacion estandar publica de la familia Qwen, por lo que conviene verificar la procedencia exacta de los pesos base antes de un uso critico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zimplex/roboturn-pear-rl-task32-lr1e6-b32-20261123)
- [Artefactos de entrenamiento y curvas en GitHub](https://github.com/zhouqqhh/roboturn/tree/codex/pear-rl-training-artifacts-20261126)
