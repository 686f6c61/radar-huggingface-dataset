# TeslaInch/phi-3.5-mini-SCD

## Resumen

TeslaInch/phi-3.5-mini-SCD es un modelo de generación de texto con 3.821.079.552 parámetros (~3,8 mil millones), publicado en Hugging Face por el usuario TeslaInch el 19 de agosto de 2026. El repositorio ocupa 7,6 GB y los pesos están en formato safetensors. La model card es una plantilla automática sin información sustancial: no se especifican arquitectura, licencia, idiomas, datos de entrenamiento ni capacidades concretas.

Por el nombre y los resultados de búsqueda, todo apunta a que se trata de un fine-tuning o adaptación del modelo microsoft/Phi-3.5-mini-instruct, ya que el mismo autor ha publicado adaptadores como TeslaInch/scd-phi35-adapter y TeslaInch/scd-phi35-adapter-v3, ambos entrenados sobre dicha base. Sin embargo, no hay confirmación explícita en la ficha del modelo ni documentación adicional. El modelo no ha recibido descargas ni valoraciones, lo que sugiere que es un experimento reciente o un prototipo sin validación comunitaria.

Dado el vacío de información, esta ficha se limita a los datos verificables del repositorio y advierte explícitamente de las incógnitas pendientes. No se han publicado resultados de evaluación, especificaciones de entrenamiento ni casos de uso documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, basado en Phi-3.5-mini) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El repositorio solo indica que usa la librería transformers y el pipeline text-generation. Dado el número de parámetros y la existencia de adaptadores del mismo autor sobre Phi-3.5-mini-instruct, es plausible que sea un fine-tuning de dicha arquitectura, pero no hay confirmación oficial.

Tampoco se dispone de datos sobre el proceso de entrenamiento: no se especifican el dataset, el número de tokens, el régimen de entrenamiento (precisión, hiperparámetros) ni si se aplicaron técnicas como RLHF o DPO. La model card generada automáticamente no incluye ninguna de estas secciones.

## Capacidades

No se han documentado capacidades específicas del modelo. Al tratarse de un modelo de generación de texto con pipeline text-generation, se espera que pueda producir texto coherente, pero no hay evidencia de:

- Generación de código o razonamiento matemático.
- Soporte de tool calling o function calling.
- Capacidades de agente o razonamiento multi-paso.
- Soporte multilingüe.
- Modos especiales (thinking, visión, audio).

Cualquier afirmación sobre capacidades concretas sería especulativa y no se puede respaldar con la información disponible.

## Casos de uso

No se han documentado casos de uso oficiales ni ejemplos de aplicación. Dado que el modelo no tiene descargas ni validación comunitaria, no es recomendable utilizarlo en producción sin una evaluación previa. Los únicos usos posibles serían:

- Experimentación académica: evaluar el comportamiento de un fine-tuning de Phi-3.5-mini en tareas específicas, comparándolo con el modelo base.
- Investigación de adaptadores: estudiar la relación entre este modelo y los adaptadores publicados por el mismo autor (scd-phi35-adapter, scd-phi35-adapter-v3).
- Pruebas de integración técnica: verificar la compatibilidad con transformers y safetensors en entornos de desarrollo.

En todos los casos, se requiere una evaluación rigurosa antes de considerar cualquier despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco hay comparaciones con modelos de tamaño similar.

## Requisitos de hardware

No se ha publicado información sobre requisitos de hardware. Para un modelo de ~3,8 mil millones de parámetros en precisión fp16, la inferencia requiere aproximadamente 7,6 GB de VRAM (2 bytes por parámetro), lo que podría caber en GPUs de consumo como una RTX 3090 o RTX 4090 (24 GB). Sin embargo, esta estimación es genérica y no está confirmada para este modelo concreto.

No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

Dado que no hay información sobre el rendimiento real de este modelo, la comparación directa no es posible. Se puede comparar con su presunta base, microsoft/Phi-3.5-mini-instruct, pero los datos de esta ficha no permiten establecer diferencias. La siguiente tabla compara las características conocidas de ambos, con la salvedad de que la base sí tiene documentación oficial.

| Modelo | Parametros | Contexto | Licencia | Rendimiento conocido |
|---|---|---|---|---|
| TeslaInch/phi-3.5-mini-SCD | 3,8 B | no disponible | no disponible | no disponible |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128 K | MIT | MMLU 69,4, HumanEval 62,2, GSM8K 83,6 (según documentación oficial) |

La comparación con otros modelos de 3-4 B como Llama-3.2-3B o Qwen2.5-3B tampoco es posible sin datos de evaluación.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere contactar con el autor.
- El modelo no tiene descargas ni validación comunitaria; es un repositorio reciente sin evidencia de calidad.
- La model card es una plantilla automática sin contenido sustancial, lo que indica falta de documentación profesional.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Existe riesgo de que el modelo sea un experimento inacabado o con errores de configuración.

## Enlaces

- Repositorio del modelo: https://huggingface.co/TeslaInch/phi-3.5-mini-SCD
- Adaptador relacionado (v3): https://huggingface.co/TeslaInch/scd-phi35-adapter-v3
- Adaptador relacionado: https://huggingface.co/TeslaInch/scd-phi35-adapter
- Modelo base presumible (microsoft/Phi-3.5-mini-instruct): https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Documentación de Phi-3 en Azure: https://azure.microsoft.com/en-us/products/phi/
