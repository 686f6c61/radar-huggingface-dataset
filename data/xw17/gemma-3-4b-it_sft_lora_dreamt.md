# xw17/gemma-3-4b-it_SFT_lora_dreamt

## Resumen

El repositorio `xw17/gemma-3-4b-it_SFT_lora_dreamt` es un modelo publicado en Hugging Face por el usuario `xw17` el 2 de octubre de 2026. Por el identificador y por el tamaño del repositorio (0,1 GB), todo apunta a un adaptador LoRA resultante de un processo de ajuste supervisado (SFT) sobre el modelo base `google/gemma-3-4b-it`, aunque la model card no lo confirma en ningún punto: se trata de la plantilla automática de Hugging Face con todos los campos marcados como `[More Information Needed]`.

El repositorio no aporta información sobre arquitectura, datos de entrenamiento, hiperparámetros, idiomas, licencia ni resultados de evaluación. Los únicos metadatos disponibles son técnicos: librería `transformers`, formatos `safetensors`, compatibilidad con `endpoints_compatible` y la etiqueta `arxiv:1910.09700`, que corresponde al artículo del calculador de impacto de carbono (Lacoste et al., 2019) y no a un paper del propio modelo.

Su relevancia actual es limitada: acumula 0 descargas y 0 «likes», carece de documentación y no declara licencia, lo que impide recomendar su uso en producción sin una verificación previa del contenido del repositorio y de los términos aplicables al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere un transformer decoder-only de la familia Gemma 3, no confirmado en la model card) |
| Parámetros totales | no disponible (el repositorio contiene únicamente pesos de adaptador; si el adaptador se fusiona sobre Gemma 3 4B IT, el modelo resultante tendría del orden de 4.000 millones de parámetros) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible en el repositorio (Gemma 3 4B IT declara 128.000 tokens, dato del modelo base no verificado aquí) |
| Tipos de cuantización | no disponible; solo se publican pesos en `safetensors`, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Gemma 3 está sujeto a los Gemma Terms of Use, pero este repositorio no declara licencia propia) |
| Formato de pesos | `safetensors` (probablemente adaptador LoRA, no pesos completos) |

## Arquitectura y entrenamiento

No hay información publicada. La model card es la plantilla genérica autogenerada por Hugging Face y no describe la arquitectura, el objetivo de entrenamiento, el dataset, el número de tokens, la composición de los datos ni si hubo fases de RLHF, DPO o similares. Tampoco se documentan hiperparámetros (tasa de aprendizaje, rango y alpha del LoRA, precisión mixta, número de épocas) ni el procedimiento de preprocesado.

La única inferencia razonable, y hay que tratarla como tal, se deriva de tres indicios: el nombre del repositorio (`gemma-3-4b-it` + `SFT_lora`), el tamaño del repo (0,1 GB, muy inferior a los ~8 GB que ocuparían los pesos completos de un modelo de 4.000 millones de parámetros en bf16) y la etiqueta `safetensors`. En conjunto sugieren un adaptador LoRA obtenido mediante ajuste supervisado sobre Gemma 3 4B IT. No hay ninguna innovación técnica documentada (ni decodificación especulativa, ni atención lineal, ni variantes híbridas).

## Capacidades

No hay ninguna capacidad documentada en la información disponible. Las siguientes son capacidades presumibles del modelo base si se confirma la hipótesis del ajuste sobre Gemma 3 4B IT, y deben verificarse empíricamente antes de cualquier uso:

- Generación de texto conversacional multi-turno, presumiblemente heredada de Gemma 3 4B IT.
- Razonamiento básico, matemáticas elementales y generación de código, sin datos de evaluación que lo respalden en este repositorio.
- Capacidad multilingüe: no disponible; el repositorio no declara idiomas soportados.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales: no disponible (Gemma 3 incorpora visión en varias de sus variantes, pero no se puede confirmar para este adaptador).
- Modo de razonamiento extendido (*thinking*): no disponible.

## Casos de uso

Antes de plantear cualquier aplicación conviene tener en cuenta que ni el entrenamiento, ni la licencia, ni las capacidades de este adaptador están documentados; los escenarios siguientes son hipotéticos y exigen una validación previa.

- Experimentación académica con LoRA: el repositorio ocupa 0,1 GB, por lo que puede descargarse y cargarse rápidamente junto al modelo base para reproducir o auditar el ajuste. Es adecuado para estudiar cómo se comporta un SFT ligero sobre Gemma 3 4B, siempre que se resuelva antes la licencia del modelo base.
- *Prototipado* rápido de asistentes conversacionales: un adaptador sobre un modelo de 4B cabe en GPUs de consumo y permite iterar en local sobre respuestas de chat sin coste de API, aunque la calidad real no está medida.
- Comparación de estrategias de ajuste: sirve como punto de referencia frente a otros adaptadores sobre el mismo base para evaluar si un SFT concreto mejora o degrada tareas como resumen o reescritura.
- *Fine-tuning* adicional sobre dominio propio: si el adaptador funciona, puede actuar como punto de partida para un ajuste posterior con datos específicos de un sector, reduciendo el coste frente a partir del modelo base.
- Generación de código en herramientas internas: solo si se valida previamente que conserva la capacidad de código del base; en ningún caso debería integrarse en un pipeline de CI/CD sin pruebas de regresión.
- Docencia y formación: resulta útil como ejemplo práctico de publicación de un adaptador LoRA en el Hub, incluyendo los problemas derivados de una model card vacía y de la ausencia de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada, no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, y el repositorio no enlaza a ningún informe técnico.

## Requisitos de hardware

Las cifras siguientes se derivan del supuesto de un adaptador LoRA sobre un modelo de aproximadamente 4.000 millones de parámetros y son estimaciones, no datos medidos.

- Peso del adaptador: 0,1 GB según el tamaño del repositorio; el modelo base debe descargarse aparte.
- VRAM en bf16/fp16: del orden de 8-9 GB solo para los pesos, más la caché KV (aproximadamente 1-2 GB adicionales con 8.000 tokens de contexto); en la práctica, 10-12 GB para un uso cómodo.
- VRAM en int8: en torno a 5 GB de pesos.
- VRAM en cuantización Q4_K_M (GGUF): en torno a 2,5-3 GB de pesos.
- GPUs de consumo: cabe en RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB en bf16, y en RTX 3080 de 10 GB con cuantización de 4 bits. Una RTX 4090 permite contextos largos sin problemas de memoria.
- GPUs de datacenter: A100, H100 y L40S son holgadas para este tamaño y permiten *batching* alto.
- Despliegue: `transformers` con PEFT para cargar el adaptador; vLLM admite adaptadores LoRA en línea; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF; TGI es otra opción para servir el modelo fusionado.
- Latencia y *throughput*: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y se incluyen como referencia orientativa, no verificados en esta ficha; los de este repositorio figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| `xw17/gemma-3-4b-it_SFT_lora_dreamt` | adaptador sobre ~4B (no confirmado) | no disponible | no disponible | 0 descargas, 0 likes | no publicados |
| `google/gemma-3-4b-it` (base hipotético) | ~4B | 128.000 tokens según su ficha | Gemma Terms of Use | ampliamente disponible | publicados por Google |
| `Qwen/Qwen2.5-3B-Instruct` | ~3,1B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | ampliamente disponible | publicados por Alibaba |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3,2B | 128.000 tokens | Llama 3.2 Community License | requiere aceptación de términos | publicados por Meta |

La diferencia principal frente a las alternativas no es de rendimiento, sino de trazabilidad: los tres modelos de referencia cuentan con licencia explícita, documentación de entrenamiento y evaluaciones publicadas, mientras que este repositorio no ofrece nada de ello.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada, sin sección de uso previsto, sesgos, datos de entrenamiento ni evaluación.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, y además el modelo base Gemma 3 impone sus propios Gemma Terms of Use, que incluyen obligaciones de atribución y restricciones de uso.
- Riesgo de alucinación: no evaluado; no hay ningún dato sobre fiabilidad factual ni sobre tasas de error.
- Sesgos: no documentados. Al no conocerse la composición del dataset de ajuste, no puede descartarse la amplificación de sesgos presentes en el modelo base.
- Idiomas: no declarados; se desconoce el comportamiento fuera del inglés y de los idiomas cubiertos por el base.
- Contexto: no verificado para el adaptador; un SFT agresivo puede degradar el manejo de ventanas largas incluso si el base las soporta.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de terceros.
- Riesgo de sobreajuste: los ajustes SFT con LoRA sobre datasets pequeños tienden a degradar capacidades generales; sin datos de entrenamiento no puede evaluarse este riesgo.
- Contenido del repositorio sin verificar: no se ha confirmado que los pesos sean un adaptador LoRA, ni que el modelo base sea realmente Gemma 3 4B IT.
- Fecha de publicación anómala (octubre de 2026) respecto a la ventana temporal habitual de estos repositorios; conviene contrastarla con la fecha real de subida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xw17/gemma-3-4b-it_SFT_lora_dreamt
- Modelo base presumible, Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Referencia citada en las etiquetas del repositorio, Lacoste et al. (2019), «Quantifying the Carbon Emissions of Machine Learning»: https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la información disponible.
