# whiteshadow98/health-scribe-qwen2.5-1.5b-q4f16_1-MLC

## Resumen

Health Scribe Qwen2.5 1.5B (q4f16_1, MLC) es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario whiteshadow98. No es un modelo de proposito general, sino un componente especializado que realiza dos tareas muy concretas dentro de la aplicacion Health Scribe, un diario de salud privado que se ejecuta integramente en el navegador a traves de WebLLM. La primera tarea convierte una nota diaria informal en JSON estructurado (comida, bebida, medicamentos con cantidades, actividades, sintomas con severidad, sueno y horas). La segunda transforma una pregunta sobre el registro en un pequeno plan de consulta en JSON que resuelve el codigo de la aplicacion.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con aproximadamente 1,54 mil millones de parametros, y se distribuye cuantizado en formato q4f16_1 con el mismo diseno que mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC, de modo que la libreria WebLLM Qwen2 WebGPU precompilada lo ejecuta sin modificaciones.

Su relevancia actual reside en el enfoque de privacidad: al empaquetarse para MLC-LLM y WebLLM, la inferencia ocurre en el propio dispositivo del usuario sin enviar datos clinicos a un servidor. Es un ejemplo de modelo pequeno, muy especializado y desplegable en el navegador, orientado a extraccion estructurada mas que a conversacion abierta. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y los pesos ocupan 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1,5 mil millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens de forma nativa) |
| Tipos de cuantizacion | q4f16_1 (cuantizacion de 4 bits con activaciones en float16, formato MLC) |
| Idiomas soportados | en (ingles), hi (hindi, incluyendo entradas tipo Hinglish) |
| Licencia | apache-2.0 |
| Formato de pesos | artefactos compilados de MLC-LLM (q4f16_1); no se distribuye en safetensors ni GGUF |
| Libreria | mlc-llm (compatible con WebLLM / WebGPU) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | LoRA fine-tune |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1,5 mil millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA orientado a dos tareas de extraccion estructurada: conversion de notas a JSON y conversion de preguntas a planes de consulta. Posteriormente los pesos se cuantizaron a q4f16_1 siguiendo exactamente la disposicion de mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC, lo que garantiza compatibilidad directa con la libreria WebLLM Qwen2 WebGPU sin recompilacion.

La informacion de entrenamiento es limitada pero explicita. Se utilizaron alrededor de 1.000 notas sinteticas (aproximadamente el 80 % ambientadas en India, con alimentos regionales, marcas de medicamentos indias y Hinglish) y alrededor de 1.100 preguntas sinteticas, redactadas y etiquetadas por Claude (Anthropic) siguiendo un libro de reglas de etiquetado fijo, mas aumentos que preservan las etiquetas. No se emplearon datos reales de usuarios. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas como RLHF o DPO mas alla del ajuste supervisado con LoRA. Tampoco se describe ninguna innovacion arquitectonica propia: las capacidades diferenciales provienen del ajuste fino y del formato de despliegue, no de cambios en la arquitectura.

## Capacidades

- Extraccion estructurada de notas: convierte texto informal (dictado por voz, con erratas, en ingles o Hinglish) en JSON con campos de comida, bebida y medicamentos con cantidades, actividades, sintomas con severidad, sueno y horas.
- Generacion de planes de consulta: traduce preguntas sobre el registro (por ejemplo, sobre acidez o ingesta de proteinas) a un JSON de consulta que interpreta el codigo de la aplicacion.
- Soporte multilingue limitado a ingles e hindi, con manejo de entradas mixtas tipo Hinglish.
- Inferencia en el navegador mediante WebLLM y WebGPU, sin dependencia de servidor.
- Manejo de texto con erratas y entradas dictadas por voz.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio en la informacion disponible.
- No es un modelo conversacional de proposito general: su comportamiento esta acotado a las dos tareas de extraccion descritas.

## Casos de uso

- Diario de salud personal en el navegador: el usuario escribe o dicta una nota diaria y el modelo la transforma en JSON estructurado que alimenta el registro, sin que los datos salgan del dispositivo.
- Extraccion de habitos alimenticios: a partir de notas como "desayune dos rotis con dal", el modelo genera entradas con alimento y cantidad, utiles para seguimiento nutricional.
- Registro de medicacion: identificacion de medicamentos y dosis en texto libre (incluidas marcas indias), con conversion a un formato estructurado apto para historial.
- Seguimiento de sintomas: deteccion de sintomas y su severidad dentro de la nota, permitiendo tendencias a lo largo del tiempo.
- Consultas sobre el historial: el usuario pregunta "me da acidez el te?" y el modelo produce un plan de consulta en JSON que la aplicacion ejecuta sobre los registros previos.
- Aplicaciones de privacidad estricta: cualquier producto que deba procesar texto clinico o personal sin enviarlo a la nube puede reutilizar el patron de MLC-LLM mas WebLLM con este modelo.
- Prototipado de extraccion estructurada offline: util como referencia para desarrolladores que quieran un modelo pequeno capaz de generar JSON de esquema fijo en el navegador.
- Integracion en asistentes de bienestar bilingues ingles-hindi: cubre entradas en Hinglish, frecuentes en usuarios de India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,0-1,3 GB en cuantizacion q4f16_1, coherente con un repositorio de 0,9 GB y un modelo base de 1,5 mil millones de parametros. Cifra estimada, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de despliegue en navegador; en servidor, GPU modestas como T4, L4 o RTX 3060 en adelante son mas que suficientes para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en iGPU con soporte WebGPU, dado el reducido tamano.
- Opciones de despliegue: MLC-LLM y WebLLM (WebGPU) son el objetivo principal; llama.cpp, Ollama o TGI no son aplicables directamente a estos pesos compilados, salvo reconversion desde el modelo base.
- Latencia y throughput: no disponibles. El rendimiento dependera del backend WebGPU del navegador y del hardware del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Health Scribe Qwen2.5 1.5B (este) | 1,5 mil millones | no disponible (base: 32.768) | Extraccion estructurada de salud, bilingue en/hi | apache-2.0 | q4f16_1 para MLC/WebLLM |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones | 32.768 nativo | Instrucciones de proposito general | apache-2.0 | safetensors, GGUF y otras |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 | Instrucciones de proposito general | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | 2,6 mil millones | 8.192 | Instrucciones de proposito general | Gemma Terms of Use | safetensors, GGUF |

Nota: las especificaciones de los modelos comparativos corresponden a datos publicos de sus modelos base y pueden variar; no se dispone de comparaciones de rendimiento directas con el modelo de esta ficha.

## Limitaciones y advertencias

- No es un dispositivo medico ni ofrece consejo medico. Extrae lo que dice una nota; no diagnostica. Cualquier uso en contexto clinico requiere supervision profesional y validacion regulatoria.
- Riesgo de alucinacion y de etiquetado incorrecto: al ser un ajuste fino de un modelo de 1,5 mil millones sobre datos sinteticos, puede generar claves o valores JSON inexactos, especialmente con vocabulario fuera del dominio de entrenamiento.
- Convenciones fijas de etiquetado: por ejemplo, el desayuno se registra a las 08:00 cuando no se indica hora. Esto puede no coincidir con las expectativas de otras aplicaciones.
- Cobertura idiomatica limitada a ingles e hindi; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Datos de entrenamiento sinteticos y sesgados hacia India (aproximadamente el 80 % de las notas), lo que puede reducir la calidad con alimentos, marcas o expresiones de otras regiones.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias y no se documentan evaluaciones de seguridad ni de sesgo.
- Modelo muy especializado: no debe emplearse como asistente general ni como chatbot de salud.
- Repositorio sin descargas ni likes en el momento de la ficha, lo que implica escasa validacion por parte de la comunidad.
- Pesos en formato MLC compilado: no son directamente reutilizables en otros runtimes sin partir del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whiteshadow98/health-scribe-qwen2.5-1.5b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia de cuantizacion MLC: https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC
- Repositorio de la aplicacion Health Scribe: https://github.com/whiteshadow98/health-scribe
- WebLLM: https://github.com/mlc-ai/web-llm

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados proceden de la propia model card y de las referencias citadas en ella.
