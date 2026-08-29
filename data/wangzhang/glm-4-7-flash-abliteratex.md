# wangzhang/GLM-4.7-Flash-abliteratex

## Resumen

`GLM-4.7-Flash-Abliteratex` es una versión modificada del modelo `zai-org/GLM-4.7-Flash` de Z.AI, publicada por Wangzhang Wu. Se trata de un checkpoint "abliterado": se le ha aplicado una intervención en el espacio de representaciones (técnica Abliterix) para reducir sustancialmente el comportamiento de rechazo del modelo original, es decir, que responda a peticiones que el modelo base normalmente declinaría. El objetivo declarado es preservar la estructura oficial del checkpoint y minimizar el daño colateral en las capacidades del modelo, a la vez que se proporciona un artefacto GGUF Q8_0 reproducible.

El modelo está basado en la arquitectura `glm4_moe_lite`, una mezcla de expertos (MoE) con aproximadamente 30.000 millones de parámetros totales. La model card del autor indica que esta versión contiene 31.221.488.576 parámetros, aunque el conteo de safetensors del repositorio muestra 29.943.390.976; esta discrepancia no está resuelta en la documentación. El contexto máximo no se especifica en la model card, pero el modelo base GLM-4.7-Flash soporta 200.000 tokens según la documentación de Z.AI. Es un modelo experimental, con licencia MIT, y está pensado principalmente para investigación sobre alineación, seguridad y técnicas de intervención de representación, no para uso productivo sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm4_moe_lite) |
| Parametros totales | 29.943.390.976 (segun safetensors); 31.221.488.576 (segun model card del autor) |
| Parametros activos | no disponible (el modelo base GLM-4.7-Flash usa ~3.6B activos, no confirmado para esta version) |
| Longitud de contexto | no especificado en la model card; el base GLM-4.7-Flash soporta 200K segun Z.AI |
| Tipos de cuantizacion | BF16, F32 (safetensors), Q8_0 (GGUF incluido) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un derivado de `zai-org/GLM-4.7-Flash`, un transformer de mezcla de expertos (MoE) con atención MLA (Multi-head Latent Attention) y capas de predicción MTP/NextN. La modificación principal no es un entrenamiento convencional, sino una intervención en el espacio de pesos denominada Abliterix. Según la model card, se ajustaron únicamente las down-projections de los expertos enrutados (EGA, Expert Gradient Ablation) y se modificaron cuatro filas del router por capa MoE, aplicando un `router_bias = -0.85` a los expertos asociados con seguridad. Los pesos de atención y de expertos compartidos se dejaron intactos. El proceso de selección usó el dataset `wangzhang/abliterix-datasets` con direcciones `good_1000` y `harmful_1000`, y se realizó una búsqueda de 60 ensayos amplios más 24 dirigidos sobre una RTX PRO 6000 Blackwell 96GB con vLLM. No se aplicó RLHF ni DPO; es una intervención post-entrenamiento.

## Capacidades

- Generación de texto en inglés y chino, con soporte conversacional multi-turno.
- Reducción significativa del comportamiento de rechazo: responde a peticiones que el modelo base normalmente declinaría.
- Conserva la estructura oficial del checkpoint, incluyendo los tensores MTP/NextN (aunque algunos runtimes los ignoran en generación ordinaria).
- No se documentan capacidades de tool calling, visión, audio ni razonamiento explícito en la model card; estas dependen del modelo base, pero no están verificadas para esta versión.

## Casos de uso

- Investigación en seguridad y alineación de IA: estudiar cómo se comporta un modelo sin mecanismos de rechazo, y evaluar el impacto de intervenciones de representación en la factualidad y la coherencia.
- Evaluación de técnicas de "abliteration": comparar esta versión con el modelo base y con otras variantes abliteradas para medir el daño colateral en capacidades.
- Generación de texto creativo o de ficción donde se requiera evitar rechazos automáticos, siempre con supervisión humana y advertencias claras.
- Fine-tuning posterior para tareas específicas: al ser un checkpoint abierto con licencia MIT, puede servir como punto de partida para adaptaciones que requieran menos restricciones de rechazo.
- Análisis de alucinación y fabricación de datos: la model card advierte que la reducción de rechazo puede empeorar la invención de información privada, lo que lo convierte en un caso de estudio para medir esos efectos.
- Despliegue local en entornos controlados con llama.cpp o Transformers, para pruebas de concepto o demos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas específicas de rechazo:

| Metrica | Resultado |
|---|---|
| Tasa de rechazo en busqueda (50 prompts) | 2/50 (4%) |
| Tasa de rechazo en held-out (150 prompts, 256 tokens) | 26/150 (17,3%) |
| Tasa de respuestas complacientes en held-out | 124/150 (82,7%) |
| Deriva NLL (nats/token) en busqueda | 0,0826336592 |

Estos datos miden la reducción de rechazo, no la calidad general del modelo. La model card advierte explícitamente que una baja tasa de rechazo no equivale a factualidad.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 60 GB de VRAM (para 30B parámetros en BF16), requiere GPU profesional como A100 80GB, H100, o RTX PRO 6000 Blackwell 96GB.
- Inferencia con cuantización Q8_0: aproximadamente 30 GB, cabe en GPUs de consumo como RTX 4090 (24GB) con offloading parcial, o en RTX 5090 (32GB) de forma más holgada.
- El GGUF Q8_0 incluido está pensado para llama.cpp; se recomienda usar una versión reciente (commit `3018a11e79e489b657dbb77c95694889ccff92df` o posterior) por problemas conocidos con la conversión de tensores MLA y el apilado de expertos.
- Opciones de despliegue: Transformers (carga directa con `AutoModelForCausalLM`), llama.cpp (CLI o servidor), vLLM (usado en la búsqueda de intervención), y plataformas compatibles con endpoints (FriendliAI, etc.).
- Para KV cache, se recomienda mantener F16/BF16; no confundir cuantización del modelo con cuantización de cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zai-org/GLM-4.7-Flash (base) | ~30B (MoE) | 200K | MIT | Modelo original sin modificaciones, con rechazo estándar |
| wangzhang/GLM-4.7-Flash-abliteratex | ~30B (MoE) | no especificado | MIT | Versión abliterada, reducción de rechazo, experimental |
| Otras versiones abliteradas de GLM-4.7-Flash (p.ej. bloopez/Huihui-GLM-4.7-Flash-abliterated-BF16-GGUF) | ~30B | no especificado | MIT | Variantes comunitarias con distintos métodos de ablación |

No se dispone de datos de rendimiento comparativo en benchmarks estándar entre estas versiones.

## Limitaciones y advertencias

- Modelo experimental con reducción de rechazo: puede producir contenido inseguro, falso, que parezca privado o dañino. No debe usarse en producción sin supervisión y filtros adicionales.
- La baja tasa de rechazo no es un indicador de factualidad. La model card advierte que puede inventar datos personales, credenciales, citas o afirmaciones operativas que parecen reales pero no lo son.
- Solo soporta inglés y chino; no se garantiza calidad en otros idiomas.
- La discrepancia en el número de parámetros entre safetensors y la model card no está resuelta; puede afectar a la reproducibilidad.
- El GGUF Q8_0 requiere una versión reciente de llama.cpp; versiones antiguas pueden manejar incorrectamente los tensores MLA y el apilado de expertos.
- Licencia MIT, pero los términos de uso aceptable del modelo upstream (Z.AI) siguen aplicando; el autor no concede derechos adicionales.
- No es un modelo oficial de Z.AI; es un derivado independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangzhang/GLM-4.7-Flash-abliteratex
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Documentación de GLM-4.7 de Z.AI: https://docs.z.ai/guides/llm/glm-4.7
- Guía de ejecución local de GLM-4.7-Flash (unsloth): https://unsloth.ai/docs/models/tutorials/glm-4.7-flash
- Issue de llama.cpp sobre KV cache cuantizada en GLM: https://github.com/ggml-org/llama.cpp/issues/19036
- Issue de llama.cpp sobre GLM-4.7-Flash: https://github.com/ggml-org/llama.cpp/issues/18948
- Notas comunitarias sobre el conversor roto de GLM-4.7-Flash: https://huggingface.co/bloopez/Huihui-GLM-4.7-Flash-abliterated-BF16-GGUF
- Página del modelo en FriendliAI: https://friendli.ai/models/wangzhang/GLM-4.7-Flash-abliteratex
