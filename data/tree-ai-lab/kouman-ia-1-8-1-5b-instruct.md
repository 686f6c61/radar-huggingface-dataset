# Tree-AI-lab/kouman-IA-1.8-1.5B-instruct

## Resumen

Kouman AI 1.8 es un modelo de lenguaje conversacional desarrollado por Tree AI Lab (Costa de Marfil) orientado a las lenguas nacionales de ese país, concretamente baoulé (`bci`) y dioula (`dyu`), junto con francés (`fr`) e inglés (`en`). El modelo parte de una base de aproximadamente 1.500 millones de parámetros y se somete a un preentrenamiento continuo (CPT) sobre un corpus cuadrilingüe, seguido de un ajuste supervisado ligero estilo LIMA (~4.950 ejemplos) optimizado para diálogo natural y traducción directa.

Su relevancia radica en cubrir un hueco poco atendido: los modelos generalistas de 1B-1.5B rinden muy mal en lenguas africanas de bajos recursos. Kouman AI 1.8 reporta mejoras de entre 2x y 4,6x en chrF++ de traducción baoulé/dioula frente a Llama 3.2 1B-IT y Qwen 2.5 1.5B-IT, además de una robustez del 90,6% ante entradas de teclado real (minúsculas, sin acentos ni puntuación).

El checkpoint publicado en Hugging Face declara 2.614.341.888 parámetros reales en safetensors (a pesar del sufijo "1.5B" del nombre), arquitectura personalizada `kouman` (`KoumanForCausalLM`) y requiere `trust_remote_code=True`. Está pensado para desplegarse en GPU de consumo como una T4 de Google Colab en `bfloat16`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con `model_type` personalizado `kouman` (`KoumanForCausalLM`, `auto_map` incluido) |
| Parámetros totales | 2.614.341.888 (2.614 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en `bfloat16`; el autor no documenta GGUF/AWQ/GPTQ) |
| Idiomas soportados | Baoulé (`bci`), dioula (`dyu`), francés (`fr`), inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`bfloat16`, `use_cache=true`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal autorregresivo con implementación propia (`configuration_kouman.py` y `modeling_kouman.py`, cargables vía `auto_map` con `trust_remote_code=True`). No se documenta si incorpora innovaciones como atención lineal, decodificación especulativa o arquitecturas híbridas SSM; la información disponible solo confirma el tipo de arquitectura y el número de parámetros.

El pipeline de entrenamiento consta de dos fases: (1) preentrenamiento continuo (CPT) sobre un corpus cuadrilingüe con baoulé, dioula, francés e inglés, y (2) un ajuste supervisado ligero estilo LIMA con aproximadamente 4.950 ejemplos "limpios, deduplicados, 0 Nouchi", con descongelación selectiva de los tokens de turno `<start_of_turn>` y `<end_of_turn>`. La mejor `val_loss` de la fase SFT reportada es 1,0974. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en baoulé, dioula, francés e inglés.
- Traducción directa bidireccional entre francés/inglés y baoulé/dioula (FR→BCI, BCI→FR, FR→DYU, DYU→FR, EN→DYU).
- Robustez ante "teclado real": interpreta prompts en minúsculas, sin acentos ni puntuación (por ejemplo, `comment on dit je vais a paris en baoule`).
- Cierre natural de turno: el modelo emite `<end_of_turn>` de forma limpia en el 95,0% de los casos evaluados.
- Plantilla de chat integrada mediante `tokenizer.apply_chat_template(...)`.
- Razonamiento básico y respuesta a preguntas de opción múltiple (evaluado en MMLU-Baoulé, MMLU-Francés y ARC-Easy).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Traducción asistida francés-baoulé y francés-dioula en contextos administrativos o educativos: el modelo traduce frases directas con chrF++ de 39,49 (FR→BCI) y 18,31 (FR→DYU), muy por encima de modelos generalistas de su tamaño, lo que lo hace útil como primer borrador para traductores humanos.
- Asistentes conversacionales para usuarios que escriben sin acentos ni puntuación: su robustez del 90,6% ante teclado real permite desplegarlo en interfaces de chat simples (SMS, WhatsApp, formularios web) sin normalización previa del texto.
- Preservación y aprendizaje de lenguas nacionales: generación de ejemplos de frases y traducciones para materiales didácticos de baoulé y dioula, con la cautela de validación por hablantes nativos.
- Atención al cliente bilingüe de bajo coste: al caber en una T4 en `bfloat16` y generar a 35,5 tok/s, puede alojarse en infraestructura modesta para responder consultas en francés y lenguas locales.
- Prototipado rápido de aplicaciones lingüísticas en Costa de Marfil: su formato de chat integrado y su licencia (no disponible, ver limitaciones) permiten experimentar con `transformers` en pocas líneas de código.
- Investigación en NLP de bajos recursos: sirve como línea base cuadrilingüe para comparar técnicas de CPT y SFT ligero en lenguas africanas, dado que el autor publica métricas reproducibles (MMLU-Baoulé, FLORES-200 Dioula, suite propia).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluación sobre el mismo GPU y los mismos prompts):

| Modelo | Params (M) | MMLU-Baoulé (%) | MMLU-FR (%) | ARC-Easy (%) | FLORES FR→DYU (chrF++) | FLORES DYU→FR (chrF++) | FLORES EN→DYU (chrF++) | OOD FR→BCI (chrF++) | OOD BCI→FR (chrF++) | Media trad. CI (chrF++) | Suite CI & teclado (%) | EOS natural (%) | Score África/CI | Score global | Velocidad (tok/s) |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Kouman AI 1.8 (Tree AI Lab) | 2614 | 26,00 | 30,00 | 64,00 | 18,31 | 18,34 | 20,01 | 39,49 | 33,81 | 25,99 | 90,6 | 95,0 | 47,53 | 47,32 | 35,5 |
| Llama 3.2 1B-IT | 1236 | 25,33 | 29,33 | 65,33 | 9,70 | 9,15 | 6,07 | 8,56 | 10,99 | 8,89 | 62,5 | 80,0 | 32,24 | 38,28 | 86,1 |
| Qwen 2.5 1.5B-IT | 1544 | 29,33 | 34,33 | 76,67 | 12,42 | 11,98 | 12,95 | 13,24 | 14,30 | 12,98 | 37,5 | 85,0 | 26,60 | 38,16 | 57,5 |

Nota: los benchmarks MMLU-Baoulé, MMLU-Francés y ARC-Easy usan 300 preguntas de opción múltiple evaluadas por log-probabilidad; FLORES-200 Dioula usa `devtest` con `sacrebleu` chrF++; el conjunto OOD es un shard nunca visto en entrenamiento. Los "Score África/CI" y "Score global" son métricas compuestas definidas por el autor, no estándares de la comunidad.

## Requisitos de hardware

- Inferencia en `bfloat16`: el checkpoint ocupa aproximadamente 5,3 GB en el repositorio, lo que corresponde a unos 5,2 GB de pesos; se necesita algo más de VRAM para el contexto y la caché KV.
- Cabe en GPU de consumo: el autor confirma funcionamiento fluido en una Google Colab T4 (16 GB) y en GPU AMD con ROCm, a 35,5 tok/s.
- GPU recomendadas: T4, RTX 3090, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM debería poder cargarlo en `bfloat16` o `float16`.
- Opciones de despliegue: al usar arquitectura personalizada (`trust_remote_code=True`), la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y requeriría verificación; la vía soportada explícitamente es `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`.
- Latencia y throughput: 35,5 tok/s reportados en T4; no se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Params (M) | Contexto | MMLU-Baoulé | Traducción CI (media chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Kouman AI 1.8 | 2614 | No disponible | 26,00 | 25,99 | No disponible | Hugging Face (`Tree-AI-lab`) |
| Llama 3.2 1B-IT | 1236 | No disponible en la información | 25,33 | 8,89 | Licencia Llama (no verificada en esta ficha) | Hugging Face (Meta) |
| Qwen 2.5 1.5B-IT | 1544 | No disponible en la información | 29,33 | 12,98 | No verificada en esta ficha | Hugging Face (Alibaba) |

Kouman AI 1.8 pierde en MMLU y ARC-Easy frente a Qwen 2.5 1.5B-IT (26,00 vs 29,33 y 64,00 vs 76,67) y es más lento (35,5 vs 57,5 tok/s), pero multiplica por 2-3 la calidad de traducción en lenguas de Costa de Marfil y supera ampliamente a ambos en robustez de teclado y cierre EOS.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un bloqueo potencial para producción.
- Arquitectura personalizada: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y limita la compatibilidad con ecosistemas estándar (vLLM, llama.cpp, TGI).
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: al ser un modelo de 2.614 M con SFT ligero (~4.950 ejemplos), es esperable una fiabilidad factual limitada, especialmente fuera de los dominios de traducción y diálogo.
- Cobertura lingüística estrecha: solo cuatro idiomas; el rendimiento en baoulé y dioula se mide con conjuntos pequeños (300 preguntas MMLU, `devtest` FLORES) y métricas compuestas definidas por el autor.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento y su composición no se detallan.
- Métricas no estándar: los "Score África/CI" y "Score global" son composites propios y no comparables con evaluaciones de terceros.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-IA-1.8-1.5B-instruct
- Repositorio de código (incluido en el repo del modelo): `configuration_kouman.py`, `modeling_kouman.py`
- Datos de benchmarks del autor: `assets/tableau_comparatif_kouman.csv` (dentro del repo)
- No se han encontrado papers, blogs, repositorios independientes ni demos adicionales en la información disponible.
