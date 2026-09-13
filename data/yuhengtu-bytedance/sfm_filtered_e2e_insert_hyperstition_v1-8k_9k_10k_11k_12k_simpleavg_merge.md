# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-8k_9k_10k_11k_12k_simpleavg_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-8k_9k_10k_11k_12k_simpleavg_merge` es un checkpoint de 6.856.253.440 parámetros (~6,86 B) publicado por el usuario `yuhengtu-bytedance`, resultado de promediar linealmente cinco checkpoints intermedios de un mismo entrenamiento. No es un modelo entrenado desde cero, sino un "model soup" generado con la herramienta mergekit: se combinan los pasos globales 8000, 9000, 10000, 11000 y 12130 de una misma ejecución de ajuste, todos con peso 1.0 y normalización activada, con salida en bfloat16.

La relevancia de esta ficha es acotada y conviene explicitarla: el repositorio no incluye model card descriptiva, no declara licencia ni idiomas, no publica resultados de benchmarks y acumula cero descargas. La etiqueta `gpt_neox` de HuggingFace indica que la arquitectura subyacente pertenece a la familia GPT-NeoX (transformer decoder-only), y las rutas internas citadas en la configuración de merge (`Pan_Safety_Better_Measurement`) apuntan a checkpoints vinculados a un pipeline de medición de seguridad, aunque esto es una inferencia a partir de nombres de fichero y no un dato confirmado por el autor.

Por tanto, se trata de un artefacto de investigación reproducible más que de un modelo listo para producción. Su interés principal es metodológico: ilustra la técnica de promediado de pesos (linear merge con normalización) aplicada a checkpoints intermedios de un fine-tuning, tal como describe el artículo referenciado en las etiquetas (arXiv:2203.05482, "Model soups").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-NeoX (segun la etiqueta `gpt_neox`; no confirmado en la model card) |
| Parametros totales | 6.856.253.440 (~6,86 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio solo publica pesos en bfloat16; no incluye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), compatibles con `transformers` |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 13,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO. Lo único documentado es el proceso de fusión: mergekit con método `linear`, cinco modelos de entrada (los checkpoints `global_step8000`, `global_step9000`, `global_step10000`, `global_step11000` y el `global_step12130`, que actúa como base), cada uno con `weight: 1.0`, `normalize: true`, `dtype: float32` de entrada y `out_dtype: bfloat16` de salida.

La técnica aplicada es el promediado aritmético de pesos con normalización posterior, una variante del "model soup" descrito en arXiv:2203.05482. El nombre del modelo (`simpleavg`) y la configuración YAML confirman que no hay interpolación por capas ni búsqueda de coeficientes: es una media uniforme. El identificador del experimento (`sfm_filtered_e2e_insert_hyperstition_v1`) y la ruta de los checkpoints de origen (`Pan_Safety_Better_Measurement`) sugieren que los checkpoints promediados provienen de un ajuste orientado a seguridad, pero el autor no aporta ninguna descripción del dataset ni del objetivo de entrenamiento, por lo que no puede afirmarse nada sobre el comportamiento resultante.

## Capacidades

La información disponible solo permite confirmar las capacidades declaradas explícitamente en las etiquetas del repositorio:

- Generación de texto autoregresiva (`pipeline: text-generation`).
- Uso conversacional declarado mediante la etiqueta `conversational`, sin especificación del formato de prompt ni de la plantilla de chat.
- Compatibilidad con `transformers`, `text-generation-inference` y endpoints compatibles (etiqueta `endpoints_compatible`).
- Carga como modelo de fusión (etiquetas `mergekit`, `merge`).

No hay evidencia publicada de las siguientes capacidades, por lo que deben considerarse no disponibles: tool calling o function calling, razonamiento multi-paso o modo agente, capacidades multilingües verificadas, visión, audio, modo "thinking" explícito o cualquier especialización funcional declarada por el autor.

## Casos de uso

Los siguientes escenarios son viables por las características técnicas del artefacto (tamaño, formato y naturaleza de fusión), no porque el autor los respalde:

- Reproducción de experimentos de model merging: el repositorio documenta la configuración YAML exacta y los pasos globales empleados, lo que permite replicar el promediado lineal con mergekit y comparar el efecto de distintos pesos o métodos (SLERP, TIES, DARE) sobre los mismos checkpoints.
- Punto de partida para fine-tuning adicional: con 6,86 B de parámetros en bfloat16 (13,7 GB), es ajustable con SFT o LoRA en una GPU de 24 GB usando cuantización de 8 bits y offload, y sirve como inicialización para dominios concretos.
- Investigación sobre estabilidad de checkpoints intermedios: al fusionar pasos 8000-12130 de un mismo run, permite estudiar si el promediado suaviza la varianza entre checkpoints tardíos y mejora la robustez frente a un único checkpoint final.
- Evaluación comparativa de pipelines de seguridad: dado que los checkpoints de origen se almacenan bajo una ruta de medición de seguridad, el modelo puede emplearse como sujeto de pruebas en baterías de evaluación de alineamiento, siempre que se documente la ausencia de licencia.
- Generación de datos sintéticos para destilación: un modelo de 6,86 B puede producir corpus de texto para entrenar modelos menores, aunque la ausencia de benchmarks obliga a validar la calidad de forma empírica antes de escalar.
- Despliegue self-hosted de generación de texto en hardware de gama alta de consumo: con cuantización a 4 bits (aproximadamente 3,5-4,5 GB de pesos) cabe en GPUs de 8-12 GB mediante llama.cpp u Ollama, tras convertir los pesos a GGUF.
- Estudio académico de artefactos no curados: el caso es un ejemplo útil de repositorio sin model card, sin licencia y sin métricas, para discutir prácticas de publicación en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, métricas de perplejidad, comparaciones con el checkpoint base ni ninguna otra medida cuantitativa. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Peso de los pesos sin cuantizar: 13,7 GB en bfloat16 (coincide con el tamaño del repositorio).
- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB considerando pesos, caché KV y overhead del runtime; 16 GB es el mínimo práctico.
- VRAM estimada en int8: aproximadamente 7-9 GB; en int4: aproximadamente 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bfloat16 sin compromisos; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bfloat16 o fp16.
- Cabe en GPU de consumo: sí. En 24 GB (RTX 4090, 3090) en bfloat16; en 12 GB (RTX 3060, 4070) con cuantización int8; en 8 GB con cuantización int4.
- Opciones de despliegue: `transformers` (soporte nativo por la etiqueta de la librería), Text Generation Inference (etiqueta `text-generation-inference`), vLLM (soporta GPT-NeoX) y, previa conversión a GGUF, llama.cpp y Ollama. No se publican pesos ya convertidos a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La model card no identifica el modelo base, por lo que la comparación se establece con alternativas de tamaño y arquitectura equivalentes. La coincidencia de rango (6-7 B) y la etiqueta `gpt_neox` sitúan al modelo en la misma clase que Pythia-6.9B, aunque no puede confirmarse que derive de ella.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (merge) | 6,86 B | no disponible | GPT-NeoX (etiqueta) | no disponible | HuggingFace, 0 descargas |
| Pythia-6.9B | ~6,9 B | 2048 tokens | GPT-NeoX | Apache 2.0 | HuggingFace, ampliamente usado |
| GPT-J-6B | ~6 B | 2048 tokens | GPT-J (decoder-only) | Apache 2.0 | HuggingFace |
| OPT-6.7B | ~6,7 B | 2048 tokens | Transformer decoder-only | Meta (no comercial en algunas versiones) | HuggingFace |

No se dispone de datos de rendimiento comparado para este modelo, por lo que la columna de benchmarks se omite. Cualquier comparación de calidad con Pythia-6.9B u OPT-6.7B requeriría evaluaciones propias.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial. Debe tratarse como no apto para producción hasta que el autor la especifique.
- Ausencia total de benchmarks: no hay evidencia de calidad, y no puede asumirse que el promediado mejore al checkpoint base.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en cualquier idioma distinto del que se usó en el ajuste original.
- Longitud de contexto desconocida: condiciona directamente los casos de uso multi-turno y de documentos largos, que no pueden planificarse sin este dato.
- Riesgo de alucinación: es un modelo de generación de texto sin mecanismos de verificación; cualquier salida factual debe validarse externamente.
- Riesgo específico de los merges de seguridad: promediar checkpoints de un pipeline de seguridad puede degradar o diluir el comportamiento de rechazo aprendido, dando una falsa sensación de alineamiento. Es un efecto documentado en la literatura de model merging y debe verificarse empíricamente antes de cualquier uso.
- Cero descargas y cero likes: el artefacto no ha sido revisado por terceros; no hay informes de comportamiento en producción.
- Fecha de creación anómala (2026-09-13): conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo automatizado.
- Contenido de la model card mínimo: no hay plantilla de prompt, ni instrucciones de uso, ni descripción del tokenizador, lo que complica la integración correcta.
- Los resultados de la búsqueda web realizada no guardan relación con este modelo (son consultas de prueba sobre sistemas de indexación de documentos), por lo que no aportan información adicional.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-8k_9k_10k_11k_12k_simpleavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método de promediado referenciado en las etiquetas (arXiv:2203.05482, Model soups): https://arxiv.org/abs/2203.05482
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web disponible.
