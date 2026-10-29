# taharmasmaliyev07/Gemma4-E4B-FACEBOOK-E2-BF16

## Resumen

`taharmasmaliyev07/Gemma4-E4B-FACEBOOK-E2-BF16` es un ajuste fino (fine-tune) publicado por el usuario Tahar Masmaliyev sobre el modelo multimodal Gemma 4 E4B de Google DeepMind. Se distribuye en formato safetensors con pesos en BF16, tiene 7.996.156.490 parámetros según los metadatos del repositorio (16,2 GB) y se etiqueta con el pipeline `image-text-to-text`, es decir, acepta imagen y texto como entrada y genera texto. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card.

El interés de esta ficha no está en el modelo base —del que existen versiones oficiales— sino en documentar un derivado comunitario de tercera parte: no hay información publicada sobre el dataset de ajuste, el número de tokens, la composición de los datos ni los hiperparámetros más allá de la mención a Unsloth. El nombre del repositorio sugiere un ajuste orientado a datos o tareas relacionadas con Facebook, y el sufijo `E2` apunta a una segunda época o variante experimental, pero nada de esto está confirmado en la documentación disponible.

Se trata, por tanto, de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 29 de octubre de 2026, sin benchmarks publicados ni evaluación independiente. Es relevante únicamente como ejemplo del ecosistema de fine-tuning ligero sobre modelos multimodales pequeños (familia "E4B", ~4,4B efectivos según gemma4.dev) y no como una alternativa validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Gemma 4 E4B; la model card no detalla la arquitectura interna |
| Parámetros totales | 7.996.156.490 (~8B) según safetensors |
| Parámetros activos | No disponible. La nomenclatura "E4B" apunta a ~4,4B de parámetros efectivos según gemma4.dev, pero no hay confirmación para este fine-tune |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican artefactos cuantizados; los pesos están en BF16 y requieren conversión propia (GGUF, AWQ, FP8) |
| Idiomas soportados | `en` (inglés), único idioma declarado en la model card |
| Licencia | apache-2.0 (declarada por el autor; ver advertencias sobre el modelo base) |
| Formato de pesos | safetensors (BF16) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 16,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-29 |
| Modelo base | taharmasmaliyev07/Gemma4-E4B-FACEBOOK-E2-BF16 (referencia autocitada en la model card) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Gemma 4 E4B de Google DeepMind, un modelo multimodal de la familia Gemma 4 que, según la información pública del modelo base recogida en gemma4.dev, se describe con 4,4B de parámetros, entrada multimodal y un modo de razonamiento ("Thinking Mode"), con un mínimo de 8 GB de VRAM para ejecución local. El repositorio aquí documentado contiene 7.996.156.490 parámetros en safetensors, lo que es coherente con la variante "E4B" de Gemma: un total de parámetros cercano a 8B con un subconjunto efectivo de aproximadamente 4,4B, patrón habitual en la nomenclatura "E" (effective) de Google. No se dispone de la configuración exacta de capas, atención ni del mecanismo de activación selectiva para este fine-tune concreto.

En cuanto al entrenamiento, la model card es mínima: indica que el modelo se entrenó "2x faster with Unsloth and Huggingface's TRL library", sin especificar dataset, número de tokens, epochs, tipo de ajuste (SFT, DPO, LoRA fusionado) ni composición de los datos. El nombre del repositorio (`FACEBOOK-E2`) sugiere un corpus o tarea vinculada a Facebook y una segunda época o iteración, pero es una inferencia no verificada. No hay información sobre RLHF, DPO ni evaluación posterior al ajuste.

## Capacidades

- Generación de texto conversacional a partir de entradas de texto e imagen (pipeline `image-text-to-text`), heredando la modalidad visual del Gemma 4 E4B.
- Comprensión de imágenes: descripción, respuesta a preguntas sobre el contenido visual y extracción de información de capturas o documentos, sujeto a validación empírica.
- Razonamiento en modo "thinking" heredado del modelo base según gemma4.dev; no verificado en este fine-tune concreto.
- Generación de código y texto técnico en inglés, capacidad propia de la familia Gemma, no evaluada en este repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking del modelo base es el único indicio.
- Capacidades multilingües: limitadas a inglés según la model card, aunque el modelo base Gemma 4 probablemente soporte más idiomas; no confirmado.
- Capacidades de audio o vídeo: no disponibles en la información proporcionada.
- Despliegue compatible con `transformers`, `text-generation-inference` y `endpoints_compatible` (etiquetas del repositorio).

## Casos de uso

- Prototipado de asistentes multimodales: punto de partida para experimentar con un modelo de ~8B parámetros que acepta imágenes y texto, útil en entornos de investigación con requisitos de VRAM moderados (a partir de ~8 GB según el modelo base).
- Extracción de datos de documentos e imágenes: lectura de facturas, formularios o capturas para devolver campos estructurados en inglés, aprovechando la modalidad visual del modelo base. Requiere evaluación propia antes de cualquier uso real.
- Asistencia a la accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla en prototipos, con revisión humana obligatoria por el riesgo de alucinación visual.
- Moderación y clasificación de contenido visual: uso como clasificador zero-shot o con few-shot prompting sobre imágenes y texto acompañante en pipelines internos de experimentación.
- Generación de código a partir de capturas de interfaz: conversión de mockups o pantallas en borradores de HTML/CSS o pseudocódigo, apoyándose en la entrada multimodal y en la capacidad de código de la familia Gemma.
- Investigación sobre fine-tuning eficiente: el repositorio sirve como referencia de un ajuste realizado con Unsloth + TRL sobre un modelo Gemma 4, útil para replicar recetas de entrenamiento de bajo coste.
- Base para comparativas de ajustes comunitarios: junto con otros repositorios del mismo autor (por ejemplo `Mirza-GEC-Gemma4-E4B-Editor-E3-BF16`), permite estudiar cómo distintos datasets afectan al comportamiento de un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y tampoco se han encontrado evaluaciones independientes del repositorio. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: ~16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: ~8-10 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~5-7 GB.
- GPU recomendadas para BF16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB, ajustada pero viable para una sola petición).
- GPU de consumo: RTX 4090/3090 (24 GB) en BF16; RTX 4080/4070 Ti (16 GB) y RTX 3060/4060 Ti (12-16 GB) solo con cuantización; el modelo base se promociona con un mínimo de 8 GB de VRAM según gemma4.dev.
- Opciones de despliegue: `transformers` (soporte nativo del repositorio), TGI (`text-generation-inference` está en las etiquetas), vLLM si la arquitectura Gemma 4 está soportada por la versión instalada, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se publica GGUF en el repositorio).
- Latencia y throughput: no disponibles; no hay mediciones publicadas ni datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado de validación |
|---|---|---|---|---|---|
| Este fine-tune (`Gemma4-E4B-FACEBOOK-E2-BF16`) | 7,996,156,490 totales | No disponible | Imagen + texto | apache-2.0 (declarada) | 0 descargas, sin benchmarks |
| Gemma 4 E4B (modelo base, Google DeepMind) | 4,4B según gemma4.dev (variante "effective") | No disponible | Imagen + texto, con Thinking Mode | Términos de Gemma 4 (no especificados en la información disponible) | Modelo oficial, mantenido por Google |
| `taharmasmaliyev07/Mirza-GEC-Gemma4-E4B-Editor-E3-BF16` (mismo autor) | 8B (según el listado del perfil del autor) | No disponible | Imagen + texto | No disponible | 22 descargas, sin benchmarks |

No se dispone en la información proporcionada de datos verificables (parámetros, contexto, benchmarks) de otras alternativas multimodales de tamaño similar, como las familias Qwen-VL o Llama Vision, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar la composición de datos, la presencia de datos personales, la calidad de las anotaciones ni el riesgo de contaminación de benchmarks.
- Sin benchmarks ni evaluación independiente: no hay evidencia pública de que el ajuste mejore al modelo base en ninguna tarea; podría degradar capacidades previas (olvido catastrófico).
- Riesgo de alucinación: al ser un modelo multimodal de ~8B sin evaluaciones publicadas, la generación de contenido falso sobre imágenes (objetos, texto o personas inexistentes) debe asumirse como probable y requiere verificación humana.
- Sesgos conocidos: no documentados por el autor; los sesgos del corpus original de Gemma 4 y del dataset de ajuste (desconocido) se heredan sin mitigación declarada.
- Limitación idiomática: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin una verificación empírica previa.
- Licencia: el autor declara apache-2.0, pero al ser un derivado de Gemma 4 conviene verificar los términos de uso del modelo base de Google antes de cualquier explotación comercial; la declaración de licencia de un fine-tune comunitario no sustituye a la del modelo original.
- Repositorio no validado: 0 descargas y 0 likes, creado y actualizado el mismo día, con una model card generada a partir de la plantilla de Unsloth y sin información técnica específica. No debe usarse en producción sin una evaluación propia y exhaustiva.
- Referencia circular en los metadatos: el campo `base_model` apunta al propio repositorio, lo que impide trazar con exactitud la versión concreta de Gemma 4 E4B utilizada.
- Formato: solo se distribuyen pesos BF16 en safetensors; no hay GGUF ni cuantizaciones listas, lo que añade trabajo de conversión para despliegues en CPU o GPU de gama baja.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taharmasmaliyev07/Gemma4-E4B-FACEBOOK-E2-BF16
- Perfil del autor en Hugging Face: https://huggingface.co/taharmasmaliyev07
- Listado de modelos del autor (Essa Mamdani): https://essamamdani.com/ai-models/company/taharmasmaliyev07
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
