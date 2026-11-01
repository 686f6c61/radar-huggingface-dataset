# tejgokani/noirwrit-base

## Resumen

noirwrit-base es un modelo de lenguaje de 97,5 millones de parámetros entrenado desde cero por el desarrollador independiente tejgokani. No es un ajuste fino de un modelo existente: es un transformer decoder-only escrito a mano con un diseño compatible con Llama (12 capas, d_model 768, 12 cabezas, SwiGLU, RMSNorm, RoPE y embeddings atados). Su propósito es muy concreto: generar prosa de ficción negra y detectivesca con la voz y la cadencia de la literatura pulp y criminal publicada antes de 1930. Es el motor detrás de Noirwrit, una aplicación de escritorio offline que planifica y redacta novelas capítulo a capítulo en un portátil.

El modelo se entrenó sobre 1.828 libros de dominio público de Project Gutenberg (todos publicados en 1930 o antes), con un total de 719 millones de tokens vistos en 4 épocas sobre un corpus de 180 millones de tokens. El entrenamiento completo costó 0 dólares y se ejecutó en una única Tesla T4 del tier gratuito de Kaggle en 9,6 horas. La relevancia de este modelo no está en su rendimiento absoluto, sino en su enfoque: demuestra que un modelo pequeño, entrenado desde cero con un currículo de datos cuidadosamente diseñado y desplegado en llama.cpp, puede sostener una tarea creativa especializada con requisitos de hardware mínimos (0,26 GB de RAM en un MacBook Air M3).

La ventana de contexto es de solo 2.048 tokens y el tokenizador es un BPE a nivel de byte propio de 16.384 tokens, entrenado sobre el mismo corpus. La licencia es MIT tanto para el código como para los pesos, y el texto de entrenamiento es de dominio público en Estados Unidos. Está disponible en formato GGUF (Q8_0 y Q4_K_M) para llama.cpp y como state dict de PyTorch en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only desde cero, layout compatible con Llama: 12 capas, d_model 768, 12 cabezas, SwiGLU (2048), RMSNorm, RoPE (theta 10000), embeddings atados |
| Parametros totales | 97,5 M (110.119.680 según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 (112 MB), Q4_K_M (66 MB), fp16 PyTorch (210 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (código y pesos); texto de entrenamiento de dominio público en EE. UU. |
| Formato de pesos | GGUF (llama.cpp), PyTorch state dict fp16 (.pt) |
| Tokenizador | BPE a nivel de byte propio, 16.384 tokens, entrenado sobre el mismo corpus |
| Datos de entrenamiento | 1.828 libros de dominio público de Project Gutenberg (publicados en 1930 o antes) |
| Tokens de entrenamiento | 719 M (4 épocas sobre 180 M tokens) |
| Hardware de entrenamiento | Una Tesla T4 (Kaggle free tier), fp16 con gradient scaler, torch.compile |
| Tiempo de entrenamiento | 9,6 horas, 10.973 pasos de 65.536 tokens, mediana de 21.080 tokens/s |
| Coste de entrenamiento | 0 USD |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only implementado desde cero con un layout deliberadamente compatible con Llama, lo que facilita su conversión a GGUF y su ejecución en llama.cpp. Consta de 12 capas con dimensión de modelo 768, 12 cabezas de atención, FFN SwiGLU con dimensión intermedia 2048, normalización RMSNorm, embeddings rotatorios RoPE con theta 10000 y embeddings de entrada/salida atados. El tokenizador es un BPE a nivel de byte propio de 16.384 tokens entrenado sobre el mismo corpus, lo que evita dependencias de tokenizadores externos y ajusta el vocabulario al registro literario objetivo.

El entrenamiento siguió un currículo de tres etapas. La primera (15% de los pasos, learning rate 6e-4 con decaimiento coseno) cubrió ficción general pre-1931: aventuras, gótico y otros géneros, con 40 M tokens y una pérdida de validación de 3,79. La segunda (75% de los pasos, mismo learning rate) se centró en crimen y detectivesca con autores como Doyle, las primeras novelas de Christie, Chesterton, Collins, Green y Rinehart, con 136 M tokens y pérdida de 3,14. La tercera (10% de los pasos, learning rate 0,3x con parada temprana) afinó la voz noir con Hammett, Burnett, Whitfield, Packard y pulp datado, con 4 M tokens y pérdida de 2,55. La validación corresponde al último 2% de cada libro y las pérdidas se miden sobre el conjunto de validación de cada etapa, por lo que solo son comparables dentro de una misma etapa. Los pesos liberados son el mejor checkpoint de la etapa noir (pérdida de validación 2,55, perplejidad aproximada de 12,8). Como referencia, el modelo de prueba de 5 M parámetros alcanzó 5,31 en el conjunto de crimen.

## Capacidades

- Generación de texto en inglés con registro literario de principios del siglo XX: prosa detectivesca, pulp y noir.
- Diálogo con atribución natural y descripción de escenas con la cadencia de la novela criminal de la era Gutenberg.
- Coherencia a nivel de frase y, habitualmente, de párrafo; mantiene la gramática y el estilo dentro de una página.
- Modelo base (no instruido): no sigue instrucciones ni responde a preguntas; se le debe dar el inicio de un pasaje para que continúe.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.
- No se han documentado capacidades de código ni matemáticas.

## Casos de uso

- **Escritura asistida de novela negra offline**: integrado en la aplicación Noirwrit, el modelo redacta capítulos de 3.000 palabras en unos 23 segundos en un MacBook Air M3, con planificador, biblia de historia, memoria y comprobaciones de consistencia que suplen la falta de razonamiento del modelo.
- **Generación de prosa de época para prototipos**: útil para producir texto de ambientación 1880-1930 en demos, juegos narrativos o experimentos de estilo, gracias a su voz pulp entrenada específicamente.
- **Continuación de pasajes en llama.cpp**: con `llama-completion` y un prompt de arranque de escena, sirve para generar borradores de diálogo y descripción con temperatura 0,75, min-p 0,05 y repeat penalty 1,12, como documenta el autor.
- **Investigación sobre currículos de datos**: su entrenamiento en tres etapas con conjuntos de validación separados por etapa es un caso de estudio reproducible (scripts `noirwrit.corpus.build` y `noirwrit.tokenizer.train_tokenizer`) para estudiar cómo el currículo moldea el estilo en modelos pequeños.
- **Despliegue en hardware mínimo**: con 0,21-0,26 GB de RAM en Q4_K_M o Q8_0, es adecuado para entornos sin GPU, Raspberry Pi o portátiles modestos donde no cabe ningún modelo de miles de millones de parámetros.
- **Generación de texto de dominio público para datasets sintéticos**: puede producir texto con estilo de época para aumentar corpus de entrenamiento o pruebas de pipelines de NLP, siempre con revisión humana por las limitaciones de coherencia.
- **Educación y experimentación desde cero**: al ser un modelo pequeño, MIT y con código de entrenamiento reproducible en Kaggle gratuito, sirve para enseñar el ciclo completo de entrenamiento de un LLM (tokenizador, corpus, currículo, cuantización y despliegue).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdidas de validación por etapa y métricas de velocidad.

| Metrica | Valor |
|---|---|
| Pérdida de validación etapa 1 (ficción general) | 3,79 |
| Pérdida de validación etapa 2 (crimen y detectivesca) | 3,14 |
| Pérdida de validación etapa 3 (voz noir) | 2,55 |
| Perplejidad (checkpoint liberado) | ~12,8 |
| Pérdida del modelo de prueba de 5 M en crimen | 5,31 (referencia) |

| Runtime (MacBook Air M3, 16 GB) | Generación | RAM pico |
|---|---|---|
| llama.cpp Q8_0 (Metal) | 229 tokens/s | 0,26 GB |
| llama.cpp Q4_K_M | 298 tokens/s | 0,21 GB |
| PyTorch CPU int8 (fallback) | 57 tokens/s | no disponible |

Un capítulo de 3.000 palabras tarda unos 23 segundos y el error de estimación de tiempo restante es inferior al 6% según `docs/BENCH.md`.

## Requisitos de hardware

- **VRAM/RAM para inferencia**: 0,21 GB en Q4_K_M y 0,26 GB en Q8_0; 210 MB para el state dict fp16 en PyTorch.
- **GPU recomendadas**: no requiere GPU. Funciona en CPU y en GPU integrada (Metal en Apple Silicon). Cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente, aunque no aporta ventaja frente a Metal en este tamaño.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer con al menos 1 GB de memoria; también en Raspberry Pi y portátiles de gama baja.
- **Opciones de despliegue**: llama.cpp (recomendado, con `llama-completion`), Ollama (a través de GGUF), y PyTorch con el código propio `noirwrit.model.gpt` para el state dict fp16. vLLM y TGI no están documentados para este modelo.
- **Latencia y throughput**: 229 tokens/s en Q8_0 y 298 tokens/s en Q4_K_M en un MacBook Air M3; 57 tokens/s en PyTorch CPU int8. Mediana de 21.080 tokens/s durante el entrenamiento en una T4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La siguiente tabla compara solo características estructurales con modelos pequeños de propósito general ampliamente conocidos; los datos de los competidores son de conocimiento público general y no provienen de la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| noirwrit-base | 97,5 M | 2.048 | MIT | Ficción noir/detectivesca, base, desde cero |
| GPT-2 small | 124 M | 1.024 | MIT | Texto general en inglés, base |
| TinyLlama 1.1B | 1.100 M | 2.048 | Apache 2.0 | Texto general, chat |
| Qwen2.5-0.5B | 500 M | 32.768 | Apache 2.0 | Texto general multilingüe, instruct |

La comparación de rendimiento real no está disponible: no hay benchmarks publicados de noirwrit-base frente a estos modelos, y las tareas objetivo (prosa noir de época) no coinciden con los benchmarks estándar de los modelos de propósito general.

## Limitaciones y advertencias

- **Coherencia limitada**: con 98 M de parámetros mantiene la frase y normalmente el párrafo, pero pierde detalles a lo largo de una página; un personaje muerto puede volver a hablar un párrafo después o cambiar el color del pelo de un personaje. El planificador y las comprobaciones de consistencia de Noirwrit mitigan el problema, pero no hacen razonar al modelo.
- **Modelo base, no instruido**: no sigue instrucciones ni responde a preguntas; hay que darle el inicio de un pasaje. Usarlo como chat produce resultados deficientes.
- **Registro arcaico**: al entrenarse con datos de dominio público, reproduce la voz clásica de 1880-1930, no el ritmo del thriller moderno ni el idioma contemporáneo; aparecen grafías arcaicas como "clew".
- **Sesgos de época**: reproduce actitudes y estereotipos de la era de sus fuentes; debe revisarse el contenido generado con ese contexto.
- **Ecos de personajes famosos**: a veces repite personajes célebres de los libros de entrenamiento; la comprobación de consistencia de Noirwrit sustituye sus nombres por los del reparto propio.
- **Contexto corto**: 2.048 tokens limitan la cantidad de texto que puede tener en cuenta a la vez.
- **Solo inglés**: no hay soporte multilingüe.
- **Licencia**: MIT para código y pesos, permisiva para uso comercial; el texto de entrenamiento es de dominio público en EE. UU., pero la situación legal puede variar en otras jurisdicciones.
- **Sin benchmarks estándar**: no hay datos de MMLU, HumanEval ni GSM8K que permitan evaluar su calidad fuera del dominio literario.
- **"Aprender" en la app**: cuando Noirwrit "aprende", recupera historias anteriores; los pesos no cambian en el dispositivo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/tejgokani/noirwrit-base)
- [Repositorio de la aplicación Noirwrit](https://github.com/tejgokani/noirwrit)
- [Documentación de entrenamiento online](https://github.com/tejgokani/noirwrit/blob/main/docs/ONLINE_TRAINING.md)
- [Benchmarks de velocidad (docs/BENCH.md)](https://github.com/tejgokani/noirwrit/blob/main/docs/BENCH.md)
- [Fuentes del corpus (data/SOURCES.md)](https://github.com/tejgokani/noirwrit/blob/main/data/SOURCES.md)
- [Muestras de generación (docs/samples/)](https://github.com/tejgokani/noirwrit/tree/main/docs/samples)
