# Yuesai/HandXFM

## Resumen

HandXFM es un modelo fundacional de visión especializado en radiografías de mano, desarrollado por el grupo de investigación de Yuesai (autores del paper: Long, Feng, Chen, O'Neil, Hitchon y Hu). Se construye sobre el encoder DINOv3 ViT-B/16 de Meta y se entrena mediante destilación semántico-estructural a partir de BiomedCLIP y de un ViT de radiografía de tórax, de modo que el modelo aprende representaciones visuales transferibles sin necesidad de anotaciones específicas de la tarea. El trabajo fue aceptado en NeurIPS 2026.

El repositorio publica únicamente el encoder visual preentrenado (85,66 millones de parámetros, embeddings de 768 dimensiones), sin los modelos maestros de destilación ni las cabezas específicas de tareas posteriores. La salida sigue el orden de tokens de DINOv3: token CLS, tokens de registro y 196 tokens de parche para entradas de 224x224 píxeles.

Es relevante ahora porque ofrece un backbone abierto (bajo licencia DINOv3) para tareas de imagen médica musculoesquelética como estimación de edad ósea, puntuación de artritis reumatoide, clasificación de anomalías, detección de articulaciones, segmentación ósea y respuesta visual a preguntas, sin que el investigador tenga que entrenar un encoder desde cero con datos radiográficos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv3 ViT-B/16) |
| Parámetros totales | 85.660.416 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; 196 tokens de parche para 224x224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | dinov3-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HandXFM emplea un transformer de visión DINOv3 ViT-B/16 (parche de 16x16, dimensión de embedding de 768, 12 capas y 12 cabezas de atención en la configuración estándar del ViT-B). El modelo parte de los pesos preentrenados de `facebook/dinov3-vitb16-pretrain-lvd1689m` y se refina sobre radiografías de mano mediante destilación semántico-estructural: el encoder aprende a alinear sus representaciones con las de dos profesores, BiomedCLIP (conocimiento semántico multimodal médico) y un ViT entrenado en radiografía de tórax (conocimiento estructural de imagen radiológica). El resultado es un encoder que captura tanto semántica clínica como estructura anatómica sin depender de etiquetas específicas.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del corpus de radiografías de mano ni si se aplicaron fases de ajuste fino supervisado o de alineación adicional. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, dado que el modelo es un encoder de extracción de características y no un modelo generativo. La innovación principal es el propio esquema de destilación doble (semántica + estructural) aplicado a un dominio médico de imagen única.

## Capacidades

- Extracción de características visuales globales mediante el token CLS (vector de 768 dimensiones).
- Extracción de características espaciales mediante los 196 tokens de parche (mapa 14x14 para 224x224), útiles para localización y segmentación.
- Representación agrupada (pooled) combinando CLS y parches, útil como embedding único para clasificación o recuperación.
- Base para estimación de edad ósea a partir de radiografía de mano.
- Base para puntuación de artritis reumatoide y clasificación de anomalías.
- Base para detección de articulaciones y segmentación ósea.
- Base para respuesta visual a preguntas (VQA) médica cuando se acopla a una cabeza o modelo de lenguaje.
- No soporta tool calling, function calling ni razonamiento multi-step de forma nativa: es un encoder, no un modelo generativo.
- Capacidades multilingües: no aplica (sin entrada ni salida de texto).

## Casos de uso

- Estimación de edad ósea pediátrica: se conecta el embedding CLS o pooled a una regresión lineal o MLP entrenada con la edad cronológica como objetivo; el encoder aporta rasgos de maduración ósea aprendidos por destilación de BiomedCLIP y del ViT de tórax.
- Puntuación de artritis reumatoide: se usa el mapa de parches para localizar erosiones y estrechamiento articular, y una cabeza de regresión sobre el pooled embedding para predecir la puntuación de Sharp o similar.
- Clasificación de anomalías en radiografía de mano: se congela el encoder y se entrena una cabeza ligera de clasificación multiclase sobre el CLS embedding, aprovechando que el backbone ya está adaptado al dominio.
- Detección de articulaciones: se aplica una cabeza de detección (por ejemplo, un decodificador ligero tipo DETR) sobre los tokens de parche, que conservan información espacial a resolución 14x14.
- Segmentación ósea: se alimenta el mapa de parches a un decodificador de segmentación (U-Net ligera o cabeza lineal por token) para delimitar huesos del carpo, metacarpianos y falanges.
- Recuperación de casos similares (retrieval): se indexan los embeddings pooled de una base de radiografías y se buscan vecinos cercanos para apoyar la revisión de casos o la construcción de cohorts de investigación.
- Respuesta visual a preguntas médica: se acopla el encoder a un modelo de lenguaje (por ejemplo, mediante un adaptador tipo LLaVA) para responder preguntas sobre hallazgos en la radiografía, siempre en contexto de investigación.
- Preentrenamiento de modelos downstream con pocos datos: al ser un backbone específico de dominio, sirve como inicialización para tareas con datasets pequeños de radiografía de mano, reduciendo la necesidad de anotaciones masivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (85,66 M de parámetros x 4 bytes), más activaciones; en la práctica, menos de 2 GB para lotes pequeños a 224x224.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos; menos de 1 GB con activaciones para lotes de 1 a 8 imágenes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para investigación a gran escala se recomienda A100 o H100 por throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (AutoModel + AutoImageProcessor), exportación a ONNX, TorchScript y, previsiblemente, vLLM no aplica (no es generativo); llama.cpp y Ollama no aplican.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un ViT-B/16, la latencia por imagen en una RTX 4090 debería situarse en el orden de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HandXFM | 85,66 M | 224x224 (196 parches) | Radiografía de mano | dinov3-license | Hugging Face |
| DINOv3 ViT-B/16 (base) | 85,66 M | 224x224 | Imagen natural general | dinov3-license | Hugging Face (facebook) |
| BiomedCLIP (ViT-B/16) | ~86 M (visual) | 224x224 | Imagen médica multimodal | no disponible en la información | Hugging Face (microsoft) |
| ViT de radiografía de tórax (profesor) | no disponible | no disponible | Radiografía de tórax | no disponible | no disponible |

HandXFM comparte arquitectura y número de parámetros con DINOv3 ViT-B/16, del que deriva por ajuste fino; la diferencia es la especialización en radiografía de mano mediante destilación. Frente a BiomedCLIP, HandXFM no incluye torre de texto y está orientado a un dominio más estrecho. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- No validado para diagnóstico clínico ni para decisiones de tratamiento; el uso previsto es exclusivamente investigación sobre radiografías de mano.
- Riesgo de alucinación y de falsos positivos/negativos si se usa como clasificador directo sin una cabeza entrenada y validada en el dominio objetivo.
- Sesgos potenciales derivados del corpus de radiografías de mano utilizado en el preentrenamiento (no documentado en la model card): posible infrarrepresentación de ciertas poblaciones, equipos o protocolos de adquisición.
- Limitación de resolución: la entrada estándar es 224x224, lo que puede perder detalle fino en articulaciones pequeñas; no se documentan variantes de resolución superior.
- Sin capacidades de texto: no procesa informes ni preguntas en lenguaje natural por sí mismo; requiere un adaptador y un modelo de lenguaje externo para VQA.
- Licencia DINOv3: restringe ciertos usos comerciales y requiere revisar los términos del archivo de licencia antes de cualquier despliegue en producción.
- El repositorio solo incluye el encoder; no se distribuyen los profesores de destilación ni cabezas específicas, por lo que el usuario debe entrenar sus propias cabezas.
- No hay información sobre cuantización oficial ni sobre rendimiento en dominios distintos a la radiografía de mano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuesai/HandXFM
- Paper (NeurIPS 2026): https://neurips.cc/virtual/2026/loc/sydney/poster/150797
- Modelo base DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
