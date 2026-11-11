# vipenl26/anlp-a3-mamba

## Resumen

`anlp-a3-mamba` es un modelo de secuencia decoder-only de tipo Mamba implementado desde cero en PyTorch por el autor `vipenl26` para la asignacion 3 (Parte A) de la asignatura ANLP Monsoon 2026. Con 3.964.416 parametros, 9 capas y una dimension de modelo de 256, se entrena como prefix LM sobre secuencias de la forma `[BOS] ciphertext [SEP] plaintext [EOS]`, calculando la perdida unicamente sobre el tramo de texto plano. El objetivo declarado es el descifrado de un cifrado por sustitucion posicional.

La relevancia del modelo es fundamentalmente pedagogica: demuestra como construir un bloque Mamba selectivo (SSM) sin depender de librerias como `mamba-ssm` o `fla`, y sirve como banco de pruebas para analizar el comportamiento de modelos de estado en tareas de modelado de secuencias. La model card incluye una nota tecnica honesta que acota sus capacidades: el cifrado liberado es un one-time pad por posicion en el que, tras eliminar los 18 simbolos de puntuacion nulos, cada simbolo de cifrado es estadisticamente independiente del caracter de texto plano que codifica.

Como consecuencia, el checkpoint no funciona como descifrador real, sino como un modelo de lenguaje a nivel de caracter con una senal exacta de longitud. Su interes practico es limitado fuera del ambito academico, pero resulta util como referencia reproducible de una implementacion Mamba minima y de un pipeline de evaluacion sobre tareas de cifrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (decoder-only, SSM selectivo) |
| Parametros totales | 3.964.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado a nivel de caracter) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga via `load_checkpoint` del paquete `part1.hf_utils`) |

## Arquitectura y entrenamiento

El modelo es un transformer alternativo basado en Mamba, un modelo de espacio de estados selectivo con recurrencia lineal en la longitud de secuencia. La configuracion concreta es `d_model = 256`, 9 capas y una longitud maxima de secuencia de 256 tokens. El autor indica que la implementacion es desde cero en PyTorch, sin usar `mamba-ssm` ni `fla`, lo que la convierte en una referencia util para estudiar los detalles internos del bloque (proyecciones de entrada, parametrizacion de `delta`, matrices A/B/C dependientes de la entrada y conexion residual).

El entrenamiento sigue un esquema de prefix LM: la secuencia de entrada es `[BOS] ciphertext [SEP] plaintext [EOS]` y la perdida se aplica solo al span de texto plano, de modo que el modelo aprende a condicionar la generacion del plaintext sobre el ciphertext precedente. La tasa de aprendizaje es 0.001 y la mejor precision de token en validacion alcanza 0.7196. El coste computacional declarado es de 2.115.764.224 FLOPs analiticos por secuencia de 256 tokens. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Modelado de lenguaje a nivel de caracter sobre secuencias de hasta 256 tokens.
- Condicionamiento por cifrado: procesa un ciphertext como prefijo y genera el plaintext correspondiente.
- Recuperacion exacta de la longitud del plaintext (senal de longitud codificada en el par cifrado/plano).
- Generacion autoregresiva condicionada (prefix LM) con atencion causal implicita en el SSM.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas ni modo thinking, vision o audio.
- No se ha documentado soporte de instrucciones conversacionales.

## Casos de uso

- Docencia de arquitecturas SSM: el modelo sirve como ejemplo reproducible de un bloque Mamba implementado desde cero, util para comparar con implementaciones de referencia en cursos de procesamiento de lenguaje natural.
- Analisis de tareas de cifrado: permite estudiar empiricamente por que un one-time pad por posicion no es aprendible mas alla de la longitud, sirviendo como caso negativo en experimentos de descifrado neuronal.
- Benchmark de modelos de caracter: con 3,96 M de parametros y contexto de 256 tokens, es un candidato ligero para comparar arquitecturas (transformer vs. Mamba) en tareas de modelado de caracteres.
- Reproduccion de experimentos academicos: el checkpoint y el codigo de carga (`part1.hf_utils.load_checkpoint`) permiten replicar los resultados de la asignacion ANLP Monsoon 2026.
- Pruebas de infraestructura de carga de modelos: util para validar pipelines de `snapshot_download` y carga en CUDA con modelos de muy bajo coste.
- Educacion sobre limitaciones de los benchmarks: la nota de la model card sobre la independencia estadistica entre cifrado y plano es un material didactico excelente para discutir la validez de las metricas de precision de token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la mejor precision de token en validacion: 0.7196.

| Metrica | Valor |
|---|---|
| Precision de token en validacion (mejor) | 0.7196 |
| FLOPs analiticos por secuencia de 256 tokens | 2.115.764.224 |
| Parametros totales | 3.964.416 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32), dado el tamano de 3,96 M de parametros; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeno para aprovechar GPUs de datacenter.
- Cabe en GPU consumer sin problema, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: el autor proporciona carga via `huggingface_hub.snapshot_download` y `part1.hf_utils.load_checkpoint`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput muy alto y latencia despreciable, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un checkpoint academico de 3,96 M de parametros sin benchmarks publicos que permitan una comparacion rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-a3-mamba | 3.964.416 | 256 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El cifrado liberado es un one-time pad por posicion: el simbolo de cifrado es estadisticamente independiente del caracter de texto plano, por lo que el modelo no puede descifrar realmente; solo recupera la longitud.
- La precision de token de 0.7196 debe interpretarse con cautela: gran parte de la senal proviene de la pista de longitud y de la distribucion de caracteres, no de una decodificacion real.
- Contexto muy limitado (256 tokens), insuficiente para la mayoria de aplicaciones practicas.
- Modelado a nivel de caracter, sin tokenizacion subword ni capacidades multilingues declaradas.
- No apto para produccion: es un checkpoint academico sin evaluacion externa, sin pipeline declarado y con 0 descargas.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset no descrito no puede descartarse la presencia de sesgos en los datos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- La carga depende del paquete `part1.hf_utils`, no incluido en el repo de Hugging Face, lo que puede dificultar la reproducibilidad fuera del entorno del curso.

## Enlaces

- Hugging Face: https://huggingface.co/vipenl26/anlp-a3-mamba
- Model card original: incluida en el repositorio de Hugging Face
- Paper de Mamba (referencia arquitectonica): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
