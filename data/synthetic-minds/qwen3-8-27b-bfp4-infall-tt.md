# synthetic-minds/Qwen3.8-27B-BFP4-Infall-TT

## Resumen

Qwen3.8-27B-BFP4-Infall-TT es una cuantizacion del modelo Qwen3.8-27B de Qwen, publicada por Synthetic Minds el 21 de noviembre de 2026. El checkpoint contiene los pesos completos en formato Hugging Face estandar (unos 56 GB) pero con cada valor alineado exactamente a la rejilla BFP4 (`bfloat4_b`) de Tenstorrent, de modo que al cargarlo con tt-metal la compresion a 4 bits no introduce redondeo adicional. Esta pensado para ejecutarse en aceleradores Tenstorrent Blackhole (P150A/B, P300C y Galaxy Blackhole).

La innovacion principal es el metodo de cuantizacion Infall-TT, una variante de GPTQ que resuelve los pesos capa por capa directamente sobre la rejilla BFP4 en lugar de aplicar redondeo al vecino mas cercano. Segun el autor, esto reduce el incremento de perplejidad en WikiText-2 del 11,0 % al 4,0 % y en C4 del 5,3 % al 3,3 % respecto al modelo BF16 original, con una divergencia KL un 42 % y un 29 % menor respectivamente.

El modelo base es un transformer causal de 27B parametros con codificador de vision, multilingue y con licencia Apache-2.0. La relevancia de esta ficha es acotada: no es un modelo nuevo sino un artefacto de despliegue para hardware Tenstorrent, y su utilidad depende de tener acceso a dichos aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision (familia `qwen3_5`) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`), ~4,5 bits por peso, ~15 GB en memoria |
| Idiomas soportados | Multilingue, como el modelo original (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados en BF16) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.8-27B: un transformer causal con codificador de vision, orientado a generacion de texto e image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

La contribucion tecnica de esta publicacion es el proceso de cuantizacion. Infall-TT aplica GPTQ directamente sobre la rejilla BFP4 de Tenstorrent: cada error de redondeo se compensa ajustando los pesos aun no cuantizados, se usa texto real para ponderar que errores importan y se elige el exponente compartido de cada bloque para minimizar el error. El resultado se almacena en BF16 con los valores ya situados en la rejilla BFP4, de forma que tt-metal, al comprimir en carga, no altera los pesos. El layout se verifico contra la implementacion `models/demos/qwen38_27b_qb2` de tt-metal.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`).
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del codificador de vision del modelo base.
- Capacidades multilingues, segun el modelo original.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Blackhole: el caso principal. Se descarga el checkpoint y se apunta la demo `qwen38_27b_qb2` de tt-metal o su integracion con vLLM a este directorio mediante `MODEL_WEIGHTS_DIR`, sin cambios de codigo, obteniendo el modelo en ~15 GB de memoria BFP4.
- Evaluacion de calidad de cuantizacion: util para equipos que comparan el redondeo por defecto de tt-metal con GPTQ sobre BFP4 usando perplejidad en WikiText-2 y C4, divergencia KL y acuerdo top-1.
- Investigacion sobre formatos de bloque flotante: sirve como referencia reproducible de como se comporta un modelo de 27B al fijar todos los pesos a la rejilla BFP4 con correccion de error.
- Servicio de generacion de texto en infraestructura propia con tt-metal o vLLM sobre Blackhole, cuando el objetivo es maximizar la ocupacion de memoria del acelerador.
- Prototipado de asistentes multimodales (imagen-texto) en hardware no-GPU, aprovechando el codificador de vision del modelo base.
- Base para experimentos de ajuste fino consciente de cuantizacion: al estar los pesos en BF16 sobre la rejilla BFP4, se pueden inspeccionar y transformar con herramientas estandar de Hugging Face.

## Benchmarks y rendimiento

Datos de calidad de cuantizacion publicados por el autor, medidos sobre texto no visto por el cuantizador (40 ventanas de 2.048 tokens por conjunto, 81.880 tokens predichos cada una):

| Metrica | BF16 (original) | BFP4 por defecto de Tenstorrent | Infall-TT BFP4 |
|---|---|---|---|
| Perplejidad WikiText-2 | 6,489 | 7,205 (+11,0 %) | 6,750 (+4,0 %) |
| Perplejidad C4 | 12,193 | 12,839 (+5,3 %) | 12,600 (+3,3 %) |
| Divergencia KL (C4) | 0 | 0,059 | 0,042 |
| Acuerdo top-1 (C4) | 100 % | 85,7 % | 87,7 % |
| Divergencia KL (WikiText-2) | no disponible | 0,093 | 0,054 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent Blackhole P150A/B, P300C y Galaxy Blackhole. No esta pensado para GPU.
- Memoria: en BFP4 los pesos ocupan aproximadamente 15 GB; la descarga completa del repositorio son unos 56 GB en disco.
- VRAM en GPU: no disponible; el autor no documenta ejecucion en CUDA.
- Despliegue: tt-metal (demo `models/demos/qwen38_27b_qb2/demo/text_demo.py`) y la integracion de tt-metal con vLLM. llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-BFP4-Infall-TT | 27B | BFP4 sobre rejilla, almacenado en BF16 | Tenstorrent Blackhole | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27B | BF16 | GPU / CPU genericos | Apache-2.0 |
| BFP4 por defecto de tt-metal (mismo modelo) | 27B | BFP4 con redondeo al vecino mas cercano | Tenstorrent Blackhole | Apache-2.0 |

La comparativa relevante es contra el original y contra la cuantizacion por defecto del mismo hardware: Infall-TT mejora la perplejidad y la divergencia KL a igual formato y a igual uso de memoria. No se dispone de comparacion con otras familias de modelos de 27B en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: todas las capacidades, sesgos y riesgos de alucinacion son los del Qwen3.8-27B original, sobre el que no se aportan datos en esta ficha.
- La cuantizacion a 4 bits introduce degradacion medible: +4,0 % de perplejidad en WikiText-2 y 87,7 % de acuerdo top-1 frente al BF16, lo que puede afectar a tareas sensibles a la precision.
- Dependencia de hardware: el checkpoint esta disenado para que tt-metal lo comprima sin perdida adicional; usarlo en otros entornos implica leer pesos BFP4 almacenados en BF16 sin la ventaja de memoria prevista.
- El metodo Infall-TT se describe como "beta preview" de un framework propietario de Synthetic Minds, con lista de espera; no hay codigo del cuantizador publicado en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, y no hay validacion independiente de las cifras de calidad declaradas por el autor.
- La lista concreta de idiomas soportados y la longitud de contexto no se documentan en la informacion disponible; conviene consultar la model card del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo original Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synthetic-minds/Qwen3.8-27B-BFP4-Infall-TT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organizacion en Hugging Face: https://huggingface.co/synthetic-minds
- Coleccion GGUF Infall-TT: https://huggingface.co/collections/synthetic-minds/infall-tt-optimised-gguf-20-6b01ce6d8f799e1cde015b58
- Web de Synthetic Minds: https://www.syntheticmindslab.com/
- GitHub: https://github.com/syntheticminds-lab
- Implementacion de referencia en tt-metal: https://github.com/tenstorrent/tt-metal/tree/main/models/demos/qwen38_27b_qb2
- X (Synthetic Minds): https://x.com/syntheticminds2
- LinkedIn: https://www.linkedin.com/company/synthetic-minds-lab/
