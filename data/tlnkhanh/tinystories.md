# TLNKhanh/tinystories

## Resumen

`TLNKhanh/tinystories` es un modelo de lenguaje decoder-only de tipo GPT entrenado desde cero por el usuario TLNKhanh sobre el corpus TinyStories V2 (generado con GPT-4). Con 29.545.472 parametros, su unica tarea es la completacion de historias cortas en ingles condicionada por un prompt: se le da un inicio de cuento y el modelo lo continua. No es un modelo de chat ni un asistente conversacional, sino un modelo base de completacion.

El modelo se distribuye unicamente en formato GGUF F16 dentro de un repositorio de 0,1 GB, acompanado de los ficheros `template`, `params` y `Modelfile` para su uso directo con Ollama. Su ventana de contexto es de 256 tokens, que coincide con el tamano de bloque usado en el entrenamiento, y fue entrenado en una unica RTX 3060 durante aproximadamente 6 horas, alcanzando una perdida de validacion de 1,1885.

Su relevancia es acotada y muy especifica: sirve como referencia educativa de entrenamiento de un transformer pequeno desde cero, como banco de pruebas para pipelines de despliegue en Ollama/GGUF, y como generador de cuentos infantiles sinteticos en ingles. No esta pensado para tareas generales de razonamiento, codigo o dialogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT |
| Parametros totales | 29.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | F16 (unico peso publicado en GGUF) |
| Idiomas soportados | ingles (unico idioma del corpus de entrenamiento; no se declara lista oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `tinystories-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con 29,5 millones de parametros, entrenado desde cero (no es un fine-tune de un modelo preexistente). La tarea de entrenamiento es la prediccion del siguiente token sobre TinyStories V2, un corpus de cuentos cortos generados por GPT-4, con un total de 543 millones de tokens procesados. El tamano de bloque de entrenamiento es de 256 tokens, que define la longitud de contexto efectiva del modelo.

No se dispone de informacion sobre el numero de capas, dimension del modelo, numero de cabezas de atencion, vocabulario, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica (atencion lineal, decodificacion especulativa, MoE, SSM) mas alla del transformer clasico. El entrenamiento se realizo en una RTX 3060 durante unas 6 horas y la perdida de validacion reportada es de 1,1885.

## Capacidades

- Generacion de texto en ingles: completacion de historias cortas a partir de un inicio de cuento (por ejemplo, "Once upon a time, there was a little girl named Lucy").
- Modelo base de completacion: no incluye envoltorio de chat ni formato de instrucciones; el fichero `template` de Ollama usa el prompt en crudo.
- Generacion de cuentos infantiles sinteticos con vocabulario y estructuras narrativas simples, derivadas de la distribucion de TinyStories V2.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; el entrenamiento se limita a ingles.

## Casos de uso

- Generacion de cuentos infantiles sinteticos: dado un inicio de historia en ingles, el modelo produce continuaciones cortas y coherentes dentro del estilo de TinyStories, util para crear datasets sinteticos de texto simple para experimentos de investigacion.
- Pruebas de pipelines de despliegue GGUF/Ollama: al ser un modelo de 0,1 GB con ficheros `template`, `params` y `Modelfile` incluidos, sirve para validar de extremo a extremo un flujo `ollama pull` / `ollama run` sin necesidad de configuracion adicional.
- Docencia y experimentacion en entrenamiento desde cero: su tamano (29,5 M de parametros) y su coste de entrenamiento (unas 6 horas en una RTX 3060) lo hacen adecuado como caso de estudio reproducible de un transformer GPT completo.
- Generacion de texto en entornos con recursos minimos: el modelo F16 ocupa una fraccion muy pequena de VRAM, por lo que puede ejecutarse en GPUs de gama baja o incluso en CPU, para tareas de generacion de texto corto en ingles.
- Aumento de datos para tareas de NLP simple: las historias generadas pueden usarse como corpus adicional en experimentos de clasificacion o modelado de lenguaje a pequena escala.
- Benchmark de referencia para modelos minimos: permite comparar el comportamiento de arquitecturas pequenas frente a modelos mayores en la tarea acotada de completacion de cuentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion de 1,1885 sobre TinyStories V2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en F16 (29,5 M de parametros a 2 bytes por parametro, aproximadamente 59 MB de pesos mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor entreno el modelo en una RTX 3060, que es sobradamente suficiente para inferencia.
- Cabe en cualquier GPU de consumo actual (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Ollama (soporte nativo mediante `ollama pull hf.co/TLNKhanh/tinystories`), llama.cpp y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TLNKhanh/tinystories | 29,5 M | 256 tokens | no disponible | GGUF F16 | Entrenado desde cero en TinyStories V2; solo ingles; completacion de cuentos |
| Modelos TinyStories originales (Eldan y Li, 2023) | ~1 M a ~33 M | no disponible en esta ficha | no disponible | no disponible | Familia de referencia del corpus TinyStories; no se dispone de datos verificados en la informacion proporcionada |
| GPT-2 small | 124 M | 1024 tokens | no disponible | safetensors, GGUF | Modelo generalista en ingles, mucho mayor y con contexto cuatro veces superior |

La comparacion con los modelos TinyStories originales y con GPT-2 small se ofrece como referencia de categoria; no se dispone de datos verificados de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base de completacion: no sigue instrucciones ni mantiene dialogos; usarlo como chatbot produce resultados incoherentes.
- Contexto muy limitado: 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinacion y deriva narrativa: al ser un modelo de 29,5 M de parametros, la coherencia se degrada rapidamente fuera del estilo de TinyStories.
- Sesgos: el corpus TinyStories V2 fue generado por GPT-4, por lo que puede heredar sesgos de ese modelo; no se documenta ninguna evaluacion de sesgos.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sin garantias de calidad: perdida de validacion de 1,1885 en una tarea muy acotada; no hay benchmarks publicados que respalden su rendimiento en otras tareas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TLNKhanh/tinystories
- Repositorio del corpus TinyStories (referencia del dataset, no verificada en la busqueda): no disponible
- Paper TinyStories (Eldan y Li, 2023): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible
