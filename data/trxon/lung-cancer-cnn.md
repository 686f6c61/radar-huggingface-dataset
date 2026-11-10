# Trxon/lung-cancer-cnn

## Resumen

Lung histopathology CNN es un modelo de clasificación de imágenes histopatológicas desarrollado por el usuario Trxon y publicado en Hugging Face. Clasifica recortes de tejido pulmonar en tres clases: benigno, adenocarcinoma y carcinoma escamoso de pulmón. Se trata de una CNN pequeña implementada en Keras, con tres bloques convolucionales y entrada RGB de 128x128 píxeles, entrenada sobre el subconjunto pulmonar del dataset público LC25000.

El modelo resuelve una tarea de triaje morfológico en imágenes de patología digital: distinguir tejido benigno de dos tipos frecuentes de carcinoma pulmonar no microcítico. Su relevancia es fundamentalmente exploratoria y educativa, ya que el propio autor advierte que el dataset de origen contiene aproximadamente 750 imágenes originales aumentadas hasta 25.000, sin identificadores de imagen fuente, lo que hace probable una fuga de datos entre entrenamiento y test.

El repositorio está vacío (0,0 GB) y no incluye pesos publicados, por lo que el modelo no es directamente desplegable desde Hugging Face en el momento de redactar esta ficha. La licencia es MIT, pero el autor restringe explícitamente el uso a investigación y educación, prohibiendo su uso como dispositivo médico o para decisiones de diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con 3 bloques convolucionales (Keras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 128x128 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, sin salida textual) |
| Licencia | MIT (con restricción de uso a investigación y educación) |
| Formato de pesos | no disponible (repositorio de 0,0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional (CNN) de tres bloques convolucionales que procesa imágenes RGB de 128x128 píxeles y produce una clasificación en tres clases (benigno, adenocarcinoma, carcinoma escamoso). No se dispone de detalles sobre el número de filtros por bloque, la función de activación, el uso de normalización por lotes, dropout ni la capa de clasificación final.

El entrenamiento se realizó sobre el subconjunto pulmonar del dataset LC25000 (copia pública en Hugging Face: `1aurent/LC25000`), con 15.000 imágenes y una partición estratificada aleatoria 70/15/15 con semilla 2022. Se entrenó durante 10 épocas en una GPU Colab T4. No se especifica el optimizador, la función de pérdida, el learning rate ni si se aplicó aumento de datos adicional. El autor señala una limitación metodológica importante: LC25000 contiene aproximadamente 750 imágenes originales aumentadas a 25.000 y carece de identificadores de imagen fuente, por lo que la partición aleatoria probablemente filtra near-copies entre train y test, inflando las métricas.

## Capacidades

- Clasificación de imágenes histopatológicas de pulmón en tres clases: benigno, adenocarcinoma y carcinoma escamoso.
- Entrada de imagen RGB de 128x128 píxeles.
- Salida de clasificación multiclase (una etiqueta por imagen).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no genera texto).
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades.
- No se han publicado pesos, por lo que las capacidades descritas corresponden al diseño declarado en la model card, no a un artefacto desplegable.

## Casos de uso

- Docencia en patología digital: usar el modelo como ejemplo práctico para ilustrar el flujo completo de entrenamiento de una CNN de clasificación histopatológica en Keras, incluyendo partición de datos, aumento y evaluación con matriz de confusión.
- Prototipado de pipelines de triaje morfológico: integrar el clasificador como etapa preliminar en un pipeline de investigación que separe recortes benignos de sospechosos antes de una revisión manual, siempre en entorno de laboratorio y sin uso clínico.
- Experimentos de aumento de datos y fuga de información: reproducir el entrenamiento con particiones por imagen fuente (si se dispusiera de identificadores) para cuantificar la diferencia de rendimiento frente a la partición aleatoria reportada.
- Benchmarking de CNNs ligeras: comparar arquitecturas de 3 bloques convolucionales a 128x128 frente a modelos más profundos en la misma tarea, midiendo accuracy y F1 por clase en el conjunto de test de 2.250 imágenes.
- Análisis de errores entre adenocarcinoma y carcinoma escamoso: estudiar la matriz de confusión reportada (50 adenocarcinomas clasificados como escamosos y 26 escamosos clasificados como adenocarcinoma) para diseñar estrategias de mejora, como aumento dirigido o pérdidas ponderadas.
- Publicación de resultados exploratorios: emplear las métricas reportadas (accuracy 0,9649; F1 benigno 1,00, adenocarcinoma 0,95, escamoso 0,95) como referencia inicial en artículos o informes que discutan la fuga de datos en LC25000.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test (2.250 imagenes) | 0,9649 |
| F1 clase benigno | 1,00 |
| F1 clase adenocarcinoma | 0,95 |
| F1 clase carcinoma escamoso | 0,95 |
| Matriz de confusion | [[747, 3, 0], [0, 700, 50], [0, 26, 724]] |

No se han publicado resultados comparativos frente a otros modelos en la información disponible. El autor advierte que estas cifras son a nivel de imagen, exploratorias y probablemente optimistas debido a la posible fuga de near-copies entre train y test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos; por el tamaño declarado de la CNN, la inferencia cabría previsiblemente en cualquier GPU consumer, pero no se puede confirmar sin el artefacto).
- GPU recomendadas: no disponible. El entrenamiento se realizó en una Colab T4, lo que sugiere que la inferencia es viable en GPUs de gama media, pero no se especifican requisitos.
- ¿Cabe en GPU consumer? No confirmable sin pesos publicados.
- Opciones de despliegue: Keras/TensorFlow (librería declarada). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación histopatológica de pulmón en tres clases con CNN ligera) con parámetros, contexto, rendimiento, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- Fuga de datos probable: LC25000 contiene aproximadamente 750 imágenes originales aumentadas a 25.000 sin identificadores de imagen fuente; la partición aleatoria 70/15/15 puede filtrar near-copies entre train y test, inflando las métricas reportadas.
- Métricas no clínicamente validadas: accuracy 0,9649 y F1 por clase son resultados exploratorios a nivel de imagen, no validados en cohorts externas ni en entorno clínico.
- Restricción de uso: a pesar de la licencia MIT, el autor declara RESEARCH AND EDUCATION ONLY y prohíbe explícitamente el uso como dispositivo médico o para decisiones de diagnóstico o tratamiento.
- Repositorio sin pesos: tamaño de 0,0 GB, lo que impide la reproducción directa de la inferencia desde Hugging Face.
- Sesgos conocidos: no documentados por el autor; al tratarse de un dataset de histopatología pulmonar, es previsible un sesgo hacia las clases y morfologías representadas en LC25000, sin cobertura de otras variedades histológicas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero existe riesgo de clasificaciones erróneas confiadas en imágenes fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica (modelo de visión sin salida textual).
- Caveat para producción: no desplegar en ningún flujo clínico real sin validación externa, revisión por patólogos y cumplimiento regulatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trxon/lung-cancer-cnn
- Dataset LC25000 (copia pública citada): https://huggingface.co/datasets/1aurent/LC25000
