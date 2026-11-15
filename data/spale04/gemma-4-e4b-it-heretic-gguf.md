# spale04/gemma-4-E4B-it-heretic-GGUF

## Resumen

Gemma 4 E4B it — Heretic es una versión "abliterated" (sin alineamiento de seguridad) del modelo google/gemma-4-E4B-it, publicada por el usuario spale04 en formato GGUF para llama.cpp y derivados. El modelo conserva la arquitectura y los pesos del Gemma 4 E4B original (7.463.013.674 parámetros totales), pero se le han eliminado los rechazos mediante la técnica de ablación de rangos arbitrarios implementada en Heretic 2.1.0, con un adaptador LoRA de rango 50. El resultado es un modelo conversacional que responde a peticiones que el original rechazaría, con una degradación mínima en benchmarks de conocimiento general.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de "decensoring" reproducible en hardware de consumo (una única RTX 5060 Ti de 16 GB, unos 96 minutos de cómputo); por otro, sirve como referencia de las ventajas y los riesgos de este tipo de modificaciones. El autor publica métricas de divergencia KL frente al modelo original, tasas de rechazo antes y después, y una comparativa de benchmarks con seis tareas, lo que permite evaluar con rigor el coste real de la abliteración.

El modelo mantiene el contexto nativo de 131.072 tokens del Gemma 4 E4B y admite entrada de imagen y audio mediante un codificador multimodal separado (`mmproj`). Se distribuye bajo licencia Apache 2.0, igual que el modelo base, e incluye tanto los GGUF cuantizados (Q8_0, Q6_K, Q4_K_M con importance matrix) como el adaptador LoRA en formato PEFT para aplicar el cambio sobre los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B), modificado con ablación de rangos arbitrarios (LoRA rango 50) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (por defecto en el modelo base) |
| Tipos de cuantizacion | Q8_0 (7,97 GB), Q6_K (6,17 GB), Q4_K_M con importance matrix (5,30 GB); también BF16 y adaptador LoRA en PEFT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors (adaptador LoRA en `lora/`), encoder multimodal `mmproj` en F16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Gemma 4 E4B de Google, un transformer de 7.463 millones de parámetros totales con contexto de 131.072 tokens y capacidades multimodales (texto, imagen y audio) mediante un codificador separado. Sobre esta base, el autor aplica Heretic 2.1.0 con cuantización de 4 bits NF4 durante la búsqueda: 100 ensayos (30 aleatorios seguidos de optimización TPE), batch size 64 y aproximadamente 96 minutos de cómputo en una RTX 5060 Ti de 16 GB. La ablación se realiza con un LoRA de rango 50 sobre las capas 21 a 40, seleccionando el ensayo 91 de la frontera de Pareto (91 de 100 respuestas consideradas no rechazadas, KL 0,0196 durante la búsqueda).

El adaptador resultante se fusiona en los pesos completos en bf16 y se convierte a GGUF con `convert_hf_to_gguf.py`, generando primero un BF16 y luego las cuantizaciones con `llama-quantize`. El archivo Q4_K_M se genera con una importance matrix calculada sobre 80 fragmentos del conjunto de entrenamiento de Wikitext-2, lo que reduce la divergencia KL de 0,257 (Q4_K_M estándar) a 0,088. El codificador multimodal (`mmproj`) no se modifica: Heretic solo altera las capas del modelo de lenguaje. No se dispone de información sobre el dataset de entrenamiento original del Gemma 4 E4B ni sobre si hubo RLHF o DPO en su construcción.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 131.072 tokens).
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU 68,4; ARC-Challenge 51,2; HellaSwag 59,5).
- Razonamiento matemático (GSM8K 76,0).
- Seguimiento de instrucciones (IFEval 83,0).
- Entrada multimodal de imagen y audio mediante el archivo `mmproj-gemma-4-E4B-it-heretic-F16.gguf` (codificador sin modificar respecto al original).
- Respuestas sin rechazos: 1 de 100 respuestas marcadas como rechazo en la evaluación de Heretic, frente a 100 de 100 en el modelo original.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar empíricamente qué comportamientos cambian al eliminar los rechazos, con métricas de KL y de benchmarks publicadas para comparar contra el original.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, conflicto, contenido adulto) sin que el modelo se niegue, siempre que el operador añada sus propias salvaguardas.
- Despliegue en móvil o hardware de consumo: el archivo Q4_K_M (5,30 GB) está pensado para teléfonos con al menos 12 GB de RAM, y Q6_K para 12 GB o más; en CPU (Ryzen 5 7500F, 6 hilos) alcanza 17,1 tokens/s con Q4_K_M.
- Asistente local en PC con GPU de gama media: con Q8_0 en una RTX 5060 Ti se obtienen 71 tokens/s, adecuado para chat interactivo y resumen de documentos largos gracias al contexto de 131.072 tokens (limitando la ventana para no desbordar la VRAM).
- Análisis multimodal local: con el `mmproj` se pueden procesar imágenes y audio junto con texto en un pipeline llama.cpp, por ejemplo para descripción de imágenes o transcripción asistida, sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: los archivos publicados permiten medir el impacto de Q8_0, Q6_K y Q4_K_M con imatrix sobre la calidad (KL 0,005, 0,022 y 0,088 respectivamente) en tareas de generación.
- Base para experimentos de "steering" o edición de comportamiento: el adaptador LoRA en `lora/` (149 MB) se puede aplicar sobre el modelo original para reproducir o modificar la ablación sin partir de los GGUF.

## Benchmarks y rendimiento

Evaluados con lm-evaluation-harness 0.4.13, ambos modelos cargados en 4 bits NF4, mismas semillas, con el token `<bos>` forzado al inicio de cada secuencia.

| Benchmark | Preguntas | Original | Heretic | Diferencia |
|---|---|---|---|---|
| MMLU | 1.710 | 68,7 ± 1,1 | 68,4 ± 1,1 | −0,4 |
| ARC-Challenge | 1.172 | 51,6 ± 1,5 | 51,2 ± 1,5 | −0,4 |
| HellaSwag | 1.000 | 60,3 ± 1,5 | 59,5 ± 1,6 | −0,8 |
| TruthfulQA MC2 | 817 | 54,1 ± 1,6 | 48,3 ± 1,6 | −5,9 |
| GSM8K | 250 | 76,8 ± 2,7 | 76,0 ± 2,7 | −0,8 |
| IFEval | 200 | 82,0 ± 2,7 | 83,0 ± 2,7 | +1,0 |

Resultados de abliteración medidos por Heretic sobre 100 prompts dañinos y 100 inofensivos, modelo en 4 bits NF4:

| Métrica | Original | Este modelo |
|---|---|---|
| Rechazos | 100/100 | 1/100 |
| Divergencia KL respecto al original | 0 | 0,0475 |

Calidad de las cuantizaciones frente al BF16 (Wikitext-2, 32 fragmentos, `llama-perplexity`):

| Archivo | Tamaño | KL media vs BF16 | Mismo token top-1 |
|---|---|---|---|
| Q8_0 | 7,97 GB | 0,005 | 97,1 % |
| Q6_K | 6,17 GB | 0,022 | 93,9 % |
| Q4_K_M-imat | 5,30 GB | 0,088 | 87,6 % |

Rendimiento (llama-bench b12387, RTX 5060 Ti 16 GB con todas las capas en GPU): Q8_0 71 tokens/s, Q6_K 85 tokens/s, Q4_K_M 99 tokens/s. Solo CPU (Ryzen 5 7500F, 6 hilos): Q6_K 13,6 tokens/s, Q4_K_M 17,1 tokens/s.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 8 GB para los pesos más la caché KV; Q6_K unos 6,2 GB; Q4_K_M unos 5,3 GB. El `mmproj` añade 0,99 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (configuración usada por el autor), RTX 4090, A100 o H100 para mayor throughput. Cualquier GPU con 8 GB o más puede ejecutar Q4_K_M o Q6_K.
- Cabe en GPU de consumo: sí; Q4_K_M en tarjetas de 8 GB, Q6_K en 8-12 GB y Q8_0 en 12-16 GB. El autor indica que Q6_K y Q4_K_M caben en teléfonos con 12 GB de RAM o más.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), y herramientas construidas sobre llama.cpp (Ollama, LM Studio, etc.). El adaptador LoRA requiere PEFT para aplicarse sobre el modelo original en transformers.
- Latencia y throughput: 71 tokens/s (Q8_0), 85 (Q6_K) y 99 (Q4_K_M) en RTX 5060 Ti 16 GB con todas las capas en GPU; 13,6 y 17,1 tokens/s en CPU de 6 hilos para Q6_K y Q4_K_M respectivamente.
- Advertencia de contexto: el autor recomienda fijar un límite de contexto explícito; con el valor por defecto de 131.072 tokens en una tarjeta de 16 GB se desborda la VRAM y la velocidad de Q8_0 cae de 71 a 9 tokens/s. Recomienda dejar la caché KV sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 E4B it — Heretic (este) | 7.463 M | 131.072 | 68,4 | 76,0 | Apache 2.0 | GGUF + LoRA en HF |
| google/gemma-4-E4B-it (original) | 7.463 M | 131.072 | 68,7 | 76,8 | Apache 2.0 | Pesos originales en HF |
| Otras variantes abliterated de Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es contra el modelo base, ya que la información disponible no incluye datos de otros modelos abliterated comparables. La diferencia principal frente al original es la tasa de rechazo (1/100 frente a 100/100) y la caída en TruthfulQA (−5,9 puntos), con el resto de benchmarks dentro del ruido estadístico.

## Limitaciones y advertencias

- El modelo no está alineado en seguridad: se le han eliminado los rechazos de forma deliberada. Puede generar contenido dañino, ilegal o sexualmente explícito si se le solicita; es responsabilidad del operador añadir sus propias barreras.
- Caída real en TruthfulQA MC2 de 5,9 puntos: el modelo es menos cauto y afirma con más confianza creencias erróneas comunes. Conviene verificar cualquier dato factual que produzca con seguridad.
- Riesgo de alucinación inherente al modelo base, agravado por la menor tendencia a matizar. No apto para dominios de alta exigencia factual sin verificación externa.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los sesgos del Gemma 4 original se mantienen y pueden amplificarse al eliminar los mecanismos de rechazo.
- Idiomas soportados: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin alineamiento en producción puede incumplir normativas locales de contenido o las políticas de las plataformas de despliegue.
- El contexto de 131.072 tokens no es viable en GPUs de 16 GB con caché KV sin cuantizar; hay que limitar la ventana o cuantizar la caché, lo que el autor desaconseja.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las métricas publicadas por el autor.
- La cuantización Q4 estándar degrada notablemente este modelo (KL 0,257); solo la versión con importance matrix es recomendable en 4 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spale04/gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
