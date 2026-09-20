# SYNAPSEai1/SynapseMusicV12-Base

## Resumen

SynapseMusicV12-Base es el identificador con el que el usuario SYNAPSEai1 ha publicado en HuggingFace un checkpoint de 2.393.872.518 parámetros (unos 2,39 mil millones) etiquetado como text-to-audio, acompañado de la model card de ACE-Step 1.5. ACE-Step 1.5 es el modelo fundacional de generación musical de código abierto desarrollado conjuntamente por ACE Studio y StepFun, por lo que este repositorio es una re-publicación de terceros del checkpoint base de la familia (acestep-v15-base) y no un modelo independiente.

El modelo resuelve la generación de música a partir de texto mediante una arquitectura híbrida: un modelo de lenguaje actúa como planificador y convierte una consulta breve en un "plano" completo de la canción (metadatos, letra y descripciones) mediante chain-of-thought, y un Diffusion Transformer (DiT) sintetiza el audio a partir de ese plano. La variante aquí publicada corresponde al checkpoint base, sin ajuste supervisado (SFT) ni aprendizaje por refuerzo (RL), lo que según la tabla del zoo de modelos implica calidad media, diversidad alta y facilidad de ajuste fino.

Su relevancia es doble. Por un lado, el autor declara que la música generada puede explotarse comercialmente (licencia MIT y entrenamiento sobre datos con licencia, libres de derechos y sintéticos). Por otro, promete cifras de velocidad poco habituales en generación musical: una canción completa en menos de 2 segundos en A100 y menos de 10 segundos en RTX 3090, con ejecución local por debajo de 4 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: planificador basado en modelo de lenguaje (5Hz LM) + Diffusion Transformer (DiT) |
| Parámetros totales | 2.393.872.518 (~2,39 mil millones, dato real de los safetensors) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (la model card menciona composiciones de hasta 10 minutos, sin detallar ventana de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 50+ idiomas según la model card; los metadatos de HuggingFace no enumeran idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 4,8 GB, compatible con pesos en bf16/fp16) |

## Arquitectura y entrenamiento

ACE-Step 1.5 se apoya en una arquitectura híbrida de dos componentes. El primero es un modelo de lenguaje a 5 Hz que funciona como planificador "omnicapaz": transforma la consulta del usuario en un plano de canción que escala desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letra y descripciones mediante chain-of-thought para guiar al segundo componente, un Diffusion Transformer (DiT) que genera el audio. Según la model card, la alineación entre ambos se logra mediante aprendizaje por refuerzo intrínseco que se apoya únicamente en mecanismos internos del modelo, evitando los sesgos de modelos de recompensa externos o de preferencias humanas. El checkpoint aquí publicado incluye CFG (classifier-free guidance) y opera a 50 pasos de muestreo, y admite audio de referencia.

En cuanto a los datos, el proyecto declara un conjunto de entrenamiento legalmente compliant compuesto por pistas musicales con licencia profesional, una colección amplia de música de dominio público y libre de derechos, y datos sintéticos de alta calidad generados mediante conversión MIDI-a-audio. No se especifica en la información disponible el número de tokens ni el volumen exacto del dataset. Esta ficha corresponde al checkpoint base, es decir, con pre-entrenamiento pero sin SFT ni RL, lo que lo sitúa como punto de partida para ajuste fino más que como modelo listo para producción. La familia incluye asimismo modelos LM auxiliares derivados de Qwen3 (0,6B, 1,7B y 4B) que no forman parte de este repositorio.

## Capacidades

- Generación de música a partir de texto (text2music), desde bucles cortos hasta composiciones de hasta 10 minutos.
- Generación de metadatos, letras y descripciones mediante chain-of-thought, usadas como plano de la composición.
- Cover generation: creación de versiones alternativas de una pista a partir de una referencia.
- Repaint: regeneración o repintado de secciones concretas de una pista.
- Extract: extracción de componentes o stems.
- Lego y complete: construcción por bloques y compleción de fragmentos musicales.
- Conversión vocal a música de fondo (vocal-to-BGM).
- Adherencia estricta al prompt en más de 50 idiomas, según la model card.
- Uso de audio de referencia para condicionar la generación.
- Control estilístico preciso sobre el resultado.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso: se trata de un modelo generativo de audio, no de un asistente conversacional.

## Casos de uso

- Música de fondo para vídeo y podcast: el modelo genera pistas completas a partir de una descripción textual, con lo que un editor puede producir bandas sonoras originales sin depender de bibliotecas de stock ni de licencias de terceros.
- Maquetas rápidas para compositores: con 50 pasos de muestreo y velocidades declaradas de menos de 2 segundos por canción en A100, permite iterar sobre decenas de variantes melódicas en una sola sesión de composición.
- Creación de covers: dado un audio de referencia, el modelo puede producir una versión nueva de la pieza, útil para sellos y artistas que quieran explorar arreglos alternativos de su propio catálogo.
- Repintado de secciones en post-producción: la función de repaint permite corregir un compás, una transición o un estribillo sin regenerar la pista completa, integrándose en un flujo de trabajo tipo DAW.
- Conversión vocal a música de fondo: útil para karaoke, remasterizaciones y para separar o sustituir la instrumentación manteniendo la línea vocal.
- Localización multilingüe de contenido musical: la adherencia a prompts en más de 50 idiomas facilita generar piezas con indicaciones de estilo, letra o metadatos en el idioma del usuario final.
- Generación de jingles y sintonías cortas: la capacidad de producir bucles y fragmentos breves con control estilístico encaja en publicidad, identidades sonoras y contenido para redes.
- Base para ajuste fino: al ser la variante sin SFT ni RL, ofrece la mayor diversidad del zoo de modelos y está marcada como "fácil" de ajustar, lo que la hace adecuada para equipos que quieran especializarla en un género o catálogo propio.

## Benchmarks y rendimiento

La model card incluye una figura de evaluación, pero no publica cifras numéricas de benchmarks en el texto disponible, por lo que no se pueden presentar resultados tipo MMLU, HumanEval o GSM8K (además de no ser métricas aplicables a un modelo de generación musical). La información cuantitativa disponible se limita a las valoraciones cualitativas del zoo de modelos del proyecto:

| Variante | Pre-entrenamiento | SFT | RL | Pasos de muestreo | CFG | Calidad | Diversidad | Facilidad de ajuste |
|---|---|---|---|---|---|---|---|---|
| acestep-v15-base (esta ficha) | Sí | No | No | 50 | Sí | Media | Alta | Fácil |
| acestep-v15-sft | Sí | Sí | No | 50 | Sí | Alta | Media | Fácil |
| acestep-v15-turbo | Sí | Sí | No | 8 | No | Muy alta | Media | Media |
| acestep-v15-turbo-rl | Sí | Sí | Sí | 8 | No | Muy alta | Media | Media |

Datos de rendimiento declarados por el autor: canción completa en menos de 2 segundos en una A100, menos de 10 segundos en una RTX 3090 y ejecución local con menos de 4 GB de VRAM.

## Requisitos de hardware

- VRAM estimada: la model card indica funcionamiento local con menos de 4 GB de VRAM; se trata de la cifra declarada por el autor y no se especifica a qué variante ni a qué configuración de pasos corresponde exactamente.
- Tamaño en disco: 4,8 GB de repositorio en safetensors, coherente con pesos en bf16/fp16 para 2,39 mil millones de parámetros (en fp32 serían unos 9,6 GB).
- GPU recomendadas: A100 (referencia de menos de 2 segundos por canción) y RTX 3090 (menos de 10 segundos por canción). No se detallan cifras para otras GPU.
- Cabe en GPU de consumo: sí, según el autor, con menos de 4 GB de VRAM.
- Opciones de despliegue: la librería declarada es transformers, con la etiqueta custom_code, lo que implica cargar el modelo con confianza remota activada. El proyecto ofrece además una demo en HuggingFace Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni diffusers en la información disponible.
- Latencia y throughput: menos de 2 s por canción en A100 y menos de 10 s en RTX 3090 según el autor; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynapseMusicV12-Base (acestep-v15-base) | 2,39 mil millones (este repo) | hasta 10 minutos según la model card; contexto no disponible | 50 con CFG | MIT | HuggingFace, re-publicación de terceros |
| acestep-v15-sft | no disponible | no disponible | 50 con CFG | MIT | HuggingFace (ACE-Step) |
| acestep-v15-turbo | no disponible | no disponible | 8 sin CFG | MIT | HuggingFace (ACE-Step) |
| acestep-v15-turbo-rl | no disponible | no disponible | 8 sin CFG | MIT | pendiente de publicación según la model card |

Los modelos LM auxiliares de la familia (acestep-5Hz-lm-0.6B, 1.7B y 4B) derivan de Qwen3 y se comparan entre sí por capacidad de comprensión de audio, composición y copia de melodía, pero no forman parte de este repositorio. La búsqueda web realizada no devolvió información útil sobre alternativas de otros fabricantes (los resultados obtenidos no guardan relación con generación musical), por lo que no se incluyen comparaciones externas.

## Limitaciones y advertencias

- Se trata de una re-publicación de terceros: el repositorio se llama SynapseMusicV12-Base y pertenece a SYNAPSEai1, pero su model card corresponde íntegramente a ACE-Step 1.5 y su checkpoint base. La trazabilidad respecto al modelo original no está garantizada por el re-publicador.
- El repositorio registra 0 descargas y 1 "like", por lo que no existe validación de la comunidad sobre los pesos concretos aquí alojados.
- Es la variante base, sin SFT ni RL: la propia tabla del proyecto le asigna calidad media, muy por debajo de las variantes sft y turbo. Requiere CFG y 50 pasos de muestreo, lo que implica más cómputo por generación.
- El uso requiere ejecutar código personalizado del repositorio (etiqueta custom_code) con confianza remota activada, lo que supone un riesgo de seguridad que debe evaluarse antes de desplegarlo en producción.
- Riesgo de desviación del prompt: aunque la model card declara adherencia estricta en más de 50 idiomas, no se publican métricas objetivas de fidelidad al prompt ni de calidad perceptual.
- Idiomas: no se enumeran los 50+ idiomas soportados ni el rendimiento por idioma; los metadatos de HuggingFace indican "no disponibles".
- No se documentan sesgos específicos, pero al ser un modelo entrenado parcialmente con datos sintéticos y con preferencias internas en lugar de recompensas humanas, la cobertura estilística y cultural puede estar desequilibrada.
- Licencia MIT: permite uso comercial, modificación y redistribución. No obstante, las garantías sobre la legalidad del dataset de entrenamiento las ofrece el proyecto ACE-Step, no el re-publicador, por lo que conviene conservar la atribución al proyecto original.
- Las fechas de creación y actualización del repositorio (2026-09-20) son posteriores a la publicación del informe técnico citado; no se dispone de historial de versiones ni de changelog.
- La model card incluye un aviso explícito de que su contenido son datos de referencia y no instrucciones a seguir; conviene mantener ese criterio al integrar el modelo en pipelines automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-Base
- Checkpoint base original de la familia: https://huggingface.co/ACE-Step/acestep-v15-base
- Colección ACE-Step 1.5 en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Informe técnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub: https://github.com/ace-step/ACE-Step-1.5
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas no relacionadas sobre archivos ORF.
