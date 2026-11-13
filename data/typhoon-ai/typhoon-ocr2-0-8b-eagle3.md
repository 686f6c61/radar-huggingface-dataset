# typhoon-ai/typhoon-ocr2-0.8b-eagle3

## Resumen

Typhoon OCR V2 0.8B EAGLE-3 es una cabeza de borrador (draft head) especulativa para el modelo de OCR y parseo de documentos Typhoon OCR V2 0.8B, desarrollado por Typhoon AI (SCB 10X). No es un modelo autonomo: se ejecuta siempre junto al modelo base y su unica funcion es acelerar la generacion de texto en vLLM mediante decodificacion especulativa con el metodo EAGLE-3. El repositorio contiene unicamente los pesos de la cabeza de borrador, no el modelo completo.

El modelo base es un transformer multimodal de tipo image-text-to-text orientado a OCR y document parsing, con soporte de tailandes e ingles y una ventana de contexto de 40.960 tokens. La cabeza de borrador propone 3 tokens por paso que el modelo base verifica en un unico forward pass, aceptando de media 3,1 tokens por paso (maximo 4) con una tasa de aceptacion del 70%, lo que se traduce en una aceleracion de 1,5 a 1,7 veces segun la carga.

Es relevante ahora porque la decodificacion especulativa se ha consolidado como la tecnica estandar para reducir latencia en inferencia de produccion sin degradar la calidad, y este repositorio ofrece una implementacion lista para vLLM 0.33.0 con licencia Apache 2.0, integrable en pipelines de OCR a gran escala sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador EAGLE-3: una capa transformer que lee hidden states de las capas 2, 12 y 21 del modelo base |
| Parametros totales | 309.879.552 (pesos en safetensors, incluye copia de los input embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (heredada de la configuracion de vLLM del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes cuantizadas) |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) + config.json y config.py para speculators |

## Arquitectura y entrenamiento

La cabeza de borrador es una unica capa transformer que consume los hidden states de las capas 2, 12 y 21 de Typhoon OCR V2 0.8B y predice el siguiente token sobre un vocabulario de borrador reducido a los 32.000 tokens mas frecuentes. Se entreno con la libreria `speculators` de vLLM en modo EAGLE-3 con entrenamiento online, replicando los ajustes de la cabeza equivalente del modelo de 2B.

Los datos de entrenamiento consisten en 20.000 imagenes de pagina con sus prompts, muestreadas de los datos de SFT y GRPO de Typhoon OCR V2, con peso extra en parseo JSON de pagina completa y en paginas en tailandes. Las respuestas se generaron con el propio Typhoon OCR V2 0.8B en decodificacion greedy, de modo que la cabeza aprende a predecir las salidas de ese modelo concreto. Tras eliminar salidas en bucle o vacias y 16 imagenes ilegibles, quedaron 18.988 conversaciones. El entrenamiento fue de 5 epocas con learning rate 1e-4, secuencias de hasta 16.384 tokens y una sola GPU H100. En conversaciones reservadas, el primer, segundo y tercer token propuesto son correctos el 86%, 74% y 64% de las veces respectivamente.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa EAGLE-3 en vLLM, con 3 tokens propuestos por paso y verificacion en un solo forward pass del modelo base.
- Generacion de 3,1 tokens por paso de media (maximo 4) con 70% de tokens aceptados.
- Compatibilidad con prompts, ajustes de muestreo (greedy, temperature=0) y la opcion `enable_thinking=False` del chat template del modelo base.
- Soporte de entrada multimodal imagen-texto a traves del modelo base (una imagen por prompt, con `min_pixels` 2048 y `max_pixels` 16.777.216).
- No soporta tool calling, agentes ni razonamiento multi-paso por si misma: hereda exclusivamente las capacidades del modelo base al que acompana.
- No funciona de forma autonoma ni con Transformers, llama.cpp (GGUF), Ollama o MLX.

## Casos de uso

- Digitalizacion masiva de documentos en tailandes e ingles: el pipeline procesa lotes de imagenes de pagina con vLLM y la cabeza reduce el tiempo de generacion entre 1,5 y 1,7 veces, lo que abarata el coste por pagina en volumen alto.
- Extraccion de JSON estructurado de facturas y formularios: al estar entrenada con peso extra en parseo JSON de pagina completa, mantiene la precision del modelo base mientras acelera la salida estructurada.
- Servicio de OCR con baja latencia interactiva: con una sola peticion simultanea se pasa de 327 a 546 tokens/s en H100, adecuado para interfaces donde el usuario espera el resultado en segundos.
- Procesamiento por lotes en servidor: con 16 peticiones concurrentes el throughput sube de 1.488 a 2.570 tokens/s, util para backfills nocturnos de archivos documentales.
- Digitalizacion de archivos historicos en tailandes: el entrenamiento con peso en paginas tailandesas permite mantener la calidad en ese idioma mientras se acelera el procesado.
- Despliegue en infraestructura con GPU limitada: al reducir el tiempo de generacion, mas paginas caben en la misma ventana de GPU, lo que permite mantener el SLA con menos hardware.
- Integracion en pipelines de vLLM existentes: solo requiere anadir la linea `--speculative-config` al comando de servidor ya usado para el modelo base, sin cambiar prompts ni salidas.

## Benchmarks y rendimiento

Rendimiento medido en vLLM 0.33.0 en modo compilado por defecto, una GPU H100, decodificacion greedy, 3 tokens de borrador y 30 paginas reservadas del entrenamiento:

| Configuracion | Sin draft head | Con draft head | Aceleracion |
|---|---:|---:|---:|
| Una peticion a la vez | 327 tokens/s | 546 tokens/s | 1,7x |
| 16 peticiones a la vez | 1.488 tokens/s | 2.570 tokens/s | 1,5x |

Precision en MDPBench (320 paginas en ingles y tailandes), con cuatro ejecuciones sin draft head y una con draft head:

| MDPBench, vLLM 0.33.0 | Sin draft head (4 ejecuciones) | Con draft head (1 ejecucion) |
|---|---:|---:|
| Global | 76,8 (rango 76,3-76,9) | 76,9 |
| Paginas en ingles | 76,8 (76,5-76,9) | 77,2 |
| Paginas en tailandes | 76,8 (76,1-77,1) | 76,6 |
| Paginas con bucles de repeticion | 6 a 11 | 7 |

El cambio global con draft head es de +0,2 puntos con intervalo de confianza del 95% de -1,0 a +1,3, por lo que no se observa cambio en precision. La salida es identica a una ejecucion sin draft head en 152-160 de las 320 paginas, una tasa comparable a la concordancia entre dos ejecuciones sin draft head.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,6 GB y los pesos estan en bfloat16, por lo que la cabeza anade una fraccion pequena sobre el modelo base de 0,8B.
- GPU recomendadas: H100 para las mediciones publicadas; el modelo base de 0,8B es lo suficientemente pequeno para GPUs de menor capacidad, aunque no se documentan cifras en otras GPU.
- Cabe en GPU de consumo: no disponible (no se publican mediciones en RTX 4090 u otras consumer).
- Despliegue: exclusivamente vLLM, probado con la version 0.33.0. No funciona con Transformers, llama.cpp (GGUF), Ollama ni MLX.
- Latencia y throughput: 546 tokens/s con una peticion y 2.570 tokens/s con 16 peticiones en H100; la aceleracion es mayor cuando la GPU no esta plenamente cargada y disminuye al crecer la concurrencia.
- La aceleracion es inferior a la del modelo de 2B (1,9 a 2,5x) porque la cabeza del modelo pequeno predice sus tokens con menor precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceleracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| typhoon-ocr2-0.8b-eagle3 | 309,9 M (cabeza) | 40.960 | 1,5-1,7x | Apache 2.0 | Hugging Face, solo vLLM |
| typhoon-ai/typhoon-ocr2-2b-eagle3 | no disponible | no disponible | 1,9-2,5x | Apache 2.0 | Hugging Face, solo vLLM |
| typhoon-ai/typhoon-ocr2-0.8b (modelo base) | 0,8B (nominal) | 40.960 | sin aceleracion (referencia) | Apache 2.0 | Hugging Face, vLLM |

La comparativa se limita a la familia Typhoon OCR V2 porque no se dispone de informacion sobre otras cabezas de borrador EAGLE-3 para OCR en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere siempre el modelo base typhoon-ai/typhoon-ocr2-0.8b y no produce salidas por si mismo.
- Solo funciona con vLLM, probado con la version 0.33.0; otras versiones pueden requerir ajustes y no hay soporte para Transformers, llama.cpp, Ollama ni MLX.
- La decodificacion especulativa puede alterar ligeramente la salida: el orden de las operaciones en GPU cambia y, en empates casi exactos, puede seleccionarse otro token. Dos ejecuciones sin draft head solo coinciden en 151 de 320 paginas de MDPBench.
- La aceleracion se reduce al aumentar la concurrencia (de 1,7x a 1,5x con 16 peticiones) y es menor que en el modelo de 2B.
- La cabeza esta entrenada sobre las salidas del modelo base 0.8B en decodificacion greedy; usarla con otro modelo o con ajustes de muestreo distintos puede degradar la tasa de aceptacion.
- Idiomas limitados a tailandes e ingles; no se documenta cobertura de otros idiomas.
- Riesgo de bucles de repeticion en OCR: se observaron entre 6 y 11 paginas con bucles en las ejecuciones sin draft head y 7 con draft head sobre 320 paginas.
- No se documentan sesgos especificos; al heredar el comportamiento del modelo base, cualquier sesgo de este se mantiene.
- Licencia Apache 2.0 permite uso comercial, pero la model card esta truncada y no se han podido verificar condiciones adicionales mas alla de lo citado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-eagle3
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Cabeza de borrador del modelo de 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-eagle3
- Libreria speculators (vLLM): https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
