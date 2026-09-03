# Verdugie/Therapy-3.8

## Resumen

Therapy 3.8 es un modelo conversacional de 27B parametros, especializado en terapia y apoyo emocional, desarrollado por Verdugie (Saul Verdugo). Se trata de un fine-tuning del modelo base Qwen/Qwen3.8-27B, entrenado sobre 5.070 conversaciones de counseling. El modelo esta disenado para mantener conversaciones largas y coherentes, con una lectura clinica estructurada antes de cada respuesta y un registro temporal (timeline ledger) que mantiene los hechos de la conversacion en orden a lo largo de decenas de miles de tokens.

El modelo se distribuye exclusivamente en formato GGUF, lo que permite su ejecucion local en hardware de consumo mediante llama.cpp, LM Studio u Ollama. Su licencia Apache-2.0 permite uso comercial sin restricciones. La relevancia actual del modelo radica en su enfoque en privacidad y despliegue local para aplicaciones de salud mental, un ambito donde la confidencialidad es critica. El entrenamiento fue realizado con datos generados por los modelos Opus 4.8, Sonnet 5 y Fable 5, posteriormente auditados y editados para unificar el estilo terapeutico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B base) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | GGUF (varios, no especificados) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Therapy 3.8 se basa en la arquitectura Qwen3.8-27B, un transformer denso de 27B parametros. El modelo incorpora un mecanismo de atencion hibrida (etiqueta hybrid-attention), aunque los detalles tecnicos especificos de esta modificacion no estan documentados en la informacion disponible. El fine-tuning se realizo sobre 5.070 conversaciones de counseling, generadas por los modelos Opus 4.8, Sonnet 5 y Fable 5, y posteriormente auditadas y editadas por el autor para unificar el estilo terapeutico.

El modelo implementa dos innovaciones funcionales destacables: una lectura clinica estructurada antes de cada respuesta, que organiza la informacion relevante del paciente, y un timeline ledger que mantiene un registro ordenado de los hechos de la conversacion. Este ultimo permite al modelo recordar acuerdos, promesas y detalles especificos a lo largo de conversaciones muy largas, como se demuestra en los ejemplos de la model card donde el modelo recuerda instrucciones dadas 45 turnos antes. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con estilo terapeutico, enfocado en escucha activa y respuestas empaticas.
- Memoria de largo plazo dentro de la conversacion: mantiene un registro de hechos, acuerdos y promesas del usuario a lo largo de decenas de miles de tokens.
- Deteccion de patrones de comportamiento: identifica cuando el usuario repite temas o conductas (por ejemplo, hablar de dinero en lugar de emociones) y lo senala explicitamente.
- Razonamiento contextual: utiliza imagenes y metaforas del propio usuario para construir respuestas, sin imponer interpretaciones externas.
- Capacidad de corregir al usuario: puede senalar cuando el usuario atribuye al modelo afirmaciones que este nunca hizo, y aclarar la diferencia.
- Manejo de situaciones de crisis: en el ejemplo de panico, el modelo mantiene acuerdos previos (no tranquilizar sobre el corazon) incluso cuando el usuario pide lo contrario.
- Sin necesidad de system prompt: el comportamiento terapeutico esta integrado en el fine-tuning.

## Casos de uso

- Acompanamiento terapeutico local: el modelo puede servir como complemento a terapia profesional para personas que prefieren conversar sin conexion, garantizando privacidad total al ejecutarse en local.
- Apoyo en procesos de separacion y mediacion: como muestra el transcript de separation, el modelo ayuda a clarificar instrucciones legales, distinguir entre documentos solicitados y mantener el foco en lo importante.
- Gestion de conflictos familiares: en el caso de distanciamiento entre hermanos, el modelo ayuda a identificar los sentimientos subyacentes detras de discusiones sobre herencias o propiedades.
- Registro y seguimiento de acuerdos personales: el timeline ledger permite al usuario establecer reglas (por ejemplo, "interrumpeme si hablo de dinero") y el modelo las mantiene durante toda la conversacion.
- Entrenamiento de habilidades de comunicacion: el modelo puede practicar conversaciones dificiles con el usuario, senalando patrones de evasion o momentos clave.
- Diario emocional conversacional: usuarios que necesitan verbalizar sus emociones diariamente pueden usar el modelo como espacio de reflexion guiada, con respuestas que no intentan "arreglar" sino comprender.
- Despliegue en entornos sanitarios con requisitos de privacidad: al ser local y de codigo abierto, puede integrarse en infraestructuras hospitalarias sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. El unico material de evaluacion son los transcripts de conversaciones reales (estrangement, separation, panic) que demuestran cualitativamente las capacidades del modelo en escenarios terapeuticos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 26,9B en GGUF, se estima aproximadamente 16-18 GB para cuantizacion Q4_K_M, 22-24 GB para Q6_K y 28-30 GB para Q8_0. Estas cifras son estimaciones basadas en el tamano del modelo y no estan confirmadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4-Q6; A100 40 GB o H100 pueden ejecutar cuantizaciones mas altas o FP16.
- Compatibilidad con GPU de consumo: si, con cuantizacion Q4 es posible en GPUs de 16-24 GB como RTX 4080/4090, o incluso en Mac con 32 GB unificados.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Dependera de la GPU y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Therapy 3.8 | 26,9B | no disponible | Apache-2.0 | GGUF | Terapia conversacional |
| Qwen3.8-27B (base) | 26,9B | no disponible | Apache-2.0 | Safetensors | Generalista |
| Llama 3.1 27B | 27B | 128K | Llama 3.1 | Safetensors/GGUF | Generalista |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a caracteristicas tecnicas. El modelo base Qwen3.8-27B es el punto de partida de Therapy 3.8, por lo que comparten arquitectura y parametros. La diferencia principal es el fine-tuning especializado en terapia.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas de forma nativa.
- Los datos de entrenamiento fueron generados por otros modelos de IA (Opus 4.8, Sonnet 5, Fable 5) y posteriormente editados por humanos. Esto puede introducir sesgos propios de los modelos generadores.
- No es un sustituto de terapia profesional: el modelo no tiene formacion clinica acreditada y no debe utilizarse como reemplazo de psicologos o psiquiatras titulados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar hechos, especialmente en contextos medicos o legales.
- La longitud de contexto no esta documentada oficialmente, aunque el modelo esta etiquetado como long-context. Se recomienda verificar el comportamiento con contextos muy largos antes de usarlo en produccion.
- No se han publicado evaluaciones de seguridad especificas para uso en salud mental, como prevencion de autolesiones o manejo de crisis agudas.
- El modelo puede mantener acuerdos con el usuario (como no tranquilizar en ciertos temas), lo que en algunos casos podria ser contraproducente si el usuario cambia de opinion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Verdugie/Therapy-3.8
- Perfil del autor: https://huggingface.co/Verdugie
- Datasets del autor: https://huggingface.co/Verdugie/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
