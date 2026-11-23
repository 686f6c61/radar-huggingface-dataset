# Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX2.5

## Resumen

Tileward-Kimi-K3.1-Pro-TWX2.5 es una compresion del modelo Kimi K3.1 Pro de Moonshot AI realizada por Tileward Inc. mediante su metodo propietario TWX2.5. El resultado es un checkpoint que ocupa 1.008,3 GB en disco, un 35 % menos (1,5x de compresion) que los 1.561,3 GB del modelo original tal y como lo publica Moonshot, y que se almacena directamente en 4 bits. Segun el autor, la perdida de calidad es de apenas una decima en MMLU (90,5 frente a 91,1) y de dos tareas en SWE-bench Verified y DeepSWE.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de compresion agresiva aplicada a un modelo frontera, con metricas declaradas de fidelidad (88,4 % de coincidencia en la siguiente palabra respecto al original) y de comportamiento agentico (llamadas a herramientas correctas, tareas de codigo resueltas). Por otro, es un caso claro de publicacion restringida: los pesos no estan disponibles en Hugging Face y solo se entregan bajo peticion, lo que condiciona por completo su evaluacion y su uso en produccion.

No se dispone de informacion publica sobre la arquitectura interna, el numero de parametros, la longitud de contexto ni los idiomas soportados del modelo base en la informacion proporcionada; todos esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de moonshotai/Kimi-K3.1-Pro) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato propietario TWX2.5); no se documentan otros |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, con enlace a la licencia del modelo base) |
| Formato de pesos | no disponible; los pesos no se publican en el repositorio (entrega bajo peticion) |
| Tamano en disco | 1.008,3 GB |
| Modelo base | moonshotai/Kimi-K3.1-Pro |
| Metodo de compresion | TWX2.5 (Tileward) |
| VRAM por tarjeta en la configuracion de referencia | 128,1 GiB (frente a 192,5 GiB del original) |
| Capacidad de cache KV (90 % por tarjeta) | 6.086.715 tokens (frente a 2.135.421 del original) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura del modelo base Kimi K3.1 Pro (tipo de transformer, si emplea mezcla de expertos, atencion lineal u otras innovaciones), ni los datos de entrenamiento, numero de tokens, composicion del corpus o si hubo RLHF/DPO. Tileward tampoco detalla el funcionamiento interno de TWX2.5 mas alla de describirlo como una compresion a 4 bits que reduce el peso en disco un 35 % y que, segun sus mediciones, mantiene el rendimiento dentro de un punto en MMLU.

Lo que si documenta el autor es el efecto de la compresion sobre el despliegue: el checkpoint cargado por tarjeta pasa de 192,5 GiB a 128,1 GiB en una configuracion de ocho tarjetas, y la cache KV al 90 % de ocupacion por tarjeta crece de 2.135.421 a 6.086.715 tokens. Es decir, la compresion no solo reduce el espacio en disco, sino que libera memoria por tarjeta y multiplica por aproximadamente 2,85 la capacidad de contexto en cache en la misma configuracion de hardware.

## Capacidades

- Generacion de texto y respuesta a preguntas de conocimiento general, con un 90,5 de accuracy en MMLU (5-shot) declarado por el autor.
- Razonamiento agentico de codigo: resuelve 381 de 500 incidencias en SWE-bench Verified, 87 de 113 tareas en DeepSWE y 62 de 78 tareas en Terminal-Bench 2.0.
- Uso de herramientas (tool calling): 600 de 600 llamadas correctas con esfuerzo de pensamiento bajo y 598 de 600 con esfuerzo alto, segun las mediciones del autor.
- Redaccion de documentos con baja tasa de hechos inventados: 0,1 % frente al 0,0 % del original.
- Dos niveles de esfuerzo de razonamiento (low / high thinking effort), segun la tabla de evaluacion del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo en produccion: el modelo puede integrarse en pipelines que resuelven incidencias sobre repositorios reales, dado su rendimiento declarado en SWE-bench Verified (381/500) y DeepSWE (87/113), con una perdida de solo dos tareas respecto al original.
- Automatizacion de terminal y operaciones: Terminal-Bench 2.0 mide tareas ejecutadas en entornos de terminal; con 62/78 tareas resueltas, el modelo es adecuado para agentes que ejecutan comandos, depuran entornos y completan flujos de administracion de sistemas.
- Orquestacion de herramientas en asistentes: con 600/600 y 598/600 llamadas correctas en los dos niveles de esfuerzo, encaja en asistentes que dependen de function calling fiable (APIs, bases de datos, servicios internos).
- Generacion documental con control de alucinacion: la tasa declarada de 0,1 % de hechos inventados al redactar documentos lo hace apto para borradores tecnicos, informes y resumenes donde la fidelidad factual es critica.
- Despliegue en infraestructura de ocho GPU con contexto largo: al liberar 64,4 GiB por tarjeta frente al original y multiplicar por 2,85 la cache KV, permite sesiones de agente con historiales muy largos en el mismo hardware.
- Evaluacion comparativa de tecnicas de compresion: util como referencia para equipos de investigacion que midan el impacto de la cuantizacion a 4 bits sobre modelos frontera, gracias a las metricas de fidelidad publicadas (88,4 % de coincidencia en la siguiente palabra).

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Kimi K3.1 Pro | TWX2.5 |
|---|---|---|
| MMLU (5-shot), accuracy | 91,1 | 90,5 |
| SWE-bench Verified, resueltas de 500 | 383 | 381 |
| DeepSWE, resueltas de 113 | 89 | 87 |
| Terminal-Bench 2.0, resueltas de 78 | 60 | 62 |
| Llamadas a herramientas correctas, esfuerzo bajo (de 600) | 600 | 600 |
| Llamadas a herramientas correctas, esfuerzo alto (de 600) | 600 | 598 |
| Hechos inventados en redaccion documental (menor es mejor) | 0,0 % | 0,1 % |
| Coincidencia con la siguiente palabra del original | – | 88,4 % |
| Tamano en disco | 1.561,3 GB | 1.008,3 GB |
| Cargado por tarjeta | 192,5 GiB | 128,1 GiB |
| Tokens en cache KV al 90 % por tarjeta | 2.135.421 | 6.086.715 |

El autor indica que las evaluaciones de MMLU se realizaron en una sesion sobre ocho tarjetas y las de codigo en una segunda sesion, con una sola ejecucion por prueba. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MATH, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 1.008,3 GB y, en la configuracion de referencia del autor, carga 128,1 GiB por tarjeta en un sistema de ocho GPU; el total agregado ronda 1 TB de memoria.
- GPU recomendadas: la configuracion medida emplea ocho tarjetas con al menos 128,1 GiB libres cada una para los pesos, lo que apunta a aceleradores de clase H100/H200 o A100 de 80 GB en configuracion multi-nodo; no se especifica el modelo exacto de GPU en la informacion disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el checkpoint completo exige agregacion de memoria de aproximadamente 1 TB.
- Opciones de despliegue: no se documentan en la informacion disponible (ni vLLM, ni llama.cpp, ni Ollama, ni TGI); el formato de pesos tampoco se especifica.
- Latencia y throughput: no disponibles. Como referencia de capacidad, la cache KV admite 6.086.715 tokens al 90 % de ocupacion por tarjeta en la configuracion de ocho tarjetas.

## Comparativa con modelos similares

| Modelo | Tamano en disco | MMLU (5-shot) | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (Moonshot AI) | 1.561,3 GB | 91,1 | 383/500 | Kimi K3.1 Pro License | Pesos publicados en Hugging Face |
| Tileward Kimi K3.1 Pro TWX3 | 1.178,4 GB | 90,5 | no disponible | Kimi K3.1 Pro License | Bajo peticion |
| Tileward Kimi K3.1 Pro TWX2.5 | 1.008,3 GB | 90,5 | 381/500 | Kimi K3.1 Pro License | Bajo peticion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no estan publicados en Hugging Face: el acceso es solo bajo peticion mediante reserva de una llamada con un ingeniero, lo que impide su evaluacion independiente y su uso directo en produccion sin acuerdo previo.
- Las metricas de MMLU, SWE-bench, DeepSWE, Terminal-Bench y fidelidad proceden del propio autor y no estan verificadas de forma independiente (el campo `verified` del model-index es `false`).
- Las evaluaciones de codigo se basan en una sola ejecucion por prueba, sin intervalos de confianza ni repeticiones, por lo que la varianza no esta cuantificada.
- La licencia es `other` con nombre `kimi-k3.1-pro` y enlace a la licencia del modelo base; las condiciones exactas de uso comercial dependen de ese documento y no se detallan en la informacion disponible.
- La tasa de hechos inventados sube del 0,0 % al 0,1 % y las llamadas a herramientas con esfuerzo alto caen de 600 a 598, lo que indica una degradacion pequena pero medible frente al original.
- La coincidencia del 88,4 % en la siguiente palabra implica que aproximadamente una de cada nueve continuaciones difiere del modelo original, con posible impacto en tareas de generacion abierta.
- No hay informacion sobre sesgos, idiomas soportados, limites de contexto efectivos ni comportamiento fuera de los benchmarks medidos.
- El despliegue exige infraestructura multi-GPU de aproximadamente 1 TB de memoria agregada, lo que restringe su uso a entornos con hardware de datacenter.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX2.5
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Variante TWX3: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX3
- Articulo de investigacion: https://tileward.com/research/a-smaller-kimi-k3-1-pro/
- Metodologia de evaluacion: https://tileward.com/evals/#compressed-model-k31-pro
- Investigacion de Tileward: https://tileward.com/research/
- Sitio del autor: https://tileward.com
- Reserva para acceso a pesos: https://calendar.app.google/hg2DzFTxKJgwFWm19
