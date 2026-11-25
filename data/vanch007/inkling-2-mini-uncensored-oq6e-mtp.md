# vanch007/Inkling-2-Mini-Uncensored-oQ6e-mtp

## Resumen

Inkling-2-Mini-Uncensored-oQ6e-mtp es una conversión cuantizada del modelo multimodal OpenUncensored/Inkling-2-Mini-Uncensored, publicada por el usuario vanch007. Se trata de una derivación del modelo base Inkling 2 Mini de Thinking Machines Lab, afinado posteriormente por OpenUncensored para eliminar restricciones de contenido. Esta versión concreta aplica el preset de cuantización oQ6e mediante la herramienta oMLX 0.8.2, orientada al ecosistema MLX de Apple Silicon, y conserva tanto la configuración de visión como el borrador DSpark empaquetado en `mtp.safetensors` para decodificación especulativa.

El modelo resuelve el problema de desplegar un modelo multimodal de aproximadamente 26.400 millones de parámetros en hardware de Apple con memoria unificada, reduciendo el peso a unos 16,66 GiB en precisión de 6 bits. Es relevante para desarrolladores que trabajan en Mac con M-series y necesitan inferencia local de un modelo image-text-to-text con capacidades conversacionales, sin depender de GPUs dedicadas.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor; no se dispone de información detallada sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop`; transformer multimodal presumiblemente, sin confirmar) |
| Parametros totales | 26.388.646.400 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (preset oQ6e de oMLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Inkling 2 Mini más allá de la etiqueta `inkling2_loop` presente en los metadatos, que sugiere algún tipo de bucle o mecanismo recurrente en la arquitectura, sin que se pueda confirmar su naturaleza exacta. El pipeline declarado es `image-text-to-text`, lo que confirma capacidades multimodales de entrada de imagen y salida de texto. El modelo incorpora un borrador DSpark empaquetado en `mtp.safetensors`, destinado a decodificación especulativa (Lightning MTP), lo que indica que el checkpoint original incluía un mecanismo de multi-token prediction para acelerar la generación.

En cuanto al entrenamiento, la model card no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Se sabe que OpenUncensored aplicó un ajuste fino sobre el modelo de Thinking Machines Lab para eliminar restricciones de contenido, y que la calibración de activaciones de oQe se ejecutó sobre ese checkpoint afinado. La conversión con oMLX 0.8.2 omite el paso de refinamiento Hessiano separado para `inkling2_loop`, según indica el autor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Decodificación especulativa mediante el borrador DSpark incluido, activable como Lightning MTP en oMLX.
- Comportamiento "uncensored": el ajuste fino del modelo base elimina filtros de contenido, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido sensible.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está pensado para ejecutarse con oMLX 0.8.2 en Macs con memoria unificada suficiente (verificado en un M3 Max), lo que permite desplegar un modelo de 26.400 millones de parámetros en 6 bits sin GPU dedicada.
- Prototipado de aplicaciones multimodales: al aceptar imagen y texto, sirve para experimentar con pipelines de descripción de imágenes, respuesta a preguntas visuales o asistentes que combinan capturas y conversación.
- Investigación sobre modelos sin censura: útil para estudiar el comportamiento de modelos afinados para eliminar restricciones, comparando respuestas frente a la versión original de Inkling 2 Mini.
- Evaluación de cuantización oQ6e: permite medir la degradación de calidad de un preset de 6 bits frente al checkpoint completo en tareas de visión y texto.
- Aceleración mediante decodificación especulativa: el borrador DSpark incluido permite probar Lightning MTP y medir la ganancia de throughput en generación de texto.
- Desarrollo offline y privado: al ejecutarse localmente en un Mac, es adecuado para flujos donde los datos no pueden salir del dispositivo, como análisis de documentos o imágenes confidenciales.
- Docencia y demostraciones: su tamaño contenido en disco (17,9 GB de repositorio) facilita su distribución en entornos académicos con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 17,9 GB y los pesos cuantizados suman unos 16,66 GiB; se necesita al menos esa cantidad de memoria libre, más overhead de activaciones y del borrador DSpark.
- GPU recomendadas: no aplica GPU dedicada; el modelo está empaquetado para MLX y se ejecuta en Apple Silicon.
- Compatibilidad consumer: verificado por el autor en un Apple M3 Max; cabe en Macs con memoria unificada de 24 GB o superior, aunque 32 GB o más es recomendable para contexto largo y visión.
- Opciones de despliegue: oMLX 0.8.2 con soporte de Inkling 2 Mini y Lightning MTP activado para cargar el borrador DSpark. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor solo confirma que la inferencia de texto y la carga del borrador fueron verificadas en M3 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-oQ6e-mtp (este) | 26.388.646.400 | no disponible | apache-2.0 | safetensors MLX 6-bit | Cuantizado para Apple Silicon, incluye borrador DSpark |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | no disponible | safetensors | Checkpoint original sin cuantizar del que deriva este |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base original de Thinking Machines Lab |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina filtros de contenido: puede generar respuestas inapropiadas, dañinas o ilegales según el contexto, y no es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo elevado de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones que lo cuantifiquen.
- La cuantización a 6 bits puede degradar la calidad respecto al checkpoint original, especialmente en tareas de visión o razonamiento complejo.
- Dependencia exclusiva del ecosistema MLX y de oMLX 0.8.2: no hay soporte documentado para otras herramientas de inferencia, lo que limita el despliegue a Apple Silicon.
- La licencia apache-2.0 se aplica a este repositorio, pero conviene verificar las condiciones del modelo base y del fine-tune upstream antes de uso comercial.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni sesgos conocidos.
- El paso de refinamiento Hessiano se omite en la conversión para `inkling2_loop`, lo que podría afectar a la fidelidad de la cuantización frente a otros presets.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vanch007/Inkling-2-Mini-Uncensored-oQ6e-mtp
- Modelo base del fine-tune: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
