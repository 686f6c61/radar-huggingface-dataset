# zzlynxSG/MERaLiON-G4-E4B

## Resumen

MERaLiON-G4-E4B es un modelo multimodal del tipo any-to-any (imagen, audio y vídeo como entrada; texto como salida) publicado por la cuenta de Hugging Face zzlynxSG y orientado a lenguas del sudeste asiático. Se obtiene por post-entrenamiento de google/gemma-4-E4B-it mediante ajuste supervisado (SFT) seguido de un alineamiento cultural con GRPO, siguiendo el método de dos papers citados por los autores y sobre una versión ampliada de los datos usados en ellos. Los pesos liberados son pesos completos: no requieren cargar adaptadores.

El modelo acepta texto acompañado opcionalmente de una imagen (presupuesto de entrenamiento de hasta 512x512 píxeles), un clip de audio de 30 segundos o menos, o un vídeo muestreado a 1 FPS con un máximo de 30 fotogramas y su propia pista de audio. Cubre seis idiomas: inglés, chino, indonesio, malasio, tailandés y tamil. Su tamano es de 4,5B parámetros efectivos (8B contando embeddings), y tiene un hermano construido con la misma receta sobre SEA-LION v4.5 / Gemma 4 E2B: MERaLiON-S4.5-E2B, de 2,3B efectivos (5,1B con embeddings).

Su relevancia es fundamentalmente investigadora: es una release alpha, con licencia research-only, sin alineamiento de seguridad ni red-teaming adicionales a los del modelo base, y sin cifras de benchmarks disponibles en la información consultada. El interés técnico está en el pipeline SFT + GRPO para alineamiento cultural y en la cobertura conjunta de ASR, descripción visual y resumen de vídeo para lenguas del sudeste asiático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal derivada de google/gemma-4-E4B-it (entrada texto + imagen/audio/vídeo, salida solo texto); el tipo interno de atención, posible MoE y demás detalles no están documentados en la model card |
| Parametros totales | 4,5B efectivos; 8B incluyendo embeddings |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni cifras oficiales; al cargarse con transformers es cuantizable con herramientas estándar) |
| Idiomas soportados | en, zh, id, ms, th, ta (inglés, chino, indonesio, malasio, tailandés, tamil) |
| Licencia | research-only (license: other, license_name: research-only); uso comercial no permitido |
| Formato de pesos | Pesos completos en el Hub, sin adaptadores PEFT; carga mediante transformers >= 5.5 con AutoModelForMultimodalLM y AutoProcessor; formato de serialización no especificado en la model card |
| Pipeline declarado | any-to-any |
| Entradas multimodales | Imagen (hasta 512x512 px en post-entrenamiento), audio (<= 30 s, 16 kHz mono), vídeo (1 FPS, <= 30 fotogramas, con pista de audio propia) |
| Salida | Texto |
| Entorno probado | Python 3.11, torch 2.6.0, transformers 5.5.4, librosa, decord, pillow, accelerate, ffmpeg/ffprobe en PATH |
| Fecha de publicación | 2026-10-25 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base más allá de identificarlo como google/gemma-4-E4B-it. La nomenclatura E4B se define explícitamente como 4,5B parámetros efectivos frente a 8B incluyendo embeddings, lo que implica un desproporcionado peso del bloque de embeddings respecto al cómputo efectivo, pero no se especifica si hay compartición de capas, atención lineal, decodificación especulativa u otra optimización. El modelo conserva el procesador multimodal del base y añade el post-entrenamiento sobre un pipeline propio de preprocesado, replicado en el script inference.py del repositorio.

El entrenamiento consiste en un ajuste supervisado seguido de alineamiento cultural con GRPO (Group Relative Policy Optimization), siguiendo el método de los papers citados por los autores (el repositorio referencia arXiv:2602.23730) y sobre una versión ampliada de los datos empleados en esos trabajos. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de DPO o RLHF más allá del GRPO. La decodificación recomendada por los autores es muestreo con temperature 1.0, top_k 64, top_p 0.95, repetition_penalty 1.1 y no_repeat_ngram_size 3; la evaluación se realizó con decodificación greedy. Se advierte explícitamente de no añadir el token 107 ("\n" en el vocabulario de Gemma 4) a la lista de tokens de parada.

## Capacidades

- Descripción y comprensión de imágenes dentro de un presupuesto de 512x512 píxeles por imagen.
- Transcripción de voz (ASR) sobre clips de hasta 30 segundos, con entrada de waveform a 16 kHz mono.
- Resumen y descripción de vídeo muestreado a 1 FPS con hasta 30 fotogramas, incluyendo el audio asociado al vídeo.
- Generación de texto libre condicionada a cualquiera de las modalidades anteriores o a texto solo.
- Soporte multilingüe en seis idiomas: inglés, chino, indonesio, malasio, tailandés y tamil.
- Alineamiento cultural específico para el sudeste asiático obtenido por GRPO, orientado a mejorar el tratamiento de referencias culturales y entidades locales.
- Turnos solo de audio: es posible enviar un clip sin instrucción de texto (protocolo de transcripción directa).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, salida de audio o generación de imagen: no disponible; la salida es únicamente texto.

## Casos de uso

- Transcripción de audio corto para atención al cliente: clips de hasta 30 segundos en indonesio, malasio, tailandés, tamil o chino pueden transcribirse con un turno de audio sin instrucción, lo que encaja en la primera fase de un sistema de tickets o de un chatbot de voz.
- Subtitulado y enriquecimiento de clips de vídeo: con 1 FPS y 30 fotogramas se cubren vídeos de hasta ~30 segundos; el modelo puede resumir el contenido visual y su audio en una sola pasada, útil para catalogación de vídeo corto en redes sociales.
- Accesibilidad: generación de descripciones textuales de imágenes dentro del presupuesto de 512x512 px para lectores de pantalla o para poblar metadatos alternativos en CMS.
- Localización y control de calidad cultural: verificación de que un texto o creatividad dirigida a mercados del sudeste asiático no contiene referencias culturales erróneas, aprovechando el alineamiento por GRPO en id, ms, th y ta.
- Investigación en alineamiento cultural: el modelo sirve como referencia reproducible para estudiar el efecto de GRPO sobre el comportamiento cultural de un VLM, comparándolo con su base Gemma 4 E4B-IT y con el hermano MERaLiON-S4.5-E2B.
- Prototipado de asistentes de voz para cuidado de personas mayores: la familia MERaLiON se presenta públicamente en ese dominio (comprensión de lenguas y dialectos locales y detección de estados emocionales); este release permite experimentar con el componente de comprensión audio-texto, siempre en fase de prototipo por la licencia research-only.
- Evaluación comparativa de modelos any-to-any: al compartir receta con el modelo de 2,3B efectivos, permite estudiar el compromiso entre tamano y calidad en transcripción y descripción visual con el mismo pipeline de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card anuncia tablas de evaluación comparando cada modelo base con su correspondiente release, generadas con el pipeline propio de los autores sobre datos held-out y decodificación greedy, y aclara que no son los resultados reportados en los papers citados; sin embargo, los valores numéricos no estaban incluidos en el contenido disponible. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de benchmarks de ASR o vídeo para este modelo.

## Requisitos de hardware

- VRAM estimada para pesos: ~16 GB en bf16/fp16 (8B parámetros contando embeddings), ~8-9 GB en int8 y ~5 GB en int4. Estimaciones derivadas del recuento de parámetros; no hay cifras oficiales publicadas.
- VRAM recomendada: 24 GB o más (RTX 4090, L40S, A100 40/80 GB) para inferencia en bf16 con margen para activaciones, codificador visual/audio y fotogramas de vídeo.
- GPU de 16 GB (RTX 4080, RTX 3090, A4000): viable con cuantización int8, con margen ajustado al procesar 30 fotogramas.
- GPU consumer de 8-12 GB: solo con cuantización int4; no cabe en bf16. No hay cuantizaciones oficiales publicadas para este release.
- Opciones de despliegue: la única ruta documentada es transformers >= 5.5 con AutoModelForMultimodalLM, AutoProcessor y device_map="auto", más aceleración por accelerate. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible (no documentado). El procesado de audio y vídeo requiere librosa, decord y ffmpeg/ffprobe instalados.
- Latencia y throughput: no disponible. Como referencia cualitativa, el coste por petición crece con la modalidad: 30 fotogramas de vídeo suponen un número de tokens visuales muy superior a una única imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| MERaLiON-G4-E4B | 4,5B efectivos; 8B con embeddings | no disponible | Imagen, audio (<= 30 s), vídeo (1 FPS, <= 30 fotogramas), texto de entrada; salida texto | research-only | Post-entrenamiento SFT + GRPO sobre Gemma 4 E4B-IT |
| MERaLiON-S4.5-E2B (zzlynxSG) | 2,3B efectivos; 5,1B con embeddings | no disponible | Misma receta y mismas modalidades | research-only | Construido sobre SEA-LION v4.5 (a su vez sobre Gemma 4 E2B); hermano directo, permite comparar escalado |
| google/gemma-4-E4B-it | Familia E4B del modelo base | no disponible | Multimodal según su propia model card (no detallada en la información disponible) | Licencia propia del modelo base (la model card menciona Apache-2.0 para este release) | Modelo base sin el alineamiento cultural ni el pipeline de datos de MERaLiON |

Otros modelos any-to-any comparables de terceros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia research-only: el uso comercial de estos pesos post-entrenados no está permitido; la model card remite a LICENSE y NOTICE y aclara que la restricción se aplica al post-entrenamiento, no al modelo upstream.
- Release alpha explícitamente no apta para producción: no se realizó alineamiento de seguridad ni red-teaming adicionales a los del modelo base.
- Riesgo de alucinación documentado por el autor, incluyendo detalles culturales, visuales y entidades nombradas inventadas o incorrectas.
- Errores de transcripción de voz (ASR) reconocidos en la propia model card.
- Puede rechazar peticiones válidas y generar texto sesgado o dañino.
- Límites duros de entrada: audio de 30 segundos o menos, vídeo de 30 fotogramas a 1 FPS, imágenes con presupuesto de entrenamiento de 512x512 píxeles. No se documenta comportamiento fuera de esos rangos.
- Longitud de contexto, comportamiento en conversaciones multi-turno largas y estabilidad con entradas de texto extensas: no disponible.
- No se documentan capacidades de tool calling, uso como agente ni modo de razonamiento explícito; no deben asumirse.
- Uso desaconsejado en decisiones médicas, legales, financieras o de seguridad crítica, según el propio autor.
- El repositorio lo publica la cuenta zzlynxSG, no la organización MERaLiON de Hugging Face, y la model card no declara afiliación institucional con A*STAR I2R ni con el resto de la familia MERaLiON enlazada en la búsqueda web.
- Ausencia de cifras de benchmarks verificables en la información disponible: cualquier comparación de rendimiento con otros modelos carece de base numérica publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo hermano (2,3B efectivos): https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Licencia del release: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B/blob/main/LICENSE
- Paper referenciado en los tags: https://arxiv.org/abs/2602.23730
- Sitio de la familia MERaLiON: http://www.meralion.ai/
- Modelos e investigación de MERaLiON: https://www.meralion.ai/models-n-research
- Organización MERaLiON en Hugging Face: https://huggingface.co/MERaLiON
- Demo / API compatible con OpenAI: https://meralion.org/api-console
- Colección de modelos MERaLiON en MLX para Apple Silicon: https://huggingface.co/collections/majentik/meralion-singapore-speech-models-on-mlx
