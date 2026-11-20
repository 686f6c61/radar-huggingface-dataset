# vdtry06/deveerbench-llama3-v3-hf

## Resumen

DevErrBench Llama 3 v3 es un ajuste fino mediante LoRA de `meta-llama/Meta-Llama-3-8B-Instruct`, desarrollado por el usuario `vdtry06`, especializado en explicar errores de línea de comandos DevOps a estudiantes en vietnamita. Dado un escenario (situación, estado del sistema, comando ejecutado y mensaje de error con su código de salida), el modelo genera una respuesta estructurada en tres secciones fijas: causa raíz, una pista pedagógica para que el alumno deduzca la solución y una solución de referencia. El objetivo declarado es formativo: no dar la respuesta directamente, sino guiar el aprendizaje.

El modelo parte de los pesos de Llama 3 8B Instruct (8.030.261.248 parámetros, transformer denso con 8.000 millones de parámetros activos en cada paso) y se entrena en dos fases: una primera (v1) sobre 261.673 escenarios sintéticos de error deduplicados, y una segunda (v3, este repositorio) que reanuda desde v1 con 92.117 muestras que combinan 31.349 ejemplos de cinco dominios (Kubernetes, Git, Terraform, Ansible, redes) y 60.768 variantes reproducidas de la primera fase. El ajuste se realizó con MLX-LM sobre una base cuantizada a 4 bits en un Apple M2 Pro.

Este repositorio contiene los pesos en bf16 para Transformers (Windows, Linux, GPU), obtenidos fusionando el adaptador LoRA en la base con `mlx_lm fuse` y des-cuantizando el resultado. Es relevante como artefacto de investigación sobre tutoría técnica automatizada y evaluación pedagógica multi-juez, pero el propio autor advierte de que no ha sido evaluado con estudiantes reales y de que las respuestas pueden ser incorrectas. El modelo está etiquetado únicamente para vietnamita y su licencia es la de Llama 3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), ajuste LoRA sobre base cuantizada a 4 bits |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B Instruct; no especificada en la model card) |
| Tipos de cuantización | Pesos publicados en bf16; base de entrenamiento en 4 bits (MLX); variante MLX 4-bit en repositorio separado |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | safetensors (bf16, 4 shards); repo de 16,1 GB |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Método de ajuste | LoRA en 16 capas, rango 8, escala 20, framework MLX-LM |
| Longitud máxima de secuencia en entrenamiento | 2.048 tokens |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de Llama 3 con 8.000 millones de parámetros, sin mezcla de expertos ni mecanismos de atención alternativa. Sobre esa base se aplicó un adaptador LoRA en 16 capas con rango 8 y escala 20, entrenado con MLX-LM en un Apple M2 Pro. El entrenamiento se hizo sobre la versión cuantizada a 4 bits `mlx-community/Meta-Llama-3-8B-Instruct-4bit`, y el adaptador se fusionó posteriormente con `mlx_lm fuse`; los pesos bf16 publicados son, por tanto, un modelo de 4 bits des-cuantizado más el adaptador, lo que no recupera la precisión de los pesos originales de Llama 3 en precisión completa.

El entrenamiento consta de dos fases. La fase 1 (v1) usó 261.673 escenarios sintéticos de error deduplicados (259.673 de entrenamiento y 2.000 de validación), generados con interfaces comerciales de LLM (Claude, Gemini, ChatGPT) en siete dominios: Ansible, Docker, Git, Kubernetes, Linux, red y Terraform; se deduplicaron por dominio y causa raíz y se comprobó la fuga de datos frente al conjunto de test con similitud coseno TF-IDF. La fase 2 (v3) reanudó desde v1 con 92.117 muestras (89.354 de entrenamiento y 2.763 de validación): 31.349 muestras de la fase 1 de cinco dominios seleccionadas por palabras clave en la pregunta, más 60.768 variantes reproducidas (proporción aproximada 34:66). Los hiperparámetros fueron tasa de aprendizaje 2e-6, decaimiento coseno, 100 pasos de warmup, AdamW con weight decay 0.01, dropout 0.05, batch efectivo 8 y secuencia máxima de 2.048 tokens. Se detuvo con la mejor pérdida de validación de 0.162 en la iteración 1.000 (paciencia 2). No se menciona RLHF ni DPO en la información disponible. Los datos de entrenamiento no se publican con el modelo.

## Capacidades

- Generación de texto conversacional en vietnamita con formato estructurado en tres secciones fijas (causa raíz, pista pedagógica, solución de referencia).
- Explicación de errores de línea de comandos en siete dominios DevOps: Ansible, Docker, Git, Kubernetes, Linux, red y Terraform.
- Razonamiento diagnóstico a partir de contexto estructurado: situación, estado del sistema, comando ejecutado, stderr y código de salida.
- Capacidad pedagógica orientada a guiar al alumno en lugar de dar la solución directa.
- Soporte del chat template de Llama 3 (`<|eot_id|>` como token de fin de secuencia).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada: el modelo está etiquetado solo para vietnamita; el resto de idiomas no está validado.

## Casos de uso

- Tutoría de laboratorios DevOps: el modelo recibe el comando fallido y el stderr de un alumno y devuelve causa raíz, pista y solución, encajando en plataformas de formación que necesitan respuestas estructuradas y evaluables automáticamente.
- Asistente de autoaprendizaje en CLI: integrado en una herramienta de terminal que captura el código de salida y el mensaje de error de `kubectl`, `terraform` o `git` y los envía al modelo con el prompt de entrenamiento.
- Generación de material docente: a partir de un catálogo de errores reales de un curso, el modelo produce explicaciones con pista pedagógica que el instructor revisa antes de publicar.
- Soporte de primer nivel en mesas de ayuda internas: clasificación y explicación de errores comunes de Docker o Kubernetes en vietnamita para reducir el volumen de tickets escalados.
- Evaluación formativa automatizada: comparación de la respuesta del alumno con la sección de solución de referencia generada por el modelo, con revisión humana posterior.
- Documentación de runbooks: redacción de entradas de troubleshooting con estructura homogénea (causa, pista, solución) a partir de incidentes registrados en logs.
- Prototipado de investigación en evaluación pedagógica: servir de base para experimentos con jueces LLM y métricas de calidad didáctica, dado que el autor publica el protocolo de evaluación multi-juez.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test DevErrBench: 700 escenarios reservados en siete dominios (Kubernetes 105, Linux 95, 100 en cada uno de los demás). Cada respuesta se puntuó de 1 a 5 en precisión, pedagogía, practicidad y claridad por tres jueces LLM de familias distintas. La evaluación se realizó con la build MLX 4-bit del modelo.

| Modelo | Juez Llama 3.1 8B | Juez Gemma 3 4B | Juez Qwen 2.5 7B |
|---|---|---|---|
| Este modelo (v3) | 4,28 | 4,82 | 3,82 |
| Base Llama 3 8B Instruct 4-bit | 4,05 | 4,74 | 3,80 |
| Llama 3.1 8B Instant (Groq, referencia en nube) | 4,69 | 4,91 | 3,95 |

Test de Wilcoxon pareado frente a la base (N = 700): la ganancia media es significativa con el juez Llama (+0,232; IC 95 % [+0,164, +0,298]) y con el juez Gemma (+0,076; [+0,059, +0,094]), pero no con el juez Qwen (+0,018; [−0,009, +0,044]; p = 0,189). La mejora en pedagogía tiene la misma dirección con los tres jueces.

Latencia del modelo v3 fusionado en un Apple M2 Pro con el servidor MLX (50 prompts, streaming, máximo 512 tokens nuevos, 2026-07-20): mediana de tiempo hasta el primer token de 0,89 s, mediana de throughput de 6,4 tokens/s y mediana de tiempo hasta la respuesta completa de 61 s. Estas cifras corresponden a la build MLX 4-bit; los pesos bf16 de este repositorio no se cronometraron.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB, según la propia model card.
- GPU recomendadas: A100, H100 o cualquier GPU con 16 GB o más de memoria para bf16; en consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes.
- En GPUs de 8-12 GB sería necesario recurrir a cuantización (por ejemplo, 4 bits) o a offloading, no documentado por el autor para esta build.
- Despliegue: la model card indica que vLLM puede servir el repositorio directamente; también es compatible con transformers (`AutoModelForCausalLM`), y para Apple Silicon existe la variante MLX 4-bit en `vdtry06/deveerbench-llama3-v3`. No se documenta soporte explícito de llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo medidos en la build MLX 4-bit sobre M2 Pro (0,89 s hasta el primer token, 6,4 tokens/s, 61 s hasta completar respuesta con 512 tokens nuevos). No hay cifras para GPU con los pesos bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DevErrBench Llama 3 v3 (este modelo) | 8,03 B | 8.192 (heredado) | Tutoría DevOps en vietnamita, LoRA sobre Llama 3 8B Instruct | Llama 3 | Hugging Face (bf16 y MLX 4-bit) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Asistente generalista | Llama 3 | Hugging Face |
| Llama 3.1 8B Instant (Groq) | 8 B | No disponible | Asistente generalista servido en nube | Llama 3.1 | API en nube |
| Gemma 3 4B | 4 B | No disponible en la información proporcionada | Asistente generalista | Gemma | Hugging Face |

En la evaluación del autor, este modelo supera a la base Llama 3 8B Instruct 4-bit con dos de los tres jueces y queda por debajo de la referencia en nube Llama 3.1 8B Instant en las tres métricas de juez. No se dispone de comparaciones con otros ajustes finos específicos de DevOps en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara que el modelo no se ha evaluado con estudiantes reales y que no es una herramienta de seguridad.
- Riesgo de alucinación: las respuestas pueden ser incorrectas; la model card lo advierte explícitamente.
- Precisión degradada: los pesos bf16 son una base de 4 bits des-cuantizada más el adaptador, no los pesos originales de Llama 3 en precisión completa.
- Idiomas: solo vietnamita; el uso en castellano u otros idiomas no está validado.
- Formato de prompt rígido: el modelo se entrenó con un formato concreto de sistema y usuario; otros formatos funcionan de forma menos fiable.
- Sesgos: no documentados en la información disponible; los escenarios de entrenamiento son sintéticos y generados por LLM comerciales, lo que puede introducir sesgos de esos generadores.
- Licencia Llama 3: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- Datos de entrenamiento no publicados, lo que dificulta la auditoría y la reproducibilidad.
- Contexto máximo de 8.192 tokens heredado de Llama 3 8B; no se documenta ampliación.

## Enlaces

- Hugging Face (bf16, Transformers): https://huggingface.co/vdtry06/deveerbench-llama3-v3-hf
- Variante MLX 4-bit para Apple Silicon: https://huggingface.co/vdtry06/deveerbench-llama3-v3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Base cuantizada usada en entrenamiento: https://huggingface.co/mlx-community/Meta-Llama-3-8B-Instruct-4bit
