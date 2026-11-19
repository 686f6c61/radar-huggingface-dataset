# VertexAGI/prism-roleplay-1.5-small-fast

## Resumen

Prism Roleplay 1.5 Small Fast es un modelo de generacion de texto especializado en roleplay y personajes conversacionales, desarrollado por VertexAGI. Se construye aplicando la receta de entrenamiento de Prism Roleplay 1.5 Small (mismos datos, hiperparametros y system prompt) sobre `prism-ml/Bonsai-8B-mlx-1bit`, una build cuantizada a 1 bit (g128) de Qwen3-8B. El resultado es un modelo standalone que se carga directamente con `mlx-lm`, sin necesidad de aplicar un adaptador.

La innovacion principal reside en la tecnica de merge: un merge convencional sobre un modelo de 1 bit re-cuantiza todas las capas y el ajuste LoRA desaparece en el redondeo (loss retenido de 3,415 frente a 3,405 del base sin ajustar). VertexAGI resuelve esto fusionando las 16 capas tocadas por el LoRA en fp16 y almacenandolas a 6 bits, mientras las otras 20 capas, los embeddings y el LM head permanecen a 1 bit. El resultado es un loss retenido de 2,341, identico al del LoRA sin fusionar.

El modelo pesa 3,31 GB en formato MLX y esta pensado para Apple Silicon. Segun la model card, alcanza 27,9 tok/s con 3,61 GB de memoria pico, aproximadamente 1,3 veces mas rapido y con un 26% menos de memoria que el base de 4 bits equivalente. Su licencia es Apache 2.0 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B base, cuantizado mixto 1-bit/6-bit) |
| Parametros totales | 3.326.436.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | Mixta: capas ajustadas a 6 bits, resto a 1 bit (g128) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Bonsai-8B, una build de Qwen3-8B cuantizada a 1 bit con granularidad de grupo 128. Sobre esa base se aplica un LoRA de rango 8, escala 20, sobre 16 capas (todas las proyecciones de atencion y MLP de esas capas), con learning rate 1e-5, batch 1, longitud de secuencia 2.048 y 2.500 iteraciones. Los datos de entrenamiento consisten en 7.570 ejemplos de roleplay (398 de validacion), combinando roleplay real de foros con dos generaciones de datos sinteticos, filtrados por calidad (minimo 230 palabras, minimo 3 parrafos, presencia de dialogo).

La innovacion tecnica clave es el merge selectivo: las 16 capas tocadas por el LoRA se fusionan en fp16 y se almacenan a 6 bits, mientras las 20 restantes, los embeddings y el LM head se mantienen a 1 bit. VertexAGI probo tambien 4 bits (loss 2,423) y 2 bits (3,147) para las capas fusionadas, pero ambas opciones pierden parte del ajuste, por lo que se opto por 6 bits. El modelo requiere el fork de MLX de PrismML, que anade kernels de 1 bit (MLX estandar no puede ejecutar las capas de 1 bit).

## Capacidades

- Generacion de texto narrativo y roleplay de personajes con prosa fluida, parrafos multiples y dialogo.
- Mantenimiento de personaje y coherencia en escenas multi-turno.
- Generacion de acciones, discurso e interioridad del personaje sin romper la cuarta pared.
- Soporte de system prompt especifico de entrenamiento para maximizar calidad.
- Capacidad de razonamiento desactivable mediante `enable_thinking=False` en la plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Solo ingles; no hay capacidades multilingues declaradas.
- No dispone de vision ni audio.

## Casos de uso

- Roleplay conversacional en aplicaciones de entretenimiento: el modelo mantiene personajes coherentes en escenas multi-turno gracias a su entrenamiento especifico con system prompt de roleplay y datos filtrados por calidad narrativa.
- Generacion de ficcion interactiva: adecuado para motores de historias donde el usuario interpreta a un personaje y el modelo responde con prosa de varios parrafos (media de 294 palabras y 5,2 parrafos por respuesta en la evaluacion del autor).
- Chatbots de personajes en dispositivos Apple: su tamano de 3,31 GB y su consumo de 3,61 GB de memoria pico permiten ejecutarlo en Macs con Apple Silicon sin GPU dedicada.
- Prototipado rapido de experiencias de rol: la velocidad de 27,9 tok/s y la ausencia de defectos de formato (0 defectos en 16 escenas evaluadas) lo hacen util para iterar en demos y pruebas de concepto.
- Despliegue en entornos con memoria limitada: al ocupar aproximadamente un 26% menos de memoria que el base de 4 bits, encaja en equipos donde un modelo de 8 bits o 4 bits no cabria con holgura.
- Generacion de dialogos para videojuegos narrativos: el modelo produce dialogo presente en el 100% de las respuestas evaluadas, lo que facilita la integracion en sistemas de dialogo de personajes no jugadores.
- Fine-tuning posterior: el adaptador LoRA incluido en `lora_adapter/` (39 MB) permite aplicar el ajuste sobre el base Bonsai de 1,3 GB para obtener una variante aun mas ligera (unos 50 tok/s en 2 GB), con menor calidad.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion del autor: 16 escenas de roleplay variadas, decodificacion greedy, limite de 900 tokens, con juicio ciego por pares de `nvidia/nemotron-3-super-120b-a12b` en ambos ordenes A/B (unas 32 sentencias por comparacion).

| Comparacion | Resultado | Tasa de victoria |
|---|---|---|
| Fast vs Qwen3-8B base | 25W - 7L | 78% |
| Prism Roleplay 1.5 Small vs Qwen3-8B base | 27W - 4L | 87% |
| Fast vs Prism Roleplay 1.5 Small | 13W - 19L | 41% |

| Sistema | Defectos de formato | Palabras medias | Parrafos medios | Dialogo presente |
|---|---|---|---|---|
| Qwen3-8B base | 1 | 210 | 4,2 | 100% |
| Prism Roleplay 1.5 Small | 1 | 299 | 4,5 | 100% |
| Prism Roleplay 1.5 Small Fast | 0 | 294 | 5,2 | 100% |

| Velocidad / memoria (Apple Silicon) | Decodificacion | Memoria pico |
|---|---|---|
| Fast (este modelo) | 27,9 tok/s | 3,61 GB |
| Qwen3-8B 4-bit (clase de 1.5 Small) | 21,8 tok/s | 4,85 GB |
| Fast como base + LoRA sin fusionar | 49,9 tok/s | 2,03 GB |

El propio autor advierte que 16 escenas es una muestra pequena, que el juez es un LLM y que la cifra de velocidad de 1.5 Small corresponde a su base de 4 bits. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 3,61 GB de memoria pico en Apple Silicon segun el autor; el repositorio ocupa 3,4 GB.
- GPU recomendadas: Apple Silicon (MLX). No hay soporte documentado para GPU NVIDIA o AMD.
- Cabe en consumer hardware: si, en Macs con Apple Silicon; no se documenta compatibilidad con GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: `mlx-lm` con el fork de MLX de PrismML (`pip install mlx @ git+https://github.com/PrismML-Eng/mlx.git@prism`). No hay GGUF, por lo que llama.cpp, Ollama y TGI no estan soportados.
- Latencia y throughput: 27,9 tok/s de decodificacion en la ejecucion del autor; la variante con LoRA sin fusionar alcanza 49,9 tok/s con 2,03 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism Roleplay 1.5 Small Fast | 3,33B (efectivos, mixto 1-bit/6-bit) | no disponible | 78% victorias vs Qwen3-8B base; 41% vs 1.5 Small | Apache 2.0 | MLX (Hugging Face) |
| Prism Roleplay 1.5 Small | no disponible (base 4-bit de Qwen3-8B) | no disponible | 87% victorias vs Qwen3-8B base | Apache 2.0 | Hugging Face |
| Qwen3-8B base | 8B | no disponible | Referencia base de las comparaciones | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Calidad de prosa inferior a Prism Roleplay 1.5 Small: el juez prefiere a 1.5 Small en el 59% de las comparaciones directas.
- Solo soporta ingles; no hay capacidades multilingues.
- Requiere el fork de MLX de PrismML; MLX estandar no puede ejecutar las capas de 1 bit.
- No hay build GGUF, lo que limita el despliegue a Apple Silicon y excluye llama.cpp, Ollama y TGI.
- La evaluacion se basa en 16 escenas, una muestra pequena, y el juez es un LLM, con el sesgo que ello implica.
- Riesgo de alucinacion y de salida de personaje no cuantificado en la informacion disponible.
- La cuantizacion mixta a 1 bit/6 bits puede degradar matices frente a un modelo de mayor precision.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni limitaciones adicionales del autor.
- El modelo esta especializado en roleplay; su rendimiento en tareas generales de razonamiento o codigo no se ha evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-roleplay-1.5-small-fast
- Modelo base: https://huggingface.co/prism-ml/Bonsai-8B-mlx-1bit
- Receta original: https://huggingface.co/VertexAGI/prism-roleplay-1.5-small
- Fork de MLX de PrismML: https://github.com/PrismML-Eng/mlx/tree/prism
