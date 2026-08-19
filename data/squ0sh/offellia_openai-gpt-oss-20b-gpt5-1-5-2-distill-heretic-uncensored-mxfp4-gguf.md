# squ0sh/OFFELLIA_OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4.gguf

## Resumen

Este repositorio contiene una cuantización GGUF del modelo **OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4**, una versión destilada y "uncensored" (abliterated) del modelo open-weight **gpt-oss-20b** de OpenAI. El autor, squ0sh, ha aplicado una cuantización experimental denominada **Q4_2_H** (helicoidal, con bloque de 24 elementos) que forma parte de un fork propio de llama.cpp con modificaciones matemáticas basadas en la "Teoría Aritmético-Harmónica de Becker". El resultado es un archivo GGUF de 25,9 GB que promete un equilibrio entre compresión (4,67 bits por peso) y fidelidad de reconstrucción, aunque requiere un fork específico de llama.cpp para su ejecución.

La relevancia de este modelo radica en que permite ejecutar un LLM de 20B parámetros (arquitectura MoE) en hardware de consumo con una huella de memoria reducida, manteniendo capacidades de razonamiento y tool use propias de la familia gpt-oss. Sin embargo, al ser una cuantización experimental y no contar con benchmarks publicados, su adopción en producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) - basado en gpt-oss-20b |
| Parametros totales | 20B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_2_H (helicoidal, bloque de 24, 4.67 bpw) |
| Idiomas soportados | pt, en |
| Licencia | MIT |
| Formato de pesos | GGUF (v3) |

## Arquitectura y entrenamiento

El modelo base es **gpt-oss-20b**, un modelo de lenguaje de pesos abiertos desarrollado por OpenAI con arquitectura MoE, diseñado para razonamiento, tareas agénticas y uso eficiente en hardware de consumo. Según la documentación de OpenAI, este modelo se distribuye bajo licencia Apache 2.0 y está optimizado para inferencia de bajo coste. La versión aquí cuantizada es una destilación de los modelos GPT-5.1/5.2 (según el nombre) y ha sido sometida a un proceso de "abliteration" para eliminar los rechazos de contenido (uncensored), probablemente mediante técnicas de ajuste fino o edición de pesos.

La innovación principal de este repositorio no está en el entrenamiento, sino en el **método de cuantización helicoidal Q4_2_H**. El autor modifica el código de llama.cpp para introducir un tipo de bloque de 24 elementos (QK_Q4_2_H = 24) que resuelve problemas de divisibilidad en dimensiones de atención y feed-forward (1536, 2048, 4096, 6912, 8192). Cada bloque ocupa 14 bytes (2 bytes de escala FP16 + 12 bytes de 24 nibbles de 4 bits), logrando una tasa de compresión de 4,67 bits por peso. Además, el fork incorpora un "Crivo de Roda Módulo 420" para optimizar búsquedas en tablas hash y un "Amostrador Áureo" basado en la proporción áurea para el muestreo de tokens.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de destilación o abliteration.

## Capacidades

- Generación de texto y razonamiento: al estar basado en gpt-oss-20b, se espera que herede capacidades de razonamiento complejo y respuesta a instrucciones.
- Tool calling / function calling: la familia gpt-oss está diseñada para tareas agénticas y uso de herramientas; esta variante debería conservar dicha capacidad, aunque no se ha verificado específicamente.
- Multilingüismo: soporta portugués e inglés según los metadatos del repositorio.
- Modo "uncensored": al ser una versión abliterated, el modelo no aplica los rechazos de contenido habituales, lo que permite generar respuestas sin restricciones de seguridad (con los riesgos asociados).
- Cuantización especializada: la cuantización Q4_2_H busca reducir el error RMSE en la reconstrucción de tensores, mejorando la fidelidad frente a cuantizaciones estándar como Q4_0 o Q4_1.

## Casos de uso

- **Asistente de código en local**: gracias a su tamaño reducido (25,9 GB) y a la cuantización de 4,67 bpw, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3090/4090 con 24 GB de VRAM) para autocompletar código, generar funciones o refactorizar fragmentos, sin depender de APIs externas.
- **Chat sin censura para investigación**: el modo "uncensored" permite explorar temas sensibles o controversiales en entornos académicos o de análisis de contenido, donde las restricciones de los modelos comerciales limitan la experimentación.
- **Prototipado de agentes con tool calling**: al conservar las capacidades de la familia gpt-oss, puede integrarse en pipelines de agentes que llaman a funciones o APIs, por ejemplo para automatizar tareas de gestión de datos o interacción con servicios web.
- **Traducción y generación de contenido en portugués e inglés**: su soporte bilingüe lo hace útil para empresas que operan en mercados lusófonos y anglófonos, como generación de respuestas de atención al cliente o redacción de documentos.
- **Evaluación de técnicas de cuantización**: el fork de llama.cpp con Q4_2_H es un banco de pruebas para investigadores interesados en métodos de compresión de modelos, permitiendo comparar el error de reconstrucción frente a cuantizaciones clásicas.
- **Despliegue en entornos sin conexión**: al ser un archivo GGUF autocontenido, puede ejecutarse en infraestructuras aisladas (air-gapped) para aplicaciones de procesamiento de lenguaje natural que requieren privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta cuantización específica. El autor menciona en la model card un "servidor integrado de benchmark" para validar métricas del crivo y error RMSE, pero no se proporcionan resultados numéricos.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF pesa 25,9 GB, pero el tamaño en memoria durante la inferencia depende del contexto y del overhead del runtime. Con una cuantización de 4,67 bpw, los pesos del modelo de 20B ocupan aproximadamente 11,7 GB (20e9 * 4.67 / 8 ≈ 11,7 GB). Añadiendo KV cache y buffers, se recomienda al menos 16-20 GB de VRAM para una ventana de contexto moderada.
- **GPU recomendadas**: GPU con 24 GB de VRAM como RTX 3090, RTX 4090, A5000 o similar. También podría ejecutarse en GPUs de 16 GB (por ejemplo, RTX 4080) con contexto reducido o usando offloading a CPU.
- **Compatibilidad con consumer GPU**: sí, es viable en GPUs de gama alta de consumo, siempre que se utilice el fork de llama.cpp con soporte para Q4_2_H.
- **Opciones de despliegue**: requiere compilar el fork de llama.cpp proporcionado por el autor (con las modificaciones en `ggml-common.h`, `ggml-quants.c`, etc.). No es compatible con llama.cpp estándar ni con herramientas como Ollama o vLLM sin adaptaciones, ya que estas no reconocen el tipo de cuantización Q4_2_H.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo MoE de 20B con ~3.6B activos (estimación típica de gpt-oss-20b), se espera un throughput de decenas de tokens por segundo en hardware moderno, pero no hay confirmación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (squ0sh)** | 20B (MoE) | no disponible | Q4_2_H (GGUF) | MIT | Repo HuggingFace |
| **DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4** | 20B (MoE) | no disponible | MXFP4 (formato original) | no especificada | HuggingFace |
| **OpenAI gpt-oss-20b (original)** | 20B (MoE) | 128K (según documentación de OpenAI) | FP16/BF16 | Apache 2.0 | HuggingFace, GitHub |
| **DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf** | 20B (MoE) | no disponible | GGUF (imatrix) | no especificada | HuggingFace |

La comparativa se basa en información pública de la familia gpt-oss. La ventaja de este modelo es su cuantización especializada y la licencia MIT, que permite uso comercial sin restricciones. Sin embargo, la falta de benchmarks y la dependencia de un fork de llama.cpp limitan su interoperabilidad.

## Limitaciones y advertencias

- **Dependencia de un fork de llama.cpp**: la cuantización Q4_2_H no es estándar; requiere compilar el fork del autor, lo que dificulta su uso con herramientas convencionales (Ollama, vLLM, text-generation-webui) y puede generar problemas de mantenimiento o compatibilidad futura.
- **Riesgo de alucinación**: al ser una versión "uncensored" y destilada, el modelo puede producir respuestas inexactas o inventadas con mayor facilidad, especialmente en dominios especializados.
- **Sesgos y contenido inapropiado**: la abliteration elimina los rechazos de seguridad, lo que implica que el modelo puede generar contenido ofensivo, ilegal o dañino. Su uso en producción debe contemplar salvaguardas adicionales.
- **Idiomas limitados**: solo se declaran portugués e inglés; el rendimiento en otros idiomas no está garantizado.
- **Sin datos de contexto**: no se especifica la longitud máxima de contexto soportada, lo que puede llevar a errores si se excede la ventana del modelo.
- **Licencia MIT**: aunque permite uso comercial, el modelo base (gpt-oss-20b) está bajo Apache 2.0; la combinación de ambos términos debe revisarse, aunque MIT es más permisiva, la procedencia del modelo base debe respetarse.
- **Falta de validación**: sin benchmarks ni pruebas independientes, la calidad real de la cuantización helicoidal es desconocida; el autor afirma mejoras en RMSE, pero no hay evidencia pública.

## Enlaces

- [Repositorio HuggingFace del modelo (squ0sh)](https://huggingface.co/squ0sh/OFFELLIA_OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4.gguf)
- [Modelo base de DavidAU (versión MXFP4)](https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4)
- [Modelo similar de DavidAU con GGUF imatrix](https://huggingface.co/DavidAU/OpenAi-GPT-oss-20b-abliterated-uncensored-NEO-Imatrix-gguf)
- [Repositorio oficial de OpenAI gpt-oss](https://github.com/openai/gpt-oss)
- [Anuncio de OpenAI sobre gpt-oss](https://openai.com/index/introducing-gpt-oss/)
