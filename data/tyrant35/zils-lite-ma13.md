# tyrant35/zils-lite-ma13

## Resumen

zils-lite-ma13 es un modelo de decisión de tipo "soup-pool" construido por el usuario tyrant35 a partir del modelo base malkolm777/zils-lite-l22-correct-attn, perteneciente a la familia Zils (etiqueta `d3-lite`). No se trata de un modelo generativo de propósito general, sino de un ajuste fino orientado a tareas de decisión y clasificación sobre pares pregunta-respuesta, con unos 853 millones de parámetros en formato safetensors y un repositorio de 1,7 GB.

El proceso de construcción combina tres ajustes finos LoRA de rango 64 (learning rate 3e-5, una pasada, semillas 4221, 4222 y 4224) sobre el cuerpo "soup" del modelo base; las tres variantes se promedian por pesos y la diferencia media respecto al soup original se escala por un factor de 1,3. El entrenamiento emplea aproximadamente 3.970 preguntas de decisión extraídas de los splits de entrenamiento de conjuntos públicos de BigScience P3, además de datos de entrenamiento públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer.

La relevancia del modelo es acotada y experimental: se publica bajo licencia Apache 2.0, sin descargas ni interacciones en el momento de la ficha, y sin resultados de benchmarks publicados. Su interés reside en la metodología de "model soup" con LoRA promediados y escalado del delta, así como en el esquema de destilación suave de etiquetas (mezcla de etiqueta dorada y probabilidades del propio soup) que puede servir de referencia para experimentos similares de ajuste eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión derivado de la familia Zils `d3-lite`; no se especifica la arquitectura interna del modelo base) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base malkolm777/zils-lite-l22-correct-attn; el autor solo describe el procedimiento de ajuste. El modelo se construye mediante "model soup": se parte del cuerpo soup `d3-lite` y se entrenan tres LoRA de rango 64 con learning rate 3e-5, una sola pasada y semillas 4221, 4222 y 4224. Los tres adaptadores se promedian por pesos y el cambio medio respecto al soup original se amplifica con un factor de 1,3, una técnica de escalado del delta que busca reforzar la dirección de ajuste aprendida sin reentrenar el modelo completo.

Los datos de entrenamiento son aproximadamente 3.970 preguntas de decisión procedentes de los splits de entrenamiento de conjuntos públicos de BigScience P3, junto con datos de entrenamiento públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer. Los objetivos de entrenamiento mezclan la etiqueta dorada con las probabilidades que el propio soup asigna: el peso de la etiqueta dorada es 0,9 cuando la respuesta principal del soup era incorrecta y 0,32 cuando era correcta, lo que equivale a un esquema de destilación suave que corrige con más fuerza los casos fallidos. El autor declara que no se usó ningún split de test de benchmarks y que se eliminaron las filas cuyo texto aparecía en sus conjuntos de evaluación.

## Capacidades

- Clasificación y decisión sobre preguntas de opción múltiple o pares pregunta-respuesta, según el formato de los datos de entrenamiento (P3, CLadder, NLI4CT, etc.).
- Tareas de inferencia de lenguaje natural (NLI) y verificación de afirmaciones, por la inclusión de NLI4CT y HoVer en el entrenamiento.
- Detección de sarcasmo e ironía, derivada del conjunto iSarcasmEval.
- Razonamiento numérico y de sentido común de tipo CLadder (razonamiento causal y matemático de opción múltiple).
- Clasificación de relevancia en búsqueda de productos, por el conjunto Amazon ESCI.
- Análisis de sentimiento y de narrativas sociales, por el conjunto VAST.
- No se documentan capacidades de generación libre de texto, tool calling, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.

## Casos de uso

- Clasificación de pares pregunta-respuesta en pipelines de evaluación: el modelo puede puntuar o etiquetar preguntas de opción múltiple procedentes de conjuntos tipo P3, integrándose como clasificador en un pipeline de anotación o control de calidad de datasets.
- Verificación de afirmaciones biomédicas: gracias al entrenamiento con NLI4CT, puede emplearse para determinar si una hipótesis se sigue de un texto de ensayo clínico, como componente de un sistema de comprobación de hechos en dominios científicos.
- Moderación y análisis de sarcasmo en redes sociales: el ajuste con iSarcasmEval permite usarlo como clasificador auxiliar para detectar ironía en comentarios, útil en herramientas de análisis de opinión.
- Razonamiento causal de opción múltiple: el entrenamiento con CLadder lo hace adecuado como componente de evaluación de razonamiento en entornos educativos o de investigación, clasificando respuestas a preguntas causales.
- Clasificación de relevancia en comercio electrónico: el conjunto Amazon ESCI permite usarlo para etiquetar la relación entre consulta y producto (exacta, sustituta, complementaria, irrelevante) en sistemas de búsqueda.
- Detección de desinformación y narrativas: el entrenamiento con HoVer y VAST lo orienta a tareas de verificación multihop y análisis de encuadres narrativos en textos periodísticos.
- Experimentación metodológica: sirve como referencia reproducible de "model soup" con LoRA promediados y escalado de delta para investigadores que estudien técnicas de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks y que se eliminaron del entrenamiento las filas cuyo texto aparecía en sus conjuntos de evaluación, pero no reporta métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP32): aproximadamente 3,4 GB solo para pesos, más memoria para activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: alrededor de 1,7 GB para pesos, más activaciones; el tamaño del repositorio (1,7 GB) es coherente con pesos en media precisión.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor, ya que no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder alojar el modelo en media precisión; para FP32 se recomienda al menos 8 GB. No se dispone de datos de rendimiento en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de 853 M de parámetros.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks que carguen pesos de Hugging Face (transformers, vLLM o TGI si la arquitectura del modelo base es compatible). No se documentan conversiones a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría (clasificadores de decisión de ~850 M de parámetros derivados de Zils). La model card no incluye comparaciones con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-ma13 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| malkolm777/zils-lite-l22-correct-attn (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~1B para clasificación | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 interacciones en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- No se publican resultados de benchmarks ni métricas de evaluación, por lo que su rendimiento real es desconocido.
- El entrenamiento se limita a unos 3.970 preguntas de decisión; la cobertura de dominios y la robustez fuera de las distribuciones de P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer son inciertas.
- El esquema de etiquetas mezcla la etiqueta dorada con las probabilidades del propio soup, lo que puede propagar los sesgos y errores del modelo base en los casos donde este acertaba (peso 0,32).
- El escalado del delta por 1,3 es una decisión de diseño no validada públicamente; puede amplificar tanto la señal deseada como artefactos del ajuste.
- No se documentan idiomas soportados; se desconoce si el modelo funciona fuera del inglés, idioma predominante en los conjuntos citados.
- No se especifica la longitud de contexto ni la arquitectura interna, lo que dificulta planificar su integración en pipelines existentes.
- Riesgo de alucinación y de sobreajuste a los formatos de los conjuntos de entrenamiento; no debe usarse como generador de texto libre sin validación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias de los datos de entrenamiento de terceros (P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer) antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-ma13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: no disponible en la información proporcionada
- iSarcasmEval: no disponible en la información proporcionada
- VAST: no disponible en la información proporcionada
- CLadder: no disponible en la información proporcionada
- NLI4CT: no disponible en la información proporcionada
- Amazon ESCI: no disponible en la información proporcionada
- HoVer: no disponible en la información proporcionada
