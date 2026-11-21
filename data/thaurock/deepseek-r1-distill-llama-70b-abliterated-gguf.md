# Thaurock/DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF

## Resumen
DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated, publicada por el usuario Thaurock. El modelo subyacente es una destilación de las capacidades de razonamiento de DeepSeek-R1 sobre la arquitectura Llama-70B de Meta, a la que se ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo y filtrado de censura del sistema. El resultado es un modelo de 70.553.706.560 parámetros (aproximadamente 70,5B) que genera respuestas sin restricciones y mantiene una cadena de pensamiento explícita.

El repositorio ofrece una colección completa de cuantizaciones que va desde F16 (~141,1 GB) hasta Q2_K (~26,4 GB), pasando por Q8_0, Q6_K, Q5_K_M y Q4_K_M, lo que permite desplegar el modelo tanto en GPUs de datacenter como en configuraciones domésticas avanzadas. El formato GGUF lo hace directamente compatible con llama.cpp, Ollama, LM Studio y Text-Generation-WebUI, y los tags del repositorio indican compatibilidad con endpoints conversacionales.

Su relevancia actual reside en dos factores: por un lado, la demanda de modelos de razonamiento abiertos que puedan ejecutarse en local sin dependencia de APIs; por otro, la existencia de una variante "uncensored" orientada a investigación, red teaming y generación de contenido sin las negativas automáticas que caracterizan a los modelos alineados convencionalmente. La licencia Apache 2.0 permite uso comercial, aunque el propio autor declara que el modelo carece de filtros de seguridad artificiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-70B, destilado de DeepSeek-R1) |
| Parametros totales | 70.553.706.560 (~70,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 584,2 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento
El modelo es un transformer denso de arquitectura Llama con aproximadamente 70,5B parámetros, derivado de la destilación de DeepSeek-R1 sobre Llama-70B. La destilación transfiere las capacidades de razonamiento del modelo original, incluyendo la generación de una cadena de pensamiento interna antes de emitir la respuesta final. Sobre esa base, huihui-ai aplicó abliteration, una técnica que identifica y proyecta fuera las direcciones del espacio de activaciones responsables de los comportamientos de rechazo, eliminando los bloqueos de censura sin reentrenar el modelo desde cero.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en la destilación original. El autor del repositorio GGUF no documenta detalles adicionales del proceso de cuantización más allá de los perfiles BPW y tamaños estimados. La innovación técnica destacable es doble: la destilación de razonamiento de DeepSeek-R1 y la eliminación de filtros mediante abliteration, que preserva el árbol de razonamiento lógico según el autor.

## Capacidades
- Generación de texto con razonamiento profundo y cadena de pensamiento explícita (thinking mode mediante tags internas).
- Razonamiento lógico y matemático derivado de la destilación de DeepSeek-R1.
- Generación de código y resolución de problemas técnicos.
- Respuestas sin restricciones ni negativas automáticas gracias a la abliteration (orientado a investigación y red teaming).
- Compatibilidad con endpoints conversacionales y pipeline de text-generation.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso
- Investigación en seguridad y red teaming: el modelo permite estudiar el comportamiento de un LLM sin filtros de rechazo, lo que resulta útil para evaluar riesgos, diseñar defensas y analizar sesgos sin las negativas automáticas que ocultan las respuestas del modelo alineado.
- Razonamiento matemático asistido: la cadena de pensamiento destilada de DeepSeek-R1 permite abordar problemas de varios pasos, demostraciones y verificación de cálculos en entornos de investigación donde se necesita trazabilidad del razonamiento.
- Generación de código en local: con la cuantización Q4_K_M (~42,5 GB) puede ejecutarse en configuraciones domésticas avanzadas y emplearse para autocompletado, revisión de código y explicación de algoritmos sin enviar datos a APIs externas.
- Análisis de documentación técnica sensible: al ejecutarse íntegramente en local con llama.cpp u Ollama, permite procesar material confidencial (propiedad intelectual, datos médicos o jurídicos) sin exposición a terceros.
- Experimentación con cuantizaciones: la colección completa de F16 a Q2_K permite medir el impacto de la compresión en la coherencia del árbol de razonamiento, útil para publicaciones sobre eficiencia de inferencia.
- Desarrollo de asistentes conversacionales sin censura para entornos controlados: el formato GGUF y la compatibilidad con Text-Generation-WebUI facilitan prototipos de chat multi-turno en laboratorios o sandboxes aislados.
- Evaluación comparativa de técnicas de abliteration: permite contrastar el modelo abliterado con el original destilado y medir diferencias en calidad de razonamiento, coherencia y tasas de rechazo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto): F16 ~141,1 GB; Q8_0 ~75,0 GB; Q6_K ~57,9 GB; Q5_K_M ~49,9 GB; Q5_K_S ~48,7 GB; Q4_K_M ~42,5 GB; Q4_K_S ~40,3 GB; Q3_K_L ~37,1 GB; Q3_K_M ~34,3 GB; Q3_K_S ~30,9 GB; Q2_K ~26,4 GB.
- GPU recomendadas: NVIDIA A100 para Q8_0 según el autor; NVIDIA CMP-170HX para Q6_K; para Q4_K_M se necesitan configuraciones domésticas avanzadas, típicamente múltiples GPUs o offloading parcial a RAM.
- ¿Cabe en consumer GPU? Q2_K (~26,4 GB) y Q3_K_S (~30,9 GB) pueden caber en GPUs de 32-48 GB con offloading parcial; Q4_K_M requiere al menos 48 GB de VRAM o reparto entre GPU y RAM del sistema. Ninguna cuantización cabe en una RTX 4090 de 24 GB sin offloading.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, Text-Generation-WebUI; el formato GGUF no es compatible directamente con vLLM ni TGI sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF (este) | ~70,5B | no disponible | Apache 2.0 | GGUF | Variante abliterada, sin filtros, colección completa de cuantizaciones |
| huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated | ~70,5B | no disponible | Apache 2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| DeepSeek-R1-Distill-Llama-70B (original) | ~70,5B | no disponible | Apache 2.0 | safetensors | Versión alineada con filtros de seguridad convencionales |
| Llama-3.3-70B-Instruct | ~70,5B | 128K (según documentación de Meta) | Llama 3.3 Community License | safetensors, GGUF | Modelo generalista de Meta, con alineación estándar |

## Limitaciones y advertencias
- Ausencia total de filtros de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin advertencia. El autor declara que el contenido generado es responsabilidad exclusiva del operador.
- Riesgo elevado de alucinación: los modelos de razonamiento destilados pueden producir cadenas de pensamiento plausibles pero incorrectas; la eliminación de filtros no corrige este comportamiento.
- Idiomas soportados no documentados: no hay información oficial sobre cobertura multilingüe; el rendimiento en castellano o otros idiomas distintos del inglés no está verificado.
- Longitud de contexto no disponible: no se especifica la ventana de contexto efectiva del modelo destilado ni del GGUF, lo que impide planificar aplicaciones con documentos largos.
- Cuantizaciones extremas degradadas: el propio autor advierte que Q2_K puede presentar problemas en la estructura de las etiquetas internas de razonamiento y solo se recomienda para desarrollo experimental.
- Repositorio de gran tamaño (584,2 GB): la descarga completa es inviable para la mayoría de usuarios; conviene descargar únicamente el archivo de cuantización necesario.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado sin filtros recae sobre el operador; conviene revisar las implicaciones en jurisdicciones con regulación de contenido.
- Sin soporte documentado de tool calling ni de despliegue en vLLM/TGI sin conversión previa de formato.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Thaurock/DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated
- Perfil del autor de la abliteration: https://huggingface.co/huihui-ai
- Perfil del autor de las cuantizaciones: https://huggingface.co/Thaurock
