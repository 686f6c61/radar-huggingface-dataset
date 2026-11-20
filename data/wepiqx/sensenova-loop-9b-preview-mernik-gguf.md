# wepiqx/SenseNova-Loop-9B-Preview-MERNIK-GGUF

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje de aproximadamente 9.200 millones de parametros desarrollado por SenseNova. Se trata de un modelo de arquitectura hibrida que combina capas SSM (State Space Model) con un decodificador "looped" (recurrente en profundidad) y enrutamiento residual mHC. Esta ficha documenta la cuantizacion GGUF publicada por el usuario wepiqx bajo el nombre MERNIK, que permite ejecutar el modelo en `llama.cpp` mediante un fork parcheado.

La relevancia de esta publicacion no reside solo en el modelo base, sino en las decisiones tecnicas de cuantizacion: el autor fija explicitamente en F32 las 48 puertas SSM (`ssm_alpha` / `ssm_beta`) y los enrutadores mHC, ya que cuantizarlos a Q4_K provoca degeneracion en bucle (texto repetitivo e incoherente). El archivo resultante ocupa 5310 MiB con 4,84 bits por peso (BPW) y requiere un runtime especifico que reconozca la arquitectura `sensenova_loop`.

El modelo esta orientado a generacion de texto conversacional en ingles y chino, con licencia Apache 2.0. No incluye la torre de vision (es text-only) y requiere compilar un fork concreto de `llama.cpp` para funcionar, lo que limita su uso a entornos donde se pueda controlar el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (decodificador con bucle + enrutamiento residual mHC + 24 capas SSM) |
| Parametros totales | 9.200.240.000 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla Q4_K, Q5_K, Q6_K, Q8_0 y F32 (4,84 BPW) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `sensenova_loop`, que el autor de la cuantizacion describe como un decodificador con bucle ("looped decoder") mas enrutamiento residual mHC. Incluye 24 capas SSM, cada una con tensores `ssm_alpha.weight` y `ssm_beta.weight` de forma `[4096, 32]`, situados en la ruta recurrente. El archivo GGUF contiene 538 tensores en total y soporta MTP (multi-token prediction), aunque el fork upstream de GuideboardLabs en el commit `fad174e` no lo soporta; es necesario el fork de wepiqx con MTP habilitado.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica documentada se refiere a la cuantizacion: la asignacion de bytes por tensor se guia mediante un predictor de dano llamado Gnom v5, que distribuye el presupuesto de forma no uniforme, y posteriormente se fijan a F32 las puertas SSM y los enrutadores mHC (328 de 538 tensores son F32, pero solo suman 40,13 MiB, menos del 1% del archivo).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y generacion de texto general (pipeline `text-generation`).
- Soporte de MTP (multi-token prediction) en el fork de runtime recomendado.
- Capacidad multilingue limitada a en y zh segun la model card.
- No incluye torre de vision: la cuantizacion es text-only.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en la informacion disponible.
- No se documentan modos especiales de razonamiento (thinking mode), audio u otras modalidades.

## Casos de uso

- Asistente conversacional en ingles o chino: el modelo puede mantener dialogos multi-turno en estos dos idiomas, con la ventaja de un archivo de 5,3 GB que cabe en GPUs de consumo medio-alto.
- Despliegue en local con `llama.cpp`: adecuado para entornos donde se quiera evitar dependencias de la nube, compilando el fork con soporte CUDA, Vulkan, Metal o CPU.
- Prototipado de investigacion sobre arquitecturas hibridas SSM: util para estudiar el comportamiento de un decodificador con bucle y enrutamiento mHC en un runtime de inferencia ligero.
- Generacion de texto en pipelines de bajo coste: el tamano de 5,3 GB y el soporte de cuantizacion mixta permiten ejecutarlo en hardware modesto con `-ngl` ajustado.
- Evaluacion comparativa de tecnicas de cuantizacion: el archivo sirve como referencia de como la preservacion en F32 de puertas recurrentes evita la degeneracion, un caso de estudio para quien disene recetas de cuantizacion.
- Aplicaciones educativas o demos offline en chino e ingles: al no depender de API externa, es apto para entornos sin conectividad o con requisitos de privacidad.
- Experimentacion con MTP: el fork recomendado permite probar decodificacion multi-token en un modelo de ~9B, util para medir ganancias de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 5310 MiB (5,19 GiB); con overhead de contexto y runtime, se recomienda al menos 6-7 GB de VRAM para offload completo con `-ngl 99`.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para offload completo; el autor documenta builds para CUDA (NVIDIA), Vulkan (AMD/Intel/NVIDIA) y Metal (Apple).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti/4060 y superiores); en GPUs de 6 GB habria que reducir `-ngl` y descargar capas a CPU.
- Opciones de despliegue: exclusivamente `llama.cpp` con soporte `sensenova_loop`; se requiere el fork `wepiqx/llama.cpp-sensenova-loop` en el commit `61ee5470fe3ad56f3153fb36fb4e88ba44ce83d5`, con `LLAMA_BUILD_SERVER=ON` obligatorio. No es compatible con vLLM, TGI, Ollama ni builds estandar de llama.cpp (fallan con `unknown model architecture: 'sensenova_loop'`).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.00`; el autor advierte explicitamente de no bajar la temperatura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (MERNIK GGUF) | ~9,2B | no disponible | Apache 2.0 | llama.cpp parcheado | Requiere fork especifico; SSM + bucle + mHC |
| Modelos densos de ~8-9B en GGUF (familia Llama/Qwen) | ~8-9B | no disponible | variable | llama.cpp estandar | No comparable en arquitectura; sirven de referencia de tamano |
| Alternativas SSM/hibridas de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Requiere un runtime parcheado: los builds estandar de `llama.cpp` fallan con `unknown model architecture: 'sensenova_loop'`, lo que rompe la portabilidad habitual de los GGUF.
- No se debe re-cuantizar el archivo con recetas genericas como Q4_K_M: eliminar los pines F32 de las puertas SSM provoca degeneracion en bucle y texto incoherente.
- El archivo es text-only; no incluye la torre de vision del modelo base.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no deberia asumirse su disponibilidad en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos de ~9B.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar cargas con contexto largo.
- El fork de runtime es un proyecto personal de un tercero (wepiqx) sobre el fork de GuideboardLabs; conviene evaluar el mantenimiento y la cadena de confianza antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no oficial anade riesgo operativo.

## Enlaces

- Hugging Face (cuantizacion GGUF): https://huggingface.co/wepiqx/SenseNova-Loop-9B-Preview-MERNIK-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Predictor Gnom v5: https://huggingface.co/wepiqx/MERNIK-gnom
- Fork de llama.cpp con soporte sensenova_loop: https://github.com/wepiqx/llama.cpp-sensenova-loop
- Fork upstream de GuideboardLabs: no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada
