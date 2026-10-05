# sudiptaroy07/forentisai-deberta-v3-email-threat-classifier

## Resumen

El modelo `sudiptaroy07/forentisai-deberta-v3-email-threat-classifier` es un clasificador binario de amenazas en correo electrónico obtenido mediante ajuste fino de `microsoft/deberta-v3-base`. Lo publica el usuario sudiptaroy07 en Hugging Face como parte del proyecto ForentisAI, centrado en detección de amenazas y análisis forense de correo. Resuelve una tarea muy acotada: recibir el texto de un correo y etiquetarlo como BENIGN o MALICIOUS, con arquitectura de clasificación de secuencias (sequence classification) y una sola etiqueta de salida.

Técnicamente es un transformer encoder DeBERTa-v3-base de 184.423.682 parámetros reales (según los pesos en safetensors), con una longitud máxima de secuencia de 256 tokens y tokenizador `DebertaV2Tokenizer`. El repositorio ocupa 0,7 GB, está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés. No es un modelo generativo: no produce texto, únicamente una probabilidad por clase.

Su relevancia práctica es doble. Por un lado, es una pieza pequeña y barata de desplegar que se puede insertar como filtro previo en un pipeline de seguridad de correo. Por otro, es un ejemplo claro de las precauciones que hay que tomar al evaluar modelos de seguridad: el autor reporta métricas perfectas (accuracy, precision, recall, F1 y ROC-AUC de 1,00) sobre un conjunto de test **sintético** de 4.499 muestras, y advierte explícitamente de que esos resultados no garantizan el mismo comportamiento sobre tráfico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder, sequence classification) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (máximo de secuencia) |
| Tipos de cuantización | no disponible (el autor no publica versiones cuantizadas; al ser safetensors fp32 se puede cuantizar a fp16/int8 con herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-base |
| Tokenizador | DebertaV2Tokenizer |
| Etiquetas | BENIGN, MALICIOUS |
| Tarea (pipeline) | text-classification |
| Librería | transformers |
| Tamaño del repositorio | 0,7 GB |
| Dataset de ajuste | ForentisAI_DeBERTa_Dataset_V2 (sintético) |
| Entorno de entrenamiento | Google Colab |
| Checkpoint final | /content/forentisai_deberta_v3/checkpoint-1312 |

## Arquitectura y entrenamiento

La base es DeBERTa-v3, un transformer encoder con atención desacoplada (disentangled attention) y decodificador de máscara mejorado. DeBERTa-v3 introduce además un preentrenamiento estilo ELECTRA con detección de tokens reemplazados y compartición de embeddings con gradiente desacoplado. El recuento de parámetros de esta variante (184,4M) es notablemente superior al de otros encoders base de tamaño comparable, en gran medida por su vocabulario ampliado. Sobre esa base, el autor aplica un ajuste fino supervisado de clasificación de secuencias con dos clases.

El ajuste se realizó partiendo de `microsoft/deberta-v3-base` sobre el dataset `ForentisAI_DeBERTa_Dataset_V2`, de naturaleza **sintética**, en un entorno Google Colab. El mejor checkpoint del entrenamiento fue `checkpoint-1312`. La model card no documenta el número total de tokens de entrenamiento, la composición exacta del dataset, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO; ninguno de esos datos está disponible en la información proporcionada. Tampoco se describen innovaciones propias más allá del ajuste fino: no hay decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Clasificación binaria de texto de correo en dos etiquetas: BENIGN y MALICIOUS.
- Entrada de texto libre de hasta 256 tokens, que puede incluir remitente, destinatario, asunto, cuerpo del mensaje, URLs y otro texto contenido en el correo.
- Detección de patrones asociados a phishing, correo malicioso y contenido amenazante, según lo aprendido durante el ajuste fino.
- Integración directa con la librería Transformers mediante `pipeline("text-classification", ...)`.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con Hugging Face Inference Endpoints (`endpoints_compatible`).
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling ni uso como agente.
- No tiene capacidades de visión, audio ni multimodalidad.
- Solo inglés: no se declara soporte multilingüe.
- No acepta adjuntos, cabeceras completas con metadatos estructurados ni cuerpos de correo por encima de 256 tokens sin truncado previo.

## Casos de uso

- Filtro previo en pasarelas de correo: colocar el modelo delante de un motor antispam más costoso para descartar rápidamente mensajes claramente benignos y derivar los sospechosos a un análisis más profundo. Su tamaño de 184M permite inferencia muy barata en CPU o GPU pequeña.
- Etiquetado masivo de buzones históricos: procesar archivos de correo ya almacenados para priorizar la revisión forense de los mensajes clasificados como MALICIOUS. El coste por mensaje es bajo y el modelo no necesita generar texto.
- Enriquecimiento de un SIEM o plataforma de correlación de eventos: enviar el texto de los correos sospechosos a este clasificador y usar la etiqueta y la puntuación como campo adicional para las reglas de alerta.
- Investigación en ciberseguridad: uso como línea base reproducible para comparar con otros clasificadores de phishing o para estudiar el comportamiento de modelos ajustados sobre datos sintéticos frente a datos reales.
- Detección de campañas de ingeniería social de forma masiva: al ser un modelo pequeño, se pueden procesar lotes grandes de mensajes en poco tiempo y agrupar los marcados como maliciosos para su revisión manual.
- Módulo de formación y concienciación: integrarlo en una herramienta interna donde un empleado pegue un correo dudoso y reciba una señal de riesgo inmediata, siempre como indicador orientativo y no como decisión final.
- Aplicación docente sobre ajuste fino: sirve como ejemplo completo de fine-tuning de un encoder sobre una tarea de clasificación, con dataset sintético incluido, para prácticas de NLP aplicado a seguridad.
- Análisis forense digital: como componente de triaje dentro de un flujo más amplio que combine cabeceras, reputación de dominios y análisis de adjuntos, dado que el modelo solo mira el texto.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre un conjunto de test sintético de 4.499 muestras:

| Métrica | Valor |
|---|---|
| Accuracy | 1,00 |
| Precision | 1,00 |
| Recall | 1,00 |
| F1 Score | 1,00 |
| ROC-AUC | 1,00 |

Advertencia importante recogida en la propia model card: estas métricas se obtuvieron sobre un dataset **sintético** y no demuestran que el modelo alcance el mismo rendimiento sobre tráfico de correo real. No se han publicado resultados sobre conjuntos de datos reales, ni comparaciones con otros clasificadores de phishing en la información disponible. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 738 MB. En fp16/bf16: aproximadamente 369 MB. En int8: aproximadamente 184 MB.
- VRAM estimada para inferencia con lote pequeño y secuencia de 256 tokens: en torno a 0,7-1,5 GB en fp16 contando activaciones y overhead del runtime.
- Cabe sin problema en GPU de consumo: GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090 24 GB y similares. También funciona en CPU con latencias mayores.
- GPU de centro de datos (A100, H100, L40S) solo tienen sentido si se necesita un throughput muy alto con batching grande, no por requisitos de memoria.
- Opciones de despliegue: Transformers con `pipeline`, Text Embeddings Inference (etiqueta declarada en el repositorio), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime o TorchScript para servir sin Python pesado.
- llama.cpp, GGUF y Ollama no aplican tal cual: el repositorio solo publica safetensors y no hay versiones GGUF publicadas.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

Datos de especificaciones de los modelos comparados tomados de sus fichas públicas; no hay resultados de benchmarks comparables publicados para esta tarea concreta.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| forentisai-deberta-v3-email-threat-classifier | 184,4M | 256 tokens | Clasificación benigno/malicioso | Apache 2.0 | Métricas perfectas solo en test sintético |
| microsoft/deberta-v3-base | ~184M | 512 tokens | Modelo base preentrenado | MIT | no disponible (no es un clasificador de amenazas) |
| bert-base-uncased | ~110M | 512 tokens | Modelo base preentrenado | Apache 2.0 | no disponible (requiere ajuste fino) |
| roberta-base | ~125M | 512 tokens | Modelo base preentrenado | MIT | no disponible (requiere ajuste fino) |

La ventaja diferencial de este modelo frente a los anteriores es que ya viene ajustado para la tarea, con dos etiquetas listas para usar. Su desventaja es que hereda una ventana de contexto más corta (256 frente a 512 tokens) y que su evaluación se ha hecho solo sobre datos sintéticos.

## Limitaciones y advertencias

- Evaluación sobre datos sintéticos: las métricas de 1,00 no son extrapolables a correo real, tal y como advierte el propio autor. El rendimiento en producción probablemente será muy inferior.
- Riesgo de sobreajuste al dataset sintético: patrones artificiales pueden no reproducirse en mensajes reales y el modelo puede fallar ante variaciones triviales de redacción.
- Punto de corte de 256 tokens: los correos largos se truncan, con la consiguiente pérdida de información relevante.
- Solo inglés: no hay soporte declarado para otros idiomas, lo que limita su uso en entornos multilingües.
- Entrada limitada al texto: el modelo no procesa adjuntos, cabeceras completas, reputación de remitente, dominios ni metadatos de autenticación (SPF, DKIM, DMARC). Es un componente, no un sistema antiphishing completo.
- Vulnerabilidad a ataques adversarios: texto ofuscado, homoglifos, codificación del contenido o inyección de texto benigno pueden evadir la clasificación.
- Riesgo de falsos positivos en producción con impacto operativo: bloquear correo legítimo por una clasificación errónea tiene coste directo, por lo que debe usarse como señal y no como decisión automática.
- Sin datos sobre sesgos: la model card no documenta análisis de sesgo ni de equidad, algo relevante si se aplica sobre poblaciones o idiomas no representados en el dataset sintético.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar cambios. No impone restricciones de uso, pero tampoco ofrece garantías.
- Adopción nula hasta la fecha: 0 descargas y 0 likes en Hugging Face, sin evidencia de uso en producción por terceros.
- Uso indebido: no debe presentarse como un antivirus ni como sustituto de un SGSI o de una pasarela de seguridad corporativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudiptaroy07/forentisai-deberta-v3-email-threat-classifier
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTa-v3 (base arquitectónica): https://arxiv.org/abs/2006.03654
- Google Colab (entorno de entrenamiento y pruebas indicado por el autor): https://colab.research.google.com/
- Dataset ForentisAI_DeBERTa_Dataset_V2: no disponible (no se proporciona enlace)
- Repositorio de código del proyecto ForentisAI: no disponible
- Demo pública: no disponible
