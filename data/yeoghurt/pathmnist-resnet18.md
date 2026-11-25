# yeoghurt/pathmnist-resnet18

## Resumen

`yeoghurt/pathmnist-resnet18` es un modelo de clasificación de imágenes basado en una red residual convolucional ResNet-18, publicada originalmente por Microsoft, y ajustada por el usuario yeoghurt sobre un conjunto de datos no especificado en la model card (presumiblemente PathMNIST, dado el nombre del repositorio). El modelo resuelve una tarea de clasificación de imágenes multiclase, orientada en principio a imágenes histopatológicas, aunque el autor no documenta ni el dataset ni las clases de destino.

Con 11.190.729 parámetros, es un modelo compacto que puede ejecutarse en hardware muy modesto, incluso en CPU, y que se distribuye en formatos safetensors y ONNX, lo que facilita su despliegue en entornos de producción ligeros. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia es limitada fuera del nicho concreto para el que fue entrenado: no es un modelo generativo ni multimodal de propósito general, sino un clasificador de imagen especializado. La model card está generada automáticamente por el Trainer de Hugging Face y carece de la mayor parte de la documentación necesaria para evaluar su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN con conexiones residuales) |
| Parametros totales | 11.190.729 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es ResNet-18, una red neuronal convolucional con conexiones residuales ("skip connections") que permite entrenar redes profundas mitigando el problema del desvanecimiento del gradiente. Consta de 18 capas con pesos (una convolución inicial, cuatro etapas de bloques residuales y una capa fully-connected final), con aproximadamente 11,2 millones de parámetros. El modelo base es `microsoft/resnet-18`, preentrenado en ImageNet-1k.

El ajuste fino se realizó con el Trainer de Hugging Face durante 3 épocas, con un batch size de 64, learning rate de 5e-5, optimizador AdamW (variante fused), scheduler lineal y precisión mixta nativa (AMP). El dataset de entrenamiento no está especificado en la model card ("unknown dataset"), aunque el nombre del repositorio sugiere PathMNIST, un conjunto de imágenes histopatológicas de colon con 9 clases. No se documenta el número de tokens ni la composición del dataset, ni si hubo técnicas de regularización adicionales más allá del ajuste estándar.

## Capacidades

- Clasificación de imágenes: el modelo emite una predicción de clase (y presumiblemente probabilidades por clase) para una imagen de entrada.
- Especialización en imágenes histopatológicas (presumiblemente PathMNIST, 9 clases), aunque no confirmado por el autor.
- Exportación a ONNX para inferencia optimizada en producción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de tejidos histopatológicos en pipelines de investigación: el modelo puede integrarse en un flujo de preprocesado de imágenes de biopsias para asignar una etiqueta de clase a cada parche, sirviendo como baseline o componente de un sistema mayor de análisis.
- Prototipado rápido de clasificadores de imagen: al ser un ResNet-18 con solo 11M de parámetros, sirve como punto de partida para experimentos de transferencia de aprendizaje en dominios de imagen médica.
- Despliegue en dispositivos de borde (edge): su reducido tamaño permite ejecutarlo en CPU o en GPUs de gama baja, útil para entornos con recursos limitados donde no cabe un modelo mayor.
- Inferencia por lotes en servidores sin GPU: al exportarse a ONNX, puede ejecutarse con ONNX Runtime en CPU con latencia aceptable para clasificación de imágenes pequeñas.
- Educación y demostraciones: adecuado para ilustrar flujos de ajuste fino de modelos de visión con el Trainer de Hugging Face.
- Componente de un ensemble o pipeline de visión: puede combinarse con otros clasificadores o con modelos de segmentación para tareas de análisis de imágenes médicas más complejas.

## Benchmarks y rendimiento

La model card declara métricas sobre el conjunto de evaluación, aunque el model-index no contiene resultados estructurados. Los datos declarados por el autor son:

| Metrica | Valor (epoca 3) |
|---|---|
| Loss (validacion) | 0.0361 |
| Accuracy | 0.9887 |
| Precision | 0.9889 |
| Recall | 0.9884 |
| F1 | 0.9887 |
| AUC | 0.9998 |

Evolución por épocas:

| Epoca | Validation loss | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| 1 | 0.0683 | 0.9776 | 0.9778 | 0.9771 | 0.9774 | 0.9995 |
| 2 | 0.0453 | 0.9850 | 0.9851 | 0.9850 | 0.9850 | 0.9997 |
| 3 | 0.0361 | 0.9887 | 0.9889 | 0.9884 | 0.9887 | 0.9998 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (11M de parámetros, ~45 MB de pesos); en la práctica, unos pocos cientos de MB incluyendo activaciones para imágenes de tamaño estándar (224x224).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 sobran para esta carga.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (por la exportación ONNX incluida), y potencialmente TensorRT o OpenVINO tras conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yeoghurt/pathmnist-resnet18 | 11,2 M | no aplica | Clasificación de imagen (histopatología) | Apache 2.0 | Hugging Face |
| microsoft/resnet-18 | 11,7 M | no aplica | Clasificación de imagen general (ImageNet) | Apache 2.0 | Hugging Face |
| microsoft/resnet-50 | 25,6 M | no aplica | Clasificación de imagen general (ImageNet) | Apache 2.0 | Hugging Face |

La comparación con ResNet-50 es relevante porque, aunque este último es más grande y preciso en ImageNet, el modelo ajustado aquí está especializado en un dominio concreto y no es directamente comparable en rendimiento sin evaluar ambos sobre el mismo dataset. No se dispone de datos de benchmarks comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, las clases de destino ni el proceso de evaluación, lo que impide verificar la validez de las métricas declaradas.
- Riesgo de sobreajuste al dataset de ajuste fino: las métricas de validación son muy altas (accuracy 0.9887) y no hay conjunto de test independiente reportado.
- Posibles sesgos derivados del dataset de origen (presumiblemente PathMNIST), que no está documentado ni caracterizado.
- No apto para uso clínico sin validación externa: es un modelo de investigación, no un dispositivo médico.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente puede plantear dudas sobre la procedencia de los datos de entrenamiento.
- No procesa texto ni tiene capacidades generativas; su uso queda restringido a clasificación de imágenes.
- El formato ONNX incluido puede no reflejar exactamente el comportamiento del modelo en PyTorch si no se validó la conversión.

## Enlaces

- Hugging Face: https://huggingface.co/yeoghurt/pathmnist-resnet18
- Modelo base: https://huggingface.co/microsoft/resnet-18
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación de ResNet en Transformers: https://huggingface.co/docs/transformers/model_doc/resnet
