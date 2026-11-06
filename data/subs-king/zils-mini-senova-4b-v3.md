# subs-king/zils-mini-senova-4b-v3

## Resumen

Zils d3-mini soup body: Senova-4B v3 es un reempaquetado del modelo WangSenQWQ/Senova-4B-v3, publicado por el usuario subs-king en Hugging Face. No se trata de un modelo nuevo ni de un fine-tuning: los pesos de lenguaje son los del modelo original, sin cambios, y la intervención del autor se limita a reorganizar nombres de tensores y el layout de los shards para adaptarlos al formato que exige el subnet Zils (Bittensor SN127), pool d3-mini. El repositorio se etiqueta como "soup-body" y "decision-model", lo que sugiere su uso como cuerpo base dentro de un pipeline de decisión de esa subred.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) almacenados en safetensors, con un tamaño de repositorio de 9,1 GB, lo que es coherente con pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, heredada del modelo original, y el autor indica que los ficheros de licencia originales se incluyen cuando la fuente los tenía.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación de capacidades: no hay model card técnica del modelo base en la información proporcionada, no se publican benchmarks, no se detallan idiomas ni arquitectura interna, y el repositorio no registra descargas ni interacciones. Su interés principal es operativo: sirve como referencia de cómo se empaquetan pesos para el subnet Zils y como punto de partida para quien necesite el modelo Senova-4B-v3 en ese formato concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base WangSenQWQ/Senova-4B-v3; sin detalles en la informacion proporcionada) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; cuantizaciones posteriores no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards reempaquetados; sin tensores `lm_head` ni `mtp`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base WangSenQWQ/Senova-4B-v3 en los datos proporcionados: no se especifica si es un transformer denso, un MoE, un modelo híbrido ni qué tipo de atención utiliza. El recuento de parámetros (4,54 mil millones) y el tamaño del repositorio (9,1 GB) son compatibles con un transformer de aproximadamente 4B en precisión de 16 bits, pero esto es una inferencia a partir de los metadatos, no un dato confirmado por el autor.

Respecto al entrenamiento, no hay información sobre volumen de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. Lo único documentado es la intervención de reempaquetado: el autor de esta ficha cambia nombres de tensores y el layout de shards para adaptarlos al "body layout" de Zils, y excluye los tensores `lm_head` y `mtp`. Esta exclusión es relevante: sin `lm_head`, el checkpoint no es directamente utilizable para generación de texto estándar con un pipeline de Hugging Face, sino que está pensado para integrarse en el framework del subnet, que presumiblemente aporta su propia cabeza de salida o su propio mecanismo de decisión.

## Capacidades

- No se documentan capacidades específicas del modelo en la información proporcionada.
- No hay confirmación de soporte de tool calling ni function calling.
- No hay confirmación de capacidades de agente o razonamiento multi-paso.
- No hay confirmación de capacidades multilingües ni de idiomas cubiertos.
- No hay confirmación de modo "thinking", visión, audio ni otras modalidades.
- El etiquetado "decision-model" sugiere un uso previsto como componente de decisión dentro del subnet Zils, pero no se detalla qué tipo de decisiones ni con qué interfaz.
- La ausencia de `lm_head` en el checkpoint implica que la generación de texto directa no está garantizada sin añadir una cabeza de salida compatible.

## Casos de uso

- Integración como cuerpo base en el subnet Zils (Bittensor SN127), pool d3-mini: el repositorio está empaquetado específicamente para este propósito, con nombres de tensores y shards adaptados al layout del subnet. Es el caso de uso primario y el único documentado explícitamente por el autor.
- Punto de partida para experimentación con el modelo Senova-4B-v3 en entornos que requieran el formato Zils: permite cargar los pesos sin tener que reempaquetar manualmente el checkpoint original.
- Evaluación comparativa de cuerpos de modelo dentro de la subred: al mantener los pesos originales sin cambios, sirve como referencia para medir el efecto del empaquetado frente a otras variantes del mismo modelo base.
- Reproducibilidad de pipelines de decisión en Bittensor: al fijar la revisión del modelo base (`0a23e33503e8bbdc0d88676aac7444c6070977c0`), facilita la replicación de experimentos en la subred.
- Estudio de formatos de distribución de pesos: el repositorio documenta explícitamente qué se modifica (nombres y shards) y qué se excluye (`lm_head`, `mtp`), lo que lo convierte en un ejemplo útil para quien diseñe conversores de checkpoints.
- Fine-tuning posterior sobre el modelo base: aunque el checkpoint no incluya `lm_head`, los pesos del cuerpo pueden servir de inicialización para tareas de ajuste una vez se añada una cabeza de salida adecuada, siempre que la arquitectura del base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del recuento de parámetros (4,54B), en fp16 serían necesarios aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría caber en GPUs de consumo con 12-16 GB o más en fp16, y en GPUs de 8 GB con cuantización agresiva, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: probable por tamaño, no confirmada.
- Opciones de despliegue: no disponible. La ausencia de `lm_head` en el checkpoint condiciona el despliegue con vLLM, llama.cpp, Ollama o TGI, que esperan un checkpoint completo con cabeza de salida; sería necesario reconstruirla o usar el checkpoint original de Senova-4B-v3.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zils d3-mini soup body: Senova-4B v3 (este) | 4,54B | no disponible | Apache 2.0 | safetensors (sin `lm_head`) | Reempaquetado para subnet Zils SN127 |
| WangSenQWQ/Senova-4B-v3 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base original del que derivan los pesos |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa con modelos de la misma categoría no es posible con los datos disponibles: no se conocen benchmarks, contexto ni licencia del modelo base, y no se han identificado alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no incluye `lm_head` ni tensores `mtp`, por lo que no es un modelo listo para generación de texto con pipelines estándar de Hugging Face sin trabajo adicional.
- No se documentan sesgos conocidos, pero al no haber información sobre los datos de entrenamiento del modelo base, no es posible evaluar sesgos de forma responsable.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas.
- Limitaciones de contexto e idioma: desconocidas, al no publicarse la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia declarada es Apache 2.0, heredada del modelo original; el autor indica que se incluyen los ficheros de licencia originales cuando la fuente los tenía. Conviene verificar la licencia del repositorio base antes de uso comercial, ya que la información proporcionada no detalla la licencia del modelo WangSenQWQ/Senova-4B-v3.
- El repositorio no registra descargas ni "likes", y fue creado y actualizado en la misma fecha (2026-11-04), lo que indica una publicación reciente y sin validación comunitaria.
- El uso previsto está acoplado al subnet Zils (Bittensor SN127), pool d3-mini; fuera de ese contexto, su utilidad es limitada.
- No se especifica el pipeline de Hugging Face, lo que dificulta la carga automática con `transformers`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subs-king/zils-mini-senova-4b-v3
- Modelo base: https://huggingface.co/WangSenQWQ/Senova-4B-v3
- Revisión del modelo base referenciada: `0a23e33503e8bbdc0d88676aac7444c6070977c0`
- Subnet Zils (Bittensor SN127): no se proporciona enlace en la información disponible.
