# xCloudinfo/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión abliterada y cuantizada en formato GGUF del modelo base Qwen/Qwen3.8-27B, publicado por xCloudinfo (云碩科技), empresa centrada en soluciones de IA privada on-premise. El objetivo declarado es reducir el comportamiento de rechazo excesivo (over-refusal) del modelo original mediante ortogonalización de la dirección de rechazo, sin reentrenamiento, manteniendo las capacidades generales y el razonamiento del modelo base.

El modelo base emplea una arquitectura híbrida qwen3_5 con atención lineal de tipo SSM combinada con atención transformer y modo de razonamiento (thinking). Cuenta con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y conserva la torre de visión mediante un proyector multimodal en formato mmproj. Los pesos se distribuyen en múltiples niveles de cuantización GGUF, desde Q8_0 (28,6 GB) hasta IQ2_M (10,0 GB), lo que permite su despliegue en hardware de consumo.

La relevancia actual del modelo radica en su enfoque medido y transparente del proceso de abliteration: el autor publica una tasa de rechazo medida sobre un conjunto held-out de 10 prompts de daño grave (0/10 en Q4_K_M frente a aproximadamente 10/10 del base), optimizando simultáneamente la reducción de rechazos y la divergencia KL para preservar la calidad. Está orientado a investigación de seguridad, red teaming, moderación de contenido y usos que requieren evitar rechaces espurios, siempre bajo responsabilidad legal del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida qwen3_5: atención lineal SSM + atención transformer, con modo de razonamiento |
| Parametros totales | 26.895.998.464 (aprox. 26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (imatrix), IQ2_M (imatrix); proyector visual f16 |
| Idiomas soportados | zh (chino, incluido tradicional), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + mmproj GGUF para visión |

## Arquitectura y entrenamiento

El modelo deriva del base Qwen/Qwen3.8-27B, que utiliza la arquitectura qwen3_5: una combinación de atención lineal de tipo SSM con atención transformer clásica, e incluye un modo de razonamiento (thinking) que genera una cadena de pensamiento antes de la respuesta final. La torre de visión se conserva en forma de proyector multimodal (`mmproj`) en f16, lo que permite entrada de imágenes junto al texto.

No hubo reentrenamiento. La modificación consiste en abliteration por ablación direccional (Arditi et al. 2024): se extrae la dirección de rechazo fuera del segmento de thinking y se ortogonaliza en las proyecciones de salida (`out_proj`) de la atención lineal SSM del tower de texto, abarcando únicamente los escritores de residuo. Los hiperparámetros se buscaron con la herramienta Heretic (p-e-w/heretic) mediante Optuna, con 200 trials que minimizan conjuntamente la tasa de rechazo y la divergencia KL respecto al modelo original, evitando la degradación de capacidades típica de abliterations agresivas. Se aplicaron dos rondas iterativas hasta alcanzar 0/10 rechaces en el conjunto de evaluación. Los datos de entrenamiento originales (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en chino (simplificado y tradicional) e inglés.
- Razonamiento con modo thinking, con la dirección de rechazo extraída fuera de dicho segmento para no interferir con la cadena de pensamiento.
- Comprensión de imágenes mediante el proyector multimodal mmproj (f16, 0,9 GB).
- Reducción del rechazo excesivo: tasa de 0/10 en prompts de daño grave held-out (Q4_K_M, medida vía llama-server con thinking desactivado).
- Capacidades generales verificadas sin degradación aparente: preguntas de conocimiento (fotosíntesis, dispersión de Rayleigh, preparación de té oolong, paradas de tren de alta velocidad) respondidas correctamente en chino tradicional.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación de seguridad y red teaming: el modelo permite probar escenarios adversarios y evaluar defenses sin que el propio evaluador sea bloqueado por rechaces sistemáticos, facilitando la caracterización de vulnerabilidades en pipelines propios.
- Moderación de contenido y estudios de taxonomía de daño: al no rechazar por defecto, permite analizar y clasificar prompts dañinos en corpus de investigación, comparando la respuesta del modelo abliterado con la del base para calibrar clasificadores.
- Evaluación comparativa de abliteration: usar las distintas cuantizaciones (Q8_0 frente a IQ2_M) para medir el impacto de la compresión en la tasa de rechazo y en la coherencia, con metodología reproducible vía llama-server.
- Despliegue on-premise en entornos privados: al ser GGUF y ejecutable con llama.cpp, encaja en infraestructuras air-gapped donde no se permite enviar datos a APIs externas, un caso alineado con el enfoque de xCloudinfo.
- Asistente multimodal local: con el mmproj cargado, permite consultas sobre imágenes (documentos escaneados, capturas, diagramas) en chino e inglés dentro de estaciones de trabajo con GPU de consumo.
- Generación de contenido en chino tradicional: el autor verifica fluidez y corrección en zh-TW, útil para localización de contenidos y atención al cliente en mercados de habla china con requisitos de privacidad.
- Experimentación con decodificación y cuantización: los niveles IQ4_XS e IQ2_M con imatrix permiten estudiar el equilibrio entre tamaño (10-14,4 GB) y calidad en hardware limitado.

## Benchmarks y rendimiento

El autor publica únicamente una métrica propia de rechazo, no benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Original Qwen3.8-27B | Este modelo (Q4_K_M) |
|---|---|---|
| Tasa de rechazo (10 prompts held-out de daño grave, thinking off) | aprox. 10/10 | 0/10 |
| Coherencia de salida | no medido | verificada (salidas vacías o fragmentarias no cuentan como aprobado) |
| Fluidez en chino tradicional (muestra cualitativa) | no disponible | verificada sin degradación aparente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q8_0 ~28,6 GB; Q6_K ~22,1 GB; Q5_K_M ~19,2 GB; Q4_K_M ~16,5 GB; IQ4_XS ~14,4 GB; IQ2_M ~10,0 GB; añadir ~0,9 GB si se carga el proyector visual mmproj.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M e IQ4_XS; RTX 3090 (24 GB) equivalente; GPUs de 12-16 GB (RTX 4080, 4070 Ti Super) para IQ2_M o IQ4_XS con contexto moderado.
- Cabe en GPU de consumo: sí, desde IQ2_M (10 GB) hasta Q5_K_M (19,2 GB) en tarjetas de 24 GB; Q8_0 requiere 32 GB o más o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y derivados compatibles con GGUF; vLLM, TGI y Ollama no están confirmados en la información proporcionada (Ollama puede importar GGUF de forma genérica, pero no se documenta en la model card).
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 26,9 mM | no disponible | GGUF + mmproj | apache-2.0 | Abliterado, 0/10 rechaces medidos, multimodal |
| Qwen/Qwen3.8-27B (base) | 26,9 mM | no disponible | safetensors | apache-2.0 | Aprox. 10/10 rechaces; referencia de calidad |
| Otras abliterations comunitarias de Qwen3.8-27B | no disponible | no disponible | GGUF | no disponible | El autor indica que muchas no publican medición de rechazo |
| Alternativas abliteradas de tamaño similar (p. ej. familias Llama o Mistral abliteradas) | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La abliteration direccional única no garantiza la eliminación total de comportamientos de seguridad; el propio autor advierte que no debe interpretarse como supresión completa.
- El modelo hereda el mundo ideológico, posiciones políticas y afirmaciones fácticas del base Qwen3.8 (origen chino); la abliteration solo modifica la conducta de rechazo, no los juicios de valor subyacentes.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de calibración; al desactivar rechaces, es más probable que el modelo produzca contenido plausible pero incorrecto en lugar de abstenerse.
- Idiomas limitados a chino (simplificado y tradicional) e inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Longitud de contexto no documentada; no se puede garantizar comportamiento en ventanas largas ni en tareas de recuperación de contexto.
- Licencia Apache-2.0 permite uso comercial, pero el autor impone una condición de uso exclusivamente lícito (investigación de seguridad, red teaming, moderación, academia); el usuario asume toda la responsabilidad legal y ética.
- Uso prohibido para actividades ilegales; el publicador no respalda ni se responsabiliza por mal uso.
- La evaluación de rechazo se basa en 10 prompts held-out con thinking desactivado, un conjunto pequeño y no independiente de posibles sesgos de selección; no sustituye una evaluación de seguridad amplia.
- La cuantización IQ2_M (10 GB) puede degradar calidad y coherencia; no se publican métricas específicas por nivel de cuantización.
- No hay datos sobre tool calling, agentes, ni latencia en producción, lo que limita su uso en pipelines automatizados críticos sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Perfil del autor: https://hf.co/xCloudinfo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Referencia metodológica de ablación direccional: Arditi et al. 2024 (Refusal in Language Models Is Mediated by a Single Direction), https://arxiv.org/abs/2406.11717
- llama.cpp: https://github.com/ggml-org/llama.cpp
