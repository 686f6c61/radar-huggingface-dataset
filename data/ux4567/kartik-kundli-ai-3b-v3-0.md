# UX4567/Kartik-Kundli-AI-3B-v3.0

## Resumen

Kartik-Kundli-AI-3B-v3.0 es un ajuste fino de dominio del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario UX4567, orientado a astrologia vedica, analisis de cartas natales (kundli) y orientacion conversacional. El modelo conserva la arquitectura transformer decoder-only de Qwen2, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones), y ha sido especializado mediante QLoRA en 4 bits sobre 5.000 pares de instruccion-contexto-respuesta de elaboracion propia.

El problema que aborda es muy concreto: conseguir que un modelo pequeno mantenga conversaciones multi-turno coherentes en hindi, ingles y Hinglish sobre terminologia astrologica vedica (planetas, casas, dashas, yogas), algo que un modelo generalista de 3B parametros no cubre con la terminologia y el tono adecuados. El repo pesa 6,2 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada pero clara dentro del nicho: es un ejemplo de fine-tuning de bajo coste con Unsloth sobre una base pequena, reproducible en una unica GPU de consumo. Cabe senalar que el modelo tiene un historial de adopcion practicamente nulo (0 descargas, 1 like en el momento de la consulta) y que no se han publicado evaluaciones objetivas, por lo que su calidad real no esta verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con ajuste fino QLoRA |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion proporcionada; el ejemplo de inferencia del autor usa `max_seq_length = 2048`. El modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Entrenado con QLoRA en 4 bits. Los pesos publicados estan en safetensors de precision completa (BF16/FP16, ~6,2 GB); no se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | Hindi (hi), ingles (en), con soporte conversacional Hinglish |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen2.5-3B-Instruct |
| Framework de ajuste | Unsloth (QLoRA, 4-bit) |
| Tamano del repositorio | 6,2 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-19 |
| Ultima actualizacion (segun HuggingFace) | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV, sin componentes MoE ni mecanismos de atencion lineal. Sobre esa base se aplico un ajuste fino supervisado con QLoRA en 4 bits usando Unsloth, con los siguientes hiperparametros declarados por el autor: rango (r) = 8, LoRA alpha = 16, LoRA dropout = 0.0 (optimizado para los kernels rapidos de Unsloth) y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atencion y del MLP. Se activo gradient checkpointing para reducir el consumo de VRAM durante el entrenamiento.

El conjunto de datos consiste en mas de 5.000 pares de instruccion-contexto-respuesta curados especificamente para el dominio, con el usuario aportando datos de nacimiento (nombre, lugar, fecha) y una pregunta, y el modelo generando una respuesta astrologica. No se documentan el numero total de tokens de entrenamiento, la composicion exacta del dataset, la procedencia de los datos ni si se aplicaron fases posteriores de RLHF, DPO o preferencias. Tampoco se declara ninguna innovacion tecnica mas alla del propio ajuste QLoRA; no hay decodificacion especulativa, atencion lineal ni modulos adicionales. El prompt del ejemplo de inferencia esta redactado en Hinglish, lo que sugiere que el entrenamiento se hizo predominantemente en ese registro mixto.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi, ingles y Hinglish sobre tematica astrologica.
- Interpretacion de cartas natales vedicas a partir de datos de nacimiento aportados por el usuario (nombre, lugar, fecha y hora cuando se facilitan).
- Explicacion de conceptos de astrologia vedica: planetas, casas, signos, dashas, yogas y periodos planetarios.
- Orientacion y "guias" personalizadas sobre carrera, cambios laborales, relaciones y otras cuestiones planteadas con contexto natal.
- Capacidad generica de instruccion y conversacion heredada del modelo base Qwen2.5-3B-Instruct (no evaluada especificamente en este ajuste).
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste esta orientado a respuesta directa en un unico turno con contexto.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Asistente conversacional de astrologia vedica en hindi o Hinglish: el modelo puede mantener dialogos multi-turno donde el usuario aporta sus datos natales en el primer mensaje y va refinando preguntas sobre distintos ambitos de su carta, manteniendo la terminologia y el tono del dominio.
- Generacion de informes natales basicos: a partir de una plantilla con datos de nacimiento, producir un texto interpretativo estructurado (por ejemplo, secciones por casa o por planeta) que luego un astrologo humano revisa y edita.
- Contenido editorial para blogs o aplicaciones de astrologia: redaccion de descripciones de yogas, dashas o combinaciones planetarias en hindi e ingles, reduciendo el trabajo de redaccion manual repetitivo.
- Chatbot de engagement en aplicaciones de consumo: por su tamano de 3B parametros puede servirse con coste bajo por consulta en un servicio con muchos usuarios recurrentes que preguntan sobre periodos favorables o cambios de trabajo.
- Prototipado e investigacion sobre adaptacion de dominio: sirve como caso de estudio reproducible de fine-tuning QLoRA con Unsloth sobre Qwen2.5-3B, util para equipos que quieran replicar el pipeline en otros dominios verticales.
- Traduccion y reformulacion hindi-ingles de terminologia astrologica: el soporte de Hinglish permite generar la misma interpretacion en registro hindi, ingles o mixto segun el publico objetivo.
- Educacion y divulgacion: generar explicaciones introductorias de conceptos vedicos para lectores sin base previa, siempre que un experto valide el contenido antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna evaluacion especifica del dominio (por ejemplo, exactitud de calculo de cartas natales o fidelidad terminologica). Tampoco hay evaluaciones de terceros ni comparaciones con otros modelos astrologicos. Cualquier afirmacion sobre su calidad relativa seria especulativa.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 6,2 GB solo para los pesos, mas el cache KV. En la practica se necesitan entre 8 y 10 GB de VRAM para una ventana de contexto moderada (2K-4K tokens).
- VRAM para inferencia en 4 bits: aproximadamente 2-3 GB para los pesos, por lo que cabe holgadamente en GPUs de 6-8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090 ejecutan el modelo sin problema. En el entorno profesional, una A100 o H100 lo sirven con un uso de memoria minimo, aunque son sobredimensionadas para este tamano.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna con 8 GB o mas, y en 4 bits incluso en GPUs de 6 GB.
- CPU: es viable en CPU mediante llama.cpp u Ollama, pero requiere convertir previamente los pesos a formato GGUF, ya que el repositorio solo publica safetensors. El autor no ofrece esas conversiones.
- Opciones de despliegue: Transformers (con `load_in_4bit`), Unsloth para inferencia rapida, vLLM o TGI para servir en produccion, y llama.cpp/Ollama tras conversion a GGUF. No se han publicado plantillas de chat especificas para Ollama ni Modelfiles.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ningun hardware.
- Nota de despliegue: el ejemplo del autor esta pensado para GPU CUDA (`inputs.to("cuda")`), por lo que en entornos sin CUDA habria que adaptar el codigo o tirar de llama.cpp.

## Comparativa con modelos similares

No se conocen modelos publicos comparables especializados en astrologia vedica sobre una base de 3B parametros, por lo que la comparacion se hace contra alternativas generalistas del mismo rango de tamano que podrian servir como base para un ajuste equivalente.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| Kartik-Kundli-AI-3B-v3.0 | 3,09 B | No especificado en la ficha (ejemplo con 2.048); base con 32.768 | hi, en | Apache 2.0 | Astrologia vedica (fine-tune QLoRA) |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens | Multilingue (incluye hi y en) | Apache 2.0 | Generalista con instrucciones |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Multilingue (8 idiomas oficiales; hindi no figura entre los principales) | Licencia comunitaria Llama 3.2 | Generalista con instrucciones |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Multilingue | Terminos de uso de Gemma | Generalista con instrucciones |

La ventaja diferencial del modelo de UX4567 es exclusivamente la especializacion de dominio y el soporte de Hinglish; en contexto, licencia y madurez del ecosistema de despliegue queda por detras de las alternativas generalistas. No hay datos de rendimiento que permitan afirmar que la especializacion compensa esa diferencia.

## Limitaciones y advertencias

- Dominio no cientifico: la astrologia vedica no tiene respaldo cientifico. El modelo produce contenido que puede interpretarse como prediccion o consejo personal; cualquier despliegue deberia incluir avisos claros de que el contenido es de entretenimiento o cultural y no asesoramiento profesional.
- Riesgo de alucinacion elevado: en un modelo de 3B parametros ajustado sobre solo 5.000 ejemplos, es esperable que invente combinaciones planetarias, fechas de dashas o interpretaciones inexistentes. No se ha medido la tasa de alucinacion.
- Sin verificacion independiente: 0 descargas y 1 like en HuggingFace en el momento de la consulta; no hay evaluaciones de terceros, ni benchmarks, ni informes de usuarios.
- Idiomas limitados: solo hindi e ingles (con Hinglish). No hay evidencia de un rendimiento aceptable en castellano ni en otros idiomas.
- Contexto de entrenamiento corto: el ejemplo del autor fija 2.048 tokens, muy por debajo de los 32.768 que soporta la base. El comportamiento mas alla de esa longitud no esta documentado y podria degradarse.
- Dataset no auditado: no se especifica la procedencia de los 5.000 pares, ni si contienen sesgos de casta, genero, religion o region. La astrologia vedica puede incorporar sesgos culturales y deterministas que conviene revisar.
- Riesgo de consejo sensible: el prompt del autor pide "margdarshan" (orientacion) sobre carrera y cambios laborales. Usado sin supervision, el modelo podria dar recomendaciones sobre decisiones vitales o economicas carentes de base.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, pero el despliegue sigue sujeto a la licencia del modelo base Qwen2.5-3B-Instruct (tambien Apache 2.0), por lo que conviene conservar los avisos de atribucion.
- Coste de integracion: no hay versiones GGUF, AWQ ni GPTQ publicadas, ni plantilla de chat documentada mas alla del prompt de ejemplo, lo que anade trabajo de conversion y validacion antes de un despliegue en produccion.
- Fecha de publicacion inusual: los metadatos de HuggingFace indican creacion en septiembre de 2026, posterior a la fecha de la consulta; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v3.0
- Perfil del autor: https://huggingface.co/UX4567
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Familia Qwen2.5 (documentacion y modelos): https://huggingface.co/Qwen
- Unsloth (framework de ajuste utilizado): https://github.com/unslothai/unsloth
- Los resultados de la busqueda web no aportaron enlaces relevantes al modelo: solo devolvieron paginas genericas del buscador, sin papers, blogs ni repos asociados.
