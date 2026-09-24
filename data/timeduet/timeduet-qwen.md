# TimeDuet/TimeDuet-Qwen

## Resumen

TimeDuet-Qwen es un adaptador LoRA de tipo PEFT publicado por el grupo TimeDuet para el modelo multimodal Qwen/Qwen2.5-Omni-7B. No es un modelo independiente: se trata del adaptador final (SFT + GRPO) que acompaña al artículo *TimeDuet: A Benchmark for Audio-Visual Temporal Grounding on Misaligned Streams*. Su tarea es el anclaje temporal audiovisual: dado un vídeo con su pista de audio completa, el modelo devuelve los intervalos de tiempo en los que ocurre un evento, distinguiendo si es audible, visible o ambos.

El adaptador tiene rango 8 y alpha 32, con objetivos de proyección sobre el modelo de lenguaje del base, y ocupa aproximadamente 0,1 GB en safetensors. Se inicializó desde el adaptador SFT y después se optimizó con GRPO sobre 12.536 consultas de entrenamiento con desplazamiento temporal construido, excluyendo las consultas alineadas de la fase de RL. La relevancia actual del trabajo está en el escenario de "streams desalineados": audio y vídeo cuyo alineamiento natural no coincide, un caso poco cubierto por los benchmarks de grounding audiovisual habituales.

El modelo base aporta la arquitectura multimodal (comprensión de audio y vídeo) y el adaptador añade la capacidad específica de emitir intervalos en formato estructurado. La evaluación registrada en el artículo se realizó sobre 2.202 consultas de test del benchmark TimeDuet, con métricas de mIoU y recall a distintos umbrales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer multimodal Qwen2.5-Omni-7B; rango 8, alpha 32, objetivos de proyección del modelo de lenguaje |
| Parámetros totales | 7B en el modelo base; el adaptador ocupa ~0,1 GB en el repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el ejemplo de carga oficial usa bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible para el adaptador; el uso del modelo base está sujeto a la licencia de Qwen2.5-Omni-7B |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Omni-7B, un modelo multimodal que procesa audio y vídeo además de texto. El repositorio no publica pesos fusionados: el adaptador debe cargarse sobre el modelo base con `PeftModel.from_pretrained`, y el autor advierte explícitamente de que no debe aplicarse sobre un modelo ya fusionado con el SFT ni apilarse con un adaptador SFT independiente, ya que la configuración de evaluación registrada corresponde a la carga directa sobre el base. La inferencia de grounding requiere proporcionar el vídeo completo junto con su pista de audio, con muestreo de vídeo a 1 FPS, audio completo, generación determinista, `max_new_tokens=1024`, `use_audio_in_video=True` y `return_audio=False`.

El entrenamiento consta de dos fases: un ajuste supervisado (SFT) sobre el dataset TimeDuet y, a continuación, GRPO sobre 12.536 consultas de entrenamiento con desplazamiento temporal construido. La función de recompensa combina precisión temporal y coherencia entre modalidades: `0.5 * T-IoU + 0.5 * min(A-IoU, V-IoU) - 0.3 * abs(A-IoU - V-IoU)`, donde T-IoU es el IoU temporal global, A-IoU el de audio y V-IoU el de vídeo. Las consultas alineadas quedaron excluidas de la etapa de RL. La procedencia detallada del entrenamiento se documenta en `release_provenance.json`; el estado del optimizador y los checkpoints intermedios no forman parte de esta release de inferencia.

La salida del modelo es un único conjunto de intervalos en formato estructurado: `<answer>{"intervals":[[start,end], ...]}</answer>`. La precisión específica por modalidad se evalúa a partir de esa misma predicción contra referencias de verdad separadas, y el contrato de salida se describe en `schema_contract.json`.

## Capacidades

- Anclaje temporal audiovisual: localiza intervalos de tiempo en los que ocurre un evento descrito en lenguaje natural.
- Distinción por modalidad: la predicción es única, pero se evalúa por separado la precisión sobre eventos audibles (Audio-only), visibles (Visual-only) y con solapamiento audiovisual (AV overlap).
- Procesamiento conjunto de vídeo y audio: requiere ambos flujos simultáneamente (`use_audio_in_video=True`), no solo uno de ellos.
- Manejo de streams desalineados: el entrenamiento con GRPO se centra en consultas con desplazamiento temporal construido, el escenario objetivo del benchmark.
- Salida estructurada y parseable: intervalos en JSON dentro de etiquetas `<answer>`, lo que facilita su integración en pipelines automáticos.
- Comprensión de instrucciones en inglés: único idioma declarado.
- Capacidades heredadas del modelo base (Qwen2.5-Omni-7B) en comprensión multimodal texto-audio-vídeo, no caracterizadas específicamente en esta ficha.

## Casos de uso

- Indexación y búsqueda en archivos audiovisuales: dado un fondo de vídeos con audio, el modelo devuelve los intervalos donde ocurre un evento descrito por el usuario, lo que permite construir índices temporales consultables en lugar de depender solo de metadatos.
- Generación automática de clips: a partir de una consulta textual, extraer los rangos de tiempo para recortar fragmentos de interés en un editor o en un pipeline de postproducción.
- Verificación de contenido y moderación: localizar por intervalo en qué momento de un vídeo aparece un evento audible, visible o ambos, útil para revisión humana posterior y trazabilidad.
- Análisis de retransmisiones deportivas o informativas: localizar jugadas, goles o declaraciones concretas combinando señales de audio (comentario, pitidos) y vídeo.
- Accesibilidad: detectar cuándo se producen eventos sonoros relevantes en un vídeo para generar avisos o descripciones temporizadas destinadas a personas con discapacidad auditiva.
- Monitorización de fuentes de vídeo continuas: aplicación sobre grabaciones de vigilancia o sensores para marcar intervalos en los que se cumple una condición descrita, con revisión humana del resultado dado que el modelo no está validado para decisiones críticas de seguridad.
- Investigación en grounding temporal: servir como referencia reproducible sobre el benchmark TimeDuet, con protocolo de evaluación, prompt canónico y formato de salida publicados en el repositorio.

## Benchmarks y rendimiento

Resultados registrados en el artículo sobre el conjunto de test de TimeDuet (2.202 consultas). El autor indica que son las puntuaciones del experimento del artículo, no una nueva ejecución de inferencia sobre esta subida.

| Métrica | Valor |
|---|---:|
| mIoU | 0,641 |
| R@0.3 | 0,911 |
| R@0.5 | 0,833 |
| R@0.7 | 0,445 |
| A-IoU (audio) | 0,596 |
| V-IoU (vídeo) | 0,663 |
| AV overlap | 0,609 |
| Audio-only | 0,374 |
| Visual-only | 0,524 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para el modelo base en bfloat16: en torno a 15-16 GB solo para pesos de 7B, más el coste de activaciones y de los codificadores de audio y vídeo, que depende de la resolución y la duración del material. El adaptador LoRA (0,1 GB) añade un coste despreciable.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes con vídeos largos; RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con una sola muestra si se controla la longitud del vídeo.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y previsiblemente en 16 GB con cuantización del base, aunque no se documentan recetas de cuantización para este adaptador.
- Opciones de despliegue: el ejemplo oficial usa `transformers` (`Qwen2_5OmniForConditionalGeneration`), `peft`, `accelerate` y `qwen-omni-utils`, con `attn_implementation="sdpa"` y `model.disable_talker()`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni existen pesos GGUF en el repositorio.
- Versiones: la configuración guardada del adaptador se generó con PEFT 0.19.1; el autor recomienda usar versiones compatibles de torch, transformers, peft, accelerate y qwen-omni-utils.
- Latencia y throughput: no disponibles. La evaluación registrada emplea generación determinista y `max_new_tokens=1024`.

## Comparativa con modelos similares

La información disponible no incluye resultados de otros modelos de grounding temporal audiovisual sobre el mismo benchmark, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parámetros | Contexto | Rendimiento en TimeDuet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TimeDuet-Qwen (este adaptador) | 7B base + LoRA r8 | No disponible | mIoU 0,641; R@0.5 0,833 | Adaptador sin especificar; base bajo licencia Qwen2.5-Omni-7B | HuggingFace (PEFT) |
| Qwen2.5-Omni-7B (modelo base) | 7B | No disponible en esta información | No disponible | Licencia de Qwen2.5-Omni-7B | HuggingFace |
| Otras alternativas de grounding temporal audiovisual | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador hereda las limitaciones del modelo base Qwen2.5-Omni-7B, no caracterizadas en detalle en esta información.
- Puede producir intervalos incorrectos o mal formados; el propio autor lo advierte de forma explícita.
- Los desplazamientos temporales construidos durante el entrenamiento no cubren todas las condiciones de alineamiento natural posibles, lo que limita la generalización fuera de la distribución del benchmark.
- No está validado para decisiones críticas de seguridad; su uso en monitorización o moderación debe ir acompañado de revisión humana.
- Licencia del adaptador no especificada: el uso comercial queda en un estado jurídico indeterminado. El uso del base está sujeto a la licencia de Qwen2.5-Omni-7B.
- Solo se declara inglés como idioma; no hay evidencia de comportamiento en otros idiomas.
- La evaluación exige no truncar fotogramas ni omitir el audio; un preprocesado distinto del protocolo registrado invalida la comparación con las métricas publicadas.
- El repositorio contiene únicamente el adaptador final: no debe apilarse sobre un modelo ya fusionado con SFT ni combinarse con otro adaptador SFT. Tampoco incluye estado del optimizador ni checkpoints intermedios.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de los resultados.
- El pipeline de HuggingFace no está declarado y no se publican pesos fusionados ni cuantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimeDuet/TimeDuet-Qwen
- Dataset TimeDuet: https://huggingface.co/datasets/TimeDuet/TimeDuet
- Código y proyecto: https://github.com/TimeDuet
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B/blob/main/LICENSE
- Artículo: Sihyeong Kim, Jaeyeong Choi, Joohyun Oh, Taeyeong Jeong, Bomin Kang, Daehee Park y Jisoo Mok, *TimeDuet: A Benchmark for Audio-Visual Temporal Grounding on Misaligned Streams* (sin enlace de publicación en la información disponible)
- Ficheros de reproducibilidad citados en el repositorio: `release_provenance.json`, `evaluation_protocol.json`, `schema_contract.json`, `evaluation_metrics.json`
