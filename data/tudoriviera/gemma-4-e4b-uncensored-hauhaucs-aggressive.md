# tudoriviera/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una variante "uncensored" (abliterated) del modelo oficial google/gemma-4-e4b-it, publicada por el usuario tudoriviera en HuggingFace y desarrollada originalmente por HauhauCS. El modelo elimina los mecanismos de rechazo del modelo base mediante la técnica de abliteration, manteniendo intactas las capacidades originales de Gemma 4 E4B-IT: generación de texto, razonamiento, código, matemáticas y procesamiento multimodal (imagen, video y audio). La variante "Aggressive" aplica un uncensoring más fuerte, de modo que el modelo no rechaza ninguna instrucción y genera siempre el contenido solicitado, aunque puede añadir breves avisos heredados del entrenamiento base.

Con 7.518.069.290 parámetros totales según los pesos safetensors (el nombre sugiere 4B efectivos, probablemente una arquitectura MoE), 131K de contexto y atención mixta con ventana deslizante de 512, este modelo está pensado para entornos de desarrollo e investigación donde se requiere una generación sin filtros de seguridad. Se distribuye en formato GGUF con múltiples cuantizaciones optimizadas mediante imatrix, incluyendo los custom quants K_P de HauhauCS, y es compatible con llama.cpp, LM Studio, Jan y koboldcpp. Su relevancia radica en ofrecer una alternativa completamente funcional y sin restricciones para casos de uso que demandan libertad total de generación, aunque con los riesgos éticos y legales asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención mixta (sliding window de 512 + full attention), 42 capas, 18 capas KV compartidas |
| Parametros totales | 7.518.069.290 (según safetensors) |
| Parametros activos | no disponible (el nombre "E4B" sugiere 4B efectivos, probablemente MoE, pero no se confirma) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, más mmproj f16 para visión/audio |
| Idiomas soportados | inglés (en), multilingüe (según tags) |
| Licencia | Gemma (license: gemma) |
| Formato de pesos | GGUF (con mmproj para multimodal) y safetensors (presente en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 E4B-IT, un transformer multimodal que combina atención con ventana deslizante (sliding window de 512 tokens) y atención completa en capas alternas, con 42 capas en total y 18 capas de KV compartidas para reducir el uso de memoria en contexto largo. Es nativamente multimodal: procesa texto, imagen, video y audio mediante un proyector multimodal (mmproj) que se distribuye junto al GGUF principal. El entrenamiento original de Gemma 4 E4B-IT incluye técnicas de alineación similares a las de NVIDIA GenRM, con modelos de recompensa generativos que actúan como críticos internos, lo que dificulta el uncensoring efectivo.

La variante uncensored se ha obtenido mediante abliteration, una técnica que elimina selectivamente las direcciones de los pesos responsables de los comportamientos de rechazo, sin modificar el dataset ni las capacidades del modelo. Según la model card, el resultado es un modelo que no rechaza ninguna instrucción (0/465 refusals en pruebas manuales) y que conserva el 100% de las funcionalidades originales. No se han publicado detalles sobre el proceso de entrenamiento adicional, como datos utilizados o pasos de RLHF/DPO; la abliteration se aplica directamente sobre los pesos del modelo base.

## Capacidades

- Generación de texto sin restricciones: el modelo no rechaza ninguna instrucción, incluyendo contenido explícito, controvertido o sensible, y siempre genera una respuesta completa.
- Multimodal nativo: procesa imágenes, video y audio además de texto, gracias al proyector mmproj incluido en la distribución GGUF.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del modelo base Gemma 4 E4B-IT, que incluyen razonamiento lógico, comprensión lectora y seguimiento de instrucciones complejas.
- Generación de código y matemáticas: el modelo base está entrenado para tareas de programación y cálculo, y estas capacidades se mantienen intactas tras la abliteration.
- Conversación multi-turno: soporta diálogos largos con contexto de hasta 131K tokens, adecuado para aplicaciones de chatbot y asistencia.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible, aunque es probable que el modelo base lo soporte; no se puede confirmar.
- Multilingüe: el modelo declara soporte para múltiples idiomas, aunque el énfasis principal está en inglés.

## Casos de uso

- Generación creativa sin filtros: escritores y artistas pueden usar el modelo para producir narrativas, guiones o contenido con temáticas adultas o controvertidas sin que el modelo se niegue, gracias a su naturaleza uncensored y su contexto de 131K para mantener coherencia en obras largas.
- Investigación en alineación y seguridad de IA: el modelo sirve como caso de estudio para analizar cómo la abliteration afecta a los mecanismos de rechazo y qué comportamientos emergen cuando se eliminan las salvaguardas, permitiendo comparar con el modelo base.
- Chatbots de rol sin restricciones: desarrolladores de juegos de rol o simulación de personajes pueden desplegar el modelo con llama.cpp o LM Studio para crear asistentes que respondan a cualquier petición del usuario, incluyendo escenarios de rol extremos.
- Análisis multimodal de contenido sensible: al mantener las capacidades de visión y audio, el modelo puede procesar imágenes o clips de audio para tareas de descripción o análisis en dominios donde el contenido puede ser explícito (por ejemplo, moderación de contenido con fines de investigación).
- Desarrollo de asistentes de escritura técnica: el modelo puede generar documentación, comentarios de código o explicaciones técnicas sin las restricciones típicas de los modelos alineados, útil para equipos que necesitan respuestas directas sin rodeos.
- Pruebas de robustez en sistemas de generación: ingenieros de ML pueden usar este modelo para evaluar cómo se comportan los sistemas de generación cuando se eliminan los filtros de seguridad, identificando posibles vulnerabilidades o sesgos en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor solo menciona que el modelo mantiene el 100% de las capacidades originales de Gemma 4 E4B-IT, pero no proporciona datos numéricos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo GGUF varía entre 4.2 GB (Q2_K_P) y 7.6 GB (Q8_K_P). Con Q4_K_M (5.0 GB) se puede ejecutar en GPUs con 6-8 GB de VRAM; con Q8_K_P se recomienda al menos 10-12 GB.
- GPU recomendadas: para Q4_K_M o inferior, una RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente; para Q8_K_P, una RTX 4070 (12 GB) o RTX 4080 (16 GB) ofrece mayor margen. Para el mmproj f16 (945 MB) se necesita VRAM adicional.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4 y Q5 caben en GPUs de gama media con 8 GB o más. La Q2_K_P (4.2 GB) puede ejecutarse incluso en GPUs con 6 GB.
- Opciones de despliegue: compatible con llama.cpp, LM Studio, Jan, koboldcpp y cualquier runtime que soporte GGUF. Se recomienda usar el flag `--jinja` para el chat template y `--mmproj` para visión/audio.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, un modelo de ~4B activos con Q4_K_M suele generar entre 30-60 tokens por segundo, pero esto es una estimación general no confirmada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (este) | 7.5B totales (4B efectivos aprox.) | 131K | Sí (imagen, video, audio) | Gemma | GGUF en HF |
| google/gemma-4-e4b-it (base) | 7.5B totales (4B efectivos aprox.) | 131K | Sí (imagen, video, audio) | Gemma | Safetensors en HF |
| Otros modelos abliterated de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos abliterated comparables en el mismo rango de parámetros y capacidades. El modelo base es la referencia más directa: la única diferencia es la eliminación de los rechazos, por lo que el rendimiento técnico debería ser idéntico en tareas estándar, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser una variante agresiva uncensored, el modelo puede generar contenido explícito, ofensivo, ilegal o peligroso sin ninguna barrera. Su uso en producción conlleva riesgos legales y éticos significativos.
- Sesgos y alucinaciones: el modelo hereda los sesgos del entrenamiento base y, al eliminar los mecanismos de rechazo, puede producir afirmaciones falsas o dañinas con mayor confianza. No se ha realizado ninguna evaluación adicional de seguridad.
- Contexto largo no verificado: el autor advierte que Gemma 4 no recibió pruebas manuales extensas en contexto largo, por lo que la calidad de generación puede degradarse en ventanas cercanas a 131K.
- Licencia Gemma: aunque la licencia permite uso comercial, la distribución de modelos derivados debe cumplir con los términos de la licencia Gemma de Google, que incluyen restricciones sobre el uso de los nombres y marcas de Google.
- Compatibilidad de quants K_P: los custom quants K_P pueden mostrar "?" en LM Studio, aunque funcionan correctamente. Se recomienda verificar la integridad de los archivos antes de su uso.
- Sin soporte oficial: el modelo es un proyecto comunitario sin mantenimiento garantizado, y no hay documentación sobre el proceso de abliteration ni sobre los datos utilizados para validar el 0% de rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tudoriviera/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Archivos GGUF (enlaces directos en la model card): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
