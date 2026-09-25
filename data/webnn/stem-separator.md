# webnn/stem-separator

## Resumen

Stem Separator (webnn/stem-separator) es una exportacion a ONNX del modelo preentrenado HTDemucs v4 de Meta AI, concretamente el checkpoint base (`htdemucs.th`, sin fine-tuning) identificado como `955717e8-8726e21a.th`. El modelo separa una mezcla estereo en cuatro pistas (drums, bass, other y vocals) y esta pensado para ejecutarse integramente en el cliente, dentro del navegador, mediante ONNX Runtime Web con aceleracion WebNN (NPU/GPU) y cascadeo a WebGPU o WASM cuando no hay acelerador disponible.

El repositorio no contiene un modelo nuevo entrenado por el autor: es una conversion de formato de un modelo ya entrenado. La particularidad tecnica es que se exporta solo la parte forward (`fwd-only`) de la red, porque `torch.onnx.export` no puede trazar las operaciones con tensores complejos que usan las etapas STFT/iSTFT de HTDemucs; esas etapas se reimplementan en JavaScript en el cliente, replicando la implementacion original de PyTorch dentro de tolerancia en coma flotante.

HTDemucs v4 es una arquitectura hibrida tiempo-frecuencia de tipo transformer, con una rama de dominio temporal (forma de onda) y otra de dominio frecuencial (espectrograma CAC). El repositorio ocupa unos 0,2 GB, esta publicado con licencia MIT y, segun los datos disponibles, no registra descargas ni likes, por lo que se trata de un artefacto reciente y poco difundido fuera de la demo WebNN Developer Preview de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs v4 (hibrida tiempo-frecuencia con rama transformer), exportada a ONNX en modo forward-only |
| Parametros totales | no disponible (el export consta de ~2,3 MB de grafo y ~168 MB de pesos externos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 343980 muestras (~7,8 s a 44,1 kHz) con 50 % de solapamiento |
| Tipos de cuantizacion | fp16 (export ONNX validado con MAE 9e-4); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de audio; no se declaran idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset fijado) con pesos externos en `onnx/htdemucs_fwd.onnx.data` |

Entradas y salidas declaradas:

| Tensor | Forma | Descripcion |
|---|---|---|
| `x` (entrada) | `[1, 4, 2048, 336]` | Espectrograma CAC normalizado (rama de dominio frecuencial) |
| `xt` (entrada) | `[1, 2, 343980]` | Forma de onda estereo normalizada (rama temporal) |
| `x_out` (salida) | `[1, 16, 2048, 336]` | Espectrograma CAC de 4 stems x 4 canales |
| `xt_out` (salida) | `[1, 8, 343980]` | Forma de onda de 4 stems x estereo |

## Arquitectura y entrenamiento

El modelo base es HTDemucs v4, una red hibrida que combina una rama de dominio temporal, que procesa directamente la forma de onda estereo, y una rama de dominio frecuencial, que opera sobre un espectrograma CAC. La exportacion recoge ambos flujos: la entrada `x` alimenta la parte frecuencial y `xt` la temporal, generando salidas separadas para espectrograma y forma de onda de los cuatro stems. No se realizo ningun entrenamiento ni fine-tuning; se trata exclusivamente de una conversion de formato de un checkpoint ya entrenado por Meta AI, asociado a la configuracion `config_musdb18_htdemucs.yaml`.

La innovacion practica del repositorio es la estrategia forward-only. Dado que `torch.onnx.export` no puede trazar las operaciones de tensores complejos de las etapas STFT/iSTFT, estas se excluyen del grafo ONNX y se reimplementan en JavaScript en el cliente, con un pipeline de pre y post-procesado que replica la implementacion de PyTorch. El procesado se hace por segmentos de 343980 muestras con un solapamiento de 171990 (50 %) y se reensambla mediante overlap-add con pesos triangulares. La conversion se realizo con `convert_htdemucs_fwd_only.py`, script incluido en el repositorio y adaptado de las utilidades de conversion de HTDemucs del fork `RyanMetcalfeInt8/Music-Source-Separation-Training`, orientado a producir un ONNX limpio y con opset fijado para consumo web.

## Capacidades

- Separacion de fuentes en cuatro stems: drums, bass, other y vocals, a partir de una mezcla estereo.
- Inferencia 100 % en el cliente dentro del navegador mediante ONNX Runtime Web.
- Aceleracion por hardware con WebNN sobre NPU o GPU, con fallback en cascada a WebGPU y, finalmente, a WASM (CPU).
- Salida dual: forma de onda estereo por stem y espectrograma CAC de 4 canales por stem.
- Procesado por segmentos con solapamiento y reconstruccion overlap-add, lo que permite tratar pistas de duracion arbitraria.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multilingue (es un modelo de audio; no se declaran idiomas).
- Capacidad especial: ejecucion sin servidor, apta para escenarios donde el audio no debe salir del dispositivo.

## Casos de uso

- Separacion de stems en el navegador con privacidad total: al ejecutarse en cliente, la pista nunca se sube a un servidor, lo que resulta adecuado para material musical no publicado o con restricciones de confidencialidad.
- Karaoke y eliminacion de voz: silenciando o atenuando el stem `vocals` se obtiene una pista instrumental utilizable en karaoke o practica individual.
- Remezcla y produccion musical: disponer de los cuatro stems permite reequilibrar niveles, aplicar efectos por instrumento o crear versiones alternativas de una mezcla.
- Practica de instrumento: extraer el stem `bass` o `drums` por separado da pistas de acompanamiento para estudiar o tocar encima.
- DJ y mashups: la separacion de stems facilita mezclar acapellas y bases de distintas pistas sin depender de versiones oficiales.
- Preprocesado para transcripcion de voz: aislar el stem `vocals` reduce la interferencia instrumental antes de pasar el audio a un sistema de reconocimiento de voz.
- Restauracion y analisis de grabaciones: separar componentes ayuda a inspeccionar o limpiar grabaciones antiguas antes de reeditarlas.
- Herramientas educativas de analisis musical: permite estudiar por separado la linea de bajo, la bateria o la armonia de una pieza dentro de una aplicacion web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (por ejemplo SDR sobre MUSDB18) en la informacion disponible. El material proporcionado incluye unicamente una validacion numerica contra una implementacion de referencia en Python fp32, usando una entrada de onda senoidal y volcando cada etapa intermedia:

| Etapa | Diferencia maxima |
|---|---|
| STFT | 9,5e-7 |
| pre_forward | 7,6e-6 |
| ONNX `fwd` (fp16) | MAE 9e-4 |
| post_forward | 1,8e-7 |

Estos valores miden la fidelidad de la conversion frente a la referencia, no la calidad de separacion musical.

## Requisitos de hardware

- Huella de pesos reducida: ~168 MB de pesos externos y ~2,3 MB de grafo, lo que permite cargar el modelo en memoria de forma holgada en la mayoria de dispositivos.
- VRAM estimada para inferencia: por debajo de 1 GB (estimacion basada en el tamano de los pesos y en el tamano de los tensores de entrada; no confirmada por el autor).
- No requiere GPU dedicada: el diseno prioriza NPU o GPU integrada a traves de WebNN, con fallback a WebGPU y WASM.
- Cabe en GPUs de consumo y en hardware integrado, incluidos portatiles y dispositivos moviles con navegador compatible con WebNN/WebGPU/WASM.
- Opciones de despliegue: ONNX Runtime Web (WebNN, WebGPU o WASM) en el navegador; el propio `.onnx` es reutilizable en otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles; la model card no publica cifras de tiempo por pista ni de throughput.

## Comparativa con modelos similares

| Modelo | Autor / origen | Arquitectura | Stems | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| webnn/stem-separator | webnn (export de HTDemucs v4 de Meta AI) | HTDemucs v4, hibrida tiempo-frecuencia | 4 (drums, bass, other, vocals) | ONNX (fwd-only) | MIT | Cliente (ONNX Runtime Web, WebNN/WebGPU/WASM) |
| HTDemucs / Demucs v4 | Meta AI (facebookresearch/demucs) | HTDemucs v4 | 4 | PyTorch | MIT | Servidor (Python/PyTorch) |
| Spleeter | Deezer | Redes U-Net sobre espectrograma | 2, 4 o 5 | TensorFlow / checkpoint | MIT | Servidor o cliente (TF.js) |
| Open-Unmix (UMX) | SigSep / comunidad | Red recurrente sobre espectrograma | 4 | PyTorch | MIT | Servidor (PyTorch) |

El parametro total de los modelos comparados no se detalla en la informacion disponible. La diferencia principal de webnn/stem-separator frente a las alternativas es que empaqueta HTDemucs v4 en ONNX con recorte forward-only para ejecucion en navegador, mientras que las otras opciones suelen desplegarse en servidor o requieren runtimes distintos.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad de separacion (SDR u otros) en la informacion disponible.
- La calidad de separacion hereda la del checkpoint base de HTDemucs v4 sin fine-tuning; el autor no realizo ningun ajuste.
- Solo separa cuatro stems (drums, bass, other, vocals); no aisla instrumentos como piano, guitarra o cuerdas por separado.
- Las etapas STFT/iSTFT estan reimplementadas en JavaScript, por lo que pueden aparecer divergencias en coma flotante respecto a la version de PyTorch (validadas numericamente, con MAE 9e-4 en la parte fp16).
- El procesado por segmentos con solapamiento puede introducir artefactos de union (stitching) en los limites entre segmentos.
- La ejecucion real depende del soporte de WebNN/WebGPU del navegador; sin aceleracion, el fallback a WASM puede ser notablemente mas lento.
- El modelo esta orientado a audio estereo a 44,1 kHz; no se documenta comportamiento con otras frecuencias de muestreo o configuraciones multicanal.
- No se declaran idiomas ni sesgos (no aplica a texto); no hay informacion sobre sesgos en los datos musicales de entrenamiento.
- Licencia MIT, que permite uso comercial; conviene verificar igualmente las condiciones del checkpoint base de Meta AI (tambien MIT) y de los datos de entrenamiento originales.
- Modelo recien publicado y con 0 descargas segun los datos disponibles, por lo que no cuenta con validacion de la comunidad ni soporte probado en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webnn/stem-separator
- Herramienta de conversion incluida en el repo: https://huggingface.co/webnn/stem-separator/blob/main/tools/convert_htdemucs_fwd_only.py
- Demo Stem Separator (WebNN Developer Preview): https://github.com/microsoft/webnn-developer-preview/tree/main/demos/stem-separator
- Repositorio WebNN Developer Preview: https://github.com/microsoft/webnn-developer-preview
- Proyecto Demucs de Meta AI: https://github.com/facebookresearch/demucs
- Checkpoint base de origen: https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/955717e8-8726e21a.th
- Fork de utilidades de conversion: https://github.com/RyanMetcalfeInt8/Music-Source-Separation-Training
