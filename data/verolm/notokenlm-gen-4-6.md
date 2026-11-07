# VeroLM/NoTokenLM-Gen-4.6

## Resumen

NoTokenLM-Gen-4.6 es un modelo de lenguaje de 36,8 millones de parametros desarrollado por VeroLM (publicado tambien bajo el identificador `omurberaisik`) que opera directamente sobre bytes UTF-8, sin tokenizador de subpalabras ni vocabulario BPE: la entrada y la salida son bytes crudos. Forma parte de la familia NoTokenLM, una serie de modelos pequenos construidos para explorar cuanto puede lograr un modelo genuinamente compacto cuando la arquitectura y el entrenamiento se disenan con cuidado en lugar de compensar con escala.

El checkpoint descrito corresponde al paso 9.000 de un preentrenamiento desde cero (sin ajuste por instrucciones) sobre una mezcla de texto en ingles que incluye aproximadamente un 20 % de contenido matematico. La arquitectura es un transformer de 15 capas con `d_model=448`, RoPE, RMSNorm, SwiGLU, una convolucion de entrada corta, QK-norm, value residual y puertas de salida por cabeza. El optimizador combina Muon para las matrices de atencion y feed-forward con AdamW para el resto de parametros.

Es relevante ahora como pieza de investigacion reproducible: el autor documenta de forma transparente que este checkpoint es el modelo *mas grande* de la familia pero no el *mejor*, con una evaluacion manual de 1.000 generaciones y cifras de perdida de validacion. Resulta util para estudiar modelado a nivel de byte, entrenamiento de modelos diminutos y el efecto de decisiones de mezcla de datos y optimizador, no para uso productivo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only a nivel de byte (15 capas, `d_model=448`), RoPE, RMSNorm, SwiGLU, convolucion de entrada corta, QK-norm, value residual, puertas de salida por cabeza |
| Parametros totales | 36.782.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con fragmentos de 1.024 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo de arquitectura propio, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que procesa bytes UTF-8 en lugar de tokens de subpalabra. Incorpora RoPE para el posicionamiento, RMSNorm, activacion SwiGLU, una convolucion de entrada corta que mezcla bytes locales, QK-norm para estabilizar la atencion, value residual y puertas de salida por cabeza. No hay tokenizador de subpalabras: `AutoTokenizer` es solo un mapeo byte<->id para permitir la carga estandar en Hugging Face.

El entrenamiento es un preentrenamiento desde cero de 9.000 pasos con batch 8, acumulacion de gradiente 8 y 1.024 bytes por muestra, lo que equivale a aproximadamente 0,59 GB de texto. La mezcla de datos es texto en ingles con cerca de un 20 % de matematicas (se anaden matematicas y se elimina el frances respecto a versiones anteriores). El optimizador es hibrido: Muon (lr 0,02, momentum 0,95, Nesterov, 5 pasos de Newton-Schulz) sobre las matrices de atencion y feed-forward, y AdamW sobre el resto (embedding lr 0,2 sin weight decay; normas, puertas, convolucion y escalares lr 3e-4 con weight decay 0,1; betas 0,9/0,95). Se usan 500 pasos de warmup, decaimiento de learning rate por meseta (reduccion a la mitad si la perdida suavizada no mejora 0,1 en 150 pasos, con suelo del 5 % del pico), clipping de gradiente a 1,0 y EMA con decaimiento 0,999. Los datos se transmitieron en fragmentos rotativos de 500 MB. La mejor perdida de validacion registrada fue de 0,9233 nats por byte (aproximadamente 1,33 bits por byte) sobre una particion reservada de la mezcla de este mismo entrenamiento, por lo que no es comparable con la de Gen-3.6 (0,8915), que uso datos distintos. No hubo ajuste por instrucciones ni RLHF/DPO.

## Capacidades

- Generacion de texto a nivel de byte en ingles: continuacion de frases y parrafos cortos.
- Modelado de lenguaje y puntuacion de secuencias (perplejidad, BLiMP, LAMBADA segun la model card).
- Generacion con contenido matematico basico, dado el 20 % de matematicas en la mezcla de entrenamiento.
- Manejo nativo de cualquier secuencia UTF-8 sin vocabulario fijo, lo que evita problemas de tokens fuera de vocabulario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- No es un modelo conversacional ni responde preguntas de forma fiable; el propio autor lo indica explicitamente.

## Casos de uso

- Investigacion sobre modelado a nivel de byte: permite estudiar como un transformer pequeno aprende directamente sobre bytes UTF-8, sin sesgos de tokenizacion, y comparar con variantes con BPE.
- Experimentos de arquitectura en modelos diminutos: sirve como banco de pruebas reproducible para RoPE, RMSNorm, SwiGLU, QK-norm, value residual y puertas por cabeza en regimenes de pocos millones de parametros.
- Estudio del optimizador Muon: es el primer release de la familia entrenado con Muon, por lo que resulta util para analizar su comportamiento frente a AdamW en modelos pequenos.
- Generacion de texto creativo muy corto y controlado: con temperatura 0,5 y top-k 40 produce continuaciones de frases coherentes en aproximadamente la mitad de los casos, util para demos y analisis cualitativos.
- Ensenanza y divulgacion: el modelo cabe en cualquier GPU de consumo y permite ilustrar el ciclo completo de preentrenamiento, evaluacion manual y analisis de fallos.
- Puntuacion de texto y deteccion de anomalias gramaticales: la perdida por byte puede emplearse como senal para comparar la fluidez de fragmentos en ingles dentro de pipelines de filtrado de datos.
- Pruebas de infraestructura de inferencia: su tamano minimo (0,1 GB de repo) lo hace idoneo para validar integraciones con `transformers` y `trust_remote_code` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona una evaluacion manual de 1.000 generaciones (1.000 prompts distintos, una generacion cada uno, temperatura 0,5, top-k 40, 35 bytes nuevos), con cada salida leida y clasificada. Los resultados se comparan con NoTokenLM-Gen-3.6 (13,9 M de parametros):

| Metrica | Gen-4.6 (36,8 M) | Gen-3.6 (13,9 M) |
|---|---|---|
| Totalmente coherente | 537 (53,7 %) | 78,0 % |
| Gramatica correcta, significado roto | 413 (41,3 %) | 21,5 % |
| Gramatica rota | 50 (5,0 %) | 0,5 % |
| Gramaticalmente correcto en total | 95,0 % | 99,5 % |
| Perdida de validacion | 0,9233 nats/byte (≈1,33 bits/byte) | 0,8915 nats/byte (datos distintos, no comparable) |

Segun la model card, Gen-4.6 es estadisticamente indistinguible de Gen-3.6 en BLiMP y LAMBADA, y claramente peor en continuacion de historias cortas. No se han publicado resultados numericos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (36,8 M de parametros ocupan unos 147 MB en fp32 y unos 74 MB en fp16); el repo completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al requerir codigo de arquitectura propio la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-4.6 | 36,8 M | no disponible (entrenado con 1.024 bytes) | Byte-level, sin tokenizador, ingles + 20 % matematicas | Apache 2.0 | Hugging Face |
| NoTokenLM-Gen-3.6 | 13,9 M | no disponible | Byte-level, sin tokenizador, incluye frances | no disponible en la informacion | Hugging Face |
| NoTokenLM-Gen-4.5 | no disponible | no disponible | Byte-level, version previa de la misma generacion | no disponible en la informacion | Hugging Face |

En la comparacion documentada, Gen-3.6 supera a Gen-4.6 en coherencia de continuacion (78,0 % frente a 53,7 %) pese a tener menos de la mitad de parametros, mientras que en BLiMP y LAMBADA ambos son estadisticamente indistinguibles. No se dispone de datos de benchmarks estandar para comparar con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- No es un modelo conversacional ni responde preguntas: el autor lo declara explicitamente y lo describe como un checkpoint temprano de preentrenamiento.
- Solo ingles; no soporta otros idiomas de forma fiable.
- Alta tasa de fallos de coherencia: el 41,3 % de las generaciones evaluadas tienen gramatica correcta pero significado roto (pronombres, genero u objetos incoherentes) y un 5,0 % presentan gramatica rota.
- El checkpoint es el mas grande de la familia pero no el mejor: es claramente inferior a Gen-3.6 en continuacion de historias y estadisticamente equivalente en BLiMP y LAMBADA.
- La perdida de validacion (0,9233 nats/byte) no es comparable con la de Gen-3.6 porque la mezcla de datos cambio; el autor advierte que la comparacion no es un experimento controlado.
- Riesgo de alucinacion y de deriva semantica elevado por el reducido volumen de entrenamiento (aproximadamente 0,59 GB de texto) y el tamano del modelo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de arquitectura enviado con el repositorio; conviene revisarlo antes de desplegar en entornos de produccion.
- El byte de fin de documento se muestreo y redibujo en 6 de 1.000 salidas, lo que puede afectar a la delimitacion de generaciones.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion para tareas de usuario final.
- No se documentan sesgos especificos ni evaluaciones de seguridad; la mezcla de datos es texto en ingles con matematicas y no se detalla su procedencia.

## Enlaces

- Modelo en Hugging Face (VeroLM): https://huggingface.co/VeroLM/NoTokenLM-Gen-4.6
- Modelo en Hugging Face (omurberaisik): https://huggingface.co/omurberaisik/NoTokenLM-Gen-4.6
- Modelo predecesor NoTokenLM-Gen-3.6: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6
- Ficha en LLM Explorer: https://llm-explorer.com/model/omurberaisik%2FNoTokenLM-Gen-4.6,6xuB0KyuSL2TpRNbkamtCb
- Resultados de la evaluacion de 1.000 generaciones: `gen46_9000_1000_test_outputs.json` (incluido en el repositorio del modelo)
