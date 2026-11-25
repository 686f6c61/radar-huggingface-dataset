# zhengzhou/MFM-VLA

## Resumen

MFM-VLA (Multimodal Foundation Models for Vision-Language-Action) es un conjunto de checkpoints adaptados del modelo π₀.₅ de Physical Intelligence, publicados por el autor `zhengzhou` en Hugging Face. El modelo acompaña el artículo "Ground, Guide, Act: Improving VLA Spatial Generalization with Multimodal Foundation Models", firmado por Guangting Zheng, Shaoxuan Wang, Yu Yuan, Zhipeng Tang, Jiajun Deng y Yanyong Zhang, del University of Science and Technology of China (arXiv:2611.31452). Su objetivo es mejorar la generalización espacial de los modelos vision-language-action en entornos de manipulación robótica con perturbaciones.

El repositorio contiene dos checkpoints diferenciados por embodiment y benchmark: uno para el brazo Franka de 7 grados de libertad sobre LIBERO-PRO (16 suites de perturbación) y otro para el PandaOmron móvil de 12 grados de libertad sobre RoboCasa365 (50 tareas de cocina). Ambos se sirven mediante la librería `openpi` de Physical Intelligence, con configuraciones de política registradas por el propio autor.

La relevancia del modelo reside en que reporta mejoras medibles sobre la línea base π₀.₅ en escenarios con perturbaciones espaciales: 69,8 % frente a 54,9 % en LIBERO-PRO y 20,5 % frente a 16,9 % en RoboCasa365. El tamaño del repositorio (24,9 GB) y la licencia Apache-2.0 lo hacen directamente desplegable, aunque la información pública sobre arquitectura interna y composición del dataset de entrenamiento es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 24,9 GB con verificación SHA256SUMS.txt; librería `openpi`) |

## Arquitectura y entrenamiento

Los checkpoints derivan de π₀.₅, un modelo vision-language-action de Physical Intelligence que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. La adaptación MFM-VLA introduce lo que el artículo denomina "Ground, Guide, Act": un uso de modelos fundacionales multimodales para anclar (ground) la percepción espacial, guiar (guide) la política y ejecutar (act) las acciones. No se detalla en la model card la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención), por lo que estos datos deben considerarse no disponibles.

En cuanto a entrenamiento, la model card ofrece cifras concretas por checkpoint. Para LIBERO-PRO (`pi05_libero_dense_v3`) se usaron 14.075 trayectorias (6.350 oficiales, 5.597 de recuperación y 2.128 de aumento espacial), equivalentes a 2,087 millones de fotogramas, durante 10.000 pasos con EMA 0,999. Para RoboCasa365 (`pi05_robocasa_dense_v2`) se emplearon 1.437 trayectorias de tareas vistas, excluyendo estrictamente las 16 tareas Composite-Unseen, durante 7.500 pasos acumulados con EMA 0,999. En ALOHA-Sim-PRO se usa directamente el checkpoint π₀ pretreinado de OpenPI sin ajuste fino específico. No se especifica si hubo RLHF o DPO, ni la composición lingüística del dataset.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales e instrucciones, con embodiments de 7 DoF (Franka) y 12 DoF (PandaOmron móvil).
- Generalización espacial ante perturbaciones: entrenado específicamente para resistir cambios de posición, orientación y disposición de objetos (16 suites de perturbación en LIBERO-PRO).
- Manipulación móvil en entornos de cocina: el checkpoint RoboCasa365 aborda tareas de cocina con base móvil y 50 tareas distintas.
- Ejecución de políticas modulares: la model card menciona una extensión "Code Policy" que eleva el rendimiento agregado (84,4 % en LIBERO-PRO y 30,3 % en RoboCasa365).
- Enrutamiento por suite y por tarea: se reportan resultados con enrutamiento por suite (75,1 %) y por tarea (78,5 %) sobre un split de ablación de 800 episodios.
- Integración con OpenPI: servido como policy server mediante scripts incluidos en el repositorio del autor.
- Capacidades de lenguaje natural, tool calling o agentes multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de robustez espacial en manipulación de escritorio: usar `mfm-vla-pi05-libero-pro` como política de referencia en las 16 suites de perturbación de LIBERO-PRO para medir la caída de éxito ante cambios de cámara, posición de objetos o iluminación, comparando con π₀.₅ base.
- Benchmark de cocina móvil: desplegar `mfm-vla-pi05-robocasa365` en RoboCasa365 para evaluar las 50 tareas de cocina con el robot PandaOmron de 12 DoF, especialmente útil para estudiar generalización a configuraciones no vistas.
- Investigación en recuperación de fallos: las 5.597 trayectorias de recuperación del dataset de LIBERO-PRO sugieren un uso directo para estudiar políticas que se recuperan de estados de error, un caso poco cubierto en benchmarks estándar.
- Aumento de datos espaciales: las 2.128 trayectorias de aumento espacial permiten analizar cómo la aumentación geométrica afecta la generalización, replicando el pipeline del artículo.
- Servido en infraestructura OpenPI: integrar los checkpoints como policy server en un stack OpenPI existente (puertos 8130 y 8170 en los scripts del autor) para conectar un robot real o simulador al modelo.
- Estudio de políticas modulares: emplear la extensión Code Policy descrita en la model card para comparar políticas monolíticas frente a pipelines con enrutamiento por tarea o por suite.
- Reproducibilidad de resultados: verificar integridad con `SHA256SUMS.txt` y reproducir las cifras reportadas (69,8 % y 20,5 %) como línea base en publicaciones posteriores.

## Benchmarks y rendimiento

| Benchmark | MFM-VLA | π₀.₅ base | MFM-VLA + Code Policy |
|---|---|---|---|
| LIBERO-PRO (8.000 episodios, 16 suites) | 69,8 % | 54,9 % | 84,4 % |
| LIBERO-PRO (split de ablación, 800 eps; enrutado por suite) | 75,1 % | no disponible | no disponible |
| LIBERO-PRO (split de ablación, 800 eps; enrutado por tarea) | 78,5 % | no disponible | no disponible |
| RoboCasa365 (2.500 episodios, 50 tareas) | 20,5 % | 16,9 % | 30,3 % |
| ALOHA-Sim-PRO (π₀ pretreinado, sin ajuste) | 97,5 % | 23,5 % | no disponible |

No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 24,9 GB, lo que da una cota inferior orientativa para cargar pesos en precisión completa, pero no se especifica el número de parámetros ni la precisión de almacenamiento.
- GPU recomendadas: no disponible en la model card; por el tamaño del repo y la naturaleza de los VLA, se requiere al menos una GPU con 24-48 GB de VRAM para inferencia en fp16, pero este dato no está confirmado por el autor.
- Viabilidad en GPU consumer: no confirmada. Un repo de 24,9 GB excede los 24 GB de una RTX 4090 en fp16 si se carga completo en memoria, por lo que probablemente requiere cuantización o partición, sin datos publicados al respecto.
- Opciones de despliegue: OpenPI (librería oficial indicada en la model card), con scripts `serve_vla_policy.sh` para LIBERO-PRO (puerto 8130) y RoboCasa365 (puerto 8170). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFM-VLA (este modelo) | no disponible | no disponible | 69,8 % LIBERO-PRO; 20,5 % RoboCasa365 | Apache-2.0 | Hugging Face (`zhengzhou/MFM-VLA`) |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | 54,9 % LIBERO-PRO; 16,9 % RoboCasa365 (según la model card) | no disponible en esta ficha | OpenPI |
| π₀ ALOHA (Physical Intelligence) | no disponible | no disponible | 23,5 % en ALOHA-Sim-PRO | no disponible en esta ficha | OpenPI |

La comparación se limita a los modelos citados en la propia model card. No se dispone de datos sobre alternativas VLA de otros laboratorios (RT-2, OpenVLA, Octo) en la información proporcionada, por lo que no se incluyen cifras comparativas con ellos.

## Limitaciones y advertencias

- Datos técnicos incompletos: no se publican número de parámetros, contexto, arquitectura interna, composición del dataset ni idiomas, lo que dificulta estimar costes de despliegue y evaluar sesgos lingüísticos.
- Rendimiento absoluto bajo en RoboCasa365: 20,5 % de éxito global sobre 2.500 episodios es una cifra modesta; no debe interpretarse como un sistema listo para producción sin un pipeline adicional (Code Policy) o enrutamiento por tarea.
- Dependencia de enrutamiento: las cifras de 84,4 %, 75,1 % y 78,5 % requieren extensiones (Code Policy, enrutado por suite o por tarea) que no forman parte del checkpoint base; usarlas como expectativa de rendimiento directo sería incorrecto.
- Riesgo de sobreajuste al benchmark: el entrenamiento se realizó específicamente sobre LIBERO-PRO y RoboCasa365, con aumentación espacial y trayectorias de recuperación; la transferencia a entornos reales no está documentada.
- Exclusión de tareas Composite-Unseen: el checkpoint RoboCasa365 se entrenó excluyendo estrictamente las 16 tareas no vistas, por lo que su generalización a configuraciones totalmente nuevas no está validada.
- Sin datos sobre sesgos, alucinación o seguridad: al ser un modelo de acción y no de generación de texto libre, los riesgos típicos de alucinación lingüística no aplican igual, pero no se han publicado evaluaciones de seguridad física o de comportamiento fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los pesos originales de π₀.₅ y de OpenPI, que pueden imponer condiciones adicionales no reflejadas en este repositorio.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy reducido, sin issues ni reports de terceros que confirmen la reproducibilidad de las cifras.

## Enlaces

- Hugging Face: https://huggingface.co/zhengzhou/MFM-VLA
- arXiv (paper): https://arxiv.org/abs/2611.31452
- PDF del paper: https://arxiv.org/pdf/2611.31452
- Página del proyecto: https://tom-zgt.github.io/MFM-VLA/
- Repositorio GitHub: https://github.com/Tom-zgt/MFM-VLA
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
