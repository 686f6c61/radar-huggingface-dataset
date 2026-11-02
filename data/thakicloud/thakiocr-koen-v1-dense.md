# ThakiCloud/ThakiOCR-KOEN-V1-Dense

## Resumen

ThakiOCR-KOEN-V1-Dense es un reconocedor de lineas de texto (line-level OCR) para coreano e ingles desarrollado por ThakiCloud. Con solo 2,13 millones de parametros, es un modelo deliberadamente pequeno que se situa como componente especializado dentro de un pipeline de documentos mas amplio: recibe un recorte de una sola linea de texto en escala de grises y devuelve su transcripcion. No detecta texto en una pagina; debe combinarse con un detector de lineas o un modelo de layout.

La arquitectura es una red convolucional ligera con un encoder de tres etapas de stride, pooling sobre la altura y dos bloques de convolucion 1-D depthwise con feed-forward con compuerta, seguida de una cabeza lineal densa sobre un vocabulario de 14.152 caracteres (silabas Hangul completas, ASCII imprimible, Jamo y simbolos). El entrenamiento se hizo desde cero con CTC sobre recortes sinteticos de NVIDIA OCR-Synthetic-Multilingual-v1, sin datos reales.

Es relevante ahora como referencia de modelo OCR minimo, reproducible y con licencia Apache-2.0, util para prototipado rapido y para estudiar el desajuste entre datos sinteticos y documentos escaneados reales. El propio autor lo presenta como una release de investigacion, no como un modelo de precision estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con encoder convolucional (3 etapas de stride) + pooling en altura + 2 bloques de conv 1-D depthwise (kernel 5) con FFN con compuerta y LayerNorm; cabeza lineal densa |
| Parametros totales | 2.130.249 (cabeza 1.825.737, encoder 304.512) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de una linea de imagen, ancho maximo 2048 px tras redimensionar a altura 48 |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (fp32, solo `state_dict`) |
| Vocabulario | 14.152 caracteres + blank (14.153 clases CTC) |
| Tokenizacion | a nivel de silaba Hangul (una silaba = una clase) |
| Stride de salida | 4 px de ancho redimensionado por frame CTC |
| Decodificacion | CTC greedy (argmax, fusion de repeticiones, eliminacion de blanks), sin modelo de lenguaje |
| Preprocesado | EXIF transpose, grises, resize bilineal a altura 48 manteniendo aspecto, pixeles a [-1, 1], padding blanco a multiplo de 16 |

## Arquitectura y entrenamiento

El modelo es una red puramente convolucional, sin atencion ni componentes recurrentes. El encoder arranca con un stem convolucional de tres etapas de stride (2, 2 y 2 solo en altura), aplica mean pooling sobre la altura, proyecta linealmente a 128 dimensiones y pasa por dos bloques de convolucion 1-D depthwise con kernel 5, feed-forward con compuerta y LayerNorm. La cabeza es una capa lineal densa a 14.153 clases, una por caracter del vocabulario mas el blank de CTC. La salida tiene un stride de 4 px de ancho redimensionado por frame CTC, y la decodificacion es CTC greedy pura, sin modelo de lenguaje ni correccion posterior.

El entrenamiento uso exclusivamente recortes de linea de los ficheros `ko/train/train_000.h5` y `en/train/train_000.h5` del dataset sintetico NVIDIA OCR-Synthetic-Multilingual-v1 (CC BY 4.0), con 879.645 lineas en el manifiesto (435.510 coreanas, 444.135 inglesas). La receta fue de 20.000 pasos de optimizador, batch 64, AdamW con lr 3e-4 y weight decay 0.02, 1.000 pasos de warmup seguidos de decaimiento coseno, clipping de gradiente 5, autocast bf16 con perdida CTC en fp32, semilla 42 y sin aumento de datos. Se uso una unica GPU B200 durante 1.407 segundos. Se conservo el checkpoint final fijo (`last.pt`), sin early stopping ni seleccion sobre conjuntos de evaluacion, y no se emplearon datos de AI Hub ni para entrenamiento ni para construir el vocabulario. El vocabulario se construyo solo a partir de las etiquetas de entrenamiento: ASCII imprimible, las 11.172 silabas Hangul modernas, bloques de Jamo y una lista corta de simbolos.

## Capacidades

- Reconocimiento de texto linea a linea en coreano e ingles, con tokenizacion a nivel de silaba Hangul.
- Transcripcion directa de recortes de linea en escala de grises con decodificacion CTC greedy.
- Manejo de vocabulario amplio: ASCII imprimible, 11.172 silabas Hangul modernas, Jamo y simbolos.
- Inferencia por lotes con padding blanco a multiplo de 16 y procesamiento en CPU o GPU.
- Rechazo explicito de lineas que superan los 2048 px de ancho tras redimensionar, en lugar de comprimirlas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es exclusivamente un reconocedor de lineas.
- No realiza deteccion de texto ni analisis de layout; requiere un detector de lineas externo.

## Casos de uso

- Digitalizacion de documentos coreanos escaneados: integrado tras un detector de lineas, el modelo transcribe cada recorte y permite reconstruir el texto de facturas, formularios o contratos; su tamano minimo facilita desplegarlo en servidores modestos.
- Prototipado rapido de pipelines OCR: al ser autocontenido (`inference.py` incluye red, preprocesado y decodificador), sirve para validar una arquitectura de documento completa antes de invertir en un modelo mayor.
- Procesamiento por lotes de alto volumen en CPU: con 5,61 ms de mediana por linea en 4 hilos de CPU de centro de datos, es viable para colas masivas donde el coste de GPU no se justifica.
- Extraccion de texto de capturas y renders sinteticos: al haberse entrenado con renderizaciones sinteticas, funciona bien en imagenes generadas por software, capturas de pantalla o documentos nativos renderizados.
- Investigacion sobre OCR de bajo coste: su huella de 2,13 M de parametros y su receta reproducible (semilla fija, un solo run) lo hacen util como linea base en experimentos academicos.
- Filtrado y clasificacion previa de lineas: como primer paso barato para decidir que lineas requieren un modelo OCR mayor, reduciendo el coste computacional global del pipeline.
- Normalizacion de texto coreano en herramientas internas: la tokenizacion por silaba Hangul facilita tareas de indexacion y busqueda sobre texto coreano transcrito.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy, batch 128, metricas de cadena exacta tras NFC de Unicode (sin normalizar mayusculas ni puntuacion), 5.000 lineas por conjunto y un unico run.

| Conjunto | Que es | CER | WER | Linea exacta |
|---|---|---|---|---|
| Sintetico KO held-out | Lineas coreanas sinteticas de NVIDIA, grupos de documento no vistos en entrenamiento | 16,70% | 38,65% | 39,90% |
| Sintetico EN held-out | Lineas inglesas sinteticas de NVIDIA, grupos de documento no vistos en entrenamiento | 11,08% | 28,18% | 51,96% |
| Desarrollo KO real | Recortes de palabra de un subconjunto de validacion de AI Hub (dataset 71299), solo evaluacion | 37,14% | 128,67% | 40,18% |

En el conjunto de desarrollo real el CER baja al 17,81% si se ignoran los espacios; la mayor parte del error es insercion espuria de espacios. Los conjuntos sinteticos held-out comparten generador y fichero fuente con el entrenamiento, por lo que sobreestiman la precision en documentos reales, y el conjunto real es una medicion de desarrollo, no un test independiente.

Latencia (batch 1, entrada de 512 px de ancho, fp32): 1,29 ms de mediana en una GPU B200; 5,61 ms de mediana en 4 hilos de CPU de centro de datos. No se midieron portatiles ni CPUs moviles.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo completo ocupa unos 8,5 MB de pesos (2,13 M de parametros a 4 bytes), por lo que cualquier GPU con memoria disponible es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en B200, A100, H100 y en cualquier RTX consumer (incluso series antiguas). La latencia medida de referencia es de 1,29 ms por linea en B200.
- Cabe en cualquier GPU consumer y en CPU: 5,61 ms de mediana por linea en 4 hilos de CPU de centro de datos.
- Opciones de despliegue: el repositorio incluye `inference.py` autocontenido (torch, numpy, Pillow, safetensors) con CLI y API Python (`ThakiOCR(...).recognize([...])`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput estimado: no disponible mas alla de las latencias por linea publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ThakiOCR-KOEN-V1-Dense | 2,13 M | CNN + CTC, linea a linea | ko, en | Apache-2.0 | Entrenado solo con datos sinteticos; CER real KO 37,14% |
| Tesseract (LSTM) | no disponible | OCR clasico con LSTM | multilingue | Apache-2.0 | Maduro, con deteccion y layout integrados; no comparable en arquitectura |
| TrOCR (variantes base/large) | no disponible en la informacion | Transformer encoder-decoder | principalmente en | MIT (variantes publicadas) | Requiere mas recursos; no entrenado especificamente para coreano |
| PaddleOCR (modelos de reconocimiento) | no disponible en la informacion | CNN + CTC/attention | multilingue, incluye coreano | Apache-2.0 | Ecosistema completo con deteccion; alternativa practica para pipelines reales |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y cobertura de idiomas.

## Limitaciones y advertencias

- Insercion espuria de espacios en documentos reales: en el 38% de los recortes de palabra coreanos reales el modelo inserta espacios entre silabas (por ejemplo, `평면도` leido como `평 면 도`), porque las estadisticas de espaciado del entrenamiento sintetico difieren de las de los recortes escaneados.
- Brecha de dominio: entrenado solo con renderizaciones sinteticas; no vio texto escaneado, fotografiado, de bajo contraste, manuscrito ni estilizado.
- Solo acepta lineas: alimentarlo con una pagina completa o un bloque multilinea produce resultados sin sentido.
- Rechaza lineas de mas de 2048 px de ancho tras redimensionar a altura 48; hay que dividirlas previamente.
- Efectos de lote: la convolucion depthwise ve el padding blanco al final de las lineas, por lo que la salida de una linea puede variar ligeramente segun las demas lineas del lote.
- Un unico seed: no se midio la varianza entre ejecuciones.
- Los conjuntos sinteticos held-out comparten generador y fichero fuente con el entrenamiento, por lo que sus metricas sobreestiman la precision en documentos reales; el conjunto real de AI Hub es una medicion de desarrollo, no un test independiente.
- Sin modelo de lenguaje ni correccion posterior: los errores de decodificacion CTC no se corrigen contextualmente.
- Licencia Apache-2.0 para codigo y pesos, con atribucion CC BY 4.0 de los datos de entrenamiento recogida en `NOTICE`; no se incluyen los datos de entrenamiento en el repositorio.
- Release de investigacion: el autor no reclama precision estado del arte ni validez para produccion sin evaluacion propia en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-V1-Dense
- Model card en coreano: https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-V1-Dense/blob/main/MODEL_CARD.ko.md
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OCR-Synthetic-Multilingual-v1
- AI Hub (dataset 71299, usado solo para evaluacion): https://aihub.or.kr/
- Repositorio del modelo (ficheros `inference.py`, `config.json`, `vocab.json`): https://huggingface.co/ThakiCloud/ThakiOCR-KOEN-V1-Dense/tree/main
