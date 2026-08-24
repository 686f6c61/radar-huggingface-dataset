# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.4

## Resumen

El modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.4` es una variante del modelo multimodal Gemma 4 26B A4B de Google DeepMind, ajustada con datos en chino tradicional por la organización TAIDE y posteriormente modificada mediante la técnica de **abliteración** (eliminación de la dirección de rechazo) con una intensidad de 0,4. El resultado es un modelo que mantiene las capacidades de razonamiento, generación de texto y comprensión de imágenes de la base, pero con una tendencia significativamente reducida a rechazar peticiones por motivos de seguridad.

El modelo está pensado para entornos de investigación y aplicaciones donde se requiere una respuesta sin filtros de contenido, aunque el autor advierte que el usuario debe asumir la responsabilidad de implementar sus propios mecanismos de protección. Es un modelo de tipo MoE con 25.805.933.872 parámetros totales y 4.000 millones de parámetros activos por token (A4B), lo que permite una inferencia relativamente eficiente pese a su tamaño total. El contexto máximo no se especifica en la información disponible.

La relevancia actual radica en que combina la arquitectura multimodal de Gemma 4 con un ajuste fino para chino tradicional y una eliminación de restricciones de contenido, lo que lo hace interesante para aplicaciones de generación de texto libre, análisis de imágenes y desarrollo de agentes en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, con 128 expertos y atención sobre visión y texto |
| Parametros totales | 25.805.933.872 |
| Parametros activos | 4.000.000.000 (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF (ver repositorio asociado) |
| Idiomas soportados | chino (zh), especialmente chino tradicional; el modelo base Gemma 4 es multilingüe |
| Licencia | Apache-2.0 + Gemma 4 License + TAIDE License (con restricciones de uso) |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Gemma 4 26B A4B**, un transformer multimodal con una mezcla de expertos (MoE) que activa 4.000 millones de parámetros por token, manteniendo un total de 26.000 millones. La parte visual está integrada en el modelo base, permitiendo entradas de imágenes y texto para generar texto de salida. El ajuste fino se realizó sobre el modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, que a su vez es un fine-tune del modelo `google/gemma-4-26B-A4B-it` con datos de TAIDE para chino tradicional.

La técnica de abliteración aplicada sigue el método de Arditi et al. (2024), que consiste en eliminar la dirección de rechazo del espacio residual mediante ortogonalización de pesos. Se aplicó sobre las capas de token embedding, atención `o_proj`, la proyección densa `down_proj` y las proyecciones `down_proj` de los 128 expertos MoE, con un coeficiente de intensidad de 0,4. No se realizó ningún reentrenamiento, solo una modificación directa de los pesos, y la torre de visión se mantuvo intacta.

## Capacidades

- Generación de texto y respuesta a instrucciones en chino tradicional (y otros idiomas, aunque el ajuste se centra en zh-TW).
- Comprensión de imágenes: entrada multimodal (imagen y texto) para generar descripciones o respuestas sobre contenido visual.
- Razonamiento y resolución de problemas: el modelo base Gemma 4 está optimizado para razonamiento y tareas de código, aunque no se han publicado métricas específicas para esta variante.
- Capacidad de tool calling y agentes: no se detalla explícitamente, pero la arquitectura Gemma 4 soporta estas funcionalidades; la información no lo confirma.
- Ausencia de filtros de seguridad: al ser abliterado, no rechaza peticiones sensibles, lo que permite respuestas sin restricciones de contenido.
- Multimodalidad: procesa entradas de imagen y texto, pero solo genera salida de texto.

## Casos de uso

- **Generación de contenido creativo sin restricciones**: el modelo puede usarse para escribir cuentos, guiones o contenido narrativo que aborde temas sensibles sin eludir la censura, útil para autores o investigadores de narrativa.
- **Análisis de texto histórico y literario en chino tradicional**: gracias a su ajuste en TAIDE, puede procesar y generar textos en chino clásico o tradicional, ayudando a tareas de traducción o transcripción de documentos históricos.
- **Desarrollo de agentes conversacionales personalizados**: al no tener filtros de seguridad, se puede configurar un chatbot para entornos donde se requiere una respuesta directa sin evasivas, como simulaciones de entrevistas o entrenamiento de habilidades comunicativas.
- **Investigación en alineación y seguridad de IA**: el modelo es un ejemplo de abliteración aplicada, por lo que puede usarse para estudiar los efectos de eliminar las capas de rechazo en modelos MoE, comparando su comportamiento con la versión original.
- **Generación de código y automatización**: la base Gemma 4 tiene capacidades de programación, y el modelo puede emplearse en pipelines de generación de código donde se necesite una respuesta sin limitaciones de contexto (por ejemplo, en herramientas de autocompletado).
- **Procesamiento de imágenes con descripción libre**: al conservar la torre de visión, puede generar descripciones de imágenes sin censura de contenido, útil en aplicaciones de análisis de contenido visual sin restricciones editoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante específica. El modelo base Gemma 4 26B A4B ha sido evaluado en tareas de razonamiento, código y visión, pero los datos de rendimiento para la versión abliterada con ajuste TAIDE no se han divulgado.

## Requisitos de hardware

- **VRAM estimada**: para la versión bf16 (safetensors), el peso del modelo es de aproximadamente 51,6 GB, por lo que se necesitan al menos 60 GB de VRAM para cargar el modelo completo (considerando memoria adicional para activaciones y buffers). Para la versión GGUF, se pueden usar cuantizaciones de 4 bits, reduciendo la VRAM a unos 15-20 GB.
- **GPU recomendadas**: para la versión completa, se requiere una GPU con 80 GB de VRAM, como una A100, H100, o una configuración multi-GPU (p. ej., dos RTX 4090 con NVLink). Para cuantizaciones 4-bit, una RTX 4090 de 24 GB o una RTX 3090 pueden ser suficientes.
- **Compatibilidad con GPU de consumo**: sí, con cuantización GGUF de 4 bits se puede ejecutar en GPUs de 24 GB, aunque con menor velocidad.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y otros frameworks compatibles con safetensors y MoE.
- **Latencia y throughput**: no se han publicado datos específicos, pero al ser un modelo MoE con solo 4B activos, la velocidad de inferencia es considerablemente mayor que un modelo denso de 26B, aunque la carga de pesos totales limita la cantidad de memoria.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento para este modelo concreto. A modo de referencia, se puede comparar con la versión original sin abliterar y con otros modelos de chino tradicional:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-abliterated-s0.4 (este) | 26B total, 4B activos | no disponible | Imagen + texto | Apache-2.0 + Gemma 4 + TAIDE | Abliterado, ajuste chino tradicional |
| Gemma-4-26B-A4B-TAIDE-zhTW (base) | 26B total, 4B activos | no disponible | Imagen + texto | Apache-2.0 + Gemma 4 + TAIDE | Con filtros de seguridad |
| Llama-3-70B-TAIDE | 70B total | 128k | Texto | TAIDE License | Modelo denso, solo texto, sin abliteración |

La comparación directa de rendimiento no es posible por falta de benchmarks públicos.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo hereda los sesgos del conjunto de datos de entrenamiento de Gemma 4 y del ajuste TAIDE, que pueden reflejar estereotipos culturales o de género.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en temas sensibles.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el modelo base de Gemma 4 y la derivación de TAIDE imponen condiciones adicionales. El autor indica que no se puede usar para fines militares o ilegales, y debe cumplir con la legislación de Taiwán y la EU AI Act.
- **Uso responsable**: al ser abliterado, el modelo puede generar contenido dañino, ofensivo o ilegal. El usuario es responsable de implementar su propio sistema de filtrado y de asegurar el cumplimiento legal.
- **Limitaciones de idioma**: el ajuste está especializado en chino tradicional, por lo que el rendimiento en otros idiomas puede ser inferior al del modelo base.
- **Contexto de entrada**: no se ha especificado la longitud máxima de contexto, por lo que para aplicaciones de producción se debe probar empíricamente.

## Enlaces

- [HuggingFace: xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.4](https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.4)
- [HuggingFace: versión GGUF](https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.4-GGUF)
- [HuggingFace: modelo base sin abliterar](https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW)
- [Página oficial de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 26B A4B IT en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
