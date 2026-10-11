# sraivante/TinyFaceNet-300K-Smallplain

## Resumen

TinyFaceNet-300K-Smallplain es un encoder compacto de embeddings faciales publicado por el usuario sraivante en Hugging Face bajo licencia Apache-2.0. No es un modelo de lenguaje: su única salida es un vector de 128 dimensiones calculado a partir de un recorte facial alineado de 112 x 112 píxeles en orden de color BGR. El encoder desplegado tiene 231.781 parámetros entrenables (299.119 parámetros durante el entrenamiento; el contador automático del Hub muestra unos 239K valores almacenados porque incluye los buffers de batch normalization). Está etiquetado como derivado de la familia MobileFaceNet con destilación de conocimiento y entrenado con la receta del modelo 1M v2 del mismo autor.

El modelo resuelve el problema de la verificación e identificación facial en dispositivos con recursos muy limitados, sin GPU. En las pruebas publicadas con PyTorch 2.12.0+cpu y FP32 sobre un Intel Core i7-1360P alcanza 148,7 imágenes/s con un solo hilo de CPU y batch de 1, y 544,6 imágenes/s con cuatro hilos y batch de 16, excluyendo detección, alineación y comparación contra galería. La relevancia actual viene de que permite integrar biometría facial en Raspberry Pi, móviles o microcontroladores con un peso de menos de 1 MB en FP32.

En el benchmark LFW con los 6.000 pares oficiales y validación cruzada de 10 folds obtiene 73,60% ± 1,47 en BGR, frente al 73,22% ± 1,84 del 1M v2, una ganancia de solo 0,38 puntos porcentuales (23 pares). Bajo la canalización RGB heredada queda ligeramente por debajo del 1M v2 (63,17% frente a 63,62%). El repositorio no incluye galería de identidades, nombres reales ni pesos de clasificación: para nombrar a alguien hace falta aportar una galería de enrolamiento con consentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN compacta de extracción de embeddings faciales, etiquetada como MobileFaceNet con cabeza ArcFace según las etiquetas del repositorio; no es transformer ni MoE |
| Parametros totales | 299.119 parámetros durante el entrenamiento; 231.781 parámetros en el encoder desplegado; el Hub cuenta 238.775 valores almacenados porque incluye buffers de batch normalization |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un recorte facial alineado de 112 x 112 píxeles en BGR y la salida es un embedding de 128 dimensiones |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en coma flotante y las pruebas de velocidad publicadas se hicieron en CPU FP32. No se documentan versiones cuantizadas |
| Idiomas soportados | no aplica; el modelo no procesa texto ni habla |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

Datos adicionales: pipeline declarado `image-feature-extraction`, repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta. Dataset asociado: `sraivante/TinyFaceNet-300K-Smallplain-provenance`.

## Arquitectura y entrenamiento

La información disponible describe un encoder facial compacto entrenado desde cero con la receta del modelo 1M v2 del propio autor. Las etiquetas del repositorio indican arquitectura tipo MobileFaceNet, pérdida o cabecera ArcFace y destilación de conocimiento, aunque la model card no detalla la configuración de capas, el número exacto de tokens o imágenes de entrenamiento ni la composición del dataset. El nombre del modelo y el repositorio de procedencia asociado remiten a "300K", pero no se explicita en el texto qué representa esa cifra ni cómo se filtró o muestreó el conjunto.

La innovación principal no está en la arquitectura, sino en el régimen de entrenamiento y en la reproducibilidad de la evaluación: el autor publica hashes de pares, cachés y checkpoints, y los resultados fold a fold en `results/lfw_*.json`. La evaluación LFW usa los 6.000 pares oficiales, 10 folds contiguos de 600 pares, con el umbral de coseno seleccionado en cada fold sobre los otros 5.400 pares en una rejilla de [-1, 1) con paso 0,002, sin ajustar el modelo sobre LFW. Los recortes provienen de la canalización de alineación de cinco puntos `buffalo_l` ya existente, sin detecciones fallidas ni pares descartados. La desviación estándar publicada es entre folds, no un intervalo de confianza.

El autor documenta además una corrección de orden de color: el entrenamiento usa BGR, mientras que las cifras LFW antiguas se calcularon con entrada RGB (62,6% en v1 y 63,6% en v2), por lo que las comparaciones solo son válidas BGR contra BGR o RGB contra RGB.

## Capacidades

- Extracción de embeddings faciales: produce un vector de 128 dimensiones a partir de un recorte alineado de 112 x 112 en BGR, con normalización L2 incluida en el pipeline medido.
- Verificación 1:1: comparación por similitud de coseno entre dos embeddings para decidir si corresponden a la misma persona.
- Identificación 1:N: búsqueda del vecino más cercano contra una galería de enrolamiento suministrada externamente.
- Inferencia en CPU y dispositivos edge: no requiere GPU ni aceleradores dedicados.
- Ejecución por lotes: soporta batch de 16 con mejor throughput que batch de 1.
- Generación de texto: no soportada. El modelo no genera lenguaje.
- Razonamiento, matemáticas y código: no soportados.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica; el modelo no procesa texto ni audio.
- Visión general: limitada a rostros alineados; no se documentan capacidades de detección, segmentación, OCR ni descripción de imágenes.
- Modo "thinking", audio o vídeo: no soportados.
- Privacidad por diseño: no se publican imágenes personales, nombres reales, mapeos de identidad, embeddings de enrolamiento, centroides ni pesos de clasificación. Las etiquetas Name1 a Name9 son anónimas.

## Casos de uso

- Control de acceso en puertas y tornos: el encoder genera un embedding de 128 dimensiones de la cara capturada y lo compara por coseno contra la galería de empleados autorizados enrolados con consentimiento. Cabe en un lector de placa reducida y procesa a 148,7 imágenes/s con un solo hilo de CPU, por lo que la verificación se resuelve en el propio dispositivo sin enviar biometría a la nube.
- Autenticación en Raspberry Pi y dispositivos TinyML: con 231.781 parámetros (menos de 1 MB en FP32), el modelo puede convivir con otros procesos en un SoC de gama baja. Las mediciones publicadas sobre un i7-1360P (12 núcleos físicos / 16 lógicos) sirven como cota superior de latencia para hardware más modesto.
- Deduplicación de galerías fotográficas: agrupar imágenes de un archivo corporativo o de un evento por identidad anónima usando similitud de coseno, sin necesidad de nombrar a nadie. El modelo funciona como extractor de características y el clustering se hace fuera del modelo.
- Verificación en aplicaciones móviles: integrar el encoder en una app Android o iOS para comprobar que el usuario de una cuenta coincide con la selfi de enrolamiento, manteniendo la imagen en el dispositivo y cumpliendo minimización de datos.
- Moderación de contenido y anonimización: detectar caras repetidas en un repositorio de vídeo para aplicar desenfoque consistente sobre la misma persona en todo el metraje, usando la distancia entre embeddings como criterio de continuidad.
- Analítica de afluencia sin identificación: contar personas únicas que entran en un espacio durante una franja horaria generando embeddings efímeros y descartándolos al cierre de la sesión, de modo que no se conserva ningún dato biométrico persistente.
- Investigación en biometría y destilación: servir de modelo estudiante para experimentos de compresión, cuantización o destilación, con una línea base reproducible y scripts de velocidad y métricas publicados.

## Benchmarks y rendimiento

Evaluación LFW (6.000 pares oficiales, 10 folds contiguos de 600 pares, umbral de coseno ajustado en los otros 5.400 pares) y evaluación privada del autor (59 recortes sin modificar, centroide de entrenamiento más cercano y argmax sin rechazo):

| Modelo | LFW BGR media ± SD entre folds | LFW RGB heredado | Privado familiar (49) | Privado global (59) |
|---|---:|---:|---:|---:|
| 1M v1 | 72,02% ± 1,21 | 62,57% | 97,96% | 88,14% |
| 1M v2 | 73,22% ± 1,84 | 63,62% | 95,92% | 89,83% |
| Remix | 69,10% ± 1,90 | 66,25% | 89,80% | 84,75% |
| Remix2 | 65,75% ± 1,50 | 62,25% | 85,71% | 76,27% |
| **Smallplain 300K** | **73,60% ± 1,47** | **63,17%** | **95,92%** | **91,53%** |

Desglose privado por identidad anónima (recuento de holdout y acierto de cada modelo de la familia):

| Identidad | Holdout | 1M v1 | 1M v2 | Remix | Remix2 | Smallplain |
|---|---:|---:|---:|---:|---:|---:|
| Name1 | 1 | 100,00% | 100,00% | 100,00% | 100,00% | 100,00% |
| Name2 | 0 | no medido | no medido | no medido | no medido | no medido |
| Name3 | 7 | 100,00% | 85,71% | 85,71% | 42,86% | 85,71% |
| Name4 | 11 | 90,91% | 90,91% | 90,91% | 90,91% | 90,91% |
| Name5 | 8 | 100,00% | 100,00% | 87,50% | 87,50% | 100,00% |
| Name6 | 0 | no medido | no medido | no medido | no medido | no medido |
| Name7 | 9 | 100,00% | 100,00% | 100,00% | 100,00% | 100,00% |
| Name8 | 0 | no medido | no medido | no medido | no medido | no medido |
| Name9 | 13 | 100,00% | 100,00% | 84,62% | 92,31% | 100,00% |
| Background | 10 | 40,00% | 60,00% | 60,00% | 30,00% | 70,00% |

Velocidad en CPU (Intel Core i7-1360P, 12 núcleos físicos / 16 lógicos, Windows 11, PyTorch 2.12.0+cpu, FP32, entrada sintética preasignada, `eval` + `inference_mode`, embedding más normalización L2; excluye detección, alineación, E/S y matching de galería):

| Hilos CPU | Batch | Modelo | Mediana por lote (ms) | p95 por lote (ms) | Imágenes/s |
|---:|---:|---|---:|---:|---:|
| 1 | 1 | 1M v1 | 14,623 | 15,566 | 68,4 |
| 1 | 1 | 1M v2 | 14,792 | 16,388 | 67,6 |
| 1 | 1 | Smallplain 300K | 6,725 | 7,657 | 148,7 |
| 1 | 16 | 1M v1 | 216,398 | 274,209 | 73,9 |
| 1 | 16 | 1M v2 | 215,540 | 247,803 | 74,2 |
| 1 | 16 | Smallplain 300K | 63,080 | 70,210 | 253,6 |
| 4 | 1 | 1M v1 | 10,922 | 12,482 | 91,6 |
| 4 | 1 | 1M v2 | 10,734 | 12,053 | 93,2 |
| 4 | 1 | Smallplain 300K | 7,180 | 8,789 | 139,3 |
| 4 | 16 | 1M v1 | 77,837 | 81,321 | 205,6 |
| 4 | 16 | 1M v2 | 77,567 | 81,699 | 206,3 |
| 4 | 16 | Smallplain 300K | 29,377 | 31,938 | 544,6 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas del reconocimiento facial (por ejemplo, detección, OCR o clasificación genérica de imágenes).

## Requisitos de hardware

- Peso del modelo: 231.781 parámetros del encoder desplegado, aproximadamente 0,93 MB en FP32; los 238.775 valores almacenados en safetensors ocupan en torno a 0,96 MB. El repositorio completo mide 0,0 GB.
- VRAM estimada para inferencia: prácticamente despreciable. Cada imagen de entrada ocupa 112 x 112 x 3 = 37.632 valores (unos 150 KB en FP32) y cada embedding de salida 128 valores (512 bytes en FP32). El modelo no necesita GPU.
- GPU recomendadas: no aplica. Cualquier GPU consumer (RTX 4090, RTX 3060, integradas) puede ejecutarlo, pero no aporta ventaja relevante frente a CPU para este tamaño.
- ¿Cabe en GPU consumer? Sí, con enorme margen: el cuello de botella es la latencia de lanzamiento de kernels, no la memoria.
- CPU de referencia medida: Intel Core i7-1360P (13ª generación, 12 núcleos físicos / 16 lógicos), Windows 11, PyTorch 2.12.0+cpu, FP32.
- Latencia y throughput medidos: 6,725 ms por imagen con 1 hilo y batch 1; 29,377 ms por lote de 16 con 4 hilos (544,6 imágenes/s). La ganancia de batch es mayor con pocos hilos; con 4 hilos y batch 1 el rendimiento baja ligeramente respecto a 1 hilo (139,3 frente a 148,7 imágenes/s).
- Opciones de despliegue: PyTorch es el runtime de referencia documentado. Exportaciones a ONNX, TFLite, Core ML u otros runtimes no están documentadas. Los servidores orientados a LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Recomendaciones prácticas: usar batch de 16 y 1 hilo cuando se procesen colas largas de imágenes; usar batch de 1 con 1 hilo cuando la latencia por petición sea prioritaria. Añadir el coste de detección y alineación facial externa, que queda fuera de las cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | LFW BGR | LFW RGB heredado | Privado global (59) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| TinyFaceNet-300K-Smallplain | 231.781 en inferencia / 299.119 en entrenamiento | 112 x 112 BGR | 73,60% ± 1,47 | 63,17% | 91,53% | Apache-2.0 | Hugging Face, pesos safetensors |
| TinyFaceNet-1M v2 | no disponible | 112 x 112 | 73,22% ± 1,84 | 63,62% | 89,83% | no disponible en la informacion consultada | Hugging Face (repo `sraivante/TinyFaceNet-1M`) |
| TinyFaceNet-1M v1 | no disponible | 112 x 112 | 72,02% ± 1,21 | 62,57% | 88,14% | no disponible en la informacion consultada | Hugging Face (repo `sraivante/TinyFaceNet-1M`) |
| TinyFaceNet Remix2 | no disponible | 112 x 112 | 65,75% ± 1,50 | 62,25% | 76,27% | no disponible en la informacion consultada | Familia publicada por el mismo autor |

Comparación con alternativas externas (por ejemplo, modelos ArcFace o InsightFace de uso habitual en reconocimiento facial): no disponible. La información proporcionada no incluye cifras de modelos de terceros; el único uso documentado de `buffalo_l` es la generación de los recortes alineados de cinco puntos empleados en la evaluación. Cualquier comparación numérica con esas alternativas exigiría reejecutar la misma canalización de evaluación.

## Limitaciones y advertencias

- Exactitud modesta en términos absolutos: 73,60% en LFW está muy lejos de los modelos de reconocimiento facial de gran tamaño. La diferencia frente al 1M v2 (0,38 puntos porcentuales, 23 pares) no establece superioridad general, tal como advierte el propio autor.
- Riesgo de falso positivo y falso negativo elevado en umbrales operativos reales; en identificación 1:N sobre galerías grandes la precisión se degrada rápidamente.
- Sesgos demográficos: no se han publicado evaluaciones desagregadas por género, tono de piel, edad, gafas, barba, iluminación o ángulo. No hay evidencia de equidad entre subgrupos.
- Sensibilidad al orden de color: el modelo espera BGR. Alimentarlo con RGB produce una caída drástica del rendimiento (63,17% frente a 73,60% en LFW), documentada explícitamente por el autor.
- Dependencia del alineamiento: la entrada debe ser un recorte alineado de 112 x 112. Errores de detección o alineación aguas arriba degradan el embedding y no están cubiertos por las métricas publicadas.
- Alucinación: no aplica en el sentido generativo, pero la similitud de coseno no es una probabilidad calibrada. En la evaluación privada se usa argmax sin rechazo, lo que fuerza una respuesta incluso ante individuos desconocidos.
- Contexto y idioma: no aplica. El modelo no procesa texto ni lenguaje hablado.
- Reproducibilidad incompleta de las cifras privadas: no se publica la galería de identidades, por lo que los resultados sobre los 59 recortes privados no pueden reproducirse solo con los archivos públicos.
- Protocolo de selección de checkpoint: el holdout por fecha se reutilizó en cada época para elegir checkpoint, por lo que no es un conjunto de test final intacto. Tres identidades (Name2, Name6, Name8) no tienen ejemplos de holdout.
- Solapamiento con el profesor no auditado: el autor indica que no se auditó si los datos de entrenamiento del modelo profesor se solapan con LFW.
- Privacidad: la eliminación de metadatos de identidad no constituye una garantía formal de privacidad diferencial sobre los pesos entrenados. El encoder necesita una galería de enrolamiento suministrada aparte y con consentimiento para nombrar a alguien.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el despliegue biométrico está sujeto a normativa de protección de datos (RGPD y equivalentes), que exige base legal, consentimiento y evaluación de impacto. La licencia del modelo no cubre esas obligaciones.
- Uso responsable: el modelo no incorpora detección de vivacidad ni antisuplantación; usarlo como única barrera de autenticación es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/TinyFaceNet-300K-Smallplain
- Dataset de procedencia: https://huggingface.co/datasets/sraivante/TinyFaceNet-300K-Smallplain-provenance
- Familia TinyFaceNet-1M (modelos de referencia usados en la comparativa): https://huggingface.co/sraivante/TinyFaceNet-1M/tree/e068dc37230bcb39af58f16af9254936774a8224
- Paper, blog técnico, repositorio de código o demo: no disponible en la información proporcionada.
