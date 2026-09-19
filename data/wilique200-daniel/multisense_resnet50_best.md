# wilique200-daniel/multisense_resnet50_best

## Resumen

MultiSense Disaster & Conflict Damage Classifier es un modelo de clasificación de imágenes publicado por el usuario wilique200-daniel en HuggingFace. Se trata de un ResNet50 preentrenado en ImageNet y afinado para clasificar el nivel de daño estructural en escenas afectadas por desastres naturales y zonas de conflicto, con cinco categorías: inundación de Derna (Libia), terremoto de Siria, conflicto de Gaza, huracán Harvey y ausencia de daño. Su función declarada es actuar como rama de procesamiento visual dentro de un pipeline multimodal de respuesta ante catástrofes.

El modelo resuelve un problema de triaje visual: dado un gran volumen de imágenes procedentes de redes sociales, prensa o teledetección, asignar cada una a un evento de daño concreto para priorizar la revisión humana. El autor reporta una exactitud ponderada del 97% y un F1 macro de 0,96 sobre el conjunto de test, con un F1 por clase que va de 0,92 (clase `no_damage`) a 1,00 (clase `hurricaine_harvey`, escrita así en la model card).

Es relevante ahora porque la respuesta humanitaria necesita filtrado automático de imágenes a escala, y porque la model card documenta de forma explícita sus sesgos (marcas de agua, logotipos de prensa, proporciones de imagen), algo poco habitual y útil para evaluar su robustez antes de desplegarlo. Se distribuye bajo licencia CC-BY-4.0 y el repositorio ocupa 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN con bloques residuales), preentrenada en ImageNet y con cabeza clasificadora nueva que usa activación GELU |
| Parámetros totales | Aproximadamente 25,6 M (cifra estándar de la arquitectura ResNet50; el autor no la publica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, no generativo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible en la información proporcionada; las etiquetas de clase están en inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (el repositorio ocupa 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un ResNet50 estándar preentrenado en ImageNet al que se le sustituye la cabeza clasificadora por una nueva con activación GELU, ajustada a las cinco clases del problema. El entrenamiento se realizó con el optimizador AdamW, scheduler OneCycleLR y precisión mixta, según la model card.

Los datos provienen del dataset MultiSense / GAZADeepDav (Mendeley Data, DOI 10.17632/krkft96n43.2) y cubren cinco categorías ligadas a eventos reales: `derna_flood`, `syria_earthquake`, `gaza_war`, `hurricaine_harvey` y `no_damage`. El preprocesado aplica un recorte de borde de aproximadamente el 12% en cada lado para mitigar artefactos de esquina; el aumento de datos incluye RandomResizedCrop, volteo horizontal, rotaciones de ángulo pequeño y color jitter para contrarrestar el sesgo de brillo. Para compensar un desbalanceo de clases de 2,3x se usó un WeightedRandomSampler. No se menciona en la información disponible ninguna fase de RLHF, DPO ni destilación, algo esperable en un clasificador visual.

## Capacidades

- Clasificación de imágenes en cinco clases de severidad y tipo de daño: inundación, terremoto, conflicto, huracán y sin daño.
- Salida de etiqueta única (clasificación multiclase) con probabilidades asociadas, integrable como rama visual de un pipeline multimodal.
- Funciona como prefiltro de grandes volúmenes de imágenes, reduciendo la carga de revisión manual.
- Extracción de características visuales reutilizable si se recicla el backbone ResNet50 (no documentado por el autor, pero es la práctica habitual con este tipo de arquitecturas).
- No soporta generación de texto, tool calling, function calling ni razonamiento multietapa.
- No soporta agentes ni planificación.
- Capacidades multilingües: no aplica; el modelo no procesa texto.

## Casos de uso

- Triaje de imágenes en catástrofes: el modelo etiqueta lotes masivos de fotografías de redes sociales o prensa y permite a los equipos humanitarios priorizar las zonas con daño confirmado por evento.
- Rama visual de una API multimodal de respuesta ante desastres: tal como declara la model card, puede encadenarse con módulos de texto (informes, alertas) para construir un sistema completo de análisis de situación.
- Verificación de daños sobre imágenes de dron o satélite: al operar con recortes cuadrados y panorámicos, encaja en pipelines que reciben teselas de distinta proporción, aunque conviene controlar el sesgo de proporción descrito más abajo.
- Priorización de evaluaciones estructurales tras un seísmo: clasificar rápidamente imágenes de edificios para distinguir zonas con daño aparente de zonas sin daño y dirigir allí a los equipos de inspección.
- Análisis de cobertura mediática y monitorización de crisis: permite agrupar automáticamente imágenes de un evento concreto (por ejemplo, el huracán Harvey) para estudios de impacto o para sistemas de alerta temprana basados en medios.
- Gestión de siniestros en seguros: como primer filtro para separar expedientes con evidencia fotográfica de daño real de aquellos sin daño, siempre con revisión humana posterior por el riesgo de atajos visuales.
- Curación y etiquetado de datasets de catástrofes: uso como anotador automático débil para preetiquetar imágenes antes de la revisión manual, dado su F1 alto en cuatro de las cinco clases.
- Investigación sobre sesgos en visión por computador: la propia model card documenta artefactos de origen (marcas de agua, logotipos), lo que lo convierte en un caso de estudio útil para medir aprendizaje de atajos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test. No hay datos de benchmarks de propósito general (MMLU, HumanEval, GSM8K) porque no aplican a un clasificador de imágenes.

| Métrica | Valor |
|---|---|
| Exactitud ponderada (weighted accuracy) | 97% |
| F1 medio macro | 0,96 |
| F1 clase `hurricaine_harvey` | 1,00 |
| F1 clase `gaza_war` | 0,98 |
| F1 clase `derna_flood` | 0,96 |
| F1 clase `syria_earthquake` | 0,96 |
| F1 clase `no_damage` | 0,92 |
| Exactitud en imágenes cuadradas | 0,960 |
| Exactitud en imágenes panorámicas | 0,998 |
| Exactitud en otras proporciones | 1,000 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1-2 GB en FP32 para lotes pequeños a 224x224, y por debajo de 1 GB en FP16 o INT8. Son estimaciones basadas en el tamaño estándar de ResNet50, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, L4, RTX 3060 o superior es más que suficiente. No se necesita A100 ni H100 para inferencia de un solo modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU con latencias aceptables para lotes moderados.
- Opciones de despliegue: PyTorch nativo o exportación a TorchScript, ONNX Runtime y TensorRT. Frameworks como vLLM, TGI o llama.cpp no aplican a este tipo de modelo. Para servicio HTTP, FastAPI o TorchServe son opciones habituales.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No hay comparativas publicadas sobre el mismo dataset. La tabla siguiente usa arquitecturas de referencia habituales para clasificación de imágenes, con cifras estándar de arquitectura y sin resultados medidos sobre MultiSense/GAZADeepDav.

| Modelo | Arquitectura | Parámetros | Tipo de tarea | Licencia del checkpoint | Disponibilidad |
|---|---|---|---|---|---|
| MultiSense Disaster & Conflict Damage Classifier | ResNet50 afinado | ~25,6 M | Clasificación de 5 clases de daño | CC-BY-4.0 | HuggingFace (0 descargas, 0 likes) |
| ResNet50 ImageNet | CNN residual | ~25,6 M | Clasificación ImageNet (1000 clases) | No disponible | Ampliamente disponible como backbone |
| EfficientNet-B0 | CNN con escalado compuesto | ~5,3 M | Clasificación ImageNet | No disponible | Ampliamente disponible como backbone |
| ViT-B/16 | Transformer de visión | ~86 M | Clasificación ImageNet | No disponible | Ampliamente disponible como backbone |
| ConvNeXt-Tiny | CNN con diseño tipo transformer | ~28 M | Clasificación ImageNet | No disponible | Ampliamente disponible como backbone |

## Limitaciones y advertencias

- Aprendizaje de atajos por artefactos de origen: la auditoría visual del autor detectó marcas de agua de agencias y logotipos DJI en `no_damage`, texto y logotipos de cadenas de televisión en `gaza_war`, elementos de interfaz de YouTube en `syria_earthquake` y marcas de agua y pies de foto en `derna_flood`. La clase `hurricaine_harvey` era visualmente limpia (0 de 6 muestras con artefactos), lo que genera un riesgo real de que el modelo aprenda la regla "sin marca de agua = huracán Harvey".
- Sesgo por proporción de imagen: el dataset tiene una distribución bimodal (cuadrada frente a panorámica) y `hurricaine_harvey` es un valor atípico con un 81,3% de imágenes cuadradas. La exactitud en test difiere según la proporción (0,960 en cuadradas, 0,998 en panorámicas, 1,000 en otras), probablemente porque los encuadres panorámicos contienen más contexto visual.
- Desbalanceo de clases de 2,3x en el dataset original, mitigado con WeightedRandomSampler pero no eliminado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos al asignar una categoría de daño a una imagen fuera de la distribución de entrenamiento.
- Generalización limitada: las cinco clases están ligadas a eventos concretos (Derna, Siria, Gaza, Harvey). Un desastre nuevo y visualmente distinto puede no clasificarse correctamente.
- Idioma: el modelo no procesa texto, por lo que no hay soporte multilingüe; las etiquetas están en inglés.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial, pero exige atribución al autor y al dataset. Conviene revisar también las condiciones del dataset Mendeley asociado antes de un despliegue en producción.
- Supervisión humana recomendada: dado el contexto humanitario y el riesgo de atajos visuales, no debería usarse como único criterio para decisiones operativas.
- No hay información publicada sobre calibración de probabilidades, comportamiento fuera de dominio, formato exacto de pesos ni pasos de reproducción del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wilique200-daniel/multisense_resnet50_best
- Dataset MultiSense / GAZADeepDav (Mendeley Data, DOI 10.17632/krkft96n43.2): https://data.mendeley.com/datasets/krkft96n43/2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de búsqueda web disponibles; los resultados devueltos no guardaban relación con el modelo.
