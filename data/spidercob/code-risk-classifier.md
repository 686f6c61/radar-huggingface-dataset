# spidercob/code-risk-classifier

## Resumen

`spidercob/code-risk-classifier` es un modelo de clasificación de texto basado en SetFit, desarrollado por Spidercob, una organización centrada en soluciones de prevención de pérdida de datos (DLP). El modelo está diseñado para clasificar código en cuatro clases según su nivel de riesgo, aunque las etiquetas concretas no están documentadas en la model card. Utiliza un enfoque de few-shot learning eficiente que combina un Sentence Transformer de tipo BERT ajustado con aprendizaje contrastivo y una cabeza de clasificación basada en regresión logística.

Con 22.713.216 parámetros y una longitud máxima de secuencia de 256 tokens, es un modelo ligero pensado para tareas de clasificación rápida en pipelines de análisis de código. Su relevancia radica en la creciente necesidad de detectar información sensible (PII, secretos, credenciales) en repositorios de código y pipelines de datos, un problema crítico en entornos empresariales con requisitos de cumplimiento normativo. El repositorio tiene un tamaño de 0,6 GB, lo que sugiere que incluye artefactos adicionales más allá de los pesos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer BERT + LogisticRegression) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SetFit, que consta de dos componentes principales: un Sentence Transformer de tipo BERT (según las etiquetas del repositorio) ajustado mediante aprendizaje contrastivo, y una cabeza de clasificación implementada con una instancia de LogisticRegression de scikit-learn. El entrenamiento se realiza en dos fases: primero se ajusta el Sentence Transformer con pares de frases para aprender representaciones semánticas discriminativas, y después se entrena la cabeza de clasificación sobre las características generadas por el transformer.

El enfoque SetFit permite obtener resultados competitivos con muy pocos ejemplos etiquetados, sin necesidad de prompts ni de ajuste fino completo del modelo base. El modelo tiene 4 clases de salida y una longitud máxima de secuencia de 256 tokens. Los detalles del dataset de entrenamiento, el número de ejemplos utilizados y el proceso exacto de entrenamiento no están documentados en la model card. Las versiones de las librerías utilizadas incluyen SetFit 1.1.3, Sentence Transformers 5.6.1, Transformers 4.57.6 y PyTorch 2.10.0.

## Capacidades

- Clasificación de texto en 4 clases, orientada a la evaluación de riesgo en código fuente según el nombre del modelo y el contexto DLP del desarrollador.
- Inferencia eficiente gracias al enfoque SetFit, que no requiere prompts ni generación de texto.
- Integración directa con la librería SetFit y sentence-transformers para carga y uso en producción.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- Capacidad de few-shot learning: el modelo puede ser reentrenado con pocos ejemplos para adaptarse a nuevos dominios o taxonomías de riesgo.
- No se documentan capacidades de generación de texto, tool calling, agentes ni multimodales.

## Casos de uso

- Prevención de fuga de datos en repositorios de código: el modelo puede integrarse en pipelines de CI/CD para analizar cada commit y detectar código que contenga información sensible o de alto riesgo, alertando al equipo de seguridad antes de que se fusione.
- Auditoría de cumplimiento normativo: las organizaciones pueden usar el modelo para escanear repositorios históricos y clasificar el código según su nivel de riesgo, facilitando auditorías de cumplimiento con normativas como GDPR o PCI-DSS.
- Filtrado de secretos y credenciales: integrado en un sistema DLP, el modelo puede identificar fragmentos de código que contengan claves API, contraseñas o tokens, complementando herramientas de detección de secretos basadas en reglas.
- Clasificación de tickets y reportes de seguridad: el modelo puede aplicarse a descripciones de issues o pull requests para priorizar aquellos que mencionan vulnerabilidades o riesgos de seguridad.
- Monitorización de pipelines de datos: en entornos de ingeniería de datos, el modelo puede analizar scripts de ETL y transformaciones para detectar código que maneje datos personales o sensibles de forma insegura.
- Formación y concienciación en seguridad: el modelo puede utilizarse en plataformas educativas para clasificar ejemplos de código y enseñar a desarrolladores a identificar patrones de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que se utilizó accuracy como métrica durante el entrenamiento, pero no se proporcionan valores concretos.

## Requisitos de hardware

- Con 22,7 millones de parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU sin problemas.
- VRAM estimada: aproximadamente 91 MB en FP32 (22,7 M × 4 bytes), o unos 45 MB en FP16. Cabe en cualquier GPU consumer, incluidas las más antiguas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona bien en CPU.
- Opciones de despliegue: la librería SetFit permite cargar el modelo directamente; también es compatible con text-embeddings-inference y los endpoints de Hugging Face.
- Latencia: al ser un modelo pequeño con secuencias máximas de 256 tokens, la inferencia es del orden de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos. El modelo no publica benchmarks ni detalles de entrenamiento que permitan compararlo con otros clasificadores de riesgo de código. Como referencia arquitectónica, otros modelos SetFit de tamaño similar (alrededor de 20-30 millones de parámetros) suelen ofrecer rendimientos competitivos en tareas de clasificación con pocos ejemplos, pero no se dispone de datos específicos para este modelo.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- Los idiomas soportados no están documentados; el modelo podría tener un rendimiento limitado fuera del inglés.
- La longitud máxima de secuencia es de 256 tokens, lo que limita el análisis de fragmentos de código largos.
- Las 4 clases de clasificación no están documentadas, lo que dificulta interpretar las predicciones del modelo.
- No se han publicado detalles sobre el dataset de entrenamiento, los posibles sesgos ni los casos de error conocidos.
- El modelo no es un detector de secretos exhaustivo: para producción, debe complementarse con herramientas especializadas en detección de credenciales y PII.
- Al ser un modelo de clasificación (no generativo), no puede explicar sus predicciones ni generar informes detallados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/spidercob/code-risk-classifier)
- [Perfil de Spidercob en Hugging Face](https://huggingface.co/spidercob/models)
- [Repositorio de SetFit en GitHub](https://github.com/huggingface/setfit)
- [Paper: Efficient Few-Shot Learning Without Prompts](https://arxiv.org/abs/2209.11055)
- [Blog de SetFit en Hugging Face](https://huggingface.co/blog/setfit)
- [Perfil de SpiderCob en GitHub](https://github.com/SpiderCob)
- [SDK de Python para la API DLP de Spidercob](https://github.com/SpiderCob/spidercob-python)
