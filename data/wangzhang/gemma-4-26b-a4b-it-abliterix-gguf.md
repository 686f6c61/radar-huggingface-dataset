# wangzhang/gemma-4-26B-A4B-it-abliterix-GGUF

## Resumen

El modelo `wangzhang/gemma-4-26B-A4B-it-abliterix-GGUF` es una versión cuantizada en formato GGUF del checkpoint abliterado de Gemma 4 26B-A4B IT, desarrollado por Wangzhang Wu mediante la herramienta Abliterix. El modelo original, creado por Google DeepMind, es un MoE multimodal de 26 000 millones de parámetros totales con 4 000 millones activos, diseñado para maximizar la inteligencia por parámetro y entrenado a partir de la investigación de Gemini 3. La abliteración aplicada reduce drásticamente los rechazos del modelo (del 100 % al 2 % en pruebas de refusals) manteniendo una divergencia KL de 0,0005 respecto al original, lo que lo convierte en una opción atractiva para quienes necesitan un modelo sin restricciones de seguridad en entornos de investigación o generación creativa.

Esta versión GGUF ofrece cuatro archivos de pesos (F16, Q8_0, Q4_K_M y un proyector de visión) que permiten ejecutar el modelo en hardware de consumo con requisitos de VRAM desde 16 GB. El modelo mantiene las capacidades del Gemma 4 original: ventana de contexto de hasta 256 000 tokens, soporte multilingüe en más de 140 idiomas y entrada multimodal de imagen y texto. Su licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte explícitamente sobre la debilitación de los mecanismos de seguridad y la responsabilidad del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25 233 142 046 (~25,2 B) |
| Parametros activos | 4 B (según nomenclatura A4B) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (además de mmproj F16 para visión) |
| Idiomas soportados | Más de 140 |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura Mixture of Experts con 26 000 millones de parámetros totales y 4 000 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Según la documentación de Google, esta familia de modelos se construyó a partir de la investigación de Gemini 3 y está optimizada para tareas de generación de texto, razonamiento, codificación y comprensión multimodal. El modelo original fue entrenado con un pipeline que incluye datos multilingües y multimodales, aunque los detalles específicos del dataset no se han publicado en la información disponible.

La modificación principal de este repositorio es la abliteración mediante la herramienta Abliterix, que interviene en el espacio de representaciones internas del modelo para reducir su comportamiento de rechazo. Según la model card, el proceso logró reducir los rechazos del 100 % al 2 % en una prueba de 100 prompts, con una divergencia KL de 0,0005 respecto al modelo original, lo que indica una alteración mínima de las capacidades generales. Posteriormente, los pesos se convirtieron a formato GGUF y se cuantizaron en varias precisiones para su uso con llama.cpp y otros motores compatibles.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas, lógica y comprensión lectora.
- Generación de código en múltiples lenguajes de programación, con soporte para depuración y explicación de fragmentos.
- Entrada multimodal: acepta imágenes junto con texto y genera respuestas textuales (gracias al proyector de visión `mmproj`).
- Soporte multilingüe en más de 140 idiomas, con capacidad de traducción y generación en contextos no ingleses.
- Ventana de contexto amplia de 256 000 tokens, adecuada para documentos largos, conversaciones multi-turno y análisis de código extenso.
- Comportamiento abliterado: reduce significativamente los rechazos de seguridad, permitiendo respuestas a solicitudes que el modelo original bloquearía (con los riesgos asociados).
- Compatible con el formato GGUF, lo que permite su ejecución en llama.cpp, Ollama, LM Studio y otros motores de inferencia local.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el impacto de la abliteración en el comportamiento de los LLM, comparando respuestas con el modelo original para analizar mecanismos de alineación y sesgos.
- Generación creativa sin restricciones: escritores y guionistas pueden explorar narrativas que aborden temas tabú o controvertidos sin que el modelo rechace la solicitud, gracias a su baja tasa de refusals.
- Análisis de contenido sensible: en entornos controlados, el modelo puede procesar y resumir textos que contengan lenguaje explícito o temas delicados, donde un modelo alineado podría negarse a colaborar.
- Desarrollo de asistentes de código especializados: su capacidad de generación de código y su ventana de 256K tokens permiten manejar repositorios completos, refactorizar funciones y generar documentación técnica.
- Traducción y localización multilingüe: con soporte para más de 140 idiomas, puede utilizarse en pipelines de traducción automática para pares de lenguas minoritarias o con bajo recurso.
- Prototipado de agentes conversacionales: su formato GGUF y su compatibilidad con llama.cpp facilitan el despliegue local en entornos de desarrollo para crear chatbots o asistentes virtuales con personalidad no censurada.
- Evaluación de robustez de modelos: investigadores pueden emplear este checkpoint para probar técnicas de jailbreak, medir la efectividad de la abliteración y desarrollar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica la tasa de rechazos (2 %) y la divergencia KL (0,0005) como métricas de la abliteración, pero no incluye resultados de MMLU, HumanEval, GSM8K u otros tests estándar. Para obtener datos de rendimiento, se recomienda consultar la documentación del modelo original `google/gemma-4-26B-A4B-it` o ejecutar evaluaciones propias.

## Requisitos de hardware

- VRAM mínima estimada según cuantización: F16 ~50 GB, Q8_0 ~26 GB, Q4_K_M ~16 GB (datos de la model card).
- GPUs recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se necesita una GPU con 32 GB o más (A100 40 GB, H100); para F16 se requieren GPUs de 48 GB o más (A6000, A100 80 GB, H100 80 GB).
- El modelo cabe en GPUs de consumo si se usa la cuantización Q4_K_M (16 GB), pero no en tarjetas de 8 GB o 12 GB.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, vLLM (con adaptación), Transformers (usando el repo safetensors base).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (original) | 26 B | 4 B | 256K | Sí | Apache 2.0 | Safetensors |
| wangzhang/gemma-4-26B-A4B-it-abliterix (este) | 26 B | 4 B | 256K | Sí | Apache 2.0 | GGUF + Safetensors |
| Otros Gemma 4 (E2B, E4B, 12B, 31B) | 2-31 B | variable | 256K | Sí | Apache 2.0 | Safetensors |

La comparativa se limita a la familia Gemma 4, ya que no se dispone de datos de otros modelos abliterados de tamaño similar en la información proporcionada. La principal diferencia con el original es la eliminación de los rechazos de seguridad, mientras que el resto de especificaciones técnicas permanecen idénticas.

## Limitaciones y advertencias

- El modelo ha sido sometido a un proceso de abliteración que debilita o elimina los mecanismos de alineación y rechazo. Puede generar contenido inexacto, sesgado, ofensivo, explícito, peligroso o ilegal.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en dominios especializados o con prompts ambiguos.
- La ventana de contexto de 256K tokens es amplia, pero el rendimiento puede degradarse en los extremos de la ventana; se recomienda validar en casos de uso reales.
- Aunque la licencia es Apache 2.0, el modelo original de Google incluye términos de uso aceptable que pueden restringir ciertos usos; el autor del repo no otorga derechos adicionales.
- El autor declara que el modelo se proporciona "AS IS", sin garantías, y desaconseja su uso en decisiones médicas, legales, financieras o de seguridad crítica sin supervisión humana.
- No se dispone de información sobre sesgos específicos del modelo abliterado; se recomienda realizar una evaluación de sesgos antes de cualquier despliegue en producción.
- El repo no incluye documentación sobre el proceso de entrenamiento original ni sobre los datos utilizados, lo que limita la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wangzhang/gemma-4-26B-A4B-it-abliterix-GGUF
- Repositorio base (safetensors abliterado): https://huggingface.co/wangzhang/gemma-4-26B-A4B-it-abliterix
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Página de Gemma 4 en Cloudflare: https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Licencia Apache 2.0 de Gemma: https://ai.google.dev/gemma/apache_2
