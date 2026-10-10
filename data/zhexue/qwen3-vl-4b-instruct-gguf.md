# zhexue/Qwen3-VL-4B-Instruct-GGUF

## Resumen

Esta ficha describe `zhexue/Qwen3-VL-4B-Instruct-GGUF`, una publicación de pesos en formato GGUF del modelo multimodal `Qwen/Qwen3-VL-4B-Instruct`, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio no aporta un modelo nuevo: es una conversión de cuantización realizada por un tercero (el usuario `zhexue`) para permitir la inferencia del modelo original en herramientas basadas en GGUF como llama.cpp, Ollama o LM Studio, tanto en CPU como en GPU NVIDIA, Apple Silicon o Intel.

El modelo subyacente es un transformer denso de visión-lenguaje de aproximadamente 4.022 millones de parámetros, que combina un codificador visual tipo ViT con un decodificador de lenguaje. Está diseñado para tareas de imagen-a-texto y vídeo-a-texto, con especial énfasis en percepción espacial, OCR multilingüe, comprensión de vídeo de larga duración y uso como agente visual capaz de operar interfaces gráficas. La model card declara un contexto nativo de 256K tokens ampliable hasta 1M.

Su relevancia práctica reside en el empaquetado: al ofrecer cuantizaciones FP16, Q8_0 y Q4_K_M del modelo de lenguaje y FP16/Q8_0 del codificador visual (`mmproj`), permite ejecutar un modelo multimodal de 4B en hardware de consumo, algo que los pesos originales en safetensors dificultan. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (codificador ViT + decodificador de lenguaje) con Interleaved-MRoPE, DeepStack y alineación texto-timestamp |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256K nativo, ampliable a 1M según la model card de Qwen3-VL |
| Tipos de cuantizacion | LLM: FP16, Q8_0, Q4_K_M; codificador visual (mmproj): FP16, Q8_0 |
| Idiomas soportados | no disponible en los metadatos; la model card indica soporte de OCR en 32 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), dividido en pesos de LLM y fichero `mmproj` para la parte visual |
| Tamano del repositorio | 16,1 GB (incluye todas las variantes de cuantización publicadas) |
| Pipeline | image-text-to-text |
| Libreria declarada | transformers |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3-VL, un modelo vision-language con un codificador visual tipo ViT acoplado a un decodificador transformer denso. La model card del modelo base destaca tres innovaciones técnicas: Interleaved-MRoPE, que distribuye las frecuencias posicionales sobre los ejes temporal, de anchura y de altura para mejorar el razonamiento sobre vídeo de horizonte largo; DeepStack, que fusiona características ViT de varios niveles para afinar el detalle fino y la alineación imagen-texto; y la alineación texto-timestamp, que sustituye el esquema T-RoPE por una localización temporal precisa de eventos en vídeo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información proporcionada. La model card menciona un preentrenamiento visual "más amplio y de mayor calidad" orientado al reconocimiento de celebridades, anime, productos, puntos de referencia y flora y fauna, así como una ampliación del OCR de 19 a 32 idiomas. Tampoco se documenta si hubo destilación o ajuste específico para la variante de 4B.

Conviene subrayar que esta ficha corresponde a una cuantización de terceros, no a un entrenamiento nuevo: los pesos son una transformación de los originales de Qwen, por lo que cualquier degradación respecto al modelo base proviene exclusivamente de la pérdida de precisión numérica de cada cuantización.

## Capacidades

- Generación de texto e imágenes-a-texto, con comprensión de texto a la par de modelos de lenguaje puros según la model card.
- Razonamiento multimodal en áreas STEM y matemáticas, con análisis causal y respuestas basadas en evidencia visual.
- OCR robusto en 32 idiomas, tolerante a poca luz, desenfoque e inclinación, incluyendo caracteres poco frecuentes o antiguos y jerga técnica.
- Comprensión de vídeo de larga duración, con indexación a nivel de segundo y recuperación completa sobre vídeos de horas.
- Percepción espacial avanzada: juicio de posiciones, puntos de vista y oclusiones, con grounding 2D y 3D para razonamiento espacial e IA encarnada.
- Agente visual: reconocimiento de elementos de interfaces de PC y móvil, comprensión de su función e invocación de herramientas para completar tareas.
- Generación de código visual: producción de diagramas Draw.io y de HTML, CSS y JavaScript a partir de imágenes o vídeos.
- Reconocimiento visual amplio de entidades: personajes, productos, monumentos, especies.
- Soporte declarado de tool calling y de interacción agéntica dentro del ecosistema Qwen3-VL.
- Parámetros de generación recomendados en la model card: modo VL con top_p 0.8, top_k 20, temperatura 0.7, presence_penalty 1.5 y 16.384 tokens de salida; modo texto con top_p 1.0, top_k 40, temperatura 1.0, presence_penalty 2.0 y 32.768 tokens de salida.

## Casos de uso

- Digitalización de documentos y OCR multilingüe: extracción de texto de facturas, contratos o formularios escaneados en cualquiera de los 32 idiomas soportados, con tolerancia a escaneos torcidos o de baja calidad y capacidad de reconstruir la estructura de documentos largos.
- Automatización de interfaces gráficas: como agente visual, el modelo puede identificar botones, campos y menús en capturas de pantalla de escritorio o móvil y encadenar acciones para completar flujos repetitivos de back office.
- Análisis de vídeo de vigilancia o de procesos industriales: la indexación temporal a nivel de segundo y el contexto de 256K permiten localizar eventos concretos en grabaciones de horas sin segmentar previamente el vídeo.
- Generación de front-end a partir de maquetas: a partir de una imagen de diseño o de una captura de una web de referencia, el modelo produce HTML, CSS y JavaScript, o diagramas Draw.io, lo que acelera el prototipado en equipos de producto.
- Asistente de accesibilidad: descripción de escenas, lectura de carteles o etiquetas y respuesta a preguntas sobre el entorno a partir de la cámara de un dispositivo, con la ventaja de poder ejecutarse en local sin enviar imágenes a servicios externos.
- Razonamiento sobre documentación técnica: combinación de gráficos, ecuaciones y texto en manuales o artículos científicos dentro de una misma ventana de contexto, útil para ingeniería y análisis financiero.
- Robótica y sistemas encarnados: el grounding 2D y 3D permite convertir instrucciones en lenguaje natural en referencias espaciales sobre objetos, un paso previo a la planificación de manipulación.
- Despliegue en entornos sin GPU: al existir cuantizaciones Q4_K_M y Q8_0 en formato GGUF, es viable integrarlo en portátiles o servidores sin acelerador para tareas de clasificación y descripción de imágenes por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en formato numérico dentro de la información disponible. La model card del modelo base incluye dos gráficas comparativas (rendimiento multimodal y rendimiento en texto puro) para las variantes 4B y 8B en modo Instruct, pero los valores concretos no son legibles como texto en la información proporcionada, por lo que no se reproducen aquí.

No se dispone tampoco de mediciones de rendimiento específicas de las cuantizaciones GGUF de este repositorio (calidad frente a FP16, latencia o throughput), más allá de la afirmación general de compatibilidad con llama.cpp y Ollama.

## Requisitos de hardware

Estimaciones orientativas a partir del recuento de parámetros declarado (4,02 B) y del tamaño del repositorio; no proceden de mediciones publicadas en la información disponible.

- Q4_K_M: aproximadamente 2,5-3 GB para el LLM más el `mmproj` en Q8_0, en torno a 3,5-4 GB de VRAM o memoria unificada. Es la opción que cabe en la mayoría de GPU de consumo actuales.
- Q8_0: aproximadamente 4,3-4,5 GB para el LLM más el codificador visual, alrededor de 5-6 GB en total.
- FP16: aproximadamente 8 GB para el LLM más el `mmproj`, en torno a 9-10 GB en total; requiere tarjetas de 12 GB o superiores, o memoria unificada de Apple Silicon.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090 para las cuantizaciones altas; A100 y H100 quedan sobredimensionadas para un modelo de 4B, salvo por necesidades de concurrencia.
- Compatibilidad con GPU de consumo: sí, especialmente en Q4_K_M y Q8_0; también en Apple Silicon con Metal y en iGPU Intel vía SYCL.
- Opciones de despliegue: llama.cpp (incluido `llama-server`), Ollama, LM Studio y otras herramientas basadas en GGUF. vLLM y TGI no son la vía natural para pesos GGUF multimodales; para esos frameworks conviene usar los safetensors originales de `Qwen/Qwen3-VL-4B-Instruct`.
- Latencia y throughput: no disponible.
- Advertencia de memoria: aunque el contexto nativo sea de 256K, la caché KV a esa longitud puede superar con holgura la VRAM disponible en GPU de consumo, incluso con cuantizaciones agresivas; en la práctica conviene limitar el contexto real a unos pocos miles o decenas de miles de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| zhexue/Qwen3-VL-4B-Instruct-GGUF (esta ficha) | 4,02 B | 256K nativo, 1M ampliable | Sí (imagen y vídeo) | Apache 2.0 | GGUF (FP16, Q8_0, Q4_K_M) en HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4,02 B | 256K nativo, 1M ampliable | Sí (imagen y vídeo) | Apache 2.0 | safetensors en HuggingFace |
| Qwen2.5-VL-3B-Instruct (generación anterior) | no disponible en la información aportada | no disponible | Sí | Apache 2.0 | safetensors y múltiples cuantizaciones de terceros |
| Qwen2.5-VL-7B-Instruct (generación anterior) | no disponible en la información aportada | no disponible | Sí | Apache 2.0 | safetensors y múltiples cuantizaciones de terceros |

La comparación se limita a los aspectos verificables en la información disponible. No se aportan cifras comparativas de rendimiento porque la model card no las presenta en formato numérico legible. La diferencia funcional más relevante entre esta publicación y el modelo base no es de capacidad, sino de despliegue: el formato GGUF habilita CPU, Apple Silicon y GPU modestas, a cambio de una posible pérdida de precisión que depende de la cuantización elegida.

## Limitaciones y advertencias

- Se trata de una cuantización de terceros sin respaldo oficial del equipo Qwen; la responsabilidad sobre la fidelidad de la conversión recae en el publicador del repositorio.
- Las cuantizaciones Q4_K_M, y en menor medida Q8_0, pueden degradar tareas sensibles a la precisión numérica, como el grounding espacial fino, el OCR de caracteres poco frecuentes o el razonamiento matemático. No se han publicado evaluaciones de esta degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje y acentuado en tareas visuales ambiguas: descripciones de objetos ausentes, lectura errónea de texto pequeño o atribución incorrecta de posiciones.
- Aunque el contexto declarado es de 256K, la ventana efectiva en hardware de consumo está limitada por la memoria de la caché KV; no debe asumirse el rendimiento a 256K en una GPU de gama media.
- Los idiomas soportados no están documentados en los metadatos del repositorio; solo se declara soporte de OCR en 32 idiomas, sin especificar cuáles ni la calidad relativa por idioma.
- La licencia del modelo base es Apache 2.0, permisiva para uso comercial, pero conviene verificar que los términos se mantienen en esta redistribución y revisar las condiciones del ecosistema Qwen para despliegues a gran escala.
- Ausencia total de tracción en el repositorio (0 descargas y 0 likes en el momento de la consulta) y de historial de actualizaciones, lo que reduce la garantía de mantenimiento.
- El uso como agente visual sobre interfaces reales implica riesgos operativos: acciones irreversibles ejecutadas por error, exposición de datos en pantalla y necesidad de salvaguardas externas.
- Las fechas de creación y actualización registradas son idénticas, de modo que no hay evidencia de revisiones posteriores de los ficheros publicados.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/zhexue/Qwen3-VL-4B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Chat oficial de Qwen: https://chat.qwenlm.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Diagrama de arquitectura citado en la model card: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
- Gráfica de rendimiento multimodal 4B/8B: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_4b_8b_vl_instruct.jpg
- Gráfica de rendimiento en texto puro 4B/8B: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_4b_8b_text_instruct.jpg
