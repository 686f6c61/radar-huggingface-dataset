# xtcpete/xdg

## Resumen

XDG (Accelerated Visual Disambiguation) es un modelo de visión por computador desarrollado por Gonglin Chen, Ben Southall, Hanyuan Xiao, Wenbin Teng, Haolin Xiong, Tianwen Fu, Junyi Ouyang, Kshitij Singh Minhas, Supun Samarasekera, Rakesh Kumar y Yajie Zhao (publicado en arXiv con el identificador 2608.29733). Su función es puntuar pares de imágenes para detectar coincidencias visualmente muy similares pero geométricamente inconsistentes —los llamados *doppelgangers*— antes de ejecutar un pipeline de Structure from Motion (SfM). Al filtrar esos pares se evitan conexiones erróneas que corrompen la reconstrucción 3D.

Técnicamente no es un modelo generativo ni un modelo de lenguaje: es un clasificador binario de pares de imágenes construido sobre un backbone Depth Anything 3 base (DA3-BASE) al que se le añade un adaptador LoRA de rango 8 y una cabeza clasificadora. El checkpoint liberado contiene 121.403.650 parámetros e incluye el backbone, los pesos LoRA y el clasificador en un único fichero `xdg.pth`, por lo que no se necesita descargar DA3 por separado en inferencia. La entrada se redimensiona a 560 × 560 píxeles por defecto y el modelo agrega características extraídas en ambos órdenes del par (A,B) y (B,A).

Su relevancia actual radica en el coste computacional del filtrado de pares en fotogrametría: el proyecto declara un rendimiento de desambiguación comparable al de Doppelgangers++ (DG++) con una inferencia 3,5 veces más rápida en sus benchmarks de pares y de SfM. Se distribuye bajo licencia Apache 2.0, con 0 descargas y 0 *likes* en el momento de la consulta, y un tamaño de repositorio de 0,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Depth Anything 3 base (DA3-BASE) con LoRA de rango 8, características de *camera token* de cuatro etapas y clasificador binario |
| Parámetros totales | 121.403.650 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión); resolución de entrada por defecto 560 × 560 píxeles |
| Tipos de cuantización | No disponibles; el checkpoint se distribuye en PyTorch (`xdg.pth`) |
| Idiomas soportados | No disponible (procesa imágenes; no hay soporte lingüístico declarado) |
| Licencia | Apache 2.0 (código y checkpoint XDG); Depth Anything 3 mantiene su propia licencia incluida en `LICENSE-Depth-Anything-3` |
| Formato de pesos | PyTorch *state dict* (`xdg.pth`) + configuración YAML (`xdg.yaml`) |
| Tarea | Clasificación de pares de imágenes (válido / doppelganger) |
| Modelo base | depth-anything/DA3-BASE (relación: *finetune*) |
| Tamaño del repositorio | 0,5 GB |
| Librería | PyTorch |
| Dispositivo | CUDA por defecto; se puede forzar CPU con `--device cpu` |
| Fecha de publicación | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone Depth Anything 3 base, sobre el que se aplica un adaptador LoRA de rango 8. El modelo extrae características de *camera token* en cuatro etapas del backbone y las agrega para ambos órdenes del par de imágenes, alimentando después un clasificador binario. La configuración de inferencia redimensiona las imágenes RGB a 560 × 560 píxeles. La implementación de la arquitectura vive en el repositorio de código enlazado, que incluye una dependencia de DA3 embebida (*vendored*); el checkpoint `xdg.pth` es un diccionario de estado completo de PyTorch con backbone, pesos LoRA y clasificador.

En cuanto a datos de entrenamiento, la configuración liberada referencia pares de entrenamiento de Doppelgangers, pares derivados de MegaDepth y pares de entrenamiento de VisymScenes, siguiendo la configuración de datasets empleada por Doppelgangers++. Los hiperparámetros y el *layout* de datos se encuentran en el fichero `configs/training_configs/training.yaml` del repositorio. La información proporcionada no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). La innovación técnica destacada es la eficiencia: el proyecto reporta un rendimiento de desambiguación comparable a DG++ con una inferencia 3,5 veces más rápida en sus benchmarks de pares y de SfM.

## Capacidades

- Clasificación binaria de pares de imágenes: asigna una puntuación en la columna 1 para un par válido (no doppelganger) y otra en la columna 2.
- Agregación de ambos órdenes del par: las características de las dos imágenes se combinan en las dos direcciones, lo que aporta invariancia al orden de entrada.
- Extracción de características de *camera token* en cuatro etapas del backbone DA3.
- Filtrado de bases de datos COLMAP: el script `remove_doppelgangers.py` puede leer `two_view_geometries` de una base de datos COLMAP, crear una copia filtrada y preservar la base de datos original.
- Procesamiento por lotes: la inferencia acepta `--batch_size` (se recomienda empezar con 1 y aumentarlo según la memoria disponible).
- Ejecución en CPU o GPU: CUDA por defecto, con opción `--device cpu`.
- Salida en formato NumPy: `pair_probability_list.npy` con un diccionario cuyo array `prob` tiene forma `(número_de_pares, 2)` en el orden de los pares de entrada.
- Umbral configurable de filtrado (por defecto 0.8) para decidir qué pares se descartan.

Limitaciones funcionales explícitas: el checkpoint no incluye *feature matching*, verificación geométrica ni reconstrucción COLMAP. No es un modelo generativo de texto, no soporta *tool calling* ni *function calling*, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades multilingües, de visión conversacional, audio o *thinking mode*.

## Casos de uso

- Filtrado previo a Structure from Motion en fotogrametría: se puntúan los pares candidatos de un dataset y se eliminan aquellos con puntuación inferior al umbral (0,8 por defecto) antes de ejecutar la reconstrucción, reduciendo conexiones espurias que deforman la nube de puntos.
- Integración en un pipeline COLMAP existente: sustituyendo `--pairs_txt` por `--database_path`, el script filtra la tabla `two_view_geometries` de una base de datos ya verificada geométricamente y genera una copia filtrada sin modificar el original.
- Documentación 3D de patrimonio arquitectónico: fachadas con ventanas, columnas o balcones repetidos generan pares visualmente casi idénticos pero geométricamente incompatibles; el modelo los descarta antes de que contaminen la reconstrucción.
- Mapeo aéreo con dron sobre superficies repetitivas: en cultivos, tejados industriales o aparcamientos, la textura repetida produce coincidencias ambiguas; el filtrado por pares mejora la robustez del mosaico y del modelo digital de elevación.
- Limpieza de datasets para investigación en visión por computador: antes de entrenar modelos de reconstrucción o de correspondencia, se puede pasar el conjunto de pares por XDG y conservar únicamente los que superan el umbral, reduciendo ruido etiquetado.
- Reconstrucción a partir de colecciones de fotos de Internet: en conjuntos con muchas imágenes del mismo monumento tomadas por distintos usuarios, el modelo ayuda a distinguir pares realmente consistentes de coincidencias fortuitas entre elementos repetidos.
- Preprocesado en robótica y SLAM visual: cuando el sistema dispone de una fase de emparejamiento por pares, XDG puede actuar como filtro para descartar asociaciones visualmente plausibles pero geométricamente inviables.
- Evaluación comparativa de métodos de desambiguación: el repositorio incluye `test.py` para evaluar el checkpoint sobre los conjuntos de prueba Doppelgangers y VisymScenes, útil como referencia en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el proyecto reporta un rendimiento de desambiguación comparable a DG++ con una inferencia 3,5 veces más rápida, evaluado en los benchmarks de pares y de SfM del propio paper, y que los detalles de condiciones y resultados completos están en la publicación (arXiv 2608.29733). El repositorio permite reproducir la evaluación con `test.py` sobre los conjuntos de prueba Doppelgangers y VisymScenes.

| Benchmark | XDG | Referencia declarada (DG++) | Notas |
|---|---|---|---|
| Desambiguación de pares (Doppelgangers) | No disponible | No disponible | Rendimiento declarado "comparable" |
| Desambiguación de pares (VisymScenes) | No disponible | No disponible | Rendimiento declarado "comparable" |
| Velocidad de inferencia | 3,5× más rápida | 1× (referencia) | Cifras absolutas no disponibles |
| SfM (reconstrucción) | No disponible | No disponible | Sin métricas publicadas en la información disponible |

## Requisitos de hardware

- Parámetros del modelo: 121,4 millones. El repositorio ocupa 0,5 GB, consistente con un checkpoint en FP32 de aproximadamente 485 MB más la configuración y ficheros de licencia.
- VRAM estimada para inferencia: del orden de 1,5-3 GB con `batch_size = 1` a 560 × 560 en FP32, incluyendo activaciones (estimación a partir del tamaño del modelo; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060 o superiores. Para lotes grandes o procesamiento masivo de pares, GPU de datacenter como A100 o H100 reducen el tiempo total por volumen, aunque no son necesarias por capacidad.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales; el autor recomienda empezar con `batch_size = 1` e incrementarlo según la memoria disponible.
- Ejecución en CPU: soportada explícitamente mediante `--device cpu`, adecuada para volúmenes pequeños aunque con mayor latencia.
- Opciones de despliegue: script propio `remove_doppelgangers.py` sobre PyTorch; se instala con `conda env create -f environment.yml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. No se menciona exportación a ONNX, TensorRT u otros formatos.
- Latencia y throughput: no se publican cifras absolutas. La única referencia es la comparación relativa de 3,5× más rápido que DG++, sin especificar hardware ni tamaño de lote en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XDG (xtcpete/xdg) | 121.403.650 | Imágenes a 560 × 560 | Comparable a DG++ con 3,5× más velocidad (declarado) | Apache 2.0 (DA3 con licencia propia) | HuggingFace + GitHub |
| Doppelgangers++ (DG++) | No disponible | No disponible | Referencia base del paper | No disponible | Repositorio público citado (`doppelgangers-plusplus`) |
| Otros métodos de desambiguación previa a SfM | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible permite comparar XDG con DG++ únicamente en términos cualitativos: rendimiento de desambiguación comparable y una mejora de velocidad de 3,5× reportada por los autores. No hay datos de parámetros, contexto ni licencia de DG++ en la información proporcionada, y no se han identificado otras alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Las puntuaciones son predicciones aprendidas, no una garantía de consistencia geométrica: el propio autor advierte de que los falsos positivos pueden eliminar emparejamientos útiles y los falsos negativos pueden dejar conexiones incorrectas.
- El umbral de decisión debe ajustarse por reconstrucción y por dataset; el valor por defecto (0,8) no garantiza resultados equivalentes a los publicados sobre imágenes distintas.
- Los resultados publicados no aseguran el mismo rendimiento en otros tipos de imágenes o dominios visuales diferentes a los de entrenamiento.
- El checkpoint no realiza *feature matching*, verificación geométrica ni reconstrucción COLMAP; requiere un pipeline externo para esas fases.
- Para filtrar una base de datos COLMAP, esta debe contener pares verificados geométricamente en `two_view_geometries`; sin esa tabla el filtrado no es aplicable.
- El script reutiliza ficheros de probabilidad existentes, por lo que hay que usar un directorio de salida nuevo en cada ejecución para evitar resultados obsoletos.
- La ejecución por defecto asume CUDA; en entornos sin GPU hay que indicar `--device cpu` explícitamente.
- Licencia: el código y el checkpoint XDG son Apache 2.0, pero Depth Anything 3 conserva su licencia propia incluida en el repositorio, y los datasets de entrenamiento y evaluación (Doppelgangers, MegaDepth, VisymScenes) siguen sujetos a las licencias y términos de sus proveedores. Es necesario revisar esas condiciones antes de un uso comercial.
- No se declaran idiomas soportados ni sesgos conocidos en la información proporcionada.
- Repositorio sin descargas ni *likes* registrados y publicado recientemente: no hay validación externa independiente disponible.
- Los resultados de la búsqueda web realizada no contienen ninguna fuente relevante sobre el modelo; no se ha encontrado documentación adicional más allá de la model card y los enlaces del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtcpete/xdg
- Paper (arXiv 2608.29733): https://arxiv.org/abs/2608.29733
- Código fuente: https://github.com/xtcpete/xdg
- Página del proyecto: https://xtcpete.github.io/xdg/
- Configuración de entrenamiento: https://github.com/xtcpete/xdg/blob/main/configs/training_configs/training.yaml
- Repositorio de referencia Doppelgangers++: https://github.com/doppelgangers25/doppelgangers-plusplus
