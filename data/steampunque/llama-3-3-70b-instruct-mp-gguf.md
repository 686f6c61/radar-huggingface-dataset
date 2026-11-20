# steampunque/Llama-3.3-70B-Instruct-MP-GGUF

## Resumen

`steampunque/Llama-3.3-70B-Instruct-MP-GGUF` es una cuantizacion GGUF de precision mixta por capas del modelo `meta-llama/Llama-3.3-70B-Instruct` de Meta. No es un modelo nuevo: es un artefacto de empaquetado optimizado para inferencia local, publicado por el usuario steampunque, que aplica niveles de cuantizacion distintos a cada tensor del transformer con el objetivo de maximizar la calidad retenida por bit y reducir el tamano del fichero. El modelo base es un transformer denso de 70.553.706.560 parametros (70,5B), con licencia Llama 3.3.

La innovacion del repositorio es la definicion de cuantizaciones "E" (extended layer definition) que asignan Q2_K, Q3_K, Q4_K, Q5_K y Q6_K de forma selectiva por capa y por tensor. El autor argumenta que los tensores FFN_G y FFN_U, al ser productos escalares densos largos situados antes de FFN_D, toleran mejor el ruido de cuantizacion porque este se promedia, lo que permite rebajarlos a Q3_K o incluso Q2_K sin degradacion severa. El resultado es un cuant de aproximadamente 4,21 BPW (bits por peso) para el variante principal Q4_E_H, y un segundo cuant mas agresivo Q3_E_H pensado para caber integramente en tres RTX 4070 mediante RPC.

El interes practico es la posibilidad de ejecutar un modelo de 70B en hardware de consumo o en configuraciones multi-GPU modestas, manteniendo un equilibrio razonable entre calidad y velocidad de generacion. El repositorio incluye ademas cuantizaciones legacy (Q3_S_H y otras basadas en Q3_K) que el autor mantiene por volumen de descargas. La fecha de actualizacion del repositorio (noviembre de 2026) corresponde a la release de la definicion E.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.3 70B Instruct) |
| Parametros totales | 70.553.706.560 (70,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF con precision mixta por capa: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F16, F32; variantes Q4_E_H (~4,21 BPW), Q3_E_H y legacy Q3_S_H |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (safetensors solo para el modelo base original) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.3 70B Instruct, un transformer denso autorregresivo de Meta. El repositorio no aporta informacion sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, etapas de RLHF/DPO), por lo que esos datos deben consultarse en la model card oficial de `meta-llama/Llama-3.3-70B-Instruct`. Lo que si documenta este repositorio es el proceso de cuantizacion.

La cuantizacion se define mediante una tabla `LAYER_TYPES` que especifica, para cada una de las 80 capas (indices 0-79), un nivel de cuantizacion por tensor: atencion (Q, K, V, O), FFN (F, G, U, D) y SSM. En el variante Q4_E_H, las capas 0-1 usan Q5_K, las capas 2-3 Q4_K_5544, las capas 4-7 Q4_K_5534, las capas 8-15 Q4_K_5434, el bloque central 16-63 Q4_K_4434 (con Q3_K en FFN_G/FFN_U), las capas 64-69 Q4_K_5434, las capas 70-76 Q4_K_5544/5545 y las capas finales 77-79 escalan a Q5_K y Q6_K. Los tensores de embedding de tokens y de salida se fuerzan a Q6_K mediante flags. Los tensores QKV se fusionan durante la conversion para acelerar el procesamiento, y el nivel de V controla el del bloque QKV completo.

El variante Q3_E_H rebaja los tensores FFN_G/FFN_U internos a Q2_K y FFN_D a Q3_K, con embedding de tokens en Q5_K y salida en Q6_K, para reducir el footprint lo suficiente como para hacer offload completo en tres RTX 4070 mediante RPC. El autor advierte explicitamente que este variante no se recomienda para uso general por exceso de perdida de entropia, aunque puede servir para escenarios de nicho donde prima la velocidad de generacion. Los cuants legacy Q3_S_H se basan en Q3_K_S en las capas internas con capas iniciales en Q4_K_M y Q3_K_L/M.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y conocimiento general (el autor menciona haber ajustado las capas "for good performance across a small set of reasoning and knowledge prompts").
- Generacion de codigo y matematicas, segun las capacidades del Llama 3.3 70B Instruct original.
- Tool calling y function calling: no confirmado explicitamente en la informacion proporcionada para esta cuantizacion; depende de las capacidades del modelo base y del runtime GGUF empleado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo base es text-only.

## Casos de uso

- Despliegue local de un 70B en estaciones de trabajo multi-GPU: el variante Q4_E_H permite servir un modelo de 70,5B en configuraciones con varias GPU consumer, manteniendo calidad cercana a cuantizaciones Q4_K estandar pero con menor tamano de fichero.
- Inferencia en tres RTX 4070 con RPC: el variante Q3_E_H esta disenado especificamente para hacer offload completo en tres RTX 4070 mediante RPC, habilitando un 70B en hardware de gama media-alta de consumo.
- Sustitucion directa de Llama 3.3 70B Instruct en pipelines existentes basados en llama.cpp: al ser GGUF compatible con el ecosistema llama.cpp, se puede intercambiar por otros cuants del mismo modelo sin cambiar el codigo de integracion.
- Prototipado de asistentes conversacionales con contexto largo: util para desarrolladores que necesitan validar comportamiento de un 70B Instruct antes de comprometerse con infraestructura de GPU de datacenter.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta de forma detallada las tablas por capa, lo que lo convierte en material de referencia para investigar el impacto de la precision mixta en la calidad.
- Generacion de codigo y tareas de razonamiento en entornos con restricciones de memoria: el ajuste por capas busca preservar calidad en prompts de razonamiento y conocimiento, segun indica el autor.
- Experimentacion con decodificacion en entornos con ancho de banda de memoria limitado: el autor justifica el objetivo de tamano eficiente precisamente para reducir el memory bandwidth requerido por un modelo denso de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las capas se ajustaron con un conjunto pequeno de prompts de razonamiento y conocimiento, pero no aporta metricas numericas (MMLU, HumanEval, GSM8K u otras) ni comparaciones cuantitativas frente a cuantizaciones estandar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un 70B denso en ~4,21 BPW ocupa del orden de 37 GB de pesos, a lo que hay que sumar KV cache y overhead del runtime; el variante Q3_E_H, con Q2_K/Q3_K en capas internas, reduce esa cifra de forma significativa. Estas estimaciones son calculadas a partir del BPW declarado, no publicadas por el autor.
- GPU recomendadas: el autor menciona explicitamente tres RTX 4070 con RPC para el variante Q3_E_H. Para el Q4_E_H no se especifica una configuracion concreta; por tamano, encaja en configuraciones multi-GPU consumer o en una GPU de datacenter con 48 GB o mas.
- Cabe en consumer GPU: si, en configuraciones multi-GPU (tres RTX 4070 para Q3_E_H). No cabe en una unica GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves del servidor de llama.cpp. Otros runtimes GGUF (Ollama, LM Studio) son tecnicamente posibles pero no se confirman en la informacion proporcionada. vLLM y TGI no soportan GGUF de forma nativa como formato principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| steampunque/Llama-3.3-70B-Instruct-MP-GGUF (Q4_E_H) | 70,5B | no disponible | GGUF mixta ~4,21 BPW | llama3.3 | Cuantizacion por capas optimizada para tamano/calidad |
| steampunque/Llama-3.3-70B-Instruct-MP-GGUF (Q3_E_H) | 70,5B | no disponible | GGUF mixta Q2/Q3/Q4 | llama3.3 | Pensado para 3x RTX 4070 via RPC; el autor no lo recomienda para uso general |
| meta-llama/Llama-3.3-70B-Instruct (original) | 70,5B | no disponible en la informacion | safetensors BF16 | llama3.3 | Modelo base de referencia, requiere ~141 GB en BF16 |
| Cuantizaciones GGUF estandar Q4_K_M del mismo base | 70,5B | no disponible | GGUF Q4_K_M uniforme | llama3.3 | Alternativa convencional; el autor sostiene que su esquema por capas mejora la relacion tamano/calidad, sin benchmarks publicados que lo confirmen |

## Limitaciones y advertencias

- El modelo base puede presentar sesgos y alucinaciones; la cuantizacion no corrige estos comportamientos y puede amplificarlos por perdida de precision.
- El variante Q3_E_H no se recomienda para uso general segun el propio autor, por exceso de perdida de entropia derivada del uso intensivo de Q2_K y Q3_K en capas internas.
- No hay benchmarks publicados que cuantifiquen la degradacion respecto al modelo original ni frente a cuantizaciones GGUF estandar; la afirmacion de calidad se basa en evaluacion cualitativa con un conjunto pequeno de prompts.
- La licencia llama3.3 impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse la licencia Llama 3.3 completa antes de cualquier despliegue en produccion.
- El repositorio no documenta los idiomas soportados ni la longitud de contexto efectiva de estos cuants; deben asumirse las del modelo base, verificandolas en su model card.
- El rendimiento real depende del runtime GGUF y de la configuracion de offload; el escenario de tres RTX 4070 con RPC implica latencias y complejidad operativa superiores a una unica GPU de datacenter.
- El repositorio tiene 0 likes y unas 1260 descargas, con un unico mantenedor; no es un artefacto oficial de Meta ni cuenta con validacion de la comunidad comparable a las cuantizaciones de referencia (p. ej. las de bartowski o TheBloke).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/steampunque/Llama-3.3-70B-Instruct-MP-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Licencia Llama 3.3: https://llama.meta.com/llama3_3/license/
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
