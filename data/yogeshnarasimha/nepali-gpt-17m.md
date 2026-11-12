# YogeshNarasimha/nepali-gpt-17m

## Resumen

Nepali GPT 17M es un modelo de lenguaje decoder-only de pequeno tamano (17,3 millones de parametros) entrenado desde cero para nepalí por YogeshNarasimha, autor individual, como parte del proyecto telugu-nepali-lm. Resuelve un problema acotado: disponer de un modelo base minimo, reproducible y de codigo abierto para experimentacion en nepalí, un idioma con recursos limitados en el ecosistema de modelos abiertos. El modelo se entrena exclusivamente sobre la Wikipedia en nepalí (snapshot 20231101) y se distribuye con licencia MIT.

La arquitectura es un transformer decoder-only clasico con 8 capas, 8 cabezas de atencion, anchura 384 y una ventana de contexto de solo 256 tokens. El vocabulario es de 8.000 tokens con tokenizador SentencePiece Unigram. Usa pre-LayerNorm, posiciones aprendidas y embeddings atados (tied embeddings). El checkpoint publicado corresponde a la mejor validacion en la iteracion 5.000.

Es relevante como referencia educativa y como baseline de perplejidad para nepalí, no como modelo de produccion. El propio autor advierte que el entrenamiento se detuvo antes de converger (undertrained) y que el modelo no es adecuado para uso real. Su valor esta en la trazabilidad del pipeline y en los resultados de bits/char frente a baselines de unigrama y bigrama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), pre-LayerNorm, posiciones aprendidas, embeddings atados |
| Parametros totales | 17,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en `model.pt` de PyTorch) |
| Idiomas soportados | nepalí (ne) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, 8 cabezas y dimension de modelo 384, con pre-LayerNorm, embeddings posicionales aprendidos y pesos de embedding compartidos entre entrada y salida. El tokenizador es SentencePiece Unigram con vocabulario de 8.000 piezas. La generacion se realiza con decodificacion autoregresiva estandar (temperatura y top-k en el ejemplo de uso); no se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento.

El entrenamiento se hizo desde cero sobre la Wikipedia en nepalí (snapshot 20231101), con un volumen aproximado de 8-9 millones de tokens. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; es un modelo de modelado de lenguaje puro. El checkpoint publicado es el de mejor validacion en la iteracion 5.000, y el autor indica explicitamente que el modelo seguia mejorando cuando se detuvo el entrenamiento, por lo que esta infraentrenado.

## Capacidades

- Generacion de texto en nepalí en estilo enciclopedico, continuando prompts.
- Modelado de lenguaje y calculo de perplejidad o bits/char sobre texto nepalí.
- Generacion autoregresiva con muestreo por temperatura y top-k.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al nepalí; no se documenta entrenamiento en otros idiomas.
- No es un modelo ajustado por instrucciones: no sigue ordenes de forma fiable.

## Casos de uso

- Baseline de investigacion en modelado de lenguaje nepalí: sirve para comparar perplejidad y bits/char de futuros modelos con un punto de referencia reproducible y de codigo abierto.
- Docencia y experimentacion con transformers desde cero: el repositorio incluye `model.py` y el checkpoint, lo que permite estudiar el pipeline completo de entrenamiento, tokenizacion y generacion en una unica GPU.
- Pruebas de infraestructura de inferencia: por su tamano (17,3 M de parametros, repo de 0,1 GB) se puede desplegar en CPU o en GPU de gama baja para validar pipelines de serving antes de escalar a modelos mayores.
- Generacion de texto enciclopedico de relleno en prototipos de interfaz: util para maquetar demos en nepalí sin depender de APIs externas, asumiendo que el contenido no es factual.
- Investigacion sobre tokenizacion de bajo recurso: el vocabulario de 8.000 piezas permite estudiar el equilibrio entre cobertura y longitud de secuencia en nepalí.
- Evaluacion de tecnicas de mitigacion de alucinacion en modelos pequenos: al inventar hechos de forma consistente, es un caso de estudio controlado para medir estrategias de grounding.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre articulos de test reservados:

| Modelo | Perplejidad (por token) | Bits/char |
|---|---|---|
| Baseline unigrama | 1979,66 | 3,0644 |
| Baseline bigrama | 435,51 | 2,4531 |
| Este GPT | 66,87 | 1,6967 |

La perplejidad depende del tokenizador y no es comparable entre idiomas; el autor recomienda usar bits/char. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 17,3 M de parametros, mas el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060 o superiores, y en portatiles con GPU integrada.
- Opciones de despliegue: el codigo de referencia usa PyTorch puro (`model.py` + `model.pt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no hay ruta directa a esos runtimes sin conversion.
- Latencia y throughput: no disponibles. Por el tamano del modelo y el contexto de 256 tokens, la latencia esperada es muy baja en cualquier hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nepali GPT 17M | 17,3 M | 256 | MIT | Hugging Face (repo 0,1 GB) |
| Modelos GPT pequenos multilingues de referencia | no disponible | no disponible | no disponible | no disponible |
| Modelos especificos para nepalí de mayor tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas comparables para nepalí en la documentacion proporcionada; la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo infraentrenado: el entrenamiento se detuvo a las 5.000 iteraciones sin converger, segun el autor.
- Entrenado solo con Wikipedia en nepalí (8-9 millones de tokens), por lo que el registro es exclusivamente enciclopedico.
- Alucinacion factual elevada: el autor indica que inventa hechos de forma sistematica.
- No es un modelo ajustado por instrucciones; no sigue ordenes ni mantiene dialogos multi-turno de forma fiable.
- Contexto muy corto (256 tokens), insuficiente para documentos o conversaciones largas.
- Monolingue: no se ha entrenado ni evaluado en otros idiomas.
- Sesgos: no se documenta analisis de sesgos; al derivarse de Wikipedia, hereda los sesgos de cobertura y redaccion de esa fuente.
- Licencia MIT: permite uso comercial, pero el autor declara explicitamente que el modelo no es apto para uso en el mundo real.
- Sin cuantizaciones publicadas ni integracion con runtimes de inferencia estandar, lo que limita su despliegue fuera de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/YogeshNarasimha/nepali-gpt-17m
- Repositorio del proyecto: https://github.com/Yogesh-Narasimha/telugu-nepali-lm
- Dataset: https://huggingface.co/datasets/wikimedia/wikipedia
- Paper, blog o demo: no disponible
