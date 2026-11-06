# yumiao-dev/Yumiao-0.1B-Base

## Resumen

Yumiao-0.1B-Base es un modelo de lenguaje base de 100.092.672 parámetros (aproximadamente 0,1B) entrenado desde cero por el desarrollador independiente yumiao-dev. No parte de pesos preentrenados de terceros: incluye un tokenizador BPE propio de 32k vocabulario, un corpus construido específicamente de 8.000 millones de tokens y un bucle de entrenamiento en PyTorch escrito a mano. La arquitectura es un decoder transformer de estilo LLaMA con 12 capas, dimensión oculta de 768, GQA con 12 cabezas de consulta y 4 de clave/valor, FFN SwiGLU de 2048 y RoPE, con una longitud de contexto de 1024 tokens.

El modelo está pensado como base pura de continuación de texto: recibe un prefijo y lo continúa. No ha pasado por ajuste por instrucciones (SFT) ni por alineamiento con preferencias, por lo que no responde a preguntas directas sino que tiende a proseguir el enunciado. Su interés es fundamentalmente educativo y de investigación: documenta de forma transparente el pipeline completo (tokenizador, limpieza de corpus, preentrenamiento, evaluación) y sirve como banco de pruebas para experimentos de ablación a pequeña escala.

La relevancia actual del modelo es la de un artefacto reproducible de bajo coste: entrena en una sola GPU AMD MI308X (gfx942) con ROCm 7.2 y PyTorch 2.12 en bf16, a unos 89.500 tokens/s y 731 ms por paso, y se publica bajo licencia Apache-2.0. Es un ejemplo útil de hasta dónde llega el conocimiento factual con 8.000 millones de tokens en 100 millones de parámetros, y de qué tareas conviene reservar a modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA (RMSNorm, RoPE, GQA 12Q/4KV, SwiGLU, embedding atado a la LM head) |
| Parametros totales | 100.092.672 (embedding 24,58 M compartido + 12 capas con 75,52 M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el autor solo documenta bf16; el repo publica safetensors) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 12 capas con dimensión de modelo 768 y FFN de 2048, que aplica RMSNorm, RoPE para la codificación posicional y atención con grouped-query attention (12 cabezas de consulta y 4 de clave/valor). El embedding de tokens (24,58 M parámetros) está atado a la matriz de la LM head, lo que explica que los 100 M totales se repartan entre esa matriz compartida y los 75,52 M de las 12 capas. El tokenizador es un BPE de 32k vocabulario entrenado por el propio autor.

El entrenamiento se realizó desde cero sobre 8.000 millones de tokens (122.000 pasos de 65.536 tokens), con una composición de aproximadamente 6.000 millones de tokens en chino, 3.700 millones en inglés y 0,2 mil millones de Wikipedia, a partir de los datasets AI-ModelScope/chinese-c4 y HuggingFaceFW/fineweb-edu. Se usó AdamW con β=(0,9; 0,95), weight decay 0,1, learning rate 6e-4 con warmup de 2.000 pasos y decaimiento coseno hasta el 10 %, batch de 64 secuencias de 1024 tokens, clipping de gradiente 1,0 y precisión mixta bf16. La inicialización es normal con std 0,02, y las capas de salida residual (`w3`/`wo`) usan std = 0,02/√(2·12). El resultado declarado es una pérdida de 2,96 y una perplejidad de 19,3. No se documenta RLHF, DPO ni ninguna fase de alineamiento; el pipeline indicado es tokenizador, limpieza de corpus, preentrenamiento y publicación.

## Capacidades

- Generación de texto por continuación de prefijo en chino e inglés; el autor describe la calidad en chino como buena para formar oraciones y párrafos gramaticalmente correctos, y la inglesa como aceptable con errores ocasionales.
- No dispone de modo de razonamiento, pensamiento explícito, visión, audio ni otras modalidades.
- No soporta tool calling ni function calling: no hay formato de herramientas ni ajuste para ello.
- No está diseñado para agentes ni razonamiento multi-paso; carece de SFT y de alineamiento.
- Capacidad factual muy limitada: el autor indica que las preguntas de conocimiento responden con invenciones (por ejemplo, responder "Shanghai" ante preguntas de capitales).
- Aritmética deficiente (sumas de dos dígitos acertadas de forma ocasional) y capacidad de código prácticamente nula.
- Requiere decodificación por muestreo; con decodificación greedy degenera en repeticiones.

## Casos de uso

- Investigación sobre el pipeline de entrenamiento: replicar el tokenizador BPE de 32k, la limpieza de corpus y el bucle de entrenamiento documentado en los directorios `training/` y `docs/` del paquete de publicación para estudiar cada etapa por separado.
- Experimentos de ablación a pequeña escala: variar la composición del corpus (proporción chino/inglés), la longitud de contexto o el learning rate y comparar pérdida y perplejidad con la referencia de 2,96 y 19,3, con un coste de cómputo de una sola GPU.
- Demostraciones en dispositivo: con 100 M parámetros y un repo de 0,2 GB, el modelo cabe en memoria de dispositivos modestos y permite demos de autocompletado o continuación de texto en local sin infraestructura de servidor.
- Estudio de escalado y leyes de potencia: usar la curva de pérdida por paso (checkpoints cada 500 pasos, archivo `last.pt` atómico, archivado cada 5.000) para analizar cómo evoluciona la capacidad lingüística con 8.000 millones de tokens en 100 M de parámetros.
- Evaluación comparativa de modelos pequeños: el autor publica una comparación con GPT-2 124M bajo lm-evaluation-harness 0.4.9 en zero-shot y CPU fp32, reutilizable como plantilla para evaluar otros modelos de escala similar.
- Generación de texto creativo o de relleno en chino: para tareas donde solo importa la fluidez gramatical (por ejemplo, generar variantes de frases o párrafos de prueba), el modelo produce texto cohesionado siempre que se use muestreo con temperatura y penalización de repetición.
- Docencia sobre modelos de lenguaje: ilustrar de forma práctica las diferencias entre un modelo base y uno ajustado por instrucciones, y por qué un modelo de 0,1B no adquiere conocimiento factual con 8.000 millones de tokens.

## Benchmarks y rendimiento

Evaluación con lm-evaluation-harness 0.4.9, zero-shot, CPU fp32, mismo script que Open LLM Leaderboard:

| Tarea | Metrica | Baseline aleatorio | GPT-2 124M | Yumiao-0.1B-Base |
|---|---|---|---|---|
| LAMBADA | acc | no disponible | 32,56 % | 18,20 % |
| PIQA | acc | 50,0 % | 62,89 % | 59,52 % |
| WinoGrande | acc | 50,0 % | 51,62 % | 51,07 % |
| ARC-Easy | acc | 25,0 % | 43,81 % | 40,15 % |
| SciQ | acc | 25,0 % | 75,20 % | 76,40 % |
| C-Eval (chino) | acc | 25,0 % | 23,18 % | 23,63 % |
| LAMBADA | ppl | no disponible | 40,06 | 156,61 |
| WikiText-2 | ppl | no disponible | 37,37 | 91,13 |

El autor resume el resultado como 5 victorias, 3 empates y derrota en los benchmarks en inglés frente a GPT-2 124M, con ventaja de Yumiao en generación en chino y en diálogo de identidad. En C-Eval ambos modelos quedan cerca del azar (25 %). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,2 GB de pesos (100 M parámetros × 2 bytes), más overhead de activaciones y caché KV, que con contexto de 1024 tokens es reducido; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; el autor entrenó en una AMD MI308X (gfx942) con ROCm 7.2, pero para inferencia no se requiere ese hardware.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en placas integradas y en CPU.
- Opciones de despliegue: transformers (documentado por el autor con `AutoModelForCausalLM` y `AutoTokenizer`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan recetas para vLLM, llama.cpp u Ollama, y no se publican pesos GGUF.
- Latencia y throughput: el autor reporta 89.500 tokens/s y 731 ms/paso durante el entrenamiento en MI308X; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| Yumiao-0.1B-Base | 100 M | 1024 | zh, en | Apache-2.0 | SciQ 76,40 %; C-Eval 23,63 % |
| GPT-2 124M | 124 M | 1024 | en | MIT (pesos publicados por OpenAI) | LAMBADA acc 32,56 %; WikiText-2 ppl 37,37 |
| Modelos de ~0,1B ajustados por instrucciones | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es la que publica el autor frente a GPT-2 124M: Yumiao gana en SciQ (76,40 % frente a 75,20 %) y en C-Eval (23,63 % frente a 23,18 %), y pierde en LAMBADA, PIQA, WinoGrande y ARC-Easy, además de obtener peor perplejidad en LAMBADA (156,61 frente a 40,06) y WikiText-2 (91,13 frente a 37,37). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento factual prácticamente inexistente: el autor advierte que el modelo "básicamente inventa" ante preguntas de hechos; no debe usarse como fuente de información.
- Riesgo alto de alucinación por diseño: al ser un modelo base sin alineamiento, continúa el texto de forma plausible sin veracidad.
- Decodificación greedy degenera en repeticiones; es obligatorio usar muestreo con temperatura, top-p y penalización de repetición.
- Capacidad aritmética y de código muy limitada; no apto para tareas de razonamiento numérico o generación de software.
- Contexto corto (1024 tokens): no admite conversaciones largas ni documentos extensos.
- Cobertura lingüística limitada a chino e inglés; no se documenta soporte de otros idiomas, incluido el español.
- No ha pasado por SFT ni RLHF: no sigue instrucciones ni mantiene formato de chat; usarlo como asistente conversacional requiere ajuste previo.
- Aunque la licencia Apache-2.0 permite uso comercial, la calidad del modelo hace inviable su uso en producción para tareas que requieran exactitud; el propio autor lo orienta a investigación, ablaciones y demos en dispositivo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni guías de despliegue en motores de inferencia de alto rendimiento, lo que limita su integración en pilas de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yumiao-dev/Yumiao-0.1B-Base
- Dataset AI-ModelScope/chinese-c4: https://huggingface.co/datasets/AI-ModelScope/chinese-c4
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Directorios `eval/`, `training/`, `docs/` y `assets/` dentro del repositorio del modelo (informes de evaluación, código de entrenamiento, documentación y figuras)
