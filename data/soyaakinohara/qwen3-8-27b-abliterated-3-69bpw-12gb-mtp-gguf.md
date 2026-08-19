# soyaakinohara/qwen3.8-27b-abliterated-3.69bpw-12GB-MTP.gguf

## Resumen

Este repositorio contiene una cuantización GGUF de tipo mixto del modelo Qwen3.8-27B en su variante abliterada (sin capa de rechazo) desarrollada por AEON-7. El autor, soyaakinohara, ha aplicado un esquema de cuantización inspirado en el proyecto Ridge de Empero, que preserva con mayor precisión los tensores críticos de la ruta Gated-DeltaNet mientras comprime el resto del modelo a una media de 3,69 bits por peso. El resultado es un archivo de aproximadamente 12,6 GB que cabe en GPUs de consumo con 12-16 GB de VRAM y alcanza velocidades de inferencia de hasta 37 tokens por segundo en hardware de gama media.

El modelo base, Qwen3.8-27B, es un transformer denso de 27.000 millones de parámetros con arquitectura híbrida que combina atención completa con capas Gated-DeltaNet (un tipo de SSM), ventana de contexto nativa de 262.144 tokens y soporte para decodificación especulativa multi-token (MTP). Esta versión GGUF mantiene el cabezal MTP, lo que permite acelerar la generación en llama.cpp mediante el modo `draft-mtp`. La licencia Apache-2.0 facilita su uso comercial, aunque al tratarse de un modelo sin censura, su despliegue requiere controles adicionales de moderación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated-DeltaNet (SSM) + atención completa (Qwen3.5/Qwen3.8) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: F32, Q4_K, Q8_0, IQ2_S, IQ3_S, Q5_K, Q6_K (nominal 3,69 bpw) |
| Idiomas soportados | Japonés, inglés, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención completa con capas Gated-DeltaNet, un mecanismo de estado recurrente que reduce el coste computacional en contextos largos. Sobre esta base, AEON-7 aplicó un proceso de "abliteración" (eliminación de la dirección de rechazo) y una reparación de outliers en la convolución SSM, además de injertar un cabezal MTP estándar. El repositorio actual no contiene el entrenamiento original, sino una cuantización posterior de los pesos BF16 de AEON-7.

La cuantización sigue un mapa de tipos mixto inspirado en el proyecto Ridge: los tensores de la ruta de estado Gated-DeltaNet (`ssm_alpha` y `ssm_beta`) se mantienen en Q8_0, los proyectores del mezclador en Q4_K, las capas FFN intermedias en IQ2_S e IQ3_S, y las de atención completa en Q5_K. Los tensores MTP se fijan en Q6_K. La calibración se realizó con un corpus propio que combina WikiText en inglés, extractos de Wikipedia japonesa y código fuente de llama.cpp, generando una matriz de importancia de 497 entradas. No se trata de una re-cuantización de un checkpoint ya cuantizado, sino de una conversión directa desde los pesos BF16.

## Capacidades

- Generación de texto y razonamiento en contextos de hasta 262.144 tokens, gracias a la combinación de atención completa y Gated-DeltaNet.
- Decodificación especulativa multi-token (MTP) nativa, que permite acelerar la inferencia en llama.cpp mediante `--spec-type draft-mtp`.
- Soporte multilingüe, con especial atención al japonés y al inglés, aunque el modelo base es multilingüe.
- Capacidad de procesamiento de documentos largos, código fuente y tareas de agente con memoria extendida.
- Al ser una versión abliterada, no presenta rechazo a peticiones que un modelo alineado normalmente denegaría (con los riesgos asociados).
- No incluye procesamiento de visión en este archivo GGUF; se requiere un `mmproj` compatible si se necesita entrada de imágenes.

## Casos de uso

- Inferencia local en GPU de consumo: con 12,6 GB de peso, el modelo cabe en tarjetas de 16 GB VRAM (p. ej., RTX 5060 Ti) y puede ejecutarse en configuraciones de doble GPU mediante `--split-mode layer`. Es adecuado para entornos sin acceso a hardware de datacenter.
- Asistentes de código en local: la ventana de 262K tokens permite cargar repositorios completos o archivos de gran tamaño, y el modo MTP acelera la autocompletación. Puede integrarse con herramientas como llama.cpp server o frontends compatibles con la API de OpenAI.
- Procesamiento de documentos extensos: resumir o extraer información de libros técnicos, informes o actas con contexto largo sin necesidad de truncar.
- Desarrollo de agentes conversacionales sin restricciones de contenido: útil para investigación en alineación o generación creativa, siempre que se implementen capas de moderación externas.
- Traducción y generación de texto en japonés e inglés: el modelo muestra buen rendimiento en ambos idiomas según la calibración realizada.
- Experimentación con decodificación especulativa: el cabezal MTP preservado permite probar configuraciones de `--spec-draft-n-max` y medir el impacto en throughput en diferentes hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta únicamente una velocidad de inferencia de hasta 37 tokens por segundo en un sistema con RTX 5060 Ti 16GB y RTX 3070 8GB, usando llama.cpp con CUDA y MTP activado. No hay datos comparativos de calidad (MMLU, HumanEval, GSM8K) para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 12,6 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo con KV cache. En GPUs de 12 GB puede ser necesario reducir el contexto o usar offloading parcial a CPU.
- GPUs recomendadas: RTX 5060 Ti 16GB, RTX 3070 8GB (en configuración dual), o cualquier GPU con 16 GB o más. También es viable en Mac con 24 GB de memoria unificada (el modelo Q4 original ocupa ~17,8 GB, pero esta versión es más compacta).
- Opciones de despliegue: llama.cpp (server o CLI), Ollama (si se importa el GGUF), LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: el autor reporta ~37 tok/s en su configuración de doble GPU. En una sola GPU de gama media se espera un rendimiento menor, dependiendo del contexto y la tasa de aceptación del MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | BF16/FP8 | Apache-2.0 | Modelo base, incluye visión |
| AEON-7 Qwen3.8-27B (BF16) | 27B | 262K | BF16 | Apache-2.0 | Versión abliterada, sin capa de rechazo |
| Este GGUF (3.69 bpw) | 27B | 262K | GGUF mixto | Apache-2.0 | Cuantización compacta, solo texto, MTP preservado |
| Empero Ridge GGUF | 27B | 262K | GGUF mixto | Apache-2.0 | Cuantización de referencia con mapa de tipos similar |

La principal diferencia frente al modelo original es el tamaño: 12,6 GB frente a ~54 GB en BF16, lo que permite ejecutarlo en hardware de consumo. Frente a otras cuantizaciones estándar (p. ej., Q4_K_M de ~17,8 GB), esta versión es más pequeña pero con una distribución de precisión orientada a preservar la ruta SSM.

## Limitaciones y advertencias

- Modelo sin censura: al ser abliterado, puede generar contenido ofensivo, ilegal o peligroso sin filtros. No dispone de capa de seguridad fiable; cualquier despliegue en producción debe incluir moderación externa, registro de actividad y revisión humana.
- Cuantización agresiva: la media de 3,69 bits por peso puede degradar la calidad en tareas que requieren precisión numérica, como matemáticas complejas o razonamiento lógico extenso. Se recomienda validar el rendimiento en el caso de uso concreto.
- Solo texto: este archivo GGUF no incluye el codificador de visión del modelo original. Para entrada de imágenes se necesita un `mmproj` compatible, que no se proporciona en este repositorio.
- Dependencia de llama.cpp: el soporte MTP y el mapa de cuantización mixto requieren una versión reciente de llama.cpp (commit `030ebb558` o posterior). Otras herramientas pueden no reconocer correctamente todos los tipos de tensor.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o con datos poco frecuentes. La ausencia de capa de alineación puede aumentar la confianza en respuestas incorrectas.
- Sin benchmarks publicados: no hay evidencia objetiva de la calidad del modelo cuantizado frente a la versión BF16 o a otras cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soyaakinohara/qwen3.8-27b-abliterated-3.69bpw-12GB-MTP.gguf
- Modelo base (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Ridge (inspiración de cuantización): https://huggingface.co/empero-ai/Qwen3.8-27B-Ridge-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía para Mac/GPU (modelfit): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
