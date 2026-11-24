# Xylolabs/gemma-4-26B-A4B-GGUF

## Resumen

Xylolabs/gemma-4-26B-A4B-GGUF es una cuantización en formato GGUF del modelo base google/gemma-4-26B-A4B, publicada por Xylolabs como conjunto de ficheros de referencia para llama.cpp. El modelo original es un Gemma 4 de Google con arquitectura Mixture of Experts (MoE), 25.233.142.046 parámetros totales y una designación "A4B" que indica aproximadamente 4.000 millones de parámetros activos por token. Esta versión concreta empaqueta los pesos en un único fichero Q4_K_M de 16,796 GB, pensado para inferencia local en hardware de consumo y estaciones de trabajo.

La relevancia de esta ficha reside en que permite ejecutar un modelo MoE de escala 26B en GPUs de 24 GB (RTX 4090, RTX 3090) con 64K de contexto, y escalar hasta 256K de contexto en GPUs de 32 GB o superiores. El autor publica además métricas de fidelidad frente al profesor BF16 (KL medio de 0,056776 y 89,8949% de acuerdo top-1), lo que permite evaluar la pérdida de calidad introducida por la cuantización.

El modelo está etiquetado para inglés y coreano, con licencia Apache 2.0 declarada por la release original de Google. No se dispone de información sobre el proceso de entrenamiento, la composición del dataset ni resultados de benchmarks del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), designación A4B; detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4B (según designación A4B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 256K según tabla de hardware del autor; 64K en GPUs de 24 GB; valor máximo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (único formato publicado en este repo) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B emplea una arquitectura Mixture of Experts con 25.233.142.046 parámetros totales y una designación A4B que sugiere aproximadamente 4.000 millones de parámetros activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. No se dispone de información sobre el número de expertos, la estrategia de enrutamiento, el número de capas ni la dimensión de los estados ocultos en la documentación proporcionada.

En cuanto al entrenamiento, la información disponible no detalla el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. El autor cita el informe técnico "Gemma 4 Technical Report" (arXiv:2607.02770) como referencia, pero no se incluyen sus contenidos. La innovación técnica documentada en esta ficha es la propia cuantización: un fichero Q4_K_M de 16,796 GB con métricas de fidelidad frente al profesor BF16 (KL medio 0,056776, acuerdo top-1 del 89,8949%, 28/28 completions correctas tanto en Q4 como en BF16 y cero regresiones contadas).

## Capacidades

- Generación de texto autoregresiva en inglés y coreano, según los idiomas declarados en la model card.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4, sin que se detallen capacidades específicas en la información disponible.
- Modo de completación raw verificada con `llama-completion` de llama.cpp (commit cd959bae), con ejemplo de continuación de texto ("The capital of France is").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a en y ko según los metadatos del repositorio.

## Casos de uso

- Inferencia local en GPU de consumo: con 16,8 GB en Q4_K_M, el modelo cabe en una RTX 4090 o RTX 3090 de 24 GB con 64K de contexto, lo que permite desplegar un MoE de 26B en una única GPU de escritorio sin cuantizaciones más agresivas.
- Procesamiento de documentos largos en estaciones de trabajo: en GPUs de 32 GB (RTX 5090) o 48 GB (RTX 6000 Ada o 2 x 24 GB) el autor indica contexto de 256K, adecuado para resumir o extraer información de contratos, informes o bases de código extensas.
- Servicio de completación de texto de baja latencia: al activar solo ~4B parámetros por token, el modelo reduce el coste por token frente a alternativas densas de 26B, lo que lo hace apto para autocompletado y generación asistida en entornos con presupuesto de cómputo limitado.
- Despliegue en hardware unificado: la tabla del autor incluye DGX Spark (128 GB unificados), Mac Studio M5 Max y M5 Ultra (128-512 GB unificados), lo que permite ejecutar el modelo en equipos de sobremesa con memoria compartida y contexto completo de 256K.
- Evaluación y validación de cuantizaciones: las métricas publicadas (KL 0,056776, top-1 89,8949%) permiten usar este repo como referencia para comparar otras cuantizaciones Q4 del mismo modelo base en tareas de completación.
- Prototipado de aplicaciones en inglés y coreano: los idiomas declarados permiten construir asistentes o herramientas de generación de contenido para esos dos mercados sin necesidad de infraestructura en la nube.
- Integración en pipelines de CI con llama.cpp: el formato GGUF y el ejemplo de `llama-completion` facilitan pruebas automáticas de generación de texto en entornos CPU (`-ngl 0`) o GPU.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.). La única evaluación disponible es la fidelidad de la cuantización frente al profesor BF16:

| Métrica | Resultado |
|---|---|
| KL medio frente al profesor BF16 | 0,056776 |
| Acuerdo top-1 | 89,8949% |
| Completions correctas en Q4 | 28/28 |
| Completions correctas en BF16 | 28/28 |
| Regresiones o respuestas rotas contadas | 0 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,8 GB para el fichero Q4_K_M, más la caché KV en f16 al contexto elegido y unos 2 GB para el runtime. El autor aplica la regla de que el fichero más la caché KV más 2 GB debe quedar por debajo del 90% de la memoria disponible.
- GPU recomendadas según el autor: RTX 4090 / RTX 3090 (24 GB) con 64K de contexto; RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB) y H200 (141 GB) con 256K de contexto; B200 (192 GB) y B300 (288 GB) también con 256K.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con 64K de contexto, y en RTX 5090 (32 GB) con 256K.
- Hardware unificado soportado: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB), todos con 256K de contexto.
- Opciones de despliegue: llama.cpp, con el binario `llama-completion` verificado en el commit cd959bae. No se mencionan vLLM, TGI, Ollama ni otros motores en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa posible es con el propio modelo base sin cuantizar:

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-GGUF | 25.233.142.046 | 64K-256K según hardware | GGUF Q4_K_M (16,8 GB) | Apache 2.0 | Hugging Face, 499 descargas |
| google/gemma-4-26B-A4B (base) | 25.233.142.046 | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 | Hugging Face |

Alternativas de otros fabricantes: no disponible.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce pérdida de calidad medible: KL medio de 0,056776 y acuerdo top-1 del 89,8949% frente al profesor BF16, es decir, aproximadamente un 10% de discrepancia en la predicción top-1.
- Solo se publica un único formato (Q4_K_M); no hay variantes Q5, Q6, Q8 ni ficheros BF16 en este repositorio, lo que limita el ajuste fino entre memoria y calidad.
- Idiomas declarados únicamente inglés y coreano; el rendimiento en castellano u otros idiomas no está documentado y no puede asumirse.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 la declara el autor citando la release original de Google; el repositorio no incluye un fichero legal raíz del proveedor primario, solo el texto estándar de Apache Software Foundation en LICENSE y un NOTICE con el alcance de referencia.
- El autor indica explícitamente que el modelo se proporciona "as is", sin garantía ni respaldo de Google, y que no está afiliado ni respaldado por Google.
- El contexto máximo real del modelo base no se documenta; los valores de 64K y 256K provienen de la tabla de recomendaciones de hardware del autor, no de una especificación oficial del modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no deben asumirse en producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Informe técnico citado: https://arxiv.org/abs/2607.02770
- Herramienta de completación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia en el repositorio: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF/blob/main/LICENSE
