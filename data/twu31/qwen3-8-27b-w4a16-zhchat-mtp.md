# Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP

## Resumen

Qwen3.8-27B-W4A16-ZhChat-MTP es una compilación cuantizada en INT4 (esquema W4A16) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Twu31. El objetivo declarado no es maximizar el throughput ni la precisión en benchmarks, sino minimizar la latencia en conversación interactiva: un único prompt de aproximadamente 1.500 tokens que produce respuestas de 20 a 60 tokens con un tiempo hasta el primer token (TTFT) muy bajo y un coste por turno reducido, con el modo de razonamiento (thinking) desactivado.

La arquitectura subyacente es híbrida: combina capas de atención lineal del tipo GDN (gated delta network) con capas de atención clásica, e incorpora una torre de visión, lo que sitúa al modelo en la categoría image-text-to-text. La compilación conserva la cabeza especulativa MTP (multi-token prediction) en BF16 y mantiene la capa de salida `lm_head` en INT8, decisiones orientadas a preservar la decodificación especulativa en producción.

El resultado ocupa 18,2 GB frente a los 55,6 GB del modelo base en BF16, lo que permite servirlo en una sola GPU de 24 GB o superior. Está pensado para vLLM (versiones 0.24 a 0.33), con soporte de kernels Marlin en GPUs SM 8.0+ y Machete en Hopper. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención lineal GDN (gated delta network) combinadas con atención clásica; incluye torre de visión y cabeza especulativa MTP |
| Parametros totales | 6.260.690.960 (según safetensors del repo cuantizado); el modelo base se denomina comercialmente 27B |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 12.288 tokens en las recetas de servicio recomendadas (`--max-model-len 12288`); el máximo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | INT4 simétrica con grupos de 128 (W4A16) mediante `compressed-tensors`; `lm_head` en INT8; torre de visión y cabeza MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `compressed-tensors`, compatible con kernels Marlin y Machete) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que conviven capas de atención lineal GDN, con estado recurrente tipo SSM, y capas de atención estándar. Esta mezcla condiciona el despliegue: el autor documenta que el caché de prefijos solo funciona correctamente si se ajusta `--prefix-match-unit 16` y se fija `--mamba-ssm-cache-dtype bfloat16`, y que las versiones de vLLM anteriores a la 0.30 presentaban problemas al reanudar el estado Mamba con decodificación especulativa, corregidos en los PR vllm#53945 y vllm#55178.

La cuantización se realizó con tres algoritmos distintos sobre los mismos datos de calibración (AutoRound, AWQ y GPTQ), y la rama `main` publica la variante AutoRound con `lm_head` en INT8; las variantes AWQ y GPTQ están en las ramas `awq-llmcompressor` y `gptq-llmcompressor`. La calibración se orientó explícitamente al régimen de conversación interactiva, no a la precisión de benchmarks. Se conserva intacta la cabeza de predicción multi-token (MTP) del modelo base, lo que habilita decodificación especulativa con aceptación medida de entre el 64 % y el 73 % en tráfico de chat. También se verificó compatibilidad con el borrador DFlash2 oficial de z-lab (5 capas, 3,85 GB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento desactivable mediante `enable_thinking: false`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Decodificación especulativa con la cabeza MTP integrada (2 tokens especulativos por paso en la receta recomendada).
- Decodificación especulativa alternativa con el borrador DFlash2 externo (7 tokens especulativos por paso).
- Soporte de caché de prefijos en arquitectura híbrida GDN, con tasa de acierto del 95 al 98 % en turnos posteriores de una conversación.
- Compatibilidad con el parser de razonamiento `qwen3` de vLLM.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling ni uso de agentes.

## Casos de uso

- Agentes de voz en tiempo real: con TTFT de 51 a 59 ms y turnos de 18 tokens resueltos en 235 a 273 ms en una RTX 6000 Ada, el modelo encaja en pipelines de reconocimiento de voz, LLM y síntesis de voz donde el presupuesto de latencia por turno es crítico.
- Asistentes encarnados y robótica interactiva: la combinación de entrada visual y respuestas cortas de baja latencia permite cerrar bucles percepción-acción con un solo modelo servido en una GPU.
- Interfaces de chat con prompt de sistema largo: con 1.500 tokens de contexto precargados y caché de prefijos activa, las preguntas nuevas obtienen TTFT de 133 ms en vLLM 0.33, adecuado para asistentes con instrucciones extensas y historial.
- Atención al cliente automatizada en chino e inglés: conversaciones multi-turno dentro de una ventana de 12.288 tokens, con coste por turno bajo y sin necesidad de clúster multi-GPU.
- Despliegue en hardware de gama profesional: los 18,2 GB del checkpoint permiten servirlo en GPUs de 24 GB, lo que habilita prototipos y producción de baja concurrencia en estaciones de trabajo con RTX 4090 o RTX 6000 Ada.
- Transcripción y descripción de imágenes en flujos documentales: la torre de visión permite responder preguntas sobre capturas o figuras dentro de la misma sesión conversacional.
- Evaluación comparativa de algoritmos de cuantización: las tres ramas (AutoRound, AWQ, GPTQ) sobre la misma calibración permiten medir el impacto de cada algoritmo en un modelo híbrido sin cambiar el resto del stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica latencias medidas de extremo a extremo con un único flujo y el mismo arnés de prueba, sobre una RTX 6000 Ada:

| Configuración | vLLM | TTFT | Turno de 18 tokens | ms/token |
|---|---|---|---|---|
| Receta A (MTP off) | 0.29+ | 51 ms | 396 ms | no disponible |
| Receta B (MTP on) | 0.29.0 | 141 ms | 388 ms | no disponible |
| Receta B (MTP on) | 0.30.0 | 67 ms | 273 ms | 11,0 ms |
| Receta B (MTP on, prefijo precalentado) | 0.30.0 | 59 ms | 237 ms | 11,0 ms |
| Receta B (MTP on) | 0.31.0 | 56 ms | 247 ms | 11,0 ms |
| Receta B (MTP on) | 0.32.0 | 58 ms | 237 ms | 11,0 ms |
| Receta B (MTP on) | 0.33.0 | 57 ms | 235 ms | 10,9 ms |
| Receta C (DFlash2, K=7) | 0.33.0 | 84 ms | 249 ms | 10,0 ms |

Datos adicionales: aceptación del borrador MTP del 64 al 73 % en tráfico de chat; 2,7 tokens aceptados por paso con DFlash2; TTFT de 133 ms para una pregunta nueva tras prompt de sistema cacheado en vLLM 0.33, frente a 285 ms en versiones anteriores.

## Requisitos de hardware

- VRAM estimada: 18,2 GB de pesos en INT4, frente a 55,6 GB del base en BF16; con caché KV y estado Mamba para 12.288 tokens hay que reservar margen adicional, por lo que una GPU de 24 GB es el mínimo práctico.
- GPUs recomendadas: RTX 6000 Ada (mediciones del autor), A100 y H100 para mayor concurrencia; en Hopper se usa el kernel Machete en lugar de Marlin.
- Compatibilidad con GPU de consumo: sí en RTX 4090 (24 GB) y RTX 3090 (24 GB), siempre que se use el kernel Marlin (SM 8.0+); no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM 0.24 a 0.33 con kernels Marlin o Machete; el autor no documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Throughput y latencia: 10,0 a 11,0 ms por token en decodificación de un solo flujo; entre 235 y 273 ms por turno de 18 tokens con caché caliente. Las cifras corresponden a un único stream; el rendimiento con `--max-num-seqs 8` no se cuantifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP | 6,26 B en safetensors (base 27B) | 12.288 tokens en receta | INT4 W4A16 + lm_head INT8 | Apache 2.0 | Latencia interactiva con MTP y DFlash2 |
| Qwen/Qwen3.8-27B (base) | 27B (denominación comercial) | no disponible | BF16 | Apache 2.0 | Modelo original multimodal |
| Otras cuantizaciones INT4 del mismo base (AWQ, GPTQ) | iguales | iguales | INT4 W4A16 | Apache 2.0 | Throughput o precisión de benchmark |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta compilación con alternativas de otros fabricantes; la comparación disponible se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización INT4 puede agravar la degradación en tareas sensibles a la precisión numérica.
- El modo de razonamiento está desactivado por defecto en las recetas publicadas, lo que reduce el rendimiento en tareas que requieren cadena de pensamiento larga.
- La ventana de contexto efectiva en las recetas es de 12.288 tokens, inferior a la del modelo base si este soporta más.
- La decodificación especulativa con MTP requiere vLLM 0.30 o superior; en versiones anteriores el TTFT se degrada notablemente (141 ms frente a 67 ms).
- DFlash2 desactiva los aciertos finos de caché de prefijos del modelo completo, lo que penaliza el TTFT en conversaciones con prompts largos.
- El autor no documenta sesgos específicos ni evaluaciones de seguridad del checkpoint cuantizado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y del borrador DFlash2 de z-lab, que se distribuyen por separado.
- El repositorio ocupa 68,2 GB por incluir varias ramas de cuantización; la descarga de una sola rama reduce el espacio necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- PR de vLLM sobre reanudación de estado Mamba: https://github.com/vllm-project/vllm/pull/53945
- PR de vLLM sobre estado Mamba especulativo: https://github.com/vllm-project/vllm/pull/55178
- PR de vLLM sobre caché de prefijos: https://github.com/vllm-project/vllm/pull/61589
