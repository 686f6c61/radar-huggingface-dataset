# utsavz/gemma3_4b_wsp_fable_opus

## Resumen

gemma3_4b_wsp_fable_opus es un artefacto de investigación publicado por el usuario utsavz en Hugging Face. Se trata de un checkpoint derivado de google/gemma-3-4b-it (revisión 093f9f388b31de276ce2de164bdc2081324b9767, en BF16) obtenido mediante una técnica de edición de pesos sin gradientes denominada Weight-Space Patching (WSP), aplicada en dos etapas y orientada a mejorar la seguridad multimodal frente al conjunto de evaluación VLGuard. No es un fine-tuning convencional: no se entrenan capas nuevas ni se añaden adaptadores, sino que se modifican directamente los tensores del modelo base.

El modelo conserva la arquitectura, el tamaño (4.300.079.472 parámetros) y las capacidades del Gemma 3 4B instruct original, pero con 143.694.058 elementos de parámetro alterados respecto al base. El objetivo declarado es reducir la conformidad con peticiones dañinas manteniendo un nivel bajo de rechazo excesivo sobre entradas benignas.

Su relevancia es fundamentalmente metodológica: documenta un experimento reproducible de parcheo en el espacio de pesos guiado por modelos externos (Fable 5.2 para decidir dónde editar y Opus 5.5 para decidir cómo editar), con métricas de seguridad medidas mediante un proxy de palabras clave. Es un artefacto de investigación, no un modelo listo para producción, y su uso está sujeto a los términos de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3, derivada de google/gemma-3-4b-it) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B-it) |
| Tipos de cuantizacion | no disponible; el checkpoint se publica en BF16 (safetensors) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16); tamano del repo 8,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B-it, un transformer multimodal de la familia Gemma 3 que procesa texto e imagen. Sobre ese checkpoint se aplica Weight-Space Patching en dos etapas sin cálculo de gradientes: la primera etapa determina qué parámetros editar (guía "Fable 5.2") y la segunda determina cómo modificarlos (guía "Opus 5.5"), ambas configuradas en esfuerzo medio. El resultado es una edición directa de pesos que afecta a 143.694.058 elementos de parámetro, sin añadir módulos, adaptadores ni capas nuevas.

El entrenamiento no sigue el esquema habitual de preentrenamiento más alineamiento (RLHF/DPO). No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo supervisión humana. El único objetivo declarado es la seguridad multimodal evaluada con VLGuard, y el autor indica explícitamente que se trata de un artefacto de investigación con una sola ejecución por configuración. El checkpoint publicado corresponde a la mejor ejecución individual del estudio (identificador `best_single:c02_sel02cond`), ya que ningún modelo complementario superó la regla de aceptación predefinida.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados de Gemma 3 4B-it.
- Procesamiento multimodal de imagen y texto (el modelo base es un modelo visión-lenguaje).
- Instrucciones multi-turno en formato chat mediante el procesador de Gemma 3.
- Reducción de conformidad con peticiones dañinas en entradas multimodales, según la evaluación VLGuard del autor.
- Capacidades de tool calling, function calling y razonamiento agéntico: no disponible en la información proporcionada (se heredarían, en su caso, del modelo base, pero no se documentan para este checkpoint).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en edición de pesos: servir como referencia reproducible de Weight-Space Patching en dos etapas sobre un modelo multimodal de 4B, comparando los pesos con el base para estudiar qué regiones del espacio de parámetros afectan al comportamiento de rechazo.
- Evaluación de seguridad multimodal: utilizar el checkpoint junto con VLGuard u otros conjuntos de entradas imagen-texto para medir tasas de conformidad dañina y de rechazo excesivo con proxies de palabras clave.
- Estudio de alineamiento sin gradientes: analizar si el parcheo directo de pesos es una alternativa viable al fine-tuning con RLHF/DPO para modificar el comportamiento de seguridad en modelos pequeños.
- Prototipado de asistentes con salvaguardas: en entornos de laboratorio, emplear el modelo como componente de un pipeline que deba rechazar contenido dañino en entradas multimodales, validando antes las métricas con un evaluador humano.
- Análisis de robustez y regresión: comparar el comportamiento del checkpoint frente al Gemma 3 4B-it original en tareas benignas para detectar degradaciones introducidas por la edición de pesos.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo se mide el equilibrio entre conformidad dañina y sobre-rechazo con conjuntos de evaluación estandarizados.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| VLGuard test (1.558 registros, greedy, 512 tokens nuevos, proxy de rechazo por palabra clave/regex) | Conformidad con contenido danino | 54/1000 |
| VLGuard test | Sobre-rechazo en entradas benignas | 33/558 |
| VLGuard test | Fallos de generacion | 0/1558 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,6 GB solo para los pesos, más memoria para el procesador y el contexto; en la práctica se recomienda un mínimo de 10-12 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB. Estas cifras son estimaciones por tamaño de parámetros, no valores publicados para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con contexto largo; RTX 4090, RTX 4080 o RTX 3090 para uso en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16, y en tarjetas de 8 GB si se cuantiza.
- Opciones de despliegue: transformers con Gemma3ForConditionalGeneration y AutoProcessor (el autor documenta este camino); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_4b_wsp_fable_opus | 4.300.079.472 | no disponible | Edición de pesos WSP sobre Gemma 3 4B-it para seguridad multimodal | gemma | Hugging Face (0 descargas, 0 likes) |
| google/gemma-3-4b-it | 4B (aproximado) | no disponible en la informacion proporcionada | Modelo instructivo multimodal original | gemma | Hugging Face (modelo base oficial) |
| Gemma 3 de mayor tamano (familia) | hasta 27B en la familia | no disponible en la informacion proporcionada | Modelos multimodales de la misma familia | gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo declara explícitamente como tal, con una sola ejecución por configuración y sin validación independiente.
- La métrica de rechazo se basa en un proxy de palabras clave y expresiones regulares, no en un evaluador humano ni en un clasificador entrenado; puede sobreestimar o subestimar el comportamiento real.
- Sesgos conocidos: no documentados en la información disponible; se heredarían los del modelo base Gemma 3 4B-it.
- Riesgo de alucinación: no cuantificado para este checkpoint; la edición de pesos puede alterar el comportamiento del modelo base de forma no prevista.
- Idiomas soportados: no documentados; la cobertura multilingüe no está verificada para este checkpoint.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; es necesario revisar las condiciones de uso comercial y las restricciones de redistribución antes de cualquier despliegue.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se documentan requisitos de hardware, latencia ni integración con servidores de inferencia de alto rendimiento.
- No debe usarse como filtro de seguridad en producción sin una evaluación propia con datos representativos del dominio.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/gemma3_4b_wsp_fable_opus
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio de VLGuard (referencia del conjunto de evaluación citado): no disponible en la información proporcionada.
