# wiiqliw/saq-scam-xlmr

## Resumen

SAQ es un clasificador binario de mensajes fraudulentos (scam) desarrollado en el marco del proyecto SAQ (ISSAI FRP) para ayudar a la población kazaja, especialmente a personas mayores, a reconocer mensajes de fraude. Se trata de un fine-tuning de XLM-RoBERTa base, un transformer encoder multilingüe, adaptado a la tarea de clasificación de texto con dos etiquetas: `safe` y `scam`. El modelo está pensado para su integración en aplicaciones de mensajería o asistentes que alerten al usuario ante posibles intentos de estafa.

El modelo cubre tres idiomas (kazajo, ruso e inglés) y está entrenado sobre un conjunto público de aproximadamente 73.500 mensajes de fraude complementado con mensajes locales en kazajo y ruso. Con 278 millones de parámetros, es un modelo compacto que puede desplegarse en infraestructura modesta, lo que resulta relevante para un caso de uso de utilidad pública en una región con recursos limitados.

Su relevancia actual reside en la combinación de un rendimiento declarado alto en la detección de estafas (97,6 % de recall sobre un conjunto de verificación público de 7.623 mensajes) con una licencia MIT permisiva y un tamaño manejable. No obstante, la validación local es reducida (100 mensajes), por lo que las métricas deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa base, un transformer encoder con atención bidireccional y tokenizador SentencePiece multilingüe, adaptado mediante fine-tuning para clasificación de secuencias con dos etiquetas (`safe`/`scam`). La cabeza de clasificación se entrena sobre la representación del token especial de inicio de secuencia. No se especifica en la información disponible si se aplicaron técnicas adicionales como congelación de capas, destilación o aumento de datos.

El entrenamiento utilizó un conjunto público de mensajes de fraude de aproximadamente 73.500 ejemplos, complementado con mensajes locales en kazajo y ruso. El conjunto de test local (100 mensajes reales, 25 de fraude y 25 seguros por idioma) no se usó durante el entrenamiento. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento, la presencia de RLHF/DPO (poco habitual en clasificadores) ni hiperparámetros como tasa de aprendizaje, épocas o técnicas de regularización.

## Capacidades

- Clasificación binaria de mensajes de texto como `safe` o `scam`.
- Detección de mensajes fraudulentos en kazajo, ruso e inglés.
- Salida de probabilidad por clase mediante softmax, lo que permite umbralizar la decisión según el coste de falsos positivos y falsos negativos.
- Adecuado para integración en pipelines de moderación o alerta en tiempo real por su tamaño compacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y su probabilidad asociada.

## Casos de uso

- Filtro antestafa en aplicaciones de mensajería: el modelo puede clasificar en tiempo real los mensajes entrantes y mostrar una advertencia al usuario cuando la probabilidad de `scam` supere un umbral configurable, con especial utilidad para personas mayores en Kazajistán.
- Moderación en foros y chats comunitarios: integrado como servicio de inferencia (por ejemplo, con Text Embeddings Inference o un endpoint de transformers), permite marcar mensajes sospechosos antes de que se publiquen.
- Pasarela de alertas para operadores de telecomunicaciones: clasificación por lotes de SMS reportados por usuarios para priorizar la revisión manual de los casos con mayor probabilidad de fraude.
- Asistente educativo antifraude: el modelo puede alimentar una herramienta que explique por qué un mensaje es sospechoso, usando la probabilidad como señal de confianza y complementándola con reglas heurísticas.
- Investigación y análisis de campañas: clasificación de grandes volúmenes de mensajes históricos para cuantificar la prevalencia de estafas en un corpus kazajo o ruso.
- Integración en navegadores o extensiones de correo: análisis local del texto de mensajes web o correos para alertar al usuario sin enviar datos a servidores externos, gracias al reducido tamaño del modelo.
- Enrutamiento en atención al cliente: separar mensajes potencialmente fraudulentos de consultas legítimas antes de que lleguen a un agente humano, reduciendo la carga operativa.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de verificación público (7.623 mensajes: 2.609 scam, 5.014 safe):

| Metrica | Valor |
|---|---|
| Recall (estafas detectadas) | 2.546 / 2.609 = 97,6 % |
| Falsas alarmas | 26 / 5.014 = 0,5 % |
| Precision | 99,0 % |
| Kazajo (aciertos) | 219 / 219 |
| Ruso (aciertos) | 55 / 55 |

Resultados sobre el test local congelado (100 mensajes reales: 25 scam + 25 safe por idioma):

| Metrica | Valor |
|---|---|
| Estafas detectadas | 49 / 50 |
| Falsas alarmas | 2 / 50 |
| Exactitud | 97 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un clasificador binario.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB (278 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en FP16/BF16: aproximadamente 0,6 GB; en INT8: unos 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU para inferencia de baja concurrencia.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir múltiples peticiones concurrentes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, o exportación a GGUF para llama.cpp aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 278 M parámetros se espera latencia de milisegundos por mensaje en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| wiiqliw/saq-scam-xlmr | 278 M | no disponible | kk, ru, en | MIT | Clasificación scam/safe |
| xlm-roberta-base (base sin fine-tuning) | 278 M | 512 tokens | 100 idiomas | MIT | Representaciones multilingües; requiere fine-tuning para clasificación |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 tokens | 104 idiomas | Apache 2.0 | Representaciones multilingües; requiere fine-tuning |
| Modelos de detección de spam/scam en inglés (p. ej., fine-tunes de BERT) | ~110 M | 512 tokens | en | variable | Clasificación binaria, sin cobertura de kazajo |

No se dispone de comparaciones directas de rendimiento con otros clasificadores de scam en kazajo en la información proporcionada. La principal ventaja diferencial de este modelo es la cobertura del kazajo, idioma escasamente representado en modelos especializados de detección de fraude.

## Limitaciones y advertencias

- El test local es muy pequeño (100 mensajes), por lo que diferencias de 1 o 2 mensajes están dentro del ruido estadístico y las métricas deben tomarse como indicativas.
- Los ejemplos seguros del entrenamiento son mayoritariamente mensajes de chat normales; los mensajes de servicios legítimos que contienen códigos reales son raros, lo que puede aumentar los falsos positivos en ese tipo de tráfico.
- El modelo no sustituye el juicio del usuario: el autor recomienda mostrar por qué un mensaje parece sospechoso, no solo la etiqueta.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en dominios no representados (por ejemplo, jerga nueva, mensajes con imágenes o audios, o variantes dialectales del kazajo).
- Cobertura lingüística limitada a kk, ru y en; mensajes en otros idiomas o con mezcla de lenguas pueden degradar el rendimiento.
- Sesgos potenciales derivados de la composición del dataset de entrenamiento (fuentes públicas y mensajes locales), no documentados en detalle.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se documentan el contexto máximo soportado ni los tipos de cuantización; el ejemplo de uso trunca a 128 tokens, lo que puede perder información en mensajes largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wiiqliw/saq-scam-xlmr
- Página del proyecto: https://dilya265.github.io/Saq/
- Demo: https://dilya265.github.io/Saq/Сақ_%20хабарлама%20алаяқтық%20па_.html
- Código: https://github.com/dilya265/Saq
