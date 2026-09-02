# wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2.2-D2-v1

## Resumen

Este modelo es una cuantización EXL3 del checkpoint multimodal `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, publicada por el usuario de HuggingFace `wrldsuksgo2mars`. El objetivo es reducir drásticamente el peso de los expertos enrutados del modelo original —que promedian 2,2 bits por peso— manteniendo intactos los tensores no enrutados (encoder de visión, atención, expertos compartidos, etc.) en su precisión nativa. Esto permite ejecutar un modelo de aproximadamente 49 000 millones de parámetros en hardware con VRAM limitada, a costa de una posible degradación de calidad que aún no ha sido evaluada en el dominio multimodal.

El modelo base, DeepSeek-V4-Flash-Vision-Exp, es un modelo experimental de DeepSeek que combina la arquitectura de lenguaje V4 Flash con un encoder de visión y un alineador, e incorpora bloques dSpark para decodificación especulativa. Según el anuncio oficial de DeepSeek, iguala a V4-Flash en capacidades de texto (agentes, razonamiento, conocimiento del mundo) y mejora notablemente en benchmarks de agentes multimodales, acercándose a Opus-4.8. Esta cuantización se distribuye bajo licencia MIT y está pensada para entornos de inferencia con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y bloques dSpark integrados |
| Parametros totales | 49 018 151 102 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, mezcla K2/K3 en expertos enrutados (promedio 2,2 bits por peso); bloques dSpark uniformes K2 |
| Idiomas soportados | no disponible (el corpus de calibración incluye inglés, chino y texto multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantización EXL3, compatible con ExLlamaV3) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantización del modelo base `DeepSeek-V4-Flash-Vision-Exp`. La arquitectura subyacente es un transformer multimodal con mezcla de expertos: el modelo base combina la pila de lenguaje V4 Flash con un encoder de visión, un alineador y un embedding de imagen, además de tres bloques dSpark que actúan como ruta de borrador para decodificación especulativa. La cuantización se aplica únicamente a los expertos enrutados de las 43 capas principales del decodificador, donde cada proyección se codifica primero en K2 y luego las proyecciones con mayor error ponderado se reemplazan por K3 bajo una asignación fija gate/up/down de 3:5:8, logrando un promedio de 2,2 bits por peso. Los tres bloques dSpark permanecen uniformes en K2.

El proceso de calibración utilizó 1 426 prompts y 1 081 027 tokens que abarcan revisión y reescritura de código, texto general en inglés y chino, texto multilingüe, matemáticas y razonamiento, y llamadas a herramientas estructuradas. La cuantización se propagó capa por capa: las activaciones generadas por la mezcla K2/K3 de cada capa alimentaron la siguiente. Los bloques dSpark se calibraron con una muestra determinista de 327 680 anclas del frente de cinco propuestas emitidas conjuntamente. El corpus de calibración fue exclusivamente textual, por lo que los módulos visuales se conservan exactamente pero la calidad multimodal de esta cuantización no ha sido medida.

## Capacidades

- Generación de texto y razonamiento: el modelo base iguala a DeepSeek-V4-Flash en tareas de texto, incluyendo razonamiento y conocimiento del mundo.
- Capacidades multimodales: incluye encoder de visión y alineador, aunque la calidad visual de esta cuantización específica no ha sido evaluada.
- Soporte de tool calling y function calling: el corpus de calibración incluye llamadas a herramientas estructuradas, lo que sugiere que la cuantización preserva esta capacidad.
- Capacidades de agente y razonamiento multi-paso: el modelo base destaca en benchmarks de agentes multimodales, acercándose a Opus-4.8.
- Decodificación especulativa: los bloques dSpark integrados permiten una ruta de borrador para acelerar la generación.
- Multilingüe: el corpus de calibración cubre inglés, chino y texto multilingüe, aunque no se especifican los idiomas oficiales soportados.

## Casos de uso

- Despliegue en GPU consumer: gracias a la cuantización de 2,2 bits en los expertos enrutados, el modelo puede ejecutarse en tarjetas con 24 GB de VRAM o menos, algo inviable con el checkpoint original sin cuantizar.
- Asistente de código con tool calling: el modelo puede integrarse en entornos de desarrollo para generar, revisar y reescribir código, aprovechando la calibración específica en estas tareas.
- Razonamiento matemático y lógico: el corpus de calibración incluye matemáticas y razonamiento, por lo que es adecuado para problemas de lógica y cálculo en entornos con recursos limitados.
- Procesamiento de documentos con imágenes: si la calidad visual se confirma, podría usarse para extraer información de capturas, diagramas o documentos escaneados, aunque esta capacidad no está verificada en esta cuantización.
- Investigación sobre cuantización extrema: sirve como caso de estudio para evaluar el impacto de cuantizaciones de 2,2 bits en modelos multimodales grandes.
- Inferencia en entornos edge o con restricciones de memoria: el formato EXL3 y el tamaño reducido permiten ejecutar el modelo en servidores con una sola GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de rendimiento para esta cuantización, y el corpus de calibración no proporciona datos de evaluación. El modelo base, DeepSeek-V4-Flash-Vision-Exp, ha sido evaluado por DeepSeek en tareas de agentes multimodales, pero esos resultados corresponden al checkpoint original sin cuantizar y no son extrapolables a esta versión.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 49 018 millones de parámetros y una cuantización promedio de 2,2 bits en los expertos enrutados, el peso efectivo de los expertos sería de aproximadamente 13-15 GB, más los tensores no cuantizados (atención, embeddings, encoder de visión), que podrían añadir varios GB adicionales. Una GPU con 24 GB de VRAM podría ser suficiente, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Por el tamaño del modelo y el formato EXL3, se recomienda al menos una RTX 3090/4090 (24 GB) o una A100 de 40 GB para mayor margen.
- Compatibilidad con GPU consumer: probablemente sí, en tarjetas con 24 GB o más, aunque no está confirmado.
- Opciones de despliegue: ExLlamaV3 es el runtime principal para el formato EXL3. También podría usarse vLLM o TGI si soportan EXL3, pero no está confirmado. El formato es específico de ExLlamaV3, por lo que otras herramientas pueden no ser compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 49 018 151 102 | Sin cuantizar | no disponible | MIT | HuggingFace |
| Este modelo (EXL3 K2.2-D2) | 49 018 151 102 | EXL3, 2,2 bits promedio en expertos | no disponible | MIT | HuggingFace |
| DeepSeek-V4-Flash-0731-EXL3-K2.1-calibrated-v1 | no disponible | EXL3, 2,1 bits promedio | no disponible | no disponible | HuggingFace |
| DeepSeek-V4-Flash-0731-EXL3-K2-calibrated-v1 | no disponible | EXL3, K2 uniforme | no disponible | no disponible | HuggingFace |

Los dos últimos modelos son cuantizaciones del mismo autor sobre la variante V4-Flash-0731, con promedios de bits ligeramente diferentes. Este modelo se distingue por ser la versión multimodal y por mantener los bloques dSpark en K2 uniforme.

## Limitaciones y advertencias

- Calidad multimodal no verificada: el corpus de calibración fue solo texto, por lo que el rendimiento en tareas de visión puede degradarse o comportarse de forma inesperada.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos no evaluados: no se han realizado evaluaciones de sesgo o toxicidad para esta cuantización.
- Formato propietario de cuantización: el formato EXL3 requiere ExLlamaV3 u otro runtime compatible; no es directamente utilizable con transformers estándar sin conversión.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base original por si hubiera condiciones adicionales.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede garantizar la calidad en producción.
- Descargas y adopción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2.2-D2-v1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Otro modelo del mismo autor (K2.1): https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-0731-EXL3-K2.1-calibrated-v1
- Otro modelo del mismo autor (K2): https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-0731-EXL3-K2-calibrated-v1
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Anuncio del lanzamiento del modelo base: https://api-docs.deepseek.com/news/news260821/
- Referencia en Friendli (modelo similar): https://friendli.ai/models/wrldsuksgo2mars/DeepSeek-V4-Flash-0731-EXL3-K2.1-D2.2-calibrated-v3
