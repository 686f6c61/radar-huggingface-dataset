# WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_VeRA

## Resumen

`WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_VeRA` es un adaptador PEFT publicado en HuggingFace sobre el modelo base `meta-llama/Llama-3.1-8B`. Por su nombre, el adaptador está orientado a ajuste fino para pregunta-respuesta extractiva sobre el conjunto TyDi QA en inglés y suajili, con un subconjunto de aproximadamente 3.000 ejemplos. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no un modelo completo, y la librería declarada es `peft` con pesos en `safetensors`.

El interés del artefacto es fundamentalmente de investigación: permite reproducir experimentos de ajuste fino parametralmente eficiente (el sufijo del identificador apunta a VeRA, aunque el autor no lo confirma en la model card) sobre una tarea multilingüe de comprensión lectora. El modelo base aporta una ventana de contexto de 128.000 tokens, arquitectura transformer decoder-only con grouped-query attention y licencia comunitaria de Meta, pero ninguna de estas características se documenta explícitamente en el repositorio.

La model card es la plantilla por defecto de HuggingFace sin rellenar: no hay descripción, licencia, idiomas declarados, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Con 8 descargas y 0 likes en el momento de la consulta, se trata de un artefacto sin validación externa, por lo que cualquier uso en producción exigiría una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (modelo base: meta-llama/Llama-3.1-8B). Tipo concreto de adaptador (LoRA, VeRA u otro): no disponible |
| Parametros totales | No disponible para el adaptador. Modelo base: 8.030 millones de parametros (dato del modelo base, no confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. Heredada del modelo base: 128.000 tokens (no confirmado por el autor) |
| Tipos de cuantizacion | No disponible. El autor no publica versiones cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | El identificador menciona ingles y suajili; los metadatos de HuggingFace no declaran idiomas. No disponible como lista oficial |
| Licencia | No disponible (la model card deja el campo vacio) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria / version | peft (framework PEFT 0.17.1 declarado en la model card) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Fecha de creacion / actualizacion | 22 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador de ajuste fino parametralmente eficiente (PEFT) que se carga sobre `meta-llama/Llama-3.1-8B`. La etiqueta `base_model:adapter:meta-llama/Llama-3.1-8B` confirma que se trata de un adaptador y no de un modelo completo, de modo que la arquitectura efectiva en inferencia es la del modelo base (transformer decoder-only con RoPE, grouped-query attention y activaciones SwiGLU), más el módulo de adaptación inyectado en las capas. El identificador incluye el sufijo `VeRA`, lo que sugiere el uso de Vector-based Random Matrix Adaptation, pero el autor no especifica el método en la model card ni publica la configuración del adaptador (rango, alpha, módulos objetivo).

No hay información sobre el procedimiento de entrenamiento: ni número de tokens vistos, ni composición exacta del dataset (más allá de la referencia a TyDi QA en inglés y suajili y a un subconjunto de en torno a 3.000 ejemplos inferido del nombre del repositorio), ni hiperparámetros, ni si hubo una fase de alineación posterior (RLHF, DPO). Tampoco se documentan la precisión de entrenamiento ni el hardware utilizado. La única referencia técnica explícita de la model card es la cita a Lacoste et al. (2019) para el cálculo de emisiones de carbono, que forma parte de la plantilla por defecto y no constituye un detalle del entrenamiento.

## Capacidades

- Generación de texto y comprensión lectora en el marco de tareas de pregunta-respuesta extractiva, presumiblemente en inglés y suajili según el identificador del repositorio.
- Extracción de respuestas como fragmento de un contexto proporcionado (span extraction), el formato típico del conjunto TyDi QA.
- Capacidad multilingüe limitada al par inglés-suajili que sugiere el nombre, sin confirmación documental.
- Herencia de las capacidades generales del modelo base Llama 3.1 8B (generación libre, código, matemáticas básicas, multilingüismo parcial), aunque el ajuste fino sobre QA extractiva puede degradar el comportamiento instructivo si el adaptador no se combinó con datos de instrucciones.
- Soporte de tool calling o function calling: no disponible (no se menciona en la información proporcionada; el modelo base no tiene soporte nativo de herramientas).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Las capacidades declaradas no están verificadas por ninguna evaluación publicada en el repositorio.

## Casos de uso

- Pregunta-respuesta extractiva sobre documentación técnica en inglés: el adaptador puede cargarse sobre Llama 3.1 8B para localizar respuestas literales dentro de pasajes largos, aprovechando la ventana de 128.000 tokens del modelo base para incluir manuales completos en el contexto.
- Atención al cliente en suajili: extracción de respuestas concretas desde bases de conocimiento o FAQ locales para mercados de África Oriental, donde la cobertura de modelos ajustados en suajili es escasa.
- Canalización RAG con extracción de fragmentos: en lugar de generar texto libre, el modelo puede devolver el span exacto del documento recuperado que responde a la consulta, lo que reduce el riesgo de alucinación en comparación con la generación abierta.
- Preetiquetado de corpus de QA en suajili: uso del adaptador para anotar automáticamente conjuntos de datos de comprensión lectora y acelerar el etiquetado humano posterior, dado el bajo coste de inferencia de un modelo de 8B cuantizado.
- Investigación en eficiencia de ajuste fino: el artefacto sirve como punto de comparación reproducible entre métodos PEFT (VeRA frente a LoRA) sobre una misma tarea y un mismo subconjunto de datos, siempre que se documenten las configuraciones.
- Extracción de campos en formularios y documentos administrativos en suajili: localización de valores concretos (fechas, importes, nombres) dentro de textos no estructurados mediante formulación de preguntas.
- Evaluación educativa automatizada: generación de preguntas y verificación de respuestas de comprensión lectora sobre textos escolares en inglés y suajili, con revisión humana obligatoria por la ausencia de métricas publicadas.
- Despliegue en hardware de gama media: al ser un adaptador de 0,1 GB, puede combinarse con el modelo base en cuantización de 4 bits para ejecutarse en una única GPU de consumo, lo que facilita prototipos locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y el repositorio no adjunta métricas de exactitud, F1 ni comparaciones con otros sistemas sobre TyDi QA.

## Requisitos de hardware

- VRAM estimada para el adaptador: menos de 1 GB (repositorio de 0,1 GB), pero requiere cargar el modelo base completo.
- Modelo base en fp16/bf16: aproximadamente 16 GB de pesos más la caché KV, lo que sitúa el consumo práctico por encima de 18-20 GB con contextos largos.
- Modelo base en cuantización de 8 bits: en torno a 9-10 GB de VRAM.
- Modelo base en cuantización de 4 bits: en torno a 5-6 GB de VRAM, con margen para la caché KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp16 con contexto largo; RTX 3090, RTX 4090, RTX 4080 o L4 para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí. En 4 bits funciona en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB); en fp16 requiere 24 GB o más (RTX 3090/4090).
- Opciones de despliegue: `transformers` + `peft` (ruta directa, dado que el adaptador se distribuye en ese formato); vLLM con soporte de adaptadores LoRA (compatibilidad no garantizada si el método es VeRA y no LoRA); TGI con adaptadores PEFT; llama.cpp u Ollama únicamente tras fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento en TyDi QA |
|---|---|---|---|---|---|
| Este adaptador (TyDiQA en+sw, sobre Llama 3.1 8B) | Adaptador sobre 8.030 M (parametros del adaptador no disponibles) | Heredado del base: 128.000 tokens | Adaptador PEFT para QA extractiva | No disponible | No disponible |
| meta-llama/Llama-3.1-8B (base) | 8.030 M | 128.000 tokens | Transformer decoder-only | Llama 3.1 Community License | No disponible (no es un modelo ajustado para QA extractiva) |
| XLM-RoBERTa-large ajustado para TyDi QA | 560 M | 512 tokens | Transformer encoder | MIT | No disponible en la informacion proporcionada |
| mT5 ajustado para TyDi QA | 300 M - 13.000 M segun variante | 512-1.024 tokens | Transformer encoder-decoder | Apache 2.0 | No disponible en la informacion proporcionada |

La comparación se limita a parámetros, contexto, tipo, licencia y disponibilidad, ya que no existen resultados publicados de este adaptador ni métricas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Model card vacía: no se documentan licencia, datos de entrenamiento, hiperparámetros ni uso previsto, lo que impide auditar el artefacto.
- Licencia no declarada en el repositorio del adaptador. El modelo base Llama 3.1 8B se rige por la Llama 3.1 Community License, que impone condiciones de atribución, obligaciones de nomenclatura y restricciones de uso para productos con más de 700 millones de usuarios mensuales; el uso comercial del adaptador queda en una zona jurídica indeterminada.
- Riesgo elevado de alucinación en respuestas a preguntas cuya respuesta no está presente en el contexto, comportamiento típico de los modelos ajustados sobre TyDi QA sin un conjunto de ejemplos sin respuesta.
- Posible degradación del comportamiento conversacional e instructivo del modelo base si el ajuste se realizó exclusivamente sobre datos de QA extractiva.
- Subconjunto de entrenamiento muy reducido (en torno a 3.000 ejemplos según el nombre del repositorio), insuficiente para garantizar una cobertura robusta de la morfología del suajili ni de variedades dialectales.
- Idiomas no declarados oficialmente en los metadatos: el soporte real de suajili es una inferencia basada en el identificador, no una afirmación del autor.
- Sin validación de la comunidad (8 descargas, 0 likes) y sin resultados de benchmarks, por lo que no hay evidencia de que el ajuste mejore al modelo base.
- Método de adaptación incierto (el sufijo `VeRA` no se confirma en la model card): la compatibilidad con herramientas de despliegue que solo soportan LoRA (por ejemplo, ciertas versiones de vLLM) no está garantizada.
- Sesgos del modelo base no evaluados en este artefacto, con especial riesgo de infrarrepresentación de lenguas africanas en los datos de preentrenamiento de Llama 3.1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper citado en la model card (etiqueta `arxiv:1910.09700`), Lacoste et al., 2019, sobre cálculo de emisiones de carbono: https://arxiv.org/abs/1910.09700
- Paper de referencia del conjunto TyDi QA, Clark et al., 2020 (referencia externa al repositorio, incluida por ser el origen del dataset nombrado): https://arxiv.org/abs/2003.05002
- Calculadora de impacto medioambiental enlazada en la model card: https://mlco2.github.io/impact#compute
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las páginas devueltas corresponden a portales de reserva de vuelos (pelikan.sk, skyscanner.sk, wizzair.com, letenky.sk, ryanair.com) y no guardan relación con el artefacto.
