# wesjos/fairface-passport-3task-112

## Resumen

FairFace-Passport-3Task-112 es un modelo de clasificación de atributos faciales desarrollado por el usuario wesjos. Se trata de un fine-tuning completo del backbone de reconocimiento facial ArcFace (checkpoint `recognizer.pt`), adaptado para predecir simultáneamente tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos ordinales). El modelo opera sobre imágenes RGB de 112x112 píxeles y cuenta con 43,6 millones de parámetros.

El modelo se entrena sobre el dataset FairFace (Karkkainen & Joo, WACV 2021), un conjunto de 97.698 imágenes diseñado específicamente para medir y mitigar sesgos en sistemas de reconocimiento facial. La propuesta del autor es ofrecer una alternativa con mayor precisión en estimación de edad que modelos como cnano/tvit, con un rendimiento declarado de 2.972 imágenes por segundo.

Es relevante en el contexto de auditoría de sesgos y evaluación de equidad en sistemas de visión por computador. El propio autor restringe explícitamente su uso a investigación y auditoría algorítmica, prohibiendo aplicaciones de vigilancia, verificación de identidad o toma de decisiones automatizada de alto riesgo. El modelo se publica bajo licencia CC BY 4.0 y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN backbone ArcFace (reconocimiento facial), fine-tuning completo multi-tarea |
| Parámetros totales | 43.581.009 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (PyTorch) |

Otros datos técnicos: resolución de entrada 112x112 RGB, normalización con media y desviación estándar de (0.5, 0.5, 0.5). Tamaño del repositorio: 0,5 GB.

## Arquitectura y entrenamiento

El modelo parte de un backbone de reconocimiento facial ArcFace (`recognizer.pt`, checkpoint local de reconocimiento) y aplica un fine-tuning completo de todos los parámetros para tres cabezas de clasificación simultáneas: raza con 7 clases, género con 2 clases y edad con 8 umbrales ordinales que generan 9 rangos. La entrada es una imagen RGB de 112x112 píxeles normalizada con media y desviación estándar de 0.5 en los tres canales.

El entrenamiento se realizó sobre el dataset FairFace, deduplicado por contenido mediante SHA-256: 77.926 imágenes de entrenamiento, 8.659 de selección (validación) y 10.931 de test. El autor declara que las intersecciones entre conjuntos son cero y que ninguna imagen de la partición oficial de entrenamiento entró en el conjunto de evaluación. El entrenamiento se ejecutó con una única semilla aleatoria, y el autor advierte que diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico. No se documenta el uso de RLHF, DPO ni técnicas de alineación, dado que no es un modelo generativo.

## Capacidades

- Clasificación simultánea de tres atributos demográficos en una sola pasada: raza (7 clases), género (2 clases) y edad (9 rangos ordinales).
- Estimación de edad con métrica ordinal: además del rango, reporta MAE en brackets (0,4401) y precisión ±1 bracket (96,40%).
- Procesamiento de imágenes faciales a resolución 112x112, compatible con pipelines de reconocimiento facial estándar.
- Inferencia de alto rendimiento: 2.972 imágenes por segundo según el autor.
- Integración con el ecosistema PyTorch y timm; dependencias declaradas: `torch`, `timm`, `torchvision`, `pillow`.
- Interfaz de uso sencilla mediante el módulo `inference` incluido en el repositorio (`inference.load` y `inference.predict`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión general (solo rostros), audio ni modo thinking: es un clasificador de imagen, no un modelo generativo.

## Casos de uso

- Auditoría de sesgos en datasets faciales: el modelo permite medir la distribución de atributos demográficos en un conjunto de imágenes y comparar la precisión por subgrupo (raza, género, edad) para detectar disparidades. Es adecuado porque se entrenó explícitamente sobre FairFace, un dataset diseñado para este fin.
- Evaluación de equidad en sistemas de reconocimiento facial de terceros: se puede usar como clasificador auxiliar para etiquetar demográficamente los rostros de un benchmark y analizar si el sistema evaluado rinde de forma desigual entre grupos.
- Investigación académica sobre estimación de edad: la métrica ordinal (MAE en brackets, precisión ±1 bracket) facilita comparaciones rigurosas con otros modelos de estimación de edad.
- Análisis de composición demográfica de datasets de imágenes: procesar grandes volúmenes a 2.972 img/s permite etiquetar corpus de decenas de miles de imágenes en segundos, útil para documentar la representatividad de un dataset antes de entrenar otros modelos.
- Validación de pipelines de preprocesado facial: al operar a 112x112 con normalización estándar, sirve para verificar que el recorte, alineamiento y normalización de un pipeline de reconocimiento producen resultados coherentes.
- Docencia y experimentación en clasificación multi-tarea: el modelo es un ejemplo compacto (43,6M parámetros) de fine-tuning multi-cabeza sobre un backbone preentrenado, útil para prácticas de visión por computador.
- Estudio de límites categoriales demográficos: las advertencias del autor sobre fronteras no discretas entre grupos (latino/hispano, Oriente Medio, indio, blanco) lo hacen útil para investigar la validez de las taxonomías demográficas en visión artificial.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test congelado de 10.931 imágenes:

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 73,74% | 73,36% | 10.931 |
| Género (2 clases) | 95,17% | 95,16% | 10.931 |
| Edad (9 rangos ordinales) | 60,17% | 54,74% | 10.931 |
| Media de las 3 tareas | 76,36% | no disponible | 10.931 |

Métricas adicionales de edad: MAE de 0,4401 brackets y precisión ±1 bracket del 96,40%.

El autor afirma que, a resolución 112², la precisión de edad supera significativamente a cnano/tvit (+1,8 a +2,0 puntos porcentuales), pero no se proporcionan en la información disponible las cifras concretas de ese modelo comparable ni una tabla comparativa completa. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 43,6M parámetros en FP32, los pesos ocupan aproximadamente 174 MB; en FP16, unos 87 MB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutarlo con holgura, pero el autor no publica requisitos ni pruebas de hardware.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido tamaño del modelo, aunque no se confirma con datos del autor.
- Opciones de despliegue: inferencia nativa en PyTorch mediante el módulo `inference` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: 2.972 imágenes por segundo según el autor, sin especificar el hardware empleado para esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Resolución | Licencia | Rendimiento |
|---|---|---|---|---|---|
| FairFace-Passport-3Task-112 | 43,6M | Raza + género + edad | 112x112 | CC BY 4.0 | Edad 60,17%; media 76,36% |
| cnano/tvit | no disponible | Atributos faciales | no disponible | no disponible | Inferior en edad según el autor (+1,8 a +2,0 pp a favor del modelo evaluado); cifras no publicadas en la información disponible |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo menciona cnano/tvit como referencia comparativa, sin detallar sus especificaciones ni sus métricas exactas. No se dispone de datos suficientes para una comparativa más amplia.

## Limitaciones y advertencias

- Uso restringido a investigación: el autor prohíbe explícitamente el uso para vigilancia, verificación de identidad, contratación, evaluación crediticia o cualquier toma de decisiones automatizada de alto riesgo.
- Reutilización del conjunto de evaluación: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y no una estimación limpia de generalización.
- Semilla única: el entrenamiento usó una sola semilla aleatoria; diferencias inferiores a 0,3 pp deben tratarse como ruido estadístico.
- Disparidades demográficas: las fronteras entre grupos (especialmente latino/hispano, Oriente Medio, indio y blanco) no son discretas, y la estimación de edad presenta mayores tasas de error; determinados subgrupos interseccionales género x raza muestran disparidades superiores.
- Atribución de etiquetas: las etiquetas reflejan las anotaciones categóricas del dataset FairFace y no la autoidentificación de las personas ni su ascendencia real.
- Riesgo de uso indebido: clasificar raza, género y edad de rostros tiene implicaciones éticas y legales severas en muchas jurisdicciones (por ejemplo, el RGPD en la UE considera estos datos biométricos como categoría especial).
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las restricciones éticas del autor no son jurídicamente vinculantes por sí solas; el cumplimiento normativo local es responsabilidad del usuario.
- Limitación de idioma: la documentación y las etiquetas están únicamente en inglés.
- Backbone preentrenado: los derechos del backbone ArcFace pertenecen a sus autores originales; el autor no detalla la procedencia exacta ni la licencia de `recognizer.pt`.
- Sin datos de robustez: no se documentan pruebas frente a oclusión, iluminación adversa, baja resolución o rostros no frontales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-passport-3task-112
- Dataset FairFace en Hugging Face: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): no disponible como enlace directo en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
- Blog del autor: no disponible
