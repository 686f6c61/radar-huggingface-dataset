# Wondernutts/Starless-Seraph-31B-NVFP4

## Resumen

Starless-Seraph-31B-NVFP4 es una conversión cuantizada en formato NVFP4 del modelo Cyclone-Labs/Starless-Seraph-31B, publicada por el usuario Wondernutts. El modelo original es un merge creado por Cyclone-Labs que combina gemma-4-31B-it con seis variantes afinadas del mismo (Equinox-31B, gemma-4-31B-it-Claude-Opus-Distill-v2, gemma-4-31B-it-scotoma-2, G4-MeroMero-v2-31B, Gemma-4-31B-glimmer-rp-v0.1 y Gemma-4-31B-Storymaxxed3) mediante un método de fusión propio. El resultado está orientado a escritura creativa, roleplay, narración y generación de prosa atmosférica.

Esta versión concreta no introduce nuevo entrenamiento ni afinado adicional: su aportación es exclusivamente la representación de pesos en NVFP4 (coma flotante de 4 bits) con activaciones de entrada cuantizadas dinámicamente, escalas FP8 y tamaño de grupo 16. El checkpoint pesa 20,45 GB y declara 18.460.143.972 parámetros en los ficheros safetensors, aunque el nombre comercial mantiene la etiqueta "31B" heredada del modelo base. La ventana de contexto validada en despliegue es de 32.768 tokens.

La relevancia de esta ficha reside en que se trata de una conversión NVFP4 empaquetada con `compressed-tensors` y validada sobre vLLM 0.29.0 en una GPU Blackwell, lo que la sitúa de lleno en el ecosistema de inferencia de baja precisión para hardware de nueva generación. Mantiene la licencia Apache-2.0 del modelo original y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en la familia Gemma 4 (modelo base: gemma-4-31B-it) |
| Parametros totales | 18.460.143.972 (segun safetensors; el nombre comercial indica 31B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (limite validado en despliegue) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point, grupo de 16, escalas FP8); existe tambien una variante int4-ov del mismo autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (shards de 20,45 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder derivado de gemma-4-31B-it. La construcción de Starless-Seraph-31B no se hizo por entrenamiento desde cero ni por fine-tuning, sino mediante una fusión de pesos (merge) de siete checkpoints: el propio gemma-4-31B-it como base y seis adaptaciones especializadas en escritura creativa y roleplay. La model card del repositorio original describe el método de combinación como "custom", pero no detalla la receta de interpolación, las proporciones ni los hiperparámetros empleados en el merge.

La conversión NVFP4 tampoco añade entrenamiento: únicamente modifica la representación almacenada de los pesos. Los módulos de visión y audio, los embeddings, los routers y el `lm_head` se excluyeron de la cuantización. El proceso se calibró con 128 muestras sintéticas de roleplay de hasta 2.048 tokens cada una, sumando 138.503 tokens en total, usando el observador `nvfp4_expanded_imatrix` en modo estricto. Las herramientas declaradas son llmcompressor 0.14.0, compressed-tensors 0.19.0, Transformers 5.16.1 y PyTorch 2.13.0+cu130. La caché KV se dejó sin cuantizar y se sirvió en BF16 para las comprobaciones de compatibilidad.

## Capacidades

- Generación de texto orientada a escritura creativa, narración y prosa atmosférica.
- Conversación multi-turno con roles definidos (roleplay), incluyendo mantenimiento de personajes y voz narrativa.
- Modo de razonamiento opcional (`enable_thinking` en la plantilla de chat), con parser específico `gemma4` en vLLM.
- Salida en formato JSON verificada durante las comprobaciones de compatibilidad del autor.
- Respuestas en streaming.
- Plantilla de chat y tokenizador del modelo original incluidos en el repositorio.
- Idiomas: únicamente inglés declarado.
- Tool calling y function calling: no disponible (no se documenta en la información proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta).
- Visión y audio: los módulos correspondientes existen en el modelo base pero quedaron excluidos de la cuantización y no fueron probados.

## Casos de uso

- Escritura creativa asistida: el modelo está afinado específicamente para prosa atmosférica y descripciones vívidas, por lo que encaja en herramientas de redacción literaria, generación de borradores de relato y expansión de escenas.
- Roleplay conversacional: mantiene personajes y voz narrativa a lo largo de conversaciones multi-turno apoyándose en la ventana de 32.768 tokens y en el modo thinking opcional para tramas complejas.
- Generación de contenido para videojuegos narrativos: puede producir diálogos ramificados y descripciones de entorno para motores de aventura conversacional, con la plantilla de chat incluida para integrarlo directamente.
- Preproducción de guiones y material de worldbuilding: útil para generar trasfondos, fichas de personaje y descripciones consistentes gracias a su sesgo hacia narración y a la coherencia de contexto largo.
- Servicio de inferencia de bajo coste en hardware Blackwell: al ser NVFP4, permite desplegar un modelo de calidad creativa alta en una sola GPU con presupuesto de memoria reducido frente a BF16.
- Backend de API para aplicaciones de chat creativo: validado con la pila vLLM 0.29.0, con soporte de streaming y salida JSON, adecuado para integrarse tras una API HTTP propia.
- Generación de variantes de texto controladas por formato: la salida JSON comprobada permite usarlo en pipelines que necesiten estructura (por ejemplo, generar múltiples propuestas de texto con metadatos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que las comprobaciones realizadas establecen compatibilidad de servicio, no precisión, y que no constituyen una prueba de equivalencia con BF16. Tampoco se realizó un benchmark de throughput a contexto completo con cuatro usuarios.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 20,45 GB; sumando caché KV en BF16 y espacio de trabajo, el autor recomienda presupuestar por encima de esa cifra (el ejemplo usa `--gpu-memory-utilization 0.88` sobre una GPU de 96 GB).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell 96 GB (configuración validada). Se requiere hardware con soporte nativo de NVFP4, por lo que las generaciones anteriores (Ampere, Ada) no ejecutan estos kernels de forma nativa.
- Cabe en GPU de consumo: 20,45 GB de pesos exceden la VRAM de la mayoría de GPU de consumo actuales de 16 GB; encajaría en tarjetas de 24 GB o más solo si el runtime acepta la cuantización y hay margen para caché. No está confirmado por el autor.
- Opciones de despliegue: vLLM (validado en 0.29.0 con `--quantization compressed-tensors`). No se documentan soportes para llama.cpp, Ollama ni TGI.
- Contexto máximo de servicio: `--max-model-len 32768` en la configuración de referencia.
- Latencia y throughput estimados: no disponible. El autor no realizó benchmark de throughput a contexto completo.

Comando de referencia facilitado por el autor:

```bash
vllm serve Wondernutts/Starless-Seraph-31B-NVFP4 \
  --served-model-name Starless-Seraph-31B-NVFP4 \
  --quantization compressed-tensors \
  --dtype bfloat16 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.88 \
  --kv-cache-dtype bfloat16 \
  --max-num-seqs 4 \
  --max-num-batched-tokens 8192 \
  --enable-chunked-prefill \
  --enforce-eager \
  --language-model-only \
  --skip-mm-profiling \
  --generation-config vllm \
  --chat-template-content-format string \
  --reasoning-parser gemma4 \
  --default-chat-template-kwargs '{"enable_thinking": false}'
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starless-Seraph-31B-NVFP4 (Wondernutts) | 18,46B (safetensors) | 32.768 | NVFP4 / compressed-tensors | Apache-2.0 | HuggingFace + vLLM |
| Cyclone-Labs/Starless-Seraph-31B (original) | 31B (nominal) / no verificado en safetensors | 32.768 | BF16 sin cuantizar | Apache-2.0 | HuggingFace, FriendliAI, Featherless |
| Wondernutts/Starless-Seraph-31B-int4-ov | no disponible | no disponible | INT4 (OpenVINO) | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. La diferencia principal entre ellas es el formato de cuantización y el runtime objetivo, no el contenido del modelo.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo orientado a ficción y roleplay, la generación de hechos verificables no es su objetivo declarado.
- Sesgos conocidos: no disponible; el autor no documenta análisis de sesgos.
- Visión y audio: los módulos existen en el modelo base pero quedaron fuera de la cuantización y no fueron probados, por lo que su comportamiento es desconocido.
- Compatibilidad de hardware: requiere GPU con soporte nativo NVFP4 (familia Blackwell). No funcionará de forma nativa en arquitecturas anteriores.
- Precisión: el autor advierte de que las comprobaciones realizadas solo acreditan compatibilidad de servicio, no equivalencia con la versión BF16.
- Calibración reproducible: los prompts de calibración y la implementación del observador no se incluyen en el repositorio de pesos.
- Licencia comercial: Apache-2.0 permite uso comercial, pero se debe conservar la atribución a Cyclone-Labs y a los autores de los checkpoints fusionados, así como el aviso de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de esta conversión concreta.
- Uso en producción: al depender de una versión específica de vLLM (0.29.0) y de kernels NVFP4, conviene fijar versiones del runtime antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wondernutts/Starless-Seraph-31B-NVFP4
- Modelo base original: https://huggingface.co/Cyclone-Labs/Starless-Seraph-31B
- Revisión del modelo base usada en la conversión: https://huggingface.co/Cyclone-Labs/Starless-Seraph-31B/tree/a7b4bdc9ee204a2a7bd05f473013c29db4955014
- Model card original del modelo base: https://huggingface.co/Cyclone-Labs/Starless-Seraph-31B/blob/a7b4bdc9ee204a2a7bd05f473013c29db4955014/README.md
- Variante INT4 del mismo autor: https://huggingface.co/Wondernutts/Starless-Seraph-31B-int4-ov
- Gemma 4 31B it (modelo base de la fusión): https://huggingface.co/google/gemma-4-31B-it
- LatitudeGames/Equinox-31B: https://huggingface.co/LatitudeGames/Equinox-31B
- TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2: https://huggingface.co/TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2
- ReadyArt/gemma-4-31B-it-scotoma-2: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- zerofata/G4-MeroMero-v2-31B: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- BirdToast/Gemma-4-31B-glimmer-rp-v0.1: https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1
- MRockatansky/Gemma-4-31B-Storymaxxed3: https://huggingface.co/MRockatansky/Gemma-4-31B-Storymaxxed3
- Ficha en Featherless AI: https://featherless.ai/models/Cyclone-Labs/Starless-Seraph-31B
- Ficha en FriendliAI: https://friendli.ai/models/Cyclone-Labs/Starless-Seraph-31B
- Ficha en LLM Explorer: https://llm-explorer.com/model/Cyclone-Labs%2FStarless-Seraph-31B,43NLwtLBbpub6qE2NDaPjD
