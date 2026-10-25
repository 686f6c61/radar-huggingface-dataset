# zzlynxSG/MERaLiON-Omni-GRPO-10B

## Resumen

MERaLiON-Omni-GRPO-10B es un modelo multimodal (imagen, vídeo y audio) de aproximadamente 10.783 millones de parámetros publicado por el usuario zzlynxSG en HuggingFace. Se presenta como la variante "culturalmente alineada" de la familia MERaLiON-Omni: parte de la misma base que MERaLiON-Omni-MM-10B y se afina mediante LoRA (r=8, alpha=32) con un proceso de Group Relative Policy Optimization (GRPO) de doble recompensa, que combina un término de densidad cultural (λ=0,2) con otro de coherencia multimodal. El objetivo declarado es mejorar la percepción y el matiz cultural en contextos del sudeste asiático.

La arquitectura combina un codificador visual heredado de Qwen2.5-Omni-7B (licencia Apache 2.0) con un backbone de audio-lenguaje MERaLiON-2-10B (MERaLiON Public Licence). El modelo acepta instrucciones en texto junto con imágenes, vídeo (muestreo a 2 fps, entre 32 y 64 fotogramas) y audio, y se distribuye exclusivamente en safetensors con código personalizado (`trust_remote_code=True`).

Es relevante ahora porque ejemplifica una tendencia concreta: la aplicación de RL con recompensas culturales sobre modelos omni ya existentes, en lugar de reentrenar desde cero. Ahora bien, el propio autor lo etiqueta como alpha de investigación, sin alineamiento de seguridad ni red-teaming, y con licencia que prohíbe el uso comercial. Solo acumula 53 descargas y 2 likes en el momento de redactar esta ficha, y el autor remite a modelos posteriores (MERaLiON-G4-E4B y MERaLiON-S4.5-E2B) para capacidades visuales e instrucciones generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal omni (visión-lenguaje-audio); codificador visual de Qwen2.5-Omni-7B + backbone audio-lenguaje MERaLiON-2-10B; fine-tuning LoRA (r=8, alpha=32) sobre la base MERaLiON-Omni-MM-10B |
| Parametros totales | 10.782.995.200 (10,78 B) |
| Parametros activos | No disponible (no se indica que sea MoE; todo apunta a un modelo denso) |
| Longitud de contexto | No disponible (no especificada en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible; solo se documenta carga en bfloat16. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en), chino (zh), indonesio (id), malayo (ms), tailandés (th); la etiqueta `ar` aparece en los tags pero no en la lista de idiomas de la model card |
| Licencia | Research-only (research-only, `license: other`); uso comercial prohibido sin autorización explícita |
| Formato de pesos | safetensors (tamaño del repo: 21,7 GB) |
| Pipeline | image-text-to-text |
| Entradas aceptadas | Imagen, vídeo (fps=2, min_frames=32, max_frames=64) y audio |
| Límites de píxeles | MIN_PIX = 4×28×28 (3.136 px); MAX_PIX = 8192×28×28 (6.422.528 px); MAX_PIX_VIDEO = 8600×28×28 (6.742.400 px) |
| Dependencias de referencia | Python 3.10, torch 2.6.0, transformers 4.52.0, flash-attn 2.7.4, torchaudio 2.6.0, pillow 11.1.0, triton 3.2.0, CUDA 12.7 |
| Fecha de creación / actualización | 2026-07-01 / 2026-10-25 |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: reutiliza la arquitectura de MERaLiON-Omni-MM-10B, que ensambla un codificador visual procedente de Qwen2.5-Omni-7B con un backbone de audio y lenguaje MERaLiON-2-10B. Sobre esa base se aplica un ajuste LoRA de rango bajo (r=8, alpha=32), lo que implica que solo se actualiza un subconjunto reducido de parámetros y que las capacidades perceptuales generales heredadas del modelo base condicionan fuertemente el comportamiento final. La interfaz de inferencia se expone mediante `AutoModelForSpeechSeq2Seq` y `AutoProcessor` con `trust_remote_code=True`, más una utilidad `process_mm_info` incluida en el propio repositorio para preprocesar audio, imagen y vídeo.

El componente diferencial es el entrenamiento con GRPO de doble recompensa: la política se optimiza frente a un grupo de respuestas muestreadas, con una señal de recompensa compuesta por densidad cultural (peso λ=0,2) y coherencia multimodal. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF aparte de este GRPO. Tampoco se describe ninguna innovación en el mecanismo de atención ni en decodificación (no se mencionan atención lineal ni decodificación especulativa). El autor advierte explícitamente que no se ha realizado entrenamiento a gran escala de seguimiento de instrucciones ni alineamiento visual general, y que la comprensión de vídeo en lenguas del sudeste asiático es zero-shot.

## Capacidades

- Generación de texto conversacional multi-turno con historial de chat gestionado mediante plantilla de chat propia.
- Comprensión de imagen: descripción y razonamiento sobre contenido visual, con control explícito del rango de píxeles de entrada.
- Comprensión de vídeo: resumen y análisis de clips muestreados a 2 fps con 32-64 fotogramas y un presupuesto máximo de píxeles por vídeo.
- Procesamiento de audio: transcripción de voz y respuesta a instrucciones basadas en audio (procesador de tipo speech-to-sequence).
- Entrada combinada de vídeo y audio en una misma petición.
- Alineamiento cultural orientado al sudeste asiático (Indonesia, Malasia, Tailandia), reforzado vía GRPO con recompensa de densidad cultural.
- Capacidad multilingüe limitada a en, zh, id, ms y th; presencia de la etiqueta `ar` en los tags sin confirmación en la lista de idiomas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking" explícito, visión de documentos, audio en streaming o salida de audio: no disponible (no documentado).

## Casos de uso

Dado que la licencia es research-only y el autor declara el modelo como no apto para producción, los escenarios siguientes deben entenderse como evaluación e investigación, no como despliegue real.

- Investigación sobre alineamiento cultural: usar el modelo como sujeto de estudio para medir si una recompensa de densidad cultural (λ=0,2) mejora la descripción de elementos culturales en imágenes frente a la base MERaLiON-Omni-MM-10B, con anotaciones humanas como referencia.
- Transcripción y análisis de audio multilingüe en lenguas del sudeste asiático: el pipeline acepta audio directamente y permite generar transcripciones o resúmenes de grabaciones en indonesio, malayo o tailandés para corpus de evaluación acústica.
- Etiquetado asistido de material audiovisual para datasets regionales: procesar vídeo a 2 fps y generar descripciones que sirvan como preanotación de corpus culturales, con revisión humana posterior obligatoria.
- Estudio de mecánicas de RL multimodal: comparar curvas de convergencia y calidad de salida del GRPO de doble recompensa frente a variantes solo de coherencia multimodal, aislando el efecto del término cultural.
- Análisis de contenido visual etnográfico: descripción de textiles, arquitectura, comida o indumentaria tradicional en imágenes, evaluando la sensibilidad cultural del modelo en un contexto académico de antropología o estudios de área.
- Evaluación de robustez y sesgos: al no haber pasado red-teaming, el modelo es un caso de estudio útil para medir alucinación y estereotipia en tareas de descripción cultural, comparando salidas entre idiomas (en frente a id, ms y th).
- Pruebas de integración de modelos omni con `trust_remote_code`: validar en entornos controlados el coste y los riesgos de cargar código personalizado desde el repositorio, útil para equipos que diseñan políticas de aprobación de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, ASR ni métricas de calidad cultural, y tampoco ofrece comparaciones numéricas con MERaLiON-Omni-MM-10B o con Qwen2.5-Omni-7B.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 21,6 GB (coherente con un repo de 21,7 GB); con caché KV, activaciones y memorias intermedias del codificador visual y del procesador de audio conviene reservar entre 28 y 40 GB según la longitud de la secuencia y el tamaño del vídeo.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para bfloat16 sin cuantización. En A100 40 GB el modelo entra, pero el margen para vídeo con muchos fotogramas es ajustado.
- GPU de consumo: una RTX 4090 de 24 GB queda al límite en bfloat16 (los pesos solos ya son ~21,6 GB); el propio código admite `device_map="auto"`, por lo que es viable repartir entre GPU y CPU, a costa de latencia. No se publican pesos cuantizados, así que no hay una ruta oficial a 4 u 8 bits. Una RTX 3090/4090 con 24 GB no es suficiente para vídeo largo con audio simultáneo.
- Opciones de despliegue: Transformers (4.52.0) con `trust_remote_code=True`, `flash_attention_2` y `safetensors`, tal como documenta el autor. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ni existen ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de preprocesado por fotograma o minuto de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Licencia | Notas |
|---|---|---|---|---|---|
| MERaLiON-Omni-GRPO-10B | 10,78 B | No disponible | Imagen, vídeo, audio, texto | Research-only | GRPO de doble recompensa sobre LoRA r=8; alpha de investigación |
| MERaLiON-Omni-MM-10B | No disponible en la informacion proporcionada | No disponible | Imagen, vídeo, audio, texto | No disponible en la informacion proporcionada | Modelo base directo del anterior; misma interfaz de inferencia |
| Qwen2.5-Omni-7B | 7 B (aprox., según denominación) | No disponible en la informacion proporcionada | Imagen, audio, vídeo, texto | Apache 2.0 | Aporta el codificador visual del modelo; licencia permisiva para uso comercial |
| MERaLiON-G4-E4B | No disponible | No disponible | No disponible | No disponible | Modelo posterior recomendado por el autor para capacidad visual general |
| MERaLiON-S4.5-E2B | No disponible | No disponible | No disponible | No disponible | Modelo posterior recomendado por el autor; RL adaptativo tras inyectar capacidades del sudeste asiático |

## Limitaciones y advertencias

- Modelo en fase alpha: el autor indica explícitamente que no ha recibido entrenamiento a gran escala de seguimiento de instrucciones ni alineamiento visual general, por lo que el seguimiento de instrucciones y la comprensión visual general pueden ser peores que en modelos de propósito general.
- Comprensión de vídeo en lenguas del sudeste asiático en régimen zero-shot: no hay garantía de calidad fuera de las condiciones de entrenamiento.
- Sin alineamiento de seguridad ni red-teaming posterior: riesgo elevado de salidas alucinadas, sesgadas o directamente poco fiables.
- No apto para producción: la model card lo declara "not suitable for real-world deployment".
- Licencia research-only: el uso comercial está prohibido sin autorización explícita. Además, el modelo arrastra dos licencias upstream (Apache 2.0 para el codificador visual de Qwen2.5-Omni-7B y MERaLiON Public Licence para el backbone MERaLiON-2-10B), cuyos términos deben revisarse por separado; la licencia final no puede ser más permisiva que la más restrictiva de sus componentes.
- Requiere `trust_remote_code=True` y un módulo auxiliar (`mm_utils_mm`) incluido en el repositorio: implica ejecutar código del autor, con el riesgo de seguridad y de reproducibilidad que ello conlleva.
- Cobertura lingüística limitada a cinco idiomas; el árabe figura en los tags pero no en la lista oficial de idiomas, lo que genera ambigüedad sobre su soporte real.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con documentos o conversaciones largas sin una medición empírica previa.
- Sin cuantizaciones publicadas: no hay ruta oficial para desplegarlo en GPUs de consumo con VRAM limitada.
- Tracción muy baja (53 descargas, 2 likes): escasa validación comunitaria, pocos informes independientes de fallos y mínima superficie de soporte.
- Sesgos conocidos: no se documenta ninguna evaluación de sesgo; un objetivo explícito de "densidad cultural" puede amplificar estereotipos si la señal de recompensa no está diversificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zzlynxSG/MERaLiON-Omni-GRPO-10B
- Licencia del modelo: https://huggingface.co/zzlynxSG/MERaLiON-Omni-GRPO-10B/blob/main/LICENSE
- Vídeo de demostración: https://huggingface.co/zzlynxSG/MERaLiON-Omni-GRPO-10B/resolve/main/assets/demo.mp4
- Modelo base: https://huggingface.co/zzlynxSG/MERaLiON-Omni-MM-10B
- Modelo posterior recomendado (G4): https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Modelo posterior recomendado (S4.5): https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Codificador visual upstream: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Licencia del codificador visual: https://huggingface.co/Qwen/Qwen2.5-Omni-7B/blob/main/LICENSE
- Paper referenciado en los tags (arXiv:2602.23730): https://arxiv.org/abs/2602.23730 (identificador tomado de los metadatos; contenido no verificado)
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron listados de contenido para adultos sin relación alguna, que se han descartado por completo.
