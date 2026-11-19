# SZLHOLDINGS/salad-flagship54-v1

## Resumen

salad-flagship54-v1 es un fine-tune de generación de texto publicado en Hugging Face por SZLHOLDINGS, descrito por el propio autor como un artefacto privado de entrenamiento del "estate flagship" de su infraestructura de IA gobernada. El modelo se presenta como un recibo medido del proceso de entrenamiento, no como una ficha de producto: la model card insiste en que ninguna métrica es proyectada ni estimada, y limita las afirmaciones a las lecturas de pérdida registradas durante el entrenamiento.

El entrenamiento consta de 37.000 pasos completados, equivalentes a 57,63 épocas, con una pérdida final de 0,0311 y una precisión media de token de 0,9880. El repositorio ocupa 37,3 GB y contiene 148 checkpoints con cadencia de 250 pasos, en formato safetensors. La información pública no especifica arquitectura, número de parámetros, longitud de contexto ni composición del dataset.

La relevancia de esta ficha es limitada por diseño: el autor declara explícitamente que no se ha ejecutado ninguna batería de evaluación sobre el artefacto y que la publicación no es elegible hasta que se tome una decisión de evaluación. Por tanto, cualquier uso en producción debe considerarse experimental y sujeto a validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no declara la arquitectura del modelo base, el número de parámetros ni la composición del dataset de entrenamiento; el autor indica que estos datos deben vincularse únicamente desde el manifiesto del run cuando se publique. Lo que sí se documenta es el contrato de entrenamiento medido: una ejecución configurada para 37.000 pasos que finalizó completa, con 57,63 épocas recorridas, pérdida final de 0,03109147250652313 y precisión media de token de 0,9880363650619983.

La evolución de la pérdida a lo largo de la escalera de checkpoints es la siguiente: 0,387 en el paso 3.500; 0,1446 en el 10.500; 0,1030 en el 17.000; 0,1047 en el 18.500; y 0,0311 en el 37.000. Se publican 148 checkpoints con cadencia de 250 pasos. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.). El recibo de finalización se referencia como `mesh/flagship54-v1-training-complete-*.json` dentro del dataset SZLHOLDINGS/frontier-54-runs.

## Capacidades

- Generación de texto: es la única capacidad declarada explícitamente mediante el pipeline `text-generation`.
- Fine-tune sobre un modelo base no identificado: las capacidades heredadas del base no se pueden verificar desde la información pública.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación interna de fine-tunes: el artefacto puede servir como referencia para comparar curvas de pérdida y estabilidad de entrenamiento frente a otros runs del mismo estate, dado que se publican 148 checkpoints con cadencia fija de 250 pasos.
- Reproducción de recetas de entrenamiento: la escalera de pérdida documentada (0,387 a 0,0311) permite auditar la dinámica de convergencia de una receta concreta antes de replicarla en otros modelos.
- Investigación sobre artefactos privados y gobernanza de IA: el caso ilustra un patrón de publicación basado en recibos medidos (`publication_eligible: false`) en lugar de fichas de producto, útil para estudiar prácticas de transparencia parcial.
- Generación de texto experimental en entornos controlados: al ser un modelo de tipo `text-generation`, puede probarse en tareas de continuación de texto dentro de sandboxes, siempre que se valide su comportamiento con una batería propia.
- Base para un proceso de evaluación propio: dado que el autor no ha ejecutado benchmarks, un equipo puede tomar los checkpoints y aplicar su propio conjunto de evaluación antes de cualquier uso.
- Docencia y formación: sirve como ejemplo práctico de por qué la pérdida de entrenamiento no equivale a calidad en inferencia, y de la necesidad de evaluar antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna batería de evaluación sobre el artefacto y que la única medición disponible es la pérdida de entrenamiento por paso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros y la arquitectura. El tamaño del repositorio (37,3 GB en safetensors) es un límite inferior aproximado del peso en precisión nativa, pero no permite derivar la VRAM de inferencia sin conocer el modelo base.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información pública no identifica el modelo base ni modelos comparables de la misma categoría, y el autor no declara parámetros, contexto ni rendimiento evaluado, por lo que cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no se ha ejecutado ninguna batería de benchmarks ni de honestidad sobre el artefacto; la pérdida de entrenamiento es la única medición.
- Modelo base no identificado: se desconoce la arquitectura, el tamaño y las capacidades heredadas, lo que impide estimar rendimiento o requisitos de hardware.
- Dataset y contrato de entrenamiento no declarados: la composición de datos y el contrato de entrenamiento no se afirman en la model card y deben vincularse desde el manifiesto del run.
- Publicación no elegible: `publication_eligible: false` hasta que el propietario tome una decisión de evaluación; el repositorio se describe como privado y no destinado a descarga pública.
- Licencia no disponible: no se especifican términos de uso comercial, por lo que no puede asumirse permiso de uso en producción.
- Idiomas no declarados: no hay garantía de cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados; al no existir batería de evaluación, no puede descartarse ninguno de los riesgos habituales de un fine-tune sin validación.
- Fecha de creación futura (2026-11-15): conviene verificar la procedencia y autenticidad del artefacto antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-flagship54-v1
- Dataset de runs y recibos de finalización: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
