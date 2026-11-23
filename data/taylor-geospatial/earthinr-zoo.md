# taylor-geospatial/earthinr-zoo

## Resumen

EarthINR Model Zoo es una coleccion de checkpoints de codificadores de localizacion geografica (location encoders) empaquetados en formato `safetensors` para su uso con la libreria EarthINR. No es un modelo generativo de lenguaje ni un modelo multimodal al uso: cada checkpoint aprende una representacion vectorial densa de una coordenada geografica `(lon, lat)` en grados WGS84, que puede concatenarse con embeddings de sensores (imagenes satelitales, audio, texto) para tareas de aprendizaje automatico geoespacial.

El repositorio, mantenido por `taylor-geospatial`, reagrupa 18 checkpoints procedentes de proyectos de investigacion como SatCLIP, GeoCLIP, SINR, CSP, TTE, TerraNova, GAIR, SLED y Climplicit. El autor ha eliminado todos los componentes no relacionados con la codificacion de localizacion (codificadores de vision, audio y texto, cabezas de clasificacion de especies, decodificadores de tareas y envoltorios legacy en pickle), de modo que cada modelo se carga en PyTorch puro con `safetensors`, sin dependencias de `transformers`, `timm`, `open_clip_torch`, `rshf` ni `geoclip`.

La relevancia actual del zoo radica en estandarizar una API comun `(lon, lat)` en grados para todos los codificadores, gestionar internamente el intercambio de orden `(lat, lon)` nativo de cada modelo, y ofrecer checkpoints ligeros (desde 0,76 MiB hasta 586 MiB) con procedencia y checksum SHA256 documentados. El tamano total del repositorio es de 1,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: `satclip`, `geoclip`, `sinr`, `climplicit`, `tte`, `terranova`, `csp` (codificadores de localizacion) |
| Parametros totales | No disponible (depende del checkpoint; el repo pesa 1,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: coordenada `(lon, lat)`; opcionalmente `month` o `year`) |
| Tipos de cuantizacion | No disponible (pesos en `safetensors`; MIND en fp16, resto sin especificar) |
| Idiomas soportados | No disponible (modelo geoespacial, no linguistico) |
| Licencia | Mixta por modelo: MIT, Apache-2.0, CC-BY-4.0 y `unlicensed` (CSP) |
| Formato de pesos | `safetensors` (un `model.safetensors` y un `config.json` por checkpoint) |

## Arquitectura y entrenamiento

Cada checkpoint implementa una arquitectura distinta segun su proyecto de origen. Los modelos `satclip` (basados en ViT16, ResNet18 y ResNet50) y `sinr` emplean representaciones implicitas de posicion con codificaciones sinusoidales; `geoclip`, `taxabind`, `sled-s1-s2-ls`, `sled-s2-ls` y `gair` usan la arquitectura de GeoCLIP con proyecciones contrastivas; `climplicit` anade una dimension temporal opcional (`month`, 1-12) que se mapea a 256 dimensiones o se concatena en cuatro estaciones (1024 dimensiones en total); `terranova-spatial` y `terranova-st` implementan variantes espacial y espacio-temporal (con `year` entre 1900 y 2035, por defecto 2020); `tte` y `csp` corresponden a codificadores temporales y de especies respectivamente.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada, ya que cada checkpoint hereda el entrenamiento de su repositorio upstream. La innovacion tecnica destacable del zoo es el reempaquetado: se han eliminado codificadores de satelite, audio y texto, cabezas de clasificacion de especies y decodificadores de tareas, dejando unicamente los pesos del codificador de localizacion. Todos exponen una API universal `(lon, lat)` en grados WGS84 y gestionan internamente el orden nativo `(lat, lon)` de cada modelo. El modelo MIND se mantiene en su repositorio canonico separado (`taylor-geospatial/MIND`, `embed_dim=3072` pooled, cabeza de 64, invariable en el tiempo, fp16, 216,5 MiB, licencia MIT).

## Capacidades

- Codificacion de coordenadas geograficas `(lon, lat)` en grados WGS84 a un vector denso de dimension 256, 512, 768 o 1024 segun el checkpoint.
- Soporte de variacion temporal opcional: `month` (1-12) en `climplicit` y `year` (1900-2035) en `terranova-st`.
- Integracion con embeddings de sensores remotos (imagenes satelitales) para tareas de retrieval, clasificacion y regresion geoespacial.
- Uso como caracteristica auxiliar en modelos de vision por satelite, ecologia y ciencias de la Tierra.
- Carga en PyTorch puro sin dependencias de `transformers`, `timm`, `open_clip_torch`, `rshf` ni `geoclip`.
- Compatibilidad con la libreria EarthINR para pipelines de inferencia geoespacial.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo linguistico).

## Casos de uso

- Modelado de distribucion de especies: concatenar el embedding de localizacion con caracteristicas ambientales para predecir presencia o abundancia de especies en coordenadas concretas, usando `csp-inat` o `csp-fmow`.
- Retrieval de imagenes satelitales por ubicacion: emplear `satclip-*` o `geoclip` para indexar y recuperar imagenes de una zona geografica a partir de su coordenada.
- Analisis climatico estacional: usar `climplicit` con el parametro `month` para obtener representaciones que varian estacionalmente en estudios de climatologia.
- Proyecciones temporales de cambio global: emplear `terranova-st` con el parametro `year` para modelar condiciones espaciotemporales en escenarios 1900-2035.
- Enriquecimiento de datasets geoespaciales: anadir embeddings de localizacion como features a modelos tabulares o de deep learning en pipelines de teledeteccion.
- Investigacion en representaciones implicitas: usar `sinr` o `tte` como baseline para estudiar codificaciones neuronales implicitas de posicion.
- Sistemas de geolocalizacion aproximada: combinar `geoclip` o `taxabind` con embeddings visuales para estimar la ubicacion de una imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los checkpoints van de 0,76 MiB a 586 MiB, por lo que caben holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100 para inferencia individual.
- Cabe en GPU consumer: si, en cualquier RTX, GTX o incluso en CPU.
- Opciones de despliegue: PyTorch puro con `safetensors`; la libreria EarthINR es el cliente recomendado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; al ser codificadores ligeros, la latencia por coordenada sera del orden de microsegundos a milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EarthINR Zoo (este repo) | Variable por checkpoint (0,76-586 MiB) | No aplica | 256-1024 dim | Mixta (MIT, Apache-2.0, CC-BY-4.0, unlicensed) | Hugging Face |
| MIND (`taylor-geospatial/MIND`) | 216,5 MiB fp16 | No aplica | 3072 pooled / 64 head | MIT | Hugging Face |
| SatCLIP (upstream `microsoft/SatCLIP-*`) | No disponible | No aplica | 256 dim | MIT | Hugging Face |
| GeoCLIP (upstream `MVRL/geoclip-location-encoder`) | No disponible | No aplica | 512 dim | MIT | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.
- La licencia es mixta por modelo; antes de uso comercial hay que revisar el `config.json` de cada checkpoint para conocer su licencia concreta.
- Los checkpoints `csp-inat` y `csp-fmow` no tienen fichero de licencia en su repositorio upstream (`gengchenmai/csp`); se recomienda contactar con los autores originales (Mai et al., ICML 2023) antes de cualquier uso.
- `RANGE` y `RANGE+` estan excluidos del zoo por ser bases de datos de retrieval, no codificadores de localizacion independientes.
- El modelo MIND no esta incluido en este repositorio; debe descargarse de su repositorio canonico.
- No se documentan sesgos conocidos, pero al derivar de datasets geoespaciales pueden heredar sesgos de cobertura geografica (mayor densidad de datos en America del Norte y Europa).
- La calidad de los embeddings depende del checkpoint elegido; no hay benchmarks publicados en la informacion disponible para comparar su rendimiento relativo.
- El repositorio se creo y actualizo en noviembre de 2026, con 0 descargas y 0 likes; no hay evidencia de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taylor-geospatial/earthinr-zoo
- Repositorio MIND: https://huggingface.co/taylor-geospatial/MIND
- Libreria EarthINR: https://github.com/taylor-geospatial/earthinr
- SatCLIP ViT16-L40: https://huggingface.co/microsoft/SatCLIP-ViT16-L40
- SatCLIP ViT16-L10: https://huggingface.co/microsoft/SatCLIP-ViT16-L10
- SatCLIP ResNet18-L40: https://huggingface.co/microsoft/SatCLIP-ResNet18-L40
- SatCLIP ResNet18-L10: https://huggingface.co/microsoft/SatCLIP-ResNet18-L10
- SatCLIP ResNet50-L40: https://huggingface.co/microsoft/SatCLIP-ResNet50-L40
- SatCLIP ResNet50-L10: https://huggingface.co/microsoft/SatCLIP-ResNet50-L10
- GeoCLIP location encoder: https://huggingface.co/MVRL/geoclip-location-encoder
- EcoGeo (taxabind): https://huggingface.co/MVRL/ecogeo
- SLED S1-S2-LS: https://huggingface.co/geohai/sled-s1-s2-ls
- SLED S2-LS: https://huggingface.co/geohai/sled-s2-ls
- SINR location encoder: https://huggingface.co/MVRL/sinr-location-encoder-1000-cls
- Climplicit: https://huggingface.co/Jobedo/climplicit
- GAIR: https://huggingface.co/PingL/GAIR
- TTE: https://huggingface.co/MVRL/TTE
- TerraNova: https://huggingface.co/crp94/terranova
- CSP (upstream): https://github.com/gengchenmai/csp
- Paper SatCLIP: arXiv:2311.17179
- Paper GeoCLIP: arXiv:2309.16020
- Paper SINR: arXiv:2306.02564
- Paper TerraNova: arXiv:2504.05089
- Paper SLED: arXiv:2503.16683
- Paper GAIR: arXiv:2608.06612
- Paper Climplicit: arXiv:2607.29527
- Paper TTE: arXiv:2305.01118
