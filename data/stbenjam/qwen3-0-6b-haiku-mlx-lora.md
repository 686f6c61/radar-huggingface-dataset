# stbenjam/qwen3-0.6b-haiku-mlx-lora

## Resumen

stbenjam/qwen3-0.6b-haiku-mlx-lora es un adaptador LoRA en formato MLX entrenado sobre Qwen/Qwen3-0.6B cuyo unico objetivo es responder con versos de tres lineas de estilo haiku. No es un modelo autonomo ni un adaptador en formato PEFT: requiere los pesos originales de Qwen3-0.6B y se carga con MLX LM en Apple Silicon. Lo publica el usuario stbenjam como experimento educativo de post-entrenamiento local, con licencia Apache-2.0 y espacio de parametros heredado del modelo base (aproximadamente 0,6 mil millones).

El problema que aborda no es de capacidad general, sino de transferencia de estilo: conseguir que un modelo pequeno y sin instruccion de estilo en tiempo de inferencia produzca sistematicamente una forma poetica concreta. El autor lo plantea explicitamente como una demostracion de "haiku-ish", no como un asistente fiable. Su relevancia es, por tanto, metodologica: documenta el pipeline completo (dataset, hiperparametros, seleccion de checkpoint, evaluacion, artefactos de atribucion) de un ajuste LoRA de rango 16 sobre las ultimas 16 capas, reproducible en un unico equipo M4 Pro con 48 GB de memoria unificada.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB y fecha de creacion 2026-09-11. La model card es inusualmente detallada en cuanto a limitaciones y trazabilidad, e incluye el SHA-256 del adaptador. Existe tambien un repositorio hermano con la version GGUF fusionada para su uso con Ollama sin Python ni MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16) sobre Qwen/Qwen3-0.6B; la model card no detalla la arquitectura interna del base |
| Parametros totales | Aproximadamente 0,6 mil millones (heredados de Qwen3-0.6B); numero exacto de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible en este repositorio; el repositorio hermano GGUF publica una version Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador y codigo); el dataset externo davanstrien/haiku_dpo conserva CC BY 4.0 |
| Formato de pesos | MLX LoRA (no compatible directamente con Transformers/PEFT); existe version GGUF fusionada en repositorio aparte |
| Modelo base | Qwen/Qwen3-0.6B, revision c1899de289a04d12100db370d81485cdf75e47ca |
| Libreria | mlx (probado con MLX LM 0.31.3 y MLX 0.32.2) |
| SHA-256 del adaptador | 786d17f419c43cdae57c7886464000a1d73bf6260acdb3f21cf1224a504c3541 |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un ajuste supervisado por LoRA de rango 16 aplicado a las 16 ultimas capas del modelo denso Qwen3-0.6B. El conjunto de entrenamiento consta de 6.336 ejemplos sinteticos (6.080 poemas distintos) y 112 ejemplos de validacion. Los hiperparametros declarados son batch size 8, learning rate 0,00005, dropout 0,05 y semilla 174. Se entrenaron 1.000 actualizaciones y se selecciono la actualizacion 750 en funcion de la perdida de validacion, registrada en `selection.json`. El entrenamiento se ejecuto localmente en un Apple M4 Pro con 48 GB de memoria unificada.

Los datos de entrenamiento combinan ejemplos sinteticos originales con un subconjunto filtrado y modificado del dataset Haiku DPO de Daniel van Strien (CC BY 4.0). Las modificaciones declaradas incluyen reescritura de prompts de haiku explicitos, filtrado silabico, deduplicacion, agrupacion por tema, muestreo y mezcla con ejemplos locales; los detalles estan en `ATTRIBUTION.md` y `training-data-manifest.json`. No se menciona RLHF ni DPO en esta fase: el estilo proviene de fine-tuning supervisado, sin instruccion de estilo en tiempo de inferencia, y el prompt de sistema por defecto es `You are a helpful assistant.` Es obligatorio el modo sin pensamiento (non-thinking) para que la inferencia coincida con el entrenamiento.

## Capacidades

- Generacion de texto breve con forma de haiku: tres lineas, con tendencia a la estructura 5-7-5.
- Transferencia de estilo aprendida por fine-tuning supervisado, sin necesidad de instruccion de estilo en el prompt.
- Respuesta a prompts de una sola interaccion (single-turn) en ingles.
- Funcionamiento en modo sin pensamiento (non-thinking), que es el unico modo coherente con el entrenamiento.
- Memoria conversacional experimental en el script de demostracion mediante `--history` y `/reset`, que modifica el prompt y no los pesos.
- Encaje en el ecosistema MLX LM para inferencia en Apple Silicon, con posibilidad de usar la version GGUF fusionada en Ollama.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni acceso a informacion en vivo.
- No incluye posprocesado de salida que fuerce la forma deseada: el resultado es "haiku-ish", sin garantia de metrica correcta.

## Casos de uso

- Demostracion educativa de post-entrenamiento: el repositorio incluye scripts de entrenamiento, evaluacion y chat con terminal en color, lo que permite reproducir de principio a fin un ajuste LoRA en un solo equipo Apple Silicon.
- Ensenanza de transferencia de estilo: sirve como caso de estudio de como un modelo de 0,6 mil millones adopta una forma poetica concreta mediante SFT, comparando el comportamiento del base (1/32 respuestas de tres lineas) con el del adaptador (30/32).
- Prototipado rapido de adaptadores MLX: es una plantilla util para validar un pipeline de LoRA de rango bajo sobre las ultimas capas antes de escalar a modelos mayores o a datasets mas grandes.
- Generacion de contenido poetico corto para aplicaciones de escritura creativa: puede producir borradores de tres lineas en ingles que un humano revise despues, siempre que no se exija relevancia tematica estricta.
- Pruebas de integracion de MLX y Ollama en local: el par de repositorios (adaptador MLX y GGUF Q8_0) permite comparar dos rutas de despliegue sin GPU dedicada ni servicios en la nube.
- Evaluacion de tecnicas de medicion de estilo: el criterio de verificacion por diccionario de silabas y el recuento de lineas sobre 32 prompts nuevos ofrecen una metodologia replicable para medir adherencia a una forma fija.
- Material docente sobre atribucion y licencias: el repositorio documenta la mezcla de un dataset externo CC BY 4.0 con datos propios, un ejemplo practico de trazabilidad de datos en publicaciones de modelos.

## Benchmarks y rendimiento

La model card publica una evaluacion interna sobre 32 prompts nuevos de un solo turno con decodificacion greedy. No son benchmarks estandar y no se comparan con MMLU, HumanEval o GSM8K.

| Metrica (32 prompts, greedy) | Qwen3-0.6B base | Adaptador haiku |
|---|---|---|
| Respuestas con tres lineas | 1/32 | 30/32 |
| Estructura 5-7-5 verificada por diccionario | 0/32 | 3/32 |

El propio autor advierte que el muestreo usado en el chat difiere del benchmark greedy, por lo que estos numeros no son extrapolables a la experiencia conversacional. En el resto de categorias de evaluacion: no se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: Apple M4 Pro con 48 GB de memoria unificada, ejecutado en local.
- Inferencia: exclusivamente en Apple Silicon mediante MLX (MLX 0.32.2 y MLX LM 0.31.3 probados). No se documenta soporte en CUDA.
- VRAM estimada: al tratarse de un adaptador sobre un modelo de aproximadamente 0,6 mil millones de parametros, el peso completo en 4 bits ocupa del orden de 0,4-0,5 GB y en precision de 16 bits alrededor de 1,2-1,3 GB; estas cifras son estimaciones orientativas y no aparecen en la model card.
- GPU consumer: por tamano, cabe sin dificultad en cualquier GPU consumer moderna, pero el repositorio solo esta preparado para MLX; para rutas fuera de Apple Silicon hay que usar la version GGUF del repositorio hermano.
- Despliegue: MLX LM para el adaptador; Ollama con `ollama run hf.co/stbenjam/qwen3-0.6b-haiku-gguf:Q8_0` para la version fusionada. No se mencionan vLLM, TGI ni llama.cpp en la documentacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay otros adaptadores de estilo haiku comparables identificados en la informacion disponible. La comparacion mas informativa es contra el propio modelo base y contra la variante empaquetada.

| Modelo | Parametros | Formato | Contexto | Rendimiento en la tarea | Licencia |
|---|---|---|---|---|---|
| stbenjam/qwen3-0.6b-haiku-mlx-lora | ~0,6 B (adaptador LoRA r16) | MLX LoRA | no disponible | 30/32 con tres lineas; 3/32 con 5-7-5 | Apache-2.0 |
| stbenjam/qwen3-0.6b-haiku-gguf | ~0,6 B (pesos fusionados) | GGUF, Q8_0 | no disponible | mismo adaptador fusionado, metricas no publicadas por separado | Apache-2.0 |
| Qwen/Qwen3-0.6B | ~0,6 B | safetensors | no disponible en la informacion proporcionada | 1/32 con tres lineas; 0/32 con 5-7-5 | Apache-2.0 |

Frente a modelos generalistas del mismo orden de parametros, la diferencia no esta en capacidad sino en especializacion: este adaptador solo es competitivo en la produccion de verso de tres lineas en ingles.

## Limitaciones y advertencias

- Es un experimento educativo de estilo, no un asistente general fiable; el autor lo declara de forma explicita.
- Puede inventar hechos, ya que no dispone de herramientas ni de informacion en vivo.
- No hay posprocesado que fuerce la forma poética: la metrica 5-7-5 solo se verifico en 3 de 32 prompts, por lo que la mayoria de las respuestas son aproximaciones.
- Solo funciona en ingles (idioma declarado: en); no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No es un adaptador PEFT: no se carga directamente con Transformers/PEFT y requiere los pesos de Qwen3-0.6B en una revision concreta y MLX LM en Apple Silicon.
- El modo de pensamiento (thinking) debe permanecer desactivado; usarlo rompe la coincidencia con el entrenamiento.
- La memoria conversacional es experimental y se implementa alterando el prompt, no los pesos; el script abre cada mensaje en limpio por defecto para evitar que copie poemas o ensayos anteriores.
- Los datos externos de haiku conservan su licencia CC BY 4.0, con obligaciones de atribucion separadas de la Apache-2.0 del adaptador; el repositorio no implica respaldo de Qwen, Anthropic ni del creador del dataset.
- Sin descargas ni validacion externa en el momento de la consulta: el rendimiento declarado procede unicamente de la evaluacion del propio autor.
- Longitud de contexto y consumo de memoria no estan documentados, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stbenjam/qwen3-0.6b-haiku-mlx-lora
- Version GGUF para Ollama: https://huggingface.co/stbenjam/qwen3-0.6b-haiku-gguf
- Repositorio con scripts de entrenamiento, evaluacion y chat: https://github.com/stbenjam/posttrain-demo
- Resultados completos y limitaciones: https://github.com/stbenjam/posttrain-demo/blob/main/haiku/RESULTS.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Haiku DPO (CC BY 4.0): https://huggingface.co/datasets/davanstrien/haiku_dpo
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del propio repositorio.
