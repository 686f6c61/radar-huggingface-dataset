# speakleash/Bielik-11B-v3.1-Instruct

## Resumen

Bielik-11B-v3.1-Instruct es un modelo de lenguaje de tipo transformer decoder-only con aproximadamente 11.170 millones de parametros, desarrollado por SpeakLeash, una iniciativa polaca centrada en la construccion de recursos linguisticos abiertos. Se trata del ajuste fino instruccional del modelo base Bielik-11B-v3-Base-20250730, orientado a generacion de texto y conversacion, con un enfasis declarado en el idioma polaco pero con cobertura multilingue amplia (mas de 40 idiomas listados en sus metadatos, incluido el castellano).

El modelo resuelve el problema de disponer de un LLM abierto de tamano medio (rango 10-12B) con buen rendimiento en lenguas eslavas y europeas de menor representacion en los corpus de entrenamiento habituales, manteniendo a la vez capacidades generales de razonamiento, codigo y conversacion multilingue. Su licencia Apache 2.0 lo hace atractivo para integracion comercial sin las restricciones de otros modelos abiertos con licencias comunitarias.

Es relevante en el contexto actual porque combina un tamano que cabe en GPUs de consumo alto (24 GB con cuantizacion), un contexto de 32.768 tokens segun la model card de la familia Bielik v3, licencia permisiva y soporte nativo en transformers, text-generation-inference y endpoints compatibles. El acceso esta restringido (gated) en Hugging Face y requiere aceptar las condiciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 11.168.796.672 (~11,17 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun model card de la familia Bielik v3; no confirmado en la informacion proporcionada para esta revision concreta) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, compatibles con cuantizacion posterior via GGUF/AWQ/GPTQ) |
| Idiomas soportados | Multilingue: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sr, hr, bs, bg, sl, mk, ro, hu, lt, lv, et, fi, sv, da, no, is, el, tr, ar, he, fa, hi, id, vi, ja, ko, zh, ka, hy, az, be, ca, cy, eu, fo, gd, gl, ga, la, lb, mt, cnr y otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 22,3 GB |
| Modelo base | speakleash/Bielik-11B-v3-Base-20250730 |
| Acceso | Restringido (gated) en Hugging Face |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia Llama (tag `llama`), lo que implica una arquitectura transformer decoder-only con atencion causal estandar, RMSNorm pre-normalizacion, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo es denso, con 11.168.796.672 parametros totales, sin componentes de mezcla de expertos. Es el resultado de un ajuste fino supervisado (SFT) y presumiblemente preferencias (DPO/RLHF) sobre el modelo base Bielik-11B-v3-Base-20250730, si bien los detalles exactos del pipeline de alineamiento no se especifican en la informacion proporcionada.

El modelo base Bielik-11B-v3-Base-20250730 forma parte de la tercera generacion de la familia Bielik de SpeakLeash, entrenada sobre corpus predominantemente polacos complementados con datos multilingues. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni de innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de la arquitectura Llama. El contexto de 32.768 tokens, si se confirma, situa al modelo en la media de la generacion actual para modelos de su tamano.

## Capacidades

- Generacion de texto conversacional multi-turno en polaco, ingles y mas de 40 idiomas, incluido el castellano.
- Razonamiento general y respuesta a instrucciones (modelo Instruct).
- Generacion de codigo y asistencia en tareas de programacion (capacidad esperable en un modelo de 11B alineado, aunque no se detalla en la informacion disponible).
- Capacidades matematicas basicas e intermedias.
- Soporte multilingue amplio con enfasis en lenguas eslavas (pl, cs, sk, sr, hr, bs, bg, sl, mk, uk, ru) y europeas occidentales.
- Compatibilidad con text-generation-inference y endpoints compatibles, lo que facilita su despliegue en infraestructura estandar.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Modo thinking explicito: no disponible.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en polaco y otras lenguas eslavas: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens, adecuado para historiales de sesion largos y consultas con documentacion adjunta.
- Procesamiento de documentacion administrativa y legal en polaco: resumen, extraccion de entidades y respuesta a preguntas sobre contratos o normativa, aprovechando el enfasis del entrenamiento en corpus polacos.
- Traduccion asistida entre polaco y castellano (u otras lenguas europeas): util en flujos de localizacion donde se requiere un modelo abierto con licencia Apache 2.0 y buen conocimiento de matices linguisticos eslavos.
- Generacion de codigo en pipelines de desarrollo: integrable via transformers o TGI para autocompletado, generacion de tests o explicacion de fragmentos, con la ventaja de una licencia permisiva que permite uso comercial sin restricciones adicionales.
- Despliegue on-premise en entornos con requisitos de soberania de datos: al ser un modelo abierto de 11B, puede ejecutarse en infraestructura propia (una sola GPU de 24 GB con cuantizacion 4-bit) sin dependencia de APIs externas.
- Clasificacion y enriquecimiento de textos multilingues: analisis de sentimiento, etiquetado tematico o generacion de metadatos en corpus que mezclan varios idiomas europeos, gracias a su cobertura de mas de 40 lenguas.
- Asistente educativo o de soporte interno en organizaciones con plantilla multilingue: respuestas en el idioma del usuario con contexto conversacional mantenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 22-24 GB solo para pesos, mas overhead de KV cache; requiere GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100) para contexto largo.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 12-13 GB, cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen para contexto moderado.
- VRAM estimada en cuantizacion 4-bit (GGUF Q4_K_M o similar): aproximadamente 6-7 GB, cabe en GPUs de consumo como RTX 4070 Ti (12 GB), RTX 4080 (16 GB) e incluso RTX 3060 (12 GB) con contexto reducido.
- GPU recomendadas para produccion: A100 80 GB o H100 para servicio en FP16 con contexto completo; L40S (48 GB) como alternativa.
- Despliegue: transformers (nativo), text-generation-inference (TGI, tag confirmado), vLLM (compatible con arquitectura Llama), llama.cpp/Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF oficiales en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct | ~11,17 B | 32.768 (segun familia v3) | Apache 2.0 | Enfasis en polaco y lenguas eslavas; acceso gated |
| Llama 3.1 8B Instruct | 8 B | 128.000 | Llama 3.1 Community License | Mayor contexto y ecosistema, pero licencia con restricciones y menor cobertura de lenguas eslavas |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Menor tamano; menor rendimiento esperado en polaco |
| Qwen2.5 14B Instruct | 14,7 B | 32.768 (128K en variantes Turbo) | Apache 2.0 (mayoria de variantes) | Mayor tamano y contexto; cobertura multilingue amplia pero menor especializacion en eslavo |

La comparativa se basa en caracteristicas publicas de cada modelo; no se dispone de resultados de benchmarks comparativos del Bielik-11B-v3.1-Instruct en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los LLM de 11B: puede generar informacion facticamente incorrecta, especialmente en tareas de conocimiento especializado o fechas y cifras.
- Sesgos potenciales derivados del corpus de entrenamiento, con sobrerrepresentacion de contenido polaco y posible infrarrepresentacion de otras culturas y perspectivas.
- El contexto maximo de 32.768 tokens debe confirmarse en la model card oficial; superarlo puede degradar la calidad o provocar errores.
- Rendimiento desigual entre idiomas: aunque se listan mas de 40 lenguas, la calidad en idiomas distintos del polaco e ingles puede ser notablemente inferior.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que anade un paso administrativo en pipelines automatizados.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia de los datos de entrenamiento para cumplimiento normativo (GDPR, derechos de autor).
- No se dispone de informacion sobre soporte de tool calling ni modo de razonamiento explicito, por lo que no debe asumirse su disponibilidad en produccion sin validacion previa.
- Modelo exclusivamente de texto: no procesa imagenes ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3-Base-20250730
- Organizacion SpeakLeash en Hugging Face: https://huggingface.co/speakleash
- Repositorio GitHub de SpeakLeash: https://github.com/speakleash
- Proyecto SpeakLeash: https://speakleash.org
