# Tata24/bone-age

## Resumen

El modelo `Tata24/bone-age` es un clasificador de imágenes médicas especializado en la estimación de la edad ósea pediátrica a partir de radiografías de mano. Lo desarrolla el usuario Tata24 como una redistribución del modelo original `ianpan/bone-age`, construido sobre el backbone `convnextv2_tiny.fcmae_ft_in22k_in1k` de la librería timm. El problema que resuelve es la determinación automatizada de la madurez esquelética, una tarea clínica habitual en endocrinología pediátrica para detectar trastornos del crecimiento.

Técnicamente es una red convolucional ConvNeXt V2 en configuración tiny, con 84,1 millones de parámetros totales y un tamaño de repositorio de 0,3 GB. El modelo implementa un ensamblado de tres pliegues (3-fold ensemble) que combina las salidas de tres redes entrenadas de forma independiente, y acepta como entrada adicional la variable de sexo del paciente, que modula la predicción. La salida es un valor escalar en meses de edad ósea, obtenido a partir de la suma ponderada de los logits de clasificación por clase mensual.

Su relevancia radica en que reproduce, en un formato redistribuible y con licencia Apache 2.0, un resultado de error absoluto medio de 4,16 meses sobre el conjunto de test del RSNA Pediatric Bone Age Challenge, superando a las mejores soluciones publicadas de dicho reto. No obstante, se distribuye exclusivamente para investigación y demostración, sin aprobación regulatoria para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ConvNeXt V2 (timm `convnextv2_tiny.fcmae_ft_in22k_in1k`), ensamblado de 3 pliegues |
| Parametros totales | 84.148.563 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de imagen; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entrada | radiografía de mano en escala de grises + flag binario de sexo (`female`) |
| Salida | escalar en meses de edad ósea (o logits por clase mensual con `return_logits=True`) |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | timm/convnextv2_tiny.fcmae_ft_in22k_in1k |

## Arquitectura y entrenamiento

El modelo emplea un backbone ConvNeXt V2 en variante tiny, preentrenado con el esquema FCMAE (fully convolutional masked autoencoder) sobre ImageNet-22k y ajustado posteriormente en ImageNet-1k. Sobre este backbone se añade una cabeza de clasificación cuya dimensión corresponde a clases mensuales de edad ósea; la predicción final se obtiene aplicando softmax sobre los logits, multiplicando por el índice de clase y sumando, lo que produce un valor continuo en meses. Originalmente el autor entrenó también una cabeza de regresión, pero solo se carga la de clasificación porque su rendimiento aislado era ligeramente superior y generaba GradCAM de mejor calidad.

El entrenamiento se realizó sobre 14.036 radiografías pediátricas de mano del dataset público RSNA Pediatric Bone Age Challenge 2017. Cada uno de los tres modelos del ensamblado se entrenó durante 20.000 iteraciones con batch size de 64 en dos NVIDIA RTX 3090. Además del aumento de datos estándar, se aplicaron dos aumentaciones específicas con probabilidad 0,5 cada una: recorte de la radiografía mediante el modelo auxiliar `ianpan/bone-age-crop` y coincidencia de histograma contra una imagen de referencia (`ref_img.png`) incluida en el repositorio. Ambas podían combinarse simultáneamente con las aumentaciones estándar, lo que amplía la robustez frente a variabilidad en la apariencia de las radiografías.

## Capacidades

- Clasificación de imágenes radiológicas de mano para estimar edad ósea en meses.
- Ensamblado interno de tres modelos accesibles por separado mediante `model.net0`, `model.net1` y `model.net2`.
- Condicionamiento por sexo del paciente a través del argumento `female` en `forward()`, variable con impacto significativo en la predicción.
- Preprocesado integrado: método `model.preprocess()` para convertir una imagen en el tensor de entrada esperado.
- Carga directa de imágenes DICOM mediante `model.load_image_from_dicom()` si `pydicom` está instalado.
- Salida opcional de logits crudos por clase mensual con `return_logits=True`, útil para análisis de incertidumbre o calibración.
- Generación de mapas de activación GradCAM sobre la cabeza de clasificación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Apoyo a la lectura de radiografías en endocrinología pediátrica: el modelo estima la edad ósea en meses a partir de una radiografía de mano y el sexo del paciente, proporcionando una segunda lectura objetiva que el especialista puede contrastar con su evaluación manual.
- Investigación sobre maduración esquelética: permite procesar cohortes retrospectivas de radiografías con un error absoluto medio de referencia de 4,16 meses, facilitando estudios poblacionales sobre crecimiento y desarrollo.
- Evaluación de pipelines de preprocesado: al aceptar variantes con y sin recorte y con y sin coincidencia de histograma, sirve para medir el impacto de cada técnica de preprocesado en la precisión final (4,42 meses sin ninguna, 4.16 con ambas).
- Docencia y formación radiológica: la generación de GradCAM permite visualizar qué regiones de la mano contribuyen a la estimación, útil para explicar los criterios de madurez ósea.
- Benchmarking de modelos de imagen médica: al estar basado en un backbone timm estándar y distribuirse con licencia Apache 2.0, es un punto de comparación reproducible frente a otros enfoques sobre el mismo dataset RSNA.
- Prototipado de herramientas de triaje: en entornos de investigación se puede integrar en un servicio de inferencia que, dado un DICOM de mano, devuelva una estimación preliminar de edad ósea junto con los logits para análisis posterior.
- Análisis de sensibilidad al sexo: el condicionamiento explícito por la variable `female` permite estudiar cómo varía la predicción entre pacientes masculinos y femeninos en distintos rangos de edad.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test original del RSNA Pediatric Bone Age Challenge (200 radiografías con anotación múltiple), en error absoluto medio (MAE) en meses. Entre corchetes, rendimiento del modelo individual `model.net0`:

| Configuracion | MAE ensamblado (meses) | MAE net0 (meses) |
|---|---|---|
| Sin recorte / sin histogram matching | 4,42 | 4,67 |
| Con recorte / sin histogram matching | 4,47 | 4,84 |
| Sin recorte / con histogram matching | 4,34 | 4,59 |
| Con recorte / con histogram matching | 4,16 | 4,45 |

El autor indica que el resultado de 4,16 meses supera a las mejores soluciones publicadas del reto original. No se han publicado en la información disponible resultados de otros benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo de clasificación de imagen médica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 para una sola red; el ensamblado completo de tres redes requiere aproximadamente 1 GB en fp32 y en torno a 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor entrenó cada pliegue en dos NVIDIA RTX 3090, pero la inferencia es muy ligera.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs de gama baja con 2-4 GB. También funciona en CPU para inferencia puntual.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere `torch`, `opencv-python`, `scikit-image` y, opcionalmente, `pydicom`. No se han publicado versiones GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el formato natural para este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo (84 M de parámetros, 0,3 GB) se espera una latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | MAE (RSNA test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tata24/bone-age (este) | 84,1 M (ensamblado 3x) | Edad ósea en radiografía de mano | 4,16 meses | Apache 2.0 | Hugging Face |
| ianpan/bone-age (original) | 84,1 M (ensamblado 3x) | Edad ósea en radiografía de mano | 4,16 meses | Apache 2.0 | Hugging Face |
| ianpan/bone-age-crop | no disponible | Detección/recorte de mano en radiografía | no aplica | no disponible | Hugging Face |
| Soluciones top del RSNA Challenge 2017 | no disponible | Edad ósea en radiografía de mano | superior a 4,16 meses según el autor | no disponible | publicaciones del reto |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables más allá de los citados en la model card. Cualquier comparación con otros modelos de estimación de edad ósea requeriría consultar sus respectivas fichas y publicaciones, no incluidas en la información proporcionada.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a demostración e investigación; no ha sido aprobado por ninguna agencia reguladora para uso clínico.
- Riesgo de alucinación en el sentido de predicciones plausibles pero incorrectas: el MAE de 4,16 meses implica desviaciones medias de varios meses, con posibles errores mayores en casos atípicos.
- El rendimiento depende fuertemente del preprocesado: sin recorte ni coincidencia de histograma el MAE sube a 4,42 meses, y el modelo está calibrado para funcionar mejor con ambas técnicas aplicadas.
- La variable de sexo es obligatoria y afecta significativamente a la predicción; omitirla o introducirla incorrectamente degrada los resultados.
- Entrenado únicamente sobre radiografías pediátricas de mano del dataset RSNA 2017; no se garantiza su validez en otras modalidades, regiones anatómicas, poblaciones o rangos de edad no representados.
- Posibles sesgos derivados de la composición demográfica del dataset de entrenamiento, no documentada en la información disponible.
- No procesa texto ni otros idiomas; las etiquetas de idioma del repositorio no son aplicables.
- Licencia Apache 2.0 permite uso comercial del software, pero ello no exime de las responsabilidades regulatorias y clínicas asociadas a cualquier uso médico real.
- El usuario asume toda la responsabilidad sobre el uso del modelo y sus salidas, según indica el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tata24/bone-age
- Modelo original: https://huggingface.co/ianpan/bone-age
- Modelo auxiliar de recorte: https://huggingface.co/ianpan/bone-age-crop
- Código de entrenamiento: https://github.com/i-pan/bone-age-prediction
- Dataset RSNA Pediatric Bone Age Challenge: https://www.rsna.org/rsnai/ai-image-challenge/rsna-pediatric-bone-age-challenge-2017
- Publicación con las soluciones top del reto: https://pubs.rsna.org/doi/10.1148/radiol.2018180736
- Backbone base en timm: https://huggingface.co/timm/convnextv2_tiny.fcmae_ft_in22k_in1k
