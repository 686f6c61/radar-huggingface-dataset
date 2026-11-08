# TheShellMaster/cypher-2-7b-stealth

## Resumen

Cypher 2 7B Stealth (identificador interno `C2-7B-Stealth`) es un modelo de lenguaje de 7.615.616.512 parámetros publicado por el usuario TheShellMaster en Hugging Face. Está construido sobre la arquitectura Qwen2 y se presenta como un asistente técnico orientado al desarrollo de software y a la ciberseguridad. El modelo se distribuye en precisión completa `bfloat16` (el repositorio ocupa 15,2 GB) y declara soporte para francés e inglés.

La propuesta del autor es un modelo de propósito general para asistencia técnica directa: preguntas de programación, desarrollo y tareas relacionadas con seguridad informática. La model card es deliberadamente minimalista: incluye una licencia Apache 2.0, la declaración de idiomas y un único ejemplo de uso con `transformers`, sin detallar el proceso de entrenamiento, los datos utilizados ni resultados de evaluación.

Su relevancia actual es limitada pero concreta: se trata de un derivado de Qwen2 de 7B con licencia permisiva y pesos abiertos en safetensors, lo que permite desplegarlo en infraestructura propia sin restricciones comerciales. No obstante, la ausencia total de benchmarks publicados y el escaso volumen de descargas (6 en el momento de la consulta) obligan a tratar sus capacidades declaradas como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en `bfloat16`; no se distribuyen variantes GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | frances, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según indican las etiquetas del repositorio y el tamaño de parámetros (7,6B, coherente con la variante Qwen2 de 7B). Los pesos se publican en `bfloat16` y el repositorio completo ocupa 15,2 GB, lo que corresponde a los pesos en precisión completa más los ficheros auxiliares del tokenizador y la configuración.

No se dispone de información sobre el corpus de entrenamiento: la model card no indica número de tokens, composición del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas. El nombre "Stealth" y la etiqueta `cypher-2` sugieren un ajuste específico sobre una base Qwen2, pero el autor no aporta detalles sobre el procedimiento de ajuste ni sobre los datos utilizados para la especialización en ciberseguridad.

## Capacidades

- Generación de texto conversacional en francés e inglés, con plantilla de chat compatible con `apply_chat_template` de `transformers`.
- Asistencia técnica en programación: el autor la declara como función principal del modelo.
- Tareas relacionadas con ciberseguridad, según la etiqueta `cybersecurity` del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia en desarrollo de software: el modelo puede resolver dudas de programación y generar fragmentos de código en conversaciones multi-turno mediante la plantilla de chat de `transformers`, integrándose en un IDE o en un chatbot interno de soporte a desarrolladores.
- Revisión de código orientada a seguridad: dada su especialización declarada en ciberseguridad, puede emplearse para señalar patrones de riesgo en fragmentos de código (inyección, manejo inseguro de entradas) dentro de un pipeline de revisión previa a la fusión de cambios, siempre con validación humana.
- Formación y concienciación en seguridad: generación de explicaciones didácticas en francés o inglés sobre conceptos como vulnerabilidades comunes, configuraciones seguras o análisis de incidentes, para materiales internos de formación.
- Chatbot de soporte técnico bilingüe: al cubrir francés e inglés, encaja en equipos o productos con audiencia francófona e internacional que necesiten un asistente autoalojado sin coste de API.
- Prototipado rápido autoalojado: con pesos en safetensors y licencia Apache 2.0, sirve para validar flujos de generación de texto en infraestructura propia antes de comprometerse con un modelo mayor o con un proveedor externo.
- Base para ajuste fino (fine-tuning): su licencia permisiva y su tamaño de 7B permiten emplearlo como punto de partida para especializaciones adicionales con LoRA o QLoRA sobre dominios concretos, incluido el ámbito de seguridad.
- Generación de documentación técnica: redacción de guías, notas de versión o explicaciones de API en francés e inglés a partir de contexto proporcionado en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 18-20 GB de VRAM para contexto corto.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S o RTX 6000 Ada. Una RTX 4090 (24 GB) puede alojar los pesos en `bfloat16` con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en `bfloat16` con margen ajustado; en GPUs de 16 GB sería necesario cuantizar, pero el autor no publica variantes cuantizadas oficiales.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado por el autor); vLLM y TGI son compatibles con arquitecturas Qwen2, aunque no hay configuración oficial publicada; llama.cpp/Ollama requerirían convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cypher 2 7B Stealth | 7,6B | no disponible | Apache 2.0 | Hugging Face, safetensors | Sin benchmarks publicados; especialización declarada en ciberseguridad |
| Qwen2-7B | 7,6B | 32.768 tokens (según la familia Qwen2) | Apache 2.0 | Hugging Face, safetensors y GGUF | Base de referencia con benchmarks publicados por el autor original |
| Mistral-7B-v0.1 | 7,2B | 8.192 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Alternativa generalista con amplio ecosistema de cuantizaciones |
| Llama 3.1 8B | 8,0B | 131.072 tokens | Llama 3.1 Community License | Hugging Face, safetensors y GGUF | Mayor contexto y benchmarks publicados; licencia con restricciones de uso |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos verificables de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, por lo que el rendimiento real es desconocido.
- Model card mínima: no se documentan datos de entrenamiento, proceso de ajuste ni evaluación de sesgos; el riesgo de alucinación no está caracterizado.
- Especialización declarada sin evidencia: la orientación a ciberseguridad es una afirmación del autor sin métricas que la respalden.
- Cobertura lingüística limitada: solo francés e inglés declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la configuración del tokenizador y del modelo.
- Sin cuantizaciones oficiales: desplegarlo en GPUs de menos de 16 GB exige convertir los pesos uno mismo, con el riesgo de degradación no medida.
- Trazabilidad escasa: 6 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el modelo ni informes independientes.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones, pero la falta de evaluación previa hace recomendable una validación propia antes de llevarlo a producción, especialmente en dominios sensibles como la seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheShellMaster/cypher-2-7b-stealth
- Demo (Space del autor): https://huggingface.co/spaces/TheShellMaster/cypher-ai
- Directorio de modelos stealth (referencia general): https://stealthmodels.com/models
