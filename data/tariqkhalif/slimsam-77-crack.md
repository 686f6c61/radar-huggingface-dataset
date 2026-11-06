# tariqkhalif/slimsam-77-crack

## Resumen

SlimSAM 77% uniform, crack-tuned (SnapClaim) es un modelo de segmentación de imágenes derivado de nielsr/slimsam-77-uniform, publicado por el usuario tariqkhalif en Hugging Face. Se trata de un ajuste fino (fine-tuning) del decodificador de máscaras de SlimSAM, un modelo de la familia Segment Anything (SAM) con arquitectura reducida al 77% de los parámetros del SAM original mediante destilación uniforme. El objetivo concreto es la segmentación de grietas en superficies de hormigón, pensado para su uso en la aplicación SnapClaim, que evalúa daños en el navegador.

El problema que resuelve es específico: las grietas son estructuras muy finas y el SlimSAM original, ante un toque sobre una grieta, tiende a proponer como candidatas la pared que la rodea o una mancha, no la grieta misma. Este ajuste entrena el decodificador para que la candidata de menor tamaño que supera un umbral de 0,5 de confianza trace efectivamente la grieta. El codificador de visión permanece congelado e idéntico al del modelo base, por lo que los ficheros ONNX del encoder son los mismos que los de Xenova/slimsam-77-uniform.

La relevancia del modelo es acotada pero clara: demuestra un caso de uso práctico de ajuste fino de SAM para una tarea de nicho (inspección de daños estructurales, seguros) con despliegue en navegador mediante transformers.js y ONNX. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SlimSAM (variante destilada de Segment Anything Model, SAM) con codificador de visión congelado y decodificador de máscaras ajustado |
| Parámetros totales | no disponible (el nombre indica reducción al 77% respecto a SAM; cifra absoluta no disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | ONNX fp32 y ONNX cuantizado dinámico por canal con pesos QInt8 en el decodificador |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportación para transformers.js); el modelo base en PyTorch |
| Tarea (pipeline) | mask-generation |
| Modelo base | nielsr/slimsam-77-uniform |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Segment Anything (SAM): un codificador de visión que extrae embeddings de la imagen, un codificador de prompts que procesa los puntos o cajas de entrada, y un decodificador de máscaras que genera las máscaras candidatas. En este caso, la variante SlimSAM reduce el tamaño mediante destilación uniforme al 77%. Durante el ajuste fino, el codificador de visión se mantiene congelado y sus embeddings se calculan una sola vez (más una versión con flip horizontal), de modo que únicamente se entrena el decodificador de máscaras del codificador de prompts.

Los datos de entrenamiento provienen del Concrete Crack Segmentation Dataset de Özgenel (2019), publicado en Mendeley Data (doi:10.17632/jwsn7tfbrp.1, licencia CC BY 4.0), con 458 pares de imagen y máscara y una partición 80/20. El entrenamiento se realizó durante 12 épocas con AdamW, tasa de aprendizaje 1e-4, scheduler coseno y un toque positivo aleatorio por imagen y paso. La función de pérdida combina la focal de SAM con factor 20 más dice sobre la mejor candidata, más un término MSE sobre la cabeza de IoU. El checkpoint se seleccionó sobre una porción de validación de la partición de entrenamiento. La cuantización replica los ajustes de la exportación de Xenova: dinámica, por canal y con pesos QInt8 en el decodificador.

## Capacidades

- Segmentación de imágenes guiada por prompts de punto (point-prompted segmentation), generando tres máscaras candidatas por toque.
- Segmentación específica de grietas en superficies de hormigón, con el decodificador ajustado para que la candidata de menor tamaño con puntuación igual o superior a 0,5 trace la grieta.
- Generación de máscaras (pipeline mask-generation) compatible con transformers.js.
- Ejecución en navegador mediante ONNX Runtime Web, con rutas WebGPU (fp32) y WASM (cuantizada).
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje: es un modelo puramente visual.
- No dispone de capacidades multilingües ni de modo thinking.

## Casos de uso

- Inspección de daños estructurales en navegador: la aplicación SnapClaim carga el modelo con transformers.js y permite al usuario tocar una grieta en una foto para obtener su contorno, sin enviar la imagen a un servidor. La ruta WASM cuantizada mantiene el coste de cómputo bajo en equipos sin GPU.
- Evaluación de siniestros en seguros: el modelo permite delimitar grietas en fotos de inmuebles enviadas por asegurados y calcular su extensión para estimar la gravedad del daño, con una mIoU de 0,459 en el conjunto de prueba del autor.
- Triaje automático de informes de mantenimiento: integrado en un formulario web, el modelo marca las grietas detectadas en las fotos subidas por técnicos para priorizar revisiones presenciales.
- Anotación asistida para creación de datasets: dado que el modelo propone máscaras sobre grietas con un solo toque, puede usarse como preanotador en herramientas de etiquetado, reduciendo el tiempo de dibujo manual de contornos.
- Aplicaciones móviles o web de autodiagnóstico para particulares: un usuario fotografía una pared agrietada y recibe una visualización del contorno de la grieta y una estimación de superficie afectada.
- Procesamiento por lotes de imágenes de inspección: al ser un modelo pequeño (repositorio de 0,1 GB) y ejecutable con ONNX, puede desplegarse en pipelines ligeros que procesen lotes de fotos de hormigón y filtren las que contienen grietas relevantes.

## Benchmarks y rendimiento

El autor publica resultados sobre una partición reservada de 92 imágenes (20%, semilla 7) no vistas durante el entrenamiento, con cinco toques aleatorios sobre la grieta por imagen (460 toques en total), midiendo mIoU contra la máscara de referencia y eligiendo la candidata del mismo modo que la aplicación.

| Modelo | mIoU (selección de la app) | mIoU (mejor de 3) |
|---|---|---|
| SlimSAM original (PyTorch) | 0,131 | 0,234 |
| Ajustado, ONNX fp32 (ruta WebGPU) | 0,459 | 0,476 |
| Ajustado, ONNX cuantizado (ruta WASM) | 0,457 | 0,474 |

El autor indica que el decodificador ONNX coincide con PyTorch con una diferencia máxima de 0,0008 en los logits brutos. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y compatible con GPUs integradas y equipos de gama baja.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ruta fp32 en navegador; en servidor, GPUs de gama de entrada son suficientes dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, con amplio margen; también puede ejecutarse en CPU mediante la ruta WASM cuantizada.
- Opciones de despliegue: transformers.js en navegador (WebGPU o WASM), ONNX Runtime; el modelo base es compatible con el ecosistema PyTorch de Hugging Face Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en grietas (mIoU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlimSAM 77% crack-tuned (este) | 77% de SAM (cifra absoluta no disponible) | no aplica | 0,459 (selección de la app) | Apache-2.0 | Hugging Face, ONNX para transformers.js |
| SlimSAM 77% uniform (base) | 77% de SAM (cifra absoluta no disponible) | no aplica | 0,131 (selección de la app) | Apache-2.0 | Hugging Face, ONNX |
| SAM original | no disponible en la información | no aplica | no medido en el conjunto del autor | Apache-2.0 | Hugging Face, múltiples formatos |

La comparación con el SAM original en esta tarea concreta no está disponible; el autor solo compara contra el SlimSAM original. Otros modelos de segmentación especializados en grietas no se mencionan en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó solo con fotos de móvil (mayoritariamente 4032x3024) de superficies de hormigón con grietas; el rendimiento en otros materiales (yeso, ladrillo, azulejo), en tomas amplias o en daños distintos de grietas (abolladuras, manchas de agua) no se ha medido.
- La selección de la candidata depende de un umbral de 0,5 y de elegir la máscara más pequeña que lo supera; este criterio puede fallar en imágenes con varias grietas o con ruido.
- Riesgo de alucinación de máscaras: como todo modelo SAM, puede generar contornos plausibles pero incorrectos en regiones sin grietas claras.
- El conjunto de evaluación es pequeño (92 imágenes, 460 toques), por lo que las cifras de mIoU tienen alta varianza y no deben extrapolarse sin validación propia.
- Licencia Apache-2.0 para el modelo; los datos de entrenamiento son CC BY 4.0 y requieren atribución a Çağlar Fırat Özgenel (Concrete Crack Segmentation Dataset).
- El modelo no procesa lenguaje ni admite tool calling; su integración requiere un componente externo que gestione la interfaz y los prompts de punto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tariqkhalif/slimsam-77-crack
- Modelo base: https://huggingface.co/nielsr/slimsam-77-uniform
- Exportación ONNX de referencia: https://huggingface.co/Xenova/slimsam-77-uniform
- Dataset de entrenamiento: Özgenel (2019), Concrete Crack Segmentation Dataset, Mendeley Data V1, doi:10.17632/jwsn7tfbrp.1
