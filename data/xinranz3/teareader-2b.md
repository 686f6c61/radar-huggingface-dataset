# xinranz3/TeaReader-2B

## Resumen

TeaReader-2B es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-2B para una tarea muy concreta: predecir la evolución futura de las curvas de metricas de un entrenamiento de modelos de lenguaje. A partir del primer 20% de una curva (diez puntos hasta x = 0.2) y de la configuracion numerica del run, el modelo genera predicciones cuantilicas (p10, p50, p90) para el resto de la curva. Lo desarrolla xinranz3 como componente experimental del trabajo "Reading the Tea Leaves, Again: Can Large Language Models Predict Language Model Training Runs?".

La relevancia es acotada pero interesante: el adaptador es el "lector" entrenado de la tabla principal de ese paper, y permite estudiar si un modelo pequeno de 2B parametros puede igualar a LLMs de frontera en esta tarea de forecasting. Segun la model card, sobre curvas de perdida el adaptador queda a la altura de los mejores LLMs evaluados (Claude Opus 5: 0.648 de skill score con contexto completo), mientras que sobre curvas de recompensa de RL rinde peor que una linea base trivial.

El repositorio contiene tres semillas de entrenamiento (seed1, seed2, seed3) del mismo adaptador LoRA con r = 64 y alpha = 128 sobre las proyecciones de atencion y MLP. El tamano del repo es de 0,5 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-2B) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 2B; r = 64, alpha = 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3.5-2B) |
| Idiomas soportados | no disponible (la tarea es numerica y el prompt esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT; subcarpetas seed1, seed2, seed3) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 aplicado sobre las proyecciones de atencion y MLP de Qwen/Qwen3.5-2B. Se entreno durante 1.000 actualizaciones con batch efectivo de 8 y tasa de aprendizaje 2e-4, sobre 7.724 ejemplos extraidos de 918 ejecuciones publicas de entrenamiento: 216 runs de pretraining de Marin, 366 de RL, 210 de fine-tuning y 70 de preference-tuning leidos de repositorios publicos de Hugging Face, 52 de un estudio de tareas sinteticas y 4 adicionales. Cada ejemplo se observa entre el 5% y el 50% de su presupuesto.

La entrada es un unico mensaje de usuario con el prompt de prediccion del benchmark, una linea `INPUT:` y un objeto JSON con `prefix` (diez puntos `{x, value}` hasta x = 0.2), `query_x`, `reported_configuration`, `axis`, `metric`, `task_semantics` y `answer_scale`. La salida es un JSON con predicciones cuantilicas expresadas como ratio respecto al ultimo valor observado del prefijo, con cuatro decimales. El dataset de entrenamiento esta publicado con hash SHA-256 `5cffa724b990d69af5caaf22b060dde3b677d3c693328e57f45891c40451a465`, y las familias de sweep de test se eliminaron del pool antes del entrenamiento para aislar linaje y familias.

## Capacidades

- Forecasting de curvas de metricas de entrenamiento: predice la evolucion futura a partir del primer 20% de la curva.
- Prediccion cuantilica: genera p10, p50 y p90 para cada punto de consulta, expresados como ratio al ultimo valor del prefijo.
- Condicionamiento en configuracion: incorpora la configuracion numerica del run (`reported_configuration`) como contexto para la prediccion.
- Distincion por metrica y semantica de tarea: el prompt incluye `axis`, `metric` y `task_semantics`, lo que permite adaptar la prediccion al tipo de curva.
- Salida estructurada en JSON, apta para postprocesado automatico.
- No dispone de tool calling, capacidades de agente, vision ni audio documentadas.
- Capacidades multilingues: no documentadas; el formato de entrada y salida esta en ingles.

## Casos de uso

- Planificacion de presupuesto de entrenamiento: dado el primer 20% de una curva de perdida y la configuracion del run, estimar el valor final y los cuantiles para decidir si continuar o abortar un entrenamiento costoso.
- Deteccion temprana de runs anomalos: comparar la prediccion p50 con la curva observada en produccion para identificar desviaciones que sugieran inestabilidad o mal hiperparametrizacion.
- Seleccion de hiperparametros: usar las predicciones condicionadas en `reported_configuration` para priorizar configuraciones antes de lanzar barridos completos.
- Investigacion sobre forecasting de dinamicas de entrenamiento: el adaptador sirve como linea base reproducible (tres semillas, hashes publicados) para comparar LLMs de mayor tamano en esta tarea.
- Analisis de curvas de fine-tuning y preference-tuning: el entrenamiento incluye 210 runs de fine-tuning y 70 de preference-tuning, por lo que puede aplicarse a curvas de esos regimenes.
- Generacion de informes automatizados de experimentos: integrar la salida JSON cuantilica en dashboards o pipelines de MLOps para anotar runs con proyecciones y bandas de incertidumbre.
- Estudio de generalizacion entre familias de sweeps: gracias al aislamiento de familias en test, sirve para medir hasta que punto las predicciones transferibles entre linajes de runs.

## Benchmarks y rendimiento

Skill score `S` en los conjuntos de test de Tea Leaves (0 = repetir el ultimo valor observado, 1 = prediccion perfecta). El lector ve la curva y la configuracion.

| Semilla | Pretraining y fine-tuning (300 runs) | RL (96 runs) | Community runs (232) |
|---|---:|---:|---:|
| seed1 (fila principal del paper) | 0,675 | −0,31 | 0,28 |
| seed2 | 0,633 | −0,20 | 0,30 |
| seed3 | 0,668 | −0,49 | 0,30 |

Referencia comparativa citada en la model card: Claude Opus 5 obtiene 0,648 en curvas de perdida con contexto completo. En curvas de recompensa de RL el adaptador queda por debajo de la linea base trivial (repetir el ultimo valor), y el paper concluye que anadir mas runs publicos no corrige esta limitacion.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,5 GB; el modelo base Qwen3.5-2B en bfloat16 requiere aproximadamente 4-5 GB, y en cuantizacion de 4 bits alrededor de 1,5-2 GB (estimacion a partir del tamano del base, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en bf16; una RTX 4090, A100 o H100 ofrecen margen amplio. El adaptador en si es ligero.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), y previsiblemente en configuraciones de 4 bits con 4-6 GB.
- Opciones de despliegue: el snippet oficial usa `transformers` con `peft` (`PeftModel.from_pretrained`) y `AutoModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con el adaptador.
- Latencia y throughput: no disponibles. La generacion usa `do_sample=False` y `max_new_tokens=512`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeaReader-2B (este) | adaptador LoRA sobre base de 2B | no disponible | Forecasting de curvas de entrenamiento | Apache-2.0 | Hugging Face (3 semillas) |
| Claude Opus 5 (referencia del paper) | no disponible | contexto completo en la evaluacion | Forecasting de curvas de entrenamiento | propietaria | API |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Generacion de texto general | Apache-2.0 (segun la card del adaptador) | Hugging Face |

No se dispone de otros adaptadores publicos equivalentes para esta tarea en la informacion proporcionada. La comparacion con LLMs de frontera se limita al dato de skill score citado en la model card.

## Limitaciones y advertencias

- En curvas de recompensa de RL el skill score es negativo (−0,20 a −0,49): el modelo es peor que repetir el ultimo valor observado. No debe usarse para forecasting de recompensas de RL sin validacion previa.
- El snippet de uso publicado no se ha ejecutado desde el repositorio publico; los numeros del paper provienen del codigo de inferencia usado en entrenamiento. El autor indica que un comando de inferencia en el repositorio de GitHub esta planificado.
- La tarea es muy especifica: no es un modelo de proposito general y no debe esperarse razonamiento, codigo ni conversacion.
- Riesgo de alucinacion en la estructura de salida: al ser un modelo de 2B, puede producir JSON malformado o valores fuera de rango; conviene validar y parsear con tolerancia a errores.
- La entrada exige un formato exacto (prompt del benchmark, linea `INPUT:` y JSON con campos concretos); desviarse de ese formato degrada la prediccion.
- Idiomas: no documentados; el prompt y la salida estan en ingles.
- Licencia Apache-2.0 para los pesos del adaptador; los datos de entrenamiento provienen de runs publicos y quedan sujetos a las condiciones de sus fuentes originales.
- No hay informacion sobre sesgos mas alla de los derivados de la distribucion de runs de entrenamiento (predominio de pretraining de Marin y runs publicos de Hugging Face).
- El modelo base debe fijarse a la revision `15852e8c16360a2fea060d615a32b45270f8a8fc` para reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xinranz3/TeaReader-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/xinranz3/read-tea-leaves
- Codigo y benchmark: https://github.com/colinzhaoust/read-tea-leaves
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
