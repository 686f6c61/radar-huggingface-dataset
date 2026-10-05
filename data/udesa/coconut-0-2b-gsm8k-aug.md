# UdeSA/coconut-0.2B-gsm8k-aug

## Resumen

Coconut-0.2B-gsm8k-aug es un modelo de razonamiento latente desarrollado por UdeSA (Universidad de San Andrés) que reproduce el método Coconut (Chain of Continuous Thought, Hao et al., 2024) sobre un backbone GPT-2. En lugar de generar cadenas de pensamiento en lenguaje natural token a token, el modelo realimenta un número fijo de estados ocultos (thoughts continuos) como embeddings de entrada antes de cambiar a texto y decodificar la respuesta. De este modo el razonamiento ocurre en un espacio latente continuo en vez de en el espacio discreto de tokens.

El modelo resuelve el problema de la ausencia de un checkpoint público oficial de Coconut para GSM8k. El equipo de UdeSA lo entrenó para disponer de una "rama Coconut simple" con la que comparar su trabajo de halting latente (PonderNet) en `UdeSA/ALST-0.2B-gsm8k-aug`, y para poder inicializar en caliente su variante Coconut + halting. El autor indica explícitamente que se trata de una reproducción, no de un método nuevo, y que bajo la receta original reproduce la cifra del propio paper (34,1 %) para GPT-2.

El modelo es de tamaño reducido (etiquetado como 0,2B, con backbone GPT-2), está licenciado bajo MIT y solo soporta inglés. Se distribuye en dos snapshots: una hoja `cot/` (modelo stage-0 de chain-of-thought estándar) y una hoja `coconut/` (el modelo Coconut con el bucle latente). Por su tamaño y su enfoque experimental está pensado para investigación sobre razonamiento latente más que para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con envoltorio Coconut de razonamiento latente continuo |
| Parametros totales | Aproximadamente 0,2 mil millones (etiqueta del modelo; backbone GPT-2 base = 124 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible explícitamente; GPT-2 base usa 1024 tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; pesos en formato PyTorch) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Etiqueta `safetensors` en el repo; la hoja `coconut/` se carga con `pytorch_model.bin` (`torch.load`) y la hoja `cot/` con `from_pretrained` |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Vocabulario (hoja coconut) | 50260 (GPT-2 + 3 marcadores latentes: `<|start-latent|>`, `<|end-latent|>`, `<|latent|>`) |
| Vocabulario (hoja cot) | 50257 (GPT-2 estándar) |
| Profundidad latente fija | K = 6 (`c_thought` 2 × `max_latent_stage` 3) |
| Modelo base | openai-community/gpt2 |
| Dataset | GSM8k-Aug (385620 train / 500 validación whynlp / 1319 test) |
| Tamaño del repo | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura parte de GPT-2 (transformer decoder-only) y añade el mecanismo Coconut: en lugar de decodificar tokens de razonamiento en lenguaje natural, el modelo retroalimenta un número fijo de estados ocultos como embeddings de entrada (thoughts continuos). Tras un número prefijado de pasos latentes, el modelo cambia al modo texto y decodifica la respuesta final. La profundidad latente está fijada en K = 6, obtenida como `c_thought 2 × max_latent_stage 3` (3 grupos latentes de 2 thoughts continuos cada uno). Coconut no incorpora halting, de modo que este único punto de operación constituye todo el modelo. La implementación requiere la clase `Coconut`, que envuelve el backbone y ejecuta el bucle latente; no se carga directamente con `from_pretrained`.

El entrenamiento reproduce la receta del paper original sin cambios en los hiperparámetros: AdamW con lr 1e-4, weight decay 0,01, batch 32, `c_thought 2`, `epochs_per_stage 3`, `max_latent_stage 3`, `pad_latent_to_max True`, `uniform_prob 0.0`, 25 épocas por etapa, seed 0 y precisión bf16. El proceso consta de dos ejecuciones secuenciales: primero un SFT de chain-of-thought en la etapa 0 (con `--cot True`), y después el currículum latente inicializado en caliente desde ese modelo (con `--coconut True`). Los datos de entrenamiento son GSM8k-Aug, con 385620 ejemplos de entrenamiento, 500 de validación (whynlp) y 1319 de test. No se documenta uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto autoregresiva sobre un backbone GPT-2.
- Razonamiento aritmético/matemático orientado a problemas de tipo GSM8K mediante razonamiento latente continuo.
- Razonamiento en espacio latente: retroalimentación de estados ocultos como embeddings de entrada antes de la decodificación textual.
- Modo chain-of-thought explícito disponible en la hoja `cot/` (modelo stage-0 con vocabulario GPT-2 estándar).
- Capacidad de servir como punto de partida (warm-start) para variantes con halting (por ejemplo, Coconut + PonderNet).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte específico para agentes ni razonamiento multi-paso más allá del bucle latente interno.
- Capacidades multilingües: solo inglés.
- No se documentan capacidades de visión ni de audio.
- No se documentan modos especiales tipo "thinking mode" más allá del propio mecanismo latente de Coconut.

## Casos de uso

- Investigación sobre razonamiento latente: el modelo sirve como rama Coconut de referencia para comparar contra métodos alternativos de halting latente, tal y como lo plantea el propio autor frente a `UdeSA/ALST-0.2B-gsm8k-aug`.
- Reproducción de resultados académicos: permite verificar de forma independiente la cifra de GSM8K del paper de Coconut (34,1 %) usando GPT-2 como backbone.
- Punto de partida para experimentos de currículum latente: la hoja `coconut/` está pensada para inicializar en caliente variantes con halting (Coconut + PonderNet).
- Estudio comparativo CoT frente a razonamiento latente: al incluir la hoja `cot/` con un modelo chain-of-thought estándar y la hoja `coconut/` con el modelo latente, permite medir la diferencia de rendimiento (43,14 % frente a 34,57 % en GSM8K test) en condiciones controladas.
- Prototipado de evaluación de razonamiento matemático: útil para montar pipelines de evaluación sobre GSM8K y GSM8k-Aug en entornos de investigación con recursos limitados.
- Docencia y divulgación técnica: por su pequeño tamaño y su licencia MIT, permite ilustrar el funcionamiento de Coconut y del razonamiento en espacio continuo sin requerir hardware de gran escala.
- Base para experimentos de eficiencia en razonamiento: permite estudiar si el razonamiento latente reduce el coste de decodificación frente a cadenas de pensamiento textuales largas.

## Benchmarks y rendimiento

GSM8K test, n = 1319, decodificación greedy. Época seleccionada sobre el split de validación de 500 filas (whynlp); test reportado una sola vez.

| Hoja | Modelo | Precisión en test | Profundidad | Nota |
|---|---|---|---|---|
| `coconut/` | Coconut, profundidad latente fija K = 6 | 34,57 % | K = 6 | reproduce el 34,1 % del paper |
| `cot/` | SFT de chain-of-thought etapa 0 | 43,14 % | texto | warm-start del que parte el currículum |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un backbone de ~0,2 mil millones de parámetros, la inferencia en precisión completa (fp32) requiere del orden de 1 GB de pesos, y en bf16 alrededor de 0,5 GB; a ello hay que sumar el coste de activaciones y del bucle latente.
- GPU recomendadas: no documentadas por el autor. Por tamaño, el modelo cabe holgadamente en cualquier GPU consumer moderna (RTX 3060/4070/4090 y superiores) e incluso en CPU para pruebas puntuales.
- ¿Cabe en GPU consumer? Sí, previsiblemente en la práctica totalidad de GPU consumer actuales dado el tamaño del backbone (124 M de parámetros).
- Opciones de despliegue: la hoja `cot/` es un `GPT2LMHeadModel` estándar y carga con `transformers` (y por tanto es compatible con ecosistemas estándar). La hoja `coconut/` no carga con `from_pretrained`: requiere la clase `Coconut` del repositorio del proyecto y `torch.load` sobre `pytorch_model.bin`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UdeSA/coconut-0.2B-gsm8k-aug (`coconut/`) | ~0,2B (GPT-2) | no disponible (GPT-2: 1024) | 34,57 % (K = 6) | MIT | HuggingFace |
| UdeSA/coconut-0.2B-gsm8k-aug (`cot/`) | ~0,2B (GPT-2) | no disponible (GPT-2: 1024) | 43,14 % | MIT | HuggingFace |
| UdeSA/ALST-0.2B-gsm8k-aug | ~0,2B (GPT-2) | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace |

Las alternativas comparables directas (mismo backbone GPT-2 y mismo dataset) son las variantes del propio ecosistema UdeSA. No se dispone de datos de modelos externos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es una reproducción, no un método nuevo, y que no existe un checkpoint público oficial de Coconut para GSM8k.
- Rendimiento en GSM8K limitado: 34,57 % en test con Coconut, por debajo del 43,14 % del modelo CoT etapa 0, lo que refleja que el razonamiento latente no supera aquí al chain-of-thought textual.
- Modelo de investigación sobre un backbone pequeño (GPT-2), con capacidad general muy inferior a la de LLM actuales; no apto para tareas abiertas de propósito general.
- Solo soporta inglés; sin capacidades multilingües documentadas.
- Riesgo de alucinación y de errores aritméticos: no se documentan mecanismos de verificación ni de mitigación.
- Sin datos publicados sobre sesgos; se desconoce el comportamiento ético y de sesgo del modelo.
- La hoja `coconut/` no se carga con `from_pretrained`: requiere la clase `Coconut` del repositorio del proyecto y el uso de `torch.load` sobre `pytorch_model.bin`, lo que complica la integración en pipelines estándar.
- No se documenta soporte para tool calling, agentes, visión ni audio.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita su uso en despliegues orientados a eficiencia.
- Licencia MIT: permite uso comercial, pero al ser un modelo experimental de investigación conviene validar su comportamiento antes de cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UdeSA/coconut-0.2B-gsm8k-aug
- Paper de Coconut (Hao et al., 2024): https://arxiv.org/abs/2412.06769
- Modelo relacionado (ALST-0.2B-gsm8k-aug): https://huggingface.co/UdeSA/ALST-0.2B-gsm8k-aug
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset GSM8k-Aug: no disponible (enlace no proporcionado en la información)
- Repositorio del proyecto (`src/coconut/`): no disponible (enlace no proporcionado en la información, aunque la model card lo referencia)
