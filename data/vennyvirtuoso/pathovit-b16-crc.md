# vennyvirtuoso/pathovit-b16-crc

## Resumen

PathoViT-B16-CRC es un codificador de visión especializado en histopatología digital, publicado por el usuario vennyvirtuoso en Hugging Face. Se trata de un fine-tuning del checkpoint google/vit-base-patch16-224-in21k sobre el conjunto de datos NCT-CRC-HE, orientado a la clasificación de fenotipos tisulares en imágenes de cáncer colorrectal teñidas con H&E. El modelo resuelve la tarea de clasificar recortes (tiles) de 224x224 píxeles en nueve clases de tejido, desde epitelio tumoral hasta estroma, músculo liso o mucosidad.

Arquitectónicamente es un Vision Transformer base con parches de 16x16 y resolución de entrada de 224x224, con 85,8 millones de parámetros. No es un modelo generativo ni multimodal: es un clasificador de imagen puro con una cabeza de clasificación de 9 clases. Su relevancia radica en que ofrece una licencia Apache 2.0 permisiva y un rendimiento declarado alto en un cohorte externo estrictamente disjunto a nivel de portaobjetos, lo que lo hace atractivo para pipelines de patología computacional que necesitan un clasificador de tejido ligero y desplegable.

El modelo se distribuye únicamente en formato safetensors, con un tamaño de repositorio de 0,3 GB, y se integra con la librería transformers mediante la clase ViTForImageClassification. No se han publicado datos sobre idiomas (es un modelo de visión) ni sobre cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer base (ViT-B/16, parches 16x16, entrada 224x224) |
| Parametros totales | 85.805.577 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/vit-base-patch16-224-in21k, un ViT base preentrenado en ImageNet-21k, y se fine-tunea como clasificador de 9 clases sobre recortes de histopatología colorrectal. La entrada son imágenes RGB de 224x224 píxeles procesadas con AutoImageProcessor, y la salida es un vector de logits de dimensión 9 correspondiente a los fenotipos ADI, BACK, DEB, LYM, MUC, MUS, NORM, STR y TUM. El entrenamiento se realizó en precisión mixta (bfloat16/fp16) según la model card.

El conjunto de entrenamiento declarado es NCT-CRC-HE-100K, del que el autor indica haber usado 6.300 tiles balanceados (700 por clase en las 9 clases). La evaluación se realizó sobre el cohorte externo CRC-VAL-HE-7K, con 7.180 tiles de 50 pacientes independientes y disjuntos a nivel de portaobjetos, lo que el autor presenta como garantía de ausencia de fuga de datos. No se detalla en la información disponible el número de épocas, la tasa de aprendizaje, el optimizador ni si hubo aumento de datos o técnicas de regularización específicas. Tampoco se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador de visión supervisado.

## Capacidades

- Clasificación de imágenes de histopatología colorrectal en 9 fenotipos tisulares: ADI (adiposo), BACK (fondo), DEB (detritos), LYM (linfocitos), MUC (mucosidad), MUS (músculo), NORM (mucosa normal), STR (estroma) y TUM (epitelio de adenocarcinoma colorrectal).
- Extracción de características visuales mediante el encoder ViT, utilizable como backbone para tareas posteriores (por ejemplo, recuperación de imágenes o clasificación con cabezas adicionales).
- Inferencia por lotes de tiles de 224x224, adecuada para procesar grandes volúmenes de recortes de portaobjetos completos.
- Integración con transformers, sentence-transformers, peft y accelerate, según declara el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es exclusivamente visual.
- No dispone de modo de razonamiento (thinking mode) ni de salida estructurada más allá de los logits de clase.

## Casos de uso

- Fenotipado del microentorno tumoral en patología digital: el modelo clasifica cada tile de una imagen de portaobjetos completa (WSI) en una de las 9 clases, permitiendo cuantificar la proporción de epitelio tumoral, estroma, linfocitos o músculo en una muestra y construir mapas de tejido a partir de los recortes.
- Triaje automatizado de muestras colorrectales: al ser un ViT base de 85,8 M de parámetros, puede ejecutarse en lotes sobre miles de tiles con baja latencia, lo que permite priorizar portaobjetos con alta proporción de clase TUM para revisión del patólogo.
- Control de calidad de tejido en pipelines de investigación: detectar tiles de fondo (BACK) o detritos (DEB) para filtrar recortes no informativos antes de alimentar modelos downstream más costosos.
- Extracción de embeddings para búsqueda por similitud: usar la salida del encoder como representación vectorial de tiles y construir índices de recuperación para encontrar regiones histológicamente similares en una colección de imágenes.
- Preentrenamiento o fine-tuning posterior con peft: al ser un backbone ViT estándar, puede servir como inicialización para tareas específicas de un laboratorio (por ejemplo, clasificación binaria tumor/no tumor) con pocos datos etiquetados.
- Despliegue en microservicios de bajo coste: su tamaño (0,3 GB en safetensors) permite servirlo en contenedores con GPU modesta o incluso en CPU para inferencia por lotes no crítica, integrándolo en APIs de clasificación de imágenes.
- Docencia y prototipado en patología computacional: al tener licencia Apache 2.0 y un ejemplo de inferencia claro, es adecuado para cursos y pruebas de concepto sin restricciones comerciales.

## Benchmarks y rendimiento

Los datos de la model card del autor, evaluados sobre el cohorte externo CRC-VAL-HE-7K (7.180 tiles, 50 pacientes disjuntos), son los siguientes:

| Metrica | Valor |
|---|---|
| Exactitud en cohorte externo | 96,00% |
| Exactitud del baseline sin adaptar | 4,18% |
| Ganancia de exactitud | +91,82% |
| Macro-F1 en cohorte externo | 0,9391 |
| Macro-F1 del baseline sin adaptar | 0,0268 |
| Ganancia de Macro-F1 | +0,9123 |
| Pérdida de entropía cruzada (fine-tuned) | 0,3381 |
| Pérdida de entropía cruzada (baseline) | 2,2178 |

Desglose de F1 por clase declarado por el autor:

| Clase | F1 |
|---|---|
| ADI | 0,9921 |
| BACK | 0,9930 |
| DEB | 0,9687 |
| LYM | 0,9937 |
| MUC | 0,9908 |
| MUS | 0,8628 |
| NORM | 0,9641 |
| STR | 0,7123 |
| TUM | 0,9745 |

No se han publicado en la información disponible resultados comparativos con otros modelos de patología (por ejemplo, CTransPath, Phikon o UNI) ni métricas en otros conjuntos de datos. Las cifras anteriores provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (85,8 M de parámetros x 4 bytes), más activaciones y memoria del procesador de imagen; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos, con un consumo total típico por debajo de 1 GB para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problema. Para alto throughput por lotes, se recomiendan GPUs con más memoria (A100 40/80 GB, H100) para procesar lotes grandes de tiles en paralelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia por lotes no crítica.
- Opciones de despliegue: transformers con ViTForImageClassification, sentence-transformers, accelerate con device_map="auto", y servidores de inferencia compatibles con transformers (por ejemplo, TGI si se configura para visión, o soluciones propias con FastAPI y torch). No se documentan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un ViT base de 85,8 M de parámetros, se espera una latencia baja por tile en GPU moderna, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pathovit-b16-crc | 85,8 M | Imagen 224x224 | Clasificación de 9 fenotipos colorrectales | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 85,8 M | Imagen 224x224 | Clasificación genérica ImageNet-21k | Apache 2.0 | Hugging Face |
| CTransPath | no disponible en la información | no disponible | Codificador de patología | no disponible | No verificado en la información |
| Phikon | no disponible en la información | no disponible | Codificador de patología | no disponible | No verificado en la información |

No se han publicado comparativas de rendimiento frente a estos u otros modelos de patología computacional en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para histopatología colorrectal teñida con H&E; no es válido para otros tejidos, otras tinciones (por ejemplo, IHC) ni para imágenes médicas no histológicas.
- El rendimiento declarado proviene de la model card del autor y no ha sido verificado de forma independiente; debe tratarse como dato no auditado.
- El F1 de la clase STR (estroma) es notablemente inferior (0,7123) al del resto, lo que indica confusión con otras clases en ese fenotipo; conviene revisar las matrices de confusión antes de usarlo en producción.
- Riesgo de alucinación en el sentido de falsos positivos/negativos: al ser un clasificador, puede asignar alta confianza a clases incorrectas en tiles atípicos, artefactos de tinción o imágenes fuera de distribución.
- No se documentan sesgos demográficos ni de adquisición (por ejemplo, diferencias entre escáneres o laboratorios); el cohorte de validación es de 50 pacientes, lo que limita la generalización a poblaciones más diversas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está certificado como dispositivo médico; cualquier uso clínico requiere validación regulatoria adicional y supervisión profesional.
- No se publican cuantizaciones oficiales ni pesos en GGUF; el despliegue en CPU o en entornos con restricciones de memoria requiere conversión manual.
- El modelo no procesa texto ni idiomas, por lo que no debe esperarse soporte multilingüe ni generación de informes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/pathovit-b16-crc
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset de entrenamiento: https://huggingface.co/datasets/1aurent/NCT-CRC-HE
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
