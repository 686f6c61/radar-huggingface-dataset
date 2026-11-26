# wasnaga/UniverseNet-Qwen3-8B-Pocket-GGUF

## Resumen

UniverseNet Qwen3-8B Pocket 5.5B es una version comprimida del modelo Qwen3-8B de Alibaba, publicada por el desarrollador independiente wasnaga dentro de su proyecto de investigacion Universe Network (experimento 11). La intervencion consiste en reducir a la mitad el ancho de la capa feed-forward de cada bloque del transformer: de 12.288 a 6.144 neuronas SwiGLU por capa, lo que rebaja el total de parametros de 8,19 mil millones a 5,47 mil millones. El objetivo es que el modelo quepa y funcione en un iPhone de 8 GB de RAM, algo que el Qwen3-8B original en cuantizacion Q4 no permite por el limite de tamano de las aplicaciones moviles.

El resultado es un GGUF de 2,94 GB en Q4_0, frente a los aproximadamente 5,03 GB del Qwen3-8B en Q4, con una decodificacion de 16,22 tokens por segundo en un iPhone 16 Pro y 18,0 tokens por segundo en un Mac mini M1. La perdida de calidad se mide en perplejidad sobre WikiText-2 y codigo: el modelo original obtiene 11,91 y el comprimido queda en un rango de 14,5 a 16,9, con dos mediciones internas que no coinciden entre si, segun admite el propio autor.

La relevancia del modelo es doble. Por un lado, demuestra una receta de condensacion de bajo coste (unos 8 minutos en una RTX 4080) que combina seleccion de neuronas por energia de activacion, una resolucion de grupo de renormalizacion y un breve ajuste por LoRA de rango 64. Por otro, es un ejemplo practico de inferencia on-device en telefonos de gama alta con llama.cpp. No obstante, se trata de un checkpoint de investigacion sin evaluacion publica completa, por lo que su uso en produccion debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3, con capas feed-forward SwiGLU reducidas a la mitad de ancho (6.144 neuronas por capa) |
| Parametros totales | 5.472.826.368 (5,47 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_0 (unico fichero publicado) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Qwen3-8B) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-8B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only con atencion completa y capas feed-forward SwiGLU de 12.288 neuronas. La intervencion de wasnaga se aplica exclusivamente a esas capas feed-forward y consta de tres pasos. Primero, una seleccion orbital: se conservan las 6.144 neuronas de 12.288 con mayor energia de activacion (combinacion de activacion en bloque y en pico, denominada "fotoelectrica" por el autor) medida sobre 49.152 tokens de calibracion. Segundo, una resolucion tipo grupo de renormalizacion: una regresion ridge que preserva la media y pliega la salida promedio de las neuronas descartadas sobre las conservadas, con `bias=False` para que los kernels estandar de `qwen3` en llama.cpp sigan funcionando sin modificaciones. Tercero, una reparacion breve: 96 pasos de destilacion por LoRA de rango 64 desde el modelo profesor, fusionados en sitio sin anadir parametros.

El proceso completo tarda aproximadamente 8 minutos en una unica RTX 4080. A diferencia de las recetas MoE posteriores del mismo proyecto (por ejemplo, UniverseNet LFM2.5-24B), este checkpoint si incluye un paso de reparacion por gradiente. No se detalla en la informacion disponible el volumen total de tokens de entrenamiento original de Qwen3-8B ni la composicion de su dataset, ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aqui.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la arquitectura Qwen3.
- Modo de razonamiento: el modelo base Qwen3 soporta modo "thinking"; el autor indica que se puede anadir el sufijo `/no_think` para obtener respuestas directas.
- Razonamiento matematico y generacion de codigo: presentes pero degradados respecto al Qwen3-8B original, segun advierte el propio autor.
- Inferencia on-device sin conexion: funciona en modo avion en iPhone mediante la aplicacion PocketPal AI.
- Compatibilidad con llama.cpp: servidor `llama-server` con `--jinja`, lo que habilita plantillas de chat y, potencialmente, tool calling segun la plantilla del modelo base.
- Capacidades multilingues: no verificadas de forma independiente en este checkpoint; se asumen las del Qwen3-8B original.
- No se documentan capacidades de vision, audio ni agentes multi-paso especificas para esta version.

## Casos de uso

- Asistente conversacional offline en iPhone: el modelo se carga en PocketPal AI desde Hugging Face y opera sin red, con 16,22 tokens/s de decodificacion en un iPhone 16 Pro. Adecuado para asistentes personales, notas y consultas puntuales sin enviar datos a la nube.
- Prototipado rapido de aplicaciones moviles: desarrolladores iOS pueden integrar un LLM de 5,5 mil millones de parametros en una app sin superar el limite de tamano de descarga, usando el GGUF Q4_0 de 2,94 GB como base.
- Procesamiento de texto en dispositivos con recursos limitados: Mac mini M1 de 8 GB o portatiles sin GPU dedicada pueden ejecutar el modelo a 18 tokens/s, util para resumen, reescritura y clasificacion local.
- Educacion e investigacion sobre compresion de modelos: el fichero `results_exp11_qwen3_8b_pocket.json` incluye metricas por capa del proceso de condensacion, lo que permite reproducir y estudiar la receta de seleccion orbital y plegado ridge.
- Generacion de codigo en entornos con privacidad estricta: aunque el autor advierte de un rendimiento inferior al Qwen3-8B, puede usarse para autocompletado y explicaciones de codigo en entornos air-gapped donde no se permite enviar codigo a APIs externas.
- Despliegue en servidores modestos con llama.cpp: `llama-server` con `-ngl 99 -fa on --jinja` permite servir el modelo en una RTX 4080 a 78,4 tokens/s de decodificacion y 5.103 tokens/s de prefill, suficiente para demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, IFEval) en la informacion disponible. El autor indica explicitamente que las evaluaciones de IFEval, GSM8K y HumanEval estan pendientes. La unica metrica de calidad publicada es la perplejidad en un conjunto de WikiText-2 mas codigo:

| Metrica | Qwen3-8B (Q4) | Pocket 5.5B |
|---|---|---|
| Perplejidad (held-out, WikiText-2 + codigo) | 11,91 | 14,525 (log de publicacion) / 16,872 (fichero de resultados) |

Las dos cifras de perplejidad del modelo comprimido no coinciden y el autor afirma estar remidiendo el GGUF publicado, por lo que deben considerarse provisionales.

Rendimiento de inferencia medido con `llama-bench` (pp512 / tg128, `-ngl 99 -fa 1`):

| Dispositivo | Prefill (tok/s) | Decodificacion (tok/s) |
|---|---|---|
| iPhone 16 Pro (8 GB), PocketPal, offline | 180,4 | 16,22 |
| Mac mini M1 (8 GB) | 184,7 | 18,0 |
| RTX 4080 (16 GB) | 5.103 | 78,4 |

La cifra del iPhone se registro manualmente en PocketPal; las demas provienen de `llama-bench`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el GGUF Q4_0 de 2,94 GB, mas overhead de contexto y cache KV.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM; el autor lo prueba en una RTX 4080 (16 GB) con `-ngl 99`.
- Movil: disenado para iPhone de 8 GB de RAM (iPhone 16 Pro verificado) mediante PocketPal AI.
- Apple Silicon: verificado en Mac mini M1 de 8 GB a 18,0 tokens/s de decodificacion.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl 99 -fa on`) y PocketPal AI en iOS. No se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: prefill de 180 a 185 tokens/s en dispositivos moviles y Apple Silicon, 5.103 tokens/s en RTX 4080; decodificacion de 16 a 18 tokens/s en movil y M1, 78,4 tokens/s en RTX 4080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniverseNet Qwen3-8B Pocket 5.5B | 5,47 B | no disponible | GGUF Q4_0, 2,94 GB | Apache-2.0 | Hugging Face (wasnaga) |
| Qwen/Qwen3-8B (original) | 8,19 B | no disponible en la informacion proporcionada | safetensors y GGUF; ~5,03 GB en Q4 | Apache-2.0 | Hugging Face (Qwen) |
| UniverseNet LFM2.5-24B Pocket | no disponible | no disponible | GGUF | no disponible | Hugging Face (wasnaga) |

El Qwen3-8B original es la referencia directa: mismo linaje y licencia, pero un 33 % mas de parametros y un GGUF Q4 de 5,03 GB que supera el limite practico de las apps de iPhone. El UniverseNet LFM2.5-24B Pocket, del mismo autor, emplea una receta MoE sin reentrenamiento posterior y pertenece a otra familia base, por lo que no es estrictamente comparable en calidad. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sin evaluacion publica de benchmarks: IFEval, GSM8K y HumanEval estan pendientes; el autor anticipa peor rendimiento en matematicas y codigo que el Qwen3-8B.
- Perplejidad inconsistente: el log de publicacion indica 14,525 y el fichero de resultados 16,872 sobre el mismo conjunto; la medicion esta en revision.
- Perdida de calidad por condensacion: la reduccion a la mitad del ancho feed-forward elimina capacidad, y la reparacion por LoRA es de solo 96 pasos, por lo que las tareas que dependen de conocimiento factual fino pueden degradarse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica de factualidad para este checkpoint.
- Idiomas no verificados: la model card no documenta que idiomas conserva la version comprimida; el soporte multilingue del Qwen3-8B original puede no haberse preservado de forma uniforme.
- Contexto no documentado: no se especifica la longitud de contexto efectiva del GGUF ni si se ha validado con ventanas largas.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3-8B conviene revisar las condiciones del modelo base y atribuir correctamente.
- Checkpoint de investigacion: el autor lo presenta como parte de un proyecto experimental (Exp 11), no como un modelo listo para produccion; la unica cuantizacion publicada es Q4_0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasnaga/UniverseNet-Qwen3-8B-Pocket-GGUF
- Explicador del proyecto Universe Network: https://huggingface.co/spaces/wasnaga/universe-network
- Paper de investigacion: https://wasnaga-universe-network.static.hf.space/paper.html
- Modelo relacionado UniverseNet LFM2.5-24B Pocket: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
