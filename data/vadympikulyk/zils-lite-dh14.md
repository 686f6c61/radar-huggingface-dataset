# VadymPikulyk/zils-lite-dh14

## Resumen

zils-lite-dh14 es un modelo de decisión ("decision-model") de aproximadamente 853 millones de parámetros, derivado de un fine-tune de Qwen/Qwen3.5-0.8B y empaquetado en el formato de chasis d3-lite del ecosistema Zils, asociado a la subred 127 de Bittensor. Lo publica el usuario VadymPikulyk en Hugging Face bajo licencia Apache-2.0 y con pesos en safetensors que requieren código personalizado (`custom_code`) para cargarse.

El modelo no se presenta como un asistente conversacional general, sino como un "soup body": un cuerpo de pesos obtenido por model soup (promediado de pesos) y destilación. Concretamente, parte del promedio uniforme de dos cuerpos d3-lite previos y añade el cambio medio de dos semillas de un LoRA fusionado (rango 64, lr 5e-5, una época) entrenado sobre unas 72.000 respuestas de profesor del dataset zils-ai/zils-relay-answers, escalado a 0,35 veces el cambio de cada semilla.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación dentro de un pipeline de destilación y promediado de pesos, con cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado y sin datos publicados de benchmarks. Resulta útil para quienes siguen el ecosistema Zils/Bittensor o estudian técnicas de model soup y destilación sobre modelos pequeños, no como sustituto de un modelo base de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, tag `qwen3_5`); requiere `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, sin confirmar en la información) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin variantes GGUF declaradas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de unos 853 millones de parámetros, reempaquetado en el "chasis" d3-lite del ecosistema Zils. El modelo se construye en dos etapas: primero, el promedio uniforme de los pesos de dos cuerpos d3-lite ya asentados (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a, ambos Apache-2.0); después, se le suma el cambio medio de dos semillas de un LoRA fusionado de rango 64, learning rate 5e-5 y una época, entrenado con `python -m zils.teacher train` sobre el soup del 2026-11-16.

El dato de entrenamiento son aproximadamente 72.000 respuestas de profesor del dataset zils-ai/zils-relay-answers, que contienen probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento. El cambio de cada semilla se aplica con un factor de 0,35. El autor declara explícitamente que no se usaron ítems de examen de validadores, ítems de examen públicos ni datos de clientes. La innovación técnica no está en la arquitectura, sino en el procedimiento: model soup más destilación por LoRA fusionado con escalado del delta de pesos.

## Capacidades

- Generación de texto y razonamiento sobre preguntas de decisión, orientado por el entrenamiento de destilación con probabilidades del profesor d3-ultra.
- Modelo de decisión: el formato de las respuestas de profesor (probabilidades sobre preguntas de decisión) sugiere un uso orientado a clasificación o elección entre opciones más que a diálogo abierto.
- Pesos de lenguaje y visión, según la model card ("the language and vision weights"), aunque no se detalla el encoder visual ni su funcionamiento.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Evaluación de técnicas de model soup: el modelo sirve como caso concreto para reproducir y medir el efecto del promediado uniforme de dos cuerpos más la adición de un delta LoRA escalado a 0,35, comparando contra los modelos padre.
- Investigación en destilación de probabilidades: útil para estudiar cómo se transfieren las distribuciones de un profesor grande (vllm-sr/d3-ultra) a un cuerpo de 853 millones de parámetros mediante LoRA fusionado.
- Experimentación en el ecosistema Zils/Bittensor: permite a los participantes de la subred 127 inspeccionar un cuerpo candidato y entender el pipeline `zils.teacher train` sobre respuestas de relay.
- Clasificación o decisión acotada: dado el entrenamiento sobre preguntas de decisión con probabilidades, puede probarse en tareas de elección entre opciones dentro de dominios similares a las fuentes públicas usadas.
- Base para nuevos ciclos de soup: al ser un cuerpo intermedio, puede servir como punto de partida para promediados posteriores dentro de la misma familia, como ya ocurrió con zils-lite-dh10.
- Reproducibilidad de artefactos: con licencia Apache-2.0 y pesos en safetensors, encaja en auditorías que verifiquen las afirmaciones del autor sobre datos no usados (exámenes de validadores, datos de clientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 3-4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB de pesos; en 4 bits, alrededor de 0,5-0,7 GB, aunque no se publican variantes GGUF ni cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) debería bastar; en centro de datos, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con margen amplio, siempre que se resuelva la carga del `custom_code`.
- Opciones de despliegue: no se documenta ninguna; al requerir `custom_code` y no haber pesos GGUF, llama.cpp y Ollama no están soportados de forma directa. vLLM o TGI requerirían adaptar el código personalizado, sin garantías.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-dh14 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, safetensors con `custom_code` | Model soup + destilación, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible en esta ficha | según modelo base | Hugging Face | Modelo base original, sin el chasis d3-lite |
| joamCriff123/zils-lite-l1116a y l1116b | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpos d3-lite promediados como punto de partida |
| VadymPikulyk/zils-lite-dh10 | no disponible | no disponible | Apache-2.0 (presumible, no confirmado) | Hugging Face | Iteración previa de la misma familia |

## Limitaciones y advertencias

- Artefacto experimental: cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado ni benchmarks; no hay evidencia pública de calidad.
- Requiere `custom_code` para cargarse, lo que complica el despliegue estándar en vLLM, TGI, llama.cpp u Ollama y puede romper la compatibilidad con herramientas convencionales.
- Riesgo de alucinación no evaluado: no se han publicado métricas de fidelidad ni evaluaciones de seguridad.
- Sesgos desconocidos: los datos de entrenamiento son respuestas de profesor reconstruidas de fuentes públicas, sin análisis de sesgo documentado.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Longitud de contexto no confirmada en la información; no debe asumirse la del modelo base sin verificación.
- Aunque la licencia es Apache-2.0, el autor pide citar tasksource y los datasets originales, y remite a LICENSE y NOTICE para obligaciones adicionales.
- El uso comercial no está restringido por la licencia, pero la falta de evaluación y de soporte lo hace inadecuado para producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh14
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo de la familia: https://huggingface.co/VadymPikulyk/zils-lite-dh10
- Cuerpos promediados: https://huggingface.co/joamCriff123/zils-lite-l1116a y https://huggingface.co/joamCriff123/zils-lite-l1116b
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-lite (referenciado como `vllm-sr/d3-lite` y `vllm-sr/d3-ultra` en la model card)
- Dataset de respuestas de profesor: zils-ai/zils-relay-answers (referenciado en la model card; no se proporciona URL directa)
