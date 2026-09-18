# WasamiKirua/Hexis-Vesper-12B-mlx-4Bit

## Resumen

Hexis-Vesper-12B-mlx-4Bit es una conversion al formato MLX con cuantizacion de 4 bits del modelo WasamiKirua/Hexis-Vesper-12B, un "merge" (fusion de pesos) construido con mergekit sobre arquitectura de tipo Mistral y orientado a roleplay y generacion conversacional con un tono calificado por el autor como "melancolico". El repositorio lo publica el usuario WasamiKirua y contiene unicamente los pesos convertidos, sin datos adicionales sobre el proceso de fusion, el dataset de entrenamiento ni la evaluacion del resultado.

El modelo base declara 12.247.802.880 parametros totales (aproximadamente 12,25 mil millones) en un transformer denso, no MoE, y el repositorio ocupa 6,9 GB, coherente con pesos de 4 bits. La conversion se realizo con mlx-lm version 0.31.2, por lo que el artefacto esta pensado para ejecutarse en Apple Silicon mediante la libreria MLX, no en GPUs NVIDIA o AMD sin una conversion previa.

Su relevancia practica es limitada y muy especifica: sirve como ejemplo de cuantizacion de un merge comunitario para inferencia local en Mac, y como punto de partida para experimentos de roleplay en italiano e ingles. No hay benchmarks publicados, la licencia no esta declarada y el modelo acumula cero descargas y cero likes en el momento de la consulta, lo que lo situa como un artefacto de nicho sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo Mistral (segun tag del repositorio); detalles de capas y atencion no disponibles |
| Parametros totales | 12.247.802.880 (12,25 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX; se desconoce si existen otras cuantizaciones del modelo base |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors en formato MLX (cargables con mlx-lm 0.31.2); el repositorio tambien declara la libreria transformers y la etiqueta safetensors |
| Modelo base | WasamiKirua/Hexis-Vesper-12B |
| Tamano del repositorio | 6,9 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer denso con etiqueta "mistral", de 12,25 B de parametros, obtenido mediante mergekit. La etiqueta "merge" indica que los pesos proceden de la combinacion de dos o mas modelos ya entrenados (tipicamente mediante tecnicas como SLERP, TIES, DARE o passthrough), no de un entrenamiento desde cero. No se especifican los modelos de origen de la fusion, la configuracion de mergekit empleada, el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni el tipo de atencion (full, sliding window o grouped-query).

Tampoco hay informacion sobre el dataset de entrenamiento, el volumen de tokens, la composicion linguistica del corpus ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La unica innovacion tecnica documentada es la propia cuantizacion: la conversion a MLX de 4 bits realizada con mlx-lm 0.31.2, que reduce el peso del modelo a 6,9 GB y permite inferencia en memoria unificada de Apple Silicon. El autor etiqueta el modelo como "sentient", "roleplay" y "melancholic", terminos que describen el estilo conversacional pretendido y no caracteristicas tecnicas verificables.

## Capacidades

- Generacion de texto conversacional en italiano e ingles, con orientacion declarada a roleplay e interpretacion de personajes.
- Mantenimiento de对话 multi-turno con un tono narrativo concreto ("melancolico", segun las etiquetas del autor), aunque sin datos publicados sobre la longitud de contexto efectiva.
- Generacion de texto general (pipeline text-generation) y uso mediante plantilla de chat si el tokenizador incluye `chat_template`.
- Capacidades de razonamiento, matematicas, codigo, vision, audio, tool calling y function calling: no disponibles / no documentadas.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingues: limitadas a los dos idiomas declarados (it, en); no hay evidencia de soporte de castellano.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Prototipado de personajes conversacionales en local: al ser un merge etiquetado como roleplay, permite experimentar con personalidades narrativas en un Mac con memoria unificada, sin depender de APIs externas ni de conectividad.
- Inferencia en Apple Silicon sin GPU dedicada: la cuantizacion MLX de 4 bits y los 6,9 GB del repositorio permiten cargar el modelo en equipos con 16-32 GB de memoria unificada, algo inviable con los pesos completos de 12,25 B en FP16.
- Generacion creativa en italiano: es uno de los dos idiomas declarados, por lo que puede emplearse para redactar ficcion, dialogos o guiones en ese idioma con un registro estilizado.
- Desarrollo y depuracion de pipelines MLX: sirve como caso de prueba para validar `mlx_lm.load`, `mlx_lm.generate` y el servidor compatible con la API de OpenAI de mlx-lm en integraciones propias.
- Comparacion de tecnicas de cuantizacion: util como referencia para medir la degradacion de calidad entre el modelo base WasamiKirua/Hexis-Vesper-12B y su version de 4 bits en tareas de generacion abierta.
- Base para nuevos merges o ajustes finos: al ser un artefacto pequeno y de pesos abiertos (aunque sin licencia declarada), puede servir como punto de partida experimental en investigacion sobre fusion de modelos, siempre que se resuelva la ambiguedad legal.
- Bots de entretenimiento y demos offline: escenarios de feria, talleres o demos sin conexion donde se requiera un modelo conversacional con caracter narrativo en un portatil Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los resultados obtenidos correspondian a guias turisticas sin relacion con el artefacto). Tampoco hay datos de latencia ni de throughput publicados por el autor.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: los 6,9 GB del repositorio corresponden a los pesos en 4 bits; con la cache KV y el overhead de runtime, se recomienda un minimo de 8-10 GB de memoria disponible y 16 GB como configuracion comoda. Para contextos largos, 32 GB de memoria unificada ofrecen mayor margen.
- GPU compatibles: el formato MLX es especifico de Apple Silicon (series M1, M2, M3, M4 y posteriores). No es cargable directamente en A100, H100, RTX 4090 ni otras GPUs NVIDIA o AMD sin una conversion previa.
- Cabe en hardware de consumo: si, en Mac con chip Apple Silicon y 16 GB o mas de memoria unificada. En GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) requeriria convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar) antes de usarlos.
- Opciones de despliegue: mlx-lm 0.31.2 o superior (libreria de referencia indicada por el autor), servidor `mlx_lm.server` con API compatible con OpenAI, y cualquier herramienta que consuma pesos MLX. vLLM, TGI, llama.cpp y Ollama no cargan pesos MLX de forma nativa; requeririan reconversion.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa rigurosa. A continuacion se recogen las unicas referencias ciertas disponibles; el resto de campos se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| WasamiKirua/Hexis-Vesper-12B-mlx-4Bit | 12,25 B | No disponible | No disponible | Safetensors MLX 4 bits | No publicados |
| WasamiKirua/Hexis-Vesper-12B (modelo base) | 12,25 B (mismo recuento declarado) | No disponible | No disponible | No disponible en esta ficha | No publicados |
| Alternativas de la misma categoria (merges de ~12 B orientados a roleplay) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la busqueda web modelos comparables con datos verificables que puedan contrastarse con este artefacto.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas de regresion ni validacion por terceros; el rendimiento real en cualquier tarea es desconocido.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. En produccion esto supone un riesgo legal directo y desaconseja su integracion en productos.
- Sesgos: al ser un merge del que no se documentan los modelos de origen ni los datos de entrenamiento, no es posible auditar sesgos de genero, etnia, idioma o ideologia. Los modelos de roleplay tienden ademas a reproducir estereotipos de personaje.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluacion, la fiabilidad factual es indeterminada; no debe usarse para consultas factuales, medicas, legales o financieras sin verificacion externa.
- Cobertura linguistica muy limitada: solo italiano e ingles declarados. No hay evidencia de soporte de castellano, por lo que su uso en espanol puede degradar la calidad de forma notable.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Naturaleza de merge sin trazabilidad: la fusion de pesos puede producir degradaciones sutiles (perdida de coherencia, repeticiones, deriva de personaje) dificiles de diagnosticar sin el modelo base como referencia.
- Restriccion de plataforma: los pesos MLX solo son utilizables en Apple Silicon; su despliegue en infraestructura GPU convencional exige una conversion previa cuyo impacto en la calidad no esta documentado.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de retroalimentacion de la comunidad y de mantenimiento verificado.
- Version de herramienta fijada: la conversion se realizo con mlx-lm 0.31.2; versiones muy distintas pueden requerir ajustes de compatibilidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/WasamiKirua/Hexis-Vesper-12B-mlx-4Bit
- Modelo base: https://huggingface.co/WasamiKirua/Hexis-Vesper-12B
- Libreria mlx-lm (necesaria para cargar los pesos): https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
- Repositorio de mergekit (herramienta citada en las etiquetas del modelo): https://github.com/arcee-ai/mergekit

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su proceso de entrenamiento o sus resultados; los resultados obtenidos correspondian a contenidos turisticos sin relacion con el artefacto. No se dispone por tanto de papers, blogs tecnicos, demos ni repositorios adicionales asociados al modelo.
