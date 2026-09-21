# XiaomiMiMo/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es el punto de control «equilibrado en eficiencia» de la serie MiMo-V2.6 desarrollada por Xiaomi (organización XiaomiMiMo). Se trata de un modelo omnimodal nativo (texto, imagen, vídeo y audio) construido sobre una arquitectura MoE dispersa, con una longitud de contexto declarada de 1.000.000 de tokens, pensado para cargas de trabajo de agente de horizonte largo: repositorios completos, trazas de herramientas y sesiones multi-turno extensas. Su rasgo diferencial es el escalado del aprendizaje por refuerzo: la serie se presenta como un esfuerzo por escalar cómputo de RL, diversidad de entornos y cómputo de evaluación de forma conjunta, de modo que el modelo amplíe su frontera de capacidades mediante exploración y retroalimentación.

El modelo se entrena con una única ejecución mixta de RL que abarca código, agentes generales, tareas visuales y ciberseguridad, en lugar de ejecuciones separadas por dominio. Sobre esa base se aplican mecanismos de evaluación agéntica por grupos (Groupwise Reward Synthesis y Groupwise Advantage Redistribution) que pretenden ordenar soluciones correctas entre sí y no solo distinguir acierto de fallo, además de una fase posterior de destilación on-policy multi-profesor con múltiples prefijos (MOPD2).

Es relevante ahora porque combina tres ejes que suelen aparecer por separado en modelos abiertos: multimodalidad nativa en un solo modelo, contexto de 1M tokens y un pipeline de RL orientado a agentes con licencia MIT. La model card declara 309B parámetros totales con 15B activos, mientras que los pesos publicados en safetensors suman 159.358.725.504 parámetros; conviene tratar esa discrepancia como un dato a verificar antes de dimensionar infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (sparse Mixture of Experts) con backbone híbrido SWA (atención de ventana deslizante) y decodificador especulativo Multi-Token Prediction (MTP) |
| Parametros totales | 159.358.725.504 (~159,36B) según los pesos safetensors publicados; la model card declara 309B totales (discrepancia sin resolver) |
| Parametros activos | 15B por token (según model card) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 y 8-bit (según etiquetas del repositorio); no se listan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere código personalizado) |
| Modalidades | Texto, imagen, vídeo y audio |
| Encoder de vision | MiMo ViT de 681M parámetros (28 capas: 24 SWA + 4 Full) |
| Encoder de audio | AudioTokenizer de 308M + patch encoder de audio de 127M |
| Decodificador especulativo | MTP de 5 capas |
| Tamano del repositorio | 177,8 GB |
| Fecha de publicacion | 21 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas. Por un lado, un backbone de lenguaje MoE disperso con atención híbrida: la mayoría de capas usan atención de ventana deslizante (SWA) y solo unas pocas emplean atención completa, lo que reduce el coste asociado al contexto muy largo. Por otro, encoders específicos por modalidad (un ViT de 681M parámetros para visión y un tándem AudioTokenizer de 308M más patch encoder de 127M para audio) que proyectan imagen, vídeo y audio al mismo espacio que el texto. Por último, un decodificador especulativo MTP de 5 capas que actúa como cabezal de predicción multi-token para acelerar la decodificación.

El entrenamiento se organiza en varias fases. La fase central es una ejecución mixta de RL sobre GRPO (Group Relative Policy Optimization) totalmente asíncrono, con lotes declarados de 1.568 prompts × 16 rollouts por paso y miles de millones de tokens por actualización, mezclando dominios de código, agentes generales, tareas visuales y ciberseguridad en el mismo lote. La señal de recompensa se escala mediante evaluación agéntica por grupos: GRS construye rúbricas específicas de tarea a partir de rollouts contrastados y las fusiona con el resultado de los tests; GAR ordena en línea las trayectorias que ya pasan y redistribuye la ventaja hacia las de mayor calidad, favoreciendo caminos más cortos y menos tokens por tarea. A esto se añade un arranque en frío basado en autocorrección (el modelo reescribe sus propios turnos desalineados), endurecimiento de entorno, cribado adversarial y verificación cruzada para contener el reward hacking, y una fase final de destilación on-policy multi-profesor (MOPD2) que combina rollouts autónomos del alumno con rollouts de un solo turno condicionados por prefijo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Comprensión de imagen y vídeo mediante el encoder ViT de 681M parámetros.
- Comprensión de audio mediante AudioTokenizer y patch encoder dedicados.
- Generación y edición de código en tareas de agente (DeepSWE v1.1: 67,9; MiMo Code Bench: 61,2).
- Uso de herramientas y function calling en entornos agénticos (Toolathlon-Verified: 73,6).
- Ejecución de tareas de agente de varios pasos con terminal y shell (Terminal Bench 2.1: 87,6; Terminal Bench 4.0: 28,8).
- Control de escritorio y automatización de interfaz gráfica (OSWorld-Verified: 80,8).
- Tareas de ciberseguridad ofensiva/defensiva evaluadas (CyberGym: 95,1; MiMo Cyber Bench: 77,2).
- Razonamiento visual y multimodal dentro del mismo modelo, sin adaptadores separados.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Decodificación especulativa integrada mediante MTP de 5 capas.
- Modo de agente con trazas de herramienta largas y sesiones múltiples.

## Casos de uso

- Agentes de código sobre repositorios completos: con 1M tokens de contexto el modelo puede ingerir un monorepo entero más el historial de issues y producir parches coherentes; los 67,9 puntos en DeepSWE v1.1 y 61,2 en MiMo Code Bench indican que está pensado para esta carga.
- Automatización de terminal y operaciones: el modelo puede encadenar comandos, interpretar salidas y corregir errores en un bucle agéntico, con 87,6 en Terminal Bench 2.1 y 28,8 en Terminal Bench 4.0 como referencia de su fiabilidad en shell.
- Atención al cliente multilingüe en inglés y chino: conversaciones multi-turno con historial largo y llamada a herramientas internas (consultas de pedidos, CRM) gracias al soporte de function calling y a la ventana de 1M tokens.
- Análisis de vídeo y audio a escala: revisión automática de grabaciones de reuniones, clases o material de vigilancia, combinando transcripción de audio y comprensión visual en un único pase.
- Automatización de escritorio y RPA: control de aplicaciones gráficas para tareas administrativas repetitivas, apoyándose en el 80,8 de OSWorld-Verified.
- Triaje y análisis en ciberseguridad: revisión de trazas, generación de pruebas de concepto y asistencia en respuesta a incidentes, con 95,1 en CyberGym y 77,2 en MiMo Cyber Bench.
- Asistencia documental para empresas con operaciones en China: procesamiento conjunto de documentación técnica en chino e inglés sin cambiar de modelo ni de pipeline.
- Base para destilación y ajuste fino propio: al publicarse bajo MIT y con pesos safetensors, puede servir como profesor o punto de partida para modelos más pequeños especializados.

## Benchmarks y rendimiento

Resultados publicados en la model card (no verificados de forma independiente). Se comparan con las versiones Pro de la misma familia y con modelos propietarios citados en la propia card.

| Benchmark | MiMo-V2.6 Flash | MiMo-V2.6 Pro | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 67,9 | 71,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,0 | 26,5 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 61,2 | 63,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 52,3 | 53,1 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 73,6 | 76,9 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | no disponible | 1673 | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 27,6 | 31,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 28,8 | 34,9 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 87,6 | 89,9 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 80,8 | 82,0 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 61,2 | 62,0 | 25,0 | 65,7 | 45,4 | 57,4 |
| CyberGym | 95,1 | 94,0 | 40,0 | no disponible | no disponible | no disponible |
| MiMo Cyber Bench | 77,2 | 80,2 | 0,0 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks de conocimiento general (MMLU, GSM8K, HumanEval) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para pesos en FP8/8-bit: aproximadamente 160 GB para 159,36B parámetros, más overhead de runtime y caché KV.
- VRAM para pesos en BF16: aproximadamente 319 GB si se despliega sin cuantizar.
- Caché KV con 1M tokens de contexto: no disponible un cálculo exacto (depende de número de capas, cabezas y dimensión de cabeza, no publicados), pero en la práctica exige GPUs con memoria alta o atención por páginas.
- GPU recomendadas: 2×H200 (141 GB cada una) o 4×H100 80 GB para FP8; 8×H100 80 GB o 4×H200 para BF16.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) no puede alojar los pesos ni siquiera en 4-bit (que rondarían los 80 GB).
- Despliegue: al ser un MoE con código personalizado (`custom_code`), requiere transformers con `trust_remote_code`; no hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones viables con los artefactos actuales. Para servir en producción, vLLM o TGI son las vías razonables siempre que exista soporte de la arquitectura.
- Throughput: no disponible. Al activar solo 15B parámetros por token, se espera una velocidad de decodificación superior a la de un denso de 159B, pero no hay cifras publicadas.
- Almacenamiento: 177,8 GB de repositorio, más espacio para caché de cuantización y checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidades | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 159,36B según safetensors (309B declarados) / 15B activos | 1M tokens | MIT | Texto, imagen, vídeo, audio | Pesos en HuggingFace, 0 descargas, 16 likes |
| MiMo-V2.6-Pro-RL | no disponible | 1M tokens (según serie) | MIT | Texto, imagen, vídeo, audio | Pesos en HuggingFace; supera al Flash en la mayoría de benchmarks de la card |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | no disponible | Referencia de generación anterior; resultados notablemente inferiores (por ejemplo, DeepSWE v1.1 19,0 frente a 67,9) |
| Claude Opus 5 / GPT-5.6 Sol / Claude Fable 5 | no disponible | no disponible | Propietaria | no disponible | Solo API; superan al Flash en código y Terminal Bench 4.0, pero quedan por debajo en AutomationBench y CyberGym |

La comparación con modelos propietarios procede exclusivamente de la tabla publicada por el autor; no hay evaluación independiente ni detalles de configuración de los modelos de referencia.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara 309B totales con 15B activos, mientras que los safetensors suman 159,36B. Hay que resolverlo antes de planificar memoria y coste.
- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano u otras lenguas no está evaluado y probablemente sea inferior.
- Resultados autodeclarados: todos los benchmarks proceden de la model card, sin verificación externa, y las cifras de modelos propietarios competidores no son reproducibles públicamente.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de factualidad (no hay resultados de MMLU ni de tareas de conocimiento).
- Riesgo de reward hacking: la propia card reconoce que el bucle de RL requiere endurecimiento de entorno, cribado adversarial y verificación cruzada para «mantener el bucle honesto», lo que indica que es una superficie de fallo conocida.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o alineación más allá de la descripción del arranque en frío por autocorrección.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- Despliegue: sin soporte declarado en llama.cpp u Ollama y sin pesos GGUF, el uso en hardware modesto no es viable; el coste mínimo realista es un nodo multi-GPU.
- Adopción temprana: 0 descargas y 16 likes en el momento de la consulta, con fecha de creación de septiembre de 2026; la comunidad todavía no ha validado el modelo.
- Licencia MIT: permite uso comercial y modificación, pero no exime de cumplir las licencias de los componentes de terceros que pueda incorporar el repositorio, no detalladas en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Informe técnico (PDF en el repositorio): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub de MiMo (imágenes y figuras): https://github.com/XiaomiMiMo/MiMo
- Modelo hermano MiMo-V2.6-Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces anteriores proceden de la model card del repositorio.
