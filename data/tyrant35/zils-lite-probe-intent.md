# tyrant35/zils-lite-probe-intent

## Resumen

zils-lite-probe-intent es un modelo de clasificación de intenciones derivado de joamCriff123/zils-lite-l1117a, un "soup body" de la familia Zils d3-lite. Lo desarrolla el usuario tyrant35 y se publica bajo licencia Apache 2.0. El modelo no se entrena desde cero: parte del cuerpo base y aplica un fine-tune LoRA de rango 32 (learning rate 1e-4) sobre las particiones de entrenamiento de BANKING77 y CLINC150 (6.000 filas con etiquetas gold), complementado con 6.000 prompts de decisión públicos etiquetados con las propias probabilidades de respuesta del modelo base para preservar su comportamiento previo.

La técnica central es un "model soup" extrapolado: el autor calcula la diferencia entre el fine-tune y el cuerpo base y la extrapola con un factor de 3 (soup + 3 × (fine-tune − soup)). El resultado es un cuerpo de 852.985.920 parámetros (unos 853 M), almacenado en safetensors con un repositorio de 1,7 GB, lo que sugiere pesos en fp16 o bf16.

Es relevante como experimento metodológico más que como modelo de producción: el propio autor indica que mide cómo responde el banco de rondas d3-lite a estos datos y que no espera que supere al cuerpo base. No se publican benchmarks, idiomas soportados ni pipeline declarado, y el modelo acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cuerpo base de la familia Zils d3-lite; no se detalla en la model card) |
| Parametros totales | 852.985.920 (≈853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; repo de 1,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | joamCriff123/zils-lite-l1117a |
| Tipo de ajuste | LoRA rango 32, learning rate 1e-4, fusionado y extrapolado (factor 3) |
| Datos de ajuste | 6.000 filas train de BANKING77 + CLINC150 (gold) y 6.000 prompts de decisión públicos |
| Particiones usadas | solo train (sin validación ni test) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del cuerpo base zils-lite-l1117a: no se especifica si es un transformer denso, un modelo híbrido ni el tipo de atención. Lo que sí se documenta es el procedimiento de ajuste. Se parte del "soup body" d3-lite y se entrena un adaptador LoRA de rango 32 con learning rate 1e-4 sobre dos conjuntos de clasificación de intenciones (BANKING77 y CLINC150, 6.000 filas de entrenamiento con etiquetas gold) más 6.000 prompts de decisión públicos cuyas etiquetas son las probabilidades que el propio modelo base asigna a sus respuestas. Este segundo conjunto actúa como regularizador para conservar el comportamiento original.

El paso distintivo es la extrapolación de la tarea aprendida: en lugar de quedarse con el fine-tune fusionado, el autor calcula soup + 3 × (fine-tune − soup), es decir, amplifica por tres el vector de cambio introducido por el LoRA. No se emplearon particiones de validación ni de test durante el entrenamiento, y el autor declara explícitamente que es un experimento para medir la respuesta del banco de rondas d3-lite y que no se espera que supere al cuerpo base. No hay información sobre volumen total de tokens de preentrenamiento, composición del corpus original, ni sobre si el cuerpo base usó RLHF o DPO.

## Capacidades

- Clasificación de intenciones en dominios de atención al cliente y asistentes conversacionales, entrenada específicamente sobre las taxonomías de BANKING77 y CLINC150.
- Generación de decisiones o etiquetas de intención a partir de texto de entrada, heredando el formato de "decision model" del cuerpo base.
- Conservación del comportamiento previo del cuerpo base gracias al conjunto de 6.000 prompts de decisión con probabilidades del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se mencionan.

## Casos de uso

- Clasificación de tickets de banca: el ajuste sobre BANKING77 permite mapear consultas de clientes a las intenciones bancarias de esa taxonomía, útil como primer filtro en un sistema de enrutamiento de soporte.
- Enrutamiento de consultas en asistentes virtuales: con el ajuste sobre CLINC150, el modelo puede asignar utterances a intenciones de dominio abierto y derivar cada conversación al flujo o al agente adecuado.
- Etiquetado asistido de datos: usar el modelo para preetiquetar grandes volúmenes de utterances antes de la revisión humana, reduciendo el coste de anotación en proyectos de NLU.
- Experimentación metodológica con model soups: sirve como caso de estudio reproducible de extrapolación de LoRA (factor 3) para investigadores que quieran medir el efecto de amplificar el delta de un fine-tune.
- Detección de intención en pipelines de voz: al ser un modelo de ~853 M parámetros, puede desplegarse en infraestructura moderada como componente de clasificación tras un ASR.
- Base para posteriores fine-tunes: al publicarse en safetensors con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes específicos de dominio, siempre validando antes que la extrapolación no degradó el comportamiento base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1 ni comparaciones sobre las particiones de test de BANKING77 o CLINC150, y el autor advierte que no se usaron particiones de validación ni de test durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 los pesos ocupan aproximadamente 1,7 GB; en int8, unos 0,85 GB; en int4, unos 0,43 GB (estimación teórica a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar los pesos en fp16, aunque no hay datos publicados de latencia ni de throughput.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de los pesos.
- Opciones de despliegue: no disponibles; la model card no indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni se declara un pipeline en Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-probe-intent | ≈853 M | no disponible | Apache 2.0 | Fine-tune LoRA extrapolado sobre zils-lite-l1117a para intenciones |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | no disponible | Cuerpo base del que deriva; sin datos de rendimiento publicados |
| Alternativas de clasificación de intenciones (p. ej. modelos BERT-base ajustados a BANKING77/CLINC150) | ≈110 M típicamente | 512 tokens típicamente | variable | Categoría comparable por tarea, pero sin datos de benchmark de este modelo para contrastar |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El autor declara explícitamente que es un experimento y que no se espera que supere al cuerpo base.
- No se usaron particiones de validación ni de test: no hay evidencia publicada de generalización ni de métricas de calidad.
- La extrapolación con factor 3 puede amplificar artefactos del fine-tune y degradar comportamientos del cuerpo base no cubiertos por los 6.000 prompts de regularización.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo principal es la clasificación errónea de intenciones fuera de las taxonomías de BANKING77 y CLINC150.
- Idiomas soportados: no declarados; el ajuste se hizo sobre datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un cuerpo base cuya licencia no se detalla en la información disponible, conviene verificar la licencia del modelo base antes de un despliegue en producción.
- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad.
- No hay pipeline declarado en Hugging Face, lo que puede complicar la carga automática con `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-probe-intent
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Dataset BANKING77: no disponible en la información proporcionada
- Dataset CLINC150: no disponible en la información proporcionada
- Paper o blog del método de model soups / extrapolación: no disponible en la información proporcionada
