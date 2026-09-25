# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantizacion en formato MLX del checkpoint MiMo-V2.6-Distill-Qwen-9B desarrollado por el equipo Xiaomi MiMo. El autor, xunlinkx, ha aplicado su pipeline `omlx` (`quantize_oq_streaming(..., oq_level=5, enhanced=True)`) para generar una build de 5 bits con grupo de cuantizacion de tamano 64 y calibracion mediante importance matrix en bloques de 128x512. El resultado es un artefacto de 9.653.104.368 parametros (7,6 GB en el repositorio) pensado para servir en local sobre Apple Silicon.

La particularidad tecnica del repositorio es el injerto de una cabeza Multi-Token Prediction (MTP). El checkpoint oficial de Xiaomi declara una capa MTP pero no distribuye sus pesos; esta build toma la cabeza MTP nativa del repositorio `mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp` tras verificaciones estrictas de arquitectura, geometria y tokenizer, lo que habilita decodificacion especulativa con una aceleracion declarada de entre 1,5x y 2,0x en Apple Silicon.

El modelo base es un decoder hibrido SSM / atencion lineal (`model_type: qwen3_5`, con Gated DeltaNet) de 9B parametros, obtenido por supervised fine-tuning de Qwen3.5-9B sobre datos generados por la familia MiMo-V2.6. Esta orientado a tareas agente: ingenieria de software, uso de herramientas, codigo visual y ciberseguridad. La licencia es MIT y hereda del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5`: decoder de texto hibrido SSM / atencion lineal (Gated DeltaNet) + 1 capa MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens segun la model card (256K nativos); una fuente externa (featherless.ai) indica 32.768 tokens para el modelo base. Dato contradictorio, no confirmado de forma independiente |
| Tipos de cuantizacion | 5 bits afines (oQ5e), group size 64, calibracion imatrix en bloques 128x512 (249 tensores aplicados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX); no se distribuye GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con capas de atencion lineal tipo Gated DeltaNet combinadas con mecanismos SSM, identificado internamente como `qwen3_5`. Sobre esa arquitectura, el checkpoint MiMo-V2.6-Distill-Qwen-9B se obtuvo por supervised fine-tuning de Qwen3.5-9B sobre datos generados por los modelos mayores de la familia MiMo-V2.6 (Pro y Flash), cubriendo cuatro dominios declarados: ingenieria de software, tareas agente generales, codigo visual y ciberseguridad. No se han facilitado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion de esta build concreta es doble. Por un lado, la cuantizacion oQ5e con calibracion por importance matrix sobre 249 tensores, verificada sin tensores ausentes ni desajustados. Por otro, el injerto de una cabeza MTP compatible procedente de un tercer repositorio, tras comprobar identidad de tokenizer mediante SHA-256 (`06b95093...`) y coincidencia de arquitectura y geometria. La cabeza MTP permite prediccion multi-token y, con el runtime parcheado (`mtp_forward` operativo), decodificacion especulativa. El autor declara una aceleracion de 1,5x a 2,0x, si bien no se aportan mediciones comparativas detalladas frente a la version sin MTP. La validacion incluida reporta 33,7 tokens/s y un pico de memoria de 6,40 GB en una prueba determinista de matematicas.

## Capacidades

- Generacion de texto conversacional con plantilla de chat oficial verificada frente a esquemas de function calling de OpenAI.
- Modo de razonamiento explicito: la model card oficial prescribe cadena de pensamiento mediante etiquetas `<think>...</think>` activada por defecto.
- Tool calling / function calling: el modelo base esta disenado como modelo agente y la plantilla de chat se valido con esquemas de herramientas.
- Tareas agente multi-paso: el SFT se realizo sobre datos orientados a flujos agente generales.
- Generacion y analisis de codigo, con enfasis declarado en ingenieria de software y codigo visual.
- Ciberseguridad: dominio explicitamente cubierto por el entrenamiento del modelo base.
- Decodificacion especulativa mediante cabeza MTP injertada (1,5x-2,0x declarado).
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.
- Vision: no disponible en esta build. Aunque la familia MiMo-V2.6 se describe como omnimodal, los tags de este repositorio son exclusivamente de generacion de texto y la cuantizacion esta etiquetada como `text-generation`.

## Casos de uso

- Servicio de asistencia tecnica en local sobre un Mac: el modelo puede gestionar conversaciones multi-turno con una ventana declarada de 256K tokens, lo que permite adjuntar documentacion extensa o historiales largos sin truncar. El servidor omlx expone una API compatible con OpenAI, de modo que se puede conectar a un frontend existente sin cambios.
- Agente de refactorizacion de codigo en el puesto de trabajo: gracias al soporte de tool calling y a las etiquetas de razonamiento, el modelo puede leer ficheros, proponer parches y encadenar varios pasos de edicion antes de devolver un resultado. La cuantizacion de 5 bits reduce el coste en memoria hasta unos 6-7 GB, viable en un portatil Apple Silicon de gama alta.
- Automatizacion de triaje de alertas de seguridad: el modelo base fue entrenado especificamente en ciberseguridad, por lo que puede clasificar y resumir hallazgos de un SIEM o de un escaneo, generando borradores de informe que un analista revisa despues.
- Analisis de codigo y diagramas en entornos con restricciones de confidencialidad: al ejecutarse integramente en local y sin llamadas a API externas, es apto para equipos que no pueden enviar codigo propietario a servicios en la nube.
- Prototipado rapido de agentes de investigacion: el checkpoint se libera como punto de partida para investigacion en RL sobre agentes, por lo que sirve como base para experimentos de refuerzo con recompensas verificables.
- Generacion asistida en pipelines de documentacion tecnica: con 256K de contexto se puede alimentar un repositorio completo y pedir resumentes, docstrings o guias de arquitectura coherentes con el codigo existente.
- Inferencia de baja latencia en escritorio: la cabeza MTP permite decodificacion especulativa, util en aplicaciones interactivas donde el tiempo hasta el primer token y el throughput por token importan mas que el rendimiento absoluto en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio unicamente reporta una prueba determinista de matematicas ("15% de 240" produce "36") ejecutada a 33,7 tokens/s con un pico de memoria de 6,40 GB durante la validacion local. Las fuentes externas consultadas afirman que el modelo base mejora a Qwen3.5-9B en diversos benchmarks, pero no aportan cifras concretas.

## Requisitos de hardware

- Naturaleza del artefacto: la build solo es compatible con el runtime MLX; no hay pesos GGUF ni safetensors estandar para transformers, por lo que no se puede ejecutar en CUDA ni en CPU x86 con las herramientas habituales.
- Memoria estimada de pesos: aproximadamente 6,6 GB para los 9.653.104.368 parametros a 5 bits mas metadatos (calculo derivado del esquema de cuantizacion, no una medicion oficial). El repositorio ocupa 7,6 GB.
- Memoria pico reportada por el autor: 6,40 GB en la prueba de validacion, con un contexto corto.
- Hardware recomendado: ordenadores Apple Silicon con memoria unificada de 16 GB o superior. Con 16 GB queda poco margen para contexto largo; 32 GB o mas es lo recomendable para aprovechar la ventana de 256K tokens.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto. La cuantizacion y el kernel MTP son especificos de MLX.
- Despliegue: `mlx-lm` para uso por linea de comandos y `omlx` como servidor compatible con la API de OpenAI en `127.0.0.1:8005`. No compatible con vLLM, TGI, llama.cpp ni Ollama.
- Rendimiento declarado: 33,7 tokens/s y 6,40 GB de pico de memoria en la validacion del autor. Con decodificacion especulativa MTP se declara una mejora de 1,5x a 2,0x, aunque sin cifras absolutas de referencia.
- Parametros de muestreo oficiales: temperature 0,6, top_p 0,95, top_k 20, repetition_penalty 1,0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp (este) | 9,65B | 256K declarado (32K segun fuente externa) | 5 bits, group size 64 | Si, injertada | MIT | MLX (mlx-lm, omlx) |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9B aprox. | no disponible | Sin cuantizar | Declara capa MTP, no distribuye pesos | MIT | Checkpoint completo |
| mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp | no disponible | no disponible | 4 bits | Si | no disponible | MLX |
| Qwen3.5-9B (modelo de partida del SFT) | 9B aprox. | no disponible | Multiples | no disponible | no disponible | no disponible |

Las cifras de rendimiento comparado entre estas variantes no estan publicadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo derivado, no original: se trata de una cuantizacion con cabeza MTP injertada. Cualquier evaluacion de calidad debe remitirse al checkpoint base de Xiaomi; la cuantizacion a 5 bits puede introducir degradacion adicional no medida en esta ficha.
- El injerto de la cabeza MTP procede de un repositorio de terceros (`mlx-works`). Aunque el autor declara verificaciones de arquitectura, geometria y tokenizer, no se aporta una comparacion empirica de calidad con y sin la cabeza injertada.
- Conflicto de datos sobre la longitud de contexto: la model card afirma 262.144 tokens y una fuente externa indica 32.768 para el modelo base. Conviene verificar la ventana real antes de disenar flujos que dependan de contexto largo.
- Idiomas soportados no especificados: no se puede asumir un rendimiento multilingue homogeneo, y en particular el castellano no esta confirmado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para este checkpoint.
- Modelo de licencia MIT: permite uso comercial, pero al derivar de un checkpoint de Xiaomi conviene revisar la licencia del repositorio base por si impone condiciones adicionales.
- Restriccion practica de despliegue: al ser exclusivamente MLX, no es portable a infraestructura CUDA. Descartar para produccion en servidores con GPU NVIDIA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe comunidad que haya validado el artefacto de forma independiente.
- La validacion reportada por el autor es una unica prueba determinista de matematicas, no una bateria de evaluacion.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp
- Modelo base oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante de la cabeza MTP: https://huggingface.co/mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp
- Pagina oficial de la serie MiMo-V2.6 (Xiaomi): https://mimo.xiaomi.com/mimo-v2-6
- Notas de la release MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Ficha del modelo base en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Ficha del modelo base en featherless.ai: https://featherless.ai/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
