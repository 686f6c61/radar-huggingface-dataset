# Vlad39382/lfm25-350m-ru-lora-v3-gguf

## Resumen

El modelo `Vlad39382/lfm25-350m-ru-lora-v3-gguf` es un ajuste fino mediante LoRA de la base instructiva `LiquidAI/LFM2.5-350M`, empaquetado en formato GGUF para su ejecución con llama.cpp. Lo desarrolla el usuario Vlad39382 y está especializado en una única tarea de asistente de mensajería en ruso: `summarize` (resumir conversaciones) y `draftReply` (generar un borrador de respuesta). No es un modelo de propósito general, sino un adaptador de tarea muy concreto sobre un backbone pequeño.

Con 354.483.968 parámetros totales, se posiciona en la gama de modelos on-device: el único archivo publicado, `lfm350m_v3-Q4_K_M.gguf`, ocupa 229.314.528 bytes (aproximadamente 0,21 GB), lo que permite ejecutarlo en CPU, móviles o dispositivos de borde sin GPU dedicada. La relevancia de esta tercera revisión está en la mejora medida en la tarea de resumen: el ROUGE-L pasa de 0,039 en la base a 0,5325 con el LoRA v3 sobre un conjunto de evaluación de 150 ejemplos.

El modelo es monolingüe en ruso (`language: ru`), hereda la licencia "other" de la base (LFM 1.0) y, en la fecha de consulta, acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin validación comunitaria. La model card advierte explícitamente de que los conocimientos generales de un modelo de 350M son limitados y de que la generación de respuestas sigue siendo superficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (según el tag/arch de la model card; la composición interna no se detalla en la información proporcionada) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | Ruso (ru) |
| Licencia | other (LFM 1.0, heredada de la base) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | LiquidAI/LFM2.5-350M |
| Metodo de ajuste | LoRA con r=16 |
| Tarea declarada | Asistente de mensajería: `summarize` y `draftReply` |
| Pipeline | no disponible |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica la arquitectura del backbone como `lfm2`, correspondiente a la familia LFM2.5 de Liquid AI, pero no detalla la proporción de capas convolucionales frente a capas de atención ni otros pormenores del diseño interno, por lo que ese dato no está disponible en la información proporcionada. Lo que sí se especifica es el procedimiento de adaptación: un LoRA de rango 16 sobre la base instructiva `LiquidAI/LFM2.5-350M`, entrenado sobre una mezcla de datos "limpia" en la que los objetivos de respuesta (`reply`) se generaron por destilación desde un modelo profesor y se filtraron con un juez LLM (LLM-as-a-judge).

Respecto a las versiones anteriores (v1 y v2, basadas en un modelo VL-450M), la v3 introduce tres cambios declarados: elimina la componente de visión y se queda solo con texto sobre el mismo backbone LFM2.5 (arch `lfm2`); elimina el DAPT (entrenamiento adicional sobre dominio) porque "rompía el seguimiento de instrucciones"; y sustituye los objetivos de respuesta originales por los destilados y filtrados por el juez. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO más allá del filtrado por juez. Los parámetros de generación recomendados son `temperature=0.1`, `min_p=0.15` y `repetition_penalty=1.05`, lo que indica una orientación clara hacia salidas deterministas y poco creativas.

## Capacidades

- Generación de texto en ruso: el modelo es monolingüe (`language: ru`) y está orientado a conversación.
- Resumen de conversaciones (`summarize`): es la capacidad principal y la mejor medida del modelo, con un salto de ROUGE-L de 0,039 a 0,5325 respecto a la base.
- Redacción de borradores de respuesta (`draftReply`): genera respuestas sugeridas, con una tasa de victoria por pares del 57,5% frente a la alternativa comparada en la evaluación del autor.
- Ejecución on-device: al distribuirse en GGUF Q4_K_M, puede correr con llama.cpp en CPU, portátiles y dispositivos de borde.
- Formato conversacional: el tag `conversational` y el pipeline declarado en los tags indican uso de plantillas de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` apunta a integración con la infraestructura de Inference Endpoints de Hugging Face.
- Sin capacidades de visión: la propia model card indica "Текстовая (без vision)".
- Sin soporte declarado de tool calling, function calling, agentes o modo de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no, únicamente ruso.

## Casos de uso

- Resumen automático de hilos de mensajería: el modelo recibe una conversación completa y devuelve un resumen condensado; es exactamente la tarea para la que se entrenó y donde el ROUGE-L de 0,5325 supera ampliamente a la base (0,039).
- Sugerencia de respuestas en un cliente de chat: integrado en la interfaz de un mensajero, genera un borrador que el usuario edita antes de enviar, reduciendo el tiempo de redacción en conversaciones repetitivas.
- Asistente para atención al cliente en ruso: permite resumir el historial de un ticket y proponer una respuesta inicial, siempre con revisión humana dado el tamaño del modelo.
- Preprocesado de texto para pipelines analíticos: resumir conversaciones antes de indexarlas en un sistema de búsqueda o de clasificación posterior, reduciendo el volumen de tokens que consume un modelo mayor.
- Despliegue en dispositivos sin GPU: al ocupar unos 229 MB en Q4_K_M, se puede embeber en aplicaciones de escritorio o móviles mediante llama.cpp sin depender de la nube ni enviar datos del usuario a servidores externos.
- Prototipado rápido de producto: sirve como línea base barata para validar una funcionalidad de resumen o de respuesta asistida en ruso antes de invertir en un modelo mayor.
- Procesamiento por lotes de archivos de chat exportados: con `temperature=0.1` y `min_p=0.15` el modelo es muy determinista, lo que facilita generar resúmenes consistentes y reproducibles sobre grandes volúmenes de conversaciones.
- Filtrado previo en un sistema en cascada: usar este modelo de 350M para descartar conversaciones triviales y derivar solo las complejas a un modelo mayor, reduciendo coste de inferencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados en la model card del autor, sobre un conjunto de evaluación de 150 ejemplos. No son comparables con benchmarks estándar de la industria (MMLU, HumanEval, GSM8K), que no se han publicado en la información disponible.

| Tarea | Base 350M | LoRA v3 |
|---|---|---|
| summarize ROUGE-L | 0,039 | 0,5325 |
| summarize rep4 | 0,0 | 0,0052 |
| reply judge (escala 1-5) | 2,833 | 2,808 |
| reply pairwise win | — | 57,5% |

Lectura de los datos: la mejora en resumen es muy grande en ROUGE-L, mientras que la calidad juzgada de las respuestas generadas es prácticamente idéntica a la de la base (2,808 frente a 2,833, ligeramente inferior), con una tasa de victoria por pares del 57,5%, es decir, apenas por encima del azar. El autor reconoce que `reply` sigue siendo "superficial" y que `summarize` es el punto fuerte.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: inferior a 0,5 GB para los pesos (archivo de 229.314.528 bytes) más el espacio de caché KV, que con tan poca profundidad de modelo es reducido. En la práctica, menos de 1 GB de memoria total.
- VRAM estimada en FP16: aproximadamente 0,7 GB solo para pesos (354,5M × 2 bytes), más caché KV; no se publica un GGUF en FP16.
- GPU recomendadas: cualquier GPU consumer sirve; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en iGPU. Las A100/H100 están sobredimensionadas para este tamaño.
- CPU: es el escenario natural de uso; funciona en x86 y ARM, incluidas placas tipo Raspberry Pi.
- Móvil y borde: viable por el tamaño del archivo y por el tag `on-device` del repositorio.
- Opciones de despliegue: llama.cpp (librería declarada), así como los runners compatibles con GGUF como Ollama, LM Studio o `llama-cpp-python`. vLLM y TGI no son la vía habitual para GGUF de este tamaño.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La información proporcionada solo permite comparar de forma directa contra la base sobre la que se construye. Para alternativas de la misma categoría no hay datos de benchmark ni especificaciones en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lfm25-350m-ru-lora-v3-gguf | 354,5M | no disponible | other (LFM 1.0) | GGUF Q4_K_M | Especializado en resumen y borrador de respuesta en ruso |
| LiquidAI/LFM2.5-350M | 354,5M (base) | no disponible | other (LFM 1.0) | safetensors (formato base) | Modelo instructivo generalista; ROUGE-L de 0,039 en resumen |
| Alternativas de tamano similar (Qwen, Gemma, SmolLM) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

## Limitaciones y advertencias

- Conocimientos generales muy limitados: la propia model card advierte de que en traducción y hechos un modelo de 350M rinde peor que modelos mayores.
- Calidad de respuesta superficial: las respuestas generadas obtienen 2,808 sobre 5 en la evaluación del juez, por debajo de la base (2,833), y la tasa de victoria por pares es del 57,5%, muy cerca del azar.
- Riesgo de alucinación: elevado en tareas de conocimiento; el modelo está pensado para resumir y redactar sobre contexto aportado, no para responder preguntas factuales.
- Idiomas: solo ruso. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto: no disponible en la información proporcionada, lo que impide garantizar el manejo de conversaciones muy largas.
- Licencia: hereda la licencia "other" de la base, LFM 1.0. Es imprescindible revisar los términos de esa licencia antes de cualquier uso comercial, ya que puede incluir restricciones.
- Riesgo de sesgo: no hay información sobre la composición del dataset ni sobre auditorías de sesgo, por lo que no se puede evaluar este punto.
- Datos de evaluación limitados: las métricas publicadas provienen de 150 ejemplos y de una única configuración; no constituyen una validación robusta.
- Sin tracción comunitaria: 0 descargas y 0 likes en la fecha de consulta, sin informes independientes de terceros.
- Reproducibilidad: el autor publica el SHA-256 del archivo GGUF, lo que permite verificar la integridad de la descarga, pero no se publican los adaptadores LoRA sin fusionar ni el dataset de entrenamiento.
- Producción: dado el tamaño y las métricas, cualquier despliegue debería incluir revisión humana de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vlad39382/lfm25-350m-ru-lora-v3-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre el modelo. Las consultas devolvieron exclusivamente páginas sobre velocímetros GPS y listados de comercio electrónico, sin relación alguna con el modelo.
