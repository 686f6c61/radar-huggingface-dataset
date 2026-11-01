# tinyopsec/Qwimi-4B-GGUF

## Resumen

Qwimi-4B-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwimi-4B, publicado por el usuario tinyopsec en Hugging Face. El modelo original (Rumiii/Qwimi-4B) es un Qwen3-4B destilado a partir de Kimi K2, un modelo de gran escala, con el objetivo de transferir sus capacidades de llamada de herramientas (tool calling) y comportamiento agéntico a un modelo pequeño de unos 4.000 millones de parámetros. El resultado es un modelo ligero, ejecutable localmente, orientado a casos de uso conversacionales y de agentes.

Su relevancia reside en la tendencia actual de destilar modelos frontiers muy grandes en modelos compactos que pueden correr en hardware de consumo sin sacrificar de forma drástica las capacidades de agente y tool calling. Al basarse en Qwen3-4B-Instruct-2507 (arquitectura transformer densa de 4.022 millones de parámetros, según los datos de safetensors del repositorio) y distribuirse en GGUF, el modelo es compatible directamente con llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes locales. La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwimi-4B parte de Qwen/Qwen3-4B-Instruct-2507, un modelo transformer denso de la familia Qwen3 con aproximadamente 4.020 millones de parámetros. Sobre esa base, el modelo se ha destilado desde Kimi K2, un modelo de gran escala conocido por sus capacidades agénticas, con el fin de transferir a la versión compacta su comportamiento en llamadas de herramientas y razonamiento multi-paso. La model card no detalla el método exacto de destilación, el número de tokens de entrenamiento ni la composición del dataset.

No hay información disponible sobre técnicas adicionales de alineación (RLHF, DPO) ni sobre innovaciones arquitectónicas específicas más allá de la destilación. La distribución en GGUF se ha realizado con llama.cpp, y el repositorio completo ocupa 39,3 GB, lo que indica que se incluyen todas las cuantizaciones desde F16 (~8 GB) hasta Q2_K.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Tool calling / function calling: capacidad principal del modelo, reforzada mediante destilación desde Kimi K2.
- Comportamiento agéntico: diseñado para flujos de agentes que combinan razonamiento y ejecución de herramientas.
- Compatibilidad con runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp), lo que facilita su integración en aplicaciones locales.
- No hay información disponible sobre capacidades multimodales (visión, audio) ni sobre un modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes locales con tool calling: el modelo puede integrarse en frameworks de agentes (LangChain, LlamaIndex, scripts propios) que se ejecutan en local, invocando funciones definidas por el desarrollador sin enviar datos a APIs externas.
- Asistentes de línea de comandos: gracias a su tamaño y a la compatibilidad con llama-cli, es adecuado para asistentes que ejecutan comandos, consultan documentación o gestionan tareas del sistema desde la terminal.
- Automatización de flujos de trabajo (RPA ligero): su destilación agéntica lo hace apropiado para pipelines que encadenan decisiones y llamadas a herramientas (lectura de correo, clasificación de tickets, orquestación de scripts).
- Prototipado de agentes en hardware de consumo: con la cuantización Q4_K_M (~2,5 GB aproximados) cabe en GPUs de 8 GB o incluso en CPU, lo que permite iterar rápidamente en diseño de agentes sin coste de inferencia en la nube.
- Atención al cliente on-premise: puede gestionar conversaciones multi-turno con integración de herramientas de consulta (CRM, bases de datos) en entornos donde la privacidad impide usar servicios externos.
- Integración en aplicaciones de escritorio: distribuido en GGUF, puede empaquetarse con LM Studio u Ollama para ofrecer funcionalidades de asistente dentro de software comercial, sin dependencias de red.
- Educación y experimentación: su tamaño reducido y su licencia permisiva lo hacen útil para estudiar destilación de capacidades agénticas y comportamiento de tool calling en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización de un modelo de ~4 B de parámetros):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M: ~3 GB
  - Q4_K_M: ~2,5 GB
  - Q3_K_M / Q2_K: ~2 GB o menos
- GPU recomendadas: cualquier GPU con 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) ejecuta con holgura las cuantizaciones de 4-6 bits; con 12-16 GB (RTX 4080, RTX 4090) corre F16 sin problema. En CPU moderna también es viable, especialmente con Q4_K_M.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU de consumo desde 6 GB de VRAM usando Q4_K_M o inferiores, e incluso solo con CPU/RAM (8 GB recomendados).
- Opciones de despliegue: llama.cpp (nativo, ejemplo en la model card: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay menención a vLLM o TGI, que requieren formatos de pesos distintos.
- Latencia y throughput: no disponible; al ser un modelo denso de 4 B, se espera latencia baja y buena velocidad de generación en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwimi-4B-GGUF | ~4,02 B | GGUF | Apache 2.0 | Tool calling agéntico (destilado de Kimi K2) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,02 B | Safetensors (GGUF de terceros disponibles) | Apache 2.0 | Modelo base instruido generalista |
| Qwen/Qwen3-4B-Thinking-2507 | ~4,02 B | Safetensors (GGUF de terceros disponibles) | Apache 2.0 | Razonamiento extendido (thinking mode) |

Nota: la comparativa se limita a la familia inmediata, ya que la model card no proporciona datos de rendimiento que permitan comparar con otras alternativas de forma rigurosa. Qwimi-4B se diferencia de su modelo base en su ajuste específico para tool calling agéntico; frente a la variante Thinking de Qwen3, prioriza la ejecución de herramientas sobre el razonamiento extendido explícito.

## Limitaciones y advertencias

- El propio autor incluye un aviso: es un modelo agéntico de tool calling y debe evaluarse antes de su uso en producción; no hay garantías de fiabilidad en la ejecución de herramientas.
- No se han publicado benchmarks ni evaluaciones, por lo que la calidad real del tool calling tras la destilación no está verificada de forma independiente.
- Cuantizaciones agresivas (Q3, Q2_K) degradan notablemente la precisión en tareas de tool calling, donde el formato exacto de las llamadas es crítico; se recomienda Q4_K_M o superior.
- No hay información sobre idiomas soportados ni longitud de contexto; el contexto efectivo dependerá de la configuración del runtime y de los valores del modelo base Qwen3-4B-Instruct-2507.
- El riesgo de alucinación es inherente al modelo base y no se ha mitigado documentadamente; en flujos agénticos, las alucinaciones pueden traducirse en llamadas a herramientas incorrectas.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero hay que cumplir sus términos de atribución y aviso de licencia.
- El repositorio ocupa 39,3 GB al incluir todas las cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Qwimi-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original destilado: https://huggingface.co/Rumiii/Qwimi-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible.
