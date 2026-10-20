# tiny-random/deepseek-v4.1-flash

## Resumen

`tiny-random/deepseek-v4.1-flash` es un checkpoint de depuración de 67.984.458 parámetros (unos 68 M) publicado por el usuario `tiny-random` como Réplica estructural a escala reducida de `deepseek-ai/DeepSeek-V4.1-Flash`. No es un modelo entrenado: sus pesos están inicializados de forma aleatoria a partir de la configuración del modelo original, y su propósito declarado es servir de banco de pruebas para el stack de inferencia, no para generar contenido útil.

El interés no está en sus capacidades, que son nulas por construcción, sino en que conserva la topología del V4.1 Flash original: atención dispersa comprimida con indexador, cuatro corrientes residuales Hyper-Connections, tabla de lookup n-gram Engram, borrador especulativo DSpark/MTP de tres etapas, alineador de visión y empaquetado de cuantización FP4 para expertos con escalas FP8 en bloques de 32x32. Con 1.629 tensores y 96,7 MB en un único `model.safetensors`, permite ejercitar cargadores, kernels y servidores sin reservar los ~510,3 GB que ocupa el checkpoint público completo.

El modelo base del que deriva, DeepSeek-V4.1-Flash, es un transformer decoder-only multimodal (visión + texto) con mezcla de expertos: 40 capas de texto, tamaño oculto 5.120, 64 cabezas de atención con dimensión de cabeza 512, 384 expertos enrutados más uno compartido con top-6 y vocabulario de 129.280 tokens. Esta ficha describe tanto la Réplica tiny como la estructura de referencia del modelo original, indicando en cada caso qué dato procede de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso, atención dispersa comprimida con indexador, Hyper-Connections, Engram y DSpark/MTP; torre de visión (multimodal visión + texto) |
| Parametros totales | 67.984.458 (~68 M) |
| Parametros activos | no disponible (MoE con 32 expertos enrutados + 1 compartido, top-6; el autor no publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible (el ejemplo de despliegue en SGLang fija `--context-length 4096`) |
| Tipos de cuantizacion | FP4 en expertos enrutados; FP8 en la mayoría de las demás lineales; escalas UE8M0; bloques de 32x32; `dtype` de configuración bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 96,7 MB, 1.629 tensores) |
| Capas de texto | 6 (frente a 40 en el modelo original) |
| Tamano oculto | 128 (frente a 5.120 en el original) |
| Cabezas de atencion / dim. de cabeza | 4 / 512 (448 sin RoPE + 64 RoPE); 1 cabeza KV |
| Expertos | 32 enrutados + 1 compartido, top-6; intermedio MoE de 256 |
| Vocabulario | 129.280 tokens (BOS 0, EOS 1, PAD 2, imagen 129.264) |
| Torre de vision | 2 capas, anchura 64, 4 cabezas; patch 14, downsample 3 |

## Arquitectura y entrenamiento

La Réplica se generó instanciando la implementación oficial de inferencia de DeepSeek V4.1 (revisión fijada por el autor) en el dispositivo `meta` y convirtiendo después su estado en tiempo de ejecución a la representación de checkpoint pública de Hugging Face. Por eso los nombres de tensor siguen el esquema del stack de inferencia (`inference/model.py`) y no la convención habitual de transformers, y la configuración es anidada (`text_config` + `vision_config`) con un `quantization_config` compartido. El autor indica que el `config.json` y el índice del checkpoint de las releases original y 1017 son idénticos byte a byte en nombres de tensor (96.085), de modo que el árbol fuente 1017 actúa como estructura ejecutable autoritativa.

Se preservan las piezas estructurales, con anchuras y cadencias reducidas: atención dispersa comprimida (2 capas solo sliding-window, 2 con ratio 2 y 2 con ratio 1 en el backbone; 3 solo sliding-window en el MTP), capas fuente de KV e índice en 1 y 3 con dimensión de cabeza de índice 128, proyecciones de baja dimensionalidad Q/O (q=128, o=128, 2 grupos de salida), cuatro corrientes residuales Hyper-Connections, tablas Engram en las capas 1 y 2 (4 cabezas x 64; 6.748 y 7.592 filas) y borrador especulativo DSpark/MTP de tres etapas con objetivos en las capas 3, 4 y 5, rango de Markov 16 y 8 expertos con top-3. La torre de visión conserva el alineador y el esquema de patch/downsample. En el original estas cifras son: 40 capas, hidden 5.120, 64 cabezas, 384 expertos enrutados + 1 compartido con top-6, intermedio MoE 2.304, Engram en capas 1 y 14 con 8 cabezas x 256 y ~384 M de filas por tabla, y DSpark de 3 etapas con objetivos en 37, 38 y 39.

No hay entrenamiento: los pesos son aleatorios. La model card no documenta datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO para el modelo original, por lo que esos datos figuran como no disponibles. La innovación técnica que sí queda expuesta es la combinación de atención dispersa comprimida con indexador, Hyper-Connections, lookup Engram y decodificación especulativa integrada en un único checkpoint, además del empaquetado FP4 de expertos con escalas de bloque FP8.

## Capacidades

- No tiene capacidades funcionales de generación: los pesos son aleatorios, por lo que la salida de texto es incoherente por diseño.
- Expone la interfaz multimodal completa (visión + texto): acepta `image_token_id` 129.264 y contiene torre de visión y alineador, lo que permite probar el camino de preprocesado de imagen.
- Sirve para validar tool calling y plantillas conversacionales solo a nivel de formato: el pipeline es `text-generation` y la etiqueta es `conversational`, pero no hay razonamiento detrás.
- Mantiene el vocabulario y los IDs especiales del original (129.280 tokens; BOS/EOS/PAD/imagen), útil para verificar tokenizadores y máscaras.
- Conserva los puntos de anclaje del borrador especulativo DSpark/MTP de tres etapas, lo que permite probar decodificación especulativa y aceptación de tokens.
- Compatible con endpoints (`endpoints_compatible`) a nivel de metadatos del repositorio.
- Soporte multilingüe: no disponible.

## Casos de uso

- Pruebas de integración de SGLang: el ejemplo de la model card arranca el servidor con `--attention-backend dsv4`, `--moe-runner-backend flashinfer_mxfp4`, `--speculative-algorithm DSPARK`, TP=2 y `--disable-custom-all-reduce`, sin necesidad de dos GPU con 500 GB de pesos. Es el escenario principal para el que se publicó.
- Validación de kernels de cuantización FP8/FP4: al conservar el empaquetado FP4 de expertos, las escalas UE8M0 y los bloques 32x32, permite comprobar rutas de dequantización y fusión de kernels con un checkpoint de 96,7 MB.
- CI de cargadores de Hugging Face: los 1.629 tensores y el esquema de nombres del stack de inferencia sirven para testear `trust_remote_code`, conversión de estado y mapeo de índices en pipelines automatizados.
- Depuración de atención dispersa: las capas con ratio 1, ratio 2 y sliding-only, más el indexador, permiten verificar máscaras, selección de bloques y fuentes de KV/índice en un modelo de 6 capas.
- Pruebas de memoria y CUDA Graph: el autor validó TP=2 con DSpark/MTP y CUDA Graph en dos NVIDIA H20, de modo que el checkpoint sirve para medir consumo de caché KV, reparto por rango y estabilidad del grafo sin coste de infraestructura.
- Verificación de preprocesado multimodal: con la torre de visión reducida y el mismo esquema de patch 14 y downsample 3 se pueden probar formas de entrada, alineación de tokens de imagen y límites del tokenizador.
- Desarrollo de harness de evaluación: permite ensayar el cableado de benchmarks (carga, prompts, extracción de respuestas) antes de lanzarlos contra el modelo real, sin obtener métricas válidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido sobre un checkpoint con pesos aleatorios, y el autor no reporta cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 96,7 MB, por lo que la carga en transformers cabe holgadamente en menos de 1 GB incluyendo overhead de runtime; el dato exacto de VRAM pico no está publicado.
- GPU consumer: sí, cualquier GPU con soporte para las operaciones de FP8/FP4 del stack (RTX 40xx/50xx, A100, H100/H20, entre otras) puede alojar los pesos; la validación oficial se hizo en 2x NVIDIA H20.
- Configuración de referencia validada: TP=2 en dos NVIDIA H20, Python 3.12.13, CUDA 13.0, torch 2.14.1, SGLang `0.5.23.dev384+g9ab74b851`, FlashInfer 0.7.2 y Transformers 5.19.0.
- Despliegue: transformers (librería declarada) y SGLang con backend `dsv4` y `flashinfer_mxfp4`. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI; consúltese como no disponible.
- El ejemplo de SGLang exige una build preview/main con soporte de DeepSeek-V4.1, `--trust-remote-code`, `--tp-size 2`, `--ep-size 1`, `--context-length 4096`, `--max-total-tokens 4096`, `--chunked-prefill-size 512` y `--mem-fraction-static 0.5`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| `tiny-random/deepseek-v4.1-flash` | 67.984.458 (~68 M) | no disponible | no disponible | safetensors, 96,7 MB | Depuración estructural |
| `deepseek-ai/DeepSeek-V4.1-Flash` | no disponible en la informacion (checkpoint de 96.085 tensores, ~510,3 GB) | no disponible | no disponible | safetensors, FP8/FP4 | Modelo multimodal de producción |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` | no disponible (misma estructura de tensor que el anterior) | no disponible | no disponible | safetensors | Implementación de referencia del stack de inferencia |

Las tres entradas comparten familia y topología, pero solo la primera está pensada para pruebas. No se han encontrado en la información proporcionada otros checkpoints de depuración comparables de otras familias con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto, código ni razonamiento utilizables. Cualquier uso en producción o en una demo pública dará resultados sin sentido.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribución; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Idiomas no declarados: no hay garantía de cobertura lingüística, y el tokenizador heredado del original no implica calidad en ningún idioma.
- Longitud de contexto no documentada: los 4.096 tokens del ejemplo de SGLang son un parámetro de arranque, no una especificación del modelo.
- Dependencia fuerte del stack: requiere `trust_remote_code`, esquema de nombres del stack de inferencia de DeepSeek y una build de SGLang con soporte V4.1; el `head_dim` de 512 y el indexador de 128 están fijados por el ABI de caché y kernels de SGLang, lo que limita la portabilidad a otros motores.
- El propio ejemplo exige TP=2, de modo que no es un despliegue de una sola GPU sin adaptar la configuración.
- Las tablas Engram y la torre de visión están drásticamente reducidas (4 cabezas x 64 y 2 capas), por lo que no reproducen fielmente el comportamiento del original en esas rutas.
- No hay datos de sesgos, alucinación ni robustez: al no haber entrenamiento, esas propiedades no son medibles; en el modelo base tampoco se documentan en la información disponible.
- No debe usarse como referencia de rendimiento del V4.1 Flash: la equivalencia es topológica, no funcional, y el número de tensores y anchuras difieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiny-random/deepseek-v4.1-flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Implementación de referencia citada en la model card: `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`)
- Revisión del modelo base usada en la generación: `314113f8a7dadb388215396ba5fbee2c610a04d6`
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no se han encontrado papers, blogs ni demos adicionales.
