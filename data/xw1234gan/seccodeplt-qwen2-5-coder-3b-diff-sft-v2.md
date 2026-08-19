# xw1234gan/seccodeplt-qwen2.5-coder-3b-diff-sft-v2

## Resumen

El modelo `seccodeplt-qwen2.5-coder-3b-diff-sft-v2` es un checkpoint de investigación desarrollado por `xw1234gan` mediante fine-tuning supervisado sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`. Su objetivo es mejorar el cumplimiento de normas de seguridad en la generación de código, utilizando el dataset `fengyao1909/SecCodePLT_Plus` y una técnica de token-diff SFT con pérdida de token estilo DAPO y muestreo dinámico. Este v2 corrige la alineación de etiquetas causales y emplea la recompensa oficial ReaL safety-unit-test.

Con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), el modelo se posiciona como una alternativa ligera para tareas de generación de código seguro, especialmente en entornos con recursos limitados. La evaluación sobre 164 ejemplos de test oficiales muestra una tasa de formato correcto del 95,73% y una tasa de seguridad del 55,49%, aunque la tasa conjunta (capability + safety) es del 18,90%, lo que indica margen de mejora en la generación de código funcional y seguro a la vez.

La relevancia de este modelo radica en su enfoque específico en la seguridad del código generado, un área crítica en el desarrollo de software asistido por IA. Al estar basado en Qwen2.5-Coder, hereda las capacidades de generación de código y razonamiento del modelo base, pero con un ajuste orientado a reducir vulnerabilidades. Es un checkpoint de una sola semilla, por lo que sus resultados deben interpretarse como preliminares y no como una garantía de código seguro en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles (el modelo base soporta principalmente ingles y codigo, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-Coder-3B-Instruct, que emplea atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU. El fine-tuning se realizó mediante token-diff supervised fine-tuning (SFT), una variante que ajusta las diferencias entre tokens generados y tokens de referencia, combinada con una pérdida de token estilo DAPO (Dynamic Anchored Preference Optimization) y muestreo dinámico. El entrenamiento utilizó el dataset SecCodePLT_Plus, con una división oficial de 655 ejemplos para entrenamiento y 164 para evaluación, con semilla 42.

La innovación principal de este checkpoint es la corrección de la alineación de etiquetas causales en la versión v2, junto con el uso de la recompensa oficial ReaL safety-unit-test, que evalúa la seguridad del código generado mediante pruebas unitarias específicas. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset, pero el enfoque está claramente orientado a la generación de código seguro y al cumplimiento de políticas de seguridad.

## Capacidades

- Generación de código seguro: el modelo está entrenado para producir código que cumpla con políticas de seguridad, evaluadas mediante pruebas unitarias ReaL.
- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-Coder-3B-Instruct, incluyendo completado de código, explicación y generación de texto técnico.
- Conversacional: el modelo base es instruct-tuned, por lo que puede mantener diálogos multi-turno sobre temas de programación y seguridad.
- Cumplimiento de formato: la evaluación muestra una tasa de formato correcto del 95,73%, lo que indica que el modelo sigue bien las plantillas de salida requeridas.
- Sintaxis válida: el 95,73% de las salidas pasan la verificación de sintaxis, lo que sugiere una baja tasa de errores sintácticos.
- Capacidad de seguridad: el 55,49% de las salidas pasan las pruebas de seguridad, lo que indica una mejora significativa frente a modelos base sin ajuste específico, aunque no es perfecto.
- No se menciona soporte explícito de tool calling, function calling o agentes en la información proporcionada, aunque el modelo base Qwen2.5-Coder sí los soporta; no se confirma en este checkpoint.

## Casos de uso

- Auditoría de código automatizada: el modelo puede analizar fragmentos de código y detectar posibles vulnerabilidades o incumplimientos de políticas de seguridad, gracias a su entrenamiento en el benchmark SecCodePLT+. Se usaría como un primer filtro en pipelines de revisión de código, aunque requiere verificación humana posterior.
- Generación de código seguro en entornos de desarrollo: los desarrolladores pueden utilizarlo para generar funciones o snippets que cumplan con estándares de seguridad, reduciendo el riesgo de introducir vulnerabilidades comunes como inyección SQL o desbordamiento de búfer.
- Educación en seguridad de código: el modelo puede servir como herramienta didáctica para mostrar ejemplos de código seguro e inseguro, ayudando a estudiantes a comprender buenas prácticas de programación defensiva.
- Integración en CI/CD para validación de seguridad: al ser un modelo ligero (3B parámetros), puede desplegarse en pipelines de integración continua para evaluar automáticamente si el código nuevo cumple con políticas de seguridad básicas, aunque su tasa de joint pass (18,90%) limita su uso como único validador.
- Asistente de programación con enfoque en seguridad: en entornos de desarrollo integrado (IDE), el modelo puede ofrecer sugerencias de código que prioricen la seguridad, complementando las capacidades de autocompletado del modelo base.
- Investigación en alineación de seguridad: el checkpoint es útil para estudiar técnicas de fine-tuning orientadas a la seguridad, como la token-diff SFT y la optimización con recompensas de seguridad, sirviendo como referencia para experimentos futuros.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluación sobre los 164 ejemplos de test oficiales del benchmark SecCodePLT+, utilizando decodificación greedy:

| Metrica | Valor |
|---|---|
| Recompensa media | 0,369882 |
| Formato correcto | 95,73% |
| Sintaxis correcta | 95,73% |
| Capacidad (funcionalidad) | 24,39% |
| Seguridad | 55,49% |
| Conjunto (capacidad + seguridad) | 18,90% |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estos valores indican que el modelo es muy fiable en formato y sintaxis, pero su capacidad funcional es limitada (24,39%), lo que sugiere que la generación de código correcto y seguro simultáneamente sigue siendo un desafío.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,09 mil millones de parámetros, el modelo requiere aproximadamente 6 GB en FP16, unos 3,5 GB en cuantización de 8 bits y alrededor de 2 GB en 4 bits. Estas son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16, como una RTX 3060, RTX 4060 o superior. Para cuantización de 4 bits, una GPU con 4 GB es suficiente, como una GTX 1650 o RTX 3050.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo actuales, incluso en versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte a formato compatible) o directamente con la librería transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos oficiales. Para un modelo de 3B, se espera una latencia de decodificación de unos 20-40 ms por token en una GPU moderna (RTX 4090) y un throughput de varios cientos de tokens por segundo con batching, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seccodeplt-qwen2.5-coder-3b-diff-sft-v2 | 3,09B | No disponible | Seguridad en código | No disponible | Hugging Face |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32K (según documentación pública) | Generación de código general | Apache 2.0 (según documentación pública) | Hugging Face |
| StarCoder2-3B | 3B | 16K | Generación de código general | BigCode OpenRAIL-M | Hugging Face |
| CodeLlama-7B | 7B | 16K | Generación de código general | Llama 2 license | Hugging Face |

La comparativa se basa en características generales, ya que no se dispone de benchmarks comunes entre estos modelos. El modelo analizado se distingue por su especialización en seguridad, mientras que los otros son modelos de propósito general para código. Su licencia no está disponible, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- Checkpoint de investigación: es un modelo de una sola semilla, evaluado con un verificador de Python con recursos limitados. No debe considerarse una garantía de código seguro en producción.
- Baja tasa de capacidad funcional: solo el 24,39% de las salidas pasan las pruebas de funcionalidad, lo que indica que el modelo puede generar código sintácticamente correcto pero no necesariamente ejecutable o correcto.
- Tasa conjunta limitada: el 18,90% de joint pass muestra que la generación de código seguro y funcional a la vez es poco frecuente, por lo que no es adecuado para tareas críticas sin supervisión humana.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede alucinar APIs, librerías o patrones de código inexistentes, especialmente en dominios poco representados en el dataset de entrenamiento.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos muy largos.
- Licencia no disponible: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en proyectos productivos.
- Dependencia del modelo base: las limitaciones de Qwen2.5-Coder-3B-Instruct (por ejemplo, posibles sesgos en código de ciertos lenguajes) se heredan en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-3b-diff-sft-v2
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Colección Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- Reporte técnico de Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v3
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/worldart/QwenLM_Qwen2.5-Coder
- Página de Qwen2.5 Coder en Kaggle: https://www.kaggle.com/models/qwen-lm/qwen2.5-coder/
