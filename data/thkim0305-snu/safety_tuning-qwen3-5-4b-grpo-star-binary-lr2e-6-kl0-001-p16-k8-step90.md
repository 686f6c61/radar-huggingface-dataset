# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step90

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step90 es un ajuste fino del modelo Qwen/Qwen3.5-4B llevado a cabo por el autor thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo del ajuste es la seguridad conversacional: se entrena al modelo para responder de forma alineada ante peticiones sensibles usando una recompensa binaria estricta (juez v3) y una especificación de comportamiento (Model Spec v2), con un modelo profesor Qwen3.8-27B como referencia de juicio.

El modelo parte de la arquitectura Qwen3.5, un transformer multimodal de tipo image-text-to-text con 4.659.865.088 parametros totales (4,66 mil millones) y licencia Apache 2.0. El checkpoint publicado corresponde a la actualizacion de optimizador numero 90 de una ejecucion de RL, con un learning rate constante de 2e-6, coeficiente de perdida KL de 0.001, 16 prompts por actualizacion y 8 respuestas por prompt. El modo de razonamiento (thinking) permanece activado y la perdida de entrenamiento cubre tanto el razonamiento como la respuesta final.

Su relevancia radica en que constituye un ejemplo reproducible de alineacion de seguridad sobre un modelo pequeno y abierto, publicado con hiperparametros y configuracion de entrenamiento detallados. No obstante, se trata de un checkpoint intermedio (step 90) de una unica ejecucion, con muy poca traccion en la comunidad (25 descargas y 0 likes en el momento de la consulta), por lo que debe evaluarse como material de investigacion mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5 |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, incluye tokenizer) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base, un transformer multimodal capacitado para entrada image-text-to-text y salida de texto. Sobre esa base se aplica un ajuste fino con GRPO, un algoritmo de optimizacion por politica que estima ventajas relativas dentro de un grupo de respuestas generadas para el mismo prompt, evitando la necesidad de un modelo critico separado. En esta ejecucion se generan 8 respuestas por prompt y se procesan 16 prompts por actualizacion, con 90 actualizaciones de optimizador completadas (indice de checkpoint nativo 89).

Los datos de entrenamiento provienen de dos conjuntos: STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts), este ultimo orientado a peticiones benignas. La senal de recompensa es binaria y estricta, emitida por un juez v3 apoyado en un modelo profesor Qwen3.8-27B y guiada por la Model Spec v2. El learning rate es constante a 2e-6 y se aplica un coeficiente de perdida KL de 0.001 respecto a la politica de referencia, lo que limita la deriva del modelo. El prompt de sistema del estudiante es `You are a helpful assistant.` y el modo thinking esta activado durante el entrenamiento, de modo que la perdida abarca la cadena de razonamiento y la respuesta. El repositorio solo contiene pesos de inferencia y assets de tokenizer; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original del checkpoint.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Entrada multimodal image-text-to-text, heredada de la familia Qwen3.5 (no se documenta el detalle de resolucion o numero de imagenes por prompt).
- Modo de razonamiento (thinking) activado: el modelo puede emitir una cadena de razonamiento antes de la respuesta final.
- Alineacion de seguridad entrenada explicitamente con recompensa binaria y Model Spec v2, orientada a rechazar o reformular peticiones daninas.
- Manejo de peticiones benignas gracias al conjunto STAR-benign-915, que busca evitar rechazos excesivos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.

## Casos de uso

- Investigacion en alineacion de seguridad: sirve como punto de comparacion reproducible frente al Qwen3.5-4B base para medir el efecto de GRPO con recompensa binaria sobre tasas de rechazo y utilidad, dado que se publican los hiperparametros exactos (lr 2e-6, KL 0.001, 16 prompts x 8 respuestas).
- Evaluacion de sobre-rechazo (over-refusal): el uso conjunto de STAR-1 y STAR-benign-915 permite estudiar si el ajuste degrada la utilidad en peticiones legitimas, un problema habitual en modelos alineados con recompensas estrictas.
- Prototipado de asistentes con moderacion integrada: al combinar generacion conversacional y politica de seguridad en los mismos pesos, puede desplegarse como un unico modelo en entornos de bajo riesgo donde no se quiera encadenar un clasificador de seguridad externo.
- Experimentos de destilacion de juicio: el uso de un profesor Qwen3.8-27B con juez v3 permite analizar como se transfiere la politica de un modelo grande a uno de 4,66 B mediante recompensa binaria.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en formato safetensors compatible con `transformers`, puede reutilizarse como punto de partida para SFT o DPO adicionales en dominios concretos.
- Analisis de cadenas de razonamiento: al entrenarse con thinking activado y perdida sobre razonamiento y respuesta, es util para estudiar la relacion entre trazas de razonamiento y decisiones de rechazo.
- Despliegue en hardware modesto para demos: con 4,66 B de parametros y pesos safetensors de 9,3 GB, cabe en GPUs de consumo para pruebas cualitativas (ver seccion de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB para contexto corto.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPUs profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para servir con concurrencia.
- GPUs de consumo: cabe en RTX 4090 (24 GB) en BF16 sin problemas; en RTX 3090 (24 GB) igualmente; en tarjetas de 8-12 GB seria necesario cuantizar.
- Opciones de despliegue: `transformers` (libreria declarada), y previsiblemente vLLM, TGI o llama.cpp/Ollama tras conversion a los formatos correspondientes, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary (este) | 4,66 B | no disponible | GRPO con recompensa binaria de seguridad sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, 25 descargas, checkpoint step 90 |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado en la informacion) | no disponible | Modelo multimodal base sin ajuste de seguridad especifico | Apache 2.0 (segun el modelo derivado) | Hugging Face, modelo de referencia |
| Qwen3.8-27B (profesor citado) | 27 B (segun denominacion) | no disponible | Modelo de mayor escala usado como juez/profesor en el entrenamiento | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 90 actualizaciones de optimizador; no se documenta convergencia ni evaluacion final, por lo que el comportamiento puede ser inestable frente al modelo base.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-4B hereda los sesgos del modelo base y de los prompts de STAR-1 y STAR-benign-915.
- Riesgo de alucinacion: no evaluado; el modo thinking activado puede producir cadenas de razonamiento plausibles pero incorrectas.
- Sobre-rechazo: el entrenamiento con recompensa binaria estricta y Model Spec v2 puede incrementar los rechazos en peticiones legitimas; el conjunto benigno mitiga pero no garantiza la ausencia del problema.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue es incierto y depende del modelo base.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de seguridad para produccion; se recomienda auditoria propia antes de desplegar.
- Reproducibilidad: el estado del optimizador y los registros de entrenamiento no estan en el repositorio, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- Traccion minima: 25 descargas y 0 likes indican ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper o blog de GRPO: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
