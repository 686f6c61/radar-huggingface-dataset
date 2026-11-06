# viro-bert/Viro-BERT

## Resumen

Viro-BERT es un modelo basado en la arquitectura DistilBERT (transformer encoder de 6 capas, 12 cabezas de atencion y dimension oculta de 768) desarrollado por el usuario viro-bert para la clasificacion de patogenos virales a partir de secuencias genomicas completas. Se distribuye como pesos de PyTorch (`sota_chunk_model.pth`) acompanados de un `config.json` con un vocabulario de 3-meros de 130 tokens y un script de inferencia `predict.py` para procesar ficheros FASTA. El modelo aborda la tarea de asignar una secuencia genomica viral a una de 14 clases virales predefinidas.

La innovacion metodologica que declara el autor es el "Chunk-and-Vote Late Fusion Consensus": el genoma se fragmenta en trozos (chunks) que se clasifican de forma independiente y los resultados se agregan por votacion en una etapa posterior (late fusion) para emitir la prediccion final. Esta estrategia permite manejar secuencias de longitud variable sin depender de una ventana de contexto fija, algo relevante en genomica viral, donde las longitudes oscilan entre unos pocos kilobases y decenas de kilobases.

El modelo es relevante para investigadores que necesiten un clasificador ligero y desplegable en CPU para tareas de vigilancia genomica o triaje inicial de muestras. Su licencia MIT y su tamano reducido (repo de 0,2 GB) facilitan la integracion en pipelines bioinformaticos. No obstante, la informacion publicada es muy limitada: no se detallan datos de entrenamiento, metricas de rendimiento ni el proceso de validacion, lo que condiciona cualquier evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder), 6 capas, 12 cabezas, hidden dim 768 |
| Parametros totales | no disponible (backbone DistilBERT; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizacion por 3-meros con vocabulario de 130 tokens; estrategia de chunks) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pth` sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre secuencias genomicas, no texto natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`); configuracion en `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo DistilBERT con 6 capas, 12 cabezas de atencion y dimension oculta de 768. La entrada no es texto natural sino secuencias genomicas tokenizadas mediante un vocabulario de 3-meros (k=3) de 130 tokens, definido en el `config.json`. La cabeza de clasificacion se proyecta sobre 14 clases virales. El mecanismo "Chunk-and-Vote Late Fusion Consensus" divide el genoma en fragmentos, obtiene una prediccion por fragmento y agrega las predicciones mediante votacion, lo que aporta robustez frente a regiones genomicas ambiguas o de baja calidad.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens procesados, ni sobre si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La unica innovacion declarada es la estrategia de chunk-and-vote descrita.

## Capacidades

- Clasificacion de secuencias genomicas virales completas en 14 clases: Dengue, EnteroA, EnteroB, HBV, HCV, HPV, HSV-1, IAV, IBV, ICV, MPV (Monkeypox), SFTS, WNV y Zika.
- Procesamiento de ficheros FASTA mediante el script `predict.py`.
- Salida con ranking de clases (`--top_k`) para inspeccion de las predicciones mas probables.
- Ejecucion en CPU (`--cpu`) o GPU CUDA.
- Invocacion desde R mediante `system()` o `reticulate`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues en el sentido habitual: opera sobre secuencias genomicas, no sobre lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Triaje inicial de muestras genomicas: dado un fichero FASTA con secuencias virales, el modelo asigna una clase probable entre las 14 disponibles, lo que permite priorizar muestras para confirmacion con metodos mas costosos como PCR o secuenciacion dirigida.
- Vigilancia genomica en salud publica: integrado en pipelines que procesan lotes de secuencias, el modelo puede clasificar rapidamente muestras de brotes y ayudar a detectar la presencia de patogenos como Dengue, Zika o Monkeypox en conjuntos de datos.
- Clasificacion de secuencias de influenza: distingue entre Influenza A, B y C, lo que resulta util en laboratorios de referencia que reciben muestras respiratorias sin tipado previo.
- Analisis de hepatitis virales: diferencia HBV y HCV en secuencias genomicas, apoyando la caracterizacion inicial en estudios epidemiologicos.
- Preprocesado en pipelines bioinformaticos: al ejecutarse en CPU y con un repo de 0,2 GB, puede desplegarse como paso previo de filtrado en servidores sin GPU antes de analisis mas pesados.
- Docencia y prototipado en bioinformatica: la licencia MIT y la simplicidad del script `predict.py` permiten usar el modelo como ejemplo practico de aplicacion de transformers a genomica en cursos y proyectos academicos.
- Investigacion en clasificacion viral: sirve como linea base (baseline) para comparar con otros enfoques de clasificacion genomica, aunque la ausencia de metricas publicadas limita su uso como referencia cuantitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el backbone DistilBERT (6 capas, hidden 768) es ligero y cabe holgadamente en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponible; el modelo soporta CUDA y CPU, y por su tamano cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia ser suficiente, si bien esto no esta confirmado por el autor.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del backbone y el repo de 0,2 GB, aunque no se documenta el consumo exacto.
- Opciones de despliegue: script `predict.py` con PyTorch y Transformers; invocacion desde Python o R (`reticulate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no cita alternativas ni referencias a trabajos previos de clasificacion viral con transformers. Como referencia estructural, el backbone es un DistilBERT estandar, pero no se han publicado metricas que permitan una comparacion cuantitativa con otros clasificadores genomicos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viro-BERT | no disponible | no disponible | no disponible | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de metricas: no se publican resultados de validacion, matrices de confusion, precision, recall ni F1 por clase, lo que impide evaluar la fiabilidad del modelo.
- Datos de entrenamiento no documentados: se desconoce el origen, tamano y balance de las secuencias utilizadas, asi como posibles sesgos hacia determinadas cepas o regiones geograficas.
- Riesgo de alucinacion en sentido clasico: al ser un clasificador, el riesgo se traduce en asignaciones erroneas con alta confianza; sin calibracion publicada, las probabilidades de salida no deben interpretarse como certezas.
- Cobertura limitada a 14 clases: cualquier patogeno fuera de esa lista sera forzado a una de las clases existentes, sin opcion de "desconocido" documentada.
- Idiomas: los metadatos indican "en", pero el modelo opera sobre secuencias genomicas; no aplica soporte multilingue de texto natural.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un uso en produccion regulada.
- Madurez: el repositorio tiene muy pocas descargas (43) y ningun "like", y fue creado y actualizado el mismo dia (26 de octubre de 2026), lo que sugiere un proyecto reciente y sin validacion externa.
- Uso clinico: no debe emplearse como herramienta de diagnostico sin validacion independiente y supervision de expertos.

## Enlaces

- Hugging Face: https://huggingface.co/viro-bert/Viro-BERT
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repos o demos). Los resultados de busqueda corresponden a entidades no relacionadas (Viro S.p.A., fabricante de cerraduras, y Viro AI, asistente conversacional).
