# VictorTishkevich/pokemon-automl-model

## Resumen

El modelo `VictorTishkevich/pokemon-automl-model` es un clasificador tabular binario entrenado con AutoGluon Tabular 1.6.1 que predice si un Pokémon de la primera generación (151 especies) es **Común (`0`)** o **Raro (`1`)**. Lo desarrolla VictorTishkevich en el contexto de la asignatura 24-679 de la Universidad Carnegie Mellon, con fines exclusivamente docentes para ilustrar el preprocesado de datos tabulares, la clasificación mediante AutoML y su evaluación.

No se trata de un modelo de lenguaje ni de un modelo generativo: no dispone de arquitectura transformer, ni de pesos en safetensors, ni de ventana de contexto. La entrada es un `DataFrame` de pandas con seis características (`hp`, `attack_count`, `retreat_cost`, `type`, `stage`, `has_ability`) y la salida es una etiqueta discreta o una probabilidad por clase.

Su relevancia es limitada y circunscrita al ámbito educativo: ejemplifica un flujo completo de AutoML sobre un conjunto de datos muy pequeno (336 filas de entrenamiento, 4 de validación y 5 de test), con un presupuesto de ajuste de 300 segundos y un modelo final de tipo `WeightedEnsemble_L2` con componente `NeuralNetTorch`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoGluon Tabular 1.6.1; mejor modelo `WeightedEnsemble_L2` con componente `NeuralNetTorch` (no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador tabular; 6 caracteristicas de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos tabulares, sin texto libre) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se construye con AutoGluon Tabular 1.6.1, que automatiza la selección de preprocesado, el ajuste de hiperparámetros y el ensamblado de modelos. La mejor configuración registrada es `WeightedEnsemble_L2`, un ensamblado por pesos que en este caso integra un componente `NeuralNetTorch`. El problema se declara como binario, con presupuesto de ajuste (`fit budget`) de 300 segundos, preset `medium_quality` y métrica de selección *balanced accuracy*. El tiempo total de entrenamiento documentado en el cuaderno del curso es de 19,66 segundos.

Los datos proceden del conjunto `pakiino/2026-24679-pokemon-151-tabular-hw1`, dividido en 336 filas de entrenamiento, 4 de validación y 5 de test. Las características incluyen atributos numéricos (`hp`, `attack_count`, `retreat_cost`) y categóricos (`type`, `stage`, `has_ability`), con `label` como variable objetivo. No se documenta el uso de RLHF, DPO ni ningún mecanismo de alineación, ya que no procede en un clasificador tabular. La puntuación de validación reportada es de 1,0 en *balanced accuracy* sobre las 4 filas de validación, un valor que debe interpretarse con extrema cautela por el tamano de la partición.

## Capacidades

- Clasificación binaria tabular: recibe un `DataFrame` con las columnas `hp`, `attack_count`, `retreat_cost`, `type`, `stage` y `has_ability`.
- Salida de etiqueta mediante `predict()`, que devuelve `0` (Común) o `1` (Raro).
- Salida de probabilidad por clase mediante `predict_proba()`.
- Preprocesado automático de variables numéricas y categóricas gestionado por AutoGluon.
- No dispone de generación de texto, razonamiento, codigo, matematicas ni visión.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo *thinking*.

## Casos de uso

- Docencia de AutoML: sirve como ejemplo reproducible de un flujo completo con AutoGluon, desde la carga de un `DataFrame` hasta la evaluación de un ensamblado, para demostrar el uso de presets y métricas de selección.
- Ensenanza de preprocesado tabular: permite ilustrar cómo tratar columnas numéricas y categóricas mixtas (`type`, `stage`, `has_ability`) antes de alimentar un clasificador.
- Prototipado de clasificación binaria: útil como plantilla mínima para adaptar a otros dominios tabulares con etiqueta binaria, sustituyendo el conjunto de datos.
- Estudio de ensamblados por pesos: el modelo permite analizar cómo `WeightedEnsemble_L2` combina componentes y qué peso relativo recibe `NeuralNetTorch` en un problema pequeno.
- Comparación de métricas en datos desbalanceados: la elección de *balanced accuracy* sirve para discutir por qué la exactitud simple resulta enganosa cuando las clases están desequilibradas.
- Etiquetado auxiliar de rareza en un catálogo de cartas: con las seis características de entrada, podría preetiquetar entradas de un catálogo interno, siempre que se amplíe y valide el conjunto de datos antes de cualquier uso real.
- Ejercicio de evaluación crítica: el modelo se presta a discutir los riesgos de reportar métricas sobre particiones de test de 5 ejemplos y de interpretar un 1,0 en validación con 4 filas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Metrica de seleccion | Balanced accuracy |
| Puntuacion de validacion (balanced accuracy) | 1,0 sobre 4 filas de validacion |
| Tamano del conjunto de test | 5 respuestas originales |
| Sensibilidad del test | Un error cambia el resultado en 20,0 puntos porcentuales |
| Baseline de mayoria en entrenamiento | Predice `Common` |
| Tiempo total de entrenamiento | 19,66 segundos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un modelo de lenguaje y el autor no reporta comparaciones de ese tipo.

## Requisitos de hardware

- Inferencia en CPU: el entorno registrado es Linux con Python 3.13.15 y PyTorch 2.11.0+cpu, sin uso de GPU.
- No requiere VRAM; el modelo es un clasificador tabular de muy bajo coste computacional.
- No necesita GPU dedicada: cabe y se ejecuta en cualquier CPU convencional, incluidas maquinas de portatil.
- Opciones de despliegue: inferencia mediante la propia API de AutoGluon Tabular (carga del predictor y llamada a `predict()` o `predict_proba()`).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el unico dato temporal documentado es el tiempo de entrenamiento de 19,66 segundos con un presupuesto de ajuste de 300 segundos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y no se detallan parametros, contexto, rendimiento ni licencia de alternativas.

## Limitaciones y advertencias

- Conjunto de datos extremadamente reducido: 336 filas de entrenamiento, 4 de validación y 5 de test, lo que favorece el sobreajuste.
- La puntuación de validación de 1,0 se calcula sobre solo 4 filas y no es representativa del rendimiento real.
- El conjunto de test de 5 ejemplos hace que un unico error altere la métrica en 20 puntos porcentuales; el propio autor advierte que no constituye una evaluación exhaustiva.
- Dominio muy restringido: solo la primera generación de Pokémon (151 especies) y solo seis características de entrada.
- No se especifica licencia, por lo que el uso comercial queda sin definir y debe consultarse con el autor antes de cualquier explotación.
- No apto para produccion: está concebido como material didactico para la asignatura 24-679 de CMU.
- Riesgo de sesgo derivado de la definición de "raro" en el conjunto de datos de origen, que no se documenta en detalle.
- Sin informacion sobre soporte de idiomas, cuantizacion o formatos alternativos de pesos, al no aplicar a un clasificador tabular.
- Cualquier uso mas alla del docente exige un conjunto de evaluacion mucho mayor y una validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VictorTishkevich/pokemon-automl-model
- Conjunto de datos de origen: https://huggingface.co/datasets/pakiino/2026-24679-pokemon-151-tabular-hw1
