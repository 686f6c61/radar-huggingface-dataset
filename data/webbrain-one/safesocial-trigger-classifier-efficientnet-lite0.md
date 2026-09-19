# webbrain-one/safesocial-trigger-classifier-efficientnet-lite0

## Resumen

SafeSocial Trigger Classifier (EfficientNet-Lite0, ONNX) es un clasificador de imagen multi-etiqueta desarrollado por el usuario webbrain-one, pensado para detectar desencadenantes visuales de comparacion social en imagenes al estilo de Instagram. El modelo es deliberadamente compacto y se distribuye en formato ONNX (opset 17) para ejecucion on-device en navegador y movil, con el objetivo declarado de funcionar como una ayuda de filtrado voluntaria y preservadora de la privacidad, no como herramienta de diagnostico ni como autoridad de moderacion.

Tecnicamente se apoya en el backbone `timm/tf_efficientnet_lite0` (dimension de features 1280), entrenado de extremo a extremo con 224 px de entrada y salida sigmoide multi-etiqueta sobre una taxonomia de 10 etiquetas: `romance_jealousy`, `social_fomo`, `luxury_status`, `travel_lifestyle`, `body_beauty_comparison`, `achievement_status`, `social_proof_popularity`, `exclusivity_access`, `none` y `uncertain`. El entrenamiento se hizo con etiquetado automatico de un profesor LLM (Qwen, `qwen3.6-35b-a3b`) servido localmente con vLLM, sobre 22.632 filas fusionadas de dos datasets de imagenes de Instagram mas un 20% de datos auxiliares de COCO (4.500 filas), durante 20 epocas.

Su relevancia actual es doble. Por un lado, es un ejemplo de destilacion profesor-alumno hacia modelos de vision muy ligeros desplegables en el propio dispositivo. Por otro, evidencia las limitaciones de este enfoque: todas las metricas publicadas miden acuerdo con el profesor, no validez humana, y el propio autor senala que falta un conjunto de evaluacion verificado por personas antes de hacer afirmaciones solidas de rendimiento en el mundo real. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-Lite0 (`timm/tf_efficientnet_lite0`, dimension de features 1280), entrenada de extremo a extremo; cabeza multi-etiqueta con activacion sigmoide |
| Parametros totales | no disponible (el autor no declara el recuento; el repositorio reporta 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada 224x224 px, resize 256 con recorte central) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX en float32 (no se declaran variantes INT8/FP16) |
| Idiomas soportados | no disponible; las etiquetas y la documentacion estan en ingles |
| Licencia | other (no se incluye fichero LICENSE en el repositorio fuente en el momento de la publicacion) |
| Formato de pesos | ONNX (`model.onnx`, opset 17) + manifiesto JSON (`safesocial-model.json`) |
| Tarea | image-classification multi-label |
| Numero de etiquetas | 10 |
| Entrada ONNX | `pixel_values`, NCHW, float32, 224x224 |
| Salida ONNX | `probabilities`, sigmoide multi-etiqueta |
| Normalizacion | media ImageNet [0.485, 0.456, 0.406], desviacion [0.229, 0.224, 0.225] |
| SHA-256 de `model.onnx` | `fd37c1cd4aafa2bc318b7d29725fa6be3931d09cc1723bb30be3ee819ee22933` |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo es una red convolucional EfficientNet-Lite0 (variante optimizada para inferencia en dispositivos, sin operaciones poco amigables para aceleradores moviles) empleada como extractor de caracteristicas y afinada de extremo a extremo. Sobre la salida del backbone se aplica una cabeza de 10 salidas con activacion sigmoide independiente por etiqueta, lo que permite asignar varias etiquetas a la misma imagen. El preprocesado es el estandar de ImageNet a 224 px con recorte central tras redimensionar a 256 px.

El entrenamiento sigue un esquema de destilacion con profesor LLM: el modelo `qwen3.6-35b-a3b`, servido localmente con vLLM, genero las etiquetas del profesor sobre la taxonomia reducida. Los datos son 19.991 filas validas de `kkcosmos/instagram-images-with-captions` mas 2.641 filas de `prithvijaunjale/instagram-images-with-captions`, un total de 22.632 filas fusionadas, mas aproximadamente un 20% de datos auxiliares de Karpathy COCO (4.500 filas de entrenamiento). El checkpoint publicado corresponde a la ejecucion EfficientNet-Lite0 "aux20" de 20 epocas descrita en `paper/core_20k_findings.md`. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un clasificador de imagen. Dos etiquetas de la taxonomia amplia anterior fueron eliminadas antes de esta ejecucion y no se predicen: `envy` (considerada demasiado subjetiva y visualmente indeterminada) y `financial_fomo` (demasiado rara en la muestra de imagenes).

## Capacidades

- Clasificacion de imagen multi-etiqueta con 10 categorias de la taxonomia SafeSocial, con umbrales por etiqueta ajustados en validacion.
- Deteccion de indicios visuales asociados a comparacion social: celos romanticos, FOMO social, estatus de lujo, estilo de vida de viajes, comparacion corporal y de belleza, estatus de logros, prueba social o popularidad y acceso exclusivo.
- Etiquetas de control: `none` (sin desencadenante) y `uncertain` (incertidumbre), aunque esta ultima tuvo soporte practicamente nulo en los splits de test.
- Inferencia on-device en CPU mediante ONNX Runtime, sin necesidad de GPU ni de conexion a red.
- Despliegue en navegador mediante ONNX Runtime Web con backend WebGPU o WASM.
- Despliegue en movil mediante ONNX Runtime React Native a traves de un development build de Expo (Expo Go no puede ejecutar la ruta nativa).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling, capacidades de agente ni modo de razonamiento explicito.
- No se declaran capacidades multilingues; la salida son etiquetas en ingles.

## Casos de uso

- Extension de navegador para filtrado voluntario en Instagram web: el modelo puede clasificar en local las imagenes que aparecen en el feed y aplicar un suavizado o difuminado opcional cuando se superan los umbrales, sin enviar datos a ningun servidor. Su tamano reducido y el uso de ONNX Runtime Web (WebGPU/WASM) lo hacen viable dentro del contexto de una pestana.
- Funcion de bienestar digital en aplicacion movil: integrado con ONNX Runtime React Native, el modelo puede contar exposiciones a contenido de comparacion social a lo largo del dia y ofrecer pausas conscientes. La inferencia local evita subir capturas o imagenes del usuario.
- Investigacion academica sobre exposicion a comparacion social: permite etiquetar grandes volumenes de imagenes de forma automatica para estudios de campo, con registro local de puntuaciones y umbrales. La licencia `other` y las advertencias del autor exigen revisar derechos antes de cualquier publicacion de datos derivados.
- Alfabetizacion mediatica y talleres educativos: puede usarse como demostracion practica de como un clasificador visual interpreta (y falla al interpretar) senales de estatus, cuerpo o viajes, ilustrando sesgos y ambiguedad de etiquetas subjetivas.
- Pre-filtrado en pipelines de moderacion o curacion de contenido: como primera etapa de triaje que marque imagenes candidatas para revision humana, dado su bajo coste computacional; nunca como decision final dado que las metricas no estan verificadas por humanos.
- Etiquetado debil y anotacion asistida de datasets: generar preetiquetas multi-etiqueta sobre corpus de imagenes para que anotadores humanos las corrijan, reduciendo el coste de construccion de datasets de comparacion social.
- Prototipado rapido de producto en el navegador: al ser un unico fichero ONNX con manifiesto JSON de umbrales, permite validar hipotesis de UX (por ejemplo, umbrales mas o menos agresivos) sin infraestructura de servidor.
- Inferencia en entornos con recursos muy limitados o sin conectividad: al no requerir GPU y caber en CPU, puede ejecutarse en portatiles antiguos, dispositivos embebidos o navegadores de gama baja.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en el model-index. Todas las metricas miden acuerdo estudiante-profesor frente al profesor Qwen (`qwen3.6-35b-a3b`), no exactitud contra verdad humana, y ninguna esta verificada de forma independiente (`verified: false`). El autor indica explicitamente que los dos dominios deben reportarse por separado.

| Dataset | Micro F1 | Macro F1 | Exact match | Label accuracy |
|---|---:|---:|---:|---:|
| Primary Instagram-domain merged test (teacher-labeled) | 0,6817 | 0,5126 | 0,2952 | 0,8684 |
| Karpathy COCO 500-image OOD holdout (teacher-labeled) | 0,6526 | 0,3466 | 0,5480 | 0,9176 |

Umbrales por etiqueta ajustados en el split de validacion y enviados en `safesocial-model.json`:

| Etiqueta | Umbral |
|---|---:|
| romance_jealousy | 0,75 |
| social_fomo | 0,80 |
| luxury_status | 0,45 |
| travel_lifestyle | 0,70 |
| body_beauty_comparison | 0,35 |
| achievement_status | 0,90 |
| social_proof_popularity | 0,60 |
| exclusivity_access | 0,60 |
| none | 0,75 |
| uncertain | 1,00 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo coherente con la naturaleza de clasificador de imagen del modelo.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones orientativas basadas en el tipo de backbone y en el formato de despliegue declarado; el autor no publica requisitos de hardware.

- VRAM estimada para inferencia: por debajo de 1 GB en float32; un backbone EfficientNet-Lite0 a 224 px con salida de 10 clases es viable incluso en GPUs de gama de entrada y en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA o DirectML (RTX 3060/4090, T4, L4, A100, H100) es sobredimensionada para este modelo; el caso de uso natural es CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo, incluidos portatiles con graficos integrados o sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`, `CUDAExecutionProvider` u otros proveedores; ONNX Runtime Web con WebGPU o WASM en navegador; ONNX Runtime React Native en movil a traves de un development build de Expo. No se declara soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ONNX de vision.
- Cuantizacion: el artefacto distribuido es float32; no se declaran variantes INT8 ni FP16, aunque el ecosistema de ONNX Runtime permite cuantizacion post-entrenamiento (no verificada por el autor).
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia ni de imagenes por segundo en ninguna plataforma.

## Comparativa con modelos similares

No se han publicado comparativas numericas en la informacion disponible, y el autor no ofrece referencias frente a otros clasificadores. Tampoco existe un benchmark humano verificado que permita situar el modelo frente a alternativas. A continuacion se describen categorias de alternativas de forma cualitativa, sin cifras que no puedan verificarse:

| Alternativa conceptual | Tipo | Diferencias relevantes frente a este modelo |
|---|---|---|
| Backbones EfficientNet-Lite0 preentrenados en ImageNet | Clasificacion de imagen | Taxonomia distinta (1.000 clases genericas); no detecta desencadenantes de comparacion social sin reentrenamiento |
| Modelos vision-lenguaje tipo CLIP o SigLIP en modo zero-shot | Clasificacion por prompt | No requieren entrenamiento especifico, pero mayor coste computacional y sin umbrales calibrados por etiqueta; datos comparativos no disponibles |
| Clasificadores de moderacion de contenido visual (seguridad, NSFW) | Clasificacion de imagen | Objetivo distinto (politicas de plataforma), normalmente centralizados y no disenados para ejecucion on-device; datos comparativos no disponibles |
| Clasificadores propios sobre otros backbones (MobileNet, ResNet, ViT-tiny) | Clasificacion de imagen | El autor no publica comparaciones con estos backbones en esta ficha; datos no disponibles |

## Limitaciones y advertencias

- Todas las metricas miden acuerdo con el profesor LLM, no validez humana. El propio autor senala que un conjunto de evaluacion verificado por personas es la principal pieza que falta antes de hacer afirmaciones fuertes sobre el rendimiento real.
- La etiqueta `uncertain` tuvo un soporte practicamente nulo en los splits de test, por lo que su comportamiento real es desconocido pese a tener umbral 1,00.
- El macro F1 es bajo (0,5126 en el test principal y 0,3466 en COCO), lo que indica rendimiento desigual entre etiquetas y probablemente muy pobre en las clases raras.
- El exact match en el test principal es de 0,2952: en menos de un tercio de las imagenes la combinacion completa de etiquetas coincide con el profesor.
- Los umbrales por etiqueta estan ajustados en validacion con etiquetas del profesor y, segun el autor, necesitan revision humana antes de sostener afirmaciones de producto, especialmente en etiquetas raras.
- Riesgo de alucinacion en el sentido de falsos positivos: etiquetas subjetivas como `romance_jealousy`, `body_beauty_comparison` o `luxury_status` dependen de convenciones culturales y de contexto ausente en la imagen. La propia taxonomia descarto `envy` por considerarla visualmente indeterminada.
- Sesgo de dominio: el entrenamiento principal proviene de imagenes de Instagram con historiales de scraping poco claros, y los datos de COCO/Flickr son solo auxiliares de robustez fuera de dominio, no evidencia de benchmark principal. Los numeros de COCO no deben mezclarse con el benchmark principal.
- Idiomas: no se declaran capacidades multilingues; las etiquetas y la documentacion estan en ingles y no hay evidencia de comportamiento con contenido de otras regiones.
- Restricciones de licencia: la licencia es `other` y no se incluye fichero LICENSE en el repositorio fuente en el momento de la publicacion, por lo que los derechos deben confirmarse antes de cualquier uso comercial.
- Uso de datos: los datasets publicos de imagenes al estilo Instagram suelen tener historiales de scraping y licencia poco claros; son aceptables para investigacion exploratoria, pero el entrenamiento de producto deberia usar imagenes con consentimiento, licencia o sinteticas. No se deben redistribuir los ficheros de imagen originales de Instagram, Kaggle o HuggingFace salvo que la licencia de origen lo permita expresamente.
- Advertencia etica explicita del autor: el modelo no es una herramienta de diagnostico, ni una autoridad de moderacion, ni una medida de validez de la persona.
- No se han publicado mediciones de latencia, throughput ni huella de memoria, y tampoco existe una evaluacion independiente del artefacto ONNX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/safesocial-trigger-classifier-efficientnet-lite0
- Repositorio fuente SafeSocial (prototipos `browser_extension/` y `mobile_app/`, detalle de experimentos en `paper/core_20k_findings.md`, exportacion en `image_classifier/export_deployment`): mencionado en la model card sin URL publica en la informacion disponible
- Backbone: `timm/tf_efficientnet_lite0` (referenciado en la model card; URL no proporcionada)
- Profesor de etiquetado: `qwen3.6-35b-a3b` servido con vLLM (referenciado en la model card; URL no proporcionada)
- Datasets de entrenamiento: `kkcosmos/instagram-images-with-captions` y `prithvijaunjale/instagram-images-with-captions` (referenciados en la model card; URLs no proporcionadas)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron exclusivamente contenido no relacionado (foros de tematica general en arabe) que no aporta informacion tecnica sobre el modelo.
