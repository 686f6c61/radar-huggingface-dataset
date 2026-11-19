# SZLHOLDINGS/salad-quant-abstention-r1

## Resumen

salad-quant-abstention-r1 es un artefacto de entrenamiento candidato publicado por SZLHOLDINGS bajo su programa de formación en IA gobernada. Según la model card, no se trata de un modelo de producción publicado, sino de un checkpoint intermedio de un pipeline de entrenamiento interno, distribuido con licencia Apache 2.0 y orientado a generación de texto en inglés. El repositorio ocupa 0,7 GB e incluye una escalera de checkpoints (50/100/150/200) más un directorio `final/`, con un total de 51 archivos de modelo.

La model card no especifica arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. El autor declara explícitamente una doctrina de "recibos medidos" (*fail-closed measured-receipts doctrine*), que implica no publicar recuentos ni marcas temporales fabricadas; como consecuencia, la información técnica disponible es mínima. La relevancia del modelo es, por tanto, limitada: sirve como referencia de un experimento de entrenamiento concreto (cuantización y abstención, a juzgar por el nombre) más que como un modelo listo para integrar en producción.

El identificador del modelo sugiere un enfoque en dos ejes: cuantización (*quant*) y abstención (*abstention*), es decir, la capacidad del modelo de declinar responder cuando no dispone de información fiable. Sin embargo, no hay documentación pública que confirme esta interpretación ni resultados que la respalden. Cualquier evaluación práctica requerirá descargar los pesos y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere trabajo sobre cuantizacion, sin detalle) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags de Hugging Face) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, híbrido u otra), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card solo indica que se trata de un artefacto candidato de entrenamiento con una escalera de checkpoints en los pasos 50, 100, 150 y 200, más un checkpoint final. El tamaño del repositorio (0,7 GB) es compatible con un modelo pequeño o con pesos cuantizados, pero no permite inferir el número de parámetros con fiabilidad.

El autor menciona una "doctrina de recibos medidos" (*measured-receipts doctrine*) según la cual no se publican recuentos ni marcas temporales que no hayan sido verificados. La procedencia se remonta a recibos alojados en la organización SZLHOLDINGS de Hugging Face (línea `frontier-54-runs`) y a un registro de tesis en Zenodo (DOI 10.5281/zenodo.19944926). No se documentan innovaciones técnicas como decodificación especulativa, atención lineal ni mecanismos de abstención explícitos más allá de lo que sugiere el nombre del modelo.

## Capacidades

- Generación de texto en inglés, según el pipeline declarado (`text-generation`).
- Posible capacidad de abstención (declinar responder ante falta de información), inferida únicamente del nombre del modelo; no documentada.
- Posible robustez frente a cuantización, inferida del nombre; no documentada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo se declara inglés).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de investigación sobre abstención: el modelo puede utilizarse como punto de partida para estudiar si un modelo pequeño entrenado con este objetivo declina responder ante preguntas fuera de distribución, comparando sus salidas con las de un modelo base.
- Experimentación con cuantización: dado el nombre y el tamaño reducido del repositorio, es adecuado para probar pipelines de cuantización (por ejemplo, conversión a GGUF) y medir la degradación de calidad en un modelo de bajo coste.
- Reproducción de experimentos de entrenamiento: los checkpoints intermedios (50/100/150/200) permiten analizar la evolución del comportamiento durante el entrenamiento, algo útil en cursos o trabajos sobre dinámica de ajuste fino.
- Pruebas de integración con `transformers`: sirve para validar pipelines de carga de safetensors y generación de texto en entornos de CI antes de adoptar modelos mayores.
- Docencia sobre gobernanza de IA: el énfasis del autor en procedencia y recibos medidos lo convierte en un ejemplo para discutir prácticas de trazabilidad en la publicación de modelos.
- Prototipado interno de bajo riesgo: al ser Apache 2.0 y de tamaño pequeño, puede desplegarse en entornos de desarrollo para validar interfaces de inferencia sin coste de GPU significativo.

No se recomienda su uso en producción orientada a usuarios finales, atención al cliente, generación de código crítica ni tareas que requieran calidad contrastada, dada la ausencia de benchmarks y de documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,7 GB) sugiere que cabría en GPUs consumer con 4-8 GB de VRAM en cuantizaciones de 4-8 bits, pero es una estimación basada solo en el tamaño de los archivos.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) podría ejecutarlo si la estimación anterior es correcta.
- Cabe en GPU consumer: probablemente sí, en función del número real de parámetros, que no se ha publicado.
- Opciones de despliegue: `transformers` (declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni se dispone de datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de entrenamiento candidato, no un modelo de producción; el propio autor lo declara así.
- Ausencia total de benchmarks, lo que impide evaluar su calidad frente a alternativas.
- Idiomas: solo se declara inglés; no hay evidencia de soporte multilingüe.
- Riesgo de alucinación: no evaluado; sin datos de alineación ni de evaluación de fidelidad.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no haber evaluación de calidad, el uso comercial conlleva riesgo reputacional y técnico.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Procedencia: la cadena de custodia se remite a recibos en la organización del autor y a un DOI de Zenodo; conviene verificar esos enlaces antes de confiar en el linaje del modelo.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar incidencias resueltas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-quant-abstention-r1
- Registro Zenodo (DOI): https://doi.org/10.5281/zenodo.19944926
- Organización SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
