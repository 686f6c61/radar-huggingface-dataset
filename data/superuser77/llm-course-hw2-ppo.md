# superuser77/llm-course-hw2-ppo

## Resumen

`superuser77/llm-course-hw2-ppo` es un ajuste fino del modelo `HuggingFaceTB/SmolLM2-135M-Instruct` realizado por el usuario `superuser77` como parte de una tarea academica de un curso de LLM. El modelo aplica aprendizaje por refuerzo con optimizacion de politica proximal (PPO) sobre un modelo base de 134.515.584 parametros, con el objetivo declarado de alinear las respuestas del modelo con preferencias humanas recogidas en el dataset `HumanLLMs/Human-Like-DPO-Dataset`. Se trata, por tanto, de un artefacto educativo y no de un modelo pensado para produccion.

La relevancia de esta ficha es limitada y debe enmarcarse en ese contexto: el autor documenta en la model card que, en la ultima ejecucion, las respuestas antes y despues del entrenamiento fueron identicas y que no se observo una mejora apreciable en el ejemplo de prueba. El modelo conserva repeticiones en el texto generado y no presenta datos de benchmarks publicos. Su interes es fundamentalmente didactico: ilustra el flujo completo de un pipeline PPO con TRL 0.19.1, incluyendo modelo de recompensa, modelo de valor, congelacion de politica original y penalizacion KL.

El modelo esta etiquetado unicamente para ingles, con licencia no disponible en la informacion proporcionada, y se distribuye en formato safetensors compatible con `transformers` y con text-generation-inference. No debe confundirse con un modelo alineado listo para uso: es una instantanea de un experimento de aprendizaje por refuerzo a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Libreria | transformers |
| Tamano del repositorio | 1.1 GB |
| Metodo de alineacion | PPO (TRL 0.19.1) |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Modelo de recompensa | superuser77/llm-course-hw2-reward-model |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre esa base, el autor aplico PPO con TRL 0.19.1 manteniendo congeladas tanto la politica original como el modelo de recompensa, y anadiendo un modelo de valor cargado desde `superuser77/llm-course-hw2-reward-model`. El tokenizador empleado es el de `HuggingFaceTB/SmolLM-135M-Instruct`, con un token de padding anadido segun la plantilla de la tarea.

Los hiperparametros documentados en la version publicada son: 512 episodios, 32 pasos de entrenamiento, learning rate de 5e-7, tamano de batch 2, acumulacion de gradiente 8, una epoca de PPO por lote de respuestas, coeficiente de penalizacion por desviacion de la politica original (KL) de 0.2 y longitud maxima de respuesta de 64 tokens. El entrenamiento se ejecuto en una GPU T4 con precision mixta. El autor relata que en el primer intento el modelo terminaba las respuestas de inmediato y que el modelo de recompensa puntuaba una respuesta vacia por encima de la del modelo original; tras restaurar el formato de prompts de la plantilla, reducir el learning rate y reforzar la penalizacion KL, el problema del respuesta vacia se resolvio en ese ejemplo concreto.

El resultado final, segun la propia model card, es que la respuesta antes y despues del entrenamiento coincide en el ejemplo mostrado y no hay mejora apreciable. El autor reporta un log-prob medio por token de respuesta de -1.837 sobre 100 ejemplos de la distribucion de prompts de entrenamiento y de -2.488 sobre 100 ejemplos de `databricks/databricks-dolly-15k`, evaluando respuestas humanas aunque el PPO se entreno sobre generaciones propias, con prompt y respuesta truncados a 256 tokens cada uno.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de SmolLM2-135M-Instruct.
- Respuestas a prompts de formato conversacional (chat template del modelo base).
- Generacion de texto corto: el entrenamiento limita las respuestas a 64 tokens, aunque la generacion en inferencia puede extenderse mas alla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", vision ni audio.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No hay evidencia en la model card de mejora en calidad, alineacion o reduccion de repeticiones respecto al modelo base.

## Casos de uso

- Estudio de pipelines PPO con TRL: el modelo sirve como referencia reproducible de como se configura un entrenamiento PPO con modelo de recompensa, modelo de valor, politica congelada y penalizacion KL, util en cursos y tutoriales.
- Comparacion didactica de metodos de alineacion: junto con las variantes DPO y reward model del mismo autor, permite contrastar en clase las diferencias entre PPO y DPO sobre una misma base de 135M.
- Analisis de fallos de alineacion: el caso documentado de respuesta vacia puntuada alto por el modelo de recompensa es un ejemplo practico de reward hacking y de la importancia del control de formato de prompts.
- Experimentos de investigacion sobre repeticion en modelos pequenos: dado que el autor reporta repeticiones persistentes, el modelo puede usarse para estudiar estrategias de mitigacion (penalizacion de repeticion, decodificacion, ajuste de temperatura).
- Evaluacion de infraestructura de inferencia ligera: al ser un modelo de 135M en safetensors, permite probar integraciones con text-generation-inference y transformers en entornos con recursos muy limitados.
- Docencia sobre evaluacion de modelos: los log-probs reportados sobre dos conjuntos distintos ilustran como medir deriva respecto a respuestas humanas con metricas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta log-prob medio por token de respuesta:

| Metrica | Valor | Conjunto |
|---|---|---|
| Log-prob medio por token | -1.837 | 100 ejemplos de prompts de entrenamiento |
| Log-prob medio por token | -2.488 | 100 ejemplos de databricks/databricks-dolly-15k |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion (win rate, MT-Bench u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,3 GB solo para pesos (134,5M parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU consumer.
- VRAM estimada en fp32: aproximadamente 0,54 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entreno en una NVIDIA T4.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU para inferencia a baja velocidad.
- Opciones de despliegue: `transformers`, text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo | Disponibilidad |
|---|---|---|---|---|---|
| superuser77/llm-course-hw2-ppo | 134,5M | no disponible | no disponible | PPO sobre SmolLM2-135M-Instruct | HuggingFace |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | no disponible en esta ficha | SFT + alineacion del autor original | HuggingFace |
| superuser77/llm-course-hw2-dpo | no disponible | no disponible | no disponible | DPO sobre la misma base | HuggingFace |
| superuser77/llm-course-hw2-reward-model | no disponible | no disponible | no disponible | Modelo de recompensa del mismo pipeline | HuggingFace |

La comparacion directa con modelos de proposito general de 135M no aporta senal de rendimiento porque no hay benchmarks publicados para este ajuste. La alternativa mas informativa es el modelo base, del que este checkpoint deriva y respecto al cual el autor no reporta mejora medible.

## Limitaciones y advertencias

- El autor declara explicitamente que la respuesta antes y despues del entrenamiento coincide en el ejemplo mostrado y que no hay mejora apreciable.
- Persisten repeticiones en el texto generado, segun la propia model card.
- Se documenta un fallo previo de reward hacking: el modelo de recompensa puntuaba una respuesta vacia por encima de la del modelo original.
- Entrenamiento de muy baja escala: 512 episodios, 32 pasos, batch 2, respuestas de hasta 64 tokens; insuficiente para un alineamiento robusto.
- Solo ingles; sin soporte declarado de otros idiomas.
- Licencia no disponible: no puede asumirse uso comercial permitido sin consultar al autor y a la licencia del modelo base.
- Riesgo de alucinacion y de respuestas incoherentes propio de un modelo de 135M, agravado por un ajuste PPO de corta duracion.
- No es adecuado para produccion, atencion al cliente ni tareas que requieran fiabilidad.
- No hay datos de contexto maximo, cuantizaciones ni benchmarks; cualquier uso que dependa de esos parametros requiere verificacion empirica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superuser77/llm-course-hw2-ppo
- Variante DPO del mismo autor: https://huggingface.co/superuser77/llm-course-hw2-dpo
- Modelo de recompensa del pipeline: https://huggingface.co/superuser77/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de prompts: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset de evaluacion: https://huggingface.co/datasets/databricks/databricks-dolly-15k
