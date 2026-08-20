# xv0y5ncu/Gemma-4-E4B-it-GLQ-3.5bpw-mix3-8

## Resumen

Gemma-4-E4B-it-GLQ-3.5bpw-mix3-8 es una cuantización de alta eficiencia del modelo multimodal Gemma 4 E4B de Google, realizada por el usuario xv0y5ncu mediante el método GLQ (Golay–Leech Quantization). El modelo base, google/gemma-4-E4B-it, es un modelo de lenguaje y visión de 4,4 mil millones de parámetros con ventana de contexto de hasta 256K tokens y modo de pensamiento (thinking mode), diseñado por Google DeepMind para ejecutarse en hardware de consumo.

Esta variante comprime los pesos a una media ponderada de 3,5 bits por parámetro, con precisión mixta de 3 a 8 bits asignada según la sensibilidad de cada capa. El resultado son 3.376.040.522 parámetros totales en formato safetensors, con un peso de repositorio de 6,8 GB y una licencia Apache 2.0. Su relevancia radica en que, según los benchmarks publicados por el autor, supera en unos 9 puntos porcentuales de precisión a otras cuantizaciones del mismo rango de bits (GGUF Q3_K_S y UD-IQ3_XXS) en MMLU-Pro, a pesar de tener una tasa de bits menor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto-imagen a texto), base Gemma 4 E4B |
| Parámetros totales | 3.376.040.522 (pesos cuantizados, safetensors) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | hasta 256.000 tokens (heredada del modelo base) |
| Tipos de cuantización | GLQ 3,5 bpw media ponderada, precisión mixta 3-8 bpw (E8 lattice + RHT + LDLQ + RVQ) |
| Idiomas soportados | inglés (declarado en la model card; el base Gemma 4 soporta más de 140 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con integración GLQ para transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4,4B parámetros con entrada multimodal (imagen y texto) y salida de texto, perteneciente a la familia Gemma 4 de Google. La model card de Google indica que Gemma 4 incluye arquitecturas densas y de mezcla de expertos, con los tamaños E2B, E4B, 12B, 26B A4B y 31B; E4B corresponde a la variante densa de 4B. El modelo base incorpora un modo de pensamiento (thinking mode) que se activa mediante `enable_thinking=true`.

Esta cuantización no altera la arquitectura, solo los pesos. El método GLQ utiliza un codebook de retícula E8 con 65.536 entradas, transformada de Hadamard aleatoria (RHT) y redondeo óptimo LDLQ, más una segunda etapa de cuantización residual (RVQ) con un codebook de 256 entradas. La asignación de bits se realizó mediante un asignador greedy basado en pérdidas proxy por capa, calibrado con 128 muestras de 2048 tokens del dataset C4. Las capas más sensibles (`k_proj`, `o_proj`, `per_layer_input_gate`) reciben de 6 a 8 bits, mientras que la mayoría de las capas MLP (`gate_proj`, `up_proj`, `down_proj`) se cuantizan a 3 bits. La relación señal-ruido de cuantización (SQNR) media es de 21,77 dB. El proceso de cuantización completo tardó unos 8 minutos en una RTX PRO 6000 Blackwell de 96 GB.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada y genera texto, heredado del modelo base Gemma 4 E4B.
- Modo de pensamiento (thinking mode): el modelo base incluye un modo de razonamiento explícito que puede activarse; los benchmarks de esta cuantización se generaron con `enable_thinking=true`.
- Razonamiento y comprensión de lenguaje: evaluado en MMLU-Pro, muestra una degradación moderada frente al bf16 (84,8% de la precisión del original).
- Capacidades multilingües del modelo base: el Gemma 4 original soporta más de 140 idiomas, aunque esta cuantización solo declara inglés en su model card.
- Despliegue en producción: compatible con vLLM mediante la integración GLQ (`--quantization glq`) y con transformers a través de `glq.hf_integration`.
- Cuantización de alta densidad: con 3,5 bpw media, los pesos ocupan aproximadamente 1,7 GB, lo que permite ejecutar el modelo en GPUs de consumo.

## Casos de uso

- Asistente de programación local: con 3,5 bpw y unos 1,7 GB de pesos, el modelo cabe en una GPU consumer de 8 GB, lo que permite un copiloto de código privado y sin conexión con razonamiento activable.
- Análisis de imágenes en el borde: al ser multimodal, puede describir o responder preguntas sobre capturas de pantalla, fotos o diagramas directamente en el dispositivo, sin enviar datos a la nube.
- Chat de atención al cliente con contexto largo: los 256K tokens de contexto permiten mantener conversaciones extensas con historial completo, adecuado para sistemas de soporte que requieren memoria de la interacción.
- Servidor de inferencia con vLLM: al ser compatible con el backend de vLLM, puede desplegarse como endpoint de OpenAI-compatible para aplicaciones que consumen modelos de texto e imagen.
- Investigación de cuantización: la descomposición de bits por capa (tabla de asignación publicada) lo convierte en una referencia para estudiar el impacto de la precisión mixta en modelos multimodales.
- Prototipado de agentes con tool calling: aunque no se documenta explícitamente en la model card, el base Gemma 4 soporta generación de texto y razonamiento, por lo que puede integrarse en flujos de agente con herramientas mediante el modo de pensamiento.

## Benchmarks y rendimiento

El autor publica resultados de MMLU-Pro (muestra del 2%, n=247) con `enable_thinking=true`, comparando la cuantización con otras variantes:

| Variante | bpw (media ponderada) | Precisión | Error estándar | Motor | vs bf16 |
|---|---|---|---|---|---|
| bf16 | 16,0 | 0,6640 | 0,0289 | vLLM | 100% |
| GLQ 3,5 mix 3-8 (este modelo) | 3,50 | 0,5628 | 0,0310 | vLLM | 84,8% |
| GGUF Q3_K_S | 3,89 | 0,4696 | 0,0300 | llama.cpp | 70,7% |
| GGUF UD-IQ3_XXS (calibrado) | 3,75 | 0,4818 | 0,0295 | llama.cpp | 72,6% |
| GLQ uniforme 3,0 | 3,00 | 0,4413 | 0,0311 | vLLM | 66,5% |

El modelo supera en unos 9 puntos porcentuales a las alternativas GGUF de su clase con un menor consumo de bits. No se han publicado resultados adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 1,7 GB (3.945.267.200 pesos × 3,5 bits), más overhead de activaciones y cache KV.
- El modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM según la documentación de gemma4.dev; esta cuantización, al reducir el peso, debería caber en GPUs consumer de 8 GB como la RTX 4060 o superiores.
- GPU recomendadas: RTX 4060/4070/4080/4090, RTX PRO 6000 Blackwell (usada para la cuantización), A100/H100 para despliegue en servidor.
- Opciones de despliegue: vLLM (con `--quantization glq`), transformers con la integración `glq.hf_integration`, y potencialmente llama.cpp no está soportado (los GGUFs comparados son de otras herramientas).
- Latencia y throughput: no disponible en la información proporcionada.
- Requisito de software: se debe pinzar `transformers` entre 5.13.1 y 5.15 (5.15.0 rompe la carga del modelo por un cambio en la config de gemma-4); verificado con 5.14.1 y vLLM 0.27.1.

## Comparativa con modelos similares

| Modelo | bpw | Precisión (MMLU-Pro) | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B bf16 (base) | 16,0 | 0,6640 | 256K | Apache 2.0 | safetensors bf16 |
| Gemma-4-E4B-it-GLQ-3.5bpw-mix3-8 (este) | 3,50 | 0,5628 | 256K | Apache 2.0 | safetensors GLQ |
| GGUF Q3_K_S del mismo modelo | 3,89 | 0,4696 | 256K | Apache 2.0 | GGUF |
| GGUF UD-IQ3_XXS del mismo modelo | 3,75 | 0,4818 | 256K | Apache 2.0 | GGUF |

La comparativa muestra que la cuantización GLQ supera a las alternativas GGUF del mismo rango de bits, aunque no se dispone de datos de otros modelos de la misma categoría (p.ej., Llama 3.2 3B o Qwen 2.5 4B) en la información disponible.

## Limitaciones y advertencias

- Sesgo y alucinación: como el modelo base Gemma 4, puede generar contenido inexacto o sesgado; la cuantización añade una degradación de precisión del 15,2% frente al bf16 en MMLU-Pro.
- Riesgo de alucinación en tareas de razonamiento: el modo de pensamiento activado puede producir cadenas de razonamiento incorrectas que el usuario debe verificar.
- Idioma: la model card declara únicamente inglés; aunque el base soporta 140+ idiomas, no se garantiza el rendimiento en otros idiomas en esta cuantización.
- Compatibilidad de versiones: exige fijar `transformers` entre 5.13.1 y 5.15; versiones superiores rompen la carga del modelo (problema del base, no específico de GLQ).
- Sin soporte llama.cpp: la integración GLQ solo funciona con transformers y vLLM; no se puede usar con llama.cpp ni Ollama.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de Gemma 4 en https://ai.google.dev/gemma/docs/gemma_4_license.
- Rendimiento de producción: no se han publicado datos de latencia, throughput ni pruebas de estrés en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-3.5bpw-mix3-8
- Modelo base de Google: https://huggingface.co/google/gemma-4-E4B
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Model card de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Herramienta GLQ en GitHub: https://github.com/cnygaard/glq
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
