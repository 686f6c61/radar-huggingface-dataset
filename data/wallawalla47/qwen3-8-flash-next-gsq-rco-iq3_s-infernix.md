# wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix es un artefacto de inferencia publicado por wallawalla47 que empaqueta el modelo Qwen3.8-Flash-Next, en su cuantizacion IQ3_S generada por ISTA-DASLab con el metodo GSQ y la asignacion de bits por tensor de RCO, para el motor propietario Infernix (C++/CUDA). El modelo subyacente es un transformer disperso de tipo MoE con 48 capas y 512 expertos enrutados por capa (top-10), lo que suma 24.576 expertos enrutados, y incorpora vision, decodificacion especulativa MTP y una tabla PLE de n-gramas de 320.001.536 filas.

La relevancia de esta ficha no esta en el modelo base sino en la receta de despliegue: Infernix consigue ejecutar un MoE multimodal de gran tamano en una unica RTX 5090 de 32 GB manteniendo los 46,9 GiB de expertos en RAM del host con cache en VRAM, computo parcial en CPU y lectura de la tabla n-gramas desde NVMe. Los pesos GGUF se conservan bit a bit y el motor opera con activaciones BF16 en aritmetica entera exacta, de modo que la suma ponderada de pesos y activaciones se redondea una sola vez y produce los mismos bits con independencia de donde se ejecute el experto (VRAM, PCIe o CPU) y del tamano de batch.

El artefacto esta marcado explicitamente como trabajo de aficionado (hobby) generado en gran parte con IA, con licencia Qwen Community 1.0, y su utilidad practica depende de disponer del motor Infernix, de una GPU Blackwell y de almacenamiento NVMe rapido; no es un modelo que pueda cargarse con llama.cpp, vLLM u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con vision, MTP (multi-token prediction) y tabla PLE de n-gramas; 48 capas, 512 expertos enrutados por capa (top-10) |
| Parametros totales | no disponible (el repo ocupa 85,9 GB e incluye pesos, tabla n-gramas y metadatos) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (GSQ con asignacion de bits por tensor de RCO); tabla PLE en IQ4_NL (4,5 bits por valor); variantes de tabla en FP8 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other`); el GGUF base de ISTA-DASLab se distribuye ademas bajo Apache 2.0 |
| Formato de pesos | `.infernix` (formato propio del motor Infernix, dividido en dos partes); `.ngram` para la tabla PLE; `config.json` solo como metadato para el conteo de descargas |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE con 48 capas y 512 expertos enrutados por capa, activando los 10 primeros por token (24.576 expertos enrutados en total, 46,9 GiB en IQ3_S). Incorpora una cabeza de vision que lo situa en la pipeline `image-text-to-text`, un cabecero MTP para decodificacion especulativa nativa y una tabla PLE de n-gramas de 320.001.536 filas que no forma parte de los ficheros del modelo, sino que se distribuye como volumen independiente leido en bloques aleatorios de 4 KiB. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO; la model card del artefacto no documenta el entrenamiento del modelo original.

La innovacion tecnica relevante esta en el motor y en la cuantizacion. GSQ con la asignacion de bits por tensor de RCO produce el IQ3_S, mientras que Infernix conserva cada tensor GGUF bit a bit y calcula con activaciones BF16 en aritmetica entera exacta: cada salida es la suma exacta de pesos GGUF por activaciones, redondeada una sola vez, garantizando identidad de bits entre expertos ejecutados en VRAM, PCIe o CPU y en cualquier ancho de batch. La comparacion implicita con llama.cpp es que este ultimo redondea las activaciones a 8 bits, por lo que sus logits difieren ligeramente. El reparto de recursos coloca los expertos en RAM fijada del host con una cache de los calientes en VRAM, calculo parcial de los fallos de cada capa en CPU y la tabla n-gramas en NVMe o RAM.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarada `image-text-to-text`.
- Procesamiento de imagen y texto combinados (multimodal), segun la pipeline y la mencion explicita de vision en la model card.
- Razonamiento de tipo Mixture-of-Experts con enrutamiento top-10 sobre 512 expertos por capa.
- Decodificacion especulativa mediante el cabecero MTP propio del modelo.
- Decodificacion especulativa alternativa con el drafter DFlash2 de Inco AI, empaquetado para Infernix, que acelera la decodificacion entre un 8 y un 11 % frente al MTP nativo, y hasta un 26 % en codigo muestreado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal grande en una unica GPU de consumo: Infernix permite ejecutar el modelo en una RTX 5090 de 32 GB manteniendo los 46,9 GiB de expertos en RAM del host y una cache en VRAM, lo que hace viable teoricamente un modelo de esta escala en una estacion de trabajo single-GPU.
- Experimentacion con cuantizacion IQ3_S y asignacion de bits por tensor: util para investigadores que quieran medir el efecto de GSQ-RCO sobre perplejidad y calidad frente a otras recetas, con la ventaja de que Infernix preserva los tensores GGUF bit a bit.
- Servicio conversacional con vision en local: la pipeline `image-text-to-text` y el modo conversacional permiten montar un asistente que recibe imagenes y texto sin depender de APIs en la nube, siempre que se acepte el rendimiento de un motor con offload a host.
- Aceleracion de inferencia mediante decodificacion especulativa: el drafter DFlash2 (776 MB) permite comparar en produccion el rendimiento del MTP nativo frente a un drafter externo, con ganancias medidas del 8-11 % y del 26 % en codigo muestreado.
- Investigacion sobre tablas PLE de n-gramas: el volumen de 320.001.536 filas admite tres formatos (FP8 recomendado, BF16 sin cuantizar e IQ4_NL de 4,5 bits por valor) y cualquier volumen sirve a cualquier modelo Flash-Next, lo que facilita estudios sobre el impacto de la precision de la tabla en la perplejidad.
- Reproducibilidad de inferencia en hardware heterogeneo: la aritmetica entera exacta con redondeo unico permite obtener los mismos bits con expertos repartidos entre VRAM, PCIe y CPU, util para auditar resultados entre maquinas distintas.
- Evaluacion de motores alternativos: sirve como banco de pruebas para comparar Infernix con llama.cpp en terminos de logits, dado que este ultimo redondea activaciones a 8 bits.

## Benchmarks y rendimiento

La model card reporta unicamente una medida de perplejidad comparando la tabla n-gramas empleada con la tabla BF16:

| Metrica | Tabla IQ4_NL (usada en este artefacto) | Tabla BF16 |
|---|---:|---:|
| Perplejidad | 3,5223 | 3,5198 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La tabla FP8 recomendada no ha sido medida sobre este modelo.

## Requisitos de hardware

- VRAM: 32 GB en una RTX 5090 para el modelo, con los 46,9 GiB de expertos enrutados en RAM fijada del host y cache de expertos calientes en VRAM; el artefacto ocupa 85,9 GB en disco entre las dos partes del modelo y la tabla n-gramas.
- GPU recomendada: RTX 5090 (Blackwell, 32 GB), unica configuracion mencionada explicitamente. Otras GPU Blackwell podrian servir, pero no estan documentadas.
- GPU de consumo: si, la RTX 5090 es el objetivo declarado del artefacto.
- RAM del sistema: la tabla IQ4_NL ocupa 27,1 GiB y solo cabe en RAM en una maquina de 96 GB junto al resto; en caso contrario debe residir en NVMe.
- Almacenamiento: NVMe recomendado para el volumen n-gramas, leido en bloques aleatorios de 4 KiB mediante `--ngram-volume`.
- Opciones de despliegue: exclusivamente el motor Infernix (C++/CUDA), con `infernix-serve`; no compatible con llama.cpp, vLLM, TGI ni Ollama. Se requiere una build cuyo `--help` liste `--draft-model` para usar el drafter DFlash2; las builds desde 2026-10-31 localizan el drafter en la carpeta del modelo sin `--spec`.
- Latencia y throughput: no disponibles como cifras absolutas; solo se documentan ganancias relativas del drafter DFlash2 (8-11 % mas rapido que el MTP nativo; 26 % en codigo muestreado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix (este) | MoE 48 capas, 512 expertos/capa top-10; totales no disponibles | no disponible | `.infernix`, motor Infernix | Qwen Community 1.0 | Vision, MTP, tabla PLE externa; pensado para una RTX 5090 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (base) | mismos pesos MoE | no disponible | GGUF | Apache 2.0 (segun la model card) | Misma cuantizacion IQ3_S; ejecutable con motores GGUF convencionales |
| Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix | mismos pesos MoE | no disponible | `.infernix` + tabla n-gramas FP8 | Qwen Community 1.0 | Variante NVFP4 para Infernix; su tabla FP8 es la recomendada |
| Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix | mismos pesos MoE | no disponible | `.infernix` + tabla BF16 | Qwen Community 1.0 | Variante FP8; aloja la tabla BF16 sin cuantizar |

## Limitaciones y advertencias

- Artefacto declarado como trabajo de aficionado y generado en gran parte con IA; el propio autor advierte que puede ser incompleto o inexacto.
- No es un modelo autonomo: requiere el motor Infernix, no lee `config.json` y no funciona con llama.cpp, vLLM, TGI ni Ollama.
- La tabla PLE de n-gramas no esta incluida en los ficheros del modelo; hay que descargar un volumen aparte (IQ4_NL en este repo, FP8 recomendado o BF16) y pasarlo con `--ngram-volume`.
- Dependencia de hardware Blackwell y de NVMe: el rendimiento se degrada si la tabla no cabe en RAM (27,1 GiB para IQ4_NL, 52,4 GB para FP8, 109,2 GB para BF16).
- Diferencias de logits frente a llama.cpp por el redondeo de activaciones a 8 bits de este ultimo; los resultados no son intercambiables bit a bit entre motores.
- Licencia Qwen Community 1.0 con posibles restricciones para uso comercial; el GGUF base añade Apache 2.0, pero la licencia del artefacto derivado debe verificarse antes de produccion.
- Idiomas soportados no declarados; no hay garantia documentada de cobertura multilingue.
- No hay datos publicados sobre sesgos, tasas de alucinacion, tool calling ni comportamiento agentico.
- Perplejidad medida solo con la tabla IQ4_NL en RAM; la tabla FP8 recomendada no ha sido evaluada sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Modelo base GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Drafter DFlash2 empaquetado: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Drafter DFlash2 original: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Variante NVFP4 (tabla n-gramas FP8): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Variante NVFP4 Dense8 (copia de la tabla FP8): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Variante FP8 (tabla n-gramas BF16): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
