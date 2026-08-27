# The-CoLab/llama3-7b-en-translated-ru-v4

## Resumen

El modelo `The-CoLab/llama3-7b-en-translated-ru-v4` es un modelo de lenguaje de 6.29 mil millones de parámetros desarrollado por The-CoLab, basado en la arquitectura LLaMA-3 de Meta. Se trata de un modelo preentrenado desde cero sobre datos bilingües en inglés y ruso, donde el corpus ruso se ha generado mediante traducción automática del inglés. El entrenamiento se realizó durante 133.600 pasos (versión v4) utilizando un tokenizer compartido de 65.000 subpalabras diseñado específicamente para ambos idiomas.

Este modelo forma parte de la colección "multilingual-transfer" de The-CoLab, cuyo objetivo es explorar la transferencia de conocimiento entre idiomas mediante preentrenamiento bilingüe. Su relevancia radica en que ofrece una alternativa a los modelos monolingües para tareas en ruso, con la ventaja de compartir representaciones entre inglés y ruso. Al ser un modelo base (sin fine-tuning instructivo), está pensado para ser adaptado posteriormente a tareas específicas mediante fine-tuning.

El repositorio incluye curvas de entrenamiento y resultados de validación, así como evaluaciones en formato EEE para tareas como MMLU (en inglés y ruso), PIQA y ECLeKTic, aunque no se publican los valores numéricos de estas evaluaciones en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA-3) |
| Parametros totales | 6.291.689.472 (6,29 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16, inferido del tamano del repo) |
| Idiomas soportados | Ingles, ruso |
| Licencia | Llama 3 (Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA-3, un transformer decoder-only con normalización RMSNorm, atención con RoPE (rotary position embeddings) y activación SwiGLU. No se especifican el número de capas, cabezas de atención ni dimensiones ocultas, pero al ser una variante de 7B se espera una configuración similar a la de LLaMA-3-8B (32 capas, 32 cabezas, 4096 de dimensión oculta), aunque el conteo real de parámetros es de 6,29 B, ligeramente inferior al 8B original.

El entrenamiento se realizó sobre un corpus bilingüe compuesto por texto en inglés y texto en ruso traducido automáticamente del inglés. Se utilizó un tokenizer compartido de 65.000 tokens (`65k_en1.0_ru1.0`) diseñado para cubrir ambos idiomas de forma equilibrada. El proceso fue de preentrenamiento puro, sin etapas de RLHF ni DPO. Se ejecutaron 133.600 pasos en la versión v4, y se registraron curvas de pérdida de entrenamiento y validación en archivos CSV dentro del repositorio.

No se menciona ninguna innovación técnica adicional como decodificación especulativa o atención lineal. El modelo se entrenó con la infraestructura TorchTitan, según los tags del repositorio.

## Capacidades

- Generación de texto en inglés y ruso: al ser un modelo base, puede continuar texto o completar secuencias en ambos idiomas.
- Modelado de lenguaje bilingüe: comparte representaciones entre inglés y ruso, lo que puede facilitar la transferencia de conocimiento entre idiomas.
- Razonamiento y conocimiento general: al estar preentrenado sobre un corpus amplio, posee conocimiento enciclopédico y capacidad de razonamiento básico, aunque sin fine-tuning instructivo no responde a instrucciones de forma directa.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Fine-tuning para clasificación de texto en ruso: el modelo puede adaptarse a tareas como análisis de sentimiento, detección de spam o categorización de documentos en ruso, aprovechando su preentrenamiento bilingüe.
- Generación de texto creativo en ruso: puede usarse como base para generar artículos, cuentos o contenido marketing en ruso, tras un fine-tuning ligero con datos específicos del dominio.
- Traducción automática asistida: aunque no está entrenado específicamente para traducción, su naturaleza bilingüe permite explorar tareas de traducción mediante fine-tuning o prompting (si se convierte a modelo instructivo).
- Investigación en transferencia multilingüe: sirve como punto de partida para estudiar cómo el preentrenamiento con datos traducidos afecta al rendimiento en tareas downstream en ruso e inglés.
- Base para modelos de chat en ruso: aplicando fine-tuning con datasets instructivos en ruso, se puede obtener un asistente conversacional adaptado a ese idioma.
- Evaluación de técnicas de preentrenamiento: al estar documentado con curvas de entrenamiento y validación, es útil para reproducir experimentos de investigación sobre entrenamiento bilingüe.

## Benchmarks y rendimiento

La model card reporta resultados de validación en términos de pérdida de entropía cruzada y perplejidad, pero no se proporcionan resultados numéricos de las evaluaciones EEE (Global MMLU EN/RU, PIQA, ECLeKTic). Los datos de validación son:

| Conjunto de validación | Pérdida (nats) | Perplejidad |
|---|---|---|
| Inglés (en) | 2,3129 | 10,10 |
| Ruso (ru) | 1,9104 | 6,76 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (12,6 GB), se necesitan al menos 14-16 GB de VRAM para cargar el modelo y ejecutar inferencia con overhead. Con cuantización a 8 bits (~6,3 GB) o 4 bits (~3,2 GB) se reduce significativamente.
- GPU recomendadas: para BF16 completo, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Con cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4060 (8 GB) podría ser suficiente.
- Cabe en GPU de consumo: sí, con cuantización (4-bit u 8-bit) en GPUs con 8-12 GB de VRAM.
- Opciones de despliegue: al ser un modelo base con pesos en safetensors, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión) o TGI. No hay despliegue gestionado por Hugging Face Inference Providers.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización 4-bit, se espera una generación de 20-40 tokens/s, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| The-CoLab/llama3-7b-en-translated-ru-v4 | 6,29 B | No disponible | en, ru | Llama 3 | Hugging Face |
| meta-llama/Llama-3-8B | 8,03 B | 8K | Principalmente en | Llama 3 | Hugging Face |
| The-CoLab/llama3-7b-en-translated-ru-v2 | 6,29 B (aprox.) | No disponible | en, ru | Llama 3 | Hugging Face (resultados inválidos) |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para este modelo. La versión v2 se descarta por problemas de tokenizer que invalidan sus resultados.

## Limitaciones y advertencias

- Modelo base sin fine-tuning instructivo: no responde a instrucciones ni mantiene diálogos de forma natural; requiere adaptación para tareas conversacionales.
- Sesgos y alucinaciones: al ser un modelo preentrenado, puede reflejar sesgos presentes en los datos de entrenamiento y generar contenido factualmente incorrecto.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que se desconoce su capacidad para manejar secuencias largas.
- Riesgo de calidad en ruso: el corpus ruso proviene de traducción automática, lo que puede introducir artefactos o errores de traducción que afecten a la fluidez y precisión en ruso.
- Licencia Llama 3: el uso comercial está permitido, pero sujeto a los términos de la licencia de Meta, que incluyen restricciones sobre usos de alto riesgo y obligaciones de atribución.
- Sin soporte de la comunidad: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ampliamente; su uso en producción conlleva riesgos no evaluados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/The-CoLab/llama3-7b-en-translated-ru-v4)
- [Colección multilingual-transfer de The-CoLab](https://huggingface.co/collections/The-CoLab/multilingual-transfer-6a2d2b4019d4300f61a444a8)
- [Modelo v2 (resultados inválidos)](https://huggingface.co/The-CoLab/llama3-7b-en-translated-ru-v2)
