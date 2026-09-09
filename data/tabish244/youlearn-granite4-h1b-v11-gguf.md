# Tabish244/YouLearn-Granite4-H1B-V11-GGUF

## Resumen

El modelo YouLearn Granite 4.0 H 1B V11 es un ajuste fino del modelo base IBM Granite 4.0 H 1B, desarrollado por Tabish244 para la aplicación móvil Android YouLearn, un asistente de estudio offline. Combina una arquitectura híbrida Mamba-2 con Transformer, lo que reduce significativamente la presión de la cache de claves y valores (KV-cache) en contextos largos, un factor crítico para procesar documentos extensos en dispositivos móviles. El modelo se distribuye en formato GGUF cuantizado a 4 bits (Q4_K_M), con aproximadamente 1.460 millones de parámetros y un peso de 0,9 GB, lo que permite su despliegue en dispositivos Android de gama estándar y premium.

El propósito principal es ofrecer respuestas basadas en documentos (RAG) con un uso reducido de memoria, manteniendo un comportamiento preciso en tareas de estudio como generación de resúmenes, tarjetas de memoria y mapas mentales. Frente a modelos Transformer puros como MiniCPM5, esta arquitectura híbrida evita la explosión de memoria al cargar PDFs o apuntes extensos. El modelo fue entrenado sobre un dataset instructivo privado denominado YouLearn V11 durante 564 pasos de ajuste fino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / Transformer |
| Parametros totales | 1.461.538.368 (aprox. 1.460 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (4-bit medium) |
| Idiomas soportados | Inglés (en), Hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo combina capas de Mamba-2 (state space model) con capas de atención Transformer, formando un híbrido que conserva la capacidad de razonamiento de las atenciones pero con una cache de claves y valores muy reducida. Esto es especialmente relevante para documentos largos, donde los modelos basados únicamente en atención suelen aumentar drásticamente el uso de memoria.

El modelo parte del checkpoint instructivo de IBM Granite 4.0 H 1B (ibm-granite/granite-4.0-h-1b-instruct) y se sometió a un ajuste fino supervisado sobre el dataset YouLearn V11, con 564 pasos de entrenamiento. No se documenta el uso de RLHF, DPO ni otro tipo de alineación posterior. Tampoco se especifican la composición del dataset ni el número de tokens empleados.

## Capacidades

- Generación de texto instructivo orientado a tareas de estudio: tutoría, preguntas y respuestas sobre material académico.
- Respuestas ancladas a documentos (RAG) con bajo consumo de RAM, ideal para procesar PDFs y notas extensas.
- Salida estructurada: puede generar puntos clave, tarjetas de memoria (flashcards) y estructuras jerárquicas para mapas mentales en formato Mermaid.
- Seguimiento de instrucciones para formatos JSON, lo que facilita la integración en aplicaciones móviles que requieren respuestas estructuradas.
- Capacidades multilingües en inglés e hindi, con soporte bilingüe para estudiantes de ambos idiomas.
- No se ha confirmado soporte de tool calling / function calling en la información disponible.
- No se documentan capacidades de visión, audio ni generación de código específica.

## Casos de uso

- Tutoría de estudio offline: el modelo puede responder preguntas conceptuales y de repaso sin conexión, lo que resulta útil para estudiantes que estudian en entornos sin cobertura de red. Su arquitectura Mamba permite mantener un uso reducido de memoria durante sesiones largas.

- Preguntas y respuestas sobre documentos largos: con RAG, el usuario puede subir un PDF o un conjunto de apuntes y hacer preguntas específicas. La baja presión de KV-cache evita que el dispositivo se quede sin memoria al escanear documentos de numerosas páginas.

- Generación de tarjetas de memoria: aprovechando su salida estructurada en JSON, puede convertir un capítulo de texto en un conjunto de tarjetas de repaso, con pregunta en un campo y respuesta en otro, listas para importar en aplicaciones de repaso espaciado.

- Creación de mapas mentales: el modelo es capaz de producir estructuras en formato Mermaid, lo que permite a los estudiantes visualizar relaciones entre conceptos, jerarquías temáticas o resúmenes de temas complejos.

- Asistente educativo bilingüe inglés-hindi: maneja ambos idiomas, por lo que puede intercalar explicaciones o responder en el idioma preferido del estudiante, cubriendo un mercado educativo amplio.

- Integración en aplicaciones móviles con instrucciones JSON: al seguir instrucciones de formato con precisión, puede usarse como backend local de una app que requiera respuestas estructuradas para la interfaz de usuario (por ejemplo, mostrar tarjetas de repaso en una lista).

- Preparación de exámenes con preguntas de práctica: el modelo puede generar preguntas de opción múltiple o preguntas abiertas a partir del material de estudio, y usarse para evaluar la comprensión del alumno.

- Resumen de notas de clase: a partir de unas notas desordenadas, puede producir un resumen estructurado por temas, facilitando el repaso rápido antes de un examen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se dispone de métricas de razonamiento, generación de código o matemáticas que permitan comparar el rendimiento del modelo con otros de su categoría.

## Requisitos de hardware

- VRAM estimada: al tratarse de un GGUF de 0,9 GB con cuantización Q4_K_M, la inferencia en GPU requiere en torno a 1–2 GB de VRAM para cargar los pesos, sin contar el espacio de activaciones. En modo CPU, se necesita aproximadamente 1–2 GB de RAM libre.

- GPU recomendadas: tarjetas con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores) son suficientes. Para el caso de uso previsto, el modelo puede ejecutarse en la CPU o unidad de procesamiento de dispositivos Android de gama media-alta.

- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM. También es viable en dispositivos Android sin GPU dedicada.

- Opciones de despliegue: llama.cpp (requiere una versión reciente que soporte la arquitectura híbrida Mamba-2). Puede integrarse en aplicaciones móviles mediante bindings de llama.cpp o librerías que lo envuelvan. Otros runners de GGUF como Ollama o LM Studio pueden funcionar siempre que implementen dicha arquitectura.

- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor menciona de forma cualitativa que la arquitectura híbrida Mamba-2 ofrece una ventaja sobre modelos Transformer puros como MiniCPM5 en dispositivos móviles, en términos de uso de memoria en contextos largos, pero no se aportan datos numéricos. No se dispone de información suficiente para comparar de forma objetiva el rendimiento con otras alternativas de tamaño similar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible. Al estar entrenado sobre un dataset instructivo privado (YouLearn V11), es posible que existan sesgos no reportados, especialmente en dominios fuera del material de estudio.

- Riesgo de alucinación: al ser un modelo de 1.460 millones de parámetros y estar pensado para RAG, puede generar respuestas plausibles pero incorrectas si el documento no contiene la información requerida o si la pregunta excede el conocimiento adquirido.

- La longitud máxima de la ventana de contexto no está especificada, por lo que se recomienda verificar el comportamiento con documentos extensos antes de usarlo en producción.

- Solo se documentan los idiomas inglés e hindi; el rendimiento en otros idiomas no está garantizado.

- La licencia Apache-2.0 permite el uso comercial, pero requiere conservar el aviso de copyright y licencia en las redistribuciones.

- Para producción, es necesario verificar que el runtime de inferencia soporte la arquitectura híbrida Mamba-2; versiones antiguas de llama.cpp u otros motores pueden ser incompatibles. Además, el ajuste fino está orientado a la app YouLearn, por lo que su generalización a otras tareas puede ser limitada.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Tabish244/YouLearn-Granite4-H1B-V11-GGUF
- Perfil del autor: https://huggingface.co/Tabish244
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b-instruct
