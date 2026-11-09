# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step60

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un ajuste fino (fine-tune) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza la politica del modelo frente a una recompensa calculada por un modelo juez. El checkpoint publicado corresponde al paso 60 de optimizador (iteracion nativa 59, indexada desde cero) de una ejecucion registrada con hiperparametros concretos: learning rate 1e-6, coeficiente KL 0.001, 16 prompts por actualizacion y 8 respuestas por prompt.

El modelo conserva la arquitectura y las capacidades del Qwen3.5-4B original: es un modelo image-text-to-text, por lo que procesa entradas multimodales (imagen y texto) y genera texto. Cuenta con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones) y un repositorio de 9,3 GB en formato safetensors. El entrenamiento se realizo sobre los conjuntos de datos UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915, con puntuacion de un profesor Qwen3.8-27B y una referencia congelada del modelo original.

La relevancia de esta publicacion es doble: por un lado, demuestra un flujo completo de safety-tuning con RL sobre un modelo multimodal de tamano medio; por otro, documenta de forma inusualmente transparente la linaje del entrenamiento (revision base, nombre de la ejecucion, iteracion del checkpoint nativo y verificacion de la conversion). No obstante, la model card no declara ninguna metrica de evaluacion, por lo que su rendimiento real en tareas de seguridad o utilidad no esta cuantificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; incluye torre de vision y modulo MTP (multi-token prediction) no entrenado |
| Parametros totales | 4.659.865.088 (aprox. 4,66 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con pipeline image-text-to-text. La model card indica que todos los tensores de texto entrenados se exportaron desde el checkpoint nativo, mientras que los tensores de vision y los tensores MTP (multi-token prediction) no entrenados se conservaron del modelo base fijado; el modulo MTP no fue entrenado. La conversion se verifico mediante conversion inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

El ajuste se realizo con GRPO sobre prompts del dataset STAR, usando un profesor Qwen3.8-27B para puntuar las respuestas y una referencia congelada del modelo original (lo que explica el termino KL en la configuracion). Los hiperparametros registrados son: learning rate 1e-6, coeficiente KL 0.001, 16 prompts por actualizacion, 8 respuestas por prompt y 60 actualizaciones de optimizador completadas. La ejecucion de origen se denomina `qwen35-star-grpo-4gpu-save30-a100j16-judgefooter-20261107-v6`, lo que sugiere entrenamiento en 4 GPU A100. La model card senala un cambio en el prompt de pie de juez tras la actualizacion 44 y una reanudacion desde el paso 90 que acepta un JSON de puntuacion plano final tras la prosa del profesor; estos checkpoints pertenecen a esa linaje de entrenamiento registrada. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de entradas multimodales imagen-texto (pipeline image-text-to-text), con torre de vision conservada del modelo base.
- Razonamiento y respuesta a prompts de seguridad, objeto especifico del ajuste con GRPO.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (probablemente heredado del base, pero no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking explicito, vision avanzada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion y filtrado de contenido multimodal: el modelo puede evaluar pares imagen-texto y generar respuestas alineadas con criterios de seguridad, aprovechando el ajuste GRPO sobre prompts STAR para reducir respuestas daninas.
- Investigacion en alineamiento de seguridad: sirve como checkpoint intermedio (paso 60) para estudiar la evolucion de la politica durante el entrenamiento GRPO con profesor y referencia KL, comparandolo con el modelo base y con checkpoints posteriores de la misma ejecucion.
- Generacion de descripciones de imagen con sesgo de seguridad: en aplicaciones de captioning o asistencia visual donde se requiere evitar contenido sensible, el ajuste puede reducir la probabilidad de descripciones inapropiadas.
- Prototipado de asistentes conversacionales multimodales: con 4,66 mil millones de parametros, el modelo es desplegable en una sola GPU de gama alta para pruebas de concepto de chatbots que reciben imagenes y texto.
- Evaluacion comparativa de tecnicas de RLHF/GRPO: al estar documentados los hiperparametros y la linaje, permite reproducir o contrastar experimentos de safety-tuning con profesor de mayor tamano (Qwen3.8-27B).
- Base para ajustes posteriores especificos de dominio: al conservar la licencia Apache 2.0 y los pesos en safetensors, puede servir como punto de partida para fine-tuning supervisado en tareas concretas con requisitos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman puntuaciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,3 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 5 GB para pesos; con 4 bits, alrededor de 3 GB, aunque no se han publicado pesos cuantizados en el repositorio.
- GPU recomendadas: A100 (usada en el entrenamiento, 4 GPU), H100, L40S o RTX 4090 para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 y en GPUs de 12-16 GB si se cuantiza; no se confirma soporte de cuantizacion en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4,66 B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | image-text-to-text | no disponible en la informacion | Hugging Face |
| Qwen3.8-27B (profesor usado en el entrenamiento) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | referenciado en la model card |

No se dispone de datos de rendimiento comparativo ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion: no hay evidencia cuantitativa de que el ajuste mejore la seguridad sin degradar la utilidad, ni de posibles regresiones en capacidades del modelo base.
- Checkpoint intermedio: corresponde al paso 60 de optimizador de una ejecucion que continuo (se menciona reanudacion desde el paso 90), por lo que no representa necesariamente el estado final del entrenamiento.
- El modulo MTP no fue entrenado y los tensores de vision se conservan del base; el ajuste afecta unicamente a los tensores de texto, lo que puede generar desalineacion entre percepcion visual y politica de texto.
- Cambio de prompt de juez a mitad del entrenamiento (tras la actualizacion 44): introduce heterogeneidad en la senal de recompensa que puede afectar a la consistencia de la politica aprendida.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar del modelo base, es probable que arrastre sus sesgos, pero no se documenta.
- Riesgo de alucinacion: no cuantificado; el ajuste con RL sobre seguridad no elimina la generacion de contenido factualmente incorrecto.
- Idiomas soportados: no declarados; no se garantiza un comportamiento multilingue adecuado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Uso en produccion: al no existir evaluaciones independientes, no se recomienda desplegarlo en entornos criticos sin una bateria propia de pruebas de seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
- Paper de GRPO (referencia metodologica): no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
