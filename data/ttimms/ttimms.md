# Ttimms/Ttimms

## Resumen

Ttimms/Ttimms es un repositorio de Tremayne Timms que agrupa varios modelos open-source optimizados para ejecutarse en una GPU de consumidor con 16 GB de VRAM, concretamente la RTX 5070 Ti (Blackwell, SM120). El proyecto combina cuantización nativa NVFP4, pesos en formato GGUF y podado de expertos mediante la técnica REAP (*Router-weighted Expert Activation Pruning*) para reducir el tamaño de modelos MoE de gran escala sin necesidad de reentrenarlos. Incluye tres modelos destacados: KAT-Coder-V2.5-Dev REAP-50 NVFP4A16, un MoE de código de Kwaipilot podado al 50% y cuantizado a 4 bits; Ornith-1.5-35B-A3B REAP-50 NVFP4A16, un MoE de texto de 36B con 3B activos; y Bible-Assistant Qwen3.5-4B v3.2, un fine-tune de Qwen3.5-4B con recuperación para preguntas y respuestas sobre escrituras. Todos publican también versiones en GGUF y checkpoints bf16 podados para que otros generen sus propias cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KAT-Coder: MoE de código (base de Kwaipilot) podado 50% con REAP + NVFP4A16. <br> Ornith: MoE de texto 36B (35B-A3B) podado 50% con REAP + NVFP4A16. <br> Bible-Assistant: fine-tune de Qwen3.5-4B con recuperación |
| Parametros totales | KAT-Coder: no disponible. <br> Ornith: 36B (según autor). <br> Bible-Assistant: 4B |
| Parametros activos | KAT-Coder: no disponible. <br> Ornith: 3B (según nomenclatura 35B-A3B). <br> Bible-Assistant: no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | KAT-Coder y Ornith: NVFP4A16, GGUF y bf16 podado. <br> Bible-Assistant: no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | KAT-Coder y Ornith: NVFP4A16 y GGUF. <br> Bible-Assistant: no disponible |

## Arquitectura y entrenamiento

Los modelos MoE de este repositorio se reducen mediante dos técnicas complementarias. REAP es un podado de expertos basado en la activación ponderada por el router: se elimina el 50% de los expertos (256 -> 128) y se aplica una renormalización del router sobre los supervivientes. Esto permite que un MoE de 35-36B quepa en una GPU de consumidor sin necesidad de una ejecución de destilación. La cuantización NVFP4 es nativa de Blackwell (SM120), con pesos en 4 bits y activaciones en 16 bits, y se sirve a través de `compressed-tensors` y vLLM; el autor indica explícitamente que no es un repack de un k-quant.

Por otro lado, Bible-Assistant es un fine-tune de Qwen3.5-4B orientado a preguntas y respuestas sobre escrituras con recuperación (RAG). No se dispone de información sobre la composición del dataset ni el número de tokens de entrenamiento. Los evals publicados se realizan sobre el checkpoint exacto liberado, con prompt instructivo, métricas greedy, intervalos de confianza Wilson, descontaminación y protocolo versionado; en casos no deterministas se repiten muestreos y se reporta la dispersión entre ejecuciones.

## Capacidades

- KAT-Coder muestra generación de código de alta precisión: HumanEval+ 89.0% y MBPP+ 90.5%.
- KAT-Coder resuelve 26 de 50 tareas en SWE-bench Verified, lo que indica capacidad de razonamiento sobre repositorios reales.
- Ornith logra HumanEval+ 84.2% (intervalo Wilson [77.8, 88.9]) y 22/50 (44.0%) en SWE-bench.
- Ornith es un MoE de texto con 3B activos, por lo que cada token activa una fracción reducida de parámetros, mejorando eficiencia en inferencia.
- Bible-Assistant ofrece recuperación de citas bíblicas con 80.3% de recall verbatim, 98.9% de citas correctas y 1.9% de alucinación.
- Todos los checkpoints de KAT-Coder y Ornith incluyen versiones GGUF y bf16 podado, lo que permite generar cuantizaciones personalizadas (AWQ, EXL2, MLX, GGUF).
- No se menciona soporte de tool calling, function calling, ni capacidades de visión o audio.

## Casos de uso

- Asistencia de código en el IDE: KAT-Coder puede integrarse en extensiones de editor para autocompletar y generar funciones, apoyándose en su alto rendimiento en HumanEval+ (89.0%).
- Resolución de issues en repositorios: el 26/50 en SWE-bench Verified permite usarlo en pipelines de CI/CD para proponer parches sobre problemas de GitHub.
- Inferencia local con MoE en una GPU de consumidor: Ornith, con 3B activos, permite aplicaciones de chat y asistencia técnica en un RTX 5070 Ti de 16 GB sin depender de infraestructura en la nube.
- Despliegue en entornos offline o con privacidad de datos: los pesos en GGUF pueden ejecutarse con llama.cpp u Ollama, mediante consulta en CPU o GPU de gama media.
- Sistema de preguntas y respuestas teológicas: Bible-Assistant es adecuado para aplicaciones que necesiten citar versículos con precisión y baja alucinación, gracias a su fine-tune con recuperación.
- Investigación en eficiencia de modelos: los checkpoints REAP-50 y las cuantizaciones NVFP4 sirven como referencia para estudiar el efecto del podado de expertos y la cuantización de 4 bits en MoEs grandes.
- Prototipado de pipelines RAG de dominio específico: Bible-Assistant demuestra un caso práctico de fine-tune sobre un corpus acotado, lo que puede replicarse para otros dominios.

## Benchmarks y rendimiento

| Modelo | HumanEval+ | MBPP+ | SWE-bench | Medición adicional |
|---|---|---|---|---|
| KAT-Coder-V2.5-Dev REAP-50 NVFP4A16 | 89.0% | 90.5% | 26/50 (Verified) | Greedy + instruct framing |
| Ornith-1.5-35B-A3B REAP-50 NVFP4A16 | 84.2% [77.8, 88.9] | no disponible | 22/50 (44.0%) | Intervalo de confianza Wilson |
| Bible-Assistant Qwen3.5-4B v3.2 | no aplica | no aplica | no aplica | 80.3% recall verbatim, 98.9% citas, 1.9% alucinación |

No se han publicado resultados comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12.45 GiB para KAT-Coder y 12.47 GiB para Ornith en formato NVFP4A16, con holgura para una GPU de 16 GB. Bible-Assistant, al ser un modelo de 4B, cabe en GPUs de 8-16 GB sin problema.
- GPU recomendadas: NVIDIA RTX 5070 Ti (Blackwell, SM120) para ejecutar NVFP4; en GPUs sin soporte FP4 nativo deben usarse las versiones GGUF.
- Consumer GPU: sí, siempre que se usen las cuantizaciones apropiadas (GGUF o NVFP4 en Blackwell).
- Opciones de despliegue: vLLM con `compressed-tensors` para NVFP4; llama.cpp, Ollama, MLX o TGI para GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Cuantización | HumanEval+ | SWE-bench |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev REAP-50 NVFP4A16 | no disponible (MoE base de Kwaipilot) | 12.45 GiB | NVFP4A16 | 89.0% | 26/50 Verified |
| Ornith-1.5-35B-A3B REAP-50 NVFP4A16 | 36B total, 3B activos | 12.47 GiB | NVFP4A16 | 84.2% | 22/50 |
| Bible-Assistant Qwen3.5-4B v3.2 | 4B | no disponible | no disponible | no aplica | no aplica |

La comparación se limita a los modelos publicados en este repositorio; no se dispone de datos para comparar con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: debe verificarse con el autor antes de cualquier uso comercial o redistribución.
- NVFP4 requiere GPUs Blackwell con soporte FP4 (SM120); en GPUs de generaciones anteriores solo funcionan las versiones GGUF.
- REAP elimina el 50% de los expertos, por lo que el rendimiento puede ser inferior al del modelo original sin podar; los benchmarks publicados corresponden al checkpoint liberado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Idiomas soportados no especificados: es probable que el corpus de código y texto esté mayoritariamente en inglés, pero no hay confirmación.
- Bible-Assistant está especializado en escrituras religiosas y puede reflejar sesgos teológicos; debe usarse como herramienta de apoyo y no como fuente autorizada.
- El riesgo de alucinación se ha medido en Bible-Assistant (1.9%), pero no se reporta en KAT-Coder ni Ornith, por lo que requiere evaluación propia en producción.
- Los resultados de SWE-bench para Ornith no se especifican como "Verified", lo que impide una comparación directa con KAT-Coder.

## Enlaces

- https://huggingface.co/Ttimms/Ttimms
- https://huggingface.co/Ttimms/models
- https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2
- https://github.com/t-timms
