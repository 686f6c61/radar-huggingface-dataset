# UraionLabs/Uraion-Cyber-Preview-GGUF

## Resumen

Uraion Cyber Preview es un ajuste fino de tipo mixture-of-experts (MoE) orientado a seguridad y análisis de código, desarrollado por Uraion Labs. Se construye sobre la arquitectura del checkpoint público Qwen3.5-35B-A3B de Alibaba y aplica una ronda de entrenamiento de preferencias on-policy que se fusiona en los pesos base. El resultado conserva la estructura del modelo original: aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos por token, distribuidos en 256 expertos con 8 enrutados por token.

La ficha que nos ocupa corresponde a la exportación cuantizada Q4_K_M en formato GGUF para llama.cpp, un único archivo de 21,2 GB con tokenizador y plantilla de chat embebidos. Es relevante para desarrolladores que necesitan ejecutar localmente un modelo de razonamiento con contexto muy largo (262.144 tokens) y capacidad de análisis de código y ciberseguridad, sin depender de infraestructura de GPU de gran escala.

El modelo se presenta explícitamente como una versión preview: una sola ronda de entrenamiento, evidencia de benchmarks con una única semilla y sin cualificación formal de release. La licencia es MIT, lo que facilita su uso comercial, aunque el autor advierte de que la salida en tareas de seguridad debe tratarse como un primer borrador y no como sustituto de un escáner o de una auditoría humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida lineal/completa (base Qwen3.5-35B-A3B) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens (límite arquitectónico; no probado a esa longitud en este archivo) |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único de 21.166.758.112 bytes; tokenizador y plantilla de chat embebidos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un transformer de mezcla de expertos con atención híbrida que combina capas de atención lineal con capas de atención completa, lo que permite sostener una ventana de 262.144 tokens con un coste de memoria más contenido que un transformer denso equivalente. Sobre esa base, Uraion Labs aplica una única ronda de entrenamiento de preferencias on-policy cuyos pesos se fusionan directamente en el checkpoint, sin cambiar tokenizador ni plantilla de chat.

La exportación GGUF se cuantizó una sola vez a Q4_K_M con cuatro hilos y sin matriz de importancia, y se eliminaron las cabezas de predicción next-N (incluida la cabeza especulativa MTP). Por eso el autor advierte de que no debe habilitarse un modelo draft/MTP con este archivo: las flags de decodificación especulativa fallarán o no aportarán nada. La información disponible no detalla el volumen de tokens de entrenamiento ni la composición del dataset de preferencias.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento: la plantilla embebida abre un bloque ` thinking` que separa el razonamiento de la respuesta final.
- Análisis y explicación de código: identificación de pares vulnerables en tareas tipo PrimeVul, explicación de fragmentos y detección de patrones problemáticos.
- Generación de código: resultados altos en HumanEval y HumanEval+ en la evaluación del autor.
- Conocimiento de ciberseguridad: preguntas de opción múltiple sobre inteligencia de amenazas (CTI).
- Soporte de tool calling y function calling a través del formato incluido en la plantilla de chat con `--jinja`.
- Capacidad multilingüe: no disponible (no se documentan idiomas).
- Capacidad de visión: la base incluye una torre de imagen, pero el autor indica explícitamente que no está probada, no se recomienda y no se reclama entrada de imágenes para esta exportación.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar diffs y señalar patrones de riesgo antes de fusionar una pull request, aprovechando su contexto de 262.144 tokens para evaluar archivos completos o varios a la vez.
- Triaje de alertas de seguridad: clasificación y explicación de hallazgos de escáneres, generando un borrador de justificación que un analista revisa después; adecuado por su especialización en código y CTI, siempre con validación humana.
- Asistente de desarrollo en local: ejecución con llama.cpp u Ollama en una estación de trabajo con GPU de 24-48 GB, ofreciendo razonamiento y generación de código sin enviar código propietario a la nube.
- Formación y concienciación en seguridad: generación de explicaciones didácticas de vulnerabilidades y ejemplos de parches, con la advertencia de que las respuestas pueden ser plausibles pero incorrectas.
- Servidor compatible con OpenAI para herramientas internas: despliegue con `llama-server` en el puerto 8000 y conexión de editores o agentes que usen la API de chat completions, gracias a la plantilla Jinja y al soporte de tool calling.
- Análisis de documentación técnica extensa: resumen y extracción de información de manuales, RFC o informes de incidentes largos, apoyándose en la ventana de contexto amplia y en el modo de razonamiento.
- Prototipado de agentes multi-paso: el formato de tool calling permite encadenar consultas a herramientas (lectura de archivos, ejecución de tests) en flujos de varios pasos, aunque el autor no ha validado BFCL en este archivo.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este archivo Q4_K_M, con 799 tareas, una semilla (`public-final-0`), temperatura 1.0, top_p 0.95, top_k 20, límite de salida de 8.192 tokens y límite de razonamiento de 1.024 tokens, servido con llama.cpp en una GPU de 96 GB:

| Benchmark | Items | Este archivo (Q4_K_M) | Padre BF16 | Base sin entrenar |
|---|---:|---:|---:|---:|
| PrimeVul filtered pairs | 335 | 295 (88,1 %) | 296 (88,4 %) | 290 (86,6 %) |
| CTI MCQ subset | 300 | 220 (73,3 %) | 217 (72,3 %) | 223 (74,3 %) |
| HumanEval base | 164 | 156 (95,1 %) | 156 (95,1 %) | 157 (95,7 %) |
| HumanEval+ | 164 | 148 (90,2 %) | 147 (89,6 %) | 148 (90,2 %) |

El propio autor advierte de que la comparación mezcla backend y precisión (vLLM con BF16 frente a llama.cpp con Q4_K_M), por lo que las diferencias no pueden atribuirse solo a la cuantización. No se probaron en este archivo IFEval ni BFCL; los valores del padre (78,93 % prompt-strict en IFEval y 89,75 % en BFCL) no se transfieren automáticamente.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 21,2 GB; hay que sumar la caché KV, que crece con el contexto. Con 32.768 tokens de contexto conviene presupuestar por encima de 21,2 GB, y a 262.144 tokens el límite práctico será la memoria de la caché KV antes que el propio modelo.
- GPU recomendadas: el autor midió en una GPU de 96 GB (clase A100/H100). Para uso cómodo con contexto largo se recomienda una GPU de 48 GB o superior.
- GPU de consumo: no probado en GPU de portátil ni en tarjetas de 24 GB; el autor no garantiza que quepa con contexto amplio. En una RTX 4090 (24 GB) el margen es muy ajustado y requeriría contextos reducidos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja`), y por compatibilidad de formato GGUF, Ollama u otros runners basados en llama.cpp. No se documenta soporte para vLLM o TGI con este archivo.
- Latencia y throughput: no disponibles. El autor solo confirma que las 799 generaciones se completaron sin errores de petición.
- Aviso: no habilitar flags de modelo draft/MTP; la exportación no incluye cabeza especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion Cyber Preview (Q4_K_M) | ~35B totales, ~3B activos | 262.144 | MIT | GGUF | Ajuste fino en seguridad y código, preview de una ronda |
| Qwen3.5-35B-A3B (padre) | ~35B totales, ~3B activos | 262.144 | no disponible en la información | safetensors (BF16) | Base pública de Alibaba; sin ajuste de preferencias |
| Qwen3.6-35B-A3B | ~35B totales, ~3B activos | no disponible | no disponible en la información | no disponible | Referencia usada por el autor en su model card; no se redistribuye |

La información disponible no permite comparar con otros ajustes finos de seguridad de tamaño similar; los datos de rendimiento del padre BF16 y de la base sin entrenar aparecen en la tabla de benchmarks.

## Limitaciones y advertencias

- Versión preview: una sola ronda de entrenamiento y evidencia de benchmarks con una única semilla; sin cualificación formal de release.
- Cuantización de 4 bits: pérdida de fidelidad general y especialmente en tareas de cola larga; validar en el dominio propio antes de depender del modelo.
- Salida de seguridad no fiable como definitiva: el modelo explica código plausible pero incorrecto con confianza; no sustituye a un escáner, una auditoría ni una revisión humana.
- Sin identidad aprendida: al ser un ajuste fino de un checkpoint público, no se identifica de forma fiable como "Uraion".
- Contexto: 262.144 tokens es el límite arquitectónico, pero no se ha ejecutado este archivo a esa longitud; el límite práctico lo marcará la memoria de la caché KV.
- Visión: la base incluye torre de imagen, pero no está probada ni recomendada; no se reclama entrada de imágenes.
- Idiomas: no documentados; el rendimiento fuera del inglés no está garantizado.
- Sin decodificación especulativa: no usar flags draft/MTP con este archivo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conservar la atribución a Qwen (Alibaba Group) por arquitectura, tokenizador y plantilla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF
- Modelo base BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview/blob/main/LICENSE
- Archivo Q4_K_M: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF/blob/main/Uraion-Cyber-Q4_K_M.gguf
- Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil de Uraion Labs: https://huggingface.co/UraionLabs
- Sitio web de Uraion Labs: https://uraionlabs.com/
