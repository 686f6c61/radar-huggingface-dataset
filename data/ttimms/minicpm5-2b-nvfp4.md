# Ttimms/MiniCPM5-2B-NVFP4

## Resumen

`Ttimms/MiniCPM5-2B-NVFP4` es una cuantización **NVFP4 W4A16 (GPTQ)** del modelo `openbmb/MiniCPM5-2B`, un transformer denso de 2,5 mil millones de parámetros desarrollado por OpenBMB. El objetivo de esta versión es reducir el espacio en disco de 4,68 GiB (formato bf16) a 2,03 GiB, un ahorro del 57 %, manteniendo la mayor calidad posible mediante un redondeo Hessian-aware (GPTQ) en lugar de la cuantización por redondeo directo (RTN). La cuantización la ha producido `Ttimms` con la librería `llm-compressor` 0.13 y está pensada para el despliegue local en GPU con memoria limitada (por ejemplo, 8 GB) o en escenarios on-device donde el tamaño de los pesos es crítico. El modelo base soporta generación de texto, código y razonamiento, con idiomas principal en inglés y chino, y una arquitectura compatible con `LlamaForCausalLM`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM) |
| Parametros totales | 2.516.756.480 (2,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa 32.768 tokens; la review web menciona 131K en el modelo base, sin confirmación en la ficha del autor) |
| Tipos de cuantizacion | NVFP4 W4A16 (GPTQ), activaciones en bf16, escalas FP8 por bloques de 16 elementos |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ) |

## Arquitectura y entrenamiento

El modelo base `openbmb/MiniCPM5-2B` es un transformer denso de 2,5 B parámetros con arquitectura tipo Llama (`LlamaForCausalLM`). No se han proporcionado detalles del entrenamiento del modelo base (dataset de preentrenamiento, número de tokens, si hubo RLHF o DPO). La información disponible se centra en el proceso de cuantización.

La cuantización NVFP4 W4A16 utiliza pesos de 4 bits en formato float, agrupados en bloques de 16 elementos con escalas de bloque en FP8, mientras que las activaciones se mantienen en bf16. Las capas `lm_head` y `embed_tokens` se dejan en bf16 para preservar la calidad. El redondeo se ha realizado con GPTQ (Hessian-aware) en lugar de RTN, lo que recupera aproximadamente 4,3 puntos porcentuales (pp) en HumanEval y 4,6 pp en MBPP. La calibración se hizo con 512 muestras de `theblackcat102/evol-codealpaca-v1` (datos de código, disjuntos de los conjuntos de evaluación), 2048 tokens. Todo el proceso se llevó a cabo con `llm-compressor` 0.13 en una RTX 5070 Ti (Blackwell, SM120) con vLLM 0.26. En esta GPU, la ruta de solo pesos (weight-only) decodifica actualmente mediante el kernel Marlin a una GEMM en bf16, por lo que el beneficio principal es el ahorro de memoria, no la velocidad.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Generación de código: resultados en HumanEval-instruct de 84,15 % y MBPP (3-shot) de 45,80 % tras la cuantización, frente a 86,59 % y 50,60 % del original en bf16.
- Razonamiento y matemáticas: el modelo base está orientado a tareas de razonamiento, matemáticas y tool use según la revisión web; la ficha de la cuantización no incluye benchmarks específicos de estas áreas.
- Aplicaciones ligeras de agentes y tool calling: la revisión web destaca soporte para tool use y flujos de trabajo de agentes ligeros, aunque no hay confirmación técnica en la documentación del autor.
- Despliegue on-device gracias al tamaño reducido de los pesos (2,03 GiB), compatible con GPU de consumo con VRAM limitada.
- Soporte para inferencia con vLLM mediante el esquema `compressed-tensors`, y carga estándar con Transformers.

## Casos de uso

- Asistente de código local en IDE: el modelo puede integrarse en entornos como VS Code para autocompletar o sugerir funciones. Con un HumanEval de 84,15 %, ofrece resultados notables para el tamaño; la cuantización permite ejecutarlo en una GPU de 8 GB sin sacrificar memoria del KV cache.
- Revisión de código en pipelines de CI/CD: gracias a su baja huella de memoria, puede desplegarse en servicios de inferencia continua para analizar diffs o sugerir refactorizaciones básicas. Se recomienda servir con vLLM y `--max-model-len 32768`.
- Chat conversacional bilingüe (inglés/chino): el modelo soporta ambos idiomas, lo que lo hace adecuado para asistentes en empresas con usuarios en estos idiomas. Su Apache-2.0 permite uso comercial sin restricciones.
- Agentes ligeros con tool calling: la capacidad de tool use del modelo base (según la revisión web) habilita flujos de agente simples, como consulta de APIs internas o generación de acciones estructuradas, sin necesidad de servidores de gran capacidad.
- Aplicaciones de escritorio y edge con memoria limitada: al pesar 2,03 GiB, es viable en dispositivos con 4–8 GB de RAM/VRAM, como portátiles con GPU integrada, para asistencia de texto sin conexión.
- Experimentación e investigación en cuantización: dado que se publica la metodología y la comparativa entre cuantizaciones (RTN vs GPTQ), sirve como modelo de referencia para evaluar técnicas de compresión en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con `lm-evaluation-harness` y backend vLLM, greedy, 3 draws cada uno (mediana y rango):

| Build | HumanEval-instruct | MBPP (3-shot) | Tamaño |
|---|---:|---:|---:|
| bf16 base (original) | 86,59 % (85,98–86,59) | 50,60 % (50,40–51,00) | 4,68 GiB |
| NVFP4 W4A16 RTN | 79,88 % (77,44–79,88) | 41,20 % (41,20–41,80) | 2,03 GiB |
| NVFP4 W4A16 GPTQ (esta build) | 84,15 % (81,71–84,15) | 45,80 % (45,60–46,40) | 2,03 GiB |
| Δ vs bf16 (GPTQ) | −2,4 pp | −4,8 pp | −57 % |

No se han publicado en la documentación resultados de MMLU, GSM8K o RULER. La model card indica que están en progreso evaluaciones adicionales (RULER long-context, agente SWE-style, IFEval) y una build de precisión mixta, pero no están disponibles aún.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 2,03 GiB. Con activaciones en bf16 y un KV cache FP8 en contexto de 32.768 tokens, es viable en una GPU de 8 GB, como señala el autor en la model card.
- GPU recomendada: la evaluación se realizó en una RTX 5070 Ti (Blackwell, SM120). En este hardware no se dispone de compute FP4 nativo, por lo que la decodificación se ejecuta vía Marlin sobre GEMM en bf16.
- Compatibilidad con GPU de consumo: sí, puede ejecutarse en tarjetas de 8 GB; no se han publicado resultados con VRAM inferior a 8 GB.
- Opciones de despliegue: vLLM (con `compressed-tensors`) y HuggingFace Transformers. No se menciona compatibilidad directa con llama.cpp u Ollama en la ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación directa entre las variantes de cuantización del mismo modelo base:

| Build | Parametros | Contexto (según ficha) | HumanEval | MBPP | Tamano | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---:|---|---|
| bf16 base | 2,5 B | No disponible | 86,59 % | 50,60 % | 4,68 GiB | Apache-2.0 | HuggingFace |
| NVFP4 GPTQ (esta build) | 2,5 B | No disponible | 84,15 % | 45,80 % | 2,03 GiB | Apache-2.0 | HuggingFace |
| FP8 build | 2,5 B | No disponible | No disponible | No disponible | ~2,8 GiB (estimado) | Apache-2.0 | HuggingFace |

La versión FP8 se presenta en la model card como «casi sin pérdidas» y cuesta aproximadamente 0,8 GB adicionales, pero no se publican sus métricas. No se han encontrado comparativas con otros modelos de la misma clase (por ejemplo, MiniCPM5-1B) en los materiales proporcionados.

## Limitaciones y advertencias

- Pérdida de calidad respecto al modelo base: la cuantización NVFP4 introduce un descenso de 2,4 pp en HumanEval y 4,8 pp en MBPP. El autor advierte que un modelo denso de 2,5 B no absorbe completamente los pesos de 4 bits.
- Rendimiento de velocidad no optimizado: en GPUs Blackwell sin soporte FP4 nativo, la decodificación pasa por Marlin a bf16, por lo que el ahorro es de memoria, no de velocidad.
- Evaluación incompleta: no hay evals de razonamiento general (MMLU), matemáticas (GSM8K) o contexto largo (RULER). Los resultados disponibles se limitan a tareas de código.
- Idiomas limitados: solo inglés y chino. No se ha evaluado ni documentado rendimiento en otros idiomas.
- Riesgo de alucinación: inherente a modelos pequeños; la disminución de precisión por la cuantización puede agravarlo, aunque no hay datos específicos.
- Información de contexto no confirmada: la review web menciona una ventana de contexto nativa de 131K para el modelo base, pero la documentación de la cuantización solo muestra `--max-model-len 32768` en el ejemplo de vLLM. No se dispone de evidencia oficial.
- No se han descrito sesgos en la información proporcionada; se recomienda evaluar el modelo en el dominio objetivo antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ttimms/MiniCPM5-2B-NVFP4
- Repositorio con metodología y comparativa de formatos de cuantización: https://github.com/t-timms/blackwell-16gb-moe
- Review del modelo base MiniCPM5-2B: https://www.buildfastwithai.com/blogs/minicpm5-2b-review
- Repositorio oficial de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
