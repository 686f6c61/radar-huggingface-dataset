# tensorkelechi/chameleon-ar-head

## Resumen

Chameleon AR head es un pequeño módulo de transferencia de estilo desarrollado por tensorkelechi, publicado en HuggingFace como parte del proyecto [chameleon](https://github.com/kelechi-c/chameleon). No es un modelo generativo en sí mismo, sino una "cabeza" (head) que, dadas una o más imágenes de referencia, genera una descripción textual breve de su estilo visual. Esa descripción se usa después para condicionar Qwen-Image 2.1 Turbo como texto o como tokens suaves, sin ajustar el modelo generativo.

La arquitectura es compacta: un MLP proyecta el embedding de estilo de cada referencia (vector de 1152 dimensiones del codificador de MegaStyle, un SigLIP-so400m afinado) a un código de 256 dimensiones; los códigos de varias referencias se promedian en un único "cartucho" de estilo, que alimenta un transformer causal de 4 capas y 1024 de anchura que escribe hasta 144 tokens usando la matriz de embeddings congelada de Qwen3-4B. Existen dos variantes: `head_grid.pt` (59,8M de parámetros, por defecto) y `head_pre.pt` (58,5M, revisión r7 anterior).

Su relevancia reside en el enfoque desacoplado: en lugar de entrenar un difusor por estilo, se describe el estilo una vez y se reutiliza, lo que permite combinar estilos, muestrear estilos aleatorios plausibles mediante un prior gaussiano y mantener el generador intacto. El repo pesa unos 0,5 GB y su licencia restringe el uso a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de proyeccion + transformer causal de 4 capas (anchura 1024, 16 cabezas) que escribe tokens con la matriz de embeddings congelada de Qwen3-4B |
| Parametros totales | 59,8M (`head_grid.pt`) / 58,5M (`head_pre.pt`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 144 tokens de salida por estilo; 20 tokens de memoria (4 del codigo de estilo + 16 de la rejilla 4x4 en `head_grid.pt`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario heredado de Qwen3-4B; salida orientada a descripciones de estilo) |
| Licencia | other (license_name: research-only, uso no comercial) |
| Formato de pesos | Checkpoints PyTorch (.pt): `head_grid.pt`, `code_prior_grid.pt`, `head_pre.pt`, `code_prior.pt` |

## Arquitectura y entrenamiento

El pipeline parte del codificador de estilo de MegaStyle (`Gaojunyao/MegaStyle`, un SigLIP-so400m afinado), que produce un embedding pooled de 1152 dimensiones por imagen de referencia. Un MLP pequeño reduce cada embedding a un codigo de 256 dimensiones y los codigos de varias referencias se promedian en un unico vector z, el "cartucho" de estilo. En la variante por defecto (`head_grid.pt`) se añade la rejilla de caracteristicas 4x4 del codificador, cuyas medias se convierten en 16 tokens de memoria adicionales que conservan detalle local (textura del papel, pinceladas, colores secundarios) que el vector pooled pierde; los codigos sin rejilla usan un sustituto aprendido. El transformer causal de 4 capas (anchura 1024, 16 cabezas) recibe z como 4 tokens de memoria y genera hasta 144 tokens de texto a traves de la matriz de embeddings congelada de `Qwen/Qwen3-4B`, de modo que su vocabulario es el de Qwen. El modelo generativo Qwen-Image 2.1 Turbo no se afina en ningun momento.

El entrenamiento uso 40.000 estilos de MegaStyle-1.4M (shards train-00001 a train-00004, 8 imagenes por estilo) y 1.054 codigos sref de Midjourney (`peteromallet/high-quality-midjouney-srefs`, muestreados 3 veces mas a menudo), con las etiquetas de estilo de `tensorkelechi/chameleon-style-labels` como objetivos. La funcion de perdida fue cross-entropy con teacher forcing sobre el texto de la etiqueta, condicionada por el codigo de 1 a 3 imagenes distintas del mismo estilo. Se optimizo con AdamW (learning rate 3e-4, batch 64, 4.500 pasos, dropout 0,1 y ruido gaussiano 0,05 sobre z), conservando el checkpoint con menor perdida en 128 estilos de validacion de MegaStyle: 0,931 de cross-entropy para `head_grid.pt` (paso 4.500; 0,945 sin su rejilla) y 0,942 para `head_pre.pt` (paso 4.200). La rejilla se omite en el 20% de las muestras de entrenamiento para que la cabeza funcione tambien sin ella. El coste computacional fue minimo: una A100 de 40 GB en Colab, unos 28 minutos por cabeza, tras una pasada unica del codificador de estilo sobre las imagenes.

Ademas, `code_prior_grid.pt` y `code_prior.pt` son distribuciones gaussianas (media y covarianza 256x256) ajustadas a los codigos de estilo que cada cabeza asigna a 4.096 imagenes de entrenamiento (1.024 de cada shard de MegaStyle). Muestrear de ellas produce un estilo nuevo y plausible sin imagen de referencia, con reproducibilidad por semilla.

## Capacidades

- Descripcion textual del estilo visual de una o varias imagenes de referencia (paleta, medio, iluminacion y animo).
- Agregacion de multiples referencias en un unico codigo de estilo (cartucho) mediante promediado de codigos de 256 dimensiones.
- Generacion de estilos aleatorios plausibles por muestreo del prior gaussiano, con reproducibilidad por semilla (misma semilla produce el mismo estilo con la misma cabeza y prior).
- Condicionamiento de Qwen-Image 2.1 Turbo tanto por texto como por tokens suaves, sin ajuste del generador.
- Captura de detalle local (papel, pinceladas, colores secundarios) mediante la rejilla 4x4 de caracteristicas en `head_grid.pt`.
- Funcionamiento sin rejilla de caracteristicas: `head_grid.pt` se entreno omitiendo la rejilla en el 20% de las muestras.
- Compatibilidad con cartuchos y cuadernos existentes de la revision anterior (`head_pre.pt`).

## Casos de uso

- Transferencia de estilo por descripcion: dado un conjunto de imagenes de referencia, el modelo produce una descripcion de estilo que se pasa a Qwen-Image 2.1 Turbo para generar nuevas escenas coherentes con esa estetica, sin entrenar ningun LoRA ni difusor.
- Creacion de bibliotecas de estilos reutilizables: los cartuchos (unos 38 KB con rejilla, 1 KB sin ella) se almacenan y comparten, de modo que un estudio o equipo puede catalogar estilos y aplicarlos a cualquier prompt posterior.
- Exploracion de estilos aleatorios: muestreando del prior gaussiano (`pipe.random(seed)`) se obtienen estilos nuevos y plausibles sin referencia, util para moodboards generativos, ideacion artistica o variacion de identidades visuales con reproducibilidad por semilla.
- Mezcla de referencias: al promediar los codigos de varias imagenes, se pueden combinar estilos (por ejemplo, la paleta de una referencia con la iluminacion de otra) en un unico cartucho.
- Analisis y etiquetado de datasets visuales: la salida textual puede usarse para anotar automaticamente colecciones de imagenes con descripciones de estilo, aprovechando el entrenamiento sobre MegaStyle-1.4M.
- Investigacion en representaciones de estilo: al ser un modulo ligero y desacoplado del generador, sirve como banco de pruebas para estudiar como se codifican y transfieren estilos visuales a espacio textual.
- Prototipado rapido en Colab: el entrenamiento completo de la cabeza requiere unos 28 minutos en una A100 de 40 GB, lo que permite a investigadores reproducir o adaptar el enfoque con bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la perdida de validacion en 128 estilos de MegaStyle retenidos del shard train-00099:

| Checkpoint | Cross-entropy de validacion | Paso |
|---|---|---|
| `head_grid.pt` | 0,931 (0,945 sin la rejilla) | 4.500 |
| `head_pre.pt` | 0,942 | 4.200 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; dado el tamano del modelo (59,8M de parametros) y el repo (0,5 GB), los requisitos son modestos, probablemente del orden de 1-2 GB de VRAM para la cabeza, mas lo que exija el codificador de estilo MegaStyle (SigLIP-so400m) y Qwen-Image 2.1 Turbo si se ejecuta el pipeline completo.
- GPU recomendadas: el entrenamiento se realizo en una A100 de 40 GB (Colab) en unos 28 minutos por cabeza; para inferencia de la cabeza sola, una GPU de consumo deberia bastar (no disponible como dato confirmado).
- Consumer GPU: cabe con holgura en GPUs de consumo actuales para la cabeza; el cuello de botella sera Qwen-Image 2.1 Turbo en el pipeline completo.
- Opciones de despliegue: descarga de checkpoints via `huggingface_hub.hf_hub_download` y uso con la libreria `chameleon` (`from chameleon import serve`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia |
|---|---|---|---|---|
| chameleon AR head (`head_grid.pt`) | Cabeza de descripcion de estilo | 59,8M | Convierte referencias en texto de estilo que condiciona Qwen-Image sin afinarlo | research-only |
| IP-Adapter | Adaptador de imagen para difusores | no disponible | Inyecta embeddings de imagen como tokens suaves en el UNet/difusor | no disponible |
| Style-aligned / LoRA de estilo | Afinado de difusor o tecnicas de atencion | no disponible | Requiere entrenar pesos del generador por estilo | no disponible |

La diferencia clave es que chameleon AR head no modifica el generador: produce una descripcion textual (o tokens suaves) del estilo, lo que permite reutilizar cartuchos ligeros (~38 KB), combinar estilos por promediado y muestrear estilos aleatorios con un prior, frente a los enfoques que exigen un adaptador o LoRA por estilo. Datos numericos de comparacion directa no disponibles.

## Limitaciones y advertencias

- Uso exclusivo para investigacion y fines no comerciales: el modelo se entreno sobre MegaStyle-1.4M, que se publica solo para investigacion, y la licencia `research-only` lo refleja. No es apto para produccion comercial.
- Captura bien paleta, medio, iluminacion y animo, pero el detalle fino (pinceladas, grano, texturas) se transfiere con mucha menos fidelidad.
- Los estilos aleatorios muestreados del prior tienden hacia ilustracion digital pulida y fotografia, los estilos mas frecuentes en los datos de entrenamiento.
- Sesgos del dataset: al derivar de MegaStyle-1.4M y de codigos sref de Midjourney, heredara los sesgos esteticos y de distribucion de esas fuentes (no disponible un analisis de sesgos explicito).
- Riesgo de alucinacion: no disponible como dato publicado; al ser un modelo que genera texto descriptivo a partir de embeddings visuales, pueden producirse descripciones imprecisas del estilo real de la referencia.
- Idiomas de salida: no disponible; el vocabulario es el de Qwen3-4B, pero no se documenta soporte multilingue de las descripciones.
- El repo muestra 0 descargas, por lo que no existe trayectoria comunitaria ni revisiones de terceros que validen su funcionamiento.
- La variante por defecto requiere el archivo de prior correspondiente (`code_prior_grid.pt` para `head_grid.pt`); mezclar cabezas y priors de revisiones distintas puede dar resultados incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensorkelechi/chameleon-ar-head
- Repositorio del proyecto chameleon: https://github.com/kelechi-c/chameleon
- Dataset de entrenamiento: https://huggingface.co/datasets/tencent/MegaStyle-1.4M
- Etiquetas de estilo: https://huggingface.co/datasets/tensorkelechi/chameleon-style-labels
- Codificador de estilo MegaStyle: https://huggingface.co/Gaojunyao/MegaStyle
- Codigos sref de Midjourney: https://huggingface.co/datasets/peteromallet/high-quality-midjouney-srefs
- Modelo base de embeddings congelados: https://huggingface.co/Qwen/Qwen3-4B
