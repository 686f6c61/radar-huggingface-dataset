# ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5` es un adaptador LoRA (librería PEFT) desarrollado por ssurface que se monta sobre el modelo base `allenai/Olmo-3-7B-Think`. Su propósito es entrenar al modelo base para razonar en un "dialecto" de chain-of-thought comprimido al nivel L5, es decir, una única expresión colapsada en lugar de cadenas de razonamiento extensas. Está especializado en problemas matemáticos y se ha evaluado en el conjunto MATH-500, alcanzando una precisión del 63,2% en modo greedy, sin ejemplos previos ni self-consistency.

El adaptador se obtuvo mediante fine-tuning supervisado (SFT) por destilación, utilizando problemas de entrenamiento de MATH reexpresados a nivel L5 por un modelo profesor. El corpus empleado es la versión "unfiltered", es decir, sin filtrado adicional. El modelo está pensado para investigación sobre compresión de razonamiento y para aplicaciones donde se requiera resolver problemas matemáticos con una salida extremadamente concisa.

La relevancia actual radica en la exploración de la compresión de cadenas de razonamiento, un área que busca reducir el coste computacional de la inferencia sin sacrificar precisión. Este adaptador demuestra que es posible mantener un rendimiento razonable (63,2% en MATH-500) con un formato de salida mucho más breve que el CoT tradicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32, dropout=0.05) sobre `allenai/Olmo-3-7B-Think`; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 7B segun su nombre) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso max sequence de 1024 tokens, pero no se indica el contexto maximo del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base, que puede cuantizarse, pero no se especifican formatos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de 7.000 millones de parametros (según el nombre) del que no se proporcionan detalles arquitectónicos en la informacion disponible. El adaptador LoRA tiene rango 16, alpha 32 y dropout 0.05, y se entrena mediante SFT (destilacion) con problemas de MATH reexpresados a nivel L5 (compresion extrema de chain-of-thought) por un modelo profesor. El corpus es la version "unfiltered" de estos datos.

El entrenamiento se realizó con 3 épocas, tasa de aprendizaje 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64 (16 x 4 acumulacion de gradientes), longitud maxima de secuencia de 1024 tokens, precision bf16 y una unica GPU NVIDIA A100 de 80GB. La perdida se calcula únicamente sobre la parte de completacion, con las longitudes de prompt precomputadas en tiempo de carga para evitar el problema del collator por busqueda de patrones, que en versiones anteriores no enmascaraba correctamente y permitia que el sesgo de tool-calling del modelo base se filtrara en las cadenas.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido a nivel L5 (una unica expresion colapsada).
- Generacion de texto en ingles.
- No soporta tool calling, ni function calling, ni agentes.
- No tiene capacidades multimodales (ni vision, ni audio).
- No incluye modo thinking explicito; el "think" del nombre del modelo base se refiere a que el base fue entrenado para generar razonamiento, pero el adaptador lo comprime.

## Casos de uso

- Resolucion de problemas matematicos con salida extremadamente concisa: el modelo genera directamente la respuesta final (formato `\boxed{}`) sin pasos intermedios, lo que reduce el coste de generacion en entornos donde el razonamiento extenso no es necesario.
- Evaluacion de compresion de chain-of-thought: permite estudiar como afecta la compresion del razonamiento a la precision en tareas matematicas, comparando con niveles L1 o L3.
- Generacion de datos sinteticos para entrenar otros modelos: se puede usar para producir ejemplos de problemas resueltos en formato comprimido, util para destilar modelos mas pequeños.
- Benchmarking de razonamiento matematico en escenarios de baja latencia: al generar menos tokens, la inferencia es mas rapida, adecuado para aplicaciones en tiempo real donde se requiere una respuesta numerica inmediata.
- Investigacion sobre dialectos de razonamiento: el modelo sirve como referencia para estudiar como varian las respuestas al cambiar el nivel de compresion del CoT, con aplicaciones en interpretabilidad y eficiencia.
- Integracion en pipelines de evaluacion de modelos de matematicas: puede utilizarse como un "solucionador rapido" en sistemas de autoevaluacion que necesiten respuestas exactas sin pasos intermedios.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | MATH-500 (test) | Accuracy (exact match) | 63.2% |

Este resultado se obtuvo con decodificacion greedy, en una sola vuelta, sin ejemplos previos ni self-consistency, y se evaluó con un grader consciente de LaTeX que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` == `14/3`). No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B) en memoria.
- VRAM estimada: para inferencia en bf16 se necesitan aproximadamente 14-16 GB (modelo base + adaptador); con cuantizacion 4-bit del modelo base podria reducirse a unos 6-8 GB, aunque no se especifican formatos de cuantizacion oficiales.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 (24GB) o similar con al menos 16GB de VRAM para precision completa.
- Es posible ejecutarlo en GPUs consumer con 8GB si se cuantiza el modelo base, pero no se proporciona una configuracion oficial.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`, y servir mediante vLLM o TGI si se fusiona el adaptador con el modelo base. Tambien es compatible con llama.cpp si se exporta el modelo fusionado a GGUF, aunque no se indica soporte oficial.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor no incluye comparaciones con otros adaptadores o modelos de razonamiento matematico. Se recomienda consultar el modelo base `allenai/Olmo-3-7B-Think` y otros adaptadores de la misma familia (por ejemplo, versiones con niveles L1 o L3) para establecer comparaciones, pero esos datos no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con formato de respuesta `\boxed{}`; no es adecuado para otras tareas de razonamiento general.
- La precision disminuye con la dificultad del problema, especialmente en los niveles de compresion mas altos (L5).
- El resultado de 63.2% proviene de una unica semilla (a menos que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de aproximadamente ±4.4 puntos en n=500).
- El corpus de entrenamiento es la version "unfiltered", lo que puede implicar ruido o ejemplos de baja calidad que no han sido filtrados.
- No se garantiza la ausencia de sesgos en los datos de MATH; el modelo puede reflejar sesgos presentes en el conjunto de entrenamiento original.
- Riesgo de alucinacion en problemas matematicos complejos: al comprimir el razonamiento, el modelo puede producir respuestas incorrectas sin pasos intermedios que permitan verificar el proceso.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `allenai/Olmo-3-7B-Think` puede tener sus propias restricciones; se recomienda revisar su licencia antes de usar en produccion.

## Enlaces

- [HuggingFace - ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5)
- [Modelo base - allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think) (no se proporciona enlace directo, pero se menciona en la model card)
- [Dataset - HuggingFaceH4/MATH-500](https://huggingface.co/datasets/HuggingFaceH4/MATH-500) (referenciado en la model card)
