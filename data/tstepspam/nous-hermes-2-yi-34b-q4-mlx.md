# tstepspam/Nous-Hermes-2-Yi-34B-Q4-MLX

## Resumen

Nous-Hermes-2-Yi-34B-Q4-MLX es una cuantizacion de 4 bits, en formato MLX, del modelo NousResearch/Nous-Hermes-2-Yi-34B. Se trata de una publicacion de la comunidad (usuario tstepspam) que empaqueta los pesos del modelo original para su ejecucion eficiente en hardware Apple Silicon mediante la libreria MLX. El modelo base es un ajuste fino supervisado de Yi-34B sobre el dataset teknium/OpenHermes-2.5, orientado a conversacion e instrucciones.

El modelo original parte de Yi-34B (01-ai), un transformer decoder-only de 34.388.917.248 parametros (unos 34,4 mil millones) con una ventana de contexto muy amplia heredada de la familia Yi. Nous-Hermes-2-Yi-34B se entreno sobre datos mayoritariamente sinteticos generados con GPT-4 (dataset OpenHermes 2.5) y emplea el formato de prompt ChatML.

Su relevancia practica radica en que permite ejecutar un modelo de 34B en equipos con memoria unificada moderada (a partir de ~24 GB) gracias a la cuantizacion de 4 bits, que reduce el peso del repositorio a aproximadamente 19,3 GB. El modelo esta publicado bajo licencia Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Yi, base Llama) |
| Parametros totales | 34.388.917.248 (~34,4 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 200.000 tokens (heredada del modelo base Yi-34B) |
| Tipos de cuantizacion | 4-bit (formato MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original es un transformer decoder-only de 34B parametros basado en la arquitectura Yi, que a su vez adopta el diseno tipo Llama (normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios RoPE). Nous-Hermes-2-Yi-34B es el resultado de un ajuste fino supervisado (SFT) del Yi-34B base sobre el dataset teknium/OpenHermes-2.5, una recopilacion de aproximadamente un millon de ejemplos mayoritariamente sinteticos generados con GPT-4, segun indican las propias etiquetas del autor.

Esta version concreta no aporta cambios arquitectonicos: es una cuantizacion de 4 bits realizada con las herramientas de MLX sobre los pesos del modelo de NousResearch. La innovacion tecnica relevante esta en el propio pipeline de cuantizacion de MLX, que permite ejecutar el modelo en memoria unificada de Apple Silicon con menor huella de memoria, a costa de una perdida de precision respecto a los pesos originales en 16 bits. No se detalla en la informacion disponible si hubo etapas adicionales de RLHF o DPO mas alla del ajuste supervisado.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, con formato de prompt ChatML.
- Razonamiento general y respuesta a preguntas, derivado del ajuste fino sobre OpenHermes 2.5.
- Generacion de codigo y asistencia de programacion basica (no confirmado con benchmarks).
- Capacidad multilingue limitada: el modelo solo declara ingles, por lo que el rendimiento en castellano no esta garantizado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno aprovechando su ventana de contexto larga heredada de Yi, adecuado para asistentes de chat locales en equipos Apple Silicon.
- Generacion de texto y redaccion asistida: util para producir borradores, resumenes y reescritura de contenido en ingles dentro de aplicaciones de escritorio sin conexion.
- Prototipado e investigacion en local: permite experimentar con un modelo de 34B en un Mac con memoria unificada, sin depender de GPUs dedicadas ni de servicios en la nube.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de estudio para medir la perdida de calidad de una cuantizacion de 4 bits frente al modelo original en 16 bits.
- Desarrollo de aplicaciones privadas offline: al ejecutarse en local, evita enviar datos sensibles a APIs externas, relevante en entornos con requisitos de privacidad.
- Base para ajustes finos posteriores en formato MLX: puede emplearse como punto de partida para tareas especificas dentro del ecosistema MLX en equipos Apple.
- Generacion de codigo en pipelines internos: con las reservas sobre su rendimiento real, puede integrarse en asistentes de programacion locales en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card del autor aparece con la lista `results` vacia.

## Requisitos de hardware

- Pesos en 4 bits (MLX): aproximadamente 19,3 GB de repositorio, por lo que se recomienda un minimo de 24 GB de memoria unificada para inferencia comoda.
- Pesos originales en 16 bits: en torno a 68 GB de memoria, fuera del alcance de la mayoria de equipos de consumo.
- Equipos recomendados: Macs con Apple Silicon y memoria unificada de 24 GB o superior (familias M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y superiores). En 32-64 GB el margen de contexto disponible es amplio.
- GPU dedicadas: el formato MLX esta disenado para Apple Silicon; para GPUs NVIDIA/AMD seria necesario convertir los pesos a otro formato. GPU recomendadas para el modelo sin cuantizar: A100 80 GB, H100 80 GB o varias RTX 4090 (24 GB) con paralelismo.
- Opciones de despliegue: MLX / mlx-lm para Apple Silicon; conversion a GGUF para su uso con llama.cpp, Ollama o LM Studio; tambien es posible servir el modelo original en vLLM o TGI si se dispone del formato y hardware adecuados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Nous-Hermes-2-Yi-34B-Q4-MLX | 34,4 B | 200.000 tokens (heredado) | 4-bit MLX | apache-2.0 | HuggingFace (0 descargas) |
| NousResearch/Nous-Hermes-2-Yi-34B | 34,4 B | 200.000 tokens | 16-bit | apache-2.0 | HuggingFace (modelo base) |
| Yi-34B (01-ai) | 34 B | 200.000 tokens | 16-bit | apache-2.0 | HuggingFace (modelo preentrenado) |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos sinteticos generados con GPT-4 (OpenHermes 2.5), puede heredar sesgos presentes en esos datos y en el corpus de preentrenamiento del Yi-34B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste fino conversacional no elimina la generacion de contenido incorrecto, especialmente en tareas factuales.
- Limitacion de idioma: el modelo solo declara soporte para ingles; su uso en castellano u otros idiomas puede degradar notablemente la calidad.
- Perdida de precision por cuantizacion: la version de 4 bits puede rendir por debajo del modelo original en 16 bits en tareas sensibles a la precision numerica.
- Adopcion limitada: el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni garantias de mantenimiento.
- Licencia: apache-2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base y del dataset utilizado para el ajuste fino.
- Contexto del modelo base: la ventana larga de 200.000 tokens se hereda de Yi-34B, pero en la version cuantizada el uso de contextos muy extensos puede verse limitado por la memoria disponible en el equipo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tstepspam/Nous-Hermes-2-Yi-34B-Q4-MLX
- Modelo base: https://huggingface.co/NousResearch/Nous-Hermes-2-Yi-34B
- Dataset de ajuste fino: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Modelo Yi-34B (01-ai): https://huggingface.co/01-ai/Yi-34B
- Libreria MLX: https://github.com/ml-explore/mlx
