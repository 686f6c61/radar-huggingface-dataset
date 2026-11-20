# webbrain-one/openbonsai-qwen-3.5-9b

## Resumen

OpenBonsai Qwen3.5-9B es una compresión a pesos ternarios del modelo Qwen/Qwen3.5-9B, publicada por el proyecto independiente webbrain-one mediante el framework de compresión abierto OpenBonsai (licencia Apache-2.0). El modelo reduce los aproximadamente 8.950 millones de parámetros del modelo base a valores en {-1, 0, +1} agrupados en bloques de 128 con una escala fp16 por grupo, lo que da como resultado un único fichero GGUF de 1.997.486.976 bytes (unos 2 GB) frente a los aproximadamente 18 GB que ocuparían los pesos en BF16.

Se trata de una versión de investigación (research preview), no de un producto terminado, y su interés radica en demostrar que la cuantización ternaria post-entrenamiento (PTQ1_0) puede preservar capacidades funcionales de razonamiento y código en un modelo de casi 9.000 millones de parámetros que cabe en memoria RAM de consumo. La segunda release, publicada el 28 de octubre de 2026, está orientada a código y razonamiento: según el autor, pasa 62 de 114 problemas de HumanEval fuera del subconjunto de selección, frente a los 45 de la primera release.

El modelo es solo texto (sin torre de visión ni capas MTP), no está afiliado ni respaldado por Prism ML (autor de Ternary Bonsai 2 9B, cuyo layout de tensores reutiliza) y requiere runtimes específicos, ya que el llama.cpp upstream no soporta PTQ1_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) con pesos ternarios; sin visión ni MTP |
| Parametros totales | 8.953.803.264 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria PTQ1_0: pesos en {-1, 0, +1}, grupos de 128 con una escala fp16 por grupo; activaciones cuantizadas a 8 bits en el runtime de Prism |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `OpenBonsai-Qwen3.5-9B-PTQ1_0.gguf`, ~2 GB, SHA-256 `818d8783bc39d92b2777a0333d38f7a25021a7b906f47344b83b7109eba6f7a0`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y aplica una cuantización ternaria post-entrenamiento sobre las 202 matrices grandes, incluidas la embedding y la cabeza de salida. El proceso, ejecutado en una única RTX 5090 con `openbonsai run --config examples/qwen3_5-9b-reasoning-code.yaml` (unas 5 horas estimadas desde cero), consta de cinco etapas: generación de trazas propias por el modelo en BF16 sobre 2.400 prompts (2,51 M de tokens, 2,10 M generados; el 50 % de los tokens generados son código, frente al 32 % de la primera release), rotación de signo más Hadamard en el layout de Prism, redondeo ternario mediante GPTQ secuencial sobre 256 × 2.048 tokens (192 bloques de trazas, 32 de WikiText-2 train y 32 de UltraChat), ternarización de embedding y cabeza también por GPTQ, y destilación de escalas por grupo.

Los prompts provienen de los splits de entrenamiento de GSM8K, MATH, MBPP y OpenCodeInstruct, más UltraChat, con thinking activado y desactivado, siguiendo la idea AYOT de ScaleQ-1.58 (arXiv 2608.01078). Existe una guarda de contaminación que rechaza problemas de test de GSM8K y HumanEval y descarta prompts de entrenamiento que compartan una secuencia de 13 palabras con uno de test, aunque el propio autor advierte que no detecta tareas de test reformuladas con otras palabras. El modelo aplica sus propios vectores de signo Hadamard, distintos de los de Ternary-Bonsai-2-9B; con la rotación desactivada la perplejidad se dispara a millones.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla y tokenizador embebidos en el GGUF.
- Razonamiento con modo thinking (la plantilla de Qwen3.5 lo activa por defecto; el modelo a menudo piensa más de 4.096 tokens).
- Generación de código: es la capacidad prioritaria de esta segunda release (50 % de tokens de código en las trazas de entrenamiento).
- Matemáticas: evaluación sobre GSM8K en el harness de PyTorch en BF16.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no soportados (modelo solo texto, sin torre de visión).

## Casos de uso

- Experimentación en investigación sobre cuantización ternaria: reproducir el pipeline de OpenBonsai con la configuración publicada para estudiar el impacto del redondeo GPTQ secuencial y la destilación de escalas en modelos de ~9B.
- Inferencia en CPU de bajo coste: el autor reporta unos 2 GB de RAM y unos 10 tokens/s de generación en un i5-13420H con 4 hilos y `-rtr 1`, lo que permite desplegar el modelo en portátiles o servidores sin GPU.
- Evaluación de asistentes de código en entornos con memoria limitada: útil para probar flujos de generación de código donde el presupuesto de RAM impide cargar el modelo base en BF16, asumiendo la pérdida de precisión frente al original.
- Pruebas de pipelines de razonamiento con thinking: permite medir el comportamiento de cadenas de pensamiento largas (más de 4.096 tokens) en un modelo ternario y comparar con el modelo base.
- Docencia y demostraciones de compresión de modelos: el tamaño de ~2 GB y la licencia Apache-2.0 facilitan su uso en cursos y talleres sobre cuantización extrema.
- Verificación de paridad entre runtimes: los datos de paridad publicados (99,2 % de coincidencia en el primer token frente a una referencia PyTorch FP32, perplejidad 14,15 en WikiText-2) sirven para validar implementaciones de PTQ1_0 en llama.cpp o ik_llama.cpp.

## Benchmarks y rendimiento

| Benchmark | OpenBonsai Qwen3.5-9B (2.ª release) | Primera release | Notas |
|---|---|---|---|
| HumanEval, subconjunto congelado de 50 problemas (thinking off) | 34/50 | 19/50 | Subconjunto usado para seleccionar entre cuatro runs; parte de sus tareas aparece reformulada en los datos de entrenamiento, por lo que probablemente sobreestima la mejora |
| HumanEval, 114 problemas fuera del subconjunto | 62/114 | 45/114 | 34 marcados por un filtro como la misma tarea o relacionada con una de las trazas; en los otros 80 pasa 38 frente a 26 |
| Perplejidad WikiText-2 (8 chunks de 512 tokens, 2.040 posiciones) | 14,15 | no disponible | Coincide entre el runtime de Prism y la referencia PyTorch FP32; ik_llama.cpp da 14,15 con `-rtr 1` y 14,14 sin él |
| Paridad de primer token frente a PyTorch FP32 | 99,2 % (runtime de Prism), 99,0 % (ik_llama.cpp) | no disponible | Sobre las 2.040 posiciones de WikiText-2 |
| GSM8K | no disponible (el autor indica que matemáticas y código siguen por debajo del modelo original y de Ternary Bonsai 2 9B) | no disponible | — |

## Requisitos de hardware

- VRAM/RAM de inferencia: unos 2 GB para el fichero GGUF; el autor reporta unos 2 GB de RAM en CPU.
- GPU recomendadas: no disponible; el entrenamiento se hizo en una RTX 5090, pero no se documentan requisitos de GPU para inferencia. Las builds CUDA de los runtimes probados no han sido testeadas.
- Cabe en GPU de consumo: sí, por tamaño (2 GB), aunque la compatibilidad de kernels CUDA no está verificada.
- Opciones de despliegue: fork de llama.cpp de Prism (probado en el commit `c9c34bc`, build CPU) e ik_llama.cpp (commit `4955387`, con PTQ1_0 añadido en el PR 2550). El llama.cpp upstream no soporta PTQ1_0. Ejemplo: `llama-server -m OpenBonsai-Qwen3.5-9B-PTQ1_0.gguf -rtr 1 -t 4 --port 8080`.
- Latencia y throughput: aproximadamente 10 tokens/s en un i5-13420H con 4 hilos y `-rtr 1`; sin datos para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenBonsai Qwen3.5-9B | 8.953.803.264 | no disponible | Ternaria PTQ1_0 (~2 GB) | Apache-2.0 | Hugging Face, GGUF |
| Qwen/Qwen3.5-9B (modelo base) | 8.953.803.264 | no disponible | BF16 y otras | no disponible en la información | Hugging Face |
| Prism ML Ternary Bonsai 2 9B | no disponible | no disponible | Ternaria (mismo layout de tensores) | no disponible | no disponible |

Según el autor, el modelo queda por debajo del Qwen3.5-9B original y de Ternary Bonsai 2 9B en matemáticas y código, y ligeramente peor que su primera release en texto general.

## Limitaciones y advertencias

- Research preview: el propio autor lo describe como útil para experimentos, no como producto terminado.
- Rendimiento inferior al modelo base en matemáticas y código, y ligeramente peor en texto general que la primera release.
- Riesgo de sobreestimación de resultados: el subconjunto de 50 problemas de HumanEval se usó para seleccionar el modelo y parte de sus tareas aparece reformulada en los datos de entrenamiento; además, 34 de los 114 problemas externos están relacionados con tareas vistas en las trazas.
- La guarda de contaminación no detecta tareas de test reformuladas con otras palabras.
- Solo texto: sin visión ni capas MTP.
- Compatibilidad limitada: no funciona en llama.cpp upstream; requiere el fork de Prism o ik_llama.cpp, y las builds CUDA no están testeadas.
- El runtime de Prism cuantiza activaciones a 8 bits, por lo que la salida puede diferir de la referencia PyTorch; los resultados de GSM8K y HumanEval provienen del harness de PyTorch en BF16 y no están cubiertos por la verificación de paridad.
- Dos releases comparten nombre de fichero y `general.name`; solo el SHA-256 los distingue, lo que facilita confusiones en producción.
- Con thinking activado el modelo suele superar los 4.096 tokens, con el coste de latencia asociado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones propias que no se detallan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/webbrain-one/openbonsai-qwen-3.5-9b
- Repositorio OpenBonsai: https://github.com/esokullu/openbonsai
- Configuración de entrenamiento: https://github.com/esokullu/openbonsai/blob/main/examples/qwen3_5-9b-reasoning-code.yaml
- Primera release (revisión `40964de`, tag `reasoning-mix-v1`): https://huggingface.co/webbrain-one/openbonsai-qwen-3.5-9b/tree/40964de45342e7c1cdd6605cdb00533c9adb567d
- Paridad de runtime: https://github.com/esokullu/openbonsai/tree/main/research/runs/2026-10-29-runtime-parity-9b/
- Pruebas en ik_llama.cpp: https://github.com/esokullu/openbonsai/tree/main/research/runs/2026-11-02-ik-llama-cpp/
- Fork de llama.cpp de Prism: https://github.com/PrismML-Eng/llama.cpp
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR 2550 de ik_llama.cpp (soporte PTQ1_0): https://github.com/ikawrakow/ik_llama.cpp/pull/2550
- Issue de OpenBonsai sobre ik_llama.cpp: https://github.com/esokullu/openbonsai/issues/13
- Paper ScaleQ-1.58: arXiv 2608.01078
- GitHub de webbrain-one: https://github.com/webbrain-one
- Proyecto WebBrain: https://github.com/webbrain-one/webbrain
