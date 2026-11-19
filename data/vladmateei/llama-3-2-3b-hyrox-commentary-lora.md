# vladmateei/Llama-3.2-3B-HYROX-Commentary-LoRA

## Resumen

Llama-3.2-3B-HYROX-Commentary-LoRA es un adaptador LoRA de tipo PEFT para el modelo base meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario vladmateei. Su función es generar un párrafo corto (unas 110 palabras) de comentario analítico sobre el rendimiento de un atleta en una carrera HYROX, a partir de una tabla de tiempos parciales y bandas de clasificación. No es un modelo de chat general ni un asistente de entrenamiento: funciona exclusivamente con un formato de prompt fijo y muy estructurado.

El adaptador se entrenó mediante supervisión fina (SFT) sobre 1.644 comentarios generados por un modelo mayor (GPT-6-Luna) y filtrados por una comprobación automática de hechos. Representa el resultado final de un proyecto de aprendizaje que comparó SFT con aprendizaje por refuerzo, según indica el autor. El modelo está orientado a un dominio muy concreto (data-to-text deportivo) y en inglés.

Su relevancia es limitada fuera de ese nicho: demuestra cómo un adaptador pequeño (24,3 M de pesos entrenados, el 0,75 % del modelo base) puede especializarse en una tarea de generación factual con restricciones estrictas de formato y verificabilidad, reduciendo la tasa de afirmaciones falsas del 24,1 % del modelo base al 1,4 % en el conjunto de evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.2 3B Instruct |
| Parametros totales | 24,3 M en el adaptador (0,75 % del modelo base); el modelo base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.2 3B Instruct; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repo 0,1 GB (97 MB de adaptador) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todas las capas lineales del modelo base meta-llama/Llama-3.2-3B-Instruct. Entrena 24,3 M de pesos, lo que supone el 0,75 % del total del modelo base. El modelo base es un transformer decoder-only de 3.000 millones de parámetros de la familia Llama 3.2, en su variante Instruct.

El entrenamiento consistió en supervisión fina (SFT) sobre 1.644 comentarios generados por un modelo mayor (GPT-6-Luna) y filtrados mediante una comprobación automática de hechos: solo se conservaron los que pasaron dicha verificación. El autor describe el proyecto como una comparación entre SFT y aprendizaje por refuerzo, siendo este adaptador el resultado final del enfoque SFT. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto data-to-text: convierte una tabla fija de tiempos y bandas de clasificación en un párrafo analítico de hasta ~110 palabras.
- Redacción en segunda persona, con tono analítico y cierto entusiasmo de comentario deportivo, sin hype.
- Selección y justificación de hasta cuatro clasificaciones relevantes (bandas por segmento) para explicar dónde se ganó o perdió la carrera.
- Formato de salida restringido: cada clasificación debe expresarse como banda para un segmento nombrado y terminar en "in your division" o "in your age group".
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingüe: no; solo inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio. Requiere un formato de prompt exacto y no funciona como modelo de chat.

## Casos de uso

- Generación automática de comentarios post-carrera para plataformas de resultados HYROX: el adaptador recibe la tabla de parciales y bandas de un atleta y produce un párrafo listo para publicar, con bajo riesgo de afirmaciones falsas (1,4 % en la evaluación del autor).
- Enriquecimiento de perfiles de atletas en aplicaciones de análisis deportivo: a partir de los resultados completos de una carrera, se calculan las bandas por segmento y se genera un resumen narrativo que explica el patrón de rendimiento.
- Contenido editorial a escala para medios especializados en fitness: permite redactar resúmenes individuales de cientos de participantes manteniendo un formato homogéneo y verificable.
- Informes personalizados para entrenadores: el comentario señala fortalezas y debilidades por segmento (por ejemplo, sled push fuerte frente a running débil) con referencias a la división y grupo de edad del atleta.
- Módulo de narración en directo o post-evento para retransmisiones: integrado en un pipeline que calcule bandas en tiempo real, puede generar comentarios breves sobre cada atleta al terminar.
- Proyecto educativo o de investigación sobre data-to-text factual: sirve como caso de estudio de cómo un LoRA pequeño especializado reduce alucinaciones frente al modelo base en una tarea con formato y verificación estrictos.
- Evaluación comparativa SFT frente a RL: el autor lo presenta como el resultado final de un experimento de aprendizaje que compara ambos enfoques, útil como referencia reproducible.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 64 resultados de atletas de 18 eventos reservados (held-out). De las 780 afirmaciones resueltas y extraídas, 11 fueron falsas (1,4 %), frente al 24,1 % del modelo base sin entrenar.

| Metrica | Adaptador HYROX LoRA | Modelo base (Llama-3.2-3B-Instruct) |
|---|---|---|
| Afirmaciones falsas (sobre 780 resueltas) | 11 (1,4 %) | 24,1 % |
| Conjunto de evaluacion | 64 resultados de atletas, 18 eventos held-out | mismo conjunto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 97 MB; el modelo base Llama-3.2-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y unos 2-3 GB en cuantización de 4 bits (estimación orientativa, no especificada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3060/4060 Ti o superiores para cuantización 4-bit; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: PEFT con transformers (carga del adaptador sobre el modelo base), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), vLLM y TGI (previa fusión del adaptador).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-HYROX-Commentary-LoRA | 24,3 M (adaptador sobre 3B) | no disponible | Data-to-text deportivo especializado (LoRA) | llama3.2 | Hugging Face (adaptador) |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128k (según ficha oficial de Llama 3.2) | Chat general | llama3.2 | Hugging Face |
| Adaptadores LoRA genéricos para data-to-text | variable | depende del base | Data-to-text general | variable | Hugging Face |

No se dispone de información sobre modelos comparables específicos de comentario HYROX en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona con el formato de prompt exacto de entrenamiento; no es un modelo de chat ni un asistente general de HYROX.
- No proporciona consejos de entrenamiento ni conoce carreras anteriores del atleta.
- No puede trabajar solo con tiempos parciales brutos: el prompt debe incluir las bandas de clasificación por segmento en la división y grupo de edad, calculadas a partir de los resultados completos de la carrera.
- Sigue cometiendo errores: el 1,4 % de afirmaciones falsas en la evaluación del autor implica que no es fiable al 100 % para publicación sin revisión.
- Entrenado únicamente en inglés; no soporta castellano ni otros idiomas.
- Licencia llama3.2: el uso comercial está sujeto a los términos de la licencia de Llama 3.2, que incluyen restricciones y obligaciones de atribución; debe revisarse antes de un despliegue comercial.
- El adaptador no incluye el modelo base; es necesario solicitar acceso a meta-llama/Llama-3.2-3B-Instruct en Hugging Face.
- Riesgo de alucinación en posiciones numéricas: el prompt prohíbe explícitamente dar posiciones por segmento, pero el modelo podría generarlas si se desvía del formato.
- Sin datos de benchmarks estándar ni evaluación independiente; las métricas provienen del propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/vladmateei/Llama-3.2-3B-HYROX-Commentary-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Artículo del autor (Medium): https://medium.com/p/a068a19199de/edit
- Ejemplo de prompt: archivo `example_prompt.txt` en el repositorio del modelo
