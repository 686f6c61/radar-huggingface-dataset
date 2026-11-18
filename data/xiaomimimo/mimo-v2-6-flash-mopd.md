# XiaomiMiMo/MiMo-V2.6-Flash-MOPD

## Resumen

MiMo-V2.6-Flash-MOPD es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) disperso desarrollado por Xiaomi, con 309.000 millones de parámetros totales y 15.000 millones activados por token. Se trata de la version MOPD (Multi-Teacher On-Policy Distillation) del checkpoint MiMo-V2.6-Flash-RL, en la que se destilan varios profesores especializados por dominio sobre el modelo estudiante mediante entrenamiento on-policy. El modelo acepta texto, imagen, video y audio, y esta disenado especificamente para cargas de trabajo agenticas con llamadas a herramientas.

La innovacion principal de esta variante es la mitigacion de la repeticion de llamadas a herramientas (tool-call repetition), un fallo silencioso en el que el modelo emite llamadas identicas o muy similares de forma repetida sin avanzar en la tarea. Segun el autor, el proceso MOPD2 tambien extiende la destilacion a dominios donde la verificacion automatica es dificil, como el desarrollo de videojuegos de largo horizonte, la investigacion cientifica y la inteligencia corporal (embodied intelligence).

Con una ventana de contexto de 1 millon de tokens, licencia MIT y pesos en safetensors, el modelo se posiciona como una alternativa abierta a sistemas multimodales propietarios para despliegues de agentes complejos. El repositorio ocupa 177,8 GB y acumula 23.530 descargas y 72 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (Mixture of Experts) con backbone hibrido SWA y decodificador especulativo MTP |
| Parametros totales | 309B (310.756.322.688 segun safetensors) |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit, FP8 (segun tags del repositorio) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, custom_code) |
| Capas (total / SWA / GA) | 48 / 39 / 9 |
| Hidden size | 4096 |
| Cabeceras SWA (Q/KV) | 64 / 8 |
| Encoder de vision | MiMo ViT de 681M parametros (28 capas: 24 SWA + 4 Full) |
| Encoder de audio | AudioTokenizer de 308M + patch encoder de 127M |
| Multi-Token Prediction | Decodificador especulativo de 5 capas |
| Modalidades | Texto, imagen, video y audio |
| Tamano del repositorio | 177,8 GB |

## Arquitectura y entrenamiento

El backbone es un transformer MoE disperso de 48 capas, de las cuales 39 usan atencion de ventana deslizante (SWA) y 9 usan atencion global (GA), con un tamano oculto de 4096 y 64 cabeceras de consulta frente a 8 de clave/valor en las capas SWA. El modelo incorpora un decodificador especulativo de Multi-Token Prediction (MTP) de 5 capas, que acelera la generacion prediciendo varios tokens por paso. Los modulos multimodales son un encoder de vision MiMo ViT de 681M parametros y un encoder de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M.

El entrenamiento de esta variante se basa en MOPD2 (Multi-Teacher On-Policy Distillation), que destila varios profesores especializados en el estudiante de forma on-policy. Los profesores se dividen en dos familias: profesores mixRL, entrenados sobre tareas verificables, y profesores SFT, entrenados sobre demostraciones sinteticas para tareas abiertas donde la recompensa es dificil de disenar. La actualizacion combina tres flujos: MOPD estandar (los profesores mixRL supervisan rollouts autonomos completos), Teacher-Prefix OPD (prefijos tomados de rollouts del profesor, con una puntuacion por turno) y SFT-Prefix OPD (prefijos de demostraciones SFT sobre los que el modelo escribe su propia continuacion). El checkpoint parte de MiMo-V2.6-Flash-RL e incorpora una ejecucion corta de un profesor especializado para corregir la repeticion de llamadas a herramientas.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen mediante el encoder MiMo ViT de 681M parametros.
- Comprension de video, segun el tag `video-understanding` del repositorio.
- Comprension de audio mediante AudioTokenizer y patch encoder dedicados.
- Llamadas a herramientas (tool calling / function calling) con mitigacion especifica de la repeticion de llamadas.
- Flujos agenticos y razonamiento multi-paso, incluyendo desarrollo de videojuegos de largo horizonte, investigacion cientifica e inteligencia corporal (dominios cubiertos por MOPD2).
- Contexto largo de hasta 1M tokens para documentos, historiales de agente y videos extensos.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa MTP para reducir latencia de generacion.

## Casos de uso

- Agentes autonomos de larga duracion: el contexto de 1M tokens permite mantener el historial completo de un agente con decenas de pasos y llamadas a herramientas sin truncar, y la correccion de tool-call repetition evita bucles improductivos en produccion.
- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, audios de usuario y texto en una misma conversacion, gestionando el historial completo de la sesion gracias a la ventana de contexto extendida.
- Analisis de video y audio para moderacion o resumen: con encoders dedicados de video y audio, es adecuado para pipelines que extraen informacion de grabaciones largas y generan resumenes estructurados.
- Asistencia al desarrollo de software: soporta tool calling para integrarse en pipelines de CI/CD, ejecutar comandos, consultar repositorios y encadenar pasos de depuracion con contexto de codigo extenso.
- Investigacion cientifica asistida: el entrenamiento MOPD2 cubre dominios cientificos donde la verificacion automatica es dificil, lo que lo hace util para revision de literatura, generacion de hipotesis y analisis de datos experimentales.
- Automatizacion de tareas de escritorio o embodied intelligence: el modelo esta entrenado para dominios de inteligencia corporal, lo que permite integrarlo en entornos de control de agentes que interactuan con interfaces o dispositivos.
- Procesamiento de documentos largos multilingues (ingles y chino): contratos, informes tecnicos o expedientes de hasta 1M tokens con extraccion de datos y preguntas y respuestas sobre el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia una figura sobre la tasa de repeticion de llamadas a herramientas a nivel de respuesta (RL frente a MOPD, por longitud de contexto y harness de agente), sin valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 309B parametros totales, en FP8 se requieren aproximadamente 310 GB de memoria; en 8-bit, un valor similar. No cabe en GPUs de consumo individuales.
- GPU recomendadas: nodos multi-GPU de clase A100 (80 GB) o H100 (80 GB); se necesitan al menos 4-8 unidades para FP8/8-bit segun el esquema de paralelizacion.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en ninguna GPU consumer actual; requeriria cuantizaciones muy agresivas no documentadas en la informacion disponible.
- Opciones de despliegue: transformers con `custom_code` (formato nativo del repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El decodificador especulativo MTP de 5 capas esta disenado para reducir la latencia de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD | 309B | 15B | 1M | Texto, imagen, video, audio | MIT |
| MiMo-V2.6-Flash-RL | 309B (misma familia) | 15B | 1M | Texto, imagen, video, audio | MIT |
| MiMo-V2.6-Pro-MOPD | no disponible | no disponible | no disponible | no disponible | MIT |
| MiMo-V2.6-Pro-RL | no disponible | no disponible | no disponible | no disponible | MIT |

La informacion proporcionada solo permite comparar con los otros checkpoints de la misma familia MiMo-V2.6. No se dispone de datos de rendimiento comparado con modelos de otras familias, por lo que no es posible establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado.
- Repeticion de llamadas a herramientas: aunque esta variante mitiga el problema, la model card lo describe como un fallo facil de pasar por alto; conviene monitorizar los agentes en produccion.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; en tareas abiertas sin verificacion automatica el riesgo persiste.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Requisitos de hardware: 309B parametros implican infraestructura multi-GPU de centro de datos; el coste de despliegue es elevado.
- Licencia MIT: permite uso comercial y modificacion, pero no se detallan clausulas adicionales sobre los datos de entrenamiento ni sobre los encoders multimodales.
- Contexto largo: aunque se declara 1M tokens, no se aportan resultados de evaluacion especificos de recuperacion en contextos muy largos.
- No se documentan benchmarks, latencias ni throughput, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Checkpoint base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Variante Pro MOPD: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Variante Pro RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Blog sobre repeticion de llamadas a herramientas: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API: https://platform.xiaomimimo.com
- MiMo Studio: https://aistudio.xiaomimimo.com
- MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
