# swdq/anison-lyrics-qwen35-4b-content-sft-v2

## Resumen

Anison-lyrics-qwen35-4b-content-sft-v2 es un ajuste fino experimental del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario swdq, orientado a la generacion de letras de canciones de anime (anison) en japones. El modelo parte del checkpoint base Qwen3.5-4B y aplica un SFT condicional en el que unicamente las letras reales se emplean como salida de profesor. Cuenta con aproximadamente 4,84 mil millones de parametros en formato safetensors y un repositorio de 9,7 GB.

El problema que aborda es la generacion de letras condicionada por metadatos de tema, perspectiva, escena y desarrollo argumental, manteniendo inalterado el cuerpo original de la letra real. El autor descarta explicitamente este checkpoint como material de produccion: la model card indica que fue rechazado y que no sustituye al checkpoint previo TPO-r2.

Su relevancia es fundamentalmente documental: se publica como registro auditado de un experimento de SFT con evaluacion ciega mediante LLM, con trazabilidad de hashes y curvas de entrenamiento, y con la conclusion de que el ajuste no mejora la calidad de texto frente a su linea base. No esta pensado para uso comercial ni de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen/Qwen3.5-4B; etiqueta qwen3_5_text) |
| Parametros totales | 4.841.450.496 (~4,84 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicados; sin GGUF ni GPTQ/AWQ en el repo) |
| Idiomas soportados | Japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo SFT condicional sobre Qwen/Qwen3.5-4B. El autor describe el proceso como "conditional SFT" en el que solo las letras reales se usan como salida de profesor. El input incorpora resumenes de tematica, punto de vista, escena y desarrollo, mientras que el texto original de la letra no fue modificado. El valor inicial del ajuste fue el checkpoint TPO-r2, un modelo previo del mismo autor.

El entrenamiento se realizo con 2 GPUs en DDP y precision bf16, durante 1 epoca efectiva, con 129 actualizaciones de optimizador. Por efecto del parametro drop_last existente, se utilizaron realmente 2.064 canciones de las 2.076 seleccionadas. Del corpus de profesores se excluyeron 85 canciones con tasa de caracteres japoneses inferior a 0,3 y 2 canciones con contaminacion de texto no musical. El autor advierte que la tasa de caracteres es un proxy que incluye kanji y no un clasificador de idioma, y que los efectos del valor inicial y de la seleccion de profesores no pueden separarse. Los pesos estan fijados al commit `epoch-01` (`eb058d25e146846dc5fb92b07f6531b65b2694d4`), con un pico de memoria CUDA observado de 43,93 GiB asignados y 46,22 GiB reservados.

## Capacidades

- Generacion de texto condicionada por metadatos: acepta resumenes de tematica, perspectiva, escena y desarrollo argumental como entrada.
- Generacion de letras de canciones en japones con estilo anison.
- Modelo conversacional segun la etiqueta `conversational` del repositorio.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al japones (unico idioma declarado).
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible en la informacion proporcionada.
- Capacidad de copia fiel de lineas de entrenamiento: practicamente nula, con una tasa media de coincidencia exacta de linea de entrenamiento del 0,445 % y cero coincidencias normalizadas de 40 caracteres en la particion de validacion.

## Casos de uso

- Investigacion sobre SFT condicional aplicado a generacion creativa: el checkpoint sirve como caso de estudio documentado de un ajuste que fue rechazado tras evaluacion ciega, con datos de NLL y preferencias publicados.
- Auditoria de metodologia de evaluacion: la model card incluye comparaciones ciegas con intervalos bootstrap, utiles para reproducir protocolos de evaluacion de modelos generativos de letras.
- Registro de ingenieria de entrenamiento: los datos de epocas, actualizaciones de optimizador, uso de memoria CUDA y trazabilidad por hash permiten analizar costes de un SFT de 4B en DDP con bf16.
- Experimentacion academica sobre sesgo de seleccion de corpus: el caso ilustra como la filtracion de profesores por tasa de caracteres y la eleccion de valor inicial no se pueden desacoplar.
- Generacion exploratoria de borradores de letras en japones para investigacion interna, sin expectativa de calidad comercial ni garantia de derechos.
- Estudio de limites de la copia en modelos de lenguaje: la metrica de coincidencia exacta de lineas de entrenamiento (0,445 % de media) aporta evidencia empirica sobre memorizacion.

No se recomienda su uso en produccion ni en aplicaciones comerciales segun las advertencias del propio autor.

## Benchmarks y rendimiento

Los datos disponibles no corresponden a benchmarks estandar (MMLU, HumanEval, GSM8K) sino a la evaluacion interna del autor. Se presentan tal cual, con la advertencia de que proceden de la model card del propio desarrollador.

| Metrica | Valor |
|---|---|
| Comparacion ciega por LLM frente a TPO-r2 (20 condiciones, 4 candidatos cada una) | 25 victorias, 52 derrotas, 3 empates para TPO-r2 |
| Media por condicion en comparacion ciega | 0,33125 |
| Intervalo bootstrap 95 % por condicion | [0,21875; 0,45] |
| Condiciones con letra real y especificacion japonesa (18 condiciones) | 0 victorias, 72 derrotas |
| NLL heldout condicional | 2,7602 -> 2,7243 |
| NLL en condicion style-only original | 2,8462 -> 2,7909 |
| Salidas con tasa de caracteres japoneses < 0,3 | 4 de 80 (TPO-r2: 0) |
| Salidas incompletas | 0 |
| Tasa media de coincidencia exacta de linea de entrenamiento | 0,445 % |
| Coincidencia train/heldout normalizada a 40 caracteres | 0 de 80 candidatos |

Como referencia externa, la model card incluye un experimento independiente sobre el propio TPO-r2 (no sobre los pesos de este repositorio) en el que se bajo la temperatura de 1,0 a 0,7: 55 victorias, 20 derrotas y 5 empates en preferencia ciega, con media por condicion de 0,71875 e intervalo [0,625; 0,8125]. Frente a letras reales ese ajuste de temperatura mantuvo 0 victorias y 72 derrotas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9,7 GB solo en pesos, mas cache KV y activaciones; se situa en el rango de 11-14 GB segun contexto (estimacion calculada a partir del numero de parametros, no publicada por el autor).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4,9 GB de pesos mas sobrecarga (estimacion calculada).
- VRAM estimada con cuantizacion de 4 bits (requiere conversion propia, no publicada): aproximadamente 2,4-3 GB de pesos mas sobrecarga (estimacion calculada).
- GPU recomendadas: cualquier GPU con al menos 16 GB para bf16; A100, H100, L40S o RTX 4090 son suficientes. El autor reporta 43,93 GiB asignados y 46,22 GiB reservados en entrenamiento con 2 GPUs en DDP y bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) sin cuantizar y con contexto moderado; tambien en RTX 4080/3090 (16-24 GB) para bf16 o con cuantizacion.
- Opciones de despliegue: vLLM y TGI son compatibles en teoria con arquitecturas tipo Qwen3.5 en safetensors; llama.cpp u Ollama requeririan conversion a GGUF no publicada. No hay confirmacion del autor sobre compatibilidad con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anison-lyrics-qwen35-4b-content-sft-v2 | ~4,84 mil millones | no disponible | safetensors | no disponible | Publico en HuggingFace (0 descargas al registrar la ficha) |
| Qwen/Qwen3.5-4B (modelo base) | ~4 mil millones (no confirmado en la informacion) | no disponible | safetensors | no disponible | Publico en HuggingFace |
| TPO-r2 (checkpoint previo del mismo autor) | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace directo |

La comparacion se limita al modelo base y al checkpoint previo mencionado por el autor; no se dispone de datos sobre otros modelos comparables de generacion de letras en japones.

## Limitaciones y advertencias

- Modelo rechazado por su propio autor: no sustituye a TPO-r2 y no esta certificado para calidad comercial. En comparacion ciega pierde 52 de 80 enfrentamientos frente a TPO-r2.
- Frente a letras reales en japones, el modelo obtiene 0 victorias y 72 derrotas en las 18 condiciones con especificacion japonesa.
- Licencia no disponible: el autor no garantiza el uso comercial de los pesos ni de las generaciones.
- Los datos de entrenamiento incluyen letras de terceros y no se publican; no se ha verificado la situacion de derechos de letristas, interpretes ni titulares.
- El corpus de entrenamiento contiene material con derechos de autor de terceros, lo que supone un riesgo legal para cualquier uso derivado.
- Riesgo de alucinacion y de degradacion del lenguaje: 4 de cada 80 salidas presentan una tasa de caracteres japoneses inferior a 0,3.
- Aunque la NLL heldout mejora (2,7602 -> 2,7243), el autor indica que la diferencia de calidad de texto no se ha reducido.
- Solo soporta japones; no hay evidencia de capacidades multilingues.
- La evaluacion no se realizo sobre un holdout nuevo, y no hay verificacion de letristas ni de interpretacion vocal.
- Los datos de coincidencia de entrenamiento (0,445 % de tasa media de linea exacta) no constituyen garantia frente a copias aproximadas ni frente a infraccion de derechos.
- Uso practico limitado a investigacion; no apto para produccion segun las advertencias explicitas de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swdq/anison-lyrics-qwen35-4b-content-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/a0xdlkgjei3v/anison-lyrics/runs/u8lmv7of
- Resultados del control de temperatura sobre TPO-r2 (referenciado en la model card como `temperature_control_results.json`)
- Hash de pesos fijado: `eb058d25e146846dc5fb92b07f6531b65b2694d4` (epoch-01)
