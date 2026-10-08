# vosldtgbj/project-llm-cpt-1p0-top10-06-lora-05

## Resumen

`vosldtgbj/project-llm-cpt-1p0-top10-06-lora-05` es un archivo de pesos completo publicado por el usuario `vosldtgbj` dentro de una serie de experimentos denominada "Project LLM". Se trata de un modelo derivado de `google/gemma-4-12B` obtenido mediante entrenamiento continuo (continual pretraining, CPT) con LoRA durante 1,0 época, tras lo cual los adaptadores se han fusionado en los pesos completos. El resultado es un modelo multimodal de tipo *any-to-any* e *image-text-to-text*, con alrededor de 12.000 millones de parámetros (11.959.730.176 según los safetensors).

El modelo se publica principalmente como material de reproducibilidad para experimentos, evaluación offline e investigación posterior, y no como un producto final optimizado. El autor indica explícitamente que el repositorio contiene únicamente los pesos cargables y la configuración necesaria, sin estado del optimizador, del planificador ni puntos de reanudación. La ficha no aporta detalles sobre el dataset de entrenamiento, la composición del corpus ni el procedimiento exacto de ajuste.

Su relevancia es limitada y de nicho: se trata de un archivo de pesos con cero descargas y cero *likes* en el momento de la consulta, orientado a quien quiera reproducir o auditar el experimento. La información pública disponible es escasa, por lo que buena parte de las especificaciones habituales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (según etiquetas y requisito de carga); detalle interno no disponible |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors sin cuantizar) |
| Idiomas soportados | Etiqueta `japanese`; resto no disponible |
| Licencia | apache-2.0, sujeta además a los términos de uso del modelo Gemma 4 subyacente |
| Formato de pesos | safetensors fragmentados (sharded) |

Otros datos: pipeline `any-to-any`, tamaño del repositorio 24,0 GB, librería `transformers`, fecha de creación 2026-10-08.

## Arquitectura y entrenamiento

El autor etiqueta el modelo con la arquitectura `gemma4_unified` y requiere una versión de Transformers que la soporte, cargándose mediante `AutoProcessor` y `AutoModelForMultimodalLM`. Esto confirma que se trata de un modelo multimodal capaz de procesar imagen y texto y de generar salidas multimodales, coherente con el pipeline `any-to-any`. No se especifica en la información disponible si la arquitectura interna es un transformer denso, un MoE, un modelo híbrido ni cuál es el mecanismo de atención empleado.

En cuanto al entrenamiento, la model card indica: fase de CPT, longitud de 1,0 época, método LoRA CPT con fusión posterior en pesos completos, y formato de salida en safetensors fragmentados. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otra alineación. Tampoco se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La etiqueta `japanese` sugiere algún grado de especialización o exposición a ese idioma durante el CPT, pero el alcance no está detallado.

## Capacidades

- Generación de texto y procesamiento de entrada de imagen (pipeline `image-text-to-text` y `any-to-any`).
- Manejo multimodal entrada/salida según el pipeline declarado; el alcance exacto (imagen, audio, vídeo) no está especificado.
- Posible especialización parcial en japonés por la etiqueta `japanese`, sin confirmación de nivel.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades multilingües adicionales al japonés: no disponibles.

## Casos de uso

- Reproducción de experimentos de continual pretraining: el repositorio está pensado para repetir el experimento `top10-06-lora-05-1ep` y comparar el efecto del CPT sobre el modelo base Gemma 4 12B mediante evaluación offline.
- Evaluación comparativa (benchmarking interno): cargar los pesos completos fusionados y medir su rendimiento frente al `google/gemma-4-12B` original en tareas de texto e imagen-texto, dentro de un pipeline de evaluación propio.
- Investigación sobre fusión de adaptadores LoRA: al distribuirse los pesos ya fusionados, permite estudiar cómo afecta la fusión de LoRA tras 1 época de CPT al comportamiento del modelo.
- Estudio de especialización en japonés: dado el etiquetado `japanese`, sirve para analizar si el CPT introduce o mejora competencia en ese idioma, comparándolo con el modelo base.
- Base para ajuste fino posterior: al ser un checkpoint completo y cargable, puede utilizarse como punto de partida para nuevos ajustes supervisados o alineación, siempre que se respete la licencia.
- Archivado y trazabilidad de experimentos: el repositorio funciona como registro reproducible de una configuración concreta (CPT + LoRA 1 época) para auditoría interna de un equipo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones a partir del tamaño de parámetros (12B); no proceden de datos publicados por el autor:

- VRAM para inferencia en fp16/bf16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM en cuantización de 8 bits: del orden de 12-14 GB; en 4 bits, del orden de 7-9 GB (requiere cuantización posterior, ya que el repo distribuye safetensors sin cuantizar).
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) justa para fp16 y suficiente para cuantizaciones de 8 o 4 bits.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB o más (RTX 3090, 4090) si se cuantiza; en fp16 requiere 24 GB o más de VRAM.
- Opciones de despliegue: al requerir la arquitectura `gemma4_unified` y `AutoModelForMultimodalLM`, el autor solo documenta Transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `vosldtgbj/project-llm-cpt-1p0-top10-06-lora-05` | ~12B | no disponible | apache-2.0 (+ términos Gemma 4) | CPT con LoRA 1 época sobre Gemma 4 12B, multimodal |
| `google/gemma-4-12B` (modelo base) | ~12B | no disponible en la información | términos Gemma 4 | Modelo de referencia del que deriva este checkpoint |
| `vosldtgbj/project-llm-cpt-0p5-lora-13` | no disponible | no disponible | no disponible | Otro checkpoint de la misma serie de experimentos (CPT 0,5) |

No se dispone de datos de benchmarks ni de especificaciones suficientes para una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el corpus de entrenamiento, lo que impide evaluar sesgos o cobertura del CPT.
- Riesgo de alucinación no cuantificado; al ser un experimento de CPT sin fase de alineación documentada, no hay datos sobre mitigación.
- Idiomas y cobertura no especificados más allá de la etiqueta `japanese`; el soporte real por idioma es desconocido.
- Longitud de contexto no disponible, lo que dificulta planificar despliegues con ventanas largas.
- Licencia: aunque la etiqueta es apache-2.0, el propio autor remite al enlace de licencia de Gemma 4 e indica que el uso debe cumplir también los términos del modelo subyacente; conviene verificar las condiciones de uso comercial antes de explotarlo en producción.
- Modelo de investigación con 0 descargas y 0 *likes* en el momento de la consulta: sin validación externa ni garantías de calidad.
- Compatibilidad de despliegue limitada a versiones de Transformers que soporten `gemma4_unified`; no se confirma soporte en otros runtimes.
- No se distribuyen estados de optimizador ni de reanudación, por lo que no admite continuar el entrenamiento desde el punto exacto.

## Enlaces

- HuggingFace: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-06-lora-05
- Licencia Gemma 4 (referenciada en la model card): https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo base: `google/gemma-4-12B` (referenciado, sin URL directa en la información)
- Otro checkpoint de la misma serie: https://huggingface.co/vosldtgbj/project-llm-cpt-0p5-lora-13
