# ThakiCloud/Thaki-FacilityVision-CrackCls-ResNet18

## Resumen

Thaki-FacilityVision-CrackCls-ResNet18 es un clasificador de imagenes binario que determina si un pequeno parche (patch) de superficie de hormigon contiene una grieta. Lo desarrolla ThakiCloud como parte de su linea FacilityVision, orientada a la inspeccion automatizada de infraestructuras. El modelo no localiza ni mide la grieta: actua como un filtro rapido previo que decide si un recorte merece pasar a un modelo de segmentacion mas costoso.

Tecnicamente es un ResNet-18 de torchvision (`IMAGENET1K_V1`) afinado por completo sobre el dataset publico *Concrete Crack Images for Classification* de C. F. Ozgenel. Con 11,2 millones de parametros en fp32, el modelo es deliberadamente pequeno y ligero: la model card reporta 12,3 ms por parche en CPU con 4 hilos y unas 24.800 imagenes por segundo en una GPU B200 con batch 64.

La relevancia actual es doble. Por un lado, demuestra que un backbone convolucional clasico sigue siendo competitivo en tareas de vision industrial muy acotadas, con una F1 macro de 0,9993 en test. Por otro, la propia model card insiste en que esa cifra debe leerse como "ajuste a este dataset" y no como precision de campo, ya que todos los splits provienen de una unica fuente con iluminacion y texturas muy similares. Es, en palabras del autor, un *research preview*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, torchvision `IMAGENET1K_V1`) |
| Parametros totales | 11.187.138 (11,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | en, ko (etiquetas y documentacion; la tarea es visual) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp32) |

Otros datos tecnicos: entrada RGB redimensionada a 224 px por el lado corto con interpolacion bilineal, normalizacion ImageNet (media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`), salida softmax sobre `[no_crack, crack]` con umbral 0,5. Los parches de entrenamiento eran de 227 × 227. El repositorio incluye `config.json`, `crackcls.py` (inferencia autonoma), `eval_summary.json` y `requirements.txt`.

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estandar: red neuronal convolucional residual con bloques BasicBlock, inicializada con los pesos de ImageNet de torchvision (licencia BSD-3-Clause) y afinada de extremo a extremo para la clasificacion binaria grieta / no grieta. No hay innovaciones arquitectonicas propias; el valor esta en el ajuste fino y en el protocolo de evaluacion.

El entrenamiento usa el dataset *Concrete Crack Images for Classification* de Ozgenel (Mendeley Data, doi:10.17632/5y9wdsg2zt.2, CC BY 4.0), que no se redistribuye en el repositorio. El split se construyo con bloques de indice de 200 por clase agrupados 60/20/20 con semilla 42, y despues se eliminaron todos los parches de dev y test que tuvieran un casi-duplicado confirmado a nivel de pixel en un split anterior (1.088 de dev, 2.476 de test). El modelo se selecciono sobre dev y se puntuo una sola vez en test. No se documenta en la informacion disponible el numero exacto de tokens ni si hubo RLHF/DPO (no aplica a un clasificador de vision); tampoco se detalla la composicion exacta del dataset mas alla de su origen.

## Capacidades

- Clasificacion binaria de imagenes: devuelve probabilidad de grieta y etiqueta `crack` / `no_crack` para un parche de hormigon.
- Inferencia por lotes: `predict([...])` acepta listas de imagenes.
- Uso como filtro previo rapido antes de un modelo de segmentacion (el autor recomienda emparejarlo con CrackSeg-E2).
- Ejecucion en CPU y GPU: pensado para correr sobre recortes de fotos grandes en pipelines de preprocesado.
- Interfaz de linea de comandos: `python crackcls.py a.jpg b.jpg`.
- Reproducibilidad verificada: `crackcls.py` reproduce exactamente un ResNet-18 de torchvision con los mismos pesos (max |Δp| = 0 en parches sinteticos).
- Capacidades multilingues limitadas a la documentacion (en, ko); la tarea en si es puramente visual.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Triaje de inspeccion de edificios: recorrer automaticamente miles de recortes extraidos de fotografias de fachadas y descartar los que no contienen grieta antes de pasar los candidatos a un modelo de segmentacion, reduciendo el coste computacional del pipeline.
- Mantenimiento predictivo de infraestructura viaria: procesar capturas de puentes o muros de contencion tomadas por drones y marcar parches sospechosos para revision humana.
- Preprocesado en dispositivos de borde: al ser un modelo de 11,2 M de parametros con 12,3 ms por parche en CPU de 4 hilos, puede ejecutarse en un portatil o en un mini-PC junto a la camara sin GPU dedicada.
- Generacion de datasets etiquetados: usar el clasificador para pre-etiquetar grandes volumenes de imagenes de hormigon y acelerar la creacion de conjuntos de entrenamiento para modelos mayores, siempre con revision humana.
- Monitorizacion de obra en tiempo casi real: integrar el modelo en un pipeline que recibe imagenes de una camara fija y emite alertas cuando la proporcion de parches con grieta supera un umbral configurable.
- Investigacion en vision industrial: servir de baseline convolucional ligero y reproducible para comparar con arquitecturas mas modernas (ViT, ConvNeXt) en tareas de deteccion de defectos superficiales.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre test (n = 5.524, 2.688 con grieta):

| Modelo (test) | Macro F1 | Recall grieta | Precision grieta | Tasa de falsa alarma |
|---|---|---|---|---|
| CNN pequena (baseline) | 0,9864 | 0,9781 | 0,9940 | 0,56 % |
| ResNet-18 linear probe | 0,9955 | 0,9940 | 0,9966 | 0,32 % |
| Este modelo (fine-tune completo) | 0,9993 | 0,9993 | 0,9993 | 0,07 % |

Matriz de confusion en test: 2 falsas alarmas y 2 grietas no detectadas. El bootstrap pareado da una diferencia de macro F1 frente al linear probe de +0,0038 (IC 95 % [+0,0020, +0,0058]). Macro F1 en dev: 0,9991.

Coste medido: CPU 4 hilos, batch 1, p50 12,3 ms por parche; una GPU B200 con batch 64 alcanza unas 24.800 parches/s con 1,8 GB de memoria pico.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos fp32 ocupan unos 45 MB (11,2 M parametros × 4 bytes), por lo que cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, el autor reporta mediciones en B200, pero cualquier RTX 3060/4090 o T4 es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: inferencia directa con PyTorch usando `crackcls.py`; al ser un ResNet-18 estandar, los pesos pueden exportarse a TorchScript u ONNX para servir con ONNX Runtime o TensorRT (no documentado en la model card, pero factible por la arquitectura). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vision.
- Latencia y throughput: 12,3 ms por parche en CPU (4 hilos, batch 1); ~24.800 parches/s en B200 (batch 64).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Macro F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-FacilityVision-CrackCls-ResNet18 | 11,2 M | Clasificacion de parches | 0,9993 | CC BY 4.0 | HuggingFace |
| CNN pequena (baseline del autor) | no disponible | Clasificacion de parches | 0,9864 | no disponible | solo en la model card |
| ResNet-18 linear probe (baseline del autor) | 11,2 M | Clasificacion de parches | 0,9955 | no disponible | solo en la model card |

No se dispone de comparaciones con otros modelos publicos de deteccion de grietas en la informacion proporcionada. El autor referencia Thaki-FacilityVision-CrackSeg-E2 como modelo complementario de segmentacion, pero no se aportan sus metricas.

## Limitaciones y advertencias

- Generalizacion no medida: todos los splits provienen de un unico dataset (edificios de un mismo campus, iluminacion y textura similares). No hay evaluacion cruzada entre datasets ni de campo; cabe esperar una caida grande en otras superficies, camaras, manchas, sombras o juntas que se parezcan a grietas.
- Fuga de datos residual: la purga de casi-duplicados reduce pero no elimina el problema; recortes vecinos de la misma pared pueden seguir en splits distintos.
- Solo clasifica parches: no localiza ni mide la grieta; para mascaras a nivel de pixel hay que usar un modelo de segmentacion.
- No es una herramienta certificada para inspeccion ni un juicio de seguridad estructural; no debe usarse como unica base para decisiones de mantenimiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos negativos y falsos positivos en superficies fuera de distribucion.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; hay que respetar las atribuciones indicadas en `LICENSE` (incluida la del dataset de origen y la inicializacion de torchvision).
- Estado de research preview: el autor advierte explicitamente de que la puntuacion de test no debe interpretarse como precision de campo.
- Idiomas: la tarea es visual; el soporte en/ko se refiere a la documentacion, no a capacidades linguisticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-FacilityVision-CrackCls-ResNet18
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-FacilityVision-CrackCls-ResNet18/blob/main/MODEL_CARD.ko.md
- Modelo complementario de segmentacion: https://huggingface.co/ThakiCloud/Thaki-FacilityVision-CrackSeg-E2
- Dataset de entrenamiento (Ozgenel, Mendeley Data): doi:10.17632/5y9wdsg2zt.2
- Pesos de inicializacion (torchvision ResNet-18): https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet18.html
