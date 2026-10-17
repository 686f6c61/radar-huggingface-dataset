# stepfun-ai/Step-5-Preview-NVFP4

## Resumen

Step 5 Preview es el modelo insignia de StepFun (stepfun-ai) orientado a trabajo agéntico. Se trata de un modelo de mezcla de expertos (MoE) dispersa con 600 000 millones de parámetros totales y 27 000 millones de parámetros activos por token, según la model card del autor. Acepta texto e imagen como entrada (la introducción de la model card menciona también vídeo) y genera texto, con una ventana de contexto de hasta 1 millón de tokens y una salida máxima también de hasta 1 millón de tokens.

El modelo está posicionado para ingeniería de software a nivel de repositorio, ejecución agéntica de horizonte largo (llamadas repetidas a herramientas, verificación y revisión) y trabajo de conocimiento profesional, con un foco declarado en tareas financieras que combinan razonamiento cuantitativo y análisis de documentos. Soporta razonamiento en varios niveles (la model card cita un ajuste "High"), tool calling y decodificación especulativa en los frameworks de servicio compatibles.

La ficha que nos ocupa, `stepfun-ai/Step-5-Preview-NVFP4`, es la variante cuantizada en NVFP4 (formato de 4 bits en coma flotante generado con ModelOpt) publicada junto a los checkpoints FP8 y BF16. Su relevancia actual es doble: por un lado, acerca un MoE de 600B a despliegues de un solo nodo B300 (4 GPU) o H200 (8 GPU); por otro, su licencia propietaria `stepfun-model-license-1.0` obliga a revisar condiciones antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dispersa, modalidad `step5_vl` |
| Parametros totales | 600B segun la model card; el recuento de safetensors del repositorio NVFP4 indica 320.612.382.016 parametros |
| Parametros activos | 27B |
| Longitud de contexto | Hasta 1M tokens (salida maxima tambien hasta 1M tokens) |
| Tipos de cuantizacion | NVFP4 en este repositorio (tags: `8-bit`, `modelopt`); FP8 y BF16 publicados en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | `stepfun-model-license-1.0` (identificador HuggingFace: `other`) |
| Formato de pesos | safetensors (repo de 394,2 GB), generados con NVIDIA ModelOpt |
| Entrada / salida | Texto e imagen como entrada; texto como salida |
| Descargas / likes en HuggingFace | 211 descargas, 14 likes |
| Fechas del repositorio | Creado el 2026-10-14, actualizado el 2026-10-15 |

## Arquitectura y entrenamiento

Step 5 Preview es un transformer de mezcla de expertos dispersa con 600B de parámetros totales y 27B activos, lo que implica un ratio de activación del 4,5 % aproximadamente. La model card no detalla el número de expertos, el número de expertos activados por token, la estrategia de enrutamiento ni la composición del dataset de entrenamiento. Tampoco se especifican el volumen de tokens de preentrenamiento, las fases de post-entrenamiento (RLHF, DPO u otras) ni detalles de la tokenización. Todo ello queda como "no disponible".

Entre las capacidades técnicas citadas sí aparecen elementos concretos: el modelo está preparado para decodificación especulativa en los despliegues con vLLM y SGLang, admite tool calling y dispone de un modo de razonamiento configurable (los resultados publicados usan el ajuste "High"). La model card recomienda `temperature=1.0`, `top_p=0.95` y `top_k=0` como ajustes de inferencia, y las evaluaciones de DeepSWE v1.1 se ejecutan con el harness de SWE-agent bajo esos mismos parámetros.

## Capacidades

- Generación de texto y razonamiento multi-paso, con niveles de esfuerzo de razonamiento configurables.
- Entrada multimodal: texto e imagen (capturas, gráficos, diagramas); la sección de introducción menciona explícitamente vídeo, aunque la tabla de especificaciones solo lista texto e imagen.
- Ingeniería de software a nivel de repositorio: navegación de bases de código grandes, cambios coordinados entre ficheros, ejecución y verificación del código, e iteración sobre los resultados.
- Desarrollo frontend y visual, además de programación para dispositivos.
- Ejecución agéntica de horizonte largo: cadenas repetidas de llamada a herramienta, ejecución, comprobación y corrección apoyadas en el contexto largo.
- Tool calling / function calling, con API compatible con OpenAI a través de vLLM y SGLang.
- Trabajo de conocimiento profesional: análisis de documentos largos, gráficos, capturas de pantalla, imágenes y vídeo para producir informes y análisis estructurados.
- Fuerte orientación a finanzas: razonamiento cuantitativo combinado con análisis de datos financieros y documentación de soporte.
- Hasta 1M tokens de contexto y hasta 1M tokens de salida, lo que permite mantener flujos agénticos prolongados sin truncar el historial.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).

## Casos de uso

- Agentes de ingeniería de software sobre repositorios completos: el modelo puede recorrer una base de código de gran tamaño, proponer cambios en varios ficheros, ejecutar la suite de pruebas y corregir hasta que el resultado pasa, gracias a la ventana de 1M tokens y al soporte de tool calling.
- Asistentes de refactorización en pipelines de CI/CD: integrado vía API compatible con OpenAI, el modelo recibe el diff y el resultado de los tests, y devuelve parches verificados antes de la revisión humana.
- Automatización de tareas administrativas de larga duración: flujos que encadenan decenas o cientos de llamadas a herramientas (consultas a bases de datos, envío de correos, actualización de tickets) aprovechando la ejecución agéntica sostenida.
- Análisis financiero asistido: extracción y cruce de cifras de informes anuales, presentaciones y hojas de cálculo aportadas como imágenes o texto, con generación de resúmenes estructurados y comparativas entre periodos.
- Revisión de documentación técnica y contractual: lectura de contratos, memorandos o especificaciones extensas y producción de resúmenes con referencias a las secciones relevantes, apoyándose en el contexto de 1M tokens.
- Análisis de paneles, capturas y gráficos: interpretación de dashboards y gráficas de resultados para generar comentarios automáticos o alertas explicadas.
- Desarrollo frontend asistido: generación de componentes y prototipos visuales a partir de descripciones o de capturas de una interfaz objetivo.
- Atención al cliente técnica multi-turno: conversaciones largas con historial completo en contexto, con capacidad de consultar herramientas internas para resolver incidencias.

## Benchmarks y rendimiento

La model card publica los resultados únicamente como imagen ("Step 5 Preview benchmark results across coding, agentic tasks, professional knowledge work, and finance"), por lo que no se dispone de valores numéricos en el material proporcionado. Se indica que las puntuaciones abarcan tareas de código, tareas agénticas, conocimiento profesional y finanzas.

Únicamente se documentan la metodología y el contexto de evaluación:

| Dato | Valor |
|---|---|
| Ajustes de inferencia recomendados | `temperature=1.0`, `top_p=0.95`, `top_k=0` |
| Modo de razonamiento usado en los resultados | High |
| GDPval-AA v2.1 | Puntuaciones basadas en resultados de Artificial Analysis a fecha de 20 de septiembre de 2026 (valores no disponibles) |
| DeepSWE v1.1 | Evaluado con el harness SWE-agent, `temperature=1.0`, `top_p=0.95` (valores no disponibles) |
| Rendimiento declarado por NVIDIA | Aproximadamente 8 000 tokens/segundo por GPU en NVIDIA GB300 con NVFP4 |

No se han publicado en la información disponible valores numéricos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el repositorio NVFP4 ocupa 394,2 GB, por lo que no es desplegable en una única GPU de consumo; se necesita un nodo multigpu con memoria agregada de al menos ese orden.
- Configuraciones oficiales con vLLM en FP8: un nodo B300 con 4 GPU (TP4, TEP4 o DEP4) o un nodo H200 con 8 GPU (TP8, TEP8 o DEP8).
- Configuraciones oficiales con vLLM en BF16: un nodo B300 con 8 GPU (TP8/TEP8/DEP8) o dos nodos H200 con 16 GPU (TP16/TEP16/DEP16).
- Configuraciones con SGLang en FP8: un nodo B300 con 4 GPU (TP4/EP4).
- Generación offline con Transformers: FP8 en un nodo H200 con 8 GPU (TP8/EP8) y BF16 en dos nodos H200 con 16 GPU (TP16/EP16).
- GPU de consumo: no cabe. No hay ninguna configuración oficial sobre RTX 4090, RTX 5090 o similares.
- Opciones de despliegue: vLLM, SGLang y la implementación standalone de Transformers, todas con interfaz compatible con OpenAI salvo la generación offline. Es necesario usar builds de framework que incluyan soporte para Step 5 Preview, incluidas las funciones de razonamiento, tool call y decodificación especulativa.
- Latencia y throughput: el único dato disponible es el declarado por NVIDIA de aproximadamente 8 000 tokens/segundo por GPU en GB300 con NVFP4. No hay cifras de latencia (TTFT) publicadas en el material disponible.
- Nota: no se publican requisitos de memoria KV cache para el contexto de 1M tokens, lo que es crítico para dimensionar el despliegue.

## Comparativa con modelos similares

En la información proporcionada no aparecen especificaciones de modelos competidores, solo referencias a la propia familia Step. La comparativa se limita, por tanto, a las variantes de pesos publicadas. El resto de celdas queda como "no disponible".

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Despliegue de referencia |
|---|---|---|---|---|---|
| Step-5-Preview-NVFP4 | 600B / 27B (model card); 320.612.382.016 recuento safetensors | Hasta 1M tokens | stepfun-model-license-1.0 | safetensors NVFP4 (394,2 GB) | vLLM, SGLang, Transformers |
| Step-5-Preview (FP8) | no disponible | no disponible | stepfun-model-license-1.0 | FP8 | B300 4 GPU / H200 8 GPU |
| Step-5-Preview-BF16 | no disponible | no disponible | stepfun-model-license-1.0 | BF16 | B300 8 GPU / 2x H200 16 GPU |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia propietaria: `stepfun-model-license-1.0` es una licencia personalizada (identificador `other` en HuggingFace). No se detallan en el material disponible las condiciones exactas de uso comercial, redistribución o despliegue en producción; es obligatorio leer el texto completo en el enlace de licencia antes de integrarlo.
- Discrepancia en el recuento de parámetros: la model card declara 600B totales, mientras que el recuento de safetensors del repositorio NVFP4 es de 320 612 382 016 parámetros. Hay que verificar si se trata de una diferencia de empaquetado de la cuantización, de expertos no incluidos o de un error de conteo.
- Etiquetado de precisión ambiguo: el repositorio se marca como `8-bit` en los tags pero el sufijo NVFP4 corresponde a un formato de 4 bits en coma flotante. Conviene verificar la precisión real de cada tensor antes de planificar memoria.
- Idiomas: no se declara lista de idiomas soportados ni evaluación multilingüe, por lo que el rendimiento fuera de inglés y chino es desconocido.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en tareas financieras y de análisis documental donde el modelo puede producir cifras o referencias plausibles pero incorrectas. Requiere verificación humana en dominios sensibles.
- Soporte de vídeo ambiguo: la introducción menciona vídeo como entrada, pero la tabla de especificaciones solo lista texto e imagen. Hay que confirmarlo antes de diseñar un producto sobre esa capacidad.
- Datos de benchmarks no verificables numéricamente: los resultados se publican únicamente como imagen, sin tabla de valores, y las puntuaciones de GDPval-AA v2.1 dependen de un tercero (Artificial Analysis) con fecha de 20 de septiembre de 2026.
- Coste de despliegue muy elevado: requiere nodos B300 o H200 multigpu; no hay ruta viable en hardware de consumo ni cuantizaciones GGUF publicadas por el autor para esta variante.
- Falta de información sobre sesgos: no se documentan sesgos conocidos, composición del dataset ni auditorías.
- Contexto de 1M tokens: no se publican datos sobre degradación del rendimiento a longitudes máximas ni sobre el coste de memoria de la KV cache, lo que afecta directamente a la planificación de capacidad.
- Momento temporal: el modelo y sus evaluaciones están fechados en octubre de 2026; cualquier comparación con material anterior puede estar desactualizada.

## Enlaces

- Modelo NVFP4 en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4
- Discusiones del repositorio NVFP4: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4/discussions
- Modelo FP8 en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview
- Modelo BF16 en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Modelo FP8 en ModelScope: https://modelscope.ai/models/stepfun-ai/Step-5-Preview
- Modelo BF16 en ModelScope: https://modelscope.ai/models/stepfun-ai/Step-5-Preview-BF16
- Organización StepFun en HuggingFace: https://huggingface.co/stepfun-ai
- Página del modelo: https://www.stepfun.com/step-5-preview
- Documentación: https://platform.stepfun.ai/docs/en/guides/models/step-5-preview
- Plataforma de API: https://platform.stepfun.ai/
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- NVIDIA NIM: https://build.nvidia.com/stepfun-ai/step-5-preview
- Anuncio de NVIDIA AI: https://x.com/NVIDIAAI/status/2110730497907216588
- Análisis de hardware, acceso y licencia (Kingy AI): https://kingy.ai/blog/step-5-preview-weights-hardware-license/
- Harness SWE-agent: https://github.com/SWE-agent/SWE-agent
- Artificial Analysis (fuente de GDPval-AA v2.1): https://artificialanalysis.ai/
