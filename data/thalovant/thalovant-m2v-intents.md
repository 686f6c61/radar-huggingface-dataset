# thalovant/thalovant-m2v-intents

## Resumen

thalovant-m2v-intents es un clasificador de intenciones basado en embeddings estáticos (model2vec), desarrollado por el usuario thalovant para el ecosistema Thalovant y el pipeline `ovos-m2v-pipeline` de OpenVoiceOS. A diferencia de los clasificadores basados en transformers generativos, este modelo no genera texto: mapea una frase de entrada a una de 366 etiquetas con el formato `<skill_id>:<intent>`, que corresponden a las skills registradas en la flota y a los intents de los pipelines de persona, lectura y wikihow.

El modelo parte del checkpoint `Jarbas/m2v-256-distiluse-base-multilingual-cased-v2` y se afina con el entrenador de clasificadores de model2vec. Con 30.577.920 parámetros totales, es un modelo de inferencia puramente estática: cada token se proyecta a un vector fijo y la representación de la frase se obtiene mediante pooling, sin atención ni capas recurrentes en tiempo de ejecución. Esto lo hace extremadamente ligero en cómputo comparado con un transformer equivalente.

Su relevancia actual reside en el soporte multilingüe medido sobre 68 idiomas y en la integración con un mecanismo de validación de skills (`thalovant-skillkit check`) que detecta colisiones de frases entre skills sin exponer los corpus privados. La licencia Apache 2.0 y el formato safetensors facilitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | model2vec (embeddings estáticos con pooling, sin transformer en inferencia) |
| Parámetros totales | 30.577.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos son safetensors; al ser embeddings estáticos el coste ya es bajo) |
| Idiomas soportados | 68 idiomas medidos en la evaluación (incluye en, es, de, fr, pt, it, ca, gl, eu, ar, ja, ko, hi, entre otros) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador sobre embeddings estáticos de model2vec. El modelo base `Jarbas/m2v-256-distiluse-base-multilingual-cased-v2` destila un modelo de frases multilingüe (`distiluse-base-multilingual-cased-v2`) en una tabla de embeddings de 256 dimensiones por token. En inferencia no hay capas de atención: la frase se representa por pooling de los vectores de sus tokens y la clasificación se resuelve con la cabeza entrenada por el clasificador de model2vec. El resultado es un modelo de 30,5 millones de parámetros con coste de inferencia muy inferior al de un transformer.

El entrenamiento se realizó sobre un corpus de la flota Thalovant con 521.361 filas en total, limitando a un máximo de 512 frases por etiqueta e idioma (el `index.json` conserva las 566.274 frases del corpus completo). La evaluación se hizo sobre 101.918 filas retenidas cuyos textos e intents no aparecen en las 419.443 filas usadas por el modelo de evaluación, con un split por fila que evita filtrar variantes regionales del mismo idioma. Los pesos publicados se reentrenaron con la misma receta sobre las 521.361 filas completas, por lo que las frases existentes de cada skill forman parte de los datos de entrenamiento del modelo publicado: las métricas de held-out son la referencia válida de generalización, no una estimación sobre datos no vistos por el modelo publicado.

## Capacidades

- Clasificación de intenciones en una taxonomía cerrada de 366 etiquetas `<skill_id>:<intent>`, sin etiqueta de rechazo o "ninguna de estas".
- Clasificación multilingüe medida en 68 idiomas, con precisión de intent y de skill reportadas por idioma.
- Integración con `ovos-m2v-pipeline` mediante `"mode": "classifier"` y el fichero `labels.json` que acompaña a los pesos.
- Predicción por lotes mediante `StaticModelPipeline.predict` de la librería model2vec.
- Uso en validación de skills: `thalovant-skillkit check` consulta el clasificador y el `index.json` para detectar frases duplicadas entre skills sin sacar los corpus de sus repositorios privados.
- Umbrales de confianza por idioma publicados en `training.json` para controlar falsos avisos.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz OpenVoiceOS: el modelo recibe la transcripción del usuario y devuelve la etiqueta `<skill_id>:<intent>` que el hub usa para despachar la petición a la skill correspondiente, con un coste de inferencia muy bajo por turno.
- Prefiltrado en pipelines de diálogo: al ser un modelo estático, puede ejecutarse en cada turno antes de invocar modelos generativos más caros, reduciendo el número de llamadas a LLM en producción.
- Control de calidad de skills: `thalovant-skillkit check` usa el clasificador y el `index.json` para fallar una skill que publica una frase ya registrada por otra, y para revisar el resto de frases sin compartir los corpus privados.
- Despliegue en dispositivos con recursos limitados: los 30,5 millones de parámetros y la ausencia de atención permiten ejecutar el clasificador en CPU o en hardware embebido dentro de asistentes domésticos.
- Soporte multilingüe en mercados regionales: con precisión de skill superior al 95 % en es-ES, es-MX, es-AR, fr-FR, de-DE y en-US, es adecuado para asistentes desplegados en varios países con umbrales ajustados por idioma.
- Análisis de tráfico y etiquetado retrospectivo: clasificar grandes volúmenes de utterances históricas para auditar qué intents se disparan y detectar huecos en la cobertura de skills.
- Ajuste de umbrales por idioma en producción: los valores publicados (por ejemplo 0,96 para ar-SA y az-AZ, 0,99 para eu-ES) permiten configurar políticas de confianza distintas según el idioma del usuario.

## Benchmarks y rendimiento

Resultados de held-out publicados en la model card (101.918 filas no vistas por el modelo de evaluación):

| Métrica | Valor |
|---|---|
| Precisión de intent (global, 68 idiomas) | 91,5 % |
| Precisión de skill (global, 68 idiomas) | 96,1 % |
| Precisión de intent mediana por idioma | 91,1 % |
| Idiomas con precisión de intent inferior al 80 % | 6 |
| Frases asignadas a otra skill con confianza ≥ 0,9 | 0,8 % |

Resultados por idioma seleccionados:

| Idioma | Filas | Intent | Skill | Falsos avisos | Umbral |
|---|---:|---:|---:|---:|---:|
| `en-US` | 3436 | 95,5 % | 98,3 % | 0,2 % | 0,9 |
| `es-ES` | 3046 | 95,0 % | 97,8 % | 0,2 % | 0,9 |
| `gl-ES` | 2738 | 97,2 % | 98,8 % | 0,2 % | 0,9 |
| `fr-FR` | 3456 | 95,3 % | 97,6 % | 0,5 % | 0,9 |
| `de-DE` | 2913 | 93,4 % | 97,0 % | 0,6 % | 0,9 |
| `ca-ES` | 3286 | 93,3 % | 97,1 % | 0,6 % | 0,9 |
| `pt-PT` | 3263 | 94,0 % | 96,1 % | 1,6 % | 0,97 |
| `it-IT` | 2697 | 91,4 % | 96,9 % | 0,9 % | 0,9 |
| `ko-KR` | 879 | 65,3 % | 89,3 % | 0,9 % | 0,9 |
| `ja-JP` | 682 | 77,3 % | 93,1 % | 1,2 % | 0,94 |
| `ar-SA` | 706 | 81,2 % | 92,8 % | 1,6 % | 0,96 |
| `eu-ES` | 1255 | 84,5 % | 89,6 % | 2,1 % | 0,99 |

No se han publicado comparaciones con otros clasificadores de intenciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 30,5 millones de parámetros en safetensors, el peso de los embeddings es del orden de decenas de megabytes en precisión nativa, muy por debajo de cualquier transformer de tamaño comparable.
- GPU recomendadas: no se especifican; por la naturaleza estática del modelo, cualquier GPU consumer reciente (por ejemplo RTX 3060 o superior) es sobredimensionada para la tarea.
- Cabe en GPU consumer: sí, con amplio margen; también es viable en CPU.
- Opciones de despliegue: librería `model2vec` con `StaticModelPipeline`; integración con `ovos-m2v-pipeline` en modo `classifier`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thalovant/thalovant-m2v-intents | Clasificador de intenciones model2vec | 30.577.920 | no disponible | apache-2.0 | Hugging Face |
| Jarbas/m2v-256-distiluse-base-multilingual-cased-v2 | Embeddings estáticos model2vec (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Clasificadores de intenciones basados en transformers (p. ej. DistilBERT o XLM-R afinados) | Clasificador supervisado | 66 M a 278 M típicamente | 512 tokens típicamente | variable según checkpoint | Hugging Face y otros |

No se han publicado comparaciones directas de rendimiento con alternativas en la información disponible. La ventaja estructural del modelo frente a clasificadores basados en transformers es el coste de inferencia (sin atención ni capas profundas); la desventaja es la taxonomía cerrada de 366 etiquetas y la ausencia de una etiqueta de rechazo.

## Limitaciones y advertencias

- No existe etiqueta "ninguna de estas": una frase sobre algo que ninguna skill cubre recibe igualmente la etiqueta de la skill más cercana, a menudo con confianza alta. En producción es necesario aplicar umbrales y lógica de rechazo externa.
- La taxonomía está cerrada a las 366 etiquetas de la flota Thalovant; cualquier intent nuevo requiere reentrenamiento o un clasificador adicional.
- Los pesos publicados se entrenaron sobre las 521.361 filas completas, incluidas las frases existentes de cada skill; las métricas de held-out proceden de un modelo de evaluación distinto y no deben interpretarse como rendimiento sobre datos totalmente ajenos al modelo publicado.
- Seis idiomas quedan por debajo del 80 % de precisión de intent; el coreano es el caso más débil (65,3 %). En esos idiomas conviene aplicar los umbrales elevados publicados o evitar el enrutamiento automático.
- Los umbrales por idioma de `training.json` deben respetarse para mantener los falsos avisos por debajo del 1 %; ignorarlos degrada la fiabilidad del enrutamiento.
- No se documentan sesgos específicos del corpus de entrenamiento; al derivarse de un corpus de skills de una flota concreta, el modelo puede reflejar los desequilibrios de cobertura de esa flota.
- No hay información sobre el rendimiento en idiomas fuera de los 68 medidos ni sobre dominios ajenos al corpus de la flota.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento de la flota deben verificarse por separado si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thalovant/thalovant-m2v-intents
- Modelo base: https://huggingface.co/Jarbas/m2v-256-distiluse-base-multilingual-cased-v2
- Librería model2vec: https://github.com/MinishLab/model2vec
- OpenVoiceOS: https://github.com/OpenVoiceOS
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios del autor ni demos adicionales.
