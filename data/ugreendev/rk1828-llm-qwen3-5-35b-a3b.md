# UGREENDEV/RK1828-LLM-Qwen3.5-35B-A3B

## Resumen

RK1828-LLM-Qwen3.5-35B-A3B es un artefacto de despliegue publicado por UGREENDEV que contiene la conversión al formato RKNN del componente de generación de texto del modelo Qwen3.5-35B-A3B, un modelo de mezcla de expertos (MoE) desarrollado originalmente por Alibaba Cloud (Qwen). No se trata de un modelo nuevo entrenado desde cero, sino de pesos cuantizados y segmentados específicamente para ejecutarse sobre la NPU Rockchip RK1828 a través del runtime RKNN v1.2.0.

El interés de esta publicación es la optimización para hardware de borde: el modelo se distribuye en cinco segmentos (`llm_seg0` a `llm_seg4`), cada uno con cuantización de pesos w4a16 (4 bits para pesos, 16 bits para activaciones), caché KV en int4 y una ventana de contexto declarada de 21.504 tokens por segmento. Esta configuración permite ejecutar un modelo de 35.000 millones de parámetros totales sobre aceleradores NPU de bajo consumo en lugar de GPUs de centro de datos.

La ficha se basa exclusivamente en la información disponible en la model card del repositorio; los detalles sobre arquitectura interna, datos de entrenamiento, benchmarks o idiomas del modelo original no se especifican en la documentación proporcionada y se indican como no disponibles. El repositorio tiene un tamaño de 23,5 GB y, en el momento de la consulta, registra cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según la model card; detalles internos no disponibles |
| Parametros totales | 35B (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 21.504 tokens por segmento (21k) |
| Tipos de cuantizacion | w4a16 en los cinco segmentos (pesos 4 bits, activaciones 16 bits); caché KV en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.2.0), segmentado en 5 tarjetas/segmentos |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que el modelo subyacente, Qwen3.5-35B-A3B, es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.000 millones de parámetros totales, producido por Alibaba Cloud. El artefacto publicado por UGREENDEV no incluye pesos en formato original (safetensors) sino los pesos convertidos y cuantizados para RKNN, divididos en cinco segmentos (`llm_seg0` a `llm_seg4`) que se ejecutan sobre 8 núcleos NPU cada uno en el chip RK1828.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original en la documentación proporcionada. La única innovación documentada en este repositorio es la propia estrategia de despliegue: cuantización w4a16 con caché KV int4 y segmentación en cinco partes para repartir el modelo entre múltiples tarjetas RK1828.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y contiene únicamente el componente de generación de texto del modelo fuente.
- Razonamiento y conocimiento general: heredado del modelo Qwen3.5-35B-A3B, aunque no se detallan capacidades específicas en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card se ofrece en inglés y chino, pero no se especifican los idiomas soportados por el modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La model card indica explícitamente que se trata solo del componente de texto, por lo que no se incluye visión.

## Casos de uso

- Inferencia en dispositivos de borde con NPU Rockchip RK1828: el artefacto está diseñado para ejecutarse en hardware RK1828 con el runtime RKNN v1.2.0, lo que permite desplegar un modelo de 35B en entornos sin GPU dedicada.
- Asistentes conversacionales embebidos: al estar etiquetado como conversacional y soportar contextos de 21.504 tokens, puede gestionar diálogos multi-turno en dispositivos locales.
- Procesamiento de documentos largos en local: la ventana de 21k tokens por segmento permite resumir o extraer información de documentos extensos sin enviar datos a la nube.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en hardware local, los datos no salen del dispositivo, lo que encaja en escenarios con restricciones de confidencialidad.
- Prototipado de aplicaciones de IA en hardware Rockchip: sirve como referencia para evaluar el rendimiento de un MoE de 35B cuantizado a w4a16 sobre NPU.
- Integración en pipelines de CI/CD para verificación de despliegue: el repositorio incluye sumas SHA-256 y comandos de descarga que facilitan la validación de artefactos antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip objetivo: Rockchip RK1828, con 8 núcleos NPU por segmento (5 segmentos en total).
- Runtime: RKNN v1.2.0.
- VRAM/RAM estimada: no disponible de forma explícita; el repositorio ocupa 23,5 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: no aplica; el artefacto está diseñado para NPU RK1828, no para GPU.
- ¿Cabe en GPU de consumo? No aplica en su formato actual; los pesos están en formato RKNN, no en safetensors ni GGUF.
- Opciones de despliegue: runtime RKNN v1.2.0 sobre RK1828; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3.5-35B-A3B (este) | 35B totales (MoE) | 21.504 tokens | RKNN (w4a16, KV int4) | Apache 2.0 | NPU Rockchip RK1828 |
| Qwen3.5-35B-A3B (modelo fuente) | 35B totales (MoE) | no disponible | safetensors (presumiblemente) | Apache 2.0 | GPU |
| Alternativas de borde comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Este repositorio no contiene el modelo original, sino una conversión cuantizada y segmentada para RKNN; no es utilizable en GPU ni en frameworks estándar como PyTorch o llama.cpp.
- Solo es compatible con el chip RK1828 y el runtime RKNN v1.2.0; no se garantiza funcionamiento en otras versiones o hardware.
- La cuantización w4a16 y la caché KV en int4 pueden degradar la calidad de las respuestas respecto al modelo original en precisión completa.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo.
- No hay información sobre riesgo de alucinación específica de esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Alibaba Cloud y los avisos de licencia al redistribuir, tal como indica la model card.
- El runtime Rockchip y el SDK se distribuyen por separado bajo sus propios términos.
- El repositorio registra cero descargas y cero likes, por lo que no hay evidencia de validación por parte de la comunidad.
- No se proporcionan benchmarks ni métricas de latencia/throughput, lo que dificulta evaluar su rendimiento real en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3.5-35B-A3B
- Modelo fuente: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Documentación de la configuración: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3.5-35B-A3B/tree/main/Qwen3.5-35B-A3B-w4a16-8-21504-normal-kv-int4-5cards
- ModelScope: https://modelscope.cn/models/UGREENDEV/RK1828-LLM-Qwen3.5-35B-A3B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
