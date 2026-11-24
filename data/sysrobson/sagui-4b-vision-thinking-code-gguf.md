# sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF

## Resumen
Sagui-4B es una cuantización GGUF en formato IQ3_XXS del modelo Qwen/Qwen3.5-4B, publicada por el usuario sysrobson. Su objetivo es ofrecer un modelo multimodal (texto e imagen) con capacidad de razonamiento paso a paso (thinking) y de generación de código TypeScript/JavaScript en un espacio de apenas 2,4 GB, lo que permite ejecutarlo en GPUs de 4 GB de VRAM e incluso en hardware antiguo como una GTX 970. El paquete se distribuye en dos ficheros: el modelo de lenguaje (1,71 GB) y un proyector de visión (0,67 GB), de modo que quien no necesite procesar imágenes puede cargar solo el primero.

El modelo base tiene 3.930.400.256 parámetros (aproximadamente 4B) y conserva las capacidades del Qwen3.5-4B original: conversación, visión, tool calling y modo thinking. La cuantización reduce el tamaño un 40 % respecto al Q4_K_M del que parte, a cambio de una pérdida de entre 5 y 9 puntos en los benchmarks de generación de código TypeScript (HumanEval-TS y MBPP-TS). Es, por tanto, una opción pensada para despliegue local en entornos con recursos muy limitados, no para máxima precisión.

La relevancia actual reside en la combinación de tres factores poco habituales en modelos de este tamaño: multimodalidad, razonamiento explícito y soporte de herramientas, todo bajo licencia Apache 2.0 y con compatibilidad directa con Ollama y llama.cpp. Está etiquetado para inglés y portugués, aunque el autor indica que cubre otros alfabetos latinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-4B + proyector de visión), cuantizado a GGUF |
| Parametros totales | 3.930.400.256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS con imatrix (única cuantización publicada en el repo) |
| Idiomas soportados | en, pt (el autor indica que también cubre otros alfabetos latinos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); fichero de modelo de 1,71 GB + proyector de visión de 0,67 GB |

## Arquitectura y entrenamiento
El modelo es una cuantización del Qwen3.5-4B, un transformer multimodal que combina un modelo de lenguaje con un proyector de visión para tareas image-text-to-text. La cuantización emplea el esquema IQ3_XXS con matrices de importancia (imatrix), lo que permite comprimir los pesos hasta 2,4 GB totales manteniendo las capacidades de thinking, visión y tool calling del modelo original. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo base Qwen3.5-4B y no se detallan en la información disponible.

La innovación principal de esta publicación no está en el entrenamiento, sino en la compresión: el autor reporta que el paquete es un 40 % más pequeño que el Q4_K_M de origen, con una pérdida de 5 a 9 puntos en benchmarks de código TypeScript. El modo thinking es configurable por chat mediante `--think` / `--think=false` en Ollama o el campo `think` en la API, lo que permite desactivar el razonamiento extenso cuando prima la latencia.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento paso a paso con modo thinking activable y desactivable.
- Comprensión de imágenes: lectura de capturas de pantalla, diagramas de interfaz y errores de editor.
- Generación de código TypeScript y JavaScript, incluyendo componentes React.
- Tool calling / function calling.
- Capacidades multilingües limitadas a inglés, portugués y otros alfabetos latinos.
- Conversión de capturas de UI a código funcional (image-to-code).
- Explicación y corrección de errores de compilación a partir de una imagen del editor.

## Casos de uso
- Asistente de código local en TypeScript: el modelo genera funciones y corrige errores a partir de capturas del editor, adecuado para equipos que no pueden enviar código a servicios en la nube por motivos de confidencialidad.
- Conversión de maquetas o capturas de UI a componentes React: a partir de una imagen de un formulario, el modelo produce el código del componente, como se documenta en los ejemplos del autor (formulario de registro con 2332 tokens de salida).
- Atención al cliente offline: al ser un modelo pequeño y ejecutable en local, puede desplegarse en entornos con conectividad limitada o requisitos de privacidad, gestionando conversaciones multi-turno en inglés o portugués.
- Automatización con agentes y herramientas: el soporte de tool calling permite integrarlo en flujos que consulten APIs o ejecuten acciones, con el modo thinking activado para planificación multi-paso.
- Tutoría y resolución de problemas matemáticos: el modo thinking muestra el desarrollo paso a paso (por ejemplo, cálculo de duraciones y conversión de unidades), útil en contextos educativos.
- Procesamiento de documentación técnica con imágenes: lectura de diagramas, capturas de error o esquemas para generar explicaciones o parches de código.
- Prototipado rápido en hardware antiguo: con 2,4 GB totales cabe en una GTX 970 de 4 GB, lo que permite montar un entorno de desarrollo asistido sin adquirir GPU nueva.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Benchmark | Sagui-4B (IQ3_XXS) | Qwen3.5-4B Q4_K_M (modelo origen) |
|---|---|---|
| HumanEval-TS pass@1 (MultiPL-E) | 44,0 % | 52,8 % |
| MBPP-TS pass@1 (MultiPL-E) | 54,6 % | 59,7 % |
| Velocidad en GTX 970 (llama.cpp) | 21,2 tok/s | 20,5 tok/s |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2,4 GB con visión (1,71 GB sin el proyector de visión), más overhead de contexto y caché KV.
- Cabe en GPUs consumer de 4 GB, incluida una GTX 970 de 2014 según las pruebas del autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; modelos con más memoria permitirán contextos mayores y mayor throughput.
- Despliegue: Ollama (`ollama run hf.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF:IQ3_XXS`) y llama.cpp; también es posible crear el modelo desde los ficheros con un `Modelfile`.
- Latencia y throughput medidos por el autor en GTX 970: 21,2 tok/s en generación; ejemplos concretos con thinking activado: 26,8 s para una corrección de 63 tokens, 174,2 s para un componente React de 2332 tokens y 254,5 s para un razonamiento matemático de 3542 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sagui-4B (IQ3_XXS) | 3,93B | no disponible | Apache 2.0 | GGUF | 2,4 GB con visión; HumanEval-TS 44,0 %; MBPP-TS 54,6 % |
| Qwen3.5-4B Q4_K_M | 3,93B | no disponible | Apache 2.0 | safetensors/GGUF | 3,51 GB con visión; HumanEval-TS 52,8 %; MBPP-TS 59,7 % |
| Alternativas de ~4B con visión y thinking | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa más fiable es con el propio modelo base en Q4_K_M, ya que el autor publica ambas cifras. Para otras alternativas de la misma categoría no hay datos en la información disponible.

## Limitaciones y advertencias
- La cuantización IQ3_XXS degrada la precisión: entre 5 y 9 puntos menos en HumanEval-TS y MBPP-TS respecto al Q4_K_M del modelo origen.
- El modo thinking es muy verboso: en el ejemplo del autor, 3542 tokens para un problema aritmético sencillo, con 254,5 s de latencia en GTX 970. Conviene desactivarlo en producción cuando no sea necesario.
- Cobertura idiomática limitada: solo inglés, portugués y alfabetos latinos; no se garantiza un rendimiento adecuado en otros idiomas.
- Los benchmarks declarados están marcados como no verificados y proceden del autor del modelo.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- La longitud de contexto no está documentada en la información disponible; debe consultarse en el modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-4B antes de un uso comercial.
- El proyecto es de un autor individual (sysrobson) con 401 descargas y 1 like en el momento de la consulta; no hay garantías de mantenimiento a largo plazo.

## Enlaces
- Hugging Face: https://huggingface.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset MultiPL-E: https://huggingface.co/datasets/nuprl/MultiPL-E
- Donaciones del autor (PayPal): https://www.paypal.com/donate/?hosted_button_id=JA6B7RKJURXNW
