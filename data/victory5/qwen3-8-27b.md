# victory5/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de vision, publicado en el repositorio de HuggingFace `victory5/Qwen3.8-27B`. Segun la model card incluida en ese repositorio, se trata de la generacion Qwen3.8 de la familia abierta de Qwen, construida sobre la base arquitectonica de Qwen3.5 y orientada a codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo. El modelo es denso, con 27.781.427.952 parametros reales segun los pesos en safetensors, y se distribuye bajo licencia Apache 2.0.

Tecnicamente combina un esqueleto hibrido de atencion: 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, con 48 cabezas de atencion lineal para V y 16 para QK, y solo 16 capas de atencion completa con GQA. Esa mezcla reduce el coste del contexto largo, que es nativo de 262.144 tokens y extensible hasta 1.000.000. Ademas incluye vision nativa (imagenes y videos, incluidos videos de duracion de horas) y prediccion multi-token (MTP) entrenada con varios pasos.

Su relevancia practica esta en el formato: un modelo de ~27B con vision, contexto de 256K y control flexible del modo de razonamiento es desplegable en hardware relativamente asequible si se cuantiza, y la model card declara compatibilidad con Transformers, vLLM, SGLang y TokenSpeed. Conviene senalar que el repositorio analizado es una publicacion de terceros (autor `victory5`) sin descargas ni likes en el momento de la consulta, y la ficha tecnica que reproduce parece corresponder a la version oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con codificador de vision: Gated DeltaNet (atencion lineal) + Gated Attention (atencion completa con GQA) |
| Parametros totales | 27.781.427.952 (~27,8B) segun safetensors; la model card indica 27B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (no se publican artefactos GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio; el repo pesa 55,6 GB, compatible con pesos en precision completa o bf16) |
| Idiomas soportados | no disponible (la metadata del repositorio no declara idiomas; el vocabulario de 248.320 entradas es un indicio indirecto de tokenizer multilingue, sin confirmacion explicita) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64, en 16 bloques de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)` |
| Gated DeltaNet | 48 cabezas lineales para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimension de cabeza 256; RoPE de dimension 64 |
| FFN | dimension intermedia 17.408 |
| Embedding / salida LM | 248.320 (padded) |
| MTP (Multi-Token Prediction) | entrenado con multiples pasos |
| Pipeline declarado | image-text-to-text |
| Compatibilidad de despliegue declarada | Hugging Face Transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, con una disposicion hibrida poco comun: de cada cuatro capas, tres usan Gated DeltaNet (mecanismo de atencion lineal con estado recurrente y compuertas) y una usa Gated Attention clasica con Grouped Query Attention (24 cabezas Q, 4 cabezas KV, dimension de cabeza 256 y RoPE de 64 dimensiones). El resultado es que solo 16 de las 64 capas mantienen cache KV completo, lo que reduce de forma notable el coste de memoria y computo en contextos largos frente a un transformer de atencion completa del mismo tamano. La dimension oculta es 5.120, la FFN intermedia 17.408 y el vocabulario 248.320 entradas con padding.

Segun la model card, el modelo pasa por dos etapas: pre-entrenamiento y post-entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion (RLHF, DPO u otras). Si se explicita que incorpora Multi-Token Prediction entrenada con varios pasos, lo que habilita decodificacion especulativa con cabezas propias del modelo y suele traducirse en mayor throughput de generacion. Tambien se declara control flexible del razonamiento: modo de pensamiento activado por defecto y desactivable por peticion, ajuste de la profundidad de razonamiento mediante `reasoning_effort` y retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable (activado por defecto, desactivable por peticion) y profundidad ajustable mediante `reasoning_effort`.
- Razonamiento multi-paso con retencion del contexto de razonamiento previo (`preserve_thinking`), pensado para tareas de horizonte largo.
- Codigo, con enfasis declarado en codigo agentico de terminal (la model card referencia Terminal Bench 2.1 en la categoria de coding).
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno, orientado a completar tareas de extremo a extremo.
- Vision-lenguaje nativa: comprension de imagenes y videos, con mencion explicita a diagramas STEM, documentos y videos de duracion de horas.
- Capacidades profesionales y de investigacion (analisis documental, trabajo con material tecnico) segun los "highlights" de la model card.
- Tool calling / function calling: no se detalla explicitamente en la informacion proporcionada, aunque la model card menciona "official built-in tools" para la version alojada en Qwen Cloud, no necesariamente para estos pesos.
- Multilingue: no confirmado; la metadata del repositorio no declara idiomas.
- Decodificacion especulativa mediante las cabezas de MTP entrenadas.
- Multi-Token Prediction como capacidad arquitectonica entrenada.

## Casos de uso

- Agente de terminal y automatizacion de DevOps: el modelo esta explicitamente orientado a "agentic terminal coding", de modo que puede recibir el estado de un shell, ejecutar comandos, interpretar la salida y corregir el plan en pasos sucesivos. La ventana de 262.144 tokens permite mantener el historial completo de una sesion larga sin truncar.
- Analisis de repositorios completos: con contexto extensible hasta 1.000.000 de tokens, es viable cargar varios ficheros de un proyecto y pedir refactorizaciones o auditorias de seguridad que requieren ver dependencias cruzadas entre modulos.
- Procesamiento de documentos largos y diagramas STEM: al ser un modelo de vision-lenguaje, puede extraer datos de figuras, tablas y esquemas tecnicos junto con el texto que los acompana, en un unico paso y sin pipeline OCR separado.
- Analisis de video de larga duracion: la model card declara soporte de videos de escala horaria, lo que habilita resumenes con marcas temporales, extraccion de eventos o control de calidad sobre grabaciones de vigilancia o sesiones formativas.
- Asistente de investigacion con modo de pensamiento: para tareas que requieren cadena de razonamiento verificable, se activa el modo pensamiento y se ajusta `reasoning_effort`; cuando se busca latencia baja en produccion, se desactiva por peticion en el mismo endpoint.
- Copiloto de codigo en IDE o CI/CD: dado que la model card declara compatibilidad con vLLM y SGLang, se puede desplegar un servidor de inferencia con batching continuo y consumirlo desde un plugin de editor o desde un job de revision automatica de pull requests.
- Atencion al cliente con contexto largo: 256K tokens permiten incluir el historial completo de un cliente, su documentacion contractual y las politicas internas en el mismo prompt, evitando sistemas RAG con perdida de informacion.
- Extraccion estructurada sobre lotes de documentos: combinando vision y contexto largo, se pueden procesar facturas, informes o expedientes escaneados y devolver JSON validado, usando el modo pensamiento desactivado para maximizar throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una tabla comparativa de rendimiento (categoria "Coding", con la entrada "Agentic terminal coding – Terminal Bench 2.1 (Terminus)") frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numericos no estan presentes en el extracto disponible, por lo que no se reproducen.

| Benchmark referenciado en la model card | Resultado |
|---|---|
| Terminal Bench 2.1 (Terminus), agentic terminal coding | no disponible (tabla truncada en la informacion proporcionada) |
| Resto de benchmarks de la tabla comparativa (texto y multimodal) | no disponible |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 56 GB solo para pesos, mas cache KV y activaciones. En la practica, requiere GPU de 80 GB (A100 80GB, H100 80GB, H200) o reparto en varias GPU mediante tensor parallelism (por ejemplo, 2 × RTX 4090 24GB o 2 × L40S 48GB con offload parcial).
- VRAM en int8: alrededor de 28 GB para pesos; encaja en una A100 40GB, L40S 48GB o A6000 48GB, con margen limitado para contexto largo.
- VRAM en int4: alrededor de 14-16 GB para pesos; cabe en una RTX 4090 24GB, RTX 5090 32GB o L4 24GB, dejando espacio para cache KV de contexto moderado.
- Cache KV en contexto largo: es una estimacion propia a partir de la configuracion publicada, no un dato del autor. Solo 16 de las 64 capas usan atencion completa con 4 cabezas KV y dimension de cabeza 256, lo que supone unos 64 KB por token en fp16; a 262.144 tokens, unos 16,8 GB adicionales. El resto de capas (Gated DeltaNet) mantiene estado recurrente de tamano fijo.
- GPU consumer: no cabe en precision completa en ninguna GPU de consumo. En cuantizacion de 4 bits es viable en RTX 4090 24GB, RTX 5090 32GB y, con margen, en RTX 4080/4070 Ti SUPER solo si se reduce drasticamente el contexto.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp, Ollama, LM Studio ni TGI en la informacion disponible, ni la existencia de artefactos GGUF publicados.
- Latencia y throughput: no disponible. Como referencia cualitativa, las cabezas de MTP entrenadas habilitan decodificacion especulativa, que reduce el coste por token generado en decodificacion autoregresiva.
- Almacenamiento: el repositorio ocupa 55,6 GB, cifra coherente con pesos en precision completa o bf16.

## Comparativa con modelos similares

La informacion disponible solo permite comparar a nivel de identificacion, ya que los datos de los modelos de referencia no aparecen en el extracto consultado.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,8B (denso) | 262.144 nativo, hasta 1.000.000 | apache-2.0 | Vision-lenguaje, Gated DeltaNet + Gated Attention, MTP |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referenciado en la tabla comparativa de la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referenciado en la tabla comparativa; aparentemente de mayor capacidad |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | Referenciado como modelo comparable de ~30B |
| Opus4.6 Max | no disponible | no disponible | no disponible | Referenciado como linea base propietaria de gama alta |

## Limitaciones y advertencias

- Repositorio de terceros: el modelo esta publicado por el usuario `victory5`, no por la organizacion oficial de Qwen. No se garantiza que los pesos sean identicos a los de la version oficial ni que no hayan sido modificados.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creo y actualizo con un segundo de diferencia, lo que sugiere una subida automatizada o no revisada.
- Metadatos incoherentes: la fecha de creacion indicada es 2026-09-12 y el campo de idiomas esta vacio. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Idiomas: no se declara cobertura multilingue. No se puede asumir el comportamiento en castellano sin una evaluacion propia.
- Alucinacion: no hay datos publicados de tasas de alucinacion ni de evaluacion de fidelidad. Como en cualquier modelo generativo, el riesgo existe, especialmente en tareas de extraccion de datos de documentos e imagenes.
- Benchmarks no verificables: no se han podido consultar los valores numericos de la tabla comparativa, por lo que las afirmaciones de mejora en codigo, trabajo profesional e investigacion no estan cuantificadas en esta ficha.
- Contexto: aunque se declara extension hasta 1.000.000 de tokens, la calidad efectiva en ventanas muy largas (mas alla de los 262.144 nativos) no esta documentada, y el coste de memoria crece de forma apreciable.
- Cuantizacion: no hay artefactos cuantizados publicados. Cuantizar por cuenta propia un modelo con capas Gated DeltaNet puede requerir kernels especificos y no esta garantizado en todas las herramientas.
- Despliegue: la compatibilidad con llama.cpp, Ollama o TGI no esta confirmada. Un despliegue en produccion exige vLLM, SGLang o TokenSpeed, con las dependencias y versiones que ello implica.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia se aplica a lo que el repositorio declara; si los pesos derivan de un modelo con condiciones adicionales, la responsabilidad de verificar la cadena de licencias recae en quien despliega.
- Herramientas: la mencion a herramientas oficiales integradas se refiere a la version alojada en Qwen Cloud, no a estos pesos; el soporte de function calling debe validarse por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/victory5/Qwen3.8-27B
- Qwen Cloud, vision general de Qwen3.8-27B (mencionado en la model card): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio gestionado mencionado en la model card): https://www.qwencloud.com
- Aviso: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a un servicio de streaming sin relacion). No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales verificables.
