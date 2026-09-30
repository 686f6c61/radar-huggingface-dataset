# stunmuffin/TinyTurk-Wiki-A-Tiny

## Resumen

TinyTurk-Wiki-A-Tiny es un modelo de lenguaje causal en turco de 1.382.272 parametros, entrenado desde cero por el autor stunmuffin (proyecto TinyTurk) y publicado bajo licencia MIT. Forma parte de una ablacion arquitectonica sobre diseno de transformers a escala "tiny" para modelado del turco, junto con los modelos hermanos TinyTurk-Wiki-B-Sweet y TinyTurk-Wiki-C-Max. El modelo es un transformer decoder-only estilo GPT con Pre-LN, 2 capas, dimension de modelo 256, 8 cabezas de atencion, RoPE y RMSNorm, con una longitud de contexto de solo 384 tokens.

El modelo resuelve un problema de investigacion, no de producto: explorar como escalan la profundidad, la anchura y la relacion del FFN en presupuestos de parametros extremadamente bajos para un idioma con morfologia rica y aglutinante como el turco. Segun la model card, la familia pone a prueba tres hipotesis: que la poca profundidad domina sobre la profundidad adicional (2 capas superan a 3, 4 y 6 con el mismo presupuesto), que las relaciones de FFN comprimidas (1,3-2,2x d_model en lugar de 4x) son suficientes, y que la anchura escala de forma monotona con retornos decrecientes (PPL proporcional a N^-0,23).

Es relevante ahora como artefacto de investigacion reproducible en la frontera de los modelos sub-millon de parametros, con un tokenizador BPE propio de solo 1024 tokens y un entrenamiento sobre un subconjunto de 49.000 articulos de Wikipedia en turco. No es un modelo de proposito general: es un LM preentrenado en bruto, sin instruction tuning ni alineacion de seguridad, orientado a experimentacion y a inferencia en dispositivos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, Pre-LN |
| Parametros totales | 1.382.272 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (solo pesos en fp32 via `pytorch_model.bin`; sin versiones GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), mas tokenizador SentencePiece (`tokenizer_wiki_bpe_1024.model`) |
| Capas | 2 |
| Dimension del modelo | 256 |
| Cabezas de atencion | 8 |
| FFN hidden dim | 384 (main) + 192 (micro) |
| Vocabulario | 1024 BPE (SentencePiece) |
| Codificacion posicional | RoPE (theta = 10000) |
| Normalizacion | RMSNorm (eps = 1e-6) |
| Activacion | GELU |
| Dropout | 0,10 |
| Weight tying | Si |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT con normalizacion Pre-LN, RoPE como codificacion posicional (theta = 10000) y RMSNorm con eps = 1e-6. La configuracion concreta es de 2 capas, d_model = 256 y 8 cabezas de atencion, con una FFN desdoblada en dos componentes (384 principal y 192 micro), lo que da relaciones FFN/d_model muy por debajo del habitual 4x. Usa GELU como activacion, dropout de 0,10 y weight tying entre la embedding de entrada y la proyeccion de salida. El vocabulario es un BPE SentencePiece de 1024 tokens entrenado especificamente para el corpus, con una tasa de UNK declarada del 0,078 por ciento.

El entrenamiento se hizo desde cero sobre un subconjunto de 49.000 articulos de Wikipedia en turco (dataset `barandinho/wikipedia_tr`). Los hiperparametros declarados son AdamW fusionado, learning rate 3e-4 con schedule coseno y 5 por ciento de warmup, weight decay 0,01, gradient clipping 1,0, tamano de batch 16, 30 epocas y semilla 42. La model card no especifica el numero total de tokens procesados, la composicion exacta del dataset ni si hubo fases de RLHF, DPO o instruction tuning; de hecho, el autor indica explicitamente que es un LM preentrenado en bruto sin ajuste por instrucciones. La innovacion tecnica principal no esta en mecanismos nuevos de atencion, sino en el estudio sistematico de compromisos de escala (profundidad frente a anchura frente a expansion del FFN) documentado en el articulo de la familia TinyTurk; el documento en si no aparece enlazado en la model card.

## Capacidades

- Generacion de texto causal en turco, limitada al dominio enciclopedico de Wikipedia.
- Modelado de lenguaje y calculo de perplejidad sobre texto turco (metrica declarada del modelo: `perplexity`).
- Continuacion de prompts cortos: el ejemplo oficial usa `"Türkiye, "` con `temperature=0.7` y `top_k=40`.
- Tokenizacion BPE especifica de turco con vocabulario de 1024 piezas.
- Ejecucion en CPU o dispositivos con recursos minimos gracias a su tamano (1,38 M de parametros).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- No tiene capacidad multilingue: solo turco.
- No tiene instruction tuning ni alineacion de seguridad, por lo que no sigue instrucciones de forma fiable.

## Casos de uso

- Investigacion sobre escalado a muy baja escala: sirve como punto de referencia de 1,38 M de parametros con configuracion de 2 capas para estudiar como varian perdida y perplejidad frente a modelos mayores de la misma familia (B-Sweet, 2,76 M, y C-Max), manteniendo constante el presupuesto o el corpus.
- Ablacion de arquitectura en profundidad frente a anchura: permite reproducir la hipotesis de que 2 capas superan a 3, 4 y 6 con el mismo presupuesto, ya que sus hiperparametros y semilla (42) estan documentados y son replicables.
- Analisis morfosintactico del turco: con una perplejidad de 12,81 en validacion de Wikipedia, es util para sondear como un modelo minusculo captura aglutinacion y sufijacion, y para comparar tasas de UNK del tokenizador en corpus turcos.
- Evaluacion de corpus y tokenizadores: puede emplearse como modelo de perplejidad barato para comparar variantes de un tokenizador BPE turco o para filtrar/priorizar texto de Wikipedia segun su verosimilitud bajo el modelo.
- Demostraciones educativas de entrenamiento desde cero: al ser un GPT de 2 capas con un `example.py` ejecutable, es adecuado para cursos o talleres donde se explique el pipeline completo (tokenizacion, RoPE, RMSNorm, bucle de entrenamiento) sin necesidad de GPU.
- Prototipado en dispositivos de borde: con pesos de aproximadamente 5,5 MB en fp32 (unos 2,8 MB en fp16), se puede cargar en un movil, una Raspberry Pi o incluso un microcontrolador con suficiente memoria, para experimentos de generacion local de texto turco sin conexion.
- Pruebas de integracion en pipelines de PyTorch: sirve como modelo de humo (smoke test) para validar codigo de carga de checkpoints, tokenizacion SentencePiece y generacion con muestreo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Validation loss | 2,5502 | Wikipedia turca, validacion (945 muestras) |
| Perplexity | 12,81 | Wikipedia turca, validacion (945 muestras) |
| Bits-per-char | 1,5722 | Wikipedia turca, validacion (945 muestras) |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). La model card indica que los diagnosticos estructurales fuera de dominio estan en el articulo de la familia y que el maximo se alcanza en la configuracion de 2,76 M (B), degradandose en escalas mayores, pero no se facilitan cifras concretas ni el enlace al articulo.

## Requisitos de hardware

- VRAM estimada: unos 5,5 MB en fp32 (4 bytes por parametro) y aproximadamente 2,8 MB en fp16, mas el coste marginal de activaciones con contexto de 384 tokens, que es despreciable.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Funciona sin problema en GTX 1650, RTX 3060, RTX 4090 o incluso GPUs integradas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU y en CPU.
- Opciones de despliegue: la model card solo documenta carga manual con PyTorch (`torch.load`), `sentencepiece` y `huggingface_hub`, mas el script `example.py`. No se declara soporte oficial para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni llama-cpp-python, y no se publican pesos GGUF. La conversion a GGUF o a otros formatos requeriria trabajo adicional por parte del usuario, dado que el checkpoint es un `pytorch_model.bin` con las claves `config` y `model_state_dict`.
- Latencia y throughput: no disponible. Dado el tamano, en CPU moderna la generacion de unos cientos de tokens deberia ser del orden de decimas de segundo, pero no hay cifras publicadas por el autor.
- Requisitos de software: `torch`, `sentencepiece` y `huggingface_hub`, mas el fichero `model.py` del repositorio con las clases `TinyTurkGPTV27` y `TinyTurkV27Config`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| TinyTurk-Wiki-A-Tiny | 1,38 M | 384 tokens | MIT | Turco | 2 capas, d_model 256, PPL 12,81 en validacion Wikipedia |
| TinyTurk-Wiki-B-Sweet | 2,76 M (segun la model card) | No disponible | MIT | Turco | Configuracion donde los diagnosticos estructurales alcanzan su maximo |
| TinyTurk-Wiki-C-Max | No disponible | No disponible | MIT | Turco | Configuracion de mayor escala de la familia; el autor senala degradacion en diagnosticos estructurales |
| TinyTurk-v2.7d | 1,12 M | No disponible | No disponible | Turco | Modelo causal turco entrenado desde cero sobre un corpus de relatos cortos; orientado a investigacion y a inferencia en dispositivo |

No disponible comparacion con modelos de referencia de la misma categoria fuera de la familia TinyTurk; los resultados de benchmarks estandar no se han publicado en la informacion proporcionada, por lo que una comparacion cuantitativa con alternativas como GPT-2 small o modelos turcos mayores no puede hacerse con datos.

## Limitaciones y advertencias

- Dominio limitado: entrenado unicamente sobre Wikipedia en turco. El rendimiento en narrativa, dialogo, codigo o texto tecnico se degrada de forma notable, segun el propio autor.
- Vocabulario muy reducido: 1024 piezas BPE implica que palabras raras o morfologia poco frecuente se fragmenten en muchos subtokens, con la consiguiente perdida de calidad.
- Contexto corto: 384 tokens lo inhabilitan para documentos largos, resumen de articulos extensos o conversaciones multi-turno con historial amplio.
- Modelo preentrenado en bruto: no ha pasado por instruction tuning, por lo que no sigue instrucciones de forma fiable y no debe usarse como asistente.
- Sin alineacion de seguridad: no hay RLHF ni DPO; puede generar contenido inapropiado, sesgado o factualmente incorrecto sin filtro alguno.
- Riesgo alto de alucinacion: con 1,38 M de parametros y 2 capas, la coherencia a medio plazo y la fidelidad factual son muy limitadas; no debe usarse para producir contenido que se presente como veridico.
- Sesgos: el corpus de Wikipedia en turco arrastra los sesgos de cobertura, notabilidad y estilo enciclopedico de esa fuente; no se documenta ningun analisis de sesgo.
- Restricciones de licencia: licencia MIT, permisiva, permite uso comercial y modificacion con atribucion y conservacion del aviso de copyright. No obstante, el autor describe explicitamente el modelo como "artefacto de investigacion experimental, no un producto".
- Caveats de produccion: no hay pesos cuantizados ni integracion con servidores de inferencia populares; el repositorio figura con 0 descargas y 0 likes, lo que implica ausencia de validacion externa. La fecha de creacion registrada en HuggingFace es 29 de septiembre de 2026 y la de actualizacion el mismo dia, con un intervalo de unos 16 minutos.
- Ausencia de datos: no se publican numero total de tokens de entrenamiento, composicion detallada del dataset, curvas de entrenamiento ni resultados fuera de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stunmuffin/TinyTurk-Wiki-A-Tiny
- Modelo hermano TinyTurk-Wiki-B-Sweet: https://huggingface.co/stunmuffin/TinyTurk-Wiki-B-Sweet
- Modelo hermano TinyTurk-Wiki-C-Max: https://huggingface.co/stunmuffin/TinyTurk-Wiki-C-Max
- Dataset de entrenamiento: https://huggingface.co/datasets/barandinho/wikipedia_tr
- Perfil del autor en GitHub: https://github.com/stunmuffin/
- Modelo turco relacionado TinyTurk-v2.7d: https://huggingface.co/stunmuffin/TinyTurk-v2.7d
- Space relacionado Tiny Turk AI Whisperer: https://huggingface.co/spaces/strange1122/tiny-turk-ai-whisperer
- Articulo de la familia TinyTurk: referenciado en la model card como "the paper" pero sin enlace disponible
- Ejemplo de uso: `example.py` dentro del repositorio del modelo (enlace directo no disponible)
- Cita bibliografica: `@misc{tinyturk_wiki_a_tiny_2026, ...}` disponible en la model card
