# Yanlin77/memt-style-qwen3-4b-step2160

## Resumen

MemT-style memory on frozen Qwen3-4B (step 2160) es un experimento de investigación publicado por el usuario Yanlin77 que consiste en una rama de memoria matricial entrenable acoplada a un backbone Qwen3-4B completamente congelado. La memoria implementa una regla delta con compuertas (gated delta rule) siguiendo las fórmulas del informe MemT-1.0, y se inyecta en las 36 capas del transformer. No es un lanzamiento oficial de MemT, sino una reimplementación propia con un entrenamiento propio y abreviado.

El objetivo es extender el contexto efectivo de un modelo de 4B parámetros sin reentrenar el backbone: la atención queda restringida a fragmentos de 2048 tokens y todo el contenido anterior llega al modelo únicamente a través del estado de memoria matricial. Esto permite procesar secuencias de 32K tokens en streaming, por bloques, con un coste de atención constante por fragmento.

El checkpoint corresponde al paso 2160 (unos 2.3B tokens) de un plan de 4768 pasos, detenido en el paso 2289. Solo cubre una versión corta de la primera etapa de entrenamiento de MemT, sin la fase de destilación sobre tareas de memoria. Es relevante como material de estudio sobre memorias lineales en modelos congelados, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-4B congelado + rama de memoria matricial (gated delta rule) en las 36 capas |
| Parametros totales | Qwen3-4B (congelado) + 1.948.931.712 parámetros de memoria entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de atención de 2048 tokens por fragmento; contexto efectivo extendido vía memoria (entrenado con secuencias de 32K) |
| Tipos de cuantizacion | no disponible (pesos de memoria en bf16 para matrices 2-D y fp32 para gains/biases/scales; backbone Qwen3-4B admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | no disponible (heredados de Qwen3-4B; el entrenamiento usó texto general de LDC) |
| Licencia | Apache 2.0 |
| Formato de pesos | `checkpoint/memory_weights.pt` (PyTorch) y `checkpoint/memory_config.json`; los pesos de Qwen3-4B no se incluyen |

## Arquitectura y entrenamiento

El backbone es Qwen3-4B con todos los pesos congelados, sin LoRA. Sobre él se añade un estado de memoria matricial por capa (36 capas), con 32 cabezas de dimensión 128x128. La memoria tiene proyecciones q/k/v propias inicializadas a partir de las de atención, con q y k normalizadas en L2 y sin RoPE. La escritura por token sigue `S <- D S + u (w*v - u^T D S)^T`, con `u = sqrt(beta) k` y `D = diag(exp(lambda))`, donde beta (compuerta de borrado), w (compuerta de escritura) y lambda (compuerta de olvido) se calculan a partir del token. El decaimiento es como máximo de 0.03 por token y la compuerta de olvido se inicializa con semividas de 2K a 32K tokens. La lectura es `R = q S / sqrt(128)` con salida `RMSNorm(R) * 2 tanh(SiLU(g) / 2)` mediante una compuerta de salida de bajo rango. La inyección se suma cabeza a cabeza a la salida de atención antes del `o_proj` congelado.

La atención se restringe al fragmento actual de 2048 tokens, sin sinks; cada fragmento lee el estado dejado por los anteriores y después se escribe en memoria. El entrenamiento usa LDC (Long-Data-Collections) de texto largo general, secuencias de 32K tokens y documentos de al menos 16.384 tokens, con pérdida de entropía cruzada next-token únicamente (sin destilación). Optimizador AdamW con lr 1e-3 (proyecciones q/k/v a x0.1), warm-up 256, coseno hasta 0.05x, weight decay 0.1, betas (0.9, 0.95), eps 1e-15 y clip 1. Batch de 32 secuencias x 32K (unos 1M tokens por paso, 8 GPUs con acumulación de gradiente 4). Este checkpoint está en el paso 2160 (unos 2.3B tokens) de 4768 planificados, con la ejecución detenida en el 2289.

Diferencias respecto al paper MemT-1.0: backbone distinto (el paper usa Qwen3.6-35B-A3B con memoria cada 4 capas, 16 cabezas x 256), rango de compuerta 128 en lugar de 256, receta de optimizador LaCT en lugar de la del paper, aproximadamente 1/9 de los 20B tokens de la primera etapa y sin segunda etapa (datos de tareas de memoria con destilación de contexto completo).

## Capacidades

- Generación de texto autoregresiva sobre el backbone Qwen3-4B, con contexto largo gestionado por memoria en streaming.
- Procesamiento de secuencias largas (entrenado con 32K tokens) por fragmentos de 2048 tokens con estado persistente entre fragmentos.
- Memoria episódica de documento: el estado acumula información de fragmentos anteriores y la recupera en fragmentos posteriores.
- Razonamiento, código y matemáticas heredados de Qwen3-4B (no evaluados específicamente en este checkpoint).
- Soporte de tool calling y function calling: heredado de Qwen3-4B, no verificado en esta variante.
- Capacidades de agente multi-paso: no verificadas; la memoria está entrenada solo con texto general, sin tareas de QA.
- Capacidades multilingües: no disponibles de forma específica; dependen del backbone Qwen3-4B.
- Modo thinking: heredado de Qwen3-4B si se usa el chat template correspondiente; no verificado con la rama de memoria.
- Sin soporte de visión ni audio.

## Casos de uso

- Investigación sobre memorias lineales: reproducir y extender el experimento de MemT sobre un backbone congelado de 4B, comparando la regla delta con otras memorias recurrentes en tareas de modelado de lenguaje largo.
- Modelado de lenguaje sobre documentos largos: calcular perplejidad o entropía cruzada en documentos de 32K tokens procesados por fragmentos de 2048, usando el estado de memoria para propagar contexto entre fragmentos.
- Experimentos de QA de largo alcance: evaluar la recuperación de evidencia situada a más de 2048 tokens de la pregunta (como en el conjunto LoCoMo usado por el autor), midiendo la contribución de la memoria frente a la atención completa.
- Estudio de compuertas de escritura: analizar qué tokens activan las compuertas beta, w y lambda y por qué la selección automática de contenido relevante rinde cerca del azar (AUC aproximada de 0.51), como base para diseñar mejores mecanismos de escritura selectiva.
- Prototipado de asistentes con memoria de conversación: usar el estado matricial como memoria episódica de diálogos largos en entornos de investigación, aceptando la pérdida de contenido escrito al principio tras muchas escrituras.
- Base para fine-tuning de la rama de memoria: partir de estos pesos para entrenar una segunda etapa con datos de tareas de memoria y destilación de contexto completo, siguiendo el plan del paper MemT-1.0.
- Evaluación comparativa de eficiencia: medir el coste de atención constante por fragmento frente a atención completa en secuencias de 32K en GPUs de gama media.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

Documentos LDC reservados (48 x 32K tokens, entropía cruzada por token, menor es mejor), evaluación del paso 1440:

| Configuracion | Entropia cruzada |
|---|---|
| Memoria escrita | 1.007 |
| Memoria no escrita | 1.381 |
| Memoria de otro documento | 1.324 |

LoCoMo, 1298 preguntas cuya evidencia está más de 2048 tokens antes de la pregunta (fuera de la atención), respuestas greedy juzgadas por Qwen3.6-35B-A3B:

| Configuracion | Correctas |
|---|---|
| Atención completa sobre toda la conversación, sin memoria | 999 |
| Solo los últimos 2048 tokens, sin memoria | 337 |
| Memoria rellenada con otra conversación | 387 |
| Todos los fragmentos anteriores escritos en memoria | 447 |
| Fragmentos aleatorios escritos (tantos como la fila oracle) | 452 |
| Fragmentos elegidos por la atención de la pregunta (tantos como la fila oracle) | 510 |
| Oracle: solo fragmentos que contienen la respuesta anotada | 608 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de memoria ocupan unos 3.9 GB en el repositorio (matrices en bf16, vectores en fp32); el backbone Qwen3-4B añade aproximadamente 8 GB en bf16, por lo que la inferencia en bf16 requiere del orden de 12 GB de VRAM más el estado de memoria por capa y las activaciones.
- GPU recomendadas: A100, H100 o L40S para el entrenamiento y la evaluación a 32K; RTX 4090 (24 GB) suficiente para inferencia en bf16 con fragmentos de 2048.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en GPUs de 16 GB si se cuantiza el backbone; la rama de memoria se ejecuta en bf16 según el autor.
- Opciones de despliegue: el código propio del autor (`memory/memt/framework`, con `load_model`, `begin_stream`, `forward_chunk` y `end_stream`) sobre PyTorch con SDPA; no hay integración publicada con vLLM, llama.cpp, Ollama ni TGI, y la memoria en streaming requeriría adaptaciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemT-style Qwen3-4B (este) | 4B congelados + 1.95B de memoria | 2048 por fragmento, extendido por memoria (entrenado a 32K) | Matricial, gated delta rule, 36 capas | Apache 2.0 | Hugging Face, código en GitHub |
| Qwen3-4B (base) | 4B | 32K nativo (hasta 128K con YaRN, según Qwen) | No | Apache 2.0 | Hugging Face, ampliamente soportado |
| MemT-1.0 Nano (paper) | Qwen3.6-35B-A3B con memoria cada 4 capas | No disponible en la información | Matricial, 16 cabezas x 256, rango de compuerta 256 | No disponible en la información | Código oficial en GitHub |
| Transformers con atención completa de tamaño similar | 4B | 32K | No | Variable | Amplia |

La comparación directa con Qwen3-4B base en tareas de contexto largo no está publicada en la información disponible; los únicos datos comparativos son los de LoCoMo frente a atención completa (999 correctas) y solo últimos 2048 tokens (337 correctas).

## Limitaciones y advertencias

- Entrenamiento corto: solo el paso 2160 de 4768 planificados y aproximadamente 1/9 de los tokens de la primera etapa del paper; sin segunda etapa de destilación sobre tareas de memoria.
- Solo texto general: no hay etapa de question answering, por lo que el rendimiento en tareas de recuperación es limitado (447 correctas frente a 999 con atención completa en LoCoMo).
- Las compuertas de escritura de la memoria no distinguen contenido importante: AUC a nivel de token de aproximadamente 0.51 frente a las anotaciones de respuesta, es decir, cerca del azar.
- Pérdida de información: cada escritura de fragmento conserva solo aproximadamente la mitad del estado anterior, por lo que el contenido escrito al principio se desvanece tras muchas escrituras.
- La atención sin sinks restringe el acceso directo a los últimos 2048 tokens; todo lo anterior depende exclusivamente de la memoria.
- No se publican los pesos fp32 ni el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- Los pesos de Qwen3-4B no están incluidos en el repositorio y deben descargarse por separado.
- No hay integración con servidores de inferencia estándar (vLLM, TGI, llama.cpp), lo que limita su uso en producción.
- Riesgo de alucinación y sesgos: heredados de Qwen3-4B y no evaluados en esta variante; la memoria puede recuperar información de fragmentos irrelevantes (entropía cruzada de 1.324 con memoria de otro documento frente a 1.007 con la correcta).
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluación en producción desaconsejan su despliegue directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yanlin77/memt-style-qwen3-4b-step2160
- Paper MemT-1.0: https://arxiv.org/abs/2610.26825
- Código oficial de MemT-1.0: https://github.com/MemTensor/MemT-1.0
- Código del autor (entrenamiento, inferencia, evaluación): https://github.com/amy-77/memory (carpeta `memt/`)
- Ejemplo de evaluación LoCoMo: `memory/memt/locomo_eval/eval_locomo_memt.py`
- Detalles del experimento de escritura selectiva: `memory/docs/selective_write_memt_livemem_20261123.md`
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
