# voves/AliceAI-Foundation-80B-A3B-Base-NVFP4

## Resumen

voves/AliceAI-Foundation-80B-A3B-Base-NVFP4 es un checkpoint cuantizado de yandex/AliceAI-Foundation-80B-A3B-Base, un transformer híbrido de tipo Mixture-of-Experts entrenado desde cero por Yandex. El modelo original declara 80.000 millones de parámetros totales y 3.000 millones activos por token, con 512 expertos (top-10 más un experto compartido) y una longitud de contexto de 262.144 tokens. Su esquema de capas alterna atención lineal KDA (Kimi Delta Attention) y atención completa con puerta, cada una seguida de bloques MoE, e incluye una cabeza de predicción multi-token (MTP).

Esta versión, publicada por el usuario voves y no por Yandex, aplica cuantización mixta NVFP4 + FP8 mediante compressed-tensors (LLM Compressor 0.18.0): los pesos de los 512 expertos MoE pasan a NVFP4 con escalas de grupo de 16 elementos en float8_e4m3, mientras que el experto compartido y las proyecciones de atención completa se mantienen en FP8. Las capas KDA, los routers, las proyecciones residuales, la cabeza MTP, el lm_head y los embeddings permanecen en BF16, y la caché KV no se cuantiza.

El interés práctico es el ahorro de memoria: frente a los aproximadamente 160 GB del checkpoint BF16 original, este repositorio ocupa unos 50 GB (47,7 GB de tamaño de repo), lo que permite alojar un MoE de 80B en una única GPU de 80 GB. La contrapartida es que la cuantización NVFP4 está pensada para hardware Blackwell y que la evaluación de calidad de este checkpoint está, según el autor, en curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención lineal KDA (Kimi Delta Attention) y capas de atención completa con puerta (12 capas `full_attention`), intercaladas con bloques MoE; incluye cabeza MTP (predicción multi-token) |
| Parametros totales | 80B declarados por el modelo original (3B activos por token). El repositorio cuantizado declara 40.981.255.808 parámetros en sus tensores safetensors (el empaquetado NVFP4 altera el recuento respecto al BF16) |
| Parametros activos | 3B por token (MoE con 512 expertos, top-10 más 1 experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 (4 bits float) estático en pesos de expertos MoE, grupo 16, escalas en float8_e4m3; activaciones NVFP4 dinámicas locales (grupo 16); FP8 estático por canal en experto compartido y en proyecciones `q_proj`/`k_proj`/`v_proj`/`o_proj` de las 12 capas de atención completa; activaciones FP8 dinámicas por token. Sin cuantizar (BF16): módulo `linear_attn` completo, routers (`mlp.gate`, `mlp.shared_expert_gate`), proyecciones residuales, cabeza MTP, `lm_head` y embeddings. Caché KV no cuantizada (`kv_cache_scheme: null`), sin dispersión |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuración compressed-tensors (LLM Compressor, versión de config 0.18.0); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo original es un transformer híbrido entrenado íntegramente desde cero por Yandex. El patrón de capas combina KDA (Kimi Delta Attention), un mecanismo de atención lineal con estado recurrente, con capas de atención completa con puerta; cada bloque de atención va seguido de una capa MoE. El MoE reparte el cómputo entre 512 expertos con enrutado top-10 más un experto compartido siempre activo, lo que da 3B de parámetros activos sobre un total de 80B. Se añade una cabeza MTP (multi-token prediction) que permite decodificación especulativa y entrenamiento con predicción de varios tokens. El punto fuerte declarado del modelo es el conocimiento factual en ruso.

En cuanto a los datos de entrenamiento, no se dispone del número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; la model card del checkpoint cuantizado no los detalla y no se han encontrado fuentes adicionales en la búsqueda web. Se trata de un modelo base (sufijo `-Base`), sin ajuste por instrucciones documentado. La innovación de este repositorio concreto es la receta de cuantización: NVFP4 agresivo (≈4,5 bits efectivos por peso: valor de 4 bits más una escala FP8 por cada 16 elementos) solo en las proyecciones de los expertos MoE (`gate_proj`, `up_proj`, `down_proj`, `gate_up_proj` de los 512 expertos), con las partes sensibles (experto compartido, proyecciones de atención completa) en FP8 y las capas KDA dejadas en BF16. El tokenizer, la configuración y los ficheros de arquitectura se copian sin cambios del repositorio original; solo se añade `quantization_config`.

## Capacidades

- Generación de texto por completación: es un modelo base, por lo que su uso natural es la continuación de prompt, no el diálogo instruccional.
- Conocimiento factual, con especial énfasis declarado en ruso.
- Procesamiento de contexto largo de hasta 262.144 tokens, apto para documentos extensos o conversaciones multi-turno muy largas.
- Generación de cadenas largas: el ejemplo de uso de la model card genera hasta 32.768 tokens nuevos para resolver un problema de razonamiento (encontrar la segunda moneda más pesada entre 256 con pesadas por parejas), lo que indica capacidad de mantener razonamiento extendido dentro de una única generación.
- Razonamiento y matemáticas: no hay benchmarks publicados para este checkpoint; la capacidad solo está ilustrada por el ejemplo de la model card.
- Bilingüismo ruso-inglés (etiquetas `ru` y `en`).
- Decodificación especulativa mediante la cabeza MTP incluida en la arquitectura (mantenida en BF16 en este checkpoint).
- Tool calling / function calling: no disponible. Al ser un modelo base sin ajuste por instrucciones, no se documenta soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible como capacidad declarada. Únicamente se puede construir mediante prompting o ajuste posterior.
- Visión, audio y otras modalidades: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Capacidades de código: no documentadas en la información disponible.

## Casos de uso

- Recuperación aumentada (RAG) sobre corpus en ruso: con 262.144 tokens de contexto se pueden inyectar decenas de fragmentos documentales sin truncar, y el modelo puede sintetizar respuestas apoyadas en el conocimiento factual en ruso que declara como punto fuerte. Al ser un modelo base, conviene un ajuste por instrucciones o un prompt de completación cuidadosamente diseñado.
- Análisis de documentos largos: contratos, expedientes, informes técnicos o normativa en ruso o inglés que superen los 100.000 tokens se pueden procesar en una sola pasada, evitando pipelines de troceado y resumen jerárquico.
- Ajuste fino para asistentes internos de conocimiento corporativo: al estar bajo licencia Apache 2.0 y ser un modelo base, es un punto de partida razonable para SFT o LoRA sobre datos propios de una empresa, aprovechando que solo 3B de parámetros están activos por token y el entrenamiento con expertos es más eficiente en cómputo.
- Preentrenamiento continuado de dominio: se puede seguir entrenando sobre corpus especializados (legal, médico, industrial) en ruso o bilingüe para adaptar el conocimiento factual sin partir de cero.
- Generación de datos sintéticos y destilación: útil para producir grandes volúmenes de texto o de razonamiento en ruso que después alimenten modelos más pequeños, gracias a su ventana de contexto y a la cabeza MTP para decodificación rápida.
- Traducción asistida ruso-inglés: aunque no es un modelo de traducción dedicado, su bilingüismo permite tareas de traducción y posedición dentro de un pipeline, siempre con evaluación previa de calidad.
- Banco de pruebas de cuantización NVFP4: comparar este checkpoint contra el BF16 original y contra cuantizaciones FP8 permite medir la degradación real de NVFP4 en un MoE de 80B, algo relevante para equipos que preparan despliegues en Blackwell.
- Evaluación de infraestructura de inferencia: sirve para validar configuraciones de vLLM con `compressed-tensors` y capas KDA sobre GPUs B200/GB200, midiendo throughput y consumo de memoria con caché KV sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card del checkpoint cuantizado indica que la evaluación de calidad está en curso ("Benchmarks: in progress") y remite a la model card del modelo original para la arquitectura, el entrenamiento y los resultados oficiales.

| Benchmark | Este checkpoint (NVFP4) | Modelo original (BF16) |
|---|---|---|
| MMLU | no disponible | no disponible en la información proporcionada |
| HumanEval | no disponible | no disponible en la información proporcionada |
| GSM8K | no disponible | no disponible en la información proporcionada |
| Otras evaluaciones | no disponible | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para los pesos: unos 50 GB en el formato cuantizado (tamaño de repo 47,7 GB), frente a los ~160 GB del BF16 original. La reducción es aproximadamente a un tercio, no a un cuarto, porque las capas KDA, routers, proyecciones residuales, cabeza MTP, `lm_head` y embeddings siguen en BF16.
- Caché KV sin cuantizar: a 262.144 tokens de contexto la memoria de caché se suma a los pesos y puede crecer de forma notable; no se dispone del cálculo exacto por capa ni de cifras publicadas por el autor.
- GPUs recomendadas: NVIDIA Blackwell (B200, GB200) para aprovechar la aceleración nativa NVFP4; H100/H200 de 80 GB pueden alojar los pesos pero sin soporte FP4 nativo, con la penalización de rendimiento correspondiente; A100 80 GB es posible en términos de memoria, también sin aceleración FP4.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) ni en una RTX 5090 de 32 GB por sí sola, dado que solo los pesos ocupan ~50 GB. Sería necesario repartir el modelo entre varias GPU o recurrir a offload a CPU, con caída fuerte de latencia.
- Opciones de despliegue: vLLM es la vía recomendada por el autor (la model card indica que requiere Docker); también es posible usar Transformers 5.16.1 con accelerate 1.14.0 y `flash-linear-attention` 0.5.0 para las capas KDA en GPU, siempre con `trust_remote_code=True`. Formatos alternativos como GGUF, llama.cpp u Ollama no son compatibles con este checkpoint NVFP4/compressed-tensors.
- Latencia y throughput estimados: no disponibles. Con 3B de parámetros activos por token el coste por token es bajo para el tamaño total, pero depende de la GPU y de que exista soporte nativo FP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voves/AliceAI-Foundation-80B-A3B-Base-NVFP4 | 80B totales, 3B activos; 40.981.255.808 parámetros en safetensors | 262.144 tokens | safetensors, NVFP4 + FP8 (compressed-tensors) | Apache 2.0 | Repositorio HuggingFace del cuantizador; 0 descargas y 0 likes en el momento de la consulta |
| yandex/AliceAI-Foundation-80B-A3B-Base | 80B totales, 3B activos (~81B, ~160 GB en BF16) | 262.144 tokens | safetensors BF16 | Apache 2.0 | Repositorio HuggingFace oficial de Yandex |
| Otras alternativas de la misma categoría (MoE de 3B activos) | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- No es el modelo original: es una cuantización de terceros publicada por el usuario voves. Yandex no avala ni mantiene este repositorio.
- La calidad de la cuantización no está evaluada: el autor indica explícitamente que los benchmarks están en curso. No hay ninguna evidencia publicada de la degradación introducida por NVFP4 en los expertos MoE.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Es un modelo base, no un modelo de instrucciones: no se documenta RLHF, DPO ni SFT. Sin ajuste posterior responde peor a formatos de chat, instrucciones y delimitadores conversacionales.
- Riesgo de alucinación: al ser un modelo base de conocimiento factual, puede generar afirmaciones plausibles pero incorrectas, especialmente fuera del dominio ruso. No se han publicado evaluaciones de veracidad.
- Cobertura lingüística limitada a ruso e inglés. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será muy inferior.
- Requisito de hardware específico: el rendimiento óptimo de NVFP4 depende de GPU Blackwell. En H100/A100 funcionará por emulación o mediante kernels alternativos, con pérdida de eficiencia.
- `trust_remote_code=True` es obligatorio: implica ejecutar código del repositorio del modelo, con el riesgo de seguridad asociado. Conviene auditar el código antes de usarlo en producción.
- Dependencias muy concretas y recientes (Transformers 5.16.1, accelerate 1.14.0, flash-linear-attention 0.5.0): versiones distintas pueden romper la carga del modelo, y las capas KDA en GPU exigen el soporte específico de flash-linear-attention.
- Caché KV no cuantizada: en contextos cercanos a 262.144 tokens el consumo de memoria crece más allá de los ~50 GB de pesos, lo que puede hacer inviable el contexto máximo en una sola GPU de 80 GB.
- Reducción de memoria parcial: al mantener KDA, routers, residuales, MTP, `lm_head` y embeddings en BF16, el ahorro real es de aproximadamente un tercio, no de un cuarto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar de forma independiente los derechos sobre el modelo original y sobre los datos de entrenamiento, no documentados.
- Discrepancia de recuento de parámetros: los tensores safetensors reportan 40.981.255.808 parámetros frente a los 80B declarados por el modelo original, debido al empaquetado de los pesos NVFP4. Conviene tenerlo en cuenta al planificar memoria o comparar modelos.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/voves/AliceAI-Foundation-80B-A3B-Base-NVFP4
- Modelo base original: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Paquete requerido para las capas KDA en GPU: `flash-linear-attention` versión 0.5.0 (citado en la model card)
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (páginas de Vinted y foros de cotilleos), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
