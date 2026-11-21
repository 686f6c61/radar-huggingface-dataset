# sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF

## Resumen

Qwen-4B-Sagui (también publicado como Sagui-4B) es una cuantización GGUF de Qwen3.5-4B, un modelo multimodal de 3.930.400.256 parámetros (~3,93 mil millones) desarrollado por el usuario sysrobson a partir del modelo base Qwen/Qwen3.5-4B. Su objetivo es ofrecer razonamiento paso a paso, lectura de imágenes y generación de código TypeScript en hardware muy limitado: según el autor, funciona en una GPU de 4 GB de 2014, como una GTX 970, a unos 21,2 tok/s.

El modelo se distribuye en formato GGUF con cuantización IQ3_XXS generada mediante imatrix, lo que reduce el peso total a 2,38 GB (1,71 GB de modelo más 0,67 GB de proyector visual). Está pensado para su uso con Ollama y llama.cpp, con soporte de tool calling y modo de razonamiento (thinking). Es relevante para desarrolladores que necesitan un asistente local de código y visión sin depender de la nube ni de GPU de gama alta.

La licencia es Apache-2.0 y los idiomas declarados son inglés y portugués, con soporte para otras escrituras latinas. El modelo conserva las capacidades de visión, razonamiento y tool calling del modelo base, a costa de una pérdida de entre 5 y 9 puntos en benchmarks de TypeScript respecto a la cuantización Q4_K_M de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; multimodal image-text-to-text) |
| Parámetros totales | 3.930.400.256 (~3,93 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_XXS (imatrix); el repo distribuye un único cuantizado de 2,4 GB |
| Idiomas soportados | inglés, portugués y otras escrituras latinas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-4B en la documentación proporcionada. Se trata de un modelo multimodal de tipo image-text-to-text, con un componente de modelo de lenguaje (1,71 GB en IQ3_XXS) y un proyector visual independiente (0,67 GB), lo que permite ejecutar solo el modelo de texto cuando no se necesitan imágenes. El pipeline declarado es image-text-to-text y la librería es GGUF.

El proceso de creación documentado es una cuantización IQ3_XXS con imatrix sobre Qwen3.5-4B, no un entrenamiento desde cero. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la compresión: un 40 % menos de tamaño que la cuantización Q4_K_M de origen (2,38 GB frente a 3,51 GB con visión; 1,71 GB frente a 2,83 GB sin visión) manteniendo thinking, visión y tool calling, con una pérdida de 5 a 9 puntos en los benchmarks de TypeScript.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento paso a paso con modo thinking explícito, que verifica el trabajo a costa de mayor latencia.
- Generación de código, con especialización declarada en TypeScript y JavaScript.
- Visión: lectura de imágenes y capturas de pantalla, incluida la interpretación de errores de editor y la generación de componentes React a partir de una captura de UI.
- Tool calling / function calling.
- Capacidades multilingües limitadas a inglés, portugués y otras escrituras latinas.
- Ejecución completamente offline en hardware de gama baja.

## Casos de uso

- Asistente de código local en TypeScript: el modelo puede interpretar capturas de pantalla del editor, explicar errores de compilación como TS2322 y proponer la línea corregida, sin enviar código a servicios externos.
- Generación de componentes React a partir de diseños: dado un mockup o captura de una interfaz, produce código JSX funcional; el autor documenta la generación de un formulario de registro a partir de una imagen, con thinking activado.
- Atención al cliente en portugués o inglés: conversaciones multi-turno en local para entornos con requisitos de privacidad, aunque la longitud de contexto no está documentada.
- Automatización de tareas con tool calling: integración en flujos de agente que invocan funciones externas (APIs, scripts) en entornos de desarrollo con recursos limitados.
- Razonamiento asistido en dispositivos de borde: cálculos paso a paso (por ejemplo, duraciones, conversiones de unidades) en equipos sin GPU dedicada o con GPU de 4 GB.
- Prototipado y educación: ejecución en una GTX 970 o similar para experimentar con modelos multimodales y de razonamiento sin inversión en hardware.
- Revisión de código en CI/CD ligero: dada su velocidad (21,2 tok/s en GTX 970) y su tamaño, puede desplegarse en runners con poca VRAM para comprobaciones básicas de código TypeScript.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Sagui-4B (IQ3_XXS) | Qwen3.5-4B Q4_K_M (origen) |
|---|---|---|---|
| HumanEval-TS (MultiPL-E) | pass@1 | 44,0 % | 52,8 % |
| MBPP-TS (MultiPL-E) | pass@1 | 54,6 % | 59,7 % |
| Velocidad en GTX 970 (llama.cpp, 4 GB) | tok/s | 21,2 | 20,5 |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB con visión (1,71 GB de modelo más 0,67 GB de proyector); unos 1,71 GB sin imágenes.
- GPU recomendadas: el autor cita una GTX 970 de 4 GB (2014) como referencia mínima; cualquier GPU consumer con 4 GB o más de VRAM es suficiente.
- Cabe en GPU consumer de gama baja y media (GTX 970, GTX 1060, RTX 3060, etc.).
- Despliegue: Ollama (`ollama run hf.co/sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF:IQ3_XXS`) y llama.cpp; también descarga directa de archivos con `hf download`.
- Latencia y throughput: 21,2 tok/s en GTX 970 con llama.cpp. Ejemplos del autor: 63 tokens en 26,8 s para corregir un error de TypeScript desde captura; 2332 tokens en 174,2 s para generar un componente React con thinking; 3542 tokens en 254,5 s para un problema aritmético con razonamiento extenso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-4B-Sagui (IQ3_XXS) | ~3,93 B | no disponible | Apache-2.0 | GGUF | 2,38 GB con visión; HumanEval-TS 44,0 %; MBPP-TS 54,6 % |
| Qwen3.5-4B Q4_K_M (origen) | ~3,93 B | no disponible | Apache-2.0 | GGUF | 3,51 GB con visión; HumanEval-TS 52,8 %; MBPP-TS 59,7 % |
| Sagui-4B-Vision-Thinking-Code-GGUF | ~3,93 B | no disponible | Apache-2.0 | GGUF | Mismo modelo publicado con otro nombre por el mismo autor |

No se dispone de datos de otros modelos comparables de 4B multimodales en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ3_XXS degrada el rendimiento en código: 8,8 puntos menos en HumanEval-TS y 5,1 puntos menos en MBPP-TS respecto a Q4_K_M.
- Cobertura lingüística limitada: inglés, portugués y escrituras latinas; no se garantiza soporte de escrituras no latinas.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en razonamiento largo y generación de código complejo.
- El modo thinking genera respuestas muy extensas (miles de tokens) y eleva la latencia; el autor recomienda desactivarlo cuando se prioriza la velocidad.
- En el ejemplo de generación de UI, el modelo omitió los placeholders de los campos y, sin thinking, ignoró la petición de estilos inline.
- La longitud de contexto no está documentada, lo que dificulta planificar usos con entradas largas.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); los resultados de sampling no están sembrados, por lo que la reproducibilidad es parcial.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B.

## Enlaces

- Hugging Face: https://huggingface.co/sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Publicación alternativa del mismo modelo: https://huggingface.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset MultiPL-E (HumanEval-TS, MBPP-TS): https://huggingface.co/datasets/nuprl/MultiPL-E
- Transcripciones de ejemplos: `examples/transcripts.json` (en el repositorio del modelo)
- Script de reproducción de demos: `scripts/run_demos.py` (en el repositorio del modelo)
- Donaciones al autor: https://www.paypal.com/donate/?hosted_button_id=JA6B7RKJURXNW
