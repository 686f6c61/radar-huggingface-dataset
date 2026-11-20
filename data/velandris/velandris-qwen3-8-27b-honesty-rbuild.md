# Velandris/Velandris-Qwen3.8-27B-Honesty-RBuild

## Resumen

Velandris Qwen3.8-27B Honesty — R-Build v4.2 es un checkpoint fusionado publicado por Velandris que parte del modelo base `unsloth/Qwen3.8-27B`. El objetivo declarado es reducir la tasa de alucinacion del modelo base mediante un ajuste fino con LoRA sobre un dataset propio de honestidad (Velandris-Honesty-6k), cuyos pesos se han plegado en las matrices del modelo de 16 bits. Sobre esa base se empaquetan ademas los modulos del framework R-Build v4.2 (un panel de cuatro criticos, memoria de pesos rapidos con regla delta y una cabeza de accion CUA), que suman unos 650M de parametros y se almacenan aparte bajo el prefijo `rbuild.`.

El modelo conserva la arquitectura del Qwen3.8-27B original, con 28.457.897.716 parametros totales segun los safetensors del repositorio, y se distribuye como pipeline `image-text-to-text`, lo que indica soporte multimodal de entrada imagen y texto. El foco del proyecto es la calibracion de la abstenccion: en lugar de maximizar la precision bruta, el ajuste desplaza respuestas incorrectas hacia respuestas de "no lo se", y el autor reporta una reduccion de la tasa de alucinacion del 56,8% al 34,2% en su conjunto de evaluacion de 390 preguntas.

Es relevante ahora porque aborda uno de los problemas practicos mas acuciantes en despliegues de produccion: la confianza injustificada del modelo. La contrapartida, documentada por el propio autor, es una mayor cautela en trivia facil (caida de 5 puntos en TriviaQA) y la advertencia de que los modulos R-Build estan inicializados pero sin entrenar, por lo que no alteran la salida de texto. La licencia es propia (Velandris License 1.0), no estandar de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B; modulos R-Build adicionales |
| Parametros totales | 28.457.897.716 (incluye ~650M de modulos R-Build) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en 16 bits, bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Velandris License 1.0 (license: other, license_name: velandris) |
| Formato de pesos | safetensors (18 shards `model-000NN-of-00018.safetensors` + `model-rbuild.safetensors`) |
| Tamano del repositorio | 58,3 GB |
| Modelo base | unsloth/Qwen3.8-27B |
| Dataset de ajuste | Velandris/Velandris-Honesty-6k |
| Framework de modulos | rbuild-engine v4 (RBuildAdaptedModel, V41Config) |

## Arquitectura y entrenamiento

El checkpoint combina dos capas de intervencion. La primera es un LoRA de honestidad (run 2) plegado en las matrices del Qwen3.8-27B completo en 16 bits, entrenado sobre el dataset Velandris-Honesty-6k. La segunda son los modulos de R-Build v4.2, importados desde `hanmuyang1-collab/rbuild-engine@v4` mediante la ruta de conversion no destructiva V4.1 implementada en `RBuildAdaptedModel`. Estos modulos comprenden un panel de cuatro criticos, una memoria de pesos rapidos basada en regla delta y una cabeza de accion CUA, con un total aproximado de 650M de parametros. Al ser modulos separados y no modificaciones de las matrices base, no pueden plegarse en los pesos del transformer y se empaquetan como tensores independientes bajo el prefijo `rbuild.` dentro del mismo `model.safetensors.index.json`.

El autor documenta verificaciones de conversion en `conversion_report.json`: la puerta de liberacion `v41_release_gate` pasa con logits identicos bit a bit entre el modelo base y el envuelto (`exact_base_output: true`), y los tensores R-Build se recargan de forma exacta desde el checkpoint fusionado (`reload_equal: true`). Un smoke test sobre el modelo fusionado respondio correctamente a la capital de Australia y razono con incertidumbre ante una pregunta de poblacion oscura. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO; el autor tampoco detalla innovaciones como decodificacion especulativa o atencion lineal. Es critico subrayar que los pesos de criticos, memoria y CUA estan inicializados pero **sin entrenar**: no modifican la salida de texto y requeririan un proceso de entrenamiento (por ejemplo `RBuildBaseTrainer.fit` o `fit_cua`) para tener efecto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen3.8-27B base.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`, carga via `AutoModelForImageTextToText`).
- Razonamiento calibrado con abstenccion: el ajuste de honestidad favorece respuestas de "no lo se" frente a afirmaciones incorrectas.
- Razonamiento con incertidumbre explicita en preguntas de baja cobertura, segun el smoke test del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la cabeza de accion CUA esta presente pero sin entrenar, por lo que la capacidad de agente no es funcional de serie.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking explicito, vision avanzada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Sistemas de preguntas y respuestas con abstenccion controlada: el modelo esta disenado para admitir desconocimiento en lugar de inventar, lo que lo hace adecuado en dominios donde una respuesta erronea con seguridad aparente es mas costosa que un "no lo se" (soporte documental, asistencia legal informativa, consultas medicas no diagnosticas).
- Moderacion de contenido factual en pipelines de generacion: puede actuar como verificador secundario que marque afirmaciones dudosas antes de publicarlas, aprovechando su sesgo hacia la cautela.
- Asistentes conversacionales en ingles con requisitos de transparencia: la reduccion de alucinacion reportada (34,2% frente a 56,8%) encaja en productos donde la trazabilidad de la incertidumbre es un requisito de confianza.
- Investigacion sobre calibracion y alineacion: el checkpoint sirve como referencia reproducible para estudiar el trade-off entre precision y abstenccion, con una tabla de resultados publicada sobre 390 preguntas.
- Prototipado de pipelines multimodales: al cargar con `AutoModelForImageTextToText`, puede integrarse en flujos que reciben imagenes y texto, siempre que se valide el comportamiento real de la rama de vision del base.
- Base para experimentos con R-Build: el checkpoint incluye los modulos de criticos, memoria y CUA listos para entrenamiento mediante `RBuildBaseTrainer`, lo que permite investigar arquitecturas de memoria de pesos rapidos y paneles de criticos sobre un modelo de 27B ya ajustado en honestidad.
- Evaluacion de riesgo en produccion: util para medir como se comporta un modelo de 27B bajo un regimen de alta abstenccion antes de desplegar variantes mas agresivas.

## Benchmarks y rendimiento

Resultados de honestidad publicados por el autor sobre el conjunto de evaluacion de 390 preguntas respondibles:

| Modelo | Precision | Respuestas incorrectas | Abstenccion | Tasa de alucinacion | Neto |
|---|---|---|---|---|---|
| Base Qwen3.8-27B | 40,0 | 34,1 | 25,9 | 56,8% | +5,9 |
| Velandris Qwen3.8-27B Honesty-RBuild | 39,2 | 20,8 | 40,0 | 34,2% | +18,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la evaluacion la realizo el propio modelo base como juez, por lo que las puntuaciones no proceden de un evaluador independiente. Tambien se reporta una caida de 5 puntos en TriviaQA respecto al base.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 57 GB solo para pesos (28,46B parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica requiere GPUs de 80 GB o multi-GPU.
- Cuantizacion a 8 bits: en torno a 28-30 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen limitado.
- Cuantizacion a 4 bits: en torno a 14-16 GB de pesos, lo que permitiria ejecucion en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado ficheros GGUF ni recetas oficiales de cuantizacion.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; consumer viable solo con cuantizacion agresiva.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText`; para los modulos R-Build es necesario instalar `rbuild-engine@v4` y usar `RBuildAdaptedModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Velandris Qwen3.8-27B Honesty-RBuild | 28,46B | no disponible | Honestidad y abstenccion sobre Qwen3.8-27B | Velandris 1.0 (propia) | Hugging Face, 0 descargas |
| Qwen3.8-27B (base, via unsloth) | ~27B | no disponible | Modelo generalista multimodal | segun Qwen | Hugging Face |
| Alternativas de 27B con foco en alucinacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Mayor cautela en trivia facil: la precision en TriviaQA cae 5 puntos respecto al base, lo que puede percibirse como respuestas evasivas en consultas sencillas.
- Respuestas de "no lo se" imperfectas: algunas respuestas de entrenamiento sugieren referencias que contienen detalles inventados, segun el propio autor.
- Evaluacion autojuzgada: las puntuaciones de honestidad las genero el modelo base como juez, sin evaluador independiente; deben tomarse como indicativas.
- Modulos R-Build sin entrenar: criticos, memoria y CUA estan inicializados pero no entrenados; no aportan capacidades reales hasta que se entrenen con `RBuildBaseTrainer.fit` o `fit_cua`.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta validado.
- Licencia restrictiva: Velandris License 1.0 es una licencia propia, no aprobada por OSI; es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial, ya que los componentes de terceros conservan sus propias licencias.
- Riesgo de alucinacion residual: la tasa reportada es del 34,2%, es decir, aproximadamente un tercio de las preguntas respondibles siguen produciendo respuestas incorrectas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Contexto no documentado: no se especifica la longitud de ventana, lo que impide planificar despliegues con requisitos de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Velandris/Velandris-Qwen3.8-27B-Honesty-RBuild
- LoRA de honestidad (run 2): https://huggingface.co/Velandris/Velandris-Qwen3.8-27B-Honesty-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Dataset de ajuste: https://huggingface.co/datasets/Velandris/Velandris-Honesty-6k
- Repositorio rbuild-engine (rama v4): https://github.com/hanmuyang1-collab/rbuild-engine/tree/v4
- Licencia Velandris 1.0: https://huggingface.co/Velandris/velandris-license/blob/main/LICENSE.md
