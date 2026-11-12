# ThakiCloud/PowerProof-P2-ZeroShot-Baseline

## Resumen

PowerProof-P2-ZeroShot-Baseline es un artefacto de reproducibilidad publicado por ThakiCloud que contiene dos modelos de regresion tabular entrenados para predecir el consumo electrico de GPU (potencia media y p95) a partir de la configuracion de una carga de inferencia LLM. No es un modelo de lenguaje: son pipelines de scikit-learn (un Ridge con preprocesado y un HistGradientBoostingRegressor) serializados con joblib, con un pipeline_tag de `tabular-regression`.

El interes del artefacto es que documenta un resultado negativo: ambos modelos se entrenaron exclusivamente con 504 ejecuciones medidas en H100 (186) y H200 (318), sirviendo Qwen3-8B en bf16 con vLLM 0.28.0, y al evaluarse zero-shot sobre una GPU no vista (B200, 240 ejecuciones) fallaron de forma sistematica. El modelo primario Ridge obtuvo un WAPE de 30,02% en potencia media y 23,71% en p95; el secundario GBDT, 43,33% y 43,04% respectivamente. Las 240 ejecuciones en B200 quedaron subestimadas por ambos modelos.

La relevancia es metodologica: el repositorio fija un contrato de seleccion de modelo congelado antes de la evaluacion, mantiene las etiquetas de B200 cifradas hasta la auditoria de integridad y no reajusta ni calibra a posteriori. Se publica como linea base que cualquier metodo nuevo (por ejemplo, calibracion por dispositivo) debe superar, y explicitamente no debe usarse para presupuestar potencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipelines de regresion tabular scikit-learn (no es una red neuronal ni un transformer) |
| Parametros totales | No disponible (no aplica; modelos clasicos con coeficientes y arboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 8 caracteristicas) |
| Tipos de cuantizacion | No aplica (pesos en joblib; sin cuantizacion) |
| Idiomas soportados | en, ko (solo documentacion; el modelo no procesa texto) |
| Licencia | Apache-2.0 (incluye los ficheros de pesos `model.joblib` y `model_secondary.joblib`) |
| Formato de pesos | joblib (pickles de scikit-learn/NumPy) |

## Arquitectura y entrenamiento

El modelo primario es un `Pipeline` con `StandardScaler` sobre las variables numericas, `OneHotEncoder(handle_unknown="ignore")` sobre las categoricas y `Ridge(alpha=1.0)`, con dos cabeceras de salida: potencia media (W) y potencia p95 (W). El secundario es un `HistGradientBoostingRegressor` (max_iter 200, learning_rate 0.05, min_samples_leaf 8, l2_regularization 1.0, random_state 2026) con passthrough numerico y el mismo OneHotEncoder. Cada fichero joblib es un diccionario Python con las claves `name`, `models` (con `mean_power` y `p95_power`), `rule` y `n_rows`. No hubo busqueda de hiperparametros.

Las entradas numericas son `requested_input_tokens`, `requested_output_tokens`, `max_concurrency`, `target_rate_rps`, `burstiness` y `power_limit_w`; las categoricas son `workload_family` (balanced, decode_heavy, prefill_heavy) y `loop` (closed, open). La unica caracteristica de dispositivo es el limite de potencia: `source_gpu_type` se mapea a `power_limit_w` con H100 400 W, H200 600 W y B200 1000 W, y otros tipos se rechazan. En filas de bucle cerrado, `target_rate_rps` y `burstiness` se fuerzan a 0. Se excluye cualquier variable conocida solo tras ejecutar la carga (potencia medida, energia, throughput, temperatura, relojes, latencia).

Los datos de entrenamiento son 504 ejecuciones validas (H100 186 + H200 318) con vLLM 0.28.0 sirviendo Qwen3-8B en bf16 en una sola GPU, tres formas sinteticas de carga y regimen cerrado y abierto. Las etiquetas son potencia de placa NVML sobre la ventana de peticiones: media (diferencia de contador de energia dividida por la duracion) y p95 de muestras cada 0,2 s (NVML aplica ya una media movil de aproximadamente 1 s, por lo que no es un pico instantaneo). Los datos de medicion no se publican.

## Capacidades

- Prediccion de potencia media de placa GPU (W) para una configuracion de carga de inferencia LLM dada.
- Prediccion de potencia p95 de placa GPU (W) para la misma configuracion.
- Acepta cargas balanceadas, decode-heavy y prefill-heavy, en regimen de bucle cerrado y abierto.
- Acepta concurrencia maxima, tasa objetivo (RPS), burstiness, tokens de entrada y salida solicitados y limite de potencia como entradas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto ni imagenes; no tiene capacidades multilingues mas alla de la documentacion en ingles y coreano.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Reproduccion del fallo zero-shot en B200: cargar `model.joblib` con scikit-learn 1.9.0 y evaluar sobre las 240 ejecuciones de B200 para verificar el WAPE reportado (30,02% en media, 23,71% en p95).
- Linea base de comparacion: usar el Ridge como referencia que metodos nuevos, como calibracion por dispositivo, deben batir en el mismo protocolo congelado.
- Estudio metodologico de transferencia entre GPUs: analizar por que un modelo entrenado con H100 y H200 subestima sistematicamente B200, partiendo de las hipotesis del autor (caracteristicas de potencia del dispositivo, significado del limite de potencia, VM frente a bare-metal, diferencias de entorno).
- Docencia e investigacion sobre resultados negativos: ejemplo de contrato de seleccion congelado, etiquetas cifradas y auditoria de integridad antes de una unica evaluacion.
- Validacion de pipelines de preprocesado: comprobar que una reimplementacion de `predict.py` produce exactamente el mismo mapeo de `source_gpu_type` a `power_limit_w` y el mismo tratamiento de filas en bucle cerrado.
- Auditoria de artefactos joblib: verificar compatibilidad de unpickling con scikit-learn 1.9.0 y dependencias NumPy antes de integrar el modelo en un entorno controlado.

## Benchmarks y rendimiento

Resultados en B200 (240 ejecuciones, WAPE, menor es mejor):

| Modelo | WAPE potencia media | WAPE potencia p95 | Sesgo con signo (media / p95) |
|---|---|---|---|
| Ridge (primario) | 30,02% | 23,71% | −30,02% / −23,71% |
| GBDT (secundario) | 43,33% | 43,04% | −43,33% / −43,04% |

Ridge por forma de carga:

| Carga | WAPE potencia media | WAPE potencia p95 |
|---|---|---|
| balanced | 29,96% | 23,96% |
| decode_heavy | 32,27% | 24,53% |
| prefill_heavy | 27,87% | 22,71% |

- Ejecuciones con potencia media medida igual o superior al 80% del limite (107 ejecuciones): WAPE de potencia media con Ridge de 28,89%.
- Bootstrap de 6 bloques: intervalo de 29,82% a 30,28% para el WAPE de potencia media con Ridge; con solo 6 bloques la cobertura del intervalo no esta validada.
- Todos los valores son negativos (subestimacion) en ambos modelos y en ambas metricas.

## Requisitos de hardware

- Inferencia en CPU: los pipelines de scikit-learn no requieren GPU; el coste es despreciable frente a cualquier carga LLM.
- VRAM estimada: 0 GB (no usa GPU para predecir).
- GPU recomendadas: no aplica; el modelo predice el consumo de GPU, no se ejecuta en ella.
- Cabe en cualquier maquina capaz de ejecutar scikit-learn 1.9.0 y NumPy.
- Opciones de despliegue: script Python con joblib y scikit-learn 1.9.0; no compatible de forma verificada con vLLM, llama.cpp, Ollama ni TGI, que no cargan artefactos joblib.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser regresion tabular, la latencia por prediccion es de microsegundos a milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de prediccion de potencia de GPU con la misma formulacion tabular y protocolo de evaluacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PowerProof-P2 Ridge (primario) | no aplica | no aplica | WAPE 30,02% / 23,71% en B200 | Apache-2.0 | Hugging Face |
| PowerProof-P2 GBDT (secundario) | no aplica | no aplica | WAPE 43,33% / 43,04% en B200 | Apache-2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fallo de transferencia documentado: todos los valores estan subestimados en B200; no debe usarse para presupuestar potencia, planificar racks o instalaciones ni tomar decisiones de capacidad en produccion, ni siquiera en H100 o H200.
- Cobertura limitada: tres tipos de GPU y un unico modelo servido (Qwen3-8B) con un unico stack (vLLM 0.28.0); no dice nada sobre prediccion de potencia de GPU en general.
- Causa del fallo no identificada: no se separaron caracteristicas de potencia del dispositivo, significado del limite de potencia, VM frente a bare-metal ni diferencias de carga o entorno.
- Los umbrales de WAPE del 10% y 15% que aparecen en los registros del proyecto eran una regla para elegir el numero de replicas de entrenamiento, no un criterio de aceptacion en B200.
- Las 240 ejecuciones de B200 quedan designadas como datos de desarrollo para trabajo posterior y no deben tratarse de nuevo como conjunto de test independiente.
- Solo se miden potencia de placa NVML, no potencia de servidor, nodo ni rack.
- Compatibilidad verificada solo con scikit-learn 1.9.0; otras versiones pueden fallar al deserializar o producir resultados distintos.
- Los datos de medicion no se publican y los valores por ejecucion tampoco, lo que limita la reauditoria independiente.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero el uso previsto sigue siendo la reproduccion del resultado negativo y la comparacion de metodos; el uso comercial como predictor de potencia queda desaconsejado por el propio autor.
- Riesgo de alucinacion no aplica (no genera texto); el riesgo equivalente es la extrapolacion silenciosa a GPUs o cargas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/PowerProof-P2-ZeroShot-Baseline
- Model card en coreano (referenciada en el repositorio): https://huggingface.co/ThakiCloud/PowerProof-P2-ZeroShot-Baseline/blob/main/MODEL_CARD.ko.md
- Ficheros citados en el repositorio: `model.joblib`, `model_secondary.joblib`, `feature_schema.json`, `predict.py`, `EVAL_B200.json`, `LICENSE`, `NOTICE`
- Qwen3-8B (carga servida durante las mediciones, Apache-2.0): https://huggingface.co/Qwen/Qwen3-8B
- vLLM (stack de servicio, Apache-2.0): https://github.com/vllm-project/vllm
- scikit-learn (dependencia de deserializacion, BSD-3-Clause): https://scikit-learn.org
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
