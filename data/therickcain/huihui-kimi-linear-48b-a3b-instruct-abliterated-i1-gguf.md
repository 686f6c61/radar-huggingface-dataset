# therickcain/Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated-i1-GGUF

## Resumen

Esta ficha corresponde a un repositorio GGUF cuantizado (con imatrix, cuantizaciones ponderadas) del modelo Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated, publicado por el usuario therickcain y cuantizado por mradermacher. El modelo base es una versión "abliterated" (con los mecanismos de rechazo de seguridad eliminados) del Kimi-Linear-48B-A3B-Instruct de Moonshot AI, adaptada por Huihui-ai. Se trata de un modelo de instrucciones conversacional de gran tamaño, con unos 49.100 millones de parámetros totales, del que el sufijo "A3B" indica que aproximadamente 3.000 millones de parámetros están activos por token, lo que sugiere una arquitectura de mezcla de expertos (MoE) o similar con activación dispersa.

La relevancia de esta variante radica en la combinación de tres factores: la arquitectura lineal del modelo base Kimi-Linear (que permite contextos muy largos con coste computacional reducido), la activación dispersa de ~3B parámetros (que hace viable la inferencia en hardware de consumo con cuantización), y la eliminación de los filtros de seguridad, algo demandado en nichos concretos de investigación y uso local. El repositorio ofrece más de veinte variantes de cuantización, desde IQ1_S (10,2 GB) hasta Q8 y superiores, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (Kimi-Linear), presumiblemente MoE por la nomenclatura A3B |
| Parámetros totales | 49.122.681.728 (~49,1B) |
| Parámetros activos | ~3B (inferido de la nomenclatura "A3B"; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, Q8 (todas con imatrix) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, Kimi-Linear-48B-A3B-Instruct, pertenece a la familia Kimi-Linear de Moonshot AI, caracterizada por el uso de mecanismos de atención lineal (o híbridos con componentes lineales) en lugar de la atención softmax tradicional. Esta aproximación reduce la complejidad computacional respecto a la longitud de secuencia, lo que teóricamente permite manejar contextos muy largos de forma eficiente. La nomenclatura "48B-A3B" indica un diseño con ~49B parámetros totales y ~3B activos por token, un patrón típico de arquitecturas MoE (mixture of experts) con enrutado disperso.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO) y sobre el proceso de "abliteration" aplicado por Huihui-ai, no se ha proporcionado información en la model card. La abliteración es una técnica post-entrenamiento que modifica direcciones de activación responsables de los rechazos de seguridad, sin reentrenar el modelo, por lo que las capacidades lingüísticas del modelo base se preservan en gran medida.

## Capacidades

- Generación de texto conversacional siguiendo instrucciones (pipeline conversational).
- Razonamiento general y redacción, heredados del modelo base Kimi-Linear-48B-A3B-Instruct.
- Ejecución local eficiente gracias a la activación dispersa (~3B parámetros activos) y a las cuantizaciones GGUF con imatrix.
- Contexto potencialmente muy largo por la arquitectura lineal (longitud exacta no disponible en la información proporcionada).
- Sin filtros de seguridad ("abliterated"/"uncensored"): responde a peticiones que el modelo original rechazaría.
- No hay información disponible sobre soporte de tool calling, function calling, capacidades multimodales (visión o audio) ni modos de pensamiento extendido.

## Casos de uso

- Chatbots locales sin restricciones de contenido: para usuarios que ejecutan asistentes personales en su propia infraestructura con Ollama o llama.cpp y necesitan respuestas sin los rechazos del modelo original.
- Investigación en alineación y seguridad: la versión abliterated permite estudiar comparativamente el comportamiento de un modelo con y sin mecanismos de rechazo, útil en auditoría de seguridad de LLMs.
- Procesamiento de documentos extensos: si la arquitectura lineal del modelo base ofrece contexto largo, resulta adecuado para resumir o analizar documentos de gran tamaño con coste computacional contenido.
- Asistentes de escritura creativa: la ausencia de filtros facilita la generación de ficción con contenido maduro o temáticas que otros modelos bloquean.
- Despliegue en estaciones de trabajo con VRAM limitada: con la cuantización i1-Q4_K_M (29,8 GB) cabe en GPUs de 32 GB, y con IQ3/IQ2 en GPUs de 16-24 GB, manteniendo la calidad razonable gracias a la activación de solo ~3B parámetros.
- Experimentación con arquitecturas de atención lineal: los desarrolladores que evalúan alternativas a la atención softmax pueden probar este modelo con llama.cpp si hay soporte implementado para la arquitectura Kimi-Linear.
- Generación de código y automatización local: puede integrarse en herramientas de asistencia a la programación que ejecuten el modelo en local, aunque no hay datos publicados sobre su rendimiento en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos comparativos sobre la degradación de calidad por nivel de cuantización más allá de las notas cualitativas del cuantizador (por ejemplo, "IQ3_S beats Q3_K*", "Q4_K_S: optimal size/speed/quality", "Q4_K_M: fast, recommended").

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de cuantizaciones del repositorio):
  - IQ1_S (10,2 GB) o IQ1_M (11,3 GB): caben en GPUs de 12 GB, con calidad muy degradada ("for the desperate").
  - IQ2_XXS a IQ2_M (13,1-16,2 GB): GPUs de 16 GB, calidad baja.
  - IQ3_XXS a Q3_K_L (19,1-25,6 GB): GPUs de 24 GB como RTX 3090/4090.
  - IQ4_XS (26,4 GB) y Q4_K_M (29,8 GB): GPUs de 32 GB (RTX 5090, RTX 4090 con offload parcial, A100 de 40 GB con holgura).
  - Cuantizaciones Q5/Q6/Q8: requieren 32-56 GB, recomendables en A100 40/80 GB, H100 o configuraciones multi-GPU/Mac con memoria unificada.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones IQ3; RTX 5090 o A100 40 GB para Q4_K_M; H100 o Mac Studio con 64 GB+ de memoria unificada para cuantizaciones altas.
- En consumer GPU: sí, desde 12 GB con IQ1/IQ2 (calidad muy reducida) y de forma recomendable desde 24 GB con IQ3_S/IQ3_M.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte en vLLM o TGI para esta variante GGUF (el modelo base en safetensors podría requerir soporte específico de la arquitectura Kimi-Linear).
- Latencia y throughput: no disponibles; dado que solo ~3B parámetros están activos por token, se espera una generación rápida en hardware adecuado, comparable a modelos densos de 3-7B, aunque la atención lineal sobre contextos largos puede comportarse mejor que la atención estándar.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated (este) | ~49,1B | ~3B | no disponible | MIT | GGUF (imatrix) |
| Kimi-Linear-48B-A3B-Instruct (base, Moonshot AI) | ~48B | ~3B | no disponible | no disponible en la información proporcionada | safetensors |
| Qwen3-30B-A3B-Instruct | ~30B | ~3B | 32K-128K | Apache 2.0 | safetensors, GGUF |
| Mixtral-8x7B-Instruct | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |

La ventaja de este modelo frente a alternativas de tamaño similar es el bajo número de parámetros activos (~3B frente a ~13B de Mixtral), lo que reduce drásticamente los requisitos de cómputo por token. Frente a Qwen3-30B-A3B, ofrece el filtro de seguridad eliminado y una arquitectura de atención lineal, pero con menos documentación pública y soporte de ecosistema. Los datos de benchmarks de los competidores no se incluyen porque no constan en la información proporcionada para este modelo.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado deliberadamente los mecanismos de rechazo de seguridad. Esto implica riesgo elevado de generar contenido dañino, ilegal o inapropiado, y lo hace inadecuado para entornos de producción orientados a usuarios finales sin salvaguardas adicionales externas.
- La abliteración puede degradar sutilmente la calidad general y la capacidad de seguimiento de instrucciones respecto al modelo base, algo no cuantificado en la información disponible.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos publicados que cuantifiquen este comportamiento en esta variante.
- Idioma: la model card indica solo inglés ("en"); el rendimiento en castellano no está documentado y puede ser inferior al del inglés.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_*): el propio cuantizador advierte de calidad muy baja; no recomendables para uso serio.
- La licencia MIT es permisiva y permite uso comercial, pero los términos aplicables al modelo base de Moonshot AI (y cualquier restricción heredada) no constan en la información proporcionada y deberían verificarse.
- El soporte de la arquitectura Kimi-Linear en runtimes GGUF (llama.cpp y derivados) puede ser reciente o parcial; conviene verificar la compatibilidad con la versión instalada antes de desplegar.
- Longitud de contexto exacta no disponible; no se puede garantizar el comportamiento en ventanas largas sin pruebas propias.

## Enlaces

- Repositorio de esta cuantización GGUF: https://huggingface.co/therickcain/Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated-i1-GGUF
- Modelo base abliterated (Huihui-ai): https://huggingface.co/huihui-ai/Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated
- Cuantizaciones estáticas de mradermacher: https://huggingface.co/mradermacher/Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Huihui-Kimi-Linear-48B-A3B-Instruct-abliterated-i1-GGUF
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
