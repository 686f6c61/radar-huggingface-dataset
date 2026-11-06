# zhihao406/MonoPCA

## Resumen

MonoPCA es un modelo de deteccion de objetos 3D monocular orientado a conduccion autonoma, presentado en el articulo "Rethinking Geometric Depth in Monocular 3D Object Detection: A Projection-Consistent Reformulation" (NeurIPS 2026) por Zhihao Zhang, Abhinav Kumar, Huaizhi Qu, Tianlong Chen y Xiaoming Liu. El modelo estima cajas 3D orientadas (dimensiones, posicion y angulo de guinada) a partir de una unica imagen RGB y su matriz de calibracion, sin necesidad de LiDAR ni de estereo.

La arquitectura combina un backbone hibrido denominado MoB (Mixture of Backbone), que fusiona una piramide ResNet-50 con el transformer visual EVA-02-L, y un cabezal de profundidad llamado PCDepth, que reformula la estimacion geometrica de profundidad de forma consistente con la proyeccion. El modelo tiene 357 millones de parametros, entrada de 1280 x 512 pixeles y fue entrenado con datos de KITTI, nuScenes (camara frontal) y Waymo (camara frontal) sobre once clases de trafico.

Su relevancia practica radica en que actua como modelo profesor del esquema GeoAlign, lo que lo convierte en la referencia de mayor capacidad de la familia MonoPCA. La publicacion del checkpoint con licencia MIT y pesos en safetensors facilita su uso como linea base en investigacion de deteccion 3D monocular y su integracion en pipelines de percepcion automotriz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: backbone MoB (ResNet-50 + EVA-02-L) con cabezal de profundidad PCDepth y atencion deformable multiescala |
| Parametros totales | 357.452.068 (354M segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors de precision completa) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) con configuracion YAML (`monopca_inference.yaml`) |
| Entrada | Imagen RGB de 1280 x 512, reescalada a una focal virtual de 748,84 px, mas calibracion de camara |
| Clases detectadas | Car, Pedestrian, Trailer, Bus, Motorcycle, Cyclist, Barrier, Truck, Van, Traffic_cone, Bicycle |
| Datos de entrenamiento | KITTI + nuScenes (camara frontal) + Waymo (camara frontal) |
| Tamano del repositorio | 1,4 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

MonoPCA emplea un diseno de dos etapas implicitamente acopladas. El backbone MoB fusiona caracteristicas de una piramide ResNet-50, que aporta resolucion espacial y bajo coste computacional, con las de EVA-02-L, un transformer visual preentrenado de gran capacidad que aporta semantica rica. Sobre esa representacion fusionada opera PCDepth, un modulo de prediccion de profundidad que reformula la geometria de la escena para que sea consistente con la proyeccion de la camara, evitando las inconsistencias tipicas de los metodos que estiman profundidad y cajas 3D de forma independiente. El modelo utiliza atencion deformable multiescala, implementada como operacion CUDA personalizada que debe compilarse antes de la inferencia.

El entrenamiento combina tres de los conjuntos de datos de referencia en conduccion autonoma (KITTI, nuScenes y Waymo), lo que aporta diversidad de sensores, ciudades y condiciones de iluminacion. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion adicionales mas alla del esquema GeoAlign, del cual este checkpoint es el profesor. No se especifican tampoco tecnicas de aumento de datos ni el numero de epochs.

## Capacidades

- Deteccion de objetos 3D monocular: predice cajas 3D orientadas (alto, ancho, largo, posicion x/y/z y angulo de guinada) a partir de una sola imagen RGB y su calibracion.
- Deteccion multiclase: cubre once categorias de trafico urbano e interurbano, incluidas clases poco frecuentes como Trailer, Barrier o Traffic_cone.
- Estimacion de profundidad geometrica consistente con la proyeccion de la camara mediante el modulo PCDepth.
- Fusion de caracteristicas convolutionales y de transformer a traves del backbone MoB.
- Salida en formato KITTI estandar con puntuacion de confianza por objeto, directamente consumible por herramientas de evaluacion existentes.
- Funcionamiento con una unica camara, sin requisito de LiDAR, radar ni configuracion estereo.
- Capacidad de actuar como modelo profesor en destilacion (esquema GeoAlign).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje o audio.

## Casos de uso

- Percepcion de bajo coste en vehiculos de produccion: al requerir solo una camara monocular y calibracion, permite dotar de deteccion 3D a plataformas sin LiDAR, reduciendo el coste del hardware de percepcion.
- Generacion de etiquetas pseudo-3D para autoetiquetado: el modelo puede producir cajas 3D sobre grandes volaciones de imagenes no anotadas, que luego se filtran y se usan para entrenar detectores mas ligeros.
- Destilacion de conocimiento: como profesor de GeoAlign, sirve para transferir capacidad a modelos estudiantes de menor tamano y menor latencia para despliegue en vehiculo.
- Analisis de escenas en datasets de conduccion: procesar secuencias de KITTI, nuScenes o Waymo para extraer trayectorias y posiciones 3D de agentes y alimentar analisis de comportamiento.
- Monitorizacion de trafico en infraestructura: con camaras fijas calibradas, estimar distancia y orientacion de vehiculos y peatones para sistemas de gestion de trafico o seguridad vial.
- Robotica movil en exteriores: estimacion de obstaculos 3D con una camara monocular en robots de reparto o plataformas AGV que operan en entornos urbanos.
- Investigacion en deteccion 3D monocular: linea base de referencia para comparar nuevas formulaciones geometricas o nuevos backbones, dado que el checkpoint esta publicado con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (AP3D, APBEV, error de profundidad) sobre KITTI, nuScenes ni Waymo.

## Requisitos de hardware

- GPU con CUDA obligatoria: la operacion de atencion deformable multiescala solo se ejecuta en CUDA, por lo que no hay inferencia viable en CPU.
- VRAM estimada: no disponible de forma explicita; con 354M parametros en precision completa, los pesos ocupan aproximadamente 1,4 GB, a lo que hay que sumar activaciones de un backbone EVA-02-L a resolucion 1280 x 512, lo que en la practica exige una GPU de gama media-alta.
- GPU recomendadas: NVIDIA A100 o H100 para procesamiento por lotes; RTX 4090 o RTX 3090 para inferencia interactiva.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090, 3090 y modelos con 16 GB o mas de VRAM, aunque el dato exacto de memoria pico no esta publicado.
- Opciones de despliegue: repositorio oficial de PyTorch con `tools/inference.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Requiere compilar la extension CUDA de atencion deformable (`lib/models/monopca/ops/make.sh`) antes de la inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MonoPCA (MoB) | 354M | Monocular RGB + calibracion | KITTI + nuScenes + Waymo | MIT | Pesos en Hugging Face |
| MonoDETR | No disponible en la informacion | Monocular RGB | KITTI | No disponible en la informacion | Codigo publico |
| MonoDLE | No disponible en la informacion | Monocular RGB | KITTI | No disponible en la informacion | Codigo publico |
| SMOKE | No disponible en la informacion | Monocular RGB | KITTI | No disponible en la informacion | Codigo publico |

No se dispone de datos de rendimiento comparativo entre MonoPCA y estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- Dependencia exclusiva de CUDA: no es posible ejecutar inferencia en CPU ni en aceleradores no NVIDIA sin reimplementar la atencion deformable.
- Requiere calibracion de camara: la prediccion 3D se expresa en el sistema de coordenadas de la calibracion proporcionada; una calibracion incorrecta invalida las cajas.
- Resolucion de entrada fija: la imagen se reescala a una focal virtual de 748,84 px y a 1280 x 512, lo que puede degradar el rendimiento con camaras de focal muy distinta.
- Entrenado unicamente con camaras frontales de KITTI, nuScenes y Waymo: el dominio cubierto son escenas de conduccion; el rendimiento en otros entornos (interiores, camaras cenitales, drones) no esta caracterizado.
- Riesgo de alucinacion geometrica: como todo detector monocular, puede producir cajas con profundidad plausible pero incorrecta en objetos ocluidos o lejanos.
- Sesgos de dataset: la composicion geografica (Alemania, Singapur, Boston, San Francisco) y las condiciones meteorologicas de los tres conjuntos pueden no representar otras regiones.
- Sin datos publicados de benchmarks ni de evaluacion de sesgos, lo que dificulta estimar su robustez en produccion.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes; su uso esta acotado a vision por computador.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar las licencias de los datasets subyacentes si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhihao406/MonoPCA
- Repositorio de codigo: https://github.com/alanzhangcs/MonoPCA
- Pagina del proyecto: https://alanzhangcs.github.io/MonoPCA-Page/
- Perfil del primer autor: https://alanzhangcs.github.io/
- Perfil de Abhinav Kumar: https://sites.google.com/view/abhinavkumar
- Perfil de Huaizhi Qu: https://qhz991029.github.io/
- Perfil de Tianlong Chen: https://tianlong-chen.github.io/
- Perfil de Xiaoming Liu: https://cs.unc.edu/person/xiaoming-liu/
