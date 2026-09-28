# stardude1/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored-mlx-4Bit

## Resumen

Este repositorio contiene una conversión a formato MLX con cuantización de 4 bits del modelo DavidAU/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored, un ajuste fino orientado a escritura creativa y roleplaying sin filtros de contenido. La conversión la firma el usuario stardude1 y se ha generado con mlx-lm 0.31.2, lo que la hace ejecutable directamente sobre Apple Silicon mediante la librería MLX de Apple. No se trata por tanto de un modelo nuevo entrenado desde cero, sino de una redistribución optimizada para hardware de Apple de un modelo ya publicado.

El modelo subyacente pertenece a la familia LFM2 en su variante MoE (identificador de arquitectura `lfm2_moe`), con 11.280.731.136 parámetros totales y una nomenclatura "A1B" que sugiere del orden de 1.000 millones de parámetros activos por token, es decir, una mezcla de expertos dispersa. El ajuste fino del que deriva está etiquetado como "uncensored" y "heretic", términos habituales en la comunidad para indicar que se ha reducido o eliminado el comportamiento de rechazo ante peticiones sensibles, y está especializado en ficción, narrativa, generación de tramas y roleplaying.

Su relevancia práctica es doble: por un lado permite ejecutar localmente un modelo de ~11 B en equipos con memoria unificada moderada gracias a la cuantización de 4 bits; por otro, cubre un nicho concreto —generación literaria sin restricciones temáticas— que los modelos alineados de forma agresiva suelen rechazar. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el contenido que genere queda bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (sparse MoE), familia LFM2 (identificador de transformers: `lfm2_moe`) |
| Parametros totales | 11.280.731.136 (~11,28 B) |
| Parametros activos | ~1 B, segun la nomenclatura "A1B" del nombre (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX); el modelo base se distribuye en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx-my-repo`, generado con mlx-lm 0.31.2); no incluye GGUF |

Otros datos: tamano del repositorio 6,3 GB, pipeline `text-generation`, libreria declarada `transformers`, etiquetas `unsloth`, `uncensored`, `heretic`, `roleplaying`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que la clasifican como mezcla de expertos dispersa (`mixture of experts`, `sparse moe`, `moe`) dentro de la familia LFM2. El nombre del modelo indica 12 B de parametros totales con aproximadamente 1 B activos por token, un patron habitual en MoE de tipo fine-grained, donde solo una fraccion de los expertos se activa en cada paso de inferencia y el coste computacional se aproxima al de un modelo denso de ~1 B pese a almacenar 11,28 B de pesos. No se especifica el numero de expertos, el numero de expertos activados por token ni el tipo de atencion empleado.

Respecto al entrenamiento, el modelo base fue ajustado con Unsloth (etiqueta `unsloth`) sobre un modelo previo de la familia LFM2 SpeedDemon, y su model card lo etiqueta como "finetune". No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas "heretic" y "uncensored" indican que el ajuste ha ido en direccion contraria a la alineacion de seguridad habitual, reduciendo las negativas del modelo ante contenido sensible. Esta ficha describe una conversion a MLX 4 bits realizada con mlx-lm 0.31.2, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto narrativo y de ficcion: escritura de relatos, novelas, escenas y continuaciones con prosa elaborada (etiquetas `vivid writing`, `creative writing`, `fiction writing`).
- Generacion de tramas y subtramas: construccion de estructuras narrativas, arcos argumentales y giros (`plot generation`, `sub-plot generation`).
- Roleplaying y conversacion multi-turno con personajes, incluido roleplaying de personajes moralmente ambiguos sin romper el personaje.
- Cobertura de generos: ciencia ficcion, romance y, segun las etiquetas, "todos los generos".
- Generacion de codigo: el repositorio incluye la etiqueta `coder`.
- Uso general: etiqueta `all use cases` y pipeline `conversational`.
- Contenido sin filtros: comportamiento "uncensored", que reduce los rechazos ante peticiones sobre violencia, temas adultos o situaciones sensibles dentro de un contexto de ficcion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Escritura de ficcion de largo aliento: redaccion de capitulos y novelas por entregas, apoyandose en su especializacion en prosa vivida y generacion de tramas. Es adecuado porque el ajuste esta orientado explicitamente a narrativa y no impone restricciones tematicas.
- Continuacion de escenas: dado un fragmento previo, el modelo puede continuar la escena manteniendo el tono y los personajes (etiqueta `scene continue`), util en flujos de escritura asistida donde el autor aporta el arranque.
- Roleplaying y simulacion de personajes: creacion de bots de personaje para juegos de rol textuales o plataformas de chat narrativo, incluidos personajes antagonistas que otros modelos rechazarian interpretar.
- Generacion de subtramas para guiones o videojuegos: produccion de ideas argumentales secundarias y variantes narrativas a partir de una premisa, aprovechando las etiquetas de `plot generation` y `sub-plot generation`.
- Prototipado de asistentes de escritura creativa: integracion en una aplicacion de escritura como motor de sugerencias, ejecutandose en local en un Mac sin enviar el texto del usuario a servicios externos.
- Generacion de codigo en flujos de desarrollo: la etiqueta `coder` indica capacidad de generacion de codigo; puede usarse como asistente local en tareas de autocompletado o generacion de fragmentos, aunque no hay benchmarks que respalden su nivel real en esta tarea.
- Investigacion sobre modelos sin filtros: analisis comparativo del comportamiento de modelos "uncensored" frente a modelos alineados, util para estudiar mecanismos de rechazo y sesgos.
- Despliegue local con privacidad: al ejecutarse con MLX en hardware propio, permite trabajar con material confidencial (manuscritos no publicados, guiones bajo NDA) sin salida de datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de esta conversion ni las referencias encontradas incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench o evaluaciones de calidad literaria. El autor del modelo base de la familia SpeedDemon afirma tasas de generacion del orden de 300 a 500 tokens por segundo en "todos los dispositivos", pero esa afirmacion corresponde a otro miembro de la familia (LFM2-12B-A1B-SpeedDemon-High-Intelligence-Series-B) y no esta verificada para esta variante concreta.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 6,3 GB en formato MLX de 4 bits.
- VRAM o memoria unificada estimada: en torno a 7-8 GB solo para los pesos; con cache KV y contexto largo conviene disponer de 12-16 GB para evitar swapping. Los 11,28 B de parametros a 4 bits ocupan aproximadamente 5,6 GB en bruto, mas overhead de la libreria y del tokenizador.
- GPU compatibles: MLX esta disenado exclusivamente para silicio de Apple, por lo que el uso previsto es en chips de la serie M (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es ejecutable con CUDA ni con ROCm en su formato actual.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente. Un Mac con 16 GB puede ejecutarlo con comodidad; con 8 GB es viable solo con contexto reducido. No es un formato util para tarjetas graficas dedicadas.
- Alternativas para GPU dedicada: para tarjetas NVIDIA o AMD habria que recurrir al modelo base en bfloat16 (24 GB de VRAM o mas para pesos completos) o a las conversiones GGUF de terceros, como la de mradermacher (7,09 GB en cuantizacion i1), ejecutables con llama.cpp, Ollama o LM Studio.
- Opciones de despliegue: `mlx-lm` 0.31.2 o superior para este repositorio; llama.cpp, Ollama, LM Studio o text-generation-inference para el modelo base segun el formato. vLLM no soporta pesos MLX.
- Latencia y throughput: no disponibles para esta conversion. Se desconoce el rendimiento medido en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stardude1/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored-mlx-4Bit (este) | 11,28 B totales / ~1 B activos | no disponible | safetensors MLX 4 bits | apache-2.0 | HuggingFace, conversion no oficial de un tercero |
| DavidAU/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored | 11,28 B totales / ~1 B activos | no disponible | bfloat16 (transformers) | apache-2.0 | HuggingFace, modelo base de esta conversion |
| mradermacher/LFM2-12B-A1B-SpeedDemon-High-Intelligence-Series-B-i1-GGUF | ~11-12 B / ~1 B activos | no disponible | GGUF (imatrix) | apache-2.0 | HuggingFace, para llama.cpp y derivados |
| DavidAU/LFM2-12B-A1B-SpeedDemon-High-Intelligence-Series-B | ~11-12 B / ~1 B activos | no disponible | safetensors | apache-2.0 | HuggingFace, variante orientada a velocidad de generacion |

Los cuatro modelos comparten el mismo esqueleto LFM2 MoE y la misma licencia, y se diferencian en el ajuste fino aplicado, el formato de pesos y el ecosistema de ejecucion. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad real frente a alternativas de tamano similar.
- Modelo "uncensored": el ajuste elimina o reduce deliberadamente los rechazos ante contenido sensible. Esto implica riesgo de generar contenido violento, sexual, discriminatorio o legalmente problemático, y traslada toda la responsabilidad al operador del sistema.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se ha publicado ninguna medicion de fidelidad factual ni de tasa de alucinacion.
- Idioma: el unico idioma declarado es el ingles. El rendimiento en castellano no esta documentado y, dado que la arquitectura LFM2 esta optimizada para otros idiomas, es previsible que sea inferior y que presente interferencias linguisticas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, dato critico para planificar despliegues con documentos largos o conversaciones extensas.
- Es una conversion de terceros: el repositorio lo firma stardude1, no el autor original, y se ha generado con una version concreta de mlx-lm (0.31.2). No hay garantia de equivalencia numerica exacta con el modelo base ni de mantenimiento futuro.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que dificulta contrastar su comportamiento con experiencias de otros usuarios.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar si el modelo base impone condiciones adicionales derivadas de los datos de entrenamiento originales, extremo no documentado aqui.
- Restricciones de plataforma: al estar en formato MLX, solo se ejecuta en Apple Silicon. No hay version GGUF ni safetensors estandar en este mismo repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/stardude1/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored-mlx-4Bit
- Modelo base: https://huggingface.co/DavidAU/LFM2-12B-A1B-SpeedDemon-The-Deckard-II-HERETIC-Uncensored
- Variante de la familia SpeedDemon orientada a velocidad: https://huggingface.co/DavidAU/LFM2-12B-A1B-SpeedDemon-High-Intelligence-Series-B
- Conversion GGUF de mradermacher: https://huggingface.co/mradermacher/LFM2-12B-A1B-SpeedDemon-High-Intelligence-Series-B-i1-GGUF
- Ficha de la conversion GGUF en local-ai-zone: https://local-ai-zone.github.io/models/lfm2-12b-a1b-speeddemon-the-deckard-ii-heretic-uncensored-i1.html
- Espejo en GitHub de la conversion GGUF: https://github.com/Damacol/mradermacher-lfm2-12b-a1b-speeddemon-high-intelligence-series-b-gguf/blob/main/README.md
- Guia sobre modelos locales sin censura por tramos de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
