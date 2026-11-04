# superbigsaw/RoboBeats-2B

## Resumen

RoboBeats-2B es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B, publicado por el usuario superbigsaw y vinculado al trabajo "Learning to Live: A Step Toward Lifelong Embodied Intelligence" (arXiv:2611.00180). Se presenta como un VLM (vision-language model) pequeno y estrictamente causal concebido como "gate" o filtro de eventos: consume un flujo de video a 1 fps y asigna a cada fotograma una probabilidad de que acabe de ocurrir un evento nuevo.

El proposito del modelo no es generar descripciones de video, sino decidir que fragmentos de una emision continua merecen almacenarse en memoria. Solo los fotogramas situados alrededor de los eventos detectados (apertura cuando la probabilidad supera 0,5 y cierre cuando baja de 0,3) se escriben en memoria, lo que reduce drasticamente el coste de almacenamiento en sistemas de robotica con percepcion continua.

Es relevante por su enfoque de eficiencia: al ser un adaptador LoRA sobre un modelo de 2B parametros, el repositorio ocupa apenas 0,1 GB y la inferencia puede ejecutarse en hardware modesto, lo que encaja con escenarios de robotica embebida donde el presupuesto computacional y energetico es limitado. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base Qwen/Qwen3.5-2B) |
| Parametros totales | 2B en el modelo base; el adaptador LoRA no especifica su numero de parametros (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors del adaptador; el modelo base admite las cuantizaciones habituales de Qwen3.5-2B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (library_name: peft) sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros. La funcion aprendida es una clasificacion binaria por fotograma: dada la secuencia de fotogramas hasta el instante t (procesamiento estrictamente causal, el score en t solo usa informacion hasta t), el modelo emite la probabilidad de que un evento nuevo haya comenzado. El pipeline declarado es video-text-to-text, lo que sugiere que el adaptador explota las capacidades vision-language del modelo base para razonar sobre el contenido visual.

El procesamiento de streams largos se realiza en bloques de 100 fotogramas con 10 fotogramas de solapamiento, lo que permite aplicar el modelo a videos de duracion arbitraria sin cargar todo el flujo en memoria. La seleccion de eventos usa dos umbrales (apertura en p > 0,5, cierre en p < 0,3) para evitar parpadeo en la deteccion. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; el trabajo asociado (arXiv:2611.00180) es la referencia para esos detalles.

## Capacidades

- Deteccion de eventos en video en streaming: asigna una probabilidad por fotograma a 1 fps indicando si ha ocurrido un evento nuevo.
- Procesamiento estrictamente causal: el score en el segundo t solo depende de fotogramas hasta t, lo que lo hace apto para inferencia en linea.
- Filtrado selectivo de memoria: implementa una politica de apertura y cierre de eventos basada en umbrales (0,5 y 0,3) para decidir que fotogramas se conservan.
- Procesamiento de streams largos mediante chunking (bloques de 100 fotogramas con 10 de solapamiento).
- Capacidades vision-language heredadas del modelo base Qwen3.5-2B (comprension de imagen y texto), aunque el adaptador esta especializado en la tarea de gate.
- Integracion con la libreria PEFT: el adaptador se carga sobre el modelo base descargado automaticamente.
- Soporte de tool calling, agentes, matematicas o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Gestion de memoria en robots de larga duracion: el modelo actua como filtro que decide que fragmentos de la percepcion continua se almacenan, reduciendo el coste de memoria en robots que operan durante horas o dias. Es adecuado por su naturaleza causal y su bajo coste (adaptador sobre 2B).
- Vigilancia y monitorizacion de video en directo: procesando un stream a 1 fps, el gate marca los instantes con cambios relevantes para que un sistema posterior (o un humano) revise solo esos fragmentos.
- Preprocesado para pipelines de captioning o analisis: en lugar de pasar todo el video a un modelo grande de video-texto, se usa RoboBeats-2B para seleccionar los fotogramas candidatos y ahorrar computo en la etapa siguiente.
- Deteccion de eventos en robotica de manipulacion: identificar cuando empieza o termina una accion (agarre, deposito, colision) a partir del flujo visual del robot, alimentando un modulo de control o de registro de episodios.
- Segmentacion de episodios para aprendizaje por imitacion: delimitar automaticamente los episodios de una demostracion larga para construir datasets de entrenamiento de politicas.
- Sistemas de alerta de bajo consumo en dispositivos embebidos: al caber en hardware modesto y procesar a 1 fps, puede desplegarse en plataformas con GPU integrada para disparar alertas cuando ocurre un evento.
- Indexacion y resumen de grabaciones: generar una lista de intervalos de interes (probs.json) que sirva para navegar rapidamente por videos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 2B parametros; en FP16 requiere aproximadamente 4-5 GB de VRAM, y en cuantizacion de 8 bits o 4 bits puede bajar a 2-3 GB o 1,5-2 GB respectivamente. El adaptador LoRA anade una huella minima (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia ser suficiente en FP16; en cuantizacion podria ejecutarse en GPUs integradas o en Apple Silicon.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6-8 GB o mas, aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: la model card solo documenta el uso a traves de la libreria propia (python -m robobeats y robobeats.gate.Gate); no se mencionan vLLM, llama.cpp, Ollama ni TGI. Al ser un adaptador PEFT sobre un modelo de la familia Qwen, cabria esperar compatibilidad con los runners habituales del modelo base, pero no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El procesamiento a 1 fps y el chunking de 100 fotogramas con 10 de solapamiento son los unicos parametros operativos documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboBeats-2B | 2B (base) + LoRA | No disponible | Gate de eventos en video causal | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| RoboBeats-0.8B | 0,8B (base) | No disponible | Gate de eventos en video causal | No disponible | HuggingFace (misma familia) |
| RoboBeats-4B | 4B (base) | No disponible | Gate de eventos en video causal | No disponible | HuggingFace (misma familia) |

Las alternativas mas directas son las otras variantes de la misma familia (0.8B y 4B), que permiten ajustar el compromiso entre coste y precision. No se dispone de informacion sobre modelos de terceros comparables en la misma tarea de deteccion causal de eventos en video.

## Limitaciones y advertencias

- Modelo muy especializado: no es un modelo de proposito general; su salida es una probabilidad de evento por fotograma, no texto libre ni descripciones.
- Rendimiento no verificado: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se publican benchmarks en la informacion disponible; conviene validar su comportamiento en el dominio concreto antes de usarlo en produccion.
- Frecuencia fija: el diseno asume 1 fps; su comportamiento con otras frecuencias de muestreo no esta documentado.
- Umbrales fijos por defecto: la politica de apertura (0,5) y cierre (0,3) puede requerir ajuste segun la aplicacion; no se documenta sensibilidad a estos valores.
- Dependencia de la libreria propia: el uso documentado requiere el repositorio github.com/AgibotTech/LIFE; no se confirma compatibilidad con servidores de inferencia estandar.
- Idiomas: no disponible; al ser un gate visual, la relevancia linguistica es limitada, pero no se especifica.
- Sesgos: no se documentan sesgos conocidos del adaptador; al heredar el modelo base, podria arrastrar los sesgos de Qwen3.5-2B.
- Riesgo de alucinacion: en esta tarea se traduce en falsos positivos o falsos negativos en la deteccion de eventos; no hay tasas de error publicadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar tambien la licencia del modelo base Qwen/Qwen3.5-2B.

## Enlaces

- HuggingFace: https://huggingface.co/superbigsaw/RoboBeats-2B
- Paper: https://arxiv.org/abs/2611.00180
- Codigo: https://github.com/AgibotTech/LIFE
- Variante 0.8B: https://huggingface.co/superbigsaw/RoboBeats-0.8B
- Variante 4B: https://huggingface.co/superbigsaw/RoboBeats-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
