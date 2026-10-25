# Titlehhhh/captchaocr-ppocrv6

## Resumen

CaptchaOCR PP-OCRv6 es un ajuste fino del modelo de reconocimiento de texto PP-OCRv6_medium_rec de PaddlePaddle, publicado por el usuario Titlehhhh en Hugging Face. Su única tarea es leer el código dibujado en imágenes de captcha generadas por plugins anti-bot de Minecraft: recibe una imagen y devuelve la cadena de caracteres que contiene. No es un solucionador genérico de captchas, sino un reconocedor especializado en 15 estilos concretos de plugins de código abierto cuyos alfabetos encajan en el diccionario de PP-OCRv6.

El modelo tiene 19.176.118 parámetros, conserva la cabeza de clasificación preentrenada de 18.710 clases (índice 0 reservado para el token en blanco) y se distribuye en safetensors bajo licencia Apache-2.0, con un tamaño de repositorio de 0,2 GB. Se entrenó durante 5 épocas (1.875 pasos, batch 32, lr 1e-5, fp16) sobre 800 imágenes sintéticas por cada uno de los 15 tipos, con el checkpoint de la época 2 como mejor resultado.

Su relevancia es doble: por un lado, demuestra que un reconocedor OCR de 19M de parámetros puede resolver estilos de captcha muy dispares con una coincidencia exacta mediana del 0,920; por otro, documenta con honestidad sus límites (dos tipos por debajo del 7 % de acierto y degradación severa ante plugins no vistos), algo poco habitual en este tipo de publicaciones. Es una ficha útil para quien necesite evaluar OCR de texto corto en imágenes pequeñas, ruidosas y con distorsión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor OCR PP-OCRv6 (backbone convolucional + encoder + cabeza CTC), clase `PPOCRV6SmallRecForTextRecognition` |
| Parámetros totales | 19.176.118 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; la salida es una secuencia CTC de longitud acotada por la etiqueta (no se especifica el máximo en la información disponible) |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors (el ajuste fino se hizo en fp16). No hay GGUF, ONNX ni versiones cuantizadas en el repositorio |
| Idiomas soportados | `en`, `ru` (según metadatos). El diccionario de PP-OCRv6 no contiene cirílico, por lo que el ruso se limita a captchas con transliteración latina (p. ej. `GalleryCaptcha/ru-web`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`), más `character_list.txt` con las 18.710 entradas del diccionario |
| Pipeline | image-to-text |
| Modelo base | `PaddlePaddle/PP-OCRv6_medium_rec_safetensors` (Apache-2.0) |
| Número de clases | 18.710 (índice 0 = blank; cabeza preentrenada conservada, no reemplazada) |
| Creado / actualizado | 2026-10-22 / 2026-10-24 |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de PP-OCRv6 en su variante de reconocimiento: un extractor convolucional que produce una secuencia de características, un encoder sobre esa secuencia y una cabeza de clasificación con decodificación CTC codiciosa sobre 18.710 clases. El ajuste fino no sustituye la cabeza preentrenada, lo que implica que el vocabulario queda fijado al diccionario original de PP-OCRv6 (letras y dígitos de varios alfabetos latinos más los operadores `+-*/=`). El acceso al modelo requiere llamar a las capas internas (`model.model`, `model.head.encoder`, `model.head.head`) y decodificar manualmente contra `character_list.txt`; el preprocesado ya está parcheado en `preprocessor_config.json` con normalización mean = std = 0,5 (convención de PaddleOCR).

El entrenamiento usó el dataset sintético `Titlehhhh/captchaocr-dataset`: 15 tipos × 800 imágenes, 5 épocas, 1.875 pasos, batch 32, lr 1e-5 y fp16, seleccionando el checkpoint de la época 2. Las imágenes son re-renders de captchas dibujados por plugins de Minecraft de código abierto (Krypton, XProtect, AnBot, Sonar, Mapcha, BotFilter, Minecaptcha, ProstoCaptcha, ReproductionCAPTCHA, CaptchaVerifyZ, GalleryCaptcha, entre otros). Un detalle técnico destacable es la ausencia deliberada de interpolación de pesos (WiSE-FT, α = 1,0): la versión anterior del repositorio publicaba α = 0,4 para no degradar plugins no vistos, mientras que esta versión, entrenada sobre la mayoría de los tipos evaluados, pierde precisión al interpolar (mediana exacta de 0,883 con α = 1,0 frente a 0,738 con α = 0,4 en 6 tipos retenidos).

## Capacidades

- Reconocimiento de texto en imágenes pequeñas (captchas de 128×128 a 130×130 en los casos documentados), con recorte de la banda de texto cuando el tipo la tiene.
- Decodificación CTC codiciosa sobre un vocabulario de 18.710 clases: letras y dígitos latinos y los operadores `+-*/=`.
- Alta precisión en estilos concretos: coincidencia exacta de 1,000 en `CaptchaVerifyZ/map`, 0,995 en `ReproductionCAPTCHA/map` y 0,985 en `AnBot/captcha`.
- Robustez moderada frente a ruido y distorsión en parte del conjunto: `Krypton/map` 0,980, `GalleryCaptcha/ru-web` 0,945, `Mapcha` 0,945, `BotFilter` 0,935.
- Capacidad de trabajar con imágenes de un solo canal de texto sobre fondo plano o con ruido diagonal fino, dentro de los estilos vistos en entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking": es un modelo puramente perceptivo imagen→texto.
- No soporta visión general, VQA, detección de cajas, ni lectura de documentos completos.
- No soporta alfabeto cirílico: los tipos `GalleryCaptcha/{ru-numberword, ru-numberword-caption, ru-symbols}` y `LimboFilter/{map, symbols}` quedan fuera del diccionario.
- Multilingüismo limitado a lo que el diccionario PP-OCRv6 permite (etiquetado como `en` y `ru`, pero sin caracteres cirílicos).

## Casos de uso

- Verificación automatizada de plugins anti-bot propios: en un servidor de Minecraft del que se es administrador, el modelo puede leer los captchas generados por el propio plugin para comprobar que el flujo de registro funciona de extremo a extremo en pruebas de integración.
- Pruebas de regresión de plugins de captcha: al integrarse en un pipeline de CI, permite medir automáticamente la tasa de acierto del OCR contra cada nueva versión del plugin y detectar si un cambio de fuente o de ruido ha hecho el captcha trivialmente legible.
- Auditoría de dificultad y accesibilidad: generar lotes de captchas por tipo y comparar la precisión exacta del modelo (1,000 en `CaptchaVerifyZ` frente a 0,065 en `XProtect`) sirve para cuantificar qué plugins ofrecen una barrera real y cuáles no.
- Etiquetado y arranque de datasets: usar el modelo como etiquetador preliminar sobre captchas nuevos para preanotar y revisar después a mano, aprovechando su mediana de CER de 0,021 en los tipos bien aprendidos.
- Detección de deriva (drift) en captchas de producción: monitorizar la precisión por tipo a lo largo del tiempo; una caída sostenida indica que el plugin ha cambiado su renderizado y que hace falta reentrenar.
- Reconocimiento de texto corto en imágenes pequeñas fuera del dominio de captchas (etiquetas, códigos, rótulos de bajo contraste) siempre que el alfabeto sea latino; el modelo base PP-OCRv6 es un reconocedor general, aunque el ajuste fino lo especializa y puede degradar el rendimiento generalista.
- Investigación sobre robustez de captchas: comparar la resistencia de distintos renderizados frente a un OCR de 19M de parámetros ofrece una línea base barata y reproducible para estudiar el coste real de romper un captcha.

## Benchmarks y rendimiento

Evaluación sobre una ejecución nueva del generador: 20 tipos × 200 = 4.000 imágenes nunca usadas en entrenamiento ni en la selección de época; se puntúan 15 tipos (3.000 imágenes) porque los 5 restantes son cirílicos. Recorte por banda de texto cuando el tipo la tiene, marco completo en caso contrario, decodificación CTC codiciosa y coincidencia exacta sobre el campo `text`.

| Agregado | Valor |
|---|---|
| Mediana de coincidencia exacta (15 tipos) | 0,920 |
| Mediana de CER | 0,021 |
| Coincidencia exacta micro (3.000 imágenes) | 0,745 |
| CER micro | 0,098 |

| Tipo | n | Exacta | CER |
|---|---|---|---|
| `CaptchaVerifyZ/map` | 200 | 1,000 | 0,000 |
| `ringoame196-s-mcPlugin/ReproductionCAPTCHA/map` | 200 | 0,995 | 0,001 |
| `irootdev/AnBot/captcha` | 200 | 0,985 | 0,005 |
| `Archy-X/Krypton/map` | 200 | 0,980 | 0,004 |
| `GalleryCaptcha/ru-web` | 200 | 0,945 | 0,014 |
| `haq/mapcha/map` | 200 | 0,945 | 0,014 |
| `BotFilter/map` | 200 | 0,935 | 0,014 |
| `JSH32/Minecaptcha/map` | 200 | 0,920 | 0,021 |
| `jonesdevelopment/sonar/legacy` | 200 | 0,830 | 0,052 |
| `jonesdevelopment/sonar/complex` | 200 | 0,805 | 0,060 |
| `just-captcha/ProstoCaptcha/map` | 200 | 0,785 | 0,044 |
| `jonesdevelopment/sonar/standard` | 200 | 0,695 | 0,101 |
| `InstantlyMoist/Captcha/textcaptcha` | 200 | 0,220 | 0,438 |
| `LagBug/XProtect/code` | 200 | 0,065 | 0,351 |
| `LagBug/XProtect/map` | 200 | 0,065 | 0,343 |

Barrido de interpolación de pesos hacia el modelo base, medido sobre 6 tipos retenidos (1.200 imágenes):

| α | Mediana exacta | CER |
|---|---|---|
| 0,0 (base) | 0,600 | 0,164 |
| 0,4 | 0,738 | 0,089 |
| 0,8 | 0,858 | 0,046 |
| 1,0 (publicado) | 0,883 | 0,035 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni suites OCR públicas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 77 MB solo para los pesos en fp32 y 38 MB en fp16; con activaciones y un batch reducido, por debajo de 1 GB en cualquier configuración razonable.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1050 Ti, RTX 3060, RTX 4090) es sobrada; en servidor, A100/H100 no aportan ventaja relevante por el tamaño del modelo.
- Cabe en GPU consumer: sí, en todas las tarjetas con al menos 1 GB de VRAM; también en CPU (entrenamiento y evaluación se hicieron con un entorno `.venv-gpu` en Windows, según el snippet de reproducción).
- Opciones de despliegue: únicamente `transformers` con `PPOCRV6SmallRecForTextRecognition` y `PPOCRV6SmallRecImageProcessor`; el repositorio no incluye exportaciones ONNX, TensorRT, vLLM, llama.cpp ni Ollama, y ninguna de esas herramientas aplica a un reconocedor CTC de este tamaño. Para producción en Paddle se puede considerar el ecosistema PaddleOCR/TurboOCR, pero no hay artefactos publicados para este ajuste fino concreto.
- Latencia y throughput: no disponible. No se han publicado medidas; el snippet de uso accede manualmente a las capas internas y decodifica CTC, por lo que el coste real depende de la implementación del decodificador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Titlehhhh/captchaocr-ppocrv6` | 19,18 M | Imagen de captcha; sin contexto textual | Mediana exacta 0,920 y CER 0,021 sobre 15 tipos de Minecraft | Apache-2.0 | Hugging Face, safetensors, 11 descargas |
| `PaddlePaddle/PP-OCRv6_medium_rec_safetensors` (base) | No disponible en la información (la familia PP-OCRv6 cubre de 1,5 M a 34,5 M) | Reconocimiento de líneas de texto; 50 idiomas en un solo modelo según la documentación de PaddleOCR | 83,2 % de precisión de reconocimiento en benchmarks internos de PaddleOCR y 86,2 % de Hmean en detección (PP-OCRv6_medium) | Apache-2.0 | Hugging Face / PaddleOCR |
| PP-OCRv6_small / tiny | 1,5 M–34,5 M (rango de la familia) | Igual que medium, orientado a edge | No disponible por nivel en la información consultada | Apache-2.0 | PaddleOCR |
| PP-OCRv5_server | No disponible | Reconocimiento de líneas de texto | Inferior a PP-OCRv6_medium en −5,1 % de reconocimiento y −4,6 % de Hmean según la documentación de PP-OCRv6 | Apache-2.0 | PaddleOCR |

No se dispone de datos comparativos con solucionadores de captchas específicos (ni propietarios ni abiertos) en la información proporcionada.

## Limitaciones y advertencias

- No es un solucionador general de captchas: solo cubre estilos presentes en el dataset. La propia model card estima una generalización de 0,4–0,6 de mediana exacta ante plugins no vistos, frente al 0,920 en tipos conocidos.
- Dos tipos están prácticamente no aprendidos: `LagBug/XProtect/code` y `LagBug/XProtect/map` (6,5 % de coincidencia exacta) e `InstantlyMoist/Captcha/textcaptcha` (22 %). No es un fallo de decodificación, sino falta de ajuste con 800 imágenes por tipo.
- El diccionario no contiene cirílico: cualquier captcha en ruso con caracteres cirílicos es irresoluble, a pesar de que los metadatos declaren el idioma `ru`.
- Riesgo de sustitución silenciosa: en OCR con CTC es habitual confundir caracteres visualmente próximos (`0`/`O`, `1`/`l`, `5`/`S`). Un CER bajo no garantiza una cadena válida para el plugin, y un fallo de un solo carácter invalida el captcha completo.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero el uso del modelo para superar captchas de terceros puede vulnerar los términos de servicio de los servidores y, en algunas jurisdicciones, la normativa sobre acceso no autorizado a sistemas. El caso legítimo es auditar o testear infraestructura propia o con autorización explícita.
- Procedencia de los datos: el dataset es sintético y re-renderiza captchas de plugins de código abierto; cada tipo arrastra la licencia de su proyecto upstream, lo que conviene revisar antes de un uso comercial.
- Ambigüedad en la nomenclatura: el tag del repositorio y la clase de `transformers` dicen `pp_ocrv6_small_rec` / `PPOCRV6SmallRecForTextRecognition`, mientras que el modelo base declarado es `PP-OCRv6_medium_rec_safetensors`. Conviene verificar qué variante se está cargando realmente.
- API incómoda: no hay método `generate()`; el uso requiere acceder a las capas internas (`model.model`, `model.head.encoder`, `model.head.head`) y decodificar a mano contra `character_list.txt`, lo que complica su integración en pipelines estándar.
- Madurez y validación externa: 11 descargas y 0 likes, sin revisión independiente. Las métricas provienen del propio autor y de una única ejecución del generador sintético.
- Sin cuantizaciones publicadas ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue fuera del ecosistema `transformers`.
- Entrenamiento corto (época 2 de 5) sobre 12.000 imágenes en total: margen probable de mejora, pero también de sobreajuste a los estilos concretos del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Titlehhhh/captchaocr-ppocrv6
- Dataset de entrenamiento: https://huggingface.co/datasets/Titlehhhh/captchaocr-dataset
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_safetensors
- Perfil del autor: https://huggingface.co/Titlehhhh/models
- Documentación de PP-OCRv6 (PaddleOCR): https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html
- Artículo de PP-OCRv6: https://arxiv.org/pdf/2606.13108
- Repositorio TurboOCR (PP-OCRv6 con TensorRT FP16, HTTP + gRPC): https://github.com/aiptimizer/TurboOCR
