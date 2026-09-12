# Whytime/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF de la variante "uncensored" del modelo Qwen/Qwen3.8-27B, publicada por el usuario Whytime (perfil HauhauCS). Se trata de un modelo denso de 27.000 millones de parametros con vision encoder integrado, orientado a generacion de texto, razonamiento, uso agentico y entrada de imagen y video. Su rasgo diferencial es el perfil de "uncensoring" Aggressive, que elimina el comportamiento de rechazo y minimiza el preambulo en peticiones dificiles, y la incorporacion del sidecar de aceleracion HauhauCS FastMTP.

Tecnicamente, el modelo combina 64 capas de las cuales 48 son Gated DeltaNet (atencion lineal con estado recurrente) y 16 son capas de atencion con compuerta, con hidden size de 5.120, FFN de 17.408 y un vocabulario de 248.320 tokens. Declara 262.144 tokens de contexto nativo, extensible hasta 1.000.000, y conserva la cabeza MTP/NextN original de Qwen3.8 para decodificacion especulativa, a la que se anade un perfil FastMTP de 32K. La vision se sirve mediante un proyector BF16 separado de 931 MB.

La relevancia de esta ficha es acotada y conviene advertirlo: el repositorio registra 0 descargas y 0 likes, la model card no incluye ningun benchmark de calidad publicado y los metadatos de safetensors del repositorio declaran 1.863.907.840 parametros totales, una cifra incompatible con los 27B que anuncian tanto el nombre como los tamanos de archivo. Ademas, el modelo base declarado (Qwen/Qwen3.8-27B) corresponde a una generacion posterior a Qwen3 y no es verificable con la informacion disponible. Debe tratarse, por tanto, como un artefacto a validar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con vision encoder; hibrida: 48 capas Gated DeltaNet + 16 capas de atencion con compuerta |
| Parametros totales | 27B declarados por el autor; los metadatos safetensors del repositorio declaran 1.863.907.840 (discrepancia sin resolver) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 segun el autor |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; mas proyector de vision BF16 y sidecar FastMTP 32K |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (runtime llama.cpp y compatibles); existen pesos base en safetensors en el repositorio del modelo original |

Otros datos declarados: 64 capas de language model, hidden size 5.120, FFN size 17.408, vocabulario de 248.320 tokens, tamano de repo 172,5 GB, pipeline image-text-to-text.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con un encoder de vision acoplado mediante proyector. La innovacion estructural mas relevante es la hibridacion de capas: 48 de las 64 capas emplean Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente de tamano constante, mientras que solo 16 capas mantienen atencion con compuerta de complejidad cuadratica. Esta combinacion reduce significativamente el coste de la cache KV en contextos largos (la mayor parte de las capas no almacena KV por token), lo que explica que se pueda declarar un contexto nativo de 262.144 tokens y una extension teorica hasta 1.000.000. Ademas, el modelo conserva la cabeza MTP (Multi-Token Prediction) nativa de Qwen3.8, que permite decodificacion especulativa con el propio modelo como borrador.

Sobre el entrenamiento no hay informacion disponible: la model card indica explicitamente que "no hay cambios en los datasets ni en las capacidades previstas" y que la release solo aplica el perfil de uncensoring Aggressive sobre Qwen3.8-27B. No se especifica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o alguna fase de alineamiento. Tampoco se detalla el proceso concreto de "uncensoring" (no se indica si es un abliteration, un fine-tune con datos sin filtrar o una modificacion de la cabeza de rechazo), mas alla de la afirmacion de "0/465 rechazos" y de que la variante Aggressive prioriza respuestas directas sin preambulo.

Como anadido de inferencia, el release incorpora HauhauCS FastMTP, un sidecar de 903 MB que se carga junto al modelo para acelerar la decodificacion especulativa. Los cuantizados K_P ("Perfect") son perfiles de cuantizacion personalizados que, segun el autor, usan analisis especifico del modelo para preservar calidad en las capas mas sensibles, con un incremento de tamano de entre el 5 y el 15 por ciento respecto al cuantizado base equivalente, manteniendo compatibilidad GGUF estandar.

## Capacidades

- Generacion de texto y razonamiento multi-paso en ingles, chino y otros idiomas (etiqueta multilingual).
- Comprension de imagen y video mediante el proyector BF16 (pipeline image-text-to-text); el proyector es necesario para cualquier entrada visual.
- Capacidades agenticas y uso de herramientas heredadas del modelo base Qwen3.8, segun la model card ("text, reasoning, agentic, image, and video").
- Decodificacion especulativa integrada: cabeza MTP/NextN nativa mas sidecar FastMTP de 32K.
- Perfil de respuesta sin rechazos: el autor declara 0/465 rechazos y respuestas directas con preambulo minimo en peticiones dificiles.
- Modo conversacional multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- No hay evidencia publicada de soporte explicito de thinking mode, audio o salidas estructuradas mas alla de lo que herede del base.

## Casos de uso

- Analisis de documentos largos con imagen: combinando los 262.144 tokens de contexto nativo y el proyector de vision, el modelo puede procesar informes con graficos, capturas de pantalla y tablas escaneadas junto al texto completo, sin trocear el documento.
- Asistentes conversacionales multi-turno de contexto extenso: la hibridacion con 48 capas Gated DeltaNet mantiene bajo el coste de memoria de la cache KV, lo que permite sesiones largas en hardware de gama alta de consumo en cuantizaciones Q4 o inferiores.
- Generacion de codigo asistida sobre repositorios: con contexto de cientos de miles de tokens se pueden cargar arboles de proyecto completos; requiere validacion previa porque no hay benchmarks de HumanEval ni similares publicados.
- Investigacion sobre alineamiento y seguridad: la variante Aggressive, con su perfil de rechazo reducido, es util como objeto de estudio de comportamiento de modelos desalineados, siempre en entornos controlados y sujeto a la licencia Apache 2.0.
- Procesado de video para resumen o indexacion: el soporte de video del modelo base permite generar descripciones y transcripciones estructuradas de clips, con el proyector BF16 cargado.
- Despliegue en local con llama.cpp u Ollama: al ser GGUF, cualquier equipo con suficiente RAM o VRAM puede ejecutar desde IQ2_M (10,32 GB) en adelante sin necesidad de compilaciones especiales.
- Traduccion y procesamiento bilingue ingles-chino: es el par de idiomas explicitamente declarado en la model card, con cobertura multilingue adicional no cuantificada.
- Servicio de inferencia acelerado: el sidecar FastMTP esta pensado para entornos donde el throughput de decodificacion es el cuello de botella, como APIs internas con muchas peticiones concurrentes de generacion larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica metricas relativas de velocidad de decodificacion frente a configuraciones sin MTP y con MTP estandar:

| Metrica declarada por el autor | Mejora |
|---|---|
| TG en documentos vs. no-MTP | hasta 3,02x |
| TG en razonamiento vs. no-MTP | hasta 1,93x |
| TG en documentos vs. MTP embebido estandar | hasta +35,2 por ciento |
| TG en razonamiento vs. MTP embebido estandar | hasta +21,1 por ciento |
| Rechazos | 0 de 465 |

Nota: son cifras autoreportadas, sin metodologia publicada, sin especificacion del hardware de medida y sin verificacion independiente. "TG" corresponde a tokens generados por segundo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (peso del modelo; anadir margen para cache KV, contexto y overhead del runtime):
  - IQ2_M: 10,32 GB de pesos, aproximadamente 13 GB en ejecucion.
  - Q2_K_P: 10,68 GB de pesos, aproximadamente 13,5 GB.
  - IQ3_XS: 12,18 GB, aproximadamente 15 GB.
  - IQ3_M: 12,79 GB, aproximadamente 15,5 GB.
  - Q3_K_P: 13,44 GB, aproximadamente 16 GB.
  - IQ4_XS: 15,71 GB, aproximadamente 19 GB.
  - Q4_K_P: 17,92 GB, aproximadamente 21 GB.
  - Q5_K_P: 20,22 GB, aproximadamente 24 GB.
  - Q6_K_P: 25,92 GB, aproximadamente 30 GB.
  - Q8_K_P: 31,46 GB, aproximadamente 36-40 GB.
- Anadir 931 MB si se usa el proyector de vision y 903 MB si se carga el sidecar FastMTP.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) hasta Q5_K_P con contexto moderado y en Q4_K_P con margen para cache; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) hasta IQ4_XS o Q3_K_P; en GPUs de 12 GB solo IQ2_M o Q2_K_P con contexto recortado. Con 64 GB de RAM se pueden ejecutar los cuantizados medios en CPU con offload parcial.
- GPU profesionales recomendadas: para Q8_K_P y contexto largo, A100 40/80 GB, H100 80 GB o L40S 48 GB; para Q6_K_P, A100 40 GB o L40S.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime GGUF compatible; el autor indica que los cuantizados K_P no requieren build ni plugin especial, aunque LM Studio puede mostrar "?" en la columna de cuantizacion (problema de visualizacion). No hay confirmacion publicada de soporte en vLLM ni TGI, que trabajan preferentemente con safetensors y podrian no aceptar el sidecar FastMTP ni la cabeza MTP tal como se distribuyen.
- Latencia y throughput: no disponible. Solo se conocen las mejoras relativas de tokens generados por segundo reportadas por el autor, sin valores absolutos ni hardware de referencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite construir una comparativa fiable: el modelo base declarado (Qwen/Qwen3.8-27B) no es verificable, el repositorio no tiene benchmarks de calidad publicados ni comparaciones con alternativas, y la unica metrica disponible es una mejora relativa de velocidad frente a otras configuraciones del mismo modelo. Cualquier tabla de comparacion con modelos de tamano similar (por ejemplo otros densos de 27B-32B o sus variantes uncensored en GGUF) requeriria datos de rendimiento que no se han facilitado.

## Limitaciones y advertencias

- Discrepancia grave en el recuento de parametros: los metadatos safetensors del repositorio indican 1.863.907.840 parametros, mientras que el nombre, la model card y los tamanos de archivo corresponden a un modelo de aproximadamente 27B. Debe verificarse antes de asumir cualquier requisito de hardware.
- Modelo base no verificable: Qwen/Qwen3.8-27B y la familia "Qwen3.8" no aparecen en la informacion disponible; no se puede confirmar procedencia, licencia efectiva de los pesos originales ni condiciones de uso del modelo subyacente.
- Perfil Aggressive sin filtros: responde deliberadamente sin rechazos. En produccion implica riesgo de generar contenido danino, legalmente problematico o contrario a politicas de plataforma, ademas de mayor exposicion a jailbreaks.
- Alucinacion: no hay evaluaciones de fidelidad ni de veracidad publicadas; al ser un modelo "uncensored" con preambulo minimo, tiende a afirmar con seguridad sin las salvaguardas habituales de un modelo alineado.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo, y el dataset de "uncensoring" no se describe.
- Limitaciones de idioma: solo en y zh estan declarados explicitamente; el castellano no figura entre los idiomas soportados, aunque la etiqueta multilingual sugiere cobertura parcial sin garantias.
- Caveat de contexto: los 1.000.000 de tokens son una extension declarada por el autor, no una capacidad nativa verificada; la calidad en contextos muy largos no esta medida.
- Caveat de produccion: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que haya validado los pesos ni la integridad de los archivos.
- Enlaces de descarga: los enlaces de la model card apuntan al repositorio HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, distinto del identificador Whytime del repositorio consultado; conviene comprobar el origen real de los ficheros.
- Sin garantias de compatibilidad con servidores de inferencia de alto rendimiento (vLLM, TGI) por el formato GGUF y los sidecares adicionales.
- Licencia Apache 2.0 en la etiqueta del repositorio, pero sin trazabilidad clara hacia la licencia del modelo base, lo que puede afectar al uso comercial.

## Enlaces

- Repositorio HuggingFace consultado: https://huggingface.co/Whytime/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio referenciado en la model card: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (no verificable con la informacion disponible)
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper, blog tecnico o repositorio de codigo: no disponible
- Demo o espacio de prueba: no disponible
- Resultados de busqueda web: las unicas entradas devueltas corresponden a hoteles en Key West (Tripadvisor, Booking.com, Conde Nast Traveler, trivago, KAYAK) y no guardan ninguna relacion con el modelo; se descartan por no ser material relevante.
