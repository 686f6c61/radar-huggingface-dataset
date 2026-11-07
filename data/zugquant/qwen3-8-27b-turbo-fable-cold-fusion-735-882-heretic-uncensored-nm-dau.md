# zugquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B publicado por el usuario zugquant en Hugging Face. El modelo se distribuye con licencia Apache 2.0, en formato safetensors y para la librería transformers, con un total de 27.781.427.952 parámetros (unos 27,8 mil millones) y un repositorio de 55,6 GB. La pipeline declarada es image-text-to-text, lo que indica que el modelo base es multimodal (entrada de imagen y texto), aunque la model card no documenta con detalle el procesador ni la torre de visión.

El modelo pertenece a una familia de variantes del mismo autor (etiquetadas como "TURBO", "Fable", "Cold Fusion", "Heretic", "Uncensored", "NM-DAU") que se presentan como versiones descensuradas y con modos de razonamiento adicionales. La model card describe un proceso de ajuste en varias etapas ("Multi-stage tuning", "GAIN Training", "Cold Fusion") y remite a repositorios GGUF del mismo autor para el despliegue cuantizado. Según el autor, la variante habría alcanzado 735 puntos en ARC-C y 882 en ARC-E, cifras que no se acompañan de metodología reproducible en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un finetune de un modelo de ~27B con capacidades multimodales y supuestamente descensurado; por otro, advierte de que la información publicada es escasa, autopromocional y no verificable, por lo que cualquier evaluación en producción debe hacerse con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta repo; el autor publica GGUF (NEO-CODER MAX DiMatrix) en repositorios separados |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un derivado de Qwen/Qwen3.8-27B, con pipeline image-text-to-text, lo que sugiere un transformer multimodal con codificador de visión y un modelo de lenguaje subyacente. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (estándar, GQA, atención lineal) ni la longitud de contexto nativa.

En cuanto al entrenamiento, la model card menciona un proceso de ajuste en varias etapas ("Multi-stage tuning"), técnicas denominadas "Cold Fusion" y "GAIN Training", y una fase de "heretic'ing" (descensurado) tras las primeras etapas. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO o variantes. Tampoco se documentan innovaciones técnicas verificables como decodificación especulativa o atención lineal; las referencias a "token reduction" y "modos de razonamiento" provienen de la propia model card y carecen de especificación técnica.

## Capacidades

- Generación de texto conversacional en inglés, orientada a casos de uso generales ("all use cases" según el autor).
- Entrada multimodal imagen-texto según la pipeline declarada (image-text-to-text), aunque no se detallan las capacidades de visión en la model card.
- Modos de razonamiento e instructivo: la model card menciona variantes con 5 modos de razonamiento y 5 modos instructivo conmutables, aunque esta variante concreta no documenta su número exacto.
- Descensurado ("uncensored"/"heretic"): el ajuste elimina total o parcialmente las restricciones de contenido del modelo base, según el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita; la model card menciona ejemplos de "multi-stage proposal" pero sin especificación técnica.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Capacidades especiales (thinking mode, visión, audio): solo la multimodalidad implícita en la pipeline; el resto no disponible.

## Casos de uso

- Generación de texto general en inglés: el modelo puede emplearse como modelo conversacional de ~27B para tareas de redacción, resumen y respuesta a preguntas, aprovechando su tamaño para mantener coherencia en contextos medios.
- Procesamiento de documentos con imagen y texto: gracias a la pipeline image-text-to-text, podría emplearse para extraer información de capturas, formularios o figuras acompañadas de instrucciones textuales, siempre que se valide el procesador multimodal del modelo base.
- Investigación sobre descensurado y seguridad: útil como objeto de estudio para analizar cómo el ajuste fino altera los rechazos del modelo base y qué riesgos introduce en despliegues reales.
- Prototipado de asistentes conversacionales: su tamaño (~27,8B) permite desplegarlo en una GPU de 80 GB en BF16 o en GPUs de consumo con cuantización GGUF, lo que lo hace apto para entornos de desarrollo y pruebas.
- Generación de contenido creativo sin filtros: el ajuste "uncensored" está pensado para escritura creativa y narrativa donde el modelo base aplicaría rechazos; requiere revisión humana por el riesgo de contenido inapropiado.
- Evaluación comparativa de finetunes: sirve como referencia en estudios que comparan variantes ajustadas de Qwen3.8-27B en tareas de razonamiento, siempre que se reproduzcan los benchmarks con metodología propia.
- Despliegue en local con llama.cpp u Ollama: el autor publica GGUF en repositorios separados, lo que permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C | 735 (8 bits); >718 (4 bits) | Cifra del autor en el repositorio GGUF; sin metodología reproducible |
| ARC-E | 882 | Cifra del autor; sin metodología reproducible |

No se han publicado resultados de benchmarks verificables (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de la model card y de la descripción del repositorio GGUF del mismo autor, sin detalle de protocolo de evaluación, por lo que no deben tomarse como comparables a resultados publicados por terceros.

## Requisitos de hardware

- VRAM estimada en BF16: ~55,6 GB de pesos, por lo que requiere GPUs de 80 GB (A100 80GB, H100 80GB) para inferencia sin cuantizar.
- VRAM estimada en 8 bits: ~28 GB, apta para A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- VRAM estimada en 4 bits (GGUF): ~16-18 GB, apta para RTX 4090 24GB, RTX 3090 24GB y GPUs de 24 GB en general.
- GPUs recomendadas: A100 80GB o H100 para BF16; L40S o A100 40GB para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización 4 bits (GGUF) en RTX 4090, RTX 3090 y similares con 24 GB de VRAM.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp y Ollama mediante los GGUF del autor; vLLM y TGI no están confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27,8B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Finetune descensurado; benchmarks no verificables |
| Qwen/Qwen3.8-27B (base) | ~27B (según nombre) | no disponible | no disponible | Sí (según pipeline del finetune) | Modelo original sin ajuste; referencia de partida |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (DavidAU) | ~27,8B | no disponible | Apache 2.0 (según repo) | Sí | Variante del mismo autor con modos conmutables; benchmarks propios |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU (DavidAU) | ~27B | no disponible | Apache 2.0 (según repo) | no disponible | Generación anterior del mismo autor |

La comparación se limita a variantes del mismo linaje porque no se dispone de datos verificables de modelos de otros autores con especificaciones equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.8-27B y aplicar un ajuste descensurado, es probable que herede sesgos del modelo base y añada sesgos del dataset de ajuste, sin que el autor los describa.
- Riesgo de alucinación: no evaluado; las cifras de benchmarks del autor no incluyen pruebas de factualidad ni de calibración.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está disponible, lo que impide planificar despliegues con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el ajuste "uncensored" puede generar contenido que incumpla políticas de plataformas o legislación aplicable; la responsabilidad recae en el desplegador.
- Caveats para producción: la model card es autopromocional, con enlaces a múltiples repositorios del mismo autor y fechas de publicación futuras (septiembre de 2026) que no coinciden con la fecha de creación del repositorio (noviembre de 2026); los benchmarks no son reproducibles con la información publicada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Riesgo de contenido: el ajuste "heretic"/"uncensored" elimina rechazos de seguridad, lo que puede producir contenido dañino, ilegal o sexualmente explícito; no se recomienda su uso en aplicaciones orientadas al público sin moderación adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zugquant/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF del autor (release #1): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Fuente de la variante "TWIN TURBO" (release #2): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- GGUF de "TWIN TURBO": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Variante "Ultra Heretic": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Rama "from scratch" (Harley Pelican): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Variante Qwen3.6 27B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Qwen3.8 27B "Cold Fusion GAIN": https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Qwen3.6 40B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Variante Qwen3.5 9B del mismo autor: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
