# vcruz305/GLM-5.3-EXL3-3.38bpw-h8

## Resumen

GLM-5.3-EXL3-3.38bpw-h8 es una cuantización de 3 bits del modelo zai-org/GLM-5.3, publicada por el usuario vcruz305 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos en formato EXL3 (ExLlamaV3) con un bitrate nominal de 3,38 bits por peso (3,39 bpw incluyendo escalas) y una cabeza de salida en 8 bits. El modelo base, GLM-5.3, es el modelo insignia de Z.ai para codificación y tareas de horizonte largo, con una ventana de contexto de 1M de tokens y licencia MIT.

El interés de esta ficha radica en que permite evaluar hasta qué punto un modelo MoE de gran tamano puede comprimirse agresivamente conservando todos los expertos enrutados. La model card indica explícitamente que se mantienen los 256 expertos enrutados, que el modulo MTP (multi-token prediction) no esta incluido y que el pack esta dimensionado para ejecutarse en cuatro NVIDIA DGX Spark con una cache KV en Q4 y contexto de 1M de tokens.

Se trata de un artefacto muy reciente (publicado el 30 de septiembre de 2026), con cero descargas y cero likes en el momento de la consulta, y con la evaluación de calidad todavia pendiente segun su autor. Ademas, requiere un fork especifico de exllamav3 en una revision concreta, por lo que no funciona con la version estandar de la libreria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta de HuggingFace `glm_moe_dsa` |
| Parametros totales | 159.499.668.480 (aprox. 159,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M de tokens (según el modelo base y el dimensionamiento del pack) |
| Tipos de cuantizacion | EXL3 a 3,38 bpw nominal (3,39 bpw con escalas), cabeza en 8 bits, SAGE mixed-K |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio de la cuantización; el modelo base GLM-5.3 se distribuye bajo licencia MIT |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |
| Expertos enrutados | 256, todos conservados |
| Tamano del repositorio | 319,1 GB (319.069.111.923 bytes) |
| Modulo MTP | no incluido |
| Evaluacion de calidad | pendiente segun la model card |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base ni de la cuantización. La etiqueta `glm_moe_dsa` de HuggingFace indica que GLM-5.3 emplea una arquitectura de mezcla de expertos con atencion dispersa (DSA), aunque no se dispone de detalles tecnicos publicados en el material consultado sobre el numero de capas, la dimension oculta, el numero de expertos activados por token ni la composicion del dataset de preentrenamiento o de las fases de alineacion (RLHF, DPO u otras).

Lo que si documenta la model card de esta cuantización es el procedimiento de compresion: se ha aplicado una receta SAGE mixed-K sobre el cuerpo del modelo, manteniendo la totalidad de los 256 expertos enrutados en lugar de podar expertos poco usados, y reservando 8 bits para la cabeza de salida. El resultado es un bitrate efectivo de 3,38 bpw en el cuerpo, con 3,39 bpw si se contabilizan las escalas. El modulo de prediccion multi-token (MTP) del modelo original no se ha incluido en el empaquetado.

El autor indica que el modelo requiere el fork de exllamav3 en la revision `affc194d5476710f167f30729e2508e577759612`; la version estandar de exllamav3 no es compatible con este pack. No se han publicado detalles sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes de atencion dispersa mas alla de lo que sugiere la etiqueta de arquitectura.

## Capacidades

- Generacion de texto conversacional y de proposito general, segun el pipeline declarado (`text-generation`).
- Codificacion y tareas de horizonte largo: el modelo base se presenta como insignia para codigo y tareas prolongadas.
- Procesamiento de contextos muy extensos: hasta 1M de tokens, lo que habilita el analisis de repositorios o corpus completos sin fragmentacion.
- Razonamiento multi-paso y flujos agenticos heredados del modelo base (no verificados de forma independiente en esta cuantizacion).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas en el repositorio.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Decodificacion especulativa mediante MTP: no disponible, el modulo MTP no esta incluido en el pack.

## Casos de uso

- Analisis de repositorios completos de codigo: con 1M de tokens de contexto, el modelo puede ingerir un arbol de fuentes extenso de una sola vez y responder preguntas de arquitectura, dependencias o impacto de cambios sin necesidad de un pipeline de recuperacion.
- Agentes de codificacion de larga duracion: tareas de refactorizacion o migracion que requieren decenas de pasos encadenados se benefician del contexto amplio y de las capacidades de horizonte largo del modelo base.
- Despliegue on-premise para equipos con hardware multi-GPU: el pack esta dimensionado para cuatro NVIDIA DGX Spark, lo que permite servir un modelo de clase frontera en una infraestructura de escritorio o laboratorio sin depender de APIs externas.
- Investigacion sobre cuantizacion extrema: al conservar los 256 expertos enrutados a 3,38 bpw, este artefacto es un caso de estudio util para medir la perdida de calidad asociada a bitrates muy bajos en modelos MoE.
- Analisis documental de gran volumen: contratos, expedientes tecnicos o corpus normativos que superan cientos de miles de tokens pueden procesarse en una sola pasada, evitando la perdida de informacion que introducen los sistemas de chunking.
- Generacion de codigo en pipelines internos: integrable en flujos de revision o generacion de parches siempre que el equipo asuma el coste de mantener el fork de exllamav3 requerido.
- Evaluacion comparativa de recetas de cuantizacion: util para contrastar la receta SAGE mixed-K de este pack frente a las variantes K2K3 del mismo autor sobre el modelo Flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la evaluacion de calidad esta pendiente y que las puntuaciones se anadiran cuando finalice. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba para esta cuantizacion ni para el modelo base en el material consultado.

## Requisitos de hardware

- Pesos del modelo: 319.069.111.923 bytes, aproximadamente 297 GiB en disco y en memoria.
- VRAM estimada: los pesos por si solos requieren unos 297 GiB; a ello hay que sumar la cache KV, que el autor dimensiona en Q4 para un contexto de 1M de tokens. El total no esta cuantificado en la informacion disponible.
- Hardware de referencia: el autor indica que el pack esta dimensionado para cuatro NVIDIA DGX Spark (plataforma GB10), lo que supone del orden de 512 GB de memoria unificada agregada.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en tarjetas de 48 GB o 80 GB por si solas.
- GPU de centro de datos: no hay datos publicados sobre A100, H100 o H200 para este pack concreto.
- Opciones de despliegue: exllamav3 en el fork de la revision `affc194d5476710f167f30729e2508e577759612`. La version estandar de exllamav3 no es compatible. Para las variantes hermanas del mismo autor existe una receta reproducible de vLLM sobre DGX Spark, pero no se ha publicado una equivalente para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y bitrate | Licencia | Notas |
|---|---|---|---|---|---|
| vcruz305/GLM-5.3-EXL3-3.38bpw-h8 (este) | 159,5 mil millones | 1M de tokens | EXL3, 3,38 bpw, cabeza 8 bits | no disponible | 256 expertos conservados, MTP excluido, requiere fork de exllamav3 |
| zai-org/GLM-5.3 (base) | no disponible | 1M de tokens | pesos completos (precision original) | MIT | Modelo insignia de Z.ai para codigo y tareas de horizonte largo |
| vcruz305/GLM-5.3-Flash-EXL3 | no disponible | no disponible | EXL3 | no disponible | Cuantizacion de la variante Flash por el mismo autor |
| vcruz305/GLM-5.3-Flash-EXL3-K2K3-mix | no disponible | no disponible | EXL3, 2,14 bpw efectivos en expertos enrutados | no disponible | Receta reproducible de vLLM sobre una sola DGX Spark; seis capas de expertos en K3 |

## Limitaciones y advertencias

- Evaluacion de calidad pendiente: el autor no ha publicado ninguna medicion de degradacion respecto al modelo base, por lo que no hay evidencia de como afecta el bitrate de 3,38 bpw a tareas de razonamiento o codigo.
- Dependencia de un fork no estandar: el pack solo funciona con exllamav3 en la revision `affc194d5476710f167f30729e2508e577759612`, lo que complica el mantenimiento en produccion y la reproducibilidad a largo plazo.
- Sin modulo MTP: al no incluirse la prediccion multi-token, no es posible aprovechar la decodificacion especulativa asociada en el modelo original.
- Requisitos de hardware muy elevados: 319 GB de pesos mas cache KV implican un cluster de cuatro DGX Spark o equivalente; no es desplegable en GPU de consumo ni en servidores de una sola tarjeta de 80 GB.
- Licencia de la cuantizacion no declarada: aunque el modelo base es MIT, el repositorio de esta cuantizacion no especifica licencia, lo que introduce incertidumbre para uso comercial. Conviene verificar la licencia del artefacto antes de integrarlo.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni sobre el comportamiento en castellano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos especificos de esta cuantizacion que permitan acotarlo.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgo para este pack ni para el modelo base en la informacion consultada.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Sin benchmarks comparativos: no es posible situar esta cuantizacion frente a alternativas de otros autores en tareas estandar.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/vcruz305/GLM-5.3-EXL3-3.38bpw-h8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pagina informativa de GLM-5.3: https://openlm.ai/glm-5.3/
- Variante Flash en EXL3: https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3
- Arbol de archivos de la variante Flash: https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3/tree/main
- Receta de vLLM para DGX Spark (variante K2K3): https://github.com/vcruz305/GLM-5.3-Flash-EXL3-K2K3-mix-DGX-Spark-recipe
- Perfil del autor en GitHub: https://github.com/vcruz305
