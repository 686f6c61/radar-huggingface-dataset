# valentin-marquez/snaicc-asistente-2b

## Resumen

SNAICC Asistente 2B es un ajuste fino de Qwen/Qwen3.5-2B (1.942.653.248 parámetros) desarrollado por valentin-marquez para el asistente conversacional del Sistema Nacional de Acceso a la Información sobre Cambio Climático (SNAICC) de Chile. El modelo no responde preguntas con conocimiento propio: su función es enrutar cada consulta a una de 20 herramientas predefinidas (planes comunales, proyecciones ARClim, Ley 21.455, glosario de conceptos) y redactar después una respuesta breve a partir de los datos que devuelve la API pública del Ministerio del Medio Ambiente.

La relevancia del modelo está en su especialización extrema y su coste de despliegue: con cuantización Q4_K_M (1,31 GB) funciona en CPU de 8 núcleos con llama.cpp a unos 15 tokens por segundo, sin GPU. Esto lo hace viable para un servicio público con infraestructura limitada y para escenarios de tool calling donde el razonamiento abierto no es necesario y prima la fiabilidad del enrutamiento.

El proyecto se enmarca en CBIT-2 (FAO) con el Ministerio del Medio Ambiente de Chile como contraparte técnica, aunque no es un producto oficial del Ministerio. La model card documenta 10 versiones (v1 a v3.7) con métricas de acierto sobre un conjunto de 940 preguntas, lo que permite trazar la evolución del ajuste. La licencia es Apache 2.0 y el idioma soportado es únicamente español, con foco en Chile.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B); no se detalla en la model card |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la invocación documentada (`-c 8192`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q4_K_M (única publicada, 1,31 GB por archivo GGUF) |
| Idiomas soportados | Español (centrado en Chile) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el ajuste se entrenó en bf16 con LoRA, pero no se publican safetensors del modelo ajustado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de 1.942 millones de parámetros, y se ajusta mediante LoRA de rango 64 sobre el modelo en bf16 (sin cuantizar durante el entrenamiento), aplicado a las capas de atención y MLP durante 2 épocas en una RTX 6000 Ada (1 h 26 min). Las versiones hasta la v3.6 usaron QLoRA de rango 16 y una época sobre una RTX 3060 Ti. El entrenamiento no introduce cambios arquitectónicos: es un ajuste de instrucciones orientado a la selección de herramientas y a la redacción de respuestas.

Los datos de entrenamiento son 5.654 ejemplos de elección de herramienta (846 con turno anterior) y 914 de redacción. Las preguntas son sintéticas, generadas desde perfiles de usuario (ciudadanía, estudiantes, periodistas, profesionales de distintas disciplinas, especialistas en transparencia climática), etiquetadas por separado y verificadas contra las APIs: solo se admite una pregunta si su llamada devuelve datos reales. No se emplean datos personales ni preguntas reales de usuarios. El modelo se usa con `temperature: 0` y `reasoning_effort: none`, lo que indica que el ajuste desactiva el modo de razonamiento del modelo base para producir directamente la llamada a herramienta.

## Capacidades

- Selección de herramienta (tool calling) entre 20 herramientas definidas en `herramientas.json`, con generación de argumentos (comuna, plan, concepto, artículo de ley).
- Detección de preguntas fuera de tema: reconoce consultas que no corresponden al dominio climático chileno.
- Manejo de seguimientos conversacionales: resuelve referencias al turno anterior ("¿y en Temuco?") cuando se le pasa el historial con la llamada previa y un mensaje de herramienta con "Respondido.".
- Redacción de respuestas cortas a partir de los datos devueltos por la herramienta, sin generar cifras propias.
- Solicitud de reformulación o de otra explicación cuando la pregunta es ambigua.
- Adaptación a perfiles profesionales distintos (ciudadanía, estudiantes, periodistas, especialistas).
- Formato de salida compatible con la API de chat completions de llama.cpp (`--jinja`, endpoint `/v1/chat/completions`).
- No soporta visión, audio, ni generación de código; no se documenta razonamiento multi-paso fuera del enrutamiento.

## Casos de uso

- Asistente público de cambio climático: el modelo recibe la pregunta de un ciudadano, selecciona la herramienta adecuada (por ejemplo, el plan comunal de su comuna) y redacta una respuesta breve con los datos que devuelve la API del Ministerio. Es adecuado porque separa el conocimiento (API) del lenguaje (modelo), lo que evita alucinaciones de cifras.
- Consulta de planes comunales: ante "¿qué plan tiene Maipú?", el modelo emite la llamada con el argumento de la comuna y el asistente recupera el documento oficial; el modelo solo redacta el resumen.
- Proyecciones climáticas ARClim: enrutamiento a la herramienta de proyecciones con los argumentos de variable y comuna, útil para periodistas o investigadores que necesitan una cifra concreta con fuente.
- Consulta normativa (Ley 21.455, Ley Marco de Cambio Climático): el modelo identifica la pregunta legal y llama a la herramienta correspondiente, que devuelve el artículo o resumen; adecuado para profesionales de transparencia climática.
- Glosario de conceptos: preguntas del tipo "¿qué es la adaptación climática?" se enrutan a la herramienta de explicación de conceptos, con redacción adaptada al perfil del usuario.
- Despliegue en infraestructura sin GPU: al correr en CPU de 8 núcleos a 15 tokens/s con 1,31 GB de pesos, encaja en servidores modestos de administración pública o en entornos con restricciones de hardware.
- Seguimientos conversacionales en atención al ciudadano: con el historial de llamada previa, resuelve preguntas encadenadas ("¿y en Temuco?") sin repetir el contexto completo, lo que reduce latencia y coste por turno.

## Benchmarks y rendimiento

Los datos publicados miden aciertos al elegir herramienta sobre 940 preguntas de 8 conjuntos de evaluación no usados en entrenamiento (mediana de 0,2 s por pregunta en GPU):

| Conjunto | v3.6 | v3.7 |
|---|---|---|
| Preguntas de usuarios, 5 conjuntos (750) | 716 | 724 |
| Seguimientos con turno anterior (80) | 77 | 79 |
| Fuera de tema (60) | 56 | 60 |
| Pedir otra explicación (50) | 41 | 44 |
| Perfiles profesionales no vistos (90) | 81 | 85 |
| Total (940) | 890 | 907 |

Evolución histórica del total de aciertos: v1 804, v2 822, v3 820, v3.1 829, v3.2 872, v3.3 858, v3.4 865, v3.5 887, v3.6 890, v3.7 907.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas son específicas de la tarea de enrutamiento del dominio.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en Q4_K_M los pesos ocupan 1,31 GB y el contexto de 8.192 tokens añade una caché KV modesta (no cuantificada en la información disponible).
- GPU recomendadas: ninguna obligatoria. El entrenamiento se hizo en RTX 6000 Ada (v3.7) y RTX 3060 Ti (hasta v3.6); para inferencia basta CPU.
- Cabe en cualquier GPU consumer con más de 2 GB de VRAM, aunque no es necesario.
- Despliegue: llama.cpp (probado con b12283) mediante `llama-server`; compatible con el endpoint `/v1/chat/completions` y con `--jinja` para plantillas de chat y herramientas.
- Rendimiento medido: unos 15 tokens/s en CPU de 8 núcleos; 2-4 s para elegir herramienta y 8-17 s para una respuesta completa; 0,2 s de mediana por pregunta en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| SNAICC Asistente 2B (v3.7) | 1,94 B | 8.192 (invocación documentada) | Tool calling climático Chile, 20 herramientas | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | Propósito general, multilingüe | no disponible en la información | safetensors, GGUF |
| Modelos de tool calling generalistas de ~2 B | no disponible | no disponible | Enrutamiento genérico | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en function calling para un dominio vertical) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es el acierto de enrutamiento sobre el conjunto propio (907/940 en v3.7), que no es comparable con benchmarks generalistas.

## Limitaciones y advertencias

- El modelo solo funciona bien con las 20 herramientas de `herramientas.json`; fuera de ellas su comportamiento se degrada, según advierte el autor.
- Puede elegir mal la herramienta en preguntas ambiguas o muy técnicas; el asistente que lo integra debe verificar cada cifra redactada contra la fuente antes de mostrarla.
- Solo español y centrado en Chile; no es utilizable para otros dominios ni idiomas sin reentrenamiento.
- No contiene datos: las cifras y documentos provienen de APIs externas, por lo que la disponibilidad del servicio depende de esas APIs.
- Riesgo de alucinación en la redacción si los datos de la herramienta son incompletos o ambiguos; el diseño mitiga pero no elimina este riesgo.
- No es un producto oficial del Ministerio del Medio Ambiente de Chile, pese a la colaboración técnica en el marco de CBIT-2 (FAO).
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte; el autor no ofrece compromiso de mantenimiento.
- El contexto documentado (8.192 tokens) limita conversaciones muy largas; no se especifica el contexto nativo del modelo base.
- Solo se publica cuantización Q4_K_M; no hay versiones Q8_0, Q5_K_M ni safetensors del ajuste, lo que limita la evaluación de la pérdida por cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valentin-marquez/snaicc-asistente-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (repositorio y binarios): https://github.com/ggml-org/llama.cpp
- Proyecto CBIT-2 (FAO): no disponible en la información proporcionada
- Ministerio del Medio Ambiente de Chile (SNAICC): no disponible en la información proporcionada
- Paper o blog técnico del ajuste: no disponible en la información proporcionada
