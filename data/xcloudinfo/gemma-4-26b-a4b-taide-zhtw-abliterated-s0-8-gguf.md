# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8-GGUF

## Resumen

El modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8-GGUF` es una versión cuantizada en formato GGUF del modelo base `Gemma-4-26B-A4B-TAIDE-zhTW`, desarrollado por la empresa taiwanesa xCloudinfo (云碩科技). Se trata de un modelo multimodal de arquitectura Mixture-of-Experts (MoE) con 25,2 mil millones de parámetros totales y 4 mil millones de activos, derivado de la familia Gemma 4 de Google y adaptado al chino tradicional mediante el proyecto TAIDE. La versión "abliterated" ha sido sometida a un proceso de eliminación de la dirección de rechazo (refusal direction) con una intensidad de 0,8, lo que reduce significativamente las respuestas de negativa del modelo original.

Este modelo es relevante porque combina tres características poco habituales: es un MoE multimodal de tamaño medio (26B totales, 4B activos) con soporte de visión, está especializado en chino tradicional (zh-TW) y ha sido liberado de restricciones de rechazo mediante abliteration, lo que lo hace útil para investigación en seguridad, evaluación de alineación y aplicaciones que requieren respuestas sin censura dentro de un marco legal. El repositorio incluye seis niveles de cuantización GGUF con matriz de importancia (imatrix) y un proyector visual (mmproj) para uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en Gemma 4 |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | 4 B (A4B) |
| Longitud de contexto | no disponible (en el ejemplo de uso se emplea `-c 4096`, pero no se especifica el maximo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (con imatrix) |
| Idiomas soportados | Chino (tradicional, zh-TW) principalmente; capacidades multilingues del modelo base |
| Licencia | Apache-2.0 (con condiciones adicionales de Gemma 4 License y TAIDE) |
| Formato de pesos | GGUF (llama.cpp) + mmproj en f16 |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 26B parámetros con arquitectura MoE (4B activos), diseñado por Google para eficiencia computacional y razonamiento. Incluye codificadores de visión y audio mejorados, y es nativamente multimodal (image-text-to-text). La versión TAIDE-zhTW es un fine-tuning del modelo original orientado al chino tradicional, realizado en el marco del proyecto TAIDE de Taiwán.

Sobre esta base, xCloudinfo aplicó la técnica de abliteration descrita por Arditi et al. (2024): mediante ortogonalización de pesos, se elimina la dirección de rechazo de todos los pesos que escriben en el flujo residual (token embedding, o_proj de cada capa de atención, down_proj densos y los 128 down_proj de los expertos MoE), con un coeficiente de intensidad de 0,8. Este proceso no requiere reentrenamiento y solo afecta al modelo de lenguaje; el codificador visual permanece intacto. El resultado es un modelo que rechaza menos solicitudes que el original, manteniendo las capacidades generales.

## Capacidades

- Generación de texto y razonamiento en chino tradicional, con capacidades multilingues heredadas del modelo base Gemma 4.
- Comprensión multimodal: acepta entrada de imagen y texto (image-text-to-text) mediante el proyector visual mmproj incluido.
- Conversación multi-turno y diálogo, adecuado para asistentes y chatbots.
- Generación de código y soporte de razonamiento matemático, según las capacidades de la familia Gemma 4.
- Tool calling y function calling: no confirmado explícitamente, pero probable dado el soporte de agentes en Gemma 4.
- Modo "uncensored" o con menor rechazo: el proceso de abliteration reduce las negativas, permitiendo respuestas que el modelo original podría rechazar.
- Cuantizaciones de baja precisión (IQ4_XS, IQ2_M) con imatrix para preservar calidad en entornos con recursos limitados.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el abliteration permite estudiar el comportamiento del modelo sin mecanismos de rechazo, útil para evaluar riesgos y desarrollar contramedidas.
- Evaluación de modelos (red teaming): probar la robustez del modelo ante prompts maliciosos o límites de seguridad, comparando con la versión original.
- Asistente de atención al cliente en chino tradicional: el modelo puede gestionar conversaciones multi-turno con contexto largo (4096 tokens en el ejemplo) y responder en el idioma local, reduciendo costes de infraestructura gracias a la cuantización Q4_K_M.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, documentos escaneados o diagramas junto con texto, útil para archivística o investigación documental en Taiwán.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material educativo donde se requiera explorar temas sensibles sin filtros automáticos.
- Despliegue en entornos con GPU limitada: las cuantizaciones IQ4_XS (13,9 GB) e IQ2_M (10,4 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 o RTX 4060, con pérdida de calidad aceptable para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otros estándares para esta versión abliterada. Se recomienda consultar el informe técnico de Gemma 4 (arXiv:2607.02770) para datos del modelo base, y realizar evaluaciones propias si se requiere comparar con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, más el proyector visual (1,2 GB en f16):
  - Q8_0: 26,9 GB + 1,2 GB ≈ 28,1 GB (requiere GPU profesional o dual consumer)
  - Q6_K: 22,6 GB + 1,2 GB ≈ 23,8 GB (A100 40GB, RTX 4090 24GB con margen justo)
  - Q5_K_M: 19,1 GB + 1,2 GB ≈ 20,3 GB (RTX 4090 24GB, RTX 4080 16GB no suficiente)
  - Q4_K_M: 16,8 GB + 1,2 GB ≈ 18,0 GB (RTX 4090 24GB, RTX 4080 16GB con offloading)
  - IQ4_XS: 13,9 GB + 1,2 GB ≈ 15,1 GB (RTX 4080 16GB, RTX 4070 Ti 12GB con offloading)
  - IQ2_M: 10,4 GB + 1,2 GB ≈ 11,6 GB (RTX 4070 12GB, RTX 3060 12GB)
- GPU recomendadas: NVIDIA RTX 4090 (24GB) para Q4_K_M o superior; A100/H100 para Q8_0 o uso profesional; RTX 3060/4060 (12GB) para IQ2_M.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, o cualquier runtime compatible con GGUF. El ejemplo oficial usa `llama-server -m model-Q4_K_M.gguf --mmproj mmproj-Gemma-4-26B-A4B-TAIDE-zhTW-f16.gguf -c 4096 -ngl 99`.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una RTX 4090 con Q4_K_M se espera una velocidad de 20-40 tokens/s para un MoE de 4B activos, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW (original) | 25,2B totales, 4B activos | no disponible | Sí | Apache-2.0 + Gemma 4 + TAIDE | safetensors |
| Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8 (este) | 25,2B totales, 4B activos | no disponible | Sí | Apache-2.0 + Gemma 4 + TAIDE | GGUF |
| Qwen2.5-14B-Instruct | 14B densos | 128K | No | Apache-2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8B densos | 128K | No | Llama 3.1 License | safetensors, GGUF |

La comparativa directa con alternativas en chino tradicional es limitada. El modelo destaca por ser MoE multimodal con 4B activos, lo que ofrece un rendimiento por parámetro superior a modelos densos de tamaño similar. La versión abliterada no tiene equivalente directo en el ecosistema GGUF.

## Limitaciones y advertencias

- El proceso de abliteration elimina parcialmente los mecanismos de rechazo del modelo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. El autor advierte que el usuario debe implementar sus propias salvaguardas y filtros de salida.
- No se han publicado evaluaciones de seguridad ni benchmarks de la versión abliterada; el impacto en la calidad de las respuestas no está cuantificado.
- El modelo está especializado en chino tradicional; su rendimiento en otros idiomas puede ser inferior al del modelo base Gemma 4.
- La licencia combina Apache-2.0 con términos adicionales de Gemma 4 License y TAIDE, que pueden restringir el uso comercial o militar. Se prohíbe explícitamente el uso para fines ilegales o militares, y se exige cumplir la legislación de Taiwán y la EU AI Act.
- El contexto máximo no está documentado; el ejemplo usa 4096 tokens, pero podría ser mayor. Se recomienda probar antes de desplegar en producción.
- Las cuantizaciones de baja precisión (IQ2_M) pueden degradar significativamente la calidad del texto y la comprensión multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.8-GGUF
- Modelo base (safetensors): https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Versión GGUF sin abliteration: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-GGUF
- Versión abliterated sin cuantizar: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
