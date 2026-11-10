# TerryGuo1126/gemma-3-1b-it-gemma-c

## Resumen

Gemma 3 1B IT — Gemma.c es una exportación cuantizada del modelo `google/gemma-3-1b-it` de Google, publicada por el usuario TerryGuo1126. Se trata de una conversión de los pesos originales al formato `.bin` propietario que consume el motor de inferencia Gemma.c, un proyecto en C11 de un solo archivo desarrollado por el mismo autor. No es un modelo nuevo ni un fine-tuning: es una reempaquetado de los pesos de Gemma 3 1B en su variante instruction-tuned, con cuantización int8 y escalas float32 por canal.

La relevancia de esta ficha es acotada: el modelo base (Gemma 3 1B IT) es un transformer denso de aproximadamente 1.000 millones de parámetros con licencia Gemma, mientras que esta exportación sirve exclusivamente para ejecutar inferencia mediante el binario `gemma` compilado desde el repositorio Gemma.c. Los pesos en formato `.bin` no son cargables por `transformers`, lo que limita su uso a entornos que acepten este motor específico.

El tamaño del repositorio es de 1,0 GB, coherente con un modelo de ~1B parámetros cuantizado a int8 con escalas float32. El modelo fue creado y actualizado el 10 de noviembre de 2026, y en el momento de redactar esta ficha no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-3-1b-it) |
| Parametros totales | ~1.000 millones (modelo base Gemma 3 1B; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con escalas float32 por canal; export en float32 |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | `.bin` propietario de Gemma.c (no cargable por transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-3-1b-it`, un transformer denso de la familia Gemma 3 de Google. Esta exportación no aporta información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en la model card de esta conversión.

La innovación técnica de esta publicación no está en el modelo sino en el formato: los pesos se han convertido al formato `.bin` de Gemma.c, un motor de inferencia escrito desde cero en C11, de un solo archivo, con tokenizador BPE propio, paralelismo OpenMP y sin dependencias de terceros. Los pesos son int8 con escalas float32 por canal, y el binario debe compilarse con `-DDTYPE=FP32` (valor por defecto) para que coincida con el tipo de dato del archivo exportado. El motor soporta, según su repositorio, la familia Gemma 1/2/3 en texto y visión SigLIP, aunque esta exportación concreta es solo de texto.

## Capacidades

- Generación de texto en modo instruction-tuned, heredada de Gemma 3 1B IT.
- Razonamiento básico y respuesta a instrucciones conversacionales.
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad limitada por el tamaño de 1B).
- Soporte multilingüe: no confirmado en la información disponible para esta exportación.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el tamaño del modelo lo hace poco adecuado para tareas agénticas complejas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en esta exportación; el motor Gemma.c soporta visión SigLIP en general, pero este archivo es solo de texto.

## Casos de uso

- Inferencia embebida en C: ejecutar el modelo con el binario `gemma` compilado desde Gemma.c en entornos donde no se dispone de Python, PyTorch ni `transformers`, aprovechando que el motor no tiene dependencias de terceros.
- Prototipado de motores de inferencia: servir como caso de prueba para validar la implementación de cuantización int8 y tokenizador BPE de Gemma.c frente a los pesos oficiales de Google.
- Experimentación educativa: estudiar el formato `.bin` y el proceso de conversión de pesos de un transformer a un motor en C11 de un solo archivo.
- Despliegue en hardware modesto: al tratarse de un modelo de ~1B parámetros en int8, puede ejecutarse en CPU con OpenMP en máquinas sin GPU dedicada.
- Pruebas de integración continua: verificar el binario `gemma` en pipelines que compilen el motor y ejecuten prompts de smoke test con `--prompt` y `--tokens`.
- Evaluación comparativa de cuantización: contrastar la calidad de salida del int8 por canal frente al modelo original en float32/bfloat16 usando `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,0 GB, coherente con pesos int8 de ~1B parámetros más escalas float32; la inferencia en CPU requiere al menos ~1-2 GB de memoria libre (estimación, no confirmada en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada; el motor Gemma.c documenta paralelismo OpenMP para CPU, no se menciona soporte CUDA.
- ¿Cabe en GPU consumer? No confirmado; el motor está orientado a CPU según su descripción.
- Opciones de despliegue: exclusivamente el binario `gemma` de Gemma.c (`make` y ejecución con `./gemma gemma-3-1b-it.bin --prompt "..." --tokens N`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 1B IT — Gemma.c (esta ficha) | ~1B | no disponible | `.bin` (Gemma.c) | Gemma Terms of Use | Hugging Face, 0 descargas |
| google/gemma-3-1b-it | ~1B | no disponible | safetensors | Gemma Terms of Use | Hugging Face (oficial) |
| Gemma.c (motor) | no aplica | no aplica | C11, sin dependencias | no disponible | GitHub |

La comparación relevante es con el modelo base oficial: esta exportación ofrece el mismo modelo en un formato alternativo para un motor específico, a cambio de perder compatibilidad con el ecosistema estándar de `transformers`. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Los pesos en formato `.bin` no son cargables por `transformers`; solo funcionan con el binario Gemma.c compilado con `-DDTYPE=FP32`.
- El modelo base es de ~1B parámetros, por lo que su capacidad de razonamiento, código y matemáticas es limitada en comparación con modelos mayores.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Gemma 3 1B IT.
- Idiomas soportados: no disponibles; no se confirma el soporte multilingüe de esta exportación.
- Licencia: sujeta a los Gemma Terms of Use (ai.google.dev/gemma/terms); es necesario revisar las restricciones de uso comercial antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la calidad de la conversión no está verificada por terceros.
- El motor Gemma.c es un proyecto de un solo autor; su madurez y mantenimiento a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TerryGuo1126/gemma-3-1b-it-gemma-c
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Repositorio del motor Gemma.c: https://github.com/terryguo3180-eng/Gemma.c
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
