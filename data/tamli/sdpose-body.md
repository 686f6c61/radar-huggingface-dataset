# tamli/SDPose-Body

## Resumen

SDPose-Body es un modelo de estimación de pose humana (keypoint detection) desarrollado por el autor de HuggingFace `tamli` y presentado en el artículo arXiv:2509.24980, titulado "SDPose: Exploiting Diffusion Priors for Out-of-Domain and Robust Pose Estimation". A diferencia de los estimadores de pose convencionales, SDPose reutiliza los priors visuales de Stable Diffusion v2 inicializando su backbone U-Net con los pesos de ese modelo generativo y añadiendo una cabeza de predicción de mapas de calor (heatmaps). El objetivo es mejorar la robustez en escenarios fuera de distribución (OOD), es decir, imágenes con estilos o dominios alejados de los datos de entrenamiento habituales.

El modelo sigue un esquema top-down de dos etapas: primero se detectan las cajas de las personas con un detector de objetos externo (por ejemplo YOLO11-x) y después se recorta cada instancia y se estiman 17 keypoints corporales en formato COCO (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos). La entrada se procesa a una resolución de 1024×768 (alto×ancho) y la salida son mapas de calor más coordenadas con puntuaciones de confianza, todo ello integrado en el framework MMPose.

Su relevancia actual radica en que ataca un problema clásico de la visión por computador: los estimadores de pose entrenados sobre COCO suelen degradarse gravemente cuando se aplican a pinturas, anime, bocetos o imágenes con condiciones de captura distintas. Al aprovechar los priors de un modelo de difusión, SDPose declara superar a alternativas como Sapiens o ViTPose++ en benchmarks OOD manteniendo un rendimiento competitivo en el dominio de entrada. Está publicado bajo licencia MIT y sus pesos se distribuyen en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net (backbone inicializado con pesos de Stable Diffusion v2) con cabeza personalizada de predicción de heatmaps |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 1024×768) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo es de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

SDPose emplea un backbone U-Net heredado de Stable Diffusion v2 con cambios arquitectónicos mínimos, sobre el que se acopla una cabeza específica de estimación de pose que genera mapas de calor para 17 keypoints. El flujo es top-down: un detector de personas (YOLO11-x en la implementación de referencia) proporciona las cajas delimitadoras, cada recorte se redimensiona a 1024×768 y la red produce los heatmaps y las coordenadas asociadas con su confianza. Todo el pipeline se implementa sobre MMPose y se distribuye con una interfaz Gradio para demostración.

El entrenamiento se realizó exclusivamente sobre COCO-2017 `train2017`, sin datos adicionales, lo que refuerza el interés del resultado: el modelo generaliza a dominios fuera de distribución pese a no haber visto datos de esos dominios. Las imágenes se redimensionan y recortan a 1024×768 y se aplican aumentos que incluyen volteo horizontal aleatorio, transformaciones de medio cuerpo y de bounding box, afinado UDP y aumentos de Albumentations (desenfoque gaussiano y de mediana, coarse dropout). Los mapas de calor se codifican con el códec UDP al estilo de MMPose. No se especifica en la información disponible si hubo fases de RLHF, DPO u optimizaciones de ese tipo, algo por lo demás poco habitual en un modelo de visión.

## Capacidades

- Estimación de pose humana con 17 keypoints en formato COCO (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos).
- Modo top-down: requiere un detector de personas previo, lo que permite escalar el número de instancias por imagen.
- Predicción mediante mapas de calor con puntuaciones de confianza por keypoint.
- Robustez declarada en escenarios fuera de distribución: imágenes artísticas, pinturas, anime y bocetos.
- Aplicación sobre imágenes naturales de uso general, con rendimiento competitivo en el dominio de entrada (COCO).
- Adecuado para seguimiento de pose en vídeo al aplicarse fotograma a fotograma dentro de un pipeline externo.
- Integración con el ecosistema MMPose y con una demo Gradio lista para usar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.
- No se declaran capacidades de segmentación, reconocimiento de manos o rostro detallado, ni estimación de pose 3D.

## Casos de uso

- Rotoscopia y animación 2D: el modelo puede extraer los 17 keypoints de personajes en fotogramas de animación o ilustración, un dominio donde los estimadores entrenados solo con COCO suelen fallar; su entrenamiento con priors de difusión está pensado precisamente para ese salto de dominio.
- Análisis biomecánico y deportivo: a partir de vídeo de atletas, el pipeline top-down detecta cada persona y estima la pose, permitiendo calcular ángulos articulares, simetrías y trayectorias de extremidades para evaluación técnica.
- Producción audiovisual y VFX: la extracción de esqueletos 2D sobre metraje real sirve como paso previo para rigging, matchmove o generación de datos de control en herramientas de síntesis.
- Vigilancia y análisis de comportamiento: al soportar múltiples instancias por imagen mediante detección previa de cajas, puede aplicarse a estimación de pose en escenas con varias personas para tareas de seguridad, control de aforo o análisis de interacciones.
- Interacción persona-máquina y robótica: la pose 2D por keypoints es una señal de bajo coste computacional para interfaces gestuales, teleoperación o control de avatares en tiempo real cuando se ejecuta en GPU de gama alta.
- Investigación en robustez y evaluación OOD: dado que el modelo se ha entrenado solo con COCO-2017, resulta un punto de comparación útil para estudiar transferencia de dominio y generalización en visión por computador.
- Etiquetado asistido y aumento de datos: los keypoints predichos pueden emplearse para preanotar datasets propios, reduciendo el coste de anotación manual antes de una revisión humana.
- Extracción de control de pose para pipelines de generación: los esqueletos 2D obtenidos pueden alimentar mecanismos de condicionamiento de pose en modelos de difusión para imagen o vídeo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que SDPose supera significativamente a estimadores tradicionales como Sapiens y ViTPose++ en benchmarks fuera de distribución, manteniendo un rendimiento competitivo en el dominio de entrada (COCO), pero remite al artículo arXiv:2509.24980 para las cifras completas, que no se han proporcionado en esta ficha.

## Requisitos de hardware

- Entrada fija a 1024×768 píxeles, lo que condiciona el coste de memoria y cómputo de cada inferencia (estimación: el recorte se procesa a resolución alta, más exigente que los 256×192 habituales de otros estimadores de pose).
- Repositorio de 5,3 GB, coherente con un backbone derivado de Stable Diffusion v2; no se especifica la precisión de los pesos almacenados.
- VRAM estimada (estimación propia, no confirmada por el autor): del orden de 6-8 GB en FP32 y aproximadamente 3-5 GB en FP16 para el modelo de pose, a lo que hay que sumar la memoria del detector de personas (YOLO11-x) y el almacenamiento de los mapas de calor.
- GPU recomendadas: no indicadas por el autor. Por el tamaño del backbone, tarjetas como RTX 4090, RTX 3090, A100 o H100 son adecuadas; GPU de gama media con 8-12 GB podrían ser suficientes en FP16, aunque este dato no está confirmado.
- Cabe previsiblemente en GPU de consumo (RTX 3060 12 GB en adelante) si se ajusta la precisión, pero no hay cifras oficiales de consumo.
- Opciones de despliegue: la documentación oficial describe el uso mediante MMPose y una aplicación Gradio (`bash launch_gradio.sh`) sobre el repositorio SDPose-OOD. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de backbone | Keypoints | Entrenamiento | Licencia | Rendimiento OOD |
|---|---|---|---|---|---|
| SDPose-Body | U-Net con priors de Stable Diffusion v2 | 17 (COCO) | Solo COCO-2017 | MIT | Declarado superior a Sapiens y ViTPose++ (cifras no disponibles) |
| Sapiens (Meta) | Transformer de visión | Cuerpo, rostro, manos (configuraciones) | Datos humanos a gran escala | no disponible en esta búsqueda | Referencia comparativa citada por el artículo, sin cifras en la información disponible |
| ViTPose++ | Vision Transformer | 17 (COCO) y variantes | COCO y conjuntos adicionales | no disponible en esta búsqueda | Referencia comparativa citada por el artículo, sin cifras en la información disponible |

No se dispone de datos numéricos de parámetros, contexto ni rendimiento de los modelos comparados dentro de la información proporcionada; la comparación es, por tanto, cualitativa y basada en las afirmaciones de la model card.

## Limitaciones y advertencias

- Sesgos: el entrenamiento se limita a COCO-2017, un dataset con sesgos conocidos de composición demográfica, geográfica y de contexto; el rendimiento puede ser desigual según el tipo de persona, la ropa o las condiciones de captura.
- Riesgo de error en keypoints: como todo estimador de pose, puede producir uniones anatómicamente imposibles o keypoints con alta confianza sobre zonas equivocadas, especialmente en oclusiones, cuerpos muy recortados o poses extremas.
- Dependencia del detector: al ser un modelo top-down, los fallos del detector de personas (cajas mal ajustadas, personas no detectadas) degradan directamente el resultado final.
- Dominio: aunque está diseñado para escenarios fuera de distribución, no se garantiza su comportamiento en cualquier estilo artístico o condición de imagen; la robustez declarada es una tendencia, no una garantía universal.
- Idiomas: la etiqueta de idioma es `en`, pero se trata de un modelo de visión sin procesamiento de lenguaje, por lo que esta etiqueta solo describe el idioma de la documentación y no una capacidad funcional.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright correspondiente. Debe verificarse además la licencia de los pesos base de Stable Diffusion v2 de los que parte el backbone, aspecto que la model card no detalla.
- Métricas: no se han publicado cifras de benchmarks en la información disponible, por lo que cualquier afirmación de superioridad frente a otros modelos debe contrastarse en el artículo.
- Adopción: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Producción: no se documentan cuantizaciones, formatos optimizados ni pruebas de latencia, por lo que el despliegue a gran escala requeriría una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tamli/SDPose-Body
- Artículo (arXiv:2509.24980): https://arxiv.org/abs/2509.24980
- Página del proyecto: https://t-s-liang.github.io/SDPose
- Repositorio de código: https://github.com/t-s-liang/SDPose-OOD
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/teemosliang/SDPose-Body
- Pesos del detector YOLO11-x: https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11x.pt
- Contacto del autor: tsliang2001@gmail.com
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden de la model card y de los metadatos de HuggingFace.
