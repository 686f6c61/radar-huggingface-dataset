# ZihanLiummyycc/FSG-RL-Stage2-SFT

## Resumen

FSG-RL-Stage2-SFT es un adaptador LoRA de tipo PEFT publicado por el usuario ZihanLiummyycc sobre el modelo base Qwen/Qwen3.5-9B-Base. No es un modelo completo: se distribuye como adaptador (0,4 GB de repositorio) y requiere descargar por separado los pesos del modelo base. Su proposito declarado es la "resolucion ejecutable" de nodos de grafos de funciones: dado un nodo de un grafo de funciones publico, la politica entrenada debe producir una implementacion en Python etiquetada y ejecutable.

El adaptador corresponde a la etapa 2 de un pipeline denominado FSG-RL, precedido por una etapa 1 (no liberada) de SFT orientada a construccion de grafos. El autor lo presenta como el checkpoint de la etapa 2 utilizado para evaluacion, y publicado en formato adapter-only, sin estado del optimizador, por lo que solo sirve para inferencia o para continuar el entrenamiento desde cero de optimizador.

Su relevancia actual es acotada pero especifica: es un ejemplo de adaptador pequeno para razonamiento matematico y sintesis de codigo verificable, con metricas declaradas por el propio autor (43,25 % de exactitud de respuesta final y 32,25 % de exito completo estricto sobre un conjunto de evaluacion propio de 400 items). La model card no declara licencia, idiomas soportados ni resultados en benchmarks estandar, y el modelo base referenciado no ha podido verificarse a traves de la busqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 9B en el modelo base segun su identificador (Qwen/Qwen3.5-9B-Base); numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser un adaptador, la cuantizacion aplicable depende del modelo base y del runtime (por ejemplo, 4 bits u 8 bits al cargar el base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |
| Tamano del repositorio | 0,4 GB |
| Libreria declarada | peft |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Etapa del pipeline | Etapa 2 (SFT de resolucion ejecutable); la etapa 1 (SFT de construccion de grafos) no forma parte de la release |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un adaptador LoRA entrenado con PEFT sobre Qwen/Qwen3.5-9B-Base. El entrenamiento se describe como una SFT de etapa 2, posterior a una SFT de etapa 1 centrada en construccion de grafos ("graph-construction SFT"). El objetivo de la etapa 2 es que la politica genere implementaciones en Python etiquetadas para nodos de grafos de funciones publicos, es decir, salidas ejecutables y no solo texto descriptivo. El repositorio del proyecto (FSG-RL) contiene el codigo, el esquema de datos y la configuracion historica.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni innovaciones de atencion o decodificacion. El nombre "FSG-RL" sugiere un componente de aprendizaje por refuerzo, pero las siglas y el detalle del algoritmo no se desarrollan en la model card ni en los resultados de busqueda, por lo que no se pueden afirmar. Tampoco se detalla si el adaptador modula todas las proyecciones o solo un subconjunto, ni el rango y alpha de LoRA.

## Capacidades

- Generacion de implementaciones en Python para nodos de grafos de funciones, con marcado o etiquetado ("tagged") de la solucion, segun la descripcion del autor.
- Razonamiento matematico orientado a la resolucion de problemas con salida ejecutable, segun la etiqueta mathematical-reasoning del repositorio.
- Resolucion condicionada por grafo: la entrada no es solo un enunciado, sino un nodo dentro de una estructura de grafo de funciones.
- Capacidades heredadas del modelo base: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el pipeline FSG-RL sugiere flujo por etapas, pero no se documenta en la model card.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking": la evaluacion local se realizo con el pensamiento desactivado, lo que implica que existe un modo de pensamiento en el modelo base, pero su comportamiento en este adaptador no se documenta.
- Vision o audio: no disponible.

## Casos de uso

- Sintesis de funciones a partir de grafos de dependencias: dado un nodo con sus predecesores y sucesores en el grafo, el adaptador genera la implementacion Python del nodo. Es adecuado porque esta entrenado especificamente con condicionamiento de grafo y produce salida ejecutable.
- Generacion de datos sinteticos para entrenar modelos de codigo: se puede ejecutar el adaptador sobre nodos de un grafo publico para producir pares (nodo, implementacion) que alimenten un corpus de SFT o de RL. El formato etiquetado facilita el filtrado automatico de ejemplos.
- Investigacion en RL para razonamiento verificable: el checkpoint sirve como politica inicial o de referencia en experimentos de RL con recompensa basada en ejecucion, ya que el autor lo publica explicitamente como checkpoint de evaluacion de su pipeline.
- Evaluacion comparativa de adaptadores LoRA: al ser un adaptador de 0,4 GB sobre un base de 9B, permite medir el efecto de un ajuste de dominio concreto con un coste de almacenamiento minimo y conmutacion rapida entre adaptadores en un mismo servidor.
- Prestacion de servicio de autocompletado estructural en IDE o herramientas de analisis estatico: el modelo podria proponer cuerpos de funcion a partir de la posicion del nodo en el grafo de llamadas, aunque la exactitud declarada (43,25 % de respuesta final correcta) obliga a validacion con tests antes de aceptar cualquier sugerencia.
- Docencia y evaluacion de metodos de sintesis de programas: el conjunto de evaluacion de 400 items condicionados por grafo y las metricas declaradas permiten reproducir un protocolo de comparacion (decodificacion greedy, pensamiento desactivado, limite de 2048 tokens nuevos).
- Reparacion dirigida de implementaciones: dado un nodo que falla en tiempo de ejecucion, usar el adaptador para regenerar el cuerpo de la funcion a partir del contexto del grafo, con verificacion posterior mediante la bateria de tests del proyecto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre un conjunto de evaluacion propio:

| Evaluacion | Metrica | Resultado | Protocolo |
|---|---|---|---|
| Conjunto custom de 400 items condicionado por grafo | Exactitud de respuesta final | 43,25 % | Decodificacion greedy, pensamiento desactivado, 2048 tokens nuevos |
| Conjunto custom de 400 items condicionado por grafo | Exito completo estricto | 32,25 % | Decodificacion greedy, pensamiento desactivado, 2048 tokens nuevos |

El autor advierte expresamente que no son puntuaciones oficiales sobre los datasets de origen y que la exportacion publica del dataset excluye campos de puntuacion privados. No hay resultados disponibles de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion proporcionada.

## Requisitos de hardware

- Almacenamiento: 0,4 GB para el adaptador, mas el espacio de los pesos del modelo base de 9B (decenas de GB en funcion del formato). Los pesos del base deben obtenerse por separado.
- VRAM para inferencia en precision completa o media: aproximadamente 18-20 GB solo para los pesos de un modelo de 9B en FP16/BF16, mas la cache KV, cuyo tamano depende de la longitud de contexto (no declarada). Estimacion orientativa, no confirmada por el autor.
- VRAM en cuantizacion de 8 bits: del orden de 10-12 GB para los pesos, mas cache KV.
- VRAM en cuantizacion de 4 bits: del orden de 6-7 GB para los pesos, mas cache KV.
- GPU consumer: con 16-24 GB de VRAM (por ejemplo, RTX 4080/4090 o RTX 4060 Ti de 16 GB) seria viable en cuantizacion de 4 u 8 bits segun la estimacion anterior; en FP16 un modelo de 9B es ajustado incluso en 24 GB si el contexto es largo. No hay confirmacion por parte del autor.
- GPU de datacenter: A100, H100 o L40S son adecuadas para servir el base con el adaptador en BF16 y admitir lotes mayores.
- Opciones de despliegue: PEFT junto con Transformers (via declarada en la model card); vLLM con soporte de adaptadores LoRA para servir varios adaptadores sobre un mismo base; TGI con adaptadores. El uso con llama.cpp u Ollama requeriria convertir y fusionar el adaptador en el modelo base, algo no documentado en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo documenta el limite de 2048 tokens nuevos por generacion en la evaluacion local.

## Comparativa con modelos similares

No se han identificado en la busqueda web modelos comparables (la busqueda devolvio exclusivamente resultados no relacionados con el ambito del modelo). Comparativa limitada a lo documentado:

| Modelo | Parametros | Contexto | Licencia | Formato | Resultado disponible |
|---|---|---|---|---|---|
| FSG-RL-Stage2-SFT (este adaptador) | Adaptador sobre base de 9B | No disponible | No disponible | safetensors (LoRA/PEFT) | 43,25 % de respuesta final y 32,25 % de exito estricto en un conjunto propio de 400 items |
| Qwen/Qwen3.5-9B-Base | 9B segun identificador | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Otros adaptadores LoRA de razonamiento matematico | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de integrarlo en produccion.
- Idiomas no declarados: se desconoce el comportamiento fuera del idioma o idiomas de entrenamiento.
- Modelo base no verificado: no se ha podido confirmar la existencia publica ni las caracteristicas de Qwen/Qwen3.5-9B-Base a partir de la busqueda realizada; si el base no esta disponible, el adaptador es inutilizable.
- Dependencia de versiones: la model card indica que se requiere cargarlo como adaptador PEFT con versiones compatibles de Transformers y PEFT; incompatibilidades de version pueden impedir la carga.
- Sensibilidad al protocolo de evaluacion: las metricas declaradas corresponden a decodificacion greedy, pensamiento desactivado y un limite de 2048 tokens nuevos. Cambiar cualquiera de esas condiciones invalida la comparacion.
- Exactitud moderada: con un 43,25 % de respuesta final correcta y un 32,25 % de exito completo estricto, la mayoria de las generaciones no son plenamente correctas. Cualquier uso en produccion exige verificacion por ejecucion de tests.
- Riesgo de alucinacion y de codigo no ejecutable: al generar Python, el modelo puede producir llamadas a funciones inexistentes, APIs inventadas o dependencias no declaradas.
- Sobreajuste al dominio: el entrenamiento esta orientado a nodos de grafos de funciones, por lo que el rendimiento fuera de ese formato de entrada es incierto.
- Sesgos: no hay informacion disponible sobre la composicion del dataset ni sobre sesgos conocidos.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes, y no hay puntuaciones oficiales sobre datasets de origen. La exportacion publica del dataset excluye los campos de puntuacion privados, lo que limita la reproduccion independiente.
- Estado del optimizador no incluido: el adaptador sirve para inferencia; para reanudar un entrenamiento habria que reiniciar el estado del optimizador.
- Etapa 1 no liberada: la SFT de construccion de grafos previa no forma parte de la release, por lo que el pipeline completo no es reproducible tal cual.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ZihanLiummyycc/FSG-RL-Stage2-SFT
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio del proyecto (codigo, esquema de datos y configuracion): https://github.com/ZihanLiummyycc/FSG-RL
- Paper, blog o demo: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: no se encontro ningun recurso relacionado con el modelo; los resultados devueltos no eran relevantes.
