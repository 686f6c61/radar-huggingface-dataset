# udgamlabs/Laghu-MLX

## Resumen

Laghu-MLX es la conversión al formato MLX (bf16) de Laghu, un modelo de chat en inglés de 152 millones de parámetros entrenado desde cero por Udgam Labs, un laboratorio de investigación independiente. El modelo original se entrenó con un presupuesto de cómputo de preentrenamiento de 146 dólares, lo que lo sitúa en la categoría de modelos de investigación de muy bajo coste y tamaño reducido, pensados para experimentación y despliegue local más que para producción exigente.

Esta versión concreta está optimizada para Apple Silicon: emplea la librería mlx-lm y los pesos en bf16 (303,6 MB), manteniendo la precisión completa del modelo base. El autor recomienda esta variante frente a una hipotética cuantización de 4 bits, que según sus mediciones pierde calidad de forma clara (KL medio de 0,337 y concordancia top-1 del 69,9 % frente a la referencia F16). Existe además una variante Laghu-MLX-8bit con la mitad de tamaño y calidad casi equivalente.

El modelo utiliza la plantilla de chat de Gemma 4 (Apache-2.0) e incorpora un modo de razonamiento ("thinking") que el servidor MLX activa por defecto. Su relevancia actual radica en ser un ejemplo totalmente abierto y reproducible de entrenamiento desde cero a pequeña escala, útil para investigación sobre eficiencia, destilación y comportamiento de modelos pequeños, no como sustituto de modelos grandes en tareas de conocimiento o razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; tag `gemma4_text`), ventana deslizante de 512 tokens |
| Parámetros totales | 151.792.668 (152M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (límite recomendado por el autor) |
| Tipos de cuantización | bf16 (esta versión); existe variante 8-bit (Laghu-MLX-8bit); 4-bit no publicada por pérdida de calidad |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (bf16) |

## Arquitectura y entrenamiento

Laghu es un transformer decoder-only de 152M de parámetros entrenado desde cero por Udgam Labs, con una arquitectura basada en la familia Gemma 4 (el tag del repositorio es `gemma4_text`) y una ventana de atención deslizante de 512 tokens. El modelo se entrenó con un coste de cómputo de preentrenamiento declarado de 146 dólares, lo que constituye su principal reclamo como caso de estudio de entrenamiento de bajo presupuesto. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset; esa información se remite al informe técnico y a la model card del modelo base.

Esta variante MLX se generó mediante `mlx_lm.convert` (mlx-lm 0.32.0) a partir de los safetensors publicados del modelo base, sin cambios en los pesos más allá de la conversión de formato a bf16. El autor no publica una build de 4 bits porque, según sus propias mediciones, la degradación es significativa. La plantilla de chat es la de Gemma 4, con soporte para modo thinking, conversaciones multi-turno y llamadas a herramientas.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat multi-turno.
- Modo de razonamiento ("thinking") activable o desactivable mediante la configuración de la plantilla de chat; el servidor MLX lo activa por defecto.
- Soporte de tool calling / function calling a través de la plantilla de chat de Gemma 4 (verificado por el autor en el servidor MLX).
- Conversaciones multi-turno con contexto de hasta 16.384 tokens.
- Ejecución local y offline en Macs con Apple Silicon mediante mlx-lm.
- Servidor compatible con la API de OpenAI (`mlx_lm.server`).
- No dispone de capacidades de visión, audio ni multilingüismo: solo inglés.

## Casos de uso

- Investigación sobre entrenamiento de bajo coste: reproducir o analizar el pipeline de entrenamiento desde cero de un modelo de 152M de parámetros por 146 dólares de cómputo, usando esta build MLX para inspeccionar el comportamiento del modelo convertido.
- Experimentación local en Apple Silicon: probar un modelo de chat completo en un Mac mini o portátil sin GPU dedicada, con unos 319 tokens/s de generación y 303,6 MB de pesos.
- Desarrollo de prototipos de asistentes conversacionales en inglés: iterar sobre plantillas de chat, prompts de sistema y flujos multi-turno antes de migrar a un modelo mayor.
- Pruebas de integración de tool calling: validar pipelines de function calling contra un servidor local compatible con la API de OpenAI sin coste de inferencia.
- Docencia y formación: ilustrar el ciclo completo de un modelo de lenguaje (preentrenamiento, conversión de formato, cuantización, evaluación con perplejidad y KL) con un artefacto pequeño y abierto.
- Evaluación comparativa de runtimes: medir latencia y throughput de MLX frente a GGUF/llama.cpp usando el mismo modelo en distintos formatos.
- Pruebas de cuantización: comparar bf16 frente a 8-bit en un caso real y observar el impacto en perplejidad y concordancia top-1.

## Benchmarks y rendimiento

Resultados publicados por el autor para esta build MLX (Mac mini con Apple M6, 24 GB, mlx-lm 0.32.0, medidos el 2026-10-22):

| Métrica | Laghu-MLX (bf16) |
|---|---|
| Tamaño | 303,6 MB |
| Perplejidad | 52,25 |
| KL medio frente a F16 | 0,0009 |
| Concordancia top-1 | 98,0 % |
| Velocidad de generación | ~319 tokens/s |

Metodología: 32 ventanas de 2.048 tokens de texto reservado, comparadas con la referencia GGUF F16. El autor indica además que una build de 4 bits no publicada obtiene KL medio de 0,337 y concordancia top-1 del 69,9 %, por lo que se descartó.

Resultados del modelo base citados en la model card (no específicos de esta build MLX):

| Benchmark | Resultado |
|---|---|
| GSM8K (con thinking) | 7,9 % |
| IFEval | 26,1 |

## Requisitos de hardware

- VRAM/memoria unificada: los pesos bf16 ocupan 303,6 MB; con contexto completo de 16.384 tokens el consumo total se mantiene muy por debajo de 1 GB en la práctica.
- Hardware objetivo: Apple Silicon (series M). El autor reporta ~319 tokens/s en un Mac mini con Apple M6 y 24 GB.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- No está pensado para GPU NVIDIA/AMD: el formato es MLX y requiere mlx-lm.
- Despliegue: `mlx_lm.generate` para CLI, `mlx_lm.server` para servidor compatible con OpenAI. No se distribuye en GGUF en este repositorio (existe una referencia GGUF F16 usada para evaluación).
- Muestreo recomendado por el autor: temperature 0.7, top-p 0.95, top-k 64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Laghu-MLX (este) | 152M | 16.384 | Inglés | Apache-2.0 | MLX bf16 | Entrenado desde cero, coste de 146 USD, modo thinking y tool calling |
| Laghu (base) | 152M | 16.384 | Inglés | Apache-2.0 | safetensors | Mismo modelo en formato original; referencia para conversión |
| Laghu-MLX-8bit | 152M | 16.384 | Inglés | Apache-2.0 | MLX 8-bit | Mitad de tamaño, calidad casi equivalente según el autor |
| SmolLM2-135M | 135M | no disponible en la información proporcionada | Inglés | Apache-2.0 | safetensors, GGUF | Alternativa de tamaño comparable; sin datos comparativos en esta ficha |

No se dispone de comparaciones de rendimiento directas con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación pequeño: matemáticas muy débiles (GSM8K 7,9 % con thinking) y seguimiento de instrucciones limitado (IFEval 26,1).
- Conocimiento factual escaso; el autor desaconseja explícitamente su uso para respuestas factuales o decisiones relevantes.
- Puede entrar en bucles con decodificación greedy.
- Solo inglés; sin soporte multilingüe.
- Contexto recomendado de 16.384 tokens o menos; superarlo no está validado.
- El servidor MLX activa el modo thinking por defecto, lo que puede producir respuestas más largas de lo esperado si no se desactiva.
- Entrenamiento de seguridad ligero ("light safety training"): no apto como filtro de seguridad en producción.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones de calidad hacen desaconsejable su uso en producción para tareas críticas.
- No se publica build de 4 bits por la pérdida de calidad documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Laghu-MLX
- Modelo base: https://huggingface.co/udgamlabs/Laghu
- Demo en navegador: https://udgamlabs.com/models/laghu
- Código en GitHub: https://github.com/udgamlabs/laghu
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/laghu
- Informe técnico: https://udgamlabs.com/research/laghu
- Sitio del laboratorio: https://udgamlabs.com
