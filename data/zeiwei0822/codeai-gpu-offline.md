# zeiwei0822/CodeAI-GPU-offline

## Resumen

CodeAI-GPU-offline es un paquete de distribución offline publicado por el usuario zeiwei0822 en Hugging Face, no un modelo entrenado desde cero. Su objetivo es desplegar un agente de IA en castellano... no, en chino (idioma declarado: zh) sobre equipos Windows sin conexión a internet con GPU NVIDIA de al menos 16 GB de VRAM (objetivo de diseño: RTX 4000 Ada 20 GB). El paquete integra un modelo principal, un modelo de embeddings para recuperación documental, el runtime llama.cpp con CUDA 12.4 y una interfaz web local, todo empaquetado en un ZIP de aproximadamente 14 GB.

El componente generativo principal es OpenAI gpt-oss-20b en cuantización MXFP4 (formato GGUF de ggml-org), con licencia Apache 2.0. El componente de recuperación es Google EmbeddingGemma 300M en Q8_0. El repositorio declara 307.581.696 parámetros en safetensors, cifra que corresponde al modelo de embeddings y no al modelo generativo, por lo que no debe interpretarse como el tamaño del LLM. La licencia del conjunto es "other" (mixed), con un aviso legal específico en LICENSE-NOTICE.md que agrega las condiciones de cada componente.

La relevancia del proyecto es operativa: permite montar un agente de programación y un sistema de preguntas y respuestas sobre documentos (PDF, Word, Excel, PowerPoint) en entornos air-gapped, con aprobación humana antes de ejecutar comandos PowerShell y posibilidad de revertir cambios en archivos. No se han publicado resultados de benchmarks propios ni métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el paquete; el modelo generativo es OpenAI gpt-oss-20b (arquitectura no detallada en la información proporcionada) |
| Parametros totales | 307.581.696 en safetensors (corresponde a EmbeddingGemma 300M); gpt-oss-20b declarado como modelo principal sin cifra de parámetros en la información |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (modelo principal), Q8_0 (modelo de embeddings) |
| Idiomas soportados | Chino (zh) |
| Licencia | Other / mixed; componentes: Apache 2.0 (gpt-oss-20b), Gemma Terms (EmbeddingGemma), MIT (llama.cpp), NVIDIA CUDA EULA (runtime CUDA), PSF (Python), BSD (numpy, pypdf, highlight.js), MIT/Apache-2.0 (marked, DOMPurify), Microsoft (VC++ Runtime) |
| Formato de pesos | GGUF (distribución vía llama.cpp); safetensors presente en el repo para el modelo de embeddings |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del paquete ni del modelo generativo en la documentación proporcionada. El paquete es una distribución de inferencia: combina OpenAI gpt-oss-20b en GGUF MXFP4 como motor generativo, Google EmbeddingGemma 300M Q8_0 como codificador de embeddings para la base de conocimiento, y llama.cpp b12556 compilado para Windows con CUDA 12.4 como runtime. La orquestación del agente (lectura y escritura de archivos, ejecución de PowerShell con aprobación del usuario, reversión de cambios) reside en el código fuente incluido en `source/`, con script de construcción `build.sh`.

El diseño es deliberadamente autocontenido: Python 3.13.17 portable, numpy 2.5.5, pypdf 7.1.1, marked 12.0.2, DOMPurify 3.1.6 y highlight.js 11.9.0, más el instalador del runtime VC++ 2015-2022 (14.44). No se documentan innovaciones de arquitectura propias, técnicas de decodificación especulativa ni detalles de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de código con ciclo agéntico: lectura de archivos, escritura de archivos, ejecución de comandos PowerShell y corrección de errores.
- Ejecución de comandos con aprobación humana previa y reversión de modificaciones por archivo.
- Preguntas y respuestas sobre documentos con recuperación semántica y citación de fuentes.
- Ingesta de PDF, Word, Excel y PowerPoint en una base de conocimiento local.
- Interfaz web local en chino, servida desde el propio equipo.
- Operación completamente offline, sin dependencia de APIs externas.
- Compatibilidad de endpoints declarada en los tags del repositorio (endpoints_compatible).
- Extracción de características (feature-extraction) mediante el modelo de embeddings.
- No se documenta soporte de visión, audio, tool calling genérico ni modo de razonamiento extendido más allá del ciclo agéntico descrito.

## Casos de uso

- Desarrollo asistido en entornos air-gapped: el agente lee y modifica archivos del proyecto y ejecuta comandos PowerShell con aprobación explícita, lo que permite trabajar en redes aisladas donde no se puede usar un asistente en la nube.
- Auditoría y revisión de código con trazabilidad: al poder revertir cada modificación, encaja en flujos donde se exige control de cambios y revisión humana antes de consolidar ediciones.
- Consulta de documentación técnica interna: indexación de manuales en PDF y ofimáticos en la base de conocimiento local y respuesta con referencia a la fuente, útil para equipos con documentación sensible que no puede salir de la organización.
- Soporte a operaciones en campo o plantas industriales: despliegue en un equipo Windows con RTX 4000 Ada 20 GB sin conectividad, transportado en USB (exFAT/NTFS por el límite de 4 GB por archivo).
- Formación y demostraciones: paquete reproducible con verificación de integridad (`verify.bat`) y arranque mediante `start.bat`, adecuado para talleres sin acceso a internet.
- Prototipado de agentes locales: el código fuente y el script de construcción permiten adaptar la orquestación, el prompt del sistema o la interfaz sin depender del proveedor del paquete.
- Automatización de tareas administrativas sobre ficheros ofimáticos: extracción y consulta de contenido de Excel y PowerPoint mediante pypdf y el pipeline de recuperación incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: mínimo 16 GB según el autor; objetivo de diseño RTX 4000 Ada 20 GB.
- GPU recomendadas: NVIDIA RTX 4000 Ada (20 GB) como referencia del autor; cualquier GPU NVIDIA con 16 GB o más y soporte CUDA 12.4.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 (24 GB) ni con modelos de 16 GB como RTX 4080; el autor solo cita la RTX 4000 Ada. No se garantiza funcionamiento en GPUs de 8-12 GB.
- Runtime: llama.cpp b12556 compilado para Windows con CUDA 12.4, más DLL de CUDA runtime (cudart, cuBLAS).
- Sistema operativo: Windows, con runtime VC++ 2015-2022 (instalador 14.44 incluido).
- Almacenamiento: paquete descomprimido de aproximadamente 14 GB; ZIP de descarga de 14 GB; el repositorio completo ocupa 27,9 GB.
- Transporte: USB formateado en exFAT o NTFS por el límite de 4 GB por archivo.
- Latencia y throughput: no disponibles.
- Alternativas de despliegue: no se documentan vLLM, TGI ni Ollama; el paquete está atado a llama.cpp y a su estructura de arranque.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo generativo que permitan una comparación cuantitativa con alternativas de la misma categoría. A modo de referencia estructural, el paquete se apoya en OpenAI gpt-oss-20b (Apache 2.0) y Google EmbeddingGemma 300M (Gemma Terms), pero no se aportan métricas propias frente a otros asistentes de código locales.

## Limitaciones y advertencias

- Idioma: el paquete y su interfaz están declarados únicamente en chino (zh); no se documenta soporte de castellano ni de otros idiomas.
- Licencia mixta: la licencia "other" agrega condiciones de Apache 2.0, Gemma Terms, MIT, NVIDIA CUDA EULA, PSF, BSD y Microsoft; es obligatorio revisar LICENSE-NOTICE.md antes de cualquier uso comercial o redistribución.
- Restricciones de plataforma: diseñado para Windows con GPU NVIDIA; no se documenta soporte de Linux, macOS ni CPU-only.
- Requisito de VRAM elevado (16 GB mínimo) que excluye la mayoría de GPUs de consumo.
- Riesgo de alucinación inherente al modelo generativo; no se documentan evaluaciones de fidelidad ni de tasas de error en la recuperación documental.
- Ejecución de comandos PowerShell: aunque requiere aprobación del usuario, implica riesgo operativo si se aprueban comandos sin revisión; la reversión cubre archivos, no efectos secundarios del sistema.
- Sin métricas publicadas de rendimiento, latencia o calidad; no es posible estimar el throughput en el hardware objetivo.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes) y fecha de creación futura en los metadatos (2026-11-20), lo que impide validar el mantenimiento del proyecto.
- El recuento de 307.581.696 parámetros en safetensors corresponde al modelo de embeddings, no al generativo; no debe citarse como tamaño del LLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zeiwei0822/CodeAI-GPU-offline
- Descarga directa del paquete: https://huggingface.co/zeiwei0822/CodeAI-GPU-offline/resolve/main/CodeAI_GPU.zip?download=true
- Aviso de licencias: https://huggingface.co/zeiwei0822/CodeAI-GPU-offline/blob/main/LICENSE-NOTICE.md
- Modelo generativo de referencia (OpenAI gpt-oss-20b, GGUF de ggml-org): no se proporciona enlace en la información disponible
- Modelo de embeddings de referencia (Google EmbeddingGemma 300M, GGUF de ggml-org): no se proporciona enlace en la información disponible
- llama.cpp: no se proporciona enlace en la información disponible
- Papers, blogs y demos: no disponibles
