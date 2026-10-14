# Weirdo333/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Weirdo333/Huihui-Qwen3.8-27B-abliterated-GGUF es una reedición en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario Weirdo333. Se trata de una versión "abliterated" (sin rechazos), es decir, con los pesos del modelo base modificados para eliminar las respuestas de negativa y el comportamiento de censura, siguiendo técnicas de abliteración aplicadas capa a capa sobre los tensores de atención, FFN y SSM. El repositorio recopila múltiples series derivadas de otras conversiones GGUF (unsloth, ISTA-DASLab, prism-ml y ConwayResearch), con distintos rangos de capas ablacionadas.

El modelo base declarado tiene 27.320.697.856 parámetros (~27,3 mil millones) y pipeline image-text-to-text, por lo que incorpora una torre visual. La model card menciona además referencia a MTP (multi-token prediction) y a tensores de tipo "ssm_out", lo que apunta a una arquitectura híbrida con capas de atención y de espacio de estados (SSM). El ejemplo de uso con llama-cli emplea `-c 262144`, lo que sugiere una ventana de contexto de hasta 256K tokens.

Su relevancia actual radica en tres factores: ofrece pesos GGUF ya convertidos y cuantizados (incluidas variantes ternarias y de 2 bits pensadas para ejecución on-device), retira las barreras de rechazo del modelo original y mantiene licencia Apache 2.0, lo que facilita su uso en entornos locales y de investigación. No obstante, el repositorio no incluye datos de benchmarks ni métricas de rendimiento, y algunas variantes requieren un fork específico de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas SSM (state space model); referencia a MTP (multi-token prediction) y a torre visual, según menciones del autor a "hybrid-attention", "ssm_out" y "visual" |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens según el ejemplo del autor con llama-cli (`-c 262144`); no confirmado de forma explícita en la ficha |
| Tipos de cuantizacion | GGUF: bf16, Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K_L, Q8_0_L, además de variantes ternarias/2-bit (p. ej. IQ2-mix) en la serie Ternary |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base publicado en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer de aproximadamente 27,3 mil millones de parámetros con pipeline image-text-to-text. Los indicios de la model card (tensores `ssm_out`, etiquetas `hybrid-attention`) apuntan a una arquitectura híbrida que combina mecanismos de atención con capas de espacio de estados, además de soporte de decodificación multi-token (MTP) y una torre visual para entrada de imágenes. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base.

La intervención realizada en esta reedición es la abliteración: se modifican quirúrgicamente los pesos asociados a la dirección de rechazo para suprimir las negativas del modelo. El autor describe que solo se ablacionan determinados rangos de capas, según la serie: capas 17 a 52 en la serie **UD** y capas 22 a 52 (indexación basada en cero) en las series **Swift**, **GSQ-RCO**, **UD-DW**, **Ternary** y **Underdog-Saluki**. Las primeras 15 capas del modelo original se conservan sin ablacionar, y tanto el módulo MTP como el visual permanecen intactos. Para mejorar la calidad, ciertos tensores críticos (`token_embd`, `output`, `ffn_down`, `ssm_out`, `attn_output`) se convierten a Q8_0 (o BF16 en la variante Q8_0_L) antes de la cuantización final, un procedimiento no estándar que provoca que algunos archivos Q2_K_L sean de mayor tamaño que los Q3_K o Q4_K. Las variantes ternarias emplean kernels híbridos de atención publicados en el fork PrismML-Eng/llama.cpp y no funcionan con llama.cpp estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado para contextos de hasta 262.144 tokens en el ejemplo del autor.
- Entrada multimodal image-text-to-text: el pipeline declarado y la referencia a que la torre visual "no ha sido modificada" indican capacidad de procesar imágenes junto a texto.
- Decodificación multi-token (MTP): el autor indica que el módulo MTP permanece sin alterar respecto al modelo base.
- Modo sin rechazos (abliterated): el modelo no aplica negativas ni filtros de contenido típicos en las respuestas.
- Ejecución local y on-device: los tags `on-device`, `cuda`, `metal` y `llama-cpp` apuntan a despliegue en hardware de consumo mediante llama.cpp/Ollama.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en los metadatos de HuggingFace.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explícitamente).
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Despliegue local en estación de trabajo: gracias a los GGUF ya generados, se puede ejecutar con llama.cpp usando `llama-cli -m <archivo>.gguf -c 262144`, lo que permite aprovechar la ventana de contexto larga en tareas de análisis de documentos extensos sin depender de servicios en la nube.
- Procesamiento de documentos largos: con contexto de hasta 262K tokens, es adecuado para resumir contratos, informes técnicos o expedientes completos en una sola pasada, reduciendo la necesidad de técnicas de chunking.
- Análisis de imágenes con texto asociado: al ser un modelo image-text-to-text, puede describir capturas, extraer datos de gráficos o responder preguntas sobre diagramas técnicos en flujos de trabajo internos.
- Investigación sobre alineación y seguridad: la variante abliterated sirve como objeto de estudio para medir el impacto de eliminar la dirección de rechazo en la calidad de las respuestas y en la propagación de contenido sensible.
- Generación de contenido sin restricciones en entornos controlados: útil en ecosistemas de escritura creativa o guiones donde los filtros del modelo base resultan limitantes, siempre en un contexto de uso legítimo y con revisión humana.
- Fine-tuning y experimentación con cuantizaciones extremas: la presencia de variantes ternarias y de 2 bits permite investigar el rendimiento de modelos grandes en hardware con recursos limitados, evaluando la degradación de calidad frente a Q4_K o Q8_0.
- Inferencia on-device en portátiles con GPU de consumo: la existencia de cuantizaciones Q2_K_L y Q3_K facilita ejecutar un modelo de 27B en equipos con 8-16 GB de VRAM, ideal para prototipos sin acceso a clústeres.
- Evaluación comparativa de series ablacionadas: al ofrecer varias series (UD, Swift, GSQ-RCO, Ternary, Underdog-Saluki) con distintos rangos de capas ablacionadas, permite estudiar qué configuración conserva mejor el rendimiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y los resultados de búsqueda web recibidos no guardan relación con el modelo ni aportan datos utilizables.

## Requisitos de hardware

| Cuantizacion | Tamano estimado en disco | VRAM estimada para inferencia | GPU recomendadas |
|---|---|---|---|
| Q2_K_L / 2-bit / ternaria | ~10-12 GB | ~10-14 GB | RTX 3080/4080, RTX 4090, Apple Silicon con memoria unificada |
| Q3_K | ~13-15 GB | ~14-18 GB | RTX 4090 24 GB, A10 24 GB |
| Q4_K | ~16-17 GB | ~18-22 GB | RTX 4090 24 GB, L4 24 GB, A5000 |
| Q5_K | ~19-20 GB | ~22-26 GB | A100 40 GB, A6000 48 GB |
| Q6_K_L | ~22-24 GB | ~26-30 GB | A100 40 GB, A6000 48 GB |
| Q8_0_L | ~28-30 GB | ~32-36 GB | A100 40 GB, H100 80 GB, A6000 48 GB |
| bf16 | ~54-55 GB | ~60-70 GB | A100 80 GB, H100 80 GB |

- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K_L, Q3_K y Q4_K, en tarjetas como RTX 3090, RTX 4080, RTX 4090 o Apple Silicon con 16-32 GB de memoria unificada.
- Para Q5_K y superiores se recomienda hardware profesional (A100, H100, A6000) por el tamaño de pesos y el consumo de memoria para caché de contexto largo.
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama (con el repositorio `huihui_ai/Qwen3.8-abliterated`), y para las variantes ternarias es obligatorio el fork PrismML-Eng/llama.cpp. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.
- Nota: el tamaño del repositorio completo es de 799,7 GB, ya que incluye todas las series y cuantizaciones; conviene descargar únicamente el archivo GGUF necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Weirdo333/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 mil millones | hasta 262.144 tokens (según ejemplo del autor) | apache-2.0 | GGUF | Varias series con distintos rangos de capas ablacionadas; incluye variantes ternarias |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 mil millones | no disponible | apache-2.0 | GGUF | Versión abliterated de referencia sobre el mismo base |
| Qwen/Qwen3.8-27B | 27,3 mil millones | no disponible | apache-2.0 | safetensors | Modelo base sin ablacionar, alineado y con rechazos |
| unsloth/Qwen3.8-27B-GGUF | 27,3 mil millones | no disponible | apache-2.0 | GGUF | Cuantizaciones GGUF estándar de Unsloth, sin ablacionar |

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated, se eliminan las negativas de seguridad del modelo base: puede generar contenido sensible, ofensivo o potencialmente dañino sin los filtros habituales.
- Riesgo elevado de alucinación no evaluado: no se aportan métricas de fiabilidad ni pruebas de veracidad.
- Sesgos conocidos: no disponible (no se documentan análisis de sesgo para esta reedición ni para el base).
- No se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- Algunas variantes (Ternary/2-bit) requieren un fork no oficial de llama.cpp (`PrismML-Eng/llama.cpp`) y no funcionan con la versión estándar.
- Procedimiento de cuantización no estándar: los archivos Q2_K_L pueden ser más grandes que Q3_K o Q4_K por la conversión de ciertos tensores a Q8_0.
- No se garantiza que el rendimiento se conserve íntegro tras la abliteración, pese a que el autor retiene las primeras capas y los módulos MTP y visual sin modificar.
- La ficha del repositorio tiene 0 descargas y 0 likes, y no aporta información de benchmarks ni validación independiente.
- Uso comercial: la licencia apache-2.0 permite uso comercial del artefacto, pero conviene revisar la licencia y condiciones del modelo base y de las conversiones intermedias (unsloth, ISTA-DASLab, prism-ml, ConwayResearch, ukisai) antes de explotarlo en producción.
- Aviso legal y ético: desplegar contenido sin moderación puede incumplir políticas internas o normativas sectoriales; se recomienda acompañar siempre de revisión humana en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Weirdo333/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Serie Ternary Bonsai: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Underdog-Saluki 27B: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
