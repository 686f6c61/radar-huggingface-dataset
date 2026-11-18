# Tractorman/accel-lm-5M-GGUF

## Resumen

accel-lm-5M es un modelo de lenguaje de 5.347.296 parámetros entrenado desde cero por el equipo 2 del curso ECE382M de la Universidad de Texas en Austin (otoño de 2026). No es un asistente de propósito general: es un artefacto construido específicamente para un benchmark de FPGA que se ejecuta con `llama-server` sobre un único núcleo Arm A53 a 300 MHz en una placa Ultra96, acompañado de un acelerador GEMV propio para matrices Q8_0.

La arquitectura es una Llama estándar deliberadamente minimalista: 3 capas, anchura 288, feed-forward de 768 con SwiGLU, 6 cabezas de 48 dimensiones sin GQA, contexto de 512 tokens y un vocabulario de 4.096 entradas heredado de `sixf0ur/tiny-lm-8M`. Todas las matrices son múltiplos de 32 para encajar en el acelerador. El modelo memoriza sus datasets de origen (HellaSwag y ARC-Easy) por diseño, con aprobación explícita del profesorado del curso.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de entrenamiento, cuantización y despliegue en hardware muy restringido, y muestra cómo un modelo de 5 millones de parámetros puede resolver tareas de formato y elección múltiple cuando el entrenamiento se alinea exactamente con el protocolo de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (implementación estándar en llama.cpp) |
| Parametros totales | 5.347.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q8_0 (normas en F32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (`accel-lm-5M-Q8_0.gguf`, 5.778.944 bytes) |

Detalles de forma: 3 capas, anchura 288, feed-forward 768 (SwiGLU), 6 cabezas de tamaño 48 sin GQA, vocabulario de 4.096 tokens (SentencePiece). Plantilla de chat incluida en el propio GGUF.

## Arquitectura y entrenamiento

El modelo es un transformer Llama puro sin innovaciones arquitectónicas: atención multi-cabeza estándar, SwiGLU en la MLP y sin GQA. La elección de formas responde a la placa objetivo: el tiempo por token en el A53 está dominado por trabajo fijo de CPU por capa y la anchura pesa más que el tamaño del feed-forward, de modo que el equipo redujo a la mitad la profundidad de `tiny-lm-8M` manteniendo sus matrices de anchura 288. Todas las matrices resultantes (288×288, 288×768, 768×288, 288×4.096) son múltiplos de 32, requisito del acelerador GEMV.

El entrenamiento parte de inicialización aleatoria en un Apple M4 durante unas 3 horas en tres fases. Los datos son: validación de HellaSwag (10.042 ítems, MIT) y ARC-Easy completo (5.187 ítems, CC BY-SA 4.0), formateados exactamente como los presenta el harness del benchmark y con la letra de respuesta como objetivo, balanceados por época; datos de instrucciones generados a partir de `nano_wiki` (CC BY 4.0) con reglas de formato del tipo que verifica el benchmark (recuentos de frases, párrafos, viñetas y líneas, rangos de palabras, mayúsculas, caracteres o palabras prohibidas, palabras requeridas, frases de inicio o fin, comillas, claves JSON, títulos entre `<<>>`), con respuestas verificadas por las propias funciones de comprobación del harness; y texto plano de `nano_wiki`. No se menciona RLHF ni DPO.

## Capacidades

- Elección múltiple con formato fijo: responde con una sola letra (A–D) a preguntas presentadas con el formato del harness del curso.
- Seguimiento de instrucciones de formato: recuentos de frases, párrafos, viñetas y líneas, rangos de palabras, mayúsculas o minúsculas, palabras prohibidas o requeridas, frases de inicio o fin, comillas, claves JSON y títulos entre `<<>>`.
- Generación de texto breve en inglés a partir de texto plano de `nano_wiki`.
- Plantilla de chat incluida en el GGUF que renderiza mensaje de usuario + salto de línea + respuesta del asistente.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Validación de un pipeline de extremo a extremo en FPGA: el modelo es el componente de referencia para verificar que `llama-server`, la cuantización Q8_0 y el acelerador GEMV producen resultados correctos sobre Ultra96 a 300 MHz.
- Docencia y reproducción de entrenamiento: sirve para que estudiantes recorran todas las fases (tokenizador, dataset, entrenamiento desde cero, cuantización, despliegue) en un espacio de 3 horas de cómputo en un M4.
- Benchmark de seguimiento de instrucciones de formato: con un 89 % de acierto en comprobaciones de formato sobre 400 prompts generados no vistos, es útil como línea base mínima para comparar harnesses de evaluación IFEval-style.
- Pruebas de infraestructura de inferencia: su tamaño (5,8 MB en Q8_0) permite iterar rápidamente sobre configuraciones de `llama.cpp` y `llama-server` sin coste de GPU.
- Demostración de cuantización: caso práctico para medir el impacto de Q8_0 frente a precisión completa en un modelo donde cada byte cuenta para el presupuesto de memoria de la placa.
- Evaluación de aceleradores hardware: las formas de matriz múltiplos de 32 y la anchura constante lo convierten en una carga de trabajo controlada para medir latencia y throughput de unidades GEMV.

## Benchmarks y rendimiento

Resultados del harness del curso (50 ítems: 20 HellaSwag, 20 ARC-Easy, 10 IFEval-style), `llama-server`, este archivo Q8_0, cinco semillas (42, 1, 2, 3, 4), CPU Apple M4:

| Modelo | Media | Rango | HellaSwag | ARC-Easy | IFEval |
|---|---:|---|---:|---:|---:|
| accel-lm-5M (este) | 100,0 | 100,0 a 100,0 | 100,0 | 100,0 | 100,0 |
| tiny-lm-8M fine-tuned (entrega anterior) | 30,6 | 25,2 a 34,3 | 22,7 | 18,9 | 70 |

Advertencia del autor: estos ítems públicos están en los datos de entrenamiento, por lo que reflejan el caso memorizado. Sobre 400 prompts de instrucciones generados que el modelo nunca vio, supera el 89 % de las comprobaciones de formato; esa es la estimación más representativa para prompts IFEval-style no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en Q8_0 (archivo de 5,8 MB más overhead de contexto y runtime); cabe holgadamente en cualquier GPU, CPU o placa embebida.
- GPU recomendadas: no requiere GPU; el autor lo ejecuta en CPU Apple M4 y en un Arm A53 a 300 MHz.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores con suficiente RAM; no es una carga relevante para RTX 4090, A100 o H100.
- Opciones de despliegue: `llama.cpp` y `llama-server` (formato GGUF nativo); compatible con endpoints según los tags del repo.
- Latencia y throughput: no se publican cifras de tokens por segundo en la información disponible; el autor indica únicamente que el tiempo por token en el A53 está dominado por trabajo fijo de CPU por capa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| accel-lm-5M | 5,35 M | 512 | CC BY-SA 4.0 | Entrenado para un benchmark concreto; memoriza HellaSwag y ARC-Easy |
| sixf0ur/tiny-lm-8M | ~8 M (no confirmado) | no disponible | CC BY 4.0 (tokenizador y texto) | Modelo base del tokenizador; la entrega fine-tuned previa obtuvo 30,6 de media en el mismo harness |
| Modelos de propósito general de <100 M | variable | variable | variable | No comparables directamente: no están ajustados al protocolo del harness ni memorizan sus datos |

La comparación relevante es con `tiny-lm-8M` fine-tuned, la entrega anterior del mismo curso, que obtuvo 30,6 de media frente al 100,0 de este modelo en ítems vistos. Esa diferencia mide principalmente memorización, no capacidad de generalización.

## Limitaciones y advertencias

- El modelo memoriza sus datasets de evaluación (HellaSwag validación y ARC-Easy completo); los resultados de 100,0 no son indicativos de capacidad general.
- Entrenado exclusivamente en inglés y con vocabulario de 4.096 tokens; no es utilizable en otros idiomas.
- Contexto de solo 512 tokens, insuficiente para conversaciones o documentos largos.
- No soporta tool calling, agentes, visión ni audio.
- Riesgo alto de alucinación fuera del dominio de entrenamiento; no es un asistente de propósito general según el propio autor.
- La licencia CC BY-SA 4.0 impone atribución y compartir-igual: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- Uso comercial no restringido por la licencia más allá de ShareAlike, pero la naturaleza del modelo (entrenado sobre datos de benchmark con permiso del curso) limita su valor fuera de ese contexto.
- No apto para producción como asistente: su función es servir de referencia para el benchmark de FPGA del curso ECE382M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tractorman/accel-lm-5M-GGUF
- Tokenizador y modelo base: https://huggingface.co/sixf0ur/tiny-lm-8M
- Dataset de texto: https://huggingface.co/datasets/sixf0ur/nano_wiki
- HellaSwag (Zellers et al., 2019): https://rowanzellers.com/hellaswag/
- ARC (Clark et al., 2018): https://allenai.org/data/arc
