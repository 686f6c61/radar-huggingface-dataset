# zazeen123/Qwen3.5-0.8B-Mew-Surgeon

## Resumen

Qwen3.5-0.8B-Mew-Surgeon es una variante del modelo Qwen/Qwen3.5-0.8B (aproximadamente 0,8 mil millones de parámetros) publicada por el usuario zazeen123 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una intervención sobre los pesos del modelo base mediante técnicas de "model surgery" (edición de pesos sin entrenamiento). El objetivo declarado es doble: reducir el vocabulario al par tailandés-inglés y corregir el bucle de razonamiento que el modelo original presenta al activar el modo thinking.

El modelo conserva la arquitectura del Qwen3.5-0.8B original, con 704.327.232 parámetros reales según los safetensors, y está orientado a tareas de image-text-to-text, conversación y llamadas a herramientas. La intervención quirúrgica elimina una dirección del flujo residual en las 48 capas de escritura residual (o_proj, out_proj, down_proj) con una intensidad de 1,1, sin alterar formas, tamaño ni velocidad de inferencia.

Es relevante porque demuestra que es posible mitigar el fallo de repetición infinita en modelos pequeños de razonamiento mediante edición de pesos, sin reentrenar. El autor publica mediciones detalladas y honestas sobre qué mejora y qué empeora, lo que lo convierte en un caso interesante para investigadores que trabajan con modelos compactos y modos de pensamiento extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), edición de pesos sin entrenamiento |
| Parametros totales | 704.327.232 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q8_0 mencionado en las mediciones); safetensors en el repo |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros. Sobre esa base se aplican dos modificaciones sin entrenamiento adicional. La primera es un recorte de vocabulario de 248.320 a 83.172 tokens, calculado contando un corpus de Wikipedia en tailandés e inglés con un mínimo de 20 apariciones; los pesos de los tokens conservados no se tocan, por lo que la tokenización de tailandés e inglés permanece idéntica al original. La segunda es la corrección del bucle: se identifica en la capa 9 una dirección del flujo residual que separa el pensamiento que empieza a repetirse del que termina, y se elimina de las 48 capas de escritura residual (o_proj, out_proj, down_proj) con la fórmula W ← W − 1,1·r(rᵀW). No hay RLHF, DPO ni entrenamiento supervisado en esta variante; todo el ajuste es edición directa de pesos.

La innovación técnica destacable es precisamente ese enfoque de "model surgery": localizar una dirección semántica en el espacio residual y restarla de forma controlada para corregir un comportamiento patológico (la repetición palabra por palabra) sin degradar otras capacidades. El autor probó intensidades de 0,9, 1,0, 1,1 y 1,25, y eligió 1,1 por ser la que menos bucles producía con un rendimiento comparable a 1,0.

## Capacidades

- Generación de texto conversacional en tailandés e inglés.
- Razonamiento matemático con modo thinking activable (gsm8k y mgsm-th en las mediciones).
- Llamadas a herramientas (tool calling / function calling): 7 herramientas evaluadas con peticiones en tailandés e inglés.
- Generación de código: resolución de problemas tipo HumanEval con verificación contra tests propios.
- Procesamiento image-text-to-text según el pipeline declarado en Hugging Face.
- Seguimiento de instrucciones de formato: listas con N viñetas exactas, JSON con claves dadas, límite de palabras, respuestas sí/no, idioma forzado.
- Modo thinking con corrección de bucle; el autor recomienda usarlo con thinking activado.
- Capacidad de declarar "no lo sé" en algunas preguntas sin respuesta, aunque de forma inconsistente.

## Casos de uso

- Asistente conversacional bilingüe tailandés-inglés: el recorte de vocabulario a esos dos idiomas hace que la tokenización sea idéntica a la del original para ambos, y el modelo puede mantener conversaciones multi-turno en entornos de atención al cliente donde solo se necesitan esos idiomas.
- Razonamiento matemático con thinking activado en entornos educativos o de cálculo: el modelo pasa de quedar en bucle en casi todas las preguntas de gsm8k a resolver correctamente 31 de 60 en dev y 49 de 100 en test, lo que lo hace utilizable para problemas aritméticos de primaria y secundaria.
- Llamadas a herramientas en asistentes de automatización: con un 85-91% de acierto en peticiones con 7 herramientas, puede integrarse en flujos donde el modelo debe decidir qué función invocar y con qué argumentos, por ejemplo en un bot de gestión de tareas o consultas de datos.
- Generación de funciones Python cortas en pipelines de CI/CD: con un 27,5% de pass en HumanEval tras la corrección del bucle (frente al 8,75% anterior), es adecuado para autocompletar funciones simples o generar tests, no para código complejo.
- Despliegue en dispositivos con recursos limitados: el archivo Q8_0 ocupa 616 MB tras el recorte de vocabulario (frente a 795 MB del original), lo que permite ejecutarlo en portátiles y mini-PC con llama.cpp u Ollama.
- Investigación sobre edición de pesos: sirve como caso de estudio reproducible para quienes quieran aplicar model surgery a otros modelos pequeños con problemas de repetición en modo thinking.
- Filtrado y clasificación de texto en tailandés e inglés: el vocabulario reducido y el tamaño compacto permiten usarlo como clasificador o extractor en pipelines de bajo coste.

## Benchmarks y rendimiento

Los datos provienen de las mediciones del autor, con decodificación greedy, hasta 4.096 tokens, Q8_0 en llama.cpp y verificación por regla.

| Benchmark | Resultado | Contexto |
|---|---|---|
| HumanEval (80 problemas) | 27,5% pass | Thinking on, tras corrección del bucle; antes: 8,75% |
| HumanEval, thinking off | 25% pass | Sin diferencia fiable respecto a antes de la corrección |
| HumanEval, solo recorte de vocabulario | 32,5% pass | Frente al 35% del Qwen3.5-0.8B original, sin diferencia fiable |
| gsm8k (100, test) | 49 correctas / 2 "no lo sé" / 49 incorrectas | Thinking on, tras corrección |
| mgsm-th (100) | 37 correctas / 2 "no lo sé" / 61 incorrectas | Thinking on, tras corrección |
| Tool calls (55 peticiones, 7 herramientas) | 85-91% correctas | Sin diferencia fiable respecto a antes de la corrección |
| Instrucciones de formato (26) | 65% | Thinking on |
| Preguntas sin respuesta (80) | 84% de "no lo sé" con votación de 5 | Sin votación: 62,5% |

En dev con thinking on, el modelo corrigido mejora en +55 y empeora en −3 respecto al modelo sin corregir (gsm8k +30/−0, mgsm-th +20/−0, tools +5/−3). Con thinking off, el modelo corregido empeora: +32/−64, p 0,0014. La comparación directa thinking on corregido frente a thinking off sin corregir no da ventaja global: +49/−66, p 0,14.

## Requisitos de hardware

- VRAM estimada: con Q8_0 (616 MB) cabe en GPUs con 2 GB o más; en fp16 los 704 millones de parámetros ocupan aproximadamente 1,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (usado en las mediciones), Ollama (el autor menciona que usa thinking on por defecto), transformers con safetensors, y servidores compatibles con endpoints.
- Latencia y throughput: no disponible de forma numérica; el autor indica que la corrección no altera la velocidad ("same speed").

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Mew-Surgeon | 704.327.232 | no disponible | th, en | apache-2.0 | Corrección de bucle, vocabulario recortado |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | apache-2.0 | Modelo base; HumanEval 35%, bucles en thinking |
| Qwen3.5-0.8B (recorte th-en sin corrección) | 704.327.232 | no disponible | th, en | apache-2.0 | HumanEval 32,5%, bucles en thinking |

No se dispone de datos de benchmarks de otros modelos de 0,8B comparables en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Qwen3.5-0.8B.

## Limitaciones y advertencias

- El modelo responde mal con confianza: en gsm8k acierta 49 y falla 49 de 100, y solo dice "no lo sé" en 2 casos.
- En tailandés el rendimiento matemático es peor: 61 incorrectas de 100 en mgsm-th.
- Con thinking off, el modelo corregido es peor que el original sin corregir (+32/−64, p 0,0014); el autor recomienda usar thinking on.
- Incluso con thinking on, quedan bucles: 38 de 200 en gsm8k y 10 de 100 en mgsm-th en dev.
- El seguimiento de instrucciones de formato es limitado: 65% de acierto en 26 pruebas.
- El consejo de añadir un system prompt para decir "no lo sé" mejora la honestidad en matemáticas pero degrada el código (26% → 14% en HumanEval) porque el modelo piensa más y agota tokens.
- El vocabulario está recortado a tailandés e inglés; otros idiomas tokenizan peor o no están soportados.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener sus propias condiciones; conviene revisar la licencia de Qwen/Qwen3.5-0.8B.
- No hay datos publicados sobre sesgos demográficos o culturales en la información disponible.
- El modelo es una edición no oficial del Qwen3.5-0.8B; no está respaldado por el equipo de Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/zazeen123/Qwen3.5-0.8B-Mew-Surgeon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
