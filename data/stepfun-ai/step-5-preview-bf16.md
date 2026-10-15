# stepfun-ai/Step-5-Preview-BF16

## Resumen

Step 5 Preview es el modelo insignia de StepFun (stepfun-ai) orientado a trabajo agéntico: ingeniería de software, conocimiento profesional y, con especial énfasis, tareas financieras que combinan razonamiento cuantitativo con análisis documental. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) dispersa con 600.000 millones de parámetros totales y 27.000 millones de parámetros activos por token, según la model card del autor. El checkpoint analizado aquí es la variante en precisión BF16, publicada en HuggingFace como `stepfun-ai/Step-5-Preview-BF16`, con un peso real medido en safetensors de 604.339.504.832 parámetros.

La relevancia del modelo reside en su ventana de contexto de hasta 1 millón de tokens, tanto de entrada como de salida, y en su entrada multimodal de texto e imagen (la introducción de la model card menciona además vídeo, aunque la tabla de especificaciones solo lista texto e imagen). Esa combinación lo sitúa en la categoría de modelos abiertos de frontera para cargas agénticas de horizonte largo: llamadas repetidas a herramientas, ejecución y verificación de código y revisiones iterativas manteniendo información de contexto extensa.

El modelo se distribuye con licencia `other` (con enlace a un fichero LICENSE.txt propio), lo que obliga a revisar los términos antes de cualquier uso comercial. No se declaran idiomas soportados ni pipeline en la ficha de HuggingFace, y el repositorio ocupa 1214,9 GB, lo que refleja el coste de almacenamiento y despliegue de la versión BF16 completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) |
| Parametros totales | 604.339.504.832 (aprox. 600B segun model card) |
| Parametros activos | 27B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Salida maxima | Hasta 1.000.000 tokens (segun model card) |
| Tipos de cuantizacion | FP8 y BF16 (checkpoints publicados); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | other (`license_link`: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt) |
| Formato de pesos | safetensors |
| Modalidad de entrada | Texto e imagen (la introduccion de la model card menciona tambien video) |
| Modalidad de salida | Texto |
| Tag de arquitectura en HuggingFace | step5_vl |
| Tamano del repositorio | 1214,9 GB (checkpoint BF16) |
| Descargas / likes | 126 descargas / 47 likes |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

Step 5 Preview emplea una arquitectura de mezcla de expertos dispersa (sparse MoE) con 600B parámetros totales y 27B activos. La model card no detalla el número de expertos, la estrategia de enrutamiento, el ratio de activación por capa ni si se combina con atención lineal o mecanismos híbridos. El identificador de arquitectura expuesto en HuggingFace es `step5_vl`, lo que confirma el soporte de entrada visual integrado en el propio modelo, no como adaptador independiente.

Tampoco se publican en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otros métodos de alineamiento. La model card sí menciona explícitamente el uso de decodificación especulativa como característica soportada por los frameworks de servicio, y hace referencia a un ajuste de razonamiento configurable ("High" reasoning setting) empleado en las evaluaciones publicadas.

Los parámetros de inferencia recomendados por el autor son `temperature=1.0`, `top_p=0.95` y `top_k=0`. Para las evaluaciones de DeepSWE v1.1 se emplea el arnés SWE-agent con esos mismos valores. El resto de detalles de entrenamiento y metodología de evaluación se remiten a la página del modelo de StepFun, fuera de la información disponible aquí.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con ventana de contexto de hasta 1M tokens tanto en entrada como en salida.
- Ingenieria de software a nivel de repositorio: navegacion de bases de codigo grandes, coordinacion de cambios entre multiples ficheros, ejecucion y verificacion de codigo e iteracion sobre los resultados.
- Desarrollo frontend y visual, y programacion para dispositivos (segun la model card).
- Ejecucion agentica de horizonte largo: cadenas repetidas de llamada a herramientas, ejecucion, verificacion y revision, manteniendo informacion de contexto extensa.
- Uso de herramientas (tool calling) integrado en el flujo de servicio, con soporte en los frameworks de despliegue indicados (vLLM, SGLang con API compatible con OpenAI).
- Modo de razonamiento configurable, con un ajuste "High" empleado en los resultados publicados.
- Comprension multimodal de entrada: imagenes, capturas de pantalla y graficos (y video segun la introduccion de la model card).
- Trabajo de conocimiento profesional: analisis de documentos largos, graficos, capturas e imagenes para producir informes y analisis estructurados.
- Razonamiento cuantitativo aplicado a finanzas y analisis de datos financieros con documentacion de apoyo.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Decodificacion especulativa soportada por los frameworks de inferencia indicados.

## Casos de uso

- Ingenieria de software agéntica sobre repositorios: el modelo puede recorrer una base de código extensa, planificar cambios que afectan a varios ficheros, aplicarlos, ejecutar la suite de pruebas y corregir errores de forma iterativa. La ventana de 1M tokens permite mantener en contexto ficheros, historial de issues y trazas de ejecución sin truncar.
- Mantenimiento y migración de código heredado: dado que soporta contexto de hasta 1M tokens, se puede cargar un módulo completo o varios módulos relacionados y pedir refactorizaciones coherentes, con verificación del resultado compilando y ejecutando el código dentro del bucle agéntico.
- Análisis financiero asistido: el modelo está específicamente orientado a tareas que combinan razonamiento cuantitativo con datos financieros y documentos de soporte, por lo que encaja en la extracción de métricas de informes anuales, conciliación de cifras entre documentos y generación de notas de análisis.
- Análisis de documentos largos y reportes estructurados: con entrada de texto e imagen, puede procesar informes extensos, tablas y capturas, y devolver análisis estructurados, aprovechando el contexto de 1M tokens para no fragmentar el documento.
- Automatización de flujos de trabajo con herramientas: su capacidad de ejecución agéntica de horizonte largo permite encadenar llamadas a APIs, consultas a bases de datos, ejecución de scripts y verificación de resultados dentro de un mismo proceso, integrándose mediante API compatible con OpenAI.
- Desarrollo frontend a partir de diseños: al aceptar imágenes de entrada, puede interpretar maquetas o capturas de interfaz y generar el código correspondiente, iterando sobre el resultado visual.
- Atención al cliente o asistentes internos con contexto extenso: la ventana de 1M tokens permite mantener historiales de conversación muy largos o bases de conocimiento completas en contexto, si bien no se declaran idiomas soportados y habría que validarlo por idioma.
- Procesamiento de vídeo e imagen para extracción de información: según la introducción de la model card, el modelo acepta vídeo además de imagen, lo que habilita tareas de descripción, resumen o extracción de datos de material audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye los resultados únicamente como imagen (`benchmark results across coding, agentic tasks, professional knowledge work, and finance`), sin tablas con cifras extraíbles, y remite a la página del modelo de StepFun para la metodología completa.

Los únicos datos metodológicos concretos que sí se declaran son:

| Aspecto | Detalle |
|---|---|
| Ajuste de razonamiento usado | High |
| Temperatura recomendada | 1.0 |
| Top-p recomendado | 0.95 |
| Top-k recomendado | 0 |
| Benchmark financiero citado | GDPval-AA v2.1, con resultados de Artificial Analysis a fecha de 20 de septiembre de 2026 |
| Benchmark de ingenieria de software citado | DeepSWE v1.1, evaluado con el arnes SWE-agent |
| Configuracion de evaluacion en DeepSWE | temperature=1.0, top_p=0.95 |

No se proporcionan valores de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros; no confirmado por el autor): en BF16, los pesos ocupan aproximadamente 1,21 TB (2 bytes por parámetro sobre 604.339.504.832 parámetros), coherente con el tamaño de repositorio de 1214,9 GB. En FP8, aproximadamente 604 GB solo en pesos, más caché KV y activaciones.
- El modelo completo no cabe en ninguna GPU de consumo. No es viable en RTX 4090, RTX 5090 ni en configuraciones multi-GPU de gama consumer con memoria agregada habitual.
- Configuraciones oficiales declaradas por el autor:
  - vLLM FP8: un nodo B300 con 4 GPU (TP4, TEP4 o DEP4).
  - vLLM FP8: un nodo H200 con 8 GPU (TP8, TEP8 o DEP8).
  - vLLM BF16: un nodo B300 con 8 GPU (TP8, TEP8 o DEP8).
  - vLLM BF16: dos nodos H200 con 16 GPU (TP16, TEP16 o DEP16).
  - Transformers FP8: un nodo H200 con 8 GPU (TP8 / EP8), generación offline.
  - Transformers BF16: dos nodos H200 con 16 GPU (TP16 / EP16), generación offline (la model card remite a una nota de validación).
  - SGLang FP8: un nodo B300 con 4 GPU (TP4/EP4).
  - SGLang FP8: un nodo H200 con 8 GPU (la información disponible corta aquí la tabla).
- Opciones de despliegue confirmadas: vLLM (FP8 y BF16, API compatible con OpenAI), SGLang (FP8, API compatible con OpenAI) y la implementación standalone de Transformers para generación offline. Se requiere una build de estos frameworks que incluya soporte para Step 5 Preview, incluidas las funciones de razonamiento, tool-call y decodificación especulativa.
- Despliegue en llama.cpp, Ollama, TGI: no disponible (no se mencionan y no se publican pesos GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa de especificaciones declaradas por los respectivos autores. Los datos de rendimiento se dejan como "no disponible" porque no hay cifras verificables en la información proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Step 5 Preview (BF16) | 600B (604,3B medidos en safetensors) | 27B | Hasta 1M tokens | other (propia) | safetensors BF16 y FP8 en HuggingFace y ModelScope |
| DeepSeek-V3 / R1 | 671B | 37B | 128K (segun model card publica) | MIT | Abierta en HuggingFace |
| Qwen3-235B-A22B | 235B | 22B | 128K o superior segun variante | Apache-2.0 | Abierta en HuggingFace |
| Llama 4 Maverick | 400B | 17B | Hasta 1M tokens (segun model card publica) | Licencia comunitaria de Meta | Abierta en HuggingFace |

Diferencias destacables: Step 5 Preview es el único de la comparativa que declara explícitamente orientación a finanzas y entrada de vídeo, y uno de los dos con contexto de 1M tokens. Frente a DeepSeek-V3 y Qwen3, su licencia `other` es más restrictiva que MIT o Apache-2.0 y exige revisión legal antes de uso comercial. No se dispone de datos de rendimiento comparables publicados en la información disponible.

## Limitaciones y advertencias

- No se declaran idiomas soportados. El rendimiento fuera del inglés (incluido el castellano) no está documentado y debería validarse antes de usarlo en producción multilingüe.
- No se publican cifras de benchmarks en formato extraíble: los resultados aparecen solo como imagen. Cualquier comparación cuantitativa frente a otros modelos no puede verificarse con la información disponible.
- Riesgo de alucinación: no cuantificado por el autor. En tareas financieras y de análisis documental, donde el modelo está específicamente orientado, la verificación humana de cifras y referencias es imprescindible.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo, toxicidad ni equidad.
- Licencia `other` con enlace a un fichero LICENSE.txt propio. No es una licencia de código abierto estándar; hay que leer los términos antes de cualquier uso comercial. No se especifican en la información disponible restricciones concretas de uso, atribución o redistribución.
- Requisitos de hardware muy elevados: incluso en FP8 se necesitan nodos de 4 GPU B300 u 8 GPU H200. El despliegue en una sola GPU o en hardware de consumo no es viable, y el repositorio BF16 ocupa 1214,9 GB.
- La propia model card advierte de que el despliegue en Transformers con BF16 requiere una nota de validación adicional; conviene revisarla antes de apoyarse en esa ruta.
- Discrepancia documental: la tabla de especificaciones lista como entrada "texto, imagen", mientras que la introducción menciona también vídeo. Conviene confirmar el soporte real de vídeo antes de diseñar un caso de uso sobre esa capacidad.
- No se documentan tasas de error, comportamiento ante entradas adversarias ni límites de la decodificación especulativa en producción.
- Etiqueta de arquitectura `step5_vl` y ausencia de campos de idioma y pipeline en la ficha de HuggingFace: metadatos incompletos, lo que dificulta la integración automatizada en catálogos de modelos.

## Enlaces

- Modelo BF16 en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Modelo FP8 en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview
- Modelo FP8 en ModelScope: https://modelscope.ai/models/stepfun-ai/Step-5-Preview
- Modelo BF16 en ModelScope: https://modelscope.ai/models/stepfun-ai/Step-5-Preview-BF16
- Pagina del modelo (StepFun): https://www.stepfun.com/step-5-preview
- Documentacion de la plataforma: https://platform.stepfun.ai/docs/en/guides/models/step-5-preview
- Plataforma de API: https://platform.stepfun.ai/
- Fichero de licencia: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Arnes de evaluacion SWE-agent: https://github.com/SWE-agent/SWE-agent
- Artificial Analysis (fuente citada para GDPval-AA v2.1): https://artificialanalysis.ai/

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron listados de anuncios clasificados sin relacion con Step 5 Preview.
