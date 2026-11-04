# xiao-1011/dmc-brainmap-registration-predictor

## Resumen

DMC-BrainMap Registration Predictor es un modelo convolucional desarrollado por Xiao Cao que estima una transformación proyectiva inicial entre una sección histológica de cerebro de ratón y su correspondiente lámina de referencia del atlas Allen Mouse Brain Atlas. El modelo no realiza un registro final, sino que propone una alineación preliminar que el usuario revisa y corrige dentro del flujo de trabajo de la herramienta de escritorio DMC-BrainMap, un plugin de napari orientado a neurociencia.

La versión recomendada, v2.0.0, emplea una arquitectura de pirámide de características residuales con fusión de pares de imágenes y 13.976.840 parámetros, lo que supone un salto sustancial frente a la v1.0.0 basada en `PairSpatialHomographyNet` con 2.336.200 parámetros. El modelo trabaja sobre entradas de 1140 x 800 píxeles y devuelve cuatro desplazamientos de esquina en píxeles que DMC-BrainMap convierte en una homografía 3x3 y en cinco pares de puntos de registro editables.

Su relevancia es acotada pero específica: automatiza el paso más tedioso del registro de secciones histológicas con el atlas, reduciendo el error medio de punto de 20,3 a 15,9 píxeles en las secciones de test retenidas según los datos del autor. Se distribuye con licencia BSD-3-Clause y en formato de checkpoint PyTorch de solo inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pirámide de características residuales con fusión de pares (v2.0.0); `PairSpatialHomographyNet` (v1.0.0) |
| Parametros totales | 13.976.840 (v2.0.0); 2.336.200 (v1.0.0) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada fija de 1140 x 800 píxeles) |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints `float32` de PyTorch) |
| Idiomas soportados | No aplica (modelo de visión; sin capacidades de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | Checkpoint PyTorch `.pt` con `model_config` y `model_state_dict`, cargable con `weights_only=True` |
| Tipo de modelo | Regresor de registro proyectivo 2D por pares |
| Tamaño de archivo | 56 MB (v2.0.0); 9 MB (v1.0.0) |
| Tamaño del repositorio | 0,1 GB |
| Framework | PyTorch |
| Atlas soportado | Allen Mouse Brain Atlas 10 µm, versión BrainGlobe 1.2 |
| Tamaño de entrada validado | 1140 x 800 píxeles (ancho x alto) |
| Tiempo de inferencia en CPU | Aproximadamente 0,6-1 s (v2.0.0); aproximadamente 0,03 s (v1.0.0) por sección, en Intel Core i9-11900KF con 2-8 hilos, excluyendo la carga del modelo |
| Autor | Xiao Cao |

## Arquitectura y entrenamiento

La v2.0.0 utiliza dos stems de entrada independientes, cada uno con una convolución 7x7 de stride 2 (64 canales), normalización de grupo, ReLU y max pooling 3x3 de stride 2. A continuación, ambas imágenes comparten un cuerpo residual estilo ResNet-18 con normalización de grupo (64, 128, 256 y 512 canales), y una red piramidal de características genera descriptores de 128 canales a 1/8, 1/16 y 1/32 de la resolución de entrada. En cada nivel de la pirámide se aplica una fusión por pares que combina los descriptores de la muestra y la referencia, su diferencia y su producto, coordenadas de píxel normalizadas y las máscaras de padding de ambas imágenes; dos bloques convolucionales reducen la representación a 64 canales. El nivel 1/32 reserva ocho canales adicionales para características de correspondencia, que están a cero en esta versión. Cada nivel se somete a adaptive pooling a 5x8, los tres mapas se concatenan y pasan por una cabeza de regresión con la secuencia `7680 -> 256 -> 256 -> 8`, cuyos ocho valores se reorganizan en cuatro desplazamientos `(x, y)` de esquina.

La v1.0.0 emplea la arquitectura `PairSpatialHomographyNet`, considerablemente más ligera (2,3 millones de parámetros). Ambas versiones se entrenaron en el repositorio `xiao-1011/sharpy-model`: la v2.0.0 corresponde al commit `23e370b` y a la ejecución `v3-pyramid-A-seed43`, mientras que la v1.0.0 se vincula al commit `0a80f4f` y a la ejecución `baseline-005-spatial-augmented-200ep`. No se detalla en la información disponible el volumen de tokens ni la composición exacta del conjunto de entrenamiento, ni si se emplearon técnicas de refuerzo o preferencias; se trata de un modelo supervisado de regresión de transformaciones. La v2.0.0 incorpora un enmascaramiento del rectángulo delimitador de píxeles no nulos para tratar la región de tejido o atlas y descartar el padding, conservando los píxeles oscuros dentro de dicho rectángulo.

## Capacidades

- Estimación de homografía proyectiva 2D por pares entre una sección histológica y una lámina de referencia del atlas Allen Mouse Brain Atlas.
- Regresión de cuatro desplazamientos de esquina en píxeles (arriba izquierda, arriba derecha, abajo derecha, abajo izquierda), acotados a ±512 píxeles mediante `tanh`.
- Entrada monocanal en escala de grises, normalizada a `[0, 1]`, con conversión automática desde RGB por parte de DMC-BrainMap.
- Fusión explícita de información de ambos miembros del par (diferencia y producto de descriptores) para explotar la correspondencia entre muestra y referencia.
- Enmascaramiento de padding basado en el rectángulo de píxeles no nulos (solo v2.0.0).
- Integración con el flujo de predicción asistida de DMC-BrainMap: selección de lámina, predicción, previsualización y revisión o corrección manual.
- Carga segura de pesos con `torch.load(..., weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Registro asistido de secciones histológicas en neurociencia: el modelo propone una homografía inicial entre la sección teñida y la lámina del atlas, que el investigador revisa y ajusta en DMC-BrainMap; reduce el tiempo de colocación manual de puntos de registro en series de cortes coronales o sagitales.
- Análisis cuantitativo de expresión génica o marcadores fluorescentes: al obtener una alineación inicial con el atlas, se pueden superponer regiones anatómicas y agregar medidas por área cerebral, siempre con control de calidad visual posterior.
- Construcción de atlas de células o mapas de conectividad: la predicción inicial acelera el procesamiento por lotes de muchas secciones de un mismo animal, donde la variabilidad entre cortes es moderada y la inicialización es aprovechable.
- Análisis de imágenes de canal verde de epifluorescencia: el modelo está entrenado específicamente sobre ese canal, por lo que encaja en pipelines de microscopía de fluorescencia que capturan secciones completas a 1140 x 800 píxeles.
- Flujos de trabajo reproducibles en napari: al integrarse en un plugin de napari, permite a investigadores sin experiencia en registro de imágenes obtener una propuesta editable y documentar los pares de puntos aceptados.
- Validación y comparación de métodos de registro: sirve como línea base de inicialización para comparar con técnicas clásicas de registro rígido o deformable, dado que su salida es una homografía explícita y acotada.
- Despliegue en estaciones de trabajo sin GPU: con 0,6-1 s por sección en CPU y 56 MB de pesos, es viable en portátiles y equipos de laboratorio sin acelerador dedicado.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas internas de evaluación del autor sobre secciones de test retenidas, no benchmarks estándar de la comunidad:

| Metrica | v1.0.0 | v2.0.0 |
|---|---|---|
| Error medio de punto (píxeles), secciones de test retenidas | 20,3 | 15,9 |
| Mejora por animal de test | Referencia | Mejora en todos los animales de test |
| Parametros | 2.336.200 | 13.976.840 |
| Tiempo de inferencia en CPU por sección | Aproximadamente 0,03 s | Aproximadamente 0,6-1 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,98 millones de parámetros en `float32` (unos 56 MB de pesos) y entradas de 1140 x 800 píxeles, el consumo es moderado y cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican en la documentación; cualquier GPU compatible con PyTorch (por ejemplo, RTX 3060, RTX 4090, A100, H100) puede ejecutar el modelo. La inferencia está validada y medida en CPU.
- Compatibilidad con GPU consumer: sí, con margen amplio; el modelo es pequeño y la entrada es de resolución moderada.
- Opciones de despliegue: PyTorch nativo mediante `torch.load(..., weights_only=True)` e integración en DMC-BrainMap (plugin de napari). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 0,6-1 s por sección de 1140 x 800 en CPU (Intel Core i9-11900KF, 2-8 hilos) para la v2.0.0, y aproximadamente 0,03 s para la v1.0.0, excluyendo la carga del modelo. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Error medio de punto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DMC-BrainMap Registration Predictor v2.0.0 | 13.976.840 | 1140 x 800 px | No aplica | 15,9 px (test retenido del autor) | BSD-3-Clause | HuggingFace, integrado en DMC-BrainMap > 0.2.0b2 |
| DMC-BrainMap Registration Predictor v1.0.0 | 2.336.200 | 1140 x 800 px | No aplica | 20,3 px (test retenido del autor) | BSD-3-Clause | HuggingFace, integrado en DMC-BrainMap 0.1.8 y posteriores |
| Métodos clásicos de registro (por ejemplo, optimización de homografía por intensidad) | No disponible | No disponible | No aplica | No disponible | Variable según implementación | Disponible en bibliotecas de imagen médica |

No se dispone de datos publicados de otros modelos de aprendizaje profundo comparables para registro de secciones histológicas con el atlas Allen en la información proporcionada; la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- La predicción es una inicialización, no un registro final; no sustituye al control de calidad visual ni al análisis cuantitativo no supervisado.
- No está destinada a diagnóstico clínico, decisiones de tratamiento ni análisis cuantitativos sin supervisión.
- Entrenada y evaluada únicamente con entradas de 1140 x 800 píxeles; aunque la red usa adaptive pooling, no se ha validado con otras resoluciones.
- Entrenada específicamente para el atlas Allen Mouse Brain Atlas 10 µm (BrainGlobe 1.2) y para el canal verde de epifluorescencia; su uso con otros atlas, especies o modalidades de imagen no está validado.
- Los desplazamientos de esquina están acotados a ±512 píxeles mediante `tanh`, lo que limita la magnitud de la corrección que el modelo puede proponer.
- Incompatibilidad de versiones: DMC-BrainMap 0.2.0b2 y anteriores solo cargan la v1.0.0 y rechazan los archivos de la v2.0.0 como modelo no soportado.
- No se documentan sesgos demográficos ni sociales por tratarse de un modelo de imagen histológica; el riesgo principal es el sesgo de dominio hacia protocolos de tinción, iluminación y preparación concretos.
- Riesgo de alucinación en sentido figurado: puede proponer alineaciones plausibles pero incorrectas en secciones dañadas, plegadas o con poco tejido, por lo que la revisión humana es obligatoria.
- No se especifican restricciones adicionales de uso comercial más allá de la licencia BSD-3-Clause, que permite uso comercial con atribución y sin garantías.
- Los tiempos de inferencia publicados corresponden a un procesador concreto y pueden ser mayores en equipos más lentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiao-1011/dmc-brainmap-registration-predictor
- Repositorio de código y entrenamiento: https://github.com/xiao-1011/sharpy-model
- Commit de la v1.0.0: https://github.com/xiao-1011/sharpy-model/commit/0a80f4f831f6450a015a2f32433f22975ac97dc0
- Herramienta DMC-BrainMap (plugin de napari): https://github.com/hejDMC/napari-dmc-brainmap
