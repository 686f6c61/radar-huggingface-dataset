# thquangpc/gemma-4-31B-it-qat-q4_0-uncensored-heretic-GGUF

## Resumen

Este repositorio contiene una versión "decensored" (abliterated) del modelo Gemma 4 de 31B de Google DeepMind, publicada por el usuario thquangpc bajo el identificador `gemma-4-31B-it-qat-q4_0-uncensored-heretic-GGUF`. Se trata de un derivado del checkpoint oficial `google/gemma-4-31B-it` tras pasar por un proceso de entrenamiento con cuantización (QAT) en formato Q4_0 y, posteriormente, por una modificación de sus capas de seguridad mediante la herramienta Heretic v2.0.0. El modelo base es multimodal (entrada de texto e imagen, salida de texto) y forma parte de la familia Gemma 4, que incluye variantes densas y MoE en cinco tamaños.

El interés de esta ficha reside en dos aspectos. Por un lado, documenta un caso de "abliteration": una técnica que elimina o reduce drásticamente los mecanismos de rechazo del modelo (de 100/100 rechazos en el original a 0/100 en esta versión, según la model card). Por otro, muestra el ecosistema de derivados que surgen alrededor de los modelos abiertos de Google, en este caso con empaquetado GGUF para despliegue local. El modelo tiene 30.697.345.596 parámetros reales (aproximadamente 30,7B) y un tamaño de repositorio de 19,3 GB.

Es relevante ahora porque combina tres tendencias: la cuantización agresiva para reducir requisitos de memoria, la publicación de pesos abiertos con licencia Apache 2.0 y la experimentación de la comunidad con técnicas de alineación inversa. No obstante, el propio autor advierte que su uso previsto es exclusivamente para investigación y experimentación, no para servicios públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante densa de 31B; el modelo base admite texto e imagen) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (variante densa; el modelo base tiene una variante MoE separada, 26B A4B) |
| Longitud de contexto | Hasta 256K tokens (según la model card del modelo base) |
| Tipos de cuantizacion | Q4_0 (GGUF), derivado de QAT; el modelo base ofrece además wNa8o8 y w4a16 |
| Idiomas soportados | Más de 140 idiomas según el modelo base; no se detalla en esta ficha derivada |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4) |
| Formato de pesos | GGUF (repo de 19,3 GB); el checkpoint base también existe en safetensors y compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 es un transformer multimodal que procesa texto e imagen como entrada y genera texto. La variante de 31B es densa, a diferencia de la variante 26B A4B que emplea mezcla de expertos (MoE). El modelo original se distribuye en variantes preentrenada e instruction-tuned, con soporte de razonamiento configurable (thinking mode) y una ventana de contexto de hasta 256K tokens. La familia Gemma 4 se entrenó con Quantization-Aware Training (QAT), lo que permite obtener checkpoints Q4_0 con una calidad cercana a bfloat16 y una reducción notable de memoria.

Sobre esta base, el autor aplicó un proceso de abliteración con Heretic v2.0.0. Los parámetros documentados indican que se actuó sobre las capas 30 a 41, con pesos de preservación de comportamiento bueno de 1.0 y de dirección del comportamiento malo de 0.0001, un rango de transporte de 4, regularización ridge de aproximadamente 1,36e-06, transporte gaussiano y LoRA de rango 128. Los componentes objetivo fueron `attn.o_proj` y `mlp.down_proj`. El resultado reportado es una divergencia KL de 0.0083 respecto al modelo original y una eliminación total de los rechazos en una prueba de 100 prompts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base está diseñado como un razonador capaz, con modo de pensamiento configurable.
- Procesamiento de imagen: pipeline `image-text-to-text`, por lo que acepta imágenes junto con texto.
- Generación de código: la familia Gemma 4 se presenta como adecuada para tareas de código.
- Capacidades multilingües: más de 140 idiomas en el modelo base.
- Conversación multi-turno: etiqueta `conversational` en el repositorio.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`.
- Reducción de rechazos: 0/100 rechazos según la model card, lo que implica que el modelo no declina peticiones que el original rechazaría.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o audio para esta variante concreta (el audio está limitado a E2B, E4B y 12B en la familia).

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve para estudiar cómo la abliteración afecta al comportamiento, comparando las respuestas con el original y midiendo la divergencia KL reportada (0.0083). Es adecuado porque elimina los rechazos y permite observar el comportamiento "sin filtros" en condiciones controladas.
- Red-teaming de sistemas: se puede emplear para generar prompts adversarios y evaluar la robustez de clasificadores de contenido o de otros modelos alineados, aprovechando su tendencia a producir contenido que el original rechazaría.
- Estudio de sesgos: al reducir la alineación, el modelo puede exponer sesgos latentes del entrenamiento original, lo que facilita su análisis en entornos de investigación.
- Despliegue local con GGUF: el formato GGUF Q4_0 permite ejecutarlo en estaciones de trabajo con GPU de consumo mediante llama.cpp u Ollama, útil para experimentos que requieren privacidad y no dependen de la nube.
- Análisis de multimodalidad: al aceptar imagen y texto, se puede usar para probar cómo la abliteración afecta a la descripción de imágenes y a la generación de texto guiada por contenido visual.
- Evaluación comparativa de cuantización: sirve para medir la degradación de calidad entre el checkpoint QAT original y esta versión modificada, con la divergencia KL como referencia.
- Generación de datos sintéticos para investigación: en entornos cerrados, puede producir corpus diversos para entrenar clasificadores o estudiar distribuciones de texto, siempre con verificación humana.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it-qat-q4_0-unquantized) |
|---|---|---|
| Rechazos | 0/100 | 100/100 |
| Divergencia KL | 0.0083 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF Q4_0 ocupa 19,3 GB, por lo que se necesitan al menos ~20 GB de VRAM para cargar los pesos, más overhead de contexto y caché KV.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para despliegue cómodo con contexto largo; RTX 4090 (24 GB) puede cargar el modelo en Q4_0, pero con margen limitado para contextos extensos.
- GPU de consumo: sí cabe en RTX 3090/4090 (24 GB) y en GPUs con 24 GB o más; en 16 GB no cabe sin cuantización adicional o descarga a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente vLLM si se convierte el GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-4-31B-it abliterated GGUF) | ~30,7B | 256K (base) | Apache 2.0 | GGUF Q4_0 | Sin rechazos, uso solo investigación |
| google/gemma-4-31B-it (original) | ~30,7B | 256K | Apache 2.0 | safetensors, GGUF, compressed-tensors | Alineado, rechaza peticiones dañinas |
| Gemma 4 26B A4B (MoE) | No disponible | 256K | Apache 2.0 | Varios | Variante MoE de la misma familia |
| Gemma 4 12B | No disponible | 256K | Apache 2.0 | Varios | Menor tamaño, con audio |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Reducción sustancial de la alineación de seguridad: el autor advierte que el modelo es más propenso a generar contenido dañino, inexacto, sesgado u ofensivo.
- Uso previsto exclusivamente para investigación, experimentación, estudios de alineación y red-teaming; se desaconseja su despliegue en servicios públicos o de cara al usuario.
- Riesgo de alucinación: no se documenta una mitigación específica; la abliteración puede aumentar la generación de contenido no verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia específica de Gemma 4 y las advertencias del autor deben revisarse; el uso comercial conlleva responsabilidad legal y ética.
- Idiomas: aunque el base soporta más de 140 idiomas, no se detalla el rendimiento de esta variante por idioma.
- Contexto: la ventana de 256K es del modelo base; no se confirma que se mantenga intacta tras la cuantización y la abliteración.
- Responsabilidad del usuario: todas las salidas deben tratarse como no confiables y verificarse de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thquangpc/gemma-4-31B-it-qat-q4_0-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint QAT original: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Heretic: https://heretic-project.org
- Perfil de p-e-w (autor de Heretic): https://github.com/p-e-w
