# tinyopsec/Dolphin3.0-Llama3.2-1B-GGUF

## Resumen

Dolphin3.0-Llama3.2-1B-GGUF es una colección de cuantizaciones en formato GGUF del modelo dphn/Dolphin3.0-Llama3.2-1B, producidas con llama.cpp por el usuario tinyopsec. El modelo base es Llama-3.2-1B de Meta, un transformer decoder-only de 1.235.818.528 parámetros (1,24 B), afinado por el equipo Dolphin como modelo instruccional de tipo "uncensored" (sin filtros de alineación restrictivos), lo que permite controlarlo mediante el system prompt para ajustar su comportamiento.

La serie Dolphin 3.0 aborda un problema concreto: los modelos base de Meta vienen con guardrails de alineación que limitan ciertos casos de uso legítimos (investigación en seguridad, ficción, análisis de contenido sensible). Dolphin elimina esos rechazos por defecto y devuelve el control al desarrollador. Esta ficha recoge la variante de 1B, pensada para ejecutarse localmente en hardware modesto, incluso en portátiles sin GPU dedicada.

Es relevante ahora porque cubre el nicho de los modelos ultracompactos "steerable": con cuantizaciones desde F16 hasta Q2_K, el modelo cabe en menos de 1 GB de RAM en Q2_K, lo que lo hace ideal para edge, prototipado rápido y agentes ligeros donde la latencia y el consumo importan más que la máxima calidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.818.528 (≈1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Llama 3.2 1B base soporta 128K tokens según la documentación de Meta) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (Llama 3.2 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Meta Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizado con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B: un transformer decoder-only optimizado para dispositivos con recursos limitados. El modelo base de Meta fue preentrenado por Meta con hasta 9 billones de tokens (dato oficial de la familia Llama 3.2, no de esta model card). Sobre esa base, el equipo Dolphin aplicó un afinado instruccional para producir Dolphin 3.0, orientado a seguir instrucciones, generar código y responder sin los rechazos por defecto de los modelos alineados con RLHF restrictivo. Los detalles concretos del dataset de afinado (número de tokens, composición, uso de DPO) no están disponibles en la model card de este repositorio.

La innovación de este repositorio en sí no es arquitectónica sino de distribución: cuantizaciones GGUF producidas con llama.cpp en trece niveles de precisión distintos, desde F16 (3,0 GB) hasta Q2_K, lo que permite elegir el equilibrio entre calidad y huella de memoria. El repositorio completo pesa 12,5 GB.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, etiqueta "conversational").
- Seguimiento de instrucciones gracias al afinado instruct de la serie Dolphin 3.0.
- Comportamiento "uncensored": no aplica rechazos por defecto; el comportamiento se controla mediante el system prompt, lo que lo hace "steerable".
- Compatibilidad total con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y similares.
- Generación de código a nivel básico, heredada del afinado Dolphin (con las limitaciones propias de un modelo de 1B).
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la model card; no hay evidencia de que el modelo las soporte.

## Casos de uso

- Chatbots locales y privados: al ejecutarse íntegramente en local con llama.cpp u Ollama, ningún dato sale del dispositivo, ideal para asistentes que manejan información sensible en entornos sin conexión.
- Prototipado de agentes ligeros: con menos de 1 GB en Q2_K/Q3_K, permite orquestar varios procesos de modelo en paralelo en una misma máquina para pruebas de arquitecturas multi-agente de bajo coste.
- Integración en aplicaciones de escritorio: LM Studio o koboldcpp permiten incrustar el modelo en herramientas de productividad offline (resúmenes, redacción, reformateo de texto) sin dependencia de API externas.
- Investigación en alineación y seguridad: al ser un modelo uncensored y steerable vía system prompt, es útil para estudiar comportamientos sin filtros, red-teaming y análisis de jailbreaks en un modelo pequeño y barato de iterar.
- Ficción y escritura creativa sin restricciones: el carácter uncensored permite generar contenido narrativo maduro que los modelos alineados rechazarían, con control fino mediante prompts de sistema.
- Edge e IoT con aceleración limitada: las cuantizaciones Q3/Q4 permiten inferencia en CPU o GPUs modestas, adecuado para dispositivos embebidos con soporte de llama.cpp.
- Generación sintética de datos de bajo coste: su tamaño reduce drásticamente el coste de inferencia masiva para preetiquetado o aumento de datos cuando la calidad de un 1B es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco en la model card del repositorio cuantizado. Para datos de rendimiento del modelo original puede consultarse la ficha de dphn/Dolphin3.0-Llama3.2-1B, pero este repositorio no incluye métricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: F16 ≈ 3,0 GB; Q8_0 ≈ 1,6 GB; Q4_K_M ≈ 0,8-0,9 GB; Q2_K ≈ 0,5-0,6 GB (estimaciones a partir del tamaño F16 declarado y la ratio típica de cada cuantización; los tamaños exactos por fichero no están todos indicados en la model card).
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB de VRAM (por ejemplo GTX 1650 o superior) acelera la inferencia. Para este tamaño no se justifican A100 ni H100 salvo despliegues masivos.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU pura, donde un portátil moderno alcanza velocidades de decodificación utilizables para un modelo de 1B.
- Opciones de despliegue: llama.cpp (llama-cli, ejemplo incluido en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay pesos safetensors en este repositorio, por lo que vLLM y TGI no aplican directamente a estos ficheros.
- Latencia y throughput: no disponibles; en CPU moderna se esperan decenas de tokens por segundo para un modelo de 1B cuantizado a 4 bits, pero no hay medias publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Caracteristica diferencial |
|---|---|---|---|---|
| Dolphin3.0-Llama3.2-1B (este) | 1,24 B | GGUF (13 cuantizaciones) | Llama 3.2 Community | Uncensored, steerable, muy ligero |
| Qwen2.5-1.5B-Instruct | 1,5 B | safetensors, GGUF comunitarios | Apache 2.0 (algunos ficheros Qwen Research) | Multilingue fuerte, buen rendimiento por tamaño, alineado |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,7 B | safetensors, GGUF comunitarios | Apache 2.0 | Entrenado por Hugging Face, licencia permisiva, optimizado para edge |
| Llama-3.2-1B-Instruct (Meta) | 1,24 B | safetensors, GGUF comunitarios | Llama 3.2 Community | Modelo base alineado con guardrails; Dolphin elimina esos rechazos |

En términos de parámetros, este modelo es el más pequeño del grupo y el único explícitamente uncensored. Frente a Qwen2.5-1.5B y SmolLM2-1.7B, ofrece menor tamaño y mayor libertad de uso, pero presumiblemente menor calidad en razonamiento y multilingüismo (sin benchmarks publicados en este repositorio para confirmarlo).

## Limitaciones y advertencias

- Al ser un modelo uncensored, generará contenido ofensivo, peligroso o inapropiado si se le pide; es responsabilidad del desarrollador implementar sus propias salvaguardas antes de exponerlo a usuarios finales.
- Riesgo de alucinación elevado, típico de modelos de ~1B: puede inventar hechos, código incorrecto o respuestas plausibles pero falsas. No apto para tareas que exijan factualidad sin verificación externa.
- La calidad de razonamiento y matemáticas es limitada por su tamaño; no es sustituto de modelos de 7B o superiores en tareas complejas.
- Licencia Meta Llama 3.2 Community: permite uso comercial, pero con restricciones (marcado "Llama" en derivados, límites para plataformas con más de 700 millones de usuarios mensuales, y aceptación de la política de uso aceptable de Meta). Revisar el texto completo antes de desplegar en producción.
- La cuantización extrema (Q2_K, Q3_K_S) degrada apreciablemente la calidad; la model card recomienda Q4_K_M como punto de equilibrio.
- Datos de contexto, idiomas soportados oficialmente y benchmarks: no disponibles en la model card de este repositorio.
- Repositorio de terceros (tinyopsec): las cuantizaciones no son oficiales de Cognitive Computations (equipo Dolphin) ni de Meta; verificar la integridad de los ficheros antes de uso en producción.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/tinyopsec/Dolphin3.0-Llama3.2-1B-GGUF
- Modelo original Dolphin 3.0: https://huggingface.co/dphn/Dolphin3.0-Llama3.2-1B
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
- Licencia Meta Llama 3.2 Community: https://huggingface.co/meta-llama/Meta-Llama-3.2-1B/blob/main/LICENSE.txt (referencia de la licencia aplicable)
- llama.cpp: https://github.com/ggerganov/llama.cpp
