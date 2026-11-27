# vaultpls/LFM3-1.7B-Looped

## Resumen

LFM3-1.7B-Looped es una variante experimental del modelo base LiquidAI/LFM3-1.7B-Base, publicada por el usuario vaultpls en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una modificacion puramente arquitectonica y sin entrenamiento (training-free) que duplica la ejecucion de las capas 8 a 11 del transformer original, aplicando cada pasada con medio paso residual. El resultado es un modelo denso de 28 capas (frente a las 24 del original) que conserva la misma interfaz de generacion y puede ejecutarse con cache KV estandar en llama.cpp.

El modelo parte de la arquitectura hibrida de LFM3, que combina convoluciones cortas (shortconv) con atencion por ventanas deslizantes cada cuatro capas, 2048 dimensiones ocultas y 7680 en el FFN. La intervencion anade cuatro capas nuevas (copia de las 8-11 originales) y reescala las normas post-atencion y post-FFN a 0,5 en originales y copias, de modo que el bloque duplicado implementa un punto fijo amortiguado `h ← h + 0.5 · (G(h) − h)` aplicado dos veces. El numero de parametros pasa de 1,73B a 1,97B.

La relevancia de esta ficha es doble: por un lado, demuestra que es posible obtener mejoras medibles en razonamiento y perplejidad sin entrenamiento adicional, solo reorganizando el grafo computacional; por otro, es un ejemplo de modificacion reproducible y verificable (el autor reporta max|Δlogit| = 0.0 frente a un wrapper de referencia). Es un modelo base, no instruction-tuned, pensado para experimentacion e investigacion sobre loops de profundidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido shortconv/attention (LFM3), con bucle de profundidad en capas 8-11 |
| Parametros totales | 1.972.198.656 (1,97B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 131072 tokens segun el ejemplo de llama-server del autor; no se especifica el maximo nativo del base |
| Tipos de cuantizacion | GGUF Q8_0 publicado (1,84 → 2,10 GB); otros tipos no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del base; uso comercial limitado por umbral de ingresos (seccion 5) |
| Formato de pesos | safetensors, GGUF; incluye codigo custom (`modeling_lfm3.py`, `configuration_lfm3.py`, `lfm3_conv.py`) |
| Capas | 28 (24 originales + 4 duplicadas de las capas 8-11) |
| Dimension oculta | 2048 |
| Dimension FFN | 7680 |
| Atencion | Ventana deslizante cada 4 capas |
| Tamano del repo | 6,1 GB |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B-Base es un transformer hibrido de 24 capas que intercala convoluciones cortas (shortconv) con atencion, aplicando atencion de ventana deslizante solo en una de cada cuatro capas. La intervencion de vaultpls no introduce ningun parametro nuevo aprendido: duplica las capas 8-11 como nuevas capas 12-15, renumera las posteriores y multiplica por 0,5 los tensores `post_attention_norm.weight` y `post_ffw_norm.weight` tanto en las originales como en las copias. Ese reescalado es lo que materializa el amortiguamiento del bucle, porque las post-norms se aplican a la salida de la rama antes de la suma residual, tanto en el codigo de Hugging Face como en `lfm3.cpp` de llama.cpp.

No hay entrenamiento, ni fine-tuning, ni merging, ni datos de calibracion. El autor verifica la equivalencia exacta contra un wrapper de referencia en tiempo de ejecucion (max|Δlogit| = 0.0) y confirma el factor 0,5 en todos los tensores escalados del GGUF. La innovacion tecnica es, por tanto, el bucle de profundidad amortiguado (inspirado en el preprint arXiv 2605.23872), que permite reutilizar capas existentes como un refinamiento iterativo sin anadir capacidad parametrica. El modelo conserva la interfaz estandar de generacion con cache KV, lo que lo hace compatible con el ecosistema llama.cpp sin cambios en el runtime mas alla del soporte de la arquitectura LFM3.

## Capacidades

- Generacion de texto autoregresiva en 16 idiomas (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco).
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple, con mejoras medibles frente al base en ARC, HellaSwag y WinoGrande.
- Modelado de lenguaje general (perplejidad reducida en wikitext).
- Generacion con cache KV estandar y decodificacion compatible con llama.cpp.
- Soporte de plantilla de chat Jinja (`--jinja`), con traza de razonamiento (`reasoning_content`) cuando se usa la plantilla de chat del base.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidad de ejecutarse con `trust_remote_code` en transformers mediante el codigo custom incluido.

## Casos de uso

- Investigacion sobre loops de profundidad: el modelo sirve como caso de estudio reproducible para medir el efecto de reutilizar capas sin entrenamiento, comparando directamente contra el base con los mismos items y semillas.
- Evaluacion de tecnicas training-free en pipelines academicos: permite replicar el experimento de bucle amortiguado y extenderlo a otras ventanas de capas, con la advertencia de que mover la ventana al ultimo cuarto degrada el modelo.
- Generacion de texto multilingue en prototipos: al cubrir 16 idiomas, puede usarse para pruebas de continuacion de texto y perplexidad en entornos de investigacion, aunque al ser un modelo base requiere prompting cuidadoso.
- Benchmarking de inferencia en consumer GPU: con cuantizacion Q8_0 y `-ngl 99` cabe en una RTX 4070, lo que lo hace util para medir throughput y latencia de variantes arquitectonicas en hardware asequible.
- Base para experimentos de decodificacion y plantillas: permite probar el comportamiento de la plantilla de chat del base (incluida la traza de razonamiento y el parametro `enable_thinking`) en configuraciones controladas.
- Comparacion de perplejidad y calibracion: util para estudiar como afecta la duplicacion de capas a la distribucion de probabilidad en wikitext y otros corpus, con metricas pareadas.
- Docencia y divulgacion: ejemplo claro de como el amortiguamiento en las post-norms materializa un punto fijo iterativo, verificable tensor a tensor en el GGUF.

## Benchmarks y rendimiento

| Benchmark | Base | Este modelo | Δ |
|---|---|---|---|
| ARC-Easy 5-shot (n=1000) | 60,8 | 69,2 | +8,4 pp, p=2,4e-9 |
| ARC-Challenge 5-shot (n=1000) | 30,0 | 34,1 | +4,1 pp |
| HellaSwag 0-shot (n=10042) | 53,6 | 54,3 | +0,7 pp, p=0,006 |
| WinoGrande 0-shot (n=1267) | 54,7 | 57,4 | +2,7 pp, p=0,014 |
| ARC-Easy 0-shot (n=2376) | 38,5 | 41,0 | +2,5 pp, p=0,0001 |
| ARC-Challenge 0-shot (n=1172) | 26,1 | 27,7 | +1,6 pp, p=0,073 |
| PIQA 0-shot (n=1838) | 60,3 | 60,6 | +0,3 pp (no significativo) |
| BoolQ 0-shot (n=3270) | 75,4 | 74,8 | −0,6 pp (no significativo) |
| wikitext PPL (HF) | 24,73 | 23,62 | −4,5% |
| wikitext PPL (llama.cpp Q8) | 18,29 | 17,87 | −2,3% |

Throughput en RTX 4070 con Q8_0 y `-ngl 99` (llama-bench aislado): pp512 pasa de 18184 a 16699 t/s y tg128 de 160,31 a 142,55 t/s, es decir, aproximadamente un 11% menos de velocidad de decodificacion y un 14% mas de tamano de fichero.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q8_0 ocupa 2,10 GB, por lo que la inferencia con `-ngl 99` cabe holgadamente en GPUs consumer de 8 GB o mas.
- GPU recomendadas: el autor reporta mediciones en RTX 4070; por tamano, cualquier GPU con al menos 4-6 GB libres es suficiente para Q8_0. Para contextos largos (hasta 131072 tokens) la cache KV crece y conviene mas VRAM.
- Cabe en consumer GPU: si, en RTX 4070 y equivalentes; tambien en GPUs de gama media con suficiente VRAM para el contexto elegido.
- Opciones de despliegue: llama.cpp (requiere arquitectura LFM3, master ≥ `1014775c8`), llama-server con `-fa on` y `--jinja`, y transformers con `trust_remote_code` y `dtype="bfloat16"`. No se documenta soporte de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: en RTX 4070, Q8_0, pp512 de 16699 t/s y tg128 de 142,55 t/s; aproximadamente un 11% mas lento en decodificacion que el base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Looped (este) | 1,97B | hasta 131072 (ejemplo del autor) | LFM Open License v1.0 | Bucle training-free en capas 8-11; mejoras en ARC y perplejidad |
| LiquidAI/LFM3-1.7B-Base | 1,73B | no disponible en la informacion | LFM Open License v1.0 | Modelo base original, 24 capas, sin bucle |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

La comparacion directa mas relevante es contra el propio base, ya que el autor publica metricas pareadas con los mismos items. No se dispone de datos de terceros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base, no instruction-tuned: con la plantilla de chat emite una traza de razonamiento (`reasoning_content`) y devuelve `content` vacio si `max_tokens` es demasiado bajo. Para texto plano conviene usar `/v1/completions` o `chat_template_kwargs: {"enable_thinking": false}`.
- Las ganancias dependen de la configuracion: +8,4 pp en ARC-Easy a 5-shot frente a +2,5 pp a 0-shot. No se ejecutaron los ajustes canonicos de 25-shot en ARC ni 10-shot en HellaSwag.
- El resultado esta validado en un unico modelo, una unica ventana de capas y una unica familia de arquitectura. Mover la ventana al ultimo cuarto degrada el modelo y requiere remedicion.
- Coste: aproximadamente un 11% menos de velocidad de decodificacion y un 14% mas de tamano de fichero respecto al base.
- No se aplico ningun ajuste de seguridad mas alla del que traiga el modelo base; riesgo de sesgos y alucinaciones heredado del base.
- Licencia LFM Open License v1.0 con uso comercial limitado por el umbral de ingresos de la seccion 5; es necesario revisar `LICENSE` y `NOTICE` antes de uso en produccion.
- El modelo no esta afiliado ni respaldado por Liquid AI; "LFM" se usa solo para describir el origen de los pesos.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaultpls/LFM3-1.7B-Looped
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Preprint de referencia del metodo (training-free looping / damped sub-steps): arXiv 2605.23872
- Repositorio llama.cpp (soporte de arquitectura LFM3, master ≥ `1014775c8`): no se proporciona URL en la informacion disponible
- Demo o espacio asociado: no disponible
