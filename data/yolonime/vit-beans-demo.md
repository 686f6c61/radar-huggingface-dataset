# YOLONIME/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificación de imágenes publicado por el usuario YOLONIME en HuggingFace. Se trata de un ajuste fino (fine-tuning) completo del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base con parches de 16x16 y resolución de entrada de 224x224, preentrenado por Google en ImageNet-21k. El modelo resultante tiene 85.800.963 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0, por lo que es apto para uso comercial sin restricciones adicionales.

El modelo resuelve una tarea de clasificación de imágenes cerrada, presumiblemente relacionada con hojas de judía (beans) por el nombre del repositorio, aunque la model card no identifica el conjunto de datos empleado y lo describe explícitamente como "unknown dataset". El autor declara una precisión de 0,9609 y una pérdida de 0,1596 sobre el conjunto de evaluación, sin especificar su composición ni su tamaño.

Su relevancia práctica es limitada pero ilustrativa: es un ejemplo mínimo y reproducible de fine-tuning de un ViT con la librería Transformers, con hiperparámetros documentados y compatible con endpoints de HuggingFace. No se han publicado benchmarks formales (el bloque model-index está vacío), el repositorio no tiene descargas ni valoraciones, y la información sobre datos, clases y limitaciones es prácticamente inexistente. Cualquier uso en producción exigiría validar previamente el dominio de aplicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolución 224x224) |
| Parámetros totales | 85.800.963 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); secuencia de entrada de 197 tokens (196 parches de 14x14 + token [CLS]) |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión completa en safetensors) |
| Idiomas soportados | no aplica (clasificación de imágenes; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos: tamaño del repositorio 1,7 GB; pipeline image-classification; etiqueta endpoints_compatible; modelo base google/vit-base-patch16-224-in21k; creado el 2026-09-15 y actualizado el 2026-09-15.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión estándar: la imagen de entrada se divide en parches de 16x16 píxeles (196 parches para 224x224), cada parche se proyecta linealmente a un embedding, se le suma codificación posicional aprendida y la secuencia resultante, precedida por un token [CLS], atraviesa 12 capas de atención multi-cabeza. La clasificación se obtiene de la representación del token [CLS] mediante una cabeza lineal. El checkpoint de partida, google/vit-base-patch16-224-in21k, fue preentrenado de forma auto-supervisada en ImageNet-21k (14 millones de imágenes, 21.843 clases), lo que le proporciona representaciones visuales genéricas que el fine-tuning adapta a la tarea concreta.

El entrenamiento se realizó con el Trainer de Transformers usando los siguientes hiperparámetros: tasa de aprendizaje 5e-05, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal y 4 épocas, lo que equivale a 260 pasos totales (65 pasos por época). Con batch 16 y 65 pasos por época, el conjunto de entrenamiento tendría aproximadamente 1.040 imágenes, un tamaño muy reducido para los estándares de visión por computador; este cálculo es una estimación derivada y no un dato declarado por el autor. La evolución del entrenamiento muestra pérdida de entrenamiento descendente (0,2371 en la época 1 frente a 0,1289 en la época 4) y precisión de validación entre 0,9624 y 0,9850, sin que se documente regularización adicional, aumento de datos, búsqueda de hiperparámetros ni fases de RLHF o DPO (no aplicables a un clasificador visual). No se describe ninguna innovación técnica: es un fine-tuning convencional. El entorno de ejecución declarado incluye Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de imágenes en un conjunto cerrado de clases definido durante el fine-tuning (el número y los nombres de las clases no están documentados).
- Extracción de características visuales: el backbone ViT-B/16 puede emplearse como extractor de embeddings de imagen (por ejemplo, salida de la capa oculta del token [CLS]) para búsqueda por similitud o entrenamiento de clasificadores lineales.
- Inferencia sobre imágenes RGB a 224x224 píxeles; admite redimensionado y normalización estándar de ViT mediante el procesador de imágenes de Transformers.
- Exportación a otros formatos de inferencia (ONNX, TorchScript) mediante herramientas estándar, aunque no se proporcionan artefactos ya exportados.
- No soporta tool calling ni function calling: no es un modelo generativo ni un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni diálogo multi-turno.
- No tiene capacidades multilingües ni de generación de texto, código o matemáticas.
- No dispone de modo "thinking", visión generativa, audio ni ninguna capacidad multimodal más allá de la imagen de entrada.
- Etiquetado como endpoints_compatible, es decir, desplegable en HuggingFace Inference Endpoints a través del pipeline de clasificación de imágenes.

## Casos de uso

- Clasificación automática de imágenes dentro del dominio entrenado: integrado con `transformers.pipeline("image-classification")`, el modelo devuelve una distribución de probabilidad sobre las clases aprendidas, utilizable como paso de triaje en líneas de inspección o preetiquetado de lotes de imágenes.
- Preetiquetado y anotación asistida: dado su coste de inferencia bajo (85,8 M de parámetros), puede ejecutarse sobre grandes volúmenes de imágenes para proponer etiquetas que después se revisan por humanos, reduciendo el tiempo de anotación.
- Prototipo académico y material docente: sirve como ejemplo completo de fine-tuning de un ViT con el Trainer, con hiperparámetros y curva de entrenamiento publicados, para prácticas de visión por computador y despliegue de modelos en HuggingFace.
- Clasificación en el borde (edge) o en local: al requerir menos de 1 GB de memoria en precisión completa y alrededor de 172 MB en fp16, es viable en dispositivos con recursos limitados o incluso en CPU, útil cuando no se puede enviar imágenes a la nube por motivos de privacidad.
- Extracción de embeddings para recuperación visual: la representación del token [CLS] puede indexarse en una base vectorial para búsqueda de imágenes similares dentro del mismo dominio de datos.
- Filtrado previo en un pipeline mayor: actuar como clasificador binario o multiclase de descarte (por ejemplo, separar imágenes que requieren análisis detallado de las que no) antes de invocar un modelo mayor y más costoso.
- Validación de infraestructura de despliegue: por su tamaño y su etiqueta endpoints_compatible, es adecuado para probar configuraciones de Triton, ONNX Runtime o HuggingFace Inference Endpoints con un modelo ligero antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El bloque model-index de la model card está vacío (`"results": []`), por lo que no hay resultados de benchmarks formales (ImageNet, MMLU, HumanEval, GSM8K u otros). El autor declara únicamente métricas sobre su propio conjunto de evaluación, cuya composición no se especifica:

| Métrica (conjunto de evaluación del autor) | Valor |
|---|---|
| Accuracy declarada en la model card | 0,9609 |
| Loss declarada en la model card | 0,1596 |

Resultados registrados durante el entrenamiento (datos declarados por el autor):

| Training loss | Época | Paso | Validation loss | Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| 0,2371 | 1.0 | 65 | 0,1566 | 0,9850 |
| 0,1413 | 2.0 | 130 | 0,0973 | 0,9850 |
| 0,0992 | 3.0 | 195 | 0,1522 | 0,9624 |
| 0,1289 | 4.0 | 260 | 0,1047 | 0,9699 |

Nota: existe una discrepancia no explicada entre la accuracy de 0,9609 indicada en el texto de la model card y el valor de 0,9699 de la última época en la tabla de entrenamiento, posiblemente porque la model card se redactó con una evaluación posterior o con un subconjunto distinto. No hay datos para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32, 175 MB en fp16/bf16 y 90 MB en int8 (estimación a partir de los 85,8 M de parámetros; no declarada por el autor).
- Cabe sin problema en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090 o incluso integradas, siempre que haya al menos 1-2 GB de memoria libre.
- Inferencia en CPU perfectamente viable, con latencias del orden de decenas de milisegundos por imagen en procesadores modernos (no se publican mediciones).
- GPU de centro de datos (A100, H100, L40S) innecesarias salvo para procesamiento masivo por lotes, donde el cuello de botella será el preprocesado de imágenes, no el modelo.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, HuggingFace Inference Endpoints (etiqueta endpoints_compatible), ONNX Runtime o Transformers.js vía exportación con Optimum, TorchScript, NVIDIA Triton. No aplica a vLLM ni a llama.cpp, que no cubren clasificación de imágenes con ViT.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLONIME/vit-beans-demo | 85,8 M | 224x224, 196 parches + [CLS] | Accuracy 0,9609 declarada sobre un conjunto de evaluación no documentado; sin benchmarks públicos | apache-2.0 | HuggingFace, safetensors, 0 descargas |
| google/vit-base-patch16-224-in21k | 86 M aprox. | 224x224 | Preentrenado en ImageNet-21k; sin cabeza de clasificación específica | apache-2.0 | HuggingFace, ampliamente utilizado |
| google/vit-base-patch16-224 | 86 M aprox. | 224x224 | Clasificación en 1.000 clases de ImageNet-1k | apache-2.0 | HuggingFace, checkpoint de referencia muy extendido |
| ResNet-50 (modelo convolucional clásico) | 25,6 M | 224x224 | Referencia habitual en clasificación de ImageNet-1k | varía según implementación | Amplia disponibilidad (torchvision, timm) |

La comparación de rendimiento con alternativas no es significativa porque vit-beans-demo está ajustado sobre un conjunto de datos privado y no evaluado en ningún benchmark público: sus métricas no son transferibles ni comparables con las de los checkpoints de Google. Como referencia estructural, comparte arquitectura y tamaño con google/vit-base-patch16-224-in21k y es aproximadamente 3,3 veces más grande que un ResNet-50.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card indica "unknown dataset", por lo que se desconoce el dominio real, el número de clases, el equilibrio entre ellas y la procedencia de las imágenes. No se debe asumir que el modelo clasifica hojas de judía solo por el nombre del repositorio.
- Riesgo alto de sobreajuste: con aproximadamente 1.040 imágenes de entrenamiento estimadas y 4 épocas sobre un modelo de 85,8 M de parámetros, la precisión declarada (0,96-0,98) probablemente no se generalice a imágenes fuera de la distribución de entrenamiento.
- Sin validación independiente: el repositorio tiene 0 descargas y 0 valoraciones, y no hay terceros que hayan reproducido los resultados. La métrica declarada procede únicamente del autor.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos con alta confianza: un clasificador sobreajustado puede asignar probabilidades altas a clases incorrectas cuando recibe imágenes fuera de su dominio.
- Sesgos potenciales desconocidos: no se documenta la composición demográfica, geográfica ni de condiciones de captura (iluminación, cámara, fondo) del conjunto de datos, por lo que el modelo puede degradarse ante variaciones de dominio no representadas.
- Ausencia de información sobre las clases: no se publica el mapeo `id2label`, lo que complica interpretar las salidas en un despliegue real.
- Licencia: Apache 2.0 tanto en el modelo ajustado como, presumiblemente, en el checkpoint base de Google; permite uso comercial, pero no exime de validar el modelo en el dominio objetivo antes de llevarlo a producción.
- Sin soporte de texto, tool calling, agentes ni multilingüismo: cualquier requisito funcional de ese tipo debe cubrirse con otro componente del sistema.
- Los resultados de la búsqueda web realizada no aportan información técnica relevante sobre el modelo: los enlaces devueltos corresponden a productos comerciales no relacionados.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/YOLONIME/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
