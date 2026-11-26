# zhtstar/ReworkVLM-4B-Joint

## Resumen

ReworkVLM-4B-Joint es un modelo vision-lenguaje especializado en inspeccion industrial, desarrollado por el usuario zhtstar. Se construye como un ajuste fino supervisado (SFT) y posterior refinamiento por RL (RACO-GRPO) sobre el checkpoint Qwen3-VL-4B-Instruct de Alibaba Qwen. Su tarea principal es leer una imagen de inspeccion y proponer una accion correctiva fundamentada en reglas, es decir, detectar anomalias logicas y sugerir la reparacion minima necesaria.

El modelo resuelve un problema concreto: la deteccion de anomalias logicas en entornos de fabricacion, donde no basta con identificar un defecto visual, sino que hay que vincularlo a una regla de inspeccion violada y proponer una accion de retrabajo. Se entrena sobre los conjuntos LOCO-Correct y VID-AD-Correct, con 41.396 registros de SFT y 12.000 de RL, y se evalua sobre 2.654 y 7.380 registros de validacion respectivamente.

Con 4.437.815.808 parametros (aproximadamente 4,4 mil millones), pesos en BF16 y licencia Apache 2.0, es un modelo compacto orientado a despliegue en produccion industrial. La relevancia actual radica en que combina percepcion visual con razonamiento guiado por reglas en un tamano manejable, y en que el checkpoint final ya incorpora el adaptador RL fusionado, por lo que no requiere adaptadores adicionales en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), basada en Qwen3-VL-4B-Instruct |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal que procesa entradas de imagen y texto para generar respuestas. Sobre esa base se aplica un ajuste fino supervisado con 41.396 registros y, posteriormente, un refinamiento por aprendizaje por refuerzo con RACO-GRPO sobre 12.000 registros. El adaptador RL seleccionado, identificado como `rl_epoch_0.20`, se fusiona directamente en los pesos base, de modo que el checkpoint distribuido es autonomo y no necesita cargar adaptadores LoRA en tiempo de inferencia.

Los datos de entrenamiento provienen de los conjuntos LOCO-Correct y VID-AD-Correct, orientados a la correccion de anomalias en inspeccion industrial. La evaluacion se realiza sobre subconjuntos reservados de 2.654 registros de LOCO-Correct y 7.380 de VID-AD-Correct en formato VQA. El autor documenta la procedencia de los pesos mediante `checkpoint.json`, que incluye hashes de los ficheros de salida y de los pesos base de Qwen en una revision concreta, aunque la archive de entrenamiento original no registro el commit base. No se detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto e imagen-texto a texto (pipeline image-text-to-text).
- Deteccion de anomalias logicas en imagenes de inspeccion industrial.
- Identificacion de la regla de inspeccion violada a partir de la imagen.
- Sugerencia de acciones correctivas o de retrabajo fundamentadas en reglas.
- Razonamiento guiado por reglas para proponer la reparacion minima.
- Conversacion multi-turno en el contexto de inspeccion (etiqueta conversational).
- Capacidades heredadas del modelo base Qwen3-VL-4B-Instruct (vision y lenguaje general), si bien el ajuste esta orientado a la tarea de inspeccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inspeccion visual automatizada en linea de produccion: el modelo recibe la imagen de la pieza y devuelve la regla violada y la accion correctiva, integrandose en un pipeline de control de calidad que decide si la pieza se retrabaja o se desecha.
- Asistencia al operario de retrabajo: dado un defecto detectado, el modelo sugiere la reparacion minima, reduciendo la dependencia de documentacion tecnica y acelerando la resolucion en planta.
- Auditoria de registros de inspeccion: procesamiento por lotes de imagenes historicas para verificar que las decisiones de retrabajo estuvieron alineadas con las reglas, usando la salida del modelo como segunda opinion.
- Formacion de inspectores: generacion de explicaciones rule-grounded sobre casos concretos para entrenar a personal nuevo en la identificacion de anomalias logicas.
- Integracion en sistemas MES/ERP: el modelo actua como modulo de razonamiento visual que traduce una imagen a una accion estructurada que el sistema de gestion registra y enruta.
- Control de calidad en fabricacion de componentes electronicos o mecanicos: deteccion de defectos que no son puramente visuales sino logicos (por ejemplo, combinaciones de piezas incompatibles) y propuesta de correccion.
- Validacion asistida de decisiones criticas: al ser un modelo de 4,4B en BF16, puede desplegarse en una unica GPU y servir como capa de verificacion previa a la decision humana en inspecciones de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tabla (Table 3) con resultados de ejecuciones especificas por dataset, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 12 y 16 GB para imagenes de resolucion moderada.
- GPU recomendadas: A100, H100, L40S para despliegue en produccion; RTX 4090 y RTX A6000 para desarrollo y pruebas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con holgura en BF16; en GPUs de 16 GB puede requerir cuantizacion o reducir el tamano de imagen.
- Opciones de despliegue: transformers (version recomendada 4.57.6 segun la model card), accelerate, y el script `ReworkVLM/scripts/infer.py` del repositorio oficial. Compatible con endpoints (tag `endpoints_compatible`). No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ReworkVLM-4B-Joint | 4,4B | no disponible | Apache 2.0 | Inspeccion industrial, anomalias logicas | Hugging Face |
| Qwen3-VL-4B-Instruct | ~4B | no disponible | Apache 2.0 | Vision-lenguaje general | Hugging Face |
| Alternativas especializadas en inspeccion industrial | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de informacion sobre otros modelos especializados en deteccion de anomalias logicas con correccion rule-grounded. No se han publicado datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- El propio autor advierte que las decisiones reales de inspeccion requieren validacion de la accion predicha y de la regla normal, especialmente cuando la imagen carece de evidencia suficiente.
- Riesgo de alucinacion: al ser un modelo generativo, puede proponer reglas o acciones correctivas no fundamentadas si la imagen es ambigua o esta fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no disponible en la informacion proporcionada; el modelo se entrena sobre datasets especificos de inspeccion, por lo que puede generalizar mal a dominios industriales distintos.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto ni los idiomas soportados; la model card esta en ingles y no se especifica el idioma de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor senala que las imagenes de origen se obtienen bajo los terminos descritos en la dataset card, que deben respetarse.
- Caveat de procedencia: el archive de entrenamiento original no registro el commit base de Qwen; la correspondencia de pesos se documenta mediante hashes en `checkpoint.json`.
- El checkpoint fusiona el adaptador RL, por lo que no es posible separar el efecto del SFT y del RL en inferencia.
- No se documentan resultados de benchmarks en la informacion disponible, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhtstar/ReworkVLM-4B-Joint
- Dataset: https://huggingface.co/datasets/zhtstar/ReworkVLM-Correct
- Codigo y citacion: https://github.com/zhtstar/ReworkVLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision de pesos base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/d51ae9202e9e3c9c6a0063a67620285a2bd50e5c
