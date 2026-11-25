# woofwoof61/zils-flash-k1

## Resumen

Zils d3-flash body es un checkpoint de pesos derivado de MachinePulseAI/karpo-decision-9B, que a su vez es un fine-tune de Qwen/Qwen3.5-9B. Lo publica el usuario woofwoof61 en Hugging Face como "cuerpo" (body) para el pool d3-flash de la subnet 127 de Zils, un entorno de evaluacion de modelos de decision. El modelo conserva sin cambios los pesos de lenguaje y vision del modelo base; la capa de lectura (readout) no se incluye, porque el pool ejecuta cada cuerpo con su propia capa de respuesta fijada.

El interés del checkpoint es acotado y muy específico: sirve como pieza intercambiable en un pipeline de evaluación de decisiones, no como modelo de propósito general listo para producción. Con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) y un repositorio de 16,8 GB en safetensors, su huella corresponde a un transformer denso de escala 9B, coherente con la familia Qwen3.5.

La relevancia es fundamentalmente logística: permite a los participantes del pool reutilizar un cuerpo ya entrenado y centrarse en la capa de decisión. No hay métricas publicadas, ni idiomas declarados, ni documentación de entrenamiento más allá de la relación de fine-tune con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-9B, segun la model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-9B (revision 0fb729874694e9a4928882eefb2cb1aa49b93735) |
| Linaje | Qwen/Qwen3.5-9B → MachinePulseAI/karpo-decision-9B → woofwoof61/zils-flash-k1 |
| Tamano del repositorio | 16,8 GB |

## Arquitectura y entrenamiento

La model card indica que los pesos de lenguaje y vision son idénticos a los de MachinePulseAI/karpo-decision-9B, que a su vez deriva de Qwen/Qwen3.5-9B. Por tanto, la arquitectura subyacente es la de un transformer denso de la familia Qwen3.5, con torre de visión incluida según la propia descripción del autor ("language and vision weights"). No se aportan detalles sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención ni estrategia de positional encoding.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones como decodificación especulativa o atención lineal. El autor declara explícitamente que no modifica los pesos: se trata de una redistribución del cuerpo del modelo base para el pool d3-flash de la subnet 127 de Zils. La capa de lectura (readout) del modelo upstream no se incluye, ya que el pool aplica su propia capa de respuesta fijada a cada cuerpo.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones propias.
- Procesamiento de visión: la model card menciona explícitamente "language and vision weights", por lo que se espera soporte multimodal de imagen, sin detalles sobre resolución o formato.
- Modelo de decisión: el linaje (karpo-decision-9B) y la etiqueta "decision-model" sugieren un ajuste orientado a tareas de decisión, si bien no se especifica el formato de entrada/salida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación en el pool d3-flash de Zils: el uso previsto es servir como cuerpo en la subnet 127, donde el pool aplica su propia capa de lectura. Es el escenario para el que el autor publica el checkpoint.
- Investigación sobre capas de decisión: al mantener intactos los pesos de lenguaje y visión, permite a investigadores sustituir únicamente el readout y medir el efecto sobre tareas de decisión sin reentrenar el cuerpo.
- Reproducibilidad de experimentos: la referencia explícita a la revisión 0fb729874694e9a4928882eefb2cb1aa49b93735 del modelo base facilita fijar exactamente los mismos pesos en comparaciones.
- Punto de partida para fine-tunes propios: con licencia Apache-2.0, un equipo puede partir de este cuerpo y entrenar su propia cabeza de decisión o de clasificación.
- Experimentos multimodales: al incluir pesos de visión, puede emplearse en prototipos que combinen imagen y texto, siempre que se añada la capa de salida adecuada.
- Docencia y análisis de linajes de modelos: útil para estudiar cómo se propaga un fine-tune sobre Qwen3.5-9B y qué se conserva cuando se separa cuerpo y readout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- Cuantización a 8 bits: aproximadamente 8,4 GB de pesos, viable en GPUs de 12-16 GB con contexto moderado.
- Cuantización a 4 bits: alrededor de 4,2 GB de pesos, apta para GPUs consumer de 8 GB, con degradación de calidad no medida.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090, 4080 o 4070 Ti Super para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 con contexto reducido y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son candidatos habituales para un transformer de esta escala, pero no hay confirmación de compatibilidad publicada para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| woofwoof61/zils-flash-k1 | 8,39 B | No disponible | Apache-2.0 | Cuerpo sin readout para el pool d3-flash |
| MachinePulseAI/karpo-decision-9B | ~9 B (nominal) | No disponible | Apache-2.0 | Modelo base directo, incluye su propio readout |
| Qwen/Qwen3.5-9B | ~9 B (nominal) | No disponible | No disponible en esta ficha | Modelo original de la familia |

No se dispone de datos de rendimiento comparables entre estas variantes, por lo que la comparación se limita a linaje, licencia y propósito.

## Limitaciones y advertencias

- Ausencia de readout: el checkpoint no incluye la capa de respuesta del modelo upstream; sin una capa de lectura propia, no es utilizable directamente para generación estándar.
- Sin documentación de evaluación: no hay benchmarks, ni métricas de calidad, ni comparaciones con el modelo base.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el comportamiento en castellano.
- Contexto desconocido: no se publica la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; se heredan los del modelo base y los de sus datos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio por las atribuciones a los autores originales.
- Madurez: el repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.
- Compatibilidad no verificada: no se confirma que funcione con vLLM, llama.cpp u otros motores sin adaptaciones.

## Enlaces

- Hugging Face: https://huggingface.co/woofwoof61/zils-flash-k1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
