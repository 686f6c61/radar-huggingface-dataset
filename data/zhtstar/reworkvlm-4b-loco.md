# zhtstar/ReworkVLM-4B-LOCO

## Resumen

ReworkVLM-4B-LOCO es un modelo vision-lenguaje especializado en inspeccion industrial, desarrollado por el usuario zhtstar. Se trata de un ajuste fino del checkpoint Qwen3-VL-4B-Instruct (4.437.815.808 parametros) orientado a una tarea muy concreta: leer una imagen de inspeccion, identificar la regla incumplida y proponer la accion correctiva minima que la subsane. El modelo se distribuye como checkpoint BF16 autonomo, con el adaptador de RL ya fusionado en los pesos base, de modo que no requiere cargar adaptadores adicionales en inferencia.

El entrenamiento combina SFT sobre 12.196 registros y RL (RACO-GRPO) sobre 5.260 registros, todo ello exclusivamente con el conjunto LOCO-Correct. El adaptador seleccionado, `rl_epoch_0.80`, se fusiono directamente sobre el modelo base original. La evaluacion se realizo sobre un benchmark retenido de 2.654 registros VQA de LOCO-Correct.

Su relevancia actual radica en la especializacion: frente a modelos generalistas, ReworkVLM-4B-LOCO esta disenado para el ciclo de deteccion de anomalias logicas y correccion en entornos de fabricacion, un nicho donde la precision de la accion propuesta importa mas que la amplitud de capacidades. La licencia Apache 2.0 y el tamano contenido (4B) lo hacen desplegable en infraestructura moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, una arquitectura transformer multimodal que procesa pares imagen-texto y genera texto. Sobre esa base se aplico un ajuste fino en dos fases: primero SFT con 12.196 registros del conjunto LOCO-Correct, y despues RL mediante RACO-GRPO con 5.260 registros. El adaptador de RL resultante (`rl_epoch_0.80`) se fusiono directamente en los pesos del modelo base, dando lugar a un checkpoint BF16 autonomo.

El entrenamiento se circumscribe exclusivamente al dataset LOCO-Correct, lo que explica la especializacion del modelo en tareas de inspeccion y correccion de anomalias logicas. El repositorio incluye un fichero `checkpoint.json` con los hashes de los ficheros de salida y los hashes correspondientes de los pesos base de Qwen en la revision `d51ae9202e9e3c9c6a0063a67620285a2bd50e5c`. El archivo de entrenamiento original no registro un commit base, segun indica la model card.

## Capacidades

- Generacion de texto multimodal a partir de imagen y prompt (pipeline image-text-to-text).
- Deteccion de anomalias logicas en imagenes de inspeccion industrial.
- Identificacion de la regla incumplida en una inspeccion.
- Sugerencia de acciones correctivas minimas y fundamentadas en reglas.
- Respuesta a preguntas de opcion multiple sobre el estado de inspeccion.
- Generacion de acciones estructuradas (structured action accuracy reportada).
- Conversacion multi-turno (tag `conversational`).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inspeccion de calidad en linea de produccion: el modelo recibe la imagen de una pieza o proceso y devuelve la regla violada junto con la accion de reparacion minima, integrándose en un sistema de vision industrial que derive las capturas al modelo para su evaluacion.
- Asistencia a operarios de retrabajo: ante una pieza defectuosa, el operario consulta al modelo que correccion aplicar; la salida estructurada permite presentar la accion de forma guiada en una interfaz.
- Auditoria de registros de inspeccion: procesamiento por lotes de imagenes historicas para detectar anomalias logicas no identificadas previamente y proponer correcciones documentadas.
- Generacion de informes de no conformidad: a partir de la imagen y la regla detectada, el modelo redacta la descripcion del defecto y la accion correctiva en formato textual para su incorporacion a un sistema de gestion de calidad.
- Formacion de personal: uso del modelo como tutor que explica, sobre casos reales, que regla se incumple y por que la accion propuesta es la adecuada, aprovechando su capacidad conversacional.
- Validacion previa de decisiones de inspeccion: el modelo actua como segunda opinion automatica antes de que un inspector humano confirme la accion, reduciendo falsos positivos en la clasificacion de defectos.

## Benchmarks y rendimiento

Resultados reportados en la Table 3 del paper, sobre el benchmark retenido LOCO-Correct (2.654 registros VQA):

| Metrica | Resultado |
|---|---|
| Precision global en opcion multiple | 75,70 % |
| Precision en accion estructurada | 78,10 % |
| Tasa de exito de correccion | 75,86 % |
| Calidad global en respuesta abierta | 4,54 / 5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 16 GB o mas para contexto moderado.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; una RTX 4090 (24 GB) es suficiente para inferencia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 y en tarjetas con 16 GB o mas en BF16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 12 GB o menos, aunque no se documentan pesos cuantizados oficiales.
- Opciones de despliegue: transformers 4.57.6 con accelerate (segun la model card), y el script `ReworkVLM/scripts/infer.py` del repositorio oficial. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReworkVLM-4B-LOCO | 4.437.815.808 | no disponible | Inspeccion industrial y correccion de anomalias | Apache 2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | Vision-lenguaje generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en inspeccion industrial | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo identificable en la informacion es el modelo base Qwen3-VL-4B-Instruct, del que ReworkVLM-4B-LOCO hereda arquitectura y tamano pero al que supera, segun los datos del autor, en las tareas especificas de LOCO-Correct. No se dispone de datos para comparar con otros modelos especializados en inspeccion industrial.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con LOCO-Correct, por lo que su rendimiento fuera de ese dominio de inspeccion es incierto y probablemente degradado.
- La model card advierte explicitamente de que las decisiones reales de inspeccion requieren validacion de la accion predicha y de la regla normal, especialmente cuando la imagen carece de evidencia suficiente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la recomendacion de validacion humana sugiere que el autor lo considera un riesgo relevante en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingue.
- Longitud de contexto: no disponible; no se especifica la ventana maxima soportada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las imagenes de origen se obtuvieron bajo los terminos descritos en la model card del dataset, que deben respetarse.
- El archivo de entrenamiento original no registro el commit base de Qwen; la procedencia se reconstruye mediante hashes en `checkpoint.json`.
- No se documentan pesos cuantizados oficiales ni soporte verificado en motores de inferencia distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhtstar/ReworkVLM-4B-LOCO
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision de pesos base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/d51ae9202e9e3c9c6a0063a67620285a2bd50e5c
- Dataset de entrenamiento: https://huggingface.co/datasets/zhtstar/ReworkVLM-Correct
- Codigo y citacion: https://github.com/zhtstar/ReworkVLM
