# wbydc/Qwen3.8-27B-TFCF-HU-CODER-GGUF

## Resumen

`wbydc/Qwen3.8-27B-TFCF-HU-CODER-GGUF` es un repositorio de cuantizaciones GGUF de un ajuste fino derivado de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, publicado por el usuario wbydc. Se trata de un modelo denso de aproximadamente 26.900 millones de parámetros (26.895.998.464, segun los safetensors del repositorio) con licencia Apache 2.0 y etiquetas que lo identifican como fine tune multietapa, orientado a codigo, escritura creativa y razonamiento con modo thinking.

El modelo se presenta como una variante "TURBO" cuyo objetivo declarado es reducir el numero de tokens de pensamiento entre la mitad y una decima parte respecto al modelo base, manteniendo la calidad de salida. La model card afirma superar a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.5 27B y Qwen 3.6-35B-A3B en siete benchmarks criticos, con valores de ARC-C de 735 en 8 bits y 719 en 4 bits, y ARC-E de 880. Estos datos son autodeclarados por el autor y no se han verificado de forma independiente en la informacion disponible.

El repositorio incluye cuantizaciones GGUF "normales" y "MTP" (multi-token prediction) con imatrix dual, y ocupa 389 GB. El pipeline declarado es `image-text-to-text`, lo que sugiere soporte de entrada multimodal, aunque la model card no detalla la arquitectura de vision. Es relevante ahora porque propone un modelo de ~27B ejecutable en hardware de consumo con cuantizacion de 4 bits, en la franja de tamano que interesa a desarrolladores que quieren inferencia local con capacidades de codigo y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; tag `image-text-to-text` y `bfloat16` sugieren transformer multimodal con entrada de imagen y texto. No se confirma si es densa o MoE |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: variantes "Regular" y "MTP" (multi-token prediction); el repositorio menciona 8 bits y 4 bits (Q4KS, sin imatrix); etiquetas `imatrix` y descripcion de "Neo-CODER MAX DI-MATRIX (dual imatrix)"; version original en `bfloat16` |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); `safetensors` como formato del modelo base segun el recuento de parametros |
| Tamano del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del pipeline `image-text-to-text` y el uso de `bfloat16`. Por el nombre y la genealogia (Qwen 3.8 27B) se infiere una familia transformer, pero no se confirma numero de capas, dimension de atencion, tipo de atencion ni si incorpora capas MoE. El dato solido es el recuento de parametros: 26.895.998.464.

El entrenamiento se describe como un proceso de ajuste fino multietapa y multi-fusion sobre el modelo base de DavidAU. El autor menciona dos metodologias propietarias: COLD FUSION, definida como la combinacion de un componente "GAIN" (que modifica dinamicamente el entrenamiento muestra a muestra en tiempo real segun aprende el modelo) con los entrenadores de Unsloth, y Fable Fusion 711. Los objetivos declarados del proceso fueron aumentar la inteligencia general, reducir el bloque de pensamiento entre un 50 % y un 90 % (reduccion mediana aproximada de dos tercios), reformatear el bloque de razonamiento, acelerar la generacion de tokens (especialmente con MTP) y mantener los benchmarks. El autor afirma explicitamente no haber hecho "benchmaxing". No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron RLHF, DPO u otras tecnicas de alineacion; tampoco hay informacion sobre la fase de abliteration o "heretic" que aparece en el nombre del modelo base.

## Capacidades

- Generacion de texto general, con enfasis declarado en escritura creativa, ficcion, narrativa y roleplaying.
- Generacion de codigo, segun la etiqueta `coder` y el sufijo CODER del repositorio.
- Razonamiento en modo thinking, con tres modos de operacion mencionados en la model card.
- Reduccion de tokens de razonamiento: el autor afirma entre 1/2 y 1/10 del volumen del modelo base segun el caso, con mediana cercana a 2/3 de reduccion.
- Capacidad multimodal de entrada (imagen y texto) segun el pipeline `image-text-to-text`; no se detalla el alcance real.
- Multilinguee limitado a ingles y chino.
- Modelo "abliterated"/"uncensored": se ha eliminado o reducido el comportamiento de rechazo, lo que se presenta como una capacidad pero implica riesgos.
- Soporte de tool calling: la model card remite a la pestana de comunidad para "third party benchmarks", incluyendo una afirmacion de "strongest tool calling performance ever recorded"; no hay datos verificables en la informacion disponible.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Cuantizaciones MTP (multi-token prediction) para acelerar la generacion.

## Casos de uso

- Asistencia a la escritura creativa y narrativa: el ajuste esta orientado explicitamente a ficcion, generos variados y roleplaying, con ejemplos de generacion de dialogos y tramas en la propia model card. Adecuado para autores que necesitan borradores largos con tono consistente.
- Copiloto de codigo en local: la etiqueta `coder` y el sufijo CODER apuntan a generacion y autocompletado de codigo; con cuantizacion de 4 bits puede ejecutarse en una GPU de 24 GB, lo que permite integrarlo en editores o pipelines sin depender de APIs externas.
- Razonamiento con presupuesto de tokens ajustado: dado que el modelo declara recortar los tokens de pensamiento, encaja en escenarios con limites de coste o latencia donde un modelo de razonamiento estandar seria demasiado verboso.
- Prototipado de agentes conversacionales multi-turno: el pipeline `conversational` y el soporte de endpoints permiten desplegarlo como servicio para pruebas de flujos de dialogo, aunque la ausencia de datos de tool calling verificados obliga a validarlo antes de produccion.
- Generacion de contenido creativo sin filtros de rechazo: util para guiones, narrativa de genero o dialogos con tematicas adultas donde los modelos alineados suelen rechazar la peticion; requiere revision humana por el riesgo de contenido inapropiado.
- Investigacion sobre tecnicas de ajuste fino: el modelo documenta metodos propietarios (COLD FUSION, GAIN, Fable Fusion 711) y permite estudiar el efecto de la reduccion de tokens de razonamiento sobre benchmarks como ARC-C y ARC-E.
- Educacion y traduccion ingles-chino: al soportar ambos idiomas puede emplearse para asistencia bilinguee o generacion de material didactico en esos dos idiomas; no hay soporte de castellano.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece variantes de 4 y 8 bits con y sin imatrix, lo que permite medir el impacto de la cuantizacion sobre la calidad en un mismo modelo.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles son afirmaciones del autor en la model card. No se ha publicado una tabla completa de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada, y no hay verificacion independiente.

| Metrica | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | El autor afirma 144 puntos mas que Qwen 3.8 27B |
| ARC-C (4 bits) | 719 | Con cuantizacion de 4 bits |
| ARC-E | 880 | Presentado como "zona de inteligencia" de modelos cerrados |
| Reduccion de tokens de pensamiento | Entre 1/2 y 1/10; mediana ~2/3 | Respecto a Qwen 3.8 27B en los tres modos de operacion |
| Comparativa global | Supera los 7 benchmarks criticos del modelo base, de Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Afirmacion del autor; no se enumeran los 7 benchmarks ni sus valores |
| Tool calling | "El mejor rendimiento jamas registrado" | Referido a la pestana de comunidad; sin datos verificables |

Advertencia: la escala de los valores de ARC-C (735, 719) no coincide con la escala habitual de 0 a 100 de ARC-Challenge, lo que impide comparar directamente con resultados publicados de otros modelos. Los datos deben tratarse como no verificados.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (26.900 millones) y del coste de pesos y cache KV; no son medidas del autor.

- VRAM solo para pesos: ~53,8 GB en bf16/fp16; ~28,6 GB en Q8_0; ~16,2 GB en Q4_K_M; ~12,5-13,5 GB en Q3_K; ~10-11 GB en Q2_K.
- GPU profesionales: A100 80 GB o H100 80 GB para bf16 y Q8 con contexto amplio; A100 40 GB no cabe en bf16.
- GPU de consumo: cabe en 4 bits en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con contexto recortado, y en GPUs de 16 GB en Q3/Q2 con perdida de calidad. Q8 requiere 32 GB (por ejemplo, 2 x RTX 4090 o una RTX 5090 de 32 GB, si cabe con contexto minimo).
- CPU y RAM: es viable la inferencia con llama.cpp en CPU+RAM; un Q4_K_M exige del orden de 17-18 GB de RAM libre mas el contexto, por lo que 32 GB de RAM es el minimo practico.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp por el formato GGUF; vLLM y TGI admiten GGUF aunque su rendimiento optimo es con safetensors. El repositorio indica `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor afirma mejoras de velocidad por el uso de MTP y la reduccion de tokens de pensamiento, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

Los modelos de referencia citados por el propio autor son los unicos comparables identificables. No hay datos verificables de parametros, contexto ni licencia para la mayoria de ellos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wbydc/Qwen3.8-27B-TFCF-HU-CODER-GGUF | 26,9 B | No disponible | Apache 2.0 | GGUF en HuggingFace | 0 descargas, 0 likes; datos autodeclarados |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882 | 27 B (nominal) | No disponible | No disponible | HuggingFace | Modelo base directo de esta cuantizacion |
| Qwen3.8 27B | 27 B (nominal) | No disponible | No disponible | No disponible | Base de referencia; el autor afirma superarlo en ARC-C por 144 puntos |
| Qwen3.6 27B | 27 B (nominal) | No disponible | No disponible | No disponible | Citado como superado en los 7 benchmarks criticos |
| Qwen3.5 27B | 27 B (nominal) | No disponible | No disponible | No disponible | Citado como superado en los 7 benchmarks criticos |
| Qwen3.6-35B-A3B | 35 B totales | No disponible | No disponible | No disponible | Unica referencia con parametros activos distintos (MoE, etiqueta A3B), citado como superado |

No se dispone de comparativas con alternativas de otros fabricantes (Llama, Mistral, DeepSeek) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": el comportamiento de rechazo se ha eliminado o reducido deliberadamente. Puede generar contenido ofensivo, violento, sexual o ilegal sin filtros. No es apto para aplicaciones orientadas al publico sin moderacion adicional.
- La model card incluye ejemplos de generacion con lenguaje soez y contenido explicito; conviene no reutilizarlos en contextos profesionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual, tasas de alucinacion ni pruebas de calibracion. Al ser un fine tune sin datos de alineacion documentados, el riesgo es al menos equivalente al del modelo base.
- Benchmarks autodeclarados y no verificados. Los valores de ARC-C (735, 719) no son directamente comparables con la escala habitual de ARC-Challenge y no se acompanan de metodologia.
- Cobertura idiomatica limitada a ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo (analisis de documentos extensos, repositorios completos) sin antes medirlo.
- Vocacion multimodal sin detalle: aunque el pipeline es `image-text-to-text`, no se describe el encoder de vision, la resolucion de imagen admitida ni el comportamiento esperado en tareas visuales.
- Procedencia del entrenamiento poco transparente: no se publican tokens de entrenamiento, composicion del dataset, hiperparametros ni proceso de alineacion. Las metodologias COLD FUSION, GAIN y Fable Fusion 711 se describen de forma promocional y sin documentacion tecnica verificable.
- Trazabilidad de la licencia: la licencia declarada es Apache 2.0, pero el modelo deriva de una cadena de fine tunes de terceros cuya licencia efectiva y cumplimiento (incluida la clausula de atribucion) conviene revisar antes de un uso comercial.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de los metadatos. No existe evidencia externa de calidad, estabilidad ni comportamiento en produccion.
- Anomalia en las fechas: los metadatos indican creacion y actualizacion el 2026-09-16, fecha posterior a la habitual en los repositorios existentes; conviene verificar la integridad del repositorio antes de descargarlo.
- Tamano del repositorio de 389 GB: la descarga completa es inviable en la mayoria de entornos; hay que seleccionar el fichero GGUF concreto.
- Nomenclatura inconsistente: el titulo de la model card menciona NEO-CODER MAX y un linaje distinto al ID del repositorio, lo que dificulta confirmar que el contenido corresponde exactamente al modelo descrito.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wbydc/Qwen3.8-27B-TFCF-HU-CODER-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia de la metodologia Fable Fusion 711 citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets declarados: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets (referenciados en los metadatos, sin URL directa en la informacion disponible)
- Paper, blog tecnico, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo.
