# StargazerLabs/Qwen3.8-32B-Jumbo-4bit

## Resumen

Qwen3.8-32B-Jumbo-4bit es una cuantización en 4-bit del modelo Qwen3.8-32B-Jumbo, desarrollado por StargazerLabs mediante una técnica experimental de "model surgery" (cirugía de modelos). El modelo original se construyó transplantando las tres capas más desviadas de Qwen3.6-27B al modelo Qwen3-8B, dando lugar a una arquitectura de 76 capas y aproximadamente 31.9 mil millones de parámetros. La cuantización se realizó con la librería MLX de Apple, optimizada para el hardware Apple Silicon, y los pesos se distribuyen en formato safetensors.

Este modelo está orientado a la generación de texto conversacional en inglés y destaca por su compatibilidad con decodificación especulativa MTP (Multi-Token Prediction), que alcanza una tasa de aceptación del drafter de alrededor del 89% y un incremento de velocidad de aproximadamente 2x en generación especulativa. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para desarrolladores que trabajan en entornos Apple con recursos de memoria limitados.

La relevancia de este modelo reside en su enfoque de reutilización de capas entre modelos existentes, reduciendo el coste computacional frente a un entrenamiento completo. Al estar cuantizado en 4-bit y optimizado para MLX, permite ejecutar un modelo de 31.9B en dispositivos con memoria unificada, como los Macs de Apple, con un tamaño de pesos de 18.6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer), 76 capas |
| Parámetros totales | ~31.9B (según model card) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

Nota: el archivo safetensors contiene 5.379.352.272 parámetros, correspondientes a los pesos cuantizados en 4-bit; los parámetros originales del modelo son ~31.9B.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, con 76 capas y ~31.9B parámetros. La técnica de construcción es "model surgery": se seleccionaron las tres capas más desviadas del modelo Qwen3.6-27B y se trasplantaron al modelo Qwen3-8B, creando una configuración híbrida que combina características de ambos modelos. No se ha publicado información detallada sobre el proceso de entrenamiento o fine-tuning posterior al transplantado.

La cuantización a 4-bit se realizó con la librería MLX de Apple, que optimiza los pesos para su ejecución en GPU y memoria unificada de los chips Apple Silicon. El modelo incorpora soporte para MTP (Multi-Token Prediction), un mecanismo de decodificación especulativa que utiliza un modelo drafter para predecir múltiples tokens en paralelo, logrando una tasa de aceptación del drafter de ~89% y una aceleración de 2x en la generación especulativa.

## Capacidades

- Generación de texto conversacional en inglés.
- Compatibilidad con decodificación especulativa MTP para acelerar la inferencia.
- Optimización para ejecución en Apple Silicon mediante MLX.
- Modelo de texto puro, sin capacidades multimodales conocidas.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.

## Casos de uso

- Inferencia en Macs Apple Silicon: el modelo, cuantizado en 4-bit y optimizado para MLX, puede ejecutarse en equipos con memoria unificada de al menos 18.6 GB, como MacBook Pro o Mac Studio, mediante el comando `mlx_vlm.generate`.
- Prototipado de asistentes conversacionales: su licencia Apache 2.0 permite uso comercial, y su tamaño de 31.9B ofrece un equilibrio adecuado entre calidad y consumo de recursos para entornos de desarrollo.
- Investigación en model surgery: este modelo es un caso práctico de cómo trasplantar capas entre modelos, permitiendo estudiar la transferencia de conocimiento entre arquitecturas sin entrenamiento completo.
- Generación de texto con baja latencia: gracias a la decodificación especulativa MTP, puede acelerarse la generación en aplicaciones que requieran respuestas rápidas, utilizando el modelo drafter `mlx-community/Qwen3.8-27B-MTP-4bit`.
- Evaluación de cuantización: permite comparar la calidad de la versión 4-bit frente a las variantes 8-bit, 3-bit y bf16 del mismo modelo, para decidir el mejor balance entre calidad y memoria.
- Despliegue en entornos edge: al ser un modelo cuantizado y optimizado para Apple Silicon, puede desplegarse en dispositivos como Mac Studio o MacBook Pro para aplicaciones locales sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple Silicon (M1, M2, M3 y superiores), ya que usa la librería MLX.
- El tamaño del repositorio es de 18.6 GB, por lo que se recomienda un dispositivo con al menos 32 GB de RAM unificada para cargar el modelo y ejecutarlo con margen.
- Se ejecuta mediante `mlx_vlm.generate` con el argumento `--model StargazerLabs/Qwen3.8-32B-Jumbo-4bit`.
- Para decodificación especulativa, se necesita además el modelo drafter `mlx-community/Qwen3.8-27B-MTP-4bit`.
- No es compatible con GPUs NVIDIA ni con frameworks como vLLM o llama.cpp, al estar ligado a MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.32B-Jumbo-4bit (este) | ~31.9B | no disponible | 4-bit MLX | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-32B-MLX-4bit | ~32B | no disponible | 4-bit MLX | Apache 2.0 | HuggingFace |
| Qwen3.8-32B-Jumbo (bf16) | ~31.9B | no disponible | bf16 | Apache 2.0 | HuggingFace |

El modelo Qwen/Qwen3-32B-MLX-4bit es una cuantización oficial de Qwen3-32B para MLX, mientras que el Jumbo es un resultado experimental con capas transplantadas. No se dispone de datos de benchmarks para comparar el rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo es experimental: fue creado mediante transplanting de capas y no se ha documentado su comportamiento en tareas específicas.
- Solo está disponible en inglés; no hay soporte multilingüe.
- La cuantización 4-bit puede degradar la calidad de las respuestas respecto al modelo en bf16.
- No se ha publicado información sobre sesgos o alucinaciones.
- La licencia Apache 2.0 permite uso comercial, pero no se han declarado restricciones adicionales.
- El modelo no es compatible con entornos de inferencia estándar como vLLM o llama.cpp; requiere MLX de Apple.
- La decodificación especulativa MTP depende de un modelo drafter adicional, lo que incrementa la complejidad del despliegue.

## Enlaces

- Modelo cuantizado: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-4bit
- Modelo bf16 original: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo
- Variante 8-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-8bit
- Variante 3-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-3bit
- Colección Jumbo: https://huggingface.co/collections/StargazerLabs/jumbo
- Repositorio de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de OpenLM sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Qwen/Qwen3-32B-MLX-4bit: https://huggingface.co/Qwen/Qwen3-32B-MLX-4bit
