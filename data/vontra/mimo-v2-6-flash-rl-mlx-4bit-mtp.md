# Vontra/MiMo-V2.6-Flash-RL-MLX-4bit-MTP

## Resumen

MiMo-V2.6-Flash-RL es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso desarrollado por el equipo Xiaomi MiMo. Con 309.000 millones de parametros totales y 15.000 millones activos por token, se posiciona como un modelo de gran escala orientado a generacion de texto, razonamiento y conversacion, con soporte nativo de contexto de un millon de tokens y entradas omnimodales (texto, vision y audio) en su release original.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una conversion comunitaria para Apple Silicon publicada por el usuario Vontra bajo la organizacion TensorFold. Se trata de una cuantizacion MLX de 4 bits (media de 4,257 bits por peso) del backbone de texto de MiMo-V2.6-Flash-RL, que conserva ademas los tensores auxiliares del modelo (predictor MTP, drafter DFlash, codificador de vision, codificador de audio y tokenizador de audio) empaquetados en el repositorio.

Su relevancia actual es doble: por un lado, permite ejecutar un MoE de casi 309.000 millones de parametros en hardware de consumo de gama alta (Mac Studio con 256 GB de memoria unificada) con velocidades medidas de 59,4 tokens por segundo en decodificacion sostenida; por otro, sirve como referencia tecnica de como convertir correctamente tensores de atencion fusionados y escalas FP8 fragmentadas en checkpoints MLX sin romper la salida del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (48 capas, 256 expertos enrutados, 8 expertos activos por token) |
| Parametros totales | 308.778.778.368 (309B) |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens (modelo original; no verificado en esta conversion MLX) |
| Tipos de cuantizacion | 4-bit affine con group size 64 en proyecciones densas; expertos MoE nativos en MXFP4 (group size 32); media de 4,257 bits por peso |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); componentes auxiliares en BF16 upstream |
| Tamano en disco (modelo de texto cuantizado) | ~154 GiB |
| Tamano completo del repositorio | ~160 GiB (171,7 GB reportados por Hugging Face) |
| Libreria | mlx |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso de 48 capas con 256 expertos enrutados y 8 expertos activos por token, lo que da lugar a 309B parametros totales con solo 15B activos por inferencia. El release upstream soporta contexto de un millon de tokens y entradas omnimodales, e incluye componentes nativos de decodificacion especulativa: un predictor MTP (Multi-Token Prediction) de tres capas y un drafter DFlash de cinco capas, ademas de codificadores de vision y audio.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron fases de RLHF o DPO (el sufijo "RL" sugiere entrenamiento con refuerzo, pero no se especifica la metodologia). Esta conversion MLX, realizada por TensorFold, aplica cuantizacion affine de 4 bits con group size 64 a las proyecciones densas y mantiene los expertos MoE en su formato nativo MXFP4 con group size 32. Un detalle tecnico relevante: MiMo-V2.6 almacena tensores de atencion fusionados en orden tensor-parallel y rellena la rejilla de escalas FP8 de forma independiente por shard; la conversion reconstruye esos shards antes de cuantizar, y omitir ese paso produce un modelo que carga pero genera salida corrupta.

## Capacidades

- Generacion de texto conversacional y de proposito general en ingles y chino.
- Razonamiento aritmetico y explicaciones factuales (verificado en pruebas de humo del autor de la conversion).
- Generacion de codigo, incluido Python (verificado en pruebas de humo).
- Soporte nativo de tool calling y function calling en el modelo upstream (no verificado en esta conversion MLX).
- Capacidades de agente y razonamiento multi-paso en el modelo upstream (no verificado en esta conversion).
- Vision: el repositorio incluye el codificador de vision upstream en BF16, pero los runtimes MLX actuales (oMLX, mlx-lm) no ejecutan esa ruta automaticamente.
- Audio: el repositorio incluye codificador y tokenizador de audio upstream, sin integracion funcional en los runtimes MLX actuales.
- Decodificacion especulativa: incluye predictor MTP de 3 capas y drafter DFlash de 5 capas empaquetados, aunque no operativos como drafters en `mlx_lm.generate --draft-model` en el estado actual.
- Contexto largo: el modelo original soporta 1M tokens; esta conversion no documenta pruebas a esa longitud.

## Casos de uso

- Inferencia local de gran escala en Apple Silicon: un Mac Studio con 256 GB de memoria unificada puede ejecutar el modelo cuantizado a 4 bits con un pico de 164,3 GB de memoria y 59,4 tok/s sostenidos, lo que permite disponer de un MoE de 309B en un equipo de sobremesa sin GPU dedicada.
- Prototipado y evaluacion de modelos frontier sin infraestructura cloud: investigadores pueden probar el comportamiento del modelo base Xiaomi en local antes de comprometer presupuesto de GPU en la nube, usando mlx-lm con una sola linea de comando.
- Generacion de codigo asistida en entornos macOS: el modelo produce Python coherente en pruebas de humo y puede integrarse en flujos de trabajo locales de autocompletado o generacion de funciones, aunque sin garantias de tool calling en esta conversion.
- Desarrollo de runtimes MiMo-aware: el repositorio empaqueta MTP, DFlash, vision y audio con manifiestos (`omnimodal/manifest.json`, `mtp/`) especificamente para que desarrolladores de runtimes MLX integren esas rutas; es un caso de uso de ingenieria, no de usuario final.
- Referencia para conversion de checkpoints complejos: sirve como ejemplo documentado de como reconstruir tensores de atencion fusionados en orden tensor-parallel y rejillas de escalas FP8 fragmentadas antes de cuantizar, un problema recurrente al portar modelos de gran escala a MLX.
- Experimentacion con cuantizacion mixta: el uso de 4-bit affine para densas y MXFP4 nativo para expertos permite estudiar el impacto de esquemas de cuantizacion heterogeneos en calidad y velocidad sobre hardware Apple.
- Evaluacion comparativa de decodificacion especulativa: el paquete incluye el drafter DFlash con su mascara de entrenamiento y configuracion JSON corregida, lo que facilita experimentos de decodificacion especulativa en MLX aunque hoy no supere la decodificacion serial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card remite a la model card original de Xiaomi para evaluaciones. Si se han publicado mediciones de rendimiento en hardware Apple Silicon:

| Prueba | Resultado |
|---|---|
| Generacion sostenida, decodificacion de 128 tokens | 59,4 tok/s de media |
| Procesamiento de prompt, 512 tokens | 477,1 tok/s |
| Procesamiento de prompt, 2.048 tokens | 562,8 tok/s |
| Pico de memoria unificada, contexto corto | 164,3 GB |
| Pico de memoria unificada, prompt de 2.048 tokens | 166,8 GB |
| Tamano del modelo de texto cuantizado en disco | ~154 GiB |
| Tamano completo del repositorio | ~160 GiB |

Entorno de medida: Mac Studio M3 Ultra con 256 GB de memoria unificada, oMLX 0.7.0.dev2, MLX 0.32.2 y mlx-lm 0.31.3.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~164-167 GB en pico con la cuantizacion de 4,257 bits por peso; el autor recomienda un Mac con 256 GB para dejar margen al modelo, la cache KV y el resto del sistema.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada de 256 GB (M3 Ultra Mac Studio es el hardware probado). No hay mediciones publicadas para A100, H100 o RTX 4090, y por tamano (154 GiB en disco) el modelo no cabe en ninguna GPU de consumo actual.
- Cabe en GPU de consumo: no. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar el checkpoint cuantizado.
- Opciones de despliegue: mlx-lm (>=0.31.3) mediante `python -m mlx_lm generate`; oMLX 0.7.0.dev2 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: 59,4 tok/s en decodificacion sostenida y 477-563 tok/s en procesamiento de prompt segun longitud, medidos en M3 Ultra de 256 GB.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL MLX 4-bit MTP (esta ficha) | 309B / 15B | 1M (upstream) | MIT | MLX safetensors, mlx-lm, oMLX | Conversion comunitaria 4-bit para Apple Silicon; 59,4 tok/s en M3 Ultra 256 GB |
| MiMo-V2.6-Flash-RL (upstream) | 309B / 15B | 1M | MIT | Pesos originales; recetas de despliegue en la model card original | Modelo base con vision, audio, MTP y DFlash funcionales segun Xiaomi |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables en la informacion disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (MoE de ~300B con ~15B activos) en el material proporcionado, por lo que la comparativa se limita al modelo base y a esta conversion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles y chino, es esperable un sesgo cultural y linguistico hacia esos dos idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; las pruebas de humo del autor solo verifican aritmetica basica, explicaciones factuales y codigo Python, no fiabilidad factual a gran escala.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino; no hay garantia de calidad en castellano ni en otros idiomas. El contexto de 1M tokens corresponde al modelo upstream y no se ha verificado en esta conversion MLX.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. La arquitectura, el entrenamiento y la marca original pertenecen al equipo Xiaomi MiMo.
- Rutas auxiliares no funcionales: oMLX y mlx-lm ejecutan correctamente el backbone de texto, pero no ejecutan automaticamente MTP, DFlash, vision ni audio. Las cifras de velocidad son de decodificacion serial de texto.
- El predictor MTP empaquetado no es un drafter autonomo para `mlx_lm.generate --draft-model` en el estado actual; el drafter DFlash, aunque produce salida greedy identica a la serial en pruebas, no supera la decodificacion serial en el runtime experimental actual.
- Requisito de hardware muy alto: 256 GB de memoria unificada recomendados; no es desplegable en GPU de consumo ni en la mayoria de servidores sin multiples aceleradores.
- Riesgo de conversion: el autor advierte que omitir la reconstruccion de shards tensor-parallel y escalas FP8 produce un modelo que carga pero genera salida corrupta; cualquier re-cuantizacion debe replicar ese paso.
- Estado de integracion: es una conversion comunitaria, no oficial de Xiaomi, y su soporte depende del mantenimiento de TensorFold y de la evolucion de MLX.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/Vontra/MiMo-V2.6-Flash-RL-MLX-4bit-MTP
- Modelo base en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Organizacion TensorFold en Hugging Face: https://huggingface.co/TensorFold
- Repositorio GitHub de Xiaomi MiMo: https://github.com/XiaomiMiMo/MiMo
- Sitio de TensorFold: https://tensorfold.dev
