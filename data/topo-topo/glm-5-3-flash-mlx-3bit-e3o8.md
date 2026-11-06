# ToPo-ToPo/GLM-5.3-Flash-mlx-3bit-e3o8

## Resumen

GLM-5.3-Flash-mlx-3bit-e3o8 es una cuantización en formato MLX del modelo zai-org/GLM-5.3-Flash-BF16, publicada por el usuario ToPo-ToPo. Se trata de una arquitectura MoE (mixture of experts) con aproximadamente 320 000 millones de parámetros totales y unos 18 000 millones activos por token, según la model card. La versión cuantizada conserva los pesos en safetensors con cuantización afín: los expertos enrutados a 3 bits con grupo de 64 y el resto de capas lineales a 8 bits con grupo de 64. El resultado ocupa 143,9 GB en disco y requiere unos 135 GB de memoria en el servidor de modelos.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamaño (pipeline image-text-to-text) en hardware Apple Silicon mediante MLX, sin depender de GPUs NVIDIA. El autor reporta que la calidad de la versión de 3 bits es indistinguible de una versión de 4 bits en sus pruebas internas, y que bajar a 2 bits degrada el modelo de forma apreciable. Es, por tanto, una opción práctica para quien quiera probar GLM-5.3-Flash en un Mac con memoria unificada abundante.

El modelo soporta entradas de imagen y texto, tool calling y un parámetro `reasoning_effort` (low/high/max) para controlar la profundidad del razonamiento. La licencia es MIT, lo que facilita el uso comercial, aunque no se dispone de información sobre los idiomas soportados ni sobre benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer; 42 capas con expertos enrutados y expertos compartidos; capas densas en las 3 primeras |
| Parametros totales | 313 890 438 974 (según safetensors); la model card indica ~320B |
| Parametros activos | ~18B por token (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: 3 bits, grupo 64; resto de capas lineales: 8 bits, grupo 64; router MoE y parte de imagen en bf16; mHC y arrays de decaimiento en fp32 |
| Idiomas soportados | no disponible (la evaluación del autor usa japonés e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repo de 143,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 42 capas con expertos enrutados (`switch_mlp.{gate,up,down}_proj`, 3 proyecciones por capa), expertos compartidos y capas MLP densas en las tres primeras capas. Incluye componentes adicionales como mHC y arrays de decaimiento, y una capa MTP (multi-token prediction) en la capa 45 que la conversión MLX excluye, igual que hace mlx-vlm. El router de la MoE y la parte de imagen no se cuantizan y permanecen en bf16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card del repositorio cuantizado describe únicamente el proceso de conversión: se aplicó el procedimiento de mlx-vlm 0.7.11 (sanitize, conversión de tipos y `quantize_model`) capa por capa, ya que el bf16 original (643 GB) no cabe junto a la salida. El autor validó el proceso comparando con `mlx_vlm.convert` sobre un modelo reducido a las cinco primeras capas, obteniendo coincidencia en todos los tensores, config y archivos auxiliares.

## Capacidades

- Generación de texto y razonamiento con control de profundidad mediante `reasoning_effort` (low, high, max; por defecto max).
- Entrada multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Tool calling / function calling, evaluado por el autor en 20 escenarios en japonés e inglés con 100 % de acierto.
- Conversación multi-turno (etiqueta conversational).
- Capacidades multilingües: no documentadas formalmente; la evaluación del autor cubre japonés e inglés.
- Modo de pensamiento con trazas de razonamiento; en `reasoning_effort: low` el modelo responde casi sin pensar, aunque puede emitir notas breves en el campo de pensamiento.

## Casos de uso

- Evaluación local de GLM-5.3-Flash en Apple Silicon: permite probar un MoE de ~320B en un Mac con memoria unificada suficiente (unos 135 GB de footprint), sin GPU NVIDIA, usando mlx-vlm.
- Asistente conversacional con tool calling: el modelo demuestra un 100 % de acierto en los escenarios de llamada a herramientas probados por el autor, lo que lo hace adecuado para prototipos de agentes que invocan APIs.
- Razonamiento controlado por coste: con `reasoning_effort: low` se obtienen respuestas rápidas sin cadena de pensamiento larga, útil para tareas de clasificación o extracción donde la latencia importa.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede emplearse en pipelines de extracción de información a partir de capturas o documentos escaneados, aunque el autor no ha probado entradas de imagen.
- Investigación sobre cuantización de MoE: el repositorio documenta el impacto de 2, 3 y 4 bits en calidad y velocidad, lo que lo convierte en material de referencia para estudiar el límite práctico de la cuantización en modelos con expertos.
- Desarrollo de agentes multi-paso en local: la combinación de tool calling y razonamiento configurable permite construir flujos de varios pasos sin enviar datos a la nube, siempre que el hardware lo permita.

## Benchmarks y rendimiento

Los únicos datos disponibles son las evaluaciones internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación tal cual, comparando las tres cuantizaciones:

| Metrica | e4o8 (4 bits, no publicada) | e3o8 (esta) | e2o8 (2 bits, no publicada) |
|---|---|---|---|
| Tamano de pesos | 181,9 GB | 143,9 GB | 96,3 GB |
| Memoria del servidor | ~170 GB | 135 GB | 91 GB |
| Acierto en probe (34 preguntas) | 100 % | 100 % | 90,4 % |
| Tool calling en japonés | 100 % | 100 % | 95 % |
| Tool calling en inglés | 100 % | 100 % | 99 % |
| Repetición de la misma frase (probe) | 0 % | 0 % | 2,9 % |
| Velocidad de generación | 29,6 tok/s | 30,3 tok/s | 31,8 tok/s |

Condiciones: `reasoning_effort: low`, temperatura 0,6, top_p 0,95, top_k 20, 5 repeticiones por caso, servidor mlx-vlm 0.7.11 sin MTP. La velocidad se midió en un M3 Ultra con temperatura 0 y 400 tokens en 3 preguntas. El autor concluye que 3 bits es el límite práctico y que reducir bits apenas acelera la generación porque en una MoE solo se leen algunos expertos por token.

## Requisitos de hardware

- Memoria: unos 135 GB de footprint en el servidor de modelos; 143,9 GB de pesos en disco.
- GPU: no aplica CUDA; el formato MLX está pensado para Apple Silicon. El autor midió en un M3 Ultra.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en Macs con menos de 128 GB de memoria unificada; se necesita un Mac Studio o Mac Pro con memoria unificada alta.
- Despliegue: mlx-vlm (versión 0.7.11 usada por el autor), con servidor compatible con la API de chat completions de OpenAI. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Rendimiento: ~30 tok/s en M3 Ultra según la medición del autor; no hay datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-mlx-3bit-e3o8 (esta) | ~320B totales, ~18B activos | no disponible | MIT | MLX, safetensors | Cuantización 3/8 bits, 143,9 GB |
| GLM-5.3-Flash-BF16 (base) | ~320B totales, ~18B activos | no disponible | MIT | BF16, 643 GB | Referencia de calidad; no cabe en hardware de consumo |
| Versión e4o8 (4 bits, no publicada) | ~320B totales | no disponible | MIT | No pública | 181,9 GB; misma calidad reportada que 3 bits |
| Versión e2o8 (2 bits, no publicada) | ~320B totales | no disponible | MIT | No pública | 96,3 GB; degradación apreciable (90,4 % en probe) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits de los expertos puede introducir degradación no medida en tareas distintas de las 34 preguntas del probe; el autor solo valida preguntas cortas en japonés e inglés.
- El autor no ha probado conversaciones largas ni entradas de imagen, pese a que el pipeline declarado es image-text-to-text.
- Riesgo de repetición de frases: aunque en 3 bits el autor reporta 0 %, en 2 bits aparece en el 2,9 % de los casos; no hay garantía de que no ocurra en dominios no evaluados.
- No hay datos publicados de sesgos, alucinación ni rendimiento en benchmarks estándar.
- Idiomas soportados no documentados; el uso en castellano no está validado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las versiones 4 y 2 bits no son públicas, por lo que no es posible reproducir la comparativa del autor.
- La licencia MIT del modelo base se hereda, pero conviene verificar el archivo LICENSE del repositorio antes de uso comercial.
- Requiere hardware Apple Silicon con memoria unificada muy alta; no es desplegable en infraestructura CUDA estándar sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ToPo-ToPo/GLM-5.3-Flash-mlx-3bit-e3o8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponible
