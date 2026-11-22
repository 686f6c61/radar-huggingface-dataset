# username131072/H9dP-V1

## Resumen

H9dP V1 es un modelo de regresión para estimar el déficit de presión (dP, en hPa) de ciclones tropicales a partir de imágenes del satélite geoestacionario Himawari. Lo desarrolla el usuario `username131072` y se publica bajo licencia CC0-1.0. El modelo no es una red neuronal: cada uno de los cinco ficheros de pesos (`fold0.v1m` a `fold4.v1m`) contiene una expansión de kernel Matérn-3/2 sobre los registros de entrenamiento de un *fold*, junto con splines gaussianos, un término lineal y dos kernels de secuencia sobre conjuntos de fotogramas. Cada fichero pesa 32 MB y el repositorio completo ocupa 0,2 GB.

El modelo resuelve un problema concreto de meteorología satelital: inferir la diferencia entre la presión ambiental (POCI) y la presión en el centro de la tormenta a partir de la estructura nubosa observada en el canal de vapor de agua. La entrada son entre uno y seis fotogramas de Himawari AHI, cada uno con cuatro bandas (B08 a 6,2 µm, B09 a 6,9 µm, B10 a 7,3 µm y B16 a 13,3 µm), más las coordenadas del centro de la tormenta en grados. La salida es un escalar en hPa por registro.

La relevancia actual reside en su enfoque de despliegue: los pesos se ejecutan en C++20 sin Python, sin GPU y sin *runtime* de aprendizaje profundo, con un coste medido de aproximadamente 125 ms por registro en un Intel Core Ultra 7 265KF. Está pensado para entornos operativos donde no se dispone de infraestructura de inferencia neuronal, y su sistema de cinco *folds* permite obtener una proxy de incertidumbre a partir de la dispersión entre predicciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Expansión de kernel Matérn-3/2 por grupo de descriptores y estadístico temporal, splines gaussianos, término lineal y dos kernels de secuencia sobre conjuntos de fotogramas (no es una red neuronal) |
| Parámetros totales | no disponible (no aplica: son posteriores exportados, no pesos de red) |
| Parámetros activos | no aplica |
| Longitud de contexto | 1 a 6 fotogramas de entrada, cada uno con 4 bandas espectrales |
| Tipos de cuantización | no disponible (ficheros binarios propietarios `.v1m`, little-endian IEEE-754) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC0-1.0 |
| Formato de pesos | `.v1m` (binario propietario, little-endian IEEE-754); entrada en HSD/DAT (BZip2 opcional) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni MoE ni SSM. Cada fichero `.v1m` almacena una expansión dual de kernel Matérn-3/2 por cada grupo de descriptores y estadístico temporal, combinada con splines gaussianos, un término lineal y dos kernels de secuencia que operan sobre conjuntos de fotogramas. El coste por registro escala con el tamaño del conjunto de entrenamiento, ya que la inferencia evalúa el kernel contra los registros de entrenamiento del *fold*. El entrenamiento se realizó sobre 546 registros reales de Himawari, con 6 fotogramas y 4 bandas cada uno, y semilla de proyecto fija (seed 1). Los datos de entrada se describen mediante 2060 números por fotograma: ojo (320), anillo del ojo (400), diferencia interno-externo (320), armónicos azimutales (288), movimiento angular (60) y temperatura por sector (672). El muestreo es polar sobre 18 radios (1–228 px) y 96 azimuts en una ventana de 500 × 500 píxeles nativos alrededor del centro.

La innovación técnica principal es el propio formato de exportación: los ficheros son posteriores exportados, no *checkpoints* de entrenamiento, y el autor advierte explícitamente que no deben reajustarse. La implementación en C++20 permite llamadas concurrentes sobre un modelo cargado (`predict` es `const`), rechaza hosts que no sean little-endian IEEE-754 en tiempo de compilación y lanza `std::exception` ante errores de entrada. La concordancia con la referencia en Python es de 6,2 × 10⁻⁶ hPa de diferencia absoluta máxima sobre 546 registros en caché y 329 decodificados de extremo a extremo desde DAT.

## Capacidades

- Estimación de déficit de presión (dP) en hPa a partir de 1 a 6 fotogramas de Himawari AHI con cuatro bandas de vapor de agua y nivel superior.
- Extracción automática de descriptores de estructura de tormenta: claridad del ojo, anillo del ojo, estructura de nube fría, asimetría azimutal y tasa de rotación.
- Inferencia sin GPU, sin Python y sin *runtime* de aprendizaje profundo, directamente en C++20.
- Llamadas concurrentes seguras sobre un modelo cargado.
- Cuantificación de incertidumbre mediante la dispersión entre los cinco *folds*.
- Funcionamiento con menos de seis fotogramas, siempre que cada fotograma lleve una marca temporal distinta.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un regresor numérico especializado.

## Casos de uso

- Estimación operativa de la presión central de ciclones tropicales: el modelo recibe las bandas B08, B09, B10 y B16 de Himawari y devuelve el dP en hPa, que combinado con POCI permite derivar la presión central como `round(POCI − dP, 1)`. Es adecuado para pipelines de monitorización continua sin infraestructura de GPU.
- Análisis retrospectivo de tormentas históricas: con archivos HSD/DAT de Himawari se pueden recalcular déficits de presión sobre series temporales de ciclones, aprovechando el soporte de 1 a 6 fotogramas por registro y la decodificación directa desde DAT.
- Integración en sistemas de alerta temprana en C++: al ejecutarse como biblioteca nativa (`inference_best.hpp`) sin dependencias de Python, se puede enlazar en servicios de alerta meteorológica de baja latencia con un coste de ~125 ms por registro.
- Validación cruzada de productos de análisis: la dispersión entre los cinco *folds* (RMSE entre 7,61 y 9,98 hPa) sirve como proxy de incertidumbre para contrastar análisis de agencias meteorológicas.
- Investigación en estructura de ciclones: los 2060 descriptores por fotograma permiten estudiar la relación entre claridad del ojo, anillo del ojo y asimetría azimutal con el dP, con etiquetas MOTIS disponibles para comparación.
- Despliegue en entornos con restricciones de hardware: al no requerir GPU ni runtime de deep learning, es viable en servidores modestos o sistemas embebidos con compilador C++20, CMake ≥ 3.16 y zlib.

## Benchmarks y rendimiento

Validación cruzada de cinco *folds* a nivel de registro, semilla 1, 546 registros reales de Himawari, cada registro predicho exactamente una vez, objetivo MOTIS dP, predicciones fuera de *fold* agrupadas antes de calcular RMSE. Unidades en hPa.

| Grupo | Registros | RMSE | MAE | Sesgo |
|---|---:|---:|---:|---:|
| Todos | 546 | 8,901 | 6,830 | −0,015 |
| Good | 211 | 6,932 | 5,509 | −0,458 |
| Fair | 223 | 9,650 | 7,431 | +1,011 |
| Poor | 112 | 10,503 | 8,125 | −1,223 |

Los grupos Good/Fair/Poor son etiquetas MOTIS de claridad del ojo (tamaño mediano del ojo de 88, 16 y 4 píxeles respectivamente), no bandas de dP. Error absoluto: mediana 5,5, p90 14,3, máximo 38,8. Sesgo ajustado por banda de dP: +15,3 hPa para dP < 30 (5 registros), +11,0 para 30–40 (14), +0,1 para 60–80 (191) y −3,5 para dP ≥ 80 (202).

Rendimiento en máquina de referencia (Intel Core Ultra 7 265KF): carga del modelo ≈ 83 ms en caliente, 39 ms por registro para la regresión de cinco *folds*, ≈ 86 ms para decodificar y describir 24 archivos R304, ≈ 125 ms por registro en total.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU.
- GPU recomendadas: ninguna; la inferencia es puramente CPU.
- Cabe en cualquier CPU con compilador C++20, CMake ≥ 3.16 y zlib (BZip2 opcional para entrada `.DAT.bz2`).
- Probado con gcc 14.2.0 y CMake 3.31.6.
- Requisito de plataforma: host little-endian IEEE-754, verificado en tiempo de compilación.
- Despliegue: biblioteca C++ nativa (`inference_best.hpp`) o CLI (`inference_best_cli`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: ≈ 125 ms por registro total en Intel Core Ultra 7 265KF; ≈ 39 ms para la regresión pura de cinco *folds*.
- Memoria: cinco ficheros de 32 MB cada uno (≈ 160 MB de pesos cargados).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (regresión de déficit de presión a partir de imágenes de Himawari con expansión de kernel en C++).

## Limitaciones y advertencias

- El objetivo es un producto de análisis: el dP proviene de MOTIS y la presión central se deriva como `round(POCI − dP, 1)`. El RMSE de 8,901 hPa incluye incertidumbre de etiqueta y no es evidencia de que la presión central se reproduzca a ese nivel.
- Evaluación de desarrollo, no con observaciones independientes: 546 registros de un número limitado de tormentas y una sola serie geoestacionaria. La generalización real no está probada.
- Errores comprimidos hacia la media: los sistemas débiles se sobreestiman (sesgo +15,3 hPa para dP < 30) y los muy fuertes se subestiman (sesgo −3,5 hPa para dP ≥ 80).
- Los modelos de cada *fold* no son intercambiables: el RMSE por *fold* varía entre 7,61 y 9,98 hPa, y su promedio no mejora el resultado principal para todos los registros.
- Margen de mejora en el ranking muy pequeño: seis variantes publicadas quedan dentro de 0,37 hPa y no se separan mediante bootstrap emparejado sobre los 546 registros.
- No reajustar los ficheros: son posteriores exportados, no *checkpoints* de entrenamiento.
- El modelo nunca observa la presión superficial; infiere a partir de la organización de la tormenta (claridad del ojo, anillo del ojo, estructura de nube fría, asimetría azimutal y tasa de rotación).
- El centro de la tormenta es un argumento obligatorio porque la cabecera DAT no lo incluye; restricciones `|latitud| ≤ 90` y `|longitud| ≤ 360`.
- Con menos de seis fotogramas, cada fotograma debe llevar una marca temporal distinta.
- Licencia CC0-1.0: sin restricciones conocidas para uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/username131072/H9dP-V1
- Repositorio GitHub (código, evaluación y análisis): https://github.com/WFZ7789/H9dP
- Informe del modelo: `docs/V1/README.md` (en el repositorio GitHub)
- Análisis de la release (ranking, calibración, límites): `docs/V1/RELEASE_ANALYSIS.md` (en el repositorio GitHub)
- Interfaz C++ y criterios de aceptación: `docs/V1/CPP_INFERENCE.md` (en el repositorio GitHub)
