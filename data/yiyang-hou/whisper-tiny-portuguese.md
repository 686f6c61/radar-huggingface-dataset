# Yiyang-hou/whisper-tiny-portuguese

## Resumen

Whisper tiny Portuguese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Yiyang-hou en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Whisper de OpenAI, en su variante mas pequena, y entrenado sobre el dataset naharte/portuguese_english. El objetivo declarado es adaptar el modelo base a un dominio linguistico concreto que combina portugues e ingles.

El modelo cuenta con 37.760.640 parametros totales, un tamano de repositorio de 0,3 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Es relevante por su ligereza extrema, que lo hace apto para despliegues en entornos con recursos limitados, aunque su rendimiento y alcance estan acotados por el tamano del modelo base y por la escasa documentacion proporcionada por el autor.

La model card es practicamente auto-generada por el Trainer de Hugging Face, sin descripcion de uso previsto, limitaciones ni composicion del dataset. El unico resultado reportado es un WER de 11,9292 sobre el conjunto de evaluacion, no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (portugues implicito por el dataset de entrenamiento, no declarado oficialmente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio. El modelo base es openai/whisper-tiny, que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. No se dispone de informacion sobre modificaciones arquitectonicas respecto al modelo original.

El ajuste fino se realizo sobre el dataset naharte/portuguese_english con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El numero de tokens de audio de entrenamiento y la composicion exacta del dataset no estan disponibles.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto).
- Entrenado sobre un dataset que combina portugues e ingles, aunque el campo de idioma oficial solo declara `en`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de traduccion explicita, aunque Whisper base la soporta de forma nativa.
- No se documenta capacidad de vision ni audio mas alla del ASR.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Transcripcion de audio en portugues e ingles: el modelo puede transcribir grabaciones en entornos donde ambos idiomas coexisten, gracias al ajuste sobre el dataset naharte/portuguese_english, aunque el WER reportado de 11,93 % limita su uso a contextos tolerantes a errores.
- Prototipado rapido de pipelines ASR: con 37,7 millones de parametros y 0,3 GB de repo, es adecuado para validar arquitecturas y flujos de transcripcion antes de escalar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: su tamano permite ejecucion en CPU o GPU de gama baja, util para aplicaciones embebidas o edge computing donde no cabe un modelo mayor.
- Subtitulado automatico de contenido bilingue portugues-ingles: puede generar transcripciones preliminares que luego se revisan manualmente, aprovechando la ventana de 30 s de Whisper.
- Generacion de datos etiquetados para entrenamiento: las transcripciones pueden servir como pseudo-etiquetas para pre-anotar corpus de audio en portugues e ingles.
- Educacion e investigacion: util como caso de estudio de fine-tuning de Whisper en dominios bilingues, dado que la model card documenta hiperparametros y curva de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/portuguese_english (split train) | WER | 11,9292 |
| Entrenamiento | naharte/portuguese_english | Validation loss | 0,2545 |

Evolucion del entrenamiento reportada:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,2477 | 0,9217 | 1000 | 0,2720 | 12,8239 |
| 0,1170 | 1,8433 | 2000 | 0,2545 | 11,9292 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 M de parametros); en la practica, el cuello de botella es el buffer de audio, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; tambien cabe en GPUs de gama baja y en Apple Silicon.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs integradas y dispositivos edge.
- Opciones de despliegue: transformers (libreria nativa), vLLM no aplica de forma estandar para ASR, llama.cpp no soporta Whisper directamente, Ollama no soporta ASR de Whisper de forma nativa; se puede usar faster-whisper o whisper.cpp con conversion de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad | WER reportado |
|---|---|---|---|---|---|
| Yiyang-hou/whisper-tiny-portuguese | 37,7 M | 30 s (heredado) | apache-2.0 | Hugging Face | 11,93 (dataset propio) |
| openai/whisper-tiny | 39 M aprox. | 30 s | apache-2.0 | Hugging Face / OpenAI | no disponible en esta ficha |
| openai/whisper-base | 74 M aprox. | 30 s | apache-2.0 | Hugging Face / OpenAI | no disponible en esta ficha |
| openai/whisper-small | 244 M aprox. | 30 s | apache-2.0 | Hugging Face / OpenAI | no disponible en esta ficha |

Los datos de parametros de los modelos OpenAI son aproximados y no se han verificado en la informacion proporcionada; el WER de los modelos base no se incluye porque no se dispone de cifras en esta ficha. La comparacion directa de WER no es valida porque el resultado de 11,93 corresponde a un dataset especifico (naharte/portuguese_english) y no al benchmark estandar de Whisper.

## Limitaciones y advertencias

- Model card practicamente auto-generada: no hay descripcion de uso previsto, limitaciones ni composicion del dataset, lo que dificulta evaluar su robustez.
- WER de 11,93 % no verificado de forma independiente; puede no generalizar a otros dominios, acentos o condiciones acusticas.
- El campo de idioma oficial solo declara `en`, aunque el dataset de entrenamiento incluya portugues; el soporte real de portugues no esta garantizado ni documentado.
- Riesgo de alucinacion en transcripciones, comun en modelos Whisper de tamano tiny, especialmente con audio ruidoso o silencios largos.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden evaluar sesgos demograficos, dialectales o de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No apto para produccion critica sin una evaluacion propia sobre el dominio objetivo.
- El contexto de audio esta limitado a ventanas de 30 s por la arquitectura Whisper tiny heredada.

## Enlaces

- Hugging Face: https://huggingface.co/Yiyang-hou/whisper-tiny-portuguese
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/naharte/portuguese_english
- Paper de Whisper (referencia del modelo base): no disponible en la informacion proporcionada
- Repositorio de OpenAI Whisper: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
