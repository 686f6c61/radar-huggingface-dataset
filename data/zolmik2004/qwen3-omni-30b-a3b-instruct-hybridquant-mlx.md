# ZolMik2004/Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX

## Resumen

Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX es una cuantización híbrida de 4 y 8 bits del checkpoint Qwen/Qwen3-Omni-30B-A3B-Instruct, publicada por el usuario ZolMik2004 y empaquetada para el backend MLX de Apple. No se ha reentrenado ni modificado la arquitectura: se trata de un port directo de los pesos originales en bfloat16 a un esquema de cuantización afín con group size 64, pensado para ejecutarse en Apple Silicon sobre memoria unificada. El resultado ocupa 20,9 GB en cuatro shards de safetensors, frente a los 70,5 GB del checkpoint bf16 original, lo que supone una reducción de aproximadamente 3,4 veces y permite cargar el modelo completo en un MacBook de 32 GB de memoria unificada (verificado en un M2 Max).

El modelo subyacente es un sistema any-to-any de tipo MoE con diseño Thinker–Talker: acepta texto, imagen, audio y vídeo como entrada, y produce texto y voz natural como salida. El Thinker incluye un backbone de lenguaje MoE de 30B parámetros totales con 3B activos, junto con una torre de visión (ViT) y una torre de audio (AuT); el Talker es un decodificador MoE de voz que genera tokens de audio que un vocoder multi-codebook (Code2Wav) convierte en onda a 24 kHz. El repositorio cuantizado conserva ambas partes, de modo que las capacidades del modelo Instruct original se mantienen íntegras sobre el backend MLX.

Su relevancia es doble: por un lado, acerca un modelo omni de 30B a estaciones de trabajo y portátiles Apple sin GPU dedicada; por otro, sirve como caso de estudio de cuantización selectiva por módulo, ya que aplica 4 bits al backbone de lenguaje y al decodificador de voz, pero mantiene en 8 bits los componentes sensibles (router MoE, embeddings, torres de visión y audio, vocoder) y deja en bfloat16 la proyección `proj2` de tokens de audio. El repositorio es de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y la librería declarada es `mlx-vlm`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE Thinker–Talker para tareas any-to-any: backbone de lenguaje MoE (30B/3B) + torre de visión (ViT) + torre de audio (AuT) en el Thinker; decodificador MoE de voz + vocoder multi-codebook Code2Wav en el Talker |
| Parámetros totales | 35.259.818.545 (suma real de safetensors del repositorio cuantizado, incluye Thinker, Talker, vocoder y torres); el modelo base declara 30B totales |
| Parámetros activos | 3B (según el modelo base, diseño MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Híbrida 4/8 bits, cuantización afín con group size 64 (escalas y sesgos por grupo en bfloat16). 4 bits: LLM del Thinker y decodificador MoE de voz del Talker. 8 bits: router MoE (`mlp.gate`), `embed_tokens`, torre de visión, torre de audio, embeddings y proyecciones del Talker, vocoder. bfloat16 sin cuantizar: `proj2` de la torre de audio y tensores de normalización |
| Idiomas soportados | 119 idiomas de texto, 19 idiomas de entrada de voz y 10 idiomas de salida de voz (según la model card); la etiqueta del repositorio declara únicamente `en` |
| Licencia | apache-2.0 (metadatos de HuggingFace y campo `license_name`); las etiquetas del repositorio incluyen `license:other` |
| Formato de pesos | safetensors en esquema empaquetado de MLX: 4 bits con 8 valores por `uint32`, 8 bits con 4 valores por `uint32`, escalas y sesgos por grupo en bfloat16; 4 shards, 20,9 GB |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una cuantización post-entrenamiento del checkpoint Qwen/Qwen3-Omni-30B-A3B-Instruct. La arquitectura del modelo base es un sistema omni con separación de roles entre Thinker y Talker. El Thinker concentra la comprensión multimodal (texto, imagen, audio, vídeo) mediante un backbone de lenguaje con mezcla de expertos de 30B parámetros totales y 3B activos por token, complementado por un codificador de audio AuT y una torre de visión tipo ViT. El Talker toma la salida del Thinker y genera tokens de audio que el vocoder multi-codebook convierte en una onda de 24 kHz, lo que habilita interacción por voz con baja latencia y turnos de palabra naturales.

La innovación técnica de esta ficha concreta está en la política de cuantización, aplicada módulo a módulo en lugar de de forma uniforme. Se cuantizan a 4 bits el backbone de lenguaje y el decodificador de voz, mientras que se reservan 8 bits para los componentes con mayor sensibilidad a la degradación numérica: el router MoE (`mlp.gate`), los embeddings de tokens, las torres de visión y audio, las proyecciones y embeddings del Talker y el vocoder. La proyección `proj2` de la torre de audio se mantiene directamente en bfloat16. No hay datos en la información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; para esos detalles se remite a la model card y al informe técnico de Qwen3-Omni.

## Capacidades

- Entrada multimodal: texto, imagen, audio y vídeo, incluyendo combinaciones de varios medios en una misma petición (por ejemplo, imagen y audio simultáneos).
- Salida de texto y de voz natural: el Talker genera tokens de audio y el vocoder produce onda a 24 kHz; la síntesis se activa con `enable_audio_output: true` y se selecciona la voz con el parámetro `speaker`.
- Voces disponibles: Ethan (masculina, energética y cercana), Chelsie (femenina, cálida y clara) y Aiden (masculina, tono americano relajado).
- Comprensión de audio: transcripción y descripción de contenido hablado, con 19 idiomas de entrada de voz declarados.
- Salida de voz multilingüe: 10 idiomas de salida declarados.
- Procesamiento de texto multilingüe: 119 idiomas declarados en la model card del modelo base.
- Descripción y comprensión de vídeo: análisis de lo que ocurre en una secuencia y descripción en lenguaje natural.
- Interacción en tiempo real: el diseño Thinker–Talker está orientado a streaming de baja latencia y gestión natural de turnos.
- Modo texto rápido: con `return_audio=False` el Thinker funciona sin el Talker, con respuestas de texto más rápidas; `model.disable_talker()` libera Talker y vocoder tras la carga.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente de voz local en Mac: el modelo puede mantener una conversación hablada completa en el propio portátil, desde la entrada de audio hasta la salida de voz a 24 kHz, sin depender de servicios en la nube. Es adecuado porque un MacBook de 32 GB de memoria unificada ejecuta el modelo completo, verificado en un M2 Max.
- Análisis de reuniones y notas de voz: se le pasa un archivo de audio y devuelve transcripción o resumen en texto; los 19 idiomas de entrada de voz permiten cubrir equipos con varios idiomas sin cambiar de modelo. Con `return_audio=False` se obtiene solo texto con menor latencia.
- Accesibilidad para contenido visual: descripción automática de imágenes y vídeos para personas con discapacidad visual, usando la torre ViT y el backbone MoE. La entrada puede combinar imagen y audio para describir escenas con sonido.
- Generación de descripciones y metadatos de vídeo: catalogación de archivos audiovisuales con descripciones en lenguaje natural y etiquetado de contenido, gracias a la entrada de vídeo nativa y a la salida de texto.
- Interfaces conversacionales con voz sintetizada: atención al cliente o asistentes de producto que responden con voz en 10 idiomas y tres timbres distintos, seleccionables según el caso de uso o la marca.
- Prototipado multimodal en investigación: al ser un puerto cuantizado directo y sin reentrenamiento, permite estudiar el impacto de una matriz de bits híbrida (4/8 bits, group size 64) sobre las capacidades del modelo original, comparando contra el checkpoint bf16.
- Demostraciones any-to-any en portátiles: aplicaciones de demo que reciben imagen más audio y responden con texto y voz, útil para validar productos multimodales antes de invertir en infraestructura con GPU.
- Procesamiento por lotes de documentos mixtos en local: extracción de información a partir de imágenes, audio y texto en un mismo flujo, sin enviar datos sensibles a terceros, al ejecutarse íntegramente en el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de audio o vídeo, y se limita a remitir al informe técnico de Qwen3-Omni, cuyos números no se facilitan en la información proporcionada. Tampoco se ofrecen mediciones de latencia o tokens por segundo para esta versión cuantizada.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). El formato de pesos empaquetado de MLX no es cargable en CUDA ni en CPU x86 con las herramientas indicadas.
- Memoria unificada: 32 GB suficientes para el modelo completo, verificado en un M2 Max según el autor. El repositorio pesa 20,9 GB, por lo que hay que sumar el espacio de caché KV y activaciones; se recomienda no bajar de 32 GB.
- Estimación orientativa de VRAM/memoria: aproximadamente 21 GB solo para pesos; por debajo de 24 GB de memoria unificada el margen es muy justo o insuficiente (estimación basada en el tamaño del repositorio, no medida publicada).
- GPU recomendadas: no aplica el catálogo A100/H100/RTX 4090, ya que MLX no soporta CUDA. El hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y superiores), con M2 Max verificado.
- ¿Cabe en GPU de consumo? No en GPU discreta, por incompatibilidad de backend. Sí en Apple Silicon con al menos 32 GB de memoria unificada; los equipos de 16 GB no son una opción realista con este checkpoint.
- Opciones de despliegue: `mlx-vlm` (librería declarada), con descarga de pesos mediante la CLI `hf`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato empaquetado de MLX es específico de este ecosistema.
- Latencia y throughput: no disponible. La model card menciona streaming de baja latencia y gestión natural de turnos como propiedades del diseño Thinker–Talker, pero sin cifras medidas.
- Ahorro de recursos: llamar a `model.disable_talker()` tras la carga elimina Talker y vocoder, lo que reduce el consumo si solo se necesita texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso en disco | Licencia | Backend / hardware |
|---|---|---|---|---|---|
| ZolMik2004/Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX | 35.259.818.545 en safetensors del repo (30B totales / 3B activos declarados en el base) | no disponible | 20,9 GB (4 shards) | apache-2.0 (`license_name`), etiqueta `license:other` | MLX, Apple Silicon |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (bf16, modelo base) | 30B totales / 3B activos | no disponible | 70,5 GB | apache-2.0 | Formatos y backends del repositorio original |
| Otras cuantizaciones comunitarias del mismo base (GGUF, AWQ, GPTQ, MLX alternativas) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante y con datos disponibles es contra el checkpoint original en bfloat16: misma arquitectura y capacidades, con un tamaño 3,4 veces menor y requisitos de memoria que bajan de 70,5 GB de pesos a 20,9 GB. No se dispone de información sobre otras alternativas cuantizadas del mismo modelo base para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Es una cuantización post-entrenamiento: no hay reentrenamiento ni ajuste posterior a la compresión, por lo que puede haber degradación de calidad frente al checkpoint bfloat16, especialmente en el backbone de lenguaje y en el decodificador de voz, que se reducen a 4 bits.
- El LLM del Thinker y el decodificador de voz del Talker son los módulos más agresivamente comprimidos; las tareas que dependan de matices finos de razonamiento o de prosodia pueden verse más afectadas que la comprensión de imagen o audio, que se mantiene en 8 bits.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en esta versión; no se han publicado evaluaciones de fidelidad para el checkpoint cuantizado.
- Idiomas: aunque la model card del base declara 119 idiomas de texto, 19 de entrada de voz y 10 de salida de voz, la etiqueta de idioma del repositorio es únicamente `en`, y no hay evaluación publicada del comportamiento en otros idiomas tras la cuantización.
- Longitud de contexto no documentada en el repositorio, lo que impide planificar despliegues con ventanas largas sin consultar el modelo base.
- Licencia: coexisten apache-2.0 (`license_name` y metadatos de HuggingFace) y la etiqueta `license:other` en el repositorio. Antes de un uso comercial conviene verificar la licencia aplicable al modelo base y a la obra derivada.
- Restricción de plataforma: depende de MLX y de Apple Silicon. No hay rutas de despliegue documentadas para CUDA, servidores x86, vLLM, TGI, llama.cpp u Ollama, lo que limita su uso en infraestructura de producción convencional.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, publicado en septiembre de 2026. No hay señales de mantenimiento, validación por terceros ni evidencia de uso en producción.
- Rendimiento: no se publican mediciones de latencia ni throughput, algo crítico si el objetivo es interacción de voz en tiempo real.
- Memoria: con 20,9 GB de pesos, los equipos Apple de 16 GB de memoria unificada quedan fuera de alcance.

## Enlaces

- Repositorio cuantizado en HuggingFace: https://huggingface.co/ZolMik2004/Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Informe técnico de Qwen3-Omni (PDF): https://github.com/QwenLM/Qwen3-Omni/blob/main/assets/Qwen3_Omni.pdf
- Repositorio Qwen3-Omni en GitHub: https://github.com/QwenLM/Qwen3-Omni
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Librería mlx-vlm: https://github.com/ml-explore/mlx-vlm
- Guía de la CLI `hf`: https://huggingface.co/docs/huggingface_hub/en/guides/cli
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles no guardan relación con esta ficha.
