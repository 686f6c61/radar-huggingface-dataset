# swarajchattaraj/DRISTI-Router

## Resumen

DRISTI-Router es un modelo de clasificacion de texto desarrollado por Swaraj Chattaraj, publicado en HuggingFace bajo el identificador `swarajchattaraj/DRISTI-Router`. Se presenta como un "motor de decision probabilistico no autoregresivo" de tipo "System One": un enrutador de bajisima latencia (~40 ms medidos en una RTX 3050) que resuelve consultas rutinarias y delega las dudosas o fuera de distribucion (OOD) a LLM grandes de "System 2". La idea es arquitectonica y de coste: filtrar y clasificar antes de invocar modelos caros.

Tecnicamente es un DistilBERT Base uncased de ~66 millones de parametros al que se han anadido cabezas de enrutamiento personalizadas de tipo binario, de eleccion y ordinal. No es un modelo generativo: su salida es una decision categorica con confianza calibrada, no texto. Incorpora deteccion de OOD mediante similitud coseno y calibracion de probabilidades con temperature scaling ajustado por L-BFGS.

Su relevancia actual es la del patron "router barato delante de LLM caros", habitual en pipelines de agentes y en plataformas de inferencia multi-modelo. El modelo tiene 0 descargas y 1 like en el momento de la consulta, y su uso practico esta condicionado a clonar la arquitectura propietaria `DristiModelV03` desde el repositorio GitHub del autor, ya que no se carga con las clases estandar de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (Base, uncased) con cabezas de enrutamiento personalizadas (binaria, de eleccion, ordinal) |
| Parametros totales | ~66 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de DistilBERT Base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) mas fichero `calibration.json` |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | text-classification |
| Latencia declarada | ~40 ms en RTX 3050 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT Base uncased, un transformer encoder de 6 capas y ~66 millones de parametros, destilado del BERT Base. Sobre ese tronco se anaden cabezas de clasificacion especificas para enrutamiento, con tres variantes segun la model card: binaria (decidir entre dos caminos), de eleccion (seleccionar una opcion entre varias) y ordinal (devolver un nivel ordenado, por ejemplo una prioridad o una clase de coste). El pipeline es no autoregresivo: una sola pasada hacia delante produce la decision.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo que si se describe son tres mecanismos de post-procesado e inferencia: deteccion de OOD mediante similitud coseno en el espacio de representaciones, para rechazar consultas ajenas al dominio; calibracion de confianza mediante temperature scaling optimizado con L-BFGS, de modo que la probabilidad declarada sea interpretable; y una API "auto-reparable" disenada para incorporar retroalimentacion humana en produccion, lo que apunta a un ciclo de active learning. No se especifica si ese ciclo esta implementado en el repositorio o es unicamente un objetivo de diseno.

## Capacidades

- Clasificacion de texto no generativa: devuelve decisiones categoricas con una probabilidad asociada, no texto libre.
- Enrutamiento binario, de eleccion multiple y ordinal mediante cabezas especializadas.
- Deteccion de consultas fuera de distribucion o no seguras por similitud coseno, con rechazo y derivacion a un modelo mayor.
- Confianza calibrada (temperature scaling con L-BFGS), apta para umbralizar decisiones automaticamente.
- Aprendizaje activo a partir de retroalimentacion humana en produccion, segun la descripcion del autor.
- Inferencia de muy baja latencia (~40 ms en RTX 3050), compatible con enrutamiento en linea dentro de un pipeline.
- Soporte de tool calling: no disponible (el modelo no genera texto ni llamadas a funciones).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; puede actuar como componente de enrutamiento dentro de un agente.
- Capacidades multilingues: no, unicamente ingles.
- Capacidades especiales: modo "thinking" no disponible; vision y audio no disponibles.

## Casos de uso

- Enrutamiento previo a LLM en produccion: el modelo clasifica cada peticion entrante en ~40 ms y decide si la resuelve un modelo pequeno o hay que escalar a un LLM grande, reduciendo el coste por token de forma directa.
- Control de coste en plataformas multi-modelo: integrado como primera etapa, permite enviar solo una fraccion del trafico a los modelos caros, con una decision calibrada y auditable en lugar de una heuristica escrita a mano.
- Guardrails y filtrado de entrada: la deteccion de OOD por similitud coseno sirve para rechazar consultas fuera de dominio o potencialmente no seguras antes de que lleguen a un modelo generativo mas expuesto.
- Triaje de tickets de soporte: la cabeza ordinal permite asignar prioridad o severidad a un ticket en funcion del texto, y la cabeza de eleccion derivar a la cola o al equipo correspondiente.
- Clasificacion de intenciones en asistentes conversacionales: uso como clasificador de intent en ingles para decidir la siguiente accion del dialogo sin invocar un LLM.
- Etiquetado asistido y cura de datos: al ser un clasificador ligero y desplegable en CPU o GPU de gama baja, encaja en pipelines de pre-etiquetado masivo con revision humana posterior.
- Monitorizacion de deriva en produccion: la confianza calibrada permite detectar cuando la distribucion de entradas cambia y el enrutador empieza a operar en zona OOD, disparando reentrenamiento o ajuste de umbrales.
- Investigacion sobre enrutamiento y cascadas de inferencia: sirve como punto de partida reproducible (licencia MIT, ~66 M de parametros) para experimentar con arquitecturas de "System One / System Two".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una latencia aproximada de 40 ms sobre una RTX 3050, sin detallar tamano de lote, precision numerica ni secuencia de entrada.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Precision / recall de enrutamiento | no disponible |
| AUROC de deteccion OOD | no disponible |
| Latencia | ~40 ms (RTX 3050, condiciones no especificadas) |

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 260-300 MB de pesos, mas activaciones; cabe con holgura en cualquier GPU con 1 GB o mas.
- VRAM estimada en fp16/bf16: en torno a 130-150 MB de pesos.
- VRAM estimada en int8: en torno a 70-80 MB de pesos, si se aplica cuantizacion dinamica por cuenta propia (no se distribuyen pesos cuantizados).
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090 o superiores. El modelo se midio precisamente en una RTX 3050, lo que indica que el objetivo de diseno es hardware de gama de entrada.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en CPU con latencias del orden de decenas de milisegundos.
- Opciones de despliegue: el modelo requiere la arquitectura personalizada `DristiModelV03` del repositorio GitHub del autor, por lo que no se carga con `AutoModelForSequenceClassification` de `transformers` sin codigo adicional. Son viables TorchScript, ONNX Runtime o un servidor propio en FastAPI una vez exportado. vLLM, TGI, Ollama y llama.cpp no estan soportados de forma documentada, ya que no se publican pesos GGUF ni compatibilidad con esas herramientas.
- Latencia y throughput: ~40 ms por consulta en RTX 3050 segun el autor. El throughput agregado depende del batching y del hardware; no se publican cifras.

## Comparativa con modelos similares

La categoria es la de clasificadores encoder ligeros para enrutamiento o clasificacion de intenciones. Los datos de las alternativas que figuran a continuacion corresponden a sus especificaciones publicas conocidas, no a mediciones realizadas junto a DRISTI-Router.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DRISTI-Router | ~66 M | no disponible | MIT | Requiere codigo propio; cabezas de enrutamiento, OOD y calibracion integradas |
| DistilBERT base uncased | ~66 M | 512 tokens | Apache 2.0 | Clasificador generico; sin cabezas de enrutamiento ni deteccion OOD |
| MiniLM-L6-v2 | ~22,7 M | 512 tokens | Apache 2.0 | Mas pequeno y rapido; requiere anadir cabezas de clasificacion propias |
| DeBERTa-v3-small | ~44 M | 512 tokens | MIT | Buen rendimiento en clasificacion; sin componentes de calibracion u OOD |

No hay datos publicos que permitan comparar el rendimiento de enrutamiento de DRISTI-Router frente a estas alternativas.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles; su comportamiento en castellano u otros idiomas no esta documentado.
- Modelo no generativo: no produce texto, codigo ni llamadas a herramientas; cualquier uso que requiera generacion debe combinarse con otro modelo.
- Sesgos conocidos: no disponible. La model card no describe la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico, tematico o de dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza si la calibracion no se reajusta sobre los datos reales de despliegue.
- Umbral OOD: el punto de corte de similitud coseno no se especifica; un umbral mal elegido produce falsos rechazos o deja pasar consultas fuera de dominio.
- Dependencia de codigo externo: sin clonar `DristiModelV03` desde el repositorio del autor, los pesos no son utilizables con el ecosistema estandar de `transformers`. Esto incrementa el coste de mantenimiento y el riesgo de abandono del proyecto.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin benchmarks publicados ni evaluacion independiente. No es un componente recomendable para produccion critica sin validacion propia.
- Licencia: MIT, permisiva y apta para uso comercial, con la obligacion habitual de conservar el aviso de copyright y la licencia.
- Formato: solo se publican pesos en `pytorch_model.bin` y `calibration.json`; no hay versiones cuantizadas ni empaquetados listos para servir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swarajchattaraj/DRISTI-Router
- Repositorio de la arquitectura (GitHub): https://github.com/SWARAJCHATTARAJ/DRISTI
- Perfil del autor: https://swarajchattaraj.tech/
- Perfil de GitHub del autor: https://github.com/SWARAJCHATTARAJ/SWARAJCHATTARAJ
- Paper asociado: no disponible
- Demo publica: no disponible
