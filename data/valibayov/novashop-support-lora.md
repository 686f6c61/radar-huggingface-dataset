# Valibayov/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Valibayov en HuggingFace, entrenado mediante SFT sobre el modelo base unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de 0,2 GB que debe cargarse junto al modelo base de 8.000 millones de parámetros para poder realizar inferencia. El repositorio declara la librería PEFT (version 0.20.0) y el pipeline de text-generation, con etiquetas que apuntan a un entrenamiento supervisado con TRL y Unsloth.

Por el nombre del repositorio, el adaptador parece orientado a un caso de uso de atención al cliente ("support") para un supuesto comercio llamado NovaShop, probablemente en formato conversacional. Sin embargo, la model card del autor es la plantilla por defecto de HuggingFace y no contiene ni un solo dato rellenado: no se documentan el conjunto de datos de entrenamiento, los hiperparámetros, el rango del adaptador, los idiomas ni la licencia. Cualquier afirmación sobre su comportamiento en producción debe considerarse no verificada.

La relevancia de esta ficha es, por tanto, metodológica: sirve como ejemplo de adaptador LoRA de dominio específico barato de entrenar y desplegar sobre Llama 3.1 8B, pero con un nivel de documentación insuficiente para evaluarlo. Con 0 descargas y 0 "likes" en el momento de la consulta, tampoco existe validación por parte de la comunidad. Las búsquedas web realizadas no han devuelto ningún resultado relevante sobre este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (familia Llama 3.1); el adaptador en sí no es una arquitectura independiente |
| Parametros totales | 8.030 millones en el modelo base; el adaptador no declara su número de parámetros entrenables (rango y alpha no disponibles) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B (no documentado en la model card del adaptador) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base referenciado está cuantizado a 4 bits (bitsandbytes NF4, vía Unsloth). El adaptador puede fusionarse y recuantizarse a GGUF, AWQ o GPTQ, pero no se documenta ningún procedimiento |
| Idiomas soportados | No disponible en el repositorio. El modelo base Llama 3.1 declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en el repositorio. Al derivar de Llama 3.1, el modelo base está sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Autor | Valibayov |
| Modelo base | unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit |
| Librería | peft (framework PEFT 0.20.0) |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación | 2026-09-10 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.1 8B Instruct, un transformer decoder-only de 8.030 millones de parámetros con 32 capas, atención con Grouped Query Attention (32 cabezas de consulta y 8 de clave/valor), embeddings rotatorios (RoPE) y activación SwiGLU, con un tamaño de vocabulario de 128.256 tokens. El repositorio base empleado está cuantizado a 4 bits con bitsandbytes (NF4) mediante Unsloth, lo que reduce el consumo de memoria durante el entrenamiento, pero implica que el ajuste se realizó sobre pesos cuantizados y no en precisión completa.

La información disponible solo permite confirmar que se trata de un ajuste supervisado (etiquetas `lora`, `sft`, `trl`, `unsloth`) con PEFT 0.20.0. No se especifican el rango (r), alpha, dropout, tasa de aprendizaje, número de épocas, tamaño de batch ni la composición del dataset. Tampoco hay evidencia de una fase posterior de RLHF, DPO o alineación adicional. La model card incluye el enlace genérico a Lacoste et al. (2019) sobre estimación de emisiones de carbono, pero los campos de impacto ambiental, datos de entrenamiento y evaluación están sin rellenar.

## Capacidades

- Generación de texto conversacional: es la única capacidad confirmada por el pipeline declarado (`text-generation`) y por el ajuste SFT sobre un modelo instruct.
- Atención al cliente en dominio específico: por el nombre del repositorio, se espera que el adaptador esté especializado en respuestas de soporte, presumiblemente consultas de pedidos, devoluciones o incidencias, aunque no hay documentación que lo confirme ni ejemplos de uso.
- Razonamiento y matemáticas: capacidad heredada de Llama 3.1 8B Instruct, no verificada tras el ajuste.
- Generación de código: heredada del modelo base, no verificada.
- Tool calling / function calling: Llama 3.1 8B Instruct soporta plantillas de llamada a herramientas con los tokens especiales correspondientes; se desconoce si el adaptador conserva esta capacidad o si el ajuste la ha degradado.
- Uso agéntico y razonamiento multi-paso: no documentado para el adaptador; el modelo base tiene soporte limitado en este terreno en comparación con modelos de mayor tamaño.
- Multilingüismo: no documentado en el repositorio. El modelo base declara 8 idiomas, pero un ajuste SFT monolingüe puede reducir el rendimiento en el resto.
- Modo de razonamiento explícito (thinking), visión o audio: no soportados. Llama 3.1 8B es estrictamente texto.

## Casos de uso

- Asistente de soporte de primer nivel: desplegar el adaptador sobre Llama 3.1 8B para responder consultas frecuentes de clientes (estado de pedidos, políticas de devolución, horarios de envío). El contexto de 128.000 tokens heredado permitiría incluir manuales de producto o historiales largos, siempre que el ajuste no lo haya degradado.
- Clasificación y enrutado de tickets: usar el modelo para etiquetar la intención de una consulta entrante y derivarla al equipo correspondiente, con salida estructurada en JSON mediante `transformers` o vLLM.
- Generación de borradores de respuesta para agentes humanos: el ajuste SFT es adecuado para producir respuestas con el tono y la terminología de la marca, que un agente revisa y envía.
- Base de un sistema RAG de documentación interna: combinado con una base vectorial, el modelo puede redactar respuestas fundamentadas en fragmentos recuperados, reduciendo la invención de políticas o precios.
- Prototipado rápido en una sola GPU: al ser un adaptador de 0,2 GB, permite iterar y hacer A/B testing de variantes de ajuste sin reentrenar el modelo completo, cargando los pesos con `PeftModel` sobre el base cuantizado.
- Extracción de entidades de conversaciones: identificar números de pedido, fechas, productos o importes en hilos de chat para alimentar un CRM, aprovechando que el modelo base maneja instrucciones de formato.
- Personalización multilingüe de bajo coste: si el dataset de ajuste incluyó varios idiomas, el adaptador podría atender consultas en español, inglés o francés; conviene validarlo antes, dado que no hay declaración de idiomas.
- Generación de respuestas para canales asíncronos (correo, formularios web): con contexto largo, el modelo puede resumir hilos extensos y proponer una contestación.

En todos los casos conviene tratar el adaptador como no evaluado y aplicar revisión humana o validación automática antes de exponerlo directamente a clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación, ni métricas de pérdida, ni comparaciones con el modelo base. La única referencia externa citada es el artículo de Lacoste et al. (2019) sobre cálculo de emisiones, que no aporta datos de rendimiento.

## Requisitos de hardware

- Tamaño del adaptador: 0,2 GB en disco, independientemente de la cuantización del modelo base.
- Inferencia en 4 bits (NF4, como el base referenciado): aproximadamente 5-6 GB para los pesos, más 1-2 GB de caché KV y overhead, lo que sitúa el total en torno a 8-10 GB de VRAM.
- Inferencia en bf16/fp16: aproximadamente 16 GB solo para los pesos del modelo fusionado, con un total práctico de 18-24 GB de VRAM.
- Inferencia en fp32: en torno a 32 GB de VRAM, poco recomendable.
- GPU consumer: cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) en cuantización de 4 bits, con margen ajustado; en 16 GB (RTX 4060 Ti 16 GB, RTX 4080) y 24 GB (RTX 3090, RTX 4090) el despliegue en 4 bits es holgado y en bf16 resulta viable.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A10G para servir en bf16 con concurrencia alta.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA sobre el modelo base; Ollama y llama.cpp requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera token.
- Nota sobre cuantización: fusionar el adaptador sobre un base ya cuantizado a 4 bits puede degradar la calidad; lo habitual es fusionar sobre el modelo en bf16 y recuantizar después.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valibayov/novashop-support-lora | Adaptador LoRA sobre Llama 3.1 8B | 8.030 M (base) | 128.000 tokens (heredado del base) | No disponible | Repositorio HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | Modelo completo, transformer decoder-only | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible y desplegado |
| Qwen/Qwen2.5-7B-Instruct | Modelo completo, transformer decoder-only | 7.620 M | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Ampliamente disponible, sin restricciones de uso comercial por tamaño de empresa |
| mistralai/Mistral-7B-Instruct-v0.3 | Modelo completo, transformer decoder-only | 7.240 M | 32.768 tokens | Apache 2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento del adaptador que permitan compararlo en benchmarks con estas alternativas. La comparación anterior se limita a características estructurales y de licencia. Como referencia, el adaptador no sustituye al modelo base: ambos deben cargarse juntos.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto, sin datos de entrenamiento, hiperparámetros, evaluación ni licencia. No es posible auditar el modelo.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Llama 3.1, se heredan las condiciones de la Llama 3.1 Community License, que exige atribución ("Built with Llama") y una licencia separada de Meta para productos con más de 700 millones de usuarios mensuales. La ausencia de declaración explícita genera incertidumbre legal para uso comercial.
- Sin validación de la comunidad: 0 descargas y 0 likes; nadie ha reproducido ni evaluado el ajuste.
- Riesgo de alucinación en dominio de soporte: un modelo de 8B ajustado con SFT puede inventar políticas de devolución, plazos o precios. En atención al cliente esto es especialmente crítico y exige verificación contra fuentes autorizadas (por ejemplo, RAG sobre documentación oficial).
- Degradación potencial por cuantización: el entrenamiento se hizo sobre un base en 4 bits (bitsandbytes NF4), lo que puede introducir sesgos numéricos respecto a un ajuste en bf16.
- Olvido catastrófico: un ajuste SFT de dominio estrecho puede reducir capacidades generales del base (código, matemáticas, multilingüismo) y aumentar la tendencia a responder con el estilo del dataset de ajuste incluso fuera de dominio.
- Idiomas no declarados: si el dataset era monolingüe, el rendimiento en otros idiomas puede ser muy inferior al del base; no hay información al respecto.
- Sesgos: no evaluados. Los sesgos del modelo base (Llama 3.1) se mantienen y pueden verse amplificados por el dataset de ajuste, que se desconoce.
- Sin filtros de seguridad documentados: no consta ningún ajuste de seguridad, moderación o rechazo de peticiones dañinas posterior al SFT.
- Contexto largo teórico, uso real incierto: aunque el base soporta 128.000 tokens, no hay evidencia de que el adaptador mantenga la coherencia en ventanas largas.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-10) no coincide con el estado del ecosistema PEFT declarado (0.20.0), lo que sugiere que los metadatos deben tomarse con cautela.
- Sin soporte multimodal: no procesa imágenes, audio ni vídeo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Valibayov/novashop-support-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Documentación de TRL: https://huggingface.co/docs/trl/index
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Licencia de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Artículo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los resultados obtenidos correspondían a páginas no relacionadas y se han descartado.
