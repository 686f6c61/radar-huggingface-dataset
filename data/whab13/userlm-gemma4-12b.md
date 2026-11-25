# whab13/userlm-gemma4-12b

## Resumen

UserLM-Gemma4-12B es un ajuste fino completo del modelo base Gemma 4 12B de Google, desarrollado por el usuario whab13, especializado en la simulación de usuarios humanos en conversaciones con asistentes de IA. A diferencia de los modelos conversacionales convencionales, este modelo no responde como asistente: adopta el papel del usuario, leyendo un breve privado que describe a una persona (sus objetivos, identidad, recursos, temperamento y estilo de escritura) y generando el lado humano del diálogo, incluyendo el mensaje inicial, las respuestas a cada réplica del asistente y la decisión de abandonar la conversación.

El modelo resuelve un problema concreto en el ciclo de desarrollo de asistentes: la falta de usuarios realistas y reproducibles para pruebas y entrenamiento. Al simular usuarios con objetivos persistentes y reacciones coherentes ante respuestas correctas, parciales o erróneas, permite evaluar asistentes multi-turno a escala y generar datos conversacionales sintéticos. El entrenamiento combina supervisión sobre el lado del usuario en chats reales humano-asistente con 365 pasos de aprendizaje por refuerzo contra modelos asistente abiertos de entre 1.7B y 12B parámetros.

Con 11.907.350.320 parámetros en bf16 y un repositorio de 23.8 GB, el modelo se distribuye bajo licencia Apache 2.0 (con la salvedad de un conjunto de datos supervisado no comercial) y está pensado para ejecutarse con vLLM 0.33.0 o transformers 5.20.2. Su relevancia actual radica en la creciente necesidad de evaluación automatizada y realista de asistentes conversacionales, un área donde los simuladores de usuario entrenados específicamente escasean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), clase `Gemma4UnifiedForCausalLM` en transformers; `Gemma4ForCausalLM` en vLLM |
| Parametros totales | 11.907.350.320 (12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento (el entrenador leía los primeros 32.000 tokens); `--max-model-len 32768` en el ejemplo de vLLM |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (un conjunto de datos supervisado es no comercial) |
| Formato de pesos | safetensors |
| Revision | `main` (mismos pesos que `rl21-step70`) |
| Tamano del repositorio | 23.8 GB |
| Version de vLLM probada | 0.33.0 |
| Version de transformers probada | 5.20.2 con PyTorch 2.14 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del Gemma 4 12B base preentrenado de Google, una arquitectura transformer decoder-only. El checkpoint declara la clase `Gemma4UnifiedForCausalLM` en su `config.json`, que vLLM 0.33 no registra; por ello la model card recomienda cargarlo mediante un override a `Gemma4ForCausalLM`, la implementación con la que se muestrearon todas las conversaciones de entrenamiento.

El entrenamiento se desarrolló en dos fases. Primero, un ajuste supervisado sobre el lado del usuario de conversaciones reales humano-asistente. Después, 365 pasos de aprendizaje por refuerzo contra modelos asistente abiertos de entre 1.7B y 12B parámetros. La recompensa del RL premiaba tres comportamientos: perseguir los objetivos del brief, reaccionar al contenido real de cada réplica (rebatiendo respuestas erróneas o parciales en lugar de agradecerlas) y escribir con el estilo de un usuario real. Las conversaciones de entrenamiento alcanzaban hasta 30 mensajes del usuario, y el entrenador procesaba los primeros 32.000 tokens de cada una. No se detalla en la información disponible la composición exacta del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Simulación de usuario multi-turno: genera el mensaje inicial, una respuesta por cada réplica del asistente y la decisión de terminar la conversación.
- Adopción de persona a partir de un brief: interpreta objetivos, identidad, recursos disponibles, temperamento y estilo de escritura descritos en lenguaje natural.
- Persistencia orientada a objetivos: insiste y repregunta cuando las respuestas del asistente son vagas, parciales o incorrectas.
- Reacción al contenido real: evalúa lo que dice cada réplica y responde en consecuencia en lugar de agradecer de forma genérica.
- Estilo de escritura personalizado: reproduce registros como comandos cortos, minúsculas o tono abrupto según el brief.
- Decisión de abandono: termina la conversación de forma silenciosa o con un último mensaje sin réplica.
- Generación de datos conversacionales sintéticos multi-turno.
- Capacidad conversacional en inglés; no se declaran capacidades multilingües.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación automatizada de asistentes: el modelo encarna usuarios con objetivos definidos y presiona hasta obtener respuestas concretas, lo que permite medir la calidad de un asistente ante usuarios exigentes de forma reproducible y a escala.
- Generación de datos de entrenamiento multi-turno: produce conversaciones sintéticas del lado del usuario que pueden usarse para ajustar o alinear asistentes, con hasta 30 mensajes por conversación y contexto de 32.000 tokens.
- Pruebas de regresión en CI/CD de asistentes conversacionales: ejecutando muchas conversaciones concurrentes desde un pool de hilos contra el asistente bajo prueba, se detectan degradaciones en la calidad de las respuestas tras cambios de prompt o de modelo.
- Simulación de perfiles de usuario diversos: a partir de briefs distintos (por ejemplo, un pastor buscando puntos para una entrevista de trabajo) se generan usuarios con temperamentos, recursos y estilos de escritura diferentes para cubrir casos límite.
- Investigación en interacción humano-IA: estudio de dinámicas de persistencia, abandono y reformulación de peticiones en diálogos multi-turno.
- Benchmarking comparativo de asistentes: al servir el simulador en un GPU y el asistente en otro, se pueden enfrentar varios modelos asistente al mismo conjunto de briefs y comparar su comportamiento (la model card reporta 12 conversaciones concurrentes en 59 s con el simulador en una H200 y el asistente en otra GPU).
- Validación de políticas y tono: comprobar si un asistente mantiene el tono formal requerido (por ejemplo, el de una oficina diocesana) frente a un usuario que escribe de forma abrupta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: 23.8 GB solo para los pesos; el resto de la memoria reservada con `--gpu-memory-utilization` se destina a la caché KV.
- GPU recomendadas: H200 (usada en las pruebas de la model card); se requiere al menos una GPU con más de 24 GB de VRAM para bf16, por lo que una RTX 4090 de 24 GB queda al límite y no deja espacio para caché KV con contexto largo.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) en la información disponible, por lo que el despliegue en GPU de consumo no está validado por el autor.
- Despliegue recomendado: vLLM 0.33.0 con el override `--hf-overrides '{"architectures": ["Gemma4ForCausalLM"]}'` y `--max-model-len 32768`; alternativa con transformers 5.20.2 y PyTorch 2.14 en bf16.
- Latencia y throughput: con vLLM, 12 conversaciones concurrentes finalizaron en 59 s con el simulador en una H200 y el asistente en otra GPU. Con el backend de transformers (sin batching), una conversación de seis mensajes del usuario tardó 52 s en una H200, incluidas las réplicas del asistente.
- El backend de servidor del `harness.py` solo requiere la biblioteca estándar de Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UserLM-Gemma4-12B (whab13) | 12B | 32.768 tokens en entrenamiento | Simulador de usuario | Apache 2.0 (un dataset supervisado no comercial) | Hugging Face, 22 descargas |
| Gemma 4 12B (Google, base) | 12B | no disponible en la información proporcionada | Modelo base de propósito general | no disponible en la información proporcionada | Hugging Face |
| Gemma-4-12B-it (Google) | 12B | no disponible en la información proporcionada | Asistente conversacional | no disponible en la información proporcionada | Usado como asistente en el ejemplo de la model card |

No se dispone de información sobre otros simuladores de usuario comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y declarado para inglés; no se garantiza comportamiento correcto en otros idiomas.
- Está diseñado exclusivamente para el papel de usuario; no debe emplearse como asistente conversacional de propósito general.
- Riesgo de alucinación: al generar texto libre en el papel de usuario, puede inventar detalles no presentes en el brief o en la conversación.
- Sesgos: al entrenarse sobre conversaciones reales humano-asistente, puede heredar sesgos de estilo, registro y contenido de esos datos; la model card no documenta evaluaciones de sesgo.
- La licencia es Apache 2.0, pero un conjunto de datos supervisado utilizado en el entrenamiento es no comercial, lo que puede afectar a usos comerciales del modelo derivado; conviene revisar la sección de licencia de la model card.
- El límite de 30 mensajes del usuario por conversación refleja la distribución de entrenamiento; conversaciones más largas pueden degradar la coherencia.
- El contexto de entrenamiento se limita a los primeros 32.000 tokens, por lo que briefs o historiales muy largos pueden truncarse.
- La clase `Gemma4UnifiedForCausalLM` no está registrada en vLLM 0.33.0; es necesario aplicar el override de arquitectura documentado por el autor.
- El backend de transformers no aplica batching y es muy lento para más de unas pocas conversaciones; en producción conviene usar vLLM.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whab13/userlm-gemma4-12b
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Paper referenciado (arXiv:2510.06552): https://arxiv.org/abs/2510.06552
- Paper referenciado (arXiv:2402.03300): https://arxiv.org/abs/2402.03300
- Script de conversaciones (`harness.py`): incluido en el repositorio del modelo en Hugging Face
