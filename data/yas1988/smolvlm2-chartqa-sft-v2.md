# yas1988/smolvlm2-chartqa-sft-v2

## Resumen

`yas1988/smolvlm2-chartqa-sft-v2` es un adaptador LoRA sobre el modelo vision-lenguaje `HuggingFaceTB/SmolVLM2-2.2B-Instruct`, desarrollado por el usuario yas1988 como entrega del curso smol de Hugging Face (Unidad 3, modelos vision-lenguaje). El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con TRL sobre el conjunto de datos `HuggingFaceM4/ChartQA` para responder preguntas sobre graficos e imagenes de tipo chart. No es un modelo completo, sino un conjunto de pesos PEFT (formato safetensors) que debe cargarse junto al modelo base.

El modelo base SmolVLM2-2.2B-Instruct es un transformer vision-lenguaje de aproximadamente 2.2 mil millones de parametros, disenado para tareas image-text-to-text en entornos con recursos limitados. Este adaptador anade una especializacion concreta en interpretacion de graficos, un dominio donde los modelos pequenos suelen fallar por la densidad visual y la necesidad de razonamiento numerico sobre la imagen.

El interes del adaptador es doble: por un lado, demuestra un flujo de trabajo reproducible de fine-tuning LoRA en una unica GPU T4 de Colab en poco mas de una hora; por otro, documenta explicitamente un error comun en el formateo de datos (calcular la perdida sobre todos los tokens, incluidos prompt e imagen) y su correccion mediante formato prompt/completion con `completion_only_loss=True`. La mejora medida es modesta: 49.3% a 56.7% en una evaluacion propia de 150 preguntas del split de test de ChartQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje SmolVLM2-2.2B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~2.2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolVLM2-2.2B-Instruct, un modelo vision-lenguaje del que la model card no detalla la arquitectura interna (composicion exacta del encoder visual, atencion, etc.). El adaptador LoRA se configura con r=16, alpha=32, dropout 0.05 y se aplica a las proyecciones q, k, v, o, gate, up y down del modelo base. El entrenamiento se realizo con `SFTTrainer` de TRL en fp16 sobre una unica GPU Colab T4, durante 1 epoch (63 pasos), con learning rate 2e-4, warmup de 6 pasos, batch size 1 y acumulacion de gradiente 16.

Los datos de entrenamiento son los primeros 1.000 ejemplos del split `train` de `HuggingFaceM4/ChartQA`, en formato prompt/completion con `completion_only_loss=True`, de modo que la perdida se calcula unicamente sobre los tokens de respuesta. La perdida de entrenamiento paso de 0.57 a aproximadamente 0.17, con una precision media de token de 0.94. La model card documenta un primer intento fallido (`yas1988/smolvlm2-chartqa-sft`) en el que se uso formato de mensajes de chat, con perdida de 18 y sin mejora observable (10/38 aciertos antes y despues); el cambio a perdida solo sobre la respuesta corrigio el problema.

## Capacidades

- Respuesta a preguntas sobre imagenes de graficos (ChartQA): extraccion de valores, comparaciones y tendencias a partir de la imagen.
- Generacion de texto e image-text-to-text heredada del modelo base SmolVLM2-2.2B-Instruct.
- Conversacion multi-turno en formato chat (capacidad del modelo base; el adaptador no la altera).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el entrenamiento se realizo sobre ChartQA, mayoritariamente en ingles.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del modelo base; sin thinking mode ni audio documentados.

## Casos de uso

- Extraccion de valores en paneles de control: dado un grafico de barras o lineas, el adaptador puede responder preguntas del tipo "cual es el valor de la serie X en el periodo Y", util para prototipos de analitica automatica de informes.
- Respuesta a preguntas sobre figuras de papers: en un pipeline de lectura de documentos cientificos, el modelo puede responder consultas sobre los graficos embebidos, aunque con la cautela de que la mejora medida es modesta.
- Enriquecimiento de bases de conocimiento con datos de graficos: procesar lotes de imagenes de ChartQA o similares para generar pares pregunta-respuesta que alimenten un indice de busqueda.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 2.2B, puede ejecutarse en una GPU consumer para validar ideas de interpretacion de graficos antes de invertir en modelos mayores.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como referencia reproducible de un flujo SFT con LoRA y perdida solo sobre respuesta, documentado paso a paso en la model card.
- Docencia y formacion: ejemplo practico del curso smol de Hugging Face para ilustrar el impacto del formateo de datos en el entrenamiento de modelos vision-lenguaje.
- Asistencia en la revision de informes financieros o de negocio: responder preguntas sobre graficos de evolucion, siempre con validacion humana dado el riesgo de error en lectura de charts.

## Benchmarks y rendimiento

Evaluacion propia del autor sobre 150 preguntas del split `test` de ChartQA, 0-shot, con el mismo prompt para ambos modelos. Criterio de coincidencia relajado: se ignoran mayusculas, punto final y simbolo de porcentaje, y se aceptan numeros con diferencia inferior al 5%. No es la puntuacion oficial de ChartQA.

| Modelo | Aciertos | Precision |
|---|---|---|
| SmolVLM2-2.2B-Instruct base (sin adaptador) | 74 / 150 | 49.3% |
| Con este adaptador | 85 / 150 | 56.7% |

El autor advierte que, con 150 preguntas, el margen de error es de aproximadamente +/-4 puntos por puntuacion, por lo que la mejora es modesta. No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 2.2B en fp16 requiere del orden de 4-5 GB solo para pesos, mas el encoder visual y las activaciones, por lo que se recomienda al menos 8-12 GB para un uso comodo. Cifra orientativa, no confirmada en la model card.
- GPU recomendadas: el entrenamiento se realizo en una unica T4 de Colab (16 GB), lo que indica que la inferencia cabe en GPUs de gama media; se puede usar tambien A100, H100 o RTX 4090 para mayor throughput.
- GPU consumer: si, cabe en tarjetas consumer con suficiente VRAM (RTX 3090, RTX 4090, etc.), aunque no se especifican requisitos exactos.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`AutoModelForImageTextToText` y `PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ChartQA (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yas1988/smolvlm2-chartqa-sft-v2 (adaptador) | ~2.2B (base) | no disponible | 56.7% (85/150) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct (base) | ~2.2B | no disponible | 49.3% (74/150) | Apache 2.0 | Hugging Face |
| Otros adaptadores ChartQA sobre SmolVLM2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks oficiales ni de comparativas con otros modelos de la misma categoria en la informacion proporcionada; la unica comparacion documentada es contra el modelo base.

## Limitaciones y advertencias

- El adaptador se entreno sobre solo 1.000 ejemplos durante 1 epoch, por lo que la mejora es modesta y el margen estadistico de la evaluacion es amplio (+/-4 puntos con 150 preguntas).
- El modelo base es pequeno (2.2B); puede leer mal los graficos, por lo que no debe usarse en contextos donde una respuesta incorrecta tenga consecuencias graves.
- La evaluacion es propia del autor y no sigue el protocolo oficial de ChartQA, por lo que los numeros no son directamente comparables con la literatura.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre ChartQA, hereda los sesgos de ese dataset y del modelo base.
- Riesgo de alucinacion: no cuantificado, pero relevante en tareas de lectura de graficos donde el modelo puede inventar valores.
- Limitaciones de contexto o idioma: no documentadas; el entrenamiento es en ingles y no se especifica la longitud de contexto del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base SmolVLM2-2.2B-Instruct.
- Para produccion: requiere cargar el modelo base completo ademas del adaptador; no se documentan optimizaciones de despliegue (cuantizacion, servidores de inferencia) para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yas1988/smolvlm2-chartqa-sft-v2
- Arbol de ficheros del repositorio: https://huggingface.co/yas1988/smolvlm2-chartqa-sft-v2/tree/main
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Dataset ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Primer intento (adaptador descartado): https://huggingface.co/yas1988/smolvlm2-chartqa-sft
