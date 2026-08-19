# zhoudoe23/mc-tagger-qwen3_vl_2b-lora

## Resumen

El modelo `zhoudoe23/mc-tagger-qwen3_vl_2b-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo multimodal Qwen/Qwen3-VL-2B-Instruct, desarrollado por el usuario zhoudoe23. Su propósito es etiquetar automáticamente skins de Minecraft a partir de una imagen renderizada en vista frontal y trasera, generando una descripción estructurada en JSON con atributos visuales, identidad del personaje, captions y keywords.

El problema que resuelve es la catalogación y búsqueda de skins en comunidades de Minecraft, donde tradicionalmente el etiquetado manual es lento e inconsistente. Al automatizar este proceso, permite indexar grandes colecciones de skins, facilitar búsquedas por atributos (color, temática, accesorios) y generar metadatos para marketplaces o galerías. La relevancia actual radica en el crecimiento de plataformas de intercambio de skins y la necesidad de metadatos estructurados para sistemas de recomendación.

El adaptador tiene un tamaño de 0.2 GB y se entrena sobre el dataset `danielbacsur/minecraft-skins-20k-1024k-captioned`, que contiene 20 000 skins con captions detalladas. La arquitectura base es Qwen3-VL-2B-Instruct, un modelo multimodal de 2 000 millones de parámetros con capacidades de visión y lenguaje. El adaptador LoRA modifica únicamente las capas de atención y proyección, manteniendo el modelo base congelado, lo que reduce drásticamente los requisitos de cómputo y memoria durante el entrenamiento y la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-2B-Instruct (transformer multimodal) |
| Parametros totales | no disponible (adaptador: 0.2 GB; modelo base: ~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL-2B-Instruct soporta contexto largo, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | other (sin especificar términos exactos) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El entrenamiento se realizó con la técnica LoRA, que añade matrices de bajo rango a las capas de atención y proyección del modelo base, congelando el resto de parámetros. Esto permite ajustar el modelo a la tarea específica con un coste computacional reducido.

El dataset de entrenamiento contiene 20 000 skins de Minecraft con captions descriptivas. El proceso de entrenamiento utilizó los siguientes hiperparámetros: learning rate de 6e-05, batch size de 1 por dispositivo con 16 pasos de acumulación de gradiente (batch efectivo de 32), 2 épocas, optimizador AdamW con betas (0.9, 0.999), scheduler de learning rate coseno con warmup del 5%, y precisión mixta nativa (AMP). El entrenamiento se ejecutó en 2 GPUs durante 2 épocas, usando el framework llama-factory sobre PEFT 0.18.1 y Transformers 5.0.0.

El prompt de entrada es fijo: `<image>\nPlease analyze this Minecraft skin render (front and back views) and extract its visual attributes, character identity, and a detailed description.` La imagen de entrada se genera mediante un script que renderiza la skin en vistas frontal y trasera usando la librería MinePI, creando un collage de 512 píxeles de alto. La salida es un objeto JSON con campos como `identity`, `visual_tags`, `caption`, `short_caption` y `keywords`.

## Capacidades

- Etiquetado automático de skins de Minecraft: genera una descripción estructurada en JSON con identidad del personaje (nombre, franquicia, tipo de entidad), atributos visuales (arquetipos, cabello, ojos, vestimenta, accesorios, motivos, temas) y captions (descripción larga, corta y keywords).
- Comprensión multimodal: procesa imágenes renderizadas de skins en vista frontal y trasera, extrayendo información visual detallada.
- Generación de texto estructurado: produce salidas JSON consistentes, listas para integrarse en bases de datos o APIs.
- Descripción natural: genera captions en lenguaje natural que describen la apariencia del personaje, adecuadas para búsquedas por texto.
- Extracción de keywords: produce una lista de términos relevantes para indexación y búsqueda.
- Personalización de estilo: el adaptador está especializado en el dominio de Minecraft, por lo que reconoce elementos típicos como coronas, vestidos, armaduras, etc.

## Casos de uso

- Catalogación de bibliotecas de skins: un servidor de Minecraft o una comunidad puede usar el modelo para etiquetar automáticamente miles de skins, generando metadatos estructurados para su base de datos. Por ejemplo, un plugin de Bukkit podría invocar el modelo para indexar skins subidas por usuarios y permitir búsquedas por atributos como "princesa" o "cabello negro".

- Búsqueda avanzada en marketplaces de skins: plataformas como NameMC o tiendas de skins pueden integrar el modelo para ofrecer filtros por colores, temáticas o accesorios. El JSON de salida permite consultas SQL o de Elasticsearch sobre campos como `visual_tags.archetypes` o `visual_tags.motifs`.

- Generación de descripciones para tiendas online: al vender skins en una tienda, el modelo puede generar automáticamente el texto de la ficha del producto, incluyendo un título, una descripción corta y keywords SEO, ahorrando tiempo a los vendedores.

- Moderación y filtrado de contenido: el modelo puede identificar si una skin contiene elementos inapropiados (por ejemplo, temáticas violentas o símbolos ofensivos) mediante la clasificación de `visual_tags.themes_and_vibes`, ayudando a moderar comunidades.

- Sistemas de recomendación: las keywords y captions generadas pueden alimentar un sistema de recomendación basado en similitud de texto, sugiriendo skins similares a los usuarios según sus preferencias.

- Automatización de concursos y eventos: en eventos de creación de skins, el modelo puede etiquetar las entradas automáticamente para categorizarlas (por ejemplo, "royalty", "fantasía", "moderno") y facilitar la evaluación por parte de los jueces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía (`results: []`), por lo que no hay datos objetivos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. El autor tampoco proporciona métricas de precisión o exactitud para la tarea de etiquetado.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0.2 GB), pero requiere el modelo base Qwen3-VL-2B-Instruct para funcionar. En FP16, el modelo base ocupa aproximadamente 4 GB de VRAM, más el adaptador y el procesamiento de imágenes, por lo que se necesita al menos 6 GB de VRAM para inferencia cómoda.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 3090, A10, A100. En GPUs con 8 GB o menos, puede ser necesario usar cuantización (por ejemplo, int8 o int4) o reducir la resolución de imagen.
- Es posible ejecutar en CPU con llama.cpp o similar, pero la latencia será alta debido al componente visual.
- Opciones de despliegue: vLLM (soporta PEFT), Hugging Face TGI, llama.cpp (conversión a GGUF), o directamente con Transformers + PEFT. Para integraciones ligeras, se puede usar Ollama si se convierte el adaptador.
- Latencia estimada: en una RTX 4090, una inferencia con una imagen de 512x1024 píxeles debería tomar menos de 2 segundos. En GPUs más modestas, puede llegar a 5-10 segundos.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para etiquetado de skins de Minecraft. La alternativa más cercana es el modelo base Qwen3-VL-2B-Instruct sin el adaptador, que puede generar descripciones generales pero no está especializado en el formato JSON estructurado ni en el dominio de Minecraft. Otros modelos multimodales como LLaVA o CogVLM podrían adaptarse con un fine-tuning similar, pero no existen versiones públicas con este propósito. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con skins de Minecraft, por lo que su rendimiento fuera de este dominio será pobre. No debe usarse para etiquetar imágenes generales.
- La licencia es "other", sin términos claros. Se recomienda contactar al autor antes de un uso comercial o de redistribución.
- El dataset de entrenamiento puede contener sesgos visuales (por ejemplo, predominancia de ciertos estilos o colores), lo que afectaría a la precisión en skins poco comunes.
- El modelo puede alucinar atributos si la imagen de entrada no es clara o está mal renderizada. Se recomienda validar las salidas en producción.
- No se han publicado métricas de precisión ni evaluación humana, por lo que la calidad real del etiquetado es desconocida.
- El adaptador depende de la versión exacta del modelo base (Qwen3-VL-2B-Instruct). Si el modelo base se actualiza o cambia, el adaptador puede dejar de funcionar correctamente.
- El prompt de entrada es fijo y no se ha documentado si funciona con otros formatos de imagen (por ejemplo, solo vista frontal). La salida JSON puede variar en estructura si se altera el prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhoudoe23/mc-tagger-qwen3_vl_2b-lora
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/danielbacsur/minecraft-skins-20k-1024k-captioned
- Librería MinePI (para generación de imágenes): https://pypi.org/project/MinePI/
