# xvevx/Stheno-v3.3-Indo-Companion

## Resumen

Stheno v3.3 Indo Companion es un ajuste fino del modelo Sao10K/L3-8B-Stheno-v3.3-32K, publicado por el usuario xvevx en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de 8.030.261.248 parametros (aproximadamente 8B) derivado de la familia Llama 3, orientado especificamente a actuar como companero conversacional (companion AI) en indonesio coloquial. El entrenamiento se realizo con la libreria Unsloth mediante LoRA sobre el modelo base, y el resultado se distribuye en formato GGUF para su ejecucion local.

El problema que resuelve es acotado y muy concreto: ofrecer respuestas con un registro informal, calido y "gaul" (jerga juvenil indonesia), incluyendo marcado de acciones fisicas y emociones entre asteriscos (*accion*), algo tipico de los modelos de roleplay. No es un modelo de proposito general ni un asistente tecnico: su foco es la conversacion afectiva y el roleplay en un unico idioma.

Su relevancia actual es limitada pero clara para un nicho: es uno de los pocos ajustes publicos que combinan el estilo de roleplay de la serie Stheno con datos conversacionales en indonesio no estandar, y su empaquetado en GGUF permite desplegarlo en equipos de consumo a traves de LM Studio, Ollama o llama.cpp sin infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3), ajustado con LoRA sobre Sao10K/L3-8B-Stheno-v3.3-32K |
| Parametros totales | 8.030.261.248 (aproximadamente 8B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base L3-8B-Stheno-v3.3-32K) |
| Tipos de cuantizacion | No se detalla la lista de cuantizaciones publicadas; el repositorio usa el formato GGUF |
| Idiomas soportados | Indonesio (id) como idioma de entrenamiento declarado; otros idiomas no confirmados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (confirmado en las etiquetas); el recuento de parametros procede de safetensors, aunque no se especifica su presencia entre los ficheros publicados |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Llama 3 con 8B de parametros, heredado directamente del modelo base Sao10K/L3-8B-Stheno-v3.3-32K, que a su vez parte de Llama-3-8B y amplia el contexto hasta los 32.768 tokens. El ajuste se realizo con Unsloth, una libreria de entrenamiento optimizada que acelera y reduce el consumo de memoria en el fine-tuning mediante LoRA. No se especifica el rango de LoRA, la tasa de aprendizaje, el numero de pasos ni el numero total de tokens de entrenamiento.

En cuanto a los datos, la model card declara dos conjuntos: `bhismaperkasa/chat_seru` como dataset principal (chats interactivos en indonesio coloquial centrados en cercania emocional) y `cahya/alpaca-id-cleaned` como dataset de respaldo (instrucciones en indonesio ya limpiadas). El objetivo declarado es absorber caracteristicas de personalidad y un estilo conversacional informal. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el autor publica unicamente una grafica de perdida de entrenamiento (loss_chart.png) sin cifras concretas. Como innovacion tecnica destacable no hay ninguna: el valor del modelo esta en el dataset y en el estilo, no en aportaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional en indonesio coloquial, con registro informal, calido y natural (no estandar).
- Roleplay y conversacion de acompanamiento (companion AI), con marcado de acciones fisicas y emocionales entre asteriscos.
- Compatibilidad con la plantilla de conversacion de Llama 3.
- Soporte de conversaciones multi-turno dentro de la ventana de contexto heredada del modelo base.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades de codigo, matematicas o vision: no declaradas.
- Multilingue: unicamente indonesio declarado; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Personaje conversacional en aplicaciones de compania: el modelo esta afinado para responder con tono calido e informal en indonesio, de modo que se puede integrar como bot de acompanamiento en chats de movil donde el usuario espera una conversacion afectiva, no informativa.
- Roleplay narrativo en indonesio: gracias al marcado de acciones entre asteriscos, encaja en plataformas de ficcion interactiva o novelas visuales donde el personaje debe describir gestos y emociones dentro del texto.
- Prototipado de personajes virtuales para desarrolladores indonesios: permite crear un asistente con voz propia (estilo "gaul") sin coste de entrenamiento, partiendo de un modelo de 8B ejecutable en local.
- Demostraciones y talleres de fine-tuning con Unsloth y LoRA: al documentar la receta (modelo base, datasets, parametros de generacion), sirve como ejemplo practico de ajuste de un LLM a un idioma de bajos recursos.
- Chat local sin conexion en LM Studio: el autor documenta el flujo de descarga y uso desde LM Studio, por lo que es adecuado para escenarios de privacidad donde no se quiere enviar conversaciones a la nube.
- Evaluacion de tecnicas de cuantizacion GGUF: el modelo se distribuye en este formato, lo que lo hace util para medir la degradacion de calidad de un modelo de roleplay segun el nivel de cuantizacion.
- Investigacion sobre sesgos y estilo en modelos de rol: al estar entrenado con un dataset coloquial concreto, puede usarse para estudiar como el fine-tuning desplaza el tono y la personalidad de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones estandar para un modelo denso de 8B): aproximadamente 5-6 GB en cuantizacion Q4_K_M, 7-8 GB en Q5/Q6 y 9-10 GB en Q8_0. Estas cifras no proceden de la model card, que no publica requisitos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para cuantizaciones de 4-6 bits; una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutarlo con comodidad. Para FP16 completo se recomienda una GPU de 16-24 GB (RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: si, el modelo esta pensado para ejecucion local. Con cuantizaciones Q4 cabe en GPUs de 6-8 GB, e incluso puede correr en CPU si se dispone de RAM suficiente (el repositorio ocupa 21,8 GB, aunque solo se descargaria el fichero GGUF elegido).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (documentado explicitamente por el autor), y servidores compatibles con GGUF. No se menciona compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stheno v3.3 Indo Companion | 8B (8.030.261.248) | 32.768 tokens (heredado) | Apache 2.0 | HuggingFace, formato GGUF | Ajuste en indonesio coloquial para roleplay/companion |
| Sao10K/L3-8B-Stheno-v3.3-32K (modelo base) | 8B | 32.768 tokens | No disponible en la informacion | HuggingFace | Modelo de roleplay en ingles del que deriva; sin especializacion en indonesio |
| Llama-3-8B-Instruct | 8B | 8.192 tokens | Licencia comunitaria de Meta (con restricciones) | HuggingFace | Asistente generalista en ingles; requiere adaptacion para indonesio coloquial |

La comparativa con otros modelos de companion en indonesio no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: esta disenado para roleplay y conversacion de acompanamiento, no para tareas de razonamiento, codigo, matematicas o recuperacion de informacion fiable.
- Riesgo elevado de alucinacion si se usa como fuente de datos: no hay ninguna indicacion de que el modelo haya sido alineado para evitar afirmaciones falsas.
- Sesgos desconocidos: el dataset de entrenamiento es coloquial e interactivo, y no se documenta ningun proceso de filtrado o mitigacion de sesgos.
- Idioma limitado: solo se declara indonesio. El comportamiento en castellano, ingles u otros idiomas no esta evaluado y probablemente sea deficiente.
- Contexto: los 32K tokens son una herencia del modelo base; no se confirma en la model card del ajuste que esa longitud se mantenga de forma efectiva.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Sao10K/L3-8B-Stheno-v3.3-32K) deriva de Llama 3, por lo que conviene verificar las condiciones de la licencia comunitaria de Meta antes de un uso comercial.
- Metricas de adopcion nulas: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion de la comunidad ni evaluaciones independientes.
- Contenido: al ser un modelo de roleplay y compania, puede generar contenido inapropiado o no apto si no se aplica filtrado en produccion.
- Sin soporte de herramientas: no se declara tool calling, por lo que no es adecuado para integraciones con APIs o agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xvevx/Stheno-v3.3-Indo-Companion
- Modelo base: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.3-32K
- Dataset principal: `bhismaperkasa/chat_seru` (referenciado en la model card; no se proporciona URL directa)
- Dataset de respaldo: `cahya/alpaca-id-cleaned` (referenciado en la model card; no se proporciona URL directa)
- Grafica de perdida de entrenamiento: loss_chart.png (incluida en el repositorio)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
