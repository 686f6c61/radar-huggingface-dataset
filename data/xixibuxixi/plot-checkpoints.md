# xixibuxixi/plot-checkpoints

## Resumen

`xixibuxixi/plot-checkpoints` es un repositorio de checkpoints del proyecto PLOT, descrito en su repositorio de GitHub como "Multi-Inhabitant World Models with Writable 3D Memory". No se trata de un modelo de lenguaje de propósito general ni de un modelo conversacional: es un artefacto de investigación que agrupa pesos y estados de entrenamiento de las etapas M1 y M3 de una familia de modelos de mundo. El autor es el usuario de HuggingFace `xixibuxixi` (Cauthy) y el repositorio se publica como "private checkpoint repository", con 0 descargas y 0 likes en el momento de la consulta.

El contenido declarado incluye el checkpoint M3 Simple step 7365 (modelo y optimizador), el checkpoint M1 `m1/m1_flow_2nodes_b32_eval10k_v2/step_001476000.pt`, un fichero `SELECTED.json` con hashes y procedencia, y documentación de dependencias externas (`TRAINING_ASSETS.md`). Entre esas dependencias se citan un VAE de píxeles, un backbone de vídeo opcional, vocabularios separados, normalización latente y una caché de texto M4. El repositorio ocupa 32,1 GB y sus pesos se distribuyen en formato safetensors, además de un checkpoint M1 en formato `.pt`.

Su relevancia es estrictamente de investigación: documenta el estado actual de una exploración interna (M3), conserva revisiones históricas y fija la procedencia exacta de los artefactos, pero no publica licencia, idiomas, pipeline, parámetros, contexto ni resultados de evaluación. Cualquier uso fuera del contexto del proyecto PLOT requiere contactar con el autor y asumir la ausencia de garantías técnicas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio se enmarca en el proyecto PLOT: modelos de mundo multi-inhabitante con memoria 3D escribible; no se detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se publican como safetensors y `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la ficha de HuggingFace no declara licencia) |
| Formato de pesos | safetensors (etiqueta del repositorio) y `.pt` para el checkpoint M1 `step_001476000.pt` |
| Tamano del repositorio | 32,1 GB |
| Artefactos incluidos | M3 Simple step 7365 (modelo + optimizador) y M1 `m1_flow_2nodes_b32_eval10k_v2/step_001476000.pt` |
| Documentacion de procedencia | `SELECTED.json` (hashes y procedencia) y `TRAINING_ASSETS.md` (guia de dependencias M2) |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / ultima actualizacion | 2026-09-13 / 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo que si se documenta es la organizacion del proyecto en etapas (M1, M2, M3 y M4) y una serie de componentes del pipeline de entrenamiento: un VAE de píxeles, un backbone de video opcional, vocabularios separados, normalizacion latente y una cache de texto M4. El nombre del checkpoint M1 (`m1_flow_2nodes_b32_eval10k_v2`) sugiere el uso de formulaciones de tipo flow, aunque esto es una inferencia a partir del nombre del fichero y no un dato confirmado por el autor.

En cuanto a los datos de entrenamiento, solo se menciona el dataset `fixed_skins_20260917` (descrito como "repaired") como dependencia obligatoria y separada del repositorio de checkpoints. No se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se detalla ningun mecanismo de innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). El checkpoint M3 corresponde al paso 7365; los checkpoints M3 step 26000 y el encoder de identidad step 3300 fueron eliminados de la rama actual a peticion del propietario, aunque las revisiones historicas siguen accesibles.

## Capacidades

- Modelado de mundo multi-inhabitante: el proyecto se define como "Multi-Inhabitant World Models with Writable 3D Memory", por lo que la capacidad prevista es la simulacion de entornos con multiples agentes y memoria 3D persistente y modificable.
- Generacion condicionada por latentes: el pipeline descrito utiliza un VAE de píxeles y normalizacion latente, lo que implica generacion a partir de representaciones latentes.
- Condicionamiento textual via cache M4: se cita una "M4 text cache" como dependencia, lo que apunta a algun tipo de condicionamiento por texto dentro del pipeline.
- Reanudacion de entrenamiento: el checkpoint M3 incluye modelo y optimizador, lo que permite continuar el entrenamiento desde el paso 7365.
- Procesamiento de video: se menciona un "optional video backbone" como parte de las dependencias M2.
- Generacion de texto conversacional: no documentada. No hay evidencia de que el modelo sea un LLM de instrucciones.
- Razonamiento, codigo, matematicas: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado en el sentido de agentes basados en herramientas; el termino "multi-inhabitant" se refiere a agentes dentro del modelo de mundo, no a orquestacion de herramientas.
- Capacidades multilingues: no disponible.
- Vision, audio, modo "thinking": no documentado, salvo la mencion al VAE de píxeles y al backbone de video.

## Casos de uso

- Reproduccion del hito M3: cargar el checkpoint `m3_simple_fulltrain_player_flow_step7365` junto con el VAE de píxeles y el dataset `fixed_skins_20260917` para reproducir exactamente el estado de exploracion actual del proyecto. Es el artefacto que el propio repositorio marca como vigente.
- Entrenamiento continuado (continual training): al incluir los estados del optimizador, el checkpoint permite reanudar el entrenamiento desde el paso 7365 sin reiniciar la dinamica del optimizador, algo habitual en experimentos de modelos de mundo de larga duracion.
- Ablaciones entre etapas M1 y M3: comparar el comportamiento del checkpoint M1 (`step_001476000.pt`) con el M3 (step 7365) para estudiar como evoluciona la representacion del mundo y la memoria 3D entre etapas del pipeline.
- Investigacion sobre representaciones latentes: el uso de vocabularios separados y normalizacion latente permite experimentar con el espacio latente (interpolaciones, sustituciones de latentes, analisis de la VAE de píxeles) usando los pesos publicados.
- Evaluacion de consistencia a largo plazo en modelos de mundo: medir si la memoria 3D escribible mantiene coherencia cuando se simulan multiples habitantes durante horizontes largos, aprovechando que el checkpoint corresponde a un entrenamiento completo ("fulltrain").
- Integracion con adaptadores de datos del repositorio GitHub: el proyecto PLOT publica adaptadores de datos, puntos de entrada de entrenamiento e indices, de modo que el checkpoint puede insertarse en esos pipelines para experimentos con nuevos datasets.
- Auditoria de procedencia en entornos de investigacion reproducible: `SELECTED.json` contiene hashes exactos de los artefactos, lo que permite verificar la integridad de los pesos en laboratorios que exigen trazabilidad de las revisiones utilizadas.
- Estudio del condicionamiento textual del pipeline M4: la cache de texto M4 es una dependencia separada, por lo que el checkpoint sirve para analizar como afecta el condicionamiento textual a la generacion dentro de este marco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 32,1 GB. A ello hay que sumar el VAE de píxeles y el dataset `fixed_skins_20260917`, que se distribuyen por separado y cuyo tamano no se especifica.
- VRAM para inferencia: no disponible. El repositorio mezcla pesos de modelo con estados de optimizador, por lo que el espacio necesario en inferencia es inferior al tamano total del repositorio, pero el desglose no esta documentado.
- Estimacion orientativa (no confirmada por el autor): si el conjunto modelo mas optimizador del M3 ocupa la mayor parte de los 32,1 GB, los pesos de inferencia en FP16 podrian quedar por debajo de los 24 GB de VRAM de una RTX 3090 o RTX 4090. Se trata de una extrapolacion a partir del tamano del repositorio, no de un dato verificado.
- GPU recomendadas: no disponible. Como referencia generica, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100 80 GB) cubriria con margen cualquier peso de inferencia que quepa en un repositorio de 32,1 GB en precision de 16 bits, pero esto no puede confirmarse sin conocer el desglose de artefactos.
- Compatibilidad con GPU de consumo: indeterminada por falta de datos de parametros y precision.
- Opciones de despliegue: los servidores habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables, ya que no hay GGUF, no hay arquitectura compatible documentada y el proyecto se ejecuta mediante su propio codigo. La via de referencia es el repositorio de GitHub `xixibuxixi23/Plot`, que incluye adaptadores de datos, puntos de entrada de entrenamiento e indices.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables publicados con especificaciones verificables. Los resultados de busqueda devuelven plataformas genericas de checkpoints (Civitai) y perfiles del mismo autor, sin alternativas tecnicamente equivalentes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `xixibuxixi/plot-checkpoints` | no disponible | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia: la ficha de HuggingFace no declara licencia alguna, por lo que no puede asumirse permiso de uso comercial ni de redistribucion. Cualquier uso en produccion requiere autorizacion explicita del autor.
- Repositorio marcado como privado: el propio README lo describe como "private checkpoint repository", lo que indica un artefacto pensado para circulacion interna del proyecto.
- Dependencias externas obligatorias: el VAE de píxeles y el dataset `fixed_skins_20260917` no estan incluidos y son necesarios para ejecutar el modelo. Sin ellos el checkpoint es inutilizable.
- Inestabilidad de la rama: checkpoints anteriores (M3 step 26000 y el encoder de identidad step 3300) fueron eliminados de la rama actual a peticion del propietario. La reproducibilidad depende de usar revisiones historicas o de apoyarse en `SELECTED.json`.
- Riesgo de acoplamiento incorrecto: la propia documentacion advierte que "M2 and M3 item ID 12 differ", por lo que la correspondencia entre modulos debe verificarse antes de combinarlos.
- Ausencia total de evaluacion: no hay benchmarks, no hay metricas de calidad ni comparaciones publicadas. No es posible estimar el rendimiento esperado.
- Sesgos: no disponible. Al haberse entrenado sobre un dataset especifico del proyecto (`fixed_skins_20260917`), es previsible que herede las caracteristicas y desequilibrios de ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado. En modelos de mundo generativos existe riesgo de deriva y de inconsistencias a largo plazo, pero no se ha documentado ningun estudio al respecto.
- Limitaciones de contexto e idioma: no disponibles. No se especifica ventana de contexto ni cobertura linguistica.
- Restricciones de uso en produccion: dada la falta de licencia, de documentacion de arquitectura, de benchmarks y de garantias de soporte, este repositorio no es adecuado como componente de un sistema en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xixibuxixi/plot-checkpoints
- README del checkpoint M3 actual: https://huggingface.co/xixibuxixi/plot-checkpoints/blob/main/m3/m3_simple_fulltrain_player_flow_step7365/README.md
- Hashes y procedencia (`SELECTED.json`): https://huggingface.co/xixibuxixi/plot-checkpoints/blob/main/SELECTED.json
- Guia de dependencias M2 y entrenamiento (`TRAINING_ASSETS.md`): https://huggingface.co/xixibuxixi/plot-checkpoints/blob/main/TRAINING_ASSETS.md
- Repositorio de codigo PLOT: https://github.com/xixibuxixi23/Plot
- Perfil del autor en HuggingFace: https://huggingface.co/xixibuxixi
- Modelos publicados por el autor: https://huggingface.co/xixibuxixi/models
- Datasets publicados por el autor: https://huggingface.co/xixibuxixi/datasets
