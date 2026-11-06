# ummeabiha/segformer-b2-karachi-rickshaw

## Resumen

SegFormer-B2 fine-tuned para carreteras de Karachi es un modelo de segmentación semántica de imágenes desarrollado por la usuaria ummeabiha (Umme Abiha) como proyecto de curso universitario. Parte del checkpoint `nvidia/segformer-b2-finetuned-cityscapes-1024-1024`, que segmenta escenas urbanas europeas en 19 clases, y lo ajusta con siete fotografías de carreteras de Karachi etiquetadas a mano para añadir una vigésima clase: `rickshaw`, que agrupa los auto-rickshaws y chingchis habituales en Pakistán y ausentes en Cityscapes.

El objetivo es comparar el comportamiento de la segmentación entrenada con datos europeos frente a escenas del sur de Asia, donde la composición del tráfico (rickshaws, motocicletas, camiones decorados) difiere sustancialmente. La arquitectura es SegFormer-B2, un transformer jerárquico con encoder MiT-B2 y cabeza de decodificación ligera, con 27.363.540 parámetros totales y pesos en formato safetensors.

Es relevante como ejemplo de adaptación de dominio con recursos mínimos y de extensión del espacio de etiquetas de un modelo preentrenado, pero el propio autor lo describe explícitamente como una prueba de concepto y no como un modelo de producción. La licencia derivada de NVIDIA restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (transformer jerárquico, encoder MiT-B2 + cabeza de decodificación MLP) |
| Parametros totales | 27.363.540 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de hasta 1024 px en el lado mayor) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de texto) |
| Licencia | NVIDIA Source Code License for SegFormer (solo uso no comercial: investigación o evaluación) |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Clases | 20 (19 de Cityscapes + `rickshaw`) |
| Resolución de entrenamiento | recorte 512x512; evaluación con lado mayor hasta 1024 px |
| Tamaño del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

SegFormer combina un encoder transformer jerárquico sin positional encodings fijos (MiT, en su variante B2) con un decodificador ligero que fusiona características multiescala mediante capas MLP. El modelo base fue entrenado por NVIDIA sobre Cityscapes a resolución 1024x1024 y predice 19 clases de escena urbana con identificadores de entrenamiento (train IDs) estándar.

El ajuste fino se realizó sobre siete fotografías de carreteras de Karachi etiquetadas manualmente con polígonos en makesense.ai, cubriendo las clases road, person, car, motorcycle, rickshaw, bus y truck. Para el resto de píxeles se usaron las predicciones del modelo Cityscapes original como pseudoetiquetas en clases de fondo (cielo, edificios, vegetación), e se ignoraron los píxeles donde el modelo base predecía carretera, vehículo o persona fuera de las etiquetas manuales. El canal de salida de `rickshaw` se inicializó como la media de los pesos de `car` y `motorcycle`. El entrenamiento usó 2.000 iteraciones, batch de 2, recortes de 512x512, AdamW con weight decay 0.01, learning rate 6e-5 para el encoder y 6e-4 para la cabeza con decaimiento polinómico (potencia 0.9), entropía cruzada con peso 3 para rickshaw y 2 para motorcycle, aumento de datos (escala aleatoria 0.6-1.25, recortes sesgados hacia rickshaws y motos, volteos horizontales, brillo y contraste) y precisión mixta fp16 en una GPU T4.

## Capacidades

- Segmentación semántica densa por píxel en 20 clases de escena viaria urbana.
- Detección de la clase `rickshaw` (auto-rickshaws y chingchis), ausente en Cityscapes.
- Segmentación de carretera, acera, edificio, muro, valla, poste, semáforo, señal de tráfico, vegetación, terreno, cielo, persona, ciclista, coche, camión, autobús, tren, motocicleta y bicicleta.
- Entrada de imágenes RGB con lado mayor de hasta 1024 px (redimensionado previo con `thumbnail` y normalización sin resize adicional).
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de texto: es exclusivamente un modelo de visión.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Investigación comparativa de dominio: evaluar la degradación de un segmentador entrenado en Cityscapes al aplicarse a escenas del sur de Asia y cuantificar la mejora tras un ajuste fino mínimo, como hace el propio autor.
- Etiquetado asistido de nuevas imágenes de Karachi: usar las predicciones como preanotación en makesense.ai o herramientas similares para acelerar el etiquetado manual de un corpus mayor, revisando especialmente las clases rickshaw, camión y cielo.
- Docencia y proyectos académicos de segmentación semántica: sirve como ejemplo reproducible de extensión del espacio de etiquetas y de inicialización de un canal nuevo a partir de pesos existentes.
- Análisis de composición del tráfico en imágenes estáticas: conteo aproximado de rickshaws, motocicletas y coches en fotografías de calle para estudios urbanos exploratorios, con validación manual obligatoria.
- Prototipado de pipelines de visión en transformers: validar la integración de `SegformerForSemanticSegmentation` con procesadores de imagen del modelo base y la interpolación bilineal de logits a la resolución original.
- Generación de máscaras para edición o aumentación de datos: producir máscaras de clase para recortar o recomponer regiones (carretera, cielo, vegetación) en conjuntos de imágenes de prueba.
- No es adecuado para conducción autónoma, sistemas de seguridad ni decisiones del mundo real, tal como advierte el autor.

## Benchmarks y rendimiento

Evaluación sobre 4 fotografías de test de Karachi reservadas (con 5 rickshaws, 6 motocicletas y 2 camiones). El autor advierte que la muestra es muy pequeña y que un objeto de más o de menos puede mover la puntuación de una clase entre 15 y 50 puntos.

| Clase | IoU antes del fine-tuning (%) | IoU después del fine-tuning (%) |
|---|---|---|
| road | 88.7 | 91.7 |
| person | 47.2 | 53.5 |
| car | 40.0 | 67.7 |
| motorcycle | 39.4 | 57.6 |
| rickshaw | 0.0 | 32.4 |
| truck | 19.5 | 14.6 |
| Media (6 clases) | 39.1 | 52.9 |

| Métrica global | Antes | Después |
|---|---|---|
| Exactitud por píxel | 74.1% | 81.9% |

La clase bus se excluye porque las fotos de test no contienen autobuses. No se han publicado resultados de benchmarks estándar (ADE20K, MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en fp16 para una imagen de 1024x1024, dado el tamaño de 27,4 M de parámetros y las activaciones del encoder jerárquico; no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó con una NVIDIA T4. Una RTX 3060, RTX 4060 o superiores son suficientes para inferencia.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con PyTorch (vía `SegformerForSemanticSegmentation`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documentan pesos GGUF ni soporte en llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Clases | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ummeabiha/segformer-b2-karachi-rickshaw | 27,4 M | 20 (Cityscapes + rickshaw) | hasta 1024 px lado mayor | NVIDIA Source Code License (no comercial) | Hugging Face |
| nvidia/segformer-b2-finetuned-cityscapes-1024-1024 | 27,4 M | 19 (Cityscapes) | 1024x1024 | NVIDIA Source Code License (no comercial) | Hugging Face |
| SegFormer-B2 original (MiT-B2, ADE20K) | ~27 M | 150 (ADE20K) | variable | NVIDIA Source Code License | GitHub NVlabs/SegFormer |

La comparación con alternativas de la misma categoría (por ejemplo, Mask2Former o DeepLabV3+) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 7 fotografías: sobreajuste severo y generalización limitada a otras cámaras, iluminaciones o escenas de Karachi.
- Los Suzuki loaders decorados se predicen con frecuencia como rickshaws.
- El cielo con neblina puede clasificarse como carretera.
- Los rickshaws se sobrepredicen en escenas concurridas.
- Las clases cielo, edificios, árboles y aceras no se etiquetaron a mano: dependen de las predicciones del modelo Cityscapes original y heredan sus sesgos.
- La clase bus tiene muy pocos ejemplos para evaluarse.
- Las métricas proceden de solo 4 imágenes de test: alta varianza y poca fiabilidad estadística.
- Licencia NVIDIA Source Code License for SegFormer: uso exclusivamente no comercial (investigación o evaluación); no apto para productos comerciales sin licencia adicional de NVIDIA.
- No debe usarse para conducción, seguridad u otras decisiones del mundo real, según indica el propio autor.
- No incluye procesador de imagen en el repositorio: es obligatorio cargar el `SegformerImageProcessor` del modelo base y usar `do_resize=False` tras aplicar `thumbnail` a 1024 px.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ummeabiha/segformer-b2-karachi-rickshaw
- Modelo base: https://huggingface.co/nvidia/segformer-b2-finetuned-cityscapes-1024-1024
- Repositorio con las fotografías de entrenamiento: https://github.com/ummeabiha/KarachiRoadSegmentation-CityscapesToKarachi
- Licencia de SegFormer (NVIDIA): https://github.com/NVlabs/SegFormer/blob/master/LICENSE
- Paper de SegFormer (Xie et al., NeurIPS 2021): https://arxiv.org/abs/2105.15203
- Paper de Cityscapes (Cordts et al., CVPR 2016): https://arxiv.org/abs/1604.01685
- Ficha de referencia del SegFormer-B2 en AIBase: https://model.aibase.com/models/details/1915694323351576578
