# sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF

## Resumen

Qwen-4B-Sagui-Vision-Thinking-Code-GGUF es una cuantización GGUF del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario sysrobson bajo el nombre "Sagui-4B". Se trata de un modelo multimodal de 3.930.400.256 parámetros (aproximadamente 4B) que combina razonamiento paso a paso (thinking mode), comprensión de imágenes y generación de código, empaquetado en un único archivo de 2,4 GB que incluye el proyector de visión.

El modelo está pensado para ejecución local en hardware modesto: según el autor, funciona en una GPU de 4 GB de 2014 (GTX 970) a velocidades de 20-21 tok/s. La cuantización utilizada es IQ3_XXS con imatrix, derivada del Q4_K_M del modelo base, lo que reduce el tamaño aproximadamente un 40% a costa de 5-9 puntos de rendimiento en benchmarks de generación de código TypeScript.

Es relevante por su propuesta de "IA local diminuta" que conserva tres capacidades simultáneamente (thinking, visión y tool calling) en un espacio de 2,4 GB, orientada a desarrolladores que quieren un asistente de código offline sin depender de servicios en la nube. La licencia es Apache 2.0 y los idiomas declarados son inglés y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-4B); no se detalla en la informacion disponible |
| Parametros totales | 3.930.400.256 (~4B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_XXS con imatrix (unica publicada en el repo) |
| Idiomas soportados | Ingles y portugues (y otros alfabetos latinos segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.5-4B, por lo que hereda su arquitectura transformer multimodal con un proyector de vision separado (0,67 GB) que se suma al modelo de lenguaje (1,71 GB). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO; la model card del autor no incluye esos datos.

La innovacion tecnica destacable no esta en la arquitectura sino en el proceso de cuantizacion: el autor aplica IQ3_XXS con imatrix sobre el Q4_K_M del modelo base, logrando un archivo de 2,38 GB (con vision) frente a los 3,51 GB del Q4_K_M. Segun las mediciones del autor, esta compresion cuesta 8,8 puntos en HumanEval-TS (44,0% vs 52,8%) y 5,1 puntos en MBPP-TS (54,6% vs 59,7%), manteniendo thinking, vision y tool calling. La velocidad en GTX 970 es ligeramente superior a la del Q4_K_M (21,2 vs 20,5 tok/s).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y portugues.
- Razonamiento paso a paso con modo "thinking" activable o desactivable por chat (`--think` / `--think=false` en Ollama).
- Comprension de imagenes y capturas de pantalla (pipeline image-text-to-text), incluyendo lectura de errores en editores y generacion de componentes UI a partir de mockups.
- Generacion de codigo, con enfasis declarado en TypeScript y JavaScript.
- Tool calling / function calling.
- Capacidades de agente y razonamiento multi-paso mediante el modo thinking.
- Ejecucion totalmente offline en local.

## Casos de uso

- **Asistente de codigo offline en TypeScript/JavaScript:** el modelo puede analizar capturas de errores del editor y proponer correcciones concretas, como demuestra el ejemplo del autor con un error TS2322 resuelto en 63 tokens. Adecuado para desarrolladores que trabajan sin conexion o con requisitos de privacidad.
- **Generacion de componentes UI a partir de mockups:** a partir de una captura de pantalla de un formulario, el modelo genera codigo React funcional (2332 tokens, 174,2 s en GTX 970 con thinking activo). Util para prototipado rapido de interfaces.
- **Razonamiento matematico y aritmetico con desglose:** el modo thinking permite resolver problemas de tiempo, conversiones de unidades y calculos paso a paso, como el ejemplo del tren (155 minutos) con verificacion intermedia.
- **Atencion al cliente automatizada en portugues o ingles:** el modelo soporta conversaciones multi-turno y tool calling, lo que permite integrarlo en flujos de soporte con acceso a funciones externas (consultas de pedidos, estado de cuenta).
- **Asistente de desarrollo en equipos con hardware limitado:** al caber en 2,4 GB y ejecutarse en una GTX 970, permite desplegar un asistente de codigo en estaciones de trabajo antiguas o en portatiles sin GPU dedicada de gama alta.
- **Procesamiento de documentacion tecnica con imagenes:** lectura de diagramas, capturas de paneles de administracion o documentacion escaneada para extraer explicaciones o generar codigo de integracion.
- **Prototipado de agentes locales con tool calling:** el modelo puede integrarse en pipelines de agente que invoquen APIs locales o scripts, manteniendo todo el procesamiento en la maquina del usuario.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Benchmark | Metrica | Qwen-4B Sagui (IQ3_XXS) | Qwen3.5-4B Q4_K_M (modelo fuente) |
|---|---|---|---|
| HumanEval-TS (MultiPL-E) | pass@1 | 44,0% | 52,8% |
| MBPP-TS (MultiPL-E) | pass@1 | 54,6% | 59,7% |
| Velocidad en GTX 970 (llama.cpp, 4 GB) | tok/s | 21,2 | 20,5 |

No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** aproximadamente 2,4 GB con vision activada; 1,71 GB sin vision.
- **GPU recomendadas:** el autor verifica funcionamiento en GTX 970 (4 GB, 2014). Cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; no se han publicado pruebas en A100, H100 o RTX 4090.
- **Consumer GPU:** si, cabe en GPUs de gama baja y media con 4 GB o mas (GTX 970, GTX 1650, RTX 3050, etc.).
- **Opciones de despliegue:** Ollama (comando directo desde Hugging Face o mediante Modelfile) y llama.cpp. No se mencionan vLLM ni TGI.
- **Latencia y throughput:** 21,2 tok/s en GTX 970 segun el autor. Ejemplos medidos: 63 tokens en 26,8 s (correccion de error TS), 2332 tokens en 174,2 s (generacion de componente React con thinking), 3542 tokens en 254,5 s (problema aritmetico con thinking extenso).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-TS pass@1 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-4B Sagui (IQ3_XXS) | ~4B | No disponible | 44,0% | Apache 2.0 | GGUF |
| Qwen3.5-4B Q4_K_M (fuente) | ~4B | No disponible | 52,8% | Apache 2.0 | GGUF |
| Sagui-4B (mismo modelo, otro nombre) | ~4B | No disponible | No disponible | Apache 2.0 | GGUF |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Perdida de precision por cuantizacion:** la cuantizacion IQ3_XXS reduce el rendimiento en codigo entre 5 y 9 puntos frente al Q4_K_M del modelo base; no es adecuada para tareas donde la precision en TypeScript sea critica.
- **Idiomas limitados:** solo ingles y portugues declarados; el autor menciona "otros alfabetos latinos" pero no garantiza calidad en castellano ni en alfabetos no latinos.
- **Riesgo de alucinacion:** al ser un modelo de 4B, es propenso a errores en razonamientos largos y generacion de codigo complejo; los ejemplos del autor muestran omisiones (por ejemplo, placeholders de campos en el formulario React).
- **Thinking costoso:** el modo thinking genera respuestas muy largas (3542 tokens para un problema aritmetico simple) y latencias altas en hardware modesto; debe desactivarse para tareas de baja complejidad.
- **Contexto no documentado:** se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- **Repo con 0 descargas y 1 like:** modelo muy reciente (creado el 2026-11-10) y sin validacion de la comunidad; los benchmarks son declarados por el autor y no estan verificados.
- **Licencia Apache 2.0:** permite uso comercial, pero al derivar de Qwen3.5-4B conviene revisar las condiciones del modelo base.
- **Sin soporte de vLLM/TGI documentado:** el despliegue en produccion a gran escala requeriria validacion adicional.

## Enlaces

- [Hugging Face: sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF](https://huggingface.co/sysrobson/Qwen-4B-Sagui-Vision-Thinking-Code-GGUF)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Version alternativa: Sagui-4B-Vision-Thinking-Code-GGUF](https://huggingface.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF)
- [Ollama](https://ollama.com)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [PayPal del autor (soporte)](https://www.paypal.com/donate/?hosted_button_id=JA6B7RKJURXNW)
