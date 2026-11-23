# zhiyi-ime/zhiyi-zhen-mini

## Resumen

Zhiyi zhen-mini es un modelo de eleccion de palabras y prediccion de palabras siguientes para un metodo de entrada (IME) de chino e ingles, desarrollado por el proyecto Zhiyi IME. Con unos 9,94 millones de parametros y solo 10 MB de pesos ya cuantizados a 4 bits, el modelo esta disenado para ejecutarse en telefonos moviles, un nicho donde los IME comerciales suelen depender de modelos propietarios de mayor tamano. Se distribuye bajo licencia Apache 2.0.

Arquitectura derivada de jhu-clsp/mmBERT-small: 8 capas de estilo ModernBERT con anchura 256 y un vocabulario Unigram de 32.000 tokens. El modelo realiza dos tareas: puntuar candidatos de entrada (eleccion de palabra en chino simplificado, ingles y chino tradicional con pinyin, Zhuyin, Jyutping, Cangjie y Quick) y proponer las siguientes palabras mediante un decodificador de 2 capas, incluyendo relleno de huecos en mitad del texto.

Es relevante porque demuestra que un transformer compacto de ~10 MB puede cubrir tareas de IME multilingue (zh, en, yue) con cuantizacion Q4_0 nativa y despliegue via ONNX Runtime, sin necesidad de GPU. La version 1116 es una preview de investigacion: el IME Zhiyi aun no la utiliza en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, 8 capas, anchura 256) + decodificador de 2 capas para palabras siguientes |
| Parametros totales | 9.939.217 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo define ajustes de secuencia en `config.json`, pero la model card no publica el valor) |
| Tipos de cuantizacion | 4 bits (ggml Q4_0 en 54 matrices; resto F32); variante slim con in-projection de la cabeza tambien a 4 bits y escalas float16; tags adicionales 8-bit |
| Idiomas soportados | zh (simplificado y tradicional), en, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4-bit nativo), ONNX (opset 21 con `MatMulNBits`/`GatherBlockQuantized`), referencia en Rust (candle 0.11) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small y se reduce a 8 capas ModernBERT de anchura 256 con vocabulario Unigram de 32.000 tokens. La cabecera de eleccion de palabra produce una puntuacion por candidato; un decodificador de 2 capas genera las palabras siguientes en busqueda por haz sobre los 32k tokens. El archivo `config.json` expone `encoder.layer_types`, `prefix_mask`, `shared_head`, `compact`, `choice_only`, `next_word_decoder` y `rows_are_tokens`. Los pesos se almacenan ya cuantizados: 54 matrices como bloques ggml Q4_0 y el resto en F32, con un total de 10,1 MB.

Segun la model card, zhen-mini procede de zhen-mini-next-preview (a su vez una version reducida de zh-lite-next-preview), reajustado para completado en mitad del texto. No se publican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion principal es el flujo de inferencia: modo contexto una sola vez (cache `cross_k_out`/`cross_v_out`), luego modo paso (`is_step`) en busqueda por haz, con un nodo `If` que ejecuta solo la rama necesaria y entradas con valores por defecto expuestas como initializers sobreescribibles en ONNX Runtime.

## Capacidades

- Eleccion de palabra: una puntuacion por candidato en chino simplificado e ingles; chino tradicional con pinyin, Zhuyin, Jyutping, Cangjie y Quick.
- Prediccion de palabras siguientes: el decodificador propone las siguientes palabras tras confirmar una (chino en modo chino, ingles en modo ingles).
- Completado de palabras: completa una palabra china cuyos primeros caracteres ya estan escritos (`min_chars`).
- Relleno en mitad del texto: con el cursor dentro del texto lee tambien lo que hay a la derecha (`你的作业｜了吗`).
- Soporte multilingue limitado a zh, en y yue.
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Teclado movil con IME chino: eleccion entre candidatos homofonos (por ejemplo, `san`/`bu` → `散步`, `散布`, `三部`) con puntuaciones calibradas; cabe en el almacenamiento y memoria de un telefono.
- Prediccion de palabras en conversacion: tras confirmar una palabra, el decodificador sugiere las siguientes (`看看`, `学习`, `参加`), reduciendo pulsaciones en mensajeria.
- Entrada en chino tradicional: el mismo modelo puntua candidatos con pinyin, Zhuyin, Jyutping, Cangjie y Quick anadiendo la etiqueta `<zh-Hant>`.
- Escritura en ingles desde teclado chino: prediccion de palabras inglesas en modo ingles (`support`, `work`, `job`) para usuarios bilingues.
- Completado de palabras a medio teclear: completa `我们明天去公` con `司`, `园`, `路`, util para usuarios que escriben rapido.
- Relleno de huecos en edicion de texto: con el cursor en medio de una frase, propone lo que falta (`你的作业` + `了吗` → `开始`, `作文`, `记录`).
- Integracion en aplicaciones de escritorio o web: el ONNX de 10,4-12,2 MB puede empaquetarse en un cliente ligero con ONNX Runtime en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye `test_vectors.safetensors` con 13 entradas de eleccion de palabra y 12 de palabras siguientes (4 en mitad del texto) junto con las salidas del modelo PyTorch en fp32 para validar implementaciones, pero no cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 10,1 MB en safetensors y 10,4-12,2 MB en ONNX; la inferencia en CPU es viable sin GPU.
- GPU recomendadas: no necesarias; cualquier GPU consumer sirve si se desea acelerar, pero no se documentan requisitos.
- Cabe en cualquier GPU consumer y en telefonos moviles, que es su objetivo declarado.
- Despliegue: ONNX Runtime (probado con la version 1.24.4 en CPU), referencia en Rust con candle 0.11; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que el modo contexto se ejecuta una vez y luego pasos en busqueda por haz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhiyi-zhen-mini | 9,94 M | no disponible | Eleccion de palabra y prediccion para IME (zh/en/yue) | Apache 2.0 | Hugging Face, ONNX y safetensors |
| jhu-clsp/mmBERT-small (modelo base) | no disponible en la informacion | no disponible | Encoder multilingue general | no disponible en la informacion | Hugging Face |
| zhen-mini-next-preview (predecesor) | no disponible en la informacion | no disponible | Prediccion de palabras siguientes para IME | no disponible en la informacion | GitHub releases |
| zh-lite-next-preview (predecesor) | no disponible en la informacion | no disponible | Prediccion de palabras siguientes para IME | no disponible en la informacion | GitHub releases |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Es una preview: el IME Zhiyi no la usa todavia, por lo que no hay validacion en produccion.
- Los resultados con pesos a 4 bits difieren de los vectores fp32 de referencia (por ejemplo, en `next0` aparece `参加` en tercera posicion en lugar de primera).
- No se documentan sesgos conocidos, pero al ser un modelo de IME puede heredar sesgos de los datos de entrenamiento, no publicados.
- Riesgo de alucinacion en la prediccion de palabras siguientes; las puntuaciones son relativas y no probabilidades calibradas.
- Cobertura limitada a zh, en y yue; sin soporte documentado para otras lenguas.
- La licencia Apache 2.0 permite uso comercial, pero el estado de preview y la falta de benchmarks desaconsejan desplegarlo sin evaluacion propia.
- El despliegue requiere ONNX Runtime con soporte de `MatMulNBits`/`GatherBlockQuantized` (opset 21 y dominio `com.microsoft`) o la referencia en Rust.

## Enlaces

- Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-zhen-mini
- Repositorio del IME: https://github.com/dd1000001000/zhiyi_ime
- Release 1116: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zhen-mini-next-preview-1116
- Release predecesor: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zhen-mini-next-preview
- Release zh-lite: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zh-lite-next-preview
- Todos los modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
