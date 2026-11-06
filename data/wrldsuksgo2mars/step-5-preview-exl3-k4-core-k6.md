# wrldsuksgo2mars/Step-5-Preview-EXL3-K4-Core-K6

## Resumen

Step-5 Preview EXL3 K4 + Core K6 es una cuantización de tipo EXL3 (trellis int16 con multiplicador MCG) del modelo multimodal Step-5 Preview en BF16, publicado por el usuario wrldsuksgo2mars. El modelo base lo desarrolla StepFun (stepfun-ai) y está diseñado para tareas de imagen-a-texto y conversación, con una arquitectura de mezcla de expertos (MoE) dispersa, atención de ventana deslizante combinada con atención completa dispersa y tres etapas MTP (multi-token prediction). El checkpoint cuantizado conserva la torre de visión, los gates de atención, los indexadores dispersos, los embeddings y las normas en BF16/F32 nativos, mientras que las matrices lineales se almacenan en EXL3 K4 o K6 según su función.

El interés de esta ficha radica en que se trata de una cuantización agresiva de un modelo de 157.675.973.440 parámetros totales, empaquetada en 96 shards de safetensors con un peso de repositorio de 315,5 GB. La cuantización reduce el peso respecto al BF16 original, pero mantiene intactos los componentes sensibles a la precisión (visión, routers, normas y gates), lo que la hace relevante para despliegues con requisitos de VRAM muy elevados pero inferiores a los del modelo completo en BF16.

No se dispone de información sobre el número de parámetros activos, la longitud de contexto nativa, los idiomas soportados ni resultados de benchmarks en la información proporcionada. La model card del autor se centra en el proceso de cuantización, la procedencia y los requisitos de runtime, no en las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención de ventana deslizante (512 tokens) y atención completa dispersa en 23 capas; tres etapas MTP; torre de visión integrada |
| Parametros totales | 157.675.973.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana deslizante nativa de 512 tokens en las capas correspondientes) |
| Tipos de cuantizacion | EXL3 MCG K4 y K6 (trellis int16, escalas suh/svh float16, multiplicador MCG int32); componentes nativos en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (license: other) |
| Formato de pesos | safetensors (96 shards, 375.913 tensores, 315.357.147.520 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa: la model card menciona 352 expertos fusionados en origen y capas con expertos enrutados entre las capas 3 y 90. La atención combina una ventana causal deslizante nativa de 512 tokens con un indexador disperso en 23 capas de atención completa. Incorpora gates de atención por cabeza y tres etapas MTP con alineación de tokens desplazada, cada una con su propia cabeza de salida calibrada. La torre de visión se conserva byte a byte respecto al BF16 original.

La cuantización se realizó con EXL3 sobre una única RTX PRO 6000 Blackwell Max-Q. Se aplicó K6 a las matrices de atención q/k/v/o, FFN densas y compartidas y lm_head (645 matrices), K4 a los expertos enrutados de las capas 3 a 87 (89.760 matrices) y K6 a los expertos de las capas 88 a 90 (3.168 matrices), y K4 a las 27 matrices de atención MTP, FFN densas, eh_proj y cabezas de salida. Los 1.513 tensores restantes (visión, gates, indexadores, embeddings, routers y normas) se mantienen en BF16/F32. La calibración usó el dataset público `wrldsuksgo2mars/agentic-quant-panel-v1` con el renderizado nativo de chat/thinking, batch uno, sin padding ni truncamiento, y una pasada causal intercalada que propaga los predecesores serializados antes de calibrar cada capa sucesora. El multiplicador MCG es `0xCBAC1FED`, con semilla 787 y sigma 0,025.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, según el pipeline image-text-to-text declarado.
- Procesamiento de imagen y texto combinados (image-text-to-text) gracias a la torre de visión conservada en BF16.
- Modo thinking nativo, ya que la calibración emplea la plantilla de chat/thinking de máximo esfuerzo del checkpoint.
- Predicción multi-token mediante tres etapas MTP, lo que puede habilitar decodificación especulativa si el runtime lo soporta.
- Soporte de tool calling y agentes: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia multimodal en investigación: el checkpoint permite ejecutar un modelo de 157.700 millones de parámetros con torre de visión en un solo nodo de GPU de gama alta, conservando la precisión nativa en visión y routers, lo que facilita experimentos de imagen-a-texto sin disponer del BF16 completo.
- Evaluación de cuantización EXL3: útil para medir la degradación de calidad de esquemas K4/K6 mixtos frente al BF16 en tareas de razonamiento y visión, con evidencia de errores por tensor incluida en `quantization-errors/`.
- Despliegue con requisitos de VRAM reducidos frente al BF16: al almacenar los expertos enrutados en K4, el peso del repositorio baja a 315,5 GB, lo que permite servir el modelo en configuraciones de memoria que no admitirían el BF16 original.
- Prototipado de agentes con decodificación especulativa: las tres etapas MTP permiten experimentar con generación multi-token en runtimes que las soporten, reduciendo pasos de decodificación.
- Reproducibilidad de cuantizaciones: la procedencia incluye hashes de productor y entrada, lo que permite auditar y reproducir el proceso de cuantización en entornos de investigación.
- Fine-tuning o adaptación posterior (LoRA) sobre una base cuantizada: aunque no está confirmado en la información disponible, el formato safetensors y la preservación de componentes nativos facilitan experimentos de adaptación sobre el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el payload de pesos es de 315,4 GB, por lo que se requiere un entorno con al menos esa capacidad más overhead de activaciones y KV cache.
- GPU recomendadas: la cuantización se produjo en una RTX PRO 6000 Blackwell Max-Q; para servir el modelo completo se necesitan configuraciones multi-GPU o GPUs con memoria muy alta (A100 80 GB, H100 80 GB, H200, etc.), aunque no se especifica el número exacto.
- ¿Cabe en consumer GPU? No, el tamaño de pesos (315,4 GB) excede la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: el runtime debe soportar proyecciones EXL3 MCG K4/K6 mixtas, tres etapas MTP y los componentes nativos retenidos; no se requiere sidecar EXLR8. No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card indica que la cualificación de rendimiento de servicio es un trabajo separado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Step-5 Preview EXL3 K4 + Core K6 (este) | 157.675.973.440 | no disponible | stepfun-model-license-1.0 | safetensors EXL3 | Hugging Face, 0 descargas |
| stepfun-ai/Step-5-Preview-BF16 (base) | no disponible en la información | no disponible | stepfun-model-license-1.0 | safetensors BF16 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | stepfun-model-license-1.0 | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parámetros de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card advierte de que la generación completa, la calidad en contexto largo y el rendimiento de servicio no forman parte del trabajo de cuantización; no hay validación publicada de calidad tras la cuantización.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia comunitaria de funcionamiento en producción.
- La licencia stepfun-model-license-1.0 es de tipo "other"; es necesario revisar el texto completo antes de cualquier uso comercial.
- El runtime debe soportar EXL3 MCG K4/K6 mixto y las tres etapas MTP; runtimes estándar pueden no cargar el checkpoint.
- El tokenizer conserva una etiqueta histórica de clase Llama; algunas versiones de Transformers pueden alterar el backend si se usa AutoTokenizer en lugar de `PreTrainedTokenizerFast.from_pretrained(...)`.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto efectiva: no disponible; la ventana deslizante nativa es de 512 tokens en las capas correspondientes, pero el contexto total no se especifica.
- El tamaño de pesos (315,4 GB) y los 96 shards complican el despliegue y la descarga.

## Enlaces

- Hugging Face del checkpoint cuantizado: https://huggingface.co/wrldsuksgo2mars/Step-5-Preview-EXL3-K4-Core-K6
- Modelo base en BF16: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Licencia del modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16/blob/7734b7ffac118d70d8398bfa3eb0fab007eb45b1/LICENSE.txt
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
