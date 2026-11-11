# Username1008/duckgpt-1-base

## Resumen

DuckGPT 1 Base es un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) publicado por el usuario Username1008 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de pesos entre Qwen3-8B y Esper3-8B, un fine-tune basado en Qwen3. La fusión se realizó con una proporción 80/20 entre ambos modelos, y según el autor también se empleó un adaptador LoRA durante el desarrollo para introducir información y guía adicionales, aunque dicho adaptador no se distribuye en el repositorio.

El modelo se presenta como la primera entrega exitosa de la familia DuckGPT y como base para desarrollos futuros. Su orientación declarada es relativamente descensurada y poco restrictiva: el propio autor advierte que puede responder a peticiones controvertidas, sensibles o potencialmente ilegales, y que no garantiza que sus respuestas sean precisas, seguras o legales. Esta característica lo sitúa en el ámbito de los modelos "uncensored" derivados de arquitecturas abiertas, más que en el de asistentes alineados para producción.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño (8B) con licencia Apache 2.0, publicado en safetensors y GGUF (Q4_K_M), lo que permite ejecución local en hardware de consumo. No obstante, el autor no ha realizado pruebas formales de benchmarks ni ofrece garantías de rendimiento, y el modelo solo declara soporte para inglés. La información técnica disponible es escasa y proviene casi exclusivamente de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles específicos no disponibles) |
| Parámetros totales | 8.190.735.360 (8,2 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M; safetensors en precisión original (no se especifica si FP16/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (sujeta a las licencias de los modelos originales) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

DuckGPT 1 Base no es un modelo entrenado desde cero, sino el resultado de una fusión de pesos (model merge) entre Qwen3-8B y Esper3-8B, este último descrito como un fine-tune basado en Qwen3. La fusión se realizó con una proporción 80/20, combinando ambos conjuntos de pesos en un único modelo. Según el autor, también se utilizó un adaptador LoRA durante el desarrollo para aportar información y guía adicionales, pero el adaptador no se incluye en el repositorio. No se especifican detalles sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención, etc.), los datos de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO.

La información disponible no permite confirmar innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Al derivarse de Qwen3, es razonable esperar que herede la arquitectura transformer estándar de dicha familia, pero este dato no se confirma explícitamente en la model card. Tampoco se documenta la composición del dataset de Esper3-8B ni el proceso exacto de fusión más allá de la proporción 80/20.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento y respuesta a preguntas generales, heredado de la base Qwen3.
- Comportamiento relativamente descensurado: puede responder a peticiones controvertidas o sensibles que otros asistentes rechazarían.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Disponible en GGUF para inferencia local con llama.cpp.

## Casos de uso

- Experimentación con fusiones de modelos: el modelo sirve como caso práctico para estudiar el efecto de un merge 80/20 entre un modelo base y un fine-tune, y para comparar el comportamiento resultante frente a los originales.
- Inferencia local en hardware de consumo: la versión GGUF Q4_K_M permite ejecutar un modelo de 8B en equipos con GPU modestas o incluso en CPU, útil para prototipos y pruebas offline.
- Investigación sobre alineación y censura: al declararse poco restrictivo, puede emplearse en estudios comparativos sobre comportamiento de modelos descensurados frente a asistentes alineados.
- Generación de texto creativo sin filtros estrictos: escritura de ficción, guiones o contenido exploratorio donde se busca menor intervención del filtrado.
- Base para fine-tunes posteriores: los safetensors publicados permiten a otros desarrolladores partir de estos pesos para sus propios ajustes o merges.
- Chat de demostración autoalojado: el autor ofrece un servidor con llama.cpp en su web, lo que ilustra un despliegue sencillo de chatbot local para pruebas informales.
- Evaluación de calidad tras cuantización: comparar las salidas del GGUF Q4_K_M frente a los safetensors originales para medir la degradación introducida por la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se han realizado pruebas formales de benchmarks ni se ofrecen puntuaciones de rendimiento o garantías de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para la versión GGUF Q4_K_M; en torno a 16 GB para safetensors en FP16/BF16 (estimación basada en el tamaño de 8,2 B de parámetros, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, especialmente con la cuantización Q4_K_M en GPUs de 8 GB o más; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (usado por el autor en su servidor de demostración) y, presumiblemente, otros runners compatibles con GGUF como Ollama o text-generation-webui; no se confirma soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Benchmarks publicados |
|---|---|---|---|---|---|
| DuckGPT 1 Base | 8,2 B | No disponible | Apache 2.0 | safetensors, GGUF | No |
| Qwen3-8B | ~8 B | No disponible en esta ficha | Apache 2.0 (según Qwen3) | safetensors, GGUF | Sí (según el modelo original) |
| Esper3-8B | ~8 B | No disponible en esta ficha | No disponible | No disponible | No disponible |

La comparación se limita a los modelos citados en la propia model card. No se dispone de datos de rendimiento de DuckGPT 1 Base que permitan una comparación cuantitativa con Qwen3-8B o Esper3-8B.

## Limitaciones y advertencias

- No se han realizado pruebas formales de benchmarks; no hay garantías de rendimiento.
- El modelo se declara explícitamente poco restrictivo y puede responder a peticiones controvertidas, sensibles o potencialmente ilegales; sus salidas podrían facilitar usos indebidos.
- Riesgo elevado de alucinación: el autor advierte que las respuestas pueden ser inexactas, incompletas o engañosas.
- La cuantización Q4_K_M puede degradar la calidad de las respuestas frente a los pesos originales.
- Soporte limitado al inglés; no se documentan capacidades multilingües.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con contextos largos.
- La licencia Apache 2.0 está sujeta a las licencias de los modelos originales (Qwen3 y Esper3); es necesario conservar las atribuciones y avisos correspondientes al redistribuir.
- No debe emplearse para decisiones de alto riesgo (médicas, legales, financieras, etc.).
- El adaptador LoRA utilizado en el desarrollo no se distribuye, por lo que no es posible reproducir exactamente el proceso de creación.
- El servidor de demostración del autor no garantiza disponibilidad continua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Username1008/duckgpt-1-base
- Formulario de feedback: https://forms.gle/CBvj5uDyzYdRDjyA6
- Web del proyecto: https://duckgpt.carrd.co/
