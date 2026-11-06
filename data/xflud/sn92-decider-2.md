# xflud/sn92-decider-2

## Resumen

sn92-decider-2 es un ajuste fino (finetune) del modelo xflud/sn92-decider-1, publicado por el usuario xflud en Hugging Face. Según la model card, el modelo se ha entrenado para la pista "generalist" de REAX, el subnet 92 de la red Bittensor, y toma como referencia adicional el modelo baselabs/mammoth-1. Se distribuye bajo licencia MIT y en formato safetensors, con un total de 26.085.330.160 parámetros (aproximadamente 26.000 millones), lo que lo situa en la categoria de modelos de gran tamano.

La informacion publica disponible es muy limitada: la model card es practicamente un stub que solo indica la relacion de finetune con el modelo base y la licencia. No se detallan la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de evaluacion. El tag `qwen3_5` sugiere que la familia base podria estar relacionada con la arquitectura Qwen 3.5, pero este dato no se confirma en la documentacion proporcionada.

El interes actual del modelo radica en su vinculacion con el ecosistema Bittensor (subnet 92, REAX), un entorno de incentivos descentralizados para modelos de IA, y en su condicion de finetune especializado para una tarea concreta (pista generalist). Para un desarrollador o investigador, la ficha sirve como punto de partida, pero la ausencia de especificaciones tecnicas y benchmarks obliga a tratar cualquier uso en produccion con cautela y a validar el comportamiento de forma empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere familia Qwen 3.5, sin confirmar) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Los metadatos de Hugging Face incluyen el tag `qwen3_5`, lo que apunta a una posible base de la familia Qwen 3.5, y el modelo se presenta como un finetune de xflud/sn92-decider-1 (revision db2e622a), con baselabs/mammoth-1 (revision 61cec44c) como referencia adicional en el proceso. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion de entrenamiento disponible es la finalidad declarada: la pista "generalist" del subnet 92 (REAX) de Bittensor. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no debe asumirse.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de 26.000 millones de parametros, aunque no se documenta de forma explicita.
- Razonamiento y tareas de "generalist": el modelo se presenta como finetune para la pista generalist de REAX, lo que sugiere un entrenamiento orientado a tareas generales dentro de ese entorno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion en el subnet 92 (REAX) de Bittensor: el modelo esta disenado explicitamente para la pista generalist de este subnet, por lo que su uso principal seria participar en las tareas y evaluaciones definidas por ese entorno descentralizado.
- Experimentacion con finetunes especializados: al ser un finetune de sn92-decider-1, sirve como punto de comparacion para estudiar el efecto del ajuste fino sobre el modelo base en tareas generalistas.
- Investigacion sobre modelos en ecosistemas descentralizados: util para analizar como se entrenan y despliegan modelos dentro de redes de incentivos como Bittensor, comparando su comportamiento con el del modelo base.
- Prototipado de asistentes conversacionales: con 26.000 millones de parametros, puede emplearse en pruebas de generacion de texto multi-turno, siempre que se valide empiricamente su calidad y su ventana de contexto real.
- Base para nuevos finetunes: al estar bajo licencia MIT y en safetensors, puede servir como punto de partida para ajustes posteriores en dominios concretos, sujeto a la validacion de su comportamiento.
- Despliegue en entornos de investigacion con GPU de gama alta: su tamano permite experimentar con tecnicas de cuantizacion y servir el modelo en infraestructura propia, aunque sin garantias documentadas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (26.000 millones de parametros), en FP16 se requeririan aproximadamente 52 GB de VRAM solo para los pesos, sin contar cache KV ni overhead; en cuantizacion de 8 bits, en torno a 26 GB; en 4 bits, en torno a 13-15 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponible. Por tamano, serian necesarias GPU con 80 GB (A100, H100) para FP16 sin cuantizar, o configuraciones multi-GPU.
- Cabe en consumer GPU: no confirmado. Con cuantizacion agresiva (4 bits) podria intentarse en GPUs de 24 GB (RTX 3090/4090), pero sin datos oficiales de soporte ni de calidad resultante.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta compatibilidad con ningun runtime concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xflud/sn92-decider-2 | 26.085.330.160 | no disponible | MIT | Hugging Face | Finetune para REAX (Bittensor sn92) |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva sn92-decider-2 |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Hugging Face | Referencia adicional citada en el entrenamiento |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion de dependencia entre ellos.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card no detalla arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo con rigor antes de usarlo.
- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset, no es posible estimar sesgos de genero, idioma o dominio.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones publicadas, el riesgo es desconocido y debe asumirse como presente en cualquier modelo generativo.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia es MIT, lo que en principio permite uso comercial, pero debe revisarse el archivo LICENSE y NOTICE del repositorio para confirmar condiciones y atribuciones.
- Caveat para produccion: la ausencia de benchmarks, de especificaciones de despliegue y de validacion externa desaconseja su uso en produccion sin una evaluacion empirica previa y sin verificar la compatibilidad con el runtime elegido.
- Dependencia de un ecosistema concreto: el modelo esta orientado a la pista generalist de REAX (Bittensor sn92), por lo que su comportamiento fuera de ese contexto no esta garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/xflud/sn92-decider-2
- Modelo base: https://huggingface.co/xflud/sn92-decider-1
- Modelo de referencia citado: https://huggingface.co/baselabs/mammoth-1
