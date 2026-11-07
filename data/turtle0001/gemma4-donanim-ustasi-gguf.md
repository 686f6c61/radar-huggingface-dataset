# turtle0001/gemma4-donanim-ustasi-gguf

## Resumen

`turtle0001/gemma4-donanim-ustasi-gguf` es una distribucion en formato GGUF de un fine-tuning del modelo Gemma 4 E4B instructivo (familia Gemma de Google), publicada por el usuario turtle0001. El nombre del repositorio ("donanim ustasi", que en turco significa "maestro del hardware") sugiere una especializacion vertical en el ambito del hardware, aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del ajuste. El modelo es de tipo vision-language: incluye un proyector multimodal separado (`BF16-mmproj.gguf`) ademas de los pesos cuantizados del modelo de lenguaje.

Con 7.518.069.290 parametros totales reportados en los safetensors del modelo base, se trata de un modelo de aproximadamente 7,5 mil millones de parametros. El autor ha generado los pesos con Unsloth y los ha convertido a GGUF para su uso con llama.cpp, lo que permite ejecucion local en hardware de consumo. La relevancia practica es la de un ejemplo de pipeline completo de fine-tuning y cuantizacion de un modelo Gemma multimodal, aunque la ausencia de model card detallada, licencia explicita y benchmarks limita seriamente su evaluacion para produccion.

La informacion disponible es escasa: no se documentan idiomas, licencia, composicion del dataset ni resultados de evaluacion. Todo lo que sigue se limita a lo que puede inferirse de los metadatos del repositorio, de los nombres de fichero y de la model card publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (vision-language), base Gemma 4 E4B; detalles de atencion no disponibles |
| Parametros totales | 7.518.069.290 (reportado en safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Gemma tiene su propia licencia; el repo no la declara) |
| Formato de pesos | GGUF (`gemma-4-E4B-it.Q4_K_M.gguf`, `gemma-4-E4B-it.BF16-mmproj.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B instructivo, un transformer decoder-only con capacidad de vision, y le anade un proyector multimodal (`mmproj`) que traduce las representaciones de imagen al espacio del modelo de lenguaje. La distribucion GGUF separa el modelo de lenguaje cuantizado a Q4_K_M del proyector en BF16, siguiendo la convencion de llama.cpp para modelos multimodales. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de posicionamiento del modelo base.

El fine-tuning se realizo con Unsloth (el autor indica que el entrenamiento fue "2x faster with Unsloth") y posteriormente se convirtio a GGUF. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se especifica si el ajuste cubrio solo el modelo de lenguaje, solo el proyector o ambos. La existencia de un repositorio hermano en 16 bits (`turtle0001/gemma4-donanim-ustasi-16bit`) sugiere que el GGUF se deriva de una fusion en precision completa, pero no hay mas detalles tecnicos publicados.

## Capacidades

- Generacion de texto conversacional en modo instructivo, heredada del modelo base Gemma 4 E4B-it.
- Comprension de imagenes y respuesta multimodal, mediante el proyector `BF16-mmproj.gguf` y el binario `llama-mtmd-cli`.
- Soporte de plantilla de chat Jinja, invocable con el flag `--jinja` en llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades de razonamiento, codigo o matematicas: no documentadas para este fine-tuning concreto.
- Tool calling / function calling: no documentado.
- Comportamiento agente o multi-step: no documentado.
- Capacidades multilingues: no documentadas; el nombre del modelo sugiere turco, pero no se confirma.
- Modo thinking explicito, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado local de asistentes multimodales: el modelo puede cargarse con `llama-mtmd-cli` en una maquina de desarrollo para probar interacciones imagen-texto sin depender de APIs externas, gracias a la cuantizacion Q4_K_M que reduce el peso a unos pocos gigabytes.
- Experimentacion con fine-tuning de Gemma multimodal: sirve como referencia de pipeline Unsloth + conversion GGUF para equipos que quieran replicar el flujo con sus propios datos.
- Descripcion de imagenes tecnicas en entornos con hardware especializado: dado el nombre "donanim ustasi" (maestro del hardware), un uso plausible es la interpretacion de fotografias de componentes, aunque no hay evidencia documentada de que el ajuste lo respalde.
- Base para evaluacion comparativa de fine-tunings comunitarios: util en tareas de investigacion que comparan adaptaciones de Gemma 4 frente al modelo original.
- Despliegue en estaciones de trabajo con GPU de consumo: al ser GGUF Q4_K_M, puede ejecutarse en GPUs de 8-12 GB o incluso en CPU, lo que facilita pruebas offline.
- Integracion en flujos de chat locales con plantilla Jinja: el soporte de `--jinja` permite reutilizar plantillas de conversacion estandar en llama.cpp.
- Generacion de codigo en produccion: no recomendable con la informacion disponible, al no existir benchmarks ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 4-5 GB (repo total de 6,3 GB incluyendo el proyector BF16 y metadatos); se recomienda reservar 6-8 GB de VRAM para contexto y overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB es suficiente para Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas; tambien puede ejecutarse en CPU con llama.cpp aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (con la salvedad de que no soporta ficheros mmproj separados y requiere crear un modelo unificado desde el Modelfile), y potencialmente otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend.
- Nota: la model card advierte que Ollama no soporta `mmproj` separado; para vision en Ollama hay que fusionar el modelo en BF16 y crear el modelo con `ollama create`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| gemma4-donanim-ustasi-gguf | ~7,5 B | no disponible | Si (mmproj) | no disponible | GGUF |
| Gemma 4 E4B-it (base) | ~7,5 B (segun safetensors) | no disponible en esta ficha | Si | licencia Gemma de Google | safetensors, GGUF |
| turtle0001/gemma4-donanim-ustasi-16bit | ~7,5 B | no disponible | Si | no disponible | safetensors (16 bits) |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan dataset, objetivo del fine-tuning, idiomas ni evaluacion, lo que impide validar su calidad.
- Licencia no declarada en el repositorio: el uso comercial es incierto y depende de la licencia del modelo base Gemma, que no se reproduce en el repo.
- Riesgo de alucinacion: inherente a los modelos de ~7,5 B y no mitigado por informacion publicada sobre el ajuste.
- Sesgos: desconocidos; no hay documentacion sobre la composicion del dataset ni sobre evaluaciones de sesgo.
- Limitaciones de contexto e idioma: no disponibles; el nombre sugiere especializacion en turco, pero no se confirma.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Restricciones practicas: Ollama no soporta el fichero `mmproj` separado, lo que complica el despliegue multimodal en ese runtime.
- Para produccion: no recomendable sin benchmarks, licencia clara y documentacion del dataset.

## Enlaces

- Repositorio GGUF: https://huggingface.co/turtle0001/gemma4-donanim-ustasi-gguf
- Repositorio en 16 bits: https://huggingface.co/turtle0001/gemma4-donanim-ustasi-16bit
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
