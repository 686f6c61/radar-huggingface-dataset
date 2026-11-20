# Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP

## Resumen

Qwen3.8-27B-AWQ-INT4-ZhChat-MTP es una cuantización INT4 (W4A16) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Twu31. El checkpoint está pensado específicamente para servir conversaciones interactivas de baja latencia en vLLM con el modo de razonamiento desactivado, preservando la cabeza especulativa MTP del modelo original y manteniendo el `lm_head` en INT8. Se distribuye bajo licencia Apache 2.0 y admite entradas de imagen y texto (pipeline `image-text-to-text`).

El modelo base es un transformer híbrido que combina capas de atención lineal GDN (Gated Delta Network) con capas de atención clásica, lo que exige recetas de servicio específicas (por ejemplo, `--prefix-match-unit 16` y caché Mamba en bfloat16) para que el prefix caching funcione de forma efectiva. La cuantización reduce el peso de 55,6 GB en BF16 a 18,2 GB en INT4, lo que permite desplegarlo en una única GPU de 24-48 GB.

La relevancia de esta ficha radica en que no es una cuantización genérica orientada a throughput o a precisión de benchmarks, sino a latencia de turno en un solo stream: el autor publica latencias medidas extremo a extremo (TTFT de 51-67 ms y turnos de 18 tokens en 235-396 ms sobre una RTX 6000 Ada) y verifica el funcionamiento de la decodificación especulativa MTP y DFlash2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN (atención lineal) + atención clásica, multimodal (vision tower) |
| Parámetros totales | 6.260.690.960 (según safetensors del repo cuantizado); el modelo base se denomina "27B" pero el dato real del checkpoint es 6,26 B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; las recetas de servicio usan `--max-model-len 12288` |
| Tipos de cuantización | INT4 simétrica g128 (W4A16) en `compressed-tensors`; `lm_head` en INT8; vision tower y cabeza MTP en BF16; variantes AutoRound, AWQ y GPTQ en ramas separadas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que intercala capas de atención lineal GDN con capas de atención estándar, e incorpora una torre de visión para entradas image-text-to-text. Esta mezcla arquitectónica es la causa de que el prefix caching requiera ajustes específicos en vLLM (unidad de coincidencia de prefijo de 16 tokens y caché SSM Mamba en bfloat16), y de que las versiones de vLLM anteriores a la 0.30 presentaran problemas al reanudar estados Mamba con decodificación especulativa.

La cuantización se realizó con `llmcompressor` sobre los mismos datos de calibración con tres algoritmos distintos (AutoRound, AWQ y GPTQ); la rama `main` usa AutoRound con `lm_head` en INT8, mientras que las builds AWQ y GPTQ están en las ramas `awq-llmcompressor` y `gptq-llmcompressor`. Se preserva la cabeza de borrador MTP del modelo original, con una tasa de aceptación medida de entre el 64 % y el 73 % sobre tráfico de chat, y se ha verificado la compatibilidad con el borrador DFlash2 oficial de z-lab (5 capas, 3,85 GB, 7 tokens especulativos). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes junto con texto (pipeline image-text-to-text, torre de visión en BF16).
- Modo de razonamiento ("thinking") configurable mediante el parser `qwen3` y `enable_thinking`; las recetas recomendadas lo desactivan para minimizar latencia.
- Decodificación especulativa con cabeza MTP integrada (2 tokens especulativos) y con borrador DFlash2 externo (7 tokens especulativos).
- Compatibilidad con prefix caching en vLLM para prompts de sistema y historiales de conversación repetidos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de voz en tiempo real: con TTFT de 51-67 ms y turnos de 18 tokens en 235-273 ms sobre una RTX 6000 Ada, el modelo encaja en pipelines de reconocimiento de voz, LLM y síntesis de voz donde el presupuesto de latencia por turno es inferior a 500 ms.
- Asistentes encarnados y robótica: la combinación de entrada de imagen y respuestas cortas de baja latencia permite cerrar bucles de percepción-acción con un solo turno de inferencia por paso de control.
- Interfaces de chat con prompt de sistema largo: con `--prefix-match-unit 16` y prefix caching, un prompt de sistema cacheado de 1,5 k tokens reduce el TTFT a 133 ms en vLLM 0.33 frente a 285 ms sin esa optimización.
- Atención al cliente automatizada en chino e inglés: el soporte nativo de ambos idiomas y el contexto de servicio de 12.288 tokens permiten gestionar conversaciones multi-turno con historial.
- Despliegue en una sola GPU de consumo o workstation: los 18,2 GB en INT4 caben en GPUs de 24 GB como la RTX 4090 o la RTX 6000 Ada, lo que abarata el coste por instancia frente al BF16 de 55,6 GB.
- Asistentes multimodales de escritorio: la torre de visión en BF16 permite describir capturas de pantalla o imágenes adjuntas manteniendo el resto del modelo en INT4 para reducir memoria.
- Servicio de baja concurrencia con SLO estrictos: las recetas con `--max-num-seqs 8` y decodificación especulativa están calibradas para uno o pocos streams simultáneos, típico de aplicaciones interactivas más que de batch offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de latencia medidas extremo a extremo en una RTX 6000 Ada con un solo stream y turnos de 18 tokens tras un prompt de 1,5 k tokens:

| Configuración | vLLM | TTFT | Latencia por turno | ms/token |
|---|---|---|---|---|
| Recipe A (MTP off) | 0.29+ | 51 ms | 396 ms | no disponible |
| Recipe B (MTP on) | 0.29.0 | 141 ms | 388 ms (276 ms en caliente) | no disponible |
| Recipe B (MTP on) | 0.30.0 | 67 ms (59 ms en caliente) | 273 ms (237 ms en caliente) | 11,0 ms |
| Recipe B (MTP on) | 0.31.0 | 56 ms | 247 ms en caliente | 11,0 ms |
| Recipe B (MTP on) | 0.32.0 | 58 ms | 237 ms en caliente | 11,0 ms |
| Recipe B (MTP on) | 0.33.0 | 57 ms | 235 ms en caliente | 10,9 ms |
| Recipe C (DFlash2, K=7) | 0.33.0 | 84 ms | 249 ms | 10,0 ms |

Datos adicionales: tasa de aceptación del borrador MTP del 64-73 % sobre tráfico de chat; 2,7 tokens aceptados por paso con DFlash2; primer turno con nueva pregunta tras prompt de sistema cacheado a 133 ms de TTFT en vLLM 0.33 (frente a 285 ms en versiones anteriores); tasa de acierto de caché del 95-98 % en turnos posteriores de una conversación.

## Requisitos de hardware

- VRAM estimada: 18,2 GB de pesos en INT4, más caché KV y estados Mamba; el modelo base en BF16 ocupa 55,6 GB. Con `--max-model-len 12288` y `--max-num-seqs 8` se recomienda una GPU de 24 GB o superior.
- GPU recomendadas: RTX 6000 Ada (usada en todas las mediciones del autor), A100, H100. El kernel Marlin de vLLM requiere SM 8.0 o superior; en Hopper se usa Machete.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en GPUs de 32 GB o más; no se han publicado mediciones específicas en estas tarjetas.
- Opciones de despliegue: vLLM 0.24 a 0.33 con configuración cero; las recetas recomendadas usan `--enable-prefix-caching`, `--prefix-match-unit 16`, `--mamba-ssm-cache-dtype bfloat16` y `--reasoning-parser qwen3`. No se mencionan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,9-11,0 ms por token con MTP en vLLM 0.32-0.33; 10,0 ms por token con DFlash2; TTFT de 51-67 ms; turnos de 18 tokens en 235-273 ms en caliente. No se publican cifras de throughput agregado con alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP | 6,26 B (checkpoint) | no disponible (recetas a 12.288) | Apache 2.0 | safetensors INT4 | Optimizado para latencia de turno, MTP y DFlash2 verificados |
| Qwen/Qwen3.8-27B (base) | 27 B (denominación) | no disponible | Apache 2.0 | safetensors BF16 | 55,6 GB; sin cuantizar, mayor VRAM |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (5 capas, 3,85 GB) | no disponible | no disponible | safetensors | Borrador especulativo, no un modelo completo |

No se dispone de datos de benchmarks de precisión ni de otros checkpoints cuantizados comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar la precisión respecto al modelo base en tareas sensibles; el autor no publica evaluaciones de precisión comparativas.
- El checkpoint está calibrado y optimizado para conversación interactiva con razonamiento desactivado; su comportamiento en modo thinking o en cargas de alta concurrencia no está documentado.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está verificado.
- La arquitectura híbrida GDN requiere versiones recientes de vLLM (0.30 o superior) para que la decodificación especulativa con MTP funcione correctamente al reanudar estados Mamba; versiones anteriores muestran latencias notablemente peores.
- El uso de DFlash2 desactiva parcialmente el prefix caching de grano fino en todo el modelo, lo que penaliza el TTFT en conversaciones con prompts repetidos.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; aplican los del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y del borrador DFlash2 (z-lab) por separado.
- El dato de parámetros del checkpoint (6,26 B) no coincide con la denominación "27B" del modelo base; conviene verificar la arquitectura y el tamaño reales antes de dimensionar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Borrador especulativo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- PR de vLLM sobre reanudación de estados Mamba: https://github.com/vllm-project/vllm/pull/53945
- PR de vLLM sobre reanudación de estados Mamba: https://github.com/vllm-project/vllm/pull/55178
- PR de vLLM sobre prefix caching: https://github.com/vllm-project/vllm/pull/61589
