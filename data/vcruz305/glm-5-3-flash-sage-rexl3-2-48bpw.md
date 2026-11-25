# vcruz305/GLM-5.3-Flash-SAGE-REXL3-2.48bpw

## Resumen

GLM-5.3-Flash-SAGE-REXL3-2.48bpw es un empaquetado cuantizado del modelo multimodal nativo GLM-5.3-Flash de Z.ai, preparado por el usuario vcruz305 para su carga con ExLlamaV3. No se trata de un modelo nuevo: es una distribucion de pesos en formato EXL3/REXL3 (trellis) a 2,48 bits por peso de media, generada con un metodo de cuantizacion en precision mixta denominado SAGE, cuyo algoritmo no ha sido publicado. El objetivo es hacer viable en una unica GPU de 128 GB de memoria unificada un modelo que en su version original (FP8) requiere bastante mas espacio.

El modelo base es un transformer multimodal de tipo MoE con 320 mil millones de parametros totales y unos 18 mil millones activos, atencion hibrida (sparse + linear) y conexiones hiperbolicas con restriccion de variedad (manifold-constrained hyper-connections). Este pack concreto declara 53.334.868.062 parametros en sus safetensors (dato del repositorio, inferior al total del modelo original, coherente con un empaquetado parcial o con el conteo efectivo de tensores cuantizados) y ocupa unos 96,5 GiB residentes en GPU, incluyendo vision y texto.

Su relevancia practica esta en la fidelidad declarada frente a la release oficial en FP8: 95,27 % de coincidencia Top-1 y una divergencia KL media de 0,0300 sobre 53.251 tokens evaluados. Esa cifra, si se confirma de forma independiente, situa el pack como una alternativa util para desplegar un modelo de gran tamano en hardware de gama alta unica, aunque con degradacion medible en contexto largo y en matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida (sparse + linear) y manifold-constrained hyper-connections (modelo base) |
| Parametros totales | 53.334.868.062 (segun safetensors de este pack); modelo base: 320B totales |
| Parametros activos | ~18B (modelo base) |
| Longitud de contexto | no disponible (evaluado con prefijos de hasta 17.408 tokens, sin especificar limite maximo) |
| Tipos de cuantizacion | EXL3/REXL3 trellis, perfil 2,48 bpw con K mixto (SAGE) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3/REXL3), 15 shards + `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash, desarrollado por Z.ai, es un transformer de mezcla de expertos (MoE) con 320B parametros totales y ~18B activos, multimodal nativo (texto e imagen) y atencion hibrida que combina mecanismos sparse y lineales, junto con manifold-constrained hyper-connections. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card upstream de Z.ai y no se incluyen en la informacion disponible.

Este repositorio no entrena nada: es un pack de cuantizacion. El autor aplica SAGE, un metodo propio de precision mixta para EXL3 en el que cada tensor recibe un valor `K` distinto y los kernels leen ese `K` directamente del tensor trellis en tiempo de carga. El metodo no esta publicado, por lo que no es posible auditar como se asignan los bits por tensor. El pack se distribuye con `generation_config.json` heredado del modelo original (temperature=1.0, top_p=0.95, reasoning_effort por defecto en `max`).

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de modo de razonamiento (`reasoning_effort`, por defecto `max`).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), al ser un modelo multimodal nativo.
- Razonamiento y resolucion de problemas STEM: la evaluacion por categorias incluye `gpqa_stem`, `math` y `reasoning`.
- Generacion y edicion de codigo, incluida la produccion de parches (`swe_patch`).
- Cumplimiento de instrucciones (`ifeval`) y tareas de conocimiento general (`mmlu_pro`).
- Capacidades multilingues, segun la categoria `multilingual` de la evaluacion del pack.
- Razonamiento multi-paso y contexto largo: se han evaluado secuencias de hasta 17.408 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional multimodal: el modelo acepta imagen y texto en la misma conversacion, por lo que puede responder preguntas sobre capturas, diagramas o documentos escaneados manteniendo el hilo multi-turno.
- Generacion de parches en pipelines de CI/CD: la categoria `swe_patch` muestra un 96,92 % de coincidencia Top-1 con el modelo original, lo que lo hace util para proponer correcciones de codigo que luego pasan por revision y tests automatizados.
- Razonamiento sobre documentacion extensa: con contexto evaluado de hasta 17.408 tokens, sirve para resumir o extraer conclusiones de manuales tecnicos e informes largos, asumiendo la degradacion medida en esa franja (81,39 % Top-1).
- Analisis de conocimiento cientifico: la categoria `gpqa_stem` (91,58 % Top-1 frente al FP8) lo hace apto para preguntas tecnicas de nivel avanzado en dominios STEM, siempre con verificacion humana.
- Atencion al cliente con contenido visual: al ser image-text-to-text, puede gestionar tickets que incluyan capturas de pantalla o fotos de producto, con el contexto suficiente para conversaciones de varias rondas.
- Evaluacion de seguridad y analisis de ciberseguridad: la categoria `cyber` (96,95 % Top-1) permite usarlo en tareas de clasificacion y explicacion de hallazgos, sin sustituir a herramientas especializadas.
- Despliegue en una unica estacion de trabajo de 128 GB: el footprint de ~96,5 GiB permite servir el modelo en un solo dispositivo de memoria unificada, lo que simplifica la operacion frente a despliegues multi-GPU del modelo original.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de tareas, sino metricas de fidelidad del pack frente a la release oficial en FP8 de Z.ai (tokens de turno de asistente, 53.251 evaluados).

| Metrica | Este pack (2,48 bpw) | Release oficial FP8 |
|---|---|---|
| KL media vs FP8 | 0,0300 | 0 (referencia) |
| KL p50 vs FP8 | 0,000198 | 0 (referencia) |
| Top-1 agreement | 95,27 % | 100 % |
| Top-5 agreement | 99,74 % | 100 % |
| Top-5 overlap | 81,39 % | 100 % |
| Footprint residente | ~96,5 GiB | no disponible |

Desglose por categoria (Top-1 / KL media):

| Categoria | Top-1 | KL media |
|---|---|---|
| general | 95,94 % | 0,0192 |
| prose_narrative | 94,05 % | 0,0387 |
| multilingual | 94,35 % | 0,0458 |
| reasoning | 97,05 % | 0,0222 |
| code | 97,03 % | 0,0203 |
| ifeval | 96,58 % | 0,0156 |
| gpqa_stem | 91,58 % | 0,0541 |
| swe_patch | 96,92 % | 0,0185 |
| math | 91,93 % | 0,0424 |
| cyber | 96,95 % | 0,0256 |
| mmlu_pro | 95,38 % | 0,0231 |

Suites de contexto:

| Suite | Contexto | Tokens evaluados | Top-1 | KL media |
|---|---|---|---|---|
| wiki1100 | prefijo de 1.100 tokens | 898 | 90,76 % | 0,0590 |
| long17k | 17.408 tokens | 10.754 | 81,39 % | 0,4532 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible para este pack.

## Requisitos de hardware

- VRAM estimada: ~96,5 GiB residentes (texto + vision), segun el autor.
- Dispositivo objetivo: una unica GPU o dispositivo de memoria unificada de clase 128 GB.
- GPU recomendadas: no disponible de forma explicita; por capacidad de memoria encajan aceleradores de 128 GB o superiores. No cabe en GPUs de consumo de 24 GB (RTX 4090) ni de 48 GB.
- Opciones de despliegue: ExLlamaV3 es el unico runtime indicado (carga via `Config.from_directory` / `Model.from_config`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato EXL3 no es compatible con ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash-SAGE-REXL3-2.48bpw (este pack) | 53,3B en safetensors; base 320B/18B activos | no disponible | EXL3, MIT | ~96,5 GiB, 95,27 % Top-1 vs FP8 |
| zai-org/GLM-5.3-Flash (oficial FP8) | 320B totales / ~18B activos | no disponible | FP8, MIT | Referencia de calidad; requiere mas memoria |
| Otras cuantizaciones EXL3 del mismo modelo base | no disponible | no disponible | EXL3 | No se han encontrado en la informacion proporcionada |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,48 bpw introduce degradacion medible: 4,73 % de perdida de coincidencia Top-1 global y caida acusada en contexto largo (81,39 % Top-1 y KL media de 0,4532 en `long17k`).
- Las categorias mas afectadas son `math` (91,93 % Top-1, 83,54 % en answer-only) y `gpqa_stem` (91,58 %), por lo que no es recomendable para produccion matematica o cientifica sin verificacion.
- El metodo SAGE no esta publicado: no es posible auditar la asignacion de bits por tensor ni reproducir el proceso de cuantizacion.
- El repositorio esta marcado como `gated: true` con revision manual de solicitudes, lo que anade friccion al despliegue.
- El conteo de parametros del pack (53,3B) difiere del total del modelo base (320B); conviene verificar que el pack cubre todos los tensores antes de usarlo en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico de este pack; aplican los del modelo base.
- La licencia es MIT, igual que el modelo base, por lo que se permite uso comercial, pero el autor exige citar a Z.ai.
- Solo es cargable con ExLlamaV3; no hay soporte declarado para otros runtimes, lo que limita las opciones de infraestructura.
- Los kernels leen `K` de cada tensor trellis en carga: cualquier conversion o fusion de tensores fuera de ExLlamaV3 puede romper el pack.

## Enlaces

- Repositorio del pack: https://huggingface.co/vcruz305/GLM-5.3-Flash-SAGE-REXL3-2.48bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Perfil del autor: https://huggingface.co/vcruz305
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
