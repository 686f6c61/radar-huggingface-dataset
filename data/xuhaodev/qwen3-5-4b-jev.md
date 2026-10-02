# xuhaodev/Qwen3.5-4B-Jev

## Resumen

Qwen3.5-4B-Jev es un adaptador LoRA publicado por xuhaodev sobre el modelo base Qwen/Qwen3.5-4B, concebido no como un modelo generativo sino como un modelo de decision con prefill unico. Su funcion es recibir un estado textual, unas instrucciones y un conjunto completo de criterios, y devolver decisiones tipadas: Choice (distribucion sobre candidatos y argmax), Score (distribucion ordinal y nivel esperado) y Noul (probabilidad de la interpretacion verdadera frente a la falsa). No decodifica tokens de respuesta ni genera JSON: reutiliza el ultimo estado oculto valido del backbone, lo pasa por una cabeza escalar en FP32 y ensambla la respuesta en codigo.

Tecnicamente es un fine-tuning local sobre el backbone multimodal de Qwen3.5-4B, cargado en NF4 4-bit con doble cuantizacion y computo en BF16, con un LoRA de rango 16 sobre el modelo congelado. El repositorio (0,1 GB) contiene el adaptador, la cabeza escalar, el procesador, temperaturas calibradas y codigo de inferencia independiente; los pesos base se descargan aparte. La licencia es Apache 2.0 y los idiomas declarados son chino e ingles.

Su relevancia actual es de nicho pero clara: propone un patron de inferencia de baja latencia y sin generacion libre para tareas de decision estructurada (clasificacion de intencion implicita, puntuacion ordinal, verificacion de hipotesis), con una evaluacion publica acotada: 99/100 de acuerdo con la referencia en el benchmark jev-benchmark v1.0.0 y 10/10 pares de contraste de contexto superados. El autor advierte que ese resultado corresponde a un diagnostico chino de 100 items de intencion implicita y no a una precision de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer multimodal (Qwen3.5-4B congelado) + adaptador LoRA sobre el backbone + cabeza escalar FP32; inferencia prefill-only, sin decodificacion de tokens |
| Parametros totales | Base: aproximadamente 4B nominales (una ficha de terceros de Qwen3.5-4B indica 4,7B). Adaptador: 32.467.456 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion y computo en BF16 para el modelo base; adaptador LoRA y cabeza escalar en FP32/BF16 segun modulo |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), cabeza escalar FP32 y modulos Python de inferencia; no se publica GGUF |

Otros datos tecnicos declarados: revision del modelo base fijada en `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`; LoRA con rango 16, alpha 32 y dropout 0,05; identificador de API `qwen35-4b-jev-v1`; tamano del repositorio 0,1 GB; fecha de creacion 2026-10-01.

## Arquitectura y entrenamiento

El pipeline es: estado + instrucciones + criterios completos + candidato, pasado por el Qwen3.5-4B congelado en NF4 mas el LoRA de lenguaje; se toma el ultimo estado oculto valido y se aplica una cabeza escalar FP32; despues, softmax por pregunta con temperatura calibrada y ensamblado tipado de la respuesta en codigo. Los criterios completos se incluyen en cada entrada candidata, lo que difiere del enfoque de LLM2Jev, que hace puntuacion si/no independiente con normalizacion posterior. La metrica de confianza publicada es `1 − H(p)/log(K)`, una estadistica de concentracion, no una probabilidad calibrada de acierto.

El entrenamiento uso 6.000 preguntas: 2.449 referencias semanticas y 3.551 reglas verificables por programa. Los conjuntos de desarrollo, calibracion y test interno son de 600 preguntas cada uno, con separacion de fuentes por grupos. Se entrenaron 2 epocas con 750 actualizaciones del optimizador y acumulacion de 16 preguntas, con tasas de aprendizaje de 1e-5 para el LoRA y 5e-5 para la cabeza escalar. El objetivo combina entropia cruzada sobre candidatos, perdida ordinal para Score y consistencia entre vistas equivalentes verificadas; el checkpoint seleccionado es el de la epoca 2 segun NLL macro por familia y primitiva en desarrollo. Los datos semanticos proceden de registros sinteticos revisados generados con GPT-6 Luna, Grok 4.7 y GPT-6 Sol: son referencias de profesor, no anotaciones humanas nuevas. Los registros de entrenamiento en bruto no se distribuyen. El benchmark publico quedo excluido de entrenamiento, seleccion de checkpoint y calibracion, con bloqueo por hash antes de la ejecucion final de 100 peticiones, aunque el autor reconoce que no puede descartar exposicion del benchmark durante el preentrenamiento del modelo base.

## Capacidades

- Decision estructurada tipada con tres primitivas: Choice (distribucion sobre candidatos y argmax), Score (distribucion por niveles ordenados y nivel esperado empezando en 0) y Noul (probabilidad de la interpretacion verdadera mediante puntuacion de candidatos falsos/verdaderos).
- Entrada en formato de estado textual: cadenas de texto y estados en JSON.
- Inferencia prefill-only: una unica pasada hacia delante, sin generacion de tokens, sin JSON generado y sin probabilidades numericas autodeclaradas por el modelo.
- Consistencia de contexto: los pares de contraste con misma frase final se resuelven correctamente en 10 de 10 casos segun la evaluacion publicada.
- Soporte de criterios explicitos por pregunta (mapas etiqueta-descripcion para Choice, listas ordenadas para Score).
- Idiomas: chino e ingles declarados.
- No soporta, en esta version, entrada de imagen: la version validada es solo texto, pese a que el backbone base sea multimodal.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso como capacidades del modelo; la cabeza escalar sustituye a la generacion de texto.

## Casos de uso

- Triaje de tickets de atencion al cliente en chino: el modelo recibe el estado del pedido y las preguntas tipadas (por ejemplo, estado de envio como Choice y progreso como Score) y devuelve etiquetas con distribucion, sin generar texto libre. Encaja cuando la salida debe ser una etiqueta consumible por un sistema.
- Clasificacion de intencion implicita en conversaciones: util para inferir lo que el usuario quiere decir cuando no lo explicita, que es precisamente el tipo de diagnostico con el que se valido el modelo.
- Puntuacion ordinal de riesgo o severidad: la primitiva Score devuelve el nivel esperado sobre un orden definido en los criterios, adecuada para colas de moderacion o priorizacion por gravedad.
- Verificacion de hipotesis con la primitiva Noul: dado un enunciado y su negacion, devuelve la probabilidad de la interpretacion verdadera, util como verificador barato dentro de un pipeline mas grande.
- Enrutado de bajo coste en arquitecturas de agentes: al ser prefill-only y no decodificar tokens, la salida es una decision, no una respuesta, lo que permite usarlo como router o juez entre ramas de un agente multi-paso.
- Extraccion estructurada desde estados JSON: con soporte de estados en JSON, se puede alimentar con el estado de un workflow y obtener etiquetas tipadas para persistir en base de datos.
- Auditoria de consistencia contextual: los pares de contraste con misma frase final permiten comprobar si un sistema usa el estado final o se ancla en el historial, aplicable a validacion de pipelines de decision.
- Investigacion sobre cabezas de decision frente a generacion: sirve como referencia reproducible para comparar decision prefill-only contra enfoques de puntuacion si/no independiente como LLM2Jev.

## Benchmarks y rendimiento

Evaluacion publicada en jev-benchmark v1.0.0 (commit `d6308af`), ejecucion completada el 2026-10-01 a las 21:40 UTC. Es un diagnostico chino de 100 items sobre intencion implicita.

| Metrica | Resultado |
|---|---:|
| Acuerdo global con la referencia | 99/100 (99 %) |
| Subconjunto "marriage" | 50/50 |
| Subconjunto "girlfriend-hint" | 49/50 |
| Pares de contraste de contexto (misma frase final, ambos correctos) | 10/10 |

La latencia media, P50 y P95 de decision completa aparece truncada en la model card, por lo que no esta disponible. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Validacion oficial: Linux aarch64, NVIDIA GB10, CUDA 13 y Python 3.12. El autor indica que otras combinaciones de GPU y plataforma no han sido validadas para esta version.
- VRAM estimada para inferencia: no publicada de forma explicita. Como referencia de orden de magnitud, un backbone de aproximadamente 4B en NF4 4-bit ocupa del orden de 2,5 a 3 GB de pesos, mas el adaptador (32,5 M de parametros) y los estados de activacion; una horquilla razonable de trabajo seria de 4 a 8 GB, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: la unica validada es NVIDIA GB10. Para otras GPU (A100, H100, RTX 4090, etc.) no hay validacion publicada.
- GPU de consumo: por tamano, deberia caber en GPU de consumo con 8 GB o mas de VRAM, pero no hay confirmacion oficial para esta release.
- Opciones de despliegue: no se soporta un `AutoModelForCausalLM` generico ni, segun lo publicado, formatos GGUF para llama.cpp u Ollama. El despliegue previsto es el cargador propio `JevModel` del repositorio, con la pila fijada Transformers 5.15.0, PEFT 0.20.0, bitsandbytes 0.50.2 y FLA 0.5.2. No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles. El autor no publica cifras de inferencia para esta release.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Jev | Qwen/Qwen3.5-4B | LoRA + cabeza escalar, prefill-only, criterios completos por candidato | Choice, Score, Noul tipados | Apache 2.0 | Adaptador en HuggingFace; base aparte |
| LLM2Jev | no disponible | Puntuacion si/no independiente con normalizacion | Verificacion si/no | no disponible | Repositorio en GitHub |
| openjev (AlexWortega) | Qwen3.5 | Cross-encoder tipo NLI que lee premisa e hipotesis | Entailment, contradiction, neutral | no disponible | HuggingFace |
| QwenJev (RJMSWD) | Qwen3.5-4B (vision-lenguaje) | Herramienta de juicio visual local, una pasada hacia delante | Opcion y probabilidad | no disponible | GitHub |
| Qwen3.5-4B (base) | — | Modelo multimodal generativo de proposito general | Texto generado | no disponible en la informacion | HuggingFace |

Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita al enfoque y la interfaz de salida. La diferencia clave de Qwen3.5-4B-Jev frente a LLM2Jev es que incluye los criterios completos en cada entrada candidata en lugar de normalizar puntuaciones si/no independientes; frente a openjev, la tarea no es NLI de tres clases sino decision tipada con tres primitivas.

## Limitaciones y advertencias

- Es un modelo de decision, no generativo: no produce texto libre ni JSON generado; cualquier caso de uso que requiera respuesta redactada necesita otro modelo.
- Modelo solo texto en esta version, pese a que el backbone Qwen3.5-4B sea multimodal. No hay validacion de entrada de imagen.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano.
- La metrica de confianza `1 − H(p)/log(K)` es una estadistica de concentracion, no una probabilidad calibrada de acierto; no debe interpretarse como certeza.
- El resultado de 99/100 procede de un diagnostico chino de 100 items de intencion implicita; el propio autor advierte que no representa precision de proposito general.
- Los datos semanticos de entrenamiento son referencias generadas por profesores (GPT-6 Luna, Grok 4.7, GPT-6 Sol), no anotaciones humanas, con el sesgo que ello implica.
- El autor no puede descartar exposicion del benchmark publico durante el preentrenamiento del modelo base.
- Validacion de plataforma muy estrecha: solo Linux aarch64, NVIDIA GB10, CUDA 13 y Python 3.12, con versiones fijadas de Transformers, PEFT, bitsandbytes y FLA.
- El identificador de API (`qwen35-4b-jev-v1`) no coincide con el nombre publico del repositorio (Qwen3.5-4B-Jev).
- Requiere descargar el modelo base por separado y usar el cargador propio; un pipeline generico no reproduce el modelo evaluado.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, cuya licencia no consta en la informacion disponible.
- El repositorio no incluye los registros de entrenamiento en bruto, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xuhaodev/Qwen3.5-4B-Jev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del benchmark: https://github.com/haxudev/jev-benchmark
- Informe de evaluacion: https://github.com/haxudev/jev-benchmark/blob/main/results/qwen35-4b-report.md
- Resultados en bruto: `evaluation/jev-benchmark.json` (dentro del repositorio del benchmark)
- Commit del benchmark: https://github.com/haxudev/jev-benchmark/tree/d6308af55b0331f56558203606ec8f1057ca61a6
- LLM2Jev: https://github.com/Yinsongxu/LLM2Jev
- Primitivas de TypeSafe: https://docs.typesafe.ai/introduction
- QwenJev (RJMSWD): https://github.com/RJMSWD/QwenJev/tree/main/
- openjev (AlexWortega): https://huggingface.co/AlexWortega/openjev
- Ficha de terceros de Qwen3.5-4B: https://theapplied.co/models/qwen-qwen3-5-4b
- Qwen3-4B en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
