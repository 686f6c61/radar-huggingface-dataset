# trithemius/Qwen3.8-27B-heretic-ara-MTP-PrismAura-5.5bit

## Resumen

Este modelo es una cuantización de precisión mixta del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, una variante "decensored" del modelo Qwen3.8-27B de Qwen. La cuantización, denominada **PrismAura 5.5bit**, ha sido generada con la herramienta PrismaQuant y su asignador AURA, que reparte el presupuesto de bits entre cada capa lineal eligiendo entre los formatos NVFP4, FP8_E4M3 y BF16 según la sensibilidad medida por KL-Fisher. El resultado es un modelo de 27.000 millones de parámetros (dense) con un peso comprimido a aproximadamente 5,5 bits por parámetro, optimizado para servirse con vLLM en hardware NVIDIA Blackwell con soporte NVFP4.

La principal innovación es la inclusión de los tensores MTP (multi-token prediction) en BF16, lo que permite usar decodificación especulativa de serie en vLLM, y el mantenimiento del tower de visión en BF16. El modelo conserva el comportamiento del original: una eliminación de los mecanismos de rechazo y seguridad mediante el método ARA (Arbitrary Rank Ablation), lo que lo hace adecuado para roleplaying y escritura creativa sin restricciones, pero también implica que no tiene moderación de contenido integrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense con encoder de visión (Qwen3.8-27B) |
| Parametros totales | 27.000 millones (dense) / 19.030.815.472 según safetensors |
| Parametros activos | no aplica (dense, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4, FP8_E4M3, BF16 (asignación mixta por capa, 5,5 bits/parámetro) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se detalla en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors para vLLM) |

## Arquitectura y entrenamiento

El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` es un fine-tune de Qwen3.8-27B procesado con la herramienta [Heretic](https://github.com/p-e-w/heretic) mediante el método ARA (Arbitrary Rank Ablation), que elimina directamente las direcciones de representación de rechazo y seguridad de los pesos, en lugar de depender de prompts de sistema o ajustes por SFT. Esta variante no ha sido reentrenada para añadir capacidades, sino que modifica el comportamiento de rechazo del modelo original.

La cuantización PrismAura no altera el comportamiento: es una re-encodificación numérica de los mismos pesos en un layout `compressed-tensors` de precisión mixta. El asignador AURA evalúa el efecto de cada par (capa lineal, formato) sobre la distribución de salida usando una métrica KL-Fisher y resuelve un problema de mochila de presupuesto de bits. En este caso se eligió el punto de operación de 5,5 bits/parámetro (fila resaltada en la tabla del autor), que corresponde a un Δloss estimado de 0,00938. La asignación final incluye 254 capas en NVFP4, 181 en FP8_E4M3 y 179 en BF16 (incluyendo el tower de visión con 110 capas y 8 capas MTP en BF16).

## Capacidades

- Generación de texto libre y creativa sin filtros de contenido (roleplaying, narrativa, diálogos).
- Procesamiento de imágenes gracias al encoder de visión integrado (no se detalla si el modelo base soporta entrada multimodal completa, pero el tower de visión está presente).
- Decodificación especulativa de serie gracias a los tensores MTP incluidos en BF16.
- Soporte de tool calling / function calling: no especificado en la información disponible (el modelo base Qwen3.8 podría tenerlo, pero no se confirma).
- Soporte de agentes y multi-step reasoning: no especificado en la información disponible.
- Capacidades multilingües: no detalladas, aunque Qwen3.8 suele ser multilingüe.
- No incluye moderación de contenido ni mecanismos de seguridad.

## Casos de uso

- Roleplaying y narrativa interactiva: el modelo no rechaza contenido explícito, lo que permite generar historias y diálogos sin restricciones temáticas, manteniendo coherencia en contextos largos gracias a su ventana de 262.144 tokens.
- Escritura creativa y guionización: adecuado para generar borradores de novelas, guiones o contenido literario con estilos variados, sin necesidad de eludir filtros.
- Asistente de generación de contenido para juegos de rol (RPG) o mundos virtuales: puede crear personajes, descripciones y diálogos dinámicos.
- Investigación en alineación y seguridad de modelos: al ser una variante decensored, permite estudiar el comportamiento de modelos sin mecanismos de rechazo, aunque debe usarse en entornos controlados.
- Servicio de inferencia de alta eficiencia en hardware Blackwell: gracias a la cuantización NVFP4 y la decodificación especulativa, es adecuado para despliegues con requisitos de latencia bajos en GPUs como B200 o RTX 50.
- Prototipado de aplicaciones de generación de texto sin moderación: para entornos donde se necesita máxima libertad creativa y el control de contenido se delega en una capa externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras comparativas. La única métrica reportada es el Δloss estimado por el asignador AURA (0,00938) en comparación con el modelo original sin cuantizar, que indica una pérdida de calidad esperada muy baja.

## Requisitos de hardware

- GPU: requiere hardware NVIDIA Blackwell con soporte nativo NVFP4 (por ejemplo, B200, GB200, o posiblemente RTX 50 series). No funcionará correctamente en GPUs Ampere o anteriores.
- VRAM estimada: el tamaño del repositorio es de 23,6 GB (pesos cuantizados). Para inferencia con contexto largo (por ejemplo, 32K tokens) se recomienda al menos 32 GB de VRAM, aunque con ventanas más cortas podría caber en 24 GB.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` y `--trust-remote-code`. También se puede usar con TGI si soporta compressed-tensors, pero no está confirmado.
- Latencia y throughput: no disponible. La decodificación especulativa con MTP debería mejorar el throughput en comparación con una decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos. Como referencia cualitativa, se puede comparar con:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262.144 | BF16 | Apache 2.0 | HuggingFace |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | 262.144 | BF16 (probablemente) | Apache 2.0 | HuggingFace |
| Este modelo (PrismAura 5.5bit) | 27B | 262.144 | Mixta 5,5 bits | Apache 2.0 | HuggingFace |

La principal diferencia es el tamaño de los pesos (23,6 GB frente a ~54 GB en BF16) y la optimización para Blackwell.

## Limitaciones y advertencias

- **Contenido sin moderar**: el modelo es decensored y puede generar contenido explícito, violento o NSFW. No incluye filtros de seguridad integrados. Su despliegue debe ir acompañado de políticas de uso y control de acceso.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- **Dependencia de hardware específico**: la cuantización NVFP4 solo es eficiente en GPUs Blackwell. En otro hardware, el modelo podría no cargar o ejecutarse con degradación severa.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa del rendimiento en tareas estándar, lo que dificulta evaluar su calidad frente a alternativas.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; aunque Qwen3.8 es multilingüe, no hay confirmación para esta variante.
- **Uso en producción**: al ser una cuantización de un modelo decensored, cualquier aplicación debe implementar su propia capa de moderación si es necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trithemius/Qwen3.8-27B-heretic-ara-MTP-PrismAura-5.5bit
- Modelo base decensored: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta Heretic (ARA): https://github.com/p-e-w/heretic
- Documentación de vLLM sobre compressed-tensors: no disponible en la información proporcionada.
