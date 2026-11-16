# VibeHash/laya-banking77

## Resumen

laya-banking77 es un ajuste fino del modelo Laya (convaiinnovations/laya) especializado en clasificación de intenciones para mensajes de clientes bancarios. Lo desarrolla VibeHash y resuelve un problema muy concreto: enrutar automáticamente consultas de clientes hacia una de las 77 intenciones del conjunto de datos Banking77, devolviendo una distribución de probabilidad sobre todas ellas en un único forward pass. Su rasgo diferencial no es tanto la precisión bruta como la calibración: el modelo está entrenado para que su confianza declarada sea fiable, lo que permite derivar a un humano los casos dudosos mediante un umbral de abstención.

El modelo cuenta con 421.293.830 parámetros totales y se distribuye en formato safetensors con un tamaño de repositorio de 0,8 GB. Está entrenado exclusivamente en inglés y se publica bajo licencia Apache 2.0. La relevancia actual reside en su enfoque de selective prediction: en lugar de forzar una respuesta para cada mensaje, el sistema puede responder solo cuando supera un umbral de confianza (0,979) y escalar el resto a atención humana, un patrón muy demandado en automatización de atención al cliente donde el coste de un error es alto.

La model card reporta un 91,46% de accuracy en el conjunto de test de Banking77 (3.080 mensajes) con un error de calibración esperado (ECE) de 0,0355, frente al 44,0% y 0,160 del Laya sin ajustar. No obstante, el propio autor reconoce que queda unos dos puntos por debajo del BERT ajustado reportado en el paper original de Banking77 (93,66%), y que el ajuste no se optimizó para accuracy sino que usó la configuración por defecto de Laya.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de convaiinnovations/laya; la model card no detalla la arquitectura base) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ajuste usa head_max_len de 512 tokens para las 77 opciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Laya; lo que sí se especifica es que laya-banking77 es un ajuste fino supervisado sobre convaiinnovations/laya para la tarea de clasificación de intenciones. El modelo recibe el mensaje del cliente junto con las 77 opciones de intención formuladas como preguntas (contenidas en `questions.json`) y produce una probabilidad para cada una en un solo forward pass. El ajuste se realizó con `laya.train.finetune` en su configuración por defecto: 4 épocas, batch efectivo de 64 y función de pérdida RLCD.

Se introdujeron dos cambios respecto a los valores por defecto, ambos fijados antes de evaluar cualquier modelo ajustado. El primero es `head_max_len` a 512 en lugar de 192, porque las 77 opciones ocupan 356 tokens y con 192 Laya las truncaba hasta que cuatro pares quedaban idénticos. El segundo afecta a `target_error` (el texto de la model card se corta en ese punto, por lo que el detalle no está disponible). Para la abstención selectiva, durante el ajuste se reservaron 400 mensajes de entrenamiento y se ajustó un umbral orientado a un 99% de acierto entre las respuestas por encima de él, resultando en 0,979. El conjunto de datos de entrenamiento es PolyAI/banking77 y el ajuste se ejecutó en una única semilla (seed 0) sobre una RTX 4070 SUPER.

## Capacidades

- Clasificación de intenciones en una de las 77 categorías de Banking77 para mensajes de clientes bancarios en inglés.
- Salida de distribución de probabilidad completa sobre las 77 intenciones en un único forward pass.
- Calibración de confianza: la probabilidad declarada se corresponde con la frecuencia real de acierto (ECE de 0,0355).
- Predicción selectiva con abstención: umbral configurable (`min_confidence`) para derivar casos dudosos a un humano.
- Predicción por lotes mediante `predict_batch(texts, questions, batch_size=32)`.
- Verificación de integridad de pesos mediante `expected_sha256` con el archivo `SHA256SUMS`.
- Mapeo de opciones a etiquetas originales de Banking77 mediante `labels.json`.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un clasificador puro.

## Casos de uso

- Enrutamiento automático de tickets bancarios: el modelo clasifica cada mensaje entrante en una de las 77 intenciones y lo dirige al equipo o flujo correspondiente, respondiendo de forma autónoma solo cuando la confianza supera 0,979 (49,4% de los mensajes en el test, con 98,8% de acierto).
- Triaje con derivación a humano: los mensajes por debajo del umbral se envían a un agente con la mejor conjetura del modelo adjunta, reduciendo el tiempo de gestión manual sin sacrificar precisión.
- Automatización de respuestas en la app bancaria: para intenciones de alta confianza como activación de tarjeta o cargos por retirada de efectivo (confianzas de 0,993 y 0,996 en los ejemplos de la model card), el modelo puede disparar respuestas o acciones predefinidas.
- Detección de consultas fuera de alcance: aunque Banking77 no tiene categoría "ninguna de estas", la baja confianza media (0,165) en consultas fuera de dominio de CLINC150 permite filtrar mensajes no bancarios mediante el umbral de abstención.
- Análisis de volumen de consultas: procesar por lotes (aproximadamente 10 ms por mensaje en lotes de 32) grandes acumulaciones de mensajes para agregar la distribución de intenciones y priorizar mejoras de producto o documentación.
- Enrutamiento en sistemas de chat en vivo: con una latencia mediana de 22 ms por mensaje individual, el modelo puede clasificar en tiempo real dentro de un flujo conversacional sin introducir esperas perceptibles.
- Control de calidad y auditoría: usar la confianza calibrada para monitorizar la fiabilidad del sistema de clasificación en producción y detectar derivas en la distribución de intenciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente) sobre el split de test de Banking77 (3.080 mensajes, 40 por intención):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9146 |
| Expected calibration error (15 bins) | 0,0355 |

Comparación con el modelo base sin ajustar, según la model card:

| Metrica | Laya sin ajustar | laya-banking77 |
|---|---|---|
| Aciertos en test | 1.354 de 3.080 (44,0%) | 2.817 de 3.080 (91,5%) |
| Intervalo de confianza al 95% | 42,2 a 45,7% | 90,4 a 92,4% |
| Confianza media declarada | 0,566 | 0,917 |
| ECE (menor es mejor) | 0,160 | 0,035 |

Rendimiento en predicción selectiva (umbral 0,979 ajustado en entrenamiento):

| Criterio | Cobertura | Precision |
|---|---|---|
| Umbral 0,979 (ajustado en train) | 49,4% (1.523 mensajes) | 98,8% |
| Corte elegido sobre test (optimista) | 91,9% | 95% |
| Corte elegido sobre test (optimista) | 70,2% | 98% |
| Corte elegido sobre test (optimista) | 46,3% | 99% |

Comparación con resultados publicados en el paper de Banking77 (Casanueva et al. 2020, Tabla 3, con todos los datos de entrenamiento): BERT ajustado 93,66%, USE+ConveRT 93,36%. El autor señala que este modelo queda unos dos puntos por debajo en accuracy y que su intervalo de confianza completo al 95% está por debajo de 93,66%. El paper no reporta calibración ni predicción selectiva.

Rendimiento en consultas fuera de dominio (1.000 consultas de CLINC150 etiquetadas como fuera de alcance): confianza media de 0,165 y solo 7 de 1.000 (0,7%) superaron el umbral.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 millones de parámetros en safetensors y un repositorio de 0,8 GB, la inferencia en fp32 requiere aproximadamente 1,7 GB de pesos más overhead, y en fp16/bf16 alrededor de 0,9 GB, aunque estas cifras son estimaciones a partir del tamaño y no datos publicados.
- GPU recomendadas: el autor reporta ejecución en una RTX 4070 SUPER; por tamaño, el modelo cabe holgadamente en GPUs consumer modernas (RTX 3060 en adelante, según la VRAM disponible).
- Cabe en GPU consumer: sí, según la evidencia del autor en RTX 4070 SUPER.
- Opciones de despliegue: la model card especifica el uso de la librería `laya` (versión 0.4.31 o superior) mediante `laya.load(REPO)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 22 ms por mensaje individual, percentil 95 de 24 ms; aproximadamente 10 ms por mensaje en lotes de 32, medidos en una RTX 4070 SUPER.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy Banking77 | Calibracion (ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-banking77 | 421.293.830 | no disponible | 91,46% | 0,0355 | apache-2.0 | Hugging Face |
| BERT ajustado (Casanueva et al. 2020) | no disponible | no disponible | 93,66% | no reportado | no disponible | referencia en paper |
| USE+ConveRT (Casanueva et al. 2020) | no disponible | no disponible | 93,36% | no reportado | no disponible | referencia en paper |
| Laya sin ajustar (convaiinnovations/laya) | no disponible | no disponible | 44,0% | 0,160 | no disponible | Hugging Face |

La comparación con BERT y USE+ConveRT procede de la Tabla 3 del paper de Banking77 con todos los datos de entrenamiento; el paper no reporta calibración ni predicción selectiva, por lo que la ventaja de laya-banking77 en esos ejes no tiene contraparte publicada en la información disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con mensajes de clientes bancarios en inglés al estilo de la app de un banco concreto; otros bancos, productos e idiomas no fueron probados.
- Siempre elige una de las 77 intenciones: no existe categoría "ninguna de estas", por lo que la única protección frente a mensajes fuera de tema es el umbral de confianza, y en el test un 0,7% de consultas fuera de dominio lo superaron.
- Una sola semilla de ajuste (seed 0): no se midió cuánto variaría el resultado con otra semilla.
- Umbral ajustado sobre solo 400 mensajes: en test dio 98,8% de acierto, ligeramente por debajo del 99% objetivo.
- Puntos débiles identificados: soporte de moneda fiduciaria (75% de acierto), transferencia rechazada, transferencia pendiente y saldo no actualizado tras transferencia (77,5% cada uno); las confusiones más frecuentes son pares plausibles también para un humano (soporte de moneda fiduciaria frente a cambio vía app, recarga revertida frente a recarga fallida, llegada de tarjeta frente a estimación de entrega).
- No se reportan sesgos específicos ni tasas de alucinación en la información disponible; al ser un clasificador, el riesgo principal es la clasificación errónea con alta confianza, no la generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero la model card no ofrece garantías sobre el rendimiento en dominios distintos al evaluado.
- Requisito de uso estricto: las preguntas de `questions.json` deben enviarse exactamente como están escritas, con la misma instrucción y las mismas 77 opciones en el mismo orden, lo que limita la portabilidad a otros conjuntos de intenciones sin reajuste.
- Resultados no verificados de forma independiente: las métricas del model-index están marcadas como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeHash/laya-banking77
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Paper de Banking77 (Casanueva et al. 2020): no disponible en la información proporcionada
