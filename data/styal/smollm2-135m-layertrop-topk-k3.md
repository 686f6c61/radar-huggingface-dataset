# styal/SmolLM2-135M-layertrop-topk-k3

## Resumen

SmolLM2-135M-layertrop-topk-k3 es un ajuste fino continuado del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario styal bajo licencia Apache 2.0. El objetivo del entrenamiento no es mejorar la calidad conversacional en si, sino hacer que el modelo sea menos fragil cuando se elimina cualquiera de sus bloques decodificadores: es decir, reducir el dano en la perdida de evaluacion causado por la poda de un bloque completo. Para ello se aplica una politica de LayerDrop con muestreo Gumbel top-k, con k=3 bloques eliminados de 30 por ejemplo de entrenamiento.

El modelo conserva la arquitectura original (transformer decodificador de tipo Llama, 134.515.008 parametros) y solo se somete a 500 pasos de ajuste fino con batch 8, lo que equivale a 4.000 conversaciones, un tercio de una epoca. A pesar de la brevedad del entrenamiento, la perdida de evaluacion resultante (1,1649) mejora la del ajuste anterior de 1.500 pasos (1,1914) sobre la misma particion de test.

Su relevancia es principalmente de investigacion: sirve como banco de pruebas reproducible para estudiar robustez a poda, sensibilidad de bloques y cuantizacion agresiva en modelos muy pequenos. Con 0 descargas y 0 likes en el momento de la consulta, no hay validacion externa del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador tipo Llama (etiqueta `llama`), 30 bloques decodificadores |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ajuste se realizo con secuencias de 512 tokens |
| Tipos de cuantizacion | fp16 (checkpoint publicado); GGUF Q4_K validado por el autor frente a la implementacion en C de llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decodificador denso de estilo Llama con 134,5 millones de parametros distribuidos en 30 bloques. El cambio introducido por este ajuste no esta en la topologia, sino en la politica de regularizacion durante el entrenamiento. Cada bloque recibe una puntuacion de importancia calculada como su `delta_loss` medido (el incremento de perdida de evaluacion al eliminar ese bloque de forma aislada) dividido entre la suma de todas las puntuaciones. En cada ejemplo de entrenamiento se anade ruido Gumbel(0,1) a esas puntuaciones y se eliminan los k=3 bloques con los valores mas altos, lo que garantiza exactamente tres bloques distintos por ejemplo sin fijar nunca un ranking deterministico.

No se aplica annealing, ni tope `p_max`, ni renormalizacion, ni suelo de importancia. La ponderacion resultante es suave por construccion: la dispersion del ruido Gumbel (~1,27) domina sobre el rango de las puntuaciones (~0,004-0,385), de modo que el bloque 0 se elimina en aproximadamente el 14% de los ejemplos frente al 10% de un bloque aleatorio uniforme. Los datos de entrenamiento provienen del corpus smol-smoltalk: 500 pasos por batch 8, sin reutilizacion de filas, con learning rate 2e-5 con decaimiento coseno sobre un schedule de 1.500 pasos truncado a 500, y refresco de la politica de eliminacion cada 250 pasos (dos refrescos). La particion de test se uso una sola vez, para el informe final, y la importancia se midio sobre un fragmento de validacion extraido del propio corpus de entrenamiento. No se documenta RLHF ni DPO en esta etapa.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base SmolLM2-135M-Instruct.
- Seguimiento de instrucciones y reescritura de texto, capacidades documentadas para la familia SmolLM2-135M.
- Inferencia en dispositivo (on-device) sin dependencia de la nube, gracias al tamano reducido del checkpoint.
- Robustez a la poda de un bloque decodificador concreto: la `max_delta_loss` cae un 29% respecto al base.
- Compatibilidad declarada con text-generation-inference y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.

## Casos de uso

- Investigacion sobre poda de bloques: el checkpoint permite medir directamente el coste de eliminar cada bloque y comparar politicas de LayerDrop sin entrenar desde cero, ya que el autor publica la politica y las comprobaciones de invariantes.
- Cuantizacion agresiva en el borde: con ~134,5 M de parametros el modelo cabe en memoria de un movil o de una Raspberry Pi, y el autor incluye verificacion del cuantizador Q4_K frente a llama.cpp, lo que lo hace util para validar pipelines GGUF de 4 bits.
- Prototipado rapido de asistentes conversacionales locales: al ejecutarse en CPU y sin red, sirve para iterar sobre prompts y flujos de dialogo antes de escalar a un modelo mayor.
- Modelo borrador para decodificacion especulativa: su tamano y su tolerancia a recortes de bloques lo hacen candidato a proponer tokens que un modelo mayor verifica despues.
- Docencia y reproducibilidad: el repositorio incluye `damage/build_layertrop.py`, `damage/layertrop_config.json` y `checks_notebook/`, lo que permite reproducir el experimento paso a paso en un cuaderno.
- Filtrado y clasificacion de texto ligera: tareas de etiquetado, resumen corto o reformulacion en entornos con restricciones de latencia y sin GPU.
- Banco de pruebas de CI para tooling de poda: los invariantes verificados (exactamente k bloques distintos por ejemplo, ningun bloque siempre o nunca eliminado) se pueden reutilizar como tests automatizados en un pipeline de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de la propia model card sobre la particion smol-smoltalk:test (512 conversaciones, 363.373 tokens puntuados, seed 42). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Base | v7 (1.500 pasos, anneal + cap) | Este modelo (500 pasos, top-k) |
|---|---|---|---|
| Perdida de evaluacion | 1,2694 | 1,1914 | 1,1649 |
| `max_delta_loss` (peor caso de eliminacion) | 8,342 | 4,762 (-43%) | 5,900 (-29%) |
| `sum_delta_loss` | 21,68 | 9,69 | 11,84 |
| `max_over_min` | 100,6x | 62,9x | 76,2x |
| Coeficiente de variacion | 2,159 | 2,575 | 2,630 |
| Cuota del bloque 0 en el coste de eliminacion | 38,5% | 49,2% | 49,8% |

La lectura que hace el propio autor es mixta: la calidad es la mejor de las tres variantes con un tercio de los pasos, y el dano en el peor caso cae un 29% frente al 8,34 del base, pero no alcanza el -43% del run de 1.500 pasos. Ademas, la distribucion de importancia no se vuelve mas uniforme: el coeficiente de variacion sube de 2,16 a 2,63 y el bloque 0 concentra el 49,8% del coste total de eliminacion. El autor senala que `max_delta_loss` es la metrica decisiva y que CV y max/mean no son senales de progreso porque normalizan por la suma.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no medida por el autor): ~270 MB en fp16, ~135 MB en int8 y ~70-80 MB en Q4. Hay que sumar la cache KV, que con 30 bloques y contexto corto es de pocos megabytes.
- Cabe en cualquier GPU de consumo e incluso en graficas integradas; una RTX 4090 o una A100 quedan enormemente sobredimensionadas para este modelo.
- Inferencia viable en CPU, en Raspberry Pi y en dispositivos moviles.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y formatos GGUF (el autor valida el cuantizador Q4_K contra la implementacion en C), text-generation-inference (etiqueta del repositorio) y endpoints compatibles. vLLM y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 0,3 GB, segun los metadatos de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| styal/SmolLM2-135M-layertrop-topk-k3 | 134,5 M | No disponible (ajuste con secuencias de 512) | Perdida de eval. 1,1649; `max_delta_loss` 5,900 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | ~135 M | No disponible en la informacion proporcionada | Perdida de eval. 1,2694; `max_delta_loss` 8,342 | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Run v7 del mismo autor (1.500 pasos, anneal + cap) | 134,5 M | No disponible | Perdida de eval. 1,1914; `max_delta_loss` 4,762 | Apache 2.0 | No consta como checkpoint publico independiente en la informacion disponible |
| Otros modelos de ~135 M de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El entrenamiento de 500 pasos es corto y el propio autor reconoce que `max_delta_loss` no ha convergido: un run mas largo probablemente cerraria la diferencia con el -43% del v7.
- No hay medicion en 4 bits para este checkpoint. La reduccion del 31% en dano de cuantizacion se midio sobre el modelo v7 y no se traslada automaticamente.
- La cifra del 31% carece de control: no existe un ajuste fino sin LayerDrop (`p_max=0`) con el mismo presupuesto, por lo que no esta establecido que la mejora se deba al LayerDrop y no a cualquier ajuste continuado sobre estos datos.
- La concentracion de importancia es mayor, no menor: el bloque 0 pasa a absorber el 49,8% del coste de eliminacion, lo que contradice una lectura ingenua de "distribucion mas uniforme".
- Riesgo de alucinacion propio de un modelo de 135 M de parametros: la capacidad de razonamiento y de mantener coherencia en contextos largos es muy limitada.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar del SmolLM2-135M-Instruct y de smol-smoltalk, hereda los sesgos de ese corpus y de ese ajuste.
- Idiomas soportados: no disponibles. No se debe asumir cobertura multilingue.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa ni resultados en benchmarks estandar, lo que desaconseja su uso en produccion sin evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/styal/SmolLM2-135M-layertrop-topk-k3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Modelo SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Ficha divulgativa de SmolLM2-135M: https://llm.co/llms/smollm2-135m
- Repositorio de referencia de configuracion y verificaciones (rutas citadas en la model card): `damage/build_layertrop.py`, `damage/layertrop_config.json`, `checks_notebook/` (incluidos en el repositorio de HuggingFace).
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada.
