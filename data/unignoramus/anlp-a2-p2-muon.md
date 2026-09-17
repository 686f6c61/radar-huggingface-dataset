# unignoramus/anlp-a2-p2-muon

## Resumen

anlp-a2-p2-muon es un transformer decoder-only de 35,27 millones de parametros entrenado desde cero por el usuario unignoramus como parte de la asignatura ANLP (Assignment 2, Part 2). El interes del artefacto no esta en sus capacidades linguisticas, sino en el hecho de que implementa a mano el optimizador Muon (en lugar de AdamW) y publica el checkpoint resultante junto al codigo del modelo. Se trata, por tanto, de un experimento academico reproducible sobre optimizacion, no de un modelo orientado a producto.

El modelo se preentreno sobre el corpus paralelo humano/IA en ingles `browndw/human-ai-parallel-corpus` durante 38,93 millones de tokens, con un learning rate de 0,02, alcanzando una perdida de validacion de 3,9174 y un BLEU de test de 1,58. Esa cifra de BLEU es practicamente indistinguible de una traduccion aleatoria, lo que confirma que el entrenamiento esta muy lejos de la convergencia util.

Su relevancia actual es limitada y acotada al ambito de investigacion: sirve como punto de partida para reproducir experimentos con Muon, como baseline de comparacion frente a AdamW a pequena escala y como ejemplo de pipeline completo (dataset, entrenamiento, evaluacion y publicacion de checkpoint) en un repositorio de 0,1 GB. No dispone de model card extendida, ni de pipeline declarado, ni de resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia, no basada en `transformers`) |
| Parametros totales | 35,27 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precision completa via `torch.save`) |
| Idiomas soportados | ingles (corpus de entrenamiento en ingles); no se declaran capacidades multilingues |
| Licencia | MIT |
| Formato de pesos | checkpoint `torch.save` con claves `model`, `state` y `config`; no hay safetensors ni GGUF |
| Optimizador | Muon (implementacion manual) |
| Learning rate | 0,02 |
| Tokens de entrenamiento | 38,93 M |
| Perdida de validacion | 3,9174 |
| Dataset | `browndw/human-ai-parallel-corpus` |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only escrito a mano, con el objetivo declarado de preentrenarlo sobre un corpus paralelo humano/IA en ingles. La innovacion tecnica del experimento no esta en el modelo sino en el optimizador: se emplea Muon con un learning rate de 0,02. Muon es un optimizador pensado para capas ocultas que ortogonaliza las actualizaciones de momento mediante iteraciones de Newton-Schulz, en lugar de aplicar la actualizacion escalar de AdamW. El autor indica explicitamente que la implementacion del optimizador es propia.

El entrenamiento consumio 38,93 millones de tokens (aproximadamente 1,1 tokens por parametro, un regimen muy por debajo de lo habitual incluso en modelos pequenos) y termino con una perdida de validacion de 3,9174. No se documenta composicion detallada del dataset, numero de epocas, tamano de batch ni si hubo fases posteriores de ajuste con RLHF o DPO; dado el contexto academico, lo mas probable es que se trate de un unico preentrenamiento supervisado, pero este extremo no se confirma en la informacion disponible.

El checkpoint se distribuye como payload plano de `torch.save` con las claves `model`, `state` y `config`, y debe cargarse con `torch.load(..., weights_only=False)` alimentando despues `model` a la clase de transformer definida en el repositorio adjunto. Esto implica que no es cargable directamente con `AutoModelForCausalLM` de HuggingFace `transformers`.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad muy baja segun la metrica publicada.
- Traduccion humana/IA en el dominio del corpus de entrenamiento, con BLEU de test de 1,58 (practicamente ruido).
- Optimizacion con Muon: el artefacto documenta y permite reproducir el comportamiento de este optimizador.
- Carga manual del checkpoint via `torch.load` y codigo propio del repositorio.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo de razonamiento (thinking), vision ni audio.
- No se declaran capacidades multilingues; el entrenamiento es en ingles.
- No hay pipeline declarado en HuggingFace, por lo que no se expone una tarea estandar.

## Casos de uso

- Reproduccion de experimentos con Muon: el modelo permite verificar paso a paso como se comporta el optimizador sobre un transformer pequeno con un presupuesto de tokens conocido (38,93 M) y una perdida de validacion de referencia (3,9174).
- Baseline en estudios comparativos de optimizadores: sirve como punto de comparacion controlado frente a la misma arquitectura entrenada con AdamW, siempre que se parta del mismo dataset y presupuesto de tokens.
- Material docente en cursos de NLP: un modelo de 35,27 M de parametros que cabe en 0,1 GB es adecuado para que el alumnado inspeccione pesos, estados del optimizador y configuracion sin necesidad de infraestructura GPU.
- Pruebas de humo (smoke tests) de pipelines de entrenamiento: al ser tan pequeno, se puede entrenar de principio a fin en pocos minutos para validar tokenizacion, carga de datos, guardado de checkpoints y metricas antes de escalar a modelos mayores.
- Pruebas de integracion de codigo de carga: util para verificar rutinas propias de `torch.load` con `weights_only=False`, reconstruccion del modelo desde `config` y restauracion del estado del optimizador.
- Investigacion sobre corpus paralelos humano/IA: permite estudiar hasta que punto un presupuesto de 38,93 M de tokens es suficiente (o no) para aprender una tarea de traduccion en este dominio, dado el BLEU de 1,58 obtenido.
- Uso como ejemplo negativo documentado: en articulos o informes sobre escalado de tokens y convergencia, ilustra el comportamiento de un modelo claramente infraentrenado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion | 3,9174 |
| BLEU de test | 1,58 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Las dos unicas metricas reportadas (perdida de validacion y BLEU de test) son las que figuran en la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 141 MB en fp32 (35,27 M de parametros x 4 bytes) y unos 71 MB en fp16; el checkpoint completo del repositorio ocupa 0,1 GB, lo que incluye el estado del optimizador.
- GPU recomendadas: cualquiera con mas de 1 GB de memoria. No se requiere A100, H100 ni similar; una GTX 1050 o una GPU integrada moderna son suficientes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier modelo de gama media o baja. Tambien se puede ejecutar en CPU sin problemas de memoria.
- Opciones de despliegue: inferencia en PyTorch puro cargando el checkpoint con `torch.load(..., weights_only=False)` y el codigo del transformer del repositorio. No hay pesos en safetensors ni GGUF, y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-p2-muon | 35,27 M | no disponible | 38,93 M | MIT | PyTorch, carga manual |
| GPT-2 small | 124 M | 1024 | ~40 000 M (WebText) | licencia MIT modificada | safetensors, integrado en `transformers` |
| Pythia-70M | 70 M | 2048 | 300 000 M (The Pile) | Apache 2.0 | safetensors, integrado en `transformers` |

La comparacion debe leerse con cautela: los datos de GPT-2 small y Pythia-70M provienen de su documentacion publica y se incluyen solo como referencia de escala. La diferencia clave no es el numero de parametros sino el presupuesto de entrenamiento: anlp-a2-p2-muon usa 38,93 M de tokens frente a los ordenes de magnitud superiores de las alternativas, lo que explica su perdida de validacion y su BLEU de 1,58. No se dispone de benchmarks comunes que permitan una comparacion directa de calidad.

## Limitaciones y advertencias

- El BLEU de test de 1,58 indica que el modelo no ha aprendido la tarea de traduccion de forma utilizable; no debe emplearse para generar traducciones reales.
- La perdida de validacion de 3,9174 y el presupuesto de solo 38,93 M de tokens (unos 1,1 tokens por parametro) apuntan a un modelo claramente infraentrenado.
- Es esperable un nivel alto de alucinacion y de texto incoherente, aunque no se han publicado evaluaciones formales de este comportamiento.
- No se documentan sesgos especificos, pero el modelo se entreno sobre un corpus paralelo humano/IA sin filtrado descrito, por lo que puede reproducir los sesgos de dicha fuente.
- Solo se declara entrenamiento en ingles; no hay soporte multilingue documentado y no se recomienda su uso en castellano ni en otros idiomas.
- La longitud de contexto no esta publicada, por lo que no se puede planificar su uso en conversaciones multi-turno largas.
- No hay pesos en safetensors ni GGUF, ni integracion con `transformers`, vLLM, llama.cpp, Ollama o TGI; cualquier despliegue exige cargar codigo propio del repositorio con `torch.load(..., weights_only=False)`, lo que implica ejecutar codigo arbitrario y requiere confiar en la fuente.
- La licencia MIT permite uso comercial y modificacion, pero el estado del modelo hace inviable cualquier aplicacion en produccion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa ni mantenimiento conocido.
- Aunque el nombre del modelo sugiere una segunda parte de una entrega academica, no se documentan los resultados de la primera parte ni comparaciones con ella.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p2-muon
- Dataset de entrenamiento (referenciado en la model card): https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos corresponden a contenidos sin relacion con el modelo (cuestionarios de la pagina de inicio de Bing).
