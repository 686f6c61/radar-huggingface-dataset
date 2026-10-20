# taobao-mnn/Qwen3.6-35B-A3B-MNN

## Resumen

Qwen3.6-35B-A3B-MNN es una exportación cuantizada a 4 bits del modelo Qwen3.6-35B-A3B, empaquetada en el formato propietario del runtime MNN por el equipo taobao-mnn (Alibaba). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para ejecutar inferencia LLM fuera de los stacks habituales de servidor: MNN es un motor de inferencia ligero orientado a CPU y dispositivos, y esta revisión se ha reexportado con soporte de `IndexedLinear` para las capas de mezcla de expertos.

El modelo base es un transformer con mezcla de expertos (MoE) de 35 000 millones de parámetros totales y 3000 millones de parámetros activos por token, según la propia denominación «35B-A3B». Esta exportación aplica cuantización HQQ de 4 bits con tamaño de grupo 64 y escalas de 16 bits, lo que reduce de forma agresiva el peso en disco y memoria frente a los pesos originales en precisión completa.

Su relevancia es acotada pero concreta: permite probar un MoE de 35B en entornos donde no hay CUDA, vLLM ni llama.cpp disponibles, como aplicaciones de escritorio, integraciones móviles o pipelines en C++ con MNN. Con 26 descargas y 2 «likes» en el momento de la consulta, es un artefacto de nicho orientado a usuarios del ecosistema MNN más que a despliegues de producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); exportación al runtime MNN del modelo Qwen3.6-35B-A3B |
| Parametros totales | 35 000 millones (35B), según la denominación del modelo base |
| Parametros activos | 3000 millones (3B) por token, según la denominación «A3B» |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con HQQ, tamaño de grupo 64 y escalas de 16 bits (única variante publicada) |
| Idiomas soportados | inglés (único idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | formato MNN (exportado con `llmexport`); no safetensors ni GGUF |
| Tamano del repositorio | 42,3 GB |
| Runtime requerido | MNN con soporte de `IndexedLinear` para MoE (compilado con el commit `f8585f6` o posterior) |
| Backend de ejecución | MNN (`llm_demo`); las opciones de compilación documentadas son de CPU (`MNN_LOW_MEMORY`, `MNN_CPU_WEIGHT_DEQUANT_GEMM`) |
| Fecha de creacion / actualizacion | 17 de abril de 2026 / 20 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos: de los 35B parámetros totales solo se activan unos 3B por token, lo que reduce el coste computacional de cada paso de decodificación a costa de mantener una huella de memoria equivalente a un modelo denso de 35B (antes de cuantizar). La model card no aporta detalles sobre el número de expertos, la función de enrutamiento, el número de capas ni la dimensionalidad del modelo base.

Sobre el entrenamiento no hay información en los materiales proporcionados: se desconoce el volumen de tokens, la composición del corpus, si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo que sí está documentado es la cadena de conversión: los pesos se exportaron con la herramienta `llmexport` del repositorio de Alibaba MNN y se cuantizaron con HQQ de 4 bits (grupo 64, escalas de 16 bits). Esta revisión concreta incorpora `IndexedLinear` en las capas MoE, un cambio de representación que obliga a usar un runtime MNN que contenga el commit `f8585f650ad92c67bfb65ac8bd8e32481e266ecb`; las revisiones anteriores del modelo siguen siendo válidas para runtimes antiguos. Al compilar MNN desde el código fuente hay que ejecutar `./schema/generate.sh` antes de CMake.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `chat`), en inglés.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones que las cuantifiquen tras la cuantización a 4 bits.
- Eficiencia computacional por token gracias al enrutamiento MoE: 3B parámetros activos sobre 35B totales.
- Ejecución en el runtime MNN, con compilación en C++ y demo de línea de comandos (`llm_demo`) lista para usar.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo «thinking». Tampoco se confirma un contexto multilingüe: la model card declara únicamente inglés.

## Casos de uso

- Inferencia local en escritorio sin CUDA: integrar el modelo en una aplicación C++ que enlace con MNN y ejecute `llm_demo` o la API de MNN-LLM, aprovechando que el stack no requiere drivers de GPU propietarios.
- Prototipado de un MoE de 35B en máquinas de desarrollo: al estar cuantizado a 4 bits, permite validar prompts y flujos conversacionales con la familia Qwen3.6 sin descargar los pesos completos en precisión nativa.
- Aplicaciones móviles o embebidas basadas en MNN: MNN es el motor de inferencia que Alibaba usa en sus propias apps, por lo que esta exportación encaja en despliegues donde el binario y la memoria son la restricción principal.
- Evaluación comparativa de cuantización: útil para medir la degradación de calidad de HQQ 4 bits (grupo 64, escalas de 16 bits) frente a los pesos originales o a otras cuantizaciones del mismo modelo base.
- Procesamiento por lotes offline en inglés: generación de resúmenes, clasificación o reescritura de documentos en un pipeline por lotes donde no se necesita baja latencia interactiva.
- Base para experimentos de investigación sobre enrutamiento MoE: al estar los pesos en formato MNN con `IndexedLinear`, sirve para estudiar el comportamiento del enrutamiento en un runtime distinto de los habituales (PyTorch, vLLM).
- Pruebas de regresión de runtimes MNN: equipo de calidad que verifique que una nueva versión del motor sigue produciendo las mismas salidas que la revisión fijada en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta exportación no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan datos de latencia o throughput del runtime MNN para este modelo.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 42,3 GB, cantidad mínima de disco necesaria para descargarlo completo.
- Memoria: no hay cifras oficiales. Como referencia orientativa, 35B parámetros a 4 bits suponen del orden de 17-18 GB solo en pesos, a los que hay que sumar caché KV y buffers del runtime; el tamaño real del repositorio (42,3 GB) sugiere que el empaquetado incluye material adicional más allá de los pesos cuantizados.
- GPU: no se documenta soporte ni requisitos de GPU para esta exportación. Las opciones de compilación indicadas en la model card (`MNN_CPU_WEIGHT_DEQUANT_GEMM`, `MNN_LOW_MEMORY`) están orientadas a ejecución en CPU.
- CPU: es el escenario de referencia del runtime MNN; se recomienda un procesador con AVX2/AVX-512 (x86) o NEON (ARM) y al menos tantos GB de RAM como ocupe el modelo más el contexto.
- Consumer GPU: no confirmado. Si el runtime MNN con backend GPU/OpenCL permite cargar los pesos, una GPU de 24 GB (RTX 4090) sería el mínimo teórico por capacidad de VRAM, pero no hay validación publicada.
- Despliegue: MNN con `llm_demo`, compilado con `-DMNN_LOW_MEMORY=true -DMNN_CPU_WEIGHT_DEQUANT_GEMM=true -DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que el formato de pesos es específico de MNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MNN (este) | 35B totales / 3B activos | no disponible | MNN, HQQ 4 bits | MNN | Apache 2.0 | no publicados |
| Qwen3.6-35B-A3B (modelo base) | 35B totales / 3B activos | no disponible | safetensors en precisión original (presumiblemente) | PyTorch y derivados | Apache 2.0 | no disponibles en la información proporcionada |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, etc.) | 35B totales / 3B activos | no disponible | GGUF / otros | llama.cpp, vLLM, etc. | Apache 2.0 | no disponibles en la información proporcionada |

La comparación relevante es frente al modelo base: misma arquitectura y mismos parámetros, con la diferencia de la cuantización HQQ de 4 bits y el formato MNN, que restringe el ecosistema de herramientas utilizable. No se dispone de datos que permitan comparar la calidad de esta cuantización con alternativas.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay evidencia de buen rendimiento en castellano y no se debe asumir paridad con el modelo base sin evaluarlo.
- Contexto: no se documenta la longitud de contexto soportada por esta exportación, lo que impide dimensionar la caché KV y planificar casos de uso con documentos largos.
- Dependencia estricta del runtime: requiere una versión de MNN con `IndexedLinear` (commit `f8585f6` o posterior). Con runtimes anteriores hay que recurrir a una revisión previa del modelo, y no se puede usar con vLLM, llama.cpp, Ollama ni TGI.
- Cuantización agresiva: HQQ de 4 bits con grupo 64 y escalas de 16 bits introduce pérdida de precisión no cuantificada en la documentación; es esperable degradación en tareas de razonamiento matemático o código, pero no hay mediciones publicadas.
- Alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación para esta exportación; aplican los riesgos habituales del modelo base.
- Sesgos: no hay información sobre la composición del corpus de entrenamiento ni sobre mitigaciones aplicadas, por lo que no se pueden enumerar sesgos concretos.
- Adopción muy baja: 26 descargas y 2 «likes». No hay evidencia de uso en producción ni de validación independiente del artefacto.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card enlaza a la licencia del modelo base en el repositorio de Qwen; conviene revisar ambas antes de redistribuir.
- Ausencia de datos operativos: sin latencia, throughput ni benchmarks, no es posible justificar una elección en producción solo con la información publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taobao-mnn/Qwen3.6-35B-A3B-MNN
- Repositorio del modelo en ModelScope: https://www.modelscope.cn/taobao-mnn/Qwen3.6-35B-A3B-MNN
- Código fuente de MNN: https://github.com/alibaba/MNN
- Herramienta de exportación `llmexport`: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Commit de MNN requerido (`f8585f6`): https://github.com/alibaba/MNN/commit/f8585f650ad92c67bfb65ac8bd8e32481e266ecb
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia del modelo base (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Página del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes; únicamente páginas del marketplace Taobao, sin relación con el modelo.
