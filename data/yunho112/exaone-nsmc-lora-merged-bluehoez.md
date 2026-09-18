# Yunho112/exaone-nsmc-lora-merged-bluehoez

## Resumen

`Yunho112/exaone-nsmc-lora-merged-bluehoez` es un checkpoint de la familia EXAONE 4 publicado por el usuario Yunho112 en HuggingFace. Por el identificador y por el recuento real de parámetros del repositorio (1.279.391.488, aproximadamente 1,28 mil millones), todo apunta a que se trata de un ajuste fino mediante LoRA sobre el modelo base EXAONE-4.0-1.2B de LG AI Research, con los pesos del adaptador ya fusionados en el modelo final ("lora-merged"). El sufijo "nsmc" sugiere que el ajuste se realizó sobre el corpus NSMC (Naver Sentiment Movie Corpus), un conjunto de 150.000 reseñas de cine en coreano etiquetadas como positivas o negativas; esta atribución es una inferencia razonable a partir del nombre, pero no está confirmada en la model card.

El modelo se publica con la etiqueta `text-generation` y el tag `conversational`, y su tamaño de repositorio es de 2,6 GB, lo que corresponde aproximadamente a 2 bytes por parámetro y es coherente con pesos en bfloat16/float16. Se trata, por tanto, de un modelo pequeño, orientado a ejecución en hardware de consumo y a tareas de generación de texto y clasificación ligera.

Su relevancia práctica es limitada pero concreta: es un ejemplo típico de checkpoint comunitario de bajo coste derivado de un modelo base abierto, útil para experimentar con ajuste fino por LoRA sobre tareas de clasificación o análisis de sentimiento en coreano. Conviene señalar desde el principio que el repositorio tiene 0 descargas y 0 likes, que la model card es la plantilla automática de HuggingFace sin rellenar y que no se declara licencia ni idiomas soportados, por lo que cualquier uso en producción requiere una verificación previa por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EXAONE 4 (transformer decoder-only; detalles de atención no especificados en la información disponible) |
| Parámetros totales | 1.279.391.488 (≈1,28 mil millones) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería declarada | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 2,6 GB (compatible con pesos en bf16/fp16) |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna, el procedimiento de entrenamiento ni los hiperparámetros de este checkpoint. El tag `exaone4` indica que el modelo base pertenece a la cuarta generación de la familia EXAONE de LG AI Research, y el nombre del repositorio (`exaone-nsmc-lora-merged`) indica que se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) y que posteriormente los pesos del adaptador se fusionaron en el modelo base, dando lugar a un único conjunto de pesos densos. Este procedimiento es habitual para reducir el coste de entrenamiento y, al mismo tiempo, eliminar la sobrecarga de inferencia que supone mantener el adaptador separado.

En cuanto a los datos de entrenamiento, la única pista disponible es la cadena `nsmc` en el identificador, que apunta al Naver Sentiment Movie Corpus: aproximadamente 150.000 reseñas de películas en coreano en el split de entrenamiento y 50.000 en el de evaluación, con etiqueta binaria de sentimiento. No se especifica el número de tokens, la composición del dataset, si hubo mezcla con datos generales para evitar olvido catastrófico, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia de este checkpoint más allá de la fusión del LoRA.

## Capacidades

- Generación de texto autorregresiva, heredada del modelo base EXAONE 4, aunque no se documenta ninguna evaluación específica de este checkpoint.
- Conversación multi-turno: el tag `conversational` indica que el modelo está preparado para diálogo, presumiblemente mediante la plantilla de chat del modelo base.
- Clasificación de sentimiento binaria en coreano (positivo/negativo), si se confirma la hipótesis de que el ajuste se hizo sobre NSMC. En ese caso, el uso esperado sería generar la etiqueta como token de salida y parsearla.
- Capacidades multilingües: no disponibles. Se desconoce si el ajuste sobre datos coreanos ha degradado el rendimiento en otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Análisis de sentimiento de reseñas en coreano: si el ajuste es efectivamente sobre NSMC, el modelo se puede emplear para clasificar opiniones de producto, reseñas de cine o comentarios de usuario en coreano, generando la etiqueta como salida de texto y aplicando una restricción de vocabulario para mapear el token generado a la clase positiva o negativa.
- Monitorización de reputación de marca: procesar en lote comentarios y publicaciones en coreano para generar agregados de polaridad, integrando el modelo en un pipeline de ingesta que llama al checkpoint mediante `transformers` o un servidor compatible con la API de OpenAI.
- Moderación de comunidades de bajo coste: al ser un modelo de ~1,28B parámetros, se puede desplegar en una GPU de consumo para prefiltrar contenido tóxico o valorar el tono de los mensajes antes de escalar a un modelo mayor.
- Prototipado rápido de clasificadores de texto: sirve como punto de partida para experimentar con ajuste fino por LoRA sobre nuevos dominios (por ejemplo, reseñas de comercio electrónico o tickets de soporte), dado su reducido coste de entrenamiento e inferencia.
- Generación de texto ligera en entornos con recursos limitados: chatbots sencillos, resúmenes de una frase o respuestas plantilla en aplicaciones donde no es viable ejecutar modelos de 7B o superiores.
- Experimentación académica y reproducibilidad: un checkpoint pequeño de una familia de modelos asiática permite estudiar el efecto del ajuste por LoRA sobre datos de sentimiento y comparar el comportamiento antes y después de la fusión del adaptador.
- Extracción estructurada de opiniones: combinado con prompts de formato estricto, puede emplearse para extraer aspectos (producto, servicio, precio) y su polaridad a partir de texto en coreano, siempre que la calidad se valide con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye ninguna tabla de evaluación, ninguna métrica de precisión sobre NSMC ni comparaciones con el modelo base, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 2,6 GB, coherente con los 1,28B parámetros y con el tamaño del repositorio.
- VRAM estimada en bf16 para inferencia con contexto corto: en torno a 4-6 GB, sumando pesos, caché KV y sobrecarga del runtime (los valores exactos dependen de la longitud de contexto y del motor utilizado).
- VRAM estimada en cuantización int8: aproximadamente 1,4-2,5 GB.
- VRAM estimada en cuantización int4 (por ejemplo, GGUF Q4_K_M): aproximadamente 0,8-1,5 GB.
- GPU de consumo: cabe con holgura en tarjetas domésticas comunes como RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 o RTX 5090, y también en GPUs integradas o en CPU, aunque con latencias mayores.
- GPU de centro de datos: A100, H100 o L40S no aportan ventajas significativas para este tamaño salvo por el mayor ancho de banda y por el despliegue por lotes a gran escala.
- Opciones de despliegue: `transformers` (biblioteca declarada), servidores compatibles con la API de OpenAI (el repo incluye el tag `endpoints_compatible`), y posiblemente vLLM o TGI si la arquitectura exaone4 está soportada por esas herramientas; para `llama.cpp` u Ollama sería necesaria una conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a conocimiento público general de esos modelos y deben verificarse antes de tomar decisiones; el único dato confirmado en la información proporcionada es el del modelo de esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yunho112/exaone-nsmc-lora-merged-bluehoez | 1,28B | no disponible | no disponible | safetensors en HF |
| EXAONE-4.0-1.2B (LG AI Research) | 1,2B | no disponible en esta ficha | sujeta a la licencia de LG AI Research | safetensors en HF |
| Llama 3.2 1B (Meta) | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF |
| Qwen3-1.7B (Alibaba) | 1,7B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors y GGUF |
| Gemma 3 1B (Google) | 1B | 32.000 tokens | Gemma Terms of Use | safetensors y GGUF |

Frente a estas alternativas, el modelo de esta ficha parte con desventajas claras en cuanto a documentación, licencia explícita, disponibilidad de cuantizaciones y evidencias de rendimiento, aunque su objetivo declarado (ajuste sobre sentimiento en coreano) es más específico que el de los modelos generalistas.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica condiciones de uso. Esto impide determinar si el uso comercial está permitido y si el modelo hereda las restricciones del base EXAONE de LG AI Research. No debe utilizarse en producción sin aclarar este punto.
- Model card vacía: se trata de la plantilla automática de HuggingFace sin rellenar, sin información sobre datos de entrenamiento, hiperparámetros, evaluación o uso previsto.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes ni evidencia de calidad.
- Riesgo de olvido catastrófico: si el LoRA se entrenó solo sobre NSMC sin mezclar datos generales, es probable que las capacidades conversacionales y multilingües del modelo base hayan sufrido degradación, aunque no hay datos para confirmarlo.
- Naturaleza del ajuste incierta: la correspondencia con NSMC y con el modelo base EXAONE-4.0-1.2B es una inferencia a partir del nombre y del recuento de parámetros, no un hecho documentado.
- Sesgos potenciales: los corpus de reseñas de cine en coreano pueden introducir sesgos de dominio, de registro lingüístico y demográficos; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: como cualquier modelo generativo de este tamaño, puede producir texto plausible pero falso, especialmente en tareas de conocimiento factual.
- Limitaciones idiomáticas: no se declaran idiomas soportados; el uso en castellano u otros idiomas no está garantizado y probablemente sea deficiente si el ajuste se centró en coreano.
- Contexto desconocido: no se publica la ventana de contexto efectiva de este checkpoint, lo que dificulta dimensionar el consumo de memoria y planificar despliegues.
- Formato único: solo se ofrecen safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que añade trabajo de conversión para despliegues en CPU o en hardware muy limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Yunho112/exaone-nsmc-lora-merged-bluehoez
- Modelo base de referencia (EXAONE de LG AI Research): no disponible en la información proporcionada
- Paper del modelo base: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Dataset NSMC: no enlazado en la model card (referencia habitual: https://github.com/e9t/nsmc)
