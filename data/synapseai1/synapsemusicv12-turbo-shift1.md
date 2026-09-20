# SYNAPSEai1/SynapseMusicV12-Turbo-Shift1

## Resumen

SynapseMusicV12-Turbo-Shift1 es un checkpoint de generación de música a partir de texto publicado en Hugging Face por el usuario SYNAPSEai1. La model card adjunta corresponde a ACE-Step 1.5, un modelo fundacional de música open source desarrollado conjuntamente por ACE Studio y StepFun, por lo que este repositorio debe interpretarse como una redistribución o ajuste derivado de dicha familia de modelos más que como un desarrollo independiente. El repositorio acumula 0 descargas y 1 like, y fue creado y actualizado el 20 de septiembre de 2026.

El modelo resuelve la síntesis de audio musical condicionada por lenguaje natural: convierte una consulta de texto en una composición completa, incluyendo metadatos, letra y estructura, y la renderiza como audio. Su arquitectura es híbrida: un modelo de lenguaje actúa como planificador ("omni-capable planner") que genera el plano de la canción mediante Chain-of-Thought, y un Diffusion Transformer (DiT) se encarga de la síntesis acústica. El checkpoint concreto ocupa 2.393.872.518 parámetros en safetensors (~2,39B) y un repositorio de 4,8 GB.

Su relevancia actual radica en dos factores: la licencia MIT sobre la familia base, que permite uso comercial de la música generada, y su eficiencia declarada, con generación de una canción completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, además de ejecución local con menos de 4 GB de VRAM según el autor de ACE-Step 1.5. La variante "Turbo" usa 8 pasos de muestreo sin classifier-free guidance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: modelo de lenguaje planificador (LM, base Qwen3) + Diffusion Transformer (DiT) para síntesis de audio |
| Parametros totales | 2.393.872.518 (~2,39B) según safetensors del repositorio |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; tamaño del repo: 4,8 GB) |
| Idiomas soportados | 50+ idiomas según la model card de ACE-Step 1.5; la ficha de Hugging Face no especifica la lista |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code` y librería `transformers`) |

| Parametro adicional | Valor |
|---|---|
| Pipeline | text-to-audio (text2music) |
| Autor del repositorio | SYNAPSEai1 |
| Modelo base declarado | ACE-Step 1.5 (ACE Studio + StepFun) |
| Variante | Turbo (8 pasos de muestreo, sin CFG) |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

ACE-Step 1.5 emplea una arquitectura híbrida en dos etapas. La primera es un modelo de lenguaje que funciona como planificador: transforma una consulta breve en un plano de canción completo, escalando desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letra y captions mediante razonamiento en cadena (Chain-of-Thought) que después condicionan al generador. La segunda etapa es un Diffusion Transformer (DiT) que produce el audio final. La familia incluye modelos LM de 0,6B, 1,7B y 4B parámetros inicializados desde Qwen3, con distintos niveles de capacidad de composición y entendimiento de audio, y cuatro variantes de DiT (`base`, `sft`, `turbo` y `turbo-rl`).

El entrenamiento combina preentrenamiento, ajuste supervisado (SFT) y, en las variantes RL, un proceso de refuerzo intrínseco que, según el autor, se apoya únicamente en mecanismos internos del modelo en lugar de modelos de recompensa externos o preferencias humanas. Los datos declarados son un corpus legalmente conforme compuesto por música con licencia profesional, colecciones royalty-free y de dominio público, y datos sintéticos generados mediante conversión MIDI-a-audio de alta calidad. La variante Turbo del DiT usa 8 pasos de muestreo y prescinde de classifier-free guidance, lo que explica su latencia reducida. La ventana de contexto y el número exacto de tokens de entrenamiento no están disponibles en la información proporcionada.

## Capacidades

- Generación de música a partir de texto (text2music): síntesis de canciones completas, desde bucles cortos hasta composiciones de hasta 10 minutos según el autor.
- Generación de letra, metadatos y captions mediante Chain-of-Thought a través del LM planificador.
- Control estilístico preciso condicionado por prompt, con adherencia declarada en más de 50 idiomas.
- Edición de audio: generación de covers, repintado (repainting) de secciones y conversión de voz a música de fondo (vocal-to-BGM).
- Tareas adicionales de la familia, según la tabla del model zoo: extracción (extract), "lego" y completado (complete); estas capacidades varían por variante y no están confirmadas para este checkpoint concreto.
- Condicionamiento por audio de referencia (refer audio) en todas las variantes DiT.
- Soporte multilingüe en los prompts de texto (50+ idiomas declarados).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no es un LLM de propósito general orientado a agentes).
- Capacidades de visión o audio comprensivo: no disponible para este checkpoint; la familia LM declara entendimiento de audio de nivel medio a fuerte según el tamaño.

## Casos de uso

- Producción musical asistida: un compositor describe el estilo, tempo y estructura en texto y obtiene un boceto orquestado en segundos, gracias a los 8 pasos de muestreo de la variante Turbo y a la latencia declarada por debajo de 2 segundos en A100.
- Música de fondo para vídeo y podcast: generación de pistas libres de royalties con licencia MIT sobre la familia base, evitando el riesgo legal de bibliotecas con licencias ambiguas.
- Prototipado rápido de jingles y sintonías: la generación por debajo de 10 segundos en una RTX 3090 permite iterar decenas de variantes en una sesión de trabajo.
- Postproducción con repintado: corregir un compás defectuoso o sustituir una sección concreta sin regenerar la pista completa, usando la capacidad de repaint declarada para las variantes DiT.
- Creación de covers y remezclas: a partir de un audio de referencia, el modelo puede reinterpretar una pieza manteniendo parte de su estructura melódica (capacidad de "copy melody" del LM de mayor tamaño).
- Localización multilingüe de contenido musical: generación de letras y canciones en distintos idiomas sobre una misma base instrumental, aprovechando el soporte declarado de más de 50 idiomas.
- Conversión de voz a música de fondo: transformar pistas vocales a cama musical para vídeos corporativos o contenido para redes sociales.
- Herramientas creativas embebidas en producto: integración en editores de vídeo o DAWs que requieran inferencia local con menos de 4 GB de VRAM, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card de ACE-Step 1.5 incluye una sección de evaluación que consiste únicamente en una imagen sin valores extraíbles, y no se detallan métricas objetivas (FAD, CLAP score, MMLU u otras) ni comparaciones cuantitativas con modelos alternativos.

Los únicos datos de rendimiento declarados son de latencia: canción completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, para la variante Turbo con 8 pasos de muestreo.

## Requisitos de hardware

- VRAM para inferencia: el autor de ACE-Step 1.5 declara ejecución local con menos de 4 GB de VRAM, presumiblemente con cuantización; el repositorio en safetensors ocupa 4,8 GB, por lo que la inferencia en precisión completa requiere al menos esa cantidad más overhead.
- GPU recomendadas: A100 para máxima velocidad (menos de 2 segundos por canción declarados); RTX 3090 como referencia de gama alta de consumo (menos de 10 segundos por canción declarados).
- Compatibilidad con GPU de consumo: sí, según el autor, incluidas tarjetas con menos de 4 GB de VRAM en configuraciones cuantizadas; no se especifica la lista exacta de modelos compatibles.
- Opciones de despliegue: `transformers` (pipelines de Hugging Face con `custom_code`), el repositorio oficial de ACE-Step 1.5 y las herramientas de la familia en Hugging Face. vLLM, llama.cpp, Ollama y TGI no están indicados en la información disponible y no son aplicables de forma estándar a un modelo de difusión de audio.
- Latencia y throughput: menos de 2 s por canción en A100 y menos de 10 s por canción en RTX 3090 (valores declarados por el autor para la variante Turbo). No se especifica el throughput en lote ni la latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SynapseMusicV12-Turbo-Shift1 (ACE-Step 1.5 Turbo) | ~2,39B (este checkpoint) | no disponible | MIT | Hugging Face | Text2music con edición (cover, repaint, extract) |
| MusicGen (Meta) | 300M / 1,5B / 3,3B | no disponible | CC-BY-NC 4.0 (pesos) | Hugging Face | Solo text2music; licencia no comercial en pesos |
| Stable Audio Open | ~1,1B | no disponible | Stability AI Community License | Hugging Face | Orientado a samples y loops cortos |
| ACE-Step v1.5 base / sft | familia DiT + LM 0,6B/1,7B/4B | no disponible | MIT | Hugging Face | Variantes con CFG y 50 pasos, mayor diversidad pero menor velocidad |

Los datos de los modelos comparativos provienen de información pública general y no se han verificado en la búsqueda realizada en esta ficha; conviene contrastarlos antes de tomar decisiones de producción. No se dispone de comparaciones de rendimiento cuantitativas entre estos modelos y el checkpoint descrito.

## Limitaciones y advertencias

- El repositorio es una redistribución de un tercero (SYNAPSEai1) con la model card de ACE-Step 1.5: no se documenta qué ajuste o modificación concreta contiene "Turbo-Shift1" ni qué diferencias presenta respecto al checkpoint oficial.
- Con 0 descargas y 1 like, el repositorio carece de validación por parte de la comunidad; no hay evidencia pública de que los pesos funcionen correctamente.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la responsabilidad sobre los derechos del dataset de entrenamiento recae en el autor original de ACE-Step 1.5, no en el redistribuidor.
- Riesgo de alucinación en la letra y de incoherencia estructural en composiciones largas: la generación de letra y metadatos se hace mediante Chain-of-Thought sobre un LM, lo que puede producir texto sin sentido o mezcla de idiomas.
- Idiomas: se declaran más de 50, pero no se especifica la lista ni la calidad por idioma; el rendimiento en lenguas minoritarias no está documentado.
- Longitud de contexto y límite de duración efectiva: aunque se mencionan composiciones de hasta 10 minutos, no se detalla el límite real de coherencia musical en duraciones largas.
- No se publican métricas objetivas de calidad (FAD, CLAP), sesgos del dataset ni tasas de error, por lo que no es posible evaluar la calidad musical de forma cuantitativa con la información disponible.
- Las capacidades de tool calling, agentes y multi-step reasoning no están soportadas: es un modelo de generación de audio, no un LLM conversacional.
- No hay información sobre cuantizaciones publicadas (GGUF, AWQ, etc.), lo que puede limitar el despliegue en hardware muy restringido pese a la promesa de menos de 4 GB de VRAM.
- La fecha de creación (20 de septiembre de 2026) es posterior a la del informe técnico citado (arXiv 2602.00744), lo que conviene verificar antes de asumir correspondencia exacta entre pesos y paper.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-Turbo-Shift1
- Página del proyecto ACE-Step 1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Colección ACE-Step 1.5 en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Informe técnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub citado en la BibTeX: https://github.com/ace-step/ACE-Step-1.5
- Variante oficial Turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-base
- Variante SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
