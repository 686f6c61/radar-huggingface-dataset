# Verdugie/Therapy-3.8

## Resumen

Therapy 3.8 es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario Verdugie y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo conversacional orientado a terapia, consejeria psicologica y apoyo emocional, entrenado sobre 5.070 conversaciones de counseling. Su propuesta central es un estilo de respuesta estructurado: segun la model card, el modelo realiza una "lectura clinica" antes de cada respuesta y mantiene un "timeline ledger" que preserva los hechos de la conversacion en orden a lo largo de decenas de miles de tokens.

El modelo parte de una base de 27B parametros (26.895.998.464 parametros reales en safetensors) y se distribuye tanto en safetensors como en GGUF, lo que facilita su despliegue local mediante llama.cpp, LM Studio u Ollama. El enfasis en privacidad, ejecucion offline y on-device encaja con el caso de uso terapeutico, donde la confidencialidad del contenido es critica.

Es relevante ahora porque ocupa un nicho poco cubierto: modelos de gran tamano afinados especificamente para conversaciones dificiles (ideacion suicida, autolesion, consumo de sustancias, infidelidad, identidad de genero y sexualidad), con contexto largo y despliegue local. No obstante, la informacion disponible sobre benchmarks es practicamente nula, y la model card no documenta evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card menciona mantener hechos "a lo largo de decenas de miles de tokens" |
| Tipos de cuantizacion | GGUF (cuantizaciones no detalladas); safetensors en precision original no especificada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune del base Qwen/Qwen3.8-27B, por lo que hereda una arquitectura transformer decoder-only de aproximadamente 27B parametros. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, posible uso de atencion lineal o decodificacion especulativa); esa informacion no esta disponible en el material proporcionado.

El entrenamiento se realizo sobre 5.070 conversaciones de counseling. Segun el autor, los datos fueron escritos por Opus 4.8, Sonnet 5 y Fable 5, cada uno aportando un estilo de prosa diverso, y posteriormente auditados y editados para unificarlos en una sola "practica". La model card no indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencias. La innovacion declarada es de tipo conductual mas que arquitectonica: una "lectura clinica estructurada" previa a cada respuesta y un registro cronologico (timeline ledger) que mantiene la coherencia de los hechos a lo largo de conversaciones extensas.

## Capacidades

- Generacion de texto conversacional en ingles con estilo terapeutico y empatico.
- Razonamiento conversacional multi-turno con seguimiento de hechos mediante un registro cronologico interno.
- Manejo de temas clinicamente sensibles: ideacion suicida y autolesion, consumo de sustancias, infidelidad, sexualidad e identidad de genero.
- Capacidad de mantener compromisos conversacionales adquiridos muchos turnos antes (por ejemplo, interrumpir al usuario cuando vuelve a un tema que pidio evitar).
- Correccion de atribuciones erroneas: el modelo puede senalar que una instruccion no provino de el y rastrear su origen en la conversacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento con trazas omitidas en las respuestas publicadas; no se documentan vision ni audio.

## Casos de uso

- Apoyo emocional local y privado: el modelo puede ejecutarse offline en hardware propio gracias a los pesos GGUF, lo que permite conversaciones sobre salud mental sin enviar datos a servicios externos, un requisito habitual en entornos clinicos y de recursos humanos.
- Practica supervisada de habilidades de consejeria: estudiantes de psicologia pueden mantener sesiones simuladas con casos dificiles (duelo, separacion, ideacion suicida) y recibir respuestas que modelan tecnicas de escucha reflexiva y confrontacion respetuosa.
- Acompanamiento en procesos de duelo y ruptura: su capacidad de sostener un hilo narrativo durante decenas de miles de tokens le permite recordar detalles de sesiones largas, como fechas de mediacion o compromisos adquiridos, y referenciarlos en el momento adecuado.
- Entrenamiento de equipos de primera linea (lineas de crisis, recursos humanos): simulacion de conversaciones de alto riesgo para practicar derivaciones y limites, con la ventaja de que el modelo puede mantener el contexto de un caso completo a lo largo de muchos turnos.
- Investigacion sobre modelos conversacionales terapeuticos: al ser Apache 2.0 y estar disponible en safetensors y GGUF, sirve como base para experimentos de evaluacion de empatia, coherencia a largo plazo y manejo de temas sensibles.
- Integracion en aplicaciones de bienestar con LM Studio o llama.cpp: desarrolladores pueden empaquetar el modelo en una app de escritorio o movil con inferencia on-device, usando la API compatible con endpoints que declara el repositorio.
- Analisis de transcripciones con contexto largo: el registro cronologico declarado permite usar el modelo para resumir o revisar conversaciones extensas manteniendo la trazabilidad de los hechos, aunque con las cautelas propias de un modelo afinado para terapia y no para analisis clinico formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos de respuestas (transcripciones de sesiones de 70-78 turnos), pero no tablas de MMLU, HumanEval, GSM8K ni metricas de evaluacion terapeutica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 27B parametros: en FP16 requiere aproximadamente 54 GB de VRAM; en cuantizacion de 8 bits, unos 27-30 GB; en 4 bits, unos 14-16 GB. Estas cifras son estimaciones genericas y no proceden de la documentacion del modelo.
- GPU recomendadas: no especificadas por el autor. Para FP16 serian necesarias A100 80 GB o H100; para cuantizaciones de 4-8 bits, GPU consumer de gama alta con 16-24 GB.
- Cabe en GPU consumer: previsiblemente si, en cuantizaciones GGUF de 4 bits, en tarjetas con 16 GB o mas (por ejemplo, RTX 4080/4090 o equivalentes); no confirmado por el autor.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (mencionados en los tags); el repositorio declara compatibilidad con endpoints. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Therapy 3.8 | 26,9B | no disponible (largo, segun model card) | Terapia y consejeria | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.8-27B (base) | 27B | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Alternativas terapeuticas de 7-13B | no disponible | no disponible | Consejeria | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre Therapy 3.8 y otros modelos de consejeria, por lo que la comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- No es un dispositivo medico ni sustituye a un profesional de salud mental; la model card no incluye descargos de responsabilidad explicitos en el material proporcionado, pero su uso en contextos clinicos requiere supervision humana.
- Riesgo de alucinacion: puede generar atribuciones erroneas de instrucciones o hechos, aunque los ejemplos publicados muestran correccion de atribuciones; no hay evaluacion sistematica de este comportamiento.
- Sesgos conocidos: no documentados. El entrenamiento con datos generados por modelos comerciales (Opus 4.8, Sonnet 5, Fable 5) puede introducir sesgos de estilo y de contenido no auditados externamente.
- Limitacion de idioma: solo ingles declarado; no se garantiza un comportamiento adecuado en castellano.
- Limitaciones de contexto: la longitud exacta de contexto no esta documentada; el mantenimiento del registro cronologico a lo largo de decenas de miles de tokens es una afirmacion del autor sin validacion publica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener condiciones adicionales no detalladas en la informacion disponible; conviene verificar la licencia del base antes de un despliegue comercial.
- Caveat de produccion: el repositorio ocupa 552 GB, lo que implica una descarga y almacenamiento considerables; las cuantizaciones GGUF concretas no estan listadas en el material proporcionado.
- Temas sensibles: el modelo esta entrenado para conversar sobre ideacion suicida y autolesion; su despliegue sin protocolos de derivacion a servicios de emergencia es un riesgo operativo importante.

## Enlaces

- Hugging Face: https://huggingface.co/Verdugie/Therapy-3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Transcripcion de ejemplo (estrangement): https://huggingface.co/Verdugie/Therapy-3.8/blob/main/transcripts/estrangement.pdf
- Transcripcion de ejemplo (separation): https://huggingface.co/Verdugie/Therapy-3.8/blob/main/transcripts/separation.pdf
- Transcripcion de ejemplo (panic): https://huggingface.co/Verdugie/Therapy-3.8/blob/main/transcripts/panic.pdf
