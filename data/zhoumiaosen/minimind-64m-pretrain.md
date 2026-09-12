# zhoumiaosen/minimind-64m-pretrain

## Resumen

MiniMind 64M es un modelo de lenguaje denso de tipo decoder-only entrenado desde cero (sin pesos preentrenados de terceros) por el usuario zhoumiaosen, publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un checkpoint base de aproximadamente 63,91 millones de parametros, orientado exclusivamente a continuacion de texto y a servir como punto de partida para ajuste fino posterior; no ha pasado por instruction tuning, optimizacion de preferencias ni alineamiento. Su relevancia es fundamentalmente educativa y de investigacion: demuestra que es posible ejecutar un ciclo completo de preentrenamiento de un transformer pequeno en una unica GPU de consumo (una NVIDIA RTX 3060 de 12 GB) con unos 8 GB de RAM de sistema.

El modelo emplea la arquitectura `Qwen3ForCausalLM` como formato de exportacion compatible, pero la model card aclara explicitamente que no se utilizo ningun peso preentrenado de Qwen; unicamente se reutiliza la definicion arquitectonica para que el checkpoint sea cargable con la libreria `transformers` estandar. El tokenizador procede del proyecto MiniMind y tiene un vocabulario reducido de 6.400 tokens. La configuracion incluye 8 capas, tamano oculto de 768, 8 cabezas de atencion y 4 cabezas KV, con una dimension de feed-forward de 2.432.

El contexto de entrenamiento fue de 768 tokens, aunque la configuracion declara un limite posicional de 32.768 tokens que, segun el autor, no se verifico experimentalmente. El modelo se distribuye en safetensors con precision FP16 y esta etiquetado para text-generation-inference y endpoints compatibles, lo que facilita su despliegue en infraestructura de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (arquitectura compatible `Qwen3ForCausalLM`; sin pesos de Qwen) |
| Parametros totales | 63.912.192 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento: 768 tokens; limite posicional configurado: 32.768 tokens (rendimiento en contexto largo no probado) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos en FP16 safetensors, cuantificables con herramientas externas |
| Idiomas soportados | Chino (`zh`); capacidad en ingles y otros idiomas no medida |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP16) |

Detalles adicionales de configuracion: 8 capas, tamano oculto 768, 8 cabezas de atencion, 4 cabezas KV, dimension de feed-forward 2.432, vocabulario de 6.400 tokens, tamano del repositorio 0,1 GB. Entrenamiento en precision mixta BF16. Libreria: `transformers`. No requiere `trust_remote_code=True`.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con atencion causal y objetivo de prediccion del siguiente token. La configuracion concreta (8 capas, hidden 768, 8 cabezas de atencion con 4 cabezas KV, FFN de 2.432, vocabulario de 6.400) da lugar a los 63,91 millones de parametros declarados. El checkpoint se exporto al formato de la arquitectura Qwen3 mediante la utilidad de conversion de MiniMind; se trata de una compatibilidad de implementacion, no de una destilacion ni de un ajuste sobre pesos de Qwen. La inicializacion fue aleatoria y el tokenizador proviene del proyecto MiniMind.

El entrenamiento uso el fichero `pretrain_t2t_mini.jsonl` del dataset `jingyaogong/minimind_dataset`, con 1.270.238 registros de orientacion china. Cada registro se tokeniza de forma independiente, se trunca a 766 tokens de texto, se envuelve con tokens de inicio y fin y se rellena hasta 768 tokens, ignorando las etiquetas de relleno. Se realizo una unica epoca con microbatch de 4 secuencias, acumulacion de gradiente de 64 microbatches (lote efectivo nominal de 256 secuencias) y optimizador AdamW con valores por defecto de PyTorch. La tasa de aprendizaje siguio un decaimiento coseno de 0,0005 a 0,00005, con recorte de gradiente de 1,0 y semilla 42. La maquina se reinicio durante el preentrenamiento y el proceso se reanudo desde el microbatch 306.000, repitiendo la cola no guardada; se restauro el estado del modelo y del optimizador, pero no los gradientes parcialmente acumulados, por lo que no fue una ejecucion ininterrumpida bit a bit.

La perdida de entrenamiento descendio de 8,4318 en el primer microbatch registrado (100) a 2,4801 en el ultimo (317.560); la media de las primeras 50 lecturas fue 6,7344 y la de las ultimas 50, 1,9887. Son valores de microbatch de entrenamiento, no de validacion. No se aplico RLHF, DPO ni ningun tipo de alineamiento. No hay innovaciones tecnicas destacables (sin decodificacion especulativa, atencion lineal ni arquitecturas hibridas): el interes del proyecto es la reproducibilidad del pipeline completo en hardware de consumo.

## Capacidades

- Generacion de texto por continuacion: el modelo predice el siguiente token a partir de un prefijo, que es su unico modo de uso previsto.
- Modelo base sin instrucciones: no responde a ordenes, preguntas ni formatos conversacionales de manera fiable.
- Punto de partida para ajuste fino: puede servir como inicializacion para SFT, LoRA u otros esquemas de adaptacion.
- Capacidad multilingue: la unica lengua declarada es el chino; el rendimiento en ingles y otras lenguas no se ha medido.
- Tool calling / function calling: no soportado (no hay entrenamiento de instrucciones ni plantillas de herramientas).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Plantilla de chat: el tokenizador heredado puede incluir una, pero la model card advierte que eso no convierte el checkpoint en un modelo instruido.

## Casos de uso

- Material didactico para cursos de LLM: permite al alumnado recorrer el ciclo completo de preentrenamiento, conversion de formato y carga en `transformers` con un coste de computo minimo y en una sola GPU de consumo.
- Punto de partida para ajuste fino en chino: util como inicializacion para experimentos de SFT con conjuntos pequenos, evaluando como cambia la calidad de continuacion antes y despues del ajuste.
- Investigacion sobre tokenizadores de vocabulario reducido: con solo 6.400 tokens, es un banco de pruebas para estudiar el efecto del tamano de vocabulario en la calidad de la generacion y en el coste de embedding.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines con `transformers`, text-generation-inference o endpoints compatibles antes de escalar a modelos mayores, dado su tamano de 0,1 GB y su baja demanda de VRAM.
- Experimentos de cuantizacion: al ser un modelo diminuto, es adecuado para medir el impacto de FP16, int8 e int4 en latencia y calidad sin necesidad de hardware dedicado.
- Reproduccion de experimentos de reanudacion y robustez: el propio historial de reinicio del entrenamiento lo convierte en un caso de estudio sobre reanudacion de estado (modelo, optimizador y acumulacion de gradientes).
- Continucion de texto acotada en chino para demostraciones tecnicas: con prompts de continuacion y decodificacion greedy, para ilustrar el comportamiento de un modelo base sin alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay perplejidad en conjunto reservado, ni puntuaciones de benchmarks estandarizados, ni evaluaciones de factualidad o seguridad. Las unicas cifras publicadas son las perdidas de microbatch de entrenamiento:

| Medicion | Perdida |
|---|---:|
| Primer microbatch registrado (100) | 8,4318 |
| Ultimo microbatch registrado (317.560) | 2,4801 |
| Media de las primeras 50 lecturas | 6,7344 |
| Media de las ultimas 50 lecturas | 1,9887 |

Como comprobacion de humo en CPU con decodificacion greedy (`do_sample=False`, `max_new_tokens=64`), el autor reporta dos continuaciones:

| Prompt | Continuacion decodificada |
|---|---|
| `机器学习是一种` | Vacia tras eliminar tokens especiales |
| `在一个宁静的早晨，` | `，，，，，，，，，，，，` |

El propio autor califica estas pruebas como comprobaciones de generacion, no como benchmarks de calidad, y senala la baja calidad de continuacion con esos prompts y ajustes.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 128 MB (63,9 M parametros x 2 bytes); en FP32, unos 256 MB.
- VRAM estimada para inferencia: inferior a 1 GB contando pesos y cache KV (con contexto de 768 tokens y 4 cabezas KV, la cache es minima).
- GPU: cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 3060, RTX 4090 y superiores; el entrenamiento original se completo en una RTX 3060 de 12 GB.
- CPU: la inferencia en CPU esta soportada por la arquitectura exportada; el rendimiento en Raspberry Pi no se ha medido.
- RAM de sistema: unos 8 GB fueron suficientes durante el entrenamiento en el equipo del autor.
- Opciones de despliegue: `transformers` (probado con PyTorch 2.6.0 y Transformers 4.57.6), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. No se documentan conversiones oficiales a GGUF para llama.cpp u Ollama, ni integracion verificada con vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion provienen de conocimiento general y no estan verificados en la informacion proporcionada, por lo que deben confirmarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiniMind 64M (zhoumiaosen) | 63,9 M | Entrenado a 768; limite configurado 32.768 (no probado) | Apache-2.0 | `zh` | Base, sin instruction tuning; entrenado desde cero en una RTX 3060 |
| SmolLM2-135M | 135 M (aprox.) | 8.192 (aprox., segun su card) | Apache-2.0 | Principalmente ingles | Modelo base pequeno con pipeline de datos documentado |
| Qwen3-0.6B | 0,6 B (aprox.) | 32.768 (aprox., segun su card) | Apache-2.0 | Multilingue | Mayor tamano y capacidad; ecosistema amplio |
| TinyLlama-1.1B | 1,1 B (aprox.) | 2.048 (aprox., segun su card) | Apache-2.0 | Principalmente ingles | Entrenado desde cero sobre corpus publicos |

La comparacion de rendimiento no es posible con los datos disponibles: MiniMind 64M no publica resultados de benchmarks. En terminos de idoneidad practica, es el mas pequeno del grupo y el unico explicitamente concebido como material educativo reproducible en hardware de gama de entrada.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no debe usarse para responder preguntas, seguir ordenes ni mantener conversaciones.
- Calidad de continuacion pobre: las dos pruebas de generacion publicadas por el autor producen salida vacia o repeticion de comas.
- Sin evaluacion de sesgos, seguridad ni factualidad. No hay datos que permitan estimar el riesgo de alucinacion, aunque al ser un modelo base sin alineamiento el riesgo de generar contenido incoherente o inapropiado es alto.
- Cobertura idiomatica limitada al chino declarado; el rendimiento en castellano, ingles u otras lenguas no se ha medido y previsiblemente sera muy bajo con un vocabulario de 6.400 tokens.
- Contexto efectivo de 768 tokens: aunque la configuracion declare 32.768 posiciones, no se ha probado el comportamiento en contexto largo y no hay garantias de que funcione.
- Entrenamiento no reproducible bit a bit: hubo un reinicio que provoco la repeticion de una cola de microbatches y la perdida de gradientes parcialmente acumulados. Ademas, el artefacto guardado no incluye la ultima actualizacion en memoria del optimizador.
- Perdida de entrenamiento no interpretable como capacidad: el autor advierte que un descenso de la perdida no establece habilidad util de respuesta.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias. El dataset de entrenamiento no se redistribuye y sus terminos deben consultarse en su propia card.
- Las fechas de creacion y actualizacion del repositorio (11 de septiembre de 2026) son posteriores a la fecha habitual de publicacion y resultan inconsistentes, lo que conviene verificar antes de citar el modelo.
- Sin datos de despliegue en produccion: no hay mediciones de latencia, throughput ni consumo, y no se documentan conversiones a formatos como GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhoumiaosen/minimind-64m-pretrain
- Dataset de entrenamiento: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo, su paper o su repositorio; los resultados obtenidos correspondian a herramientas de creacion de listas de clasificacion sin relacion con el proyecto.
