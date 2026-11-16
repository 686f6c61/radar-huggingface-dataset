# utsavz/gemma3_4b_wsp_opus_opus

## Resumen

`gemma3_4b_wsp_opus_opus` es un checkpoint derivado de `google/gemma-3-4b-it` (4.300.079.472 parámetros, BF16) publicado por el usuario `utsavz` en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de aplicar *Weight-Space Patching* (WSP) sin gradientes, en dos etapas, sobre los pesos del modelo base, con el objetivo declarado de mejorar la seguridad multimodal frente al conjunto de evaluación VLGuard. La edición afecta a 29.758.751 elementos de parámetros, es decir, menos del 0,7 % del total de pesos.

El interés técnico radica en el método: en lugar de reentrenar, se localizan las regiones del espacio de pesos a modificar (etapa 1, "where to edit") y se calcula la dirección y magnitud del cambio (etapa 2, "how to edit"), ambas guiadas por un modelo auxiliar identificado en la model card como "Opus 5.5" en esfuerzo medio. El checkpoint se etiqueta explícitamente como artefacto de investigación, con una única ejecución por configuración y una evaluación de rechazo basada en proxy de palabras clave y expresiones regulares.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: la modificación quirúrgica de pesos como alternativa de bajo coste al RLHF/DPO para alinear modelos pequeños, y porque publica métricas de compromiso dañino y de sobrerrechazo benigno sobre VLGuard, lo que permite discutir el equilibrio seguridad/utilidad con números concretos. El modelo conserva la licencia Gemma y el pipeline no está declarado en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivada de `google/gemma-3-4b-it`; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en BF16; el README usa `dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base Gemma 3, sin listado explícito) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (repo de 8,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it` en BF16, fijado al commit `093f9f388b31de276ce2de164bdc2081324b9767`. Sobre esa base no se ejecuta entrenamiento con descenso de gradiente: se aplica *Weight-Space Patching* en dos etapas. La etapa 1 determina qué regiones del espacio de pesos editar; la etapa 2 determina cómo editarlas. Ambas etapas se resuelven con el mismo modelo auxiliar ("Opus 5.5", esfuerzo medio) en la ejecución E1. El resultado son 29.758.751 elementos de parámetros modificados respecto al base, un parche disperso y de baja magnitud relativa.

El checkpoint publicado corresponde a la mejor ejecución individual del estudio (`best_single:c01_attn_cond`); según la model card, ningún modelo complementario superó la regla de aceptación predeclarada, por lo que no se publica una variante combinada. La evaluación se realiza sobre VLGuard (1.558 registros) con decodificación greedy, 512 tokens nuevos y un proxy de rechazo por palabras clave/regex. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que el método no entrena con gradientes.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Gemma 3 4B-it.
- Procesamiento multimodal (imagen y texto), dado que el modelo base es `gemma-3-4b-it` y el parche se orienta a seguridad multimodal.
- Modificación dirigida del comportamiento de rechazo ante entradas dañinas, incluidas las multimodales, según el objetivo declarado del parche.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende de las capacidades del base, no documentadas aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", visión o audio específicos: no disponible en la información proporcionada más allá de la naturaleza multimodal del base.

## Casos de uso

- Investigación en alineación sin gradientes: usar el checkpoint como referencia reproducible para estudiar cómo un parche disperso de ~29,8 M de elementos altera la tasa de cumplimiento dañino (314/1000 en VLGuard) sin reentrenar el modelo completo.
- Evaluación de equilibrio seguridad/utilidad: comparar el sobrerrechazo benigno (13/558) y el fallo de generación (103/1558) frente al modelo base para calibrar umbrales de rechazo en pipelines de moderación.
- Prototipado de asistentes multimodales con moderación reforzada: desplegar el modelo en entornos de laboratorio donde se priorice el rechazo de peticiones dañinas sobre la cobertura total, aceptando el coste en utilidad.
- Análisis de robustez de filtros por proxy: emplear las métricas publicadas para validar si un clasificador de rechazo basado en palabras clave correlaciona con el comportamiento real del modelo.
- Estudio de métodos de edición de pesos: servir como caso de comparación frente a fine-tuning con DPO o RLHF en modelos de 4B, midiendo coste computacional y efecto en seguridad.
- Docencia y divulgación técnica: ilustrar en cursos o artículos cómo se localizan y modifican regiones del espacio de pesos y qué límites tiene la evaluación por proxy.
- Pruebas de regresión de seguridad en CI: integrar el checkpoint en suites que verifiquen que futuros parches no degradan las tasas de rechazo registradas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| VLGuard test (1.558 registros, greedy, 512 tokens nuevos) | Cumplimiento dañino (harmful compliance) | 314/1000 |
| VLGuard test | Sobrerrechazo benigno (benign over-refusal) | 13/558 |
| VLGuard test | Fallos de generación | 103/1558 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden de un proxy de rechazo por palabras clave/regex, con una sola ejecución por configuración, y no deben interpretarse como una evaluación de seguridad completa.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y del procesador multimodal; en la práctica, 12-16 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y throughput alto; RTX 4090 (24 GB) o L40S para inferencia BF16 sin problemas.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB si se cuantiza; no se dispone de datos de latencia ni throughput medidos.
- Opciones de despliegue: `transformers` con `Gemma3ForConditionalGeneration` y `AutoProcessor` (según el README). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `utsavz/gemma3_4b_wsp_opus_opus` | 4,30 B | no disponible | Parche de pesos sin gradientes para seguridad multimodal | gemma | Hugging Face (0 descargas, 0 likes) |
| `google/gemma-3-4b-it` (base) | ~4 B | no disponible en esta ficha | Modelo instruct multimodal original | gemma | Hugging Face (oficial) |
| Alternativas de alineación por fine-tuning (DPO/RLHF) sobre Gemma 3 4B | ~4 B | no disponible | Entrenamiento con gradientes | gemma | Variable según autor |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque metodológico.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente "Research artifact", con una sola ejecución por configuración; los resultados no son estadísticamente robustos.
- Evaluación por proxy: el rechazo se juzga con palabras clave y expresiones regulares, no con un evaluador humano ni un clasificador entrenado; puede sobreestimar o subestimar el rechazo real.
- Tasa de cumplimiento dañino elevada: 314/1000 en VLGuard, es decir, el parche no elimina el comportamiento inseguro y debe combinarse con otras capas de moderación.
- Fallos de generación: 103/1558 registros no produjeron salida válida, lo que afecta a la fiabilidad en producción.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Gemma 3.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas y contexto: no se especifican en la model card; deben consultarse en la documentación de Gemma 3.
- Licencia: sujeta a los Gemma Terms of Use; es responsabilidad del usuario verificar las restricciones de uso comercial y la obligación de atribución.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni garantías de mantenimiento.
- No se documenta compatibilidad con motores de inferencia habituales, lo que puede complicar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/gemma3_4b_wsp_opus_opus
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Commit del base referenciado: `093f9f388b31de276ce2de164bdc2081324b9767`
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Dataset VLGuard: no disponible en la información proporcionada
- Paper o blog del método WSP: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
