# UEC-InabaLab/Llama-3.1-8B-CounselTrajLM

## Resumen

Llama-3.1-8B-CounselTrajLM es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por UEC-InabaLab (Universidad de Electrocomunicaciones, Inaba Lab) para la generación de la siguiente respuesta de consejero en diálogos de orientación psicológica en chino. El modelo se entrenó sobre CounselTrajD, un corpus de 10.964 diálogos sintéticos de consejería en chino expandidos a partir de SmileChat, PsyDTCorpus y CPsyCounD, y se distribuye como checkpoint completo fusionado en BF16 (9 shards safetensors, aproximadamente 16,1 GB).

La relevancia del modelo reside en su enfoque de "planificación de trayectoria de actos de diálogo" (dialogue-act trajectory planning) descrito en el paper CounselTraj (arXiv:2611.24168), que busca dotar al modelo de conciencia del proceso terapéutico más allá de la respuesta inmediata. Es un modelo de nicho, orientado exclusivamente a investigación en generación de diálogo de consejería en chino, no a uso clínico real.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros (8B), heredada íntegramente de Llama 3.1, con contexto nativo de 128.000 tokens en el modelo base (aunque el ajuste fino se realizó con secuencias de 2.048 tokens). La licencia es Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino QLoRA fusionado |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; entrenamiento con secuencias de 2.048 tokens y últimos 1.800 caracteres de historial |
| Tipos de cuantizacion | BF16 (pesos publicados); cuantizaciones GGUF/AWQ/GPTQ no publicadas oficialmente |
| Idiomas soportados | chino (zh) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | safetensors (9 shards, BF16, ~16,1 GB), tokenizer y chat template incluidos |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B-Instruct (revisión `0e9e39f249a16976918f6564b8830bc894c89659`) y se ajusta mediante QLoRA con rango 32, alpha 64 y dropout 0,05, tasa de aprendizaje 0,0002, schedule coseno con warmup ratio 0,06, 3 épocas y batch efectivo de 16. El adaptador se fusiona en el modelo base BF16 no cuantizado para su publicación. El entrenamiento se realizó sobre CounselTrajD con un split diálogo-disjunto 90/10: 425.679 ejemplos de entrenamiento y 47.528 de validación, todos ellos ejemplos de "siguiente respuesta". La longitud máxima de secuencia de entrenamiento fue de 2.048 tokens y el historial se trunca a los últimos 1.800 caracteres.

La innovación metodológica del proyecto (CounselTraj) es la planificación de trayectorias de actos de diálogo para sintetizar diálogos de consejería conscientes del proceso terapéutico. El corpus de entrenamiento es enteramente sintético, expandido a partir de tres fuentes: SmileChat (Qiu et al., 2024), PsyDTCorpus (Xie et al., 2025) y CPsyCounD (Zhang et al., 2024). No se documentan técnicas adicionales como decodificación especulativa o atención lineal; la arquitectura subyacente es la estándar de Llama 3.1 con RoPE y GQA.

## Capacidades

- Generación de la siguiente respuesta de consejero en diálogos de orientación psicológica en chino, a partir de un historial con prefijos de hablante `client:` y `counselor:`.
- Conversación multi-turno con gestión de historial (truncado a 1.800 caracteres).
- Razonamiento y generación de texto general heredados del modelo base Llama 3.1 8B Instruct (no garantizados tras el ajuste fino específico).
- Soporte de tool calling / function calling: no documentado para este ajuste fino.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a la generación de una única respuesta.
- Capacidades multilingües: limitadas al chino según la model card; el resto de idiomas del modelo base no se garantizan.
- Capacidad especial: alineación con el formato de prompt e instrucción de sistema original del consejero empleado en el entrenamiento.

## Casos de uso

- Investigación en generación de diálogo de consejería: el modelo sirve como baseline para estudiar la calidad de respuestas de consejero en chino y comparar con otros ajustes finos sobre el mismo corpus.
- Evaluación de planificación de actos de diálogo: permite reproducir y analizar el comportamiento de la trayectoria conversacional descrita en CounselTraj sobre diálogos de prueba.
- Generación de datos sintéticos de consejería: útil para aumentar corpus de investigación en psicolingüística computacional, siempre con revisión humana.
- Simulación de cliente/consejero en entornos de formación: puede emplearse como generador de respuestas de consejero en prototipos de simuladores de entrenamiento para estudiantes de psicología (uso no clínico).
- Estudio de sesgos y seguridad en LLM aplicados a salud mental: el modelo permite analizar respuestas inapropiadas o inseguras en dominios sensibles.
- Experimentos de ajuste fino sobre dominio especializado: sirve como punto de partida (merged BF16) para nuevos ajustes finos en chino sobre tareas conversacionales de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas automáticas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de consejería) ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y activaciones (en torno a 18-24 GB en configuraciones típicas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para BF16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen limitado.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB sería necesario cuantizar (no hay cuantizaciones oficiales publicadas, habría que generarlas con llama.cpp o similar).
- Opciones de despliegue: Transformers (verificado con Transformers 5.13.0, PyTorch 2.5.1, Accelerate 1.13.0, safetensors 0.8.0), script `generate_reply.py` incluido; compatible con text-generation-inference y endpoints según los tags del repositorio; llama.cpp/Ollama requerirían conversión propia a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-CounselTrajLM | 8B | 128k (base); entrenado a 2.048 | zh | Llama 3.1 Community | Ajuste fino QLoRA para consejería en chino |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | multilingüe | Llama 3.1 Community | Modelo base; capacidades generales, sin especialización en consejería |
| Otros ajustes finos sobre CPsyCounD / SmileChat | no disponible | no disponible | zh | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no es un sustituto de atención profesional en salud mental; las respuestas pueden ser inexactas, inapropiadas o inseguras.
- Los datos de entrenamiento son completamente sintéticos, lo que puede introducir artefactos y sesgos de los generadores utilizados.
- Riesgo de alucinación inherente al modelo base, no mitigado específicamente en este ajuste fino.
- El ajuste fino se realizó con secuencias de 2.048 tokens y truncado de historial a 1.800 caracteres, por lo que el rendimiento en contextos largos no está garantizado pese al contexto nativo de 128k del modelo base.
- Idioma limitado al chino; el uso en castellano u otros idiomas no está soportado ni evaluado.
- La licencia Llama 3.1 Community impone restricciones de uso y la Acceptable Use Policy; el uso comercial está permitido bajo condiciones, pero los términos de los datos de origen (SmileChat, PsyDTCorpus, CPsyCounD) son independientes y deben revisarse en el repositorio GitHub del proyecto.
- No se han publicado cuantizaciones oficiales ni resultados de validación de seguridad clínica.
- El repositorio tiene muy pocas descargas (27) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/UEC-InabaLab/Llama-3.1-8B-CounselTrajLM
- Paper CounselTraj: https://arxiv.org/abs/2611.24168
- Repositorio GitHub del proyecto: https://github.com/UEC-InabaLab/CounselTraj
- Dataset CounselTrajD: https://huggingface.co/datasets/UEC-InabaLab/CounselTrajD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- SMILE (SmileChat): https://aclanthology.org/2024.findings-emnlp.34/
- PsyDT (PsyDTCorpus): https://aclanthology.org/2025.acl-long.55/
- CPsyCoun (CPsyCounD): https://aclanthology.org/2024.findings-acl.830/
- Ámbito de licencias del proyecto: https://github.com/UEC-InabaLab/CounselTraj/blob/master/LICENSING.md
- Avisos de terceros: https://github.com/UEC-InabaLab/CounselTraj/blob/master/THIRD_PARTY_NOTICES.md
