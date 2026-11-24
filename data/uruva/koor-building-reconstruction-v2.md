# Uruva/Koor-building-reconstruction-v2

## Resumen

Koor-building-reconstruction-v2 es un modelo de reconstruccion de cubiertas de edificios a partir de nubes de puntos LiDAR 3D. Lo desarrolla Uruva y es un ajuste fino (fine-tuning) del modelo previo Uruva/Koor-building-reconstruction-v1, del cual hereda la arquitectura Point2Roof. El modelo toma como entrada una nube de puntos XYZ de una cubierta y devuelve las esquinas 3D y las aristas no dirigidas que definen su estructura (wireframe), sin generar superficies, muros ni mallas cerradas.

La version v2 se entrena de forma conjunta con datos sinteticos y con el dataset real Building3D, incorporando un profesor congelado de deteccion de esquinas (v1) sobre los ejemplos sinteticos. El objetivo declarado es cerrar la brecha de rendimiento en datos LiDAR reales que presentaba v1. El resultado es un modelo experimental de especializacion: mejora en el holdout real de Building3D pero pierde precision en el conjunto sintetico, por lo que no supone una mejora en todas las metricas de v1.

Se trata de un modelo muy pequeno (1.409.032 parametros segun safetensors) y de proposito especifico, orientado a investigacion en reconstruccion de estructuras de cubierta. No es un modelo de lenguaje ni un modelo multimodal: no procesa imagenes, no infiere geometria a partir de fotografias y no interpreta coordenadas de mapa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point2Roof (red de aprendizaje profundo para reconstruccion de wireframe de cubiertas desde nubes de puntos) |
| Parametros totales | 1.409.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de 1.024 puntos muestreados de la nube XYZ) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en FP32) |
| Idiomas soportados | no aplica (modelo geometrico, no linguistico) |
| Licencia | no disponible (el codigo Point2Roof conserva su aviso MIT; los terminos del dataset Building3D son CC BY, texto truncado en la model card) |
| Formato de pesos | safetensors (libreria pytorch; requiere extension CUDA `pc_util` compilada) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Point2Roof, disenada para predecir esquinas 3D y aristas de una cubierta a partir de una nube de puntos. La entrada es una nube XYZ de una unica cubierta, normalizada por el centro de su bounding box y una escala de span maximo compartida, desplazada en +0.5 y muestreada a 1.024 puntos. La salida son vertices 3D y aristas no dirigidas, transformados de vuelta al sistema de coordenadas y unidades de entrada. No se infiere CRS, georreferenciacion, elevacion del suelo ni identidad del edificio.

El entrenamiento parte de la inicializacion v1 (epoca 29 seleccionada del entrenamiento sintetico). El estudiante entrena las tres etapas con perdidas supervisadas; sobre los ejemplos sinteticos, las puntuaciones de puntos y los offsets se destilan de un detector de esquinas v1 congelado en modo eval, sin perdida directa de profesor para grafos refinados ni aristas. Se realizan 15 epocas con batch de 16 (ocho sinteticos y ocho reales), FP32, tasas de aprendizaje de 1e-5 para esquinas y 1e-4 para la cabeza, Adam con weight decay 1e-3 y StepLR que reduce a la mitad cada cinco epocas. Los pesos de destilacion son 1 con temperatura 2. El entorno registrado es A40, Python 3.12.0, PyTorch 2.11.0+cu128 y CUDA 12.8.

Los datos sinteticos se dividen en 14.400/1.599/1.600 para entrenamiento/validacion/test, con geometrias normalizadas coincidentes aisladas y una muestra de entrenamiento excluida. Building3D usa 4.538/533/561 cubiertas para entrenamiento/validacion/holdout personalizado, con 66 excluidas por buffers de frontera espacial. Las 583 nubes de test oficiales sin etiquetar no se evaluaron. Las entradas de Building3D usan solo XYZ; RGB, NIR e intensidad no se emplean.

## Capacidades

- Prediccion de esquinas 3D y aristas no dirigidas de una cubierta a partir de una nube de puntos XYZ.
- Reconstruccion de wireframe de tejados en datos LiDAR reales (mejorada respecto a v1 en Building3D).
- Procesamiento de nubes de puntos normalizadas con muestreo a 1.024 puntos y reescalado a coordenadas originales.
- Manejo de nubes pequenas: conserva todos los puntos y anade muestras de reemplazo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No infiere geometria desde fotografias, coordenadas de mapa, plantas ni imagenes.
- No predice plantas, no genera JavaScript, no produce caras de cubierta, muros, texturas ni mallas cerradas.

## Casos de uso

- Digitalizacion de inventarios de cubiertas a partir de LiDAR aereo: el modelo convierte nubes de puntos XYZ de tejados en wireframes de esquinas y aristas, adecuado para catalogar estructuras de cubierta en estudios urbanos a escala de edificio.
- Investigacion en reconstruccion 3D: sirve como linea base experimental para comparar tecnicas de point2roof y evaluar la transferencia de datos sinteticos a LiDAR real, dado su diseno de destilacion con profesor congelado.
- Preprocesado para pipelines de modelado BIM: las esquinas y aristas generadas pueden alimentar etapas posteriores de modelado geometrico, aunque el modelo no produce mallas cerradas ni caras.
- Analisis de calidad de datos LiDAR: al evaluar la F1 de vertices y aristas sobre nubes reales, puede emplearse para detectar cubiertas mal capturadas o con pocas aristas aceptadas (45 de 561 en el holdout real).
- Prototipado en entornos de investigacion con GPU: su tamano reducido (1,4 M de parametros) permite iterar rapidamente en una unica GPU, aunque requiere compilar la extension CUDA `pc_util`.
- Generacion de datos de entrenamiento sinteticos: el modelo puede usarse para producir wireframes de referencia sobre nubes sinteticas, con la advertencia de que su precision sintetica es inferior a la de v1.
- Validacion de tecnicas de destilacion: el esquema de profesor congelado v1 sobre ejemplos sinteticos es replicable para estudiar la brecha sintetico-real en tareas geometricas.

## Benchmarks y rendimiento

Resultados de evaluacion held-out publicados en la model card (micro-F1, tolerancias como fraccion del span maximo del bounding box XYZ de la nube de entrada; esquinas con asignacion hungara de minima distancia total y corte por tolerancia; aristas aceptadas si conectan dos esquinas emparejadas con etiqueta y umbral 0,5; puntuaciones sin calibrar):

| Conjunto held-out | Tolerancia | Vertex F1 v1 | Vertex F1 v2 | Edge F1 v1 | Edge F1 v2 |
|---|---:|---:|---:|---:|---:|
| Test sintetico (1.600) | 1% | 0,5871 | 0,5279 | 0,4076 | 0,3334 |
| Test sintetico (1.600) | 2% | 0,8891 | 0,8650 | 0,8372 | 0,7985 |
| Test sintetico (1.600) | 5% | 0,9547 | 0,9451 | 0,9441 | 0,9276 |
| Holdout espacial Building3D (561) | 1% | 0,0032 | 0,0711 | 0,0000 | 0,0133 |
| Holdout espacial Building3D (561) | 2% | 0,0208 | 0,2650 | 0,0026 | 0,1457 |
| Holdout espacial Building3D (561) | 5% | 0,1763 | 0,5275 | 0,0482 | 0,3979 |

Las seis F1 reales mejoran y las seis sinteticas empeoran. Las cubiertas reales sin aristas aceptadas aumentan de 37 a 45 de 561. Ambos modelos tuvieron cero esquinas y aristas vacias en el test sintetico. El checkpoint seleccionado es la epoca 14, elegida sobre validacion conjunta antes de la evaluacion en test; no se alcanzo la puerta de retencion sintetica de todas las metricas y `best_retained.pt` nunca se creo. Estas son evaluaciones propias de Koor sobre un holdout espacial personalizado de Building3D, no reproducciones de benchmarks publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo tiene 1,4 M de parametros en FP32, por lo que el peso de los pesos es del orden de pocos MB, pero el requisito real lo marca la extension CUDA y el pipeline de nubes de puntos.
- GPU recomendadas: A40 es el entorno de ejecucion registrado (arquitectura 8.6); A100 indicada con `--arch 8.0`. Se requiere CUDA y compilador/toolkit CUDA para compilar `pc_util`.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 ni otras GPU de consumo; la model card indica que la verificacion en otro hardware esta pendiente.
- Opciones de despliegue: inferencia PyTorch personalizada mediante `inference.py`; no es una integracion AutoModel ni de inferencia alojada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Verificacion: `verify_release.py` comprueba empaquetado, carga e inferencia, no precision; debe ejecutarse en la GPU objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento (holdout Building3D, 5%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koor-building-reconstruction-v2 | 1.409.032 | 1.024 puntos XYZ | Vertex F1 0,5275 / Edge F1 0,3979 | no disponible | Hugging Face (este repo) |
| Koor-building-reconstruction-v1 | no disponible | 1.024 puntos XYZ | Vertex F1 0,1763 / Edge F1 0,0482 | no disponible | Hugging Face (modelo base) |
| Point2Roof (arquitectura original) | no disponible | no disponible | no disponible | MIT (codigo) | GitHub (Li-Li-Whu/Point2Roof) |

No se dispone de datos de benchmarks de otras alternativas en la informacion proporcionada; la comparativa con modelos externos a la familia Koor queda como no disponible.

## Limitaciones y advertencias

- Es una especializacion experimental: mejora el holdout real de Building3D pero empeora todas las metricas sinteticas respecto a v1. No es una mejora universal.
- Las puntuaciones agregadas no garantizan fiabilidad por cubierta individual ni reconstruccion completa de edificios; 45 de 561 cubiertas reales no tuvieron aristas aceptadas.
- Las puntuaciones estan sin calibrar y dependen de tolerancias relativas al bounding box, no de metros fijos.
- El modelo solo procesa nubes XYZ de una unica cubierta; no infiere geometria desde fotografias, coordenadas de mapa ni plantas, y no produce caras, muros, texturas ni mallas cerradas.
- No infiere CRS, georreferenciacion, elevacion del suelo ni identidad del edificio.
- Las entradas de Building3D usan solo XYZ; RGB, NIR e intensidad se descartan.
- Requiere CUDA y la compilacion de la extension `pc_util`; no hay integracion AutoModel ni inferencia alojada.
- La licencia no esta disponible en la informacion proporcionada; el codigo Point2Roof conserva MIT y los terminos de Building3D son CC BY (texto truncado), por lo que el uso comercial debe verificarse antes de produccion.
- Riesgo de alucinacion geometrica: el modelo puede generar esquinas o aristas plausibles pero incorrectas en cubiertas reales con poca cobertura o ruido.
- Sesgos de dominio: entrenado con datos sinteticos y Building3D (entorno urbano concreto); la generalizacion a otras ciudades, sensores o densidades de nube no esta validada.
- No se evaluaron las 583 nubes de test oficiales sin etiquetar de Building3D.
- `verify_release.py` es un smoke test: un resultado correcto no establece rendimiento de benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uruva/Koor-building-reconstruction-v2
- Modelo base v1: https://huggingface.co/Uruva/Koor-building-reconstruction-v1
- Codigo de entrenamiento, evaluacion y preparacion de datos (Koor v2): https://github.com/rahulprasath-s/Koor/tree/4baa5ea68616a88e5acd3c69ec96ad43d493d3f5/v2
- Arquitectura Point2Roof: https://github.com/Li-Li-Whu/Point2Roof
- Dataset Building3D: https://szusic.github.io/Building3D/
- Paper Building3D (ICCV 2023): Ruisheng Wang, Shangfeng Huang y Hongxin Yang, "Building3D: An Urban-Scale Dataset and Benchmarks for Learning Roof Structures from Point Clouds"
