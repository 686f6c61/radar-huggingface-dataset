# Xylolabs/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por inclusionAI, distribuido originalmente con licencia MIT. Esta ficha describe la versión cuantizada en formato GGUF publicada por Xylolabs, pensada para su ejecución con llama.cpp sobre CUDA, Metal o CPU. El modelo es multimodal (pipeline image-text-to-text) y está orientado a conversación y generación de texto en inglés y chino.

Con 127.486.405.600 parámetros totales según los pesos en safetensors, Ling-3.2-air es un modelo de gran escala que, gracias a su arquitectura MoE, activa solo una fracción de los parámetros por token, lo que reduce el coste computacional por inferencia frente a un modelo denso equivalente. La versión GGUF de Xylolabs ofrece ocho niveles de cuantización (desde Q8_0 hasta Q2_K) más un proyector visual en F16, con métricas de divergencia KL y acuerdo top-1 frente a los pesos originales en BF16.

La relevancia de esta ficha radica en que permite desplegar un modelo MoE multimodal de más de 127.000 millones de parámetros en hardware que va desde una RTX 4090 de 24 GB (con offload de expertos a RAM del sistema) hasta una B300 de 288 GB, manteniendo una ventana de contexto de hasta 256K tokens en las configuraciones de mayor memoria. Es una opción práctica para investigadores y desarrolladores que necesitan evaluar un modelo grande sin infraestructura de centro de datos completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (image-text-to-text) |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según configuración de hardware); 32K en configuraciones con offload |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K; proyector visual en F16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

Ling-3.2-air es un modelo Mixture of Experts (MoE) de tipo transformer con capacidades multimodales (procesamiento conjunto de imagen y texto). La model card de la versión GGUF confirma la naturaleza MoE mediante la etiqueta `moe` y el comando de ejecución con `--n-cpu-moe 43`, que indica la existencia de al menos 43 expertos cuyo peso puede residir en RAM del sistema. No se dispone de información detallada sobre el número total de expertos, el número de expertos activos por token, la dimensión de las capas ni el mecanismo de enrutamiento en la información proporcionada.

Tampoco se especifican en la documentación disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card original de inclusionAI no forma parte de la información suministrada, por lo que estos datos deben consultarse en el repositorio del modelo base. La innovación técnica destacable en esta distribución es la cuantización con imatrix (etiqueta `imatrix`), que emplea una matriz de importancia para preservar la calidad de los pesos durante la compresión, con métricas de divergencia KL y acuerdo top-1 publicadas para cada nivel de cuantización.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto mediante el proyector visual `mmproj-Ling-3.2-air-F16.gguf`.
- Razonamiento y respuesta multi-turno en contextos de hasta 256K tokens (en configuraciones de hardware con memoria suficiente).
- Ejecución local mediante llama.cpp en CUDA, Metal y CPU.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional multilingüe (inglés-chino): el modelo puede gestionar diálogos multi-turno con contexto largo, adecuado para atención al cliente o soporte técnico en entornos bilingües, gracias a su ventana de hasta 256K tokens en configuraciones de memoria alta.
- Análisis de documentos extensos con imágenes: al ser image-text-to-text, permite procesar informes, capturas o diagramas junto con texto largo, útil para extracción de información en flujos de trabajo documentales.
- Despliegue en estación de trabajo con GPU de consumo: con la cuantización Q2_K (49,54 GB) y offload de expertos a RAM del sistema, puede ejecutarse en una RTX 4090 o RTX 3090 de 24 GB, lo que facilita la experimentación local sin clúster.
- Investigación en cuantización: las métricas de divergencia KL y acuerdo top-1 publicadas por nivel de cuantización permiten estudiar el impacto de la compresión en un MoE de gran escala, comparando Q8_0 (KL 0,013439 en WikiText-2) frente a Q2_K (KL 0,315024).
- Servicio de inferencia en servidor con llama.cpp: el comando `llama-server` con `--jinja` y `-ngl 99` permite exponer el modelo como API compatible con endpoints en una H100, H200 o B200, con contexto de 256K tokens.
- Procesamiento por lotes en CPU o Metal: en Mac Studio con memoria unificada de 128 GB o superior, el modelo puede ejecutarse sin GPU dedicada, adecuado para prototipado y evaluación en entornos macOS.
- Evaluación comparativa de modelos MoE: útil para investigadores que necesitan contrastar el comportamiento de un MoE de 127B parámetros cuantizado frente a alternativas densas o MoE de menor tamaño en tareas de razonamiento y visión.

## Benchmarks y rendimiento

La model card de Xylolabs publica métricas de fidelidad de cuantización frente a los pesos originales en BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 135,63 GB | 0,013439 | 95,93% | 0,019299 | 95,65% | 0,012510 | 94,92% |
| Q6_K | 111,43 GB | 0,016179 | 95,49% | 0,020734 | 95,33% | 0,014010 | 94,78% |
| Q5_K_M | 97,54 GB | 0,025086 | 94,19% | 0,025801 | 94,57% | 0,018012 | 93,69% |
| Q4_K_M | 80,39 GB | 0,046521 | 92,14% | 0,038319 | 92,92% | 0,029522 | 92,20% |
| Q4_K_S | 75,64 GB | 0,059339 | 91,05% | 0,046017 | 92,59% | 0,033946 | 91,04% |
| IQ4_XS | 71,11 GB | 0,059487 | 91,06% | 0,048973 | 92,12% | 0,037314 | 91,16% |
| Q3_K_M | 61,50 GB | 0,127627 | 87,21% | 0,085816 | 89,53% | 0,075933 | 87,98% |
| Q2_K | 49,54 GB | 0,315024 | 79,78% | 0,200779 | 83,25% | 0,196657 | 81,55% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del nivel de cuantización. Q8_0 requiere 135,63 GB; Q4_K_M, 80,39 GB; Q2_K, 49,54 GB. El proyector visual F16 añade 874,64 MB.
- GPU recomendadas según la model card:
  - RTX 4090 / RTX 3090 (24 GB): offload de expertos a RAM del sistema, contexto 32K.
  - RTX 5090 (32 GB): offload, contexto 32K.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): offload, contexto 32K.
  - H100 (80 GB): Q3_K_M (61,5 GB), contexto 256K.
  - RTX PRO 6000 Blackwell (96 GB): Q4_K_M (80,4 GB), contexto 256K.
  - H200 (141 GB): Q6_K (111,4 GB), contexto 256K.
  - B200 (192 GB): Q8_0 (135,6 GB), contexto 256K.
  - B300 (288 GB): Q8_0, contexto 256K.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 y RTX 5090 mediante offload de expertos a RAM (`--n-cpu-moe 43`), con contexto de 32K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) con Q5_K_M; Mac Studio M5 Ultra (256 GB y 512 GB) con Q8_0.
- Opciones de despliegue: llama.cpp mediante `llama-server` (requiere build b11156 o superior), con soporte CUDA, Metal y CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación se limita a parámetros y formato:

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air (GGUF, Xylolabs) | 127.486.405.600 | hasta 256K | MIT | GGUF | MoE multimodal, 8 niveles de cuantización |
| Modelos alternativos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de ~127B) en la documentación suministrada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación en la información disponible.
- Sesgos: no se documentan análisis de sesgos en la model card de la versión GGUF.
- Cuantización agresiva: Q2_K presenta una divergencia KL de 0,315024 en WikiText-2 y un acuerdo top-1 del 79,78%, lo que supone una degradación notable frente a Q8_0; para producción se recomienda Q5_K_M o superior.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero debe conservarse el aviso `NOTICE` que identifica el modelo fuente, según indica la model card.
- Requisitos de versión: necesita llama.cpp b11156 o superior; versiones anteriores pueden no cargar correctamente los archivos.
- Contexto reducido con offload: en configuraciones de 24, 32 y 48 GB el contexto práctico se limita a 32K tokens, no a los 256K máximos.
- Los archivos GGUF están divididos en varias partes; debe iniciarse la carga por el primer fragmento.
- No se documentan capacidades de tool calling ni de agentes, por lo que su uso en pipelines de automatización con funciones no está verificado.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Xylolabs/Ling-3.2-air-GGUF
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.2-air
- Repositorio de llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (herramientas de cuantización): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfico de divergencia KL media: https://huggingface.co/Xylolabs/Ling-3.2-air-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfico de acuerdo top-1: https://huggingface.co/Xylolabs/Ling-3.2-air-GGUF/resolve/main/accuracy-top1.png
