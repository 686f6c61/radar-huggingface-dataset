# Vasubuha/gtcrn-speech-enhancement

## Resumen

GTCRN (Group Temporal Convolutional Recurrent Network) es un modelo de mejora de voz (speech enhancement) y cancelacion adaptativa de ruido (ANC) de tamano ultraligero: aproximadamente 23.670 parametros, es decir, 0,024 millones. Lo publica el usuario Vasubuha en Hugging Face bajo licencia MIT, con pesos en PyTorch y una exportacion a ONNX para inferencia en streaming. Su proposito no es generar texto ni razonar, sino limpiar senal de audio: recibe audio con ruido y devuelve audio con la voz reforzada y el ruido atenuado, trabajando a 16 kHz mono.

El modelo esta entrenado especificamente para entornos hostiles de defensa, y la model card distingue tres regimenes de ruido que afirma manejar: ruido estacionario (retumbo de motor, ruido continuo), ruido impulsivo (disparos, artilleria, estallidos subitos) y ruido aereo (drones, propulsion de aeronaves). Esa especializacion lo separa de los modelos de denoising de proposito general orientados a oficina o telefonia.

Su relevancia practica esta en el coste computacional: con 23,67 K parametros y un tamano de chunk de 16 ms, es candidato a despliegue en tiempo real en CPU, dispositivos moviles o hardware embebido, sin GPU. La contrapartida es que se trata de un repositorio sin traccion publica (0 descargas y 0 likes en el momento de la consulta), sin resultados de benchmarks publicados y sin documentacion sobre el dataset de entrenamiento, por lo que cualquier evaluacion seria exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Group Temporal Convolutional Recurrent Network (GTCRN) |
| Parametros totales | ~23.670 (0,024 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; procesamiento por tramas en streaming con chunk de 16 ms |
| Tipos de cuantizacion | No disponible (se distribuye un checkpoint PyTorch y una exportacion ONNX; no se documentan variantes INT8/FP16) |
| Idiomas soportados | No disponible; el modelo opera sobre la senal acustica, no sobre contenido linguistico |
| Licencia | MIT |
| Formato de pesos | `best.pt` (PyTorch) y `gtcrn_stream.onnx` (ONNX en streaming) |
| Tarea (pipeline) | audio-to-audio |
| Frecuencia de muestreo | 16.000 Hz, mono |
| Parametros STFT | N_FFT = 512, hop = 256, ventana = 512 (Hann) |
| Latencia de inferencia | Streaming en tiempo real, chunk de 16 ms |
| Libreria declarada | ONNX |
| Tamano del repositorio | 0,0 GB segun el Hub |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional recurrente temporal agrupada (Group Temporal Convolutional Recurrent Network). El nombre indica la combinacion de convoluciones temporales organizadas en grupos con componentes recurrentes, un diseno habitual en el filtrado de senal de audio porque las convoluciones capturan patrones locales en el espectrograma y la recurrencia mantiene estado entre tramas, lo que permite el procesamiento continuo en streaming. La model card no detalla el numero de capas, el tamano de los grupos, el tipo de celda recurrente ni el campo receptivo efectivo; esos datos no estan disponibles.

El front-end es un STFT con N_FFT de 512, hop de 256 y ventana Hann de 512, sobre audio mono a 16 kHz, y la latencia declarada de 16 ms por chunk corresponde exactamente al hop de 256 muestras a 16 kHz (256 / 16.000 = 16 ms), lo que confirma un esquema de procesamiento trama a trama. El modelo se presenta como entrenado para cancelacion adaptativa de ruido en entornos de defensa, con enumeracion de categorias de ruido (estacionario, impulsivo y aereo), pero no se especifica el numero de tokens o de horas de audio empleadas, la composicion del dataset, si hubo entrenamiento adversario, ni si se aplicaron tecnicas de post-proceso como RLHF o DPO (no aplicables a esta tarea). No hay datos sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Mejora de voz (speech enhancement): separa voz de ruido de fondo y devuelve audio limpio, tarea de audio-audio.
- Supresion de ruido estacionario: retumbo de motor, zumbidos y ruido continuo de maquinaria.
- Supresion de ruido impulsivo: disparos, artilleria y estallidos subitos, un regimen que suele degradar los supresores entrenados solo con ruido estacionario.
- Supresion de ruido aereo: ruido de drones y propulsion de aeronaves.
- Procesamiento en streaming en tiempo real: inferencia por chunks de 16 ms con estado recurrente entre tramas.
- Exportacion a ONNX: el fichero `gtcrn_stream.onnx` permite ejecucion con ONNX Runtime fuera de PyTorch, orientada a edge.
- Ejecucion en CPU: por tamano, no requiere GPU.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no soportado.
- Multilingue: no aplica; no procesa texto ni reconoce idioma.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio generativo; la unica salida es audio mejorado a 16 kHz mono.

## Casos de uso

- Comunicaciones en intercomunicadores y cascos de proteccion: el modelo filtra el ruido continuo de vehiculos y el ruido impulsivo del entorno, de modo que la voz del operador llega inteligible al canal de radio. Su latencia de 16 ms es compatible con conversacion en tiempo real.
- Limpieza previa de audio para sistemas ASR: en un pipeline de transcripcion, colocar GTCRN delante del reconocedor reduce la tasa de error provocada por ruido de fondo; el coste anadido es minimo porque el modelo tiene 23,67 K parametros y puede correr en CPU junto al ASR.
- Audioconferencia y VoIP en entornos ruidosos: integrado como etapa de pre-proceso en el cliente, atenua aire acondicionado, teclados o trafico antes de codificar el audio, sin depender de la GPU del usuario.
- Audio de drones y vigilancia aerea: la model card indica entrenamiento especifico contra ruido de propulsion aerea, util para aislar voces captadas por microfonos en presencia de aeronaves.
- Dispositivos vestibles y auriculares con cancelacion activa: con un peso en FP32 de aproximadamente 95 KB (estimacion: 23.670 parametros x 4 bytes), el modelo cabe en microcontroladores y DSP de bajo consumo para cancelacion adaptativa local.
- Grabadoras corporales (bodycams) y registro de campo: la mejora de voz a posteriori o en directo facilita la revision de grabaciones realizadas en entornos con ruido severo, donde el audio original es poco inteligible.
- Preprocesado en produccion de audio de campo: limpieza de pistas grabadas en exteriores antes de montaje o subtitulado, ejecutable en lote sobre CPU sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas habituales en mejora de voz (PESQ, STOI, SI-SDR, DNSMOS), ni comparaciones con otros modelos, ni tamano del conjunto de evaluacion. Tampoco se aportan datos de latencia mas alla del tamano de chunk de 16 ms ni mediciones de throughput. Cualquier cifra de rendimiento debe obtenerse mediante evaluacion propia con el script `infer_onnx.py` y el fichero `sample_noisy.wav` incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB. Estimacion propia a partir del tamano del modelo (23.670 parametros, aproximadamente 95 KB en FP32) mas las activaciones del STFT y el estado recurrente. No hay cifras oficiales publicadas.
- GPU recomendadas: no se requiere GPU. Cualquier GPU disponible (por ejemplo, RTX 3060 o superior) sirve para ejecucion en lote, pero seria infrautilizada.
- Compatibilidad con GPU de consumo: si, con cualquier GPU de consumo, e incluso sin GPU.
- CPU y hardware embebido: es el escenario natural de despliegue por el tamano del modelo; la model card orienta explicitamente la exportacion ONNX a despliegue en edge y tiempo real.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor para velocidad y edge, mediante `infer_onnx.py`), PyTorch con `infer.py`. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Dependencias declaradas: onnxruntime, soundfile, numpy.
- Latencia y throughput: latencia declarada de 16 ms por chunk en streaming; no se publican cifras de throughput ni de latencia extremo a extremo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa. La comparacion siguiente es cualitativa y se basa en la categoria de modelos ligeros de mejora de voz; las cifras de parametros de los modelos alternativos son referencias publicas no verificadas en esta ficha y deben confirmarse en sus repositorios.

| Modelo | Parametros | Enfoque | Licencia | Notas |
|---|---|---|---|---|
| GTCRN (este modelo) | ~23.670 (dato de la model card) | Convolucion temporal agrupada + recurrencia, streaming | MIT | Entrenado para ruido de defensa; sin benchmarks publicados |
| RNNoise | Referencia publica, no verificada | Red recurrente ligera sobre caracteristicas de banda | BSD (segun su proyecto original) | Referente clasico en supresion de ruido en tiempo real; rendimiento comparativo no disponible aqui |
| DTLN | Referencia publica, no verificada | Convolucion + LSTM en dos etapas | MIT (segun su proyecto original) | Orientado a tiempo real en dispositivos; rendimiento comparativo no disponible aqui |
| DeepFilterNet | Referencia publica, no verificada | Filtrado en dominio frecuencial con convoluciones profundas | MIT / Apache-2.0 segun version | Mayor coste computacional que GTCRN; rendimiento comparativo no disponible aqui |

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de calidad de mejora de voz (PESQ, STOI, SI-SDR) ni comparacion con alternativas, por lo que la afirmacion de entrenamiento para entornos hostiles no esta respaldada por metricas en la informacion disponible.
- Sin datos de entrenamiento: se desconoce el dataset, su composicion, su tamano y su procedencia, lo que impide evaluar sesgos acusticos (por ejemplo, sobreajuste a un tipo de microfono, de idioma o de entorno).
- Riesgo de artefactos y sobre-supresion: en modelos de mejora de voz con pocos parametros es habitual la introduccion de artefactos musicales o el recorte de segmentos de voz poco energicos. No hay informacion del autor que lo cuantifique.
- Sesgo de idioma y de hablante: no se documenta la distribucion de voces del entrenamiento; un modelo entrenado con hablantes y condiciones concretas puede degradar voces fuera de esa distribucion.
- Contexto y estado limitado: al ser streaming con estado recurrente, la calidad en los primeros chunks de una senal puede ser inferior al no existir historial.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la licencia. No se declaran restricciones adicionales ni clausulas de uso responsable.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-07), sin historial de mantenimiento. No debe tratarse como modelo estable de produccion sin validacion propia.
- Repositorio de tamano 0,0 GB segun el Hub: conviene verificar que los pesos (`best.pt`, `gtcrn_stream.onnx`) estan efectivamente accesibles y no vacios antes de integrarlo.
- Restriccion de dominio: solo audio mono a 16 kHz; no acepta otras frecuencias de muestreo sin remuestreo previo.

## Enlaces

- Hugging Face: https://huggingface.co/Vasubuha/gtcrn-speech-enhancement
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo. Los resultados de busqueda disponibles no guardan relacion con GTCRN.
