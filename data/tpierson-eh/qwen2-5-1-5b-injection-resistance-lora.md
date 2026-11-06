# tpierson-eh/qwen2.5-1.5b-injection-resistance-lora

## Resumen

Este adaptador LoRA es un artefacto de investigación desarrollado por el usuario de Hugging Face `tpierson-eh` sobre el modelo base Qwen2.5-1.5B-Instruct. Su propósito no es ofrecer un producto listo para producción, sino medir empíricamente si un ajuste fino ligero puede enseñar a un modelo a resistir ataques de inyección de prompt, es decir, instrucciones maliciosas embebidas en texto que el modelo procesa como datos (salidas de herramientas, documentos, páginas recuperadas). El adaptador se publica junto a una batería de evaluación reproducible y un repositorio con todo el pipeline de entrenamiento.

La relevancia del artefacto es metodológica: documenta un compromiso medible entre resistencia a la inyección y falsos positivos sobre contenido legítimo. El autor es explícito al señalar que el adaptador no constituye una defensa por sí mismo y que debe situarse detrás de capas deterministas de filtrado y control de acciones. Con 18,5 millones de parámetros entrenables sobre un modelo de 1.500 millones, el adaptador ocupa apenas un 0,1 GB en disco y sirve como receta replicable para otros desarrolladores.

El modelo base Qwen2.5-1.5B-Instruct es un transformer causal denso de la familia Qwen2.5, orientado a instrucciones y con soporte multilingüe, aunque el adaptador se ha entrenado y evaluado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal denso Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (base) + 18.464.768 entrenables en el adaptador (1,18 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); se aplican los terminos del modelo base |
| Formato de pesos | safetensors (`adapter_model.safetensors`), cargable con PEFT |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango r=16 con alpha=32, dropout 0,0 y task type causal LM sobre todas las proyecciones del transformer base (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Esto supone 18.464.768 parámetros entrenables, un 1,18 % del total del modelo. La revisión del modelo base fijada es `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`, con peso `model.safetensors` verificado por SHA-256.

El entrenamiento se realizó con 132 ejemplos escritos específicamente para el experimento: 84 ejemplos de resistencia distribuidos en 7 familias de ataque (anulación directa, marcadores falsos de sistema/aprobación, auto-atestación y urgencia, exfiltración, ocultación, expansión de tarea y nuevo destino) y 48 ejemplos de comportamiento legítimo (24 instrucciones genuinas y 24 usos normales de datos con texto similar a instrucciones, como pasos de runbook o comentarios de código). Cada ejemplo tiene una media de 189,5 tokens y un máximo de 259, sumando 25.011 tokens por época. La optimización usó AdamW con learning rate 1e-4, schedule coseno, batch de 4 por dispositivo, 3 épocas, precisión bf16 y pérdida calculada solo sobre el turno del asistente (tokens del prompt enmascarados). El gasto total medido del experimento, incluyendo entrenamiento y ambas ramas de evaluación, fue de 116.403 tokens. El paso de construcción de datos verificó que ningún shingle de 8 palabras del texto de entrenamiento apareciera en la batería de evaluación, evitando fuga de datos por construcción.

## Capacidades

- Generación de texto y seguimiento de instrucciones sobre el modelo base Qwen2.5-1.5B-Instruct.
- Detección y marcado de instrucciones embebidas en datos: el modelo aprende a responder con una frase que empieza por "Flag:" señalando la inyección y explicando por qué no tiene autoridad.
- Ejecución de la tarea real pese a la presencia de una inyección, manteniendo el resumen o la operación solicitada.
- Diferenciación entre texto con forma de instrucción legítimo (pasos de runbook, comentarios de código, documentación) y texto malicioso, aunque con una tasa de falsos positivos elevada.
- Capacidad multilingüe limitada al inglés en este adaptador; el modelo base soporta más idiomas, pero el ajuste se ha realizado solo en inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido específicas del adaptador.

## Casos de uso

- Investigación en seguridad de LLM: servir como punto de partida reproducible para estudiar el equilibrio entre resistencia a inyección y falsos positivos, usando la batería pública `tpierson-eh/injection-defense-battery` y el repositorio `electrohire/injection-defense`.
- Capa de detección en pipelines RAG: colocar el adaptador como un clasificador auxiliar que marque fragmentos recuperados sospechosos antes de que el modelo principal los procese, aceptando que requerirá umbrales de confianza para mitigar los falsos positivos.
- Evaluación comparativa de defensas: usar el adaptador como línea base "antes/después" frente a otras técnicas (filtros deterministas, delimitadores, system prompts reforzados) en un mismo conjunto de pruebas.
- Formación y concienciación: generar ejemplos etiquetados de inyección para entrenar a equipos de seguridad o para construir datasets de evaluación propios.
- Prototipado de agentes con herramientas: en entornos de laboratorio, probar cómo un agente de 1,5B reacciona ante salidas de herramientas contaminadas, midiendo la tasa de marcado y de ejecución indebida.
- Docencia y experimentación con PEFT: el adaptador, de 0,1 GB y entrenable en una sola GPU local, sirve como ejemplo práctico de ajuste fino con LoRA, enmascarado de pérdida y evaluación con rúbrica determinista.

## Benchmarks y rendimiento

La model card describe una evaluación con dos ramas (resistencia y comportamiento legítimo), misma forma de prompt, decodificación greedy y límite de 200 tokens, puntuada con una rúbrica determinista de palabras clave (categorías "challenged", "partial" y fallo). El texto proporcionado se interrumpe antes de exponer las cifras finales, por lo que no se dispone de los porcentajes concretos.

| Metrica | Resultado |
|---|---|
| Tasa de resistencia a inyección (challenged) | no disponible en la informacion proporcionada |
| Tasa de falsos positivos sobre contenido legítimo | no disponible en la informacion proporcionada (el autor indica que supera el 50 % de marcado sobre texto legítimo con forma de instrucción) |
| Categorias parciales | no disponible en la informacion proporcionada |
| Comparacion con el modelo base sin adaptador | no disponible en la informacion proporcionada (se menciona una evaluacion antes/despues, sin cifras en el texto) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en bf16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits puede situarse en torno a 1-1,5 GB. El adaptador añade unos 74 MB en fp32 (18,46 M de parámetros).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenar el adaptador basta una única GPU local, como se hizo en el experimento.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 6 GB de VRAM; en 4 bits cabe incluso en iGPU con memoria unificada.
- Opciones de despliegue: transformers + PEFT (como indica la model card), fusión del adaptador con el modelo base y posterior conversión a GGUF para llama.cpp u Ollama, o servicio con vLLM/TGI tras fusionar los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tpierson-eh/qwen2.5-1.5b-injection-resistance-lora | 1,5B + 18,5M adaptador | no disponible | Defensa ante inyección de prompt (investigación) | Apache-2.0 | Hugging Face, 14 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Modelo base de instrucciones | Apache-2.0 | Hugging Face |
| Adaptadores de seguridad comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores de resistencia a inyección comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el adaptador no es una defensa autónoma ni una recomendación de despliegue; debe combinarse con filtros deterministas y un control de acciones que no dependa de las creencias del modelo.
- Tasa de falsos positivos elevada: más de la mitad del texto legítimo con forma de instrucción resulta marcado, lo que constituye un cambio de un modo de fallo por otro.
- Entrenado con solo 132 ejemplos y 3 épocas; la generalización a familias de ataque no vistas es incierta.
- Evaluación limitada al inglés y a una única batería de pruebas; no hay validación multilingüe ni en dominios específicos.
- Riesgo de alucinación heredado del modelo base Qwen2.5-1.5B-Instruct, agravado por su tamaño reducido.
- El adaptador no modifica el comportamiento del modelo base más allá de lo aprendido en el conjunto de entrenamiento; ataques que eviten la forma de las 7 familias cubiertas pueden pasar desapercibidos.
- La licencia Apache-2.0 del adaptador no exime del cumplimiento de los términos del modelo base.
- El texto de la model card proporcionado está truncado en la sección de evaluación; las cifras exactas de rendimiento deben consultarse en el repositorio del autor.
- Sin datos publicados de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tpierson-eh/qwen2.5-1.5b-injection-resistance-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de evaluación: https://huggingface.co/datasets/tpierson-eh/injection-defense-battery
- Repositorio del experimento: https://github.com/electrohire/injection-defense
