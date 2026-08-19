# trentzap/qtensor-tinyllama-hybrid-v2

## Resumen

El modelo `trentzap/qtensor-tinyllama-hybrid-v2` es una versión altamente comprimida de TinyLlama-1.1B-Chat-v1.0, desarrollada por el usuario trentzap bajo el framework QTensor Asymmetric 2.0. Su objetivo es reducir drásticamente el consumo de VRAM mediante una compresión híbrida que aplica topologías matemáticas distintas a diferentes componentes de la arquitectura: atención comprimida con Block-SVD, MLP con INT4 canal-wise, y un puente de subespacio de rango 1 para armonizar las diferencias de varianza entre ambas vías. El resultado es un modelo de 735 millones de parámetros (en formato safetensors) que ocupa aproximadamente 1,16 GB en VRAM, manteniendo un rendimiento zero-shot aceptable para su tamaño.

La relevancia de este modelo radica en su enfoque de compresión asimétrica, que podría permitir ejecutar modelos de lenguaje en hardware con recursos muy limitados sin recurrir a cuantizaciones uniformes que degradan uniformemente todas las capas. Aunque no se han publicado resultados comparativos extensos, los datos proporcionados (HellaSwag 38,0 % y perplejidad en WikiText-2 de 168,46) indican que la compresión mantiene cierta fluidez, aunque con limitaciones evidentes en tareas de modelado de lenguaje.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y modificación. Sin embargo, al ser una compresión de un modelo ya existente, su comportamiento y capacidades dependen en gran medida de las del TinyLlama original, del cual no se detallan aquí los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en TinyLlama (LLaMA), con compresión asimétrica: Block-SVD (r=16) + SpLoRA en atención, Channel-Wise INT4 + LoRA en MLP, y Subspace Bridge de rango 1 |
| Parametros totales | 735.386.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (canal-wise), 8-bit (referenciado en tags), Block-SVD, SpLoRA |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según tags y tamaño del repo) |

## Arquitectura y entrenamiento

La arquitectura es una variante comprimida de TinyLlama-1.1B-Chat-v1.0, que a su vez sigue el diseño de LLaMA (transformer decoder-only). La compresión se realiza de forma asimétrica: las capas de atención se comprimen mediante descomposición en valores singulares por bloques (Block-SVD) con rango r=16, complementada con un 3,0 % de SpLoRA (probablemente una variante de LoRA estructurada). Las capas MLP se comprimen con cuantización INT4 por canal, más LoRA. Para reconciliar las diferencias de escala y varianza entre los flujos residuales de ambas vías, se introduce un puente de subespacio de rango 1 (`subspace_bridge`).

No se proporciona información sobre el proceso de entrenamiento: no se indican los datos utilizados, el número de tokens, ni si se aplicó fine-tuning posterior a la compresión. La model card solo menciona que se mantiene el rendimiento zero-shot y la fluidez, pero no detalla la metodología de entrenamiento o calibración.

## Capacidades

- Generación de texto y chat: al ser una compresión de TinyLlama-Chat, hereda la capacidad de mantener conversaciones y generar texto coherente, aunque con una perplejidad alta (168,46 en WikiText-2) que sugiere una fluidez limitada.
- Razonamiento básico: el resultado de HellaSwag (38,0 %) indica que el modelo puede completar frases con sentido común en cierta medida, aunque muy por debajo de modelos más grandes.
- Compresión eficiente: su principal capacidad es ejecutarse con una huella de VRAM de ~1,16 GB, lo que lo hace apto para entornos con memoria limitada.
- No se especifican capacidades como tool calling, agentes, visión o audio. Tampoco se indica soporte multilingüe explícito.

## Casos de uso

- Prototipado en entornos con recursos limitados: gracias a su baja huella de VRAM, puede emplearse para pruebas rápidas de generación de texto en portátiles o GPUs de gama baja (por ejemplo, 2 GB de VRAM) sin necesidad de infraestructura en la nube.
- Edge computing: su tamaño reducido permite desplegarlo en dispositivos periféricos (Raspberry Pi con acelerador, teléfonos móviles de gama media) para tareas de autocompletado o chatbots básicos.
- Investigación en compresión de modelos: sirve como caso de estudio para evaluar el impacto de la compresión asimétrica en el rendimiento, comparando con cuantizaciones uniformes.
- Generación de texto offline: puede integrarse en aplicaciones que requieran generación de contenido sin conexión, como asistentes de escritura en local.
- Fine-tuning ligero: al ser un modelo pequeño, es factible ajustarlo en una sola GPU para tareas específicas (por ejemplo, clasificación de texto) con pocos datos.
- Educación y demostraciones: útil para enseñar conceptos de compresión de modelos y despliegue eficiente, dado su tamaño manejable y licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| HellaSwag (zero-shot) | 38,0 % |
| WikiText-2 (perplejidad zero-shot) | 168,46 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores deben interpretarse con cautela, ya que una perplejidad de 168,46 es muy alta en comparación con modelos de tamaño similar sin comprimir (por ejemplo, TinyLlama original suele obtener perplejidades mucho menores), lo que sugiere una degradación notable en modelado de lenguaje.

## Requisitos de hardware

- VRAM estimada: ~1,16 GB, por lo que es viable en GPUs con al menos 2 GB de memoria (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida).
- GPU recomendadas: cualquier GPU moderna con soporte para bfloat16 y al menos 2 GB de VRAM. No se requieren GPUs de alta gama como A100 o H100.
- Opciones de despliegue: el código de ejemplo usa `transformers` con `trust_remote_code=True`, por lo que puede ejecutarse en frameworks como Hugging Face Transformers. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser safetensors podría convertirse.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño reducido, se espera una latencia baja en hardware moderno, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Para contextualizar, se podría comparar con TinyLlama-1.1B-Chat-v1.0 (el modelo original) o con otras compresiones de modelos pequeños, pero no se han aportado datos de estos.

## Limitaciones y advertencias

- La perplejidad en WikiText-2 es muy alta (168,46), lo que indica una calidad de generación de texto limitada y posible falta de coherencia en tareas complejas.
- No se especifican los idiomas soportados; se asume que hereda los del modelo original, pero no está confirmado.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo pequeño comprimido, es probable que presente alucinaciones frecuentes y razonamiento poco fiable.
- La licencia Apache 2.0 permite uso comercial, pero se debe tener en cuenta que el modelo deriva de TinyLlama, que también es Apache 2.0.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; se recomienda auditar ese código antes de usarlo en producción.
- No hay garantías de soporte o mantenimiento; el autor no ha publicado documentación adicional más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trentzap/qtensor-tinyllama-hybrid-v2
- No se proporcionan otros enlaces (papers, repos, demos) en la información disponible.
