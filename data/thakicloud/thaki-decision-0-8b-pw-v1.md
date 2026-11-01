# ThakiCloud/Thaki-Decision-0.8B-PW-v1

## Resumen

Thaki-Decision-0.8B-PW-v1 es un adaptador LoRA de tipo router (enrutador) desarrollado por ThakiCloud para seleccionar entre dos modelos candidatos fijos: `google/gemma-4-31B-it` y `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4` en modo low-think. No genera texto: recibe una petición y devuelve un valor `delta_hat` en el rango [-1, 1] que estima la diferencia de probabilidad de que Gemma resuelva la petición al primer intento frente a Nemotron. La regla de enrutamiento preinscrita es enviar a Gemma si `delta_hat > 0`.

El modelo se construye sobre `vllm-sr/d3-lite` (una base derivada de Qwen3.5-0.8B, licencia Apache-2.0) mediante un adaptador LoRA de rango 16 (41 MB) más una cabeza lineal de 4 KB. La inferencia consiste en un único forward pass de un encoder de 0,8B más la cabeza lineal, lo que lo hace muy barato computacionalmente en comparación con invocar ambos candidatos grandes.

Es una release de investigación y experimental, no la versión recomendada por el autor (que es Thaki-Decision-0.8B-G13-v0.2). La evidencia aportada muestra que el modelo aprendió a reconocer el tipo de problema y a elegir el candidato más fuerte en esa categoría, pero el 99,81 % de sus decisiones coincidieron con una política fija por eje de problema, lo que limita su utilidad como router universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `vllm-sr/d3-lite`, derivada de Qwen3.5-0.8B) + adaptador LoRA + cabeza lineal de salida escalar |
| Parametros totales | 0,8B en la base; adaptador LoRA r=16 de 41 MB; cabeza lineal de 4 KB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el adaptador se aplica sobre la base) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + código cargador `thaki_decision.py` |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de enrutamiento construido sobre un encoder de 0,8B. La petición se renderiza como una pregunta de tipo sí/no de d3 ("Can a typical language model answer this request correctly on its first attempt?") y la cabeza lineal lee el estado oculto del último token del encoder: `z = w·h + b`, `delta_hat = 2·sigmoid(z) − 1`. No hay generación de texto ni umbral ajustado. Si la petición incluye una lista de herramientas, se renderiza el prompt seguido de `"\n\n[tools]\n"` y la lista de herramientas como JSON con claves ordenadas.

El entrenamiento usó 10.800 peticiones generadas proceduralmente a partir de 200 familias de tareas sobre 20 ejes de problema: matemáticas (3.780), código (3.240), JSON (1.620), lectura/consulta (1.080) y tool calling (1.080). La distribución lingüística fue de 5.413 peticiones en inglés y 5.387 en coreano; aproximadamente un tercio de dificultad fácil, medio y difícil; 2.061 de contexto largo y 1.080 con herramientas. La evaluación sellada se realizó sobre 60 familias de tareas no vistas generadas a partir de 20 ejes existentes. El modelo superó a baselines de embeddings y a un router BERT estilo RouteLLM bajo el criterio preinscrito de bootstrap por familia, pero con un margen ajustado y con una generalización limitada a nuevos ejes de problema.

## Capacidades

- Clasificación binaria de enrutamiento entre dos candidatos fijos (Gemma y Nemotron) mediante un score continuo `delta_hat` en [-1, 1].
- Salida auxiliar `p_prefer_gemma` = (1 + `delta_hat`)/2 y decisión discreta `route` en {Gemma, Nemotron}.
- Soporte de peticiones con listas de herramientas (tool calling) mediante renderizado JSON con claves ordenadas.
- Capacidad multilingüe limitada a inglés y coreano.
- No genera texto, no razona de forma multi-paso, no tiene visión ni audio.
- No es un router universal: solo es válido para el par de candidatos y los ajustes de medición especificados.

## Casos de uso

- Enrutamiento de coste en pipelines de inferencia: dado un par fijo de modelos grandes (Gemma 31B y Nemotron 120B), el router decide a cuál enviar cada petición con un único forward pass de 0,8B, reduciendo el coste frente a invocar ambos candidatos o usar un router basado en LLM.
- Clasificación de tipo de tarea para políticas de enrutamiento: como el modelo aprende a reconocer el eje del problema (matemáticas, código, JSON, lectura, tool calling), puede usarse para etiquetar peticiones y aplicar políticas fijas por categoría.
- Pre-filtrado en sistemas de evaluación de modelos: permite estimar de forma barata qué candidato es más probable que resuelva una petición antes de lanzar la evaluación completa con el modelo grande.
- Enrutamiento con herramientas: soporta peticiones que incluyen listas de funciones, útil en pipelines de agentes donde hay que decidir qué modelo maneja una llamada con tool calling.
- Investigación sobre routing y selección de modelos: sirve como baseline reproducible para estudiar políticas de enrutamiento por pares y comparar con routers BERT o baselines de embeddings.
- Despliegue en CPU o GPU de gama baja: al ser un adaptador de 41 MB sobre una base de 0,8B, puede ejecutarse en entornos con recursos limitados para tareas de clasificación de peticiones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente resultados de la evaluación sellada interna: el router superó a baselines de embeddings y a un router BERT estilo RouteLLM bajo el criterio preinscrito de bootstrap por familia, pero el 99,81 % de sus decisiones coincidieron con una política fija por eje y el margen sobre el router BERT es borderline. No se proporcionan cifras concretas de accuracy, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: la base es de 0,8B; en bf16 requiere aproximadamente 1,6 GB de VRAM, más el adaptador LoRA (41 MB) y la cabeza lineal (4 KB). En cuantización de 4 bits podría caber en menos de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también puede ejecutarse en CPU según el código de carga (`device="cuda:0"` o `"cpu"`).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM en bf16.
- Opciones de despliegue: el cargador oficial `thaki_decision.py` usa `transformers==5.17.0`, `peft==0.21.2`, `accelerate>=1.10`, `einops`, `huggingface_hub>=1.0` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El scoring se realiza con batch size 1, el mismo ajuste usado en entrenamiento y evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-Decision-0.8B-PW-v1 | 0,8B (base) + LoRA | No disponible | Router pairwise (Gemma vs Nemotron) | Apache-2.0 | HuggingFace |
| Thaki-Decision-0.8B-G13-v0.2 | 0,8B (base) + LoRA | No disponible | Router (versión recomendada por el autor) | No disponible | HuggingFace |
| Router BERT estilo RouteLLM | No disponible | No disponible | Router basado en BERT | No disponible | No disponible |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La model card indica que el margen sobre el router BERT es borderline y que la versión recomendada por el autor es G13-v0.2, evaluada sobre un par de candidatos distinto, por lo que no se ha demostrado que una supere a la otra.

## Limitaciones y advertencias

- Es una release de investigación y experimental; el autor recomienda usar Thaki-Decision-0.8B-G13-v0.2 en su lugar.
- El 99,81 % de sus decisiones coincidieron con una política fija por eje de problema: el modelo reconoce el tipo de problema pero no distingue peticiones del mismo tipo donde el mejor candidato difiere.
- Generalización limitada a nuevos ejes de problema; solo se validó la generalización en ejes vistos.
- No es un router universal: solo es válido para el par Gemma/Nemotron y los ajustes de medición especificados (bf16, thinking off, temperature 1.0, top_p 0.95, top_k 64, 2.048 tokens de salida, vLLM 0.28.0).
- Las respuestas truncadas cuentan como fallos en la evaluación.
- Las puntuaciones para peticiones fuera de la distribución de entrenamiento (chat abierto, otros tipos de tarea) no son significativas.
- Idiomas limitados a inglés y coreano; no se documenta soporte para castellano.
- Riesgo de alucinación no aplica directamente porque no genera texto, pero el score puede ser poco fiable fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero la validez del modelo está acotada al par de candidatos y ajustes indicados.
- No se documentan cuantizaciones oficiales ni soporte para motores de despliegue distintos del cargador propio.

## Enlaces

- HuggingFace: https://huggingface.co/ThakiCloud/Thaki-Decision-0.8B-PW-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Versión recomendada: https://huggingface.co/ThakiCloud/Thaki-Decision-0.8B-G13-v0.2
- Candidato A (Gemma): https://huggingface.co/google/gemma-4-31B-it
- Candidato B (Nemotron): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-Decision-0.8B-PW-v1/blob/main/MODEL_CARD.ko.md
