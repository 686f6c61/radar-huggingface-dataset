# thepatch/uvr-vr-GGUF

## Resumen

UVR VR denoise and de-echo models GGUF es una coleccion de cinco modelos de separacion de fuentes de audio orientados a tareas de reduccion de ruido, eliminacion de eco y dereverberacion, convertidos al formato GGUF por el usuario thepatch. Todos ellos proceden de la arquitectura VR de Ultimate Vocal Remover (UVR), en concreto de las redes `CascadedNet` de UVR 5.1, y se han reempaquetado para su uso con [stems.cpp](https://github.com/betweentwomidnights/stems.cpp), un separador de stems escrito en C++ sobre ggml que funciona en CPU, CUDA, Vulkan y Metal sin depender de Python.

Cada modelo devuelve dos stems: el que selecciona la mascara de la red (primario) y su complementario. La coleccion cubre cinco variantes con distinto tamano y proposito: `uvr_denoise_lite` (4M), `uvr_denoise` (32M), `uvr_deecho_normal` (32M), `uvr_deecho_aggressive` (32M) y `uvr_deecho_dereverb` (56M). El dato de parametros disponible (31.669.659) corresponde a las variantes de 32M.

La relevancia actual de esta publicacion es practica: traslada modelos de la GUI de UVR, originalmente en PyTorch y con una ruta espectral dificil de replicar, a un formato GGUF determinista y portable que reproduce la misma computacion en multiples backends. El autor advierte explicitamente de que no existe una licencia declarada aguas arriba para estos pesos, por lo que su redistribucion se hace bajo esa salvedad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional UVR 5.1 `CascadedNet` (separacion de audio con enmascaramiento espectral sobre STFT) |
| Parametros totales | 31.669.659 (variante de 32M; la coleccion incluye variantes de ~4M, ~32M y ~56M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa ventanas de 256 frames con 64 frames descartados en cada extremo) |
| Tipos de cuantizacion | F32 unicamente |
| Idiomas soportados | no aplica (procesamiento de audio, independiente del idioma) |
| Licencia | other / desconocida (no se declara licencia aguas arriba) |
| Formato de pesos | GGUF |

Detalle de la coleccion:

| Model id | Fichero | Salidas (primario, secundario) | Tamano |
|---|---|---|---:|
| `uvr_denoise_lite` | `uvr_denoise_lite-4M-v1.0-F32.gguf` | noise, denoised | 16.8 MiB |
| `uvr_denoise` | `uvr_denoise-32M-v1.0-F32.gguf` | noise, denoised | 120.8 MiB |
| `uvr_deecho_normal` | `uvr_deecho_normal-32M-v1.0-F32.gguf` | no_echo, echo | 120.8 MiB |
| `uvr_deecho_aggressive` | `uvr_deecho_aggressive-32M-v1.0-F32.gguf` | echo, no_echo | 120.8 MiB |
| `uvr_deecho_dereverb` | `uvr_deecho_dereverb-56M-v1.0-F32.gguf` | no_reverb, reverb | 212.8 MiB |

## Arquitectura y entrenamiento

La red es la `CascadedNet` de UVR 5.1, sin cambios respecto al original. Se trata de una arquitectura convolucional que opera sobre el espectro de la senal: el runtime aplica una STFT Hann periodica con zero padding centrado, utiliza el diseno de bandas de UVR (`4band_v3` para los modelos de 32M/56M y `1band_sr44100_hl1024` para la variante Lite), realiza remuestreo polifasico entre bandas con los filtros almacenados dentro del propio GGUF, y aplica las mascaras de prefilter y sintesis de UVR. Es importante senalar que la salida no es identica byte a byte a la de la GUI de UVR, ya que la sintesis de UVR en Windows utiliza normalmente `sinc_fastest` y sus opciones de agresividad, test-time augmentation, fusion de artefactos y espejado de agudos no estan implementadas. Los detalles se documentan en `docs/VR.md` de stems.cpp.

En cuanto a los datos de entrenamiento, no se proporciona informacion alguna en la model card: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF/DPO (procedimientos que, por otra parte, no aplican a este tipo de modelo). Los checkpoints de origen provienen del mirror [`seanghay/uvr_models`](https://huggingface.co/seanghay/uvr_models) en la revision `6f4fc0c` y fueron verificados por SHA256. La conversion se realiza con `tools/convert_vr.py --preset <...>`: se pliega la BatchNorm en los pesos de convolucion y densos, se descarta la cabeza auxiliar de solo entrenamiento, y el diseno de bandas y los filtros de remuestreo se escriben como metadatos. La arquitectura y los pesos no se modifican; la conversion es determinista y reproducible byte a byte.

## Capacidades

- Reduccion de ruido: separa una senal en dos stems (`noise` y `denoised`), con variante ligera (`uvr_denoise_lite`, 4M) y variante completa (`uvr_denoise`, 32M).
- Eliminacion de eco: `uvr_deecho_normal` y `uvr_deecho_aggressive` separan la senal en `no_echo` y `echo`, con distinto nivel de agresividad.
- Dereverberacion: `uvr_deecho_dereverb` (56M) separa `no_reverb` y `reverb`, util para eliminar reverberacion de sala.
- Salida dual: cada modelo produce el stem seleccionado por la mascara de la red y su complementario, lo que permite conservar o descartar la componente separada.
- Ejecucion multiplataforma: mismo grafo en CPU, CUDA, Vulkan y Metal a traves de ggml.
- Integracion programatica: exponen el mismo C ABI y pueden cargarse por model id mediante `stems-server`.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente un modelo de audio.

## Casos de uso

- Limpieza de locuciones para podcast: aplicar `uvr_denoise` sobre la grabacion bruta para separar el stem `denoised` y eliminar ruido de fondo de sala o de cadena de grabacion antes de masterizar.
- Restauracion de grabaciones de voz con eco: usar `uvr_deecho_normal` o `uvr_deecho_aggressive` para aislar el stem `no_echo` en entrevistas o videollamadas grabadas con retorno acustico.
- Dereverberacion para doblaje: emplear `uvr_deecho_dereverb` para obtener el stem `no_reverb` y reducir la reverberacion de sala en tomas de voz destinadas a postsincronizacion.
- Preprocesado para reconocimiento automatico de voz: limpiar audio ruidoso con `uvr_denoise_lite` o `uvr_denoise` antes de alimentar un sistema ASR, dado el bajo coste computacional que permite integrarlo en un pipeline previo.
- Produccion musical y edicion de stems: separar la componente de ruido o eco en pistas ya grabadas para conservar la version limpia o, a la inversa, reutilizar la componente separada como material creativo.
- Procesamiento por lotes en servidor: mediante `stems-server`, cargar los modelos por id y encadenar denoising y de-echo sobre un catalogo de ficheros sin entorno Python, aprovechando el mismo C ABI.
- Restauracion de archivos historicos: aplicar de-echo y dereverb a grabaciones antiguas para mejorar la inteligibilidad de la voz antes de su archivado o difusion.

## Benchmarks y rendimiento

Los unicos datos publicados son medidas de paridad (SNR en dB) de la salida en C++ frente a la red original de UVR sin modificar y frente al pipeline Python portable de stems.cpp, sobre un extracto musical estereo de 4 segundos, medido el 2026-10-07/09 con ggml `9d0d910b`. CPU: Core Ultra 9 275HX. Vulkan y CUDA: RTX 5070 Laptop. Todas las ejecuciones superan la comprobacion de stems.cpp (coseno >= 0.99999, SNR >= 50 dB). El autor advierte de que este SNR es contra salidas de referencia, no contra grabaciones limpias: mide que el port calcula lo mismo que la red de UVR, no la calidad de la separacion.

| Modelo | Backend | Mask (dB) | Primary (dB) | Secondary (dB) |
|---|---|---|---:|---:|
| DeNoise-Lite | CPU / Vulkan / CUDA | 90.8 / 104.9 / 106.3 | 110.3 / 112.0 / 114.2 | 138.9 / 139.2 / 139.4 |
| DeNoise | CPU / Vulkan / CUDA | 112.3 / 114.1 / 111.4 | 115.1 / 115.8 / 112.7 | 135.1 / 135.1 / 135.1 |
| De-Echo Normal | CPU / Vulkan / CUDA | 118.7 / 119.3 / 110.8 | 123.1 / 122.7 / 115.7 | 110.7 / 110.2 / 103.0 |
| De-Echo Aggressive | CPU / Vulkan / CUDA | 114.8 / 116.1 / 110.2 | 122.0 / 121.3 / 117.1 | 112.9 / 112.2 / 108.0 |
| DeEcho-DeReverb | CPU / Vulkan / CUDA | 119.5 / 121.7 / 77.6 | 120.6 / 119.9 / 76.4 | 106.1 / 105.4 / 61.8 |

DeEcho-DeReverb en CUDA es el unico valor atipico, aunque el autor indica que sigue muy por debajo del umbral de audibilidad. DeNoise tambien pasa en Apple Metal (M4); los modelos De-Echo ejecutan el mismo grafo en Metal pero no se han medido aun. No hay datos de benchmarks de calidad de separacion (SDR, SIR, SAR) ni comparaciones con otros separadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy reducida. Los ficheros F32 ocupan entre 16.8 MiB (Lite), 120.8 MiB (32M) y 212.8 MiB (56M); el consumo en GPU anade el de las operaciones STFT y las ventanas de proceso, por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo RTX 5070 Laptop, usada en las pruebas), Vulkan o Metal (probado en Apple M4 para DeNoise). No requiere GPUs de datacenter como A100 o H100.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo e integrada compatible, e incluso se ejecuta en CPU.
- Opciones de despliegue: `stems.cpp` en sus builds `cpu`, `cuda`, `vulkan` y `metal`; el binario `stems-split` para uso por linea de comandos y `stems-server` para servicio, cargando cada modelo por id. Los paquetes de release (v0.1.3 y posteriores) cargan estos modelos a traves del mismo C ABI que el resto.
- Latencia y throughput: no se proporcionan cifras de latencia ni de throughput. Lo unico disponible son las medidas de SNR de paridad, no de velocidad.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de modelos alternativos en la informacion proporcionada. Como referencia directa de misma funcionalidad, los checkpoints originales en PyTorch (`.pth`) distribuidos con Ultimate Vocal Remover son el equivalente de origen de estos GGUF: comparten red, diseno de bandas y pesos, pero dependen de un runtime Python y de la ruta de sintesis de la GUI. La diferencia principal de esta publicacion es el formato y el runtime, no el modelo subyacente.

| Aspecto | UVR VR GGUF (esta publicacion) | Checkpoint original UVR (`.pth`) | Otros separadores |
|---|---|---|---|
| Arquitectura | `CascadedNet` UVR 5.1 | `CascadedNet` UVR 5.1 | no disponible |
| Parametros | ~4M / ~32M / ~56M segun variante | mismos pesos | no disponible |
| Formato | GGUF (F32) | PyTorch `.pth` | no disponible |
| Runtime | C++/ggml (CPU, CUDA, Vulkan, Metal) | Python / PyTorch | no disponible |
| Licencia | other / desconocida | depende de UVR aguas arriba | no disponible |
| Idiomas | no aplica | no aplica | no aplica |

## Limitaciones y advertencias

- Licencia: no se declara licencia para estos pesos en ningun repositorio aguas arriba. Se redistribuyen con esa salvedad y no debe asumirse ninguna licencia; si el titular de los derechos desea su retirada, puede abrir una discusion en el repositorio. Esto afecta directamente a cualquier uso comercial.
- Paridad no exacta con la GUI de UVR: la sintesis no es byte a byte identica, ya que la GUI usa `sinc_fastest` y esta conversion no implementa agresividad, test-time augmentation, fusion de artefactos ni espejado de agudos.
- El SNR reportado mide fidelidad de la reimplementacion frente a salidas de referencia, no calidad de la separacion sobre audio real, por lo que no debe interpretarse como una medida de rendimiento del modelo.
- Sin datos de sesgos, alucinacion o calidad subjetiva de separacion: no aplica el concepto de alucinacion textual, pero no se han publicado evaluaciones perceptuales (MOS) ni metricas de separacion estandar.
- Cobertura de backends incompleta: los modelos De-Echo no se han medido en Metal, y DeEcho-DeReverb en CUDA presenta un SNR notablemente inferior al de los demas backends.
- Un unico valor atipico conocido (DeEcho-DeReverb en CUDA) conviene verificarlo en produccion antes de confiar en la ruta CUDA para dereverberacion.
- Conversion limitada a F32: no hay variantes cuantizadas, lo que reduce las opciones de optimizacion de memoria, aunque el tamano ya es bajo.
- Uso restringido a tareas de audio: carece de cualquier capacidad de texto, razonamiento, codigo o tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thepatch/uvr-vr-GGUF
- stems.cpp (runtime C++/ggml): https://github.com/betweentwomidnights/stems.cpp
- Ultimate Vocal Remover (UVR, proyecto original): https://github.com/Anjok07/ultimatevocalremovergui
- Mirror de checkpoints de origen: https://huggingface.co/seanghay/uvr_models
- Documentacion de la ruta VR en stems.cpp: `docs/VR.md` dentro del repositorio de stems.cpp
