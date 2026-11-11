# Wiz999/Qwen3-4B-OBLITERATED

## Resumen

Qwen3-4B-OBLITERATED es una variante del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario Wiz999 en Hugging Face. Se trata de una versión "abliterada" del modelo base: se ha aplicado una técnica de ingeniería de activaciones (abliteration) para eliminar el comportamiento de rechazo (refusal) del modelo original, de modo que responda a peticiones que el modelo base tendería a declinar. La modificación se realizó con la herramienta OBLITERATUS, en su método `advanced`.

El modelo conserva la arquitectura y el tamaño del Qwen3-4B original: un transformer denso de 4.022.468.096 parámetros (aproximadamente 4 mil millones), con pesos en formato safetensors y un repositorio de 8,1 GB. No se documentan en la información disponible ni la longitud de contexto, ni los tipos de cuantización, ni la licencia, ni los datos de entrenamiento específicos de esta variante.

La relevancia de esta ficha es acotada: se trata de un modelo derivado de un finetune comunitario con cero descargas y cero likes en el momento de la consulta, sin model card detallada más allá de la referencia al método de abliteración. Resulta útil como ejemplo de aplicación de técnicas de eliminación de refusal sobre un modelo pequeño, pero no como modelo de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado del Qwen3-4B de Alibaba Qwen, un transformer denso de aproximadamente 4 mil millones de parámetros. La única modificación documentada es la aplicación de abliteration mediante OBLITERATUS con el método `advanced`. La abliteration es una técnica de ingeniería de activaciones que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la proyecta fuera de los pesos o de las activaciones, de forma que el modelo deja de activar respuestas de negativa ante ciertas peticiones.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en esta variante. Tampoco se documentan innovaciones técnicas adicionales más allá del propio proceso de abliteration. Al tratarse de un derivado del Qwen3-4B, hereda las características arquitectónicas del modelo base, pero la información proporcionada no detalla aspectos como el tipo de atención, la posición de los embeddings o el esquema de normalización.

## Capacidades

- Generación de texto en inglés, idioma declarado en la model card.
- Razonamiento y respuesta a instrucciones generales, heredadas del Qwen3-4B base.
- Comportamiento de rechazo atenuado o eliminado mediante abliteration, lo que permite responder a peticiones que el modelo base declinaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (se desconoce si se conserva del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y refusal: el modelo sirve como caso de estudio para analizar cómo la abliteration modifica el comportamiento de rechazo y qué efectos colaterales tiene sobre la coherencia y la utilidad general. Es adecuado porque permite comparar directamente con el Qwen3-4B original.
- Evaluación de técnicas de ingeniería de activaciones: útil para reproducir y medir el efecto del método `advanced` de OBLITERATUS sobre un modelo de 4 mil millones de parámetros, con un coste de cómputo bajo.
- Generación de texto creativo sin restricciones temáticas: en entornos controlados de investigación, para estudiar la calidad de la generación cuando se eliminan las capas de refusal.
- Prototipado de pipelines de inferencia en local: al ser un modelo de 4B con pesos safetensors de 8,1 GB, puede cargarse en GPUs de consumo para pruebas de integración con transformers.
- Análisis de sesgos y comportamientos no deseados: permite examinar qué tipo de contenido emerge cuando se desactiva el refusal, lo que resulta relevante para auditorías de seguridad.
- Docencia y experimentación con modelos derivados: adecuado para demostrar el flujo completo de descarga, carga y generación con un modelo abliterado en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 9 y 12 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para los pesos.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para fp16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4-8 bits; en fp16 requiere al menos 12 GB para margen suficiente.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados en la información proporcionada, aunque al ser un modelo basado en Qwen3-4B con pesos safetensors son opciones plausibles previa conversión.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wiz999/Qwen3-4B-OBLITERATED | 4.022.468.096 | no disponible | no disponible | Hugging Face, 0 descargas | Derivado abliterado de Qwen3-4B |
| Qwen/Qwen3-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo base oficial | Modelo original sin abliterar |
| Otras variantes abliteradas de Qwen3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia fiable es el modelo base Qwen3-4B, del que este derivado hereda arquitectura y tamaño.

## Limitaciones y advertencias

- La abliteration elimina o atenúa el refusal, lo que puede dar lugar a respuestas a peticiones dañinas, ilegales o éticamente problemáticas; no debe desplegarse en producción sin filtros externos.
- No se documenta la licencia, por lo que el uso comercial queda en un estado jurídico indeterminado; es necesario consultar la licencia del modelo base Qwen3-4B y la del derivado antes de cualquier uso.
- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que se desconoce el impacto de la abliteration sobre la coherencia, el razonamiento y la precisión factual.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 4B, es esperable un riesgo superior al de modelos de mayor tamaño.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-4B, que tampoco se detallan.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- La model card no incluye información sobre el proceso de abliteration más allá del método (`advanced`) y la herramienta (OBLITERATUS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wiz999/Qwen3-4B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
