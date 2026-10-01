# ufakai/ufakzeka-karar

## Resumen

ufakzeka-karar es un modelo turco de decisión tipada desarrollado por ufak AI (ufakai) a partir de su propio backbone ufakzeka-1-base. No genera texto: lee un texto en turco y responde a preguntas de formato cerrado (elegir una opción de un conjunto, un nivel en una escala ordenada o un sí/no), devolviendo para cada opción una probabilidad escalada por temperatura sobre datos de validación y un error esperado que el llamante puede usar como señal de «no estoy seguro». Cada pregunta de hasta diez opciones se resuelve en una única pasada forward, incluso en CPU.

Tiene 182.494.466 parámetros (151.037.186 sin la matriz de embeddings, de 31.457.280 parámetros) y hereda la arquitectura de su modelo base, un Qwen3ForCausalLM decoder-only con 4.096 tokens de contexto, preentrenado desde cero con 13,5 mil millones de tokens de texto turco con licencia abierta. Su objetivo son tareas de clasificación y enrutamiento en turco: moderación, guardrails, spam, triaje legal, verificación de hechos y soporte al cliente.

Es relevante porque demuestra que un modelo de menos de 200 M de parámetros y licencia Apache-2.0 puede colocarse en la zona media de un benchmark de decisiones en turco, con inferencia íntegra en CPU. Ahora bien, sus cifras no son ciegas y arrastran advertencias de fuga de datos y de calibración que deben leerse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) con cabezas de decisión tipada; sin generación de texto |
| Parametros totales | 182.494.466 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base ufakzeka-1-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Parametros sin embeddings | 151.037.186 |
| Parametros de la matriz de embeddings | 31.457.280 |
| Modelo base | ufakai/ufakzeka-1-base (fine-tune) |
| Tarea declarada | text-classification |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base ufakzeka-1-base, descrito por el propio autor como un Qwen3ForCausalLM «sin código personalizado» con 4.096 tokens de contexto. Ese backbone se entrenó desde cero con 13,5 mil millones de tokens de texto turco con licencia abierta, dentro de un pipeline completo (filtrado de datos, tokenizer, preentrenamiento, post-entrenamiento, evaluación y publicación) por menos de 300 dólares de cómputo y gasto en API. Sobre esa base, ufakzeka-karar añade la capacidad de responder preguntas tipadas: el texto más la pregunta con sus opciones se procesan en una sola pasada forward, y el modelo emite probabilidades por opción en lugar de tokens.

El ajuste se realizó con un conjunto de datasets turcos que cubren verificación de noticias falsas, decisión múltiple, decisiones del Tribunal Constitucional, inyección de prompts y negativos difíciles de guardrails, FAQ web y recuperación, conversación multilingüe y detección de ofensas. El número de tokens de ajuste, la composición exacta del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada. La calibración se realiza por temperature scaling sobre datos de validación. El modelo publicado es el tercero de tres ejecuciones puntuadas en HakemBench: los datos de la segunda ejecución se dirigieron a los errores de la primera en guardrails, moderación y soporte al cliente, y la ejecución publicada se entrenó después de leer los resultados de guardrails de la segunda sobre el conjunto de test completo, bajo un protocolo fijado por escrito antes de generar sus datos, código o ejecuciones.

## Capacidades

- Decisión tipada: elección entre opciones, nivel en una escala ordenada y respuesta sí/no sobre un texto turco.
- Salida probabilística por opción, escalada por temperatura sobre datos de validación.
- Señal de incertidumbre: devuelve un error esperado por respuesta que el llamante puede interpretar como «no estoy seguro».
- Procesamiento de preguntas de hasta diez opciones en una única pasada forward, sin decodificación autoregresiva.
- Ejecución en CPU, sin requisitos de GPU para inferencia.
- Cobertura de dominios evaluados: verificación de hechos (dogrulama), educación (egitim), guardrails (guvenlik), enrutamiento legal (hukuk), moderación (moderasyon), spam y phishing (spam) y soporte al cliente (sss).
- Multilingüismo: solo turco.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Moderación de contenido en turco: con una precisión declarada de 0,952 y un macro F1 de 0,951 en la pista de moderación de HakemBench, el modelo puede clasificar comentarios y publicaciones en categorías cerradas definidas por el producto, con probabilidad por categoría para fijar umbrales de actuación automática.
- Guardrails frente a inyección de prompts: entrenado con datasets específicos de prompt injection en turco y negativos difíciles, puede actuar como filtro previo que marque entradas sospechosas (0,770 de precisión y 0,764 de macro F1 en la pista de guardrails), siempre que se asuma que la señal de «no seguro» no cubre bien los errores en este dominio.
- Filtrado de spam y phishing: con 0,806 de precisión y 0,746 de macro F1, sirve como primera etapa de triaje en formularios, correo o mensajería antes de sistemas más costosos.
- Enrutamiento legal de consultas: con 0,782 de precisión y 0,754 de macro F1, permite dirigir una consulta en turco al departamento o formulario adecuado dentro de un flujo de gestión legal.
- Clasificación educativa y etiquetado de ejercicios: con 0,787 de precisión y 0,802 de macro F1 en la pista de educación, es adecuado para asignar preguntas a niveles o temas en plataformas de aprendizaje.
- Triaje de verificación de hechos: la pista de dogrulama obtiene 0,640 de precisión pero solo 0,437 de macro F1, por lo que resulta útil como prefiltro que priorice piezas para revisión humana, no como verificador autónomo.
- Soporte al cliente con derivación a humano: con 0,569 de precisión y 0,479 de macro F1, y con casi ninguna respuesta que alcance 0,90 de confianza, el modelo encaja mejor como clasificador de intención que marca los casos dudosos para un agente.
- Inferencia en CPU dentro de pipelines de bajo coste: al resolverse en una sola pasada forward, puede desplegarse en servidores sin GPU para tareas de etiquetado, enrutamiento y control de calidad sobre volúmenes altos de texto turco.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (HakemBench v1.0, conjunto abierto, config «items», split de test). Ninguno está verificado (`verified: false`).

| Metrica | Valor |
|---|---|
| Composite (media geométrica de calidad de decisión, calibración y selectiva) | 0,660 |
| Eje de calidad de decisión (macro F1, media sobre pistas) | 0,705 |
| Eje de calibración (1 menos Brier normalizado) | 0,482 |
| Eje selectivo (1 menos AUGRC normalizado) | 0,848 |
| Precisión, dogrulama (triaje de verificación de hechos) | 0,640 |
| Macro F1, dogrulama | 0,437 |
| Precisión, egitim (educación) | 0,787 |
| Macro F1, egitim | 0,802 |
| Precisión, guvenlik (guardrails) | 0,770 |
| Macro F1, guvenlik | 0,764 |
| Precisión, hukuk (enrutamiento legal) | 0,782 |
| Macro F1, hukuk | 0,754 |
| Precisión, moderasyon (moderación) | 0,952 |
| Macro F1, moderasyon | 0,951 |
| Precisión, spam (spam y phishing) | 0,806 |
| Macro F1, spam | 0,746 |
| Precisión, sss (soporte al cliente) | 0,569 |
| Macro F1, sss | 0,479 |

El autor indica un intervalo de confianza del 95 % para el composite de 0,642 a 0,677, y una puntuación de 0,678 (sexto de dieciséis) si se excluyen las tres pistas afectadas por la lectura de resultados de test.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,73 GB en fp32, 0,37 GB en fp16/bf16 y 0,18 GB en int8 para los 182,5 M de parámetros, más el espacio de activaciones de una pasada forward.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requieren aceleradores de gama alta (A100, H100) y el modelo está etiquetado explícitamente para ejecución en CPU.
- Cabe sin problema en GPU de consumo: RTX 4090, RTX 3060, GTX 1650 o integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un Qwen3ForCausalLM con pesos safetensors, es cargable con transformers y PyTorch; el autor no documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 0,7 GB.

## Comparativa con modelos similares

En HakemBench v1.0, el modelo ocupa el séptimo puesto de dieciséis filas del tablero público con un composite de 0,660. Por encima quedan tres modelos de chat alojados (Gemini 3.8 Flash, GPT-5.6 Sol y GLM 5.3), la API de decisiones Jev 1.13 y los dos modelos Kev, según la model card.

| Modelo | Parametros | Contexto | Composite en HakemBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ufakzeka-karar | 182,5 M | 4.096 tokens | 0,660 (0,678 sin las tres pistas marcadas) | Apache-2.0 | Pesos abiertos en HuggingFace |
| ufakzeka-1-base | 151 M (182 M con embeddings) | 4.096 tokens | No evaluado como modelo de decisión | Apache-2.0 | Pesos abiertos en HuggingFace |
| Gemini 3.8 Flash | no disponible | no disponible | Superior a ufakzeka-karar (valor no disponible) | Propietaria | API alojada |
| GPT-5.6 Sol | no disponible | no disponible | Superior a ufakzeka-karar (valor no disponible) | Propietaria | API alojada |
| GLM 5.3 | no disponible | no disponible | Superior a ufakzeka-karar (valor no disponible) | no disponible | API alojada |
| Jev 1.13 | no disponible | no disponible | Superior a ufakzeka-karar (valor no disponible) | no disponible | API de decisiones |
| Kev (dos modelos) | no disponible | no disponible | Superior a ufakzeka-karar (valor no disponible) | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de benchmark no son ciegos: el modelo publicado es el tercero de tres ejecuciones, entrenado después de leer los resultados de guardrails de la segunda ejecución sobre el test completo, bajo un protocolo fijado previamente por escrito.
- Las cifras de guardrails, moderación y soporte al cliente están marcadas por el propio autor como «shaped by reading the test results», es decir, influidas por la lectura del test.
- Fuga de datos: en 209 preguntas del benchmark (181 de tribunal y 28 de guardrails de origen) el modelo no es zero-shot, ya que entrenó con los splits de entrenamiento de sus datasets de origen, mientras que los modelos comparados las responden zero-shot.
- Calibración: el temperature scaling empeora la calibración en preguntas de soporte reservadas (de 0,036 a 0,064 en la ejecución publicada, que desde entonces ha entrenado con esas preguntas), y en HakemBench el modelo es algo sobreconfiado.
- La señal de «no seguro» falla en guardrails: de sus respuestas a preguntas de guardrails con confianza igual o superior a 0,99, un 12 % son incorrectas; en soporte al cliente casi ninguna respuesta alcanza 0,90 de confianza.
- Rendimiento desigual por dominio: el macro F1 cae a 0,437 en verificación de hechos y a 0,479 en soporte al cliente, frente a 0,951 en moderación.
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo se entrenó con datasets turcos de noticias falsas, ofensas, moderación y guardrails, lo que puede trasladar los sesgos de esas fuentes.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo se traslada a clasificaciones erróneas con alta confianza, especialmente en guardrails.
- Idioma: solo turco; no hay soporte declarado para otras lenguas.
- Licencia: Apache-2.0 permite uso comercial, pero las advertencias metodológicas del autor y la falta de verificación de los resultados deben tenerse en cuenta antes de desplegarlo en producción.
- Todos los resultados del model-index están marcados como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ufakai/ufakzeka-karar
- Modelo base: https://huggingface.co/ufakai/ufakzeka-1-base
- Modelo de chat de la familia: https://huggingface.co/ufakai/ufakzeka-1
- Benchmark HakemBench: https://huggingface.co/datasets/ufakai/HakemBench
- Tablero público de HakemBench: https://huggingface.co/datasets/ufakai/HakemBench
- Código: https://github.com/ufakai/ufakzeka-karar
- Repositorio de la familia ufakzeka: https://github.com/ufakai/ufakzeka
- Organización en GitHub: https://github.com/ufakai
- Demo: https://karar.ufakzeka.com/en
- Artículo técnico: https://ufakai.com/research/ufakzeka-karar
- Sitio del proyecto: https://ufakzeka.com/
