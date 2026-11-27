# zaindanaharper/credential-line-32m

## Resumen

credential-line-32m (v2) es un clasificador de texto de 32 millones de parámetros desarrollado por el usuario independiente zaindanaharper. Su tarea es concreta y acotada: leer una línea de código, configuración, log o prosa y puntuar si esa línea contiene una credencial literal (contraseña, clave de API, token de acceso, cabecera de clave privada, cadena de conexión con contraseña o valor de cabecera Authorization). No es un modelo generativo ni un asistente: es un detector binario de secretos pensado para ejecutarse línea a línea antes de compartir trazas, logs o diffs.

El modelo deriva del encoder jhu-clsp/ettin-encoder-32m, un transformer de tipo ModernBERT, y se distribuye en formato ONNX y safetensors bajo licencia MIT. Su relevancia práctica está en el coste: unos 4,1 ms de mediana por línea en CPU de escritorio (4 hilos, tokenización incluida), lo que permite puntuar cada línea de un log o de un diff de CI/CD sin GPU y sin penalizar el pipeline.

La propuesta del autor es explícitamente complementaria a los escáneres basados en reglas, no sustituta. Sobre un conjunto de validación humano de 1.264 líneas alcanza una precisión de 0,916 y una exhaustividad de 0,807 (F1 0,858), por encima del catálogo de reglas de referencia (F1 0,623) y de detect-secrets 1.5.0 (F1 0,509), aunque por debajo de un modelo zero-shot de 14B en exhaustividad y muy por encima en precisión y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (base: jhu-clsp/ettin-encoder-32m) |
| Parametros totales | 32.031.746 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | ONNX fp32 (el autor reporta paridad con PyTorch); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 32M parámetros afinado para clasificación de secuencias de dos clases (credencial / no credencial). La entrada es una única línea, truncada a 128 tokens en el ejemplo de inferencia, y la salida es un logit que se convierte en probabilidad mediante softmax con temperature scaling (temperatura 2,0954) y un umbral de decisión calibrado de 0,74. Ambos parámetros se ajustaron exclusivamente sobre líneas de validación escritas por humanos y se publican en el fichero `policy.json`; el autor advierte que aplicar el softmax crudo con umbral 0,5 no reproduce la decisión calibrada.

El conjunto de evaluación principal es un holdout humano de 1.264 líneas (472 credenciales, 159 grupos de origen) procedente de 75 repositorios del benchmark CredData y de ejemplos de reglas de Nosey Parker, sin solapamiento con el entrenamiento. El autor reporta además un conjunto sintético de regresión de 6.207 líneas con F1 0,994, pero lo presenta como comprobación de regresión y no como medida de precisión real. No se detallan en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (poco probables en un clasificador de este tipo).

Entre las mejoras de la v2 frente a la v1 medidas sobre el holdout destacan: claves aisladas en una línea o en una lista detectadas de 10/47 a 43/47, cabeceras de clave privada de 0/5 a 5/5, y líneas limpias con UUID marcadas como falso positivo de 17 a 2. La calibración también mejora: error de calibración esperado de 0,140 a 0,037 y Brier score de 0,142 a 0,072.

## Capacidades

- Clasificación binaria línea a línea de presencia de credenciales literales: contraseñas, claves de API, tokens de acceso, cabeceras de clave privada, cadenas de conexión con contraseña y valores de cabecera Authorization.
- Detección de claves aisladas en una línea o dentro de listas, y de cabeceras de clave privada (PEM).
- Discriminación de falsos positivos habituales en escáneres de reglas, como líneas limpias que contienen un UUID.
- Inferencia en CPU con latencia de milisegundos, apta para procesamiento por línea en tiempo casi real.
- Ejecución en dos runtimes: ONNX Runtime (con paridad numérica respecto a PyTorch dentro de 2,5e-6) y transformers.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Redacción de trazas de agentes y logs antes de compartirlos: puntuar cada línea de una traza con el modelo y marcar o eliminar las que superen el umbral de 0,74, con un coste de unos 4 ms por línea en CPU.
- Puerta de seguridad en CI/CD sobre diffs: ejecutar el clasificador sobre las líneas añadidas en cada pull request y bloquear la fusión si alguna se marca como credencial, complementando el escáner de reglas existente.
- Saneado de ficheros de configuración y `.env` antes de publicar un repositorio: procesar el fichero completo con `predict_onnx.py` y revisar las líneas marcadas.
- Filtrado previo en pipelines de telemetría: clasificar líneas de logs de aplicación en streaming en CPU, descartando o enmascarando las que contengan secretos antes de enviarlas a un almacén central.
- Segunda opinión sobre hallazgos de escáneres de reglas: usar el modelo junto al catálogo de reglas y marcar una línea si cualquiera de los dos dispara, lo que según el autor eleva la exhaustividad al 89 % frente al 59 % del catálogo solo.
- Auditoría de documentación y notas técnicas: detectar credenciales pegadas por error en README, wikis o tickets, donde los escáneres de código no llegan.
- Entrenamiento o destilación de clasificadores propios: al ser MIT y de 32M parámetros, sirve como etiquetador barato para generar datos de entrenamiento de detectores de secretos a medida.

## Benchmarks y rendimiento

Holdout humano de 1.264 líneas (472 credenciales, 159 grupos de origen); intervalos del 95 % por bootstrap agrupado por repositorio o fichero de reglas.

| Sistema | Precision | Recall | F1 |
|---|---|---|---|
| credential-line-32m v2 | 0,916 [0,866; 0,958] | 0,807 [0,723; 0,884] | 0,858 [0,802; 0,907] |
| credential-line-32m v1 | 0,848 [0,782; 0,908] | 0,731 [0,650; 0,807] | 0,785 [0,728; 0,842] |
| Regresión logística de n-gramas de caracteres, mismos datos | 0,761 [0,686; 0,828] | 0,761 [0,679; 0,836] | 0,761 [0,704; 0,812] |
| Qwen2.5-Coder-14B zero-shot | 0,593 [0,542; 0,648] | 0,998 [0,993; 1,000] | 0,744 [0,703; 0,786] |
| Catálogo de reglas (redacción de trazas Flywheel) | 0,656 [0,595; 0,723] | 0,593 [0,539; 0,656] | 0,623 [0,576; 0,678] |
| detect-secrets 1.5.0, plugins por defecto | 0,704 [0,647; 0,756] | 0,398 [0,342; 0,451] | 0,509 [0,453; 0,554] |
| Catálogo de reglas OR este modelo | 0,707 [0,653; 0,765] | 0,888 [0,852; 0,924] | 0,787 [0,745; 0,832] |
| Catálogo de reglas AND este modelo | 0,968 [0,942; 0,992] | 0,513 [0,439; 0,592] | 0,670 [0,603; 0,738] |

Datos adicionales reportados por el autor:

- Conjunto sintético de regresión (6.207 líneas, de la v1): F1 0,994 [0,991; 0,997]; 372/379 credenciales en formatos nunca vistos en entrenamiento, 775/782 en formatos entrenados, 0/409 negativos difíciles marcados y 0/4.637 líneas de código natural marcadas. El propio autor lo califica de comprobación de regresión, no de precisión real.
- Velocidad: ONNX fp32 en CPU Intel de escritorio, 4 hilos, tokenización incluida; 4,1 ms de mediana y 7,5 ms de percentil 95 por línea con tamaño de lote 1 (500 líneas); 219 líneas por segundo con lote de 32. El catálogo de reglas tarda 0,04 ms por línea.
- Calibración: ECE 0,037 y Brier 0,072 en el holdout tras temperature scaling (v1: 0,140 y 0,142).

## Requisitos de hardware

- VRAM estimada: no requiere GPU. Con 32M parámetros en fp32, el modelo ocupa del orden de 128 MB de pesos más el overhead del runtime, y el repositorio completo pesa 0,3 GB.
- GPU recomendadas: innecesarias; cualquier CPU moderna sirve. En GPU, cualquier tarjeta con más de 1 GB de memoria libre (incluidas GTX 1050, RTX 3050 o inferiores) puede ejecutarlo sin problema.
- Cabe en cualquier ordenador de consumo: portátiles, mini-PC y entornos de CI con CPU compartida.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor, con el script `predict_onnx.py`), transformers con PyTorch, y text-embeddings-inference según los tags del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tamaño.
- Latencia y throughput: 4,1 ms de mediana y 7,5 ms de p95 por línea a lote 1; 219 líneas/s a lote 32 en CPU Intel de escritorio con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Precisión (holdout) | Recall (holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| credential-line-32m v2 | 32M | Clasificador ModernBERT | 0,916 | 0,807 | MIT | Hugging Face (ONNX + safetensors) |
| detect-secrets 1.5.0 | No aplica (reglas + heurísticas) | Escáner de secretos | 0,704 | 0,398 | Apache 2.0 (proyecto Yelp) | PyPI |
| Catálogo de reglas Flywheel | No aplica (reglas) | Escáner de secretos | 0,656 | 0,593 | No disponible en la información | Repositorio del autor |
| Qwen2.5-Coder-14B zero-shot | 14B | LLM generativo | 0,593 | 0,998 | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-Coder-14B ilustra el compromiso: el LLM encuentra casi todas las credenciales pero marca 323 líneas limpias frente a 35 del clasificador, y su latencia por línea es aproximadamente quince veces mayor según el autor. Frente a detect-secrets y al catálogo de reglas, el clasificador gana en F1 y en precisión, y la combinación OR con el catálogo de reglas ofrece el mejor equilibrio práctico (recall 0,888, F1 0,787).

## Limitaciones y advertencias

- Se le escapa aproximadamente 1 credencial de cada 5 en líneas humanas (91 de 472 en el holdout). Los fallos se concentran en contraseñas cortas o con forma de palabra (`"thisismypassword"`, `super$ecret`, `devpass`), contraseñas dentro de cadenas de conexión largas y claves cuya única pista está en la línea siguiente.
- No sirve para descartar hallazgos de un escáner de reglas: entre las líneas marcadas por el catálogo, sus llamadas de "limpio" acertaron 139 de 177 veces (0,785 [0,637; 0,938]). El autor recomienda conservar todos los hits del escáner de reglas.
- Genera falsos positivos con hashes de contraseña estilo crypt (`$6$...`, `$2y$...`), tokens de idempotencia y nombres de host que parecen aleatorios; de 35 falsos positivos, varios pertenecen a estas categorías.
- Los UUID siguen siendo difíciles de distinguir de secretos en algunos casos, aunque la v2 redujo los falsos positivos por UUID de 17 a 2.
- El modelo solo ve una línea: no aprovecha contexto multilínea, por lo que credenciales partidas en varias líneas o definidas en una línea anterior pueden no detectarse.
- No debe ser la única comprobación antes de publicar un fichero; el propio autor lo posiciona como complemento de un escáner de reglas.
- El umbral y la temperatura forman parte de la política calibrada; usar el softmax crudo con umbral 0,5 produce decisiones distintas y no calibradas.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales conocidas.
- No se documentan sesgos por idioma ni comportamiento fuera de líneas de código, configuración, logs o prosa técnica; los idiomas soportados no están disponibles.
- El conjunto sintético de regresión no debe interpretarse como medida de precisión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaindanaharper/credential-line-32m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Benchmark CredData: https://github.com/SAP/creddata
- Nosey Parker (ejemplos de reglas): https://github.com/praetorian-inc/noseyparker
- detect-secrets: https://github.com/Yelp/detect-secrets
- Qwen2.5-Coder-14B: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- ONNX Runtime: https://onnxruntime.ai/
- Paper de ModernBERT: no disponible en la información proporcionada
- Repositorio del proyecto Flywheel: no disponible en la información proporcionada
