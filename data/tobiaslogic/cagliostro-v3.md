# TobiasLogic/cagliostro-v3

## Resumen

cagliostro-v3 es un modelo publicado en HuggingFace por el usuario TobiasLogic bajo el identificador TobiasLogic/cagliostro-v3. La informacion publica disponible es minima: la ficha no declara pipeline, licencia ni idiomas soportados, y el unico tag presente es region:us. El repositorio ocupa 28,1 GB y esta configurado con acceso restringido (gated), de modo que es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos.

A partir del tamano del repositorio puede estimarse que se trata de un modelo de aproximadamente 14 000 millones de parametros almacenados en precision de 16 bits (fp16 o bf16). Esta cifra es una inferencia derivada del peso de los ficheros y no un dato confirmado por el autor. No se dispone de informacion sobre arquitectura, datos de entrenamiento, longitud de contexto, tokenizador ni proceso de alineacion (RLHF, DPO u otros).

Su relevancia practica es dificil de evaluar: con cero descargas registradas y un unico like, el modelo carece de validacion por parte de la comunidad y de documentacion tecnica que permita reproducir o auditar su comportamiento. Esta ficha recoge unicamente lo verificable en los metadatos y marca explicitamente como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (estimacion no confirmada: ~14 000 millones, a partir de un repositorio de 28,1 GB en fp16/bf16) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican conversiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (acceso gated con condiciones no especificadas en los metadatos) |
| Formato de pesos | no disponible (el tamano del repositorio, 28,1 GB, es compatible con safetensors en fp16, sin confirmar) |

Datos adicionales de los metadatos: identificador TobiasLogic/cagliostro-v3, autor TobiasLogic, tags region:us, 0 descargas, 1 like, fecha de creacion registrada el 11 de septiembre de 2026 y ultima actualizacion el 11 de septiembre de 2026, tamano del repositorio 28,1 GB, acceso restringido.

## Arquitectura y entrenamiento

No disponible. El autor no publica informacion sobre el tipo de arquitectura (transformer denso, mezcla de expertos, SSM o hibrida), el numero de capas, las dimensiones de atencion, el tokenizador ni la ventana de contexto. Tampoco hay documentacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos, la existencia de fases de instruccion, RLHF o DPO, ni sobre tecnicas de eficiencia como atencion lineal, decodificacion especulativa o cuantizacion durante el entrenamiento.

La unica inferencia posible parte del tamano del repositorio (28,1 GB), que resulta coherente con un modelo denso de unos 14 000 millones de parametros en 16 bits, o con un modelo menor acompanado de multiples ficheros auxiliares (optimizador, checkpoints intermedios, tokenizador). No es posible distinguir entre estos escenarios sin acceso a los ficheros, que estan restringidos.

## Capacidades

- No hay ninguna capacidad confirmada por el autor en la informacion disponible.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio, multimodalidad): no disponible.
- No se publica model card, ficha de uso, demo, ni ejemplos de prompts o salidas.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones confirmadas. Los siguientes escenarios son hipoteticos y condicionados a que el modelo resulte ser un LLM denso de ~14 000 millones de parametros con capacidades de instruccion:

- Generacion de texto asistida en castellano: solo seria viable si el autor confirma soporte multilingue; actualmente no hay ninguna indicacion al respecto.
- Despliegue en pipelines de codigo: requeriria confirmacion de entrenamiento en codigo y de soporte de tool calling, ninguno de los cuales esta documentado.
- Atencion al cliente multi-turno: dependeria de una ventana de contexto declarada, dato ausente en los metadatos.
- Extraccion de informacion estructurada: exigiria validar el formato de salida y la capacidad de seguir instrucciones, sin datos disponibles.
- Ajuste fino sobre dominio propio (fine-tuning): tecnicamente posible si los pesos son safetensors y la licencia lo permite, pero la licencia no esta declarada y el acceso es gated.
- Evaluacion comparativa interna: el modelo podria servir como punto de comparacion en un banco de pruebas propio, asumiendo el coste de descarga (28,1 GB) y de inferencia.
- Uso en produccion: desaconsejado en el estado actual de la informacion, por ausencia de licencia, benchmarks y trazabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench, Arena Elo ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia. Tampoco se publican mediciones de latencia, throughput ni consumo de memoria.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del repositorio (28,1 GB) y asumen un modelo denso de ~14 000 millones de parametros. No estan confirmadas por el autor.

- VRAM para inferencia en fp16/bf16: aproximadamente 28 GB solo para pesos, mas 2-4 GB de overhead de activaciones y cache KV, es decir 30-36 GB en total.
- VRAM para inferencia en int8: aproximadamente 14-16 GB de pesos, 18-22 GB en total.
- VRAM para inferencia en 4 bits (si existiera una cuantizacion GGUF/AWQ Q4): aproximadamente 8-10 GB de pesos, 10-12 GB en total.
- GPU de datacenter recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB. Una sola A100 40 GB bastaria para fp16 con contexto moderado.
- GPU de consumidor: una RTX 4090 o RTX 3090 con 24 GB podria ejecutar el modelo en int8 o en cuantizaciones de 4-6 bits; en fp16 no cabe en una sola GPU de 24 GB. Tarjetas de 12-16 GB (RTX 4080, RTX 4070 Ti Super) solo serian viables con cuantizacion de 4 bits. Multi-GPU consumer (2x 24 GB) permitiria fp16 con tensor parallelism.
- Opciones de despliegue: vLLM, TGI y SGLang si los pesos son safetensors compatibles con transformers; llama.cpp u Ollama solo si el autor publica conversiones GGUF, que actualmente no existen. TensorRT-LLM requeriria construir motores propios.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen los parametros, el contexto, el rendimiento y la licencia de cagliostro-v3. La tabla siguiente recoge candidatos del rango de tamano estimado (~12 000-14 000 millones de parametros) a modo de referencia de categoria, no como equivalencia funcional.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cagliostro-v3 | no disponible (~14 000 millones estimados) | no disponible | no disponible | Gated en HuggingFace, 0 descargas |
| Qwen2.5-14B-Instruct | 14 700 millones | 32 768 tokens (hasta 131 072 con RoPE scaling) | Apache 2.0 (segun version) | Abierta en HuggingFace |
| Mistral-Nemo-12B-Instruct | 12 200 millones | 128 000 tokens | Apache 2.0 | Abierta en HuggingFace |
| Llama-3.1-8B-Instruct | 8 000 millones | 128 000 tokens | Llama 3.1 Community License | Abierta con condiciones |

Los datos de rendimiento de cagliostro-v3 no estan publicados, por lo que no se puede afirmar ninguna equivalencia ni superioridad frente a estos modelos.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, paper, blog ni repositorio de codigo asociado.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido, lo que impide su adopcion en produccion con garantias legales.
- Acceso restringido: la descarga exige aceptar condiciones en HuggingFace cuyo contenido no se detalla en los metadatos y puede variar sin previo aviso.
- Sin validacion de la comunidad: 0 descargas y 1 like indican que el modelo no ha sido probado ni auditado por terceros.
- Riesgo de alucinacion, sesgos y comportamiento toxico: desconocido, al no existir evaluaciones de seguridad publicadas.
- Procedencia de los datos de entrenamiento desconocida: no se puede verificar el cumplimiento de derechos de autor ni la ausencia de datos personales.
- Idiomas: no se declara ningun idioma soportado; el rendimiento en castellano es indeterminado.
- Contexto: se desconoce la ventana maxima, por lo que no se pueden disenar aplicaciones con requisitos de contexto largo.
- Integridad de los pesos: sin sumas de verificacion publicadas ni confirmacion del formato, existe riesgo de ficheros incompletos o incompatibles.
- Fecha de creacion registrada en los metadatos (11 de septiembre de 2026) es posterior a la fecha habitual de publicacion; conviene verificar la autenticidad y vigencia del repositorio antes de cualquier uso.
- Recomendacion: tratar el modelo como no apto para produccion hasta que el autor publique licencia, especificaciones, benchmarks y resultados de evaluacion de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/TobiasLogic/cagliostro-v3
- Perfil del autor en HuggingFace: no disponible en la informacion proporcionada
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio de inferencia: no disponible
- Blog o anuncio de publicacion: no disponible
