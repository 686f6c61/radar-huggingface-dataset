# XiaomiMiMo/MiMo-V2.6-Pro-RL

## Resumen

MiMo-V2.6-Pro-RL es el checkpoint insignia de la serie MiMo-V2.6, desarrollado por XiaomiMiMo (Xiaomi). Se presenta como un modelo omnimodal nativo que procesa texto, imagen, vídeo y audio en una única arquitectura, con una ventana de contexto de 1.000.000 de tokens pensada para repositorios de código extensos, trazas de herramientas y ejecuciones de agente de múltiples sesiones. Su propuesta central es escalar el aprendizaje por refuerzo hasta un bucle de automejora: en lugar de ejecutar entrenamientos RL separados por dominio, la serie utiliza una única ejecución mixta que cubre código, agentes generales, visión y ciberseguridad.

La arquitectura es un MoE disperso con backbone híbrido de atención de ventana deslizante (SWA) y un decodificador especulativo de predicción multi-token (MTP) de 5 capas. La model card declara 1,02 billones de parámetros totales con 42.000 millones activos, aunque el metadata de safetensors del repositorio reporta 524.121.348.864 parámetros: una discrepancia que conviene verificar antes de dimensionar infraestructura. Incorpora un codificador visual MiMo ViT de 681M parámetros y un codificador de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M.

Es relevante ahora porque documenta un cambio de método en el post-entrenamiento: el reward se escala mediante evaluación agéntica por grupos (Groupwise Reward Synthesis y Groupwise Advantage Redistribution) sobre GRPO asíncrono con lotes de 1.568 prompts × 16 rollouts por paso, además de una fase de destilación on-policy multi-profesor (MOPD2) posterior al RL mixto. Los resultados publicados sitúan al modelo cerca de referencias propietarias en benchmarks de agente y código, con licencia MIT y pesos abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse MoE) con backbone híbrido de atención de ventana deslizante (SWA) y decodificador especulativo MTP de 5 capas |
| Parametros totales | 1,02 B (1,02 billones) segun la model card; el metadata de safetensors reporta 524.121.348.864 (≈524 B). Discrepancia no resuelta en la informacion disponible |
| Parametros activos | 42 B (segun model card) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | fp8 y 8-bit (etiquetas del repositorio); no se detallan otros formatos |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 573,5 GB) |
| Codificador de vision | MiMo ViT de 681 M de parametros (28 capas: 24 SWA + 4 full) |
| Codificador de audio | AudioTokenizer de 308 M + patch encoder de audio de 127 M |
| Prediccion multi-token | Decodificador especulativo de 5 capas |
| Modalidades | Texto, imagen, video y audio |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer con mezcla de expertos dispersa y atención híbrida: la mayor parte de las capas emplea ventana deslizante y solo un subconjunto usa atención completa, lo que reduce el coste del contexto largo hasta 1M de tokens. Sobre ese backbone se acoplan tres componentes independientes: el codificador visual MiMo ViT (681M, 28 capas, 24 de ellas SWA), el codificador de audio (AudioTokenizer de 308M más un patch encoder de 127M) y un decodificador especulativo MTP de 5 capas que acelera la generación mediante predicción multi-token. La model card declara 1,02 billones de parámetros totales con 42.000 millones activos.

El entrenamiento se articula en varias fases descritas por el autor. Primero, un arranque en frío de autocorrección en el que el modelo reescribe sus propios turnos desalineados. Después, una única ejecución de RL mixta («You Only RL Once») que mezcla tareas de código, agentes generales, visión y ciberseguridad en el mismo lote, con distintos harness de evaluación, para que las estrategias se transfieran a harness no vistos en entrenamiento. El algoritmo es GRPO asíncrono con lotes de 1.568 prompts × 16 rollouts por paso y miles de millones de tokens por actualización. Para evitar que el reward binario pass/fail no discrimine entre soluciones correctas, se añaden dos mecanismos: Groupwise Reward Synthesis (GRS), que construye rúbricas específicas de tarea a partir de rollouts contrastados y las fusiona con el resultado del test, y Groupwise Advantage Redistribution (GAR), que reordena online las trayectorias correctas y desplaza la ventaja hacia las de mayor calidad, favoreciendo caminos más cortos y menos tokens por tarea. Finalmente, MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation) combina rollouts autónomos del alumno con rollouts de un solo turno condicionados por prefijo de profesor y de SFT, reutilizando historiales para no regenerar turnos previos. La model card menciona además endurecimiento del entorno, cribado adversarial y verificación cruzada para evitar reward hacking.

## Capacidades

- Generación de texto conversacional en ingles y chino.
- Comprensión de imagen y video (vision-language, video-understanding).
- Procesamiento de audio mediante AudioTokenizer y patch encoder dedicados.
- Contexto largo de 1.000.000 de tokens para repositorios completos, trazas de herramientas y sesiones de agente prolongadas.
- Agentes y razonamiento multi-paso: evaluado en Terminal Bench 4.0 y 2.1, OSWorld-Verified, AutomationBench, Toolathlon-Verified, Agents' Last Exam y JobBench.
- Uso de herramientas (tool calling): implícito en los benchmarks de agente y en la descripción del entrenamiento con harness mixtos; la model card no detalla el formato exacto de function calling.
- Generación y edición de código: DeepSWE v1.1, ProgramBench y MiMo Code Bench.
- Ciberseguridad ofensiva/defensiva: CyberGym, MiMo Cyber Bench y ExploitGym.
- Decodificación especulativa integrada (MTP de 5 capas) para acelerar la inferencia.
- Capacidad de autocorrección entrenada en la fase de arranque en frío.

## Casos de uso

- Agentes de terminal y automatización de sistema operativo: el modelo está evaluado específicamente en Terminal Bench y OSWorld-Verified, por lo que encaja en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa sobre una máquina virtual o contenedor.
- Ingeniería de software sobre repositorios grandes: con 1M de tokens de contexto puede cargar un repositorio completo junto con sus tests y el historial de issues, y generar parches verificables (DeepSWE v1.1, 71,9).
- Orquestación de herramientas empresariales: Toolathlon-Verified (76,9) y AutomationBench v1.0.6 (53,1) lo sitúan como candidato para flujos que encadenan APIs, hojas de cálculo, CRM y correo en tareas multi-paso.
- Análisis de vídeo y audio en un solo pipeline: al integrar codificadores de imagen, vídeo y audio, permite resumir reuniones o revisar material audiovisual sin encadenar modelos separados.
- Auditoría y respuesta en ciberseguridad: las puntuaciones de CyberGym (94,0) y MiMo Cyber Bench (80,2) apuntan a uso en análisis de vulnerabilidades y tareas de explotación controlada dentro de entornos autorizados.
- Evaluación automática de agentes: el método de graduación agéntica por grupos descrito en la model card puede reutilizarse para puntuar trayectorias de otros agentes cuando el criterio pass/fail no discrimina calidad.
- Asistentes documentales multilingües en inglés y chino: atención al cliente o soporte técnico bilingüe con contexto largo para arrastrar historial de conversaciones y documentación.
- Procesamiento por lotes de código heredado: migración o modernización de bases de código extensas aprovechando el contexto de 1M tokens y la decodificación especulativa para reducir el coste por token generado.

## Benchmarks y rendimiento

Resultados publicados en la model card (MiMo-V2.6 Pro frente a alternativas):

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | no disponible | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |
| CyberGym | 94,0 | 95,1 | 40,0 | no disponible | no disponible | no disponible |
| MiMo Cyber Bench | 80,2 | 77,2 | 0,0 | no disponible | no disponible | no disponible |

El valor de ExploitGym aparece truncado en la informacion disponible. No se han publicado en la informacion disponible resultados de benchmarks clasicos de conocimiento general (MMLU, GSM8K, HumanEval) ni datos de evaluación en castellano.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros; la model card no publica requisitos oficiales.

- Peso de los pesos en precision completa: con 524.121.348.864 parametros, bf16/fp16 requiere aproximadamente 1,05 TB de memoria; con 1,02 billones de parametros, unos 2,04 TB. En fp8/8-bit, aproximadamente 524 GB o 1,02 TB respectivamente.
- Cuantizacion de 4 bits: alrededor de 262 GB (escenario de 524 B) o 510 GB (escenario de 1,02 B).
- GPU recomendadas: despliegue en fp8/8-bit viable en nodos de 8×H100 80 GB (640 GB) o 8×H200; en bf16 exige multiples nodos (por ejemplo, 16×H100 para el escenario de 524 B).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer habituales, ni siquiera en 4 bits.
- Almacenamiento: el repositorio ocupa 573,5 GB, por lo que hay que prever ese espacio en disco o en cache de descarga.
- Opciones de despliegue: la libreria declarada es transformers con `custom_code`, lo que obliga a `trust_remote_code=True`. El soporte especifico de vLLM, SGLang, TGI, llama.cpp u Ollama no se detalla en la informacion disponible; llama.cpp y Ollama no son viables para este tamano en hardware de consumo.
- Latencia y throughput: no disponible. El decodificador especulativo MTP de 5 capas esta disenado para reducir el coste por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL | 1,02 B declarados / 524 B en safetensors, 42 B activos | 1M tokens | MIT | Pesos abiertos en HuggingFace | DeepSWE 71,9; Terminal Bench 2.1 89,9; CyberGym 94,0 |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | no disponible | Pesos abiertos en HuggingFace | DeepSWE 67,9; Terminal Bench 2.1 87,6; CyberGym 95,1 |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | Pesos abiertos en HuggingFace | DeepSWE 19,0; Terminal Bench 2.1 65,2; CyberGym 40,0 |
| Claude Opus 5 | no disponible | no disponible | Propietaria | API | DeepSWE 74,0; Terminal Bench 2.1 89,1; OSWorld 83,4 |
| GPT-5.6 Sol | no disponible | no disponible | Propietaria | API | DeepSWE 73,0; Terminal Bench 2.1 88,8; OSWorld 83,0 |

No se dispone de datos comparativos de contexto, licencia o arquitectura de las alternativas propietarias en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 1,02 B totales y 42 B activos, mientras que safetensors reporta 524.121.348.864 parametros. Hay que verificar cual corresponde al checkpoint publicado antes de planificar hardware.
- Idiomas: solo ingles y chino estan declarados. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible.
- Reward hacking: la propia model card reconoce que el RL con recompensas sinteticas es vulnerable y describe mitigaciones (endurecimiento del entorno, cribado adversarial y verificacion cruzada), lo que indica que el riesgo persiste.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye con `custom_code`, por lo que la revision del codigo remoto es responsabilidad del usuario.
- Coste de despliegue: 573,5 GB de repositorio y cientos de GB de memoria en cuantizacion hacen inviable el uso en hardware de consumo y encarecen la inferencia propia.
- Cobertura de benchmarks incompleta: no hay resultados de MMLU, GSM8K, HumanEval ni de tareas de vision o audio pese a ser un modelo omnimodal; los datos publicados se concentran en agentes, codigo y ciberseguridad.
- Madurez: el modelo tiene 20 likes y 0 descargas en el momento de la consulta, con fecha de creacion 2026-09-21, por lo que la validacion independiente de la comunidad es practicamente inexistente.
- Resultados de ExploitGym truncados en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Informe tecnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Modelo hermano MiMo-V2.6-Flash-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
