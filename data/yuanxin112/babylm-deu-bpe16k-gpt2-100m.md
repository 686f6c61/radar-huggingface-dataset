# yuanxin112/babylm-deu-bpe16k-gpt2-100m

## Resumen

El modelo `yuanxin112/babylm-deu-bpe16k-gpt2-100m` es un GPT-2 pequeño entrenado desde cero para alemán por el usuario yuanxin112, dentro del ecosistema del BabyLM Challenge (pretraining con presupuesto reducido de datos, orientado a eficiencia de muestra). Se trata de una reproducción fiel de la receta de `BabyLM-community/deu-baseline-small` con una única desviación: el vocabulario pasa de 8192 a 16384 tokens mediante un BPE a nivel de byte entrenado localmente. Con 21.261.312 parámetros reales (frente a los 17,1M del baseline oficial), la diferencia de tamaño se explica íntegramente por la tabla de embeddings.

Arquitectónicamente es un transformer decoder-only clásico tipo GPT-2 (`GPT2LMHeadModel`) de 4 capas, 8 cabezas de atención, dimensión de embedding 512 y contexto de 512 tokens. No incorpora mecanismos modernos como MoE, atención lineal ni decodificación especulativa: su interés no es el rendimiento absoluto, sino servir como baseline reproducible y controlado para estudiar efectos de tokenización, fertilidad léxica y tamaño de vocabulario en corpus de ~108 millones de palabras en alemán.

Su relevancia es fundamentalmente de investigación: el BabyLM Challenge celebra su cuarta edición en EMNLP 2026 y este tipo de checkpoints pequeños permiten hacer ablaciones baratas y comparaciones controladas. No es un modelo pensado para producción, sino para experimentación académica y como punto de referencia en estudios de eficiencia de datos y de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT2LMHeadModel (transformer decoder-only, denso) |
| Parametros totales | 21.261.312 |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 512 tokens (n_positions = n_ctx = 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; sin versiones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | aleman (de) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Detalles adicionales de configuracion: n_layer 4, n_head 8, n_embd 512, n_inner 2048, activacion gelu, dropouts de atencion/embedding/residual 0.1, initializer_range 0.02, layer norm eps 1e-5, vocab_size 16384. Tokenizer byte-level BPE con especiales `[PAD]=0`, `[UNK]=1`, `[BOS]=2`, `[EOS]=3`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con atencion causal completa, sin innovaciones arquitectonicas: 4 capas, 8 cabezas, embedding de 512 dimensiones y capa interna de 2048. Usa activacion GELU y dropout 0.1 en atencion, embeddings y residual. Todo esta implementado mediante `GPT2LMHeadModel` de la libreria `transformers`. La unica diferencia respecto al baseline oficial es la tabla de embeddings, que crece de 8192 a 16384 entradas (de ahi los 21,3M frente a 17,1M de parametros).

El entrenamiento reproduce campo por campo los hiperparametros del baseline oficial: learning rate 1e-4 con decaimiento lineal y sin warmup, 5 epocas, batch de entrenamiento 64, batch de evaluacion 8, semilla 42, optimizador AdamW (betas 0.9 y 0.999, eps 1e-8), weight decay 0, precision fp32 y block size 512. La receta reporta 4093 pasos por epoca (frente a 4944 del baseline con vocab 8192), diferencia atribuida a la menor fertilidad del vocabulario mayor. Los datos provienen de una reconstruccion local del corpus German BabyLM (`babylm_deu.txt`, ~108M palabras con reparto de generos alineado EN/DE), no de la descarga oficial del hub. Se reservo un 1% para evaluacion, con un `eval_loss` final de 3,56. No se menciona uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en aleman, con `do_sample=False` en el ejemplo de uso de la model card (decodificacion greedy).
- Modelado de lenguaje causal puro: la tarea para la que fue entrenado es prediccion del siguiente token.
- Tokenizacion byte-level BPE propia con vocabulario de 16384 tokens, lo que permite estudiar fertilidad y cobertura lexica frente a vocabularios menores.
- Capacidad multilingue limitada: solo aleman; no hay evidencia de transferencia a otros idiomas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso explicito.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- No es un modelo instruido: no ha pasado por fine-tuning de instrucciones ni alineacion.

## Casos de uso

- Baseline reproducible para ablaciones de vocabulario: al mantener todos los hiperparametros del baseline oficial y cambiar unicamente el tamano del vocabulario, permite aislar el efecto de 8192 frente a 16384 tokens sobre la perdida por token y la calidad generativa.
- Experimentos de fertilidad y tokenizacion en aleman: util para medir cuantas piezas BPE consume un texto aleman y como eso afecta a la perdida por token frente a la perdida por palabra.
- Ensenanza e investigacion en eficiencia de datos: su tamano (~0,1 GB) permite entrenarlo y evaluarlo en una sola GPU de consumo en tiempos cortos, lo que lo hace apto para practicas de laboratorio sobre pretraining con presupuesto reducido.
- Pruebas de infraestructura y pipelines: sirve como modelo de juguete para validar despliegues con `transformers`, text-generation-inference o endpoints compatibles antes de escalar a modelos mayores.
- Generacion de texto aleman en entornos con recursos minimos: puede ejecutarse en CPU o en GPUs integradas para prototipos de autocompletado o demos, asumiendo la calidad limitada de un modelo de 21M de parametros.
- Analisis de corpus y control de calidad de datos: la perdida de evaluacion y las generaciones pueden usarse como sonda cualitativa del dominio cubierto por una reconstruccion concreta del corpus BabyLM aleman.
- Punto de comparacion en estudios de eficiencia de muestra: referencia para medir si tecnicas como curriculum, destilacion o mezclas de datos mejoran sobre una linea base estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato numerico reportado es la perdida de evaluacion.

| Metrica | Valor | Notas |
|---|---|---|
| eval_loss (1% held out) | 3,56 | Corpus German BabyLM reconstruido localmente, vocab 16384 |
| eval_loss baseline oficial deu-baseline-small | 3,0813 | Vocab 8192; no es comparable directamente segun el propio autor |

El autor advierte explicitamente que la comparacion 3,56 frente a 3,0813 no es equivalente: un vocabulario menor produce menor entropia por token, y ademas cambian la reconstruccion del corpus y el split de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~85 MB de pesos mas activaciones y cache KV para 512 tokens); en fp16 rondaria los 43 MB de pesos.
- GPU recomendadas: cualquiera; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` de forma nativa; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y con Inference Endpoints. No hay versiones GGUF ni Ollama publicadas, aunque al ser un GPT-2 estandar la conversion a GGUF para llama.cpp seria viable.
- Latencia y throughput estimados: no disponible. Por el tamano del modelo, se espera latencia de pocos milisegundos por token en GPU moderna y muy superior en CPU, pero no hay cifras publicadas.
- Entrenamiento: fp32 con block 512 y 4093 pasos por epoca, factible en una unica GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocab | eval_loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yuanxin112/babylm-deu-bpe16k-gpt2-100m | 21,3M | 512 | 16384 | 3,56 (split propio) | no disponible | HuggingFace |
| BabyLM-community/deu-baseline-small | 17,1M | 512 | 8192 | 3,0813 | no disponible en la informacion | HuggingFace |
| Repo hermano `-100m` del mismo autor | ~21,3M (misma receta) | 512 | 16384 | no disponible | no disponible | HuggingFace |

El contraste principal es con el baseline oficial de la comunidad BabyLM, del que este modelo es una reproduccion casi exacta salvo el vocabulario. La comparacion directa de perdidas no es valida por las diferencias de tokenizador y de split de evaluacion. No se dispone de datos para comparar con alternativas como modelos alemanes de mayor tamano o con otros participantes del track multilingue del BabyLM 2026.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ningun analisis de sesgo, toxicidad o representacion.
- Riesgo de alucinacion: alto en terminos relativos; es un modelo de 21M de parametros sin alineacion, por lo que puede generar texto gramaticalmente plausible pero factualmente incorrecto o incoherente.
- Limitacion de contexto severa: 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Limitacion idiomatica: entrenado exclusivamente en aleman; no se debe esperar un rendimiento util en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Caveat de evaluacion: el `eval_loss` de 3,56 se obtuvo sobre una reconstruccion local del corpus y un split propio, no sobre la descarga oficial, lo que dificulta la reproducibilidad exacta.
- Caveat de tokenizer: los especiales difieren del baseline oficial (`[PAD]=0`, `[UNK]=1`, `[BOS]=2`, `[EOS]=3`), que en el oficial arrastra valores por defecto de GPT-2 (50256) fuera de su vocabulario; hay que revisar la configuracion al integrarlo.
- Advertencia de produccion: no es un modelo apto para uso productivo en generacion de texto, codigo, atencion al cliente ni tareas de razonamiento; su proposito es la investigacion y la comparacion controlada.
- Sin versiones cuantizadas publicadas: no hay GGUF, AWQ ni GPTQ oficiales, lo que anade trabajo si se quiere desplegar en llama.cpp u Ollama.
- Sin datos de benchmarks estandar: no se puede afirmar su calidad relativa en tareas downstream mas alla de la perdida de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuanxin112/babylm-deu-bpe16k-gpt2-100m
- Baseline oficial de referencia: https://huggingface.co/BabyLM-community/deu-baseline-small
- Organizacion BabyLM en HuggingFace: https://huggingface.co/babylm
- Modelos de la organizacion BabyLM: https://huggingface.co/babylm/models
- Sitio oficial del BabyLM Challenge: https://babylm.github.io/
- BabyLM 4 en EMNLP 2026 (calendario y archivo de ediciones previas): https://babylm.github.io/
- Repositorio de ejemplo del track multilingue BabyLM 2026: https://github.com/to1246zh-s-star/babylm-2026-multilingual
