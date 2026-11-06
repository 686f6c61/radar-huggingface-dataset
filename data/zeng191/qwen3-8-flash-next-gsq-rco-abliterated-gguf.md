# zeng191/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una compilación en formato GGUF de un modelo multimodal de tipo image-text-to-text, publicado por el usuario zeng191 sobre las cuantizaciones oficiales del ISTA-DASLab. El modelo parte de Qwen3.8-Flash-Next, un transformer de arquitectura Mixture-of-Experts (MoE) con 176.943.899.520 parámetros totales, y aplica una modificación de tipo "abliterated": se sustituyen 144 tensores de proyección de escritura al stream residual a lo largo de las 48 capas por los de una versión ya abliterada, eliminando la dirección de rechazo sin recalcular los tensores cuantizados aprendidos por GSQ.

La relevancia técnica de esta ficha no está en el modelo base, sino en el procedimiento: se trata de un transplante de tensores sobre un modelo ya cuantizado, preservando intactos los valores y escalas aprendidos por GSQ (learned quantization) y restaurando exactamente la asignación de tipos por tensor del upstream (RCO, budget-constrained type assignment). El resultado son cuatro niveles de cuantización —IQ3_S, IQ3_XXS, IQ2_XS y Q2_0— con un sobrecoste de solo 0,25 a 0,44 GB respecto al modelo original.

El modelo conserva la ventana de contexto de 262.144 tokens del upstream y está orientado a tareas de razonamiento, red-teaming y generación de código, con soporte de inglés y chino. La licencia es Apache 2.0. Su publicación es reciente (noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Tamaño del repo | 217,9 GB |
| Tamaño por cuantización | Q2_0: 38,0 GB; IQ3_S: 55,1 GB (resto de niveles no disponible) |
| Verificación | blake2b por tensor en la build IQ3_S |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de 48 capas y 176.943.899.520 parámetros totales. No se dispone de información sobre el número de parámetros activos por token, la ratio de expertos ni la composición del dataset de entrenamiento en la información proporcionada. Tampoco se documenta si el entrenamiento incluyó RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

La innovación técnica de esta compilación concreta es el procedimiento de abliteración sobre pesos ya cuantizados. En lugar de recalcular la cuantización GSQ (learned quantization) tras eliminar la dirección de rechazo, se sustituyen 144 tensores de proyección de escritura al stream residual en las 48 capas por los tensores equivalentes de una release abliterada ya existente, dejando intactos los valores y escalas aprendidos por GSQ y restaurando la asignación de tipos por tensor del esquema RCO. La build IQ3_S incluye verificación blake2b tensor a tensor para confirmar que solo cambiaron los tensores previstos. El modelo base incorpora además decodificación con ventana de contexto larga (262K tokens) y capacidades multimodales de entrada image-text.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte declarado de modo "reasoning" en las etiquetas del modelo.
- Procesamiento de entrada multimodal image-text-to-text (pipeline declarado en la model card).
- Generación de código y matemáticas: no se documenta explícitamente en la información disponible, pero las etiquetas de razonamiento y el tamaño del modelo son compatibles con estos usos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Modelo "abliterated": se ha eliminado la dirección de rechazo, por lo que no aplica el comportamiento de rechazo estándar del modelo original.
- Contexto largo de hasta 262.144 tokens.
- Orientado a red-teaming según las etiquetas del autor.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo está explícitamente etiquetado para esta tarea y, al ser abliterated, permite generar respuestas que el modelo original rechazaría, lo que facilita la construcción de conjuntos de pruebas adversarios y la auditoría de filtros de seguridad en pipelines propios.
- Investigación sobre abliteración y cuantización: el repositorio documenta el transplante de 144 tensores y la verificación blake2b, por lo que sirve como referencia reproducible para estudiar cómo afecta la eliminación de la dirección de rechazo a un modelo ya cuantizado con GSQ.
- Procesamiento de documentos largos en inglés o chino: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos en una sola pasada sin fragmentación.
- Análisis de imágenes con texto asociado: el pipeline image-text-to-text permite describir, resumir o extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Despliegue en hardware de gama alta con llama.cpp: las builds IQ3_S (55,1 GB) e IQ2_XS permiten ejecutar un MoE de 176.900 millones de parámetros en estaciones con suficiente VRAM o en configuraciones con offload parcial a CPU.
- Generación de código en entornos controlados: aunque no se documenta soporte explícito de tool calling, el modelo puede integrarse en asistentes de programación locales donde se requiera ejecución offline y sin dependencia de APIs externas.
- Experimentación con cuantizaciones de bajo bit: las builds Q2_0 (38,0 GB) e IQ2_XS permiten comparar la degradación de calidad frente a IQ3_S en un modelo MoE grande, útil para calibrar presupuestos de memoria en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 GB para la build Q2_0 y 55 GB para IQ3_S, sin contar el overhead de contexto KV; los niveles IQ3_XXS e IQ2_XS se sitúan entre ambos, aunque su tamaño exacto no está disponible.
- GPU recomendadas: para IQ3_S se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) o varias GPU consumer agregadas; para Q2_0 es viable en configuraciones de 48 GB (A6000, RTX 6000 Ada) o en RTX 4090 con offload parcial.
- ¿Cabe en consumer GPU? Q2_0 no cabe íntegramente en una RTX 4090 (24 GB) sin offload a CPU; IQ3_S tampoco. Con llama.cpp y offload parcial a RAM del sistema es posible ejecutar ambas builds en equipos de escritorio con 64-128 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros frontends compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo sin conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zeng191/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9 B (MoE) | 262.144 | Apache 2.0 | GGUF | Abliterated, multimodal, cuantización GSQ preservada |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9 B (MoE) | 262.144 | Apache 2.0 | GGUF | Modelo base sin abliterar; referencia directa |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9 B (MoE) | 262.144 | Apache 2.0 | GGUF | Release abliterada referenciada en la model card; origen de los tensores transplantados |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~177 B) en la documentación proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, se ha eliminado la dirección de rechazo: puede producir contenido que el modelo original filtraría, lo que exige moderación externa en cualquier despliegue orientado al usuario final.
- Riesgo de alucinación: no cuantificado en la información disponible; el tamaño del modelo y la ventana de contexto largo no eliminan este riesgo.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano, por lo que el rendimiento en español no está garantizado.
- El procedimiento de abliteración se aplica sobre pesos ya cuantizados: aunque la build IQ3_S está verificada tensor a tensor, no se documenta una evaluación de calidad diferencial entre las builds abliteradas y el upstream.
- La licencia Apache 2.0 permite uso comercial, pero el carácter abliterated puede entrar en conflicto con políticas de aceptación de uso en plataformas y con requisitos regulatorios locales.
- El tamaño del repo (217,9 GB) y de las builds individuales (38-55 GB) hace inviable su distribución en entornos con ancho de banda o almacenamiento limitados.
- No hay datos publicados de benchmarks ni de evaluación de sesgos, por lo que no es posible validar su calidad frente a alternativas no abliteradas.
- El modelo base pertenece a una familia (Qwen3.8-Flash-Next) cuya documentación oficial no se incluye en la información proporcionada; conviene consultar la model card del upstream para conocer limitaciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/zeng191/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Release abliterada referenciada (SC117): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (referencia arXiv): https://arxiv.org/abs/2604.18556
- Paper RCO (referencia arXiv): https://arxiv.org/abs/2605.00649
