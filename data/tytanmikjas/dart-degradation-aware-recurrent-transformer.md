# TytanMikJas/DART-Degradation-Aware-Recurrent-Transformer

## Resumen

DART (Degradation-Aware Recurrent Transformer) es un modelo de restauracion de video especializado en la recuperacion de material cinematografico de archivo. Ha sido desarrollado por Mikolaj Jastrzebski, Wojciech Kozlowski y Kamil Adamczewski de la Wroclaw University of Science and Technology, y se ha presentado en ACCV 2026. El modelo aborda un problema concreto y dificil: el material filmico de archivo acumula dano compuesto (rayones, polvo, desenfoque, ruido, parpadeo y envejecimiento fotometrico) y, a diferencia de la superresolucion clasica, no existe ninguna referencia limpia contra la que entrenar o evaluar de forma supervisada directa.

La clave de DART es que predice de forma explicita una mascara continua de defectos bajo supervision directa, la propaga en el tiempo y la usa con dos propositos: gobernar la fusion temporal entre frames y condicionar la columna de restauracion segun el grado de dano de cada fotograma. Con solo 6,58 millones de parametros (1,32 M entrenables mas un estimador de flujo optico RAFT congelado), consigue un rendimiento competitivo en los benchmarks no referenciados AbsoluteDegradation y SRWOV, midiendo calidad percibida con metricas como CLIPIQA+, MUSIQ y MANIQA.

Su relevancia actual radica en la combinacion de un tamano muy contenido (ejecutable en hardware modesto), una licencia MIT permisiva y la publicacion conjunta de un pipeline de sintesis de degradaciones (AbsoluteDegradation) y datasets en Kaggle, lo que convierte a DART en una base practica tanto para restauradores de archivo como para investigadores en restauracion de video sin referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente bidireccional con transformer Swin de restauracion, MaskNet en piramide de dilataciones y flujo optico RAFT congelado |
| Parametros totales | 6,58 M (incluye RAFT-Sintel congelado: 5,26 M) |
| Parametros activos | 1,32 M entrenables (no es MoE; el resto es RAFT congelado) |
| Longitud de contexto | No aplicable (ventanas de 7 frames con stride 3 en inferencia) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32) |
| Idiomas soportados | No aplicable (modelo de vision, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) y PyTorch state dict (.pth, fp32) |

## Arquitectura y entrenamiento

DART es una red recurrente bidireccional sobre secuencias de frames. En cada paso, el estado oculto previo, la mascara suave de defectos y el frame actual se alinean temporalmente mediante flujo optico calculado con un RAFT congelado (pesos oficiales de Sintel). Un Dilation Pyramid MaskNet con tasas de dilatacion 1, 2 y 3 predice la mascara suave de defectos M_t, que actua como puerta (gating) sobre la fusion del frame codificado con el estado alineado. Un codificador de condicionamiento AdaLN-Zero convierte la mascara y el residual temporal en un vector que modula cada bloque de un transformer de restauracion basado en Swin. Finalmente, una convolucion de fusion combina los estados de las direcciones hacia adelante y hacia atras.

El entrenamiento usa como fuente limpia el dataset REDS (`train_sharp`, 720p, 24 fps, licencia CC BY 4.0) y genera las degradaciones en linea mediante el pipeline AbsoluteDegradation, un simulador de dano filmico de inspiracion fisica presentado en la track de Evaluations and Datasets de NeurIPS 2026. Para cada recorte de 256x256 se obtiene el frame limpio (ground truth), su version degradada y una mascara continua de artefactos, que sirve como objetivo de la supervision de la mascara. La funcion de objetivo combina perdida L1 con perdida perceptual VGG19. El modelo procesa clips RGB normalizados a [-1, 1] (material monocromo replicado a tres canales), acepta cualquier resolucion con padding a multiplos de 16 y restaura en ventanas de 7 frames con stride 3.

## Capacidades

- Restauracion de video de archivo con dano compuesto: rayones, polvo, desenfoque, ruido, parpadeo y envejecimiento fotometrico.
- Prediccion de una mascara suave de defectos por frame (logits de ambas direcciones de propagacion), util para localizar visualmente el dano.
- Alineacion temporal mediante flujo optico RAFT congelado, con propagacion recurrente bidireccional del estado oculto.
- Condicionamiento por nivel de dano: la mascara modula cada bloque del transformer de restauracion via AdaLN-Zero.
- Resolucion arbitraria de entrada (con padding a multiplos de 16); soporte de material monocromo mediante replicacion a 3 canales.
- Salida dual: frames restaurados en [-1, 1] y mascaras de defecto en [0, 1].
- Inferencia en GPU y CPU (esta ultima de forma lenta); script de inferencia para archivos de video o carpetas de frames.

No se declara soporte de tool calling, agentes ni capacidades de lenguaje: es un modelo de vision pura con pipeline image-to-image.

## Casos de uso

- Restauracion de archivo cinematografico: digitalizacion y limpieza automatica de bobinas de film antiguo con dano compuesto, aprovechando que el modelo esta entrenado especificamente sobre degradaciones de film simuladas fisicamente.
- Generacion de mapas de dano para catalogacion: las mascaras suaves de defectos permiten a archivistas cuantificar y localizar el dano frame a frame, priorizando manualmente las secciones que requieren intervencion humana.
- Preprocesado para remasterizacion comercial: usar DART como primer paso de limpieza antes de etapas manuales de colorizacion, estabilizacion o escaneado a 4K, reduciendo el coste de la restauracion tradicional.
- Preservacion de patrimonio audiovisual en instituciones: archivos nacionales, filmotecas y bibliotecas pueden integrar el modelo (licencia MIT) en flujos de trabajo internos sin costes de licencia.
- Restauracion de material monocromo: el soporte de footage en blanco y negro (gris replicado a 3 canales) lo hace adecuado para cine mudo y documental historico.
- Investigacion en restauracion no referenciada: el modelo, el pipeline AbsoluteDegradation y los datasets publicados en Kaggle forman una base reproducible para entrenar y comparar nuevos metodos.
- Postproduccion documental: limpieza automatica de material de archivo reutilizado en documentales, donde el stride de 3 frames sobre ventanas de 7 permite procesar secuencias largas de forma continua.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), sobre la tarea de restauracion de film de archivo con metricas de calidad perceptual sin referencia:

| Dataset | CLIPIQA+ | MUSIQ | MANIQA |
|---|---|---|---|
| AbsoluteDegradation (Real Scene-Split Eval) | 0,4334 | 51,2304 | 0,3011 |
| SRWOV | 0,4488 | 59,4263 | 0,3427 |

Datos de eficiencia declarados (clip 1x7x3x256x256, NVIDIA A100, fp32): 372 GFLOPs por frame, 0,35 GB de memoria y 29,5 FPS. No se incluyen en la informacion disponible comparativas numericas frente a otros modelos, aunque el paper indica que estos pesos corresponden a "DART (Ours)" en las tablas 2 a 4 del articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,35 GB de memoria para un clip de 7 frames a 256x256 en fp32, segun los datos declarados; clips de mayor resolucion aumentaran el consumo proporcionalmente.
- GPU de referencia en los tests: NVIDIA A100. Dado el consumo reducido, deberia funcionar en GPUs de gama media y consumer (por ejemplo, RTX 3060 o superiores), aunque no hay cifras oficiales para esas tarjetas.
- Cabe en GPUs consumer: si, con holgura, dada la huella de 0,35 GB en fp32 y los 6,58 M de parametros.
- Inferencia tambien posible en CPU, aunque de forma lenta segun la model card.
- Despliegue: el metodo oficial es el repositorio de GitHub con `uv sync` y los scripts de inferencia incluidos (`scripts/inference.py`); los pesos se descargan desde GitHub Releases o directamente desde HuggingFace con `hf download`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable: no es un modelo de lenguaje).
- Throughput declarado: 29,5 FPS a 256x256 en A100 con fp32.

## Comparativa con modelos similares

No se han incluido en la informacion disponible datos comparativos numericos frente a otros modelos. Como referencia categorica, DART se situa en el nicho de la restauracion de video de archivo sin referencia limpia, un campo distinto de la superresolucion de video general (como BasicVSR++ o RVRT, orientados a degradaciones genericas y con referencias sinteticas) y de los metodos especificos por defecto (rayones o polvo por separado). La comparacion cuantitativa con esos modelos, segun el paper, se encuentra en las tablas 2 a 4 del articulo, cuyas cifras completas no estan en la informacion proporcionada.

| Aspecto | DART | Alternativas de superresolucion de video general |
|---|---|---|
| Parametros | 6,58 M (1,32 M entrenables) | No disponible |
| Tarea | Restauracion de film de archivo con dano compuesto y mascara de defectos | No disponible |
| Licencia | MIT | No disponible |
| Datos de benchmark comparativos | No disponible | No disponible |

## Limitaciones y advertencias

- Las metricas de los benchmarks son declaraciones del autor y no estan verificadas por terceros (`verified: false` en el model-index).
- El modelo se entrena sobre degradaciones sinteticas generadas por AbsoluteDegradation a partir de REDS; su comportamiento sobre dano real de film puede diferir del simulado, y la evalucion "Real Scene-Split" mitiga pero no elimina este riesgo de brecha simetico-real.
- No hay referencia limpia en el dominio real de archivo: la calidad se mide con metricas perceptuales sin referencia (CLIPIQA+, MUSIQ, MANIQA), que pueden no reflejar fielmente la fidelidad historica de la restauracion.
- Las mascaras de defecto son estimaciones suaves, no segmentaciones exactas; conviene revisarlas antes de usarlas para decisiones automaticas de catalogacion.
- La resolucion de entrada debe ser multiplo de 16 tras el padding; los clips se procesan en ventanas de 7 frames con stride 3, lo que condiciona el procesamiento de secuencias muy cortas.
- La inferencia en CPU es lenta; para produccion se recomienda GPU.
- La licencia MIT es permisiva para uso comercial, pero el dataset de entrenamiento REDS esta bajo CC BY 4.0, lo que puede implicar atribucion en derivados del entrenamiento segun jurisdiccion y uso.
- Al ser un modelo de investigacion recien publicado (ACCV 2026) con 0 descargas registradas, no existe todavia historial de uso en produccion ni comunidad consolidada alrededor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TytanMikJas/DART-Degradation-Aware-Recurrent-Transformer
- Paper (arXiv:2607.21219): https://arxiv.org/abs/2607.21219
- Codigo (GitHub): https://github.com/TytanMikJas/DART-Degradation-Aware-Recurrent-Transformer
- Pagina del proyecto: https://absolutecinema.absolutedegradation.workers.dev
- Pipeline y benchmark AbsoluteDegradation: https://github.com/TytanMikJas/AbsoluteDegradation
- Datasets (Kaggle): https://www.kaggle.com/absolutedegradation/datasets
- Dataset REDS (fuente limpia de entrenamiento): https://seungjunnah.github.io/Datasets/reds.html
