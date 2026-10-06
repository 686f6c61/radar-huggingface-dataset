# TechnoBaptist/PlayDiffusion

## Resumen

PlayDiffusion es un modelo de edición de voz basado en difusión, desarrollado por Play.AI y publicado en abierto. A diferencia de los sistemas de texto a voz autoregresivos (AR) tradicionales, que no permiten modificar o eliminar fragmentos de audio ya generados sin introducir artefactos en los límites de la edición, PlayDiffusion aborda la edición localizada de habla mediante un esquema no autoregresivo de enmascarado y desruido. El modelo se ha subido a HuggingFace bajo el identificador `TechnoBaptist/PlayDiffusion`, un espejo del repositorio original `PlayHT/PlayDiffusion`.

El problema que resuelve es concreto: cambiar una palabra dentro de una locución ya sintetizada (por ejemplo, sustituir "Neo" por "Trinity") manteniendo la coherencia prosódica y las características del hablante, sin regenerar toda la frase. La arquitectura parte de un transformer decoder-only de tipo Llama al que se le introducen cabezas de atención no causal, lo que permite atender simultáneamente a tokens pasados, presentes y futuros. El modelo opera sobre tokens discretos de audio y emplea un decodificador BigVGAN para reconstruir la forma de onda.

La relevancia actual reside en que habilita herramientas de edición fina de voz de forma abierta y con licencia Apache 2.0, un terreno dominado hasta ahora por enfoques AR con limitaciones para el *inpainting* de audio. El repositorio ocupa 10,3 GB y está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion no causal, adaptado a difusion para generacion de audio (basado en Llama) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 10,3 GB; no se confirma el formato en la informacion proporcionada) |

## Arquitectura y entrenamiento

PlayDiffusion es un modelo de difusion no autoregresivo para edicion de habla. El flujo de trabajo consta de cuatro etapas: (1) codificacion de la onda de audio en una secuencia de tokens discretos, tanto para voz real como para audio generado por sistemas TTS; (2) enmascarado del tramo que se desea modificar; (3) desruido del tramo enmascarado mediante un modelo de difusion condicionado por el texto actualizado, preservando el contexto circundante y las caracteristicas del hablante; y (4) reconstruccion de la forma de onda mediante un decodificador BigVGAN, condicionado por un *speaker embedding* extraido del clip original.

Sobre el entrenamiento, el modelo parte de una arquitectura transformer decoder-only preentrenada de tipo texto y aplica tres modificaciones clave: atencion no causal (a diferencia de los LLM decoder-only estandar, como GPT), lo que permite al modelo usar contexto pasado, presente y futuro; un tokenizer BPE personalizado de solo 10.000 tokens de texto, que reduce drasticamente la tabla de embeddings y acelera el computo sin degradar la calidad de audio; y condicionamiento de hablante derivado de un modelo de embeddings preentrenado que mapea ondas de longitud variable a vectores de tamano fijo. El regimen de entrenamiento, inspirado en MaskGCT, consiste en enmascarar aleatoriamente un porcentaje de tokens de audio y aprender a predecirlos a partir del contexto, los embeddings de hablante y el texto. En inferencia, el decodificado es iterativo: se parte de una secuencia totalmente enmascarada, se genera una prediccion preliminar, se asigna una puntuacion de confianza a cada token y se reenmascara de forma adaptativa segun un calendario decreciente.

## Capacidades

- Edicion localizada de voz: sustitucion, eliminacion o ajuste de fragmentos concretos de una locucion ya generada sin regenerar el audio completo.
- *Inpainting* de audio: dado un texto actualizado y una secuencia de tokens con una region enmascarada, genera la region faltante con transiciones coherentes.
- Preservacion de la identidad del hablante mediante condicionamiento por *speaker embedding* extraido del clip original.
- Operacion sobre audio real y sobre audio sintetizado por modelos TTS.
- Reconstruccion de forma de onda mediante decodificador BigVGAN.
- Edicion condicionada por texto en ingles.
- No se documenta soporte de *tool calling*, function calling, agentes, vision, audio de entrada distinto de la propia edicion ni modo de razonamiento explicito.

## Casos de uso

- Postproduccion de locuciones: corregir palabras mal pronunciadas o cambiar un termino en una narracion ya sintetizada sin volver a generar toda la frase, evitando variaciones de prosodia.
- Doblaje y localizacion: ajustar nombres propios o terminos adaptados tras la generacion, manteniendo la voz y el ritmo originales del hablante.
- Produccion de audiolibros: corregir errores de lectura o cambiar fragmentos de texto sin regenerar capitulos completos.
- Contenido publicitario y de marketing: actualizar cifras, precios o nombres de producto en un spot de voz sin rehacer la grabacion completa.
- Iteracion creativa en doblaje de videojuegos: sustituir lineas de dialogo concretas conservando la actuacion vocal circundante.
- Pipeline de TTS con control de calidad: integrar la edicion como paso correctivo sobre audio generado por un sistema TTS, reduciendo coste computacional frente a la regeneracion total.
- Herramientas de accesibilidad: ajustar contenido de audio generado para personas con discapacidad visual o auditiva sin rehacer la locucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el repositorio ocupa 10,3 GB, por lo que se requiere al menos ese espacio en disco para los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible. El modelo depende de un decodificador BigVGAN y un modelo de embeddings de hablante, por lo que su despliegue requiere el *stack* completo de Play.AI o su reproduccion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| PlayDiffusion | Edicion de voz por difusion | No autoregresivo, enmascarado y desruido | apache-2.0 | HuggingFace (mirror en `TechnoBaptist/PlayDiffusion` y original en `PlayHT/PlayDiffusion`) |
| MaskGCT | TTS / generacion de habla | Enmascarado y prediccion (referenciado como base del entrenamiento) | no disponible | no disponible |
| Modelos TTS autoregresivos (p. ej. familia GPT-style) | Sintesis de voz | Autoregresivo | variable | variable |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo esta etiquetado para ingles; no se documenta soporte multilingue.
- No se proporcionan datos sobre sesgos, tasas de alucinacion ni calidad de la edicion en condiciones fuera de distribucion.
- La edicion puede degradarse si el tramo enmascarado es muy largo o si el texto actualizado no encaja con la duracion de los tokens enmascarados.
- La dependencia de un decodificador BigVGAN y de un modelo de embeddings de hablante implica que la reproducibilidad completa exige disponer de esos componentes adicionales.
- Aunque la licencia es Apache 2.0, lo que permite uso comercial, no se documentan condiciones adicionales sobre el audio generado ni sobre el uso de voces concretas.
- El repositorio `TechnoBaptist/PlayDiffusion` es un espejo: conviene verificar que los pesos coinciden con el original `PlayHT/PlayDiffusion` antes de usarlo en produccion.
- No hay informacion sobre cuantizacion, por lo que no se puede garantizar su despliegue en hardware de consumo.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/TechnoBaptist/PlayDiffusion
- Repositorio HuggingFace original: https://huggingface.co/PlayHT/PlayDiffusion
- Perfil del autor en HuggingFace: https://huggingface.co/TechnoBaptist/models
- Sitio de Play.AI: http://play.ai/
- Paper de referencia [1]: https://arxiv.org/pdf/2401.04577
- Paper de referencia [2]: https://arxiv.org/pdf/2305.09636
- Paper de MaskGCT [3]: https://arxiv.org/pdf/2409.00750
- Noticia sobre el lanzamiento: https://www.aibase.com/news/18621
