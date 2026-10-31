# White-Wolf13/Qwen3.6-35B-A3B-SILVER-APEX-GGUF

## Resumen

Qwen3.6-35B-A3B-SILVER-APEX es una versión cuantizada en formato GGUF del modelo Qwen3.6-35B-A3B, un modelo sparse Mixture-of-Experts (MoE) de 34,7 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. La cuantización ha sido realizada por el usuario White-Wolf13 en Hugging Face mediante un pipeline propio denominado Enhanced APEX-I, basado en el framework apex-quant de mudler, que incorpora protecciones específicas para los tensores del router MoE y calibración con matrices de importancia (imatrix).

El valor diferencial de esta release no está en el modelo base, sino en la calidad de la cuantización: se preserva el router MoE en FP32, los expertos compartidos en FP16 y se aplican asignaciones de bits asimétricas para las proyecciones SwiGLU, con el objetivo de minimizar la degradación típica de las cuantizaciones agresivas en arquitecturas MoE. El modelo conserva el razonamiento nativo con bloques `<think>` y está orientado a casos de uso de razonamiento, roleplay, tool calling y generación de texto.

Es relevante porque permite ejecutar un modelo MoE de 35B con solo unos 3B de parámetros activos en GPUs de consumo, con perfiles de cuantización que van desde 11,29 GiB (12 GB de VRAM) hasta 26,73 GiB (doble GPU de 16 GB), todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse MoE con GQA (head_count_kv = 2), 256 expertos |
| Parametros totales | 34.660.610.688 (≈34,7B) |
| Parametros activos | ≈3B (indicado por la denominación A3B; dato exacto no disponible) |
| Longitud de contexto | No disponible (la model card muestra ejemplos con 16k–32k; ventana máxima del modelo base no especificada) |
| Tipos de cuantizacion | Perfiles APEX-I: PRO (~6,62 BPW), QUALITY (~5,77 BPW), BALANCED (~5,19 BPW), COMPACT (~3,89 BPW), MINI (~2,80 BPW); router en f32, expertos compartidos en f16, down-projections en Q8_0, gate/up en Q6_K/Q4_K |
| Idiomas soportados | Inglés y polaco (según model card; el modelo base Qwen suele ser multilingue, dato no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.6-35B-A3B, es un transformer decoder-only sparse MoE con 256 expertos y Grouped Query Attention (GQA) con solo 2 cabezas KV, lo que produce una caché KV excepcionalmente compacta. Con aproximadamente 3B de parámetros activos por token, ofrece la latencia de un modelo pequeño manteniendo la capacidad de un modelo de 35B.

Sobre este base, la versión SILVER no aplica un fine-tuning por descenso de gradiente convencional. Según el autor, se empleó un protocolo de "alineación de variedad latente y calibración espectral del espacio de pesos" para infundir conocimiento actualizado y fluidez multilingue (especialmente inglés y polaco) sin olvido catastrófico. Esta afirmación proviene de la model card del autor y no está verificada de forma independiente; no se han publicado datos sobre el corpus de entrenamiento, número de tokens ni técnicas de alineación (RLHF/DPO).

La innovación principal verificable está en la cuantización Enhanced APEX-I: router MoE (`ffn_gate_inp`) bloqueado en FP32 para evitar deriva en el despacho de expertos, expertos compartidos (`ffn_down_shexp`) en FP16, down-projections sensibles en Q8_0 combinadas con gate/up en Q6_K/Q4_K, y calibración imatrix sobre 168 chunks de 16.384 tokens (más de 2,75 millones de tokens) cubriendo tool calling, lógica multi-turno, síntesis de código y diálogo enciclopédico.

## Capacidades

- Generación de texto conversacional con formato ChatML y soporte de instrucciones de sistema.
- Razonamiento nativo con cadenas de pensamiento estructuradas en bloques `<think>`.
- Tool calling / function calling (indicado en tags y en el corpus de calibración imatrix).
- Casos de uso orientados a roleplay y escritura creativa (según tags del repositorio).
- Síntesis y análisis de código (dominio declarado en la calibración y en la model card).
- Soporte bilingue destacado de inglés y polaco.
- Ejecución eficiente en llama.cpp con Flash Attention gracias a la KV cache compacta de GQA.
- Etiquetado como modelo conversacional, compatible con endpoints estándar (endpoints_compatible).

## Casos de uso

- **Asistentes conversacionales locales**: el perfil BALANCED (20,95 GiB) cabe en una RTX 3090/4090 de 24 GB y permite servir un asistente multi-turno con contexto de 32k tokens mediante llama-server con API compatible con OpenAI.
- **Agentes con tool calling en local**: el modelo conserva el soporte de herramientas del formato ChatML y la calibración imatrix incluyó específicamente tool calling, lo que lo hace adecuado para pipelines de agentes que ejecutan funciones y razonan en múltiples pasos.
- **Razonamiento paso a paso (CoT)**: el modo nativo `<think>` permite analizar problemas complejos antes de responder, útil en análisis técnico, matemáticas y depuración de código.
- **Contenido en polaco e inglés**: la model card declara dominio distintivo del polaco, útil para generación y comprensión de texto en ese idioma, algo poco común en modelos abiertos de este tamaño.
- **Roleplay y escritura creativa**: los tags del repositorio lo orientan a simulación y escritura creativa; el perfil QUALITY (~5,77 BPW) ofrece el mejor ratio calidad/VRAM para este uso.
- **Inferencia en hardware modesto**: el perfil MINI (11,29 GiB, ~2,80 BPW) permite aceleración completa por GPU en tarjetas de 12 GB como la RTX 3060 o RTX 4070, adecuado para estaciones de trabajo sin GPU profesional.
- **Despliegue híbrido CPU/GPU**: el perfil PRO (26,73 GiB) puede ejecutarse con 32 GB de RAM y 12 GB de VRAM descargando parte de las capas (`-ngl 14`), útil cuando no se dispone de GPU de gama alta.
- **Servidores de inferencia de alto rendimiento**: con la KV cache compacta de GQA y Flash Attention, el perfil BALANCED en una GPU de 24 GB admite contextos de 32k con batch sizes de 2048 tokens para servir a varios usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente métricas de proceso de cuantización (divergencia KL, distribución de energía de activación) sin valores numéricos, y no existen comparativas con MMLU, HumanEval, GSM8K u otros benchmarks estándar para esta versión SILVER ni para el modelo base Qwen3.6-35B-A3B.

## Requisitos de hardware

Requisitos según los perfiles de cuantización publicados por el autor:

| Perfil | Tamaño | VRAM recomendada | Hardware sugerido |
|---|---|---|---|
| APEX-I-PRO | 26,73 GiB | 2×16 GB o híbrido 32 GB RAM + 12 GB VRAM | Doble GPU de consumo o híbrido CPU/GPU |
| APEX-I-QUALITY | 23,29 GiB | 24 GB nativo | RTX 3090, RTX 4090 |
| APEX-I-BALANCED | 20,95 GiB | 24 GB con margen para contexto 32k–64k | RTX 3090, RTX 4090 |
| APEX-I-COMPACT | 15,69 GiB | 16 GB nativo | RTX 4080, Tesla T4, V100 16GB |
| APEX-I-MINI | 11,29 GiB | 12 GB nativo | RTX 3060, RTX 4070 |

- Cabe en GPUs de consumo: sí, desde 12 GB de VRAM con el perfil MINI y hasta 24 GB con BALANCED/QUALITY.
- Despliegue: llama.cpp (llama-cli y llama-server, método recomendado por el autor), con Flash Attention (`-fa on`) y descarga completa de capas (`-ngl 999`) cuando la VRAM lo permite.
- No se mencionan oficialmente vLLM, Ollama, TGI u otros runtimes; al ser GGUF, la compatibilidad natural es llama.cpp y sus derivados (incluido Ollama, aunque sin confirmación del autor).
- Latencia y throughput: no se han publicado mediciones; al activar ~3B de parámetros por token y con KV cache compacta (GQA, head_count_kv = 2), se espera una velocidad de generación propia de un modelo de 3B, pero no hay datos concretos.

## Comparativa con modelos similares

Comparativa orientativa con modelos MoE abiertos de tamaño y filosofía similares. Los datos de Qwen3.6-35B-A3B-SILVER provienen de su model card; para los alternativos se indican datos públicos conocidos. No hay benchmarks comparativos publicados para la versión SILVER.

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-SILVER-APEX (GGUF) | 34,7B | ≈3B | GGUF (perfiles 2,80–6,62 BPW) | Apache 2.0 | Cuantización optimizada para MoE, router FP32, imatrix de 2,75M tokens |
| Qwen3-30B-A3B (base oficial Qwen) | 30,5B | ≈3B | Safetensors y GGUF comunitarios | Apache 2.0 | Predecesor de la serie, sin las optimizaciones APEX; benchmarks públicos disponibles |
| Mixtral 8x7B Instruct | 46,7B | ≈12,9B | Safetensors y GGUF comunitarios | Apache 2.0 | Más parámetros activos, mayor VRAM requerida, contexto de 32k |

Nota: al ser una cuantización comunitaria reciente (octubre de 2026) sin benchmarks publicados, la comparativa de rendimiento real debe realizarse mediante pruebas propias del usuario.

## Limitaciones y advertencias

- **Verificación independiente**: las afirmaciones sobre el protocolo de "alineación de variedad latente", la mejora del conocimiento factual y el rendimiento superior al checkpoint base provienen exclusivamente de la model card del autor y no están respaldadas por benchmarks públicos ni auditorías de terceros.
- **Riesgo de alucinación**: no disponible; al no existir evaluaciones publicadas, no se puede cuantificar la tasa de alucinaciones de esta versión.
- **Idiomas**: la model card declara solo inglés y polaco. El castellano no figura entre los idiomas declarados, aunque el modelo base Qwen suele tener cobertura multilingue; el rendimiento en español no está documentado.
- **Contexto**: la ventana máxima de contexto no está especificada en la model card; los ejemplos usan 16k–32k. No asumir contextos mayores sin verificar la configuración del modelo base.
- **Cuantización agresiva en perfiles bajos**: el perfil MINI (~2,80 BPW) implica una compresión muy intensa; aunque APEX-I protege router y expertos compartidos, la pérdida de calidad en los expertos cuantizados a Q4_K puede ser apreciable y no hay mediciones de degradación por perfil.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar los términos de la serie Qwen del modelo base para condiciones adicionales.
- **Procedencia del modelo base**: la serie "Qwen3.6" no corresponde a una release verificable ampliamente documentada en el momento de la ficha; se recomienda confirmar la autenticidad del repositorio base (Qwen/Qwen3.6-35B-A3B) antes de uso en producción.
- **Descargas y adopción**: el repositorio registra 1.043 descargas y 0 likes, lo que indica una adopción muy limitada y escaso testeo comunitario.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/White-Wolf13/Qwen3.6-35B-A3B-SILVER-APEX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Framework de cuantización apex-quant: https://github.com/mudler/apex-quant
- Organización Qwen (arquitectura base): https://github.com/QwenLM
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
