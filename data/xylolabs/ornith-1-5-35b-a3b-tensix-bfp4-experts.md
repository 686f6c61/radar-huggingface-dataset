# Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4-Experts

## Resumen

Ornith-1.5-35B-A3B-Tensix-BFP4-Experts es una exportación cuantizada del decodificador de texto principal del modelo Ornith 1.5 35B A3B, publicada por Xylolabs y optimizada para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila de software tt-metal y TT-NN. El modelo base, desarrollado por ornith-ai, es un transformer disperso de tipo mixture-of-experts (MoE) con 34.660.610.688 parámetros totales y 3.000 millones de parámetros activos por token, según indica el sufijo A3B de su denominación.

La contribución de esta exportación es el empaquetado de los pesos en formatos de coma flotante por bloques propios del hardware Tensix: los 80 tensores de expertos enrutados (20.480 matrices de experto) se almacenan en BFP4 con GPTQ y búsqueda de exponente de bloque a 4,5 bits por peso, mientras que 311 matrices de atención, expertos compartidos y cabezas se guardan en BFP8 a 8,5 bits por peso. El resultado son aproximadamente 21,22 GB de pesos del modelo de lenguaje, con una media de 4,897 bits por peso almacenado, lo que reduce de forma sustancial el requisito de memoria frente a los contenedores BF16 de origen.

La relevancia de esta ficha es doble: por un lado, documenta una ruta concreta para desplegar un MoE de 35B en hardware no-GPU; por otro, la model card ofrece una evaluación de degradación por cuantización frente a una referencia BF16 y frente a una cuantización Q4_K_M de llama.cpp, con métricas de divergencia KL. La exportación omite los pesos de visión y de MTP (multi-token prediction) y desactiva el drafting, de modo que se limita a generación de texto causal con un tope de 4.608 tokens entre prompt y generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con decodificador causal de 40 capas; clase `qwen3_5_moe_text` en Transformers |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | 3.000 millones (aproximado, según el sufijo A3B del nombre) |
| Longitud de contexto | 4.608 tokens (prompt + generación, límite impuesto por la configuración de texto de esta exportación) |
| Tipos de cuantización | BFP4 GPTQ con búsqueda de exponente de bloque (4,5 bits/peso) en expertos enrutados; BFP8 round-to-nearest (8,5 bits/peso) en atención, expertos compartidos y cabezas; BF16 en embedding de entrada y 302 tensores no cuantizados |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (con valores de rejilla BF16 en el host), empaquetables a BFP4/BFP8 para TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con arquitectura MoE de 40 capas. La exportación conserva el embedding de entrada y la LM head, e incluye 391 tensores de proyección declarados que cubren 20.791 matrices entre expertos y densas. Los expertos enrutados se agrupan en 80 tensores que contienen 20.480 matrices de experto; el resto de proyecciones declaradas (atención, expertos compartidos y cabezas) suman 311 matrices. El embedding de entrada permanece en BF16, junto con otros 302 tensores almacenados sin cuantizar.

El proceso de cuantización combina GPTQ con búsqueda de exponente de bloque para los expertos enrutados y redondeo al más cercano (RTN) para las proyecciones en BFP8. El fichero `quant4.json` registra la configuración de cada grupo. Xylolabs valida que los 391 tensores de proyección pasan las comprobaciones de rejilla y de empaquetado nativo de TT-NN, incluido el empaquetado como BFP8, y que el ejemplo de referencia se ejecuta en el simulador Blackhole con TT-NN 0.81.1. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas al modelo base en la información proporcionada.

## Capacidades

- Generación de texto causal conversacional en inglés y coreano, con plantilla de chat propia (`apply_chat_template`) y soporte del flag `enable_thinking` para activar o desactivar el modo de razonamiento.
- Razonamiento en modo thinking: la evaluación del autor incluye un conjunto de 7 preguntas de tipo thinking, lo que confirma que el modelo base conserva esta capacidad en la exportación.
- Generación de código y matemáticas: no se documenta de forma explícita en la model card, por lo que no se confirma ni se descarta.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo limitado a inglés y coreano según los metadatos del modelo.
- Sin capacidades de visión ni audio en esta exportación: los pesos de visión y MTP se omiten deliberadamente y el drafting está desactivado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con la infraestructura de Hugging Face Inference Endpoints.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal de esta exportación es ejecutar un MoE de 35B en hardware Tensix (por ejemplo, tarjetas Blackhole) usando TT-NN, aprovechando que los pesos caben en unos 21,22 GB de memoria de dispositivo más KV cache y búferes. Es adecuado porque los tensores ya están empaquetados en los formatos nativos BFP4 y BFP8 que el hardware procesa de forma eficiente.
- Inferencia en servidores con memoria limitada: al promediar 4,897 bits por peso, el modelo ocupa aproximadamente un tercio de lo que requeriría una copia BF16, lo que permite servirlo en nodos con menos DRAM que los necesarios para el modelo original.
- Asistente conversacional en inglés y coreano: con la plantilla de chat nativa y el modo thinking desactivable, puede integrarse en aplicaciones de atención al usuario en ambos idiomas, siempre que las conversaciones no superen el tope de 4.608 tokens entre prompt y respuesta.
- Evaluación comparativa de cuantizaciones: la model card incluye métricas de KL frente a BF16 y Q4_K_M, de modo que el modelo sirve como referencia para estudiar la degradación de BFP4 GPTQ en expertos enrutados frente a otras estrategias de cuantización.
- Prototipado de pipelines de razonamiento: el flag `enable_thinking` permite alternar entre respuestas directas y cadenas de razonamiento, útil para comparar calidad y latencia en tareas que requieren varios pasos.
- Validación de empaquetado en TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad de los tensores contra la fuente indexada, lo que resulta útil en entornos de CI para verificar exportaciones antes de desplegarlas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí una evaluación de fidelidad de la cuantización basada en divergencia KL y en un conjunto de 33 preguntas normales y 7 de tipo thinking.

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas contabilizadas |
|---|---:|---:|---:|---:|
| Referencia BF16 original | 0 | 31 | 7 | — |
| Esta exportación de texto principal | 0,058006 | 31 | 7 | 0 |
| Q4_K_M emparejado | 0,079161 | 31 | 7 | 0 |

La exportación obtiene un KL de 0,732760 veces el de Q4_K_M, dentro del límite de 1,5 veces fijado por la regla de aceptación, con cero pérdidas contabilizadas. El cálculo de KL en host cubre 8.188 posiciones de textos en inglés y coreano, en dos fragmentos de 2.048 tokens. El suelo de BF16 en llama.cpp se sitúa en 0,008877. Las 33 + 7 respuestas usan los identificadores de prompt, paradas y presupuestos originales sin modificar, y cada tensor cargado se verifica contra su fuente indexada en el dtype cargado. El autor no reporta métricas de velocidad ni throughput.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 21,22 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y búferes. En host, la referencia en Transformers requiere más memoria porque los ficheros contienen valores de rejilla en BF16.
- Hardware objetivo: aceleradores Tenstorrent Tensix, con la pila tt-metal y TT-NN (validado con TT-NN 0.81.1 y simulador Blackhole).
- GPU consumer: no se documenta soporte ni requisitos para GPU NVIDIA o AMD en la información proporcionada; el foco es Tensix.
- Memoria del repositorio: 69,3 GB en total, muy superior a los 21,22 GB empaquetados, debido a los contenedores BF16 de origen.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch para la referencia en host; TT-NN para ejecución en Tensix; scripts `pack_tensix.py` y `verify_grid.py` para validación.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Tensix-BFP4-Experts (esta ficha) | 34,66B totales / ~3B activos | 4.608 tokens | BFP4 GPTQ + BFP8 RTN | MIT | Hugging Face, orientado a Tensix |
| Ornith-1.5-35B-A3B (base) | 34,66B totales / ~3B activos | no disponible | BF16 | MIT | Hugging Face |
| Q4_K_M emparejado (referencia de la model card) | 34,66B totales / ~3B activos | no disponible | Q4_K_M (llama.cpp) | no disponible | no disponible |

La comparación con Q4_K_M se limita a las métricas de KL y aciertos reportadas por el autor; no se dispone de datos de contexto, licencia ni disponibilidad de esa cuantización concreta. No se han identificado en la información proporcionada otros modelos de la misma categoría para una comparación adicional.

## Limitaciones y advertencias

- La exportación omite los pesos de visión y de MTP, y desactiva el drafting: no es un reemplazo completo del modelo base para tareas multimodales o de decodificación especulativa.
- El contexto está limitado a 4.608 tokens entre prompt y generación, muy por debajo de lo habitual en modelos de esta categoría; conviene verificar que los presupuestos de thinking estándar caben en ese tope.
- Solo se declaran inglés y coreano como idiomas soportados; el rendimiento en castellano no está documentado.
- La cuantización introduce degradación medible: KL media de 0,058006 frente a 0 en BF16, aunque por debajo de Q4_K_M (0,079161).
- La licencia MIT se hereda del modelo base, pero la model card advierte de que el fichero de licencia enlazado upstream está ausente; el repositorio incluye un `LICENSE` con los términos MIT estándar. Conviene revisar la cadena de licencias antes de un uso comercial.
- El modelo está pensado para Tensix; el uso en GPU requiere la ruta de Transformers en host, con mayor consumo de memoria por los valores de rejilla en BF16.
- No hay datos publicados de sesgos, tasa de alucinación ni robustez; al ser un modelo conversacional, persiste el riesgo habitual de alucinación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creó el 14 de noviembre de 2026, por lo que la validación comunitaria es inexistente.
- No se reportan métricas de latencia ni throughput, lo que dificulta planificar dimensionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tensix-BFP4-Experts/blob/main/LICENSE
