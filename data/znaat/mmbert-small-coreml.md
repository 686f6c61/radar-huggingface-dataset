# znaat/mmbert-small-coreml

## Resumen

`znaat/mmbert-small-coreml` es una conversión a Core ML del modelo `jhu-clsp/mmBERT-small`, un encoder multilingüe basado en la arquitectura ModernBERT. El modelo original, desarrollado por el JHU-CLSP, fue preentrenado sobre 3 billones de tokens en 1.833 lenguas mediante un esquema de aprendizaje por annealing (cascaded annealed language learning, ALL). Esta conversión concreta incluye la cabeza de masked language modeling (fill-mask) y pesos en fp16, ocupando 269 MB en disco.

La relevancia de esta conversión radica en que permite ejecutar un encoder multilingüe de última generación en dispositivos Apple (macOS, iOS) con baja latencia: unos 18 ms por forward pass en un Mac con chip M-series. El autor ha verificado la fidelidad de la conversión frente al modelo PyTorch original, con una correlación de logits entre 0.99999 y 1.00000 en las posiciones enmascaradas. Además, documenta dos advertencias críticas: la longitud de secuencia es fija (64 tokens en esta versión) y el modelo debe ejecutarse exclusivamente con unidades de cómputo CPU y GPU, nunca en el Neural Engine, donde produce resultados incorrectos.

Se trata de un modelo de tipo encoder, no generativo, pensado para tareas de comprensión del lenguaje, clasificación, extracción de entidades o búsqueda semántica en contextos multilingües, y no para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 140,9 M (42 M en el backbone + 98,9 M en la cabeza de vocabulario) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 64 tokens (fija en esta conversion; el modelo original soporta longitudes mayores) |
| Tipos de cuantizacion | fp16 |
| Idiomas soportados | 1.833 lenguas |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlpackage` (y `.mlmodelc` compilado) |

## Arquitectura y entrenamiento

El modelo base `jhu-clsp/mmBERT-small` emplea la arquitectura ModernBERT, un transformer encoder con atención bidireccional y optimizaciones para eficiencia en secuencias largas. Fue preentrenado sobre 3 billones de tokens de texto multilingüe en más de 1.800 lenguas, utilizando un esquema de entrenamiento novedoso denominado *annealed language learning* (ALL), que combina un ratio de máscara inverso y un muestreo por temperatura inversa. El modelo original supera a XLM-R en múltiples tareas y, según sus autores, incluso a modelos generativos de gran escala como OpenAI o3 o Gemini 2.5 Pro en tareas de comprensión.

La conversión a Core ML realizada por `znaat` mantiene los pesos originales (verificados contra PyTorch) e incluye la cabeza de masked LM. El tokenizer es de tipo Gemma: BPE con byte-fallback, 256.000 entradas, pre-tokenizador Metaspace (espacio representado como `▁`) y tokens especiales `<bos> <eos> <mask> <pad> <unk>`. `tie_word_embeddings` está activado, por lo que la matriz de salida es la misma que la de entrada, lo que explica que la cabeza de vocabulario ocupe 99 MB de los 269 MB totales.

Una característica destacable de esta conversión es que el `attention_mask` se expone como entrada real del grafo, en lugar de construirse internamente como `ones_like(input_ids)`. El autor demostró que si el padding se atiende como texto, el modelo produce respuestas completamente erróneas (0 de 238 aciertos frente a 238 de 238 con el mask correctamente aplicado). Por tanto, la conversión exige que el llamador proporcione explícitamente la máscara de atención.

## Capacidades

- Relleno de máscaras (masked language modeling): dado un texto con un token `[MASK]`, predice el token más probable en esa posición.
- Representaciones contextuales multilingües: genera embeddings de alta calidad para texto en más de 1.800 lenguas, útiles para fine-tuning en tareas downstream.
- Comprensión del lenguaje: al ser un encoder bidireccional, captura contexto de ambas direcciones, adecuado para tareas de clasificación, NER, análisis de sentimiento, etc.
- Sin capacidades generativas: no genera texto libre, solo produce distribuciones sobre tokens en posiciones enmascaradas.
- Sin soporte de tool calling ni agentes: es un modelo de tipo fill-mask, no un LLM conversacional.
- Ejecución eficiente en Apple Silicon: optimizado para Core ML, con latencia de ~18 ms por forward pass en hardware M-series.

## Casos de uso

- Análisis de sentimiento multilingüe en redes sociales: el modelo puede procesar textos en decenas de idiomas para extraer representaciones que luego se clasifican con una capa lineal. Su cobertura de 1.833 lenguas lo hace útil para mercados con alta diversidad lingüística.
- Extracción de entidades nombradas (NER) en documentos legales o médicos multilingües: al ser un encoder con atención bidireccional, produce etiquetas contextuales precisas. La conversión a Core ML permite ejecutarlo en local en apps de escritorio o móviles sin conexión.
- Búsqueda semántica en bases de conocimiento multilingües: se pueden generar embeddings de frases o párrafos y compararlos por similitud coseno. Su capacidad multilingüe permite indexar contenido en muchos idiomas con un único modelo.
- Clasificación de textos cortos en atención al cliente: por ejemplo, categorizar tickets de soporte en idiomas como español, francés, árabe o hindi. La latencia de 18 ms permite procesamiento en tiempo real dentro de una app.
- Verificación de coherencia lingüística en herramientas de traducción: se puede usar para detectar si una traducción mantiene el sentido original comparando representaciones del texto fuente y el traducido.
- Prototipado rápido en entornos Apple: al ser un paquete Core ML, se integra directamente con Swift y `swift-transformers`, lo que facilita el desarrollo de aplicaciones nativas de iOS/macOS sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión a Core ML en la informacion disponible. El modelo base `jhu-clsp/mmBERT-small` reporta resultados en el paper original (arXiv:2509.06888), donde supera a XLM-R y compite con modelos mucho más grandes, pero esos datos no se han reproducido aquí. La model card de esta conversión solo incluye métricas de fidelidad frente al modelo PyTorch:

| Métrica | Valor |
|---|---|
| Correlación de logits (CPU_AND_GPU vs PyTorch) | 0.99999 - 1.00000 |
| Acuerdo top-1 en 6 frases de prueba | 6/6 |
| Acuerdo top-10 en 6 frases de prueba | 6/6 |
| Aciertos con attention_mask correcto (238 slots) | 238/238 |
| Aciertos con padding atendido (238 slots) | 0/238 |

## Requisitos de hardware

- Dispositivos Apple con chip M-series (M1, M2, M3, etc.) o Intel con macOS reciente; el modelo está optimizado para Core ML.
- VRAM estimada: no disponible, pero el paquete ocupa 269 MB en disco y los pesos fp16 requieren aproximadamente 282 MB de memoria (140,9 M parámetros × 2 bytes), más overhead de activaciones. Cabe en cualquier Mac con al menos 8 GB de RAM unificada.
- GPU recomendada: la GPU integrada del chip Apple Silicon es suficiente; el modelo se ejecuta en CPU y GPU (`compute_units=CPU_AND_GPU`). No usar el Neural Engine, ya que produce resultados incorrectos (0/238 aciertos en las pruebas del autor).
- Opciones de despliegue: Core ML nativo desde Swift, o Python con `coremltools` para carga y predicción. También se puede integrar con `swift-transformers`.
- Latencia: ~18 ms por forward pass con `coremltools` y ~15 ms desde Swift, tras warm-up. La carga del `.mlpackage` tarda ~2,1 s (incluyendo compilación); el `.mlmodelc` compilado tarda 0,1 s, por lo que se recomienda compilar una vez y reutilizar.
- Throughput estimado: no disponible, pero con una latencia de 15-18 ms se pueden procesar decenas de peticiones por segundo en un solo hilo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| mmBERT-small (Core ML) | ModernBERT encoder | 140,9 M | 64 fijo (convertido) | 1.833 | MIT | Core ML |
| XLM-R base | Transformer encoder | 278 M | 512 | 100 | MIT | PyTorch/TF |
| mBERT base | Transformer encoder | 172 M | 512 | 104 | Apache-2.0 | PyTorch/TF |

Según el paper de mmBERT, el modelo base supera a XLM-R en varias tareas multilingües, pero no se dispone de números concretos en esta ficha. La conversión Core ML tiene la ventaja de estar lista para producción en Apple Silicon, mientras que XLM-R y mBERT requieren conversión adicional. Sin embargo, estos últimos soportan longitudes de secuencia mayores (512) y tienen ecosistemas más maduros en frameworks como Hugging Face Transformers.

## Limitaciones y advertencias

- Longitud de secuencia fija en 64 tokens: esta conversión solo acepta entradas de exactamente 64 tokens. Para otras longitudes hay que reconvertir con `--length N`. Si se supera ese límite, es necesario truncar o dividir el texto.
- No usar el Neural Engine: el modelo debe ejecutarse con `CPU_AND_GPU` (o `ALL` en Mac donde el scheduler elija CPU/GPU). En el Neural Engine los resultados son incorrectos (0/238 aciertos en las pruebas del autor).
- El `attention_mask` es imprescindible: si se rellena con padding y no se enmascara correctamente, las predicciones son erróneas. El llamador debe construir la máscara explícitamente.
- Modelo de tipo encoder: no es adecuado para generación de texto, chatbots o tareas que requieran producción de lenguaje libre.
- Vocabulario muy grande (256.000 tokens): la cabeza de salida domina el coste computacional, haciendo que el modelo sea más lento que otros de tamaño similar con vocabularios más pequeños.
- Riesgo de alucinación en tareas de fill-mask: como cualquier modelo de lenguaje, puede producir predicciones plausibles pero incorrectas en contextos ambiguos.
- Sesgos lingüísticos: aunque cubre 1.833 lenguas, el rendimiento puede variar significativamente entre idiomas con más o menos datos de entrenamiento. Los idiomas minoritarios probablemente tengan peor calidad.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero hay que verificar que el modelo base `jhu-clsp/mmBERT-small` también la tiene (así lo indica su model card).
- Al descargar desde Hugging Face, los pesos quedan como symlink y el compilador Core ML no los sigue; hay que copiar con `cp -RL` antes de cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/znaat/mmbert-small-coreml
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Blog de Hugging Face sobre mmBERT: https://huggingface.co/blog/mmbert
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT
- Paper (arXiv): https://arxiv.org/html/2509.06888v1
- Conversión relacionada (ModernBERT-base Core ML): https://huggingface.co/znaat/modernbert-coreml
