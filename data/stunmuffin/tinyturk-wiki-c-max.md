# stunmuffin/TinyTurk-Wiki-C-Max

## Resumen

TinyTurk-Wiki-C-Max es un modelo de lenguaje causal de tipo decoder-only, estilo GPT, desarrollado por el proyecto TinyTurk (autor stunmuffin) como parte de un estudio de ablación sobre decisiones arquitectónicas para el modelado del turco a escala minúscula. Con 3.450.688 parámetros (3,45 M), dos capas, dimensión de modelo 448 y una longitud de contexto de solo 384 tokens, es un artefacto de investigación experimental, no un producto. Se distribuye bajo licencia MIT con pesos en formato PyTorch (`pytorch_model.bin`).

El modelo se entrena desde cero sobre un subconjunto de 49.000 artículos de Wikipedia en turco (`barandinho/wikipedia_tr`), tokenizado con un BPE propio de 1.024 tokens (SentencePiece) con una tasa de UNK del 0,078 %. Su relevancia es fundamentalmente metodológica: la familia TinyTurk evalúa tres hipótesis que se apartan del transformer estándar, concretamente que la poca profundidad domina frente a la profundidad, ratios de FFN comprimidos (1,3-2,2x frente a 4x) y escalado monótono del ancho con rendimientos decrecientes (PPL proporcional a N^-0,23). La variante C_max representa la configuración de mayor calidad de la familia, con el mejor comportamiento en morfología y dependencias de larga distancia.

El modelo está pensado exclusivamente para generación de texto en turco sobre dominio Wikipedia. No incorpora ajuste por instrucciones ni alineamiento de seguridad, y sus limitaciones (dominio restringido, vocabulario reducido, contexto corto) lo sitúan como banco de pruebas para investigación sobre eficiencia arquitectónica en lenguas de recursos morfológicamente ricos, más que como herramienta de producción. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, lo que refleja su carácter incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT, Pre-LN) |
| Parametros totales | 3.450.688 (3,45 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (solo pesos PyTorch en `pytorch_model.bin`; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Capas | 2 |
| Dimension del modelo | 448 |
| Cabezas de atencion | 8 |
| Dimensión oculta FFN | 512 (principal) + 256 (micro) |
| Vocabulario | 1.024 BPE (SentencePiece) |
| Codificacion posicional | RoPE (theta = 10000) |
| Normalizacion | RMSNorm (eps = 1e-6) |
| Activacion | GELU |
| Dropout | 0,10 |
| Weight tying | Si |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con normalizacion previa (Pre-LN), dos capas y dimodelo 448 con 8 cabezas de atencion. Emplea RoPE con theta 10000 para la codificacion posicional, RMSNorm con eps 1e-6, activacion GELU, dropout 0,10 y atado de pesos entre la proyeccion de salida y el embedding. El bloque FFN es inusualmente comprimido en relacion con el estandar: 512 de dimension principal mas 256 de una componente "micro", frente al ratio 4x habitual. La familia TinyTurk plantea explicitamente que esta compresion (FFN = 1,3-2,2x d_model) es preferible en este regimen de escala.

El entrenamiento se realiza desde cero sobre un subconjunto de 49.000 articulos de Wikipedia en turco, tokenizado con un BPE propio de 1.024 tokens (SentencePiece) con tasa de UNK del 0,078 %. Los hiperparametros son AdamW (fusionado), learning rate 3e-4, schedule coseno con 5 % de warmup, weight decay 0,01, gradiente recortado a 1,0, batch size 16 y 30 epocas con semilla 42. No se menciona RLHF, DPO ni ningun otro tipo de ajuste por preferencias: es un LM preentrenado en crudo. La innovacion tecnica destacable no es un mecanismo nuevo de atencion, sino el diseno de ablation que concluye que 2 capas superan a 3, 4 y 6 con el mismo presupuesto, y que las diagnosticas estructurales alcanzan su maximo en la configuracion de 2,76 M (variante B) y se degradan a mayor escala.

## Capacidades

- Generacion de texto causal en turco, orientada a dominio enciclopedico (Wikipedia).
- Modelado de morfologia turca y de dependencias de larga distancia dentro de la ventana de 384 tokens; es la configuracion con mejor comportamiento declarado en esos dos ejes dentro de la familia.
- Completado de texto libre a partir de un prompt (por ejemplo, "Turkiye, ").
- Inferencia con muestreo configurable: temperatura y top_k (el ejemplo de la model card usa temperatura 0,7 y top_k 40, con hasta 200 tokens nuevos).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso explicito.
- No dispone de capacidades de vision, audio ni thinking mode.
- Multilingue: no. Solo turco.
- No hay ajuste por instrucciones, por lo que no sigue ordenes ni formato conversacional.

## Casos de uso

- Investigacion sobre eficiencia arquitectonica: servir como punto de comparacion reproducible en estudios de ablation que midan el efecto de profundidad, ancho y ratio de FFN en modelos de menos de 5 M de parametros sobre una lengua aglutinante.
- Generacion de texto turco de dominio enciclopedico: completar fragmentos de articulos estilo Wikipedia cuando el contenido objetivo es descriptivo y factual, aprovechando la perplexity de 10,33 en dominio.
- Estudio de morfologia y tokenizacion: analizar como un vocabulario BPE de solo 1.024 tokens segmenta palabras turcas y que efecto tiene la tasa de UNK (0,078 %) en la generacion de formas aglutinadas.
- Experimentos de destilacion o inicializacion: usar los pesos como punto de partida de bajo coste computacional para probar tecnicas de adaptacion o fine-tuning sobre corpus turcos especificos.
- Docencia y divulgacion: ilustrar de forma tangible, con un modelo de 3,45 M de parametros que cabe en CPU, como funciona un transformer decoder-only con RoPE y RMSNorm desde dentro.
- Pruebas de infraestructura de inferencia: validar pipelines de PyTorch, SentencePiece y `huggingface_hub` con un modelo minimo antes de escalar a modelos mayores, dado su bajo coste de carga.
- Evaluacion de diagnosticas estructurales: reproducir el hallazgo de que las pruebas estructurales fuera de dominio alcanzan su optimo en torno a 2,76 M de parametros y se degradan al crecer, util para quien investigue regimenes de escala.

## Benchmarks y rendimiento

Solo se han publicado metricas de modelado de lenguaje en dominio. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Valor | Conjunto |
|---|---|---|
| Validation loss | 2,3349 | Wikipedia validation (945 muestras) |
| Perplexity | 10,33 | Wikipedia validation (945 muestras) |
| Bits-per-char | 1,4395 | Wikipedia validation (945 muestras) |

En diagnostico fuera de dominio (pruebas estructurales del turco), la model card indica que los resultados completos estan en el paper y que las diagnosticas estructurales alcanzan su maximo en la configuracion de 2,76 M (variante B) y se degradan a escalas mayores, sin que se faciliten cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 3,45 M de parametros, los pesos en FP32 ocupan aproximadamente 13,8 MB (3.450.688 x 4 bytes), mas el estado del optimizador solo si se entrena. La inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con unos pocos cientos de MB libres es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). En la practica el cuello de botella no es el modelo, sino el tokenizador SentencePiece y el bucle de generacion.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en GPUs integradas. Tambien es viable en CPU.
- Opciones de despliegue: el modelo se distribuye como `pytorch_model.bin` con codigo propio (`model.py`, `TinyTurkGPTV27`, `TinyTurkV27Config`), por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin conversion previa. El flujo previsto es PyTorch nativo con `sentencepiece` y `huggingface_hub`.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (mismos benchmarks) para los modelos hermanos, por lo que la comparacion se limita a las caracteristicas declaradas en la model card.

| Modelo | Parametros | Contexto | Perplexity (Wikipedia tr) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyTurk-Wiki-C-Max | 3.450.688 | 384 tokens | 10,33 | MIT | HuggingFace |
| TinyTurk-Wiki-A-Tiny | No disponible | No disponible | No disponible | MIT (presumible) | HuggingFace |
| TinyTurk-Wiki-B-Sweet | ~2,76 M (segun nota del paper) | No disponible | No disponible | MIT (presumible) | HuggingFace |

La model card indica que la variante B, en torno a 2,76 M de parametros, es la que obtiene el mejor resultado en diagnosticas estructurales, mientras que C_max se presenta como la de mayor calidad global en morfologia y dependencias de larga distancia. No se dispone de comparaciones con modelos externos de la misma categoria (por ejemplo, otros LM turcos de escala similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo sobre Wikipedia en turco. El rendimiento en narrativa, dialogo o codigo es degradado.
- Sesgos conocidos: no se documentan sesgos especificos, pero al derivar exclusivamente de Wikipedia en turco hereda el sesgo de cobertura, estilo y punto de vista de ese corpus. No hay filtrado ni evaluacion de sesgos documentada.
- Riesgo de alucinacion: alto en generacion abierta, ya que es un LM preentrenado en crudo sin verificacion factual ni alineamiento; puede producir afirmaciones plausibles pero falsas.
- Limitacion de contexto: 384 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Limitacion de vocabulario: 1.024 tokens BPE es un vocabulario muy pequeno; las palabras poco frecuentes pueden fragmentarse, lo que afecta a la coherencia en vocabulario especializado.
- Idioma: solo turco. No soporta otros idiomas.
- Sin ajuste por instrucciones ni alineamiento de seguridad: no responde a ordenes y puede generar contenido inapropiado sin filtro.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se declara explicitamente como artefacto de investigacion experimental ("Not a product"), por lo que no es adecuado para produccion sin validacion previa.
- Caveat de despliegue: el formato `pytorch_model.bin` con codigo propio requiere cargar `model.py` del repositorio; no hay integracion directa con ecosistemas de inferencia estandar.
- Volumen de entrenamiento reducido: 49.000 articulos y 30 epocas; la capacidad de generalizacion fuera de dominio es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/stunmuffin/TinyTurk-Wiki-C-Max
- Modelo hermano TinyTurk-Wiki-A-Tiny: https://huggingface.co/stunmuffin/TinyTurk-Wiki-A-Tiny
- Modelo hermano TinyTurk-Wiki-B-Sweet: https://huggingface.co/stunmuffin/TinyTurk-Wiki-B-Sweet
- Modelo hermano TinyTurk-Wiki-C-Max: https://huggingface.co/stunmuffin/TinyTurk-Wiki-C-Max
- Dataset de entrenamiento: https://huggingface.co/datasets/barandinho/wikipedia_tr
- Paper: no disponible (la model card lo menciona pero no incluye enlace)
- Repositorio de codigo: no disponible (la model card referencia `model.py` y `example.py` dentro del repositorio de HuggingFace)
- Demo: no disponible
