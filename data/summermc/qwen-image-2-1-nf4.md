# summerMC/qwen-image-2.1-nf4

## Resumen

`summerMC/qwen-image-2.1-nf4` es un paquete completo de generacion de imagenes publicado en HuggingFace que combina el transformer de difusion (DiT) de Qwen-Image-2.1 cuantizado en NF4 con un codificador de texto ligero: un Qwen3.5-0.8B tambien en NF4. Para poder sustituir el codificador original de Qwen-Image-2.1 (basado en Qwen3-VL), el autor entrena un adaptador MLP que proyecta las caracteristicas de 1024 dimensiones del estudiante al espacio de condicionamiento de texto de 4096 dimensiones que espera el DiT. El objetivo es reducir de forma agresiva los requisitos de VRAM de un pipeline de difusion de gran tamano sin perder demasiada fidelidad en el alineamiento texto-imagen.

El modelo base es `Qwen/Qwen-Image-2.1`, en la revision `790c92633540aa0cb11d9abf19eb46d861714758`, y el estudiante usado como codificador de texto es `Qwen/Qwen3.5-0.8B`. El repositorio, de 5,9 GB, contiene el DiT, el text encoder, el adaptador entrenado, el tokenizador, el procesador compatible con Qwen3-VL, el VAE y el scheduler, ademas de scripts de inferencia y de entrenamiento del adaptador. El recuento real de parametros en los ficheros safetensors es de 3.669.279.232, es decir, unos 3,67 mil millones.

Es relevante ahora porque demuestra una via concreta para ejecutar pipelines de difusion de ultima generacion en GPUs de gama media o incluso en entornos de notebook: el autor reporta una ejecucion completa de 768×768 a 30 pasos en una T4 con 8,57 GiB de pico de memoria asignada. El propio autor advierte de que la metrica de validacion (similitud coseno de embeddings de token de 0,9392) es una medida de alineamiento de embeddings y no una garantia de paridad en la calidad de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de Qwen-Image-2.1 en NF4 + text encoder Qwen3.5-0.8B en NF4 + adaptador MLP 1024→4096 |
| Parametros totales | 3.669.279.232 (dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes); el tag del repositorio indica 8-bit. Se menciona torchao 0.18.0 en el entorno de instalacion |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | other; se indica que la Qwen Research License del material base es aplicable |
| Formato de pesos | safetensors, estructura de repositorio diffusers |
| Tamano del repositorio | 5,9 GB |
| Pipeline | text-to-image (`diffusers:QwenImage21Pipeline`) |
| Modelo base | Qwen/Qwen-Image-2.1 (revision 790c92633540aa0cb11d9abf19eb46d861714758) |
| Modelo estudiante (text encoder) | Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

La parte generativa es el DiT de Qwen-Image-2.1, cuantizado en NF4, que se encarga del proceso de denoising de difusion. El cambio estructural importante respecto al modelo original es el codificador de texto: en lugar del codificador basado en Qwen3-VL que usa Qwen-Image-2.1, este paquete emplea un Qwen3.5-0.8B en NF4. Como las dimensiones no coinciden, se anade un adaptador MLP con la secuencia `Linear(1024, 2048) → GELU → Linear(2048, 4096)`, que transforma las caracteristicas ocultas de 1024 dimensiones del estudiante en el espacio de condicionamiento de 4096 dimensiones del DiT. El pipeline invoca el text encoder con `output_hidden_states=True` y toma el ultimo estado oculto, que despues pasa por el adaptador en `float()` y se convierte a `float16`.

El adaptador se destilo a partir del teacher de Qwen-Image (Qwen3-VL) sobre 192 prompts sinteticos de entrenamiento y 32 prompts de validacion. La similitud coseno de los embeddings de token en validacion alcanzo 0,9392. El autor es explicito en que se trata de una metrica de alineamiento de embeddings, no de una garantia de paridad en calidad de imagen, y que la muestra incluida en el repositorio es un resultado experimental. No se documentan en la informacion disponible el numero de tokens de entrenamiento del DiT, la composicion del dataset original ni si hubo fases de RLHF o DPO sobre el modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante el pipeline `QwenImage21Pipeline` de diffusers.
- Condicionamiento de texto a traves de un codificador ligero (Qwen3.5-0.8B) mas un adaptador entrenado, en lugar del codificador original de Qwen-Image-2.1.
- Ejecucion con cuantizacion NF4, lo que reduce la huella de memoria del transformer y del text encoder.
- Procesador compatible con Qwen3-VL y tokenizador propio del estudiante incluidos en el repositorio.
- VAE con soporte de tiling (`pipe.vae.enable_tiling()`), util para reducir picos de memoria en resoluciones altas.
- Script de inferencia auxiliar (`qwen35_inference.py`) que acepta rutas locales e identificadores de repositorio del Hub.
- Script de entrenamiento del adaptador (`train_qwen35_adapter.py`) y metricas de entrenamiento (`qwen35_adapter_training_metrics.json`).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de imagenes en GPUs con VRAM limitada: el paquete esta pensado para ejecutarse con cuantizacion NF4 y, segun el benchmark del autor, completa una generacion de 768×768 a 30 pasos en una T4 con 8,57 GiB de pico, lo que lo hace viable en tarjetas de 16 GB.
- Demos y cuadernos en Colab: la model card incluye una celda unica de instalacion y generacion pensada para ejecutarse tras reiniciar el entorno de ejecucion, con `device_map="cuda"`.
- Prototipado rapido de conceptos visuales: el ejemplo incluido (una tetera de ceramica carmesi sobre una mesa de roble junto a una ventana) ilustra el uso tipico de still-life y fotografia de producto.
- Investigacion sobre destilacion de codificadores de texto en modelos de difusion: el repositorio publica el script de entrenamiento del adaptador, las metricas y el JSON de validacion, lo que permite reproducir o extender el experimento de alineamiento 1024→4096.
- Evaluacion de estrategias de cuantizacion: al estar el DiT y el text encoder en NF4, sirve como banco de pruebas para medir el impacto de la cuantizacion en la fidelidad prompt-imagen.
- Generacion por lotes en pipelines automatizados: al ser un repositorio diffusers estandar (`from_pretrained`), se puede integrar en scripts de produccion de assets siempre que la licencia lo permita.
- Comparacion de alternativas de text encoder: permite medir en la practica cuanto se degrada (o no) la generacion al sustituir el codificador original por un estudiante de 0,8B con adaptador.
- Ahorro de memoria en servidores multiusuario: al reducir el peso del text encoder, libera VRAM para el DiT o para atender mas peticiones concurrentes en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para este modelo. Los unicos datos de rendimiento publicados son los del `benchmark.json` del autor y las metricas de validacion del adaptador:

| Metrica | Valor | Entorno |
|---|---|---|
| Tiempo de denoising | 78,9 s | T4, 768×768, 30 pasos |
| Pico de memoria asignada | 8,57 GiB | T4, 768×768, 30 pasos |
| Similitud coseno de embeddings de token (validacion) | 0,9392 | 32 prompts de validacion |
| Prompts de entrenamiento del adaptador | 192 sinteticos | Destilacion desde el teacher Qwen3-VL |
| Prompts de validacion del adaptador | 32 | Destilacion desde el teacher Qwen3-VL |

El tiempo de denoising de 78,9 s para 30 pasos equivale a unos 2,63 s por paso en una T4 en esas condiciones.

## Requisitos de hardware

- VRAM estimada: el autor reporta 8,57 GiB de pico de memoria asignada para 768×768 y 30 pasos en una T4 con el DiT y el text encoder en NF4. Para resoluciones superiores, el pico deberia crecer; no se publican cifras.
- El repositorio completo ocupa 5,9 GB, lo que sirve como cota inferior del espacio en disco necesario.
- GPU recomendadas: T4 (validada por el autor), y por capacidad de VRAM, cualquier GPU con 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 3090, A100, H100). El modelo cabe en GPUs de consumo de 16 GB.
- Opciones de despliegue: diffusers con `QwenImage21Pipeline.from_pretrained`, bitsandbytes para la carga NF4, torchao 0.18.0 y triton segun el entorno de instalacion indicado. No se documenta soporte para llama.cpp, Ollama, TGI ni formato GGUF, ya que no es un modelo de lenguaje.
- Versionado de dependencias: la instalacion indicada usa diffusers desde git, `transformers>=5.17`, `accelerate>=1.15`, `bitsandbytes`, `torchao==0.18.0` y `triton`, con reinicio de sesion recomendado antes de importar.
- Latencia y throughput: unicos datos disponibles, los 78,9 s de denoising y 8,57 GiB de pico en T4 a 768×768 y 30 pasos. No hay datos de throughput por lote ni de latencias en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| summerMC/qwen-image-2.1-nf4 | 3.669.279.232 (~3,67B) | 768×768 validado; resolucion maxima no disponible | 78,9 s de denoising y 8,57 GiB de pico en T4 a 768×768, 30 pasos; coseno de validacion 0,9392 | other (Qwen Research License del material base) | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B (usado como text encoder estudiante) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras alternativas de generacion texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos frente a otros modelos de generacion de imagen (por ejemplo, familias tipo FLUX o Stable Diffusion), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Licencia: el repositorio declara `license: other` y el autor indica que la Qwen Research License del material base es aplicable. Es imprescindible revisar los terminos de esa licencia antes de cualquier uso comercial, ya que las licencias de investigacion suelen restringir el uso comercial.
- El adaptador se entreno con solo 192 prompts sinteticos y se valido con 32. Es un conjunto muy reducido, por lo que la generalizacion a dominios, estilos o idiomas no cubiertos por esos prompts no esta garantizada.
- La metrica de similitud coseno de 0,9392 mide alineamiento de embeddings de token, no calidad de imagen. El propio autor advierte de que no implica paridad con el modelo original.
- La muestra incluida en el repositorio se describe como resultado experimental, no como resultado de produccion.
- La cuantizacion NF4 del DiT y del text encoder puede introducir perdidas de fidelidad respecto a los pesos en precision completa; no se publican evaluaciones cuantitativas de esa perdida.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido incoherente, texto ilegible en la imagen o composiciones fisicamente imposibles.
- No se documentan los idiomas soportados ni el comportamiento con prompts en idiomas distintos del ingles.
- No se publica la longitud maxima de prompt ni la resolucion maxima soportada, mas alla del caso validado de 768×768.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No hay soporte documentado para formatos de despliegue ligeros tipo GGUF ni para servidores de inferencia como TGI o vLLM; el uso previsto es diffusers en Python.
- Las fechas del repositorio (creado y actualizado en septiembre de 2026) deben verificarse en la pagina de HuggingFace antes de citarlo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/summerMC/qwen-image-2.1-nf4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Revision concreta del modelo base: 790c92633540aa0cb11d9abf19eb46d861714758
- Modelo estudiante usado como text encoder: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de diffusers (instalacion desde git segun la model card): https://github.com/huggingface/diffusers
- Ficheros incluidos en el repositorio: `transformer/`, `text_encoder/`, `qwen35_adapter/adapter.safetensors`, `qwen35_tokenizer/`, `processor/`, `vae/`, `scheduler/`, `qwen35_inference.py`, `train_qwen35_adapter.py`, `qwen35_adapter_training_metrics.json`, `benchmark.json`, `sample_768x768_nf4.png`, `validation.json`
