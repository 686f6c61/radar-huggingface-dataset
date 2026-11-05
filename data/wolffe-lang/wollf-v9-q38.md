# wolffe-lang/wollf-v9-q38

## Resumen

wollf-v9-q38 es un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3.8-27B, desarrollado por el proyecto wolffe-lang, cuyo objetivo es ensenar a un modelo generalista a escribir wolf, un lenguaje de programacion compilado de sistemas de nueva creacion. Ningun modelo base incluye wolf en sus datos de preentrenamiento, por lo que el ajuste anade una capacidad completamente nueva sin degradar la habilidad general de programacion del modelo original. El modelo tiene 27.781.427.952 parametros (aproximadamente 27,8 mil millones) y se distribuye bajo licencia Apache 2.0.

El modelo se entrena sobre el corpus-v9, publicado como el dataset wolffe-lang/wollf-sft-v9, y cada fila de wolf del conjunto de entrenamiento fue validada por la cadena de herramientas oficial de wolf antes de conservarse. wollf-v9-q38 es el modelo de referencia del proyecto desde el 1 de noviembre de 2026, sustituyendo a wollf-v7sf3 (basado en Qwen3.6-27B, publicado como wolffe-lang/wollf-v7sf3), que permanece disponible sin cambios.

La relevancia actual del modelo reside en su enfoque metodologico: demuestra que un ajuste fino eficiente con QLoRA sobre un modelo de ~27B puede incorporar un lenguaje de programacion ausente del preentrenamiento y superar de forma sustancial tanto al base sin entrenar como a la generacion anterior del propio proyecto en tareas held-out de dificultad creciente, con evaluacion automatizada mediante compilador en contenedor aislado sin red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); tags del repo indican qwen3_5 |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (merge a precision completa), Q6_K_L (GGUF), Q8_0 (GGUF); adaptador QLoRA |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q6_K_L, Q8_0), adaptador QLoRA |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.8-27B y se ajusta mediante QLoRA, es decir, cuantizacion del modelo base y entrenamiento de adaptadores de bajo rango, que posteriormente se fusionan en un merge a precision completa en bf16. El entrenamiento se ejecuto en una GPU NVIDIA H100 de 80 GB alquilada en la nube (DigitalOcean, perfil `gpu-h100x1-80gb`), y el merge de precision completa se calculo en CPU sobre la estacion de trabajo del proyecto (Intel Core i7-12700KF, 46 GiB de RAM) y se verifico en su GPU RTX 3090 Ti.

Los datos de entrenamiento corresponden al corpus-v9, publicado como el dataset wollf-sft-v9 (el archivo exacto sobre el que entreno el modelo). Cada fila de wolf del conjunto fue verificada por la cadena de herramientas de wolf antes de conservarse, lo que garantiza que los ejemplos de entrenamiento compilan y se comportan segun lo esperado. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO. El modelo se entreno el 26 de octubre de 2026, antes del sellado de los conjuntos de evaluacion heldout-v4.1 (29 de octubre de 2026) y heldout-v4.2 (30 de octubre de 2026), y el guard de solapamiento del proyecto no encuentra colisiones entre el archivo de entrenamiento y los 936 textos de v4.2.

## Capacidades

- Generacion de codigo en el lenguaje wolf, incluyendo tareas de una sola regla y cierres (closeouts) que requieren reparar un programa hasta cumplir una regla concreta.
- Mantenimiento de la habilidad general de programacion heredada de Qwen3.8-27B, segun la intencion declarada del proyecto de no degradar el rendimiento general.
- Generacion de texto conversacional (tag `conversational` en el repo).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (existe un conjunto de evaluacion `agentic-v1`, pero no se detallan sus resultados en la informacion disponible).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidad especial: escritura de un lenguaje de programacion compilado de nueva creacion ausente del preentrenamiento de cualquier modelo base.

## Casos de uso

- Generacion de codigo wolf en produccion: el modelo puede producir programas en wolf que se compilan y ejecutan con la cadena de herramientas oficial (wolf 0.2.35 con lupin 0.1.36), lo que permite integrarlo en pipelines que validan el codigo generado antes de aceptarlo.
- Reparacion automatica de programas wolf: los closeouts (tareas T4) consisten en tomar un programa existente y repararlo hasta que cumpla una regla nombrada; el modelo alcanza 20 de 20 en pass@3 en todas las semillas, lo que lo hace adecuado para tareas de correccion acotada.
- Asistente de desarrollo para el ecosistema wolf: dado que ningun modelo base conoce el lenguaje, un asistente especializado resulta util para autocompletar, explicar y transformar codigo wolf en editores o herramientas internas.
- Generacion de ejemplos y tests para el propio lenguaje: el modelo puede producir programas wolf validos que sirvan como casos de prueba o material didactico, siempre que se validen con el compilador.
- Migracion o traduccion de fragmentos de codigo hacia wolf: con la cautela de validar cada salida con la cadena de herramientas, el modelo puede proponer equivalentes en wolf de logicas descritas en lenguaje natural o en otros lenguajes.
- Investigacion sobre adquisicion de lenguajes ausentes del preentrenamiento: el modelo y su dataset asociado (wollf-sft-v9) sirven como caso de estudio reproducible de ajuste QLoRA para incorporar dominios completamente nuevos a un modelo de ~27B.
- Evaluacion comparativa de tecnicas de ajuste: al publicarse junto a wollf-v7sf3 y wollf-v9-q36 (mismo dataset y receta sobre Qwen3.6-27B), permite comparar el efecto del modelo base y de la generacion del corpus en tareas held-out.

## Benchmarks y rendimiento

Los resultados publicados se miden sobre el instrumento heldout-v4.2 (140 items de wolf en cuatro niveles mas 136 items generales de heldout-v3.3), con pass@3 y tres semillas de decodificacion (20261027, 20261028, 20261029; una muestra a temperatura 0 y dos a 0.6 con top-p 0.95). Las respuestas de wolf se compilan y prueban con el compilador wolf 0.2.35 en un contenedor sin red y sin privilegios; el criterio de aprobado es el comportamiento (tests fijos, `main` saliendo con 0 y las reglas del item), y el formato se reporta aparte sin condicionar la nota.

| heldout-v4.2, pass@3 (behave@1) | n | Qwen3.8-27B base | wollf-v7sf3 (mediana) | wollf-v9-q38 (semillas 1/2/3) |
|---|---|---|---|---|
| T3, tareas de una regla | 40 | 9 (8) | 16 (banda 4) | 32 (31) / 35 (31) / 32 (31), mediana 32 |
| T4, closeouts | 20 | 4 (3) | 14 (banda 4) | 20 (20) / 20 (20) / 20 (20) |

Notas sobre la lectura de la tabla: las barras son las medianas de wollf-v7sf3 y la banda de su dispersion entre semillas, fijadas antes de que existiera ninguna respuesta de v4.2. El nivel T2 (40 items de libreria) no cumplio la regla de gate y no se reporta como nota; wollf-v9-q38 no se ejecuto sobre el. El base Qwen3.6-27B lee 4 (2) en T3 y 3 (2) en T4. En T3, q38 supera la mediana de v7sf3 en +4,0, +4,75 y +4,0 bandas, y cada semilla de q38 queda por encima de la mejor semilla de su hermano wollf-v9-q36 (24, 26, 28). T4 esta en su techo para ambos modelos entrenados con corpus-v9, por lo que no puede ordenarlos entre si. El formato (fmt@1) se situa en 39-40 de 40 en T3 y 20 de 20 en T4 en todas las ejecuciones de q38.

En el guard de regresion heldout-v3.3, los 40 programas wolf de T1 se leen contra las barras fijadas sobre v3.2; en la informacion disponible no se detallan los valores numericos de q38 en ese nivel. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el merge en bf16 de ~27,8B parametros requiere aproximadamente 56 GB solo para pesos, mas overhead de contexto y cache KV; la cuantizacion Q8_0 ronda los 28-30 GB y la Q6_K_L alrededor de 21-23 GB (estimaciones a partir del tamano de parametros, no publicadas en la model card).
- GPU recomendadas: H100 80 GB para el modelo completo en bf16 o Q8_0 con holgura; A100 80 GB equivalente.
- GPU de consumo: el Q6_K_L puede caber en una RTX 3090 Ti o RTX 4090 de 24 GB, aunque con margen ajustado para contexto; el proyecto midio todas las notas de la model card sobre el Q6_K_L con llama-server y el modelo completo en GPU.
- Opciones de despliegue: llama.cpp (llama-server, commit `6f4f53f2b` usado en el perfil `rented-card`), con soporte para los GGUF Q6_K_L y Q8_0 publicados; transformers para el merge en safetensors y el adaptador QLoRA. Otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La model card advierte que la decodificacion greedy diverge entre dispositivos en tokens casi empatados, por lo que las comparaciones deben hacerse sirviendo los modelos en la misma ventana y en la misma tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | T3 (pass@3) | T4 (pass@3) | Licencia |
|---|---|---|---|---|---|---|
| wollf-v9-q38 | ~27,8B | Qwen3.8-27B | no disponible | 32 (mediana) | 20/20 | apache-2.0 |
| wollf-v9-q36 | no disponible | Qwen3.6-27B | no disponible | 24 / 26 / 28 | no disponible | no disponible |
| wollf-v7sf3 | ~27B (Qwen3.6-27B) | Qwen3.6-27B | no disponible | 16 (mediana) | 14 (mediana) | no disponible |
| Qwen3.8-27B base | ~27,8B | - | no disponible | 9 | 4 | no disponible |

La comparativa se limita a los modelos del propio proyecto y al base sin entrenar, ya que no se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada. wollf-v9-q36 usa el mismo dataset y receta sobre Qwen3.6-27B, lo que aísla el efecto del modelo base; wollf-v7sf3 es la generacion anterior del modelo de referencia.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar tareas de contexto largo con garantias.
- Riesgo de alucinacion en la sintaxis de wolf: aunque el modelo se entrena con filas validadas por la cadena de herramientas, cualquier codigo generado en produccion debe compilarse y probarse con el compilador oficial antes de aceptarse.
- T4 esta en su techo para los modelos entrenados con corpus-v9, por lo que no sirve para ordenar q38 frente a q36 ni frente a futuros modelos; las respuestas greedy de T4 son reparaciones pequenas (similitud mediana de 0,93 con el programa dado), no reescrituras.
- El nivel T3 no es una muestra fresca del nivel: sus 40 items son los de heldout-v4.1, el piloto que los selecciono.
- Las semillas reportadas son semillas de decodificacion, no de entrenamiento; solo existe un entrenamiento de wollf-v9-q38.
- La decodificacion greedy puede divergir entre dispositivos en tokens casi empatados, por lo que las comparaciones de rendimiento deben hacerse en la misma tarjeta y ventana.
- Licencia Apache 2.0: permite uso comercial, pero el proyecto no ofrece garantias sobre el comportamiento del modelo en dominios ajenos a wolf; el modelo base Qwen conserva su propio archivo de licencia en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion externa practicamente nula y ausencia de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wolffe-lang/wollf-v9-q38
- Modelo anterior (wollf-v7sf3): https://huggingface.co/wolffe-lang/wollf-v7sf3
- Dataset de entrenamiento: https://huggingface.co/datasets/wolffe-lang/wollf-sft-v9
- Repositorio del lenguaje wolf: https://github.com/wolffe-lang
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
