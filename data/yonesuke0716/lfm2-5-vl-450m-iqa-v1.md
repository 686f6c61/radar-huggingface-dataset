# Yonesuke0716/lfm2.5-vl-450M-iqa-v1

## Resumen

LFM2.5-VL-450M IQA v1 es un ajuste fino del modelo multimodal LiquidAI/LFM2.5-VL-450M, publicado por el usuario Yonesuke0716 en HuggingFace. El modelo ha sido especializado en evaluacion automatica de calidad de imagen (Image Quality Assessment, IQA) mediante SFT y GRPO sobre el conjunto de datos KonIQ-10k, con fusion posterior de los adaptadores LoRA. Su proposito es recibir una fotografia y devolver una puntuacion de calidad percibida entre 0.0 y 10.0, acompanada de un breve razonamiento textual sobre lo que se observa en la imagen.

El modelo base es un transformer multimodal de 354 millones de parametros (segun el recuento real de safetensors) que combina un encoder visual con un modelo de lenguaje. Este ajuste conserva esa arquitectura y anade la capacidad de producir una estimacion numerica calibrada con la opinion humana agregada, ademas de una justificacion en texto entre etiquetas `<REASONING>`. La salida combina texto libre y un objeto JSON con la clave `overall`.

Su relevancia practica reside en que ofrece una alternativa ligera y desplegable en local (via llama.cpp) para tareas de evaluacion de calidad fotografica, filtrado de imagenes o control de calidad en pipelines de procesamiento visual, sin depender de APIs externas. La distribucion es en formato GGUF cuantizado Q8_0 para el modelo de lenguaje y F16 para el encoder visual, lo que facilita su ejecucion en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje LFM2 + encoder visual), ajuste fino con LoRA fusionado |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada en el ejemplo de uso) |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (encoder visual) |
| Idiomas soportados | japones (ja) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (dos archivos: modelo de lenguaje e imagen) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-450M, una arquitectura multimodal que separa el modelo de lenguaje del encoder de imagen en dos componentes independientes, ambos necesarios para la inferencia. Sobre esta base se realizo un ajuste supervisado (SFT) y un entrenamiento con GRPO (Group Relative Policy Optimization) empleando el dataset KonIQ-10k, orientado a la evaluacion de calidad de imagen basada en votos humanos. Los adaptadores LoRA resultantes se fusionaron en los pesos finales.

El proceso de entrenamiento se organizo en rondas de GRPO; la version publicada corresponde a la ronda 1. El modelo aprende a producir una puntuacion central de las votaciones humanas en escala 0.0-10.0, sin forzar el resultado a incrementos de 0.5, junto con un razonamiento breve de dos o tres frases que describe el contenido de la imagen y los defectos de calidad observables. La inferencia recomendada emplea decodificacion greedy (temperatura 0, top-k 1, top-p 1, min-p 0) con una penalizacion de repeticion de 1.05. Las imagenes no se redimensionan previamente: es llama.cpp quien las divide en mosaicos de 512 pixeles.

## Capacidades

- Evaluacion de calidad de imagen: devuelve una puntuacion global (`overall`) entre 0.0 y 10.0 que representa el centro de la distribucion de votos humanos.
- Razonamiento visual descriptivo: genera un texto entre `<REASONING>` y `</REASONING>` explicando que se ve en la imagen y que zonas degradan la calidad (desenfoque, ruido, aberraciones cromaticas, etc.).
- Salida estructurada: emite un objeto JSON con la clave `overall` tras el razonamiento.
- Analisis de atributos de calidad: el prompt de referencia incluye referencias a brillo, color, nitidez, ruido y aberracion cromatica calculadas desde pixeles, que el modelo puede contrastar con su percepcion.
- Procesamiento de imagen a texto (pipeline image-text-to-text).
- Soporte de conversacion multimodal mediante llama-cpp-python y llama-mtmd-cli.
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Filtrado automatico de imagenes en pipelines de datos: el modelo puntua cada fotografia y permite descartar aquellas por debajo de un umbral de calidad antes de alimentar un dataset de entrenamiento o un catalogo.
- Control de calidad en fotografia de producto: integrado en un flujo de ingesta, evalua nitidez, ruido y color de cada imagen y senala las que requieren retoque o repeticion de la toma.
- Priorizacion en galerias y aplicaciones de gestion de fotos: ordena o etiqueta imagenes por calidad percibida para destacar las mejores tomas de un lote.
- Monitorizacion de calidad en camaras y sistemas de captura: al ejecutarse en local con llama.cpp, puede desplegarse junto al dispositivo para detectar degradacion de la senal (ruido, desenfoque) en tiempo casi real.
- Generacion de metadatos y justificaciones: el bloque de razonamiento aporta una explicacion legible que puede almacenarse junto a la puntuacion para auditoria o revision humana.
- Preetiquetado para anotacion humana: las puntuaciones y razonamientos sirven como borrador que los anotadores revisan, reduciendo el coste de construir datasets de calidad de imagen.
- Prototipado e investigacion en IQA: modelo ligero que cabe en hardware de consumo para experimentar con tecnicas de evaluacion sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0.6 GB en total; con el modelo de lenguaje en Q8_0 y el encoder en F16, la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, dado el reducido tamano del modelo (354 millones de parametros).
- Opciones de despliegue: llama.cpp (llama-mtmd-cli) y llama-cpp-python con `MTMDChatHandler`; al ser GGUF, es compatible con el ecosistema de llama.cpp en general.
- Configuracion de inferencia recomendada: `n_ctx=8192`, `max_tokens=640`, temperatura 0, top-k 1, top-p 1, min-p 0, penalizacion de repeticion 1.05.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-450M IQA v1 | 354 M | 8192 | Evaluacion de calidad de imagen | lfm1.0 | GGUF |
| LiquidAI/LFM2.5-VL-450M (base) | no disponible | no disponible | Image-text-to-text general | lfm1.0 | safetensors/GGUF |
| Alternativas especializadas en IQA | no disponible | no disponible | IQA | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado y orientado al japones; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- La puntuacion `overall` refleja el centro de votos humanos de KonIQ-10k, por lo que puede heredar sesgos del dataset (composicion demografica de anotadores, tipos de fotografia representados).
- Riesgo de alucinacion en el bloque de razonamiento: el texto descriptivo puede no corresponder exactamente a defectos reales de la imagen.
- Requiere dos archivos (modelo de lenguaje e imagen) y una configuracion de muestreo concreta; desviarse de ella puede degradar la calidad de la puntuacion.
- Licencia lfm1.0: es necesario revisar los terminos de la licencia del modelo base para uso comercial.
- El ajuste se realizo en una sola ronda de GRPO; puede existir variabilidad frente a versiones posteriores.
- No se han publicado evaluaciones formales de robustez ni comparaciones con metricas IQA estandar (PLCC, SRCC, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yonesuke0716/lfm2.5-vl-450M-iqa-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M/blob/main/LICENSE
