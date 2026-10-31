# xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensurada" (abliterada) de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario xtools-at en Hugging Face. El modelo base es un fine-tuning orientado a razonamiento de Qwen3.5-9B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en su modo Max Effect, con foco principal en matemáticas y STEM (aproximadamente 250.000 muestras de SFT).

La contribución de xtools-at consiste en aplicar la herramienta Heretic (v2.0.0.dev0) para eliminar los comportamientos de rechazo del modelo original mediante Ablación de Rango Arbitrario (ARA). Según la model card, el modelo pasa de 100/100 rechazos en el modelo original a 3/100, con una divergencia KL de 0,0422 respecto al modelo base, lo que indica una modificación relativamente contenida de la distribución de salida.

Es relevante para desarrolladores que buscan un modelo de razonamiento compacto (9.409.813.744 parámetros, en formato safetensors, licencia Apache 2.0) sin filtros de alineación, aunque conviene señalar que se trata de un modelo derivado de terceros, con poca documentación y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura qwen3_5; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos originales en bf16/fp16 (safetensors); el modelo base fue evaluado con vLLM NVFP4 y llama.cpp MTP-Q8_0, pero no hay cuantizaciones publicadas en este repositorio |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,9 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de la familia Qwen, sometido a un proceso de destilación desde DeepSeek-V4-Pro (modo Max Effect). El entrenamiento del modelo base combinó SFT con aprendizaje por refuerzo (etiquetas rl y gspo, es decir, GSPO, una variante de optimización de política por grupos), centrado en razonamiento estructurado, matemáticas y STEM. La model card menciona también MTP (multi-token prediction) como técnica evaluada en despliegue, y señala transferencia positiva a programación y uso de herramientas sin datos específicos de código en el SFT.

Sobre esta base, xtools-at aplicó Heretic v2.0.0.dev0 con Ablación de Rango Arbitrario (ARA) entre las capas 9 y 24, con parámetros: preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. El resultado reporta 3 rechazos por cada 100 peticiones (frente a 100/100 del original) y una divergencia KL de 0,0422.

## Capacidades

- Generación de texto conversacional con razonamiento multi-paso (etiquetas reasoning, distillation)
- Resolución de problemas de matemáticas y STEM, dominio principal del fine-tuning (~250.000 muestras)
- Uso de herramientas y function calling (etiquetas tool-use, function-calling)
- Razonamiento para agentes (etiquetas de razonamiento y uso de herramientas; sin detalles de implementación)
- Capacidades multilingües: inglés, chino, coreano, japonés, español y ruso
- Generación de código con ganancias post-entrenamiento por transferencia, aunque sin datos SFT específicos de código
- Sin filtros de alineación: responde a peticiones que el modelo original rechazaría (3/100 rechazos)
- Pipeline image-text-to-text según las etiquetas de Hugging Face, aunque la model card no documenta capacidades de visión

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está especializado en descomposición de problemas y soluciones multi-paso destiladas de un profesor fuerte, ideal para tutores de STEM o verificación de cálculos.
- Asistentes de razonamiento locales: con 9,4B de parámetros cabe en GPUs de consumo, lo que permite desplegar un modelo de razonamiento sin censura en entornos offline o privados.
- Prototipado de agentes con function calling: soporta tool-use según las etiquetas, útil para experimentar con bucles de agente y llamadas a herramientas sin restricciones de alineación.
- Investigación en alineación y abliteración: al publicar los parámetros ARA y la divergencia KL, es un buen sujeto de estudio para comparar el efecto de la decensuración sobre el comportamiento del modelo.
- Generación de contenido sin rechazos: útil para writers' assistance o análisis de texto sensible donde los filtros del modelo original bloquean la tarea legítima.
- Despliegue eficiente con multi-token prediction: el modelo base fue evaluado con llama.cpp MTP-Q8_0 y vLLM NVFP4, lo que sugiere rutas de inferencia optimizada para latencia reducida.
- Uso multilingüe básico: soporte de seis idiomas, incluido español, para chat y razonamiento en varios mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica publicada es la comparativa del proceso de decensuración:

| Metrica | Este modelo | Modelo original |
|---|:---:|:---:|
| Rechazos (de 100) | 3 | 100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B de parámetros en precisión completa, unos 18,9 GB de pesos (tamaño del repositorio), por lo que se recomiendan al menos 20-24 GB de VRAM en fp16/bf16; con cuantización Q8_0 (evaluada en el modelo base vía llama.cpp MTP) el requisito baja a torno a 10 GB; con NVFP4 (vLLM) aún menos. No hay cifras oficiales publicadas para este repositorio concreto.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para precisión completa; RTX 4070 Ti Super/4080 o equivalentes con 16 GB para cuantizaciones de 8 bits; GPUs de datacenter (A100, H100) para servir en producción con lotes concurrentes.
- Cabe en GPUs de consumo: sí, en una RTX 3090 o RTX 4090 en fp16, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería nativa), vLLM (ruta NVFP4 evaluada en el modelo base), llama.cpp con MTP-Q8_0 (evaluada en el modelo base), y por extensión Ollama o LM Studio si se dispone de GGUF (no publicado en este repo).
- Latencia y throughput: no disponible; el uso de MTP sugiere aceleración de decodificación, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,41B | no disponible | Apache 2.0 | Decensurado con Heretic; KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,41B | no disponible | no disponible | Destilado de DeepSeek-V4-Pro; 100/100 rechazos |
| Qwen3.5-9B (modelo original) | no disponible | no disponible | no disponible | Base del fine-tuning; datos no detallados en la ficha |

No se han publicado comparativas numéricas de rendimiento con otros modelos de su clase en la informacion disponible.

## Limitaciones y advertencias

- Modelo deliberadamente decensurado: elimina casi todos los rechazos (3/100), lo que implica riesgo elevado de generar contenido dañino, ilegal o inseguro si se usa sin salvaguardas externas.
- Riesgo de alucinación: no evaluado públicamente; al tratarse de una destilación con KL de 0,0422, hereda los errores del modelo base y de su profesor.
- Sin benchmarks publicados: no hay forma de verificar mejoras en matemáticas, código o razonamiento frente al modelo base o competidores.
- Documentación escasa: longitud de contexto, arquitectura detallada y datos de entrenamiento completos no disponibles.
- Origen de terceros: es un fine-tune comunitario (Jackrong) sobre otro fine-tune, no un lanzamiento oficial de DeepSeek ni de Qwen; la calidad y el soporte dependen de los autores.
- Capacidad de visión etiquetada (image-text-to-text) pero no documentada en la model card; no asumir que funciona sin probarlo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la cadena de licencias de los modelos base (Qwen3.5 y la destilación de DeepSeek-V4-Pro).
- La decensuración puede degradar sutilmente el comportamiento en tareas legítimas (overcorrection); el parámetro overcorrect_relative_weight de 0,9645 sugiere que este riesgo fue considerado, pero no hay evaluación de calidad publicada.

## Enlaces

- Modelo: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic (herramienta de decensuración): https://heretic-project.org
