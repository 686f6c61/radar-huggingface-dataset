# vnbot-ai/VNBot-MotaZ-27B-MLX-8bit

## Resumen

VNBot-MotaZ-27B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). El modelo base es un transformer de 27 mil millones de parámetros, presumiblemente derivado de la familia Qwen (la etiqueta `qwen3_5` en Hugging Face así lo sugiere), con una ventana de contexto de 262.144 tokens y capacidad de procesar entradas de texto e imagen (`image-text-to-text`).

La relevancia de esta publicación radica en su enfoque: es una adaptación específica para el ecosistema MLX de Apple Silicon, orientada a inferencia local en hardware de consumo, con soporte declarado para vietnamita e inglés. El repo ocupa 24,2 GB y el autor indica un tamaño de 29,5 GB para los pesos de 8 bits, lo que lo sitúa en el rango de equipos con 32 GB de memoria unificada o superiores.

La información pública disponible es escasa: no hay benchmarks, no hay detalle sobre la composición del dataset de entrenamiento ni sobre el proceso de alineación. La ficha que sigue recoge únicamente los datos verificables de la model card y de los metadatos de Hugging Face, marcando como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen); etiqueta `qwen3_5` en Hugging Face, arquitectura exacta no detallada por el autor |
| Parametros totales | 27B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según model card) |
| Tipos de cuantizacion | 8 bits en formato MLX (este repo); el modelo base admite otras cuantizaciones no documentadas |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 24,2 GB, pesos 8-bit de 29,5 GB según el autor |
| Libreria de inferencia | MLX (`mlx-vlm`) |
| Pipeline | image-text-to-text |
| Modelo base | vnbot-ai/VNBot-MotaZ-27B (relación: quantized) |

## Arquitectura y entrenamiento

El autor no publica detalles sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline multimodal `image-text-to-text`. Por el nombre y el tamaño (27B) y por la ventana de contexto de 262.144 tokens, es plausible que se trate de una variante de la familia Qwen 3.5 con un codificador visual acoplado, pero esto no está confirmado en la documentación disponible. No se especifica si emplea atención lineal, decodificación especulativa, MoE o técnicas de atención híbrida.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o cualquier otra etapa de alineación. La model card se limita a indicar que es "el asistente de IA de Origo Technologies" con soporte para texto e imagen en vietnamita e inglés. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional multi-turno en vietnamita e inglés.
- Procesamiento de entradas de imagen junto a texto (`image-text-to-text`), lo que permite tareas de descripción de imágenes y respuesta a preguntas visuales.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones extensas.
- Ejecución local en Apple Silicon mediante MLX y `mlx-vlm`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking" explícito: no disponible (no documentado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local en vietnamita: el modelo puede mantener diálogos multi-turno con contexto largo (262.144 tokens) ejecutándose íntegramente en un Mac con Apple Silicon, sin depender de servicios en la nube, lo que resulta adecuado para aplicaciones sensibles a la privacidad.
- Descripción y análisis de imágenes: gracias al pipeline `image-text-to-text`, puede recibir una imagen junto a una pregunta en vietnamita o inglés y generar una respuesta descriptiva, útil para catalogación de imágenes o accesibilidad.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir informes, contratos o transcripciones completas en una sola pasada para tareas de resumen y extracción de información.
- Atención al cliente en vietnamita: integrable en un backend local que gestione conversaciones multi-turno con historial largo, reduciendo la latencia de red y el coste por consulta frente a APIs externas.
- Prototipado e investigación en NLP vietnamita: al ser Apache-2.0 y ejecutable en MLX, sirve como base para experimentos académicos o de evaluación lingüística sin restricciones de uso comercial.
- Generación de contenido bilingüe vi/en: útil para equipos que producen material en vietnamita e inglés y necesitan traducción, reformulación o redacción asistida con contexto amplio.
- Inferencia en dispositivos de consumo: al estar cuantizado a 8 bits en MLX, permite desplegar un modelo de 27B en estaciones de trabajo Apple con memoria unificada suficiente, evitando GPUs dedicadas de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos 8-bit ocupan 29,5 GB según el autor; el repo completo pesa 24,2 GB. Para inferencia con contexto largo hay que sumar la caché KV, que crece con los 262.144 tokens de ventana; en la práctica se necesitan del orden de 32-48 GB de memoria unificada para contextos moderados.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o más, preferiblemente M-series Max/Ultra). Para GPUs NVIDIA no se distribuye una versión equivalente en este repo.
- ¿Cabe en GPU de consumo? En Apple Silicon con 32 GB o más, sí, con contextos reducidos; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) no cabe en 8 bits sin offloading.
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`), según la model card. vLLM, llama.cpp, Ollama o TGI no están documentados para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato/Plataforma |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-MLX-8bit | 27B | 262.144 | Sí | Apache-2.0 | MLX 8-bit (Apple Silicon) |
| Qwen3-VL (variantes 30B aprox.) | ~30B | hasta 262.144 en algunas variantes | Sí | Apache-2.0 en la mayoría de variantes | safetensors, GGUF, MLX |
| Gemma 3 27B | 27B | 128K | Sí (variante multimodal) | Gemma license (uso comercial con condiciones) | safetensors, GGUF, MLX |
| Llama 3.x Vision (variantes ~30B) | ~30B | 128K | Sí | Llama license | safetensors, GGUF |

Nota: los datos de los modelos comparables provienen del conocimiento general de la familia y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa. No hay benchmarks publicados para VNBot-MotaZ que permitan una comparación de rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en tareas multimodales, lo que impide validar el rendimiento frente a alternativas.
- Idiomas limitados: solo se declaran vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación sobre mitigaciones.
- Sesgos: no documentados por el autor; al no conocerse la composición del dataset, no es posible evaluar sesgos de dominio, género o culturales.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar `LICENSE` y `NOTICE` del repo por si el modelo base impone condiciones adicionales.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon; no hay conversión oficial a GGUF o safetensors genéricos en este repo.
- Contexto largo: los 262.144 tokens son el máximo teórico; el autor advierte que hay que reducirlo si falta memoria, por lo que en la práctica el contexto efectivo será menor.
- Modelo de nicho y con tracción nula (0 descargas, 0 likes en el momento de la consulta): no hay comunidad que valide su comportamiento en producción.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene verificar la procedencia y autenticidad del repo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-MLX-8bit
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Librería MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Documentación MLX: https://ml-explore.github.io/mlx/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
