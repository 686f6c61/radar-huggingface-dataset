# xiaomi-research/MiLMMT-46-1B-v1.0

## Resumen

MiLMMT-46-1B-v1.0 es un modelo de traducción automática multilingüe basado en grandes modelos de lenguaje (LLM), desarrollado por Xiaomi Inc. Su entrenamiento parte de Gemma3-1B y se completa en cuatro etapas: preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, ajuste supervisado, aprendizaje por refuerzo y fusión de modelos. El resultado es un modelo denso de aproximadamente 1000 millones de parámetros capaz de traducir entre 46 lenguas, incluyendo lenguas de baja representación como el jemer, el lao o el cántones.

La relevancia de este modelo reside en su enfoque de post-entrenamiento sin referencia (reference-free), que permite mejorar la calidad de traducción sin depender de datos paralelos etiquetados manualmente, y en su tamaño compacto, que lo hace viable para despliegue en entornos con recursos limitados. El modelo se distribuye bajo licencia Gemma y está disponible en Hugging Face con pesos en formato safetensors, listo para usar con Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma3-1B) |
| Parametros totales | 999.885.952 (aprox. 1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Gemma3-1B, presumiblemente 32k, sin confirmar) |
| Tipos de cuantizacion | No disponible (repo con safetensors, formato habitual FP16/BF16) |
| Idiomas soportados | 46: arabe, azeri, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, espanol, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, cantones, chino simplificado, chino tradicional |
| Licencia | Gemma (gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Gemma3-1B, con atención de ventana deslizante y atención global alternada, aunque no se confirman detalles específicos en la documentación. El entrenamiento se realiza en cuatro fases:

1. Preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, dando lugar al checkpoint MiLMMT-46-1B-Pretrain.
2. Ajuste supervisado (SFT) sobre datos de traducción, produciendo MiLMMT-46-1B-v0.1.
3. Aprendizaje por refuerzo (RL) sin referencia, técnica que optimiza la calidad de traducción sin depender de traducciones de referencia humanas.
4. Fusión de modelos (model merging) para combinar los pesos de las etapas anteriores y obtener la versión final v1.0.

La innovación principal es el uso de RL sin referencia, descrito en el artículo arXiv 2608.10812, que permite mejorar la traducción sin necesidad de datos paralelos de alta calidad durante el post-entrenamiento.

## Capacidades

- Traducción automática multilingüe entre 46 idiomas, cubriendo familias lingüísticas diversas (indoeuropeas, semíticas, sino-tibetanas, austronesias, etc.).
- Generación de texto condicionada por prompt, con soporte para instrucciones de traducción en formato libre.
- Funciona como modelo de lenguaje causal estándar, por lo que puede integrarse en pipelines de generación de texto, aunque su especialización principal es la traducción.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso; el modelo está orientado exclusivamente a tareas de traducción.
- Soporte multilingüe amplio, incluyendo lenguas con pocos recursos digitales como el jemer, el lao o el birmano.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales, guías y especificaciones entre pares de idiomas como inglés-chino o alemán-español, con un prompt sencillo que especifica los idiomas de origen y destino.
- Localización de interfaces de software: al ser un modelo compacto de 1B, puede ejecutarse en servidores modestos para traducir cadenas de interfaz de usuario en tiempo real, manteniendo consistencia terminológica mediante el prompt.
- Traducción de contenido generado por usuarios en plataformas de comercio electrónico: permite traducir reseñas, descripciones de productos y mensajes de atención al cliente entre los 46 idiomas soportados, mejorando la experiencia en mercados internacionales.
- Servicio de traducción en tiempo real para aplicaciones de mensajería: con vLLM y una GPU de gama media, el modelo puede servir solicitudes de traducción con latencia de cientos de milisegundos, adecuado para chatbots multilingües.
- Traducción de subtítulos y transcripciones: su capacidad de manejar contextos de hasta 2048 tokens de salida (según el ejemplo de vLLM) permite traducir párrafos completos de subtítulos manteniendo coherencia.
- Investigación en traducción automática: el modelo sirve como punto de partida para experimentos de post-entrenamiento, fusión de modelos o evaluación de técnicas de RL sin referencia, gracias a su licencia abierta y su documentación detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de resultados experimentales (main.png) que no se ha podido analizar en texto. No se proporcionan cifras numéricas de MMLU, BLEU u otras métricas en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1B parámetros en FP16, el modelo ocupa aproximadamente 2 GB de memoria. Con cuantización a 8 bits (si se aplica), puede reducirse a ~1 GB; en 4 bits, a ~0,5 GB.
- GPU recomendadas: una GPU consumer como RTX 3060 (12 GB) o superior es suficiente para inferencia. Para servir con vLLM con alta concurrencia, se recomienda una GPU con al menos 8 GB de VRAM (RTX 4070, A10, L4).
- Cabe en GPUs consumer: sí, incluso en tarjetas con 4 GB de VRAM si se usa cuantización.
- Opciones de despliegue: vLLM (soportado oficialmente según la model card), Hugging Face Transformers, y potencialmente llama.cpp u Ollama si se convierten los pesos a GGUF (no incluido en el repo).
- Latencia y throughput estimados: no se proporcionan datos oficiales. Para un modelo de 1B en una GPU moderna, se puede esperar una latencia de 20-50 ms por token y un throughput de 100-300 tokens/segundo con batch, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiLMMT-46-1B-v1.0 | ~1B | 46 | No disponible | Gemma | Basado en Gemma3, RL sin referencia |
| NLLB-200-1.3B (Meta) | 1.3B | 200 | 512 tokens | CC-BY-NC | Arquitectura transformer encoder-decoder, sin RL |
| M2M-100-1.2B (Meta) | 1.2B | 100 | 1024 tokens | MIT | Encoder-decoder, entrenado con datos paralelos |
| Gemma3-1B (base) | 1B | Multilingüe (no especializado) | 32k | Gemma | Modelo general, no optimizado para traducción |

La comparativa muestra que MiLMMT-46-1B-v1.0 ofrece un equilibrio entre tamaño reducido y cobertura multilingüe, con la ventaja de estar basado en un LLM moderno y de incluir técnicas de RL sin referencia. NLLB-200 cubre más idiomas pero con una arquitectura más antigua y una licencia más restrictiva. M2M-100 es más abierto pero con menor cobertura y sin técnicas de post-entrenamiento avanzadas.

## Limitaciones y advertencias

- Solo garantiza traducción de calidad en los 46 idiomas listados; para otros idiomas, el rendimiento no está asegurado.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos web, puede heredar sesgos de género, culturales o políticos presentes en los corpus.
- Riesgo de alucinación en traducciones de textos ambiguos o con terminología especializada; se recomienda validación humana para contenido crítico.
- La longitud de contexto no está confirmada oficialmente; aunque Gemma3-1B soporta 32k, el fine-tuning podría haber reducido la ventana efectiva.
- La licencia Gemma impone restricciones de uso comercial (consultar términos de la licencia Gemma de Google); no es de código abierto en el sentido de OSI.
- No se incluyen pesos cuantizados en el repo; para despliegue en CPU o GPUs de baja memoria, es necesario convertir los pesos a GGUF u otro formato.
- El modelo está especializado en traducción; no debe usarse para tareas generales de razonamiento o generación creativa sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v1.0
- Repositorio GitHub: https://github.com/xiaomi-research/gemmax
- Artículo arXiv (2608.10812): https://arxiv.org/abs/2608.10812
- Página de despliegue en FriendliAI: https://friendli.ai/models/xiaomi-research/MiLMMT-46-1B-v1.0
- Artículo anterior sobre GemmaX2 (NAACL 2025): referenciado en el repositorio GitHub
