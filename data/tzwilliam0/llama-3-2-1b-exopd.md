# tzwilliam0/Llama-3.2-1B-ExOPD

## Resumen

Llama-3.2-1B-ExOPD es un checkpoint de estudiante de 1.498.482.688 parametros (~1,5 mil millones) obtenido mediante destilacion on-policy con la tecnica ExOPD, descrita por el autor tzwilliam0 en un articulo sobre destilacion on-policy con conciencia de recompensa. El modelo parte de `meta-llama/Llama-3.2-1B-Instruct` como inicializacion y utiliza `meta-llama/Llama-3.2-3B-Instruct` congelado como profesor durante el entrenamiento. No es un modelo de proposito general nuevo, sino un artefacto de investigacion que documenta el resultado de un protocolo experimental concreto (configuracion E3).

El problema que aborda es la mejora de un estudiante pequeno (1B) mediante senales de un profesor mayor (3B) usando datos generados on-policy y un esquema de seleccion de checkpoint basado en un reward model externo. El entrenamiento se realizo sobre 9000 prompts de UltraChat, con 50 pasos, 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6 y longitud maxima de respuesta de 2048 tokens. El checkpoint publicado corresponde al paso 30, seleccionado sobre un conjunto de validacion de 1000 prompts puntuados por `Skywork-Reward-V2-Llama-3.2-3B`.

Es relevante ahora porque los resultados publicados muestran que el estudiante destilado rinde peor que el estudiante sin entrenar en las tres metricas reportadas (AlpacaEval, WritingBench y WildBench) bajo el reward model de evaluacion, lo que convierte a este checkpoint en un caso de estudio util sobre los limites de la destilacion on-policy en modelos de 1B y sobre la discrepancia entre reward models de seleccion y de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), derivada de Llama-3.2-1B-Instruct |
| Parametros totales | 1.498.482.688 (~1,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.2, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base Llama 3.2) |
| Licencia | llama3.2 (Llama 3.2 Community License, con Acceptable Use Policy) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 3.2, inicializado desde `meta-llama/Llama-3.2-1B-Instruct`. El entrenamiento emplea destilacion on-policy: se generan rollouts del estudiante sobre prompts de UltraChat y se optimiza con la senal del profesor congelado `meta-llama/Llama-3.2-3B-Instruct`, usando el metodo ExOPD en la configuracion E3 del articulo del autor. La configuracion concreta es de 50 pasos, 128 prompts por paso, 8 muestras por prompt, learning rate 1e-6, longitud maxima de respuesta 2048 y semilla de rollout 0. Segun la model card, los cinco metodos comparados en este setting comparten hiperparametros, datos, semilla de datos y semillas de rollout pareadas, sin ajuste por metodo.

La innovacion metodologica destacable no esta en la arquitectura sino en el protocolo: seleccion de checkpoint sobre un conjunto held-out de 1000 prompts puntuados por `Skywork-Reward-V2-Llama-3.2-3B`, y evaluacion con un reward model distinto, `Skywork-Reward-V2-Llama-3.1-8B`, para evitar fuga de seleccion. Los pasos candidatos fueron 10, 20, 30, 40 y 50; el publicado es el 30. El repositorio incluye `training_logs/` con `selected.json` (puntuaciones de todos los pasos candidatos), `metrics.jsonl` (dinamica de entrenamiento por paso) y `launch.json` (configuracion completa de hiperparametros y switches). No se documentan tecnicas de decodificacion especulativa, atencion lineal ni modulos adicionales.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-3.2-1B-Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1B parametros.
- Generacion de codigo y matematicas a nivel de modelo pequeno; no se reportan evaluaciones especificas en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no ha sido entrenado especificamente para ello segun la model card.
- Capacidades multilingues: no declaradas; depende de lo heredado del modelo base.
- Modo thinking, vision o audio: no disponible; el pipeline es text-generation y no se mencionan modalidades adicionales.
- Capacidad de servir como checkpoint de investigacion reproducible: los logs de entrenamiento permiten replicar el analisis del paso seleccionado.

## Casos de uso

- Investigacion sobre destilacion on-policy: el checkpoint permite reproducir y auditar el protocolo ExOPD en la configuracion E3, comparando el paso 30 con los pasos 10, 20, 40 y 50 recogidos en `training_logs/selected.json`. Es adecuado porque el repo incluye la traza completa de seleccion y metricas por paso.
- Estudio de degradacion por destilacion en modelos pequenos: los resultados publicados muestran una caida frente al estudiante sin entrenar (12.015 frente a 12.991 en AlpacaEval; 3.106 frente a 5.043 en WritingBench; 2.575 frente a 4.295 en WildBench), lo que lo convierte en un caso controlado para analizar sobreajuste al reward model de seleccion.
- Analisis de discrepancia entre reward models: al usar `Skywork-Reward-V2-Llama-3.2-3B` para seleccion y `Skywork-Reward-V2-Llama-3.1-8B` para evaluacion, el checkpoint sirve para estudiar como la eleccion del reward model afecta a las conclusiones sobre calidad.
- Baseline en experimentos de destilacion: util como referencia negativa o de control en comparaciones con otros metodos de destilacion sobre el mismo estudiante de 1B y los mismos datos de UltraChat.
- Prototipado de pipelines de generacion de texto con transformers: al ser un checkpoint compatible con `text-generation-inference` y `endpoints_compatible`, puede desplegarse en entornos de prueba para validar integraciones tecnicas, no para calidad de producto.
- Docencia y formacion: sirve para ilustrar en un curso o taller el ciclo completo de destilacion on-policy, seleccion de checkpoint y evaluacion con reward models externos, usando los logs incluidos como material practico.

## Benchmarks y rendimiento

Resultados publicados en la model card. La metrica es la puntuacion escalar del reward model externo `Skywork-Reward-V2-Llama-3.1-8B`, con 8 muestras por prompt promediadas por prompt y luego sobre prompts; media sobre 3 semillas de rollout con desviacion estandar entre semillas. El repositorio contiene el checkpoint de la semilla 0.

| Benchmark | Prompts | ExOPD (paso 30) | Estudiante 1B sin entrenar | Profesor 3B |
|---|---|---|---|---|
| AlpacaEval | 805 | 12.015 ± 0.052 | 12.991 | 21.085 |
| WritingBench | 1000 | 3.106 ± 0.029 | 5.043 | 12.992 |
| WildBench | 1024 | 2.575 ± 0.100 | 4.295 | 14.019 |

Decodificacion de evaluacion: AlpacaEval y WildBench a temperatura 0.7 y top_p 0.95; WritingBench a temperatura 0.7, top_p 0.8 y top_k 20. Identica para todos los metodos y para ambos modelos de referencia. No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- Cuantizacion a 8 bits: aproximadamente 1,5-2 GB de pesos; a 4 bits: aproximadamente 0,8-1 GB de pesos. No se documentan cuantizaciones oficiales en el repo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para fp16; para cuantizacion 4 bits basta con 4-6 GB.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas con 6 GB o mas en cuantizacion, y con 8 GB o mas en fp16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI mas alla de los tags, por lo que debe validarse antes de usarlos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AlpacaEval / WritingBench / WildBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-ExOPD (este) | ~1,5 B | no disponible | 12.015 / 3.106 / 2.575 | llama3.2 | Hugging Face |
| Llama-3.2-1B-Instruct (sin entrenar) | ~1,5 B | no disponible | 12.991 / 5.043 / 4.295 | llama3.2 | Hugging Face |
| Llama-3.2-3B-Instruct (profesor) | ~3 B | no disponible | 21.085 / 12.992 / 14.019 | llama3.2 | Hugging Face |

Las cifras de rendimiento corresponden al reward model `Skywork-Reward-V2-Llama-3.1-8B` bajo el protocolo descrito en la model card y no son directamente comparables con puntuaciones de benchmarks academicos. No se dispone de informacion sobre otros modelos comparables de la misma categoria (destilados de 1B) en la informacion proporcionada.

## Limitaciones y advertencias

- El estudiante destilado rinde peor que el estudiante sin entrenar en las tres metricas reportadas, lo que sugiere sobreajuste al reward model de seleccion o una senal de destilacion inadecuada en esta configuracion.
- La seleccion de checkpoint se hizo con un reward model (`Skywork-Reward-V2-Llama-3.2-3B`) distinto del de evaluacion (`Skywork-Reward-V2-Llama-3.1-8B`); aunque mitiga la fuga directa, ambos pertenecen a la misma familia y pueden compartir sesgos.
- Riesgo de alucinacion: inherente a los modelos de 1B parametros y no cuantificado en la model card; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los de UltraChat como dataset de prompts.
- Limitaciones de contexto e idioma: no declaradas; deben asumirse las del modelo base Llama 3.2, sin confirmacion en la model card.
- Restricciones de licencia: uso sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy; es un modelo derivado de Llama 3.2, por lo que se aplican las clausulas de atribucion y las restricciones de uso comercial de dicha licencia.
- Es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de uso en produccion.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en entornos con memoria limitada requiere convertir los pesos y validar la calidad resultante.
- El modelo no ha sido entrenado especificamente para tool calling ni para uso como agente; no debe asumirse soporte fiable de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tzwilliam0/Llama-3.2-1B-ExOPD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor utilizado en el entrenamiento: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Reward model de seleccion: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-3B (referenciado en la model card; URL no verificada en la informacion proporcionada)
- Reward model de evaluacion: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B (referenciado en la model card; URL no verificada en la informacion proporcionada)
- Articulo del autor sobre destilacion on-policy con conciencia de recompensa: no disponible en la informacion proporcionada
- Repositorio de codigo del metodo ExOPD: no disponible en la informacion proporcionada
