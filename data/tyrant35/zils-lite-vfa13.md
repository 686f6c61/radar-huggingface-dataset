# tyrant35/zils-lite-vfa13

## Resumen

zils-lite-vfa13 es un ajuste fino mediante LoRA del modelo base joamCriff123/zils-lite-l1123q, un "soup" (mezcla de pesos) de la familia Zils d3-lite. Lo desarrolla el usuario tyrant35 y está publicado en Hugging Face bajo licencia Apache 2.0. El modelo se presenta como un "decision model": su propósito declarado es responder preguntas de decisión tipadas (sí/no, elección entre opciones y puntuación), no como un modelo generativo de propósito general.

El ajuste consiste en un LoRA de rango 64 aplicado únicamente a las proyecciones de atención del modelo base, con tasa de aprendizaje 3e-5, acumulación de gradiente 8 y una sola pasada sobre los datos. La magnitud del cambio respecto al soup original se escaló por un factor de 1.3. El resultado es un checkpoint de 852.985.920 parámetros (unos 853 millones) en formato safetensors, con un repositorio de 1,7 GB.

Es relevante ahora porque ejemplifica una tendencia creciente: ajustes finos ligeros y de bajo coste sobre modelos pequeños orientados a tareas acotadas de clasificación y decisión, publicados con licencias permisivas. No obstante, la información pública es muy escasa: no se declaran idiomas, pipeline, benchmarks ni resultados de evaluación, y el propio autor indica que no se usó conjunto de validación ni de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del soup zils-lite d3-lite; detalles no disponibles) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización posterior, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de joamCriff123/zils-lite-l1123q, descrito por el autor como un "soup-pool body" de la familia d3-lite, es decir, una mezcla de pesos de varios checkpoints. Sobre ese cuerpo se aplicó un único ajuste fino LoRA de rango 64 restringido a las proyecciones de atención, con tasa de aprendizaje 3e-5, acumulación de gradiente 8 y una sola pasada de entrenamiento. El delta respecto al soup se escaló por 1.3. No se especifica la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención) ni la longitud de contexto del modelo base.

Los datos de entrenamiento consisten en aproximadamente 6.200 preguntas de decisión tipadas (sí/no, elección y puntuación) generadas por un modelo de lenguaje a partir de filas de los splits de entrenamiento de conjuntos públicos etiquetados: Social IQa, PIQA, MNLI, RTE, STS-B, QNLI, 20 Newsgroups, SVAMP, conjuntos de emoción y sentimiento, Glaive function calling y tareas de entrenamiento de BIG-bench, siguiendo la receta pública de `scripts/author_exam.py`. Una segunda pasada ciega de respuesta conservó solo los ítems cuya respuesta coincidía con la etiqueta escrita. Los objetivos mezclan la etiqueta gold con las probabilidades del propio soup: peso 0.9 para la etiqueta gold cuando la respuesta principal del soup era incorrecta y 0.32 cuando era correcta. No se empleó conjunto de validación ni de test durante el entrenamiento.

## Capacidades

- Respuesta a preguntas de decisión tipadas: sí/no, elección entre opciones y puntuación numérica.
- Clasificación implícita sobre tareas derivadas de NLI (MNLI, RTE, QNLI), razonamiento físico (PIQA), sentido común social (Social IQa) y similitud semántica (STS-B).
- Razonamiento aritmético básico de tipo SVAMP (problemas verbales de matemáticas elementales).
- Clasificación temática de documentos (20 Newsgroups).
- Análisis de emoción y sentimiento.
- Soporte de function calling en el formato de Glaive (según los datos de entrenamiento declarados).
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido, visión o audio: no disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo puede recibir una consulta y devolver una decisión tipada (sí/no o elección entre intenciones predefinidas), aprovechando su ajuste sobre MNLI, RTE y QNLI para enrutar peticiones hacia el flujo adecuado.
- Filtrado de contenido y moderación binaria: su formato de salida sí/no permite usarlo como clasificador de segunda etapa para decidir si un texto cumple una política, con la ventaja de un tamaño reducido que abarata el despliegue a gran escala.
- Enrutamiento de function calling: dado que se entrenó con datos de Glaive, puede decidir qué función invocar o si no debe invocarse ninguna, integrándose como paso previo a un modelo mayor en un pipeline de agentes.
- Análisis de sentimiento y emoción en lotes: clasificación de reseñas o mensajes en categorías de sentimiento y emoción, adecuada para procesos batch donde el coste por inferencia es determinante.
- Categorización temática de documentos: asignación de textos a categorías tipo 20 Newsgroups para indexación, archivado o triaje de tickets de soporte.
- Validación de respuestas en pipelines de QA: uso como verificador de decisión (¿es correcta esta respuesta para esta pregunta?) en sistemas de generación aumentada por recuperación, aprovechando su entrenamiento sobre pares pregunta-respuesta etiquetados.
- Resolución de problemas aritméticos elementales: verificación o selección de la respuesta correcta entre candidatos en problemas verbales de matemáticas básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de evaluación, y declara explícitamente que no se utilizó conjunto de validación ni de test durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros, en FP16 requiere aproximadamente 1,7 GB de pesos; en FP32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, unos 0,5 GB. Añadir entre 1 y 2 GB adicionales para el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4). Para FP32 se recomienda un mínimo de 6 GB. Una A100 o H100 no es necesaria para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes (RTX 3060 en adelante) e incluso en placas integradas con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: llama.cpp, Ollama y vLLM son viables tras conversión a GGUF o carga directa de safetensors; TGI también es compatible si el modelo expone una arquitectura reconocida por la librería. La conversión a GGUF requeriría verificar que la arquitectura del modelo base esté soportada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-vfa13 | 853 M | no disponible | Apache 2.0 | Decisión tipada (fine-tune LoRA) |
| joamCriff123/zils-lite-l1123q (base) | no disponible | no disponible | no disponible | Soup d3-lite sin ajuste de decisión |
| Modelos de clasificación tipo DeBERTa-v3-base | ~184 M | 512 tokens | MIT | Clasificación NLU |
| Modelos pequeños de instrucciones tipo Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | Generación e instrucciones generales |

La comparación con alternativas consolidadas es limitada porque no se han publicado métricas del modelo. Frente a clasificadores como DeBERTa-v3, zils-lite-vfa13 ofrece un formato de decisión más flexible (sí/no, elección, puntuación) pero carece de evaluación pública. Frente a modelos de instrucciones pequeños, su especialización es mucho más estrecha y no está pensado para generación abierta.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay conjunto de validación ni de test, ni métricas publicadas, por lo que se desconoce su precisión real en cualquiera de las tareas declaradas.
- Riesgo de sobreajuste a la receta de generación de datos: las preguntas fueron escritas por un modelo de lenguaje a partir de splits de entrenamiento, lo que puede introducir sesgos de estilo y artefactos del generador.
- Riesgo de alucinación en el sentido de respuestas de decisión inconsistentes: al ser un modelo de decisión, puede producir etiquetas erróneas con alta confianza, especialmente fuera de la distribución de los conjuntos usados.
- Idiomas no declarados: no se especifica qué idiomas soporta; se desconoce si funciona fuera del inglés, que es el idioma predominante en los datasets citados.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con entradas largas.
- Linaje opaco: el modelo base es un soup de pesos sin documentación pública detallada, lo que dificulta auditar la procedencia de los datos y los sesgos heredados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio, dado que no existe evidencia empírica de rendimiento.
- Sin pipeline declarado en Hugging Face: la integración automática con herramientas que dependen del campo `pipeline_tag` puede requerir configuración manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-vfa13
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1123q
