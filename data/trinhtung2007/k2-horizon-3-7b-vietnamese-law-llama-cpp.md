# trinhtung2007/K2-Horizon-3.7B-Vietnamese-Law-llama.cpp

## Resumen

K2-Horizon-3.7B-Vietnamese-Law-llama.cpp es una exportación en formato GGUF de un ajuste fino del modelo K2-Horizon-3.7B orientado al razonamiento jurídico en vietnamita, concretamente al ámbito del derecho penal. Lo publica el usuario trinhtung2007 dentro del proyecto IntroAI_project y deriva del checkpoint cuantizado a 4 bits de mlx-community (K2-Horizon-3.7B-4bit), sobre el que se aplicó un adaptador QLoRA en MLX que después se fusionó y se convirtió a GGUF.

El interés del artefacto es doble: por un lado, ofrece un modelo especializado en derecho vietnamita listo para ejecutarse con llama.cpp (CLI o servidor compatible con la API de OpenAI); por otro, documenta de forma transparente el proceso de conversión y una comparación de similitud de salida entre el runtime original MLX y la cuantización Q4_K_M. Esa comparación muestra una degradación medible: la similitud coseno media frente a la respuesta de referencia cae de 0,934 (MLX) a 0,755 (Q4_K_M) en 20 ejemplos reservados.

El repositorio es de tamaño reducido (3,2 GB) y contiene un único archivo GGUF de 2,9 GiB en cuantización Q4_K_M calibrada con matriz de importancia. La licencia declarada es Apache-2.0, si bien el modelo base y el corpus de sentencias judiciales empleados tienen sus propios términos que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (K2-Horizon; detalles de capas y atención no disponibles) |
| Parametros totales | 5.058.255.360 (según safetensors del modelo base); la denominación comercial es 3.7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como máximo del modelo; los ejemplos de ejecución usan `-c 8192` y `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (única publicada), calibrada con matriz de importancia (imatrix) |
| Idiomas soportados | vietnamita (especialización jurídica); lista oficial de idiomas no disponible |
| Licencia | Apache-2.0 (según metadatos del modelo base) |
| Formato de pesos | GGUF (archivo `K2-Horizon-3.7B-Vietnamese-Law-Q4_K_M.gguf`, 2,9 GiB) |

## Arquitectura y entrenamiento

El modelo parte de K2-Horizon-3.7B en su variante ya cuantizada a 4 bits por mlx-community. Sobre esa base se aplicó un ajuste fino con QLoRA en MLX con rango 32, tasa de aprendizaje 5e-6 y 3.306 pasos de actualización, empleando el corpus público de sentencias judiciales vietnamitas `tmquan/cbba-toaan-gov-vn`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El pipeline de conversión fusionó el adaptador final de MLX con la base cuantizada, exportó a GGUF de 16 bits y después cuantizó a Q4_K_M. La matriz de importancia se recolectó a partir de 64 registros de entrenamiento, excluyendo deliberadamente los registros de evaluación para no contaminar la calibración. El GGUF incorpora el tokenizador y la plantilla de chat de K2-Horizon, incluido su formato de razonamiento y el token de fin de turno, y requiere una versión de llama.cpp con soporte para K2-Horizon y el flag `--jinja` para aplicar correctamente la plantilla.

## Capacidades

- Generación de texto conversacional orientada a consultas y razonamiento jurídico en vietnamita (derecho penal).
- Razonamiento multi-paso: la plantilla de chat incorpora un formato de razonamiento propio y un token de fin de turno específico.
- Formato conversacional con plantilla de chat embebida en el GGUF, aplicable vía `--jinja`.
- Despliegue como servidor compatible con la API de OpenAI mediante `llama-server`.
- Especialización léxica y procedimental en terminología legal vietnamita derivada del corpus de sentencias.
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso

- Asistencia a la redacción de borradores de escritos penales: el modelo puede generar estructuras de argumentación y citar figuras delictivas del derecho vietnamita a partir de una descripción de hechos, apoyándose en el ajuste sobre sentencias reales.
- Resumen y explicación de sentencias: dado un fragmento de resolución judicial, el modelo puede producir una síntesis en vietnamita para uso interno de un despacho, con la ventaja de ejecutarse en local sin enviar documentos sensibles a la nube.
- Formación de estudiantes de derecho: despliegue con `llama-server` en un entorno docente para simular preguntas de examen y respuestas razonadas sobre derecho penal vietnamita.
- Prototipado de asistentes jurídicos en local: al caber en 2,9 GiB, permite iterar sobre prompts y plantillas de razonamiento en una estación de trabajo sin GPU dedicada de gama alta.
- Clasificación y triaje documental: uso del modelo como generador de etiquetas o descripciones breves de expedientes, combinado con un pipeline externo de recuperación (RAG) sobre el corpus legal.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir la pérdida de calidad al pasar de MLX a Q4_K_M en llama.cpp en una tarea de dominio especializado.
- Integración en herramientas de escritorio: al ser un GGUF de menos de 3 GiB, puede embeberse en aplicaciones ofimáticas o de gestión de despachos con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una comprobación de similitud de salida sobre 20 registros de evaluación reservados (IDs 3322–3341), con decodificación greedy, límite de 1.536 tokens y embeddings de `LiquidAI/LFM2.5-Embedding-350M` con pooling CLS y similitud coseno:

| Comparacion | Similitud coseno media |
|---|---:|
| Salida MLX frente a salida llama.cpp Q4_K_M | 0,766 |
| Respuesta de referencia frente a salida MLX | 0,934 |
| Respuesta de referencia frente a salida llama.cpp Q4_K_M | 0,755 |

La longitud media de la respuesta final fue de 2.146 caracteres en MLX y de 582 en Q4_K_M. El autor advierte expresamente que estas cifras miden similitud de salida y no exactitud jurídica.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 2,9 GiB; con contexto de 8.192–16.384 tokens y caché KV, el consumo realista se sitúa aproximadamente entre 4 y 6 GB, aunque no se publican mediciones oficiales.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con 6–8 GB de VRAM es suficiente para el archivo en Q4_K_M.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores; también en equipos Apple Silicon vía Metal.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte de K2-Horizon y `--jinja`; no se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles; el autor solo reporta longitudes medias de salida (2.146 caracteres en MLX frente a 582 en Q4_K_M) en la comprobación de 20 ejemplos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones suficientes para comparar este modelo con alternativas de la misma categoría (modelos jurídicos en vietnamita de tamaño similar). La tabla siguiente recoge únicamente los datos verificables del propio modelo y de su base inmediata:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| K2-Horizon-3.7B-Vietnamese-Law (este) | 5,06 B (según safetensors) | no disponible | GGUF Q4_K_M | Apache-2.0 |
| mlx-community/K2-Horizon-3.7B-4bit (base) | 5,06 B | no disponible | MLX 4-bit | Apache-2.0 (según metadatos) |

Comparativa con otros modelos: no disponible.

## Limitaciones y advertencias

- La cuantización Q4_K_M degrada la fidelidad respecto al modelo MLX: la similitud frente a la referencia cae de 0,934 a 0,755 y las respuestas son mucho más cortas (582 frente a 2.146 caracteres de media).
- El propio autor advierte que las métricas de similitud no establecen exactitud jurídica; no debe usarse como fuente de asesoramiento legal sin revisión humana.
- Riesgo de alucinación en citas normativas y jurisprudenciales, agravado por la compresión a 4 bits y por la brevedad de las respuestas generadas.
- Especialización estrecha en derecho penal vietnamita; el rendimiento fuera de ese dominio o en otros idiomas no está documentado.
- No se publican datos sobre sesgos del corpus de sentencias ni sobre su representatividad.
- La licencia Apache-2.0 se infiere de los metadatos del modelo base; deben revisarse también los términos del corpus `tmquan/cbba-toaan-gov-vn` y del checkpoint de mlx-community antes de un uso comercial.
- Requiere una compilación de llama.cpp con soporte específico para K2-Horizon y el flag `--jinja`; sin ellos la plantilla de chat y el formato de razonamiento pueden aplicarse de forma incorrecta.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la evidencia externa sobre su calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trinhtung2007/K2-Horizon-3.7B-Vietnamese-Law-llama.cpp
- Modelo base: https://huggingface.co/mlx-community/K2-Horizon-3.7B-4bit
- Repositorio del proyecto: https://github.com/trinhtung111/IntroAI_project
- Dataset de sentencias judiciales: https://huggingface.co/datasets/tmquan/cbba-toaan-gov-vn
- Modelo de embeddings usado en la evaluación: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
