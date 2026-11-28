# VoidOSS/VoidNet-25M-TinyStories

## Resumen

VoidNet-25M-TinyStories es un modelo de lenguaje de caracteres (character-level) desarrollado por VoidOSS bajo una arquitectura propia y original denominada VoidNet. El modelo no utiliza tokenizador: opera directamente sobre caracteres ASCII crudos y aplica una etapa de compresión interna ("Void Packer") que agrupa cada 4 caracteres en un único "Void token", reduciendo la longitud efectiva de la secuencia y, con ello, el coste cuadrático de la atención. El núcleo del modelo emplea una variante de atención denominada UltraFlashAttention, con cabezales Q/K/V comprimidos, mezcla causal local por convolución depthwise, RMSNorm, RoPE y SwiGLU.

Con 25.207.936 parámetros (unos 100,8 MB en safetensors), fue entrenado durante 15 minutos en una única GPU de consumo (NVIDIA RTX 4060 Ti de 8 GB) sobre el dataset TinyStoriesV2-GPT4, lo que lo sitúa como un experimento de bajo coste y arquitectura alternativa más que como un modelo de producción. Su ventana de contexto es de 2.048 caracteres crudos, equivalentes a 512 tokens Void.

La relevancia del modelo es fundamentalmente arquitectónica y educativa: demuestra que una pipeline de compresión carácter-a-token con decodificador separado puede superar a un transformer FlashAttention de cómputo comparable en velocidad y perplejidad en el régimen de TinyStories. No obstante, su tamaño, su dominio de entrenamiento (cuentos infantiles sintéticos) y su naturaleza character-level lo limitan a tareas de generación de texto muy restringidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoidNetV3LM (Void Packer 4x + UltraFlashAttention + traductor ingles de 2 capas con FiLM) |
| Parametros totales | 25.207.936 (25,21 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 caracteres crudos (512 tokens Void) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizador | Ninguno (caracteres crudos); vocabulario de 73 simbolos (71 ASCII imprimibles + V_endText=71 + V_pad=72) |
| Tamano del repositorio | 0,1 GB |
| Hardware de entrenamiento | 1x NVIDIA RTX 4060 Ti (8 GB), 15,0 minutos |
| Datos de entrenamiento | 153,3 M caracteres (146.391 historias de TinyStoriesV2-GPT4), 9.358 pasos |
| Mejor BPC de validacion | 0,7086 BPC |

## Arquitectura y entrenamiento

VoidNet se estructura en tres etapas. Primero, un "Void Packer" comprime cada 4 caracteres crudos en un único token Void, lo que acorta la secuencia 4x y reduce 16x el numero de comparaciones de atención por pares. Segundo, el "Void Core" opera exclusivamente en el espacio Void mediante UltraFlashAttention, que combina cuellos de botella Q/K/V entre 2x y 4x mas estrechos, FlashAttention fusionada, mezcla causal local depthwise, RMSNorm, RoPE y SwiGLU. Tercero, un traductor Void-a-ingles independiente, un decodificador causal ligero de 2 capas condicionado por modulación FiLM (escala y desplazamiento) sobre el vector Void, junto con una convolución local de union de caracteres (k = 5) que reconstruye cada token Void en 4 caracteres.

El entrenamiento se realizo sobre TinyStoriesV2-GPT4 (146.391 historias alineadas, 153,3 M caracteres) en 9.358 pasos. El modelo incorpora un token de control reservado V_endText (ID 71) que sustituye al delimitador `<|endoftext|>` y permite detener la generación de forma instantánea en el espacio Void, ademas de rellenar cada historia hasta el limite de 4 caracteres con V_pad (ID 72), enmascarado en la perdida. El autor declara una verificacion estricta de causalidad sin fuga de futuro (past_diff = 0,00e+00). No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto en ingles a nivel de carácter, orientada a historias cortas de estilo TinyStories.
- Compresión y reconstrucción interna de secuencias mediante el esquema Void Packer y el traductor FiLM.
- Parada instantánea de generación mediante el token de control V_endText, sin sangrado entre historias.
- Manejo de contexto de hasta 2.048 caracteres crudos (512 tokens Void).
- Causalidad estricta verificada, adecuada para tareas autorregresivas puras.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue (solo ingles).
- No dispone de visión, audio ni modo de razonamiento explicito.

## Casos de uso

- Generación de cuentos infantiles sinteticos: el modelo fue entrenado especificamente sobre TinyStories y produce historias cortas coherentes en ingles con parada limpia gracias a V_endText, ideal para generar datasets sinteticos de cuentos a gran escala.
- Investigacion en arquitecturas sin tokenizador: sirve como referencia reproducible (entrenamiento en 15 minutos en una GPU de 8 GB) para estudiar compresion carácter-a-token, atención comprimida y decodificadores condicionados por FiLM.
- Pruebas de concepto de eficiencia en contexto largo: los datos del autor muestran escalado hasta 16K tokens con hasta 14,18x de aceleracion frente a FlashAttention en ese regimen, lo que permite experimentar con variantes de contexto largo en hardware de consumo.
- Docencia y formacion: su bajo coste de entrenamiento y su implementacion de referencia autocontenida (modeling_voidnet.py) lo hacen util para explicar pipelines de compresion, atención y decodificacion en cursos de deep learning.
- Generacion de texto de relleno o demos: por su tamano (100,8 MB) y su licencia MIT, puede desplegarse en entornos de demostracion o prototipos donde no se requiera calidad de produccion.
- Experimentos de alineacion de historias: el relleno con V_pad y el control V_endText permiten construir pipelines de generacion por lotes con historias alineadas a limites de 4 caracteres, utiles para tareas de evaluacion automatizada de coherencia narrativa.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card.

Comparativa de coherencia a computo igualado (aprox. 10,8 M parametros, 3 minutos de entrenamiento cada uno, T = 2048, misma infraestructura RMSNorm + RoPE + SwiGLU + FlashAttention + LR coseno):

| Modelo | Parametros | Velocidad (T=2048) | Datos entrenados (3 min) | BPC de validacion final |
|---|---:|---:|---:|---:|
| FlashRoPE Transformer | 10,67 M | 121K car/s | 21,86 M car | 0,9353 BPC |
| VoidNet v3 | 10,91 M | 289K car/s (2,38x) | 51,97 M car | 0,9117 BPC |

Escalado en contexto largo (T = 16.384, 8 GB de VRAM):

| Contexto (16K tok/paso) | FlashAttention TF | VoidNet-v2-4x | VoidNet-v2-8x | Aceleracion 8x |
|---|---:|---:|---:|---:|
| 1K | 604K tok/s (27,1 ms) | 1,29M tok/s (2,14x) | 1,95M tok/s (8,4 ms) | 3,23x |
| 4K | 318K tok/s (51,5 ms) | 1,22M tok/s (3,82x) | 1,90M tok/s (8,6 ms) | 5,97x |
| 8K | 200K tok/s (81,8 ms) | 1,10M tok/s (5,48x) | 1,80M tok/s (9,1 ms) | 9,00x |
| 16K | 116K tok/s (140,7 ms) | 926K tok/s (7,95x) | 1,65M tok/s (9,9 ms) | 14,18x |

El modelo de 25,21 M reporta 0,7086 BPC de validacion. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (pesos de 100,8 MB mas estados de activacion y cache de atencion para 512 tokens Void).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor entreno en una RTX 4060 Ti de 8 GB, por lo que modelos de gama media (RTX 3060, RTX 4060) son mas que suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card solo documenta carga via `safetensors` + `huggingface_hub` con la implementacion de referencia `modeling_voidnet.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: segun el autor, en T=2048 el modelo alcanza 289K caracteres/s en la comparativa de computo igualado; el escalado a 16K tokens alcanza 1,65M tok/s en la variante 8x. No se publican cifras de latencia para el modelo de 25,21 M en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| VoidNet-25M-TinyStories | 25,21 M | 2.048 caracteres | Character-level con compresion Void 4x y UltraFlashAttention | MIT | Hugging Face (VoidOSS) |
| FlashRoPE Transformer (referencia del autor) | 10,67 M | No disponible | Transformer estandar con FlashAttention | No disponible | No disponible |
| TinyStories GPT-Neo (variantes de referencia) | 1 M - 33 M | 512-2.048 tokens | Transformer tokenizado entrenado en TinyStories | Varía (MIT/Apache en variantes) | Hugging Face (varios autores) |

No se dispone de datos de benchmarks comunes que permitan una comparacion directa con modelos de la misma categoria mas alla de la comparativa interna del autor.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con TinyStoriesV2-GPT4, por lo que su vocabulario, estilo y temas se limitan a cuentos infantiles sinteticos en ingles.
- Solo ingles: no se documenta capacidad multilingue; el vocabulario de caracteres es ASCII imprimible.
- Riesgo de alucinacion alto fuera de dominio: al ser un modelo character-level de 25 M, la coherencia decae rapidamente con prompts fuera de su distribucion.
- Ventana de contexto limitada a 2.048 caracteres crudos (512 tokens Void), insuficiente para documentos largos.
- Sin ajuste por instrucciones (no RLHF/DPO documentado): no es fiable como asistente conversacional ni para seguir instrucciones complejas.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset TinyStories contiene narrativas sinteticas con roles y estereotipos infantiles que pueden reflejarse en las salidas.
- Licencia MIT: permite uso comercial, pero el modelo no esta pensado para produccion y no se ofrecen garantias de calidad ni de seguridad.
- Dependencia de la implementacion de referencia: no hay integracion con frameworks de inferencia estandar, lo que complica el despliegue en pipelines de produccion.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoidOSS/VoidNet-25M-TinyStories
- Dataset TinyStories (Ronen Eldan): https://huggingface.co/datasets/roneneldan/TinyStories
- Implementacion de referencia: `modeling_voidnet.py` incluido en el repositorio del modelo
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
