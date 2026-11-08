# SZLHOLDINGS/ouroboros-r2-candidate

## Resumen

ouroboros-r2-candidate es un modelo multimodal de tipo image-text-to-text desarrollado por SZLHOLDINGS, derivado mediante fine-tuning del modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y pesos en formato safetensors, se distribuye bajo licencia Apache 2.0 y está pensado para experimentación e investigación. La model card lo etiqueta explícitamente como `RESEARCH_CANDIDATE` y `NOT_PROMOTED`, es decir, un artefacto de investigación que no ha superado un proceso de certificación de calidad.

El modelo se presenta como un "ouroboros union student", entrenado sobre la unión de todos los corpus admitidos (471 ejemplos de entrenamiento y 48 de holdout con partición disjunta por grupo, semilla 3407). El entrenamiento se realizó a través de un pipeline interno denominado "szl-forge governed pipeline" y un "fail-closed launch contract", con pines inmutables en cada etapa del linaje. Esta trazabilidad es el rasgo diferencial del proyecto: prima la reproducibilidad y la auditoría del proceso sobre las métricas de rendimiento.

Es relevante ahora por su carácter de candidato abierto y auditable dentro de un flujo de trabajo con gobernanza explícita, pero conviene subrayar que no se han publicado resultados de benchmarks ni una evaluación del holdout. Su utilidad práctica queda por tanto limitada a experimentación controlada y a la reproducción del pipeline, no a despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; detalles no publicados) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` asociada al modelo base y de la tarea declarada `image-text-to-text`, que implica un codificador visual acoplado a un modelo de lenguaje. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de fusión multimodal. El tamaño del repositorio (1,8 GB) es coherente con un modelo de menos de mil millones de parámetros en precisión de 16 bits, sin que se indique si incluye pesos del codificador visual.

El entrenamiento se ejecutó mediante el pipeline gobernado szl-forge bajo un "launch contract" de tipo fail-closed, con pines inmutables para el modelo base (revisión `0340c300052e248367a3407aa493ef72a0da79fe`), el corpus y el recibo de admisión. El corpus es la unión de todos los corpus admitidos, con 471 ejemplos de entrenamiento y 48 de holdout separados de forma disjunta por grupo con semilla 3407. No se indica el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional más allá del SFT implícito en el modelo base. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y la tarea `image-text-to-text`.
- Procesamiento conjunto de imagen y texto como entrada, con salida textual.
- Herencia de las capacidades del modelo base `szl-receiptagent-qwen35-0.8b-sft-v3`, orientado a la gestión de recibos, aunque no se detallan sus funciones concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación e investigación sobre modelos multimodales pequeños: el modelo, con menos de mil millones de parámetros y licencia Apache 2.0, permite probar pipelines de imagen-texto en entornos con recursos limitados y sin restricciones de uso comercial.
- Reproducción de pipelines de entrenamiento gobernados: su linaje documentado con pines inmutables y recibos de admisión lo hace adecuado para estudiar flujos de trabajo con contratos de lanzamiento y particiones disjuntas de datos.
- Auditoría de trazabilidad de modelos: sirve como ejemplo práctico de cómo registrar la procedencia de pesos, corpus y revisiones en un artefacto de Hugging Face.
- Prototipado de asistentes de gestión documental: dado su origen en un agente de recibos, puede emplearse para validar extracción y conversación sobre documentos escaneados en fase de prueba.
- Evaluación comparativa de candidatos: útil como punto de partida para comparar el efecto de distintos corpus de unión sobre un mismo modelo base, siempre que se complete la evaluación del holdout.
- Docencia y formación en MLOps: el repositorio y sus etiquetas de estado (`RESEARCH_CANDIDATE`, `NOT_PROMOTED`) permiten ilustrar buenas prácticas de documentación y control de versiones de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación sobre el holdout disjunto por grupo está pendiente de publicación y que no existe una certificación de calidad ni un benchmark amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16 para los pesos; en torno a 1 GB con cuantización de 8 bits y unos 0,5-0,6 GB en 4 bits, estimaciones teóricas a partir del número de parámetros y sin confirmación del autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como una RTX 3060, RTX 4060 o superiores; para mayor comodidad, RTX 4090, A100 o H100 no son necesarias por tamaño, pero pueden acelerar el procesamiento por lotes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPU de consumo modernas, incluidas las de gama media.
- Opciones de despliegue: transformers es la librería declarada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ouroboros-r2-candidate | 873.438.784 | no disponible | Apache 2.0 | Candidato de investigación, sin benchmarks |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 (modelo base) | no disponible | no disponible | no disponible | Base de partida del fine-tuning |
| Alternativas de menos de 1B parámetros (p. ej., Qwen2.5-0.5B, SmolLM2) | ~0,5-1B | 32K o similar según familia | Apache 2.0 en varios casos | Modelos publicados con benchmarks |

La comparación con alternativas de la misma categoría no puede completarse con datos verificados en la información proporcionada; los modelos citados como referencia genérica no cuentan con métricas comparables en este contexto, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo no promocionado ni certificado en calidad: la propia model card lo marca como `NOT_PROMOTED` y `RESEARCH_CANDIDATE`.
- Ausencia de benchmarks públicos y de evaluación del holdout, lo que impide estimar su fiabilidad real.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño, la probabilidad de errores factuales es previsiblemente alta.
- Sesgos conocidos: no documentados; el corpus de entrenamiento es reducido (471 ejemplos) y su composición no se detalla.
- Idiomas y longitud de contexto no declarados, lo que limita su uso en aplicaciones multilingües o con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías de calidad desaconseja su empleo en producción sin una evaluación propia.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso, lo que restringe su integración en pipelines agénticos.
- El tamaño reducido del holdout (48 ejemplos) limita la significación estadística de cualquier evaluación futura.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/ouroboros-r2-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Repositorio szl-ouroboros: https://github.com/szl-holdings/szl-ouroboros
- Repositorio ouroboros: https://github.com/szl-holdings/ouroboros
- README de ouroboros: https://github.com/szl-holdings/ouroboros/blob/main/README.md
- Contrato de lanzamiento (PR #708): https://github.com/szl-holdings/szl-forge/pull/708
- Dataset de recibos de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- DOI de la tesis Ouroboros (v3): 10.5281/zenodo.19983066
