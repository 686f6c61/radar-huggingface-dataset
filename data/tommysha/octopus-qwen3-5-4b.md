# Tommysha/Octopus-Qwen3.5-4B

## Resumen

Octopus-Qwen3.5-4B es un adaptador LoRA de rango 64 (`r=64`, `alpha=64`) entrenado sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario Tommysha. No se trata de un modelo completo, sino de un checkpoint de política (`v45`, 1 época) obtenido mediante una variante de GRPO denominada DAG-GRPO recursiva, desarrollada en el trabajo "Octopus: One Brain, Many Branches for Latent-KV Multi-Agent Reinforcement Learning". Su propósito es coordinar episodios multiagente sobre un DAG radix residente en GPU, con cinco primitivas de ejecución (`fork`, `rewind`, `read_thread`, `wait`, `done`), para tareas de investigación profunda con recuperación BM25.

El modelo resuelve el problema del coste de contexto en sistemas multiagente: en lugar de duplicar ventanas de contexto por rama, permite montar páginas KV de ramas hermanas (hermanas en el árbol de búsqueda) exclusivamente en las 8 capas de atención completa del backbone, mientras las 24 capas recurrentes Gated DeltaNet omiten los tramos montados. Según la model card, esto retiene el 92,2 % de la información de respuesta y reduce el secuestro de tareas entre ramas 21 veces (del 57,9 % al 2,7 %) sin páginas KV adicionales.

Es relevante ahora porque demuestra que un backbone de 4B parámetros puede superar a sistemas de agente único con ventanas de 143K en tareas de búsqueda profunda, gracias a la ejecución multiagente real y no solo al aumento de contexto. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido: 24 capas recurrentes Gated DeltaNet + 8 capas de atención completa (Gated Full-Attention) |
| Parametros totales | No disponible (adaptador LoRA; el backbone Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; los experimentos usan ventanas de 32K y ventanas planas de 143K en la línea base |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un backbone híbrido compuesto por 24 capas recurrentes Gated DeltaNet y 8 capas de atención completa. Los módulos objetivo del LoRA cubren las 10 proyecciones lineales del modelo: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj`, es decir, atención, MLP SwiGLU y capas Gated DeltaNet.

El entrenamiento emplea recompensas binarias de resultado (0/1) sin modelado de proceso, con recuperación BM25 dispersa y GRPO recursivo sobre un DAG. El dataset de entrenamiento y evaluación es `Tommysha/octopus-train`, compuesto por OpenResearcher y BrowseComp-Plus con BM25. La innovación técnica principal es el montaje KV de copia cero solo en atención (`read_thread`): las páginas KV de ramas hermanas se insertan únicamente en las 8 capas de atención completa con desplazamientos monotónicos de posición RoPE, mientras las 24 capas recurrentes saltan los tramos montados. Esto evita duplicar páginas KV y limita la interferencia entre ramas.

## Capacidades

- Generación de texto orientada a razonamiento multiagente y búsqueda profunda (deep research).
- Ejecución de primitivas de control de árbol: `fork`, `rewind`, `read_thread`, `wait` y `done`.
- Coordinación de episodios multiagente sobre un DAG radix residente en GPU.
- Montaje de KV entre ramas hermanas con copia cero en capas de atención completa.
- Recuperación aumentada con BM25 disperso (herramientas `search`, `open` y `tree`).
- Entrenamiento con recompensas binarias de resultado, sin shaping de proceso.
- Soporte de tool calling implícito a través de las primitivas de ejecución y las herramientas de recuperación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación profunda automatizada: el modelo coordina varias ramas de búsqueda en paralelo sobre un corpus BM25, explorando hasta 329,2K tokens (199,0K netos) y 9.919 nodos de ruta crítica en el benchmark BrowseComp-Plus, lo que lo hace adecuado para preguntas que requieren agregar evidencia de múltiples fuentes.
- Sistemas de preguntas y respuestas sobre documentación técnica: con las primitivas `fork` y `read_thread`, se pueden abrir varias hipótesis de respuesta simultáneamente y montar el contexto de las ramas hermanas sin duplicar KV, reduciendo el coste de memoria frente a un agente único con ventana larga.
- Agentes de análisis competitivo: el modelo puede explorar ramas independientes por competidor o por fuente y consolidar hallazgos, aprovechando la reducción del 21x en secuestro de tareas entre ramas.
- Automatización de revisión bibliográfica: las primitivas `rewind` y `wait` permiten retroceder a nodos anteriores del árbol cuando una rama no aporta evidencia, lo que encaja con flujos de cribado de papers y verificación de citas.
- Despliegue en infraestructura con SGLang: el adaptador se sirve como LoRA sobre Qwen3.5-4B con `--max-lora-rank 64` y `--lora-target-modules all`, integrándose en pipelines existentes de SGLang sin reentrenar el backbone.
- Evaluación de sistemas multiagente en investigación: sirve como checkpoint de referencia para comparar estrategias de RL multiagente (GRPO plano frente a DAG-GRPO) sobre el mismo backbone y el mismo retriever BM25.
- Prototipado de agentes con presupuesto de memoria ajustado: al no añadir páginas KV extra en el montaje entre ramas, es viable en entornos donde un agente único con ventana de 143K no cabría.

## Benchmarks y rendimiento

| Método / sistema | Backbone | Herramientas | Explorado / ruta crítica | Acierto en BrowseComp-Plus |
|---|---|---|---|---|
| Single-Agent ReAct (ventana 32K) | Qwen3.5-4B | BM25 (search+open) | 32,6K / 1.043 | 26,0 % |
| Multi-Agent Fork (0-shot sin entrenar) | Qwen3.5-4B | BM25 (search+open+tree) | 38,1K / 1.590 | 26,3 % |
| Single-Agent GRPO (ventana plana 143K) | Qwen3.5-4B | BM25 (search+open) | 40,8K / 4.075 | 32,1 % |
| Context-Summary RL (Shao et al., 2026) | Qwen3.5-9B | BM25 (search+open+sum) | <= 32,0K | 42,1 % |
| CLM + SCR RL (Shao et al., 2026) | Qwen3.5-9B | BM25 (search+open+ret) | <= 32,0K | 42,5 % |
| Octopus-Qwen3.5-4B (v45) | Qwen3.5-4B | BM25 (search+open+tree) | 329,2K (199,0K netos) / 9.919 | 49,6 % |

Datos adicionales de la model card:

| Evaluación | Resultado |
|---|---|
| BrowseComp-Plus, 830 consultas, BM25 disperso | 49,6 % (+17,5 puntos sobre GRPO de agente único a 143K) |
| BrowseComp-Plus sin `fork` en test (mismos pesos) | 29,1 % (caída de -21,7 puntos frente a 50,8 %) |
| OpenResearcher validación, 500 consultas, BM25 | 51,2 % con `D_max=1`; 46,6 % con `D_max=inf`; 57,2 % en árboles completados |
| Montaje KV solo en atención (`read_thread`) | Retiene 92,2 % de la información de respuesta; reduce secuestro entre ramas 21x (57,9 % -> 2,7 %); 0 páginas KV extra |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador LoRA ocupa 0,2 GB; el backbone Qwen3.5-4B requiere memoria adicional no especificada en la información proporcionada.
- GPU recomendadas: no disponible. El despliegue documentado usa SGLang con `--disable-radix-cache false` y parches de cursor/montaje, sin indicar modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: SGLang con soporte LoRA (`--model-path Qwen/Qwen3.5-4B --lora-paths octopus-v45=Tommysha/Octopus-Qwen3.5-4B --max-lora-rank 64 --lora-target-modules all`) y el runtime Octopus del repositorio `shatianming5/octopus`, que incluye los parches `patches/apply_sglang_*.py` para mapear `in_proj_qkv` e `in_proj_z` de PEFT al `in_proj_qkvz` fusionado de SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | BrowseComp-Plus | Licencia |
|---|---|---|---|---|---|
| Octopus-Qwen3.5-4B | 4B (backbone) + LoRA r=64 | No disponible (experimentos hasta 329,2K explorados) | Multiagente DAG-GRPO con montaje KV | 49,6 % | Apache 2.0 |
| Single-Agent GRPO (Qwen3.5-4B) | 4B | 143K (ventana plana) | Agente único con RL | 32,1 % | Apache 2.0 (base) |
| Context-Summary RL (Shao et al., 2026) | 9B | <= 32K | Resumen de contexto con RL | 42,1 % | No disponible |
| CLM + SCR RL (Shao et al., 2026) | 9B | <= 32K | Recuperación con RL | 42,5 % | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el runtime Octopus y SGLang con parches específicos; sin ellos el adaptador no reproduce los resultados publicados.
- Dependencia fuerte del andamiaje: al desactivar `fork` en test, el acierto cae 21,7 puntos, lo que indica que buena parte del rendimiento proviene de la ejecución multiagente y no solo de los pesos.
- Entrenado con recuperación BM25 dispersa; el comportamiento con otros retrievers (densos, híbridos) no está documentado.
- Recompensas binarias de resultado sin shaping de proceso: puede presentar comportamientos poco calibrados en subtareas intermedias.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual fuera de los benchmarks citados.
- Idiomas soportados no disponibles; no se puede asumir un rendimiento multilingüe equivalente al del backbone.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y el runtime Octopus deben verificarse por separado.
- El checkpoint es un paso intermedio (`v45`, 1 época); no se documenta estabilidad más allá de las evaluaciones citadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tommysha/Octopus-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/Tommysha/octopus-train
- Código y runtime de servicio: https://github.com/shatianming5/octopus
- Página del proyecto e informe técnico: https://shatianming5.github.io/octopus/
- Script de despliegue: https://github.com/shatianming5/octopus/blob/main/scripts/deploy.sh
- Paper citado (Shao et al., 2026): https://arxiv.org/abs/2609.37725
