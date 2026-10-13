# zai-org/GLM-5

## Resumen

GLM-5 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org) y publicado con licencia MIT. Se trata de un transformer de tipo mezcla de expertos (MoE) orientado a ingeniería de sistemas complejos y tareas agénticas de horizonte largo, es decir, flujos de trabajo con muchas llamadas a herramientas y pasos encadenados. La model card indica 744.000 millones de parámetros totales con 40.000 millones activos por token, y el repositorio de safetensors declara 753.864.139.008 parámetros, una cifra ligeramente superior que conviene tener en cuenta al planificar el despliegue.

La evolución respecto a la generación anterior es doble: escala desde los 355.000 millones de parámetros (32.000 millones activos) de GLM-4.5 hasta los 744.000 millones (40.000 millones activos), y amplía los datos de preentrenamiento de 23 billones a 28,5 billones de tokens. Además, integra DeepSeek Sparse Attention (DSA), lo que reduce el coste de despliegue en contextos largos sin sacrificar capacidad de contexto largo.

El modelo es relevante porque compite directamente con pesos abiertos de la misma categoría (DeepSeek-V3.2, Kimi K2.5) y con modelos propietarios de frontera (Claude Opus 4.5, Gemini 3 Pro, GPT-5.2). En la tabla de benchmarks publicada por el autor, GLM-5 alcanza 77,8 en SWE-bench Verified, 56,2 en Terminal-Bench 2.0 y 89,7 en τ²-Bench, con especial ventaja en tareas de navegación web (BrowseComp 62,0) y ciberseguridad (CyberGym 43,2). El repo acumula 718.973 descargas y 2.136 likes, con actualización posterior a la publicación inicial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con DeepSeek Sparse Attention (DSA); tag de HuggingFace `glm_moe_dsa` |
| Parámetros totales | 744.000 millones según la model card; 753.864.139.008 según los safetensors del repositorio |
| Parámetros activos | 40.000 millones (MoE) |
| Longitud de contexto | No disponible de forma explícita en la información proporcionada; en las evaluaciones se emplea una longitud de contexto máxima de 202.752 tokens (HLE con herramientas) y una generación máxima de 131.072 tokens |
| Tipos de cuantización | No disponible (el repositorio publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 1507,8 GB |
| Fecha de creación | 2026-02-11 |
| Última actualización | 2026-08-11 |
| Descargas / likes | 718.973 / 2.136 |

## Arquitectura y entrenamiento

GLM-5 es un transformer disperso de tipo MoE: activa 40.000 millones de parámetros de un total de 744.000 millones por token generado, lo que desacopla la capacidad de almacenamiento (que escala con los parámetros totales) del coste computacional por token (que escala con los activos). La innovación arquitectónica más destacada es la integración de DeepSeek Sparse Attention (DSA), que según el autor reduce de forma sustancial el coste de despliegue manteniendo la capacidad de contexto largo. El modelo está diseñado específicamente para ingeniería de sistemas complejos y tareas agénticas de horizonte largo, lo que condiciona tanto la arquitectura como el post-entrenamiento.

En la fase de preentrenamiento se usaron 28,5 billones de tokens, frente a los 23 billones de GLM-4.5. La composición exacta del dataset no se detalla en la información disponible. Para el post-entrenamiento, el autor desarrollo `slime`, una infraestructura de RL asíncrona que incrementa el rendimiento y la eficiencia del entrenamiento por refuerzo y permite iteraciones de post-entrenamiento más granulares. No se especifica en la información disponible si se emplearon además etapas de RLHF, DPO u otras técnicas de alineamiento. El autor sitúa a GLM-5 por delante de GLM-4.7 en el conjunto de benchmarks académicos evaluados y lo describe como el mejor modelo de pesos abiertos en razonamiento, código y tareas agénticas, acercándose a los modelos de frontera.

## Capacidades

- Generación de texto conversacional y finalización de texto en inglés y chino.
- Razonamiento avanzado: matemáticas competitivas (AIME 2026 I: 92,7; HMMT noviembre 2025: 96,9; IMOAnswerBench: 82,5) y razonamiento científico (GPQA-Diamond: 86,0).
- Razonamiento experto de alta dificultad, incluido el modo con herramientas: 30,5 en Humanity's Last Exam sin herramientas y 50,4 con herramientas.
- Ingeniería de software: 77,8 en SWE-bench Verified y 73,3 en SWE-bench Multilingual, con resolución de incidencias reales sobre repositorios.
- Uso de terminal y operación de sistemas: 56,2 en Terminal-Bench 2.0 (Terminus 2) y hasta 61,1 con Claude Code.
- Tool calling y function calling: 67,8 en MCP-Atlas (Public Set) y 38,0 en Tool-Decathlon, con soporte explícito del protocolo MCP.
- Comportamiento agéntico multi-paso y de horizonte largo: τ²-Bench 89,7 y simulaciones económicas de largo plazo (Vending Bench 2 con 4.432,12 dólares de beneficio).
- Navegación web e investigación autónoma: BrowseComp 62,0, 75,9 con gestión de contexto y 72,7 en la variante en chino (BrowseComp-Zh).
- Ciberseguridad ofensiva y defensiva en entornos controlados: 43,2 en CyberGym.
- Capacidades multilingües limitadas a inglés y chino según la información disponible; no se documentan evaluaciones en castellano.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información proporcionada.

## Casos de uso

- Mantenimiento autónomo de repositorios: GLM-5 puede recibir una incidencia de GitHub, localizar el fichero afectado, aplicar el parche y validarlo ejecutando la suite de tests. Su 77,8 en SWE-bench Verified y su soporte de terminal lo hacen adecuado para pipelines de CI/CD donde el modelo propone y verifica cambios sin intervención humana directa.
- Refactorización de código a gran escala en varios lenguajes: con 73,3 en SWE-bench Multilingual, puede abordar migraciones de código entre lenguajes o actualizaciones de dependencias en repositorios con múltiples lenguajes, generando los cambios y las pruebas correspondientes.
- Agentes de operaciones y SRE: la puntuación de 56,2 en Terminal-Bench 2.0 indica competencia en el uso de shell, lectura de logs y ejecución de comandos de diagnóstico, útil para agentes que responden a alertas, revisan el estado de servicios y aplican remediaciones siguiendo un runbook.
- Investigación web automatizada y generación de informes: con 62,0 en BrowseComp y 75,9 con gestión de contexto, el modelo puede planificar búsquedas, navegar por múltiples fuentes, extraer datos y sintetizar un informe con citas, un flujo que requiere mantener el estado durante muchas llamadas a herramientas.
- Asistentes internos con acceso a herramientas corporativas vía MCP: los 67,8 puntos en MCP-Atlas indican que el modelo selecciona y encadena herramientas correctamente, lo que permite conectarlo a bases de datos, CRM y sistemas de ticketing a través del protocolo MCP para responder consultas operativas.
- Evaluación de seguridad y pentesting asistido: los 43,2 puntos en CyberGym lo sitúan como herramienta viable para analizar superficies de ataque, interpretar resultados de escáneres y proponer vectores de explotación en entornos autorizados.
- Razonamiento científico y matemático asistido: con 92,7 en AIME 2026 I y 96,9 en HMMT, puede emplearse para verificar demostraciones, resolver problemas de competición o asistir en derivaciones simbólicas donde se requiere precisión alta y cadenas de razonamiento largas.
- Simulación de decisiones económicas y planificación de largo plazo: los resultados de Vending Bench 2 muestran capacidad de mantener una política coherente durante episodios extensos, aplicable a agentes de pricing, gestión de inventario o negociación automatizada.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo. Los asteriscos indican puntuaciones sobre el conjunto completo según la nota al pie de la model card; la daga indica la versión verificada de Terminal-Bench 2.0.

| Benchmark | GLM-5 | GLM-4.7 | DeepSeek-V3.2 | Kimi K2.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (xhigh) |
|---|---|---|---|---|---|---|---|
| HLE | 30,5 | 24,8 | 25,1 | 31,5 | 28,4 | 37,2 | 35,4 |
| HLE (con herramientas) | 50,4 | 42,8 | 40,8 | 51,8 | 43,4* | 45,8* | 45,5* |
| AIME 2026 I | 92,7 | 92,9 | 92,7 | 92,5 | 93,3 | 90,6 | - |
| HMMT nov. 2025 | 96,9 | 93,5 | 90,2 | 91,1 | 91,7 | 93,0 | 97,1 |
| IMOAnswerBench | 82,5 | 82,0 | 78,3 | 81,8 | 78,5 | 83,3 | 86,3 |
| GPQA-Diamond | 86,0 | 85,7 | 82,4 | 87,6 | 87,0 | 91,9 | 92,4 |
| SWE-bench Verified | 77,8 | 73,8 | 73,1 | 76,8 | 80,9 | 76,2 | 80,0 |
| SWE-bench Multilingual | 73,3 | 66,7 | 70,2 | 73,0 | 77,5 | 65,0 | 72,0 |
| Terminal-Bench 2.0 (Terminus 2) | 56,2 / 60,7 † | 41,0 | 39,3 | 50,8 | 59,3 | 54,2 | 54,0 |
| Terminal-Bench 2.0 (Claude Code) | 56,2 / 61,1 † | 32,8 | 46,4 | - | 57,9 | - | - |
| CyberGym | 43,2 | 23,5 | 17,3 | 41,3 | 50,6 | 39,9 | - |
| BrowseComp | 62,0 | 52,0 | 51,4 | 60,6 | 37,0 | 37,8 | - |
| BrowseComp (con gestión de contexto) | 75,9 | 67,5 | 67,6 | 74,9 | 67,8 | 59,2 | 65,8 |
| BrowseComp-Zh | 72,7 | 66,6 | 65,0 | 62,3 | 62,4 | 66,8 | 76,1 |
| τ²-Bench | 89,7 | 87,4 | 85,3 | 80,2 | 91,6 | 90,7 | 85,5 |
| MCP-Atlas (Public Set) | 67,8 | 52,0 | 62,2 | 63,8 | 65,2 | 66,6 | 68,0 |
| Tool-Decathlon | 38,0 | 23,8 | 35,2 | 27,8 | 43,5 | 36,4 | 46,3 |
| Vending Bench 2 | 4.432,12 $ | 2.376,82 $ | 1.034,00 $ | 1.198,46 $ | 4.967,06 $ | 5.478,16 $ | 3.591,33 $ |

Detalles de evaluación declarados por el autor: para HLE y otras tareas de razonamiento se emplea una longitud máxima de generación de 131.072 tokens con `temperature=1.0`, `top_p=0.95`; en HLE con herramientas se usa una longitud de contexto máxima de 202.752 tokens; el juez es GPT-5.2 en configuración medium. Para SWE-bench se ejecuta la suite con OpenHands, `temperature=0.7` y un prompt de instrucciones específico.

## Requisitos de hardware

Las cifras de memoria que se indican a continuación son estimaciones aritméticas derivadas del número de parámetros declarado en safetensors (753.864.139.008) y no incluyen activaciones, caché KV ni sobrecarga del runtime. No proceden de la documentación del autor.

- Pesos en bf16/fp16: aproximadamente 1.507 GB, coherente con el tamaño del repositorio (1507,8 GB).
- Pesos a 8 bits: aproximadamente 754 GB.
- Pesos a 4 bits: aproximadamente 377 GB.
- GPU recomendadas para bf16: se requieren del orden de 19-20 GPUs de 80 GB solo para los pesos, lo que implica varios nodos (por ejemplo, tres nodos de 8x H100 80 GB o configuraciones equivalentes de A100 80 GB) o bien reparto de expertos con offloading.
- GPU a 4 bits: del orden de 5-6 GPUs de 80 GB para los pesos, antes de contabilizar caché KV y activaciones.
- GPU de consumo: no cabe en una sola GPU de consumo. Incluso a 4 bits, los ~377 GB exceden ampliamente los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Sería necesario offloading a RAM/SSD, algo que el autor no documenta para este modelo.
- Opciones de despliegue: la información disponible solo confirma compatibilidad con la biblioteca transformers y pesos en safetensors, además del tag `endpoints_compatible`. No se documentan soporte oficial de vLLM, SGLang, TensorRT-LLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Al ser un MoE con 40.000 millones de parámetros activos, el coste por token debería aproximarse al de un modelo denso de ese tamaño, pero no hay cifras publicadas que lo confirmen.
- El uso de DSA se presenta como una reducción del coste de despliegue en contextos largos, sin cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|---|
| GLM-5 | 744.000 M (753.864 M en safetensors) | 40.000 M | No disponible (202.752 tokens usados en evaluación) | MIT | Pesos abiertos en HuggingFace | SWE-bench Verified 77,8; τ²-Bench 89,7; BrowseComp 62,0 |
| GLM-4.7 | No disponible | No disponible | No disponible | No disponible | No disponible | SWE-bench Verified 73,8; HLE 24,8 |
| DeepSeek-V3.2 | No disponible | No disponible | No disponible | No disponible | No disponible | SWE-bench Verified 73,1; Tool-Decathlon 35,2 |
| Kimi K2.5 | No disponible | No disponible | No disponible | No disponible | No disponible | HLE 31,5; GPQA-Diamond 87,6 |
| Claude Opus 4.5 | No disponible | No disponible | No disponible | Propietaria | Solo API | SWE-bench Verified 80,9; Tool-Decathlon 43,5 |
| Gemini 3 Pro | No disponible | No disponible | No disponible | Propietaria | Solo API | GPQA-Diamond 91,9; Vending Bench 2 5.478,16 $ |
| GPT-5.2 (xhigh) | No disponible | No disponible | No disponible | Propietaria | Solo API | HMMT 97,1; GPQA-Diamond 92,4 |

GLM-5 es el único modelo de la comparativa del que se dispone de licencia MIT y pesos abiertos verificables en la información proporcionada. Frente a los modelos propietarios mantiene una brecha de entre 2 y 6 puntos en razonamiento experto (HLE 30,5 frente a 37,2 de Gemini 3 Pro) y en ingeniería de software medida con SWE-bench Verified (77,8 frente a 80,9 de Claude Opus 4.5), pero supera a todos los modelos comparados en BrowseComp (62,0) y en τ²-Bench queda solo por detrás de Claude Opus 4.5 y Gemini 3 Pro.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés y chino. No hay evaluaciones publicadas en castellano ni en otras lenguas, por lo que el rendimiento fuera de esos dos idiomas es desconocido.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineamiento en la información proporcionada. Al ser entrenado principalmente con datos en inglés y chino, es previsible un sesgo cultural y lingüístico hacia esas dos comunidades.
- Alucinación: el modelo alcanza 30,5 en HLE sin herramientas, lo que implica una tasa de error considerable en preguntas de conocimiento experto. En tareas agénticas de horizonte largo, un error de razonamiento temprano puede propagarse a lo largo de toda la cadena de pasos.
- Datos de benchmarks autoinformados: todas las cifras de la tabla de rendimiento proceden del autor del modelo y no se aporta una verificación independiente en la información disponible.
- Coste de despliegue: con aproximadamente 1,5 TB de pesos en bf16, la inferencia local exige infraestructura multinodo. No se documentan cuantizaciones oficiales, lo que dificulta el despliegue en clústeres pequeños.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones conocidas más allá de la atribución habitual. No obstante, conviene revisar los términos de los datos de entrenamiento, que no se detallan.
- Contexto: la longitud de contexto oficial del modelo no se declara de forma explícita. Las cifras de 131.072 tokens de generación y 202.752 tokens de contexto corresponden a la configuración de evaluación de HLE, no necesariamente al máximo soportado en producción.
- Ecosistema: no se confirma soporte oficial en motores de inferencia de alto rendimiento (vLLM, SGLang, TensorRT-LLM) ni variantes GGUF para llama.cpp u Ollama, lo que limita las opciones de despliegue más allá de transformers.
- Confusión de versiones: la documentación web de Z.ai menciona GLM-5.2 y GLM-5.3-Flash, versiones posteriores a este checkpoint. Conviene fijar la revisión exacta del repositorio antes de integrarlo en producción.
- Fechas: el modelo se publicó el 11 de febrero de 2026 y se actualizó el 11 de agosto de 2026; los cambios introducidos en esa actualización no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zai-org/GLM-5
- Paper: https://huggingface.co/papers/2602.15763
- Repositorio en GitHub: https://github.com/zai-org/GLM-5
- Blog técnico: https://z.ai/blog/glm-5
- Documentación de la API: https://docs.z.ai/guides/llm/glm-5
- Demo de chat: https://chat.z.ai
- Infraestructura de RL slime: https://github.com/THUDM/slime
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
- Plataforma Z.ai: https://z.ai/
- Página corporativa de Z.ai: https://z.ai/company
- Entrada de Z.ai en Wikipedia: https://en.wikipedia.org/wiki/Z.ai
- Plataforma BigModel (Open): https://open.bigmodel.cn/
