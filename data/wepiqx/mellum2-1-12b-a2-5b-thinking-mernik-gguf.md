# wepiqx/Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF es un conjunto de cuantizaciones GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicadas por el usuario wepiqx bajo el metodo propietario MERNIK ("measure-first allocation" con utilidad `smse`). El modelo base es un transformer de tipo Mixture of Experts (MoE) de 12.149.923.072 parametros totales (12B) con 2,5B parametros activos, 28 capas y 64 expertos de los cuales 8 se activan por token. Esta orientado a generacion de codigo y razonamiento, con un modo "Thinking" explicito.

El interes de esta publicacion no reside en el modelo base, sino en el proceso de cuantizacion: el autor documenta de forma inusualmente rigurosa sus resultados con protocolo reproducible (llama-server, temperatura 1.0, top_p 0.95, top_k 20, max_tokens 2048, semilla fija 7 para perplejidad sobre wikitext-2-raw) y con pruebas estadisticas de duelos (3/3 columnas: HumanEval, HumanEval+ y completaciones vacias). La build MERNIK-10000-SMSE reporta 81,71% en HumanEval (134/164) frente al 72,56% (119/164) del Q6_K de referencia del proveedor, con un peso de 10,16 GB frente a 10,88 GB.

Las cuantizaciones se distribuyen en licencia Apache 2.0, en formato GGUF para llama.cpp, con tamanos que van de 7,01 GB a 10,16 GB. El autor declara que todas las pruebas se ejecutaron en una GTX 1070 de 8 GB con offload parcial (`-ngl 20-28`), lo que da una idea clara del objetivo: hardware de consumo, no centros de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 28 capas, 64 expertos con 8 activos por token |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2,5B |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de evaluacion usa `-c 8192`) |
| Tipos de cuantizacion | GGUF cuantizado con metodo MERNIK: builds 6500, 7500 y 10000 (tamanos 7,01 GB, 7,44 GB y 10,16 GB); routers MoE (`ffn_gate_inp`) fijados en F32 en las 28 capas |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/GGUF BF16 segun el comando de reproduccion |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 28 capas, 64 expertos y 8 expertos activos por token, lo que resulta en 2,5B parametros activos sobre 12B totales. La model card del cuantizador no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF/DPO; esa informacion corresponderia al modelo base de JetBrains y no esta incluida en la informacion proporcionada. El sufijo "Thinking" indica un modo de razonamiento explicito, aunque los detalles de su implementacion no se documentan en esta ficha.

La innovacion tecnica documentada es el propio metodo de cuantizacion MERNIK: una asignacion de bits "measure-first" guiada por la utilidad `smse` sobre la imatrix del proveedor, con la regla de mantener los routers MoE (`ffn_gate_inp`) fuera del presupuesto de cuantizacion y en F32 en las 28 capas (verificado 28/28 F32 en todos los ficheros). El autor reporta que el suelo de la build Q4 se situa en 7428 MiB y que una build de 5500 fue imposible (suelo de 5688 MiB incluso permitiendo Q3), lo que fija 7500 como la build minima viable sin descender por debajo de Q4.

## Capacidades

- Generacion de codigo: el eje central del modelo, evaluado con HumanEval y HumanEval+ (evalplus). La build 10000-SMSE alcanza 81,71% en HumanEval y 79,27% en HumanEval+.
- Razonamiento en modo "Thinking": el nombre del modelo base indica un modo de razonamiento explicito, aunque no se detallan sus caracteristicas en la informacion disponible.
- Generacion de texto conversacional: la model card incluye la etiqueta `conversational` y el pipeline de llama-server con `--jinja` sugiere soporte de plantillas de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica integracion con APIs de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`en`) segun la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: la publicacion esta disenada explicitamente para reproducir y verificar el metodo MERNIK; el comando de reproduccion y el protocolo completo permiten a un investigador re-ejecutar las baterias y comparar builds. Es adecuada para laboratorios que estudian el impacto de la asignacion de bits en modelos MoE.
- Generacion de codigo en produccion con hardware de consumo: la build 10000-SMSE (10,16 GB) ofrece 81,71% en HumanEval y cabe en una GPU de 12-16 GB con offload parcial o total; se puede servir con llama.cpp o llama-server para autocompletado y generacion de funciones en editores e IDE.
- Asistencia de programacion en local para equipos con GTX 1070/RTX 3060: el autor demuestra que las builds de 7 GB funcionan con `-ngl 20-28` en una GTX 1070 de 8 GB, lo que habilita entornos de desarrollo sin GPU de centro de datos.
- Servicio de codegen de baja latencia: con especulacion por ngramas (`--spec-type ngram-map-k4v`) el autor reporta un salto de ~60 t/s a ~160 t/s en generacion de codigo, adecuado para autocompletado interactivo.
- Reproduccion de benchmarks de codigo: el protocolo con evalplus y tres columnas de veredicto (HumanEval, HumanEval+, completaciones vacias) sirve como plantilla para validar cuantizaciones propias antes de desplegarlas.
- Pipeline de CI/CD para generacion de tests: el modelo puede integrarse en flujos que generan casos de prueba o parches, siempre que se valide la salida; la tasa de completaciones vacias (24/164 en la build 10000) debe monitorizarse como senal de fallo silencioso.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo detras de APIs estilo OpenAI con llama-server y plantillas Jinja.

## Benchmarks y rendimiento

Resultados reportados por el autor con su protocolo (temperatura 1.0, top_p 0.95, top_k 20, max_tokens 2048, sin especulacion, n=164):

| Build | Peso | PPL (wiki) | HumanEval | HumanEval+ | Completaciones vacias |
|---|---:|---:|---:|---:|---:|
| MERNIK-10000-SMSE | 10,16 GB | 9,5558 | 81,71% (134/164) | 79,27% (130/164) | 24/164 |
| Stock Q6_K | 10,88 GB | 10,1562 | 72,56% (119/164) | 70,73% (116/164) | 39/164 |
| MERNIK-7500-SMSE | 7,44 GB | 10,5375 | 76,22% (125/164) | 74,39% (122/164) | 35/164 |
| Stock Q4_K_M | 8,07 GB | 10,1810 | 76,22% (125/164) | 75,00% (123/164) | 33/164 |
| MERNIK-6500-SMSE | 7,01 GB | 11,18 | 76,83% (126/164) | 75,61% (124/164) | 33/164 |
| MERNIK-6500-RECOVERY | 7,01 GB | 10,70 | 75,00% (123/164) | 73,17% (120/164) | 38/164 |

Duelos estadisticos reportados: 10000-SMSE frente a Q6_K resulta 3/3 significativo (HE 23/8, p=0,0107; HE+ 22/8, p=0,0161; vacias 5/20, p=0,0041). El resto de duelos (7500-SMSE vs Q6_K, 6500-SMSE vs 6500-RECOVERY) se declaran 0/3 ruido. El autor fija el suelo de ruido en ~13 tareas a n=164. No se han publicado resultados de benchmarks del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 7,01 GB (build 6500), 7,44 GB (build 7500), 10,16 GB (build 10000) para los pesos; el autor indica un suelo de 7428 MiB para la build Q4.
- GPU validadas por el autor: GTX 1070 de 8 GB con offload parcial (`-ngl 20-28`), en configuracion de consumo.
- GPU recomendadas por tamano: RTX 3060 12 GB, RTX 4070 12 GB o superiores para la build 10000 con offload total; A100/H100 no son necesarias para estas cuantizaciones.
- Cabe en GPU de consumo: si, la build 7500 y 6500 en GPUs de 8 GB con offload parcial; la build 10000 en GPUs de 12 GB o mas.
- Opciones de despliegue: llama.cpp / llama-server (protocolo documentado con `-ngl`, `-c 8192`, `--jinja`); Ollama y vLLM no se mencionan en la informacion disponible.
- Latencia y throughput: el autor reporta ~60 t/s en generacion de codigo sin especulacion y ~160 t/s con especulacion por ngramas (`--spec-type ngram-map-k4v --spec-ngram-map-k4v-size-m 12 --parallel 1`) en su GTX 1070. No se reportan latencias de primera respuesta.
- Nota de estabilidad: la build 10000 requirio relojes de fabrica, `--parallel 1` y `--cache-reuse 64` para evitar fallos de kernel CUDA y OOM de RAM en una VM de 63 GB con slots paralelos y contexto de 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | HumanEval | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| Mellum2.1-12B-A2.5B-Thinking MERNIK-10000-SMSE | 12B | 2,5B | no disponible | 81,71% | Apache 2.0 | GGUF |
| Mellum2.1-12B-A2.5B-Thinking Stock Q6_K | 12B | 2,5B | no disponible | 72,56% | Apache 2.0 | GGUF |
| Mellum2.1-12B-A2.5B-Thinking Stock Q4_K_M | 12B | 2,5B | no disponible | 76,22% | Apache 2.0 | GGUF |

No se dispone de datos de modelos de otros proveedores en la informacion proporcionada para una comparativa mas amplia; la comparacion disponible es interna entre builds del mismo modelo base.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`en`); no se garantiza calidad en castellano ni en otros idiomas.
- Completaciones vacias: entre 24 y 39 de 164 tareas quedan sin salida segun la build; en produccion esto se traduce en fallos silenciosos que requieren deteccion y reintento.
- Suelo de ruido: el autor advierte que diferencias inferiores a ~13 tareas a n=164 no se reproducen entre ejecuciones; no deben interpretarse como mejoras reales.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada, pero el modelo base no incluye una evaluacion de sesgos publicada en esta ficha.
- Alucinacion: no se reportan metricas de alucinacion; el uso en generacion de codigo en produccion requiere validacion de la salida (tests, compilacion).
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que la licencia del modelo base (JetBrains/Mellum2.1-12B-A2.5B-Thinking) sea compatible; la model card del cuantizador declara Apache 2.0.
- Contexto: la longitud de contexto del modelo base no se especifica; el protocolo de evaluacion usa 8192 tokens, lo que no debe confundirse con el maximo del modelo.
- Metodo propietario: MERNIK no es un formato estandar; la reproducibilidad depende del script `main.py` del autor y de la imatrix del proveedor.
- Hardware: las pruebas se hicieron en una GTX 1070; el rendimiento en otras GPUs puede variar y no se reportan mediciones en A100/H100.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wepiqx/Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Patrocinio del autor: https://github.com/sponsors/wepiqx
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
