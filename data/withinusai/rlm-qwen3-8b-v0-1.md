# WithinUsAI/rlm-qwen3-8b-v0.1

## Resumen

RLM-Qwen3-8B-v0.1 es un ajuste fino (post-entrenamiento) del modelo Qwen3-8B desarrollado por WithinUsAI, derivado de los experimentos descritos en el paper "Recursive Language Models" (arXiv:2512.24601). El modelo no es un modelo base generalista, sino un artefacto experimental diseñado para funcionar dentro de un entorno o scaffold específico (el del repositorio RLM de Alex Zhang) y con un system prompt fijo. Su propósito es servir como componente de un sistema de "modelos de lenguaje recursivos", donde el modelo opera sobre trayectorias generadas durante el entrenamiento y delega o estructura el razonamiento de forma recursiva.

Arquitectónicamente hereda todo de Qwen3-8B: un transformer denso de aproximadamente 8.190 millones de parámetros, con los pesos almacenados en formato safetensors (16,4 GB en el repositorio). El idioma declarado es únicamente inglés y la licencia es MIT, lo que permite uso comercial sin restricciones significativas, aunque la naturaleza experimental del ajuste limita su aplicabilidad fuera del entorno previsto.

Es relevante ahora porque representa una de las primeras materializaciones públicas de la línea de investigación sobre modelos recursivos, un enfoque que busca superar las limitaciones de las ventanas de contexto fijas mediante descomposición y recursión explícita. No obstante, al ser un modelo v0.1 con cero descargas y cero likes en el momento de la ficha, debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.190 millones de parámetros. El ajuste fino se realizó sobre trayectorias producidas por el propio sistema RLM utilizando un system prompt fijo, lo que significa que el modelo aprendió a comportarse dentro de un scaffold concreto y no como un chat model genérico. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica "post-trained" sobre trayectorias.

La innovación técnica destacable no reside en el modelo en sí, sino en el marco conceptual: los "Recursive Language Models" plantean que el modelo puede invocar recursivamente sub-procesos o descomponer tareas en llamadas anidadas, superando los límites de una ventana de contexto plana. El modelo, por tanto, está entrenado para operar como el "cerebro" de ese bucle recursivo, y su rendimiento depende críticamente del scaffold y del prompt de sistema con los que fue entrenado.

## Capacidades

- Generación de texto y razonamiento dentro del entorno RLM, con un system prompt fijo.
- Ejecución de trayectorias recursivas: descomposición de tareas y llamadas anidadas según el scaffold del repositorio RLM.
- Capacidad de código y matemáticas heredada de Qwen3-8B, aunque no re-entrenada explícitamente para estos fines en esta versión.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes multi-paso: sí, en la medida en que el propio diseño RLM es un bucle agéntico recursivo.
- Capacidades multilingües: limitadas al inglés según la model card, aunque Qwen3-8B subyacente es multilingüe.
- Modo "thinking": no confirmado para esta versión; Qwen3-8B base dispone de modos de razonamiento, pero no se especifica si se conservan tras el ajuste.

## Casos de uso

- Investigación en modelos recursivos: reproducción de los experimentos del paper arXiv:2512.24601 usando el scaffold oficial del repositorio RLM, comparando trayectorias y comportamiento del modelo ajustado frente al base.
- Experimentos de descomposición de tareas largas: el modelo puede operar sobre problemas que exceden una ventana de contexto plana dividiéndolos en sub-llamadas recursivas gestionadas por el scaffold.
- Evaluación de scaffolds agénticos: sirve como sujeto de prueba para medir cómo un ajuste fino sobre trayectorias afecta la estabilidad y calidad de un bucle recursivo.
- Generación de datos sintéticos de trayectorias: al estar entrenado sobre trayectorias RLM, puede usarse para producir nuevas trayectorias que alimenten experimentos posteriores de destilación o ajuste.
- Prototipado de pipelines de razonamiento estructurado: integrado con vLLM y el código de inferencia oficial, permite montar un servicio de razonamiento recursivo para pruebas internas.
- Docencia y divulgación: ilustra de forma tangible cómo se entrena y despliega un modelo especializado en un paradigma emergente, útil en cursos de IA avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16; RTX 4090 (24 GB) para FP16 ajustado o cuantización 8 bits; RTX 3090/4080 para cuantizaciones menores.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con FP16 y en GPUs de 12-16 GB con cuantización, siempre que el scaffold RLM no añada sobrecarga significativa.
- Opciones de despliegue: vLLM es la opción recomendada por el autor junto con el código de inferencia del repositorio RLM; llama.cpp, Ollama o TGI no están confirmados como compatibles con el scaffold.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RLM-Qwen3-8B-v0.1 | 8,19 B | no disponible | MIT | Hugging Face | Ajuste experimental sobre trayectorias RLM |
| Qwen/Qwen3-8B | 8,19 B | no disponible en esta ficha | Apache 2.0 (según el modelo base) | Hugging Face | Modelo base generalista, multilingüe |
| Dentro de la misma categoría (modelos de 8B ajustados para agentes) | ~7-9 B | variable | variable | Hugging Face | No se dispone de datos comparativos de rendimiento |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dependencia crítica del scaffold: el modelo asume el entorno y el system prompt fijos del repositorio RLM; fuera de ese contexto su comportamiento puede degradarse de forma impredecible.
- Idiomas: declarado solo para inglés; el multilingüismo heredado de Qwen3-8B no está garantizado tras el ajuste.
- Riesgo de alucinación: no evaluado; al ser un ajuste sobre trayectorias sintéticas, puede reproducir patrones del scaffold incluso cuando no son apropiados.
- Sesgos: no documentados por el autor; se heredan los sesgos del modelo base y de las trayectorias de entrenamiento.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia que debe verificarse por separado.
- Madurez: versión v0.1 con cero descargas y cero likes; sin validación comunitaria ni informes de terceros.
- Producción: no recomendado como modelo generalista; adecuado solo para investigación y experimentación controlada.
- Contexto: la longitud de contexto efectiva no está confirmada y puede estar limitada por el diseño del scaffold más que por el propio modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithinUsAI/rlm-qwen3-8b-v0.1
- Paper "Recursive Language Models": https://arxiv.org/abs/2512.24601
- Repositorio de inferencia RLM: https://github.com/alexzhang13/rlm
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
