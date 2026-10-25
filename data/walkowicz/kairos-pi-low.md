# Walkowicz/kairos-pi-low

## Resumen

`Walkowicz/kairos-pi-low` es un modelo de decisión (no generativo) publicado por el usuario Walkowicz en Hugging Face, construido como ajuste fino de `answerdotai/ModernBERT-base`. Según las etiquetas del repositorio, se trata de un modelo "system-1" no autorregresivo orientado a sistemas ciberfísicos: automoción, bus CAN, IoT y despliegue en el borde (edge-AI). La inclusión de la etiqueta `active-abstention` sugiere que el modelo está diseñado para emitir una decisión rápida en un único paso forward y, opcionalmente, abstenerse cuando la confianza es insuficiente, derivando el caso a un sistema de mayor capacidad.

El pipeline declarado es `feature-extraction`, aunque las etiquetas describen un modelo de decisión con cabeza propia y código personalizado (`custom_code`), lo que implica que la inferencia requiere `trust_remote_code=True` y los ficheros de modelado incluidos en el repositorio. El modelo se distribuye en `safetensors` y el repositorio declara licencia Apache-2.0 en sus etiquetas, si bien el campo de licencia de la ficha no está poblado.

La relevancia de esta ficha es limitada por la ausencia de documentación: el repositorio no incluye model card descriptiva, no tiene descargas ni interacciones, y no se han publicado resultados de evaluación. Todo lo que sigue se deriva de las etiquetas del repositorio, del pipeline declarado y de las especificaciones públicas del modelo base; cualquier dato no trazable se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de decisión no autorregresiva y lógica de abstención activa; requiere `custom_code` |
| Parametros totales | 149 M (heredados de `answerdotai/ModernBERT-base`); el recuento exacto de la cabeza no está disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens según el modelo base; no confirmado para este ajuste |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`, presumiblemente fp32/fp16) |
| Idiomas soportados | inglés (etiqueta `en` del repositorio); cobertura multilingüe no disponible |
| Licencia | Apache-2.0 según la etiqueta del repositorio; el campo de licencia de la ficha figura como no disponible (discrepancia a verificar antes de uso comercial) |
| Formato de pesos | `safetensors` con código de modelado personalizado (`trust_remote_code` necesario) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de 22 capas, dimensión oculta 768, 12 cabezas de atención y 149 M de parámetros, entrenado sobre del orden de 2 billones de tokens. ModernBERT introduce atención alterna (capas con ventana local de 128 tokens y capas con atención global), RoPE en lugar de embeddings posicionales absolutos, activación GeGLU, atención sin padding (unpadding) y Flash Attention 2, lo que le permite manejar contextos de hasta 8192 tokens con un coste competitivo frente a encoders clásicos como BERT o DeBERTa. Sobre esta base, `kairos-pi-low` añade una cabeza de decisión y, por las etiquetas, algún mecanismo de abstención activa; el diseño concreto de la cabeza, la función de pérdida y el umbral de abstención no están documentados en la información disponible.

El régimen de inferencia declarado es no autorregresivo ("system-1"): una única pasada forward produce la salida, sin decodificación token a token. Esto es coherente con un uso como clasificador o política de decisión de baja latencia en dispositivos de borde. No hay información sobre el dataset de ajuste fino, el número de tokens vistos, la composición de las muestras (señales de bus CAN, series de sensores IoT, texto técnico), ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia más allá de la abstención activa.

## Capacidades

- Extracción de características y embeddings sobre texto técnico en inglés (pipeline declarado: `feature-extraction`).
- Clasificación o decisión en un único paso forward, sin generación de texto: no es un modelo conversacional ni produce explicaciones.
- Abstención activa: por la etiqueta `active-abstention`, se espera que pueda rechazar o derivar entradas fuera de distribución, aunque el comportamiento exacto y la calibración no están documentados.
- Dominio declarado: automoción, tramas de bus CAN, telemetría IoT y sistemas ciberfísicos; no hay evidencia publicada de su rendimiento en estos dominios.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo, por lo que esta capacidad no aplica de forma directa).
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño "system-1" apunta a lo contrario, a decisiones rápidas de un solo paso que podrían usarse como enrutador dentro de un agente mayor.
- Capacidades multilingües: limitadas al inglés según la etiqueta `en`; no se declara soporte de castellano.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Triaje de anomalías en bus CAN en el vehículo: el modelo puede clasificar ventanas de tramas CAN como normales o anómalas en un único forward, lo que encaja con los requisitos de latencia determinista de la electrónica embebida. La abstención permitiría derivar los casos dudosos a la unidad central.
- Mantenimiento predictivo con abstención: a partir de características agregadas de sensores IoT, el modelo decide si una lectura requiere intervención; los casos de baja confianza se envían a un modelo mayor o a revisión humana, reduciendo falsos positivos en campo.
- Enrutador de bajo coste en pipelines de agentes: actuaría como primer filtro ("system-1") que decide si una consulta puede resolverse con una regla o un modelo pequeño, o si debe escalarse a un LLM grande, con el consecuente ahorro de coste por consulta.
- Extracción de embeddings para búsqueda y agrupación de documentación técnica: al heredar el encoder de ModernBERT-base, puede generar representaciones de hasta 8192 tokens para manuales de taller, fichas de componente o logs extensos.
- Clasificación always-on en hardware de borde: con ~149 M de parámetros, el modelo es candidato para CPU/NPU de pasarelas IoT donde no cabe un LLM, siempre que se valide su calibración en el dominio concreto.
- Aprendizaje activo y anotación asistida: la abstención activa es útil para seleccionar qué muestras etiquetar a continuación, enviando a revisión humana solo los casos ambiguos.
- Filtro previo en sistemas de seguridad ciberfísica: como etapa de descarte de alta velocidad antes de un controlador más costoso, sin que la decisión final dependa únicamente de este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de métricas específicas del dominio (exactitud de clasificación, AUC, tasa de abstención, calibración ECE) en el repositorio ni en fuentes externas localizadas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 149 M de parámetros, no medida sobre este modelo): ~600 MB en fp32, ~300 MB en fp16/bf16, ~150 MB en int8 y ~75-80 MB en int4, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; H100/A100 no aportan ventaja relevante por el reducido tamaño del modelo. El caso de uso natural es CPU o aceleradores de borde (NPU integrada, Jetson, Coral, MCU de gama alta con soporte de transformers).
- Cabe en GPU consumer: sí, en cualquier RTX (incluso serie GTX/RTX de gama baja) y en iGPU con memoria compartida; también en dispositivos móviles previa conversión.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; exportación a ONNX Runtime u OpenVINO para borde; `llama.cpp`/Ollama no aplican al no ser un modelo generativo GGUF; vLLM y TGI están pensados para generación autorregresiva y no son la vía natural, aunque soportan tareas de embedding/clasificación con configuración adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones; cualquier cifra sería especulativa dada la ausencia de detalles sobre la cabeza y el preprocesado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `Walkowicz/kairos-pi-low` | 149 M (base) | 8192 (según base) | Decisión / clasificación con abstención | Apache-2.0 (según etiqueta) | no disponible |
| `answerdotai/ModernBERT-base` | 149 M | 8192 | Encoder generalista (MLM, embeddings) | Apache-2.0 | Métricas publicadas por el autor del modelo base |
| `microsoft/deberta-v3-base` | ~86 M backbone / ~184 M total | 512 | Encoder generalista | MIT | Referencia habitual en clasificación; cifras no comparables aquí |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | 256 | Embeddings de frases | Apache-2.0 | Muy extendido en búsqueda semántica de bajo coste |

La comparación directa no es posible: no hay métricas publicadas de `kairos-pi-low` frente a alternativas, y su valor diferencial (abstención activa y orientación a sistemas ciberfísicos) no está cuantificado en ningún artefacto accesible.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros, umbrales de abstención ni metodología de evaluación, lo que impide auditar el modelo.
- Sin validación externa: 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de uso en producción ni informes de terceros.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisiones erróneas con confianza alta (falsos positivos) si la calibración no se ha verificado en el dominio objetivo.
- Idiomas: solo inglés declarado; el rendimiento en castellano es desconocido y probablemente deficiente.
- Dominio estrecho: las etiquetas apuntan a automoción, CAN e IoT; su comportamiento fuera de esos dominios no está caracterizado.
- Licencia: la etiqueta indica Apache-2.0, pero el campo de licencia de la ficha no está poblado; conviene confirmar los términos antes de un uso comercial. Apache-2.0 permitiría uso comercial con atribución, pero esta lectura se basa únicamente en la etiqueta.
- `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del autor del repositorio; debe revisarse el código antes de desplegarlo en entornos sensibles.
- Fecha de creación inusual (2026-10-24) en los metadatos del repositorio; conviene verificar la vigencia y procedencia del artefacto.
- En sistemas ciberfísicos o de automoción, un modelo sin certificación ni evaluación funcional no debe utilizarse en lazos de seguridad (ISO 26262 / IEC 61508); como mucho, como componente auxiliar no crítico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Walkowicz/kairos-pi-low
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (referencia del modelo base): https://arxiv.org/abs/2412.13663
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos específicos de `kairos-pi-low`.
