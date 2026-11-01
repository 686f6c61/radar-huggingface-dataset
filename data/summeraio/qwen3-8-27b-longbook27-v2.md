# summerAIO/Qwen3.8-27B-Longbook27-v2

## Resumen

Qwen3.8-27B-Longbook27-v2 es un modelo de lenguaje de 27.072.285.696 parámetros (aproximadamente 27B) especializado en comprensión y generación de texto de formato largo: libros, artículos científicos e informes extensos. Lo publica el usuario summerAIO en HuggingFace y se presenta como una versión refinada (v2) de un modelo anterior, con mejoras en comportamiento y calidad de salida. La licencia declarada es Apache 2.0, con la salvedad de que el autor remite a la licencia del modelo base Qwen.

La característica técnica más relevante es su arquitectura personalizada `qwen3_5_gdn24`, que incorpora capas de atención lineal Gated DeltaNet en un esquema híbrido. Esto lo aleja del transformer denso convencional y lo orienta a entradas de escala libro, donde el coste cuadrático de la atención estándar resulta prohibitivo. El modelo se distribuye como código remoto dentro del repositorio, por lo que requiere `trust_remote_code=True` para cargarse.

Es relevante ahora porque cubre un nicho concreto —resumen y QA sobre documentos muy largos— con un tamaño que cabe en una GPU de 24 GB si se cuantiza a 4 bits (NF4, unos 17 GB) y que en bf16 ocupa unos 54 GB, apto para A100 80GB o H100. Su soporte de idiomas declarado se limita a inglés y japonés, y el repositorio ocupa 54,2 GB en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5_gdn24` (código personalizado), híbrida con capas de atención lineal Gated DeltaNet |
| Parámetros totales | 27.072.285.696 (~27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card indica "long-context" y entradas de escala libro, sin cifra concreta) |
| Tipos de cuantización | bf16 nativo; 4-bit NF4 con bitsandbytes (double quant) documentado por el autor |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | apache-2.0 (el autor remite a la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (bf16, ~54 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura personalizada denominada `qwen3_5_gdn24`, definida en los ficheros `modeling_qwen35_gdn24.py` y `fused_ops.py` del propio repositorio. Se trata de un diseño híbrido que combina capas de atención lineal Gated DeltaNet con el resto de la pila, una elección orientada a reducir el coste computacional y de memoria en secuencias muy largas frente a la atención cuadrática clásica. El autor ofrece kernels opcionales de aceleración mediante `flash-linear-attention` y `causal-conv1d`; sin ellos el modelo sigue funcionando con una implementación de referencia en PyTorch más lenta.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card únicamente indica que es un modelo afinado ("fine-tuned") sobre un modelo base Qwen y que la versión 2 mejora el comportamiento y la calidad de salida respecto a la v1. La plantilla de chat es de estilo ChatML e incluye el parámetro `enable_thinking` para activar razonamiento previo a la respuesta.

## Capacidades

- Generación de texto de formato largo: resúmenes y continuación de libros, artículos e informes extensos.
- Comprensión de documentos largos con preguntas y respuestas sobre el contenido ("question answering over long documents").
- Escritura de formato largo y continuación de texto ("long-form writing and continuation").
- Modo de razonamiento opcional mediante `enable_thinking=True` en la plantilla de chat, a costa de generar más tokens.
- Decodificación greedy recomendada por el autor para resúmenes y QA; muestreo con `temperature=0.7, top_p=0.8, top_k=20` para escritura creativa.
- Capacidades multilingües limitadas a inglés y japonés según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Resumen de libros capítulo a capítulo: el modelo está diseñado para recibir el texto completo de una obra y producir resúmenes estructurados, con instrucciones explícitas de ceñirse a los hechos del texto y decodificación greedy para maximizar la fidelidad.
- QA sobre documentación técnica extensa: útil para consultar manuales, especificaciones o informes de cientos de páginas sin trocear el documento, aprovechando su orientación a contexto largo.
- Análisis de artículos científicos: extracción de contribuciones, metodología y resultados de papers largos en una sola pasada, con modo thinking activado para preguntas complejas.
- Generación de informes extensos: redacción y continuación de documentos de formato largo donde se requiere coherencia a lo largo de miles de tokens.
- Localización EN-JA de contenido editorial: al cubrir inglés y japonés, puede emplearse en tareas de resumen y reescritura entre ambos idiomas, aunque no se documenta calidad de traducción.
- Procesamiento por lotes en una sola GPU de 24 GB: con cuantización NF4 (unos 17 GB), es viable desplegar el modelo en estaciones de trabajo con RTX 4090 o similares para pipelines de resumen nocturnos.
- Asistencia editorial con verificación humana: generación de borradores de resumen que un editor contrasta contra el original, dado el riesgo documentado de añadir detalles no presentes en la fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 54 GB, según la model card. Requiere A100 80GB, H100 o GPUs de clase similar.
- VRAM en 4-bit NF4: aproximadamente 17 GB, lo que permite ejecución en GPUs de 24 GB (por ejemplo, RTX 4090, RTX 3090, A10G, L4 de 24 GB).
- El autor indica que el modelo completo debe cargarse en la GPU: la descarga a CPU ("CPU offloading") no está soportada por los kernels personalizados y falla con `Tensor on device meta`.
- Dependencias: `transformers`, `accelerate` y `bitsandbytes` para cuantización; opcionalmente `flash-linear-attention` y `causal-conv1d` (este último con `--no-build-isolation`) para acelerar las capas de atención lineal.
- Opciones de despliegue documentadas: únicamente `transformers` con `AutoModelForCausalLM` y `device_map={"": 0}`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de código remoto con kernels propios hace probable que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones verificables de los modelos base Qwen a los que el autor hace referencia, por lo que la comparación se limita a los datos publicados de este modelo.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Longbook27-v2 | ~27B | no disponible | apache-2.0 | safetensors (bf16) | Arquitectura híbrida Gated DeltaNet, código remoto obligatorio, EN/JA |
| Modelo base Qwen (referenciado por el autor) | no disponible | no disponible | la del base Qwen | no disponible | El autor remite a su licencia sin especificar versión |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- El uso de memoria crece con la longitud de entrada, según advierte el propio autor; no hay cifra de contexto máxima publicada.
- Riesgo de alucinación documentado: los resúmenes pueden añadir detalles que no están en el texto fuente, por lo que el autor recomienda verificar contra el original.
- `trust_remote_code=True` es obligatorio y ejecuta código del repositorio (`modeling_qwen35_gdn24.py`, `fused_ops.py`). En entornos sensibles conviene revisar ese código y fijar una `revision` concreta.
- No se admite CPU offloading: los kernels personalizados fallan con `Tensor on device meta`, lo que restringe el despliegue a GPUs con VRAM suficiente.
- Idiomas limitados a inglés y japonés; no se declara soporte de español ni de otros idiomas.
- La licencia Apache 2.0 declarada queda matizada por la afirmación del autor de que el modelo sigue la licencia del base Qwen; conviene verificar la procedencia y los términos aplicables antes de un uso comercial.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El identificador del modelo aparece de forma inconsistente en la model card (`summerMC/Qwen3.8-27B-Longbook27-v2`) frente al ID del repositorio (`summerAIO/Qwen3.8-27B-Longbook27-v2`), lo que puede provocar errores al copiar el código de ejemplo.
- Sin soporte documentado de tool calling ni de motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita su uso en producción a gran escala.

## Enlaces

- HuggingFace: https://huggingface.co/summerAIO/Qwen3.8-27B-Longbook27-v2
- Repositorio de código remoto incluido en el modelo: `modeling_qwen35_gdn24.py`, `fused_ops.py` (dentro del repositorio de HuggingFace)
- Dependencia opcional de kernels de atención lineal: `flash-linear-attention` (paquete pip)
- Dependencia opcional de convolución causal: `causal-conv1d` (paquete pip)
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
