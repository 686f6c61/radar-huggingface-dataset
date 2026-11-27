# Xylolabs/gemma-4-26B-A4B-GGUF

## Resumen

Gemma 4 26B A4B GGUF es una cuantización en formato GGUF del modelo base google/gemma-4-26B-A4B, publicada por Xylolabs como referencia para su uso con llama.cpp. El modelo original es un transformer de tipo mezcla de expertos (MoE) desarrollado por Google, con 25.233.142.046 parámetros totales y una nomenclatura "A4B" que sugiere aproximadamente 4.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. La versión cuantizada se distribuye en un único archivo Q4_K_M de 16,796 GB.

El interés de esta publicación radica en que ofrece un punto de referencia reproducible para ejecutar un modelo MoE de gran tamaño en hardware de consumo. La model card documenta una evaluación de fidelidad frente al profesor BF16 original, con una divergencia KL media de 0,056776 y una tasa de acuerdo top-1 del 89,8949%, además de una tabla de recomendaciones de hardware que abarca desde una RTX 4090 de 24 GB hasta aceleradores B300 de 288 GB. El contexto máximo citado en esa tabla es de 256K tokens en configuraciones con memoria suficiente.

La licencia declarada es Apache 2.0, heredada del release de Google, y los idiomas listados son inglés y coreano. El repositorio tiene 542 descargas y 1 like en el momento de la consulta, lo que indica una adopción todavía muy limitada. El modelo está pensado para generación de texto en modo completion y se distribuye con la etiqueta "reference-format", lo que sugiere que su propósito principal es servir como referencia técnica más que como artefacto de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), según la nomenclatura "A4B" del modelo base; detalles no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B, sin confirmación oficial) |
| Longitud de contexto | hasta 256K tokens en configuraciones con memoria suficiente; 64K en RTX 4090/3090 de 24 GB |
| Tipos de cuantizacion | Q4_K_M (único formato incluido, 16,796 GB) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base google/gemma-4-26B-A4B más allá de su naturaleza MoE inferida de la nomenclatura. No se especifican el número de expertos, la estrategia de enrutamiento, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo original en la model card de esta cuantización.

Lo que sí está documentado es el proceso de cuantización: la conversión a Q4_K_M mediante llama.cpp (referencia de commit cd959bae) y la evaluación de fidelidad frente al profesor BF16. Los resultados reportados son una divergencia KL media de 0,056776, un acuerdo top-1 del 89,8949%, 28 de 28 completions correctas tanto en Q4 como en BF16 y cero regresiones contabilizadas. Estos datos indican una degradación moderada pero medible respecto al modelo original, típica de una cuantización de 4 bits.

## Capacidades

- Generación de texto en modo completion (continuación de texto), según el ejemplo de uso documentado con `llama-completion`.
- Soporte de contexto largo, hasta 256K tokens en hardware con memoria suficiente (H100, H200, B200, B300, Mac Studio M5 Ultra, DGX Spark).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Evaluación de fidelidad de cuantizaciones: el repositorio incluye métricas KL y de acuerdo top-1 frente al profesor BF16, lo que lo convierte en un artefacto útil para validar pipelines de cuantización propios comparando contra esta referencia.
- Inferencia local en GPU de consumo: con 16,8 GB en Q4_K_M cabe en una RTX 4090 o RTX 3090 de 24 GB y permite ejecutar un MoE de 25B parámetros con 64K de contexto, adecuado para prototipado y pruebas en estación de trabajo.
- Procesamiento de documentos largos en inglés o coreano: la ventana de hasta 256K tokens en hardware de 48 GB o más permite resumir o extraer información de contratos, informes o expedientes extensos sin trocear el texto.
- Despliegue en estaciones con memoria unificada: en Mac Studio M5 Max o DGX Spark (128 GB unificados) se puede servir el modelo con contexto completo para tareas de análisis batch sin depender de GPU dedicada.
- Generación de texto en pipelines de completion: el formato GGUF y la compatibilidad con llama.cpp permiten integrarlo en scripts de generación por lotes para tareas de continuación, etiquetado o síntesis de texto.
- Base para ajuste fino o destilación: al ser una cuantización de referencia con licencia Apache 2.0, puede servir como punto de partida para experimentos que requieran un modelo MoE de tamaño medio en entornos con recursos limitados.
- Investigación sobre cuantización de MoE: la comparación entre Q4_K_M y BF16 documentada permite estudiar cómo afecta la cuantización de 4 bits al enrutamiento de expertos y a la calidad de salida.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Divergencia KL media frente al profesor BF16 | 0,056776 |
| Acuerdo top-1 | 89,8949% |
| Completions correctas en Q4 | 28/28 |
| Completions correctas en BF16 | 28/28 |
| Regresiones o respuestas rotas contabilizadas | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,8 GB para el archivo Q4_K_M, más memoria adicional para KV cache según la longitud de contexto.
- GPU recomendadas según la model card:
  - RTX 4090 / RTX 3090 (24 GB): contexto de 64K.
  - RTX 5090 (32 GB): contexto de 256K.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): contexto de 256K.
  - H100 (80 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB), RTX PRO 6000 Blackwell (96 GB): contexto de 256K.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090, con contexto reducido a 64K en las de 24 GB.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB) con contexto de 256K.
- Opciones de despliegue: llama.cpp (herramienta `llama-completion` documentada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce una degradación medible: divergencia KL de 0,056776 y acuerdo top-1 del 89,8949% frente al BF16, lo que implica que aproximadamente una de cada diez predicciones top-1 difiere del original.
- Los idiomas soportados se limitan a inglés y coreano según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso, por lo que no es adecuado para pipelines que dependan de estas funciones sin validación previa.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original de Google y el archivo NOTICE incluido en el repositorio.
- El contexto de 256K solo es alcanzable con hardware de 48 GB o más; en GPU de 24 GB se reduce a 64K.
- La adopción del repositorio es muy baja (542 descargas, 1 like), lo que limita la validación comunitaria de su comportamiento en producción.
- El modelo está etiquetado como "reference-format" y "pretrained", lo que sugiere que no ha pasado por un proceso de alineación para uso conversacional; el ejemplo documentado es de completion pura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Herramienta de completion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-GGUF/blob/main/LICENSE
