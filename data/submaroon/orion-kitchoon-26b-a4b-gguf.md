# SubMaroon/Orion-Kitchoon-26B-A4B-GGUF

# Orion-Kitchoon-26B-A4B-GGUF

## Resumen
Orion-Kitchoon-26B-A4B-GGUF es la version cuantizada en formato GGUF de Orion-Kitchoon-26B-A4B, un modelo de lenguaje de tipo mezcla de expertos (MoE) orientado a roleplay y conversacion, publicado por el usuario SubMaroon en Hugging Face. El modelo base procede de Orion 26B A4B v1.1, desarrollado por TheDrummer, sobre el que se ha aplicado una fusion ligera (merge) del modelo Kitchoon: en concreto, se incorpora su LoRA OV en las capas 10 a 29 con un peso de 0.32, sin mas modificaciones segun la model card. El resultado es un modelo de 25.233.142.046 parametros totales, con aproximadamente 4.000 millones activos por token segun la nomenclatura A4B.

La relevancia de esta publicacion es doble. Por un lado, la arquitectura MoE permite activar solo una fraccion de los parametros en cada paso de decodificacion, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano total. Por otro, la distribucion en GGUF facilita su ejecucion en hardware de consumo mediante llama.cpp u otros motores compatibles con este formato. Se trata, ademas, de un ajuste especifico para roleplay, una categoria con pocos modelos de esta arquitectura publicados en abierto.

El repositorio declara soporte unicamente para ingles, emplea la licencia Gemma del modelo original y no registra descargas ni interacciones en el momento de la consulta. No se han publicado detalles de entrenamiento, contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma (etiqueta gemma4) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (deducido de la nomenclatura A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; niveles concretos no especificados (el repositorio ocupa 22,6 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura transformer con mezcla de expertos (MoE), segun las etiquetas del repositorio, integrada en la familia Gemma (etiqueta gemma4). La nomenclatura "26B-A4B" indica alrededor de 25.200 millones de parametros totales y unos 4.000 millones activos por token, un patron habitual en los modelos MoE que enrutan cada token hacia un subconjunto de expertos. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la dimension de la ventana de contexto del modelo base.

En cuanto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica intervencion conocida es la fusion: a partir de Orion 26B A4B v1.1 de TheDrummer, se anade el LoRA OV de Kitchoon en las capas 10 a 29 con un factor de 0.32. El autor indica que no se ha modificado ningun otro componente, por lo que se trata de un merge selectivo por capas y no de un reentrenamiento.

## Capacidades
- Generacion de texto conversacional en ingles, con enfasis en el dialogo multi-turno propio del roleplay.
- Interpretacion de personajes y mantenimiento de estilo narrativo, derivada del ajuste especifico de roleplay del merge.
- Escritura creativa y narrativa interactiva en formato conversacional.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Roleplay conversacional con personajes consistentes: el modelo hereda el ajuste de roleplay del merge, por lo que puede sostener interacciones interpretando un personaje con un tono definido a lo largo de la conversacion.
- Escritura creativa colaborativa: util como asistente para desarrollar tramas, dialogos y descripciones en proyectos narrativos, dado su entrenamiento orientado a la generacion de texto expresivo.
- Prototipado de dialogos para videojuegos: permite generar arboles de dialogo y variantes de respuesta para NPCs antes de invertir en guion final.
- Mesas de rol asistidas por IA: actua como narrador o como interprete de personajes secundarios en partidas de rol de texto, sin salir del registro narrativo.
- Generacion de contenido para comunidades de ficcion interactiva: sirve para producir respuestas largas y estilizadas en plataformas de chat con personajes.
- Investigacion sobre merging de modelos: al ser un merge documentado (LoRA OV en capas 10-29 a 0.32), es util como caso de estudio reproducible para analizar como afecta la fusion por capas al comportamiento de un MoE.
- Ajuste fino posterior (fine-tuning) de bajo rango: su variante en safetensors y la GGUF permiten experimentar con LoRA adicionales sobre un modelo MoE de tamano medio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (pesos, sin contar cache KV): alrededor de 15-16 GB en Q4_K_M, 18-19 GB en Q5_K_M, 21-22 GB en Q6_K, 27-28 GB en Q8_0 y en torno a 50 GB en F16. Son estimaciones a partir de los 25.233 millones de parametros; los valores reales dependen del nivel exacto de cuantizacion publicado.
- GPU recomendadas: una RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4 a Q6 con la mayor parte del modelo en VRAM; dos GPU de 24 GB para Q8; A100 40/80 GB o H100 para F16 y para servir varias peticiones en paralelo.
- Compatibilidad con GPU de consumo: si, en Q4_K_M o Q5_K_M cabe en tarjetas de 16-24 GB (RTX 4080/4090, 3090); en 12 GB seria necesario descargar capas a RAM del sistema (offloading), con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (habitual en cargas de roleplay), text-generation-webui y otros motores compatibles con GGUF. Para servicio de alto rendimiento con vLLM o TGI seria necesario partir de los pesos en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~4 B de parametros activos, la velocidad de decodificacion por token suele ser inferior a la de un modelo denso de 4 B, pero notablemente superior a la de uno denso de 25 B; no se dispone de mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Orion-Kitchoon-26B-A4B-GGUF (este) | ~25,2 B | ~4 B | no disponible | Gemma | GGUF | Merge de roleplay, solo ingles |
| Orion-Kitchoon-26B-A4B | ~25,2 B | ~4 B | no disponible | Gemma | safetensors | Modelo base sin cuantizar del que deriva esta version |
| Orion 26B A4B v1.1 (TheDrummer) | ~25,2 B | ~4 B | no disponible | no disponible | safetensors | Modelo upstream de TheDrummer antes del merge con Kitchoon |

No se dispone de datos de benchmarks ni de especificaciones verificables de otros modelos comparables de la misma categoria (MoE de ~25 B orientados a roleplay) en la informacion proporcionada.

## Limitaciones y advertencias
- No se ha publicado ninguna evaluacion cuantitativa, por lo que no es posible verificar su calidad objetiva frente a alternativas.
- Es un modelo especializado en roleplay; no esta optimizado para tareas factuales, razonamiento tecnico, codigo o matematicas, donde es probable un rendimiento bajo.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de datos de evaluacion.
- Solo soporta ingles; no se han documentado capacidades multilingues.
- La fusion por capas (LoRA OV en capas 10-29 a 0.32) puede degradar capacidades del modelo base de forma no medida; no hay analisis del impacto del merge.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google, que impone condiciones especificas. Conviene revisarla antes de un uso en produccion.
- La longitud de contexto se desconoce, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- El repositorio no registra descargas ni validacion por parte de la comunidad, lo que aumenta la incertidumbre sobre su calidad y mantenimiento.

## Enlaces
- Pagina del modelo en Hugging Face: https://huggingface.co/SubMaroon/Orion-Kitchoon-26B-A4B-GGUF
- Modelo base (safetensors): https://huggingface.co/SubMaroon/Orion-Kitchoon-26B-A4B
- Modelo upstream de TheDrummer: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
