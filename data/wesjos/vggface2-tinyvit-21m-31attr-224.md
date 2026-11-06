# wesjos/vggface2-tinyvit-21m-31attr-224

## Resumen

HoneyBear es un clasificador compacto de atributos faciales desarrollado por el usuario wesjos y publicado en Hugging Face. Se trata de un modelo de vision por computador de tipo transformer (TinyViT) que, en una sola pasada hacia delante, predice tres grupos mutuamente excluyentes de atributos (edad, raza y forma de la cara) mediante cabezas softmax de cuatro clases cada uno, mas 22 atributos binarios adicionales mediante funciones sigmoideas. En total, 25 cabezas de salida sobre una unica imagen de entrada.

El modelo parte del backbone `tiny_vit_21m_224` de la libreria timm, con 20,94 millones de parametros, inicializado con pesos destilados de ImageNet-22K y ajustado de extremo a extremo sobre el conjunto completo VGGFace2 (3.057.398 imagenes de 8.414 identidades) con anotaciones de atributos de MAAD-Face. No es un modelo de la libreria `transformers`: se distribuye como checkpoint PyTorch plano (`model.pt`) que debe cargarse mediante el `inference.py` incluido en el repositorio.

Su relevancia radica en la eficiencia: con solo 20,94 M de parametros y un checkpoint de 160,1 MiB, alcanza un 95,45 % de precision balanceada macro y un 93,88 % de F1 macro en un conjunto de test congelado de 25.401 imagenes. Esto lo hace adecuado para analitica de datasets y tareas de anotacion a gran escala donde el coste computacional es un factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (`tiny_vit_21m_224`, timm), transformer de vision con atencion por ventanas |
| Parametros totales | 20.935.458 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en FP32; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | ingles (etiquetas de atributos en ingles; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, 167.882.763 bytes) |

## Arquitectura y entrenamiento

El backbone es TinyViT-21M, una variante de transformer de vision disenada para reducir coste computacional mediante atencion por ventanas y una arquitectura jerarquica con etapas de resolucion decreciente. Produce caracteristicas de 576 dimensiones que alimentan 25 cabezas de salida: tres cabezas softmax de cuatro clases (edad: `Young`, `Middle_Aged`, `Senior`, `OTHER`; raza: `Asian`, `White`, `Black`, `OTHER`; forma de cara: `Oval_Face`, `Square_Face`, `Round_Face`, `OTHER`) y 22 cabezas binarias con activacion sigmoidea y umbral 0,5.

El entrenamiento se realizo de extremo a extremo sobre el conjunto completo VGGFace2 con anotaciones de atributos de MAAD-Face, durante 12 epocas, seleccionandose el mejor checkpoint en la epoca 7. Los pesos iniciales proceden de destilacion sobre ImageNet-22K. La entrada es RGB redimensionada a 224x224 con interpolacion BICUBIC y normalizacion con media y desviacion tipica de ImageNet. El checkpoint incluye tanto el state dict del modelo como una copia EMA; la funcion `load()` utiliza la copia EMA, aunque el flag `use_ema` del checkpoint es `False`, lo que indica que la seleccion del modelo no se baso en esa copia.

## Capacidades

- Clasificacion de atributos faciales en una sola pasada: tres grupos softmax mutuamente excluyentes (edad, raza, forma de cara) con vector completo de probabilidades por grupo.
- Prediccion de 22 atributos binarios: `Beard`, `Eyeglasses`, `Obstructed_Forehead`, `Arched_Eyebrows`, `Male`, `Rosy_Cheeks`, `Wavy_Hair`, `Receding_Hairline`, `Bangs`, `Double_Chin`, `High_Cheekbones`, `Chubby`, `Brown_Eyes`, `Bags_Under_Eyes`, `Mouth_Closed`, `Smiling`, `Big_Nose`, `Heavy_Makeup`, `Wearing_Hat`, `Wearing_Earrings`, `Wearing_Necktie`, `Wearing_Lipstick`.
- Salida estructurada en JSON con clase predicha, confianza y vector de probabilidades por grupo; para atributos binarios, `present` y `confidence`.
- Ejecucion en CPU o GPU mediante PyTorch; interfaz de linea de comandos (`python inference.py imagen.jpg`) y API programatica (`load()` / `predict()`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagenes.
- No realiza deteccion de caras ni alineamiento facial; asume un recorte de una sola cara ya preparado a 224x224.

## Casos de uso

- Anotacion y curacion de datasets faciales a gran escala: el modelo permite etiquetar automaticamente millones de imagenes con 25 atributos en una sola pasada, lo que reduce el coste de anotacion manual en pipelines de investigacion biometrica.
- Analitica de sesgo y demografia en datasets: los grupos de edad, raza y forma de cara permiten auditar la distribucion demografica de un corpus de imagenes antes de entrenar otros modelos, detectando desequilibrios.
- Filtrado previo en sistemas de reconocimiento facial: los atributos binarios como `Obstructed_Forehead`, `Wearing_Hat` o `Eyeglasses` permiten descartar o marcar imagenes de baja calidad antes de pasarlas a un modelo de reconocimiento de identidad.
- Moderacion y clasificacion de contenido visual: la deteccion de `Smiling`, `Heavy_Makeup` o `Wearing_Necktie` puede emplearse en tareas de catalogacion de imagenes editoriales o de stock.
- Investigacion en atributos faciales: con 20,94 M de parametros y checkpoint de 160 MiB, es ligero para experimentacion en una sola GPU de consumo, sirviendo como linea base reproducible sobre VGGFace2.
- Preprocesamiento en dispositivos con recursos limitados: al ser un modelo pequeno, puede ejecutarse en CPU o en GPUs de gama baja para tareas de etiquetado por lotes en entornos sin aceleradores de alta gama.
- Analisis de campanas publicitarias: la clasificacion de edad y atributos de presentacion permite segmentar audiencias en imagenes de campanas o material generado por usuarios.

## Benchmarks y rendimiento

Evaluacion sobre un split de test congelado de 25.401 imagenes nunca vistas durante el entrenamiento, segun `metrics.json` del repositorio:

| Metrica | Valor |
|---|---:|
| Precision balanceada macro | 95,45 % |
| F1 macro | 93,88 % |
| Atributo mas debil (precision balanceada) | 88,71 % (`Wearing_Hat`) |
| Atributos por debajo del 60 % de precision balanceada | 0 |
| Atributos por debajo del 80 % de precision balanceada | 0 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 160 MiB; el modelo cabe holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos anos, dado su tamano reducido.
- Opciones de despliegue: PyTorch nativo mediante `inference.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo). Al ser un checkpoint PyTorch plano, puede exportarse a TorchScript u ONNX manualmente, aunque no se proporcionan scripts para ello.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se basa en TinyViT-21M, cuyo paper original (Wu et al., ECCV 2022) reporta resultados en ImageNet, pero no se ofrecen comparaciones directas con otros clasificadores de atributos faciales.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| HoneyBear (este modelo) | 20,94 M | 224x224 | Apache 2.0 | Hugging Face |
| Alternativas de atributos faciales | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de atributos proceden de la anotacion del dataset (imagenes VGGFace2 con anotaciones MAAD-Face); son gruesas, parcialmente ruidosas y la clase `OTHER` absorbe cualquier categoria fuera de las tres nombradas.
- VGGFace2 esta sesgado hacia celebridades, por lo que las predicciones de edad, raza y forma de cara heredan ese sesgo.
- La precision cae en caras ocluidas, de muy baja resolucion o fuertemente rotadas; el modelo se entreno con recortes de 224x224.
- Es un clasificador de una sola cara y una sola imagen: no incluye deteccion, alineamiento ni reconocimiento de identidad.
- Los atributos demograficos son sensibles: deben tratarse como estimaciones ruidosas para investigacion o analitica de datasets, nunca como base para decisiones sobre personas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia de los datasets de origen (VGGFace2 y MAAD-Face) y citarse adecuadamente.
- El modelo no es compatible con la API `pipeline()` de Hugging Face; requiere cargar el checkpoint con el `inference.py` incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/vggface2-tinyvit-21m-31attr-224
- Archivos del repositorio: https://huggingface.co/wesjos/vggface2-tinyvit-21m-31attr-224/tree/main
- Paper de VGGFace2 (Cao et al., 2018): https://arxiv.org/abs/1710.08092
- Paper de MAAD-Face (Terhorst et al., 2021): https://arxiv.org/abs/2102.01788
- Paper de TinyViT (Wu et al., ECCV 2022): https://arxiv.org/abs/2207.10666
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
