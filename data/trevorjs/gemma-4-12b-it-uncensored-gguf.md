# TrevorJS/gemma-4-12B-it-uncensored-GGUF

## Resumen

`TrevorJS/gemma-4-12B-it-uncensored-GGUF` es la versión cuantizada en formato GGUF de `TrevorJS/gemma-4-12B-it-uncensored`, una variante "abliterada" (sin rechazos) del modelo `google/gemma-4-12B-it` de Google. El autor, TrevorJS, ha aplicado una técnica de abliteration biproyectada con preservación de norma para eliminar el comportamiento de rechazo del modelo original, manteniendo el resto de capacidades intactas. El resultado es un modelo de 11.907.350.576 parámetros (aproximadamente 12B) orientado a generación de texto conversacional sin las negativas automáticas típicas de los modelos alineados.

El repositorio contiene dos cuantizaciones GGUF: Q4_K_M (7,4 GB) y Q8_0 (12,7 GB), pensadas para despliegue local mediante llama.cpp. Es relevante ahora porque permite ejecutar un modelo de 12B en hardware de consumo con buena calidad, y porque la comunidad interesada en modelos sin censura dispone de una alternativa lista para usar con llama-server y una interfaz de chat integrada. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar las condiciones heredadas del modelo base de Google.

El modelo solo declara soporte para inglés (`language: en`) y está etiquetado como `conversational` y `text-generation`. La arquitectura subyacente es la de Gemma 4, un transformer decoder-only, pero los detalles específicos de arquitectura, contexto nativo y composición del entrenamiento no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 11.907.350.576 (aprox. 12B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base bf16 |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de `TrevorJS/gemma-4-12B-it-uncensored`, que a su vez deriva de `google/gemma-4-12B-it`. La modificación principal respecto al modelo original de Google es la aplicación de abliteration biproyectada con preservación de norma (norm-preserving biprojected abliteration), una técnica que identifica la dirección de activación asociada al comportamiento de rechazo y la proyecta fuera del espacio de pesos sin degradar la norma de las matrices. Según la model card, esto elimina el comportamiento de rechazo manteniendo las capacidades generales del modelo, con validación cruzada entre datasets documentada en la model card del modelo bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base. Los detalles completos del método de abliteration, las tasas de rechazo antes y después, y los resultados de validación cruzada se remiten a la model card del modelo bf16 y al repositorio de código `TrevorJS/gemma-4-abliteration`. La conversión a GGUF requiere una build de llama.cpp del 4 de junio de 2026 o posterior (PR #24118), que añadió soporte de conversión e inferencia para `Gemma4Unified`; builds anteriores no cargarán estos ficheros.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones (modelo `-it`, instruction-tuned).
- Comportamiento sin rechazos (uncensored) gracias a la abliteration aplicada.
- Compatible con endpoints (tag `endpoints_compatible`), lo que sugiere integración con APIs de inferencia.
- Ejecución local vía llama.cpp y llama-server con interfaz de chat web integrada.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües limitadas al inglés según los metadatos.

## Casos de uso

- Chat local en hardware de consumo: con la cuantización Q4_K_M (7,4 GB) el modelo cabe en GPUs con 8-12 GB de VRAM y permite conversaciones fluidas mediante `llama-server -c 8192`, ideal para prototipos y uso personal sin depender de la nube.
- Investigación sobre alineación y abliteration: permite estudiar empíricamente el efecto de eliminar la dirección de rechazo en un modelo de 12B, comparando respuestas con el modelo original de Google en el mismo conjunto de prompts.
- Generación creativa sin restricciones de rechazo: escritura de ficción, guiones y contenido narrativo donde los modelos alineados tienden a rechazar temas sensibles, usando la cuantización Q8_0 para maximizar fidelidad al modelo bf16.
- Evaluación de robustez y red teaming: útil como baseline "sin censura" para probar sistemas de moderación externos, ya que el modelo no se autolimita y expone de forma directa sesgos y conocimiento interno.
- Despliegue en pipelines de generación de texto por lotes: con llama.cpp se pueden procesar grandes volúmenes de prompts en CPU/GPU mixtas, aprovechando el tamaño reducido de Q4_K_M para throughput en servidores modestos.
- Asistente conversacional para entornos controlados: en herramientas internas donde el operador gestiona la moderación aguas arriba, el modelo ofrece respuestas directas sin negativas automáticas que interrumpan el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 7,4 GB en disco y requiere aproximadamente 8-10 GB de VRAM para inferencia con contexto moderado; Q8_0 ocupa 12,7 GB y requiere aproximadamente 14-16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4070/4080 o GPUs de 12-16 GB para Q4_K_M; A100/H100 para servir múltiples instancias o contextos largos.
- Cabe en GPU de consumo: sí, Q4_K_M en GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB) y Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp y llama-server (requiere build del 4 de junio de 2026 o posterior); también es compatible con cualquier runtime que soporte GGUF y la arquitectura Gemma 4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TrevorJS/gemma-4-12B-it-uncensored-GGUF | 11,9B | no disponible | apache-2.0 | GGUF | Abliterado, solo inglés, cuantizaciones Q4_K_M y Q8_0 |
| google/gemma-4-12B-it | ~12B | no disponible | condiciones de Gemma (no disponibles) | safetensors | Modelo original alineado, con rechazos |
| TrevorJS/gemma-4-12B-it-uncensored | 11,9B | no disponible | apache-2.0 | safetensors (bf16) | Versión sin cuantizar del mismo modelo abliterado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar la capa de rechazo, el modelo puede reproducir sesgos, estereotipos y contenido dañino del corpus de entrenamiento sin filtro; no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no se dispone de datos específicos; como todo modelo generativo de 12B, puede inventar hechos, especialmente en dominios especializados.
- Limitación de idioma: solo declara soporte de inglés; el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero al derivar de `google/gemma-4-12B-it` conviene verificar las condiciones de uso del modelo base de Google antes de explotación comercial.
- Caveat técnico: requiere una build de llama.cpp del 4 de junio de 2026 o posterior; builds anteriores fallarán al cargar los ficheros GGUF.
- Al ser un modelo "uncensored", no es adecuado para aplicaciones orientadas al público general sin moderación externa aguas arriba.
- La abliteration puede degradar ligeramente capacidades de razonamiento o coherencia en comparación con el modelo original; no hay métricas publicadas que cuantifiquen esta posible degradación en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored-GGUF
- Modelo base bf16: https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Código de abliteration: https://github.com/TrevorS/gemma-4-abliteration
- PR de soporte Gemma 4 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/24118
