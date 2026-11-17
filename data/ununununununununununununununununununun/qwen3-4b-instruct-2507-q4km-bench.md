# ununununununununununununununununununun/qwen3-4b-instruct-2507-q4km-bench

## Resumen

Este repositorio no contiene un modelo nuevo, sino un artefacto de evaluación: la medición con `lm-eval` del cuantizador estándar Q4_K_M de llama.cpp aplicado a `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario `ununununununununununununununununununun` con el objetivo declarado de servir como "ancla industrial" en una comparativa interna denominada phi-lattice, que enfrenta distintas variantes de cuantización del mismo modelo base (BF16, "plain v2" y "v2-gecko") frente al Q4_K_M convencional. El valor práctico está en que permite cuantificar cuánto se degrada el rendimiento de un modelo de 4 000 millones de parámetros al comprimirlo a 4 bits con el esquema más extendido del ecosistema llama.cpp.

El modelo subyacente, Qwen3-4B-Instruct-2507, es un transformer denso de la familia Qwen3 en su revisión de julio de 2025, publicado por Alibaba Qwen bajo licencia Apache 2.0. Esta ficha describe el artefacto de benchmark y, por extensión, el comportamiento del modelo base en su forma cuantizada Q4_K_M, que es la que la mayoría de desarrolladores desplegará en producción sobre hardware de consumo.

La relevancia del repositorio es metodológica: fija un punto de referencia reproducible (mismas tareas, mismos defaults, mismo motor de evaluación) para comparar cuantizadores alternativos y detectar fenómenos anómalos, como el colapso de la métrica `flexible-extract` de GSM8K que sufren las tres variantes de 4 bits y que no aparece en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507); artefacto de evaluacion sobre GGUF Q4_K_M |
| Parametros totales | 4 000 millones (modelo base); no disponible el detalle exacto en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico evaluado en este repositorio); el modelo base admite otros esquemas GGUF no detallados aqui |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF Q4_K_M (descuantizado a bf16 por el cargador GGUF de transformers para la evaluacion) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: toma el GGUF Q4_K_M publicado por Unsloth (`unsloth/Qwen3-4B-Instruct-2507-Q4_K_M.gguf`, sha256 `3605803b982cb64a…`), lo descuantiza a bf16 mediante el cargador GGUF de transformers 4.57.6 y lo evalúa con el motor estándar de Hugging Face `lm-eval` 0.4.13 sobre una GPU L4. El propósito de descuantizar es aislar el efecto del cuantizador del efecto del runtime: al medir en bf16 con el mismo motor que las filas BF16, "plain v2" y "v2-gecko", toda la tabla comparte un único pipeline de evaluación y las diferencias son atribuibles al esquema de cuantización, no a diferencias entre llama.cpp y transformers.

El protocolo es deliberadamente minimalista: MMLU en 0-shot, GSM8K con decodificación greedy y sin plantilla de chat, y HellaSwag con `acc_norm`. IFEval queda fuera del job por ser una tarea sensible a la plantilla de chat. Esta decisión metodológica explica parte de los resultados y es un caveat importante: las cifras no reflejan el rendimiento del modelo en modo instruct con su plantilla real, sino en modo completado plano. La innovación técnica del repositorio es, por tanto, la reproducibilidad del ancla de comparación, no una aportación arquitectónica.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento matemático de varios pasos, medido en GSM8K con dos extractores (`strict-match` y `flexible-extract`).
- Conocimiento factual y académico multidisciplinar, medido en MMLU 0-shot.
- Razonamiento sobre sentido común y continuación coherente de texto, medido en HellaSwag.
- Evaluación reproducible de cuantizadores: sirve como referencia para comparar Q4_K_M frente a otros esquemas sobre el mismo modelo.
- No se documentan en este repositorio capacidades de tool calling, agentes, visión, audio ni modo thinking; deben consultarse en la model card del modelo base.

## Casos de uso

- Selección de cuantizador en producción: comparar la fila Q4_K_M de esta tabla con las variantes "plain v2" y "v2-gecko" para decidir qué esquema de 4 bits desplegar, sabiendo que las tres empatan estadísticamente y superan a "plain v2" en todas las métricas.
- Despliegue en hardware de consumo: el GGUF Q4_K_M de 4 000 millones de parámetros es el formato típico para ejecutar el modelo con llama.cpp u Ollama en GPUs de gama media y en CPU, y esta evaluación acota la pérdida esperada frente a BF16 (aproximadamente 1,2 pp en MMLU y 1,1 pp en GSM8K strict).
- Auditoría de regresiones por cuantización: usar la tabla como línea base para detectar cuándo un nuevo cuantizador degrada métricas más allá del ruido estadístico (el autor reporta que todas las diferencias entre gecko y Q4_K_M están dentro de ~1,6σ).
- Investigación sobre extracción de respuestas en GSM8K: el colapso de `flexible-extract` (21,08 % frente a 83,85 % en BF16) es un caso de estudio concreto sobre cómo la cuantización de 4 bits interactúa con el formato de salida del modelo y con el parser del evaluador.
- Réplica de experimentos: el repositorio fija versiones exactas (transformers 4.57.6, lm-eval 0.4.13, GPU L4) y el sha256 del GGUF, lo que permite reproducir la medición bit a bit en otros entornos.
- Docencia y formación interna: ilustrar con números reales el coste en calidad de la cuantización de 4 bits en modelos pequeños, donde el impacto relativo suele ser mayor que en modelos grandes.

## Benchmarks y rendimiento

Resultados publicados en la model card del repositorio (mismo motor y mismos defaults para todas las filas):

| Benchmark | BF16 Base | plain v2 | v2-gecko | Q4_K_M (este repo) |
|---|---:|---:|---:|---:|
| GSM8K (`strict-match`) | 85,90 % | 83,93 % | 85,06 % | 84,84 % |
| GSM8K (`flexible-extract`) | 83,85 % | 17,59 % | 21,83 % | 21,08 % |
| MMLU (`acc`) | 70,63 % | 68,06 % | 69,02 % | 69,40 % |
| HellaSwag (`acc_norm`) | 69,05 % | 67,19 % | 67,36 % | 68,39 % |

Lectura de los datos según el autor: `v2-gecko` y `Q4_K_M` empatan estadísticamente en todas las filas (GSM8K strict +0,22 pp para gecko, MMLU −0,38 pp y HellaSwag −1,03 pp para Q4_K_M, todas dentro de ~1,6σ). Ambas variantes superan a "plain v2" en todas las métricas. El colapso de `flexible-extract` es compartido por las tres variantes de 4 bits (17,59–21,83 %), por lo que se atribuye a la cuantización de 4 bits sobre este modelo y no a un cuantizador concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,5–3 GB para los pesos, más overhead de contexto KV; el dato exacto no está disponible en la información proporcionada.
- GPU recomendadas para evaluación: el autor usó una NVIDIA L4 (24 GB). Para inferencia basta con GPUs mucho menores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 4090), aunque el dato concreto no está verificado en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa con el GGUF; vLLM y TGI no consumen GGUF directamente y requerirían los pesos originales o una conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (Q4_K_M, este repo) | 4 000 M | no disponible | Apache 2.0 | GGUF en HF | Evaluado con lm-eval; MMLU 69,40 %, GSM8K strict 84,84 % |
| Qwen3-4B-Instruct-2507 (BF16) | 4 000 M | no disponible | Apache 2.0 | safetensors en HF | Referencia superior: MMLU 70,63 %, GSM8K strict 85,90 % |
| Qwen3-4B-Instruct-2507 "plain v2" (4 bits) | 4 000 M | no disponible | Apache 2.0 | según repositorio del autor | Peor en todas las métricas que Q4_K_M y gecko |
| Qwen3-4B-Instruct-2507 "v2-gecko" (4 bits) | 4 000 M | no disponible | Apache 2.0 | según repositorio del autor | Empate estadístico con Q4_K_M |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (Llama, Gemma, Phi) del mismo tamaño.

## Limitaciones y advertencias

- El repositorio es un artefacto de evaluación, no un modelo listo para producción: los pesos publicados son el GGUF Q4_K_M de Unsloth descuantizado, no una versión nueva.
- Las métricas se obtuvieron sin plantilla de chat y con decodificación greedy, por lo que no reflejan el comportamiento del modelo en modo instruct real; IFEval se excluyó explícitamente por esta razón.
- El colapso de GSM8K `flexible-extract` en las tres variantes de 4 bits (17,59–21,83 % frente a 83,85 % en BF16) indica que la cuantización altera el formato de salida del modelo; cualquier pipeline que dependa de parsers flexibles debe validarse empíricamente.
- Las diferencias entre cuantizadores de 4 bits están dentro de ~1,6σ: no debe interpretarse el orden de la tabla como una ventaja significativa de un esquema sobre otro.
- Cobertura de benchmarks limitada a cuatro métricas de tres tareas; no hay datos de seguridad, sesgos, toxicidad ni rendimiento multilingüe.
- No se documentan sesgos conocidos del modelo base en la información proporcionada; deben consultarse en la model card de Qwen3-4B-Instruct-2507.
- Licencia Apache 2.0 permite uso comercial, pero esa licencia aplica al modelo base; conviene verificar los términos del GGUF original de Unsloth.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026: es un artefacto de un solo autor sin validación externa conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-q4km-bench
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- GGUF Q4_K_M original de Unsloth: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-Q4_K_M.gguf
- Repositorio comparativo "v2-gecko": https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko
- lm-evaluation-harness: https://github.com/Eleftheria-EleutherAI/lm-evaluation-harness (repositorio estándar del motor de evaluación citado)
