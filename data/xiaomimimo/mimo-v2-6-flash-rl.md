# XiaomiMiMo/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es el checkpoint de eficiencia de la familia MiMo-V2.6, desarrollada por XiaomiMiMo (Xiaomi). Se trata de un modelo multimodal nativo (texto, imagen, vídeo y audio) construido sobre una arquitectura de mezcla de expertos dispersa (MoE) con 309.000 millones de parámetros totales y 15.000 millones activados por token, junto con una ventana de contexto de 1 millón de tokens. Su propuesta central es escalar el aprendizaje por refuerzo (RL) hacia la auto-mejora: el modelo se entrena con una única ejecución de RL mixta que cubre código, agentes generales, visión y ciberseguridad, en lugar de ejecuciones separadas por dominio.

El objetivo declarado por el autor es ampliar la frontera de capacidades mediante exploración y retroalimentación, con un bucle de auto-mejora basado en calificación agentica por grupos (Groupwise Reward Synthesis y Groupwise Advantage Redistribution) que permite ordenar soluciones que ya pasan las pruebas y dirigir la política hacia trayectorias más cortas y con menos tokens. A esto se suma una fase de destilación on-policy multi-profesor (MOPD2) para extender capacidades a tareas difíciles de verificar.

Es relevante ahora porque combina cuatro modalidades en un solo modelo, contexto de 1M tokens para repositorios y trazas de agente de larga duración, y resultados de benchmarks de agente y código próximos a modelos propietarios de referencia. La licencia MIT y la disponibilidad de pesos en safetensors con soporte de transformers facilitan su evaluación y despliegue tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa con backbone híbrido SWA y decodificador especulativo MTP |
| Parametros totales | 310.756.322.688 (309B, según model card) |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit y FP8 (etiquetas del repo); no se detallan más variantes |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 177,8 GB), librería transformers con código personalizado |

## Arquitectura y entrenamiento

El modelo es un transformer MoE disperso con 309B parámetros totales y 15B activados. El backbone emplea atención de ventana deslizante híbrida, y el sistema multimodal se compone de un codificador visual MiMo ViT de 681M parámetros (28 capas: 24 SWA y 4 full attention), un AudioTokenizer de 308M parámetros más un codificador de parches de audio de 127M, y un decodificador especulativo Multi-Token Prediction (MTP) de 5 capas que acelera la generación.

El entrenamiento se organiza en torno a RL a gran escala: GRPO totalmente asíncrono con lotes de 1.568 prompts × 16 rollouts por paso y miles de millones de tokens por actualización. La señal de recompensa se escala mediante calificación agentica por grupos: GRS construye rúbricas específicas de tarea a partir de rollouts contrastados y fusiona su calidad con los resultados de tests, mientras que GAR ordena trayectorias que ya pasan y redistribuye la ventaja hacia soluciones de mayor calidad. El alineamiento parte de un arranque en frío de auto-corrección, con endurecimiento del entorno, cribado adversarial y verificaciones cruzadas para evitar reward hacking. Tras el RL mixto, MOPD2 combina rollouts autónomos del estudiante con rollouts de un solo turno condicionados por prefijo (Teacher-Prefix y SFT-Prefix) para reutilizar historiales y entrenar puntos de decisión sin regenerar los turnos previos.

## Capacidades

- Generación de texto y razonamiento general en inglés y chino.
- Comprensión de imagen y vídeo mediante el codificador visual MiMo ViT.
- Comprensión de audio mediante AudioTokenizer y codificador de parches.
- Ejecución de tareas de agente con razonamiento multi-paso y trazas largas.
- Capacidades de agente de código: resolución de problemas de repositorio, parcheo y uso de terminal.
- Capacidades de agente general con uso de herramientas y automatización de flujos.
- Ciberseguridad, según los dominios cubiertos por el RL mixto.
- Contexto largo de hasta 1M tokens para repositorios, trazas de herramientas y sesiones de agente múltiples.
- Decodificación especulativa mediante MTP de 5 capas para reducir latencia.
- Soporte de tool calling y function calling: no se detalla explícitamente en la información disponible, aunque las capacidades de agente y los benchmarks de uso de herramientas lo implican.

## Casos de uso

- Agente de código sobre repositorios completos: con 1M tokens de contexto puede ingerir un repositorio mediano, trazas de tests y el historial de la sesión, y proponer parches verificados; sus resultados en DeepSWE v1.1 (67,9) y MiMo Code Bench (61,2) lo sitúan como alternativa realista para pipelines de revisión y corrección automática.
- Automatización de tareas de terminal y sistema operativo: los benchmarks Terminal Bench 2.1 (87,6) y OSWorld-Verified (80,8) indican que puede operar entornos de escritorio y consolas para tareas de administración, instalación y depuración guiadas por instrucciones en lenguaje natural.
- Agente general con uso de herramientas: Toolathlon-Verified (73,6) y AutomationBench (52,3) respaldan su uso en orquestación de APIs, hojas de cálculo y flujos de negocio multi-paso donde se requiere encadenar llamadas y validar resultados.
- Análisis de vídeo y audio en un solo modelo: al integrar codificadores de vídeo y audio, puede transcribir y resumir reuniones, generar descripciones de material audiovisual o extraer acciones de grabaciones, evitando pipelines separados por modalidad.
- Asistencia documental multimodal de contexto largo: con 1M tokens puede procesar manuales técnicos, contratos e informes con figuras y tablas, manteniendo coherencia entre secciones distantes del documento.
- Evaluación de seguridad y ciberseguridad defensiva: el entrenamiento RL incluye el dominio de ciberseguridad, por lo que puede emplearse en triaje de alertas, análisis de trazas y generación de informes de incidentes, siempre con supervisión humana.
- Investigación en RL y agentes: la licencia MIT y los pesos abiertos permiten reproducir experimentos de calificación agentica, estudiar el efecto de GRS/GAR y hacer fine-tuning sobre dominios propios.

## Benchmarks y rendimiento

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

Los datos de ciberseguridad y de benchmarks de conocimiento general (MMLU, GSM8K, HumanEval) no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 309B parámetros totales, en FP8 o 8-bit el peso ocupa aproximadamente 310 GB, por lo que se requiere un nodo multi-GPU; en cuantizaciones de 4 bits no documentadas por el autor el peso bajaría a unos 155 GB, pero no se confirma soporte oficial.
- GPU recomendadas: nodos con 8×H100 80 GB o 8×A100 80 GB para FP8/8-bit; configuraciones mayores si se desea contexto cercano a 1M tokens, ya que la caché KV crece de forma significativa.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 de 24 GB, RTX 5090 de 32 GB) en los formatos publicados; requeriría cuantización agresiva no oficial y perdería parte de las capacidades multimodales.
- Opciones de despliegue: transformers con código personalizado (soporte nativo del repo); vLLM, TGI, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El decodificador especulativo MTP de 5 capas está diseñado para reducir la latencia de generación, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 309B totales / 15B activos | 1M | MIT | Texto, imagen, vídeo, audio | Pesos abiertos en Hugging Face y ModelScope |
| MiMo-V2.6-Pro-RL | No disponible en la información | 1M | MIT | Texto, imagen, vídeo, audio | Pesos abiertos en Hugging Face y ModelScope |
| MiMo-V2.5-Pro | No disponible en la información | No disponible | No disponible | No disponible | Pesos abiertos |
| Claude Opus 5 | No disponible | No disponible | Propietaria | No disponible | Solo API |
| GPT-5.6 Sol | No disponible | No disponible | Propietaria | No disponible | Solo API |

En benchmarks de agente, MiMo-V2.6-Flash-RL supera a Claude Opus 5 en AutomationBench (52,3 frente a 50,3) y JobBench (61,2 frente a 45,4), y queda por debajo en DeepSWE v1.1 (67,9 frente a 74,0) y Terminal Bench 4.0 (28,8 frente a 49,0). Frente a su predecesor MiMo-V2.5-Pro la mejora es amplia en todos los benchmarks publicados.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible.
- Alucinación: no se publican tasas de alucinación; en tareas de agente con verificación automática el riesgo se mitiga, pero en generación libre persiste.
- Contexto: aunque se anuncian 1M tokens, el coste de memoria de la caché KV a esa longitud es muy alto y no se documentan curvas de degradación por posición.
- Licencia: MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar las licencias de los codificadores y del código personalizado incluido en el repo.
- Producción: el soporte en vLLM, TGI o llama.cpp no está confirmado; el despliegue depende de transformers con código personalizado, lo que puede limitar el throughput frente a motores optimizados.
- Benchmarks: los resultados publicados son del autor y no se han verificado de forma independiente; las cifras de GDPval-AA 2.1 usan una escala distinta al resto.
- Ciberseguridad: el modelo está entrenado en este dominio; su uso ofensivo debe restringirse mediante políticas y supervisión.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Informe técnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Modelo hermano MiMo-V2.6-Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
