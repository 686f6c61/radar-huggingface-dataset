# Yyyssd/Huihui-GLM-5.3-Flash-abliterated-GGUF

## Resumen

Huihui-GLM-5.3-Flash-abliterated-GGUF es una versión "abliterada" (sin filtros de rechazo) del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario Yyyssd en Hugging Face. El proceso de abliteración, realizado con la técnica descrita en el repositorio remove-refusals-with-transformers, modifica direccionalmente las capas del modelo para suprimir los mecanismos internos que generan negativas de seguridad, permitiendo que el modelo responda a peticiones que la versión original rechazaría.

El modelo base, GLM-5.3-Flash, es un modelo multimodal (image-text-to-text) de la familia GLM desarrollada por Z.ai, con 320.759 millones de parámetros totales según los metadatos de safetensors. La variante abliterada conserva íntegramente las capacidades del modelo original (razonamiento, código, visión y conversación) pero elimina su alineamiento de seguridad, lo que la hace relevante para investigación sobre alineamiento, red-teaming y experimentación en entornos controlados.

Esta ficha se centra en la versión GGUF, cuantizada a partir de los ficheros de unsloth/GLM-5.3-Flash-GGUF, que permite ejecutar el modelo localmente mediante llama.cpp. La versión más reciente de llama.cpp ya soporta oficialmente GLM-5.3-Flash, lo que simplifica el despliegue en hardware de consumo y servidores propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM, multimodal image-text-to-text); detalles completos no disponibles |
| Parametros totales | 320.759.404.382 (~320,76 B) |
| Parametros activos | no disponible (se desconoce si es MoE; los módulos expertos mencionados en la model card sugieren arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (256 K, según el comando de ejemplo con llama.cpp) |
| Tipos de cuantizacion | GGUF (imatrix); disponible UD-Q4_K_XL; el resto de cuantizaciones concretas no detalladas en la model card |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio original en safetensors) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash de zai-org, un modelo multimodal de la familia GLM clasificado con el pipeline image-text-to-text, es decir, acepta entradas combinadas de imagen y texto. Con más de 320.000 millones de parámetros totales, la mención explícita a "expert modules" no abliterados en la model card apunta a una arquitectura de mezcla de expertos (MoE), aunque ni el número de expertos ni los parámetros activos por token están publicados en la información disponible.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se han proporcionado datos en la información disponible. En cuanto a la modificación introducida en esta variante, la abliteración se aplicó únicamente a las capas 15 a 35 (con indexación base 0), dejando el resto de capas y todos los módulos expertos intactos. Esta abliteración selectiva es una técnica de prueba de concepto que busca minimizar el impacto en la calidad general del modelo mientras se eliminan los rechazos de seguridad.

## Capacidades

- Generacion de texto conversacional multi-turno sin filtros de rechazo (versión abliterada).
- Comprension multimodal de imagen y texto (pipeline image-text-to-text heredado del modelo base).
- Ejecucion local mediante GGUF con llama.cpp, con soporte oficial en las versiones recientes.
- Contexto largo de hasta 262.144 tokens (256 K) en inferencia.
- Idiomas de trabajo: ingles y chino.
- Soporte de tool calling, agentes y modos de razonamiento: no disponible en la informacion proporcionada (dependeria de las capacidades del modelo base GLM-5.3-Flash, no documentadas aqui).

## Casos de uso

- Investigacion en alineamiento y seguridad: permite estudiar como se comportan los mecanismos de rechazo tras la abliteracion selectiva de capas, util para red-teaming y auditoria de seguridad de modelos.
- Pruebas de robustez frente a contenido sensible: los equipos de seguridad pueden usar el modelo para simular ataques jailbreak y evaluar sistemas de filtrado externos que se colocarian delante de modelos alineados.
- Generacion de datos sinteticos dificiles: creacion de conjuntos de datos con contenido controversial para entrenar clasificadores de moderacion, evitando los rechazos del modelo base.
- Procesamiento multimodal local de documentos e imagenes: analisis de documentos con imagenes en entornos sin conexion, aprovechando el pipeline image-text-to-text y la cuantizacion GGUF.
- Experimentacion con contexto largo: analisis de repositorios de codigo, expedientes documentales o conversaciones extensas de hasta 256 K tokens en hardware propio.
- Desarrollo y prueba de herramientas de inferencia: al estar soportado oficialmente en llama.cpp, sirve como banco de pruebas para optimizaciones de cuantizacion, imatrix y despliegue GGUF de modelos de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ademas, debe tenerse en cuenta que la abliteracion puede degradar ligeramente el rendimiento respecto al modelo base GLM-5.3-Flash, cuyos resultados oficiales tampoco estan incluidos en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: con ~320.760 millones de parametros, la cuantizacion Q4_K_XL (4,5-5 bits efectivos) requiere en torno a 180-200 GB solo de pesos, a los que hay que sumar la KV cache para el contexto de 256 K. No cabe en una sola GPU de consumo.
- GPU recomendadas: configuraciones multi-GPU de gama alta de datos (2-4 x NVIDIA A100 80 GB o H100 80 GB), o Mac Studio con memoria unificada de 256-512 GB.
- Consumer GPU: no cabe en GPUs de consumo habituales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni siquiera con offload parcial mas alla de un modo muy degradado con descarga masiva a CPU/RAM.
- Despliegue: llama.cpp (rama oficial reciente o el PR de unslothai para GLM-5.3-Flash); los ficheros GGUF estan divididos en 6 partes y solo hay que descargar la primera de cada cuantizacion. Soporte de vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Comando de referencia de la model card: `llama-cli -m .../GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf -c 262144`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-GLM-5.3-Flash-abliterated-GGUF | ~320,76 B (totales) | 256 K | MIT | GGUF | Version sin filtros, cuantizada por unsloth |
| GLM-5.3-Flash (zai-org, base) | ~320,76 B | 256 K (segun ejemplo de inferencia) | MIT (heredada) | safetensors, GGUF | Modelo original con alineamiento de seguridad |
| unsloth/GLM-5.3-Flash-GGUF | ~320,76 B | 256 K | MIT | GGUF | Cuantizacion fuente sin abliterar |

No se incluyen comparativas con otros modelos de terceros (Qwen, DeepSeek, Llama) porque no se dispone de datos suficientes de GLM-5.3-Flash para una comparacion rigurosa de rendimiento.

## Limitaciones y advertencias

- Eliminacion de seguridad: los filtros de seguridad estan significativamente reducidos; el modelo puede generar contenido sensible, controversial o inapropiado. No es adecuado para publico general, menores de edad ni aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica: el usuario es el unico responsable de que el uso cumpla la legislacion local y las normas eticas; los autores no asumen responsabilidad por las consecuencias.
- Uso recomendado solo en investigacion, pruebas o entornos controlados; se desaconseja su uso directo en produccion o aplicaciones comerciales de cara al publico.
- Posible degradacion de calidad: la abliteracion es una implementacion "cruda" de prueba de concepto y puede afectar a la coherencia o utilidad de las respuestas respecto al modelo base.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Requisitos de hardware muy elevados (~180-200 GB solo en pesos cuantizados), lo que limita su uso local a configuraciones multi-GPU o estaciones con memoria unificada de gran capacidad.
- Riesgo de alucinacion: inherente a cualquier LLM y agravado por la ausencia de optimizaciones de seguridad; se recomienda monitorizar y revisar manualmente las salidas en tiempo real.

## Enlaces

- Modelo abliterado (GGUF): https://huggingface.co/Yyyssd/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF originales de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Tecnica de abliteracion (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- PR de llama.cpp para GLM-5.3-Flash (unslothai): https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Soporte al autor (Ko-fi): https://ko-fi.com/huihuiai
