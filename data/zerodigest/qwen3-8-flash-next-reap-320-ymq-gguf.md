# zerodigest/Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF

## Resumen

Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF es una compilación cuantizada y podada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario independiente zerodigest bajo el paraguas de su pipeline "ZeroDigest YMQ". El modelo base es un transformer híbrido de tipo Mixture-of-Experts (MoE) con componentes Mamba/SSM, según las etiquetas del repositorio. Sobre ese checkpoint se aplica una poda selectiva de expertos mediante REAP (K=320) y a continuación una cuantización de precisión mixta consciente de la arquitectura con el compilador YMQ v2.0.

El resultado es un GGUF de aproximadamente 63 GB por variante (XS-Pro y M-TI) que busca preservar las rutas de enrutamiento críticas asignando precisiones distintas por capa: Q8_0 para expertos compartidos, Q5_K para atención y un degradado de Q6_K a IQ2_XS para el pool de expertos supervivientes. El objetivo declarado es ofrecer un MoE de gran tamaño con contexto largo ejecutable en estaciones de trabajo de 48 GB o más de VRAM, orientado a entornos de desarrollo asistido por IA como RooCode o Aider.

El modelo cuenta con 131.621.823.360 parámetros totales según los safetensors del checkpoint base, licencia Apache 2.0 y alrededor de 1.000 descargas desde su publicación en octubre de 2026. Es relevante para quienes necesitan desplegar localmente un MoE de escala grande con cuantización agresiva pero selectiva, aunque la documentación pública sobre el modelo base y sobre los resultados de la poda es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con componentes Mamba/SSM (según etiquetas del autor) |
| Parametros totales | 131.621.823.360 (checkpoint base en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor menciona "high-context optimization" sin cifra) |
| Tipos de cuantizacion | GGUF con precisión mixta por capa: Q8_0, Q5_K, Q6_K, IQ4_NL, IQ3_XXS, IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos variantes: XS-Pro y M-TI, ~63 GB cada una) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es, según las etiquetas del repositorio, un transformer MoE híbrido con capas Mamba/SSM. No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan los parámetros activos por token ni las dimensiones internas de las capas de expertos.

La innovación principal de esta compilación es el pipeline de dos etapas. Primero, REAP con K=320 selecciona los 320 slots de experto por capa de enrutamiento con mayor masa de activación, calculada a partir de prompts de calibración y recogida en un manifiesto JSON (`seleccion_mass_K320.json`). Los expertos con menor activación se eliminan de forma permanente. Segundo, el compilador YMQ v2.0 aplica una cuantización en espacio logarítmico que asigna niveles de precisión por capa según análisis de clustering sobre la matriz de importancia: los expertos de alta relevancia se protegen con Q6_K o IQ4_NL, mientras que los de baja actividad descienden hasta IQ2_XS. El autor indica que estas builds soportan motores de especulación de predicción multi-token (MTP) en paralelo.

## Capacidades

- Generación de texto conversacional y de código, según la orientación declarada hacia entornos de desarrollo asistido (RooCode, Aider).
- Razonamiento multi-paso y ejecución en pipelines de agentes, gracias a la naturaleza MoE del modelo base.
- Soporte de motores de especulación MTP (multi-token prediction) para acelerar la decodificación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado en la documentación del autor.
- Visión o audio: no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistencia de código en IDE: el modelo puede integrarse en extensiones como RooCode o Aider para autocompletado y refactorización multi-archivo, aprovechando la orientación explícita del autor hacia estos entornos y el soporte de contexto largo.
- Despliegue local en estación de trabajo de 48 GB: con las variantes de ~63 GB y cuantización mixta, encaja en configuraciones con 48 GB o más de VRAM (por ejemplo, dos RTX 6000 Ada o una H100 NVL), permitiendo inferencia privada sin depender de la nube.
- Generación de documentación técnica: el modelo puede redactar documentación a partir de código fuente en repositorios grandes, apoyándose en la ventana de contexto extendida del modelo base.
- Análisis de repositorios y revisiones de código: la combinación de contexto largo y capacidades de razonamiento permite revisar diffs extensos o explicar arquitecturas de proyectos completos.
- Experimentación en investigación sobre poda de MoE: el repositorio sirve como referencia reproducible del pipeline REAP + YMQ, útil para estudiar el impacto de la poda selectiva de expertos en perplejidad y divergencia KL.
- Servicio conversacional de nicho: con licencia Apache 2.0, puede desplegarse como backend de chat técnico en infraestructura propia, siempre que se validen los sesgos y la calidad del modelo base.

## Benchmarks y rendimiento

El autor publica métricas de perplejidad sobre WikiText-2 (contexto 4096, `llama-perplexity`), pero la tabla de la model card está incompleta: solo aparece la fila de XS-Pro con tamaño ~63 GB y sin valores numéricos de perplejidad ni de divergencia KL. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Variante | Tamano | Perplejidad (WikiText-2) | KL media | Gradiente de bits |
|---|---|---|---|---|
| XS-Pro | ~63 GB | no disponible | no disponible | Q8_0 / Q5_K / Q6_K / IQ4_NL |
| M-TI | ~63 GB | no disponible | no disponible | Q8_0 / Q5_K / Q6_K / IQ4_NL / IQ3_XXS / IQ2_XS |

## Requisitos de hardware

- VRAM estimada: ~63 GB por variante, más overhead de contexto KV; se recomienda un mínimo de 48 GB de VRAM según el autor, aunque en la práctica el archivo completo excede esa cifra y requerirá offload parcial a RAM del sistema o GPU con 64-80 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB, RTX 6000 Ada (48 GB, con offload), configuraciones multi-GPU (2× RTX 4090 24 GB con tensor parallel o capa dividida).
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) ni en RTX 3090; requiere al menos dos unidades o combinación GPU+RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, servidores compatibles con endpoints (el repositorio incluye la etiqueta `endpoints_compatible`), vLLM con soporte GGUF experimental.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-REAP-320-YMQ (este) | 131,6 B totales | no disponible | Apache 2.0 | GGUF mixto | Poda REAP K=320 + cuantización YMQ |
| Qwen/Qwen3.8-Flash-Next (base) | 131,6 B totales | no disponible | Apache 2.0 | safetensors | Sin poda ni cuantización |
| AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF | no disponible | no disponible | no disponible | GGUF | Inspiración declarada del pipeline REAP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La poda REAP elimina permanentemente expertos de baja activación; puede degradar el rendimiento en dominios poco representados en los prompts de calibración.
- La cuantización mixta con piso IQ2_XS en expertos de baja actividad introduce pérdida de precisión no cuantificada en la documentación (faltan los valores de perplejidad y KL).
- El autor no documenta el número de parámetros activos ni la arquitectura exacta del modelo base; la información sobre el mismo es escasa.
- No hay datos publicados sobre sesgos, alucinación o comportamiento multilingüe.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-Flash-Next antes de uso comercial.
- El repositorio incluye enlaces de afiliado (RunPod) y solicitudes de donación; esto no afecta a la licencia pero conviene tenerlo en cuenta al evaluar la independencia de las métricas.
- El tamaño de ~63 GB supera la VRAM de muchas configuraciones de 48 GB, lo que obliga a offload y reduce el throughput.
- No se especifica la longitud de contexto efectiva tras la cuantización; los modelos MoE cuantizados agresivamente pueden degradarse en contextos muy largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zerodigest/Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Manifiesto REAP: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF/blob/main/manifests/seleccion_mass_K320.json
- Repositorio inspiración: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF
- Compilador YMQ: https://github.com/minyor/ymq-compiler
- RunPod (enlace de afiliado del autor): https://runpod.io?ref=dbjmkmeh
- Ko-fi del autor: https://ko-fi.com/zerodigest
