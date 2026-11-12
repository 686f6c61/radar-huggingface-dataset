# unnicr/tiny-news-classifier-openvino

## Resumen

tiny-news-classifier-openvino es un clasificador de texto transformer de pequeno tamano (4,06 millones de parametros) entrenado desde cero por el autor unnicr y exportado a OpenVINO IR en FP16 para inferencia exclusiva en CPU. Resuelve una tarea concreta de clasificacion de noticias en cuatro categorias (World, Sports, Business, Sci/Tech) sobre el dataset AG News, con una precision de test de 0,8767.

El modelo esta disenado para escenarios donde no hay GPU disponible: el formato OpenVINO IR permite ejecutar la inferencia en procesadores Intel con aceleracion por hardware, incluyendo GPU integrada y NPU en equipos compatibles. Su huella es minima (repositorio de menos de 0,1 GB) y la longitud maxima de entrada es de 128 tokens con un tokenizador de nivel de palabra incluido en el repositorio.

Es relevante para desarrolladores que necesitan un clasificador de noticias ligero, desplegable en entornos de produccion con CPU, sin dependencias de frameworks de deep learning pesados y con licencia Apache 2.0. No es un modelo generativo ni un LLM: es un clasificador discriminativo de cuatro clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (entrenado desde cero, sin detalle de capas ni dimensiones publicado) |
| Parametros totales | 4,06 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrada) |
| Tipos de cuantizacion | FP16 (OpenVINO IR); no se documentan otras precisiones |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

Se trata de un transformer de 4,06 M de parametros entrenado desde cero (no es un fine-tuning de un modelo preentrenado) sobre el dataset AG News (`fancyzhx/ag_news`), que contiene noticias etiquetadas en cuatro categorias: World, Sports, Business y Sci/Tech. La model card no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni el volumen exacto de tokens de entrenamiento.

El modelo se exporta a OpenVINO IR en FP16 para inferencia en CPU, con soporte opcional de GPU y NPU en hardware Intel. Incluye un tokenizador de nivel de palabra implementado en `text_utils.py`, con vocabulario en `vocab.json`, y un wrapper de inferencia en `inference.py`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion de texto en cuatro categorias de noticias: World, Sports, Business y Sci/Tech.
- Inferencia exclusiva en CPU mediante OpenVINO IR en FP16, con soporte opcional de GPU integrada y NPU en hardware Intel.
- Procesamiento de entradas de hasta 128 tokens con tokenizador de nivel de palabra incluido en el repositorio.
- API de uso sencilla: la clase `Classifier` acepta una cadena de texto y devuelve la clasificacion.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Clasificacion automatica de titulares de noticias en un agregador: el modelo recibe el titular o un fragmento corto (hasta 128 tokens) y devuelve una de las cuatro categorias, adecuado por su precision de 0,8767 en test y su bajo coste computacional en CPU.
- Etiquetado de articulos en un CMS o pipeline editorial: integrado como paso previo a la indexacion, permite asignar la seccion (World, Sports, Business, Sci/Tech) sin intervencion manual y sin GPU.
- Filtrado y enrutamiento de contenido en un feed: dado que el modelo corre en CPU, puede desplegarse en el mismo servidor de aplicacion para clasificar flujos de noticias en tiempo real a bajo coste.
- Preprocesamiento para sistemas de recomendacion: la categoria predicha puede usarse como feature en un modelo de ranking de noticias, con inferencia en el mismo nodo de CPU que el resto del pipeline.
- Despliegue en dispositivos de borde o entornos sin GPU: el formato OpenVINO IR y el tamano de 4,06 M de parametros permiten ejecutar la clasificacion en equipos Intel de escritorio, mini-PC o portatiles con GPU integrada o NPU.
- Prototipado rapido y pruebas de concepto: la instalacion se reduce a `openvino`, `huggingface_hub` y `numpy`, y el uso es una llamada a `Classifier(path)` seguida de la cadena de texto, lo que facilita validar la viabilidad de un clasificador de noticias antes de invertir en un modelo mayor.
- Clasificacion por lotes de corpus historicos de noticias en ingles: al no requerir GPU, se puede procesar un volumen alto de documentos en paralelo sobre CPU con un coste energetico bajo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precision en test (AG News, 4 clases) | 0,8767 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni comparativas con otros modelos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU. El repositorio ocupa menos de 0,1 GB y los pesos en FP16 son de unos pocos megabytes.
- GPU recomendadas: no requiere GPU dedicada. Soporta GPU integrada Intel y NPU en hardware compatible mediante el parametro `device` del wrapper.
- Cabe en cualquier CPU moderna; tambien en GPU de consumo si se usa el backend GPU de OpenVINO en hardware Intel.
- Opciones de despliegue: OpenVINO Runtime con el wrapper `inference.py` incluido; requiere `openvino`, `huggingface_hub` y `numpy`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-news-classifier-openvino | 4,06 M | 128 tokens | Clasificacion AG News (4 clases) | Apache 2.0 | Hugging Face, formato OpenVINO IR |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno con tokenizador de nivel de palabra: no puede manejar palabras que no vio durante el entrenamiento, lo que provoca perdida de informacion en vocabulario fuera de dominio.
- Funciona mejor con texto corto en ingles similar a los datos de entrenamiento (noticias de AG News); el rendimiento fuera de ese dominio no esta documentado.
- Longitud maxima de entrada de 128 tokens: los textos mas largos deben truncarse, con la consiguiente perdida de contexto.
- Solo soporta ingles; no es multilingue.
- Riesgo de sesgos y alucinacion no evaluado en la model card; al ser un clasificador discriminativo, el riesgo principal es la clasificacion erronea, no la generacion de contenido falso.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni evaluaciones de robustez en produccion.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No se documentan detalles de arquitectura (capas, dimensiones, atencion) ni el proceso de entrenamiento, lo que dificulta evaluar su comportamiento fuera del benchmark declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unnicr/tiny-news-classifier-openvino
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- OpenVINO: https://docs.openvino.ai
