# XeyonAI/Helcyon-Claude-Mythic-14b-v2.0-GGUF

## Resumen

Helcyon Claude Mythic 14B (v2.0, denominado internamente "Series 8") es un ajuste fino conversacional distribuido en formato GGUF por XeyonAI a partir de `mistralai/Ministral-3-14B-Instruct-2512`. Con 13.506.073.600 parametros (unos 13,5 B), pertenece a la familia Helcyon, orientada a asistentes locales con "personalidad" y sin filtros corporativos, y su objetivo declarado es reproducir localmente la experiencia conversacional de la familia Claude sin depender de APIs en la nube.

El modelo se entrena, segun su autor, integramente con datasets generados por modelos Claude (Sonnet 4.5, Sonnet 4.6, Opus, Fable 5 y Sonnet 5.5), y no con un unico release concreto. La version v2.0 incide en tres frentes: mayor claridad y flujo conversacional, mejor escritura expresiva, y mayor adherencia al hilo real de la conversacion (evitando que el modelo invente narrativas poeticas sobre cosas que el usuario nunca dijo). Tambien declara soporte de vision con proyector multimodal compatible y capacidad de contexto largo.

Es relevante ahora porque ocupa el nicho de los asistentes conversacionales y de rol de 14 B ejecutables en hardware de consumo, un segmento con mucha demanda y pocas alternativas afinadas especificamente para conversacion larga, escritura creativa y trabajo administrativo. La licencia Apache-2.0 facilita su adopcion, aunque la ausencia total de benchmarks publicados y de datos de entrenamiento verificables obliga a evaluarlo empiricamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; deriva del modelo base `mistralai/Ministral-3-14B-Instruct-2512` (familia transformer densa de Ministral) |
| Parametros totales | 13.506.073.600 (≈13,5 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible con cifra concreta; la model card solo indica que "retiene la capacidad de contexto mucho mayor de la generacion Ministral" |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien se distribuye el proyector multimodal para vision, segun la ficha) |

Otros datos: repositorio de 77,8 GB (agrupa todas las cuantizaciones), autor en HuggingFace `XeyonAI`, propietario declarado "HardWire", creado el 2026-10-05 y actualizado el 2026-10-07. Compatible con endpoints y con backend Helcyon-WebUI.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que el modelo parte de Ministral 3 14B (segunda generacion de la linea Helcyon-Ministral, "Series 8"). No se detallan numero de capas, dimension del hidden state, tipo de atencion, ni si se aplicaron tecnicas como GQA, RoPE escalado o atencion lineal. Tampoco se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF, DPO o preferencias. Lo unico declarado es el origen de los datos: conversaciones y textos generados por modelos de la familia Claude (Sonnet 4.5, Sonnet 4.6, Opus, Fable 5 y Sonnet 5.5).

El elemento diferencial del entrenamiento es el ajuste contra un comportamiento concreto: la tendencia de los modelos muy conversacionales a construir narrativas elaboradas o poeticas sobre cosas que el usuario no ha dicho. La version v2.0 afirma haber trabajado ese sesgo, manteniendo el estilo expresivo pero ciñendose mejor al contenido real de la conversacion. Tambien declara mejoras en continuidad de contexto, seguimiento de detalles establecidos a lo largo del dialogo y capacidades de rol. No se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.) ni metodologia de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en flujo natural y respuestas claras.
- Escritura creativa y prosa expresiva (el autor la describe como "articulada y adaptable").
- Roleplay con seguimiento de personaje, continuidad e inmersion.
- Seguimiento de contexto largo: retencion de detalles, argumentos y correcciones previas dentro de una conversacion extensa.
- Asistencia practica: tareas administrativas, organizacion y ayuda cotidiana.
- Vision: segun la model card, puede procesar imagenes (capturas de pantalla, fotografias, ilustraciones, diagramas e interfaces) si se usa con un backend compatible y el proyector multimodal adecuado.
- Afinado para conversacion y asistencia; no se declara soporte explicito de tool calling ni function calling.
- No se declaran capacidades especificas de razonamiento matemático, generacion de codigo, modo "thinking" ni audio.
- Multilingue: solo ingles declarado en las etiquetas del repositorio.

## Casos de uso

- Asistente conversacional local de uso personal: el modelo esta diseñado para hilos largos y conversacion sostenida, por lo que encaja en un asistente de escritorio que recuerde el contexto de sesiones anteriores sin enviar datos a la nube.
- Escritura creativa y edicion de prosa: dado su entrenamiento en textos generados por Claude y su enfasis declarado en claridad y estilo, es adecuado para redaccion de ficcion, relatos y reescritura de textos largos.
- Roleplay y narrativa interactiva: la ficha declara mejoras especificas en conciencia de personaje, continuidad e inmersion, lo que lo hace util en entornos tipo Helcyon-WebUI con fichas de personaje.
- Asistencia administrativa y organizacion personal: el autor menciona explicitamente "admin, organisation and everyday assistance" como area reforzada en esta generacion, por ejemplo para redactar correos, resumir documentos o estructurar tareas.
- Interaccion con documentos e imagenes: con el proyector multimodal y un backend compatible puede incorporar capturas de pantalla, diagramas o interfaces a la conversacion, util para soporte tecnico guiado o analisis de material visual.
- Prototipado de productos conversacionales: al ser Apache-2.0 y formato GGUF, sirve para validar flujos de chat y evaluar calidad conversacional en local antes de comprometerse con una API comercial.
- Base para ajustes especificos de dominio: su tamaño (13,5 B) permite hacer fine-tuning o LoRA en hardware de gama alta de consumo, partiendo de una base ya orientada a conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica cuantitativa, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir de 13,5 B de parametros y el numero de bits por peso habitual de cada cuantizacion (no incluyen KV cache ni overhead del runtime):

| Cuantizacion | Peso estimado de los pesos | VRAM practica recomendada (con contexto) |
|---|---|---|
| IQ4_XS | ≈7,2 GB | 10-12 GB |
| Q4_K_M | ≈8,1 GB | 12 GB |
| Q5_K_M | ≈9,6 GB | 12-16 GB |
| Q6_K | ≈11,1 GB | 16 GB |
| Q8_0 | ≈14,4 GB | 18-20 GB |
| f16 | ≈27 GB | 32 GB o mas |

- GPU recomendadas: RTX 4090 / RTX 4080 / RTX 4070 Ti Super (16 GB) para Q4-Q6_K; A100 40 GB, H100 o RTX 6000 Ada para f16 y contextos muy largos.
- Cabe en GPU de consumo: si. En tarjetas de 8 GB solo con IQ4_XS o Q4_K_M y contexto reducido; 12 GB cubren Q4_K_M con holgura; 16 GB permiten Q5_K_M o Q6_K; 24 GB (RTX 3090/4090) admiten Q8_0.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui, todos ellos mencionados o compatibles segun la ficha. vLLM y TGI tienen soporte GGUF limitado, por lo que conviene verificar la version antes de usarlos en servidor.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Nota sobre vision: requiere ademas el proyector multimodal y un backend que lo soporte, lo que incrementa ligeramente el consumo de memoria.
- Nota sobre contexto largo: la model card advierte que la cantidad de contexto utilizable depende del hardware y de la configuracion del backend, ya que la KV cache crece con la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas objetivas. La model card no identifica alternativas comparables y la informacion proporcionada no incluye otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Helcyon-Claude-Mythic-14b-v2.0-GGUF | ≈13,5 B | no disponible | GGUF | Apache-2.0 | no disponibles |
| mistralai/Ministral-3-14B-Instruct-2512 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponibles |
| Otras alternativas conversacionales de ~14 B | no disponible | no disponible | no disponible | no disponible | no disponibles |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion independiente: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Sesgo de origen en los datos: el ajuste se realiza sobre salidas generadas por modelos Claude, lo que puede reproducir el estilo, los sesgos y los patrones de respuesta de esos modelos, incluidos posibles sesgos culturales y de registro linguistico.
- Riesgo de alucinacion: no se documentan medidas de mitigacion ni tasas de error; como modelo de 13,5 B orientado a conversacion y escritura, es esperable que invente datos cuando se le piden hechos verificables.
- Solo ingles declarado: no se garantiza un rendimiento correcto en castellano ni en otros idiomas, a pesar de que el modelo base pueda tener capacidades multilingues.
- Sensibilidad al prompt de sistema: la propia model card advierte que los ajustes sobre Ministral son "sorprendentemente sensibles" al system prompt y que un prompt en conflicto puede volver al modelo verboso, repetitivo o estilisticamente extraño. En produccion esto implica fijar y versionar el prompt de sistema.
- Posicionamiento "uncensored" y "anti-corporate": el modelo se comercializa explicando que no aplica filtros corporativos, lo que aumenta el riesgo de generar contenido inapropiado y complica su uso en productos con requisitos de moderacion.
- Licencia Apache-2.0 sobre el ajuste: permite uso comercial, pero conviene verificar los terminos del modelo base (`mistralai/Ministral-3-14B-Instruct-2512`) y de cualquier dato de entrenamiento derivado de modelos de terceros, ya que podrian imponer condiciones adicionales.
- Nomenclatura: el uso de "Claude" en el nombre del modelo no implica afiliacion con Anthropic; es una referencia descriptiva al estilo, y su uso comercial podria plantear problemas de marca.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 77,8 GB, lo que dificulta encontrar reportes de terceros sobre su comportamiento real.
- Model card con lenguaje informal y bloques incompletos: parte del contenido distribuido esta truncado, lo que reduce la fiabilidad de la documentacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XeyonAI/Helcyon-Claude-Mythic-14b-v2.0-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Repositorio de Helcyon-WebUI: https://github.com/XeyonAI/Helcyon-WebUI
- Version Pro de Helcyon-WebUI en Gumroad: https://xeyonai.gumroad.com/l/mzcllf
- Paper, blog o demo adicionales: no disponible
