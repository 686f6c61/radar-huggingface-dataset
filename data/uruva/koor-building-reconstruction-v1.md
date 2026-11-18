# Uruva/Koor-building-reconstruction-v1

## Resumen

Koor-building-reconstruction-v1 es un modelo de reconstruccion de cubiertas de edificios a partir de nubes de puntos LiDAR. Lo publica el usuario Uruva en Hugging Face y no es una arquitectura de proposito general ni un modelo de lenguaje: es un checkpoint de vision 3D especializado que transforma una nube de puntos XYZ de una cubierta en un esqueleto de alambre (wireframe) compuesto por esquinas 3D y aristas no dirigidas. Emplea la arquitectura Point2Roof con correcciones de compatibilidad y un flujo de entrenamiento y evaluacion propio.

El modelo es deliberadamente pequeno: 1.409.032 parametros en formato safetensors, lo que lo situa en la categoria de modelos ligeros de investigacion. Se entreno sobre el conjunto sintetico de Point2Roof y su rendimiento en datos reales de Building3D es muy bajo, tal como reconoce el propio autor. Por tanto, su interes actual no esta en produccion sino en servir como linea base reproducible para investigacion en reconstruccion de cubiertas y para comparaciones controladas con versiones posteriores (v2).

La relevancia practica es limitada pero clara: ofrece un pipeline completo y verificable (preprocesado, inferencia, evaluacion con umbrales congelados y protocolo documentado) para quien investigue point2roof, y advierte explicitamente de que no infiere direcciones, coordenadas, numero de plantas, muros, fachadas ni texturas. La salida es un wireframe de cubierta, no una malla de edificio estanca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point2Roof (red de aprendizaje profundo sobre nubes de puntos, con cabezas de esquinas, refinamiento y aristas) |
| Parametros totales | 1.409.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de 1.024 puntos XYZ por cubierta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere codigo PyTorch personalizado y extension CUDA compilada) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Point2Roof, publicada por Li Li, Nan Song, Fei Sun, Xinyi Liu, Ruisheng Wang, Jian Yao y Shapsheng Cao en el trabajo *Point2Roof: End-to-end 3D building roof modeling from airborne LiDAR point clouds*. No introduce una arquitectura nueva: aplica correcciones de compatibilidad y un flujo propio de entrenamiento y evaluacion. La red procesa una nube de puntos de una cubierta y produce dos cabezas de salida: esquinas 3D y aristas no dirigidas, con una etapa de refinamiento intermedia.

El entrenamiento se realizo sobre el conjunto sintetico de Point2Roof con reparto `train: 14400`, `val: 1599` y `test: 1600`. El proceso consto de una etapa de esquinas de seis epocas seguida del entrenamiento completo de cubierta, en el que la etapa de esquinas se congelo inicialmente y despues se actualizo conjuntamente con las cabezas de refinamiento y aristas. El checkpoint seleccionado corresponde a la epoca 29, elegido por la media armonica de micro-F1 de esquinas y aristas en validacion con tolerancia normalizada de 0,05. Los ajustes exactos estan en `training_metadata.json`; el `model.safetensors` no incluye estado del optimizador ni entrenamiento reanudable. El entrenamiento y la evaluacion se ejecutaron en NVIDIA B200 con CUDA 13.2 (build cu132), y la inferencia requiere CUDA: no hay implementacion para CPU.

## Capacidades

- Prediccion de esquinas 3D y aristas no dirigidas a partir de una nube de puntos XYZ de una cubierta individual.
- Preprocesado integrado: centrado en el centro del bounding box de la nube completa, normalizacion por el maximo span del bounding box y desplazamiento de 0,5; muestreo de 1.024 puntos sin reemplazo (con relleno con reemplazo si no hay suficientes).
- Transformacion inversa de la salida al sistema de coordenadas y unidades de entrada.
- Exportacion de resultados a JSON y a OBJ con vertices y lineas.
- API Python (`load_model`, `predict`) y CLI (`inference.py`) para inferencia local.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No procesa color, NIR ni intensidad: solo coordenadas XYZ.
- No infiere CRS, unidades, direcciones, numero de plantas, muros, fachadas ni texturas.

## Casos de uso

- Investigacion en reconstruccion de cubiertas: sirve como linea base reproducible sobre el conjunto sintetico de Point2Roof, con protocolo de evaluacion congelado y resultados documentados para comparar futuras versiones (v1 frente a v2).
- Validacion de pipelines de preprocesado: al exigir un preprocesado concreto (centrado, normalizacion por span, muestreo a 1.024 puntos), permite comprobar que una implementacion propia reproduce el comportamiento esperado antes de integrar modelos mayores.
- Generacion de wireframes de cubierta en entornos controlados: sobre nubes sinteticas o muy limpias, produce esquinas y aristas exportables a OBJ para visualizacion o edicion posterior en herramientas CAD.
- Docencia y experimentacion con point2roof: su tamano (1,4 M de parametros) y su codigo PyTorch personalizado lo hacen adecuado para estudiar el flujo completo de entrenamiento, evaluacion y exportacion sin grandes recursos.
- Pruebas de integracion de inferencia CUDA: el paquete incluye `verify_release.py` e `install_cuda_extension.py`, utiles para validar que un entorno con CUDA y compilador C++ compatible funciona antes de desplegar modelos mas pesados.
- Analisis de brecha sintetico-real: permite medir experimentalmente la caida de rendimiento al pasar del dominio sintetico al LiDAR real de Building3D, con resultados documentados (micro-F1 de esquinas de 0,0032 a tolerancia del 1 % en el holdout real).

## Benchmarks y rendimiento

Resultados publicados en la model card (protocolo Koor, no reproduccion exacta de los benchmarks oficiales de Point2Roof ni Building3D). La tolerancia es una fraccion del span maximo del bounding box XYZ de la nube de entrada completa; las esquinas se emparejan por asignacion hungara de minima distancia total con corte por tolerancia, y una arista es correcta solo si ambos extremos coinciden con una arista objetivo (umbral de puntuacion de arista 0,5).

| Benchmark | Edificios | Tolerancia | Micro-F1 esquinas | Micro-F1 aristas |
|---|---:|---:|---:|---:|
| Point2Roof sintetico, test | 1600 | 1 % | 0,5874 | 0,4079 |
| Point2Roof sintetico, test | 1600 | 2 % | 0,8891 | 0,8372 |
| Point2Roof sintetico, test | 1600 | 5 % | 0,9549 | 0,9445 |
| Building3D holdout espacial, zero-shot | 561 | 1 % | 0,0032 | 0,0000 |
| Building3D holdout espacial, zero-shot | 561 | 2 % | 0,0212 | 0,0028 |
| Building3D holdout espacial, zero-shot | 561 | 5 % | 0,1770 | 0,0482 |

En el holdout real, 0 de 561 edificios quedaron sin esquinas y 37 de 561 sin aristas aceptadas; el autor advierte que una salida no vacia no implica reconstruccion correcta. El holdout real es una particion espacial propia de datos etiquetados de Building3D Entry-level; el conjunto de test oficial sin etiquetar no se evaluo y queda reservado para la comparacion congelada v1/v2. Precision, recall, macro-F1, error de asignacion, recuentos de fallos y entorno estan en `evaluation/`.

## Requisitos de hardware

- Inferencia exclusivamente en CUDA; no hay implementacion para CPU.
- VRAM estimada: no disponible en la informacion proporcionada; con 1,4 M de parametros el peso de los pesos es minimo, pero el consumo real depende de la extension CUDA y del preprocesado.
- GPU de referencia: NVIDIA B200, empleada para entrenamiento y evaluacion. Otras GPU no estan verificadas.
- Encaje en GPU de consumo: no verificado por el autor; no se confirma compatibilidad con RTX 4090 ni otras tarjetas consumer.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de Transformers; requiere compilar desde el codigo fuente con `install_cuda_extension.py --arch 10.0 --jobs 4`, un toolkit CUDA compatible (build registrado cu132) y un compilador C++ soportado, y validar con `verify_release.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Koor-building-reconstruction-v1 | 1.409.032 | Nube XYZ de cubierta (1.024 puntos) | Esquinas 3D y aristas | no disponible | Hugging Face, codigo PyTorch personalizado |
| Point2Roof (referencia original) | no disponible | Nube LiDAR aerea | Modelado de cubierta 3D | no disponible | Repositorio GitHub de los autores |
| Building3D (benchmark) | no aplica (conjunto de datos) | Nubes LiDAR etiquetadas | Etiquetas de referencia | no disponible | Conjunto de datos de los autores |

La comparacion con Point2Roof original y con otros modelos point2roof no puede establecerse con cifras porque la model card no incluye sus resultados numericos ni sus especificaciones de parametros. Koor v1 se declara explicitamente como linea base de investigacion entrenada en sintetico, no como sustituto del modelo publicado.

## Limitaciones y advertencias

- Transferencia a LiDAR real muy debil: micro-F1 de esquinas de 0,0032 a tolerancia del 1 % y de 0,1770 al 5 % en el holdout de Building3D.
- Posicionamiento fino de esquinas deficiente a tolerancias estrictas.
- Cubiertas dispersas o complejas pueden producir esquinas omitidas o sobrantes, aristas incorrectas, grafos desconectados o predicciones vacias.
- No garantiza conectividad ni superficies de cubierta cerradas; la salida es un wireframe, no una malla estanca.
- No segmenta automaticamente puntos de suelo ni fachadas.
- No infiere direccion, coordenadas, numero de plantas, muros, fachadas ni texturas, ni CRS o unidades.
- Las puntuaciones de aristas no estan calibradas.
- No validado para decisiones criticas de medicion.
- Licencia no especificada: no hay autorizacion explicita para uso comercial.
- Requiere CUDA y compilacion de extension nativa; solo se ha verificado en NVIDIA B200.
- El emparejamiento de duplicados en el reparto sintetico no detecta todas las cubiertas rotadas o casi duplicadas.
- El checkpoint no incluye estado del optimizador ni permite reanudar el entrenamiento.
- El modelo no es un `AutoModel` de Transformers ni se integra en pipelines estandar del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uruva/Koor-building-reconstruction-v1
- Repositorio de Point2Roof: https://github.com/Li-Li-Whu/Point2Roof
- Referencia bibliografica: Li Li, Nan Song, Fei Sun, Xinyi Liu, Ruisheng Wang, Jian Yao y Shapsheng Cao, *Point2Roof: End-to-end 3D building roof modeling from airborne LiDAR point clouds* (paper no enlazado en la informacion disponible)
- Conjunto de datos Building3D: no disponible enlace directo en la informacion proporcionada
- Demo: no disponible
