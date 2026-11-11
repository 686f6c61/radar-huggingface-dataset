# Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic

## Resumen

Qwen3.5-0.8B-Crouton-Reasoner-heretic es un ajuste fino del modelo Qwen/Qwen3.5-0.8B publicado por el usuario Stormtrooperaim en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, con 852.985.920 parametros totales, entrenado mediante LoRA (r=64, alpha=128) sobre aproximadamente 14.619 conversaciones destiladas de un modelo mayor, recogidas en el dataset Stormtrooperaim/Crouton-Alpha-Distilled. El objetivo declarado es producir respuestas mas concisas y con un formato de respuesta final mas fiable que el modelo base.

Sobre esa base se ha aplicado un proceso de "decensurado" mediante la herramienta Heretic v2.1.0, que realiza una ablacion de rango arbitrario (Arbitrary-Rank Ablation) sobre las capas 11 a 20 del modelo. El autor reporta que esta intervencion reduce los rechazos de 67/100 en el modelo original a 0/100, con una divergencia KL de 3.5451 respecto al modelo de partida, lo que indica un cambio de distribucion notable.

El modelo es relevante en el ecosistema por dos motivos: por un lado, demuestra un flujo de trabajo de destilacion y ajuste fino sobre un modelo pequeno de 0,8B con capacidades multimodales; por otro, ilustra las tecnicas de ablacion de direcciones de activacion para eliminar comportamientos de rechazo, un area de interes creciente tanto para investigacion como para despliegues que requieren baja censura. La licencia es Apache 2.0 y el repositorio ocupa 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; incluye atencion y capas Gated-DeltaNet segun la descripcion del entrenamiento |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el harness de evaluacion usa presupuestos de 512 y 2.048 tokens generados, no el contexto maximo) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en el tamano indicado; no se listan variantes GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con encoder de vision para entrada de imagen y texto. El ajuste fino se realizo con LoRA de rango 64, alpha 128 y dropout 0.05 aplicado a todas las proyecciones lineales del modelo de lenguaje (atencion, capas Gated-DeltaNet y MLP), y posteriormente fusionado en los pesos. Se usaron 14.619 ejemplos de entrenamiento, uno por turno de asistente, con perdida calculada solo sobre la respuesta (completion-only), manteniendo las trazas de razonamiento y descartando seis ejemplos de mas de 4.096 tokens. El dataset de partida es una destilacion de aproximadamente 15.000 conversaciones generadas por un modelo mayor.

Sobre el modelo ajustado se aplico Heretic v2.1.0 con ablacion de rango arbitrario entre las capas 11 y 20, con pesos de preservacion de buen comportamiento de 0.0340, de direccion de mal comportamiento de 0.1289, de correccion relativa de 0.6378 y 13 vecinos. El encoder de vision no se modifico, por lo que la entrada de imagen funciona igual que en el modelo base. El autor indica que el razonamiento dentro de `<think>...</think>` es corto, tipicamente por debajo de 150 tokens, de modo que el modo thinking y el no-thinking rinden de forma similar.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking explicito mediante bloques `<think>...</think>`, aunque las trazas son cortas (por debajo de 150 tokens tipicamente).
- Entrada de imagen (image-text-to-text) con encoder de vision sin modificar respecto al modelo base.
- Respuestas concisas y con formato de respuesta final mas fiable que el modelo base, segun las metricas del autor.
- Conocimiento general y cientifico (evaluado en MMLU y ARC-Challenge).
- Matematicas de problemas verbales (GSM8K), con rendimiento inferior al modelo base segun el autor.
- Comportamiento decensurado: 0 rechazos en 100 pruebas segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada; el razonamiento interno es corto.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de respuestas conversacionales concisas: el ajuste reduce la longitud media de salida (52-73 tokens en MMLU frente a 315 del base en modo no-thinking), lo que lo hace adecuado para asistentes donde la brevedad es prioritaria.
- Clasificacion y respuesta a preguntas de opcion multiple: el modelo produce respuestas finales legibles en el 99,8% de las preguntas de MMLU y el 100% de ARC-Challenge, lo que permite usarlo en pipelines de evaluacion automatica o triaje de conocimiento.
- Prototipado de asistentes multimodales de bajo coste: con 0,85B de parametros y pesos safetensors de 1,7 GB, puede desplegarse en hardware modesto para experimentar con entrada de imagen y texto.
- Investigacion sobre decensurado y alineacion: sirve como caso de estudio reproducible de ablacion de direcciones de activacion (Heretic) y de su efecto sobre la tasa de rechazos y la divergencia KL.
- Destilacion de estilo y formato: el modelo aprendio el estilo del dataset Crouton-Alpha-Distilled (perplejidad 4,706 frente a 6,416 del base en conversaciones retenidas), util para generar respuestas con un formato concreto.
- Base para nuevos ajustes finos: al ser un modelo pequeno con licencia Apache 2.0 y formato transformers, es un punto de partida economico para SFT adicional o experimentos de LoRA.
- Evaluacion comparativa de tecnicas de ablacion: permite medir el coste en calidad (caida de 4,6 puntos en GSM8K) frente al beneficio en reduccion de rechazos.

## Benchmarks y rendimiento

Resultados reportados por el autor, comparando el modelo ajustado con el base en modo no-thinking (su mejor modo). Precision en porcentaje.

| Benchmark | Preguntas | Qwen3.5-0.8B (no-thinking) | Crouton-Reasoner (no-thinking) | Crouton-Reasoner (thinking) | Delta mejor vs. base |
|---|---:|---:|---:|---:|---:|
| ARC-Challenge (ciencia) | 500 | 67,0 | 70,4 | 68,2 | +3,4 |
| MMLU (57 materias) | 1000 | 47,0 | 50,6 | 49,8 | +3,6 |
| GSM8K (problemas matematicos) | 500 | 49,2 | 44,6 | 44,6 | -4,6 |

El autor advierte que parte de la mejora en MMLU y ARC se debe a la fiabilidad del formato de respuesta: el modelo base no dio respuesta legible en el 21,1% de MMLU y el 8,2% de ARC en modo no-thinking, frente al 0,2% y 0,0% del ajustado. La caida en GSM8K se atribuye a soluciones mucho mas cortas (120-148 tokens frente a 385 del base). Con 500 preguntas, diferencias de unos 3 puntos estan cerca del ruido estadistico.

En conversaciones retenidas del dataset Crouton (298 conversaciones, 199.338 tokens de respuesta):

| Metrica (menor es mejor) | Base | Ajustado |
|---|---:|---:|
| Perdida por token de respuesta | 1,8587 | 1,5489 |
| Perplejidad | 6,416 | 4,706 |

Los resultados de modo thinking del modelo base (GSM8K 0,6; ARC 13,2; MMLU 6,0) no son comparaciones justas segun el autor, porque el base casi nunca cerraba su razonamiento dentro del presupuesto de 2.048 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 852.985.920 parametros, en fp16 el peso ocupa aproximadamente 1,7 GB, y en cuantizaciones de 8 o 4 bits seria inferior, aunque el repositorio solo distribuye safetensors.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo cabe en GPUs de consumo con suficiente memoria para el peso y el encoder de vision.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 0,85B, aunque no se aportan mediciones concretas.
- Opciones de despliegue: transformers (libreria indicada); no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner-heretic | 852.985.920 | no disponible | apache-2.0 | Ajuste fino + ablacion Heretic; 0/100 rechazos |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo de partida; 67/100 rechazos; MMLU 47,0, ARC 67,0, GSM8K 49,2 |
| Alternativas de ~1B | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables |

No se dispone de informacion sobre otros modelos de tamano o categoria similares en la documentacion aportada.

## Limitaciones y advertencias

- La ablacion Heretic produce una divergencia KL de 3.5451 respecto al modelo original, lo que implica cambios notables en la distribucion de salida que pueden afectar a la calidad en tareas no evaluadas.
- Caida de 4,6 puntos en GSM8K respecto al base: el modelo es peor en problemas matematicos de varios pasos.
- El razonamiento interno es muy corto (por debajo de 150 tokens), lo que limita tareas que requieren cadenas de pensamiento largas.
- Las mejoras en MMLU y ARC (+3,4 y +3,6 puntos con 500-1000 preguntas) estan cerca del ruido estadistico y no deben interpretarse como ganancias robustas.
- Modelo decensurado: la eliminacion de rechazos implica que puede generar contenido que el modelo base rechazaria; requiere filtros y politicas de uso en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento multilingue.
- No se confirma soporte de tool calling ni de agentes.
- El autor no reporta el contexto maximo del modelo ni variantes cuantizadas; el despliegue en produccion requeriria verificacion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo decensurado puede incumplir politicas de plataformas o normativa aplicable.
- Solo 15 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Stormtrooperaim/Crouton-Alpha-Distilled
- Heretic: https://heretic-project.org
- Resultados de benchmarks: benchmark_results.json (incluido en el repositorio del modelo)
