# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.5bpw

## Resumen

Qwen3.5-397B-A17B-VQ-3.5bpw es una cuantización por cuantización vectorial (VQ) del modelo base Qwen/Qwen3.5-397B-A17B, publicada por el usuario TheDrainFlorist. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión: pesos del modelo original refitados a una tasa de 3,5 bits por peso (bpw) mediante libretas de código vectoriales, manteniendo la arquitectura MoE original (etiqueta `qwen3_5_moe`) sin parches ni modificaciones al runtime estándar de `mlx-lm`.

El interés de esta publicación reside en su metodología de medición y en el objetivo declarado: ofrecer la cuantización de mayor fidelidad posible de este modelo para máquinas Apple Silicon con memoria abundante. El autor publica una escalera de compresión (de 2,2 a 3,5 bpw) evaluada con divergencia KL sobre logits cacheados del profesor bf16, en lugar de perplejidad, argumentando que la perplejidad no es monótona en calidad dentro de esta familia.

La build 3.5bpw ocupa 141,2 GiB solo en pesos de texto (147,4 GiB de descarga completa, incluyendo torre de visión y cabeza MTP), y requiere una máquina Apple Silicon con al menos 192 GB de memoria unificada, o dos o más Macs coordinadas mediante Knurlogic. No cabe en un equipo de 128 GB. No se han ejecutado benchmarks de tarea sobre esta revisión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (`qwen3_5_moe`), 60 capas; cuantizacion vectorial (VQ) sobre el modelo base Qwen3.5-397B-A17B |
| Parametros totales | 68.727.817.360 segun los tensores safetensors del repo (la nomenclatura del modelo base indica 397B; discrepancia no explicada en la informacion disponible) |
| Parametros activos | no disponible (el nombre del base sugiere A17B, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion vectorial (VQ) mixed-codebook; 3,5 bits por peso (bpw). Builds hermanas de la misma familia: 2,2 / 2,4 / 2,6 / 3,1 bpw. Torres de vision y cabeza MTP en precision de origen |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); incluye `model.py` propio con el runtime de decodificacion VQ, declarado en `config.json` mediante `model_file` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de 60 capas, identificado por la etiqueta `qwen3_5_moe`. Esta publicacion no entrena nada: parte del checkpoint `Qwen/Qwen3.5-397B-A17B` y le aplica cuantizacion vectorial. En concreto, la build 3.5bpw es una revision v2 de codebook mixto derivada de la VQ-3.1bpw del mismo autor. Las proyecciones de los expertos enrutados (gate/up/down) de las capas 42 a 59 (las 18 ultimas de 60) se reajustan a d2/K256 a partir del profesor bf16, mientras que las capas 0 a 41 conservan exactamente los bytes de la build 3.1. Se aplica `vq-skipzero` a los 138 modulos elegibles.

La particularidad tecnica mas relevante es que las libretas de codigo VQ deben replicarse entre maquinas, no trocearse: un runtime que las divida produce texto fluido pero sin sentido en lugar de lanzar un error. El artefacto incluye un `model.py` con una guarda que aborta si una libreta troceada llega al forward pass, de modo que un cluster mal configurado falla de forma ruidosa. La publicacion incluye ademas la torre de vision completa (333 tensores, precision de origen, 0,85 GiB) y una cabeza de borrador MTP opcional (`mtp-head-q6.safetensors`, 5,41 GiB) para decodificacion especulativa, que funciona tambien en cluster y no altera la salida gracias a rejection sampling.

## Capacidades

- Generacion de texto y conversacion multi-turno, en la modalidad marcada por el pipeline `text-generation` y las etiquetas `conversational` y `text-generation`.
- Razonamiento y generacion de codigo: la evaluacion propia del autor mide divergencia sobre un corpus de codigo publico, lo que indica uso previsto en tareas de programacion.
- Vision: el artefacto incluye la torre de vision completa a precision de origen; Knurlogic la carga directamente sin necesidad de `mlx-vlm`. La propia `mlx-lm` es solo texto para esta arquitectura y la ignora.
- Decodificacion especulativa con cabeza MTP propia, incluida en el repo y cargada automaticamente por Knurlogic, incluso repartida entre varias maquinas.
- Servido mediante API compatible con OpenAI, Anthropic y Ollama a traves del servidor de Knurlogic (identificador de modelo `local`).
- Idiomas: unicamente ingles declarado. No se documenta soporte multilingue.
- No se documenta soporte de tool calling, function calling ni flujos de agente, ni modo de razonamiento explicito, en la informacion disponible.

## Casos de uso

- Inferencia local de gran tamano en Apple Silicon: el caso de uso central del artefacto es ejecutar un modelo MoE de gran escala en una maquina con 192 GB o mas de memoria unificada, sin GPU dedicada ni instancias en nube.
- Despliegue dividido entre dos Macs: con Knurlogic se reparten las capas entre dos equipos (por ejemplo 96 GB + 128 GB) conectados por Thunderbolt, lo que permite reutilizar hardware ya existente en lugar de comprar un unico equipo de gama alta.
- Generacion de codigo asistida en local: la familia se evalua especificamente sobre un corpus de codigo publico, de modo que es adecuada para completado y explicacion de codigo en entornos sin conectividad o con requisitos de confidencialidad.
- Redaccion y edicion de prosa en ingles: el corpus de prosa es uno de los tres ejes de evaluacion declarados, lo que orienta su uso hacia tareas de redaccion larga y edicion de texto.
- Analisis de imagenes combinado con texto: la torre de vision a precision completa permite entrada multimodal cuando el artefacto se sirve con Knurlogic, util para descripcion de documentos escaneados o capturas.
- Investigacion sobre cuantizacion: el artefacto y su escalera de builds (2,2 a 3,5 bpw) sirven como material de estudio para comparar tecnicas de compresion VQ frente a cuantizacion afina, con metodologia de evaluacion publicada.
- Laboratorio de decodificacion especulativa: la cabeza MTP incluida permite experimentar con speculative decoding dentro del mismo entorno local y en configuraciones multi-maquina.

## Benchmarks y rendimiento

No se han ejecutado benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) sobre esta build: el autor lo indica explicitamente. La unica metrica publicada es divergencia KL respecto al profesor bf16 de la propia familia (top-64 cacheados, 12.288 tokens por corpus, tres corpus internos: prosa, codigo publico y literario). Los valores se expresan en millinats por token; mas bajo es mas cercano a bf16.

| Build | GiB (texto) | Prosa | Codigo | Literario | Media |
|---|---|---|---|---|---|
| VQ-2.2bpw (v2, mixto) | 88,7 | 276,4 | 98,6 | 183,1 | 186,0 |
| VQ-2.4bpw | 95,7 | 230,4 | 87,7 | 134,1 | 150,7 |
| VQ-2.6bpw | 105,5 | 164,1 | 58,1 | 60,5 | 94,2 |
| VQ-3.1bpw (re-evaluada 2026-10-02) | 125,3 | 91,2 | 33,3 | 16,8 | 47,1 |
| **VQ-3.5bpw (esta)** | **141,2** | **58,7** | **24,9** | **5,3** | **29,6** |
| spicyneuron 2.6bit (afina) | 120,6 | 332,1 | 98,4 | 241,0 | 223,8 |
| spicyneuron 3.5bit (afina) | 165,6 | 87,0 | 28,6 | 16,8 | 44,1 |

Deltas emparejados sobre posiciones identicas, segun el autor: frente a la VQ-3.1, esta build mejora en los tres corpus (prosa -32,5 con t -18,6; codigo -8,4 con t -9,2; literario -11,5 con t -7,6). Frente a spicyneuron 3.5bit, mejora en prosa (t 13,2) y literario (t 7,9) con 24,4 GiB menos de texto; en codigo, 24,9 frente a 28,6 no es una diferencia significativa (t 2,0) y el autor lo reporta como empate. La velocidad de esta revision no se ha medido y no se reclama ninguna cifra.

## Requisitos de hardware

- VRAM / memoria: 141,2 GiB de pesos de texto residentes con `mlx-lm` (que no carga la torre de vision). Descarga completa de 147,4 GiB en disco. La memoria residente queda unos 0,85 GiB por debajo de la cifra de disco cuando no se carga la torre.
- No cabe en una maquina de 128 GB de memoria unificada. El autor lo indica de forma explicita.
- Opcion de un solo equipo: Apple Silicon con 192 GB o mas de memoria unificada.
- Opcion multi-equipo: dos o mas Macs con Knurlogic, por ejemplo 96 GB + 128 GB sobre Thunderbolt. Esta build se verifico en una configuracion de dos Macs con reparto de capas.
- GPU dedicadas (A100, H100, RTX 4090): no aplica. El runtime es MLX sobre Apple Silicon; no se documenta soporte CUDA.
- Despliegue: `mlx-lm` >= 0.31.3 (solo texto) o Knurlogic, que calcula la configuracion, comprueba que el modelo cabe antes de cargarlo, gestiona el reparto en cluster y expone endpoints compatibles con OpenAI, Anthropic y Ollama. `mlx-vlm` no es necesario para las imagenes.
- vLLM, llama.cpp, Ollama y TGI: no soportados segun la informacion disponible; el artefacto depende del runtime VQ que viaja dentro del propio repo.
- Latencia y throughput: no medidos para esta revision. El autor indica que, en otras builds de la familia, hay poco margen para que la decodificacion especulativa aporte mejora, y espera paridad.

## Comparativa con modelos similares

| Modelo | Tamano texto | Prosa (KL) | Codigo (KL) | Literario (KL) | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| VQ-3.5bpw (esta) | 141,2 GiB | 58,7 | 24,9 | 5,3 | VQ mixed-codebook, mlx-lm | apache-2.0 | HuggingFace, runtime MLX |
| VQ-3.1bpw | 125,3 GiB | 91,2 | 33,3 | 16,8 | VQ, misma familia | apache-2.0 | HuggingFace, runtime MLX |
| VQ-2.6bpw | 105,5 GiB | 164,1 | 58,1 | 60,5 | VQ, misma familia | apache-2.0 | HuggingFace, runtime MLX |
| spicyneuron 3.5bit | 165,6 GiB | 87,0 | 28,6 | 16,8 | Cuantizacion afina | no disponible | HuggingFace |

Comparativa limitada a builds de la misma familia y a una cuantizacion afina de referencia, que son las que el autor mide con la misma cache y las mismas posiciones. No hay datos de benchmarks de tarea ni comparacion con el modelo base sin cuantizar en la informacion disponible.

## Limitaciones y advertencias

- No se han ejecutado benchmarks de tarea sobre esta build; toda la evidencia de calidad es divergencia KL sobre logits cacheados, no rendimiento en tareas reales.
- La metrica principal (KL) mide fidelidad al profesor bf16, no utilidad: una build fiel puede seguir siendo insuficiente para una tarea concreta.
- El corpus de prosa muestra la degradacion mas alta (58,7 millinats), muy por encima del codigo (24,9) y el literario (5,3). El comportamiento es desigual por dominio.
- La comparacion en codigo frente a spicyneuron 3.5bit se reporta como empate estadistico; no debe interpretarse como ventaja.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, y el castellano no esta cubierto por la model card.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan medidas de mitigacion especificas en este artefacto.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para esta build. El entrenamiento original corresponde a Qwen, no al autor de la cuantizacion.
- Restricciones tecnicas de despliegue: requiere Apple Silicon y MLX. No hay ruta CUDA. Las libretas VQ no pueden trocearse entre maquinas; hacerlo produce texto fluido pero incorrecto, y aunque el repo incluye una guarda que aborta, cualquier runtime alternativo que no la respete fallara en silencio.
- Requisito de memoria muy alto: minimo 192 GB en un solo equipo, o dos o mas Macs. Inviable en hardware de consumo convencional.
- La cabeza MTP declara paridad, no mejora, en esta familia; su per-rung no esta medido para este artefacto.
- Licencia apache-2.0, permisiva para uso comercial, pero condicionada por lo que establezca la licencia del modelo base Qwen/Qwen3.5-397B-A17B, que no se detalla en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento del registro; sin validacion externa de terceros.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Build predecesora VQ-3.1bpw: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.1bpw
- Knurlogic (runtime y servidor): https://github.com/noahzelezny/Knurlogic
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web disponibles.
