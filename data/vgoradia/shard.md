# vgoradia/SHARD

## Resumen

SHARD (Signal Harmonics for Anomaly and Reactor Disruption) es un modelo Transformer desarrollado por Veer Goradia para predecir disrupciones de plasma en reactores de fusión de tipo tokamak. Una disrupción es una pérdida súbita del confinamiento del plasma que puede liberar megajulios de energía en milisegundos y danar las paredes del reactor; anticiparla con suficiente margen permite activar los sistemas de mitigación. El modelo resuelve ese problema de predicción temprana y, además, indica que senales de diagnostico concretas motivaron cada predicción.

A diferencia de un modelo de lenguaje, SHARD es un Transformer de series temporales de tamano muy reducido: 62.671 parametros totales, una proyeccion lineal de 13 senales de diagnostico de plasma a un espacio de 64 dimensiones, codificacion posicional aprendida, un encoder de 3 capas con 4 cabezas de atencion y dos cabezas de salida (probabilidad de disrupcion y tiempo hasta la disrupcion). Incorpora una capa de atribucion de senales basada en atencion entre canales.

Es relevante porque demuestra que una arquitectura frugal puede superar en 6,3 puntos de ROC-AUC a la linea base HDL en la base de datos DisruptionBench, y porque generaliza de forma zero-shot entre tokamaks distintos (entrenado en C-Mod, evaluado en DIII-D). Su licencia MIT y su baja latencia lo hacen apto para prototipos de investigacion y despliegue en sistemas de diagnostico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (3 capas, 4 cabezas de autoatencion, d_model=64) con capa de atribucion de senales |
| Parametros totales | 62.671 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 100 pasos temporales por disparo (shot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma; el modelo opera sobre senales numericas, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (.pt) |
| Entradas | 13 senales de diagnostico de plasma |
| Salidas | Probabilidad de disrupcion (clasificacion binaria) + tiempo hasta la disrupcion (regresion) + pesos de atribucion por senal |
| Latencia declarada | ~2 ms por disparo |

## Arquitectura y entrenamiento

La arquitectura proyecta linealmente 13 senales de diagnostico de plasma a un espacio de embedding de 64 dimensiones, aplica codificacion posicional aprendida para dotar al modelo de conciencia temporal y pasa la secuencia por un encoder Transformer de 3 capas con 4 cabezas de autoatencion. Ademas de las dos cabezas de salida, incorpora una capa de atribucion de senales (Signal Attribution Layer) que emplea atencion entre senales para identificar que parametros de plasma (β_p, q₉₅, modos MHD, etc.) influyeron mas en cada prediccion, aportando interpretabilidad.

El entrenamiento se realizo sobre la base de datos de disrupciones de MIT Alcator C-Mod (DisruptionBench) con 13 senales: β_p, lᵢ, q₉₅, modo MHD n₁, n/nG (fraccion de Greenwald), lower gap, κ (elongacion), error de Ip, voltaje de lazo, potencia radiada, Wmhd, dW/dt y v_loop. La secuencia es de 100 pasos temporales por disparo y el split es 80/10/10 estratificado por etiqueta de disrupcion. No se especifican en la informacion disponible el numero total de tokens o disparos ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Prediccion binaria de disrupcion de plasma con probabilidad asociada.
- Regresion del tiempo hasta la disrupcion (en milisegundos).
- Atribucion de senales: identifica que parametros de plasma (β_p, q₉₅, modos MHD, n/nG, etc.) contribuyeron mas a cada prediccion.
- Procesamiento de series temporales multivariantes de 13 canales con ventanas de 100 pasos.
- Generalizacion cross-tokamak zero-shot: entrenado en C-Mod y evaluado en DIII-D sin reentrenamiento.
- Inferencia de baja latencia (~2 ms por disparo) apta para integracion en sistemas de diagnostico en tiempo real.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision ni audio.
- Capacidad multilingue no aplicable: opera sobre senales numericas, no sobre lenguaje natural.

## Casos de uso

- Sistema de mitigacion de disrupciones en tiempo real: dado que la latencia declarada es de ~2 ms por disparo, el modelo puede integrarse en el lazo de control del tokamak para disparar la inyeccion de gas o la ruptura de plasma cuando la probabilidad supera un umbral, reduciendo el dano a las paredes.
- Investigacion en fisica de plasma: uso de la capa de atribucion de senales para estudiar que parametros (β_p, q₉₅, modos MHD) anticipan mejor una disrupcion, apoyando la formulacion de hipotesis fisicas.
- Analisis retrospectivo de campanas experimentales: procesar bases de datos historicas de disparos para etiquetar episodios de disrupcion y comparar el comportamiento entre distintos tokamaks.
- Transferencia entre maquinas: emplear el modelo entrenado en C-Mod como punto de partida para evaluar su comportamiento zero-shot en otras instalaciones (como DIII-D) antes de invertir en reentrenamiento.
- Prototipado rapido en hardware modesto: al tener 62.671 parametros, puede ejecutarse en CPU o en GPU de gama baja dentro de una sala de control, sin necesidad de aceleradores dedicados.
- Benchmarking de nuevos algoritmos: usar sus resultados (ROC-AUC 0,864, PR-AUC 0,449) como referencia en DisruptionBench al comparar arquitecturas alternativas de prediccion de disrupciones.
- Educacion y divulgacion: la demo interactiva de Streamlit permite experimentar con la prediccion y la atribucion de senales sin acceso a un tokamak real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,864 |
| PR-AUC | 0,449 |
| Mejora frente a la linea base HDL | +6,3 puntos de ROC-AUC |
| ROC-AUC (ensemble de 5 semillas) | 0,857 ± 0,008 |
| Generalizacion cross-tokamak | Zero-shot de C-Mod a DIII-D (sin reentrenamiento) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 KB en FP32 (62.671 parametros x 4 bytes); cabe holgadamente en cualquier dispositivo.
- GPU recomendadas: no es necesaria GPU; cualquier CPU moderna es suficiente. Si se desea procesar lotes grandes, una GPU de gama baja (por ejemplo, GTX 1650 o superior) sobra.
- Compatible con consumer GPU: si, en cualquier GPU consumer, e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo mediante torch.load; la model card no menciona integraciones con vLLM, llama.cpp, Ollama o TGI (no disponibles).
- Latencia y throughput: latencia declarada de ~2 ms por disparo; el throughput no esta especificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (secuencia) | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHARD | 62.671 | 100 pasos | 0,864 | MIT | HuggingFace (vgoradia/SHARD) |
| HDL (linea base) | no disponible | no disponible | 0,801 (inferido por la mejora de +6,3 puntos) | no disponible | no disponible |
| Otros modelos de DisruptionBench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables mas alla de la linea base HDL mencionada en la model card.

## Limitaciones y advertencias

- El PR-AUC es bajo (0,449), lo que indica dificultad para el modelo en el regimen de clases desbalanceadas tipico de la prediccion de disrupciones; conviene ajustar el umbral de decision segun el coste del falso negativo.
- El modelo se entreno sobre una unica base de datos (MIT Alcator C-Mod); la generalizacion a otros tokamaks se limita a una evaluacion zero-shot sobre DIII-D, sin datos de reentrenamiento publicados.
- El numero de parametros (62.671) es muy reducido, por lo que la capacidad de modelar dependencias temporales complejas es limitada frente a arquitecturas mayores.
- No se ha publicado informacion sobre sesgos, robustez frente a ruido en las senales o comportamiento ante regimenes de plasma fuera de distribucion.
- La etiqueta de idioma es "en", pero al operar sobre senales numericas la nocion de idioma no aplica; no hay soporte para texto en ningun idioma.
- La licencia MIT permite uso comercial, pero en un contexto de seguridad de reactores conviene validar el modelo especificamente para cada maquina antes de usarlo en produccion.
- El aviso de la model card no incluye umbral de decision recomendado, calibracion de la probabilidad ni intervalos de confianza, lo que dificulta su uso directo en un lazo de control critico.
- Los formatos de cuantizacion, el tamanio del conjunto de datos de entrenamiento y el detalle del preprocesado no estan disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/vgoradia/SHARD
- Demo interactiva (Streamlit): https://shard-disruption.streamlit.app
- Contacto del autor: vgoradia07@gmail.com
- Citacion (BibTeX): `@misc{goradia2026shard, title={SHARD: Signal Harmonics for Anomaly and Reactor Disruption — A Transformer Architecture for Interpretable Plasma Disruption Prediction}, author={Goradia, Veer}, year={2026}}`
- Paper o repositorio adicional: no disponible
