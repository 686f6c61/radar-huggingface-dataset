# SubMaroon/Boulesis-v2-26B-A4B

## Resumen

Boulesis-v2-26B-A4B es un modelo de rol conversacional (roleplay) desarrollado por el usuario SubMaroon a partir de la familia Gemma 4. No es un entrenamiento desde cero ni un fine-tune convencional: se trata de una fusión experimental de tres fine-tunes de Gemma 4, combinados mediante task arithmetic sobre las proyecciones de query y key (QK) y una LoRA fusionada, con el objetivo de conservar el conocimiento del modelo original mientras se diversifica su prosa y se mejora su adherencia a las tarjetas de personaje.

El modelo parte de una base de 26.544.131.376 parámetros en una arquitectura de mezcla de expertos (MoE), según refleja el sufijo A4B del nombre y la etiqueta `moe`. El autor (SubMaroon) y los fine-tunes de origen (coder3101, Gryphe) son publicaciones de la comunidad, no desarrollos oficiales de Google. El repositorio ocupa 53,1 GB en safetensors y declara únicamente el inglés como idioma soportado.

Su relevancia es limitada y muy de nicho: es una segunda iteración (v2) de un merge orientado a sesiones largas de rol en SillyTavern con modo de razonamiento activado, publicado bajo licencia Gemma y con un volumen de adopción muy bajo (10 descargas y 1 like en el momento de la consulta). Resulta interesante como caso de estudio de fusión de pesos sobre un MoE multimodal, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, familia Gemma 4 (etiqueta `gemma4`); fusion de tres fine-tunes mediante task arithmetic QK mas LoRA fusionada |
| Parametros totales | 26.544.131.376 (26,54 B), dato de safetensors |
| Parametros activos | no disponible (la nomenclatura A4B del nombre sugiere del orden de 4 B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; el autor menciona una version GGUF para KoboldCPP sin detallar los tipos concretos |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (repositorio de 53,1 GB) |
| Autor | SubMaroon |
| Modelos base | coder3101/gemma-4-26B-A4B-it-heretic, Gryphe/Gemma-4-26B-A4B-StyleTune-V2, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos de la familia Gemma 4. Segun la model card, los expertos MoE, el router, los embeddings, el MLP y la torre de vision son identicos al modelo "abliterated" de partida, verificado mediante comparacion de tensores despues de cada paso. Esto implica que la edicion se limita a las proyecciones de atencion y a una LoRA, y que el modelo conserva la torre de vision heredada, aunque no se documenta su funcionamiento tras el merge.

El proceso de construccion combina dos tecnicas. Primero, task arithmetic sobre QK: se toma un "donante" (Pantheon-Reasoning-26B-A4B-1.1-V2) para modificar las proyecciones de query y key, con alphas de 0,85 para sliding q/k y 0,65 para global q/k. El autor midio el vector de tarea antes de fusionar: la norma de Frobenius relativa frente a los pesos base esta entre 0,00263 y 0,00356 de media segun el grupo, con rotaciones por fila que alcanzan los 9,53 grados como maximo en el grupo global_k. Segundo, se fusiona una LoRA ("fused LoRA" o bake) con escala 0,70, aplicada solo a las capas 10 a 28 y a 35 objetivos (frente a las 30 capas y 55 objetivos de la v1). Los datos de entrenamiento de esa LoRA son exclusivamente en ingles, a diferencia de la mezcla ingles/ruso de la version anterior. No se documentan numero de tokens, composicion del dataset, ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y narrativo orientado a roleplay, con enfasis declarado en la adherencia a tarjetas de personaje y a presets.
- Modo de razonamiento (thinking) integrado: el autor indica explicitamente que se obtienen mejores resultados con el pensamiento activado.
- Razonamiento heredado del donor Pantheon-Reasoning, aplicado a la coherencia de escenas largas.
- Modelo "uncensored" / heretic: la base procede de una version abliterated, por lo que las restricciones de rechazo del modelo original estan atenuadas.
- Capacidades multilingues limitadas: solo ingles declarado.
- Herramientas y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision: la model card menciona una torre de vision identica a la base abliterated, pero no se documenta su funcionamiento ni su calidad tras el merge.
- Uso con frontends de rol: probado con SillyTavern en modo Chat Completion, y con GGUF en KoboldCPP.

## Casos de uso

- Roleplay en sesiones largas con SillyTavern: el modelo esta optimizado para leer la tarjeta de personaje y mantener la coherencia de escena, posiciones de personajes y a quien se dirige cada intervencion, que era la principal queja de la v1. Se usaria con plantilla de chat completion, temperatura 1.0, top-k 64, top-p 0.95 y penalizacion por repeticion de 1.05 a 1.1.
- Generacion de dialogos para videojuegos y novelas visuales: al ser un modelo de rol con capacidad de razonamiento, permite producir variantes de dialogo consistentes con un perfil de personaje definido en una ficha, con menos riesgo de salirse del registro del personaje.
- Asistente de escritura creativa y narrativa interactiva: util para explorar tramas ramificadas donde el modelo debe recordar hechos establecidos previamente y reincorporarlos de forma organica en lugar de reflejar lo que dice el usuario.
- Simulacion de entrevistas y practica conversacional: el modo thinking permite generar respuestas mas elaboradas y coherentes en escenarios de simulacion de personajes, siempre que se acepte el trabajo exclusivamente en ingles.
- Prototipado de personajes y evaluacion de presets: al ser un modelo de rol con ajustes de muestreo documentados, sirve para comparar presets y plantillas de prompt antes de pasar a modelos de mayor tamano.
- Experimentacion en fusion de modelos (merge research): el repositorio documenta alphas, escalas de bake, capas objetivo y mediciones de norma de Frobenius y rotacion por fila, lo que lo convierte en un caso reproducible para estudiar task arithmetic sobre MoE.
- Despliegue local en una sola GPU de consumo: con una cuantizacion de 4 bits el modelo puede caber en GPUs de 24 GB y ejecutarse con solo una fraccion de expertos activos por token, lo que permite sesiones de rol en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye mediciones internas del merge (norma de Frobenius relativa de los vectores de tarea y rotaciones por fila en grados), que no son benchmarks de calidad:

| Grupo | Media norma relativa | Max norma relativa | Alpha | Rotacion media (grados) | Rotacion max (grados) |
|---|---|---|---|---|---|
| sliding_q | 0,00278 | 0,00518 | 0,85 | 0,12 | 3,08 |
| sliding_k | 0,00263 | 0,00474 | 0,85 | 0,12 | 5,87 |
| global_q | 0,00356 | 0,00436 | 0,65 | 0,12 | 1,72 |
| global_k | 0,00286 | 0,00395 | 0,65 | 0,09 | 9,53 |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros (26,54 B) y del tamano del repositorio (53,1 GB), no datos publicados por el autor.

- Pesos en punto flotante de 16 bits: aproximadamente 53 GB, coherente con el tamano del repositorio. Requiere una GPU de 80 GB (H100, A100 80 GB) o reparto entre dos GPUs de 40 GB.
- Cuantizacion de 8 bits: aproximadamente 27 GB mas cache KV; no cabe en GPUs de 24 GB.
- Cuantizacion de 4 bits: aproximadamente 14 a 17 GB incluida cache KV para contextos moderados; cabe en RTX 3090, RTX 4090, RTX 5090 y RTX 4080 de 16 GB solo con contexto corto.
- Al ser MoE, el cuello de botella es la capacidad de VRAM (todos los expertos deben residir o descargarse), no la velocidad de computo: con llama.cpp es posible mantener en GPU solo los expertos mas usados y dejar el resto en RAM o disco.
- GPUs recomendadas: H100 80 GB o A100 80 GB para bf16; A100 40 GB en par para bf16; RTX 4090 o RTX 3090 (24 GB) con cuantizacion de 4 bits; Mac con memoria unificada de 64 GB o superior para cuantizaciones intermedias.
- Opciones de despliegue: vLLM o TGI para bf16 en servidor, llama.cpp/llama-server, Ollama y KoboldCPP para cuantizaciones GGUF en local, con SillyTavern como frontend.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de alternativas de la misma categoria dentro de la informacion proporcionada. La comparacion mas util es con los tres modelos base que se fusionaron, ya que estan documentados como ancestros:

| Modelo | Rol en el merge | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SubMaroon/Boulesis-v2-26B-A4B | Modelo final | 26,54 B (A4B) | no disponible | gemma | 10 descargas, 1 like |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | Aporta estilo de prosa y "sabor" de rol | no disponible | no disponible | gemma | publico en HuggingFace |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | Donante de QK para razonamiento | no disponible | no disponible | gemma | publico en HuggingFace |
| coder3101/gemma-4-26B-A4B-it-heretic | Cuerpo abliterated de partida | no disponible | no disponible | gemma | publico en HuggingFace |

## Limitaciones y advertencias

- El propio autor reconoce que sigue apareciendo "slop" (texto generico y repetitivo), heredado del modelo base o de StyleTune, y que no ha podido corregirlo.
- El autor duda de si mantener StyleTune en la v2 fue acertado: no pudo determinar si mejora o degrada la narrativa. Es un merge experimental sin evaluacion cuantitativa.
- Cobertura de pruebas muy estrecha: el autor indica que lo prueba sobre todo con sus propias tarjetas de personaje.
- Modelo "uncensored" derivado de una base abliterated: puede generar contenido que los modelos alineados rechazarian. No apto para productos dirigidos al publico general sin filtros adicionales.
- Solo se declara ingles. No hay soporte multilingue documentado, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas, que es precisamente el punto debil declarado de la v1.
- Licencia Gemma: no es una licencia de codigo abierto permisiva. Impone condiciones de uso, obligaciones de atribucion y restricciones de uso comercial y de redistribucion que deben revisarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; en tareas de rol el modelo prioriza la coherencia narrativa sobre la exactitud.
- Repositorio con 53,1 GB de pesos en safetensors y ausencia de cuantizaciones oficiales: el despliegue en hardware de consumo exige generar o buscar GGUF de terceros.
- Adopcion minima (10 descargas, 1 like), sin historial de uso en produccion ni validacion independiente.
- La fecha de creacion del repositorio figura como 2026-09-13 y la de actualizacion como 2026-09-13, datos tal como los devuelve HuggingFace.
- El autor publico una correccion en la seccion de creditos de la model card, lo que sugiere una revision rapida del contenido; conviene fijar una revision concreta del repositorio si se usa como base.
- Ajustes de muestreo sensibles: el autor recomienda temperatura 1.0, top-k 64, top-p 0.95 y penalizacion por repeticion 1.05-1.1; con GGUF en KoboldCPP es necesario forzar opciones adicionales para que el modo thinking funcione.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Boulesis-v2-26B-A4B
- Modelo base: https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Hilo de Reddit citado en la model card para los ajustes de muestreo: https://www.reddit.com/r/SillyTavernAI/comments/1w9abpf/comment/p8b064y/
- Perfil de Naphula: https://huggingface.co/Naphula
- Perfil de redaihf: https://huggingface.co/redaihf
- Perfil de Vortex5: https://huggingface.co/Vortex5

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces recuperados pertenecian a un sitio de juegos en linea sin relacion con el proyecto.
