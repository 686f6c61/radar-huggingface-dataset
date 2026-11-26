# turion-ai/turion-jev-9b

## Resumen

Turion Jev 9B es un modelo de decisión desarrollado por Turion AI, obtenido mediante fine-tuning del modelo base Qwen/Qwen3.5-9B. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (un texto descriptivo de una situación) junto con un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5) y devuelve, en un único forward pass, una probabilidad normalizada para cada opción de respuesta. La lectura se realiza a partir de las log-probabilidades del siguiente token correspondiente a los códigos de opción (A–Z y códigos de dos letras de un solo token, hasta 255 opciones por pregunta).

El modelo se presenta como el hermano pequeño de Turion Jev 31B: comparte el mismo conjunto de datos de entrenamiento, el mismo formato de prompt y el mismo mecanismo de lectura, pero sobre una base de 8.953.803.264 parámetros que puede ejecutarse en un portátil mediante llama.cpp. Es relevante para flujos de enrutamiento, clasificación y toma de decisiones estructuradas donde se necesita una salida probabilística calibrada en lugar de texto libre, con latencias del orden de 82-83 ms por petición medidas en una NVIDIA H200.

La arquitectura subyacente es la del transformer de Qwen3.5-9B (etiqueta `qwen3_5_text` en Hugging Face), sin la torre de visión. La licencia es Apache-2.0, igual que la del modelo base, y el checkpoint se distribuye en safetensors (BF16) y en formato GGUF a través de un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B, componente de texto; sin torre de visión) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (los prompts superiores se rechazan); entrenamiento con secuencias de hasta 16.384 tokens |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M); pesos completos en BF16 |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte del transformer de Qwen3.5-9B y conserva únicamente su modelo de lenguaje. Sobre él se aplica un fine-tuning LoRA con rango 64 y alpha 128 en todas las capas lineales, con tasa de aprendizaje 5e-05, durante 900 pasos de aproximadamente 65.000 tokens cada uno, secuencias de hasta 16.384 tokens, opciones barajadas e inputs de hasta 12.000 caracteres repetidos una vez en el prompt. La función de pérdida es entropía cruzada contra objetivos blandos (distribuciones de probabilidad) sobre los códigos de opción. Posteriormente se realiza un "model soup" uniforme de tres checkpoints (pasos 800, 850 y el último), se fusiona en el modelo base a escala completa y se guarda en BF16. El cómputo total fue de unas 5,0 horas en una NVIDIA H200.

El mecanismo de decisión se articula en tres piezas. Primero, el prompt lista todas las preguntas antes del estado y asigna a cada opción un código de un solo token. Segundo, la lectura toma las log-probabilidades del siguiente token de cada código y las normaliza sobre las opciones mostradas, aplicando una temperatura por tipo de pregunta definida en `calibration.json` (1,13 para elección, 1,11 para sí/no y 1,08 para puntuación). Tercero, los inputs de hasta 12.000 caracteres se repiten una vez en el prompt según `prompt_config.json`. El conjunto de entrenamiento es el mismo de Turion Jev 31B: 157.106 filas, verificadas contra la suite 0.3 del Decision Index mediante coincidencia de línea, solapamiento de 13-gramas y coincidencia exacta para evitar contaminación.

## Capacidades

- Clasificación y enrutamiento probabilístico: devuelve una distribución de probabilidad sobre opciones discretas en un solo forward pass, sin generación autoregresiva.
- Preguntas de elección múltiple con hasta 255 opciones por pregunta.
- Preguntas de sí/no (tipo `noul` en la API de ejemplo).
- Preguntas de puntuación en escala 0–5.
- Procesamiento de estados de hasta 12.000 caracteres con repetición del input para reforzar la lectura.
- Soporte de múltiples preguntas por petición, resueltas en una única pasada.
- Servidor HTTP compatible con el endpoint `/v1/systemone`, con backends GGUF (llama.cpp), vLLM y transformers.
- Integración con el pipeline del Decision Index mediante el motor `turion_jev.kit_engine:TurionJev`.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; es un modelo de decisión, no un generador.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo asigna probabilidades a equipos (facturación, técnico, ventas, otros) y a la urgencia en una sola llamada, como muestra el ejemplo de la model card con el endpoint `/v1/systemone`.
- Triaje de correo entrante: clasificación simultánea de categoría, prioridad y necesidad de respuesta hoy, con probabilidades calibradas que permiten fijar umbrales de derivación automática.
- Moderación de contenido con escala graduada: uso de preguntas de puntuación 0–5 para estimar la gravedad de un texto y decidir entre publicación, revisión humana o bloqueo.
- Encuestas y anotación asistida: asignación probabilística de etiquetas a respuestas abiertas, aprovechando la salida blanda para medir acuerdo entre anotadores o detectar casos ambiguos.
- Filtrado previo en pipelines RAG: decidir sí/no si un documento recuperado es relevante para la consulta antes de invocar un modelo generativo más caro, reduciendo coste y latencia.
- Evaluación automática de calidad: puntuación 0–5 de respuestas generadas por otro modelo según criterios definidos en las instrucciones de la pregunta.
- Despliegue en local o en el borde: ejecución en CPU, Apple silicon o GPU pequeña mediante los GGUF Q4_K_M, útil para clasificación sensible a la privacidad sin enviar datos a la nube.

## Benchmarks y rendimiento

| Metrica | Turion Jev 9B |
|---|---|
| Decision Index, suite pública 0.3 (estimado sobre muestra estratificada de 4.214 peticiones) | 53,7 |
| Proxy Full en conjuntos held-out (0,6 × dominios vistos + 0,4 × dominios nuevos) | 80,62 |
| Tiempo por petición en held-out, una petición a la vez | mediana 83 ms · media 82 ms |
| Hardware de las mediciones | una NVIDIA H200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y se evalúa con métricas propias de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 18 GB para los pesos completos, más overhead de activaciones y caché KV; el repositorio ocupa 17,9 GB.
- Cuantización Q4_K_M en GGUF: aproximadamente 5-6 GB, apta para CPU, Apple silicon y GPU de consumo.
- GPU recomendadas: NVIDIA H200 para las cifras publicadas; A100 o H100 para despliegue en BF16 con vLLM; RTX 4090 (24 GB) suficiente para BF16 en una sola GPU.
- Cabe en GPU de consumo: sí, con cuantización GGUF Q4_K_M en tarjetas de 8 GB o más; en BF16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp (backend `gguf`), vLLM (backend `vllm`), transformers (backend `hf`) y el servidor propio `python -m turion_jev.serve`; también disponible como servicio hospedado con clave de Turion.
- Latencia y throughput: mediana de 83 ms y media de 82 ms por petición en H200, con una petición a la vez; no se han publicado cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 9B | 8,95 B | 65.536 tokens | Modelo de decisión (probabilidades sobre opciones) | Apache-2.0 | Hugging Face (safetensors y GGUF) y API hospedada |
| Turion Jev 31B | no disponible | no disponible | Modelo de decisión, mismo prompt y datos | no disponible en la información | Hugging Face y API hospedada |
| Qwen3.5-9B (base) | 9 B (aproximado) | no disponible | Generación de texto | Apache-2.0 (según la card) | Hugging Face |

La comparación con modelos de clasificación dedicados de otros proveedores no está disponible en la información proporcionada. Frente a su hermano de 31B, el 9B pierde precisión en razonamiento difícil y en dominios alejados de los datos de entrenamiento, según reconoce el propio autor.

## Limitaciones y advertencias

- Modelo pequeño: rinde por debajo de Turion Jev 31B en razonamiento difícil y en dominios alejados de sus datos de entrenamiento; el autor recomienda el 31B cuando la precisión prima sobre el coste.
- Rechaza prompts de más de 65.536 tokens.
- La atención es la del modelo base; no lee el prompt de forma bidireccional, lo que puede afectar a la lectura de estados muy largos.
- Las probabilidades están calibradas sobre los datos held-out del autor; es necesario verificar la calibración sobre datos propios antes de fijar umbrales en producción.
- No genera texto, no soporta tool calling ni razonamiento multi-paso; usarlo fuera de tareas de decisión estructurada no es adecuado.
- No incluye torre de visión: no procesa imágenes.
- La model card no enumera los idiomas soportados, por lo que el rendimiento multilingüe no está documentado.
- Licencia Apache-2.0 para los pesos, pero las fuentes de datos de entrenamiento conservan sus propias licencias, según se indica en `LICENSE` y `NOTICE`.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración errónea: una probabilidad alta no garantiza una decisión correcta en dominios fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-9b
- GGUF: https://huggingface.co/turion-ai/turion-jev-9b-GGUF
- Modelo hermano de 31B: https://huggingface.co/turion-ai/turion-jev-31b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio del autor: https://turion.ai
- Precios y límites del servicio hospedado: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Repositorio del Decision Index: https://github.com/apolinario/decision-index
