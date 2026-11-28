# Walkowicz/kairos-sophron-3.0-4b

## Resumen

Kairos Sophron 3.0 · 4B es un modelo de decisión especializado en ingeniería de software, desarrollado por el usuario Walkowicz y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16` de NVIDIA, orientado específicamente a la generación de parches de código deterministas y a tareas de verificación en el ámbito del desarrollo de software. El modelo se distribuye principalmente en formato GGUF y MLX, lo que lo hace desplegable en entornos locales y en Apple Silicon.

La propuesta del autor se centra en un motor de entrenamiento denominado "Two-Phase Zero-Distillation Engine", que combina un ajuste supervisado con LoRA (SFT) y un entrenamiento por refuerzo con GRPO y verificación de ejecución (RLVR). El modelo incorpora enrutamiento recurrente de profundidad (k = 1, 2, 4), una técnica que permite ajustar el coste computacional en tiempo de inferencia según la complejidad de la tarea. Según la model card, con solo 3.975 millones de parámetros y un peso de 2,84 GB en cuantización Q5_K_M, supera a modelos de referencia de 14B en generación de parches deterministas.

El modelo es bilingüe inglés y portugués (50/50 según la model card), con una licencia OpenMDW-1.1 que permite uso comercial bajo ciertas condiciones. Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados que pueden ejecutarse en hardware de consumo, ofreciendo capacidades de razonamiento y generación de código con un coste muy reducido frente a alternativas de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con enrutamiento recurrente de profundidad (k = 1, 2, 4); basado en NVIDIA Nemotron Labs Dory1.0-4B |
| Parametros totales | 3.975.229.440 (aproximadamente 3,98B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (2,84 GB), UD-Q3 (2,14 GB), BF16 (7,96 GB); formatos GGUF y MLX |
| Idiomas soportados | Ingles y portugues (50/50 segun model card) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF, MLX, safetensors (repo de 12,9 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del NVIDIA Nemotron Labs Dory1.0-4B, un transformer de aproximadamente 4.000 millones de parámetros. La innovación principal introducida por Walkowicz es el enrutamiento recurrente de profundidad (k = 1, 2, 4), que permite al modelo reutilizar capas internas de forma iterativa un número variable de veces según la complejidad de la tarea. Este mecanismo, similar en espíritu a los enfoques de "recurrent depth" o "looped transformers", permite ajustar el coste computacional en tiempo de inferencia sin necesidad de reentrenar el modelo.

El entrenamiento se realizó mediante un proceso denominado "Two-Phase Zero-Distillation Engine", que combina una primera fase de ajuste supervisado con LoRA (SFT) sobre datos de ingeniería de software, seguida de una fase de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) y verificación de ejecución (RLVR, Reinforcement Learning with Verifiable Rewards). En esta segunda fase, el modelo recibe recompensas basadas en la ejecución real del código generado, lo que según el autor reduce el "blast radius" de tokens en un 64,4% (es decir, genera parches más quirúrgicos y con menos cambios innecesarios). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de parches de código deterministas y quirúrgicos, con reducción del 64,4% en el "token blast radius" según la model card.
- Razonamiento orientado a decisiones de ingeniería de software: el modelo está etiquetado como "decision-model", lo que sugiere un enfoque en la selección de estrategias de implementación.
- Verificación de código y clean-code: entrenado con recompensas verificables por ejecución (RLVR), lo que le permite evaluar y corregir sus propias salidas.
- Soporte de tool calling / function calling: no se menciona explícitamente en la información disponible, pero el pipeline es text-generation y el tag "endpoints_compatible" sugiere compatibilidad con APIs de inferencia.
- Capacidades multilingües limitadas a inglés y portugués (50/50 según la model card).
- Modo de razonamiento ajustable mediante el parámetro k (profundidad recurrente): k=1 para respuestas rápidas, k=2 para equilibrio, k=4 para mayor profundidad de razonamiento.
- No se mencionan capacidades de visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Generación de parches en producción: el modelo puede generar cambios de código mínimos y verificables en pipelines de CI/CD, gracias a su entrenamiento con RLVR y su bajo "blast radius". Es adecuado para tareas de corrección de bugs donde se requiere precisión y no reescrituras masivas.
- Revisión de código automatizada: con su enfoque en clean-code y verificación, puede integrarse en herramientas de revisión estática para sugerir mejoras concretas y detectar malas prácticas, ejecutándose localmente en hardware de consumo.
- Asistente de desarrollo en local para Apple Silicon: la edición MLX permite ejecutar el modelo en Macs con chip Apple Silicon, ofreciendo un asistente de código privado y sin dependencia de la nube.
- Despliegue en entornos con recursos limitados: con 2,84 GB en Q5_K_M y 25,8 tok/s en una RTX 3060 (según la model card), es viable en estaciones de trabajo modestas o incluso en portátiles con GPU de gama media.
- Generación de tests unitarios: el modelo puede generar casos de prueba deterministas para funciones existentes, aprovechando su entrenamiento en verificación por ejecución.
- Educación y formación en ingeniería de software: puede utilizarse como modelo de referencia para enseñar patrones de clean-code y decisiones de diseño, con la ventaja de ser ejecutable localmente y en portugués e inglés.
- Automatización de tareas de refactorización menor: gracias a su capacidad de generar cambios quirúrgicos, puede emplearse para refactorizaciones controladas en bases de código existentes, con verificación posterior mediante tests.

## Benchmarks y rendimiento

| Benchmark | Kairos Sophron 3.0 · 4B | Notas |
|---|---|---|
| suite_v1 Clean-Code | 25/40 (62,5%) | Q5_K_M: 24/40; UD-Q3: 16/40 |
| Unseen RLVR Holdout | 0,813 mean reward | 9/15 perfectos; -64,4% token blast radius |
| Throughput en RTX 3060 | 25,8 tok/s (k=1); 17,2 tok/s (k=2) | Según model card |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos anteriores provienen exclusivamente de la model card del autor y no son directamente comparables con benchmarks académicos convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,14 GB en UD-Q3, 2,84 GB en Q5_K_M, 7,96 GB en BF16 (según la model card).
- GPU recomendadas: RTX 3060 (probada por el autor, 25,8 tok/s en k=1), GPUs con al menos 4 GB de VRAM para cuantizaciones Q5_K_M o UD-Q3. Para BF16 se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más. También en Apple Silicon mediante la edición MLX.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama (tag "ollama"), MLX (edición específica para Apple Silicon), y potencialmente vLLM o TGI si se convierte a safetensors, aunque no se mencionan explícitamente.
- Latencia y throughput estimados: 25,8 tok/s en RTX 3060 con k=1 y 17,2 tok/s con k=2 (según model card). No se proporcionan datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kairos Sophron 3.0 · 4B | ~3,98B | No disponible | OpenMDW-1.1 | GGUF, MLX, safetensors | Especializado en ingeniería de software, RLVR, enrutamiento recurrente |
| NVIDIA Nemotron Labs Dory1.0-4B | ~4B | No disponible | No disponible | BF16 | Modelo base; sin especialización en software |
| Modelos de código de ~4B (p. ej., Qwen2.5-Coder-3B, CodeLlama-7B) | 3-7B | 32K-128K (típico) | Apache 2.0 / Llama | GGUF, safetensors | No disponibles en la información proporcionada para comparación directa |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card. Al estar entrenado principalmente en inglés y portugués, puede tener un rendimiento inferior en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o inventar APIs. El entrenamiento con RLVR mitiga parcialmente este riesgo, pero no lo elimina; se recomienda verificación mediante tests.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; el soporte lingüístico se limita a inglés y portugués (50/50), lo que puede ser insuficiente para proyectos en otros idiomas.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial bajo ciertas condiciones, pero es necesario revisar los términos exactos en el enlace proporcionado. No es una licencia permisiva estándar como Apache 2.0 o MIT.
- Caveats para producción: el modelo está especializado en ingeniería de software y puede no ser adecuado para tareas generales de generación de texto. El rendimiento en benchmarks estándar no está documentado, lo que dificulta la comparación objetiva con alternativas. La información sobre el entrenamiento (número de tokens, composición del dataset) no está disponible, lo que limita la evaluación de su robustez.
- El modelo tiene 0 likes y 285 descargas en el momento de la ficha, lo que sugiere una adopción limitada y poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b
- Edición MLX: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b-mlx
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
