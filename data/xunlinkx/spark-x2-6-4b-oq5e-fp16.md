# xunlinkx/Spark-X2.6-4B-oQ5e-fp16

## Resumen

Spark-X2.6-4B-oQ5e-fp16 es una cuantización comunitaria, preparada por el usuario xunlinkx, del modelo Spark-X2.6-4B desarrollado por el equipo SparkLLM de XHToken. No se trata de un lanzamiento oficial: el repositorio contiene los pesos del modelo original convertidos a formato MLX con el pipeline de cuantización oMLX, orientado a la inferencia local en Macs con Apple Silicon (generaciones M1 a M6). El objetivo es ofrecer un punto intermedio entre tamaño en memoria y precisión retenida, mediante una cuantización de 5 bits con precisión mixta mejorada.

El modelo base es un modelo de generación de texto conversacional con arquitectura `spark2_5`, publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones relevantes. La cuantización parte del checkpoint original en BF16, convertido previamente a FP16 (de ahí el sufijo `-fp16`), y emplea calibración mejorada con 128 muestras de 512 tokens, tamaño de grupo 64 y cuantización afín. Con 4.112 millones de parámetros y un tamaño de repositorio de 3,0 GB, es adecuado para ejecutarse en hardware de consumo sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `spark2_5` (detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e: 5 bits con precisión mixta mejorada (base de 5 bits; proyecciones seleccionadas de atención y MLP en mayor precisión; origen FP16, grupo 64, cuantización afín) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El repositorio utiliza la arquitectura `spark2_5`, propia de la familia Spark-X2.6 de XHToken. La model card no documenta los detalles internos de la arquitectura (tipo de atención, número de capas, mecanismos innovadores), por lo que hay que remitirse a la model card del modelo base y al repositorio oficial del proyecto para esa información.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: el checkpoint original en BF16 se convirtió a FP16 y después se cuantizó a 5 bits mediante el pipeline oMLX, con calibración mejorada sobre 128 muestras de 512 tokens de longitud, tamaño de grupo 64 y cuantización afín. Algunas proyecciones de atención y MLP se almacenan a mayor precisión para reducir la pérdida de calidad; el desglose por capas está registrado en el `config.json` del repositorio.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Soporte de chat template y configuración de "thinking budget" según el runtime empleado (mencionado en la model card del modelo base).
- Inferencia local optimizada para Apple Silicon mediante MLX.
- No hay información disponible sobre capacidades de visión, audio, tool calling, agentes, razonamiento matemático o generación de código.

## Casos de uso

- Chatbots locales en Mac: al ser un modelo conversacional de 4B cuantizado a 5 bits, cabe en la memoria unificada de cualquier Mac con Apple Silicon, permitiendo asistentes conversacionales sin depender de la nube.
- Prototipado rápido de aplicaciones de IA en dispositivos Apple: la integración con MLX permite iterar prompts y pipelines directamente en el portátil de desarrollo.
- Asistentes de escritorio con privacidad: al ejecutarse íntegramente en local, es adecuado para procesar conversaciones con datos sensibles que no deben salir del equipo.
- Uso comercial en productos: la licencia Apache-2.0 permite integrar el modelo en aplicaciones comerciales sin regalías ni restricciones de uso.
- Punto de comparación de cuantizaciones: al documentar el layout de cuantización en `config.json`, resulta útil para evaluar el impacto de la cuantización a 5 bits con precisión mixta frente a versiones en BF16/FP16.
- Automatización ligera de tareas de texto: clasificación, resumen o reescritura de textos en flujos locales, con temperatura 1.0 y top-p 0.95 recomendadas por el autor del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es una prueba de humo local (generación de 15 tokens) con un pico de memoria de 3,183 GB reportado por MLX; los autores advierten explícitamente de que no es un benchmark ni una comparación de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: el pico de memoria medido en la prueba de humo fue de 3,183 GB; el consumo real aumenta con la longitud de contexto y la sobrecarga del runtime. Con un repositorio de 3,0 GB, es razonable presupuestar al menos 4-6 GB de memoria unificada para contextos moderados.
- GPU recomendadas: no requiere GPU dedicada; está pensado para Macs con Apple Silicon (M1 a M6). En equipos con GPU NVIDIA la cuantización MLX no es aplicable directamente.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de prácticamente cualquier Mac con Apple Silicon; no aplica a GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX y MLX-LM (comando `mlx_lm.generate`), y el pipeline oMLX. Se necesita una instalación reciente con soporte de la arquitectura `spark2_5`. No consta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Spark-X2.6-4B-oQ5e-fp16 (este) | 4,11 B | 5 bits precisión mixta (oQ5e) | MLX safetensors | Apache-2.0 | no disponible |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | BF16 (sin cuantizar) | safetensors | Apache-2.0 | no disponible |
| Qwen3-4B (referencia de categoria) | 4 B | BF16 y variantes cuantizadas | safetensors, GGUF | Apache-2.0 | 32K (según documentación oficial) |

Nota: la comparativa con Qwen3-4B es orientativa, como modelo de tamaño similar y licencia equivalente; los datos de rendimiento comparados no están disponibles para Spark-X2.6-4B.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es una cuantización comunitaria de xunlinkx, sin respaldo de los autores originales de SparkLLM/XHToken.
- No hay benchmarks de calidad publicados; la única validación es una prueba de humo de 15 tokens, por lo que la pérdida de calidad respecto al modelo base no está cuantificada.
- Los requisitos de memoria crecen con la longitud de contexto; la cifra de 3,183 GB corresponde a un prompt corto.
- La longitud de contexto, los idiomas soportados y las capacidades exactas del modelo base no están documentados en la información disponible.
- La inferencia requiere runtimes con soporte específico de la arquitectura `spark2_5` (oMLX o MLX-LM actualizados); no funciona con herramientas estándar como llama.cpp u Ollama sin soporte añadido.
- Al tratarse de un modelo conversacional de 4B, cabe esperar el riesgo habitual de alucinaciones en generación de texto; no hay evaluaciones de sesgos publicadas para esta cuantización.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene revisar la licencia y términos del modelo base en el repositorio upstream.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/xunlinkx/Spark-X2.6-4B-oQ5e-fp16
- Modelo base (XHToken/Spark-X2.6-4B): https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia del modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Proyecto oficial Spark-X2.6: https://github.com/XHToken/Spark-X2.6
