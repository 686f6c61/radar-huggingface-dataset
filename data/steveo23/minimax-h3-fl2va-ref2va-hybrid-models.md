# steveo23/Minimax-H3-fl2va-ref2va-hybrid-models

## Resumen

MiniMax H3 hybrid (fl2va + ref2va) es un modelo comunitario de generacion de video con audio nativo, creado por el usuario steveo23 mediante la fusion a nivel de tensor de dos checkpoints oficiales de MiniMax: `MiniMax-H3-fl2va` y `MiniMax-H3-ref2va`. No es un entrenamiento nuevo ni un fine-tuning: es un merge quirurgico de pesos que busca resolver un compromiso concreto de la familia H3 original. El checkpoint `fl2va` ofrece mayor calidad visual y sonora, pero solo admite condicionamiento por primer/ultimo fotograma; el checkpoint `ref2va` es el unico que soporta condicionamiento por referencias multimodales (imagen, video y audio), pero arrastra un problema de calidad de entrenamiento que degrada su salida incluso en tareas sin referencia.

La base tecnica del merge es una comparacion tensor a tensor de ambos checkpoints: la gran mayoria de los pesos (proyecciones QKV de atencion, salidas de atencion, MLPs, RMSNorms, proyecciones de parches, rotary position embeddings y el token refiner) son identicos bit a bit o practicamente identicos, con similitud coseno ≥ 0,9997. Las diferencias relevantes se concentran en las proyecciones `adaln_proj` por bloque, que son las que inyectan las senales de modalidad (texto, audio, video y referencia) en el flujo residual. Aprovechando esa localizacion, el autor toma como base `fl2va` y sustituye unicamente las `adaln_proj` de un rango de bloques finales por las de `ref2va`.

El resultado son cuatro variantes que solo se diferencian en cuantos bloques finales (de 50 totales) heredan las `adaln_proj` de `ref2va`: b30-49, b25-49, b20-49 y b15-49. Cuantos mas bloques se sustituyen, mayor capacidad de adherencia a la referencia y menor calidad visual/audio bruta. Es un modelo de nicho, orientado a flujos de trabajo con condicionamiento por referencia que antes obligaban a usar `ref2va` asumiendo su perdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) conjunto de audio y video, con modulacion AdaLN por bloque |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (variantes derivadas de bases "pruned int8-convrot") |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

Otros datos verificables: repositorio de 83,9 GB, 50 bloques transformer en el backbone, pipeline declarado `text-to-video`, 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion y ultima actualizacion 2026-09-29.

## Arquitectura y entrenamiento

La arquitectura subyacente es un diffusion transformer conjunto de audio y video, heredado de MiniMax H3. Cada bloque transformer incorpora proyecciones `adaln_proj` (adaptive layer norm) que modulan el flujo residual en funcion de la modalidad de condicionamiento: texto, audio, video y referencia. El backbone incluye ademas proyecciones QKV y de salida de atencion, MLPs, RMSNorms, proyecciones de parches, rotary position embeddings, un token refiner y cabezas de salida de video y audio. Sobre este modelo este repositorio no entrena nada: los pesos proceden integramente de los dos checkpoints oficiales.

El proceso de creacion es un merge tensor a tensor. Partiendo de la comparacion entre `fl2va` y `ref2va`, el autor conserva de `fl2va` todas las proyecciones de atencion, MLPs, normalizaciones, token refiner, cabezas de salida, las `adaln_proj` de los bloques tempranos y la proyeccion AdaLN final; y sustituye por las de `ref2va` las `adaln_proj` de un rango de bloques tardios. Los cuatro ficheros publicados corresponden a los rangos 30-49, 25-49, 20-49 y 15-49 (los ultimos 20, 25, 30 y 35 bloques de 50). No se documenta el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en los modelos originales, porque este repositorio no aporta entrenamiento propio.

## Capacidades

- Generacion de video a partir de texto, imagen, video o audio como entrada (`text-to-video`, `image-to-video`).
- Generacion conjunta de audio y video en un mismo paso de difusion.
- Condicionamiento por primer y ultimo fotograma, heredado de la via `fl2va`.
- Condicionamiento por referencia multimodal (imagen, video y audio de referencia), la capacidad exclusiva de `ref2va` que este merge intenta preservar.
- Control gradual del equilibrio entre fidelidad a la referencia y calidad de salida, seleccionando la variante b30-49, b25-49, b20-49 o b15-49.
- Uso como reemplazo directo de `ref2va` en flujos ya existentes de generacion condicionada por referencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue, al no ser un modelo de lenguaje.

## Casos de uso

- Consistencia de personaje en series de video: alimentando una imagen de referencia del personaje, las variantes b20-49 o b15-49 mantienen sus rasgos entre planos, algo que `fl2va` no puede hacer por si solo y que `ref2va` hacia perdiendo calidad general.
- Publicidad de producto con imagen de catalogo: se condiciona con la foto del producto (variante b25-49 o b30-49) para generar clips con movimiento y audio sin deformar el articulo, priorizando la fidelidad visual del resultado.
- Doblaje y re-sintesis de audio con referencia de voz: usando una referencia de audio, se genera video con audio asociado manteniendo el timbre de referencia, util en localizacion de contenido.
- Transferencia de estilo a partir de un clip de referencia: se toma un video de referencia con la estetica deseada y se genera contenido nuevo que la replica, apoyandose en la via de condicionamiento por referencia de video.
- Extension y continuacion de clips existentes: combinando el condicionamiento por ultimo fotograma de `fl2va` con referencias de estilo, util para alargar tomas manteniendo coherencia visual y sonora.
- Previsualizacion en produccion audiovisual: generacion rapida de storyboards animados con audio a partir de referencias de direccion de arte, iterando entre variantes segun si prima la fidelidad a la referencia o la calidad final.
- Prueba virtual de producto o vestuario: condicionando con una imagen de referencia del articulo o de la persona, se generan planos alternativos sin reentrenar el modelo.
- Prototipado de avatares con audio de referencia: generacion de un avatar hablante a partir de una referencia de imagen y una referencia de voz, empleando la variante b20-49 cuando la adherencia a la referencia es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, similitud de referencia, MOS de audio ni comparativas numericas con otros modelos); el autor describe el equilibrio entre variantes como una valoracion subjetiva obtenida comparando salidas entre rangos de bloques y combinaciones de presets.

## Requisitos de hardware

- El repositorio completo ocupa 83,9 GB, pero contiene varias variantes; el peso individual de cada fichero no esta documentado.
- Al estar cuantizados en int8, los pesos ocupan aproximadamente 1 byte por parametro, de modo que la VRAM necesaria es del orden del tamano del fichero mas los buffers de activaciones de difusion. La estimacion concreta de VRAM por variante es no disponible.
- GPU recomendadas: por tamano de repositorio, se sitúa en la gama de GPUs de datacenter con memoria amplia (A100 80 GB, H100 80 GB). No hay confirmacion oficial de que quepa en GPUs de consumo.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; requiere verificar el tamano de cada safetensors individual antes de asumirlo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es safetensors y el pipeline declarado es `text-to-video`, por lo que se asume ejecucion mediante un runtime de difusion compatible con MiniMax H3. El runtime concreto es no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Condicionamiento por referencia | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steveo23/Minimax-H3-fl2va-ref2va-hybrid-models (b25-49 recomendada) | DiT audio+video fusionado | Si, parcial (via `adaln_proj` de bloques tardios) | Intermedia, ajustable por variante | other | HuggingFace, autor steveo23 |
| MiniMax-H3-fl2va | DiT audio+video | No | La mas alta del par original | no disponible | Checkpoint oficial de MiniMax |
| MiniMax-H3-ref2va | DiT audio+video | Si, completa | Degradada por un problema de calidad de entrenamiento | no disponible | Checkpoint oficial de MiniMax |

Datos comparativos de parametros, contexto y benchmarks: no disponibles para ninguno de los tres. Existen repositorios con el mismo nombre publicados por otros usuarios (smhfacct, xtanqn), cuya relacion exacta con este repositorio no se puede verificar con la informacion disponible.

## Limitaciones y advertencias

- El merge no puede superar la calidad de `fl2va` en generacion sin referencia: la mayoria de pesos son identicos a los de `fl2va`, por diseno del autor.
- El equilibrio entre fidelidad a la referencia y calidad de salida es gradual y subjetivo; ninguna variante es uniformemente mejor que otra.
- El problema de calidad de entrenamiento de `ref2va` no se corrige, solo se aisla parcialmente sustituyendo sus `adaln_proj` tardias por las de `fl2va`.
- Al ser un merge derivado de checkpoints int8 "pruned", la fidelidad numerica respecto a los pesos originales en precision completa no esta garantizada ni documentada.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere revisar la licencia de los modelos base de MiniMax antes de desplegar en produccion.
- Riesgo de alucinacion visual y sonora inherente a los modelos de difusion de video: no se documentan tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados: no disponibles. No hay informacion sobre el tratamiento de prompts en castellano.
- Modelo sin adopcion registrada (0 descargas, 0 likes) y sin benchmarks publicados; no se recomienda como base de produccion sin validacion propia.
- La fecha de creacion y actualizacion del repositorio es 2026-09-29 y no consta mantenimiento posterior.
- No se documentan requisitos minimos de VRAM ni runtimes verificados, lo que anade riesgo operativo a la puesta en marcha.

## Enlaces

- Repositorio del modelo: https://huggingface.co/steveo23/Minimax-H3-fl2va-ref2va-hybrid-models
- Repositorio con nombre equivalente atribuido a smhfacct: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Repositorio con nombre equivalente atribuido a xtanqn: https://huggingface.co/xtanqn/Minimax-H3-fl2va-ref2va-hybrid-models
- Model card de MiniMax H3 (arquitectura, FL2VA, Ref2VA y pipeline 2K): https://minimax3.org/minimax-h3-video-model
- Pagina sobre el repositorio oficial en HuggingFace y comparativa FL2VA vs Ref2VA: https://minimax3.org/minimax-h3-huggingface
- Ficha de resumen del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/minimax-h3-fl2va-ref2va-hybrid-models-smhfacct
