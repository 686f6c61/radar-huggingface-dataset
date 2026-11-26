# xwcg/Qwen2.5-decompile-14B-r4

## Resumen

Qwen2.5-decompile-14B-r4 es un ajuste fino (LoRA) del modelo Qwen2.5-Coder-14B-Instruct orientado a una tarea muy concreta: la descompilación coincidente (matching decompilation). Dado el listado de ensamblador x86-64 de una función compilada con MSVC (Visual C++ 2012, x64, /O2), el modelo genera código fuente C++ que, al compilarse, produce exactamente los mismos bytes. No se trata de una descompilación aproximada, sino de una reconstrucción byte a byte verificable.

El modelo lo publica el usuario xwcg bajo licencia Apache-2.0, heredada del modelo base, y se distribuye como adaptador PEFT (LoRA de rango 32) más una versión fusionada y cuantizada en GGUF (Q5_K_M). Con 14.770.033.664 parámetros, es un transformer denso del linaje Qwen2.5-Coder, especializado mediante entrenamiento supervisado sobre pares de ensamblador y fuentes verificadas.

Su relevancia radica en el enfoque de "bucle de reparación": además de generar respuestas iniciales, fue entrenado con turnos de corrección en los que se le proporciona un intento erróneo y la retroalimentación del comprobador (diferencias de instrucciones, resumen de región). Esto lo hace especialmente útil en pipelines automatizados de ingeniería inversa y análisis de binarios, donde la verificación por compilación es factible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-14B-Instruct) con adaptador LoRA (rango 32, alpha 32, proyecciones de atención y MLP) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento; la versión GGUF Q5_K_M cabe en 16 GB de VRAM con contexto de 16k |
| Tipos de cuantizacion | GGUF Q5_K_M (versión fusionada); adaptador LoRA en bf16 para el modelo base completo |
| Idiomas soportados | no disponibles (la tarea es generación de código C++ y ensamblador; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo fusionado cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer denso decoder-only, sobre el que se aplica un ajuste LoRA de rango 32 y alpha 32 que cubre todas las proyecciones de atención y MLP. El entrenamiento se realizó sobre el modelo base completo en bf16, durante 2 épocas y 1.536 pasos, con tasa de aprendizaje 0,00015 y secuencias de hasta 8.192 tokens (varios ejemplos empaquetados por secuencia, con la pérdida calculada solo sobre las respuestas).

El conjunto de datos consta de 6.907 ejemplos (20.790.149 tokens) de dos tipos: "write", donde el listado de ensamblador (con algunos ejemplos resueltos en el prompt) se mapea a la fuente coincidente; y "repair", donde al mismo prompt se le añade una respuesta errónea previa y la retroalimentación del comprobador (instrucciones divergentes, resumen de región) para producir la versión corregida. Las fuentes son coincidencias verificadas procedentes de diversas descompilaciones. La pérdida final de entrenamiento fue 0,126 y la de evaluación 0,101 sobre secuencias reservadas.

## Capacidades

- Generación de código C++ a partir de ensamblador x86-64 compilado con MSVC (Visual C++ 2012, x64, /O2 /GS- /MD /EHsc /GR).
- Descompilación coincidente byte a byte: el objetivo es que el código generado compile a los mismos bytes que el binario original.
- Reparación iterativa: acepta un intento previo erróneo más la retroalimentación del comprobador y produce una versión corregida.
- Nombrado de símbolos según convención: funciones y globales como `FUN_<hex>` / `DAT_<hex>`, declarados pero no definidos.
- Generación de estructuras sustitutas con los desplazamientos de miembro indicados en comentarios.
- Salida estructurada en un único bloque ```cpp que contiene el fichero completo.
- Capacidades heredadas del modelo base Qwen2.5-Coder-14B-Instruct (generación de texto y código general, conversación), aunque el ajuste está especializado en la tarea de descompilación.

## Casos de uso

- Ingeniería inversa de binarios: dado el ensamblador de una función extraída de un ejecutable MSVC, el modelo propone una fuente C++ que, tras compilarse y compararse byte a byte, puede validarse automáticamente; útil para reconstruir código perdido o analizar malware.
- Recuperación de código fuente en auditorías de seguridad: permite reconstruir funciones de interés para su revisión manual, con verificación por compilación como criterio de aceptación objetivo.
- Pipelines automatizados de descompilación con bucle de reparación: el modelo encaja en un ciclo generar-compilar-comparar-reparar, donde cada ronda de retroalimentación (diferencias de instrucciones, resumen de región) alimenta al modelo para corregir casi-aciertos.
- Análisis de compatibilidad de compiladores: al fijar el compilador y las opciones (VC++ 2012 x64 /O2), sirve para estudiar cómo se traduce código C++ concreto a ensamblador y viceversa en ese entorno.
- Docencia e investigación en compiladores: permite generar ejemplos de correspondencia ensamblador-fuente para estudiar optimizaciones y patrones de generación de código de MSVC.
- Reconstrucción de funciones pequeñas y medianas: para funciones de hasta aproximadamente 128 bytes, una sola respuesta acierta con frecuencia razonable; adecuado para tareas acotadas donde la verificación es barata.
- Integración en herramientas de reversing como complemento: el modelo puede actuar como generador de candidatos que un verificador independiente (compilador + comparador de bytes) filtra, reduciendo el trabajo manual del analista.

## Benchmarks y rendimiento

Los resultados publicados por el autor se obtuvieron sobre funciones reservadas (ninguna de ellas ni sus fuentes en los datos de entrenamiento), con decodificación greedy, compilando y comparando byte a byte:

| Modelo | Una respuesta (100 funciones) | Bucle de 5 rondas con retroalimentación (85 funciones) |
|---|---|---|
| Qwen2.5-Coder-14B-Instruct (base) | 26/100 | no disponible |
| Ajuste fino r2 | 41/100 | 50/85 |
| Ajuste fino r4 | 36/100 | 48/85 |

En el bucle de 5 rondas, r4 encontró 14 coincidencias en rondas de reparación frente a 10 de r2, y produjo menos respuestas que no compilan. El autor indica que r4 es peor que r2 en primeras respuestas pero mejor en reparación.

## Requisitos de hardware

- La versión GGUF Q5_K_M del modelo fusionado cabe en 16 GB de VRAM con contexto de 16k, según el autor.
- El adaptador LoRA requiere el modelo base completo en bf16 (Qwen2.5-Coder-14B-Instruct), lo que implica del orden de 28-30 GB de VRAM para inferencia en bf16 (estimación según los 14.770 millones de parámetros; no indicada explícitamente por el autor).
- GPU recomendadas: para bf16 completo, A100 40 GB, H100 o similares; para la versión Q5_K_M, tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090, A4000 de 16 GB).
- Cabe en GPU de consumo mediante la cuantización GGUF Q5_K_M; el adaptador en bf16 no cabe en GPU de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: llama.cpp para el GGUF; PEFT/Transformers para el adaptador sobre el modelo base; el autor no menciona vLLM, TGI ni Ollama explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-decompile-14B-r4 | 14,77 B | 8.192 en entrenamiento; 16k en GGUF Q5_K_M | Descompilación coincidente MSVC x64 con reparación | Apache-2.0 | Hugging Face (adaptador PEFT + GGUF) |
| Qwen2.5-decompile-14B-r2 | 14,77 B (mismo base) | no disponible | Descompilación coincidente; mejor en primeras respuestas, peor en reparación | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-14B-Instruct (base) | 14,77 B | no disponible en la información | Generación de código general; 26/100 en una respuesta en la prueba del autor | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos de descompilación comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para un único compilador y configuración: VC++ 2012 x64 /O2 /GS- /MD /EHsc /GR; otros compiladores y opciones quedan fuera de alcance.
- Una sola respuesta acierta mucho menos en funciones de más de aproximadamente 128 bytes; las rondas de retroalimentación ayudan pero no garantizan el acierto.
- Las salidas deben verificarse siempre compilando y comparando bytes; una respuesta plausible no es una coincidencia.
- Es peor que su hermano r2 en primeras respuestas (36/100 frente a 41/100), por lo que la elección depende del flujo de trabajo (una pasada frente a bucle de reparación).
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar código que parece correcto pero no compila o no coincide.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-Coder-14B-Instruct.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria independiente.
- Los idiomas soportados no están documentados; la tarea es de código, no de lenguaje natural general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xwcg/Qwen2.5-decompile-14B-r4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
