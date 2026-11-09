# zedgamer/parcimonia-lfm3-vl-2b-GGUF

## Resumen

Parcimonia v3 LFM3-VL-2B GGUF es una cuantizacion experimental en formato GGUF del modelo LiquidAI/LFM3-VL-2B, publicada por el usuario zedgamer. Se trata de una variante de solo texto en la que se ha fusionado el adaptador LoRA Parcimonia v3 sobre 48 matrices del modelo de lenguaje base, manteniendo la revision `71d8e745d97c224984e0f20412f532a5ce9dfd3e` del modelo original. El resultado se distribuye como un unico fichero Q8_0 de 1.846.237.824 bytes, pensado para ejecutarse en llama.cpp o LM Studio.

El modelo no es un asistente de proposito general, sino un componente especializado dentro del proyecto Parcimonia: recibe un informe de asesor (advisor report), una ruta de interes y una pregunta, y propone explicaciones sobre motivos de informe relacionados con la frescura de las mediciones y la identidad de maquina o de lote de medicion. La validacion, la abstencion y la decision final sobre la ruta recaen siempre en un asesor determinista externo y en un guard, nunca en la salida del modelo.

Es relevante ahora por su caracter de ejemplo de cuantizacion de un adaptador LoRA sobre un modelo base pequeno (1.728.801.600 parametros reales en safetensors) y por su enfoque de uso restringido: el autor declara explicitamente que no se han establecido la calidad general, la preparacion para produccion, la latencia ni los ahorros. La licencia es la LFM Open License v1.0, que impone condiciones de redistribucion y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-VL-2B; esta release es solo texto, sin proyector de vision) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica incluida en el repo) |
| Idiomas soportados | fr, en |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF (fichero `parcimonia-v3-Q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LiquidAI/LFM3-VL-2B en la informacion proporcionada; esta release es una cuantizacion de solo texto y no incluye ni evalua el proyector de vision del modelo original. El adaptador Parcimonia v3 se fusiono sobre 48 matrices del modelo de lenguaje antes de la cuantizacion, partiendo de la revision `71d8e745d97c224984e0f20412f532a5ce9dfd3e`.

El adaptador v3 se entreno sobre texto sintetico para distinguir motivos de informe que implican frescura de mediciones e identidad de maquina o de lote de medicion. La conversion a GGUF se realizo con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp. El autor advierte que los resultados del adaptador BF16 original no pueden atribuirse automaticamente a esta cuantizacion Q8_0.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Explicacion de motivos de informe relacionados con frescura de mediciones e identidad de maquina o lote de medicion.
- Interpretacion de un advisor report junto con una ruta de interes y una pregunta del usuario.
- Modo de respuesta estructurada corta (se recomienda desactivar el modo thinking para respuestas breves).
- Integracion con el software del proyecto Parcimonia (asesor determinista y guard externos).
- No incluye capacidades de vision en esta release.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Diagnostico de frescura de mediciones: el modelo recibe un informe con marcas temporales y propone explicaciones sobre por que una medicion puede considerarse obsoleta, dejando la decision final al asesor determinista.
- Desambiguacion de identidad de lote: ante un informe con identidad de maquina o de lote ambigua, el modelo genera hipotesis explicativas que el guard externo valida antes de cualquier accion.
- Asistencia en el proyecto Parcimonia: se usa como capa de explicacion en lenguaje natural dentro del flujo del software, con la ruta y la abstencion controladas por componentes deterministas.
- Replay y pruebas en LM Studio: el autor documento una repeticion local en LM Studio que produjo dos respuestas guarded esperadas, util como prueba de humo de la integracion.
- Prototipado de asistentes de solo texto en frances e ingles sobre llama.cpp: al ser un GGUF Q8_0, se puede cargar en runtimes compatibles sin infraestructura adicional.
- Experimentacion con fusion de LoRA y cuantizacion: sirve como referencia tecnica de como se comporta un adaptador fusionado en 48 matrices tras pasar a Q8_0, con hashes y procedencia documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una repeticion local en LM Studio con dos respuestas guarded esperadas y senala que esta comprobacion no establece calidad general. Tampoco se han establecido latencia ni ahorros.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 1.846.237.824 bytes (aproximadamente 1,8 GB), por lo que se necesita al menos esa cantidad de memoria mas el overhead del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del fichero, es plausible en GPUs de consumo con 4 GB o mas de VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp y LM Studio (mencionados por el autor); otros runtimes compatibles con GGUF no se documentan.
- Latencia y throughput: no establecidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parcimonia v3 LFM3-VL-2B GGUF | 1.728.801.600 | no disponible | GGUF Q8_0 | LFM Open License v1.0 | Solo texto, adaptador LoRA fusionado, uso restringido a explicaciones |
| LiquidAI/LFM3-VL-2B (base) | no disponible | no disponible | no disponible | LFM Open License v1.0 | Modelo base multimodal original |
| Adaptador Parcimonia v3 (BF16) | no disponible | no disponible | no disponible | LFM Open License v1.0 | Adaptador fuente, publicado por separado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor declara que la calidad general, la preparacion para produccion, la latencia y los ahorros no estan establecidos.
- La unica evidencia es una repeticion local en LM Studio con dos respuestas guarded esperadas, insuficiente para inferir calidad.
- Los resultados del adaptador BF16 original no pueden atribuirse automaticamente a esta cuantizacion Q8_0.
- No incluye proyector de vision; es una release de solo texto pese a derivar de un modelo VL.
- Uso restringido: la salida del modelo no debe usarse para autorizar ejecucion; la ruta, la abstencion y la validacion dependen de un asesor determinista y un guard externos.
- Idiomas limitados a frances e ingles.
- Sin datos publicados sobre sesgos ni riesgo de alucinacion especifico; al ser un modelo pequeno y especializado, el riesgo de generalizacion fuera de su dominio es alto.
- La licencia LFM Open License v1.0 impone condiciones de redistribucion y uso comercial que deben revisarse antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zedgamer/parcimonia-lfm3-vl-2b-GGUF
- Adaptador fuente y evaluacion: https://huggingface.co/zedgamer/parcimonia-lfm3-vl-2b-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Proyecto Parcimonia: https://github.com/zedarvates/parcimonia
