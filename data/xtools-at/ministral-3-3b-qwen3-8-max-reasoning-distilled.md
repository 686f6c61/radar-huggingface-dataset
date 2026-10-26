# xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled

## Resumen

Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled es un ajuste fino supervisado del modelo unsloth/Ministral-3-3B-Reasoning-2512, un transformer denso de la familia Ministral 3 con unos 3.849 millones de parámetros. Lo publica el usuario xtools-at en Hugging Face y su objetivo declarado es trasladar a un modelo compacto los patrones de respuesta y razonamiento presentes en un corpus de destilación generado a partir de Qwen 3.8 Max (dataset saidutta69/qwen3.8-max-distillation-50k-clean). No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación LoRA de una sola época sobre 8.000 ejemplos filtrados.

La relevancia es fundamentalmente experimental: explora cuánto comportamiento útil de un profesor grande puede transferirse a un modelo de 3B ejecutable en hardware de consumo. El autor es explícito al señalar que la destilación no garantiza equivalencia con el profesor y que no se han publicado comparaciones de benchmarks frente al modelo base, por lo que la mejora real en razonamiento, código o matemáticas no está establecida.

La ficha del repositorio indica únicamente inglés como idioma y licencia Apache 2.0. El modelo requiere un system prompt específico con plantilla [THINK]...[/THINK] para funcionar según el formato para el que fue entrenado su modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Mistral 3 (tag `mistral3` en el repositorio) |
| Parametros totales | 3.849.090.048 (~3,85 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como especificación del modelo; el entrenamiento se realizó con 8.192 tokens de contexto máximo |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors de 16 bits (7,7 GB); no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) según la model card; cobertura multilingüe no establecida |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 26 de octubre de 2026 y actualizado el mismo día. Etiquetas adicionales del repo: `image-text-to-text`, `conversational`, `text-generation`, `endpoints_compatible`. La etiqueta `image-text-to-text` no se corresponde con ninguna capacidad documentada en la model card, que describe exclusivamente generación de texto.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de tipo Mistral 3 con 3,85 B de parámetros. Sobre él se aplicó un ajuste fino con LoRA en precisión de 16 bits durante una única época. La configuración declarada es: rango LoRA 16, alpha 32, dropout 0,02, optimizador AdamW de 8 bits, planificador lineal, weight decay 0,002, learning rate 2e-4 y configuración de batch 4 × 8. No se menciona ninguna innovación arquitectónica propia; el interés técnico está en el procedimiento de destilación, no en cambios de arquitectura.

Los datos de entrenamiento provienen del dataset saidutta69/qwen3.8-max-distillation-50k-clean, generado por un profesor Qwen 3.8 Max. El filtrado aplicado fue un límite de 6.000 caracteres por respuesta (filtro por caracteres, no por tokens, por lo que la longitud en tokens es variable). Se muestrearon aleatoriamente 8.000 ejemplos para entrenamiento y 400 para evaluación, es decir, 8.400 en total. No se documenta composición por dominio del subconjunto, ni si hubo etapas de RLHF o DPO posteriores; la model card solo describe el ajuste supervisado con LoRA. El modelo base (Ministral-3-3B-Reasoning-2512) ya incorpora un formato de razonamiento con monólogo interno delimitado por [THINK] y [/THINK], que este ajuste hereda y refuerza.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, con formato Markdown y LaTeX para ecuaciones.
- Razonamiento multi-paso mediante un bloque de pensamiento interno explícito ([THINK] ... [/THINK]) antes de la respuesta final; es el modo de funcionamiento previsto y requiere el system prompt del modelo base.
- Escritura, reescritura y resumen de texto, según los casos de uso previstos declarados por el autor.
- Razonamiento orientado a problemas y prompts de resolución de ejercicios, con fiabilidad limitada (ver limitaciones).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y planificación multi-paso autónoma: no documentado.
- Capacidades multilingües: no documentadas; el autor solo declara inglés como idioma previsto y advierte que el rendimiento en otros idiomas no se ha establecido.
- Capacidades de visión o audio: no documentadas pese a la etiqueta `image-text-to-text` del repositorio.
- Capacidad especial: modo de razonamiento con borrador interno configurable mediante prompt de sistema, y posibilidad de añadir instrucciones adicionales al prompt base.

## Casos de uso

- Asistente conversacional de propósito general: el modelo puede gestionar diálogos multi-turno en inglés con instrucciones de sistema personalizadas, aprovechando la ventana de 8.192 tokens usada en entrenamiento para mantener contexto de conversación moderado.
- Experimentación con destilación de datos sintéticos: sirve como referencia práctica para estudiar cuánto comportamiento se transfiere de un profesor grande a un modelo de 3B con un único epoch de LoRA, comparando las salidas con el modelo base unsloth/Ministral-3-3B-Reasoning-2512.
- Generación y reescritura de texto en pipelines de contenido: al ser un modelo de 3,85 B puede ejecutarse en una sola GPU de consumo para tareas de redacción, simplificación o resumen por lotes donde no se requiere tool calling.
- Prototipado rápido de razonamiento paso a paso: adecuado para validar interfaces de producto que muestran el proceso de pensamiento antes de la respuesta, usando la plantilla [THINK]/[/THINK] sobre la que se ha ajustado.
- Resumen de documentos y notas de longitud media: el límite de 8.192 tokens de contexto de entrenamiento permite procesar correos, actas o artículos cortos en inglés, con degradación esperable más allá de esa longitud.
- Evaluación y docencia sobre ajuste fino: por su licencia Apache 2.0 y su tamaño reducido, es utilizable como caso de estudio en cursos o artículos sobre LoRA, destilación y evaluación de modelos pequeños, incluyendo la reproducibilidad del pipeline (dataset público + configuración declarada).
- Filtrado o clasificación ligera por generación: tareas de etiquetado y reformateo de texto en inglés donde el coste por token importa y no se necesita razonamiento profundo.

No se recomienda como componente único en decisiones de alto impacto: el propio autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que las comparaciones de benchmarks y las evaluaciones cualitativas sobre problemas no vistos serían necesarias para determinar si el ajuste mejora el razonamiento, el código o las matemáticas respecto al modelo base.

Los únicos datos numéricos publicados son diagnósticos de entrenamiento:

| Metrica | Resultado |
|---|---:|
| Pérdida de entrenamiento | 0,513 |
| Pérdida de evaluación | 0,517 |
| Ejemplos de entrenamiento | 8.000 |
| Ejemplos de evaluación | 400 |
| Épocas | 1 |

La pérdida de evaluación quedó por debajo de la de entrenamiento, pero el autor advierte que estos valores no miden la calidad del razonamiento ni demuestran una mejora sobre el modelo original. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,7 GB de pesos en 16 bits (tamaño real del repositorio) más caché KV y activaciones, lo que sitúa el requisito práctico en torno a 10-12 GB en FP16/BF16 para contextos moderados.
- En cuantización de 8 bits, el peso ronda los 3,9 GB (estimación teórica a partir del número de parámetros); en 4 bits, unos 2,3 GB. Estas cuantizaciones no están publicadas en el repositorio y requerirían conversión propia.
- GPU recomendadas: para FP16 sin compromisos, A100 40 GB, H100 o L40S permiten lotes grandes y mayor contexto; una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son suficientes para inferencia en 16 bits con contexto moderado.
- Cabe en GPU de consumo: sí. RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 y RTX 3060 12 GB en 8 bits o 4 bits son viables. En GPUs de 8 GB haría falta cuantización de 4 bits.
- Opciones de despliegue: `transformers` es la vía documentada en la model card. Para vLLM o TGI es necesario verificar que la versión soporte la arquitectura `mistral3` del modelo base. Para llama.cpp u Ollama habría que generar un GGUF propio, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de las alternativas provienen del conocimiento general de esos modelos y deben verificarse en sus fichas oficiales; el modelo evaluado no publica benchmarks que permitan una comparación de rendimiento real.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled | 3,85 B | 8.192 tokens usados en entrenamiento (contexto nativo no disponible) | Apache 2.0 | Sin benchmarks publicados |
| unsloth/Ministral-3-3B-Reasoning-2512 (modelo base) | ~3 B | No disponible | No disponible en la información | Sin comparación publicada frente al fine-tune |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | No comparado; sin datos en esta ficha |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | No comparado; sin datos en esta ficha |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | No comparado; sin datos en esta ficha |

Diferencias relevantes: el modelo evaluado es el único de la lista que depende de un formato de razonamiento con plantilla específica y de un prompt de sistema obligatorio, y el único sin evaluación cuantitativa publicada. Sus alternativas ofrecen ventanas de contexto declaradas muy superiores.

## Limitaciones y advertencias

- La destilación no garantiza equivalencia: un modelo de 3B no reproduce necesariamente las capacidades ni las salidas del profesor Qwen 3.8 Max.
- Los defectos del corpus sintético se heredan: errores factuales, sesgos y particularidades estilísticas de las respuestas del profesor pueden haber sido aprendidos por el ajuste fino.
- Razonamiento poco fiable: explicaciones fluidas pueden contener conclusiones incorrectas o afirmaciones sin respaldo. El autor desaconseja usarlo como única fuente en decisiones de alto impacto.
- Cobertura de evaluación muy limitada: 400 ejemplos aleatorios no representan adecuadamente todos los dominios y tareas; además, la partición de evaluación procede del mismo dataset que el entrenamiento, con el riesgo de fuga que ello implica.
- Idioma: solo se declara inglés como idioma principal; el rendimiento en castellano u otras lenguas no está establecido ni evaluado.
- Contexto: el entrenamiento se hizo con 8.192 tokens; no se documenta la ventana nativa del modelo base ni el comportamiento más allá de ese límite.
- Dependencia de prompt: requiere el system prompt de Mistral Reasoning con la plantilla [THINK]/[/THINK]; sin él, el formato de salida puede degradarse.
- Licencia: Apache 2.0 para este fine-tune, pero el autor recomienda verificar la licencia aplicable del modelo base y del dataset antes de redistribuir. El texto de la model card queda truncado en ese punto.
- Sin cuantizaciones oficiales ni resultados de benchmarks: el coste de integración en producción (conversión a GGUF, validación de arquitectura en vLLM/TGI) recae en el usuario.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de revisión por terceros.
- La etiqueta `image-text-to-text` del repositorio no está respaldada por ninguna capacidad documentada; no debe asumirse soporte de visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled
- Modelo base: https://huggingface.co/unsloth/Ministral-3-3B-Reasoning-2512
- Dataset de destilación: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Perfil del autor: https://huggingface.co/xtools-at

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a una marca comercial de máquinas de grabado láser sin relación con el proyecto. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
