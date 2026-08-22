# tozp/Qwen3.8-27B-OBLITERATED-V2-mlx-4bit

## Resumen

El modelo `tozp/Qwen3.8-27B-OBLITERATED-V2-mlx-4bit` es una conversión al formato MLX (librería de Apple para inferencia en silicio de Apple) del modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, creado por Pliny (elder-plinius). Este último es una versión modificada de Qwen3.8-27B de Alibaba, un modelo denso de 27 000 millones de parámetros con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal recurrente). La modificación principal es la aplicación de una técnica de alineación inversa denominada *abliteration* en su versión V2, que combina dos cirugías complementarias (SVD agresivo y LEACE) para eliminar los rechazos del modelo sin degradar sus capacidades.

La relevancia de este modelo radica en su tasa de rechazo extremadamente baja (0,24 % en un corpus de 842 prompts de prueba) y en que mantiene un rendimiento en MMLU prácticamente idéntico al modelo original (84,32 % frente al 84,60 %). Esto lo convierte en una herramienta de interés para investigación en seguridad, red teaming y evaluación de robustez de modelos de lenguaje, aunque su naturaleza sin censura implica riesgos importantes si se usa fuera de entornos controlados.

La conversión MLX está cuantizada a 4 bits, lo que reduce el peso del modelo a unos 15,2 GB y permite su ejecución en hardware de consumo de Apple. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B: transformer denso con atención híbrida (16 capas full attention + 48 capas linear attention con estado recurrente constante) |
| Parametros totales | 4 204 731 904 (dato reportado en safetensors; inconsistente con el modelo base de 27B, ver nota) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contextos largos, pero el valor exacto no se indica en la información) |
| Tipos de cuantizacion | MLX 4-bit (repo actual); GGUF disponible en el repositorio original OBLITERATUS |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), GGUF (repo original) |

Nota: el dato de parámetros totales de safetensors (4,2B) no es consistente con el modelo base Qwen3.8-27B, que tiene 27B parámetros. El tamaño del repositorio (15,2 GB) sí es coherente con un modelo de 27B cuantizado a 4 bits, por lo que es probable que la metadata de HuggingFace contenga un error en el conteo de parámetros.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un modelo denso de 27B parámetros con una arquitectura híbrida de atención: de sus 64 capas, solo 16 ejecutan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes utilizan atención lineal con un estado recurrente constante. Esta mezcla busca reducir el coste computacional manteniendo la calidad en tareas de razonamiento y código.

La modificación OBLITERATED V2 aplica una técnica de *abliteration* denominada "complementary abliteration blending" (mezcla de ablación complementaria). En lugar de una única cirugía, se ejecutan dos intervenciones que fallan de forma distinta: una SVD agresiva que elimina profundamente las direcciones de rechazo, y una LEACE (Least-squares Estimation of Causal Effects) que minimiza la información mutua para preservar capacidades. Ambas se combinan con un peso 60 % LEACE + 40 % SVD, encontrado mediante búsqueda binaria. Esta mezcla cancela los fallos de cada método individual: la SVD daña capacidades donde captura varianza de forma agresiva, y la LEACE deja residuos de rechazo en la vía de generación. El resultado es una tasa de rechazo de 0,24 % (2/842 prompts) con una pérdida de solo -0,28 puntos porcentuales en MMLU respecto al modelo original.

El proceso de ablación se aplicó sobre los pesos del modelo sin reentrenamiento adicional, y la conversión a MLX se realizó con `mlx_lm` versión 0.31.3.

## Capacidades

- Generación de texto sin censura: tasa de rechazo de 0,24 % en un corpus de 842 prompts de prueba, incluyendo prompts adversarios.
- Razonamiento y código: mantiene capacidades de generación de código, refactorización y depuración, con un rendimiento en MMLU de 84.32 % (n=2 850).
- Tool calling y function calling: soportado, como se valida en tareas de agente ReAct.
- Agentes y razonamiento multi-step: funciona correctamente en bucles ReAct (Thought/Action/SQL) con el modo de pensamiento desactivado.
- Extracción de datos estructurados: capaz de generar JSON a partir de texto libre (p. ej., incidentes a estructuras).
- Multilingüe: el modelo base Qwen3.8-27B es multilingüe, aunque no se proporcionan detalles de idiomas específicos en la información.
- Capacidad de visión: el modelo base es multimodal nativo, pero esta conversión MLX está etiquetada como texto-generación; no se verifica la capacidad de visión en esta versión.

## Casos de uso

- **Red team de seguridad de IA**: el modelo puede generar respuestas sin filtros a prompts adversariales, lo que permite evaluar la robustez de sistemas de moderación y detección de contenido dañino. Su baja tasa de rechazo facilita pruebas de estrés controladas en entornos de investigación.
- **Simulación de atacantes**: para entrenar sistemas de defensa, se puede usar como generador de entradas maliciosas o de intentos de jailbreak, gracias a su capacidad de seguir instrucciones adversarias sin rechazos.
- **Agentes autónomos**: su soporte para tool calling y razonamiento multi-step lo hace adecuado para implementar agentes ReAct que interactúan con APIs y bases de datos SQL, siempre que se desactive el modo de pensamiento.
- **Generación de código en producción**: puede integrarse en pipelines de CI/CD para generar y revisar código, aunque requiere supervisión humana por su naturaleza sin censura. En pruebas reales logró refactorizar código síncrono a asíncrono con logging y revisar código de seguridad (3+ vulnerabilidades).
- **Extracción de datos estructurados**: convierte texto no estructurado (informes de incidentes, logs) en JSON siguiendo esquemas definidos, útil para automatizar procesos de ingestión de datos.
- **Investigación en alineación de modelos**: sirve como caso de estudio para técnicas de abliteración y evaluación de la relación entre rechazo y capacidad, ya que conserva casi todo el rendimiento del modelo original.
- **Automatización de operaciones**: depuración de despliegues Kubernetes y generación de comandos de corrección, como se muestra en las tareas de depuración de pods en el modelo card.

## Benchmarks y rendimiento

Según la model card del autor, los resultados en MMLU (lm-eval-harness, 0-shot) y tasas de rechazo son:

| Modelo | MMLU | n | Stderr | vs Stock | Refusal rate (842 prompts) | Ship score |
|---|---|---|---|---|---|---|
| Stock Qwen3.8-27B | 84.60 % | 2 850 | ±0.65 | — | ~100 % | — |
| OBLITERATED V1 | 81.4 % | 285 | — | -6.0 pp | 0.0 % (0/842) | 88.7 |
| **OBLITERATED V2** | **84.32 %** | **2 850** | **±0.65** | **-0.28 pp** | **0.24 % (2/842)** | **92.1** |

En tareas avanzadas del mundo real (con thinking OFF), el modelo V2 empata con el stock en 7 de 8 tareas, incluyendo loops de agente ReAct, refactorización de código asíncrono, extracción de JSON, depuración de K8s y revisión de seguridad de código. La validación completa de MMLU sobre 14 000 preguntas está en curso.

## Requisitos de hardware

- **VRAM estimada**: el repositorio MLX 4-bit ocupa 15,2 GB, por lo que se necesita aproximadamente 14-16 GB de memoria disponible (VRAM o memoria unificada).
- **GPU recomendadas**: Apple Silicon (M1/M2/M3/M4) con 32 GB o más de RAM unificada para ejecución cómoda con MLX. En GPU NVIDIA, se puede usar la versión GGUF Q4 con 24 GB de VRAM (p. ej., RTX 3090/4090, A10G).
- **Consumer GPU**: sí, en Apple Silicon con 32 GB o en GPUs NVIDIA de 24 GB. En 16 GB de VRAM puede funcionar con cuantizaciones más agresivas (Q3, Q4_K_M) pero con mayor riesgo de degradación.
- **Opciones de despliegue**: `mlx_lm` (Apple), llama.cpp, Ollama, LM Studio y vLLM (para GGUF). La librería principal es MLX.
- **Latencia y throughput**: no se proporcionan datos específicos en la información. La arquitectura híbrida de atención lineal debería reducir el coste de los tokens de contexto largo en comparación con atención completa, pero no se dispone de cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Refusal rate | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27B | no disp. | 84.60 % | ~100 % | Apache-2.0 | safetensors |
| Qwen3.8-27B-OBLITERATED V2 | 27B | no disp. | 84.32 % | 0.24 % | Apache-2.0 | safetensors, GGUF, MLX |
| Qwen3.8-27B-OBLITERATED V1 | 27B | no disp. | 81.4 % | 0.0 % | Apache-2.0 | safetensors, GGUF |
| Qwen3.8-27B-OBLITERATED (GGUF) | 27B | no disp. | — | — | Apache-2.0 | GGUF |

El modelo V2 ofrece el mejor equilibrio entre eliminación de rechazos y preservación de capacidades. En comparación con otros modelos abliterados de la comunidad (como versiones de Llama o Mistral), el V2 destaca por su pérdida mínima en MMLU (-0.28 pp), mientras que otros abliterados suelen perder entre 2 y 6 puntos.

## Limitaciones y advertencias

- **Naturaleza sin censura**: el modelo está diseñado para no rechazar contenidos, lo que incluye prompts dañinos o ilegales. No debe desplegarse en producción sin salvaguardas externas (filtros, moderación, supervisión humana).
- **Modo de pensamiento desactivado**: habilitar `enable_thinking=True` reintroduce rechazos parciales, ya que la cadena de razonamiento puede re-derivar las direcciones de rechazo eliminadas. La plantilla de chat de V2 ya desactiva el thinking por defecto.
- **Sensibilidad a parámetros**: el modelo requiere `temperature=0` y `repetition_penalty=1.15` para un rendimiento óptimo. Sin repetición, puede caer en bucles de imports o código boilerplate. Temperaturas superiores a 0.5 degradan la calidad notablemente.
- **Sistema de prompts**: los prompts de sistema pueden reintroducir rechazos; se recomienda un sistema vacío.
- **Riesgo de alucinación**: no se proporcionan datos específicos, pero como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de código o datos estructurados.
- **Sesgos**: no se han evaluado sesgos específicos en esta versión. El modelo base Qwen3.8-27B puede tener sesgos propios de su entrenamiento.
- **Uso en producción**: la licencia Apache-2.0 permite uso comercial, pero el riesgo de generar contenido inapropiado o dañino hace desaconsejable su despliegue sin capas de moderación adicionales.
- **Contexto**: el valor exacto de la ventana de contexto no se indica en la información disponible, por lo que no se garantiza un rendimiento óptimo en secuencias muy largas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/tozp/Qwen3.8-27B-OBLITERATED-V2-mlx-4bit
- Modelo original OBLITERATED: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Repositorio GitHub de OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha de Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo de explainx.ai sobre el modelo: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
