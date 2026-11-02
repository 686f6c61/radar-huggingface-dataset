# Tan023/Mistral-Small-3.2-24B-Instruct-2506

## Resumen

Mistral-Small-3.2-24B-Instruct-2506 es un modelo de lenguaje multimodal desarrollado por Mistral AI, publicado como una actualizacion menor de Mistral-Small-3.1-24B-Instruct-2503. Se trata de un transformer denso de aproximadamente 24.000 millones de parametros (24.011.361.280 exactos segun los pesos en safetensors), con capacidades de vision y texto, disenado para tareas de instruccion, razonamiento, codigo y function calling en entornos de produccion.

La version 3.2 se centra en tres mejoras concretas respecto a su predecesor: mayor adherencia a instrucciones precisas, reduccion a la mitad de las generaciones infinitas o repetitivas en prompts largos y un template de function calling mas robusto. Estos cambios lo hacen mas fiable en pipelines agenticos y de atencion al cliente automatizada, donde los bucles de repeticion y el incumplimiento de formato son fallos criticos.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones de peso, y soporta 24 idiomas, incluidos espanol, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe, hindi y bengali, entre otros. Su publicacion en HuggingFace por parte del usuario Tan023 es un espejo del modelo oficial de Mistral AI, con la libreria vLLM como formato de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (mistral3) |
| Parametros totales | 24.011.361.280 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria vLLM, tokenizer mistral-common) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `mistral3` y la referencia al modelo base `mistralai/Mistral-Small-3.1-24B-Base-2503`. Se trata de un transformer denso de 24.000 millones de parametros con capacidad multimodal (texto e imagen), tal como evidencian los benchmarks de vision incluidos en la model card (MMMU, MathVista, ChartQA, DocVQA, AI2D). No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card indica que Small-3.2 es una actualizacion menor sobre Small-3.1, con mejoras especificas en instruction following, reduccion de generaciones infinitas y robustez del template de function calling. No se detallan innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal. El modelo se distribuye con el tokenizer `mistral-common` y se recomienda su despliegue mediante vLLM con los flags `--tokenizer_mode mistral --config_format mistral --load_format mistral`.

## Capacidades

- Generacion de texto y conversacion multi-turno con soporte de system prompt.
- Razonamiento y matematicas: resultados en MMLU, MMLU Pro, MATH y GPQA.
- Generacion de codigo: evaluado en HumanEval Plus y MBPP Plus.
- Vision: analisis de imagenes, graficos (ChartQA), documentos (DocVQA) y diagramas (AI2D).
- Function calling / tool calling con template robusto y parser `mistral` en vLLM.
- Soporte de agentes y razonamiento multi-paso mediante `--enable-auto-tool-choice`.
- Capacidades multilingues en 24 idiomas, incluidos espanol, frances, aleman, portugues, italiano, arabe, hindi y chino.
- Procesamiento de hasta 10 imagenes por prompt segun la configuracion recomendada (`--limit-mm-per-prompt '{"image":10}'`).
- Modo instruct con temperatura recomendada baja (`temperature=0.15`).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo y un system prompt especifico, reduciendo las generaciones repetitivas (1,29% frente a 2,11% de la version anterior) que rompen la experiencia en produccion.
- Generacion de codigo en produccion: con HumanEval Plus Pass@5 del 92,90% y MBPP Plus Pass@5 del 78,33%, es adecuado para asistentes de codigo integrados en IDE o pipelines de CI/CD que requieran invocacion de herramientas.
- Agentes autonomos con tool calling: el template de function calling reforzado y el soporte de `--tool-call-parser mistral` permiten construir agentes que invocan APIs externas de forma fiable en tareas multi-paso.
- Analisis de documentos escaneados: con DocVQA del 94,86%, puede extraer informacion estructurada de facturas, formularios y contratos en flujos de digitalizacion.
- Interpretacion de graficos y dashboards: ChartQA del 87,4% lo habilita para responder preguntas sobre visualizaciones de datos en herramientas de business intelligence.
- Asistencia tecnica multilingue: al cubrir 24 idiomas, puede desplegarse como asistente de soporte en mercados internacionales sin necesidad de modelos separados por idioma.
- Razonamiento STEM en educacion: con MMLU Pro del 69,06% y MATH del 69,42%, sirve para tutoria automatizada en matematicas y ciencias a nivel universitario.
- Extraccion de informacion de imagenes tecnicas: AI2D del 92,91% permite interpretar diagramas cientificos y esquemas tecnicos en contextos de ingenieria.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando Small 3.2 con Small 3.1:

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| Wildbench v2 | 55,6% | 65,33% |
| Arena Hard v2 | 19,56% | 43,1% |
| IF interno (accuracy) | 82,75% | 84,78% |
| Generaciones infinitas (menor es mejor) | 2,11% | 1,29% |
| MMLU | 80,62% | 80,50% |
| MMLU Pro (5-shot CoT) | 66,76% | 69,06% |
| MATH | 69,30% | 69,42% |
| GPQA Main (5-shot CoT) | 44,42% | 44,22% |
| GPQA Diamond (5-shot CoT) | 45,96% | 46,13% |
| MBPP Plus Pass@5 | 74,63% | 78,33% |
| HumanEval Plus Pass@5 | 88,99% | 92,90% |
| SimpleQA (TotalAcc) | 10,43% | 12,10% |
| MMMU | 64,00% | 62,50% |
| MathVista | 68,91% | 67,09% |
| ChartQA | 86,24% | 87,4% |
| DocVQA | 94,08% | 94,86% |
| AI2D | 93,72% | 92,91% |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 55 GB de memoria GPU segun la model card oficial.
- GPU recomendadas: A100 80GB, H100, o configuraciones multi-GPU con tensor parallelism (la model card sugiere `--tensor-parallel-size 2`, por ejemplo 2x A100 40GB o 2x RTX A6000).
- No cabe en GPU de consumo individual con cuantizacion completa en bf16; requeriria cuantizacion (no especificada en la informacion disponible) para GPUs de 24 GB como la RTX 4090.
- Opciones de despliegue: vLLM (recomendado, version >= 0.9.1), transformers, imagen Docker oficial de vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requiere `mistral_common >= 1.6.2` para el tokenizer y el parser de tool calling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506 | 24B | no disponible | Apache 2.0 | Multimodal, 24 idiomas, function calling reforzado |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | no disponible | Apache 2.0 | Predecesor directo; peor instruction following y mas generaciones infinitas |
| Otros modelos de ~24B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa directa disponible se limita al predecesor Small 3.1, sobre el que Small 3.2 mejora en Wildbench v2 (+9,73 puntos), Arena Hard v2 (+23,54 puntos), MMLU Pro (+2,30 puntos), HumanEval Plus Pass@5 (+3,91 puntos) y reduce las generaciones infinitas a la mitad. Para comparaciones con modelos de otros fabricantes, la model card remite a la pagina de benchmarks de Mistral-Small-3.1.

## Limitaciones y advertencias

- Riesgo de alucinacion: SimpleQA TotalAcc del 12,10% indica una fiabilidad baja en preguntas factuales de conocimiento abierto; no debe usarse como fuente de verdad sin verificacion.
- Generaciones repetitivas: aunque reducidas al 1,29%, siguen existiendo en prompts largos y repetitivos; conviene monitorizar y aplicar limites de tokens.
- Vision: ligeras regresiones respecto a 3.1 en MMMU (62,50% frente a 64,00%), MathVista (67,09% frente a 68,91%) y AI2D (92,91% frente a 93,72%).
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada; debe consultarse la model card oficial antes de disenar flujos con documentos extensos.
- Idiomas: aunque soporta 24 idiomas, el rendimiento por idioma no esta desglosado en los benchmarks publicados; el espanol esta incluido pero sin metricas especificas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos de Mistral AI para el tratamiento de datos personales (la model card incluye un aviso de gated access con enlace a su politica de privacidad).
- Temperatura: se recomienda `temperature=0.15`; temperaturas mas altas pueden aumentar la repeticion y la incoherencia.
- System prompt: se recomienda encarecidamente incluir un system prompt (el oficial esta en `SYSTEM_PROMPT.txt`) para un comportamiento optimo como asistente general.
- Repositorio espejo: este repositorio (Tan023) no es el oficial de Mistral AI; para produccion conviene usar `mistralai/Mistral-Small-3.2-24B-Instruct-2506`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tan023/Mistral-Small-3.2-24B-Instruct-2506
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Predecesor oficial: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- System prompt recomendado: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
- vLLM: https://github.com/vllm-project/vllm
- vLLM release >= 0.9.1: https://github.com/vllm-project/vllm/releases/tag/v0.9.1
- mistral-common: https://github.com/mistralai/mistral-common
- mistral-common release >= 1.6.2: https://github.com/mistralai/mistral-common/releases/tag/v1.6.2
- Template de instruct en mistral-common: https://github.com/mistralai/mistral-common/blob/535b4d0a0fc94674ea17db6cf8dc2079b81cbcfa/src/mistral_common/tokens/tokenizers/instruct.py#L778
- Dockerfile de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
- Imagen Docker vLLM en Docker Hub: https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
