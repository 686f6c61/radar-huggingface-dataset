# SZLHOLDINGS/szl-canary-lora-20261119

## Resumen

SZLHOLDINGS/szl-canary-lora-20261119 es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de su catalogo denominado "governed-AI estate", que agrupa modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de auditoria ("receipts"). El nombre del repositorio indica que se trata de un adaptador LoRA (o un artefacto derivado de un proceso de ajuste fino con LoRA) generado el 19 de noviembre de 2026, presumiblemente como pieza de control o "canary" dentro de su pipeline de entrenamiento.

La model card no proporciona informacion tecnica sustantiva: no declara arquitectura, modelo base, numero de parametros, longitud de contexto, idiomas ni licencia. El autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en ficheros de receipt externos al repositorio y que, en su ausencia, el dato debe considerarse desconocido (UNKNOWN). El tamano del repositorio es de 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el contenido es de tamano despreciable.

Por tanto, esta ficha no puede caracterizar el modelo en terminos de capacidades reales. Se documenta unicamente lo verificable: identificador, autor, formato declarado (safetensors), fechas y el marco de gobernanza del que forma parte. Cualquier evaluacion de idoneidad para produccion requeriria acceso a los receipts citados y al modelo base sobre el que se aplicaria el adaptador, datos que no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere adaptador LoRA; modelo base no declarado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag declarado en Hugging Face) |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-19 |
| Ultima actualizacion | 2026-11-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. El identificador "lora" sugiere un adaptador de bajo rango (Low-Rank Adaptation) que se aplicaria sobre un modelo base no especificado en la model card; sin ese modelo base, no es posible determinar la arquitectura subyacente (transformer denso, MoE, hibrido, etc.), el numero de parametros ni la dimension del adaptador.

Respecto al entrenamiento, la model card declara que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de receipt dentro del "estate mesh" del autor, y que cualquier dato no receiptado en la propia tarjeta debe considerarse UNKNOWN. No se indica numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni ninguna innovacion tecnica. El sufijo "canary" y la fecha en el nombre sugieren un artefacto de control o verificacion dentro de un pipeline interno, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado.

## Capacidades

- No se declaran capacidades funcionales en la informacion disponible.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- No se declara modo "thinking", vision ni audio.
- El unico dato funcional verificable es el formato de pesos declarado (safetensors), compatible con las librerias habituales del ecosistema Hugging Face.

## Casos de uso

- Auditoria de gobernanza de modelos: el artefacto puede emplearse como ejemplo de trazabilidad en pipelines internos que requieran receipts fechados y verificables, dado el marco declarado por SZLHOLDINGS.
- Verificacion de integridad de artefactos: si los pesos estuvieran disponibles, serviria para comprobar la reproducibilidad del proceso de publicacion (hash, fecha, autor) dentro de un sistema de control de calidad.
- Pruebas de pipeline de adaptadores LoRA: en un entorno de desarrollo, podria usarse como caso de prueba para validar cargadores de adaptadores en safetensors, siempre que se identificara el modelo base.
- Documentacion de referencia en formacion interna: como ejemplo de model card minimalista centrada en receipts y estados UNKNOWN/MEASURED.
- No se recomienda su uso en produccion ni en aplicaciones de usuario final: no hay evidencia de capacidades, licencia ni modelo base que permita evaluar su idoneidad.
- No se identifican casos de uso adicionales realistas a partir de la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna medicion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base y del rango del adaptador, ambos no declarados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el formato safetensors es compatible con las librerias habituales (transformers, PEFT), pero se desconoce el modelo base al que se aplicaria el adaptador.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 0.0 GB, por lo que no parece contener pesos sustanciales; cualquier despliegue requeriria localizar los artefactos reales en el "estate mesh" del autor.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha identificado el modelo base, la tarea ni el tamano del artefacto. Cualquier comparacion con adaptadores LoRA publicos (por ejemplo, adaptadores PEFT sobre Llama, Mistral o Qwen) seria especulativa y no se incluye.

## Limitaciones y advertencias

- Ausencia total de informacion tecnica: sin arquitectura, parametros, contexto ni modelo base, no es posible evaluar el modelo para ningun uso.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse restriccion por defecto.
- Model card centrada en gobernanza y receipts, no en capacidades: el autor remite a ficheros externos que no estan incluidos en el repositorio.
- Repositorio de 0.0 GB: los pesos podrian no estar efectivamente alojados, lo que impediria su descarga y uso.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo.
- Sin descargas ni likes: no hay evidencia de uso por parte de la comunidad ni de validacion externa.
- El caracter "canary" del nombre sugiere un artefacto de prueba interno; no debe tratarse como un modelo listo para produccion sin verificacion adicional en el origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-canary-lora-20261119
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (citada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de model cards citada (estate-cards): https://github.com/szl-holdings/estate-cards
