# SpaceTimee/Suri-Qwen-3.8-27B-Companion

## Resumen

Suri Qwen 3.8 27B Companion es un ajuste fino (fine-tune) del modelo Qwen3.8 27B, desarrollado por el usuario SpaceTimee bajo la marca "Space Time". Se presenta como un modelo de tipo "companion" (orientado a la conversación y el acompañamiento), es decir, entrenado para mantener diálogos conversacionales con un tono cercano, en lugar de optimizarse para tareas de razonamiento puro o generación de código. El modelo base es Qwen3.8 27B, un transformer denso de aproximadamente 27.800 millones de parámetros.

La relevancia de este modelo es acotada: se trata de un fine-tune comunitario con escasa tracción (96 descargas y 0 likes en el momento de la consulta) y sin model card técnica detallada. No se documentan datos de entrenamiento, metodología de ajuste ni resultados de evaluación. Su interés principal radica en ser un ejemplo de adaptación de un modelo grande de la familia Qwen hacia un caso de uso conversacional específico, con soporte declarado de entrada imagen-texto en el pipeline.

La información disponible es muy limitada: la model card se reduce a una autopresentación, parámetros de muestreo recomendados y datos de contacto. Cualquier evaluación rigurosa de sus capacidades requeriría pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8 27B; detalles no disponibles) |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el repo ocupa 110,5 GB) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.8-27B (fine-tune), con linaje desde unsloth/Qwen3.8-27B y SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8 27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención (si emplea atención lineal, decodificación especulativa u otras optimizaciones) ni sobre la longitud de contexto nativa, ya que la model card no aporta detalles técnicos.

Respecto al entrenamiento, no se documenta el proceso de ajuste: se desconoce el volumen de tokens utilizado, la composición del dataset, si se emplearon técnicas de RLHF, DPO o SFT, y qué hiperparámetros se aplicaron. La model card únicamente indica que se trata de un modelo "companion" y desaconseja activar el modo de razonamiento, lo que sugiere que el ajuste prioriza un estilo conversacional sobre el razonamiento explícito. El linaje declarado incluye una variante previa denominada "Uncensored", lo que apunta a un ajuste orientado a reducir restricciones de contenido, aunque no se detalla la metodología.

## Capacidades

- Generación de texto conversacional en chino e inglés, con un estilo orientado al acompañamiento y al diálogo multi-turno.
- Procesamiento de entrada imagen-texto según el pipeline declarado (`image-text-to-text`); no se especifican detalles sobre el codificador visual ni el rendimiento en tareas multimodales.
- Conversación multi-turno: el modelo está diseñado para mantener diálogos sostenidos con un tono cercano.
- Modo de razonamiento: el modelo base podría soportarlo, pero el autor recomienda no activarlo en esta variante.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a chino e inglés según los metadatos.

## Casos de uso

- Asistentes conversacionales de acompañamiento: el modelo puede gestionar diálogos multi-turno con un tono empático y cercano, adecuado para aplicaciones de bienestar o compañía digital, gracias a su ajuste específico como "companion".
- Prototipado de chatbots en chino e inglés: su naturaleza bilingüe permite desplegar asistentes conversacionales en ambos idiomas sin necesidad de ajustes adicionales.
- Experimentación con modelos multimodales: al declarar el pipeline image-text-to-text, puede emplearse para probar interacciones que combinen imagen y texto, aunque el rendimiento concreto no está documentado.
- Investigación sobre ajuste fino de modelos grandes: sirve como caso de estudio de cómo un fine-tune comunitario modifica el comportamiento de un modelo base de ~27,8 B de parámetros.
- Generación de contenido creativo conversacional: guiones, diálogos o narrativa interactiva donde primen la fluidez y el tono natural sobre la precisión factual.
- Evaluación comparativa de variantes "uncensored": permite contrastar el comportamiento de esta variante frente a su predecesora en términos de filtrado de contenido y estilo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precisión completa (BF16/FP16), un modelo de ~27,8 B requiere aproximadamente 55-56 GB de VRAM solo para los pesos. En cuantización de 8 bits, en torno a 28-30 GB; en 4 bits, unos 15-16 GB (estimaciones teóricas, no verificadas para este modelo concreto).
- GPU recomendadas: para precisión completa, A100 80 GB o H100 80 GB. Para cuantización de 8 bits, A100 40 GB o dos GPU de 24 GB. Para 4 bits, una RTX 4090 (24 GB) o RTX 3090 podría ser suficiente para los pesos, con margen limitado para el contexto.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits en GPU con 24 GB o más, aunque el contexto disponible se verá reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente) y, potencialmente, vLLM o llama.cpp si se generan pesos GGUF, aunque no se confirma su disponibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Suri Qwen 3.8 27B Companion | ≈27,8 B | No disponible | No disponible | Declarado (image-text-to-text) | Hugging Face, 96 descargas |
| Qwen3.8 27B (base) | ≈27,8 B | No disponible | No disponible en la informacion | No confirmado | Hugging Face (oficial) |
| Suri Qwen 3.8 27B Uncensored | No disponible | No disponible | No disponible | No disponible | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento comparativos entre estas variantes ni con modelos de otras familias de tamaño similar, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre datos de entrenamiento, evaluación, sesgos o comportamiento esperado, lo que dificulta su uso en producción.
- Riesgo de alucinación: al ser un modelo conversacional sin benchmarks publicados, la fiabilidad factual no está verificada y podría ser baja en tareas de precisión.
- Idiomas limitados: solo se declaran chino e inglés; el rendimiento en castellano no está garantizado.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal para despliegues empresariales.
- Linaje "Uncensored": la variante previa sugiere un ajuste para reducir filtros de contenido, lo que puede implicar respuestas inapropiadas o no alineadas con políticas de seguridad.
- Contexto desconocido: se desconoce la ventana de contexto real, lo que impide planificar aplicaciones con documentos largos.
- Escasa adopción: con 96 descargas y 0 likes, no hay evidencia de validación por parte de la comunidad.
- El autor desaconseja el modo de razonamiento, lo que limita su uso en tareas que requieran cadenas de pensamiento explícitas.
- El tamaño del repositorio (110,5 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante intermedia (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Variante previa del autor: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Contacto del autor: QQ 902575634, correo Zeus6_6@163.com (sin enlaces web adicionales disponibles)
