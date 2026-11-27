# TshokayDorji/scamdetect-distilbert

## Resumen

ScamDetect DistilBERT es un modelo de clasificación de texto obtenido por ajuste fino de `distilbert-base-uncased` para distinguir entre mensajes legítimos (ham), intentos de phishing (phish) y spam. Lo desarrollan Tshokay Dorji y Yonten Choden en el marco del proyecto ScamDetect, un trabajo de la asignatura CSA402 Natural Language Processing del Gyalpozhing College of Information Technology. El modelo resuelve un problema acotado y muy concreto: la triaje automático de SMS y correos electrónicos sospechosos en inglés, con etiquetas mutuamente excluyentes.

Arquitectónicamente es un transformer encoder de tipo DistilBERT, una destilación de BERT-base con 6 capas y 66.955.779 parámetros totales, publicado en formato safetensors con un repositorio de 0,3 GB. No es un modelo generativo ni dispone de ventana de contexto en el sentido de los LLM: acepta secuencias de hasta 512 tokens subword, el límite estándar de la familia BERT, y devuelve una distribución de probabilidad sobre tres clases.

Su relevancia es doble. Por un lado, ofrece una línea base ligera y desplegable en CPU para detección de fraude textual, un caso de uso con demanda creciente en banca, telecomunicaciones y mensajería. Por otro, la propia model card es transparente sobre sus límites: 95,4 % de accuracy en el conjunto de test retenido (7.601 mensajes) pero solo 78,5 % en datos reales independientes de otras fuentes (5.416 mensajes), una caída de casi 17 puntos que conviene tener presente antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilación de BERT-base, 6 capas) |
| Parámetros totales | 66.955.779 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de la familia BERT; no especificado explícitamente en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; admite cuantización dinámica a int8 vía PyTorch, pero no se documenta) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder de 6 capas y 12 cabezas de atención con 66 millones de parámetros, destilado de BERT-base. Sobre esa base se añade una cabeza de clasificación de secuencia con tres salidas (ham, phish, spam), entrenada mediante ajuste fino supervisado. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de regularización como early stopping o búsqueda de hiperparámetros; esa información no está disponible.

Un detalle técnico relevante es el preprocesado obligatorio: el texto de entrada debe limpiarse igual que en entrenamiento, es decir, pasar a minúsculas y sustituir enlaces, correos y números de teléfono por los tokens especiales `<URL>`, `<EMAIL>` y `<PHONE>`. El código de referencia está en `src/text_cleaning.py` del repositorio del proyecto. Ignorar este paso degrada la calidad de las predicciones, ya que el modelo ha aprendido a asociar esos marcadores con patrones de fraude.

El repositorio incluye además un fichero `calibration.json` con la temperatura `T` empleada para calibrar las probabilidades mediante `softmax(logits / T)`. Esto indica que el autor aplicó temperature scaling, una técnica habitual para corregir la sobreconfianza de las redes neuronales y obtener probabilidades mejor alineadas con la frecuencia real de acierto. Es un aspecto poco común en modelos de este tamaño y útil si se quiere usar la salida como score de riesgo en un umbral operativo.

## Capacidades

- Clasificación de texto en tres clases mutuamente excluyentes: ham (legítimo), phish (phishing) y spam.
- Detección de indicadores propios de smishing y phishing: enlaces, direcciones de correo y números de teléfono, normalizados previamente a tokens especiales.
- Salida de probabilidades calibradas mediante temperature scaling, apta para umbrales de decisión ajustables.
- Funcionamiento en inglés exclusivamente; no se documenta soporte multilingüe.
- Inferencia ligera: 66 millones de parámetros permiten ejecución en CPU con latencias de milisegundos por mensaje.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de agente. Es un clasificador discriminativo, no un modelo instructivo.
- No soporta visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajería: el modelo puede puntuar cada mensaje entrante antes de entregarlo al usuario y marcar como sospechosos aquellos con probabilidad alta de phish o spam. Su tamaño reducido permite procesar miles de mensajes por segundo en CPU dentro de la propia pasarela.
- Moderación de correo electrónico corporativo: integrado como segunda capa tras el filtro antispam tradicional, ayuda a detectar campañas de phishing dirigido que evaden reglas heurísticas, aprovechando la normalización de URL y remitentes.
- Avisos preventivos en aplicaciones bancarias: al recibir un SMS sospechoso reenviado por el cliente, la app puede clasificarlo y mostrar una advertencia contextual antes de que el usuario pulse un enlace.
- Enriquecimiento de tickets de soporte: clasificar automáticamente los correos reportados por usuarios como fraudulentos o legítimos, priorizando la cola de revisión humana y reduciendo el tiempo de respuesta del equipo de seguridad.
- Etiquetado asistido para equipos de threat intelligence: usar las probabilidades calibradas como señal preliminar en la construcción de datasets de phishing, con revisión humana posterior dado el 78,5 % de accuracy en datos externos.
- Prototipado rápido y educación: al ser un modelo MIT de 0,3 GB, sirve como base para talleres, demos y pruebas de concepto de detección de fraude sin requerir GPU ni infraestructura de inferencia compleja.
- Investigación en calibración: el fichero `calibration.json` y la comparación entre test retenido y datos externos lo convierten en un caso de estudio útil sobre generalización y sobreconfianza en clasificadores pequeños.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Test retenido (7.601 mensajes) | Accuracy | 95,4 % |
| Datos reales independientes de otras fuentes (5.416 mensajes) | Accuracy scam-vs-genuine | 78,5 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de clasificación en la información disponible. Tampoco se aportan métricas por clase (precisión, recall, F1) ni matrices de confusión, lo que impide evaluar el equilibrio entre falsos positivos y falsos negativos, un aspecto crítico en detección de fraude.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB de pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe en cualquier GPU con 1 GB o más.
- En fp16 o int8 dinámico, el modelo ocupa del orden de 130 MB y 67 MB respectivamente, aunque estas cuantizaciones no están documentadas por el autor.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) lo ejecuta con holgura; en entornos de servidor, una T4 o una A10 bastan para servir muchas peticiones concurrentes.
- Cabe sobradamente en GPU consumer e incluso en Raspberry Pi o dispositivos edge con 1 GB de RAM para inferencia en CPU.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (el modelo está marcado como `endpoints_compatible`), ONNX Runtime, o exportación a GGUF para llama.cpp aunque no se distribuye ese formato. También es viable servirlo con un microservicio FastAPI.
- Latencia y throughput: no se han publicado cifras. Por el tamaño, es razonable esperar latencias de decenas de milisegundos en CPU y de pocos milisegundos en GPU para secuencias cortas de SMS, pero se trata de una estimación, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScamDetect DistilBERT | 66,9 M | 512 tokens | Clasificación ham/phish/spam | MIT | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base, sin cabeza de clasificación | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo base, sin cabeza de clasificación | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | Modelo base, sin cabeza de clasificación | MIT | Hugging Face |

No se dispone de información sobre otros clasificadores específicos de phishing o smishing con los que comparar rendimiento de forma directa. La comparación con los modelos base es estructural: ScamDetect DistilBERT hereda la arquitectura y el tamaño de DistilBERT y añade una cabeza de tres clases entrenada para una tarea concreta, por lo que su valor frente a los base reside en el ajuste fino, no en la arquitectura.

## Limitaciones y advertencias

- La caída de accuracy del 95,4 % al 78,5 % entre el test retenido y datos externos sugiere sobreajuste al dominio de entrenamiento y una generalización limitada a nuevas fuentes de mensajes.
- Solo admite inglés; mensajes en otros idiomas o con mezcla de lenguas no están cubiertos.
- El preprocesado es obligatorio: sin la sustitución de URL, correo y teléfono por `<URL>`, `<EMAIL>` y `<PHONE>`, y sin pasar a minúsculas, el rendimiento se degrada de forma no cuantificada.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: la model card advierte explícitamente que el modelo puede equivocarse y debe usarse como ayuda, nunca como prueba de que un mensaje es fraudulento.
- No se documentan sesgos conocidos, pero al estar entrenado sobre un dataset no descrito, puede heredar sesgos de las fuentes utilizadas y mostrar rendimiento desigual entre variedades de inglés o estilos de escritura.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece ninguna garantía ni soporte por parte de los autores.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se publican métricas por clase ni matrices de confusión, imprescindibles para fijar umbrales en producción.
- El modelo está pensado como parte de un proyecto académico; no hay evidencia de validación en entornos reales a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TshokayDorji/scamdetect-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio del proyecto: no disponible en la información proporcionada
- Paper o blog: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
