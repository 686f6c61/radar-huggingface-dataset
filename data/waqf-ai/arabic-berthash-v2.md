# Waqf-AI/arabic-berthash-v2

## Resumen

ArabicBertHash v2 es un codificador (encoder) de lenguaje arabe para modelado de lenguaje enmascarado (MLM) desarrollado por Waqf-AI. Con 49,41 millones de parametros totales (16,25 millones en el encoder y 33,16 millones en la cabeza MLM), el modelo propone una innovacion concreta: sustituir la tabla de embeddings densa por una tabla de codigos aprendidos de 8 dimensiones por token, proyectada a 512 dimensiones mediante una proyeccion compartida. Esto reduce el modulo de embeddings de entrada a 516.112 parametros, aproximadamente 63,5 veces menos que una tabla densa de 64.001 x 512.

La arquitectura es un transformer encoder de 6 capas con hidden size 512, 8 cabezas de atencion, RoPE con theta 10.000, RMSNorm (incluida normalizacion Q/K) y feed-forward SwiGLU con tamano intermedio 1.024. El vocabulario es de 64.001 tokens (64K base mas el token `[MASK]`) y el modelo se entreno con ventanas de 1.024 tokens, aunque la configuracion admite hasta 2.048 posiciones, sin evaluacion publicada de calidad en contextos mas largos.

Su relevancia actual es doble: por un lado, ofrece una alternativa compacta y de licencia Apache-2.0 para tareas de comprension del arabe (clasificacion, retrieval, extraccion de caracteristicas); por otro, documenta una tecnica de compresion de embeddings que puede resultar interesante para investigadores que trabajen con vocabularios grandes y presupuestos de parametros ajustados. El modelo se distribuye con codigo custom de Transformers, lo que exige `trust_remote_code=True` para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) con token-code embeddings aprendidos y proyeccion compartida |
| Parametros totales | 49.413.906 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens recomendados en entrenamiento; configuracion admite 2.048 posiciones (calidad no evaluada) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors FP32 (aproximadamente 198 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con hidden size 512 y 8 cabezas de atencion de 64 dimensiones cada una, con self-attention bidireccional. La innovacion principal reside en la representacion de tokens: cada uno de los 64.001 tokens del vocabulario dispone de un codigo aprendido de 8 dimensiones (tabla de 512.008 parametros), que se normaliza con RMSNorm y se expande a 512 dimensiones mediante una proyeccion compartida sin sesgo. El modulo completo de token-code, incluyendo proyeccion y normalizacion, suma 516.112 parametros. El encoder completo tiene 16.253.712 parametros y la cabeza MLM 33.160.194, con decodificador de vocabulario no atado (untied).

El bloque usa RoPE con theta 10.000, RMSNorm en lugar de LayerNorm (incluyendo normalizacion de queries y keys), feed-forward SwiGLU con tamano intermedio 1.024, embeddings de tipo de token de 2 x 512 y dropout de 0,1 en hidden y atencion. La cabeza MLM sigue el esquema BERT: transformacion, normalizacion y decodificador de vocabulario no atado. El entrenamiento combino Arabic Wikipedia y FineWeb-2, preparados como 51.492.343 ejemplos tokenizados, con ventanas de 1.024 tokens. No se documentan en la informacion disponible detalles sobre RLHF, DPO u otras fases de alineamiento, ni el numero exacto de tokens de entrenamiento mas alla del conteo de ejemplos.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre texto arabe: prediccion de tokens `[MASK]` con distribucion softmax sobre el vocabulario de 64.001 tokens.
- Extraccion de caracteristicas de texto: el encoder devuelve un vector de 512 dimensiones por token, util para pooling y representaciones de frase.
- Generacion de embeddings de frase mediante mean-pooling de tokens no especiales y normalizacion L2 (ejemplo documentado en la model card).
- Base para tareas de clasificacion y retrieval previo entrenamiento de una cabeza de tarea o proyeccion sobre los datos del usuario.
- Tokenizacion de arabe sin segmentacion externa: el tokenizer incluido define normalizacion y tokenizacion y debe mantenerse emparejado con los pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion autoregresiva: es un encoder MLM, no un modelo causal.
- No dispone de capacidades de vision, audio ni modo thinking.
- Capacidad multilingue limitada al arabe.

## Casos de uso

- Clasificacion de texto arabe: entrenar una cabeza de clasificacion sobre el vector de frase (mean-pooling de la ultima capa oculta) para tareas como deteccion de spam, categorizacion de noticias o analisis de sentimiento en arabe, aprovechando el encoder de 16,25 M de parametros y su bajo coste de inferencia.
- Busqueda semantica y retrieval en corpus arabes: generar embeddings normalizados de documentos y consultas y usar similitud coseno para recuperacion; la model card menciona una evaluacion de retrieval con una proyeccion aprendida, aunque no publica los numeros.
- Relleno de huecos en edicion y correccion: usar la cabeza MLM para predecir palabras enmascaradas en textos arabes, util en herramientas de asistencia a la escritura o en aumentacion de datos.
- Preentrenamiento ligero y experimentacion academica: el modelo sirve como base para estudiar tecnicas de compresion de embeddings (codigos de 8 dimensiones proyectados) y para experimentos de eficiencia en vocabularios grandes.
- Extraccion de caracteristicas para pipelines downstream: congelar el encoder y usar sus representaciones de 512 dimensiones como entrada a modelos de NER, etiquetado morfologico o analisis sintactico entrenados por separado.
- Filtrado y deduplicacion de datos arabes a gran escala: calcular embeddings de frase y agrupar documentos por similitud para limpieza de corpus, gracias al reducido tamano del modelo (198 MB en FP32) y a su coste de inferencia contenido.
- Prototipado en entornos con recursos limitados: el modelo cabe en CPU y en GPUs consumer, lo que permite desplegar servicios de embeddings o fill-mask sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion de retrieval con una proyeccion aprendida, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 (198 MB de pesos); en FP16 o BF16, alrededor de 0,1 GB, mas memoria para activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito por el codigo custom); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un encoder MLM no es el caso de uso habitual de esos motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArabicBertHash v2 | 49,41 M (16,25 M encoder) | 1.024 recomendado / 2.048 configurado | Arabe | Apache-2.0 | Hugging Face (Waqf-AI) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos comparables de la misma categoria (encoders MLM arabes de tamano similar) para establecer una comparativa con cifras.

## Limitaciones y advertencias

- Es un encoder MLM, no un modelo generativo: no puede usarse para generacion autoregresiva, chat, agentes ni tool calling.
- Solo soporta arabe; no hay capacidades multilingues documentadas.
- La calidad en contextos superiores a 1.024 tokens no ha sido evaluada, aunque la configuracion admita 2.048 posiciones.
- Las probabilidades softmax de la cabeza MLM no son puntuaciones de confianza factual calibradas; la model card lo advierte explicitamente.
- Requiere `trust_remote_code=True` por el codigo custom de Transformers, lo que implica revisar el codigo y fijar una revision del repositorio para uso reproducible.
- El ejemplo de pooling de la model card no incluye la proyeccion aprendida usada en la evaluacion de retrieval; para clasificacion o retrieval es necesario entrenar y validar una cabeza o proyeccion propia.
- El modelo tiene 13 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni restricciones adicionales de la licencia Apache-2.0 para uso comercial; esta licencia permite uso comercial con atribucion.
- La model card referencia el repositorio como `Abdelkareem/arabic-berthash-v2` en el codigo de ejemplo, mientras que el ID de Hugging Face es `Waqf-AI/arabic-berthash-v2`; conviene verificar la ruta correcta al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Waqf-AI/arabic-berthash-v2
- Dataset FineWeb-2 (referenciado en el entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
