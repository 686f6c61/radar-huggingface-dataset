# tillknuesting/qwen-image-2.1-mlx-fast

## Resumen

tillknuesting/qwen-image-2.1-mlx-fast no es un modelo de pesos, sino un renderizador de inferencia en código abierto para ejecutar Qwen-Image-2.1 sobre Apple Silicon mediante MLX. El repositorio ocupa 0,0 GB y contiene únicamente código: los pesos son el checkpoint sin modificar `mlx-community/Qwen-Image-2.1-MLX-4bit` en 4 bits, y los módulos transformer y VAE proceden de mflux 0.20. El autor lo escribió para ejecutar el modelo en un Mac mini M4 con 16 GB de memoria unificada, un equipo muy por debajo de los requisitos habituales de un modelo de difusión de 7B parámetros.

El modelo subyacente, Qwen-Image-2.1, es un modelo unificado de generación texto-a-imagen y edición de imágenes de la familia Qwen, con 7B parámetros en su componente de generación visual y 32 capas Single-Stream DiT. La aportación de este repositorio es de eficiencia: la ruta por defecto produce píxeles idénticos bit a bit a la implementación MLX de referencia y consume un 13 % menos de tiempo a 1024 × 1024, mientras que con prompts largos la ventaja por paso se acerca a 2×.

Su relevancia práctica es doble. Por un lado, demuestra que la reutilización de las claves y valores del texto en un modelo de difusión de flujo único es matemáticamente exacta y no aproximada, lo que permite acelerar sin degradar la salida. Por otro, ofrece modos opcionales (Fast con caché del primer bloque y Turbo con un LoRA de 6 pasos) que bajan una generación de 1024 × 1024 de 619 s a entre 139 y 145 s en el mismo hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único (*Single-Stream DiT*), 32 capas, con VAE; renderizador de inferencia sobre MLX |
| Parametros totales | 7B en el componente de generacion visual del modelo base Qwen-Image-2.1; el repositorio no contiene pesos |
| Longitud de contexto | no disponible (modelo de difusion); el autor documenta prompts de hasta 494 tokens en sus pruebas y una ventana de 407 tokens en la medicion principal |
| Tipos de cuantizacion | 4 bits MLX (checkpoint por defecto); el autor cita GGUF Q4_K_M como referencia en ComfyUI; la guia de Unsloth menciona INT8 y FP8 para el modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | el repositorio no incluye pesos; usa safetensors MLX en 4 bits de `mlx-community/Qwen-Image-2.1-MLX-4bit` (referencia externa en GGUF Q4_K_M) |
| Libreria | mlx |
| Pipeline | text-to-image |
| Hardware objetivo | Apple Silicon con Metal; probado en Mac mini M4 con 16 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una reimplementacion del bucle de inferencia. Qwen-Image-2.1 emplea un transformer de difusion de flujo unico en el que las filas de texto nunca ven la imagen: usan la fila de modulacion t = 0 y atencion causal solo sobre texto. Esa propiedad estructural implica que las claves y valores del texto son constantes durante todo el proceso de denoising, y es la base de la optimizacion principal del renderizador.

Las modificaciones tecnicas documentadas son tres. La primera es la reutilizacion exacta de K/V de texto, activada por defecto: en el paso 1 se envuelve `scaled_dot_product_attention` en `qwen21_attention.py` y se registran las K/V de las llamadas causales; en los pasos posteriores solo se procesan las filas de imagen. La captura se hace desde la pasada conjunta de forma deliberada, porque una pasada de texto aislada de 22 filas redondea de forma distinta a esas mismas filas dentro de una matmul de 598 filas (576, 598 y 1070 filas dan resultados identicos, lo que apunta a un cambio de kernel de matmul cuantizada en MLX para entradas pequenas). La cache ocupa 2 × 32 × tokens × 4096 × 2 bytes, es decir, unos 0,5 MB por token (259 MB con 494 tokens), con una segunda ranura para el prompt negativo cuando se activa CFG. La segunda es un kernel de RoPE fusionado escrito como `mx.fast.metal_kernel`, que reduce cada llamada de 8,64 ms a 0,99 ms a 1024 px; para igualar la salida bit a bit fue necesario usar `precise::fma(a, b, 0)`, porque el compilador de Metal contrae multiplicaciones y sumas en FMAs y alteraba unos 100 de 4,4 millones de valores. El kernel se autocomprueba en la instalacion y recurre a la version de mflux si detecta discrepancias. La tercera es un conjunto de ajustes menores: menos sincronizaciones con el host en el bucle de denoising, carga unica del modelo y del codificado de texto compartida entre semillas, cache de prompts codificados, liberacion del transformer antes de cargar el VAE y tres guardas de memoria.

Los modos opcionales son aproximados o mas lentos: Fast mode aplica una cache del primer bloque (el bloque 0 siempre se ejecuta y los bloques 1 a 31 se omiten mientras el residual del bloque 0 cambie menos que un umbral de 0,08); Turbo carga en tiempo de ejecucion el LoRA Viggle sin fusionarlo, con un calendario fijo de 5 a 8 pasos; tambien hay un sampler DPM++ 2M y un modo True CFG con `noise = neg + g · (pos - neg)`.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 × 1024 y a resoluciones menores, con prompts de hasta al menos 494 tokens.
- Edicion de imagenes, heredada del modelo base Qwen-Image-2.1, que es un modelo unificado de generacion y edicion.
- Salida determinista y verificable en la ruta por defecto: el autor afirma que produce los mismos pixeles que la implementacion estandar de MLX, bit a bit.
- Generacion por lotes con multiples semillas a partir de un mismo prompt, compartiendo una sola carga de modelo y un solo codificado de texto.
- Cache de codificacion de prompts, con clave que cubre el flujo de trabajo de ComfyUI y la identidad del fichero del codificador de texto.
- Modos de aceleracion conmutables: Fast mode (aproximado), Turbo con LoRA de 5 a 8 pasos (aproximado) y sampler DPM++ 2M.
- Control de memoria en tiempo de ejecucion: las guardas abortan el render si quedan mas de 1 GB de memoria MLX retenida tras liberar el transformer, si la memoria libre baja de 2 GB o si el swap crece mas de 1 GB.
- No dispone de tool calling, agentes ni capacidades de audio o vision de entrada; el pipeline declarado es exclusivamente text-to-image.

## Casos de uso

- Generacion de imagenes en local sobre un Mac: el renderizador esta disenado para un Mac mini M4 con 16 GB y no requiere GPU dedicada, por lo que permite generar a 1024 × 1024 sin enviar prompts a servicios externos.
- Produccion por lotes de ilustraciones con semillas multiples: al compartir una unica carga de modelo y un unico codificado de texto entre semillas del mismo prompt, resulta adecuado para variantes de una misma escena con coste marginal bajo.
- Previsualizacion rapida de ideas: el modo Turbo con 6 pasos y el LoRA Viggle completa un 1024 × 1024 en 139 a 145 s, unas 5 veces mas rapido que la referencia en ComfyUI, lo que sirve para iterar sobre composiciones antes de un render final exacto.
- Flujos de trabajo en ComfyUI: el autor compara explicitamente contra ComfyUI con GGUF Q4_K_M y ofrece cache de codificacion de prompts claveada por el flujo de trabajo, de modo que encaja como backend alternativo en instalaciones existentes.
- Prompts largos y detallados: con la reutilizacion de K/V, un prompt de 494 tokens a 384 px corre tan rapido como uno de 22 tokens (2,52 s frente a 2,50 s por paso), lo que habilita descripciones extensas y densas sin penalizacion de tiempo.
- Investigacion sobre difusion eficiente: la implementacion sirve como banco de pruebas reproducible para medir el efecto de cachear K/V de texto o de fusionar kernels en Metal, con datos de tiempo por bloque y por paso.
- Render en equipos con memoria limitada: las guardas de memoria y la liberacion del transformer antes de cargar el VAE permiten ejecutar sin que el Mac entre en swap, util en estaciones de trabajo pequenas o integracion continua.
- Edicion de imagenes: al apoyarse en Qwen-Image-2.1, que es un modelo unificado de generacion y edicion, puede emplearse en flujos de retoque guiado por prompt, siempre que la ruta de edicion este soportada por el renderizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos disponibles son mediciones de latencia y tiempo por paso sobre un Mac mini M4 de 16 GB.

Generacion completa a 1024 × 1024, 25 pasos, prompt de 407 tokens:

| Ruta | Tiempo | Salida |
|---|---:|---|
| mflux 0.20, mismo checkpoint (punto de partida) | 619 s | referencia |
| Este renderizador, por defecto | 536 s | identica pixel a pixel |
| Con Fast mode (cache del primer bloque, umbral 0,08) | 341 s | aproximada |
| Turbo, 6 pasos con LoRA Viggle | 139 a 145 s | aproximada |

Comparacion con ComfyUI en la misma maquina (M4, 1024 × 1024, 25 pasos, `qwen_image_2.1-Q4_K_M.gguf` mediante ComfyUI-GGUF con PyTorch sobre MPS):

| Configuracion | Tiempo | Relativo |
|---|---:|---:|
| ComfyUI, GGUF Q4_K_M | 736 s | 1× |
| Este renderizador, por defecto | 536 s | ~1,3 a 1,4× |
| Este renderizador, Fast mode | 341 s | ~2,1× |
| Este renderizador, Turbo 6 pasos | 139 a 145 s | ~5× |

El autor advierte que la cifra de ComfyUI cubre el trabajo completo incluida la codificacion de texto, mientras que las suyas empiezan despues de esa fase, y que las dos ejecuciones usaron prompts distintos, por lo que publica un rango y no un ratio unico.

Tiempo mediano por paso de denoising (antes y despues de las optimizaciones):

| Caso | Antes | Despues |
|---|---:|---:|
| 384 × 384, prompt de 22 tokens | 2,78 s | 2,50 s |
| 384 × 384, prompt de 494 tokens | 4,99 s | 2,52 s |
| 1024 × 1024 | 22,85 s | 19,82 s |

Datos de eficiencia interna citados por el autor: a 384 px con un prompt de 22 tokens, un paso empuja 598 tokens por 32 bloques, unos 8,5 TFLOP en 2,78 s, es decir 3,07 TFLOPS efectivos; las matmuls en 4 bits consumen 81,5 ms por bloque, el 94 % del paso. Con 494 tokens a 384 px el texto supone el 46 % de la secuencia. El kernel de RoPE fusionado pasa de 8,64 ms a 0,99 ms a 1024 px.

## Requisitos de hardware

- Hardware de referencia: Mac mini M4 con 16 GB de memoria unificada; el renderizador esta pensado para esa clase de equipo.
- Memoria de la cache de K/V de texto: aproximadamente 0,5 MB por token, unos 259 MB con 494 tokens, mas una segunda ranura si se activa CFG.
- Guardas de memoria activas: el render se aborta si queda mas de 1 GB de memoria MLX retenida tras liberar el transformer, si la memoria libre cae por debajo de 2 GB o si el swap crece mas de 1 GB.
- Requisitos del modelo base en otras plataformas: segun la guia de Unsloth, Qwen-Image-2.1 funciona con GGUFs desde 11 GB de VRAM y con INT8 o FP8 desde 24 GB; estos datos corresponden al modelo base fuera de MLX y no al renderizador.
- Cabe en GPU de consumo: si, en el caso de Apple Silicon con memoria unificada. No se documentan pruebas en GPU discretas de consumo para este renderizador.
- Opciones de despliegue: MLX sobre Metal como ruta principal, con integracion en ComfyUI como alternativa comparada por el autor; el ecosistema del modelo base incluye GGUF y cuantizaciones INT8/FP8 para PyTorch.
- Latencia: 536 s por imagen a 1024 × 1024 y 25 pasos en modo por defecto; 341 s en Fast mode; 139 a 145 s en Turbo de 6 pasos. A 384 px, entre 2,50 s y 2,52 s por paso de denoising.
- Throughput: no disponible como imagenes por segundo agregadas; los valores publicados son tiempos por imagen y por paso.
- Ahorro de tiempo respecto a ComfyUI en el mismo equipo: aproximadamente 1,3 a 1,4× en modo por defecto y unas 5× en Turbo, con las salvedades metodologicas indicadas por el autor.

## Comparativa con modelos similares

La comparacion natural no es contra otros modelos de difusion, sino contra otras implementaciones del mismo modelo base, ya que este repositorio no aporta pesos propios. No se dispone de datos de rendimiento de otras alternativas de la misma categoria mas alla de las citadas.

| Implementacion | Framework / hardware | Tiempo a 1024 × 1024, 25 pasos | Fidelidad | Licencia |
|---|---|---:|---|---|
| Este renderizador (por defecto) | MLX, Mac mini M4 16 GB | 536 s | identica pixel a pixel a mflux | MIT |
| mflux 0.20 con el mismo checkpoint | MLX, Mac mini M4 16 GB | 619 s | referencia | no disponible en la informacion proporcionada |
| ComfyUI con GGUF Q4_K_M | PyTorch sobre MPS, Mac mini M4 | 736 s | no disponible | no disponible en la informacion proporcionada |
| toxicdog/Qwen-Image-2.1-MLX | MLX | no disponible | no disponible | no disponible |
| Qwen-Image-2.1 (modelo base) | multiples backends | no disponible | referencia del modelo | no disponible en la informacion proporcionada |

Del modelo base se conocen 7B parametros en el componente de generacion visual y 32 capas Single-Stream DiT, pero no se han proporcionado resultados comparativos de calidad frente a otros modelos texto-a-imagen.

## Limitaciones y advertencias

- El repositorio contiene solo codigo: no incluye pesos, y depende de un checkpoint externo en 4 bits (`mlx-community/Qwen-Image-2.1-MLX-4bit`) y de los modulos transformer y VAE de mflux 0.20. Un cambio de version en mflux puede romper la compatibilidad.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en el mismo dia, con unos diez minutos de diferencia. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- Las cifras de rendimiento proceden de una unica maquina (Mac mini M4, 16 GB) y de mediciones del propio autor, con metodologias no equivalentes entre herramientas: los tiempos de ComfyUI incluyen la codificacion de texto y los del renderizador no, y las ejecuciones comparadas usaron prompts distintos.
- Los modos Fast y Turbo son aproximados por diseno y no reproducen los pixeles de la ruta exacta; el modo Turbo se apoya en un LoRA externo (Viggle) con un calendario fijo de 5 a 8 pasos.
- El autor advierte que fusionar el LoRA Turbo en bf16 pierde cerca del 30 % de la actualizacion, segun Viggle, por lo que la carga sin fusion es un requisito de calidad, no solo una preferencia.
- La correccion bit a bit del kernel de RoPE depende de una comprobacion en tiempo de instalacion; si falla, se recurre a la version de mflux, con la perdida de rendimiento correspondiente.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento del modelo base ni datos de sesgo demografico o cultural en las imagenes generadas.
- No se documentan los idiomas soportados por los prompts. El modelo base es de la familia Qwen, pero no hay confirmacion en la informacion disponible para este renderizador.
- Riesgo de alucinacion visual inherente a los modelos de difusion, especialmente en textos dentro de la imagen, recuentos de objetos y detalles anatomicos; la reutilizacion exacta de K/V no cambia la calidad de la salida, solo el tiempo.
- La licencia MIT corresponde al codigo del repositorio; los terminos aplicables a los pesos del checkpoint y al modelo base Qwen-Image-2.1 deben verificarse por separado antes de un uso comercial.
- El render es lento en terminos absolutos: 536 s por imagen de 1024 × 1024 en el modo exacto, lo que lo aleja de escenarios interactivos salvo en modo Turbo.
- No se declaran capacidades de tool calling, agentes, audio, vision de entrada ni edicion de imagenes soportada explicitamente por este renderizador, aunque el modelo base sea unificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tillknuesting/qwen-image-2.1-mlx-fast
- Checkpoint en 4 bits utilizado: https://huggingface.co/mlx-community/Qwen-Image-2.1-MLX-4bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- mflux: https://github.com/filipstrand/mflux
- LoRA Viggle Turbo: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Guia de Unsloth para ejecutar Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- Otra implementacion MLX del modelo base: https://huggingface.co/toxicdog/Qwen-Image-2.1-MLX
