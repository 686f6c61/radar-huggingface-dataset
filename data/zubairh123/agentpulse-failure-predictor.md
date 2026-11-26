# zubairH123/agentpulse-failure-predictor

## Resumen

AgentPulse Failure Predictor es un modelo de clasificación tabular publicado por Zubair Hussain (usuario `zubairH123`) en Hugging Face. No es un modelo de lenguaje: se trata de una regresión logística entrenada con scikit-learn que recibe 16 señales numéricas de telemetría de agentes de IA y estima una probabilidad de fallo (failure-risk score). El modelo se distribuye con sus pesos exportados a un formato JSON propio, junto con el escalador, el esquema de entrada y un script de inferencia basado únicamente en la biblioteca estándar de Python.

El problema que aborda es la observabilidad de agentes: en lugar de invocar un LLM para evaluar si un agente va a fallar, el modelo ofrece un scoring local, determinista y de coste prácticamente nulo en CPU. Está pensado como baseline reproducible para experimentos de fiabilidad de agentes y como ejemplo de despliegue sin dependencias pesadas (sin API key, sin scikit-learn en tiempo de inferencia y sin pickle ejecutable).

La relevancia es acotada y experimental: el modelo se ha entrenado exclusivamente con datos sintéticos (16.000 ejecuciones sintéticas de entrenamiento, 2.000 de validación y 2.000 de test), por lo que su valor principal es metodológico y de referencia, no de producción directa. La licencia es MIT y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (modelo lineal, clasificacion binaria tabular) |
| Parametros totales | 16 coeficientes mas intercepto (17 parametros aprendidos); el resto del pipeline es un escalador de caracteristicas |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija de 16 caracteristicas numericas) |
| Tipos de cuantizacion | no disponible (pesos exportados a JSON portable; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles; los nombres de caracteristicas y la documentacion estan en ingles) |
| Licencia | MIT |
| Formato de pesos | JSON portable (`logistic.json`), exportado desde scikit-learn; no se usa pickle |

## Arquitectura y entrenamiento

El modelo es una regresion logistica clasica sobre 16 caracteristicas numericas de telemetria de agentes. El pipeline incluye un escalador ajustado durante el entrenamiento y un umbral de decision seleccionado sobre el conjunto de validacion (0,30 segun el ejemplo de la model card). Los pesos se exportan desde scikit-learn a un JSON propio que un script de inferencia en Python estandar puede leer sin instalar scikit-learn ni deserializar pickles, lo que reduce la superficie de ataque y facilita la auditoria del modelo.

El entrenamiento se realizo sobre el dataset sintetico `zubairH123/agentpulse-5g`: 16.000 ejecuciones para entrenamiento, 2.000 independientes para seleccionar el umbral y otras 2.000 para test, procedentes de identificadores de entorno disjuntos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de regularizacion especificas, ni la composicion detallada de las 16 caracteristicas mas alla de que son senales numericas de telemetria de agentes.

## Capacidades

- Prediccion de riesgo de fallo de un agente a partir de 16 senales numericas de telemetria, devolviendo una probabilidad entre 0 y 1.
- Inferencia local en CPU sin API key, sin modelo de lenguaje y sin conexion de red.
- Ejecucion con la biblioteca estandar de Python mediante `predict.py`, sin necesidad de instalar scikit-learn en tiempo de ejecucion.
- Lectura de pesos en JSON portable, lo que permite inspeccionar coeficientes y auditar el modelo.
- Umbral de decision configurable (el valor de referencia es 0,30, seleccionado sobre validacion).
- No soporta tool calling, agentes multi-paso, vision, audio ni generacion de texto: es exclusivamente un clasificador tabular binario.
- Capacidades multilingues: no disponibles; el modelo opera sobre caracteristicas numericas y su documentacion esta en ingles.

## Casos de uso

- Monitorizacion de fiabilidad de agentes en entornos de prueba: integrar el script de inferencia en un bucle de observabilidad que puntue cada ejecucion de agente y marque como sospechosas aquellas con riesgo superior al umbral de 0,30, sin coste de GPU ni de API.
- Baseline reproducible para investigacion: usar el modelo y el dataset sintetico `agentpulse-5g` como referencia contra la que comparar clasificadores mas complejos (gradient boosting, redes neuronales tabulares) en experimentos de prediccion de fallos.
- Ejemplo didactico de despliegue seguro de modelos: el formato JSON portable y la ausencia de pickle lo convierten en una pieza util para ensenar practicas de empaquetado y auditoria de modelos en cursos de MLOps.
- Filtrado previo en pipelines de evaluacion: descartar ejecuciones de agente con bajo riesgo antes de lanzar evaluaciones caras con un LLM juez, reduciendo coste computacional en experimentos a gran escala.
- Pruebas de integracion en CI/CD: validar que un cambio en el sistema de agentes no dispara sistematicamente la probabilidad de fallo sobre un conjunto fijo de telemetrias de ejemplo, como test de regresion estadistica.
- Demostracion interactiva: el Space `agentpulse-risk-demo` permite probar el scoring con telemetria de ejemplo, util para presentaciones o validacion rapida del formato de entrada antes de integrarlo en un sistema propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card, medidos sobre el split de test del dataset sintetico `AgentPulse-5G` (2.000 ejecuciones). No estan verificados de forma independiente.

| Metrica | Regresion logistica |
|---|---:|
| ROC-AUC | 0,7652 |
| PR-AUC | 0,5859 |
| F1 | 0,5637 |
| Accuracy | 0,7190 |
| Recall | 0,6436 |

La model card indica que `benchmark.json` contiene una comparacion completa de tres modelos, pero no se incluyen en la informacion disponible los resultados de los otros dos.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere acelerador.
- Cabe en cualquier maquina con Python 3 y unos pocos kilobytes de memoria para los pesos JSON.
- Opciones de despliegue: ejecucion directa con `python predict.py telemetry.json --model logistic.json`, descarga del bundle via `huggingface_hub.snapshot_download`, o integracion del JSON de pesos en cualquier servicio propio que implemente la regresion logistica.
- Latencia y throughput: no disponibles de forma medida; al tratarse de una regresion logistica de 16 caracteristicas, la inferencia es del orden de microsegundos por muestra en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de prediccion de fallos de agentes en formato tabular. La model card menciona una comparacion interna de tres modelos en `benchmark.json`, pero sus resultados no estan incluidos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AgentPulse Failure Predictor | 17 parametros aprendidos | no aplica (16 caracteristicas) | MIT | Hugging Face, pesos JSON |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el autor advierte que las senales sinteticas pueden no transferirse a agentes reales.
- La calibracion de probabilidades y la validacion externa con telemetria real siguen siendo cuestiones abiertas segun la propia model card.
- La salida es una estimacion del modelo, no una garantia de fallo futuro; el umbral de 0,30 debe reajustarse segun el coste relativo de falsos positivos y falsos negativos.
- Las metricas declaradas no estan verificadas de forma independiente y proceden de un unico split sintetico.
- Riesgo de sesgo: al derivarse de datos generados sinteticamente, puede reproducir las suposiciones del generador y no reflejar la distribucion real de fallos.
- El repositorio no configura el widget de inferencia del Hub; el uso interactivo depende del Space enlazado.
- Idioma: documentacion y nombres de caracteristicas solo en ingles.
- Uso comercial: la licencia MIT lo permite, pero la falta de validacion en entornos reales desaconseja su uso como unico mecanismo de decision en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zubairH123/agentpulse-failure-predictor
- Dataset: https://huggingface.co/datasets/zubairH123/agentpulse-5g
- Demo interactiva (Space): https://huggingface.co/spaces/zubairH123/agentpulse-risk-demo
- Codigo y issues (GitHub): https://github.com/Zubair-hussain/AgentPulse-5G-AI-Agent-Failure-Prediction
- Coleccion AgentPulse: https://huggingface.co/collections/zubairH123/agentpulse-ai-agent-reliability-6b0831bec625b7f351986bd8
- Portfolio del autor: https://zubairhussain.xyz
