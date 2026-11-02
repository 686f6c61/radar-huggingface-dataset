# ss-lab/LFM2.5-1.2B-Instruct-GGUF

## Resumen

LFM2.5-1.2B-Instruct-GGUF es una recopilación de pesos cuantizados en formato GGUF del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario ss-lab. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión con llama.cpp del checkpoint original de Liquid AI, orientada a su despliegue en entornos de inferencia local y herramientas compatibles con GGUF (llama.cpp, Ollama, etc.). El modelo base cuenta con 1.170.340.608 parámetros según los datos de safetensors del repositorio.

El interés de esta publicación reside en la disponibilidad de múltiples niveles de cuantización (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 y F16) que permiten ajustar el equilibrio entre calidad y consumo de memoria en hardware modesto. Al tratarse de un modelo de 1.2B parámetros, es candidato a ejecutarse en GPUs de consumo e incluso en CPU, lo que lo hace útil para prototipado rápido y aplicaciones con requisitos de latencia estrictos.

La información pública disponible sobre esta conversión es muy limitada: el repositorio no incluye datos sobre benchmarks, idiomas soportados ni detalles de entrenamiento más allá de la referencia al modelo original. La licencia se declara como "other", heredada del modelo base, por lo que es imprescindible consultar los términos de LiquidAI/LFM2.5-1.2B-Instruct antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16, F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Esta ficha describe una conversión a GGUF, no un entrenamiento. Los pesos se obtuvieron a partir del checkpoint original LiquidAI/LFM2.5-1.2B-Instruct mediante llama.cpp. El autor indica que el archivo Q4_0 se cuantizó directamente desde los pesos F16 y que no corresponde al checkpoint QAD Q4_0 oficial, lo que implica que puede haber diferencias de calidad respecto a la versión QAD publicada por Liquid AI.

No se proporcionan en la información disponible datos sobre la arquitectura interna del modelo base (tipo de transformer, atención, capas), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Toda esa información debe consultarse en la model card del modelo original de LiquidAI.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational.
- Instrucciones: el sufijo Instruct del modelo base indica ajuste para seguir instrucciones, aunque no se detallan las técnicas empleadas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, lo que sugiere uso con infraestructuras de inferencia estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1.2B parámetros y cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en un portátil con GPU de consumo para validar flujos de chat antes de escalar a modelos mayores.
- Inferencia en el borde (edge): las variantes Q4_0 y Q4_K_M reducen el peso del modelo lo suficiente para desplegarlo en dispositivos con memoria limitada, útil en aplicaciones de asistencia offline.
- Generación de texto en pipelines de CI: al ser GGUF y compatible con llama.cpp, puede integrarse en scripts de pruebas automatizadas que necesiten un generador de texto ligero y reproducible.
- Chatbots de bajo coste para atención interna: un modelo de 1.2B permite desplegar un asistente para consultas frecuentes en herramientas internas sin depender de APIs externas.
- Experimentación académica con cuantización: la disponibilidad de siete formatos distintos permite estudiar el impacto de la cuantización en la calidad de las respuestas sobre un mismo modelo base.
- Sustituto ligero en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en escenarios donde no se permite enviar información a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos y overhead habitual de llama.cpp):
  - Q4_0 / Q4_K_M: en torno a 0,7-1,0 GB de pesos, con overhead total estimado de 1,0-1,5 GB.
  - Q5_K_M: en torno a 0,9-1,1 GB de pesos, con overhead total estimado de 1,2-1,7 GB.
  - Q6_K: en torno a 1,0-1,3 GB de pesos, con overhead total estimado de 1,4-1,9 GB.
  - Q8_0: en torno a 1,3-1,5 GB de pesos, con overhead total estimado de 1,7-2,2 GB.
  - F16 / BF16: en torno a 2,3-2,4 GB de pesos, con overhead total estimado de 2,8-3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes y permiten holgura para contextos largos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con llama.cpp usando cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, etc.). vLLM y TGI no son opciones directas para GGUF sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ss-lab/LFM2.5-1.2B-Instruct-GGUF | 1,17B | no disponible | other | GGUF | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17B | no disponible | other | safetensors (original) | HuggingFace |
| Otros modelos ~1B de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el checkpoint original de Liquid AI, del que esta publicación es una conversión. No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia "other": es obligatorio revisar los términos del modelo base LiquidAI/LFM2.5-1.2B-Instruct antes de cualquier uso comercial; la licencia de esta conversión no está detallada más allá de la etiqueta.
- El archivo Q4_0 no es el checkpoint QAD Q4_0 oficial, según advierte el propio autor, por lo que su calidad puede diferir de la versión publicada por Liquid AI.
- No se documentan idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano sin evaluación previa.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- Al ser una conversión de terceros (ss-lab), no hay garantía de mantenimiento, actualizaciones ni soporte por parte del desarrollador original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio (18,3 GB) refleja la suma de todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No se especifica la longitud de contexto soportada, un dato crítico para aplicaciones de conversación multi-turno o documentos largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ss-lab/LFM2.5-1.2B-Instruct-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
