# zzlynxSG/MERaLiON-G4-E4B

## Resumen

MERaLiON-G4-E4B es un modelo multimodal de tipo any-to-any (imagen, audio y video hacia texto) desarrollado por zzlynxSG, un autor independiente en Hugging Face. Se obtiene mediante post-entrenamiento de `google/gemma-4-E4B-it`: primero con ajuste supervisado (SFT) y después con alineamiento cultural basado en GRPO (Group Relative Policy Optimization). El resultado son pesos completos publicados en el Hub, sin necesidad de cargar adaptadores.

El modelo está orientado al sudeste asiático y acepta texto con una imagen opcional, un clip de audio de hasta 30 segundos o un video de hasta 30 fotogramas a 1 FPS con su propia pista de audio, generando siempre texto. Cuenta con 7.941.100.874 parámetros totales según el archivo safetensors, aunque el autor describe el modelo como de 4,5B parámetros efectivos y 8B incluyendo embeddings.

Es relevante ahora porque extiende las capacidades nativas de Gemma 4 hacia modalidades de audio y video con un enfoque de alineamiento cultural regional, y porque su licencia es explícitamente research-only: es una release alpha, no lista para producción, lo que condiciona cualquier evaluación práctica. El repo ocupa 15,9 GB y la librería de referencia es transformers (versión 5.5 o superior, con soporte Gemma 4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B-IT); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 7.941.100.874 (safetensors); el autor indica 4,5B efectivos y 8B con embeddings |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, id, ms, th, ta (el tag de metadatos incluye ademas ar) |
| Licencia | research-only (otros; enlace a LICENSE en el repo); uso comercial no permitido |
| Formato de pesos | safetensors (pesos completos, sin adaptadores) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de la familia Gemma 4, y se post-entrena en dos fases: ajuste supervisado (SFT) seguido de alineamiento cultural mediante GRPO, un algoritmo de aprendizaje por refuerzo. El autor indica que sigue el método de dos papers citados (arXiv:2602.23730 entre los tags) y que se entrenó sobre una versión ampliada de los datos usados en esos trabajos. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles de la fase de RLHF/DPO.

La entrada admite texto con imagen opcional (hasta 512×512 píxeles por imagen durante el post-entrenamiento), audio de hasta 30 segundos (forma de onda mono a 16 kHz) o video muestreado a 1 FPS con un máximo de 30 fotogramas y su pista de audio extraída mediante ffmpeg. La salida es siempre texto. La decodificación recomendada por el autor es muestreo con temperatura 1.0, top_k 64, top_p 0.95, repetition penalty 1.1 y bloqueo de 3-gramas; la evaluación de benchmarks se realizó con decodificación greedy. El modelo usa `AutoModelForMultimodalLM` y `AutoProcessor` con `trust_remote_code=True`, y requiere transformers 5.5.4, torch 2.6.0, librosa, decord, pillow y accelerate.

## Capacidades

- Generación de texto a partir de entradas multimodales: imagen a texto, audio a texto y video a texto.
- Reconocimiento automático de habla (ASR) y transcripción de audio de hasta 30 segundos.
- Descripción y análisis de imágenes (hasta 512×512 píxeles en el protocolo de entrenamiento).
- Comprensión de video con muestreo a 1 FPS (hasta 30 fotogramas) y audio asociado.
- Alineamiento cultural orientado al sudeste asiático, fruto de la fase GRPO.
- Capacidades multilingües en inglés, chino, indonesio, malayo, tailandés y tamil.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Transcripción de audio en lenguas del sudeste asiático: el modelo acepta clips de hasta 30 segundos en forma de onda mono a 16 kHz y genera la transcripción, útil para prototipos de ASR en indonesio, malayo, tailandés o tamil.
- Descripción de imágenes para investigación en visión-lenguaje: con imágenes de hasta 512×512 píxeles, sirve para estudiar el comportamiento de modelos Gemma 4 post-entrenados en tareas de captioning y VQA.
- Análisis de vídeo corto con audio: al aceptar hasta 30 fotogramas a 1 FPS con su pista de audio, permite experimentar con resumen de clips breves en entornos de investigación.
- Evaluación de alineamiento cultural: el entrenamiento con GRPO sobre datos regionales lo hace adecuado para estudiar cómo el post-entrenamiento afecta a la fidelidad cultural en respuestas multimodales.
- Prototipado de asistentes multimodales de investigación: la plantilla de chat y el pipeline any-to-any permiten construir demos conversacionales que combinan texto, imagen y audio.
- Estudio comparativo de post-entrenamiento: al ser hermano de MERaLiON-S4.5-E2B (construido sobre Gemma 4 E2B con el mismo método), permite comparar el efecto del tamaño base y del pipeline SFT+GRPO.
- Generación de descripciones accesibles de imágenes en contextos de investigación: útil para experimentar con texto alternativo automático, siempre fuera de producción dado el carácter alpha del modelo.

## Benchmarks y rendimiento

El autor indica que los números de evaluación proceden de su propio pipeline sobre datos held-out, con los mismos prompts y decodificación greedy para cada modelo base y su release, y que no son los resultados reportados en los papers citados. Sin embargo, en la información proporcionada no se incluyen las tablas ni las cifras concretas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7,94B parámetros en safetensors, en precisión completa (BF16) se requieren aproximadamente 16 GB solo para los pesos, más memoria para el procesador multimodal y el contexto; en cuantización de 8 bits bajaría a unos 8 GB y en 4 bits a unos 4-5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) o superior (A100 40/80 GB, H100) es el rango razonable para BF16.
- ¿Cabe en GPU consumer? Sí, en tarjetas de 24 GB en BF16 con margen ajustado; en 16 GB solo con cuantización, que no está publicada oficialmente.
- Opciones de despliegue: transformers 5.5.4 con `AutoModelForMultimodalLM` y `trust_remote_code=True`, más el script `inference.py` del repo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| MERaLiON-G4-E4B | 7,94B (4,5B efectivos) | no disponible | imagen, audio, video → texto | research-only | Alpha, post-entrenado con SFT + GRPO |
| MERaLiON-S4.5-E2B | 2,3B efectivos (5,1B con embeddings) | no disponible | imagen, audio, video → texto | research-only | Hermano sobre Gemma 4 E2B, mismo método |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | multimodal (base) | licencia upstream propia | Modelo base; el autor indica Apache-2.0 para el upstream |
| Gemma 4 E2B (base de S4.5) | no disponible en la informacion | no disponible | multimodal (base) | licencia upstream propia | Base del modelo hermano |

## Limitaciones y advertencias

- Licencia research-only: el uso comercial está expresamente prohibido; la restricción aplica a los pesos post-entrenados, no al modelo base upstream.
- Release alpha: el autor declara que no es la versión final ni comercial y que no se realizó alineamiento de seguridad ni red-teaming adicional más allá del recibido por el modelo base.
- Riesgo de alucinación: puede inventar detalles culturales, visuales y de entidades nombradas, además de rechazar peticiones válidas o producir texto sesgado o dañino.
- Errores de transcripción de habla: el autor advierte explícitamente de posibles transcripciones incorrectas.
- No apto para despliegue real ni para decisiones que afecten a personas; no debe usarse en contextos médicos, legales, financieros o de seguridad crítica.
- Límites de entrada: audio de hasta 30 segundos, video de hasta 30 fotogramas a 1 FPS e imágenes de hasta 512×512 píxeles en el protocolo de entrenamiento.
- Cobertura lingüística limitada a en, zh, id, ms, th y ta (con ar en los metadatos); no se documenta rendimiento en otras lenguas.
- Longitud de contexto no documentada, lo que dificulta planificar cargas de trabajo con entradas largas.
- Sin variantes cuantizadas oficiales ni soporte documentado de motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo hermano: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Licencia: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B/blob/main/LICENSE
- Paper citado (tag arXiv): https://arxiv.org/abs/2602.23730
