# stunmuffin/TinyTurk-Wiki-B-Sweet

## Resumen

TinyTurk-Wiki-B-Sweet es un modelo de lenguaje causal en turco de tamano muy reducido (2.761.344 parametros) desarrollado por el proyecto TinyTurk y publicado bajo el identificador stunmuffin/TinyTurk-Wiki-B-Sweet. Se trata de un artefacto de investigacion, no de un producto, concebido para estudiar decisiones de diseno arquitectonico a escala "tiny" en turco. Forma parte de una ablacion con tres variantes hermanas (A-Tiny, B-Sweet y C-Max) que exploran el equilibrio entre profundidad, anchura y ratio de la red feed-forward.

El modelo es un transformer decoder-only estilo GPT con Pre-LN, solo 2 capas, dimension de modelo 384, 8 cabezas de atencion y una ventana de contexto de 384 tokens. Usa codificacion posicional RoPE, normalizacion RMSNorm, activacion GELU y weight tying entre el embedding de entrada y la proyeccion de salida. El tokenizador es un BPE SentencePiece propio de solo 1024 tokens, entrenado especificamente para turco.

Su relevancia es principalmente metodologica: la familia TinyTurk sostiene tres hipotesis que se apartan del diseno transformer estandar, en concreto que a presupuesto constante las redes poco profundas superan a las profundas, que ratios FFN comprimidos (1,3x-2,2x d_model) son preferibles al 4x habitual y que la anchura escala de forma monotona pero con rendimientos decrecientes (PPL proporcional a N^-0,23). Se entrena desde cero sobre un subconjunto de 49.000 articulos de Wikipedia en turco y alcanza una perplejidad de validacion de 10,77 en dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (Pre-LN) |
| Parametros totales | 2.761.344 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo checkpoint PyTorch en precision completa) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); tokenizador SentencePiece (`tokenizer_wiki_bpe_1024.model`) |
| Capas | 2 |
| Dimension del modelo | 384 |
| Cabezas de atencion | 8 |
| Dimension FFN | 512 (principal) + 256 (micro) |
| Vocabulario | 1024 BPE (SentencePiece), tasa de UNK 0,078 % |
| Codificacion posicional | RoPE (theta = 10000) |
| Normalizacion | RMSNorm (eps = 1e-6) |
| Activacion | GELU |
| Dropout | 0,10 |
| Weight tying | Si |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con Pre-LayerNorm. Consta de 2 capas, dimension de modelo 384, 8 cabezas de atencion y una FFN con dos ramas (512 y 256 neuronas, respectivamente) en lugar del multiplicador 4x habitual, lo que da un ratio comprimido de aproximadamente 1,3x-2x respecto a d_model. Emplea codificacion posicional rotatoria RoPE con theta 10000, normalizacion RMSNorm con eps 1e-6, activacion GELU, dropout 0,10 y weight tying entre el embedding de tokens y la cabeza de lenguaje. El vocabulario es un BPE SentencePiece de 1024 piezas entrenado a medida, con una tasa de tokens desconocidos del 0,078 %.

El entrenamiento se realizo integramente desde cero sobre un subconjunto de 49.000 articulos de Wikipedia en turco (dataset barandinho/wikipedia_tr). Se uso el optimizador AdamW en variante fused, learning rate 3e-4 con schedule coseno y 5 % de warmup, weight decay 0,01, gradient clipping 1,0, batch size 16 y 30 epocas con semilla 42. No hay datos de RLHF, DPO ni ajuste por instrucciones en la informacion disponible: es un modelo base crudo. La innovacion tecnica principal del trabajo no es un mecanismo nuevo, sino el hallazgo empirico de que, en este regimen de escala, la poca profundidad rinde mejor que la profundidad y que las FFN comprimidas resultan mas eficientes.

## Capacidades

- Generacion de texto causal en turco, con continuacion coherente de prompts al estilo de articulos enciclopedicos.
- Modelado de lenguaje de dominio Wikipedia: gramatica y vocabulario turcos propios del registro enciclopedico.
- Tokenizacion turca especifica mediante BPE de 1024 piezas, con baja tasa de tokens desconocidos (0,078 %) dentro del dominio de entrenamiento.
- Generacion con muestreo configurable (`temperature`, `top_k`), segun el ejemplo de uso de la model card.
- No dispone de tool calling ni function calling: no se menciona soporte en la informacion disponible.
- No dispone de capacidades de agente ni de razonamiento multi-paso explicitas.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No dispone de capacidades multilingues mas alla del turco.
- No esta ajustado por instrucciones, por lo que no sigue ordenes ni mantiene formato conversacional.

## Casos de uso

- Investigacion academica sobre escalado en lenguas de bajos recursos: el modelo sirve como punto de datos controlado para reproducir el hallazgo de que 2 capas superan a 3, 4 y 6 con el mismo presupuesto, util en estudios de leyes de escala.
- Ablacion de arquitectura en turco: al ser una de tres variantes hermanas (A, B y C), permite comparar directamente el efecto del tamano y la configuracion estructural sobre la perplejidad y sobre diagnosticos estructurales fuera de dominio.
- Prototipado de tokenizadores turcos de vocabulario minimo: el BPE de 1024 piezas con UNK del 0,078 % sobre Wikipedia sirve para evaluar la viabilidad de vocabularios ultrapequenos en turco antes de escalar a modelos mayores.
- Generacion de texto sintetico de dominio enciclopedico: puede producir borradores de frases o parrafos estilo Wikipedia en turco para tareas de aumento de datos, siempre con revision humana.
- Educacion y demostraciones docentes: su tamano (2,76 M de parametros) permite ejecutarlo en un portatil sin GPU y explicar de forma tangible el funcionamiento interno de un transformer causal.
- Pruebas de integracion de pipelines de inferencia: sirve como modelo de juguete para validar scripts de carga, tokenizacion y decodificacion propios antes de pasar a modelos de produccion.
- Experimentos de decodificacion (temperatura, top-k, muestreo): su bajo coste computacional permite barrer hiperparametros de generacion de forma masiva en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de modelado de lenguaje en dominio:

| Metrica | Valor | Conjunto |
|---|---:|---|
| Validation loss | 2,3767 | Wikipedia turca, validacion (945 muestras) |
| Perplexity | 10,77 | Wikipedia turca, validacion (945 muestras) |
| Bits-per-char | 1,4653 | Wikipedia turca, validacion (945 muestras) |

Para los diagnosticos estructurales fuera de dominio (turco) la model card remite al paper, sin cifras concretas mas alla de la observacion de que el rendimiento maximo se alcanza en la configuracion de 2,76 M de parametros (variante B) y se degrada a escalas mayores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 MB en FP32 y unos 6 MB en FP16, calculado a partir de los 2,76 M de parametros. Cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema; cualquier GPU consumer (GTX, RTX, Apple Silicon) es mas que suficiente.
- Cabe en GPU de consumo: si, en todas, incluidas las mas modestas y las integradas.
- Opciones de despliegue: la model card solo documenta carga directa con PyTorch y SentencePiece mediante `torch.load` y `model.generate`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponible. La libreria declarada es pytorch y el autor no publica cifras de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| TinyTurk-Wiki-B-Sweet | 2.761.344 | 384 tokens | Turco | MIT | Variante equilibrada; mejor diagnostico estructural de la familia |
| TinyTurk-Wiki-A-Tiny | no disponible | no disponible | Turco | no disponible | Variante mas pequena de la misma ablacion |
| TinyTurk-Wiki-C-Max | no disponible | no disponible | Turco | no disponible | Variante mayor de la misma ablacion; el rendimiento estructural se degrada |
| TinyTurk-v2.7d-bigstories | 1.120.000 | 128 tokens | Turco | no disponible | Entrenado sobre 49.000 historias del dataset Turkish TinyStories; mantiene fluidez local pero no coherencia narrativa larga |

No se dispone de comparaciones con modelos de proposito general de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio limitado a Wikipedia: el rendimiento en narrativa, dialogo o codigo se degrada de forma notable segun la propia model card.
- Vocabulario muy reducido (1024 BPE): las palabras poco frecuentes pueden fragmentarse, lo que perjudica la fluidez fuera del vocabulario de entrenamiento.
- Contexto de solo 384 tokens: no es adecuado para documentos largos ni para conversaciones multi-turno extensas.
- Modelo base crudo sin ajuste por instrucciones: no sigue ordenes ni responde a prompts conversacionales.
- Sin alineamiento de seguridad: no se ha aplicado RLHF, DPO ni filtros de contenido, por lo que puede generar texto inapropiado o sesgado si se le induce.
- Riesgo de alucinacion: como cualquier LM entrenado solo para predecir el siguiente token, puede producir afirmaciones factualmente incorrectas con apariencia verosimil, especialmente fuera del dominio enciclopedico turco.
- Sesgos potenciales derivados del corpus de Wikipedia en turco, que no es representativo de toda la poblacion ni de todos los registros del idioma.
- El autor declara explicitamente que se trata de un artefacto de investigacion experimental y no de un producto.
- La licencia MIT permite uso comercial, pero el propio alcance tecnico del modelo (tamano, contexto y ausencia de ajuste) hace inviable su uso en produccion real.
- Fecha de creacion y actualizacion declaradas en 2026; el repositorio presenta 0 descargas y 0 likes en la informacion consultada, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stunmuffin/TinyTurk-Wiki-B-Sweet
- Modelo companero TinyTurk-Wiki-A-Tiny: https://huggingface.co/stunmuffin/TinyTurk-Wiki-A-Tiny
- Modelo companero TinyTurk-Wiki-C-Max: https://huggingface.co/stunmuffin/TinyTurk-Wiki-C-Max
- Modelo relacionado TinyTurk-v2.7d-bigstories: https://huggingface.co/stunmuffin/TinyTurk-v2.7d-bigstories
- Dataset de entrenamiento: https://huggingface.co/datasets/barandinho/wikipedia_tr
- Demo en Hugging Face Spaces (Tiny Turk AI Whisperer): https://huggingface.co/spaces/strange1122/tiny-turk-ai-whisperer
- Paper de la ablacion TinyTurk: no disponible (la model card lo menciona pero no proporciona enlace)
